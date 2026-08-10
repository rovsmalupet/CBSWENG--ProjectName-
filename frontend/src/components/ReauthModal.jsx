/**
 * ReauthModal — confirm your password before a critical operation.
 * [CSSECDV 2.1.13]
 *
 * Holding a session is not enough for these actions. The point is to prove the
 * person at the keyboard is the account owner and not someone who sat down at
 * an unlocked laptop, so the password is demanded again at the moment of the
 * action.
 *
 * On success the server issues a five-minute re-auth token which apiFetch
 * attaches as X-Reauth-Token. The access-control layer verifies it is bound to
 * this account and still current before letting the request through.
 */

import { useState } from "react";
import { useAuth } from "../context/authContext.js";
import PasswordField from "./PasswordField.jsx";
import "../css/ReauthModal.css";

export default function ReauthModal({ title, description, onConfirmed, onCancel }) {
  const { reauthenticate } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await reauthenticate(password);
      setPassword(""); // do not leave it in component state
      onConfirmed();
    } catch (submitError) {
      setError(submitError.message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reauth-overlay" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <div className="reauth-modal">
        <h2 id="reauth-title">{title ?? "Confirm your password"}</h2>
        <p className="reauth-description">
          {description ??
            "For your security, please re-enter your password before continuing."}
        </p>

        <form onSubmit={handleSubmit}>
          <PasswordField
            label="Current password"
            value={password}
            onChange={setPassword}
            name="currentPassword"
            autoComplete="current-password"
          />

          {error && (
            <div className="reauth-error" role="alert">
              {error}
            </div>
          )}

          <p className="reauth-note">
            Repeated incorrect attempts will temporarily lock your account.
          </p>

          <div className="reauth-actions">
            <button type="button" className="reauth-cancel" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="reauth-confirm" disabled={busy || !password}>
              {busy ? "Confirming…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
