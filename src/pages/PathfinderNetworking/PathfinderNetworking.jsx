import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './PathfinderNetworking.css';
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

  useEffect(() => {
    fetchActivities();
    fetchAvailableJobs();
  }, [token]);

  // Check if we should open the form (from navigation state)
  useEffect(() => {
    if (location.state?.openForm) {
      setShowForm(true);
      // Clear the state so it doesn't reopen if user navigates back
      window.history.replaceState({}, document.title);
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

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(activity => activity.type === filterType);

  if (isLoading) {
    return <div className="pathfinder-networking__loading">Loading hustle activities...</div>;
  }

  return (
    <div className="pathfinder-networking">
      <div className="pathfinder-networking__container">
        <div className="pathfinder-networking__header">
          <button 
            className="pathfinder-networking__add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Activity'}
          </button>
          
          {/* Filter inline with button */}
          <div className="pathfinder-networking__filters">
            <label>Filter by Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="digital">Digital</option>
              <option value="irl">In Real Life</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="pathfinder-networking__message pathfinder-networking__message--error">
            {error}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="pathfinder-networking__modal-overlay" onClick={resetForm}>
            <div className="pathfinder-networking__modal" onClick={(e) => e.stopPropagation()}>
              <div className="pathfinder-networking__modal-header">
                <h2>{isEditing ? 'Edit Activity' : 'Add New Activity'}</h2>
                
                {/* Type selector buttons in header */}
                <div className="pathfinder-networking__modal-type-selector">
                  <button
                    type="button"
                    className={`pathfinder-networking__modal-type-btn ${formData.type === 'digital' ? 'pathfinder-networking__modal-type-btn--active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'digital', subType: '', eventName: '', eventOrganizer: '' }))}
                  >
                    <ComputerIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Digital
                  </button>
                  <button
                    type="button"
                    className={`pathfinder-networking__modal-type-btn ${formData.type === 'irl' ? 'pathfinder-networking__modal-type-btn--active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'irl', subType: '', direction: '' }))}
                  >
                    <HandshakeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    IRL
                  </button>
                </div>
                
                <button type="button" className="pathfinder-networking__modal-close" onClick={resetForm}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="pathfinder-networking__form">
              
              <div className="pathfinder-networking__form-panels">
                {/* Left Panel - URL Quick Add */}
                <div className="pathfinder-networking__form-panel pathfinder-networking__form-panel--left">
                  <div className="pathfinder-networking__url-section">
                    <h4><LinkIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />Quick Add from URL</h4>
                    {formData.type === 'digital' ? (
                      <>
                        <p className="pathfinder-networking__url-description">
                          Paste a LinkedIn profile, X/Twitter post, or other URL to auto-fill details
                        </p>
                        <div className="pathfinder-networking__form-group">
                          <label>Paste URL</label>
                          <textarea
                            name="url"
                            value={formData.url}
                            onChange={handleUrlChange}
                            placeholder="https://linkedin.com/in/john-smith or https://x.com/username/status/123"
                            rows="5"
                          />
                          <button
                            type="button"
                            onClick={handleFetchDetails}
                            className="pathfinder-networking__fetch-btn"
                            disabled={!formData.url || formData.url.trim() === '' || isParsingUrl}
                          >
                            {isParsingUrl ? (
                              <>
                                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Fetching Details...
                              </>
                            ) : (
                              <>
                                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Fetch Details
                              </>
                            )}
                          </button>
                          {parsedUrlData && parsedUrlData.parsed && (
                            <span className="pathfinder-networking__url-hint pathfinder-networking__url-hint--success">
                              <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              Detected: {parsedUrlData.platform}
                            </span>
                          )}
                        </div>
                        <div className="pathfinder-networking__url-examples">
                          <strong>Supported:</strong>
                          <ul>
                            <li>LinkedIn profiles & posts</li>
                            <li>X/Twitter profiles & tweets</li>
                            <li>Company websites</li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="pathfinder-networking__url-description">
                          Paste an event website, LinkedIn event, or LinkedIn profile
                        </p>
                        <div className="pathfinder-networking__form-group">
                          <label>Paste URL</label>
                          <textarea
                            name="url"
                            value={formData.url}
                            onChange={handleUrlChange}
                            placeholder="https://linkedin.com/events/... or https://eventbrite.com/e/..."
                            rows="5"
                          />
                          <button
                            type="button"
                            onClick={handleFetchDetails}
                            className="pathfinder-networking__fetch-btn"
                            disabled={!formData.url || formData.url.trim() === '' || isParsingUrl}
                          >
                            {isParsingUrl ? (
                              <>
                                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Fetching Details...
                              </>
                            ) : (
                              <>
                                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                Fetch Details
                              </>
                            )}
                          </button>
                          {parsedUrlData && parsedUrlData.parsed && (
                            <span className="pathfinder-networking__url-hint pathfinder-networking__url-hint--success">
                              <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              Detected: {parsedUrlData.platform}
                            </span>
                          )}
                        </div>
                        <div className="pathfinder-networking__url-examples">
                          <strong>Supported:</strong>
                          <ul>
                            <li>LinkedIn events & profiles</li>
                            <li>Eventbrite event pages</li>
                            <li>Company event websites</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Panel - Form Fields */}
                <div className="pathfinder-networking__form-panel pathfinder-networking__form-panel--right">
                  {/* ===== DIGITAL ACTIVITY FIELDS ===== */}
                  {formData.type === 'digital' && (
                    <>
                      {/* Channel/Medium & Date Row */}
                      <div className="pathfinder-networking__form-row">
                        <div>
                          <div className="pathfinder-networking__form-group">
                            <label>Channel/Medium *</label>
                            <div className="pathfinder-networking__channel-options">
                              {getDigitalChannelOptions().map(option => (
                                <label key={option.value} className="pathfinder-networking__channel-option">
                                  <input
                                    type="radio"
                                    name="subType"
                                    value={option.value}
                                    checked={formData.subType === option.value}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <span className="pathfinder-networking__channel-label">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Direction */}
                          <div className="pathfinder-networking__form-group">
                            <label>Direction</label>
                            <div className="pathfinder-networking__channel-options">
                              <label className="pathfinder-networking__channel-option">
                                <input
                                  type="radio"
                                  name="direction"
                                  value="outbound"
                                  checked={formData.direction === 'outbound'}
                                  onChange={handleInputChange}
                                />
                                <span className="pathfinder-networking__channel-label">
                                  Outbound (I reached out)
                                </span>
                              </label>
                              <label className="pathfinder-networking__channel-option">
                                <input
                                  type="radio"
                                  name="direction"
                                  value="inbound"
                                  checked={formData.direction === 'inbound'}
                                  onChange={handleInputChange}
                                />
                                <span className="pathfinder-networking__channel-label">
                                  Inbound (They reached out)
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="pathfinder-networking__form-group">
                            <label>Date *</label>
                            <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* Link to Job */}
                          <div className="pathfinder-networking__form-group">
                            <label>Link to Job</label>
                            <div className="pathfinder-networking__job-search">
                              <input
                                type="text"
                                value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                onFocus={() => jobSearchQuery && setShowJobDropdown(true)}
                                placeholder="Search by job title or company..."
                                className="pathfinder-networking__job-search-input"
                              />
                              {selectedJob && (
                                <button
                                  type="button"
                                  className="pathfinder-networking__job-search-clear"
                                  onClick={handleJobSearchClear}
                                  title="Clear selection"
                                >
                                  ✕
                                </button>
                              )}
                              {showJobDropdown && filteredJobs.length > 0 && (
                                <div className="pathfinder-networking__job-dropdown">
                                  {filteredJobs.map(job => (
                                    <div
                                      key={job.job_application_id}
                                      className="pathfinder-networking__job-option"
                                      onClick={() => handleJobSelect(job)}
                                    >
                                      <div className="pathfinder-networking__job-title">{job.role_title}</div>
                                      <div className="pathfinder-networking__job-company">{job.company_name}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showJobDropdown && jobSearchQuery && filteredJobs.length === 0 && (
                                <div className="pathfinder-networking__job-dropdown">
                                  <div className="pathfinder-networking__job-option pathfinder-networking__job-option--empty">
                                    No jobs found matching "{jobSearchQuery}"
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="pathfinder-networking__hint">
                              Connect this activity to a job application in your Job Tracker
                            </p>
                          </div>

                          {/* Connection Type */}
                          <div className="pathfinder-networking__form-group">
                            <label>Connection Type</label>
                            <div className="pathfinder-networking__channel-options">
                              {getConnectionTypeOptions(formData.type).map(option => (
                                <label key={option.value} className="pathfinder-networking__channel-option">
                                  <input
                                    type="radio"
                                    name="connectionStrength"
                                    value={option.value}
                                    checked={formData.connectionStrength === option.value}
                                    onChange={handleInputChange}
                                  />
                                  <span className="pathfinder-networking__channel-label">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Name, Company & Email */}
                      <div className="pathfinder-networking__form-row pathfinder-networking__form-row--three-cols pathfinder-networking__form-row--divider-top pathfinder-networking__form-row--divider-bottom">
                        <div className="pathfinder-networking__form-group">
                          <label>Contact Name</label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="John Smith"
                          />
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Company</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Company name"
                          />
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Contact Email</label>
                          <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      {/* Outcome & Follow-up Date */}
                      <div className="pathfinder-networking__form-row">
                        <div className="pathfinder-networking__form-group">
                          <label>Outcome</label>
                          <select
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleInputChange}
                          >
                            <option value="pending">Pending</option>
                            <option value="no_response">No Response</option>
                            <option value="positive_response">Positive Response</option>
                            <option value="led_to_conversation">Led to Conversation</option>
                            <option value="led_to_referral">Led to Referral</option>
                            <option value="led_to_interview">Led to Interview</option>
                            <option value="not_relevant">Not Relevant</option>
                          </select>
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Follow-up Date</label>
                          <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== IRL ACTIVITY FIELDS ===== */}
                  {formData.type === 'irl' && (
                    <>
                      {/* Event Type & Date Row */}
                      <div className="pathfinder-networking__form-row">
                        <div>
                          <div className="pathfinder-networking__form-group">
                            <label>Event/Meeting Type *</label>
                            <div className="pathfinder-networking__channel-options">
                              {getIRLEventOptions().map(option => (
                                <label key={option.value} className="pathfinder-networking__channel-option">
                                  <input
                                    type="radio"
                                    name="subType"
                                    value={option.value}
                                    checked={formData.subType === option.value}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <span className="pathfinder-networking__channel-label">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="pathfinder-networking__form-group">
                            <label>Date *</label>
                            <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          {/* Link to Job */}
                          <div className="pathfinder-networking__form-group">
                            <label>Link to Job</label>
                            <div className="pathfinder-networking__job-search">
                              <input
                                type="text"
                                value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                onFocus={() => jobSearchQuery && setShowJobDropdown(true)}
                                placeholder="Search by job title or company..."
                                className="pathfinder-networking__job-search-input"
                              />
                              {selectedJob && (
                                <button
                                  type="button"
                                  className="pathfinder-networking__job-search-clear"
                                  onClick={handleJobSearchClear}
                                  title="Clear selection"
                                >
                                  ✕
                                </button>
                              )}
                              {showJobDropdown && filteredJobs.length > 0 && (
                                <div className="pathfinder-networking__job-dropdown">
                                  {filteredJobs.map(job => (
                                    <div
                                      key={job.job_application_id}
                                      className="pathfinder-networking__job-option"
                                      onClick={() => handleJobSelect(job)}
                                    >
                                      <div className="pathfinder-networking__job-title">{job.role_title}</div>
                                      <div className="pathfinder-networking__job-company">{job.company_name}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showJobDropdown && jobSearchQuery && filteredJobs.length === 0 && (
                                <div className="pathfinder-networking__job-dropdown">
                                  <div className="pathfinder-networking__job-option pathfinder-networking__job-option--empty">
                                    No jobs found matching "{jobSearchQuery}"
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="pathfinder-networking__hint">
                              Connect this activity to a job application in your Job Tracker
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Event/Location Name */}
                      <div className="pathfinder-networking__form-group">
                        <label>Event/Location Name *</label>
                        <input
                          type="text"
                          name="eventName"
                          value={formData.eventName}
                          onChange={handleInputChange}
                          placeholder="TechCrunch Disrupt, Blue Bottle Coffee, etc."
                          required
                        />
                      </div>

                      {/* Event Organizer/Host */}
                      <div className="pathfinder-networking__form-group">
                        <label>Event Organizer/Host</label>
                        <input
                          type="text"
                          name="eventOrganizer"
                          value={formData.eventOrganizer}
                          onChange={handleInputChange}
                          placeholder="Company or organization hosting the event"
                        />
                      </div>

                      {/* Contact Name, Company & Email (Optional for IRL) */}
                      <div className="pathfinder-networking__form-row pathfinder-networking__form-row--three-cols pathfinder-networking__form-row--divider-top">
                        <div className="pathfinder-networking__form-group">
                          <label>Contact Name</label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="Person you met"
                          />
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Their Company</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Their company"
                          />
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Contact Email</label>
                          <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder="Collected later is fine"
                          />
                        </div>
                      </div>

                      {/* Connection Type - Only show if there's a contact */}
                      {formData.contactName && (
                        <div className="pathfinder-networking__form-group pathfinder-networking__form-row--divider-bottom">
                          <label>Connection Type</label>
                          <div className="pathfinder-networking__channel-options">
                            {getConnectionTypeOptions(formData.type).map(option => (
                              <label key={option.value} className="pathfinder-networking__channel-option">
                                <input
                                  type="radio"
                                  name="connectionStrength"
                                  value={option.value}
                                  checked={formData.connectionStrength === option.value}
                                  onChange={handleInputChange}
                                />
                                <span className="pathfinder-networking__channel-label">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outcome & Follow-up Date */}
                      <div className="pathfinder-networking__form-row">
                        <div className="pathfinder-networking__form-group">
                          <label>Outcome</label>
                          <select
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleInputChange}
                          >
                            <option value="pending">Pending</option>
                            <option value="no_response">No Response</option>
                            <option value="positive_response">Positive Response</option>
                            <option value="led_to_conversation">Led to Conversation</option>
                            <option value="led_to_referral">Led to Referral</option>
                            <option value="led_to_interview">Led to Interview</option>
                            <option value="not_relevant">Not Relevant</option>
                          </select>
                        </div>
                        <div className="pathfinder-networking__form-group">
                          <label>Follow-up Date</label>
                          <input
                            type="date"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== COMMON FIELDS ===== */}
                  <div className="pathfinder-networking__form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Add details about the activity..."
                    />
                  </div>

              <div className="pathfinder-networking__form-actions">
                <button type="submit" className="pathfinder-networking__submit-btn">
                  {isEditing ? 'Update Activity' : 'Add Activity'}
                </button>
                <button 
                  type="button" 
                  className="pathfinder-networking__cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
                </div>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Activities Table */}
        <div className="pathfinder-networking__table-container">
          {filteredActivities.length === 0 ? (
            <div className="pathfinder-networking__empty">
              <p>No hustle activities yet. Click "+ New Activity" to add your first one!</p>
            </div>
          ) : (
            <table className="pathfinder-networking__table">
              <thead>
                <tr>
                  <th>Activity Type</th>
                  <th>Channel / Event</th>
                  <th>Linked Job</th>
                  <th>Date</th>
                  <th>Contact / Company</th>
                  <th>Direction</th>
                  <th>Outcome</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
                  <tr key={activity.networking_activity_id}>
                    <td>
                      <span className="pathfinder-networking__type-badge">
                        {getTypeLabel(activity.type)}
                      </span>
                    </td>
                    <td>
                      {formatChannelText(activity.platform || activity.sub_type) || <span className="pathfinder-networking__empty-cell">—</span>}
                    </td>
                    <td>
                      {activity.linked_job_id ? (
                        (() => {
                          const linkedJob = availableJobs.find(job => job.job_application_id === activity.linked_job_id);
                          return linkedJob ? (
                            <div className="pathfinder-networking__linked-job">
                              <div className="pathfinder-networking__linked-job-company">
                                {linkedJob.company_name}
                                <a 
                                  href={`/pathfinder/applications?job=${linkedJob.job_application_id}`}
                                  className="pathfinder-networking__job-link"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  Link to Job
                                </a>
                              </div>
                              <div className="pathfinder-networking__linked-job-role">
                                {linkedJob.role_title}
                              </div>
                            </div>
                          ) : (
                            <span className="pathfinder-networking__empty-cell">—</span>
                          );
                        })()
                      ) : (
                        <span className="pathfinder-networking__empty-cell">—</span>
                      )}
                    </td>
                    <td>
                      {new Date(activity.date).toLocaleDateString()}
                      {activity.follow_up_date && (
                        <div className="pathfinder-networking__followup-badge">
                          Follow-up: {new Date(activity.follow_up_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>
                      {activity.contact_name && (
                        <div className="pathfinder-networking__contact-name">
                          {activity.contact_name}
                        </div>
                      )}
                      {activity.company && (
                        <div className="pathfinder-networking__company-name">
                          {activity.company}
                        </div>
                      )}
                      {!activity.contact_name && !activity.company && (
                        <span className="pathfinder-networking__empty-cell">—</span>
                      )}
                    </td>
                    <td>
                      {activity.direction ? (
                        <span style={{ textTransform: 'capitalize' }}>
                          {activity.direction}
                        </span>
                      ) : (
                        <span className="pathfinder-networking__empty-cell">—</span>
                      )}
                    </td>
                    <td>
                      <span 
                        className={`pathfinder-networking__outcome-badge pathfinder-networking__outcome-badge--${activity.outcome}`}
                      >
                        {activity.outcome ? activity.outcome.replace(/_/g, ' ') : 'pending'}
                      </span>
                    </td>
                    <td className="pathfinder-networking__table-actions">
                      <button 
                        onClick={() => handleEdit(activity)}
                        className="pathfinder-networking__table-btn pathfinder-networking__table-btn--edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(activity.networking_activity_id)}
                        className="pathfinder-networking__table-btn pathfinder-networking__table-btn--delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PathfinderNetworking;

