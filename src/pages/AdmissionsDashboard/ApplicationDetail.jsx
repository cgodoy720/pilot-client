import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import BulkActionsModal from '../../components/BulkActionsModal';
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

    // Actions modal management
    const [actionsModalOpen, setActionsModalOpen] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);

    // Collapsible sections state - all collapsed by default
    const [expandedSections, setExpandedSections] = useState({});

    // Toggle section expansion
    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

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

    // Handle actions modal
    const openActionsModal = () => {
        setActionsModalOpen(true);
    };

    const closeActionsModal = () => {
        setActionsModalOpen(false);
    };

    // Handle single applicant action
    const handleApplicantAction = async (action, customSubject = '', customBody = '') => {
        if (!applicant?.applicant_id) return;

        setActionInProgress(true);
        try {
            const requestBody = {
                action,
                applicant_ids: [applicant.applicant_id]
            };

            if (action === 'send_custom_email') {
                requestBody.custom_subject = customSubject;
                requestBody.custom_body = customBody;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/bulk-actions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Action completed:', result);
                
                // Refresh application data
                await fetchApplicationDetail();
                
                // Close modal
                setActionsModalOpen(false);
                
                // Show success message (you could add a toast notification here)
                console.log('Action completed successfully');
            } else {
                const errorData = await response.json();
                console.error('Action failed:', errorData);
                // You could show an error message here
            }
        } catch (error) {
            console.error('Error performing action:', error);
            // You could show an error message here
        } finally {
            setActionInProgress(false);
        }
    };

    // Create shorthand labels for common questions
    const getShorthandLabel = (prompt, questionId) => {
        if (!prompt) return 'Unknown Question';

        // Special handling for key analysis questions
        const keyQuestionLabels = {
            1046: 'Education & Work History',
            1052: 'AI Perspectives & Career Impact',
            1053: 'Personal Background Story',
            1055: 'AI Learning Questions Used',
            1056: 'Neural Network Definition',
            1057: 'Neural Network Structure & Function',
            1059: 'Most Intriguing Neural Network Aspect',
            1061: 'Learning About Intriguing Aspect',
            1062: 'AI Tools Learning Process Impact'
        };

        if (questionId && keyQuestionLabels[questionId]) {
            return keyQuestionLabels[questionId];
        }

        const lowercasePrompt = prompt.toLowerCase();

        // Common question mappings
        if (lowercasePrompt.includes('first name')) return 'First Name';
        if (lowercasePrompt.includes('last name')) return 'Last Name';
        if (lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('birthday')) return 'Date of Birth';
        if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('personal income')) return 'Personal Annual Income';
        if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('household income')) return 'Household Annual Income';
        if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('income') && !lowercasePrompt.includes('personal') && !lowercasePrompt.includes('household')) return 'Annual Income';
        if (lowercasePrompt.includes('home address') || lowercasePrompt.includes('street address')) return 'Address';
        if (lowercasePrompt.includes('phone') || lowercasePrompt.includes('mobile')) return 'Phone';
        if (lowercasePrompt.includes('email')) return 'Email';
        if (lowercasePrompt.includes('gender')) return 'Gender';
        if (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity')) return 'Race/Ethnicity';
        if (lowercasePrompt.includes('education') && lowercasePrompt.includes('level')) return 'Education Level';
        if (lowercasePrompt.includes('work') && lowercasePrompt.includes('experience')) return 'Work Experience';
        if (lowercasePrompt.includes('why') && lowercasePrompt.includes('pursuit')) return 'Why Pursuit?';
        if (lowercasePrompt.includes('programming') && lowercasePrompt.includes('experience')) return 'Programming Experience';
        if (lowercasePrompt.includes('obstacle') || lowercasePrompt.includes('challenge')) return 'Challenges/Obstacles';
        if (lowercasePrompt.includes('goal') || lowercasePrompt.includes('career')) return 'Career Goals';
        if (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact')) return 'Reference Contact';
        if (lowercasePrompt.includes('privacy') && lowercasePrompt.includes('policy')) return 'Privacy Policy Agreement';
        if (lowercasePrompt.includes('citizen') || lowercasePrompt.includes('authorized')) return 'Work Authorization';
        if (lowercasePrompt.includes('conviction') || lowercasePrompt.includes('criminal')) return 'Criminal Background';

        // If no match found, try to create a shortened version
        if (prompt.length > 50) {
            return prompt.substring(0, 47) + '...';
        }

        return prompt;
    };

    // Helper function to convert arrays or semicolon-separated text to bullet points
    const formatBulletPoints = (data) => {
        if (!data) return null;

        let points = [];

        // Check if data is already an array
        if (Array.isArray(data)) {
            points = data.filter(item => item && item.trim());
        } else if (typeof data === 'string') {
            // Try to parse as JSON first (in case it's a JSON string)
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    points = parsed.filter(item => item && item.trim());
                } else {
                    // Fall back to semicolon-separated splitting
                    points = data.split(';').map(item => item.trim()).filter(item => item);
                }
            } catch (e) {
                // Not valid JSON, split by semicolons
                points = data.split(';').map(item => item.trim()).filter(item => item);
            }
        }

        if (points.length === 0) return null;

        // Return as bullet point list
        return (
            <ul className="bullet-list">
                {points.map((point, index) => (
                    <li key={index}>{point}</li>
                ))}
            </ul>
        );
    };

    // Create logical groupings based on question content instead of database sections
    const getQuestionCategory = (prompt) => {
        if (!prompt) return 'Other';

        const lowercasePrompt = prompt.toLowerCase();

        // Personal/Basic Information
        if (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') ||
            lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('email') ||
            lowercasePrompt.includes('phone') || lowercasePrompt.includes('address') ||
            lowercasePrompt.includes('gender')) {
            return 'Personal Information';
        }

        // Background & Demographics
        if (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity') ||
            lowercasePrompt.includes('education') || lowercasePrompt.includes('income') ||
            lowercasePrompt.includes('citizen') || lowercasePrompt.includes('authorized')) {
            return 'Background & Demographics';
        }

        // Experience & Work
        if (lowercasePrompt.includes('work') || lowercasePrompt.includes('job') ||
            lowercasePrompt.includes('experience') || lowercasePrompt.includes('programming') ||
            lowercasePrompt.includes('technical')) {
            return 'Experience & Background';
        }

        // Program Interest & Motivation - now grouped into Other
        // if (lowercasePrompt.includes('why') || lowercasePrompt.includes('pursuit') ||
        //     lowercasePrompt.includes('goal') || lowercasePrompt.includes('career') ||
        //     lowercasePrompt.includes('motivation') || lowercasePrompt.includes('interest')) {
        //     return 'Program Interest';
        // }

        // Challenges & Personal - now grouped into Other
        // if (lowercasePrompt.includes('obstacle') || lowercasePrompt.includes('challenge') ||
        //     lowercasePrompt.includes('overcome') || lowercasePrompt.includes('difficult')) {
        //     return 'Personal Story';
        // }

        // References & Additional
        if (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact') ||
            lowercasePrompt.includes('privacy') || lowercasePrompt.includes('conviction') ||
            lowercasePrompt.includes('criminal')) {
            return 'Additional Information';
        }

        return 'Other';
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
                {/* Condensed Header with Applicant Info and Assessment */}
                <div className="application-detail__section application-detail__section--condensed">
                    <div className="application-detail__condensed-header">
                        <div className="application-detail__condensed-header-left">
                            <div className="application-detail__applicant-name-section">
                                <h1 className="application-detail__applicant-name">
                                    {applicant.first_name} {applicant.last_name}
                                    {assessment?.has_masters_degree && (
                                        <span className="application-detail__masters-flag" title="Has Masters Degree">🎓</span>
                                    )}
                                </h1>
                                <div className="application-detail__applicant-details">
                                    <span className="application-detail__applicant-email">{applicant.email}</span>
                                    <span className="application-detail__applicant-applied">
                                        APPLIED: {new Date(application.created_at).toLocaleDateString('en-US', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="application-detail__action-buttons">
                                <button
                                    className="application-detail__notes-btn application-detail__notes-btn--header"
                                    onClick={openNotesModal}
                                >
                                    📝 Notes
                                </button>
                                <button
                                    className="application-detail__actions-btn"
                                    onClick={openActionsModal}
                                >
                                    ⚡ Actions
                                </button>
                            </div>
                        </div>

                        <div className="application-detail__condensed-header-right">
                            {assessment && assessment.recommendation ? (
                                <>
                                    <div className="application-detail__recommendation-badge-condensed">
                                        <div className={`application-detail__recommendation-status application-detail__recommendation-status--${assessment.recommendation}`}>
                                            <div className="application-detail__recommendation-icon">
                                                {assessment.recommendation === 'strong_recommend' && '✓'}
                                                {assessment.recommendation === 'recommend' && '✓'}
                                                {assessment.recommendation === 'review_needed' && '⚠️'}
                                                {assessment.recommendation === 'not_recommend' && '✗'}
                                            </div>
                                            <span>{assessment.recommendation.replace('_', ' ')}</span>
                                        </div>
                                    </div>

                                    <div className="application-detail__assessment-scores-condensed">
                                        <div className="application-detail__score-item-condensed application-detail__score-item-condensed--overall">
                                            <div className="application-detail__score-circle-condensed">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#06d6a0" />
                                                            <stop offset="50%" stopColor="#4ecdc4" />
                                                            <stop offset="100%" stopColor="#45b7d1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        className="application-detail__score-circle-progress application-detail__score-circle-progress--overall"
                                                        strokeDasharray={`${(assessment.overall_score / 100) * 251.2} 251.2`}
                                                    />
                                                </svg>
                                                <div className="application-detail__score-value-condensed">{assessment.overall_score}</div>
                                            </div>
                                            <div className="application-detail__score-label-condensed">Overall<br />Score</div>
                                        </div>

                                        <div className="application-detail__score-arrow">→</div>

                                        <div className="application-detail__detailed-scores">
                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="learningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ff6b6b" />
                                                                <stop offset="50%" stopColor="#4ecdc4" />
                                                                <stop offset="100%" stopColor="#45b7d1" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            className="application-detail__score-circle-progress application-detail__score-circle-progress--learning"
                                                            strokeDasharray={`${(assessment.learning_score / 100) * 251.2} 251.2`}
                                                        />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.learning_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Learning<br />Ability</div>
                                            </div>

                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="gritGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ffd93d" />
                                                                <stop offset="50%" stopColor="#ff9a3c" />
                                                                <stop offset="100%" stopColor="#ff6b6b" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            className="application-detail__score-circle-progress application-detail__score-circle-progress--grit"
                                                            strokeDasharray={`${(assessment.grit_score / 100) * 251.2} 251.2`}
                                                        />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.grit_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Grit &<br />Perseverance</div>
                                            </div>

                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="thinkingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#a855f7" />
                                                                <stop offset="50%" stopColor="#3b82f6" />
                                                                <stop offset="100%" stopColor="#06b6d4" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            className="application-detail__score-circle-progress application-detail__score-circle-progress--thinking"
                                                            strokeDasharray={`${(assessment.critical_thinking_score / 100) * 251.2} 251.2`}
                                                        />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.critical_thinking_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Critical<br />Thinking</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="application-detail__assessment-pending-condensed">
                                    <div className="application-detail__pending-badge">Assessment Pending</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assessment Flags */}
                    {assessment && (
                        <div className="application-detail__assessment-flags-condensed">
                            {(() => {
                                const flags = [];

                                // Missing questions flag
                                if (assessment.missing_count > 0) {
                                    flags.push(
                                        <div key="missing" className="application-detail__assessment-flag application-detail__assessment-flag--warning">
                                            <span className="application-detail__flag-icon">⚠️</span>
                                            <span className="application-detail__flag-text">{assessment.missing_count} key question{assessment.missing_count > 1 ? 's' : ''} incomplete</span>
                                        </div>
                                    );
                                }

                                // Creation sharing link flag
                                const creationQuestion = responses?.find(r => {
                                    const question = questions?.find(q => q.question_id === r.question_id);
                                    return question?.prompt?.toLowerCase().includes('created') &&
                                        question?.prompt?.toLowerCase().includes('share') &&
                                        question?.prompt?.toLowerCase().includes('link');
                                });

                                if (creationQuestion?.response_value && creationQuestion.response_value.trim()) {
                                    const isUrl = /^https?:\/\//.test(creationQuestion.response_value.trim());
                                    flags.push(
                                        <div key="creation" className="application-detail__assessment-flag application-detail__assessment-flag--info">
                                            <span className="application-detail__flag-icon">🔗</span>
                                            <span className="application-detail__flag-text">
                                                Shared creation: {isUrl ? (
                                                    <a
                                                        href={creationQuestion.response_value.trim()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="application-detail__creation-link"
                                                    >
                                                        {creationQuestion.response_value.trim()}
                                                    </a>
                                                ) : (
                                                    <span className="application-detail__creation-text">{creationQuestion.response_value.trim()}</span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                }

                                return flags.length > 0 ? flags : null;
                            })()}
                        </div>
                    )}

                    {/* Detailed Analysis - Expandable */}
                    {assessment && assessment.recommendation && (
                        <div className="application-detail__detailed-analysis">
                            <details className="assessment-expandable">
                                <summary className="assessment-expandable__summary">
                                    📋 View Detailed Analysis
                                </summary>
                                <div className="assessment-expandable__content">
                                    {assessment.strengths && (
                                        <div className="assessment-detail-item">
                                            <h4>Strengths</h4>
                                            {formatBulletPoints(assessment.strengths)}
                                        </div>
                                    )}

                                    {assessment.concerns && (
                                        <div className="assessment-detail-item">
                                            <h4>Areas of Concern</h4>
                                            {formatBulletPoints(assessment.concerns)}
                                        </div>
                                    )}

                                    {assessment.weaknesses && (
                                        <div className="assessment-detail-item">
                                            <h4>Weaknesses</h4>
                                            {formatBulletPoints(assessment.weaknesses)}
                                        </div>
                                    )}

                                    {assessment.areas_for_development && (
                                        <div className="assessment-detail-item">
                                            <h4>Areas for Development</h4>
                                            {formatBulletPoints(assessment.areas_for_development)}
                                        </div>
                                    )}

                                    {assessment.analysis_notes && (
                                        <div className="assessment-detail-item">
                                            <h4>Analysis Notes</h4>
                                            <p>{assessment.analysis_notes}</p>
                                        </div>
                                    )}

                                    {assessment.recommendation_reason && (
                                        <div className="assessment-detail-item">
                                            <h4>Recommendation Reasoning</h4>
                                            <p>{assessment.recommendation_reason}</p>
                                        </div>
                                    )}

                                    <div className="assessment-metadata">
                                        <p className="assessment-meta">
                                            Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </details>
                        </div>
                    )}
                </div>



                {/* Application Responses */}
                <div className="application-detail__section">
                    <h2>Application Responses</h2>
                    {responses && responses.length > 0 ? (
                        <div className="responses-by-section">
                            {(() => {
                                // Define the 9 key analysis questions in order
                                const keyAnalysisQuestions = [
                                    1046, // "Please explain your education and work history in more detail."
                                    1052, // "Share your thoughts and perspectives on AI..."
                                    1053, // "Some applicants have a background, identity, interest, or talent..."
                                    1055, // "List all of the questions you used to ask the AI to learn."
                                    1056, // "Explain, in your own words, what a neural network is."
                                    1057, // "What is the basic structure and function of a neural network?"
                                    1059, // "What aspect of neural networks did you find most intriguing..."
                                    1061, // "What did you learn about this new aspect you listed above? (optional)"
                                    1062  // "How did using AI tools to learn about a new topic influence your learning process?"
                                ];

                                // Separate key analysis questions from other responses
                                const keyResponses = [];
                                const otherResponses = [];

                                responses.forEach(response => {
                                    const question = questions?.find(q => q.question_id === response.question_id);
                                    if (question) {
                                        const responseData = {
                                            response,
                                            question,
                                            shortLabel: getShorthandLabel(question.prompt, question.question_id)
                                        };

                                        if (keyAnalysisQuestions.includes(question.question_id)) {
                                            keyResponses.push(responseData);
                                        } else {
                                            otherResponses.push(responseData);
                                        }
                                    }
                                });

                                // Sort key responses by the defined order
                                keyResponses.sort((a, b) => {
                                    const indexA = keyAnalysisQuestions.indexOf(a.question.question_id);
                                    const indexB = keyAnalysisQuestions.indexOf(b.question.question_id);
                                    return indexA - indexB;
                                });

                                // Group other responses by logical categories
                                const responsesByCategory = {};
                                const categoryOrder = [
                                    'Personal Information',
                                    'Background & Demographics',
                                    'Experience & Background',
                                    'Additional Information',
                                    'Other'
                                ];

                                otherResponses.forEach(responseData => {
                                    const category = getQuestionCategory(responseData.question.prompt);
                                    if (!responsesByCategory[category]) {
                                        responsesByCategory[category] = [];
                                    }
                                    responsesByCategory[category].push(responseData);
                                });

                                const sections = [];

                                // First section: Key Analysis Questions
                                if (keyResponses.length > 0) {
                                    const sectionKey = 'key-analysis';
                                    const isExpanded = expandedSections[sectionKey];

                                    sections.push(
                                        <div key="key-analysis" className="response-section">
                                            <h3
                                                className="response-section__title response-section__title--collapsible"
                                                onClick={() => toggleSection(sectionKey)}
                                            >
                                                <span className="section-toggle-arrow">
                                                    {isExpanded ? '▼' : '▶'}
                                                </span>
                                                Key Analysis Questions
                                                <span className="section-count">({keyResponses.length})</span>
                                            </h3>
                                            {isExpanded && (
                                                <div className="responses-list responses-list--compact">
                                                    {keyResponses.map(({ response, question, shortLabel }, index) => (
                                                        <div key={response.question_id || index} className="response-item response-item--compact">
                                                            <div className="response-item__question">
                                                                <h4>
                                                                    <span className="question-number">Q{keyAnalysisQuestions.indexOf(question.question_id) + 1}</span>
                                                                    {shortLabel}
                                                                </h4>
                                                                <div className="response-item__full-question">
                                                                    {question.prompt}
                                                                </div>
                                                            </div>
                                                            <div className="response-item__answer">
                                                                {response.response_value ? (
                                                                    <p>{formatResponseValue(response.response_value, question?.response_type)}</p>
                                                                ) : (
                                                                    <p className="no-response">No response provided</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Then add other sections in logical order
                                categoryOrder
                                    .filter(category => responsesByCategory[category]?.length > 0)
                                    .forEach(category => {
                                        const sectionKey = category.toLowerCase().replace(/\s+/g, '-');
                                        const isExpanded = expandedSections[sectionKey];

                                        sections.push(
                                            <div key={category} className="response-section">
                                                <h3
                                                    className="response-section__title response-section__title--collapsible"
                                                    onClick={() => toggleSection(sectionKey)}
                                                >
                                                    <span className="section-toggle-arrow">
                                                        {isExpanded ? '▼' : '▶'}
                                                    </span>
                                                    {category}
                                                    <span className="section-count">({responsesByCategory[category].length})</span>
                                                </h3>
                                                {isExpanded && (
                                                    <div className="responses-list responses-list--compact">
                                                        {responsesByCategory[category].map(({ response, question, shortLabel }, index) => (
                                                            <div key={response.question_id || index} className="response-item response-item--compact">
                                                                <div className="response-item__question">
                                                                    <h4>{shortLabel}</h4>
                                                                </div>
                                                                <div className="response-item__answer">
                                                                    {response.response_value ? (
                                                                        <p>{formatResponseValue(response.response_value, question?.response_type)}</p>
                                                                    ) : (
                                                                        <p className="no-response">No response provided</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });

                                return sections;
                            })()}
                        </div>
                    ) : (
                        <div className="no-responses">
                            <p>No responses found for this application.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Actions Modal */}
            {actionsModalOpen && (
                <BulkActionsModal
                    selectedCount={1}
                    onClose={closeActionsModal}
                    onAction={handleApplicantAction}
                    isLoading={actionInProgress}
                />
            )}

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