import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import AddressAutocomplete from '../../components/AddressAutocomplete/AddressAutocomplete';
import IneligibleModal from '../../components/IneligibleScreen/IneligibleScreen';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const saveTimeoutRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/apply/login');
  };
  
  // Core state
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOneQuestionMode, setIsOneQuestionMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [isIneligible, setIsIneligible] = useState(false);
  const [eligibilityFailures, setEligibilityFailures] = useState([]);

  // Initialize application
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        setIsLoading(true);
        
        // Fetch questions from database
        const questions = await databaseService.fetchApplicationQuestions();
        setApplicationQuestions(questions);
        
        // Get user info - try localStorage first, then fallback
        const savedUser = localStorage.getItem('user');
        let email = 'jac@pursuit.org';
        let firstName = 'John';
        let lastName = 'Doe';
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            email = userData.email || email;
            firstName = userData.firstName || userData.first_name || firstName;
            lastName = userData.lastName || userData.last_name || lastName;
          } catch (e) {
            console.warn('Could not parse saved user data');
          }
        }
        
        // Get or create applicant first
        const applicant = await databaseService.createOrGetApplicant(email, firstName, lastName);
        console.log('Applicant:', applicant);
        
        // Check for existing applications for this applicant
        let existingApplication = null;
        try {
          // Try to get existing in-progress application
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/${applicant.applicant_id}/application`, {
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            existingApplication = await response.json();
            console.log('Found existing application:', existingApplication);
          }
        } catch (error) {
          console.log('No existing application found, will create new one');
        }
        
        // Create application only if none exists
        let application = existingApplication;
        if (!application) {
          console.log('Creating new application...');
          // Set the current applicant on the service before creating application
          databaseService.currentApplicant = applicant;
          application = await databaseService.createApplication();
          console.log('Created new application:', application);
        }
        
        // Check if application is ineligible and handle accordingly
        if (application && application.status === 'ineligible') {
          console.log('Application is marked as ineligible, redirecting to dashboard');
          localStorage.setItem('applicationStatus', 'ineligible');
          navigate('/apply');
          return;
        }

        // If application was recently reset from ineligible, navigate to eligibility section
        const wasResetForEditing = localStorage.getItem('eligibilityResetForEditing');
        if (wasResetForEditing === 'true') {
          console.log('Application was reset for eligibility editing, navigating to eligibility section');
          localStorage.removeItem('eligibilityResetForEditing');
          // We'll set the section to eligibility after questions load
        }
        
        const session = {
          applicant,
          application
        };
        setCurrentSession(session);
        
        // Also set the application on the service for auto-save
        databaseService.currentApplication = application;
        
        // Check for existing progress
        if (application?.application_id) {
          console.log('Loading form data for application:', application.application_id);
          const savedFormData = await databaseService.loadFormData(application.application_id);
          console.log('Loaded form data:', savedFormData);
          
          if (Object.keys(savedFormData).length > 0) {
            // Automatically load saved data
            setFormData(savedFormData);
            
            // Restore current section
            const savedSection = localStorage.getItem('applicationCurrentSection');
            if (savedSection) {
              setCurrentSection(parseInt(savedSection, 10));
            }
            
            // Restore question index for one-question mode
            const savedQuestionIndex = localStorage.getItem('applicationCurrentQuestionIndex');
            if (savedQuestionIndex) {
              setCurrentQuestionIndex(parseInt(savedQuestionIndex, 10));
            }
            
            console.log('Automatically restored saved progress');
          }
        }
        
        console.log('Application initialized successfully');
        
      } catch (error) {
        console.error('Error initializing application:', error);
        setError('Failed to load application. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApplication();
  }, []);

  // Load questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsData = await databaseService.getQuestions();
        setApplicationQuestions(questionsData);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();
  }, []);

  // Calculate progress
  useEffect(() => {
    if (applicationQuestions.length > 0) {
      const allQuestions = getAllRootQuestions();
      const totalQuestions = allQuestions.length;
      const answeredQuestions = Object.keys(formData).filter(key => {
        const value = formData[key];
        return value !== null && value !== undefined && value !== '' && 
               !(Array.isArray(value) && value.length === 0);
      }).length;
      const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
      setProgress(progressPercentage);
    }
  }, [formData, applicationQuestions]);

  // Auto-save with debounce
  useEffect(() => {
    if (Object.keys(formData).length === 0 || !currentSession?.application?.application_id) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Auto-saving form data...', {
          formDataKeys: Object.keys(formData),
          applicationId: currentSession?.application?.application_id,
          sessionExists: !!currentSession
        });
        
        // Save to localStorage immediately
          localStorage.setItem('applicationFormData', JSON.stringify(formData));
        console.log('Saved to localStorage');
        
        // Save to database
        if (currentSession?.application?.application_id) {
          let savedCount = 0;
          for (const [questionId, value] of Object.entries(formData)) {
            if (value !== null && value !== undefined && value !== '') {
              const responseValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
              console.log(`Saving response: Q${questionId} = ${responseValue}`);
              
              await databaseService.saveResponse(
                currentSession.application.application_id,
                questionId,
                responseValue
              );
              savedCount++;
            }
          }
          console.log(`Auto-save completed: ${savedCount} responses saved to database`);
      } else {
          console.warn('No application ID available for database save');
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    }, 1000); // 1 second debounce
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, currentSession]);

  // Initialize navigation when questions load
  useEffect(() => {
    if (applicationQuestions.length > 0) {
      // Check if we need to navigate to eligibility section for editing
      const wasResetForEditing = localStorage.getItem('eligibilityResetForEditing');
      if (wasResetForEditing === 'true') {
        console.log('Navigating to eligibility section for editing');
        localStorage.removeItem('eligibilityResetForEditing');
        // Find the eligibility section and navigate to it
        const eligibilitySection = applicationQuestions.findIndex(section => 
          section.title === 'YOUR ELIGIBILITY'
        );
        if (eligibilitySection !== -1) {
          setCurrentSection(eligibilitySection);
          setCurrentQuestionIndex(0);
          localStorage.setItem('applicationCurrentSection', eligibilitySection.toString());
          localStorage.setItem('applicationCurrentQuestionIndex', '0');
        }
      } else {
        // Only initialize if we don't have a saved position or if the saved position is invalid
        const savedSection = localStorage.getItem('applicationCurrentSection');
        const savedQuestionIndex = localStorage.getItem('applicationCurrentQuestionIndex');
        
        if (!savedSection || !savedQuestionIndex) {
          initializeNavigation();
        } else {
          // Ensure the saved position points to a root question
          ensureRootQuestionPosition();
        }
      }
    }
  }, [applicationQuestions]);

  // Ensure we stay on root questions when navigation changes
  useEffect(() => {
    ensureRootQuestionPosition();
  }, [currentSection, currentQuestionIndex, applicationQuestions]);

  // Handle input changes with immediate saving
  const handleInputChange = (questionId, value) => {
    console.log(`Input changed: ${questionId} = ${value}`);
    
    // Find if this question has any conditional children
    const currentSection = applicationQuestions.find(section => 
      section.questions && section.questions.find(q => q.id === questionId)
    );
    
    let updatedFormData = {
      ...formData,
      [questionId]: value
    };

    // If this question has conditional children, clear their values when parent changes
    if (currentSection) {
      const conditionalChildren = currentSection.questions.filter(q => 
        q.parentQuestionId === questionId
      );
      
      conditionalChildren.forEach(child => {
        // Clear the child question's value
        console.log(`Clearing conditional question ${child.id} due to parent change`);
        updatedFormData[child.id] = '';
      });
    }
    
    setFormData(updatedFormData);

    // Clear validation error for this field when user starts typing
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Validation functions
  const validateQuestion = (question) => {
    if (!question.required) return null;
    
    const value = formData[question.id];
    
    // Check if value is empty or invalid
    if (!value || value === '' || 
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'string' && value.trim() === '')) {
      return "This question is required.";
    }
    
    return null;
  };

  const validateCurrentQuestions = () => {
    const currentQuestionGroup = getCurrentQuestions();
    const errors = {};
    
    // Validate the root question
    if (currentQuestionGroup.rootQuestion) {
      const error = validateQuestion(currentQuestionGroup.rootQuestion);
      if (error) {
        errors[currentQuestionGroup.rootQuestion.id] = error;
      }
    }
    
    // Validate all visible conditional questions
    currentQuestionGroup.conditionalQuestions.forEach(question => {
      const error = validateQuestion(question);
      if (error) {
        errors[question.id] = error;
      }
    });
    
    return errors;
  };

  const validateSection = (sectionQuestions) => {
    const visibleQuestions = getVisibleQuestions(sectionQuestions);
    const errors = {};
    
    visibleQuestions.forEach(question => {
      const error = validateQuestion(question);
      if (error) {
        errors[question.id] = error;
      }
    });
    
    return errors;
  };

  // Check if section has any validation errors
  const sectionHasErrors = (sectionQuestions) => {
    const errors = validateSection(sectionQuestions);
    return Object.keys(errors).length > 0;
  };

  // Check if conditional question should be shown
  const shouldShowQuestion = (question) => {
    if (!question.parentQuestionId) return true;
    
    const parentValue = formData[question.parentQuestionId];
    if (!parentValue) return false;
    
    switch (question.conditionType) {
      case 'show_when_equals':
      case 'equals':
        return parentValue === question.showWhenParentEquals;
      case 'not_equals':
        return parentValue !== question.showWhenParentEquals;
      case 'contains':
        return Array.isArray(parentValue) ? 
          parentValue.includes(question.showWhenParentEquals) : 
          parentValue.toString().includes(question.showWhenParentEquals);
      default:
        return parentValue === question.showWhenParentEquals;
    }
  };

  // Get visible questions for current section
  const getVisibleQuestions = (sectionQuestions) => {
    return sectionQuestions.filter(shouldShowQuestion);
  };

  // Get all root questions (non-conditional) flattened across all sections
  const getAllRootQuestions = () => {
    let allQuestions = [];
    applicationQuestions.forEach((section, sectionIndex) => {
      if (section.questions) {
        // Only include root questions (non-conditional) in the main flow
        const rootQuestions = section.questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        
        visibleRootQuestions.forEach(question => {
          allQuestions.push({
            ...question,
            sectionIndex,
            sectionTitle: section.title
          });
        });
      }
    });
    return allQuestions;
  };

  // Get conditional questions for a specific parent question
  const getConditionalQuestionsForParent = (parentQuestionId, sectionQuestions) => {
    if (!sectionQuestions) return [];
    
    return sectionQuestions.filter(question => 
      question.parentQuestionId === parentQuestionId && shouldShowQuestion(question)
    );
  };

  // Get current question group (parent + its visible conditional children)
  const getCurrentQuestions = () => {
    const allRootQuestions = getAllRootQuestions();
    
    if (allRootQuestions.length === 0) return { rootQuestion: null, conditionalQuestions: [] };
    
    // Get the current root question
    const currentQuestionGlobalIndex = getCurrentQuestionGlobalIndex();
    if (currentQuestionGlobalIndex >= 0 && currentQuestionGlobalIndex < allRootQuestions.length) {
      const currentRootQuestion = allRootQuestions[currentQuestionGlobalIndex];
      
      // Find the section this question belongs to
      const section = applicationQuestions[currentRootQuestion.sectionIndex];
      
      // Get any conditional questions for this parent
      const conditionalQuestions = getConditionalQuestionsForParent(
        currentRootQuestion.id, 
        section.questions
      );
      
      // Return the parent question with its conditional children
      return {
        rootQuestion: currentRootQuestion,
        conditionalQuestions: conditionalQuestions
      };
    }
    
    return { rootQuestion: null, conditionalQuestions: [] };
  };

  // Get the global index of the current root question
  const getCurrentQuestionGlobalIndex = () => {
    if (applicationQuestions.length === 0) return 0;
    
    let globalIndex = 0;
    
    // Count root questions in previous sections
    for (let sectionIndex = 0; sectionIndex < currentSection; sectionIndex++) {
      if (applicationQuestions[sectionIndex]?.questions) {
        const rootQuestions = applicationQuestions[sectionIndex].questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        globalIndex += visibleRootQuestions.length;
      }
    }
    
    // Add the current question index within the current section (only for root questions)
    if (applicationQuestions[currentSection]?.questions) {
      const currentSectionQuestions = applicationQuestions[currentSection].questions;
      const currentQuestion = currentSectionQuestions[currentQuestionIndex];
      
      // Only add to global index if the current question is a root question
      if (currentQuestion && !currentQuestion.parentQuestionId) {
        const rootQuestions = currentSectionQuestions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        const rootQuestionIndex = visibleRootQuestions.findIndex(q => q.id === currentQuestion.id);
        
        if (rootQuestionIndex !== -1) {
          globalIndex += rootQuestionIndex;
        }
      }
    }
    
    return globalIndex;
  };

  // Initialize navigation to first root question
  const initializeNavigation = () => {
    if (applicationQuestions.length === 0) return;
    
    // Find the first section with root questions
    for (let sectionIndex = 0; sectionIndex < applicationQuestions.length; sectionIndex++) {
      const section = applicationQuestions[sectionIndex];
      if (section?.questions) {
        const rootQuestions = section.questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        
        if (visibleRootQuestions.length > 0) {
          // Find the index of the first root question in the section's questions array
          const firstRootQuestion = visibleRootQuestions[0];
          const questionIndex = section.questions.findIndex(q => q.id === firstRootQuestion.id);
          
          setCurrentSection(sectionIndex);
          setCurrentQuestionIndex(questionIndex);
          localStorage.setItem('applicationCurrentSection', sectionIndex.toString());
          localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
          return;
        }
      }
    }
  };

  // Ensure we're always on a root question when navigation changes
  const ensureRootQuestionPosition = () => {
    if (applicationQuestions.length === 0) return;
    
    const currentSectionData = applicationQuestions[currentSection];
    if (!currentSectionData?.questions) return;
    
    const currentQuestion = currentSectionData.questions[currentQuestionIndex];
    
    // If current question is conditional, find the nearest root question
    if (currentQuestion?.parentQuestionId) {
      const rootQuestions = currentSectionData.questions.filter(q => !q.parentQuestionId);
      const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
      
      if (visibleRootQuestions.length > 0) {
        // Move to the first root question in this section
        const firstRootQuestion = visibleRootQuestions[0];
        const questionIndex = currentSectionData.questions.findIndex(q => q.id === firstRootQuestion.id);
        
        setCurrentQuestionIndex(questionIndex);
        localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
      }
    }
  };

  // Navigation functions
  const handleNext = async () => {
    // Validate current questions before proceeding
    const errors = validateCurrentQuestions();
    
    if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
      setShowValidation(true);
      
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return; // Don't proceed with navigation
    }

    // Clear any existing validation errors
    setValidationErrors({});
    setShowValidation(false);

    await moveToNextQuestion();
  };

  const handlePrevious = () => {
    moveToPreviousQuestion();
  };

  const moveToNextQuestion = async () => {
    const allQuestions = getAllRootQuestions();
    const currentGlobalIndex = getCurrentQuestionGlobalIndex();
    
    if (currentGlobalIndex < allQuestions.length - 1) {
      // Check if we're moving from eligibility section to next section
      const nextGlobalIndex = currentGlobalIndex + 1;
      const { sectionIndex: nextSectionIndex } = getLocalIndicesFromGlobal(nextGlobalIndex);
      
      // If we're currently in eligibility section and moving to a different section
      if (isEligibilitySection() && nextSectionIndex !== currentSection) {
        console.log('Moving from eligibility section to next section, checking eligibility...');
        const isEligible = await checkEligibility();
        
        if (!isEligible) {
          // User is not eligible, eligibility state will be set in checkEligibility
          return;
        }
      }
      
      // Move to next question
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(nextGlobalIndex);
      
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
      localStorage.setItem('applicationCurrentSection', sectionIndex.toString());
      localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
    }
  };

  const moveToPreviousQuestion = () => {
    const currentGlobalIndex = getCurrentQuestionGlobalIndex();
    
    if (currentGlobalIndex > 0) {
      // Move to previous question
      const prevGlobalIndex = currentGlobalIndex - 1;
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(prevGlobalIndex);
      
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
      localStorage.setItem('applicationCurrentSection', sectionIndex.toString());
      localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
    }
  };

  // Convert global question index to section and question indices (root questions only)
  const getLocalIndicesFromGlobal = (globalIndex) => {
    let currentGlobal = 0;
    
    for (let sectionIndex = 0; sectionIndex < applicationQuestions.length; sectionIndex++) {
      if (applicationQuestions[sectionIndex]?.questions) {
        const rootQuestions = applicationQuestions[sectionIndex].questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        
        if (currentGlobal + visibleRootQuestions.length > globalIndex) {
          // The target question is in this section
          const questionIndex = globalIndex - currentGlobal;
          
          // Find the actual index of this root question within all questions in the section
          const targetRootQuestion = visibleRootQuestions[questionIndex];
          const actualQuestionIndex = applicationQuestions[sectionIndex].questions.findIndex(
            q => q.id === targetRootQuestion.id
          );
          
          return { sectionIndex, questionIndex: actualQuestionIndex };
        }
        
        currentGlobal += visibleRootQuestions.length;
      }
    }
    
    // Default to last section and question if not found
    return { sectionIndex: applicationQuestions.length - 1, questionIndex: 0 };
  };

  // Navigate to first question of a specific section
  const navigateToSection = (targetSectionIndex) => {
    // Calculate the global index of the first question in the target section
    let globalIndex = 0;
    
    for (let sectionIndex = 0; sectionIndex < targetSectionIndex; sectionIndex++) {
      const sectionQuestions = applicationQuestions[sectionIndex].questions || [];
      const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
      const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
      globalIndex += visibleRootQuestions.length;
    }
    
    // Set current question to first question of the target section
    setCurrentQuestionIndex(globalIndex);
    setCurrentSection(targetSectionIndex);
    
    // Save to localStorage
    localStorage.setItem('applicationCurrentQuestionIndex', globalIndex.toString());
    localStorage.setItem('applicationCurrentSection', targetSectionIndex.toString());
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate entire form before submission
      let allErrors = {};
      
      applicationQuestions.forEach(section => {
        const sectionErrors = validateSection(section.questions);
        allErrors = { ...allErrors, ...sectionErrors };
      });
      
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        setShowValidation(true);
        setIsSubmitting(false);
        
        // Find the first section with errors
        let errorSectionIndex = -1;
        for (let i = 0; i < applicationQuestions.length; i++) {
          const sectionQuestions = getVisibleQuestions(applicationQuestions[i].questions);
          const hasError = sectionQuestions.some(q => allErrors[q.id]);
          if (hasError) {
            errorSectionIndex = i;
            break;
          }
        }
        
        if (errorSectionIndex !== -1) {
          setCurrentSection(errorSectionIndex);
          localStorage.setItem('applicationCurrentSection', errorSectionIndex.toString());
          
          // Scroll to first error after a brief delay
          setTimeout(() => {
            const firstErrorId = Object.keys(allErrors)[0];
            const errorElement = document.getElementById(firstErrorId);
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              errorElement.focus();
            }
          }, 100);
        }
        
        alert(`Please complete all required fields. Found ${Object.keys(allErrors).length} missing required field(s).`);
        return;
      }

      if (currentSession?.application) {
        await databaseService.submitApplication(currentSession.application.application_id);
        
        // Clear saved data
        localStorage.removeItem('applicationFormData');
        localStorage.removeItem('applicationCurrentSection');
        localStorage.removeItem('applicationCurrentQuestionIndex');
        localStorage.setItem('applicationStatus', 'submitted');
        
        alert('Application submitted successfully!');
        navigate('/apply');
      } else {
        throw new Error('No active application session');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current section is "YOUR ELIGIBILITY"
  const isEligibilitySection = () => {
    if (!applicationQuestions[currentSection]) return false;
    return applicationQuestions[currentSection].title === 'YOUR ELIGIBILITY';
  };

  // Check eligibility
  const checkEligibility = async () => {
    try {
      if (!currentSession?.applicant?.applicant_id) {
        console.warn('No applicant ID available for eligibility check');
        return true; // Allow to continue if we can't check
      }

      const eligibilityResults = await databaseService.checkEligibility(
        formData, 
        currentSession.applicant.applicant_id
      );

      if (!eligibilityResults.isEligible) {
        setIsIneligible(true);
        setEligibilityFailures(eligibilityResults.failedCriteria || []);
        
        // Set application status to ineligible
        localStorage.setItem('applicationStatus', 'ineligible');
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // On error, allow user to continue rather than block them
      return true;
    }
  };

  // Handle modal close - navigate back to dashboard
  const handleIneligibleModalClose = () => {
    setIsIneligible(false);
    navigate('/apply');
  };

  // Render different input types
  const renderQuestion = (question) => {
    const hasError = showValidation && validationErrors[question.id];
    const commonProps = {
      id: question.id,
      value: formData[question.id] || '',
      onChange: (e) => handleInputChange(question.id, e.target.value),
      required: question.required,
      className: `form-input ${hasError ? 'form-input-error' : ''}`
    };

    // Address question with Google Maps
    if (question.label && question.label.toLowerCase().includes('address')) {
      return (
        <AddressAutocomplete
          value={formData[question.id] || ''}
          onChange={(value) => handleInputChange(question.id, value)}
          placeholder="Enter your address"
          required={question.required}
          className={hasError ? 'form-input-error' : ''}
        />
      );
    }

    switch (question.type) {
      case 'textarea':
      return (
        <div className="long-text-container">
          <textarea
            {...commonProps}
            rows={12}
            className={`form-input long-text-input ${hasError ? 'form-input-error' : ''}`}
              placeholder={question.placeholder || "Please provide your response..."}
              maxLength={2000}
          />
            <div className="long-text-counter">
              {(formData[question.id] || '').length} / 2000 characters
          </div>
        </div>
      );
      
      case 'radio':
        // Use dropdown if more than 6 options, otherwise use radio buttons
        if (question.options && question.options.length > 6) {
          return (
            <select
              {...commonProps}
              value={formData[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            >
              <option value="">Please select...</option>
              {question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
        } else {
          return (
            <div className="radio-group">
              {question.options && question.options.map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={formData[question.id] === option}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.required}
                  />
                  {option}
                </label>
              ))}
            </div>
          );
        }

      case 'checkbox':
        return (
          <div className={`checkbox-group ${hasError ? 'checkbox-group-error' : ''}`}>
            {question.options && question.options.map(option => (
              <label key={option} className="checkbox-option">
                <input
                  type="checkbox"
                  name={question.id}
                  value={option}
                  checked={formData[question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const value = e.target.value;
                    const checked = e.target.checked;
                    setFormData(prev => {
                      const currentOptions = prev[question.id] || [];
                      if (checked) {
                        return {
                          ...prev,
                          [question.id]: [...currentOptions, value]
                        };
                      } else {
                        return {
                          ...prev,
                          [question.id]: currentOptions.filter(item => item !== value)
                        };
                      }
                    });
                  }}
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="radio-group">
            {question.options && question.options.map(option => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
          />
        );

      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            placeholder="your@email.com"
          />
        );

      case 'tel':
        return (
          <input
            {...commonProps}
            type="tel"
            placeholder="(555) 123-4567"
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            placeholder="Enter a number"
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={question.placeholder || "Enter your response"}
          />
        );
    }
  };

  // Loading state
  if (isLoading) {
  return (
    <div className="admissions-dashboard">
        <div className="loading-state">
          <h2>Loading Application...</h2>
          <p>Please wait while we prepare your application form.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admissions-dashboard">
        <div className="error-state">
          <h2>Error Loading Application</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // No questions available
  if (applicationQuestions.length === 0) {
    return (
      <div className="admissions-dashboard">
        <div className="error-state">
          <h2>No Questions Available</h2>
          <p>There are no application questions available at this time.</p>
          <button onClick={() => navigate('/apply')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestions = getCurrentQuestions();
  const currentSectionData = applicationQuestions[currentSection];

  // Get completed questions count for a specific section (only root questions)
  const getCompletedQuestionsInSection = (sectionQuestions) => {
    const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
    const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
    return visibleRootQuestions.filter(question => {
      const value = formData[question.id];
      return value !== null && value !== undefined && value !== '' && 
             !(Array.isArray(value) && value.length === 0);
    }).length;
  };

  // Get current question info within its section (only count root questions)
  const getCurrentQuestionInfo = () => {
    const currentQuestionGroup = getCurrentQuestions();
    
    if (!currentQuestionGroup.rootQuestion) {
      return { sectionName: '', questionNumber: 1, totalInSection: 1 };
    }
    
    const currentQuestion = currentQuestionGroup.rootQuestion;
    const sectionQuestions = applicationQuestions[currentQuestion.sectionIndex]?.questions || [];
    const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
    const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
    
    // Find the position of the current question within the visible root questions
    const questionPosition = visibleRootQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
    
    return {
      sectionName: currentQuestion.sectionTitle || '',
      questionNumber: questionPosition,
      totalInSection: visibleRootQuestions.length
    };
  };

  // Check if user is ineligible and redirect
  if (currentSession?.application?.status === 'ineligible') {
    console.log('Application is ineligible, redirecting to dashboard');
    localStorage.setItem('applicationStatus', 'ineligible');
    navigate('/apply');
    return null;
  }

  return (
    <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-topbar">
        <div className="admissions-topbar-left">
          <div className="admissions-logo-section">
            <img src="/logo.png" alt="Pursuit Logo" className="admissions-logo" />
            <span className="admissions-logo-text">Pursuit</span>
          </div>
          {currentSession && (
          <div className="welcome-text">
              Welcome, {currentSession.applicant.first_name}
          </div>
          )}
        </div>
        <div className="admissions-topbar-right">
          <button 
            onClick={() => navigate('/apply')} 
            className="admissions-button-secondary"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={handleLogout}
            className="admissions-button-primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div className="admissions-title-section">
        <h1 className="admissions-title">Application Form</h1>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="application-main">
        {/* Left Column - Info Panel */}
        <div className="application-left-column">
          <div className="application-title">
            AI Native Application
            </div>
                    <div className="application-description">
            <p>Welcome to our comprehensive application process. This form will help us understand your background, experience, and goals.</p>
            <p>Please take your time to provide thoughtful and complete responses. Your answers will help us determine if our program is the right fit for you.</p>
            <p>All sections marked with an asterisk (*) are required. You can save your progress at any time and return to complete the application later.</p>
          </div>
        </div>

        {/* Right Column - Form Content */}
        <div className="application-right-column">
          {/* Section Navigation - Moved here from left sidebar */}
          <div className="application-sections-bar">
            {applicationQuestions.map((section, index) => {
              const sectionQuestions = section.questions || [];
              const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
              const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
              const completedCount = getCompletedQuestionsInSection(sectionQuestions);
              const totalCount = visibleRootQuestions.length;
              
              return (
                <div 
                  key={section.id} 
                  className={`section-nav-item ${index === currentSection ? 'active' : ''}`}
                  onClick={() => navigateToSection(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {index + 1}. {section.title}
                  <span className="section-progress">
                    {completedCount} / {totalCount}
                  </span>
          </div>
              );
            })}
            </div>

          <div className="application-form">
            <form onSubmit={handleSubmit}>
            <div className="application-form-section">
                <h2 className="application-section-title">
                  {(() => {
                    const questionInfo = getCurrentQuestionInfo();
                    return (
                      <>
                        {questionInfo.sectionName}
                        <span className="question-counter">
                          Question {questionInfo.questionNumber} of {questionInfo.totalInSection}
                        </span>
                      </>
                    );
                  })()}
                </h2>
                
                {(() => {
                  const currentQuestionGroup = getCurrentQuestions();
                  
                  if (!currentQuestionGroup.rootQuestion) {
                    return <div>Loading...</div>;
                  }

                  return (
                    <>
                      {/* Root Question */}
                      <div 
                        key={currentQuestionGroup.rootQuestion.id} 
                        className="application-question-group root-question"
                      >
                        <label htmlFor={currentQuestionGroup.rootQuestion.id} className="application-question-label">
                          {currentQuestionGroup.rootQuestion.label}
                          {currentQuestionGroup.rootQuestion.link && (
                            <a href={currentQuestionGroup.rootQuestion.link.url} target="_blank" rel="noopener noreferrer">
                              {currentQuestionGroup.rootQuestion.link.text}
                            </a>
                          )}
                          {currentQuestionGroup.rootQuestion.required ? (
                            <span className="application-required">*</span>
                          ) : (
                            <span className="application-optional">(optional)</span>
                          )}
                        </label>
                        {renderQuestion(currentQuestionGroup.rootQuestion)}
                        {showValidation && validationErrors[currentQuestionGroup.rootQuestion.id] && (
                          <div className="application-validation-error">
                            {validationErrors[currentQuestionGroup.rootQuestion.id]}
                          </div>
                        )}
                      </div>

                      {/* Conditional Questions */}
                      {currentQuestionGroup.conditionalQuestions.map((question) => (
                <div 
                  key={question.id} 
                          className="application-question-group conditional-question"
                >
                          <label htmlFor={question.id} className="application-question-label">
                    {question.label}
                    {question.link && (
                      <a href={question.link.url} target="_blank" rel="noopener noreferrer">
                        {question.link.text}
                      </a>
                    )}
                            {question.required ? (
                      <span className="application-required">*</span>
                            ) : (
                              <span className="application-optional">(optional)</span>
                    )}
                  </label>
                  {renderQuestion(question)}
                          {showValidation && validationErrors[question.id] && (
                    <div className="application-validation-error">
                      {validationErrors[question.id]}
                    </div>
                  )}
                </div>
              ))}
                    </>
                  );
                })()}
              </div>
              
              {/* Navigation */}
              <div className="application-navigation">
                {getCurrentQuestionGlobalIndex() > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="application-nav-button application-nav-previous"
                  >
                    Previous
                  </button>
                )}
                
                {getCurrentQuestionGlobalIndex() < getAllRootQuestions().length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="application-nav-button application-nav-next"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="application-nav-button application-nav-next"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
            </div>
          </form>
          </div>
        </div>
      </div>
      
      {/* Ineligible Modal */}
      <IneligibleModal 
        isOpen={isIneligible}
        onClose={handleIneligibleModalClose}
        failedCriteria={eligibilityFailures}
      />
    </div>
  );
};

export default ApplicationForm; 