import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../css/ProjectLedger.css";

export default function ProjectLedger() {
  const navigate = useNavigate();

  return (
    <div className="ledger-page">
      <Navbar />
      <main className="ledger-main">
        <button className="back-link" onClick={() => navigate(-1)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <div className="ledger-header">
          <h1 className="ledger-title">Project Ledger</h1>
          <button className="new-project-btn" onClick={() => navigate("/post-project")}>
            + New Project
          </button>
        </div>

        <div className="ledger-empty">
          <svg width="48" height="48" fill="none" stroke="#9ca3af" strokeWidth="1.4" viewBox="0 0 24 24">
            <circle cx="4" cy="7" r="1" fill="#9ca3af" stroke="none" />
            <line x1="8" y1="7" x2="20" y2="7" />
            <circle cx="4" cy="12" r="1" fill="#9ca3af" stroke="none" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <circle cx="4" cy="17" r="1" fill="#9ca3af" stroke="none" />
            <line x1="8" y1="17" x2="20" y2="17" />
          </svg>
          <p>No projects yet. Click <strong>+ New Project</strong> to get started.</p>
        </div>
      </main>
    </div>
  );
}
