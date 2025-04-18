import React, { useState, useEffect } from 'react';
import './AnalysisModal.css';

const AnalysisModal = ({ analysis, availableAnalyses, onSwitchAnalysis, onClose }) => {
  if (!analysis) return null;
  
  // Determine which type of analysis this is
  const analysisType = analysis.analysis_type || 'unknown';
  
  // Format the analysis type for display
  const formatAnalysisType = (type) => {
    switch (type) {
      case 'conversation':
        return 'Chat Feedback';
      case 'deliverable':
        return 'Deliverable Feedback';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Check if we have multiple analyses to switch between
  const hasMultipleAnalyses = availableAnalyses && 
    Object.keys(availableAnalyses).length > 0 &&
    onSwitchAnalysis;
  
  return (
    <div className="learning__modal-overlay">
      <div className="learning__modal learning__modal--analysis">
        <div className="learning__modal-header">
          {hasMultipleAnalyses ? (
            <div className="learning__modal-header-content">
              {/* <h3>Analysis Results</h3> */}
              <div className="analysis-type-selector">
                {Object.keys(availableAnalyses).map(type => (
                  <button
                    key={type}
                    className={`analysis-type-btn ${type === analysisType ? 'active' : ''}`}
                    onClick={() => onSwitchAnalysis(type)}
                  >
                    {formatAnalysisType(type)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <h3>Analysis Results</h3>
          )}
          <button className="learning__modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="learning__modal-body">
          {/* Completion Score */}
          {/* <div className="analysis-score">
            <h4>Completion Score</h4>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${Math.min(100, Math.max(0, analysis.analysis_result.completion_score))}%` }}
              ></div>
              <span>{Math.min(100, Math.max(0, Math.round(analysis.analysis_result.completion_score)))}%</span>
            </div>
          </div> */}
          
          <div className="analysis-columns">
            {/* Criteria Met */}
            {analysis.analysis_result.criteria_met && analysis.analysis_result.criteria_met.length > 0 && (
              <div className="analysis-criteria">
                <h4>Criteria Met</h4>
                <ul className="criteria-list">
                  {analysis.analysis_result.criteria_met.map((criterion, index) => (
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
            
            {/* Areas for Improvement */}
            {analysis.analysis_result.areas_for_improvement && analysis.analysis_result.areas_for_improvement.length > 0 && (
              <div className="analysis-improvements">
                <h4>Areas for Improvement</h4>
                <ul className="improvement-list">
                  {analysis.analysis_result.areas_for_improvement.map((area, index) => (
                    <li key={index} className="improvement-item">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Feedback */}
          {analysis.feedback && (
            <div className="analysis-feedback">
              <h4>Feedback</h4>
              <div className="feedback-content">
                {analysis.feedback.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal; 