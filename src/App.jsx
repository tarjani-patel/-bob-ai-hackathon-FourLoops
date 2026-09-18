import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrialProvider, useTrial } from "./context/TrialContext.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Header } from "./components/Header.jsx";
import { NotificationModal } from "./components/NotificationModal.jsx";

// Pages
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { AccessDeniedPage } from "./pages/AccessDeniedPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ProtocolPage } from "./pages/ProtocolPage.jsx";
import { PatientsPage } from "./pages/PatientsPage.jsx";
import { DeviationsPage } from "./pages/DeviationsPage.jsx";
import { SiteRiskPage } from "./pages/SiteRiskPage.jsx";
import { CapaPage } from "./pages/CapaPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

function AppLayout() {
  const { isNotificationModalOpen, setIsNotificationModalOpen } = useTrial();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <div className="flex-1 flex flex-row min-h-0">
        {/* Persistent Desktop Sidebar with role-filtered links */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header with live user menu & compliance action */}
          <Header />

          {/* Page Routing Outlet */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              {/* Dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute allowedPath="/dashboard">
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedPath="/dashboard">
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protocol */}
              <Route 
                path="/trial-protocol" 
                element={
                  <ProtectedRoute allowedPath="/trial-protocol">
                    <ProtocolPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/protocol" element={<Navigate to="/trial-protocol" replace />} />

              {/* Operational Routes with Granular Path Guarding */}
              <Route 
                path="/patients" 
                element={
                  <ProtectedRoute allowedPath="/patients">
                    <PatientsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deviations" 
                element={
                  <ProtectedRoute allowedPath="/deviations">
                    <DeviationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sites" 
                element={
                  <ProtectedRoute allowedPath="/sites">
                    <SiteRiskPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/capa" 
                element={
                  <ProtectedRoute allowedPath="/capa">
                    <CapaPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute allowedPath="/reports">
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedPath="/settings">
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Access Denied Route */}
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Centered Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrialProvider>
          <Routes>
            {/* Standalone Authentication Screens & Public Landing */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Workspace Application Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
