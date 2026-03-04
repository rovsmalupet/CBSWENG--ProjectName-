import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ActiveProjects from "./pages/ActiveProjects.jsx";
import UnapprovedProjects from "./pages/UnapprovedProjects.jsx";
import DonorHomepage from "./pages/DonorHomepage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PostNewProject from "./components/PostNewProject.jsx";
import EditProject from "./pages/EditProject.jsx"; // <-- added
import AddContribution from "./pages/AddContribution.jsx"; // <-- added

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project-ledger" element={<ActiveProjects />} />
        <Route path="/unapproved-projects" element={<UnapprovedProjects />} />
        <Route path="/post-project" element={<PostNewProject />} />
        <Route path="/edit-project/:id" element={<EditProject />} />{" "}
        {/* <-- added */}
        <Route path="/add-contribution/:id" element={<AddContribution />} />{" "}
        {/* <-- added */}
        <Route path="/donor" element={<DonorHomepage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
