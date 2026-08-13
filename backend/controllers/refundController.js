/**
 * refundController.js
 *
 * `POST /refunds/issue` was the highest-impact hole in the application: it was
 * restricted to the `ngo` and `admin` roles and then never checked WHICH
 * organization the payment belonged to, so any organization could refund any
 * payment on any other organization's project. Ownership is now enforced by
 * owners.refundablePayment before this file runs, and the operation additionally
 * requires re-authentication because it moves money. [CSSECDV 2.2.2, 2.1.13]
 *
 * Two outright bugs are also fixed here:
 *   · `require("stripe")` inside an ES module — `require` is not defined, so
 *     every refund threw a ReferenceError;
 *   · `select: { amount: true }` on Payment, a column dropped by migration
 *     20260402_remove_payment_amount, which made Prisma reject the query.
 */

import Stripe from "stripe";

import prisma from "../prisma/client.js";
import { AppError, notFound } from "../errors/AppError.js";
import {
  assertRefundable,
  paymentTotal,
  refundIdempotencyKey,
} from "../security/businessRules.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new AppError("Refunds are unavailable right now.", 503, "PAYMENTS_UNAVAILABLE");
    }
    stripeClient = new Stripe(apiKey);
  }
  return stripeClient;
};

/** POST /refunds/issue */
export const issueRefund = async (req, res) => {
  // Loaded and ownership-checked by owners.refundablePayment.
  const payment = req.resource;
  const { reason = "contribution_declined" } = req.body;

  try {
    assertRefundable(payment);
  } catch (error) {
    await logSecurityEvent(req, {
      eventType: EVENTS.REFUND_REJECTED,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: `Refund refused: ${error.message}`,
      targetType: "Payment",
      targetId: payment.id,
    });
    throw error;
  }

  const amount = paymentTotal(payment);

  let stripeRefund;
  try {
    stripeRefund = await getStripe().refunds.create(
      {
        payment_intent: payment.paymentIntentId,
        amount: Math.round(amount * 100),
        // Keep processor parameters deterministic so a retry by another
        // authorized operator still matches the same idempotency key. The
        // human reason and actor remain in the local audit record below.
        metadata: { paymentId: payment.id, postId: payment.postId ?? "" },
      },
      {
        // If two authorized requests race, or Stripe succeeds before a local
        // database write fails, every retry refers to the same external refund.
        idempotencyKey: refundIdempotencyKey(payment.id),
      },
    );
  } catch {
    await logSecurityEvent(req, {
      eventType: EVENTS.REFUND_REJECTED,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "The payment processor did not complete the refund request.",
      targetType: "Payment",
      targetId: payment.id,
    });
    throw new AppError("The refund could not be completed.", 502, "REFUND_FAILED");
  }

  // One transaction: a Refund row without the matching flags on Payment would
  // leave the payment eligible to be refunded a second time.
  const refund = await prisma.$transaction(async (tx) => {
    // Upsert makes the local half idempotent too. Concurrent callers that
    // receive the same Stripe response converge on one row per payment.
    const created = await tx.refund.upsert({
      where: { paymentId: payment.id },
      create: {
        paymentId: payment.id,
        refundIntentId: stripeRefund.id,
        amount,
        currency: payment.currency,
        status: stripeRefund.status,
        reason,
        processedBy: req.user.id,
        processedByRole: req.user.role,
        postId: payment.postId ?? null,
      },
      update: {
        status: stripeRefund.status,
        amount,
      },
    });

    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: payment.id,
        OR: [{ refundIntentId: null }, { refundIntentId: stripeRefund.id }],
      },
      data: {
        refundIntentId: stripeRefund.id,
        refundStatus: stripeRefund.status,
        refundAmount: amount,
        refundReason: reason,
        refundedAt: new Date(),
      },
    });
    if (paymentUpdate.count !== 1) {
      throw new AppError("This payment has already been refunded.", 409, "ALREADY_REFUNDED");
    }

    return created;
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.REFUND_ISSUED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `Refund of ₱${amount} issued.`,
    targetType: "Payment",
    targetId: payment.id,
    metadata: { refundId: refund.id, reason, postId: payment.postId },
  });

  res.json({ success: true, message: "Refund issued.", refund });
};

/** GET /refunds/:refundId */
export const getRefundStatus = async (req, res) => {
  const refund = await prisma.refund.findUnique({
    where: { id: req.params.refundId },
    include: {
      payment: {
        select: {
          id: true,
          currency: true,
          postId: true,
          // NOT `amount` — that column no longer exists. The individual
          // components are what remain.
          monetaryContribution: true,
          monetaryTransactionFee: true,
          volunteerTransactionFee: true,
          inKindTransactionFee: true,
        },
      },
    },
  });
  if (!refund) throw notFound();

  res.json({
    ...refund,
    payment: refund.payment
      ? { ...refund.payment, totalPaid: paymentTotal(refund.payment) }
      : null,
  });
};

/** GET /refunds/history/:postId — owning organization or administrator. */
export const getRefundHistory = async (req, res) => {
  const { postId } = req.params;

  const refunds = await prisma.refund.findMany({
    where: { payment: { postId } },
    include: {
      payment: {
        select: {
          id: true,
          userId: true,
          monetaryContribution: true,
          monetaryTransactionFee: true,
          volunteerTransactionFee: true,
          inKindTransactionFee: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    postId,
    totalRefunded: refunds.reduce((sum, refund) => sum + refund.amount, 0),
    refundCount: refunds.length,
    refunds,
  });
};
