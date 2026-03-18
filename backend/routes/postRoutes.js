import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
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

router.post("/", authenticate, authorizeRoles("ngo"), createPost);
router.get("/", authenticate, authorizeRoles("ngo"), getOrgPosts);           // protected — org's own posts
router.get("/admin/all", authenticate, authorizeRoles("admin"), getAllPosts);   // protected — all posts for admin
router.get("/approved", getApprovedPosts);             // public — donor homepage
router.get("/:postId", authenticate, getPostById);
router.get("/:postId/audit", authenticate, authorizeRoles("admin"), getPostAuditLog); // full audit log for a post
router.put("/:postId", authenticate, authorizeRoles("ngo"), updatePost);
router.delete("/:postId", authenticate, authorizeRoles("ngo"), deletePost);
router.patch("/:postId/contribute", authenticate, authorizeRoles("donor"), addContribution);
router.patch("/:postId/status", authenticate, authorizeRoles("admin"), updatePostStatus);
router.delete("/:postId/permanent", authenticate, authorizeRoles("admin"), permanentDeletePost);

export default router;