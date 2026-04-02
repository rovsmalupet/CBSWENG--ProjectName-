import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const getNavigationPath = () => {
    switch (userRole) {
      case "ngo":
        return "/dashboard";
      case "donor":
        return "/donor";
      case "admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  const getPortalName = () => {
    switch (userRole) {
      case "ngo":
        return "NGO Portal";
      case "donor":
        return "Donor Portal";
      case "admin":
        return "Admin Portal";
      default:
        return "Portal";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userCountry");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => navigate(getNavigationPath())}
      >
        {getPortalName()}
      </div>
      <button className="navbar-logout-btn" onClick={handleLogout}>
        LOGOUT
      </button>
    </nav>
  );
}
