import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Bayanihub</h1>
        <p>Select your role to continue</p>

        <div className="button-group">
          <button
            className="login-btn donor-btn"
            onClick={() => navigate("/donor")}
          >
            Donor
          </button>

          <button
            className="login-btn ngo-btn"
            onClick={() => navigate("/auth/ngo")}
          >
			NGO
          </button>
		  
		  <button
            className="login-btn admin-btn"
            onClick={() => navigate("/auth/admin")}
          >
		  Admin
		  </button>
        </div>
      </div>
    </div>
  );
}
