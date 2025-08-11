import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatSubmissionTimestamp } from '../../utils/dateHelpers';
import './TaskSubmission.css';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal__content">
          <p>{message}</p>
          <div className="confirmation-modal__actions">
            <button 
              className="confirmation-modal__cancel-btn" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="confirmation-modal__confirm-btn" 
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskSubmission = ({ taskId, deliverable, canAnalyzeDeliverable, onAnalyzeDeliverable }) => {
  const { token, user } = useAuth();
  const isActive = user?.active !== false;
  
  const [submissionData, setSubmissionData] = useState({ type: 'link', content: '' });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Function to show confirmation modal
  const confirmAndExecute = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  // Function to handle confirmation
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
  };

  // Function to cancel confirmation
  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  // Fetch existing submission if available
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubmission(data);
          
          // Handle parsing the content based on format
          try {
            // Check if the content is JSON (from legacy format)
            const parsedContent = JSON.parse(data.content);
            if (Array.isArray(parsedContent) && parsedContent.length > 0) {
              // Use only the first item from the array
              setSubmissionData(parsedContent[0]);
            } else if (typeof parsedContent === 'object') {
              // If it's an object but not an array
              setSubmissionData({ type: 'link', content: data.content, label: 'Submission' });
            }
          } catch (e) {
            // If it's not valid JSON, determine the type based on content
            let submissionType = 'link'; // default to link
            
            // Check if it's a Loom video URL
            try {
              const url = new URL(data.content);
              if (url.hostname.includes('loom.com')) {
                submissionType = 'video';
              }
            } catch (urlError) {
              // If it's not a valid URL, check if it looks like text content
              if (data.content && data.content.length > 100 && !data.content.startsWith('http')) {
                submissionType = 'text';
              }
            }
            
            setSubmissionData({ type: submissionType, content: data.content, label: 'Submission' });
          }
          
          setFeedback(data.feedback || '');
        } else if (response.status !== 404) {
          // 404 is expected if no submission exists yet
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch submission');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Unable to load previous submission. Please check your internet connection and try refreshing the page.');
      }
    };

    if (taskId) {
      fetchSubmission();
    }
  }, [taskId, token]);

  // Check if a URL is a Google Doc
  const isGoogleDoc = (url) => {
    return url && url.startsWith('https://docs.google.com/');
  };

  // Handle analyzing a deliverable
  const handleAnalyzeSubmission = () => {
    if (!submission || !submissionData.content) return;
    
    // Only proceed if it's a Google Doc
    if (!isGoogleDoc(submissionData.content)) {
      setSubmissionError("Only Google Docs can be analyzed. Please submit a Google Doc URL.");
      return;
    }
    
    // Clear previous errors
    setSubmissionError(null);
    
    // Call the onAnalyzeDeliverable callback with the submission URL
    if (onAnalyzeDeliverable && submissionData.content) {
      setIsAnalyzing(true);
      
      onAnalyzeDeliverable(submissionData.content)
        .then(() => {
          // Success message will be handled by parent component
        })
        .catch(err => {
          console.error('Analysis failed:', err);
          
          // Check for specific Google Doc access error
          if (err.message && (
              err.message.includes("Could not access Google Doc") || 
              err.message.includes("status code 401") ||
              err.message.includes("status code 403")
            )) {
            setSubmissionError("Please set the visibility for this Google Doc to 'Anyone with the link can view'");
          } else {
            setSubmissionError(err.message || "Analysis failed. Please try again.");
          }
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If user is inactive, don't allow submission
    if (!isActive) {
      setError('You have historical access only and cannot submit new work.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Validate submission
    let isValid = submissionData.content.trim() !== '';
    
    // Additional validation for link and video types
    if (submissionData.type === 'link' && !isValidUrl(submissionData.content)) {
      isValid = false;
    }
    
    // Validate Loom URLs for video type
    if (submissionData.type === 'video') {
      if (!isValidUrl(submissionData.content)) {
        isValid = false;
      } else if (!isLoomUrl(submissionData.content)) {
        isValid = false;
        setError('Please provide a valid Loom video URL (loom.com).');
        setIsSubmitting(false);
        return;
      }
    }

    if (!isValid) {
      setError('Please fill in all submission fields. Ensure links are valid URLs.');
      setIsSubmitting(false);
      return;
    }

    try {
      let contentToSubmit = submissionData.content;

      // Submit the task with the content (URL for video uploads)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId,
          content: contentToSubmit
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data);
        setFeedback(data.feedback || '');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setError('Unable to submit your work. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (value) => {
    setSubmissionData({...submissionData, content: value});
    
    // Clear any existing error when the content changes
    if (submissionError) {
      setSubmissionError(null);
    }
  };

  const handleTypeChange = (type) => {
    setSubmissionData({...submissionData, type: type, content: ''}); 
    
    // Clear any existing error
    if (submissionError) {
      setSubmissionError(null);
    }
  };

  // Simple URL validation
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Loom URL validation
  const isLoomUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('loom.com');
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="task-submission">
      {!isActive ? (
        <div className="task-submission__historical-notice">
          <p>You have historical access only. New submissions are not allowed.</p>
          {submission && (
            <div className="task-submission__previous">
              <h4>Your Previous Submission:</h4>
              <a href={submission.content} target="_blank" rel="noopener noreferrer">
                {submission.content}
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          <h3 className="task-submission__title">Task Submission</h3>
          <p className="task-submission__description">
            {deliverable}
          </p>

          <form onSubmit={handleSubmit} className="task-submission__form">
            <div className="task-submission__item">
              <div className="task-submission__item-header">
                <div className="task-submission__type-selector">
                  <label className={`task-submission__type-option ${submissionData.type === 'text' ? 'task-submission__type-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="text"
                      checked={submissionData.type === 'text'}
                      onChange={() => handleTypeChange('text')}
                    />
                    Text
                  </label>
                  <label className={`task-submission__type-option ${submissionData.type === 'link' ? 'task-submission__type-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="link"
                      checked={submissionData.type === 'link'}
                      onChange={() => handleTypeChange('link')}
                    />
                    Google Drive Link
                  </label>
                  <label className={`task-submission__type-option ${submissionData.type === 'video' ? 'task-submission__type-option--active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="video"
                      checked={submissionData.type === 'video'}
                      onChange={() => handleTypeChange('video')}
                    />
                    Video
                  </label>
                </div>
              </div>

              {submissionData.type === 'text' ? (
                <textarea
                  className="task-submission__textarea"
                  value={submissionData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter your text submission here..."
                  rows={6}
                />
              ) : submissionData.type === 'video' ? (
                <div className="task-submission__video-upload-container">
                  <input
                    type="url"
                    className="task-submission__link-input"
                    value={submissionData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Paste your Loom video URL here"
                  />
                  {submissionData.content && !isValidUrl(submissionData.content) && (
                    <p className="task-submission__link-warning">Please enter a valid URL</p>
                  )}
                  {submissionData.content && isValidUrl(submissionData.content) && !isLoomUrl(submissionData.content) && (
                    <p className="task-submission__link-warning">Please enter a Loom video URL (loom.com)</p>
                  )}
                  {submissionData.content && isValidUrl(submissionData.content) && isLoomUrl(submissionData.content) && (
                    <div className="task-submission__video-preview">
                      <div className="task-submission__loom-embed">
                        <iframe 
                          src={submissionData.content.includes('/share/') ? submissionData.content.replace('/share/', '/embed/') : submissionData.content} 
                          frameBorder="0" 
                          allowFullScreen
                          className="task-submission__video-player"
                        ></iframe>
                      </div>
                      <div className="task-submission__link-actions" style={{ justifyContent: 'center', width: '100%' }}>
                        <a 
                          href={submissionData.content} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="task-submission__link-preview"
                        >
                          View Loom video
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="task-submission__link-input-container">
                  <input
                    type="url"
                    className="task-submission__link-input"
                    value={submissionData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Paste your Google Drive share link here"
                  />
                  {submissionData.content && !isValidUrl(submissionData.content) && (
                    <p className="task-submission__link-warning">Please enter a valid URL</p>
                  )}
                  {submissionData.content && isValidUrl(submissionData.content) && (
                    <div className="task-submission__link-actions">
                      <a 
                        href={submissionData.content} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="task-submission__link-preview"
                      >
                        View shared document
                      </a>
                      
                      {/* Only show analyze button for Google Docs */}
                      {submission && isGoogleDoc(submissionData.content) && (
                        <button
                          type="button"
                          className="task-submission__analyze-btn"
                          onClick={handleAnalyzeSubmission}
                          disabled={isAnalyzing || !isActive}
                        >
                          {isAnalyzing ? 'Analyzing...' : 'Analyze This Submission'}
                        </button>
                      )}
                      
                      {/* Show message if URL is not a Google Doc */}
                      {submission && !isGoogleDoc(submissionData.content) && submissionData.type === 'link' && (
                        <div className="task-submission__not-google-doc">
                          <span>Only Google Docs can be analyzed</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Display error message for this submission */}
                  {submissionError && (
                    <div className="task-submission__submission-error">
                      <p>
                        <span className="task-submission__error-icon">⚠️</span> 
                        {submissionError}
                      </p>
                      {submissionError.includes("Google Doc") && (
                        <div className="task-submission__error-help">
                          <p>How to fix:</p>
                          <ol>
                            <li>Open your Google Doc</li>
                            <li>Click the "Share" button in the top right</li>
                            <li>In the "Get Link" section, click "Change to anyone with the link"</li>
                            <li>Ensure the permission is set to "Viewer"</li>
                            <li>Click "Copy link" and try again</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="task-submission__actions">
              <button
                type="submit"
                className="task-submission__button"
                disabled={isSubmitting || !submissionData.content.trim()}
              >
                {isSubmitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit'}
              </button>
            </div>

            {error && (
              <div className="task-submission__error">
                {error}
              </div>
            )}

            {submission && (
              <div className="task-submission__status">
                <p>Last updated: {formatSubmissionTimestamp(submission.updated_at)}</p>
              </div>
            )}

            {feedback && (
              <div className="task-submission__feedback">
                <h4 className="task-submission__feedback-title">Feedback</h4>
                <p className="task-submission__feedback-content">{feedback}</p>
              </div>
            )}
          </form>

          {/* Add the Confirmation Modal */}
          <ConfirmationModal
            isOpen={showConfirmModal}
            message={confirmMessage}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  );
};

export default TaskSubmission; 