import prisma from "../prisma/client.js";
import {
  registerUser,
  getPendingNgoUsers,
  updateNgoApproval,
} from "../services/userAccountService.js";

/**
 * POST /organizations/register
 * Register a new NGO organization.
 * Organization accounts are created with status "Pending" and require admin approval.
 */
export const registerOrganization = async (req, res) => {
  try {
    const result = await registerUser({
      ...req.body,
      role: "ngo", // Force role to ngo for this endpoint
    });
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Organization registration error:", error);
    res.status(500).json({ error: "Failed to register organization." });
  }
};

/**
 * GET /organizations/pending
 * Returns all NGO accounts with status "Pending".
 * Used by the admin panel to review new NGO registrations.
 */
export const getPendingOrganizations = async (req, res) => {
  try {
    const pending = await getPendingNgoUsers();
    res.status(200).json(pending);
  } catch (error) {
    console.error("Error fetching pending organizations:", error);
    res.status(500).json({ error: "Failed to fetch pending organizations" });
  }
};

/**
 * PATCH /organizations/:id/approve
 * Sets the organization status to "Approved" and isVerified to true.
 * The NGO can now log in after this.
 */
export const approveOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await updateNgoApproval(id, "approve");

    if (!updated) {
      return res.status(404).json({ error: "Organization not found." });
    }

    res
      .status(200)
      .json({ message: "Organization approved.", organization: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Organization not found." });
    }
    console.error("Error approving organization:", error);
    res.status(500).json({ error: "Failed to approve organization." });
  }
};

/**
 * PATCH /organizations/:id/reject
 * Sets the organization status to "Rejected".
 */
export const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await updateNgoApproval(id, "reject");

    if (!updated) {
      return res.status(404).json({ error: "Organization not found." });
    }

    res
      .status(200)
      .json({ message: "Organization rejected.", organization: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Organization not found." });
    }
    console.error("Error rejecting organization:", error);
    res.status(500).json({ error: "Failed to reject organization." });
  }
};
