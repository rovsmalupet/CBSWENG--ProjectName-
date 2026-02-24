import { useNavigate } from "react-router-dom";
import "../css/ProjectDetailPage.css";

export default function ProjectDetailPage() {
  const navigate = useNavigate();

  // Hardcoded project data
  const project = {
    title: "Batangas Typhoon Relief Hub",
    projectId: "#GP-BTG-2024-001",
    lead: "Red Cross Batangas Hub",
    inventory: [
      {
        id: 1,
        name: "Fortified Rice Sacks (50kg)",
        status: "FULLY FUNDED",
        statusColor: "#10b981",
      },
      {
        id: 2,
        name: "Surgical Mask Packs",
        status: "80% DONATED",
        statusColor: "#3b82f6",
      },
      {
        id: 3,
        name: "Mobile Water Filtration Units",
        status: "NEEDED: 5 UNITS",
        statusColor: "#ef4444",
      },
    ],
  };

  return (
    <div className="project-detail-page">
      <div className="detail-header">
        <h1 className="greeting">Hello, Isa!</h1>
      </div>

      <div className="detail-main">
        <button className="back-btn" onClick={() => navigate("/donor")}>
          ← Back to Results
        </button>

        <div className="project-info">
          <h2 className="project-title">{project.title}</h2>
          <p className="project-meta">
            Project ID: <strong>{project.projectId}</strong> • Lead:{" "}
            <strong>{project.lead}</strong>
          </p>
        </div>

        <div className="inventory-section">
          <h3 className="inventory-title">Inventory & Resource Status</h3>

          <div className="inventory-list">
            {project.inventory.map((item) => (
              <div key={item.id} className="inventory-item">
                <div className="inventory-name">{item.name}</div>
                <div
                  className="inventory-status"
                  style={{ color: item.statusColor }}
                >
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
