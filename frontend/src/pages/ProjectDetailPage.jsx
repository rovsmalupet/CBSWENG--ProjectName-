import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/ProjectDetailPage.css";

const CAUSE_STYLES = {
  educationAndChildren: { label: "education", bg: "#dbeafe", color: "#1d4ed8" },
  healthAndMedical: { label: "health", bg: "#dcfce7", color: "#15803d" },
  disasterRelief: { label: "urgent relief", bg: "#fee2e2", color: "#b91c1c" },
  environmentAndClimate: {
    label: "environment",
    bg: "#d1fae5",
    color: "#065f46",
  },
  povertyAndHunger: { label: "poverty", bg: "#fef9c3", color: "#92400e" },
  communityDevelopment: { label: "community", bg: "#ede9fe", color: "#6d28d9" },
  livelihoodAndSkillsTraining: {
    label: "livelihood",
    bg: "#ffedd5",
    color: "#c2410c",
  },
  animalWelfare: { label: "animals", bg: "#fce7f3", color: "#be185d" },
  others: { label: "others", bg: "#f3f4f6", color: "#374151" },
};

const priorityClass = {
  High: "apd-priority-high",
  Medium: "apd-priority-medium",
  Low: "apd-priority-low",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const percent = (current, target) => {
  const safeCurrent = Number(current ?? 0);
  const safeTarget = Number(target ?? 0);
  if (safeTarget <= 0) return 0;
  return Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
};

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarkedProjects, setBookmarkedProjects] = useState(() => {
    const saved = localStorage.getItem("bookmarkedProjects");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleBookmark = () => {
    setBookmarkedProjects((prev) => {
      const isBookmarked = prev.includes(id);
      const updated = isBookmarked
        ? prev.filter((projectId) => projectId !== id)
        : [...prev, id];
      localStorage.setItem("bookmarkedProjects", JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = bookmarkedProjects.includes(id);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { getApiUrl, apiFetch } = await import("../config/api");
        const res = await apiFetch(getApiUrl(`/posts/${id}`));
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "failed to load project");
          return;
        }
        setProject(data);
      } catch {
        setError("network error. please try again");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading)
    return (
      <div className="apd-page">
        <p>loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="apd-page">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  if (!project) return null;

  const monetary = project.supportTypes?.monetary;
  const inKind = project.supportTypes?.inKind ?? [];
  const volunteer = project.supportTypes?.volunteer;

  return (
    <div className="apd-page">
      <button onClick={() => navigate("/donor")} className="apd-back-btn">
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
        back to campaigns
      </button>

      <div className="apd-card">
        <div className="apd-title-row">
          <h1 className="apd-title">{project.projectName}</h1>
          <div className="apd-title-actions">
            {project.priority && (
              <span
                className={`apd-priority ${priorityClass[project.priority] ?? ""}`}
              >
                {project.priority.toLowerCase()} priority
              </span>
            )}
            <button
              className={`apd-save-btn ${isBookmarked ? "saved" : ""}`}
              onClick={toggleBookmark}
            >
              {isBookmarked ? "★ SAVED" : "☆ SAVE"}
            </button>
          </div>
        </div>

        <p className="apd-org-name">{project.orgName ?? "organization"}</p>
        <p className="apd-org-contact">
          {project.orgRepresentative && (
            <span>{project.orgRepresentative}</span>
          )}
          {project.orgEmail && <span>{project.orgEmail}</span>}
        </p>

        <div className="apd-meta-row">
          {project.location && (
            <div className="apd-location">{project.location}</div>
          )}
          {project.causes?.map((causeKey) => {
            const style = CAUSE_STYLES[causeKey] || CAUSE_STYLES.others;
            return (
              <span
                key={causeKey}
                className="apd-cause-badge"
                style={{ background: style.bg, color: style.color }}
              >
                {style.label}
              </span>
            );
          })}
        </div>

        {(project.startDate || project.endDate) && (
          <p className="apd-datetime">
            {formatDate(project.startDate)}{" "}
            {project.endDate ? `→ ${formatDate(project.endDate)}` : ""}
            {(project.startTime || project.endTime) && (
              <>
                {" "}
                • {project.startTime || ""}{" "}
                {project.endTime ? `- ${project.endTime}` : ""}
              </>
            )}
          </p>
        )}

        {project.description && (
          <p className="apd-description">{project.description}</p>
        )}

        <hr className="apd-divider" />

        {monetary?.enabled && (
          <>
            <div className="apd-monetary-row">
              <h2 className="apd-section-title">monetary</h2>
              <span className="apd-monetary-amount">
                {Number(monetary.targetAmount ?? 0).toLocaleString()}{" "}
                <span className="apd-monetary-unit">php</span>
              </span>
            </div>
            <div className="apd-progress-info">
              <span>
                raised: ₱{Number(monetary.currentAmount ?? 0).toLocaleString()}
              </span>
              <span>
                {percent(monetary.currentAmount, monetary.targetAmount)}%
                complete
              </span>
            </div>
            <div className="apd-progress-bar">
              <div
                className="apd-progress-fill"
                style={{
                  width: `${percent(monetary.currentAmount, monetary.targetAmount)}%`,
                }}
              />
            </div>
            <hr className="apd-divider" />
          </>
        )}

        {inKind.length > 0 && (
          <>
            <h2 className="apd-section-title">in-kind</h2>
            {inKind.map((item) => (
              <div key={item.id} className="apd-inkind-item-wrapper">
                <p className="apd-inkind-item">
                  <strong>{item.itemName}</strong> — {item.targetQuantity}{" "}
                  {item.unit ?? "units"}
                </p>
                <div className="apd-progress-info">
                  <span>
                    collected: {item.currentQuantity ?? 0}{" "}
                    {item.unit ?? "units"}
                  </span>
                  <span>
                    {percent(item.currentQuantity, item.targetQuantity)}%
                    complete
                  </span>
                </div>
                <div className="apd-progress-bar">
                  <div
                    className="apd-progress-fill"
                    style={{
                      width: `${percent(item.currentQuantity, item.targetQuantity)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <hr className="apd-divider" />
          </>
        )}

        {volunteer?.enabled && (
          <>
            <h2 className="apd-section-title">volunteer staffing</h2>
            <div className="apd-volunteer-info">
              <div className="apd-volunteer-count">
                <span className="apd-volunteer-label">volunteers needed:</span>
                <span className="apd-volunteer-number">
                  {volunteer.targetVolunteers ?? 0}
                </span>
              </div>
              {(project.startDate || project.endDate) && (
                <div className="apd-volunteer-schedule">
                  <span className="apd-volunteer-label">schedule:</span>
                  <span className="apd-volunteer-dates">
                    {project.startDate &&
                      new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    {project.endDate &&
                      ` to ${new Date(project.endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`}
                  </span>
                </div>
              )}
              {(project.startTime || project.endTime) && (
                <div className="apd-volunteer-time">
                  <span className="apd-volunteer-label">time:</span>
                  <span className="apd-volunteer-hours">
                    {project.startTime || ""}
                    {project.endTime && ` - ${project.endTime}`}
                  </span>
                </div>
              )}
            </div>
            <div className="apd-progress-info">
              <span>
                committed: {volunteer.currentVolunteers ?? 0} volunteers
              </span>
              <span>
                {percent(
                  volunteer.currentVolunteers,
                  volunteer.targetVolunteers,
                )}
                % complete
              </span>
            </div>
            <div className="apd-progress-bar">
              <div
                className="apd-progress-fill apd-progress-fill-volunteer"
                style={{
                  width: `${percent(volunteer.currentVolunteers, volunteer.targetVolunteers)}%`,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
