/**
 * organizationController.js
 *
 * Approval now flips the UserAccount as well as the Organization profile row —
 * see updateNgoApproval in services/userAccountService.js. The previous version
 * updated only the profile, which under the unified authentication model would
 * have left an approved organization still unable to sign in.
 */

import prisma from "../prisma/client.js";
import { notFound } from "../errors/AppError.js";
import {
  registerUser,
  getPendingNgoUsers,
  updateNgoApproval,
} from "../services/userAccountService.js";

/** POST /organizations/register — role is hard-coded, never taken from the body. */
export const registerOrganization = async (req, res) => {
  const result = await registerUser({ ...req.body, role: "ngo" }, req);
  res.status(201).json(result);
};

/** GET /organizations/pending — administrators only. */
export const getPendingOrganizations = async (req, res) => {
  res.status(200).json(await getPendingNgoUsers());
};

/** PATCH /organizations/:id/approve */
export const approveOrganization = async (req, res) => {
  const updated = await updateNgoApproval(req.params.id, "approve", req);
  if (!updated) throw notFound("We could not find that organization.");
  res.status(200).json({ message: "Organization approved.", organization: updated });
};

/** PATCH /organizations/:id/reject */
export const rejectOrganization = async (req, res) => {
  const updated = await updateNgoApproval(req.params.id, "reject", req);
  if (!updated) throw notFound("We could not find that organization.");
  res.status(200).json({ message: "Organization rejected.", organization: updated });
};

/**
 * GET /organizations/:id/verification
 *
 * The trust page a donor consults before giving: registration documents and a
 * track record. Open to any signed-in user by design — that transparency is
 * the platform's purpose — but it exposes only aggregates and the documents the
 * organization chose to publish.
 */
export const getOrganizationVerificationProfile = async (req, res) => {
  const { id } = req.params;

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
  if (!org) throw notFound("We could not find that organization.");

  const now = new Date();

  const [
    totalProjects,
    approvedProjects,
    activeProjects,
    confirmedContributions,
    monetaryRaised,
    projectsWithGoals,
    documents,
  ] = await Promise.all([
    prisma.post.count({ where: { orgId: id, NOT: { overallStatus: "Deleted" } } }),
    prisma.post.count({ where: { orgId: id, overallStatus: "Approved" } }),
    prisma.post.count({
      where: {
        orgId: id,
        overallStatus: "Approved",
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    }),
    prisma.contribution.count({ where: { status: "Confirmed", post: { orgId: id } } }),
    prisma.contribution.aggregate({
      where: { status: "Confirmed", type: "Monetary", post: { orgId: id } },
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
      where: { post: { orgId: id, overallStatus: "Approved" } },
      orderBy: { createdAt: "desc" },
      // No filePath: the server's directory layout is not a donor's business.
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        mimeType: true,
        description: true,
        uploadedBy: true,
        createdAt: true,
        post: { select: { id: true, projectName: true } },
      },
    }),
  ]);

  const registrationDocTypes = new Set(["Certification", "Compliance", "Certificate"]);

  const completedFundingGoals = projectsWithGoals.reduce((count, post) => {
    const monetary = post.supportOptions?.[0];
    if (!monetary) return count;
    const target = Number(monetary.targetAmount ?? 0);
    const current = Number(monetary.currentAmount ?? 0);
    return target > 0 && current >= target ? count + 1 : count;
  }, 0);

  const yearsActive = Math.max(
    0,
    Math.floor((now.getTime() - new Date(org.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000)),
  );

  res.status(200).json({
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
      confirmedContributions,
      totalMonetaryRaised: monetaryRaised._sum.amount ?? 0,
      totalMonetaryCampaigns: projectsWithGoals.length,
      completedFundingGoals,
    },
    registrationDocuments: documents.filter((doc) => registrationDocTypes.has(doc.fileType)),
    allDocuments: documents,
  });
};
