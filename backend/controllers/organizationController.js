import {
  getPendingNgoUsers,
  registerUser,
  updateNgoApproval,
} from "../services/userAccountService.js";

export const registerOrganization = async (req, res) => {
  try {
    const result = await registerUser({ ...req.body, role: "ngo" });
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ error: "Failed to register organization" });
  }
};

// Get all pending (unverified) organizations
export const getPendingOrganizations = async (req, res) => {
  try {
    const pending = await getPendingNgoUsers();
    res.status(200).json(pending);
  } catch (error) {
    console.error("Error fetching pending organizations:", error);
    res.status(500).json({ error: "Failed to fetch pending organizations" });
  }
};

// Approve an organization (set isVerified to true)
export const approveOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await updateNgoApproval(id, "approve");
    if (!updated) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json({ message: "Organization approved", organization: updated });
  } catch (error) {
    console.error("Error approving organization:", error);
    res.status(500).json({ error: "Failed to approve organization" });
  }
};

// Reject an organization (delete or mark as rejected)
export const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await updateNgoApproval(id, "reject");
    if (!updated) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json({ message: "Organization rejected", organization: updated });
  } catch (error) {
    console.error("Error rejecting organization:", error);
    res.status(500).json({ error: "Failed to reject organization" });
  }
};
