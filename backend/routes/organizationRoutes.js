/**
 * Organization routes. Authorization is declared in security/accessControl.js.
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  registerOrganization,
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization,
  getOrganizationVerificationProfile,
} from "../controllers/organizationController.js";
import { registerOrganizationSchema } from "../schemas/auth.schema.js";
import { organizationIdSchema } from "../schemas/misc.schema.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerOrganizationSchema), registerOrganization);

router.get("/pending", getPendingOrganizations);
router.get("/:id/verification", validate(organizationIdSchema), getOrganizationVerificationProfile);
router.patch("/:id/approve", validate(organizationIdSchema), approveOrganization);
router.patch("/:id/reject", validate(organizationIdSchema), rejectOrganization);

export default router;
