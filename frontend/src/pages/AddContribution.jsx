import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StripePaymentModal } from "../components/StripePayment";
import "../css/AddContribution.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const pct = (current, target) =>
  target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

const fmtPHP = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const newMonetaryRow = () => ({
  id: Date.now() + Math.random(),
  amount: "",
  donorName: "",
});
const newInKindRow = () => ({
  id: Date.now() + Math.random(),
  quantity: "",
  donorName: "",
});
const newVolRow = () => ({
  id: Date.now() + Math.random(),
  count: "",
  donorName: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
});

// ── calculate transaction fees ──────────────────────────────────────────────
const calculateFees = (monetaryRows, volRows, inKindRows, inKindItems) => {
  // 3% of total monetary donation
  const totalMonetary = monetaryRows.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );
  const monetaryFee = totalMonetary * 0.03;

  // 50 PHP per volunteer (capped at 500 PHP)
  const totalVolunteers = volRows.reduce(
    (sum, r) => sum + (parseInt(r.count) || 0),
    0
  );
  const volunteerFee = Math.min(totalVolunteers * 50, 500);

  // 3% of total in-kind donations
  const totalInKind = Object.entries(inKindRows).reduce((sum, [itemId, rows]) => {
    const item = inKindItems.find((i) => i.id === itemId);
    const itemTotal = rows.reduce(
      (itemSum, r) => itemSum + (parseFloat(r.quantity) || 0) * (item?.pricePerUnit || 0),
      0
    );
    return sum + itemTotal;
  }, 0);
  const inKindFee = totalInKind * 0.03;

  return {
    monetaryFee,
    volunteerFee,
    inKindFee,
    total: monetaryFee + volunteerFee + inKindFee,
    totalMonetary,
    totalVolunteers,
    totalInKind,
  };
};

// ── AddBtn ───────────────────────────────────────────────────────────────────
function AddBtn({ onClick, title }) {
  return (
    <button
      className="ac-add-row-btn"
      onClick={onClick}
      title={title}
      type="button"
    >
      +
    </button>
  );
}

// ── RemoveBtn ─────────────────────────────────────────────────────────────────
function RemoveBtn({ onClick }) {
  return (
    <button
      className="ac-remove-row-btn"
      onClick={onClick}
      type="button"
      title="Remove row"
    >
      ×
    </button>
  );
}

// ── Invoice ─────────────────────────────────────────────────────────────────
function Invoice({ monetaryRows, volRows, inKindRows, inKindItems }) {
  const fees = calculateFees(monetaryRows, volRows, inKindRows, inKindItems);
  const { monetaryFee, volunteerFee, inKindFee, total, totalMonetary, totalVolunteers, totalInKind } = fees;

  // Don't show invoice if nothing is entered
  if (totalMonetary === 0 && totalVolunteers === 0 && totalInKind === 0) {
    return null;
  }

  return (
    <div className="ac-invoice">
      <h3 className="ac-invoice-title">💳 Payment Summary</h3>
      
      <div className="ac-invoice-section">
        <div className="ac-invoice-section-title">Your Donation</div>
        {totalMonetary > 0 && (
          <div className="ac-invoice-value-row">
            <span className="ac-invoice-value-label">Monetary donation</span>
            <span className="ac-invoice-value-amount">{fmtPHP(totalMonetary)}</span>
          </div>
        )}
        {totalInKind > 0 && (
          <div className="ac-invoice-value-row">
            <span className="ac-invoice-value-label">In-kind donation (estimated value)</span>
            <span className="ac-invoice-value-amount">{fmtPHP(totalInKind)}</span>
          </div>
        )}
      </div>

      <div className="ac-invoice-divider"></div>
      
      <div className="ac-invoice-table">
        <div className="ac-invoice-section-title">Transaction Fees</div>
        {totalMonetary > 0 && (
          <div className="ac-invoice-row">
            <span className="ac-invoice-desc">
              Monetary fee: {fmtPHP(totalMonetary)} × 3%
            </span>
            <span className="ac-invoice-amount">{fmtPHP(monetaryFee)}</span>
          </div>
        )}

        {totalVolunteers > 0 && (
          <div className="ac-invoice-row">
            <span className="ac-invoice-desc">
              Volunteer fee: {totalVolunteers} volunteers × ₱50 (max: ₱500)
            </span>
            <span className="ac-invoice-amount">{fmtPHP(volunteerFee)}</span>
          </div>
        )}

        {totalInKind > 0 && (
          <div className="ac-invoice-row">
            <span className="ac-invoice-desc">
              In-kind fee: {fmtPHP(totalInKind)} × 3%
            </span>
            <span className="ac-invoice-amount">{fmtPHP(inKindFee)}</span>
          </div>
        )}
      </div>

      <div className="ac-invoice-divider"></div>

      <div className="ac-invoice-total">
        <span className="ac-invoice-total-label">Total Amount to Pay</span>
        <span className="ac-invoice-total-amount">{fmtPHP(totalMonetary + totalInKind + total)}</span>
      </div>

      <p className="ac-invoice-note">
        <strong>Note:</strong> You will be charged the full amount including your donation + transaction fees. Transaction fees help cover payment processing and platform maintenance.
      </p>
    </div>
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
          {p}% &nbsp;·&nbsp;{" "}
          {target > 0
            ? `Target: ${label.includes("₱") ? fmtPHP(target) : target}`
            : "No target set"}
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

  // ── auth context ──
  const userRole        = localStorage.getItem("userRole");
  const userFirstName   = localStorage.getItem("userFirstName") || "";
  const userLastName    = localStorage.getItem("userLastName")  || "";
  const userAffiliation = localStorage.getItem("userAffiliation") || "";
  const userId          = localStorage.getItem("userId") || "";
  const isDonor         = userRole === "donor";

  const donorDisplayName =
    [userFirstName, userLastName].filter(Boolean).join(" ") || "Donor";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);

  // Entry state
  const [monetaryRows, setMonetaryRows] = useState([newMonetaryRow()]);
  const [inKindRows, setInKindRows] = useState({});
  const [volRows, setVolRows] = useState([newVolRow()]);

  // ── fetch project ──
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const { getApiUrl, apiFetch } = await import("../config/api");
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await apiFetch(getApiUrl(`/posts/${id}`));
        setProject(data);

        const init = {};
        (data.supportTypes?.inKind ?? []).forEach((item) => {
          init[item.id] = [newInKindRow()];
        });
        setInKindRows(init);
      } catch (err) {
        console.error("Failed to load project:", err);
        setError(err.message || "Failed to load project. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── row mutators ──
  const updateMonetary = useCallback((rowId, field, value) => {
    setMonetaryRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    );
  }, []);

  const updateInKind = useCallback((itemId, rowId, field, value) => {
    setInKindRows((prev) => ({
      ...prev,
      [itemId]: prev[itemId].map((r) =>
        r.id === rowId ? { ...r, [field]: value } : r,
      ),
    }));
  }, []);

  const updateVol = useCallback((rowId, field, value) => {
    setVolRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
    );
  }, []);

  // ── save ──
  const handlePaymentSuccess = async (paymentIntentId) => {
    setSaving(true);
    try {
      const resolveDonorName = (row) =>
        isDonor ? donorDisplayName : row.donorName || "Anonymous";

      const monetary = monetaryRows
        .filter((r) => parseFloat(r.amount) > 0)
        .map((r) => ({
          donorName: resolveDonorName(r),
          amount: parseFloat(r.amount),
        }));

      const inKind = Object.entries(inKindRows).flatMap(([itemId, rows]) =>
        rows
          .filter((r) => parseFloat(r.quantity) > 0)
          .map((r) => ({
            donorName: resolveDonorName(r),
            itemId,
            quantity: parseFloat(r.quantity),
          })),
      );

      const volunteer = volRows
        .filter((r) => parseInt(r.count) > 0)
        .map((r) => ({
          donorName: resolveDonorName(r),
          count: parseInt(r.count),
          startDate: r.startDate,
          endDate: r.endDate,
          startTime: r.startTime,
          endTime: r.endTime,
        }));

      const { getApiUrl } = await import("../config/api");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("monetary", JSON.stringify(monetary));
      formData.append("inKind", JSON.stringify(inKind));
      formData.append("volunteer", JSON.stringify(volunteer));
      formData.append("paymentIntentId", paymentIntentId);

      if (isDonor && userId) {
        formData.append("donorId", userId);
      }

      if (proofFile) {
        formData.append("proofFile", proofFile);
      }

      const response = await fetch(getApiUrl(`/posts/${id}/contribute`), {
        method: "PATCH",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.error || "Failed to save contribution.");
      }

      setProject(updated.post);
      setMonetaryRows([newMonetaryRow()]);
      const resetInKind = {};
      (updated.post.supportTypes?.inKind ?? []).forEach((item) => {
        resetInKind[item.id] = [newInKindRow()];
      });
      setInKindRows(resetInKind);
      setVolRows([newVolRow()]);
      setProofFile(null);
      setShowPaymentModal(false);

      setSuccessMsg("Payment processed and contribution saved successfully! Thank you for your generous support!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to save after payment: " + (err.message ?? "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleInitiatePayment = async () => {
    try {
      // Validate that at least one contribution is entered
      const monetary = monetaryRows
        .filter((r) => parseFloat(r.amount) > 0);

      const inKind = Object.entries(inKindRows).flatMap(([itemId, rows]) =>
        rows
          .filter((r) => parseFloat(r.quantity) > 0),
      );

      const volunteer = volRows
        .filter((r) => parseInt(r.count) > 0);

      if (monetary.length === 0 && inKind.length === 0 && volunteer.length === 0) {
        alert("Please enter at least one contribution before paying.");
        return;
      }

      // Calculate fees
      const fees = calculateFees(monetaryRows, volRows, inKindRows, inKind.length > 0 ? inKindRows : {});
      const totalMonetary = fees.totalMonetary;
      const totalInKind = fees.totalInKind;

      setPaymentBreakdown({
        donationAmount: totalMonetary + totalInKind,
        monetaryFee: fees.monetaryFee,
        volunteerFee: fees.volunteerFee,
        inKindFee: fees.inKindFee,
      });

      setShowPaymentModal(true);
    } catch (err) {
      console.error(err);
      alert("Error calculating payment: " + (err.message ?? "Unknown error"));
    }
  };

  // ── old save (keeping as backup, not used directly anymore) ──
  const handleSave = async () => {
    // This is now triggered via payment flow
    // For non-monetary contributions, we can still use direct save
    setSaving(true);
    try {
      const resolveDonorName = (row) =>
        isDonor ? donorDisplayName : row.donorName || "Anonymous";

      const monetary = monetaryRows
        .filter((r) => parseFloat(r.amount) > 0)
        .map((r) => ({
          donorName: resolveDonorName(r),
          amount: parseFloat(r.amount),
        }));

      const inKind = Object.entries(inKindRows).flatMap(([itemId, rows]) =>
        rows
          .filter((r) => parseFloat(r.quantity) > 0)
          .map((r) => ({
            donorName: resolveDonorName(r),
            itemId,
            quantity: parseFloat(r.quantity),
          })),
      );

      const volunteer = volRows
        .filter((r) => parseInt(r.count) > 0)
        .map((r) => ({
          donorName: resolveDonorName(r),
          count: parseInt(r.count),
          startDate: r.startDate,
          endDate: r.endDate,
          startTime: r.startTime,
          endTime: r.endTime,
        }));

      if (monetary.length === 0 && inKind.length === 0 && volunteer.length === 0) {
        alert("Please enter at least one contribution before saving.");
        setSaving(false);
        return;
      }

      const { getApiUrl } = await import("../config/api");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("monetary", JSON.stringify(monetary));
      formData.append("inKind", JSON.stringify(inKind));
      formData.append("volunteer", JSON.stringify(volunteer));

      if (isDonor && userId) {
        formData.append("donorId", userId);
      }

      if (proofFile) {
        formData.append("proofFile", proofFile);
      }

      const response = await fetch(getApiUrl(`/posts/${id}/contribute`), {
        method: "PATCH",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.error || "Failed to save contribution.");
      }

      setProject(updated.post);

      setMonetaryRows([newMonetaryRow()]);
      const resetInKind = {};
      (updated.post.supportTypes?.inKind ?? []).forEach((item) => {
        resetInKind[item.id] = [newInKindRow()];
      });
      setInKindRows(resetInKind);
      setVolRows([newVolRow()]);
      setProofFile(null);

      setSuccessMsg("Contributions saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + (err.message ?? "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  // ── loading / error states ──
  if (loading) {
    return (
      <div className="ac-page">
        <main className="ac-main">
          <div className="ac-empty"><p>Loading project…</p></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ac-page">
        <main className="ac-main">
          <button className="ac-back-btn" onClick={() => navigate(-1)} type="button">
            ← Back
          </button>
          <div className="ac-empty" style={{ color: "red" }}>
            <p>{error}</p>
            <button className="ac-save-btn" onClick={() => navigate(-1)}>Go Back</button>
          </div>
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
        <button className="ac-back-btn" onClick={() => navigate(-1)} type="button">
          ← Back
        </button>

        <h1 className="ac-title">{project.projectName}</h1>

        {/* ── Donor identity badge ── */}
        {isDonor && (
          <div className="ac-donor-badge">
            <div className="ac-donor-badge-avatar">
              {donorDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="ac-donor-badge-info">
              <span className="ac-donor-badge-name">{donorDisplayName}</span>
              {userAffiliation && (
                <span className="ac-donor-badge-affiliation">{userAffiliation}</span>
              )}
              <span className="ac-donor-badge-note">
                Your name will be recorded on all contributions below
              </span>
            </div>
          </div>
        )}

        {successMsg && <div className="ac-success">{successMsg}</div>}

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

                  {!isDonor && (
                    <>
                      <span className="ac-lbl">From</span>
                      <input
                        className="ac-input ac-input-donor"
                        type="text"
                        placeholder="Donor name"
                        value={row.donorName}
                        onChange={(e) => updateMonetary(row.id, "donorName", e.target.value)}
                      />
                    </>
                  )}

                  {monetaryRows.length > 1 && (
                    <RemoveBtn
                      onClick={() => setMonetaryRows((p) => p.filter((r) => r.id !== row.id))}
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
                  <div className="ac-item-title">
                    {item.itemName}
                    {item.pricePerUnit && (
                      <span className="ac-item-price-tag">
                        estimated @ {fmtPHP(item.pricePerUnit)}/{unitLabel}
                      </span>
                    )}
                  </div>

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

                        {!isDonor && (
                          <>
                            <span className="ac-lbl">From</span>
                            <input
                              className="ac-input ac-input-donor"
                              type="text"
                              placeholder="Donor name"
                              value={row.donorName}
                              onChange={(e) =>
                                updateInKind(item.id, row.id, "donorName", e.target.value)
                              }
                            />
                          </>
                        )}

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

                  {!isDonor && (
                    <>
                      <span className="ac-lbl">From</span>
                      <input
                        className="ac-input ac-input-donor"
                        type="text"
                        placeholder="Donor / org name"
                        value={row.donorName}
                        onChange={(e) => updateVol(row.id, "donorName", e.target.value)}
                      />
                    </>
                  )}

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
                      onClick={() => setVolRows((p) => p.filter((r) => r.id !== row.id))}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {anySection && (
          <div className="ac-proof-wrap">
            <label htmlFor="proofFile" className="ac-proof-label">
              Proof of Donation (Optional)
            </label>
            <input
              id="proofFile"
              className="ac-proof-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            {proofFile && <p className="ac-proof-file">Selected: {proofFile.name}</p>}
          </div>
        )}

        {/* ── INVOICE ────────────────────────────────────────────────── */}
        {anySection && (
          <Invoice monetaryRows={monetaryRows} volRows={volRows} inKindRows={inKindRows} inKindItems={inKind} />
        )}

        {anySection && (
          <>
            <div className="ac-save-row">
              <button className="ac-save-btn" onClick={handleInitiatePayment} disabled={saving}>
                {saving ? "PROCESSING…" : "💳 PAY & SAVE"}
              </button>
            </div>

            {paymentBreakdown && (
              <StripePaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                postId={id}
                donationAmount={paymentBreakdown.donationAmount}
                monetaryFee={paymentBreakdown.monetaryFee}
                volunteerFee={paymentBreakdown.volunteerFee}
                inKindFee={paymentBreakdown.inKindFee}
                projectName={project.projectName}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}