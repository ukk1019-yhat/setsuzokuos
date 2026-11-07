/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PublicLeadIntakePage } from './pages/PublicLeadIntakePage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { LeadsPage } from './pages/LeadsPage';
import { ClientsPage } from './pages/ClientsPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Intake Portals */}
            <Route path="/intake" element={<PublicLeadIntakePage />} />
            <Route path="/intake/:orgSlug" element={<PublicLeadIntakePage />} />

            {/* Instant Open Showcase - All Modules Fully Accessible Without Login */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="quotations" element={<QuotationsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="portal" element={<ClientPortalPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Any auth routes redirect straight to the live platform */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
            <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
