import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectLedger from "./pages/ProjectLedger.jsx";
import PostNewProject from "./components/PostNewProject.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project-ledger" element={<ProjectLedger />} />
        <Route path="/post-project" element={<PostNewProject />} />
      </Routes>
    </BrowserRouter>
  );
}
