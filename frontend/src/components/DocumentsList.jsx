import { useState, useEffect } from "react";
import { apiDelete, apiDownload, apiGet } from "../config/api.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import "../css/DocumentsList.css";

export default function DocumentsList({ postId, canDelete }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet(`/documents/${postId}`);
        if (!active) return;
        setDocuments(data.documents);
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load documents.");
        setDocuments([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchDocuments();
    return () => {
      active = false;
    };
  }, [postId]);

  const handleDownload = async (documentId, fileName) => {
    try {
      const blob = await apiDownload(`/documents/download/${documentId}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setDialog({
        kind: "status",
        title: "Download failed",
        message: "Failed to download document: " + err.message,
        tone: "danger",
      });
    }
  };

  const handleDelete = (documentId) => {
    setDialog({
      kind: "confirm-delete",
      documentId,
      title: "Delete this document?",
      message: "This document will be permanently removed from the project.",
      tone: "danger",
    });
  };

  const confirmDelete = async (documentId) => {
    setDeletingId(documentId);
    try {
      await apiDelete(`/documents/${documentId}`);
      setDocuments((current) => current.filter((doc) => doc.id !== documentId));
      setDialog(null);
    } catch (err) {
      setDialog({
        kind: "status",
        title: "Delete failed",
        message: "Failed to delete document: " + err.message,
        tone: "danger",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="documents-loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="documents-error">{error}</div>;
  }

  if (documents.length === 0) {
    return <div className="documents-empty">No documents uploaded yet.</div>;
  }

  return (
    <div className="documents-list-container">
      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.title}
        message={dialog?.message}
        tone={dialog?.tone}
        showCancel={dialog?.kind === "confirm-delete"}
        confirmLabel={dialog?.kind === "confirm-delete" ? "Delete document" : "OK"}
        busyLabel="Deleting…"
        busy={Boolean(deletingId) && dialog?.kind === "confirm-delete"}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind === "confirm-delete") {
            confirmDelete(dialog.documentId);
          } else {
            setDialog(null);
          }
        }}
      />

      <h3>Uploaded Documentation</h3>
      <div className="documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <span className="document-type">{doc.fileType}</span>
              <span className="document-date">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="document-info">
              <p className="document-name">{doc.fileName}</p>
              <p className="document-size">
                {(doc.fileSize / 1024).toFixed(2)} KB
              </p>
              {doc.description && (
                <p className="document-description">{doc.description}</p>
              )}
            </div>

            <div className="document-actions">
              <button
                type="button"
                className="action-btn download-btn"
                onClick={() => handleDownload(doc.id, doc.fileName)}
              >
                Download
              </button>
              {canDelete && (
                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(doc.id)}
                  disabled={Boolean(deletingId)}
                >
                  {deletingId === doc.id ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>

            <div className="document-uploader">
              Uploaded by: {doc.uploadedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
