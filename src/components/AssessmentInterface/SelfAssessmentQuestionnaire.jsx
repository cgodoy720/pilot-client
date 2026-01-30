import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import ArrowButton from '../ArrowButton/ArrowButton';
import './SelfAssessmentQuestionnaire.css';

// Question data (same as SelfAssessmentPage)
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

const SelfAssessmentQuestionnaire = ({ 
  assessmentId, 
  taskId, 
  onComplete, 
  isCompleted = false,
  onShowInstructions 
}) => {
  const { token, user } = useAuth();
  const isActive = user?.active !== false;

  // Form state
  const [formData, setFormData] = useState({
    responses: {},
    currentSection: 1,
    currentQuestion: 1,
    startTime: new Date().toISOString(),
    sectionTimes: {},
    questionTimes: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  // Track section and question start times
  const [sectionStartTime, setSectionStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());

  // Load existing submission
  useEffect(() => {
    if (assessmentId && token) {
      loadExistingSubmission();
    }
  }, [assessmentId, token]);

  // Initialize section/question start times when they change
  useEffect(() => {
    setSectionStartTime(new Date());
    setQuestionStartTime(new Date());
  }, [formData.currentSection, formData.currentQuestion]);

  const loadExistingSubmission = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.submission && data.submission.submission_data) {
          setExistingSubmission(data.submission);
          const submissionData = data.submission.submission_data;
          
          setFormData(prev => ({
            ...prev,
            responses: submissionData.responses || {},
            startTime: submissionData.startTime || prev.startTime,
            sectionTimes: submissionData.sectionTimes || {},
            questionTimes: submissionData.questionTimes || {},
            completionTime: submissionData.completionTime,
            // If submitted, start at first question for review
            currentSection: data.submission.status === 'submitted' ? 1 : prev.currentSection,
            currentQuestion: data.submission.status === 'submitted' ? 1 : prev.currentQuestion
          }));
        }
      }
    } catch (err) {
      console.error('Error loading existing submission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get questions for current section
  const currentSectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === formData.currentSection);
  
  // Get current question
  const currentQuestion = currentSectionQuestions.find(q => q.id === formData.currentQuestion) || currentSectionQuestions[0];
  
  // Get all questions flattened for total count
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuestionIndex = ASSESSMENT_QUESTIONS.findIndex(q => q.id === currentQuestion.id);

  // Check if current section is complete
  const isSectionComplete = (sectionNum = formData.currentSection) => {
    const sectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === sectionNum);
    return sectionQuestions.every(question => {
      return formData.responses[question.id] !== undefined && 
             formData.responses[question.id] !== '';
    });
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
    if (isCompleted || isSubmitting) return;
    
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
    setError(null);
  };

  // Handle question navigation
  const handleQuestionChange = (direction) => {
    if (isCompleted || isSubmitting) return;

    const currentIndex = currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion);
    const nextIndex = currentIndex + (direction === 'next' ? 1 : -1);
    
    // Calculate time spent on current question
    const questionEndTime = new Date();
    const questionDuration = (questionEndTime - questionStartTime) / 1000; // in seconds
    
    // Moving to next question
    if (direction === 'next') {
      // Validate current question
      if (!formData.responses[formData.currentQuestion]) {
        setError('Please answer this question before continuing.');
        return;
      }

      // If moving past the last question in a section
      if (nextIndex >= currentSectionQuestions.length) {
        if (formData.currentSection < 4) {
          // Calculate section time
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
          
          // Save draft
          saveAssessmentData('draft');
        } else {
          // Last question of last section - submit
          handleSubmit();
        }
        return;
      }
    }
    
    // Moving to previous question
    if (direction === 'prev') {
      // If moving before the first question in a section
      if (nextIndex < 0) {
        if (formData.currentSection > 1) {
          // Calculate section time
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
          
          // Save draft
          saveAssessmentData('draft');
        }
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
      currentQuestion: currentSectionQuestions[nextIndex]?.id || prev.currentQuestion
    }));
    
    // Reset question timer
    setQuestionStartTime(new Date());
    
    // Save draft
    saveAssessmentData('draft');
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
        return true;
      } else {
        console.error('Failed to save assessment data:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error saving assessment data:', error);
      return false;
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!isAssessmentComplete()) {
      setError('Please complete all questions before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const success = await saveAssessmentData('submitted');
    
    if (success) {
      toast.success('Assessment submitted successfully! 🎉', {
        duration: 3000
      });
      
      // Call onComplete to mark task as complete
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } else {
      setError('Failed to submit assessment. Please try again.');
      toast.error('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const response = formData.responses[question.id] || '';
    
    switch (question.type) {
      case 'likert':
        const firstOption = question.options[0];
        const lastOption = question.options[question.options.length - 1];
        // Extract label text (remove "1 - " or "5 - " prefix)
        const leftLabel = firstOption.label.replace(/^\d+\s*-\s*/, '');
        const rightLabel = lastOption.label.replace(/^\d+\s*-\s*/, '');
        
        return (
          <div className="self-assessment-questionnaire__likert">
            <div className="self-assessment-questionnaire__likert-container">
              <div className="self-assessment-questionnaire__likert-options">
                {question.options.map((option, index) => {
                  const isFirst = index === 0;
                  const isLast = index === question.options.length - 1;
                  const showLabel = (isFirst && leftLabel) || (isLast && rightLabel);
                  const labelText = isFirst ? leftLabel : (isLast ? rightLabel : '');
                  
                  return (
                    <div 
                      key={option.value}
                      className="self-assessment-questionnaire__likert-option-wrapper"
                    >
                      <button
                        type="button"
                        className={`self-assessment-questionnaire__likert-button ${
                          response === option.value ? 'self-assessment-questionnaire__likert-button--selected' : ''
                        }`}
                        onClick={() => handleResponseChange(question.id, option.value)}
                        disabled={isSubmitting || isCompleted}
                      >
                        <span>{option.value}</span>
                      </button>
                      {showLabel && (
                        <span className="self-assessment-questionnaire__likert-label">
                          {labelText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
        
      case 'multiple-choice':
        return (
          <div className="self-assessment-questionnaire__multiple-choice">
            {question.options.map(option => (
              <div 
                key={option.value} 
                className={`self-assessment-questionnaire__mc-option ${
                  response === option.value ? 'self-assessment-questionnaire__mc-option--selected' : ''
                }`}
                onClick={() => handleResponseChange(question.id, option.value)}
              >
                <div className="self-assessment-questionnaire__mc-indicator">
                  {response === option.value && <FaCheck />}
                </div>
                <div className="self-assessment-questionnaire__mc-label">{option.label}</div>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="self-assessment-questionnaire self-assessment-questionnaire--loading">
        <div className="self-assessment-questionnaire__loading">
          <FaSpinner className="self-assessment-questionnaire__loading-icon" />
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-questionnaire">
      {/* Completed Banner */}
      {isCompleted && (
        <div className="self-assessment-questionnaire__completed-banner">
          <FaCheckCircle className="self-assessment-questionnaire__completed-icon" />
          <span>Assessment Completed - Read Only</span>
        </div>
      )}

      {/* Header */}
      <div className="self-assessment-questionnaire__header">
        <div className="self-assessment-questionnaire__header-top">
          <div className="self-assessment-questionnaire__progress">
            <span className="self-assessment-questionnaire__progress-text">
              Section {formData.currentSection}: {SECTION_TITLES[formData.currentSection]}
            </span>
          </div>
          
          {onShowInstructions && (
            <button
              onClick={onShowInstructions}
              className="self-assessment-questionnaire__instructions-button"
              title="View Instructions"
            >
              <FaInfoCircle className="self-assessment-questionnaire__instructions-icon" />
              Instructions
            </button>
          )}
        </div>
        
        <div className="self-assessment-questionnaire__question-number">
          Question {String(currentQuestionIndex + 1).padStart(2, '0')} of {String(totalQuestions).padStart(2, '0')}
        </div>
        
        <h2 className="self-assessment-questionnaire__question">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Question Content */}
      <div className="self-assessment-questionnaire__content">
        {renderQuestion(currentQuestion)}
        
        {/* Error Message */}
        {error && (
          <div className="self-assessment-questionnaire__error">
            {error}
          </div>
        )}
      </div>

      {/* Navigation - Hidden when assessment is complete */}
      {!isCompleted && (
        <div className="self-assessment-questionnaire__navigation">
          <ArrowButton
            onClick={() => handleQuestionChange('prev')}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            borderColor="#4242EA"
            backgroundColor="var(--color-bg-light)"
            arrowColor="#4242EA"
            hoverBackgroundColor="#4242EA"
            hoverArrowColor="white"
            size="lg"
            rotation={180}
            useChevron={true}
            strokeWidth={1}
            className="self-assessment-questionnaire__nav-button"
          />
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              type="button"
              className="self-assessment-questionnaire__nav-button self-assessment-questionnaire__nav-button--submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !isAssessmentComplete()}
            >
              {isSubmitting ? (
                <FaSpinner className="self-assessment-questionnaire__nav-button-icon--spinning" />
              ) : (
                <FaCheckCircle />
              )}
            </button>
          ) : (
            <ArrowButton
              onClick={() => handleQuestionChange('next')}
              disabled={isSubmitting}
              borderColor="#4242EA"
              backgroundColor="var(--color-bg-light)"
              arrowColor="#4242EA"
              hoverBackgroundColor="#4242EA"
              hoverArrowColor="white"
              size="lg"
              useChevron={true}
              strokeWidth={1}
              className="self-assessment-questionnaire__nav-button"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentQuestionnaire;

