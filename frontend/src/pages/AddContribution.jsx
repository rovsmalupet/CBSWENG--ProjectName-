import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/AddContribution.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const pct = (current, target) =>
  target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

const fmtPHP = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const newMonetaryRow = () => ({ id: Date.now() + Math.random(), amount: "", donor: "" });
const newInKindRow   = () => ({ id: Date.now() + Math.random(), quantity: "", donor: "" });
const newVolRow      = () => ({
  id: Date.now() + Math.random(),
  count: "",
  donor: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
});

// ── AddBtn ───────────────────────────────────────────────────────────────────
function AddBtn({ onClick, title }) {
  return (
    <button className="ac-add-row-btn" onClick={onClick} title={title} type="button">
      +
    </button>
  );
}

// ── RemoveBtn ─────────────────────────────────────────────────────────────────
function RemoveBtn({ onClick }) {
  return (
    <button className="ac-remove-row-btn" onClick={onClick} type="button" title="Remove row">
      ×
    </button>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ current, target, label, type }) {
  const p = pct(current, target);
  return (
    <div className="ac-progress-wrap">
      <div className="ac-progress-meta">
        <span>{label} collected</span>
        <span>
          {p}% &nbsp;·&nbsp; {target > 0 ? `Target: ${label.includes("₱") ? fmtPHP(target) : target}` : "No target set"}
        </span>
      </div>
      <div className="ac-progress-track">
        <div
          className={`ac-progress-fill ${type}`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddContribution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Entry state
  const [monetaryRows, setMonetaryRows] = useState([newMonetaryRow()]);
  const [inKindRows, setInKindRows]     = useState({});   // { itemId: [row, ...] }
  const [volRows, setVolRows]           = useState([newVolRow()]);

  // ── fetch project ──
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`/posts/${id}`);
        const data = await res.json();
        setProject(data);

        // initialise one empty row per in-kind item
        const init = {};
        (data.supportTypes?.inKind ?? []).forEach((item) => {
          init[item.id] = [newInKindRow()];
        });
        setInKindRows(init);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── row mutators ──
  const updateMonetary = useCallback((rowId, field, value) => {
    setMonetaryRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  }, []);

  const updateInKind = useCallback((itemId, rowId, field, value) => {
    setInKindRows((prev) => ({
      ...prev,
      [itemId]: prev[itemId].map((r) =>
        r.id === rowId ? { ...r, [field]: value } : r
      ),
    }));
  }, []);

  const updateVol = useCallback((rowId, field, value) => {
    setVolRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  }, []);

  // ── save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const monetaryDelta = monetaryRows.reduce(
        (sum, r) => sum + (parseFloat(r.amount) || 0),
        0
      );

      const inKindDeltas = Object.entries(inKindRows)
        .map(([itemId, rows]) => ({
          itemId,
          quantityDelta: rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0),
        }))
        .filter((d) => d.quantityDelta > 0);

      const volunteerDelta = volRows.reduce(
        (sum, r) => sum + (parseInt(r.count) || 0),
        0
      );

      if (monetaryDelta === 0 && inKindDeltas.length === 0 && volunteerDelta === 0) {
        alert("Please enter at least one contribution before saving.");
        setSaving(false);
        return;
      }

      const res = await fetch(`/posts/${id}/contribute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monetaryDelta, inKindDeltas, volunteerDelta }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProject(updated.post);

        // re-init rows
        setMonetaryRows([newMonetaryRow()]);
        const resetInKind = {};
        (updated.post.supportTypes?.inKind ?? []).forEach((item) => {
          resetInKind[item.id] = [newInKindRow()];
        });
        setInKindRows(resetInKind);
        setVolRows([newVolRow()]);

        setSuccessMsg("Contributions saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        const err = await res.json();
        alert("Failed to save: " + (err.error ?? "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving contributions.");
    } finally {
      setSaving(false);
    }
  };

  // ── loading ──
  if (loading) {
    return (
      <div className="ac-page">
        <main className="ac-main">
          <div className="ac-empty"><p>Loading project…</p></div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="ac-page">
        <main className="ac-main">
          <div className="ac-empty"><p>Project not found.</p></div>
        </main>
      </div>
    );
  }

  const { supportTypes } = project;
  const monetary  = supportTypes?.monetary  ?? {};
  const inKind    = supportTypes?.inKind    ?? [];
  const volunteer = supportTypes?.volunteer ?? {};

  const anySection = monetary.enabled || inKind.length > 0 || volunteer.enabled;

  return (
    <div className="ac-page">
      <main className="ac-main">
        {/* Back */}
        <button className="ac-back-btn" onClick={() => navigate("/project-ledger")}>
          ← Back to Active Projects
        </button>

        {/* Title */}
        <div className="ac-header">
          <h1 className="ac-title">{project.projectName}</h1>
        </div>
        <p className="ac-subtitle">Record new contributions and update progress</p>

        {successMsg && (
          <div className="ac-success">✓ {successMsg}</div>
        )}

        {!anySection && (
          <div className="ac-section">
            <p style={{ fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic" }}>
              This project has no support types enabled. Edit the project to add monetary, in-kind, or volunteer goals.
            </p>
          </div>
        )}

        {/* ── MONETARY ──────────────────────────────────────────────────── */}
        {monetary.enabled && (
          <div className="ac-section">
            <h2 className="ac-section-title">Monetary</h2>

            <ProgressBar
              current={monetary.currentAmount}
              target={monetary.targetAmount}
              label={fmtPHP(monetary.currentAmount)}
              type="monetary"
            />

            <div className="ac-rows">
              {monetaryRows.map((row) => (
                <div className="ac-row" key={row.id}>
                  <AddBtn
                    title="Add another monetary donation"
                    onClick={() => setMonetaryRows((p) => [...p, newMonetaryRow()])}
                  />
                  <input
                    className="ac-input ac-input-amount"
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    value={row.amount}
                    onChange={(e) => updateMonetary(row.id, "amount", e.target.value)}
                  />
                  <span className="ac-unit">PHP</span>
                  <span className="ac-lbl">From</span>
                  <input
                    className="ac-input ac-input-donor"
                    type="text"
                    placeholder="Donor name"
                    value={row.donor}
                    onChange={(e) => updateMonetary(row.id, "donor", e.target.value)}
                  />
                  {monetaryRows.length > 1 && (
                    <RemoveBtn
                      onClick={() =>
                        setMonetaryRows((p) => p.filter((r) => r.id !== row.id))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IN-KIND ───────────────────────────────────────────────────── */}
        {inKind.length > 0 && (
          <div className="ac-section">
            <h2 className="ac-section-title">In-Kind</h2>

            {inKind.map((item) => {
              const rows = inKindRows[item.id] ?? [newInKindRow()];
              const unitLabel = item.unit ? item.unit : "pcs";
              const currentLabel = `${item.currentQuantity ?? 0} ${unitLabel}`;

              return (
                <div key={item.id}>
                  <div className="ac-item-title">{item.itemName}</div>

                  <ProgressBar
                    current={item.currentQuantity ?? 0}
                    target={item.targetQuantity}
                    label={currentLabel}
                    type="inkind"
                  />

                  <div className="ac-rows">
                    {rows.map((row) => (
                      <div className="ac-row" key={row.id}>
                        <AddBtn
                          title={`Add another ${item.itemName} donation`}
                          onClick={() =>
                            setInKindRows((p) => ({
                              ...p,
                              [item.id]: [...(p[item.id] ?? []), newInKindRow()],
                            }))
                          }
                        />
                        <input
                          className="ac-input ac-input-pieces"
                          type="number"
                          min="0"
                          placeholder={`Enter ${unitLabel} donated`}
                          value={row.quantity}
                          onChange={(e) =>
                            updateInKind(item.id, row.id, "quantity", e.target.value)
                          }
                        />
                        <span className="ac-unit">{unitLabel.toUpperCase()}</span>
                        <span className="ac-lbl">From</span>
                        <input
                          className="ac-input ac-input-donor"
                          type="text"
                          placeholder="Donor name"
                          value={row.donor}
                          onChange={(e) =>
                            updateInKind(item.id, row.id, "donor", e.target.value)
                          }
                        />
                        {rows.length > 1 && (
                          <RemoveBtn
                            onClick={() =>
                              setInKindRows((p) => ({
                                ...p,
                                [item.id]: p[item.id].filter((r) => r.id !== row.id),
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── VOLUNTEER ─────────────────────────────────────────────────── */}
        {volunteer.enabled && (
          <div className="ac-section">
            <div className="ac-vol-header">
              <h2 className="ac-section-title">Volunteer</h2>
              <span className="ac-sorted-note">Sorted by date and time</span>
            </div>

            <ProgressBar
              current={volunteer.currentVolunteers ?? 0}
              target={volunteer.targetVolunteers}
              label={`${volunteer.currentVolunteers ?? 0} volunteers`}
              type="volunteer"
            />

            <div className="ac-rows">
              {volRows.map((row) => (
                <div className="ac-row" key={row.id}>
                  <AddBtn
                    title="Add another volunteer entry"
                    onClick={() => setVolRows((p) => [...p, newVolRow()])}
                  />
                  <input
                    className="ac-input ac-input-volunteers"
                    type="number"
                    min="0"
                    placeholder="# of volunteers"
                    value={row.count}
                    onChange={(e) => updateVol(row.id, "count", e.target.value)}
                  />
                  <span className="ac-lbl">From</span>
                  <input
                    className="ac-input ac-input-donor"
                    type="text"
                    placeholder="Donor / org name"
                    value={row.donor}
                    onChange={(e) => updateVol(row.id, "donor", e.target.value)}
                  />
                  <span className="ac-lbl">On</span>
                  <input
                    className="ac-input ac-input-date"
                    type="date"
                    value={row.startDate}
                    onChange={(e) => updateVol(row.id, "startDate", e.target.value)}
                  />
                  <span className="ac-lbl">to</span>
                  <input
                    className="ac-input ac-input-date"
                    type="date"
                    value={row.endDate}
                    onChange={(e) => updateVol(row.id, "endDate", e.target.value)}
                  />
                  <span className="ac-lbl">At</span>
                  <input
                    className="ac-input ac-input-time"
                    type="time"
                    value={row.startTime}
                    onChange={(e) => updateVol(row.id, "startTime", e.target.value)}
                  />
                  <span className="ac-lbl">to</span>
                  <input
                    className="ac-input ac-input-time"
                    type="time"
                    value={row.endTime}
                    onChange={(e) => updateVol(row.id, "endTime", e.target.value)}
                  />
                  {volRows.length > 1 && (
                    <RemoveBtn
                      onClick={() =>
                        setVolRows((p) => p.filter((r) => r.id !== row.id))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {anySection && (
          <div className="ac-save-row">
            <button className="ac-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "SAVING…" : "SAVE"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
