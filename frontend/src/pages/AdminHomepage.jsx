import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.js";
import LastAccessBanner from "../components/LastAccessBanner.jsx";
import "../css/Dashboard.css";
import "../css/adminHome.css";

const adminCards = [
  {
    key: "view-projects",
    label: "View Projects",
    route: "/viewProjects",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <circle cx="4" cy="7" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="7" x2="20" y2="7" />
        <circle cx="4" cy="12" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <circle cx="4" cy="17" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="17" x2="20" y2="17" />
      </svg>
    ),
  },
  {
    key: "pending-accounts",
    label: "Pending Accounts",
    route: "/admin/pending-accounts",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
        <path d="M16 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "payments-donations",
    label: "Payments and Donations",
    route: "/admin/payments-donations",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 4H8a2 2 0 0 0-2 2" />
        <circle cx="12" cy="14" r="2.5" fill="none" stroke="#4b5563" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    // The administrator's read-only audit trail. [CSSECDV 2.4.4]
    key: "security-logs",
    label: "Security Logs",
    route: "/admin/security-logs",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    // Creating administrator and organization accounts, and changing roles.
    key: "user-management",
    label: "User Accounts",
    route: "/admin/user-management",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20v-1.6A4.4 4.4 0 0 1 6.9 14h4.2a4.4 4.4 0 0 1 4.4 4.4V20" />
        <path d="M17.5 7.5v5M15 10h5" />
      </svg>
    ),
  },
];

export default function AdminHomepage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchText, setSearchText] = useState("");

  // Invalidates the session server-side, not just in this browser.
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;

    const normalized = query.toLowerCase();
    const isPendingAccountsQuery = [
      "pending",
      "account",
      "accounts",
      "ngo",
      "user",
      "users",
      "registration",
    ].some((keyword) => normalized.includes(keyword));

    if (isPendingAccountsQuery) {
      navigate(`/admin/pending-accounts?search=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/viewProjects?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <div className="admin-top-actions">
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
          <div className="admin-top-right">
            <button
              type="button"
              className="admin-change-password-btn"
              onClick={() => navigate("/change-password")}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              CHANGE PASSWORD
            </button>
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>

        {/* "The last use (successful or unsuccessful) of a user account should
            be reported to the user at their next successful login." [2.1.12] */}
        <LastAccessBanner />

        <h1 className="dashboard-title">Admin Dashboard</h1>

        <form className="admin-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search projects or pending accounts"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button type="submit" className="admin-search-btn">
            Search
          </button>
        </form>

        <p className="admin-search-empty">
          Search jumps to projects or pending accounts.
        </p>

        <div className="dashboard-cards">
          {adminCards.map((card) => (
            <button
              type="button"
              key={card.key}
              className="card active admin-dashboard-card"
              onClick={() => navigate(card.route)}
            >
              <div className="card-icon">{card.icon}</div>
              <span className="card-label">{card.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
