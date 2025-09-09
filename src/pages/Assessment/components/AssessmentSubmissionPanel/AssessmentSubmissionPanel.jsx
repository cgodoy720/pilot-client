import React from 'react';
import { FaTimes } from 'react-icons/fa';
import BusinessSubmission from './BusinessSubmission';
import TechnicalSubmission from './TechnicalSubmission';
import ProfessionalSubmission from './ProfessionalSubmission';
import './AssessmentSubmissionPanel.css';

function AssessmentSubmissionPanel({
  assessmentType,
  submissionData,
  isDraft,
  isLoading,
  onUpdate,
  onSubmit,
  onClose
}) {
  
  const getSubmissionComponent = () => {
    const commonProps = {
      submissionData,
      isDraft,
      isLoading,
      onUpdate,
      onSubmit
    };

    switch (assessmentType) {
      case 'business':
        return <BusinessSubmission {...commonProps} />;
      case 'technical':
        return <TechnicalSubmission {...commonProps} />;
      case 'professional':
        return <ProfessionalSubmission {...commonProps} />;
      case 'self':
        return <BusinessSubmission {...commonProps} />; // Self uses same format as business
      default:
        return (
          <div className="submission-panel__error">
            <p>Unknown assessment type: {assessmentType}</p>
          </div>
        );
    }
  };

  const getTitle = () => {
    const titleMap = {
      'business': 'Submit Business Assessment',
      'technical': 'Submit Technical Assessment', 
      'professional': 'Submit Professional Assessment',
      'self': 'Submit Self Assessment'
    };
    return titleMap[assessmentType] || 'Submit Assessment';
  };

  return (
    <div className="submission-panel">
      <div className="submission-panel__overlay" onClick={onClose} />
      
      <div className="submission-panel__content">
        {/* Header */}
        <div className="submission-panel__header">
          <h2 className="submission-panel__title">{getTitle()}</h2>
          <button 
            onClick={onClose}
            className="submission-panel__close-btn"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="submission-panel__body">
          {getSubmissionComponent()}
        </div>

        {/* Status */}
        {!isDraft && (
          <div className="submission-panel__status">
            <div className="submission-panel__status-badge submission-panel__status-badge--submitted">
              ✓ Submitted
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentSubmissionPanel;
