import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, getApiUrl } from "../config/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "../css/PendingAccounts.css";

export default function PendingAccounts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState(null);

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  useEffect(() => {
    const queryFromUrl = searchParams.get("search") || "";
    setSearchQuery(queryFromUrl);
  }, [searchParams]);

  const fetchPendingAccounts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(getApiUrl("/organizations/pending"));
      setPendingAccounts(data);
    } catch (err) {
      setError(err.message);
      if (import.meta.env.DEV) console.error("Error fetching pending accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (accountId) => {
    setActionBusy(true);
    setActiveAccountId(accountId);
    try {
      await apiFetch(getApiUrl(`/organizations/${accountId}/approve`), {
        method: "PATCH",
      });

      // Remove the approved account from the list
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      setDialog({
        kind: "status",
        title: "Account approved",
        message: "The organization account was approved successfully.",
        tone: "success",
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error approving account:", err);
      setDialog({
        kind: "status",
        title: "Approval failed",
        message: "Failed to approve account. Please try again.",
        tone: "danger",
      });
    } finally {
      setActionBusy(false);
      setActiveAccountId(null);
    }
  };

  const handleReject = (accountId) => {
    setDialog({
      kind: "confirm-reject",
      accountId,
      title: "Reject organization account?",
      message: "This action cannot be undone. The organization will not be able to use this account.",
      tone: "danger",
    });
  };

  const confirmReject = async (accountId) => {
    setActionBusy(true);
    setActiveAccountId(accountId);
    try {
      await apiFetch(getApiUrl(`/organizations/${accountId}/reject`), {
        method: "PATCH",
      });

      // Remove the rejected account from the list
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      setDialog({
        kind: "status",
        title: "Account rejected",
        message: "The organization account was rejected successfully.",
        tone: "success",
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error rejecting account:", err);
      setDialog({
        kind: "status",
        title: "Rejection failed",
        message: "Failed to reject account. Please try again.",
        tone: "danger",
      });
    } finally {
      setActionBusy(false);
      setActiveAccountId(null);
    }
  };

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pendingAccounts;

    return pendingAccounts.filter((account) => {
      const orgName = (
        account.orgName ||
        account.affiliation ||
        ""
      ).toLowerCase();
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
      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.title}
        message={dialog?.message}
        tone={dialog?.tone}
        showCancel={dialog?.kind === "confirm-reject"}
        confirmLabel={dialog?.kind === "confirm-reject" ? "Reject account" : "OK"}
        busyLabel="Rejecting…"
        busy={actionBusy && dialog?.kind === "confirm-reject"}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind === "confirm-reject") {
            confirmReject(dialog.accountId);
          } else {
            setDialog(null);
          }
        }}
      />

      <button type="button" className="back-link" onClick={() => navigate(-1)}>
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
        onChange={(event) => {
          const value = event.target.value;
          setSearchQuery(value);
          if (value.trim()) {
            setSearchParams({ search: value });
          } else {
            setSearchParams({});
          }
        }}
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
                      type="button"
                      className="approve-btn"
                      onClick={() => handleApprove(account.id)}
                      disabled={actionBusy}
                    >
                      {actionBusy && activeAccountId === account.id ? "Approving…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      onClick={() => handleReject(account.id)}
                      disabled={actionBusy}
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
