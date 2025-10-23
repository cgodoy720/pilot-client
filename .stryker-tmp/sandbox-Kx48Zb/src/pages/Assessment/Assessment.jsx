// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheck, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Assessment.css';

function Assessment() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user has active status
  const isActive = user?.active !== false;

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load assessments');
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Unable to load assessments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (assessment) => {
    // Check for resubmission requirements first
    if (assessment.available && assessment.reason && assessment.reason.includes('resubmission')) {
      return <FaClock className="assessment__status-icon assessment__status-icon--resubmission" />;
    }
    
    // Prioritize submission status over availability
    if (assessment.submission_status === 'submitted') {
      return <FaCheck className="assessment__status-icon assessment__status-icon--completed" />;
    }
    
    if (assessment.submission_status === 'draft') {
      return <FaClock className="assessment__status-icon assessment__status-icon--draft" />;
    }
    
    if (!assessment.available) {
      return <FaLock className="assessment__status-icon assessment__status-icon--locked" />;
    }
    
    return <FaClock className="assessment__status-icon assessment__status-icon--available" />;
  };

  const getStatusText = (assessment) => {
    // Check for resubmission requirements first
    if (assessment.available && assessment.reason && assessment.reason.includes('resubmission')) {
      if (assessment.reason.includes('File resubmission')) {
        return 'Files Required';
      } else if (assessment.reason.includes('Video resubmission')) {
        return 'Video Required';
      } else if (assessment.reason.includes('Files and video resubmission')) {
        return 'Files & Video Required';
      } else {
        return 'Resubmission Required';
      }
    }
    
    // Prioritize submission status over availability
    if (assessment.submission_status === 'submitted') {
      return 'Completed';
    }
    
    if (assessment.submission_status === 'draft') {
      return 'In Progress';
    }
    
    if (!assessment.available) {
      return assessment.reason || 'Locked';
    }
    
    return 'Available';
  };

  const getStatusClass = (assessment) => {
    // Check for resubmission requirements first
    if (assessment.available && assessment.reason && assessment.reason.includes('resubmission')) {
      return 'assessment__status--resubmission';
    }
    
    // Prioritize submission status over availability
    if (assessment.submission_status === 'submitted') {
      return 'assessment__status--completed';
    }
    
    if (assessment.submission_status === 'draft') {
      return 'assessment__status--draft';
    }
    
    if (!assessment.available) {
      return 'assessment__status--locked';
    }
    
    return 'assessment__status--available';
  };

  const handleAssessmentClick = (periodSlug, assessmentType, assessmentId, assessment) => {
    // Allow clicks on available assessments (for active users) or submitted assessments (for viewing)
    if ((!assessment.available || !isActive) && assessment.submission_status !== 'submitted') {
      return;
    }
    
    // Check if this is a resubmission case - go to resubmission mode instead of read-only
    if (assessment.available && assessment.reason && assessment.reason.includes('resubmission')) {
      navigate(`/assessment/${periodSlug}/${assessmentType}/${assessmentId}`);
    } else if (assessment.submission_status === 'submitted') {
      // If assessment is submitted (and NOT resubmission), navigate to read-only mode
      navigate(`/assessment/${periodSlug}/${assessmentType}/${assessmentId}/readonly`);
    } else {
      // Navigate to specific assessment page
      navigate(`/assessment/${periodSlug}/${assessmentType}/${assessmentId}`);
    }
  };

  const createPeriodSlug = (period) => {
    return period.toLowerCase().replace(/\s+/g, '-');
  };

  const createAssessmentTypeSlug = (assessmentType) => {
    return assessmentType.toLowerCase();
  };

  if (loading) {
    return (
      <div className="assessment">
        <div className="assessment__loading">
          <div className="assessment__loading-spinner"></div>
          <p>Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment">
        <div className="assessment__error">
          <h2>Error Loading Assessments</h2>
          <p>{error}</p>
          <button onClick={fetchAssessments} className="assessment__retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment">
      {!isActive && (
        <div className="assessment__inactive-notice">
          <p>You have historical access only and cannot take new assessments.</p>
        </div>
      )}

      {assessments.length === 0 ? (
        <div className="assessment__empty">
          <h2>No Assessments Available</h2>
          <p>Assessments will appear here when they become available based on your program progress.</p>
        </div>
      ) : (
        <div className="assessment__content">
          {assessments.map((period) => (
            <div key={period.period} className="assessment__period">
              <div className="assessment__period-header">
                <h2 className="assessment__period-title">{period.period} Assessment</h2>
                <span className="assessment__period-day">Day {period.trigger_day_number}</span>
              </div>
              
              <div className="assessment__table">
                <div className="assessment__table-header">
                  <div className="assessment__table-col assessment__table-col--type">Assessment Type</div>
                  <div className="assessment__table-col assessment__table-col--status">Status</div>
                  <div className="assessment__table-col assessment__table-col--submitted">Submitted</div>
                  <div className="assessment__table-col assessment__table-col--action">Action</div>
                </div>
                
                {period.assessments.map((assessment) => (
                  <div
                    key={assessment.assessment_id}
                    className={`assessment__table-row ${getStatusClass(assessment)} ${
                      assessment.available && isActive ? 'assessment__table-row--clickable' : ''
                    }`}
                    onClick={() => handleAssessmentClick(
                      createPeriodSlug(period.period),
                      createAssessmentTypeSlug(assessment.assessment_type),
                      assessment.assessment_id,
                      assessment
                    )}
                  >
                    <div className="assessment__table-col assessment__table-col--type">
                      <div className="assessment__table-type">
                        {getStatusIcon(assessment)}
                        <span className="assessment__table-type-text">
                          {assessment.assessment_type === 'business' ? 'Business Assessment' : 
                           assessment.assessment_type === 'technical' ? 'Technical Assessment' :
                           assessment.assessment_type === 'professional' ? 'Professional Assessment' :
                           assessment.assessment_type === 'self' ? 'Self Assessment' :
                           assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1) + ' Assessment'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--status">
                      <span className={`assessment__status ${getStatusClass(assessment)}`}>
                        {getStatusText(assessment)}
                      </span>
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--submitted">
                      {assessment.submitted_at ? (
                        <span className="assessment__submitted-date">
                          {new Date(assessment.submitted_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="assessment__table-empty">—</span>
                      )}
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--action">
                      {(assessment.available && isActive) || assessment.submission_status === 'submitted' ? (
                        <div className="assessment__table-action">
                          <FaExternalLinkAlt className="assessment__table-icon" />
                          <span>
                            {assessment.available && assessment.reason && assessment.reason.includes('resubmission') ? 'Resubmit' :
                             assessment.submission_status === 'submitted' ? 'View' : 'Start'}
                          </span>
                        </div>
                      ) : (
                        <span className="assessment__table-empty">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assessment;
