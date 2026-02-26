import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div 
        className="navbar-logo" 
        onClick={() => navigate("/")}
      >
        NGO Portal
      </div>
    </nav>
  );
}