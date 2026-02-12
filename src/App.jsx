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
import PathfinderEventHub from './pages/PathfinderEventHub/PathfinderEventHub';
import EventDetailPage from './pages/PathfinderEventHub/EventDetailPage';
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
  WorkshopAdminRoute,
  EnterpriseAdminRoute
} from './components/RouteGuards';
import { PAGE_PERMISSIONS } from './constants/permissions';

import './App.css';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  
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
            <PermissionRoute permission={PAGE_PERMISSIONS.AI_CHAT}>
              <GPT />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/calendar" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.CALENDAR}>
              <Calendar />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/learning" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.LEARNING}>
              <Learning />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/past-session" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PAST_SESSION}>
              <PastSession />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/assessment" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ASSESSMENT}>
              <Assessment />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/assessment/:period/:assessmentType/:assessmentId" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ASSESSMENT}>
              <RouteResolver
                selfComponent={<SelfAssessmentPage />}
                defaultComponent={<AssessmentLayout />}
              />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/assessment/:period/:assessmentType/:assessmentId/readonly" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ASSESSMENT}>
              <RouteResolver
                selfComponent={<SelfAssessmentPage />}
                defaultComponent={<AssessmentLayout readonly={true} />}
              />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admin-dashboard" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_DASHBOARD}>
              <AdminDashboard />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_DASHBOARD}>
              <AdminDashboard />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admin/assessment-grades" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ASSESSMENT_GRADES}>
              <AssessmentGrades />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admin-attendance-dashboard" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_ATTENDANCE}>
              <AdminAttendanceDashboard />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admissions-dashboard" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMISSIONS}>
              <AdmissionsDashboard />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admissions-dashboard/applicant/:applicantId" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMISSIONS}>
              <ApplicationDetail />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/content/*" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.CONTENT}>
              <Content />
            </PermissionRoute>
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
            <PermissionRoute permission={PAGE_PERMISSIONS.STAFF_SECTION}>
              <FacilitatorView />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/admin-volunteer-feedback" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_VOLUNTEER_FEEDBACK}>
              <AdminVolunteerFeedback />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/payment-admin" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PAYMENT_ADMIN}>
              <PaymentAdmin />
            </PermissionRoute>
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
            <PermissionRoute permission={PAGE_PERMISSIONS.EXTERNAL_COHORTS}>
              <ExternalCohortsDashboard />
            </PermissionRoute>
          </Layout>
        } />
        
        {/* Organization Management (Admin only) */}
        <Route path="/admin/organization-management" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ORGANIZATION_MANAGEMENT}>
              <OrganizationManagement />
            </PermissionRoute>
          </Layout>
        } />
        
        {/* Permission Management (Admin only) */}
        <Route path="/admin/permissions" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ADMIN_SECTION}>
              <PermissionManagement />
            </PermissionRoute>
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
            <PermissionRoute permission={PAGE_PERMISSIONS.PERFORMANCE}>
              <Performance />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/account" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.ACCOUNT}>
              <Account />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/payment" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PAYMENT}>
              <Payment />
            </PermissionRoute>
          </Layout>
        } />
        
        {/* Pathfinder routes - personal view with nested routes */}
        <Route path="/pathfinder/*" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PATHFINDER}>
              <Pathfinder />
            </PermissionRoute>
          </Layout>
        }>
          <Route path="dashboard" element={<PathfinderPersonalDashboard />} />
          <Route path="applications" element={<PathfinderApplications />} />
          <Route path="networking" element={<PathfinderNetworking />} />
          <Route path="projects" element={<PathfinderProjects />} />
          <Route path="events" element={<PathfinderEventHub />} />
          <Route path="events/:eventId" element={<EventDetailPage />} />
        </Route>
        
        {/* Pathfinder admin dashboard - separate route */}
        <Route path="/pathfinder-admin" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PATHFINDER_ADMIN}>
              <PathfinderAdminDashboard />
            </PermissionRoute>
          </Layout>
        } />

        {/* New Pathfinder Admin page */}
        <Route path="/pathfinder/admin" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.PATHFINDER_ADMIN}>
              <PathfinderAdmin />
            </PermissionRoute>
          </Layout>
        } />
        
        <Route path="/volunteer-feedback" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.VOLUNTEER_FEEDBACK}>
              <VolunteerFeedback />
            </PermissionRoute>
          </Layout>
        } />

        {/* Volunteer Management routes */}
        <Route path="/volunteer-checkin" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.VOLUNTEER_SECTION}>
              <VolunteerCheckIn />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/volunteer-attendance" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.VOLUNTEER_MANAGEMENT}>
              <VolunteerAttendance />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/volunteer-roster" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.VOLUNTEER_MANAGEMENT}>
              <VolunteerRoster />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/volunteer-list" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.VOLUNTEER_MANAGEMENT}>
              <VolunteerList />
            </PermissionRoute>
          </Layout>
        } />

        {/* Volunteer Self-Service Schedule (for volunteer role) */}
        <Route path="/my-schedule" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.MY_SCHEDULE}>
              <MySchedule />
            </PermissionRoute>
          </Layout>
        } />

        {/* Form Builder routes (Admin/Staff only) */}
        <Route path="/forms" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.FORM_BUILDER}>
              <FormBuilderDashboard />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/forms/new" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.FORM_BUILDER}>
              <FormEditor />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/edit" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.FORM_BUILDER}>
              <FormEditor />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/submissions" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.FORM_BUILDER}>
              <FormSubmissions />
            </PermissionRoute>
          </Layout>
        } />
        <Route path="/forms/:formId/analytics" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.FORM_BUILDER}>
              <FormAnalytics />
            </PermissionRoute>
          </Layout>
        } />

        {/* Sputnik routes (Admin/Staff only) */}
        <Route path="/sputnik" element={
          <Layout>
            <PermissionRoute permission={PAGE_PERMISSIONS.SPUTNIK}>
              <SalesTracker />
            </PermissionRoute>
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
