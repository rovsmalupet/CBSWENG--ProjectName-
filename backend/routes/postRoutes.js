import express from "express";

// posting routes
import { createPost, getOrgPosts } from "../controllers/postController.js";

const router = express.Router();

// POST /posts - create a new project
router.post("/", createPost);

// GET /posts/:orgId - get all posts for a specific organization
router.get("/:orgId", getOrgPosts);

export default router;