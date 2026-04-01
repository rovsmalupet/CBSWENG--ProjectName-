import { useState, useEffect } from "react";
import { getApiUrl, apiFetch } from "../config/api";
import "../css/PaymentStatusWidget.css";

const fmtPHP = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export function PaymentStatusWidget({ projectId, showSummary = true }) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const loadPaymentData = async () => {
      if (!projectId || !shouldShowPaymentData()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(getApiUrl(`/payments/project/${projectId}`));
        setPaymentData(data);
      } catch (err) {
        console.error("Failed to load payment data:", err);
        // Don't show error in UI if user doesn't have permission
        if (err.message?.includes("Unauthorized")) {
          setPaymentData(null);
        } else {
          setError(err.message || "Failed to load payment data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [projectId]);

  const shouldShowPaymentData = () => {
    return userRole === "ngo" || userRole === "admin";
  };

  if (!shouldShowPaymentData() || loading) {
    return null;
  }

  if (error) {
    return (
      <div className="psw-widget psw-error">
        <p className="psw-error-text">Could not load payment data</p>
      </div>
    );
  }

  if (!paymentData || paymentData.totalPayments === 0) {
    return null;
  }

  const successfulPayments = paymentData.payments?.filter((p) => p.status === "succeeded") || [];
  const totalReceived = paymentData.totalReceived || 0;

  return (
    <div className="psw-widget" onClick={() => setShowDetails(!showDetails)}>
      <div className="psw-header">
        <div className="psw-title">
          <span className="psw-icon">💳</span>
          <span className="psw-label">Payments Received</span>
        </div>
        <div className="psw-amount">{fmtPHP(totalReceived)}</div>
      </div>

      {showDetails && paymentData.payments.length > 0 && (
        <div className="psw-details">
          <div className="psw-stats">
            <div className="psw-stat">
              <span className="psw-stat-label">Total Transactions</span>
              <span className="psw-stat-value">{paymentData.totalPayments}</span>
            </div>
            <div className="psw-stat">
              <span className="psw-stat-label">Successful</span>
              <span className="psw-stat-value">{successfulPayments.length}</span>
            </div>
          </div>

          <div className="psw-breakdown">
            <div className="psw-breakdown-title">Recent Payments</div>
            <div className="psw-payment-list">
              {successfulPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="psw-payment-item">
                  <div className="psw-payment-info">
                    <div className="psw-payment-date">
                      {new Date(payment.createdAt).toLocaleDateString("en-PH")}
                    </div>
                    <div className="psw-payment-status">✅ Paid</div>
                  </div>
                  <div className="psw-payment-amount">{fmtPHP(payment.amount)}</div>
                </div>
              ))}
            </div>

            {paymentData.totalPayments > 3 && (
              <div className="psw-more">+{paymentData.totalPayments - 3} more payments</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentStatusWidget;
