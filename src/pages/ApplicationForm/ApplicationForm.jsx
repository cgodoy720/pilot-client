import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import AddressAutocomplete from '../../components/AddressAutocomplete/AddressAutocomplete';
import IneligibleModal from '../../components/IneligibleScreen/IneligibleScreen';
import Swal from 'sweetalert2';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const saveTimeoutRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Core state
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(-1); // Start at -1 for intro tab
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
          const wasResetForEditing = localStorage.getItem('eligibilityResetForEditing');
          const urlParams = new URLSearchParams(window.location.search);
          const resetFromUrl = urlParams.get('resetEligibility') === 'true';
          
          console.log('🔍 RESET DEBUG: Found ineligible application', {
            applicationId: application.application_id,
            status: application.status,
            wasResetForEditing,
            resetFromUrl,
            applicantId: applicant.applicant_id,
            allLocalStorageKeys: Object.keys(localStorage),
            currentUrl: window.location.href
          });
          
          if (wasResetForEditing === 'true' || resetFromUrl) {
            console.log('🔄 RESET DEBUG: Starting reset process...');
            localStorage.removeItem('eligibilityResetForEditing');
            
            // Clean up URL parameter
            if (resetFromUrl) {
              const url = new URL(window.location);
              url.searchParams.delete('resetEligibility');
              window.history.replaceState({}, '', url);
            }
            
            try {
              // Reset the application status synchronously before proceeding
              console.log('🔄 RESET DEBUG: Calling resetEligibility...');
              const resetResult = await databaseService.resetEligibility(applicant.applicant_id);
              console.log('🔄 RESET DEBUG: Reset result:', resetResult);
              
              if (resetResult && resetResult.success) {
                // Re-fetch the application to ensure we have the updated status
                console.log('🔄 RESET DEBUG: Re-fetching application after reset...');
                try {
                  const updatedApplication = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/${applicant.applicant_id}/application`, {
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  if (updatedApplication.ok) {
                    application = await updatedApplication.json();
                    console.log('✅ RESET DEBUG: Re-fetched application:', application);
                  } else {
                    // Fallback: just update the local object
                    application.status = 'in_progress';
                    console.log('⚠️ RESET DEBUG: Could not re-fetch, updating local object');
                  }
                } catch (fetchError) {
                  console.warn('⚠️ RESET DEBUG: Error re-fetching application:', fetchError);
                  // Fallback: just update the local object
                  application.status = 'in_progress';
                }
                
                console.log('✅ RESET DEBUG: Application status after reset:', application.status);
                
                // Also update localStorage to reflect the change
                localStorage.setItem('applicationStatus', 'in_progress');
              } else {
                console.error('❌ RESET DEBUG: Reset result indicates failure:', resetResult);
                throw new Error('Reset eligibility failed - invalid response');
              }
            } catch (error) {
              console.error('❌ RESET DEBUG: Error during reset:', error);
              alert('Failed to reset your application. Please try again.');
              navigate('/apply');
              return;
            }
          } else {
            // Normal ineligible flow
            console.log('Application is marked as ineligible, redirecting to dashboard');
            localStorage.setItem('applicationStatus', 'ineligible');
            navigate('/apply');
            return;
          }
        }
        
        console.log('🔍 RESET DEBUG: After reset check, application status:', application?.status);

        // Note: eligibilityResetForEditing is now handled above in the ineligible check
        
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
            
            // Restore current section (including intro section -1)
            const savedSection = localStorage.getItem('applicationCurrentSection');
            if (savedSection) {
              const sectionIndex = parseInt(savedSection, 10);
              setCurrentSection(sectionIndex);
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
        const questionsData = await databaseService.fetchApplicationQuestions();
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
          section.id === 'your_eligibility'
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
          const sectionIndex = parseInt(savedSection, 10);
          // Handle intro section (-1) or validate normal sections
          if (sectionIndex === -1) {
            setCurrentSection(-1);
            setCurrentQuestionIndex(0);
          } else if (sectionIndex >= 0 && sectionIndex < applicationQuestions.length) {
          // Ensure the saved position points to a root question
          ensureRootQuestionPosition();
          } else {
            // Invalid saved position, initialize navigation
            initializeNavigation();
          }
        }
      }
    }
  }, [applicationQuestions]);

  // Ensure we stay on root questions when navigation changes
  useEffect(() => {
    ensureRootQuestionPosition();
  }, [currentSection, currentQuestionIndex, applicationQuestions]);

  // Handle input changes with immediate saving
  const handleInputChange = async (questionId, value) => {
    console.log(`Input changed: ${questionId} = ${value}`);
    
    // Find if this question has any conditional children
    const currentSectionData = applicationQuestions.find(section => 
      section.questions && section.questions.find(q => q.id === questionId)
    );
    
    let updatedFormData = {
      ...formData,
      [questionId]: value
    };

    // If this question has conditional children, clear their values when parent changes
    if (currentSectionData) {
      const conditionalChildren = currentSectionData.questions.filter(q => 
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

        // Note: Eligibility checking moved to moveToNextQuestion() when leaving eligibility section
    // This allows users to complete all questions before being checked
  };

  // Validation functions
  const validateQuestion = (question) => {
    // Skip validation for info cards
    if (question.type === 'info') return null;
    
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
    
    console.log('=== moveToNextQuestion DEBUG ===');
    console.log('Current section:', currentSection);
    console.log('Current section title:', applicationQuestions[currentSection]?.title);
    console.log('isEligibilitySection():', isEligibilitySection());
    console.log('Current global index:', currentGlobalIndex);
    console.log('All questions length:', allQuestions.length);
    
    if (currentGlobalIndex < allQuestions.length - 1) {
      // Check if we're moving from eligibility section to next section
      const nextGlobalIndex = currentGlobalIndex + 1;
      const { sectionIndex: nextSectionIndex } = getLocalIndicesFromGlobal(nextGlobalIndex);
      
      console.log('Next section index:', nextSectionIndex);
      console.log('Current section index:', currentSection);
      console.log('Will move to different section:', nextSectionIndex !== currentSection);
      
      // If we're currently in eligibility section and moving to a different section
      if (isEligibilitySection() && nextSectionIndex !== currentSection) {
        console.log('Moving from eligibility section to next section, checking eligibility...');
        console.log('Form data for eligibility check:', formData);
        console.log('Current session:', currentSession);
        
        const isEligible = await checkEligibility();
        
        console.log('Eligibility check result:', isEligible);
        
        if (!isEligible) {
          // User is not eligible, eligibility state will be set in checkEligibility
          console.log('User is not eligible, stopping navigation');
          return;
        }
      }
      
      // Move to next question
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(nextGlobalIndex);
      
      console.log('Moving to section:', sectionIndex, 'question:', questionIndex);
      
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
      localStorage.setItem('applicationCurrentSection', sectionIndex.toString());
      localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
    } else {
      console.log('At last question, cannot move to next');
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
    // Handle intro section
    if (targetSectionIndex === -1) {
      console.log('Navigating to intro section');
      setCurrentSection(-1);
      setCurrentQuestionIndex(0);
      setShowValidation(false);
      setValidationErrors({});
      // Save to localStorage
      localStorage.setItem('applicationCurrentSection', '-1');
      localStorage.setItem('applicationCurrentQuestionIndex', '0');
      return;
    }
    
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
        
        await Swal.fire({
          icon: 'warning',
          title: 'Incomplete Application',
          text: `Please complete all required fields. Found ${Object.keys(allErrors).length} missing required field(s).`,
          confirmButtonColor: '#4242ea',
          background: 'var(--color-background-dark)',
          color: 'var(--color-text-primary)',
          confirmButtonText: 'OK, I\'ll complete them'
        });
        return;
      }

      if (currentSession?.application) {
        await databaseService.submitApplication(currentSession.application.application_id);
        
        // Clear saved data
        localStorage.removeItem('applicationFormData');
        localStorage.removeItem('applicationCurrentSection');
        localStorage.removeItem('applicationCurrentQuestionIndex');
        localStorage.setItem('applicationStatus', 'submitted');
        
        await Swal.fire({
          icon: 'success',
          title: '🎉 Application Submitted!',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 18px; margin: 15px 0;">Your application has been successfully submitted!</p>
              <p style="font-size: 16px; margin: 10px 0;">We'll review your application and get back to you soon.</p>
              <p style="font-size: 14px; color: #888; margin-top: 20px;">Thank you for your interest in our program!</p>
            </div>
          `,
          confirmButtonText: 'Continue to Dashboard',
          confirmButtonColor: '#4242ea',
          background: 'var(--color-background-dark)',
          color: 'var(--color-text-primary)',
          timer: 5000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__bounceIn'
          }
        });
        navigate('/apply');
      } else {
        throw new Error('No active application session');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Error submitting application. Please try again.',
        confirmButtonColor: '#4242ea',
        background: 'var(--color-background-dark)',
        color: 'var(--color-text-primary)',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current section is the eligibility section (section ID 'your_eligibility')
  const isEligibilitySection = () => {
    if (!applicationQuestions[currentSection]) return false;
    return applicationQuestions[currentSection].id === 'your_eligibility';
  };

  // Check eligibility
  const checkEligibility = async () => {
    try {
      console.log('=== checkEligibility DEBUG ===');
      console.log('Current session:', currentSession);
      console.log('Applicant ID:', currentSession?.applicant?.applicant_id);
      console.log('Form data being sent:', formData);
      
      if (!currentSession?.applicant?.applicant_id) {
        console.warn('No applicant ID available for eligibility check');
        return true; // Allow to continue if we can't check
      }

      console.log('Calling databaseService.checkEligibility...');
      const eligibilityResults = await databaseService.checkEligibility(
        formData, 
        currentSession.applicant.applicant_id
      );

      console.log('Eligibility results received:', eligibilityResults);

      if (!eligibilityResults.isEligible) {
        console.log('User is ineligible, showing modal');
        console.log('Failed criteria:', eligibilityResults.failedCriteria);
        
        setIsIneligible(true);
        setEligibilityFailures(eligibilityResults.failedCriteria || []);
        
        // Set application status to ineligible
        localStorage.setItem('applicationStatus', 'ineligible');
        
        return false;
      }

      console.log('User is eligible, continuing navigation');
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

  // Handle starting the application from intro
  const handleBeginApplication = () => {
    setCurrentSection(0);
    setCurrentQuestionIndex(0);
  };

  // Helper function to render question label with inline links
  const renderQuestionLabel = (question) => {
    if (question.link && question.link.replaceInLabel) {
      // Replace the link text in the label with an actual clickable link
      const parts = question.label.split(question.link.text);
      
      return (
        <>
          {parts[0]?.trimEnd() || ''}
          <a 
            href={question.link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            {question.link.text}
          </a>
          {parts[1]?.trimStart() || ''}
        </>
      );
    } else {
      // Regular label + separate link
      return (
        <>
          {question.label}
          {question.link && (
            <a href={question.link.url} target="_blank" rel="noopener noreferrer">
              {question.link.text}
            </a>
          )}
        </>
      );
    }
  };

  // Render different input types
  const renderQuestion = (question) => {
    const hasError = showValidation && validationErrors[question.id];
    const commonProps = {
      id: question.id,
      value: formData[question.id] || '',
      onChange: (e) => handleInputChange(question.id, e.target.value),
      required: question.required,
      className: `application-form__input ${hasError ? 'application-form__input--error' : ''}`
    };

    // Address question with Google Maps
    if (question.label && question.label.toLowerCase().includes('address')) {
      return (
        <AddressAutocomplete
          value={formData[question.id] || ''}
          onChange={(value) => handleInputChange(question.id, value)}
          placeholder="Enter your address"
          required={question.required}
          className={hasError ? 'application-form__input--error' : ''}
        />
      );
    }

    switch (question.type) {
      case 'textarea':
      return (
        <div className="application-form__long-text-container">
          <textarea
            {...commonProps}
            rows={12}
            className={`application-form__input application-form__long-text-input ${hasError ? 'application-form__input--error' : ''}`}
              placeholder={question.placeholder || "Please provide your response..."}
              maxLength={2000}
          />
            <div className="application-form__long-text-counter">
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
            <div className="application-form__radio-group">
              {question.options && question.options.map(option => (
                <label key={option} className="application-form__radio-option">
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
          <div className={`application-form__checkbox-group ${hasError ? 'application-form__checkbox-group--error' : ''}`}>
            {question.options && question.options.map(option => (
              <label key={option} className="application-form__checkbox-option">
                <input
                  type="checkbox"
                  name={question.id}
                  value={option}
                  checked={formData[question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const value = e.target.value;
                    const checked = e.target.checked;
                    const currentOptions = formData[question.id] || [];
                    let newValue;
                    if (checked) {
                      newValue = [...currentOptions, value];
                    } else {
                      newValue = currentOptions.filter(item => item !== value);
                    }
                    handleInputChange(question.id, newValue);
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
          <div className="application-form__radio-group">
            {question.options && question.options.map(option => (
              <label key={option} className="application-form__radio-option">
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

      case 'info':
        // For info cards - display content without input fields
        return (
          <div className="application-form__info-card">
            <div className="application-form__info-card-content">
              {question.label.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
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
        <div className="application-form__loading-state">
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
        <div className="application-form__error-state">
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
        <div className="application-form__error-state">
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
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <img src="/logo-full.png" alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
          </div>
          {currentSession && (
          <div className="admissions-dashboard__welcome-text">
              Welcome, {currentSession.applicant.first_name}
          </div>
          )}
        </div>
        <div className="admissions-dashboard__topbar-right">
          <button 
            onClick={() => navigate('/apply')} 
            className="admissions-dashboard__button--secondary"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={handleLogout}
            className="admissions-dashboard__button--primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="application-form__main">
        {/* Form Content - Full Width */}
        <div className="application-form__column">
          {/* Section Navigation - Moved here from left sidebar */}
          <div className="section-nav">
            {/* Intro Tab */}
            <div 
              className={`section-nav__item ${currentSection === -1 ? 'section-nav__item--active' : ''}`}
              onClick={() => navigateToSection(-1)}
              style={{ cursor: 'pointer' }}
            >
              <span className="section-nav__title">
                0. INTRODUCTION
              </span>
              <span className="section-nav__progress">
                
              </span>
        </div>

            {/* Form Section Tabs */}
            {applicationQuestions.map((section, index) => {
              const sectionQuestions = section.questions || [];
              const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
              const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
              const completedCount = getCompletedQuestionsInSection(sectionQuestions);
              const totalCount = visibleRootQuestions.length;
              
              return (
                <div 
                  key={section.id} 
                  className={`section-nav__item ${index === currentSection ? 'section-nav__item--active' : ''}`}
                  onClick={() => navigateToSection(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="section-nav__title">
                    {index + 1}. {section.title}
                  </span>
                  <span className="section-nav__progress">
                    {completedCount} / {totalCount}
                  </span>
                </div>
              );
            })}
            </div>

          <div className="application-form">
            {/* Show intro content when on intro tab */}
            {currentSection === -1 ? (
              <div className="application-form__intro-tab">
                <div className="application-form__intro-tab-content">
                  <h2 className="application-form__intro-tab-title">WELCOME TO YOUR AI-NATIVE APPLICATION!</h2>
                  <div className="application-form__intro-tab-description">
                    <p className="first-paragraph"><strong>The goal of this program is to train AI-natives. It's about approaching problems using AI first, knowing how to engage with it effectively, and being comfortable adapting as the technology evolves.</strong></p>

                    <p><strong>No coding experience is required.</strong></p>
                    
                    <p>If you're open to learning, excited by new ideas, and eager to explore the potential of AI, this program is for you.</p>
                    
                    <p>We highly encourage communities underrepresented in tech and those without college degrees to apply.</p>
                  </div>
                  
                  <div className="application-form__intro-tab-actions">
                    <button 
                      onClick={handleBeginApplication}
                      className="application-form__intro-button"
                      type="button"
                    >
                      Begin Application
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              <div className="application-form__form-section">
                  <h2 className="application-form__form-section-title">
                  {(() => {
                    const questionInfo = getCurrentQuestionInfo();
                    return (
                      <>
                        {questionInfo.sectionName}
                          <span className="application-form__question-counter">
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
                      {currentQuestionGroup.rootQuestion.type === 'info' ? (
                        // Special handling for info cards - no labels or form structure
                        <div key={currentQuestionGroup.rootQuestion.id} className="application-form__question-group application-form__question-group--info">
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                        </div>
                      ) : (
                        <div 
                          key={currentQuestionGroup.rootQuestion.id} 
                          className="application-form__question-group application-form__question-group--root"
                        >
                          <label htmlFor={currentQuestionGroup.rootQuestion.id} className="application-form__question-label">
                            {renderQuestionLabel(currentQuestionGroup.rootQuestion)}
                            {currentQuestionGroup.rootQuestion.required ? (
                              <span className="application-form__question-required">*</span>
                            ) : (
                              <span className="application-form__question-optional">(optional)</span>
                            )}
                          </label>
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                          {showValidation && validationErrors[currentQuestionGroup.rootQuestion.id] && (
                            <div className="application-form__validation-error">
                              {validationErrors[currentQuestionGroup.rootQuestion.id]}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conditional Questions */}
                      {currentQuestionGroup.conditionalQuestions.map((question) => (
                        question.type === 'info' ? (
                          // Special handling for info cards - no labels or form structure
                          <div key={question.id} className="application-form__question-group application-form__question-group--info">
                            {renderQuestion(question)}
                          </div>
                        ) : (
                          <div 
                            key={question.id} 
                            className="application-form__question-group application-form__question-group--conditional"
                          >
                            <label htmlFor={question.id} className="application-form__question-label">
                              {renderQuestionLabel(question)}
                              {question.required ? (
                                <span className="application-form__question-required">*</span>
                              ) : (
                                <span className="application-form__question-optional">(optional)</span>
                              )}
                            </label>
                            {renderQuestion(question)}
                            {showValidation && validationErrors[question.id] && (
                              <div className="application-form__validation-error">
                                {validationErrors[question.id]}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </>
                  );
                })()}
              </div>
              
              {/* Navigation */}
              <div className="application-form__navigation">
                {getCurrentQuestionGlobalIndex() > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="application-form__nav-button application-form__nav-button--previous"
                  >
                    Previous
                  </button>
                )}
                
                {getCurrentQuestionGlobalIndex() < getAllRootQuestions().length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="application-form__nav-button application-form__nav-button--next"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="application-form__nav-button application-form__nav-button--next"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
            </div>
          </form>
            )}
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