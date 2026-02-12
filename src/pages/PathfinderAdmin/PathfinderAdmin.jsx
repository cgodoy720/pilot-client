import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import Swal from 'sweetalert2';
import { formatSalary } from '../../utils/salaryFormatter';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./components/OverviewTab/OverviewTab'));
const BuildersTab = lazy(() => import('./components/BuildersTab/BuildersTab'));
const CompaniesTab = lazy(() => import('./components/CompaniesTab/CompaniesTab'));
const ProjectsTab = lazy(() => import('./components/ProjectsTab/ProjectsTab'));
const JobApplicationsTab = lazy(() => import('./components/JobApplicationsTab/JobApplicationsTab'));
const PRDsTab = lazy(() => import('./components/PRDsTab/PRDsTab'));
const CeremoniesTab = lazy(() => import('./components/CeremoniesTab/CeremoniesTab'));
const WeeklyGoalsTab = lazy(() => import('./components/WeeklyGoalsTab/WeeklyGoalsTab'));
const EventsTab = lazy(() => import('./components/EventsTab/EventsTab'));

// Import shared modals
import BuilderDetailModal from './components/shared/BuilderDetailModal';
import CompanyDetailModal from './components/shared/CompanyDetailModal';

// Import shared utils
import { getStageLabel, getWeekDateRange, getMilestoneInfo } from './components/shared/utils';

function PathfinderAdmin() {
  const { token } = useAuth();
  const { canAccessPage } = usePermissions();
  const hasPathfinderAdminAccess = canAccessPage('pathfinder_admin');
  const [overview, setOverview] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedPRDs, setApprovedPRDs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsOverview, setProjectsOverview] = useState(null);
  const [cohortStats, setCohortStats] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [builderDetails, setBuilderDetails] = useState(null);
  const [selectedJobApplication, setSelectedJobApplication] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyBuilders, setCompanyBuilders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cohortFilter, setCohortFilter] = useState('all');
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, etc.
  const [view, setView] = useState('overview'); // overview, builders, companies, prds, build-projects, job-applications, ceremonies
  const [prdSubView, setPrdSubView] = useState('pending'); // pending, approved
  const [stageFilter, setStageFilter] = useState(''); // For build projects filtering
  const [prdStageFilter, setPrdStageFilter] = useState(''); // For PRD stage filtering
  const [prdViewMode, setPrdViewMode] = useState('table'); // table or kanban for PRD section
  const [prdFilter, setPrdFilter] = useState('submitted'); // submitted or all (for PRDs with links)
  const [prdSortConfig, setPrdSortConfig] = useState({ key: 'prd_submitted_at', direction: 'desc' }); // PRD sorting
  const [builderSortConfig, setBuilderSortConfig] = useState({ key: 'first_name', direction: 'asc' }); // Builder sorting
  const [jobAppSortConfig, setJobAppSortConfig] = useState({ key: 'date_applied', direction: 'desc' }); // Job applications sorting
  const [jobAppViewMode, setJobAppViewMode] = useState('table'); // table or kanban
  const [projectsViewMode, setProjectsViewMode] = useState('table'); // table or kanban for build projects
  const [collapsedColumns, setCollapsedColumns] = useState({}); // Collapsed Kanban columns
  const [collapsedProjectColumns, setCollapsedProjectColumns] = useState({}); // Collapsed project Kanban columns
  const [collapsedPrdColumns, setCollapsedPrdColumns] = useState({}); // Collapsed PRD Kanban columns
  const [selectedBuilderFilter, setSelectedBuilderFilter] = useState(null); // Filter by specific builder
  const [showBuilderFilterModal, setShowBuilderFilterModal] = useState(false); // Builder filter modal
  const [companiesViewMode, setCompaniesViewMode] = useState('table'); // table or cards
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' }); // Date range filter
  const [highlights, setHighlights] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [expandedHighlightGroups, setExpandedHighlightGroups] = useState({});
  const [ceremonies, setCeremonies] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivedCeremonies, setArchivedCeremonies] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [weeklyGoalsForm, setWeeklyGoalsForm] = useState({
    weekStartDate: '',
    weekEndDate: '',
    applicationsGoal: 0,
    networkingGoal: 0,
    interviewsGoal: 0,
    message: '',
    cohort: ''
  });
  const [editingGoalId, setEditingGoalId] = useState(null);

  // Data cache to avoid re-fetching when switching tabs
  const [dataCache, setDataCache] = useState({
    builders: null,
    companies: null,
    projects: null,
    projectsOverview: null,
    jobApplications: null,
    pendingApprovals: null,
    approvedPRDs: null,
    ceremonies: null,
    weeklyGoals: null
  });

  // Per-tab loading states
  const [tabLoading, setTabLoading] = useState({
    builders: false,
    companies: false,
    projects: false,
    jobApplications: false,
    prds: false,
    ceremonies: false,
    weeklyGoals: false
  });

  // Helper functions moved to shared/utils.js

  // PRD Sorting handler
  const handlePrdSort = useCallback((key) => {
    let direction = 'asc';
    if (prdSortConfig.key === key && prdSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPrdSortConfig({ key, direction });
  }, [prdSortConfig]);

  // Builder Sorting handler
  const handleBuilderSort = useCallback((key) => {
    let direction = 'asc';
    if (builderSortConfig.key === key && builderSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setBuilderSortConfig({ key, direction });
  }, [builderSortConfig]);

  // Job Applications Sorting handler
  const handleJobAppSort = useCallback((key) => {
    let direction = 'asc';
    if (jobAppSortConfig.key === key && jobAppSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setJobAppSortConfig({ key, direction });
  }, [jobAppSortConfig]);

  // Get sorted builders
  const getSortedBuilders = () => {
    if (!builderSortConfig.key) return builders;

    return [...builders].sort((a, b) => {
      let aVal = a[builderSortConfig.key];
      let bVal = b[builderSortConfig.key];

      // Handle name sorting (combine first and last name)
      if (builderSortConfig.key === 'name') {
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
      }
      // Handle numeric columns
      else if (['application_count', 'interview_count', 'offer_count', 'networking_count', 'total_projects'].includes(builderSortConfig.key)) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      // Handle string comparisons
      else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal ? bVal.toLowerCase() : '';
      }

      // Handle null/undefined values for strings
      if (builderSortConfig.key !== 'application_count' && builderSortConfig.key !== 'interview_count' && 
          builderSortConfig.key !== 'offer_count' && builderSortConfig.key !== 'networking_count' && builderSortConfig.key !== 'total_projects') {
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
      }

      if (aVal < bVal) return builderSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return builderSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get sorted job applications
  const getSortedJobApplications = () => {
    // First filter by builder if selected
    let filteredApps = jobApplications;
    if (selectedBuilderFilter) {
      filteredApps = jobApplications.filter(app => app.builder_id === selectedBuilderFilter.builder_id);
    }

    if (!jobAppSortConfig.key) return filteredApps;

    return [...filteredApps].sort((a, b) => {
      let aVal = a[jobAppSortConfig.key];
      let bVal = b[jobAppSortConfig.key];

      // Handle builder name sorting (combine first and last name)
      if (jobAppSortConfig.key === 'builder_name') {
        aVal = `${a.builder_first_name} ${a.builder_last_name}`.toLowerCase();
        bVal = `${b.builder_first_name} ${b.builder_last_name}`.toLowerCase();
      }
      // Handle date sorting
      else if (jobAppSortConfig.key === 'date_applied') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // Handle numeric columns
      else if (jobAppSortConfig.key === 'interview_count') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      // Handle string comparisons
      else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal ? bVal.toLowerCase() : '';
      }

      // Handle null/undefined values for strings
      if (jobAppSortConfig.key !== 'interview_count' && jobAppSortConfig.key !== 'date_applied') {
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
      }

      if (aVal < bVal) return jobAppSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return jobAppSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Get unique builders from job applications
  const getUniqueBuilders = () => {
    const buildersMap = new Map();
    jobApplications.forEach(app => {
      if (!buildersMap.has(app.builder_id)) {
        buildersMap.set(app.builder_id, {
          builder_id: app.builder_id,
          first_name: app.builder_first_name,
          last_name: app.builder_last_name,
          full_name: `${app.builder_first_name} ${app.builder_last_name}`
        });
      }
    });
    return Array.from(buildersMap.values()).sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    );
  };

  // Filter and sort PRDs
  const getFilteredAndSortedPRDs = (prds) => {
    let filtered = [...prds];

    // Filter by stage
    if (prdStageFilter) {
      filtered = filtered.filter(p => p.stage === prdStageFilter);
    }

    // Filter by PRD submission status (only applies in Kanban view)
    if (prdViewMode === 'kanban' && prdFilter) {
      if (prdFilter === 'submitted') {
        // Only show projects with PRDs submitted for approval (pending or approved)
        filtered = filtered.filter(p => p.prd_submitted === true || p.prd_approved === true);
      } else if (prdFilter === 'all') {
        // Show all projects that have a PRD link
        filtered = filtered.filter(p => p.prd_link);
      }
    }

    // Sort
    if (prdSortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[prdSortConfig.key];
        let bVal = b[prdSortConfig.key];

        // Handle builder name sorting
        if (prdSortConfig.key === 'builder_name') {
          aVal = `${a.builder_first_name} ${a.builder_last_name}`.toLowerCase();
          bVal = `${b.builder_first_name} ${b.builder_last_name}`.toLowerCase();
        }

        // Handle date sorting
        if (prdSortConfig.key === 'target_date' || prdSortConfig.key === 'prd_submitted_at' || prdSortConfig.key === 'prd_approved_at') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        // Handle string sorting
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return prdSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return prdSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Get all PRDs for Kanban view (combines all projects with various PRD statuses)
  const getAllPRDsForKanban = () => {
    // Combine all projects (from the projects state which has all build projects)
    return projects;
  };

  // Extract unique cohorts from builders data
  useEffect(() => {
    // Always fetch all builders to get all cohorts for the filter
    const fetchAllCohorts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const uniqueCohorts = [...new Set(data.map(b => b.cohort).filter(Boolean))].sort();
          setAvailableCohorts(uniqueCohorts);
        }
      } catch (err) {
        console.error('Error fetching cohorts:', err);
      }
    };
    
    if (token) {
      fetchAllCohorts();
    }
  }, [token]); // Only run once on mount or when token changes

  // Always fetch overview data on mount and when filters change
  useEffect(() => {
    if (hasPathfinderAdminAccess && token) {
      const fetchOverviewData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchOverview(),
            fetchHighlights(),
            fetchLeaderboard()
          ]);
        } catch (err) {
          console.error('Error fetching overview data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOverviewData();
    }
  }, [token, cohortFilter, weekOffset, hasPathfinderAdminAccess]);

  // Fetch tab-specific data only when tab is activated
  useEffect(() => {
    if (hasPathfinderAdminAccess && token && view !== 'overview') {
      const fetchTabData = async () => {
        // Set loading state for this tab
        const tabKey = view === 'build-projects' ? 'projects' : view === 'prds' ? 'prds' : view;
        if (tabLoading[tabKey] !== undefined) {
          setTabLoading(prev => ({ ...prev, [tabKey]: true }));
        }

        try {
          switch (view) {
            case 'builders':
              await fetchBuilders();
              break;
            case 'companies':
              await fetchCompanies();
              break;
            case 'build-projects':
              await Promise.all([fetchProjects(), fetchProjectsOverview()]);
              break;
            case 'job-applications':
              await fetchJobApplications();
              break;
            case 'prds':
              await Promise.all([fetchPendingApprovals(), fetchApprovedPRDs()]);
              break;
            case 'ceremonies':
              await fetchCeremonies();
              break;
            case 'weekly-goals':
              await fetchWeeklyGoals();
              break;
          }
        } catch (err) {
          console.error(`Error fetching ${view} data:`, err);
        } finally {
          if (tabLoading[tabKey] !== undefined) {
            setTabLoading(prev => ({ ...prev, [tabKey]: false }));
          }
        }
      };

      fetchTabData();
    }
  }, [token, cohortFilter, view, hasPathfinderAdminAccess]);
  
  // Toggle column collapse in Kanban view
  const toggleColumnCollapse = useCallback((stage) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  }, []);

  const toggleProjectColumnCollapse = (stage) => {
    setCollapsedProjectColumns(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const fetchOverview = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/overview?weekOffset=${weekOffset}`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `&cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data);
      } else {
        setError('Failed to fetch overview');
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Error loading overview');
    }
  };

  // Helper functions moved to shared/utils.js

  const toggleHighlightGroup = useCallback((type) => {
    setExpandedHighlightGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  const fetchHighlights = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/highlights?weekOffset=${weekOffset}`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `&cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHighlights(data);
      }
    } catch (err) {
      console.error('Error fetching highlights:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/leaderboard?weekOffset=${weekOffset}`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `&cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchBuilders = async () => {
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBuilders(data);
        setDataCache(prev => ({ ...prev, builders: data }));
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setDataCache(prev => ({ ...prev, companies: data }));
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchBuilderDetails = async (builderId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders/${builderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBuilderDetails(data);
      }
    } catch (err) {
      console.error('Error fetching builder details:', err);
    }
  };

  const handleBuilderClick = useCallback((builder) => {
    setSelectedBuilder(builder);
    fetchBuilderDetails(builder.builder_id);
  }, []);

  const handleCompanyClick = useCallback(async (company) => {
    setSelectedCompany(company);
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies/${encodeURIComponent(company.company_name)}/builders?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies/${encodeURIComponent(company.company_name)}/builders`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyBuilders(data);
      }
    } catch (err) {
      console.error('Error fetching company builders:', err);
    }
  }, [cohortFilter, token]);

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  const getInitialColor = (companyName) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    const charCode = companyName ? companyName.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  const handleExport = () => {
    const url = cohortFilter && cohortFilter !== 'all'
      ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export?cohort=${encodeURIComponent(cohortFilter)}`
      : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export`;

    window.open(url, '_blank');
  };

  const handleProjectsExport = () => {
    // Convert projects data to CSV
    if (projects.length === 0) {
      alert('No projects to export');
      return;
    }

    const headers = [
      'Builder Name',
      'Builder Email',
      'Cohort',
      'Project Name',
      'Stage',
      'Target Date',
      'PRD Status',
      'PRD Link',
      'Linked Company',
      'Linked Role',
      'Created At',
      'Deployment URL'
    ];

    const rows = projects.map(p => [
      `${p.builder_first_name} ${p.builder_last_name}`,
      p.builder_email,
      p.builder_cohort || '',
      p.project_name,
      p.stage,
      new Date(p.target_date).toLocaleDateString(),
      p.prd_approved ? 'Approved' : p.prd_submitted ? 'Pending' : p.prd_link ? 'Draft' : 'None',
      p.prd_link || '',
      p.linked_job_company || '',
      p.linked_job_role || '',
      new Date(p.created_at).toLocaleDateString(),
      p.deployment_url || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const str = String(cell);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pathfinder-projects-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCeremonies = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/ceremonies`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `?cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCeremonies(data);
        setDataCache(prev => ({ ...prev, ceremonies: data }));
      }
    } catch (err) {
      console.error('Error fetching ceremonies:', err);
    }
  };

  const fetchArchivedCeremonies = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/ceremonies/archived`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `?cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedCeremonies(data);
      }
    } catch (err) {
      console.error('Error fetching archived ceremonies:', err);
    }
  };

  // Weekly Goals Functions
  const fetchWeeklyGoals = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/weekly-goals`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWeeklyGoals(data);
        setDataCache(prev => ({ ...prev, weeklyGoals: data }));
      }
    } catch (err) {
      console.error('Error fetching weekly goals:', err);
    }
  };

  const handleWeeklyGoalsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGoalId
        ? `${import.meta.env.VITE_API_URL}/api/weekly-goals/${editingGoalId}`
        : `${import.meta.env.VITE_API_URL}/api/weekly-goals`;
      
      const method = editingGoalId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(weeklyGoalsForm)
      });

      if (response.ok) {
        await fetchWeeklyGoals();
        setWeeklyGoalsForm({
          weekStartDate: '',
          weekEndDate: '',
          applicationsGoal: 0,
          networkingGoal: 0,
          interviewsGoal: 0,
          message: ''
        });
        setEditingGoalId(null);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: editingGoalId ? 'Weekly goals updated!' : 'Weekly goals created!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: errorData.error || 'Failed to save weekly goals',
          confirmButtonColor: '#4242ea'
        });
      }
    } catch (err) {
      console.error('Error saving weekly goals:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save weekly goals',
        confirmButtonColor: '#4242ea'
      });
    }
  };

  const handleEditGoal = (goal) => {
    setWeeklyGoalsForm({
      weekStartDate: goal.week_start_date.split('T')[0],
      weekEndDate: goal.week_end_date.split('T')[0],
      applicationsGoal: goal.applications_goal,
      networkingGoal: goal.networking_goal,
      interviewsGoal: goal.interviews_goal,
      message: goal.message || '',
      cohort: goal.cohort || ''
    });
    setEditingGoalId(goal.goal_id);
  };

  const handleDeleteGoal = async (goalId) => {
    const result = await Swal.fire({
      title: 'Delete Weekly Goals?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/weekly-goals/${goalId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          await fetchWeeklyGoals();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Weekly goals deleted!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      } catch (err) {
        console.error('Error deleting weekly goals:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete weekly goals',
          confirmButtonColor: '#4242ea'
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setWeeklyGoalsForm({
      weekStartDate: '',
      weekEndDate: '',
      applicationsGoal: 0,
      networkingGoal: 0,
      interviewsGoal: 0,
      message: '',
      cohort: ''
    });
    setEditingGoalId(null);
  };

  const handleArchiveCeremony = async (ceremony) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/ceremonies/archive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: ceremony.user_id,
            ceremony_type: ceremony.ceremony_type,
            reference_id: ceremony.reference_id,
            milestone_date: ceremony.ceremony_date,
            company_name: ceremony.company_name,
            role_title: ceremony.role_title,
            project_name: ceremony.project_name
          })
        }
      );

      if (response.ok) {
        // Remove from ceremonies list and refresh
        await fetchCeremonies();
        
        Swal.fire({
          title: 'Ceremony Archived!',
          text: 'The ceremony has been marked as celebrated.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Error archiving ceremony:', err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to archive ceremony',
        icon: 'error'
      });
    }
  };

  // Sorting function
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Get sorted and filtered projects
  const getFilteredAndSortedProjects = () => {
    let filtered = [...projects];
    
    // Apply stage filter
    if (stageFilter) {
      filtered = filtered.filter(p => p.stage === stageFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle dates
        if (sortConfig.key === 'target_date' || sortConfig.key === 'created_at') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        // Handle nested values for builder name
        if (sortConfig.key === 'builder_name') {
          aVal = `${a.builder_first_name} ${a.builder_last_name}`.toLowerCase();
          bVal = `${b.builder_first_name} ${b.builder_last_name}`.toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  // Filter builder's applications by date range
  const getFilteredApplications = (applications) => {
    if (!applications || applications.length === 0) return [];
    
    let filtered = [...applications];
    
    // Apply date range filter
    if (dateFilter.startDate) {
      filtered = filtered.filter(app => 
        new Date(app.date_applied) >= new Date(dateFilter.startDate)
      );
    }
    
    if (dateFilter.endDate) {
      filtered = filtered.filter(app => 
        new Date(app.date_applied) <= new Date(dateFilter.endDate)
      );
    }
    
    return filtered;
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/pending-approvals`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data);
        setDataCache(prev => ({ ...prev, pendingApprovals: data }));
      } else {
        console.error('Failed to fetch pending approvals');
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    }
  };

  const fetchApprovedPRDs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/approved-prds`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApprovedPRDs(data);
        setDataCache(prev => ({ ...prev, approvedPRDs: data }));
      } else {
        console.error('Failed to fetch approved PRDs');
      }
    } catch (err) {
      console.error('Error fetching approved PRDs:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        setDataCache(prev => ({ ...prev, projects: data }));
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProjectsOverview = async () => {
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/overview?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/overview`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectsOverview(data);
        setDataCache(prev => ({ ...prev, projectsOverview: data }));
      } else {
        console.error('Failed to fetch projects overview');
      }
    } catch (err) {
      console.error('Error fetching projects overview:', err);
    }
  };

  const fetchCohortStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/by-cohort`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCohortStats(data);
      } else {
        console.error('Failed to fetch cohort stats');
      }
    } catch (err) {
      console.error('Error fetching cohort stats:', err);
    }
  };

  const fetchJobApplications = async () => {
    try {
      const url = cohortFilter && cohortFilter !== 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/job-applications?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/job-applications`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobApplications(data);
        setDataCache(prev => ({ ...prev, jobApplications: data }));
      } else {
        console.error('Failed to fetch job applications');
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);
    }
  };


  const handleApprovePRD = async (projectId, projectName) => {
    const { value: notes } = await Swal.fire({
      title: `Approve PRD for ${projectName}?`,
      html: `
        <div style="text-align: left; padding: 0 8px;">
          <p style="font-size: 15px; color: #666; margin-bottom: 16px; line-height: 1.5;">
            You are approving this project's PRD. The builder will be able to move the project to the development stage.
          </p>
          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 500; font-size: 14px;">
              Approval Notes (optional)
            </label>
            <textarea 
              id="swal-notes" 
              placeholder="Enter any feedback or notes for the builder..."
              rows="4"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; resize: vertical; line-height: 1.5;"
            ></textarea>
            <small style="color: #666; font-size: 13px; display: block; margin-top: 6px;">
              Any notes will be visible to the builder
            </small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve PRD',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#666',
      width: '500px',
      preConfirm: () => {
        const textarea = document.getElementById('swal-notes');
        return textarea ? textarea.value : '';
      }
    });

    if (notes !== undefined) { // User clicked Approve (notes can be empty string)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${projectId}/approve-prd`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes })
          }
        );

        if (response.ok) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'PRD approved!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          fetchPendingApprovals(); // Refresh the pending list
          fetchApprovedPRDs(); // Refresh the approved list
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Approval Failed',
            text: errorData.error || 'Failed to approve PRD',
            confirmButtonColor: '#4242ea'
          });
        }
      } catch (err) {
        console.error('Error approving PRD:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to approve PRD',
          confirmButtonColor: '#4242ea'
        });
      }
    }
  };

  if (!hasPathfinderAdminAccess) {
    return (
      <div className="w-full h-full bg-gray-50 text-gray-900 overflow-y-auto p-6">
        <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-proxima-bold">Access Denied</h2>
          <p className="text-gray-600 font-proxima">You must be staff or admin to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f5f5f5] text-[#1a1a1a] overflow-y-auto p-6 font-proxima">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold text-[#1a1a1a] m-0 font-proxima-bold">Pathfinder Admin Dashboard</h1>
            
            {/* Cohort Filter */}
            <div className="flex items-center gap-2">
              <label className="font-medium text-[#1a1a1a] whitespace-nowrap font-proxima-bold">Filter by Cohort:</label>
              <Select value={cohortFilter} onValueChange={setCohortFilter}>
                <SelectTrigger className="w-[200px] bg-white border-[#d0d0d0] font-proxima">
                  <SelectValue placeholder="All Cohorts" />
                </SelectTrigger>
                <SelectContent className="font-proxima">
                  <SelectItem value="all" className="font-proxima">All Cohorts</SelectItem>
                  {availableCohorts.map(cohort => (
                    <SelectItem key={cohort} value={cohort} className="font-proxima">{cohort}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="px-6 py-4 bg-[#4242ea] text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(66,66,234,0.2)] hover:bg-[#3333d1] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(66,66,234,0.3)] font-proxima-bold"
            onClick={handleExport}
          >
            Export Data
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-600 border border-red-200 rounded-md mb-6 font-medium font-proxima">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={view} onValueChange={setView} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="overview" className="px-2 text-sm font-proxima">Overview</TabsTrigger>
            <TabsTrigger value="builders" className="px-2 text-sm font-proxima">Builders</TabsTrigger>
            <TabsTrigger value="companies" className="px-2 text-sm font-proxima">Companies</TabsTrigger>
            <TabsTrigger value="build-projects" className="px-2 text-sm font-proxima">Build Projects</TabsTrigger>
            <TabsTrigger value="events" className="px-2 text-sm font-proxima">Events</TabsTrigger>
            <TabsTrigger value="job-applications" className="px-2 text-sm font-proxima">Job Applications</TabsTrigger>
            <TabsTrigger value="prds" className="relative px-2 text-sm font-proxima">
              PRDs
              {pendingApprovals.length > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 font-proxima">
                  {pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="weekly-goals" className="px-2 text-sm font-proxima">Weekly Goals</TabsTrigger>
            <TabsTrigger value="ceremonies" className="px-2 text-sm font-proxima">Ceremonies</TabsTrigger>
          </TabsList>

          {/* Overview View */}
          <TabsContent value="overview" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Overview...</div></div>}>
              {overview && (
                <OverviewTab
                  overview={overview}
                  leaderboard={leaderboard}
                  highlights={highlights}
                  weekOffset={weekOffset}
                  setWeekOffset={setWeekOffset}
                  expandedHighlightGroups={expandedHighlightGroups}
                  toggleHighlightGroup={toggleHighlightGroup}
                />
              )}
            </Suspense>
          </TabsContent>

          {/* Builders View */}
          <TabsContent value="builders" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Builders...</div></div>}>
              <BuildersTab
                builders={builders}
                builderSortConfig={builderSortConfig}
                handleBuilderSort={handleBuilderSort}
                getSortedBuilders={getSortedBuilders}
                handleBuilderClick={handleBuilderClick}
              />
            </Suspense>
          </TabsContent>

          {/* Companies View */}
          <TabsContent value="companies" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Companies...</div></div>}>
              <CompaniesTab
                companies={companies}
                companiesViewMode={companiesViewMode}
                setCompaniesViewMode={setCompaniesViewMode}
                handleCompanyClick={handleCompanyClick}
              />
            </Suspense>
          </TabsContent>

          {/* PRDs View */}
          <TabsContent value="prds" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading PRDs...</div></div>}>
              <PRDsTab
                pendingApprovals={pendingApprovals}
                approvedPRDs={approvedPRDs}
                prdSubView={prdSubView}
                setPrdSubView={setPrdSubView}
                prdViewMode={prdViewMode}
                setPrdViewMode={setPrdViewMode}
                prdFilter={prdFilter}
                setPrdFilter={setPrdFilter}
                prdSortConfig={prdSortConfig}
                handlePrdSort={handlePrdSort}
                prdStageFilter={prdStageFilter}
                setPrdStageFilter={setPrdStageFilter}
                collapsedPrdColumns={collapsedPrdColumns}
                togglePrdColumnCollapse={(stage) => setCollapsedPrdColumns(prev => ({ ...prev, [stage]: !prev[stage] }))}
                getFilteredAndSortedPRDs={getFilteredAndSortedPRDs}
                getAllPRDsForKanban={getAllPRDsForKanban}
                handleApprovePRD={handleApprovePRD}
              />
            </Suspense>
          </TabsContent>

          {/* Build Projects View */}
          <TabsContent value="build-projects" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Projects...</div></div>}>
              <ProjectsTab
                projects={projects}
                projectsOverview={projectsOverview}
                projectsViewMode={projectsViewMode}
                setProjectsViewMode={setProjectsViewMode}
                stageFilter={stageFilter}
                setStageFilter={setStageFilter}
                sortConfig={sortConfig}
                handleSort={handleSort}
                getFilteredAndSortedProjects={getFilteredAndSortedProjects}
                collapsedProjectColumns={collapsedProjectColumns}
                toggleProjectColumnCollapse={toggleProjectColumnCollapse}
                handleExport={handleProjectsExport}
              />
            </Suspense>
          </TabsContent>

          {/* Ceremonies View */}
          <TabsContent value="ceremonies" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Ceremonies...</div></div>}>
              <CeremoniesTab
                ceremonies={ceremonies}
                archivedCeremonies={archivedCeremonies}
                showArchiveModal={showArchiveModal}
                setShowArchiveModal={setShowArchiveModal}
                fetchArchivedCeremonies={fetchArchivedCeremonies}
                handleArchiveCeremony={handleArchiveCeremony}
              />
            </Suspense>
          </TabsContent>

          {/* Job Applications View */}
          <TabsContent value="job-applications" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Job Applications...</div></div>}>
              <JobApplicationsTab
                jobApplications={jobApplications}
                jobAppViewMode={jobAppViewMode}
                setJobAppViewMode={setJobAppViewMode}
                jobAppSortConfig={jobAppSortConfig}
                handleJobAppSort={handleJobAppSort}
                getSortedJobApplications={getSortedJobApplications}
                selectedJobApplication={selectedJobApplication}
                setSelectedJobApplication={setSelectedJobApplication}
                selectedBuilderFilter={selectedBuilderFilter}
                setSelectedBuilderFilter={setSelectedBuilderFilter}
                showBuilderFilterModal={showBuilderFilterModal}
                setShowBuilderFilterModal={setShowBuilderFilterModal}
                collapsedColumns={collapsedColumns}
                toggleColumnCollapse={toggleColumnCollapse}
                getUniqueBuilders={getUniqueBuilders}
              />
            </Suspense>
          </TabsContent>

          {/* Weekly Goals View */}
          <TabsContent value="weekly-goals" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Weekly Goals...</div></div>}>
              <WeeklyGoalsTab
                weeklyGoals={weeklyGoals}
                weeklyGoalsForm={weeklyGoalsForm}
                setWeeklyGoalsForm={setWeeklyGoalsForm}
                editingGoalId={editingGoalId}
                availableCohorts={availableCohorts}
                handleWeeklyGoalsSubmit={handleWeeklyGoalsSubmit}
                handleEditGoal={handleEditGoal}
                handleDeleteGoal={handleDeleteGoal}
                handleCancelEdit={handleCancelEdit}
              />
            </Suspense>
          </TabsContent>

          {/* Events View */}
          <TabsContent value="events" className="mt-0">
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-gray-500 font-proxima">Loading Events...</div></div>}>
              <EventsTab />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <BuilderDetailModal
          builder={selectedBuilder}
          builderDetails={builderDetails}
          open={!!selectedBuilder}
          onOpenChange={(open) => !open && setSelectedBuilder(null)}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          clearDateFilter={clearDateFilter}
          getFilteredApplications={getFilteredApplications}
        />

        <CompanyDetailModal
          company={selectedCompany}
          companyBuilders={companyBuilders}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
        />
      </div>
      
      {/* Loading Curtain */}
      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
}

export default PathfinderAdmin;

