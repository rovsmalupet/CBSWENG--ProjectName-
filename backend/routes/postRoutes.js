import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
	createPost,
	getOrgPosts,
	getAllPosts,
	getApprovedPosts,
	deletePost,
	getPostById,
	updatePost,
	addContribution,
	updatePostStatus,
	permanentDeletePost,
	getPostAuditLog,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", authenticate, createPost);
router.get("/", authenticate, getOrgPosts);           // protected — org's own posts
router.get("/admin/all", authenticate, getAllPosts);   // protected — all posts for admin
router.get("/approved", getApprovedPosts);             // public — donor homepage
router.get("/:postId", authenticate, getPostById);
router.get("/:postId/audit", authenticate, getPostAuditLog); // full audit log for a post
router.put("/:postId", authenticate, updatePost);
router.delete("/:postId", authenticate, deletePost);
router.patch("/:postId/contribute", authenticate, addContribution);
router.patch("/:postId/status", authenticate, updatePostStatus);
router.delete("/:postId/permanent", authenticate, permanentDeletePost);

export default router;