import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Unsubscribe.css';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [applicantData, setApplicantData] = useState(null);
    const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState({
        decision: '', // 'unsubscribe' or 'defer'
        reason: '',
        otherReason: ''
    });

    const applicantId = searchParams.get('id');

    useEffect(() => {
        if (applicantId) {
            fetchApplicantData();
        } else {
            setError('Invalid unsubscribe link. Missing applicant ID.');
        }
    }, [applicantId]);

    const fetchApplicantData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe-info`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    setError('Applicant not found. This unsubscribe link may be invalid.');
                } else {
                    setError('Unable to load applicant information.');
                }
                return;
            }

            const data = await response.json();
            setApplicantData(data);
            setAlreadyUnsubscribed(data.email_opt_out);
        } catch (error) {
            console.error('Error fetching applicant data:', error);
            setError('Unable to connect to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialUnsubscribe = () => {
        setShowConfirmation(true);
    };

    const handleConfirmationChange = (field, value) => {
        setConfirmationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFinalSubmit = async () => {
        // Validate required fields
        if (!confirmationData.decision) {
            await Swal.fire({
                title: 'Please Select an Option',
                text: 'Please choose whether you want to unsubscribe or defer your application.',
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        if (!confirmationData.reason) {
            await Swal.fire({
                title: 'Please Select a Reason',
                text: 'Please let us know why you\'re making this decision.',
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        if (confirmationData.reason === 'other' && !confirmationData.otherReason.trim()) {
            await Swal.fire({
                title: 'Please Provide Details',
                text: 'Please provide more details about your reason.',
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        try {
            setLoading(true);

            const requestData = {
                decision: confirmationData.decision,
                reason: confirmationData.reason,
                otherReason: confirmationData.reason === 'other' ? confirmationData.otherReason : null
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Failed to process request');
            }

            // Show success message based on decision
            const successTitle = confirmationData.decision === 'defer' 
                ? 'Application Deferred' 
                : 'Successfully Unsubscribed';
            
            const successMessage = confirmationData.decision === 'defer'
                ? 'Your application has been deferred and you will be considered for a future cohort. We\'ll reach out when the next application cycle opens.'
                : 'You have been successfully unsubscribed from automated emails for the Pursuit AI-Native Program.';

            await Swal.fire({
                title: successTitle,
                text: successMessage,
                icon: 'success',
                confirmButtonText: 'Close',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });

            setAlreadyUnsubscribed(true);
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error processing request:', error);
            await Swal.fire({
                title: 'Error',
                text: 'Unable to process your request. Please try again or contact support.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !applicantData) {
        return (
            <div className="unsubscribe-email-page">
                <div className="unsubscribe-email-page__content">
                    <div className="unsubscribe-email-page__card">
                        <div className="unsubscribe-email-page__loading-spinner">
                            <div className="unsubscribe-email-page__spinner"></div>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="unsubscribe-email-page">
                <div className="unsubscribe-email-page__content">
                    <div className="unsubscribe-email-page__card">
                        <div className="unsubscribe-email-page__error-message">
                            <h2>⚠️ Error</h2>
                            <p>{error}</p>
                            <p>If you believe this is an error, please contact our support team.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="unsubscribe-email-page">
            <div className="unsubscribe-email-page__content">
                <div className="unsubscribe-email-page__card">
                    <div className="unsubscribe-email-page__header">
                        <h1>Email Unsubscribe</h1>
                        <p className="program-title">Pursuit AI-Native Program</p>
                    </div>

                    {applicantData && (
                        <div className="unsubscribe-email-page__applicant-info">
                            <p>
                                <strong>Name:</strong> {applicantData.first_name} {applicantData.last_name}
                            </p>
                            <p>
                                <strong>Email:</strong> {applicantData.email}
                            </p>
                        </div>
                    )}

                {alreadyUnsubscribed ? (
                    <div className="unsubscribe-email-page__already-unsubscribed">
                        <div className="unsubscribe-email-page__success-icon">✅</div>
                        <h2>Already Unsubscribed</h2>
                        <p>You have already been unsubscribed from automated emails for the Pursuit AI-Native Program.</p>
                        <p>If you're still receiving emails, please contact our support team.</p>
                    </div>
                ) : !showConfirmation ? (
                    <div className="unsubscribe-email-page__content-section">
                        <h2>No Longer Interested in Applying?</h2>
                        <p>
                            If you are no longer interested in applying for the program, you can unsubscribe here.
                        </p>
                        
                        <div className="unsubscribe-email-page__content-grid">
                            <div className="unsubscribe-email-page__info-section">
                                <div className="unsubscribe-email-page__email-types">
                                    <p><strong>This will stop:</strong></p>
                                    <ul>
                                        <li>Application reminders</li>
                                        <li>Info session notifications</li>
                                        <li>Workshop invitations</li>
                                        <li>Program updates and deadlines</li>
                                    </ul>
                                </div>

                                <div className="unsubscribe-email-page__important-note">
                                    <p><strong>Important:</strong> You may still receive essential administrative emails related to your application status, acceptance, or other critical program information.</p>
                                </div>
                            </div>

                            <div className="unsubscribe-email-page__actions-section">
                                <div className="unsubscribe-email-page__actions">
                                    <button
                                        onClick={handleInitialUnsubscribe}
                                        disabled={loading}
                                        className="unsubscribe-email-page__continue-btn"
                                    >
                                        Continue
                                    </button>
                                </div>

                                <div className="unsubscribe-email-page__contact-info">
                                    <p>
                                        If you have questions or need assistance, please contact us at{' '}
                                        <a href="mailto:admissions@pursuit.org">admissions@pursuit.org</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="unsubscribe-email-page__confirmation-content">
                        <h2>Are you sure you don't want to apply?</h2>
                        <p>Please confirm your decision below. Both fields are required.</p>
                        
                        <div className="unsubscribe-email-page__confirmation-form">
                            <div className="decision-column">
                                <div className="unsubscribe-email-page__decision-options">
                                    <h3>Your Decision <span className="required-asterisk">*</span></h3>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="decision"
                                            value="unsubscribe"
                                            checked={confirmationData.decision === 'unsubscribe'}
                                            onChange={(e) => handleConfirmationChange('decision', e.target.value)}
                                        />
                                        I no longer want to apply to the program.
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="decision"
                                            value="defer"
                                            checked={confirmationData.decision === 'defer'}
                                            onChange={(e) => handleConfirmationChange('decision', e.target.value)}
                                        />
                                        I want to defer my application and be considered for a future cohort.
                                    </label>
                                </div>
                            </div>

                            <div className="reason-column">
                                <div className="unsubscribe-email-page__reason-section">
                                    <h3>Please let us know why <span className="required-asterisk">*</span></h3>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="time_commitment"
                                            checked={confirmationData.reason === 'time_commitment'}
                                            onChange={(e) => handleConfirmationChange('reason', e.target.value)}
                                        />
                                        I cannot commit to the time right now
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="emergency"
                                            checked={confirmationData.reason === 'emergency'}
                                            onChange={(e) => handleConfirmationChange('reason', e.target.value)}
                                        />
                                        I am experiencing a personal or family emergency
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="not_interested"
                                            checked={confirmationData.reason === 'not_interested'}
                                            onChange={(e) => handleConfirmationChange('reason', e.target.value)}
                                        />
                                        I am no longer interested in the program
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="other"
                                            checked={confirmationData.reason === 'other'}
                                            onChange={(e) => handleConfirmationChange('reason', e.target.value)}
                                        />
                                        Other
                                    </label>
                                    
                                    {confirmationData.reason === 'other' && (
                                        <div className="unsubscribe-email-page__other-reason">
                                            <textarea
                                                placeholder="Please provide more details..."
                                                value={confirmationData.otherReason}
                                                onChange={(e) => handleConfirmationChange('otherReason', e.target.value)}
                                                className="unsubscribe-email-page__other-reason-input"
                                                rows="3"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="unsubscribe-email-page__confirmation-actions">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                disabled={loading}
                                className="unsubscribe-email-page__back-btn"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="unsubscribe-email-page__confirm-btn"
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default Unsubscribe;
