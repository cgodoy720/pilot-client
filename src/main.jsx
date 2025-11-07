import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/Login/Login.jsx'
import Signup from './pages/Signup/Signup.jsx'
import ForgotPassword from './pages/Login/ForgotPassword.jsx'
import ResetPassword from './pages/Login/ResetPassword.jsx'
import VerifyEmail from './pages/Login/VerifyEmail.jsx'
import ResendVerification from './pages/Login/ResendVerification.jsx'
import AttendanceLogin from './pages/AttendanceLogin/index.js'
import AttendanceDashboard from './pages/AttendanceDashboard/index.js'

// Applicant pages
import ApplicantSignup from './pages/ApplicantSignup/index.js'
import ApplicantDashboard from './pages/ApplicantDashboard/index.js'
import ApplicationForm from './pages/ApplicationForm/index.js'
import InfoSessions from './pages/InfoSessions/index.js'
import Workshops from './pages/Workshops/index.js'
import ProgramDetails from './pages/ProgramDetails/index.js'
import PaymentTerms from './pages/PaymentTerms/index.js'
import Pledge from './pages/Pledge/index.js'
import Unsubscribe from './pages/Unsubscribe/Unsubscribe.jsx'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { isAuthenticated } from './utils/attendanceAuth'
import './utils/globalErrorHandler.js' // Install global auth error handler
import 'animate.css'
import './index.css'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Attendance route protection component
const AttendanceRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/attendance-login" replace />;
  }
  
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          
          {/* Attendance system routes - must come before the catch-all route */}
          <Route path="/attendance-login" element={<AttendanceLogin />} />
          <Route path="/attendance-dashboard" element={
            <AttendanceRoute>
              <AttendanceDashboard />
            </AttendanceRoute>
          } />
          
          {/* Applicant routes (public, no builder auth required) */}
          <Route path="/apply/signup" element={<ApplicantSignup />} />
          <Route path="/apply" element={<ApplicantDashboard />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/info-sessions" element={<InfoSessions />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/program-details" element={<ProgramDetails />} />
          <Route path="/payment-terms" element={<PaymentTerms />} />
          <Route path="/pledge" element={<Pledge />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          
          {/* Protected builder routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
