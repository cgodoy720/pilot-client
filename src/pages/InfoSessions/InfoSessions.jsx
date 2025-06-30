import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/eventService';
import databaseService from '../../services/databaseService';
import './InfoSessions.css';

// TEMP: Replace with real user/admin logic
const isAdmin = false;

const InfoSessions = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
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
    const [currentApplicant, setCurrentApplicant] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null); // 'success', 'error', or null
    const [statusMessage, setStatusMessage] = useState('');
    const [processingEventId, setProcessingEventId] = useState(null);

    // Load current applicant session on mount
    useEffect(() => {
        const applicant = databaseService.getCurrentApplicant();
        if (applicant) {
            setCurrentApplicant(applicant);
        } else {
            // No valid authentication, redirect to login
            window.location.href = '/apply/login';
        }
    }, []);

    // Clear localStorage and reset applicant data (for debugging)
    const handleClearData = () => {
        localStorage.clear();
        setCurrentApplicant(null);
        setRegistrationStatus('success');
        setStatusMessage('Applicant data cleared!');
        setTimeout(() => setRegistrationStatus(null), 5000);
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
                if (!response.ok) throw new Error('Failed to fetch info sessions');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]); // Ensure events is always an array
            }
        };

        fetchEvents();
    }, []);

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
            const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
            if (createResponse.ok) {
                const updatedEvents = await createResponse.json();
                setEvents(updatedEvents);
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
            console.log('Attempting to register with applicant:', currentApplicant);
            
            if (!currentApplicant) {
                throw new Error('No applicant session found. Please fill out the application form first.');
            }

            const registrationData = {
                userId: currentApplicant.applicant_id,
                name: `${currentApplicant.first_name} ${currentApplicant.last_name}`,
                email: currentApplicant.email
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to register for event');
            }

            // SUCCESS - Show success status
            const event = events.find(e => e.event_id === eventId);
            const eventDate = format(new Date(event.start_time), 'MMMM d, yyyy');
            const eventTime = format(new Date(event.start_time), 'h:mm a');
            
            setRegistrationStatus('success');
            setStatusMessage(`You're registered for the Information Session on ${eventDate} at ${eventTime}!`);

            // Refresh the events list to show updated status
            const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
            if (refreshResponse.ok) {
                const updatedEvents = await refreshResponse.json();
                setEvents(updatedEvents);
            }

            // Update local storage and status
            if (event) {
                const eventDetails = {
                    date: eventDate,
                    time: eventTime,
                    location: event.location
                };
                localStorage.setItem('infoSessionStatus', 'signed-up');
                localStorage.setItem('infoSessionDetails', JSON.stringify(eventDetails));
            }
        } catch (error) {
            console.error('Error signing up for event:', error);
            console.error('Applicant was:', currentApplicant);
            
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
            const attendanceResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
            if (attendanceResponse.ok) {
                const updatedEvents = await attendanceResponse.json();
                setEvents(updatedEvents);
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    // Check if applicant is registered for an event
    const isApplicantRegistered = (event) => {
        if (!currentApplicant) return false;
        const isRegistered = event.registrations?.some(reg => reg.user_id === currentApplicant.applicant_id);
        return isRegistered;
    };

    // Get applicant's registration for an event
    const getApplicantRegistration = (event) => {
        if (!currentApplicant) return null;
        const registration = event.registrations?.find(reg => reg.user_id === currentApplicant.applicant_id);
        return registration;
    };

    // Get registered events
    const registeredEvents = events.filter(event => isApplicantRegistered(event));
    const availableEvents = events.filter(event => !isApplicantRegistered(event));

    const handleBack = () => {
        navigate('/apply');
    };

    return (
        <div className="info-sessions-container">
            <div className="info-sessions-header">
                <button onClick={handleBack} className="back-button">
                    ← Back to Dashboard
                </button>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ color: '#333', marginBottom: '30px' }}>Information Sessions</h2>
                
                {/* Applicant Session Info */}
                {currentApplicant && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}>
                        <strong>Welcome, {currentApplicant.first_name}!</strong><br />
                        <small>Email: {currentApplicant.email}</small>
                    </div>
                )}
                
                {!currentApplicant && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#991b1b'
                    }}>
                        <strong>⚠️ No applicant session found</strong><br />
                        Please complete the application form first to register for events.
                        <br />
                        <button 
                            onClick={() => navigate('/application-form')} 
                            style={{ 
                                marginTop: '10px', 
                                padding: '8px 16px', 
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Application Form
                        </button>
                    </div>
                )}
                
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
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ 
                            color: '#10b981', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            ✅ Your Registered Sessions ({registeredEvents.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {registeredEvents.map(event => {
                                const registration = getApplicantRegistration(event);
                                return (
                                    <div key={event.event_id} style={{
                                        padding: '20px',
                                        backgroundColor: '#f0fdf4',
                                        border: '2px solid #10b981',
                                        borderRadius: '10px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '15px', 
                                            right: '15px',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            REGISTERED
                                        </div>
                                        <h4 style={{ 
                                            margin: '0 0 10px 0', 
                                            color: '#065f46',
                                            fontSize: '18px'
                                        }}>
                                            {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                        </h4>
                                        <p style={{ margin: '5px 0', color: '#374151' }}>
                                            📍 <strong>Location:</strong> {event.location}
                                        </p>
                                        {event.is_online && event.meeting_link && (
                                            <p style={{ margin: '5px 0', color: '#374151' }}>
                                                🔗 <strong>Meeting Link:</strong> 
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px', color: '#10b981' }}>
                                                    {event.meeting_link}
                                                </a>
                                            </p>
                                        )}
                                        {registration && (
                                            <div style={{ 
                                                marginTop: '15px', 
                                                padding: '10px', 
                                                backgroundColor: 'white', 
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                color: '#6b7280'
                                            }}>
                                                <strong>Registration Details:</strong><br />
                                                Registered: {format(new Date(registration.registered_at), 'MMM d, yyyy \'at\' h:mm a')}<br />
                                                Status: {registration.status === 'attended' ? '✅ Attended' : '📝 Registered'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Sessions Section */}
                {availableEvents.length > 0 && (
                    <div>
                        <h3 style={{ 
                            color: '#374151', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            📅 Available Sessions ({availableEvents.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {availableEvents.map((event) => (
                                <div key={event.event_id} style={{
                                    padding: '20px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '10px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}>
                                    <h4 style={{ 
                                        margin: '0 0 10px 0', 
                                        color: '#111827',
                                        fontSize: '18px'
                                    }}>
                                        {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                    </h4>
                                    <p style={{ margin: '5px 0', color: '#6b7280' }}>
                                        📍 <strong>Location:</strong> {event.location}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#6b7280' }}>
                                        👥 <strong>Capacity:</strong> {event.registered_count || 0}/{event.capacity}
                                    </p>
                                    {event.is_online && event.meeting_link && (
                                        <p style={{ margin: '5px 0', color: '#6b7280' }}>
                                            🔗 <strong>Online Event</strong>
                                        </p>
                                    )}
                                    
                                    <button
                                        onClick={() => handleSignUp(event.event_id)}
                                        disabled={!currentApplicant || processingEventId === event.event_id || isApplicantRegistered(event)}
                                        style={{
                                            marginTop: '15px',
                                            backgroundColor: !currentApplicant
                                                ? '#6b7280'
                                                : isApplicantRegistered(event) 
                                                    ? '#6b7280' 
                                                    : processingEventId === event.event_id 
                                                        ? '#9ca3af' 
                                                        : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            cursor: !currentApplicant || isApplicantRegistered(event) || processingEventId === event.event_id 
                                                ? 'not-allowed' 
                                                : 'pointer',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        {!currentApplicant
                                            ? 'Complete Application First'
                                            : isApplicantRegistered(event) 
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
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        color: '#6b7280'
                    }}>
                        <h3>No Information Sessions Scheduled</h3>
                        <p>We'll add sessions as soon as they're scheduled. Check back regularly!</p>
                    </div>
                )}

                {/* Admin form */}
                {isAdmin && (
                    <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
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