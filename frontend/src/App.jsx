/**
 * App — routing.
 *
 * Two structural changes from the previous version:
 *
 *  1. `RequireRole`, which read `localStorage.getItem("userRole")` and admitted
 *     anyone whose stored string matched, is replaced by `ProtectedRoute`,
 *     which uses the role the SERVER reports through AuthContext. Editing
 *     localStorage no longer opens any door. [CSSECDV 2.1.1, 2.2.1]
 *
 *  2. There is now a catch-all route. An unknown URL previously rendered a
 *     blank white page; it now renders a custom 404. [2.4.2]
 *
 * The whole tree sits inside an ErrorBoundary so a render failure produces a
 * branded page rather than a component stack. [2.4.1]
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { NotFound, Forbidden, Unauthorized, ServerError } from "./pages/errors/ErrorPages.jsx";
import { setErrorStatusHandler } from "./config/api.js";

import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import NgoRegistration from "./pages/NgoRegistration.jsx";
import DonorRegistration from "./pages/DonorRegistration.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import OrganizationPartnershipOffers from "./pages/OrganizationPartnershipOffers.jsx";
import ActiveProjects from "./pages/ActiveProjects.jsx";
import UnapprovedProjects from "./pages/UnapprovedProjects.jsx";
import PostNewProject from "./components/PostNewProject.jsx";
import EditProject from "./pages/EditProject.jsx";
import NgoPaymentHistory from "./pages/NgoPaymentHistory.jsx";
import ContributionDetailPage from "./pages/ContributionDetailPage.jsx";

import DonorHomepage from "./pages/DonorHomepage.jsx";
import BookmarkedProjects from "./pages/BookmarkedProjects.jsx";
import CorporatePartnerships from "./pages/CorporatePartnerships.jsx";
import ASEANSelection from "./pages/ASEANSelection.jsx";
import CountrySDGStats from "./pages/CountrySDGStats.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import AddContribution from "./pages/AddContribution.jsx";
import DeveloperDonation from "./pages/DeveloperDonation.jsx";

import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ProjectDocumentation from "./pages/ProjectDocumentation.jsx";
import OrganizationVerification from "./pages/OrganizationVerification.jsx";

import AdminHomepage from "./pages/AdminHomepage.jsx";
import ViewProjects from "./pages/viewProjects.jsx";
import AdminProjectDetail from "./pages/Adminprojectdetail.jsx";
import PendingAccounts from "./pages/PendingAccounts.jsx";
import AdminPaymentsDonations from "./pages/AdminPaymentsDonations.jsx";
import AdminUserManagement from "./pages/AdminUserManagement.jsx";
import SecurityLogs from "./pages/SecurityLogs.jsx";

/** Shorthand so each route reads as a single line. */
const guard = (roles, element) => <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>;

const NGO = ["ngo"];
const DONOR = ["donor"];
const ADMIN = ["admin"];
const ANY = ["donor", "ngo", "admin"];

/** Translate server status codes into the project's custom error pages. */
function ApiErrorNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    setErrorStatusHandler((status) => {
      if (status === 401) navigate("/session-expired", { replace: true });
      else if (status === 403) navigate("/forbidden", { replace: true });
      else if (status >= 500) navigate("/error", { replace: true });
    });

    return () => setErrorStatusHandler(null);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ApiErrorNavigation />
          <Routes>
            {/* ── Public ─────────────────────────────────────────────────────
                This list mirrors the `public: true` entries in the backend's
                policy table. Anything not here requires a session. [2.1.1] */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/ngo/register" element={<NgoRegistration />} />
            <Route path="/donor/register" element={<DonorRegistration />} />

            {/* Error pages, reachable directly so redirects can target them. */}
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/session-expired" element={<Unauthorized />} />
            <Route path="/error" element={<ServerError />} />

            {/* Legacy links from older builds. */}
            <Route path="/auth/:role" element={<Navigate to="/login" replace />} />

            {/* ── Any signed-in user ─────────────────────────────────────── */}
            <Route path="/change-password" element={guard(ANY, <ChangePassword />)} />
            <Route path="/project/:id" element={guard(ANY, <ProjectDetailPage />)} />
            <Route
              path="/project/:id/documentation"
              element={guard(ANY, <ProjectDocumentation />)}
            />
            <Route
              path="/organization/:id/verification"
              element={guard(ANY, <OrganizationVerification />)}
            />

            {/* ── Role A — organizations ─────────────────────────────────── */}
            <Route path="/dashboard" element={guard(NGO, <Dashboard />)} />
            <Route
              path="/ngo/partnership-offers"
              element={guard(NGO, <OrganizationPartnershipOffers />)}
            />
            <Route path="/ngo/donations" element={guard(NGO, <NgoPaymentHistory />)} />
            <Route path="/project-ledger" element={guard(NGO, <ActiveProjects />)} />
            <Route path="/unposted-projects" element={guard(NGO, <UnapprovedProjects />)} />
            <Route path="/post-project" element={guard(NGO, <PostNewProject />)} />
            <Route path="/edit-project/:id" element={guard(NGO, <EditProject />)} />
            <Route
              path="/contribution-detail/:id"
              element={guard(NGO, <ContributionDetailPage />)}
            />

            {/* ── Role B — donors ────────────────────────────────────────── */}
            <Route path="/donor" element={guard(DONOR, <DonorHomepage />)} />
            <Route path="/donor/asean" element={guard(DONOR, <ASEANSelection />)} />
            <Route path="/donor/country/:country" element={guard(DONOR, <CountrySDGStats />)} />
            <Route path="/donor/bookmarks" element={guard(DONOR, <BookmarkedProjects />)} />
            <Route path="/donor/partnerships" element={guard(DONOR, <CorporatePartnerships />)} />
            <Route path="/payment-history" element={guard(DONOR, <PaymentHistory />)} />

            {/* Shared by the two contributing roles. */}
            <Route
              path="/add-contribution/:id"
              element={guard(["donor", "ngo"], <AddContribution />)}
            />
            <Route
              path="/donate-to-developers"
              element={guard(["donor", "ngo"], <DeveloperDonation />)}
            />

            {/* ── Administrator ──────────────────────────────────────────── */}
            <Route path="/admin" element={guard(ADMIN, <AdminHomepage />)} />
            <Route path="/viewProjects" element={guard(ADMIN, <ViewProjects />)} />
            <Route path="/admin/project/:id" element={guard(ADMIN, <AdminProjectDetail />)} />
            <Route path="/admin/pending-accounts" element={guard(ADMIN, <PendingAccounts />)} />
            <Route
              path="/admin/payments-donations"
              element={guard(ADMIN, <AdminPaymentsDonations />)}
            />
            {/* The two administrator-only surfaces added for this project. */}
            <Route path="/admin/user-management" element={guard(ADMIN, <AdminUserManagement />)} />
            <Route path="/admin/security-logs" element={guard(ADMIN, <SecurityLogs />)} />

            {/* ── Catch-all [2.4.2] ──────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
