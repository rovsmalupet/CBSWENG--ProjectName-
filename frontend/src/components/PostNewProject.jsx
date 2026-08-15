import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CAUSES = [
	{ label: "Poverty",               key: "noPoverty" },
	{ label: "Hunger",              key: "zeroHunger" },
	{ label: "Healthcare",              key: "goodHealth" },
	{ label: "Quality Education",        key: "qualityEducation" },
	{ label: "Gender Equality",          key: "genderEquality" },
	{ label: "Clean Water",              key: "cleanWater" },
	{ label: "Affordable Energy",        key: "affordableEnergy" },
	{ label: "Livelihood And Skills Training",              key: "decentWork" },
	{ label: "Industry & Innovation",    key: "industry" },
	{ label: "Reduced Inequalities",    key: "reducedInequalities" },
	{ label: "Cities & Relief",      key: "sustainableCities" },
	{ label: "Responsible Consumption", key: "responsibleConsumption" },
	{ label: "Environment",          key: "climateAction" },
	{ label: "Life Below Water",        key: "lifeBelowWater" },
	{ label: "Life on Land",            key: "lifeOnLand" },
	{ label: "Peace & Justice",         key: "peaceAndJustice" },
	{ label: "Partnerships",            key: "partnerships" },
	{ label: "Others",                           key: "others" },
];

const TEXT_LIMITS = Object.freeze({
  campaignTitle: { label: "Campaign title", max: 200 },
  location: { label: "Location", max: 200 },
  description: { label: "Project description", max: 5_000 },
  itemName: { label: "In-kind item name", max: 100 },
  unit: { label: "In-kind unit", max: 20 },
});

const getLengthError = (value, limit) =>
  value.length > limit.max
    ? `${limit.label} is too long. Use ${limit.max.toLocaleString()} characters or fewer (currently ${value.length.toLocaleString()}). The project was not published.`
    : "";

const getFirstLengthError = (form, inKindItems, includeInKind) => {
  for (const field of ["campaignTitle", "location", "description"]) {
    const error = getLengthError(form[field], TEXT_LIMITS[field]);
    if (error) return error;
  }

  if (includeInKind) {
    for (const item of inKindItems) {
      for (const field of ["itemName", "unit"]) {
        const error = getLengthError(item[field], TEXT_LIMITS[field]);
        if (error) return error;
      }
    }
  }

  return "";
};

function CharacterLimitHint({ id, value, limit }) {
  const overBy = value.length - limit.max;

  return (
    <p
      id={id}
      className={`postProjectLengthHint${overBy > 0 ? " postProjectLengthHintError" : ""}`}
      role={overBy > 0 ? "alert" : undefined}
    >
      {value.length.toLocaleString()} / {limit.max.toLocaleString()} characters
      {overBy > 0
        ? ` — reduce by ${overBy.toLocaleString()} character${overBy === 1 ? "" : "s"}.`
        : ""}
    </p>
  );
}

const newRow = () => ({
  id: Date.now() + Math.random(),
  itemName: "",
  targetQuantity: "",
  unit: "",
  pricePerUnit: "",
});

export default function PostNewProject({ onProjectCreated }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    campaignTitle: "",
    location: "",
    description: "",
    monetarySupport: "",
    volunteerQuantity: "",
    priority: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const [selectedCauses, setSelectedCauses] = useState([]);
  const [causeInput, setCauseInput] = useState("");
  const [dateEnabled, setDateEnabled] = useState(false);
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [supportTypes, setSupportTypes] = useState({ monetary: true, inKind: true, volunteer: true });
  const [inKindItems, setInKindItems] = useState([newRow()]);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleSupport = (type) => setSupportTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  const addCause = (key) => { if (key && !selectedCauses.includes(key)) setSelectedCauses((prev) => [...prev, key]); setCauseInput(""); };
  const removeCause = (key) => setSelectedCauses((prev) => prev.filter((c) => c !== key));
  const getCauseLabel = (key) => CAUSES.find((c) => c.key === key)?.label ?? key;
  const handleInKindChange = (id, field, value) => setInKindItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const lengthError = getFirstLengthError(
      form,
      inKindItems,
      supportTypes.inKind,
    );
    if (lengthError) {
      setErrorMsg(lengthError);
      setStatus("error");
      return;
    }

    if (!form.campaignTitle.trim() || !form.priority || !form.location.trim()) {
      setErrorMsg("Campaign title, location, and priority are required."); setStatus("error"); return;
    }
    if (selectedCauses.length === 0) { setErrorMsg("At least one cause must be selected."); setStatus("error"); return; }
    if (!supportTypes.monetary && !supportTypes.inKind && !supportTypes.volunteer) {
      setErrorMsg("At least one support type must be selected."); setStatus("error"); return;
    }
    if (supportTypes.monetary && (!form.monetarySupport || Number(form.monetarySupport) <= 0)) {
      setErrorMsg("Monetary support must be greater than 0."); setStatus("error"); return;
    }
    if (supportTypes.volunteer && (!form.volunteerQuantity || Number(form.volunteerQuantity) <= 0)) {
      setErrorMsg("Volunteer quantity must be greater than 0."); setStatus("error"); return;
    }
    if (supportTypes.inKind) {
      for (const item of inKindItems) {
        if (!item.itemName.trim() || !item.unit.trim() || !item.targetQuantity || Number(item.targetQuantity) <= 0 || !item.pricePerUnit || Number(item.pricePerUnit) <= 0) {
          setErrorMsg("All in-kind items must have a name, positive quantity, unit, and positive price per unit."); setStatus("error"); return;
        }
      }
    }

    const project = {
      projectName: form.campaignTitle,
      location: form.location,
      description: form.description,
      causes: selectedCauses,
      priority: form.priority,
      startDate: dateEnabled && form.startDate ? form.startDate : null,
      endDate: dateEnabled && form.endDate ? form.endDate : null,
      startTime: timeEnabled && form.startTime ? form.startTime : null,
      endTime: timeEnabled && form.endTime ? form.endTime : null,
      supportTypes: {
        monetary: { enabled: supportTypes.monetary && !!form.monetarySupport, targetAmount: supportTypes.monetary ? Number(form.monetarySupport) : 0 },
        inKind: supportTypes.inKind ? inKindItems.map((i) => ({ itemName: i.itemName, targetQuantity: Number(i.targetQuantity), unit: i.unit, pricePerUnit: i.pricePerUnit ? Number(i.pricePerUnit) : null })) : [],
        volunteer: { enabled: supportTypes.volunteer && !!form.volunteerQuantity, targetVolunteers: supportTypes.volunteer ? Number(form.volunteerQuantity) : 0 },
      },
    };

    if (onProjectCreated) onProjectCreated(project);

    setStatus("loading");
    try {
      const { getApiUrl, apiFetch } = await import("../config/api");
      await apiFetch(getApiUrl("/posts"), { method: "POST", body: JSON.stringify(project) });
      setStatus("success");
      setForm({ campaignTitle: "", location: "", description: "", monetarySupport: "", volunteerQuantity: "", priority: "", startDate: "", endDate: "", startTime: "", endTime: "" });
      setSelectedCauses([]);
      setInKindItems([newRow()]);
      setDateEnabled(false);
      setTimeEnabled(false);
      setTimeout(() => navigate("/project-ledger"), 1200);
    } catch (err) {
      const fieldReason = Array.isArray(err.fields)
        ? err.fields.find((field) => field?.reason)?.reason
        : "";
      setErrorMsg(fieldReason || err.message || "Failed to create project.");
      setStatus("error");
      if (import.meta.env.DEV) console.error(err);
    }
  };

  return (
    <div className="postProjectPage">
      <div className="postProjectCard">
        <h2 className="postProjectHeading">Post New Project</h2>

        {status === "success" && <div className="postProjectAlertSuccess" role="status">Project posted successfully! Redirecting...</div>}
        {status === "error" && <div className="postProjectAlertError" role="alert">Warning: {errorMsg}</div>}

        <form onSubmit={handleSubmit} className="postProjectForm">
          {/* LEFT COLUMN */}
          <div className="postProjectCol">
            <div>
              <label className="postProjectLabel">Campaign Title <span className="postProjectRequired">*</span></label>
              <input
                className={`postProjectInput${getLengthError(form.campaignTitle, TEXT_LIMITS.campaignTitle) ? " postProjectInputInvalid" : ""}`}
                name="campaignTitle"
                value={form.campaignTitle}
                onChange={handleChange}
                placeholder="e.g., Clean Water Drive 2024"
                aria-invalid={Boolean(
                  getLengthError(form.campaignTitle, TEXT_LIMITS.campaignTitle),
                )}
                aria-describedby="campaign-title-length"
              />
              <CharacterLimitHint
                id="campaign-title-length"
                value={form.campaignTitle}
                limit={TEXT_LIMITS.campaignTitle}
              />
            </div>

            <div>
              <label className="postProjectLabel">Location <span className="postProjectRequired">*</span></label>
              <input
                className={`postProjectInput${getLengthError(form.location, TEXT_LIMITS.location) ? " postProjectInputInvalid" : ""}`}
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter Location"
                aria-invalid={Boolean(
                  getLengthError(form.location, TEXT_LIMITS.location),
                )}
                aria-describedby="project-location-length"
              />
              <CharacterLimitHint
                id="project-location-length"
                value={form.location}
                limit={TEXT_LIMITS.location}
              />
            </div>

            {/* Cause multi-select with chips */}
            <div>
              <label className="postProjectLabel">Cause <span className="postProjectRequired">*</span></label>
              <select className="postProjectInput" value={causeInput} onChange={(e) => addCause(e.target.value)}>
                <option value="">Select a cause</option>
                {CAUSES.filter((c) => !selectedCauses.includes(c.key)).map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              {selectedCauses.length > 0 && (
                <div className="postProjectChips">
                  {selectedCauses.map((key) => (
                    <span key={key} className="postProjectChip">
                      <button type="button" className="postProjectChipRemove" onClick={() => removeCause(key)}>✕</button>
                      {getCauseLabel(key)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="postProjectLabel">Priority <span className="postProjectRequired">*</span></label>
              <select className="postProjectInput" name="priority" value={form.priority} onChange={handleChange}>
                <option value="">Select priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Date range with toggle */}
            <div>
              <label className="postProjectLabel">
                Date
                <button type="button" onClick={() => setDateEnabled((v) => !v)} style={{ marginLeft: 8, width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", backgroundColor: dateEnabled ? "#16a34a" : "#cbd5e0", position: "relative", transition: "background-color 0.2s", verticalAlign: "middle" }}>
                  <span style={{ position: "absolute", top: 3, left: dateEnabled ? 20 : 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s" }} />
                </button>
              </label>
              {dateEnabled && (
                <div className="postProjectDateRow">
                  <span className="postProjectDateLabel">FROM</span>
                  <input className="postProjectInput" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                  <span className="postProjectDateLabel">TO</span>
                  <input className="postProjectInput" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              )}
            </div>

            {/* Time range with toggle */}
            <div>
              <label className="postProjectLabel">
                Time
                <button type="button" onClick={() => setTimeEnabled((v) => !v)} style={{ marginLeft: 8, width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", backgroundColor: timeEnabled ? "#16a34a" : "#cbd5e0", position: "relative", transition: "background-color 0.2s", verticalAlign: "middle" }}>
                  <span style={{ position: "absolute", top: 3, left: timeEnabled ? 20 : 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s" }} />
                </button>
              </label>
              {timeEnabled && (
                <div className="postProjectDateRow">
                  <span className="postProjectDateLabel">FROM</span>
                  <input className="postProjectInput" type="time" name="startTime" value={form.startTime} onChange={handleChange} />
                  <span className="postProjectDateLabel">TO</span>
                  <input className="postProjectInput" type="time" name="endTime" value={form.endTime} onChange={handleChange} />
                </div>
              )}
            </div>

            {/* Support Types */}
            <div>
              <p className="postProjectSectionLabel">Support Types Required</p>
              {[
                { key: "monetary", label: "Monetary Support (PHP)" },
                { key: "inKind", label: "In-Kind (Food/Supplies)" },
                { key: "volunteer", label: "Volunteer Staffing" },
              ].map(({ key, label }) => (
                <label key={key} className="postProjectCheckboxLabel">
                  <input type="checkbox" checked={supportTypes[key]} onChange={() => toggleSupport(key)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="postProjectCol">
            <div>
              <label className="postProjectLabel">Project Description</label>
              <textarea
                className={`postProjectTextarea${getLengthError(form.description, TEXT_LIMITS.description) ? " postProjectInputInvalid" : ""}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter your project description here..."
                aria-invalid={Boolean(
                  getLengthError(form.description, TEXT_LIMITS.description),
                )}
                aria-describedby="project-description-length"
              />
              <CharacterLimitHint
                id="project-description-length"
                value={form.description}
                limit={TEXT_LIMITS.description}
              />
            </div>

            {supportTypes.monetary && (
              <div>
                <label className="postProjectLabel">Monetary Support (PHP)</label>
                <div className="postProjectInputWrapper">
                  <input className="postProjectInput" name="monetarySupport" type="number" value={form.monetarySupport} onChange={handleChange} placeholder="Enter Amount in pesos" />
                  <span className="postProjectInputSuffix">PHP</span>
                </div>
              </div>
            )}

            {supportTypes.inKind && (
              <div>
                <div className="postProjectInKindHeader">
                  <span className="postProjectLabel">Enter Item Needed</span>
                  <span className="postProjectLabel">Quantity</span>
                  <span className="postProjectLabel">Unit</span>
                  <span className="postProjectLabel">Price/Unit (PHP)</span>
                  <button type="button" className="postProjectAddBtn" onClick={() => setInKindItems((prev) => [...prev, newRow()])} title="Add item">+</button>
                </div>
                <div className="postProjectInKindList">
                  {inKindItems.map((item) => (
                    <div key={item.id} className="postProjectInKindRow">
                      <div className="postProjectInKindField">
                        <input
                          className={`postProjectInput${getLengthError(item.itemName, TEXT_LIMITS.itemName) ? " postProjectInputInvalid" : ""}`}
                          placeholder="Enter item"
                          value={item.itemName}
                          onChange={(e) =>
                            handleInKindChange(
                              item.id,
                              "itemName",
                              e.target.value,
                            )
                          }
                          aria-invalid={Boolean(
                            getLengthError(
                              item.itemName,
                              TEXT_LIMITS.itemName,
                            ),
                          )}
                          aria-describedby={`item-name-${item.id}-length`}
                        />
                        <CharacterLimitHint
                          id={`item-name-${item.id}-length`}
                          value={item.itemName}
                          limit={TEXT_LIMITS.itemName}
                        />
                      </div>
                      <input className="postProjectInput" type="number" placeholder="Qty" value={item.targetQuantity} onChange={(e) => handleInKindChange(item.id, "targetQuantity", e.target.value)} />
                      <div className="postProjectInKindField">
                        <input
                          className={`postProjectInput${getLengthError(item.unit, TEXT_LIMITS.unit) ? " postProjectInputInvalid" : ""}`}
                          placeholder="Unit"
                          value={item.unit}
                          onChange={(e) =>
                            handleInKindChange(
                              item.id,
                              "unit",
                              e.target.value,
                            )
                          }
                          aria-invalid={Boolean(
                            getLengthError(item.unit, TEXT_LIMITS.unit),
                          )}
                          aria-describedby={`item-unit-${item.id}-length`}
                        />
                        <CharacterLimitHint
                          id={`item-unit-${item.id}-length`}
                          value={item.unit}
                          limit={TEXT_LIMITS.unit}
                        />
                      </div>
                      <input className="postProjectInput" type="number" placeholder="PHP" value={item.pricePerUnit} onChange={(e) => handleInKindChange(item.id, "pricePerUnit", e.target.value)} />
                      <button type="button" className="postProjectDeleteRowBtn" onClick={() => setInKindItems((prev) => prev.filter((i) => i.id !== item.id))} title="Remove item" disabled={inKindItems.length === 1}>✕</button>
                    </div>
                  ))}
                  {inKindItems.filter((i) => i.itemName).length === 0 && <p className="postProjectInKindEmpty">No item entered yet</p>}
                </div>
              </div>
            )}

            {supportTypes.volunteer && (
              <div>
                <label className="postProjectLabel">Enter Total Number of Volunteer Staff Needed</label>
                <input className="postProjectInput" name="volunteerQuantity" type="number" value={form.volunteerQuantity} onChange={handleChange} placeholder="Enter Number of Staff" />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="postProjectSubmitBtn" disabled={status === "loading"}>
                {status === "loading" ? "Publishing..." : "Publish Verified Project"}
              </button>
              <button type="button" className="postProjectCancelBtn" onClick={() => navigate("/project-ledger")} disabled={status === "loading"}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
