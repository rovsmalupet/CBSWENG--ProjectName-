import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DonorHomepage.css";

export default function DonorHomepage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [bookmarkedProjects, setBookmarkedProjects] = useState(() => {
    const saved = localStorage.getItem('bookmarkedProjects');
    return saved ? JSON.parse(saved) : [];
  });
  const [filters, setFilters] = useState({
    cause: "Any",
    urgency: "Any",
    region: "Any",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [campaigns, filters, searchQuery, sortBy]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts/approved");
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("error fetching campaigns:", error);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...campaigns];

    // apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.projectName?.toLowerCase().includes(query) ||
          campaign.description?.toLowerCase().includes(query) ||
          campaign.location?.toLowerCase().includes(query)
      );
    }

    // apply cause filter
    if (filters.cause !== "Any") {
      filtered = filtered.filter((campaign) =>
        campaign.causes?.includes(filters.cause)
      );
    }

    // apply urgency filter
    if (filters.urgency !== "Any") {
      filtered = filtered.filter(
        (campaign) => campaign.priority === filters.urgency
      );
    }

    // apply region filter
    if (filters.region !== "Any") {
      filtered = filtered.filter((campaign) =>
        campaign.location?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    // apply sorting
    filtered = sortCampaigns(filtered);

    setFilteredCampaigns(filtered);
  };

  const sortCampaigns = (campaignsList) => {
    const sorted = [...campaignsList];
    switch (sortBy) {
      case "urgency":
        return sorted.sort((a, b) => {
          const priority = { High: 3, Medium: 2, Low: 1 };
          return priority[b.priority] - priority[a.priority];
        });
      case "progress":
        return sorted.sort((a, b) => {
          const progressA = calculateProgress(
            a.supportTypes.monetary.currentAmount,
            a.supportTypes.monetary.targetAmount
          );
          const progressB = calculateProgress(
            b.supportTypes.monetary.currentAmount,
            b.supportTypes.monetary.targetAmount
          );
          return progressB - progressA;
        });
      case "amount":
        return sorted.sort(
          (a, b) =>
            (b.supportTypes.monetary.targetAmount || 0) -
            (a.supportTypes.monetary.targetAmount || 0)
        );
      case "date":
        return sorted.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
          const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
          return dateB - dateA;
        });
      case "latest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const toggleBookmark = (e, campaignId) => {
    e.stopPropagation();
    setBookmarkedProjects(prev => {
      const isBookmarked = prev.includes(campaignId);
      const updated = isBookmarked
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId];
      localStorage.setItem('bookmarkedProjects', JSON.stringify(updated));
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

  const calculateProgress = (raised, target) => {
    return Math.round((raised / target) * 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="donor-homepage">
      <div className="donor-header">
        <h2 className="greeting">Hello, Isa!</h2>
        <button 
          className="bookmarks-nav-btn"
          onClick={() => navigate('/donor/bookmarks')}
        >
          BOOKMARKS
        </button>
      </div>

      <div className="donor-main">
        <div className="campaigns-section">
          <div className="section-header">
            <h3 className="section-title">Active Campaigns</h3>
            <p className="section-subtitle">
              {filteredCampaigns.length} campaign
              {filteredCampaigns.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="search-sort-bar">
            <input
              type="text"
              placeholder="search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">latest</option>
              <option value="date">project date</option>
              <option value="urgency">most urgent</option>
              <option value="progress">highest progress</option>
              <option value="amount">highest target</option>
            </select>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <label>cause:</label>
              <select
                value={filters.cause}
                onChange={(e) => handleFilterChange("cause", e.target.value)}
                className="filter-select"
              >
                <option value="Any">any</option>
                <option value="disasterRelief">disaster relief</option>
                <option value="healthAndMedical">health & medical</option>
                <option value="educationAndChildren">education</option>
                <option value="environmentAndClimate">environment</option>
                <option value="povertyAndHunger">poverty & hunger</option>
                <option value="communityDevelopment">community dev</option>
                <option value="livelihoodAndSkillsTraining">livelihood</option>
                <option value="animalWelfare">animal welfare</option>
                <option value="others">others</option>
              </select>
            </div>

            <div className="filter-group">
              <label>urgency:</label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange("urgency", e.target.value)}
                className="filter-select"
              >
                <option value="Any">any</option>
                <option value="High">high</option>
                <option value="Medium">medium</option>
                <option value="Low">low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>region:</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="filter-select"
              >
                <option value="Any">any</option>
                <option value="Luzon">luzon</option>
                <option value="Visayas">visayas</option>
                <option value="Mindanao">mindanao</option>
              </select>
            </div>
          </div>

          <div className="campaigns-grid">
            {filteredCampaigns.map((campaign) => {
              const monetaryEnabled = campaign.supportTypes?.monetary?.enabled;
              const volunteerEnabled =
                campaign.supportTypes?.volunteer?.enabled;
              const inKindEnabled =
                campaign.supportTypes?.inKind?.length > 0;

              const raised = campaign.supportTypes?.monetary?.currentAmount || 0;
              const target = campaign.supportTypes?.monetary?.targetAmount || 1;
              const remaining = Math.max(0, target - raised);
              const progress = calculateProgress(raised, target);

              const inKindItems = campaign.supportTypes?.inKind || [];
              const volunteerTarget = campaign.supportTypes?.volunteer?.targetVolunteers || 0;
              const volunteerCurrent = campaign.supportTypes?.volunteer?.currentVolunteers || 0;
              const volunteerRemaining = Math.max(0, volunteerTarget - volunteerCurrent);

              // truncate title and description
              const truncateText = (text, maxLength) => {
                if (!text) return "";
                return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
              };

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
                      <span className={`priority-badge priority-${campaign.priority?.toLowerCase()}`}>
                        {campaign.priority?.toLowerCase() || "medium"}
                      </span>
                    </div>
                    <button
                      className={`bookmark-btn ${bookmarkedProjects.includes(campaign.id) ? 'bookmarked' : ''}`}
                      onClick={(e) => toggleBookmark(e, campaign.id)}
                      title={bookmarkedProjects.includes(campaign.id) ? "Remove bookmark" : "Bookmark project"}
                    >
                      {bookmarkedProjects.includes(campaign.id) ? '★' : '☆'}
                    </button>
                  </div>

                  <h4 className="campaign-title" title={campaign.projectName}>
                    {truncateText(campaign.projectName, 60)}
                  </h4>
                  <p className="campaign-description" title={campaign.description}>
                    {truncateText(campaign.description, 100)}
                  </p>

                  <div className="campaign-meta">
                    <div className="meta-item">
                      <span className="meta-label">location:</span>
                      <span>{campaign.location || "not specified"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">org:</span>
                      <span>{truncateText(campaign.orgName || "organization", 30)}</span>
                    </div>
                    {(campaign.startDate || campaign.endDate) && (
                      <div className="meta-item">
                        <span className="meta-label">dates:</span>
                        <span>
                          {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : ""}
                          {campaign.endDate ? ` - ${new Date(campaign.endDate).toLocaleDateString()}` : ""}
                        </span>
                      </div>
                    )}
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

                  {/* Monetary Support - Show remaining amount needed */}
                  {monetaryEnabled && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">monetary support needed</div>
                        <div className="resource-amount">
                          ₱{formatCurrency(remaining)} <span className="resource-unit">php</span>
                        </div>
                        <div className="resource-detail">
                          target: ₱{formatCurrency(target)} • raised: ₱{formatCurrency(raised)} ({progress}%)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* In-Kind Support - Show specific items needed */}
                  {inKindEnabled && inKindItems.length > 0 && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">in-kind items needed</div>
                        <ul className="inkind-list">
                          {inKindItems.slice(0, 3).map((item) => {
                            const itemRemaining = Math.max(0, item.targetQuantity - (item.currentQuantity || 0));
                            return (
                              <li key={item.id} className="inkind-item">
                                <strong>{item.itemName}</strong>: {itemRemaining} {item.unit || "units"}
                              </li>
                            );
                          })}
                          {inKindItems.length > 3 && (
                            <li className="inkind-more">+{inKindItems.length - 3} more items</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Volunteer Support - Show volunteers needed */}
                  {volunteerEnabled && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">volunteers needed</div>
                        <div className="resource-amount">
                          {volunteerRemaining} <span className="resource-unit">volunteers</span>
                        </div>
                        <div className="resource-detail">
                          target: {volunteerTarget} • committed: {volunteerCurrent}
                        </div>
                        {(campaign.startTime || campaign.endTime) && (
                          <div className="resource-schedule">
                            time: {campaign.startTime || ""} {campaign.endTime ? `- ${campaign.endTime}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="no-campaigns">
              <p>no campaigns found matching your filters.</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setFilters({ cause: "Any", urgency: "Any", region: "Any" });
                  setSearchQuery("");
                }}
              >
                clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
