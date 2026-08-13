/**
 * ChangePassword — the specification's named example of a critical operation
 * requiring re-authentication. [CSSECDV 2.1.13, and 2.1.5/2.1.6/2.1.10/2.1.11]
 *
 * Flow:
 *   1. Confirm the current password  → a five-minute re-auth token
 *   2. Choose a new one              → server checks policy, history, and age
 *   3. Sign in again                 → the change invalidated every session,
 *                                      including this one
 *
 * Step 3 is not an inconvenience to work around. Changing a password is what
 * someone does when they suspect their account is compromised, so it has to
 * evict everyone — including whoever else is holding a token.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext.js";
import { apiPost, clearReauthToken, getReauthToken } from "../config/api.js";
import PasswordField from "../components/PasswordField.jsx";
import ReauthModal from "../components/ReauthModal.jsx";
import SecurityQuestionsFields from "../components/SecurityQuestionsFields.jsx";
import LastAccessBanner from "../components/LastAccessBanner.jsx";
import "../css/ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Set when ProtectedRoute redirected here because the account is flagged
  // mustChangePassword (a new or administrator-reset account).
  const forced = user?.mustChangePassword === true || location.state?.forced === true;

  const [confirmed, setConfirmed] = useState(Boolean(getReauthToken()));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityAnswers, setSecurityAnswers] = useState([]);
  const [questionsSaved, setQuestionsSaved] = useState(false);
  const [error, setError] = useState("");
  const [failures, setFailures] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const needsSecurityQuestionSetup =
    forced && user?.securityQuestionsConfigured !== true && !questionsSaved;
  const securityAnswersComplete =
    !needsSecurityQuestionSetup ||
    (securityAnswers.length > 0 &&
      securityAnswers.every(
        (entry) => entry.questionKey && String(entry.answer ?? "").trim().length >= 4,
      ));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFailures([]);
    setBusy(true);

    try {
      if (needsSecurityQuestionSetup) {
        await apiPost(
          "/auth/security-questions",
          { securityAnswers },
          { withReauth: true },
        );
        setQuestionsSaved(true);
      }

      await apiPost(
        "/auth/change-password",
        { newPassword, confirmPassword },
        { withReauth: true },
      );

      setDone(true);
      setNewPassword("");
      setConfirmPassword("");
      clearReauthToken();

      // The server has already invalidated this session by bumping the
      // account's token version; clear it locally and send them to sign in.
      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 2500);
    } catch (submitError) {
      setError(submitError.message);
      // The server returns which policy rules failed. Showing them is not a
      // leak — this is the published policy, and hiding it would only make
      // people guess.
      setFailures(submitError.details?.failures ?? []);

      if (submitError.code === "REAUTH_REQUIRED") setConfirmed(false);
    } finally {
      setBusy(false);
    }
  };

  if (!confirmed) {
    return (
      <ReauthModal
        title="Confirm your password"
        description="Before you can set a new password, please confirm the one you use now."
        onConfirmed={() => setConfirmed(true)}
        onCancel={() => navigate(forced ? "/login" : -1)}
        showAccountActivity={forced}
      />
    );
  }

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        {forced && <LastAccessBanner />}
        <h1>Change your password</h1>

        {forced && (
          <div className="change-password-notice" role="alert">
            Your account is using a temporary password. Please choose your own
            {user?.securityQuestionsConfigured !== true
              ? " and set your recovery questions"
              : ""} before continuing.
          </div>
        )}

        {done ? (
          <div className="change-password-success" role="status">
            <p>Your password has been changed.</p>
            <p>
              For your security, all devices signed in to this account have been signed out. Taking
              you to the sign-in page…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="change-password-signed-in">
              Signed in as <strong>{user?.email}</strong>
            </p>

            {needsSecurityQuestionSetup && (
              <SecurityQuestionsFields
                answers={securityAnswers}
                onChange={setSecurityAnswers}
                disabled={busy}
              />
            )}

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              name="newPassword"
              autoComplete="new-password"
              showPolicy
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              name="confirmPassword"
              autoComplete="new-password"
              error={
                confirmPassword && confirmPassword !== newPassword
                  ? "The two passwords do not match."
                  : null
              }
            />

            {error && (
              <div className="change-password-error" role="alert">
                <p>{error}</p>
                {failures.length > 0 && (
                  <ul>
                    {failures.map((failure) => (
                      <li key={failure}>{failure}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="change-password-rules">
              You cannot reuse a recent password, and a password must be at least one day old
              before it can be changed again.
            </p>

            <div className="change-password-actions">
              {!forced && (
                <button type="button" className="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={
                  busy ||
                  !securityAnswersComplete ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
              >
                {busy ? "Changing…" : "Change password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
