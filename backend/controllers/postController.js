import Post from "../models/posts.js";

// Create a new project/post (sprint-friendly)
export const createPost = async (req, res) => {
  try {
    const {
      projectName,
      description,
      category,
      cause,
      location,
      impactGoals,
      supportTypes
    } = req.body;

    if (!projectName || !cause) {
      return res.status(400).json({ error: "projectName and cause are required" });
    }

    const orgId = req.user?._id || "tempID";

    const newPost = new Post({
      orgId,
      projectName,
      description,
      category,
      cause,
      location,
      impactGoals,
      supportTypes: {
        monetary: supportTypes?.monetary?.enabled
          ? {
              enabled: true,
              targetAmount: supportTypes.monetary.targetAmount || 0
            }
          : { enabled: false },

        inKind: supportTypes?.inKind?.length
          ? supportTypes.inKind.map(item => ({
              itemName: item.itemName,
              targetQuantity: item.targetQuantity,
              unit: item.unit
            }))
          : [],

        volunteer: supportTypes?.volunteer?.enabled
          ? {
              enabled: true,
              targetVolunteers: supportTypes.volunteer.targetVolunteers || 0
            }
          : { enabled: false }
      },

      overallStatus: "Published" // default to published on creation
    });

    await newPost.save();
    res.status(201).json({ message: "Project posted successfully", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all posts for an organization
export const getOrgPosts = async (req, res) => {
    try {
        const { orgId } = req.params;
        const posts = await Post.find({ orgId });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};