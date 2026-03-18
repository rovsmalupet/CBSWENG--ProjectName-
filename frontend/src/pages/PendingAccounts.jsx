import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api.js";
import "../css/PendingAccounts.css";

export default function PendingAccounts() {
  const navigate = useNavigate();
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const fetchPendingAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/organizations/pending"));
      if (!response.ok) {
        throw new Error("Failed to fetch pending accounts");
      }
      const data = await response.json();
      setPendingAccounts(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching pending accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (accountId) => {
    try {
      const response = await fetch(
        getApiUrl(`/organizations/${accountId}/approve`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to approve account");
      }

      // Remove the approved account from the list
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      alert("Account approved successfully!");
    } catch (err) {
      console.error("Error approving account:", err);
      alert("Failed to approve account. Please try again.");
    }
  };

  const handleReject = async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        getApiUrl(`/organizations/${accountId}/reject`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject account");
      }

      // Remove the rejected account from the list
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      alert("Account rejected successfully.");
    } catch (err) {
      console.error("Error rejecting account:", err);
      alert("Failed to reject account. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pending-accounts-page">
        <div className="loading-message">Loading pending accounts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-accounts-page">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="pending-accounts-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <h1 className="page-title">Pending Accounts</h1>
      <p className="page-subtitle">Review and approve NGO registrations</p>

      {pendingAccounts.length === 0 ? (
        <div className="empty-state">
          <p>No pending accounts at this time.</p>
        </div>
      ) : (
        <div className="accounts-table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>First Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="org-name">
                    {account.orgName || account.affiliation || "-"}
                  </td>
                  <td>{account.firstName}</td>
                  <td>{account.surname}</td>
                  <td>{account.email}</td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(account.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(account.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
