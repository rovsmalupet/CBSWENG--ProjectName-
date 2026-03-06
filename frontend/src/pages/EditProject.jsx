import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CAUSES = [
  { label: "Education", key: "educationAndChildren" },
  { label: "Health", key: "healthAndMedical" },
  { label: "Relief", key: "disasterRelief" },
  { label: "Environment", key: "environmentAndClimate" },
  { label: "Poverty", key: "povertyAndHunger" },
  { label: "Community", key: "communityDevelopment" },
  { label: "Livelihood", key: "livelihoodAndSkillsTraining" },
  { label: "Animals", key: "animalWelfare" },
  { label: "Others", key: "others" },
];

const newRow = () => ({
  id: Date.now() + Math.random(),
  itemName: "",
  targetQuantity: "",
  unit: "",
});

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const [supportTypes, setSupportTypes] = useState({
    monetary: false,
    inKind: false,
    volunteer: false,
  });

  const [inKindItems, setInKindItems] = useState([newRow()]);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:3000/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            campaignTitle: data.projectName || "",
            location: data.location || "",
            description: data.description || "",
            monetarySupport: data.supportTypes?.monetary?.targetAmount || "",
            volunteerQuantity:
              data.supportTypes?.volunteer?.targetVolunteers || "",
            priority: data.priority || "",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            startTime: data.startTime || "",
            endTime: data.endTime || "",
          });

          setSelectedCauses(data.causes ?? []);
          setDateEnabled(!!(data.startDate || data.endDate));
          setTimeEnabled(!!(data.startTime || data.endTime));

          setSupportTypes({
            monetary: data.supportTypes?.monetary?.enabled || false,
            inKind: data.supportTypes?.inKind?.length > 0,
            volunteer: data.supportTypes?.volunteer?.enabled || false,
          });

          setInKindItems(
            data.supportTypes?.inKind?.length
              ? data.supportTypes.inKind.map((i) => ({
                  id: Date.now() + Math.random(),
                  itemName: i.itemName,
                  targetQuantity: i.targetQuantity,
                  unit: i.unit,
                }))
              : [newRow()],
          );
        } else {
          setErrorMsg(data.error || "Failed to load project.");
          setStatus("error");
        }
      } catch (err) {
        setErrorMsg("Network error. Please try again.");
        setStatus("error");
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleSupport = (type) =>
    setSupportTypes((prev) => ({ ...prev, [type]: !prev[type] }));

  const addCause = (key) => {
    if (key && !selectedCauses.includes(key)) {
      setSelectedCauses((prev) => [...prev, key]);
    }
    setCauseInput("");
  };

  const removeCause = (key) =>
    setSelectedCauses((prev) => prev.filter((c) => c !== key));

  const getCauseLabel = (key) =>
    CAUSES.find((c) => c.key === key)?.label ?? key;

  const handleInKindChange = (id, field, value) =>
    setInKindItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.campaignTitle.trim() || !form.location.trim() || !form.priority) {
      setErrorMsg("Campaign title, location, and priority are required.");
      setStatus("error");
      return;
    }

    if (selectedCauses.length === 0) {
      setErrorMsg("At least one cause must be selected.");
      setStatus("error");
      return;
    }

    if (
      !supportTypes.monetary &&
      !supportTypes.inKind &&
      !supportTypes.volunteer
    ) {
      setErrorMsg("At least one support type must be selected.");
      setStatus("error");
      return;
    }

    if (
      supportTypes.monetary &&
      (!form.monetarySupport || Number(form.monetarySupport) <= 0)
    ) {
      setErrorMsg("Monetary support must be greater than 0.");
      setStatus("error");
      return;
    }

    if (
      supportTypes.volunteer &&
      (!form.volunteerQuantity || Number(form.volunteerQuantity) <= 0)
    ) {
      setErrorMsg("Volunteer quantity must be greater than 0.");
      setStatus("error");
      return;
    }

    if (supportTypes.inKind) {
      for (const item of inKindItems) {
        if (
          !item.itemName.trim() ||
          !item.unit.trim() ||
          !item.targetQuantity ||
          Number(item.targetQuantity) <= 0
        ) {
          setErrorMsg(
            "All in-kind items must have a name, positive quantity, and unit.",
          );
          setStatus("error");
          return;
        }
      }
    }

    const updatedProject = {
      projectName: form.campaignTitle,
      location: form.location,
      description: form.description,
      causes: selectedCauses,
      priority: form.priority,
      startDate: dateEnabled ? form.startDate : null,
      endDate: dateEnabled ? form.endDate : null,
      startTime: timeEnabled ? form.startTime : null,
      endTime: timeEnabled ? form.endTime : null,
      supportTypes: {
        monetary: {
          enabled: supportTypes.monetary && !!form.monetarySupport,
          targetAmount: supportTypes.monetary
            ? Number(form.monetarySupport)
            : 0,
        },
        inKind: supportTypes.inKind
          ? inKindItems.map((i) => ({
              itemName: i.itemName,
              targetQuantity: Number(i.targetQuantity),
              unit: i.unit,
            }))
          : [],
        volunteer: {
          enabled: supportTypes.volunteer && !!form.volunteerQuantity,
          targetVolunteers: supportTypes.volunteer
            ? Number(form.volunteerQuantity)
            : 0,
        },
      },
    };

    setPendingUpdate(updatedProject);
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate) return;

    setShowConfirmation(false);
    setStatus("loading");

    try {
      const res = await fetch(`http://localhost:3000/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingUpdate,
          overallStatus: "Edited",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTimeout(() => navigate("/project-ledger"), 1200);
      } else {
        setErrorMsg(data.error || "Failed to update project.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }

    setPendingUpdate(null);
  };

  const handleCancelUpdate = () => {
    setShowConfirmation(false);
    setPendingUpdate(null);
  };

  return (
    <div className="postProjectPage">
      <div className="postProjectCard">
        <h2 className="postProjectHeading">Edit Project</h2>

        {status === "success" && (
          <div className="postProjectAlertSuccess">
            ✅ Project updated successfully! Redirecting...
          </div>
        )}
        {status === "error" && (
          <div className="postProjectAlertError">⚠️ {errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="postProjectForm">
          {/* LEFT COLUMN */}
          <div className="postProjectCol">
            <div>
              <label className="postProjectLabel">
                Campaign Title <span className="postProjectRequired">*</span>
              </label>
              <input
                className="postProjectInput"
                name="campaignTitle"
                value={form.campaignTitle}
                onChange={handleChange}
                placeholder="e.g., Clean Water Drive 2024"
              />
            </div>

            <div>
              <label className="postProjectLabel">
                Location <span className="postProjectRequired">*</span>
              </label>
              <input
                className="postProjectInput"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter Location"
              />
            </div>

            {/* Cause multi-select with chips */}
            <div>
              <label className="postProjectLabel">
                Cause <span className="postProjectRequired">*</span>
              </label>
              <select
                className="postProjectInput"
                value={causeInput}
                onChange={(e) => addCause(e.target.value)}
              >
                <option value="">Select a cause</option>
                {CAUSES.filter((c) => !selectedCauses.includes(c.key)).map(
                  (c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ),
                )}
              </select>
              {selectedCauses.length > 0 && (
                <div className="postProjectChips">
                  {selectedCauses.map((key) => (
                    <span key={key} className="postProjectChip">
                      <button
                        type="button"
                        className="postProjectChipRemove"
                        onClick={() => removeCause(key)}
                      >
                        ✕
                      </button>
                      {getCauseLabel(key)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="postProjectLabel">
                Priority <span className="postProjectRequired">*</span>
              </label>
              <select
                className="postProjectInput"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
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
                <button
                  type="button"
                  onClick={() => setDateEnabled((v) => !v)}
                  style={{
                    marginLeft: 8,
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: dateEnabled ? "#16a34a" : "#cbd5e0",
                    position: "relative",
                    transition: "background-color 0.2s",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: dateEnabled ? 20 : 3,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </label>
              {dateEnabled && (
                <div className="postProjectDateRow">
                  <span className="postProjectDateLabel">FROM</span>
                  <input
                    className="postProjectInput"
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                  <span className="postProjectDateLabel">TO</span>
                  <input
                    className="postProjectInput"
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* Time range with toggle */}
            <div>
              <label className="postProjectLabel">
                Time
                <button
                  type="button"
                  onClick={() => setTimeEnabled((v) => !v)}
                  style={{
                    marginLeft: 8,
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: timeEnabled ? "#16a34a" : "#cbd5e0",
                    position: "relative",
                    transition: "background-color 0.2s",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: timeEnabled ? 20 : 3,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </label>
              {timeEnabled && (
                <div className="postProjectDateRow">
                  <span className="postProjectDateLabel">FROM</span>
                  <input
                    className="postProjectInput"
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                  <span className="postProjectDateLabel">TO</span>
                  <input
                    className="postProjectInput"
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                  />
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
                  <input
                    type="checkbox"
                    checked={supportTypes[key]}
                    onChange={() => toggleSupport(key)}
                  />
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
                className="postProjectTextarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter your project description here..."
              />
            </div>

            {supportTypes.monetary && (
              <div>
                <label className="postProjectLabel">
                  Monetary Support (PHP)
                </label>
                <div className="postProjectInputWrapper">
                  <input
                    className="postProjectInput"
                    name="monetarySupport"
                    type="number"
                    value={form.monetarySupport}
                    onChange={handleChange}
                    placeholder="Enter Amount in pesos"
                  />
                  <span className="postProjectInputSuffix">PHP</span>
                </div>
              </div>
            )}

            {supportTypes.inKind && (
              <div>
                <div className="postProjectInKindHeader">
                  <span className="postProjectLabel">Enter Item Needed</span>
                  <span className="postProjectLabel">Specify Quantity</span>
                  <span className="postProjectLabel">Enter Unit</span>
                  <button
                    type="button"
                    className="postProjectAddBtn"
                    onClick={() =>
                      setInKindItems((prev) => [...prev, newRow()])
                    }
                  >
                    +
                  </button>
                </div>
                <div className="postProjectInKindList">
                  {inKindItems.map((item) => (
                    <div key={item.id} className="postProjectInKindRow">
                      <input
                        className="postProjectInput"
                        placeholder="Enter item"
                        value={item.itemName}
                        onChange={(e) =>
                          handleInKindChange(
                            item.id,
                            "itemName",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="postProjectInput"
                        type="number"
                        placeholder="Enter quantity"
                        value={item.targetQuantity}
                        onChange={(e) =>
                          handleInKindChange(
                            item.id,
                            "targetQuantity",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="postProjectInput"
                        placeholder="Enter unit"
                        value={item.unit}
                        onChange={(e) =>
                          handleInKindChange(item.id, "unit", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="postProjectDeleteRowBtn"
                        onClick={() =>
                          setInKindItems((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          )
                        }
                        disabled={inKindItems.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {supportTypes.volunteer && (
              <div>
                <label className="postProjectLabel">
                  Enter Total Number of Volunteer Staff Needed
                </label>
                <input
                  className="postProjectInput"
                  name="volunteerQuantity"
                  type="number"
                  value={form.volunteerQuantity}
                  onChange={handleChange}
                  placeholder="Enter Number of Staff"
                />
              </div>
            )}

            <button
              type="submit"
              className="postProjectSubmitBtn"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>

        {showConfirmation && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                maxWidth: "400px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3
                style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}
              >
                ⚠️ Status Change Notice
              </h3>
              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  lineHeight: "1.5",
                }}
              >
                When you edit this project, its status will be changed to{" "}
                <strong>Pending</strong>. Your project will need to be reviewed
                and approved by an admin again before it becomes active.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleCancelUpdate}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f5f5f5",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
