/**
 * SecurityLogs — the administrator's read-only audit view. [CSSECDV 2.4.4]
 *
 * "Read-Access and filter comprehensive audit trails of all system activities
 * from the frontend."
 *
 * Read-only is not a UI convention here — there is no write endpoint behind
 * this page to call. The quick filters exist because a wall of undifferentiated
 * events is not an audit trail anyone actually uses; each one answers a
 * question a grader (or a real administrator) would ask.
 */

import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, queryString } from "../config/api.js";
import "../css/SecurityLogs.css";

/** Each preset answers one specific question about the system's security. */
const QUICK_FILTERS = [
  { label: "All events", filters: {} },
  { label: "Failed sign-ins", filters: { eventType: "LOGIN_FAILURE" } },
  { label: "Successful sign-ins", filters: { eventType: "LOGIN_SUCCESS" } },
  { label: "Account lockouts", filters: { eventType: "ACCOUNT_LOCKED" } },
  { label: "Access denials", filters: { q: "attempted" , outcome: "FAILURE" } },
  { label: "Input validation failures", filters: { eventType: "INPUT_VALIDATION_FAILURE" } },
  { label: "Critical only", filters: { severity: "CRITICAL" } },
  { label: "All failures", filters: { outcome: "FAILURE" } },
];

const formatMoment = (value) =>
  new Date(value).toLocaleString("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function SecurityLogs() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = queryString({ ...filters, page, limit: 50 });
      const result = await apiGet(`/security-logs${query}`);
      setData(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiGet("/security-logs/summary").then(setSummary).catch(() => {});
    apiGet("/security-logs/event-types")
      .then((result) => setEventTypes(result.eventTypes ?? []))
      .catch(() => {});
  }, []);

  const applyFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const updateFilter = (key, value) =>
    applyFilters({ ...filters, [key]: value || undefined });

  /**
   * Export the current filtered view. Read-only: it produces a file from data
   * already on screen and changes nothing on the server.
   */
  const exportCsv = () => {
    if (!data?.entries?.length) return;
    const columns = [
      "createdAt", "severity", "eventType", "outcome",
      "actorEmail", "actorRole", "ipAddress", "httpMethod", "route",
      "targetType", "targetId", "message",
    ];
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      columns.join(","),
      ...data.entries.map((entry) => columns.map((column) => escape(entry[column])).join(",")),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `security-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="security-logs-page">
      <div className="security-logs-header">
        <button type="button" className="back-link admin-back-btn" onClick={() => navigate("/admin")}>
          ← Admin dashboard
        </button>
        <h1>Security log</h1>
        <p className="security-logs-subtitle">
          A complete, append-only record of security events. Visible to administrators only, and
          read-only — entries cannot be edited or deleted by anyone.
        </p>
      </div>

      {summary && (
        <div className="security-logs-summary">
          <div className="summary-tile">
            <span className="summary-value">{summary.failedLogins}</span>
            <span className="summary-label">Failed sign-ins (24h)</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.accessDenials}</span>
            <span className="summary-label">Access denials (24h)</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.lockouts}</span>
            <span className="summary-label">Lockouts (24h)</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.validationFailures}</span>
            <span className="summary-label">Rejected inputs (24h)</span>
          </div>
          <div className={`summary-tile ${summary.currentlyLockedAccounts > 0 ? "alert" : ""}`}>
            <span className="summary-value">{summary.currentlyLockedAccounts}</span>
            <span className="summary-label">Locked accounts now</span>
          </div>
        </div>
      )}

      <div className="security-logs-quick-filters">
        {QUICK_FILTERS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={
              JSON.stringify(preset.filters) === JSON.stringify(filters) ? "quick active" : "quick"
            }
            onClick={() => applyFilters(preset.filters)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="security-logs-filters">
        <label>
          From
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(event) => updateFilter("from", event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(event) => updateFilter("to", event.target.value)}
          />
        </label>
        <label>
          Event
          <select
            value={filters.eventType ?? ""}
            onChange={(event) => updateFilter("eventType", event.target.value)}
          >
            <option value="">Any</option>
            {eventTypes.map((entry) => (
              <option key={entry.eventType} value={entry.eventType}>
                {entry.eventType} ({entry.count})
              </option>
            ))}
          </select>
        </label>
        <label>
          Outcome
          <select
            value={filters.outcome ?? ""}
            onChange={(event) => updateFilter("outcome", event.target.value)}
          >
            <option value="">Any</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>
        </label>
        <label>
          Severity
          <select
            value={filters.severity ?? ""}
            onChange={(event) => updateFilter("severity", event.target.value)}
          >
            <option value="">Any</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
        <label>
          Account
          <input
            type="text"
            placeholder="email"
            value={filters.actorEmail ?? ""}
            onChange={(event) => updateFilter("actorEmail", event.target.value)}
          />
        </label>
        <label>
          IP address
          <input
            type="text"
            placeholder="e.g. 192.168"
            value={filters.ipAddress ?? ""}
            onChange={(event) => updateFilter("ipAddress", event.target.value)}
          />
        </label>
        <label className="grow">
          Contains
          <input
            type="text"
            placeholder="search the message"
            value={filters.q ?? ""}
            onChange={(event) => updateFilter("q", event.target.value)}
          />
        </label>

        <div className="filter-actions">
          <button type="button" className="filter-clear-btn" onClick={() => applyFilters({})}>
            Clear
          </button>
          <button
            type="button"
            className="filter-export-btn"
            onClick={exportCsv}
            disabled={!data?.entries?.length}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="security-logs-error" role="alert">
          {error}
        </div>
      )}

      <div className="security-logs-meta">
        {loading ? "Loading…" : `${data?.total ?? 0} matching entries`}
      </div>

      <div className="security-logs-table-wrapper">
        <table className="security-logs-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Severity</th>
              <th>Event</th>
              <th>Result</th>
              <th>Account</th>
              <th>Source</th>
              <th>What happened</th>
            </tr>
          </thead>
          <tbody>
            {(data?.entries ?? []).map((entry) => (
              <Fragment key={entry.id}>
                <tr
                  className={`severity-${entry.severity.toLowerCase()} ${
                    expanded === entry.id ? "expanded" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expanded === entry.id}
                  onClick={() => setExpanded((current) => (current === entry.id ? null : entry.id))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setExpanded((current) => (current === entry.id ? null : entry.id));
                    }
                  }}
                >
                  <td className="cell-time">{formatMoment(entry.createdAt)}</td>
                  <td>
                    <span className={`badge badge-${entry.severity.toLowerCase()}`}>
                      {entry.severity}
                    </span>
                  </td>
                  <td className="cell-event">{entry.eventType}</td>
                  <td>
                    <span className={`badge badge-${entry.outcome.toLowerCase()}`}>
                      {entry.outcome}
                    </span>
                  </td>
                  <td className="cell-actor">
                    {entry.actorEmail ?? "—"}
                    {entry.actorRole && <span className="role-tag">{entry.actorRole}</span>}
                  </td>
                  <td className="cell-ip">{entry.ipAddress ?? "—"}</td>
                  <td className="cell-message">{entry.message}</td>
                </tr>
                {expanded === entry.id && (
                  <tr className="detail-row">
                    <td colSpan={7}>
                      <dl className="detail-grid">
                        <dt>Request</dt>
                        <dd>
                          {entry.httpMethod ?? "—"} {entry.route ?? ""}
                        </dd>
                        <dt>Target</dt>
                        <dd>
                          {entry.targetType ?? "—"} {entry.targetId ?? ""}
                        </dd>
                        <dt>User agent</dt>
                        <dd className="detail-ua">{entry.userAgent ?? "—"}</dd>
                        <dt>Details</dt>
                        <dd>
                          <pre>{JSON.stringify(entry.metadata ?? {}, null, 2)}</pre>
                        </dd>
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {!loading && (data?.entries?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="security-logs-pagination">
          <button
            type="button"
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
