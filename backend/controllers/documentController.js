import prisma from "../prisma/client.js";
import fs from "fs";
import path from "path";

export const uploadDocument = async (req, res) => {
  try {
    const { postId, fileType, description } = req.body;
    const uploadedBy = req.body.uploadedBy || "unknown";

    if (!postId || !fileType) {
      return res.status(400).json({
        error: "Post ID and file type are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No file provided.",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        error: "Post not found.",
      });
    }

    const document = await prisma.documentUpload.create({
      data: {
        postId,
        fileName: req.file.originalname,
        fileType,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy,
        description: description || null,
      },
    });

    res.status(201).json({
      message: "Document uploaded successfully.",
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        description: document.description,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to upload document.",
    });
  }
};

export const getPostDocuments = async (req, res) => {
  try {
    const { postId } = req.params;

    const documents = await prisma.documentUpload.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      documents: documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        description: doc.description,
        uploadedBy: doc.uploadedBy,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      error: "Failed to retrieve documents.",
    });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.documentUpload.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        error: "Document not found.",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        error: "File not found on server.",
      });
    }

    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      error: "Failed to download document.",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.documentUpload.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        error: "Document not found.",
      });
    }

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await prisma.documentUpload.delete({
      where: { id: documentId },
    });

    res.status(200).json({
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: "Failed to delete document.",
    });
  }
};
