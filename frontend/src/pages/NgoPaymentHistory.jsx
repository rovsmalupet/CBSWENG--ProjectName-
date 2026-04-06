import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
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
  return (
    <span className={`ph-badge ph-badge-${config.color}`}>{config.label}</span>
  );
};

const calculateAmount = (payment) => {
  return (
    (payment.monetaryContribution || 0) +
    (payment.monetaryTransactionFee || 0) +
    (payment.volunteerTransactionFee || 0) +
    (payment.inKindTransactionFee || 0)
  );
};

export default function NgoPaymentHistory() {
  const navigate = useNavigate();
  const orgId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    totalReceived: 0,
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (userRole !== "ngo") {
      navigate("/");
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all projects for this organization (GET /posts for NGO)
        const projectsData = await apiFetch(getApiUrl("/posts"), {
          headers: { "Content-Type": "application/json" },
        });
        const orgProjects = Array.isArray(projectsData) ? projectsData : [];
        setProjects(orgProjects);

        // Fetch all payments for all projects of this organization
        let allPayments = [];
        let totalReceivedAmount = 0;
        let successCount = 0;

        for (const project of orgProjects) {
          const paymentData = await apiFetch(
            getApiUrl(`/payments/project/${project.id}`),
            { headers: { "Content-Type": "application/json" } },
          );
          if (paymentData.payments) {
            allPayments = allPayments.concat(
              paymentData.payments.map((p) => ({
                ...p,
                projectId: project.id,
                projectName: project.projectName,
              })),
            );
            totalReceivedAmount += paymentData.totalReceived || 0;
            successCount += (paymentData.payments || []).filter(
              (p) => p.status === "succeeded",
            ).length;
          }
        }

        // Sort by creation date descending
        allPayments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setPayments(allPayments);
        setStats({
          totalPayments: allPayments.length,
          successfulPayments: successCount,
          totalReceived: totalReceivedAmount,
        });
      } catch (err) {
        console.error("Failed to load donations:", err);
        setError(err.message || "Failed to load donation history");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [orgId, userRole, navigate]);

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus !== "all" && payment.status !== filterStatus) return false;
    if (filterProject !== "all" && payment.projectId !== filterProject)
      return false;
    return true;
  });

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="ph-page">
        <main className="ph-main">
          <div className="ph-loading">Loading donations...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <Navbar />
      <main className="ph-main">
        <div className="ph-header">
          <button className="ph-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="ph-title">Donations Received</h1>
        </div>

        {error && <div className="ph-error">{error}</div>}

        <div className="ph-stats">
          <div className="ph-stat-card">
            <div className="ph-stat-label">Total Donations</div>
            <div className="ph-stat-value">{stats.totalPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Successful</div>
            <div className="ph-stat-value">{stats.successfulPayments}</div>
          </div>
          <div className="ph-stat-card">
            <div className="ph-stat-label">Total Received</div>
            <div className="ph-stat-value">{fmtPHP(stats.totalReceived)}</div>
          </div>
        </div>

        <div className="ph-filters">
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

          {projects.length > 0 && (
            <div className="ph-filter-group">
              <label className="ph-filter-label">Project:</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="ph-filter-select"
              >
                <option value="all">All Projects</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredPayments.length > 0 ? (
          <div className="ph-table-wrapper">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
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
                        <span title={payment.projectName}>
                          {payment.projectName?.substring(0, 30)}
                          {(payment.projectName?.length || 0) > 30 ? "..." : ""}
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
            <p>No donations received yet.</p>
          </div>
        )}

        {showModal && selectedPayment && (
          <div className="ph-modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="ph-modal-content"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ngo-donation-modal-title"
            >
              <div className="ph-modal-header">
                <h2 id="ngo-donation-modal-title" className="ph-modal-title">
                  Donation Details
                </h2>
                <button
                  className="ph-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="ph-modal-body">
                <div className="ph-modal-row">
                  <span className="ph-modal-label">Project:</span>
                  <span>{selectedPayment.projectName}</span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">Donation Amount:</span>
                  <span>
                    {fmtPHP(selectedPayment.monetaryContribution || 0)}
                  </span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">
                    Transaction Fee (Monetary):
                  </span>
                  <span>
                    {fmtPHP(selectedPayment.monetaryTransactionFee || 0)}
                  </span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">
                    Transaction Fee (Volunteer):
                  </span>
                  <span>
                    {fmtPHP(selectedPayment.volunteerTransactionFee || 0)}
                  </span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">
                    Transaction Fee (In-Kind):
                  </span>
                  <span>
                    {fmtPHP(selectedPayment.inKindTransactionFee || 0)}
                  </span>
                </div>
                <div className="ph-modal-row ph-modal-total">
                  <span className="ph-modal-label">Total Amount Received:</span>
                  <span>{fmtPHP(calculateAmount(selectedPayment))}</span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">Status:</span>
                  <StatusBadge status={selectedPayment.status} />
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">Date & Time:</span>
                  <span>
                    {fmtDate(selectedPayment.createdAt)}{" "}
                    {fmtTime(selectedPayment.createdAt)}
                  </span>
                </div>
                <div className="ph-modal-row">
                  <span className="ph-modal-label">Payment ID:</span>
                  <span className="ph-payment-id">
                    {selectedPayment.paymentIntentId || selectedPayment.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
