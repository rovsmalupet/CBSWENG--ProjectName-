import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../css/Dashboard.css";

const cards = [
  {
    key: "project-ledger",
    label: "Active Projects",
    route: "/project-ledger",
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
    style: "card active",
  },
  {
    key: "unposted-projects",
    label: "Unposted Projects",
    route: "/unposted-projects",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.5" fill="#4b5563" stroke="none" />
      </svg>
    ),
    style: "card active",
  },
  {
    key: "partnership-offers",
    label: "Partnership Offers",
    route: "/ngo/partnership-offers",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <path d="M8 12h8" />
        <path d="M8 16h5" />
        <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
    style: "card active",
  },
  {
    key: "donations",
    label: "Donations Received",
    route: "/ngo/donations",
    icon: (
      <svg
        width="52"
        height="52"
        fill="none"
        stroke="#4b5563"
        strokeWidth="1.4"
        viewBox="0 0 24 24"
      >
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
        <path d="M12 6v12" strokeLinecap="round" />
        <path d="M9 9h6" strokeLinecap="round" />
        <path d="M9 15h6" strokeLinecap="round" />
      </svg>
    ),
    style: "card active",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) return;

    const normalizedQuery = query.toLowerCase();
    const isOfferQuery = ["partner", "partnership", "offer", "offers", "company", "companies", "corporate"].some(
      (keyword) => normalizedQuery.includes(keyword),
    );
    const isUnpostedQuery = ["unposted", "pending", "edited", "rejected", "unapproved"].some((keyword) =>
      normalizedQuery.includes(keyword),
    );

    if (isOfferQuery) {
      navigate(`/ngo/partnership-offers?search=${encodeURIComponent(query)}`);
      return;
    }

    if (isUnpostedQuery) {
      navigate(`/unposted-projects?search=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/project-ledger?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
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

        <h1 className="dashboard-title">My Impact Dashboard</h1>

        <form className="portal-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search NGO projects or partnership offers"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button type="submit" className="portal-search-btn">Search</button>
        </form>

        <p className="portal-search-empty">Use search to jump to matching project lists.</p>

        <div className="dashboard-cards">
          {cards.map((card) => (
            <div
              key={card.key}
              className={card.style}
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