import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminVolunteerFeedback.css';

function AdminVolunteerFeedback() {
    const { user, token } = useAuth();
    const [feedback, setFeedback] = useState([]);
    const [filteredFeedback, setFilteredFeedback] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter state
    const [selectedEventType, setSelectedEventType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [volunteerName, setVolunteerName] = useState('');

    // Available event types
    const eventTypes = ['AI Native Class', 'Demo Day', 'Networking Event', 'Panel', 'Mock Interview'];

    const applyFilters = () => {
        let filtered = [...feedback];

        // Filter by event type
        if (selectedEventType) {
            filtered = filtered.filter(item => item.feedback_type === selectedEventType);
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter(item => new Date(item.feedback_date) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(item => new Date(item.feedback_date) <= new Date(endDate));
        }

        // Filter by volunteer name (search in first name, last name, or email)
        if (volunteerName) {
            const searchTerm = volunteerName.toLowerCase();
            filtered = filtered.filter(item => 
                item.first_name.toLowerCase().includes(searchTerm) ||
                item.last_name.toLowerCase().includes(searchTerm) ||
                item.email.toLowerCase().includes(searchTerm) ||
                `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredFeedback(filtered);
    };

    useEffect(() => {
        if (user && token) {
            fetchAllFeedback();
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    // Apply filters when feedback or filter values change
    useEffect(() => {
        applyFilters();
    }, [feedback, selectedEventType, startDate, endDate, volunteerName]);

    const fetchAllFeedback = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data.feedback || []);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch feedback (${response.status})`);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setError('Failed to load feedback. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedEventType('');
        setStartDate('');
        setEndDate('');
        setVolunteerName('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if user is admin or staff
    if (user?.role !== 'admin' && user?.role !== 'staff') {
        return (
            <div className="admin-volunteer-feedback">
                <div className="admin-volunteer-feedback__error">
                    <h2>Access Denied</h2>
                    <p>This page is only available to administrators and staff.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-volunteer-feedback">
            <div className="admin-volunteer-feedback__header">
                <h1>Volunteer Feedback Administration</h1>
                <p>View and manage feedback from all volunteers across events.</p>
            </div>

            {/* Filters Section */}
            <div className="admin-volunteer-feedback__filters">
                <h2>Filters</h2>
                <div className="admin-volunteer-feedback__filter-row">
                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="event-type">Event Type:</label>
                        <select
                            id="event-type"
                            value={selectedEventType}
                            onChange={(e) => setSelectedEventType(e.target.value)}
                            className="admin-volunteer-feedback__select"
                        >
                            <option value="">All Event Types</option>
                            {eventTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="start-date">Start Date:</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="admin-volunteer-feedback__input"
                            placeholder="Select start date"
                        />
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="end-date">End Date:</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="admin-volunteer-feedback__input"
                            placeholder="Select end date"
                        />
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="volunteer-name">Volunteer Name:</label>
                        <input
                            type="text"
                            id="volunteer-name"
                            value={volunteerName}
                            onChange={(e) => setVolunteerName(e.target.value)}
                            className="admin-volunteer-feedback__input"
                            placeholder="Search by name or email..."
                        />
                    </div>

                    <button
                        onClick={clearFilters}
                        className="admin-volunteer-feedback__clear-btn"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div className="admin-volunteer-feedback__summary">
                <p>
                    Showing {filteredFeedback.length} of {feedback.length} feedback entries
                </p>
            </div>

            {/* Feedback Content */}
            <div className="admin-volunteer-feedback__content">
                {isLoading ? (
                    <div className="admin-volunteer-feedback__loading">
                        Loading volunteer feedback...
                    </div>
                ) : error ? (
                    <div className="admin-volunteer-feedback__error">
                        {error}
                    </div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="admin-volunteer-feedback__empty">
                        {feedback.length === 0 ? (
                            <p>No volunteer feedback has been submitted yet.</p>
                        ) : (
                            <p>No feedback matches the current filters. Try adjusting your search criteria.</p>
                        )}
                    </div>
                ) : (
                    <div className="admin-volunteer-feedback__list">
                        {filteredFeedback.map((item) => (
                            <div key={item.feedback_id} className="admin-volunteer-feedback__item">
                                <div className="admin-volunteer-feedback__item-header">
                                    <div className="admin-volunteer-feedback__volunteer-info">
                                        <h3>{item.first_name} {item.last_name}</h3>
                                        <span className="admin-volunteer-feedback__email">{item.email}</span>
                                    </div>
                                    <div className="admin-volunteer-feedback__event-info">
                                        <span className="admin-volunteer-feedback__event-type">
                                            {item.feedback_type}
                                        </span>
                                        <span className="admin-volunteer-feedback__date">
                                            {formatDate(item.feedback_date)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="admin-volunteer-feedback__content-section">
                                    {item.overall_experience && (
                                        <div className="admin-volunteer-feedback__question">
                                            <h4>How was your experience overall?</h4>
                                            <p>{item.overall_experience}</p>
                                        </div>
                                    )}
                                    
                                    {item.improvement_suggestions && (
                                        <div className="admin-volunteer-feedback__question">
                                            <h4>How could we improve going forward?</h4>
                                            <p>{item.improvement_suggestions}</p>
                                        </div>
                                    )}
                                    
                                    {item.specific_feedback && (
                                        <div className="admin-volunteer-feedback__question">
                                            <h4>Do you have feedback to share on specific Builders or Fellows?</h4>
                                            <p>{item.specific_feedback}</p>
                                        </div>
                                    )}
                                    
                                    {item.audio_recording_url && (
                                        <div className="admin-volunteer-feedback__audio">
                                            <h4>Audio Recording:</h4>
                                            <audio controls>
                                                <source src={item.audio_recording_url} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="admin-volunteer-feedback__metadata">
                                    <small>
                                        Submitted: {formatDate(item.created_at)}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminVolunteerFeedback;
