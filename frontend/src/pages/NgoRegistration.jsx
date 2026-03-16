import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/NgoRegistration.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NgoRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgName: "",
    firstName: "",
    surname: "",
    email: "",
    password: "",
    affiliation: "",
    representativePerson: "",
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
      nextErrors.firstName = "First Name is required.";
    }

    if (!formData.surname.trim()) {
      nextErrors.surname = "Surname is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email Address is required.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password || formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.affiliation.trim()) {
      nextErrors.affiliation = "Affiliation is required.";
    }

    if (!formData.representativePerson.trim()) {
      nextErrors.representativePerson = "Representative Person is required.";
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
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "ngo",
          orgName: formData.orgName.trim(),
          firstName: formData.firstName.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          affiliation: formData.affiliation.trim(),
          representativePerson: formData.representativePerson.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      localStorage.setItem("userFirstName", formData.firstName.trim());
      setServerMessage("Registration submitted. Waiting for admin approval.");

      setTimeout(() => {
        navigate("/auth/ngo");
      }, 1000);
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
            placeholder="Optional"
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

          <label htmlFor="affiliation">Affiliation</label>
          <input
            id="affiliation"
            name="affiliation"
            type="text"
            value={formData.affiliation}
            onChange={handleChange}
            placeholder="Example: Red Cross Chapter"
            aria-invalid={Boolean(errors.affiliation)}
          />
          {errors.affiliation && <span className="field-error">{errors.affiliation}</span>}

          <label htmlFor="representativePerson">Representative Person</label>
          <input
            id="representativePerson"
            name="representativePerson"
            type="text"
            value={formData.representativePerson}
            onChange={handleChange}
            placeholder="Full representative name"
            aria-invalid={Boolean(errors.representativePerson)}
          />
          {errors.representativePerson && (
            <span className="field-error">{errors.representativePerson}</span>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Register NGO"}
          </button>
        </form>

        {serverMessage && <div className="server-message">{serverMessage}</div>}
      </div>
    </div>
  );
}
