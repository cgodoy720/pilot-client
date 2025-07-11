import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import GPT from './pages/GPT/GPT';
import Calendar from './pages/Calendar/Calendar';
import Learning from './pages/Learning/Learning';
import PastSession from './pages/PastSession/PastSession';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import SessionDataTester from './pages/SessionDataTester';
import Stats from './pages/Stats';
import Account from './pages/Account/Account';
import ExpiredTokenModal from './components/ExpiredTokenModal/ExpiredTokenModal';

import { useAuth } from './context/AuthContext';
import { resetAuthModalState } from './utils/globalErrorHandler';
import './App.css';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'token_expired',
    message: '',
    action: null
  });
  
  // Track if we've already shown a modal this session
  const [hasShownModal, setHasShownModal] = useState(false);
  
  // Reset auth state on app load
  useEffect(() => {
    resetAuthModalState();
  }, []);
  
  // Listen for auth error events from global error handler
  useEffect(() => {
    const handleAuthError = (event) => {
      const { type, message, action } = event.detail;
      
      // Only show modal once per session
      if (hasShownModal) {
        console.log('🚫 Modal already shown this session, ignoring auth error');
        return;
      }
      
      console.log('📱 Opening auth error modal:', { type, message });
      setHasShownModal(true);
      setModalConfig({
        isOpen: true,
        type,
        message,
        action
      });
    };
    
    window.addEventListener('authError', handleAuthError);
    
    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, [hasShownModal]);
  
  // Handle modal redirect/close
  const handleModalRedirect = () => {
    console.log('🔄 Modal button clicked - forcing immediate redirect');
    
    // Close modal immediately
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    
    // Force immediate redirect regardless of type
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

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
    <>
      <Routes>
        {/* Builder routes (with layout) */}
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/gpt" element={
          <Layout>
            <GPT />
          </Layout>
        } />
        <Route path="/calendar" element={
          <Layout>
            <Calendar />
          </Layout>
        } />
        <Route path="/learning" element={
          <Layout>
            <ActiveUserRoute>
              <Learning />
            </ActiveUserRoute>
          </Layout>
        } />
        <Route path="/past-session" element={
          <Layout>
            <PastSession />
          </Layout>
        } />
        <Route path="/admin-dashboard" element={
          <Layout>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/session-data-tester" element={
          <Layout>
            <AdminRoute>
              <SessionDataTester />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/stats" element={
          <Layout>
            <Stats />
          </Layout>
        } />
        <Route path="/account" element={
          <Layout>
            <Account />
          </Layout>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Global Auth Error Modal */}
      <ExpiredTokenModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        message={modalConfig.message}
        onRedirect={handleModalRedirect}
      />
    </>
  );
}

export default App;
