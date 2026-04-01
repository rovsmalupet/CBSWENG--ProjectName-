import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../css/StripePayment.css";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// ── Main Stripe Payment Modal ──────────────────────────────────────────────
export function StripePaymentModal({
  isOpen,
  onClose,
  postId,
  donationAmount = 0,
  monetaryFee = 0,
  volunteerFee = 0,
  inKindFee = 0,
  projectName,
  onPaymentSuccess,
}) {
  const totalAmount = donationAmount + monetaryFee + volunteerFee + inKindFee;

  if (!isOpen) return null;

  return (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div className="sp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sp-modal-header">
          <h2 className="sp-modal-title">💳 Confirm Payment</h2>
          <button
            className="sp-modal-close"
            onClick={onClose}
            type="button"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="sp-modal-body">
          <p className="sp-payment-project">
            Project: <strong>{projectName}</strong>
          </p>

          <div className="sp-breakdown">
            {donationAmount > 0 && (
              <div className="sp-breakdown-row">
                <span>Your Donation</span>
                <span>₱{Number(donationAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {(monetaryFee > 0 || volunteerFee > 0 || inKindFee > 0) && (
              <div className="sp-breakdown-row">
                <span>Transaction Fees</span>
                <span>₱{Number(monetaryFee + volunteerFee + inKindFee).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <Elements stripe={stripePromise}>
            <StripePaymentForm
              postId={postId}
              totalAmount={totalAmount}
              donationAmount={donationAmount}
              feeAmount={monetaryFee + volunteerFee + inKindFee}
              monetaryFee={monetaryFee}
              volunteerFee={volunteerFee}
              inKindFee={inKindFee}
              onSuccess={onPaymentSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

// ── Stripe Payment Form (inside Elements provider) ─────────────────────────
function StripePaymentForm({
  totalAmount,
  donationAmount,
  feeAmount,
  postId,
  monetaryFee,
  volunteerFee,
  inKindFee,
  onSuccess,
  onCancel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe not loaded. Please try again.");
      return;
    }

    if (!postId) {
      setError("Post ID missing. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { getApiUrl } = await import("../config/api");
      const token = localStorage.getItem("token");

      // Step 1: Create payment intent on backend
      const intentResponse = await fetch(getApiUrl("/payments/intent"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          postId,
          donationAmount,
          monetaryFee,
          volunteerFee,
          inKindFee,
        }),
      });

      if (!intentResponse.ok) {
        const data = await intentResponse.json();
        throw new Error(data.error || "Failed to create payment intent");
      }

      const { clientSecret } = await intentResponse.json();

      // Step 2: Get card element and confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {},
          },
        });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (
        paymentIntent.status === "succeeded" ||
        paymentIntent.status === "processing"
      ) {
        // Step 3: Confirm with backend
        const confirmResponse = await fetch(getApiUrl("/payments/confirm"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            postId,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error("Payment confirmation failed");
        }

        setLoading(false);
        onSuccess(paymentIntent.id);
      } else {
        setError("Payment failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed");
      setLoading(false);
    }
  };

  return (
    <form className="sp-form" onSubmit={handleSubmit}>
      <div className="sp-form-group">
        <label className="sp-label">Card Details</label>
        <div className="sp-card-element">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#111827",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="sp-error">{error}</div>}

      <div className="sp-amount-display">
        <div className="sp-amount-display-label">Total to Pay:</div>
        <div className="sp-amount-detail">
          {donationAmount > 0 && (
            <div className="sp-amount-detail-line">
              <span>Donation:</span>
              <span>₱{Number(donationAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {feeAmount > 0 && (
            <div className="sp-amount-detail-line">
              <span>Fees:</span>
              <span>₱{Number(feeAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="sp-amount-detail-line sp-amount-detail-total">
            <span><strong>Total:</strong></span>
            <span>
              <strong>₱{Number(totalAmount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="sp-form-buttons">
        <button
          className="sp-btn sp-btn-cancel"
          onClick={onCancel}
          type="button"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="sp-btn sp-btn-pay"
          type="submit"
          disabled={loading || !stripe}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>

      <p className="sp-test-notice">
        💡 <strong>Test Mode:</strong> Use card{" "}
        <code>4242 4242 4242 4242</code> to test a successful payment, or{" "}
        <code>4000 0000 0000 0002</code> to test a decline.
      </p>
    </form>
  );
}

export default StripePaymentModal;
