import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { enableErrorTesting } from './utils/errorTestingUtils';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import GPT from './pages/GPT/GPT';
import Calendar from './pages/Calendar/Calendar';
import Learning from './pages/Learning/Learning';
import PastSession from './pages/PastSession/PastSession';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminAttendanceDashboard from './pages/AdminAttendanceDashboard/AdminAttendanceDashboard';
import AdmissionsDashboard from './pages/AdmissionsDashboard';
import ApplicationDetail from './pages/AdmissionsDashboard/ApplicationDetail';
import Content from './pages/Content';
import FacilitatorView from './pages/FacilitatorView';
import AdminPrompts from './pages/AdminPrompts';
import Stats from './pages/Stats';
import Performance from './pages/Performance/Performance';
import Account from './pages/Account/Account';
import Payment from './pages/Payment/Payment';
import Assessment from './pages/Assessment/Assessment';
import AssessmentLayout from './pages/Assessment/components/AssessmentLayout/AssessmentLayout';
import SelfAssessmentPage from './pages/Assessment/components/SelfAssessmentPage/SelfAssessmentPage';
import AssessmentGrades from './pages/AssessmentGrades/AssessmentGrades';

import VolunteerFeedback from './pages/VolunteerFeedback/VolunteerFeedback';
import AdminVolunteerFeedback from './pages/AdminVolunteerFeedback';
import PaymentAdmin from './pages/PaymentAdmin';
import ExpiredTokenModal from './components/ExpiredTokenModal/ExpiredTokenModal';

// Volunteer Management pages
import VolunteerCheckIn from './pages/VolunteerCheckIn/VolunteerCheckIn';
import VolunteerAttendance from './pages/VolunteerAttendance/VolunteerAttendance';
import VolunteerRoster from './pages/VolunteerRoster/VolunteerRoster';
import VolunteerList from './pages/VolunteerList/VolunteerList';
import MySchedule from './pages/MySchedule/MySchedule';

// Pathfinder pages
import Pathfinder from './pages/Pathfinder';
import PathfinderPersonalDashboard from './pages/Pathfinder/PathfinderPersonalDashboard';
import PathfinderApplications from './pages/PathfinderApplications';
import PathfinderNetworking from './pages/PathfinderNetworking';
import PathfinderProjects from './pages/PathfinderProjects';
import PathfinderAdminDashboard from './pages/PathfinderDashboard';
import PathfinderAdmin from './pages/PathfinderAdmin';

import WorkshopAdminDashboard from './pages/WorkshopAdminDashboard/WorkshopAdminDashboard';
import ExternalCohortsDashboard from './pages/ExternalCohortsDashboard/ExternalCohortsDashboard';
import CohortAdminDashboard from './pages/CohortAdminDashboard/CohortAdminDashboard';
import OrganizationManagement from './pages/Admin/OrganizationManagement/OrganizationManagement';
import PermissionManagement from './pages/Admin/PermissionManagement';
import ContentPreview from './pages/ContentPreview';

// Form Builder pages
import FormBuilderDashboard from './pages/FormBuilder/FormBuilderDashboard';
import FormEditor from './pages/FormBuilder/FormEditor';
import FormSubmissions from './pages/FormBuilder/FormSubmissions';
import FormAnalytics from './pages/FormBuilder/FormAnalytics';

// Sales Tracker pages
import SalesTracker from './pages/SalesTracker/SalesTracker';

import { useAuth } from './context/AuthContext';
import { resetAuthModalState } from './utils/globalErrorHandler';
import RouteResolver from './components/RouteResolver/RouteResolver';
import { Toaster } from './components/ui/sonner';
import { 
  PermissionRoute, 
  ActiveUserRoute, 
  BuilderRoute,
  WorkshopAdminRoute,
  EnterpriseAdminRoute 
} from './components/RouteGuards';
import { PAGE_PERMISSIONS } from './constants/permissions';

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
    
    // Enable error testing utilities in development
    enableErrorTesting();
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

  // Protected route component (basic auth check)
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Legacy AdminRoute - now uses permission system
  // Kept inline for routes that need both admin AND staff access
  const AdminRoute = ({ children }) => {
    return (
      <PermissionRoute permission={PAGE_PERMISSIONS.STAFF_SECTION}>
        {children}
      </PermissionRoute>
    );
  };

  // Admin-only route (excludes staff)
  const AdminOnlyRoute = ({ children }) => {
    return (
      <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_SECTION}>
        {children}
      </PermissionRoute>
    );
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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/ai-chat" element={
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
        <Route path="/admin" element={
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
        <Route path="/admin-attendance-dashboard" element={
          <Layout>
            <AdminRoute>
              <AdminAttendanceDashboard />
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
        <Route path="/admissions-dashboard/applicant/:applicantId" element={
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
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_PROMPTS}>
              <AdminPrompts />
            </PermissionRoute>
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
        <Route path="/payment-admin" element={
          <Layout>
            <AdminRoute>
              <PaymentAdmin />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/workshop-admin-dashboard" element={
          <Layout>
            <WorkshopAdminRoute>
              <WorkshopAdminDashboard />
            </WorkshopAdminRoute>
          </Layout>
        } />
        
        {/* External Cohorts Management (Admin/Staff only) */}
        <Route path="/external-cohorts" element={
          <Layout>
            <AdminRoute>
              <ExternalCohortsDashboard />
            </AdminRoute>
          </Layout>
        } />
        
        {/* Organization Management (Admin only) */}
        <Route path="/admin/organization-management" element={
          <Layout>
            <AdminOnlyRoute>
              <OrganizationManagement />
            </AdminOnlyRoute>
          </Layout>
        } />
        
        {/* Permission Management (Admin only) */}
        <Route path="/admin/permissions" element={
          <Layout>
            <AdminOnlyRoute>
              <PermissionManagement />
            </AdminOnlyRoute>
          </Layout>
        } />
        
        {/* Content Preview (Staff/Admin/Volunteer - permission-based) */}
        <Route path="/content-preview" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.CONTENT_PREVIEW}>
              <ContentPreview />
            </PermissionRoute>
          </Layout>
        } />
        
        {/* Enterprise Admin Dashboard (for enterprise admins) */}
        <Route path="/cohort-admin-dashboard" element={
          <Layout>
            <EnterpriseAdminRoute>
              <CohortAdminDashboard />
            </EnterpriseAdminRoute>
          </Layout>
        } />
        
        <Route path="/stats" element={<Navigate to="/performance" replace />} />
        <Route path="/performance" element={
          <Layout>
            <BuilderRoute>
              <Performance />
            </BuilderRoute>
          </Layout>
        } />
        <Route path="/account" element={
          <Layout>
            <Account />
          </Layout>
        } />
        <Route path="/payment" element={
          <Layout>
            <Payment />
          </Layout>
        } />
        
        {/* Pathfinder routes - personal view with nested routes */}
        <Route path="/pathfinder/*" element={
          <Layout>
            <BuilderRoute>
              <Pathfinder />
            </BuilderRoute>
          </Layout>
        }>
          <Route path="dashboard" element={<PathfinderPersonalDashboard />} />
          <Route path="applications" element={<PathfinderApplications />} />
          <Route path="networking" element={<PathfinderNetworking />} />
          <Route path="projects" element={<PathfinderProjects />} />
        </Route>
        
        {/* Pathfinder admin dashboard - separate route */}
        <Route path="/pathfinder-admin" element={
          <Layout>
            <AdminRoute>
              <PathfinderAdminDashboard />
            </AdminRoute>
          </Layout>
        } />

        {/* New Pathfinder Admin page */}
        <Route path="/pathfinder/admin" element={
          <Layout>
            <AdminRoute>
              <PathfinderAdmin />
            </AdminRoute>
          </Layout>
        } />
        
        <Route path="/volunteer-feedback" element={
          <Layout>
            <VolunteerFeedback />
          </Layout>
        } />

        {/* Volunteer Management routes */}
        <Route path="/volunteer-checkin" element={
          <Layout>
            <VolunteerCheckIn />
          </Layout>
        } />
        <Route path="/volunteer-attendance" element={
          <Layout>
            <AdminRoute>
              <VolunteerAttendance />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/volunteer-roster" element={
          <Layout>
            <AdminRoute>
              <VolunteerRoster />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/volunteer-list" element={
          <Layout>
            <AdminRoute>
              <VolunteerList />
            </AdminRoute>
          </Layout>
        } />

        {/* Volunteer Self-Service Schedule (for volunteer role) */}
        <Route path="/my-schedule" element={
          <Layout>
            <ProtectedRoute>
              <MySchedule />
            </ProtectedRoute>
          </Layout>
        } />

        {/* Form Builder routes (Admin/Staff only) */}
        <Route path="/forms" element={
          <Layout>
            <AdminRoute>
              <FormBuilderDashboard />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/forms/new" element={
          <Layout>
            <AdminRoute>
              <FormEditor />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/edit" element={
          <Layout>
            <AdminRoute>
              <FormEditor />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/submissions" element={
          <Layout>
            <AdminRoute>
              <FormSubmissions />
            </AdminRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/analytics" element={
          <Layout>
            <AdminRoute>
              <FormAnalytics />
            </AdminRoute>
          </Layout>
        } />

        {/* Sputnik routes (Admin/Staff only) */}
        <Route path="/sputnik" element={
          <Layout>
            <AdminRoute>
              <SalesTracker />
            </AdminRoute>
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
      
      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}

export default App;
