import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/ActiveProjects.css";

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

export default function ActiveProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/posts");
        const data = await res.json();
        // Filter to only show Approved projects
        const approvedProjects = data.filter(
          (project) => project.overallStatus === "Approved",
        );
        setProjects(approvedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const res = await fetch(`/posts/${projectId}/status`, {
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

  return (
    <div className="ledger-page">
      <main className="ledger-main">
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
          <h1 className="ledger-title">My Active Projects</h1>
          <button
            className="ledger-add-btn"
            onClick={() => navigate("/post-project")}
          >
            Add New Project
          </button>
        </div>

        {loading ? (
          <div className="ledger-empty">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="ledger-empty">
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
              <line x1="8" y1="17" x2="20" y2="17" />
            </svg>
            <p>
              No projects yet. Click <strong>Add New Project</strong> to get
              started.
            </p>
          </div>
        ) : (
          <div className="ledger-grid">
            {projects.map((project) => {
              const causes = project.causes?.length ? project.causes : [];

              return (
                <div key={project.id} className="pcard">
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

                    <span className="pcard-verified">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Verified
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
                      onClick={() => navigate(`/edit-project/${project.id}`)}
                      title="Edit project"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="contribution-btn"
                      onClick={() =>
                        navigate(`/add-contribution/${project.id}`)
                      }
                      title="Add contribution"
                    >
                      ➕ Add Contribution
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project.id)}
                      title="Delete project"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}