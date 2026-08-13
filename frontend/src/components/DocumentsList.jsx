import { useState, useEffect } from "react";
import { apiDelete, apiDownload, apiGet } from "../config/api.js";
import "../css/DocumentsList.css";

export default function DocumentsList({ postId, canDelete }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
      alert("Failed to download document: " + err.message);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await apiDelete(`/documents/${documentId}`);

      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (err) {
      alert("Failed to delete document: " + err.message);
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
                className="action-btn download-btn"
                onClick={() => handleDownload(doc.id, doc.fileName)}
              >
                Download
              </button>
              {canDelete && (
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
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
