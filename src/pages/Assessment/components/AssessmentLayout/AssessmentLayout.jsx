import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import AssessmentLLMChat from '../AssessmentLLMChat/AssessmentLLMChat';
import AssessmentSubmissionPanel from '../AssessmentSubmissionPanel/AssessmentSubmissionPanel';
import './AssessmentLayout.css';

function AssessmentLayout({ readonly = false }) {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // Assessment data
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Conversation state (separate from submission)
  const [conversationState, setConversationState] = useState({
    threadId: null,
    messages: [],
    isLoading: false,
    error: null
  });
  
  // Submission state (type-specific)
  const [submissionState, setSubmissionState] = useState({
    data: {},
    isDraft: true,
    lastSaved: null,
    isLoading: false
  });
  
  // UI state
  const [isSubmissionPanelOpen, setIsSubmissionPanelOpen] = useState(false);
  const [hasShownInstructions, setHasShownInstructions] = useState(false);

  // Fetch assessment data
  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  // Show instructions on first load
  useEffect(() => {
    if (assessment && !hasShownInstructions) {
      showInstructions();
      setHasShownInstructions(true);
    }
  }, [assessment, hasShownInstructions]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const endpoint = readonly 
        ? `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/readonly`
        : `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        
        // Load existing submission if exists
        if (data.submission) {
          setSubmissionState(prev => ({
            ...prev,
            data: data.submission.submission_data || {},
            isDraft: data.submission.status !== 'submitted',
            lastSaved: data.submission.updated_at
          }));
          
          // Load existing conversation data if exists
          if (data.submission.llm_conversation_data) {
            setConversationState(prev => ({
              ...prev,
              messages: data.submission.llm_conversation_data.messages || [],
              threadId: data.submission.llm_conversation_data.thread_id || null
            }));
          }
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

  const formatInstructions = (text) => {
    if (!text) return 'Instructions will be loaded...';
    
    let formattedText = '';
    const sections = text.split('\n\n');
    
    sections.forEach((section) => {
      const lines = section.split('\n');
      
      if (section.includes('Things you might want to explore:')) {
        const mainText = lines[0].replace('Things you might want to explore:', '').trim();
        if (mainText) {
          formattedText += `<p>${mainText}</p>`;
        }
        formattedText += `<p><strong>Things you might want to explore:</strong></p><ul>`;
        lines.slice(1).forEach(line => {
          const trimmed = line.trim();
          if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
            const cleanLine = trimmed.replace(/^[-•]\s*/, '');
            formattedText += `<li>${cleanLine}</li>`;
          }
        });
        formattedText += `</ul>`;
      } else if (section.includes('Deliverables:')) {
        formattedText += `<p><strong>Deliverables:</strong></p><ul>`;
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.includes('Deliverables:')) {
            const cleanLine = trimmed.replace(/^[-•]\s*/, '');
            if (cleanLine) {
              formattedText += `<li>${cleanLine}</li>`;
            }
          }
        });
        formattedText += `</ul>`;
      } else {
        const cleanSection = section.trim();
        if (cleanSection) {
          formattedText += `<p>${cleanSection.replace(/\n/g, '<br>')}</p>`;
        }
      }
    });
    return formattedText;
  };

  const showInstructions = () => {
    Swal.fire({
      title: 'Assessment Instructions',
      html: formatInstructions(assessment?.instructions),
      showCancelButton: false,
      confirmButtonText: 'Got it, let\'s start!',
      confirmButtonColor: '#4242ea',
      width: '600px',
      background: '#1A1F2C',
      color: 'var(--color-text-primary)',
      customClass: {
        popup: 'swal2-popup-dark',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-html-custom',
        confirmButton: 'swal2-confirm-custom',
        actions: 'swal2-actions-custom'
      }
    });
  };

  const handleConversationUpdate = (conversationData) => {
    // Auto-save conversation data separately
    saveConversationData(conversationData);
  };

  const handleSubmissionUpdate = (submissionData) => {
    // Update submission state
    setSubmissionState(prev => ({
      ...prev,
      data: submissionData,
      isDraft: true,
      lastSaved: new Date().toISOString()
    }));
    
    // Auto-save submission data
    saveSubmissionData(submissionData, 'draft');
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
      console.error('Error saving conversation:', error);
    }
  };

  const saveSubmissionData = async (submissionData, status = 'draft') => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submission_data: submissionData,
          status: status
        })
      });
    } catch (error) {
      console.error('Error saving submission:', error);
    }
  };

  const handleFinalSubmission = async (submissionData) => {
    try {
      setSubmissionState(prev => ({ ...prev, isLoading: true }));
      
      await saveSubmissionData(submissionData, 'submitted');
      
      setSubmissionState(prev => ({
        ...prev,
        data: submissionData,
        isDraft: false,
        isLoading: false,
        lastSaved: new Date().toISOString()
      }));

      // Show success message
      Swal.fire({
        title: 'Assessment Submitted!',
        text: 'Your assessment has been successfully submitted.',
        icon: 'success',
        confirmButtonColor: '#28a745',
        background: '#1A1F2C',
        color: 'var(--color-text-primary)'
      });

      // Close submission panel
      setIsSubmissionPanelOpen(false);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setSubmissionState(prev => ({ ...prev, isLoading: false }));
      
      Swal.fire({
        title: 'Submission Failed',
        text: 'There was an error submitting your assessment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        background: '#1A1F2C',
        color: 'var(--color-text-primary)'
      });
    }
  };

  const getAssessmentTypeName = (type) => {
    const typeMap = {
      'business': 'Business Assessment',
      'technical': 'Technical Assessment',
      'professional': 'Professional Assessment',
      'self': 'Self Assessment'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="assessment-layout">
        <div className="assessment-layout__loading">
          <div className="assessment-layout__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="assessment-layout">
        <div className="assessment-layout__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/assessment')} className="assessment-layout__back-btn">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-layout">
      {/* Main Content Area - Chat takes up full space */}
      <div className="assessment-layout__content">
        
        {/* LLM Chat Section - Always prominent with integrated buttons */}
        <div className="assessment-layout__chat-section">
          <AssessmentLLMChat
            assessmentId={assessmentId}
            onConversationUpdate={readonly ? null : handleConversationUpdate}
            initialConversation={conversationState}
            disabled={readonly || submissionState.isLoading}
            onShowInstructions={showInstructions}
            onBackToAssessments={() => navigate('/assessment')}
            onSubmitDeliverables={readonly ? null : () => setIsSubmissionPanelOpen(!isSubmissionPanelOpen)}
            isSubmissionPanelOpen={isSubmissionPanelOpen}
            readonly={readonly}
          />
        </div>

        {/* Sliding Submission Panel */}
        {!readonly && isSubmissionPanelOpen && (
          <AssessmentSubmissionPanel
            assessmentType={assessment.assessment_type}
            submissionData={submissionState.data}
            isDraft={submissionState.isDraft}
            isLoading={submissionState.isLoading}
            onUpdate={handleSubmissionUpdate}
            onSubmit={handleFinalSubmission}
            onClose={() => setIsSubmissionPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default AssessmentLayout;
