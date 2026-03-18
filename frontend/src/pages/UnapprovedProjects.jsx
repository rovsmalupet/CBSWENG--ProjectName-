import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import "../css/UnapprovedProjects.css";
import Navbar from "../components/Navbar.jsx";

const CAUSE_STYLES = {
  educationAndChildren: { label: "EDUCATION", bg: "#dbeafe", color: "#1d4ed8" },
  healthAndMedical: { label: "HEALTH", bg: "#dcfce7", color: "#15803d" },
  disasterRelief: { label: "URGENT RELIEF", bg: "#fee2e2", color: "#b91c1c" },
  environmentAndClimate: {
    label: "ENVIRONMENT",
    bg: "#d1fae5",
    color: "#065f46",
  },
  povertyAndHunger: { label: "POVERTY", bg: "#fef9c3", color: "#92400e" },
  communityDevelopment: { label: "COMMUNITY", bg: "#ede9fe", color: "#6d28d9" },
  livelihoodAndSkillsTraining: {
    label: "LIVELIHOOD",
    bg: "#ffedd5",
    color: "#c2410c",
  },
  animalWelfare: { label: "ANIMALS", bg: "#fce7f3", color: "#be185d" },
  others: { label: "OTHERS", bg: "#f3f4f6", color: "#374151" },
};

export default function UnapprovedProjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch.toLowerCase());
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { getApiUrl, apiFetch } = await import("../config/api");
        const data = await apiFetch(getApiUrl("/posts"));
        // Filter for Pending, Edited, and Unapproved projects
        const unapprovedProjects = data.filter(
          (project) =>
            project.overallStatus === "Pending" ||
            project.overallStatus === "Edited" ||
            project.overallStatus === "Unapproved",
        );
        setProjects(unapprovedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const queryFromUrl = searchParams.get("search") || "";
    setSearchText(queryFromUrl);
    setSearchQuery(queryFromUrl.toLowerCase());
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return projects;

    return projects.filter((project) => {
      const projectName = project.projectName?.toLowerCase() || "";
      const description = project.description?.toLowerCase() || "";
      const location = project.location?.toLowerCase() || "";
      const status = project.overallStatus?.toLowerCase() || "";
      const causes = (project.causes || []).join(" ").toLowerCase();
      return (
        projectName.includes(query) ||
        description.includes(query) ||
        location.includes(query) ||
        status.includes(query) ||
        causes.includes(query)
      );
    });
  }, [projects, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = searchText.trim();
    setSearchQuery(trimmed.toLowerCase());
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const { getApiUrl } = await import("../config/api");
      const res = await fetch(getApiUrl(`/posts/${projectId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overallStatus: "Deleted" }),
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleEditRejected = (projectId) => {
    setSelectedProjectId(projectId);
    setShowConfirmation(true);
  };

  const handleConfirmEdit = () => {
    setShowConfirmation(false);
    navigate(`/edit-project/${selectedProjectId}`);
    setSelectedProjectId(null);
  };

  const handleCancelEdit = () => {
    setShowConfirmation(false);
    setSelectedProjectId(null);
  };

  return (
    <div className="unapproved-page">
      <Navbar />
      <main className="unapproved-main">
        <button className="back-link" onClick={() => navigate(-1)}>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <div className="ledger-header">
          <h1 className="unapproved-title">Unposted Projects</h1>
          <button
            className="ledger-add-btn"
            onClick={() => navigate("/post-project")}
          >
            Add New Project
          </button>
        </div>

        <form className="project-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="project-search-input"
            placeholder="Search unposted projects"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button type="submit" className="project-search-btn">Search</button>
        </form>

        {loading ? (
          <div className="unapproved-empty">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="unapproved-empty">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.4"
              viewBox="0 0 24 24"
            >
              <circle cx="4" cy="7" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="7" x2="20" y2="7" />
              <circle cx="4" cy="12" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <circle cx="4" cy="17" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="17" x2="20" y2="17" />
            </svg>
            <p>{projects.length === 0 ? "No unposted projects at this time." : "No unposted projects match your search."}</p>
          </div>
        ) : (
          <div className="unapproved-grid">
            {filteredProjects.map((project) => {
              const causes = project.causes?.length ? project.causes : [];
              const isRejected = project.overallStatus === "Unapproved";

              return (
                <div
                  key={project.id}
                  className={`pcard ${isRejected ? "pcard-rejected" : ""}`}
                >
                  <div className="pcard-top">
                    {/* Render a badge for each cause */}
                    <div className="pcard-cause-badges">
                      {causes.length > 0 ? (
                        causes.map((causeKey) => {
                          const style =
                            CAUSE_STYLES[causeKey] || CAUSE_STYLES.others;
                          return (
                            <span
                              key={causeKey}
                              className="pcard-cause-badge"
                              style={{
                                background: style.bg,
                                color: style.color,
                              }}
                            >
                              {style.label}
                            </span>
                          );
                        })
                      ) : (
                        <span
                          className="pcard-cause-badge"
                          style={{
                            background: CAUSE_STYLES.others.bg,
                            color: CAUSE_STYLES.others.color,
                          }}
                        >
                          {CAUSE_STYLES.others.label}
                        </span>
                      )}
                    </div>

                    <span
                      className={`pcard-status pcard-status-${project.overallStatus.toLowerCase()}`}
                    >
                      {project.overallStatus}
                    </span>
                  </div>

                  <h2 className="pcard-title">{project.projectName}</h2>

                  {project.location && (
                    <p className="pcard-location">
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {project.location}
                    </p>
                  )}

                  {project.description && (
                    <p className="pcard-desc">{project.description}</p>
                  )}

                  <div className="pcard-actions">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        isRejected
                          ? handleEditRejected(project.id)
                          : navigate(`/edit-project/${project.id}`)
                      }
                      title="Edit project"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project.id)}
                      title="Delete project"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}
            >
              Status Change Notice
            </h3>
            <p
              style={{ marginBottom: "20px", color: "#555", lineHeight: "1.5" }}
            >
              When you edit this rejected project, its status will be changed to{" "}
              <strong>Pending</strong>. Your project will need to be reviewed
              and approved by an admin again.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEdit}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
