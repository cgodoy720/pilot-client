import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Main Application Pages
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Learning from './pages/Learning/Learning';
import Calendar from './pages/Calendar/Calendar';
import Stats from './pages/Stats/Stats';
import Account from './pages/Account/Account';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import GPT from './pages/GPT/GPT';
import PastSession from './pages/PastSession/PastSession';

// Login-related pages
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';
import VerifyEmail from './pages/Login/VerifyEmail';
import ResendVerification from './pages/Login/ResendVerification';

// Admissions Components
import InfoSessions from './components/InfoSessions';
import Workshops from './components/Workshops';
import ApplicationForm from './components/ApplicationForm/ApplicationForm';
import AdmissionsDashboard from './pages/AdmissionsDashboard/AdmissionsDashboard';

// Layout Component
import Layout from './components/Layout/Layout';

// Protected Route Components
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Add debug logging for admin route access
  if (adminOnly) {
    console.log('Admin route access attempt:', {
      isLoading,
      isAuthenticated,
      user,
      userRole: user?.role,
      userType: user?.userType,
      localStorageUser: JSON.parse(localStorage.getItem('user') || 'null')
    });
  }
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && (!user || user.role !== 'admin')) {
    console.log('Redirecting to dashboard - not admin:', { user: user, role: user?.role });
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Admissions Protected Route (uses different auth system)
const AdmissionsProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Wrapper component for InfoSessions route to manage required state
const InfoSessionsWrapper = () => {
  const [infoSessionStatus, setInfoSessionStatus] = React.useState(
    localStorage.getItem('infoSessionStatus') || 'not signed-up'
  );
  const [sessionDetails, setSessionDetails] = React.useState(() => {
    const saved = localStorage.getItem('infoSessionDetails');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <InfoSessions 
      setInfoSessionStatus={setInfoSessionStatus} 
      setSessionDetails={setSessionDetails} 
    />
  );
};

// Wrapper component for Workshops route to manage required state
const WorkshopsWrapper = () => {
  const [workshopStatus, setWorkshopStatus] = React.useState(
    localStorage.getItem('workshopStatus') || 'locked'
  );

  return (
    <Workshops 
      setWorkshopStatus={setWorkshopStatus} 
    />
  );
};

// Debug component to show auth state
const AuthDebug = () => {
  const { isAuthenticated, user, token, isLoading } = useAuth();
  const localStorageUser = JSON.parse(localStorage.getItem('user') || 'null');
  const localStorageToken = localStorage.getItem('token');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h2>Authentication Debug</h2>
      
      <h3>AuthContext State:</h3>
      <pre>{JSON.stringify({
        isLoading,
        isAuthenticated,
        user,
        hasToken: !!token
      }, null, 2)}</pre>
      
      <h3>LocalStorage Data:</h3>
      <pre>{JSON.stringify({
        user: localStorageUser,
        hasToken: !!localStorageToken
      }, null, 2)}</pre>
      
      <h3>Admin Check:</h3>
      <p>Is Admin (AuthContext): {user?.role === 'admin' ? '✅ YES' : '❌ NO'}</p>
      <p>Is Admin (localStorage): {localStorageUser?.role === 'admin' ? '✅ YES' : '❌ NO'}</p>
      <p>User Type (AuthContext): {user?.userType || 'NONE'}</p>
      <p>User Type (localStorage): {localStorageUser?.userType || 'NONE'}</p>
      
      <button onClick={() => window.location.href = '/admin'} style={{
        padding: '10px 20px',
        marginTop: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Try Admin Dashboard
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Default route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            
            {/* Admissions Routes */}
            <Route path="/apply/dashboard" element={
              <AdmissionsProtectedRoute>
                <AdmissionsDashboard />
              </AdmissionsProtectedRoute>
            } />
            <Route path="/apply/info-sessions" element={
              <AdmissionsProtectedRoute>
                <InfoSessionsWrapper />
              </AdmissionsProtectedRoute>
            } />
            <Route path="/apply/workshops" element={
              <AdmissionsProtectedRoute>
                <WorkshopsWrapper />
              </AdmissionsProtectedRoute>
            } />
            <Route path="/apply/application" element={
              <AdmissionsProtectedRoute>
                <ApplicationForm />
              </AdmissionsProtectedRoute>
            } />
            
            {/* Main Application Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/learning" element={
              <ProtectedRoute>
                <Layout>
                  <Learning />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/stats" element={
              <ProtectedRoute>
                <Layout>
                  <Stats />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/account" element={
              <ProtectedRoute>
                <Layout>
                  <Account />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/gpt" element={
              <ProtectedRoute>
                <Layout>
                  <GPT />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/past-session/:conversationId" element={
              <ProtectedRoute>
                <Layout>
                  <PastSession />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Debug route */}
            <Route path="/debug-auth" element={<AuthDebug />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;