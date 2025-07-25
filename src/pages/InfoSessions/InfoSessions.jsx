import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import { getEasternTimeParts, formatInEasternTime } from '../../utils/dateHelpers';
import './InfoSessions.css';
// TEMP: Replace with real user/admin logic
const isAdmin = false;
const currentUserName = 'You';

const InfoSessions = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        capacity: '',
        is_online: false,
        meeting_link: ''
    });
    const [currentApplicantId, setCurrentApplicantId] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null); // 'success', 'error', or null
    const [statusMessage, setStatusMessage] = useState('');
    const [processingEventId, setProcessingEventId] = useState(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleFromEvent, setRescheduleFromEvent] = useState(null);
    const [selectedNewSessionId, setSelectedNewSessionId] = useState('');
    
    // Self-managed status state (no longer relying on props)
    const [infoSessionStatus, setInfoSessionStatus] = useState(localStorage.getItem('infoSessionStatus') || 'not signed-up');
    const [sessionDetails, setSessionDetails] = useState(() => {
        const saved = localStorage.getItem('infoSessionDetails');
        return saved ? JSON.parse(saved) : null;
    });

    // Load current applicant ID on mount
    useEffect(() => {
        const loadApplicantId = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    
                    // Get applicant ID from the database using email
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${userData.email}`);
                    if (response.ok) {
                        const applicant = await response.json();
                        setCurrentApplicantId(applicant.applicant_id);
                        console.log('Loaded applicant ID:', applicant.applicant_id);
                    } else {
                        console.warn('Could not load applicant ID');
                    }
                }
            } catch (error) {
                console.error('Error loading applicant ID:', error);
            }
        };
        
        loadApplicantId();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const handleBackToMainApp = () => {
        navigate('/dashboard');
    };

    const handleBackToDashboard = () => {
        navigate('/apply');
    };

    // Clear status messages after 5 seconds
    useEffect(() => {
        if (registrationStatus) {
            const timer = setTimeout(() => {
                setRegistrationStatus(null);
                setStatusMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [registrationStatus]);

    // Fetch info sessions on mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                console.log('=== STARTING FETCH ===');
                console.log('API URL:', import.meta.env.VITE_API_URL);
                console.log('Full URL:', `${import.meta.env.VITE_API_URL}/api/info-sessions`);
                
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
                console.log('Response received:', response);
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch info sessions: ${response.status}`);
                }
                const data = await response.json();
                console.log('=== DATA RECEIVED ===');
                console.log('Raw data:', data);
                console.log('Data type:', typeof data);
                console.log('Is array:', Array.isArray(data));
                console.log('Number of sessions:', data.length);
                
                // Add registrations data to each event
                const eventsWithRegistrations = data.map(event => ({
                    ...event,
                    registrations: event.registrations || []
                }));
                
                console.log('Events with registrations:', eventsWithRegistrations);
                console.log('About to set events state...');
                setEvents(eventsWithRegistrations);
                console.log('setEvents called with:', eventsWithRegistrations.length, 'events');
                
                // Force a re-render check
                setTimeout(() => {
                    console.log('=== POST-SETSTATE CHECK ===');
                    console.log('Events state should now be:', eventsWithRegistrations.length);
                }, 100);
                
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]); // Ensure events is always an array
            }
        };

        fetchEvents();
    }, []); // Remove currentUserId dependency since we don't need it for fetching

    // Add new event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            const eventToAdd = {
                ...newEvent,
                capacity: newEvent.capacity === '' ? 50 : parseInt(newEvent.capacity)
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventToAdd),
            });

            if (!response.ok) {
                throw new Error('Failed to create info session');
            }

            // Refresh the events list
            const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
            if (refreshResponse.ok) {
                const updatedData = await refreshResponse.json();
                const eventsWithRegistrations = updatedData.map(event => ({
                    ...event,
                    registrations: event.registrations || []
                }));
                setEvents(eventsWithRegistrations);
            }

            setNewEvent({
                title: '',
                description: '',
                start_time: '',
                end_time: '',
                location: '',
                capacity: '',
                is_online: false,
                meeting_link: ''
            });
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    // Sign up for an event
    const handleSignUp = async (eventId) => {
        setProcessingEventId(eventId);
        try {
            if (!currentApplicantId) {
                throw new Error('Applicant ID not available');
            }

            const registrationData = {
                applicantId: currentApplicantId,
                name: user?.firstName || 'Applicant',
                email: user?.email || 'jac@pursuit.org'
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register for event');
            }

            const responseData = await response.json();

            // SUCCESS - Show success status
            const event = events.find(e => e.event_id === eventId);
            const easternEventTime = getEasternTimeParts(event.start_time);
            const eventDate = format(easternEventTime, 'MMMM d, yyyy');
            const eventTime = formatInEasternTime(event.start_time, 'time');
            
            setRegistrationStatus('success');
            setStatusMessage(`You're registered for the Information Session on ${eventDate} at ${eventTime}!`);

            // Update local status state (multiple registrations now allowed)
            setInfoSessionStatus('signed-up');

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(prevEvents => 
                prevEvents.map(evt => {
                    if (evt.event_id === eventId) {
                        const newRegistration = {
                            registration_id: responseData.registration_id || `temp-${Date.now()}`,
                            applicant_id: currentApplicantId,
                            name: user?.firstName || 'Applicant',
                            email: user?.email || 'jac@pursuit.org',
                            status: 'registered',
                            registered_at: new Date().toISOString()
                        };
                        return {
                            ...evt,
                            registrations: [...(evt.registrations || []), newRegistration]
                        };
                    }
                    return evt;
                })
            );

            // Update status (multiple registrations now allowed)
            setInfoSessionStatus('signed-up');
        } catch (error) {
            console.error('Error signing up for event:', error);
            
            // Enhanced error messages based on error type
            let errorMessage = 'Failed to register for this event.';
            
            if (error.message.includes('already registered') || error.message.includes('User already registered') || error.message.includes("You're already registered for an event")) {
                errorMessage = error.message; // Use the backend message directly
            } else if (error.message.includes('capacity') || error.message.includes('full')) {
                errorMessage = 'Sorry, this event is fully booked. Please try registering for another session.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'This event is no longer available. Please refresh the page and try again.';
            } else {
                errorMessage = `Registration failed: ${error.message}. Please try again or contact support.`;
            }
            
            setRegistrationStatus('error');
            setStatusMessage(errorMessage);
        } finally {
            setProcessingEventId(null);
        }
    };

    // Mark attendance
    const handleMarkAttendance = async (eventId, registrationId) => {
        try {
            await EventService.updateRegistrationStatus(eventId, registrationId, 'attended');
            const updatedEvents = await EventService.getEvents({ type: 'info_session' });
            setEvents(updatedEvents);
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    // Check if user is registered for an event (only active registrations)
    const isUserRegistered = (event) => {
        return event.registrations?.some(reg => 
            reg.applicant_id === currentApplicantId && 
            reg.status !== 'cancelled'
        );
    };

    // Get user's active registration for an event
    const getUserRegistration = (event) => {
        return event.registrations?.find(reg => 
            reg.applicant_id === currentApplicantId && 
            reg.status !== 'cancelled'
        );
    };

    // Check if an event has already passed
    const isEventPassed = (event) => {
        const easternEventTime = getEasternTimeParts(event.start_time);
        const now = new Date();
        return easternEventTime && easternEventTime < now;
    };

    // Get registered events
    const registeredEvents = events.filter(event => isUserRegistered(event));
    const availableEvents = events.filter(event => !isUserRegistered(event));

    // Cancel registration
    const handleCancelRegistration = async (eventId, registrationId) => {
        setProcessingEventId(eventId);
        
        try {
            console.log('=== CANCELLATION ATTEMPT ===');
            console.log('Event ID:', eventId);
            console.log('Applicant ID:', currentApplicantId);
            console.log('Registration ID:', registrationId);
            console.log('Full URL:', `${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentApplicantId}`);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentApplicantId}`, {
                method: 'DELETE'
            });

            console.log('Cancel response status:', response.status);
            console.log('Cancel response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Cancel response error:', errorData);
                throw new Error(errorData.message || `Failed to cancel registration (${response.status})`);
            }
            
            const responseData = await response.json();
            console.log('Cancel response data:', responseData);
            
            // IMMEDIATE STATE UPDATE - Mark registration as cancelled
            setEvents(prevEvents => {
                return prevEvents.map(evt => {
                    if (evt.event_id === eventId) {
                        const updatedRegistrations = (evt.registrations || []).map(reg => {
                            if (reg.registration_id === registrationId) {
                                return { ...reg, status: 'cancelled' };
                            }
                            return reg;
                        });
                        return {
                            ...evt,
                            registrations: updatedRegistrations
                        };
                    }
                    return evt;
                });
            });
            
            setRegistrationStatus('success');
            setStatusMessage('Registration cancelled successfully.');
            
            // Check if user still has other info session registrations
            const remainingRegistrations = events.filter(evt => 
                evt.event_id !== eventId && 
                evt.registrations?.some(reg => 
                    reg.applicant_id === currentApplicantId && 
                    reg.status !== 'cancelled'
                )
            );
            
            // Only clear status if no other registrations exist
            if (remainingRegistrations.length === 0) {
                setInfoSessionStatus('not signed-up');
            }

            // Force refresh to ensure we have the latest data from server
            setTimeout(async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
                    if (response.ok) {
                        const data = await response.json();
                        const eventsWithRegistrations = data.map(event => ({
                            ...event,
                            registrations: event.registrations || []
                        }));
                        setEvents(eventsWithRegistrations);
                    }
                } catch (error) {
                    console.error('Error refreshing after cancellation:', error);
                }
            }, 100); // Small delay to ensure server state is updated

        } catch (error) {
            console.error('Error cancelling registration:', error);
            setRegistrationStatus('error');
            setStatusMessage(`Failed to cancel registration: ${error.message}`);
        } finally {
            setProcessingEventId(null);
        }
    };

    return (
        <div className="admissions-dashboard">
            {/* Top Bar */}
            <div className="admissions-dashboard__topbar">
                <div className="admissions-dashboard__topbar-left">
                            <div className="admissions-dashboard__logo-section">
          <Link to="/apply">
            <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
          </Link>
        </div>
                    <div className="admissions-dashboard__welcome-text">
                        Welcome, {user?.firstName || 'John'}!
                    </div>
                </div>
                <div className="admissions-dashboard__topbar-right">
                    <button 
                        onClick={handleBackToDashboard}
                        className="admissions-dashboard__button--secondary"
                    >
                        ← Back to Dashboard
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="admissions-dashboard__button--primary"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Info Sessions Container */}
            <div className="info-sessions__main">
                {/* Title */}
                <div className="admissions-dashboard__title-section">
                    <h1 className="admissions-dashboard__title">
                        Select a time slot for your info session at Pursuit HQ.
                    </h1>
                </div>

                <div className="info-sessions__content">
                    
                    {/* Status Messages */}
                    {registrationStatus && (
                        <div className={`info-sessions__status-banner info-sessions__status-banner--${registrationStatus}`}>
                            <div className="info-sessions__status-content">
                                <span className="info-sessions__status-icon">
                                    {registrationStatus === 'success' ? '🎉' : '⚠️'}
                                </span>
                                <strong>{statusMessage}</strong>
                            </div>
                        </div>
                    )}

                    {/* Time Slots Grid */}
                    <div className="info-sessions__time-slots-grid">
                        {events.length === 0 ? (
                            <div className="info-sessions__no-sessions-message">
                                <h3>No Information Sessions Scheduled</h3>
                                <p>We'll add sessions as soon as they're scheduled. Check back regularly!</p>
                            </div>
                        ) : (
                            events.map((event) => {
                                const isRegistered = isUserRegistered(event);
                                const isFull = (event.registered_count || 0) >= event.capacity;
                                const isPassed = isEventPassed(event);
                                const registration = getUserRegistration(event);
                                
                                // Convert UTC times to Eastern Time for display
                                const easternStartTime = getEasternTimeParts(event.start_time);
                                const easternEndTime = getEasternTimeParts(event.end_time);
                                
                                const month = format(easternStartTime, 'MMMM');
                                const day = format(easternStartTime, 'd');
                                const dayOfWeek = format(easternStartTime, 'EEEE');
                                const timeRange = `${formatInEasternTime(event.start_time, 'time')} - ${formatInEasternTime(event.end_time, 'time')}`;
                                
                                return (
                                    <div 
                                        key={event.event_id} 
                                        className={`info-sessions__time-slot-card ${isRegistered ? 'info-sessions__time-slot-card--selected' : ''} ${isFull && !isRegistered ? 'info-sessions__time-slot-card--full' : ''} ${isPassed ? 'info-sessions__time-slot-card--passed' : ''}`}
                                    >
                                        <div className="info-sessions__time-slot-header">
                                            <div className="info-sessions__date-info">
                                                <span className="info-sessions__month">{month}</span>
                                                <span className="info-sessions__day">{day}</span>
                                                <span className="info-sessions__day-of-week">{dayOfWeek}</span>
                                            </div>
                                            <div className="info-sessions__time-info">
                                                <span className="info-sessions__time-range">{timeRange}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="info-sessions__location-info">
                                            <span className="info-sessions__location-type">
                                                {event.is_online ? '💻 Online' : '🏢 In-Person'}
                                            </span>
                                        </div>
                                        
                                        {isRegistered ? (
                                            <div className="info-sessions__slot-actions info-sessions__registered-actions">
                                                <button
                                                    className="info-sessions__cancel-selection-btn"
                                                    onClick={() => handleCancelRegistration(event.event_id, registration?.registration_id)}
                                                    disabled={processingEventId === event.event_id}
                                                >
                                                    {processingEventId === event.event_id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                                <div className="info-sessions__selected-indicator">Reserved</div>
                                            </div>
                                        ) : (
                                            <div className="info-sessions__slot-actions">
                                                <button
                                                    className={`info-sessions__select-btn ${isFull ? 'info-sessions__select-btn--full' : ''} ${isPassed ? 'info-sessions__select-btn--disabled' : ''}`}
                                                    onClick={() => !isFull && !isPassed && handleSignUp(event.event_id)}
                                                    disabled={processingEventId === event.event_id || isFull || isPassed}
                                                >
                                                    {isPassed ? 'Event Passed' :
                                                     isFull ? 'Full' : 
                                                     processingEventId === event.event_id ? 'Reserving...' : 'Reserve'}
                                                </button>
                                            </div>
                                        )}
                                        
                                        {event.is_online && event.meeting_link && isRegistered && (
                                            <div className="info-sessions__meeting-link-section">
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="info-sessions__meeting-link">
                                                    Join Meeting
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Admin form */}
                    {isAdmin && (
                        <div className="info-sessions__admin-form-section">
                            <h3>Add New Info Session</h3>
                            <form onSubmit={handleAddEvent}>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    value={newEvent.start_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    value={newEvent.end_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Capacity"
                                    value={newEvent.capacity}
                                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newEvent.is_online}
                                        onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                                    />
                                    Online Event
                                </label>
                                {newEvent.is_online && (
                                    <input
                                        type="text"
                                        placeholder="Meeting Link"
                                        value={newEvent.meeting_link}
                                        onChange={(e) => setNewEvent({ ...newEvent, meeting_link: e.target.value })}
                                    />
                                )}
                                <button type="submit">Add Session</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoSessions; 