import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import "../css/ActiveProjects.css";

const CAUSE_STYLES = {
  noPoverty: { label: "Poverty", bg: "#E5243B", color: "#fff" },
  zeroHunger: { label: "Hunger", bg: "#DDA63A", color: "#fff" },
  goodHealth: { label: "Healthcare", bg: "#4C9F38", color: "#fff" },
  qualityEducation: {
    label: "Quality Education",
    bg: "#C5192D",
    color: "#fff",
  },
  genderEquality: { label: "Gender Equality", bg: "#FF3A21", color: "#fff" },
  cleanWater: { label: "Clean Water", bg: "#26BDE2", color: "#fff" },
  affordableEnergy: {
    label: "Affordable Energy",
    bg: "#FCC30B",
    color: "#1a1a1a",
  },
  decentWork: {
    label: "Livelihood And Skills Training",
    bg: "#A21942",
    color: "#fff",
  },
  industry: { label: "Industry & Innovation", bg: "#FD6925", color: "#fff" },
  reducedInequalities: {
    label: "Reduced Inequalities",
    bg: "#DD1367",
    color: "#fff",
  },
  sustainableCities: { label: "Cities & Relief", bg: "#FD9D24", color: "#fff" },
  responsibleConsumption: {
    label: "Responsible Consumption",
    bg: "#BF8B2E",
    color: "#fff",
  },
  climateAction: { label: "Environment", bg: "#3F7E44", color: "#fff" },
  lifeBelowWater: { label: "Life Below Water", bg: "#0A97D9", color: "#fff" },
  lifeOnLand: { label: "Life on Land", bg: "#56C02B", color: "#fff" },
  peaceAndJustice: { label: "Peace & Justice", bg: "#00689D", color: "#fff" },
  partnerships: { label: "Partnerships", bg: "#19486A", color: "#fff" },
  others: { label: "Others", bg: "#6b7280", color: "#fff" },
};

// Map from enum values to category keys
const CAUSE_ENUM_MAP = {
  noPoverty: "noPoverty",
  zeroHunger: "zeroHunger",
  goodHealth: "goodHealth",
  qualityEducation: "qualityEducation",
  genderEquality: "genderEquality",
  cleanWater: "cleanWater",
  affordableEnergy: "affordableEnergy",
  decentWork: "decentWork",
  industry: "industry",
  reducedInequalities: "reducedInequalities",
  sustainableCities: "sustainableCities",
  responsibleConsumption: "responsibleConsumption",
  climateAction: "climateAction",
  lifeBelowWater: "lifeBelowWater",
  lifeOnLand: "lifeOnLand",
  peaceAndJustice: "peaceAndJustice",
  partnerships: "partnerships",
  animalWelfare: "animalWelfare",
  others: "others",
};

const normalizeCause = (causeEnum) => {
  return CAUSE_ENUM_MAP[causeEnum] || "others";
};

export default function ActiveProjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch.toLowerCase());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { getApiUrl, apiFetch } = await import("../config/api");
        const data = await apiFetch(getApiUrl("/posts"));
        // Filter to only show Approved projects
        const approvedProjects = data.filter(
          (project) => project.overallStatus === "Approved",
        );
        setProjects(approvedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const queryFromUrl = searchParams.get("search") || "";
    setSearchText(queryFromUrl);
    setSearchQuery(queryFromUrl.toLowerCase());
  }, [searchParams]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return projects;

    return projects.filter((project) => {
      const projectName = project.projectName?.toLowerCase() || "";
      const description = project.description?.toLowerCase() || "";
      const location = project.location?.toLowerCase() || "";
      const status = project.overallStatus?.toLowerCase() || "";
      const causes = (project.causes || []).join(" ").toLowerCase();
      return (
        projectName.includes(query) ||
        description.includes(query) ||
        location.includes(query) ||
        status.includes(query) ||
        causes.includes(query)
      );
    });
  }, [projects, searchQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = searchText.trim();
    setSearchQuery(trimmed.toLowerCase());
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const { getApiUrl } = await import("../config/api");
      const res = await fetch(getApiUrl(`/posts/${projectId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overallStatus: "Deleted" }),
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="ledger-page">
      <Navbar />
      <main className="ledger-main">
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

        <div className="ledger-header">
          <h1 className="ledger-title">My Active Projects</h1>
          <button
            className="ledger-add-btn"
            onClick={() => navigate("/post-project")}
          >
            Add New Project
          </button>
        </div>

        <form className="project-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="project-search-input"
            placeholder="Search active projects"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button type="submit" className="project-search-btn">
            Search
          </button>
        </form>

        {loading ? (
          <div className="ledger-empty">
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="ledger-empty">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1.4"
              viewBox="0 0 24 24"
            >
              <circle cx="4" cy="7" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="7" x2="20" y2="7" />
              <circle cx="4" cy="12" r="1" fill="#9ca3af" stroke="none" />
              <line x1="8" y1="17" x2="20" y2="17" />
            </svg>
            <p>
              {projects.length === 0
                ? "No projects yet. Click Add New Project to get started."
                : "No active projects match your search."}
            </p>
          </div>
        ) : (
          <div className="ledger-grid">
            {filteredProjects.map((project) => {
              const causes = project.causes?.length ? project.causes : [];

              return (
                <div key={project.id} className="pcard">
                  <div className="pcard-top">
                    {/* Render a badge for each cause */}
                    <div className="pcard-cause-badges">
                      {causes.length > 0 ? (
                        causes.map((causeEnum) => {
                          const categoryKey = normalizeCause(causeEnum);
                          const style =
                            CAUSE_STYLES[categoryKey] || CAUSE_STYLES.others;
                          return (
                            <span
                              key={causeEnum}
                              className="pcard-cause-badge"
                              style={{
                                background: style.bg,
                                color: style.color,
                              }}
                            >
                              {style.label}
                            </span>
                          );
                        })
                      ) : (
                        <span
                          className="pcard-cause-badge"
                          style={{
                            background: CAUSE_STYLES.others.bg,
                            color: CAUSE_STYLES.others.color,
                          }}
                        >
                          {CAUSE_STYLES.others.label}
                        </span>
                      )}
                    </div>

                    <span className="pcard-verified">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <h2 className="pcard-title">{project.projectName}</h2>

                  {project.location && (
                    <p className="pcard-location">
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {project.location}
                    </p>
                  )}

                  {project.description && (
                    <p className="pcard-desc">{project.description}</p>
                  )}

                  <div className="pcard-actions">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/edit-project/${project.id}`)}
                      title="Edit project"
                    >
                      Edit
                    </button>
                    <button
                      className="documentation-btn"
                      onClick={() =>
                        navigate(`/project/${project.id}/documentation`)
                      }
                      title="Upload or view project documentation"
                    >
                      Documentation
                    </button>
                    <button
                      className="contribution-btn"
                      onClick={() =>
                        navigate(`/contribution-detail/${project.id}`)
                      }
                      title="Add contribution"
                    >
                      Add Contribution
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project.id)}
                      title="Delete project"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
