import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

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

    if (!formData.password || formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.country) {
      nextErrors.country = "Please select your country.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setServerMessage("");

    try {
      const response = await fetch(getApiUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "ngo",
          orgName: formData.orgName.trim(),
          firstName: formData.firstName.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          country: formData.country,
          bio: formData.bio.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setServerMessage("Registration submitted. Waiting for admin approval.");
      setTimeout(() => navigate("/auth/ngo"), 1500);
    } catch (error) {
      setServerMessage(error.message || "Unable to submit registration.");
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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}

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

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Register NGO"}
          </button>
        </form>

        {serverMessage && <div className="server-message">{serverMessage}</div>}
      </div>
    </div>
  );
}