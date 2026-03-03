import express from "express";
import {
  createPost,
  getOrgPosts,
  deletePost,
  getPostById,
  updatePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getOrgPosts);
router.get("/:postId", getPostById);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

export default router;