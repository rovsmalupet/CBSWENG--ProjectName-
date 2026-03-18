import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/Adminprojectdetail.css";
import { apiFetch, getApiUrl } from "../config/api.js";

const CAUSE_STYLES = {
  noPoverty:              { label: "Poverty",             bg: "#E5243B", color: "#fff" },
  zeroHunger:             { label: "Hunger",            bg: "#DDA63A", color: "#fff" },
  goodHealth:             { label: "Healthcare",            bg: "#4C9F38", color: "#fff" },
  qualityEducation:       { label: "Quality Education",      bg: "#C5192D", color: "#fff" },
  genderEquality:         { label: "Gender Equality",        bg: "#FF3A21", color: "#fff" },
  cleanWater:             { label: "Clean Water",            bg: "#26BDE2", color: "#fff" },
  affordableEnergy:       { label: "Affordable Energy",      bg: "#FCC30B", color: "#1a1a1a" },
  decentWork:             { label: "Livelihood And Skills Training",            bg: "#A21942", color: "#fff" },
  industry:               { label: "Industry & Innovation",  bg: "#FD6925", color: "#fff" },
  reducedInequalities:    { label: "Reduced Inequalities",   bg: "#DD1367", color: "#fff" },
  sustainableCities:      { label: "Cities & Relief",     bg: "#FD9D24", color: "#fff" },
  responsibleConsumption: { label: "Responsible Consumption",bg: "#BF8B2E", color: "#fff" },
  climateAction:          { label: "Environment",         bg: "#3F7E44", color: "#fff" },
  lifeBelowWater:         { label: "Life Below Water",       bg: "#0A97D9", color: "#fff" },
  lifeOnLand:             { label: "Life on Land",           bg: "#56C02B", color: "#fff" },
  peaceAndJustice:        { label: "Peace & Justice",        bg: "#00689D", color: "#fff" },
  partnerships:           { label: "Partnerships",           bg: "#19486A", color: "#fff" },
  others:                 { label: "Others",                 bg: "#6b7280", color: "#fff" },
};

const priorityClass = {
  High: "apd-priority-high",
  Medium: "apd-priority-medium",
  Low: "apd-priority-low",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiFetch(getApiUrl(`/posts/${id}`));
        setProject(data);
      } catch (err) {
        setError(err.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleToggleAudit = async () => {
    if (!showAudit && auditLogs.length === 0) {
      setAuditLoading(true);
      try {
        const logs = await apiFetch(getApiUrl(`/posts/${id}/audit`));
        setAuditLogs(logs);
      } catch (err) {
        console.error("Failed to load audit log:", err);
      } finally {
        setAuditLoading(false);
      }
    }
    setShowAudit((prev) => !prev);
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await apiFetch(getApiUrl(`/posts/${id}/status`), {
        method: "PATCH",
        body: JSON.stringify({ overallStatus: newStatus }),
      });
      setProject((prev) => ({ ...prev, overallStatus: newStatus }));
      setAuditLogs([]);
      setShowAudit(false);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const permanentlyDelete = async () => {
    if (!window.confirm("This will remove all data related to this project. Do you want to proceed?")) return;
    setUpdating(true);
    try {
      await apiFetch(getApiUrl(`/posts/${id}/permanent`), { method: "DELETE" });
      navigate(-1);
    } catch (err) {
      setError(err.message || "Failed to permanently delete project.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="apd-page"><p>Loading...</p></div>;
  if (error) return <div className="apd-page"><p style={{ color: "red" }}>{error}</p></div>;
  if (!project) return null;

  const isUnapprovedOrEdited = ["Pending", "Edited", "Unapproved"].includes(project.overallStatus);
  const isApproved = project.overallStatus === "Approved";
  const isDeleted = project.overallStatus === "Deleted";

  const monetary = project.supportTypes?.monetary;
  const inKind = project.supportTypes?.inKind ?? [];
  const volunteer = project.supportTypes?.volunteer;

  return (
    <div className="apd-page">
      <button onClick={() => navigate(-1)} className="apd-back-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <div className="apd-card">
        <div className="apd-title-row">
          <h1 className="apd-title">{project.projectName}</h1>
          {project.priority && (
            <span className={`apd-priority ${priorityClass[project.priority] ?? ""}`}>
              {project.priority.toUpperCase()} PRIORITY
            </span>
          )}
        </div>

        <p className="apd-org-name">{project.orgName ?? project.orgId}</p>
        <p className="apd-org-contact">
          {project.orgRepresentative && (
            <span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 4, verticalAlign: "middle" }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              {project.orgRepresentative}
            </span>
          )}
          {project.orgEmail && (
            <span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 4, verticalAlign: "middle" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {project.orgEmail}
            </span>
          )}
        </p>

        <div className="apd-meta-row">
          {project.location && (
            <div className="apd-location">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {project.location}
            </div>
          )}
          {project.causes?.map((causeKey) => {
            const style = CAUSE_STYLES[causeKey] || CAUSE_STYLES.others;
            return (
              <span key={causeKey} className="apd-cause-badge" style={{ background: style.bg, color: style.color }}>
                {style.label}
              </span>
            );
          })}
        </div>

        {(project.startDate || project.endDate) && (
          <p className="apd-datetime">
            dates: {formatDate(project.startDate)}{project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
            {(project.startTime || project.endTime) && (
              <> &nbsp;time: {project.startTime}{project.endTime ? ` - ${project.endTime}` : ""}</>
            )}
          </p>
        )}

        {project.description && <p className="apd-description">{project.description}</p>}

        <hr className="apd-divider" />

        {monetary?.enabled && (
          <>
            <div className="apd-monetary-row">
              <h2 className="apd-section-title">Monetary</h2>
              <span className="apd-monetary-amount">{monetary.targetAmount?.toLocaleString()} <span className="apd-monetary-unit">PHP</span></span>
            </div>
            <hr className="apd-divider" />
          </>
        )}

        {inKind.length > 0 && (
          <>
            <h2 className="apd-section-title">In-Kind</h2>
            {inKind.map((item) => (
              <p key={item.id} className="apd-inkind-item"><strong>{item.itemName}</strong> — {item.targetQuantity} {item.unit}</p>
            ))}
            <hr className="apd-divider" />
          </>
        )}

        {volunteer?.enabled && (
          <>
            <h2 className="apd-section-title">Volunteer</h2>
            <p className="apd-volunteer-text">
              <strong>{volunteer.targetVolunteers}</strong> volunteers needed
              {project.startDate && (
                <> <strong>on</strong> {formatDate(project.startDate)}
                  {project.endDate && <> <strong>to</strong> {formatDate(project.endDate)}</>}
                  {project.startTime && <> <strong>at</strong> {project.startTime}{project.endTime && <> to {project.endTime}</>}</>}
                </>
              )}
            </p>
            <hr className="apd-divider" />
          </>
        )}

        <div className="apd-actions">
          {isUnapprovedOrEdited && (
            <>
              <button className="apd-btn apd-btn-approve" disabled={updating} onClick={() => updateStatus("Approved")}>Approve</button>
              <button className="apd-btn apd-btn-reject" disabled={updating} onClick={() => updateStatus("Unapproved")}>Reject</button>
            </>
          )}
          {isApproved && (
            <button className="apd-btn apd-btn-reject" disabled={updating} onClick={() => updateStatus("Pending")}>Undo Approve</button>
          )}
          {isDeleted && (
            <button className="apd-btn apd-btn-reject" disabled={updating} onClick={permanentlyDelete}>Permanently Delete</button>
          )}
        </div>

        <hr className="apd-divider" />

        <button className="apd-audit-toggle" onClick={handleToggleAudit}>
          {showAudit ? "▲ Hide History" : "▼ View History"}
        </button>

        {showAudit && (
          <div className="apd-audit-log">
            {auditLoading ? (
              <p className="apd-audit-empty">Loading history...</p>
            ) : auditLogs.length === 0 ? (
              <p className="apd-audit-empty">No actions recorded yet.</p>
            ) : (
              <ul className="apd-audit-list">
                {auditLogs.map((log) => (
                  <li key={log.id} className="apd-audit-item">
                    <span className="apd-audit-action">{log.action}</span>
                    {" by "}
                    <span className="apd-audit-admin">{log.admin.firstName} {log.admin.lastName}</span>
                    <span className="apd-audit-date"> · {formatDateTime(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}