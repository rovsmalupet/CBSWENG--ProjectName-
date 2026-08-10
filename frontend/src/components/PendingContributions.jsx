/**
 * PendingContributions — the organization's review queue for a project.
 *
 * This closes the loop opened by a security fix. [CSSECDV 2.2.3]
 *
 * Contribution totals used to be incremented the instant a row was created,
 * even at status "Pending", so any donor could drive a project's progress bar
 * to its goal without the organization ever agreeing. Totals now move only when
 * the receiving organization confirms — which means there has to be somewhere
 * to confirm them. This is that place.
 *
 * Confirming is one-way: the server refuses to decide an already-decided
 * contribution, so a double click cannot double-count a donation.
 */

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "../config/api.js";
import "../css/PendingContributions.css";

const fmtPHP = (value) =>
  "₱" + Number(value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const describe = (contribution) => {
  if (contribution.type === "Monetary") return fmtPHP(contribution.amount);
  if (contribution.type === "Volunteer") {
    const count = contribution.volunteerCount ?? 0;
    return `${count} volunteer${count === 1 ? "" : "s"}`;
  }
  const unit = contribution.inKindItem?.unit ? ` ${contribution.inKindItem.unit}` : "";
  return `${contribution.quantity ?? 0}${unit} of ${contribution.inKindItem?.itemName ?? "an item"}`;
};

const formatMoment = (value) =>
  new Date(value).toLocaleString("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PendingContributions({ postId, onDecided }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/posts/${postId}/contributions`);
      setContributions(data.contributions ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (contributionId, status) => {
    setBusyId(contributionId);
    setError("");
    try {
      await apiPatch(`/posts/contributions/${contributionId}/status`, { status });
      await load();
      // The project's totals have moved; let the parent refresh its figures.
      onDecided?.();
    } catch (decideError) {
      setError(decideError.message);
    } finally {
      setBusyId(null);
    }
  };

  const pending = contributions.filter((entry) => entry.status === "Pending");
  const decided = contributions.filter((entry) => entry.status !== "Pending");

  if (loading) return <p className="pc-loading">Loading contributions…</p>;

  return (
    <section className="pc-section">
      <h2 className="pc-heading">
        Contributions awaiting your confirmation
        {pending.length > 0 && <span className="pc-count">{pending.length}</span>}
      </h2>
      <p className="pc-intro">
        A contribution only counts towards this project&rsquo;s progress once you confirm it.
      </p>

      {error && (
        <div className="pc-error" role="alert">
          {error}
        </div>
      )}

      {pending.length === 0 ? (
        <p className="pc-empty">Nothing is waiting for review.</p>
      ) : (
        <ul className="pc-list">
          {pending.map((contribution) => (
            <li key={contribution.id} className="pc-item">
              <div className="pc-item-main">
                <span className="pc-donor">{contribution.donorName}</span>
                <span className="pc-what">{describe(contribution)}</span>
                <span className="pc-when">{formatMoment(contribution.createdAt)}</span>
              </div>

              {contribution.proofFileName && (
                <p className="pc-proof">Proof attached: {contribution.proofFileName}</p>
              )}

              <div className="pc-actions">
                <button
                  type="button"
                  className="pc-confirm"
                  disabled={busyId === contribution.id}
                  onClick={() => decide(contribution.id, "Confirmed")}
                >
                  {busyId === contribution.id ? "Saving…" : "Confirm"}
                </button>
                <button
                  type="button"
                  className="pc-decline"
                  disabled={busyId === contribution.id}
                  onClick={() => decide(contribution.id, "Declined")}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {decided.length > 0 && (
        <details className="pc-history">
          <summary>Previously reviewed ({decided.length})</summary>
          <ul className="pc-list pc-list-quiet">
            {decided.map((contribution) => (
              <li key={contribution.id} className="pc-item">
                <div className="pc-item-main">
                  <span className="pc-donor">{contribution.donorName}</span>
                  <span className="pc-what">{describe(contribution)}</span>
                  <span className={`pc-status pc-status-${contribution.status.toLowerCase()}`}>
                    {contribution.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
