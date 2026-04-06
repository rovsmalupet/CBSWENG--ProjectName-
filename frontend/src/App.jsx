import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrganizationPartnershipOffers from "./pages/OrganizationPartnershipOffers.jsx";
import ActiveProjects from "./pages/ActiveProjects.jsx";
import UnapprovedProjects from "./pages/UnapprovedProjects.jsx";
import DonorHomepage from "./pages/DonorHomepage.jsx";
import BookmarkedProjects from "./pages/BookmarkedProjects.jsx";
import CorporatePartnerships from "./pages/CorporatePartnerships.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ContributionDetailPage from "./pages/ContributionDetailPage.jsx";
import PostNewProject from "./components/PostNewProject.jsx";
import EditProject from "./pages/EditProject.jsx";
import AddContribution from "./pages/AddContribution.jsx";
import AdminHomepage from "./pages/AdminHomepage.jsx";
import ViewProjects from "./pages/viewProjects.jsx";
import AdminProjectDetail from "./pages/Adminprojectdetail.jsx";
import PendingAccounts from "./pages/PendingAccounts.jsx";
import NgoRegistration from "./pages/NgoRegistration.jsx";
import DonorRegistration from "./pages/DonorRegistration.jsx";
import ProjectDocumentation from "./pages/ProjectDocumentation.jsx";
import OrganizationVerification from "./pages/OrganizationVerification.jsx";
import ASEANSelection from "./pages/ASEANSelection.jsx";
import CountrySDGStats from "./pages/CountrySDGStats.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import NgoPaymentHistory from "./pages/NgoPaymentHistory.jsx";
import AdminPaymentsDonations from "./pages/AdminPaymentsDonations.jsx";
import DeveloperDonation from "./pages/DeveloperDonation.jsx";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ngo/register" element={<NgoRegistration />} />
        <Route path="/donor/register" element={<DonorRegistration />} />
        <Route path="/auth/:role" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<RequireRole allowedRoles={["ngo"]}><Dashboard /></RequireRole>} />
        <Route path="/ngo/partnership-offers" element={<RequireRole allowedRoles={["ngo"]}><OrganizationPartnershipOffers /></RequireRole>} />
        <Route path="/ngo/donations" element={<RequireRole allowedRoles={["ngo"]}><NgoPaymentHistory /></RequireRole>} />
        <Route path="/project-ledger" element={<RequireRole allowedRoles={["ngo"]}><ActiveProjects /></RequireRole>} />
        <Route path="/unposted-projects" element={<RequireRole allowedRoles={["ngo"]}><UnapprovedProjects /></RequireRole>} />
        <Route path="/post-project" element={<RequireRole allowedRoles={["ngo"]}><PostNewProject /></RequireRole>} />
        <Route path="/edit-project/:id" element={<RequireRole allowedRoles={["ngo"]}><EditProject /></RequireRole>} />
        <Route path="/add-contribution/:id" element={<RequireRole allowedRoles={["donor", "ngo"]}><AddContribution /></RequireRole>} />
        <Route path="/contribution-detail/:id" element={<RequireRole allowedRoles={["ngo"]}><ContributionDetailPage /></RequireRole>} />
        <Route path="/donor" element={<RequireRole allowedRoles={["donor"]}><DonorHomepage /></RequireRole>} />
        <Route path="/donor/asean" element={<RequireRole allowedRoles={["donor"]}><ASEANSelection /></RequireRole>} />
        <Route path="/donor/country/:country" element={<RequireRole allowedRoles={["donor"]}><CountrySDGStats /></RequireRole>} />
        <Route path="/donor/bookmarks" element={<RequireRole allowedRoles={["donor"]}><BookmarkedProjects /></RequireRole>} />
        <Route path="/donor/partnerships" element={<RequireRole allowedRoles={["donor"]}><CorporatePartnerships /></RequireRole>} />
        <Route path="/payment-history" element={<RequireRole allowedRoles={["donor"]}><PaymentHistory /></RequireRole>} />
        <Route path="/donate-to-developers" element={<RequireRole allowedRoles={["donor"]}><DeveloperDonation /></RequireRole>} />
        <Route path="/project/:id" element={<RequireRole allowedRoles={["donor", "ngo", "admin"]}><ProjectDetailPage /></RequireRole>} />
          <Route path="/project/:id/documentation" element={<RequireRole allowedRoles={["donor", "ngo", "admin"]}><ProjectDocumentation /></RequireRole>} />
        <Route path="/organization/:id/verification" element={<RequireRole allowedRoles={["donor", "ngo", "admin"]}><OrganizationVerification /></RequireRole>} />
        <Route path="/admin" element={<RequireRole allowedRoles={["admin"]}><AdminHomepage /></RequireRole>} />
        <Route path="/viewProjects" element={<RequireRole allowedRoles={["admin"]}><ViewProjects /></RequireRole>} />
        <Route path="/admin/project/:id" element={<RequireRole allowedRoles={["admin"]}><AdminProjectDetail /></RequireRole>} />
        <Route path="/admin/pending-accounts" element={<RequireRole allowedRoles={["admin"]}><PendingAccounts /></RequireRole>} />
        <Route path="/admin/payments-donations" element={<RequireRole allowedRoles={["admin"]}><AdminPaymentsDonations /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  );
}
