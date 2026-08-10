/**
 * StripePayment — the payment modal.
 *
 * REWRITTEN for the server-priced payment contract. [CSSECDV 2.2.3]
 *
 * Previously this component computed the transaction fees in the browser and
 * posted them to `/payments/intent`, which charged whatever it was sent. That
 * made the price a client-side value: anyone could open devtools and pay ₱1 of
 * fees on a ₱100,000 donation.
 *
 * Now the client sends only a DESCRIPTION of what is being contributed —
 * how much money, how many volunteers, which in-kind items and quantities —
 * and the server computes the charge from the project's own data and returns
 * the authoritative breakdown. This component displays what the server said.
 *
 * That is also better for the user: the figures on screen are the figures that
 * will be charged, rather than an estimate that could drift from the server's.
 */

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiPost } from "../config/api.js";
import "../css/StripePayment.css";

const fmtPHP = (value) =>
  "₱" + Number(value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

// Loaded lazily so a missing publishable key does not break unrelated pages.
let stripePromise = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key || key.includes("YOUR_PUBLISHABLE_KEY")) {
      console.warn(
        "VITE_STRIPE_PUBLISHABLE_KEY is not set or is a placeholder. " +
          "Add a valid Stripe publishable key to your .env file.",
      );
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * @param {object}   props
 * @param {string}   props.postId        project id, or "admin" for a platform donation
 * @param {object}   props.contribution  WHAT is being given — never what it costs:
 *                                       { monetaryAmount?, volunteerCount?,
 *                                         inKindEntries?: [{ itemId, quantity }] }
 */
export function StripePaymentModal({
  isOpen,
  onClose,
  postId,
  contribution,
  projectName,
  onPaymentSuccess,
}) {
  const stripePromise = getStripePromise();

  /**
   * The request is identified by a serialized key rather than by the
   * `contribution` object itself. Object identity changes on every parent
   * render, which would make an object dependency re-run this effect (and
   * re-create a Stripe PaymentIntent) endlessly. The key also tells us whether
   * the quote we are holding still belongs to what is on screen.
   */
  const requestKey =
    isOpen && postId && contribution ? JSON.stringify({ postId, contribution }) : null;

  // One state value, written only from the async resolution — never
  // synchronously during the effect.
  const [quoteState, setQuoteState] = useState({ status: "idle", key: null });

  useEffect(() => {
    if (!requestKey) return undefined;

    let cancelled = false;
    const { postId: id, contribution: gift } = JSON.parse(requestKey);

    // Ask the server what this costs. There is no fee field to send — the
    // endpoint's schema does not accept one.
    apiPost("/payments/intent", {
      postId: id,
      ...(gift.monetaryAmount > 0 ? { monetaryAmount: gift.monetaryAmount } : {}),
      ...(gift.volunteerCount > 0 ? { volunteerCount: gift.volunteerCount } : {}),
      ...(gift.inKindEntries?.length ? { inKindEntries: gift.inKindEntries } : {}),
    })
      .then((result) => {
        if (!cancelled) setQuoteState({ status: "ready", quote: result, key: requestKey });
      })
      .catch((error) => {
        if (!cancelled) setQuoteState({ status: "error", message: error.message, key: requestKey });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  if (!isOpen) return null;

  // A quote from a previous contribution must not be shown against a new one.
  const current = quoteState.key === requestKey ? quoteState : { status: "idle" };
  const quote = current.status === "ready" ? current.quote : null;
  const quoteError = current.status === "error" ? current.message : "";
  const loadingQuote = current.status === "idle";

  const shell = (body) => (
    <div className="sp-modal-overlay" onClick={onClose}>
      <div className="sp-modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="sp-modal-header">
          <h2 className="sp-modal-title">Confirm payment</h2>
          <button className="sp-modal-close" onClick={onClose} type="button" title="Close">
            ×
          </button>
        </div>
        <div className="sp-modal-body">{body}</div>
      </div>
    </div>
  );

  if (!stripePromise) {
    return shell(
      <>
        <p className="sp-error">Payments are not configured. Please contact support.</p>
        <button onClick={onClose} className="sp-close-btn">
          Close
        </button>
      </>,
    );
  }

  if (loadingQuote) {
    return shell(<p className="sp-loading">Calculating your total…</p>);
  }

  if (quoteError) {
    return shell(
      <>
        <p className="sp-error">{quoteError}</p>
        <button onClick={onClose} className="sp-close-btn">
          Close
        </button>
      </>,
    );
  }

  if (!quote) return shell(<p className="sp-loading">Preparing…</p>);

  const { breakdown, totalAmount } = quote;

  return shell(
    <>
      <p className="sp-payment-project">
        Project: <strong>{projectName}</strong>
      </p>

      {/* Every figure below came from the server, not from this browser. */}
      <div className="sp-breakdown">
        {breakdown.donationAmount > 0 && (
          <div className="sp-breakdown-row">
            <span>Your donation</span>
            <span>{fmtPHP(breakdown.donationAmount)}</span>
          </div>
        )}
        {breakdown.monetaryFee > 0 && (
          <div className="sp-breakdown-row">
            <span>Monetary transaction fee</span>
            <span>{fmtPHP(breakdown.monetaryFee)}</span>
          </div>
        )}
        {breakdown.volunteerFee > 0 && (
          <div className="sp-breakdown-row">
            <span>Volunteer transaction fee</span>
            <span>{fmtPHP(breakdown.volunteerFee)}</span>
          </div>
        )}
        {breakdown.inKindFee > 0 && (
          <div className="sp-breakdown-row">
            <span>In-kind transaction fee</span>
            <span>{fmtPHP(breakdown.inKindFee)}</span>
          </div>
        )}
        <div className="sp-breakdown-row sp-breakdown-total">
          <span>Total to pay</span>
          <span>{fmtPHP(totalAmount)}</span>
        </div>
      </div>

      <Elements stripe={stripePromise}>
        <StripePaymentForm
          clientSecret={quote.clientSecret}
          totalAmount={totalAmount}
          onSuccess={onPaymentSuccess}
          onCancel={onClose}
        />
      </Elements>
    </>,
  );
}

function StripePaymentForm({ clientSecret, totalAmount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setError("Payment form is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: elements.getElement(CardElement), billing_details: {} } },
      );

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
        setError("That payment did not complete. Please try again.");
        setLoading(false);
        return;
      }

      /**
       * Record it. Only the intent reference is sent — the project, the amounts
       * and the owner all come from the intent's own metadata on the server.
       * Sending a postId here would be rejected: the schema is strict, and
       * trusting a client-supplied project is exactly the flaw this replaced.
       */
      await apiPost("/payments/confirm", { paymentIntentId: paymentIntent.id });

      setLoading(false);
      onSuccess(paymentIntent.id);
    } catch (submitError) {
      setError(submitError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sp-form">
      <label className="sp-card-label">Card details</label>
      <div className="sp-card-element">
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#1f2937", "::placeholder": { color: "#9ca3af" } },
              invalid: { color: "#b91c1c" },
            },
          }}
        />
      </div>

      {error && (
        <div className="sp-error" role="alert">
          {error}
        </div>
      )}

      <div className="sp-actions">
        <button type="button" className="sp-cancel-btn" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="sp-pay-btn" disabled={loading || !stripe}>
          {loading ? "Processing…" : `Pay ${fmtPHP(totalAmount)}`}
        </button>
      </div>
    </form>
  );
}

export default StripePaymentModal;
