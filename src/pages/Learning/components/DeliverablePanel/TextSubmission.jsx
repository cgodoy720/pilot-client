import React, { useState, useEffect } from 'react';

function TextSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (currentSubmission?.content) {
      setContent(currentSubmission.content);
    }
  }, [currentSubmission]);

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }
    // Submit as plain text string
    onSubmit(content);
  };

  return (
    <div className="submission-form">
      <div className="submission-form__field">
        <label className="submission-form__label submission-form__label--required">
          Your Response
        </label>
        <textarea
          className="submission-form__textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your response here..."
          rows={12}
          disabled={isLocked || isSubmitting}
        />
        <div className="submission-form__char-counter">
          {content.length} characters
        </div>
      </div>

      <div className="submission-form__actions">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting || isLocked}
          className="submission-form__btn submission-form__btn--primary"
        >
          {isSubmitting ? (
            <>
              <div className="submission-form__spinner" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Response'}`
          )}
        </button>
      </div>
    </div>
  );
}

export default TextSubmission;
