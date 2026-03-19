import { useState } from "react";
import { getApiUrl } from "../config/api.js";
import "../css/UploadDocuments.css";

export default function UploadDocuments({ postId, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("Photo");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileTypeOptions = ["Photo", "Receipt", "Report", "Update", "Certificate", "Other"];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File size exceeds 50MB limit.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    if (!fileType) {
      setError("Please select a document type.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("postId", postId);
      formData.append("fileType", fileType);
      formData.append("description", description);
      formData.append("uploadedBy", localStorage.getItem("userFirstName") || "User");

      const response = await fetch(getApiUrl("/documents/upload"), {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      setDescription("");
      setFileType("Photo");

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-documents-container">
      <h2>Upload Documentation</h2>
      <p className="subtitle">Upload photos, receipts, reports, and other documentation</p>

      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="fileType">Document Type</label>
          <select
            id="fileType"
            value={fileType}
            onChange={(event) => setFileType(event.target.value)}
          >
            {fileTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fileInput">Select File</label>
          <div className="file-input-wrapper">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.webp"
            />
            <span className="file-name">
              {selectedFile ? selectedFile.name : "No file selected"}
            </span>
          </div>
          <p className="file-hint">Max file size: 50MB. Supported: images, PDFs, documents</p>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a brief description of this document"
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="upload-btn"
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}
