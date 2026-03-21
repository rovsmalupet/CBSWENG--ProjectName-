import prisma from "../prisma/client.js";

// HELPERS

const DEFAULT_BUDGET_BREAKDOWN = [
  { label: "Food", percentage: 80 },
  { label: "Logistics", percentage: 10 },
  { label: "Operations", percentage: 10 },
];

const normalizeBudgetBreakdown = (rawBudgetBreakdown) => {
  if (!rawBudgetBreakdown) {
    return DEFAULT_BUDGET_BREAKDOWN;
  }

  let parsed = rawBudgetBreakdown;
  if (typeof rawBudgetBreakdown === "string") {
    try {
      parsed = JSON.parse(rawBudgetBreakdown);
    } catch {
      return DEFAULT_BUDGET_BREAKDOWN;
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return DEFAULT_BUDGET_BREAKDOWN;
  }

  const cleaned = parsed
    .map((item) => ({
      label: String(item?.label || "Category").trim(),
      percentage: Number(item?.percentage ?? 0),
    }))
    .filter((item) => item.label && item.percentage > 0);

  if (cleaned.length === 0) {
    return DEFAULT_BUDGET_BREAKDOWN;
  }

  const total = cleaned.reduce((sum, item) => sum + item.percentage, 0);
  if (total <= 0) {
    return DEFAULT_BUDGET_BREAKDOWN;
  }

  let assigned = 0;
  return cleaned.map((item, index) => {
    if (index === cleaned.length - 1) {
      return { ...item, percentage: Math.max(0, 100 - assigned) };
    }
    const value = Math.round((item.percentage / total) * 100);
    assigned += value;
    return { ...item, percentage: value };
  });
};

/**
 * formatPost: Transforms a raw Prisma post object into the shape the frontend expects.
 * Reads support types from PostSupportOption rows and inKindItems.
 */
const formatPost = (post) => {
  const monetary = post.supportOptions?.find((o) => o.type === "Monetary");
  const volunteer = post.supportOptions?.find((o) => o.type === "Volunteer");

  return {
    ...post,
    orgName: post.organization?.orgName ?? null,
    orgEmail: post.organization?.email ?? null,
    orgCountry: post.organization?.country ?? null,
    orgIsVerified: post.organization?.isVerified ?? false,
    orgRepresentative:
      post.organization?.firstName && post.organization?.surname
        ? `${post.organization.firstName} ${post.organization.surname}`
        : null,
    budgetBreakdown: normalizeBudgetBreakdown(post.budgetBreakdown),
    organization: undefined,
    supportTypes: {
      monetary: monetary
        ? {
            enabled: true,
            targetAmount: monetary.targetAmount,
            currentAmount: monetary.currentAmount,
            status: monetary.status,
          }
        : { enabled: false },
      volunteer: volunteer
        ? {
            enabled: true,
            targetVolunteers: volunteer.targetCount,
            currentVolunteers: volunteer.currentCount,
            status: volunteer.status,
          }
        : { enabled: false },
      inKind: post.inKindItems ?? [],
    },
    supportOptions: undefined,
    inKindItems: undefined,
  };
};

/**
 * Builds a quick lookup for the first time each post reached its monetary target.
 * Returns: { [postId]: Date | null }
 */
const getMonetaryGoalReachedAtMap = (postsById, monetaryContributions) => {
  const reachedAtMap = {};
  const runningTotals = {};

  for (const contribution of monetaryContributions) {
    const post = postsById[contribution.postId];
    if (!post) continue;

    const monetary = post.supportTypes?.monetary;
    if (!monetary?.enabled || !monetary.targetAmount || monetary.targetAmount <= 0) {
      continue;
    }

    runningTotals[contribution.postId] =
      (runningTotals[contribution.postId] ?? 0) + (contribution.amount ?? 0);

    if (!reachedAtMap[contribution.postId] && runningTotals[contribution.postId] >= monetary.targetAmount) {
      reachedAtMap[contribution.postId] = contribution.createdAt;
    }
  }

  return reachedAtMap;
};

/**
 * buildPostData: Parses the request body into structured data ready for Prisma.
 */
const buildPostData = (body) => {
  const {
    projectName,
    description,
    budgetBreakdown,
    causes,
    location,
    priority,
    supportTypes,
    startDate,
    endDate,
    startTime,
    endTime,
  } = body;

  const monetary = supportTypes?.monetary;
  const volunteer = supportTypes?.volunteer;
  const inKind = supportTypes?.inKind ?? [];
  const supportOptionsData = [];

  if (monetary?.enabled) {
    supportOptionsData.push({
      type: "Monetary",
      targetAmount: monetary.targetAmount ?? 0,
      currentAmount: 0,
    });
  }

  if (volunteer?.enabled) {
    supportOptionsData.push({
      type: "Volunteer",
      targetCount: volunteer.targetVolunteers ?? 0,
      currentCount: 0,
    });
  }

  return {
    projectName,
    description,
    budgetBreakdown: normalizeBudgetBreakdown(budgetBreakdown),
    causes: causes ?? [],
    location,
    priority,
    startDate: startDate || null,
    endDate: endDate || null,
    startTime: startTime || null,
    endTime: endTime || null,
    inKindItems: inKind.map((i) => ({
      itemName: i.itemName,
      targetQuantity: i.targetQuantity,
      unit: i.unit ?? null,
    })),
    supportOptionsData,
  };
};

// CONTROLLERS

/**
 * POST /posts
 * Creates a new post with nested inKindItems and supportOptions.
 */
export const createPost = async (req, res) => {
  try {
    const { projectName, causes } = req.body;

    if (!projectName || !causes?.length) {
      return res
        .status(400)
        .json({ error: "projectName and at least one cause are required" });
    }

    const data = buildPostData(req.body);
    const { inKindItems, supportOptionsData, ...postFields } = data;

    const post = await prisma.post.create({
      data: {
        ...postFields,
        orgId: req.user.id,
        overallStatus: "Pending",
        inKindItems: { create: inKindItems },
        supportOptions: { create: supportOptionsData },
      },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });

    res.status(201).json({
      message: "Project posted successfully",
      post: formatPost(post),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/admin/all
 * Returns all posts (for admin use), including the most recent audit log entry.
 */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        inKindItems: true,
        supportOptions: true,
        organization: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { admin: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    res.json(posts.map((post) => ({
      ...formatPost(post),
      lastAudit: post.auditLogs[0] ?? null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/:postId/audit
 * Returns the full audit log for a single post.
 */
export const getPostAuditLog = async (req, res) => {
  try {
    const logs = await prisma.postAuditLog.findMany({
      where: { postId: req.params.postId },
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { firstName: true, lastName: true } },
      },
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts
 * Returns all non-deleted posts for the current organization.
 */
export const getOrgPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        orgId: req.user.id,
        NOT: { overallStatus: "Deleted" },
      },
      orderBy: { createdAt: "desc" },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });
    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/approved
 * Returns only approved posts (for donor homepage). Public route.
 */
export const getApprovedPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { overallStatus: "Approved" },
      orderBy: { createdAt: "desc" },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });
    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/:postId
 * Returns a single post by its ID.
 */
export const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(formatPost(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /posts/:postId
 * Updates a post and replaces its support options and in-kind items.
 */
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const data = buildPostData(req.body);
    const { inKindItems, supportOptionsData, ...postFields } = data;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...postFields,
        overallStatus: req.body.overallStatus || "Edited",
        inKindItems: {
          deleteMany: {},
          create: inKindItems,
        },
        supportOptions: {
          deleteMany: {},
          create: supportOptionsData,
        },
      },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });

    res.json({ message: "Post updated successfully", post: formatPost(updated) });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /posts/:postId (soft delete)
 * Sets overallStatus to "Deleted".
 */
export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.postId },
      data: { overallStatus: "Deleted" },
    });
    res.json({ message: "Post marked as deleted", post });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /posts/:postId/permanent
 * Permanently removes the post and all related rows from the database.
 */
export const permanentDeletePost = async (req, res) => {
  try {
    const post = await prisma.post.delete({
      where: { id: req.params.postId },
    });
    res.json({ message: "Post permanently deleted", post });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /posts/:postId/status
 * Updates only the overallStatus field of a post and logs the action.
 */
export const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { overallStatus } = req.body;

    const validStatuses = ["Pending", "Approved", "Unapproved", "Edited", "Deleted"];
    if (!validStatuses.includes(overallStatus)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { overallStatus },
    });

    // Log the action to the audit trail
    await prisma.postAuditLog.create({
      data: {
        postId,
        adminId: req.user.id,
        action: overallStatus,
      },
    });

    res.json({ message: "Status updated successfully", post: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /posts/:postId/contribute
 * Creates Contribution records (status: Confirmed) for each donation entry
 * and updates the current amounts/counts on the post's support options.
 *
 * Body shape:
 * {
 *   monetary: [{ donorName, amount }],
 *   inKind:   [{ donorName, itemId, quantity }],
 *   volunteer:[{ donorName, count }],
 * }
 */
export const addContribution = async (req, res) => {
  try {
    const { postId } = req.params;
    let { monetary = [], inKind = [], volunteer = [] } = req.body;

    // When donor uploads proof via FormData, arrays arrive as JSON strings.
    if (typeof monetary === "string") monetary = JSON.parse(monetary || "[]");
    if (typeof inKind === "string") inKind = JSON.parse(inKind || "[]");
    if (typeof volunteer === "string") volunteer = JSON.parse(volunteer || "[]");

    // Fetch post with support options and in-kind items
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { inKindItems: true, supportOptions: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    let partnershipId = null;
    let donorName = "Anonymous";

    // registered donors create/maintain an org partnership when they contribute.
    if (req.user?.role === "donor") {
      const donor = await prisma.donor.findUnique({ where: { id: req.user.id } });
      if (donor) {
        donorName = `${donor.firstName} ${donor.lastName}`.trim();
        const partnership = await prisma.donorOrganizationPartner.upsert({
          where: {
            donorId_orgId: {
              donorId: donor.id,
              orgId: post.orgId,
            },
          },
          update: {},
          create: {
            donorId: donor.id,
            orgId: post.orgId,
          },
        });
        partnershipId = partnership.id;
      }
    }

    const monetaryOption = post.supportOptions.find((o) => o.type === "Monetary");
    const volunteerOption = post.supportOptions.find((o) => o.type === "Volunteer");

    const proofData = req.file
      ? {
          proofFileName: req.file.originalname,
          proofFilePath: req.file.path,
          proofMimeType: req.file.mimetype,
          proofFileSize: req.file.size,
        }
      : {};

    // ── Create Contribution records and update totals ──────────────────────

    // Monetary
    for (const entry of monetary) {
      if (!entry.amount || entry.amount <= 0) continue;
      await prisma.contribution.create({
        data: {
          donorName: entry.donorName || donorName,
          partnershipId,
          postId,
          type: "Monetary",
          amount: parseFloat(entry.amount),
          ...proofData,
          status: "Confirmed",
        },
      });
      if (monetaryOption) {
        await prisma.postSupportOption.update({
          where: { id: monetaryOption.id },
          data: { currentAmount: { increment: parseFloat(entry.amount) } },
        });
      }
    }

    // In-Kind
    for (const entry of inKind) {
      if (!entry.quantity || entry.quantity <= 0) continue;
      await prisma.contribution.create({
        data: {
          donorName: entry.donorName || donorName,
          partnershipId,
          postId,
          type: "InKind",
          inKindItemId: entry.itemId,
          quantity: parseFloat(entry.quantity),
          ...proofData,
          status: "Confirmed",
        },
      });
      await prisma.postInKindItem.update({
        where: { id: entry.itemId },
        data: { currentQuantity: { increment: parseFloat(entry.quantity) } },
      });
    }

    // Volunteer
    for (const entry of volunteer) {
      if (!entry.count || entry.count <= 0) continue;
      await prisma.contribution.create({
        data: {
          donorName: entry.donorName || donorName,
          partnershipId,
          postId,
          type: "Volunteer",
          volunteerCount: Math.round(entry.count),
          ...proofData,
          status: "Confirmed",
        },
      });
      if (volunteerOption) {
        await prisma.postSupportOption.update({
          where: { id: volunteerOption.id },
          data: { currentCount: { increment: Math.round(entry.count) } },
        });
      }
    }

    // Re-fetch updated post
    const finalPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });

    res.json({
      message: "Contributions recorded successfully",
      post: formatPost(finalPost),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/partnerships/me
 * Returns all current partnerships for the logged-in donor with project snapshots. :DDD
 */
export const getMyDonorPartnerships = async (req, res) => {
  try {
    const partnerships = await prisma.donorOrganizationPartner.findMany({
      where: { donorId: req.user.id },
      include: {
        organization: {
          select: {
            id: true,
            orgName: true,
            email: true,
            country: true,
          },
        },
        contributions: {
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              include: {
                supportOptions: true,
                inKindItems: true,
                organization: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const postsById = {};
    const partnershipMonetaryContributionsByPost = {};

    const result = partnerships.map((partnership) => {
      const uniquePosts = [];
      const seenPostIds = new Set();

      for (const contribution of partnership.contributions) {
        if (contribution.type !== "Monetary" || !contribution.postId) continue;
        partnershipMonetaryContributionsByPost[contribution.postId] =
          (partnershipMonetaryContributionsByPost[contribution.postId] ?? 0) + 1;
      }

      for (const contribution of partnership.contributions) {
        const post = contribution.post;
        if (!post || seenPostIds.has(post.id)) continue;
        seenPostIds.add(post.id);

        const formattedPost = formatPost(post);
        postsById[formattedPost.id] = formattedPost;
        uniquePosts.push(formattedPost);
      }

      return {
        id: partnership.id,
        createdAt: partnership.createdAt,
        organization: partnership.organization,
        projects: uniquePosts,
        totalContributions: partnership.contributions.length,
      };
    });

    const postIds = Object.keys(postsById);
    if (postIds.length > 0) {
      const monetaryContributions = await prisma.contribution.findMany({
        where: {
          postId: { in: postIds },
          type: "Monetary",
          status: "Confirmed",
        },
        select: {
          postId: true,
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const reachedAtMap = getMonetaryGoalReachedAtMap(postsById, monetaryContributions);

      for (const partnership of result) {
        partnership.projects = (partnership.projects || []).map((project) => {
          const monetary = project.supportTypes?.monetary;
          const hasMonetaryGoal = monetary?.enabled && (monetary.targetAmount ?? 0) > 0;
          const donorContributedMonetary = (partnershipMonetaryContributionsByPost[project.id] ?? 0) > 0;

          if (!hasMonetaryGoal || !donorContributedMonetary) {
            return {
              ...project,
              fundraisingUpdate: null,
            };
          }

          const targetAmount = monetary.targetAmount ?? 0;
          const currentAmount = monetary.currentAmount ?? 0;
          const goalMet = currentAmount >= targetAmount;

          return {
            ...project,
            fundraisingUpdate: {
              goalMet,
              targetAmount,
              currentAmount,
              reachedAt: goalMet ? reachedAtMap[project.id] ?? null : null,
              message: goalMet
                ? "Fundraising goal reached. Thank you for helping this project succeed."
                : "Fundraising is still in progress.",
            },
          };
        });
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /posts/organization/partnership-offers
 * Returns all partnership offers (DonorOrganizationPartner entries) for the org.
 * Used by organizations to view incoming partnership proposals from donors.
 */
export const getOrgPartnershipOffers = async (req, res) => {
  try {
    const orgId = req.user.id;

    const partnerships = await prisma.donorOrganizationPartner.findMany({
      where: { orgId },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
          },
        },
        contributions: {
          include: {
            post: {
              select: {
                id: true,
                projectName: true,
                priority: true,
                causes: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform partnerships into partnership offers format
    const offers = partnerships.flatMap((partnership) => {
      // Group contributions by post to create one offer per post
      const postContributions = {};

      for (const contribution of partnership.contributions) {
        if (!contribution.postId) continue;
        if (!postContributions[contribution.postId]) {
          postContributions[contribution.postId] = [];
        }
        postContributions[contribution.postId].push(contribution);
      }

      // Create an offer for each post
      return Object.entries(postContributions).map(([postId, contributions]) => {
        const post = contributions[0]?.post;
        const donor = partnership.donor;

        // Calculate total contribution value
        const totalAmount = contributions
          .filter((c) => c.type === "Monetary" && c.amount)
          .reduce((sum, c) => sum + (c.amount ?? 0), 0);

        const volunteerCount = contributions
          .filter((c) => c.type === "Volunteer" && c.volunteerCount)
          .reduce((sum, c) => sum + (c.volunteerCount ?? 0), 0);

        // Determine support focus based on contribution types
        const supportTypes = new Set(contributions.map((c) => c.type));
        const supportFocus = Array.from(supportTypes).join(", ");

        return {
          id: `${partnership.id}-${postId}`,
          companyName: `${donor.firstName} ${donor.lastName}`.trim(),
          sector: donor.country || "International",
          supportFocus: supportFocus || "Various Support",
          annualBudget: "N/A",
          certifications: [],
          projectId: postId,
          projectName: post?.projectName || "Unknown Project",
          projectPriority: post?.priority || "Medium",
          proposedValue: totalAmount > 0 ? `PHP ${totalAmount.toLocaleString("en-PH")}` : "In-Kind Support",
          volunteerHours: volunteerCount,
          status: "pending",
          partnershipId: partnership.id,
          donorId: donor.id,
          donorEmail: donor.email,
          createdAt: partnership.createdAt,
        };
      });
    });

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};