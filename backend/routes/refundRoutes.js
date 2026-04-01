import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  issueRefund,
  getRefundStatus,
  getRefundHistory,
} from "../controllers/refundController.js";

const router = express.Router();

// Issue refund (admin or org when declining contribution)
router.post(
  "/issue",
  authenticate,
  authorizeRoles("admin", "ngo"),
  issueRefund
);

// Get refund details
router.get("/:refundId", authenticate, getRefundStatus);

// Get refund history for a post
router.get(
  "/history/:postId",
  authenticate,
  authorizeRoles("ngo", "admin"),
  getRefundHistory
);

export default router;
