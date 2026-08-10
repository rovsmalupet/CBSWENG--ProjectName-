/**
 * paymentController.js
 *
 * The two most serious defects in the original version were both here:
 *
 *   1. `POST /payments/intent` took `donationAmount`, `monetaryFee`,
 *      `volunteerFee` and `inKindFee` from the request body and charged their
 *      sum, so a caller could set their own transaction fees to ₱1 on a
 *      ₱100,000 donation. Fees are now computed by businessRules.computeFees
 *      from the project's own data; the schema does not accept a fee field at
 *      all.
 *
 *   2. `POST /payments/confirm` trusted the `postId` in the request body and
 *      never checked that the Stripe PaymentIntent belonged to the caller, so
 *      one user could confirm and claim another user's payment. Both the owner
 *      and the project now come from the intent's own metadata.
 *
 * Read routes had no object-level authorization; that is now declared in the
 * policy table and has run before these functions execute. [2.2.2]
 */

import Stripe from "stripe";

import prisma from "../prisma/client.js";
import { AppError, notFound, badRequest } from "../errors/AppError.js";
import {
  computeFees,
  computeInKindValue,
  assertPostAcceptsContributions,
  assertPaymentIntentBelongsTo,
  paymentTotal,
} from "../security/businessRules.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

/** Lazily constructed so a missing key is an error at use, not at import. */
let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new AppError("Payments are unavailable right now.", 503, "PAYMENTS_UNAVAILABLE");
    }
    stripeClient = new Stripe(apiKey);
  }
  return stripeClient;
};

/** Donations to the platform itself, from the "donate to developers" page. */
const PLATFORM_DONATION = "admin";

/**
 * POST /payments/intent
 *
 * The caller says WHAT they wish to contribute. The server decides what it
 * costs.
 */
export const createPaymentIntent = async (req, res) => {
  const { postId, monetaryAmount = 0, volunteerCount = 0, inKindEntries = [] } = req.body;

  let projectName = "Support BayaniHub";
  let breakdown;

  if (postId === PLATFORM_DONATION) {
    // A gift to the platform carries no transaction fee — there is no project
    // taking a cut, so charging one would be inventing a charge.
    if (volunteerCount > 0 || inKindEntries.length > 0) {
      throw badRequest("Donations to the platform can only be monetary.");
    }
    breakdown = computeFees({ monetaryAmount });
    breakdown = { ...breakdown, monetaryFee: 0, total: breakdown.donationAmount };
    if (breakdown.total <= 0) throw badRequest("Enter an amount to donate.");
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { inKindItems: true, supportOptions: true },
    });

    // Fees cannot be quoted for a project that is not accepting contributions.
    assertPostAcceptsContributions(post);
    projectName = post.projectName;

    breakdown = computeFees({
      monetaryAmount,
      volunteerCount,
      // Valued from the project's own price list, never from the request.
      inKindValue: computeInKindValue(post, inKindEntries),
    });
  }

  const parts = [];
  if (breakdown.donationAmount > 0) parts.push(`Donation ₱${breakdown.donationAmount}`);
  if (breakdown.monetaryFee > 0) parts.push(`Monetary fee ₱${breakdown.monetaryFee}`);
  if (breakdown.volunteerFee > 0) parts.push(`Volunteer fee ₱${breakdown.volunteerFee}`);
  if (breakdown.inKindFee > 0) parts.push(`In-kind fee ₱${breakdown.inKindFee}`);

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(breakdown.total * 100), // Stripe works in centavos
    currency: "php",
    description: `${parts.join(" + ")} — ${projectName}`,
    metadata: {
      postId,
      // The authoritative record of who this payment is for. confirmPayment
      // reads these back rather than trusting the request body.
      userId: req.user.id,
      userRole: req.user.role,
      donationAmount: String(breakdown.donationAmount),
      monetaryFee: String(breakdown.monetaryFee),
      volunteerFee: String(breakdown.volunteerFee),
      inKindFee: String(breakdown.inKindFee),
    },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.PAYMENT_INTENT_CREATED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Payment intent created for ₱${breakdown.total}.`,
    targetType: "Post",
    targetId: postId,
    metadata: { breakdown },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    totalAmount: breakdown.total,
    breakdown,
  });
};

/**
 * POST /payments/confirm
 *
 * Everything recorded comes from the PaymentIntent that Stripe holds, not from
 * the request. The only thing the caller supplies is which intent to look up,
 * and it must be one created for them.
 */
export const confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

  try {
    assertPaymentIntentBelongsTo(paymentIntent, req.user);
  } catch (error) {
    await logSecurityEvent(req, {
      eventType: EVENTS.PAYMENT_CONFIRM_REJECTED,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Attempt to confirm a payment intent that does not belong to the caller: ${error.message}`,
      targetType: "Payment",
      targetId: paymentIntentId,
      metadata: { intentOwner: paymentIntent?.metadata?.userId },
    });
    throw error;
  }

  const metadata = paymentIntent.metadata ?? {};

  // A repeated confirmation is idempotent rather than an error — the client may
  // legitimately retry after a dropped response. The unique index on
  // paymentIntentId is the backstop.
  const existing = await prisma.payment.findUnique({ where: { paymentIntentId } });
  if (existing) {
    return res.json({ success: true, message: "Payment already recorded.", payment: existing });
  }

  const payment = await prisma.payment.create({
    data: {
      paymentIntentId,
      currency: (paymentIntent.currency ?? "php").toUpperCase(),
      status: paymentIntent.status,
      description: paymentIntent.description ?? "",
      // From the session, matched against the intent metadata above.
      userId: req.user.id,
      userRole: req.user.role,
      // From the metadata recorded when the intent was created, NOT the body.
      postId: metadata.postId === PLATFORM_DONATION ? null : (metadata.postId ?? null),
      monetaryContribution: Number(metadata.donationAmount ?? 0),
      monetaryTransactionFee: Number(metadata.monetaryFee ?? 0),
      volunteerTransactionFee: Number(metadata.volunteerFee ?? 0),
      inKindTransactionFee: Number(metadata.inKindFee ?? 0),
    },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.PAYMENT_CONFIRMED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Payment of ₱${paymentTotal(payment)} recorded.`,
    targetType: "Payment",
    targetId: payment.id,
    metadata: { postId: payment.postId, status: payment.status },
  });

  res.json({ success: true, message: "Payment recorded.", payment });
};

/* ═══════════════════════════════════════════════════════════════════════════
 * READS — object-level authorization already applied by accessControl
 * ═══════════════════════════════════════════════════════════════════════════ */

const summarise = (payments) => ({
  totalAmount: payments.reduce((sum, payment) => sum + paymentTotal(payment), 0),
  paymentCount: payments.length,
  successfulPayments: payments.filter((payment) => payment.status === "succeeded").length,
});

/** GET /payments/history/:postId — owning organization or administrator. */
export const getPaymentHistory = async (req, res) => {
  const { postId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { postId },
    select: {
      id: true,
      userId: true,
      userRole: true,
      monetaryContribution: true,
      monetaryTransactionFee: true,
      volunteerTransactionFee: true,
      inKindTransactionFee: true,
      currency: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ postId, ...summarise(payments), payments });
};

/** GET /payments/:paymentId — the payer, the receiving organization, or an admin. */
export const getPaymentById = async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.paymentId },
    include: { post: { select: { id: true, projectName: true } } },
  });
  if (!payment) throw notFound();
  res.json(payment);
};

/** GET /payments/donor/:donorId — the donor themselves, or an admin. */
export const getPaymentsByDonor = async (req, res) => {
  const { donorId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { userId: donorId },
    include: {
      post: { select: { id: true, projectName: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = summarise(payments);
  res.json({
    donorId,
    totalPayments: summary.paymentCount,
    successfulPayments: summary.successfulPayments,
    totalSpent: summary.totalAmount,
    payments,
  });
};

/** GET /payments/project/:projectId — owning organization or administrator. */
export const getPaymentsByProject = async (req, res) => {
  const { projectId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { postId: projectId },
    orderBy: { createdAt: "desc" },
  });

  const succeeded = payments.filter((payment) => payment.status === "succeeded");
  res.json({
    projectId,
    totalPayments: payments.length,
    successfulPayments: succeeded.length,
    totalReceived: succeeded.reduce((sum, payment) => sum + paymentTotal(payment), 0),
    payments,
  });
};
