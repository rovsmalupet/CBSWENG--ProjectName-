/**
 * LastAccessBanner — "the last use of a user account should be reported to the
 * user at their next successful login". [CSSECDV 2.1.12]
 *
 * This is one of the few controls whose whole value is that a human reads it.
 * An attacker who signs in successfully leaves a trace the real owner sees the
 * next time they log in; failed attempts against their account show up as a
 * count they did not cause. So the failure row is styled as a warning and comes
 * with a direct link to change the password — noticing is only useful if acting
 * on it is easy.
 */

import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext.js";
import "../css/LastAccessBanner.css";

const formatMoment = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LastAccessBanner() {
  const { previousAccess, dismissPreviousAccess } = useAuth();
  if (!previousAccess) return null;

  const {
    lastLoginAt,
    lastLoginIp,
    lastFailedLoginAt,
    lastFailedLoginIp,
    failedAttemptsSinceLastLogin = 0,
    isFirstLogin,
  } = previousAccess;

  const lastSuccess = formatMoment(lastLoginAt);
  const lastFailure = formatMoment(lastFailedLoginAt);
  const hasFailures = failedAttemptsSinceLastLogin > 0;

  if (isFirstLogin && !lastFailure) {
    return (
      <div className="last-access-banner" role="status">
        <div className="last-access-content">
          <p className="last-access-title">Welcome. This is your first sign-in.</p>
        </div>
        <button type="button" className="last-access-dismiss" onClick={dismissPreviousAccess}
          aria-label="Dismiss">×</button>
      </div>
    );
  }

  return (
    <div
      className={`last-access-banner ${hasFailures ? "has-warning" : ""}`}
      role={hasFailures ? "alert" : "status"}
    >
      <div className="last-access-content">
        <p className="last-access-title">Account activity since you were last here</p>

        {lastSuccess && (
          <p className="last-access-row">
            <span className="last-access-label">Last successful sign-in:</span> {lastSuccess}
            {lastLoginIp && <span className="last-access-ip"> from {lastLoginIp}</span>}
          </p>
        )}

        {lastFailure && (
          <p className="last-access-row">
            <span className="last-access-label">Last failed sign-in:</span> {lastFailure}
            {lastFailedLoginIp && <span className="last-access-ip"> from {lastFailedLoginIp}</span>}
          </p>
        )}

        {hasFailures && (
          <p className="last-access-warning">
            There {failedAttemptsSinceLastLogin === 1 ? "was" : "were"}{" "}
            <strong>
              {failedAttemptsSinceLastLogin} failed sign-in{" "}
              {failedAttemptsSinceLastLogin === 1 ? "attempt" : "attempts"}
            </strong>{" "}
            on your account since your last successful sign-in. If that was not you,{" "}
            <Link to="/change-password">change your password now</Link>.
          </p>
        )}
      </div>

      <button
        type="button"
        className="last-access-dismiss"
        onClick={dismissPreviousAccess}
        aria-label="Dismiss this notice"
      >
        ×
      </button>
    </div>
  );
}
