import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import BulkActionsModal from '../../components/BulkActionsModal';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./components/OverviewTab/OverviewTab'));
const ApplicationsTab = lazy(() => import('./components/ApplicationsTab/ApplicationsTab'));
const InfoSessionsTab = lazy(() => import('./components/InfoSessionsTab/InfoSessionsTab'));
const WorkshopsTab = lazy(() => import('./components/WorkshopsTab/WorkshopsTab'));
const EmailsTab = lazy(() => import('./components/EmailsTab/EmailsTab'));

const AdmissionsDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for tab parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'applications', 'info-sessions', 'workshops', 'emails'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Data state
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [infoSessions, setInfoSessions] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [computedOverviewStats, setComputedOverviewStats] = useState(null);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [previousOverviewStats, setPreviousOverviewStats] = useState(null);
  const [demographicFilters, setDemographicFilters] = useState({ race: 'all', gender: 'all', education: 'all', borough: 'all' });
  const [demographicFilter, setDemographicFilter] = useState('race');
  const [demographicBreakdown, setDemographicBreakdown] = useState({ race: [], gender: [], education: [], borough: [] });
  const [cohorts, setCohorts] = useState([]);
  
  // Demographics modal for KPI tiles
  const [demographicsModalOpen, setDemographicsModalOpen] = useState(false);
  const [demographicsModalTitle, setDemographicsModalTitle] = useState('');
  const [demographicsModalView, setDemographicsModalView] = useState('race');
  const [demographicsModalData, setDemographicsModalData] = useState({ race: [], gender: [], education: [] });
  
  // Overview stage demographics
  const [activeOverviewStage, setActiveOverviewStage] = useState('applied');
  const [stageDemographics, setStageDemographics] = useState({ race: [], gender: [], education: [], age: [], referral: [] });
  const [averageIncome, setAverageIncome] = useState(null);
  
  // Application status filter for demographics
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('all');
  const [appliedStatusBreakdown, setAppliedStatusBreakdown] = useState(null);
  const [submittedAssessmentBreakdown, setSubmittedAssessmentBreakdown] = useState(null);
  const [genderHover, setGenderHover] = useState(null);
  const [overviewDetailsOpen, setOverviewDetailsOpen] = useState(false);
  
  // Modal for showing filtered applicants by demographic
  const [demographicApplicantsModalOpen, setDemographicApplicantsModalOpen] = useState(false);
  const [demographicApplicantsFilter, setDemographicApplicantsFilter] = useState(null);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [filteredApplicantsLoading, setFilteredApplicantsLoading] = useState(false);
  const [stageDetailedApplicantsCache, setStageDetailedApplicantsCache] = useState({ key: '', rows: [] });
  
  // Modal for showing filtered applications from KPI tiles
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [applicationsModalFilter, setApplicationsModalFilter] = useState(null);
  const [modalApplications, setModalApplications] = useState([]);
  const [modalApplicationsLoading, setModalApplicationsLoading] = useState(false);
  
  // CSV export tracking
  const [exportSelections, setExportSelections] = useState(new Set());

  // Application filters and sorting
  const [applicationFilters, setApplicationFilters] = useState({
    status: '',
    info_session_status: '',
    workshop_status: '',
    program_admission_status: '',
    ready_for_workshop_invitation: false,
    name_search: '',
    cohort_id: '',
    deliberation: '',
    limit: 10000,
    offset: 0
  });
  const [hasMore, setHasMore] = useState(true);
  const [nameSearchInput, setNameSearchInput] = useState('');
  const [columnSort, setColumnSort] = useState({
    column: 'created_at',
    direction: 'desc'
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    phone: true,
    status: true,
    assessment: true,
    info_session: true,
    workshop: true,
    structured_task_grade: true,
    admission: true,
    notes: true,
    deliberation: true,
    age: false,
    gender: false,
    race: false,
    education: false,
    referral: false
  });

  // Overview quick views state
  const [overviewQuickView, setOverviewQuickView] = useState('');
  const [overviewDeliberationFilter, setOverviewDeliberationFilter] = useState('');

  // Event registrations management
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Notes modal management
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Info session form state
  const [infoSessionModalOpen, setInfoSessionModalOpen] = useState(false);
  const [editingInfoSession, setEditingInfoSession] = useState(null);
  const [infoSessionForm, setInfoSessionForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: 50,
    is_online: false,
    meeting_link: ''
  });
  const [infoSessionSubmitting, setInfoSessionSubmitting] = useState(false);

  // Workshop form state
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
    capacity: 50,
    is_online: false,
    meeting_link: '',
    cohort_name: 'December 2025 - Workshop',
    workshop_type: 'admissions',
    access_window_days: 0,
    allow_early_access: false
  });
  const [workshopSubmitting, setWorkshopSubmitting] = useState(false);
  
  // Available cohorts for workshops
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);

  // Bulk actions state
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  
  // Filter dropdown state
  const [openFilterColumn, setOpenFilterColumn] = useState(null);

  // Manual registration state
  const [addRegistrationModalOpen, setAddRegistrationModalOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedApplicantsForRegistration, setSelectedApplicantsForRegistration] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [laptopNeeds, setLaptopNeeds] = useState({});

  // Event filtering state
  const [showInactiveInfoSessions, setShowInactiveInfoSessions] = useState(false);
  const [showInactiveWorkshops, setShowInactiveWorkshops] = useState(false);

  // Email automation state
  const [emailStats, setEmailStats] = useState(null);
  const [queuedEmails, setQueuedEmails] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);
  const [applicantEmailStatus, setApplicantEmailStatus] = useState([]);
  const [emailAutomationLoading, setEmailAutomationLoading] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  // Check if user has admin access
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'staff';

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isTableHeader = event.target.closest('th');
      const isColumnToggle = event.target.closest('[data-column-toggle]');
      
      if (openFilterColumn && !isTableHeader && !isColumnToggle) {
        setOpenFilterColumn(null);
      }
    };

    if (openFilterColumn) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openFilterColumn]);

  // Helper: robustly map overview quick view to a cohort_id or 'deferred'
  const getOverviewCohortParam = () => {
    if (!overviewQuickView || overviewQuickView === 'all_time') return '';
    if (overviewQuickView === 'deferred') return 'deferred';

    const norm = (s) => (s || '').toLowerCase();
    const candidates = cohorts || [];

    if (overviewQuickView === 'dec2025') {
      const match = candidates.find(c => {
        const n = norm(c.name);
        return (n.includes('dec') || n.includes('december')) && n.includes('2025');
      });
      return match?.cohort_id || '';
    }

    if (overviewQuickView === 'sep2025') {
      const match = candidates.find(c => {
        const n = norm(c.name);
        return (n.includes('sep') || n.includes('september')) && n.includes('2025');
      });
      return match?.cohort_id || '';
    }

    return '';
  };

  // Fetch cohorts
  const fetchCohorts = async () => {
    if (!hasAdminAccess || !token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/cohorts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCohorts(data);
        
        if (data.length > 0 && !applicationFilters.cohort_id) {
          setApplicationFilters(prev => ({
            ...prev,
            cohort_id: data[0].cohort_id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  // Fetch workshop-specific cohorts
  const fetchWorkshopCohorts = async () => {
    if (!hasAdminAccess || !token) {
      setLoadingCohorts(false);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/workshop-cohorts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const cohortNames = data.map(cohort => cohort.name);
        setAvailableCohorts(cohortNames);
      } else {
        setAvailableCohorts(['Admissions Workshop Experience']);
      }
    } catch (error) {
      console.error('Error fetching workshop cohorts:', error);
      setAvailableCohorts(['Admissions Workshop Experience']);
    } finally {
      setLoadingCohorts(false);
    }
  };

  // Fetch all admissions data
  const fetchAdmissionsData = async () => {
    if (!hasAdminAccess || !token) {
      setError('You do not have permission to view this page.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const statsUrl = new URL(`${import.meta.env.VITE_API_URL}/api/admissions/stats`);

      const [statsResponse, applicationsResponse, infoSessionsResponse, workshopsResponse] = await Promise.all([
        fetch(statsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${new URLSearchParams(applicationFilters)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!statsResponse.ok || !applicationsResponse.ok || !infoSessionsResponse.ok || !workshopsResponse.ok) {
        throw new Error('Failed to fetch admissions data');
      }

      const [statsData, applicationsData, infoSessionsData, workshopsData] = await Promise.all([
        statsResponse.json(),
        applicationsResponse.json(),
        infoSessionsResponse.json(),
        workshopsResponse.json()
      ]);

      setStats(statsData);
      setApplications(applicationsData);
      setInfoSessions(infoSessionsData);
      setWorkshops(workshopsData.workshops || workshopsData);

      // Fetch email stats
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          setEmailStats(emailData);
        }
      } catch (emailError) {
        console.error('Error fetching email stats:', emailError);
      }

    } catch (error) {
      console.error('Error fetching admissions data:', error);
      setError('Failed to load admissions data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    if (!hasAdminAccess || !token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(applicationFilters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.append(key, value);
        }
      });
      
      if (nameSearchInput.trim()) {
        params.set('name_search', nameSearchInput.trim());
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        setHasMore(data.applications?.length < data.total);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch info sessions
  const fetchInfoSessions = async () => {
    if (!hasAdminAccess || !token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInfoSessions(data);
      }
    } catch (error) {
      console.error('Error fetching info sessions:', error);
    }
  };

  // Fetch workshops
  const fetchWorkshops = async () => {
    if (!hasAdminAccess || !token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkshops(data.workshops || data);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  // Email automation data fetchers
  const fetchEmailStats = async () => {
    if (!hasAdminAccess || !token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailStats(data);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const fetchQueuedEmails = async () => {
    if (!hasAdminAccess || !token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQueuedEmails(data);
      }
    } catch (error) {
      console.error('Error fetching queued emails:', error);
    }
  };

  const fetchEmailHistory = async () => {
    if (!hasAdminAccess || !token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  };

  const fetchApplicantEmailStatus = async () => {
    if (!hasAdminAccess || !token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/applicant-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplicantEmailStatus(data);
      }
    } catch (error) {
      console.error('Error fetching applicant email status:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    if (hasAdminAccess && token) {
      fetchCohorts();
      fetchWorkshopCohorts();
      fetchAdmissionsData();
    }
  }, [token, hasAdminAccess]);

  // Fetch applications when filters change
  useEffect(() => {
    if (hasAdminAccess && token && activeTab === 'applications') {
      fetchApplications();
    }
  }, [applicationFilters, nameSearchInput, token, hasAdminAccess, activeTab]);

  // Load email data when tab changes
  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmailStats();
      fetchQueuedEmails();
      fetchEmailHistory();
      fetchApplicantEmailStatus();
    }
  }, [activeTab, token, hasAdminAccess]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle bulk action
  const handleBulkAction = async (action, customSubject = '', customBody = '') => {
    if (selectedApplicants.length === 0) return;

    setBulkActionInProgress(true);
    try {
      const requestBody = {
        action,
        applicant_ids: selectedApplicants
      };

      if (action === 'send_custom_email') {
        requestBody.custom_subject = customSubject;
        requestBody.custom_body = customBody;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/bulk-actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await fetchApplications();
        setSelectedApplicants([]);
        setBulkActionsModalOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Bulk action failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Handle notes modal
  const openNotesModal = (applicant) => {
    setSelectedApplicant(applicant);
    setNotesModalOpen(true);
  };

  const closeNotesModal = () => {
    setNotesModalOpen(false);
    setSelectedApplicant(null);
  };

  // Handle column sorting
  const handleColumnSort = (column) => {
    setColumnSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle deliberation change
  const handleDeliberationChange = async (applicantId, newValue) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicantId}/deliberation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliberation: newValue })
      });

      if (!response.ok) {
        throw new Error('Failed to update deliberation');
      }

      setApplications(prev => ({
        ...prev,
        applications: prev.applications.map(app =>
          app.applicant_id === applicantId
            ? { ...app, deliberation: newValue }
            : app
        )
      }));

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Deliberation status has been updated',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error updating deliberation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update deliberation status'
      });
    }
  };

  // Get filtered info sessions
  const getFilteredInfoSessions = () => {
    if (showInactiveInfoSessions) {
      return infoSessions;
    }
    return infoSessions.filter(session => session.is_active);
  };

  // Get filtered workshops
  const getFilteredWorkshops = () => {
    if (showInactiveWorkshops) {
      return workshops;
    }
    return workshops.filter(workshop => workshop.is_active);
  };

  // Access denied view
  if (!hasAdminAccess) {
    return (
      <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center p-6 font-proxima">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2 font-proxima-bold">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view the admissions dashboard.</p>
        </div>
      </div>
    );
  }

  // Decide which stats to show in Overview
  const overviewStats = (overviewQuickView === 'all_time' || !computedOverviewStats) ? stats : computedOverviewStats;

  return (
    <div className="w-full h-full bg-[#f5f5f5] text-[#1a1a1a] overflow-hidden flex flex-col font-proxima">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-[#1a1a1a] font-proxima-bold">
          Admissions Dashboard
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="font-proxima"
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg font-proxima flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="px-6 pt-4 pb-0 shrink-0">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
            >
              Applicants
            </TabsTrigger>
            <TabsTrigger 
              value="info-sessions" 
              className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
            >
              Info Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="workshops" 
              className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
            >
              Workshops
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
            >
              Emails
            </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-auto px-6 py-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 font-proxima">Loading Overview...</div>
              </div>
            }>
              <OverviewTab
                loading={loading}
                error={error}
                stats={overviewStats}
                cohorts={cohorts}
                overviewQuickView={overviewQuickView}
                setOverviewQuickView={setOverviewQuickView}
                compareEnabled={compareEnabled}
                setCompareEnabled={setCompareEnabled}
                previousOverviewStats={previousOverviewStats}
                appliedStatusBreakdown={appliedStatusBreakdown}
                activeOverviewStage={activeOverviewStage}
                setActiveOverviewStage={setActiveOverviewStage}
                stageDemographics={stageDemographics}
                setStageDemographics={setStageDemographics}
                applicantStatusFilter={applicantStatusFilter}
                setApplicantStatusFilter={setApplicantStatusFilter}
                overviewDeliberationFilter={overviewDeliberationFilter}
                setOverviewDeliberationFilter={setOverviewDeliberationFilter}
                demographicBreakdown={demographicBreakdown}
                setDemographicBreakdown={setDemographicBreakdown}
                token={token}
                getOverviewCohortParam={getOverviewCohortParam}
                setComputedOverviewStats={setComputedOverviewStats}
                setAppliedStatusBreakdown={setAppliedStatusBreakdown}
                setPreviousOverviewStats={setPreviousOverviewStats}
                fetchAdmissionsData={fetchAdmissionsData}
              />
            </Suspense>
          </TabsContent>

          {/* Applications Tab - Full width, no padding */}
          <TabsContent value="applications" className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 font-proxima">Loading Applicants...</div>
              </div>
            }>
              <ApplicationsTab
                loading={loading}
                applications={applications}
                cohorts={cohorts}
                applicationFilters={applicationFilters}
                setApplicationFilters={setApplicationFilters}
                nameSearchInput={nameSearchInput}
                setNameSearchInput={setNameSearchInput}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                columnSort={columnSort}
                handleColumnSort={handleColumnSort}
                selectedApplicants={selectedApplicants}
                setSelectedApplicants={setSelectedApplicants}
                openFilterColumn={openFilterColumn}
                setOpenFilterColumn={setOpenFilterColumn}
                openNotesModal={openNotesModal}
                handleDeliberationChange={handleDeliberationChange}
                setBulkActionsModalOpen={setBulkActionsModalOpen}
                fetchApplications={fetchApplications}
                token={token}
              />
            </Suspense>
          </TabsContent>

          {/* Info Sessions Tab */}
          <TabsContent value="info-sessions" className="flex-1 overflow-auto px-6 py-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 font-proxima">Loading Info Sessions...</div>
              </div>
            }>
              <InfoSessionsTab
                loading={loading}
                infoSessions={getFilteredInfoSessions()}
                showInactiveInfoSessions={showInactiveInfoSessions}
                setShowInactiveInfoSessions={setShowInactiveInfoSessions}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                eventRegistrations={eventRegistrations}
                setEventRegistrations={setEventRegistrations}
                attendanceLoading={attendanceLoading}
                setAttendanceLoading={setAttendanceLoading}
                infoSessionModalOpen={infoSessionModalOpen}
                setInfoSessionModalOpen={setInfoSessionModalOpen}
                editingInfoSession={editingInfoSession}
                setEditingInfoSession={setEditingInfoSession}
                infoSessionForm={infoSessionForm}
                setInfoSessionForm={setInfoSessionForm}
                infoSessionSubmitting={infoSessionSubmitting}
                setInfoSessionSubmitting={setInfoSessionSubmitting}
                addRegistrationModalOpen={addRegistrationModalOpen}
                setAddRegistrationModalOpen={setAddRegistrationModalOpen}
                selectedEventForRegistration={selectedEventForRegistration}
                setSelectedEventForRegistration={setSelectedEventForRegistration}
                selectedEventType={selectedEventType}
                setSelectedEventType={setSelectedEventType}
                applicantSearch={applicantSearch}
                setApplicantSearch={setApplicantSearch}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                selectedApplicantsForRegistration={selectedApplicantsForRegistration}
                setSelectedApplicantsForRegistration={setSelectedApplicantsForRegistration}
                searchLoading={searchLoading}
                setSearchLoading={setSearchLoading}
                registrationLoading={registrationLoading}
                setRegistrationLoading={setRegistrationLoading}
                laptopNeeds={laptopNeeds}
                setLaptopNeeds={setLaptopNeeds}
                fetchInfoSessions={fetchInfoSessions}
                token={token}
              />
            </Suspense>
          </TabsContent>

          {/* Workshops Tab */}
          <TabsContent value="workshops" className="flex-1 overflow-auto px-6 py-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 font-proxima">Loading Workshops...</div>
              </div>
            }>
              <WorkshopsTab
                loading={loading}
                workshops={getFilteredWorkshops()}
                showInactiveWorkshops={showInactiveWorkshops}
                setShowInactiveWorkshops={setShowInactiveWorkshops}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                eventRegistrations={eventRegistrations}
                setEventRegistrations={setEventRegistrations}
                attendanceLoading={attendanceLoading}
                setAttendanceLoading={setAttendanceLoading}
                workshopModalOpen={workshopModalOpen}
                setWorkshopModalOpen={setWorkshopModalOpen}
                editingWorkshop={editingWorkshop}
                setEditingWorkshop={setEditingWorkshop}
                workshopForm={workshopForm}
                setWorkshopForm={setWorkshopForm}
                workshopSubmitting={workshopSubmitting}
                setWorkshopSubmitting={setWorkshopSubmitting}
                availableCohorts={availableCohorts}
                loadingCohorts={loadingCohorts}
                addRegistrationModalOpen={addRegistrationModalOpen}
                setAddRegistrationModalOpen={setAddRegistrationModalOpen}
                selectedEventForRegistration={selectedEventForRegistration}
                setSelectedEventForRegistration={setSelectedEventForRegistration}
                selectedEventType={selectedEventType}
                setSelectedEventType={setSelectedEventType}
                applicantSearch={applicantSearch}
                setApplicantSearch={setApplicantSearch}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                selectedApplicantsForRegistration={selectedApplicantsForRegistration}
                setSelectedApplicantsForRegistration={setSelectedApplicantsForRegistration}
                searchLoading={searchLoading}
                setSearchLoading={setSearchLoading}
                registrationLoading={registrationLoading}
                setRegistrationLoading={setRegistrationLoading}
                laptopNeeds={laptopNeeds}
                setLaptopNeeds={setLaptopNeeds}
                fetchWorkshops={fetchWorkshops}
                token={token}
              />
            </Suspense>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="flex-1 overflow-auto px-6 py-4">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 font-proxima">Loading Emails...</div>
              </div>
            }>
              <EmailsTab
                emailStats={emailStats}
                queuedEmails={queuedEmails}
                emailHistory={emailHistory}
                applicantEmailStatus={applicantEmailStatus}
                emailAutomationLoading={emailAutomationLoading}
                setEmailAutomationLoading={setEmailAutomationLoading}
                testEmailAddress={testEmailAddress}
                setTestEmailAddress={setTestEmailAddress}
                testEmailLoading={testEmailLoading}
                setTestEmailLoading={setTestEmailLoading}
                fetchEmailStats={fetchEmailStats}
                fetchQueuedEmails={fetchQueuedEmails}
                fetchEmailHistory={fetchEmailHistory}
                fetchApplicantEmailStatus={fetchApplicantEmailStatus}
                token={token}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NotesModal
        isOpen={notesModalOpen && selectedApplicant}
        applicantId={selectedApplicant?.applicant_id}
        applicantName={selectedApplicant?.name || `${selectedApplicant?.first_name} ${selectedApplicant?.last_name}`}
        onClose={closeNotesModal}
      />

      <BulkActionsModal
        isOpen={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        selectedCount={selectedApplicants.length}
        onAction={handleBulkAction}
        isLoading={bulkActionInProgress}
      />
    </div>
  );
};

export default AdmissionsDashboard;
