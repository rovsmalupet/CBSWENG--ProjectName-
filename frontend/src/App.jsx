import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ActiveProjects from "./pages/ActiveProjects.jsx";
import UnapprovedProjects from "./pages/UnapprovedProjects.jsx";
import DonorHomepage from "./pages/DonorHomepage.jsx";
import BookmarkedProjects from "./pages/BookmarkedProjects.jsx";
import CorporatePartnerships from "./pages/CorporatePartnerships.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PostNewProject from "./components/PostNewProject.jsx";
import EditProject from "./pages/EditProject.jsx";
import AddContribution from "./pages/AddContribution.jsx";
import AdminHomepage from "./pages/AdminHomepage.jsx";
import ViewProjects from "./pages/viewProjects.jsx";
import AdminProjectDetail from "./pages/Adminprojectdetail.jsx";
import PendingAccounts from "./pages/PendingAccounts.jsx";
import NgoRegistration from "./pages/NgoRegistration.jsx";
import DonorRegistration from "./pages/DonorRegistration.jsx";

function RequireRole({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ngo/register" element={<NgoRegistration />} />
        <Route path="/donor/register" element={<DonorRegistration />} />
        <Route path="/auth/:role" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<RequireRole allowedRoles={["ngo"]}><Dashboard /></RequireRole>} />
        <Route path="/project-ledger" element={<RequireRole allowedRoles={["ngo"]}><ActiveProjects /></RequireRole>} />
        <Route path="/unposted-projects" element={<RequireRole allowedRoles={["ngo"]}><UnapprovedProjects /></RequireRole>} />
        <Route path="/post-project" element={<RequireRole allowedRoles={["ngo"]}><PostNewProject /></RequireRole>} />
        <Route path="/edit-project/:id" element={<RequireRole allowedRoles={["ngo"]}><EditProject /></RequireRole>} />
        <Route path="/add-contribution/:id" element={<RequireRole allowedRoles={["donor"]}><AddContribution /></RequireRole>} />
        <Route path="/donor" element={<RequireRole allowedRoles={["donor"]}><DonorHomepage /></RequireRole>} />
        <Route path="/donor/bookmarks" element={<RequireRole allowedRoles={["donor"]}><BookmarkedProjects /></RequireRole>} />
        <Route path="/donor/partnerships" element={<RequireRole allowedRoles={["donor"]}><CorporatePartnerships /></RequireRole>} />
        <Route path="/project/:id" element={<RequireRole allowedRoles={["donor", "ngo", "admin"]}><ProjectDetailPage /></RequireRole>} />
        <Route path="/admin" element={<RequireRole allowedRoles={["admin"]}><AdminHomepage /></RequireRole>} />
        <Route path="/viewProjects" element={<RequireRole allowedRoles={["admin"]}><ViewProjects /></RequireRole>} />
        <Route path="/admin/project/:id" element={<RequireRole allowedRoles={["admin"]}><AdminProjectDetail /></RequireRole>} />
        <Route path="/admin/pending-accounts" element={<RequireRole allowedRoles={["admin"]}><PendingAccounts /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  );
}
