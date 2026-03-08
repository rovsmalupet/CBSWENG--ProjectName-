import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DonorHomepage.css";

export default function DonorHomepage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
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
        <h2 className="greeting">hello, isa!</h2>
      </div>

      <div className="donor-main">
        <div className="campaigns-section">
          <div className="section-header">
            <h3 className="section-title">active campaigns</h3>
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
              const progress = calculateProgress(raised, target);

              return (
                <div
                  key={campaign.id}
                  className="campaign-card"
                  onClick={() => navigate(`/project/${campaign.id}`)}
                >
                  <div className="card-header">
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

                  <h4 className="campaign-title">{campaign.projectName}</h4>
                  <p className="campaign-description">
                    {campaign.description?.substring(0, 120)}
                    {campaign.description?.length > 120 ? "..." : ""}
                  </p>

                  <div className="campaign-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span>{campaign.location || "not specified"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🏢</span>
                      <span>{campaign.orgName || "organization"}</span>
                    </div>
                  </div>

                  <div className="support-types">
                    {monetaryEnabled && (
                      <span className="support-badge">💰 monetary</span>
                    )}
                    {inKindEnabled && (
                      <span className="support-badge">📦 in-kind</span>
                    )}
                    {volunteerEnabled && (
                      <span className="support-badge">🤝 volunteer</span>
                    )}
                  </div>

                  {monetaryEnabled && (
                    <>
                      <div className="campaign-stats">
                        <div className="stat">
                          <span className="stat-label">raised</span>
                          <span className="stat-value">
                            ₱{formatCurrency(raised)}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">target</span>
                          <span className="stat-value">
                            ₱{formatCurrency(target)}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">progress</span>
                          <span className="stat-value">{progress}%</span>
                        </div>
                      </div>

                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
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
