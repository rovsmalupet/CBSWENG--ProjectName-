import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PaymentStatusWidget from "../components/PaymentStatusWidget";
import "../css/ProjectDetailPage.css";
import { apiFetch, getApiUrl } from "../config/api.js";
import { useAuth } from "../context/authContext.js";
import {
  addBookmark,
  hasBookmark,
  loadBookmarks,
  removeBookmark,
} from "../utils/bookmarks.js";

const CAUSE_STYLES = {
  noPoverty: { label: "Poverty", bg: "#E5243B", color: "#fff" },
  zeroHunger: { label: "Hunger", bg: "#DDA63A", color: "#fff" },
  goodHealth: { label: "Healthcare", bg: "#4C9F38", color: "#fff" },
  qualityEducation: {
    label: "Quality Education",
    bg: "#C5192D",
    color: "#fff",
  },
  genderEquality: { label: "Gender Equality", bg: "#FF3A21", color: "#fff" },
  cleanWater: { label: "Clean Water", bg: "#26BDE2", color: "#fff" },
  affordableEnergy: {
    label: "Affordable Energy",
    bg: "#FCC30B",
    color: "#1a1a1a",
  },
  decentWork: { label: "Livelihood And Skills", bg: "#A21942", color: "#fff" },
  industry: { label: "Industry & Innovation", bg: "#FD6925", color: "#fff" },
  reducedInequalities: {
    label: "Reduced Inequalities",
    bg: "#DD1367",
    color: "#fff",
  },
  sustainableCities: { label: "Cities & Relief", bg: "#FD9D24", color: "#fff" },
  responsibleConsumption: {
    label: "Responsible Consumption",
    bg: "#BF8B2E",
    color: "#fff",
  },
  climateAction: { label: "Environment", bg: "#3F7E44", color: "#fff" },
  lifeBelowWater: { label: "Life Below Water", bg: "#0A97D9", color: "#fff" },
  lifeOnLand: { label: "Life on Land", bg: "#56C02B", color: "#fff" },
  peaceAndJustice: { label: "Peace & Justice", bg: "#00689D", color: "#fff" },
  partnerships: { label: "Partnerships", bg: "#19486A", color: "#fff" },
  others: { label: "Others", bg: "#6b7280", color: "#fff" },
};

const normalizeCauseKey = (raw) => {
  if (!raw) return "others";
  if (CAUSE_STYLES[raw]) return raw;
  const normalized = raw.toLowerCase().replace(/[\s_-]+/g, "");
  const match = Object.keys(CAUSE_STYLES).find(
    (key) => key.toLowerCase() === normalized,
  );
  return match || "others";
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
  const { role } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  const toggleBookmark = async () => {
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    setBookmarkError("");

    try {
      const existing = bookmarks.find((entry) => entry.projectId === id);
      if (existing) {
        await removeBookmark(existing.id);
        setBookmarks((previous) =>
          previous.filter((entry) => entry.id !== existing.id),
        );
      } else {
        const created = await addBookmark(id);
        setBookmarks((previous) => [created, ...previous]);
      }
    } catch (err) {
      setBookmarkError(err.message || "Could not update this bookmark.");
    } finally {
      setBookmarkBusy(false);
    }
  };

  const isBookmarked = hasBookmark(bookmarks, id);

  const getBackRoute = () => {
    if (role === "ngo") return "/dashboard";
    if (role === "admin") return "/admin";
    return "/donor";
  };

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

  useEffect(() => {
    if (role !== "donor") {
      setBookmarks([]);
      return undefined;
    }

    let cancelled = false;
    loadBookmarks()
      .then((data) => {
        if (!cancelled) setBookmarks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setBookmarkError(err.message || "Could not load your bookmarks.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [role]);

  if (loading) {
    return (
      <div className="apd-page">
        <div
          className="apd-card"
          style={{
            textAlign: "center",
            padding: "60px 28px",
            color: "#6b7280",
          }}
        >
          Loading project…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apd-page">
        <div
          className="apd-card"
          style={{
            textAlign: "center",
            padding: "60px 28px",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!project) return null;

  const monetary = project.supportTypes?.monetary;
  const inKind = project.supportTypes?.inKind ?? [];
  const volunteer = project.supportTypes?.volunteer;

  return (
    <div className="apd-page">
      <button onClick={() => navigate(getBackRoute())} className="apd-back-btn">
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
        back
      </button>

      <div className="apd-card">
        {/* ── Title block — left-aligned ── */}
        <div className="apd-title-block">
          {/* Row 1: title */}
          <h1 className="apd-title">{project.projectName}</h1>

          {/* Row 2: priority badge + bookmark */}
          <div className="apd-title-meta">
            {project.priority && (
              <span
                className={`apd-priority ${priorityClass[project.priority] ?? ""}`}
              >
                {project.priority.toLowerCase()} priority
              </span>
            )}
            {role === "donor" && (
              <button
                className={`apd-save-btn ${isBookmarked ? "saved" : ""}`}
                onClick={toggleBookmark}
                disabled={bookmarkBusy}
                aria-busy={bookmarkBusy}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                {bookmarkBusy ? "Saving…" : isBookmarked ? "Saved" : "Save"}
              </button>
            )}
            {bookmarkError && (
              <span className="apd-bookmark-error" role="alert">
                {bookmarkError}
              </span>
            )}
          </div>

          {/* Row 3: action buttons */}
          <div className="apd-action-btns">
            {role === "donor" && (
              <button
                className="apd-support-btn"
                onClick={() => navigate(`/add-contribution/${id}`)}
              >
                Support Now
              </button>
            )}
            <button
              className="apd-doc-btn"
              onClick={() => navigate(`/project/${id}/documentation`)}
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* ── Org info ── */}
        <p className="apd-org-name">
          {project.orgName ?? "Organization"}
          {project.orgIsVerified && (
            <button
              type="button"
              className="apd-verified-badge"
              onClick={() =>
                navigate(`/organization/${project.orgId}/verification`)
              }
            >
              Verified NGO
            </button>
          )}
        </p>

        {(project.orgRepresentative || project.orgEmail) && (
          <p className="apd-org-contact">
            {project.orgRepresentative && (
              <span>{project.orgRepresentative}</span>
            )}
            {project.orgEmail && <span>{project.orgEmail}</span>}
          </p>
        )}

        {/* ── Location + causes ── */}
        <div className="apd-meta-row">
          {project.location && (
            <div className="apd-location">{project.location}</div>
          )}
          {project.causes?.map((causeKey) => {
            const style = CAUSE_STYLES[normalizeCauseKey(causeKey)];
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

        {/* ── Date / time ── */}
        {(project.startDate || project.endDate) && (
          <p className="apd-datetime">
            {formatDate(project.startDate)}
            {project.endDate ? ` → ${formatDate(project.endDate)}` : ""}
            {(project.startTime || project.endTime) && (
              <>
                {" "}
                &nbsp;•&nbsp; {project.startTime || ""}
                {project.endTime ? ` - ${project.endTime}` : ""}
              </>
            )}
          </p>
        )}

        {/* ── Description ── */}
        {project.description && (
          <p className="apd-description">{project.description}</p>
        )}

        <hr className="apd-divider" />

        {/* ── Monetary ── */}
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

            {/* ── Payment Status Widget for Org/Admin ── */}
            <PaymentStatusWidget projectId={id} />

            <hr className="apd-divider" />
          </>
        )}

        {/* ── In-Kind ── */}
        {inKind.length > 0 && (
          <>
            <h2 className="apd-section-title">in-kind</h2>
            {inKind.map((item) => (
              <div key={item.id} className="apd-inkind-item-wrapper">
                <p className="apd-inkind-item">
                  <strong>{item.itemName}</strong> — {item.targetQuantity}{" "}
                  {item.unit ?? "units"}
                  {item.pricePerUnit && (
                    <span className="apd-inkind-price">
                      {" "}
                      @ ₱{Number(item.pricePerUnit).toLocaleString()}/unit
                    </span>
                  )}
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

        {/* ── Volunteer ── */}
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
                      ` to ${new Date(project.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        },
                      )}`}
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
