/**
 * postController.js
 *
 * Object-level authorization for every route here is declared in
 * security/accessControl.js and has already run by the time these functions
 * execute — `req.resource` holds the row it loaded. Business rules come from
 * security/businessRules.js. What remains is data access.
 *
 * Three classes of defect were removed while rewriting:
 *   · `res.status(500).json({ error: err.message })` in eleven places, one of
 *     which also returned the Prisma error code and `meta` object [2.4.1];
 *   · missing ownership checks on update and delete [2.2.2];
 *   · progress totals incremented on contributions nobody had confirmed [2.2.3].
 */

import prisma from "../prisma/client.js";
import { notFound, badRequest } from "../errors/AppError.js";
import {
  assertPostTransition,
  assertPostAcceptsContributions,
  assertContributionAllowed,
  assertContributionTransition,
} from "../security/businessRules.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * SHAPING
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Reshape a Prisma post into what the frontend expects.
 *
 * `budgetBreakdown` is now returned exactly as stored, including null. The old
 * `normalizeBudgetBreakdown` helper substituted a hardcoded 80/10/10 split
 * whenever the stored value was missing or unparseable, which meant the API
 * could report a budget the organization never entered. Validation guarantees
 * that anything written from now on is well-formed. [2.3.1]
 */
const formatPost = (post) => ({
  ...post,
  orgName: post.organization?.orgName ?? null,
  orgEmail: post.organization?.email ?? null,
  orgCountry: post.organization?.country ?? null,
  orgIsVerified: post.organization?.isVerified ?? false,
  orgRepresentative:
    post.organization?.firstName && post.organization?.surname
      ? `${post.organization.firstName} ${post.organization.surname}`
      : null,
  budgetBreakdown: post.budgetBreakdown ?? null,
  organization: undefined,
  supportTypes: {
    monetary: (() => {
      const option = post.supportOptions?.find((entry) => entry.type === "Monetary");
      return option
        ? {
            enabled: true,
            targetAmount: option.targetAmount,
            currentAmount: option.currentAmount,
            status: option.status,
          }
        : { enabled: false };
    })(),
    volunteer: (() => {
      const option = post.supportOptions?.find((entry) => entry.type === "Volunteer");
      return option
        ? {
            enabled: true,
            targetVolunteers: option.targetCount,
            currentVolunteers: option.currentCount,
            status: option.status,
          }
        : { enabled: false };
    })(),
    inKind: post.inKindItems ?? [],
  },
  supportOptions: undefined,
  inKindItems: undefined,
});

const POST_INCLUDE = { inKindItems: true, supportOptions: true, organization: true };

/**
 * Translate the validated request body into Prisma input.
 *
 * Every value here has already passed the schema, so there is no defaulting,
 * no filtering, and no numeric coercion — the three things the previous
 * `buildPostData` did silently.
 */
const buildPostData = (body) => {
  const supportOptionsData = [];

  if (body.supportTypes.monetary?.enabled) {
    supportOptionsData.push({
      type: "Monetary",
      targetAmount: body.supportTypes.monetary.targetAmount,
      currentAmount: 0,
    });
  }
  if (body.supportTypes.volunteer?.enabled) {
    supportOptionsData.push({
      type: "Volunteer",
      targetCount: body.supportTypes.volunteer.targetVolunteers,
      currentCount: 0,
    });
  }

  return {
    postFields: {
      projectName: body.projectName,
      description: body.description ?? null,
      location: body.location ?? null,
      causes: body.causes,
      priority: body.priority,
      budgetBreakdown: body.budgetBreakdown ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
    },
    inKindItems: (body.supportTypes.inKind ?? []).map((item) => ({
      itemName: item.itemName,
      targetQuantity: item.targetQuantity,
      unit: item.unit ?? null,
      pricePerUnit: item.pricePerUnit ?? null,
    })),
    supportOptionsData,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * READ
 * ═══════════════════════════════════════════════════════════════════════════ */

/** GET /posts — the signed-in organization's own projects. */
export const getOrgPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { orgId: req.user.id, NOT: { overallStatus: "Deleted" } },
    orderBy: { createdAt: "desc" },
    include: POST_INCLUDE,
  });
  res.json(posts.map(formatPost));
};

/** GET /posts/approved — public donor feed. Approved projects only. */
export const getApprovedPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { overallStatus: "Approved" },
    orderBy: { createdAt: "desc" },
    include: POST_INCLUDE,
  });
  res.json(posts.map(formatPost));
};

/** GET /posts/admin/all */
export const getAllPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ...POST_INCLUDE,
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { admin: { select: { firstName: true, lastName: true } } },
      },
    },
  });
  res.json(posts.map((post) => ({ ...formatPost(post), lastAudit: post.auditLogs[0] ?? null })));
};

/**
 * GET /posts/:postId
 *
 * Visibility was enforced upstream by owners.postVisible: an Approved project
 * is readable by any signed-in user, anything else only by its organization or
 * an administrator. Previously any authenticated user could read any project in
 * any state, including drafts and deleted rows, by guessing an id.
 */
export const getPostById = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.postId },
    include: POST_INCLUDE,
  });
  if (!post) throw notFound();
  res.json(formatPost(post));
};

/** GET /posts/:postId/audit — administrators only. */
export const getPostAuditLog = async (req, res) => {
  const logs = await prisma.postAuditLog.findMany({
    where: { postId: req.params.postId },
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { firstName: true, lastName: true } } },
  });
  res.json(logs);
};

/** GET /posts/:postId/contributions — the owning organization's review queue. */
export const getPostContributions = async (req, res) => {
  const contributions = await prisma.contribution.findMany({
    where: { postId: req.params.postId },
    orderBy: { createdAt: "desc" },
    include: { inKindItem: { select: { id: true, itemName: true, unit: true } } },
  });
  res.json({ postId: req.params.postId, contributions });
};

/* ═══════════════════════════════════════════════════════════════════════════
 * WRITE
 * ═══════════════════════════════════════════════════════════════════════════ */

/** POST /posts */
export const createPost = async (req, res) => {
  const { postFields, inKindItems, supportOptionsData } = buildPostData(req.body);

  const post = await prisma.post.create({
    data: {
      ...postFields,
      // Taken from the session, never from the body — the schema rejects an
      // orgId field outright, so a project cannot be created on another
      // organization's behalf.
      orgId: req.user.id,
      overallStatus: "Pending",
      inKindItems: { create: inKindItems },
      supportOptions: { create: supportOptionsData },
    },
    include: POST_INCLUDE,
  });

  res.status(201).json({ message: "Project submitted for review.", post: formatPost(post) });
};

/**
 * PUT /posts/:postId
 *
 * Ownership is enforced by owners.post. Before that resolver existed this route
 * checked only that the caller was *an* organization, so any NGO could rewrite
 * any other NGO's project.
 */
export const updatePost = async (req, res) => {
  const current = req.resource; // loaded by the ownership resolver
  const { postFields, inKindItems, supportOptionsData } = buildPostData(req.body);

  // An edit returns the project to review. The state machine rejects editing a
  // deleted project rather than silently resurrecting it.
  assertPostTransition(current.overallStatus, "Edited", req.user.role === "admin" ? "admin" : "owner");

  const updated = await prisma.post.update({
    where: { id: req.params.postId },
    data: {
      ...postFields,
      overallStatus: "Edited",
      inKindItems: { deleteMany: {}, create: inKindItems },
      supportOptions: { deleteMany: {}, create: supportOptionsData },
    },
    include: POST_INCLUDE,
  });

  res.json({ message: "Project updated and resubmitted for review.", post: formatPost(updated) });
};

/** DELETE /posts/:postId — soft delete. */
export const deletePost = async (req, res) => {
  const current = req.resource;
  assertPostTransition(
    current.overallStatus,
    "Deleted",
    req.user.role === "admin" ? "admin" : "owner",
  );

  await prisma.post.update({
    where: { id: req.params.postId },
    data: { overallStatus: "Deleted" },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.POST_STATUS_CHANGED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Project "${current.projectName}" was deleted.`,
    targetType: "Post",
    targetId: req.params.postId,
    metadata: { from: current.overallStatus, to: "Deleted" },
  });

  res.json({ message: "Project deleted." });
};

/**
 * DELETE /posts/:postId/permanent
 *
 * Irreversible, and cascades to every contribution, payment, refund and
 * document attached to the project. Requires re-authentication. [2.1.13]
 */
export const permanentDeletePost = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.postId },
    select: { id: true, projectName: true, orgId: true },
  });
  if (!post) throw notFound();

  await prisma.post.delete({ where: { id: req.params.postId } });

  await logSecurityEvent(req, {
    eventType: EVENTS.POST_STATUS_CHANGED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `Project "${post.projectName}" was permanently destroyed, along with all related records.`,
    targetType: "Post",
    targetId: post.id,
    metadata: { organizationId: post.orgId },
  });

  res.json({ message: "Project permanently deleted." });
};

/**
 * PATCH /posts/:postId/status — moderation.
 *
 * The state machine is what stops Deleted → Approved, which the previous
 * implementation permitted because it validated the target status against the
 * enum and wrote it straight through.
 */
export const updatePostStatus = async (req, res) => {
  const { overallStatus } = req.body;
  const current = await prisma.post.findUnique({
    where: { id: req.params.postId },
    select: { id: true, overallStatus: true, projectName: true },
  });
  if (!current) throw notFound();

  assertPostTransition(current.overallStatus, overallStatus, "admin");

  const [updated] = await prisma.$transaction([
    prisma.post.update({ where: { id: req.params.postId }, data: { overallStatus } }),
    prisma.postAuditLog.create({
      data: { postId: req.params.postId, adminId: req.user.id, action: overallStatus },
    }),
  ]);

  await logSecurityEvent(req, {
    eventType: EVENTS.POST_STATUS_CHANGED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Project "${current.projectName}" moved from ${current.overallStatus} to ${overallStatus}.`,
    targetType: "Post",
    targetId: req.params.postId,
    metadata: { from: current.overallStatus, to: overallStatus },
  });

  res.json({ message: "Project status updated.", post: updated });
};

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTRIBUTIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * PATCH /posts/:postId/contribute
 *
 * Records contributions as PENDING. Progress totals do not move here.
 *
 * They used to: every contribution incremented `currentAmount` / `currentCount`
 * the instant the row was created, even with `status: "Pending"`. Any donor
 * could therefore drive a project's fundraising bar to its goal without giving
 * anything, and the organization had no say. Totals now move only when the
 * receiving organization confirms — see decideContribution below. [2.2.3]
 */
export const addContribution = async (req, res) => {
  const { postId } = req.params;
  const { monetary = [], inKind = [], volunteer = [] } = req.body;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { inKindItems: true, supportOptions: true },
  });

  assertPostAcceptsContributions(post);

  // An organization logging a walk-in donation may only do so on its own
  // project. Donors may contribute to any approved project.
  if (req.user.role === "ngo" && post.orgId !== req.user.id) {
    throw notFound();
  }

  // Validate every entry against the project's real support options BEFORE
  // writing any of them, so a partly-valid submission is rejected whole rather
  // than half-applied.
  for (const entry of monetary) {
    assertContributionAllowed(post, { type: "Monetary", amount: entry.amount });
  }
  for (const entry of inKind) {
    assertContributionAllowed(post, {
      type: "InKind",
      itemId: entry.itemId,
      quantity: entry.quantity,
    });
  }
  for (const entry of volunteer) {
    assertContributionAllowed(post, { type: "Volunteer", count: entry.count });
  }

  // Identity comes from the session. `donorId` in the request body is ignored.
  let partnershipId = null;
  let sessionDonorName = "Anonymous";

  if (req.user.role === "donor") {
    const donor = await prisma.donor.findUnique({ where: { id: req.user.id } });
    if (!donor) throw notFound();
    sessionDonorName = `${donor.firstName} ${donor.lastName}`.trim();

    const partnership = await prisma.donorOrganizationPartner.upsert({
      where: { donorId_orgId: { donorId: donor.id, orgId: post.orgId } },
      update: {},
      create: { donorId: donor.id, orgId: post.orgId },
    });
    partnershipId = partnership.id;
  }

  const proof = req.file
    ? {
        proofFileName: req.file.originalname,
        proofFilePath: req.file.path,
        proofMimeType: req.file.mimetype,
        proofFileSize: req.file.size,
      }
    : {};

  /**
   * An organization recording a walk-in donation is itself the confirming
   * party, so those are Confirmed on creation. A donor's own claim is Pending
   * until the organization agrees.
   */
  const status = req.user.role === "ngo" ? "Confirmed" : "Pending";
  const now = new Date();

  const rows = [
    ...monetary.map((entry) => ({
      donorName: req.user.role === "donor" ? sessionDonorName : entry.donorName,
      partnershipId,
      postId,
      type: "Monetary",
      amount: entry.amount,
      status,
      ...(status === "Confirmed" ? { statusChangedAt: now, statusChangedBy: req.user.id } : {}),
      ...proof,
    })),
    ...inKind.map((entry) => ({
      donorName: req.user.role === "donor" ? sessionDonorName : entry.donorName,
      partnershipId,
      postId,
      type: "InKind",
      inKindItemId: entry.itemId,
      quantity: entry.quantity,
      status,
      ...(status === "Confirmed" ? { statusChangedAt: now, statusChangedBy: req.user.id } : {}),
      ...proof,
    })),
    ...volunteer.map((entry) => ({
      donorName: req.user.role === "donor" ? sessionDonorName : entry.donorName,
      partnershipId,
      postId,
      type: "Volunteer",
      volunteerCount: entry.count,
      status,
      ...(status === "Confirmed" ? { statusChangedAt: now, statusChangedBy: req.user.id } : {}),
      ...proof,
    })),
  ];

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const created = await tx.contribution.create({ data: row });
      if (status === "Confirmed") await applyContributionToTotals(tx, created);
    }
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.CONTRIBUTION_CREATED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `${rows.length} contribution(s) recorded as ${status.toLowerCase()}.`,
    targetType: "Post",
    targetId: postId,
    metadata: { count: rows.length, status },
  });

  const finalPost = await prisma.post.findUnique({
    where: { id: postId },
    include: POST_INCLUDE,
  });

  res.json({
    message:
      status === "Pending"
        ? "Thank you. Your contribution has been sent to the organization for confirmation."
        : "Contribution recorded.",
    post: formatPost(finalPost),
  });
};

/**
 * Move a confirmed contribution into the project's running totals.
 * Called only from inside a transaction, only once per contribution.
 */
const applyContributionToTotals = async (tx, contribution) => {
  if (contribution.type === "Monetary") {
    await tx.postSupportOption.updateMany({
      where: { postId: contribution.postId, type: "Monetary" },
      data: { currentAmount: { increment: contribution.amount ?? 0 } },
    });
  } else if (contribution.type === "Volunteer") {
    await tx.postSupportOption.updateMany({
      where: { postId: contribution.postId, type: "Volunteer" },
      data: { currentCount: { increment: contribution.volunteerCount ?? 0 } },
    });
  } else if (contribution.type === "InKind" && contribution.inKindItemId) {
    await tx.postInKindItem.update({
      where: { id: contribution.inKindItemId },
      data: { currentQuantity: { increment: contribution.quantity ?? 0 } },
    });
  }
};

/**
 * PATCH /posts/contributions/:contributionId/status
 *
 * The organization that received a contribution confirms or declines it. This
 * is the only path that moves a project's progress totals, and it is one-way:
 * a decided contribution cannot be decided again, which is what prevents
 * double-counting.
 */
export const decideContribution = async (req, res) => {
  const contribution = req.resource; // loaded and ownership-checked upstream
  const { status } = req.body;

  assertContributionTransition(contribution.status, status);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.contribution.update({
      where: { id: contribution.id },
      data: { status, statusChangedAt: new Date(), statusChangedBy: req.user.id },
    });
    if (status === "Confirmed") await applyContributionToTotals(tx, updated);
  });

  await logSecurityEvent(req, {
    eventType: status === "Confirmed" ? EVENTS.CONTRIBUTION_CONFIRMED : EVENTS.CONTRIBUTION_DECLINED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Contribution ${status.toLowerCase()} by the receiving organization.`,
    targetType: "Contribution",
    targetId: contribution.id,
    metadata: { postId: contribution.postId, type: contribution.type },
  });

  res.json({ message: `Contribution ${status.toLowerCase()}.` });
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PARTNERSHIPS
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Earliest moment each project's monetary goal was met, per project. */
const goalReachedAtMap = (postsById, monetaryContributions) => {
  const reachedAt = {};
  const running = {};

  for (const contribution of monetaryContributions) {
    const post = postsById[contribution.postId];
    const monetary = post?.supportTypes?.monetary;
    if (!monetary?.enabled || !(monetary.targetAmount > 0)) continue;

    running[contribution.postId] = (running[contribution.postId] ?? 0) + (contribution.amount ?? 0);
    if (!reachedAt[contribution.postId] && running[contribution.postId] >= monetary.targetAmount) {
      reachedAt[contribution.postId] = contribution.createdAt;
    }
  }
  return reachedAt;
};

/** GET /posts/partnerships/me — the signed-in donor's partnerships. */
export const getMyDonorPartnerships = async (req, res) => {
  const partnerships = await prisma.donorOrganizationPartner.findMany({
    where: { donorId: req.user.id },
    include: {
      organization: { select: { id: true, orgName: true, email: true, country: true } },
      contributions: {
        orderBy: { createdAt: "desc" },
        include: { post: { include: POST_INCLUDE } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const postsById = {};
  const monetaryCountByPost = {};

  const result = partnerships.map((partnership) => {
    const projects = [];
    const seen = new Set();

    for (const contribution of partnership.contributions) {
      if (contribution.type === "Monetary" && contribution.postId) {
        monetaryCountByPost[contribution.postId] = (monetaryCountByPost[contribution.postId] ?? 0) + 1;
      }
      const post = contribution.post;
      if (!post || seen.has(post.id)) continue;
      seen.add(post.id);
      const formatted = formatPost(post);
      postsById[formatted.id] = formatted;
      projects.push(formatted);
    }

    return {
      id: partnership.id,
      createdAt: partnership.createdAt,
      status: partnership.status,
      organization: partnership.organization,
      projects,
      totalContributions: partnership.contributions.length,
    };
  });

  const postIds = Object.keys(postsById);
  if (postIds.length > 0) {
    const monetaryContributions = await prisma.contribution.findMany({
      where: { postId: { in: postIds }, type: "Monetary", status: "Confirmed" },
      select: { postId: true, amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const reachedAt = goalReachedAtMap(postsById, monetaryContributions);

    for (const partnership of result) {
      partnership.projects = partnership.projects.map((project) => {
        const monetary = project.supportTypes?.monetary;
        const hasGoal = monetary?.enabled && (monetary.targetAmount ?? 0) > 0;
        const donorGave = (monetaryCountByPost[project.id] ?? 0) > 0;
        if (!hasGoal || !donorGave) return { ...project, fundraisingUpdate: null };

        const goalMet = (monetary.currentAmount ?? 0) >= (monetary.targetAmount ?? 0);
        return {
          ...project,
          fundraisingUpdate: {
            goalMet,
            targetAmount: monetary.targetAmount,
            currentAmount: monetary.currentAmount,
            reachedAt: goalMet ? (reachedAt[project.id] ?? null) : null,
            message: goalMet
              ? "Fundraising goal reached. Thank you for helping this project succeed."
              : "Fundraising is still in progress.",
          },
        };
      });
    }
  }

  res.json(result);
};

/** GET /posts/partnerships/incoming — an organization's donor partnerships. */
export const getOrgPartnershipOffers = async (req, res) => {
  const partnerships = await prisma.donorOrganizationPartner.findMany({
    where: { orgId: req.user.id },
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          affiliation: true,
          bio: true,
        },
      },
      contributions: {
        include: {
          post: { select: { id: true, projectName: true, priority: true, causes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const offers = partnerships.flatMap((partnership) => {
    const byPost = {};
    for (const contribution of partnership.contributions) {
      if (!contribution.postId) continue;
      (byPost[contribution.postId] ??= []).push(contribution);
    }

    const donorProjects = [...
      new Map(partnership.contributions.map((c) => [c.postId, c.post])).values()
    ].filter(Boolean);

    return Object.entries(byPost).map(([postId, contributions]) => {
      const post = contributions[0]?.post;
      const donor = partnership.donor;

      const totalAmount = contributions
        .filter((c) => c.type === "Monetary")
        .reduce((sum, c) => sum + (c.amount ?? 0), 0);
      const volunteerCount = contributions
        .filter((c) => c.type === "Volunteer")
        .reduce((sum, c) => sum + (c.volunteerCount ?? 0), 0);

      return {
        id: `${partnership.id}-${postId}`,
        companyName: `${donor.firstName} ${donor.lastName}`.trim(),
        sector: donor.country || "International",
        supportFocus: [...new Set(contributions.map((c) => c.type))].join(", ") || "Various Support",
        annualBudget: "N/A",
        certifications: [],
        projectId: postId,
        projectName: post?.projectName || "Unknown Project",
        projectPriority: post?.priority || "Medium",
        proposedValue:
          totalAmount > 0 ? `PHP ${totalAmount.toLocaleString("en-PH")}` : "In-Kind Support",
        volunteerHours: volunteerCount,
        status: partnership.status,
        partnershipId: partnership.id,
        donorId: donor.id,
        donorEmail: donor.email,
        donorAffiliation: donor.affiliation || "",
        donorBio: donor.bio || "",
        donorProjects,
        createdAt: partnership.createdAt,
      };
    });
  });

  res.json(offers);
};
