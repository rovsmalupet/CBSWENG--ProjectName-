import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getApiUrl } from "../config/api.js";
import "../css/PendingAccounts.css";

export default function PendingAccounts() {
  const navigate = useNavigate();
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const fetchPendingAccounts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(getApiUrl("/organizations/pending"));
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
      await apiFetch(getApiUrl(`/organizations/${accountId}/approve`), {
        method: "PATCH",
      });

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
      await apiFetch(getApiUrl(`/organizations/${accountId}/reject`), {
        method: "PATCH",
      });

      // Remove the rejected account from the list
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      alert("Account rejected successfully.");
    } catch (err) {
      console.error("Error rejecting account:", err);
      alert("Failed to reject account. Please try again.");
    }
  };

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pendingAccounts;

    return pendingAccounts.filter((account) => {
      const orgName = (account.orgName || account.affiliation || "").toLowerCase();
      const firstName = account.firstName?.toLowerCase() || "";
      const surname = account.surname?.toLowerCase() || "";
      const email = account.email?.toLowerCase() || "";

      return (
        orgName.includes(query) ||
        firstName.includes(query) ||
        surname.includes(query) ||
        email.includes(query)
      );
    });
  }, [pendingAccounts, searchQuery]);

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

      <input
        type="text"
        className="accounts-search"
        placeholder="Search by organization, name, or email"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      {filteredAccounts.length === 0 ? (
        <div className="empty-state">
          <p>
            {pendingAccounts.length === 0
              ? "No pending accounts at this time."
              : "No matching accounts found."}
          </p>
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
              {filteredAccounts.map((account) => (
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
