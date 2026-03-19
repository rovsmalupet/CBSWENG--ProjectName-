import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadDocument,
  getPostDocuments,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/:postId", getPostDocuments);
router.get("/download/:documentId", downloadDocument);
router.delete("/:documentId", deleteDocument);

export default router;
