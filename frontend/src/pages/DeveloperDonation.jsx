import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StripePaymentModal } from "../components/StripePayment";
import { getApiUrl } from "../config/api";
import "../css/DeveloperDonation.css";

const fmtPHP = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export default function DeveloperDonation() {
  const navigate = useNavigate();
  const donorName = localStorage.getItem("userFirstName") || "Generous Donor";
  const donorId = localStorage.getItem("userId");

  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Calculate 3% fee (platform fee for developer donations)
  const amount = parseFloat(donationAmount) || 0;
  const platformFee = Math.round(amount * 0.03 * 100) / 100;
  const totalAmount = amount + platformFee;

  const handleDonate = async () => {
    if (amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setLoading(true);
    try {
      // Create payment intent for developer donation
      const response = await fetch(getApiUrl("/payments/intent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: "admin", // Special project ID for admin donations
          donationAmount: amount,
          monetaryFee: platformFee,
          volunteerFee: 0,
          inKindFee: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setPaymentData({
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        totalAmount: data.totalAmount,
        amount,
        platformFee,
        projectName: "Support BayaniHub - Admin Fund",
        projectId: "admin",
      });
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Confirm payment in database
      const response = await fetch(getApiUrl("/payments/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          postId: "admin",
        }),
      });

      if (response.ok) {
        alert("Thank you for your generous donation! Your contribution helps us improve BayaniHub for everyone.");
        navigate("/payment-history");
      } else {
        alert("Payment recorded but failed to confirm. Please contact support.");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Payment completed but failed to record. Please contact support.");
    }
  };

  return (
    <div className="dd-page">
      <main className="dd-main">
        <div className="dd-header">
          <button className="dd-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="dd-title">Support BayaniHub Development</h1>
          <p className="dd-subtitle">
            Your donation helps us build and maintain BayaniHub, connecting donors with impactful projects across ASEAN.
          </p>
        </div>

        <div className="dd-container">
          {/* Donation Card */}
          <div>
            <div className="dd-card">
              <div className="dd-card-header">
                <h2>Make a Developer Donation</h2>
                <p className="dd-card-desc">
                  Help us continue improving the platform and supporting more communities.
                </p>
              </div>

              <div className="dd-form-group">
                <label className="dd-label">Donation Amount (PHP)</label>
                <div className="dd-input-group">
                  <span className="dd-currency-symbol">₱</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="dd-amount-input"
                    disabled={showPaymentModal}
                  />
                </div>
                <small className="dd-helper">Minimum donation: ₱1.00</small>
              </div>

              {/* Summary */}
              {amount > 0 && (
                <div className="dd-summary">
                  <div className="dd-summary-row">
                    <span className="dd-summary-label">Donation Amount:</span>
                    <span className="dd-summary-value">{fmtPHP(amount)}</span>
                  </div>
                  <div className="dd-summary-row">
                    <span className="dd-summary-label">Platform Fee (3%):</span>
                    <span className="dd-summary-value">{fmtPHP(platformFee)}</span>
                  </div>
                  <div className="dd-summary-row dd-summary-total">
                    <span className="dd-summary-label">Total to Pay:</span>
                    <span className="dd-summary-value">{fmtPHP(totalAmount)}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleDonate}
                disabled={loading || amount <= 0 || showPaymentModal}
                className="dd-submit-btn"
              >
                {loading ? "Processing..." : amount > 0 ? `Donate ${fmtPHP(totalAmount)}` : "Enter Amount to Donate"}
              </button>

              <p className="dd-security-note">
                🔒 Powered by Stripe. Your payment information is secure.
              </p>
            </div>
          </div>

          {/* Info Boxes */}
          <div className="dd-info-boxes">
            <div className="dd-info-box">
              <h3>Why Donate?</h3>
              <ul>
                <li>Support platform maintenance and improvements</li>
                <li>Enable new features and integrations</li>
                <li>Help us reach more communities in ASEAN</li>
                <li>Direct impact on development roadmap</li>
              </ul>
            </div>
            <div className="dd-info-box">
              <h3>How It Works</h3>
              <ul>
                <li>Your donation is processed securely via Stripe</li>
                <li>Platform fee of 3% supports operations</li>
                <li>You'll receive a donation receipt</li>
                <li>Tax documentation available upon request</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <StripePaymentModal
            clientSecret={paymentData.clientSecret}
            paymentIntentId={paymentData.paymentIntentId}
            totalAmount={paymentData.totalAmount}
            projectName={paymentData.projectName}
            projectId={paymentData.projectId}
            isDeveloperDonation={true}
            onSuccess={handlePaymentSuccess}
            onClose={() => {
              setShowPaymentModal(false);
              setDonationAmount("");
              setPaymentData(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
