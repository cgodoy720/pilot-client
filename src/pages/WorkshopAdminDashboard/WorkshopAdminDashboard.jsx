import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkshopAdminDashboard.css';

const WorkshopAdminDashboard = () => {
    const [workshops, setWorkshops] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('workshops'); // 'workshops', 'participants', 'submissions'
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Fetch workshops on mount
    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshop/workshop-admin/my-workshops`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    setError('You do not have workshop admin access. Please contact your administrator.');
                    return;
                }
                throw new Error('Failed to fetch workshops');
            }

            const data = await response.json();
            setWorkshops(data.workshops || []);

        } catch (err) {
            console.error('Error fetching workshops:', err);
            setError(err.message || 'Failed to load workshops');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async (eventId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/workshop/workshop-admin/workshops/${eventId}/participants`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch participants');
            }

            const data = await response.json();
            setParticipants(data.participants || []);
            setView('participants');

        } catch (err) {
            console.error('Error fetching participants:', err);
            setError(err.message || 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (eventId, participantUserId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/workshop/workshop-admin/workshops/${eventId}/participants/${participantUserId}/submissions`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const data = await response.json();
            setSubmissions(data.submissions || []);
            setView('submissions');

        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError(err.message || 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkshopClick = (workshop) => {
        setSelectedWorkshop(workshop);
        fetchParticipants(workshop.event_id);
    };

    const handleParticipantClick = (participant) => {
        setSelectedParticipant(participant);
        fetchSubmissions(selectedWorkshop.event_id, participant.user_id);
    };

    const handleBackToWorkshops = () => {
        setView('workshops');
        setSelectedWorkshop(null);
        setParticipants([]);
        setSelectedParticipant(null);
        setSubmissions([]);
    };

    const handleBackToParticipants = () => {
        setView('participants');
        setSelectedParticipant(null);
        setSubmissions([]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        // Fix timezone issue: DB stores Eastern Time as UTC
        // We need to treat the UTC components as Eastern Time components
        const dbTime = new Date(dateString);
        const easternTime = new Date(
            dbTime.getUTCFullYear(),
            dbTime.getUTCMonth(),
            dbTime.getUTCDate(),
            dbTime.getUTCHours(),
            dbTime.getUTCMinutes(),
            dbTime.getUTCSeconds()
        );
        
        return easternTime.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const renderSubmissionContent = (submission) => {
        try {
            const content = typeof submission.content === 'string' 
                ? JSON.parse(submission.content) 
                : submission.content;

            if (typeof content === 'object' && content !== null) {
                return (
                    <div className="submission-fields">
                        {Object.entries(content).map(([key, value]) => (
                            <div key={key} className="submission-field">
                                <strong>{key.replace(/_/g, ' ')}:</strong>
                                <p>{value}</p>
                            </div>
                        ))}
                    </div>
                );
            }

            return <p className="submission-text">{content}</p>;
        } catch (e) {
            return <p className="submission-text">{submission.content}</p>;
        }
    };

    if (loading && workshops.length === 0) {
        return (
            <div className="workshop-admin-dashboard">
                <div className="loading">Loading workshops...</div>
            </div>
        );
    }

    return (
        <div className="workshop-admin-dashboard">
            <div className="dashboard-header">
                {view !== 'workshops' && (
                    <div className="breadcrumb">
                        <button onClick={handleBackToWorkshops} className="breadcrumb-link">
                            Workshops
                        </button>
                        {view !== 'workshops' && selectedWorkshop && (
                            <>
                                <span className="breadcrumb-separator">/</span>
                                {view === 'submissions' ? (
                                    <button onClick={handleBackToParticipants} className="breadcrumb-link">
                                        {selectedWorkshop.name}
                                    </button>
                                ) : (
                                    <span className="breadcrumb-current">{selectedWorkshop.name}</span>
                                )}
                            </>
                        )}
                        {view === 'submissions' && selectedParticipant && (
                            <>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">
                                    {selectedParticipant.first_name} {selectedParticipant.last_name}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Workshops View */}
            {view === 'workshops' && (
                <div className="workshops-container">
                    {workshops.length === 0 ? (
                        <div className="empty-state">
                            <h3>No Workshops Assigned</h3>
                            <p>You don't have any workshops assigned yet. Please contact your administrator.</p>
                        </div>
                    ) : (
                        <>
                            <div className="workshops-summary">
                                <div className="summary-card">
                                    <h3>{workshops.length}</h3>
                                    <p>Total Workshops</p>
                                </div>
                                <div className="summary-card">
                                    <h3>
                                        {workshops.reduce((sum, w) => sum + (parseInt(w.total_participants) || 0), 0)}
                                    </h3>
                                    <p>Total Participants</p>
                                </div>
                                <div className="summary-card">
                                    <h3>
                                        {workshops.filter(w => new Date(w.start_time) > new Date()).length}
                                    </h3>
                                    <p>Upcoming</p>
                                </div>
                            </div>

                            <div className="workshops-grid">
                                {workshops.map(workshop => (
                                    <div 
                                        key={workshop.event_id} 
                                        className="workshop-card"
                                        onClick={() => handleWorkshopClick(workshop)}
                                    >
                                        <div className="workshop-card-header">
                                            <h3>{workshop.name || workshop.title}</h3>
                                            <span className={`status-badge status-${workshop.status}`}>
                                                {workshop.status}
                                            </span>
                                        </div>
                                        <div className="workshop-card-body">
                                            <p className="workshop-date">
                                                📅 {formatDate(workshop.start_time)}
                                            </p>
                                            {workshop.location && (
                                                <p className="workshop-location">
                                                    📍 {workshop.location}
                                                </p>
                                            )}
                                            {workshop.organization_name && (
                                                <p className="workshop-org">
                                                    🏢 {workshop.organization_name}
                                                </p>
                                            )}
                                            <div className="workshop-stats">
                                                <span>👥 {workshop.total_participants || 0} participants</span>
                                                <span>✅ {workshop.attended_count || 0} attended</span>
                                                <span>🎯 {workshop.completed_count || 0} completed</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Participants View */}
            {view === 'participants' && selectedWorkshop && (
                <div className="participants-container">
                    <div className="participants-header">
                        <h2>{selectedWorkshop.name || selectedWorkshop.title}</h2>
                        <p className="subtitle">
                            {formatDate(selectedWorkshop.start_time)}
                        </p>
                    </div>

                    {participants.length === 0 ? (
                        <div className="empty-state">
                            <p>No participants registered yet</p>
                        </div>
                    ) : (
                        <div className="participants-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Attended</th>
                                        <th>Deliverables</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map(participant => (
                                        <tr key={participant.registration_id}>
                                            <td>
                                                {participant.first_name} {participant.last_name}
                                            </td>
                                            <td>{participant.email}</td>
                                            <td>
                                                {participant.attended ? (
                                                    <span className="badge badge-success">✓ Yes</span>
                                                ) : (
                                                    <span className="badge badge-secondary">No</span>
                                                )}
                                            </td>
                                            <td>{participant.deliverables_submitted || 0}</td>
                                            <td>
                                                {participant.user_id && (
                                                    <button
                                                        onClick={() => handleParticipantClick(participant)}
                                                        className="btn-view-submissions"
                                                        disabled={!participant.deliverables_submitted || participant.deliverables_submitted === '0'}
                                                    >
                                                        View Submissions
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Submissions View */}
            {view === 'submissions' && selectedParticipant && (
                <div className="submissions-container">
                    <div className="submissions-header">
                        <h2>
                            Submissions by {selectedParticipant.first_name} {selectedParticipant.last_name}
                        </h2>
                        <p className="subtitle">{selectedParticipant.email}</p>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="empty-state">
                            <p>No submissions yet</p>
                        </div>
                    ) : (
                        <div className="submissions-list">
                            {submissions.map(submission => (
                                <div key={submission.submission_id} className="submission-card">
                                    <div className="submission-header">
                                        <h3>{submission.task_title}</h3>
                                        <span className="submission-date">
                                            {formatDate(submission.created_at)}
                                        </span>
                                    </div>
                                    {submission.task_description && (
                                        <p className="submission-description">
                                            {submission.task_description}
                                        </p>
                                    )}
                                    <div className="submission-content">
                                        {renderSubmissionContent(submission)}
                                    </div>
                                    {submission.deliverable_type && (
                                        <div className="submission-meta">
                                            <span className="type-badge">
                                                {submission.deliverable_type}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkshopAdminDashboard;

