import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../config/api.js";
import PasswordField from "../components/PasswordField.jsx";
import { POLICY_RULES } from "../config/passwordPolicy.js";
import SecurityQuestionsFields from "../components/SecurityQuestionsFields.jsx";
import "../css/DonorRegistration.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasSurroundingWhitespace = (value) => value !== value.trim();

const ASEAN_COUNTRIES = [
  "Brunei",
  "Cambodia",
  "Indonesia",
  "Laos",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Singapore",
  "Thailand",
  "Vietnam",
];

export default function DonorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    country: "Philippines",
    affiliation: "",
    bio: "",

  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [policyFailures, setPolicyFailures] = useState([]);
  /** Password-reset questions, chosen at registration. [CSSECDV 2.1.9] */
  const [securityAnswers, setSecurityAnswers] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage("");
  };

  /**
   * Client-side checks are for the user's benefit only. The server re-validates
   * everything and is the sole authority — see backend/schemas/auth.schema.js
   * and backend/security/passwordPolicy.js. [2.3.1]
   */
  const validate = () => {
    const next = {};

    if (!formData.firstName.trim()) next.firstName = "First name is required.";
    else if (hasSurroundingWhitespace(formData.firstName)) {
      next.firstName = "First name cannot start or end with spaces.";
    }
    if (!formData.surname.trim()) next.surname = "Surname is required.";
    else if (hasSurroundingWhitespace(formData.surname)) {
      next.surname = "Surname cannot start or end with spaces.";
    }

    if (!formData.email.trim()) {
      next.email = "Email address is required.";
    } else if (hasSurroundingWhitespace(formData.email)) {
      next.email = "Email address cannot start or end with spaces.";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      next.email = "Enter a valid email address.";
    }

    // Length and complexity, mirroring the server policy. [2.1.5, 2.1.6]
    const failed = POLICY_RULES.filter((rule) => !rule.test(formData.password));
    if (failed.length > 0) {
      next.password = "Your password does not yet meet all the requirements below.";
    }

    if (!formData.country) next.country = "Please select your country.";
    if (!formData.affiliation.trim()) next.affiliation = "Affiliation is required.";
    else if (hasSurroundingWhitespace(formData.affiliation)) {
      next.affiliation = "Affiliation cannot start or end with spaces.";
    }
    if (formData.bio && hasSurroundingWhitespace(formData.bio)) {
      next.bio = "Bio cannot start or end with spaces.";
    }

    if (
      securityAnswers.length < 2 ||
      securityAnswers.some((entry) => !entry.questionKey || entry.answer.trim().length < 4)
    ) {
      next.securityAnswers = "Please choose two questions and answer both.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPolicyFailures([]);
    if (!validate()) return;

    setSubmitting(true);

    try {
      // No `role` field: the endpoint hard-codes donor, so registration cannot
      // be used to request a privileged account.
      await apiPost("/register", {
        firstName: formData.firstName,
        surname: formData.surname,
        email: formData.email.toLowerCase(),
        password: formData.password,
        country: formData.country,
        affiliation: formData.affiliation,
        ...(formData.bio ? { bio: formData.bio } : {}),
        securityAnswers,
      });

      setServerMessage("Account created. You can now sign in.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      setServerMessage(error.message);
      // The server returns which policy rules were not met. This is the
      // published policy, so showing it is helpful rather than a disclosure.
      setPolicyFailures(error.details?.failures ?? []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donor-register-page">
      <div className="donor-register-card">
        <button
          className="donor-register-back"
          onClick={() => navigate("/auth/donor")}
        >
          Back to Donor Login
        </button>

        <h1>Donor Registration</h1>
        <p>Create your donor account to access active campaigns and bookmarks.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName && (
            <span className="field-error">{errors.firstName}</span>
          )}

          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            name="surname"
            type="text"
            value={formData.surname}
            onChange={handleChange}
            aria-invalid={Boolean(errors.surname)}
          />
          {errors.surname && (
            <span className="field-error">{errors.surname}</span>
          )}

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          {/* Obscured by default, with the live policy checklist. [2.1.7] */}
          <PasswordField
            label="Password"
            value={formData.password}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, password: value }));
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            showPolicy
            error={errors.password}
          />

          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            aria-invalid={Boolean(errors.country)}
          >
            {ASEAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.country && (
            <span className="field-error">{errors.country}</span>
          )}

          <label htmlFor="affiliation">Affiliation</label>
          <input
            id="affiliation"
            name="affiliation"
            type="text"
            placeholder="e.g. Ayala Foundation, UP Manila, freelance"
            value={formData.affiliation}
            onChange={handleChange}
            aria-invalid={Boolean(errors.affiliation)}
          />
          {errors.affiliation && (
            <span className="field-error">{errors.affiliation}</span>
          )}

          {/* ── Optional profile fields ── */}
          <div className="optional-section">
            <p className="optional-label">Optional — you can fill this in later</p>

            <label htmlFor="bio">
              Bio
              <span className="field-hint"> — a short intro about yourself</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Tell campaigns a little about who you are and why you give..."
              value={formData.bio}
              onChange={handleChange}
              className="bio-textarea"
              aria-invalid={Boolean(errors.bio)}
            />
            {errors.bio && <span className="field-error">{errors.bio}</span>}
          </div>

          <SecurityQuestionsFields
            answers={securityAnswers}
            onChange={setSecurityAnswers}
            disabled={submitting}
          />
          {errors.securityAnswers && (
            <span className="field-error">{errors.securityAnswers}</span>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Creating account..." : "Register Donor"}
          </button>
        </form>

        {serverMessage && (
          <div className="server-message">
            <p>{serverMessage}</p>
            {policyFailures.length > 0 && (
              <ul className="server-message-list">
                {policyFailures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
