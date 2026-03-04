import express from "express";
import {
  createPost,
  getOrgPosts,
  getAllPosts,
  deletePost,
  getPostById,
  updatePost,
  addContribution,
  updatePostStatus,
  permanentDeletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getOrgPosts);
router.get("/admin/all", getAllPosts);
router.get("/:postId", getPostById);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);
router.patch("/:postId/contribute", addContribution);
router.patch("/:postId/status", updatePostStatus);
router.delete("/:postId/permanent", permanentDeletePost);

export default router;