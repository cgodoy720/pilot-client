// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaClipboardList, FaExclamationCircle, FaCheckCircle, FaEye, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './BuilderFeedbackForm.css';

const BuilderFeedbackForm = ({ taskId, dayNumber, cohort, onComplete, onCancel }) => {
  const { token, user } = useAuth();
  const isActive = user?.active !== false;

  // Form state
  const [formData, setFormData] = useState({
    referral_likelihood: '',
    what_we_did_well: '',
    what_to_improve: '',
    tools_used: '',
    programming_languages: ''
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);

  // Load existing feedback if any
  useEffect(() => {
    const loadExistingFeedback = async () => {
      if (!taskId || !token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/builder-feedback/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.feedback) {
            setExistingFeedback(data.feedback);
            setFormData({
              referral_likelihood: data.feedback.referral_likelihood?.toString() || '',
              what_we_did_well: data.feedback.what_we_did_well || '',
              what_to_improve: data.feedback.what_to_improve || '',
              tools_used: data.feedback.tools_used || '',
              programming_languages: data.feedback.programming_languages || ''
            });
            setIsSubmitted(true);
            setSubmittedAt(data.feedback.created_at);
          }
        } else if (response.status !== 404) {
          // 404 is expected if no feedback exists yet
          console.error('Failed to load existing feedback');
        }
      } catch (err) {
        console.error('Error loading existing feedback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFeedback();
  }, [taskId, token]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Validate form data
  const validateForm = () => {
    // Check referral likelihood
    const referralNum = parseInt(formData.referral_likelihood);
    if (!referralNum || referralNum < 1 || referralNum > 10) {
      return 'Please select a referral likelihood between 1 and 10';
    }

    // Check that at least one text field is filled
    const textFields = [
      formData.what_we_did_well,
      formData.what_to_improve,
      formData.tools_used,
      formData.programming_languages
    ];
    
    const hasTextContent = textFields.some(field => field && field.trim().length > 0);
    if (!hasTextContent) {
      return 'Please fill out at least one of the text fields';
    }

    return null;
  };

  // Show confirmation modal before submission
  const showConfirmationModal = async () => {
    const result = await Swal.fire({
      title: 'Submit Feedback?',
      html: `
        <div style="text-align: left; color: var(--color-text-primary);">
          <p style="margin-bottom: 1rem;">Are you sure you want to submit this feedback? Once submitted, you won't be able to edit it.</p>
          <div style="background: var(--color-background-dark); padding: 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600;">Your feedback summary:</p>
            <p style="margin: 0 0 0.5rem 0;"><strong>Referral likelihood:</strong> ${formData.referral_likelihood}/10</p>
            ${formData.what_we_did_well ? `<p style="margin: 0 0 0.5rem 0;"><strong>What we did well:</strong> ${formData.what_we_did_well.substring(0, 100)}${formData.what_we_did_well.length > 100 ? '...' : ''}</p>` : ''}
            ${formData.what_to_improve ? `<p style="margin: 0 0 0.5rem 0;"><strong>What to improve:</strong> ${formData.what_to_improve.substring(0, 100)}${formData.what_to_improve.length > 100 ? '...' : ''}</p>` : ''}
            ${formData.tools_used ? `<p style="margin: 0 0 0.5rem 0;"><strong>Tools used:</strong> ${formData.tools_used.substring(0, 100)}${formData.tools_used.length > 100 ? '...' : ''}</p>` : ''}
            ${formData.programming_languages ? `<p style="margin: 0;"><strong>Languages:</strong> ${formData.programming_languages.substring(0, 100)}${formData.programming_languages.length > 100 ? '...' : ''}</p>` : ''}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit Feedback',
      cancelButtonText: 'Review Again',
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: 'var(--color-border)',
      background: 'var(--color-background-darker)',
      color: 'var(--color-text-primary)',
      customClass: {
        popup: 'swal-dark-theme',
        title: 'swal-title-dark',
        content: 'swal-content-dark',
        confirmButton: 'swal-confirm-dark',
        cancelButton: 'swal-cancel-dark'
      }
    });

    return result.isConfirmed;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isActive) {
      setError('You have historical access only and cannot submit feedback.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show confirmation modal
    const confirmed = await showConfirmationModal();
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        taskId: parseInt(taskId),
        referral_likelihood: parseInt(formData.referral_likelihood),
        what_we_did_well: formData.what_we_did_well.trim() || null,
        what_to_improve: formData.what_to_improve.trim() || null,
        tools_used: formData.tools_used.trim() || null,
        programming_languages: formData.programming_languages.trim() || null,
        dayNumber,
        cohort
      };

      const url = existingFeedback 
        ? `${import.meta.env.VITE_API_URL}/api/builder-feedback/${taskId}`
        : `${import.meta.env.VITE_API_URL}/api/builder-feedback/submit`;
      
      const method = existingFeedback ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setSuccess(true);
        setIsSubmitted(true);
        setSubmittedAt(new Date().toISOString());
        if (onComplete) {
          setTimeout(() => onComplete(), 1500);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render rating scale buttons
  const renderRatingScale = () => {
    return (
      <div className="builder-feedback__rating-scale">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <button
            key={num}
            type="button"
            className={`builder-feedback__rating-button ${
              formData.referral_likelihood === num.toString() ? 'builder-feedback__rating-button--selected' : ''
            }`}
            onClick={() => handleInputChange('referral_likelihood', num.toString())}
            disabled={!isActive || isSubmitting}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="builder-feedback builder-feedback--loading">
        <div className="builder-feedback__loading">
          <FaSpinner className="builder-feedback__loading-icon" />
          <p>Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="builder-feedback builder-feedback--success">
        <div className="builder-feedback__success">
          <FaCheckCircle className="builder-feedback__success-icon" />
          <h2>Thank you for your feedback!</h2>
          <p>Your response has been {existingFeedback ? 'updated' : 'submitted'} successfully.</p>
        </div>
      </div>
    );
  }

  // Show read-only view if feedback has been submitted
  if (isSubmitted && existingFeedback) {
    return (
      <div className="builder-feedback builder-feedback--readonly">
        <div className="builder-feedback__header">
          <FaEye className="builder-feedback__icon" />
          <h2 className="builder-feedback__title">Feedback Submitted</h2>
          <p className="builder-feedback__subtitle">
            Your feedback has been captured and locked. This preserves your moment-in-time perspective.
          </p>
          {submittedAt && (
            <p className="builder-feedback__submitted-date">
              Submitted on {new Date(submittedAt).toLocaleDateString()} at {new Date(submittedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="builder-feedback__form">
          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">How likely are you to refer this pilot to someone you know?</label>
            <div className="builder-feedback__rating-container">
              <span className="builder-feedback__rating-label">Not likely</span>
              <div className="builder-feedback__rating-scale">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <div
                    key={num}
                    className={`builder-feedback__rating-display ${
                      formData.referral_likelihood === num.toString() ? 'builder-feedback__rating-display--selected' : ''
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <span className="builder-feedback__rating-label">Very likely</span>
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What did we do well?</label>
            <div className="builder-feedback__readonly-text">
              {formData.what_we_did_well || <em>No response provided</em>}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What do we need to improve on?</label>
            <div className="builder-feedback__readonly-text">
              {formData.what_to_improve || <em>No response provided</em>}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What tools did you use this week?</label>
            <div className="builder-feedback__readonly-text">
              {formData.tools_used || <em>No response provided</em>}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What programming languages did you work with this week?</label>
            <div className="builder-feedback__readonly-text">
              {formData.programming_languages || <em>No response provided</em>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-feedback">
      <div className="builder-feedback__header">
        <FaClipboardList className="builder-feedback__icon" />
        <h2 className="builder-feedback__title">Weekly Builder Feedback</h2>
        <p className="builder-feedback__subtitle">
          Help us improve your experience by sharing your thoughts from this week.
        </p>
      </div>

      <form className="builder-feedback__form" onSubmit={handleSubmit}>
        {/* Referral Likelihood */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="referral_likelihood">
            How likely are you to refer this pilot to someone you know?
          </label>
          <div className="builder-feedback__rating-container">
            <span className="builder-feedback__rating-label">Not likely</span>
            {renderRatingScale()}
            <span className="builder-feedback__rating-label">Very likely</span>
          </div>
        </div>

        {/* What we did well */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="what_we_did_well">
            What did we do well?
          </label>
          <textarea
            id="what_we_did_well"
            className="builder-feedback__textarea"
            rows="4"
            value={formData.what_we_did_well}
            onChange={(e) => handleInputChange('what_we_did_well', e.target.value)}
            placeholder="Share what you found valuable or enjoyed..."
            disabled={!isActive || isSubmitting}
          />
        </div>

        {/* What to improve */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="what_to_improve">
            What do we need to improve on?
          </label>
          <textarea
            id="what_to_improve"
            className="builder-feedback__textarea"
            rows="4"
            value={formData.what_to_improve}
            onChange={(e) => handleInputChange('what_to_improve', e.target.value)}
            placeholder="Share areas where we could do better..."
            disabled={!isActive || isSubmitting}
          />
        </div>

        {/* Tools used */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="tools_used">
            What tools did you use this week?
          </label>
          <textarea
            id="tools_used"
            className="builder-feedback__textarea"
            rows="3"
            value={formData.tools_used}
            onChange={(e) => handleInputChange('tools_used', e.target.value)}
            placeholder="List the tools, software, or platforms you worked with..."
            disabled={!isActive || isSubmitting}
          />
        </div>

        {/* Programming languages */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="programming_languages">
            What programming languages did you work with this week?
          </label>
          <textarea
            id="programming_languages"
            className="builder-feedback__textarea"
            rows="3"
            value={formData.programming_languages}
            onChange={(e) => handleInputChange('programming_languages', e.target.value)}
            placeholder="List the programming languages you used..."
            disabled={!isActive || isSubmitting}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="builder-feedback__error">
            <FaExclamationCircle className="builder-feedback__error-icon" />
            {error}
          </div>
        )}

        {/* Form actions */}
        <div className="builder-feedback__actions">
          {onCancel && (
            <button
              type="button"
              className="builder-feedback__button builder-feedback__button--cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <FaTimes />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="builder-feedback__button builder-feedback__button--submit"
            disabled={!isActive || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="builder-feedback__button-icon--spinning" />
                {existingFeedback ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <FaCheck />
                {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuilderFeedbackForm;
