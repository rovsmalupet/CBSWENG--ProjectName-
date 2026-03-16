import prisma from "../prisma/client.js";

// Get all pending (unverified) organizations
export const getPendingOrganizations = async (req, res) => {
  try {
    const pending = await prisma.organization.findMany({
      where: {
        isVerified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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
    const updated = await prisma.organization.update({
      where: { id },
      data: { isVerified: true },
    });
    res
      .status(200)
      .json({ message: "Organization approved", organization: updated });
  } catch (error) {
    console.error("Error approving organization:", error);
    res.status(500).json({ error: "Failed to approve organization" });
  }
};

// Reject an organization (delete or mark as rejected)
export const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    // Option 1: Delete the organization
    await prisma.organization.delete({
      where: { id },
    });
    res.status(200).json({ message: "Organization rejected and removed" });

    // Option 2: If you want to keep a record, you could add a status field instead
    // await prisma.organization.update({
    //   where: { id },
    //   data: { status: 'REJECTED' }
    // });
  } catch (error) {
    console.error("Error rejecting organization:", error);
    res.status(500).json({ error: "Failed to reject organization" });
  }
};
