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
    question: 'How confident are you in identifying real problems and articulating their value proposition to others?',
    options: [
      { value: 1, label: 'Not at all confident' },
      { value: 2, label: 'Slightly confident' },
      { value: 3, label: 'Moderately confident' },
      { value: 4, label: 'Very confident' },
      { value: 5, label: 'Extremely confident' }
    ]
  },
  {
    id: 2,
    section: 1,
    type: 'likert',
    question: 'How effectively can you prioritize features and explain technical trade-offs to stakeholders?',
    options: [
      { value: 1, label: 'Not at all effectively' },
      { value: 2, label: 'Slightly effectively' },
      { value: 3, label: 'Moderately effectively' },
      { value: 4, label: 'Very effectively' },
      { value: 5, label: 'Extremely effectively' }
    ]
  },
  {
    id: 3,
    section: 1,
    type: 'multiple-choice',
    question: 'What\'s the best way to validate a product idea before building it?',
    options: [
      { value: 'A', label: 'Build the full product first to see if people like it' },
      { value: 'B', label: 'Talk to potential users, create prototypes, and test assumptions with minimal investment' },
      { value: 'C', label: 'Rely on your own intuition about what users need' },
      { value: 'D', label: 'Copy what successful competitors are doing' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 4,
    section: 1,
    type: 'short-text',
    question: 'Define "MVP" and explain how it relates to product-market fit.',
    placeholder: 'Write 2-4 sentences...',
    criteria: [
      'Mentions "Minimum Viable Product"',
      'Explains concept of minimal features',
      'Connects to testing/validation',
      'References product-market fit relationship'
    ]
  },
  {
    id: 5,
    section: 1,
    type: 'short-text',
    question: 'Describe a problem in your daily life that technology could solve and your approach to validating it.',
    placeholder: 'Write 3-5 sentences...',
    criteria: [
      'Identifies specific problem',
      'Proposes technology solution',
      'Includes validation method',
      'Shows user-centered thinking'
    ]
  },
  
  // Section 2: Professional & Learning Skills
  {
    id: 6,
    section: 2,
    type: 'likert',
    question: 'How effectively can you document your work and communicate technical concepts to different audiences?',
    options: [
      { value: 1, label: 'Not at all effectively' },
      { value: 2, label: 'Slightly effectively' },
      { value: 3, label: 'Moderately effectively' },
      { value: 4, label: 'Very effectively' },
      { value: 5, label: 'Extremely effectively' }
    ]
  },
  {
    id: 7,
    section: 2,
    type: 'likert',
    question: 'How well can you manage your time, receive feedback, and iterate on your work?',
    options: [
      { value: 1, label: 'Not well at all' },
      { value: 2, label: 'Slightly well' },
      { value: 3, label: 'Moderately well' },
      { value: 4, label: 'Very well' },
      { value: 5, label: 'Extremely well' }
    ]
  },
  {
    id: 8,
    section: 2,
    type: 'multiple-choice',
    question: 'When you get stuck on a problem or need to learn something new, what\'s your approach?',
    options: [
      { value: 'A', label: 'Give up and move on to something else' },
      { value: 'B', label: 'Immediately ask someone else to solve it for me' },
      { value: 'C', label: 'Break down the problem, research solutions, experiment, and ask for help when needed' },
      { value: 'D', label: 'Keep trying the same approach repeatedly' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 9,
    section: 2,
    type: 'short-text',
    question: 'Define "stakeholder communication" and its importance in business contexts.',
    placeholder: 'Write 2-4 sentences...',
    criteria: [
      'Defines stakeholder communication',
      'Identifies key stakeholders',
      'Explains business importance',
      'Shows understanding of clarity/alignment'
    ]
  },
  {
    id: 10,
    section: 2,
    type: 'short-text',
    question: 'How do you plan to continue growing your technical and business skills?',
    placeholder: 'Write 3-5 sentences...',
    criteria: [
      'Specific learning methods mentioned',
      'Balance of technical and business skills',
      'Shows commitment to continuous learning',
      'Realistic and actionable plan'
    ]
  },
  
  // Section 3: AI Direction & Collaboration
  {
    id: 11,
    section: 3,
    type: 'likert',
    question: 'How confident are you in using AI for strategic planning, content creation, and decision-making?',
    options: [
      { value: 1, label: 'Not at all confident' },
      { value: 2, label: 'Slightly confident' },
      { value: 3, label: 'Moderately confident' },
      { value: 4, label: 'Very confident' },
      { value: 5, label: 'Extremely confident' }
    ]
  },
  {
    id: 12,
    section: 3,
    type: 'likert',
    question: 'How effectively can you craft prompts and manage AI workflows across different business functions?',
    options: [
      { value: 1, label: 'Not at all effectively' },
      { value: 2, label: 'Slightly effectively' },
      { value: 3, label: 'Moderately effectively' },
      { value: 4, label: 'Very effectively' },
      { value: 5, label: 'Extremely effectively' }
    ]
  },
  {
    id: 13,
    section: 3,
    type: 'multiple-choice',
    question: 'How do you evaluate the quality of AI-generated analysis or recommendations?',
    options: [
      { value: 'A', label: 'Accept all AI outputs without question' },
      { value: 'B', label: 'Verify accuracy, check for biases, validate with additional sources, and apply critical thinking' },
      { value: 'C', label: 'Reject all AI outputs as unreliable' },
      { value: 'D', label: 'Only use AI for simple tasks that don\'t require evaluation' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 14,
    section: 3,
    type: 'short-text',
    question: 'Describe how you would use AI to analyze customer feedback and identify insights.',
    placeholder: 'Write 3-5 sentences...',
    criteria: [
      'Mentions specific AI capabilities (sentiment analysis, pattern recognition, etc.)',
      'Shows understanding of data processing',
      'Includes actionable insights extraction',
      'Demonstrates practical application'
    ]
  },
  {
    id: 15,
    section: 3,
    type: 'short-text',
    question: 'How would you use AI to identify process improvements and automation opportunities?',
    placeholder: 'Write 3-5 sentences...',
    criteria: [
      'Identifies specific processes to analyze',
      'Shows understanding of AI\'s analytical capabilities',
      'Mentions efficiency/automation potential',
      'Includes implementation approach'
    ]
  },
  
  // Section 4: Technical Concepts & Integration
  {
    id: 16,
    section: 4,
    type: 'likert',
    question: 'How well can you estimate technical effort and plan for scalability in business features?',
    options: [
      { value: 1, label: 'Not well at all' },
      { value: 2, label: 'Slightly well' },
      { value: 3, label: 'Moderately well' },
      { value: 4, label: 'Very well' },
      { value: 5, label: 'Extremely well' }
    ]
  },
  {
    id: 17,
    section: 4,
    type: 'multiple-choice',
    question: 'When planning product features or fixing bugs, what\'s your systematic approach?',
    options: [
      { value: 'A', label: 'Start coding immediately without planning' },
      { value: 'B', label: 'Understand requirements, break down the problem, plan approach, implement, test, and iterate' },
      { value: 'C', label: 'Wait for someone to tell me exactly what to do' },
      { value: 'D', label: 'Focus only on the quickest solution without considering long-term impact' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 18,
    section: 4,
    type: 'short-text',
    question: 'Explain what databases and APIs are and why they\'re critical for business operations.',
    placeholder: 'Write 3-5 sentences...',
    criteria: [
      'Defines both databases and APIs clearly',
      'Explains business relevance',
      'Shows understanding of data storage and connectivity',
      'Mentions practical applications'
    ]
  },
  {
    id: 19,
    section: 4,
    type: 'long-text',
    question: 'Describe a product you could build with your current skills, including problem, users, and validation approach.',
    placeholder: 'Write 5-8 sentences...',
    criteria: [
      'Clear problem identification',
      'Defined target users',
      'Realistic scope for current skills',
      'Specific validation methodology',
      'Shows product thinking'
    ]
  },
  {
    id: 20,
    section: 4,
    type: 'long-text',
    question: 'Describe your relationship with AI tools and one product/business goal for the next 6 months.',
    placeholder: 'Write 5-8 sentences...',
    criteria: [
      'Honest assessment of AI usage',
      'Specific goal identified',
      'Clear timeline/milestones',
      'Connection between AI use and goal achievement',
      'Shows growth mindset'
    ]
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
    if (assessment && !isReadOnly) {
      showInstructions();
    }
  }, [assessment]);

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
          <p>This 20-question assessment helps us understand your current confidence and skills across four key areas:</p>
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

  // Auto-save as draft when form data changes
  useEffect(() => {
    if (!isReadOnly && Object.keys(formData.responses).length > 0) {
      const timeoutId = setTimeout(() => {
        saveAssessmentData('draft');
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [formData.responses]);

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
