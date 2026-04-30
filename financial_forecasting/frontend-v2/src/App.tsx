import { Routes, Route, Navigate } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { DashboardPage } from "./pages/Dashboard";
import { AccountsPage } from "./pages/Accounts";
import { PipelinePage } from "./pages/Pipeline";
import { AwardsPage } from "./pages/Awards";
import { ProjectsPage } from "./pages/Projects";
import { TasksPage } from "./pages/Tasks";
import { ContactsPage } from "./pages/Contacts";
import { LoginPage } from "./pages/Login";
import { SettingsPage } from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated routes */}
      <Route
        element={
          <AuthGate>
            <AppShell />
          </AuthGate>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backend redirects to /priorities after Google OAuth — alias it */}
        <Route path="/priorities" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
