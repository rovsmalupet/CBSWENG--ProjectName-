/**
 * ProtectedRoute — one guard for every non-public page.
 *
 * Replaces the old `RequireRole`, which trusted `localStorage.userRole`. The
 * role here comes from the server via AuthContext. [CSSECDV 2.1.1, 2.2.1]
 *
 * Fails closed: while the session is still being confirmed nothing renders, so
 * a protected page never flashes on screen before the check completes.
 */

import { useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "../config/api.js";
import { useAuth } from "../context/authContext.js";

/**
 * Ask the real protected API to make (and audit) the final authorization
 * decision before showing the forbidden page. The probe path is a developer-
 * supplied constant; the browser never supplies a role, account, or log text.
 */
function AuditedForbiddenRedirect({ denialProbe }) {
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    // React StrictMode re-runs effects in development. One URL attempt should
    // still produce exactly one authorization request and one audit record.
    if (started.current) return;
    started.current = true;

    apiGet(denialProbe)
      .catch(() => {
        // A 403 is expected. apiGet has already invoked the global error-page
        // handler after the backend recorded the denial.
      })
      .finally(() => {
        // Network failures and other unexpected outcomes also fail closed.
        navigate("/forbidden", { replace: true });
      });
  }, [denialProbe, navigate]);

  return (
    <div className="route-loading" role="status" aria-live="polite">
      <p>Checking your access…</p>
    </div>
  );
}

export default function ProtectedRoute({ allowedRoles, denialProbe, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    // `from` lets the login page return the user where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    if (denialProbe) {
      return <AuditedForbiddenRedirect denialProbe={denialProbe} />;
    }

    // A dedicated page rather than a redirect to login: the user IS signed in,
    // and bouncing them to a login form they have already passed is confusing.
    return <Navigate to="/forbidden" replace />;
  }

  /**
   * An account provisioned or reset by an administrator must set its own
   * password before doing anything else. Everything is funnelled to the change
   * form; without this the temporary password stays valid indefinitely.
   */
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace state={{ forced: true }} />;
  }

  return children;
}
