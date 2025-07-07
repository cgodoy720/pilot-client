import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { getUserId, clearUserData } from '../../utils/uuid';
import pursuitLogo from '../../assets/logo.png';
import './InfoSessions.css';
import '../ApplicantDashboard/ApplicantDashboard.css';
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
    const [currentUserId, setCurrentUserId] = useState(null);
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

    // Load current user ID on mount
    useEffect(() => {
        const userId = getUserId();
        setCurrentUserId(userId);
    }, []);

    // Load user data from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/apply/login');
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
                console.error('=== FETCH ERROR ===');
                console.error('Error fetching events:', error);
                console.error('Error message:', error.message);
                setEvents([]); // Ensure events is always an array
            }
        };

        console.log('=== USEEFFECT TRIGGERED ===');
        fetchEvents();
    }, []); // Remove currentUserId dependency since we don't need it for fetching

    // Add new event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            const eventToAdd = {
                ...newEvent,
                type_id: 'info_session',
                capacity: newEvent.capacity === '' ? 50 : parseInt(newEvent.capacity),
                status: 'scheduled'
            };

            await EventService.createEvent(eventToAdd);
            const updatedEvents = await EventService.getEvents({ type: 'info_session' });
            setEvents(updatedEvents);
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
            if (!currentUserId) {
                throw new Error('User ID not available');
            }

            const registrationData = {
                userId: currentUserId,
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
            const eventDate = format(new Date(event.start_time), 'MMMM d, yyyy');
            const eventTime = format(new Date(event.start_time), 'h:mm a');
            
            setRegistrationStatus('success');
            setStatusMessage(`You're registered for the Information Session on ${eventDate} at ${eventTime}!`);

            // Update local status state and localStorage
            setInfoSessionStatus('signed-up');
            const eventDetails = { eventDate, eventTime, location: event.location };
            setSessionDetails(eventDetails);
            localStorage.setItem('infoSessionStatus', 'signed-up');
            localStorage.setItem('infoSessionDetails', JSON.stringify(eventDetails));

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(prevEvents => 
                prevEvents.map(evt => {
                    if (evt.event_id === eventId) {
                        const newRegistration = {
                            registration_id: responseData.registration_id || `temp-${Date.now()}`,
                            user_id: currentUserId,
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

            // Update local storage and status
            if (event) {
                const eventDetails = {
                    date: eventDate,
                    time: eventTime,
                    location: event.location
                };
                localStorage.setItem('infoSessionStatus', 'signed-up');
                localStorage.setItem('infoSessionDetails', JSON.stringify(eventDetails));
                setInfoSessionStatus('signed-up');
                setSessionDetails(eventDetails);
            }
        } catch (error) {
            console.error('Error signing up for event:', error);
            
            // Enhanced error messages based on error type
            let errorMessage = 'Failed to register for this event.';
            
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                errorMessage = 'You are already registered for this event! Check your registered sessions below.';
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
            reg.user_id === currentUserId && 
            reg.status !== 'cancelled'
        );
    };

    // Get user's active registration for an event
    const getUserRegistration = (event) => {
        return event.registrations?.find(reg => 
            reg.user_id === currentUserId && 
            reg.status !== 'cancelled'
        );
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
            console.log('User ID:', currentUserId);
            console.log('Registration ID:', registrationId);
            console.log('Full URL:', `${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentUserId}`);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentUserId}`, {
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
            
            // Clear status in App and localStorage
            setInfoSessionStatus('not signed-up');
            setSessionDetails(null);
            localStorage.removeItem('infoSessionStatus');
            localStorage.removeItem('infoSessionDetails');

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
            <div className="admissions-topbar">
                <div className="admissions-topbar-left">
                    <div className="admissions-logo-section">
                        <Link to="/apply/dashboard">
                            <img src={pursuitLogo} alt="Pursuit Logo" className="admissions-logo" />
                        </Link>
                        <span className="admissions-logo-text">PURSUIT</span>
                    </div>
                    <div className="welcome-text">
                        Welcome, {user?.firstName || 'John'}!
                    </div>
                </div>
                <div className="admissions-topbar-right">
                    <button 
                        onClick={handleBackToDashboard}
                        className="admissions-button-secondary"
                    >
                        ← Back to Dashboard
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="admissions-button-primary"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Information Sessions Title */}
            <div className="admissions-title-section">
                <h1 className="admissions-title">
                    INFORMATION SESSIONS
                </h1>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 2rem 0 2rem' }}>
                
                {/* Status Messages */}
                {registrationStatus && (
                    <div style={{
                        padding: '15px 20px',
                        marginBottom: '25px',
                        borderRadius: '8px',
                        border: registrationStatus === 'success' ? '2px solid #10b981' : '2px solid #ef4444',
                        backgroundColor: registrationStatus === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: registrationStatus === 'success' ? '#065f46' : '#991b1b'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                                {registrationStatus === 'success' ? '🎉' : '⚠️'}
                            </span>
                            <strong>{statusMessage}</strong>
                        </div>
                    </div>
                )}
                

                {/* Registered Sessions Section */}
                {registeredEvents.length > 0 && (
                    <div>
                        <h3 className="info-sessions-title">
                            ✅ Your Registered Sessions ({registeredEvents.length})
                        </h3>
                        <div className="sessions-list">
                            {registeredEvents.map((event) => {
                                const registration = getUserRegistration(event);
                                return (
                                    <div key={event.event_id} className="session-card registered">
                                        <div className="registration-badge">
                                            REGISTERED
                                        </div>
                                        <h4>
                                            {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                        </h4>
                                        <p>
                                            📍 <strong>Location:</strong> {event.location}
                                        </p>
                                        {event.is_online && event.meeting_link && (
                                            <p>
                                                🔗 <strong>Meeting Link:</strong> 
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                                                    {event.meeting_link}
                                                </a>
                                            </p>
                                        )}
                                        {registration && (
                                            <div className="registration-details">
                                                <strong>Registration Details:</strong><br />
                                                Registered: {format(new Date(registration.registered_at), 'MMM d, yyyy \'at\' h:mm a')}<br />
                                                Status: {registration.status === 'attended' ? '✅ Attended' : '📝 Registered'}
                                            </div>
                                        )}
                                        <div className="button-container">
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancelRegistration(event.event_id, registration?.registration_id)}
                                                disabled={processingEventId === event.event_id}
                                            >
                                                {processingEventId === event.event_id ? 'Cancelling...' : 'Cancel Registration'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Sessions Section */}
                {availableEvents.length > 0 && (
                    <div>
                        <h3 className="available-sessions-title">
                            📅 Available Sessions ({availableEvents.length})
                        </h3>
                        <div className="sessions-list">
                            {availableEvents.map((event) => (
                                <div key={event.event_id} className="session-card">
                                    <h4>
                                        {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                    </h4>
                                    <p>
                                        📍 <strong>Location:</strong> {event.location}
                                    </p>
                                    <p>
                                        👥 <strong>Capacity:</strong> {event.registered_count || 0}/{event.capacity}
                                    </p>
                                    {event.is_online && event.meeting_link && (
                                        <p>
                                            🔗 <strong>Online Event</strong>
                                        </p>
                                    )}
                                    
                                    <button
                                        className="register-btn"
                                        onClick={() => handleSignUp(event.event_id)}
                                        disabled={processingEventId === event.event_id || isUserRegistered(event)}
                                    >
                                        {isUserRegistered(event) 
                                            ? '✅ Already Registered' 
                                            : processingEventId === event.event_id 
                                                ? 'Registering...' 
                                                : 'Register Now'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No events message */}
                {events.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        backgroundColor: 'var(--color-background-light)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>No Information Sessions Scheduled</h3>
                        <p>We'll add sessions as soon as they're scheduled. Check back regularly!</p>
                    </div>
                )}

                {/* Admin form */}
                {isAdmin && (
                    <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'var(--color-background-light)', borderRadius: '16px' }}>
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
    );
};

export default InfoSessions; 