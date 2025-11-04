import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './PathfinderAdmin.css';

function PathfinderAdmin() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedPRDs, setApprovedPRDs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsOverview, setProjectsOverview] = useState(null);
  const [cohortStats, setCohortStats] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [builderDetails, setBuilderDetails] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyBuilders, setCompanyBuilders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cohortFilter, setCohortFilter] = useState('');
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, etc.
  const [view, setView] = useState('overview'); // overview, builders, companies, prds, build-projects, ceremonies
  const [prdSubView, setPrdSubView] = useState('pending'); // pending, approved
  const [stageFilter, setStageFilter] = useState(''); // For build projects filtering
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

  useEffect(() => {
    if (user.role === 'staff' || user.role === 'admin') {
      // Fetch all data in parallel for better performance
      const fetchAllData = async () => {
        setIsLoading(true);
        
        try {
          // Core data that's always needed
          const corePromises = [
            fetchOverview(),
            fetchBuilders(),
            fetchCompanies(),
            fetchPendingApprovals(),
            fetchApprovedPRDs(),
            fetchProjects(),
            fetchProjectsOverview(),
            fetchCohortStats(),
            fetchHighlights(),
            fetchLeaderboard()
          ];
          
          // View-specific data
          if (view === 'ceremonies') {
            corePromises.push(fetchCeremonies());
          }
          if (view === 'weekly-goals') {
            corePromises.push(fetchWeeklyGoals());
          }
          
          // Execute all fetches in parallel
          await Promise.all(corePromises);
        } catch (err) {
          console.error('Error fetching admin data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAllData();
    }
  }, [token, cohortFilter, weekOffset, view]);

  const fetchOverview = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/overview?weekOffset=${weekOffset}`;
      if (cohortFilter) {
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

  // Calculate week date range for display (Sunday-Saturday)
  const getWeekDateRange = (offset) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day; // Sunday of current week
    const sunday = new Date(now.setDate(diff));
    sunday.setDate(sunday.getDate() + (offset * 7)); // Apply offset
    sunday.setHours(0, 0, 0, 0);
    
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);
    
    const options = { month: 'short', day: 'numeric' };
    return `${sunday.toLocaleDateString('en-US', options)} - ${saturday.toLocaleDateString('en-US', options)}`;
  };

  // Helper function to get milestone details
  const getMilestoneInfo = (item) => {
    switch (item.milestone_type) {
      case 'offer':
        return {
          icon: '🎉',
          text: `${item.first_name} ${item.last_name} received ${item.weekly_offers} offer${item.weekly_offers > 1 ? 's' : ''}!`,
          type: 'highlight'
        };
      case 'launch':
        return {
          icon: '🚀',
          text: `${item.first_name} ${item.last_name} launched ${item.weekly_launches} project${item.weekly_launches > 1 ? 's' : ''}!`,
          type: 'highlight'
        };
      case 'interviews':
        return {
          icon: '💼',
          text: `${item.first_name} ${item.last_name} had ${item.weekly_interviews} interviews this week!`,
          type: 'highlight'
        };
      case 'applications':
        return {
          icon: '📝',
          text: `${item.first_name} ${item.last_name} submitted ${item.weekly_applications} applications!`,
          type: 'highlight'
        };
      case 'networking':
        return {
          icon: '🤝',
          text: `${item.first_name} ${item.last_name} did ${item.weekly_networking} hustle activities!`,
          type: 'highlight'
        };
      // Major Milestones
      case 'first_application':
        return {
          icon: '🎉',
          text: `${item.first_name} ${item.last_name} submitted their first application!`,
          type: 'highlight'
        };
      case 'milestone_10_apps':
        return {
          icon: '🚀',
          text: `${item.first_name} ${item.last_name} reached 10 applications!`,
          type: 'highlight'
        };
      case 'milestone_25_apps':
        return {
          icon: '🔥',
          text: `${item.first_name} ${item.last_name} reached 25 applications!`,
          type: 'highlight'
        };
      case 'milestone_50_apps':
        return {
          icon: '🏆',
          text: `${item.first_name} ${item.last_name} reached 50 applications!`,
          type: 'highlight'
        };
      case 'milestone_100_apps':
        return {
          icon: '💯',
          text: `${item.first_name} ${item.last_name} reached 100 applications!`,
          type: 'highlight'
        };
      case 'first_hustle':
        return {
          icon: '⚡',
          text: `${item.first_name} ${item.last_name} completed their first hustle!`,
          type: 'highlight'
        };
      case 'milestone_10_hustles':
        return {
          icon: '⚡',
          text: `${item.first_name} ${item.last_name} reached 10 hustles!`,
          type: 'highlight'
        };
      case 'milestone_25_hustles':
        return {
          icon: '⚡',
          text: `${item.first_name} ${item.last_name} reached 25 hustles!`,
          type: 'highlight'
        };
      case 'milestone_50_hustles':
        return {
          icon: '⚡',
          text: `${item.first_name} ${item.last_name} reached 50 hustles!`,
          type: 'highlight'
        };
      case 'milestone_100_hustles':
        return {
          icon: '⚡',
          text: `${item.first_name} ${item.last_name} reached 100 hustles!`,
          type: 'highlight'
        };
      case 'first_interview':
        return {
          icon: '🎯',
          text: `${item.first_name} ${item.last_name} had their first interview!`,
          type: 'highlight'
        };
      case 'milestone_5_interviews':
        return {
          icon: '🎙️',
          text: `${item.first_name} ${item.last_name} reached 5 interviews!`,
          type: 'highlight'
        };
      case 'milestone_10_interviews':
        return {
          icon: '🌟',
          text: `${item.first_name} ${item.last_name} reached 10 interviews!`,
          type: 'highlight'
        };
      case 'first_offer':
        return {
          icon: '🎊',
          text: `${item.first_name} ${item.last_name} received their first offer!`,
          type: 'highlight'
        };
      case 'no_activity':
        return {
          icon: '⚠️',
          text: `${item.first_name} ${item.last_name} has no activity at all`,
          type: 'flag'
        };
      case 'inactive':
        return {
          icon: '🔴',
          text: `${item.first_name} ${item.last_name} had no activity this week`,
          type: 'flag'
        };
      default:
        return null;
    }
  };

  const toggleHighlightGroup = (type) => {
    setExpandedHighlightGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const fetchHighlights = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/highlights?weekOffset=${weekOffset}`;
      if (cohortFilter) {
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
      if (cohortFilter) {
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
      const url = cohortFilter
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
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const url = cohortFilter
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

  const handleBuilderClick = (builder) => {
    setSelectedBuilder(builder);
    fetchBuilderDetails(builder.builder_id);
  };

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    try {
      const url = cohortFilter
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
  };

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
    const url = cohortFilter
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
      if (cohortFilter) {
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
      }
    } catch (err) {
      console.error('Error fetching ceremonies:', err);
    }
  };

  const fetchArchivedCeremonies = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/ceremonies/archived`;
      if (cohortFilter) {
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
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('.pathfinder-admin__weekly-goals-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
      } else {
        console.error('Failed to fetch approved PRDs');
      }
    } catch (err) {
      console.error('Error fetching approved PRDs:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const url = cohortFilter
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
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProjectsOverview = async () => {
    try {
      const url = cohortFilter
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

  if (user.role !== 'staff' && user.role !== 'admin') {
    return (
      <div className="pathfinder-admin">
        <div className="pathfinder-admin__access-denied">
          <h2>Access Denied</h2>
          <p>You must be staff or admin to view this dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pathfinder-admin">
        <div className="pathfinder-admin__loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="pathfinder-admin">
      <div className="pathfinder-admin__container">
        <div className="pathfinder-admin__header">
          <h1 className="pathfinder-admin__title">Pathfinder Admin Dashboard</h1>
          <button 
            className="pathfinder-admin__export-btn"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>

        {error && (
          <div className="pathfinder-admin__message pathfinder-admin__message--error">
            {error}
          </div>
        )}

        {/* Tabs and Filter Row */}
        <div className="pathfinder-admin__tabs-row">
          {/* View Tabs */}
          <div className="pathfinder-admin__tabs">
            <button
              className={`pathfinder-admin__tab ${view === 'overview' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('overview')}
            >
              Overview
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'builders' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('builders')}
            >
              Builders
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'companies' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('companies')}
            >
              Companies
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'build-projects' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('build-projects')}
            >
              Build Projects
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'ceremonies' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('ceremonies')}
            >
              Ceremonies
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'prds' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('prds')}
            >
              PRDs
              {pendingApprovals.length > 0 && (
                <span className="pathfinder-admin__tab-badge">{pendingApprovals.length}</span>
              )}
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'weekly-goals' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('weekly-goals')}
            >
              Weekly Goals
            </button>
          </div>

          {/* Filter */}
          <div className="pathfinder-admin__filter-group">
            <label>Filter by Cohort:</label>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="pathfinder-admin__filter-select"
            >
              <option value="">All Cohorts</option>
              {availableCohorts.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview View */}
        {view === 'overview' && overview && (
          <div className="pathfinder-admin__overview">
            {/* This Week Stats */}
            <div className="pathfinder-admin__section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2>{weekOffset === 0 ? 'This Week' : `Week of ${getWeekDateRange(weekOffset)}`}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  title="Previous week"
                >
                  ←
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 0}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    background: weekOffset >= 0 ? '#f5f5f5' : '#ffffff',
                    cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer',
                    opacity: weekOffset >= 0 ? 0.5 : 1,
                    fontSize: '1rem'
                  }}
                  title="Next week"
                >
                  →
                </button>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #4242ea',
                      borderRadius: '6px',
                      background: '#4242ea',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Back to This Week
                  </button>
                )}
              </div>
            </div>

            {/* Week Overview Container */}
            <div className="pathfinder-admin__week-container">
              {/* Leaderboard Panel */}
              <div className="pathfinder-admin__leaderboard-panel">
                <h3>🏆 Top Builders</h3>
                {leaderboard.length > 0 ? (
                  <div className="pathfinder-admin__leaderboard-list">
                    {['top_weekly_networking', 'top_weekly_applications', 'top_weekly_interviews'].map(leaderboardType => {
                      const itemsOfType = leaderboard.filter(item => item.leaderboard_type === leaderboardType);
                      if (itemsOfType.length === 0) return null;

                      const leaderboardLabels = {
                        top_weekly_applications: '📝 Top Applications',
                        top_weekly_interviews: '💼 Top Interviews',
                        top_weekly_networking: '🤝 Top Hustles'
                      };

                      return (
                        <div key={leaderboardType} className="pathfinder-admin__leaderboard-category">
                          <div className="pathfinder-admin__leaderboard-category-title">
                            {leaderboardLabels[leaderboardType]}
                          </div>
                          <ol className="pathfinder-admin__leaderboard-items">
                            {itemsOfType.map((item, index) => {
                              let metric = 0;
                              let metricLabel = '';
                              if (leaderboardType === 'top_weekly_applications') {
                                metric = item.weekly_applications;
                                metricLabel = 'applications';
                              } else if (leaderboardType === 'top_weekly_interviews') {
                                metric = item.weekly_interviews;
                                metricLabel = 'interviews';
                              } else if (leaderboardType === 'top_weekly_networking') {
                                metric = item.weekly_networking;
                                metricLabel = 'hustles';
                              }
                              return (
                                <li key={`${leaderboardType}-${index}`} className="pathfinder-admin__leaderboard-item">
                                  <span className="pathfinder-admin__leaderboard-name">
                                    {item.first_name} {item.last_name}
                                  </span>
                                  <span className="pathfinder-admin__leaderboard-metric">
                                    {metric} {metricLabel}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="pathfinder-admin__no-highlights">No leaderboard data available</p>
                )}
              </div>

              {/* Highlights and Flags Panel */}
              <div className="pathfinder-admin__highlights-panel">
                <h3>Highlights & Flags</h3>
                {highlights.length > 0 ? (
                  <div className="pathfinder-admin__highlights-list">
                    {/* Group by milestone type */}
                    {[
                      'offer', 
                      'launch', 
                      'interviews', 
                      'applications', 
                      'networking',
                      // Major Milestones
                      'first_offer',
                      'milestone_100_apps',
                      'milestone_100_hustles',
                      'milestone_50_apps',
                      'milestone_50_hustles',
                      'milestone_25_apps',
                      'milestone_25_hustles',
                      'milestone_10_interviews',
                      'milestone_10_apps',
                      'milestone_10_hustles',
                      'milestone_5_interviews',
                      'first_interview',
                      'first_application',
                      'first_hustle',
                      'inactive', 
                      'no_activity'
                    ].map(type => {
                      const itemsOfType = highlights.filter(item => {
                        const info = getMilestoneInfo(item);
                        return info && (
                          (type === 'offer' && info.type === 'highlight' && item.weekly_offers > 0) ||
                          (type === 'launch' && info.type === 'highlight' && item.weekly_launches > 0) ||
                          (type === 'interviews' && info.type === 'highlight' && item.weekly_interviews >= 3) ||
                          (type === 'applications' && info.type === 'highlight' && item.weekly_applications >= 10) ||
                          (type === 'networking' && info.type === 'highlight' && item.weekly_networking >= 15) ||
                          // Major Milestones
                          (item.milestone_type === type) ||
                          (type === 'inactive' && item.milestone_type === 'inactive') ||
                          (type === 'no_activity' && item.milestone_type === 'no_activity')
                        );
                      });

                      if (itemsOfType.length === 0) return null;

                      const typeLabels = {
                        offer: '🎉 Offers',
                        launch: '🚀 Project Launches',
                        interviews: '💼 Multiple Interviews',
                        applications: '📝 High Applications',
                        networking: '🤝 High Networking',
                        // Major Milestones
                        first_application: '🎉 First Applications',
                        milestone_10_apps: '🚀 10 Applications',
                        milestone_25_apps: '🔥 25 Applications',
                        milestone_50_apps: '🏆 50 Applications',
                        milestone_100_apps: '💯 100 Applications',
                        first_hustle: '⚡ First Hustles',
                        milestone_10_hustles: '⚡ 10 Hustles',
                        milestone_25_hustles: '⚡ 25 Hustles',
                        milestone_50_hustles: '⚡ 50 Hustles',
                        milestone_100_hustles: '⚡ 100 Hustles',
                        first_interview: '🎯 First Interviews',
                        milestone_5_interviews: '🎙️ 5 Interviews',
                        milestone_10_interviews: '🌟 10 Interviews',
                        first_offer: '🎊 First Offers',
                        inactive: '🔴 Inactive This Week',
                        no_activity: '⚠️ No Activity Ever'
                      };

                      return (
                        <div key={type} className="pathfinder-admin__highlight-group">
                          <div 
                            className="pathfinder-admin__highlight-group-title"
                            onClick={() => toggleHighlightGroup(type)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span>{expandedHighlightGroups[type] ? '▼' : '▶'}</span>
                            <span>{typeLabels[type]}</span>
                            <span>({itemsOfType.length})</span>
                          </div>
                          {expandedHighlightGroups[type] && (
                            <div className="pathfinder-admin__highlight-group-items">
                              {itemsOfType.map((item, index) => {
                                const info = getMilestoneInfo(item);
                                if (!info) return null;
                                return (
                                  <div 
                                    key={`${type}-${index}`}
                                    className={`pathfinder-admin__highlight-item pathfinder-admin__highlight-item--${info.type}`}
                                  >
                                    <span className="pathfinder-admin__highlight-icon">{info.icon}</span>
                                    <span className="pathfinder-admin__highlight-text">{info.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="pathfinder-admin__no-highlights">No highlights or flags for this period</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="pathfinder-admin__stats-section">
                <div className="pathfinder-admin__stats-grid">
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-label">Active Builders</div>
                <div className="pathfinder-admin__stat-value">{overview.weekly_active_builders || 0}</div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Hustles</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_networking || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Digital</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_networking_digital || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">IRL</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_networking_irl || 0}</div>
                </div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged-2">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Builds in Progress</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_builds_in_progress || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Builds Completed</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_builds_completed || 0}</div>
                </div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged-4">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Applications</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_applications || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Interviews</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_interviews || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Offers</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_offers || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Rejections</div>
                  <div className="pathfinder-admin__stat-value">{overview.weekly_rejections || 0}</div>
                </div>
              </div>
            </div>
              </div>
            </div>

            {/* All Time Stats */}
            <div className="pathfinder-admin__section-header" style={{ marginTop: '2rem' }}>
              <h2>All Time</h2>
            </div>

            {/* All Time Overview Container */}
            <div className="pathfinder-admin__week-container">
              {/* All Time Leaderboard Panel */}
              <div className="pathfinder-admin__leaderboard-panel">
                <h3>🏆 Top Builders</h3>
                {leaderboard.length > 0 ? (
                  <div className="pathfinder-admin__leaderboard-list">
                    {['top_total_networking', 'top_total_applications', 'top_total_interviews', 'top_total_offers', 'top_total_launches'].map(leaderboardType => {
                      const itemsOfType = leaderboard.filter(item => item.leaderboard_type === leaderboardType);
                      if (itemsOfType.length === 0) return null;

                      const leaderboardLabels = {
                        top_total_applications: '📝 Top Applications',
                        top_total_interviews: '💼 Top Interviews',
                        top_total_networking: '🤝 Top Hustles',
                        top_total_offers: '🎉 Most Offers',
                        top_total_launches: '🚀 Most Launches'
                      };

                      return (
                        <div key={leaderboardType} className="pathfinder-admin__leaderboard-category">
                          <div className="pathfinder-admin__leaderboard-category-title">
                            {leaderboardLabels[leaderboardType]}
                          </div>
                          <ol className="pathfinder-admin__leaderboard-items">
                            {itemsOfType.map((item, index) => {
                              let metric = 0;
                              let metricLabel = '';
                              if (leaderboardType === 'top_total_applications') {
                                metric = item.total_applications;
                                metricLabel = 'applications';
                              } else if (leaderboardType === 'top_total_interviews') {
                                metric = item.total_interviews;
                                metricLabel = 'interviews';
                              } else if (leaderboardType === 'top_total_networking') {
                                metric = item.total_networking;
                                metricLabel = 'hustles';
                              } else if (leaderboardType === 'top_total_offers') {
                                metric = item.total_offers;
                                metricLabel = 'offers';
                              } else if (leaderboardType === 'top_total_launches') {
                                metric = item.total_launches;
                                metricLabel = 'launches';
                              }
                              return (
                                <li key={`${leaderboardType}-${index}`} className="pathfinder-admin__leaderboard-item">
                                  <span className="pathfinder-admin__leaderboard-name">
                                    {item.first_name} {item.last_name}
                                  </span>
                                  <span className="pathfinder-admin__leaderboard-metric">
                                    {metric} {metricLabel}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="pathfinder-admin__no-highlights">No leaderboard data available</p>
                )}
              </div>

              {/* All Time Highlights and Flags Panel */}
              <div className="pathfinder-admin__highlights-panel">
                <h3>Highlights & Flags</h3>
                {highlights.length > 0 ? (
                  <div className="pathfinder-admin__highlights-list">
                    {/* Group by all-time milestone type */}
                    {['offer_alltime', 'interviews_alltime', 'applications_alltime', 'networking_alltime', 'no_activity_alltime'].map(type => {
                      const itemsOfType = highlights.filter(item => {
                        return (
                          (type === 'offer_alltime' && item.total_offers >= 1) ||
                          (type === 'interviews_alltime' && item.total_interviews >= 5) ||
                          (type === 'applications_alltime' && item.total_applications >= 25) ||
                          (type === 'networking_alltime' && item.total_networking >= 50) ||
                          (type === 'no_activity_alltime' && item.milestone_type === 'no_activity')
                        );
                      });

                      if (itemsOfType.length === 0) return null;

                      const typeLabels = {
                        offer_alltime: '🎉 Received Offers',
                        interviews_alltime: '💼 5+ Interviews',
                        applications_alltime: '📝 25+ Applications',
                        networking_alltime: '🤝 50+ Hustles',
                        no_activity_alltime: '⚠️ No Activity Ever'
                      };

                      return (
                        <div key={type} className="pathfinder-admin__highlight-group">
                          <div 
                            className="pathfinder-admin__highlight-group-title"
                            onClick={() => toggleHighlightGroup(type)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span>{expandedHighlightGroups[type] ? '▼' : '▶'}</span>
                            <span>{typeLabels[type]}</span>
                            <span>({itemsOfType.length})</span>
                          </div>
                          {expandedHighlightGroups[type] && (
                            <div className="pathfinder-admin__highlight-group-items">
                              {itemsOfType.map((item, index) => {
                                let text = '';
                                let icon = '';
                                let bgType = 'highlight';
                                
                                if (type === 'offer_alltime') {
                                  icon = '🎉';
                                  text = `${item.first_name} ${item.last_name} has ${item.total_offers} offer${item.total_offers > 1 ? 's' : ''}`;
                                } else if (type === 'interviews_alltime') {
                                  icon = '💼';
                                  text = `${item.first_name} ${item.last_name} has ${item.total_interviews} interviews`;
                                } else if (type === 'applications_alltime') {
                                  icon = '📝';
                                  text = `${item.first_name} ${item.last_name} has ${item.total_applications} applications`;
                                } else if (type === 'networking_alltime') {
                                  icon = '🤝';
                                  text = `${item.first_name} ${item.last_name} has ${item.total_networking} hustles`;
                                } else if (type === 'no_activity_alltime') {
                                  icon = '⚠️';
                                  text = `${item.first_name} ${item.last_name} has no activity at all`;
                                  bgType = 'flag';
                                }
                                
                                return (
                                  <div 
                                    key={`${type}-${index}`}
                                    className={`pathfinder-admin__highlight-item pathfinder-admin__highlight-item--${bgType}`}
                                  >
                                    <span className="pathfinder-admin__highlight-icon">{icon}</span>
                                    <span className="pathfinder-admin__highlight-text">{text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="pathfinder-admin__no-highlights">No highlights or flags</p>
                )}
              </div>

              {/* All Time Stats Grid */}
              <div className="pathfinder-admin__stats-section">
            <div className="pathfinder-admin__stats-grid">
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-label">Active Builders</div>
                <div className="pathfinder-admin__stat-value">{overview.active_builders || 0}</div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Hustles</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_networking || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Digital</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_networking_digital || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">IRL</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_networking_irl || 0}</div>
                </div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged-2">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Builds in Progress</div>
                  <div className="pathfinder-admin__stat-value">{overview.builds_in_progress || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Builds Completed</div>
                  <div className="pathfinder-admin__stat-value">{overview.builds_completed || 0}</div>
                </div>
              </div>
              <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--merged-4">
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Applications</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_applications || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Interviews</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_interviews || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Offers</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_offers || 0}</div>
                </div>
                <div className="pathfinder-admin__stat-divider"></div>
                <div className="pathfinder-admin__stat-item">
                  <div className="pathfinder-admin__stat-label">Total Rejections</div>
                  <div className="pathfinder-admin__stat-value">{overview.total_rejections || 0}</div>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        )}

        {/* Builders View */}
        {view === 'builders' && (
          <div className="pathfinder-admin__builders">
            <div className="pathfinder-admin__table-container">
              {builders.length === 0 ? (
                <div className="pathfinder-admin__empty">
                  <p>No builders found</p>
                </div>
              ) : (
                <table className="pathfinder-admin__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Cohort</th>
                      <th>Applications</th>
                      <th>Interviews</th>
                      <th>Offers</th>
                      <th>Networking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builders.map(builder => (
                      <tr key={builder.builder_id}>
                        <td>{builder.first_name} {builder.last_name}</td>
                        <td>{builder.email}</td>
                        <td>{builder.cohort || '—'}</td>
                        <td>{builder.application_count || 0}</td>
                        <td>{builder.interview_count || 0}</td>
                        <td>{builder.offer_count || 0}</td>
                        <td>{builder.networking_count || 0}</td>
                        <td>
                          <button
                            className="pathfinder-admin__view-btn"
                            onClick={() => handleBuilderClick(builder)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Companies View */}
        {view === 'companies' && (
          <div className="pathfinder-admin__companies">
            {/* View Mode Toggle */}
            <div className="pathfinder-admin__view-toggle">
              <button
                className={companiesViewMode === 'table' ? 'active' : ''}
                onClick={() => setCompaniesViewMode('table')}
                title="Table View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                </svg>
                Table
              </button>
              <button
                className={companiesViewMode === 'cards' ? 'active' : ''}
                onClick={() => setCompaniesViewMode('cards')}
                title="Card View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
                Cards
              </button>
            </div>

            {/* Table View */}
            {companiesViewMode === 'table' && (
              <div className="pathfinder-admin__table-container">
                {companies.length === 0 ? (
                  <div className="pathfinder-admin__empty">
                    <p>No companies found</p>
                  </div>
                ) : (
                  <table className="pathfinder-admin__table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Total Applications</th>
                        <th>Interviews</th>
                        <th>Offers</th>
                        <th>Rejections</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company, index) => (
                        <tr key={index}>
                          <td>{company.company_name}</td>
                          <td>{company.application_count || 0}</td>
                          <td>{company.interview_count || 0}</td>
                          <td>{company.offer_count || 0}</td>
                          <td>{company.rejected_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Card Grid View */}
            {companiesViewMode === 'cards' && (
              <div className="pathfinder-admin__cards-grid">
                {companies.length === 0 ? (
                  <div className="pathfinder-admin__empty">
                    <p>No companies found</p>
                  </div>
                ) : (
                  companies.map((company, index) => (
                    <div 
                      key={index} 
                      className="pathfinder-admin__company-card"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <div className="pathfinder-admin__company-card-header">
                        <div className="pathfinder-admin__company-card-title-wrapper">
                          {company.company_logo ? (
                            <img 
                              src={company.company_logo} 
                              alt={company.company_name}
                              className="pathfinder-admin__company-card-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = e.target.nextElementSibling;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="pathfinder-admin__company-card-logo-initial"
                            style={{ 
                              backgroundColor: getInitialColor(company.company_name),
                              display: company.company_logo ? 'none' : 'flex'
                            }}
                          >
                            {getCompanyInitial(company.company_name)}
                          </div>
                          <h3 className="pathfinder-admin__company-card-title">{company.company_name}</h3>
                        </div>
                      </div>
                      <div className="pathfinder-admin__company-card-stats">
                        <div className="pathfinder-admin__company-card-stat">
                          <div className="pathfinder-admin__company-card-stat-value">
                            {company.application_count || 0}
                          </div>
                          <div className="pathfinder-admin__company-card-stat-label">Applications</div>
                        </div>
                        <div className="pathfinder-admin__company-card-stat">
                          <div className="pathfinder-admin__company-card-stat-value">
                            {company.interview_count || 0}
                          </div>
                          <div className="pathfinder-admin__company-card-stat-label">Interviews</div>
                        </div>
                        <div className="pathfinder-admin__company-card-stat">
                          <div className="pathfinder-admin__company-card-stat-value">
                            {company.offer_count || 0}
                          </div>
                          <div className="pathfinder-admin__company-card-stat-label">Offers</div>
                        </div>
                        <div className="pathfinder-admin__company-card-stat">
                          <div className="pathfinder-admin__company-card-stat-value">
                            {company.rejected_count || 0}
                          </div>
                          <div className="pathfinder-admin__company-card-stat-label">Rejections</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Company Details Modal */}
        {selectedCompany && companyBuilders.length >= 0 && (
          <div className="pathfinder-admin__modal-overlay" onClick={() => setSelectedCompany(null)}>
            <div className="pathfinder-admin__modal pathfinder-admin__modal--company" onClick={(e) => e.stopPropagation()}>
              <div className="pathfinder-admin__modal-header">
                <h2>{selectedCompany.company_name}</h2>
                <button onClick={() => setSelectedCompany(null)}>×</button>
              </div>
              <div className="pathfinder-admin__modal-body">
                <div className="pathfinder-admin__modal-stats">
                  <div>
                    <strong>Total Applications:</strong> {selectedCompany.application_count || 0}
                  </div>
                  <div>
                    <strong>Unique Builders:</strong> {selectedCompany.builder_count || 0}
                  </div>
                  <div>
                    <strong>Interviews:</strong> {selectedCompany.interview_count || 0}
                  </div>
                  <div>
                    <strong>Offers:</strong> {selectedCompany.offer_count || 0}
                  </div>
                  <div>
                    <strong>Rejections:</strong> {selectedCompany.rejected_count || 0}
                  </div>
                </div>

                <h3>Builders Applying</h3>
                {companyBuilders.length === 0 ? (
                  <p>No builders found for this company.</p>
                ) : (
                  <div className="pathfinder-admin__modal-builders-list">
                    {companyBuilders.map(builder => (
                      <div key={builder.builder_id} className="pathfinder-admin__modal-builder-card">
                        <div className="pathfinder-admin__modal-builder-header">
                          <strong>{builder.first_name} {builder.last_name}</strong>
                          <span className="pathfinder-admin__modal-builder-cohort">{builder.cohort || 'N/A'}</span>
                        </div>
                        <div className="pathfinder-admin__modal-builder-stats">
                          <span>📝 {builder.application_count} {builder.application_count === 1 ? 'app' : 'apps'}</span>
                          <span>🎤 {builder.interview_count} {builder.interview_count === 1 ? 'interview' : 'interviews'}</span>
                          {builder.offer_count > 0 && <span>✅ {builder.offer_count} {builder.offer_count === 1 ? 'offer' : 'offers'}</span>}
                          {builder.rejected_count > 0 && <span>❌ {builder.rejected_count} {builder.rejected_count === 1 ? 'rejection' : 'rejections'}</span>}
                        </div>
                        {builder.applications && builder.applications.length > 0 && (
                          <div className="pathfinder-admin__modal-builder-applications">
                            <strong>Positions:</strong>
                            {builder.applications.slice(0, 3).map((app, idx) => (
                              <div key={idx} className="pathfinder-admin__modal-application-item">
                                <span>{app.role_title}</span>
                                <span className={`pathfinder-admin__modal-stage pathfinder-admin__modal-stage--${app.stage}`}>
                                  {app.stage}
                                </span>
                              </div>
                            ))}
                            {builder.applications.length > 3 && (
                              <div className="pathfinder-admin__modal-application-more">
                                +{builder.applications.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRDs View with Sub-tabs */}
        {view === 'prds' && (
          <div className="pathfinder-admin__prd-approvals">
            <div className="pathfinder-admin__section-header">
              {/* Sub-tab navigation */}
              <div className="pathfinder-admin__prd-subtabs">
                <button
                  className={`pathfinder-admin__prd-subtab ${prdSubView === 'pending' ? 'pathfinder-admin__prd-subtab--active' : ''}`}
                  onClick={() => setPrdSubView('pending')}
                >
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <span className="pathfinder-admin__subtab-badge">{pendingApprovals.length}</span>
                  )}
                </button>
                <button
                  className={`pathfinder-admin__prd-subtab ${prdSubView === 'approved' ? 'pathfinder-admin__prd-subtab--active' : ''}`}
                  onClick={() => setPrdSubView('approved')}
                >
                  Approved Archive
                </button>
              </div>
            </div>

            {/* Pending Approvals Content */}
            {prdSubView === 'pending' && (
              <>
                <div className="pathfinder-admin__section-description">
                  <p>Review and approve builder project PRDs before they can move to development.</p>
                </div>
                <div className="pathfinder-admin__table-container">
                  {pendingApprovals.length === 0 ? (
                    <div className="pathfinder-admin__empty">
                      <p>🎉 No pending PRD approvals!</p>
                    </div>
                  ) : (
                    <table className="pathfinder-admin__table">
                      <thead>
                        <tr>
                          <th>Builder</th>
                          <th>Project Name</th>
                          <th>Stage</th>
                          <th>Target Date</th>
                          <th>Submitted</th>
                          <th>PRD Link</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map((project) => (
                          <tr key={project.project_id}>
                            <td>
                              <div className="pathfinder-admin__builder-info">
                                <strong>{project.first_name} {project.last_name}</strong>
                                <span className="pathfinder-admin__builder-email">{project.email}</span>
                              </div>
                            </td>
                            <td><strong>{project.project_name}</strong></td>
                            <td>
                              <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                                {project.stage}
                              </span>
                            </td>
                            <td>{new Date(project.target_date).toLocaleDateString()}</td>
                            <td>{new Date(project.prd_submitted_at).toLocaleDateString()}</td>
                            <td>
                              {project.prd_link ? (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__prd-link"
                                >
                                  📄 View PRD
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              <button
                                className="pathfinder-admin__approve-btn"
                                onClick={() => handleApprovePRD(project.project_id, project.project_name)}
                              >
                                ✓ Approve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* Approved Archive Content */}
            {prdSubView === 'approved' && (
              <>
                <div className="pathfinder-admin__section-description">
                  <p>View all previously approved project PRDs.</p>
                </div>
                <div className="pathfinder-admin__table-container">
                  {approvedPRDs.length === 0 ? (
                    <div className="pathfinder-admin__empty">
                      <p>No approved PRDs yet.</p>
                    </div>
                  ) : (
                    <table className="pathfinder-admin__table">
                      <thead>
                        <tr>
                          <th>Builder</th>
                          <th>Project Name</th>
                          <th>Stage</th>
                          <th>Target Date</th>
                          <th>Approved By</th>
                          <th>Approved On</th>
                          <th>PRD Link</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedPRDs.map((project) => (
                          <tr key={project.project_id}>
                            <td>
                              <div className="pathfinder-admin__builder-info">
                                <strong>{project.builder_first_name} {project.builder_last_name}</strong>
                                <span className="pathfinder-admin__builder-email">{project.builder_email}</span>
                              </div>
                            </td>
                            <td><strong>{project.project_name}</strong></td>
                            <td>
                              <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                                {project.stage}
                              </span>
                            </td>
                            <td>{new Date(project.target_date).toLocaleDateString()}</td>
                            <td>
                              {project.approver_first_name && project.approver_last_name
                                ? `${project.approver_first_name} ${project.approver_last_name}`
                                : '—'
                              }
                            </td>
                            <td>{new Date(project.prd_approved_at).toLocaleDateString()}</td>
                            <td>
                              {project.prd_link ? (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__prd-link"
                                >
                                  📄 View PRD
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              {project.prd_approval_notes ? (
                                <button
                                  className="pathfinder-admin__view-notes-btn"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Approval Notes',
                                      html: `
                                        <div style="text-align: left; padding: 8px;">
                                          <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
                                            <strong>Project:</strong> ${project.project_name}
                                          </p>
                                          <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">
                                            ${project.prd_approval_notes}
                                          </div>
                                        </div>
                                      `,
                                      confirmButtonColor: '#4242ea',
                                      width: '600px'
                                    });
                                  }}
                                >
                                  View Notes
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Build Projects View */}
        {view === 'build-projects' && (
          <div className="pathfinder-admin__build-projects">
            <div className="pathfinder-admin__section-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>Build Projects Tracker</h2>
                  <p>Track builder projects individually and by cohort.</p>
                </div>
                <button 
                  className="pathfinder-admin__export-btn"
                  onClick={handleProjectsExport}
                  style={{ marginTop: 0 }}
                >
                  Export Projects CSV
                </button>
              </div>
            </div>

            {/* Projects Overview Stats */}
            {projectsOverview && (
              <div className="pathfinder-admin__stats-grid pathfinder-admin__stats-grid--compact">
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.total_projects || 0}</div>
                  <div className="pathfinder-admin__stat-label">Total Projects</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.builders_with_projects || 0}</div>
                  <div className="pathfinder-admin__stat-label">Builders with Projects</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.ideation_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Ideation</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.planning_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Planning</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.development_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Development</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.testing_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Testing</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.launch_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Launched</div>
                </div>
                <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--warning">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.overdue_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Overdue</div>
                </div>
              </div>
            )}

            {/* Cohort Statistics */}
            {!cohortFilter && cohortStats.length > 0 && (
              <div className="pathfinder-admin__cohort-section">
                <h3>Projects by Cohort</h3>
                <div className="pathfinder-admin__table-container">
                  <table className="pathfinder-admin__table">
                    <thead>
                      <tr>
                        <th>Cohort</th>
                        <th>Total Projects</th>
                        <th>Builders</th>
                        <th>Ideation</th>
                        <th>Planning</th>
                        <th>Development</th>
                        <th>Testing</th>
                        <th>Launched</th>
                        <th>Approved PRDs</th>
                        <th>Avg Days to Launch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortStats.map((cohort, index) => (
                        <tr key={index}>
                          <td><strong>{cohort.cohort}</strong></td>
                          <td>{cohort.total_projects || 0}</td>
                          <td>{cohort.builders_with_projects || 0}</td>
                          <td>{cohort.ideation_count || 0}</td>
                          <td>{cohort.planning_count || 0}</td>
                          <td>{cohort.development_count || 0}</td>
                          <td>{cohort.testing_count || 0}</td>
                          <td>{cohort.launch_count || 0}</td>
                          <td>{cohort.approved_count || 0}</td>
                          <td>
                            {cohort.avg_days_to_launch 
                              ? Math.round(cohort.avg_days_to_launch) + ' days'
                              : '—'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* All Projects Table */}
            <div className="pathfinder-admin__projects-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>All Projects {cohortFilter && `(${cohortFilter})`}</h3>
                <div className="pathfinder-admin__filter-group" style={{ marginBottom: 0 }}>
                  <label>Filter by Stage:</label>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="pathfinder-admin__filter-select"
                    style={{ maxWidth: '200px' }}
                  >
                    <option value="">All Stages</option>
                    <option value="ideation">Ideation</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="launch">Launch</option>
                  </select>
                </div>
              </div>
              <div className="pathfinder-admin__table-container">
                {getFilteredAndSortedProjects().length === 0 ? (
                  <div className="pathfinder-admin__empty">
                    <p>No projects found</p>
                  </div>
                ) : (
                  <table className="pathfinder-admin__table">
                    <thead>
                      <tr>
                        <th 
                          onClick={() => handleSort('builder_name')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Builder {sortConfig.key === 'builder_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          onClick={() => handleSort('builder_cohort')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Cohort {sortConfig.key === 'builder_cohort' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          onClick={() => handleSort('project_name')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          onClick={() => handleSort('stage')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Stage {sortConfig.key === 'stage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          onClick={() => handleSort('target_date')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Target Date {sortConfig.key === 'target_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>PRD Status</th>
                        <th>Linked Job</th>
                        <th 
                          onClick={() => handleSort('created_at')} 
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          Created {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAndSortedProjects().map((project) => (
                        <tr key={project.project_id}>
                          <td>
                            <div className="pathfinder-admin__builder-info">
                              <strong>{project.builder_first_name} {project.builder_last_name}</strong>
                              <span className="pathfinder-admin__builder-email">{project.builder_email}</span>
                            </div>
                          </td>
                          <td>{project.builder_cohort || '—'}</td>
                          <td><strong>{project.project_name}</strong></td>
                          <td>
                            <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                              {project.stage}
                            </span>
                          </td>
                          <td>
                            {new Date(project.target_date).toLocaleDateString()}
                            {new Date(project.target_date) < new Date() && project.stage !== 'launch' && (
                              <span className="pathfinder-admin__overdue-badge">⚠️ Overdue</span>
                            )}
                          </td>
                          <td>
                            {project.prd_approved ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--approved">
                                ✓ Approved
                              </span>
                            ) : project.prd_submitted ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--pending">
                                ⏳ Pending
                              </span>
                            ) : project.prd_link ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--draft">
                                📝 Draft
                              </span>
                            ) : (
                              <span className="pathfinder-admin__prd-status">—</span>
                            )}
                          </td>
                          <td>
                            {project.linked_job_company ? (
                              <div className="pathfinder-admin__linked-job">
                                <strong>{project.linked_job_company}</strong>
                                <span>{project.linked_job_role}</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{new Date(project.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="pathfinder-admin__project-links">
                              {project.prd_link && (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__project-link"
                                  title="View PRD"
                                >
                                  📄
                                </a>
                              )}
                              {project.deployment_url && (
                                <a
                                  href={project.deployment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__project-link"
                                  title="View Deployment"
                                >
                                  🚀
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Builder Details Modal */}
        {selectedBuilder && builderDetails && (
          <div className="pathfinder-admin__modal-overlay" onClick={() => setSelectedBuilder(null)}>
            <div className="pathfinder-admin__modal" onClick={(e) => e.stopPropagation()}>
              <div className="pathfinder-admin__modal-header">
                <h2>{selectedBuilder.first_name} {selectedBuilder.last_name}'s Activity</h2>
                <button 
                  className="pathfinder-admin__modal-close"
                  onClick={() => setSelectedBuilder(null)}
                >
                  ×
                </button>
              </div>
              <div className="pathfinder-admin__modal-content">
                {/* Date Range Filter */}
                <div className="pathfinder-admin__date-filter" style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>From:</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>To:</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <button
                      onClick={clearDateFilter}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d0d0d0',
                        borderRadius: '4px',
                        background: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#666'
                      }}
                    >
                      Clear Dates
                    </button>
                  )}
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: 'auto' }}>
                      Showing {getFilteredApplications(builderDetails.applications).length} of {builderDetails.applications?.length || 0} applications
                    </span>
                  )}
                </div>

                <div className="pathfinder-admin__modal-stats">
                  <div className="pathfinder-admin__modal-stat">
                    <strong>Applications:</strong> {builderDetails.applications?.length || 0}
                  </div>
                  <div className="pathfinder-admin__modal-stat">
                    <strong>Networking:</strong> {builderDetails.networking?.length || 0}
                  </div>
                </div>

                {builderDetails.applications && builderDetails.applications.length > 0 && (
                  <div className="pathfinder-admin__modal-section">
                    <h3>Recent Applications</h3>
                    <div className="pathfinder-admin__modal-list">
                      {getFilteredApplications(builderDetails.applications).slice(0, 10).map(app => (
                        <div key={app.application_id} className="pathfinder-admin__modal-item">
                          <div className="pathfinder-admin__modal-item-title">
                            {app.company_name} - {app.role_title}
                          </div>
                          <div className="pathfinder-admin__modal-item-meta">
                            <span className={`pathfinder-admin__modal-badge pathfinder-admin__modal-badge--${app.stage}`}>
                              {app.stage}
                            </span>
                            <span>{new Date(app.date_applied).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {getFilteredApplications(builderDetails.applications).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          No applications found for selected date range
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {builderDetails.networking && builderDetails.networking.length > 0 && (
                  <div className="pathfinder-admin__modal-section">
                    <h3>Recent Networking</h3>
                    <div className="pathfinder-admin__modal-list">
                      {builderDetails.networking.slice(0, 10).map(activity => (
                        <div key={activity.networking_activity_id} className="pathfinder-admin__modal-item">
                          <div className="pathfinder-admin__modal-item-title">
                            {activity.type.replace(/_/g, ' ')}
                          </div>
                          <div className="pathfinder-admin__modal-item-meta">
                            <span>{activity.company || 'No company'}</span>
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ceremonies View */}
        {view === 'ceremonies' && (
          <div className="pathfinder-admin__ceremonies">
            <div className="pathfinder-admin__ceremonies-header">
              <div className="pathfinder-admin__ceremonies-title-row">
                <h2>Builder Ceremonies</h2>
                <button 
                  className="pathfinder-admin__archive-button"
                  onClick={() => {
                    fetchArchivedCeremonies();
                    setShowArchiveModal(true);
                  }}
                >
                  View Archive
                </button>
              </div>
              <p>Celebrating key milestones in the builder journey</p>
            </div>

            <div className="pathfinder-admin__ceremonies-grid">
              {/* Interviews - White Ping Pong Balls */}
              <div className="pathfinder-admin__ceremony-section">
                <div className="pathfinder-admin__ceremony-header">
                  <span className="pathfinder-admin__ceremony-count pathfinder-admin__ceremony-count--interview">
                    {ceremonies.filter(c => c.ceremony_type === 'interview').length}
                  </span>
                  <h3>Interviews</h3>
                </div>
                <div className="pathfinder-admin__ceremony-grid">
                  {ceremonies
                    .filter(c => c.ceremony_type === 'interview')
                    .map((ceremony, index) => (
                      <div key={`interview-${index}`} className="pathfinder-admin__ceremony-item pathfinder-admin__ceremony-item--interview">
                        <div 
                          className="pathfinder-admin__ceremony-icon pathfinder-admin__ceremony-icon--gray-circle pathfinder-admin__ceremony-icon--clickable"
                          onClick={() => handleArchiveCeremony(ceremony)}
                          title="Click to mark as celebrated"
                        ></div>
                        <div className="pathfinder-admin__ceremony-details">
                          <div className="pathfinder-admin__ceremony-name">
                            <span>{ceremony.builder_first_name} {ceremony.builder_last_name}</span>
                            <span className="pathfinder-admin__ceremony-info">
                              {ceremony.company_name && `${ceremony.company_name} - `}
                              {ceremony.role_title}
                            </span>
                          </div>
                          <div className="pathfinder-admin__ceremony-date">
                            {new Date(ceremony.ceremony_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  {ceremonies.filter(c => c.ceremony_type === 'interview').length === 0 && (
                    <div className="pathfinder-admin__ceremony-empty">
                      No interviews yet
                    </div>
                  )}
                </div>
              </div>

              {/* Jobs/Offers - Purple Ping Pong Balls */}
              <div className="pathfinder-admin__ceremony-section">
                <div className="pathfinder-admin__ceremony-header">
                  <span className="pathfinder-admin__ceremony-count pathfinder-admin__ceremony-count--job">
                    {ceremonies.filter(c => c.ceremony_type === 'job').length}
                  </span>
                  <h3>Jobs & Offers</h3>
                </div>
                <div className="pathfinder-admin__ceremony-grid">
                  {ceremonies
                    .filter(c => c.ceremony_type === 'job')
                    .map((ceremony, index) => (
                      <div key={`job-${index}`} className="pathfinder-admin__ceremony-item pathfinder-admin__ceremony-item--job">
                        <div 
                          className="pathfinder-admin__ceremony-icon pathfinder-admin__ceremony-icon--circle pathfinder-admin__ceremony-icon--clickable"
                          onClick={() => handleArchiveCeremony(ceremony)}
                          title="Click to mark as celebrated"
                        ></div>
                        <div className="pathfinder-admin__ceremony-details">
                          <div className="pathfinder-admin__ceremony-name">
                            <span>{ceremony.builder_first_name} {ceremony.builder_last_name}</span>
                            <span className="pathfinder-admin__ceremony-info">
                              {ceremony.company_name && `${ceremony.company_name} - `}
                              {ceremony.role_title}
                            </span>
                          </div>
                          <div className="pathfinder-admin__ceremony-date">
                            {new Date(ceremony.ceremony_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  {ceremonies.filter(c => c.ceremony_type === 'job').length === 0 && (
                    <div className="pathfinder-admin__ceremony-empty">
                      No jobs or offers yet
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Builds - Blue Blocks */}
              <div className="pathfinder-admin__ceremony-section">
                <div className="pathfinder-admin__ceremony-header">
                  <span className="pathfinder-admin__ceremony-count pathfinder-admin__ceremony-count--build">
                    {ceremonies.filter(c => c.ceremony_type === 'build').length}
                  </span>
                  <h3>Builds</h3>
                </div>
                <div className="pathfinder-admin__ceremony-grid">
                  {ceremonies
                    .filter(c => c.ceremony_type === 'build')
                    .map((ceremony, index) => (
                      <div key={`build-${index}`} className="pathfinder-admin__ceremony-item pathfinder-admin__ceremony-item--build">
                        <div 
                          className="pathfinder-admin__ceremony-icon pathfinder-admin__ceremony-icon--square pathfinder-admin__ceremony-icon--clickable"
                          onClick={() => handleArchiveCeremony(ceremony)}
                          title="Click to mark as celebrated"
                        ></div>
                        <div className="pathfinder-admin__ceremony-details">
                          <div className="pathfinder-admin__ceremony-name">
                            <span>{ceremony.builder_first_name} {ceremony.builder_last_name}</span>
                            <span className="pathfinder-admin__ceremony-info">
                              {ceremony.project_name}
                            </span>
                          </div>
                          <div className="pathfinder-admin__ceremony-date">
                            {new Date(ceremony.ceremony_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  {ceremonies.filter(c => c.ceremony_type === 'build').length === 0 && (
                    <div className="pathfinder-admin__ceremony-empty">
                      No builds yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="pathfinder-admin__modal-overlay" onClick={() => setShowArchiveModal(false)}>
          <div className="pathfinder-admin__archive-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pathfinder-admin__archive-modal-header">
              <h2>Celebrated Ceremonies Archive</h2>
              <button 
                className="pathfinder-admin__modal-close"
                onClick={() => setShowArchiveModal(false)}
              >
                ×
              </button>
            </div>
            <div className="pathfinder-admin__archive-modal-content">
              {archivedCeremonies.length === 0 ? (
                <p className="pathfinder-admin__archive-empty">No archived ceremonies yet</p>
              ) : (
                <table className="pathfinder-admin__archive-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job Title / Project</th>
                      <th>Type</th>
                      <th>Milestone Date</th>
                      <th>Celebrated Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedCeremonies.map((ceremony, index) => (
                      <tr key={index}>
                        <td>{ceremony.first_name} {ceremony.last_name}</td>
                        <td>
                          {ceremony.ceremony_type === 'build' 
                            ? ceremony.project_name 
                            : `${ceremony.company_name || ''} - ${ceremony.role_title || ''}`}
                        </td>
                        <td>
                          <span className={`pathfinder-admin__archive-type pathfinder-admin__archive-type--${ceremony.ceremony_type}`}>
                            {ceremony.ceremony_type === 'interview' ? 'Interview' : 
                             ceremony.ceremony_type === 'job' ? 'Job/Offer' : 'Build'}
                          </span>
                        </td>
                        <td>
                          {new Date(ceremony.milestone_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td>
                          {new Date(ceremony.celebrated_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goals View */}
      {view === 'weekly-goals' && (
        <div className="pathfinder-admin__weekly-goals">
          <div className="pathfinder-admin__weekly-goals-header">
            <h2>Weekly Goals Management</h2>
            <p>Set goals for builders to accomplish each week</p>
          </div>

          {/* Add/Edit Form */}
          <div className="pathfinder-admin__weekly-goals-form-container">
            <h3>{editingGoalId ? 'Edit Weekly Goals' : 'Create New Weekly Goals'}</h3>
            <form onSubmit={handleWeeklyGoalsSubmit} className="pathfinder-admin__weekly-goals-form">
              <div className="pathfinder-admin__form-row">
                <div className="pathfinder-admin__form-group">
                  <label>Week Start Date *</label>
                  <input
                    type="date"
                    value={weeklyGoalsForm.weekStartDate}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, weekStartDate: e.target.value})}
                    required
                  />
                </div>
                <div className="pathfinder-admin__form-group">
                  <label>Week End Date *</label>
                  <input
                    type="date"
                    value={weeklyGoalsForm.weekEndDate}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, weekEndDate: e.target.value})}
                    required
                  />
                </div>
                <div className="pathfinder-admin__form-group">
                  <label>Cohort (Optional)</label>
                  <select
                    value={weeklyGoalsForm.cohort}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, cohort: e.target.value})}
                  >
                    <option value="">All Cohorts</option>
                    {availableCohorts.map(cohort => (
                      <option key={cohort} value={cohort}>{cohort}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pathfinder-admin__form-row">
                <div className="pathfinder-admin__form-group">
                  <label>Hustle Goal</label>
                  <input
                    type="number"
                    min="0"
                    value={weeklyGoalsForm.networkingGoal}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, networkingGoal: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="pathfinder-admin__form-group">
                  <label>Applications Goal</label>
                  <input
                    type="number"
                    min="0"
                    value={weeklyGoalsForm.applicationsGoal}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, applicationsGoal: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="pathfinder-admin__form-group">
                  <label>Interviews Goal</label>
                  <input
                    type="number"
                    min="0"
                    value={weeklyGoalsForm.interviewsGoal}
                    onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, interviewsGoal: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pathfinder-admin__form-group">
                <label>Motivational Message (Optional)</label>
                <textarea
                  value={weeklyGoalsForm.message}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, message: e.target.value})}
                  placeholder="Add a motivational message or theme for the week..."
                  rows="3"
                />
              </div>

              <div className="pathfinder-admin__form-actions">
                <button type="submit" className="pathfinder-admin__button pathfinder-admin__button--primary">
                  {editingGoalId ? 'Update Goals' : 'Create Goals'}
                </button>
                {editingGoalId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="pathfinder-admin__button pathfinder-admin__button--secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Goals List */}
          <div className="pathfinder-admin__weekly-goals-list">
            <h3>Previous Weekly Goals</h3>
            {weeklyGoals.length === 0 ? (
              <div className="pathfinder-admin__empty">
                <p>No weekly goals created yet</p>
              </div>
            ) : (
              <div className="pathfinder-admin__goals-grid">
                {weeklyGoals.map(goal => (
                  <div key={goal.goal_id} className="pathfinder-admin__goal-card">
                    <div className="pathfinder-admin__goal-card-header">
                      <div>
                        <h4>
                          {new Date(goal.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                          {new Date(goal.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </h4>
                        {goal.cohort && (
                          <span className="pathfinder-admin__goal-cohort-badge">
                            {goal.cohort}
                          </span>
                        )}
                        {!goal.cohort && (
                          <span className="pathfinder-admin__goal-cohort-badge pathfinder-admin__goal-cohort-badge--all">
                            All Cohorts
                          </span>
                        )}
                      </div>
                      <div className="pathfinder-admin__goal-card-actions">
                        <button 
                          onClick={() => handleEditGoal(goal)}
                          className="pathfinder-admin__icon-button"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteGoal(goal.goal_id)}
                          className="pathfinder-admin__icon-button"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="pathfinder-admin__goal-card-body">
                      <div className="pathfinder-admin__goal-stats">
                        <div className="pathfinder-admin__goal-stat">
                          <span className="pathfinder-admin__goal-stat-value">{goal.networking_goal}</span>
                          <span className="pathfinder-admin__goal-stat-label">Hustle</span>
                        </div>
                        <div className="pathfinder-admin__goal-stat">
                          <span className="pathfinder-admin__goal-stat-value">{goal.applications_goal}</span>
                          <span className="pathfinder-admin__goal-stat-label">Applications</span>
                        </div>
                        <div className="pathfinder-admin__goal-stat">
                          <span className="pathfinder-admin__goal-stat-value">{goal.interviews_goal}</span>
                          <span className="pathfinder-admin__goal-stat-label">Interviews</span>
                        </div>
                      </div>
                      {goal.message && (
                        <div className="pathfinder-admin__goal-message">
                          <strong>Message:</strong> {goal.message}
                        </div>
                      )}
                      {goal.created_by_first_name && (
                        <div className="pathfinder-admin__goal-created-by">
                          Created by {goal.created_by_first_name} {goal.created_by_last_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PathfinderAdmin;

