import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DonorHomepage.css";

export default function DonorHomepage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filters, setFilters] = useState({
    cause: "Any",
    urgency: "High",
    region: "Luzon",
  });

  useEffect(() => {
    // TODO: Fetch campaigns from backend API
    // For now, using mock data
    const mockCampaigns = [
      {
        id: 1,
        projectName: "Batangas Typhoon Support",
        description: "Food and med packs for 2,000 households.",
        cause: "disasterRelief",
        urgency: "High",
        region: "Luzon",
        category: "URGENT RELIEF",
        categoryColor: "#ff6b6b",
        verified: true,
        raised: 1200000,
        target: 1411765,
        currency: "₱",
      },
      {
        id: 2,
        projectName: "Mobile Clinic Supply Hub",
        description: "Sterile surgical equipment replenishment.",
        cause: "healthAndMedical",
        urgency: "High",
        region: "Luzon",
        category: "HEALTH",
        categoryColor: "#4dabf7",
        verified: true,
        raised: 300021,
        target: 1000000,
        currency: "₱",
      },
      {
        id: 3,
        projectName: "Digital Literacy Philippines",
        description: "Laptop drives for 15 rural school centers.",
        cause: "educationAndChildren",
        urgency: "Medium",
        region: "Luzon",
        category: "EDUCATION",
        categoryColor: "#51cf66",
        verified: true,
        raised: 100021,
        target: 656000,
        currency: "₱",
      },
    ];

    setCampaigns(mockCampaigns);
    setFilteredCampaigns(mockCampaigns);
  }, []);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Apply filters
    const filtered = campaigns.filter((campaign) => {
      if (newFilters.cause !== "Any" && campaign.cause !== newFilters.cause) {
        return false;
      }
      if (
        newFilters.urgency !== "Any" &&
        campaign.urgency !== newFilters.urgency
      ) {
        return false;
      }
      if (
        newFilters.region !== "Any" &&
        campaign.region !== newFilters.region
      ) {
        return false;
      }
      return true;
    });

    setFilteredCampaigns(filtered);
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
      </div>

      <div className="donor-main">
        <div className="campaigns-section">
          <div className="section-header">
            <h3 className="section-title">Active Campaigns</h3>
            <p className="section-subtitle">
              Refining results for "
              <span className="highlight">{filters.cause}</span>"
            </p>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <label>Cause:</label>
              <select
                value={filters.cause}
                onChange={(e) => handleFilterChange("cause", e.target.value)}
                className="filter-select"
              >
                <option value="Any">Any</option>
                <option value="disasterRelief">Disaster Relief</option>
                <option value="healthAndMedical">Health & Medical</option>
                <option value="educationAndChildren">Education</option>
                <option value="environmentAndClimate">Environment</option>
                <option value="povertyAndHunger">Poverty & Hunger</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Urgency:</label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange("urgency", e.target.value)}
                className="filter-select"
              >
                <option value="Any">Any</option>
                <option value="High">High+</option>
                <option value="Medium">Medium</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Region:</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="filter-select"
              >
                <option value="Any">Any</option>
                <option value="Luzon">Luzon</option>
                <option value="Visayas">Visayas</option>
                <option value="Mindanao">Mindanao</option>
              </select>
            </div>
          </div>

          <div className="campaigns-grid">
            {filteredCampaigns.map((campaign) => {
              const progress = calculateProgress(
                campaign.raised,
                campaign.target,
              );
              return (
                <div
                  key={campaign.id}
                  className="campaign-card"
                  onClick={() => navigate(`/project/${campaign.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-header">
                    <span
                      className="category-badge"
                      style={{ backgroundColor: campaign.categoryColor }}
                    >
                      {campaign.category}
                    </span>
                    {campaign.verified && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </div>

                  <h4 className="campaign-title">{campaign.projectName}</h4>
                  <p className="campaign-description">{campaign.description}</p>

                  <div className="campaign-stats">
                    <div className="stat">
                      <span className="stat-label">Raised</span>
                      <span className="stat-value">
                        {campaign.currency}
                        {formatCurrency(campaign.raised)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Progress</span>
                      <span className="stat-value">{progress}%</span>
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="no-campaigns">
              <p>No campaigns found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
