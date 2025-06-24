import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import GPT from './pages/GPT/GPT';
import Calendar from './pages/Calendar/Calendar';
import Learning from './pages/Learning/Learning';
import PastSession from './pages/PastSession/PastSession';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Stats from './pages/Stats';
import Account from './pages/Account/Account';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };
  
  // Active user route protection component
  const ActiveUserRoute = ({ children }) => {
    const isActive = user?.active !== false;
    
    if (!isActive) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  // Admin route protection component
  const AdminRoute = ({ children }) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';
    
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  // If auth is still loading, show a minimal loading state
  if (isLoading) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gpt" element={<GPT />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/learning" element={
          <ActiveUserRoute>
            <Learning />
          </ActiveUserRoute>
        } />
        <Route path="/past-session" element={<PastSession />} />
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/stats" element={<Stats />} />
        <Route path="/account" element={<Account />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
