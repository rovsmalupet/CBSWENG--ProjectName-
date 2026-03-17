import prisma from "../prisma/client.js";
import { getPendingNgoUsers, updateNgoApproval } from "../services/userAccountService.js";

/**
 * GET /organizations/pending
 * Returns all NGO accounts with status "Pending".
 * Used by the admin panel to review new NGO registrations.
 *
 * Why delegate to userAccountService instead of querying directly?
 * userAccountService handles password stripping and other sanitization.
 * Keeping that logic in one place means we don't accidentally leak passwords.
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

    res.status(200).json({ message: "Organization approved.", organization: updated });
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
 *
 * Why PATCH instead of DELETE?
 * We keep the record for audit purposes — the admin can see who was rejected.
 * A rejected org simply cannot log in.
 */
export const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await updateNgoApproval(id, "reject");

    if (!updated) {
      return res.status(404).json({ error: "Organization not found." });
    }

    res.status(200).json({ message: "Organization rejected.", organization: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Organization not found." });
    }
    console.error("Error rejecting organization:", error);
    res.status(500).json({ error: "Failed to reject organization." });
  }
};