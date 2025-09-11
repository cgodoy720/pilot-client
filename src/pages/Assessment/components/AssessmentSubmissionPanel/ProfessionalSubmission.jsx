import React, { useState, useEffect } from 'react';
import { FaVideo, FaExternalLinkAlt } from 'react-icons/fa';

function ProfessionalSubmission({ submissionData, isDraft, isLoading, onUpdate, onSubmit }) {
  const [formData, setFormData] = useState({
    loomUrl: ''
  });

  // Initialize form data
  useEffect(() => {
    if (submissionData) {
      setFormData({
        loomUrl: submissionData.loomUrl || ''
      });
    }
  }, [submissionData]);


  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Update parent state immediately (no auto-save)
    onUpdate(newFormData);
  };

  const isValidLoomUrl = (url) => {
    const loomPatterns = [
      /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/
    ];
    
    return loomPatterns.some(pattern => pattern.test(url));
  };

  const getLoomEmbedUrl = (url) => {
    if (!isValidLoomUrl(url)) return null;
    
    // Extract video ID from various Loom URL formats
    const shareMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    const embedMatch = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
    
    const videoId = shareMatch?.[1] || embedMatch?.[1];
    if (videoId) {
      return `https://www.loom.com/embed/${videoId}`;
    }
    
    return null;
  };

  const handleSubmit = () => {
    if (!formData.loomUrl.trim()) {
      alert('Please provide a Loom video URL.');
      return;
    }
    
    if (!isValidLoomUrl(formData.loomUrl)) {
      alert('Please provide a valid Loom video URL (e.g., https://www.loom.com/share/...)');
      return;
    }

    // Submit with current form data
    onSubmit(formData);
  };

  const isComplete = formData.loomUrl.trim() && isValidLoomUrl(formData.loomUrl);
  const embedUrl = getLoomEmbedUrl(formData.loomUrl);

  return (
    <div className="submission-form">
      {/* Instructions */}
      <div className="submission-form__instructions">
        <div className="submission-form__instructions-header">
          <FaVideo className="submission-form__instructions-icon" />
          <h3>Record Your Pitch</h3>
        </div>
        <p>
          Record a pitch describing your coffee shop AI solution to showcase your thinking 
          and communication skills. No slides or preparation needed - just speak naturally 
          about your solution.
        </p>
        <div className="submission-form__loom-link">
          <a 
            href="https://www.loom.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="submission-form__external-link"
          >
            <FaExternalLinkAlt />
            Need to record? Visit Loom.com
          </a>
        </div>
      </div>

      {/* Loom URL Input */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          Loom Video URL *
        </label>
        <input
          type="url"
          className="submission-form__input"
          value={formData.loomUrl}
          onChange={(e) => handleChange('loomUrl', e.target.value)}
          placeholder="https://www.loom.com/share/..."
          disabled={!isDraft || isLoading}
        />
        <div className="submission-form__help">
          Paste the share link from your Loom video. Make sure your video is publicly accessible.
        </div>
        {formData.loomUrl && !isValidLoomUrl(formData.loomUrl) && (
          <div className="submission-form__error">
            Please enter a valid Loom video URL (e.g., https://www.loom.com/share/...)
          </div>
        )}
      </div>

      {/* Video Preview */}
      {embedUrl && isDraft && (
        <div className="submission-form__field">
          <label className="submission-form__label">
            Video Preview
          </label>
          <div className="submission-form__video-preview">
            <iframe
              src={embedUrl}
              frameBorder="0"
              webkitallowfullscreen
              mozallowfullscreen
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
          <div className="submission-form__help">
            Preview of your Loom video. Make sure it plays correctly before submitting.
          </div>
        </div>
      )}



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
              <label className="submission-form__label">Submitted Video</label>
              <div className="submission-form__readonly">
                <a href={formData.loomUrl} target="_blank" rel="noopener noreferrer">
                  {formData.loomUrl}
                </a>
              </div>
            </div>
            
            {embedUrl && (
              <div className="submission-form__field">
                <label className="submission-form__label">Video</label>
                <div className="submission-form__video-preview">
                  <iframe
                    src={embedUrl}
                    frameBorder="0"
                    webkitallowfullscreen
                    mozallowfullscreen
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isComplete && isDraft && (
          <div className="submission-form__help">
            Please provide a valid Loom video URL before submitting your assessment.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalSubmission;
