import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
// MUI Icons
import ComputerIcon from '@mui/icons-material/Computer';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import StarIcon from '@mui/icons-material/Star';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BlockIcon from '@mui/icons-material/Block';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import LinkIcon from '@mui/icons-material/Link';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Helper function to format platform/channel text with proper capitalization
const formatChannelText = (text) => {
  if (!text) return '';
  
  // Replace underscores with spaces
  const formatted = text.replace(/_/g, ' ');
  
  // Split into words and capitalize each word
  const words = formatted.split(' ').map(word => {
    // Special case for "DM" - keep it all caps
    if (word.toLowerCase() === 'dm') {
      return 'DM';
    }
    // Capitalize first letter of other words
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return words.join(' ');
};

function PathfinderNetworking() {
  const { token } = useAuth();
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'digital', // Simplified: 'digital' or 'irl'
    subType: '',
    platform: '',
    outcome: 'pending',
    followUpDate: '',
    url: '',
    connectionStrength: '',
    contactName: '',
    contactEmail: '',
    company: '',
    notes: '',
    direction: 'outbound', // For digital: 'outbound' or 'inbound'
    eventName: '', // For IRL
    eventOrganizer: '', // For IRL
    linkedJobId: null // Link to job application
  });
  const [parsedUrlData, setParsedUrlData] = useState(null);
  const [isParsingUrl, setIsParsingUrl] = useState(false);

  // Job search state
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [availableJobs, setAvailableJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState('all');
  
  // View state
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchActivities();
    fetchAvailableJobs();
  }, [token]);

  // Check if we should open the form (from navigation state)
  useEffect(() => {
    console.log('[Networking] location.state:', location.state);
    if (location.state?.openForm) {
      console.log('[Networking] openForm detected');

      // Clear the state first so it doesn't reopen if user navigates back
      window.history.replaceState({}, document.title);

      // If prefillData exists, merge it into formData
      if (location.state?.prefillData) {
        console.log('[Networking] prefillData:', location.state.prefillData);
        const prefillData = location.state.prefillData;

        // Set form data first, then open form after a tick to ensure state is updated
        setFormData(prev => {
          const newData = {
            ...prev,
            ...prefillData
          };
          console.log('[Networking] Setting formData to:', newData);
          return newData;
        });

        // Open form after state update
        setTimeout(() => {
          setShowForm(true);
        }, 0);
      } else {
        setShowForm(true);
      }
    }
  }, [location]);

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data.length, 'jobs');
        console.log('Job titles and companies:', data.map(j => ({ title: j.role_title, company: j.company_name })));
        setAvailableJobs(data);
      } else {
        console.error('Failed to fetch jobs:', response.status);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Handle job search
  useEffect(() => {
    // Don't show dropdown if a job is already selected
    if (selectedJob) {
      setShowJobDropdown(false);
      return;
    }

    if (jobSearchQuery.trim() === '') {
      setFilteredJobs([]);
      setShowJobDropdown(false);
    } else {
      try {
        const query = jobSearchQuery.toLowerCase();
        console.log('Searching for:', query);
        console.log('Available jobs:', availableJobs.length);
        
        const filtered = availableJobs.filter(job => {
          if (!job) return false;
          
          const jobTitle = (job.role_title || '').toLowerCase();
          const company = (job.company_name || '').toLowerCase();
          const matches = jobTitle.includes(query) || company.includes(query);
          
          if (matches) {
            console.log('Match found:', job.role_title, 'at', job.company_name);
          }
          return matches;
        });
        
        console.log('Filtered jobs:', filtered.length);
        setFilteredJobs(filtered);
        setShowJobDropdown(true);
      } catch (error) {
        console.error('Error filtering jobs:', error);
        setFilteredJobs([]);
        setShowJobDropdown(false);
      }
    }
  }, [jobSearchQuery, availableJobs, selectedJob]);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({ ...prev, linkedJobId: job.job_application_id }));
    setJobSearchQuery(`${job.role_title} at ${job.company_name}`);
    setShowJobDropdown(false);
  };

  const handleJobSearchClear = () => {
    setJobSearchQuery('');
    setSelectedJob(null);
    setFormData(prev => ({ ...prev, linkedJobId: null }));
    setShowJobDropdown(false);
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/networking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        setError('Failed to fetch hustle activities');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Error loading hustle activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle URL parsing
  const handleUrlParse = async (url) => {
    if (!url || url.trim() === '') {
      setParsedUrlData(null);
      return;
    }

    try {
      setIsParsingUrl(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/networking/parse-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Parsed URL data:', data);
        
        if (data.parsed) {
          setParsedUrlData(data);
          
          // Auto-fill form with parsed data, but keep existing type
          setFormData(prev => {
            // Map detected platform to subType
            let detectedSubType = '';
            if (data.platform) {
              const platformLower = data.platform.toLowerCase();
              console.log('Detected platform:', platformLower);
              
              if (platformLower.includes('linkedin')) {
                // Default to LinkedIn Direct Message for LinkedIn
                detectedSubType = 'linkedin_dm';
              } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
                // Default to X/Twitter DM for Twitter/X
                detectedSubType = 'twitter_dm';
              }
            }
            
            console.log('Setting subType to:', detectedSubType);
            console.log('Contact name:', data.suggestedContactName);
            console.log('Company:', data.suggestedCompany);
            console.log('Event name:', data.suggestedEventName);
            console.log('Notes:', data.notes);
            
            return {
              ...prev,
              // Set the detected subType
              subType: detectedSubType || prev.subType,
              platform: data.platform || prev.platform,
              // Only update if field is empty
              contactName: prev.contactName || data.suggestedContactName || '',
              company: prev.company || data.suggestedCompany || '',
              eventName: prev.eventName || data.suggestedEventName || '',
              notes: prev.notes || data.notes || ''
            };
          });
        }
      }
    } catch (err) {
      console.error('Error parsing URL:', err);
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));
    // Clear parsed data when URL changes
    if (!url || url.trim() === '') {
      setParsedUrlData(null);
    }
  };

  const handleFetchDetails = () => {
    if (formData.url && formData.url.trim() !== '') {
      handleUrlParse(formData.url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/networking/${currentActivity.networking_activity_id}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/networking`;

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
          title: isEditing ? 'Activity updated!' : 'Activity added!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        resetForm();
        fetchActivities();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save activity');
      }
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Error saving activity');
    }
  };

  const handleEdit = (activity) => {
    setCurrentActivity(activity);
    setIsEditing(true);
    setFormData({
      date: activity.date ? activity.date.split('T')[0] : '',
      type: activity.type,
      subType: activity.sub_type || '',
      platform: activity.platform || '',
      outcome: activity.outcome || 'pending',
      followUpDate: activity.follow_up_date ? activity.follow_up_date.split('T')[0] : '',
      url: activity.url || '',
      connectionStrength: activity.connection_strength || '',
      contactName: activity.contact_name || '',
      contactEmail: activity.contact_email || '',
      company: activity.company || '',
      notes: activity.notes || '',
      direction: activity.direction || 'outbound',
      eventName: activity.event_name || '',
      eventOrganizer: activity.event_organizer || '',
      linkedJobId: activity.linked_job_id || null
    });

    // If there's a linked job, find it and set up the search field
    if (activity.linked_job_id) {
      const linkedJob = availableJobs.find(job => job.job_application_id === activity.linked_job_id);
      if (linkedJob) {
        setSelectedJob(linkedJob);
        setJobSearchQuery(`${linkedJob.role_title} at ${linkedJob.company_name}`);
      }
    } else {
      setSelectedJob(null);
      setJobSearchQuery('');
    }

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/networking/${id}`, {
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
          title: 'Activity deleted!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        fetchActivities();
      } else {
        setError('Failed to delete activity');
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Error deleting activity');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'digital',
      subType: '',
      platform: '',
      outcome: 'pending',
      followUpDate: '',
      url: '',
      connectionStrength: '',
      contactName: '',
      contactEmail: '',
      company: '',
      notes: '',
      direction: 'outbound',
      eventName: '',
      eventOrganizer: '',
      linkedJobId: null
    });
    setParsedUrlData(null);
    setShowForm(false);
    setIsEditing(false);
    setCurrentActivity(null);
    setJobSearchQuery('');
    setSelectedJob(null);
    setShowJobDropdown(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      social_media_outreach: '#8b5cf6',
      email_outreach: '#3b82f6',
      in_person_networking: '#f59e0b',
      virtual_networking: '#06b6d4',
      inbound_interest: '#22c55e',
      referral_activity: '#ec4899',
      // Legacy types
      event: '#f59e0b',
      recruiter_call: '#22c55e',
      referral: '#ec4899',
      coffee_chat: '#f59e0b',
      other: '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      digital: <><ComputerIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Digital</>,
      irl: <><HandshakeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> IRL</>,
      // Legacy types for backward compatibility
      social_media_outreach: <><ComputerIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Digital</>,
      email_outreach: <><ComputerIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Digital</>,
      virtual_networking: <><ComputerIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Digital</>,
      inbound_interest: <><ComputerIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> Digital</>,
      in_person_networking: <><HandshakeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> IRL</>,
      referral_activity: 'Referral',
      event: 'Event',
      recruiter_call: 'Recruiter Call',
      referral: 'Referral',
      coffee_chat: 'Coffee Chat',
      other: 'Other'
    };
    return labels[type] || type;
  };

  // Get dynamic platform field properties based on activity type
  const getPlatformFieldProps = (type) => {
    const props = {
      social_media_outreach: {
        label: 'Social Platform',
        placeholder: 'LinkedIn, X/Twitter, etc.'
      },
      email_outreach: {
        label: 'Email Provider',
        placeholder: 'Gmail, Outlook, etc.'
      },
      in_person_networking: {
        label: 'Event/Location',
        placeholder: 'Coffee shop, conference venue, etc.'
      },
      virtual_networking: {
        label: 'Platform',
        placeholder: 'Zoom, Google Meet, Teams, etc.'
      },
      inbound_interest: {
        label: 'Source',
        placeholder: 'LinkedIn InMail, Recruiter call, etc.'
      },
      referral_activity: {
        label: 'Referral Source',
        placeholder: 'Friend, colleague, etc.'
      }
    };
    return props[type] || { label: 'Platform/Channel', placeholder: 'LinkedIn, Email, Zoom, etc.' };
  };

  // Get dynamic connection type options based on activity type
  const getConnectionTypeOptions = (type) => {
    if (type === 'digital') {
      return [
        { value: 'cold', label: 'Cold (Never Met)', icon: <AcUnitIcon sx={{ fontSize: 16 }} /> },
        { value: 'warm', label: 'Warm (Introduction)', icon: <HandshakeIcon sx={{ fontSize: 16 }} /> },
        { value: 'existing', label: 'Existing Connection', icon: <StarIcon sx={{ fontSize: 16 }} /> }
      ];
    } else if (type === 'irl') {
      return [
        { value: 'new', label: 'New Connection', icon: <AcUnitIcon sx={{ fontSize: 16 }} /> },
        { value: 'introduced', label: 'Introduced', icon: <HandshakeIcon sx={{ fontSize: 16 }} /> },
        { value: 'reconnecting', label: 'Reconnecting', icon: <StarIcon sx={{ fontSize: 16 }} /> }
      ];
    }
    return [];
  };

  // Sub-type options based on main type
  // Digital activity channels
  const getDigitalChannelOptions = () => {
    return [
      { value: 'linkedin_dm', label: 'LinkedIn - Direct Message' },
      { value: 'linkedin_comment', label: 'LinkedIn - Comment/Post' },
      { value: 'twitter_dm', label: 'X/Twitter - DM' },
      { value: 'twitter_reply', label: 'X/Twitter - Reply/Post' },
      { value: 'email', label: 'Email' },
      { value: 'slack_discord', label: 'Slack/Discord Community' },
      { value: 'virtual_event', label: 'Virtual Event (Zoom, Teams, etc.)' },
      { value: 'other_social', label: 'Other Social Media' }
    ];
  };

  // IRL event types
  const getIRLEventOptions = () => {
    return [
      { value: 'coffee_chat', label: 'Coffee Chat (1-on-1)' },
      { value: 'informational_interview', label: 'Informational Interview' },
      { value: 'conference', label: 'Conference' },
      { value: 'meetup', label: 'Meetup/Community Event' },
      { value: 'career_fair', label: 'Career Fair' },
      { value: 'hackathon', label: 'Hackathon' },
      { value: 'workshop', label: 'Workshop/Training' },
      { value: 'casual_networking', label: 'Casual Networking' },
      { value: 'other_event', label: 'Other Event' }
    ];
  };

  // Sort handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filter activities
  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(activity => activity.type === filterType);

  // Sort activities
  const sortedAndFilteredActivities = [...filteredActivities].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortColumn) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'type':
        aValue = a.type || '';
        bValue = b.type || '';
        break;
      case 'contact':
        aValue = (a.contact_name || '').toLowerCase();
        bValue = (b.contact_name || '').toLowerCase();
        break;
      case 'company':
        aValue = (a.company || '').toLowerCase();
        bValue = (b.company || '').toLowerCase();
        break;
      case 'outcome':
        aValue = (a.outcome || '').toLowerCase();
        bValue = (b.outcome || '').toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full h-full bg-[#f5f5f5] text-[#1a1a1a] overflow-y-auto p-6">
      <div className="max-w-full mx-auto">
        <div className="flex justify-start items-center mb-8 gap-4">
          <Button 
            className="px-6 py-4 bg-[#4242ea] text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(66,66,234,0.2)] relative overflow-hidden flex-shrink-0 whitespace-nowrap hover:bg-[#3333d1] hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_20px_rgba(66,66,234,0.4)] active:translate-y-0 active:scale-100 active:shadow-[0_2px_8px_rgba(66,66,234,0.2)]"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Activity'}
          </Button>
          
          {/* Filter inline with button */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-[#1a1a1a] whitespace-nowrap">Filter by Type:</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-white border-[#d0d0d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="irl">In Real Life</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex border border-[#e0e0e0] rounded-md bg-white overflow-hidden ml-auto">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              className={`px-3 py-2 rounded-none border-none transition-all duration-200 ${viewMode === 'cards' ? 'bg-[#4242ea] text-white' : 'bg-transparent text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
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

        {error && (
          <div className="pathfinder-networking__message pathfinder-networking__message--error">
            {error}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-[1200px] p-0 flex flex-col max-h-[90vh] overflow-hidden">
            <DialogHeader className="flex flex-row justify-between items-center p-6 border-b-2 border-[#e0e0e0] flex-shrink-0">
              <DialogTitle className="m-0 text-[#1a1a1a] text-2xl font-semibold">
                {isEditing ? 'Edit Activity' : 'Add New Activity'}
              </DialogTitle>
              
              {/* Type selector buttons in header */}
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  className={`px-4 py-2 bg-white border-2 border-[#e5e7eb] rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center whitespace-nowrap text-[#4b5563] ${
                    formData.type === 'digital' 
                      ? 'bg-[#4242ea] text-white border-[#4242ea] hover:bg-[#3333d1] hover:border-[#3333d1]' 
                      : 'hover:border-[#4242ea] hover:bg-[rgba(66,66,234,0.05)] hover:text-[#4242ea]'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'digital', subType: '', eventName: '', eventOrganizer: '' }))}
                >
                  <ComputerIcon sx={{ fontSize: 16 }} className={formData.type === 'digital' ? 'text-white' : 'text-[#4b5563]'} />
                  Digital
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`px-4 py-2 bg-white border-2 border-[#e5e7eb] rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center whitespace-nowrap text-[#4b5563] ${
                    formData.type === 'irl' 
                      ? 'bg-[#4242ea] text-white border-[#4242ea] hover:bg-[#3333d1] hover:border-[#3333d1]' 
                      : 'hover:border-[#4242ea] hover:bg-[rgba(66,66,234,0.05)] hover:text-[#4242ea]'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'irl', subType: '', direction: '' }))}
                >
                  <HandshakeIcon sx={{ fontSize: 16 }} className={formData.type === 'irl' ? 'text-white' : 'text-[#4b5563]'} />
                  IRL
                </Button>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] flex-1 min-h-0">
                {/* Left Panel - URL Quick Add */}
                <Card className="rounded-none border-none shadow-none bg-[#f9f9f9] border-r-2 border-[#e0e0e0] p-6 flex flex-col flex-shrink-0">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 mb-4">
                      <LinkIcon sx={{ fontSize: 18 }} />
                      <h4 className="text-lg font-semibold text-[#1a1a1a]">Quick Add from URL</h4>
                    </div>
                    {formData.type === 'digital' ? (
                      <div>
                        <p className="text-sm text-[#666666] mb-4 leading-relaxed">
                          Paste a LinkedIn profile, X/Twitter post, or other URL to auto-fill details
                        </p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Paste URL</label>
                            <textarea
                              name="url"
                              value={formData.url}
                              onChange={handleUrlChange}
                              placeholder="https://linkedin.com/in/john-smith or https://x.com/username/status/123"
                              rows="5"
                              className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleFetchDetails}
                            disabled={!formData.url || formData.url.trim() === '' || isParsingUrl}
                            className="w-full bg-[#4242ea] text-white hover:bg-[#3333d1] disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                            {isParsingUrl ? 'Fetching Details...' : 'Fetch Details'}
                          </Button>
                          {parsedUrlData && parsedUrlData.parsed && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                              <CheckCircleIcon sx={{ fontSize: 14 }} className="text-green-600" />
                              <span className="text-sm text-green-700">Detected: {parsedUrlData.platform}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="text-sm text-[#1a1a1a] font-medium mb-2">Supported:</div>
                          <ul className="text-xs text-[#666666] space-y-1">
                            <li>• LinkedIn profiles & posts</li>
                            <li>• X/Twitter profiles & tweets</li>
                            <li>• Company websites</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-[#666666] mb-4 leading-relaxed">
                          Paste an event website, LinkedIn event, or LinkedIn profile
                        </p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Paste URL</label>
                            <textarea
                              name="url"
                              value={formData.url}
                              onChange={handleUrlChange}
                              placeholder="https://linkedin.com/events/... or https://eventbrite.com/e/..."
                              rows="5"
                              className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleFetchDetails}
                            disabled={!formData.url || formData.url.trim() === '' || isParsingUrl}
                            className="w-full bg-[#4242ea] text-white hover:bg-[#3333d1] disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                            {isParsingUrl ? 'Fetching Details...' : 'Fetch Details'}
                          </Button>
                          {parsedUrlData && parsedUrlData.parsed && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                              <CheckCircleIcon sx={{ fontSize: 14 }} className="text-green-600" />
                              <span className="text-sm text-green-700">Detected: {parsedUrlData.platform}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="text-sm text-[#1a1a1a] font-medium mb-2">Supported:</div>
                          <ul className="text-xs text-[#666666] space-y-1">
                            <li>• LinkedIn events & profiles</li>
                            <li>• Eventbrite event pages</li>
                            <li>• Company event websites</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Panel - Form Fields */}
                <Card className="rounded-none border-none shadow-none bg-white p-6 flex flex-col overflow-y-auto min-h-0">
                  <CardContent className="p-0">
                  {/* ===== DIGITAL ACTIVITY FIELDS ===== */}
                  {formData.type === 'digital' && (
                    <div className="space-y-6">
                      {/* Channel/Medium & Date Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-3">Channel/Medium *</label>
                            <div className="space-y-2">
                              {getDigitalChannelOptions().map(option => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                  <input
                                    type="radio"
                                    name="subType"
                                    value={option.value}
                                    checked={formData.subType === option.value}
                                    onChange={handleInputChange}
                                    required
                                    className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                  />
                                  <span className="text-sm text-[#1a1a1a]">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Direction */}
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-3">Direction</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                <input
                                  type="radio"
                                  name="direction"
                                  value="outbound"
                                  checked={formData.direction === 'outbound'}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                />
                                <span className="text-sm text-[#1a1a1a]">
                                  Outbound (I reached out)
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                <input
                                  type="radio"
                                  name="direction"
                                  value="inbound"
                                  checked={formData.direction === 'inbound'}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                />
                                <span className="text-sm text-[#1a1a1a]">
                                  Inbound (They reached out)
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Date *</label>
                            <Input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              required
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>

                          {/* Link to Job */}
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Link to Job</label>
                            <div className="relative">
                              <Input
                                type="text"
                                value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                onFocus={() => jobSearchQuery && setShowJobDropdown(true)}
                                placeholder="Search by job title or company..."
                                className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                              />
                              {selectedJob && (
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a] text-lg font-bold leading-none"
                                  onClick={handleJobSearchClear}
                                  title="Clear selection"
                                >
                                  ✕
                                </button>
                              )}
                              {showJobDropdown && filteredJobs.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[#d0d0d0] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {filteredJobs.map(job => (
                                    <div
                                      key={job.job_application_id}
                                      className="p-3 cursor-pointer hover:bg-[#f5f5f5] border-b border-[#e0e0e0] last:border-b-0"
                                      onClick={() => handleJobSelect(job)}
                                    >
                                      <div className="font-medium text-[#1a1a1a] text-sm">{job.role_title}</div>
                                      <div className="text-xs text-[#666666] mt-1">{job.company_name}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showJobDropdown && jobSearchQuery && filteredJobs.length === 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[#d0d0d0] rounded-md shadow-lg">
                                  <div className="p-3 text-sm text-[#666666] text-center">
                                    No jobs found matching "{jobSearchQuery}"
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-[#666666]">
                              Connect this activity to a job application in your Job Tracker
                            </p>
                          </div>

                          {/* Connection Type */}
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-3">Connection Type</label>
                            <div className="space-y-2">
                              {getConnectionTypeOptions(formData.type).map(option => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                  <input
                                    type="radio"
                                    name="connectionStrength"
                                    value={option.value}
                                    checked={formData.connectionStrength === option.value}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                  />
                                  <span className="text-sm text-[#1a1a1a]">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Name, Company & Email */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#e0e0e0] pb-6 border-b border-[#e0e0e0]">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Name</label>
                          <Input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="John Smith"
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Company</label>
                          <Input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Company name"
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
                            placeholder="email@example.com"
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Outcome & Follow-up Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Outcome</label>
                          <Select
                            name="outcome"
                            value={formData.outcome}
                            onValueChange={(value) => handleInputChange({ target: { name: 'outcome', value } })}
                          >
                            <SelectTrigger className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent">
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="no_response">No Response</SelectItem>
                              <SelectItem value="positive_response">Positive Response</SelectItem>
                              <SelectItem value="led_to_conversation">Led to Conversation</SelectItem>
                              <SelectItem value="led_to_referral">Led to Referral</SelectItem>
                              <SelectItem value="led_to_interview">Led to Interview</SelectItem>
                              <SelectItem value="not_relevant">Not Relevant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Follow-up Date</label>
                          <Input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== IRL ACTIVITY FIELDS ===== */}
                  {formData.type === 'irl' && (
                    <div className="space-y-6">
                      {/* Event Type & Date Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-3">Event/Meeting Type *</label>
                          <div className="space-y-2">
                            {getIRLEventOptions().map(option => (
                              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                <input
                                  type="radio"
                                  name="subType"
                                  value={option.value}
                                  checked={formData.subType === option.value}
                                  onChange={handleInputChange}
                                  required
                                  className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                />
                                <span className="text-sm text-[#1a1a1a]">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Date *</label>
                            <Input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              required
                              className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                            />
                          </div>

                          {/* Link to Job */}
                          <div>
                            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Link to Job</label>
                            <div className="relative">
                              <Input
                                type="text"
                                value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                onFocus={() => jobSearchQuery && setShowJobDropdown(true)}
                                placeholder="Search by job title or company..."
                                className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                              />
                              {selectedJob && (
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a] text-lg font-bold leading-none"
                                  onClick={handleJobSearchClear}
                                  title="Clear selection"
                                >
                                  ✕
                                </button>
                              )}
                              {showJobDropdown && filteredJobs.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[#d0d0d0] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {filteredJobs.map(job => (
                                    <div
                                      key={job.job_application_id}
                                      className="p-3 cursor-pointer hover:bg-[#f5f5f5] border-b border-[#e0e0e0] last:border-b-0"
                                      onClick={() => handleJobSelect(job)}
                                    >
                                      <div className="font-medium text-[#1a1a1a] text-sm">{job.role_title}</div>
                                      <div className="text-xs text-[#666666] mt-1">{job.company_name}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showJobDropdown && jobSearchQuery && filteredJobs.length === 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[#d0d0d0] rounded-md shadow-lg">
                                  <div className="p-3 text-sm text-[#666666] text-center">
                                    No jobs found matching "{jobSearchQuery}"
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-[#666666]">
                              Connect this activity to a job application in your Job Tracker
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Event/Location Name */}
                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Event/Location Name *</label>
                        <Input
                          type="text"
                          name="eventName"
                          value={formData.eventName}
                          onChange={handleInputChange}
                          placeholder="TechCrunch Disrupt, Blue Bottle Coffee, etc."
                          required
                          className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                        />
                      </div>

                      {/* Event Organizer/Host */}
                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Event Organizer/Host</label>
                        <Input
                          type="text"
                          name="eventOrganizer"
                          value={formData.eventOrganizer}
                          onChange={handleInputChange}
                          placeholder="Company or organization hosting the event"
                          className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                        />
                      </div>

                      {/* Contact Name, Company & Email (Optional for IRL) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#e0e0e0]">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Contact Name</label>
                          <Input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="Person you met"
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Their Company</label>
                          <Input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Their company"
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
                            placeholder="Collected later is fine"
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Connection Type - Only show if there's a contact */}
                      {formData.contactName && (
                        <div className="pb-6 border-b border-[#e0e0e0]">
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-3">Connection Type</label>
                          <div className="space-y-2">
                            {getConnectionTypeOptions(formData.type).map(option => (
                              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#f5f5f5] transition-colors">
                                <input
                                  type="radio"
                                  name="connectionStrength"
                                  value={option.value}
                                  checked={formData.connectionStrength === option.value}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 text-[#4242ea] border-[#d0d0d0] focus:ring-[#4242ea] focus:ring-2"
                                />
                                <span className="text-sm text-[#1a1a1a]">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outcome & Follow-up Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Outcome</label>
                          <Select
                            name="outcome"
                            value={formData.outcome}
                            onValueChange={(value) => handleInputChange({ target: { name: 'outcome', value } })}
                          >
                            <SelectTrigger className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent">
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="no_response">No Response</SelectItem>
                              <SelectItem value="positive_response">Positive Response</SelectItem>
                              <SelectItem value="led_to_conversation">Led to Conversation</SelectItem>
                              <SelectItem value="led_to_referral">Led to Referral</SelectItem>
                              <SelectItem value="led_to_interview">Led to Interview</SelectItem>
                              <SelectItem value="not_relevant">Not Relevant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Follow-up Date</label>
                          <Input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== COMMON FIELDS ===== */}
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Add details about the activity..."
                      className="w-full p-3 border border-[#d0d0d0] rounded-md bg-white text-[#1a1a1a] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                    />
                  </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter className="flex justify-end p-6 border-t-2 border-[#e0e0e0] bg-white flex-shrink-0">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Activity' : 'Add Activity'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Activities View - Cards or Table */}
        {viewMode === 'table' ? (
          <div className="w-full overflow-x-auto bg-white rounded-lg border border-[#e0e0e0]">
            {sortedAndFilteredActivities.length === 0 ? (
              <div className="text-center p-8 text-[#666666]">
                <p>No hustle activities yet. Click "+ New Activity" to add your first one!</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#e0e0e0] bg-[#f9f9f9]">
                    <th 
                      onClick={() => handleSort('date')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Date
                      {sortColumn === 'date' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('type')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Type
                      {sortColumn === 'type' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Channel/Event</th>
                    <th 
                      onClick={() => handleSort('contact')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Contact
                      {sortColumn === 'contact' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('company')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Company
                      {sortColumn === 'company' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Direction</th>
                    <th 
                      onClick={() => handleSort('outcome')} 
                      className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    >
                      Outcome
                      {sortColumn === 'outcome' && (
                        <span className="ml-1 text-[#4242ea]">
                          {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                        </span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Follow-up</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredActivities.map(activity => (
                    <tr key={activity.networking_activity_id} className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {new Date(activity.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="bg-[#4242ea] text-white text-xs">
                          {getTypeLabel(activity.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {formatChannelText(activity.platform || activity.sub_type) || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {activity.contact_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {activity.company || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a] capitalize">
                        {activity.direction || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            activity.outcome === 'positive_response' || activity.outcome === 'led_to_conversation' || activity.outcome === 'led_to_referral' || activity.outcome === 'led_to_interview' ? 'bg-green-100 text-green-700' :
                            activity.outcome === 'no_response' || activity.outcome === 'not_relevant' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {activity.outcome ? activity.outcome.replace(/_/g, ' ') : 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1a1a1a]">
                        {activity.follow_up_date ? new Date(activity.follow_up_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => handleEdit(activity)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs hover:bg-red-100 hover:text-red-600"
                            onClick={() => handleDelete(activity.networking_activity_id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="w-full">
            {sortedAndFilteredActivities.length === 0 ? (
              <div className="text-center p-8 text-[#666666]">
                <p>No hustle activities yet. Click "+ New Activity" to add your first one!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedAndFilteredActivities.map(activity => (
                  <Card key={activity.networking_activity_id} className="bg-white border-[#e0e0e0] hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-[#4242ea] text-white">
                          {getTypeLabel(activity.type)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => handleEdit(activity)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            onClick={() => handleDelete(activity.networking_activity_id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#666] font-medium">Channel/Event:</span>
                          <span className="text-[#1a1a1a]">
                            {formatChannelText(activity.platform || activity.sub_type) || '—'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-[#666] font-medium">Date:</span>
                          <span className="text-[#1a1a1a]">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {activity.contact_name && (
                          <div className="flex justify-between">
                            <span className="text-[#666] font-medium">Contact:</span>
                            <span className="text-[#1a1a1a]">{activity.contact_name}</span>
                          </div>
                        )}
                        
                        {activity.company && (
                          <div className="flex justify-between">
                            <span className="text-[#666] font-medium">Company:</span>
                            <span className="text-[#1a1a1a]">{activity.company}</span>
                          </div>
                        )}
                        
                        {activity.direction && (
                          <div className="flex justify-between">
                            <span className="text-[#666] font-medium">Direction:</span>
                            <span className="text-[#1a1a1a] capitalize">{activity.direction}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-[#666] font-medium">Outcome:</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              activity.outcome === 'positive_response' || activity.outcome === 'led_to_conversation' || activity.outcome === 'led_to_referral' || activity.outcome === 'led_to_interview' ? 'bg-green-100 text-green-700' :
                              activity.outcome === 'no_response' || activity.outcome === 'not_relevant' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {activity.outcome ? activity.outcome.replace(/_/g, ' ') : 'pending'}
                          </Badge>
                        </div>
                        
                        {activity.follow_up_date && (
                          <div className="flex justify-between">
                            <span className="text-[#666] font-medium">Follow-up:</span>
                            <span className="text-[#1a1a1a] text-xs">
                              {new Date(activity.follow_up_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Loading Curtain */}
      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
}

export default PathfinderNetworking;

