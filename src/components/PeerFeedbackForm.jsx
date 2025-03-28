import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaExclamationCircle, FaUsers, FaUser, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './PeerFeedbackForm.css';

const PeerFeedbackForm = ({ dayNumber, onComplete, onCancel }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selected peers and their feedback
  const [selectedPeers, setSelectedPeers] = useState([]);
  const [peerFeedback, setPeerFeedback] = useState({});
  
  // Fetch all users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users. Please refresh and try again.');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle selecting peers
  const handlePeerSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPeers(selectedOptions);
    
    // Initialize feedback for newly selected peers
    const newFeedback = {...peerFeedback};
    selectedOptions.forEach(peerId => {
      if (!newFeedback[peerId]) {
        newFeedback[peerId] = '';
      }
    });
    
    // Remove feedback for unselected peers
    Object.keys(newFeedback).forEach(peerId => {
      if (!selectedOptions.includes(peerId)) {
        delete newFeedback[peerId];
      }
    });
    
    setPeerFeedback(newFeedback);
  };
  
  // Handle feedback text changes
  const handleFeedbackChange = (peerId, feedback) => {
    setPeerFeedback({
      ...peerFeedback,
      [peerId]: feedback
    });
  };
  
  // Submit peer feedback
  const handleSubmit = async () => {
    // Validate that peers are selected
    if (selectedPeers.length === 0) {
      setSubmitError('Please select at least one peer to provide feedback for.');
      return;
    }
    
    // Validate that feedback is provided for all selected peers
    const isComplete = selectedPeers.every(peerId => peerFeedback[peerId]?.trim());
    
    if (!isComplete) {
      setSubmitError('Please provide feedback for all selected peers.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Format the feedback entries
      const feedbackEntries = selectedPeers.map(peerId => ({
        to_user_id: parseInt(peerId),
        feedback_text: peerFeedback[peerId]
      }));
      
      // Submit to API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          feedbackEntries,
          dayNumber: parseInt(dayNumber)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
      
      // Notify parent component that feedback is complete
      onComplete();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="peer-feedback peer-feedback__loading">
        <div className="peer-feedback__loading-spinner">
          <FaSpinner className="peer-feedback__spinner-icon" />
          <p>Loading peer information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="peer-feedback">
        <div className="peer-feedback__error">
          <FaExclamationTriangle className="peer-feedback__error-icon" />
          <p>{error}</p>
          <button 
            className="peer-feedback__button peer-feedback__button--primary"
            onClick={onCancel}
          >
            <FaTimes /> Skip Peer Feedback
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="peer-feedback">
      <h3 className="peer-feedback__title"><FaUsers className="peer-feedback__header-icon" /> Peer Feedback</h3>
      <p className="peer-feedback__description">
        Please provide feedback for peers you worked with today. This feedback will be anonymized before being shared.
      </p>
      
      <div className="peer-feedback__form-group">
        <label htmlFor="peer-select" className="peer-feedback__label">
          <FaUsers className="peer-feedback__input-icon" /> Who was in your group (at your table) today?
        </label>
        <select 
          id="peer-select" 
          multiple 
          className="peer-feedback__select" 
          onChange={handlePeerSelection}
          value={selectedPeers}
        >
          {users.map(user => (
            <option key={user.user_id} value={user.user_id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </select>
        <small className="peer-feedback__helper-text">Hold Ctrl/Cmd key to select multiple people</small>
      </div>
      
      {selectedPeers.length > 0 ? (
        <>
          <p className="peer-feedback__instruction">
            Please provide specific feedback for each peer (positive or constructive):
          </p>
          
          {selectedPeers.map(peerId => {
            const user = users.find(u => u.user_id.toString() === peerId);
            return (
              <div className="peer-feedback__form-group" key={peerId}>
                <label htmlFor={`feedback-${peerId}`} className="peer-feedback__label">
                  <FaUser className="peer-feedback__input-icon" /> {user?.first_name} {user?.last_name}
                </label>
                <textarea
                  id={`feedback-${peerId}`}
                  className="peer-feedback__textarea"
                  rows="3"
                  value={peerFeedback[peerId] || ''}
                  onChange={(e) => handleFeedbackChange(peerId, e.target.value)}
                  placeholder={`Your feedback for ${user?.first_name}...`}
                />
              </div>
            );
          })}
          
          {submitError && (
            <div className="peer-feedback__submit-error">
              <FaExclamationCircle /> {submitError}
            </div>
          )}
          
          <div className="peer-feedback__actions">
            <button 
              className="peer-feedback__button peer-feedback__button--secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <FaTimes /> Skip
            </button>
            <button 
              className="peer-feedback__button peer-feedback__button--primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="peer-feedback__spinner-btn" /> Submitting...
                </>
              ) : (
                <>
                  <FaCheck /> Submit Feedback
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="peer-feedback__empty-selection">
            <FaUsers className="peer-feedback__empty-icon" />
            <p>Select at least one peer to provide feedback</p>
          </div>
          
          <div className="peer-feedback__actions">
            <button 
              className="peer-feedback__button peer-feedback__button--secondary"
              onClick={onCancel}
            >
              <FaTimes /> Skip Peer Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PeerFeedbackForm; 