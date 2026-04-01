import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create payment intent (before contribution is finalized)
router.post(
  "/intent",
  authenticate,
  authorizeRoles("donor", "ngo"),
  createPaymentIntent
);

// Confirm payment after Stripe processes it
router.post(
  "/confirm",
  authenticate,
  authorizeRoles("donor", "ngo"),
  confirmPayment
);

// Get payment history for a post
router.get(
  "/history/:postId",
  authenticate,
  authorizeRoles("ngo", "admin"),
  getPaymentHistory
);

// Get single payment details
router.get("/:paymentId", authenticate, getPaymentById);

export default router;
