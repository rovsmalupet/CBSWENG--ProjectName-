import prisma from "../prisma/client.js";

const formatPost = (post) => ({
  ...post,
  supportTypes: {
    monetary: {
      enabled: post.monetaryEnabled,
      targetAmount: post.monetaryTargetAmount,
      currentAmount: post.monetaryCurrentAmount,
      status: post.monetaryStatus,
    },
    inKind: post.inKindItems ?? [],
    volunteer: {
      enabled: post.volunteerEnabled,
      targetVolunteers: post.volunteerTargetCount,
      currentVolunteers: post.volunteerCurrentCount,
      status: post.volunteerStatus,
    },
  },
  monetaryEnabled: undefined,
  monetaryTargetAmount: undefined,
  monetaryCurrentAmount: undefined,
  monetaryStatus: undefined,
  volunteerEnabled: undefined,
  volunteerTargetCount: undefined,
  volunteerCurrentCount: undefined,
  volunteerStatus: undefined,
  inKindItems: undefined,
});

const buildPostData = (body) => {
  const {
    projectName,
    description,
    category,
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

  return {
    projectName,
    description,
    category,
    causes: causes ?? [],
    location,
    priority,
    startDate: startDate || null,
    endDate: endDate || null,
    startTime: startTime || null,
    endTime: endTime || null,
    monetaryEnabled: monetary?.enabled ?? false,
    monetaryTargetAmount: monetary?.enabled ? (monetary.targetAmount ?? 0) : null,
    volunteerEnabled: volunteer?.enabled ?? false,
    volunteerTargetCount: volunteer?.enabled ? (volunteer.targetVolunteers ?? 0) : null,
    inKindItems: inKind.map((i) => ({
      itemName: i.itemName,
      targetQuantity: i.targetQuantity,
      unit: i.unit ?? null,
    })),
  };
};

export const createPost = async (req, res) => {
  try {
    const { projectName, causes } = req.body;
    if (!projectName || !causes?.length) {
      return res.status(400).json({ error: "projectName and at least one cause are required" });
    }

    const data = buildPostData(req.body);
    const { inKindItems, ...postFields } = data;

    const post = await prisma.post.create({
      data: {
        ...postFields,
        orgId: "tempID",
        overallStatus: "Published",
        inKindItems: { create: inKindItems },
      },
      include: { inKindItems: true },
    });

    res.status(201).json({ message: "Project posted successfully", post: formatPost(post) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrgPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { orgId: "tempID" },
      orderBy: { createdAt: "desc" },
      include: { inKindItems: true },
    });
    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
      include: { inKindItems: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(formatPost(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const data = buildPostData(req.body);
    const { inKindItems, ...postFields } = data;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...postFields,
        inKindItems: {
          deleteMany: {},
          create: inKindItems,
        },
      },
      include: { inKindItems: true },
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

export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.delete({
      where: { id: req.params.postId },
    });
    res.json({ message: "Post deleted successfully", post });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};