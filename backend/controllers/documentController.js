/**
 * documentController.js
 *
 * Upload and delete already checked ownership inline; listing and downloading
 * did not, so any authenticated user could enumerate and download every
 * organization's uploaded documents. All four now go through the same declared
 * ownership resolvers. [CSSECDV 2.2.2]
 *
 * That inconsistency — two functions careful, two not, in the same file — is
 * the clearest argument in the codebase for deciding authorization in one
 * place instead of at each call site.
 */

import fs from "fs";

import prisma from "../prisma/client.js";
import { notFound } from "../errors/AppError.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

/** Remove an uploaded file after a failed request, ignoring cleanup errors. */
const discard = async (file) => {
  if (!file?.path) return;
  await fs.promises.unlink(file.path).catch(() => {});
};

/** POST /documents/upload */
export const uploadDocument = async (req, res) => {
  const { postId, fileType, description } = req.body;

  if (!req.file) throw notFound("No file was received.");

  // req.resource was loaded by owners.postFromBody, which ran after multer
  // parsed the multipart body (the policy is flagged `deferred`).
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { organization: { select: { orgName: true, firstName: true, surname: true } } },
  });

  if (!post) {
    await discard(req.file);
    throw notFound();
  }

  const uploadedBy =
    post.organization?.orgName ||
    `${post.organization?.firstName ?? ""} ${post.organization?.surname ?? ""}`.trim() ||
    "Organization";

  const document = await prisma.documentUpload.create({
    data: {
      postId,
      // The name the user gave, kept for display only — the path on disk is a
      // generated UUID (see uploadMiddleware.js).
      fileName: req.file.originalname,
      fileType,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy,
      description: description ?? null,
    },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.DOCUMENT_UPLOADED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Document "${document.fileName}" uploaded to a project.`,
    targetType: "Post",
    targetId: postId,
    metadata: { documentId: document.id, fileType, fileSize: document.fileSize },
  });

  res.status(201).json({
    message: "Document uploaded.",
    document: {
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      description: document.description,
      createdAt: document.createdAt,
    },
  });
};

/**
 * GET /documents/:postId
 *
 * `filePath` is deliberately absent from the response. Returning it would
 * disclose the server's directory layout to every donor viewing a project.
 */
export const getPostDocuments = async (req, res) => {
  const documents = await prisma.documentUpload.findMany({
    where: { postId: req.params.postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      mimeType: true,
      description: true,
      uploadedBy: true,
      createdAt: true,
    },
  });

  res.status(200).json({ documents });
};

/** GET /documents/download/:documentId */
export const downloadDocument = async (req, res) => {
  const document = req.resource; // loaded by owners.document

  if (!document?.filePath || !fs.existsSync(document.filePath)) {
    throw notFound("That file is no longer available.");
  }

  // nosniff plus an attachment disposition: a browser must not be talked into
  // rendering an uploaded file inline, which is how an uploaded document
  // becomes stored cross-site scripting.
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/octet-stream");
  res.download(document.filePath, document.fileName);
};

/** DELETE /documents/:documentId */
export const deleteDocument = async (req, res) => {
  const document = req.resource; // loaded by owners.documentOwned

  // The database row goes first. If the row is gone but the file lingers, the
  // file is unreachable; the reverse would leave a broken download link.
  await prisma.documentUpload.delete({ where: { id: document.id } });
  await fs.promises.unlink(document.filePath).catch(() => {});

  await logSecurityEvent(req, {
    eventType: EVENTS.DOCUMENT_DELETED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Document "${document.fileName}" was deleted.`,
    targetType: "Document",
    targetId: document.id,
  });

  res.status(200).json({ message: "Document deleted." });
};
