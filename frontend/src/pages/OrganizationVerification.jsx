import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { apiFetch, getApiUrl } from "../config/api.js";
import "../css/OrganizationVerification.css";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function OrganizationVerification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadVerification = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch(
          getApiUrl(`/organizations/${id}/verification`),
        );
        setProfile(data);
      } catch (err) {
        console.error("Failed to load organization verification profile:", err);
        setError(err.message || "Failed to load verification profile.");
      } finally {
        setLoading(false);
      }
    };

    loadVerification();
  }, [id]);

  const displayedRegistrationDocs = useMemo(() => {
    if (!profile) return [];
    if (
      Array.isArray(profile.registrationDocuments) &&
      profile.registrationDocuments.length > 0
    ) {
      return profile.registrationDocuments;
    }
    return Array.isArray(profile.allDocuments)
      ? profile.allDocuments.slice(0, 8)
      : [];
  }, [profile]);

  const downloadDocument = async (documentId, fallbackName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        getApiUrl(`/documents/download/${documentId}`),
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to download file (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fallbackName || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Document download failed:", err);
      alert(err.message || "Failed to download document.");
    }
  };

  return (
    <div className="orgv-page">
      <Navbar />
      <main className="orgv-main">
        <button className="orgv-back" onClick={() => navigate(-1)}>
          Back
        </button>

        {loading ? (
          <div className="orgv-status">Loading verification profile...</div>
        ) : error ? (
          <div className="orgv-status orgv-error">{error}</div>
        ) : !profile ? (
          <div className="orgv-status">No verification profile found.</div>
        ) : (
          <>
            <header className="orgv-header">
              <div>
                <h1>{profile.organization?.orgName || "Organization"}</h1>
                <p>
                  {profile.organization?.representative ||
                    "Representative unavailable"}
                  {profile.organization?.country
                    ? ` • ${profile.organization.country}`
                    : ""}
                </p>
              </div>
              <span
                className={`orgv-badge ${profile.organization?.isVerified ? "verified" : "pending"}`}
              >
                {profile.organization?.isVerified
                  ? "Verified NGO"
                  : "Not Verified"}
              </span>
            </header>

            <section className="orgv-card">
              <h2>Track Record</h2>
              <div className="orgv-stats-grid">
                <div>
                  <strong>{profile.trackRecord?.totalProjects ?? 0}</strong>
                  <span>Total projects</span>
                </div>
                <div>
                  <strong>{profile.trackRecord?.approvedProjects ?? 0}</strong>
                  <span>Approved projects</span>
                </div>
                <div>
                  <strong>{profile.trackRecord?.activeProjects ?? 0}</strong>
                  <span>Active projects</span>
                </div>
                <div>
                  <strong>
                    {profile.trackRecord?.confirmedContributions ?? 0}
                  </strong>
                  <span>Confirmed contributions</span>
                </div>
                <div>
                  <strong>
                    {profile.trackRecord?.completedFundingGoals ?? 0}
                  </strong>
                  <span>Funding goals met</span>
                </div>
                <div>
                  <strong>
                    {formatCurrency(
                      profile.trackRecord?.totalMonetaryRaised ?? 0,
                    )}
                  </strong>
                  <span>Total monetary raised</span>
                </div>
              </div>
              <p className="orgv-footnote">
                Member since {formatDate(profile.organization?.createdAt)}
              </p>
            </section>

            <section className="orgv-card">
              <h2>Registration And Compliance Documents</h2>
              {displayedRegistrationDocs.length === 0 ? (
                <p className="orgv-muted">
                  No uploaded documents available yet.
                </p>
              ) : (
                <ul className="orgv-doc-list">
                  {displayedRegistrationDocs.map((doc) => (
                    <li key={doc.id} className="orgv-doc-item">
                      <div>
                        <p className="orgv-doc-name">{doc.fileName}</p>
                        <p className="orgv-doc-meta">
                          {doc.fileType} • {formatFileSize(doc.fileSize)} •{" "}
                          {formatDate(doc.createdAt)}
                        </p>
                        {doc.post?.projectName && (
                          <p className="orgv-doc-project">
                            Project: {doc.post.projectName}
                          </p>
                        )}
                        {doc.description && (
                          <p className="orgv-doc-desc">{doc.description}</p>
                        )}
                      </div>
                      <button
                        className="orgv-download"
                        type="button"
                        onClick={() => downloadDocument(doc.id, doc.fileName)}
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
