import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../config/api.js";
import PasswordField from "../components/PasswordField.jsx";
import { POLICY_RULES } from "../config/passwordPolicy.js";
import SecurityQuestionsFields from "../components/SecurityQuestionsFields.jsx";
import "../css/NgoRegistration.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function NgoRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgName: "",
    firstName: "",
    surname: "",
    email: "",
    password: "",
    country: "Philippines",
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
   * For the user's benefit only. The server re-validates everything and is the
   * sole authority — see backend/schemas/auth.schema.js. [2.3.1]
   */
  const validateForm = () => {
    const nextErrors = {};

    if (!formData.orgName.trim()) {
      nextErrors.orgName = "Organization name is required.";
    }
    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!formData.surname.trim()) {
      nextErrors.surname = "Surname is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    // Length and complexity, mirroring the server policy. [2.1.5, 2.1.6]
    if (POLICY_RULES.some((rule) => !rule.test(formData.password))) {
      nextErrors.password = "Your password does not yet meet all the requirements below.";
    }

    if (!formData.country) {
      nextErrors.country = "Please select your country.";
    }

    if (
      securityAnswers.length < 2 ||
      securityAnswers.some((entry) => !entry.questionKey || entry.answer.trim().length < 4)
    ) {
      nextErrors.securityAnswers = "Please choose two questions and answer both.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPolicyFailures([]);
    if (!validateForm()) return;

    setSubmitting(true);
    setServerMessage("");

    try {
      // Posted to the dedicated organization endpoint, which hard-codes the
      // role. No `role` field travels in the body.
      await apiPost("/organizations/register", {
        orgName: formData.orgName.trim(),
        firstName: formData.firstName.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        country: formData.country,
        ...(formData.bio.trim() ? { bio: formData.bio.trim() } : {}),
        securityAnswers,
      });

      setServerMessage(
        "Registration submitted. An administrator will review your organization before you can sign in.",
      );
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      setServerMessage(error.message);
      setPolicyFailures(error.details?.failures ?? []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ngo-register-page">
      <div className="ngo-register-card">
        <button className="ngo-register-back" onClick={() => navigate("/auth/ngo")}>
          Back
        </button>

        <h1>NGO Registration</h1>
        <p>Submit your details to create a pending NGO account.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="orgName">Organization Name</label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            value={formData.orgName}
            onChange={handleChange}
            placeholder="e.g. Philippine Red Cross"
          />

          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName && <span className="field-error">{errors.firstName}</span>}

          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            name="surname"
            type="text"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Dela Cruz"
            aria-invalid={Boolean(errors.surname)}
          />
          {errors.surname && <span className="field-error">{errors.surname}</span>}

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@organization.org"
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
          {errors.country && <span className="field-error">{errors.country}</span>}

          {/* ── Optional profile fields ── */}
          <div className="optional-section">
            <p className="optional-label">Optional — you can fill this in later</p>

            <label htmlFor="bio">
              Organization Bio
              <span className="field-hint"> — mission statement or short description</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Briefly describe your organization's mission and the communities you serve..."
              value={formData.bio}
              onChange={handleChange}
              className="bio-textarea"
            />
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
            {submitting ? "Submitting..." : "Register NGO"}
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