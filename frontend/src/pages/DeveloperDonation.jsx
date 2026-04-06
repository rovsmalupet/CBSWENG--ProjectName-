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

  // Donation amount
  const amount = parseFloat(donationAmount) || 0;

  const handleDonate = async () => {
    if (amount < 25) {
      alert("Minimum donation is ₱25.00 (Stripe payment processor requirement)");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Create payment intent for developer donation
      const response = await fetch(getApiUrl("/payments/intent"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: "admin", // Special project ID for admin donations
          donationAmount: amount,
          monetaryFee: 0,
          volunteerFee: 0,
          inKindFee: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || "Failed to create payment intent";
        throw new Error(errorMsg);
      }

      // Payment intent created successfully - now show the payment modal
      setPaymentData({
        amount,
      });
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Payment intent error:", error.message);
      alert(`Payment Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem("token");
      // Confirm payment in database
      const response = await fetch(getApiUrl("/payments/confirm"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
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
                    min="25"
                    step="0.01"
                    className="dd-amount-input"
                    disabled={showPaymentModal}
                  />
                </div>
                <small className="dd-helper">Minimum donation: ₱25.00 (Payment processor requirement)</small>
              </div>

              {/* Summary */}
              {amount > 0 && (
                <div className="dd-summary">
                  <div className="dd-summary-row dd-summary-total">
                    <span className="dd-summary-label">Total to Donate:</span>
                    <span className="dd-summary-value">{fmtPHP(amount)}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleDonate}
                disabled={loading || amount <= 0 || showPaymentModal}
                className="dd-submit-btn"
              >
                {loading ? "Processing..." : amount > 0 ? `Donate ${fmtPHP(amount)}` : "Enter Amount to Donate"}
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
                <li>100% of your donation goes to platform development</li>
                <li>You'll receive a donation receipt</li>
                <li>Tax documentation available upon request</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <StripePaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setDonationAmount("");
              setPaymentData(null);
            }}
            postId="admin"
            donationAmount={paymentData.amount}
            monetaryFee={0}
            volunteerFee={0}
            inKindFee={0}
            projectName={paymentData.projectName}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </main>
    </div>
  );
}
