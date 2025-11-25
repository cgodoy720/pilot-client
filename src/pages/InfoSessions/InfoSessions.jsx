import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import { getEasternTimeParts, formatInEasternTime } from '../../utils/dateHelpers';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Calendar, Clock, MapPin, CheckCircle2, Laptop, Building } from 'lucide-react';

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
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [processingEventId, setProcessingEventId] = useState(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleFromEvent, setRescheduleFromEvent] = useState(null);
    const [selectedNewSessionId, setSelectedNewSessionId] = useState('');
    
    const [infoSessionStatus, setInfoSessionStatus] = useState(localStorage.getItem('infoSessionStatus') || 'not signed-up');
    const [sessionDetails, setSessionDetails] = useState(() => {
        const saved = localStorage.getItem('infoSessionDetails');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const loadApplicantId = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    
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

    useEffect(() => {
        if (registrationStatus) {
            const timer = setTimeout(() => {
                setRegistrationStatus(null);
                setStatusMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [registrationStatus]);

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
                
                const eventsWithRegistrations = data.map(event => ({
                    ...event,
                    registrations: event.registrations || []
                }));
                
                console.log('Events with registrations:', eventsWithRegistrations);
                console.log('About to set events state...');
                setEvents(eventsWithRegistrations);
                console.log('setEvents called with:', eventsWithRegistrations.length, 'events');
                
                setTimeout(() => {
                    console.log('=== POST-SETSTATE CHECK ===');
                    console.log('Events state should now be:', eventsWithRegistrations.length);
                }, 100);
                
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            }
        };

        fetchEvents();
    }, []);

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

            const event = events.find(e => e.event_id === eventId);
            const easternEventTime = getEasternTimeParts(event.start_time);
            const eventDate = format(easternEventTime, 'MMMM d, yyyy');
            const eventTime = formatInEasternTime(event.start_time, 'time');
            
            setRegistrationStatus('success');
            setStatusMessage(`You're registered for the Information Session on ${eventDate} at ${eventTime}!`);

            setInfoSessionStatus('signed-up');

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

            setInfoSessionStatus('signed-up');
        } catch (error) {
            console.error('Error signing up for event:', error);
            
            let errorMessage = 'Failed to register for this event.';
            
            if (error.message.includes('already registered') || error.message.includes('User already registered') || error.message.includes("You're already registered for an event")) {
                errorMessage = error.message;
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

    const handleMarkAttendance = async (eventId, registrationId) => {
        try {
            await EventService.updateRegistrationStatus(eventId, registrationId, 'attended');
            const updatedEvents = await EventService.getEvents({ type: 'info_session' });
            setEvents(updatedEvents);
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    const isUserRegistered = (event) => {
        return event.registrations?.some(reg => 
            reg.applicant_id === currentApplicantId && 
            reg.status !== 'cancelled'
        );
    };

    const getUserRegistration = (event) => {
        return event.registrations?.find(reg => 
            reg.applicant_id === currentApplicantId && 
            reg.status !== 'cancelled'
        );
    };

    const isEventPassed = (event) => {
        const easternEventTime = getEasternTimeParts(event.start_time);
        const now = new Date();
        return easternEventTime && easternEventTime < now;
    };

    const registeredEvents = events.filter(event => isUserRegistered(event));
    const availableEvents = events.filter(event => !isUserRegistered(event));

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
            
            const remainingRegistrations = events.filter(evt => 
                evt.event_id !== eventId && 
                evt.registrations?.some(reg => 
                    reg.applicant_id === currentApplicantId && 
                    reg.status !== 'cancelled'
                )
            );
            
            if (remainingRegistrations.length === 0) {
                setInfoSessionStatus('not signed-up');
            }

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
            }, 100);

        } catch (error) {
            console.error('Error cancelling registration:', error);
            setRegistrationStatus('error');
            setStatusMessage(`Failed to cancel registration: ${error.message}`);
        } finally {
            setProcessingEventId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#EFEFEF] font-sans">
            {/* Top Bar */}
            <div className="bg-white border-b border-[#C8C8C8] px-4 md:px-8 py-2">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-5">
                        <Link to="/apply">
                            <img 
                                src={pursuitLogoFull} 
                                alt="Pursuit Logo" 
                                className="h-8 md:h-10 object-contain cursor-pointer"
                                style={{ filter: 'invert(1)' }}
                            />
                        </Link>
                        <div className="text-base md:text-lg font-semibold text-[#1E1E1E]">
                            Welcome, {user?.firstName || 'John'}!
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button 
                            onClick={handleBackToDashboard}
                            variant="outline"
                            className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
                        >
                            ← Back to Dashboard
                        </Button>
                        <Button 
                            onClick={handleLogout}
                            variant="outline"
                            className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-8 py-8">
                {/* Title */}
                <h1 className="text-5xl font-bold text-[#1E1E1E] leading-tight mb-8">
                    Select a time slot for your info session at Pursuit HQ.
                </h1>

                {/* Status Messages */}
                {registrationStatus && (
                    <Alert className={`mb-6 ${registrationStatus === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                        <AlertDescription className="flex items-center gap-2">
                            <span className="text-2xl">
                                {registrationStatus === 'success' ? '🎉' : '⚠️'}
                            </span>
                            <strong className={registrationStatus === 'success' ? 'text-green-900' : 'text-red-900'}>
                                {statusMessage}
                            </strong>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Time Slots Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="p-12 text-center">
                                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2">No Information Sessions Scheduled</h3>
                                <p className="text-[#666]">We'll add sessions as soon as they're scheduled. Check back regularly!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        events.map((event) => {
                            const isRegistered = isUserRegistered(event);
                            const isFull = (event.registered_count || 0) >= event.capacity;
                            const isPassed = isEventPassed(event);
                            const registration = getUserRegistration(event);
                            
                            const easternStartTime = getEasternTimeParts(event.start_time);
                            const easternEndTime = getEasternTimeParts(event.end_time);
                            
                            const month = format(easternStartTime, 'MMMM');
                            const day = format(easternStartTime, 'd');
                            const dayOfWeek = format(easternStartTime, 'EEEE');
                            const timeRange = `${formatInEasternTime(event.start_time, 'time')} - ${formatInEasternTime(event.end_time, 'time')}`;
                            
                            return (
                                <Card 
                                    key={event.event_id} 
                                    className={`transition-all duration-200 ${
                                        isRegistered ? 'border-2 border-green-500 shadow-lg' : 
                                        isFull && !isRegistered ? 'opacity-60' : 
                                        isPassed ? 'opacity-50' : 
                                        'hover:shadow-lg'
                                    }`}
                                >
                                    <CardContent className="p-6 space-y-4">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-6 w-6 text-[#4242EA]" />
                                                <div>
                                                    <div className="text-2xl font-bold text-[#1E1E1E]">{day}</div>
                                                    <div className="text-sm text-[#666]">{month}</div>
                                                </div>
                                            </div>
                                            {isRegistered && (
                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Reserved
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Day of Week */}
                                        <div className="text-lg font-semibold text-[#1E1E1E]">{dayOfWeek}</div>

                                        {/* Time */}
                                        <div className="flex items-center gap-2 text-[#666]">
                                            <Clock className="h-5 w-5" />
                                            <span>{timeRange}</span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-[#666]">
                                            {event.is_online ? (
                                                <>
                                                    <Laptop className="h-5 w-5" />
                                                    <span>Online</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Building className="h-5 w-5" />
                                                    <span>In-Person</span>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Actions */}
                                        {isRegistered ? (
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    onClick={() => handleCancelRegistration(event.event_id, registration?.registration_id)}
                                                    disabled={processingEventId === event.event_id}
                                                    variant="outline"
                                                    className="flex-1 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                                                >
                                                    {processingEventId === event.event_id ? 'Cancelling...' : 'Cancel'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => !isFull && !isPassed && handleSignUp(event.event_id)}
                                                disabled={processingEventId === event.event_id || isFull || isPassed}
                                                className={`w-full ${
                                                    isPassed ? 'bg-gray-400 cursor-not-allowed' :
                                                    isFull ? 'bg-gray-400 cursor-not-allowed' : 
                                                    'bg-[#4242EA] hover:bg-[#3535D1]'
                                                }`}
                                            >
                                                {isPassed ? 'Event Passed' :
                                                 isFull ? 'Full' : 
                                                 processingEventId === event.event_id ? 'Reserving...' : 'Reserve'}
                                            </Button>
                                        )}
                                        
                                        {event.is_online && event.meeting_link && isRegistered && (
                                            <a 
                                                href={event.meeting_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <Button variant="outline" className="w-full border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white">
                                                    Join Meeting
                                                </Button>
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Admin form - hidden for applicants */}
                {isAdmin && (
                    <Card className="mt-8">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Add New Info Session</h3>
                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                />
                                <input
                                    type="datetime-local"
                                    value={newEvent.start_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                />
                                <input
                                    type="datetime-local"
                                    value={newEvent.end_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                />
                                <input
                                    type="number"
                                    placeholder="Capacity"
                                    value={newEvent.capacity}
                                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.is_online}
                                        onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                                        className="h-4 w-4 text-[#4242EA] focus:ring-[#4242EA] rounded"
                                    />
                                    <span>Online Event</span>
                                </label>
                                {newEvent.is_online && (
                                    <input
                                        type="text"
                                        placeholder="Meeting Link"
                                        value={newEvent.meeting_link}
                                        onChange={(e) => setNewEvent({ ...newEvent, meeting_link: e.target.value })}
                                        className="w-full px-3 py-2 border border-[#C8C8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                                    />
                                )}
                                <Button type="submit" className="bg-[#4242EA] hover:bg-[#3535D1]">
                                    Add Session
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default InfoSessions;
