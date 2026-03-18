import { useNavigate } from "react-router-dom";
import "../css/adminHome.css";

export default function AdminHomepage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
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

        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="dashboard-cards">
          <div
            className="card active"
            onClick={() => navigate("/viewProjects")}
          >
            <div className="card-icon">
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
            </div>
            <span className="card-label">View Projects</span>
          </div>

          <div
            className="card active"
            onClick={() => navigate("/admin/pending-accounts")}
          >
            <div className="card-icon">
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
            </div>
            <span className="card-label">Pending Accounts</span>
          </div>
        </div>
      </main>
    </div>
  );
}
