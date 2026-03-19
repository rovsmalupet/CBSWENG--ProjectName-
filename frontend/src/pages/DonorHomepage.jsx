import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/DonorHomepage.css";

const ASEAN_COUNTRIES = [
  "Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia",
  "Myanmar", "Philippines", "Singapore", "Thailand", "Vietnam",
];

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

const normalizeCauseKey = (raw) => {
  if (!raw) return "others";
  if (CAUSE_STYLES[raw]) return raw;
  const normalized = raw.toLowerCase().replace(/[\s_\-]+/g, "");
  const match = Object.keys(CAUSE_STYLES).find(
    (key) => key.toLowerCase() === normalized
  );
  return match || "others";
};

export default function DonorHomepage() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("userFirstName") || "Donor";
  const userId = localStorage.getItem("userId");
  const userCountry = localStorage.getItem("userCountry") || "Philippines";
  const bookmarkKey = `bookmarkedProjects_${userId}`;

  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [bookmarkedProjects, setBookmarkedProjects] = useState(() => {
    const saved = localStorage.getItem(bookmarkKey);
    if (!saved) return [];
    try { return JSON.parse(saved); } catch { return []; }
  });

  const [filters, setFilters] = useState({
    cause: "Any",
    urgency: "Any",
    country: userCountry,
    region: "Any",
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(getApiUrl("/posts/approved"));
        if (!response.ok) { setCampaigns([]); return; }
        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("error fetching campaigns:", error);
        setCampaigns([]);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) => c.projectName?.toLowerCase().includes(query) ||
               c.description?.toLowerCase().includes(query) ||
               c.location?.toLowerCase().includes(query),
      );
    }

    if (filters.cause !== "Any") {
      filtered = filtered.filter((c) => c.causes?.includes(filters.cause));
    }

    if (filters.urgency !== "Any") {
      filtered = filtered.filter((c) => c.priority === filters.urgency);
    }

    if (filters.country !== "Any") {
      filtered = filtered.filter((c) => c.orgCountry === filters.country);
    }

    if (filters.country === "Philippines" && filters.region !== "Any") {
      filtered = filtered.filter((campaign) => {
        const location = campaign.location?.toLowerCase() || "";
        const regionMap = {
          luzon: [
            "batangas", "manila", "quezon city", "caloocan", "pasig", "taguig", "makati",
            "muntinlupa", "parañaque", "las piñas", "valenzuela", "malabon", "navotas",
            "san juan", "mandaluyong", "marikina", "pasay", "laguna", "cavite", "rizal",
            "bulacan", "pampanga", "tarlac", "nueva ecija", "pangasinan", "la union",
            "ilocos norte", "ilocos sur", "abra", "benguet", "ifugao", "kalinga",
            "mountain province", "apayao", "cagayan", "isabela", "nueva vizcaya", "quirino",
            "aurora", "zambales", "bataan", "albay", "camarines norte", "camarines sur",
            "catanduanes", "masbate", "sorsogon", "marinduque", "occidental mindoro",
            "oriental mindoro", "palawan", "romblon", "metro manila", "ncr",
          ],
          visayas: [
            "cebu", "aklan", "antique", "capiz", "guimaras", "iloilo", "negros occidental",
            "bohol", "negros oriental", "siquijor", "biliran", "eastern samar", "leyte",
            "northern samar", "samar", "southern leyte", "tacloban", "bacolod", "iloilo city", "dumaguete",
          ],
          mindanao: [
            "davao", "zamboanga", "cagayan de oro", "general santos", "cotabato", "bukidnon",
            "camiguin", "lanao del norte", "misamis occidental", "misamis oriental",
            "compostela valley", "davao del norte", "davao del sur", "davao oriental",
            "davao occidental", "sarangani", "south cotabato", "sultan kudarat", "lanao del sur",
            "maguindanao", "basilan", "sulu", "tawi-tawi", "zamboanga del norte",
            "zamboanga del sur", "zamboanga sibugay", "agusan del norte", "agusan del sur",
            "surigao del norte", "surigao del sur", "dinagat islands",
          ],
        };
        const provinces = regionMap[filters.region.toLowerCase()] || [];
        return provinces.some((p) => location.includes(p));
      });
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "urgency": {
        const priority = { High: 3, Medium: 2, Low: 1 };
        filtered = sorted.sort((a, b) => priority[b.priority] - priority[a.priority]);
        break;
      }
      case "progress":
        filtered = sorted.sort((a, b) => {
          const aT = a.supportTypes?.monetary?.targetAmount || 1;
          const bT = b.supportTypes?.monetary?.targetAmount || 1;
          return Math.round((b.supportTypes?.monetary?.currentAmount / bT) * 100) -
                 Math.round((a.supportTypes?.monetary?.currentAmount / aT) * 100);
        });
        break;
      case "amount":
        filtered = sorted.sort((a, b) => (b.supportTypes?.monetary?.targetAmount || 0) - (a.supportTypes?.monetary?.targetAmount || 0));
        break;
      case "date":
        filtered = sorted.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
        break;
      case "latest":
      default:
        filtered = sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [campaigns, filters, searchQuery, sortBy]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "country" && value !== "Philippines") {
      setFilters({ ...filters, country: value, region: "Any" });
    } else {
      setFilters({ ...filters, [filterName]: value });
    }
  };

  const toggleBookmark = (e, campaignId) => {
    e.stopPropagation();
    setBookmarkedProjects((prev) => {
      const isBookmarked = prev.includes(campaignId);
      const updated = isBookmarked ? prev.filter((id) => id !== campaignId) : [...prev, campaignId];
      localStorage.setItem(bookmarkKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userCountry");
    navigate("/login");
  };

  const calculateProgress = (raised, target) => Math.round((raised / target) * 100);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="donor-homepage">
      <div className="donor-header">
        <h2 className="greeting">Hello, {firstName}!</h2>
        <div className="donor-header-actions">
          <button className="bookmarks-nav-btn" onClick={() => navigate("/donor/partnerships")}>PARTNERSHIPS</button>
          <button className="bookmarks-nav-btn" onClick={() => navigate("/donor/bookmarks")}>BOOKMARKS</button>
          <button className="switch-account-btn" onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>

      <div className="donor-main">
        <div className="campaigns-section">
          <div className="section-header">
            <h3 className="section-title">Active Campaigns</h3>
            <p className="section-subtitle">{filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""} found</p>
          </div>

          <div className="search-sort-bar">
            <input type="text" placeholder="search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
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
              <select value={filters.cause} onChange={(e) => handleFilterChange("cause", e.target.value)} className="filter-select">
                <option value="Any">any</option>
                {Object.entries(CAUSE_STYLES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label.toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>urgency:</label>
              <select value={filters.urgency} onChange={(e) => handleFilterChange("urgency", e.target.value)} className="filter-select">
                <option value="Any">any</option>
                <option value="High">high</option>
                <option value="Medium">medium</option>
                <option value="Low">low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>country:</label>
              <select value={filters.country} onChange={(e) => handleFilterChange("country", e.target.value)} className="filter-select">
                <option value="Any">any</option>
                {ASEAN_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c.toLowerCase()}</option>
                ))}
              </select>
            </div>

            {filters.country === "Philippines" && (
              <div className="filter-group">
                <label>region:</label>
                <select value={filters.region} onChange={(e) => handleFilterChange("region", e.target.value)} className="filter-select">
                  <option value="Any">any</option>
                  <option value="Luzon">luzon</option>
                  <option value="Visayas">visayas</option>
                  <option value="Mindanao">mindanao</option>
                </select>
              </div>
            )}
          </div>

          <div className="campaigns-grid">
            {filteredCampaigns.map((campaign) => {
              const monetaryEnabled = campaign.supportTypes?.monetary?.enabled;
              const volunteerEnabled = campaign.supportTypes?.volunteer?.enabled;
              const inKindEnabled = campaign.supportTypes?.inKind?.length > 0;
              const raised = campaign.supportTypes?.monetary?.currentAmount || 0;
              const target = campaign.supportTypes?.monetary?.targetAmount || 1;
              const remaining = Math.max(0, target - raised);
              const progress = calculateProgress(raised, target);
              const inKindItems = campaign.supportTypes?.inKind || [];
              const volunteerTarget = campaign.supportTypes?.volunteer?.targetVolunteers || 0;
              const volunteerCurrent = campaign.supportTypes?.volunteer?.currentVolunteers || 0;
              const volunteerRemaining = Math.max(0, volunteerTarget - volunteerCurrent);

              return (
                <div key={campaign.id} className="campaign-card" onClick={() => navigate(`/project/${campaign.id}`)}>
                  <div className="card-header">
                    <div className="card-badges">
                      {campaign.causes?.map((causeKey, idx) => {
                        const style = CAUSE_STYLES[normalizeCauseKey(causeKey)];
                        return (
                          <span key={idx} className="category-badge" style={{ backgroundColor: style.bg, color: style.color }}>
                            {style.label}
                          </span>
                        );
                      })}
                      <span className={`priority-badge priority-${campaign.priority?.toLowerCase()}`}>
                        {campaign.priority?.toLowerCase() || "medium"}
                      </span>
                    </div>
                    <button
                      className={`bookmark-btn ${bookmarkedProjects.includes(campaign.id) ? "bookmarked" : ""}`}
                      onClick={(e) => toggleBookmark(e, campaign.id)}
                      title={bookmarkedProjects.includes(campaign.id) ? "Remove bookmark" : "Bookmark project"}
                      aria-label={bookmarkedProjects.includes(campaign.id) ? "Remove bookmark" : "Bookmark project"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarkedProjects.includes(campaign.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  </div>

                  <h4 className="campaign-title" title={campaign.projectName}>{truncateText(campaign.projectName, 60)}</h4>
                  <p className="campaign-description" title={campaign.description}>{truncateText(campaign.description, 100)}</p>

                  <div className="campaign-meta">
                    <div className="meta-item"><span className="meta-label">location:</span><span>{campaign.location || "not specified"}</span></div>
                    <div className="meta-item">
                      <span className="meta-label">org:</span>
                      <span>{truncateText(campaign.orgName || "organization", 30)}</span>
                      {campaign.orgIsVerified && (
                        <button
                          type="button"
                          className="verified-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/organization/${campaign.orgId}/verification`);
                          }}
                        >
                          Verified NGO
                        </button>
                      )}
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
                    {monetaryEnabled && <span className="support-badge">monetary</span>}
                    {inKindEnabled && <span className="support-badge">in-kind</span>}
                    {volunteerEnabled && <span className="support-badge">volunteer</span>}
                  </div>

                  {monetaryEnabled && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">monetary support needed</div>
                        <div className="resource-amount">₱{formatCurrency(remaining)} <span className="resource-unit">php</span></div>
                        <div className="resource-detail">target: ₱{formatCurrency(target)} • raised: ₱{formatCurrency(raised)} ({progress}%)</div>
                      </div>
                    </div>
                  )}

                  {inKindEnabled && inKindItems.length > 0 && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">in-kind items needed</div>
                        <ul className="inkind-list">
                          {inKindItems.slice(0, 3).map((item) => {
                            const itemRemaining = Math.max(0, item.targetQuantity - (item.currentQuantity || 0));
                            return <li key={item.id} className="inkind-item"><strong>{item.itemName}</strong>: {itemRemaining} {item.unit || "units"}</li>;
                          })}
                          {inKindItems.length > 3 && <li className="inkind-more">+{inKindItems.length - 3} more items</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {volunteerEnabled && (
                    <div className="resource-needs">
                      <div className="resource-section">
                        <div className="resource-header">volunteers needed</div>
                        <div className="resource-amount">{volunteerRemaining} <span className="resource-unit">volunteers</span></div>
                        <div className="resource-detail">target: {volunteerTarget} • committed: {volunteerCurrent}</div>
                        {(campaign.startTime || campaign.endTime) && (
                          <div className="resource-schedule">time: {campaign.startTime || ""}{campaign.endTime ? ` - ${campaign.endTime}` : ""}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="campaign-actions">
                    <button
                      type="button"
                      className="support-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/add-contribution/${campaign.id}`);
                      }}
                    >
                      Support Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="no-campaigns">
              <p>no campaigns found matching your filters.</p>
              <button className="clear-filters-btn" onClick={() => { setFilters({ cause: "Any", urgency: "Any", country: userCountry, region: "Any" }); setSearchQuery(""); }}>
                clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}