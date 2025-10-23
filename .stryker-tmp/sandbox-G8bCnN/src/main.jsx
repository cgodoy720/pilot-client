// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import ForgotPassword from './pages/Login/ForgotPassword.jsx';
import ResetPassword from './pages/Login/ResetPassword.jsx';
import VerifyEmail from './pages/Login/VerifyEmail.jsx';
import ResendVerification from './pages/Login/ResendVerification.jsx';
import AttendanceLogin from './pages/AttendanceLogin/index.js';
import AttendanceDashboard from './pages/AttendanceDashboard/index.js';

// Applicant pages
import ApplicantSignup from './pages/ApplicantSignup/index.js';
import ApplicantDashboard from './pages/ApplicantDashboard/index.js';
import ApplicationForm from './pages/ApplicationForm/index.js';
import InfoSessions from './pages/InfoSessions/index.js';
import Workshops from './pages/Workshops/index.js';
import ProgramDetails from './pages/ProgramDetails/index.js';
import Pledge from './pages/Pledge/index.js';
import Unsubscribe from './pages/Unsubscribe/Unsubscribe.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { isAuthenticated } from './utils/attendanceAuth';
import './utils/globalErrorHandler.js'; // Install global auth error handler
import 'animate.css';
import './index.css';

// Protected route component
const ProtectedRoute = ({
  children
}) => {
  if (stryMutAct_9fa48("4529")) {
    {}
  } else {
    stryCov_9fa48("4529");
    const {
      isAuthenticated,
      isLoading
    } = useAuth();

    // Show loading state while checking authentication
    if (stryMutAct_9fa48("4531") ? false : stryMutAct_9fa48("4530") ? true : (stryCov_9fa48("4530", "4531"), isLoading)) {
      if (stryMutAct_9fa48("4532")) {
        {}
      } else {
        stryCov_9fa48("4532");
        return <div className="loading-screen">Loading...</div>;
      }
    }
    if (stryMutAct_9fa48("4535") ? false : stryMutAct_9fa48("4534") ? true : stryMutAct_9fa48("4533") ? isAuthenticated : (stryCov_9fa48("4533", "4534", "4535"), !isAuthenticated)) {
      if (stryMutAct_9fa48("4536")) {
        {}
      } else {
        stryCov_9fa48("4536");
        return <Navigate to="/login" replace />;
      }
    }
    return children;
  }
};

// Attendance route protection component
const AttendanceRoute = ({
  children
}) => {
  if (stryMutAct_9fa48("4537")) {
    {}
  } else {
    stryCov_9fa48("4537");
    if (stryMutAct_9fa48("4540") ? false : stryMutAct_9fa48("4539") ? true : stryMutAct_9fa48("4538") ? isAuthenticated() : (stryCov_9fa48("4538", "4539", "4540"), !isAuthenticated())) {
      if (stryMutAct_9fa48("4541")) {
        {}
      } else {
        stryCov_9fa48("4541");
        return <Navigate to="/attendance-login" replace />;
      }
    }
    return children;
  }
};
ReactDOM.createRoot(document.getElementById(stryMutAct_9fa48("4542") ? "" : (stryCov_9fa48("4542"), 'root'))).render(<React.StrictMode>
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
          <Route path="/attendance-dashboard" element={<AttendanceRoute>
              <AttendanceDashboard />
            </AttendanceRoute>} />
          
          {/* Applicant routes (public, no builder auth required) */}
          <Route path="/apply/signup" element={<ApplicantSignup />} />
          <Route path="/apply" element={<ApplicantDashboard />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/info-sessions" element={<InfoSessions />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/program-details" element={<ProgramDetails />} />
          <Route path="/pledge" element={<Pledge />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          
          {/* Protected builder routes */}
          <Route path="/*" element={<ProtectedRoute>
                <App />
              </ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>);