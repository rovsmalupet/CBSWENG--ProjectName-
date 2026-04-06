import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
  const [profileModal, setProfileModal] = useState(null);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(
          getApiUrl("/posts/partnerships/incoming"),
        );
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
      <Navbar />
      <main className="offers-main">
        <button className="back-link" onClick={() => navigate(-1)}>
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
          Back
        </button>

        <h1 className="offers-title">Partnership Offers</h1>
        <p className="offers-subtitle">
          Review donor partnership proposals and accept the most suitable offers
          for your projects.
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
          <div className="offers-empty">
            No partnership offers match your filters.
          </div>
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

                {offer.certifications && offer.certifications.length > 0 && (
                  <div className="offer-tags">
                    {offer.certifications.map((cert) => (
                      <span key={cert} className="offer-tag">
                        {cert}
                      </span>
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
                  <button
                    className="view-profile-btn"
                    onClick={() => setProfileModal(offer)}
                  >
                    View Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {profileModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setProfileModal(null)}
        >
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profile-modal-close"
              onClick={() => setProfileModal(null)}
            >
              ✕
            </button>

            <div className="profile-modal-header">
              <h2>{profileModal.companyName}</h2>
              <p className="profile-email">{profileModal.donorEmail}</p>
            </div>

            <div className="profile-modal-body">
              <div className="profile-section">
                <h3>Profile Information</h3>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Affiliation:</span>
                    <span className="info-value">
                      {profileModal.donorAffiliation || "Not specified"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Country:</span>
                    <span className="info-value">{profileModal.sector}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Bio:</span>
                    <span className="info-value">
                      {profileModal.donorBio || "No bio provided"}
                    </span>
                  </div>
                </div>
              </div>

              {profileModal.donorProjects &&
                profileModal.donorProjects.length > 0 && (
                  <div className="profile-section">
                    <h3>Projects Supported</h3>
                    <div className="profile-projects">
                      {profileModal.donorProjects.map((project) => (
                        <div key={project.id} className="profile-project-item">
                          <h4>{project.projectName}</h4>
                          <p className="project-priority">
                            Priority: {project.priority}
                          </p>
                          {project.causes && project.causes.length > 0 && (
                            <div className="project-causes">
                              {project.causes.map((cause) => (
                                <span key={cause} className="cause-tag">
                                  {cause}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
