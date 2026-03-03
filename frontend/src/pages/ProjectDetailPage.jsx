import { useNavigate, useParams } from "react-router-dom";
import "../css/ProjectDetailPage.css";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Hardcoded project data for each campaign
  const projectsData = {
    1: {
      title: "Batangas Typhoon Relief Hub",
      projectId: "#GP-BTG-2024-001",
      lead: "Red Cross Batangas Hub",
      contactPerson: "Maria Santos",
      email: "maria.santos@redcross.org.ph",
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
    },
    2: {
      title: "Mobile Clinic Supply Hub",
      projectId: "#GP-MCS-2024-002",
      lead: "PhilHealth Region IV-A",
      contactPerson: "Dr. Juan Dela Cruz",
      email: "juan.delacruz@philhealth.gov.ph",
      inventory: [
        {
          id: 1,
          name: "Surgical Instruments Set",
          status: "FULLY FUNDED",
          statusColor: "#10b981",
        },
        {
          id: 2,
          name: "Diagnostic Equipment",
          status: "45% DONATED",
          statusColor: "#3b82f6",
        },
        {
          id: 3,
          name: "Medical Consumables",
          status: "NEEDED: 100 UNITS",
          statusColor: "#ef4444",
        },
      ],
    },
    3: {
      title: "Digital Literacy Philippines",
      projectId: "#GP-DLP-2024-003",
      lead: "DepEd Tech Initiative",
      contactPerson: "Prof. Angela Reyes",
      email: "angela.reyes@deped.gov.ph",
      inventory: [
        {
          id: 1,
          name: "Laptop Computers",
          status: "60% FUNDED",
          statusColor: "#3b82f6",
        },
        {
          id: 2,
          name: "Educational Software Licenses",
          status: "FULLY FUNDED",
          statusColor: "#10b981",
        },
        {
          id: 3,
          name: "Internet Connectivity Setup",
          status: "NEEDED: 15 UNITS",
          statusColor: "#ef4444",
        },
      ],
    },
  };

  // Get project data based on ID
  const project = projectsData[id] || projectsData[1];

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
          <p className="project-meta">
            Contact: <strong>{project.contactPerson}</strong> • Email:{" "}
            <strong>{project.email}</strong>
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
