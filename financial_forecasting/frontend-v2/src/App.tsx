import { Routes, Route, Navigate } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { AccountsPage } from "./pages/Accounts";
import { PipelinePage } from "./pages/Pipeline";
import { AwardsPage } from "./pages/Awards";
import { ProjectsPage } from "./pages/Projects";
import { TasksPage } from "./pages/Tasks";
import { ContactsPage } from "./pages/Contacts";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
