import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getApiUrl } from "../config/api.js";
import "../css/OrganizationPartnershipOffers.css";

export default function OrganizationPartnershipOffers() {
  const navigate = useNavigate();
  const orgId = localStorage.getItem("userId") || "ngo";

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(getApiUrl("/posts/partnerships/incoming"));
        const allOffers = Array.isArray(response) ? response : [];

        setOffers(allOffers);
      } catch (err) {
        console.error("Failed to load partnership offers:", err);
        setError(err.message || "Failed to load partnership offers.");
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, []);

  const updateOfferStatus = (offerId, status) => {
    const updated = offers.map((offer) =>
      offer.id === offerId ? { ...offer, status } : offer,
    );
    setOffers(updated);
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
          Review donor partnership proposals and accept the most suitable offers for your projects.
        </p>

        <div className="offers-controls">
          <input
            className="offers-search"
            type="text"
            placeholder="Search by donor, project, sector..."
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
                  <span>Country/Region: {offer.sector}</span>
                  <span>Support Type: {offer.supportFocus}</span>
                  <span>Proposed Value: {offer.proposedValue}</span>
                  {offer.volunteerHours > 0 && (
                    <span>Volunteer Hours: {offer.volunteerHours}</span>
                  )}
                </div>

                <div className="offer-score">Suitability Score: {offer.suitabilityScore}/100</div>

                {offer.certifications && offer.certifications.length > 0 && (
                  <div className="offer-tags">
                    {offer.certifications.map((cert) => (
                      <span key={cert} className="offer-tag">{cert}</span>
                    ))}
                  </div>
                )}

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
