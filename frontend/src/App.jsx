import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectLedger from "./pages/ProjectLedger.jsx";
import DonorHomepage from "./pages/DonorHomepage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PostNewProject from "./components/PostNewProject.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project-ledger" element={<ProjectLedger />} />
        <Route path="/post-project" element={<PostNewProject />} />
        <Route path="/donor" element={<DonorHomepage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
