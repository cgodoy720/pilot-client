import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaClock, FaSignInAlt } from 'react-icons/fa';
import './ExpiredTokenModal.css';

const ExpiredTokenModal = ({ 
  isOpen, 
  type = 'token_expired', 
  message, 
  onRedirect
}) => {
  // No countdown needed - global handler manages redirects

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'token_expired':
        return {
          icon: <FaClock className="modal-icon expired" />,
          title: 'Session Expired',
          message: message || 'Your session has expired for security. Redirecting to login...',
          showRedirect: true,
          buttonText: 'Login Now'
        };
      
      case 'user_inactive':
        return {
          icon: <FaExclamationTriangle className="modal-icon warning" />,
          title: 'Account Access Changed',
          message: message || 'Your account now has view-only access. You can browse historical content but cannot make new submissions.',
          showRedirect: false,
          buttonText: 'Understood'
        };
      
      default:
        return {
          icon: <FaExclamationTriangle className="modal-icon error" />,
          title: 'Authentication Error',
          message: message || 'Authentication error. Redirecting to login...',
          showRedirect: true,
          buttonText: 'Login Now'
        };
    }
  };

  const { icon, title, message: displayMessage, showRedirect, buttonText } = getModalContent();

  const handleButtonClick = () => {
    if (onRedirect) {
      onRedirect();
    }
  };

  return (
    <div className="expired-token-modal__overlay">
      <div className="expired-token-modal__container">
        <div className="expired-token-modal__content">
          <div className="expired-token-modal__header">
            {icon}
            <h2 className="expired-token-modal__title">{title}</h2>
          </div>
          
          <div className="expired-token-modal__body">
            <p className="expired-token-modal__message">
              {displayMessage}
            </p>
            
            {showRedirect && (
              <div className="expired-token-modal__redirect-info">
                <FaSignInAlt className="redirect-icon" />
                <span>Redirecting to login page...</span>
              </div>
            )}
          </div>
          
          <div className="expired-token-modal__footer">
            <button 
              className="expired-token-modal__button"
              onClick={handleButtonClick}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredTokenModal; 