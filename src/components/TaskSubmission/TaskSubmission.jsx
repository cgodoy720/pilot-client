import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([
    { type: 'link', content: '', label: '' }
  ]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzingSubmissionIndex, setAnalyzingSubmissionIndex] = useState(null);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);
  const [analysisStatuses, setAnalysisStatuses] = useState({});
  const [submissionErrors, setSubmissionErrors] = useState({});
  
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
            // Check if the content is JSON (for multiple submissions)
            const parsedContent = JSON.parse(data.content);
            if (Array.isArray(parsedContent)) {
              setSubmissions(parsedContent);
            } else {
              // If it's an object but not an array
              setSubmissions([{ type: 'link', content: data.content, label: 'Main Submission' }]);
            }
          } catch (e) {
            // If it's not valid JSON, assume it's a legacy single text submission
            setSubmissions([{ type: 'link', content: data.content, label: 'Main Submission' }]);
          }
          
          setFeedback(data.feedback || '');
        } else if (response.status !== 404) {
          // 404 is expected if no submission exists yet
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch submission');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Unable to load previous submissions. Please check your internet connection and try refreshing the page.');
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

  // Handle analyzing a specific deliverable
  const handleAnalyzeSubmission = (index) => {
    if (!submission || !submissions[index]?.content) return;
    
    // Get the specific submission to analyze
    const submissionToAnalyze = submissions[index];
    
    // Only proceed if it's a Google Doc
    if (!isGoogleDoc(submissionToAnalyze.content)) {
      setSubmissionErrors(prev => ({
        ...prev,
        [index]: "Only Google Docs can be analyzed. Please submit a Google Doc URL."
      }));
      return;
    }
    
    // Clear previous errors
    setSubmissionErrors(prev => ({
      ...prev,
      [index]: null
    }));
    
    // Call the onAnalyzeDeliverable callback with the submission URL
    if (onAnalyzeDeliverable && submissionToAnalyze.content) {
      setAnalyzingSubmissionIndex(index);
      
      onAnalyzeDeliverable(submissionToAnalyze.content)
        .then(() => {
          // Update analysis status for this submission
          setAnalysisStatuses(prev => ({
            ...prev,
            [index]: { 
              analyzed: true, 
              timestamp: new Date().toISOString() 
            }
          }));
        })
        .catch(err => {
          console.error('Analysis failed:', err);
          
          // Check for specific Google Doc access error
          if (err.message && (
              err.message.includes("Could not access Google Doc") || 
              err.message.includes("status code 401") ||
              err.message.includes("status code 403")
            )) {
            setSubmissionErrors(prev => ({
              ...prev,
              [index]: "Please set the visibility for this Google Doc to 'Anyone with the link can view'"
            }));
          } else {
            setSubmissionErrors(prev => ({
              ...prev,
              [index]: err.message || "Analysis failed. Please try again."
            }));
          }
        })
        .finally(() => {
          setAnalyzingSubmissionIndex(null);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate submissions
    const isValid = submissions.every(sub => 
      sub.content.trim() !== '' && 
      (sub.type !== 'link' || isValidUrl(sub.content))
    );

    if (!isValid) {
      setError('Please fill in all submission fields. Ensure links are valid URLs.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId,
          content: JSON.stringify(submissions)
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

  const handleContentChange = (index, value) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[index].content = value;
    setSubmissions(updatedSubmissions);
    
    // Clear any existing errors for this submission when the content changes
    if (submissionErrors[index]) {
      setSubmissionErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }
  };

  const handleTypeChange = (index, type) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[index].type = type;
    // Clear content when switching types to avoid confusion
    updatedSubmissions[index].content = ''; 
    setSubmissions(updatedSubmissions);
    
    // Clear any existing errors for this submission
    if (submissionErrors[index]) {
      setSubmissionErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }
  };

  const handleLabelChange = (index, label) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[index].label = label;
    setSubmissions(updatedSubmissions);
  };

  const addSubmission = () => {
    setSubmissions([...submissions, { 
      type: 'link', 
      content: '',
      label: `Submission ${submissions.length + 1}`
    }]);
  };

  const removeSubmission = async (index) => {
    // Don't allow removing the last submission
    if (submissions.length <= 1) return;
    
    // Use the confirmation modal instead of confirm()
    confirmAndExecute(
      `Are you sure you want to remove "${submissions[index].label}"?`,
      async () => {
        // Remove the submission from the local state
        const updatedSubmissions = submissions.filter((_, i) => i !== index);
        setSubmissions(updatedSubmissions);
        
        // Clean up error state
        const updatedErrors = {...submissionErrors};
        delete updatedErrors[index];
        setSubmissionErrors(updatedErrors);
        
        // Only update the database if we already have a saved submission
        if (submission) {
          try {
            // Update the submission in the database
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                taskId,
                content: JSON.stringify(updatedSubmissions)
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              setSubmission(data);
              // Set temporary success message
              setError('Submission item removed successfully');
              setTimeout(() => setError(''), 3000);
            } else {
              const errorData = await response.json();
              setError(errorData.error || 'Failed to update submission');
            }
          } catch (error) {
            console.error('Error updating submission:', error);
            setError('Unable to update submission. Please check your internet connection and try again.');
          }
        }
      }
    );
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

  return (
    <div className="task-submission">
      <h3 className="task-submission__title">Task Submission</h3>
      <p className="task-submission__description">
        {deliverable}
      </p>

      <form onSubmit={handleSubmit} className="task-submission__form">
        {submissions.map((sub, index) => (
          <div key={index} className="task-submission__item">
            <div className="task-submission__item-header">
              <input
                type="text"
                className="task-submission__label-input"
                value={sub.label}
                onChange={(e) => handleLabelChange(index, e.target.value)}
                placeholder="Enter title"
              />
              
              <div className="task-submission__type-selector">
                <label className={`task-submission__type-option ${sub.type === 'text' ? 'task-submission__type-option--active' : ''}`}>
                  <input
                    type="radio"
                    name={`type-${index}`}
                    value="text"
                    checked={sub.type === 'text'}
                    onChange={() => handleTypeChange(index, 'text')}
                  />
                  Text
                </label>
                <label className={`task-submission__type-option ${sub.type === 'link' ? 'task-submission__type-option--active' : ''}`}>
                  <input
                    type="radio"
                    name={`type-${index}`}
                    value="link"
                    checked={sub.type === 'link'}
                    onChange={() => handleTypeChange(index, 'link')}
                  />
                  Google Drive Link
                </label>
              </div>
              
              {submissions.length > 1 && (
                <button
                  type="button"
                  className="task-submission__remove-btn"
                  onClick={() => removeSubmission(index)}
                >
                  ✕
                </button>
              )}
            </div>

            {sub.type === 'text' ? (
              <textarea
                className="task-submission__textarea"
                value={sub.content}
                onChange={(e) => handleContentChange(index, e.target.value)}
                placeholder="Enter your text submission here..."
                rows={6}
              />
            ) : (
              <div className="task-submission__link-input-container">
                <input
                  type="url"
                  className="task-submission__link-input"
                  value={sub.content}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  placeholder="Paste your Google Drive share link here"
                />
                {sub.content && !isValidUrl(sub.content) && (
                  <p className="task-submission__link-warning">Please enter a valid URL</p>
                )}
                {sub.content && isValidUrl(sub.content) && (
                  <div className="task-submission__link-actions">
                    <a 
                      href={sub.content} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="task-submission__link-preview"
                    >
                      View shared document
                    </a>
                    
                    {/* Only show analyze button for Google Docs */}
                    {submission && isGoogleDoc(sub.content) && (
                      <button
                        type="button"
                        className="task-submission__analyze-btn"
                        onClick={() => {
                          handleAnalyzeSubmission(index);
                        }}
                        disabled={analyzingSubmissionIndex === index}
                      >
                        {analyzingSubmissionIndex === index ? 'Analyzing...' : 'Analyze This Submission'}
                      </button>
                    )}
                    
                    {/* Show message if URL is not a Google Doc */}
                    {submission && !isGoogleDoc(sub.content) && sub.type === 'link' && (
                      <div className="task-submission__not-google-doc">
                        <span>Only Google Docs can be analyzed</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display specific error message for this submission */}
                {submissionErrors[index] && (
                  <div className="task-submission__submission-error">
                    <p>
                      <span className="task-submission__error-icon">⚠️</span> 
                      {submissionErrors[index]}
                    </p>
                    {submissionErrors[index].includes("Google Doc") && (
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
        ))}

        <div className="task-submission__actions">
          <button
            type="button"
            className="task-submission__add-btn"
            onClick={addSubmission}
          >
            + Add Another Submission
          </button>

          <button
            type="submit"
            className="task-submission__button"
            disabled={isSubmitting || submissions.some(sub => !sub.content.trim())}
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
            <p>Last updated: {new Date(submission.updated_at).toLocaleString()}</p>
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
    </div>
  );
};

export default TaskSubmission; 