// @ts-nocheck
import React, { useState, useEffect } from 'react';
import './AnalysisModal.css';

const AnalysisModal = ({ isOpen, onClose, analysisResults, analysisType, availableAnalysisTypes, onSwitchAnalysisType }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentAnalysisType, setCurrentAnalysisType] = useState(analysisType);

  // Reset state when the modal is opened/closed or when analysis type changes
  useEffect(() => {
    if (isOpen) {
      // Set current analysis type from props
      setCurrentAnalysisType(analysisType);
    }
  }, [isOpen, analysisType]);

  // Update current analysis when analysis results or type changes
  useEffect(() => {
    if (analysisResults && Object.keys(analysisResults).length > 0) {
      // For conversation analysis, use the 'conversation' key
      if (currentAnalysisType === 'conversation' && analysisResults.conversation) {
        setCurrentAnalysis(analysisResults.conversation);
      }
      // For deliverable analysis, use the first result available (we no longer have a dropdown)
      else if (currentAnalysisType === 'deliverable') {
        // Just take the first available result
        const firstKey = Object.keys(analysisResults)[0];
        if (firstKey) {
          setCurrentAnalysis(analysisResults[firstKey]);
        } else {
          setCurrentAnalysis(null);
        }
      }
    } else {
      setCurrentAnalysis(null);
    }
  }, [analysisResults, currentAnalysisType]);

  const handleAnalysisTypeChange = (type) => {
    setCurrentAnalysisType(type);
    if (onSwitchAnalysisType) {
      onSwitchAnalysisType(type);
    }
  };
  
  // Format the analysis type for display
  const formatAnalysisType = (type) => {
    switch (type) {
      case 'conversation':
        return 'Chat Feedback';
      case 'deliverable':
        return 'Deliverable Feedback';
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Analysis';
    }
  };
  
  if (!isOpen) return null;
  
  const hasAnalysisTypes = availableAnalysisTypes && availableAnalysisTypes.length > 0;
  const hasAnalysis = currentAnalysis !== null;
  const isDeliverableAnalysis = currentAnalysisType === 'deliverable';
  
  return (
    <div className={`analysis-modal ${isOpen ? 'open' : ''}`}>
      <div className="analysis-modal-content">
        <div className="analysis-modal-header">
          <h2>Analysis Results <span className="analysis-modal__beta-badge">BETA</span></h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Analysis Type Selector */}
        {hasAnalysisTypes && (
          <div className="analysis-type-selector">
            {availableAnalysisTypes.map(type => (
              <button
                key={type}
                className={`analysis-type-btn ${type === currentAnalysisType ? 'active' : ''}`}
                onClick={() => handleAnalysisTypeChange(type)}
              >
                {formatAnalysisType(type)}
              </button>
            ))}
          </div>
        )}
        
        <div className="analysis-modal-body">
          {hasAnalysis ? (
            <div className="analysis-content">
              <div className="analysis-text">
                {currentAnalysis.feedback && (
                  <div className="analysis-feedback">
                    <h4>Feedback</h4>
                    <div className="feedback-content">
                      {currentAnalysis.feedback.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="analysis-columns">
                  {currentAnalysis.criteria_met && currentAnalysis.criteria_met.length > 0 && (
                    <div className="analysis-criteria">
                      <h4>Criteria Met</h4>
                      <ul className="criteria-list">
                        {currentAnalysis.criteria_met.map((criterion, index) => (
                          <li key={index} className="criteria-item">
                            <svg className="criteria-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                              <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" fill="currentColor"></path>
                            </svg>
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentAnalysis.areas_for_improvement && currentAnalysis.areas_for_improvement.length > 0 && (
                    <div className="analysis-improvements">
                      <h4>Areas for Improvement</h4>
                      <ul className="improvement-list">
                        {currentAnalysis.areas_for_improvement.map((area, index) => (
                          <li key={index} className="improvement-item">
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-analysis">
              <p>No analysis available for {isDeliverableAnalysis ? 'your deliverable' : 'the chat'}.</p>
              {isDeliverableAnalysis ? (
                <p className="analysis-instructions">
                  You can analyze your deliverable by clicking the "Analyze This Submission" button 
                  next to your submission in the task view.
                </p>
              ) : (
                <p className="analysis-instructions">
                  You can generate chat feedback by clicking the "Generate AI Feedback" button in the task view.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal; 