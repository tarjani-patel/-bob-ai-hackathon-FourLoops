import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TrialProvider, useTrial } from "./context/TrialContext.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Header } from "./components/Header.jsx";
import { NotificationModal } from "./components/NotificationModal.jsx";

// Pages
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
        {/* Persistent Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <Header />

          {/* Page Routing Outlet */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              {/* Default routes: / and /dashboard both lead to Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Protocol routes */}
              <Route path="/trial-protocol" element={<ProtocolPage />} />
              <Route path="/protocol" element={<Navigate to="/trial-protocol" replace />} />

              {/* Core operational routes */}
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/deviations" element={<DeviationsPage />} />
              <Route path="/sites" element={<SiteRiskPage />} />
              <Route path="/capa" element={<CapaPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

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
      <TrialProvider>
        <AppLayout />
      </TrialProvider>
    </BrowserRouter>
  );
}
