import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaVideo } from 'react-icons/fa';

function VideoSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    if (currentSubmission?.content) {
      setVideoUrl(currentSubmission.content);
    }
  }, [currentSubmission]);

  const validateVideoUrl = (urlString) => {
    if (!urlString.trim()) return true;
    
    try {
      const url = new URL(urlString);
      // Check if it's a common video platform
      const validDomains = ['loom.com', 'youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com'];
      return validDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value) => {
    setVideoUrl(value);
    setIsValidUrl(validateVideoUrl(value));
  };

  const handleSubmit = () => {
    if (!videoUrl.trim() || !isValidUrl) {
      return;
    }
    // Submit as plain URL string
    onSubmit(videoUrl.trim());
  };

  return (
    <div className="submission-form">
      <div className="submission-form__field">
        <label className="submission-form__label submission-form__label--required">
          <FaVideo style={{ marginRight: '6px' }} />
          Video Link
        </label>
        <input
          type="url"
          className="submission-form__input"
          value={videoUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.loom.com/share/..."
          disabled={isLocked || isSubmitting}
        />
        {!isValidUrl && videoUrl.trim() && (
          <div className="submission-form__validation-error">
            Please enter a valid video URL from Loom, YouTube, Vimeo, or Google Drive
          </div>
        )}
        <div className="submission-form__help">
          Paste your Loom, YouTube, or other video link here. Make sure the video is set to "Anyone with the link can view"
        </div>
      </div>

      {videoUrl && isValidUrl && (
        <div className="submission-form__field">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="submission-form__preview-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-primary, #667eea)',
              fontSize: '0.9rem',
              textDecoration: 'none',
              padding: '8px 12px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}
          >
            <FaExternalLinkAlt />
            Open Video in New Tab
          </a>
        </div>
      )}

      <div className="submission-form__actions">
        <button
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || !isValidUrl || isSubmitting || isLocked}
          className="submission-form__btn submission-form__btn--primary"
        >
          {isSubmitting ? (
            <>
              <div className="submission-form__spinner" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Video'}`
          )}
        </button>
      </div>
    </div>
  );
}

export default VideoSubmission;
