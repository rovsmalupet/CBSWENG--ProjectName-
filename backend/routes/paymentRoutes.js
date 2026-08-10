/**
 * Payment routes. Authorization is declared in security/accessControl.js.
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentsByDonor,
  getPaymentsByProject,
} from "../controllers/paymentController.js";
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  paymentIdSchema,
  donorIdSchema,
  projectIdSchema,
} from "../schemas/misc.schema.js";
import { postIdSchema } from "../schemas/post.schema.js";

const router = express.Router();

router.post("/intent", validate(createPaymentIntentSchema), createPaymentIntent);
router.post("/confirm", validate(confirmPaymentSchema), confirmPayment);

router.get("/history/:postId", validate(postIdSchema), getPaymentHistory);
router.get("/donor/:donorId", validate(donorIdSchema), getPaymentsByDonor);
router.get("/project/:projectId", validate(projectIdSchema), getPaymentsByProject);
router.get("/:paymentId", validate(paymentIdSchema), getPaymentById);

export default router;
