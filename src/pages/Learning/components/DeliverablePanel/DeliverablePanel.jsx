import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import StructuredSubmission from './StructuredSubmission';
import FlexibleSubmission from './FlexibleSubmission';
import './DeliverablePanel.css';

function DeliverablePanel({
  task,
  currentSubmission,
  onClose,
  onSubmit,
  isLocked = false
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  const handleSubmit = async (submissionData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionComponent = () => {
    const commonProps = {
      task,
      currentSubmission,
      isSubmitting,
      isLocked,
      onSubmit: handleSubmit
    };

    console.log('DeliverablePanel - task:', task);
    console.log('DeliverablePanel - deliverable_schema:', task.deliverable_schema);
    console.log('DeliverablePanel - deliverable_type:', task.deliverable_type);

    // Check for structured deliverable first (workshop schema-based custom forms)
    if (task.deliverable_schema) {
      return <StructuredSubmission {...commonProps} schema={task.deliverable_schema} />;
    }

    // For all standard deliverable types (text, link, document, video), use FlexibleSubmission
    // This gives builders the 3-option selector (Text, Google Drive Link, Video)
    return <FlexibleSubmission {...commonProps} />;
  };

  return (
    <div className="deliverable-panel">
      <div className="deliverable-panel__overlay" onClick={handleClose} />
      
      <div className={`deliverable-panel__content ${isClosing ? 'deliverable-panel__content--closing' : ''}`}>
        {/* Header */}
        <div className="deliverable-panel__header">
          <div className="deliverable-panel__title-wrapper">
            <h2 className="deliverable-panel__title">{task.title}</h2>
            {currentSubmission && currentSubmission.task_id === task.id && (
              <div className="deliverable-panel__submitted-badge" title="Submitted">
                <FaCheckCircle />
              </div>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="deliverable-panel__close-btn"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Deliverable label - Only show for structured submissions (workshops) */}
        {task.deliverable_schema && (
          <div className="deliverable-panel__label">
            <span className="deliverable-panel__label-text">
              {task.deliverable || 'Submit your work'}
            </span>
          </div>
        )}

        {/* Body - Dynamic submission form */}
        <div className="deliverable-panel__body">
          {getSubmissionComponent()}
        </div>
      </div>
    </div>
  );
}

export default DeliverablePanel;

