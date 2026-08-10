/**
 * AdminUserManagement — the Part 1 administrator CRUD requirements:
 * "Add new Administrator and Role A accounts" and "Assign/Change user roles".
 *
 * Every action here requires re-authentication [CSSECDV 2.1.13], enforced by
 * the server. The modal appears once per action; the resulting proof is valid
 * for five minutes.
 *
 * Note what an administrator can and cannot do. They may create accounts,
 * change roles between administrator and organization, disable accounts,
 * unlock them, and force a password reset. They cannot read anyone's password,
 * and they cannot choose a lasting password for someone else — a forced reset
 * produces a one-time value the holder must replace at first sign-in.
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, apiPost, apiPatch, apiDelete, queryString } from "../config/api.js";
import { useAuth } from "../context/authContext.js";
import ReauthModal from "../components/ReauthModal.jsx";
import "../css/AdminUserManagement.css";

const formatMoment = (value) =>
  value
    ? new Date(value).toLocaleString("en-PH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  /** The action waiting on a successful re-authentication. */
  const [pendingAction, setPendingAction] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "ngo",
    firstName: "",
    lastName: "",
    orgName: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiGet(`/admin/users${queryString({ ...filters, limit: 100 })}`);
      setUsers(result.users ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Run an action, prompting for re-authentication if the server asks for it.
   * The action is stashed and replayed once the proof is obtained, so the user
   * does not have to re-enter what they were doing.
   */
  const run = async (action) => {
    setError("");
    setNotice(null);
    try {
      const result = await action();
      if (result?.notice) {
        setNotice({ message: result.message, detail: result.notice, password: result.temporaryPassword });
      } else if (result?.message) {
        setNotice({ message: result.message });
      }
      await load();
    } catch (actionError) {
      if (actionError.code === "REAUTH_REQUIRED") {
        setPendingAction(() => action);
        return;
      }
      setError(actionError.message);
    }
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const payload = {
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      ...(newUser.role === "ngo" ? { orgName: newUser.orgName } : {}),
    };
    run(async () => {
      const result = await apiPost("/admin/users", payload, { withReauth: true });
      setShowCreate(false);
      setNewUser({ email: "", role: "ngo", firstName: "", lastName: "", orgName: "" });
      return result;
    });
  };

  const confirmThen = (message, action) => {
    if (window.confirm(message)) run(action);
  };

  return (
    <div className="admin-users-page">
      {pendingAction && (
        <ReauthModal
          title="Confirm your password"
          description="Managing accounts is a sensitive operation. Please confirm your password to continue."
          onConfirmed={() => {
            const action = pendingAction;
            setPendingAction(null);
            run(action);
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}

      <div className="admin-users-header">
        <button type="button" className="back-link" onClick={() => navigate("/admin")}>
          ← Admin dashboard
        </button>
        <h1>User accounts</h1>
        <p className="admin-users-subtitle">
          Create and manage administrator and organization accounts. Donors register themselves.
        </p>
      </div>

      {notice && (
        <div className="admin-users-notice" role="status">
          <p>{notice.message}</p>
          {notice.password && (
            <>
              <p className="temp-password-label">Temporary password (shown once):</p>
              <code className="temp-password">{notice.password}</code>
              <p className="temp-password-detail">{notice.detail}</p>
            </>
          )}
          <button type="button" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="admin-users-error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-users-toolbar">
        <select
          value={filters.role ?? ""}
          onChange={(event) => setFilters({ ...filters, role: event.target.value || undefined })}
        >
          <option value="">All roles</option>
          <option value="admin">Administrators</option>
          <option value="ngo">Organizations</option>
          <option value="donor">Donors</option>
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(event) => setFilters({ ...filters, status: event.target.value || undefined })}
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Disabled">Disabled</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by email"
          value={filters.search ?? ""}
          onChange={(event) => setFilters({ ...filters, search: event.target.value || undefined })}
        />

        <button type="button" className="primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "Create account"}
        </button>
      </div>

      {showCreate && (
        <form className="admin-users-create" onSubmit={handleCreate}>
          <h2>New account</h2>
          <div className="create-grid">
            <label>
              Role
              <select
                value={newUser.role}
                onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
              >
                <option value="ngo">Organization (Role A)</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              />
            </label>
            <label>
              First name
              <input
                type="text"
                required
                value={newUser.firstName}
                onChange={(event) => setNewUser({ ...newUser, firstName: event.target.value })}
              />
            </label>
            <label>
              Last name
              <input
                type="text"
                required
                value={newUser.lastName}
                onChange={(event) => setNewUser({ ...newUser, lastName: event.target.value })}
              />
            </label>
            {newUser.role === "ngo" && (
              <label className="span-2">
                Organization name
                <input
                  type="text"
                  required
                  value={newUser.orgName}
                  onChange={(event) => setNewUser({ ...newUser, orgName: event.target.value })}
                />
              </label>
            )}
          </div>
          <p className="create-note">
            A one-time password will be generated and shown to you once. The account holder must
            change it when they first sign in.
          </p>
          <button type="submit" className="primary">
            Create account
          </button>
        </form>
      )}

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Role</th>
              <th>Status</th>
              <th>Password age</th>
              <th>Last sign-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((account) => {
              // An administrator cannot act on their own account. The server
              // enforces this too; hiding the buttons just avoids offering an
              // action that will be refused.
              const isSelf = account.id === currentUser?.accountId;

              return (
                <tr key={account.id} className={account.status === "Disabled" ? "disabled" : ""}>
                  <td>
                    <div className="account-name">{account.displayName}</div>
                    <div className="account-email">{account.email}</div>
                  </td>
                  <td>
                    <span className={`role-badge role-${account.role}`}>{account.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${account.status.toLowerCase()}`}>
                      {account.status}
                    </span>
                    {account.isLocked && <span className="locked-badge">Locked</span>}
                    {account.mustChangePassword && (
                      <span className="must-change-badge">Must change password</span>
                    )}
                  </td>
                  <td className="cell-quiet">{formatMoment(account.passwordChangedAt)}</td>
                  <td className="cell-quiet">{formatMoment(account.lastLoginAt)}</td>
                  <td className="cell-actions">
                    {isSelf ? (
                      <span className="self-note">This is you</span>
                    ) : (
                      <>
                        {account.isLocked && (
                          <button
                            type="button"
                            onClick={() =>
                              run(() =>
                                apiPost(`/admin/users/${account.id}/unlock`, {}, { withReauth: true }),
                              )
                            }
                          >
                            Unlock
                          </button>
                        )}

                        {account.role !== "donor" && (
                          <button
                            type="button"
                            onClick={() =>
                              confirmThen(
                                `Change ${account.email} from ${account.role} to ${
                                  account.role === "admin" ? "ngo" : "admin"
                                }? They will be signed out of all sessions.`,
                                () =>
                                  apiPatch(
                                    `/admin/users/${account.id}/role`,
                                    { role: account.role === "admin" ? "ngo" : "admin" },
                                    { withReauth: true },
                                  ),
                              )
                            }
                          >
                            {account.role === "admin" ? "Make organization" : "Make administrator"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            confirmThen(
                              `Force a password reset for ${account.email}? They will be signed out everywhere.`,
                              () =>
                                apiPost(
                                  `/admin/users/${account.id}/force-reset`,
                                  {},
                                  { withReauth: true },
                                ),
                            )
                          }
                        >
                          Reset password
                        </button>

                        {account.status !== "Disabled" && (
                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              confirmThen(
                                `Disable ${account.email}? Their records are kept, but they will not be able to sign in.`,
                                () =>
                                  apiDelete(`/admin/users/${account.id}`, { withReauth: true }),
                              )
                            }
                          >
                            Disable
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No accounts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
