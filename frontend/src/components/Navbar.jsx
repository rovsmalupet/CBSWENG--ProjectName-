import { useNavigate, useLocation } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar({ hiddenItems = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userCountry");
    navigate("/login");
  };

  const userRole = localStorage.getItem("userRole");
  const isDonor = userRole === "donor";
  const isNgo = userRole === "ngo";

  const donorLinks = [
    { key: "asean", label: "ASEAN", path: "/donor/asean" },
    { key: "partnerships", label: "PARTNERSHIPS", path: "/donor/partnerships" },
    { key: "bookmarks", label: "BOOKMARKS", path: "/donor/bookmarks" },
  ].filter((link) => !hiddenItems.includes(link.key));

  const ngoLinks = [
    {
      key: "donate-dev",
      label: "DONATE TO DEVELOPERS",
      path: "/donate-to-developers",
    },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img 
          src="/pictures/bayanihub-logo.png" 
          alt="BayanHub Logo" 
          className="navbar-logo-img"
        />
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
        {isNgo && ngoLinks.length > 0 && (
          <button
            className="navbar-donate-btn"
            onClick={() => navigate("/donate-to-developers")}
          >
            DONATE TO DEVELOPERS
          </button>
        )}
        <button className="navbar-logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </nav>
  );
}
