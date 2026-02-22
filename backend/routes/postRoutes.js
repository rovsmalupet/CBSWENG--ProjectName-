import express from "express";

// posting routes
import {
  createPost,
  getOrgPosts,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// POST /posts - create a new project
router.post("/", createPost);

// GET /posts/:orgId - get all posts for a specific organization
router.get("/:orgId", getOrgPosts);

// DELETE /posts/:postId - delete a project
router.delete("/:postId", deletePost);

export default router;
