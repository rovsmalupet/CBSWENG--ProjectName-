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

  const donorLinks = [
    { key: "asean", label: "ASEAN", path: "/donor/asean" },
    { key: "partnerships", label: "PARTNERSHIPS", path: "/donor/partnerships" },
    { key: "bookmarks", label: "BOOKMARKS", path: "/donor/bookmarks" },
  ].filter((link) => !hiddenItems.includes(link.key));

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        {isDonor ? "Donor Portal" : "NGO Portal"}
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
      <button className="navbar-logout-btn" onClick={handleLogout}>
        LOGOUT
      </button>
    </nav>
  );
}
