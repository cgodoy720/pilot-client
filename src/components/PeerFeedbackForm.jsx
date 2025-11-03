import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaExclamationCircle, FaUsers, FaUser, FaSpinner, FaExclamationTriangle, FaSearch, FaFilter, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './PeerFeedbackForm.css';

const PeerFeedbackForm = ({ dayNumber, onComplete, onCancel }) => {
  const { user } = useAuth();
  const isActive = user?.active !== false;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected peers and their feedback
  const [selectedPeers, setSelectedPeers] = useState([]);
  const [peerFeedback, setPeerFeedback] = useState({});
  
  // Process the user name for capitalization
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  // Fetch all users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get current user's cohort from auth context
        const userCohort = user?.cohort;
        if (!userCohort) {
          setError('Unable to determine your cohort. Please contact support.');
          setLoading(false);
          return;
        }
        
        // Fetch active builders from the same cohort
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?cohort=${encodeURIComponent(userCohort)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        
        // Filter out the current user (they shouldn't give feedback to themselves)
        const otherUsers = data.filter(u => u.user_id !== user.user_id);
        
        // Check if there are any other users in this cohort
        if (otherUsers.length === 0) {
          setError('No other users found in your cohort. You may be the only active builder in your cohort currently.');
          setLoading(false);
          return;
        }
        
        // Sort users alphabetically by first name, then last name
        const sortedUsers = otherUsers.sort((a, b) => {
          const nameA = `${a.first_name.toLowerCase()} ${a.last_name.toLowerCase()}`;
          const nameB = `${b.first_name.toLowerCase()} ${b.last_name.toLowerCase()}`;
          return nameA.localeCompare(nameB);
        });
        
        setUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users. Please refresh and try again.');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  // Toggle a peer selection
  const togglePeerSelection = (userId) => {
    if (!isActive) return;
    
    const userIdStr = userId.toString();
    
    if (selectedPeers.includes(userIdStr)) {
      // Remove from selection
      setSelectedPeers(prev => prev.filter(id => id !== userIdStr));
      
      // Remove feedback for this user
      const newFeedback = {...peerFeedback};
      delete newFeedback[userIdStr];
      setPeerFeedback(newFeedback);
    } else {
      // Add to selection
      setSelectedPeers(prev => [...prev, userIdStr]);
      
      // Initialize feedback for this user
      setPeerFeedback(prev => ({
        ...prev,
        [userIdStr]: ''
      }));
    }
  };
  
  // Handle feedback text changes
  const handleFeedbackChange = (peerId, feedback) => {
    if (!isActive) return;
    
    setPeerFeedback({
      ...peerFeedback,
      [peerId]: feedback
    });
  };
  
  // Submit peer feedback
  const handleSubmit = async () => {
    // If user is inactive, don't allow submission
    if (!isActive) {
      setSubmitError('You have historical access only and cannot submit new feedback.');
      return;
    }
    
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
  
  // Display historical access notice for inactive users
  if (!isActive) {
    return (
      <div className="peer-feedback">
        <div className="peer-feedback__historical-notice">
          <FaExclamationTriangle className="peer-feedback__notice-icon" />
          <h3 className="peer-feedback__notice-title">Historical Access Only</h3>
          <p>You have historical access only and cannot submit new peer feedback.</p>
          <button 
            className="peer-feedback__button peer-feedback__button--primary"
            onClick={onCancel}
          >
            <FaTimes /> Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="peer-feedback">
      <div className="peer-feedback__content">
        <h3 className="peer-feedback__title"><FaUsers className="peer-feedback__header-icon" /> Peer Feedback</h3>
        <p className="peer-feedback__description">
          Please provide feedback for peers you worked with today. This feedback will be anonymized before being shared.
        </p>
        
        <div className="peer-feedback__form-group">
          <label className="peer-feedback__label">
            <FaUsers className="peer-feedback__input-icon" /> Who was in your group (at your table) today?
          </label>
          
          {/* Search filter for users */}
          <div className="peer-feedback__search-container">
            <div className="peer-feedback__search-input-wrapper">
              <FaSearch className="peer-feedback__search-icon" />
              <input
                type="text"
                className="peer-feedback__search-input"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  className="peer-feedback__search-clear" 
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="peer-feedback__search-results">
                Showing {filteredUsers.length} of {users.length} people
              </div>
            )}
          </div>
          
          {/* Checkbox list of users */}
          <div className="peer-feedback__user-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.user_id} 
                  className={`peer-feedback__user-item ${selectedPeers.includes(user.user_id.toString()) ? 'selected' : ''}`}
                  onClick={() => togglePeerSelection(user.user_id)}
                >
                  {selectedPeers.includes(user.user_id.toString()) ? (
                    <FaCheckSquare className="peer-feedback__checkbox-icon peer-feedback__checkbox-icon--checked" />
                  ) : (
                    <FaSquare className="peer-feedback__checkbox-icon" />
                  )}
                  <span className="peer-feedback__user-name">
                    {formatName(user.first_name)} {formatName(user.last_name)}
                  </span>
                </div>
              ))
            ) : (
              <div className="peer-feedback__no-results">
                <p>No users match your search</p>
              </div>
            )}
          </div>
          
          {/* Selected users counter */}
          <div className="peer-feedback__selection-summary">
            <span>{selectedPeers.length} {selectedPeers.length === 1 ? 'person' : 'people'} selected</span>
          </div>
        </div>
        
        {selectedPeers.length > 0 ? (
          <>
            <p className="peer-feedback__instruction">
              Please provide specific feedback for each peer (positive or constructive):
            </p>
            
            {selectedPeers.map(peerId => {
              const user = users.find(u => u.user_id.toString() === peerId);
              if (!user) return null; // Skip if user not found
              
              return (
                <div className="peer-feedback__form-group" key={peerId}>
                  <label htmlFor={`feedback-${peerId}`} className="peer-feedback__label">
                    <FaUser className="peer-feedback__input-icon" /> {formatName(user.first_name)} {formatName(user.last_name)}
                  </label>
                  <textarea
                    id={`feedback-${peerId}`}
                    className="peer-feedback__textarea"
                    rows="3"
                    value={peerFeedback[peerId] || ''}
                    onChange={(e) => handleFeedbackChange(peerId, e.target.value)}
                    placeholder={`Your feedback for ${formatName(user.first_name)}...`}
                    disabled={!isActive}
                  />
                </div>
              );
            })}
            
            {submitError && (
              <div className="peer-feedback__submit-error">
                <FaExclamationCircle /> {submitError}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="peer-feedback__empty-selection">
              <FaUsers className="peer-feedback__empty-icon" />
              <p>Select at least one peer to provide feedback</p>
            </div>
          </>
        )}
      </div>
      
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
          disabled={isSubmitting || !isActive}
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
    </div>
  );
};

export default PeerFeedbackForm; 