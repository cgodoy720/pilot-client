// @ts-nocheck
import React, { useState, useEffect } from 'react';
import './FeedbackModal.css';

function FeedbackModal({ isOpen, onClose, onSubmit, token, isEditing = false, initialData = null }) {
    const [formData, setFormData] = useState({
        feedbackDate: '',
        feedbackType: '',
        overallExperience: '',
        improvementSuggestions: '',
        specificFeedback: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Set today's date as default when modal opens, or use initial data for editing
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData(initialData);
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, feedbackDate: today }));
            }
        }
    }, [isOpen, isEditing, initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.feedbackDate || !formData.feedbackType) {
            setError('Please select both a date and feedback type.');
            return;
        }

        if (!formData.overallExperience.trim()) {
            setError('Please answer: How was your experience overall?');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                onSubmit(data.feedback);
                // Reset form
                setFormData({
                    feedbackDate: '',
                    feedbackType: '',
                    overallExperience: '',
                    improvementSuggestions: '',
                    specificFeedback: ''
                });
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to submit feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                feedbackDate: '',
                feedbackType: '',
                overallExperience: '',
                improvementSuggestions: '',
                specificFeedback: ''
            });
            setError('');
            onClose();
        }
    };


    if (!isOpen) return null;

    return (
        <div className="feedback-modal-overlay" onClick={handleClose}>
            <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
                <div className="feedback-modal__header">
                    <h2>{isEditing ? 'Edit Feedback' : 'Record Feedback'}</h2>
                    <button 
                        className="feedback-modal__close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="feedback-modal__form">
                    {error && (
                        <div className="feedback-modal__error">{error}</div>
                    )}

                    {/* Date Selection */}
                    <div className="form-group">
                        <label htmlFor="feedbackDate">Date *</label>
                        <input
                            type="date"
                            id="feedbackDate"
                            name="feedbackDate"
                            value={formData.feedbackDate}
                            onChange={handleInputChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Feedback Type Selection */}
                    <div className="form-group">
                        <label htmlFor="feedbackType">Event Type *</label>
                        <select
                            id="feedbackType"
                            name="feedbackType"
                            value={formData.feedbackType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select an event type</option>
                            <option value="AI Native Class">AI Native Class</option>
                            <option value="Demo Day">Demo Day</option>
                            <option value="Networking Event">Networking Event</option>
                            <option value="Panel">Panel</option>
                            <option value="Mock Interview">Mock Interview</option>
                        </select>
                    </div>

                    {/* Question 1: Overall Experience (Mandatory) */}
                    <div className="form-group">
                        <label htmlFor="overallExperience">1. How was your experience overall? *</label>
                        <textarea
                            id="overallExperience"
                            name="overallExperience"
                            value={formData.overallExperience}
                            onChange={handleInputChange}
                            placeholder=""
                            rows={4}
                            required
                        />
                    </div>

                    {/* Question 2: Improvement Suggestions (Optional) */}
                    <div className="form-group">
                        <label htmlFor="improvementSuggestions">2. How could we improve going forward?</label>
                        <textarea
                            id="improvementSuggestions"
                            name="improvementSuggestions"
                            value={formData.improvementSuggestions}
                            onChange={handleInputChange}
                            placeholder=""
                            rows={3}
                        />
                    </div>

                    {/* Question 3: Specific Feedback (Optional) */}
                    <div className="form-group">
                        <label htmlFor="specificFeedback">3. Do you have feedback to share on specific Builders or Fellows?</label>
                        <textarea
                            id="specificFeedback"
                            name="specificFeedback"
                            value={formData.specificFeedback}
                            onChange={handleInputChange}
                            placeholder=""
                            rows={3}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="feedback-modal__actions">
                        <button
                            type="button"
                            className="feedback-modal__cancel"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="feedback-modal__submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Feedback' : 'Submit Feedback')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FeedbackModal;
