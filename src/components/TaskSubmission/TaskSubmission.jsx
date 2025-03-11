import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TaskSubmission.css';

const TaskSubmission = ({ taskId, deliverable }) => {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);

  // Fetch existing submission if available
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubmission(data);
          setContent(data.content);
          setFeedback(data.feedback || '');
        } else if (response.status !== 404) {
          // 404 is expected if no submission exists yet
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch submission');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Failed to connect to the server');
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

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId,
          content
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
      setError('Failed to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="task-submission">
      <h3 className="task-submission__title">Task Submission</h3>
      <p className="task-submission__description">
        {deliverable}
      </p>

      <form onSubmit={handleSubmit} className="task-submission__form">
        <div className="task-submission__form-group">
          <label htmlFor="submission-content" className="task-submission__label">
            Your Submission
          </label>
          <textarea
            id="submission-content"
            className="task-submission__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your submission here..."
            rows={10}
            required
          />
        </div>

        <button
          type="submit"
          className="task-submission__button"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit'}
        </button>

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