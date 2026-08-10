/**
 * Refund routes. Authorization — including the re-authentication requirement on
 * issuing a refund — is declared in security/accessControl.js.
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import {
  issueRefund,
  getRefundStatus,
  getRefundHistory,
} from "../controllers/refundController.js";
import { issueRefundSchema, refundIdSchema } from "../schemas/misc.schema.js";
import { postIdSchema } from "../schemas/post.schema.js";

const router = express.Router();

router.post("/issue", validate(issueRefundSchema), issueRefund);
router.get("/history/:postId", validate(postIdSchema), getRefundHistory);
router.get("/:refundId", validate(refundIdSchema), getRefundStatus);

export default router;
