import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getApiUrl } from "../config/api.js";
import "../css/OrganizationPartnershipOffers.css";

const COMPANY_PROFILES = [
  {
    name: "PacificAid Logistics",
    sector: "Logistics",
    supportFocus: "In-kind supplies and transport",
    annualBudget: "PHP 2.5M",
    certifications: ["ISO 9001", "ESG Verified"],
  },
  {
    name: "Northstar Energy Corp",
    sector: "Energy",
    supportFocus: "Monetary grants and volunteers",
    annualBudget: "PHP 3.2M",
    certifications: ["CSR Platinum", "Carbon Neutral"],
  },
  {
    name: "BlueRiver Foods Inc",
    sector: "Food and Beverage",
    supportFocus: "Food packs and community nutrition",
    annualBudget: "PHP 1.8M",
    certifications: ["HACCP", "CSR Gold"],
  },
  {
    name: "SummitTech Solutions",
    sector: "Technology",
    supportFocus: "Digital tools and direct funding",
    annualBudget: "PHP 2.1M",
    certifications: ["Data Secure", "CSR Silver"],
  },
];

function scoreOffer(project, company, index) {
  let score = 60;
  if (project.priority === "High") score += 15;
  if ((project.causes || []).length > 1) score += 8;
  if (company.supportFocus.toLowerCase().includes("monetary")) score += 6;
  if (index % 2 === 0) score += 4;
  return Math.min(95, score);
}

export default function OrganizationPartnershipOffers() {
  const navigate = useNavigate();
  const orgId = localStorage.getItem("userId") || "ngo";
  const storageKey = `partnershipOffers_${orgId}`;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);

        const cached = localStorage.getItem(storageKey);
        if (cached) {
          setOffers(JSON.parse(cached));
          return;
        }

        const projects = await apiFetch(getApiUrl("/posts"));
        const baseProjects = Array.isArray(projects) ? projects.slice(0, 8) : [];

        const generatedOffers = baseProjects.map((project, index) => {
          const company = COMPANY_PROFILES[index % COMPANY_PROFILES.length];
          return {
            id: `${project.id}-${index}`,
            companyName: company.name,
            sector: company.sector,
            supportFocus: company.supportFocus,
            annualBudget: company.annualBudget,
            certifications: company.certifications,
            projectId: project.id,
            projectName: project.projectName,
            projectPriority: project.priority,
            suitabilityScore: scoreOffer(project, company, index),
            proposedValue: `PHP ${(450000 + index * 90000).toLocaleString("en-PH")}`,
            status: "pending",
          };
        });

        setOffers(generatedOffers);
        localStorage.setItem(storageKey, JSON.stringify(generatedOffers));
      } catch (err) {
        console.error("Failed to load partnership offers:", err);
        setError(err.message || "Failed to load partnership offers.");
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [storageKey]);

  const updateOfferStatus = (offerId, status) => {
    const updated = offers.map((offer) =>
      offer.id === offerId ? { ...offer, status } : offer,
    );
    setOffers(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return offers.filter((offer) => {
      if (statusFilter !== "all" && offer.status !== statusFilter) return false;
      if (!query) return true;

      return (
        offer.companyName.toLowerCase().includes(query) ||
        offer.projectName.toLowerCase().includes(query) ||
        offer.sector.toLowerCase().includes(query) ||
        offer.supportFocus.toLowerCase().includes(query)
      );
    });
  }, [offers, search, statusFilter]);

  return (
    <div className="offers-page">
      <main className="offers-main">
        <button className="back-link" onClick={() => navigate(-1)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <h1 className="offers-title">Partnership Offers</h1>
        <p className="offers-subtitle">
          Review company partnership proposals and accept the most suitable offers for your projects.
        </p>

        <div className="offers-controls">
          <input
            className="offers-search"
            type="text"
            placeholder="Search by company, project, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="offers-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {loading ? (
          <div className="offers-empty">Loading partnership offers...</div>
        ) : error ? (
          <div className="offers-error">{error}</div>
        ) : filteredOffers.length === 0 ? (
          <div className="offers-empty">No partnership offers match your filters.</div>
        ) : (
          <div className="offers-grid">
            {filteredOffers.map((offer) => (
              <article key={offer.id} className="offer-card">
                <div className="offer-top">
                  <h2>{offer.companyName}</h2>
                  <span className={`offer-status offer-status-${offer.status}`}>
                    {offer.status}
                  </span>
                </div>

                <p className="offer-project">Project: {offer.projectName}</p>

                <div className="offer-meta">
                  <span>Sector: {offer.sector}</span>
                  <span>Focus: {offer.supportFocus}</span>
                  <span>Proposed Value: {offer.proposedValue}</span>
                  <span>Annual CSR Budget: {offer.annualBudget}</span>
                </div>

                <div className="offer-score">Suitability Score: {offer.suitabilityScore}/100</div>

                <div className="offer-tags">
                  {offer.certifications.map((cert) => (
                    <span key={cert} className="offer-tag">{cert}</span>
                  ))}
                </div>

                <div className="offer-actions">
                  <button
                    className="accept-btn"
                    onClick={() => updateOfferStatus(offer.id, "accepted")}
                    disabled={offer.status === "accepted"}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => updateOfferStatus(offer.id, "declined")}
                    disabled={offer.status === "declined"}
                  >
                    Decline
                  </button>
                  <button
                    className="view-project-btn"
                    onClick={() => navigate(`/project/${offer.projectId}`)}
                  >
                    View Project
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
