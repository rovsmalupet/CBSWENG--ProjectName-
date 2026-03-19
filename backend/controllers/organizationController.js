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

/**
 * GET /organizations/:id/verification
 * Returns public verification profile data: registration/compliance documents
 * and organization track record metrics for donor trust checks.
 */
export const getOrganizationVerificationProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        orgName: true,
        email: true,
        country: true,
        firstName: true,
        surname: true,
        isVerified: true,
        status: true,
        createdAt: true,
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found." });
    }

    const now = new Date();

    const [
      totalProjects,
      approvedProjects,
      activeProjects,
      confirmedContributionCount,
      monetaryRaised,
      projectsWithMonetaryGoals,
      documents,
    ] = await Promise.all([
      prisma.post.count({
        where: { orgId: id, NOT: { overallStatus: "Deleted" } },
      }),
      prisma.post.count({
        where: { orgId: id, overallStatus: "Approved" },
      }),
      prisma.post.count({
        where: {
          orgId: id,
          overallStatus: "Approved",
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      }),
      prisma.contribution.count({
        where: {
          status: "Confirmed",
          post: { orgId: id },
        },
      }),
      prisma.contribution.aggregate({
        where: {
          status: "Confirmed",
          type: "Monetary",
          post: { orgId: id },
        },
        _sum: { amount: true },
      }),
      prisma.post.findMany({
        where: {
          orgId: id,
          NOT: { overallStatus: "Deleted" },
          supportOptions: { some: { type: "Monetary" } },
        },
        select: {
          id: true,
          supportOptions: {
            where: { type: "Monetary" },
            select: { targetAmount: true, currentAmount: true },
            take: 1,
          },
        },
      }),
      prisma.documentUpload.findMany({
        where: { post: { orgId: id } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          mimeType: true,
          description: true,
          uploadedBy: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              projectName: true,
            },
          },
        },
      }),
    ]);

    const registrationDocTypes = new Set(["Certification", "Compliance", "Certificate"]);
    const registrationDocuments = documents.filter((doc) => registrationDocTypes.has(doc.fileType));

    const completedFundingGoals = projectsWithMonetaryGoals.reduce((count, post) => {
      const monetary = post.supportOptions?.[0];
      if (!monetary) return count;
      const target = Number(monetary.targetAmount ?? 0);
      const current = Number(monetary.currentAmount ?? 0);
      if (target > 0 && current >= target) return count + 1;
      return count;
    }, 0);

    const yearsActive = Math.max(
      0,
      Math.floor((now.getTime() - new Date(org.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000)),
    );

    return res.status(200).json({
      organization: {
        id: org.id,
        orgName: org.orgName,
        email: org.email,
        country: org.country,
        representative:
          org.firstName && org.surname ? `${org.firstName} ${org.surname}` : null,
        isVerified: org.isVerified,
        status: org.status,
        createdAt: org.createdAt,
      },
      trackRecord: {
        yearsActive,
        totalProjects,
        approvedProjects,
        activeProjects,
        confirmedContributions: confirmedContributionCount,
        totalMonetaryRaised: monetaryRaised._sum.amount ?? 0,
        totalMonetaryCampaigns: projectsWithMonetaryGoals.length,
        completedFundingGoals,
      },
      registrationDocuments,
      allDocuments: documents,
    });
  } catch (error) {
    console.error("Error fetching organization verification profile:", error);
    return res.status(500).json({
      error: "Failed to load organization verification profile.",
    });
  }
};
