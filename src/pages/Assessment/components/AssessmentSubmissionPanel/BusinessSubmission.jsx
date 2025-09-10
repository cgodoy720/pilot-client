import React, { useState, useEffect } from 'react';

function BusinessSubmission({ submissionData, isDraft, isLoading, onUpdate, onSubmit }) {
  const [formData, setFormData] = useState({
    problemStatement: '',
    proposedSolution: ''
  });
  const [lastSaved, setLastSaved] = useState(null);

  // Initialize form data
  useEffect(() => {
    if (submissionData) {
      setFormData({
        problemStatement: submissionData.problemStatement || '',
        proposedSolution: submissionData.proposedSolution || ''
      });
      setLastSaved(submissionData.lastSaved);
    }
  }, [submissionData]);

  // Auto-save as draft when form data changes
  useEffect(() => {
    // Only auto-save if there's actual content and we're in draft mode
    if (isDraft && (formData.problemStatement.trim() || formData.proposedSolution.trim())) {
      console.log('BusinessSubmission: Auto-saving form data...', formData);
      const timeoutId = setTimeout(() => {
        onUpdate(formData);
        console.log('BusinessSubmission: Auto-save completed');
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [formData.problemStatement, formData.proposedSolution, isDraft, onUpdate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.problemStatement.trim() || !formData.proposedSolution.trim()) {
      alert('Please fill in both the problem statement and proposed solution before submitting.');
      return;
    }
    // Update parent state and submit
    onUpdate(formData);
    onSubmit(formData);
  };

  const isComplete = formData.problemStatement.trim() && formData.proposedSolution.trim();

  return (
    <div className="submission-form">
      <div className="submission-form__field">
        <label className="submission-form__label">
          Problem Statement *
        </label>
        <textarea
          className="submission-form__textarea submission-form__textarea--large"
          value={formData.problemStatement}
          onChange={(e) => handleChange('problemStatement', e.target.value)}
          placeholder="Enter your one-sentence problem statement here..."
          disabled={!isDraft || isLoading}
          rows={4}
        />
        <div className="submission-form__char-counter">
          {formData.problemStatement.length} characters
        </div>
        <div className="submission-form__help">
          Clearly state the main problem the coffee shop is facing in one concise sentence.
        </div>
      </div>

      <div className="submission-form__field">
        <label className="submission-form__label">
          Proposed Solution *
        </label>
        <textarea
          className="submission-form__textarea submission-form__textarea--large"
          value={formData.proposedSolution}
          onChange={(e) => handleChange('proposedSolution', e.target.value)}
          placeholder="Enter your one-sentence proposed solution here..."
          disabled={!isDraft || isLoading}
          rows={4}
        />
        <div className="submission-form__char-counter">
          {formData.proposedSolution.length} characters
        </div>
        <div className="submission-form__help">
          Describe your AI-powered solution to the problem in one clear sentence.
        </div>
      </div>


      <div className="submission-form__actions">
        {isDraft ? (
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="submission-form__btn submission-form__btn--primary"
          >
            {isLoading ? (
              <>
                <div className="submission-form__spinner" />
                Submitting...
              </>
            ) : (
              'Submit Final Assessment'
            )}
          </button>
        ) : (
          <div className="submission-form__submitted">
            <div className="submission-form__field">
              <label className="submission-form__label">Problem Statement</label>
              <div className="submission-form__readonly">
                {formData.problemStatement}
              </div>
            </div>
            
            <div className="submission-form__field">
              <label className="submission-form__label">Proposed Solution</label>
              <div className="submission-form__readonly">
                {formData.proposedSolution}
              </div>
            </div>
          </div>
        )}
        
        {!isComplete && isDraft && (
          <div className="submission-form__help">
            Both fields are required before you can submit your assessment.
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessSubmission;
