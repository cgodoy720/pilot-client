// @ts-nocheck
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import GPT from './pages/GPT/GPT';
import Calendar from './pages/Calendar/Calendar';
import Learning from './pages/Learning/Learning';
import PastSession from './pages/PastSession/PastSession';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdmissionsDashboard from './pages/AdmissionsDashboard';
import ApplicationDetail from './pages/AdmissionsDashboard/ApplicationDetail';
import Content from './pages/Content';
import FacilitatorView from './pages/FacilitatorView';
import AdminPrompts from './pages/AdminPrompts';
import Stats from './pages/Stats';
import Account from './pages/Account/Account';
import Assessment from './pages/Assessment/Assessment';
import AssessmentLayout from './pages/Assessment/components/AssessmentLayout/AssessmentLayout';
import SelfAssessmentPage from './pages/Assessment/components/SelfAssessmentPage/SelfAssessmentPage';
import AssessmentGrades from './pages/AssessmentGrades/AssessmentGrades';

import VolunteerFeedback from './pages/VolunteerFeedback/VolunteerFeedback';
import AdminVolunteerFeedback from './pages/AdminVolunteerFeedback';
import ExpiredTokenModal from './components/ExpiredTokenModal/ExpiredTokenModal';

import { useAuth } from './context/AuthContext';
import { resetAuthModalState } from './utils/globalErrorHandler';
import RouteResolver from './components/RouteResolver/RouteResolver';

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
        <Route path="/assessment" element={
          <Layout>
            <ActiveUserRoute>
              <Assessment />
            </ActiveUserRoute>
          </Layout>
        } />
        <Route path="/assessment/:period/:assessmentType/:assessmentId" element={
          <Layout>
            <ActiveUserRoute>
              {/* Use SelfAssessmentPage for self assessments, otherwise use AssessmentLayout */}
              <RouteResolver
                selfComponent={<SelfAssessmentPage />}
                defaultComponent={<AssessmentLayout />}
              />
            </ActiveUserRoute>
          </Layout>
        } />
        <Route path="/assessment/:period/:assessmentType/:assessmentId/readonly" element={
          <Layout>
            <ActiveUserRoute>
              {/* Use SelfAssessmentPage for self assessments in readonly mode, otherwise use AssessmentLayout */}
              <RouteResolver
                selfComponent={<SelfAssessmentPage />}
                defaultComponent={<AssessmentLayout readonly={true} />}
              />
            </ActiveUserRoute>
          </Layout>
        } />
        <Route path="/admin-dashboard" element={
          <Layout>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/admin/assessment-grades" element={
          <Layout>
            <AdminRoute>
              <AssessmentGrades />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/admissions-dashboard" element={
          <Layout>
            <AdminRoute>
              <AdmissionsDashboard />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/admissions-dashboard/application/:applicationId" element={
          <Layout>
            <AdminRoute>
              <ApplicationDetail />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/content/*" element={
          <Layout>
            <AdminRoute>
              <Content />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/admin-prompts" element={
          <Layout>
            <AdminRoute>
              <AdminPrompts />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/facilitator-view" element={
          <Layout>
            <AdminRoute>
              <FacilitatorView />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/admin-volunteer-feedback" element={
          <Layout>
            <AdminRoute>
              <AdminVolunteerFeedback />
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
        <Route path="/volunteer-feedback" element={
          <VolunteerFeedback />
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
