import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
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
        if (tabParam && ['overview', 'applications', 'info-sessions', 'workshops'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);
    
    // Data state
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [infoSessions, setInfoSessions] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    
    // Pagination and filters
    const [applicationFilters, setApplicationFilters] = useState({
        status: '',
        limit: 50,
        offset: 0
    });
    const [applicationSort, setApplicationSort] = useState('latest'); // latest, oldest, alphabetic
    
    // Event registrations management
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    // Check if user has admin access
    const hasAdminAccess = user?.role === 'admin' || user?.role === 'staff';

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

            // Fetch all data in parallel
            const [statsResponse, applicationsResponse, infoSessionsResponse, workshopsResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${new URLSearchParams(applicationFilters)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops`, {
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
            setWorkshops(workshopsData);

        } catch (error) {
            console.error('Error fetching admissions data:', error);
            setError('Failed to load admissions data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Individual fetch functions for refresh buttons
    const fetchApplications = async () => {
        if (!hasAdminAccess || !token) return;
        
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (applicationFilters.status) params.append('status', applicationFilters.status);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkshops(data);
            }
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        fetchAdmissionsData();
    }, [token, hasAdminAccess, applicationFilters]);

    // Handle tab switching
    const handleTabChange = (tab) => {
        setActiveTab(tab);
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

    // Sort applications based on the selected sort type
    const sortApplications = (apps, sortType) => {
        if (!apps || !Array.isArray(apps)) return apps;
        
        const sortedApps = [...apps];
        
        switch (sortType) {
            case 'alphabetic':
                return sortedApps.sort((a, b) => {
                    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
            case 'oldest':
                return sortedApps.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'latest':
            default:
                return sortedApps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    };

    // Sort events by date (earliest to latest)
    const sortEventsByDate = (events) => {
        if (!events || !Array.isArray(events)) return events;
        
        return [...events].sort((a, b) => {
            // Since event_date is in ISO format, just parse it directly
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);
            
            // For earliest to latest: smaller date - larger date gives negative (comes first)
            return dateA.getTime() - dateB.getTime();
        });
    };

    // Check if an event has passed
    const isEventPast = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate} ${eventTime}`);
        return eventDateTime < new Date();
    };

    // Format time from 24-hour to 12-hour EST format
    const formatEventTime = (timeString) => {
        try {
            // Parse the time string (e.g., "17:30:00")
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Fallback to original
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
                const previousRegistration = eventRegistrations.find(reg => reg.applicant_id === applicantId);
                const previousStatus = previousRegistration?.status;
                
                // Update the registration in the local state instead of refetching
                setEventRegistrations(prevRegistrations => 
                    prevRegistrations.map(reg => 
                        reg.applicant_id === applicantId 
                            ? { ...reg, status }
                            : reg
                    )
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
                                    ? { ...session, attended_count: session.attended_count + countChange }
                                    : session
                            )
                        );
                    } else if (eventType === 'workshop') {
                        setWorkshops(prevWorkshops => 
                            prevWorkshops.map(workshop => 
                                workshop.event_id === eventId 
                                    ? { ...workshop, attended_count: workshop.attended_count + countChange }
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
                    Applications
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
                    className="admissions-dashboard__back-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back
                </button>
            </div>

            {/* Tab Content */}
            <div className="admissions-dashboard__content">
                {activeTab === 'overview' && (
                    <div className="admissions-dashboard__overview">
                        {loading ? (
                            <div className="admissions-dashboard__loading">
                                <div className="spinner"></div>
                                <p>Loading statistics...</p>
                            </div>
                        ) : error ? (
                            <div className="admissions-dashboard__error">
                                <h3>Error Loading Data</h3>
                                <p>{error}</p>
                                <button onClick={fetchAdmissionsData} className="retry-btn">Retry</button>
                            </div>
                        ) : stats ? (
                            <div className="admissions-dashboard__stats-grid">
                                {/* Overall Applicants */}
                                <div className="stat-card">
                                    <div className="stat-card__header">
                                        <h3>Total Applicants</h3>
                                        <div className="stat-card__icon">👥</div>
                                    </div>
                                    <div className="stat-card__value">{stats.totalApplicants || 0}</div>
                                    <div className="stat-card__subtitle">All registered applicants</div>
                                </div>

                                {/* Applications by Status */}
                                <div className="stat-card stat-card--wide">
                                    <div className="stat-card__header">
                                        <h3>Applications</h3>
                                        <div className="stat-card__icon">📝</div>
                                    </div>
                                    <div className="applications-breakdown">
                                        {stats.applicationStats?.map((statusGroup) => (
                                            <div key={statusGroup.status} className="application-status-item">
                                                <span className={`status-indicator status-indicator--${statusGroup.status}`}></span>
                                                <span className="status-label">{statusGroup.status}</span>
                                                <span className="status-count">{statusGroup.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info Sessions */}
                                <div className="stat-card">
                                    <div className="stat-card__header">
                                        <h3>Info Sessions</h3>
                                        <div className="stat-card__icon">ℹ️</div>
                                    </div>
                                    <div className="stat-card__value">{stats.infoSessions?.totalSessions || 0}</div>
                                    <div className="stat-card__subtitle">
                                        {stats.infoSessions?.totalRegistrations || 0} registrations, {stats.infoSessions?.totalAttended || 0} attended
                                    </div>
                                </div>

                                {/* Workshops */}
                                <div className="stat-card">
                                    <div className="stat-card__header">
                                        <h3>Workshops</h3>
                                        <div className="stat-card__icon">🛠️</div>
                                    </div>
                                    <div className="stat-card__value">{stats.workshops?.totalWorkshops || 0}</div>
                                    <div className="stat-card__subtitle">
                                        {stats.workshops?.totalRegistrations || 0} registrations, {stats.workshops?.totalAttended || 0} attended
                                    </div>
                                </div>
                            </div>
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
                            <h2>Applications Management</h2>
                            <div className="data-section__controls">
                                <select 
                                    value={applicationFilters.status} 
                                    onChange={(e) => setApplicationFilters({...applicationFilters, status: e.target.value})}
                                    className="filter-select"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ineligible">Ineligible</option>
                                </select>
                                <select 
                                    value={applicationSort} 
                                    onChange={(e) => setApplicationSort(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="latest">Latest Applications</option>
                                    <option value="oldest">Oldest Applications</option>
                                    <option value="alphabetic">Alphabetic (A-Z)</option>
                                </select>
                                <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
                            </div>
                        </div>
                        
                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading applications...</p>
                            </div>
                        ) : applications?.applications?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Applied</th>
                                            <th>Last Updated</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortApplications(applications.applications, applicationSort).map((app) => (
                                            <tr 
                                                key={app.application_id}
                                                className="clickable-row"
                                            >
                                                <td
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    <div className="applicant-name">
                                                        {app.first_name} {app.last_name}
                                                    </div>
                                                </td>
                                                <td
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    {app.email}
                                                </td>
                                                <td
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    <span className={`status-badge status-badge--${app.status}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    {new Date(app.updated_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="notes-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openNotesModal({
                                                                applicant_id: app.applicant_id,
                                                                name: `${app.first_name} ${app.last_name}`
                                                            });
                                                        }}
                                                    >
                                                        📝 Notes
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div className="table-footer">
                                    <span className="table-count">
                                        Showing {applications.applications.length} applications
                                        {applications.total > applications.applications.length && 
                                            ` of ${applications.total} total`
                                        }
                                    </span>
                                    {applications.total > applicationFilters.limit && (
                                        <div className="pagination-controls">
                                            <button 
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev, 
                                                    offset: Math.max(0, prev.offset - prev.limit)
                                                }))}
                                                disabled={applicationFilters.offset === 0}
                                                className="pagination-btn"
                                            >
                                                ← Previous
                                            </button>
                                            
                                            <span className="pagination-info">
                                                Page {Math.floor(applicationFilters.offset / applicationFilters.limit) + 1} of {Math.ceil(applications.total / applicationFilters.limit)}
                                            </span>
                                            
                                            <button 
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev, 
                                                    offset: prev.offset + prev.limit
                                                }))}
                                                disabled={applicationFilters.offset + applicationFilters.limit >= applications.total}
                                                className="pagination-btn"
                                            >
                                                Next →
                                            </button>
                                            
                                            <button 
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev, 
                                                    limit: applications.total,
                                                    offset: 0
                                                }))}
                                                className="pagination-btn show-all-btn"
                                            >
                                                Show All ({applications.total})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No applications found</p>
                                {applicationFilters.status && (
                                    <button 
                                        onClick={() => setApplicationFilters({...applicationFilters, status: ''})}
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
                            <button onClick={fetchInfoSessions} className="refresh-btn">Refresh</button>
                        </div>
                        
                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading info sessions...</p>
                            </div>
                        ) : infoSessions?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(infoSessions).map((session) => (
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
                                                    <td className="actions-cell">
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
                                                        <td colSpan="5" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <h4>Registrations</h4>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>Email</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>{reg.email}</td>
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
                            <button onClick={fetchWorkshops} className="refresh-btn">Refresh</button>
                        </div>
                        
                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading workshops...</p>
                            </div>
                        ) : workshops?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(workshops).map((workshop) => (
                                            <React.Fragment key={workshop.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {workshop.event_name}
                                                        {isEventPast(workshop.event_date, workshop.event_time) && (
                                                            <span className="event-status event-status--past">Past Event</span>
                                                        )}
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
                                                    <td className="actions-cell">
                                                        <button 
                                                            className="view-registrations-btn"
                                                            onClick={() => handleViewRegistrations('workshop', workshop.event_id)}
                                                        >
                                                            {selectedEvent === workshop.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                
                                                {selectedEvent === workshop.event_id && (
                                                    <tr className="registrations-row">
                                                        <td colSpan="5" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <h4>Registrations</h4>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>Email</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>{reg.email}</td>
                                                                                        <td>
                                                                                            <select
                                                                                                className={`attendance-status-dropdown-unified status-${reg.status}`}
                                                                                                value={reg.status}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.value !== reg.status) {
                                                                                                        handleMarkAttendance('workshop', workshop.event_id, reg.applicant_id, e.target.value);
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
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                applicantId={selectedApplicant?.applicant_id}
                applicantName={selectedApplicant?.name}
            />
        </div>
    );
};

export default AdmissionsDashboard; 