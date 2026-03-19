import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getApiUrl } from "../config/api.js";
import "../css/CorporatePartnerships.css";

export default function CorporatePartnerships() {
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(getApiUrl("/posts/partnerships/me"));
        setPartnerships(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load partnerships:", err);
        setError(err.message || "Failed to load partnerships.");
      } finally {
        setLoading(false);
      }
    };

    loadPartnerships();
  }, []);

  const formatAmount = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDateTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="partnerships-page">
      <main className="partnerships-main">
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

        <h1 className="partnerships-title">My Current Partnerships</h1>
        <p className="partnerships-subtitle">
          Projects where your donor account is already verified through active org partnerships.
        </p>

        {loading ? (
          <div className="partnerships-empty">Loading partnerships...</div>
        ) : error ? (
          <div className="partnerships-error">{error}</div>
        ) : partnerships.length === 0 ? (
          <div className="partnerships-empty">
            You do not have current partnerships yet. Contribute to a project to create one.
          </div>
        ) : (
          <div className="partnerships-list">
            {partnerships.map((partnership) => (
              <section key={partnership.id} className="partnership-card">
                <div className="partnership-header">
                  <h2>{partnership.organization?.orgName || "Organization"}</h2>
                  <span className="partnership-meta">
                    {partnership.totalContributions} contribution{partnership.totalContributions !== 1 ? "s" : ""}
                  </span>
                </div>

                <p className="partnership-org-details">
                  {partnership.organization?.email || "No email"}
                  {partnership.organization?.country ? ` • ${partnership.organization.country}` : ""}
                </p>

                <div className="partnership-projects">
                  {partnership.projects?.length ? (
                    partnership.projects.map((project) => (
                      <article key={project.id} className="partnership-project-card">
                        <button
                          className="partnership-project"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          <span className="project-name">{project.projectName}</span>
                          <span className="project-status">{project.overallStatus}</span>
                        </button>

                        {project.fundraisingUpdate && (
                          <div
                            className={`fundraising-update ${
                              project.fundraisingUpdate.goalMet ? "goal-met" : "goal-progress"
                            }`}
                          >
                            <div className="fundraising-update-top">
                              <strong>
                                {project.fundraisingUpdate.goalMet
                                  ? "Goal reached"
                                  : "Goal in progress"}
                              </strong>
                              <span className="fundraising-update-meta">
                                {formatAmount(project.fundraisingUpdate.currentAmount)} /{" "}
                                {formatAmount(project.fundraisingUpdate.targetAmount)}
                              </span>
                            </div>
                            <p>{project.fundraisingUpdate.message}</p>
                            {project.fundraisingUpdate.goalMet && (
                              <small>
                                Reached on {formatDateTime(project.fundraisingUpdate.reachedAt)}
                              </small>
                            )}
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="no-projects">No project snapshots available yet.</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
