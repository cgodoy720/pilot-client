// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSave, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import AssessmentLLMChat from '../AssessmentLLMChat/AssessmentLLMChat';
import './BusinessAssessment.css';

function BusinessAssessment() {
  const { token, user } = useAuth();
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [conversationData, setConversationData] = useState(null);
  
  // Modal state
  const [hasShownInstructions, setHasShownInstructions] = useState(false);

  // Check if user has active status
  const isActive = user?.active !== false;

  useEffect(() => {
    fetchAssessmentData();
  }, [assessmentId]);

  useEffect(() => {
    if (assessment && !hasShownInstructions) {
      showInstructionsModal();
      setHasShownInstructions(true);
    }
  }, [assessment, hasShownInstructions]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        setSubmission(data.submission);
        
        // Load existing submission data if available
        if (data.submission) {
          const submissionData = data.submission.submission_data || {};
          setProblemStatement(submissionData.deliverables?.problem_statement?.content || '');
          setProposedSolution(submissionData.deliverables?.proposed_solution?.content || '');
          setConversationData(data.submission.llm_conversation_data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load assessment');
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Unable to load assessment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationUpdate = (conversationData) => {
    setConversationData(conversationData);
    // Auto-save conversation data
    saveConversationData(conversationData);
  };

  const saveConversationData = async (conversationData) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/llm-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_data: conversationData
        })
      });
    } catch (error) {
      console.error('Error saving conversation data:', error);
    }
  };

  const saveDraft = async () => {
    if (!isActive) return;
    
    try {
      setSaving(true);
      
      const submissionData = {
        assessment_type: 'business',
        deliverables: {
          problem_statement: {
            type: 'text',
            content: problemStatement.trim(),
            word_count: problemStatement.trim().split(' ').length,
            submitted_at: new Date().toISOString()
          },
          proposed_solution: {
            type: 'text',
            content: proposedSolution.trim(),
            word_count: proposedSolution.trim().split(' ').length,
            submitted_at: new Date().toISOString()
          }
        },
        metadata: {
          submission_timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submission_data: submissionData,
          status: 'draft'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Unable to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitAssessment = async () => {
    if (!isActive) return;
    
    // Validate required fields
    if (!problemStatement.trim()) {
      setError('Please enter your problem statement.');
      return;
    }
    
    if (!proposedSolution.trim()) {
      setError('Please enter your proposed solution.');
      return;
    }

    try {
      setSubmitting(true);
      
      const submissionData = {
        assessment_type: 'business',
        deliverables: {
          problem_statement: {
            type: 'text',
            content: problemStatement.trim(),
            word_count: problemStatement.trim().split(' ').length,
            submitted_at: new Date().toISOString()
          },
          proposed_solution: {
            type: 'text',
            content: proposedSolution.trim(),
            word_count: proposedSolution.trim().split(' ').length,
            submitted_at: new Date().toISOString()
          }
        },
        metadata: {
          submission_timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submission_data: submissionData,
          status: 'submitted'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
        // Navigate back to main assessment page
        navigate('/assessment');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Unable to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showInstructionsModal = () => {
    // Format instructions text to convert line breaks and create proper lists
    const formatInstructions = (text) => {
      if (!text) return 'Instructions will be loaded...';
      
      let formattedText = '';
      
      // Split the text into sections
      const sections = text.split('\n\n');
      
      sections.forEach((section, index) => {
        const lines = section.split('\n');
        
        if (section.includes('Things you might want to explore:')) {
          // Extract the main paragraph before the list
          const mainText = lines[0].replace('Things you might want to explore:', '').trim();
          if (mainText) {
            formattedText += `<p>${mainText}</p>`;
          }
          
          formattedText += `<p><strong>Things you might want to explore:</strong></p>`;
          formattedText += `<ul>`;
          
          lines.slice(1).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
              const cleanLine = trimmed.replace(/^[-•]\s*/, '');
              formattedText += `<li>${cleanLine}</li>`;
            }
          });
          
          formattedText += `</ul>`;
          
        } else if (section.includes('Deliverables:')) {
          formattedText += `<p><strong>Deliverables:</strong></p>`;
          formattedText += `<ul>`;
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.includes('Deliverables:')) {
              // Clean up any leading dashes or bullets
              const cleanLine = trimmed.replace(/^[-•]\s*/, '');
              if (cleanLine) {
                formattedText += `<li>${cleanLine}</li>`;
              }
            }
          });
          
          formattedText += `</ul>`;
          
        } else {
          // Regular paragraph - handle line breaks within paragraphs
          const cleanSection = section.trim();
          if (cleanSection) {
            formattedText += `<p>${cleanSection.replace(/\n/g, '<br>')}</p>`;
          }
        }
      });
      
      return formattedText;
    };

    Swal.fire({
      title: 'Assessment Instructions',
      html: formatInstructions(assessment?.instructions),
      showCancelButton: false,
      confirmButtonText: 'Got it, let\'s start!',
      confirmButtonColor: '#4242ea',
      width: '600px',
      background: '#1A1F2C', // Using the same background as admin-prompts
      color: 'var(--color-text-primary)', // Using CSS variable for consistency
      customClass: {
        popup: 'swal2-popup-dark',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-html-custom',
        confirmButton: 'swal2-confirm-custom'
      }
    });
  };

  const isSubmitted = submission?.status === 'submitted';
  const canEdit = isActive && !isSubmitted;

  if (loading) {
    return (
      <div className="business-assessment">
        <div className="business-assessment__loading">
          <div className="business-assessment__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="business-assessment">
        <div className="business-assessment__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/assessment')} className="business-assessment__back-btn">
            <FaArrowLeft /> Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-assessment">
      <div className="business-assessment__header">
        <div className="business-assessment__title-section">
          <h1 className="business-assessment__title">{assessment?.assessment_name}</h1>
          {isSubmitted && (
            <div className="business-assessment__submitted-badge">
              <FaCheck /> Submitted
            </div>
          )}
        </div>
        
        <div className="business-assessment__header-buttons">
          <button
            onClick={() => navigate('/assessment')} 
            className="business-assessment__back-btn"
          >
            <FaArrowLeft /> Back to Assessments
          </button>
          
          <button
            onClick={showInstructionsModal}
            className="business-assessment__instructions-btn"
          >
            <FaInfoCircle /> View Instructions
          </button>
        </div>
      </div>

      {!isActive && (
        <div className="business-assessment__inactive-notice">
          <p>You have historical access only and cannot make changes to this assessment.</p>
        </div>
      )}

      {error && (
        <div className="business-assessment__error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')} className="business-assessment__error-close">×</button>
        </div>
      )}

      <div className="business-assessment__content">

        <div className="business-assessment__sections">
          {/* LLM Chat Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              LLM Window to Work Through the Task
            </h2>
            <div className="business-assessment__chat-container">
              <AssessmentLLMChat
                assessmentId={assessmentId}
                onConversationUpdate={handleConversationUpdate}
                initialConversation={conversationData}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Problem Statement Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              Problem Statement <span className="business-assessment__required">*</span>
            </h2>
            <p className="business-assessment__field-description">
              Enter your 1 sentence problem statement below:
            </p>
            <textarea
              className="business-assessment__textarea"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Enter your problem statement here..."
              disabled={!canEdit}
              rows={3}
            />
            <div className="business-assessment__word-count">
              {problemStatement.trim().split(' ').filter(word => word.length > 0).length} words
            </div>
          </div>

          {/* Proposed Solution Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              Proposed Solution <span className="business-assessment__required">*</span>
            </h2>
            <p className="business-assessment__field-description">
              Enter your 1 sentence proposed solution below:
            </p>
            <textarea
              className="business-assessment__textarea"
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Enter your proposed solution here..."
              disabled={!canEdit}
              rows={3}
            />
            <div className="business-assessment__word-count">
              {proposedSolution.trim().split(' ').filter(word => word.length > 0).length} words
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div className="business-assessment__actions">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="business-assessment__save-btn"
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              onClick={submitAssessment}
              disabled={submitting || !problemStatement.trim() || !proposedSolution.trim()}
              className="business-assessment__submit-btn"
            >
              <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="business-assessment__submitted-notice">
            <FaCheck />
            <div>
              <h3>Assessment Submitted Successfully</h3>
              <p>Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessAssessment;
