import Post from "../models/posts.js";

// Create a new project (sprint-friendly)
export const createPost = async (req, res) => {
  try {
    const {
      projectName,
      description,
      category,
      cause,
      location,
      impactGoals,
      priority,
      supportTypes,
    } = req.body;

    if (!projectName || !cause) {
      return res
        .status(400)
        .json({ error: "projectName and cause are required" });
    }

    // SPRINT: fixed orgId for testing
    const orgId = "tempID";

    const newPost = new Post({
      orgId,
      projectName,
      description,
      category,
      cause,
      location,
      impactGoals,
      priority,
      supportTypes: {
        monetary: supportTypes?.monetary?.enabled
          ? { enabled: true, targetAmount: supportTypes.monetary.targetAmount || 0 }
          : { enabled: false },
        inKind: supportTypes?.inKind?.length
          ? supportTypes.inKind.map((i) => ({
              itemName: i.itemName,
              targetQuantity: i.targetQuantity,
              unit: i.unit,
            }))
          : [],
        volunteer: supportTypes?.volunteer?.enabled
          ? { enabled: true, targetVolunteers: supportTypes.volunteer.targetVolunteers || 0 }
          : { enabled: false },
      },
      overallStatus: "Published",
    });

    await newPost.save();
    res.status(201).json({ message: "Project posted successfully", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all posts for sprint orgId
export const getOrgPosts = async (req, res) => {
  try {
    // SPRINT: always fetch orgId="tempID"
    const posts = await Post.find({ orgId: "tempID" }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get single post by ID (for edit)
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update a post (edit)
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      projectName,
      description,
      category,
      cause,
      location,
      impactGoals,
      priority,
      supportTypes,
    } = req.body;

    const updated = await Post.findByIdAndUpdate(
      postId,
      {
        projectName,
        description,
        category,
        cause,
        location,
        impactGoals,
        priority,
        supportTypes: {
          monetary: supportTypes?.monetary?.enabled
            ? { enabled: true, targetAmount: supportTypes.monetary.targetAmount || 0 }
            : { enabled: false },
          inKind: supportTypes?.inKind?.length
            ? supportTypes.inKind.map((i) => ({
                itemName: i.itemName,
                targetQuantity: i.targetQuantity,
                unit: i.unit,
              }))
            : [],
          volunteer: supportTypes?.volunteer?.enabled
            ? { enabled: true, targetVolunteers: supportTypes.volunteer.targetVolunteers || 0 }
            : { enabled: false },
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post updated successfully", post: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted successfully", post: deletedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};