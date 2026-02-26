import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/ProjectLedger.css";

const CAUSE_STYLES = {
  educationAndChildren: { label: "EDUCATION", bg: "#dbeafe", color: "#1d4ed8" },
  healthAndMedical: { label: "HEALTH", bg: "#dcfce7", color: "#15803d" },
  disasterRelief: { label: "URGENT RELIEF", bg: "#fee2e2", color: "#b91c1c" },
  environmentAndClimate: { label: "ENVIRONMENT", bg: "#d1fae5", color: "#065f46" },
  povertyAndHunger: { label: "POVERTY", bg: "#fef9c3", color: "#92400e" },
  communityDevelopment: { label: "COMMUNITY", bg: "#ede9fe", color: "#6d28d9" },
  livelihoodAndSkillsTraining: { label: "LIVELIHOOD", bg: "#ffedd5", color: "#c2410c" },
  animalWelfare: { label: "ANIMALS", bg: "#fce7f3", color: "#be185d" },
  others: { label: "OTHERS", bg: "#f3f4f6", color: "#374151" },
};

export default function ProjectLedger() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/posts");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/posts/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
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
        <h1 className="ledger-title">My Active Projects</h1>

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
              <line x1="8" y1="12" x2="20" y2="12" />
              <circle cx="4" cy="17" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="17" x2="20" y2="17" />
            </svg>
            <p>
              No projects yet. Click <strong>Add New Project</strong> to get started.
            </p>
          </div>
        ) : (
          <div className="ledger-grid">
            {projects.map((project) => {
              // project.cause stores the causeKey directly (e.g. "healthAndMedical")
              const causeStyle = CAUSE_STYLES[project.cause] || CAUSE_STYLES.others;

              return (
                <div key={project._id} className="pcard">
                  <div className="pcard-top">
                    <span
                      className="pcard-cause-badge"
                      style={{ background: causeStyle.bg, color: causeStyle.color }}
                    >
                      {causeStyle.label}
                    </span>

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

                  {project.impactGoals && (
                    <p className="pcard-desc">{project.impactGoals}</p>
                  )}

                  <div className="pcard-actions">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/edit-project/${project._id}`)}
                      title="Edit project"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project._id)}
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

        <div className="ledger-add-wrap">
          <button
            className="ledger-add-btn"
            onClick={() => navigate("/post-project")}
          >
            Add New Project
          </button>
        </div>
      </main>
    </div>
  );
}