/**
 * Login.
 *
 * The server returns one message — "Invalid username and/or password." — for
 * every credential failure: unknown email, wrong password, locked account,
 * disabled account, and an organization still awaiting approval. This page
 * shows whatever it is given and never tries to be more specific, because the
 * whole point of that message is that it distinguishes nothing. [CSSECDV 2.1.4]
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext.js";
import PasswordField from "../components/PasswordField.jsx";
import "../css/Login.css";

const LANDING_BY_ROLE = {
  donor: "/donor",
  ngo: "/dashboard",
  admin: "/admin",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);

      // An account on a temporary password must set its own before anything
      // else. ProtectedRoute enforces this too.
      if (user.mustChangePassword) {
        navigate("/change-password", { replace: true, state: { forced: true } });
        return;
      }

      // Return them to wherever they were headed before being asked to sign in.
      const intended = location.state?.from;
      navigate(intended ?? LANDING_BY_ROLE[user.role] ?? "/", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      // Clear the password on any failure so a retry starts clean and the value
      // does not linger in the DOM.
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to BayaniHub</h1>
        <p>Sign in to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          {/* Obscured by default. No policy checklist here: the rules apply to
              choosing a password, not to typing an existing one, and showing
              them would hint at what a valid password looks like. [2.1.7] */}
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          <div className="forgot-password-section">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <p className="login-lockout-note">
          Repeated failed attempts will temporarily lock the account.
        </p>

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
