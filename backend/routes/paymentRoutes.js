import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentsByDonor,
  getPaymentsByProject,
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

// Get all payments made by a donor (for donor's payment history page)
router.get(
  "/donor/:donorId",
  authenticate,
  getPaymentsByDonor
);

// Get all payments received for a project (for org/admin view)
router.get(
  "/project/:projectId",
  authenticate,
  getPaymentsByProject
);

// Get single payment details
router.get("/:paymentId", authenticate, getPaymentById);

export default router;
