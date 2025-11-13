import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import BulkActionsModal from '../../components/BulkActionsModal';
import Swal from 'sweetalert2';
import './AdmissionsDashboard.css';

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
    // Overview computed stats when filtering by cycle
    const [computedOverviewStats, setComputedOverviewStats] = useState(null);
    const [compareEnabled, setCompareEnabled] = useState(false);
    const [previousOverviewStats, setPreviousOverviewStats] = useState(null);
    const [demographicFilters, setDemographicFilters] = useState({ race: 'all', gender: 'all', education: 'all', borough: 'all' });
    const [demographicFilter, setDemographicFilter] = useState('race'); // For "View by" dropdown
    const [demographicBreakdown, setDemographicBreakdown] = useState({ race: [], gender: [], education: [], borough: [] });
    const [cohorts, setCohorts] = useState([]);
    // Demographics modal for KPI tiles
    const [demographicsModalOpen, setDemographicsModalOpen] = useState(false);
    const [demographicsModalTitle, setDemographicsModalTitle] = useState('');
    const [demographicsModalView, setDemographicsModalView] = useState('race'); // race | gender | education
    const [demographicsModalData, setDemographicsModalData] = useState({ race: [], gender: [], education: [] });
    // Overview stage demographics (replaces funnel)
    const [activeOverviewStage, setActiveOverviewStage] = useState('applied'); // applied | info | workshops | offers | marketing
    const [stageDemographics, setStageDemographics] = useState({ race: [], gender: [], education: [], age: [] });
    const [averageIncome, setAverageIncome] = useState(null); // Average income for the current stage
    // Application status filter for demographics
    const [applicantStatusFilter, setApplicantStatusFilter] = useState('all'); // all | accounts_created | in_progress | submitted | ineligible
    const [appliedStatusBreakdown, setAppliedStatusBreakdown] = useState(null); // { accounts_created, in_progress, submitted, ineligible }
    const [submittedAssessmentBreakdown, setSubmittedAssessmentBreakdown] = useState(null); // { assessed, pending, strong_recommend, recommend, review_needed, not_recommend }
    const [genderHover, setGenderHover] = useState(null); // { label, percentage, count }
    const [overviewDetailsOpen, setOverviewDetailsOpen] = useState(false);
    // Modal for showing filtered applicants by demographic
    const [demographicApplicantsModalOpen, setDemographicApplicantsModalOpen] = useState(false);
    const [demographicApplicantsFilter, setDemographicApplicantsFilter] = useState(null); // { type: 'race'|'gender'|'education'|'age', value: string, stage: string }
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [filteredApplicantsLoading, setFilteredApplicantsLoading] = useState(false);
    const [stageDetailedApplicantsCache, setStageDetailedApplicantsCache] = useState({ key: '', rows: [] });
    
    const buildStageCacheKey = (stage, quickView, status) => {
        return `${stage || 'applied'}|${quickView || 'all'}|${status || 'all'}`;
    };
    
    const fetchStageDetailedApplicants = async () => {
        const cacheKey = buildStageCacheKey(
            activeOverviewStage,
            overviewQuickView,
            activeOverviewStage === 'applied' ? applicantStatusFilter : ''
        );

        if (stageDetailedApplicantsCache.key === cacheKey && stageDetailedApplicantsCache.rows.length) {
            return stageDetailedApplicantsCache.rows;
        }

        return [];
    };
    
    // Modal for showing filtered applications from KPI tiles
    const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
    const [applicationsModalFilter, setApplicationsModalFilter] = useState(null); // { type: 'total'|'accounts_created'|'submitted'|'info'|'workshops'|'offers'|'marketing', status?: string }
    const [modalApplications, setModalApplications] = useState([]);
    const [modalApplicationsLoading, setModalApplicationsLoading] = useState(false);
    
    // CSV export tracking
    const [exportSelections, setExportSelections] = useState(new Set()); // Track which tiles are selected for export

    // Infinite scroll and filters
    const [applicationFilters, setApplicationFilters] = useState({
        status: '',
        info_session_status: '',
        workshop_status: '',
        program_admission_status: '',
        ready_for_workshop_invitation: false,
        name_search: '',
        cohort_id: '',
        deliberation: '',
        limit: 10000, // High limit to get all records
        offset: 0
    });
    const [hasMore, setHasMore] = useState(true);
    const [nameSearchInput, setNameSearchInput] = useState('');
    const [columnSort, setColumnSort] = useState({
        column: 'created_at',
        direction: 'desc' // 'asc' or 'desc'
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
    const [overviewQuickView, setOverviewQuickView] = useState(''); // '', 'dec2025', 'sep2025', 'deferred'
    const [overviewDeliberationFilter, setOverviewDeliberationFilter] = useState(''); // '', 'yes', 'maybe', 'no'

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
        // NEW: Workshop system fields
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

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside any filter dropdown or column toggle button
            const isTableHeader = event.target.closest('th');
            const isColumnToggle = event.target.closest('.admissions-dashboard__column-toggle-btn') || 
                                    event.target.closest('[data-column-toggle]');
            
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

    // Manual registration state
    const [addRegistrationModalOpen, setAddRegistrationModalOpen] = useState(false);
    const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [applicantSearch, setApplicantSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedApplicantsForRegistration, setSelectedApplicantsForRegistration] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [laptopNeeds, setLaptopNeeds] = useState({}); // Track laptop needs per applicant

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
    // Fetch all admissions data
    const fetchCohorts = async () => {
        if (!hasAdminAccess || !token) {
            console.log('⚠️ Cannot fetch cohorts - no admin access or token');
            return;
        }
        
        console.log('🔄 Fetching cohorts from:', `${import.meta.env.VITE_API_URL}/api/admissions/cohorts`);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/cohorts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('📡 Cohorts response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Cohorts fetched:', data);
                console.log('📊 Cohorts array length:', data.length);
                setCohorts(data);
                
                // Set the most recent cohort as default
                if (data.length > 0 && !applicationFilters.cohort_id) {
                    setApplicationFilters(prev => ({
                        ...prev,
                        cohort_id: data[0].cohort_id
                    }));
                }
            } else {
                console.error('❌ Failed to fetch cohorts:', response.status);
            }
        } catch (error) {
            console.error('❌ Error fetching cohorts:', error);
        }
    };

    // Helper: robustly map overview quick view to a cohort_id or 'deferred'
    const getOverviewCohortParam = () => {
        if (!overviewQuickView || overviewQuickView === 'all_time') return '';
        if (overviewQuickView === 'deferred') return 'deferred';

        const norm = (s) => (s || '').toLowerCase();
        const candidates = cohorts || [];

        if (overviewQuickView === 'dec2025') {
            const match = candidates.find(c => {
                const n = norm(c.name);
                return n.includes('dec') && n.includes('2025');
            }) || candidates.find(c => norm(c.name).includes('december 2025'));
            return match?.cohort_id || '';
        }

        if (overviewQuickView === 'sep2025') {
            const match = candidates.find(c => {
                const n = norm(c.name);
                return (n.includes('sep') || n.includes('september')) && n.includes('2025');
            }) || candidates.find(c => norm(c.name).includes('september 2025'));
            return match?.cohort_id || '';
        }

        return '';
    };

    // Fetch workshop-specific cohorts (separate from program cohorts)
    const fetchWorkshopCohorts = async () => {
        if (!hasAdminAccess || !token) {
            console.log('⚠️ Cannot fetch workshop cohorts - no admin access or token');
            setLoadingCohorts(false);
            return;
        }
        
        console.log('🔄 Fetching workshop cohorts from:', `${import.meta.env.VITE_API_URL}/api/workshop/workshop-cohorts`);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/workshop-cohorts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('📡 Workshop cohorts response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Workshop cohorts fetched:', data);
                
                // Extract just the names for the dropdown
                const cohortNames = data.map(cohort => cohort.name);
                setAvailableCohorts(cohortNames);
                
                console.log('📊 Available workshop cohorts:', cohortNames);
            } else {
                console.error('❌ Failed to fetch workshop cohorts:', response.status);
                // Fallback to a default
                setAvailableCohorts(['Admissions Workshop Experience']);
            }
        } catch (error) {
            console.error('❌ Error fetching workshop cohorts:', error);
            // Fallback to a default
            setAvailableCohorts(['Admissions Workshop Experience']);
        } finally {
            setLoadingCohorts(false);
        }
    };

    const fetchAdmissionsData = async () => {
        if (!hasAdminAccess || !token) {
            setError('You do not have permission to view this page.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);

            // Prepare stats URL - only add cohort filter if NOT "all_time"
            // For "all_time", we want unfiltered stats. For other filters, we'll compute from filtered apps anyway
            const statsUrl = new URL(`${import.meta.env.VITE_API_URL}/api/admissions/stats`);
            // Always fetch base stats without cohort filter - computed stats will override for specific cohorts
            console.log('📊 Fetching base stats from:', statsUrl.toString());

            // Fetch all data in parallel
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

            // Check for errors
            if (!statsResponse.ok || !applicationsResponse.ok || !infoSessionsResponse.ok || !workshopsResponse.ok) {
                throw new Error('Failed to fetch admissions data');
            }

            // Parse responses
            const [statsData, applicationsData, infoSessionsData, workshopsData] = await Promise.all([
                statsResponse.json(),
                applicationsResponse.json(),
                infoSessionsResponse.json(),
                workshopsResponse.json()
            ]);

            // Update state
            setStats(statsData);
            setApplications(applicationsData);
            setInfoSessions(infoSessionsData);
            setWorkshops(workshopsData.workshops || workshopsData);

            // Fetch email stats for Marketing Insights tile
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
                // Don't fail the entire fetch if email stats fail
            }

        } catch (error) {
            console.error('Error fetching admissions data:', error);
            setError('Failed to load admissions data. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    // Compute Overview stats from filtered applications when overview filter is active
    const computeOverviewStatsForFilter = async () => {
        if (!hasAdminAccess || !token) return;
        const cohortParam = getOverviewCohortParam();
        if (!cohortParam) {
            setComputedOverviewStats(null);
            return;
        }
        try {
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            params.append('cohort_id', cohortParam);
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Failed to fetch applications for overview filter');
            const data = await resp.json();
            const apps = Array.isArray(data?.applications) ? data.applications : [];

            // Build computed stats
            const totalApplicants = data?.total || apps.length;
            const countBy = (arr, keyGetter) => arr.reduce((acc, item) => {
                const key = keyGetter(item) || 'unknown';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            const applicationStatusCounts = countBy(apps, a => a.status);
            const applicationStats = Object.keys(applicationStatusCounts).map(status => ({ status, count: applicationStatusCounts[status] }));

            const assessKey = a => (a.final_status || a.recommendation || 'pending');
            const assessmentCounts = countBy(apps, assessKey);
            const assessmentFunnel = ['strong_recommend', 'recommend', 'review_needed', 'not_recommend', 'pending']
                .filter(k => assessmentCounts[k])
                .map(k => ({ status: k, count: assessmentCounts[k] }));

            const finalCounts = countBy(apps, a => a.final_status || 'pending');
            const finalStatusCounts = Object.keys(finalCounts).map(status => ({ status, count: finalCounts[status] }));

            // Info sessions aggregates from applicant-level statuses
            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            const infoSessionRegistrations = apps.filter(a => (a.info_session_status && a.info_session_status !== 'not_registered')).length;
            const infoSessionAttended = apps.filter(a => attendedSet.has(a.info_session_status)).length;
            
            // Workshops: Fetch admissions workshops and calculate from their registrations
            let workshopRegistrations = 0;
            let workshopAttended = 0;
            try {
                const workshopsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (workshopsResp.ok) {
                    const workshopsData = await workshopsResp.json();
                    const workshops = Array.isArray(workshopsData) ? workshopsData : (workshopsData.workshops || []);
                    // Filter to admissions workshops only
                    const admissionsWorkshops = workshops.filter(w => w.workshop_type === 'admissions');
                    
                    // Get set of applicant IDs from filtered apps
                    const filteredApplicantIds = new Set(apps.map(a => a.applicant_id).filter(Boolean));
                    
                    // Fetch registrations for each admissions workshop
                    for (const workshop of admissionsWorkshops) {
                        try {
                            const regResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/registrations/workshop/${workshop.event_id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (regResp.ok) {
                                const registrations = await regResp.json();
                                registrations.forEach(reg => {
                                    if (reg.applicant_id && filteredApplicantIds.has(reg.applicant_id)) {
                                        workshopRegistrations++;
                                        if (attendedSet.has(reg.status)) {
                                            workshopAttended++;
                                        }
                                    }
                                });
                            }
                        } catch (regErr) {
                            console.error(`Error fetching registrations for workshop ${workshop.event_id}:`, regErr);
                        }
                    }
                }
            } catch (workshopErr) {
                console.error('Error fetching workshops for stats:', workshopErr);
                // Fallback to applicant-level status (may include external workshops)
                workshopRegistrations = apps.filter(a => (a.workshop_status && a.workshop_status !== 'pending')).length;
                workshopAttended = apps.filter(a => attendedSet.has(a.workshop_status)).length;
            }

            // Workshop pipeline from applicant workshop_status
            const workshopPipelineCounts = countBy(apps, a => a.workshop_status || 'pending');
            const workshopInvitations = Object.keys(workshopPipelineCounts).map(status => ({ status, count: workshopPipelineCounts[status] }));

            const computed = {
                totalApplicants,
                applicationStats,
                infoSessions: {
                    // When filtered by cycle, show registrations-focused totals derived from applicants
                    totalSessions: infoSessionRegistrations,
                    totalRegistrations: infoSessionRegistrations,
                    totalAttended: infoSessionAttended
                },
                workshops: {
                    totalWorkshops: workshopRegistrations,
                    totalRegistrations: workshopRegistrations,
                    totalAttended: workshopAttended
                },
                assessmentFunnel,
                finalStatusCounts,
                workshopInvitations
            };
            setComputedOverviewStats(computed);
            // Derive demographics via export endpoint
            try {
                const ids = apps.map(a => a.applicant_id).filter(Boolean);
                if (ids.length) {
                    const resp2 = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${ids.join(',')}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resp2.ok) {
                        const detailed = await resp2.json();
                        const aggregates = { race: {}, gender: {}, education: {}, borough: {} };
                        const add = (obj, key) => { if (!key) return; obj[key] = (obj[key] || 0) + 1; };
                        detailed.forEach(d => {
                            const dem = d.demographics || {};
                            const raceVal = dem.race_ethnicity;
                            if (Array.isArray(raceVal)) raceVal.forEach(r => add(aggregates.race, r)); else add(aggregates.race, raceVal);
                            add(aggregates.gender, dem.gender);
                            add(aggregates.education, dem.education_level);
                            const addr = (dem.address || '').toLowerCase();
                            const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
                            const matched = boroughs.find(b => addr.includes(b));
                            add(aggregates.borough, matched || (addr ? 'other' : 'unknown'));
                        });
                        const toArray = (o) => Object.keys(o).map(k => ({ label: k || 'unknown', count: o[k] })).sort((a,b)=>b.count-a.count);
                        setDemographicBreakdown({
                            race: toArray(aggregates.race),
                            gender: toArray(aggregates.gender),
                            education: toArray(aggregates.education),
                            borough: toArray(aggregates.borough)
                        });
                    } else {
                        setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
                    }
                } else {
                    setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
                }
            } catch (demErr) {
                console.error('Error computing demographics:', demErr);
                setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
            }
        } catch (e) {
            console.error('Error computing overview stats for filter:', e);
            setComputedOverviewStats(null);
        }
    };
    // Open demographics modal for a given Overview KPI subset
    const openDemographicsModal = async (subset) => {
        try {
            setDemographicsModalTitle(
                subset === 'applicants' ? 'Applicants Demographics' :
                subset === 'info' ? 'Info Session Attendees Demographics' :
                subset === 'workshops' ? 'Workshop Participants Demographics' :
                subset === 'assessment' ? 'Assessment Completed Demographics' :
                'Offers Extended Demographics'
            );

            const cohortParam = getOverviewCohortParam();
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            if (cohortParam) params.append('cohort_id', cohortParam);

            const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!appsResp.ok) throw new Error('Failed to load applications for demographics');
            const appsData = await appsResp.json();
            const apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            let subsetApps = apps;
            if (subset === 'info') {
                subsetApps = apps.filter(a => attendedSet.has(a.info_session_status));
            } else if (subset === 'workshops') {
                // For workshops, only include admissions workshop attendees
                try {
                    const workshopsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (workshopsResp.ok) {
                        const workshopsData = await workshopsResp.json();
                        const allWorkshops = Array.isArray(workshopsData) ? workshopsData : (workshopsData.workshops || []);
                        // Filter to admissions workshops only
                        const admissionsWorkshops = allWorkshops.filter(w => w.workshop_type === 'admissions');
                        
                        // Get set of applicant IDs who attended admissions workshops
                        const admissionsWorkshopAttendeeIds = new Set();
                        
                        // Fetch registrations for each admissions workshop
                        for (const workshop of admissionsWorkshops) {
                            try {
                                const regResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/registrations/workshop/${workshop.event_id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (regResp.ok) {
                                    const registrations = await regResp.json();
                                    registrations.forEach(reg => {
                                        if (reg.applicant_id && attendedSet.has(reg.status)) {
                                            admissionsWorkshopAttendeeIds.add(reg.applicant_id);
                                        }
                                    });
                                }
                            } catch (regErr) {
                                console.error(`Error fetching registrations for workshop ${workshop.event_id}:`, regErr);
                            }
                        }
                        
                        // Filter apps to only those who attended admissions workshops
                        subsetApps = apps.filter(a => a.applicant_id && admissionsWorkshopAttendeeIds.has(a.applicant_id));
                    } else {
                        // Fallback to applicant-level status (may include external workshops)
                        subsetApps = apps.filter(a => attendedSet.has(a.workshop_status));
                    }
                } catch (workshopErr) {
                    console.error('Error fetching workshops for demographics:', workshopErr);
                    // Fallback to applicant-level status (may include external workshops)
                    subsetApps = apps.filter(a => attendedSet.has(a.workshop_status));
                }
            }
            if (subset === 'assessment') subsetApps = apps.filter(a => {
                const r = a.recommendation;
                const fs = a.final_status;
                return ['strong_recommend','recommend','review_needed','not_recommend'].includes(r) || (fs && fs !== 'pending');
            });
            if (subset === 'offers') subsetApps = apps.filter(a => a.final_status === 'accepted');

            const ids = subsetApps.map(a => a.applicant_id).filter(Boolean);
            let race = [], gender = [], education = [], age = [];
            if (ids.length) {
                const expResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${ids.join(',')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (expResp.ok) {
                    const detailed = await expResp.json();
                    const agg = { race: {}, gender: {}, education: {}, age: {} };
                    const add = (obj, key) => { if (!key) return; obj[key] = (obj[key] || 0) + 1; };
                    detailed.forEach(d => {
                        const dem = d.demographics || {};
                        const raceVal = dem.race_ethnicity || dem['WHICH OF THE FOLLOWING BEST REPRESENTS YOUR RACIAL BACKGROUND'];
                        if (Array.isArray(raceVal)) raceVal.forEach(r => add(agg.race, r)); else add(agg.race, raceVal);
                        add(agg.gender, dem.gender || dem.GENDER);
                        add(agg.education, dem.education_level || dem['WHAT IS YOUR CURRENT HIGHEST EDUCATIONAL ATTAINED']);
                    });
                    const toArr = (o) => Object.keys(o).map(k => ({ label: k || 'Unknown', count: o[k] })).sort((a,b)=>b.count-a.count);
                    race = toArr(agg.race); gender = toArr(agg.gender); education = toArr(agg.education);
                }
            }
            setDemographicsModalData({ race, gender, education });
            setDemographicsModalView('race');
            setDemographicsModalOpen(true);
        } catch (err) {
            console.error('Error opening demographics modal:', err);
            setDemographicsModalData({ race: [], gender: [], education: [] });
            setDemographicsModalOpen(true);
        }
    };
    const closeDemographicsModal = () => setDemographicsModalOpen(false);
    // Load demographics for the selected stage into the Overview section
    const loadStageDemographics = async (subset) => {
        try {
            const cohortParam = getOverviewCohortParam();
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            if (cohortParam) params.append('cohort_id', cohortParam);
            if (overviewDeliberationFilter) params.append('deliberation', overviewDeliberationFilter);

            const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!appsResp.ok) throw new Error('Failed to load applications for stage demographics');
            const appsData = await appsResp.json();
            const apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

            // Calculate status breakdown for "applied" stage
            if (subset === 'applied') {
                // Use apps.length as the total (what we're actually counting from)
                // This ensures breakdown matches the actual data we have
                const total = apps.length;
                // Note: 'no_application' is stored in DB but displayed as 'Account Created' in Applicants tab
                // Count statuses exactly as the Applicants tab displays them
                const accountsCreated = apps.filter(a => a.status === 'no_application').length;
                const inProgress = apps.filter(a => a.status === 'in_progress').length;
                const submitted = apps.filter(a => a.status === 'submitted').length;
                const ineligible = apps.filter(a => a.status === 'ineligible').length;
                
                const statusCounts = {
                    total: total,
                    accounts_created: accountsCreated,
                    in_progress: inProgress,
                    submitted: submitted,
                    ineligible: ineligible
                };
                setAppliedStatusBreakdown(statusCounts);
            }
            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            let subsetApps = apps;
            if (subset === 'applied') {
                // For applied stage, filter by status if a specific status is selected
                if (applicantStatusFilter === 'all') {
                    subsetApps = apps;
                } else {
                    // Map 'accounts_created' to 'no_application' (DB stores it as 'no_application')
                    const statusToFilter = applicantStatusFilter === 'accounts_created' ? 'no_application' : applicantStatusFilter;
                    subsetApps = apps.filter(a => a.status === statusToFilter);
                }
                
                // Calculate assessment breakdown for submitted applicants
                if (applicantStatusFilter === 'submitted') {
                    const submittedApps = subsetApps;
                    const assessed = submittedApps.filter(a => {
                        const r = a.recommendation;
                        const fs = a.final_status;
                        return ['strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(r) || (fs && fs !== 'pending');
                    }).length;
                    const pending = submittedApps.length - assessed;
                    
                    const strongRecommend = submittedApps.filter(a => a.recommendation === 'strong_recommend').length;
                    const recommend = submittedApps.filter(a => a.recommendation === 'recommend').length;
                    const reviewNeeded = submittedApps.filter(a => a.recommendation === 'review_needed').length;
                    const notRecommend = submittedApps.filter(a => a.recommendation === 'not_recommend').length;
                    
                    setSubmittedAssessmentBreakdown({
                        assessed,
                        pending,
                        strong_recommend: strongRecommend,
                        recommend,
                        review_needed: reviewNeeded,
                        not_recommend: notRecommend,
                        total: submittedApps.length
                    });
                } else {
                    setSubmittedAssessmentBreakdown(null);
                }
            } else if (subset === 'info') {
                subsetApps = apps.filter(a => attendedSet.has(a.info_session_status));
            } else if (subset === 'workshops') {
                subsetApps = apps.filter(a => attendedSet.has(a.workshop_status));
            } else if (subset === 'assessment') {
                subsetApps = apps.filter(a => {
                    const r = a.recommendation;
                    const fs = a.final_status;
                    return ['strong_recommend','recommend','review_needed','not_recommend'].includes(r) || (fs && fs !== 'pending');
                });
            } else if (subset === 'offers') {
                subsetApps = apps.filter(a => a.final_status === 'accepted');
            }
            const cacheKey = buildStageCacheKey(subset, overviewQuickView, subset === 'applied' ? applicantStatusFilter : '');
            const ids = subsetApps.map(a => a.applicant_id).filter(Boolean);
            const totalApplicants = subsetApps.length;
            const applicantsWithoutId = totalApplicants - ids.length; // Count applicants without applicant_id
            let race = [], gender = [], education = [], age = [];
            if (ids.length) {
                const expResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${ids.join(',')}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (expResp.ok) {
                    const detailed = await expResp.json();
                    setStageDetailedApplicantsCache({ key: cacheKey, rows: detailed });
                    const agg = { race: {}, gender: {}, education: {}, age: {} };
                    let processedCount = 0;
                    
                    // Pre-add "Not Listed" entries for applicants without applicant_id
                    if (applicantsWithoutId > 0) {
                        agg.race['Not Listed'] = applicantsWithoutId;
                        agg.gender['Not Listed'] = applicantsWithoutId;
                        agg.education['Not Listed'] = applicantsWithoutId;
                        agg.age['Not Listed'] = applicantsWithoutId;
                    }
                    
                    // Normalize labels to prevent duplicate buckets (e.g., 'Not listed' vs 'Not Listed')
                    const normalize = (category, value) => {
                        const raw = (value ?? '').toString().trim();
                        if (!raw) return 'Not Listed';
                        const v = raw.toLowerCase();
                        const isNotListed = ['not listed','not_listed','prefer not to say','unknown','unspecified','n/a','na','none','null',''].includes(v);
                        if (isNotListed) return 'Not Listed';
                        if (category === 'gender') {
                            if (['female','woman','f','female-identifying','female identifying'].includes(v)) return 'Female';
                            if (['male','man','m','male-identifying','male identifying'].includes(v)) return 'Male';
                        }
                        // Title-case first letter for consistency
                        return raw.charAt(0).toUpperCase() + raw.slice(1);
                    };
                    
                    const add = (obj, key) => { 
                        const label = key || 'Not Listed';
                        obj[label] = (obj[label] || 0) + 1; 
                    };
                    
                    // Helper function to parse income value
                    const parseIncome = (incomeStr) => {
                        if (!incomeStr) return null;
                        // Remove dollar signs, commas, and whitespace, then parse
                        const cleaned = incomeStr.toString().replace(/[$,\s]/g, '');
                        const parsed = parseFloat(cleaned);
                        return isNaN(parsed) ? null : parsed;
                    };
                    
                    let totalIncome = 0;
                    let incomeCount = 0;
                    const processedApplicantIds = new Set(); // Track unique applicants for income calculation
                    
                    // Create a Set of eligible applicant IDs (exclude ineligible status)
                    const eligibleApplicantIds = new Set(
                        subsetApps
                            .filter(a => a.status !== 'ineligible')
                            .map(a => a.applicant_id)
                            .filter(Boolean)
                    );
                    
                    detailed.forEach(d => {
                        processedCount++;
                        const dem = d.demographics || {};
                        
                        // Calculate income for average - only count each applicant once and exclude ineligible
                        const applicantId = d.applicant_id;
                        if (applicantId && !processedApplicantIds.has(applicantId) && eligibleApplicantIds.has(applicantId)) {
                            processedApplicantIds.add(applicantId);
                            const incomeValue = dem.personal_income || dem['Personal Annual Income'];
                            const parsedIncome = parseIncome(incomeValue);
                            // Also filter out unrealistic income values (over $1M is likely data error)
                            if (parsedIncome !== null && parsedIncome > 0 && parsedIncome <= 1000000) {
                                totalIncome += parsedIncome;
                                incomeCount++;
                            } else if (parsedIncome > 1000000) {
                                console.warn(`[Income Debug] EXCLUDED Applicant ${applicantId}: income=${incomeValue} (over $1M, likely data error)`);
                            }
                        }
                        
                        // Race: combine multiple selections into a single category (e.g., "Middle Eastern, White")
                        const raceVal = dem.race_ethnicity || dem['WHICH OF THE FOLLOWING BEST REPRESENTS YOUR RACIAL BACKGROUND'];
                        let raceLabel = 'Not Listed';
                        if (Array.isArray(raceVal)) {
                            if (raceVal.length > 0) {
                                // Combine all races into a single label, sorted alphabetically for consistency
                                const normalizedRaces = raceVal.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                                if (normalizedRaces.length > 0) {
                                    raceLabel = normalizedRaces.sort().join(', ');
                                } else {
                                    raceLabel = 'Not Listed';
                                }
                            }
                        } else if (raceVal) {
                            // Handle string that might be JSON array
                            try {
                                const parsed = JSON.parse(raceVal);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    const normalizedRaces = parsed.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                                    if (normalizedRaces.length > 0) {
                                        raceLabel = normalizedRaces.sort().join(', ');
                                    } else {
                                        raceLabel = 'Not Listed';
                                    }
                                } else {
                                    raceLabel = normalize('race', raceVal);
                                }
                            } catch (e) {
                                // Not JSON, treat as single value
                                raceLabel = normalize('race', raceVal);
                            }
                        }
                        add(agg.race, raceLabel);
                        
                        // Age: calculate from date of birth
                        const dob = dem.date_of_birth || dem['Date of Birth'] || dem['DATE OF BIRTH'];
                        if (dob) {
                            try {
                                const birthDate = new Date(dob);
                                if (!isNaN(birthDate.getTime())) {
                                    const today = new Date();
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const monthDiff = today.getMonth() - birthDate.getMonth();
                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                        age--;
                                    }
                                    // Group into age ranges: 18-24, 25-34, 35-44, 45-55, over 55
                                    let ageRange;
                                    if (age < 18) ageRange = 'Under 18';
                                    else if (age <= 24) ageRange = '18-24';
                                    else if (age <= 34) ageRange = '25-34';
                                    else if (age <= 44) ageRange = '35-44';
                                    else if (age <= 55) ageRange = '45-55';
                                    else ageRange = 'Over 55';
                                    add(agg.age, ageRange);
                                } else {
                                    add(agg.age, 'Not Listed');
                                }
                            } catch (e) {
                                add(agg.age, 'Not Listed');
                            }
                        } else {
                            add(agg.age, 'Not Listed');
                        }
                        
                        // Gender: count once per person
                        add(agg.gender, normalize('gender', dem.gender || dem.GENDER));
                        
                        // Education: count once per person
                        add(agg.education, normalize('education', dem.education_level || dem['WHAT IS YOUR CURRENT HIGHEST EDUCATIONAL ATTAINED']));
                    });
                    // Calculate average income
                    const avgIncome = incomeCount > 0 ? Math.round(totalIncome / incomeCount) : null;
                    setAverageIncome(avgIncome);
                    
                    // Handle IDs that were sent but not returned in the export (missing from export table)
                    // Note: applicantsWithoutId are already accounted for above
                    const missingFromExport = ids.length - processedCount;
                    if (missingFromExport > 0) {
                        // Add these as "Not Listed" for all categories
                        agg.race['Not Listed'] = (agg.race['Not Listed'] || 0) + missingFromExport;
                        agg.gender['Not Listed'] = (agg.gender['Not Listed'] || 0) + missingFromExport;
                        agg.education['Not Listed'] = (agg.education['Not Listed'] || 0) + missingFromExport;
                        agg.age['Not Listed'] = (agg.age['Not Listed'] || 0) + missingFromExport;
                    }
                    
                    // Double-check totals and ensure they match totalApplicants
                    // Note: Race totals may exceed totalApplicants if people selected multiple races
                    const genderTotal = Object.values(agg.gender).reduce((sum, count) => sum + count, 0);
                    const educationTotal = Object.values(agg.education).reduce((sum, count) => sum + count, 0);
                    const ageTotal = Object.values(agg.age).reduce((sum, count) => sum + count, 0);
                    
                    if (genderTotal < totalApplicants) {
                        agg.gender['Not Listed'] = (agg.gender['Not Listed'] || 0) + (totalApplicants - genderTotal);
                    }
                    if (educationTotal < totalApplicants) {
                        agg.education['Not Listed'] = (agg.education['Not Listed'] || 0) + (totalApplicants - educationTotal);
                    }
                    if (ageTotal < totalApplicants) {
                        agg.age['Not Listed'] = (agg.age['Not Listed'] || 0) + (totalApplicants - ageTotal);
                    }
                    
                    const toArr = (o) => Object.keys(o).map(k => ({ label: k || 'Not Listed', count: o[k] })).sort((a,b)=>b.count-a.count);
                    
                    // Helper function to clean labels consistently (same as display)
                    const cleanLabelForDedup = (label) => {
                        if (!label) return 'Unknown';
                        let cleaned = label.toString().trim();
                        try {
                            const parsed = JSON.parse(cleaned);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                cleaned = parsed[0].toString();
                            }
                        } catch (e) {
                            // Not JSON, continue
                        }
                        cleaned = cleaned
                            .replace(/^\[+/g, '')
                            .replace(/\]+$/g, '')
                            .replace(/^["']+/g, '')
                            .replace(/["']+$/g, '')
                            .trim()
                            .toLowerCase(); // Normalize case for comparison
                        return cleaned || 'unknown';
                    };
                    
                    // Deduplicate race entries by cleaning and merging
                    const raceArr = toArr(agg.race);
                    const raceDeduped = {};
                    raceArr.forEach(item => {
                        const cleanedKey = cleanLabelForDedup(item.label);
                        if (!raceDeduped[cleanedKey]) {
                            raceDeduped[cleanedKey] = { label: item.label, count: 0 };
                        }
                        // Prefer label without brackets/quotes
                        const currentHasBrackets = raceDeduped[cleanedKey].label.includes('[') || raceDeduped[cleanedKey].label.includes('"');
                        const newHasBrackets = item.label.includes('[') || item.label.includes('"');
                        if (newHasBrackets && !currentHasBrackets) {
                            // Keep the current label (cleaner one)
                        } else if (!newHasBrackets && currentHasBrackets) {
                            // Use the new label (cleaner)
                            raceDeduped[cleanedKey].label = item.label;
                        } else {
                            // Prefer shorter label (likely cleaner)
                            if (item.label.length < raceDeduped[cleanedKey].label.length) {
                                raceDeduped[cleanedKey].label = item.label;
                            }
                        }
                        raceDeduped[cleanedKey].count += item.count;
                    });
                    // Clean all labels before finalizing
                    race = Object.values(raceDeduped).map(item => {
                        const cleaned = cleanLabelForDedup(item.label);
                        // Capitalize first letter of each word for display
                        const displayLabel = cleaned.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                        return { label: displayLabel, count: item.count };
                    }).sort((a,b)=>b.count-a.count);
                    
                    gender = toArr(agg.gender); education = toArr(agg.education);
                    age = toArr(agg.age);
                } else {
                    // If export fails, create "Not Listed" entries for all applicants
                    race = [{ label: 'Not Listed', count: totalApplicants }];
                    gender = [{ label: 'Not Listed', count: totalApplicants }];
                    education = [{ label: 'Not Listed', count: totalApplicants }];
                    age = [{ label: 'Not Listed', count: totalApplicants }];
                    setAverageIncome(null);
                    setStageDetailedApplicantsCache({ key: cacheKey, rows: [] });
                }
            } else if (totalApplicants > 0) {
                // Applicants exist but have no applicant_ids - mark all as "Not Listed"
                race = [{ label: 'Not Listed', count: totalApplicants }];
                gender = [{ label: 'Not Listed', count: totalApplicants }];
                education = [{ label: 'Not Listed', count: totalApplicants }];
                age = [{ label: 'Not Listed', count: totalApplicants }];
                setAverageIncome(null);
                setStageDetailedApplicantsCache({ key: cacheKey, rows: [] });
            } else {
                // No applicants, empty arrays
                race = []; gender = []; education = []; age = [];
                setAverageIncome(null);
                setStageDetailedApplicantsCache({ key: cacheKey, rows: [] });
            }
            setStageDemographics({ race, gender, education, age });
        } catch (err) {
            console.error('Error loading stage demographics:', err);
            setStageDemographics({ race: [], gender: [], education: [], age: [] });
            setAverageIncome(null);
            setAppliedStatusBreakdown(null);
        }
    };
    // Reset status filter to 'all' when switching to applied stage
    useEffect(() => {
        if (activeOverviewStage === 'applied') {
            setApplicantStatusFilter('all');
        }
    }, [activeOverviewStage]);

    useEffect(() => {
        if (!hasAdminAccess || !token) return;
        loadStageDemographics(activeOverviewStage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeOverviewStage, overviewQuickView, applicantStatusFilter, overviewDeliberationFilter]);

    // Load applicants filtered by demographic
    const loadFilteredApplicants = async (demographicType, demographicValue) => {
        if (!hasAdminAccess || !token) return;
        
        setFilteredApplicantsLoading(true);
        setDemographicApplicantsFilter({ type: demographicType, value: demographicValue, stage: activeOverviewStage });
        
        try {
            const cohortParam = getOverviewCohortParam();
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            if (cohortParam) params.append('cohort_id', cohortParam);

            const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!appsResp.ok) throw new Error('Failed to load applications');
            const appsData = await appsResp.json();
            const apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

            // Filter apps based on stage
            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            let subsetApps = apps;
            if (activeOverviewStage === 'applied') {
                if (applicantStatusFilter === 'all') {
                    subsetApps = apps;
                } else {
                    const statusToFilter = applicantStatusFilter === 'accounts_created' ? 'no_application' : applicantStatusFilter;
                    subsetApps = apps.filter(a => a.status === statusToFilter);
                }
            } else if (activeOverviewStage === 'info') {
                subsetApps = apps.filter(a => attendedSet.has(a.info_session_status));
            } else if (activeOverviewStage === 'workshops') {
                subsetApps = apps.filter(a => attendedSet.has(a.workshop_status));
            } else if (activeOverviewStage === 'offers') {
                subsetApps = apps.filter(a => a.final_status === 'accepted');
            }

            const ids = subsetApps.map(a => a.applicant_id).filter(Boolean);
            if (ids.length === 0) {
                setFilteredApplicants([]);
                setFilteredApplicantsLoading(false);
                return;
            }

            // Get detailed demographics
            const expResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${ids.join(',')}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!expResp.ok) {
                setFilteredApplicants([]);
                setFilteredApplicantsLoading(false);
                return;
            }
            const detailed = await expResp.json();
            if (!Array.isArray(detailed) || detailed.length === 0) {
                setFilteredApplicants([]);
                setFilteredApplicantsLoading(false);
                return;
            }

            const normalize = (category, value) => {
                const raw = (value ?? '').toString().trim();
                if (!raw) return 'Not Listed';
                const v = raw.toLowerCase();
                const isNotListed = ['not listed','not_listed','prefer not to say','unknown','unspecified','n/a','na','none','null',''].includes(v);
                if (isNotListed) return 'Not Listed';
                if (category === 'gender') {
                    if (['female','woman','f','female-identifying','female identifying'].includes(v)) return 'Female';
                    if (['male','man','m','male-identifying','male identifying'].includes(v)) return 'Male';
                }
                return raw.charAt(0).toUpperCase() + raw.slice(1);
            };

            const getRaceLabel = (dem) => {
                const raceVal = dem.race_ethnicity || dem['WHICH OF THE FOLLOWING BEST REPRESENTS YOUR RACIAL BACKGROUND'];
                let raceLabel = 'Not Listed';
                if (Array.isArray(raceVal)) {
                    if (raceVal.length > 0) {
                        const normalizedRaces = raceVal.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                        if (normalizedRaces.length > 0) {
                            raceLabel = normalizedRaces.sort().join(', ');
                        }
                    }
                } else if (raceVal) {
                    try {
                        const parsed = JSON.parse(raceVal);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const normalizedRaces = parsed.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                            if (normalizedRaces.length > 0) {
                                raceLabel = normalizedRaces.sort().join(', ');
                            }
                        } else {
                            raceLabel = normalize('race', raceVal);
                        }
                    } catch (err) {
                        raceLabel = normalize('race', raceVal);
                    }
                }
                return raceLabel;
            };

            const getEducationLabel = (dem) => normalize('education', dem.education_level || dem['WHAT IS YOUR CURRENT HIGHEST EDUCATIONAL ATTAINED']);

            const getAgeInfo = (dem) => {
                const dob = dem.date_of_birth || dem['Date of Birth'] || dem['DATE OF BIRTH'];
                if (!dob) return { range: 'Not Listed', age: null };
                try {
                    const birthDate = new Date(dob);
                    if (isNaN(birthDate.getTime())) return { range: 'Not Listed', age: null };
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    let ageRange;
                    if (age < 18) ageRange = 'Under 18';
                    else if (age <= 24) ageRange = '18-24';
                    else if (age <= 34) ageRange = '25-34';
                    else if (age <= 44) ageRange = '35-44';
                    else if (age <= 55) ageRange = '45-55';
                    else ageRange = 'Over 55';
                    return { range: ageRange, age };
                } catch (err) {
                    return { range: 'Not Listed', age: null };
                }
            };

            const rows = [];
            detailed.forEach(d => {
                const dem = d.demographics || {};
                let label = 'Not Listed';
                let ageNumber = null;

                if (demographicType === 'race') {
                    label = getRaceLabel(dem) || 'Not Listed';
                } else if (demographicType === 'education') {
                    label = getEducationLabel(dem) || 'Not Listed';
                } else if (demographicType === 'age') {
                    const ageInfo = getAgeInfo(dem);
                    label = ageInfo.range || 'Not Listed';
                    ageNumber = ageInfo.age;
                }

                if (demographicValue && label !== demographicValue) return;

                const row = {
                    applicant_id: d.applicant_id,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    email: d.email,
                    status: d.status,
                    info_session_status: d.info_session_status,
                    workshop_status: d.workshop_status,
                    final_status: d.final_status,
                };

                if (demographicType === 'race') {
                    row.race = label;
                } else if (demographicType === 'education') {
                    row.education_level = label;
                } else if (demographicType === 'age') {
                    row.age_range = label;
                    if (ageNumber !== null) row.age = ageNumber;
                }

                rows.push(row);
            });

            if (!rows.length) {
                setFilteredApplicants([]);
                setFilteredApplicantsLoading(false);
                if (checkbox && typeof checkbox.checked !== 'undefined') {
                    checkbox.checked = false;
                }
                return;
            }

            setFilteredApplicants(rows);
            setFilteredApplicantsLoading(false);
        } catch (err) {
            console.error('Error exporting demographic data:', err);
            setFilteredApplicants([]);
            setFilteredApplicantsLoading(false);
        }
    };
    
    // Handler for clicking demographic values to open modal
    const handleDemographicValueClick = async (demographicType, demographicValue) => {
        setDemographicApplicantsModalOpen(true);
        await loadFilteredApplicants(demographicType, demographicValue);
    };
    
    // Load applications for KPI tile clicks
    const loadApplicationsForTile = async (filterType, statusFilter = null) => {
        if (!hasAdminAccess || !token) return;
        
        setModalApplicationsLoading(true);
        setApplicationsModalFilter({ type: filterType, status: statusFilter });
        
        try {
            const cohortParam = getOverviewCohortParam();
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            if (cohortParam) params.append('cohort_id', cohortParam);

            const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!appsResp.ok) throw new Error('Failed to load applications');
            const appsData = await appsResp.json();
            let apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

            // Filter based on tile type
            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            let filteredApps = apps;

            if (filterType === 'total') {
                // All applicants
                filteredApps = apps;
            } else if (filterType === 'accounts_created') {
                filteredApps = apps.filter(a => a.status === 'no_application');
            } else if (filterType === 'submitted') {
                filteredApps = apps.filter(a => a.status === 'submitted');
                // If statusFilter is a recommendation type, filter by that
                if (statusFilter && ['assessed', 'pending', 'strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(statusFilter)) {
                    if (statusFilter === 'assessed') {
                        filteredApps = filteredApps.filter(a => {
                            const r = a.recommendation;
                            const fs = a.final_status;
                            return ['strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(r) || (fs && fs !== 'pending');
                        });
                    } else if (statusFilter === 'pending') {
                        filteredApps = filteredApps.filter(a => {
                            const r = a.recommendation;
                            const fs = a.final_status;
                            return !['strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(r) && (!fs || fs === 'pending');
                        });
                    } else {
                        filteredApps = filteredApps.filter(a => a.recommendation === statusFilter);
                    }
                }
            } else if (filterType === 'info') {
                filteredApps = apps.filter(a => attendedSet.has(a.info_session_status));
            } else if (filterType === 'workshops') {
                filteredApps = apps.filter(a => attendedSet.has(a.workshop_status));
            } else if (filterType === 'offers') {
                filteredApps = apps.filter(a => a.final_status === 'accepted');
            } else if (filterType === 'marketing') {
                // For marketing, we'll show all applicants (email stats are separate)
                filteredApps = apps;
            }

            // Additional status filter if provided
            if (statusFilter && filterType !== 'submitted') {
                if (statusFilter === 'accounts_created') {
                    filteredApps = filteredApps.filter(a => a.status === 'no_application');
                } else if (statusFilter === 'registered') {
                    // For info sessions or workshops, filter by registered status
                    if (filterType === 'info') {
                        filteredApps = filteredApps.filter(a => a.info_session_status === 'registered');
                    } else if (filterType === 'workshops') {
                        filteredApps = filteredApps.filter(a => a.workshop_status === 'registered');
                    }
                } else if (statusFilter === 'attended') {
                    // For info sessions or workshops, filter by attended status
                    if (filterType === 'info') {
                        filteredApps = filteredApps.filter(a => attendedSet.has(a.info_session_status));
                    } else if (filterType === 'workshops') {
                        filteredApps = filteredApps.filter(a => attendedSet.has(a.workshop_status));
                    }
                } else {
                    filteredApps = filteredApps.filter(a => a.status === statusFilter);
                }
            }

            setModalApplications(filteredApps);
        } catch (err) {
            console.error('Error loading applications:', err);
            setModalApplications([]);
        } finally {
            setModalApplicationsLoading(false);
            setApplicationsModalOpen(true);
        }
    };
    // CSV export function
    const exportToCSV = (data, filename, headers = null) => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        // Determine headers
        let csvHeaders = headers;
        if (!csvHeaders && data.length > 0) {
            csvHeaders = Object.keys(data[0]);
        }

        // Create CSV content
        const csvContent = [
            csvHeaders.join(','),
            ...data.map(row => 
                csvHeaders.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    // Escape quotes and wrap in quotes if contains comma, quote, or newline
                    const stringValue = String(value).replace(/"/g, '""');
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue}"`;
                    }
                    return stringValue;
                }).join(',')
            )
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    // Handle demographic export
    const handleDemographicExport = async (e, demographicType, demographicValue, filename) => {
        e.stopPropagation();
        const checkbox = e.target;
        
        try {
            const detailed = await fetchStageDetailedApplicants();
            if (!detailed.length) {
                alert('No applicants to export');
                if (checkbox && typeof checkbox.checked !== 'undefined') {
                    checkbox.checked = false;
                }
                return;
            }

            const normalize = (category, value) => {
                const raw = (value ?? '').toString().trim();
                if (!raw) return 'Not Listed';
                const v = raw.toLowerCase();
                const isNotListed = ['not listed','not_listed','prefer not to say','unknown','unspecified','n/a','na','none','null',''].includes(v);
                if (isNotListed) return 'Not Listed';
                if (category === 'gender') {
                    if (['female','woman','f','female-identifying','female identifying'].includes(v)) return 'Female';
                    if (['male','man','m','male-identifying','male identifying'].includes(v)) return 'Male';
                }
                return raw.charAt(0).toUpperCase() + raw.slice(1);
            };

            const getRaceLabel = (dem) => {
                const raceVal = dem.race_ethnicity || dem['WHICH OF THE FOLLOWING BEST REPRESENTS YOUR RACIAL BACKGROUND'];
                let raceLabel = 'Not Listed';
                if (Array.isArray(raceVal)) {
                    if (raceVal.length > 0) {
                        const normalizedRaces = raceVal.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                        if (normalizedRaces.length > 0) {
                            raceLabel = normalizedRaces.sort().join(', ');
                        }
                    }
                } else if (raceVal) {
                    try {
                        const parsed = JSON.parse(raceVal);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const normalizedRaces = parsed.map(r => normalize('race', r)).filter(r => r !== 'Not Listed');
                            if (normalizedRaces.length > 0) {
                                raceLabel = normalizedRaces.sort().join(', ');
                            }
                        } else {
                            raceLabel = normalize('race', raceVal);
                        }
                    } catch (err) {
                        raceLabel = normalize('race', raceVal);
                    }
                }
                return raceLabel;
            };

            const getEducationLabel = (dem) => normalize('education', dem.education_level || dem['WHAT IS YOUR CURRENT HIGHEST EDUCATIONAL ATTAINED']);

            const getAgeInfo = (dem) => {
                const dob = dem.date_of_birth || dem['Date of Birth'] || dem['DATE OF BIRTH'];
                if (!dob) return { range: 'Not Listed', age: null };
                try {
                    const birthDate = new Date(dob);
                    if (isNaN(birthDate.getTime())) return { range: 'Not Listed', age: null };
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    let ageRange;
                    if (age < 18) ageRange = 'Under 18';
                    else if (age <= 24) ageRange = '18-24';
                    else if (age <= 34) ageRange = '25-34';
                    else if (age <= 44) ageRange = '35-44';
                    else if (age <= 55) ageRange = '45-55';
                    else ageRange = 'Over 55';
                    return { range: ageRange, age };
                } catch (err) {
                    return { range: 'Not Listed', age: null };
                }
            };

            const rows = [];
            detailed.forEach(d => {
                const dem = d.demographics || {};
                let label = 'Not Listed';
                let ageNumber = null;

                if (demographicType === 'race') {
                    label = getRaceLabel(dem) || 'Not Listed';
                } else if (demographicType === 'education') {
                    label = getEducationLabel(dem) || 'Not Listed';
                } else if (demographicType === 'age') {
                    const ageInfo = getAgeInfo(dem);
                    label = ageInfo.range || 'Not Listed';
                    ageNumber = ageInfo.age;
                }

                if (demographicValue && label !== demographicValue) return;

                const row = {
                    applicant_id: d.applicant_id,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    email: d.email,
                    status: d.status,
                    info_session_status: d.info_session_status,
                    workshop_status: d.workshop_status,
                    final_status: d.final_status,
                };

                if (demographicType === 'race') {
                    row.race = label;
                } else if (demographicType === 'education') {
                    row.education_level = label;
                } else if (demographicType === 'age') {
                    row.age_range = label;
                    if (ageNumber !== null) row.age = ageNumber;
                }

                rows.push(row);
            });

            if (!rows.length) {
                alert('No applicants found for this demographic category.');
                if (checkbox && typeof checkbox.checked !== 'undefined') {
                    checkbox.checked = false;
                }
                return;
            }

            let headers;
            if (demographicType === 'race') {
                headers = ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'info_session_status', 'workshop_status', 'final_status', 'race'];
            } else if (demographicType === 'education') {
                headers = ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'info_session_status', 'workshop_status', 'final_status', 'education_level'];
            } else if (demographicType === 'age') {
                headers = ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'info_session_status', 'workshop_status', 'final_status', 'age_range', 'age'];
            } else {
                headers = ['applicant_id', 'first_name', 'last_name', 'email', 'status'];
            }

            exportToCSV(rows, filename, headers);
            if (checkbox && typeof checkbox.checked !== 'undefined') {
                checkbox.checked = false;
            }
        } catch (err) {
            console.error('Error exporting demographic data:', err);
            alert('Failed to export data. Please try again.');
            if (checkbox && typeof checkbox.checked !== 'undefined') {
                checkbox.checked = false;
            }
        }
    };

    const handleIncomeExport = async (e) => {
        e.stopPropagation();
        const checkbox = e.target;
        
        try {
            const detailed = await fetchStageDetailedApplicants();
            if (!detailed.length) {
                alert('No applicants to export');
                if (checkbox && typeof checkbox.checked !== 'undefined') {
                    checkbox.checked = false;
                }
                return;
            }

            const parseIncome = (incomeStr) => {
                if (!incomeStr) return null;
                const cleaned = incomeStr.toString().replace(/[$,\s]/g, '');
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? null : parsed;
            };

            const rows = detailed.map(d => {
                const dem = d.demographics || {};
                const incomeRaw = dem.personal_income || dem['Personal Annual Income'] || '';
                const incomeNumeric = parseIncome(incomeRaw);
                return {
                    applicant_id: d.applicant_id,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    email: d.email,
                    status: d.status,
                    info_session_status: d.info_session_status,
                    workshop_status: d.workshop_status,
                    final_status: d.final_status,
                    personal_income: incomeRaw || 'Not Listed',
                    personal_income_numeric: incomeNumeric !== null ? incomeNumeric : ''
                };
            });

            if (!rows.length) {
                alert('No applicants to export');
                return;
            }

            exportToCSV(rows, `income-${activeOverviewStage || 'all'}`, ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'info_session_status', 'workshop_status', 'final_status', 'personal_income', 'personal_income_numeric']);
            if (checkbox && typeof checkbox.checked !== 'undefined') {
                checkbox.checked = false;
            }
        } catch (err) {
            console.error('Error exporting income data:', err);
            alert('Failed to export data. Please try again.');
            if (checkbox && typeof checkbox.checked !== 'undefined') {
                checkbox.checked = false;
            }
        }
    };
    // Handle export checkbox toggle - loads data and exports
    const handleExportClick = async (e, filterType, statusFilter, filename, headers) => {
        e.stopPropagation();
        
        try {
            // Load the data first
            const cohortParam = getOverviewCohortParam();
            const params = new URLSearchParams();
            params.append('limit', 10000);
            params.append('offset', 0);
            if (cohortParam) params.append('cohort_id', cohortParam);

            const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!appsResp.ok) throw new Error('Failed to load applications');
            const appsData = await appsResp.json();
            let apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

            // Filter based on tile type
            const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
            let filteredApps = apps;

            if (filterType === 'total') {
                filteredApps = apps;
            } else if (filterType === 'accounts_created') {
                filteredApps = apps.filter(a => a.status === 'no_application');
            } else if (filterType === 'submitted') {
                filteredApps = apps.filter(a => a.status === 'submitted');
                // If statusFilter is a recommendation type, filter by that
                if (statusFilter && ['assessed', 'pending', 'strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(statusFilter)) {
                    if (statusFilter === 'assessed') {
                        filteredApps = filteredApps.filter(a => {
                            const r = a.recommendation;
                            const fs = a.final_status;
                            return ['strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(r) || (fs && fs !== 'pending');
                        });
                    } else if (statusFilter === 'pending') {
                        filteredApps = filteredApps.filter(a => {
                            const r = a.recommendation;
                            const fs = a.final_status;
                            return !['strong_recommend', 'recommend', 'review_needed', 'not_recommend'].includes(r) && (!fs || fs === 'pending');
                        });
                    } else {
                        filteredApps = filteredApps.filter(a => a.recommendation === statusFilter);
                    }
                }
            } else if (filterType === 'info') {
                filteredApps = apps.filter(a => attendedSet.has(a.info_session_status));
            } else if (filterType === 'workshops') {
                filteredApps = apps.filter(a => attendedSet.has(a.workshop_status));
            } else if (filterType === 'offers') {
                filteredApps = apps.filter(a => a.final_status === 'accepted');
            }

            // Additional status filter if provided
            if (statusFilter && filterType !== 'submitted') {
                if (statusFilter === 'accounts_created') {
                    filteredApps = filteredApps.filter(a => a.status === 'no_application');
                } else if (statusFilter === 'registered') {
                    // For info sessions or workshops, filter by registered status
                    if (filterType === 'info') {
                        filteredApps = filteredApps.filter(a => a.info_session_status === 'registered');
                    } else if (filterType === 'workshops') {
                        filteredApps = filteredApps.filter(a => a.workshop_status === 'registered');
                    }
                } else if (statusFilter === 'attended') {
                    // For info sessions or workshops, filter by attended status
                    if (filterType === 'info') {
                        filteredApps = filteredApps.filter(a => attendedSet.has(a.info_session_status));
                    } else if (filterType === 'workshops') {
                        filteredApps = filteredApps.filter(a => attendedSet.has(a.workshop_status));
                    }
                } else {
                    filteredApps = filteredApps.filter(a => a.status === statusFilter);
                }
            }

            // Export the data
            exportToCSV(filteredApps, filename, headers);
        } catch (err) {
            console.error('Error exporting data:', err);
            alert('Failed to export data. Please try again.');
        }
    };
    // Individual fetch functions for refresh buttons
    const fetchApplications = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (applicationFilters.status) params.append('status', applicationFilters.status);
            if (applicationFilters.info_session_status) params.append('info_session_status', applicationFilters.info_session_status);
            if (applicationFilters.recommendation) params.append('recommendation', applicationFilters.recommendation);
            if (applicationFilters.final_status) params.append('final_status', applicationFilters.final_status);
            if (applicationFilters.workshop_status) params.append('workshop_status', applicationFilters.workshop_status);
            if (applicationFilters.program_admission_status) params.append('program_admission_status', applicationFilters.program_admission_status);
            if (applicationFilters.ready_for_workshop_invitation) params.append('ready_for_workshop_invitation', 'true');
            if (applicationFilters.name_search) params.append('name_search', applicationFilters.name_search);
            if (applicationFilters.cohort_id) params.append('cohort_id', applicationFilters.cohort_id);
            params.append('limit', applicationFilters.limit);
            params.append('offset', applicationFilters.offset);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchInfoSessions = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInfoSessions(data);
            }
        } catch (error) {
            console.error('Error fetching info sessions:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchWorkshops = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkshops(data.workshops || data);
            }
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };
    // Debounce name search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setApplicationFilters(prev => ({
                ...prev,
                name_search: nameSearchInput,
                offset: 0 // Reset to first page when search changes
            }));
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [nameSearchInput]);

    // Email automation fetch functions
    const fetchEmailStats = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setEmailAutomationLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEmailStats(data);
            }
        } catch (error) {
            console.error('Error fetching email stats:', error);
        } finally {
            setEmailAutomationLoading(false);
        }
    };

    const fetchQueuedEmails = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/queued`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplicantEmailStatus(data);
            }
        } catch (error) {
            console.error('Error fetching applicant email status:', error);
        }
    };
    const sendTestEmail = async () => {
        if (!testEmailAddress.trim()) {
            Swal.fire({
                title: 'Email Required',
                text: 'Please enter an email address to send the test email to.',
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmailAddress.trim())) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Please enter a valid email address.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        try {
            setTestEmailLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/send-test-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: testEmailAddress.trim() })
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    title: '📧 Test Email Sent!',
                    html: `
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
                    `,
                    icon: 'success',
                    confirmButtonText: 'Got it!',
                    confirmButtonColor: 'var(--color-primary)',
                    background: 'var(--color-background-dark)',
                    color: 'var(--color-text-primary)'
                });
                
                // Clear the input and refresh stats
                setTestEmailAddress('');
                fetchEmailStats();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to send test email. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
        } finally {
            setTestEmailLoading(false);
        }
    };

    // Load data on mount and when filters change
    // Fetch cohorts on mount
    useEffect(() => {
        fetchCohorts();
        fetchWorkshopCohorts();  // Fetch workshop-specific cohorts for the dropdown
    }, [token, hasAdminAccess]);

    useEffect(() => {
        fetchAdmissionsData();
    }, [token, hasAdminAccess, applicationFilters, overviewQuickView, cohorts]);

    // Recompute overview stats when the overview filter changes
    useEffect(() => {
        if (!overviewQuickView) {
            setComputedOverviewStats(null);
            return;
        }
        computeOverviewStatsForFilter();
    }, [overviewQuickView, token, hasAdminAccess, cohorts]);

    // Reset compareEnabled when switching away from December 2025
    useEffect(() => {
        if (overviewQuickView !== 'dec2025' && compareEnabled) {
            setCompareEnabled(false);
        }
    }, [overviewQuickView, compareEnabled]);
    // Compute previous cycle stats for comparison (September 2025 when December 2025 is selected)
    useEffect(() => {
        const run = async () => {
            if (!compareEnabled) { 
                setPreviousOverviewStats(null); 
                return; 
            }
            
            // Only compare when December 2025 is selected
            if (overviewQuickView !== 'dec2025') {
                setPreviousOverviewStats(null);
                return;
            }
            
            // Get September 2025 cohort ID
            const norm = (s) => (s || '').toLowerCase();
            const candidates = cohorts || [];
            const sepMatch = candidates.find(c => {
                const n = norm(c.name);
                return (n.includes('sep') || n.includes('september')) && n.includes('2025');
            }) || candidates.find(c => norm(c.name).includes('september 2025'));
            
            if (!sepMatch?.cohort_id) {
                setPreviousOverviewStats(null);
                return;
            }
            
            try {
                // Fetch September 2025 applications
                const params = new URLSearchParams();
                params.append('limit', 10000);
                params.append('offset', 0);
                params.append('cohort_id', sepMatch.cohort_id);
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!resp.ok) {
                    setPreviousOverviewStats(null);
                    return;
                }
                const data = await resp.json();
                const apps = Array.isArray(data?.applications) ? data.applications : [];
                const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
                
                // Info sessions aggregates
                const infoSessionRegistrations = apps.filter(a => (a.info_session_status && a.info_session_status !== 'not_registered')).length;
                const infoSessionAttended = apps.filter(a => attendedSet.has(a.info_session_status)).length;
                
                // Workshops: Fetch admissions workshops and calculate from their registrations
                let workshopRegistrations = 0;
                let workshopAttended = 0;
                try {
                    const workshopsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (workshopsResp.ok) {
                        const workshopsData = await workshopsResp.json();
                        const workshops = Array.isArray(workshopsData) ? workshopsData : (workshopsData.workshops || []);
                        // Filter to admissions workshops only
                        const admissionsWorkshops = workshops.filter(w => w.workshop_type === 'admissions');
                        
                        // Get set of applicant IDs from September apps
                        const sepApplicantIds = new Set(apps.map(a => a.applicant_id).filter(Boolean));
                        
                        // Fetch registrations for each admissions workshop
                        for (const workshop of admissionsWorkshops) {
                            try {
                                const regResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/registrations/workshop/${workshop.event_id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (regResp.ok) {
                                    const registrations = await regResp.json();
                                    registrations.forEach(reg => {
                                        if (reg.applicant_id && sepApplicantIds.has(reg.applicant_id)) {
                                            workshopRegistrations++;
                                            if (attendedSet.has(reg.status)) {
                                                workshopAttended++;
                                            }
                                        }
                                    });
                                }
                            } catch (regErr) {
                                console.error(`Error fetching registrations for workshop ${workshop.event_id}:`, regErr);
                            }
                        }
                    }
                } catch (workshopErr) {
                    console.error('Error fetching workshops for previous stats:', workshopErr);
                    // Fallback to applicant-level status
                    workshopRegistrations = apps.filter(a => (a.workshop_status && a.workshop_status !== 'pending')).length;
                    workshopAttended = apps.filter(a => attendedSet.has(a.workshop_status)).length;
                }
                
                // Calculate offers (accepted status)
                const finalCounts = apps.reduce((acc, a) => {
                    const status = a.final_status || 'pending';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});
                const offersExtended = finalCounts['accepted'] || 0;
                
                setPreviousOverviewStats({
                    totalApplicants: data?.total || apps.length,
                    infoSessions: {
                        totalSessions: infoSessionRegistrations,
                        totalRegistrations: infoSessionRegistrations,
                        totalAttended: infoSessionAttended
                    },
                    workshops: {
                        totalWorkshops: workshopRegistrations,
                        totalRegistrations: workshopRegistrations,
                        totalAttended: workshopAttended
                    },
                    offersExtended: offersExtended
                });
            } catch (err) {
                console.error('Error computing previous stats:', err);
                setPreviousOverviewStats(null);
            }
        };
        run();
    }, [compareEnabled, overviewQuickView, cohorts, token]);
    // Load email automation data when tab changes
    useEffect(() => {
        if (activeTab === 'emails') {
            fetchEmailStats();
            fetchQueuedEmails();
            fetchEmailHistory();
            fetchApplicantEmailStatus();
        }
    }, [activeTab, token, hasAdminAccess]);

    // Debounced search for applicants
    useEffect(() => {
        if (!applicantSearch.trim()) {
            console.log('🔍 Clearing results due to empty applicantSearch');
            setSearchResults([]);
            return;
        }

        console.log('🔍 Debouncing search for:', applicantSearch);
        const timeoutId = setTimeout(() => {
            searchApplicants(applicantSearch);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [applicantSearch, selectedEventForRegistration, selectedEventType]);

    // Monitor searchResults changes
    useEffect(() => {
        console.log('🔍 searchResults state changed:', searchResults.length, 'items');
        console.log('🔍 searchResults array:', searchResults);
        if (searchResults.length > 0) {
            console.log('🔍 Sample results:', searchResults.slice(0, 2).map(a => ({ name: a.display_name, email: a.email })));
            console.log('🔍 Should show search results UI now!');
        }
    }, [searchResults]);

    // Handle tab switching
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle status change (human override)
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ final_status: newStatus })
            });

            if (response.ok) {
                // Update the local state
                setApplications(prev => ({
                    ...prev,
                    applications: prev.applications.map(app =>
                        app.application_id === applicationId
                            ? {
                                ...app,
                                final_status: newStatus,
                                has_human_override: app.recommendation !== newStatus
                            }
                            : app
                    )
                }));
            } else {
                console.error('Failed to update status');
                setError('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status. Please try again.');
        }
    };
    // Handle bulk actions
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
                const result = await response.json();
                console.log('Bulk action completed:', result);

                // Refresh applications data
                await fetchApplications();

                // Clear selection
                setSelectedApplicants([]);
                setBulkActionsModalOpen(false);

                // Show success message
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Bulk action failed:', errorData);
                setError(`Bulk action failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            setError('Failed to perform bulk action. Please try again.');
        } finally {
            setBulkActionInProgress(false);
        }
    };

    // Handle application filter changes
    const handleFilterChange = (key, value) => {
        setApplicationFilters(prev => ({
            ...prev,
            [key]: value,
            offset: key !== 'offset' ? 0 : value // Reset offset when other filters change
        }));
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

    // Handle deliberation update
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

            // Update local state
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

    // Handle column sorting
    const handleColumnSort = (column) => {
        setColumnSort(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    // Sort applications (name filtering is now handled server-side)
    const sortAndFilterApplications = (apps) => {
        if (!apps || !Array.isArray(apps)) return apps;

        let filteredApps = [...apps];

        // Apply sorting
        return filteredApps.sort((a, b) => {
            let valueA, valueB;

            switch (columnSort.column) {
                case 'name':
                    valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
                    valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'status':
                    valueA = a.status || '';
                    valueB = b.status || '';
                    break;
                case 'assessment':
                    valueA = a.final_status || a.recommendation || '';
                    valueB = b.final_status || b.recommendation || '';
                    break;
                case 'info_session':
                    valueA = a.info_session_status || '';
                    valueB = b.info_session_status || '';
                    break;
                case 'workshop':
                    valueA = a.workshop_status || '';
                    valueB = b.workshop_status || '';
                    break;
                case 'created_at':
                default:
                    valueA = new Date(a.created_at);
                    valueB = new Date(b.created_at);
                    break;
            }

            if (columnSort.direction === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });
    };

    // Sort events by date (earliest to latest)
    const sortEventsByDate = (events) => {
        if (!events || !Array.isArray(events)) return events;

        return [...events].sort((a, b) => {
            // Use start_time for workshops, event_date for info sessions
            const dateA = new Date(a.start_time || a.event_date);
            const dateB = new Date(b.start_time || b.event_date);

            // For earliest to latest: smaller date - larger date gives negative (comes first)
            return dateA.getTime() - dateB.getTime();
        });
    };

    // Filter events based on active status
    const getFilteredInfoSessions = () => {
        if (showInactiveInfoSessions) {
            return infoSessions; // Show all events
        }
        return infoSessions.filter(session => session.is_active);
    };
    const getFilteredWorkshops = () => {
        if (showInactiveWorkshops) {
            return workshops;
        }
        return workshops.filter(workshop => workshop.is_active);
    };

    // Check if an event has passed
    const isEventPast = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate} ${eventTime}`);
        return eventDateTime < new Date();
    };

    // Format time from 24-hour to 12-hour EST format
    const formatEventTime = (timeString) => {
        try {
            // Database stores times AS EST (no timezone conversion needed)
            // Just extract and format the time portion
            let hours, minutes;
            
            if (timeString.includes('T') || timeString.includes('-')) {
                // It's a full datetime - extract the time portion
                const timeMatch = timeString.match(/(\d{2}):(\d{2}):/);
                if (timeMatch) {
                    hours = parseInt(timeMatch[1]);
                    minutes = parseInt(timeMatch[2]);
                } else {
                    return timeString;
                }
            } else {
                // It's just a time string (e.g., "17:30:00")
                [hours, minutes] = timeString.split(':').map(n => parseInt(n));
            }

            // Convert to 12-hour format
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, '0');
            
            return `${displayHours}:${displayMinutes} ${period}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Fallback to original
        }
    };
    // Format phone number to (000) 000-0000 format
    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'N/A';

        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Check if it's a valid 10-digit US phone number
        if (cleaned.length === 10) {
            return `(${cleaned.substring(0, 3)})${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
        }

        // If not 10 digits, return the original value or 'Invalid'
        return phoneNumber || 'N/A';
    };

    // Copy text to clipboard with feedback
    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
            console.log(`${type} copied to clipboard: ${text}`);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    // Handle phone number click - copy raw digits
    const handlePhoneClick = (phoneNumber) => {
        if (!phoneNumber || phoneNumber === 'N/A') return;
        const cleaned = phoneNumber.replace(/\D/g, '');
        copyToClipboard(cleaned, 'Phone number');
    };

    // Handle email click - copy email
    const handleEmailClick = (email) => {
        if (!email) return;
        copyToClipboard(email, 'Email');
    };

    // Copy all emails for current event registrations
    const copyAllEmails = () => {
        const emails = eventRegistrations
            .filter(reg => reg.email && reg.email.trim() !== '')
            .map(reg => reg.email);

        if (emails.length === 0) {
            console.log('No emails to copy');
            return;
        }

        const emailList = emails.join(', ');
        copyToClipboard(emailList, `${emails.length} emails`);
    };
    // Copy all phone numbers for current event registrations
    const copyAllPhoneNumbers = () => {
        const phoneNumbers = eventRegistrations
            .filter(reg => reg.phone_number && reg.phone_number !== 'N/A' && reg.phone_number.trim() !== '')
            .map(reg => reg.phone_number.replace(/\D/g, '')) // Remove formatting
            .filter(phone => phone.length === 10); // Only valid 10-digit numbers

        if (phoneNumbers.length === 0) {
            console.log('No valid phone numbers to copy');
            return;
        }

        const phoneList = phoneNumbers.join(', ');
        copyToClipboard(phoneList, `${phoneNumbers.length} phone numbers`);
    };
    // Handle CSV export for selected applicants
    const handleExportCSV = async () => {
        if (selectedApplicants.length === 0) return;
        
        try {
            setLoading(true);
            
            // Get the full details of selected applicants including demographic data
            const selectedApplicantIds = selectedApplicants.join(',');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${selectedApplicantIds}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch detailed applicant data');
            }
            
            const detailedApplicantData = await response.json();
            
            if (!detailedApplicantData || detailedApplicantData.length === 0) {
                console.error('No data found for selected applicants');
                setError('No data found for selected applicants');
                return;
            }
            
            // Debug: Log the data we're getting from the API
            console.log('Detailed applicant data:', detailedApplicantData);
            
            // Check if we have demographics data
            const hasDemographics = detailedApplicantData.some(app => 
                app.demographics && Object.keys(app.demographics).some(key => app.demographics[key])
            );
            console.log('Has any demographic data:', hasDemographics);
            
            if (detailedApplicantData.length > 0) {
                console.log('First applicant demographics:', detailedApplicantData[0].demographics);
            }
            
            // Define CSV headers based on available data
            const headers = [
                'Applicant ID',
                'First Name',
                'Last Name',
                'Email',
                'Phone Number',
                'Application Status',
                'Assessment',
                'Info Session Status',
                'Workshop Status',
                'Program Admission Status',
                'Date of Birth',
                'Address',
                'Gender',
                'Personal Annual Income',
                'Educational Attainment',
                'First-Generation College Student',
                'Race/Ethnicity',
                'English as Secondary Language',
                'Born Outside US',
                'Parents Born Outside US',
                'Government Assistance',
                'Veteran Status',
                'Communities',
                'Employment Status',
                'Reason for Applying'
            ];
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            // Add data rows
            detailedApplicantData.forEach(applicant => {
                // Extract demographic data - safely handle missing fields
                const demographics = applicant.demographics || {};
                
                const row = [
                    applicant.applicant_id,
                    `"${(applicant.first_name || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
                    `"${(applicant.last_name || '').replace(/"/g, '""')}"`,
                    `"${(applicant.email || '').replace(/"/g, '""')}"`,
                    `"${(applicant.phone_number || '').replace(/"/g, '""')}"`,
                    `"${(applicant.status || '').replace(/"/g, '""')}"`,
                    `"${(applicant.final_status || applicant.recommendation || '').replace(/"/g, '""')}"`,
                    `"${(applicant.info_session_status || 'not_registered').replace(/"/g, '""')}"`,
                    `"${(applicant.workshop_status || 'pending').replace(/"/g, '""')}"`,
                    `"${(applicant.program_admission_status || 'pending').replace(/"/g, '""')}"`,
                    `"${(demographics.date_of_birth || '').replace(/"/g, '""')}"`,
                    `"${(demographics.address || '').replace(/"/g, '""')}"`,
                    `"${(demographics.gender || '').replace(/"/g, '""')}"`,
                    `"${(demographics.personal_income || '').replace(/"/g, '""')}"`,
                    `"${(demographics.education_level || '').replace(/"/g, '""')}"`,
                    `"${(demographics.first_gen_college || '').replace(/"/g, '""')}"`,
                    `"${(demographics.race_ethnicity || '').replace(/"/g, '""').replace(/[\[\]]/g, '')}"`,
                    `"${(demographics.english_secondary || '').replace(/"/g, '""')}"`,
                    `"${(demographics.born_outside_us || '').replace(/"/g, '""')}"`,
                    `"${(demographics.parents_born_outside_us || '').replace(/"/g, '""')}"`,
                    `"${(demographics.govt_assistance || '').replace(/"/g, '""')}"`,
                    `"${(demographics.veteran || '').replace(/"/g, '""')}"`,
                    `"${(demographics.communities || '').replace(/"/g, '""')}"`,
                    `"${(demographics.employment_status || '').replace(/"/g, '""')}"`,
                    `"${(demographics.reason_for_applying || '').replace(/"/g, '""')}"`
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `applicants_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error exporting CSV:', error);
            setError('Failed to export CSV. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Info session modal management
    const openCreateInfoSessionModal = () => {
        // Reset form to default values
        setInfoSessionForm({
            title: '',
            description: 'Information session about Pursuit programs',
            start_time: '',
            end_time: '',
            location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
            capacity: 50,
            is_online: false,
            meeting_link: ''
        });
        setEditingInfoSession(null);
        setInfoSessionModalOpen(true);
    };
    const openEditInfoSessionModal = (session) => {
        // Format date and time for datetime-local input
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time || session.start_time);

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = (date) => {
            return date.toISOString().slice(0, 16);
        };

        setInfoSessionForm({
            title: session.event_name,
            description: session.description || '',
            start_time: formatDateForInput(startTime),
            end_time: formatDateForInput(endTime),
            location: session.location || '',
            capacity: session.capacity || 50,
            is_online: session.is_online || false,
            meeting_link: session.meeting_link || '',
            status: session.status || 'scheduled'
        });
        setEditingInfoSession(session.event_id);
        setInfoSessionModalOpen(true);
    };

    const closeInfoSessionModal = () => {
        setInfoSessionModalOpen(false);
        setEditingInfoSession(null);
    };

    const handleInfoSessionFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInfoSessionForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleInfoSessionSubmit = async (e) => {
        e.preventDefault();
        setInfoSessionSubmitting(true);

        try {
            const endpoint = editingInfoSession
                ? `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${editingInfoSession}`
                : `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`;

            const method = editingInfoSession ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(infoSessionForm)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingInfoSession ? 'update' : 'create'} info session`);
            }

            // Refresh info sessions list
            await fetchInfoSessions();
            closeInfoSessionModal();

        } catch (error) {
            console.error('Error submitting info session:', error);
            setError(`Failed to ${editingInfoSession ? 'update' : 'create'} info session. ${error.message}`);
        } finally {
            setInfoSessionSubmitting(false);
        }
    };

    // Workshop modal management
    const openCreateWorkshopModal = () => {
        // Reset form to default values
        setWorkshopForm({
            title: '',
            description: 'Workshop about Pursuit programs and tech careers',
            start_time: '',
            end_time: '',
            location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
            capacity: 50,
            is_online: false,
            meeting_link: '',
            // NEW: Workshop system fields
            cohort_name: 'December 2025 - Workshop',
            workshop_type: 'admissions',
            access_window_days: 0,
            allow_early_access: false
        });
        setEditingWorkshop(null);
        setWorkshopModalOpen(true);
    };

    const openEditWorkshopModal = (workshop) => {
        // Format date and time for datetime-local input
        const startTime = new Date(workshop.start_time);
        const endTime = new Date(workshop.end_time || workshop.start_time);

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = (date) => {
            return date.toISOString().slice(0, 16);
        };

        setWorkshopForm({
            // Event fields
            title: workshop.title || workshop.name || workshop.event_name || '',
            description: workshop.description || '',
            start_time: formatDateForInput(startTime),
            end_time: formatDateForInput(endTime),
            location: workshop.location || '',
            capacity: workshop.capacity || 50,
            is_online: workshop.is_online || false,
            meeting_link: workshop.meeting_link || '',
            status: workshop.status || 'scheduled',
            // Workshop-specific fields
            cohort_name: workshop.cohort_name || 'December 2025 - Workshop',
            workshop_type: workshop.workshop_type || 'admissions',
            organization_id: workshop.organization_id || null,
            access_window_days: workshop.access_window_days || 0,
            allow_early_access: workshop.allow_early_access || false,
            access_code: workshop.access_code || '',
            // Workshop admin fields
            admin_email: workshop.admin_email || '',
            admin_is_pending: workshop.admin_is_pending || false, // Store pending status
            send_admin_invitation: false // Don't auto-check on edit
        });
        setEditingWorkshop(workshop.event_id);
        setWorkshopModalOpen(true);
    };

    const closeWorkshopModal = () => {
        setWorkshopModalOpen(false);
        setEditingWorkshop(null);
    };

    // Configure SweetAlert2 with dark theme
    const darkSwalConfig = {
        background: '#1e2432',
        color: '#ffffff',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        customClass: {
            popup: 'dark-swal-popup',
            title: 'dark-swal-title',
            content: 'dark-swal-content',
            confirmButton: 'dark-swal-confirm-btn',
            cancelButton: 'dark-swal-cancel-btn'
        }
    };
    // Delete handlers with dark mode SweetAlert2 confirmation
    const handleDeleteInfoSession = async (sessionId) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Delete Info Session?',
                text: "This action cannot be undone. All data related to this info session will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                iconColor: '#fbbf24'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${sessionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete info session');
                }

                // Close modal and refresh data
                closeInfoSessionModal();
                await fetchInfoSessions();

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Deleted!',
                    text: 'The info session has been successfully deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            }
        } catch (error) {
            console.error('Error deleting info session:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: error.message || 'Failed to delete info session. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };
    const handleDeleteWorkshop = async (workshopId) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Delete Workshop?',
                text: "This action cannot be undone. All data related to this workshop will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                iconColor: '#fbbf24'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops/${workshopId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete workshop');
                }

                // Close modal and refresh data
                closeWorkshopModal();
                await fetchWorkshops();

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Deleted!',
                    text: 'The workshop has been successfully deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            }
        } catch (error) {
            console.error('Error deleting workshop:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: error.message || 'Failed to delete workshop. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };

    const handleWorkshopFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setWorkshopForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleWorkshopSubmit = async (e) => {
        e.preventDefault();
        setWorkshopSubmitting(true);

        try {
            // Use new workshop endpoint for both create and update
            const endpoint = editingWorkshop
                ? `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops/${editingWorkshop}`
                : `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`;

            const method = editingWorkshop ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workshopForm)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to ${editingWorkshop ? 'update' : 'create'} workshop`);
            }

            const result = await response.json();
            const workshopEventId = result.workshop?.event_id || editingWorkshop;

            // If admin_email is provided for external workshops, assign the workshop admin
            if (workshopForm.workshop_type === 'external' && workshopForm.admin_email && workshopEventId) {
                try {
                    const assignResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops/${workshopEventId}/assign-admin`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                email: workshopForm.admin_email,
                                send_invitation: workshopForm.send_admin_invitation || false
                            })
                        }
                    );

                    if (!assignResponse.ok) {
                        const errorData = await assignResponse.json().catch(() => ({}));
                        console.error('Failed to assign workshop admin:', errorData);
                        // Don't throw - workshop was created successfully, just admin assignment failed
                        setError(`Workshop created, but failed to assign admin: ${errorData.error || 'Unknown error'}`);
                    } else {
                        const assignResult = await assignResponse.json();
                        console.log('✅ Workshop admin assigned:', assignResult);
                    }
                } catch (adminError) {
                    console.error('Error assigning workshop admin:', adminError);
                    // Don't throw - workshop was created successfully
                    setError(`Workshop created, but admin assignment encountered an error`);
                }
            }

            // Refresh workshops list
            await fetchWorkshops();
            closeWorkshopModal();

        } catch (error) {
            console.error('Error submitting workshop:', error);
            setError(`Failed to ${editingWorkshop ? 'update' : 'create'} workshop. ${error.message}`);
        } finally {
            setWorkshopSubmitting(false);
        }
    };
    // Handle viewing registrations for an event
    const handleViewRegistrations = async (eventType, eventId) => {
        if (selectedEvent === eventId) {
            setSelectedEvent(null);
            setEventRegistrations([]);
            return;
        }

        setSelectedEvent(eventId);
        setEventRegistrations([]);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/registrations/${eventType}/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEventRegistrations(data);
            } else {
                console.error('Failed to fetch registrations');
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    // Handle marking attendance  
    const handleMarkAttendance = async (eventType, eventId, applicantId, status) => {
        setAttendanceLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Get the previous status to determine count changes
                // Support both applicant-based and user-based registrations
                const previousRegistration = eventRegistrations.find(reg => {
                    if (applicantId === 'null') {
                        // Match external participants with no applicant_id
                        return !reg.applicant_id && reg.user_id;
                    } else {
                        // Match by applicant_id OR user_id for numeric IDs
                        return reg.applicant_id == applicantId || reg.user_id == applicantId;
                    }
                });
                const previousStatus = previousRegistration?.status;

                // Update the registration in the local state instead of refetching
                // Handle both applicant_id and user_id (for external participants)
                setEventRegistrations(prevRegistrations =>
                    prevRegistrations.map(reg => {
                        // Match by applicant_id OR user_id for numeric IDs, or by user_id existence for 'null'
                        const isMatch = applicantId === 'null' 
                            ? (!reg.applicant_id && reg.user_id)
                            : (reg.applicant_id == applicantId || reg.user_id == applicantId);
                        return isMatch ? { ...reg, status } : reg;
                    })
                );

                // Update the event stats in local state based on status transitions
                const isNewStatusAttended = status === 'attended' || status === 'attended_late' || status === 'very_late';
                const wasPreviousStatusAttended = previousStatus === 'attended' || previousStatus === 'attended_late' || previousStatus === 'very_late';

                let countChange = 0;
                if (isNewStatusAttended && !wasPreviousStatusAttended) {
                    countChange = 1; // Moving to attended status
                } else if (!isNewStatusAttended && wasPreviousStatusAttended) {
                    countChange = -1; // Moving away from attended status
                }
                // If both are attended or both are non-attended, no change needed (countChange = 0)

                if (countChange !== 0) {
                    if (eventType === 'info-session') {
                        setInfoSessions(prevSessions =>
                            prevSessions.map(session =>
                                session.event_id === eventId
                                    ? { ...session, attended_count: parseInt(session.attended_count || 0) + countChange }
                                    : session
                            )
                        );
                    } else if (eventType === 'workshop') {
                        setWorkshops(prevWorkshops =>
                            prevWorkshops.map(workshop =>
                                workshop.event_id === eventId
                                    ? { ...workshop, attended_count: parseInt(workshop.attended_count || 0) + countChange }
                                    : workshop
                            )
                        );
                    }
                }
            } else {
                console.error('Failed to mark attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        } finally {
            setAttendanceLoading(false);
        }
    };

    // Mark attendance helper (legacy - keeping for compatibility)
    const markAttendance = async (eventType, eventId, applicantId, attended) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ attended })
            });

            if (!response.ok) {
                throw new Error('Failed to mark attendance');
            }

            // Refresh data after marking attendance
            await fetchAdmissionsData();

        } catch (error) {
            console.error('Error marking attendance:', error);
            setError('Failed to mark attendance. Please try again.');
        }
    };
    // Handle toggling event active status
    const handleToggleEventActive = async (eventId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${eventId}/toggle-active`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Event active status toggled:', result);

                // Update the local state for both info sessions and workshops
                setInfoSessions(prevSessions =>
                    prevSessions.map(session =>
                        session.event_id === eventId
                            ? { ...session, is_active: result.event.is_active }
                            : session
                    )
                );

                setWorkshops(prevWorkshops =>
                    prevWorkshops.map(workshop =>
                        workshop.event_id === eventId
                            ? { ...workshop, is_active: result.event.is_active }
                            : workshop
                    )
                );

                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Failed to toggle event active status:', errorData);
                setError(`Failed to toggle event status: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error toggling event active status:', error);
            setError('Failed to toggle event status. Please try again.');
        }
    };

    // Manual Registration Handlers
    
    // Open add registration modal
    const openAddRegistrationModal = (eventId, eventType) => {
        setSelectedEventForRegistration(eventId);
        setSelectedEventType(eventType);
        setAddRegistrationModalOpen(true);
        setApplicantSearch('');
        setSearchResults([]);
        setSelectedApplicantsForRegistration([]);
    };
    // Close add registration modal
    const closeAddRegistrationModal = () => {
        setAddRegistrationModalOpen(false);
        setSelectedEventForRegistration(null);
        setSelectedEventType(null);
        setApplicantSearch('');
        setSearchResults([]);
        setSelectedApplicantsForRegistration([]);
        setLaptopNeeds({}); // Reset laptop needs tracking
    };
    // Search for applicants
    const searchApplicants = async (searchTerm) => {
        console.log('🔍 searchApplicants called with:', { searchTerm, length: searchTerm?.length, trimmed: searchTerm?.trim() });
        
        setSearchLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/search?q=${encodeURIComponent(searchTerm)}&eventId=${selectedEventForRegistration}&eventType=${selectedEventType}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Search response received:', data.count, 'applicants');
                setSearchResults(data.applicants || []);
                console.log('🔍 Search results set successfully');
            } else {
                console.error('Failed to search applicants');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching applicants:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle applicant selection for registration
    const toggleApplicantSelection = (applicant) => {
        setSelectedApplicantsForRegistration(prev => {
            const isSelected = prev.some(selected => selected.applicant_id === applicant.applicant_id);
            if (isSelected) {
                return prev.filter(selected => selected.applicant_id !== applicant.applicant_id);
            } else {
                return [...prev, applicant];
            }
        });
    };

    // Register selected applicants
    const registerSelectedApplicants = async () => {
        if (selectedApplicantsForRegistration.length === 0) return;

        setRegistrationLoading(true);
        const results = [];

        try {
            for (const applicant of selectedApplicantsForRegistration) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${selectedEventType}/${selectedEventForRegistration}/register-applicant`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            applicantId: applicant.applicant_id,
                            name: applicant.display_name,
                            email: applicant.email,
                            needsLaptop: laptopNeeds[applicant.applicant_id] || false // Use individual laptop setting
                        })
                    });

                    if (response.ok) {
                        results.push({ applicant, success: true });
                    } else {
                        const errorData = await response.json();
                        results.push({ applicant, success: false, error: errorData.error });
                    }
                } catch (error) {
                    results.push({ applicant, success: false, error: error.message });
                }
            }

            // Show results and refresh data
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.length - successCount;

            if (successCount > 0) {
                // Refresh event registrations to show new registrations
                if (selectedEvent === selectedEventForRegistration) {
                    await handleViewRegistrations(selectedEventType, selectedEventForRegistration);
                }
                // Refresh events list to update counts
                if (selectedEventType === 'info-session') {
                    await fetchInfoSessions();
                } else {
                    await fetchWorkshops();
                }
            }

            if (failureCount > 0) {
                const failureMessages = results.filter(r => !r.success).map(r => `${r.applicant.display_name}: ${r.error}`).join('\n');
                setError(`Some registrations failed:\n${failureMessages}`);
            }

            if (successCount === results.length) {
                closeAddRegistrationModal();
            }

        } catch (error) {
            console.error('Error registering applicants:', error);
            setError('Failed to register applicants. Please try again.');
        } finally {
            setRegistrationLoading(false);
        }
    };
    // Remove/cancel a registration
    const handleRemoveRegistration = async (eventType, eventId, registrationId, applicantName) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Cancel Registration?',
                text: `Are you sure you want to cancel ${applicantName}'s registration? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'Keep Registration',
                iconColor: '#fbbf24'
            });

            if (!result.isConfirmed) {
                return;
            }
        } catch (swalError) {
            console.error('Error showing confirmation dialog:', swalError);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${eventType}/${eventId}/registrations/${registrationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the registration from local state
                setEventRegistrations(prev => 
                    prev.filter(reg => reg.registration_id !== registrationId)
                );

                // Update event counts
                if (eventType === 'info-session') {
                    setInfoSessions(prevSessions =>
                        prevSessions.map(session =>
                            session.event_id === eventId
                                ? { ...session, registration_count: session.registration_count - 1 }
                                : session
                        )
                    );
                } else if (eventType === 'workshop') {
                    setWorkshops(prevWorkshops =>
                        prevWorkshops.map(workshop =>
                            workshop.event_id === eventId
                                ? { ...workshop, registration_count: workshop.registration_count - 1 }
                                : workshop
                        )
                    );
                }

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Registration Cancelled!',
                    text: `${applicantName}'s registration has been successfully cancelled.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Error!',
                    text: `Failed to cancel registration: ${errorData.error}`,
                    icon: 'error',
                    iconColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error cancelling registration:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: 'Failed to cancel registration. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__loading">
                    <div className="admissions-dashboard__loading-spinner"></div>
                    <p>Loading admissions data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={fetchAdmissionsData}
                        className="admissions-dashboard__retry-btn"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No access state
    if (!hasAdminAccess) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__no-access">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view the admissions dashboard.</p>
                </div>
            </div>
        );
    }
    // Decide which stats to show in Overview
    // For "all_time", always use base stats. For other filters, use computed stats if available, otherwise fall back to stats
    const overviewStats = (overviewQuickView === 'all_time' || !computedOverviewStats) ? stats : computedOverviewStats;
    return (
        <div className="admissions-dashboard">
            {/* Tab Navigation */}
            <div className="admissions-dashboard__tabs">
                <button
                    className={`admissions-dashboard__tab ${activeTab === 'overview' ? 'admissions-dashboard__tab--active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                >
                    Overview
                </button>
                <button
                    className={`admissions-dashboard__tab ${activeTab === 'applications' ? 'admissions-dashboard__tab--active' : ''}`}
                    onClick={() => handleTabChange('applications')}
                >
                    Applicants
                </button>
                <button
                    className={`admissions-dashboard__tab ${activeTab === 'info-sessions' ? 'admissions-dashboard__tab--active' : ''}`}
                    onClick={() => handleTabChange('info-sessions')}
                >
                    Info Sessions
                </button>
                <button
                    className={`admissions-dashboard__tab ${activeTab === 'workshops' ? 'admissions-dashboard__tab--active' : ''}`}
                    onClick={() => handleTabChange('workshops')}
                >
                    Workshops
                </button>
                <button
                    className={`admissions-dashboard__tab ${activeTab === 'emails' ? 'admissions-dashboard__tab--active' : ''}`}
                    onClick={() => handleTabChange('emails')}
                >
                    Emails
                </button>
                <button
                    className="admissions-dashboard__back-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            {/* Tab Content */}
            <div className="admissions-dashboard__content">
                {activeTab === 'overview' && (
                    <div className="admissions-dashboard__overview">
                        {/* Overview Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 0' }}>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AI Native Recruitment Dashboard</h2>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <select
                                    id="overview-cohort-filter"
                                    value={overviewQuickView}
                                    onChange={(e) => setOverviewQuickView(e.target.value)}
                                    className="filter-select overview-filter-select"
                                    style={{ minWidth: '180px', padding: '0.5rem' }}
                                >
                                    <option value="all_time">Cohort: All Time</option>
                                    <option value="dec2025">December 2025</option>
                                    <option value="sep2025">September 2025</option>
                                    <option value="deferred">Deferred Applicants</option>
                                </select>
                                <select
                                    id="overview-deliberation-filter"
                                    value={overviewDeliberationFilter}
                                    onChange={(e) => setOverviewDeliberationFilter(e.target.value)}
                                    className="filter-select overview-filter-select"
                                    style={{ minWidth: '180px', padding: '0.5rem' }}
                                >
                                    <option value="">Deliberation: All</option>
                                    <option value="yes">✓ Yes - Planning to Accept</option>
                                    <option value="maybe">? Maybe - Under Review</option>
                                    <option value="no">✗ No - Decline</option>
                                </select>
                                {overviewQuickView === 'dec2025' && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={compareEnabled} 
                                        onChange={(e) => setCompareEnabled(e.target.checked)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span>Compare to Last Cycle</span>
                                </label>
                                )}
                            </div>
                        </div>
                        {loading ? (
                            <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading statistics...</p>
                            </div>
                        ) : error ? (
                            <div className="admissions-dashboard__error">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                                <button onClick={fetchAdmissionsData} className="admissions-dashboard__retry-btn">Retry</button>
                            </div>
                        ) : overviewStats ? (
                            <>
                                {/* KPI Cards in Horizontal Row - 4 or 5 columns depending on Marketing Insights visibility */}
                                <div style={{ display: 'grid', gridTemplateColumns: (overviewQuickView === 'all_time' || overviewQuickView === 'dec2025') ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                    {/* Total Applicants */}
                                    <div className="admissions-dashboard__stat-card" onClick={() => loadApplicationsForTile('total')} style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                        <h3 className="admissions-dashboard__stat-card-title">Total Applicants</h3>
                                    </div>
                                        <div className="admissions-dashboard__stat-card-value" style={{ marginTop: '0.5rem' }}>{(appliedStatusBreakdown?.total ?? overviewStats.totalApplicants) || 0}</div>
                                        {compareEnabled && previousOverviewStats && (() => {
                                            const current = (appliedStatusBreakdown?.total ?? overviewStats.totalApplicants) || 0;
                                            const previous = previousOverviewStats.totalApplicants || 0;
                                            const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                                            const isPositive = change >= 0;
                                            return (
                                                <div style={{ fontSize: '0.9rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                    {isPositive ? '+' : ''}{change.toFixed(0)}%
                                                </div>
                                            );
                                        })()}
                                </div>

                                    {/* Info Session Attendees */}
                                    <div className="admissions-dashboard__stat-card" onClick={() => loadApplicationsForTile('info')} style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                            <h3 className="admissions-dashboard__stat-card-title">Info Session Attendees</h3>
                                    </div>
                                        <div className="admissions-dashboard__stat-card-value" style={{ marginTop: '0.5rem' }}>{overviewStats.infoSessions?.totalAttended || 0}</div>
                                        {compareEnabled && previousOverviewStats && (() => {
                                            const current = overviewStats.infoSessions?.totalAttended || 0;
                                            const previous = previousOverviewStats.infoSessions?.totalAttended || 0;
                                            const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                                            const isPositive = change >= 0;
                                            return (
                                                <div style={{ fontSize: '0.9rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                    {isPositive ? '+' : ''}{change.toFixed(0)}%
                                            </div>
                                            );
                                        })()}
                                </div>

                                    {/* Workshop Participants */}
                                    <div className="admissions-dashboard__stat-card" onClick={() => loadApplicationsForTile('workshops')} style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                            <h3 className="admissions-dashboard__stat-card-title">Workshop Participants</h3>
                                    </div>
                                        <div className="admissions-dashboard__stat-card-value" style={{ marginTop: '0.5rem' }}>{overviewStats.workshops?.totalAttended || 0}</div>
                                        {compareEnabled && previousOverviewStats && (() => {
                                            const current = overviewStats.workshops?.totalAttended || 0;
                                            const previous = previousOverviewStats.workshops?.totalAttended || 0;
                                            const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                                            const isPositive = change >= 0;
                                            return (
                                                <div style={{ fontSize: '0.9rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                    {isPositive ? '+' : ''}{change.toFixed(0)}%
                                    </div>
                                            );
                                        })()}
                                </div>

                                    {/* Offers Extended */}
                                    <div className="admissions-dashboard__stat-card" onClick={() => loadApplicationsForTile('offers')} style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                            <h3 className="admissions-dashboard__stat-card-title">Offers Extended</h3>
                                    </div>
                                        <div className="admissions-dashboard__stat-card-value" style={{ marginTop: '0.5rem' }}>
                                            {(overviewStats.finalStatusCounts || []).find(f => f.status === 'accepted')?.count || 0}
                                    </div>
                                        {compareEnabled && previousOverviewStats ? (() => {
                                            const currentOffers = (overviewStats.finalStatusCounts || []).find(f => f.status === 'accepted')?.count || 0;
                                            const previousOffers = previousOverviewStats.offersExtended || 0;
                                            const change = previousOffers > 0 ? ((currentOffers - previousOffers) / previousOffers) * 100 : 0;
                                            const isPositive = change >= 0;
                                            return (
                                                <div style={{ fontSize: '0.9rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                    {isPositive ? '+' : ''}{change.toFixed(0)}%
                                                </div>
                                            );
                                        })() : (() => {
                                            const total = overviewStats.totalApplicants || 1;
                                            const offers = (overviewStats.finalStatusCounts || []).find(f => f.status === 'accepted')?.count || 0;
                                            return <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                {Math.round((offers / total) * 100)}%
                                            </div>;
                                        })()}
                                </div>

                                    {/* Marketing Insights - Only show for All Time and December 2025 */}
                                    {(overviewQuickView === 'all_time' || overviewQuickView === 'dec2025') && (
                                        <div className="admissions-dashboard__stat-card" onClick={() => loadApplicationsForTile('marketing')} style={{ cursor: 'pointer', zIndex: 1, position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                                <h3 className="admissions-dashboard__stat-card-title">Marketing Insights</h3>
                                    </div>
                                            <div className="admissions-dashboard__stat-card-value" style={{ marginTop: '0.5rem' }}>{emailStats?.total_emails_sent || 0}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                Campaigns Sent
                                            </div>
                                        </div>
                                                )}
                                            </div>

                                {/* Collapsible: Stage selector and demographics grid */}
                                <div style={{ border: '2px solid rgba(75, 61, 237, 0.5)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 900, opacity: 1, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Details</div>
                                        <button
                                            onClick={() => setOverviewDetailsOpen(!overviewDetailsOpen)}
                                            style={{
                                                background: 'transparent',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                color: 'var(--color-text-primary)',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 700
                                            }}
                                        >
                                            {overviewDetailsOpen ? '▼ Hide' : '▲ Show'}
                                        </button>
                                    </div>

                                    {overviewDetailsOpen && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.15)' }}>
                                            <div style={{ display: 'flex', gap: '1.25rem', margin: '0 0 1rem 0', flexWrap: 'wrap' }}>
                                                {[
                                                    { key: 'applied', label: 'Total Applicants' },
                                                    { key: 'info', label: 'Info Session' },
                                                    { key: 'workshops', label: 'Workshop' },
                                                    { key: 'offers', label: 'Offer' },
                                                    { key: 'marketing', label: 'Marketing Insights' }
                                                ].map(s => (
                                                    <button
                                                        key={s.key}
                                                        onClick={() => setActiveOverviewStage(s.key)}
                                                        className={`admissions-dashboard__tab ${activeOverviewStage === s.key ? 'admissions-dashboard__tab--active' : ''}`}
                                                        style={{ padding: '8px 12px' }}
                                                    >
                                                        {s.label}
                                                    </button>
                                        ))}
                                    </div>

                                            {/* Status breakdown for Total Applicants */}
                                            {activeOverviewStage === 'applied' && appliedStatusBreakdown && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.25) 0%, rgba(75, 61, 237, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                        {(() => {
                                                            const total = appliedStatusBreakdown.total || 1;
                                                            const items = [
                                                                { key: 'accounts_created', label: 'Accounts Created', count: appliedStatusBreakdown.accounts_created },
                                                                { key: 'in_progress', label: 'In Progress', count: appliedStatusBreakdown.in_progress },
                                                                { key: 'submitted', label: 'Submitted', count: appliedStatusBreakdown.submitted },
                                                                { key: 'ineligible', label: 'Ineligible', count: appliedStatusBreakdown.ineligible }
                                                            ];
                                                            return items.map(s => (
                                                                <div 
                                                                    key={s.key} 
                                                                    style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '2px solid rgba(75, 61, 237, 0.4)', position: 'relative', cursor: 'pointer' }}
                                                                    onClick={() => loadApplicationsForTile('total', s.key === 'accounts_created' ? 'accounts_created' : s.key)}
                                                                >
                                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>{s.count}</div>
                                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{s.label}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</div>
                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Registration/Attendance breakdown for Info Session */}
                                            {activeOverviewStage === 'info' && overviewStats && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.25) 0%, rgba(75, 61, 237, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                    <input
                                                        type="checkbox"
                                                        style={{ position: 'absolute', top: '1rem', right: '1rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const registered = overviewStats.infoSessions?.totalRegistrations || 0;
                                                            const attended = overviewStats.infoSessions?.totalAttended || 0;
                                                            const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;
                                                            exportToCSV([
                                                                { label: 'Registered', count: registered },
                                                                { label: 'Attended', count: attended },
                                                                { label: 'Attendance Rate', count: attendanceRate }
                                                            ], 'info-session-breakdown', ['label', 'count']);
                                                        }}
                                                    />
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                                        {(() => {
                                                            const registered = overviewStats.infoSessions?.totalRegistrations || 0;
                                                            const attended = overviewStats.infoSessions?.totalAttended || 0;
                                                            const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;
                                                            
                                                            return [
                                                                { key: 'registered', label: 'Registered', count: registered },
                                                                { key: 'attended', label: 'Attended', count: attended },
                                                                { key: 'attendance_rate', label: 'Attendance Rate', count: attendanceRate, isPercentage: true }
                                                            ].map(s => (
                                                                <div 
                                                                    key={s.key} 
                                                                    style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '2px solid rgba(75, 61, 237, 0.4)', position: 'relative', cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        if (s.key === 'registered') {
                                                                            loadApplicationsForTile('info', 'registered');
                                                                        } else if (s.key === 'attended') {
                                                                            loadApplicationsForTile('info', 'attended');
                                                                        }
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '16px', height: '16px', cursor: 'pointer', zIndex: 10 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (s.key === 'registered') {
                                                                                handleExportClick(e, 'info', 'registered', 'info-session-registered', ['applicant_id', 'first_name', 'last_name', 'email', 'info_session_status']);
                                                                            } else if (s.key === 'attended') {
                                                                                handleExportClick(e, 'info', 'attended', 'info-session-attended', ['applicant_id', 'first_name', 'last_name', 'email', 'info_session_status']);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                                                                        {s.isPercentage ? `${s.count}%` : s.count}
                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 800, letterSpacing: '-0.01em' }}>{s.label}</div>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Invitation/Registration/Attendance breakdown for Workshop */}
                                            {activeOverviewStage === 'workshops' && overviewStats && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.25) 0%, rgba(75, 61, 237, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                    <input
                                                        type="checkbox"
                                                        style={{ position: 'absolute', top: '1rem', right: '1rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const workshopInvitations = overviewStats.workshopInvitations || [];
                                                            const invited = workshopInvitations
                                                                .filter(w => w.status && w.status !== 'pending')
                                                                .reduce((sum, w) => sum + (w.count || 0), 0);
                                                            const registered = overviewStats.workshops?.totalRegistrations || 0;
                                                            const attended = overviewStats.workshops?.totalAttended || 0;
                                                            const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;
                                                            exportToCSV([
                                                                { label: 'Invited', count: invited },
                                                                { label: 'Registered', count: registered },
                                                                { label: 'Attended', count: attended },
                                                                { label: 'Attendance Rate', count: attendanceRate }
                                                            ], 'workshop-breakdown', ['label', 'count']);
                                                        }}
                                                    />
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                        {(() => {
                                                            // Calculate invited (all non-pending workshop statuses)
                                                            const workshopInvitations = overviewStats.workshopInvitations || [];
                                                            const invited = workshopInvitations
                                                                .filter(w => w.status && w.status !== 'pending')
                                                                .reduce((sum, w) => sum + (w.count || 0), 0);
                                                            
                                                            const registered = overviewStats.workshops?.totalRegistrations || 0;
                                                            const attended = overviewStats.workshops?.totalAttended || 0;
                                                            const attendanceRate = registered > 0 ? Math.round((attended / registered) * 100) : 0;
                                                            const total = invited || 1; // Use invited as the total pool
                                                            
                                                            return [
                                                                { key: 'invited', label: 'Invited', count: invited },
                                                                { key: 'registered', label: 'Registered', count: registered },
                                                                { key: 'attended', label: 'Attended', count: attended },
                                                                { key: 'attendance_rate', label: 'Attendance Rate', count: attendanceRate, isPercentage: true }
                                                            ].map(s => (
                                                                <div 
                                                                    key={s.key} 
                                                                    style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '2px solid rgba(75, 61, 237, 0.4)', position: 'relative', cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        if (s.key === 'registered') {
                                                                            loadApplicationsForTile('workshops', 'registered');
                                                                        } else if (s.key === 'attended') {
                                                                            loadApplicationsForTile('workshops', 'attended');
                                                                        }
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '16px', height: '16px', cursor: 'pointer', zIndex: 10 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (s.key === 'registered') {
                                                                                handleExportClick(e, 'workshops', 'registered', 'workshop-registered', ['applicant_id', 'first_name', 'last_name', 'email', 'workshop_status']);
                                                                            } else if (s.key === 'attended') {
                                                                                handleExportClick(e, 'workshops', 'attended', 'workshop-attended', ['applicant_id', 'first_name', 'last_name', 'email', 'workshop_status']);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                                                                        {s.isPercentage ? `${s.count}%` : s.count}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{s.label}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</div>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status filter for Total Applicants */}
                                            {activeOverviewStage === 'applied' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Filter:</span>
                                                    <select
                                                        className="filter-select"
                                                        value={applicantStatusFilter}
                                                        onChange={(e) => setApplicantStatusFilter(e.target.value)}
                                                        style={{ minWidth: '180px', padding: '0.5rem' }}
                                                    >
                                                        <option value="all">All Applicants</option>
                                                        <option value="accounts_created">Accounts Created</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="submitted">Submitted</option>
                                                        <option value="ineligible">Ineligible</option>
                                                    </select>
                                                </div>
                                            )}
                                            {/* Assessment breakdown for Submitted applicants */}
                                            {activeOverviewStage === 'applied' && applicantStatusFilter === 'submitted' && submittedAssessmentBreakdown && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                                    {/* Assessment Status Box */}
                                                    <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.25) 0%, rgba(75, 61, 237, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '1rem', right: '1rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const total = submittedAssessmentBreakdown.total || 1;
                                                                exportToCSV([
                                                                    { label: 'Assessed', count: submittedAssessmentBreakdown.assessed, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.assessed / total) * 100) : 0 },
                                                                    { label: 'Pending', count: submittedAssessmentBreakdown.pending, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.pending / total) * 100) : 0 }
                                                                ], 'assessment-status', ['label', 'count', 'percentage']);
                                                            }}
                                                        />
                                                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Assessment Status</h4>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                            {(() => {
                                                                const total = submittedAssessmentBreakdown.total || 1;
                                                                return [
                                                                    { key: 'assessed', label: 'Assessed', count: submittedAssessmentBreakdown.assessed },
                                                                    { key: 'pending', label: 'Pending', count: submittedAssessmentBreakdown.pending }
                                                                ].map(s => (
                                                                    <div 
                                                                        key={s.key} 
                                                                        style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '2px solid rgba(75, 61, 237, 0.4)', position: 'relative', cursor: 'pointer' }}
                                                                        onClick={() => loadApplicationsForTile('submitted', s.key)}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '16px', height: '16px', cursor: 'pointer', zIndex: 10 }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleExportClick(e, 'submitted', s.key, `assessment-${s.key}`, ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'recommendation', 'final_status']);
                                                                            }}
                                                                        />
                                                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>{s.count}</div>
                                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{s.label}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</div>
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Assessment Breakdown Box */}
                                                    <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.25) 0%, rgba(75, 61, 237, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.6)', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '1rem', right: '1rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const total = submittedAssessmentBreakdown.total || 1;
                                                                exportToCSV([
                                                                    { label: 'Strongly Recommended', count: submittedAssessmentBreakdown.strong_recommend, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.strong_recommend / total) * 100) : 0 },
                                                                    { label: 'Recommended', count: submittedAssessmentBreakdown.recommend, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.recommend / total) * 100) : 0 },
                                                                    { label: 'Review Needed', count: submittedAssessmentBreakdown.review_needed, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.review_needed / total) * 100) : 0 },
                                                                    { label: 'Not Recommended', count: submittedAssessmentBreakdown.not_recommend, percentage: total > 0 ? Math.round((submittedAssessmentBreakdown.not_recommend / total) * 100) : 0 }
                                                                ], 'assessment-breakdown', ['label', 'count', 'percentage']);
                                                            }}
                                                        />
                                                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Assessment Breakdown</h4>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                            {(() => {
                                                                const total = submittedAssessmentBreakdown.total || 1;
                                                                return [
                                                                    { key: 'strong_recommend', label: 'Strongly Recommended', count: submittedAssessmentBreakdown.strong_recommend },
                                                                    { key: 'recommend', label: 'Recommended', count: submittedAssessmentBreakdown.recommend },
                                                                    { key: 'review_needed', label: 'Review Needed', count: submittedAssessmentBreakdown.review_needed },
                                                                    { key: 'not_recommend', label: 'Not Recommended', count: submittedAssessmentBreakdown.not_recommend }
                                                                ].map(s => (
                                                                    <div 
                                                                        key={s.key} 
                                                                        style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '2px solid rgba(75, 61, 237, 0.4)', position: 'relative', cursor: 'pointer' }}
                                                                        onClick={() => loadApplicationsForTile('submitted', s.key)}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '16px', height: '16px', cursor: 'pointer', zIndex: 10 }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleExportClick(e, 'submitted', s.key, `assessment-${s.key}`, ['applicant_id', 'first_name', 'last_name', 'email', 'status', 'recommendation', 'final_status']);
                                                                            }}
                                                                        />
                                                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>{s.count}</div>
                                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{s.label}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</div>
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email Type Breakdown for Marketing Insights */}
                                            {activeOverviewStage === 'marketing' && emailStats?.typeBreakdown && emailStats.typeBreakdown.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(75, 61, 237, 0.08)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.4)' }}>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Email Type Breakdown</h4>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', minWidth: '600px' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '3px solid rgba(75, 61, 237, 0.5)', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Email Type</th>
                                                                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', borderBottom: '3px solid rgba(75, 61, 237, 0.5)', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Sent</th>
                                                                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', borderBottom: '3px solid rgba(75, 61, 237, 0.5)', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Queued</th>
                                                                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', borderBottom: '3px solid rgba(75, 61, 237, 0.5)', color: 'var(--color-text-primary)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Avg Sends per Applicant</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {emailStats.typeBreakdown.map((type, idx) => (
                                                                    <tr key={type.email_type} style={{ borderBottom: idx < emailStats.typeBreakdown.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                                                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-primary)', wordBreak: 'break-word', maxWidth: '300px', fontWeight: 600 }}>
                                                                            <span style={{ display: 'inline-block', lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: 'var(--color-text-primary)', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{type.sent_count || 0}</td>
                                                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: 'var(--color-text-primary)', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{type.queued_count || 0}</td>
                                                                        <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: 'var(--color-text-primary)', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                                                                            {parseFloat(type.avg_sends_per_applicant || 0).toFixed(1)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Average Income Block */}
                                            {averageIncome !== null && activeOverviewStage !== 'marketing' && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(75, 61, 237, 0.3) 0%, rgba(75, 61, 237, 0.25) 100%)', borderRadius: '12px', border: '2px solid rgba(75, 61, 237, 0.7)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, rgba(75, 61, 237, 0.9), rgba(75, 61, 237, 1), rgba(75, 61, 237, 0.9))' }}></div>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Average Annual Income</h4>
                                                    <input
                                                        type="checkbox"
                                                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                        onClick={handleIncomeExport}
                                                    />
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #4B3DED 0%, #6366f1 50%, #4B3DED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                                                            ${averageIncome.toLocaleString()}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                            Average annual income for {activeOverviewStage === 'applied' ? 'Total Applicants' : activeOverviewStage === 'info' ? 'Info Session Attendees' : activeOverviewStage === 'workshops' ? 'Workshop Participants' : activeOverviewStage === 'offers' ? 'Offers Extended' : 'Applicants'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Demographics Grid */}
                                            {activeOverviewStage !== 'marketing' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                {/* Race, Gender, Education blocks are rendered below as before */}
                                                {/* Race */}
                                <div className="admissions-dashboard__stat-card demographic-card" style={{ position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                                        <h3 
                                                            className="admissions-dashboard__stat-card-title" 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                            onClick={() => handleDemographicTitleClick('race')}
                                                        >
                                                            {activeOverviewStage === 'info' ? 'Info Session Attendees by Race' : activeOverviewStage === 'workshops' ? 'Workshop Participants by Race' : activeOverviewStage === 'assessment' ? 'Assessment Completed by Race' : activeOverviewStage === 'offers' ? 'Offers by Race' : 'Applicants by Race'}
                                                        </h3>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => handleDemographicExport(e, 'race', null, `race-${activeOverviewStage || 'all'}`)}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {(() => {
                                                            const data = stageDemographics.race || [];
                                                            const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
                                                            const cleanLabel = (label) => {
                                                                if (!label) return 'Unknown';
                                                                let cleaned = label.toString().trim();
                                                                // Try to parse as JSON array first (e.g., '["Hispanic or Latino"]')
                                                                try {
                                                                    const parsed = JSON.parse(cleaned);
                                                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                                                        cleaned = parsed[0].toString();
                                                                    }
                                                                } catch (e) {
                                                                    // Not JSON, continue with string cleaning
                                                                }
                                                                // Remove brackets, quotes, and extra whitespace
                                                                cleaned = cleaned
                                                                    .replace(/^\[+/g, '') // Remove leading brackets
                                                                    .replace(/\]+$/g, '') // Remove trailing brackets
                                                                    .replace(/^["']+/g, '') // Remove leading quotes
                                                                    .replace(/["']+$/g, '') // Remove trailing quotes
                                                                    .trim();
                                                                return cleaned || 'Unknown';
                                                            };
                                                            return data.slice(0, 8).map((d, idx) => {
                                                                const cleanedLabel = cleanLabel(d.label);
                                                                return (
                                                                <div 
                                                                    key={`race-${idx}`} 
                                                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0.875rem', background: 'rgba(75, 61, 237, 0.05)', borderRadius: '8px', border: '1px solid rgba(75, 61, 237, 0.15)', minWidth: 0, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                                                                    onClick={() => handleDemographicValueClick('race', cleanedLabel)}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.15)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.05)'}
                                                                >
                                                                    <div style={{ height: '8px', width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '4px', position: 'relative', overflow: 'hidden', marginTop: '4px' }}>
                                                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round((d.count/total)*100)}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '4px' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.01em', color: 'var(--color-text-primary)', wordBreak: 'break-word', lineHeight: '1.4' }}>{cleanedLabel}</span>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                                            <span style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>{Math.round((d.count/total)*100)}%</span>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '-0.01em' }}>{d.count}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                );
                                                            });
                                                        })()}
                                    </div>
                                </div>

                                                {/* Gender */}
                                <div className="admissions-dashboard__stat-card demographic-card" style={{ position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                                        <h3 
                                                            className="admissions-dashboard__stat-card-title" 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                            onClick={() => handleDemographicTitleClick('gender')}
                                                        >
                                                            {activeOverviewStage === 'info' ? 'Info Session Attendees by Gender' : activeOverviewStage === 'workshops' ? 'Workshop Participants by Gender' : activeOverviewStage === 'assessment' ? 'Assessment Completed by Gender' : activeOverviewStage === 'offers' ? 'Offers by Gender' : 'Applicants by Gender'}
                                                        </h3>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => handleDemographicExport(e, 'gender', null, `gender-${activeOverviewStage || 'all'}`)}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {(() => {
                                                            const data = stageDemographics.gender || [];
                                                            const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
                                                            return data.slice(0, 8).map((d, idx) => (
                                                                <div 
                                                                    key={`gender-${idx}`} 
                                                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0.875rem', background: 'rgba(75, 61, 237, 0.05)', borderRadius: '8px', border: '1px solid rgba(75, 61, 237, 0.15)', minWidth: 0, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                                                                    onClick={() => handleDemographicValueClick('gender', d.label)}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.15)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.05)'}
                                                                >
                                                                    <div style={{ height: '8px', width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '4px', position: 'relative', overflow: 'hidden', marginTop: '4px' }}>
                                                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round((d.count/total)*100)}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', borderRadius: '4px' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.01em', color: 'var(--color-text-primary)', wordBreak: 'break-word', lineHeight: '1.4' }}>{d.label || 'Unknown'}</span>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                                            <span style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>{Math.round((d.count/total)*100)}%</span>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '-0.01em' }}>{d.count}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                </div>

                                                {/* Education */}
                                <div className="admissions-dashboard__stat-card demographic-card" style={{ position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                                        <h3 
                                                            className="admissions-dashboard__stat-card-title" 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                            onClick={() => handleDemographicTitleClick('education')}
                                                        >
                                                            {activeOverviewStage === 'info' ? 'Info Session Attendees by Education' : activeOverviewStage === 'workshops' ? 'Workshop Participants by Education' : activeOverviewStage === 'assessment' ? 'Assessment Completed by Education' : activeOverviewStage === 'offers' ? 'Offers by Education' : 'Applicants by Education'}
                                                        </h3>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => handleDemographicExport(e, 'education', null, `education-${activeOverviewStage || 'all'}`)}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                        {(() => {
                                                            const data = stageDemographics.education || [];
                                                            const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
                                                            return data.slice(0, 8).map((d, idx) => (
                                                                <div 
                                                                    key={`edu-${idx}`} 
                                                                    style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'rgba(75, 61, 237, 0.05)', borderRadius: '8px', border: '1px solid rgba(75, 61, 237, 0.15)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                                                                    onClick={() => handleDemographicValueClick('education', d.label)}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.15)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.05)'}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div style={{ height: '6px', width: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', position: 'relative' }}>
                                                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round((d.count/total)*100)}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)', borderRadius: '4px' }} />
                                            </div>
                                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>{d.label || 'Unknown'}</span>
                                    </div>
                                                                    <span style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{Math.round((d.count/total)*100)}% ({d.count})</span>
                                </div>
                                                            ));
                                                        })()}
                            </div>
                                                </div>

                                                {/* Age */}
                                <div className="admissions-dashboard__stat-card demographic-card" style={{ position: 'relative' }}>
                                    <div className="admissions-dashboard__stat-card-header" style={{ position: 'relative' }}>
                                                        <h3 
                                                            className="admissions-dashboard__stat-card-title" 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                            onClick={() => handleDemographicTitleClick('age')}
                                                        >
                                                            {activeOverviewStage === 'info' ? 'Info Session Attendees by Age' : activeOverviewStage === 'workshops' ? 'Workshop Participants by Age' : activeOverviewStage === 'assessment' ? 'Assessment Completed by Age' : activeOverviewStage === 'offers' ? 'Offers by Age' : 'Applicants by Age'}
                                                        </h3>
                                                        <input
                                                            type="checkbox"
                                                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '18px', height: '18px', cursor: 'pointer', zIndex: 10 }}
                                                            onClick={(e) => handleDemographicExport(e, 'age', null, `age-${activeOverviewStage || 'all'}`)}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {(() => {
                                                            const data = stageDemographics.age || [];
                                                            const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
                                                            return data.map((d, idx) => (
                                                                <div 
                                                                    key={`age-${idx}`} 
                                                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0.875rem', background: 'rgba(75, 61, 237, 0.05)', borderRadius: '8px', border: '1px solid rgba(75, 61, 237, 0.15)', minWidth: 0, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                                                                    onClick={() => handleDemographicValueClick('age', d.label)}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.15)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 61, 237, 0.05)'}
                                                                >
                                                                    <div style={{ height: '8px', width: '90px', flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '4px', position: 'relative', overflow: 'hidden', marginTop: '4px' }}>
                                                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round((d.count/total)*100)}%`, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', borderRadius: '4px' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                                                        <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.01em', color: 'var(--color-text-primary)', wordBreak: 'break-word', lineHeight: '1.4' }}>{d.label || 'Unknown'}</span>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                                            <span style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.01em', color: 'var(--color-text-primary)' }}>{Math.round((d.count/total)*100)}%</span>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '-0.01em' }}>{d.count}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ));
                                                        })()}
                                    </div>
                                                </div>

                                            </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="admissions-dashboard__no-data">
                                <p>No statistics available</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'applications' && (
                    <div className="admissions-dashboard__applications">
                        <div className="data-section__header">
                            <div className="data-section__controls">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={nameSearchInput}
                                    onChange={(e) => setNameSearchInput(e.target.value)}
                                    className="name-search-input"
                                    style={{ width: '250px' }}
                                />
                                <select
                                    value={applicationFilters.cohort_id || ''}
                                    onChange={(e) => setApplicationFilters({ ...applicationFilters, cohort_id: e.target.value, offset: 0 })}
                                    className="filter-select cohort-filter"
                                >
                                    <option value="">Cohort: All Time</option>
                                    {cohorts.map(cohort => (
                                        <option key={cohort.cohort_id} value={cohort.cohort_id}>
                                            {cohort.name}
                                        </option>
                                    ))}
                                    <option value="deferred">Deferred Applications</option>
                                </select>
                                <div style={{ position: 'relative' }} data-column-toggle>
                                    <button
                                        className="admissions-dashboard__column-toggle-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenFilterColumn(openFilterColumn === 'columns' ? null : 'columns');
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        ⚙️ Columns
                                    </button>
                                    {openFilterColumn === 'columns' && (
                                        <div 
                                            data-column-toggle
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '8px',
                                                backgroundColor: 'var(--color-background-dark)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '4px',
                                                padding: '12px',
                                                zIndex: 1000,
                                                minWidth: '200px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>Toggle Columns</div>
                                            {Object.keys(visibleColumns).map(column => (
                                                <label 
                                                    key={column}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumns[column]}
                                                        onChange={(e) => {
                                                            setVisibleColumns({
                                                                ...visibleColumns,
                                                                [column]: e.target.checked
                                                            });
                                                        }}
                                                    />
                                                    <span>{column.charAt(0).toUpperCase() + column.slice(1).replace('_', ' ')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="admissions-dashboard__bulk-actions-btn"
                                    disabled={selectedApplicants.length === 0}
                                    onClick={() => setBulkActionsModalOpen(true)}
                                >
                                    Actions ({selectedApplicants.length})
                                </button>
                                <button
                                    className="admissions-dashboard__export-csv-btn"
                                    disabled={selectedApplicants.length === 0}
                                    onClick={handleExportCSV}
                                >
                                    Export CSV ({selectedApplicants.length})
                                </button>
                                <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="admissions-dashboard__loading">
                                <div className="admissions-dashboard__loading-spinner"></div>
                                <p>Loading applicants...</p>
                            </div>
                        ) : applications?.applications?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="admissions-dashboard__checkbox-column">
                                                <input
                                                    type="checkbox"
                                                    className="admissions-dashboard__select-all-checkbox"
                                                    checked={selectedApplicants.length === applications.applications?.length && applications.applications?.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedApplicants(applications.applications?.map(app => app.applicant_id) || []);
                                                        } else {
                                                            setSelectedApplicants([]);
                                                        }
                                                    }}
                                                />
                                            </th>
                                            {visibleColumns.name && (
                                                <th className="sortable-header" onClick={() => handleColumnSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>Name</span>
                                                        <span style={{ fontSize: '1rem', opacity: 0.6 }}>
                                                            {columnSort.column === 'name' ? (columnSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                        </span>
                                                    </div>
                                                </th>
                                            )}
                                            {visibleColumns.email && <th>Email</th>}
                                            {visibleColumns.phone && <th>Phone</th>}
                                            {visibleColumns.status && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span 
                                                            onClick={() => handleColumnSort('status')} 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                        >
                                                            Status
                                                        </span>
                                                    <span 
                                                        onClick={() => handleColumnSort('status')}
                                                        style={{ fontSize: '1rem', opacity: 0.6, cursor: 'pointer' }}
                                                    >
                                                        {columnSort.column === 'status' ? (columnSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenFilterColumn(openFilterColumn === 'status' ? null : 'status');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            fontSize: '0.9rem',
                                                            opacity: applicationFilters.status ? 1 : 0.5,
                                                            color: applicationFilters.status ? '#4242ea' : 'inherit'
                                                        }}
                                                    >
                                                        ☰
                                                    </button>
                                                </div>
                                                {openFilterColumn === 'status' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        backgroundColor: 'var(--color-background-dark)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        zIndex: 1000,
                                                        minWidth: '150px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                    }}>
                                                        {['', 'no_application', 'in_progress', 'submitted', 'ineligible'].map(value => (
                                                            <div
                                                                key={value}
                                                                onClick={() => {
                                                                    setApplicationFilters({ ...applicationFilters, status: value });
                                                                    setOpenFilterColumn(null);
                                                                }}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: applicationFilters.status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                            >
                                                                {value === '' ? 'All' : value === 'no_application' ? 'Account Created' : value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </th>
                                            )}
                                            {visibleColumns.assessment && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span 
                                                            onClick={() => handleColumnSort('assessment')} 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                        >
                                                            Assessment
                                                        </span>
                                                    <span 
                                                        onClick={() => handleColumnSort('assessment')}
                                                        style={{ fontSize: '1rem', opacity: 0.6, cursor: 'pointer' }}
                                                    >
                                                        {columnSort.column === 'assessment' ? (columnSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenFilterColumn(openFilterColumn === 'assessment' ? null : 'assessment');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            fontSize: '0.9rem',
                                                            opacity: applicationFilters.recommendation ? 1 : 0.5,
                                                            color: applicationFilters.recommendation ? '#4242ea' : 'inherit'
                                                        }}
                                                    >
                                                        ☰
                                                    </button>
                                                </div>
                                                {openFilterColumn === 'assessment' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        backgroundColor: 'var(--color-background-dark)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        zIndex: 1000,
                                                        minWidth: '170px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                    }}>
                                                        {['', 'strong_recommend', 'recommend', 'review_needed', 'not_recommend'].map(value => (
                                                            <div
                                                                key={value}
                                                                onClick={() => {
                                                                    setApplicationFilters({ ...applicationFilters, recommendation: value });
                                                                    setOpenFilterColumn(null);
                                                                }}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: applicationFilters.recommendation === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.recommendation === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                            >
                                                                {value === '' ? 'All' : value === 'strong_recommend' ? 'Strong Recommend' : value === 'review_needed' ? 'Review Needed' : value === 'not_recommend' ? 'Not Recommend' : 'Recommend'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </th>
                                            )}
                                            {visibleColumns.info_session && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span 
                                                            onClick={() => handleColumnSort('info_session')} 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                        >
                                                            Info Session
                                                        </span>
                                                    <span 
                                                        onClick={() => handleColumnSort('info_session')}
                                                        style={{ fontSize: '1rem', opacity: 0.6, cursor: 'pointer' }}
                                                    >
                                                        {columnSort.column === 'info_session' ? (columnSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenFilterColumn(openFilterColumn === 'info_session' ? null : 'info_session');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            fontSize: '0.9rem',
                                                            opacity: applicationFilters.info_session_status ? 1 : 0.5,
                                                            color: applicationFilters.info_session_status ? '#4242ea' : 'inherit'
                                                        }}
                                                    >
                                                        ☰
                                                    </button>
                                                </div>
                                                {openFilterColumn === 'info_session' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        backgroundColor: 'var(--color-background-dark)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        zIndex: 1000,
                                                        minWidth: '150px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                    }}>
                                                        {['', 'not_registered', 'registered', 'attended', 'no_show'].map(value => (
                                                            <div
                                                                key={value}
                                                                onClick={() => {
                                                                    setApplicationFilters({ ...applicationFilters, info_session_status: value });
                                                                    setOpenFilterColumn(null);
                                                                }}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: applicationFilters.info_session_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.info_session_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                            >
                                                                {value === '' ? 'All' : value === 'not_registered' ? 'Not Registered' : value === 'no_show' ? 'No Show' : value.charAt(0).toUpperCase() + value.slice(1)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </th>
                                            )}
                                            {visibleColumns.workshop && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span 
                                                            onClick={() => handleColumnSort('workshop')} 
                                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                                        >
                                                            Workshop
                                                        </span>
                                                    <span 
                                                        onClick={() => handleColumnSort('workshop')}
                                                        style={{ fontSize: '1rem', opacity: 0.6, cursor: 'pointer' }}
                                                    >
                                                        {columnSort.column === 'workshop' ? (columnSort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenFilterColumn(openFilterColumn === 'workshop' ? null : 'workshop');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            fontSize: '0.9rem',
                                                            opacity: applicationFilters.workshop_status ? 1 : 0.5,
                                                            color: applicationFilters.workshop_status ? '#4242ea' : 'inherit'
                                                        }}
                                                    >
                                                        ☰
                                                    </button>
                                                </div>
                                                {openFilterColumn === 'workshop' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        backgroundColor: 'var(--color-background-dark)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        zIndex: 1000,
                                                        minWidth: '150px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                    }}>
                                                        {['', 'pending', 'invited', 'registered', 'attended', 'no_show'].map(value => (
                                                            <div
                                                                key={value}
                                                                onClick={() => {
                                                                    setApplicationFilters({ ...applicationFilters, workshop_status: value });
                                                                    setOpenFilterColumn(null);
                                                                }}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: applicationFilters.workshop_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.workshop_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                            >
                                                                {value === '' ? 'All' : value === 'no_show' ? 'No Show' : value.charAt(0).toUpperCase() + value.slice(1)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </th>
                                            )}
                                            {visibleColumns.admission && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>Admission</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenFilterColumn(openFilterColumn === 'admission' ? null : 'admission');
                                                            }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            fontSize: '0.9rem',
                                                            opacity: applicationFilters.program_admission_status ? 1 : 0.5,
                                                            color: applicationFilters.program_admission_status ? '#4242ea' : 'inherit'
                                                        }}
                                                    >
                                                        ☰
                                                    </button>
                                                </div>
                                                {openFilterColumn === 'admission' && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        backgroundColor: 'var(--color-background-dark)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        zIndex: 1000,
                                                        minWidth: '150px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                    }}>
                                                        {['', 'pending', 'accepted', 'rejected', 'waitlisted'].map(value => (
                                                            <div
                                                                key={value}
                                                                onClick={() => {
                                                                    setApplicationFilters({ ...applicationFilters, program_admission_status: value });
                                                                    setOpenFilterColumn(null);
                                                                }}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: applicationFilters.program_admission_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.program_admission_status === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                            >
                                                                {value === '' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </th>
                                            )}
                                            {visibleColumns.deliberation && (
                                                <th style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>Deliberation</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenFilterColumn(openFilterColumn === 'deliberation' ? null : 'deliberation');
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                fontSize: '0.9rem',
                                                                opacity: applicationFilters.deliberation ? 1 : 0.5,
                                                                color: applicationFilters.deliberation ? '#4242ea' : 'inherit'
                                                            }}
                                                        >
                                                            ☰
                                                        </button>
                                                    </div>
                                                    {openFilterColumn === 'deliberation' && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            backgroundColor: 'var(--color-background-dark)',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            borderRadius: '4px',
                                                            padding: '8px',
                                                            zIndex: 1000,
                                                            minWidth: '150px',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                                        }}>
                                                            {['', 'yes', 'maybe', 'no', 'null'].map(value => (
                                                                <div
                                                                    key={value}
                                                                    onClick={() => {
                                                                        setApplicationFilters({ ...applicationFilters, deliberation: value });
                                                                        setOpenFilterColumn(null);
                                                                    }}
                                                                    style={{
                                                                        padding: '8px 12px',
                                                                        cursor: 'pointer',
                                                                        backgroundColor: applicationFilters.deliberation === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                                                    onMouseLeave={(e) => e.target.style.backgroundColor = applicationFilters.deliberation === value ? 'rgba(66, 66, 234, 0.2)' : 'transparent'}
                                                                >
                                                                    {value === '' ? 'All' : value === 'null' ? 'Not Set' : value.charAt(0).toUpperCase() + value.slice(1)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </th>
                                            )}
                                            {visibleColumns.age && <th>Age</th>}
                                            {visibleColumns.gender && <th>Gender</th>}
                                            {visibleColumns.race && <th>Race</th>}
                                            {visibleColumns.education && <th>Education</th>}
                                            {visibleColumns.referral && <th>Referral</th>}
                                            {visibleColumns.notes && <th>Notes</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortAndFilterApplications(applications.applications).map((app) => (
                                            <tr
                                                key={app.applicant_id}
                                                className={`clickable-row ${selectedApplicants.includes(app.applicant_id) ? 'admissions-dashboard__row--selected' : ''}`}
                                            >
                                                <td className="admissions-dashboard__checkbox-column">
                                                    <input
                                                        type="checkbox"
                                                        className="admissions-dashboard__row-checkbox"
                                                        checked={selectedApplicants.includes(app.applicant_id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            if (e.target.checked) {
                                                                setSelectedApplicants([...selectedApplicants, app.applicant_id]);
                                                            } else {
                                                                setSelectedApplicants(selectedApplicants.filter(id => id !== app.applicant_id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                {visibleColumns.name && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        <div className="applicant-name">
                                                            {app.full_name || `${app.first_name} ${app.last_name}`}
                                                            {app.has_masters_degree && (
                                                                <span className="admissions-dashboard__masters-flag" title="Has Masters Degree">🎓</span>
                                                            )}
                                                            {app.missing_count > 0 && (
                                                                <span className="admissions-dashboard__missing-flag" title={`${app.missing_count} key questions incomplete`}>
                                                                    ⚠️ {app.missing_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.email && (
                                                    <td className="clickable-cell">
                                                        <span
                                                            className="copyable-email"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEmailClick(app.email);
                                                            }}
                                                            title="Click to copy email"
                                                        >
                                                            {app.email}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.phone && (
                                                    <td className="clickable-cell">
                                                        <span
                                                            className="copyable-phone"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePhoneClick(app.phone_number);
                                                            }}
                                                            title="Click to copy phone number"
                                                        >
                                                            {formatPhoneNumber(app.phone_number)}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td
                                                    onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className={app.application_id ? "clickable-cell" : ""}
                                                    style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                >
                                                    <span className={`status-badge status-badge--${app.status}`}>
                                                        {app.status === 'no_application' ? 'Account Created' : app.status === 'in_progress' ? 'In Progress' : app.status}
                                                    </span>
                                                </td>
                                                )}
                                                {visibleColumns.assessment && (
                                                    <td className="admissions-dashboard__assessment-cell">
                                                    <div className="admissions-dashboard__assessment-container">
                                                        {app.final_status || app.recommendation ? (
                                                            <select
                                                                className={`admissions-dashboard__assessment-select assessment-badge--${app.final_status || app.recommendation}`}
                                                                value={app.final_status || app.recommendation}
                                                                onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="strong_recommend">Strong Recommend</option>
                                                                <option value="recommend">Recommend</option>
                                                                <option value="review_needed">Review Needed</option>
                                                                <option value="not_recommend">Not Recommend</option>
                                                            </select>
                                                        ) : (
                                                            <span className="assessment-badge assessment-badge--pending">
                                                                pending
                                                            </span>
                                                        )}
                                                        {app.has_human_override && (
                                                            <span className="admissions-dashboard__override-indicator" title="Human override applied">🔀</span>
                                                        )}
                                                    </div>
                                                </td>
                                                )}
                                                {visibleColumns.info_session && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        <span className={`info-session-badge info-session-badge--${app.info_session_status || 'not_registered'}`}>
                                                            {(app.info_session_status || 'not_registered').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.workshop && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        <span className={`workshop-badge workshop-badge--${app.workshop_status || 'pending'}`}>
                                                            {(app.workshop_status || 'pending').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.admission && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        <span className={`admission-badge admission-badge--${app.program_admission_status || 'pending'}`}>
                                                            {(app.program_admission_status || 'pending').replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.deliberation && (
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={app.deliberation || ''}
                                                            onChange={(e) => handleDeliberationChange(app.applicant_id, e.target.value || null)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '4px',
                                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                                backgroundColor: 
                                                                    app.deliberation === 'yes' ? 'rgba(16, 185, 129, 0.2)' :
                                                                    app.deliberation === 'maybe' ? 'rgba(251, 191, 36, 0.2)' :
                                                                    app.deliberation === 'no' ? 'rgba(239, 68, 68, 0.2)' :
                                                                    'rgba(107, 114, 128, 0.2)',
                                                                color: 'var(--color-text-primary)',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        >
                                                            <option value="">Not Set</option>
                                                            <option value="yes">Yes</option>
                                                            <option value="maybe">Maybe</option>
                                                            <option value="no">No</option>
                                                        </select>
                                                    </td>
                                                )}
                                                {visibleColumns.age && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        {app.date_of_birth ? new Date().getFullYear() - new Date(app.date_of_birth).getFullYear() : 'N/A'}
                                                    </td>
                                                )}
                                                {visibleColumns.gender && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        {app.gender || 'N/A'}
                                                    </td>
                                                )}
                                                {visibleColumns.race && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        {(() => {
                                                            if (!app.race_ethnicity) return 'N/A';
                                                            try {
                                                                const parsed = JSON.parse(app.race_ethnicity);
                                                                if (Array.isArray(parsed)) {
                                                                    return parsed.join(', ');
                                                                }
                                                                return parsed;
                                                            } catch (e) {
                                                                // Not JSON, return as-is
                                                                return app.race_ethnicity;
                                                            }
                                                        })()}
                                                    </td>
                                                )}
                                                {visibleColumns.education && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        {app.education_level || 'N/A'}
                                                    </td>
                                                )}
                                                {visibleColumns.referral && (
                                                    <td
                                                        onClick={() => app.application_id && navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                        className={app.application_id ? "clickable-cell" : ""}
                                                        style={{ cursor: app.application_id ? 'pointer' : 'default' }}
                                                    >
                                                        {app.referral_source || 'N/A'}
                                                    </td>
                                                )}
                                                {visibleColumns.notes && (
                                                    <td>
                                                        <button
                                                            className="notes-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openNotesModal({
                                                                    applicant_id: app.applicant_id,
                                                                    name: app.full_name || `${app.first_name} ${app.last_name}`
                                                                });
                                                            }}
                                                        >
                                                            Notes
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="table-footer">
                                    <span className="table-count">
                                        Showing {applications.applications.length} of {applications.total} applicants
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No applicants found</p>
                                {(applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation || applicationFilters.name_search || nameSearchInput) && (
                                    <button
                                        onClick={() => {
                                            setNameSearchInput('');
                                            setApplicationFilters({ 
                                                status: '', 
                                                info_session_status: '', 
                                                workshop_status: '', 
                                                program_admission_status: '', 
                                                ready_for_workshop_invitation: false,
                                                name_search: '',
                                                cohort_id: cohorts.length > 0 ? cohorts[0].cohort_id : '',
                                                limit: applicationFilters.limit,
                                                offset: 0
                                            });
                                        }}
                                        className="clear-filter-btn"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'info-sessions' && (
                    <div className="admissions-dashboard__info-sessions">
                        <div className="data-section__header">
                            <h2>Info Sessions Management</h2>
                            <div className="data-section__actions">
                                <button
                                    onClick={openCreateInfoSessionModal}
                                    className="create-btn"
                                >
                                    Create New Session
                                </button>
                                <button
                                    onClick={fetchInfoSessions}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading info sessions...</p>
                            </div>
                        ) : getFilteredInfoSessions()?.length > 0 ? (
                            <div className="data-table-container">
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
                                        {sortEventsByDate(getFilteredInfoSessions()).map((session) => (
                                            <React.Fragment key={session.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {session.event_name}
                                                        {isEventPast(session.event_date, session.event_time) && (
                                                            <span className="event-status event-status--past">Past Event</span>
                                                        )}
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
                                                            <button
                                                                className={`active-toggle-btn ${session.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`}
                                                                onClick={() => handleToggleEventActive(session.event_id)}
                                                                title={session.is_active ? 'Click to deactivate event' : 'Click to activate event'}
                                                            >
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${session.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {session.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => openEditInfoSessionModal(session)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="view-registrations-btn"
                                                            onClick={() => handleViewRegistrations('info-session', session.event_id)}
                                                        >
                                                            {selectedEvent === session.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {selectedEvent === session.event_id && (
                                                    <tr className="registrations-row">
                                                        <td colSpan="6" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button
                                                                        className="add-registration-btn"
                                                                        onClick={() => openAddRegistrationModal(session.event_id, 'info-session')}
                                                                        title="Add registration"
                                                                    >
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllEmails}
                                                                                            title="Copy all emails"
                                                                                        >
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllPhoneNumbers}
                                                                                            title="Copy all phone numbers"
                                                                                        >
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-email"
                                                                                                onClick={() => handleEmailClick(reg.email)}
                                                                                                title="Click to copy email"
                                                                                            >
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-phone"
                                                                                                onClick={() => handlePhoneClick(reg.phone_number)}
                                                                                                title="Click to copy phone number"
                                                                                            >
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className={`attendance-status-dropdown-unified status-${reg.status}`}
                                                                                                value={reg.status}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.value !== reg.status) {
                                                                                                        handleMarkAttendance('info-session', session.event_id, reg.applicant_id, e.target.value);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button
                                                                                                className="remove-registration-btn"
                                                                                                onClick={() => handleRemoveRegistration('info-session', session.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
                                                                                                title="Cancel registration"
                                                                                            >
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <p>No registrations found</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No info sessions found</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'workshops' && (
                    <div className="admissions-dashboard__workshops">
                        <div className="data-section__header">
                            <h2>Workshops Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input
                                            type="checkbox"
                                            checked={showInactiveWorkshops}
                                            onChange={(e) => setShowInactiveWorkshops(e.target.checked)}
                                            className="event-filter-checkbox"
                                        />
                                        Show inactive events
                                    </label>
                                </div>
                                <button
                                    onClick={openCreateWorkshopModal}
                                    className="create-btn"
                                >
                                    Create New Workshop
                                </button>
                                <button
                                    onClick={fetchWorkshops}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading workshops...</p>
                            </div>
                        ) : getFilteredWorkshops()?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table events-table" style={{ fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Type</th>
                                            <th>Access Code</th>
                                            <th>Cohort</th>
                                            <th>Date & Time</th>
                                            <th style={{ width: '70px', textAlign: 'center' }}>Registered</th>
                                            <th style={{ width: '70px', textAlign: 'center' }}>Attended</th>
                                            <th style={{ width: '70px', textAlign: 'center' }}>Laptops</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>Active</th>
                                            <th style={{ width: '180px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredWorkshops()).map((workshop) => (
                                            <React.Fragment key={workshop.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {workshop.event_name || workshop.name || workshop.title}
                                                        {isEventPast(workshop.start_date, workshop.start_time) && (
                                                            <span className="event-status event-status--past">Past Event</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className={`workshop-type-badge ${
                                                                workshop.workshop_type === 'admissions' 
                                                                    ? 'workshop-type-badge--admissions' 
                                                                    : 'workshop-type-badge--external'
                                                            }`}
                                                            style={{
                                                                display: 'inline-block',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '500',
                                                                backgroundColor: workshop.workshop_type === 'admissions' ? '#3b82f6' : '#8b5cf6',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {workshop.workshop_type === 'admissions' ? 'Admissions' : 'External'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {workshop.workshop_type === 'external' && workshop.access_code ? (
                                                            <code 
                                                                className="copyable-code"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    copyToClipboard(workshop.access_code, 'Access code');
                                                                }}
                                                                title="Click to copy access code"
                                                                style={{ 
                                                                    backgroundColor: '#374151', 
                                                                    padding: '3px 8px', 
                                                                    borderRadius: '4px',
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '0.75rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
                                                            >
                                                                {workshop.access_code}
                                                            </code>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{ color: '#9ca3af' }}>
                                                            {workshop.cohort_name || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {(() => {
                                                                    // Database stores dates AS EST - extract date portion directly
                                                                    const dateMatch = workshop.start_time.match(/(\d{4})-(\d{2})-(\d{2})/);
                                                                    if (dateMatch) {
                                                                        const [_, year, month, day] = dateMatch;
                                                                        const date = new Date(year, parseInt(month) - 1, day);
                                                                        return date.toLocaleDateString('en-US', {
                                                                            weekday: 'short',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        });
                                                                    }
                                                                    return 'Invalid date';
                                                                })()}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(workshop.start_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell" style={{ textAlign: 'center' }}>
                                                        <span className="stat-number">{workshop.total_participants || 0}</span>
                                                    </td>
                                                    <td className="stat-cell" style={{ textAlign: 'center' }}>
                                                        <span className="stat-number stat-number--attended">{workshop.attended_count || 0}</span>
                                                    </td>
                                                    <td className="stat-cell" style={{ textAlign: 'center' }}>
                                                        <span className="stat-number stat-number--laptops">
                                                            {workshop.laptop_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button
                                                                className={`active-toggle-btn ${workshop.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`}
                                                                onClick={() => handleToggleEventActive(workshop.event_id)}
                                                                title={workshop.is_active ? 'Click to deactivate event' : 'Click to activate event'}
                                                            >
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${workshop.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {workshop.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="edit-btn"
                                                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                                            onClick={() => openEditWorkshopModal(workshop)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="view-registrations-btn"
                                                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                                            onClick={() => handleViewRegistrations('workshop', workshop.event_id)}
                                                        >
                                                            {selectedEvent === workshop.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {selectedEvent === workshop.event_id && (
                                                    <tr className="registrations-row">
                                                        <td colSpan="7" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button
                                                                        className="add-registration-btn"
                                                                        onClick={() => openAddRegistrationModal(workshop.event_id, 'workshop')}
                                                                        title="Add registration"
                                                                    >
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllEmails}
                                                                                            title="Copy all emails"
                                                                                        >
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllPhoneNumbers}
                                                                                            title="Copy all phone numbers"
                                                                                        >
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Laptop</th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-email"
                                                                                                onClick={() => handleEmailClick(reg.email)}
                                                                                                title="Click to copy email"
                                                                                            >
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-phone"
                                                                                                onClick={() => handlePhoneClick(reg.phone_number)}
                                                                                                title="Click to copy phone number"
                                                                                            >
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="laptop-indicator-cell">
                                                                                            {reg.needs_laptop ? (
                                                                                                <span className="laptop-needed" title="Needs to borrow a laptop">
                                                                                                    <span className="laptop-icon">💻</span>
                                                                                                    <span className="laptop-text">Needs</span>
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="laptop-own" title="Has own laptop">
                                                                                                    <span className="laptop-icon">✓</span>
                                                                                                    <span className="laptop-text">Own</span>
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className={`attendance-status-dropdown-unified status-${reg.status}`}
                                                                                                value={reg.status}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.value !== reg.status) {
                                                                                                        // Use applicant_id if available, otherwise use user_id (for external participants)
                                                                                                        const attendeeId = reg.applicant_id || reg.user_id || 'null';
                                                                                                        handleMarkAttendance('workshop', workshop.event_id, attendeeId, e.target.value);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button
                                                                                                className="remove-registration-btn"
                                                                                                onClick={() => handleRemoveRegistration('workshop', workshop.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
                                                                                                title="Cancel registration"
                                                                                            >
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <p>No registrations found</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No workshops found</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'emails' && (
                    <div className="admissions-dashboard__email-automation">
                        <div className="data-section__header">
                            <h2>Email Management</h2>
                            <div className="data-section__actions">
                                <button
                                    onClick={async () => {
                                        setEmailAutomationLoading(true);
                                        try {
                                            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/run`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ dryRun: true })
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
                                    }}
                                    className="create-btn create-btn--secondary"
                                    disabled={emailAutomationLoading}
                                >
                                    {emailAutomationLoading ? 'Running...' : '🧪 Test Run (Preview)'}
                                </button>
                                
                                {/* Test Email Section */}
                                <div className="test-email-section">
                                    <input
                                        type="email"
                                        placeholder="Enter email address for test"
                                        value={testEmailAddress}
                                        onChange={(e) => setTestEmailAddress(e.target.value)}
                                        className="test-email-input"
                                        disabled={testEmailLoading}
                                    />
                                    <button
                                        onClick={sendTestEmail}
                                        className="create-btn create-btn--secondary"
                                        disabled={testEmailLoading || !testEmailAddress.trim()}
                                    >
                                        {testEmailLoading ? 'Sending...' : '📧 Send Test Email'}
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
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
                                                body: JSON.stringify({ dryRun: false })
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
                                    }}
                                    className="create-btn create-btn--danger"
                                    disabled={emailAutomationLoading}
                                >
                                    {emailAutomationLoading ? 'Running...' : '📧 Run Email Automation'}
                                </button>
                                <button
                                    onClick={() => {
                                        fetchEmailStats();
                                        fetchQueuedEmails();
                                        fetchEmailHistory();
                                        fetchApplicantEmailStatus();
                                    }}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Email Stats Overview */}
                        {emailStats && (
                            <div className="email-automation-stats">
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
                                            {emailStats.total_emails_sent > 0 
                                                ? Math.round((emailStats.emails_opened / emailStats.total_emails_sent) * 100) 
                                                : 0}%
                                        </div>
                                        <div className="stat-label">Open Rate</div>
                                    </div>
                                </div>

                                {/* Opt-out Stats */}
                                <div className="opt-out-stats">
                                    <h4>Opt-out Reason Breakdown</h4>
                                    <div className="opt-out-reasons-grid">
                                        {emailStats.optOutReasons && emailStats.optOutReasons.length > 0 ? (
                                            emailStats.optOutReasons.map((reason) => (
                                                <div key={reason.reason_category} className="opt-out-reason-card">
                                                    <div className="opt-out-reason-value">{reason.count}</div>
                                                    <div className="opt-out-reason-label">{reason.reason_category}</div>
                                                </div>
                                            ))
                                        ) : emailStats.total_opted_out > 0 ? (
                                            <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">{emailStats.total_opted_out}</div>
                                                <div className="opt-out-reason-label">Total Opted Out</div>
                                                <div className="opt-out-reason-note">(No reason data available)</div>
                                            </div>
                                        ) : (
                                            <div className="opt-out-reason-card">
                                                <div className="opt-out-reason-value">0</div>
                                                <div className="opt-out-reason-label">No Opt-outs</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Other Reasons Details */}
                                    {emailStats.otherReasons && emailStats.otherReasons.length > 0 && (
                                        <div className="other-reasons-section">
                                            <h5>Custom Opt-out Reasons:</h5>
                                            <div className="other-reasons-list">
                                                {emailStats.otherReasons.map((reason, index) => (
                                                    <div key={index} className="other-reason-item">
                                                        <span className="other-reason-text">
                                                            {reason.email_opt_out_reason.replace(/^(Unsubscribed|Deferred application) - /, '')}
                                                        </span>
                                                        <span className="other-reason-count">({reason.count})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Email Type Breakdown */}
                                {emailStats.typeBreakdown && emailStats.typeBreakdown.length > 0 && (
                                    <div className="email-type-breakdown">
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
                                                    {emailStats.typeBreakdown.map((type) => (
                                                        <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="queued-cell">{type.queued_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Queued Emails */}
                        <div className="queued-emails-section">
                            <h3>Queued Emails ({queuedEmails.length})</h3>
                            {queuedEmails.length > 0 ? (
                                <div className="data-table-container">
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
                                            {queuedEmails.map((email) => (
                                                <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </td>
                                                    <td>{new Date(email.created_at).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-message">
                                    <p>No emails currently queued</p>
                                </div>
                            )}
                        </div>

                        {/* Email History */}
                        <div className="email-history-section">
                            <h3>Recent Email History ({emailHistory.length})</h3>
                            {emailHistory.length > 0 ? (
                                <div className="data-table-container">
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
                                            {emailHistory.map((email) => (
                                                <tr key={email.log_id}>
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
                                                        {email.next_send_at ? (
                                                            <span className="next-send">
                                                                {new Date(email.next_send_at).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="next-send--none">None</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-message">
                                    <p>No email history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Info Session Modal */}
            {infoSessionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal info-session-modal">
                        <div className="modal-header">
                            <h2>{editingInfoSession ? 'Edit Info Session' : 'Create New Info Session'}</h2>
                            <button className="close-btn" onClick={closeInfoSessionModal}>×</button>
                        </div>
                        <form onSubmit={handleInfoSessionSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={infoSessionForm.title}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder="Info Session Title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={infoSessionForm.description}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder="Session description"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_time">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        id="start_time"
                                        name="start_time"
                                        value={infoSessionForm.start_time}
                                        onChange={handleInfoSessionFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_time">End Time</label>
                                    <input
                                        type="datetime-local"
                                        id="end_time"
                                        name="end_time"
                                        value={infoSessionForm.end_time}
                                        onChange={handleInfoSessionFormChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="capacity">Capacity</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={infoSessionForm.capacity}
                                    onChange={handleInfoSessionFormChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="is_online"
                                    name="is_online"
                                    checked={infoSessionForm.is_online}
                                    onChange={handleInfoSessionFormChange}
                                />
                                <label htmlFor="is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={infoSessionForm.location}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder={infoSessionForm.is_online ? "Online" : "Physical location"}
                                    required
                                />
                            </div>

                            {infoSessionForm.is_online && (
                                <div className="form-group">
                                    <label htmlFor="meeting_link">Meeting Link</label>
                                    <input
                                        type="url"
                                        id="meeting_link"
                                        name="meeting_link"
                                        value={infoSessionForm.meeting_link}
                                        onChange={handleInfoSessionFormChange}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeInfoSessionModal}
                                    disabled={infoSessionSubmitting}
                                >
                                    Cancel
                                </button>
                                {editingInfoSession && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteInfoSession(editingInfoSession)}
                                        disabled={infoSessionSubmitting}
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={infoSessionSubmitting}
                                >
                                    {infoSessionSubmitting
                                        ? (editingInfoSession ? 'Updating...' : 'Creating...')
                                        : (editingInfoSession ? 'Update Session' : 'Create Session')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Workshop Modal */}
            {workshopModalOpen && (
                <div className="modal-overlay">
                    <div className="modal workshop-modal">
                        <div className="modal-header">
                            <h2>{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                            <button className="close-btn" onClick={closeWorkshopModal}>×</button>
                        </div>
                        <form onSubmit={handleWorkshopSubmit}>
                            <div className="form-group">
                                <label htmlFor="workshop-title">Title</label>
                                <input
                                    type="text"
                                    id="workshop-title"
                                    name="title"
                                    value={workshopForm.title}
                                    onChange={handleWorkshopFormChange}
                                    placeholder="Workshop Title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-description">Description</label>
                                <textarea
                                    id="workshop-description"
                                    name="description"
                                    value={workshopForm.description}
                                    onChange={handleWorkshopFormChange}
                                    placeholder="Workshop description"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workshop-start_time">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        id="workshop-start_time"
                                        name="start_time"
                                        value={workshopForm.start_time}
                                        onChange={handleWorkshopFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="workshop-end_time">End Time</label>
                                    <input
                                        type="datetime-local"
                                        id="workshop-end_time"
                                        name="end_time"
                                        value={workshopForm.end_time}
                                        onChange={handleWorkshopFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-capacity">Capacity</label>
                                <input
                                    type="number"
                                    id="workshop-capacity"
                                    name="capacity"
                                    value={workshopForm.capacity}
                                    onChange={handleWorkshopFormChange}
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Modern Toggle: Online Event */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600' }}>Online Event</span>
                                    <div 
                                        onClick={() => setWorkshopForm(prev => ({ ...prev, is_online: !prev.is_online }))}
                                        style={{
                                            position: 'relative',
                                            width: '48px',
                                            height: '24px',
                                            backgroundColor: workshopForm.is_online ? 'var(--color-primary)' : '#4b5563',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            transform: workshopForm.is_online ? 'translateX(24px)' : 'translateX(0)',
                                            transition: 'transform 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </label>
                                <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                    {workshopForm.is_online ? 'Workshop will be held online' : 'Workshop will be held in person'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-location">Location</label>
                                <input
                                    type="text"
                                    id="workshop-location"
                                    name="location"
                                    value={workshopForm.location}
                                    onChange={handleWorkshopFormChange}
                                    placeholder={workshopForm.is_online ? "Online" : "Physical location"}
                                    required
                                />
                            </div>

                            {workshopForm.is_online && (
                                <div className="form-group">
                                    <label htmlFor="workshop-meeting_link">Meeting Link</label>
                                    <input
                                        type="url"
                                        id="workshop-meeting_link"
                                        name="meeting_link"
                                        value={workshopForm.meeting_link}
                                        onChange={handleWorkshopFormChange}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                </div>
                            )}

                            {/* NEW: Workshop System Fields */}
                            <div className="form-section-divider" style={{ margin: '24px 0', borderTop: '2px solid #374151', paddingTop: '24px' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Workshop Configuration</h3>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-workshop_type">
                                    Workshop Type
                                    <span style={{ color: '#f59e0b', fontSize: '0.9em', marginLeft: '8px' }}>
                                        (Cannot be changed after creation)
                                    </span>
                                </label>
                                <select
                                    id="workshop-workshop_type"
                                    name="workshop_type"
                                    value={workshopForm.workshop_type}
                                    onChange={handleWorkshopFormChange}
                                    required
                                    disabled={editingWorkshop}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #374151',
                                        backgroundColor: editingWorkshop ? '#374151' : '#1f2937',
                                        color: editingWorkshop ? '#9ca3af' : 'var(--color-text-primary)',
                                        fontSize: '1rem',
                                        cursor: editingWorkshop ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="admissions">Admissions Workshop</option>
                                    <option value="external">External Workshop</option>
                                </select>
                                <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                    {editingWorkshop ? 'Workshop type is locked after creation' : 'Choose the type of workshop to create'}
                                </small>
                            </div>
                            {/* Access Code - Only for External Workshops */}
                            {workshopForm.workshop_type === 'external' && (
                                <div className="form-group">
                                    <label htmlFor="workshop-access_code">
                                        Workshop Access Code
                                        <span style={{ color: '#9ca3af', fontSize: '0.9em', marginLeft: '8px' }}>
                                            (Leave blank to auto-generate)
                                        </span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            id="workshop-access_code"
                                            name="access_code"
                                            value={workshopForm.access_code || ''}
                                            onChange={handleWorkshopFormChange}
                                            placeholder="e.g., META-WS-2025"
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: '1px solid #374151',
                                                backgroundColor: '#1f2937',
                                                color: 'var(--color-text-primary)',
                                                fontSize: '1rem',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                        {editingWorkshop && workshopForm.access_code && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    copyToClipboard(workshopForm.access_code, 'Access code');
                                                }}
                                                style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #374151',
                                                    backgroundColor: '#374151',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                📋 Copy
                                            </button>
                                        )}
                                    </div>
                                    <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                        {editingWorkshop 
                                            ? 'Share this code with external workshop participants' 
                                            : 'Custom access code or leave blank for auto-generated code'}
                                    </small>
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="workshop-cohort_name">
                                    Workshop Cohort
                                    <span style={{ color: '#9ca3af', fontSize: '0.9em', marginLeft: '8px' }}>
                                        (Determines which curriculum is shown)
                                    </span>
                                </label>
                                <select
                                    id="workshop-cohort_name"
                                    name="cohort_name"
                                    value={workshopForm.cohort_name}
                                    onChange={handleWorkshopFormChange}
                                    required
                                    disabled={loadingCohorts}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #374151',
                                        backgroundColor: '#1f2937',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loadingCohorts ? (
                                        <option value="">Loading cohorts...</option>
                                    ) : availableCohorts.length === 0 ? (
                                        <option value="">No workshop cohorts available</option>
                                    ) : (
                                        <>
                                            <option value="">Select a cohort</option>
                                            {availableCohorts.map(cohortName => (
                                                <option key={cohortName} value={cohortName}>
                                                    {cohortName}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                    {workshopForm.workshop_type === 'admissions' 
                                        ? 'Select admissions cohort for applicant workshops' 
                                        : 'Select organization cohort for external workshops'}
                                </small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workshop-access_window_days">
                                        Post-Workshop Access (days)
                                    </label>
                                    <input
                                        type="number"
                                        id="workshop-access_window_days"
                                        name="access_window_days"
                                        value={workshopForm.access_window_days}
                                        onChange={handleWorkshopFormChange}
                                        min="0"
                                        max="30"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: '1px solid #374151',
                                            backgroundColor: '#1f2937',
                                            color: 'var(--color-text-primary)'
                                        }}
                                    />
                                    <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                        Days participants can access after workshop ends (0 = day-of only)
                                    </small>
                                </div>

                                {/* Modern Toggle: Allow Early Access */}
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '600' }}>Allow Early Access</span>
                                        <div 
                                            onClick={() => setWorkshopForm(prev => ({ ...prev, allow_early_access: !prev.allow_early_access }))}
                                            style={{
                                                position: 'relative',
                                                width: '48px',
                                                height: '24px',
                                                backgroundColor: workshopForm.allow_early_access ? 'var(--color-primary)' : '#4b5563',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '2px'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                transform: workshopForm.allow_early_access ? 'translateX(24px)' : 'translateX(0)',
                                                transition: 'transform 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                    </label>
                                    <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                        {workshopForm.allow_early_access 
                                            ? 'Participants can access the workshop content before the start date' 
                                            : 'Participants can only access on/after the workshop start date'}
                                    </small>
                                </div>
                            </div>
                            {/* Workshop Admin Assignment - Only for External Workshops */}
                            {workshopForm.workshop_type === 'external' && (
                                <>
                                    <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #374151' }}>
                                        <label htmlFor="workshop-admin_email">
                                            Workshop Admin Email
                                            <span style={{ color: '#9ca3af', fontSize: '0.9em', marginLeft: '8px' }}>
                                                {editingWorkshop && workshopForm.admin_email 
                                                    ? '(Currently assigned - change to reassign)'
                                                    : '(Optional - Assign a workshop administrator)'}
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            id="workshop-admin_email"
                                            name="admin_email"
                                            value={workshopForm.admin_email || ''}
                                            onChange={handleWorkshopFormChange}
                                            placeholder="admin@company.com"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '6px',
                                                border: '1px solid #374151',
                                                backgroundColor: '#1f2937',
                                                color: 'var(--color-text-primary)',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px' }}>
                                            {editingWorkshop && workshopForm.admin_email
                                                ? `Current admin: ${workshopForm.admin_email}. ${workshopForm.admin_is_pending ? '⚠️ Pending invitation - user has not signed up yet. ' : ''}Change this email to assign a different workshop admin.`
                                                : 'This person will be able to view participant progress and submissions'}
                                        </small>
                                    </div>

                                    {workshopForm.admin_email && (
                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                                <input
                                                    type="checkbox"
                                                    name="send_admin_invitation"
                                                    checked={workshopForm.send_admin_invitation || false}
                                                    onChange={(e) => {
                                                        handleWorkshopFormChange({
                                                            target: {
                                                                name: 'send_admin_invitation',
                                                                value: e.target.checked
                                                            }
                                                        });
                                                    }}
                                                    style={{
                                                        marginRight: '10px',
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span>
                                                    {editingWorkshop 
                                                        ? 'Send invitation email (resend or send to new admin)'
                                                        : 'Send invitation email with access code and instructions'}
                                                </span>
                                            </label>
                                            <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px', marginLeft: '28px' }}>
                                                {editingWorkshop
                                                    ? 'Check this to send/resend the invitation email with workshop details and access code'
                                                    : 'The workshop admin will receive an email with the workshop details and access code to share with participants'}
                                            </small>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeWorkshopModal}
                                    disabled={workshopSubmitting}
                                >
                                    Cancel
                                </button>
                                {editingWorkshop && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteWorkshop(editingWorkshop)}
                                        disabled={workshopSubmitting}
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={workshopSubmitting}
                                >
                                    {workshopSubmitting
                                        ? (editingWorkshop ? 'Updating...' : 'Creating...')
                                        : (editingWorkshop ? 'Update Workshop' : 'Create Workshop')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {bulkActionsModalOpen && (
                <BulkActionsModal
                    selectedCount={selectedApplicants.length}
                    onClose={() => setBulkActionsModalOpen(false)}
                    onAction={handleBulkAction}
                    isLoading={bulkActionInProgress}
                />
            )}
            {/* Add Registration Modal */}
            {addRegistrationModalOpen && (
                <div className="modal-overlay">
                    <div className="modal add-registration-modal">
                        <div className="modal-header">
                            <h2>Add Registration to {selectedEventType === 'info-session' ? 'Info Session' : 'Workshop'}</h2>
                            <button className="close-btn" onClick={closeAddRegistrationModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="search-section">
                                <div className="form-group">
                                    <label htmlFor="applicant-search">Search Applicants</label>
                                    <input
                                        type="text"
                                        id="applicant-search"
                                        value={applicantSearch}
                                        onChange={(e) => {
                                            setApplicantSearch(e.target.value);
                                        }}
                                        placeholder="Search by name, email, or applicant ID..."
                                        className="search-input"
                                    />
                                </div>
                                
                                {searchLoading && (
                                    <div className="search-loading">
                                        <div className="spinner"></div>
                                        <span>Searching...</span>
                                    </div>
                                )}
                                
                                {/* SIMPLE - show names with dark theme styling */}
                                <div style={{ 
                                    border: '1px solid var(--color-border)', 
                                    padding: '20px', 
                                    margin: '10px',
                                    backgroundColor: 'var(--color-background-dark)',
                                    borderRadius: '8px'
                                }}>
                                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '0' }}>
                                        APPLICANTS FOUND: {searchResults.length}
                                    </h3>
                                    {searchResults.map((applicant, index) => (
                                        <div key={index} style={{ 
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
                                                <strong style={{ color: 'var(--color-text-primary)' }}>
                                                    {applicant.display_name || applicant.first_name + ' ' + applicant.last_name}
                                                </strong><br/>
                                                <span style={{ color: 'var(--color-text-muted)' }}>{applicant.email}</span><br/>
                                                <small style={{ color: 'var(--color-text-muted)' }}>
                                                    Status: {applicant.application_status}
                                                </small>
                                                {applicant.already_registered_for_this_event && (
                                                    <span style={{ 
                                                        backgroundColor: '#6b7280', 
                                                        color: 'white', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '12px',
                                                        marginLeft: '10px'
                                                    }}>
                                                        Already Registered
                                                    </span>
                                                )}
                                            </div>
                                            {!applicant.already_registered_for_this_event && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApplicantsForRegistration.some(selected => selected.applicant_id === applicant.applicant_id)}
                                                    onChange={() => toggleApplicantSelection(applicant)}
                                                    style={{ 
                                                        transform: 'scale(1.5)',
                                                        accentColor: 'var(--color-primary)'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <p style={{ 
                                            color: 'var(--color-text-muted)', 
                                            textAlign: 'center',
                                            fontStyle: 'italic',
                                            margin: '20px 0'
                                        }}>
                                            No results yet - type to search
                                        </p>
                                    )}
                                </div>
                                {selectedApplicantsForRegistration.length > 0 && (
                                    <div className="selected-applicants">
                                        <h4>Selected for Registration ({selectedApplicantsForRegistration.length})</h4>
                                        <div className="selected-list">
                                            {selectedApplicantsForRegistration.map((applicant) => (
                                                <div key={applicant.applicant_id} className="selected-applicant">
                                                    <span className="applicant-name-selected">{applicant.display_name}</span>
                                                    <div className="laptop-toggle-container">
                                                        <button
                                                            type="button"
                                                            className={`laptop-toggle-btn ${laptopNeeds[applicant.applicant_id] ? 'laptop-toggle-btn--needs' : 'laptop-toggle-btn--owns'}`}
                                                            onClick={() => setLaptopNeeds({
                                                                ...laptopNeeds,
                                                                [applicant.applicant_id]: !laptopNeeds[applicant.applicant_id]
                                                            })}
                                                            title={laptopNeeds[applicant.applicant_id] ? 'Needs laptop' : 'Has own laptop'}
                                                        >
                                                            <span className="laptop-toggle-slider"></span>
                                                        </button>
                                                        <span className={`laptop-status-label ${laptopNeeds[applicant.applicant_id] ? 'laptop-status-label--needs' : 'laptop-status-label--owns'}`}>
                                                            {laptopNeeds[applicant.applicant_id] ? '💻 Needs' : '✓ Own'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleApplicantSelection(applicant)}
                                                        className="remove-selected-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={closeAddRegistrationModal}
                                disabled={registrationLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={registerSelectedApplicants}
                                disabled={registrationLoading || selectedApplicantsForRegistration.length === 0}
                            >
                                {registrationLoading 
                                    ? 'Registering...' 
                                    : `Register ${selectedApplicantsForRegistration.length} Applicant${selectedApplicantsForRegistration.length !== 1 ? 's' : ''}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen && selectedApplicant}
                applicantId={selectedApplicant?.applicant_id}
                applicantName={selectedApplicant?.name || `${selectedApplicant?.first_name} ${selectedApplicant?.last_name}`}
                onClose={closeNotesModal}
            />
            {/* Applications Modal for KPI Tiles */}
            {applicationsModalOpen && (
                <div className="modal-overlay" onClick={() => setApplicationsModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid rgba(75, 61, 237, 0.3)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                {applicationsModalFilter?.type === 'total' ? 'Total Applicants' :
                                 applicationsModalFilter?.type === 'accounts_created' ? 'Accounts Created' :
                                 applicationsModalFilter?.type === 'submitted' ? 'Submitted Applications' :
                                 applicationsModalFilter?.type === 'info' ? 'Info Session Attendees' :
                                 applicationsModalFilter?.type === 'workshops' ? 'Workshop Participants' :
                                 applicationsModalFilter?.type === 'offers' ? 'Offers Extended' :
                                 applicationsModalFilter?.type === 'marketing' ? 'Marketing Insights' : 'Applications'}
                            </h2>
                            <button className="close-btn" onClick={() => setApplicationsModalOpen(false)} style={{ fontSize: '2rem', fontWeight: 300, background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                            {modalApplicationsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-primary)' }}>
                                    <div>Loading applications...</div>
                                </div>
                            ) : modalApplications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-primary)' }}>
                                    <div>No applications found.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(75, 61, 237, 0.1)', borderRadius: '8px', border: '1px solid rgba(75, 61, 237, 0.3)' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                            {modalApplications.length} {modalApplications.length === 1 ? 'Application' : 'Applications'}
                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid rgba(75, 61, 237, 0.3)' }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Name</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Email</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Status</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modalApplications.map((app, idx) => (
                                                <tr key={app.applicant_id || app.application_id || idx} style={{ borderBottom: idx < modalApplications.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                                                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                                                        {app.first_name} {app.last_name}
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--color-text-primary)' }}>
                                                        {app.email || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--color-text-primary)' }}>
                                                        {app.status || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--color-text-secondary)' }}>
                                                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid rgba(75, 61, 237, 0.3)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setDemographicApplicantsModalOpen(false)}
                                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 700 }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionsDashboard; 