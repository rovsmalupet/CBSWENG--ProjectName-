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
router.get("/", getOrgPosts);          // fetch all posts for tempID
router.get("/:postId", getPostById);   // single post for edit
router.put("/:postId", updatePost);    // update post
router.delete("/:postId", deletePost);

export default router;