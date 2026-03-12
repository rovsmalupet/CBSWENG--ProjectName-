import prisma from "../prisma/client.js";

// HELPERS

/*
 * formatPost: Transforms a raw Prisma post object into the shape the frontend expects.
* buildPostData: Parses the request body into structured data ready for Prisma.
 */
const formatPost = (post) => {
  const monetary = post.supportOptions?.find((o) => o.type === "Monetary");
  const volunteer = post.supportOptions?.find((o) => o.type === "Volunteer");
  return {
    // Copy all original post fields first (id, projectName, causes, etc.)
    ...post,

    orgName: post.organization?.orgName ?? null,
    orgEmail: post.organization?.email ?? null,
    orgRepresentative: post.organization?.representativePerson ?? null,
    organization: undefined,

    // Build the supportTypes object the frontend expects
    supportTypes: {
      // If a Monetary row exists in supportOptions, populate its fields
      // Otherwise return { enabled: false } to signal it's not active
      monetary: monetary
        ? {
            enabled: true,
            targetAmount: monetary.targetAmount,   // Float — e.g. 50000.00
            currentAmount: monetary.currentAmount, // Float — e.g. 12000.50
            status: monetary.status,               // "Open" or "Closed"
          }
        : { enabled: false },

      // Do the same with volunteer
      volunteer: volunteer
        ? {
            enabled: true,
            targetVolunteers: volunteer.targetCount,   // Int — e.g. 20
            currentVolunteers: volunteer.currentCount, // Int — e.g. 8
            status: volunteer.status,
          }
        : { enabled: false },

      inKind: post.inKindItems ?? [],
    },

    supportOptions: undefined,
    inKindItems: undefined,
  };
};

const buildPostData = (body) => {
  const {
    projectName,
    description,
    causes,
    location,
    priority,
    supportTypes,
    startDate,
    endDate,
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
    causes: causes ?? [],
    location,
    priority,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,

    // Map inKind array from request body
    inKindItems: inKind.map((i) => ({
      itemName: i.itemName,
      targetQuantity: i.targetQuantity,
      unit: i.unit ?? null,
    })),
    supportOptionsData,
  };
};

// CONTROLLERS

/*
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
        orgId: "tempID",          // placeholder
        overallStatus: "Pending",

        inKindItems: { create: inKindItems },
        supportOptions: { create: supportOptionsData },
      },
      include: { inKindItems: true, supportOptions: true },
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

/*
 * GET /posts
 * Returns all posts (for admin use)
 */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { inKindItems: true, supportOptions: true, organization: true },
    });
    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/*
 * GET /posts/org
 * Returns all non-deleted posts for the current organization.
 */
export const getOrgPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        orgId: "tempID",
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

/*
 * GET /posts/approved
 * Returns only approved posts (for donor homepage)
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

/*
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

/*
 * PUT /posts/:postId
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
      include: { inKindItems: true, supportOptions: true },
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

/*
 * DELETE /posts/:postId (soft delete)
 * Sets overallStatus to "Deleted"
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

/*
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

/*
 * PATCH /posts/:postId/status
 * Updates only the overallStatus field of a post (e.g. Approve or Unapprove).
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
 * Increments currentAmount/currentCount for support options and inKind items.
 */
export const addContribution = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      monetaryDelta = 0,
      inKindDeltas = [],
      volunteerDelta = 0,
    } = req.body;

    // Fetch post with all relations so we can read current values
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { inKindItems: true, supportOptions: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const monetary = post.supportOptions?.find((o) => o.type === "Monetary");
    const volunteer = post.supportOptions?.find((o) => o.type === "Volunteer");

    if (monetaryDelta > 0 && monetary) {
      await prisma.postSupportOption.update({
        where: { id: monetary.id },
        data: { currentAmount: monetary.currentAmount + monetaryDelta },
      });
    }

    if (volunteerDelta > 0 && volunteer) {
      await prisma.postSupportOption.update({
        where: { id: volunteer.id },
        data: { currentCount: volunteer.currentCount + Math.round(volunteerDelta) },
      });
    }

    for (const { itemId, quantityDelta } of inKindDeltas) {
      if (!quantityDelta || quantityDelta <= 0) continue;

      const item = post.inKindItems.find((i) => i.id === itemId);
      if (item) {
        await prisma.postInKindItem.update({
          where: { id: itemId },
          data: { currentQuantity: item.currentQuantity + quantityDelta },
        });
      }
    }

    // Re-fetch the updated post so the response reflects all changes
    const finalPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { inKindItems: true, supportOptions: true },
    });

    res.json({
      message: "Contribution recorded successfully",
      post: formatPost(finalPost),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};