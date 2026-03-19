import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UploadDocuments from "../components/UploadDocuments.jsx";
import DocumentsList from "../components/DocumentsList.jsx";
import { getApiUrl, apiFetch } from "../config/api.js";
import "../css/ProjectDocumentation.css";

export default function ProjectDocumentation() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiFetch(getApiUrl(`/posts/${postId}`));
        setProject(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [postId]);

  const handleUploadSuccess = () => {
    setRefreshDocuments((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="project-documentation-page">
        <div className="page-container">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-documentation-page">
        <div className="page-container">
          <div className="error-banner">{error}</div>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-documentation-page">
        <div className="page-container">
          <p>Project not found.</p>
        </div>
      </div>
    );
  }

  const userRole = localStorage.getItem("userRole");
  const isOrgOwner = userRole === "ngo";

  return (
    <div className="project-documentation-page">
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(`/project/${postId}`)}>
            Back to Project
          </button>
          <h1>{project.projectName}</h1>
          <p className="project-location">{project.location}</p>
        </div>

        <div className="documentation-content">
          <div className="documentation-section">
            <h2>Project Documentation</h2>
            <p className="section-description">
              Upload and manage project documentation including photos, receipts, reports, and updates
              to maintain transparency and build trust with donors.
            </p>
          </div>

          {isOrgOwner && (
            <div className="upload-section">
              <UploadDocuments
                postId={postId}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          )}

          <div className="documents-section">
            <DocumentsList
              key={refreshDocuments}
              postId={postId}
              canDelete={isOrgOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
