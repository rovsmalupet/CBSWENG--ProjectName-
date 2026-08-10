/**
 * Document routes.
 *
 * The upload route is the one place where authorization cannot be settled
 * entirely before the router runs: the project id arrives inside a multipart
 * body that multer has not parsed yet. Its policy is flagged `deferred` in
 * security/accessControl.js, and `enforceDeferredOwnership` applies that same
 * declared policy here, immediately after parsing and before anything is
 * written. The decision still lives in one table. [CSSECDV 2.2.1]
 */

import express from "express";

import upload, { verifyUploadedFile } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";
import { enforceDeferredOwnership } from "../security/accessControl.js";
import {
  uploadDocument,
  getPostDocuments,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { uploadDocumentSchema, documentIdSchema } from "../schemas/misc.schema.js";
import { postIdSchema } from "../schemas/post.schema.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  validate(uploadDocumentSchema), // shape and bounds
  verifyUploadedFile, // magic bytes match the declared type
  enforceDeferredOwnership, // you may only upload to your own project
  uploadDocument,
);

router.get("/download/:documentId", validate(documentIdSchema), downloadDocument);
router.get("/:postId", validate(postIdSchema), getPostDocuments);
router.delete("/:documentId", validate(documentIdSchema), deleteDocument);

export default router;
