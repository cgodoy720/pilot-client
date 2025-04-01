import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TaskSubmission.css';

const TaskSubmission = ({ taskId, deliverable }) => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([
    { type: 'link', content: '', label: '' }
  ]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);

  // Fetch existing submission if available
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/submissions/${taskId}`, {
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
  };

  const handleTypeChange = (index, type) => {
    const updatedSubmissions = [...submissions];
    updatedSubmissions[index].type = type;
    // Clear content when switching types to avoid confusion
    updatedSubmissions[index].content = ''; 
    setSubmissions(updatedSubmissions);
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

  const removeSubmission = (index) => {
    if (submissions.length <= 1) return; // Keep at least one submission
    const updatedSubmissions = submissions.filter((_, i) => i !== index);
    setSubmissions(updatedSubmissions);
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
                  <a 
                    href={sub.content} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="task-submission__link-preview"
                  >
                    View shared document
                  </a>
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
    </div>
  );
};

export default TaskSubmission; 