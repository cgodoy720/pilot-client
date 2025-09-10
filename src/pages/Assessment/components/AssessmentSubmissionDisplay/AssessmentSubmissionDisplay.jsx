import React from 'react';
import { FaCheckCircle, FaFileAlt, FaLink, FaVideo } from 'react-icons/fa';
import './AssessmentSubmissionDisplay.css';

function AssessmentSubmissionDisplay({ assessmentType, submissionData }) {
  if (!submissionData || Object.keys(submissionData).length === 0) {
    return null;
  }

  const renderBusinessSubmission = () => (
    <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            Problem Statement
          </div>
          <div className="submission-display__value">
            {submissionData.problemStatement || 'No problem statement provided'}
          </div>
        </div>
        
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            Proposed Solution
          </div>
          <div className="submission-display__value">
            {submissionData.proposedSolution || 'No proposed solution provided'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalSubmission = () => (
    <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            AI Conversation
          </div>
          <div className="submission-display__value submission-display__value--conversation">
            {submissionData.conversationText || 'No conversation provided'}
          </div>
        </div>
        
        {submissionData.githubUrl && (
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaLink className="submission-display__item-icon" />
              GitHub/Deployed Link
            </div>
            <div className="submission-display__value">
              <a 
                href={submissionData.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="submission-display__link"
              >
                {submissionData.githubUrl}
              </a>
            </div>
          </div>
        )}
        
        {submissionData.files && submissionData.files.length > 0 && (
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Uploaded Files
            </div>
            <div className="submission-display__value">
              <ul className="submission-display__file-list">
                {submissionData.files.map((file, index) => (
                  <li key={index} className="submission-display__file-item">
                    {file.name} ({file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfessionalSubmission = () => (
    <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaVideo className="submission-display__item-icon" />
            Pitch Recording
          </div>
          <div className="submission-display__value">
            <a 
              href={submissionData.loomUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="submission-display__link"
            >
              {submissionData.loomUrl || 'No Loom URL provided'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelfSubmission = () => (
    <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            Self Assessment Response
          </div>
          <div className="submission-display__value">
            {submissionData.response || 'No response provided'}
          </div>
        </div>
      </div>
    </div>
  );

  switch (assessmentType) {
    case 'business':
      return renderBusinessSubmission();
    case 'technical':
      return renderTechnicalSubmission();
    case 'professional':
      return renderProfessionalSubmission();
    case 'self':
      return renderSelfSubmission();
    default:
      return (
        <div className="submission-display">
          <div className="submission-display__header">
            <FaCheckCircle className="submission-display__icon" />
            <h3>Submitted Deliverables</h3>
          </div>
          <div className="submission-display__content">
            <pre>{JSON.stringify(submissionData, null, 2)}</pre>
          </div>
        </div>
      );
  }
}

export default AssessmentSubmissionDisplay;
