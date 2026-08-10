/**
 * Custom error pages. [CSSECDV 2.4.2]
 *
 * "Implement generic error messages and use custom error pages."
 *
 * Before this, an unknown URL rendered a blank white page — the router had no
 * catch-all route — and a permission failure showed whatever raw text the API
 * happened to return. Each page below says what happened in plain language,
 * offers a way forward, and discloses nothing about why: a 403 never explains
 * which role would have been required, and a 404 never distinguishes "no such
 * project" from "not your project".
 */

import { Link, useNavigate } from "react-router-dom";
import "../../css/ErrorPages.css";

function ErrorShell({ code, title, children, actions }) {
  return (
    <div className="error-page">
      <div className="error-card">
        <p className="error-code" aria-hidden="true">
          {code}
        </p>
        <h1>{title}</h1>
        {children}
        <div className="error-actions">{actions}</div>
      </div>
    </div>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <ErrorShell
      code="404"
      title="We could not find that page"
      actions={
        <>
          <button type="button" onClick={() => navigate(-1)}>
            Go back
          </button>
          <Link className="secondary" to="/">
            Home
          </Link>
        </>
      }
    >
      <p>The page you were looking for does not exist, or it may have been moved.</p>
    </ErrorShell>
  );
}

export function Forbidden() {
  const navigate = useNavigate();
  return (
    <ErrorShell
      code="403"
      title="You do not have access to that"
      actions={
        <>
          <button type="button" onClick={() => navigate(-1)}>
            Go back
          </button>
          <Link className="secondary" to="/">
            Home
          </Link>
        </>
      }
    >
      {/* Deliberately does not name the role that would have been required —
          that would tell an unauthorised user exactly what to aim for. */}
      <p>
        Your account does not have permission to view this page. If you believe this is a mistake,
        contact your administrator.
      </p>
    </ErrorShell>
  );
}

export function Unauthorized() {
  return (
    <ErrorShell
      code="401"
      title="Your session has ended"
      actions={
        <Link to="/login" className="primary-link">
          Sign in again
        </Link>
      }
    >
      <p>
        For your security, sessions end after a period of inactivity, and whenever your password is
        changed. Please sign in again to continue.
      </p>
    </ErrorShell>
  );
}

export function ServerError() {
  return (
    <ErrorShell
      code="500"
      title="Something went wrong on our end"
      actions={
        <>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
          <Link className="secondary" to="/">
            Home
          </Link>
        </>
      }
    >
      <p>
        This is our fault, not yours. The problem has been recorded and nothing you were working on
        has been lost.
      </p>
    </ErrorShell>
  );
}

export default { NotFound, Forbidden, Unauthorized, ServerError };
