import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ViewProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/posts/admin/all");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>
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
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>View all Posts</h1>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#5b7fbf", color: "#fff" }}>
                <th style={thStyle}>Project ID</th>
                <th style={thStyle}>Campaign Name</th>
                <th style={thStyle}>Organization</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
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
                  <td style={tdStyle}>{project.orgName}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: statusColor(project.overallStatus).bg,
                      color: statusColor(project.overallStatus).color,
                    }}>
                      {project.overallStatus}
                    </span>
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
    case "Approved":   return { bg: "#dcfce7", color: "#15803d" };
    case "Pending":    return { bg: "#fef9c3", color: "#92400e" };
    case "Unapproved": return { bg: "#fee2e2", color: "#b91c1c" };
    case "Edited":     return { bg: "#e0e7ff", color: "#3730a3" };
    case "Deleted":    return { bg: "#f3f4f6", color: "#374151" };
    default:           return { bg: "#f3f4f6", color: "#374151" };
  }
}