import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");

    if (!resetToken) {
      setTokenError("Invalid or missing reset token. Please request a new password reset.");
      setIsVerifying(false);
      return;
    }

    // Verify the token before allowing user to enter new password
    const verifyToken = async () => {
      try {
        const response = await fetch(getApiUrl(`/verify-reset-token?token=${resetToken}`), {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid reset token.");
        }

        setToken(resetToken);
        setTokenError("");
      } catch (err) {
        setTokenError(err.message);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl("/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken: token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setIsSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="loading-spinner"></div>
          <p>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h1>Reset Link Invalid</h1>
          <div className="error-message">{tokenError}</div>
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/forgot-password")}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h1>Create New Password</h1>
        <p className="subtitle">Enter your new password below</p>

        {!isSuccess ? (
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              required
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Password reset successful!</p>
            <p className="info-text">Redirecting to login...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
