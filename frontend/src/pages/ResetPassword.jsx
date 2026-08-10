/**
 * ResetPassword — the two-factor reset flow. [CSSECDV 2.1.9]
 *
 *   Step 1  the emailed link proves control of the mailbox
 *   Step 2  the security questions prove knowledge only the owner should have
 *   Step 3  only then may a new password be set
 *
 * Neither factor alone is enough, which is why the answer step exists as its
 * own screen rather than as extra fields alongside the password.
 *
 * Every failure — expired link, already used, wrong answers, too many attempts
 * — produces the same message from the server. The screen does not try to be
 * more helpful than that.
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiGet, apiPost } from "../config/api.js";
import PasswordField from "../components/PasswordField.jsx";
import "../css/ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [stage, setStage] = useState("verifying"); // verifying | questions | password | done | dead
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [policyFailures, setPolicyFailures] = useState([]);
  const [busy, setBusy] = useState(false);

  /* Step 1 — exchange the token for the account's questions. */
  useEffect(() => {
    if (!token) {
      setError("This password reset link is not valid. Please request a new one.");
      setStage("dead");
      return;
    }

    apiGet(`/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setQuestions(data.questions ?? []);
        setAnswers((data.questions ?? []).map((question) => ({ questionKey: question.key, answer: "" })));
        setAttemptsRemaining(data.attemptsRemaining ?? null);
        setStage(data.answersVerified ? "password" : "questions");
      })
      .catch((verifyError) => {
        setError(verifyError.message);
        setStage("dead");
      });
  }, [token]);

  /* Step 2 — the security questions. */
  const submitAnswers = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiPost("/reset-password/verify-answers", { resetToken: token, answers });
      setStage("password");
    } catch (answerError) {
      setError(answerError.message);
      const remaining = answerError.details?.attemptsRemaining;
      if (typeof remaining === "number") {
        setAttemptsRemaining(remaining);
        if (remaining <= 0) setStage("dead");
      }
      // Clear the fields: a wrong answer left in the box invites the same
      // wrong answer again.
      setAnswers((current) => current.map((entry) => ({ ...entry, answer: "" })));
    } finally {
      setBusy(false);
    }
  };

  /* Step 3 — the new password. */
  const submitPassword = async (event) => {
    event.preventDefault();
    setError("");
    setPolicyFailures([]);
    setBusy(true);
    try {
      await apiPost("/reset-password", { resetToken: token, newPassword, confirmPassword });
      setStage("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (resetError) {
      setError(resetError.message);
      setPolicyFailures(resetError.details?.failures ?? []);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h1>Reset your password</h1>

        {stage === "verifying" && <p className="reset-password-info">Checking your link…</p>}

        {stage === "dead" && (
          <>
            <div className="reset-password-error" role="alert">
              {error}
            </div>
            <button
              type="button"
              className="reset-password-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Request a new link
            </button>
          </>
        )}

        {stage === "questions" && (
          <form className="reset-password-form" onSubmit={submitAnswers}>
            <p className="reset-password-info">
              Please answer your security questions. Answers are not case-sensitive.
            </p>

            {questions.map((question, index) => (
              <div key={question.key} className="reset-question">
                <label htmlFor={`answer-${index}`}>{question.text}</label>
                <input
                  id={`answer-${index}`}
                  type="text"
                  value={answers[index]?.answer ?? ""}
                  onChange={(event) =>
                    setAnswers((current) =>
                      current.map((entry, position) =>
                        position === index ? { ...entry, answer: event.target.value } : entry,
                      ),
                    )
                  }
                  required
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}

            {error && (
              <div className="reset-password-error" role="alert">
                {error}
              </div>
            )}

            {attemptsRemaining !== null && attemptsRemaining < 3 && (
              <p className="reset-password-attempts">
                {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining before
                this link stops working.
              </p>
            )}

            <button type="submit" className="reset-password-btn" disabled={busy}>
              {busy ? "Checking…" : "Continue"}
            </button>
          </form>
        )}

        {stage === "password" && (
          <form className="reset-password-form" onSubmit={submitPassword}>
            <p className="reset-password-info">
              Your answers were correct. Choose a new password.
            </p>

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              showPolicy
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={
                confirmPassword && confirmPassword !== newPassword
                  ? "The two passwords do not match."
                  : null
              }
            />

            {error && (
              <div className="reset-password-error" role="alert">
                <p>{error}</p>
                {policyFailures.length > 0 && (
                  <ul>
                    {policyFailures.map((failure) => (
                      <li key={failure}>{failure}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="reset-password-note">
              You cannot reuse a recent password.
            </p>

            <button
              type="submit"
              className="reset-password-btn"
              disabled={busy || !newPassword || newPassword !== confirmPassword}
            >
              {busy ? "Saving…" : "Set new password"}
            </button>
          </form>
        )}

        {stage === "done" && (
          <div className="reset-password-success" role="status">
            <p>Your password has been reset.</p>
            <p>All devices signed in to this account have been signed out. Taking you to sign in…</p>
          </div>
        )}

        <button type="button" className="reset-password-link" onClick={() => navigate("/login")}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}
