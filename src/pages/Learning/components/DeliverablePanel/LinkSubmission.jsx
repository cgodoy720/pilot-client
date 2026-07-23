import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

function LinkSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    if (currentSubmission?.content) {
      setUrl(currentSubmission.content);
    }
  }, [currentSubmission]);

  const validateUrl = (urlString) => {
    if (!urlString.trim()) return true; // Empty is ok, just can't submit
    
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    setIsValidUrl(validateUrl(value));
  };

  const handleSubmit = () => {
    if (!url.trim() || !isValidUrl) {
      return;
    }
    // Submit as plain URL string
    onSubmit(url.trim());
  };

  return (
    <div className="submission-form">
      <div className="submission-form__field">
        <label className="submission-form__label submission-form__label--required">
          Document Link
        </label>
        <input
          type="url"
          className="submission-form__input"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://docs.google.com/document/d/..."
          disabled={isLocked || isSubmitting}
        />
        {!isValidUrl && url.trim() && (
          <div className="submission-form__validation-error">
            Please enter a valid URL starting with http:// or https://
          </div>
        )}
        <div className="submission-form__help">
          Paste the link to your Google Doc or other shareable document
        </div>
      </div>

      {url && isValidUrl && (
        <div className="submission-form__field">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="submission-form__preview-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-primary, #667eea)',
              fontSize: '0.9rem',
              textDecoration: 'none'
            }}
          >
            <FaExternalLinkAlt />
            Preview Link
          </a>
        </div>
      )}

      <div className="submission-form__actions">
        <button
          onClick={handleSubmit}
          disabled={!url.trim() || !isValidUrl || isSubmitting || isLocked}
          className="submission-form__btn submission-form__btn--primary"
        >
          {isSubmitting ? (
            <>
              <div className="submission-form__spinner" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Link'}`
          )}
        </button>
      </div>
    </div>
  );
}

export default LinkSubmission;
