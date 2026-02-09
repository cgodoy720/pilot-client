import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import CompanyAutocomplete from '../../components/CompanyAutocomplete';
import RichTextEditor from '../../components/RichTextEditor';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import './PathfinderApplications.css';

// Helper function to get local date in YYYY-MM-DD format
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date as MM/DD/YY
const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

function PathfinderApplications() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    stage: 'prospect',
    internalReferral: false,
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    dateApplied: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    sourceType: '',
    notes: '',
    responseReceived: false,
    responseDate: '',
    stageHistory: [],
    jobDescription: '',
    jobUrl: '',
    location: '',
    salaryRange: '',
    salary: '',
    companyLogo: '',
    withdrawalReason: '',
    finalSalary: '',
    startDate: '',
    jobType: '',
    acceptanceNotes: ''
  });

  // Filter state
  const [filterStage, setFilterStage] = useState('all');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // View state
  const [viewMode, setViewMode] = useState('kanban'); // 'table' or 'kanban'
  
  // Form tab state
  const [activeTab, setActiveTab] = useState('job-info');
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('date_applied');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Drag and drop state
  const [draggedApp, setDraggedApp] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [mouseDownTime, setMouseDownTime] = useState(null);

  // Linked activities state
  const [linkedActivities, setLinkedActivities] = useState([]);
  const [activityCounts, setActivityCounts] = useState({});

  // Linked builds state
  const [linkedBuilds, setLinkedBuilds] = useState([]);
  const [buildCounts, setBuildCounts] = useState({});

  // Withdrawal reason modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const [withdrawalReason, setWithdrawalReason] = useState('');

  // Acceptance details modal state
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [pendingAcceptance, setPendingAcceptance] = useState(null);
  const [acceptanceDetails, setAcceptanceDetails] = useState({
    finalSalary: '',
    startDate: '',
    jobType: 'full-time',
    acceptanceNotes: ''
  });
  
  // Victory celebration modal state
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [acceptedJob, setAcceptedJob] = useState(null);
  const [jobJourneyStats, setJobJourneyStats] = useState(null);

  // Collapsed columns state
  const [collapsedColumns, setCollapsedColumns] = useState({});

  useEffect(() => {
    fetchApplications();
    fetchActivityCounts();
    fetchBuildCounts();
  }, [token]);

  // Check if we should auto-open the modal (coming from dashboard)
  useEffect(() => {
    if (location.state?.openModal) {
      setShowForm(true);
      // Clear the state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle query parameter for opening a specific job (from Hustle Tracker)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get('job');
    
    if (jobId && applications.length > 0) {
      const job = applications.find(app => app.job_application_id === parseInt(jobId));
      if (job) {
        handleEdit(job);
        // Clear the query parameter from URL without reloading
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.search, applications]);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showForm) {
        resetForm();
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showForm]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Error loading applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivityCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/networking/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert array to object for easier lookup: { jobId: count }
        const countsMap = {};
        data.forEach(item => {
          countsMap[item.linked_job_id] = parseInt(item.activity_count);
        });
        setActivityCounts(countsMap);
      }
    } catch (err) {
      console.error('Error fetching activity counts:', err);
    }
  };

  const fetchBuildCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Count builds per job
        const countsMap = {};
        data.forEach(project => {
          if (project.linked_job_id) {
            countsMap[project.linked_job_id] = (countsMap[project.linked_job_id] || 0) + 1;
          }
        });
        setBuildCounts(countsMap);
      }
    } catch (err) {
      console.error('Error fetching build counts:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If stage is being changed, update stage history as well
    if (name === 'stage' && isEditing) {
      const today = getLocalDate();
      const currentHistory = formData.stageHistory || [];
      
      // Check if we already have an entry for today
      const lastEntry = currentHistory[currentHistory.length - 1];
      
      if (lastEntry && lastEntry.date === today) {
        // Update today's entry
        const newHistory = [...currentHistory];
        newHistory[newHistory.length - 1] = {
          ...lastEntry,
          stage: value
        };
        setFormData(prev => ({ ...prev, [name]: value, stageHistory: newHistory }));
      } else {
        // Add new entry for today
        const newHistory = [...currentHistory, {
          stage: value,
          date: today,
          notes: null
        }];
        setFormData(prev => ({ ...prev, [name]: value, stageHistory: newHistory }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const detectSourceFromUrl = (url) => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('greenhouse')) return 'Greenhouse';
      if (hostname.includes('indeed')) return 'Indeed';
      if (hostname.includes('lever')) return 'Lever';
      if (hostname.includes('workday')) return 'Workday';
      if (hostname.includes('ashbyhq')) return 'Ashby';
      return 'Job Board';
    } catch (e) {
      return '';
    }
  };

  const handleFetchJobDetails = async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsFetchingUrl(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/scrape-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: jobUrl })
      });

      if (response.ok) {
        const result = await response.json();
        const jobData = result.data;

        // Pre-fill form with scraped data
        setFormData(prev => ({
          ...prev,
          companyName: jobData.companyName || prev.companyName,
          roleTitle: jobData.roleTitle || prev.roleTitle,
          jobUrl: jobUrl,
          source: jobUrl,
          sourceType: jobData.sourceType || prev.sourceType,
          location: jobData.location || prev.location,
          salary: jobData.salaryRange || jobData.salary || prev.salary,
          jobDescription: jobData.description || prev.jobDescription,
          notes: prev.notes // Keep existing notes
        }));

        setError(''); // Clear any previous errors

      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to extract job details from this site. The URL has been saved - please fill in the details manually.');
        
        // Still add URL and detect source type from URL
        const detectedSource = detectSourceFromUrl(jobUrl);
        setFormData(prev => ({
          ...prev,
          jobUrl: jobUrl,
          source: jobUrl,
          sourceType: detectedSource || prev.sourceType
        }));
      }

    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to extract job details from this site. The URL has been saved - please fill in the details manually.');
      
      // Still add URL and detect source type from URL
      const detectedSource = detectSourceFromUrl(jobUrl);
      setFormData(prev => ({
        ...prev,
        jobUrl: jobUrl,
        source: jobUrl,
        sourceType: detectedSource || prev.sourceType
      }));
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/applications/${currentApplication.job_application_id}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/applications`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Show success toast notification
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isEditing ? 'Application updated!' : 'Application added!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        resetForm();
        fetchApplications();
        fetchActivityCounts(); // Refresh activity counts
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save application');
      }
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Error saving application');
    }
  };

  const handleEdit = async (application) => {
    setCurrentApplication(application);
    setIsEditing(true);
    
    // Format date to yyyy-MM-dd for the date input
    let formattedDate = application.date_applied;
    if (formattedDate) {
      // Extract just the date part (yyyy-MM-dd) from any date format
      formattedDate = formattedDate.split('T')[0];
    }
    
    // Format response date if it exists
    let formattedResponseDate = application.response_date || '';
    if (formattedResponseDate) {
      formattedResponseDate = formattedResponseDate.split('T')[0];
    }
    
    setFormData({
      companyName: application.company_name,
      roleTitle: application.role_title,
      stage: application.stage,
      internalReferral: application.internal_referral || false,
      contactName: application.contact_name || '',
      contactTitle: application.contact_title || '',
      contactEmail: application.contact_email || '',
      contactPhone: application.contact_phone || '',
      dateApplied: formattedDate,
      source: application.source || '',
      sourceType: application.source_type || '',
      notes: application.notes || '',
      responseReceived: application.response_received || false,
      responseDate: formattedResponseDate,
      stageHistory: application.stage_history || [],
      jobDescription: application.job_description || '',
      jobUrl: application.job_url || '',
      location: application.location || '',
      salaryRange: application.salary_range || '',
      salary: application.salary || '',
      companyLogo: application.company_logo || '',
      withdrawalReason: application.withdrawal_reason || ''
    });
    setShowForm(true);

    // Fetch linked activities for this job
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/networking/by-job/${application.job_application_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const activities = await response.json();
        setLinkedActivities(activities);
      } else {
        console.error('Failed to fetch linked activities');
        setLinkedActivities([]);
      }
    } catch (error) {
      console.error('Error fetching linked activities:', error);
      setLinkedActivities([]);
    }

    // Fetch linked builds for this job
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/job/${application.job_application_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const builds = await response.json();
        setLinkedBuilds(builds);
      } else {
        console.error('Failed to fetch linked builds');
        setLinkedBuilds([]);
      }
    } catch (error) {
      console.error('Error fetching linked builds:', error);
      setLinkedBuilds([]);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Show success toast notification
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Application deleted!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        fetchApplications();
        fetchActivityCounts(); // Refresh activity counts after deletion
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Error deleting application');
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      roleTitle: '',
      stage: 'prospect',
      internalReferral: false,
      contactName: '',
      contactTitle: '',
      contactEmail: '',
      contactPhone: '',
      dateApplied: format(new Date(), 'yyyy-MM-dd'),
      source: '',
      sourceType: '',
      notes: '',
      responseReceived: false,
      responseDate: '',
      stageHistory: [],
      jobDescription: '',
      jobUrl: '',
      location: '',
      salaryRange: '',
      salary: '',
      companyLogo: ''
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentApplication(null);
    setJobUrl('');
    setIsFetchingUrl(false);
    setError('');
    setLinkedActivities([]);
    setLinkedBuilds([]);
  };

  // Mouse and drag handlers
  const handleCardMouseDown = (e, app) => {
    // Don't track if clicking on buttons
    if (e.target.closest('.pathfinder-applications__kanban-card-btn')) {
      return;
    }
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setMouseDownTime(Date.now());
  };

  const handleCardMouseUp = (e, app) => {
    if (!mouseDownPos || !mouseDownTime) {
      return;
    }

    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPos.x, 2) + 
      Math.pow(e.clientY - mouseDownPos.y, 2)
    );
    const duration = Date.now() - mouseDownTime;

    // If moved less than 10 pixels and duration less than 300ms, treat as click
    if (moveDistance < 10 && duration < 300) {
      handleEdit(app);
    }

    setMouseDownPos(null);
    setMouseDownTime(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedApp) {
      return;
    }

    // Handle interview column grouping
    const interviewStages = ['screen', 'oa', 'interview'];
    const isCurrentlyInInterview = interviewStages.includes(draggedApp.stage);
    const isMovingToInterview = newStage === 'interview';
    
    // If already in the same stage or moving within the interview group, don't update
    if (draggedApp.stage === newStage || (isCurrentlyInInterview && isMovingToInterview)) {
      setDraggedApp(null);
      setIsDragging(false);
      return;
    }

    // If moving to withdrawn, show withdrawal reason modal
    if (newStage === 'withdrawn') {
      setPendingWithdrawal({ app: draggedApp, newStage: 'withdrawn' });
      setShowWithdrawalModal(true);
      setDraggedApp(null);
      setIsDragging(false);
      return;
    }

    // If moving to accepted, show acceptance details modal
    if (newStage === 'accepted') {
      setPendingAcceptance({ app: draggedApp, newStage: 'accepted' });
      setShowAcceptanceModal(true);
      setDraggedApp(null);
      setIsDragging(false);
      return;
    }

    // Determine the actual stage to save
    let actualStage = newStage;
    if (isMovingToInterview && !isCurrentlyInInterview) {
      // Moving from outside interview column to interview - default to 'interview' stage
      actualStage = 'interview';
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/applications/${draggedApp.job_application_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stage: actualStage })
        }
      );

      if (response.ok) {
        // Show success toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Moved to ${getStageLabel(actualStage)}!`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        fetchApplications();
        fetchActivityCounts(); // Refresh activity counts after stage update
      } else {
        setError('Failed to update application stage');
      }
    } catch (err) {
      console.error('Error updating application stage:', err);
      setError('Error updating application stage');
    } finally {
      setDraggedApp(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setIsDragging(false);
  };

  const handleWithdrawalConfirm = async () => {
    if (!pendingWithdrawal || !withdrawalReason) {
      Swal.fire({
        icon: 'error',
        title: 'Please select a reason',
        text: 'You must select a reason for withdrawing from this job.'
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/applications/${pendingWithdrawal.app.job_application_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            stage: 'withdrawn',
            withdrawalReason: withdrawalReason
          })
        }
      );

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Job marked as withdrawn',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        fetchApplications();
        fetchActivityCounts();
        setShowWithdrawalModal(false);
        setPendingWithdrawal(null);
        setWithdrawalReason('');
      } else {
        setError('Failed to update application');
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Error updating application');
    }
  };

  const handleWithdrawalCancel = () => {
    setShowWithdrawalModal(false);
    setPendingWithdrawal(null);
    setWithdrawalReason('');
  };

  // Trigger confetti celebration
  const triggerAcceptanceCelebration = () => {
    const count = 300;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#FFD700', '#FFA500', '#FF6347', '#10b981', '#4242ea']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Calculate journey stats
  const calculateJourneyStats = (app) => {
    const appliedDate = new Date(app.date_applied + 'T00:00:00');
    const acceptedDate = new Date();
    const daysDiff = Math.floor((acceptedDate - appliedDate) / (1000 * 60 * 60 * 24));
    
    return {
      daysToAcceptance: daysDiff,
      appliedDate: appliedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      acceptedDate: acceptedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      stageCount: app.stage_history ? app.stage_history.length : 0
    };
  };

  const handleAcceptanceConfirm = async () => {
    if (!pendingAcceptance) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/applications/${pendingAcceptance.app.job_application_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            stage: 'accepted',
            finalSalary: acceptanceDetails.finalSalary,
            startDate: acceptanceDetails.startDate,
            jobType: acceptanceDetails.jobType,
            acceptanceNotes: acceptanceDetails.acceptanceNotes
          })
        }
      );

      if (response.ok) {
        // Calculate journey stats
        const stats = calculateJourneyStats(pendingAcceptance.app);
        setJobJourneyStats(stats);
        setAcceptedJob({
          ...pendingAcceptance.app,
          finalSalary: acceptanceDetails.finalSalary,
          startDate: acceptanceDetails.startDate,
          jobType: acceptanceDetails.jobType
        });
        
        // Close acceptance details modal
        setShowAcceptanceModal(false);
        setPendingAcceptance(null);
        setAcceptanceDetails({
          finalSalary: '',
          startDate: '',
          jobType: 'full-time',
          acceptanceNotes: ''
        });
        
        // Trigger celebration and show victory modal
        triggerAcceptanceCelebration();
        setShowVictoryModal(true);
        
        fetchApplications();
        fetchActivityCounts();
        fetchBuildCounts();
      } else {
        setError('Failed to update application');
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Error updating application');
    }
  };

  const handleAcceptanceCancel = () => {
    setShowAcceptanceModal(false);
    setPendingAcceptance(null);
    setAcceptanceDetails({
      finalSalary: '',
      startDate: '',
      jobType: 'full-time',
      acceptanceNotes: ''
    });
  };

  const toggleColumnCollapse = (stage) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const getStageColor = (stage) => {
    const colors = {
      prospect: '#ef4444',
      applied: '#6b7280',
      screen: '#3b82f6',
      oa: '#8b5cf6',
      interview: '#f59e0b',
      offer: '#22c55e',
      accepted: '#10b981',
      rejected: '#ef4444',
      withdrawn: '#9ca3af'
    };
    return colors[stage] || '#6b7280';
  };

  const getStageLabel = (stage, context = 'default') => {
    // Use "Added" for prospect in timeline context
    if (stage === 'prospect' && context === 'timeline') {
      return 'Added';
    }
    
    const labels = {
      prospect: 'Prospect',
      applied: 'Applied',
      screen: 'Phone Screen',
      oa: 'Online Assessment',
      interview: 'Interview',
      offer: 'Offer',
      accepted: 'Accepted',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn'
    };
    return labels[stage] || stage;
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

  // Calculate days since last stage change
  const getDaysSinceLastUpdate = (stageHistory) => {
    if (!stageHistory || stageHistory.length === 0) return 0;
    
    const lastStage = stageHistory[stageHistory.length - 1];
    const lastDate = new Date(lastStage.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Render stage history timeline (compact version for cards)
  const renderStageTimeline = (stageHistory) => {
    if (!stageHistory || stageHistory.length === 0) return null;
    
    // Show all stages, but skip "prospect" if the job has moved beyond it
    const stagesToShow = stageHistory.filter((entry, index) => {
      // Keep prospect only if it's the only stage, otherwise skip it
      if (entry.stage === 'prospect' && stageHistory.length > 1) {
        return false;
      }
      return true;
    });
    
    return (
      <div className="pathfinder-applications__stage-timeline">
        {stagesToShow.map((entry, index) => (
          <React.Fragment key={index}>
            <span className="pathfinder-applications__timeline-item">
              <span className="pathfinder-applications__timeline-stage">
                {getStageLabel(entry.stage, 'timeline')}
                <br />
                <span className="pathfinder-applications__timeline-date">
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </span>
            </span>
            {index < stagesToShow.length - 1 && (
              <span className="pathfinder-applications__timeline-arrow"> → </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortApplications = (apps) => {
    const sorted = [...apps].sort((a, b) => {
      let aVal, bVal;

      switch (sortColumn) {
        case 'company_name':
          aVal = a.company_name.toLowerCase();
          bVal = b.company_name.toLowerCase();
          break;
        case 'stage':
          // Sort by stage order: prospect, applied, screen, oa, interview, offer, rejected, withdrawn
          const stageOrder = { prospect: 0, applied: 1, screen: 2, oa: 3, interview: 4, offer: 5, rejected: 6, withdrawn: 7 };
          aVal = stageOrder[a.stage] || 999;
          bVal = stageOrder[b.stage] || 999;
          break;
        case 'date_applied':
          aVal = new Date(a.date_applied).getTime();
          bVal = new Date(b.date_applied).getTime();
          break;
        case 'role_title':
          aVal = a.role_title.toLowerCase();
          bVal = b.role_title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const filteredApplications = applications.filter(app => {
    // Filter by stage
    const stageMatch = filterStage === 'all' || app.stage === filterStage;
    
    // Filter by search query
    const searchMatch = !searchQuery || 
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.source_type && app.source_type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return stageMatch && searchMatch;
  });

  const sortedAndFilteredApplications = sortApplications(filteredApplications);

  return (
    <div className="w-full max-w-full h-full bg-[#f5f5f5] text-[#1a1a1a] overflow-y-auto overflow-x-hidden p-0 px-6 pb-6 box-border relative">
      <div className="max-w-full w-full mx-auto box-border flex flex-col overflow-x-hidden">
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap max-w-full w-full relative">
          <Button 
            className="px-6 py-4 bg-[#4242ea] text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(66,66,234,0.2)] relative overflow-hidden flex-shrink-0 whitespace-nowrap hover:bg-[#3333d1] hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(66,66,234,0.4)] active:translate-y-0 active:scale-100 active:shadow-[0_2px_8px_rgba(66,66,234,0.2)]"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Job'}
          </Button>
          
          <div className="flex items-center gap-4 flex-1 min-w-min justify-end">
            <div className="relative flex items-center flex-[0_1_280px] min-w-[150px]">
              <svg className="absolute left-3 text-[#666666] pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <Input
                type="text"
                className="py-2 px-9 bg-white border border-[#d0d0d0] rounded-md text-[#1a1a1a] text-[0.95rem] w-full box-border transition-colors duration-200 focus:border-[#4242ea] placeholder:text-[#666666] placeholder:opacity-60"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 bg-none border-none text-[#666666] cursor-pointer p-1 rounded text-sm flex items-center justify-center transition-colors duration-200 hover:bg-[#f0f0f0]"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-[180px] bg-white border-[#d0d0d0]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screen">Phone Screen</SelectItem>
                <SelectItem value="oa">Online Assessment</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border border-[#e0e0e0] rounded-md bg-white overflow-hidden">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-2 rounded-none border-none transition-all duration-200 ${viewMode === 'kanban' ? 'bg-[#4242ea] text-white' : 'bg-transparent text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban View"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="3" height="12" fill="currentColor"/>
                  <rect x="6.5" y="2" width="3" height="8" fill="currentColor"/>
                  <rect x="11" y="2" width="3" height="10" fill="currentColor"/>
                </svg>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-2 rounded-none border-none transition-all duration-200 ${viewMode === 'table' ? 'bg-[#4242ea] text-white' : 'bg-transparent text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="12" height="2" fill="currentColor"/>
                  <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
                  <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-[1200px] p-0 flex flex-col max-h-[90vh] overflow-hidden">
            <DialogHeader className="flex flex-row justify-between items-center px-6 py-4 border-b border-[#e0e0e0] flex-shrink-0">
              <DialogTitle className="m-0 text-[#1a1a1a] text-lg font-semibold">
                {isEditing ? 'Edit Job' : 'Add New Job'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* For NEW jobs: show URL panel on left, form on right (no tabs) */}
              {!isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] flex-1 min-h-0">
                  {/* URL Import Panel - LEFT side for new applications */}
                  <Card className="rounded-none border-none shadow-none bg-[#f9f9f9] border-r-2 border-[#e0e0e0] p-6 flex flex-col flex-shrink-0">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-lg font-semibold text-[#1a1a1a]">Import from URL</h4>
                      </div>
                      <p className="text-sm text-[#666666] mb-4 leading-relaxed">
                        Paste a job posting URL to try auto-filling the form. Even if auto-fill doesn't work, the URL will be saved as your source.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Paste URL</label>
                          <textarea
                            value={jobUrl}
                            onChange={(e) => {
                              setJobUrl(e.target.value);
                              setError(''); // Clear error when typing new URL
                            }}
                            placeholder="https://www.linkedin.com/jobs/view/..."
                            rows="5"
                            className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                handleFetchJobDetails();
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleFetchJobDetails}
                          disabled={isFetchingUrl || !jobUrl.trim()}
                          className="w-full bg-[#4242ea] text-white hover:bg-[#3333d1] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isFetchingUrl ? 'Fetching Details...' : 'Fetch Details'}
                        </Button>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-sm text-[#1a1a1a] font-medium mb-2">Supported:</div>
                        <div className="text-xs text-[#666666] space-y-1">
                          <div><strong>Works Best:</strong> Greenhouse, Lever, Workday</div>
                          <div><strong>Limited:</strong> LinkedIn, Indeed (may require manual entry)</div>
                        </div>
                      </div>
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                          {error}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Form Panel - RIGHT side for new applications */}
                  <Card className="rounded-none border-none shadow-none bg-white p-6 flex flex-col overflow-y-auto min-h-0">
                    <CardContent className="p-0">
                      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Job Details</h3>

                      <div className="space-y-6">
                        {/* Row 1: Company Name, Role Title */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Company Name *</label>
                            <div className="relative">
                              <CompanyAutocomplete
                                value={formData.companyName}
                                onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                                required
                                className="!p-2 !pr-10"
                              />
                              {formData.companyLogo && (
                                <img 
                                  src={formData.companyLogo} 
                                  alt={formData.companyName}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 object-contain pointer-events-none"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Role Title *</label>
                            <Input
                              type="text"
                              name="roleTitle"
                              value={formData.roleTitle}
                              onChange={handleInputChange}
                              required
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Row 2: Source URL, Source Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Source URL</label>
                            <Input
                              type="url"
                              name="source"
                              value={formData.source}
                              onChange={handleInputChange}
                              placeholder="https://..."
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Source Type</label>
                            <Select
                              name="sourceType"
                              value={formData.sourceType}
                              onValueChange={(value) => handleInputChange({ target: { name: 'sourceType', value } })}
                            >
                              <SelectTrigger className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent">
                                <SelectValue placeholder="Select source..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                                <SelectItem value="Indeed">Indeed</SelectItem>
                                <SelectItem value="Lever">Lever</SelectItem>
                                <SelectItem value="Company Website">Company Website</SelectItem>
                                <SelectItem value="Referral">Referral</SelectItem>
                                <SelectItem value="Recruiter">Recruiter</SelectItem>
                                <SelectItem value="Job Board">Job Board</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Row 3: Salary, Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Salary</label>
                            <Input
                              type="text"
                              name="salary"
                              value={formData.salary}
                              onChange={handleInputChange}
                              placeholder="e.g., $80,000 - $100,000"
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Location</label>
                            <Input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="e.g., New York, NY or Remote"
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                            Job Description
                            {formData.jobDescription && (
                              <span className="ml-2 text-xs text-[#666666]">
                                ({formData.jobDescription.length.toLocaleString()} characters)
                              </span>
                            )}
                            <span className="ml-2 text-xs text-[#666666]">
                              💡 Saved for reference after job posting is taken down
                            </span>
                          </label>
                          <RichTextEditor
                            value={formData.jobDescription}
                            onChange={(value) => setFormData(prev => ({ ...prev, jobDescription: value }))}
                            placeholder="Paste or enter the full job description here... (auto-filled when fetching from URL)"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="internalReferral"
                            name="internalReferral"
                            checked={formData.internalReferral}
                            onChange={(e) => setFormData(prev => ({ ...prev, internalReferral: e.target.checked }))}
                            className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                          />
                          <label htmlFor="internalReferral" className="text-sm text-[#1a1a1a] cursor-pointer">Internal Referral</label>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Name</label>
                            <Input
                              type="text"
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Title</label>
                            <Input
                              type="text"
                              name="contactTitle"
                              value={formData.contactTitle}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Email</label>
                            <Input
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Phone</label>
                            <Input
                              type="tel"
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              placeholder="(555) 555-5555"
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Notes</label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="6"
                            placeholder="Add any additional notes, insights, or follow-up actions..."
                            className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                  // For EDITING jobs: show tabbed form on left, timeline on right
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] flex-1 min-h-0 overflow-hidden">
                    {/* Left Section: Tabs + Form Panel */}
                    <div className="flex flex-col border-r border-[#e0e0e0] min-h-0">
                      {/* Tab Navigation */}
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full justify-start rounded-none border-b border-[#e0e0e0] bg-white p-0 h-auto flex-shrink-0">
                          <TabsTrigger 
                            value="job-info" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4242ea] data-[state=active]:bg-[rgba(66,66,234,0.05)] px-6 py-2.5 font-semibold data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            Job Info
                          </TabsTrigger>
                          <TabsTrigger 
                            value="contacts"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4242ea] data-[state=active]:bg-[rgba(66,66,234,0.05)] px-6 py-2.5 font-semibold data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            Contacts
                          </TabsTrigger>
                          <TabsTrigger 
                            value="notes"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4242ea] data-[state=active]:bg-[rgba(66,66,234,0.05)] px-6 py-2.5 font-semibold data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            Notes
                          </TabsTrigger>
                        </TabsList>

                        {/* Form Panel - inside left section with proper scrolling */}
                        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
                          <div className="p-6">
                          {/* Job Info Tab */}
                          <TabsContent value="job-info" className="mt-0 space-y-6">
                            {/* Row 1: Company Name, Role Title */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Company Name *</label>
                                <div className="relative">
                                  <CompanyAutocomplete
                                    value={formData.companyName}
                                    onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                                    required
                                    className="!p-2 !pr-10"
                                  />
                                  {formData.companyLogo && (
                                    <img 
                                      src={formData.companyLogo} 
                                      alt={formData.companyName}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 object-contain pointer-events-none"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Role Title *</label>
                                <Input
                                  type="text"
                                  name="roleTitle"
                                  value={formData.roleTitle}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                            </div>

                            {/* Row 2: Source URL, Source Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Source URL</label>
                                <Input
                                  type="url"
                                  name="source"
                                  value={formData.source}
                                  onChange={handleInputChange}
                                  placeholder="https://..."
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Source Type</label>
                                <Select
                                  name="sourceType"
                                  value={formData.sourceType}
                                  onValueChange={(value) => handleInputChange({ target: { name: 'sourceType', value } })}
                                >
                                  <SelectTrigger className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent">
                                    <SelectValue placeholder="Select source..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                                    <SelectItem value="Indeed">Indeed</SelectItem>
                                    <SelectItem value="Lever">Lever</SelectItem>
                                    <SelectItem value="Company Website">Company Website</SelectItem>
                                    <SelectItem value="Referral">Referral</SelectItem>
                                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                                    <SelectItem value="Job Board">Job Board</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Row 3: Salary, Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Salary</label>
                                <Input
                                  type="text"
                                  name="salary"
                                  value={formData.salary}
                                  onChange={handleInputChange}
                                  placeholder="e.g., $80,000 - $100,000"
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Location</label>
                                <Input
                                  type="text"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  placeholder="e.g., New York, NY or Remote"
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                                Job Description
                                {formData.jobDescription && (
                                  <span className="ml-2 text-xs text-[#666666]">
                                    ({formData.jobDescription.length.toLocaleString()} characters)
                                  </span>
                                )}
                                <span className="ml-2 text-xs text-[#666666]">
                                  💡 Saved for reference after job posting is taken down
                                </span>
                              </label>
                              <RichTextEditor
                                value={formData.jobDescription}
                                onChange={(value) => setFormData(prev => ({ ...prev, jobDescription: value }))}
                                placeholder="Paste or enter the full job description here... (auto-filled when fetching from URL)"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="internalReferral-edit"
                                name="internalReferral"
                                checked={formData.internalReferral}
                                onChange={(e) => setFormData(prev => ({ ...prev, internalReferral: e.target.checked }))}
                                className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                              />
                              <label htmlFor="internalReferral-edit" className="text-sm text-[#1a1a1a] cursor-pointer">Internal Referral</label>
                            </div>
                          </TabsContent>

                          {/* Contacts Tab */}
                          <TabsContent value="contacts" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Name</label>
                                <Input
                                  type="text"
                                  name="contactName"
                                  value={formData.contactName}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Title</label>
                                <Input
                                  type="text"
                                  name="contactTitle"
                                  value={formData.contactTitle}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Email</label>
                                <Input
                                  type="email"
                                  name="contactEmail"
                                  value={formData.contactEmail}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Phone</label>
                                <Input
                                  type="tel"
                                  name="contactPhone"
                                  value={formData.contactPhone}
                                  onChange={handleInputChange}
                                  placeholder="(555) 555-5555"
                                  className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          {/* Notes Tab */}
                          <TabsContent value="notes" className="mt-0 space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Notes</label>
                              <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="10"
                                placeholder="Add any additional notes, insights, or follow-up actions..."
                                className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                              />
                            </div>
                          </TabsContent>
                        </div>
                        </div>
                      </Tabs>
                    </div> {/* End left-section */}

                    {/* Right Panel - Activity Timeline (only when editing) */}
                    {formData.stageHistory && formData.stageHistory.length > 0 && (
                      <div className="flex flex-col min-h-0 bg-[#fafafa] overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Activity Timeline</h3>
                          <div className="relative pl-6 space-y-4">
                            {/* Vertical line */}
                            <div className="absolute left-2 top-3 bottom-4 w-0.5 bg-[#d0d0d0]"></div>
                            
                            {formData.stageHistory.map((entry, index) => (
                              <div key={index} className="relative flex items-center gap-3">
                                {/* Timeline marker (dot) */}
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#4242ea] border-[3px] border-[#fafafa] z-10"></div>
                                
                                <div className="flex-1 flex items-center gap-2">
                                  <Select
                                    value={entry.stage}
                                    onValueChange={(value) => {
                                      const newHistory = [...formData.stageHistory];
                                      newHistory[index].stage = value;
                                      
                                      // If this is the last (most recent) stage, update the main stage field too
                                      if (index === newHistory.length - 1) {
                                        setFormData(prev => ({ ...prev, stageHistory: newHistory, stage: value }));
                                      } else {
                                        setFormData(prev => ({ ...prev, stageHistory: newHistory }));
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-auto px-3 py-1.5 text-sm border-[#d1d5db] bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="prospect">Prospect</SelectItem>
                                      <SelectItem value="applied">Applied</SelectItem>
                                      <SelectItem value="screen">Phone Screen</SelectItem>
                                      <SelectItem value="oa">Online Assessment</SelectItem>
                                      <SelectItem value="interview">Interview</SelectItem>
                                      <SelectItem value="offer">Offer</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input
                                    type="date"
                                    value={entry.date ? entry.date.split('T')[0] : ''}
                                    onChange={(e) => {
                                      const newHistory = [...formData.stageHistory];
                                      newHistory[index].date = e.target.value;
                                      setFormData(prev => ({ ...prev, stageHistory: newHistory }));
                                    }}
                                    className="w-[130px] p-1.5 text-sm text-center border-[#d1d5db]"
                                  />
                                  
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newHistory = formData.stageHistory.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, stageHistory: newHistory }));
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                      title="Remove"
                                    >
                                      ✕
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            type="button"
                            onClick={() => {
                              // Use the current main stage as the new stage to add
                              const newStage = formData.stage;
                              const newHistory = [...formData.stageHistory, {
                                stage: newStage,
                                date: getLocalDate(),
                                notes: null
                              }];
                              // Update both stage history and ensure main stage is set to this new stage
                              setFormData(prev => ({ ...prev, stageHistory: newHistory, stage: newStage }));
                            }}
                            className="w-auto bg-[#4242ea] text-white hover:bg-[#3535d1] mt-4"
                          >
                            + Add Activity
                          </Button>

                          {/* Associated Hustle Section */}
                          <div className="mt-6 pt-6 border-t border-[#e0e0e0]">
                            <h4 className="text-base font-semibold text-[#1a1a1a] mb-3">Associated Hustle</h4>
                            {linkedActivities.length > 0 ? (
                              <div className="space-y-3">
                                {linkedActivities.map((activity) => (
                                  <Card key={activity.networking_activity_id} className="p-3 bg-white border-[#e0e0e0]">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#e0e0e0]">
                                      <span className="text-xs font-semibold text-[#4242ea]">
                                        {activity.type === 'digital' ? '💻' : '👥'} {activity.type?.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-[#666666]">
                                        {formatShortDate(activity.date ? activity.date.split('T')[0] : '')}
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      {activity.platform && (
                                        <div className="text-[#1a1a1a]">
                                          <strong>{activity.platform}</strong>
                                          {activity.sub_type && ` - ${activity.sub_type.replace(/_/g, ' ')}`}
                                        </div>
                                      )}
                                      {activity.event_name && (
                                        <div className="text-[#1a1a1a]">
                                          <strong className="text-[#666666] font-medium">Event:</strong> {activity.event_name}
                                        </div>
                                      )}
                                      {activity.contact_name && (
                                        <div className="text-[#1a1a1a]">
                                          <strong className="text-[#666666] font-medium">Contact:</strong> {activity.contact_name}
                                          {activity.company && ` at ${activity.company}`}
                                        </div>
                                      )}
                                      {activity.direction && (
                                        <div className="text-[#1a1a1a]">
                                          <strong className="text-[#666666] font-medium">Direction:</strong> {activity.direction === 'inbound' ? '← Inbound' : '→ Outbound'}
                                        </div>
                                      )}
                                      {activity.outcome && activity.outcome !== 'pending' && (
                                        <div className="text-[#1a1a1a]">
                                          <strong className="text-[#666666] font-medium">Outcome:</strong> {activity.outcome.replace(/_/g, ' ')}
                                        </div>
                                      )}
                                      {activity.notes && (
                                        <div className="mt-2 p-2 bg-white border border-[#e0e0e0] rounded text-xs text-[#666666]">
                                          {activity.notes}
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center p-6 bg-[#fafafa] border border-dashed border-[#d0d0d0] rounded-lg">
                                <p className="text-sm text-[#666666] mb-3">
                                  You haven't hustled yet for this job. Brainstorm some ideas and start tracking your Hustle!
                                </p>
                                <Button
                                  type="button"
                                  className="bg-[#4242ea] text-white hover:bg-[#3535d1]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '/pathfinder/networking';
                                  }}
                                >
                                  Go to Hustle Tracker
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Associated Builds Section */}
                          <div className="mt-6 pt-6 border-t border-[#e0e0e0]">
                            <h4 className="text-base font-semibold text-[#1a1a1a] mb-3">Associated Builds</h4>
                            {linkedBuilds.length > 0 ? (
                              <div className="space-y-3">
                                {linkedBuilds.map((build) => (
                                  <Card key={build.project_id} className="p-3 bg-[#f9fafb] border-[#e5e7eb] hover:bg-[#f3f4f6] transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-semibold text-[#1a1a1a]">
                                        {build.project_name}
                                      </span>
                                      <Badge className={`text-xs font-semibold uppercase ${
                                        build.stage === 'ideation' ? 'bg-gray-100 text-gray-700' :
                                        build.stage === 'planning' ? 'bg-blue-100 text-blue-700' :
                                        build.stage === 'development' ? 'bg-yellow-100 text-yellow-700' :
                                        build.stage === 'testing' ? 'bg-orange-100 text-orange-700' :
                                        build.stage === 'launch' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {build.stage.charAt(0).toUpperCase() + build.stage.slice(1)}
                                      </Badge>
                                    </div>
                                    {build.target_date && (
                                      <div className="text-sm text-[#6b7280] mb-1">
                                        Target: {new Date(build.target_date).toLocaleDateString()}
                                      </div>
                                    )}
                                    {build.deployment_url && (
                                      <div className="mt-2">
                                        <a 
                                          href={build.deployment_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium text-[#4242ea] hover:text-[#3232ba] hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          🔗 View Live App
                                        </a>
                                      </div>
                                    )}
                                    {build.notes && (
                                      <div className="mt-2 text-sm text-[#6b7280]">
                                        {build.notes}
                                      </div>
                                    )}
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center p-6 bg-[#fafafa] border border-dashed border-[#d0d0d0] rounded-lg">
                                <p className="text-sm text-[#666666] mb-3">
                                  No projects linked to this job yet. Build something that links your skills to this job!
                                </p>
                                <Button
                                  type="button"
                                  className="bg-[#4242ea] text-white hover:bg-[#3535d1]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '/pathfinder/projects';
                                  }}
                                >
                                  Go to Build Tracker
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              
              <DialogFooter className="flex justify-end px-6 py-3 border-t border-[#e0e0e0] bg-white flex-shrink-0 gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#4242ea] text-white hover:bg-[#3333d1]">
                  {isEditing ? 'Update Application' : 'Add Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Applications View - Table or Kanban */}
        {viewMode === 'table' ? (
          <div className="w-full overflow-x-auto bg-white rounded-lg border border-[#e0e0e0]">
            {sortedAndFilteredApplications.length === 0 ? (
              <div className="text-center p-8 text-[#666666]">
                <p>No applications yet. Click "+ New Application" to add your first one!</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#e0e0e0] bg-[#f9f9f9]">
                    <th 
                      onClick={() => handleSort('company_name')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Company
                      {sortColumn === 'company_name' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('stage')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Current Stage
                      {sortColumn === 'stage' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('date_applied')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Date Applied / Deadline
                      {sortColumn === 'date_applied' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('role_title')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Position Title
                      {sortColumn === 'role_title' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Job Posting</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredApplications.map(app => (
                    <tr key={app.job_application_id} className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        <div className="flex items-center gap-3">
                          {app.company_logo ? (
                            <img 
                              src={app.company_logo} 
                              alt={app.company_name}
                              className="w-8 h-8 rounded object-contain bg-white p-1 flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = e.target.nextElementSibling;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-sm uppercase flex-shrink-0"
                            style={{ 
                              backgroundColor: getInitialColor(app.company_name),
                              display: app.company_logo ? 'none' : 'flex'
                            }}
                          >
                            {getCompanyInitial(app.company_name)}
                          </div>
                          <span className="font-semibold text-[#1a1a1a]">{app.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-[#6b7280] bg-white border border-[#d1d5db]">
                            {getStageLabel(app.stage)}
                          </span>
                          {app.response_received && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                              📧
                            </span>
                          )}
                          {(() => {
                            const daysSinceUpdate = getDaysSinceLastUpdate(app.stage_history);
                            if (daysSinceUpdate >= 30 && app.stage === 'applied') {
                              return (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                                  ⚠️ {daysSinceUpdate}d
                                </span>
                              );
                            } else if (daysSinceUpdate >= 14 && app.stage === 'applied') {
                              return (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                                  ⏳ {daysSinceUpdate}d
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {app.stage === 'prospect' ? 'Deadline: ' : 'Applied: '}
                        {new Date(app.date_applied).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">{app.role_title}</td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {app.source ? (
                          <a 
                            href={app.source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#4242ea] font-medium no-underline transition-colors hover:text-[#3333d1] hover:underline"
                          >
                            View Posting
                          </a>
                        ) : (
                          <span className="text-[#999999] opacity-50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="h-8 px-3 text-xs bg-[#4242ea] text-white border-none rounded transition-all hover:bg-[#3333d1] font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(app.job_application_id)}
                            className="h-8 px-3 text-xs bg-[#ef4444] text-white border-none rounded transition-all hover:bg-[#dc2626] font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {sortedAndFilteredApplications.length === 0 ? (
              <div className="text-center p-8 text-[#666666]">
                <p>No applications yet. Click "+ Add Job" to add your first one!</p>
              </div>
            ) : (
              <>
                {['prospect', 'applied', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn'].map(stage => {
                  // For interview column, include screen, oa, and interview stages
                  const stageApplications = stage === 'interview' 
                    ? sortedAndFilteredApplications.filter(app => ['screen', 'oa', 'interview'].includes(app.stage))
                    : sortedAndFilteredApplications.filter(app => app.stage === stage);
                  
                  return (
                    <div 
                      key={stage} 
                      className={`flex-shrink-0 w-80 bg-[#f8f9fa] rounded-lg p-4 border border-[#e0e0e0] transition-all duration-200 hover:shadow-sm ${collapsedColumns[stage] ? 'w-16' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, stage)}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e0e0e0]">
                        <h3 className={`font-semibold text-[#1a1a1a] text-sm uppercase tracking-wide ${collapsedColumns[stage] ? 'transform -rotate-90 origin-center whitespace-nowrap' : ''}`}>
                          {getStageLabel(stage)}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-[#e0e0e0] text-[#666666] text-xs px-2 py-1">
                            {stageApplications.length}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-[#e0e0e0]"
                            onClick={() => toggleColumnCollapse(stage)}
                            title={collapsedColumns[stage] ? "Expand column" : "Collapse column"}
                          >
                            {collapsedColumns[stage] ? '→' : '←'}
                          </Button>
                        </div>
                      </div>
                      {!collapsedColumns[stage] && (
                        <div className="flex flex-col gap-3">
                        {stageApplications.map(app => (
                          <Card 
                            key={app.job_application_id} 
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-white border-[#e0e0e0] relative ${draggedApp?.job_application_id === app.job_application_id ? 'opacity-50 rotate-2' : ''}`}
                            draggable
                            onMouseDown={(e) => handleCardMouseDown(e, app)}
                            onMouseUp={(e) => handleCardMouseUp(e, app)}
                            onDragStart={(e) => handleDragStart(e, app)}
                            onDragEnd={handleDragEnd}
                          >
                            <CardContent className="p-4 relative">
                            {/* Stale Indicator - Top Right */}
                            {(() => {
                              const daysSinceUpdate = getDaysSinceLastUpdate(app.stage_history);
                              if (daysSinceUpdate >= 30 && app.stage === 'applied') {
                                return (
                                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                                    ⚠️ {daysSinceUpdate}d
                                  </Badge>
                                );
                              } else if (daysSinceUpdate >= 14 && app.stage === 'applied') {
                                return (
                                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5">
                                    ⏳ {daysSinceUpdate}d
                                  </Badge>
                                );
                              }
                              return null;
                            })()}
                            
                            {/* Company Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {app.stage === 'accepted' ? (
                                  <div 
                                    className="text-2xl"
                                    title="Accepted Offer!"
                                  >
                                    🏆
                                  </div>
                                ) : app.company_logo ? (
                                  <img 
                                    src={app.company_logo} 
                                    alt={app.company_name}
                                    className="w-8 h-8 object-contain rounded border"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const placeholder = e.target.nextElementSibling;
                                      if (placeholder) placeholder.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                {app.stage !== 'accepted' && (
                                  <div 
                                    className="w-8 h-8 rounded text-white text-sm font-semibold flex items-center justify-center"
                                    style={{ 
                                      backgroundColor: getInitialColor(app.company_name),
                                      display: app.company_logo ? 'none' : 'flex'
                                    }}
                                  >
                                    {getCompanyInitial(app.company_name)}
                                  </div>
                                )}
                                <h4 className="font-semibold text-[#1a1a1a] text-sm leading-tight">{app.company_name}</h4>
                              </div>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(app.job_application_id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                draggable={false}
                                title="Delete"
                              >
                                🗑️
                              </Button>
                            </div>
                            
                            <p className="font-medium text-[#1a1a1a] text-sm mb-3 leading-tight">{app.role_title}</p>
                            
                            {/* Withdrawal Reason - Only show for withdrawn jobs */}
                            {app.stage === 'withdrawn' && app.withdrawal_reason && (
                              <div className="text-xs text-[#666] mb-2 p-2 bg-gray-50 rounded">
                                <span className="font-medium">Reason:</span> {app.withdrawal_reason}
                              </div>
                            )}
                            
                            {/* Badges Container */}
                            <div className="flex flex-wrap gap-1.5">
                              {/* Response Received Badge */}
                              {app.response_received && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                                  📧 Response
                                </Badge>
                              )}
                              
                              {/* Linked Activities Badge */}
                              {activityCounts[app.job_application_id] > 0 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700">
                                  ⚡ {activityCounts[app.job_application_id]} {activityCounts[app.job_application_id] === 1 ? 'Hustle' : 'Hustles'}
                                </Badge>
                              )}

                              {/* Linked Builds Badge */}
                              {buildCounts[app.job_application_id] > 0 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700">
                                  🔧 {buildCounts[app.job_application_id] === 1 ? 'Build' : 'Builds'}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Stage History Timeline - Outside padded content */}
                            {renderStageTimeline(app.stage_history)}
                            </CardContent>
                          </Card>
                        ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Reason Modal */}
      <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Why are you withdrawing from {pendingWithdrawal?.app.company_name}?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#6b7280]">
              Select a reason to help track patterns in your job search journey.
            </p>
            
            <Select value={withdrawalReason} onValueChange={setWithdrawalReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not a Good Fit">Not a Good Fit</SelectItem>
                <SelectItem value="Compensation & Benefits">Compensation & Benefits</SelectItem>
                <SelectItem value="Better Opportunity">Better Opportunity</SelectItem>
                <SelectItem value="Personal Reasons">Personal Reasons</SelectItem>
                <SelectItem value="Company/Role Concerns">Company/Role Concerns</SelectItem>
                <SelectItem value="Process Issues">Process Issues</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleWithdrawalCancel}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleWithdrawalConfirm}
              disabled={!withdrawalReason}
              className="bg-[#4242ea] text-white hover:bg-[#3333d1] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Acceptance Details Modal */}
      <Dialog open={showAcceptanceModal} onOpenChange={setShowAcceptanceModal}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              🎉 Congratulations!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#6b7280]">
              Track your accepted offer details to reference later!
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Final Salary/Compensation</label>
                <Input
                  type="text"
                  placeholder="e.g., $120,000/year, $60/hour"
                  value={acceptanceDetails.finalSalary}
                  onChange={(e) => setAcceptanceDetails(prev => ({ ...prev, finalSalary: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Start Date</label>
                <Input
                  type="date"
                  value={acceptanceDetails.startDate}
                  onChange={(e) => setAcceptanceDetails(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Job Type</label>
                <Select 
                  value={acceptanceDetails.jobType}
                  onValueChange={(value) => setAcceptanceDetails(prev => ({ ...prev, jobType: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Notes (Benefits, Negotiations, etc.)</label>
                <textarea
                  className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                  rows="3"
                  placeholder="Add any notes about the offer, benefits, negotiations, etc."
                  value={acceptanceDetails.acceptanceNotes}
                  onChange={(e) => setAcceptanceDetails(prev => ({ ...prev, acceptanceNotes: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={handleAcceptanceCancel}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAcceptanceConfirm}
              className="bg-[#4242ea] text-white hover:bg-[#3333d1]"
            >
              Confirm Acceptance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Victory Celebration Modal */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Job Accepted
            </DialogTitle>
          </DialogHeader>

          {acceptedJob && jobJourneyStats && (
            <div className="space-y-6 py-4">
              <div className="pb-6 border-b border-[#e0e0e0]">
                <div className="text-2xl font-semibold text-[#1a1a1a] mb-2">
                  {acceptedJob.company_name}
                </div>
                <div className="text-base text-[#666666]">
                  {acceptedJob.role_title}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Journey Time</div>
                  <div className="text-lg font-semibold text-[#1a1a1a]">
                    {jobJourneyStats.daysToAcceptance} {jobJourneyStats.daysToAcceptance === 1 ? 'day' : 'days'}
                  </div>
                </div>
                
                {acceptedJob.finalSalary && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Compensation</div>
                    <div className="text-lg font-semibold text-[#1a1a1a]">
                      {acceptedJob.finalSalary}
                    </div>
                  </div>
                )}
                
                {acceptedJob.startDate && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Start Date</div>
                    <div className="text-lg font-semibold text-[#1a1a1a]">
                      {new Date(acceptedJob.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 p-4 bg-[#f9fafb] rounded-md">
                <div className="flex flex-col gap-1 text-center">
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Applied</div>
                  <div className="text-sm text-[#1a1a1a] font-medium">
                    {new Date(jobJourneyStats.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-xl text-[#4242ea] font-semibold">→</div>
                <div className="flex flex-col gap-1 text-center">
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Accepted</div>
                  <div className="text-sm text-[#1a1a1a] font-medium">
                    {new Date(jobJourneyStats.acceptedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {(activityCounts[acceptedJob.job_application_id] > 0 || buildCounts[acceptedJob.job_application_id] > 0) && (
                <div className="p-3 bg-[#f9fafb] rounded-md">
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">
                    Related Activity
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {activityCounts[acceptedJob.job_application_id] > 0 && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {activityCounts[acceptedJob.job_application_id]} {activityCounts[acceptedJob.job_application_id] === 1 ? 'Hustle' : 'Hustles'}
                      </Badge>
                    )}
                    {buildCounts[acceptedJob.job_application_id] > 0 && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {buildCounts[acceptedJob.job_application_id]} {buildCounts[acceptedJob.job_application_id] === 1 ? 'Build' : 'Builds'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Loading Curtain */}
      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
}

export default PathfinderApplications;


