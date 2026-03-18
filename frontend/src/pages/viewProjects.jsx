import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

export default function ViewProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { getApiUrl, apiFetch } = await import("../config/api");
        const data = await apiFetch(getApiUrl("/posts/admin/all"));
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) => {
      const projectId = project.id?.slice(0, 8).toLowerCase() || "";
      const projectName = project.projectName?.toLowerCase() || "";
      const orgName = project.orgName?.toLowerCase() || "";
      const status = project.overallStatus?.toLowerCase() || "";
      return (
        projectId.includes(query) ||
        projectName.includes(query) ||
        orgName.includes(query) ||
        status.includes(query)
      );
    });
  }, [projects, searchQuery]);

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        background: "#f0f4ff",
        minHeight: "100vh",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "#2563eb",
          cursor: "pointer",
          fontSize: "14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
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

      <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
        View all Posts
      </h1>

      <input
        type="text"
        placeholder="Search by project ID, campaign name, organization, or status"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        style={{
          width: "100%",
          maxWidth: "520px",
          marginBottom: "16px",
          padding: "10px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          fontSize: "14px",
          background: "#fff",
        }}
      />

      {loading ? (
        <p>Loading projects...</p>
      ) : error ? (
        <p style={{ color: "#b91c1c" }}>{error}</p>
      ) : filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div
          style={{
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #cbd5e1",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#5b7fbf", color: "#fff" }}>
                <th style={thStyle}>Project ID</th>
                <th style={thStyle}>Campaign Name</th>
                <th style={thStyle}>Organization</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => (
                <tr
                  key={project.id}
                  style={{
                    background: index % 2 === 0 ? "#fff" : "#eef2f9",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/admin/project/${project.id}`)}
                >
                  <td style={{ ...tdStyle, fontWeight: "700" }}>
                    #{project.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={tdStyle}>{project.projectName}</td>
                  <td style={tdStyle}>{project.orgName || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: statusColor(project.overallStatus).bg,
                        color: statusColor(project.overallStatus).color,
                      }}
                    >
                      {project.overallStatus}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: "12px", color: "#6b7280" }}>
                    {project.lastAudit ? (
                      <>
                        <span style={{ fontWeight: "600", color: "#374151" }}>
                          {project.lastAudit.action}
                        </span>
                        {" by "}
                        {project.lastAudit.admin.firstName}{" "}
                        {project.lastAudit.admin.lastName}
                        <br />
                        {formatDate(project.lastAudit.createdAt)}
                      </>
                    ) : (
                      "No actions yet"
                    )}
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

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: "700",
  fontSize: "14px",
  borderRight: "1px solid #4a6fa5",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0",
};

function statusColor(status) {
  switch (status) {
    case "Approved":
      return { bg: "#dcfce7", color: "#15803d" };
    case "Pending":
      return { bg: "#fef9c3", color: "#92400e" };
    case "Unapproved":
      return { bg: "#fee2e2", color: "#b91c1c" };
    case "Edited":
      return { bg: "#e0e7ff", color: "#3730a3" };
    case "Deleted":
      return { bg: "#f3f4f6", color: "#374151" };
    default:
      return { bg: "#f3f4f6", color: "#374151" };
  }
}