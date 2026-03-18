import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

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
        onClick={() => navigate("/")}
      >
        NGO Portal
      </div>
      <button className="navbar-logout-btn" onClick={handleLogout}>
        LOGOUT
      </button>
    </nav>
  );
}