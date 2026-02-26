	import { useState, useEffect } from "react";
	import { useNavigate, useParams } from "react-router-dom";

	const CAUSES = [
	  "Education and Children",
	  "Health and Medicine",
	  "Disaster Relief",
	  "Environment and Climate Change",
	  "Reducing Poverty and Hunger",
	  "Community Development",
	  "Livelihood and Skills Training",
	  "Animal Welfare",
	  "Others",
	];

	function getCause(cause) {
	  const map = {
		"Education and Children": "educationAndChildren",
		"Health and Medicine": "healthAndMedical",
		"Disaster Relief": "disasterRelief",
		"Environment and Climate Change": "environmentAndClimate",
		"Reducing Poverty and Hunger": "povertyAndHunger",
		"Community Development": "communityDevelopment",
		"Livelihood and Skills Training": "livelihoodAndSkillsTraining",
		"Animal Welfare": "animalWelfare",
	  };
	  return map[cause] || "other";
	}

	const newRow = () => ({
	  id: Date.now(),
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
		cause: "",
		impactGoals: "",
		monetarySupport: "",
		volunteerQuantity: "",
		priority: "",
	  });

	  const [supportTypes, setSupportTypes] = useState({
		monetary: true,
		inKind: true,
		volunteer: true,
	  });

	  const [inKindItems, setInKindItems] = useState([newRow()]);
	  const [status, setStatus] = useState(null);
	  const [errorMsg, setErrorMsg] = useState("");

	  // Load project data when component mounts
	  useEffect(() => {
		const fetchProject = async () => {
		  try {
			const res = await fetch(`/posts/${id}`);
			const data = await res.json();
			if (res.ok) {
			  // Map backend data to form
			  setForm({
				campaignTitle: data.projectName || "",
				location: data.location || "",
				cause: data.cause || "",
				impactGoals: data.impactGoals || "",
				monetarySupport: data.supportTypes?.monetary?.targetAmount || "",
				volunteerQuantity: data.supportTypes?.volunteer?.targetVolunteers || "",
				priority: data.priority || "",
			  });

			  setSupportTypes({
				monetary: data.supportTypes?.monetary?.enabled || false,
				inKind: data.supportTypes?.inKind?.length > 0,
				volunteer: data.supportTypes?.volunteer?.enabled || false,
			  });

			  setInKindItems(
				data.supportTypes?.inKind?.length > 0
				  ? data.supportTypes.inKind.map((i) => ({
					  id: Date.now() + Math.random(),
					  itemName: i.itemName,
					  targetQuantity: i.targetQuantity,
					  unit: i.unit,
					}))
				  : [newRow()]
			  );
			} else {
			  setErrorMsg(data.error || "Failed to load project.");
			  setStatus("error");
			}
		  } catch (err) {
			setErrorMsg("Network error. Please try again.");
			setStatus("error");
			console.error(err);
		  }
		};
		fetchProject();
	  }, [id]);

	  const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	  };

	  const toggleSupport = (type) => {
		setSupportTypes((prev) => ({ ...prev, [type]: !prev[type] }));
	  };

	  const handleInKindChange = (id, field, value) => {
		setInKindItems((prev) =>
		  prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
		);
	  };

	  const handleSubmit = async (e) => {
		e.preventDefault();

		// ======= FORM VALIDATION =======
		if (!form.campaignTitle.trim() || !form.cause || !form.priority || !form.location.trim()) {
		  setErrorMsg("Campaign title, location, cause, and priority are required.");
		  setStatus("error");
		  return;
		}

		if (!supportTypes.monetary && !supportTypes.inKind && !supportTypes.volunteer) {
		  setErrorMsg("At least one support type must be selected.");
		  setStatus("error");
		  return;
		}

		if (supportTypes.monetary && (!form.monetarySupport || Number(form.monetarySupport) <= 0)) {
		  setErrorMsg("Monetary support must be greater than 0.");
		  setStatus("error");
		  return;
		}

		if (supportTypes.volunteer && (!form.volunteerQuantity || Number(form.volunteerQuantity) <= 0)) {
		  setErrorMsg("Volunteer quantity must be greater than 0.");
		  setStatus("error");
		  return;
		}

		if (supportTypes.inKind) {
		  for (const item of inKindItems) {
			if (!item.itemName.trim() || !item.unit.trim() || !item.targetQuantity || Number(item.targetQuantity) <= 0) {
			  setErrorMsg("All in-kind items must have a name, positive quantity, and unit.");
			  setStatus("error");
			  return;
			}
		  }
		}
		// ===== END VALIDATION =====

		const updatedProject = {
		  projectName: form.campaignTitle,
		  location: form.location,
		  cause: getCause(form.cause),
		  impactGoals: form.impactGoals,
		  priority: form.priority,
		  supportTypes: {
			monetary: {
			  enabled: supportTypes.monetary && !!form.monetarySupport,
			  targetAmount: supportTypes.monetary ? Number(form.monetarySupport) : 0,
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
			  targetVolunteers: supportTypes.volunteer ? Number(form.volunteerQuantity) : 0,
			},
		  },
		};

		setStatus("loading");
		try {
		  const res = await fetch(`/posts/${id}`, {
			method: "PUT", // or PATCH depending on your API
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updatedProject),
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
		  console.error(err);
		}
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

			  <div>
				<label className="postProjectLabel">
				  Cause <span className="postProjectRequired">*</span>
				</label>
				<select
				  className="postProjectInput"
				  name="cause"
				  value={form.cause}
				  onChange={handleChange}
				>
				  <option value="">Select a cause</option>
				  {CAUSES.map((c) => (
					<option key={c} value={c}>
					  {c}
					</option>
				  ))}
				</select>
			  </div>

			  <div>
				<label className="postProjectLabel">
				  Priority <span className="postProjectRequired">*</span>
				</label>
				<select
				  className="postProjectInput"
				  name="priority"
				  value={form.priority || ""}
				  onChange={handleChange}
				>
				  <option value="">Select priority</option>
				  <option value="High">High</option>
				  <option value="Medium">Medium</option>
				  <option value="Low">Low</option>
				</select>
			  </div>

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
				  name="impactGoals"
				  value={form.impactGoals}
				  onChange={handleChange}
				  placeholder="Enter your project description here..."
				/>
			  </div>

			  {supportTypes.monetary && (
				<div>
				  <label className="postProjectLabel">Monetary Support (PHP)</label>
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
					  onClick={() => setInKindItems((prev) => [...prev, newRow()])}
					  title="Add item"
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
							handleInKindChange(item.id, "itemName", e.target.value)
						  }
						/>
						<input
						  className="postProjectInput"
						  type="number"
						  placeholder="Enter quantity"
						  value={item.targetQuantity}
						  onChange={(e) =>
							handleInKindChange(item.id, "targetQuantity", e.target.value)
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
							  prev.filter((i) => i.id !== item.id)
							)
						  }
						  title="Remove item"
						  disabled={inKindItems.length === 1}
						>
						  ✕
						</button>
					  </div>
					))}
					{inKindItems.filter((i) => i.itemName).length === 0 && (
					  <p className="postProjectInKindEmpty">No item entered yet</p>
					)}
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
		  </div>
		</div>
	  );
	}