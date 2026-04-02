import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
];

export default function AdminHomepage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userCountry");
    navigate("/login");
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
          <button className="admin-logout-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

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
            <div
              key={card.key}
              className="card active"
              onClick={() => navigate(card.route)}
            >
              <div className="card-icon">{card.icon}</div>
              <span className="card-label">{card.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
