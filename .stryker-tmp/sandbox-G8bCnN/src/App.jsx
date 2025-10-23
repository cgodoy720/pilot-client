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
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const {
      isAuthenticated,
      isLoading,
      user
    } = useAuth();

    // Modal state
    const [modalConfig, setModalConfig] = useState(stryMutAct_9fa48("1") ? {} : (stryCov_9fa48("1"), {
      isOpen: stryMutAct_9fa48("2") ? true : (stryCov_9fa48("2"), false),
      type: stryMutAct_9fa48("3") ? "" : (stryCov_9fa48("3"), 'token_expired'),
      message: stryMutAct_9fa48("4") ? "Stryker was here!" : (stryCov_9fa48("4"), ''),
      action: null
    }));

    // Track if we've already shown a modal this session
    const [hasShownModal, setHasShownModal] = useState(stryMutAct_9fa48("5") ? true : (stryCov_9fa48("5"), false));

    // Reset auth state on app load
    useEffect(() => {
      if (stryMutAct_9fa48("6")) {
        {}
      } else {
        stryCov_9fa48("6");
        resetAuthModalState();
      }
    }, stryMutAct_9fa48("7") ? ["Stryker was here"] : (stryCov_9fa48("7"), []));

    // Listen for auth error events from global error handler
    useEffect(() => {
      if (stryMutAct_9fa48("8")) {
        {}
      } else {
        stryCov_9fa48("8");
        const handleAuthError = event => {
          if (stryMutAct_9fa48("9")) {
            {}
          } else {
            stryCov_9fa48("9");
            const {
              type,
              message,
              action
            } = event.detail;

            // Only show modal once per session
            if (stryMutAct_9fa48("11") ? false : stryMutAct_9fa48("10") ? true : (stryCov_9fa48("10", "11"), hasShownModal)) {
              if (stryMutAct_9fa48("12")) {
                {}
              } else {
                stryCov_9fa48("12");
                console.log(stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), '🚫 Modal already shown this session, ignoring auth error'));
                return;
              }
            }
            console.log(stryMutAct_9fa48("14") ? "" : (stryCov_9fa48("14"), '📱 Opening auth error modal:'), stryMutAct_9fa48("15") ? {} : (stryCov_9fa48("15"), {
              type,
              message
            }));
            setHasShownModal(stryMutAct_9fa48("16") ? false : (stryCov_9fa48("16"), true));
            setModalConfig(stryMutAct_9fa48("17") ? {} : (stryCov_9fa48("17"), {
              isOpen: stryMutAct_9fa48("18") ? false : (stryCov_9fa48("18"), true),
              type,
              message,
              action
            }));
          }
        };
        window.addEventListener(stryMutAct_9fa48("19") ? "" : (stryCov_9fa48("19"), 'authError'), handleAuthError);
        return () => {
          if (stryMutAct_9fa48("20")) {
            {}
          } else {
            stryCov_9fa48("20");
            window.removeEventListener(stryMutAct_9fa48("21") ? "" : (stryCov_9fa48("21"), 'authError'), handleAuthError);
          }
        };
      }
    }, stryMutAct_9fa48("22") ? [] : (stryCov_9fa48("22"), [hasShownModal]));

    // Handle modal redirect/close
    const handleModalRedirect = () => {
      if (stryMutAct_9fa48("23")) {
        {}
      } else {
        stryCov_9fa48("23");
        console.log(stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), '🔄 Modal button clicked - forcing immediate redirect'));

        // Close modal immediately
        setModalConfig(stryMutAct_9fa48("25") ? () => undefined : (stryCov_9fa48("25"), prev => stryMutAct_9fa48("26") ? {} : (stryCov_9fa48("26"), {
          ...prev,
          isOpen: stryMutAct_9fa48("27") ? true : (stryCov_9fa48("27"), false)
        })));

        // Force immediate redirect regardless of type
        localStorage.removeItem(stryMutAct_9fa48("28") ? "" : (stryCov_9fa48("28"), 'token'));
        localStorage.removeItem(stryMutAct_9fa48("29") ? "" : (stryCov_9fa48("29"), 'user'));
        window.location.href = stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), '/login');
      }
    };

    // Protected route component
    const ProtectedRoute = ({
      children
    }) => {
      if (stryMutAct_9fa48("31")) {
        {}
      } else {
        stryCov_9fa48("31");
        if (stryMutAct_9fa48("33") ? false : stryMutAct_9fa48("32") ? true : (stryCov_9fa48("32", "33"), isLoading)) {
          if (stryMutAct_9fa48("34")) {
            {}
          } else {
            stryCov_9fa48("34");
            return <div>Loading...</div>;
          }
        }
        if (stryMutAct_9fa48("37") ? false : stryMutAct_9fa48("36") ? true : stryMutAct_9fa48("35") ? isAuthenticated : (stryCov_9fa48("35", "36", "37"), !isAuthenticated)) {
          if (stryMutAct_9fa48("38")) {
            {}
          } else {
            stryCov_9fa48("38");
            return <Navigate to="/login" replace />;
          }
        }
        return children;
      }
    };

    // Active user route protection component
    const ActiveUserRoute = ({
      children
    }) => {
      if (stryMutAct_9fa48("39")) {
        {}
      } else {
        stryCov_9fa48("39");
        const isActive = stryMutAct_9fa48("42") ? user?.active === false : stryMutAct_9fa48("41") ? false : stryMutAct_9fa48("40") ? true : (stryCov_9fa48("40", "41", "42"), (stryMutAct_9fa48("43") ? user.active : (stryCov_9fa48("43"), user?.active)) !== (stryMutAct_9fa48("44") ? true : (stryCov_9fa48("44"), false)));
        if (stryMutAct_9fa48("47") ? false : stryMutAct_9fa48("46") ? true : stryMutAct_9fa48("45") ? isActive : (stryCov_9fa48("45", "46", "47"), !isActive)) {
          if (stryMutAct_9fa48("48")) {
            {}
          } else {
            stryCov_9fa48("48");
            return <Navigate to="/dashboard" replace />;
          }
        }
        return children;
      }
    };

    // Admin route protection component
    const AdminRoute = ({
      children
    }) => {
      if (stryMutAct_9fa48("49")) {
        {}
      } else {
        stryCov_9fa48("49");
        const isAdmin = stryMutAct_9fa48("52") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("51") ? false : stryMutAct_9fa48("50") ? true : (stryCov_9fa48("50", "51", "52"), (stryMutAct_9fa48("54") ? user?.role !== 'admin' : stryMutAct_9fa48("53") ? false : (stryCov_9fa48("53", "54"), (stryMutAct_9fa48("55") ? user.role : (stryCov_9fa48("55"), user?.role)) === (stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), 'admin')))) || (stryMutAct_9fa48("58") ? user?.role !== 'staff' : stryMutAct_9fa48("57") ? false : (stryCov_9fa48("57", "58"), (stryMutAct_9fa48("59") ? user.role : (stryCov_9fa48("59"), user?.role)) === (stryMutAct_9fa48("60") ? "" : (stryCov_9fa48("60"), 'staff')))));
        if (stryMutAct_9fa48("63") ? false : stryMutAct_9fa48("62") ? true : stryMutAct_9fa48("61") ? isAdmin : (stryCov_9fa48("61", "62", "63"), !isAdmin)) {
          if (stryMutAct_9fa48("64")) {
            {}
          } else {
            stryCov_9fa48("64");
            return <Navigate to="/dashboard" replace />;
          }
        }
        return children;
      }
    };

    // If auth is still loading, show a minimal loading state
    if (stryMutAct_9fa48("66") ? false : stryMutAct_9fa48("65") ? true : (stryCov_9fa48("65", "66"), isLoading)) {
      if (stryMutAct_9fa48("67")) {
        {}
      } else {
        stryCov_9fa48("67");
        return <div className="app-loading">Loading application...</div>;
      }
    }
    return <>
      <Routes>
        {/* Builder routes (with layout) */}
        <Route path="/dashboard" element={<Layout>
            <Dashboard />
          </Layout>} />
        <Route path="/gpt" element={<Layout>
            <GPT />
          </Layout>} />
        <Route path="/calendar" element={<Layout>
            <Calendar />
          </Layout>} />
        <Route path="/learning" element={<Layout>
            <ActiveUserRoute>
              <Learning />
            </ActiveUserRoute>
          </Layout>} />
        <Route path="/past-session" element={<Layout>
            <PastSession />
          </Layout>} />
        <Route path="/assessment" element={<Layout>
            <ActiveUserRoute>
              <Assessment />
            </ActiveUserRoute>
          </Layout>} />
        <Route path="/assessment/:period/:assessmentType/:assessmentId" element={<Layout>
            <ActiveUserRoute>
              {/* Use SelfAssessmentPage for self assessments, otherwise use AssessmentLayout */}
              <RouteResolver selfComponent={<SelfAssessmentPage />} defaultComponent={<AssessmentLayout />} />
            </ActiveUserRoute>
          </Layout>} />
        <Route path="/assessment/:period/:assessmentType/:assessmentId/readonly" element={<Layout>
            <ActiveUserRoute>
              {/* Use SelfAssessmentPage for self assessments in readonly mode, otherwise use AssessmentLayout */}
              <RouteResolver selfComponent={<SelfAssessmentPage />} defaultComponent={<AssessmentLayout readonly={stryMutAct_9fa48("68") ? false : (stryCov_9fa48("68"), true)} />} />
            </ActiveUserRoute>
          </Layout>} />
        <Route path="/admin-dashboard" element={<Layout>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </Layout>} />
        <Route path="/admin/assessment-grades" element={<Layout>
            <AdminRoute>
              <AssessmentGrades />
            </AdminRoute>
          </Layout>} />
        <Route path="/admissions-dashboard" element={<Layout>
            <AdminRoute>
              <AdmissionsDashboard />
            </AdminRoute>
          </Layout>} />
        <Route path="/admissions-dashboard/application/:applicationId" element={<Layout>
            <AdminRoute>
              <ApplicationDetail />
            </AdminRoute>
          </Layout>} />
        <Route path="/content/*" element={<Layout>
            <AdminRoute>
              <Content />
            </AdminRoute>
          </Layout>} />
        <Route path="/admin-prompts" element={<Layout>
            <AdminRoute>
              <AdminPrompts />
            </AdminRoute>
          </Layout>} />
        <Route path="/facilitator-view" element={<Layout>
            <AdminRoute>
              <FacilitatorView />
            </AdminRoute>
          </Layout>} />
        <Route path="/admin-volunteer-feedback" element={<Layout>
            <AdminRoute>
              <AdminVolunteerFeedback />
            </AdminRoute>
          </Layout>} />
        <Route path="/stats" element={<Layout>
            <Stats />
          </Layout>} />
        <Route path="/account" element={<Layout>
            <Account />
          </Layout>} />
        <Route path="/volunteer-feedback" element={<VolunteerFeedback />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Global Auth Error Modal */}
      <ExpiredTokenModal isOpen={modalConfig.isOpen} type={modalConfig.type} message={modalConfig.message} onRedirect={handleModalRedirect} />
    </>;
  }
}
export default App;