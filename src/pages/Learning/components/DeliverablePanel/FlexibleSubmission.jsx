import React, { useState, useEffect } from 'react';

function FlexibleSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [submissionType, setSubmissionType] = useState('link');
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');

  // Initialize from existing submission
  useEffect(() => {
    if (currentSubmission?.content) {
      try {
        // Try to parse as JSON (legacy format)
        const parsedContent = JSON.parse(currentSubmission.content);
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          setSubmissionType(parsedContent[0].type || 'link');
          setContent(parsedContent[0].content || '');
        } else if (typeof parsedContent === 'object' && parsedContent.content) {
          setSubmissionType(parsedContent.type || 'link');
          setContent(parsedContent.content || '');
        }
      } catch (e) {
        // Plain text content - determine type based on content
        const contentStr = currentSubmission.content;
        let detectedType = 'link';
        
        try {
          const url = new URL(contentStr);
          if (url.hostname.includes('loom.com')) {
            detectedType = 'video';
          } else {
            detectedType = 'link';
          }
        } catch (urlError) {
          // Not a URL, probably text
          if (contentStr && contentStr.length > 100 && !contentStr.startsWith('http')) {
            detectedType = 'text';
          }
        }
        
        setSubmissionType(detectedType);
        setContent(contentStr);
      }
    }
  }, [currentSubmission]);

  const handleTypeChange = (type) => {
    setSubmissionType(type);
    setContent('');
    setValidationError('');
  };

  const handleContentChange = (value) => {
    setContent(value);
    if (validationError) {
      setValidationError('');
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isLoomUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('loom.com');
    } catch (e) {
      return false;
    }
  };

  const validateSubmission = () => {
    if (!content.trim()) {
      return 'Please enter your submission content';
    }

    if (submissionType === 'link' || submissionType === 'video') {
      if (!isValidUrl(content)) {
        return 'Please enter a valid URL';
      }
    }

    if (submissionType === 'video' && !isLoomUrl(content)) {
      return 'Please enter a valid Loom video URL (loom.com)';
    }

    return null;
  };

  const handleSubmit = () => {
    const error = validateSubmission();
    if (error) {
      setValidationError(error);
      return;
    }

    // Submit the content directly (backend expects plain string)
    onSubmit(content);
  };

  const isFormComplete = () => {
    if (!content.trim()) return false;
    
    if (submissionType === 'link' || submissionType === 'video') {
      return isValidUrl(content);
    }
    
    if (submissionType === 'video') {
      return isLoomUrl(content);
    }
    
    return true;
  };

  return (
    <div className="submission-form">
      {/* Type Selector */}
      <div className="submission-form__type-selector">
        <label className={`submission-form__type-option ${submissionType === 'text' ? 'submission-form__type-option--active' : ''}`}>
          <input
            type="radio"
            name="submission-type"
            value="text"
            checked={submissionType === 'text'}
            onChange={() => handleTypeChange('text')}
            disabled={isLocked}
          />
          <span>Text</span>
        </label>
        
        <label className={`submission-form__type-option ${submissionType === 'link' ? 'submission-form__type-option--active' : ''}`}>
          <input
            type="radio"
            name="submission-type"
            value="link"
            checked={submissionType === 'link'}
            onChange={() => handleTypeChange('link')}
            disabled={isLocked}
          />
          <span>Google Drive Link</span>
        </label>
        
        <label className={`submission-form__type-option ${submissionType === 'video' ? 'submission-form__type-option--active' : ''}`}>
          <input
            type="radio"
            name="submission-type"
            value="video"
            checked={submissionType === 'video'}
            onChange={() => handleTypeChange('video')}
            disabled={isLocked}
          />
          <span>Video</span>
        </label>
      </div>

      {/* Content Input Area */}
      <div className="submission-form__content">
        {submissionType === 'text' ? (
          <textarea
            className="submission-form__textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your text submission here..."
            rows={8}
            disabled={isLocked || isSubmitting}
          />
        ) : submissionType === 'video' ? (
          <div className="submission-form__video-container">
            <input
              type="url"
              className="submission-form__input"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Paste your Loom video URL here (e.g., https://loom.com/share/...)"
              disabled={isLocked || isSubmitting}
            />
            
            {content && !isValidUrl(content) && (
              <p className="submission-form__warning">Please enter a valid URL</p>
            )}
            
            {content && isValidUrl(content) && !isLoomUrl(content) && (
              <p className="submission-form__warning">Please enter a Loom video URL (loom.com)</p>
            )}
            
            {content && isValidUrl(content) && isLoomUrl(content) && (
              <div className="submission-form__preview">
                <div className="submission-form__video-embed">
                  <iframe 
                    src={content.includes('/share/') ? content.replace('/share/', '/embed/') : content} 
                    frameBorder="0" 
                    allowFullScreen
                    className="submission-form__video-player"
                    title="Loom video preview"
                  ></iframe>
                </div>
                <a 
                  href={content} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="submission-form__link-preview"
                >
                  View Loom video in new tab
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="submission-form__link-container">
            <input
              type="url"
              className="submission-form__input"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Paste your Google Drive share link here"
              disabled={isLocked || isSubmitting}
            />
            
            {content && !isValidUrl(content) && (
              <p className="submission-form__warning">Please enter a valid URL</p>
            )}
            
            {content && isValidUrl(content) && (
              <div className="submission-form__preview">
                <a 
                  href={content} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="submission-form__link-preview"
                >
                  View shared document in new tab
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="submission-form__validation-error">
          {validationError}
        </div>
      )}

      {/* Submit Button */}
      <div className="submission-form__actions">
        <button
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting || isLocked}
          className="submission-form__btn submission-form__btn--primary"
        >
          {isSubmitting ? (
            <>
              <div className="submission-form__spinner" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Deliverable'}`
          )}
        </button>
        
        {!isFormComplete() && !isLocked && (
          <div className="submission-form__help">
            Please complete all fields before submitting.
          </div>
        )}
      </div>
    </div>
  );
}

export default FlexibleSubmission;

