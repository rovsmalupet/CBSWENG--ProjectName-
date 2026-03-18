import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  registerOrganization,
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization,
} from "../controllers/organizationController.js";

const router = express.Router();

// POST /organizations/register - Register a new NGO account
router.post("/register", registerOrganization);

// GET /organizations/pending - Get all pending organizations
router.get("/pending", authenticate, authorizeRoles("admin"), getPendingOrganizations);

// PATCH /organizations/:id/approve - Approve an organization
router.patch("/:id/approve", authenticate, authorizeRoles("admin"), approveOrganization);

// PATCH /organizations/:id/reject - Reject an organization
router.patch("/:id/reject", authenticate, authorizeRoles("admin"), rejectOrganization);

export default router;
