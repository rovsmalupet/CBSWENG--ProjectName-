import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ActiveProjects from "./pages/ActiveProjects.jsx";
import UnapprovedProjects from "./pages/UnapprovedProjects.jsx";
import DonorHomepage from "./pages/DonorHomepage.jsx";
import BookmarkedProjects from "./pages/BookmarkedProjects.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PostNewProject from "./components/PostNewProject.jsx";
import EditProject from "./pages/EditProject.jsx"; // <-- added
import AddContribution from "./pages/AddContribution.jsx"; // <-- added
import AdminHomepage from "./pages/AdminHomepage.jsx";
import ViewProjects from "./pages/viewProjects.jsx";
import AdminProjectDetail from "./pages/Adminprojectdetail.jsx";
import PendingAccounts from "./pages/PendingAccounts.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project-ledger" element={<ActiveProjects />} />
        <Route path="/unposted-projects" element={<UnapprovedProjects />} />
        <Route path="/post-project" element={<PostNewProject />} />
        <Route path="/edit-project/:id" element={<EditProject />} />{" "}
        <Route path="/add-contribution/:id" element={<AddContribution />} />{" "}
        <Route path="/donor" element={<DonorHomepage />} />
        <Route path="/donor/bookmarks" element={<BookmarkedProjects />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/admin" element={<AdminHomepage />} />
        <Route path="/viewProjects" element={<ViewProjects />} />
        <Route path="/admin/project/:id" element={<AdminProjectDetail />} />
        <Route path="/admin/pending-accounts" element={<PendingAccounts />} />
      </Routes>
    </BrowserRouter>
  );
}
