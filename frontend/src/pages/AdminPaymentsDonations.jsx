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
    succeeded: { label: "Paid", color: "success" },
    processing: { label: "Processing", color: "warning" },
    failed: { label: "Failed", color: "danger" },
    refunded: { label: "Refunded", color: "info" },
    pending: { label: "Pending", color: "secondary" },
  };

  const config = statusMap[status] || statusMap.pending;
  return <span className={`ph-badge ph-badge-${config.color}`}>{config.label}</span>;
};

const calculateAmount = (payment) => {
  return (payment.monetaryContribution || 0) + 
         (payment.monetaryTransactionFee || 0) + 
         (payment.volunteerTransactionFee || 0) + 
         (payment.inKindTransactionFee || 0);
};

export default function AdminPaymentsDonations() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    processingPayments: 0,
    failedPayments: 0,
    totalAmount: 0,
    successfulAmount: 0,
    averageAmount: 0,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all posts
        const postsData = await apiFetch(getApiUrl("/posts"), {
          headers: { "Content-Type": "application/json" },
        });
        const allPosts = Array.isArray(postsData) ? postsData : [];

        // Fetch all payments for all projects
        let allPayments = [];
        let totalSuccessfulAmount = 0;
        const statusCount = { succeeded: 0, processing: 0, failed: 0 };

        for (const post of allPosts) {
          try {
            const paymentData = await apiFetch(
              getApiUrl(`/payments/project/${post.id}`),
              { headers: { "Content-Type": "application/json" } }
            );
            if (paymentData.payments) {
              const paymentsWithProjectInfo = paymentData.payments.map((p) => ({
                ...p,
                projectId: post.id,
                projectName: post.projectName,
                orgId: post.organizationId,
                orgName: post.orgName,
              }));
              allPayments = allPayments.concat(paymentsWithProjectInfo);

              paymentsWithProjectInfo.forEach((p) => {
                const amount = calculateAmount(p);
                if (p.status === "succeeded") {
                  totalSuccessfulAmount += amount;
                }
                statusCount[p.status] = (statusCount[p.status] || 0) + 1;
              });
            }
          } catch (err) {
            console.error(`Failed to fetch payments for project ${post.id}`, err);
          }
        }

        // Sort by creation date descending
        allPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const totalPaymentAmount = allPayments.reduce((sum, p) => sum + calculateAmount(p), 0);
        const avgAmount = allPayments.length > 0 ? totalPaymentAmount / allPayments.length : 0;

        setPayments(allPayments);
        setStats({
          totalPayments: allPayments.length,
          successfulPayments: statusCount.succeeded || 0,
          processingPayments: statusCount.processing || 0,
          failedPayments: statusCount.failed || 0,
          totalAmount: totalPaymentAmount,
          successfulAmount: totalSuccessfulAmount,
          averageAmount: avgAmount,
        });
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError(err.message || "Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [userRole, navigate]);

  // Filter and sort payments
  let filteredPayments = payments.filter((payment) => {
    if (filterStatus !== "all" && payment.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!payment.projectName?.toLowerCase().includes(query) &&
          !payment.orgName?.toLowerCase().includes(query) &&
          !payment.id?.toLowerCase().includes(query) &&
          !payment.paymentIntentId?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  // Apply sorting
  filteredPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "amount-desc":
        return calculateAmount(b) - calculateAmount(a);
      case "amount-asc":
        return calculateAmount(a) - calculateAmount(b);
      default:
        return 0;
    }
  });

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="ph-page">
        <main className="ph-main">
          <div className="ph-loading">Loading payment data...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <main className="ph-main">
        <div className="ph-header">
          <button className="ph-back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="ph-title">All Payments & Donations</h1>
        </div>

        {error && <div className="ph-error">{error}</div>}

        {/* Stats Cards */}
        <div className="ph-stats">
          <div className="ph-stat-card">
            <div className="ph-stat-label">Total Transactions</div>
            <div className="ph-stat-value">{stats.totalPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Successful</div>
            <div className="ph-stat-value">{stats.successfulPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Processing</div>
            <div className="ph-stat-value">{stats.processingPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Failed</div>
            <div className="ph-stat-value">{stats.failedPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Total Amount</div>
            <div className="ph-stat-value">{fmtPHP(stats.totalAmount)}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Successful Amount</div>
            <div className="ph-stat-value">{fmtPHP(stats.successfulAmount)}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Average Transaction</div>
            <div className="ph-stat-value">{fmtPHP(stats.averageAmount)}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="ph-controls">
          <div className="ph-search-group">
            <input
              type="text"
              placeholder="Search by project, organization, or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ph-search-input"
            />
          </div>

          <div className="ph-filter-group">
            <label className="ph-filter-label">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="ph-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Paid</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="ph-filter-group">
            <label className="ph-filter-label">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ph-filter-select"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
          <div className="ph-table-wrapper">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Organization</th>
                  <th>Project</th>
                  <th>Donation</th>
                  <th>Fees</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const total = calculateAmount(payment);
                  const fees =
                    (payment.monetaryTransactionFee || 0) +
                    (payment.volunteerTransactionFee || 0) +
                    (payment.inKindTransactionFee || 0);
                  return (
                    <tr key={payment.id}>
                      <td>
                        <div>{fmtDate(payment.createdAt)}</div>
                        <small>{fmtTime(payment.createdAt)}</small>
                      </td>
                      <td>
                        <span title={payment.orgName}>
                          {payment.orgName?.substring(0, 25)}
                          {(payment.orgName?.length || 0) > 25 ? "..." : ""}
                        </span>
                      </td>
                      <td>
                        <span title={payment.projectName}>
                          {payment.projectName?.substring(0, 25)}
                          {(payment.projectName?.length || 0) > 25 ? "..." : ""}
                        </span>
                      </td>
                      <td>{fmtPHP(payment.monetaryContribution || 0)}</td>
                      <td>{fmtPHP(fees)}</td>
                      <td className="ph-total">{fmtPHP(total)}</td>
                      <td>
                        <StatusBadge status={payment.status} />
                      </td>
                      <td>
                        <button
                          className="ph-details-btn"
                          onClick={() => handleViewDetails(payment)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ph-empty">
            <p>No payments found matching your criteria.</p>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedPayment && (
          <div className="ph-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ph-modal-header">
                <h2>Payment Details</h2>
                <button className="ph-modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="ph-modal-body">
                <div className="ph-modal-section">
                  <h3>Organization & Project</h3>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Organization:</span>
                    <span>{selectedPayment.orgName}</span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Project:</span>
                    <span>{selectedPayment.projectName}</span>
                  </div>
                </div>

                <div className="ph-modal-section">
                  <h3>Amount Breakdown</h3>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Donation Amount:</span>
                    <span>{fmtPHP(selectedPayment.monetaryContribution || 0)}</span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Monetary Fee (3%):</span>
                    <span>{fmtPHP(selectedPayment.monetaryTransactionFee || 0)}</span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Volunteer Fee:</span>
                    <span>{fmtPHP(selectedPayment.volunteerTransactionFee || 0)}</span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">In-Kind Fee:</span>
                    <span>{fmtPHP(selectedPayment.inKindTransactionFee || 0)}</span>
                  </div>
                  <div className="ph-modal-row ph-modal-total">
                    <span className="ph-modal-label">Total Amount:</span>
                    <span>{fmtPHP(calculateAmount(selectedPayment))}</span>
                  </div>
                </div>

                <div className="ph-modal-section">
                  <h3>Payment Status</h3>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Status:</span>
                    <StatusBadge status={selectedPayment.status} />
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Currency:</span>
                    <span>{selectedPayment.currency}</span>
                  </div>
                </div>

                <div className="ph-modal-section">
                  <h3>Transaction Information</h3>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Date & Time:</span>
                    <span>
                      {fmtDate(selectedPayment.createdAt)} {fmtTime(selectedPayment.createdAt)}
                    </span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Payment ID:</span>
                    <span className="ph-payment-id">{selectedPayment.paymentIntentId || selectedPayment.id}</span>
                  </div>
                  <div className="ph-modal-row">
                    <span className="ph-modal-label">Description:</span>
                    <span className="ph-payment-description">{selectedPayment.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
