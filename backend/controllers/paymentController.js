import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Stripe lazily when first needed
let stripe = null;
function getStripe() {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        "STRIPE_SECRET_KEY not found in environment variables. Please add it to your .env file."
      );
    }
    stripe = new Stripe(apiKey);
  }
  return stripe;
}

/**
 * Create a payment intent for BOTH donation + transaction fees
 * User pays donation amount + all applicable fees in one charge
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const {
      postId,
      donationAmount = 0,
      monetaryFee = 0,
      volunteerFee = 0,
      inKindFee = 0,
    } = req.body;

    // Calculate total
    const totalAmount = donationAmount + monetaryFee + volunteerFee + inKindFee;

    if (!postId || totalAmount <= 0) {
      return res.status(400).json({
        error:
          "postId required and total amount must be greater than 0",
      });
    }

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, projectName: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Build description showing breakdown
    const descriptionParts = [];
    if (donationAmount > 0) descriptionParts.push(`Donation: ₱${donationAmount}`);
    if (monetaryFee > 0) descriptionParts.push(`Fee (monetary): ₱${monetaryFee}`);
    if (volunteerFee > 0) descriptionParts.push(`Fee (volunteer): ₱${volunteerFee}`);
    if (inKindFee > 0) descriptionParts.push(`Fee (in-kind): ₱${inKindFee}`);

    // Create payment intent with Stripe
    // Amount in cents (Stripe requires integer in smallest currency unit)
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert PHP to cents
      currency: "php",
      description: `${descriptionParts.join(" + ")} for contribution to ${post.projectName}`,
      metadata: {
        postId,
        userId: req.user.id,
        userRole: req.user.role,
        donationAmount: donationAmount.toString(),
        monetaryFee: monetaryFee.toString(),
        volunteerFee: volunteerFee.toString(),
        inKindFee: inKindFee.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount,
      breakdown: {
        donationAmount,
        monetaryFee,
        volunteerFee,
        inKindFee,
      },
    });
  } catch (err) {
    console.error("Payment intent error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Confirm payment and record it in database
 * Called after Stripe payment succeeds on frontend
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, postId } = req.body;

    if (!paymentIntentId || !postId) {
      return res
        .status(400)
        .json({ error: "paymentIntentId and postId required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Retrieve payment intent from Stripe to verify it succeeded
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }

    // Record payment in database
    const payment = await prisma.payment.create({
      data: {
        paymentIntentId: paymentIntentId,
        amount: paymentIntent.amount / 100, // Store in PHP
        currency: paymentIntent.currency.toUpperCase(),
        status: "succeeded",
        postId,
        userId: req.user.id,
        description: paymentIntent.description,
      },
    });

    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (err) {
    console.error("Confirm payment error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve payment history for a post
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payments = await prisma.payment.findMany({
      where: { postId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total payments
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      postId,
      totalAmount,
      paymentCount: payments.length,
      payments,
    });
  } catch (err) {
    console.error("Get payment history error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get a single payment
 */
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        post: {
          select: { projectName: true },
        },
        user: {
          select: { id: true, role: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Get payment error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
};
