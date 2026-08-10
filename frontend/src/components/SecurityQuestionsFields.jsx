/**
 * SecurityQuestionsFields — pick and answer the password-reset questions.
 * [CSSECDV 2.1.9]
 *
 * The catalogue is fetched from the server rather than duplicated here, so
 * there is one authoritative list. Each dropdown hides the question chosen in
 * the other, which is how "choose two different questions" is expressed as an
 * interface rather than as an error message after the fact.
 */

import { useEffect, useState } from "react";
import { apiGet } from "../config/api.js";
import "../css/SecurityQuestions.css";

export default function SecurityQuestionsFields({ answers, onChange, disabled = false }) {
  const [catalogue, setCatalogue] = useState([]);
  const [required, setRequired] = useState(2);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    apiGet("/auth/security-questions")
      .then((data) => {
        setCatalogue(data.questions ?? []);
        setRequired(data.required ?? 2);
        // Seed empty rows so the parent always holds exactly `required` entries.
        if (!answers || answers.length !== (data.required ?? 2)) {
          onChange(
            Array.from({ length: data.required ?? 2 }, () => ({ questionKey: "", answer: "" })),
          );
        }
      })
      .catch((error) => setLoadError(error.message));
    // Intentionally runs once: the catalogue does not change during a session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (index, patch) => {
    const next = answers.map((entry, position) =>
      position === index ? { ...entry, ...patch } : entry,
    );
    onChange(next);
  };

  if (loadError) {
    return <p className="security-questions-error">Could not load the security questions: {loadError}</p>;
  }
  if (catalogue.length === 0) return <p className="security-questions-loading">Loading…</p>;

  const chosen = new Set(answers.map((entry) => entry.questionKey).filter(Boolean));

  return (
    <fieldset className="security-questions" disabled={disabled}>
      <legend>Security questions</legend>
      <p className="security-questions-intro">
        You will be asked these if you ever need to reset your password. Choose questions only you
        can answer, and answers you will remember exactly.
      </p>

      {Array.from({ length: required }).map((_, index) => {
        const entry = answers[index] ?? { questionKey: "", answer: "" };
        return (
          <div className="security-question-row" key={index}>
            <label htmlFor={`sq-${index}`}>Question {index + 1}</label>
            <select
              id={`sq-${index}`}
              value={entry.questionKey}
              onChange={(event) => update(index, { questionKey: event.target.value })}
              required
            >
              <option value="">Choose a question…</option>
              {catalogue
                // Hide whatever the other dropdown already uses.
                .filter((question) => question.key === entry.questionKey || !chosen.has(question.key))
                .map((question) => (
                  <option key={question.key} value={question.key}>
                    {question.text}
                  </option>
                ))}
            </select>

            <label htmlFor={`sa-${index}`} className="security-answer-label">
              Your answer
            </label>
            <input
              id={`sa-${index}`}
              type="text"
              value={entry.answer}
              onChange={(event) => update(index, { answer: event.target.value })}
              minLength={4}
              maxLength={100}
              required
              autoComplete="off"
              // The answer is a credential. Not spell-checked, not
              // auto-completed, and never sent anywhere but our own API.
              spellCheck={false}
            />
          </div>
        );
      })}

      <p className="security-questions-note">
        Answers are not case-sensitive and extra spaces are ignored. They are stored encrypted and
        can never be read back — not even by an administrator.
      </p>
    </fieldset>
  );
}
