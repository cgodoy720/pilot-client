import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import EventService from '../services/eventService';
import { getUserId, clearUserData } from '../utils/uuid';
import pursuitLogo from '../assets/pursuit-logo-white.png';

// TEMP: Replace with real user/admin logic
const isAdmin = false;
const currentUserName = 'You';

const Workshops = ({ setWorkshopStatus }) => {
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
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [processingEventId, setProcessingEventId] = useState(null);
    const [rescheduleEvent, setRescheduleEvent] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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

    // Fetch workshops on mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getEvents({ type: 'workshop' });
                // Fetch registrations for each event
                const eventsWithRegistrations = await Promise.all(
                    data.map(async (event) => {
                        try {
                            const registrations = await EventService.getEventRegistrations(event.event_id);
                            return { ...event, registrations };
                        } catch (err) {
                            console.error('Error fetching registrations for event', event.event_id, err);
                            return { ...event, registrations: [] };
                        }
                    })
                );
                setEvents(eventsWithRegistrations);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        if (currentUserId) {
            fetchEvents();
        }
    }, [currentUserId]); // Re-fetch when user ID changes

    // Add new event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            const eventToAdd = {
                ...newEvent,
                type_id: 'workshop',
                capacity: newEvent.capacity === '' ? 30 : parseInt(newEvent.capacity),
                status: 'scheduled'
            };

            await EventService.createEvent(eventToAdd);
            const updatedEvents = await EventService.getEvents({ type: 'workshop' });
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

            const response = await EventService.registerForEvent(eventId, {
                user_id: currentUserId,
                name: 'Jacqueline Reverand',
                email: 'jac@pursuit.org'
            });

            // SUCCESS - Show success status
            const event = events.find(e => e.event_id === eventId);
            const eventDate = format(new Date(event.start_time), 'MMMM d, yyyy');
            const eventTime = format(new Date(event.start_time), 'h:mm a');
            
            setRegistrationStatus('success');
            setStatusMessage(`You're registered for the Workshop on ${eventDate} at ${eventTime}!`);

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(prevEvents => 
                prevEvents.map(evt => {
                    if (evt.event_id === eventId) {
                        const newRegistration = {
                            registration_id: response.registration_id || `temp-${Date.now()}`,
                            user_id: currentUserId,
                            name: 'Jacqueline Reverand',
                            email: 'jac@pursuit.org',
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
                localStorage.setItem('workshopStatus', 'signed-up');
                localStorage.setItem('workshopDetails', JSON.stringify(eventDetails));
                setWorkshopStatus('signed-up');
            }
        } catch (error) {
            console.error('Error signing up for event:', error);
            
            // Enhanced error messages based on error type
            let errorMessage = 'Failed to register for this workshop.';
            
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                errorMessage = 'You are already registered for this workshop! Check your registered workshops below.';
            } else if (error.message.includes('capacity') || error.message.includes('full')) {
                errorMessage = 'Sorry, this workshop is fully booked. Please try registering for another session.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'This workshop is no longer available. Please refresh the page and try again.';
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
            const updatedEvents = await EventService.getEvents({ type: 'workshop' });
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
        const registration = event.registrations?.find(reg => 
            reg.user_id === currentUserId && 
            reg.status !== 'cancelled'
        );
        console.log(`[DEBUG WORKSHOPS] getUserRegistration for event ${event.event_id}:`, registration);
        return registration;
    };

    // Get registered events
    const registeredEvents = events.filter(event => isUserRegistered(event));
    const availableEvents = events.filter(event => !isUserRegistered(event));

    console.log('[DEBUG WORKSHOPS] Current state:', {
        currentUserId,
        eventsCount: events.length,
        registeredEventsCount: registeredEvents.length,
        availableEventsCount: availableEvents.length,
        processingEventId,
        registrationStatus
    });

    // Cancel user registration
    const handleCancelRegistration = async (eventId, registrationId) => {
        setProcessingEventId(eventId);
        console.log('[DEBUG WORKSHOPS] Cancelling registration:', { eventId, registrationId, currentUserId });
        
        try {
            await EventService.cancelRegistration(eventId, registrationId);
            console.log('[DEBUG WORKSHOPS] Server cancellation successful');
            
            // IMMEDIATE STATE UPDATE - Mark registration as cancelled
            setEvents(prevEvents => {
                const updatedEvents = prevEvents.map(evt => {
                    if (evt.event_id === eventId) {
                        const updatedRegistrations = (evt.registrations || []).map(reg => {
                            if (reg.registration_id === registrationId) {
                                return { ...reg, status: 'cancelled' };
                            }
                            return reg;
                        });
                        console.log('[DEBUG WORKSHOPS] Updated registrations for event', eventId, ':', updatedRegistrations);
                        return {
                            ...evt,
                            registrations: updatedRegistrations
                        };
                    }
                    return evt;
                });
                console.log('[DEBUG WORKSHOPS] Updated events state:', updatedEvents);
                return updatedEvents;
            });
            
            setRegistrationStatus('success');
            setStatusMessage('Workshop registration cancelled successfully.');
            
            // Clear status in App and localStorage
            setWorkshopStatus('not signed-up');
            localStorage.removeItem('workshopStatus');
            localStorage.removeItem('workshopDetails');
            console.log('[DEBUG WORKSHOPS] LocalStorage and app state cleared');

        } catch (error) {
            console.error('[DEBUG WORKSHOPS] Cancellation failed:', error);
            setRegistrationStatus('error');
            setStatusMessage('Failed to cancel workshop registration.');
        } finally {
            setProcessingEventId(null);
        }
    };

    // Cancel event
    const handleCancelEvent = async (eventId) => {
        setProcessingEventId(eventId);
        try {
            await EventService.cancelEvent(eventId, cancelReason);
            const updatedEvents = await EventService.getEvents({ type: 'workshop' });
            setEvents(updatedEvents);
            setShowCancelModal(false);
            setCancelReason('');
            setRegistrationStatus('success');
            setStatusMessage('Event cancelled successfully');
        } catch (error) {
            console.error('Error cancelling event:', error);
            setRegistrationStatus('error');
            setStatusMessage('Failed to cancel event');
        } finally {
            setProcessingEventId(null);
        }
    };

    // Reschedule event
    const handleRescheduleEvent = async (eventId) => {
        setProcessingEventId(eventId);
        try {
            const { start_time, end_time } = rescheduleEvent;
            await EventService.rescheduleEvent(eventId, start_time, end_time, cancelReason);
            const updatedEvents = await EventService.getEvents({ type: 'workshop' });
            setEvents(updatedEvents);
            setShowRescheduleModal(false);
            setRescheduleEvent(null);
            setCancelReason('');
            setRegistrationStatus('success');
            setStatusMessage('Event rescheduled successfully');
        } catch (error) {
            console.error('Error rescheduling event:', error);
            setRegistrationStatus('error');
            setStatusMessage('Failed to reschedule event');
        } finally {
            setProcessingEventId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/apply/login');
    };

    const handleBackToMainApp = () => {
        navigate('/dashboard');
    };

    const handleBackToDashboard = () => {
        navigate('/apply/dashboard');
    };

    return (
        <div className="workshops-container" style={{
            backgroundColor: 'var(--color-background-dark)',
            minHeight: '100vh',
            width: '100vw',
            margin: 0,
            padding: 0,
            color: 'var(--color-text-primary)',
            fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
            position: 'relative'
        }}>
            {/* Top Bar */}
            <div className="admissions-topbar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 2vw',
                background: 'var(--color-background-dark)',
                width: '100vw',
                boxSizing: 'border-box'
            }}>
                <div className="admissions-topbar-left" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    minWidth: 0
                }}>
                    <div className="admissions-logo-section" style={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 0
                    }}>
                        <Link to="/apply/dashboard">
                            <img src={pursuitLogo} alt="Pursuit Logo" style={{
                                height: '48px',
                                width: '48px',
                                objectFit: 'contain',
                                background: 'transparent',
                                display: 'block',
                                margin: '0 auto',
                                cursor: 'pointer'
                            }} />
                        </Link>
                        <span style={{
                            fontWeight: '700',
                            fontSize: '2rem',
                            color: '#fff',
                            marginLeft: '0.5rem',
                            letterSpacing: '0.02em',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>PURSUIT</span>
                    </div>
                    <div className="welcome-text" style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginLeft: '2rem'
                    }}>
                        Welcome, {user?.firstName || 'John'}!
                    </div>
                </div>
                <div className="admissions-topbar-right" style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <button 
                        onClick={handleBackToDashboard}
                        style={{
                            background: 'transparent',
                            color: 'var(--color-text-primary)',
                            border: '2px solid var(--color-primary)',
                            padding: '0.4rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <button 
                        onClick={handleLogout}
                        style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Workshops Title */}
            <div className="admissions-title-section" style={{
                width: '100vw',
                textAlign: 'left',
                padding: '1.5rem 0 0 2vw'
            }}>
                <h1 className="admissions-title" style={{
                    fontSize: '2.8rem',
                    fontWeight: '900',
                    color: '#fff',
                    letterSpacing: '-0.04em',
                    margin: 0,
                    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
                    lineHeight: 1.1
                }}>
                    WORKSHOPS
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

                {/* Registered Workshops Section */}
                {registeredEvents.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ 
                            color: '#10b981', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            ✅ Your Registered Workshops ({registeredEvents.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {registeredEvents.map(event => {
                                const registration = getUserRegistration(event);
                                return (
                                    <div key={event.event_id} style={{
                                        padding: '20px',
                                        backgroundColor: 'var(--color-background-light)',
                                        border: '2px solid #10b981',
                                        borderRadius: '16px',
                                        position: 'relative',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                                            color: 'var(--color-text-primary)',
                                            fontSize: '18px'
                                        }}>
                                            {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                        </h4>
                                        <p style={{ margin: '5px 0', color: 'var(--color-text-secondary)' }}>
                                            📍 <strong>Location:</strong> {event.location}
                                        </p>
                                        {event.is_online && event.meeting_link && (
                                            <p style={{ margin: '5px 0', color: 'var(--color-text-secondary)' }}>
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
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                <strong>Registration Details:</strong><br />
                                                Registered: {format(new Date(registration.registered_at), 'MMM d, yyyy \'at\' h:mm a')}<br />
                                                Status: {registration.status === 'attended' ? '✅ Attended' : '📝 Registered'}
                                            </div>
                                        )}
                                        {/* Cancel Button */}
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleCancelRegistration(event.event_id, registration.registration_id)}
                                                disabled={processingEventId === event.event_id}
                                                style={{
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    cursor: processingEventId === event.event_id ? 'not-allowed' : 'pointer'
                                                }}
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

                {/* Available Workshops Section */}
                {availableEvents.length > 0 && (
                    <div>
                        <h3 style={{ 
                            color: 'var(--color-text-primary)', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            🔧 Available Workshops ({availableEvents.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {availableEvents.map((event) => (
                                <div key={event.event_id} style={{
                                    padding: '20px',
                                    backgroundColor: 'var(--color-background-light)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}>
                                    <h4 style={{ 
                                        margin: '0 0 10px 0', 
                                        color: 'var(--color-text-primary)',
                                        fontSize: '18px'
                                    }}>
                                        {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                    </h4>
                                    <p style={{ margin: '5px 0', color: 'var(--color-text-secondary)' }}>
                                        📍 <strong>Location:</strong> {event.location}
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--color-text-secondary)' }}>
                                        👥 <strong>Capacity:</strong> {event.registered_count || 0}/{event.capacity}
                                    </p>
                                    {event.is_online && event.meeting_link && (
                                        <p style={{ margin: '5px 0', color: 'var(--color-text-secondary)' }}>
                                            🔗 <strong>Online Event</strong>
                                        </p>
                                    )}
                                    
                                    <button
                                        onClick={() => handleSignUp(event.event_id)}
                                        disabled={processingEventId === event.event_id || isUserRegistered(event)}
                                        style={{
                                            marginTop: '15px',
                                            backgroundColor: 'var(--color-primary)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            width: '100%',
                                            maxWidth: '280px',
                                            opacity: isUserRegistered(event) || processingEventId === event.event_id ? 0.6 : 1
                                        }}
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
                        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>No Workshops Scheduled</h3>
                        <p>We'll add workshops as soon as they're scheduled. Check back regularly!</p>
                    </div>
                )}

                {/* Admin form */}
                {isAdmin && (
                    <div style={{ 
                        marginTop: '40px', 
                        padding: '20px', 
                        backgroundColor: 'var(--color-background-light)', 
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h3 style={{ color: 'var(--color-text-primary)' }}>Add New Workshop</h3>
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
                            <button type="submit">Add Workshop</button>
                        </form>
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Cancel Event</h3>
                            <textarea
                                placeholder="Reason for cancellation"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                            />
                            <div className="modal-actions">
                                <button onClick={() => setShowCancelModal(false)}>Cancel</button>
                                <button 
                                    onClick={() => handleCancelEvent(processingEventId)}
                                    disabled={!cancelReason.trim()}
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reschedule Modal */}
                {showRescheduleModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Reschedule Event</h3>
                            <input
                                type="datetime-local"
                                value={rescheduleEvent?.start_time || ''}
                                onChange={(e) => setRescheduleEvent({
                                    ...rescheduleEvent,
                                    start_time: e.target.value
                                })}
                            />
                            <input
                                type="datetime-local"
                                value={rescheduleEvent?.end_time || ''}
                                onChange={(e) => setRescheduleEvent({
                                    ...rescheduleEvent,
                                    end_time: e.target.value
                                })}
                            />
                            <textarea
                                placeholder="Reason for rescheduling"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                            />
                            <div className="modal-actions">
                                <button onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                                <button 
                                    onClick={() => handleRescheduleEvent(processingEventId)}
                                    disabled={!rescheduleEvent?.start_time || !rescheduleEvent?.end_time || !cancelReason.trim()}
                                >
                                    Confirm Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                }

                .modal-content h3 {
                    margin-top: 0;
                    color: #374151;
                }

                .modal-content textarea {
                    width: 100%;
                    padding: 8px;
                    margin: 10px 0;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    resize: vertical;
                }

                .modal-content input {
                    width: 100%;
                    padding: 8px;
                    margin: 10px 0;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }

                .modal-actions button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                }

                .modal-actions button:first-child {
                    background-color: #e5e7eb;
                    color: #374151;
                }

                .modal-actions button:last-child {
                    background-color: #ef4444;
                    color: white;
                }

                .modal-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cancelled-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: #ef4444;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }

                .admin-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }

                .admin-actions button {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                }

                .admin-actions button:first-child {
                    background-color: #ef4444;
                    color: white;
                }

                .admin-actions button:last-child {
                    background-color: #3b82f6;
                    color: white;
                }

                .admin-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Workshops; 