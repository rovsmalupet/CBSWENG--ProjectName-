import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiFetch, getApiUrl } from "../config/api.js";
import {
  loadBookmarks,
  MAX_BOOKMARK_NOTE_LENGTH,
  removeBookmark,
  updateBookmarkNote,
} from "../utils/bookmarks.js";
import "../css/BookmarkedProjects.css";

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
  decentWork: {
    label: "Livelihood And Skills Training",
    bg: "#A21942",
    color: "#fff",
  },
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

export default function BookmarkedProjects() {
  const navigate = useNavigate();
  const [approvedCampaigns, setApprovedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState("");
  const [noteStatus, setNoteStatus] = useState({});

  useEffect(() => {
    let cancelled = false;
    const fetchPageData = async () => {
      try {
        const [campaignData, bookmarkData] = await Promise.all([
          apiFetch(getApiUrl("/posts/approved")),
          loadBookmarks(),
        ]);
        if (!cancelled) {
          setApprovedCampaigns(Array.isArray(campaignData) ? campaignData : []);
          setBookmarks(Array.isArray(bookmarkData) ? bookmarkData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setApprovedCampaigns([]);
          setBookmarks([]);
          setError(err.message || "Could not load your bookmarks.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPageData();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookmarkedCampaigns = useMemo(() => {
    const ids = new Set(bookmarks.map((entry) => entry.projectId));
    const sorted = approvedCampaigns.filter((campaign) => ids.has(campaign.id));
    switch (sortBy) {
      case "urgency":
        return sorted.sort((a, b) => {
          const priority = { High: 3, Medium: 2, Low: 1 };
          return priority[b.priority] - priority[a.priority];
        });
      case "date":
        return sorted.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
          return dateB - dateA;
        });
      case "latest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  }, [approvedCampaigns, bookmarks, sortBy]);

  const toggleBookmark = async (e, bookmarkId) => {
    e.stopPropagation();
    setError("");
    try {
      await removeBookmark(bookmarkId);
      setBookmarks((previous) =>
        previous.filter((entry) => entry.id !== bookmarkId),
      );
    } catch (err) {
      setError(err.message || "Could not remove this bookmark.");
    }
  };

  const handleNoteChange = (bookmarkId, note) => {
    setBookmarks((previous) =>
      previous.map((entry) =>
        entry.id === bookmarkId ? { ...entry, note } : entry,
      ),
    );
    setNoteStatus((previous) => ({ ...previous, [bookmarkId]: "changed" }));
  };

  const saveNote = async (event, bookmark) => {
    event.stopPropagation();
    setNoteStatus((previous) => ({ ...previous, [bookmark.id]: "saving" }));
    try {
      const updated = await updateBookmarkNote(bookmark.id, bookmark.note);
      setBookmarks((previous) =>
        previous.map((entry) =>
          entry.id === bookmark.id ? updated : entry,
        ),
      );
      setNoteStatus((previous) => ({ ...previous, [bookmark.id]: "saved" }));
    } catch (err) {
      setNoteStatus((previous) => ({ ...previous, [bookmark.id]: "error" }));
      setError(err.message || "Could not save that note.");
    }
  };

  const getCauseDisplay = (cause) => {
    const normalized = normalizeCauseKey(cause);
    return CAUSE_STYLES[normalized].label;
  };

  const getCauseColor = (cause) => {
    const normalized = normalizeCauseKey(cause);
    return CAUSE_STYLES[normalized].bg;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (loading) {
    return (
      <div className="bookmarked-page">
        <div className="bookmarked-header">
          <button onClick={() => navigate("/donor")} className="back-btn">
            ← back
          </button>
          <h2 className="page-title">Bookmarked Projects</h2>
        </div>
        <div className="loading-state">loading...</div>
      </div>
    );
  }

  return (
    <div className="bookmarked-page">
      <Navbar hiddenItems={["bookmarks"]} />
      <div className="bookmarked-header">
        <button onClick={() => navigate("/donor")} className="back-btn">
          ← back
        </button>
        <h2 className="page-title">Bookmarked Projects</h2>
      </div>

      <div className="bookmarked-main">
        {error && <p className="bookmark-error" role="alert">{error}</p>}
        {bookmarkedCampaigns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">NONE</div>
            <h3>no bookmarked projects yet</h3>
            <p>bookmark campaigns to see them here for easy access</p>
            <button className="browse-btn" onClick={() => navigate("/donor")}>
              browse campaigns
            </button>
          </div>
        ) : (
          <>
            <div className="bookmarked-controls">
              <p className="bookmarked-count">
                {bookmarkedCampaigns.length} bookmarked project
                {bookmarkedCampaigns.length !== 1 ? "s" : ""}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="latest">latest</option>
                <option value="date">project date</option>
                <option value="urgency">most urgent</option>
              </select>
            </div>

            <div className="campaigns-grid">
              {bookmarkedCampaigns.map((campaign) => {
                const monetaryEnabled =
                  campaign.supportTypes?.monetary?.enabled;
                const inKindEnabled = campaign.supportTypes?.inKind?.length > 0;
                const volunteerEnabled =
                  campaign.supportTypes?.volunteer?.enabled;

                const raised =
                  campaign.supportTypes?.monetary?.currentAmount || 0;
                const target =
                  campaign.supportTypes?.monetary?.targetAmount || 1;
                const remaining = Math.max(0, target - raised);
                const bookmark = bookmarks.find(
                  (entry) => entry.projectId === campaign.id,
                );

                return (
                  <div
                    key={campaign.id}
                    className="campaign-card"
                    onClick={() => navigate(`/project/${campaign.id}`)}
                  >
                    <div className="card-header">
                      <div className="card-badges">
                        {campaign.causes?.map((cause, idx) => (
                          <span
                            key={idx}
                            className="category-badge"
                            style={{ backgroundColor: getCauseColor(cause) }}
                          >
                            {getCauseDisplay(cause)}
                          </span>
                        ))}
                      </div>
                      <button
                        className="bookmark-btn bookmarked"
                        onClick={(e) => toggleBookmark(e, bookmark.id)}
                        title="remove bookmark"
                        aria-label="remove bookmark"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                      </button>
                    </div>

                    <h4 className="campaign-title" title={campaign.projectName}>
                      {truncateText(campaign.projectName, 60)}
                    </h4>
                    <span
                      className={`priority-badge priority-${campaign.priority?.toLowerCase()}`}
                    >
                      {campaign.priority?.toLowerCase() || "medium"}
                    </span>
                    <p
                      className="campaign-description"
                      title={campaign.description}
                    >
                      {truncateText(campaign.description, 100)}
                    </p>

                    <div className="campaign-meta">
                      <div className="meta-item">
                        <span className="meta-label">location:</span>
                        <span>{campaign.location || "not specified"}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">org:</span>
                        <span>
                          {truncateText(campaign.orgName || "organization", 30)}
                        </span>
                      </div>
                    </div>

                    <div className="support-types">
                      {monetaryEnabled && (
                        <span className="support-badge">monetary</span>
                      )}
                      {inKindEnabled && (
                        <span className="support-badge">in-kind</span>
                      )}
                      {volunteerEnabled && (
                        <span className="support-badge">volunteer</span>
                      )}
                    </div>

                    <div
                      className="bookmark-note-editor"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <label htmlFor={`bookmark-note-${campaign.id}`}>
                        Personal note
                      </label>
                      <textarea
                        id={`bookmark-note-${campaign.id}`}
                        value={bookmark?.note ?? ""}
                        maxLength={MAX_BOOKMARK_NOTE_LENGTH}
                        disabled={noteStatus[bookmark.id] === "saving"}
                        rows="3"
                        placeholder="Add a reminder about this project..."
                        onChange={(event) =>
                          handleNoteChange(bookmark.id, event.target.value)
                        }
                      />
                      <small>
                        {noteStatus[bookmark.id] === "saving"
                          ? "Saving…"
                          : noteStatus[bookmark.id] === "saved"
                            ? "Saved"
                            : noteStatus[bookmark.id] === "error"
                              ? "Not saved"
                              : "Private note"}
                        {" · "}{bookmark?.note?.length ?? 0}/
                        {MAX_BOOKMARK_NOTE_LENGTH}
                      </small>
                      <button
                        type="button"
                        className="bookmark-note-save"
                        disabled={noteStatus[bookmark.id] === "saving"}
                        onClick={(event) => saveNote(event, bookmark)}
                      >
                        Save note
                      </button>
                    </div>

                    {monetaryEnabled && (
                      <div className="resource-needs">
                        <div className="resource-section">
                          <div className="resource-header">
                            monetary support needed
                          </div>
                          <div className="resource-amount">
                            ₱{formatCurrency(remaining)}{" "}
                            <span className="resource-unit">php</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
