import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>NGO Portal</div>

      <div className="navbar-search">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input type="text" placeholder="Search projects..." />
      </div>

      <div className="navbar-right" onClick={() => navigate("/dashboard")}>MY IMPACT</div>
    </nav>
  );
}
