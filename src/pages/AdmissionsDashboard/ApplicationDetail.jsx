import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import './ApplicationDetail.css';

// Utility functions for formatting response values
const formatResponseValue = (value, questionType) => {
    if (!value) return <span className="no-response">No response provided</span>;

    // Try to detect if the value is an array (JSON string)
    try {
        const parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) {
            return (
                <ul className="response-list">
                    {parsedValue.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        }
    } catch (e) {
        // Not a valid JSON, continue with other formatting
    }

    // Check for date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        } catch (e) {
            // Not a valid date, continue with other formatting
        }
    }

    // Check for phone number format
    if (/^\d{10}$/.test(value.replace(/\D/g, ''))) {
        const cleaned = value.replace(/\D/g, '');
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }

    // Check for dollar amount
    if (/^\$?\d+(\.\d{2})?$/.test(value.replace(/,/g, ''))) {
        const amount = parseFloat(value.replace(/[$,]/g, ''));
        if (!isNaN(amount)) {
            return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
    }

    // Check if it's a number that should be formatted
    if (/^\d+(\.\d+)?$/.test(value) && questionType?.toLowerCase().includes('income')) {
        const number = parseFloat(value);
        if (!isNaN(number)) {
            return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        }
    }

    // Default: return as is
    return value;
};

const ApplicationDetail = () => {
    const { applicationId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applicationData, setApplicationData] = useState(null);

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(false);

    // Fetch application details
    const fetchApplicationDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/application/${applicationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch application details');
            }

            const data = await response.json();
            setApplicationData(data);
        } catch (error) {
            console.error('Error fetching application details:', error);
            setError('Failed to load application details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicationId && token) {
            fetchApplicationDetail();
        }
    }, [applicationId, token]);

    // Handle notes modal
    const openNotesModal = () => {
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="application-detail">
                <div className="application-detail__loading">
                    <div className="application-detail__loading-spinner"></div>
                    <p>Loading application details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="application-detail">
                <div className="application-detail__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchApplicationDetail} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!applicationData) {
        return (
            <div className="application-detail">
                <div className="application-detail__no-data">
                    <h2>Application Not Found</h2>
                    <p>The requested application could not be found.</p>
                    <button onClick={() => navigate('/admissions-dashboard')} className="back-btn">
                        Back to Admissions
                    </button>
                </div>
            </div>
        );
    }

    const { applicant, application, responses, questions } = applicationData;

    return (
        <div className="application-detail">
            {/* Header */}
            <div className="application-detail__header">
                <div className="application-detail__header-content">
                    <button 
                        onClick={() => navigate('/admissions-dashboard?tab=applications')} 
                        className="application-detail__back-btn"
                    >
                        ← Back to Admissions
                    </button>
                    <div className="application-detail__title">
                        <h1>Application Details</h1>
                        <span className={`status-badge status-badge--${application.status}`}>
                            {application.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="application-detail__content">
                {/* Applicant Information */}
                <div className="application-detail__section">
                    <h2>Applicant Information</h2>
                    <div className="applicant-info">
                        <div className="applicant-info__grid">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{applicant.first_name} {applicant.last_name}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{applicant.email}</span>
                            </div>
                            <div className="info-item">
                                <label>Notes:</label>
                                <button 
                                    className="notes-btn notes-btn--primary"
                                    onClick={openNotesModal}
                                >
                                    📝 View Notes
                                </button>
                            </div>
                            <div className="info-item date-info">
                                <label>Applied Date:</label>
                                <span>{new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                            {application.submitted_at && (
                                <div className="info-item date-info">
                                    <label>Submitted Date:</label>
                                    <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                                </div>
                            )}
                            {application.updated_at && (
                                <div className="info-item date-info">
                                    <label>Last Updated:</label>
                                    <span>{new Date(application.updated_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Application Responses */}
                <div className="application-detail__section">
                    <h2>Application Responses</h2>
                    {responses && responses.length > 0 ? (
                        <div className="responses-list">
                            {responses.map((response, index) => {
                                const question = questions?.find(q => q.question_id === response.question_id);
                                return (
                                    <div key={response.question_id || index} className="response-item">
                                        <div className="response-item__question">
                                            <h3>{question?.prompt || `Question ${response.question_id}`}</h3>
                                        </div>
                                        <div className="response-item__answer">
                                            {response.response_value ? (
                                                <p>{formatResponseValue(response.response_value, question?.response_type)}</p>
                                            ) : (
                                                <p className="no-response">No response provided</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-responses">
                            <p>No responses found for this application.</p>
                        </div>
                    )}
                </div>

                {/* Application Statistics */}
                <div className="application-detail__section">
                    <h2>Application Statistics</h2>
                    <div className="application-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Questions:</span>
                            <span className="stat-value">{questions?.length || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Responses Provided:</span>
                            <span className="stat-value">{responses?.length || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Completion Rate:</span>
                            <span className="stat-value">
                                {questions?.length > 0 
                                    ? Math.round(((responses?.length || 0) / questions.length) * 100)
                                    : 0
                                }%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                applicantId={applicant?.applicant_id}
                applicantName={`${applicant?.first_name} ${applicant?.last_name}`}
            />
        </div>
    );
};

export default ApplicationDetail; 