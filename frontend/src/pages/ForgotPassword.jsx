import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../config/api.js";
import "../css/ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      // The server answers identically whether or not the address is
      // registered, so this screen must not infer anything from the response.
      // Anything else would turn this endpoint into a free way to discover
      // which email addresses have accounts. [CSSECDV 2.1.4]
      const data = await apiPost("/forgot-password", { email });
      setMessage(data.message);
      setIsSuccess(true);
      setEmail("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your email address to receive a password reset link</p>

        {!isSuccess ? (
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{message}</p>
            <p className="info-text">Check your email inbox and spam folder for the reset link.</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="footer-links">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
