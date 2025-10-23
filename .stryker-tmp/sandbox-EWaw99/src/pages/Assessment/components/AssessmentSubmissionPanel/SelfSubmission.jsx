// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import './AssessmentSubmissionPanel.css';

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

function SelfSubmission({ submissionData = {}, isDraft = true, isLoading = false, onUpdate, onSubmit }) {
  // Initialize form data from submission data or empty defaults
  const [formData, setFormData] = useState({
    responses: submissionData.responses || {},
    currentSection: 1,
    startTime: submissionData.startTime || new Date().toISOString(),
    sectionTimes: submissionData.sectionTimes || {}
  });

  // Track section completion time
  const [sectionStartTime, setSectionStartTime] = useState(new Date());

  // Auto-save as draft when form data changes
  useEffect(() => {
    if (isDraft && Object.keys(formData.responses).length > 0) {
      const timeoutId = setTimeout(() => {
        onUpdate(formData);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDraft, onUpdate]);

  // Get questions for current section
  const currentSectionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.section === formData.currentSection);

  // Check if current section is complete
  const isSectionComplete = () => {
    return currentSectionQuestions.every(question => {
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
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
  };

  // Handle section navigation
  const handleSectionChange = (direction) => {
    // Save section completion time
    const sectionEndTime = new Date();
    const sectionDuration = (sectionEndTime - sectionStartTime) / 1000; // in seconds
    
    setFormData(prev => ({
      ...prev,
      sectionTimes: {
        ...prev.sectionTimes,
        [prev.currentSection]: (prev.sectionTimes[prev.currentSection] || 0) + sectionDuration
      },
      currentSection: direction === 'next' ? prev.currentSection + 1 : prev.currentSection - 1
    }));
    
    // Reset section timer
    setSectionStartTime(new Date());
  };

  // Handle final submission
  const handleSubmit = () => {
    // Save final section time
    const sectionEndTime = new Date();
    const sectionDuration = (sectionEndTime - sectionStartTime) / 1000; // in seconds
    
    const finalFormData = {
      ...formData,
      sectionTimes: {
        ...formData.sectionTimes,
        [formData.currentSection]: (formData.sectionTimes[formData.currentSection] || 0) + sectionDuration
      },
      completionTime: new Date().toISOString()
    };
    
    onSubmit(finalFormData);
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
                  onClick={() => !isDraft ? null : handleResponseChange(question.id, option.value)}
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
                onClick={() => !isDraft ? null : handleResponseChange(question.id, option.value)}
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
              onChange={(e) => !isDraft ? null : handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              disabled={!isDraft}
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
              onChange={(e) => !isDraft ? null : handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              disabled={!isDraft}
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

  return (
    <div className="submission-form self-assessment">
      {/* Progress indicator */}
      <div className="self-assessment__progress">
        {[1, 2, 3, 4].map(section => (
          <div 
            key={section} 
            className={`self-assessment__progress-step ${formData.currentSection === section ? 'self-assessment__progress-step--active' : ''} ${formData.currentSection > section ? 'self-assessment__progress-step--completed' : ''}`}
          >
            <div className="self-assessment__progress-number">{section}</div>
            <div className="self-assessment__progress-label">{SECTION_TITLES[section]}</div>
          </div>
        ))}
      </div>
      
      {/* Section title */}
      <h2 className="self-assessment__section-title">
        Section {formData.currentSection}: {SECTION_TITLES[formData.currentSection]}
      </h2>
      
      {/* Questions */}
      <div className="self-assessment__questions">
        {currentSectionQuestions.map(question => (
          <div key={question.id} className="self-assessment__question">
            <div className="self-assessment__question-number">Question {question.id}</div>
            <div className="self-assessment__question-text">{question.question}</div>
            {renderQuestion(question)}
          </div>
        ))}
      </div>
      
      {/* Navigation */}
      <div className="self-assessment__navigation">
        {formData.currentSection > 1 && (
          <button
            className="self-assessment__nav-btn self-assessment__nav-btn--prev"
            onClick={() => handleSectionChange('prev')}
          >
            <FaArrowLeft /> Previous Section
          </button>
        )}
        
        {formData.currentSection < 4 ? (
          <button
            className="self-assessment__nav-btn self-assessment__nav-btn--next"
            onClick={() => handleSectionChange('next')}
            disabled={!isSectionComplete()}
          >
            Next Section <FaArrowRight />
          </button>
        ) : (
          <div className="submission-form__actions">
            {isDraft ? (
              <button
                onClick={handleSubmit}
                disabled={!isAssessmentComplete() || isLoading}
                className="submission-form__submit-btn"
              >
                {isLoading ? 'Submitting...' : 'Submit Final Assessment'}
              </button>
            ) : (
              <div className="submission-form__submitted-message">
                <FaCheck className="submission-form__check-icon" />
                Assessment Submitted
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SelfSubmission;
