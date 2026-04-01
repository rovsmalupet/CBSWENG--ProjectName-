import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Stripe lazily when first needed
let stripe = null;
function getStripe() {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        "STRIPE_SECRET_KEY not found in environment variables."
      );
    }
    const Stripe = require("stripe");
    stripe = new Stripe(apiKey);
  }
  return stripe;
}

/**
 * Issue a refund for a payment (called when contribution is declined)
 */
export const issueRefund = async (req, res) => {
  try {
    const { paymentId, reason = "contribution_declined" } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { post: true },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if already refunded
    if (payment.refundIntentId) {
      return res.status(400).json({ error: "Payment already refunded" });
    }

    // Issue refund via Stripe
    const stripeRefund = await getStripe().refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: Math.round(payment.amount * 100), // Convert to cents
      metadata: {
        reason,
        postId: payment.postId,
      },
    });

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        paymentId,
        refundIntentId: stripeRefund.id,
        amount: payment.amount,
        currency: payment.currency,
        status: stripeRefund.status,
        reason,
        processedBy: req.user.id,
        processedByRole: req.user.role,
      },
    });

    // Update payment with refund details
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundIntentId: stripeRefund.id,
        refundStatus: stripeRefund.status,
        refundAmount: payment.amount,
        refundReason: reason,
        refundedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Refund issued successfully",
      refund,
    });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get refund status
 */
export const getRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            postId: true,
          },
        },
      },
    });

    if (!refund) {
      return res.status(404).json({ error: "Refund not found" });
    }

    res.json(refund);
  } catch (err) {
    console.error("Get refund error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all refunds for a post
 */
export const getRefundHistory = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const refunds = await prisma.refund.findMany({
      where: {
        payment: { postId },
      },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

    res.json({
      postId,
      totalRefunded,
      refundCount: refunds.length,
      refunds,
    });
  } catch (err) {
    console.error("Get refund history error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  issueRefund,
  getRefundStatus,
  getRefundHistory,
};
