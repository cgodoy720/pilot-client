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
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import BulkActionsModal from '../../components/BulkActionsModal';
import Swal from 'sweetalert2';
import './AdmissionsDashboard.css';
const AdmissionsDashboard = () => {
  if (stryMutAct_9fa48("6035")) {
    {}
  } else {
    stryCov_9fa48("6035");
    const {
      token,
      user
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(stryMutAct_9fa48("6036") ? false : (stryCov_9fa48("6036"), true));
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(stryMutAct_9fa48("6037") ? "" : (stryCov_9fa48("6037"), 'overview'));

    // Check for tab parameter in URL
    useEffect(() => {
      if (stryMutAct_9fa48("6038")) {
        {}
      } else {
        stryCov_9fa48("6038");
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get(stryMutAct_9fa48("6039") ? "" : (stryCov_9fa48("6039"), 'tab'));
        if (stryMutAct_9fa48("6042") ? tabParam || ['overview', 'applications', 'info-sessions', 'workshops', 'emails'].includes(tabParam) : stryMutAct_9fa48("6041") ? false : stryMutAct_9fa48("6040") ? true : (stryCov_9fa48("6040", "6041", "6042"), tabParam && (stryMutAct_9fa48("6043") ? [] : (stryCov_9fa48("6043"), [stryMutAct_9fa48("6044") ? "" : (stryCov_9fa48("6044"), 'overview'), stryMutAct_9fa48("6045") ? "" : (stryCov_9fa48("6045"), 'applications'), stryMutAct_9fa48("6046") ? "" : (stryCov_9fa48("6046"), 'info-sessions'), stryMutAct_9fa48("6047") ? "" : (stryCov_9fa48("6047"), 'workshops'), stryMutAct_9fa48("6048") ? "" : (stryCov_9fa48("6048"), 'emails')])).includes(tabParam))) {
          if (stryMutAct_9fa48("6049")) {
            {}
          } else {
            stryCov_9fa48("6049");
            setActiveTab(tabParam);
          }
        }
      }
    }, stryMutAct_9fa48("6050") ? [] : (stryCov_9fa48("6050"), [location.search]));

    // Data state
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState(stryMutAct_9fa48("6051") ? ["Stryker was here"] : (stryCov_9fa48("6051"), []));
    const [infoSessions, setInfoSessions] = useState(stryMutAct_9fa48("6052") ? ["Stryker was here"] : (stryCov_9fa48("6052"), []));
    const [workshops, setWorkshops] = useState(stryMutAct_9fa48("6053") ? ["Stryker was here"] : (stryCov_9fa48("6053"), []));

    // Pagination and filters
    const [applicationFilters, setApplicationFilters] = useState(stryMutAct_9fa48("6054") ? {} : (stryCov_9fa48("6054"), {
      status: stryMutAct_9fa48("6055") ? "Stryker was here!" : (stryCov_9fa48("6055"), ''),
      info_session_status: stryMutAct_9fa48("6056") ? "Stryker was here!" : (stryCov_9fa48("6056"), ''),
      workshop_status: stryMutAct_9fa48("6057") ? "Stryker was here!" : (stryCov_9fa48("6057"), ''),
      program_admission_status: stryMutAct_9fa48("6058") ? "Stryker was here!" : (stryCov_9fa48("6058"), ''),
      ready_for_workshop_invitation: stryMutAct_9fa48("6059") ? true : (stryCov_9fa48("6059"), false),
      name_search: stryMutAct_9fa48("6060") ? "Stryker was here!" : (stryCov_9fa48("6060"), ''),
      limit: 50,
      offset: 0
    }));
    const [nameSearchInput, setNameSearchInput] = useState(stryMutAct_9fa48("6061") ? "Stryker was here!" : (stryCov_9fa48("6061"), ''));
    const [columnSort, setColumnSort] = useState(stryMutAct_9fa48("6062") ? {} : (stryCov_9fa48("6062"), {
      column: stryMutAct_9fa48("6063") ? "" : (stryCov_9fa48("6063"), 'created_at'),
      direction: stryMutAct_9fa48("6064") ? "" : (stryCov_9fa48("6064"), 'desc') // 'asc' or 'desc'
    }));

    // Event registrations management
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState(stryMutAct_9fa48("6065") ? ["Stryker was here"] : (stryCov_9fa48("6065"), []));
    const [attendanceLoading, setAttendanceLoading] = useState(stryMutAct_9fa48("6066") ? true : (stryCov_9fa48("6066"), false));

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(stryMutAct_9fa48("6067") ? true : (stryCov_9fa48("6067"), false));
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    // Info session form state
    const [infoSessionModalOpen, setInfoSessionModalOpen] = useState(stryMutAct_9fa48("6068") ? true : (stryCov_9fa48("6068"), false));
    const [editingInfoSession, setEditingInfoSession] = useState(null);
    const [infoSessionForm, setInfoSessionForm] = useState(stryMutAct_9fa48("6069") ? {} : (stryCov_9fa48("6069"), {
      title: stryMutAct_9fa48("6070") ? "Stryker was here!" : (stryCov_9fa48("6070"), ''),
      description: stryMutAct_9fa48("6071") ? "Stryker was here!" : (stryCov_9fa48("6071"), ''),
      start_time: stryMutAct_9fa48("6072") ? "Stryker was here!" : (stryCov_9fa48("6072"), ''),
      end_time: stryMutAct_9fa48("6073") ? "Stryker was here!" : (stryCov_9fa48("6073"), ''),
      location: stryMutAct_9fa48("6074") ? "Stryker was here!" : (stryCov_9fa48("6074"), ''),
      capacity: 50,
      is_online: stryMutAct_9fa48("6075") ? true : (stryCov_9fa48("6075"), false),
      meeting_link: stryMutAct_9fa48("6076") ? "Stryker was here!" : (stryCov_9fa48("6076"), '')
    }));
    const [infoSessionSubmitting, setInfoSessionSubmitting] = useState(stryMutAct_9fa48("6077") ? true : (stryCov_9fa48("6077"), false));

    // Workshop form state
    const [workshopModalOpen, setWorkshopModalOpen] = useState(stryMutAct_9fa48("6078") ? true : (stryCov_9fa48("6078"), false));
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const [workshopForm, setWorkshopForm] = useState(stryMutAct_9fa48("6079") ? {} : (stryCov_9fa48("6079"), {
      title: stryMutAct_9fa48("6080") ? "Stryker was here!" : (stryCov_9fa48("6080"), ''),
      description: stryMutAct_9fa48("6081") ? "Stryker was here!" : (stryCov_9fa48("6081"), ''),
      start_time: stryMutAct_9fa48("6082") ? "Stryker was here!" : (stryCov_9fa48("6082"), ''),
      end_time: stryMutAct_9fa48("6083") ? "Stryker was here!" : (stryCov_9fa48("6083"), ''),
      location: stryMutAct_9fa48("6084") ? "" : (stryCov_9fa48("6084"), 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY'),
      capacity: 50,
      is_online: stryMutAct_9fa48("6085") ? true : (stryCov_9fa48("6085"), false),
      meeting_link: stryMutAct_9fa48("6086") ? "Stryker was here!" : (stryCov_9fa48("6086"), '')
    }));
    const [workshopSubmitting, setWorkshopSubmitting] = useState(stryMutAct_9fa48("6087") ? true : (stryCov_9fa48("6087"), false));

    // Bulk actions state
    const [selectedApplicants, setSelectedApplicants] = useState(stryMutAct_9fa48("6088") ? ["Stryker was here"] : (stryCov_9fa48("6088"), []));
    const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(stryMutAct_9fa48("6089") ? true : (stryCov_9fa48("6089"), false));
    const [bulkActionInProgress, setBulkActionInProgress] = useState(stryMutAct_9fa48("6090") ? true : (stryCov_9fa48("6090"), false));

    // Manual registration state
    const [addRegistrationModalOpen, setAddRegistrationModalOpen] = useState(stryMutAct_9fa48("6091") ? true : (stryCov_9fa48("6091"), false));
    const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [applicantSearch, setApplicantSearch] = useState(stryMutAct_9fa48("6092") ? "Stryker was here!" : (stryCov_9fa48("6092"), ''));
    const [searchResults, setSearchResults] = useState(stryMutAct_9fa48("6093") ? ["Stryker was here"] : (stryCov_9fa48("6093"), []));
    const [selectedApplicantsForRegistration, setSelectedApplicantsForRegistration] = useState(stryMutAct_9fa48("6094") ? ["Stryker was here"] : (stryCov_9fa48("6094"), []));
    const [searchLoading, setSearchLoading] = useState(stryMutAct_9fa48("6095") ? true : (stryCov_9fa48("6095"), false));
    const [registrationLoading, setRegistrationLoading] = useState(stryMutAct_9fa48("6096") ? true : (stryCov_9fa48("6096"), false));

    // Event filtering state
    const [showInactiveInfoSessions, setShowInactiveInfoSessions] = useState(stryMutAct_9fa48("6097") ? true : (stryCov_9fa48("6097"), false));
    const [showInactiveWorkshops, setShowInactiveWorkshops] = useState(stryMutAct_9fa48("6098") ? true : (stryCov_9fa48("6098"), false));

    // Email automation state
    const [emailStats, setEmailStats] = useState(null);
    const [queuedEmails, setQueuedEmails] = useState(stryMutAct_9fa48("6099") ? ["Stryker was here"] : (stryCov_9fa48("6099"), []));
    const [emailHistory, setEmailHistory] = useState(stryMutAct_9fa48("6100") ? ["Stryker was here"] : (stryCov_9fa48("6100"), []));
    const [applicantEmailStatus, setApplicantEmailStatus] = useState(stryMutAct_9fa48("6101") ? ["Stryker was here"] : (stryCov_9fa48("6101"), []));
    const [emailAutomationLoading, setEmailAutomationLoading] = useState(stryMutAct_9fa48("6102") ? true : (stryCov_9fa48("6102"), false));
    const [testEmailAddress, setTestEmailAddress] = useState(stryMutAct_9fa48("6103") ? "Stryker was here!" : (stryCov_9fa48("6103"), ''));
    const [testEmailLoading, setTestEmailLoading] = useState(stryMutAct_9fa48("6104") ? true : (stryCov_9fa48("6104"), false));

    // Check if user has admin access
    const hasAdminAccess = stryMutAct_9fa48("6107") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("6106") ? false : stryMutAct_9fa48("6105") ? true : (stryCov_9fa48("6105", "6106", "6107"), (stryMutAct_9fa48("6109") ? user?.role !== 'admin' : stryMutAct_9fa48("6108") ? false : (stryCov_9fa48("6108", "6109"), (stryMutAct_9fa48("6110") ? user.role : (stryCov_9fa48("6110"), user?.role)) === (stryMutAct_9fa48("6111") ? "" : (stryCov_9fa48("6111"), 'admin')))) || (stryMutAct_9fa48("6113") ? user?.role !== 'staff' : stryMutAct_9fa48("6112") ? false : (stryCov_9fa48("6112", "6113"), (stryMutAct_9fa48("6114") ? user.role : (stryCov_9fa48("6114"), user?.role)) === (stryMutAct_9fa48("6115") ? "" : (stryCov_9fa48("6115"), 'staff')))));

    // Fetch all admissions data
    const fetchAdmissionsData = async () => {
      if (stryMutAct_9fa48("6116")) {
        {}
      } else {
        stryCov_9fa48("6116");
        if (stryMutAct_9fa48("6119") ? !hasAdminAccess && !token : stryMutAct_9fa48("6118") ? false : stryMutAct_9fa48("6117") ? true : (stryCov_9fa48("6117", "6118", "6119"), (stryMutAct_9fa48("6120") ? hasAdminAccess : (stryCov_9fa48("6120"), !hasAdminAccess)) || (stryMutAct_9fa48("6121") ? token : (stryCov_9fa48("6121"), !token)))) {
          if (stryMutAct_9fa48("6122")) {
            {}
          } else {
            stryCov_9fa48("6122");
            setError(stryMutAct_9fa48("6123") ? "" : (stryCov_9fa48("6123"), 'You do not have permission to view this page.'));
            setLoading(stryMutAct_9fa48("6124") ? true : (stryCov_9fa48("6124"), false));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("6125")) {
            {}
          } else {
            stryCov_9fa48("6125");
            setLoading(stryMutAct_9fa48("6126") ? false : (stryCov_9fa48("6126"), true));
            setError(null);

            // Fetch all data in parallel
            const [statsResponse, applicationsResponse, infoSessionsResponse, workshopsResponse] = await Promise.all(stryMutAct_9fa48("6127") ? [] : (stryCov_9fa48("6127"), [fetch(stryMutAct_9fa48("6128") ? `` : (stryCov_9fa48("6128"), `${import.meta.env.VITE_API_URL}/api/admissions/stats`), stryMutAct_9fa48("6129") ? {} : (stryCov_9fa48("6129"), {
              headers: stryMutAct_9fa48("6130") ? {} : (stryCov_9fa48("6130"), {
                Authorization: stryMutAct_9fa48("6131") ? `` : (stryCov_9fa48("6131"), `Bearer ${token}`)
              })
            })), fetch(stryMutAct_9fa48("6132") ? `` : (stryCov_9fa48("6132"), `${import.meta.env.VITE_API_URL}/api/admissions/applications?${new URLSearchParams(applicationFilters)}`), stryMutAct_9fa48("6133") ? {} : (stryCov_9fa48("6133"), {
              headers: stryMutAct_9fa48("6134") ? {} : (stryCov_9fa48("6134"), {
                Authorization: stryMutAct_9fa48("6135") ? `` : (stryCov_9fa48("6135"), `Bearer ${token}`)
              })
            })), fetch(stryMutAct_9fa48("6136") ? `` : (stryCov_9fa48("6136"), `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`), stryMutAct_9fa48("6137") ? {} : (stryCov_9fa48("6137"), {
              headers: stryMutAct_9fa48("6138") ? {} : (stryCov_9fa48("6138"), {
                Authorization: stryMutAct_9fa48("6139") ? `` : (stryCov_9fa48("6139"), `Bearer ${token}`)
              })
            })), fetch(stryMutAct_9fa48("6140") ? `` : (stryCov_9fa48("6140"), `${import.meta.env.VITE_API_URL}/api/admissions/workshops`), stryMutAct_9fa48("6141") ? {} : (stryCov_9fa48("6141"), {
              headers: stryMutAct_9fa48("6142") ? {} : (stryCov_9fa48("6142"), {
                Authorization: stryMutAct_9fa48("6143") ? `` : (stryCov_9fa48("6143"), `Bearer ${token}`)
              })
            }))]));

            // Check for errors
            if (stryMutAct_9fa48("6146") ? (!statsResponse.ok || !applicationsResponse.ok || !infoSessionsResponse.ok) && !workshopsResponse.ok : stryMutAct_9fa48("6145") ? false : stryMutAct_9fa48("6144") ? true : (stryCov_9fa48("6144", "6145", "6146"), (stryMutAct_9fa48("6148") ? (!statsResponse.ok || !applicationsResponse.ok) && !infoSessionsResponse.ok : stryMutAct_9fa48("6147") ? false : (stryCov_9fa48("6147", "6148"), (stryMutAct_9fa48("6150") ? !statsResponse.ok && !applicationsResponse.ok : stryMutAct_9fa48("6149") ? false : (stryCov_9fa48("6149", "6150"), (stryMutAct_9fa48("6151") ? statsResponse.ok : (stryCov_9fa48("6151"), !statsResponse.ok)) || (stryMutAct_9fa48("6152") ? applicationsResponse.ok : (stryCov_9fa48("6152"), !applicationsResponse.ok)))) || (stryMutAct_9fa48("6153") ? infoSessionsResponse.ok : (stryCov_9fa48("6153"), !infoSessionsResponse.ok)))) || (stryMutAct_9fa48("6154") ? workshopsResponse.ok : (stryCov_9fa48("6154"), !workshopsResponse.ok)))) {
              if (stryMutAct_9fa48("6155")) {
                {}
              } else {
                stryCov_9fa48("6155");
                throw new Error(stryMutAct_9fa48("6156") ? "" : (stryCov_9fa48("6156"), 'Failed to fetch admissions data'));
              }
            }

            // Parse responses
            const [statsData, applicationsData, infoSessionsData, workshopsData] = await Promise.all(stryMutAct_9fa48("6157") ? [] : (stryCov_9fa48("6157"), [statsResponse.json(), applicationsResponse.json(), infoSessionsResponse.json(), workshopsResponse.json()]));

            // Update state
            setStats(statsData);
            setApplications(applicationsData);
            setInfoSessions(infoSessionsData);
            setWorkshops(workshopsData);
          }
        } catch (error) {
          if (stryMutAct_9fa48("6158")) {
            {}
          } else {
            stryCov_9fa48("6158");
            console.error(stryMutAct_9fa48("6159") ? "" : (stryCov_9fa48("6159"), 'Error fetching admissions data:'), error);
            setError(stryMutAct_9fa48("6160") ? "" : (stryCov_9fa48("6160"), 'Failed to load admissions data. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("6161")) {
            {}
          } else {
            stryCov_9fa48("6161");
            setLoading(stryMutAct_9fa48("6162") ? true : (stryCov_9fa48("6162"), false));
          }
        }
      }
    };

    // Individual fetch functions for refresh buttons
    const fetchApplications = async () => {
      if (stryMutAct_9fa48("6163")) {
        {}
      } else {
        stryCov_9fa48("6163");
        if (stryMutAct_9fa48("6166") ? !hasAdminAccess && !token : stryMutAct_9fa48("6165") ? false : stryMutAct_9fa48("6164") ? true : (stryCov_9fa48("6164", "6165", "6166"), (stryMutAct_9fa48("6167") ? hasAdminAccess : (stryCov_9fa48("6167"), !hasAdminAccess)) || (stryMutAct_9fa48("6168") ? token : (stryCov_9fa48("6168"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6169")) {
            {}
          } else {
            stryCov_9fa48("6169");
            setLoading(stryMutAct_9fa48("6170") ? false : (stryCov_9fa48("6170"), true));
            const params = new URLSearchParams();
            if (stryMutAct_9fa48("6172") ? false : stryMutAct_9fa48("6171") ? true : (stryCov_9fa48("6171", "6172"), applicationFilters.status)) params.append(stryMutAct_9fa48("6173") ? "" : (stryCov_9fa48("6173"), 'status'), applicationFilters.status);
            if (stryMutAct_9fa48("6175") ? false : stryMutAct_9fa48("6174") ? true : (stryCov_9fa48("6174", "6175"), applicationFilters.info_session_status)) params.append(stryMutAct_9fa48("6176") ? "" : (stryCov_9fa48("6176"), 'info_session_status'), applicationFilters.info_session_status);
            if (stryMutAct_9fa48("6178") ? false : stryMutAct_9fa48("6177") ? true : (stryCov_9fa48("6177", "6178"), applicationFilters.recommendation)) params.append(stryMutAct_9fa48("6179") ? "" : (stryCov_9fa48("6179"), 'recommendation'), applicationFilters.recommendation);
            if (stryMutAct_9fa48("6181") ? false : stryMutAct_9fa48("6180") ? true : (stryCov_9fa48("6180", "6181"), applicationFilters.final_status)) params.append(stryMutAct_9fa48("6182") ? "" : (stryCov_9fa48("6182"), 'final_status'), applicationFilters.final_status);
            if (stryMutAct_9fa48("6184") ? false : stryMutAct_9fa48("6183") ? true : (stryCov_9fa48("6183", "6184"), applicationFilters.workshop_status)) params.append(stryMutAct_9fa48("6185") ? "" : (stryCov_9fa48("6185"), 'workshop_status'), applicationFilters.workshop_status);
            if (stryMutAct_9fa48("6187") ? false : stryMutAct_9fa48("6186") ? true : (stryCov_9fa48("6186", "6187"), applicationFilters.program_admission_status)) params.append(stryMutAct_9fa48("6188") ? "" : (stryCov_9fa48("6188"), 'program_admission_status'), applicationFilters.program_admission_status);
            if (stryMutAct_9fa48("6190") ? false : stryMutAct_9fa48("6189") ? true : (stryCov_9fa48("6189", "6190"), applicationFilters.ready_for_workshop_invitation)) params.append(stryMutAct_9fa48("6191") ? "" : (stryCov_9fa48("6191"), 'ready_for_workshop_invitation'), stryMutAct_9fa48("6192") ? "" : (stryCov_9fa48("6192"), 'true'));
            if (stryMutAct_9fa48("6194") ? false : stryMutAct_9fa48("6193") ? true : (stryCov_9fa48("6193", "6194"), applicationFilters.name_search)) params.append(stryMutAct_9fa48("6195") ? "" : (stryCov_9fa48("6195"), 'name_search'), applicationFilters.name_search);
            params.append(stryMutAct_9fa48("6196") ? "" : (stryCov_9fa48("6196"), 'limit'), applicationFilters.limit);
            params.append(stryMutAct_9fa48("6197") ? "" : (stryCov_9fa48("6197"), 'offset'), applicationFilters.offset);
            const response = await fetch(stryMutAct_9fa48("6198") ? `` : (stryCov_9fa48("6198"), `${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`), stryMutAct_9fa48("6199") ? {} : (stryCov_9fa48("6199"), {
              headers: stryMutAct_9fa48("6200") ? {} : (stryCov_9fa48("6200"), {
                'Authorization': stryMutAct_9fa48("6201") ? `` : (stryCov_9fa48("6201"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6202") ? "" : (stryCov_9fa48("6202"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6204") ? false : stryMutAct_9fa48("6203") ? true : (stryCov_9fa48("6203", "6204"), response.ok)) {
              if (stryMutAct_9fa48("6205")) {
                {}
              } else {
                stryCov_9fa48("6205");
                const data = await response.json();
                setApplications(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6206")) {
            {}
          } else {
            stryCov_9fa48("6206");
            console.error(stryMutAct_9fa48("6207") ? "" : (stryCov_9fa48("6207"), 'Error fetching applications:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("6208")) {
            {}
          } else {
            stryCov_9fa48("6208");
            setLoading(stryMutAct_9fa48("6209") ? true : (stryCov_9fa48("6209"), false));
          }
        }
      }
    };
    const fetchInfoSessions = async () => {
      if (stryMutAct_9fa48("6210")) {
        {}
      } else {
        stryCov_9fa48("6210");
        if (stryMutAct_9fa48("6213") ? !hasAdminAccess && !token : stryMutAct_9fa48("6212") ? false : stryMutAct_9fa48("6211") ? true : (stryCov_9fa48("6211", "6212", "6213"), (stryMutAct_9fa48("6214") ? hasAdminAccess : (stryCov_9fa48("6214"), !hasAdminAccess)) || (stryMutAct_9fa48("6215") ? token : (stryCov_9fa48("6215"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6216")) {
            {}
          } else {
            stryCov_9fa48("6216");
            setLoading(stryMutAct_9fa48("6217") ? false : (stryCov_9fa48("6217"), true));
            const response = await fetch(stryMutAct_9fa48("6218") ? `` : (stryCov_9fa48("6218"), `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`), stryMutAct_9fa48("6219") ? {} : (stryCov_9fa48("6219"), {
              headers: stryMutAct_9fa48("6220") ? {} : (stryCov_9fa48("6220"), {
                'Authorization': stryMutAct_9fa48("6221") ? `` : (stryCov_9fa48("6221"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6222") ? "" : (stryCov_9fa48("6222"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6224") ? false : stryMutAct_9fa48("6223") ? true : (stryCov_9fa48("6223", "6224"), response.ok)) {
              if (stryMutAct_9fa48("6225")) {
                {}
              } else {
                stryCov_9fa48("6225");
                const data = await response.json();
                setInfoSessions(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6226")) {
            {}
          } else {
            stryCov_9fa48("6226");
            console.error(stryMutAct_9fa48("6227") ? "" : (stryCov_9fa48("6227"), 'Error fetching info sessions:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("6228")) {
            {}
          } else {
            stryCov_9fa48("6228");
            setLoading(stryMutAct_9fa48("6229") ? true : (stryCov_9fa48("6229"), false));
          }
        }
      }
    };
    const fetchWorkshops = async () => {
      if (stryMutAct_9fa48("6230")) {
        {}
      } else {
        stryCov_9fa48("6230");
        if (stryMutAct_9fa48("6233") ? !hasAdminAccess && !token : stryMutAct_9fa48("6232") ? false : stryMutAct_9fa48("6231") ? true : (stryCov_9fa48("6231", "6232", "6233"), (stryMutAct_9fa48("6234") ? hasAdminAccess : (stryCov_9fa48("6234"), !hasAdminAccess)) || (stryMutAct_9fa48("6235") ? token : (stryCov_9fa48("6235"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6236")) {
            {}
          } else {
            stryCov_9fa48("6236");
            setLoading(stryMutAct_9fa48("6237") ? false : (stryCov_9fa48("6237"), true));
            const response = await fetch(stryMutAct_9fa48("6238") ? `` : (stryCov_9fa48("6238"), `${import.meta.env.VITE_API_URL}/api/admissions/workshops`), stryMutAct_9fa48("6239") ? {} : (stryCov_9fa48("6239"), {
              headers: stryMutAct_9fa48("6240") ? {} : (stryCov_9fa48("6240"), {
                'Authorization': stryMutAct_9fa48("6241") ? `` : (stryCov_9fa48("6241"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6242") ? "" : (stryCov_9fa48("6242"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6244") ? false : stryMutAct_9fa48("6243") ? true : (stryCov_9fa48("6243", "6244"), response.ok)) {
              if (stryMutAct_9fa48("6245")) {
                {}
              } else {
                stryCov_9fa48("6245");
                const data = await response.json();
                setWorkshops(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6246")) {
            {}
          } else {
            stryCov_9fa48("6246");
            console.error(stryMutAct_9fa48("6247") ? "" : (stryCov_9fa48("6247"), 'Error fetching workshops:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("6248")) {
            {}
          } else {
            stryCov_9fa48("6248");
            setLoading(stryMutAct_9fa48("6249") ? true : (stryCov_9fa48("6249"), false));
          }
        }
      }
    };

    // Debounce name search input
    useEffect(() => {
      if (stryMutAct_9fa48("6250")) {
        {}
      } else {
        stryCov_9fa48("6250");
        const timeoutId = setTimeout(() => {
          if (stryMutAct_9fa48("6251")) {
            {}
          } else {
            stryCov_9fa48("6251");
            setApplicationFilters(stryMutAct_9fa48("6252") ? () => undefined : (stryCov_9fa48("6252"), prev => stryMutAct_9fa48("6253") ? {} : (stryCov_9fa48("6253"), {
              ...prev,
              name_search: nameSearchInput,
              offset: 0 // Reset to first page when search changes
            })));
          }
        }, 500); // 500ms delay

        return stryMutAct_9fa48("6254") ? () => undefined : (stryCov_9fa48("6254"), () => clearTimeout(timeoutId));
      }
    }, stryMutAct_9fa48("6255") ? [] : (stryCov_9fa48("6255"), [nameSearchInput]));

    // Email automation fetch functions
    const fetchEmailStats = async () => {
      if (stryMutAct_9fa48("6256")) {
        {}
      } else {
        stryCov_9fa48("6256");
        if (stryMutAct_9fa48("6259") ? !hasAdminAccess && !token : stryMutAct_9fa48("6258") ? false : stryMutAct_9fa48("6257") ? true : (stryCov_9fa48("6257", "6258", "6259"), (stryMutAct_9fa48("6260") ? hasAdminAccess : (stryCov_9fa48("6260"), !hasAdminAccess)) || (stryMutAct_9fa48("6261") ? token : (stryCov_9fa48("6261"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6262")) {
            {}
          } else {
            stryCov_9fa48("6262");
            setEmailAutomationLoading(stryMutAct_9fa48("6263") ? false : (stryCov_9fa48("6263"), true));
            const response = await fetch(stryMutAct_9fa48("6264") ? `` : (stryCov_9fa48("6264"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/stats`), stryMutAct_9fa48("6265") ? {} : (stryCov_9fa48("6265"), {
              headers: stryMutAct_9fa48("6266") ? {} : (stryCov_9fa48("6266"), {
                'Authorization': stryMutAct_9fa48("6267") ? `` : (stryCov_9fa48("6267"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6268") ? "" : (stryCov_9fa48("6268"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6270") ? false : stryMutAct_9fa48("6269") ? true : (stryCov_9fa48("6269", "6270"), response.ok)) {
              if (stryMutAct_9fa48("6271")) {
                {}
              } else {
                stryCov_9fa48("6271");
                const data = await response.json();
                setEmailStats(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6272")) {
            {}
          } else {
            stryCov_9fa48("6272");
            console.error(stryMutAct_9fa48("6273") ? "" : (stryCov_9fa48("6273"), 'Error fetching email stats:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("6274")) {
            {}
          } else {
            stryCov_9fa48("6274");
            setEmailAutomationLoading(stryMutAct_9fa48("6275") ? true : (stryCov_9fa48("6275"), false));
          }
        }
      }
    };
    const fetchQueuedEmails = async () => {
      if (stryMutAct_9fa48("6276")) {
        {}
      } else {
        stryCov_9fa48("6276");
        if (stryMutAct_9fa48("6279") ? !hasAdminAccess && !token : stryMutAct_9fa48("6278") ? false : stryMutAct_9fa48("6277") ? true : (stryCov_9fa48("6277", "6278", "6279"), (stryMutAct_9fa48("6280") ? hasAdminAccess : (stryCov_9fa48("6280"), !hasAdminAccess)) || (stryMutAct_9fa48("6281") ? token : (stryCov_9fa48("6281"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6282")) {
            {}
          } else {
            stryCov_9fa48("6282");
            const response = await fetch(stryMutAct_9fa48("6283") ? `` : (stryCov_9fa48("6283"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/queued`), stryMutAct_9fa48("6284") ? {} : (stryCov_9fa48("6284"), {
              headers: stryMutAct_9fa48("6285") ? {} : (stryCov_9fa48("6285"), {
                'Authorization': stryMutAct_9fa48("6286") ? `` : (stryCov_9fa48("6286"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6287") ? "" : (stryCov_9fa48("6287"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6289") ? false : stryMutAct_9fa48("6288") ? true : (stryCov_9fa48("6288", "6289"), response.ok)) {
              if (stryMutAct_9fa48("6290")) {
                {}
              } else {
                stryCov_9fa48("6290");
                const data = await response.json();
                setQueuedEmails(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6291")) {
            {}
          } else {
            stryCov_9fa48("6291");
            console.error(stryMutAct_9fa48("6292") ? "" : (stryCov_9fa48("6292"), 'Error fetching queued emails:'), error);
          }
        }
      }
    };
    const fetchEmailHistory = async () => {
      if (stryMutAct_9fa48("6293")) {
        {}
      } else {
        stryCov_9fa48("6293");
        if (stryMutAct_9fa48("6296") ? !hasAdminAccess && !token : stryMutAct_9fa48("6295") ? false : stryMutAct_9fa48("6294") ? true : (stryCov_9fa48("6294", "6295", "6296"), (stryMutAct_9fa48("6297") ? hasAdminAccess : (stryCov_9fa48("6297"), !hasAdminAccess)) || (stryMutAct_9fa48("6298") ? token : (stryCov_9fa48("6298"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6299")) {
            {}
          } else {
            stryCov_9fa48("6299");
            const response = await fetch(stryMutAct_9fa48("6300") ? `` : (stryCov_9fa48("6300"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/history`), stryMutAct_9fa48("6301") ? {} : (stryCov_9fa48("6301"), {
              headers: stryMutAct_9fa48("6302") ? {} : (stryCov_9fa48("6302"), {
                'Authorization': stryMutAct_9fa48("6303") ? `` : (stryCov_9fa48("6303"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6304") ? "" : (stryCov_9fa48("6304"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6306") ? false : stryMutAct_9fa48("6305") ? true : (stryCov_9fa48("6305", "6306"), response.ok)) {
              if (stryMutAct_9fa48("6307")) {
                {}
              } else {
                stryCov_9fa48("6307");
                const data = await response.json();
                setEmailHistory(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6308")) {
            {}
          } else {
            stryCov_9fa48("6308");
            console.error(stryMutAct_9fa48("6309") ? "" : (stryCov_9fa48("6309"), 'Error fetching email history:'), error);
          }
        }
      }
    };
    const fetchApplicantEmailStatus = async () => {
      if (stryMutAct_9fa48("6310")) {
        {}
      } else {
        stryCov_9fa48("6310");
        if (stryMutAct_9fa48("6313") ? !hasAdminAccess && !token : stryMutAct_9fa48("6312") ? false : stryMutAct_9fa48("6311") ? true : (stryCov_9fa48("6311", "6312", "6313"), (stryMutAct_9fa48("6314") ? hasAdminAccess : (stryCov_9fa48("6314"), !hasAdminAccess)) || (stryMutAct_9fa48("6315") ? token : (stryCov_9fa48("6315"), !token)))) return;
        try {
          if (stryMutAct_9fa48("6316")) {
            {}
          } else {
            stryCov_9fa48("6316");
            const response = await fetch(stryMutAct_9fa48("6317") ? `` : (stryCov_9fa48("6317"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/applicant-status`), stryMutAct_9fa48("6318") ? {} : (stryCov_9fa48("6318"), {
              headers: stryMutAct_9fa48("6319") ? {} : (stryCov_9fa48("6319"), {
                'Authorization': stryMutAct_9fa48("6320") ? `` : (stryCov_9fa48("6320"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6321") ? "" : (stryCov_9fa48("6321"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6323") ? false : stryMutAct_9fa48("6322") ? true : (stryCov_9fa48("6322", "6323"), response.ok)) {
              if (stryMutAct_9fa48("6324")) {
                {}
              } else {
                stryCov_9fa48("6324");
                const data = await response.json();
                setApplicantEmailStatus(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6325")) {
            {}
          } else {
            stryCov_9fa48("6325");
            console.error(stryMutAct_9fa48("6326") ? "" : (stryCov_9fa48("6326"), 'Error fetching applicant email status:'), error);
          }
        }
      }
    };
    const sendTestEmail = async () => {
      if (stryMutAct_9fa48("6327")) {
        {}
      } else {
        stryCov_9fa48("6327");
        if (stryMutAct_9fa48("6330") ? false : stryMutAct_9fa48("6329") ? true : stryMutAct_9fa48("6328") ? testEmailAddress.trim() : (stryCov_9fa48("6328", "6329", "6330"), !(stryMutAct_9fa48("6331") ? testEmailAddress : (stryCov_9fa48("6331"), testEmailAddress.trim())))) {
          if (stryMutAct_9fa48("6332")) {
            {}
          } else {
            stryCov_9fa48("6332");
            Swal.fire(stryMutAct_9fa48("6333") ? {} : (stryCov_9fa48("6333"), {
              title: stryMutAct_9fa48("6334") ? "" : (stryCov_9fa48("6334"), 'Email Required'),
              text: stryMutAct_9fa48("6335") ? "" : (stryCov_9fa48("6335"), 'Please enter an email address to send the test email to.'),
              icon: stryMutAct_9fa48("6336") ? "" : (stryCov_9fa48("6336"), 'warning'),
              confirmButtonColor: stryMutAct_9fa48("6337") ? "" : (stryCov_9fa48("6337"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("6338") ? "" : (stryCov_9fa48("6338"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("6339") ? "" : (stryCov_9fa48("6339"), 'var(--color-text-primary)')
            }));
            return;
          }
        }

        // Validate email format
        const emailRegex = stryMutAct_9fa48("6350") ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/ : stryMutAct_9fa48("6349") ? /^[^\s@]+@[^\s@]+\.[\s@]+$/ : stryMutAct_9fa48("6348") ? /^[^\s@]+@[^\s@]+\.[^\s@]$/ : stryMutAct_9fa48("6347") ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/ : stryMutAct_9fa48("6346") ? /^[^\s@]+@[\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("6345") ? /^[^\s@]+@[^\s@]\.[^\s@]+$/ : stryMutAct_9fa48("6344") ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("6343") ? /^[\s@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("6342") ? /^[^\s@]@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("6341") ? /^[^\s@]+@[^\s@]+\.[^\s@]+/ : stryMutAct_9fa48("6340") ? /[^\s@]+@[^\s@]+\.[^\s@]+$/ : (stryCov_9fa48("6340", "6341", "6342", "6343", "6344", "6345", "6346", "6347", "6348", "6349", "6350"), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (stryMutAct_9fa48("6353") ? false : stryMutAct_9fa48("6352") ? true : stryMutAct_9fa48("6351") ? emailRegex.test(testEmailAddress.trim()) : (stryCov_9fa48("6351", "6352", "6353"), !emailRegex.test(stryMutAct_9fa48("6354") ? testEmailAddress : (stryCov_9fa48("6354"), testEmailAddress.trim())))) {
          if (stryMutAct_9fa48("6355")) {
            {}
          } else {
            stryCov_9fa48("6355");
            Swal.fire(stryMutAct_9fa48("6356") ? {} : (stryCov_9fa48("6356"), {
              title: stryMutAct_9fa48("6357") ? "" : (stryCov_9fa48("6357"), 'Invalid Email'),
              text: stryMutAct_9fa48("6358") ? "" : (stryCov_9fa48("6358"), 'Please enter a valid email address.'),
              icon: stryMutAct_9fa48("6359") ? "" : (stryCov_9fa48("6359"), 'error'),
              confirmButtonColor: stryMutAct_9fa48("6360") ? "" : (stryCov_9fa48("6360"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("6361") ? "" : (stryCov_9fa48("6361"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("6362") ? "" : (stryCov_9fa48("6362"), 'var(--color-text-primary)')
            }));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("6363")) {
            {}
          } else {
            stryCov_9fa48("6363");
            setTestEmailLoading(stryMutAct_9fa48("6364") ? false : (stryCov_9fa48("6364"), true));
            const response = await fetch(stryMutAct_9fa48("6365") ? `` : (stryCov_9fa48("6365"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/send-test-email`), stryMutAct_9fa48("6366") ? {} : (stryCov_9fa48("6366"), {
              method: stryMutAct_9fa48("6367") ? "" : (stryCov_9fa48("6367"), 'POST'),
              headers: stryMutAct_9fa48("6368") ? {} : (stryCov_9fa48("6368"), {
                'Content-Type': stryMutAct_9fa48("6369") ? "" : (stryCov_9fa48("6369"), 'application/json'),
                'Authorization': stryMutAct_9fa48("6370") ? `` : (stryCov_9fa48("6370"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("6371") ? {} : (stryCov_9fa48("6371"), {
                email: stryMutAct_9fa48("6372") ? testEmailAddress : (stryCov_9fa48("6372"), testEmailAddress.trim())
              }))
            }));
            if (stryMutAct_9fa48("6374") ? false : stryMutAct_9fa48("6373") ? true : (stryCov_9fa48("6373", "6374"), response.ok)) {
              if (stryMutAct_9fa48("6375")) {
                {}
              } else {
                stryCov_9fa48("6375");
                const data = await response.json();
                Swal.fire(stryMutAct_9fa48("6376") ? {} : (stryCov_9fa48("6376"), {
                  title: stryMutAct_9fa48("6377") ? "" : (stryCov_9fa48("6377"), '📧 Test Email Sent!'),
                  html: stryMutAct_9fa48("6378") ? `` : (stryCov_9fa48("6378"), `
                        <div style="text-align: left;">
                            <p><strong>Sent to:</strong> ${testEmailAddress}</p>
                            <p><strong>Log ID:</strong> ${data.logId}</p>
                            <hr style="margin: 15px 0;">
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Check your email inbox</li>
                                <li>Open the test email</li>
                                <li>Return to this dashboard and refresh the Emails tab</li>
                                <li>Check the updated open rate statistics</li>
                            </ol>
                        </div>
                    `),
                  icon: stryMutAct_9fa48("6379") ? "" : (stryCov_9fa48("6379"), 'success'),
                  confirmButtonText: stryMutAct_9fa48("6380") ? "" : (stryCov_9fa48("6380"), 'Got it!'),
                  confirmButtonColor: stryMutAct_9fa48("6381") ? "" : (stryCov_9fa48("6381"), 'var(--color-primary)'),
                  background: stryMutAct_9fa48("6382") ? "" : (stryCov_9fa48("6382"), 'var(--color-background-dark)'),
                  color: stryMutAct_9fa48("6383") ? "" : (stryCov_9fa48("6383"), 'var(--color-text-primary)')
                }));

                // Clear the input and refresh stats
                setTestEmailAddress(stryMutAct_9fa48("6384") ? "Stryker was here!" : (stryCov_9fa48("6384"), ''));
                fetchEmailStats();
              }
            } else {
              if (stryMutAct_9fa48("6385")) {
                {}
              } else {
                stryCov_9fa48("6385");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("6388") ? errorData.error && 'Failed to send test email' : stryMutAct_9fa48("6387") ? false : stryMutAct_9fa48("6386") ? true : (stryCov_9fa48("6386", "6387", "6388"), errorData.error || (stryMutAct_9fa48("6389") ? "" : (stryCov_9fa48("6389"), 'Failed to send test email'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6390")) {
            {}
          } else {
            stryCov_9fa48("6390");
            console.error(stryMutAct_9fa48("6391") ? "" : (stryCov_9fa48("6391"), 'Error sending test email:'), error);
            Swal.fire(stryMutAct_9fa48("6392") ? {} : (stryCov_9fa48("6392"), {
              title: stryMutAct_9fa48("6393") ? "" : (stryCov_9fa48("6393"), 'Error'),
              text: stryMutAct_9fa48("6396") ? error.message && 'Failed to send test email. Please try again.' : stryMutAct_9fa48("6395") ? false : stryMutAct_9fa48("6394") ? true : (stryCov_9fa48("6394", "6395", "6396"), error.message || (stryMutAct_9fa48("6397") ? "" : (stryCov_9fa48("6397"), 'Failed to send test email. Please try again.'))),
              icon: stryMutAct_9fa48("6398") ? "" : (stryCov_9fa48("6398"), 'error'),
              confirmButtonColor: stryMutAct_9fa48("6399") ? "" : (stryCov_9fa48("6399"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("6400") ? "" : (stryCov_9fa48("6400"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("6401") ? "" : (stryCov_9fa48("6401"), 'var(--color-text-primary)')
            }));
          }
        } finally {
          if (stryMutAct_9fa48("6402")) {
            {}
          } else {
            stryCov_9fa48("6402");
            setTestEmailLoading(stryMutAct_9fa48("6403") ? true : (stryCov_9fa48("6403"), false));
          }
        }
      }
    };

    // Load data on mount and when filters change
    useEffect(() => {
      if (stryMutAct_9fa48("6404")) {
        {}
      } else {
        stryCov_9fa48("6404");
        fetchAdmissionsData();
      }
    }, stryMutAct_9fa48("6405") ? [] : (stryCov_9fa48("6405"), [token, hasAdminAccess, applicationFilters]));

    // Load email automation data when tab changes
    useEffect(() => {
      if (stryMutAct_9fa48("6406")) {
        {}
      } else {
        stryCov_9fa48("6406");
        if (stryMutAct_9fa48("6409") ? activeTab !== 'emails' : stryMutAct_9fa48("6408") ? false : stryMutAct_9fa48("6407") ? true : (stryCov_9fa48("6407", "6408", "6409"), activeTab === (stryMutAct_9fa48("6410") ? "" : (stryCov_9fa48("6410"), 'emails')))) {
          if (stryMutAct_9fa48("6411")) {
            {}
          } else {
            stryCov_9fa48("6411");
            fetchEmailStats();
            fetchQueuedEmails();
            fetchEmailHistory();
            fetchApplicantEmailStatus();
          }
        }
      }
    }, stryMutAct_9fa48("6412") ? [] : (stryCov_9fa48("6412"), [activeTab, token, hasAdminAccess]));

    // Debounced search for applicants
    useEffect(() => {
      if (stryMutAct_9fa48("6413")) {
        {}
      } else {
        stryCov_9fa48("6413");
        if (stryMutAct_9fa48("6416") ? false : stryMutAct_9fa48("6415") ? true : stryMutAct_9fa48("6414") ? applicantSearch.trim() : (stryCov_9fa48("6414", "6415", "6416"), !(stryMutAct_9fa48("6417") ? applicantSearch : (stryCov_9fa48("6417"), applicantSearch.trim())))) {
          if (stryMutAct_9fa48("6418")) {
            {}
          } else {
            stryCov_9fa48("6418");
            console.log(stryMutAct_9fa48("6419") ? "" : (stryCov_9fa48("6419"), '🔍 Clearing results due to empty applicantSearch'));
            setSearchResults(stryMutAct_9fa48("6420") ? ["Stryker was here"] : (stryCov_9fa48("6420"), []));
            return;
          }
        }
        console.log(stryMutAct_9fa48("6421") ? "" : (stryCov_9fa48("6421"), '🔍 Debouncing search for:'), applicantSearch);
        const timeoutId = setTimeout(() => {
          if (stryMutAct_9fa48("6422")) {
            {}
          } else {
            stryCov_9fa48("6422");
            searchApplicants(applicantSearch);
          }
        }, 300); // 300ms delay

        return stryMutAct_9fa48("6423") ? () => undefined : (stryCov_9fa48("6423"), () => clearTimeout(timeoutId));
      }
    }, stryMutAct_9fa48("6424") ? [] : (stryCov_9fa48("6424"), [applicantSearch, selectedEventForRegistration, selectedEventType]));

    // Monitor searchResults changes
    useEffect(() => {
      if (stryMutAct_9fa48("6425")) {
        {}
      } else {
        stryCov_9fa48("6425");
        console.log(stryMutAct_9fa48("6426") ? "" : (stryCov_9fa48("6426"), '🔍 searchResults state changed:'), searchResults.length, stryMutAct_9fa48("6427") ? "" : (stryCov_9fa48("6427"), 'items'));
        console.log(stryMutAct_9fa48("6428") ? "" : (stryCov_9fa48("6428"), '🔍 searchResults array:'), searchResults);
        if (stryMutAct_9fa48("6432") ? searchResults.length <= 0 : stryMutAct_9fa48("6431") ? searchResults.length >= 0 : stryMutAct_9fa48("6430") ? false : stryMutAct_9fa48("6429") ? true : (stryCov_9fa48("6429", "6430", "6431", "6432"), searchResults.length > 0)) {
          if (stryMutAct_9fa48("6433")) {
            {}
          } else {
            stryCov_9fa48("6433");
            console.log(stryMutAct_9fa48("6434") ? "" : (stryCov_9fa48("6434"), '🔍 Sample results:'), stryMutAct_9fa48("6435") ? searchResults.map(a => ({
              name: a.display_name,
              email: a.email
            })) : (stryCov_9fa48("6435"), searchResults.slice(0, 2).map(stryMutAct_9fa48("6436") ? () => undefined : (stryCov_9fa48("6436"), a => stryMutAct_9fa48("6437") ? {} : (stryCov_9fa48("6437"), {
              name: a.display_name,
              email: a.email
            })))));
            console.log(stryMutAct_9fa48("6438") ? "" : (stryCov_9fa48("6438"), '🔍 Should show search results UI now!'));
          }
        }
      }
    }, stryMutAct_9fa48("6439") ? [] : (stryCov_9fa48("6439"), [searchResults]));

    // Handle tab switching
    const handleTabChange = tab => {
      if (stryMutAct_9fa48("6440")) {
        {}
      } else {
        stryCov_9fa48("6440");
        setActiveTab(tab);
      }
    };

    // Handle status change (human override)
    const handleStatusChange = async (applicationId, newStatus) => {
      if (stryMutAct_9fa48("6441")) {
        {}
      } else {
        stryCov_9fa48("6441");
        try {
          if (stryMutAct_9fa48("6442")) {
            {}
          } else {
            stryCov_9fa48("6442");
            const response = await fetch(stryMutAct_9fa48("6443") ? `` : (stryCov_9fa48("6443"), `${import.meta.env.VITE_API_URL}/api/admissions/applications/${applicationId}/status`), stryMutAct_9fa48("6444") ? {} : (stryCov_9fa48("6444"), {
              method: stryMutAct_9fa48("6445") ? "" : (stryCov_9fa48("6445"), 'PUT'),
              headers: stryMutAct_9fa48("6446") ? {} : (stryCov_9fa48("6446"), {
                'Authorization': stryMutAct_9fa48("6447") ? `` : (stryCov_9fa48("6447"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6448") ? "" : (stryCov_9fa48("6448"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("6449") ? {} : (stryCov_9fa48("6449"), {
                final_status: newStatus
              }))
            }));
            if (stryMutAct_9fa48("6451") ? false : stryMutAct_9fa48("6450") ? true : (stryCov_9fa48("6450", "6451"), response.ok)) {
              if (stryMutAct_9fa48("6452")) {
                {}
              } else {
                stryCov_9fa48("6452");
                // Update the local state
                setApplications(stryMutAct_9fa48("6453") ? () => undefined : (stryCov_9fa48("6453"), prev => stryMutAct_9fa48("6454") ? {} : (stryCov_9fa48("6454"), {
                  ...prev,
                  applications: prev.applications.map(stryMutAct_9fa48("6455") ? () => undefined : (stryCov_9fa48("6455"), app => (stryMutAct_9fa48("6458") ? app.application_id !== applicationId : stryMutAct_9fa48("6457") ? false : stryMutAct_9fa48("6456") ? true : (stryCov_9fa48("6456", "6457", "6458"), app.application_id === applicationId)) ? stryMutAct_9fa48("6459") ? {} : (stryCov_9fa48("6459"), {
                    ...app,
                    final_status: newStatus,
                    has_human_override: stryMutAct_9fa48("6462") ? app.recommendation === newStatus : stryMutAct_9fa48("6461") ? false : stryMutAct_9fa48("6460") ? true : (stryCov_9fa48("6460", "6461", "6462"), app.recommendation !== newStatus)
                  }) : app))
                })));
              }
            } else {
              if (stryMutAct_9fa48("6463")) {
                {}
              } else {
                stryCov_9fa48("6463");
                console.error(stryMutAct_9fa48("6464") ? "" : (stryCov_9fa48("6464"), 'Failed to update status'));
                setError(stryMutAct_9fa48("6465") ? "" : (stryCov_9fa48("6465"), 'Failed to update status. Please try again.'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6466")) {
            {}
          } else {
            stryCov_9fa48("6466");
            console.error(stryMutAct_9fa48("6467") ? "" : (stryCov_9fa48("6467"), 'Error updating status:'), error);
            setError(stryMutAct_9fa48("6468") ? "" : (stryCov_9fa48("6468"), 'Failed to update status. Please try again.'));
          }
        }
      }
    };

    // Handle bulk actions
    const handleBulkAction = async (action, customSubject = stryMutAct_9fa48("6469") ? "Stryker was here!" : (stryCov_9fa48("6469"), ''), customBody = stryMutAct_9fa48("6470") ? "Stryker was here!" : (stryCov_9fa48("6470"), '')) => {
      if (stryMutAct_9fa48("6471")) {
        {}
      } else {
        stryCov_9fa48("6471");
        if (stryMutAct_9fa48("6474") ? selectedApplicants.length !== 0 : stryMutAct_9fa48("6473") ? false : stryMutAct_9fa48("6472") ? true : (stryCov_9fa48("6472", "6473", "6474"), selectedApplicants.length === 0)) return;
        setBulkActionInProgress(stryMutAct_9fa48("6475") ? false : (stryCov_9fa48("6475"), true));
        try {
          if (stryMutAct_9fa48("6476")) {
            {}
          } else {
            stryCov_9fa48("6476");
            const requestBody = stryMutAct_9fa48("6477") ? {} : (stryCov_9fa48("6477"), {
              action,
              applicant_ids: selectedApplicants
            });
            if (stryMutAct_9fa48("6480") ? action !== 'send_custom_email' : stryMutAct_9fa48("6479") ? false : stryMutAct_9fa48("6478") ? true : (stryCov_9fa48("6478", "6479", "6480"), action === (stryMutAct_9fa48("6481") ? "" : (stryCov_9fa48("6481"), 'send_custom_email')))) {
              if (stryMutAct_9fa48("6482")) {
                {}
              } else {
                stryCov_9fa48("6482");
                requestBody.custom_subject = customSubject;
                requestBody.custom_body = customBody;
              }
            }
            const response = await fetch(stryMutAct_9fa48("6483") ? `` : (stryCov_9fa48("6483"), `${import.meta.env.VITE_API_URL}/api/admissions/bulk-actions`), stryMutAct_9fa48("6484") ? {} : (stryCov_9fa48("6484"), {
              method: stryMutAct_9fa48("6485") ? "" : (stryCov_9fa48("6485"), 'POST'),
              headers: stryMutAct_9fa48("6486") ? {} : (stryCov_9fa48("6486"), {
                'Authorization': stryMutAct_9fa48("6487") ? `` : (stryCov_9fa48("6487"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6488") ? "" : (stryCov_9fa48("6488"), 'application/json')
              }),
              body: JSON.stringify(requestBody)
            }));
            if (stryMutAct_9fa48("6490") ? false : stryMutAct_9fa48("6489") ? true : (stryCov_9fa48("6489", "6490"), response.ok)) {
              if (stryMutAct_9fa48("6491")) {
                {}
              } else {
                stryCov_9fa48("6491");
                const result = await response.json();
                console.log(stryMutAct_9fa48("6492") ? "" : (stryCov_9fa48("6492"), 'Bulk action completed:'), result);

                // Refresh applications data
                await fetchApplications();

                // Clear selection
                setSelectedApplicants(stryMutAct_9fa48("6493") ? ["Stryker was here"] : (stryCov_9fa48("6493"), []));
                setBulkActionsModalOpen(stryMutAct_9fa48("6494") ? true : (stryCov_9fa48("6494"), false));

                // Show success message
                setError(null);
              }
            } else {
              if (stryMutAct_9fa48("6495")) {
                {}
              } else {
                stryCov_9fa48("6495");
                const errorData = await response.json();
                console.error(stryMutAct_9fa48("6496") ? "" : (stryCov_9fa48("6496"), 'Bulk action failed:'), errorData);
                setError(stryMutAct_9fa48("6497") ? `` : (stryCov_9fa48("6497"), `Bulk action failed: ${errorData.error}`));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("6498")) {
            {}
          } else {
            stryCov_9fa48("6498");
            console.error(stryMutAct_9fa48("6499") ? "" : (stryCov_9fa48("6499"), 'Error performing bulk action:'), error);
            setError(stryMutAct_9fa48("6500") ? "" : (stryCov_9fa48("6500"), 'Failed to perform bulk action. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("6501")) {
            {}
          } else {
            stryCov_9fa48("6501");
            setBulkActionInProgress(stryMutAct_9fa48("6502") ? true : (stryCov_9fa48("6502"), false));
          }
        }
      }
    };

    // Handle application filter changes
    const handleFilterChange = (key, value) => {
      if (stryMutAct_9fa48("6503")) {
        {}
      } else {
        stryCov_9fa48("6503");
        setApplicationFilters(stryMutAct_9fa48("6504") ? () => undefined : (stryCov_9fa48("6504"), prev => stryMutAct_9fa48("6505") ? {} : (stryCov_9fa48("6505"), {
          ...prev,
          [key]: value,
          offset: (stryMutAct_9fa48("6508") ? key === 'offset' : stryMutAct_9fa48("6507") ? false : stryMutAct_9fa48("6506") ? true : (stryCov_9fa48("6506", "6507", "6508"), key !== (stryMutAct_9fa48("6509") ? "" : (stryCov_9fa48("6509"), 'offset')))) ? 0 : value // Reset offset when other filters change
        })));
      }
    };

    // Handle notes modal
    const openNotesModal = applicant => {
      if (stryMutAct_9fa48("6510")) {
        {}
      } else {
        stryCov_9fa48("6510");
        setSelectedApplicant(applicant);
        setNotesModalOpen(stryMutAct_9fa48("6511") ? false : (stryCov_9fa48("6511"), true));
      }
    };
    const closeNotesModal = () => {
      if (stryMutAct_9fa48("6512")) {
        {}
      } else {
        stryCov_9fa48("6512");
        setNotesModalOpen(stryMutAct_9fa48("6513") ? true : (stryCov_9fa48("6513"), false));
        setSelectedApplicant(null);
      }
    };

    // Handle column sorting
    const handleColumnSort = column => {
      if (stryMutAct_9fa48("6514")) {
        {}
      } else {
        stryCov_9fa48("6514");
        setColumnSort(stryMutAct_9fa48("6515") ? () => undefined : (stryCov_9fa48("6515"), prev => stryMutAct_9fa48("6516") ? {} : (stryCov_9fa48("6516"), {
          column,
          direction: (stryMutAct_9fa48("6519") ? prev.column === column || prev.direction === 'asc' : stryMutAct_9fa48("6518") ? false : stryMutAct_9fa48("6517") ? true : (stryCov_9fa48("6517", "6518", "6519"), (stryMutAct_9fa48("6521") ? prev.column !== column : stryMutAct_9fa48("6520") ? true : (stryCov_9fa48("6520", "6521"), prev.column === column)) && (stryMutAct_9fa48("6523") ? prev.direction !== 'asc' : stryMutAct_9fa48("6522") ? true : (stryCov_9fa48("6522", "6523"), prev.direction === (stryMutAct_9fa48("6524") ? "" : (stryCov_9fa48("6524"), 'asc')))))) ? stryMutAct_9fa48("6525") ? "" : (stryCov_9fa48("6525"), 'desc') : stryMutAct_9fa48("6526") ? "" : (stryCov_9fa48("6526"), 'asc')
        })));
      }
    };

    // Sort applications (name filtering is now handled server-side)
    const sortAndFilterApplications = apps => {
      if (stryMutAct_9fa48("6527")) {
        {}
      } else {
        stryCov_9fa48("6527");
        if (stryMutAct_9fa48("6530") ? !apps && !Array.isArray(apps) : stryMutAct_9fa48("6529") ? false : stryMutAct_9fa48("6528") ? true : (stryCov_9fa48("6528", "6529", "6530"), (stryMutAct_9fa48("6531") ? apps : (stryCov_9fa48("6531"), !apps)) || (stryMutAct_9fa48("6532") ? Array.isArray(apps) : (stryCov_9fa48("6532"), !Array.isArray(apps))))) return apps;
        let filteredApps = stryMutAct_9fa48("6533") ? [] : (stryCov_9fa48("6533"), [...apps]);

        // Apply sorting
        return stryMutAct_9fa48("6534") ? filteredApps : (stryCov_9fa48("6534"), filteredApps.sort((a, b) => {
          if (stryMutAct_9fa48("6535")) {
            {}
          } else {
            stryCov_9fa48("6535");
            let valueA, valueB;
            switch (columnSort.column) {
              case stryMutAct_9fa48("6537") ? "" : (stryCov_9fa48("6537"), 'name'):
                if (stryMutAct_9fa48("6536")) {} else {
                  stryCov_9fa48("6536");
                  valueA = stryMutAct_9fa48("6538") ? `${a.first_name} ${a.last_name}`.toUpperCase() : (stryCov_9fa48("6538"), (stryMutAct_9fa48("6539") ? `` : (stryCov_9fa48("6539"), `${a.first_name} ${a.last_name}`)).toLowerCase());
                  valueB = stryMutAct_9fa48("6540") ? `${b.first_name} ${b.last_name}`.toUpperCase() : (stryCov_9fa48("6540"), (stryMutAct_9fa48("6541") ? `` : (stryCov_9fa48("6541"), `${b.first_name} ${b.last_name}`)).toLowerCase());
                  break;
                }
              case stryMutAct_9fa48("6543") ? "" : (stryCov_9fa48("6543"), 'status'):
                if (stryMutAct_9fa48("6542")) {} else {
                  stryCov_9fa48("6542");
                  valueA = stryMutAct_9fa48("6546") ? a.status && '' : stryMutAct_9fa48("6545") ? false : stryMutAct_9fa48("6544") ? true : (stryCov_9fa48("6544", "6545", "6546"), a.status || (stryMutAct_9fa48("6547") ? "Stryker was here!" : (stryCov_9fa48("6547"), '')));
                  valueB = stryMutAct_9fa48("6550") ? b.status && '' : stryMutAct_9fa48("6549") ? false : stryMutAct_9fa48("6548") ? true : (stryCov_9fa48("6548", "6549", "6550"), b.status || (stryMutAct_9fa48("6551") ? "Stryker was here!" : (stryCov_9fa48("6551"), '')));
                  break;
                }
              case stryMutAct_9fa48("6553") ? "" : (stryCov_9fa48("6553"), 'assessment'):
                if (stryMutAct_9fa48("6552")) {} else {
                  stryCov_9fa48("6552");
                  valueA = stryMutAct_9fa48("6556") ? (a.final_status || a.recommendation) && '' : stryMutAct_9fa48("6555") ? false : stryMutAct_9fa48("6554") ? true : (stryCov_9fa48("6554", "6555", "6556"), (stryMutAct_9fa48("6558") ? a.final_status && a.recommendation : stryMutAct_9fa48("6557") ? false : (stryCov_9fa48("6557", "6558"), a.final_status || a.recommendation)) || (stryMutAct_9fa48("6559") ? "Stryker was here!" : (stryCov_9fa48("6559"), '')));
                  valueB = stryMutAct_9fa48("6562") ? (b.final_status || b.recommendation) && '' : stryMutAct_9fa48("6561") ? false : stryMutAct_9fa48("6560") ? true : (stryCov_9fa48("6560", "6561", "6562"), (stryMutAct_9fa48("6564") ? b.final_status && b.recommendation : stryMutAct_9fa48("6563") ? false : (stryCov_9fa48("6563", "6564"), b.final_status || b.recommendation)) || (stryMutAct_9fa48("6565") ? "Stryker was here!" : (stryCov_9fa48("6565"), '')));
                  break;
                }
              case stryMutAct_9fa48("6567") ? "" : (stryCov_9fa48("6567"), 'info_session'):
                if (stryMutAct_9fa48("6566")) {} else {
                  stryCov_9fa48("6566");
                  valueA = stryMutAct_9fa48("6570") ? a.info_session_status && '' : stryMutAct_9fa48("6569") ? false : stryMutAct_9fa48("6568") ? true : (stryCov_9fa48("6568", "6569", "6570"), a.info_session_status || (stryMutAct_9fa48("6571") ? "Stryker was here!" : (stryCov_9fa48("6571"), '')));
                  valueB = stryMutAct_9fa48("6574") ? b.info_session_status && '' : stryMutAct_9fa48("6573") ? false : stryMutAct_9fa48("6572") ? true : (stryCov_9fa48("6572", "6573", "6574"), b.info_session_status || (stryMutAct_9fa48("6575") ? "Stryker was here!" : (stryCov_9fa48("6575"), '')));
                  break;
                }
              case stryMutAct_9fa48("6577") ? "" : (stryCov_9fa48("6577"), 'workshop'):
                if (stryMutAct_9fa48("6576")) {} else {
                  stryCov_9fa48("6576");
                  valueA = stryMutAct_9fa48("6580") ? a.workshop_status && '' : stryMutAct_9fa48("6579") ? false : stryMutAct_9fa48("6578") ? true : (stryCov_9fa48("6578", "6579", "6580"), a.workshop_status || (stryMutAct_9fa48("6581") ? "Stryker was here!" : (stryCov_9fa48("6581"), '')));
                  valueB = stryMutAct_9fa48("6584") ? b.workshop_status && '' : stryMutAct_9fa48("6583") ? false : stryMutAct_9fa48("6582") ? true : (stryCov_9fa48("6582", "6583", "6584"), b.workshop_status || (stryMutAct_9fa48("6585") ? "Stryker was here!" : (stryCov_9fa48("6585"), '')));
                  break;
                }
              case stryMutAct_9fa48("6586") ? "" : (stryCov_9fa48("6586"), 'created_at'):
              default:
                if (stryMutAct_9fa48("6587")) {} else {
                  stryCov_9fa48("6587");
                  valueA = new Date(a.created_at);
                  valueB = new Date(b.created_at);
                  break;
                }
            }
            if (stryMutAct_9fa48("6590") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("6589") ? false : stryMutAct_9fa48("6588") ? true : (stryCov_9fa48("6588", "6589", "6590"), columnSort.direction === (stryMutAct_9fa48("6591") ? "" : (stryCov_9fa48("6591"), 'asc')))) {
              if (stryMutAct_9fa48("6592")) {
                {}
              } else {
                stryCov_9fa48("6592");
                return (stryMutAct_9fa48("6596") ? valueA >= valueB : stryMutAct_9fa48("6595") ? valueA <= valueB : stryMutAct_9fa48("6594") ? false : stryMutAct_9fa48("6593") ? true : (stryCov_9fa48("6593", "6594", "6595", "6596"), valueA < valueB)) ? stryMutAct_9fa48("6597") ? +1 : (stryCov_9fa48("6597"), -1) : (stryMutAct_9fa48("6601") ? valueA <= valueB : stryMutAct_9fa48("6600") ? valueA >= valueB : stryMutAct_9fa48("6599") ? false : stryMutAct_9fa48("6598") ? true : (stryCov_9fa48("6598", "6599", "6600", "6601"), valueA > valueB)) ? 1 : 0;
              }
            } else {
              if (stryMutAct_9fa48("6602")) {
                {}
              } else {
                stryCov_9fa48("6602");
                return (stryMutAct_9fa48("6606") ? valueA <= valueB : stryMutAct_9fa48("6605") ? valueA >= valueB : stryMutAct_9fa48("6604") ? false : stryMutAct_9fa48("6603") ? true : (stryCov_9fa48("6603", "6604", "6605", "6606"), valueA > valueB)) ? stryMutAct_9fa48("6607") ? +1 : (stryCov_9fa48("6607"), -1) : (stryMutAct_9fa48("6611") ? valueA >= valueB : stryMutAct_9fa48("6610") ? valueA <= valueB : stryMutAct_9fa48("6609") ? false : stryMutAct_9fa48("6608") ? true : (stryCov_9fa48("6608", "6609", "6610", "6611"), valueA < valueB)) ? 1 : 0;
              }
            }
          }
        }));
      }
    };

    // Sort events by date (earliest to latest)
    const sortEventsByDate = events => {
      if (stryMutAct_9fa48("6612")) {
        {}
      } else {
        stryCov_9fa48("6612");
        if (stryMutAct_9fa48("6615") ? !events && !Array.isArray(events) : stryMutAct_9fa48("6614") ? false : stryMutAct_9fa48("6613") ? true : (stryCov_9fa48("6613", "6614", "6615"), (stryMutAct_9fa48("6616") ? events : (stryCov_9fa48("6616"), !events)) || (stryMutAct_9fa48("6617") ? Array.isArray(events) : (stryCov_9fa48("6617"), !Array.isArray(events))))) return events;
        return stryMutAct_9fa48("6618") ? [...events] : (stryCov_9fa48("6618"), (stryMutAct_9fa48("6619") ? [] : (stryCov_9fa48("6619"), [...events])).sort((a, b) => {
          if (stryMutAct_9fa48("6620")) {
            {}
          } else {
            stryCov_9fa48("6620");
            // Since event_date is in ISO format, just parse it directly
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);

            // For earliest to latest: smaller date - larger date gives negative (comes first)
            return stryMutAct_9fa48("6621") ? dateA.getTime() + dateB.getTime() : (stryCov_9fa48("6621"), dateA.getTime() - dateB.getTime());
          }
        }));
      }
    };

    // Filter events based on active status
    const getFilteredInfoSessions = () => {
      if (stryMutAct_9fa48("6622")) {
        {}
      } else {
        stryCov_9fa48("6622");
        if (stryMutAct_9fa48("6624") ? false : stryMutAct_9fa48("6623") ? true : (stryCov_9fa48("6623", "6624"), showInactiveInfoSessions)) {
          if (stryMutAct_9fa48("6625")) {
            {}
          } else {
            stryCov_9fa48("6625");
            return infoSessions; // Show all events
          }
        }
        return stryMutAct_9fa48("6626") ? infoSessions : (stryCov_9fa48("6626"), infoSessions.filter(stryMutAct_9fa48("6627") ? () => undefined : (stryCov_9fa48("6627"), session => session.is_active)));
      }
    };
    const getFilteredWorkshops = () => {
      if (stryMutAct_9fa48("6628")) {
        {}
      } else {
        stryCov_9fa48("6628");
        if (stryMutAct_9fa48("6630") ? false : stryMutAct_9fa48("6629") ? true : (stryCov_9fa48("6629", "6630"), showInactiveWorkshops)) {
          if (stryMutAct_9fa48("6631")) {
            {}
          } else {
            stryCov_9fa48("6631");
            return workshops; // Show all events
          }
        }
        return stryMutAct_9fa48("6632") ? workshops : (stryCov_9fa48("6632"), workshops.filter(stryMutAct_9fa48("6633") ? () => undefined : (stryCov_9fa48("6633"), workshop => workshop.is_active)));
      }
    };

    // Check if an event has passed
    const isEventPast = (eventDate, eventTime) => {
      if (stryMutAct_9fa48("6634")) {
        {}
      } else {
        stryCov_9fa48("6634");
        const eventDateTime = new Date(stryMutAct_9fa48("6635") ? `` : (stryCov_9fa48("6635"), `${eventDate} ${eventTime}`));
        return stryMutAct_9fa48("6639") ? eventDateTime >= new Date() : stryMutAct_9fa48("6638") ? eventDateTime <= new Date() : stryMutAct_9fa48("6637") ? false : stryMutAct_9fa48("6636") ? true : (stryCov_9fa48("6636", "6637", "6638", "6639"), eventDateTime < new Date());
      }
    };

    // Format time from 24-hour to 12-hour EST format
    const formatEventTime = timeString => {
      if (stryMutAct_9fa48("6640")) {
        {}
      } else {
        stryCov_9fa48("6640");
        try {
          if (stryMutAct_9fa48("6641")) {
            {}
          } else {
            stryCov_9fa48("6641");
            // Parse the time string (e.g., "17:30:00")
            const [hours, minutes] = timeString.split(stryMutAct_9fa48("6642") ? "" : (stryCov_9fa48("6642"), ':'));
            const date = new Date();
            stryMutAct_9fa48("6643") ? date.setMinutes(parseInt(hours), parseInt(minutes), 0, 0) : (stryCov_9fa48("6643"), date.setHours(parseInt(hours), parseInt(minutes), 0, 0));
            return date.toLocaleTimeString(stryMutAct_9fa48("6644") ? "" : (stryCov_9fa48("6644"), 'en-US'), stryMutAct_9fa48("6645") ? {} : (stryCov_9fa48("6645"), {
              hour: stryMutAct_9fa48("6646") ? "" : (stryCov_9fa48("6646"), 'numeric'),
              minute: stryMutAct_9fa48("6647") ? "" : (stryCov_9fa48("6647"), '2-digit'),
              timeZone: stryMutAct_9fa48("6648") ? "" : (stryCov_9fa48("6648"), 'America/New_York')
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("6649")) {
            {}
          } else {
            stryCov_9fa48("6649");
            console.error(stryMutAct_9fa48("6650") ? "" : (stryCov_9fa48("6650"), 'Error formatting time:'), error);
            return timeString; // Fallback to original
          }
        }
      }
    };

    // Format phone number to (000) 000-0000 format
    const formatPhoneNumber = phoneNumber => {
      if (stryMutAct_9fa48("6651")) {
        {}
      } else {
        stryCov_9fa48("6651");
        if (stryMutAct_9fa48("6654") ? false : stryMutAct_9fa48("6653") ? true : stryMutAct_9fa48("6652") ? phoneNumber : (stryCov_9fa48("6652", "6653", "6654"), !phoneNumber)) return stryMutAct_9fa48("6655") ? "" : (stryCov_9fa48("6655"), 'N/A');

        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(stryMutAct_9fa48("6656") ? /\d/g : (stryCov_9fa48("6656"), /\D/g), stryMutAct_9fa48("6657") ? "Stryker was here!" : (stryCov_9fa48("6657"), ''));

        // Check if it's a valid 10-digit US phone number
        if (stryMutAct_9fa48("6660") ? cleaned.length !== 10 : stryMutAct_9fa48("6659") ? false : stryMutAct_9fa48("6658") ? true : (stryCov_9fa48("6658", "6659", "6660"), cleaned.length === 10)) {
          if (stryMutAct_9fa48("6661")) {
            {}
          } else {
            stryCov_9fa48("6661");
            return stryMutAct_9fa48("6662") ? `` : (stryCov_9fa48("6662"), `(${stryMutAct_9fa48("6663") ? cleaned : (stryCov_9fa48("6663"), cleaned.substring(0, 3))})${stryMutAct_9fa48("6664") ? cleaned : (stryCov_9fa48("6664"), cleaned.substring(3, 6))}-${stryMutAct_9fa48("6665") ? cleaned : (stryCov_9fa48("6665"), cleaned.substring(6, 10))}`);
          }
        }

        // If not 10 digits, return the original value or 'Invalid'
        return stryMutAct_9fa48("6668") ? phoneNumber && 'N/A' : stryMutAct_9fa48("6667") ? false : stryMutAct_9fa48("6666") ? true : (stryCov_9fa48("6666", "6667", "6668"), phoneNumber || (stryMutAct_9fa48("6669") ? "" : (stryCov_9fa48("6669"), 'N/A')));
      }
    };

    // Copy text to clipboard with feedback
    const copyToClipboard = async (text, type) => {
      if (stryMutAct_9fa48("6670")) {
        {}
      } else {
        stryCov_9fa48("6670");
        try {
          if (stryMutAct_9fa48("6671")) {
            {}
          } else {
            stryCov_9fa48("6671");
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
            console.log(stryMutAct_9fa48("6672") ? `` : (stryCov_9fa48("6672"), `${type} copied to clipboard: ${text}`));
          }
        } catch (err) {
          if (stryMutAct_9fa48("6673")) {
            {}
          } else {
            stryCov_9fa48("6673");
            console.error(stryMutAct_9fa48("6674") ? "" : (stryCov_9fa48("6674"), 'Failed to copy to clipboard:'), err);
            // Fallback for older browsers
            const textArea = document.createElement(stryMutAct_9fa48("6675") ? "" : (stryCov_9fa48("6675"), 'textarea'));
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand(stryMutAct_9fa48("6676") ? "" : (stryCov_9fa48("6676"), 'copy'));
            document.body.removeChild(textArea);
          }
        }
      }
    };

    // Handle phone number click - copy raw digits
    const handlePhoneClick = phoneNumber => {
      if (stryMutAct_9fa48("6677")) {
        {}
      } else {
        stryCov_9fa48("6677");
        if (stryMutAct_9fa48("6680") ? !phoneNumber && phoneNumber === 'N/A' : stryMutAct_9fa48("6679") ? false : stryMutAct_9fa48("6678") ? true : (stryCov_9fa48("6678", "6679", "6680"), (stryMutAct_9fa48("6681") ? phoneNumber : (stryCov_9fa48("6681"), !phoneNumber)) || (stryMutAct_9fa48("6683") ? phoneNumber !== 'N/A' : stryMutAct_9fa48("6682") ? false : (stryCov_9fa48("6682", "6683"), phoneNumber === (stryMutAct_9fa48("6684") ? "" : (stryCov_9fa48("6684"), 'N/A')))))) return;
        const cleaned = phoneNumber.replace(stryMutAct_9fa48("6685") ? /\d/g : (stryCov_9fa48("6685"), /\D/g), stryMutAct_9fa48("6686") ? "Stryker was here!" : (stryCov_9fa48("6686"), ''));
        copyToClipboard(cleaned, stryMutAct_9fa48("6687") ? "" : (stryCov_9fa48("6687"), 'Phone number'));
      }
    };

    // Handle email click - copy email
    const handleEmailClick = email => {
      if (stryMutAct_9fa48("6688")) {
        {}
      } else {
        stryCov_9fa48("6688");
        if (stryMutAct_9fa48("6691") ? false : stryMutAct_9fa48("6690") ? true : stryMutAct_9fa48("6689") ? email : (stryCov_9fa48("6689", "6690", "6691"), !email)) return;
        copyToClipboard(email, stryMutAct_9fa48("6692") ? "" : (stryCov_9fa48("6692"), 'Email'));
      }
    };

    // Copy all emails for current event registrations
    const copyAllEmails = () => {
      if (stryMutAct_9fa48("6693")) {
        {}
      } else {
        stryCov_9fa48("6693");
        const emails = stryMutAct_9fa48("6694") ? eventRegistrations.map(reg => reg.email) : (stryCov_9fa48("6694"), eventRegistrations.filter(stryMutAct_9fa48("6695") ? () => undefined : (stryCov_9fa48("6695"), reg => stryMutAct_9fa48("6698") ? reg.email || reg.email.trim() !== '' : stryMutAct_9fa48("6697") ? false : stryMutAct_9fa48("6696") ? true : (stryCov_9fa48("6696", "6697", "6698"), reg.email && (stryMutAct_9fa48("6700") ? reg.email.trim() === '' : stryMutAct_9fa48("6699") ? true : (stryCov_9fa48("6699", "6700"), (stryMutAct_9fa48("6701") ? reg.email : (stryCov_9fa48("6701"), reg.email.trim())) !== (stryMutAct_9fa48("6702") ? "Stryker was here!" : (stryCov_9fa48("6702"), ''))))))).map(stryMutAct_9fa48("6703") ? () => undefined : (stryCov_9fa48("6703"), reg => reg.email)));
        if (stryMutAct_9fa48("6706") ? emails.length !== 0 : stryMutAct_9fa48("6705") ? false : stryMutAct_9fa48("6704") ? true : (stryCov_9fa48("6704", "6705", "6706"), emails.length === 0)) {
          if (stryMutAct_9fa48("6707")) {
            {}
          } else {
            stryCov_9fa48("6707");
            console.log(stryMutAct_9fa48("6708") ? "" : (stryCov_9fa48("6708"), 'No emails to copy'));
            return;
          }
        }
        const emailList = emails.join(stryMutAct_9fa48("6709") ? "" : (stryCov_9fa48("6709"), ', '));
        copyToClipboard(emailList, stryMutAct_9fa48("6710") ? `` : (stryCov_9fa48("6710"), `${emails.length} emails`));
      }
    };

    // Copy all phone numbers for current event registrations
    const copyAllPhoneNumbers = () => {
      if (stryMutAct_9fa48("6711")) {
        {}
      } else {
        stryCov_9fa48("6711");
        const phoneNumbers = stryMutAct_9fa48("6713") ? eventRegistrations.map(reg => reg.phone_number.replace(/\D/g, '')) // Remove formatting
        .filter(phone => phone.length === 10) : stryMutAct_9fa48("6712") ? eventRegistrations.filter(reg => reg.phone_number && reg.phone_number !== 'N/A' && reg.phone_number.trim() !== '').map(reg => reg.phone_number.replace(/\D/g, '')) // Remove formatting
        : (stryCov_9fa48("6712", "6713"), eventRegistrations.filter(stryMutAct_9fa48("6714") ? () => undefined : (stryCov_9fa48("6714"), reg => stryMutAct_9fa48("6717") ? reg.phone_number && reg.phone_number !== 'N/A' || reg.phone_number.trim() !== '' : stryMutAct_9fa48("6716") ? false : stryMutAct_9fa48("6715") ? true : (stryCov_9fa48("6715", "6716", "6717"), (stryMutAct_9fa48("6719") ? reg.phone_number || reg.phone_number !== 'N/A' : stryMutAct_9fa48("6718") ? true : (stryCov_9fa48("6718", "6719"), reg.phone_number && (stryMutAct_9fa48("6721") ? reg.phone_number === 'N/A' : stryMutAct_9fa48("6720") ? true : (stryCov_9fa48("6720", "6721"), reg.phone_number !== (stryMutAct_9fa48("6722") ? "" : (stryCov_9fa48("6722"), 'N/A')))))) && (stryMutAct_9fa48("6724") ? reg.phone_number.trim() === '' : stryMutAct_9fa48("6723") ? true : (stryCov_9fa48("6723", "6724"), (stryMutAct_9fa48("6725") ? reg.phone_number : (stryCov_9fa48("6725"), reg.phone_number.trim())) !== (stryMutAct_9fa48("6726") ? "Stryker was here!" : (stryCov_9fa48("6726"), ''))))))).map(stryMutAct_9fa48("6727") ? () => undefined : (stryCov_9fa48("6727"), reg => reg.phone_number.replace(stryMutAct_9fa48("6728") ? /\d/g : (stryCov_9fa48("6728"), /\D/g), stryMutAct_9fa48("6729") ? "Stryker was here!" : (stryCov_9fa48("6729"), '')))) // Remove formatting
        .filter(stryMutAct_9fa48("6730") ? () => undefined : (stryCov_9fa48("6730"), phone => stryMutAct_9fa48("6733") ? phone.length !== 10 : stryMutAct_9fa48("6732") ? false : stryMutAct_9fa48("6731") ? true : (stryCov_9fa48("6731", "6732", "6733"), phone.length === 10)))); // Only valid 10-digit numbers

        if (stryMutAct_9fa48("6736") ? phoneNumbers.length !== 0 : stryMutAct_9fa48("6735") ? false : stryMutAct_9fa48("6734") ? true : (stryCov_9fa48("6734", "6735", "6736"), phoneNumbers.length === 0)) {
          if (stryMutAct_9fa48("6737")) {
            {}
          } else {
            stryCov_9fa48("6737");
            console.log(stryMutAct_9fa48("6738") ? "" : (stryCov_9fa48("6738"), 'No valid phone numbers to copy'));
            return;
          }
        }
        const phoneList = phoneNumbers.join(stryMutAct_9fa48("6739") ? "" : (stryCov_9fa48("6739"), ', '));
        copyToClipboard(phoneList, stryMutAct_9fa48("6740") ? `` : (stryCov_9fa48("6740"), `${phoneNumbers.length} phone numbers`));
      }
    };

    // Handle CSV export for selected applicants
    const handleExportCSV = async () => {
      if (stryMutAct_9fa48("6741")) {
        {}
      } else {
        stryCov_9fa48("6741");
        if (stryMutAct_9fa48("6744") ? selectedApplicants.length !== 0 : stryMutAct_9fa48("6743") ? false : stryMutAct_9fa48("6742") ? true : (stryCov_9fa48("6742", "6743", "6744"), selectedApplicants.length === 0)) return;
        try {
          if (stryMutAct_9fa48("6745")) {
            {}
          } else {
            stryCov_9fa48("6745");
            setLoading(stryMutAct_9fa48("6746") ? false : (stryCov_9fa48("6746"), true));

            // Get the full details of selected applicants including demographic data
            const selectedApplicantIds = selectedApplicants.join(stryMutAct_9fa48("6747") ? "" : (stryCov_9fa48("6747"), ','));
            const response = await fetch(stryMutAct_9fa48("6748") ? `` : (stryCov_9fa48("6748"), `${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${selectedApplicantIds}`), stryMutAct_9fa48("6749") ? {} : (stryCov_9fa48("6749"), {
              headers: stryMutAct_9fa48("6750") ? {} : (stryCov_9fa48("6750"), {
                'Authorization': stryMutAct_9fa48("6751") ? `` : (stryCov_9fa48("6751"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("6752") ? "" : (stryCov_9fa48("6752"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("6755") ? false : stryMutAct_9fa48("6754") ? true : stryMutAct_9fa48("6753") ? response.ok : (stryCov_9fa48("6753", "6754", "6755"), !response.ok)) {
              if (stryMutAct_9fa48("6756")) {
                {}
              } else {
                stryCov_9fa48("6756");
                throw new Error(stryMutAct_9fa48("6757") ? "" : (stryCov_9fa48("6757"), 'Failed to fetch detailed applicant data'));
              }
            }
            const detailedApplicantData = await response.json();
            if (stryMutAct_9fa48("6760") ? !detailedApplicantData && detailedApplicantData.length === 0 : stryMutAct_9fa48("6759") ? false : stryMutAct_9fa48("6758") ? true : (stryCov_9fa48("6758", "6759", "6760"), (stryMutAct_9fa48("6761") ? detailedApplicantData : (stryCov_9fa48("6761"), !detailedApplicantData)) || (stryMutAct_9fa48("6763") ? detailedApplicantData.length !== 0 : stryMutAct_9fa48("6762") ? false : (stryCov_9fa48("6762", "6763"), detailedApplicantData.length === 0)))) {
              if (stryMutAct_9fa48("6764")) {
                {}
              } else {
                stryCov_9fa48("6764");
                console.error(stryMutAct_9fa48("6765") ? "" : (stryCov_9fa48("6765"), 'No data found for selected applicants'));
                setError(stryMutAct_9fa48("6766") ? "" : (stryCov_9fa48("6766"), 'No data found for selected applicants'));
                return;
              }
            }

            // Debug: Log the data we're getting from the API
            console.log(stryMutAct_9fa48("6767") ? "" : (stryCov_9fa48("6767"), 'Detailed applicant data:'), detailedApplicantData);

            // Check if we have demographic data
            const hasDemographics = stryMutAct_9fa48("6768") ? detailedApplicantData.every(app => app.demographics && Object.keys(app.demographics).some(key => app.demographics[key])) : (stryCov_9fa48("6768"), detailedApplicantData.some(stryMutAct_9fa48("6769") ? () => undefined : (stryCov_9fa48("6769"), app => stryMutAct_9fa48("6772") ? app.demographics || Object.keys(app.demographics).some(key => app.demographics[key]) : stryMutAct_9fa48("6771") ? false : stryMutAct_9fa48("6770") ? true : (stryCov_9fa48("6770", "6771", "6772"), app.demographics && (stryMutAct_9fa48("6773") ? Object.keys(app.demographics).every(key => app.demographics[key]) : (stryCov_9fa48("6773"), Object.keys(app.demographics).some(stryMutAct_9fa48("6774") ? () => undefined : (stryCov_9fa48("6774"), key => app.demographics[key]))))))));
            console.log(stryMutAct_9fa48("6775") ? "" : (stryCov_9fa48("6775"), 'Has any demographic data:'), hasDemographics);
            if (stryMutAct_9fa48("6779") ? detailedApplicantData.length <= 0 : stryMutAct_9fa48("6778") ? detailedApplicantData.length >= 0 : stryMutAct_9fa48("6777") ? false : stryMutAct_9fa48("6776") ? true : (stryCov_9fa48("6776", "6777", "6778", "6779"), detailedApplicantData.length > 0)) {
              if (stryMutAct_9fa48("6780")) {
                {}
              } else {
                stryCov_9fa48("6780");
                console.log(stryMutAct_9fa48("6781") ? "" : (stryCov_9fa48("6781"), 'First applicant demographics:'), detailedApplicantData[0].demographics);
              }
            }

            // Define CSV headers based on available data
            const headers = stryMutAct_9fa48("6782") ? [] : (stryCov_9fa48("6782"), [stryMutAct_9fa48("6783") ? "" : (stryCov_9fa48("6783"), 'Applicant ID'), stryMutAct_9fa48("6784") ? "" : (stryCov_9fa48("6784"), 'First Name'), stryMutAct_9fa48("6785") ? "" : (stryCov_9fa48("6785"), 'Last Name'), stryMutAct_9fa48("6786") ? "" : (stryCov_9fa48("6786"), 'Email'), stryMutAct_9fa48("6787") ? "" : (stryCov_9fa48("6787"), 'Phone Number'), stryMutAct_9fa48("6788") ? "" : (stryCov_9fa48("6788"), 'Application Status'), stryMutAct_9fa48("6789") ? "" : (stryCov_9fa48("6789"), 'Assessment'), stryMutAct_9fa48("6790") ? "" : (stryCov_9fa48("6790"), 'Info Session Status'), stryMutAct_9fa48("6791") ? "" : (stryCov_9fa48("6791"), 'Workshop Status'), stryMutAct_9fa48("6792") ? "" : (stryCov_9fa48("6792"), 'Program Admission Status'), stryMutAct_9fa48("6793") ? "" : (stryCov_9fa48("6793"), 'Date of Birth'), stryMutAct_9fa48("6794") ? "" : (stryCov_9fa48("6794"), 'Address'), stryMutAct_9fa48("6795") ? "" : (stryCov_9fa48("6795"), 'Gender'), stryMutAct_9fa48("6796") ? "" : (stryCov_9fa48("6796"), 'Personal Annual Income'), stryMutAct_9fa48("6797") ? "" : (stryCov_9fa48("6797"), 'Educational Attainment'), stryMutAct_9fa48("6798") ? "" : (stryCov_9fa48("6798"), 'First-Generation College Student'), stryMutAct_9fa48("6799") ? "" : (stryCov_9fa48("6799"), 'Race/Ethnicity'), stryMutAct_9fa48("6800") ? "" : (stryCov_9fa48("6800"), 'English as Secondary Language'), stryMutAct_9fa48("6801") ? "" : (stryCov_9fa48("6801"), 'Born Outside US'), stryMutAct_9fa48("6802") ? "" : (stryCov_9fa48("6802"), 'Parents Born Outside US'), stryMutAct_9fa48("6803") ? "" : (stryCov_9fa48("6803"), 'Government Assistance'), stryMutAct_9fa48("6804") ? "" : (stryCov_9fa48("6804"), 'Veteran Status'), stryMutAct_9fa48("6805") ? "" : (stryCov_9fa48("6805"), 'Communities'), stryMutAct_9fa48("6806") ? "" : (stryCov_9fa48("6806"), 'Employment Status'), stryMutAct_9fa48("6807") ? "" : (stryCov_9fa48("6807"), 'Reason for Applying')]);

            // Create CSV content
            let csvContent = headers.join(stryMutAct_9fa48("6808") ? "" : (stryCov_9fa48("6808"), ',')) + (stryMutAct_9fa48("6809") ? "" : (stryCov_9fa48("6809"), '\n'));

            // Add data rows
            detailedApplicantData.forEach(applicant => {
              if (stryMutAct_9fa48("6810")) {
                {}
              } else {
                stryCov_9fa48("6810");
                // Extract demographic data - safely handle missing fields
                const demographics = stryMutAct_9fa48("6813") ? applicant.demographics && {} : stryMutAct_9fa48("6812") ? false : stryMutAct_9fa48("6811") ? true : (stryCov_9fa48("6811", "6812", "6813"), applicant.demographics || {});
                const row = stryMutAct_9fa48("6814") ? [] : (stryCov_9fa48("6814"), [applicant.applicant_id, stryMutAct_9fa48("6815") ? `` : (stryCov_9fa48("6815"), `"${(stryMutAct_9fa48("6818") ? applicant.first_name && '' : stryMutAct_9fa48("6817") ? false : stryMutAct_9fa48("6816") ? true : (stryCov_9fa48("6816", "6817", "6818"), applicant.first_name || (stryMutAct_9fa48("6819") ? "Stryker was here!" : (stryCov_9fa48("6819"), '')))).replace(/"/g, stryMutAct_9fa48("6820") ? "" : (stryCov_9fa48("6820"), '""'))}"`), // Escape quotes in CSV
                stryMutAct_9fa48("6821") ? `` : (stryCov_9fa48("6821"), `"${(stryMutAct_9fa48("6824") ? applicant.last_name && '' : stryMutAct_9fa48("6823") ? false : stryMutAct_9fa48("6822") ? true : (stryCov_9fa48("6822", "6823", "6824"), applicant.last_name || (stryMutAct_9fa48("6825") ? "Stryker was here!" : (stryCov_9fa48("6825"), '')))).replace(/"/g, stryMutAct_9fa48("6826") ? "" : (stryCov_9fa48("6826"), '""'))}"`), stryMutAct_9fa48("6827") ? `` : (stryCov_9fa48("6827"), `"${(stryMutAct_9fa48("6830") ? applicant.email && '' : stryMutAct_9fa48("6829") ? false : stryMutAct_9fa48("6828") ? true : (stryCov_9fa48("6828", "6829", "6830"), applicant.email || (stryMutAct_9fa48("6831") ? "Stryker was here!" : (stryCov_9fa48("6831"), '')))).replace(/"/g, stryMutAct_9fa48("6832") ? "" : (stryCov_9fa48("6832"), '""'))}"`), stryMutAct_9fa48("6833") ? `` : (stryCov_9fa48("6833"), `"${(stryMutAct_9fa48("6836") ? applicant.phone_number && '' : stryMutAct_9fa48("6835") ? false : stryMutAct_9fa48("6834") ? true : (stryCov_9fa48("6834", "6835", "6836"), applicant.phone_number || (stryMutAct_9fa48("6837") ? "Stryker was here!" : (stryCov_9fa48("6837"), '')))).replace(/"/g, stryMutAct_9fa48("6838") ? "" : (stryCov_9fa48("6838"), '""'))}"`), stryMutAct_9fa48("6839") ? `` : (stryCov_9fa48("6839"), `"${(stryMutAct_9fa48("6842") ? applicant.status && '' : stryMutAct_9fa48("6841") ? false : stryMutAct_9fa48("6840") ? true : (stryCov_9fa48("6840", "6841", "6842"), applicant.status || (stryMutAct_9fa48("6843") ? "Stryker was here!" : (stryCov_9fa48("6843"), '')))).replace(/"/g, stryMutAct_9fa48("6844") ? "" : (stryCov_9fa48("6844"), '""'))}"`), stryMutAct_9fa48("6845") ? `` : (stryCov_9fa48("6845"), `"${(stryMutAct_9fa48("6848") ? (applicant.final_status || applicant.recommendation) && '' : stryMutAct_9fa48("6847") ? false : stryMutAct_9fa48("6846") ? true : (stryCov_9fa48("6846", "6847", "6848"), (stryMutAct_9fa48("6850") ? applicant.final_status && applicant.recommendation : stryMutAct_9fa48("6849") ? false : (stryCov_9fa48("6849", "6850"), applicant.final_status || applicant.recommendation)) || (stryMutAct_9fa48("6851") ? "Stryker was here!" : (stryCov_9fa48("6851"), '')))).replace(/"/g, stryMutAct_9fa48("6852") ? "" : (stryCov_9fa48("6852"), '""'))}"`), stryMutAct_9fa48("6853") ? `` : (stryCov_9fa48("6853"), `"${(stryMutAct_9fa48("6856") ? applicant.info_session_status && 'not_registered' : stryMutAct_9fa48("6855") ? false : stryMutAct_9fa48("6854") ? true : (stryCov_9fa48("6854", "6855", "6856"), applicant.info_session_status || (stryMutAct_9fa48("6857") ? "" : (stryCov_9fa48("6857"), 'not_registered')))).replace(/"/g, stryMutAct_9fa48("6858") ? "" : (stryCov_9fa48("6858"), '""'))}"`), stryMutAct_9fa48("6859") ? `` : (stryCov_9fa48("6859"), `"${(stryMutAct_9fa48("6862") ? applicant.workshop_status && 'pending' : stryMutAct_9fa48("6861") ? false : stryMutAct_9fa48("6860") ? true : (stryCov_9fa48("6860", "6861", "6862"), applicant.workshop_status || (stryMutAct_9fa48("6863") ? "" : (stryCov_9fa48("6863"), 'pending')))).replace(/"/g, stryMutAct_9fa48("6864") ? "" : (stryCov_9fa48("6864"), '""'))}"`), stryMutAct_9fa48("6865") ? `` : (stryCov_9fa48("6865"), `"${(stryMutAct_9fa48("6868") ? applicant.program_admission_status && 'pending' : stryMutAct_9fa48("6867") ? false : stryMutAct_9fa48("6866") ? true : (stryCov_9fa48("6866", "6867", "6868"), applicant.program_admission_status || (stryMutAct_9fa48("6869") ? "" : (stryCov_9fa48("6869"), 'pending')))).replace(/"/g, stryMutAct_9fa48("6870") ? "" : (stryCov_9fa48("6870"), '""'))}"`), stryMutAct_9fa48("6871") ? `` : (stryCov_9fa48("6871"), `"${(stryMutAct_9fa48("6874") ? demographics.date_of_birth && '' : stryMutAct_9fa48("6873") ? false : stryMutAct_9fa48("6872") ? true : (stryCov_9fa48("6872", "6873", "6874"), demographics.date_of_birth || (stryMutAct_9fa48("6875") ? "Stryker was here!" : (stryCov_9fa48("6875"), '')))).replace(/"/g, stryMutAct_9fa48("6876") ? "" : (stryCov_9fa48("6876"), '""'))}"`), stryMutAct_9fa48("6877") ? `` : (stryCov_9fa48("6877"), `"${(stryMutAct_9fa48("6880") ? demographics.address && '' : stryMutAct_9fa48("6879") ? false : stryMutAct_9fa48("6878") ? true : (stryCov_9fa48("6878", "6879", "6880"), demographics.address || (stryMutAct_9fa48("6881") ? "Stryker was here!" : (stryCov_9fa48("6881"), '')))).replace(/"/g, stryMutAct_9fa48("6882") ? "" : (stryCov_9fa48("6882"), '""'))}"`), stryMutAct_9fa48("6883") ? `` : (stryCov_9fa48("6883"), `"${(stryMutAct_9fa48("6886") ? demographics.gender && '' : stryMutAct_9fa48("6885") ? false : stryMutAct_9fa48("6884") ? true : (stryCov_9fa48("6884", "6885", "6886"), demographics.gender || (stryMutAct_9fa48("6887") ? "Stryker was here!" : (stryCov_9fa48("6887"), '')))).replace(/"/g, stryMutAct_9fa48("6888") ? "" : (stryCov_9fa48("6888"), '""'))}"`), stryMutAct_9fa48("6889") ? `` : (stryCov_9fa48("6889"), `"${(stryMutAct_9fa48("6892") ? demographics.personal_income && '' : stryMutAct_9fa48("6891") ? false : stryMutAct_9fa48("6890") ? true : (stryCov_9fa48("6890", "6891", "6892"), demographics.personal_income || (stryMutAct_9fa48("6893") ? "Stryker was here!" : (stryCov_9fa48("6893"), '')))).replace(/"/g, stryMutAct_9fa48("6894") ? "" : (stryCov_9fa48("6894"), '""'))}"`), stryMutAct_9fa48("6895") ? `` : (stryCov_9fa48("6895"), `"${(stryMutAct_9fa48("6898") ? demographics.education_level && '' : stryMutAct_9fa48("6897") ? false : stryMutAct_9fa48("6896") ? true : (stryCov_9fa48("6896", "6897", "6898"), demographics.education_level || (stryMutAct_9fa48("6899") ? "Stryker was here!" : (stryCov_9fa48("6899"), '')))).replace(/"/g, stryMutAct_9fa48("6900") ? "" : (stryCov_9fa48("6900"), '""'))}"`), stryMutAct_9fa48("6901") ? `` : (stryCov_9fa48("6901"), `"${(stryMutAct_9fa48("6904") ? demographics.first_gen_college && '' : stryMutAct_9fa48("6903") ? false : stryMutAct_9fa48("6902") ? true : (stryCov_9fa48("6902", "6903", "6904"), demographics.first_gen_college || (stryMutAct_9fa48("6905") ? "Stryker was here!" : (stryCov_9fa48("6905"), '')))).replace(/"/g, stryMutAct_9fa48("6906") ? "" : (stryCov_9fa48("6906"), '""'))}"`), stryMutAct_9fa48("6907") ? `` : (stryCov_9fa48("6907"), `"${(stryMutAct_9fa48("6910") ? demographics.race_ethnicity && '' : stryMutAct_9fa48("6909") ? false : stryMutAct_9fa48("6908") ? true : (stryCov_9fa48("6908", "6909", "6910"), demographics.race_ethnicity || (stryMutAct_9fa48("6911") ? "Stryker was here!" : (stryCov_9fa48("6911"), '')))).replace(/"/g, stryMutAct_9fa48("6912") ? "" : (stryCov_9fa48("6912"), '""')).replace(stryMutAct_9fa48("6913") ? /[^\[\]]/g : (stryCov_9fa48("6913"), /[\[\]]/g), stryMutAct_9fa48("6914") ? "Stryker was here!" : (stryCov_9fa48("6914"), ''))}"`), stryMutAct_9fa48("6915") ? `` : (stryCov_9fa48("6915"), `"${(stryMutAct_9fa48("6918") ? demographics.english_secondary && '' : stryMutAct_9fa48("6917") ? false : stryMutAct_9fa48("6916") ? true : (stryCov_9fa48("6916", "6917", "6918"), demographics.english_secondary || (stryMutAct_9fa48("6919") ? "Stryker was here!" : (stryCov_9fa48("6919"), '')))).replace(/"/g, stryMutAct_9fa48("6920") ? "" : (stryCov_9fa48("6920"), '""'))}"`), stryMutAct_9fa48("6921") ? `` : (stryCov_9fa48("6921"), `"${(stryMutAct_9fa48("6924") ? demographics.born_outside_us && '' : stryMutAct_9fa48("6923") ? false : stryMutAct_9fa48("6922") ? true : (stryCov_9fa48("6922", "6923", "6924"), demographics.born_outside_us || (stryMutAct_9fa48("6925") ? "Stryker was here!" : (stryCov_9fa48("6925"), '')))).replace(/"/g, stryMutAct_9fa48("6926") ? "" : (stryCov_9fa48("6926"), '""'))}"`), stryMutAct_9fa48("6927") ? `` : (stryCov_9fa48("6927"), `"${(stryMutAct_9fa48("6930") ? demographics.parents_born_outside_us && '' : stryMutAct_9fa48("6929") ? false : stryMutAct_9fa48("6928") ? true : (stryCov_9fa48("6928", "6929", "6930"), demographics.parents_born_outside_us || (stryMutAct_9fa48("6931") ? "Stryker was here!" : (stryCov_9fa48("6931"), '')))).replace(/"/g, stryMutAct_9fa48("6932") ? "" : (stryCov_9fa48("6932"), '""'))}"`), stryMutAct_9fa48("6933") ? `` : (stryCov_9fa48("6933"), `"${(stryMutAct_9fa48("6936") ? demographics.govt_assistance && '' : stryMutAct_9fa48("6935") ? false : stryMutAct_9fa48("6934") ? true : (stryCov_9fa48("6934", "6935", "6936"), demographics.govt_assistance || (stryMutAct_9fa48("6937") ? "Stryker was here!" : (stryCov_9fa48("6937"), '')))).replace(/"/g, stryMutAct_9fa48("6938") ? "" : (stryCov_9fa48("6938"), '""'))}"`), stryMutAct_9fa48("6939") ? `` : (stryCov_9fa48("6939"), `"${(stryMutAct_9fa48("6942") ? demographics.veteran && '' : stryMutAct_9fa48("6941") ? false : stryMutAct_9fa48("6940") ? true : (stryCov_9fa48("6940", "6941", "6942"), demographics.veteran || (stryMutAct_9fa48("6943") ? "Stryker was here!" : (stryCov_9fa48("6943"), '')))).replace(/"/g, stryMutAct_9fa48("6944") ? "" : (stryCov_9fa48("6944"), '""'))}"`), stryMutAct_9fa48("6945") ? `` : (stryCov_9fa48("6945"), `"${(stryMutAct_9fa48("6948") ? demographics.communities && '' : stryMutAct_9fa48("6947") ? false : stryMutAct_9fa48("6946") ? true : (stryCov_9fa48("6946", "6947", "6948"), demographics.communities || (stryMutAct_9fa48("6949") ? "Stryker was here!" : (stryCov_9fa48("6949"), '')))).replace(/"/g, stryMutAct_9fa48("6950") ? "" : (stryCov_9fa48("6950"), '""'))}"`), stryMutAct_9fa48("6951") ? `` : (stryCov_9fa48("6951"), `"${(stryMutAct_9fa48("6954") ? demographics.employment_status && '' : stryMutAct_9fa48("6953") ? false : stryMutAct_9fa48("6952") ? true : (stryCov_9fa48("6952", "6953", "6954"), demographics.employment_status || (stryMutAct_9fa48("6955") ? "Stryker was here!" : (stryCov_9fa48("6955"), '')))).replace(/"/g, stryMutAct_9fa48("6956") ? "" : (stryCov_9fa48("6956"), '""'))}"`), stryMutAct_9fa48("6957") ? `` : (stryCov_9fa48("6957"), `"${(stryMutAct_9fa48("6960") ? demographics.reason_for_applying && '' : stryMutAct_9fa48("6959") ? false : stryMutAct_9fa48("6958") ? true : (stryCov_9fa48("6958", "6959", "6960"), demographics.reason_for_applying || (stryMutAct_9fa48("6961") ? "Stryker was here!" : (stryCov_9fa48("6961"), '')))).replace(/"/g, stryMutAct_9fa48("6962") ? "" : (stryCov_9fa48("6962"), '""'))}"`)]);
                stryMutAct_9fa48("6963") ? csvContent -= row.join(',') + '\n' : (stryCov_9fa48("6963"), csvContent += row.join(stryMutAct_9fa48("6964") ? "" : (stryCov_9fa48("6964"), ',')) + (stryMutAct_9fa48("6965") ? "" : (stryCov_9fa48("6965"), '\n')));
              }
            });

            // Create a blob and download link
            const blob = new Blob(stryMutAct_9fa48("6966") ? [] : (stryCov_9fa48("6966"), [csvContent]), stryMutAct_9fa48("6967") ? {} : (stryCov_9fa48("6967"), {
              type: stryMutAct_9fa48("6968") ? "" : (stryCov_9fa48("6968"), 'text/csv;charset=utf-8;')
            }));
            const url = URL.createObjectURL(blob);
            const link = document.createElement(stryMutAct_9fa48("6969") ? "" : (stryCov_9fa48("6969"), 'a'));
            link.setAttribute(stryMutAct_9fa48("6970") ? "" : (stryCov_9fa48("6970"), 'href'), url);
            link.setAttribute(stryMutAct_9fa48("6971") ? "" : (stryCov_9fa48("6971"), 'download'), stryMutAct_9fa48("6972") ? `` : (stryCov_9fa48("6972"), `applicants_export_${new Date().toISOString().split(stryMutAct_9fa48("6973") ? "" : (stryCov_9fa48("6973"), 'T'))[0]}.csv`));
            link.style.visibility = stryMutAct_9fa48("6974") ? "" : (stryCov_9fa48("6974"), 'hidden');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (error) {
          if (stryMutAct_9fa48("6975")) {
            {}
          } else {
            stryCov_9fa48("6975");
            console.error(stryMutAct_9fa48("6976") ? "" : (stryCov_9fa48("6976"), 'Error exporting CSV:'), error);
            setError(stryMutAct_9fa48("6977") ? "" : (stryCov_9fa48("6977"), 'Failed to export CSV. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("6978")) {
            {}
          } else {
            stryCov_9fa48("6978");
            setLoading(stryMutAct_9fa48("6979") ? true : (stryCov_9fa48("6979"), false));
          }
        }
      }
    };

    // Info session modal management
    const openCreateInfoSessionModal = () => {
      if (stryMutAct_9fa48("6980")) {
        {}
      } else {
        stryCov_9fa48("6980");
        // Reset form to default values
        setInfoSessionForm(stryMutAct_9fa48("6981") ? {} : (stryCov_9fa48("6981"), {
          title: stryMutAct_9fa48("6982") ? "Stryker was here!" : (stryCov_9fa48("6982"), ''),
          description: stryMutAct_9fa48("6983") ? "" : (stryCov_9fa48("6983"), 'Information session about Pursuit programs'),
          start_time: stryMutAct_9fa48("6984") ? "Stryker was here!" : (stryCov_9fa48("6984"), ''),
          end_time: stryMutAct_9fa48("6985") ? "Stryker was here!" : (stryCov_9fa48("6985"), ''),
          location: stryMutAct_9fa48("6986") ? "" : (stryCov_9fa48("6986"), 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY'),
          capacity: 50,
          is_online: stryMutAct_9fa48("6987") ? true : (stryCov_9fa48("6987"), false),
          meeting_link: stryMutAct_9fa48("6988") ? "Stryker was here!" : (stryCov_9fa48("6988"), '')
        }));
        setEditingInfoSession(null);
        setInfoSessionModalOpen(stryMutAct_9fa48("6989") ? false : (stryCov_9fa48("6989"), true));
      }
    };
    const openEditInfoSessionModal = session => {
      if (stryMutAct_9fa48("6990")) {
        {}
      } else {
        stryCov_9fa48("6990");
        // Format date and time for datetime-local input
        const startTime = new Date(session.start_time);
        const endTime = new Date(stryMutAct_9fa48("6993") ? session.end_time && session.start_time : stryMutAct_9fa48("6992") ? false : stryMutAct_9fa48("6991") ? true : (stryCov_9fa48("6991", "6992", "6993"), session.end_time || session.start_time));

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = date => {
          if (stryMutAct_9fa48("6994")) {
            {}
          } else {
            stryCov_9fa48("6994");
            return stryMutAct_9fa48("6995") ? date.toISOString() : (stryCov_9fa48("6995"), date.toISOString().slice(0, 16));
          }
        };
        setInfoSessionForm(stryMutAct_9fa48("6996") ? {} : (stryCov_9fa48("6996"), {
          title: session.event_name,
          description: stryMutAct_9fa48("6999") ? session.description && '' : stryMutAct_9fa48("6998") ? false : stryMutAct_9fa48("6997") ? true : (stryCov_9fa48("6997", "6998", "6999"), session.description || (stryMutAct_9fa48("7000") ? "Stryker was here!" : (stryCov_9fa48("7000"), ''))),
          start_time: formatDateForInput(startTime),
          end_time: formatDateForInput(endTime),
          location: stryMutAct_9fa48("7003") ? session.location && '' : stryMutAct_9fa48("7002") ? false : stryMutAct_9fa48("7001") ? true : (stryCov_9fa48("7001", "7002", "7003"), session.location || (stryMutAct_9fa48("7004") ? "Stryker was here!" : (stryCov_9fa48("7004"), ''))),
          capacity: stryMutAct_9fa48("7007") ? session.capacity && 50 : stryMutAct_9fa48("7006") ? false : stryMutAct_9fa48("7005") ? true : (stryCov_9fa48("7005", "7006", "7007"), session.capacity || 50),
          is_online: stryMutAct_9fa48("7010") ? session.is_online && false : stryMutAct_9fa48("7009") ? false : stryMutAct_9fa48("7008") ? true : (stryCov_9fa48("7008", "7009", "7010"), session.is_online || (stryMutAct_9fa48("7011") ? true : (stryCov_9fa48("7011"), false))),
          meeting_link: stryMutAct_9fa48("7014") ? session.meeting_link && '' : stryMutAct_9fa48("7013") ? false : stryMutAct_9fa48("7012") ? true : (stryCov_9fa48("7012", "7013", "7014"), session.meeting_link || (stryMutAct_9fa48("7015") ? "Stryker was here!" : (stryCov_9fa48("7015"), ''))),
          status: stryMutAct_9fa48("7018") ? session.status && 'scheduled' : stryMutAct_9fa48("7017") ? false : stryMutAct_9fa48("7016") ? true : (stryCov_9fa48("7016", "7017", "7018"), session.status || (stryMutAct_9fa48("7019") ? "" : (stryCov_9fa48("7019"), 'scheduled')))
        }));
        setEditingInfoSession(session.event_id);
        setInfoSessionModalOpen(stryMutAct_9fa48("7020") ? false : (stryCov_9fa48("7020"), true));
      }
    };
    const closeInfoSessionModal = () => {
      if (stryMutAct_9fa48("7021")) {
        {}
      } else {
        stryCov_9fa48("7021");
        setInfoSessionModalOpen(stryMutAct_9fa48("7022") ? true : (stryCov_9fa48("7022"), false));
        setEditingInfoSession(null);
      }
    };
    const handleInfoSessionFormChange = e => {
      if (stryMutAct_9fa48("7023")) {
        {}
      } else {
        stryCov_9fa48("7023");
        const {
          name,
          value,
          type,
          checked
        } = e.target;
        setInfoSessionForm(stryMutAct_9fa48("7024") ? () => undefined : (stryCov_9fa48("7024"), prev => stryMutAct_9fa48("7025") ? {} : (stryCov_9fa48("7025"), {
          ...prev,
          [name]: (stryMutAct_9fa48("7028") ? type !== 'checkbox' : stryMutAct_9fa48("7027") ? false : stryMutAct_9fa48("7026") ? true : (stryCov_9fa48("7026", "7027", "7028"), type === (stryMutAct_9fa48("7029") ? "" : (stryCov_9fa48("7029"), 'checkbox')))) ? checked : value
        })));
      }
    };
    const handleInfoSessionSubmit = async e => {
      if (stryMutAct_9fa48("7030")) {
        {}
      } else {
        stryCov_9fa48("7030");
        e.preventDefault();
        setInfoSessionSubmitting(stryMutAct_9fa48("7031") ? false : (stryCov_9fa48("7031"), true));
        try {
          if (stryMutAct_9fa48("7032")) {
            {}
          } else {
            stryCov_9fa48("7032");
            const endpoint = editingInfoSession ? stryMutAct_9fa48("7033") ? `` : (stryCov_9fa48("7033"), `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${editingInfoSession}`) : stryMutAct_9fa48("7034") ? `` : (stryCov_9fa48("7034"), `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`);
            const method = editingInfoSession ? stryMutAct_9fa48("7035") ? "" : (stryCov_9fa48("7035"), 'PUT') : stryMutAct_9fa48("7036") ? "" : (stryCov_9fa48("7036"), 'POST');
            const response = await fetch(endpoint, stryMutAct_9fa48("7037") ? {} : (stryCov_9fa48("7037"), {
              method,
              headers: stryMutAct_9fa48("7038") ? {} : (stryCov_9fa48("7038"), {
                'Content-Type': stryMutAct_9fa48("7039") ? "" : (stryCov_9fa48("7039"), 'application/json'),
                'Authorization': stryMutAct_9fa48("7040") ? `` : (stryCov_9fa48("7040"), `Bearer ${token}`)
              }),
              body: JSON.stringify(infoSessionForm)
            }));
            if (stryMutAct_9fa48("7043") ? false : stryMutAct_9fa48("7042") ? true : stryMutAct_9fa48("7041") ? response.ok : (stryCov_9fa48("7041", "7042", "7043"), !response.ok)) {
              if (stryMutAct_9fa48("7044")) {
                {}
              } else {
                stryCov_9fa48("7044");
                throw new Error(stryMutAct_9fa48("7045") ? `` : (stryCov_9fa48("7045"), `Failed to ${editingInfoSession ? stryMutAct_9fa48("7046") ? "" : (stryCov_9fa48("7046"), 'update') : stryMutAct_9fa48("7047") ? "" : (stryCov_9fa48("7047"), 'create')} info session`));
              }
            }

            // Refresh info sessions list
            await fetchInfoSessions();
            closeInfoSessionModal();
          }
        } catch (error) {
          if (stryMutAct_9fa48("7048")) {
            {}
          } else {
            stryCov_9fa48("7048");
            console.error(stryMutAct_9fa48("7049") ? "" : (stryCov_9fa48("7049"), 'Error submitting info session:'), error);
            setError(stryMutAct_9fa48("7050") ? `` : (stryCov_9fa48("7050"), `Failed to ${editingInfoSession ? stryMutAct_9fa48("7051") ? "" : (stryCov_9fa48("7051"), 'update') : stryMutAct_9fa48("7052") ? "" : (stryCov_9fa48("7052"), 'create')} info session. ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("7053")) {
            {}
          } else {
            stryCov_9fa48("7053");
            setInfoSessionSubmitting(stryMutAct_9fa48("7054") ? true : (stryCov_9fa48("7054"), false));
          }
        }
      }
    };

    // Workshop modal management
    const openCreateWorkshopModal = () => {
      if (stryMutAct_9fa48("7055")) {
        {}
      } else {
        stryCov_9fa48("7055");
        // Reset form to default values
        setWorkshopForm(stryMutAct_9fa48("7056") ? {} : (stryCov_9fa48("7056"), {
          title: stryMutAct_9fa48("7057") ? "Stryker was here!" : (stryCov_9fa48("7057"), ''),
          description: stryMutAct_9fa48("7058") ? "" : (stryCov_9fa48("7058"), 'Workshop about Pursuit programs and tech careers'),
          start_time: stryMutAct_9fa48("7059") ? "Stryker was here!" : (stryCov_9fa48("7059"), ''),
          end_time: stryMutAct_9fa48("7060") ? "Stryker was here!" : (stryCov_9fa48("7060"), ''),
          location: stryMutAct_9fa48("7061") ? "" : (stryCov_9fa48("7061"), 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY'),
          capacity: 50,
          is_online: stryMutAct_9fa48("7062") ? true : (stryCov_9fa48("7062"), false),
          meeting_link: stryMutAct_9fa48("7063") ? "Stryker was here!" : (stryCov_9fa48("7063"), '')
        }));
        setEditingWorkshop(null);
        setWorkshopModalOpen(stryMutAct_9fa48("7064") ? false : (stryCov_9fa48("7064"), true));
      }
    };
    const openEditWorkshopModal = workshop => {
      if (stryMutAct_9fa48("7065")) {
        {}
      } else {
        stryCov_9fa48("7065");
        // Format date and time for datetime-local input
        const startTime = new Date(workshop.start_time);
        const endTime = new Date(stryMutAct_9fa48("7068") ? workshop.end_time && workshop.start_time : stryMutAct_9fa48("7067") ? false : stryMutAct_9fa48("7066") ? true : (stryCov_9fa48("7066", "7067", "7068"), workshop.end_time || workshop.start_time));

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = date => {
          if (stryMutAct_9fa48("7069")) {
            {}
          } else {
            stryCov_9fa48("7069");
            return stryMutAct_9fa48("7070") ? date.toISOString() : (stryCov_9fa48("7070"), date.toISOString().slice(0, 16));
          }
        };
        setWorkshopForm(stryMutAct_9fa48("7071") ? {} : (stryCov_9fa48("7071"), {
          title: workshop.event_name,
          description: stryMutAct_9fa48("7074") ? workshop.description && '' : stryMutAct_9fa48("7073") ? false : stryMutAct_9fa48("7072") ? true : (stryCov_9fa48("7072", "7073", "7074"), workshop.description || (stryMutAct_9fa48("7075") ? "Stryker was here!" : (stryCov_9fa48("7075"), ''))),
          start_time: formatDateForInput(startTime),
          end_time: formatDateForInput(endTime),
          location: stryMutAct_9fa48("7078") ? workshop.location && '' : stryMutAct_9fa48("7077") ? false : stryMutAct_9fa48("7076") ? true : (stryCov_9fa48("7076", "7077", "7078"), workshop.location || (stryMutAct_9fa48("7079") ? "Stryker was here!" : (stryCov_9fa48("7079"), ''))),
          capacity: stryMutAct_9fa48("7082") ? workshop.capacity && 50 : stryMutAct_9fa48("7081") ? false : stryMutAct_9fa48("7080") ? true : (stryCov_9fa48("7080", "7081", "7082"), workshop.capacity || 50),
          is_online: stryMutAct_9fa48("7085") ? workshop.is_online && false : stryMutAct_9fa48("7084") ? false : stryMutAct_9fa48("7083") ? true : (stryCov_9fa48("7083", "7084", "7085"), workshop.is_online || (stryMutAct_9fa48("7086") ? true : (stryCov_9fa48("7086"), false))),
          meeting_link: stryMutAct_9fa48("7089") ? workshop.meeting_link && '' : stryMutAct_9fa48("7088") ? false : stryMutAct_9fa48("7087") ? true : (stryCov_9fa48("7087", "7088", "7089"), workshop.meeting_link || (stryMutAct_9fa48("7090") ? "Stryker was here!" : (stryCov_9fa48("7090"), ''))),
          status: stryMutAct_9fa48("7093") ? workshop.status && 'scheduled' : stryMutAct_9fa48("7092") ? false : stryMutAct_9fa48("7091") ? true : (stryCov_9fa48("7091", "7092", "7093"), workshop.status || (stryMutAct_9fa48("7094") ? "" : (stryCov_9fa48("7094"), 'scheduled')))
        }));
        setEditingWorkshop(workshop.event_id);
        setWorkshopModalOpen(stryMutAct_9fa48("7095") ? false : (stryCov_9fa48("7095"), true));
      }
    };
    const closeWorkshopModal = () => {
      if (stryMutAct_9fa48("7096")) {
        {}
      } else {
        stryCov_9fa48("7096");
        setWorkshopModalOpen(stryMutAct_9fa48("7097") ? true : (stryCov_9fa48("7097"), false));
        setEditingWorkshop(null);
      }
    };

    // Configure SweetAlert2 with dark theme
    const darkSwalConfig = stryMutAct_9fa48("7098") ? {} : (stryCov_9fa48("7098"), {
      background: stryMutAct_9fa48("7099") ? "" : (stryCov_9fa48("7099"), '#1e2432'),
      color: stryMutAct_9fa48("7100") ? "" : (stryCov_9fa48("7100"), '#ffffff'),
      confirmButtonColor: stryMutAct_9fa48("7101") ? "" : (stryCov_9fa48("7101"), '#dc3545'),
      cancelButtonColor: stryMutAct_9fa48("7102") ? "" : (stryCov_9fa48("7102"), '#6c757d'),
      customClass: stryMutAct_9fa48("7103") ? {} : (stryCov_9fa48("7103"), {
        popup: stryMutAct_9fa48("7104") ? "" : (stryCov_9fa48("7104"), 'dark-swal-popup'),
        title: stryMutAct_9fa48("7105") ? "" : (stryCov_9fa48("7105"), 'dark-swal-title'),
        content: stryMutAct_9fa48("7106") ? "" : (stryCov_9fa48("7106"), 'dark-swal-content'),
        confirmButton: stryMutAct_9fa48("7107") ? "" : (stryCov_9fa48("7107"), 'dark-swal-confirm-btn'),
        cancelButton: stryMutAct_9fa48("7108") ? "" : (stryCov_9fa48("7108"), 'dark-swal-cancel-btn')
      })
    });

    // Delete handlers with dark mode SweetAlert2 confirmation
    const handleDeleteInfoSession = async sessionId => {
      if (stryMutAct_9fa48("7109")) {
        {}
      } else {
        stryCov_9fa48("7109");
        try {
          if (stryMutAct_9fa48("7110")) {
            {}
          } else {
            stryCov_9fa48("7110");
            const result = await Swal.fire(stryMutAct_9fa48("7111") ? {} : (stryCov_9fa48("7111"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7112") ? "" : (stryCov_9fa48("7112"), 'Delete Info Session?'),
              text: stryMutAct_9fa48("7113") ? "" : (stryCov_9fa48("7113"), "This action cannot be undone. All data related to this info session will be permanently deleted."),
              icon: stryMutAct_9fa48("7114") ? "" : (stryCov_9fa48("7114"), 'warning'),
              showCancelButton: stryMutAct_9fa48("7115") ? false : (stryCov_9fa48("7115"), true),
              confirmButtonText: stryMutAct_9fa48("7116") ? "" : (stryCov_9fa48("7116"), 'Yes, delete it!'),
              cancelButtonText: stryMutAct_9fa48("7117") ? "" : (stryCov_9fa48("7117"), 'Cancel'),
              iconColor: stryMutAct_9fa48("7118") ? "" : (stryCov_9fa48("7118"), '#fbbf24')
            }));
            if (stryMutAct_9fa48("7120") ? false : stryMutAct_9fa48("7119") ? true : (stryCov_9fa48("7119", "7120"), result.isConfirmed)) {
              if (stryMutAct_9fa48("7121")) {
                {}
              } else {
                stryCov_9fa48("7121");
                const response = await fetch(stryMutAct_9fa48("7122") ? `` : (stryCov_9fa48("7122"), `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${sessionId}`), stryMutAct_9fa48("7123") ? {} : (stryCov_9fa48("7123"), {
                  method: stryMutAct_9fa48("7124") ? "" : (stryCov_9fa48("7124"), 'DELETE'),
                  headers: stryMutAct_9fa48("7125") ? {} : (stryCov_9fa48("7125"), {
                    'Authorization': stryMutAct_9fa48("7126") ? `` : (stryCov_9fa48("7126"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("7127") ? "" : (stryCov_9fa48("7127"), 'application/json')
                  })
                }));
                if (stryMutAct_9fa48("7130") ? false : stryMutAct_9fa48("7129") ? true : stryMutAct_9fa48("7128") ? response.ok : (stryCov_9fa48("7128", "7129", "7130"), !response.ok)) {
                  if (stryMutAct_9fa48("7131")) {
                    {}
                  } else {
                    stryCov_9fa48("7131");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("7134") ? errorData.error && 'Failed to delete info session' : stryMutAct_9fa48("7133") ? false : stryMutAct_9fa48("7132") ? true : (stryCov_9fa48("7132", "7133", "7134"), errorData.error || (stryMutAct_9fa48("7135") ? "" : (stryCov_9fa48("7135"), 'Failed to delete info session'))));
                  }
                }

                // Close modal and refresh data
                closeInfoSessionModal();
                await fetchInfoSessions();

                // Show success message
                await Swal.fire(stryMutAct_9fa48("7136") ? {} : (stryCov_9fa48("7136"), {
                  ...darkSwalConfig,
                  title: stryMutAct_9fa48("7137") ? "" : (stryCov_9fa48("7137"), 'Deleted!'),
                  text: stryMutAct_9fa48("7138") ? "" : (stryCov_9fa48("7138"), 'The info session has been successfully deleted.'),
                  icon: stryMutAct_9fa48("7139") ? "" : (stryCov_9fa48("7139"), 'success'),
                  timer: 2000,
                  showConfirmButton: stryMutAct_9fa48("7140") ? true : (stryCov_9fa48("7140"), false),
                  iconColor: stryMutAct_9fa48("7141") ? "" : (stryCov_9fa48("7141"), '#10b981')
                }));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7142")) {
            {}
          } else {
            stryCov_9fa48("7142");
            console.error(stryMutAct_9fa48("7143") ? "" : (stryCov_9fa48("7143"), 'Error deleting info session:'), error);
            await Swal.fire(stryMutAct_9fa48("7144") ? {} : (stryCov_9fa48("7144"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7145") ? "" : (stryCov_9fa48("7145"), 'Error!'),
              text: stryMutAct_9fa48("7148") ? error.message && 'Failed to delete info session. Please try again.' : stryMutAct_9fa48("7147") ? false : stryMutAct_9fa48("7146") ? true : (stryCov_9fa48("7146", "7147", "7148"), error.message || (stryMutAct_9fa48("7149") ? "" : (stryCov_9fa48("7149"), 'Failed to delete info session. Please try again.'))),
              icon: stryMutAct_9fa48("7150") ? "" : (stryCov_9fa48("7150"), 'error'),
              iconColor: stryMutAct_9fa48("7151") ? "" : (stryCov_9fa48("7151"), '#ef4444')
            }));
          }
        }
      }
    };
    const handleDeleteWorkshop = async workshopId => {
      if (stryMutAct_9fa48("7152")) {
        {}
      } else {
        stryCov_9fa48("7152");
        try {
          if (stryMutAct_9fa48("7153")) {
            {}
          } else {
            stryCov_9fa48("7153");
            const result = await Swal.fire(stryMutAct_9fa48("7154") ? {} : (stryCov_9fa48("7154"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7155") ? "" : (stryCov_9fa48("7155"), 'Delete Workshop?'),
              text: stryMutAct_9fa48("7156") ? "" : (stryCov_9fa48("7156"), "This action cannot be undone. All data related to this workshop will be permanently deleted."),
              icon: stryMutAct_9fa48("7157") ? "" : (stryCov_9fa48("7157"), 'warning'),
              showCancelButton: stryMutAct_9fa48("7158") ? false : (stryCov_9fa48("7158"), true),
              confirmButtonText: stryMutAct_9fa48("7159") ? "" : (stryCov_9fa48("7159"), 'Yes, delete it!'),
              cancelButtonText: stryMutAct_9fa48("7160") ? "" : (stryCov_9fa48("7160"), 'Cancel'),
              iconColor: stryMutAct_9fa48("7161") ? "" : (stryCov_9fa48("7161"), '#fbbf24')
            }));
            if (stryMutAct_9fa48("7163") ? false : stryMutAct_9fa48("7162") ? true : (stryCov_9fa48("7162", "7163"), result.isConfirmed)) {
              if (stryMutAct_9fa48("7164")) {
                {}
              } else {
                stryCov_9fa48("7164");
                const response = await fetch(stryMutAct_9fa48("7165") ? `` : (stryCov_9fa48("7165"), `${import.meta.env.VITE_API_URL}/api/admissions/workshops/${workshopId}`), stryMutAct_9fa48("7166") ? {} : (stryCov_9fa48("7166"), {
                  method: stryMutAct_9fa48("7167") ? "" : (stryCov_9fa48("7167"), 'DELETE'),
                  headers: stryMutAct_9fa48("7168") ? {} : (stryCov_9fa48("7168"), {
                    'Authorization': stryMutAct_9fa48("7169") ? `` : (stryCov_9fa48("7169"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("7170") ? "" : (stryCov_9fa48("7170"), 'application/json')
                  })
                }));
                if (stryMutAct_9fa48("7173") ? false : stryMutAct_9fa48("7172") ? true : stryMutAct_9fa48("7171") ? response.ok : (stryCov_9fa48("7171", "7172", "7173"), !response.ok)) {
                  if (stryMutAct_9fa48("7174")) {
                    {}
                  } else {
                    stryCov_9fa48("7174");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("7177") ? errorData.error && 'Failed to delete workshop' : stryMutAct_9fa48("7176") ? false : stryMutAct_9fa48("7175") ? true : (stryCov_9fa48("7175", "7176", "7177"), errorData.error || (stryMutAct_9fa48("7178") ? "" : (stryCov_9fa48("7178"), 'Failed to delete workshop'))));
                  }
                }

                // Close modal and refresh data
                closeWorkshopModal();
                await fetchWorkshops();

                // Show success message
                await Swal.fire(stryMutAct_9fa48("7179") ? {} : (stryCov_9fa48("7179"), {
                  ...darkSwalConfig,
                  title: stryMutAct_9fa48("7180") ? "" : (stryCov_9fa48("7180"), 'Deleted!'),
                  text: stryMutAct_9fa48("7181") ? "" : (stryCov_9fa48("7181"), 'The workshop has been successfully deleted.'),
                  icon: stryMutAct_9fa48("7182") ? "" : (stryCov_9fa48("7182"), 'success'),
                  timer: 2000,
                  showConfirmButton: stryMutAct_9fa48("7183") ? true : (stryCov_9fa48("7183"), false),
                  iconColor: stryMutAct_9fa48("7184") ? "" : (stryCov_9fa48("7184"), '#10b981')
                }));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7185")) {
            {}
          } else {
            stryCov_9fa48("7185");
            console.error(stryMutAct_9fa48("7186") ? "" : (stryCov_9fa48("7186"), 'Error deleting workshop:'), error);
            await Swal.fire(stryMutAct_9fa48("7187") ? {} : (stryCov_9fa48("7187"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7188") ? "" : (stryCov_9fa48("7188"), 'Error!'),
              text: stryMutAct_9fa48("7191") ? error.message && 'Failed to delete workshop. Please try again.' : stryMutAct_9fa48("7190") ? false : stryMutAct_9fa48("7189") ? true : (stryCov_9fa48("7189", "7190", "7191"), error.message || (stryMutAct_9fa48("7192") ? "" : (stryCov_9fa48("7192"), 'Failed to delete workshop. Please try again.'))),
              icon: stryMutAct_9fa48("7193") ? "" : (stryCov_9fa48("7193"), 'error'),
              iconColor: stryMutAct_9fa48("7194") ? "" : (stryCov_9fa48("7194"), '#ef4444')
            }));
          }
        }
      }
    };
    const handleWorkshopFormChange = e => {
      if (stryMutAct_9fa48("7195")) {
        {}
      } else {
        stryCov_9fa48("7195");
        const {
          name,
          value,
          type,
          checked
        } = e.target;
        setWorkshopForm(stryMutAct_9fa48("7196") ? () => undefined : (stryCov_9fa48("7196"), prev => stryMutAct_9fa48("7197") ? {} : (stryCov_9fa48("7197"), {
          ...prev,
          [name]: (stryMutAct_9fa48("7200") ? type !== 'checkbox' : stryMutAct_9fa48("7199") ? false : stryMutAct_9fa48("7198") ? true : (stryCov_9fa48("7198", "7199", "7200"), type === (stryMutAct_9fa48("7201") ? "" : (stryCov_9fa48("7201"), 'checkbox')))) ? checked : value
        })));
      }
    };
    const handleWorkshopSubmit = async e => {
      if (stryMutAct_9fa48("7202")) {
        {}
      } else {
        stryCov_9fa48("7202");
        e.preventDefault();
        setWorkshopSubmitting(stryMutAct_9fa48("7203") ? false : (stryCov_9fa48("7203"), true));
        try {
          if (stryMutAct_9fa48("7204")) {
            {}
          } else {
            stryCov_9fa48("7204");
            const endpoint = editingWorkshop ? stryMutAct_9fa48("7205") ? `` : (stryCov_9fa48("7205"), `${import.meta.env.VITE_API_URL}/api/admissions/workshops/${editingWorkshop}`) : stryMutAct_9fa48("7206") ? `` : (stryCov_9fa48("7206"), `${import.meta.env.VITE_API_URL}/api/admissions/workshops`);
            const method = editingWorkshop ? stryMutAct_9fa48("7207") ? "" : (stryCov_9fa48("7207"), 'PUT') : stryMutAct_9fa48("7208") ? "" : (stryCov_9fa48("7208"), 'POST');
            const response = await fetch(endpoint, stryMutAct_9fa48("7209") ? {} : (stryCov_9fa48("7209"), {
              method,
              headers: stryMutAct_9fa48("7210") ? {} : (stryCov_9fa48("7210"), {
                'Content-Type': stryMutAct_9fa48("7211") ? "" : (stryCov_9fa48("7211"), 'application/json'),
                'Authorization': stryMutAct_9fa48("7212") ? `` : (stryCov_9fa48("7212"), `Bearer ${token}`)
              }),
              body: JSON.stringify(workshopForm)
            }));
            if (stryMutAct_9fa48("7215") ? false : stryMutAct_9fa48("7214") ? true : stryMutAct_9fa48("7213") ? response.ok : (stryCov_9fa48("7213", "7214", "7215"), !response.ok)) {
              if (stryMutAct_9fa48("7216")) {
                {}
              } else {
                stryCov_9fa48("7216");
                throw new Error(stryMutAct_9fa48("7217") ? `` : (stryCov_9fa48("7217"), `Failed to ${editingWorkshop ? stryMutAct_9fa48("7218") ? "" : (stryCov_9fa48("7218"), 'update') : stryMutAct_9fa48("7219") ? "" : (stryCov_9fa48("7219"), 'create')} workshop`));
              }
            }

            // Refresh workshops list
            await fetchWorkshops();
            closeWorkshopModal();
          }
        } catch (error) {
          if (stryMutAct_9fa48("7220")) {
            {}
          } else {
            stryCov_9fa48("7220");
            console.error(stryMutAct_9fa48("7221") ? "" : (stryCov_9fa48("7221"), 'Error submitting workshop:'), error);
            setError(stryMutAct_9fa48("7222") ? `` : (stryCov_9fa48("7222"), `Failed to ${editingWorkshop ? stryMutAct_9fa48("7223") ? "" : (stryCov_9fa48("7223"), 'update') : stryMutAct_9fa48("7224") ? "" : (stryCov_9fa48("7224"), 'create')} workshop. ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("7225")) {
            {}
          } else {
            stryCov_9fa48("7225");
            setWorkshopSubmitting(stryMutAct_9fa48("7226") ? true : (stryCov_9fa48("7226"), false));
          }
        }
      }
    };

    // Handle viewing registrations for an event
    const handleViewRegistrations = async (eventType, eventId) => {
      if (stryMutAct_9fa48("7227")) {
        {}
      } else {
        stryCov_9fa48("7227");
        if (stryMutAct_9fa48("7230") ? selectedEvent !== eventId : stryMutAct_9fa48("7229") ? false : stryMutAct_9fa48("7228") ? true : (stryCov_9fa48("7228", "7229", "7230"), selectedEvent === eventId)) {
          if (stryMutAct_9fa48("7231")) {
            {}
          } else {
            stryCov_9fa48("7231");
            setSelectedEvent(null);
            setEventRegistrations(stryMutAct_9fa48("7232") ? ["Stryker was here"] : (stryCov_9fa48("7232"), []));
            return;
          }
        }
        setSelectedEvent(eventId);
        setEventRegistrations(stryMutAct_9fa48("7233") ? ["Stryker was here"] : (stryCov_9fa48("7233"), []));
        try {
          if (stryMutAct_9fa48("7234")) {
            {}
          } else {
            stryCov_9fa48("7234");
            const response = await fetch(stryMutAct_9fa48("7235") ? `` : (stryCov_9fa48("7235"), `${import.meta.env.VITE_API_URL}/api/admissions/registrations/${eventType}/${eventId}`), stryMutAct_9fa48("7236") ? {} : (stryCov_9fa48("7236"), {
              headers: stryMutAct_9fa48("7237") ? {} : (stryCov_9fa48("7237"), {
                'Authorization': stryMutAct_9fa48("7238") ? `` : (stryCov_9fa48("7238"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("7239") ? "" : (stryCov_9fa48("7239"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("7241") ? false : stryMutAct_9fa48("7240") ? true : (stryCov_9fa48("7240", "7241"), response.ok)) {
              if (stryMutAct_9fa48("7242")) {
                {}
              } else {
                stryCov_9fa48("7242");
                const data = await response.json();
                setEventRegistrations(data);
              }
            } else {
              if (stryMutAct_9fa48("7243")) {
                {}
              } else {
                stryCov_9fa48("7243");
                console.error(stryMutAct_9fa48("7244") ? "" : (stryCov_9fa48("7244"), 'Failed to fetch registrations'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7245")) {
            {}
          } else {
            stryCov_9fa48("7245");
            console.error(stryMutAct_9fa48("7246") ? "" : (stryCov_9fa48("7246"), 'Error fetching registrations:'), error);
          }
        }
      }
    };

    // Handle marking attendance  
    const handleMarkAttendance = async (eventType, eventId, applicantId, status) => {
      if (stryMutAct_9fa48("7247")) {
        {}
      } else {
        stryCov_9fa48("7247");
        setAttendanceLoading(stryMutAct_9fa48("7248") ? false : (stryCov_9fa48("7248"), true));
        try {
          if (stryMutAct_9fa48("7249")) {
            {}
          } else {
            stryCov_9fa48("7249");
            const response = await fetch(stryMutAct_9fa48("7250") ? `` : (stryCov_9fa48("7250"), `${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`), stryMutAct_9fa48("7251") ? {} : (stryCov_9fa48("7251"), {
              method: stryMutAct_9fa48("7252") ? "" : (stryCov_9fa48("7252"), 'PUT'),
              headers: stryMutAct_9fa48("7253") ? {} : (stryCov_9fa48("7253"), {
                'Authorization': stryMutAct_9fa48("7254") ? `` : (stryCov_9fa48("7254"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("7255") ? "" : (stryCov_9fa48("7255"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("7256") ? {} : (stryCov_9fa48("7256"), {
                status
              }))
            }));
            if (stryMutAct_9fa48("7258") ? false : stryMutAct_9fa48("7257") ? true : (stryCov_9fa48("7257", "7258"), response.ok)) {
              if (stryMutAct_9fa48("7259")) {
                {}
              } else {
                stryCov_9fa48("7259");
                // Get the previous status to determine count changes
                const previousRegistration = eventRegistrations.find(stryMutAct_9fa48("7260") ? () => undefined : (stryCov_9fa48("7260"), reg => stryMutAct_9fa48("7263") ? reg.applicant_id !== applicantId : stryMutAct_9fa48("7262") ? false : stryMutAct_9fa48("7261") ? true : (stryCov_9fa48("7261", "7262", "7263"), reg.applicant_id === applicantId)));
                const previousStatus = stryMutAct_9fa48("7264") ? previousRegistration.status : (stryCov_9fa48("7264"), previousRegistration?.status);

                // Update the registration in the local state instead of refetching
                setEventRegistrations(stryMutAct_9fa48("7265") ? () => undefined : (stryCov_9fa48("7265"), prevRegistrations => prevRegistrations.map(stryMutAct_9fa48("7266") ? () => undefined : (stryCov_9fa48("7266"), reg => (stryMutAct_9fa48("7269") ? reg.applicant_id !== applicantId : stryMutAct_9fa48("7268") ? false : stryMutAct_9fa48("7267") ? true : (stryCov_9fa48("7267", "7268", "7269"), reg.applicant_id === applicantId)) ? stryMutAct_9fa48("7270") ? {} : (stryCov_9fa48("7270"), {
                  ...reg,
                  status
                }) : reg))));

                // Update the event stats in local state based on status transitions
                const isNewStatusAttended = stryMutAct_9fa48("7273") ? (status === 'attended' || status === 'attended_late') && status === 'very_late' : stryMutAct_9fa48("7272") ? false : stryMutAct_9fa48("7271") ? true : (stryCov_9fa48("7271", "7272", "7273"), (stryMutAct_9fa48("7275") ? status === 'attended' && status === 'attended_late' : stryMutAct_9fa48("7274") ? false : (stryCov_9fa48("7274", "7275"), (stryMutAct_9fa48("7277") ? status !== 'attended' : stryMutAct_9fa48("7276") ? false : (stryCov_9fa48("7276", "7277"), status === (stryMutAct_9fa48("7278") ? "" : (stryCov_9fa48("7278"), 'attended')))) || (stryMutAct_9fa48("7280") ? status !== 'attended_late' : stryMutAct_9fa48("7279") ? false : (stryCov_9fa48("7279", "7280"), status === (stryMutAct_9fa48("7281") ? "" : (stryCov_9fa48("7281"), 'attended_late')))))) || (stryMutAct_9fa48("7283") ? status !== 'very_late' : stryMutAct_9fa48("7282") ? false : (stryCov_9fa48("7282", "7283"), status === (stryMutAct_9fa48("7284") ? "" : (stryCov_9fa48("7284"), 'very_late')))));
                const wasPreviousStatusAttended = stryMutAct_9fa48("7287") ? (previousStatus === 'attended' || previousStatus === 'attended_late') && previousStatus === 'very_late' : stryMutAct_9fa48("7286") ? false : stryMutAct_9fa48("7285") ? true : (stryCov_9fa48("7285", "7286", "7287"), (stryMutAct_9fa48("7289") ? previousStatus === 'attended' && previousStatus === 'attended_late' : stryMutAct_9fa48("7288") ? false : (stryCov_9fa48("7288", "7289"), (stryMutAct_9fa48("7291") ? previousStatus !== 'attended' : stryMutAct_9fa48("7290") ? false : (stryCov_9fa48("7290", "7291"), previousStatus === (stryMutAct_9fa48("7292") ? "" : (stryCov_9fa48("7292"), 'attended')))) || (stryMutAct_9fa48("7294") ? previousStatus !== 'attended_late' : stryMutAct_9fa48("7293") ? false : (stryCov_9fa48("7293", "7294"), previousStatus === (stryMutAct_9fa48("7295") ? "" : (stryCov_9fa48("7295"), 'attended_late')))))) || (stryMutAct_9fa48("7297") ? previousStatus !== 'very_late' : stryMutAct_9fa48("7296") ? false : (stryCov_9fa48("7296", "7297"), previousStatus === (stryMutAct_9fa48("7298") ? "" : (stryCov_9fa48("7298"), 'very_late')))));
                let countChange = 0;
                if (stryMutAct_9fa48("7301") ? isNewStatusAttended || !wasPreviousStatusAttended : stryMutAct_9fa48("7300") ? false : stryMutAct_9fa48("7299") ? true : (stryCov_9fa48("7299", "7300", "7301"), isNewStatusAttended && (stryMutAct_9fa48("7302") ? wasPreviousStatusAttended : (stryCov_9fa48("7302"), !wasPreviousStatusAttended)))) {
                  if (stryMutAct_9fa48("7303")) {
                    {}
                  } else {
                    stryCov_9fa48("7303");
                    countChange = 1; // Moving to attended status
                  }
                } else if (stryMutAct_9fa48("7306") ? !isNewStatusAttended || wasPreviousStatusAttended : stryMutAct_9fa48("7305") ? false : stryMutAct_9fa48("7304") ? true : (stryCov_9fa48("7304", "7305", "7306"), (stryMutAct_9fa48("7307") ? isNewStatusAttended : (stryCov_9fa48("7307"), !isNewStatusAttended)) && wasPreviousStatusAttended)) {
                  if (stryMutAct_9fa48("7308")) {
                    {}
                  } else {
                    stryCov_9fa48("7308");
                    countChange = stryMutAct_9fa48("7309") ? +1 : (stryCov_9fa48("7309"), -1); // Moving away from attended status
                  }
                }
                // If both are attended or both are non-attended, no change needed (countChange = 0)

                if (stryMutAct_9fa48("7312") ? countChange === 0 : stryMutAct_9fa48("7311") ? false : stryMutAct_9fa48("7310") ? true : (stryCov_9fa48("7310", "7311", "7312"), countChange !== 0)) {
                  if (stryMutAct_9fa48("7313")) {
                    {}
                  } else {
                    stryCov_9fa48("7313");
                    if (stryMutAct_9fa48("7316") ? eventType !== 'info-session' : stryMutAct_9fa48("7315") ? false : stryMutAct_9fa48("7314") ? true : (stryCov_9fa48("7314", "7315", "7316"), eventType === (stryMutAct_9fa48("7317") ? "" : (stryCov_9fa48("7317"), 'info-session')))) {
                      if (stryMutAct_9fa48("7318")) {
                        {}
                      } else {
                        stryCov_9fa48("7318");
                        setInfoSessions(stryMutAct_9fa48("7319") ? () => undefined : (stryCov_9fa48("7319"), prevSessions => prevSessions.map(stryMutAct_9fa48("7320") ? () => undefined : (stryCov_9fa48("7320"), session => (stryMutAct_9fa48("7323") ? session.event_id !== eventId : stryMutAct_9fa48("7322") ? false : stryMutAct_9fa48("7321") ? true : (stryCov_9fa48("7321", "7322", "7323"), session.event_id === eventId)) ? stryMutAct_9fa48("7324") ? {} : (stryCov_9fa48("7324"), {
                          ...session,
                          attended_count: stryMutAct_9fa48("7325") ? session.attended_count - countChange : (stryCov_9fa48("7325"), session.attended_count + countChange)
                        }) : session))));
                      }
                    } else if (stryMutAct_9fa48("7328") ? eventType !== 'workshop' : stryMutAct_9fa48("7327") ? false : stryMutAct_9fa48("7326") ? true : (stryCov_9fa48("7326", "7327", "7328"), eventType === (stryMutAct_9fa48("7329") ? "" : (stryCov_9fa48("7329"), 'workshop')))) {
                      if (stryMutAct_9fa48("7330")) {
                        {}
                      } else {
                        stryCov_9fa48("7330");
                        setWorkshops(stryMutAct_9fa48("7331") ? () => undefined : (stryCov_9fa48("7331"), prevWorkshops => prevWorkshops.map(stryMutAct_9fa48("7332") ? () => undefined : (stryCov_9fa48("7332"), workshop => (stryMutAct_9fa48("7335") ? workshop.event_id !== eventId : stryMutAct_9fa48("7334") ? false : stryMutAct_9fa48("7333") ? true : (stryCov_9fa48("7333", "7334", "7335"), workshop.event_id === eventId)) ? stryMutAct_9fa48("7336") ? {} : (stryCov_9fa48("7336"), {
                          ...workshop,
                          attended_count: stryMutAct_9fa48("7337") ? workshop.attended_count - countChange : (stryCov_9fa48("7337"), workshop.attended_count + countChange)
                        }) : workshop))));
                      }
                    }
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("7338")) {
                {}
              } else {
                stryCov_9fa48("7338");
                console.error(stryMutAct_9fa48("7339") ? "" : (stryCov_9fa48("7339"), 'Failed to mark attendance'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7340")) {
            {}
          } else {
            stryCov_9fa48("7340");
            console.error(stryMutAct_9fa48("7341") ? "" : (stryCov_9fa48("7341"), 'Error marking attendance:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("7342")) {
            {}
          } else {
            stryCov_9fa48("7342");
            setAttendanceLoading(stryMutAct_9fa48("7343") ? true : (stryCov_9fa48("7343"), false));
          }
        }
      }
    };

    // Mark attendance helper (legacy - keeping for compatibility)
    const markAttendance = async (eventType, eventId, applicantId, attended) => {
      if (stryMutAct_9fa48("7344")) {
        {}
      } else {
        stryCov_9fa48("7344");
        try {
          if (stryMutAct_9fa48("7345")) {
            {}
          } else {
            stryCov_9fa48("7345");
            const response = await fetch(stryMutAct_9fa48("7346") ? `` : (stryCov_9fa48("7346"), `${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`), stryMutAct_9fa48("7347") ? {} : (stryCov_9fa48("7347"), {
              method: stryMutAct_9fa48("7348") ? "" : (stryCov_9fa48("7348"), 'PUT'),
              headers: stryMutAct_9fa48("7349") ? {} : (stryCov_9fa48("7349"), {
                'Content-Type': stryMutAct_9fa48("7350") ? "" : (stryCov_9fa48("7350"), 'application/json'),
                Authorization: stryMutAct_9fa48("7351") ? `` : (stryCov_9fa48("7351"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("7352") ? {} : (stryCov_9fa48("7352"), {
                attended
              }))
            }));
            if (stryMutAct_9fa48("7355") ? false : stryMutAct_9fa48("7354") ? true : stryMutAct_9fa48("7353") ? response.ok : (stryCov_9fa48("7353", "7354", "7355"), !response.ok)) {
              if (stryMutAct_9fa48("7356")) {
                {}
              } else {
                stryCov_9fa48("7356");
                throw new Error(stryMutAct_9fa48("7357") ? "" : (stryCov_9fa48("7357"), 'Failed to mark attendance'));
              }
            }

            // Refresh data after marking attendance
            await fetchAdmissionsData();
          }
        } catch (error) {
          if (stryMutAct_9fa48("7358")) {
            {}
          } else {
            stryCov_9fa48("7358");
            console.error(stryMutAct_9fa48("7359") ? "" : (stryCov_9fa48("7359"), 'Error marking attendance:'), error);
            setError(stryMutAct_9fa48("7360") ? "" : (stryCov_9fa48("7360"), 'Failed to mark attendance. Please try again.'));
          }
        }
      }
    };

    // Handle toggling event active status
    const handleToggleEventActive = async eventId => {
      if (stryMutAct_9fa48("7361")) {
        {}
      } else {
        stryCov_9fa48("7361");
        try {
          if (stryMutAct_9fa48("7362")) {
            {}
          } else {
            stryCov_9fa48("7362");
            const response = await fetch(stryMutAct_9fa48("7363") ? `` : (stryCov_9fa48("7363"), `${import.meta.env.VITE_API_URL}/api/admissions/events/${eventId}/toggle-active`), stryMutAct_9fa48("7364") ? {} : (stryCov_9fa48("7364"), {
              method: stryMutAct_9fa48("7365") ? "" : (stryCov_9fa48("7365"), 'PUT'),
              headers: stryMutAct_9fa48("7366") ? {} : (stryCov_9fa48("7366"), {
                'Authorization': stryMutAct_9fa48("7367") ? `` : (stryCov_9fa48("7367"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("7368") ? "" : (stryCov_9fa48("7368"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("7370") ? false : stryMutAct_9fa48("7369") ? true : (stryCov_9fa48("7369", "7370"), response.ok)) {
              if (stryMutAct_9fa48("7371")) {
                {}
              } else {
                stryCov_9fa48("7371");
                const result = await response.json();
                console.log(stryMutAct_9fa48("7372") ? "" : (stryCov_9fa48("7372"), 'Event active status toggled:'), result);

                // Update the local state for both info sessions and workshops
                setInfoSessions(stryMutAct_9fa48("7373") ? () => undefined : (stryCov_9fa48("7373"), prevSessions => prevSessions.map(stryMutAct_9fa48("7374") ? () => undefined : (stryCov_9fa48("7374"), session => (stryMutAct_9fa48("7377") ? session.event_id !== eventId : stryMutAct_9fa48("7376") ? false : stryMutAct_9fa48("7375") ? true : (stryCov_9fa48("7375", "7376", "7377"), session.event_id === eventId)) ? stryMutAct_9fa48("7378") ? {} : (stryCov_9fa48("7378"), {
                  ...session,
                  is_active: result.event.is_active
                }) : session))));
                setWorkshops(stryMutAct_9fa48("7379") ? () => undefined : (stryCov_9fa48("7379"), prevWorkshops => prevWorkshops.map(stryMutAct_9fa48("7380") ? () => undefined : (stryCov_9fa48("7380"), workshop => (stryMutAct_9fa48("7383") ? workshop.event_id !== eventId : stryMutAct_9fa48("7382") ? false : stryMutAct_9fa48("7381") ? true : (stryCov_9fa48("7381", "7382", "7383"), workshop.event_id === eventId)) ? stryMutAct_9fa48("7384") ? {} : (stryCov_9fa48("7384"), {
                  ...workshop,
                  is_active: result.event.is_active
                }) : workshop))));
                setError(null);
              }
            } else {
              if (stryMutAct_9fa48("7385")) {
                {}
              } else {
                stryCov_9fa48("7385");
                const errorData = await response.json();
                console.error(stryMutAct_9fa48("7386") ? "" : (stryCov_9fa48("7386"), 'Failed to toggle event active status:'), errorData);
                setError(stryMutAct_9fa48("7387") ? `` : (stryCov_9fa48("7387"), `Failed to toggle event status: ${errorData.error}`));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7388")) {
            {}
          } else {
            stryCov_9fa48("7388");
            console.error(stryMutAct_9fa48("7389") ? "" : (stryCov_9fa48("7389"), 'Error toggling event active status:'), error);
            setError(stryMutAct_9fa48("7390") ? "" : (stryCov_9fa48("7390"), 'Failed to toggle event status. Please try again.'));
          }
        }
      }
    };

    // Manual Registration Handlers

    // Open add registration modal
    const openAddRegistrationModal = (eventId, eventType) => {
      if (stryMutAct_9fa48("7391")) {
        {}
      } else {
        stryCov_9fa48("7391");
        setSelectedEventForRegistration(eventId);
        setSelectedEventType(eventType);
        setAddRegistrationModalOpen(stryMutAct_9fa48("7392") ? false : (stryCov_9fa48("7392"), true));
        setApplicantSearch(stryMutAct_9fa48("7393") ? "Stryker was here!" : (stryCov_9fa48("7393"), ''));
        setSearchResults(stryMutAct_9fa48("7394") ? ["Stryker was here"] : (stryCov_9fa48("7394"), []));
        setSelectedApplicantsForRegistration(stryMutAct_9fa48("7395") ? ["Stryker was here"] : (stryCov_9fa48("7395"), []));
      }
    };

    // Close add registration modal
    const closeAddRegistrationModal = () => {
      if (stryMutAct_9fa48("7396")) {
        {}
      } else {
        stryCov_9fa48("7396");
        setAddRegistrationModalOpen(stryMutAct_9fa48("7397") ? true : (stryCov_9fa48("7397"), false));
        setSelectedEventForRegistration(null);
        setSelectedEventType(null);
        setApplicantSearch(stryMutAct_9fa48("7398") ? "Stryker was here!" : (stryCov_9fa48("7398"), ''));
        setSearchResults(stryMutAct_9fa48("7399") ? ["Stryker was here"] : (stryCov_9fa48("7399"), []));
        setSelectedApplicantsForRegistration(stryMutAct_9fa48("7400") ? ["Stryker was here"] : (stryCov_9fa48("7400"), []));
      }
    };

    // Search for applicants
    const searchApplicants = async searchTerm => {
      if (stryMutAct_9fa48("7401")) {
        {}
      } else {
        stryCov_9fa48("7401");
        console.log(stryMutAct_9fa48("7402") ? "" : (stryCov_9fa48("7402"), '🔍 searchApplicants called with:'), stryMutAct_9fa48("7403") ? {} : (stryCov_9fa48("7403"), {
          searchTerm,
          length: stryMutAct_9fa48("7404") ? searchTerm.length : (stryCov_9fa48("7404"), searchTerm?.length),
          trimmed: stryMutAct_9fa48("7406") ? searchTerm.trim() : stryMutAct_9fa48("7405") ? searchTerm : (stryCov_9fa48("7405", "7406"), searchTerm?.trim())
        }));
        setSearchLoading(stryMutAct_9fa48("7407") ? false : (stryCov_9fa48("7407"), true));
        try {
          if (stryMutAct_9fa48("7408")) {
            {}
          } else {
            stryCov_9fa48("7408");
            const response = await fetch(stryMutAct_9fa48("7409") ? `` : (stryCov_9fa48("7409"), `${import.meta.env.VITE_API_URL}/api/admissions/applicants/search?q=${encodeURIComponent(searchTerm)}&eventId=${selectedEventForRegistration}&eventType=${selectedEventType}&limit=20`), stryMutAct_9fa48("7410") ? {} : (stryCov_9fa48("7410"), {
              headers: stryMutAct_9fa48("7411") ? {} : (stryCov_9fa48("7411"), {
                'Authorization': stryMutAct_9fa48("7412") ? `` : (stryCov_9fa48("7412"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("7413") ? "" : (stryCov_9fa48("7413"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("7415") ? false : stryMutAct_9fa48("7414") ? true : (stryCov_9fa48("7414", "7415"), response.ok)) {
              if (stryMutAct_9fa48("7416")) {
                {}
              } else {
                stryCov_9fa48("7416");
                const data = await response.json();
                console.log(stryMutAct_9fa48("7417") ? "" : (stryCov_9fa48("7417"), '🔍 Search response received:'), data.count, stryMutAct_9fa48("7418") ? "" : (stryCov_9fa48("7418"), 'applicants'));
                setSearchResults(stryMutAct_9fa48("7421") ? data.applicants && [] : stryMutAct_9fa48("7420") ? false : stryMutAct_9fa48("7419") ? true : (stryCov_9fa48("7419", "7420", "7421"), data.applicants || (stryMutAct_9fa48("7422") ? ["Stryker was here"] : (stryCov_9fa48("7422"), []))));
                console.log(stryMutAct_9fa48("7423") ? "" : (stryCov_9fa48("7423"), '🔍 Search results set successfully'));
              }
            } else {
              if (stryMutAct_9fa48("7424")) {
                {}
              } else {
                stryCov_9fa48("7424");
                console.error(stryMutAct_9fa48("7425") ? "" : (stryCov_9fa48("7425"), 'Failed to search applicants'));
                setSearchResults(stryMutAct_9fa48("7426") ? ["Stryker was here"] : (stryCov_9fa48("7426"), []));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7427")) {
            {}
          } else {
            stryCov_9fa48("7427");
            console.error(stryMutAct_9fa48("7428") ? "" : (stryCov_9fa48("7428"), 'Error searching applicants:'), error);
            setSearchResults(stryMutAct_9fa48("7429") ? ["Stryker was here"] : (stryCov_9fa48("7429"), []));
          }
        } finally {
          if (stryMutAct_9fa48("7430")) {
            {}
          } else {
            stryCov_9fa48("7430");
            setSearchLoading(stryMutAct_9fa48("7431") ? true : (stryCov_9fa48("7431"), false));
          }
        }
      }
    };

    // Handle applicant selection for registration
    const toggleApplicantSelection = applicant => {
      if (stryMutAct_9fa48("7432")) {
        {}
      } else {
        stryCov_9fa48("7432");
        setSelectedApplicantsForRegistration(prev => {
          if (stryMutAct_9fa48("7433")) {
            {}
          } else {
            stryCov_9fa48("7433");
            const isSelected = stryMutAct_9fa48("7434") ? prev.every(selected => selected.applicant_id === applicant.applicant_id) : (stryCov_9fa48("7434"), prev.some(stryMutAct_9fa48("7435") ? () => undefined : (stryCov_9fa48("7435"), selected => stryMutAct_9fa48("7438") ? selected.applicant_id !== applicant.applicant_id : stryMutAct_9fa48("7437") ? false : stryMutAct_9fa48("7436") ? true : (stryCov_9fa48("7436", "7437", "7438"), selected.applicant_id === applicant.applicant_id))));
            if (stryMutAct_9fa48("7440") ? false : stryMutAct_9fa48("7439") ? true : (stryCov_9fa48("7439", "7440"), isSelected)) {
              if (stryMutAct_9fa48("7441")) {
                {}
              } else {
                stryCov_9fa48("7441");
                return stryMutAct_9fa48("7442") ? prev : (stryCov_9fa48("7442"), prev.filter(stryMutAct_9fa48("7443") ? () => undefined : (stryCov_9fa48("7443"), selected => stryMutAct_9fa48("7446") ? selected.applicant_id === applicant.applicant_id : stryMutAct_9fa48("7445") ? false : stryMutAct_9fa48("7444") ? true : (stryCov_9fa48("7444", "7445", "7446"), selected.applicant_id !== applicant.applicant_id))));
              }
            } else {
              if (stryMutAct_9fa48("7447")) {
                {}
              } else {
                stryCov_9fa48("7447");
                return stryMutAct_9fa48("7448") ? [] : (stryCov_9fa48("7448"), [...prev, applicant]);
              }
            }
          }
        });
      }
    };

    // Register selected applicants
    const registerSelectedApplicants = async () => {
      if (stryMutAct_9fa48("7449")) {
        {}
      } else {
        stryCov_9fa48("7449");
        if (stryMutAct_9fa48("7452") ? selectedApplicantsForRegistration.length !== 0 : stryMutAct_9fa48("7451") ? false : stryMutAct_9fa48("7450") ? true : (stryCov_9fa48("7450", "7451", "7452"), selectedApplicantsForRegistration.length === 0)) return;
        setRegistrationLoading(stryMutAct_9fa48("7453") ? false : (stryCov_9fa48("7453"), true));
        const results = stryMutAct_9fa48("7454") ? ["Stryker was here"] : (stryCov_9fa48("7454"), []);
        try {
          if (stryMutAct_9fa48("7455")) {
            {}
          } else {
            stryCov_9fa48("7455");
            for (const applicant of selectedApplicantsForRegistration) {
              if (stryMutAct_9fa48("7456")) {
                {}
              } else {
                stryCov_9fa48("7456");
                try {
                  if (stryMutAct_9fa48("7457")) {
                    {}
                  } else {
                    stryCov_9fa48("7457");
                    const response = await fetch(stryMutAct_9fa48("7458") ? `` : (stryCov_9fa48("7458"), `${import.meta.env.VITE_API_URL}/api/admissions/events/${selectedEventType}/${selectedEventForRegistration}/register-applicant`), stryMutAct_9fa48("7459") ? {} : (stryCov_9fa48("7459"), {
                      method: stryMutAct_9fa48("7460") ? "" : (stryCov_9fa48("7460"), 'POST'),
                      headers: stryMutAct_9fa48("7461") ? {} : (stryCov_9fa48("7461"), {
                        'Authorization': stryMutAct_9fa48("7462") ? `` : (stryCov_9fa48("7462"), `Bearer ${token}`),
                        'Content-Type': stryMutAct_9fa48("7463") ? "" : (stryCov_9fa48("7463"), 'application/json')
                      }),
                      body: JSON.stringify(stryMutAct_9fa48("7464") ? {} : (stryCov_9fa48("7464"), {
                        applicantId: applicant.applicant_id,
                        name: applicant.display_name,
                        email: applicant.email,
                        needsLaptop: stryMutAct_9fa48("7465") ? true : (stryCov_9fa48("7465"), false) // Default to false, can be changed later
                      }))
                    }));
                    if (stryMutAct_9fa48("7467") ? false : stryMutAct_9fa48("7466") ? true : (stryCov_9fa48("7466", "7467"), response.ok)) {
                      if (stryMutAct_9fa48("7468")) {
                        {}
                      } else {
                        stryCov_9fa48("7468");
                        results.push(stryMutAct_9fa48("7469") ? {} : (stryCov_9fa48("7469"), {
                          applicant,
                          success: stryMutAct_9fa48("7470") ? false : (stryCov_9fa48("7470"), true)
                        }));
                      }
                    } else {
                      if (stryMutAct_9fa48("7471")) {
                        {}
                      } else {
                        stryCov_9fa48("7471");
                        const errorData = await response.json();
                        results.push(stryMutAct_9fa48("7472") ? {} : (stryCov_9fa48("7472"), {
                          applicant,
                          success: stryMutAct_9fa48("7473") ? true : (stryCov_9fa48("7473"), false),
                          error: errorData.error
                        }));
                      }
                    }
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("7474")) {
                    {}
                  } else {
                    stryCov_9fa48("7474");
                    results.push(stryMutAct_9fa48("7475") ? {} : (stryCov_9fa48("7475"), {
                      applicant,
                      success: stryMutAct_9fa48("7476") ? true : (stryCov_9fa48("7476"), false),
                      error: error.message
                    }));
                  }
                }
              }
            }

            // Show results and refresh data
            const successCount = stryMutAct_9fa48("7477") ? results.length : (stryCov_9fa48("7477"), results.filter(stryMutAct_9fa48("7478") ? () => undefined : (stryCov_9fa48("7478"), r => r.success)).length);
            const failureCount = stryMutAct_9fa48("7479") ? results.length + successCount : (stryCov_9fa48("7479"), results.length - successCount);
            if (stryMutAct_9fa48("7483") ? successCount <= 0 : stryMutAct_9fa48("7482") ? successCount >= 0 : stryMutAct_9fa48("7481") ? false : stryMutAct_9fa48("7480") ? true : (stryCov_9fa48("7480", "7481", "7482", "7483"), successCount > 0)) {
              if (stryMutAct_9fa48("7484")) {
                {}
              } else {
                stryCov_9fa48("7484");
                // Refresh event registrations to show new registrations
                if (stryMutAct_9fa48("7487") ? selectedEvent !== selectedEventForRegistration : stryMutAct_9fa48("7486") ? false : stryMutAct_9fa48("7485") ? true : (stryCov_9fa48("7485", "7486", "7487"), selectedEvent === selectedEventForRegistration)) {
                  if (stryMutAct_9fa48("7488")) {
                    {}
                  } else {
                    stryCov_9fa48("7488");
                    await handleViewRegistrations(selectedEventType, selectedEventForRegistration);
                  }
                }
                // Refresh events list to update counts
                if (stryMutAct_9fa48("7491") ? selectedEventType !== 'info-session' : stryMutAct_9fa48("7490") ? false : stryMutAct_9fa48("7489") ? true : (stryCov_9fa48("7489", "7490", "7491"), selectedEventType === (stryMutAct_9fa48("7492") ? "" : (stryCov_9fa48("7492"), 'info-session')))) {
                  if (stryMutAct_9fa48("7493")) {
                    {}
                  } else {
                    stryCov_9fa48("7493");
                    await fetchInfoSessions();
                  }
                } else {
                  if (stryMutAct_9fa48("7494")) {
                    {}
                  } else {
                    stryCov_9fa48("7494");
                    await fetchWorkshops();
                  }
                }
              }
            }
            if (stryMutAct_9fa48("7498") ? failureCount <= 0 : stryMutAct_9fa48("7497") ? failureCount >= 0 : stryMutAct_9fa48("7496") ? false : stryMutAct_9fa48("7495") ? true : (stryCov_9fa48("7495", "7496", "7497", "7498"), failureCount > 0)) {
              if (stryMutAct_9fa48("7499")) {
                {}
              } else {
                stryCov_9fa48("7499");
                const failureMessages = stryMutAct_9fa48("7500") ? results.map(r => `${r.applicant.display_name}: ${r.error}`).join('\n') : (stryCov_9fa48("7500"), results.filter(stryMutAct_9fa48("7501") ? () => undefined : (stryCov_9fa48("7501"), r => stryMutAct_9fa48("7502") ? r.success : (stryCov_9fa48("7502"), !r.success))).map(stryMutAct_9fa48("7503") ? () => undefined : (stryCov_9fa48("7503"), r => stryMutAct_9fa48("7504") ? `` : (stryCov_9fa48("7504"), `${r.applicant.display_name}: ${r.error}`))).join(stryMutAct_9fa48("7505") ? "" : (stryCov_9fa48("7505"), '\n')));
                setError(stryMutAct_9fa48("7506") ? `` : (stryCov_9fa48("7506"), `Some registrations failed:\n${failureMessages}`));
              }
            }
            if (stryMutAct_9fa48("7509") ? successCount !== results.length : stryMutAct_9fa48("7508") ? false : stryMutAct_9fa48("7507") ? true : (stryCov_9fa48("7507", "7508", "7509"), successCount === results.length)) {
              if (stryMutAct_9fa48("7510")) {
                {}
              } else {
                stryCov_9fa48("7510");
                closeAddRegistrationModal();
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7511")) {
            {}
          } else {
            stryCov_9fa48("7511");
            console.error(stryMutAct_9fa48("7512") ? "" : (stryCov_9fa48("7512"), 'Error registering applicants:'), error);
            setError(stryMutAct_9fa48("7513") ? "" : (stryCov_9fa48("7513"), 'Failed to register applicants. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("7514")) {
            {}
          } else {
            stryCov_9fa48("7514");
            setRegistrationLoading(stryMutAct_9fa48("7515") ? true : (stryCov_9fa48("7515"), false));
          }
        }
      }
    };

    // Remove/cancel a registration
    const handleRemoveRegistration = async (eventType, eventId, registrationId, applicantName) => {
      if (stryMutAct_9fa48("7516")) {
        {}
      } else {
        stryCov_9fa48("7516");
        try {
          if (stryMutAct_9fa48("7517")) {
            {}
          } else {
            stryCov_9fa48("7517");
            const result = await Swal.fire(stryMutAct_9fa48("7518") ? {} : (stryCov_9fa48("7518"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7519") ? "" : (stryCov_9fa48("7519"), 'Cancel Registration?'),
              text: stryMutAct_9fa48("7520") ? `` : (stryCov_9fa48("7520"), `Are you sure you want to cancel ${applicantName}'s registration? This action cannot be undone.`),
              icon: stryMutAct_9fa48("7521") ? "" : (stryCov_9fa48("7521"), 'warning'),
              showCancelButton: stryMutAct_9fa48("7522") ? false : (stryCov_9fa48("7522"), true),
              confirmButtonText: stryMutAct_9fa48("7523") ? "" : (stryCov_9fa48("7523"), 'Yes, cancel it!'),
              cancelButtonText: stryMutAct_9fa48("7524") ? "" : (stryCov_9fa48("7524"), 'Keep Registration'),
              iconColor: stryMutAct_9fa48("7525") ? "" : (stryCov_9fa48("7525"), '#fbbf24')
            }));
            if (stryMutAct_9fa48("7528") ? false : stryMutAct_9fa48("7527") ? true : stryMutAct_9fa48("7526") ? result.isConfirmed : (stryCov_9fa48("7526", "7527", "7528"), !result.isConfirmed)) {
              if (stryMutAct_9fa48("7529")) {
                {}
              } else {
                stryCov_9fa48("7529");
                return;
              }
            }
          }
        } catch (swalError) {
          if (stryMutAct_9fa48("7530")) {
            {}
          } else {
            stryCov_9fa48("7530");
            console.error(stryMutAct_9fa48("7531") ? "" : (stryCov_9fa48("7531"), 'Error showing confirmation dialog:'), swalError);
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("7532")) {
            {}
          } else {
            stryCov_9fa48("7532");
            const response = await fetch(stryMutAct_9fa48("7533") ? `` : (stryCov_9fa48("7533"), `${import.meta.env.VITE_API_URL}/api/admissions/events/${eventType}/${eventId}/registrations/${registrationId}`), stryMutAct_9fa48("7534") ? {} : (stryCov_9fa48("7534"), {
              method: stryMutAct_9fa48("7535") ? "" : (stryCov_9fa48("7535"), 'DELETE'),
              headers: stryMutAct_9fa48("7536") ? {} : (stryCov_9fa48("7536"), {
                'Authorization': stryMutAct_9fa48("7537") ? `` : (stryCov_9fa48("7537"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("7538") ? "" : (stryCov_9fa48("7538"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("7540") ? false : stryMutAct_9fa48("7539") ? true : (stryCov_9fa48("7539", "7540"), response.ok)) {
              if (stryMutAct_9fa48("7541")) {
                {}
              } else {
                stryCov_9fa48("7541");
                // Remove the registration from local state
                setEventRegistrations(stryMutAct_9fa48("7542") ? () => undefined : (stryCov_9fa48("7542"), prev => stryMutAct_9fa48("7543") ? prev : (stryCov_9fa48("7543"), prev.filter(stryMutAct_9fa48("7544") ? () => undefined : (stryCov_9fa48("7544"), reg => stryMutAct_9fa48("7547") ? reg.registration_id === registrationId : stryMutAct_9fa48("7546") ? false : stryMutAct_9fa48("7545") ? true : (stryCov_9fa48("7545", "7546", "7547"), reg.registration_id !== registrationId))))));

                // Update event counts
                if (stryMutAct_9fa48("7550") ? eventType !== 'info-session' : stryMutAct_9fa48("7549") ? false : stryMutAct_9fa48("7548") ? true : (stryCov_9fa48("7548", "7549", "7550"), eventType === (stryMutAct_9fa48("7551") ? "" : (stryCov_9fa48("7551"), 'info-session')))) {
                  if (stryMutAct_9fa48("7552")) {
                    {}
                  } else {
                    stryCov_9fa48("7552");
                    setInfoSessions(stryMutAct_9fa48("7553") ? () => undefined : (stryCov_9fa48("7553"), prevSessions => prevSessions.map(stryMutAct_9fa48("7554") ? () => undefined : (stryCov_9fa48("7554"), session => (stryMutAct_9fa48("7557") ? session.event_id !== eventId : stryMutAct_9fa48("7556") ? false : stryMutAct_9fa48("7555") ? true : (stryCov_9fa48("7555", "7556", "7557"), session.event_id === eventId)) ? stryMutAct_9fa48("7558") ? {} : (stryCov_9fa48("7558"), {
                      ...session,
                      registration_count: stryMutAct_9fa48("7559") ? session.registration_count + 1 : (stryCov_9fa48("7559"), session.registration_count - 1)
                    }) : session))));
                  }
                } else if (stryMutAct_9fa48("7562") ? eventType !== 'workshop' : stryMutAct_9fa48("7561") ? false : stryMutAct_9fa48("7560") ? true : (stryCov_9fa48("7560", "7561", "7562"), eventType === (stryMutAct_9fa48("7563") ? "" : (stryCov_9fa48("7563"), 'workshop')))) {
                  if (stryMutAct_9fa48("7564")) {
                    {}
                  } else {
                    stryCov_9fa48("7564");
                    setWorkshops(stryMutAct_9fa48("7565") ? () => undefined : (stryCov_9fa48("7565"), prevWorkshops => prevWorkshops.map(stryMutAct_9fa48("7566") ? () => undefined : (stryCov_9fa48("7566"), workshop => (stryMutAct_9fa48("7569") ? workshop.event_id !== eventId : stryMutAct_9fa48("7568") ? false : stryMutAct_9fa48("7567") ? true : (stryCov_9fa48("7567", "7568", "7569"), workshop.event_id === eventId)) ? stryMutAct_9fa48("7570") ? {} : (stryCov_9fa48("7570"), {
                      ...workshop,
                      registration_count: stryMutAct_9fa48("7571") ? workshop.registration_count + 1 : (stryCov_9fa48("7571"), workshop.registration_count - 1)
                    }) : workshop))));
                  }
                }

                // Show success message
                await Swal.fire(stryMutAct_9fa48("7572") ? {} : (stryCov_9fa48("7572"), {
                  ...darkSwalConfig,
                  title: stryMutAct_9fa48("7573") ? "" : (stryCov_9fa48("7573"), 'Registration Cancelled!'),
                  text: stryMutAct_9fa48("7574") ? `` : (stryCov_9fa48("7574"), `${applicantName}'s registration has been successfully cancelled.`),
                  icon: stryMutAct_9fa48("7575") ? "" : (stryCov_9fa48("7575"), 'success'),
                  timer: 2000,
                  showConfirmButton: stryMutAct_9fa48("7576") ? true : (stryCov_9fa48("7576"), false),
                  iconColor: stryMutAct_9fa48("7577") ? "" : (stryCov_9fa48("7577"), '#10b981')
                }));
              }
            } else {
              if (stryMutAct_9fa48("7578")) {
                {}
              } else {
                stryCov_9fa48("7578");
                const errorData = await response.json();
                await Swal.fire(stryMutAct_9fa48("7579") ? {} : (stryCov_9fa48("7579"), {
                  ...darkSwalConfig,
                  title: stryMutAct_9fa48("7580") ? "" : (stryCov_9fa48("7580"), 'Error!'),
                  text: stryMutAct_9fa48("7581") ? `` : (stryCov_9fa48("7581"), `Failed to cancel registration: ${errorData.error}`),
                  icon: stryMutAct_9fa48("7582") ? "" : (stryCov_9fa48("7582"), 'error'),
                  iconColor: stryMutAct_9fa48("7583") ? "" : (stryCov_9fa48("7583"), '#ef4444')
                }));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("7584")) {
            {}
          } else {
            stryCov_9fa48("7584");
            console.error(stryMutAct_9fa48("7585") ? "" : (stryCov_9fa48("7585"), 'Error cancelling registration:'), error);
            await Swal.fire(stryMutAct_9fa48("7586") ? {} : (stryCov_9fa48("7586"), {
              ...darkSwalConfig,
              title: stryMutAct_9fa48("7587") ? "" : (stryCov_9fa48("7587"), 'Error!'),
              text: stryMutAct_9fa48("7588") ? "" : (stryCov_9fa48("7588"), 'Failed to cancel registration. Please try again.'),
              icon: stryMutAct_9fa48("7589") ? "" : (stryCov_9fa48("7589"), 'error'),
              iconColor: stryMutAct_9fa48("7590") ? "" : (stryCov_9fa48("7590"), '#ef4444')
            }));
          }
        }
      }
    };

    // Loading state
    if (stryMutAct_9fa48("7592") ? false : stryMutAct_9fa48("7591") ? true : (stryCov_9fa48("7591", "7592"), loading)) {
      if (stryMutAct_9fa48("7593")) {
        {}
      } else {
        stryCov_9fa48("7593");
        return <div className="admissions-dashboard">
                <div className="admissions-dashboard__loading">
                    <div className="admissions-dashboard__loading-spinner"></div>
                    <p>Loading admissions data...</p>
                </div>
            </div>;
      }
    }

    // Error state
    if (stryMutAct_9fa48("7595") ? false : stryMutAct_9fa48("7594") ? true : (stryCov_9fa48("7594", "7595"), error)) {
      if (stryMutAct_9fa48("7596")) {
        {}
      } else {
        stryCov_9fa48("7596");
        return <div className="admissions-dashboard">
                <div className="admissions-dashboard__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchAdmissionsData} className="admissions-dashboard__retry-btn">
                        Try Again
                    </button>
                </div>
            </div>;
      }
    }

    // No access state
    if (stryMutAct_9fa48("7599") ? false : stryMutAct_9fa48("7598") ? true : stryMutAct_9fa48("7597") ? hasAdminAccess : (stryCov_9fa48("7597", "7598", "7599"), !hasAdminAccess)) {
      if (stryMutAct_9fa48("7600")) {
        {}
      } else {
        stryCov_9fa48("7600");
        return <div className="admissions-dashboard">
                <div className="admissions-dashboard__no-access">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view the admissions dashboard.</p>
                </div>
            </div>;
      }
    }
    return <div className="admissions-dashboard">
            {/* Tab Navigation */}
            <div className="admissions-dashboard__tabs">
                <button className={stryMutAct_9fa48("7601") ? `` : (stryCov_9fa48("7601"), `admissions-dashboard__tab ${(stryMutAct_9fa48("7604") ? activeTab !== 'overview' : stryMutAct_9fa48("7603") ? false : stryMutAct_9fa48("7602") ? true : (stryCov_9fa48("7602", "7603", "7604"), activeTab === (stryMutAct_9fa48("7605") ? "" : (stryCov_9fa48("7605"), 'overview')))) ? stryMutAct_9fa48("7606") ? "" : (stryCov_9fa48("7606"), 'admissions-dashboard__tab--active') : stryMutAct_9fa48("7607") ? "Stryker was here!" : (stryCov_9fa48("7607"), '')}`)} onClick={stryMutAct_9fa48("7608") ? () => undefined : (stryCov_9fa48("7608"), () => handleTabChange(stryMutAct_9fa48("7609") ? "" : (stryCov_9fa48("7609"), 'overview')))}>
                    Overview
                </button>
                <button className={stryMutAct_9fa48("7610") ? `` : (stryCov_9fa48("7610"), `admissions-dashboard__tab ${(stryMutAct_9fa48("7613") ? activeTab !== 'applications' : stryMutAct_9fa48("7612") ? false : stryMutAct_9fa48("7611") ? true : (stryCov_9fa48("7611", "7612", "7613"), activeTab === (stryMutAct_9fa48("7614") ? "" : (stryCov_9fa48("7614"), 'applications')))) ? stryMutAct_9fa48("7615") ? "" : (stryCov_9fa48("7615"), 'admissions-dashboard__tab--active') : stryMutAct_9fa48("7616") ? "Stryker was here!" : (stryCov_9fa48("7616"), '')}`)} onClick={stryMutAct_9fa48("7617") ? () => undefined : (stryCov_9fa48("7617"), () => handleTabChange(stryMutAct_9fa48("7618") ? "" : (stryCov_9fa48("7618"), 'applications')))}>
                    Applications
                </button>
                <button className={stryMutAct_9fa48("7619") ? `` : (stryCov_9fa48("7619"), `admissions-dashboard__tab ${(stryMutAct_9fa48("7622") ? activeTab !== 'info-sessions' : stryMutAct_9fa48("7621") ? false : stryMutAct_9fa48("7620") ? true : (stryCov_9fa48("7620", "7621", "7622"), activeTab === (stryMutAct_9fa48("7623") ? "" : (stryCov_9fa48("7623"), 'info-sessions')))) ? stryMutAct_9fa48("7624") ? "" : (stryCov_9fa48("7624"), 'admissions-dashboard__tab--active') : stryMutAct_9fa48("7625") ? "Stryker was here!" : (stryCov_9fa48("7625"), '')}`)} onClick={stryMutAct_9fa48("7626") ? () => undefined : (stryCov_9fa48("7626"), () => handleTabChange(stryMutAct_9fa48("7627") ? "" : (stryCov_9fa48("7627"), 'info-sessions')))}>
                    Info Sessions
                </button>
                <button className={stryMutAct_9fa48("7628") ? `` : (stryCov_9fa48("7628"), `admissions-dashboard__tab ${(stryMutAct_9fa48("7631") ? activeTab !== 'workshops' : stryMutAct_9fa48("7630") ? false : stryMutAct_9fa48("7629") ? true : (stryCov_9fa48("7629", "7630", "7631"), activeTab === (stryMutAct_9fa48("7632") ? "" : (stryCov_9fa48("7632"), 'workshops')))) ? stryMutAct_9fa48("7633") ? "" : (stryCov_9fa48("7633"), 'admissions-dashboard__tab--active') : stryMutAct_9fa48("7634") ? "Stryker was here!" : (stryCov_9fa48("7634"), '')}`)} onClick={stryMutAct_9fa48("7635") ? () => undefined : (stryCov_9fa48("7635"), () => handleTabChange(stryMutAct_9fa48("7636") ? "" : (stryCov_9fa48("7636"), 'workshops')))}>
                    Workshops
                </button>
                <button className={stryMutAct_9fa48("7637") ? `` : (stryCov_9fa48("7637"), `admissions-dashboard__tab ${(stryMutAct_9fa48("7640") ? activeTab !== 'emails' : stryMutAct_9fa48("7639") ? false : stryMutAct_9fa48("7638") ? true : (stryCov_9fa48("7638", "7639", "7640"), activeTab === (stryMutAct_9fa48("7641") ? "" : (stryCov_9fa48("7641"), 'emails')))) ? stryMutAct_9fa48("7642") ? "" : (stryCov_9fa48("7642"), 'admissions-dashboard__tab--active') : stryMutAct_9fa48("7643") ? "Stryker was here!" : (stryCov_9fa48("7643"), '')}`)} onClick={stryMutAct_9fa48("7644") ? () => undefined : (stryCov_9fa48("7644"), () => handleTabChange(stryMutAct_9fa48("7645") ? "" : (stryCov_9fa48("7645"), 'emails')))}>
                    Emails
                </button>
                <button className="admissions-dashboard__back-btn" onClick={stryMutAct_9fa48("7646") ? () => undefined : (stryCov_9fa48("7646"), () => navigate(stryMutAct_9fa48("7647") ? "" : (stryCov_9fa48("7647"), '/dashboard')))}>
                    ← Back
                </button>
            </div>

            {stryMutAct_9fa48("7650") ? error || <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div> : stryMutAct_9fa48("7649") ? false : stryMutAct_9fa48("7648") ? true : (stryCov_9fa48("7648", "7649", "7650"), error && <div className="error-message">
                    <p>{error}</p>
                    <button onClick={stryMutAct_9fa48("7651") ? () => undefined : (stryCov_9fa48("7651"), () => setError(null))}>Dismiss</button>
                </div>)}

            {/* Tab Content */}
            <div className="admissions-dashboard__content">
                {stryMutAct_9fa48("7654") ? activeTab === 'overview' || <div className="admissions-dashboard__overview">
                        {loading ? <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading statistics...</p>
                            </div> : error ? <div className="admissions-dashboard__error">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                                <button onClick={fetchAdmissionsData} className="admissions-dashboard__retry-btn">Retry</button>
                            </div> : stats ? <div className="admissions-dashboard__stats-grid">
                                {/* Overall Applicants */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Total Applicants</h3>
                                        <div className="admissions-dashboard__stat-card-icon">👥</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stats.totalApplicants || 0}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">All registered applicants</div>
                                </div>

                                {/* Applications by Status */}
                                <div className="admissions-dashboard__stat-card admissions-dashboard__stat-card--wide">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Applicants</h3>
                                        <div className="admissions-dashboard__stat-card-icon">📝</div>
                                    </div>
                                    <div className="admissions-dashboard__applications-breakdown">
                                        {stats.applicationStats?.map(statusGroup => <div key={statusGroup.status} className="admissions-dashboard__application-status-item">
                                                <span className={`admissions-dashboard__status-indicator admissions-dashboard__status-indicator--${statusGroup.status}`}></span>
                                                <span className="admissions-dashboard__status-label">{statusGroup.status}</span>
                                                <span className="admissions-dashboard__status-count">{statusGroup.count}</span>
                                            </div>)}
                                    </div>
                                </div>

                                {/* Info Sessions */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Info Sessions</h3>
                                        <div className="admissions-dashboard__stat-card-icon">ℹ️</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stats.infoSessions?.totalSessions || 0}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">
                                        {stats.infoSessions?.totalRegistrations || 0} registrations, {stats.infoSessions?.totalAttended || 0} attended
                                    </div>
                                </div>

                                {/* Workshops */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Workshops</h3>
                                        <div className="admissions-dashboard__stat-card-icon">🛠️</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stats.workshops?.totalWorkshops || 0}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">
                                        {stats.workshops?.totalRegistrations || 0} registrations, {stats.workshops?.totalAttended || 0} attended
                                    </div>
                                </div>

                                {/* Assessment Funnel */}
                                <div className="admissions-dashboard__stat-card admissions-dashboard__stat-card--wide">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Assessment Funnel</h3>
                                        <div className="admissions-dashboard__stat-card-icon">🎯</div>
                                    </div>
                                    <div className="admissions-dashboard__assessment-funnel">
                                        {stats.assessmentFunnel?.map(assessment => <div key={assessment.status} className="admissions-dashboard__assessment-funnel-item">
                                                <span className={`admissions-dashboard__assessment-funnel-indicator admissions-dashboard__assessment-funnel-indicator--${assessment.status.replace('_', '-')}`}></span>
                                                <span className="admissions-dashboard__assessment-funnel-label">
                                                    {assessment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="admissions-dashboard__assessment-funnel-count">{assessment.count}</span>
                                                {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count !== assessment.count && <span className="admissions-dashboard__assessment-funnel-override" title="Human override detected">
                                                        🔀 {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count || 0}
                                                    </span>}
                                            </div>)}
                                    </div>
                                </div>

                                {/* Workshop Invitations */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Workshop Pipeline</h3>
                                        <div className="admissions-dashboard__stat-card-icon">📊</div>
                                    </div>
                                    <div className="admissions-dashboard__workshop-pipeline">
                                        {stats.workshopInvitations?.map(workshop => <div key={workshop.status} className="admissions-dashboard__workshop-pipeline-item">
                                                <span className={`admissions-dashboard__workshop-pipeline-indicator admissions-dashboard__workshop-pipeline-indicator--${workshop.status}`}></span>
                                                <span className="admissions-dashboard__workshop-pipeline-label">
                                                    {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                                                </span>
                                                <span className="admissions-dashboard__workshop-pipeline-count">{workshop.count}</span>
                                            </div>)}
                                    </div>
                                </div>
                            </div> : <div className="admissions-dashboard__no-data">
                                <p>No statistics available</p>
                            </div>}
                    </div> : stryMutAct_9fa48("7653") ? false : stryMutAct_9fa48("7652") ? true : (stryCov_9fa48("7652", "7653", "7654"), (stryMutAct_9fa48("7656") ? activeTab !== 'overview' : stryMutAct_9fa48("7655") ? true : (stryCov_9fa48("7655", "7656"), activeTab === (stryMutAct_9fa48("7657") ? "" : (stryCov_9fa48("7657"), 'overview')))) && <div className="admissions-dashboard__overview">
                        {loading ? <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading statistics...</p>
                            </div> : error ? <div className="admissions-dashboard__error">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                                <button onClick={fetchAdmissionsData} className="admissions-dashboard__retry-btn">Retry</button>
                            </div> : stats ? <div className="admissions-dashboard__stats-grid">
                                {/* Overall Applicants */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Total Applicants</h3>
                                        <div className="admissions-dashboard__stat-card-icon">👥</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stryMutAct_9fa48("7660") ? stats.totalApplicants && 0 : stryMutAct_9fa48("7659") ? false : stryMutAct_9fa48("7658") ? true : (stryCov_9fa48("7658", "7659", "7660"), stats.totalApplicants || 0)}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">All registered applicants</div>
                                </div>

                                {/* Applications by Status */}
                                <div className="admissions-dashboard__stat-card admissions-dashboard__stat-card--wide">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Applicants</h3>
                                        <div className="admissions-dashboard__stat-card-icon">📝</div>
                                    </div>
                                    <div className="admissions-dashboard__applications-breakdown">
                                        {stryMutAct_9fa48("7661") ? stats.applicationStats.map(statusGroup => <div key={statusGroup.status} className="admissions-dashboard__application-status-item">
                                                <span className={`admissions-dashboard__status-indicator admissions-dashboard__status-indicator--${statusGroup.status}`}></span>
                                                <span className="admissions-dashboard__status-label">{statusGroup.status}</span>
                                                <span className="admissions-dashboard__status-count">{statusGroup.count}</span>
                                            </div>) : (stryCov_9fa48("7661"), stats.applicationStats?.map(stryMutAct_9fa48("7662") ? () => undefined : (stryCov_9fa48("7662"), statusGroup => <div key={statusGroup.status} className="admissions-dashboard__application-status-item">
                                                <span className={stryMutAct_9fa48("7663") ? `` : (stryCov_9fa48("7663"), `admissions-dashboard__status-indicator admissions-dashboard__status-indicator--${statusGroup.status}`)}></span>
                                                <span className="admissions-dashboard__status-label">{statusGroup.status}</span>
                                                <span className="admissions-dashboard__status-count">{statusGroup.count}</span>
                                            </div>)))}
                                    </div>
                                </div>

                                {/* Info Sessions */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Info Sessions</h3>
                                        <div className="admissions-dashboard__stat-card-icon">ℹ️</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stryMutAct_9fa48("7666") ? stats.infoSessions?.totalSessions && 0 : stryMutAct_9fa48("7665") ? false : stryMutAct_9fa48("7664") ? true : (stryCov_9fa48("7664", "7665", "7666"), (stryMutAct_9fa48("7667") ? stats.infoSessions.totalSessions : (stryCov_9fa48("7667"), stats.infoSessions?.totalSessions)) || 0)}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">
                                        {stryMutAct_9fa48("7670") ? stats.infoSessions?.totalRegistrations && 0 : stryMutAct_9fa48("7669") ? false : stryMutAct_9fa48("7668") ? true : (stryCov_9fa48("7668", "7669", "7670"), (stryMutAct_9fa48("7671") ? stats.infoSessions.totalRegistrations : (stryCov_9fa48("7671"), stats.infoSessions?.totalRegistrations)) || 0)} registrations, {stryMutAct_9fa48("7674") ? stats.infoSessions?.totalAttended && 0 : stryMutAct_9fa48("7673") ? false : stryMutAct_9fa48("7672") ? true : (stryCov_9fa48("7672", "7673", "7674"), (stryMutAct_9fa48("7675") ? stats.infoSessions.totalAttended : (stryCov_9fa48("7675"), stats.infoSessions?.totalAttended)) || 0)} attended
                                    </div>
                                </div>

                                {/* Workshops */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Workshops</h3>
                                        <div className="admissions-dashboard__stat-card-icon">🛠️</div>
                                    </div>
                                    <div className="admissions-dashboard__stat-card-value">{stryMutAct_9fa48("7678") ? stats.workshops?.totalWorkshops && 0 : stryMutAct_9fa48("7677") ? false : stryMutAct_9fa48("7676") ? true : (stryCov_9fa48("7676", "7677", "7678"), (stryMutAct_9fa48("7679") ? stats.workshops.totalWorkshops : (stryCov_9fa48("7679"), stats.workshops?.totalWorkshops)) || 0)}</div>
                                    <div className="admissions-dashboard__stat-card-subtitle">
                                        {stryMutAct_9fa48("7682") ? stats.workshops?.totalRegistrations && 0 : stryMutAct_9fa48("7681") ? false : stryMutAct_9fa48("7680") ? true : (stryCov_9fa48("7680", "7681", "7682"), (stryMutAct_9fa48("7683") ? stats.workshops.totalRegistrations : (stryCov_9fa48("7683"), stats.workshops?.totalRegistrations)) || 0)} registrations, {stryMutAct_9fa48("7686") ? stats.workshops?.totalAttended && 0 : stryMutAct_9fa48("7685") ? false : stryMutAct_9fa48("7684") ? true : (stryCov_9fa48("7684", "7685", "7686"), (stryMutAct_9fa48("7687") ? stats.workshops.totalAttended : (stryCov_9fa48("7687"), stats.workshops?.totalAttended)) || 0)} attended
                                    </div>
                                </div>

                                {/* Assessment Funnel */}
                                <div className="admissions-dashboard__stat-card admissions-dashboard__stat-card--wide">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Assessment Funnel</h3>
                                        <div className="admissions-dashboard__stat-card-icon">🎯</div>
                                    </div>
                                    <div className="admissions-dashboard__assessment-funnel">
                                        {stryMutAct_9fa48("7688") ? stats.assessmentFunnel.map(assessment => <div key={assessment.status} className="admissions-dashboard__assessment-funnel-item">
                                                <span className={`admissions-dashboard__assessment-funnel-indicator admissions-dashboard__assessment-funnel-indicator--${assessment.status.replace('_', '-')}`}></span>
                                                <span className="admissions-dashboard__assessment-funnel-label">
                                                    {assessment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="admissions-dashboard__assessment-funnel-count">{assessment.count}</span>
                                                {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count !== assessment.count && <span className="admissions-dashboard__assessment-funnel-override" title="Human override detected">
                                                        🔀 {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count || 0}
                                                    </span>}
                                            </div>) : (stryCov_9fa48("7688"), stats.assessmentFunnel?.map(stryMutAct_9fa48("7689") ? () => undefined : (stryCov_9fa48("7689"), assessment => <div key={assessment.status} className="admissions-dashboard__assessment-funnel-item">
                                                <span className={stryMutAct_9fa48("7690") ? `` : (stryCov_9fa48("7690"), `admissions-dashboard__assessment-funnel-indicator admissions-dashboard__assessment-funnel-indicator--${assessment.status.replace(stryMutAct_9fa48("7691") ? "" : (stryCov_9fa48("7691"), '_'), stryMutAct_9fa48("7692") ? "" : (stryCov_9fa48("7692"), '-'))}`)}></span>
                                                <span className="admissions-dashboard__assessment-funnel-label">
                                                    {assessment.status.replace(stryMutAct_9fa48("7693") ? "" : (stryCov_9fa48("7693"), '_'), stryMutAct_9fa48("7694") ? "" : (stryCov_9fa48("7694"), ' ')).replace(stryMutAct_9fa48("7695") ? /\b\W/g : (stryCov_9fa48("7695"), /\b\w/g), stryMutAct_9fa48("7696") ? () => undefined : (stryCov_9fa48("7696"), l => stryMutAct_9fa48("7697") ? l.toLowerCase() : (stryCov_9fa48("7697"), l.toUpperCase())))}
                                                </span>
                                                <span className="admissions-dashboard__assessment-funnel-count">{assessment.count}</span>
                                                {stryMutAct_9fa48("7700") ? stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count !== assessment.count || <span className="admissions-dashboard__assessment-funnel-override" title="Human override detected">
                                                        🔀 {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count || 0}
                                                    </span> : stryMutAct_9fa48("7699") ? false : stryMutAct_9fa48("7698") ? true : (stryCov_9fa48("7698", "7699", "7700"), (stryMutAct_9fa48("7702") ? stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count === assessment.count : stryMutAct_9fa48("7701") ? true : (stryCov_9fa48("7701", "7702"), (stryMutAct_9fa48("7704") ? stats.finalStatusCounts.find(f => f.status === assessment.status)?.count : stryMutAct_9fa48("7703") ? stats.finalStatusCounts?.find(f => f.status === assessment.status).count : (stryCov_9fa48("7703", "7704"), stats.finalStatusCounts?.find(stryMutAct_9fa48("7705") ? () => undefined : (stryCov_9fa48("7705"), f => stryMutAct_9fa48("7708") ? f.status !== assessment.status : stryMutAct_9fa48("7707") ? false : stryMutAct_9fa48("7706") ? true : (stryCov_9fa48("7706", "7707", "7708"), f.status === assessment.status)))?.count)) !== assessment.count)) && <span className="admissions-dashboard__assessment-funnel-override" title="Human override detected">
                                                        🔀 {stryMutAct_9fa48("7711") ? stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count && 0 : stryMutAct_9fa48("7710") ? false : stryMutAct_9fa48("7709") ? true : (stryCov_9fa48("7709", "7710", "7711"), (stryMutAct_9fa48("7713") ? stats.finalStatusCounts.find(f => f.status === assessment.status)?.count : stryMutAct_9fa48("7712") ? stats.finalStatusCounts?.find(f => f.status === assessment.status).count : (stryCov_9fa48("7712", "7713"), stats.finalStatusCounts?.find(stryMutAct_9fa48("7714") ? () => undefined : (stryCov_9fa48("7714"), f => stryMutAct_9fa48("7717") ? f.status !== assessment.status : stryMutAct_9fa48("7716") ? false : stryMutAct_9fa48("7715") ? true : (stryCov_9fa48("7715", "7716", "7717"), f.status === assessment.status)))?.count)) || 0)}
                                                    </span>)}
                                            </div>)))}
                                    </div>
                                </div>

                                {/* Workshop Invitations */}
                                <div className="admissions-dashboard__stat-card">
                                    <div className="admissions-dashboard__stat-card-header">
                                        <h3 className="admissions-dashboard__stat-card-title">Workshop Pipeline</h3>
                                        <div className="admissions-dashboard__stat-card-icon">📊</div>
                                    </div>
                                    <div className="admissions-dashboard__workshop-pipeline">
                                        {stryMutAct_9fa48("7718") ? stats.workshopInvitations.map(workshop => <div key={workshop.status} className="admissions-dashboard__workshop-pipeline-item">
                                                <span className={`admissions-dashboard__workshop-pipeline-indicator admissions-dashboard__workshop-pipeline-indicator--${workshop.status}`}></span>
                                                <span className="admissions-dashboard__workshop-pipeline-label">
                                                    {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                                                </span>
                                                <span className="admissions-dashboard__workshop-pipeline-count">{workshop.count}</span>
                                            </div>) : (stryCov_9fa48("7718"), stats.workshopInvitations?.map(stryMutAct_9fa48("7719") ? () => undefined : (stryCov_9fa48("7719"), workshop => <div key={workshop.status} className="admissions-dashboard__workshop-pipeline-item">
                                                <span className={stryMutAct_9fa48("7720") ? `` : (stryCov_9fa48("7720"), `admissions-dashboard__workshop-pipeline-indicator admissions-dashboard__workshop-pipeline-indicator--${workshop.status}`)}></span>
                                                <span className="admissions-dashboard__workshop-pipeline-label">
                                                    {stryMutAct_9fa48("7721") ? workshop.status.charAt(0).toUpperCase() - workshop.status.slice(1) : (stryCov_9fa48("7721"), (stryMutAct_9fa48("7723") ? workshop.status.toUpperCase() : stryMutAct_9fa48("7722") ? workshop.status.charAt(0).toLowerCase() : (stryCov_9fa48("7722", "7723"), workshop.status.charAt(0).toUpperCase())) + (stryMutAct_9fa48("7724") ? workshop.status : (stryCov_9fa48("7724"), workshop.status.slice(1))))}
                                                </span>
                                                <span className="admissions-dashboard__workshop-pipeline-count">{workshop.count}</span>
                                            </div>)))}
                                    </div>
                                </div>
                            </div> : <div className="admissions-dashboard__no-data">
                                <p>No statistics available</p>
                            </div>}
                    </div>)}

                {stryMutAct_9fa48("7727") ? activeTab === 'applications' || <div className="admissions-dashboard__applications">
                        <div className="data-section__header">
                            <div className="data-section__controls">
                                <input type="text" placeholder="Search by name..." value={nameSearchInput} onChange={e => setNameSearchInput(e.target.value)} className="name-search-input" />
                                <select value={applicationFilters.status || ''} onChange={e => setApplicationFilters({
                ...applicationFilters,
                status: e.target.value
              })} className="filter-select">
                                    <option value="">Application Status: All</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ineligible">Ineligible</option>
                                </select>
                                <select value={applicationFilters.info_session_status || ''} onChange={e => setApplicationFilters({
                ...applicationFilters,
                info_session_status: e.target.value
              })} className="filter-select">
                                    <option value="">Info Session: All</option>
                                    <option value="not_registered">Not Registered</option>
                                    <option value="registered">Registered</option>
                                    <option value="attended">Attended</option>
                                    <option value="attended_late">Attended Late</option>
                                    <option value="very_late">Very Late</option>
                                    <option value="no_show">No Show</option>
                                </select>
                                <select value={applicationFilters.workshop_status || ''} onChange={e => setApplicationFilters({
                ...applicationFilters,
                workshop_status: e.target.value
              })} className="filter-select">
                                    <option value="">Workshop: All</option>
                                    <option value="pending">Pending</option>
                                    <option value="invited">Invited</option>
                                    <option value="registered">Registered</option>
                                    <option value="attended">Attended</option>
                                    <option value="no_show">No Show</option>
                                </select>
                                <select value={applicationFilters.program_admission_status || ''} onChange={e => setApplicationFilters({
                ...applicationFilters,
                program_admission_status: e.target.value
              })} className="filter-select">
                                    <option value="">Admission: All</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="waitlisted">Waitlisted</option>
                                    <option value="deferred">Deferred</option>
                                </select>
                                <button className={`filter-toggle-btn ${applicationFilters.ready_for_workshop_invitation ? 'filter-toggle-btn--active' : ''}`} onClick={() => setApplicationFilters({
                ...applicationFilters,
                ready_for_workshop_invitation: !applicationFilters.ready_for_workshop_invitation
              })} type="button">
                                    <span className="filter-toggle-btn__icon">
                                        {applicationFilters.ready_for_workshop_invitation ? '✓' : '○'}
                                    </span>
                                    Ready for Workshop Invitation
                                </button>
                                <button className="admissions-dashboard__bulk-actions-btn" disabled={selectedApplicants.length === 0} onClick={() => setBulkActionsModalOpen(true)}>
                                    Actions ({selectedApplicants.length})
                                </button>
                                <button className="admissions-dashboard__export-csv-btn" disabled={selectedApplicants.length === 0} onClick={handleExportCSV}>
                                    Export CSV ({selectedApplicants.length})
                                </button>
                                <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
                            </div>
                        </div>

                        {loading ? <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading applicants...</p>
                            </div> : applications?.applications?.length > 0 ? <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="admissions-dashboard__checkbox-column">
                                                <input type="checkbox" className="admissions-dashboard__select-all-checkbox" checked={selectedApplicants.length === applications.applications?.length && applications.applications?.length > 0} onChange={e => {
                      if (e.target.checked) {
                        setSelectedApplicants(applications.applications?.map(app => app.applicant_id) || []);
                      } else {
                        setSelectedApplicants([]);
                      }
                    }} />
                                            </th>
                                            <th className="sortable-header" onClick={() => handleColumnSort('name')}>
                                                Name
                                                {columnSort.column === 'name' && <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>}
                                            </th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th className="sortable-header" onClick={() => handleColumnSort('status')}>
                                                Status
                                                {columnSort.column === 'status' && <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>}
                                            </th>
                                            <th className="sortable-header" onClick={() => handleColumnSort('assessment')}>
                                                Assessment
                                                {columnSort.column === 'assessment' && <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>}
                                            </th>
                                            <th className="sortable-header" onClick={() => handleColumnSort('info_session')}>
                                                Info Session
                                                {columnSort.column === 'info_session' && <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>}
                                            </th>
                                            <th className="sortable-header" onClick={() => handleColumnSort('workshop')}>
                                                Workshop
                                                {columnSort.column === 'workshop' && <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>}
                                            </th>
                                            <th>Admission</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortAndFilterApplications(applications.applications).map(app => <tr key={app.application_id} className={`clickable-row ${selectedApplicants.includes(app.applicant_id) ? 'admissions-dashboard__row--selected' : ''}`}>
                                                <td className="admissions-dashboard__checkbox-column">
                                                    <input type="checkbox" className="admissions-dashboard__row-checkbox" checked={selectedApplicants.includes(app.applicant_id)} onChange={e => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedApplicants([...selectedApplicants, app.applicant_id]);
                      } else {
                        setSelectedApplicants(selectedApplicants.filter(id => id !== app.applicant_id));
                      }
                    }} />
                                                </td>
                                                <td onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)} className="clickable-cell">
                                                    <div className="applicant-name">
                                                        {app.full_name || `${app.first_name} ${app.last_name}`}
                                                        {app.has_masters_degree && <span className="admissions-dashboard__masters-flag" title="Has Masters Degree">🎓</span>}
                                                        {app.missing_count > 0 && <span className="admissions-dashboard__missing-flag" title={`${app.missing_count} key questions incomplete`}>
                                                                ⚠️ {app.missing_count}
                                                            </span>}
                                                    </div>
                                                </td>
                                                <td className="clickable-cell">
                                                    <span className="copyable-email" onClick={e => {
                      e.stopPropagation();
                      handleEmailClick(app.email);
                    }} title="Click to copy email">
                                                        {app.email}
                                                    </span>
                                                </td>
                                                <td className="clickable-cell">
                                                    <span className="copyable-phone" onClick={e => {
                      e.stopPropagation();
                      handlePhoneClick(app.phone_number);
                    }} title="Click to copy phone number">
                                                        {formatPhoneNumber(app.phone_number)}
                                                    </span>
                                                </td>
                                                <td onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)} className="clickable-cell">
                                                    <span className={`status-badge status-badge--${app.status}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="admissions-dashboard__assessment-cell">
                                                    <div className="admissions-dashboard__assessment-container">
                                                        {app.final_status || app.recommendation ? <select className={`admissions-dashboard__assessment-select assessment-badge--${app.final_status || app.recommendation}`} value={app.final_status || app.recommendation} onChange={e => handleStatusChange(app.application_id, e.target.value)} onClick={e => e.stopPropagation()}>
                                                                <option value="strong_recommend">Strong Recommend</option>
                                                                <option value="recommend">Recommend</option>
                                                                <option value="review_needed">Review Needed</option>
                                                                <option value="not_recommend">Not Recommend</option>
                                                            </select> : <span className="assessment-badge assessment-badge--pending">
                                                                pending
                                                            </span>}
                                                        {app.has_human_override && <span className="admissions-dashboard__override-indicator" title="Human override applied">🔀</span>}
                                                    </div>
                                                </td>
                                                <td onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)} className="clickable-cell">
                                                    <span className={`info-session-badge info-session-badge--${app.info_session_status || 'not_registered'}`}>
                                                        {(app.info_session_status || 'not_registered').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)} className="clickable-cell">
                                                    <span className={`workshop-badge workshop-badge--${app.workshop_status || 'pending'}`}>
                                                        {(app.workshop_status || 'pending').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)} className="clickable-cell">
                                                    <span className={`admission-badge admission-badge--${app.program_admission_status || 'pending'}`}>
                                                        {(app.program_admission_status || 'pending').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="notes-btn" onClick={e => {
                      e.stopPropagation();
                      openNotesModal({
                        applicant_id: app.applicant_id,
                        name: app.full_name || `${app.first_name} ${app.last_name}`
                      });
                    }}>
                                                        Notes
                                                    </button>
                                                </td>
                                            </tr>)}
                                    </tbody>
                                </table>

                                <div className="table-footer">
                                    <span className="table-count">
                                        Showing {applications.applications.length} applicants
                                        {applications.total > applications.applications.length && ` of ${applications.total} total`}
                                    </span>
                                    {applications.total > applicationFilters.limit && <div className="pagination-controls">
                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit)
                }))} disabled={applicationFilters.offset === 0} className="pagination-btn">
                                                ← Previous
                                            </button>

                                            <span className="pagination-info">
                                                Page {Math.floor(applicationFilters.offset / applicationFilters.limit) + 1} of {Math.ceil(applications.total / applicationFilters.limit)}
                                            </span>

                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  offset: prev.offset + prev.limit
                }))} disabled={applicationFilters.offset + applicationFilters.limit >= applications.total} className="pagination-btn">
                                                Next →
                                            </button>

                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  limit: applications.total,
                  offset: 0
                }))} className="pagination-btn show-all-btn">
                                                Show All ({applications.total})
                                            </button>
                                        </div>}
                                </div>
                            </div> : <div className="no-data-message">
                                <p>No applicants found</p>
                                {(applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation || applicationFilters.name_search || nameSearchInput) && <button onClick={() => {
              setNameSearchInput('');
              setApplicationFilters({
                status: '',
                info_session_status: '',
                workshop_status: '',
                program_admission_status: '',
                ready_for_workshop_invitation: false,
                name_search: '',
                limit: applicationFilters.limit,
                offset: 0
              });
            }} className="clear-filter-btn">
                                        Clear filters
                                    </button>}
                            </div>}
                    </div> : stryMutAct_9fa48("7726") ? false : stryMutAct_9fa48("7725") ? true : (stryCov_9fa48("7725", "7726", "7727"), (stryMutAct_9fa48("7729") ? activeTab !== 'applications' : stryMutAct_9fa48("7728") ? true : (stryCov_9fa48("7728", "7729"), activeTab === (stryMutAct_9fa48("7730") ? "" : (stryCov_9fa48("7730"), 'applications')))) && <div className="admissions-dashboard__applications">
                        <div className="data-section__header">
                            <div className="data-section__controls">
                                <input type="text" placeholder="Search by name..." value={nameSearchInput} onChange={stryMutAct_9fa48("7731") ? () => undefined : (stryCov_9fa48("7731"), e => setNameSearchInput(e.target.value))} className="name-search-input" />
                                <select value={stryMutAct_9fa48("7734") ? applicationFilters.status && '' : stryMutAct_9fa48("7733") ? false : stryMutAct_9fa48("7732") ? true : (stryCov_9fa48("7732", "7733", "7734"), applicationFilters.status || (stryMutAct_9fa48("7735") ? "Stryker was here!" : (stryCov_9fa48("7735"), '')))} onChange={stryMutAct_9fa48("7736") ? () => undefined : (stryCov_9fa48("7736"), e => setApplicationFilters(stryMutAct_9fa48("7737") ? {} : (stryCov_9fa48("7737"), {
                ...applicationFilters,
                status: e.target.value
              })))} className="filter-select">
                                    <option value="">Application Status: All</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ineligible">Ineligible</option>
                                </select>
                                <select value={stryMutAct_9fa48("7740") ? applicationFilters.info_session_status && '' : stryMutAct_9fa48("7739") ? false : stryMutAct_9fa48("7738") ? true : (stryCov_9fa48("7738", "7739", "7740"), applicationFilters.info_session_status || (stryMutAct_9fa48("7741") ? "Stryker was here!" : (stryCov_9fa48("7741"), '')))} onChange={stryMutAct_9fa48("7742") ? () => undefined : (stryCov_9fa48("7742"), e => setApplicationFilters(stryMutAct_9fa48("7743") ? {} : (stryCov_9fa48("7743"), {
                ...applicationFilters,
                info_session_status: e.target.value
              })))} className="filter-select">
                                    <option value="">Info Session: All</option>
                                    <option value="not_registered">Not Registered</option>
                                    <option value="registered">Registered</option>
                                    <option value="attended">Attended</option>
                                    <option value="attended_late">Attended Late</option>
                                    <option value="very_late">Very Late</option>
                                    <option value="no_show">No Show</option>
                                </select>
                                <select value={stryMutAct_9fa48("7746") ? applicationFilters.workshop_status && '' : stryMutAct_9fa48("7745") ? false : stryMutAct_9fa48("7744") ? true : (stryCov_9fa48("7744", "7745", "7746"), applicationFilters.workshop_status || (stryMutAct_9fa48("7747") ? "Stryker was here!" : (stryCov_9fa48("7747"), '')))} onChange={stryMutAct_9fa48("7748") ? () => undefined : (stryCov_9fa48("7748"), e => setApplicationFilters(stryMutAct_9fa48("7749") ? {} : (stryCov_9fa48("7749"), {
                ...applicationFilters,
                workshop_status: e.target.value
              })))} className="filter-select">
                                    <option value="">Workshop: All</option>
                                    <option value="pending">Pending</option>
                                    <option value="invited">Invited</option>
                                    <option value="registered">Registered</option>
                                    <option value="attended">Attended</option>
                                    <option value="no_show">No Show</option>
                                </select>
                                <select value={stryMutAct_9fa48("7752") ? applicationFilters.program_admission_status && '' : stryMutAct_9fa48("7751") ? false : stryMutAct_9fa48("7750") ? true : (stryCov_9fa48("7750", "7751", "7752"), applicationFilters.program_admission_status || (stryMutAct_9fa48("7753") ? "Stryker was here!" : (stryCov_9fa48("7753"), '')))} onChange={stryMutAct_9fa48("7754") ? () => undefined : (stryCov_9fa48("7754"), e => setApplicationFilters(stryMutAct_9fa48("7755") ? {} : (stryCov_9fa48("7755"), {
                ...applicationFilters,
                program_admission_status: e.target.value
              })))} className="filter-select">
                                    <option value="">Admission: All</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="waitlisted">Waitlisted</option>
                                    <option value="deferred">Deferred</option>
                                </select>
                                <button className={stryMutAct_9fa48("7756") ? `` : (stryCov_9fa48("7756"), `filter-toggle-btn ${applicationFilters.ready_for_workshop_invitation ? stryMutAct_9fa48("7757") ? "" : (stryCov_9fa48("7757"), 'filter-toggle-btn--active') : stryMutAct_9fa48("7758") ? "Stryker was here!" : (stryCov_9fa48("7758"), '')}`)} onClick={stryMutAct_9fa48("7759") ? () => undefined : (stryCov_9fa48("7759"), () => setApplicationFilters(stryMutAct_9fa48("7760") ? {} : (stryCov_9fa48("7760"), {
                ...applicationFilters,
                ready_for_workshop_invitation: stryMutAct_9fa48("7761") ? applicationFilters.ready_for_workshop_invitation : (stryCov_9fa48("7761"), !applicationFilters.ready_for_workshop_invitation)
              })))} type="button">
                                    <span className="filter-toggle-btn__icon">
                                        {applicationFilters.ready_for_workshop_invitation ? stryMutAct_9fa48("7762") ? "" : (stryCov_9fa48("7762"), '✓') : stryMutAct_9fa48("7763") ? "" : (stryCov_9fa48("7763"), '○')}
                                    </span>
                                    Ready for Workshop Invitation
                                </button>
                                <button className="admissions-dashboard__bulk-actions-btn" disabled={stryMutAct_9fa48("7766") ? selectedApplicants.length !== 0 : stryMutAct_9fa48("7765") ? false : stryMutAct_9fa48("7764") ? true : (stryCov_9fa48("7764", "7765", "7766"), selectedApplicants.length === 0)} onClick={stryMutAct_9fa48("7767") ? () => undefined : (stryCov_9fa48("7767"), () => setBulkActionsModalOpen(stryMutAct_9fa48("7768") ? false : (stryCov_9fa48("7768"), true)))}>
                                    Actions ({selectedApplicants.length})
                                </button>
                                <button className="admissions-dashboard__export-csv-btn" disabled={stryMutAct_9fa48("7771") ? selectedApplicants.length !== 0 : stryMutAct_9fa48("7770") ? false : stryMutAct_9fa48("7769") ? true : (stryCov_9fa48("7769", "7770", "7771"), selectedApplicants.length === 0)} onClick={handleExportCSV}>
                                    Export CSV ({selectedApplicants.length})
                                </button>
                                <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
                            </div>
                        </div>

                        {loading ? <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading applicants...</p>
                            </div> : (stryMutAct_9fa48("7775") ? applications?.applications?.length <= 0 : stryMutAct_9fa48("7774") ? applications?.applications?.length >= 0 : stryMutAct_9fa48("7773") ? false : stryMutAct_9fa48("7772") ? true : (stryCov_9fa48("7772", "7773", "7774", "7775"), (stryMutAct_9fa48("7777") ? applications.applications?.length : stryMutAct_9fa48("7776") ? applications?.applications.length : (stryCov_9fa48("7776", "7777"), applications?.applications?.length)) > 0)) ? <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="admissions-dashboard__checkbox-column">
                                                <input type="checkbox" className="admissions-dashboard__select-all-checkbox" checked={stryMutAct_9fa48("7780") ? selectedApplicants.length === applications.applications?.length || applications.applications?.length > 0 : stryMutAct_9fa48("7779") ? false : stryMutAct_9fa48("7778") ? true : (stryCov_9fa48("7778", "7779", "7780"), (stryMutAct_9fa48("7782") ? selectedApplicants.length !== applications.applications?.length : stryMutAct_9fa48("7781") ? true : (stryCov_9fa48("7781", "7782"), selectedApplicants.length === (stryMutAct_9fa48("7783") ? applications.applications.length : (stryCov_9fa48("7783"), applications.applications?.length)))) && (stryMutAct_9fa48("7786") ? applications.applications?.length <= 0 : stryMutAct_9fa48("7785") ? applications.applications?.length >= 0 : stryMutAct_9fa48("7784") ? true : (stryCov_9fa48("7784", "7785", "7786"), (stryMutAct_9fa48("7787") ? applications.applications.length : (stryCov_9fa48("7787"), applications.applications?.length)) > 0)))} onChange={e => {
                      if (stryMutAct_9fa48("7788")) {
                        {}
                      } else {
                        stryCov_9fa48("7788");
                        if (stryMutAct_9fa48("7790") ? false : stryMutAct_9fa48("7789") ? true : (stryCov_9fa48("7789", "7790"), e.target.checked)) {
                          if (stryMutAct_9fa48("7791")) {
                            {}
                          } else {
                            stryCov_9fa48("7791");
                            setSelectedApplicants(stryMutAct_9fa48("7794") ? applications.applications?.map(app => app.applicant_id) && [] : stryMutAct_9fa48("7793") ? false : stryMutAct_9fa48("7792") ? true : (stryCov_9fa48("7792", "7793", "7794"), (stryMutAct_9fa48("7795") ? applications.applications.map(app => app.applicant_id) : (stryCov_9fa48("7795"), applications.applications?.map(stryMutAct_9fa48("7796") ? () => undefined : (stryCov_9fa48("7796"), app => app.applicant_id)))) || (stryMutAct_9fa48("7797") ? ["Stryker was here"] : (stryCov_9fa48("7797"), []))));
                          }
                        } else {
                          if (stryMutAct_9fa48("7798")) {
                            {}
                          } else {
                            stryCov_9fa48("7798");
                            setSelectedApplicants(stryMutAct_9fa48("7799") ? ["Stryker was here"] : (stryCov_9fa48("7799"), []));
                          }
                        }
                      }
                    }} />
                                            </th>
                                            <th className="sortable-header" onClick={stryMutAct_9fa48("7800") ? () => undefined : (stryCov_9fa48("7800"), () => handleColumnSort(stryMutAct_9fa48("7801") ? "" : (stryCov_9fa48("7801"), 'name')))}>
                                                Name
                                                {stryMutAct_9fa48("7804") ? columnSort.column === 'name' || <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span> : stryMutAct_9fa48("7803") ? false : stryMutAct_9fa48("7802") ? true : (stryCov_9fa48("7802", "7803", "7804"), (stryMutAct_9fa48("7806") ? columnSort.column !== 'name' : stryMutAct_9fa48("7805") ? true : (stryCov_9fa48("7805", "7806"), columnSort.column === (stryMutAct_9fa48("7807") ? "" : (stryCov_9fa48("7807"), 'name')))) && <span className="sort-indicator">
                                                        {(stryMutAct_9fa48("7810") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("7809") ? false : stryMutAct_9fa48("7808") ? true : (stryCov_9fa48("7808", "7809", "7810"), columnSort.direction === (stryMutAct_9fa48("7811") ? "" : (stryCov_9fa48("7811"), 'asc')))) ? stryMutAct_9fa48("7812") ? "" : (stryCov_9fa48("7812"), ' ↑') : stryMutAct_9fa48("7813") ? "" : (stryCov_9fa48("7813"), ' ↓')}
                                                    </span>)}
                                            </th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th className="sortable-header" onClick={stryMutAct_9fa48("7814") ? () => undefined : (stryCov_9fa48("7814"), () => handleColumnSort(stryMutAct_9fa48("7815") ? "" : (stryCov_9fa48("7815"), 'status')))}>
                                                Status
                                                {stryMutAct_9fa48("7818") ? columnSort.column === 'status' || <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span> : stryMutAct_9fa48("7817") ? false : stryMutAct_9fa48("7816") ? true : (stryCov_9fa48("7816", "7817", "7818"), (stryMutAct_9fa48("7820") ? columnSort.column !== 'status' : stryMutAct_9fa48("7819") ? true : (stryCov_9fa48("7819", "7820"), columnSort.column === (stryMutAct_9fa48("7821") ? "" : (stryCov_9fa48("7821"), 'status')))) && <span className="sort-indicator">
                                                        {(stryMutAct_9fa48("7824") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("7823") ? false : stryMutAct_9fa48("7822") ? true : (stryCov_9fa48("7822", "7823", "7824"), columnSort.direction === (stryMutAct_9fa48("7825") ? "" : (stryCov_9fa48("7825"), 'asc')))) ? stryMutAct_9fa48("7826") ? "" : (stryCov_9fa48("7826"), ' ↑') : stryMutAct_9fa48("7827") ? "" : (stryCov_9fa48("7827"), ' ↓')}
                                                    </span>)}
                                            </th>
                                            <th className="sortable-header" onClick={stryMutAct_9fa48("7828") ? () => undefined : (stryCov_9fa48("7828"), () => handleColumnSort(stryMutAct_9fa48("7829") ? "" : (stryCov_9fa48("7829"), 'assessment')))}>
                                                Assessment
                                                {stryMutAct_9fa48("7832") ? columnSort.column === 'assessment' || <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span> : stryMutAct_9fa48("7831") ? false : stryMutAct_9fa48("7830") ? true : (stryCov_9fa48("7830", "7831", "7832"), (stryMutAct_9fa48("7834") ? columnSort.column !== 'assessment' : stryMutAct_9fa48("7833") ? true : (stryCov_9fa48("7833", "7834"), columnSort.column === (stryMutAct_9fa48("7835") ? "" : (stryCov_9fa48("7835"), 'assessment')))) && <span className="sort-indicator">
                                                        {(stryMutAct_9fa48("7838") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("7837") ? false : stryMutAct_9fa48("7836") ? true : (stryCov_9fa48("7836", "7837", "7838"), columnSort.direction === (stryMutAct_9fa48("7839") ? "" : (stryCov_9fa48("7839"), 'asc')))) ? stryMutAct_9fa48("7840") ? "" : (stryCov_9fa48("7840"), ' ↑') : stryMutAct_9fa48("7841") ? "" : (stryCov_9fa48("7841"), ' ↓')}
                                                    </span>)}
                                            </th>
                                            <th className="sortable-header" onClick={stryMutAct_9fa48("7842") ? () => undefined : (stryCov_9fa48("7842"), () => handleColumnSort(stryMutAct_9fa48("7843") ? "" : (stryCov_9fa48("7843"), 'info_session')))}>
                                                Info Session
                                                {stryMutAct_9fa48("7846") ? columnSort.column === 'info_session' || <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span> : stryMutAct_9fa48("7845") ? false : stryMutAct_9fa48("7844") ? true : (stryCov_9fa48("7844", "7845", "7846"), (stryMutAct_9fa48("7848") ? columnSort.column !== 'info_session' : stryMutAct_9fa48("7847") ? true : (stryCov_9fa48("7847", "7848"), columnSort.column === (stryMutAct_9fa48("7849") ? "" : (stryCov_9fa48("7849"), 'info_session')))) && <span className="sort-indicator">
                                                        {(stryMutAct_9fa48("7852") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("7851") ? false : stryMutAct_9fa48("7850") ? true : (stryCov_9fa48("7850", "7851", "7852"), columnSort.direction === (stryMutAct_9fa48("7853") ? "" : (stryCov_9fa48("7853"), 'asc')))) ? stryMutAct_9fa48("7854") ? "" : (stryCov_9fa48("7854"), ' ↑') : stryMutAct_9fa48("7855") ? "" : (stryCov_9fa48("7855"), ' ↓')}
                                                    </span>)}
                                            </th>
                                            <th className="sortable-header" onClick={stryMutAct_9fa48("7856") ? () => undefined : (stryCov_9fa48("7856"), () => handleColumnSort(stryMutAct_9fa48("7857") ? "" : (stryCov_9fa48("7857"), 'workshop')))}>
                                                Workshop
                                                {stryMutAct_9fa48("7860") ? columnSort.column === 'workshop' || <span className="sort-indicator">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span> : stryMutAct_9fa48("7859") ? false : stryMutAct_9fa48("7858") ? true : (stryCov_9fa48("7858", "7859", "7860"), (stryMutAct_9fa48("7862") ? columnSort.column !== 'workshop' : stryMutAct_9fa48("7861") ? true : (stryCov_9fa48("7861", "7862"), columnSort.column === (stryMutAct_9fa48("7863") ? "" : (stryCov_9fa48("7863"), 'workshop')))) && <span className="sort-indicator">
                                                        {(stryMutAct_9fa48("7866") ? columnSort.direction !== 'asc' : stryMutAct_9fa48("7865") ? false : stryMutAct_9fa48("7864") ? true : (stryCov_9fa48("7864", "7865", "7866"), columnSort.direction === (stryMutAct_9fa48("7867") ? "" : (stryCov_9fa48("7867"), 'asc')))) ? stryMutAct_9fa48("7868") ? "" : (stryCov_9fa48("7868"), ' ↑') : stryMutAct_9fa48("7869") ? "" : (stryCov_9fa48("7869"), ' ↓')}
                                                    </span>)}
                                            </th>
                                            <th>Admission</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortAndFilterApplications(applications.applications).map(stryMutAct_9fa48("7870") ? () => undefined : (stryCov_9fa48("7870"), app => <tr key={app.application_id} className={stryMutAct_9fa48("7871") ? `` : (stryCov_9fa48("7871"), `clickable-row ${selectedApplicants.includes(app.applicant_id) ? stryMutAct_9fa48("7872") ? "" : (stryCov_9fa48("7872"), 'admissions-dashboard__row--selected') : stryMutAct_9fa48("7873") ? "Stryker was here!" : (stryCov_9fa48("7873"), '')}`)}>
                                                <td className="admissions-dashboard__checkbox-column">
                                                    <input type="checkbox" className="admissions-dashboard__row-checkbox" checked={selectedApplicants.includes(app.applicant_id)} onChange={e => {
                      if (stryMutAct_9fa48("7874")) {
                        {}
                      } else {
                        stryCov_9fa48("7874");
                        e.stopPropagation();
                        if (stryMutAct_9fa48("7876") ? false : stryMutAct_9fa48("7875") ? true : (stryCov_9fa48("7875", "7876"), e.target.checked)) {
                          if (stryMutAct_9fa48("7877")) {
                            {}
                          } else {
                            stryCov_9fa48("7877");
                            setSelectedApplicants(stryMutAct_9fa48("7878") ? [] : (stryCov_9fa48("7878"), [...selectedApplicants, app.applicant_id]));
                          }
                        } else {
                          if (stryMutAct_9fa48("7879")) {
                            {}
                          } else {
                            stryCov_9fa48("7879");
                            setSelectedApplicants(stryMutAct_9fa48("7880") ? selectedApplicants : (stryCov_9fa48("7880"), selectedApplicants.filter(stryMutAct_9fa48("7881") ? () => undefined : (stryCov_9fa48("7881"), id => stryMutAct_9fa48("7884") ? id === app.applicant_id : stryMutAct_9fa48("7883") ? false : stryMutAct_9fa48("7882") ? true : (stryCov_9fa48("7882", "7883", "7884"), id !== app.applicant_id)))));
                          }
                        }
                      }
                    }} />
                                                </td>
                                                <td onClick={stryMutAct_9fa48("7885") ? () => undefined : (stryCov_9fa48("7885"), () => navigate(stryMutAct_9fa48("7886") ? `` : (stryCov_9fa48("7886"), `/admissions-dashboard/application/${app.application_id}`)))} className="clickable-cell">
                                                    <div className="applicant-name">
                                                        {stryMutAct_9fa48("7889") ? app.full_name && `${app.first_name} ${app.last_name}` : stryMutAct_9fa48("7888") ? false : stryMutAct_9fa48("7887") ? true : (stryCov_9fa48("7887", "7888", "7889"), app.full_name || (stryMutAct_9fa48("7890") ? `` : (stryCov_9fa48("7890"), `${app.first_name} ${app.last_name}`)))}
                                                        {stryMutAct_9fa48("7893") ? app.has_masters_degree || <span className="admissions-dashboard__masters-flag" title="Has Masters Degree">🎓</span> : stryMutAct_9fa48("7892") ? false : stryMutAct_9fa48("7891") ? true : (stryCov_9fa48("7891", "7892", "7893"), app.has_masters_degree && <span className="admissions-dashboard__masters-flag" title="Has Masters Degree">🎓</span>)}
                                                        {stryMutAct_9fa48("7896") ? app.missing_count > 0 || <span className="admissions-dashboard__missing-flag" title={`${app.missing_count} key questions incomplete`}>
                                                                ⚠️ {app.missing_count}
                                                            </span> : stryMutAct_9fa48("7895") ? false : stryMutAct_9fa48("7894") ? true : (stryCov_9fa48("7894", "7895", "7896"), (stryMutAct_9fa48("7899") ? app.missing_count <= 0 : stryMutAct_9fa48("7898") ? app.missing_count >= 0 : stryMutAct_9fa48("7897") ? true : (stryCov_9fa48("7897", "7898", "7899"), app.missing_count > 0)) && <span className="admissions-dashboard__missing-flag" title={stryMutAct_9fa48("7900") ? `` : (stryCov_9fa48("7900"), `${app.missing_count} key questions incomplete`)}>
                                                                ⚠️ {app.missing_count}
                                                            </span>)}
                                                    </div>
                                                </td>
                                                <td className="clickable-cell">
                                                    <span className="copyable-email" onClick={e => {
                      if (stryMutAct_9fa48("7901")) {
                        {}
                      } else {
                        stryCov_9fa48("7901");
                        e.stopPropagation();
                        handleEmailClick(app.email);
                      }
                    }} title="Click to copy email">
                                                        {app.email}
                                                    </span>
                                                </td>
                                                <td className="clickable-cell">
                                                    <span className="copyable-phone" onClick={e => {
                      if (stryMutAct_9fa48("7902")) {
                        {}
                      } else {
                        stryCov_9fa48("7902");
                        e.stopPropagation();
                        handlePhoneClick(app.phone_number);
                      }
                    }} title="Click to copy phone number">
                                                        {formatPhoneNumber(app.phone_number)}
                                                    </span>
                                                </td>
                                                <td onClick={stryMutAct_9fa48("7903") ? () => undefined : (stryCov_9fa48("7903"), () => navigate(stryMutAct_9fa48("7904") ? `` : (stryCov_9fa48("7904"), `/admissions-dashboard/application/${app.application_id}`)))} className="clickable-cell">
                                                    <span className={stryMutAct_9fa48("7905") ? `` : (stryCov_9fa48("7905"), `status-badge status-badge--${app.status}`)}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="admissions-dashboard__assessment-cell">
                                                    <div className="admissions-dashboard__assessment-container">
                                                        {(stryMutAct_9fa48("7908") ? app.final_status && app.recommendation : stryMutAct_9fa48("7907") ? false : stryMutAct_9fa48("7906") ? true : (stryCov_9fa48("7906", "7907", "7908"), app.final_status || app.recommendation)) ? <select className={stryMutAct_9fa48("7909") ? `` : (stryCov_9fa48("7909"), `admissions-dashboard__assessment-select assessment-badge--${stryMutAct_9fa48("7912") ? app.final_status && app.recommendation : stryMutAct_9fa48("7911") ? false : stryMutAct_9fa48("7910") ? true : (stryCov_9fa48("7910", "7911", "7912"), app.final_status || app.recommendation)}`)} value={stryMutAct_9fa48("7915") ? app.final_status && app.recommendation : stryMutAct_9fa48("7914") ? false : stryMutAct_9fa48("7913") ? true : (stryCov_9fa48("7913", "7914", "7915"), app.final_status || app.recommendation)} onChange={stryMutAct_9fa48("7916") ? () => undefined : (stryCov_9fa48("7916"), e => handleStatusChange(app.application_id, e.target.value))} onClick={stryMutAct_9fa48("7917") ? () => undefined : (stryCov_9fa48("7917"), e => e.stopPropagation())}>
                                                                <option value="strong_recommend">Strong Recommend</option>
                                                                <option value="recommend">Recommend</option>
                                                                <option value="review_needed">Review Needed</option>
                                                                <option value="not_recommend">Not Recommend</option>
                                                            </select> : <span className="assessment-badge assessment-badge--pending">
                                                                pending
                                                            </span>}
                                                        {stryMutAct_9fa48("7920") ? app.has_human_override || <span className="admissions-dashboard__override-indicator" title="Human override applied">🔀</span> : stryMutAct_9fa48("7919") ? false : stryMutAct_9fa48("7918") ? true : (stryCov_9fa48("7918", "7919", "7920"), app.has_human_override && <span className="admissions-dashboard__override-indicator" title="Human override applied">🔀</span>)}
                                                    </div>
                                                </td>
                                                <td onClick={stryMutAct_9fa48("7921") ? () => undefined : (stryCov_9fa48("7921"), () => navigate(stryMutAct_9fa48("7922") ? `` : (stryCov_9fa48("7922"), `/admissions-dashboard/application/${app.application_id}`)))} className="clickable-cell">
                                                    <span className={stryMutAct_9fa48("7923") ? `` : (stryCov_9fa48("7923"), `info-session-badge info-session-badge--${stryMutAct_9fa48("7926") ? app.info_session_status && 'not_registered' : stryMutAct_9fa48("7925") ? false : stryMutAct_9fa48("7924") ? true : (stryCov_9fa48("7924", "7925", "7926"), app.info_session_status || (stryMutAct_9fa48("7927") ? "" : (stryCov_9fa48("7927"), 'not_registered')))}`)}>
                                                        {(stryMutAct_9fa48("7930") ? app.info_session_status && 'not_registered' : stryMutAct_9fa48("7929") ? false : stryMutAct_9fa48("7928") ? true : (stryCov_9fa48("7928", "7929", "7930"), app.info_session_status || (stryMutAct_9fa48("7931") ? "" : (stryCov_9fa48("7931"), 'not_registered')))).replace(stryMutAct_9fa48("7932") ? "" : (stryCov_9fa48("7932"), '_'), stryMutAct_9fa48("7933") ? "" : (stryCov_9fa48("7933"), ' '))}
                                                    </span>
                                                </td>
                                                <td onClick={stryMutAct_9fa48("7934") ? () => undefined : (stryCov_9fa48("7934"), () => navigate(stryMutAct_9fa48("7935") ? `` : (stryCov_9fa48("7935"), `/admissions-dashboard/application/${app.application_id}`)))} className="clickable-cell">
                                                    <span className={stryMutAct_9fa48("7936") ? `` : (stryCov_9fa48("7936"), `workshop-badge workshop-badge--${stryMutAct_9fa48("7939") ? app.workshop_status && 'pending' : stryMutAct_9fa48("7938") ? false : stryMutAct_9fa48("7937") ? true : (stryCov_9fa48("7937", "7938", "7939"), app.workshop_status || (stryMutAct_9fa48("7940") ? "" : (stryCov_9fa48("7940"), 'pending')))}`)}>
                                                        {(stryMutAct_9fa48("7943") ? app.workshop_status && 'pending' : stryMutAct_9fa48("7942") ? false : stryMutAct_9fa48("7941") ? true : (stryCov_9fa48("7941", "7942", "7943"), app.workshop_status || (stryMutAct_9fa48("7944") ? "" : (stryCov_9fa48("7944"), 'pending')))).replace(stryMutAct_9fa48("7945") ? "" : (stryCov_9fa48("7945"), '_'), stryMutAct_9fa48("7946") ? "" : (stryCov_9fa48("7946"), ' '))}
                                                    </span>
                                                </td>
                                                <td onClick={stryMutAct_9fa48("7947") ? () => undefined : (stryCov_9fa48("7947"), () => navigate(stryMutAct_9fa48("7948") ? `` : (stryCov_9fa48("7948"), `/admissions-dashboard/application/${app.application_id}`)))} className="clickable-cell">
                                                    <span className={stryMutAct_9fa48("7949") ? `` : (stryCov_9fa48("7949"), `admission-badge admission-badge--${stryMutAct_9fa48("7952") ? app.program_admission_status && 'pending' : stryMutAct_9fa48("7951") ? false : stryMutAct_9fa48("7950") ? true : (stryCov_9fa48("7950", "7951", "7952"), app.program_admission_status || (stryMutAct_9fa48("7953") ? "" : (stryCov_9fa48("7953"), 'pending')))}`)}>
                                                        {(stryMutAct_9fa48("7956") ? app.program_admission_status && 'pending' : stryMutAct_9fa48("7955") ? false : stryMutAct_9fa48("7954") ? true : (stryCov_9fa48("7954", "7955", "7956"), app.program_admission_status || (stryMutAct_9fa48("7957") ? "" : (stryCov_9fa48("7957"), 'pending')))).replace(stryMutAct_9fa48("7958") ? "" : (stryCov_9fa48("7958"), '_'), stryMutAct_9fa48("7959") ? "" : (stryCov_9fa48("7959"), ' '))}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="notes-btn" onClick={e => {
                      if (stryMutAct_9fa48("7960")) {
                        {}
                      } else {
                        stryCov_9fa48("7960");
                        e.stopPropagation();
                        openNotesModal(stryMutAct_9fa48("7961") ? {} : (stryCov_9fa48("7961"), {
                          applicant_id: app.applicant_id,
                          name: stryMutAct_9fa48("7964") ? app.full_name && `${app.first_name} ${app.last_name}` : stryMutAct_9fa48("7963") ? false : stryMutAct_9fa48("7962") ? true : (stryCov_9fa48("7962", "7963", "7964"), app.full_name || (stryMutAct_9fa48("7965") ? `` : (stryCov_9fa48("7965"), `${app.first_name} ${app.last_name}`)))
                        }));
                      }
                    }}>
                                                        Notes
                                                    </button>
                                                </td>
                                            </tr>))}
                                    </tbody>
                                </table>

                                <div className="table-footer">
                                    <span className="table-count">
                                        Showing {applications.applications.length} applicants
                                        {stryMutAct_9fa48("7968") ? applications.total > applications.applications.length || ` of ${applications.total} total` : stryMutAct_9fa48("7967") ? false : stryMutAct_9fa48("7966") ? true : (stryCov_9fa48("7966", "7967", "7968"), (stryMutAct_9fa48("7971") ? applications.total <= applications.applications.length : stryMutAct_9fa48("7970") ? applications.total >= applications.applications.length : stryMutAct_9fa48("7969") ? true : (stryCov_9fa48("7969", "7970", "7971"), applications.total > applications.applications.length)) && (stryMutAct_9fa48("7972") ? `` : (stryCov_9fa48("7972"), ` of ${applications.total} total`)))}
                                    </span>
                                    {stryMutAct_9fa48("7975") ? applications.total > applicationFilters.limit || <div className="pagination-controls">
                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit)
                }))} disabled={applicationFilters.offset === 0} className="pagination-btn">
                                                ← Previous
                                            </button>

                                            <span className="pagination-info">
                                                Page {Math.floor(applicationFilters.offset / applicationFilters.limit) + 1} of {Math.ceil(applications.total / applicationFilters.limit)}
                                            </span>

                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  offset: prev.offset + prev.limit
                }))} disabled={applicationFilters.offset + applicationFilters.limit >= applications.total} className="pagination-btn">
                                                Next →
                                            </button>

                                            <button onClick={() => setApplicationFilters(prev => ({
                  ...prev,
                  limit: applications.total,
                  offset: 0
                }))} className="pagination-btn show-all-btn">
                                                Show All ({applications.total})
                                            </button>
                                        </div> : stryMutAct_9fa48("7974") ? false : stryMutAct_9fa48("7973") ? true : (stryCov_9fa48("7973", "7974", "7975"), (stryMutAct_9fa48("7978") ? applications.total <= applicationFilters.limit : stryMutAct_9fa48("7977") ? applications.total >= applicationFilters.limit : stryMutAct_9fa48("7976") ? true : (stryCov_9fa48("7976", "7977", "7978"), applications.total > applicationFilters.limit)) && <div className="pagination-controls">
                                            <button onClick={stryMutAct_9fa48("7979") ? () => undefined : (stryCov_9fa48("7979"), () => setApplicationFilters(stryMutAct_9fa48("7980") ? () => undefined : (stryCov_9fa48("7980"), prev => stryMutAct_9fa48("7981") ? {} : (stryCov_9fa48("7981"), {
                  ...prev,
                  offset: stryMutAct_9fa48("7982") ? Math.min(0, prev.offset - prev.limit) : (stryCov_9fa48("7982"), Math.max(0, stryMutAct_9fa48("7983") ? prev.offset + prev.limit : (stryCov_9fa48("7983"), prev.offset - prev.limit)))
                }))))} disabled={stryMutAct_9fa48("7986") ? applicationFilters.offset !== 0 : stryMutAct_9fa48("7985") ? false : stryMutAct_9fa48("7984") ? true : (stryCov_9fa48("7984", "7985", "7986"), applicationFilters.offset === 0)} className="pagination-btn">
                                                ← Previous
                                            </button>

                                            <span className="pagination-info">
                                                Page {stryMutAct_9fa48("7987") ? Math.floor(applicationFilters.offset / applicationFilters.limit) - 1 : (stryCov_9fa48("7987"), Math.floor(stryMutAct_9fa48("7988") ? applicationFilters.offset * applicationFilters.limit : (stryCov_9fa48("7988"), applicationFilters.offset / applicationFilters.limit)) + 1)} of {Math.ceil(stryMutAct_9fa48("7989") ? applications.total * applicationFilters.limit : (stryCov_9fa48("7989"), applications.total / applicationFilters.limit))}
                                            </span>

                                            <button onClick={stryMutAct_9fa48("7990") ? () => undefined : (stryCov_9fa48("7990"), () => setApplicationFilters(stryMutAct_9fa48("7991") ? () => undefined : (stryCov_9fa48("7991"), prev => stryMutAct_9fa48("7992") ? {} : (stryCov_9fa48("7992"), {
                  ...prev,
                  offset: stryMutAct_9fa48("7993") ? prev.offset - prev.limit : (stryCov_9fa48("7993"), prev.offset + prev.limit)
                }))))} disabled={stryMutAct_9fa48("7997") ? applicationFilters.offset + applicationFilters.limit < applications.total : stryMutAct_9fa48("7996") ? applicationFilters.offset + applicationFilters.limit > applications.total : stryMutAct_9fa48("7995") ? false : stryMutAct_9fa48("7994") ? true : (stryCov_9fa48("7994", "7995", "7996", "7997"), (stryMutAct_9fa48("7998") ? applicationFilters.offset - applicationFilters.limit : (stryCov_9fa48("7998"), applicationFilters.offset + applicationFilters.limit)) >= applications.total)} className="pagination-btn">
                                                Next →
                                            </button>

                                            <button onClick={stryMutAct_9fa48("7999") ? () => undefined : (stryCov_9fa48("7999"), () => setApplicationFilters(stryMutAct_9fa48("8000") ? () => undefined : (stryCov_9fa48("8000"), prev => stryMutAct_9fa48("8001") ? {} : (stryCov_9fa48("8001"), {
                  ...prev,
                  limit: applications.total,
                  offset: 0
                }))))} className="pagination-btn show-all-btn">
                                                Show All ({applications.total})
                                            </button>
                                        </div>)}
                                </div>
                            </div> : <div className="no-data-message">
                                <p>No applicants found</p>
                                {stryMutAct_9fa48("8004") ? applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation || applicationFilters.name_search || nameSearchInput || <button onClick={() => {
              setNameSearchInput('');
              setApplicationFilters({
                status: '',
                info_session_status: '',
                workshop_status: '',
                program_admission_status: '',
                ready_for_workshop_invitation: false,
                name_search: '',
                limit: applicationFilters.limit,
                offset: 0
              });
            }} className="clear-filter-btn">
                                        Clear filters
                                    </button> : stryMutAct_9fa48("8003") ? false : stryMutAct_9fa48("8002") ? true : (stryCov_9fa48("8002", "8003", "8004"), (stryMutAct_9fa48("8006") ? (applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation || applicationFilters.name_search) && nameSearchInput : stryMutAct_9fa48("8005") ? true : (stryCov_9fa48("8005", "8006"), (stryMutAct_9fa48("8008") ? (applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation) && applicationFilters.name_search : stryMutAct_9fa48("8007") ? false : (stryCov_9fa48("8007", "8008"), (stryMutAct_9fa48("8010") ? (applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status) && applicationFilters.ready_for_workshop_invitation : stryMutAct_9fa48("8009") ? false : (stryCov_9fa48("8009", "8010"), (stryMutAct_9fa48("8012") ? (applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status) && applicationFilters.program_admission_status : stryMutAct_9fa48("8011") ? false : (stryCov_9fa48("8011", "8012"), (stryMutAct_9fa48("8014") ? (applicationFilters.status || applicationFilters.info_session_status) && applicationFilters.workshop_status : stryMutAct_9fa48("8013") ? false : (stryCov_9fa48("8013", "8014"), (stryMutAct_9fa48("8016") ? applicationFilters.status && applicationFilters.info_session_status : stryMutAct_9fa48("8015") ? false : (stryCov_9fa48("8015", "8016"), applicationFilters.status || applicationFilters.info_session_status)) || applicationFilters.workshop_status)) || applicationFilters.program_admission_status)) || applicationFilters.ready_for_workshop_invitation)) || applicationFilters.name_search)) || nameSearchInput)) && <button onClick={() => {
              if (stryMutAct_9fa48("8017")) {
                {}
              } else {
                stryCov_9fa48("8017");
                setNameSearchInput(stryMutAct_9fa48("8018") ? "Stryker was here!" : (stryCov_9fa48("8018"), ''));
                setApplicationFilters(stryMutAct_9fa48("8019") ? {} : (stryCov_9fa48("8019"), {
                  status: stryMutAct_9fa48("8020") ? "Stryker was here!" : (stryCov_9fa48("8020"), ''),
                  info_session_status: stryMutAct_9fa48("8021") ? "Stryker was here!" : (stryCov_9fa48("8021"), ''),
                  workshop_status: stryMutAct_9fa48("8022") ? "Stryker was here!" : (stryCov_9fa48("8022"), ''),
                  program_admission_status: stryMutAct_9fa48("8023") ? "Stryker was here!" : (stryCov_9fa48("8023"), ''),
                  ready_for_workshop_invitation: stryMutAct_9fa48("8024") ? true : (stryCov_9fa48("8024"), false),
                  name_search: stryMutAct_9fa48("8025") ? "Stryker was here!" : (stryCov_9fa48("8025"), ''),
                  limit: applicationFilters.limit,
                  offset: 0
                }));
              }
            }} className="clear-filter-btn">
                                        Clear filters
                                    </button>)}
                            </div>}
                    </div>)}

                {stryMutAct_9fa48("8028") ? activeTab === 'info-sessions' || <div className="admissions-dashboard__info-sessions">
                        <div className="data-section__header">
                            <h2>Info Sessions Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input type="checkbox" checked={showInactiveInfoSessions} onChange={e => setShowInactiveInfoSessions(e.target.checked)} className="event-filter-checkbox" />
                                        Show inactive events
                                    </label>
                                </div>
                                <button onClick={openCreateInfoSessionModal} className="create-btn">
                                    Create New Session
                                </button>
                                <button onClick={fetchInfoSessions} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading info sessions...</p>
                            </div> : getFilteredInfoSessions()?.length > 0 ? <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredInfoSessions()).map(session => <React.Fragment key={session.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {session.event_name}
                                                        {isEventPast(session.event_date, session.event_time) && <span className="event-status event-status--past">Past Event</span>}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(session.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(session.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{session.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{session.attended_count}</span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button className={`active-toggle-btn ${session.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`} onClick={() => handleToggleEventActive(session.event_id)} title={session.is_active ? 'Click to deactivate event' : 'Click to activate event'}>
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${session.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {session.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="edit-btn" onClick={() => openEditInfoSessionModal(session)}>
                                                            Edit
                                                        </button>
                                                        <button className="view-registrations-btn" onClick={() => handleViewRegistrations('info-session', session.event_id)}>
                                                            {selectedEvent === session.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {selectedEvent === session.event_id && <tr className="registrations-row">
                                                        <td colSpan="6" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={() => openAddRegistrationModal(session.event_id, 'info-session')} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={() => handleEmailClick(reg.email)} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={() => handlePhoneClick(reg.phone_number)} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={`attendance-status-dropdown-unified status-${reg.status}`} value={reg.status} onChange={e => {
                                    if (e.target.value !== reg.status) {
                                      handleMarkAttendance('info-session', session.event_id, reg.applicant_id, e.target.value);
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={() => handleRemoveRegistration('info-session', session.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>)}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr>}
                                            </React.Fragment>)}
                                    </tbody>
                                </table>
                            </div> : <div className="no-data-message">
                                <p>No info sessions found</p>
                            </div>}
                    </div> : stryMutAct_9fa48("8027") ? false : stryMutAct_9fa48("8026") ? true : (stryCov_9fa48("8026", "8027", "8028"), (stryMutAct_9fa48("8030") ? activeTab !== 'info-sessions' : stryMutAct_9fa48("8029") ? true : (stryCov_9fa48("8029", "8030"), activeTab === (stryMutAct_9fa48("8031") ? "" : (stryCov_9fa48("8031"), 'info-sessions')))) && <div className="admissions-dashboard__info-sessions">
                        <div className="data-section__header">
                            <h2>Info Sessions Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input type="checkbox" checked={showInactiveInfoSessions} onChange={stryMutAct_9fa48("8032") ? () => undefined : (stryCov_9fa48("8032"), e => setShowInactiveInfoSessions(e.target.checked))} className="event-filter-checkbox" />
                                        Show inactive events
                                    </label>
                                </div>
                                <button onClick={openCreateInfoSessionModal} className="create-btn">
                                    Create New Session
                                </button>
                                <button onClick={fetchInfoSessions} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading info sessions...</p>
                            </div> : (stryMutAct_9fa48("8036") ? getFilteredInfoSessions()?.length <= 0 : stryMutAct_9fa48("8035") ? getFilteredInfoSessions()?.length >= 0 : stryMutAct_9fa48("8034") ? false : stryMutAct_9fa48("8033") ? true : (stryCov_9fa48("8033", "8034", "8035", "8036"), (stryMutAct_9fa48("8037") ? getFilteredInfoSessions().length : (stryCov_9fa48("8037"), getFilteredInfoSessions()?.length)) > 0)) ? <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredInfoSessions()).map(stryMutAct_9fa48("8038") ? () => undefined : (stryCov_9fa48("8038"), session => <React.Fragment key={session.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {session.event_name}
                                                        {stryMutAct_9fa48("8041") ? isEventPast(session.event_date, session.event_time) || <span className="event-status event-status--past">Past Event</span> : stryMutAct_9fa48("8040") ? false : stryMutAct_9fa48("8039") ? true : (stryCov_9fa48("8039", "8040", "8041"), isEventPast(session.event_date, session.event_time) && <span className="event-status event-status--past">Past Event</span>)}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(session.event_date).toLocaleDateString(stryMutAct_9fa48("8042") ? "" : (stryCov_9fa48("8042"), 'en-US'), stryMutAct_9fa48("8043") ? {} : (stryCov_9fa48("8043"), {
                            weekday: stryMutAct_9fa48("8044") ? "" : (stryCov_9fa48("8044"), 'short'),
                            month: stryMutAct_9fa48("8045") ? "" : (stryCov_9fa48("8045"), 'short'),
                            day: stryMutAct_9fa48("8046") ? "" : (stryCov_9fa48("8046"), 'numeric'),
                            year: stryMutAct_9fa48("8047") ? "" : (stryCov_9fa48("8047"), 'numeric')
                          }))}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(session.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{session.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{session.attended_count}</span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button className={stryMutAct_9fa48("8048") ? `` : (stryCov_9fa48("8048"), `active-toggle-btn ${session.is_active ? stryMutAct_9fa48("8049") ? "" : (stryCov_9fa48("8049"), 'active-toggle-btn--active') : stryMutAct_9fa48("8050") ? "" : (stryCov_9fa48("8050"), 'active-toggle-btn--inactive')}`)} onClick={stryMutAct_9fa48("8051") ? () => undefined : (stryCov_9fa48("8051"), () => handleToggleEventActive(session.event_id))} title={session.is_active ? stryMutAct_9fa48("8052") ? "" : (stryCov_9fa48("8052"), 'Click to deactivate event') : stryMutAct_9fa48("8053") ? "" : (stryCov_9fa48("8053"), 'Click to activate event')}>
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={stryMutAct_9fa48("8054") ? `` : (stryCov_9fa48("8054"), `active-status-label ${session.is_active ? stryMutAct_9fa48("8055") ? "" : (stryCov_9fa48("8055"), 'active-status-label--active') : stryMutAct_9fa48("8056") ? "" : (stryCov_9fa48("8056"), 'active-status-label--inactive')}`)}>
                                                                {session.is_active ? stryMutAct_9fa48("8057") ? "" : (stryCov_9fa48("8057"), 'Active') : stryMutAct_9fa48("8058") ? "" : (stryCov_9fa48("8058"), 'Inactive')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="edit-btn" onClick={stryMutAct_9fa48("8059") ? () => undefined : (stryCov_9fa48("8059"), () => openEditInfoSessionModal(session))}>
                                                            Edit
                                                        </button>
                                                        <button className="view-registrations-btn" onClick={stryMutAct_9fa48("8060") ? () => undefined : (stryCov_9fa48("8060"), () => handleViewRegistrations(stryMutAct_9fa48("8061") ? "" : (stryCov_9fa48("8061"), 'info-session'), session.event_id))}>
                                                            {(stryMutAct_9fa48("8064") ? selectedEvent !== session.event_id : stryMutAct_9fa48("8063") ? false : stryMutAct_9fa48("8062") ? true : (stryCov_9fa48("8062", "8063", "8064"), selectedEvent === session.event_id)) ? stryMutAct_9fa48("8065") ? "" : (stryCov_9fa48("8065"), 'Hide Registrations') : stryMutAct_9fa48("8066") ? "" : (stryCov_9fa48("8066"), 'View Registrations')}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {stryMutAct_9fa48("8069") ? selectedEvent === session.event_id || <tr className="registrations-row">
                                                        <td colSpan="6" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={() => openAddRegistrationModal(session.event_id, 'info-session')} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={() => handleEmailClick(reg.email)} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={() => handlePhoneClick(reg.phone_number)} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={`attendance-status-dropdown-unified status-${reg.status}`} value={reg.status} onChange={e => {
                                    if (e.target.value !== reg.status) {
                                      handleMarkAttendance('info-session', session.event_id, reg.applicant_id, e.target.value);
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={() => handleRemoveRegistration('info-session', session.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>)}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr> : stryMutAct_9fa48("8068") ? false : stryMutAct_9fa48("8067") ? true : (stryCov_9fa48("8067", "8068", "8069"), (stryMutAct_9fa48("8071") ? selectedEvent !== session.event_id : stryMutAct_9fa48("8070") ? true : (stryCov_9fa48("8070", "8071"), selectedEvent === session.event_id)) && <tr className="registrations-row">
                                                        <td colSpan="6" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={stryMutAct_9fa48("8072") ? () => undefined : (stryCov_9fa48("8072"), () => openAddRegistrationModal(session.event_id, stryMutAct_9fa48("8073") ? "" : (stryCov_9fa48("8073"), 'info-session')))} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {(stryMutAct_9fa48("8077") ? eventRegistrations.length <= 0 : stryMutAct_9fa48("8076") ? eventRegistrations.length >= 0 : stryMutAct_9fa48("8075") ? false : stryMutAct_9fa48("8074") ? true : (stryCov_9fa48("8074", "8075", "8076", "8077"), eventRegistrations.length > 0)) ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(stryMutAct_9fa48("8078") ? () => undefined : (stryCov_9fa48("8078"), reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={stryMutAct_9fa48("8079") ? () => undefined : (stryCov_9fa48("8079"), () => handleEmailClick(reg.email))} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={stryMutAct_9fa48("8080") ? () => undefined : (stryCov_9fa48("8080"), () => handlePhoneClick(reg.phone_number))} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={stryMutAct_9fa48("8081") ? `` : (stryCov_9fa48("8081"), `attendance-status-dropdown-unified status-${reg.status}`)} value={reg.status} onChange={e => {
                                    if (stryMutAct_9fa48("8082")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("8082");
                                      if (stryMutAct_9fa48("8085") ? e.target.value === reg.status : stryMutAct_9fa48("8084") ? false : stryMutAct_9fa48("8083") ? true : (stryCov_9fa48("8083", "8084", "8085"), e.target.value !== reg.status)) {
                                        if (stryMutAct_9fa48("8086")) {
                                          {}
                                        } else {
                                          stryCov_9fa48("8086");
                                          handleMarkAttendance(stryMutAct_9fa48("8087") ? "" : (stryCov_9fa48("8087"), 'info-session'), session.event_id, reg.applicant_id, e.target.value);
                                        }
                                      }
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={stryMutAct_9fa48("8088") ? () => undefined : (stryCov_9fa48("8088"), () => handleRemoveRegistration(stryMutAct_9fa48("8089") ? "" : (stryCov_9fa48("8089"), 'info-session'), session.event_id, reg.registration_id, stryMutAct_9fa48("8090") ? `` : (stryCov_9fa48("8090"), `${reg.first_name} ${reg.last_name}`)))} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr>)}
                                            </React.Fragment>))}
                                    </tbody>
                                </table>
                            </div> : <div className="no-data-message">
                                <p>No info sessions found</p>
                            </div>}
                    </div>)}

                {stryMutAct_9fa48("8093") ? activeTab === 'workshops' || <div className="admissions-dashboard__workshops">
                        <div className="data-section__header">
                            <h2>Workshops Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input type="checkbox" checked={showInactiveWorkshops} onChange={e => setShowInactiveWorkshops(e.target.checked)} className="event-filter-checkbox" />
                                        Show inactive events
                                    </label>
                                </div>
                                <button onClick={openCreateWorkshopModal} className="create-btn">
                                    Create New Workshop
                                </button>
                                <button onClick={fetchWorkshops} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading workshops...</p>
                            </div> : getFilteredWorkshops()?.length > 0 ? <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Laptops Needed</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredWorkshops()).map(workshop => <React.Fragment key={workshop.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {workshop.event_name}
                                                        {isEventPast(workshop.event_date, workshop.event_time) && <span className="event-status event-status--past">Past Event</span>}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(workshop.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(workshop.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{workshop.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{workshop.attended_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--laptops">
                                                            {workshop.registrations?.filter(reg => reg.needs_laptop).length || 0}
                                                        </span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button className={`active-toggle-btn ${workshop.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`} onClick={() => handleToggleEventActive(workshop.event_id)} title={workshop.is_active ? 'Click to deactivate event' : 'Click to activate event'}>
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${workshop.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {workshop.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="edit-btn" onClick={() => openEditWorkshopModal(workshop)}>
                                                            Edit
                                                        </button>
                                                        <button className="view-registrations-btn" onClick={() => handleViewRegistrations('workshop', workshop.event_id)}>
                                                            {selectedEvent === workshop.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {selectedEvent === workshop.event_id && <tr className="registrations-row">
                                                        <td colSpan="7" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={() => openAddRegistrationModal(workshop.event_id, 'workshop')} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Laptop</th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={() => handleEmailClick(reg.email)} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={() => handlePhoneClick(reg.phone_number)} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="laptop-indicator-cell">
                                                                                            {reg.needs_laptop ? <span className="laptop-needed" title="Needs to borrow a laptop">
                                                                                                    <span className="laptop-icon">💻</span>
                                                                                                    <span className="laptop-text">Needs</span>
                                                                                                </span> : <span className="laptop-own" title="Has own laptop">
                                                                                                    <span className="laptop-icon">✓</span>
                                                                                                    <span className="laptop-text">Own</span>
                                                                                                </span>}
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={`attendance-status-dropdown-unified status-${reg.status}`} value={reg.status} onChange={e => {
                                    if (e.target.value !== reg.status) {
                                      handleMarkAttendance('workshop', workshop.event_id, reg.applicant_id, e.target.value);
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={() => handleRemoveRegistration('workshop', workshop.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>)}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr>}
                                            </React.Fragment>)}
                                    </tbody>
                                </table>
                            </div> : <div className="no-data-message">
                                <p>No workshops found</p>
                            </div>}
                    </div> : stryMutAct_9fa48("8092") ? false : stryMutAct_9fa48("8091") ? true : (stryCov_9fa48("8091", "8092", "8093"), (stryMutAct_9fa48("8095") ? activeTab !== 'workshops' : stryMutAct_9fa48("8094") ? true : (stryCov_9fa48("8094", "8095"), activeTab === (stryMutAct_9fa48("8096") ? "" : (stryCov_9fa48("8096"), 'workshops')))) && <div className="admissions-dashboard__workshops">
                        <div className="data-section__header">
                            <h2>Workshops Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input type="checkbox" checked={showInactiveWorkshops} onChange={stryMutAct_9fa48("8097") ? () => undefined : (stryCov_9fa48("8097"), e => setShowInactiveWorkshops(e.target.checked))} className="event-filter-checkbox" />
                                        Show inactive events
                                    </label>
                                </div>
                                <button onClick={openCreateWorkshopModal} className="create-btn">
                                    Create New Workshop
                                </button>
                                <button onClick={fetchWorkshops} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading workshops...</p>
                            </div> : (stryMutAct_9fa48("8101") ? getFilteredWorkshops()?.length <= 0 : stryMutAct_9fa48("8100") ? getFilteredWorkshops()?.length >= 0 : stryMutAct_9fa48("8099") ? false : stryMutAct_9fa48("8098") ? true : (stryCov_9fa48("8098", "8099", "8100", "8101"), (stryMutAct_9fa48("8102") ? getFilteredWorkshops().length : (stryCov_9fa48("8102"), getFilteredWorkshops()?.length)) > 0)) ? <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Laptops Needed</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredWorkshops()).map(stryMutAct_9fa48("8103") ? () => undefined : (stryCov_9fa48("8103"), workshop => <React.Fragment key={workshop.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {workshop.event_name}
                                                        {stryMutAct_9fa48("8106") ? isEventPast(workshop.event_date, workshop.event_time) || <span className="event-status event-status--past">Past Event</span> : stryMutAct_9fa48("8105") ? false : stryMutAct_9fa48("8104") ? true : (stryCov_9fa48("8104", "8105", "8106"), isEventPast(workshop.event_date, workshop.event_time) && <span className="event-status event-status--past">Past Event</span>)}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(workshop.event_date).toLocaleDateString(stryMutAct_9fa48("8107") ? "" : (stryCov_9fa48("8107"), 'en-US'), stryMutAct_9fa48("8108") ? {} : (stryCov_9fa48("8108"), {
                            weekday: stryMutAct_9fa48("8109") ? "" : (stryCov_9fa48("8109"), 'short'),
                            month: stryMutAct_9fa48("8110") ? "" : (stryCov_9fa48("8110"), 'short'),
                            day: stryMutAct_9fa48("8111") ? "" : (stryCov_9fa48("8111"), 'numeric'),
                            year: stryMutAct_9fa48("8112") ? "" : (stryCov_9fa48("8112"), 'numeric')
                          }))}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(workshop.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{workshop.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{workshop.attended_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--laptops">
                                                            {stryMutAct_9fa48("8115") ? workshop.registrations?.filter(reg => reg.needs_laptop).length && 0 : stryMutAct_9fa48("8114") ? false : stryMutAct_9fa48("8113") ? true : (stryCov_9fa48("8113", "8114", "8115"), (stryMutAct_9fa48("8117") ? workshop.registrations.filter(reg => reg.needs_laptop).length : stryMutAct_9fa48("8116") ? workshop.registrations.length : (stryCov_9fa48("8116", "8117"), workshop.registrations?.filter(stryMutAct_9fa48("8118") ? () => undefined : (stryCov_9fa48("8118"), reg => reg.needs_laptop)).length)) || 0)}
                                                        </span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button className={stryMutAct_9fa48("8119") ? `` : (stryCov_9fa48("8119"), `active-toggle-btn ${workshop.is_active ? stryMutAct_9fa48("8120") ? "" : (stryCov_9fa48("8120"), 'active-toggle-btn--active') : stryMutAct_9fa48("8121") ? "" : (stryCov_9fa48("8121"), 'active-toggle-btn--inactive')}`)} onClick={stryMutAct_9fa48("8122") ? () => undefined : (stryCov_9fa48("8122"), () => handleToggleEventActive(workshop.event_id))} title={workshop.is_active ? stryMutAct_9fa48("8123") ? "" : (stryCov_9fa48("8123"), 'Click to deactivate event') : stryMutAct_9fa48("8124") ? "" : (stryCov_9fa48("8124"), 'Click to activate event')}>
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={stryMutAct_9fa48("8125") ? `` : (stryCov_9fa48("8125"), `active-status-label ${workshop.is_active ? stryMutAct_9fa48("8126") ? "" : (stryCov_9fa48("8126"), 'active-status-label--active') : stryMutAct_9fa48("8127") ? "" : (stryCov_9fa48("8127"), 'active-status-label--inactive')}`)}>
                                                                {workshop.is_active ? stryMutAct_9fa48("8128") ? "" : (stryCov_9fa48("8128"), 'Active') : stryMutAct_9fa48("8129") ? "" : (stryCov_9fa48("8129"), 'Inactive')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="edit-btn" onClick={stryMutAct_9fa48("8130") ? () => undefined : (stryCov_9fa48("8130"), () => openEditWorkshopModal(workshop))}>
                                                            Edit
                                                        </button>
                                                        <button className="view-registrations-btn" onClick={stryMutAct_9fa48("8131") ? () => undefined : (stryCov_9fa48("8131"), () => handleViewRegistrations(stryMutAct_9fa48("8132") ? "" : (stryCov_9fa48("8132"), 'workshop'), workshop.event_id))}>
                                                            {(stryMutAct_9fa48("8135") ? selectedEvent !== workshop.event_id : stryMutAct_9fa48("8134") ? false : stryMutAct_9fa48("8133") ? true : (stryCov_9fa48("8133", "8134", "8135"), selectedEvent === workshop.event_id)) ? stryMutAct_9fa48("8136") ? "" : (stryCov_9fa48("8136"), 'Hide Registrations') : stryMutAct_9fa48("8137") ? "" : (stryCov_9fa48("8137"), 'View Registrations')}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {stryMutAct_9fa48("8140") ? selectedEvent === workshop.event_id || <tr className="registrations-row">
                                                        <td colSpan="7" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={() => openAddRegistrationModal(workshop.event_id, 'workshop')} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Laptop</th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={() => handleEmailClick(reg.email)} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={() => handlePhoneClick(reg.phone_number)} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="laptop-indicator-cell">
                                                                                            {reg.needs_laptop ? <span className="laptop-needed" title="Needs to borrow a laptop">
                                                                                                    <span className="laptop-icon">💻</span>
                                                                                                    <span className="laptop-text">Needs</span>
                                                                                                </span> : <span className="laptop-own" title="Has own laptop">
                                                                                                    <span className="laptop-icon">✓</span>
                                                                                                    <span className="laptop-text">Own</span>
                                                                                                </span>}
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={`attendance-status-dropdown-unified status-${reg.status}`} value={reg.status} onChange={e => {
                                    if (e.target.value !== reg.status) {
                                      handleMarkAttendance('workshop', workshop.event_id, reg.applicant_id, e.target.value);
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={() => handleRemoveRegistration('workshop', workshop.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>)}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr> : stryMutAct_9fa48("8139") ? false : stryMutAct_9fa48("8138") ? true : (stryCov_9fa48("8138", "8139", "8140"), (stryMutAct_9fa48("8142") ? selectedEvent !== workshop.event_id : stryMutAct_9fa48("8141") ? true : (stryCov_9fa48("8141", "8142"), selectedEvent === workshop.event_id)) && <tr className="registrations-row">
                                                        <td colSpan="7" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button className="add-registration-btn" onClick={stryMutAct_9fa48("8143") ? () => undefined : (stryCov_9fa48("8143"), () => openAddRegistrationModal(workshop.event_id, stryMutAct_9fa48("8144") ? "" : (stryCov_9fa48("8144"), 'workshop')))} title="Add registration">
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {(stryMutAct_9fa48("8148") ? eventRegistrations.length <= 0 : stryMutAct_9fa48("8147") ? eventRegistrations.length >= 0 : stryMutAct_9fa48("8146") ? false : stryMutAct_9fa48("8145") ? true : (stryCov_9fa48("8145", "8146", "8147", "8148"), eventRegistrations.length > 0)) ? <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button className="copy-all-btn" onClick={copyAllEmails} title="Copy all emails">
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button className="copy-all-btn" onClick={copyAllPhoneNumbers} title="Copy all phone numbers">
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Laptop</th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map(stryMutAct_9fa48("8149") ? () => undefined : (stryCov_9fa48("8149"), reg => <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span className="copyable-email" onClick={stryMutAct_9fa48("8150") ? () => undefined : (stryCov_9fa48("8150"), () => handleEmailClick(reg.email))} title="Click to copy email">
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className="copyable-phone" onClick={stryMutAct_9fa48("8151") ? () => undefined : (stryCov_9fa48("8151"), () => handlePhoneClick(reg.phone_number))} title="Click to copy phone number">
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="laptop-indicator-cell">
                                                                                            {reg.needs_laptop ? <span className="laptop-needed" title="Needs to borrow a laptop">
                                                                                                    <span className="laptop-icon">💻</span>
                                                                                                    <span className="laptop-text">Needs</span>
                                                                                                </span> : <span className="laptop-own" title="Has own laptop">
                                                                                                    <span className="laptop-icon">✓</span>
                                                                                                    <span className="laptop-text">Own</span>
                                                                                                </span>}
                                                                                        </td>
                                                                                        <td>
                                                                                            <select className={stryMutAct_9fa48("8152") ? `` : (stryCov_9fa48("8152"), `attendance-status-dropdown-unified status-${reg.status}`)} value={reg.status} onChange={e => {
                                    if (stryMutAct_9fa48("8153")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("8153");
                                      if (stryMutAct_9fa48("8156") ? e.target.value === reg.status : stryMutAct_9fa48("8155") ? false : stryMutAct_9fa48("8154") ? true : (stryCov_9fa48("8154", "8155", "8156"), e.target.value !== reg.status)) {
                                        if (stryMutAct_9fa48("8157")) {
                                          {}
                                        } else {
                                          stryCov_9fa48("8157");
                                          handleMarkAttendance(stryMutAct_9fa48("8158") ? "" : (stryCov_9fa48("8158"), 'workshop'), workshop.event_id, reg.applicant_id, e.target.value);
                                        }
                                      }
                                    }
                                  }}>
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button className="remove-registration-btn" onClick={stryMutAct_9fa48("8159") ? () => undefined : (stryCov_9fa48("8159"), () => handleRemoveRegistration(stryMutAct_9fa48("8160") ? "" : (stryCov_9fa48("8160"), 'workshop'), workshop.event_id, reg.registration_id, stryMutAct_9fa48("8161") ? `` : (stryCov_9fa48("8161"), `${reg.first_name} ${reg.last_name}`)))} title="Cancel registration">
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div> : <p>No registrations found</p>}
                                                            </div>
                                                        </td>
                                                    </tr>)}
                                            </React.Fragment>))}
                                    </tbody>
                                </table>
                            </div> : <div className="no-data-message">
                                <p>No workshops found</p>
                            </div>}
                    </div>)}

                {stryMutAct_9fa48("8164") ? activeTab === 'emails' || <div className="admissions-dashboard__email-automation">
                        <div className="data-section__header">
                            <h2>Email Management</h2>
                            <div className="data-section__actions">
                                <button onClick={async () => {
                setEmailAutomationLoading(true);
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/run`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      dryRun: true
                    })
                  });
                  if (response.ok) {
                    const results = await response.json();

                    // Format email list for SweetAlert2
                    let emailListHtml = '';
                    let skippedListHtml = '';

                    // Format emails to be sent
                    if (results.emailsToSend && results.emailsToSend.length > 0) {
                      emailListHtml = `
                                                        <div class="email-preview-list">
                                                            <table class="email-preview-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Applicant</th>
                                                                        <th>Email</th>
                                                                        <th>Email Type</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${results.emailsToSend.map(email => `
                                                                        <tr>
                                                                            <td>${email.name}</td>
                                                                            <td>${email.email}</td>
                                                                            <td><span class="email-type">${email.email_type.replace(/_/g, ' ')}</span></td>
                                                                            <td><span class="email-action">${email.action}</span></td>
                                                                        </tr>
                                                                    `).join('')}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    `;
                    } else {
                      emailListHtml = '<p>No emails would be sent at this time.</p>';
                    }

                    // Format skipped applicants
                    if (results.skippedApplicants && results.skippedApplicants.length > 0) {
                      skippedListHtml = `
                                                        <div class="skipped-applicants">
                                                            <details>
                                                                <summary>
                                                                    <span class="skipped-summary-title">
                                                                        Applicants Not Receiving Emails (${results.skippedApplicants.length})
                                                                    </span>
                                                                </summary>
                                                                <div class="skipped-content">
                                                                    <table class="skipped-applicants-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Applicant</th>
                                                                                <th>Email</th>
                                                                                <th>Reason</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${results.skippedApplicants.map(applicant => `
                                                                                <tr>
                                                                                    <td>${applicant.name}</td>
                                                                                    <td>${applicant.email}</td>
                                                                                    <td><span class="skip-reason">${applicant.reason}</span></td>
                                                                                </tr>
                                                                            `).join('')}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </details>
                                                        </div>
                                                    `;
                    }

                    // Use SweetAlert2 for better formatting
                    Swal.fire({
                      title: '🧪 Test Run Results',
                      icon: 'info',
                      html: `
                                                        <div class="email-preview-summary">
                                                            <div class="summary-item">
                                                                <span class="summary-label">Applicants Processed:</span>
                                                                <span class="summary-value">${results.applicantsProcessed}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Emails to Send:</span>
                                                                <span class="summary-value">${results.emailsSent}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Emails to Queue:</span>
                                                                <span class="summary-value">${results.emailsQueued}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Applicants Skipped:</span>
                                                                <span class="summary-value">${results.skippedApplicants ? results.skippedApplicants.length : 0}</span>
                                                            </div>
                                                        </div>
                                                        <h4>Emails To Be Sent</h4>
                                                        ${emailListHtml}
                                                        ${skippedListHtml}
                                                    `,
                      customClass: {
                        container: 'email-preview-container',
                        popup: 'email-preview-popup',
                        content: 'email-preview-content'
                      },
                      width: '800px',
                      confirmButtonText: 'Close',
                      confirmButtonColor: 'var(--color-primary)',
                      background: 'var(--color-background-dark)',
                      color: 'var(--color-text-primary)'
                    });
                  } else {
                    Swal.fire({
                      title: 'Error',
                      text: 'Failed to run test preview',
                      icon: 'error',
                      confirmButtonColor: 'var(--color-primary)',
                      background: 'var(--color-background-dark)',
                      color: 'var(--color-text-primary)'
                    });
                  }
                } catch (error) {
                  console.error('Error running dry run:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while running the test preview',
                    icon: 'error',
                    confirmButtonColor: 'var(--color-primary)',
                    background: 'var(--color-background-dark)',
                    color: 'var(--color-text-primary)'
                  });
                } finally {
                  setEmailAutomationLoading(false);
                }
              }} className="create-btn create-btn--secondary" disabled={emailAutomationLoading}>
                                    {emailAutomationLoading ? 'Running...' : '🧪 Test Run (Preview)'}
                                </button>
                                
                                {/* Test Email Section */}
                                <div className="test-email-section">
                                    <input type="email" placeholder="Enter email address for test" value={testEmailAddress} onChange={e => setTestEmailAddress(e.target.value)} className="test-email-input" disabled={testEmailLoading} />
                                    <button onClick={sendTestEmail} className="create-btn create-btn--secondary" disabled={testEmailLoading || !testEmailAddress.trim()}>
                                        {testEmailLoading ? 'Sending...' : '📧 Send Test Email'}
                                    </button>
                                </div>
                                
                                <button onClick={async () => {
                // Use SweetAlert2 for confirmation
                const confirmResult = await Swal.fire({
                  title: 'Send Real Emails?',
                  html: `
                                                <div class="email-confirm-message">
                                                    <p>This will send <strong>actual emails</strong> to applicants.</p>
                                                    <p>Are you sure you want to continue?</p>
                                                </div>
                                            `,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, Send Emails',
                  cancelButtonText: 'Cancel',
                  confirmButtonColor: 'var(--color-danger)',
                  cancelButtonColor: 'var(--color-secondary)',
                  background: 'var(--color-background-dark)',
                  color: 'var(--color-text-primary)'
                });
                if (!confirmResult.isConfirmed) {
                  return;
                }
                setEmailAutomationLoading(true);
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/run`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      dryRun: false
                    })
                  });
                  if (response.ok) {
                    const results = await response.json();
                    if (results.success === false) {
                      Swal.fire({
                        title: 'Email Automation Disabled',
                        text: results.message || 'Email automation is disabled',
                        icon: 'error',
                        confirmButtonColor: 'var(--color-primary)',
                        background: 'var(--color-background-dark)',
                        color: 'var(--color-text-primary)'
                      });
                    } else {
                      // Format results for SweetAlert2
                      Swal.fire({
                        title: 'Email Automation Complete',
                        icon: 'success',
                        html: `
                                                            <div class="email-results-summary">
                                                                <div class="summary-item">
                                                                    <span class="summary-label">Emails Sent:</span>
                                                                    <span class="summary-value">${results.emailsSent}</span>
                                                                </div>
                                                                <div class="summary-item">
                                                                    <span class="summary-label">Emails Queued:</span>
                                                                    <span class="summary-value">${results.emailsQueued}</span>
                                                                </div>
                                                            </div>
                                                        `,
                        confirmButtonText: 'View Details',
                        confirmButtonColor: 'var(--color-primary)',
                        background: 'var(--color-background-dark)',
                        color: 'var(--color-text-primary)'
                      });

                      // Refresh all data
                      fetchEmailStats();
                      fetchQueuedEmails();
                      fetchEmailHistory();
                      fetchApplicantEmailStatus();
                    }
                  } else {
                    Swal.fire({
                      title: 'Error',
                      text: 'Failed to run email automation',
                      icon: 'error',
                      confirmButtonColor: 'var(--color-primary)',
                      background: 'var(--color-background-dark)',
                      color: 'var(--color-text-primary)'
                    });
                  }
                } catch (error) {
                  console.error('Error running email automation:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while running email automation',
                    icon: 'error',
                    confirmButtonColor: 'var(--color-primary)',
                    background: 'var(--color-background-dark)',
                    color: 'var(--color-text-primary)'
                  });
                } finally {
                  setEmailAutomationLoading(false);
                }
              }} className="create-btn create-btn--danger" disabled={emailAutomationLoading}>
                                    {emailAutomationLoading ? 'Running...' : '📧 Run Email Automation'}
                                </button>
                                <button onClick={() => {
                fetchEmailStats();
                fetchQueuedEmails();
                fetchEmailHistory();
                fetchApplicantEmailStatus();
              }} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Email Stats Overview */}
                        {emailStats && <div className="email-automation-stats">
                                <h3>Email Automation Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.total_emails_sent || 0}</div>
                                        <div className="stat-label">Total Emails Sent</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.unique_recipients || 0}</div>
                                        <div className="stat-label">Unique Recipients</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.emails_queued || 0}</div>
                                        <div className="stat-label">Emails Queued</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {emailStats.total_emails_sent > 0 ? Math.round(emailStats.emails_opened / emailStats.total_emails_sent * 100) : 0}%
                                        </div>
                                        <div className="stat-label">Open Rate</div>
                                    </div>
                                </div>

                                {/* Opt-out Stats */}
                                <div className="opt-out-stats">
                                    <h4>Opt-out Reason Breakdown</h4>
                                    <div className="opt-out-reasons-grid">
                                        {emailStats.optOutReasons && emailStats.optOutReasons.length > 0 ? emailStats.optOutReasons.map(reason => <div key={reason.reason_category} className="opt-out-reason-card">
                                                    <div className="opt-out-reason-value">{reason.count}</div>
                                                    <div className="opt-out-reason-label">{reason.reason_category}</div>
                                                </div>) : emailStats.total_opted_out > 0 ? <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">{emailStats.total_opted_out}</div>
                                                <div className="opt-out-reason-label">Total Opted Out</div>
                                                <div className="opt-out-reason-note">(No reason data available)</div>
                                            </div> : <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">0</div>
                                                <div className="opt-out-reason-label">No Opt-outs</div>
                                            </div>}
                                    </div>
                                    
                                    {/* Other Reasons Details */}
                                    {emailStats.otherReasons && emailStats.otherReasons.length > 0 && <div className="other-reasons-section">
                                            <h5>Custom Opt-out Reasons:</h5>
                                            <div className="other-reasons-list">
                                                {emailStats.otherReasons.map((reason, index) => <div key={index} className="other-reason-item">
                                                        <span className="other-reason-text">
                                                            {reason.email_opt_out_reason.replace(/^(Unsubscribed|Deferred application) - /, '')}
                                                        </span>
                                                        <span className="other-reason-count">({reason.count})</span>
                                                    </div>)}
                                            </div>
                                        </div>}
                                </div>

                                {/* Email Type Breakdown */}
                                {emailStats.typeBreakdown && emailStats.typeBreakdown.length > 0 && <div className="email-type-breakdown">
                                        <h4>Email Type Breakdown</h4>
                                        <div className="data-table-container">
                                            <table className="data-table email-type-table">
                                                <thead>
                                                    <tr>
                                                        <th className="email-type-col">Email Type</th>
                                                        <th className="sent-col">Sent</th>
                                                        <th className="queued-col">Queued</th>
                                                        <th className="avg-col">Avg Sends per Applicant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailStats.typeBreakdown.map(type => <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="queued-cell">{type.queued_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>}
                            </div>}

                        {/* Queued Emails */}
                        <div className="queued-emails-section">
                            <h3>Queued Emails ({queuedEmails.length})</h3>
                            {queuedEmails.length > 0 ? <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Email</th>
                                                <th>Email Type</th>
                                                <th>Queued At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queuedEmails.map(email => <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </td>
                                                    <td>{new Date(email.created_at).toLocaleString()}</td>
                                                </tr>)}
                                        </tbody>
                                    </table>
                                </div> : <div className="no-data-message">
                                    <p>No emails currently queued</p>
                                </div>}
                        </div>

                        {/* Email History */}
                        <div className="email-history-section">
                            <h3>Recent Email History ({emailHistory.length})</h3>
                            {emailHistory.length > 0 ? <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Email</th>
                                                <th>Email Type</th>
                                                <th>Sent At</th>
                                                <th>Send Count</th>
                                                <th>Next Send</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {emailHistory.map(email => <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </td>
                                                    <td>{new Date(email.email_sent_at).toLocaleString()}</td>
                                                    <td>
                                                        <span className={`send-count ${email.send_count >= 3 ? 'send-count--max' : ''}`}>
                                                            {email.send_count}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {email.next_send_at ? <span className="next-send">
                                                                {new Date(email.next_send_at).toLocaleDateString()}
                                                            </span> : <span className="next-send--none">None</span>}
                                                    </td>
                                                </tr>)}
                                        </tbody>
                                    </table>
                                </div> : <div className="no-data-message">
                                    <p>No email history found</p>
                                </div>}
                        </div>
                    </div> : stryMutAct_9fa48("8163") ? false : stryMutAct_9fa48("8162") ? true : (stryCov_9fa48("8162", "8163", "8164"), (stryMutAct_9fa48("8166") ? activeTab !== 'emails' : stryMutAct_9fa48("8165") ? true : (stryCov_9fa48("8165", "8166"), activeTab === (stryMutAct_9fa48("8167") ? "" : (stryCov_9fa48("8167"), 'emails')))) && <div className="admissions-dashboard__email-automation">
                        <div className="data-section__header">
                            <h2>Email Management</h2>
                            <div className="data-section__actions">
                                <button onClick={async () => {
                if (stryMutAct_9fa48("8168")) {
                  {}
                } else {
                  stryCov_9fa48("8168");
                  setEmailAutomationLoading(stryMutAct_9fa48("8169") ? false : (stryCov_9fa48("8169"), true));
                  try {
                    if (stryMutAct_9fa48("8170")) {
                      {}
                    } else {
                      stryCov_9fa48("8170");
                      const response = await fetch(stryMutAct_9fa48("8171") ? `` : (stryCov_9fa48("8171"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/run`), stryMutAct_9fa48("8172") ? {} : (stryCov_9fa48("8172"), {
                        method: stryMutAct_9fa48("8173") ? "" : (stryCov_9fa48("8173"), 'POST'),
                        headers: stryMutAct_9fa48("8174") ? {} : (stryCov_9fa48("8174"), {
                          'Authorization': stryMutAct_9fa48("8175") ? `` : (stryCov_9fa48("8175"), `Bearer ${token}`),
                          'Content-Type': stryMutAct_9fa48("8176") ? "" : (stryCov_9fa48("8176"), 'application/json')
                        }),
                        body: JSON.stringify(stryMutAct_9fa48("8177") ? {} : (stryCov_9fa48("8177"), {
                          dryRun: stryMutAct_9fa48("8178") ? false : (stryCov_9fa48("8178"), true)
                        }))
                      }));
                      if (stryMutAct_9fa48("8180") ? false : stryMutAct_9fa48("8179") ? true : (stryCov_9fa48("8179", "8180"), response.ok)) {
                        if (stryMutAct_9fa48("8181")) {
                          {}
                        } else {
                          stryCov_9fa48("8181");
                          const results = await response.json();

                          // Format email list for SweetAlert2
                          let emailListHtml = stryMutAct_9fa48("8182") ? "Stryker was here!" : (stryCov_9fa48("8182"), '');
                          let skippedListHtml = stryMutAct_9fa48("8183") ? "Stryker was here!" : (stryCov_9fa48("8183"), '');

                          // Format emails to be sent
                          if (stryMutAct_9fa48("8186") ? results.emailsToSend || results.emailsToSend.length > 0 : stryMutAct_9fa48("8185") ? false : stryMutAct_9fa48("8184") ? true : (stryCov_9fa48("8184", "8185", "8186"), results.emailsToSend && (stryMutAct_9fa48("8189") ? results.emailsToSend.length <= 0 : stryMutAct_9fa48("8188") ? results.emailsToSend.length >= 0 : stryMutAct_9fa48("8187") ? true : (stryCov_9fa48("8187", "8188", "8189"), results.emailsToSend.length > 0)))) {
                            if (stryMutAct_9fa48("8190")) {
                              {}
                            } else {
                              stryCov_9fa48("8190");
                              emailListHtml = stryMutAct_9fa48("8191") ? `` : (stryCov_9fa48("8191"), `
                                                        <div class="email-preview-list">
                                                            <table class="email-preview-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Applicant</th>
                                                                        <th>Email</th>
                                                                        <th>Email Type</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${results.emailsToSend.map(stryMutAct_9fa48("8192") ? () => undefined : (stryCov_9fa48("8192"), email => stryMutAct_9fa48("8193") ? `` : (stryCov_9fa48("8193"), `
                                                                        <tr>
                                                                            <td>${email.name}</td>
                                                                            <td>${email.email}</td>
                                                                            <td><span class="email-type">${email.email_type.replace(/_/g, stryMutAct_9fa48("8194") ? "" : (stryCov_9fa48("8194"), ' '))}</span></td>
                                                                            <td><span class="email-action">${email.action}</span></td>
                                                                        </tr>
                                                                    `))).join(stryMutAct_9fa48("8195") ? "Stryker was here!" : (stryCov_9fa48("8195"), ''))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    `);
                            }
                          } else {
                            if (stryMutAct_9fa48("8196")) {
                              {}
                            } else {
                              stryCov_9fa48("8196");
                              emailListHtml = stryMutAct_9fa48("8197") ? "" : (stryCov_9fa48("8197"), '<p>No emails would be sent at this time.</p>');
                            }
                          }

                          // Format skipped applicants
                          if (stryMutAct_9fa48("8200") ? results.skippedApplicants || results.skippedApplicants.length > 0 : stryMutAct_9fa48("8199") ? false : stryMutAct_9fa48("8198") ? true : (stryCov_9fa48("8198", "8199", "8200"), results.skippedApplicants && (stryMutAct_9fa48("8203") ? results.skippedApplicants.length <= 0 : stryMutAct_9fa48("8202") ? results.skippedApplicants.length >= 0 : stryMutAct_9fa48("8201") ? true : (stryCov_9fa48("8201", "8202", "8203"), results.skippedApplicants.length > 0)))) {
                            if (stryMutAct_9fa48("8204")) {
                              {}
                            } else {
                              stryCov_9fa48("8204");
                              skippedListHtml = stryMutAct_9fa48("8205") ? `` : (stryCov_9fa48("8205"), `
                                                        <div class="skipped-applicants">
                                                            <details>
                                                                <summary>
                                                                    <span class="skipped-summary-title">
                                                                        Applicants Not Receiving Emails (${results.skippedApplicants.length})
                                                                    </span>
                                                                </summary>
                                                                <div class="skipped-content">
                                                                    <table class="skipped-applicants-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Applicant</th>
                                                                                <th>Email</th>
                                                                                <th>Reason</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${results.skippedApplicants.map(stryMutAct_9fa48("8206") ? () => undefined : (stryCov_9fa48("8206"), applicant => stryMutAct_9fa48("8207") ? `` : (stryCov_9fa48("8207"), `
                                                                                <tr>
                                                                                    <td>${applicant.name}</td>
                                                                                    <td>${applicant.email}</td>
                                                                                    <td><span class="skip-reason">${applicant.reason}</span></td>
                                                                                </tr>
                                                                            `))).join(stryMutAct_9fa48("8208") ? "Stryker was here!" : (stryCov_9fa48("8208"), ''))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </details>
                                                        </div>
                                                    `);
                            }
                          }

                          // Use SweetAlert2 for better formatting
                          Swal.fire(stryMutAct_9fa48("8209") ? {} : (stryCov_9fa48("8209"), {
                            title: stryMutAct_9fa48("8210") ? "" : (stryCov_9fa48("8210"), '🧪 Test Run Results'),
                            icon: stryMutAct_9fa48("8211") ? "" : (stryCov_9fa48("8211"), 'info'),
                            html: stryMutAct_9fa48("8212") ? `` : (stryCov_9fa48("8212"), `
                                                        <div class="email-preview-summary">
                                                            <div class="summary-item">
                                                                <span class="summary-label">Applicants Processed:</span>
                                                                <span class="summary-value">${results.applicantsProcessed}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Emails to Send:</span>
                                                                <span class="summary-value">${results.emailsSent}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Emails to Queue:</span>
                                                                <span class="summary-value">${results.emailsQueued}</span>
                                                            </div>
                                                            <div class="summary-item">
                                                                <span class="summary-label">Applicants Skipped:</span>
                                                                <span class="summary-value">${results.skippedApplicants ? results.skippedApplicants.length : 0}</span>
                                                            </div>
                                                        </div>
                                                        <h4>Emails To Be Sent</h4>
                                                        ${emailListHtml}
                                                        ${skippedListHtml}
                                                    `),
                            customClass: stryMutAct_9fa48("8213") ? {} : (stryCov_9fa48("8213"), {
                              container: stryMutAct_9fa48("8214") ? "" : (stryCov_9fa48("8214"), 'email-preview-container'),
                              popup: stryMutAct_9fa48("8215") ? "" : (stryCov_9fa48("8215"), 'email-preview-popup'),
                              content: stryMutAct_9fa48("8216") ? "" : (stryCov_9fa48("8216"), 'email-preview-content')
                            }),
                            width: stryMutAct_9fa48("8217") ? "" : (stryCov_9fa48("8217"), '800px'),
                            confirmButtonText: stryMutAct_9fa48("8218") ? "" : (stryCov_9fa48("8218"), 'Close'),
                            confirmButtonColor: stryMutAct_9fa48("8219") ? "" : (stryCov_9fa48("8219"), 'var(--color-primary)'),
                            background: stryMutAct_9fa48("8220") ? "" : (stryCov_9fa48("8220"), 'var(--color-background-dark)'),
                            color: stryMutAct_9fa48("8221") ? "" : (stryCov_9fa48("8221"), 'var(--color-text-primary)')
                          }));
                        }
                      } else {
                        if (stryMutAct_9fa48("8222")) {
                          {}
                        } else {
                          stryCov_9fa48("8222");
                          Swal.fire(stryMutAct_9fa48("8223") ? {} : (stryCov_9fa48("8223"), {
                            title: stryMutAct_9fa48("8224") ? "" : (stryCov_9fa48("8224"), 'Error'),
                            text: stryMutAct_9fa48("8225") ? "" : (stryCov_9fa48("8225"), 'Failed to run test preview'),
                            icon: stryMutAct_9fa48("8226") ? "" : (stryCov_9fa48("8226"), 'error'),
                            confirmButtonColor: stryMutAct_9fa48("8227") ? "" : (stryCov_9fa48("8227"), 'var(--color-primary)'),
                            background: stryMutAct_9fa48("8228") ? "" : (stryCov_9fa48("8228"), 'var(--color-background-dark)'),
                            color: stryMutAct_9fa48("8229") ? "" : (stryCov_9fa48("8229"), 'var(--color-text-primary)')
                          }));
                        }
                      }
                    }
                  } catch (error) {
                    if (stryMutAct_9fa48("8230")) {
                      {}
                    } else {
                      stryCov_9fa48("8230");
                      console.error(stryMutAct_9fa48("8231") ? "" : (stryCov_9fa48("8231"), 'Error running dry run:'), error);
                      Swal.fire(stryMutAct_9fa48("8232") ? {} : (stryCov_9fa48("8232"), {
                        title: stryMutAct_9fa48("8233") ? "" : (stryCov_9fa48("8233"), 'Error'),
                        text: stryMutAct_9fa48("8234") ? "" : (stryCov_9fa48("8234"), 'An error occurred while running the test preview'),
                        icon: stryMutAct_9fa48("8235") ? "" : (stryCov_9fa48("8235"), 'error'),
                        confirmButtonColor: stryMutAct_9fa48("8236") ? "" : (stryCov_9fa48("8236"), 'var(--color-primary)'),
                        background: stryMutAct_9fa48("8237") ? "" : (stryCov_9fa48("8237"), 'var(--color-background-dark)'),
                        color: stryMutAct_9fa48("8238") ? "" : (stryCov_9fa48("8238"), 'var(--color-text-primary)')
                      }));
                    }
                  } finally {
                    if (stryMutAct_9fa48("8239")) {
                      {}
                    } else {
                      stryCov_9fa48("8239");
                      setEmailAutomationLoading(stryMutAct_9fa48("8240") ? true : (stryCov_9fa48("8240"), false));
                    }
                  }
                }
              }} className="create-btn create-btn--secondary" disabled={emailAutomationLoading}>
                                    {emailAutomationLoading ? stryMutAct_9fa48("8241") ? "" : (stryCov_9fa48("8241"), 'Running...') : stryMutAct_9fa48("8242") ? "" : (stryCov_9fa48("8242"), '🧪 Test Run (Preview)')}
                                </button>
                                
                                {/* Test Email Section */}
                                <div className="test-email-section">
                                    <input type="email" placeholder="Enter email address for test" value={testEmailAddress} onChange={stryMutAct_9fa48("8243") ? () => undefined : (stryCov_9fa48("8243"), e => setTestEmailAddress(e.target.value))} className="test-email-input" disabled={testEmailLoading} />
                                    <button onClick={sendTestEmail} className="create-btn create-btn--secondary" disabled={stryMutAct_9fa48("8246") ? testEmailLoading && !testEmailAddress.trim() : stryMutAct_9fa48("8245") ? false : stryMutAct_9fa48("8244") ? true : (stryCov_9fa48("8244", "8245", "8246"), testEmailLoading || (stryMutAct_9fa48("8247") ? testEmailAddress.trim() : (stryCov_9fa48("8247"), !(stryMutAct_9fa48("8248") ? testEmailAddress : (stryCov_9fa48("8248"), testEmailAddress.trim())))))}>
                                        {testEmailLoading ? stryMutAct_9fa48("8249") ? "" : (stryCov_9fa48("8249"), 'Sending...') : stryMutAct_9fa48("8250") ? "" : (stryCov_9fa48("8250"), '📧 Send Test Email')}
                                    </button>
                                </div>
                                
                                <button onClick={async () => {
                if (stryMutAct_9fa48("8251")) {
                  {}
                } else {
                  stryCov_9fa48("8251");
                  // Use SweetAlert2 for confirmation
                  const confirmResult = await Swal.fire(stryMutAct_9fa48("8252") ? {} : (stryCov_9fa48("8252"), {
                    title: stryMutAct_9fa48("8253") ? "" : (stryCov_9fa48("8253"), 'Send Real Emails?'),
                    html: stryMutAct_9fa48("8254") ? `` : (stryCov_9fa48("8254"), `
                                                <div class="email-confirm-message">
                                                    <p>This will send <strong>actual emails</strong> to applicants.</p>
                                                    <p>Are you sure you want to continue?</p>
                                                </div>
                                            `),
                    icon: stryMutAct_9fa48("8255") ? "" : (stryCov_9fa48("8255"), 'warning'),
                    showCancelButton: stryMutAct_9fa48("8256") ? false : (stryCov_9fa48("8256"), true),
                    confirmButtonText: stryMutAct_9fa48("8257") ? "" : (stryCov_9fa48("8257"), 'Yes, Send Emails'),
                    cancelButtonText: stryMutAct_9fa48("8258") ? "" : (stryCov_9fa48("8258"), 'Cancel'),
                    confirmButtonColor: stryMutAct_9fa48("8259") ? "" : (stryCov_9fa48("8259"), 'var(--color-danger)'),
                    cancelButtonColor: stryMutAct_9fa48("8260") ? "" : (stryCov_9fa48("8260"), 'var(--color-secondary)'),
                    background: stryMutAct_9fa48("8261") ? "" : (stryCov_9fa48("8261"), 'var(--color-background-dark)'),
                    color: stryMutAct_9fa48("8262") ? "" : (stryCov_9fa48("8262"), 'var(--color-text-primary)')
                  }));
                  if (stryMutAct_9fa48("8265") ? false : stryMutAct_9fa48("8264") ? true : stryMutAct_9fa48("8263") ? confirmResult.isConfirmed : (stryCov_9fa48("8263", "8264", "8265"), !confirmResult.isConfirmed)) {
                    if (stryMutAct_9fa48("8266")) {
                      {}
                    } else {
                      stryCov_9fa48("8266");
                      return;
                    }
                  }
                  setEmailAutomationLoading(stryMutAct_9fa48("8267") ? false : (stryCov_9fa48("8267"), true));
                  try {
                    if (stryMutAct_9fa48("8268")) {
                      {}
                    } else {
                      stryCov_9fa48("8268");
                      const response = await fetch(stryMutAct_9fa48("8269") ? `` : (stryCov_9fa48("8269"), `${import.meta.env.VITE_API_URL}/api/admissions/email-automation/run`), stryMutAct_9fa48("8270") ? {} : (stryCov_9fa48("8270"), {
                        method: stryMutAct_9fa48("8271") ? "" : (stryCov_9fa48("8271"), 'POST'),
                        headers: stryMutAct_9fa48("8272") ? {} : (stryCov_9fa48("8272"), {
                          'Authorization': stryMutAct_9fa48("8273") ? `` : (stryCov_9fa48("8273"), `Bearer ${token}`),
                          'Content-Type': stryMutAct_9fa48("8274") ? "" : (stryCov_9fa48("8274"), 'application/json')
                        }),
                        body: JSON.stringify(stryMutAct_9fa48("8275") ? {} : (stryCov_9fa48("8275"), {
                          dryRun: stryMutAct_9fa48("8276") ? true : (stryCov_9fa48("8276"), false)
                        }))
                      }));
                      if (stryMutAct_9fa48("8278") ? false : stryMutAct_9fa48("8277") ? true : (stryCov_9fa48("8277", "8278"), response.ok)) {
                        if (stryMutAct_9fa48("8279")) {
                          {}
                        } else {
                          stryCov_9fa48("8279");
                          const results = await response.json();
                          if (stryMutAct_9fa48("8282") ? results.success !== false : stryMutAct_9fa48("8281") ? false : stryMutAct_9fa48("8280") ? true : (stryCov_9fa48("8280", "8281", "8282"), results.success === (stryMutAct_9fa48("8283") ? true : (stryCov_9fa48("8283"), false)))) {
                            if (stryMutAct_9fa48("8284")) {
                              {}
                            } else {
                              stryCov_9fa48("8284");
                              Swal.fire(stryMutAct_9fa48("8285") ? {} : (stryCov_9fa48("8285"), {
                                title: stryMutAct_9fa48("8286") ? "" : (stryCov_9fa48("8286"), 'Email Automation Disabled'),
                                text: stryMutAct_9fa48("8289") ? results.message && 'Email automation is disabled' : stryMutAct_9fa48("8288") ? false : stryMutAct_9fa48("8287") ? true : (stryCov_9fa48("8287", "8288", "8289"), results.message || (stryMutAct_9fa48("8290") ? "" : (stryCov_9fa48("8290"), 'Email automation is disabled'))),
                                icon: stryMutAct_9fa48("8291") ? "" : (stryCov_9fa48("8291"), 'error'),
                                confirmButtonColor: stryMutAct_9fa48("8292") ? "" : (stryCov_9fa48("8292"), 'var(--color-primary)'),
                                background: stryMutAct_9fa48("8293") ? "" : (stryCov_9fa48("8293"), 'var(--color-background-dark)'),
                                color: stryMutAct_9fa48("8294") ? "" : (stryCov_9fa48("8294"), 'var(--color-text-primary)')
                              }));
                            }
                          } else {
                            if (stryMutAct_9fa48("8295")) {
                              {}
                            } else {
                              stryCov_9fa48("8295");
                              // Format results for SweetAlert2
                              Swal.fire(stryMutAct_9fa48("8296") ? {} : (stryCov_9fa48("8296"), {
                                title: stryMutAct_9fa48("8297") ? "" : (stryCov_9fa48("8297"), 'Email Automation Complete'),
                                icon: stryMutAct_9fa48("8298") ? "" : (stryCov_9fa48("8298"), 'success'),
                                html: stryMutAct_9fa48("8299") ? `` : (stryCov_9fa48("8299"), `
                                                            <div class="email-results-summary">
                                                                <div class="summary-item">
                                                                    <span class="summary-label">Emails Sent:</span>
                                                                    <span class="summary-value">${results.emailsSent}</span>
                                                                </div>
                                                                <div class="summary-item">
                                                                    <span class="summary-label">Emails Queued:</span>
                                                                    <span class="summary-value">${results.emailsQueued}</span>
                                                                </div>
                                                            </div>
                                                        `),
                                confirmButtonText: stryMutAct_9fa48("8300") ? "" : (stryCov_9fa48("8300"), 'View Details'),
                                confirmButtonColor: stryMutAct_9fa48("8301") ? "" : (stryCov_9fa48("8301"), 'var(--color-primary)'),
                                background: stryMutAct_9fa48("8302") ? "" : (stryCov_9fa48("8302"), 'var(--color-background-dark)'),
                                color: stryMutAct_9fa48("8303") ? "" : (stryCov_9fa48("8303"), 'var(--color-text-primary)')
                              }));

                              // Refresh all data
                              fetchEmailStats();
                              fetchQueuedEmails();
                              fetchEmailHistory();
                              fetchApplicantEmailStatus();
                            }
                          }
                        }
                      } else {
                        if (stryMutAct_9fa48("8304")) {
                          {}
                        } else {
                          stryCov_9fa48("8304");
                          Swal.fire(stryMutAct_9fa48("8305") ? {} : (stryCov_9fa48("8305"), {
                            title: stryMutAct_9fa48("8306") ? "" : (stryCov_9fa48("8306"), 'Error'),
                            text: stryMutAct_9fa48("8307") ? "" : (stryCov_9fa48("8307"), 'Failed to run email automation'),
                            icon: stryMutAct_9fa48("8308") ? "" : (stryCov_9fa48("8308"), 'error'),
                            confirmButtonColor: stryMutAct_9fa48("8309") ? "" : (stryCov_9fa48("8309"), 'var(--color-primary)'),
                            background: stryMutAct_9fa48("8310") ? "" : (stryCov_9fa48("8310"), 'var(--color-background-dark)'),
                            color: stryMutAct_9fa48("8311") ? "" : (stryCov_9fa48("8311"), 'var(--color-text-primary)')
                          }));
                        }
                      }
                    }
                  } catch (error) {
                    if (stryMutAct_9fa48("8312")) {
                      {}
                    } else {
                      stryCov_9fa48("8312");
                      console.error(stryMutAct_9fa48("8313") ? "" : (stryCov_9fa48("8313"), 'Error running email automation:'), error);
                      Swal.fire(stryMutAct_9fa48("8314") ? {} : (stryCov_9fa48("8314"), {
                        title: stryMutAct_9fa48("8315") ? "" : (stryCov_9fa48("8315"), 'Error'),
                        text: stryMutAct_9fa48("8316") ? "" : (stryCov_9fa48("8316"), 'An error occurred while running email automation'),
                        icon: stryMutAct_9fa48("8317") ? "" : (stryCov_9fa48("8317"), 'error'),
                        confirmButtonColor: stryMutAct_9fa48("8318") ? "" : (stryCov_9fa48("8318"), 'var(--color-primary)'),
                        background: stryMutAct_9fa48("8319") ? "" : (stryCov_9fa48("8319"), 'var(--color-background-dark)'),
                        color: stryMutAct_9fa48("8320") ? "" : (stryCov_9fa48("8320"), 'var(--color-text-primary)')
                      }));
                    }
                  } finally {
                    if (stryMutAct_9fa48("8321")) {
                      {}
                    } else {
                      stryCov_9fa48("8321");
                      setEmailAutomationLoading(stryMutAct_9fa48("8322") ? true : (stryCov_9fa48("8322"), false));
                    }
                  }
                }
              }} className="create-btn create-btn--danger" disabled={emailAutomationLoading}>
                                    {emailAutomationLoading ? stryMutAct_9fa48("8323") ? "" : (stryCov_9fa48("8323"), 'Running...') : stryMutAct_9fa48("8324") ? "" : (stryCov_9fa48("8324"), '📧 Run Email Automation')}
                                </button>
                                <button onClick={() => {
                if (stryMutAct_9fa48("8325")) {
                  {}
                } else {
                  stryCov_9fa48("8325");
                  fetchEmailStats();
                  fetchQueuedEmails();
                  fetchEmailHistory();
                  fetchApplicantEmailStatus();
                }
              }} className="refresh-btn">
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Email Stats Overview */}
                        {stryMutAct_9fa48("8328") ? emailStats || <div className="email-automation-stats">
                                <h3>Email Automation Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.total_emails_sent || 0}</div>
                                        <div className="stat-label">Total Emails Sent</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.unique_recipients || 0}</div>
                                        <div className="stat-label">Unique Recipients</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.emails_queued || 0}</div>
                                        <div className="stat-label">Emails Queued</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {emailStats.total_emails_sent > 0 ? Math.round(emailStats.emails_opened / emailStats.total_emails_sent * 100) : 0}%
                                        </div>
                                        <div className="stat-label">Open Rate</div>
                                    </div>
                                </div>

                                {/* Opt-out Stats */}
                                <div className="opt-out-stats">
                                    <h4>Opt-out Reason Breakdown</h4>
                                    <div className="opt-out-reasons-grid">
                                        {emailStats.optOutReasons && emailStats.optOutReasons.length > 0 ? emailStats.optOutReasons.map(reason => <div key={reason.reason_category} className="opt-out-reason-card">
                                                    <div className="opt-out-reason-value">{reason.count}</div>
                                                    <div className="opt-out-reason-label">{reason.reason_category}</div>
                                                </div>) : emailStats.total_opted_out > 0 ? <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">{emailStats.total_opted_out}</div>
                                                <div className="opt-out-reason-label">Total Opted Out</div>
                                                <div className="opt-out-reason-note">(No reason data available)</div>
                                            </div> : <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">0</div>
                                                <div className="opt-out-reason-label">No Opt-outs</div>
                                            </div>}
                                    </div>
                                    
                                    {/* Other Reasons Details */}
                                    {emailStats.otherReasons && emailStats.otherReasons.length > 0 && <div className="other-reasons-section">
                                            <h5>Custom Opt-out Reasons:</h5>
                                            <div className="other-reasons-list">
                                                {emailStats.otherReasons.map((reason, index) => <div key={index} className="other-reason-item">
                                                        <span className="other-reason-text">
                                                            {reason.email_opt_out_reason.replace(/^(Unsubscribed|Deferred application) - /, '')}
                                                        </span>
                                                        <span className="other-reason-count">({reason.count})</span>
                                                    </div>)}
                                            </div>
                                        </div>}
                                </div>

                                {/* Email Type Breakdown */}
                                {emailStats.typeBreakdown && emailStats.typeBreakdown.length > 0 && <div className="email-type-breakdown">
                                        <h4>Email Type Breakdown</h4>
                                        <div className="data-table-container">
                                            <table className="data-table email-type-table">
                                                <thead>
                                                    <tr>
                                                        <th className="email-type-col">Email Type</th>
                                                        <th className="sent-col">Sent</th>
                                                        <th className="queued-col">Queued</th>
                                                        <th className="avg-col">Avg Sends per Applicant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailStats.typeBreakdown.map(type => <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="queued-cell">{type.queued_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>}
                            </div> : stryMutAct_9fa48("8327") ? false : stryMutAct_9fa48("8326") ? true : (stryCov_9fa48("8326", "8327", "8328"), emailStats && <div className="email-automation-stats">
                                <h3>Email Automation Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{stryMutAct_9fa48("8331") ? emailStats.total_emails_sent && 0 : stryMutAct_9fa48("8330") ? false : stryMutAct_9fa48("8329") ? true : (stryCov_9fa48("8329", "8330", "8331"), emailStats.total_emails_sent || 0)}</div>
                                        <div className="stat-label">Total Emails Sent</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{stryMutAct_9fa48("8334") ? emailStats.unique_recipients && 0 : stryMutAct_9fa48("8333") ? false : stryMutAct_9fa48("8332") ? true : (stryCov_9fa48("8332", "8333", "8334"), emailStats.unique_recipients || 0)}</div>
                                        <div className="stat-label">Unique Recipients</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{stryMutAct_9fa48("8337") ? emailStats.emails_queued && 0 : stryMutAct_9fa48("8336") ? false : stryMutAct_9fa48("8335") ? true : (stryCov_9fa48("8335", "8336", "8337"), emailStats.emails_queued || 0)}</div>
                                        <div className="stat-label">Emails Queued</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {(stryMutAct_9fa48("8341") ? emailStats.total_emails_sent <= 0 : stryMutAct_9fa48("8340") ? emailStats.total_emails_sent >= 0 : stryMutAct_9fa48("8339") ? false : stryMutAct_9fa48("8338") ? true : (stryCov_9fa48("8338", "8339", "8340", "8341"), emailStats.total_emails_sent > 0)) ? Math.round(stryMutAct_9fa48("8342") ? emailStats.emails_opened / emailStats.total_emails_sent / 100 : (stryCov_9fa48("8342"), (stryMutAct_9fa48("8343") ? emailStats.emails_opened * emailStats.total_emails_sent : (stryCov_9fa48("8343"), emailStats.emails_opened / emailStats.total_emails_sent)) * 100)) : 0}%
                                        </div>
                                        <div className="stat-label">Open Rate</div>
                                    </div>
                                </div>

                                {/* Opt-out Stats */}
                                <div className="opt-out-stats">
                                    <h4>Opt-out Reason Breakdown</h4>
                                    <div className="opt-out-reasons-grid">
                                        {(stryMutAct_9fa48("8346") ? emailStats.optOutReasons || emailStats.optOutReasons.length > 0 : stryMutAct_9fa48("8345") ? false : stryMutAct_9fa48("8344") ? true : (stryCov_9fa48("8344", "8345", "8346"), emailStats.optOutReasons && (stryMutAct_9fa48("8349") ? emailStats.optOutReasons.length <= 0 : stryMutAct_9fa48("8348") ? emailStats.optOutReasons.length >= 0 : stryMutAct_9fa48("8347") ? true : (stryCov_9fa48("8347", "8348", "8349"), emailStats.optOutReasons.length > 0)))) ? emailStats.optOutReasons.map(stryMutAct_9fa48("8350") ? () => undefined : (stryCov_9fa48("8350"), reason => <div key={reason.reason_category} className="opt-out-reason-card">
                                                    <div className="opt-out-reason-value">{reason.count}</div>
                                                    <div className="opt-out-reason-label">{reason.reason_category}</div>
                                                </div>)) : (stryMutAct_9fa48("8354") ? emailStats.total_opted_out <= 0 : stryMutAct_9fa48("8353") ? emailStats.total_opted_out >= 0 : stryMutAct_9fa48("8352") ? false : stryMutAct_9fa48("8351") ? true : (stryCov_9fa48("8351", "8352", "8353", "8354"), emailStats.total_opted_out > 0)) ? <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">{emailStats.total_opted_out}</div>
                                                <div className="opt-out-reason-label">Total Opted Out</div>
                                                <div className="opt-out-reason-note">(No reason data available)</div>
                                            </div> : <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">0</div>
                                                <div className="opt-out-reason-label">No Opt-outs</div>
                                            </div>}
                                    </div>
                                    
                                    {/* Other Reasons Details */}
                                    {stryMutAct_9fa48("8357") ? emailStats.otherReasons && emailStats.otherReasons.length > 0 || <div className="other-reasons-section">
                                            <h5>Custom Opt-out Reasons:</h5>
                                            <div className="other-reasons-list">
                                                {emailStats.otherReasons.map((reason, index) => <div key={index} className="other-reason-item">
                                                        <span className="other-reason-text">
                                                            {reason.email_opt_out_reason.replace(/^(Unsubscribed|Deferred application) - /, '')}
                                                        </span>
                                                        <span className="other-reason-count">({reason.count})</span>
                                                    </div>)}
                                            </div>
                                        </div> : stryMutAct_9fa48("8356") ? false : stryMutAct_9fa48("8355") ? true : (stryCov_9fa48("8355", "8356", "8357"), (stryMutAct_9fa48("8359") ? emailStats.otherReasons || emailStats.otherReasons.length > 0 : stryMutAct_9fa48("8358") ? true : (stryCov_9fa48("8358", "8359"), emailStats.otherReasons && (stryMutAct_9fa48("8362") ? emailStats.otherReasons.length <= 0 : stryMutAct_9fa48("8361") ? emailStats.otherReasons.length >= 0 : stryMutAct_9fa48("8360") ? true : (stryCov_9fa48("8360", "8361", "8362"), emailStats.otherReasons.length > 0)))) && <div className="other-reasons-section">
                                            <h5>Custom Opt-out Reasons:</h5>
                                            <div className="other-reasons-list">
                                                {emailStats.otherReasons.map(stryMutAct_9fa48("8363") ? () => undefined : (stryCov_9fa48("8363"), (reason, index) => <div key={index} className="other-reason-item">
                                                        <span className="other-reason-text">
                                                            {reason.email_opt_out_reason.replace(stryMutAct_9fa48("8364") ? /(Unsubscribed|Deferred application) - / : (stryCov_9fa48("8364"), /^(Unsubscribed|Deferred application) - /), stryMutAct_9fa48("8365") ? "Stryker was here!" : (stryCov_9fa48("8365"), ''))}
                                                        </span>
                                                        <span className="other-reason-count">({reason.count})</span>
                                                    </div>))}
                                            </div>
                                        </div>)}
                                </div>

                                {/* Email Type Breakdown */}
                                {stryMutAct_9fa48("8368") ? emailStats.typeBreakdown && emailStats.typeBreakdown.length > 0 || <div className="email-type-breakdown">
                                        <h4>Email Type Breakdown</h4>
                                        <div className="data-table-container">
                                            <table className="data-table email-type-table">
                                                <thead>
                                                    <tr>
                                                        <th className="email-type-col">Email Type</th>
                                                        <th className="sent-col">Sent</th>
                                                        <th className="queued-col">Queued</th>
                                                        <th className="avg-col">Avg Sends per Applicant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailStats.typeBreakdown.map(type => <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="queued-cell">{type.queued_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div> : stryMutAct_9fa48("8367") ? false : stryMutAct_9fa48("8366") ? true : (stryCov_9fa48("8366", "8367", "8368"), (stryMutAct_9fa48("8370") ? emailStats.typeBreakdown || emailStats.typeBreakdown.length > 0 : stryMutAct_9fa48("8369") ? true : (stryCov_9fa48("8369", "8370"), emailStats.typeBreakdown && (stryMutAct_9fa48("8373") ? emailStats.typeBreakdown.length <= 0 : stryMutAct_9fa48("8372") ? emailStats.typeBreakdown.length >= 0 : stryMutAct_9fa48("8371") ? true : (stryCov_9fa48("8371", "8372", "8373"), emailStats.typeBreakdown.length > 0)))) && <div className="email-type-breakdown">
                                        <h4>Email Type Breakdown</h4>
                                        <div className="data-table-container">
                                            <table className="data-table email-type-table">
                                                <thead>
                                                    <tr>
                                                        <th className="email-type-col">Email Type</th>
                                                        <th className="sent-col">Sent</th>
                                                        <th className="queued-col">Queued</th>
                                                        <th className="avg-col">Avg Sends per Applicant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailStats.typeBreakdown.map(stryMutAct_9fa48("8374") ? () => undefined : (stryCov_9fa48("8374"), type => <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, stryMutAct_9fa48("8375") ? "" : (stryCov_9fa48("8375"), ' ')).replace(stryMutAct_9fa48("8376") ? /\b\W/g : (stryCov_9fa48("8376"), /\b\w/g), stryMutAct_9fa48("8377") ? () => undefined : (stryCov_9fa48("8377"), l => stryMutAct_9fa48("8378") ? l.toLowerCase() : (stryCov_9fa48("8378"), l.toUpperCase())))}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="queued-cell">{type.queued_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>)}
                            </div>)}

                        {/* Queued Emails */}
                        <div className="queued-emails-section">
                            <h3>Queued Emails ({queuedEmails.length})</h3>
                            {(stryMutAct_9fa48("8382") ? queuedEmails.length <= 0 : stryMutAct_9fa48("8381") ? queuedEmails.length >= 0 : stryMutAct_9fa48("8380") ? false : stryMutAct_9fa48("8379") ? true : (stryCov_9fa48("8379", "8380", "8381", "8382"), queuedEmails.length > 0)) ? <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Email</th>
                                                <th>Email Type</th>
                                                <th>Queued At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queuedEmails.map(stryMutAct_9fa48("8383") ? () => undefined : (stryCov_9fa48("8383"), email => <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, stryMutAct_9fa48("8384") ? "" : (stryCov_9fa48("8384"), ' ')).replace(stryMutAct_9fa48("8385") ? /\b\W/g : (stryCov_9fa48("8385"), /\b\w/g), stryMutAct_9fa48("8386") ? () => undefined : (stryCov_9fa48("8386"), l => stryMutAct_9fa48("8387") ? l.toLowerCase() : (stryCov_9fa48("8387"), l.toUpperCase())))}
                                                    </td>
                                                    <td>{new Date(email.created_at).toLocaleString()}</td>
                                                </tr>))}
                                        </tbody>
                                    </table>
                                </div> : <div className="no-data-message">
                                    <p>No emails currently queued</p>
                                </div>}
                        </div>

                        {/* Email History */}
                        <div className="email-history-section">
                            <h3>Recent Email History ({emailHistory.length})</h3>
                            {(stryMutAct_9fa48("8391") ? emailHistory.length <= 0 : stryMutAct_9fa48("8390") ? emailHistory.length >= 0 : stryMutAct_9fa48("8389") ? false : stryMutAct_9fa48("8388") ? true : (stryCov_9fa48("8388", "8389", "8390", "8391"), emailHistory.length > 0)) ? <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Email</th>
                                                <th>Email Type</th>
                                                <th>Sent At</th>
                                                <th>Send Count</th>
                                                <th>Next Send</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {emailHistory.map(stryMutAct_9fa48("8392") ? () => undefined : (stryCov_9fa48("8392"), email => <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, stryMutAct_9fa48("8393") ? "" : (stryCov_9fa48("8393"), ' ')).replace(stryMutAct_9fa48("8394") ? /\b\W/g : (stryCov_9fa48("8394"), /\b\w/g), stryMutAct_9fa48("8395") ? () => undefined : (stryCov_9fa48("8395"), l => stryMutAct_9fa48("8396") ? l.toLowerCase() : (stryCov_9fa48("8396"), l.toUpperCase())))}
                                                    </td>
                                                    <td>{new Date(email.email_sent_at).toLocaleString()}</td>
                                                    <td>
                                                        <span className={stryMutAct_9fa48("8397") ? `` : (stryCov_9fa48("8397"), `send-count ${(stryMutAct_9fa48("8401") ? email.send_count < 3 : stryMutAct_9fa48("8400") ? email.send_count > 3 : stryMutAct_9fa48("8399") ? false : stryMutAct_9fa48("8398") ? true : (stryCov_9fa48("8398", "8399", "8400", "8401"), email.send_count >= 3)) ? stryMutAct_9fa48("8402") ? "" : (stryCov_9fa48("8402"), 'send-count--max') : stryMutAct_9fa48("8403") ? "Stryker was here!" : (stryCov_9fa48("8403"), '')}`)}>
                                                            {email.send_count}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {email.next_send_at ? <span className="next-send">
                                                                {new Date(email.next_send_at).toLocaleDateString()}
                                                            </span> : <span className="next-send--none">None</span>}
                                                    </td>
                                                </tr>))}
                                        </tbody>
                                    </table>
                                </div> : <div className="no-data-message">
                                    <p>No email history found</p>
                                </div>}
                        </div>
                    </div>)}
            </div>

            {/* Info Session Modal */}
            {stryMutAct_9fa48("8406") ? infoSessionModalOpen || <div className="modal-overlay">
                    <div className="modal info-session-modal">
                        <div className="modal-header">
                            <h2>{editingInfoSession ? 'Edit Info Session' : 'Create New Info Session'}</h2>
                            <button className="close-btn" onClick={closeInfoSessionModal}>×</button>
                        </div>
                        <form onSubmit={handleInfoSessionSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" name="title" value={infoSessionForm.title} onChange={handleInfoSessionFormChange} placeholder="Info Session Title" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" name="description" value={infoSessionForm.description} onChange={handleInfoSessionFormChange} placeholder="Session description" rows={3} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_time">Start Time</label>
                                    <input type="datetime-local" id="start_time" name="start_time" value={infoSessionForm.start_time} onChange={handleInfoSessionFormChange} required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_time">End Time</label>
                                    <input type="datetime-local" id="end_time" name="end_time" value={infoSessionForm.end_time} onChange={handleInfoSessionFormChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">Capacity</label>
                                <input type="number" id="capacity" name="capacity" value={infoSessionForm.capacity} onChange={handleInfoSessionFormChange} min="1" required />
                            </div>

                            <div className="form-group checkbox-group">
                                <input type="checkbox" id="is_online" name="is_online" checked={infoSessionForm.is_online} onChange={handleInfoSessionFormChange} />
                                <label htmlFor="is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input type="text" id="location" name="location" value={infoSessionForm.location} onChange={handleInfoSessionFormChange} placeholder={infoSessionForm.is_online ? "Online" : "Physical location"} required />
                            </div>

                            {infoSessionForm.is_online && <div className="form-group">
                                    <label htmlFor="meeting_link">Meeting Link</label>
                                    <input type="url" id="meeting_link" name="meeting_link" value={infoSessionForm.meeting_link} onChange={handleInfoSessionFormChange} placeholder="https://zoom.us/j/..." />
                                </div>}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeInfoSessionModal} disabled={infoSessionSubmitting}>
                                    Cancel
                                </button>
                                {editingInfoSession && <button type="button" className="delete-btn" onClick={() => handleDeleteInfoSession(editingInfoSession)} disabled={infoSessionSubmitting} style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}>
                                        Delete
                                    </button>}
                                <button type="submit" className="submit-btn" disabled={infoSessionSubmitting}>
                                    {infoSessionSubmitting ? editingInfoSession ? 'Updating...' : 'Creating...' : editingInfoSession ? 'Update Session' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div> : stryMutAct_9fa48("8405") ? false : stryMutAct_9fa48("8404") ? true : (stryCov_9fa48("8404", "8405", "8406"), infoSessionModalOpen && <div className="modal-overlay">
                    <div className="modal info-session-modal">
                        <div className="modal-header">
                            <h2>{editingInfoSession ? stryMutAct_9fa48("8407") ? "" : (stryCov_9fa48("8407"), 'Edit Info Session') : stryMutAct_9fa48("8408") ? "" : (stryCov_9fa48("8408"), 'Create New Info Session')}</h2>
                            <button className="close-btn" onClick={closeInfoSessionModal}>×</button>
                        </div>
                        <form onSubmit={handleInfoSessionSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" name="title" value={infoSessionForm.title} onChange={handleInfoSessionFormChange} placeholder="Info Session Title" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" name="description" value={infoSessionForm.description} onChange={handleInfoSessionFormChange} placeholder="Session description" rows={3} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_time">Start Time</label>
                                    <input type="datetime-local" id="start_time" name="start_time" value={infoSessionForm.start_time} onChange={handleInfoSessionFormChange} required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_time">End Time</label>
                                    <input type="datetime-local" id="end_time" name="end_time" value={infoSessionForm.end_time} onChange={handleInfoSessionFormChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">Capacity</label>
                                <input type="number" id="capacity" name="capacity" value={infoSessionForm.capacity} onChange={handleInfoSessionFormChange} min="1" required />
                            </div>

                            <div className="form-group checkbox-group">
                                <input type="checkbox" id="is_online" name="is_online" checked={infoSessionForm.is_online} onChange={handleInfoSessionFormChange} />
                                <label htmlFor="is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input type="text" id="location" name="location" value={infoSessionForm.location} onChange={handleInfoSessionFormChange} placeholder={infoSessionForm.is_online ? stryMutAct_9fa48("8409") ? "" : (stryCov_9fa48("8409"), "Online") : stryMutAct_9fa48("8410") ? "" : (stryCov_9fa48("8410"), "Physical location")} required />
                            </div>

                            {stryMutAct_9fa48("8413") ? infoSessionForm.is_online || <div className="form-group">
                                    <label htmlFor="meeting_link">Meeting Link</label>
                                    <input type="url" id="meeting_link" name="meeting_link" value={infoSessionForm.meeting_link} onChange={handleInfoSessionFormChange} placeholder="https://zoom.us/j/..." />
                                </div> : stryMutAct_9fa48("8412") ? false : stryMutAct_9fa48("8411") ? true : (stryCov_9fa48("8411", "8412", "8413"), infoSessionForm.is_online && <div className="form-group">
                                    <label htmlFor="meeting_link">Meeting Link</label>
                                    <input type="url" id="meeting_link" name="meeting_link" value={infoSessionForm.meeting_link} onChange={handleInfoSessionFormChange} placeholder="https://zoom.us/j/..." />
                                </div>)}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeInfoSessionModal} disabled={infoSessionSubmitting}>
                                    Cancel
                                </button>
                                {stryMutAct_9fa48("8416") ? editingInfoSession || <button type="button" className="delete-btn" onClick={() => handleDeleteInfoSession(editingInfoSession)} disabled={infoSessionSubmitting} style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}>
                                        Delete
                                    </button> : stryMutAct_9fa48("8415") ? false : stryMutAct_9fa48("8414") ? true : (stryCov_9fa48("8414", "8415", "8416"), editingInfoSession && <button type="button" className="delete-btn" onClick={stryMutAct_9fa48("8417") ? () => undefined : (stryCov_9fa48("8417"), () => handleDeleteInfoSession(editingInfoSession))} disabled={infoSessionSubmitting} style={stryMutAct_9fa48("8418") ? {} : (stryCov_9fa48("8418"), {
                backgroundColor: stryMutAct_9fa48("8419") ? "" : (stryCov_9fa48("8419"), '#dc3545'),
                color: stryMutAct_9fa48("8420") ? "" : (stryCov_9fa48("8420"), 'white'),
                border: stryMutAct_9fa48("8421") ? "" : (stryCov_9fa48("8421"), 'none'),
                padding: stryMutAct_9fa48("8422") ? "" : (stryCov_9fa48("8422"), '10px 20px'),
                borderRadius: stryMutAct_9fa48("8423") ? "" : (stryCov_9fa48("8423"), '5px'),
                cursor: stryMutAct_9fa48("8424") ? "" : (stryCov_9fa48("8424"), 'pointer'),
                marginLeft: stryMutAct_9fa48("8425") ? "" : (stryCov_9fa48("8425"), '10px')
              })}>
                                        Delete
                                    </button>)}
                                <button type="submit" className="submit-btn" disabled={infoSessionSubmitting}>
                                    {infoSessionSubmitting ? editingInfoSession ? stryMutAct_9fa48("8426") ? "" : (stryCov_9fa48("8426"), 'Updating...') : stryMutAct_9fa48("8427") ? "" : (stryCov_9fa48("8427"), 'Creating...') : editingInfoSession ? stryMutAct_9fa48("8428") ? "" : (stryCov_9fa48("8428"), 'Update Session') : stryMutAct_9fa48("8429") ? "" : (stryCov_9fa48("8429"), 'Create Session')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>)}

            {/* Workshop Modal */}
            {stryMutAct_9fa48("8432") ? workshopModalOpen || <div className="modal-overlay">
                    <div className="modal workshop-modal">
                        <div className="modal-header">
                            <h2>{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                            <button className="close-btn" onClick={closeWorkshopModal}>×</button>
                        </div>
                        <form onSubmit={handleWorkshopSubmit}>
                            <div className="form-group">
                                <label htmlFor="workshop-title">Title</label>
                                <input type="text" id="workshop-title" name="title" value={workshopForm.title} onChange={handleWorkshopFormChange} placeholder="Workshop Title" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-description">Description</label>
                                <textarea id="workshop-description" name="description" value={workshopForm.description} onChange={handleWorkshopFormChange} placeholder="Workshop description" rows={3} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workshop-start_time">Start Time</label>
                                    <input type="datetime-local" id="workshop-start_time" name="start_time" value={workshopForm.start_time} onChange={handleWorkshopFormChange} required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="workshop-end_time">End Time</label>
                                    <input type="datetime-local" id="workshop-end_time" name="end_time" value={workshopForm.end_time} onChange={handleWorkshopFormChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-capacity">Capacity</label>
                                <input type="number" id="workshop-capacity" name="capacity" value={workshopForm.capacity} onChange={handleWorkshopFormChange} min="1" required />
                            </div>

                            <div className="form-group checkbox-group">
                                <input type="checkbox" id="workshop-is_online" name="is_online" checked={workshopForm.is_online} onChange={handleWorkshopFormChange} />
                                <label htmlFor="workshop-is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-location">Location</label>
                                <input type="text" id="workshop-location" name="location" value={workshopForm.location} onChange={handleWorkshopFormChange} placeholder={workshopForm.is_online ? "Online" : "Physical location"} required />
                            </div>

                            {workshopForm.is_online && <div className="form-group">
                                    <label htmlFor="workshop-meeting_link">Meeting Link</label>
                                    <input type="url" id="workshop-meeting_link" name="meeting_link" value={workshopForm.meeting_link} onChange={handleWorkshopFormChange} placeholder="https://zoom.us/j/..." />
                                </div>}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeWorkshopModal} disabled={workshopSubmitting}>
                                    Cancel
                                </button>
                                {editingWorkshop && <button type="button" className="delete-btn" onClick={() => handleDeleteWorkshop(editingWorkshop)} disabled={workshopSubmitting} style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}>
                                        Delete
                                    </button>}
                                <button type="submit" className="submit-btn" disabled={workshopSubmitting}>
                                    {workshopSubmitting ? editingWorkshop ? 'Updating...' : 'Creating...' : editingWorkshop ? 'Update Workshop' : 'Create Workshop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div> : stryMutAct_9fa48("8431") ? false : stryMutAct_9fa48("8430") ? true : (stryCov_9fa48("8430", "8431", "8432"), workshopModalOpen && <div className="modal-overlay">
                    <div className="modal workshop-modal">
                        <div className="modal-header">
                            <h2>{editingWorkshop ? stryMutAct_9fa48("8433") ? "" : (stryCov_9fa48("8433"), 'Edit Workshop') : stryMutAct_9fa48("8434") ? "" : (stryCov_9fa48("8434"), 'Create New Workshop')}</h2>
                            <button className="close-btn" onClick={closeWorkshopModal}>×</button>
                        </div>
                        <form onSubmit={handleWorkshopSubmit}>
                            <div className="form-group">
                                <label htmlFor="workshop-title">Title</label>
                                <input type="text" id="workshop-title" name="title" value={workshopForm.title} onChange={handleWorkshopFormChange} placeholder="Workshop Title" required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-description">Description</label>
                                <textarea id="workshop-description" name="description" value={workshopForm.description} onChange={handleWorkshopFormChange} placeholder="Workshop description" rows={3} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workshop-start_time">Start Time</label>
                                    <input type="datetime-local" id="workshop-start_time" name="start_time" value={workshopForm.start_time} onChange={handleWorkshopFormChange} required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="workshop-end_time">End Time</label>
                                    <input type="datetime-local" id="workshop-end_time" name="end_time" value={workshopForm.end_time} onChange={handleWorkshopFormChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-capacity">Capacity</label>
                                <input type="number" id="workshop-capacity" name="capacity" value={workshopForm.capacity} onChange={handleWorkshopFormChange} min="1" required />
                            </div>

                            <div className="form-group checkbox-group">
                                <input type="checkbox" id="workshop-is_online" name="is_online" checked={workshopForm.is_online} onChange={handleWorkshopFormChange} />
                                <label htmlFor="workshop-is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-location">Location</label>
                                <input type="text" id="workshop-location" name="location" value={workshopForm.location} onChange={handleWorkshopFormChange} placeholder={workshopForm.is_online ? stryMutAct_9fa48("8435") ? "" : (stryCov_9fa48("8435"), "Online") : stryMutAct_9fa48("8436") ? "" : (stryCov_9fa48("8436"), "Physical location")} required />
                            </div>

                            {stryMutAct_9fa48("8439") ? workshopForm.is_online || <div className="form-group">
                                    <label htmlFor="workshop-meeting_link">Meeting Link</label>
                                    <input type="url" id="workshop-meeting_link" name="meeting_link" value={workshopForm.meeting_link} onChange={handleWorkshopFormChange} placeholder="https://zoom.us/j/..." />
                                </div> : stryMutAct_9fa48("8438") ? false : stryMutAct_9fa48("8437") ? true : (stryCov_9fa48("8437", "8438", "8439"), workshopForm.is_online && <div className="form-group">
                                    <label htmlFor="workshop-meeting_link">Meeting Link</label>
                                    <input type="url" id="workshop-meeting_link" name="meeting_link" value={workshopForm.meeting_link} onChange={handleWorkshopFormChange} placeholder="https://zoom.us/j/..." />
                                </div>)}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeWorkshopModal} disabled={workshopSubmitting}>
                                    Cancel
                                </button>
                                {stryMutAct_9fa48("8442") ? editingWorkshop || <button type="button" className="delete-btn" onClick={() => handleDeleteWorkshop(editingWorkshop)} disabled={workshopSubmitting} style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}>
                                        Delete
                                    </button> : stryMutAct_9fa48("8441") ? false : stryMutAct_9fa48("8440") ? true : (stryCov_9fa48("8440", "8441", "8442"), editingWorkshop && <button type="button" className="delete-btn" onClick={stryMutAct_9fa48("8443") ? () => undefined : (stryCov_9fa48("8443"), () => handleDeleteWorkshop(editingWorkshop))} disabled={workshopSubmitting} style={stryMutAct_9fa48("8444") ? {} : (stryCov_9fa48("8444"), {
                backgroundColor: stryMutAct_9fa48("8445") ? "" : (stryCov_9fa48("8445"), '#dc3545'),
                color: stryMutAct_9fa48("8446") ? "" : (stryCov_9fa48("8446"), 'white'),
                border: stryMutAct_9fa48("8447") ? "" : (stryCov_9fa48("8447"), 'none'),
                padding: stryMutAct_9fa48("8448") ? "" : (stryCov_9fa48("8448"), '10px 20px'),
                borderRadius: stryMutAct_9fa48("8449") ? "" : (stryCov_9fa48("8449"), '5px'),
                cursor: stryMutAct_9fa48("8450") ? "" : (stryCov_9fa48("8450"), 'pointer'),
                marginLeft: stryMutAct_9fa48("8451") ? "" : (stryCov_9fa48("8451"), '10px')
              })}>
                                        Delete
                                    </button>)}
                                <button type="submit" className="submit-btn" disabled={workshopSubmitting}>
                                    {workshopSubmitting ? editingWorkshop ? stryMutAct_9fa48("8452") ? "" : (stryCov_9fa48("8452"), 'Updating...') : stryMutAct_9fa48("8453") ? "" : (stryCov_9fa48("8453"), 'Creating...') : editingWorkshop ? stryMutAct_9fa48("8454") ? "" : (stryCov_9fa48("8454"), 'Update Workshop') : stryMutAct_9fa48("8455") ? "" : (stryCov_9fa48("8455"), 'Create Workshop')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>)}

            {/* Bulk Actions Modal */}
            {stryMutAct_9fa48("8458") ? bulkActionsModalOpen || <BulkActionsModal selectedCount={selectedApplicants.length} onClose={() => setBulkActionsModalOpen(false)} onAction={handleBulkAction} isLoading={bulkActionInProgress} /> : stryMutAct_9fa48("8457") ? false : stryMutAct_9fa48("8456") ? true : (stryCov_9fa48("8456", "8457", "8458"), bulkActionsModalOpen && <BulkActionsModal selectedCount={selectedApplicants.length} onClose={stryMutAct_9fa48("8459") ? () => undefined : (stryCov_9fa48("8459"), () => setBulkActionsModalOpen(stryMutAct_9fa48("8460") ? true : (stryCov_9fa48("8460"), false)))} onAction={handleBulkAction} isLoading={bulkActionInProgress} />)}

            {/* Add Registration Modal */}
            {stryMutAct_9fa48("8463") ? addRegistrationModalOpen || <div className="modal-overlay">
                    <div className="modal add-registration-modal">
                        <div className="modal-header">
                            <h2>Add Registration to {selectedEventType === 'info-session' ? 'Info Session' : 'Workshop'}</h2>
                            <button className="close-btn" onClick={closeAddRegistrationModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="search-section">
                                <div className="form-group">
                                    <label htmlFor="applicant-search">Search Applicants</label>
                                    <input type="text" id="applicant-search" value={applicantSearch} onChange={e => {
                  setApplicantSearch(e.target.value);
                }} placeholder="Search by name, email, or applicant ID..." className="search-input" />
                                </div>
                                
                                {searchLoading && <div className="search-loading">
                                        <div className="spinner"></div>
                                        <span>Searching...</span>
                                    </div>}
                                
                                {/* SIMPLE - show names with dark theme styling */}
                                <div style={{
                border: '1px solid var(--color-border)',
                padding: '20px',
                margin: '10px',
                backgroundColor: 'var(--color-background-dark)',
                borderRadius: '8px'
              }}>
                                    <h3 style={{
                  color: 'var(--color-text-primary)',
                  marginTop: '0'
                }}>
                                        APPLICANTS FOUND: {searchResults.length}
                                    </h3>
                                    {searchResults.map((applicant, index) => <div key={index} style={{
                  border: '1px solid var(--color-border)',
                  padding: '15px',
                  margin: '8px 0',
                  backgroundColor: 'var(--color-background-light)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '6px',
                  cursor: applicant.already_registered_for_this_event ? 'not-allowed' : 'pointer',
                  opacity: applicant.already_registered_for_this_event ? '0.6' : '1'
                }}>
                                            <div>
                                                <strong style={{
                      color: 'var(--color-text-primary)'
                    }}>
                                                    {applicant.display_name || applicant.first_name + ' ' + applicant.last_name}
                                                </strong><br />
                                                <span style={{
                      color: 'var(--color-text-muted)'
                    }}>{applicant.email}</span><br />
                                                <small style={{
                      color: 'var(--color-text-muted)'
                    }}>
                                                    Status: {applicant.application_status}
                                                </small>
                                                {applicant.already_registered_for_this_event && <span style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}>
                                                        Already Registered
                                                    </span>}
                                            </div>
                                            {!applicant.already_registered_for_this_event && <input type="checkbox" checked={selectedApplicantsForRegistration.some(selected => selected.applicant_id === applicant.applicant_id)} onChange={() => toggleApplicantSelection(applicant)} style={{
                    transform: 'scale(1.5)',
                    accentColor: 'var(--color-primary)'
                  }} />}
                                        </div>)}
                                    {searchResults.length === 0 && <p style={{
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  margin: '20px 0'
                }}>
                                            No results yet - type to search
                                        </p>}
                                </div>
                                
                                {selectedApplicantsForRegistration.length > 0 && <div className="selected-applicants">
                                        <h4>Selected for Registration ({selectedApplicantsForRegistration.length})</h4>
                                        <div className="selected-list">
                                            {selectedApplicantsForRegistration.map(applicant => <div key={applicant.applicant_id} className="selected-applicant">
                                                    <span>{applicant.display_name}</span>
                                                    <button onClick={() => toggleApplicantSelection(applicant)} className="remove-selected-btn">
                                                        ×
                                                    </button>
                                                </div>)}
                                        </div>
                                    </div>}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={closeAddRegistrationModal} disabled={registrationLoading}>
                                Cancel
                            </button>
                            <button type="button" className="submit-btn" onClick={registerSelectedApplicants} disabled={registrationLoading || selectedApplicantsForRegistration.length === 0}>
                                {registrationLoading ? 'Registering...' : `Register ${selectedApplicantsForRegistration.length} Applicant${selectedApplicantsForRegistration.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div> : stryMutAct_9fa48("8462") ? false : stryMutAct_9fa48("8461") ? true : (stryCov_9fa48("8461", "8462", "8463"), addRegistrationModalOpen && <div className="modal-overlay">
                    <div className="modal add-registration-modal">
                        <div className="modal-header">
                            <h2>Add Registration to {(stryMutAct_9fa48("8466") ? selectedEventType !== 'info-session' : stryMutAct_9fa48("8465") ? false : stryMutAct_9fa48("8464") ? true : (stryCov_9fa48("8464", "8465", "8466"), selectedEventType === (stryMutAct_9fa48("8467") ? "" : (stryCov_9fa48("8467"), 'info-session')))) ? stryMutAct_9fa48("8468") ? "" : (stryCov_9fa48("8468"), 'Info Session') : stryMutAct_9fa48("8469") ? "" : (stryCov_9fa48("8469"), 'Workshop')}</h2>
                            <button className="close-btn" onClick={closeAddRegistrationModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="search-section">
                                <div className="form-group">
                                    <label htmlFor="applicant-search">Search Applicants</label>
                                    <input type="text" id="applicant-search" value={applicantSearch} onChange={e => {
                  if (stryMutAct_9fa48("8470")) {
                    {}
                  } else {
                    stryCov_9fa48("8470");
                    setApplicantSearch(e.target.value);
                  }
                }} placeholder="Search by name, email, or applicant ID..." className="search-input" />
                                </div>
                                
                                {stryMutAct_9fa48("8473") ? searchLoading || <div className="search-loading">
                                        <div className="spinner"></div>
                                        <span>Searching...</span>
                                    </div> : stryMutAct_9fa48("8472") ? false : stryMutAct_9fa48("8471") ? true : (stryCov_9fa48("8471", "8472", "8473"), searchLoading && <div className="search-loading">
                                        <div className="spinner"></div>
                                        <span>Searching...</span>
                                    </div>)}
                                
                                {/* SIMPLE - show names with dark theme styling */}
                                <div style={stryMutAct_9fa48("8474") ? {} : (stryCov_9fa48("8474"), {
                border: stryMutAct_9fa48("8475") ? "" : (stryCov_9fa48("8475"), '1px solid var(--color-border)'),
                padding: stryMutAct_9fa48("8476") ? "" : (stryCov_9fa48("8476"), '20px'),
                margin: stryMutAct_9fa48("8477") ? "" : (stryCov_9fa48("8477"), '10px'),
                backgroundColor: stryMutAct_9fa48("8478") ? "" : (stryCov_9fa48("8478"), 'var(--color-background-dark)'),
                borderRadius: stryMutAct_9fa48("8479") ? "" : (stryCov_9fa48("8479"), '8px')
              })}>
                                    <h3 style={stryMutAct_9fa48("8480") ? {} : (stryCov_9fa48("8480"), {
                  color: stryMutAct_9fa48("8481") ? "" : (stryCov_9fa48("8481"), 'var(--color-text-primary)'),
                  marginTop: stryMutAct_9fa48("8482") ? "" : (stryCov_9fa48("8482"), '0')
                })}>
                                        APPLICANTS FOUND: {searchResults.length}
                                    </h3>
                                    {searchResults.map(stryMutAct_9fa48("8483") ? () => undefined : (stryCov_9fa48("8483"), (applicant, index) => <div key={index} style={stryMutAct_9fa48("8484") ? {} : (stryCov_9fa48("8484"), {
                  border: stryMutAct_9fa48("8485") ? "" : (stryCov_9fa48("8485"), '1px solid var(--color-border)'),
                  padding: stryMutAct_9fa48("8486") ? "" : (stryCov_9fa48("8486"), '15px'),
                  margin: stryMutAct_9fa48("8487") ? "" : (stryCov_9fa48("8487"), '8px 0'),
                  backgroundColor: stryMutAct_9fa48("8488") ? "" : (stryCov_9fa48("8488"), 'var(--color-background-light)'),
                  color: stryMutAct_9fa48("8489") ? "" : (stryCov_9fa48("8489"), 'var(--color-text-primary)'),
                  display: stryMutAct_9fa48("8490") ? "" : (stryCov_9fa48("8490"), 'flex'),
                  justifyContent: stryMutAct_9fa48("8491") ? "" : (stryCov_9fa48("8491"), 'space-between'),
                  alignItems: stryMutAct_9fa48("8492") ? "" : (stryCov_9fa48("8492"), 'center'),
                  borderRadius: stryMutAct_9fa48("8493") ? "" : (stryCov_9fa48("8493"), '6px'),
                  cursor: applicant.already_registered_for_this_event ? stryMutAct_9fa48("8494") ? "" : (stryCov_9fa48("8494"), 'not-allowed') : stryMutAct_9fa48("8495") ? "" : (stryCov_9fa48("8495"), 'pointer'),
                  opacity: applicant.already_registered_for_this_event ? stryMutAct_9fa48("8496") ? "" : (stryCov_9fa48("8496"), '0.6') : stryMutAct_9fa48("8497") ? "" : (stryCov_9fa48("8497"), '1')
                })}>
                                            <div>
                                                <strong style={stryMutAct_9fa48("8498") ? {} : (stryCov_9fa48("8498"), {
                      color: stryMutAct_9fa48("8499") ? "" : (stryCov_9fa48("8499"), 'var(--color-text-primary)')
                    })}>
                                                    {stryMutAct_9fa48("8502") ? applicant.display_name && applicant.first_name + ' ' + applicant.last_name : stryMutAct_9fa48("8501") ? false : stryMutAct_9fa48("8500") ? true : (stryCov_9fa48("8500", "8501", "8502"), applicant.display_name || applicant.first_name + (stryMutAct_9fa48("8503") ? "" : (stryCov_9fa48("8503"), ' ')) + applicant.last_name)}
                                                </strong><br />
                                                <span style={stryMutAct_9fa48("8504") ? {} : (stryCov_9fa48("8504"), {
                      color: stryMutAct_9fa48("8505") ? "" : (stryCov_9fa48("8505"), 'var(--color-text-muted)')
                    })}>{applicant.email}</span><br />
                                                <small style={stryMutAct_9fa48("8506") ? {} : (stryCov_9fa48("8506"), {
                      color: stryMutAct_9fa48("8507") ? "" : (stryCov_9fa48("8507"), 'var(--color-text-muted)')
                    })}>
                                                    Status: {applicant.application_status}
                                                </small>
                                                {stryMutAct_9fa48("8510") ? applicant.already_registered_for_this_event || <span style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginLeft: '10px'
                    }}>
                                                        Already Registered
                                                    </span> : stryMutAct_9fa48("8509") ? false : stryMutAct_9fa48("8508") ? true : (stryCov_9fa48("8508", "8509", "8510"), applicant.already_registered_for_this_event && <span style={stryMutAct_9fa48("8511") ? {} : (stryCov_9fa48("8511"), {
                      backgroundColor: stryMutAct_9fa48("8512") ? "" : (stryCov_9fa48("8512"), '#6b7280'),
                      color: stryMutAct_9fa48("8513") ? "" : (stryCov_9fa48("8513"), 'white'),
                      padding: stryMutAct_9fa48("8514") ? "" : (stryCov_9fa48("8514"), '4px 8px'),
                      borderRadius: stryMutAct_9fa48("8515") ? "" : (stryCov_9fa48("8515"), '4px'),
                      fontSize: stryMutAct_9fa48("8516") ? "" : (stryCov_9fa48("8516"), '12px'),
                      marginLeft: stryMutAct_9fa48("8517") ? "" : (stryCov_9fa48("8517"), '10px')
                    })}>
                                                        Already Registered
                                                    </span>)}
                                            </div>
                                            {stryMutAct_9fa48("8520") ? !applicant.already_registered_for_this_event || <input type="checkbox" checked={selectedApplicantsForRegistration.some(selected => selected.applicant_id === applicant.applicant_id)} onChange={() => toggleApplicantSelection(applicant)} style={{
                    transform: 'scale(1.5)',
                    accentColor: 'var(--color-primary)'
                  }} /> : stryMutAct_9fa48("8519") ? false : stryMutAct_9fa48("8518") ? true : (stryCov_9fa48("8518", "8519", "8520"), (stryMutAct_9fa48("8521") ? applicant.already_registered_for_this_event : (stryCov_9fa48("8521"), !applicant.already_registered_for_this_event)) && <input type="checkbox" checked={stryMutAct_9fa48("8522") ? selectedApplicantsForRegistration.every(selected => selected.applicant_id === applicant.applicant_id) : (stryCov_9fa48("8522"), selectedApplicantsForRegistration.some(stryMutAct_9fa48("8523") ? () => undefined : (stryCov_9fa48("8523"), selected => stryMutAct_9fa48("8526") ? selected.applicant_id !== applicant.applicant_id : stryMutAct_9fa48("8525") ? false : stryMutAct_9fa48("8524") ? true : (stryCov_9fa48("8524", "8525", "8526"), selected.applicant_id === applicant.applicant_id))))} onChange={stryMutAct_9fa48("8527") ? () => undefined : (stryCov_9fa48("8527"), () => toggleApplicantSelection(applicant))} style={stryMutAct_9fa48("8528") ? {} : (stryCov_9fa48("8528"), {
                    transform: stryMutAct_9fa48("8529") ? "" : (stryCov_9fa48("8529"), 'scale(1.5)'),
                    accentColor: stryMutAct_9fa48("8530") ? "" : (stryCov_9fa48("8530"), 'var(--color-primary)')
                  })} />)}
                                        </div>))}
                                    {stryMutAct_9fa48("8533") ? searchResults.length === 0 || <p style={{
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  margin: '20px 0'
                }}>
                                            No results yet - type to search
                                        </p> : stryMutAct_9fa48("8532") ? false : stryMutAct_9fa48("8531") ? true : (stryCov_9fa48("8531", "8532", "8533"), (stryMutAct_9fa48("8535") ? searchResults.length !== 0 : stryMutAct_9fa48("8534") ? true : (stryCov_9fa48("8534", "8535"), searchResults.length === 0)) && <p style={stryMutAct_9fa48("8536") ? {} : (stryCov_9fa48("8536"), {
                  color: stryMutAct_9fa48("8537") ? "" : (stryCov_9fa48("8537"), 'var(--color-text-muted)'),
                  textAlign: stryMutAct_9fa48("8538") ? "" : (stryCov_9fa48("8538"), 'center'),
                  fontStyle: stryMutAct_9fa48("8539") ? "" : (stryCov_9fa48("8539"), 'italic'),
                  margin: stryMutAct_9fa48("8540") ? "" : (stryCov_9fa48("8540"), '20px 0')
                })}>
                                            No results yet - type to search
                                        </p>)}
                                </div>
                                
                                {stryMutAct_9fa48("8543") ? selectedApplicantsForRegistration.length > 0 || <div className="selected-applicants">
                                        <h4>Selected for Registration ({selectedApplicantsForRegistration.length})</h4>
                                        <div className="selected-list">
                                            {selectedApplicantsForRegistration.map(applicant => <div key={applicant.applicant_id} className="selected-applicant">
                                                    <span>{applicant.display_name}</span>
                                                    <button onClick={() => toggleApplicantSelection(applicant)} className="remove-selected-btn">
                                                        ×
                                                    </button>
                                                </div>)}
                                        </div>
                                    </div> : stryMutAct_9fa48("8542") ? false : stryMutAct_9fa48("8541") ? true : (stryCov_9fa48("8541", "8542", "8543"), (stryMutAct_9fa48("8546") ? selectedApplicantsForRegistration.length <= 0 : stryMutAct_9fa48("8545") ? selectedApplicantsForRegistration.length >= 0 : stryMutAct_9fa48("8544") ? true : (stryCov_9fa48("8544", "8545", "8546"), selectedApplicantsForRegistration.length > 0)) && <div className="selected-applicants">
                                        <h4>Selected for Registration ({selectedApplicantsForRegistration.length})</h4>
                                        <div className="selected-list">
                                            {selectedApplicantsForRegistration.map(stryMutAct_9fa48("8547") ? () => undefined : (stryCov_9fa48("8547"), applicant => <div key={applicant.applicant_id} className="selected-applicant">
                                                    <span>{applicant.display_name}</span>
                                                    <button onClick={stryMutAct_9fa48("8548") ? () => undefined : (stryCov_9fa48("8548"), () => toggleApplicantSelection(applicant))} className="remove-selected-btn">
                                                        ×
                                                    </button>
                                                </div>))}
                                        </div>
                                    </div>)}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={closeAddRegistrationModal} disabled={registrationLoading}>
                                Cancel
                            </button>
                            <button type="button" className="submit-btn" onClick={registerSelectedApplicants} disabled={stryMutAct_9fa48("8551") ? registrationLoading && selectedApplicantsForRegistration.length === 0 : stryMutAct_9fa48("8550") ? false : stryMutAct_9fa48("8549") ? true : (stryCov_9fa48("8549", "8550", "8551"), registrationLoading || (stryMutAct_9fa48("8553") ? selectedApplicantsForRegistration.length !== 0 : stryMutAct_9fa48("8552") ? false : (stryCov_9fa48("8552", "8553"), selectedApplicantsForRegistration.length === 0)))}>
                                {registrationLoading ? stryMutAct_9fa48("8554") ? "" : (stryCov_9fa48("8554"), 'Registering...') : stryMutAct_9fa48("8555") ? `` : (stryCov_9fa48("8555"), `Register ${selectedApplicantsForRegistration.length} Applicant${(stryMutAct_9fa48("8558") ? selectedApplicantsForRegistration.length === 1 : stryMutAct_9fa48("8557") ? false : stryMutAct_9fa48("8556") ? true : (stryCov_9fa48("8556", "8557", "8558"), selectedApplicantsForRegistration.length !== 1)) ? stryMutAct_9fa48("8559") ? "" : (stryCov_9fa48("8559"), 's') : stryMutAct_9fa48("8560") ? "Stryker was here!" : (stryCov_9fa48("8560"), '')}`)}
                            </button>
                        </div>
                    </div>
                </div>)}

            {/* Notes Modal */}
            <NotesModal isOpen={stryMutAct_9fa48("8563") ? notesModalOpen || selectedApplicant : stryMutAct_9fa48("8562") ? false : stryMutAct_9fa48("8561") ? true : (stryCov_9fa48("8561", "8562", "8563"), notesModalOpen && selectedApplicant)} applicantId={stryMutAct_9fa48("8564") ? selectedApplicant.applicant_id : (stryCov_9fa48("8564"), selectedApplicant?.applicant_id)} applicantName={stryMutAct_9fa48("8567") ? selectedApplicant?.name && `${selectedApplicant?.first_name} ${selectedApplicant?.last_name}` : stryMutAct_9fa48("8566") ? false : stryMutAct_9fa48("8565") ? true : (stryCov_9fa48("8565", "8566", "8567"), (stryMutAct_9fa48("8568") ? selectedApplicant.name : (stryCov_9fa48("8568"), selectedApplicant?.name)) || (stryMutAct_9fa48("8569") ? `` : (stryCov_9fa48("8569"), `${stryMutAct_9fa48("8570") ? selectedApplicant.first_name : (stryCov_9fa48("8570"), selectedApplicant?.first_name)} ${stryMutAct_9fa48("8571") ? selectedApplicant.last_name : (stryCov_9fa48("8571"), selectedApplicant?.last_name)}`)))} onClose={closeNotesModal} />
        </div>;
  }
};
export default AdmissionsDashboard;