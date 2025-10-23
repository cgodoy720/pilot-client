// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PledgeInfo.css';

const PledgeInfo = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="pledge-info-container">
      <div className="pledge-info-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Dashboard
        </button>
      </div>
      <div className="pledge-info-content">
        <h2>How to Sign the Pledge</h2>
        <div className="pledge-info-text">
          <p>If you have questions about AI Native classes, curriculum, schedule, or the pledge, please reach out to Afiya at afiya@pursuit.org.</p>
          <p>If you have questions about the Good Job Guarantee, please reach out to Kirstie at kirstie@pursuit.org.</p>
          <p>Otherwise, you should have received both documents via docusign. Please sign these documents in order to secure your spot in the program!</p>
        </div>
      </div>
    </div>
  );
};

export default PledgeInfo; 