/**
 * ErrorBoundary — the last line before a user sees a React stack trace.
 * [CSSECDV 2.4.1, 2.4.2]
 *
 * Without a boundary, an uncaught render error in production leaves a blank
 * white page, and in development it shows a component stack with file paths and
 * source. Neither is acceptable: one is useless, the other is disclosure.
 *
 * The user gets a fixed message and a reference code. The detail goes to the
 * browser console in development only.
 */

import { Component } from "react";
import "../css/ErrorPages.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, reference: null };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
      // Local only — it correlates what the user saw with the console output
      // during development. Server-side errors carry their own errorId from the
      // API, which an administrator can find in the security log.
      reference: crypto.randomUUID().slice(0, 8),
    };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("Render error:", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-page">
        <div className="error-card">
          <h1>Something went wrong</h1>
          <p>
            We hit an unexpected problem while displaying this page. Reload the page, or return to
            the home page and try again.
          </p>
          <p className="error-reference">
            Reference: <code>{this.state.reference}</code>
          </p>
          <div className="error-actions">
            <button type="button" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <button type="button" className="secondary" onClick={() => (window.location.href = "/")}>
              Go to the home page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
