import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/DonorRegistration.css";

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage("");
  };

  const validate = () => {
    const next = {};

    if (!formData.firstName.trim()) next.firstName = "First name is required.";
    if (!formData.surname.trim()) next.surname = "Surname is required.";

    if (!formData.email.trim()) {
      next.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!formData.password || formData.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    if (!formData.country) next.country = "Please select your country.";

    if (!formData.affiliation.trim()) next.affiliation = "Affiliation is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await fetch(getApiUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "donor",
          firstName: formData.firstName.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          country: formData.country,
          affiliation: formData.affiliation.trim(),
          bio: formData.bio.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Donor registration failed.");
      }

      localStorage.setItem("userFirstName", formData.firstName.trim());
      setServerMessage("Account created. You can now sign in.");
      setTimeout(() => navigate("/auth/donor"), 1500);
    } catch (error) {
      setServerMessage(error.message || "Unable to register donor.");
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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}

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
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Creating account..." : "Register Donor"}
          </button>
        </form>

        {serverMessage && (
          <div className="server-message">{serverMessage}</div>
        )}
      </div>
    </div>
  );
}