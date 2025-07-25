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

    const { applicant, application, assessment, responses, questions } = applicationData;

    return (
        <div className="application-detail">
            {/* Header */}
            <div className="application-detail__header">
                <div className="application-detail__header-content">
                    <button 
                        onClick={() => navigate('/admissions-dashboard?tab=applications')} 
                        className="application-detail__back-btn"
                    >
                        ← Back to Applicants
                    </button>
                    <div className="application-detail__title">
                        <h1>Applicant Details</h1>
                        <span className={`status-badge status-badge--${application.status}`}>
                            {application.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="application-detail__content">
                {/* Applicant Information - Compact */}
                <div className="application-detail__section application-detail__section--compact">
                    <h2>Applicant Information</h2>
                    <div className="applicant-info applicant-info--compact">
                        <div className="applicant-info__grid applicant-info__grid--compact">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{applicant.first_name} {applicant.last_name}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{applicant.email}</span>
                            </div>
                            <div className="info-item">
                                <label>Applied:</label>
                                <span>{new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                                <button 
                                    className="notes-btn notes-btn--compact"
                                    onClick={openNotesModal}
                                >
                                    📝 Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Assessment */}
                <div className="application-detail__section">
                    <h2>Application Assessment</h2>
                    {assessment && assessment.recommendation ? (
                        <div className="assessment-details">
                            <div className="assessment-overview">
                                <div className="assessment-scores">
                                    <div className="assessment-scores-top">
                                        <div className="score-item score-item--overall">
                                            <div className="score-circle">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#06d6a0" />
                                                            <stop offset="50%" stopColor="#4ecdc4" />
                                                            <stop offset="100%" stopColor="#45b7d1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="score-circle-bg" />
                                                    <circle 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="40" 
                                                        className="score-circle-progress score-circle-progress--overall"
                                                        strokeDasharray={`${(assessment.overall_score / 100) * 251.2} 251.2`}
                                                    />
                                                </svg>
                                                <div className="score-value score-value--overall">{assessment.overall_score}</div>
                                            </div>
                                            <div className="score-label">Overall<br/>Score</div>
                                        </div>
                                        <div className="recommendation-display">
                                            <div className="recommendation-card">
                                                <div className="recommendation-label">Final Recommendation</div>
                                                <div className={`recommendation-badge recommendation-badge--${assessment.recommendation}`}>
                                                    <div className="recommendation-icon">
                                                        {assessment.recommendation === 'strong_recommend' && '✓'}
                                                        {assessment.recommendation === 'recommend' && '✓'}
                                                        {assessment.recommendation === 'review_needed' && '⚠️'}
                                                        {assessment.recommendation === 'not_recommend' && '✗'}
                                                    </div>
                                                    <div className="recommendation-text">
                                                        {assessment.recommendation.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="assessment-scores-bottom">
                                        <div className="score-item">
                                            <div className="score-circle">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="learningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#ff6b6b" />
                                                            <stop offset="50%" stopColor="#4ecdc4" />
                                                            <stop offset="100%" stopColor="#45b7d1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="score-circle-bg" />
                                                    <circle 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="40" 
                                                        className="score-circle-progress score-circle-progress--learning"
                                                        strokeDasharray={`${(assessment.learning_score / 100) * 251.2} 251.2`}
                                                    />
                                                </svg>
                                                <div className="score-value">{assessment.learning_score}</div>
                                            </div>
                                            <div className="score-label">Learning<br/>Ability</div>
                                        </div>
                                        <div className="score-item">
                                            <div className="score-circle">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="gritGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#ffd93d" />
                                                            <stop offset="50%" stopColor="#ff9a3c" />
                                                            <stop offset="100%" stopColor="#ff6b6b" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="score-circle-bg" />
                                                    <circle 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="40" 
                                                        className="score-circle-progress score-circle-progress--grit"
                                                        strokeDasharray={`${(assessment.grit_score / 100) * 251.2} 251.2`}
                                                    />
                                                </svg>
                                                <div className="score-value">{assessment.grit_score}</div>
                                            </div>
                                            <div className="score-label">Grit &<br/>Perseverance</div>
                                        </div>
                                        <div className="score-item">
                                            <div className="score-circle">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="thinkingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#a855f7" />
                                                            <stop offset="50%" stopColor="#3b82f6" />
                                                            <stop offset="100%" stopColor="#06b6d4" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="score-circle-bg" />
                                                    <circle 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="40" 
                                                        className="score-circle-progress score-circle-progress--thinking"
                                                        strokeDasharray={`${(assessment.critical_thinking_score / 100) * 251.2} 251.2`}
                                                    />
                                                </svg>
                                                <div className="score-value">{assessment.critical_thinking_score}</div>
                                            </div>
                                            <div className="score-label">Critical<br/>Thinking</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="assessment-details-expandable">
                                <details className="assessment-expandable">
                                    <summary className="assessment-expandable__summary">
                                        📋 View Detailed Analysis
                                    </summary>
                                    <div className="assessment-expandable__content">
                                        {assessment.strengths && (
                                            <div className="assessment-detail-item">
                                                <h4>Strengths</h4>
                                                <p>{assessment.strengths}</p>
                                            </div>
                                        )}
                                        {assessment.concerns && (
                                            <div className="assessment-detail-item">
                                                <h4>Concerns</h4>
                                                <p>{assessment.concerns}</p>
                                            </div>
                                        )}
                                        {assessment.areas_for_development && (
                                            <div className="assessment-detail-item">
                                                <h4>Areas for Development</h4>
                                                <p>{assessment.areas_for_development}</p>
                                            </div>
                                        )}
                                        {assessment.analysis_notes && (
                                            <div className="assessment-detail-item">
                                                <h4>Analysis Notes</h4>
                                                <p>{assessment.analysis_notes}</p>
                                            </div>
                                        )}
                                        <div className="assessment-metadata">
                                            <p className="assessment-meta">
                                                <strong>Responses Analyzed:</strong> {assessment.target_responses_found}/{assessment.total_responses} | 
                                                <strong> Analyzer Version:</strong> {assessment.analyzer_version} | 
                                                <strong> Analyzed:</strong> {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    ) : (
                        <div className="assessment-pending">
                            <p>Assessment pending - AI analysis has not been completed yet.</p>
                        </div>
                    )}
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