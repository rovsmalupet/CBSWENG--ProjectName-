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

    // Handle special "admin" donation - skip post verification
    let projectName = "Support BayaniHub - Admin Fund";
    if (postId !== "admin") {
      // Verify post exists for regular donations
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, projectName: true },
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      projectName = post.projectName;
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
      description: `${descriptionParts.join(" + ")} for contribution to ${projectName}`,
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

    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ error: "paymentIntentId required" });
    }

    // postId can be null for admin donations, but must be provided in request
    if (postId === undefined || postId === null || postId === "") {
      return res
        .status(400)
        .json({ error: "postId required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.user.id || !req.user.role) {
      return res.status(401).json({ error: "Invalid user credentials in token" });
    }

    // Retrieve payment intent from Stripe to verify it succeeded
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    // Allow both 'succeeded' and 'processing' statuses - processing will finalize later
    if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
      return res.status(400).json({
        error: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }

    // Record payment in database with the actual Stripe status
    // For "admin" donations, use a special marker without foreign key constraint
    const metadata = paymentIntent.metadata || {};
    const paymentData = {
      paymentIntentId: paymentIntentId,
      currency: (paymentIntent.currency || "php").toUpperCase(),
      status: paymentIntent.status,
      userId: req.user.id,
      userRole: req.user.role,
      description: paymentIntent.description || "",
      monetaryContribution: Math.max(0, parseFloat(metadata.donationAmount) || 0),
      monetaryTransactionFee: Math.max(0, parseFloat(metadata.monetaryFee) || 0),
      volunteerTransactionFee: Math.max(0, parseFloat(metadata.volunteerFee) || 0),
      inKindTransactionFee: Math.max(0, parseFloat(metadata.inKindFee) || 0),
    };

    // Only set postId if it's not "admin" to avoid foreign key constraint issues
    if (postId !== "admin") {
      paymentData.postId = postId;
    }

    const payment = await prisma.payment.create({
      data: paymentData,
    });

    res.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (err) {
    console.error("Confirm payment error:", err.message);
    console.error("Error details:", err);
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.toString() : "Database error"
    });
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
        monetaryContribution: true,
        monetaryTransactionFee: true,
        volunteerTransactionFee: true,
        inKindTransactionFee: true,
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

    // Calculate total payments (amount = sum of all fees and donation)
    const totalAmount = payments.reduce(
      (sum, p) => sum + p.monetaryContribution + p.monetaryTransactionFee + p.volunteerTransactionFee + p.inKindTransactionFee,
      0
    );

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
          select: { id: true, projectName: true },
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

/**
 * Get all payments made by a specific donor (for their contribution history)
 */
export const getPaymentsByDonor = async (req, res) => {
  try {
    const { donorId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Users can only view their own payments (unless admin)
    if (req.user.id !== donorId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: donorId },
      include: {
        post: {
          select: {
            id: true,
            projectName: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totalSpent (amount = sum of all fees and donation)
    const totalSpent = payments.reduce(
      (sum, p) => sum + p.monetaryContribution + p.monetaryTransactionFee + p.volunteerTransactionFee + p.inKindTransactionFee,
      0
    );
    const successfulPayments = payments.filter((p) => p.status === "succeeded");

    res.json({
      donorId,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalSpent,
      payments,
    });
  } catch (err) {
    console.error("Get donor payments error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all payments received for a specific project (for org/admin dashboard)
 */
export const getPaymentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify user is the org that owns this project or is an admin
    const post = await prisma.post.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (req.user.id !== post.organizationId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const payments = await prisma.payment.findMany({
      where: { postId: projectId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const successfulPayments = payments.filter((p) => p.status === "succeeded");
    // Calculate totalReceived (amount = sum of all fees and donation)
    const totalReceived = successfulPayments.reduce(
      (sum, p) => sum + p.monetaryContribution + p.monetaryTransactionFee + p.volunteerTransactionFee + p.inKindTransactionFee,
      0
    );

    res.json({
      projectId,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalReceived,
      payments,
    });
  } catch (err) {
    console.error("Get project payments error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentsByDonor,
  getPaymentsByProject,
};
