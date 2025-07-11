import React from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './IneligibleScreen.css';

const IneligibleModal = ({ isOpen, onClose, failedCriteria = [] }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`ineligible-modal__overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="ineligible-modal__container">
        <div className="ineligible-modal__header">
          <div className="ineligible-modal__title-section">
            <FaExclamationTriangle className="ineligible-modal__icon" />
            <h3 className="ineligible-modal__title">Application Status Update</h3>
          </div>
          <button 
            className="ineligible-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="ineligible-modal__body">
          <div className="ineligible-modal__message">
            <p>
              Thank you for taking the time to learn about Pursuit and for beginning an application.
            </p>
            
            <p className="ineligible-modal__main-message">
              Unfortunately, based on your responses, you do not meet the eligibility requirements for this program.
            </p>

            {failedCriteria.length > 0 && (
              <div className="ineligible-modal__criteria">
                <strong>Requirements not met:</strong>
                <ul>
                  {failedCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p>
              We encourage you to reapply in the future if your circumstances change.
            </p>
            
            <p>
              We truly appreciate your interest in joining our program.
            </p>
            
            <p className="ineligible-modal__email-note">
              An email confirmation has been sent to you regarding this decision.
            </p>
          </div>
        </div>
        
        <div className="ineligible-modal__footer">
          <button 
            onClick={onClose}
            className="ineligible-modal__button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default IneligibleModal; 