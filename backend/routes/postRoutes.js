/**
 * Project routes.
 *
 * Compare this file with its previous version: every line used to carry
 * `authenticate, authorizeRoles("ngo")` or similar. Authorization now lives
 * entirely in the policy table in security/accessControl.js. [CSSECDV 2.2.1]
 */

import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createPost,
  getOrgPosts,
  getAllPosts,
  getApprovedPosts,
  getPostById,
  getPostAuditLog,
  getPostContributions,
  updatePost,
  deletePost,
  permanentDeletePost,
  updatePostStatus,
  addContribution,
  decideContribution,
  getMyDonorPartnerships,
  getOrgPartnershipOffers,
} from "../controllers/postController.js";
import {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  updatePostStatusSchema,
  addContributionSchema,
  contributionDecisionSchema,
} from "../schemas/post.schema.js";

const router = express.Router();

// Static paths are declared before parameterised ones for readability; the
// policy matcher scores by specificity, so it does not depend on this order.
router.get("/approved", getApprovedPosts);
router.get("/admin/all", getAllPosts);
router.get("/partnerships/me", getMyDonorPartnerships);
router.get("/partnerships/incoming", getOrgPartnershipOffers);

router.patch(
  "/contributions/:contributionId/status",
  validate(contributionDecisionSchema),
  decideContribution,
);

router.post("/", validate(createPostSchema), createPost);
router.get("/", getOrgPosts);

router.get("/:postId", validate(postIdSchema), getPostById);
router.get("/:postId/audit", validate(postIdSchema), getPostAuditLog);
router.get("/:postId/contributions", validate(postIdSchema), getPostContributions);
router.put("/:postId", validate(updatePostSchema), updatePost);
router.delete("/:postId", validate(postIdSchema), deletePost);
router.delete("/:postId/permanent", validate(postIdSchema), permanentDeletePost);
router.patch("/:postId/status", validate(updatePostStatusSchema), updatePostStatus);

// Multipart: multer must run before validation so the text fields exist on
// req.body for the schema to check.
router.patch(
  "/:postId/contribute",
  upload.single("proofFile"),
  validate(addContributionSchema),
  addContribution,
);

export default router;
