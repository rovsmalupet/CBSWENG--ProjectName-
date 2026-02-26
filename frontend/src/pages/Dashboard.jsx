import { useNavigate } from "react-router-dom";
import { Handshake } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import "../css/Dashboard.css";

const cards = [
  {
    key: "project-ledger",
    label: "Project Ledger",
    route: "/project-ledger",
    icon: (
      <svg width="52" height="52" fill="none" stroke="#4b5563" strokeWidth="1.4" viewBox="0 0 24 24">
        <circle cx="4" cy="7" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="7" x2="20" y2="7" />
        <circle cx="4" cy="12" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <circle cx="4" cy="17" r="1" fill="#4b5563" stroke="none" />
        <line x1="8" y1="17" x2="20" y2="17" />
      </svg>
    ),
    style: "card active",
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <button className="back-link" onClick={() => navigate(-1)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <h1 className="dashboard-title">My Impact Dashboard</h1>

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
