import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.js";
import "../css/Navbar.css";

export default function Navbar({ hiddenItems = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();

  /**
   * Signing out now tells the SERVER, which invalidates every token issued to
   * this account. Previously this only cleared localStorage, so a token that
   * had been copied elsewhere stayed usable for its full seven-day lifetime —
   * "logging out" changed nothing an attacker cared about.
   */
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isDonor = role === "donor";
  const isNgo = role === "ngo";

  const donorLinks = [
    { key: "asean", label: "ASEAN", path: "/donor/asean" },
    { key: "partnerships", label: "PARTNERSHIPS", path: "/donor/partnerships" },
    { key: "bookmarks", label: "BOOKMARKS", path: "/donor/bookmarks" },
  ].filter((link) => !hiddenItems.includes(link.key));

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src="/pictures/bayanihub-logo.png" alt="BayaniHub" className="navbar-logo-img" />
      </div>

      {isDonor && donorLinks.length > 0 && (
        <div className="navbar-links">
          {donorLinks.map((link) => (
            <button
              key={link.key}
              className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      <div className="navbar-right-actions">
        {isNgo && (
          <button
            className="navbar-donate-btn"
            onClick={() => navigate("/donate-to-developers")}
          >
            DONATE TO DEVELOPERS
          </button>
        )}

        {/* Available to every role — the specification lists "Change password"
            under all three. [CSSECDV 2.1.13] */}
        <button className="navbar-account-btn" onClick={() => navigate("/change-password")}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          CHANGE PASSWORD
        </button>

        <button className="navbar-logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </nav>
  );
}
