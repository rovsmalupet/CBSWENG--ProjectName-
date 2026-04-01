import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl, apiFetch } from "../config/api";
import "../css/PaymentHistory.css";

const fmtPHP = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const fmtDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fmtTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => {
  const statusMap = {
    succeeded: { label: "✅ Paid", color: "success" },
    processing: { label: "⏳ Processing", color: "warning" },
    failed: { label: "❌ Failed", color: "danger" },
    refunded: { label: "🔄 Refunded", color: "info" },
    pending: { label: "⏸️ Pending", color: "secondary" },
  };

  const config = statusMap[status] || statusMap.pending;
  return <span className={`ph-badge ph-badge-${config.color}`}>{config.label}</span>;
};

export default function PaymentHistory() {
  const navigate = useNavigate();
  const donorId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    totalSpent: 0,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userRole !== "donor") {
      navigate("/");
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(getApiUrl(`/payments/donor/${donorId}`));

        setPayments(data.payments || []);
        setStats({
          totalPayments: data.totalPayments,
          successfulPayments: data.successfulPayments,
          totalSpent: data.totalSpent,
        });
      } catch (err) {
        console.error("Failed to load payment history:", err);
        setError(err.message || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [donorId, userRole, navigate]);

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="ph-page">
        <main className="ph-main">
          <div className="ph-loading">
            <p>Loading your payment history...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <main className="ph-main">
        <button className="ph-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="ph-title">💳 Payment History</h1>
        <p className="ph-subtitle">
          View all your contributions and payments to projects
        </p>

        {/* Stats Cards */}
        <div className="ph-stats">
          <div className="ph-stat-card">
            <div className="ph-stat-value">{stats.totalPayments}</div>
            <div className="ph-stat-label">Total Payments</div>
          </div>
          <div className="ph-stat-card ph-stat-success">
            <div className="ph-stat-value">{stats.successfulPayments}</div>
            <div className="ph-stat-label">Successful</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-value">{fmtPHP(stats.totalSpent)}</div>
            <div className="ph-stat-label">Total Spent</div>
          </div>
        </div>

        {error && (
          <div className="ph-error">
            <p>{error}</p>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="ph-empty">
            <p>No payments yet</p>
            <small>Your contributions and their payment status will appear here</small>
          </div>
        ) : (
          <div className="ph-table-wrapper">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="ph-table-row">
                    <td>
                      <div className="ph-date-cell">
                        <div className="ph-date">{fmtDate(payment.createdAt)}</div>
                        <div className="ph-time">{fmtTime(payment.createdAt)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="ph-project-cell">
                        <div className="ph-project-name">{payment.post?.projectName || "Unknown"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="ph-amount">{fmtPHP(payment.amount)}</div>
                    </td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td>
                      <button
                        className="ph-details-btn"
                        onClick={() => handleViewDetails(payment)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showModal && selectedPayment && (
        <div className="ph-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ph-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h2 className="ph-modal-title">💳 Payment Details</h2>
              <button
                className="ph-modal-close"
                onClick={() => setShowModal(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="ph-modal-body">
              <div className="ph-detail-grid">
                <div className="ph-detail-group">
                  <label className="ph-detail-label">Project</label>
                  <div className="ph-detail-value">{selectedPayment.post?.projectName}</div>
                </div>

                <div className="ph-detail-group">
                  <label className="ph-detail-label">Payment ID</label>
                  <div className="ph-detail-value ph-monospace">{selectedPayment.paymentIntentId}</div>
                </div>

                <div className="ph-detail-group">
                  <label className="ph-detail-label">Amount Paid</label>
                  <div className="ph-detail-value ph-detail-amount">{fmtPHP(selectedPayment.amount)}</div>
                </div>

                <div className="ph-detail-group">
                  <label className="ph-detail-label">Date</label>
                  <div className="ph-detail-value">
                    {fmtDate(selectedPayment.createdAt)} at {fmtTime(selectedPayment.createdAt)}
                  </div>
                </div>

                <div className="ph-detail-group">
                  <label className="ph-detail-label">Status</label>
                  <div className="ph-detail-value">
                    <StatusBadge status={selectedPayment.status} />
                  </div>
                </div>

                <div className="ph-detail-group">
                  <label className="ph-detail-label">Currency</label>
                  <div className="ph-detail-value">{selectedPayment.currency}</div>
                </div>
              </div>

              {selectedPayment.description && (
                <div className="ph-detail-description">
                  <label className="ph-detail-label">Description</label>
                  <p className="ph-detail-desc-text">{selectedPayment.description}</p>
                </div>
              )}

              <div className="ph-modal-footer">
                <button
                  className="ph-btn ph-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                {selectedPayment.post && (
                  <button
                    className="ph-btn ph-btn-primary"
                    onClick={() => {
                      navigate(`/project/${selectedPayment.post.id}`);
                      setShowModal(false);
                    }}
                  >
                    View Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
