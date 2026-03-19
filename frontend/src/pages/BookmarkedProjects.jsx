import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/BookmarkedProjects.css";

export default function BookmarkedProjects() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const bookmarkKey = `bookmarkedProjects_${userId}`;

  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [bookmarkedProjects, setBookmarkedProjects] = useState(() => {
    const saved = localStorage.getItem(bookmarkKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchBookmarkedCampaigns();
  }, [bookmarkedProjects]);

  const fetchBookmarkedCampaigns = async () => {
    if (bookmarkedProjects.length === 0) {
      setBookmarkedCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      // fetch all approved posts
      const { getApiUrl, apiFetch } = await import("../config/api");
      const data = await apiFetch(getApiUrl("/posts/approved"));

      // filter only bookmarked ones
      const bookmarked = data.filter((campaign) =>
        bookmarkedProjects.includes(campaign.id),
      );

      setBookmarkedCampaigns(sortCampaigns(bookmarked));
    } catch (error) {
      console.error("error fetching bookmarked campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortCampaigns = (campaignsList) => {
    const sorted = [...campaignsList];
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
  };

  const toggleBookmark = (e, campaignId) => {
    e.stopPropagation();
    setBookmarkedProjects((prev) => {
      const updated = prev.filter((id) => id !== campaignId);
      localStorage.setItem(bookmarkKey, JSON.stringify(updated));
      return updated;
    });
  };

  const getCauseDisplay = (cause) => {
    const causeMap = {
      disasterRelief: "disaster relief",
      healthAndMedical: "health & medical",
      educationAndChildren: "education",
      environmentAndClimate: "environment",
      povertyAndHunger: "poverty & hunger",
      communityDevelopment: "community dev",
      livelihoodAndSkillsTraining: "livelihood",
      animalWelfare: "animal welfare",
      others: "others",
    };
    return causeMap[cause] || cause;
  };

  const getCauseColor = (cause) => {
    const colors = {
      disasterRelief: "#ef4444",
      healthAndMedical: "#3b82f6",
      educationAndChildren: "#8b5cf6",
      environmentAndClimate: "#10b981",
      povertyAndHunger: "#f59e0b",
      communityDevelopment: "#06b6d4",
      livelihoodAndSkillsTraining: "#ec4899",
      animalWelfare: "#84cc16",
      others: "#6b7280",
    };
    return colors[cause] || "#6b7280";
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

  useEffect(() => {
    if (!loading) {
      setBookmarkedCampaigns(sortCampaigns(bookmarkedCampaigns));
    }
  }, [sortBy]);

  if (loading) {
    return (
      <div className="bookmarked-page">
        <div className="bookmarked-header">
          <button onClick={() => navigate("/donor")} className="back-btn">
            ← back to campaigns
          </button>
          <h2 className="page-title">Bookmarked Projects</h2>
        </div>
        <div className="loading-state">loading...</div>
      </div>
    );
  }

  return (
    <div className="bookmarked-page">
      <div className="bookmarked-header">
        <button onClick={() => navigate("/donor")} className="back-btn">
          ← back to campaigns
        </button>
        <h2 className="page-title">Bookmarked Projects</h2>
      </div>

      <div className="bookmarked-main">
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
                        <span
                          className={`priority-badge priority-${campaign.priority?.toLowerCase()}`}
                        >
                          {campaign.priority?.toLowerCase() || "medium"}
                        </span>
                      </div>
                      <button
                        className="bookmark-btn bookmarked"
                        onClick={(e) => toggleBookmark(e, campaign.id)}
                        title="remove bookmark"
                        aria-label="remove bookmark"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>
                    </div>

                    <h4 className="campaign-title" title={campaign.projectName}>
                      {truncateText(campaign.projectName, 60)}
                    </h4>
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