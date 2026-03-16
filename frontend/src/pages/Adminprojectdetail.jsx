import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/Adminprojectdetail.css";

const CAUSE_STYLES = {
  educationAndChildren: { label: "Education", bg: "#dbeafe", color: "#1d4ed8" },
  healthAndMedical: { label: "Health", bg: "#dcfce7", color: "#15803d" },
  disasterRelief: { label: "Urgent Relief", bg: "#fee2e2", color: "#b91c1c" },
  environmentAndClimate: {
    label: "Environment",
    bg: "#d1fae5",
    color: "#065f46",
  },
  povertyAndHunger: { label: "Poverty", bg: "#fef9c3", color: "#92400e" },
  communityDevelopment: { label: "Community", bg: "#ede9fe", color: "#6d28d9" },
  livelihoodAndSkillsTraining: {
    label: "Livelihood",
    bg: "#ffedd5",
    color: "#c2410c",
  },
  animalWelfare: { label: "Animals", bg: "#fce7f3", color: "#be185d" },
  others: { label: "OTHERS", bg: "#f3f4f6", color: "#374151" },
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

export default function AdminProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { getApiUrl, apiFetch } = await import("../config/api");
        const data = await apiFetch(getApiUrl(`/posts/${id}`));
        setProject(data);
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const { getApiUrl } = await import("../config/api");
      const res = await fetch(getApiUrl(`/posts/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overallStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) setProject((prev) => ({ ...prev, overallStatus: newStatus }));
      else setError(data.error || "Failed to update status.");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const permanentlyDelete = async () => {
    if (
      !window.confirm(
        "This will remove all data related to this project. Do you want to proceed?",
      )
    )
      return;
    setUpdating(true);
    try {
      const { getApiUrl } = await import("../config/api");
      const res = await fetch(getApiUrl(`/posts/${id}/permanent`), {
        method: "DELETE",
      });
      if (res.ok) {
        navigate(-1);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to permanently delete project.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="apd-page">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="apd-page">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  if (!project) return null;

  const isUnapprovedOrEdited =
    project.overallStatus === "Pending" ||
    project.overallStatus === "Edited" ||
    project.overallStatus === "Unapproved";
  const isApproved = project.overallStatus === "Approved";
  const isDeleted = project.overallStatus === "Deleted";

  return (
    <div className="apd-page">
      <button onClick={() => navigate(-1)} className="apd-back-btn">
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

      <div className="apd-card">
        <div className="apd-title-row">
          <h1 className="apd-title">{project.projectName}</h1>
          {project.priority && (
            <span
              className={`apd-priority ${priorityClass[project.priority] ?? ""}`}
            >
              {project.priority.toUpperCase()} PRIORITY
            </span>
          )}
        </div>

        {/* Org info */}
        <p className="apd-org-name">{project.orgName ?? project.orgId}</p>
        <p className="apd-org-contact">
          {project.orgRepresentative && (
            <span>
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ marginRight: 4, verticalAlign: "middle" }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {project.orgRepresentative}
            </span>
          )}
          {project.orgEmail && (
            <span>
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ marginRight: 4, verticalAlign: "middle" }}
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {project.orgEmail}
            </span>
          )}
        </p>

        {/* Location + Causes */}
        <div className="apd-meta-row">
          {project.location && (
            <div className="apd-location">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {project.location}
            </div>
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

        {/* Date/Time */}
        {(project.startDate || project.endDate) && (
          <p className="apd-datetime">
            dates: {formatDate(project.startDate)}{" "}
            {project.endDate ? `→${formatDate(project.endDate)}` : ""}
            {(project.startTime || project.endTime) && (
              <>
                {" "}
                &nbsp;time: {project.startTime}{" "}
                {project.endTime ? `- ${project.endTime}` : ""}
              </>
            )}
          </p>
        )}

        {/* Description */}
        {project.description && (
          <p className="apd-description">{project.description}</p>
        )}

        <hr className="apd-divider" />

        {/* Monetary */}
        {project.supportTypes?.monetary?.enabled && (
          <>
            <div className="apd-monetary-row">
              <h2 className="apd-section-title">Monetary</h2>
              <span className="apd-monetary-amount">
                {project.supportTypes.monetary.targetAmount?.toLocaleString()}{" "}
                <span className="apd-monetary-unit">PHP</span>
              </span>
            </div>
            <hr className="apd-divider" />
          </>
        )}

        {/* In-Kind */}
        {project.supportTypes?.inKind?.length > 0 && (
          <>
            <h2 className="apd-section-title">In-Kind</h2>
            {project.supportTypes.inKind.map((item) => (
              <p key={item.id} className="apd-inkind-item">
                <strong>{item.itemName}</strong> — {item.targetQuantity}{" "}
                {item.unit}
              </p>
            ))}
            <hr className="apd-divider" />
          </>
        )}

        {/* Volunteer */}
        {project.supportTypes?.volunteer?.enabled && (
          <>
            <h2 className="apd-section-title">Volunteer</h2>
            <p className="apd-volunteer-text">
              <strong>{project.supportTypes.volunteer.targetVolunteers}</strong>{" "}
              volunteers
              {project.startDate && (
                <>
                  {" "}
                  <strong>On</strong> {formatDate(project.startDate)}
                  {project.endDate && (
                    <>
                      {" "}
                      <strong>to</strong> {formatDate.endDate}
                    </>
                  )}
                  {project.startTime && (
                    <>
                      {" "}
                      <strong>At</strong> {project.startTime} to
                      {project.endTime && <> {project.endTime}</>}
                    </>
                  )}
                </>
              )}
            </p>
            <hr className="apd-divider" />
          </>
        )}

        {/* Action Buttons */}
        <div className="apd-actions">
          {isUnapprovedOrEdited && (
            <>
              <button
                className="apd-btn apd-btn-approve"
                disabled={updating}
                onClick={() => updateStatus("Approved")}
              >
                Approve
              </button>
              <button
                className="apd-btn apd-btn-reject"
                disabled={updating}
                onClick={() => updateStatus("Unapproved")}
              >
                Reject
              </button>
            </>
          )}
          {isApproved && (
            <button
              className="apd-btn apd-btn-reject"
              disabled={updating}
              onClick={() => updateStatus("Pending")}
            >
              Undo Approve
            </button>
          )}
          {isDeleted && (
            <button
              className="apd-btn apd-btn-reject"
              disabled={updating}
              onClick={permanentlyDelete}
            >
              Permanently Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
