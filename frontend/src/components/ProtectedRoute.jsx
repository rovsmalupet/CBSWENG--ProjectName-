/**
 * ProtectedRoute — one guard for every non-public page.
 *
 * Replaces the old `RequireRole`, which trusted `localStorage.userRole`. The
 * role here comes from the server via AuthContext. [CSSECDV 2.1.1, 2.2.1]
 *
 * Fails closed: while the session is still being confirmed nothing renders, so
 * a protected page never flashes on screen before the check completes.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.js";

export default function ProtectedRoute({ allowedRoles, children }) {
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
