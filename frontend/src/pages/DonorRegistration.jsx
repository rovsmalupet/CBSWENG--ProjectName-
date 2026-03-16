import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DonorRegistration.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DonorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
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

    if (!formData.firstName.trim()) next.firstName = "First Name is required.";
    if (!formData.surname.trim()) next.surname = "Surname is required.";

    if (!formData.email.trim()) {
      next.email = "Email Address is required.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!formData.password || formData.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "donor",
          firstName: formData.firstName.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Donor registration failed.");
      }

      localStorage.setItem("userFirstName", formData.firstName.trim());
      setServerMessage("Donor account created. You can now sign in.");
      setTimeout(() => navigate("/auth/donor"), 1000);
    } catch (error) {
      setServerMessage(error.message || "Unable to register donor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donor-register-page">
      <div className="donor-register-card">
        <button className="donor-register-back" onClick={() => navigate("/auth/donor")}>
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
          {errors.firstName && <span className="field-error">{errors.firstName}</span>}

          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            name="surname"
            type="text"
            value={formData.surname}
            onChange={handleChange}
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
          {errors.password && <span className="field-error">{errors.password}</span>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Creating account..." : "Register Donor"}
          </button>
        </form>

        {serverMessage && <div className="server-message">{serverMessage}</div>}
      </div>
    </div>
  );
}
