import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import './SelfAssessmentPage.css';

// Question data
const ASSESSMENT_QUESTIONS = [
  // Section 1: Product & Business Thinking
  {
    id: 1,
    section: 1,
    type: 'likert',
    question: 'I demonstrate the ability to identify core problems and clearly articulate their value propositions.',
    options: [
      { value: 1, label: '1 - Strongly Disagree' },
      { value: 2, label: '2 - Disagree' },
      { value: 3, label: '3 - Neutral' },
      { value: 4, label: '4 - Agree' },
      { value: 5, label: '5 - Strongly Agree' }
    ]
  },
  {
    id: 2,
    section: 1,
    type: 'multiple-choice',
    question: 'What\'s the most effective first step when validating a product idea?',
    options: [
      { value: 'A', label: 'Build a prototype and test it directly with a small group of target users', points: 4 },
      { value: 'B', label: 'Conduct interviews and research to understand user pain points before creating anything', points: 5 },
      { value: 'C', label: 'Launch a limited version of the product to paying customers and learn from adoption', points: 3 },
      { value: 'D', label: 'Review competitor offerings and identify gaps before deciding what to test', points: 2 }
    ],
    correctAnswer: 'B'
  },
  
  // Section 2: Professional & Learning Skills
  {
    id: 3,
    section: 2,
    type: 'likert',
    question: 'I demonstrate strong time management skills to consistently meet deadlines.',
    options: [
      { value: 1, label: '1 - Strongly Disagree' },
      { value: 2, label: '2 - Disagree' },
      { value: 3, label: '3 - Neutral' },
      { value: 4, label: '4 - Agree' },
      { value: 5, label: '5 - Strongly Agree' }
    ]
  },
  {
    id: 4,
    section: 2,
    type: 'likert',
    question: 'I actively seek and incorporate feedback to improve the quality of my work.',
    options: [
      { value: 1, label: '1 - Strongly Disagree' },
      { value: 2, label: '2 - Disagree' },
      { value: 3, label: '3 - Neutral' },
      { value: 4, label: '4 - Agree' },
      { value: 5, label: '5 - Strongly Agree' }
    ]
  },
  {
    id: 5,
    section: 2,
    type: 'multiple-choice',
    question: 'When you get stuck on a problem, which approach do you usually take?',
    options: [
      { value: 'A', label: 'Break the problem into smaller pieces, try different approaches, and research possible solutions', points: 5 },
      { value: 'B', label: 'Look for existing examples or documentation before attempting solutions on your own', points: 4 },
      { value: 'C', label: 'Ask for help after making some effort, but without over-investing time', points: 3 },
      { value: 'D', label: 'Keep pushing with one approach until it works, even if it takes a long time', points: 1 }
    ],
    correctAnswer: 'A'
  },
  
  // Section 3: AI Direction & Collaboration
  {
    id: 6,
    section: 3,
    type: 'likert',
    question: 'I leverage AI tools to support decision-making and generate high-quality content.',
    options: [
      { value: 1, label: '1 - Strongly Disagree' },
      { value: 2, label: '2 - Disagree' },
      { value: 3, label: '3 - Neutral' },
      { value: 4, label: '4 - Agree' },
      { value: 5, label: '5 - Strongly Agree' }
    ]
  },
  {
    id: 7,
    section: 3,
    type: 'multiple-choice',
    question: 'How do you judge whether to trust AI-generated recommendations?',
    options: [
      { value: 'A', label: 'Compare outputs against your own reasoning and domain knowledge before using them', points: 4 },
      { value: 'B', label: 'Cross-check with external data or experts, especially when stakes are high', points: 5 },
      { value: 'C', label: 'Use AI outputs mainly as a starting point or draft, not as final answers', points: 3 },
      { value: 'D', label: 'Accept AI outputs directly to save time unless there\'s an obvious error', points: 1 }
    ],
    correctAnswer: 'B'
  },
  
  // Section 4: Technical Concepts & Integration
  {
    id: 8,
    section: 4,
    type: 'likert',
    question: 'I demonstrate the ability to estimate technical effort and plan projects with scalability in mind.',
    options: [
      { value: 1, label: '1 - Strongly Disagree' },
      { value: 2, label: '2 - Disagree' },
      { value: 3, label: '3 - Neutral' },
      { value: 4, label: '4 - Agree' },
      { value: 5, label: '5 - Strongly Agree' }
    ]
  },
  {
    id: 9,
    section: 4,
    type: 'multiple-choice',
    question: 'When planning how to implement a new feature, what\'s your general process?',
    options: [
      { value: 'A', label: 'Clarify requirements, outline the architecture, break into tasks, then code and test iteratively', points: 5 },
      { value: 'B', label: 'Sketch out a quick proof of concept first to see if it\'s technically feasible before committing', points: 4 },
      { value: 'C', label: 'Research how similar problems are solved and adapt an existing pattern or library', points: 3 },
      { value: 'D', label: 'Start with the simplest possible implementation and plan to improve later if it scales', points: 2 }
    ],
    correctAnswer: 'A'
  }
];

// Section titles
const SECTION_TITLES = {
  1: 'Product & Business Thinking',
  2: 'Professional & Learning Skills',
  3: 'AI Direction & Collaboration',
  4: 'Technical Concepts & Integration'
};

function SelfAssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Assessment data
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [hasShownInstructions, setHasShownInstructions] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    responses: {},
    currentSection: 1,
    currentQuestion: 1,
    startTime: new Date().toISOString(),
    sectionTimes: {},
    questionTimes: {}
  });

  // Track section and question completion time
  const [sectionStartTime, setSectionStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  
  // Fetch assessment data
  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);
  
  // Show instructions on first load
  useEffect(() => {
    if (assessment && !isReadOnly && !hasShownInstructions) {
      showInstructions();
      setHasShownInstructions(true);
    }
  }, [assessment, isReadOnly, hasShownInstructions]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      
      // Check if we're in read-only mode
      const isReadOnlyMode = window.location.pathname.includes('/readonly');
      setIsReadOnly(isReadOnlyMode);
      
      // Determine endpoint based on mode
      const endpoint = isReadOnlyMode
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
          const submissionData = data.submission.submission_data || {};
          
          setFormData(prev => ({
            ...prev,
            responses: submissionData.responses || {},
            startTime: submissionData.startTime || prev.startTime,
            sectionTimes: submissionData.sectionTimes || {},
            questionTimes: submissionData.questionTimes || {},
            completionTime: submissionData.completionTime,
            // If submitted or read-only, set to first section and question for review
            currentSection: (data.submission.status === 'submitted' || isReadOnlyMode) ? 1 : prev.currentSection,
            currentQuestion: (data.submission.status === 'submitted' || isReadOnlyMode) ? 1 : prev.currentQuestion
          }));
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

  const showInstructions = () => {
    Swal.fire({
      title: 'Self Assessment',
      html: `
        <div class="self-assessment-instructions">
          <p>This 9-question assessment helps us understand your current confidence and skills across four key areas:</p>
          <ol>
            <li>Product & Business Thinking</li>
            <li>Professional & Learning Skills</li>
            <li>AI Direction & Collaboration</li>
            <li>Technical Concepts & Integration</li>
          </ol>
          <p>Your honest responses will help us provide better support throughout the program.</p>
          <p>The assessment should take about 10-15 minutes to complete.</p>
        </div>
      `,
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


  // Get questions for current section
  const currentSectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === formData.currentSection);
  
  // Get current question
  const currentQuestion = currentSectionQuestions.find(q => q.id === formData.currentQuestion) || currentSectionQuestions[0];

  // Check if current section is complete
  const isSectionComplete = (sectionNum = formData.currentSection) => {
    const sectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === sectionNum);
    return sectionQuestions.every(question => {
      return formData.responses[question.id] !== undefined && 
             formData.responses[question.id] !== '';
    });
  };

  // Get section completion percentage
  const getSectionCompletionPercentage = (sectionNum) => {
    const sectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === sectionNum);
    const answeredQuestions = sectionQuestions.filter(question => 
      formData.responses[question.id] !== undefined && formData.responses[question.id] !== ''
    );
    return Math.round((answeredQuestions.length / sectionQuestions.length) * 100);
  };

  // Check if entire assessment is complete
  const isAssessmentComplete = () => {
    return ASSESSMENT_QUESTIONS.every(question => {
      return formData.responses[question.id] !== undefined && 
             formData.responses[question.id] !== '';
    });
  };

  // Handle response changes
  const handleResponseChange = (questionId, value) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
  };

  // Handle question navigation
  const handleQuestionChange = (direction) => {
    if (isReadOnly) {
      // In read-only mode, just change question without tracking time
      const nextQuestionIndex = currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) + (direction === 'next' ? 1 : -1);
      
      // If moving past the last question in a section
      if (nextQuestionIndex >= currentSectionQuestions.length) {
        if (formData.currentSection < 4) {
          // Move to next section, first question
          setFormData(prev => ({
            ...prev,
            currentSection: prev.currentSection + 1,
            currentQuestion: ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1)?.id || 1
          }));
        }
        return;
      }
      
      // If moving before the first question in a section
      if (nextQuestionIndex < 0) {
        if (formData.currentSection > 1) {
          // Move to previous section, last question
          const prevSectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === formData.currentSection - 1);
          setFormData(prev => ({
            ...prev,
            currentSection: prev.currentSection - 1,
            currentQuestion: prevSectionQuestions[prevSectionQuestions.length - 1]?.id || 1
          }));
        }
        return;
      }
      
      // Regular question navigation within section
      setFormData(prev => ({
        ...prev,
        currentQuestion: currentSectionQuestions[nextQuestionIndex]?.id || prev.currentQuestion
      }));
      return;
    }
    
    // Save question completion time
    const questionEndTime = new Date();
    const questionDuration = (questionEndTime - questionStartTime) / 1000; // in seconds
    
    const nextQuestionIndex = currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) + (direction === 'next' ? 1 : -1);
    
    // If moving past the last question in a section
    if (nextQuestionIndex >= currentSectionQuestions.length) {
      if (formData.currentSection < 4) {
        // Save section completion time
        const sectionEndTime = new Date();
        const sectionDuration = (sectionEndTime - sectionStartTime) / 1000; // in seconds
        
        // Move to next section, first question
        setFormData(prev => ({
          ...prev,
          questionTimes: {
            ...prev.questionTimes,
            [prev.currentQuestion]: (prev.questionTimes[prev.currentQuestion] || 0) + questionDuration
          },
          sectionTimes: {
            ...prev.sectionTimes,
            [prev.currentSection]: (prev.sectionTimes[prev.currentSection] || 0) + sectionDuration
          },
          currentSection: prev.currentSection + 1,
          currentQuestion: ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1)?.id || 1
        }));
        
        // Reset timers
        setSectionStartTime(new Date());
        setQuestionStartTime(new Date());
        
        // Save progress
        saveAssessmentData('draft');
        return;
      }
    }
    
    // If moving before the first question in a section
    if (nextQuestionIndex < 0) {
      if (formData.currentSection > 1) {
        // Save section completion time
        const sectionEndTime = new Date();
        const sectionDuration = (sectionEndTime - sectionStartTime) / 1000; // in seconds
        
        // Move to previous section, last question
        const prevSectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === formData.currentSection - 1);
        setFormData(prev => ({
          ...prev,
          questionTimes: {
            ...prev.questionTimes,
            [prev.currentQuestion]: (prev.questionTimes[prev.currentQuestion] || 0) + questionDuration
          },
          sectionTimes: {
            ...prev.sectionTimes,
            [prev.currentSection]: (prev.sectionTimes[prev.currentSection] || 0) + sectionDuration
          },
          currentSection: prev.currentSection - 1,
          currentQuestion: prevSectionQuestions[prevSectionQuestions.length - 1]?.id || 1
        }));
        
        // Reset timers
        setSectionStartTime(new Date());
        setQuestionStartTime(new Date());
        
        // Save progress
        saveAssessmentData('draft');
        return;
      }
    }
    
    // Regular question navigation within section
    setFormData(prev => ({
      ...prev,
      questionTimes: {
        ...prev.questionTimes,
        [prev.currentQuestion]: (prev.questionTimes[prev.currentQuestion] || 0) + questionDuration
      },
      currentQuestion: currentSectionQuestions[nextQuestionIndex]?.id || prev.currentQuestion
    }));
    
    // Reset question timer
    setQuestionStartTime(new Date());
    
    // Save progress
    saveAssessmentData('draft');
  };
  
  // Handle direct section change (from progress bar)
  const handleSectionChange = (sectionNumber) => {
    if (!isReadOnly) return; // Only allow in read-only mode
    
    setFormData(prev => ({
      ...prev,
      currentSection: sectionNumber,
      currentQuestion: ASSESSMENT_QUESTIONS.find(q => q.section === sectionNumber)?.id || 1
    }));
  };

  // Save assessment data
  const saveAssessmentData = async (status) => {
    try {
      // For final submission, add completion time
      let finalFormData = formData;
      if (status === 'submitted') {
        // Save final question and section time
        const questionEndTime = new Date();
        const questionDuration = (questionEndTime - questionStartTime) / 1000; // in seconds
        
        const sectionEndTime = new Date();
        const sectionDuration = (sectionEndTime - sectionStartTime) / 1000; // in seconds
        
        finalFormData = {
          ...formData,
          questionTimes: {
            ...formData.questionTimes,
            [formData.currentQuestion]: (formData.questionTimes[formData.currentQuestion] || 0) + questionDuration
          },
          sectionTimes: {
            ...formData.sectionTimes,
            [formData.currentSection]: (formData.sectionTimes[formData.currentSection] || 0) + sectionDuration
          },
          completionTime: new Date().toISOString()
        };
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submission_data: finalFormData,
          status: status
        })
      });
      
      if (response.ok) {
        if (status === 'submitted') {
          // Show success message
          Swal.fire({
            title: 'Assessment Submitted!',
            text: 'Your self-assessment has been successfully submitted. Thank you!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'Back to Assessments',
            confirmButtonColor: '#28a745',
            background: '#1A1F2C',
            color: 'var(--color-text-primary)',
            customClass: {
              popup: 'swal2-popup-dark',
              confirmButton: 'swal2-confirm-custom'
            }
          }).then(() => {
            navigate('/assessment');
          });
        }
        return true;
      } else {
        console.error('Failed to save assessment data:', response.status);
        if (status === 'submitted') {
          Swal.fire({
            title: 'Submission Failed',
            text: 'There was an error submitting your assessment. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545',
            background: '#1A1F2C',
            color: 'var(--color-text-primary)'
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Error saving assessment data:', error);
      if (status === 'submitted') {
        Swal.fire({
          title: 'Submission Failed',
          text: 'There was an error submitting your assessment. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          background: '#1A1F2C',
          color: 'var(--color-text-primary)'
        });
      }
      return false;
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!isAssessmentComplete()) {
      Swal.fire({
        title: 'Incomplete Assessment',
        text: 'Please complete all questions before submitting.',
        icon: 'warning',
        confirmButtonColor: '#f0ad4e',
        background: '#1A1F2C',
        color: 'var(--color-text-primary)'
      });
      return;
    }
    
    setIsSubmitting(true);
    const success = await saveAssessmentData('submitted');
    if (!success) {
      setIsSubmitting(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const response = formData.responses[question.id] || '';
    
    switch (question.type) {
      case 'likert':
        return (
          <div className="self-assessment__likert">
            <div className="self-assessment__likert-options">
              {question.options.map(option => (
                <div 
                  key={option.value} 
                  className={`self-assessment__likert-option ${response === option.value ? 'self-assessment__likert-option--selected' : ''}`}
                  onClick={() => handleResponseChange(question.id, option.value)}
                >
                  <div className="self-assessment__likert-value">{option.value}</div>
                  <div className="self-assessment__likert-label">{option.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'multiple-choice':
        return (
          <div className="self-assessment__multiple-choice">
            {question.options.map(option => (
              <div 
                key={option.value} 
                className={`self-assessment__mc-option ${response === option.value ? 'self-assessment__mc-option--selected' : ''}`}
                onClick={() => handleResponseChange(question.id, option.value)}
              >
                <div className="self-assessment__mc-indicator">
                  {response === option.value && <FaCheck />}
                </div>
                <div className="self-assessment__mc-label">
                  <strong>{option.value}.</strong> {option.label}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'short-text':
        return (
          <div className="self-assessment__text-response">
            <textarea
              className="self-assessment__text-input self-assessment__text-input--short"
              value={response}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              disabled={isReadOnly}
              rows={3}
            />
            {question.criteria && (
              <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => (
                    <li key={index} className="self-assessment__criteria-item">{criterion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        
      case 'long-text':
        return (
          <div className="self-assessment__text-response">
            <textarea
              className="self-assessment__text-input self-assessment__text-input--long"
              value={response}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              disabled={isReadOnly}
              rows={6}
            />
            {question.criteria && (
              <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => (
                    <li key={index} className="self-assessment__criteria-item">{criterion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="self-assessment-page">
        <div className="self-assessment-page__loading">
          <div className="self-assessment-page__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="self-assessment-page">
        <div className="self-assessment-page__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/assessment')} className="self-assessment-page__back-btn">
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-page">
      {/* Header */}
      <div className="self-assessment-page__header">
        <div className="self-assessment-page__header-spacer"></div>
        
        <div className="self-assessment-page__header-buttons">
          {!isReadOnly && (
            <button 
              onClick={showInstructions} 
              className="self-assessment-page__info-btn"
            >
              View Instructions
            </button>
          )}
          
          <button 
            onClick={() => navigate('/assessment')} 
            className="self-assessment-page__back-btn"
          >
            <FaArrowLeft /> Back to Assessments
          </button>
          
          {isReadOnly && <span className="self-assessment-page__readonly-badge">Read Only</span>}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="self-assessment__progress">
        {[1, 2, 3, 4].map(section => (
          <div 
            key={section} 
            className={`self-assessment__progress-step ${formData.currentSection === section ? 'self-assessment__progress-step--active' : ''} ${isSectionComplete(section) ? 'self-assessment__progress-step--completed' : ''}`}
            onClick={() => isReadOnly && handleSectionChange(section)}
          >
            <div className="self-assessment__progress-number">
              {isSectionComplete(section) ? (
                <FaCheck className="self-assessment__progress-check" />
              ) : (
                `${getSectionCompletionPercentage(section)}%`
              )}
            </div>
            <div className="self-assessment__progress-label">{SECTION_TITLES[section]}</div>
            <div 
              className="self-assessment__progress-bar" 
              style={{ width: `${getSectionCompletionPercentage(section)}%` }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="self-assessment-page__content">
        {/* Section title */}
        {/* <h2 className="self-assessment__section-title">
          Section {formData.currentSection}: {SECTION_TITLES[formData.currentSection]}
        </h2> */}
        
        {/* Question progress indicator */}
        <div className="self-assessment__question-progress">
          {currentSectionQuestions.map((question, index) => (
            <div 
              key={question.id} 
              className={`self-assessment__question-bubble ${question.id === formData.currentQuestion ? 'self-assessment__question-bubble--active' : ''} ${formData.responses[question.id] ? 'self-assessment__question-bubble--answered' : ''}`}
              onClick={() => isReadOnly && setFormData(prev => ({ ...prev, currentQuestion: question.id }))}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Current Question */}
        <div className="self-assessment__questions">
          <div className="self-assessment__question">
            <div className="self-assessment__question-number">
              Question {currentSectionQuestions.findIndex(q => q.id === currentQuestion.id) + 1} of {currentSectionQuestions.length}
            </div>
            <div className="self-assessment__question-text">{currentQuestion.question}</div>
            {renderQuestion(currentQuestion)}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="self-assessment__navigation">
          {/* Previous button - show if not first question in first section */}
          {(formData.currentSection > 1 || currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) > 0) && (
            <button
              className="self-assessment__nav-btn self-assessment__nav-btn--prev"
              onClick={() => handleQuestionChange('prev')}
            >
              <FaArrowLeft /> Previous
            </button>
          )}
          
          {/* Next/Submit button */}
          {formData.currentSection < 4 || currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) < currentSectionQuestions.length - 1 ? (
            <button
              className="self-assessment__nav-btn self-assessment__nav-btn--next"
              onClick={() => handleQuestionChange('next')}
              disabled={!isReadOnly && !formData.responses[currentQuestion.id]}
            >
              Next <FaArrowRight />
            </button>
          ) : (
            !isReadOnly && (
              <button
                className="self-assessment__submit-btn"
                onClick={handleSubmit}
                disabled={!isAssessmentComplete() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default SelfAssessmentPage;
