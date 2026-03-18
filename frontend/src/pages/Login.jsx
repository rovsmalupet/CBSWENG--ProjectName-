import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeByRole = {
    donor: "/donor",
    ngo: "/dashboard",
    admin: "/admin",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      const userRole = data.user?.role;
      const nextRoute = routeByRole[userRole] || "/login";

      localStorage.setItem("userFirstName", data.user?.firstName || "User");
      localStorage.setItem("userRole", userRole || "");
      localStorage.setItem("userId", data.user?.id || "");
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("userCountry", data.user?.country || "Philippines");

      navigate(nextRoute);
    } catch (submitError) {
      setError(submitError.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Bayanihub</h1>
        <p>Sign in to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}

        <div className="signup-section">
          <p className="signup-title">New user? Sign up now</p>
          <div className="signup-actions">
            <button
              type="button"
              className="signup-btn donor-signup"
              onClick={() => navigate("/donor/register")}
            >
              Sign up as Donor
            </button>
            <button
              type="button"
              className="signup-btn ngo-signup"
              onClick={() => navigate("/ngo/register")}
            >
              Sign up as NGO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
