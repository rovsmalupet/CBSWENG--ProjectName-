import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/RoleLogin.css";

// Metadata for each role — controls the UI text and redirect destination
const roleMeta = {
  donor: {
    title: "Donor Login",
    submit: "Login as Donor",
    nextRoute: "/donor",
    helper: "Demo donor: donor@bayanihub.local / donor123",
  },
  admin: {
    title: "Admin Login",
    submit: "Login as Admin",
    nextRoute: "/admin",
    helper: "Default admin: admin@bayanihub.local / admin123",
  },
  ngo: {
    title: "NGO Login",
    submit: "Login as NGO",
    nextRoute: "/dashboard",
    helper: "NGO accounts can login only after admin approval.",
  },
};

export default function RoleLogin() {
  const navigate = useNavigate();
  const { role } = useParams();

  // If the URL role is invalid, default to "donor"
  const currentRole = useMemo(() => (roleMeta[role] ? role : "donor"), [role]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // getApiUrl reads VITE_API_URL so this works on both localhost and deployed
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: currentRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      // Store user info in localStorage so other pages can read it
      localStorage.setItem("userFirstName", data.user.firstName || "User");
      localStorage.setItem("userRole", currentRole);
      localStorage.setItem("userId", data.user.id);

      // Redirect to the correct dashboard based on role
      navigate(roleMeta[currentRole].nextRoute);
    } catch (submitError) {
      setError(submitError.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const meta = roleMeta[currentRole];

  return (
    <div className="role-login-page">
      <div className="role-login-card">
        <button className="role-login-back" onClick={() => navigate("/login")}>
          Back
        </button>

        <h1>{meta.title}</h1>
        <p>{meta.helper}</p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : meta.submit}
          </button>
        </form>

        {currentRole === "donor" && (
          <button
            type="button"
            className="role-register-link"
            onClick={() => navigate("/donor/register")}
          >
            New donor? Create an account
          </button>
        )}

        {currentRole === "ngo" && (
          <button
            type="button"
            className="role-register-link"
            onClick={() => navigate("/ngo/register")}
          >
            New NGO? Create an account
          </button>
        )}

        {error && <div className="role-login-error">{error}</div>}
      </div>
    </div>
  );
}
