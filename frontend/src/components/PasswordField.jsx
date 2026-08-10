/**
 * PasswordField — obscured password entry with live policy feedback.
 * [CSSECDV 2.1.7, and the user-facing half of 2.1.5 / 2.1.6]
 *
 * Two things worth being explicit about:
 *
 *  · The input is `type="password"` by default and only becomes visible on an
 *    explicit click. The toggle is a usability feature that exists precisely so
 *    people do not disable masking some other way; it never starts revealed.
 *
 *  · The checklist mirrors the server's policy but does not enforce it. The
 *    server re-checks every rule in security/passwordPolicy.js and is the only
 *    thing that decides. This is here so a user is not made to guess.
 */

import { useId, useMemo, useState } from "react";
import { POLICY_RULES, MAX_PASSWORD_LENGTH } from "../config/passwordPolicy.js";
import "../css/PasswordField.css";

export default function PasswordField({
  label = "Password",
  value,
  onChange,
  name = "password",
  autoComplete = "new-password",
  required = true,
  showPolicy = false,
  error = null,
  disabled = false,
}) {
  const [revealed, setRevealed] = useState(false);
  const fieldId = useId();
  const helpId = `${fieldId}-help`;

  const results = useMemo(
    () => POLICY_RULES.map((rule) => ({ ...rule, passed: rule.test(value ?? "") })),
    [value],
  );
  const metCount = results.filter((rule) => rule.passed).length;

  return (
    <div className="password-field">
      <label htmlFor={fieldId}>{label}</label>

      <div className="password-field-input">
        <input
          id={fieldId}
          name={name}
          // Obscured unless the user explicitly asks otherwise. [2.1.7]
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          maxLength={MAX_PASSWORD_LENGTH}
          // A password is not a word; correcting it would corrupt it, and
          // sending it to a spell-check service would disclose it.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          aria-describedby={showPolicy ? helpId : undefined}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="password-field-toggle"
          onClick={() => setRevealed((current) => !current)}
          aria-pressed={revealed}
          aria-label={revealed ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {revealed ? "Hide" : "Show"}
        </button>
      </div>

      {error && <p className="password-field-error">{error}</p>}

      {showPolicy && (
        <div className="password-policy" id={helpId}>
          <div className="password-policy-meter" aria-hidden="true">
            <div
              className={`password-policy-meter-fill strength-${metCount}`}
              style={{ width: `${(metCount / POLICY_RULES.length) * 100}%` }}
            />
          </div>
          <p className="password-policy-heading">Your password must contain:</p>
          <ul className="password-policy-list">
            {results.map((rule) => (
              <li
                key={rule.key}
                className={rule.passed ? "met" : "unmet"}
                // The checkmark is decorative; the class alone would not be
                // announced by a screen reader.
                aria-label={`${rule.label}: ${rule.passed ? "met" : "not yet met"}`}
              >
                <span aria-hidden="true">{rule.passed ? "✓" : "○"}</span> {rule.label}
              </li>
            ))}
          </ul>
          <p className="password-policy-note">
            Avoid common words, and do not include your own name or email address.
          </p>
        </div>
      )}
    </div>
  );
}
