import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getPostDocuments,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", authenticate, authorizeRoles("ngo", "admin"), upload.single("file"), uploadDocument);
router.get("/download/:documentId", authenticate, authorizeRoles("donor", "ngo", "admin"), downloadDocument);
router.get("/:postId", authenticate, authorizeRoles("donor", "ngo", "admin"), getPostDocuments);
router.delete("/:documentId", authenticate, authorizeRoles("ngo", "admin"), deleteDocument);

export default router;
