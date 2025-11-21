import React from 'react';
import { FaCheckCircle, FaFileAlt, FaLink, FaVideo, FaClipboardCheck } from 'react-icons/fa';
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

  const renderSelfSubmission = () => {
    const responses = submissionData.responses || {};
    const sectionTimes = submissionData.sectionTimes || {};
    
    // Section titles
    const SECTION_TITLES = {
      1: 'Product & Business Thinking',
      2: 'Professional & Learning Skills',
      3: 'AI Direction & Collaboration',
      4: 'Technical Concepts & Integration'
    };
    
    // Calculate section scores (simplified version - actual scoring would be done server-side)
    const calculateSectionScore = (sectionNum) => {
      const sectionResponses = Object.entries(responses).filter(([id]) => {
        const questionId = parseInt(id);
        return questionId > (sectionNum - 1) * 5 && questionId <= sectionNum * 5;
      });
      
      const answeredCount = sectionResponses.filter(([_, value]) => value !== undefined && value !== '').length;
      return `${answeredCount}/5 questions answered`;
    };
    
    return (
      <div className="submission-display">
        <div className="submission-display__header">
          <FaClipboardCheck className="submission-display__icon" />
          <h3>Self Assessment Results</h3>
        </div>
        
        <div className="submission-display__content">
          {/* Summary */}
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Assessment Summary
            </div>
            <div className="submission-display__value">
              <div className="self-assessment-summary">
                <div className="self-assessment-summary__row">
                  <div className="self-assessment-summary__label">Questions Answered:</div>
                  <div className="self-assessment-summary__value">
                    {Object.values(responses).filter(v => v !== undefined && v !== '').length}/20
                  </div>
                </div>
                <div className="self-assessment-summary__row">
                  <div className="self-assessment-summary__label">Completion Time:</div>
                  <div className="self-assessment-summary__value">
                    {submissionData.completionTime ? 
                      new Date(submissionData.completionTime).toLocaleString() : 
                      'Not completed'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Scores */}
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Section Completion
            </div>
            <div className="submission-display__value">
              <div className="self-assessment-sections">
                {[1, 2, 3, 4].map(sectionNum => (
                  <div key={sectionNum} className="self-assessment-section">
                    <div className="self-assessment-section__header">
                      <div className="self-assessment-section__title">
                        Section {sectionNum}: {SECTION_TITLES[sectionNum]}
                      </div>
                      <div className="self-assessment-section__score">
                        {calculateSectionScore(sectionNum)}
                      </div>
                    </div>
                    <div className="self-assessment-section__time">
                      Time spent: {sectionTimes[sectionNum] ? 
                        `${Math.round(sectionTimes[sectionNum] / 60)} minutes` : 
                        'Not recorded'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Note about detailed responses */}
          <div className="submission-display__item">
            <div className="submission-display__note">
              <strong>Note:</strong> Detailed question responses and scoring are available to staff for review. 
              This assessment helps us understand your current skills and confidence to provide better support 
              throughout the program.
            </div>
          </div>
        </div>
      </div>
    );
  };

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
