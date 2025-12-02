import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import AddressAutocomplete from '../../components/AddressAutocomplete/AddressAutocomplete';
import IneligibleModal from '../../components/IneligibleScreen/IneligibleScreen';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { AnimatedRadioGroup, AnimatedRadioItem } from '../../components/ui/animated-radio';
import { AnimatedCheckbox } from '../../components/ui/animated-checkbox';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const saveTimeoutRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(-1);
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

  useEffect(() => {
    const initializeApplication = async () => {
      try {
        setIsLoading(true);
        
        const questions = await databaseService.fetchApplicationQuestions();
        setApplicationQuestions(questions);
        
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
        
        const applicant = await databaseService.createOrGetApplicant(email, firstName, lastName);
        console.log('Applicant:', applicant);
        
        let existingApplication = null;
        try {
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
        
        let application = existingApplication;
        if (!application) {
          console.log('Creating new application...');
          databaseService.currentApplicant = applicant;
          application = await databaseService.createApplication();
          console.log('Created new application:', application);
        }
        
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
            
            if (resetFromUrl) {
              const url = new URL(window.location);
              url.searchParams.delete('resetEligibility');
              window.history.replaceState({}, '', url);
            }
            
            try {
              console.log('🔄 RESET DEBUG: Calling resetEligibility...');
              const resetResult = await databaseService.resetEligibility(applicant.applicant_id);
              console.log('🔄 RESET DEBUG: Reset result:', resetResult);
              
              if (resetResult && resetResult.success) {
                console.log('🔄 RESET DEBUG: Re-fetching application after reset...');
                try {
                  const updatedApplication = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/${applicant.applicant_id}/application`, {
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  if (updatedApplication.ok) {
                    application = await updatedApplication.json();
                    console.log('✅ RESET DEBUG: Re-fetched application:', application);
                  } else {
                    application.status = 'in_progress';
                    console.log('⚠️ RESET DEBUG: Could not re-fetch, updating local object');
                  }
                } catch (fetchError) {
                  console.warn('⚠️ RESET DEBUG: Error re-fetching application:', fetchError);
                  application.status = 'in_progress';
                }
                
                console.log('✅ RESET DEBUG: Application status after reset:', application.status);
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
            console.log('Application is marked as ineligible, redirecting to dashboard');
            localStorage.setItem('applicationStatus', 'ineligible');
            navigate('/apply');
            return;
          }
        }
        
        console.log('🔍 RESET DEBUG: After reset check, application status:', application?.status);
        
        const session = {
          applicant,
          application
        };
        setCurrentSession(session);
        
        databaseService.currentApplication = application;
        
        if (application?.application_id) {
          console.log('Loading form data for application:', application.application_id);
          const savedFormData = await databaseService.loadFormData(application.application_id);
          console.log('Loaded form data:', savedFormData);
          
          if (Object.keys(savedFormData).length > 0) {
            setFormData(savedFormData);
            
            const savedSection = localStorage.getItem('applicationCurrentSection');
            if (savedSection) {
              const sectionIndex = parseInt(savedSection, 10);
              setCurrentSection(sectionIndex);
            }
            
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

  // Handle ineligible status redirect
  useEffect(() => {
    if (currentSession?.application?.status === 'ineligible') {
      console.log('Application is ineligible, redirecting to dashboard');
      localStorage.setItem('applicationStatus', 'ineligible');
      navigate('/apply');
    }
  }, [currentSession?.application?.status, navigate]);

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

  useEffect(() => {
    if (Object.keys(formData).length === 0 || !currentSession?.application?.application_id) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Auto-saving form data...', {
          formDataKeys: Object.keys(formData),
          applicationId: currentSession?.application?.application_id,
          sessionExists: !!currentSession
        });
        
        localStorage.setItem('applicationFormData', JSON.stringify(formData));
        console.log('Saved to localStorage');
        
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
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, currentSession]);

  useEffect(() => {
    if (applicationQuestions.length > 0) {
      const wasResetForEditing = localStorage.getItem('eligibilityResetForEditing');
      if (wasResetForEditing === 'true') {
        console.log('Navigating to eligibility section for editing');
        localStorage.removeItem('eligibilityResetForEditing');
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
        const savedSection = localStorage.getItem('applicationCurrentSection');
        const savedQuestionIndex = localStorage.getItem('applicationCurrentQuestionIndex');
        
        if (!savedSection || !savedQuestionIndex) {
          initializeNavigation();
        } else {
          const sectionIndex = parseInt(savedSection, 10);
          if (sectionIndex === -1) {
            setCurrentSection(-1);
            setCurrentQuestionIndex(0);
          } else if (sectionIndex >= 0 && sectionIndex < applicationQuestions.length) {
          ensureRootQuestionPosition();
          } else {
            initializeNavigation();
          }
        }
      }
    }
  }, [applicationQuestions]);

  useEffect(() => {
    ensureRootQuestionPosition();
  }, [currentSection, currentQuestionIndex, applicationQuestions]);

  const handleInputChange = async (questionId, value) => {
    console.log(`Input changed: ${questionId} = ${value}`);
    
    const currentSectionData = applicationQuestions.find(section => 
      section.questions && section.questions.find(q => q.id === questionId)
    );
    
    let updatedFormData = {
      ...formData,
      [questionId]: value
    };

    if (currentSectionData) {
      const conditionalChildren = currentSectionData.questions.filter(q => 
        q.parentQuestionId === questionId
      );
      
      conditionalChildren.forEach(child => {
        console.log(`Clearing conditional question ${child.id} due to parent change`);
        updatedFormData[child.id] = '';
      });
    }
    
    setFormData(updatedFormData);

    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateQuestion = (question) => {
    if (question.type === 'info') return null;
    
    if (!question.required) return null;
    
    const value = formData[question.id];
    
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
    
    if (currentQuestionGroup.rootQuestion) {
      const error = validateQuestion(currentQuestionGroup.rootQuestion);
      if (error) {
        errors[currentQuestionGroup.rootQuestion.id] = error;
      }
    }
    
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

  const sectionHasErrors = (sectionQuestions) => {
    const errors = validateSection(sectionQuestions);
    return Object.keys(errors).length > 0;
  };

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

  const getVisibleQuestions = (sectionQuestions) => {
    return sectionQuestions.filter(shouldShowQuestion);
  };

  const getAllRootQuestions = () => {
    let allQuestions = [];
    applicationQuestions.forEach((section, sectionIndex) => {
      if (section.questions) {
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

  const getConditionalQuestionsForParent = (parentQuestionId, sectionQuestions) => {
    if (!sectionQuestions) return [];
    
    return sectionQuestions.filter(question => 
      question.parentQuestionId === parentQuestionId && shouldShowQuestion(question)
    );
  };

  const getCurrentQuestions = () => {
    const allRootQuestions = getAllRootQuestions();
    
    if (allRootQuestions.length === 0) return { rootQuestion: null, conditionalQuestions: [] };
    
    const currentQuestionGlobalIndex = getCurrentQuestionGlobalIndex();
    if (currentQuestionGlobalIndex >= 0 && currentQuestionGlobalIndex < allRootQuestions.length) {
      const currentRootQuestion = allRootQuestions[currentQuestionGlobalIndex];
      
      const section = applicationQuestions[currentRootQuestion.sectionIndex];
      
      const conditionalQuestions = getConditionalQuestionsForParent(
        currentRootQuestion.id, 
        section.questions
      );
      
      return {
        rootQuestion: currentRootQuestion,
        conditionalQuestions: conditionalQuestions
      };
    }
    
    return { rootQuestion: null, conditionalQuestions: [] };
  };

  const getCurrentQuestionGlobalIndex = () => {
    if (applicationQuestions.length === 0) return 0;
    
    let globalIndex = 0;
    
    for (let sectionIndex = 0; sectionIndex < currentSection; sectionIndex++) {
      if (applicationQuestions[sectionIndex]?.questions) {
        const rootQuestions = applicationQuestions[sectionIndex].questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        globalIndex += visibleRootQuestions.length;
      }
    }
    
    if (applicationQuestions[currentSection]?.questions) {
      const currentSectionQuestions = applicationQuestions[currentSection].questions;
      const currentQuestion = currentSectionQuestions[currentQuestionIndex];
      
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

  const initializeNavigation = () => {
    if (applicationQuestions.length === 0) return;
    
    for (let sectionIndex = 0; sectionIndex < applicationQuestions.length; sectionIndex++) {
      const section = applicationQuestions[sectionIndex];
      if (section?.questions) {
        const rootQuestions = section.questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        
        if (visibleRootQuestions.length > 0) {
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

  const ensureRootQuestionPosition = () => {
    if (applicationQuestions.length === 0) return;
    
    const currentSectionData = applicationQuestions[currentSection];
    if (!currentSectionData?.questions) return;
    
    const currentQuestion = currentSectionData.questions[currentQuestionIndex];
    
    if (currentQuestion?.parentQuestionId) {
      const rootQuestions = currentSectionData.questions.filter(q => !q.parentQuestionId);
      const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
      
      if (visibleRootQuestions.length > 0) {
        const firstRootQuestion = visibleRootQuestions[0];
        const questionIndex = currentSectionData.questions.findIndex(q => q.id === firstRootQuestion.id);
        
        setCurrentQuestionIndex(questionIndex);
        localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
      }
    }
  };

  const handleNext = async () => {
    const errors = validateCurrentQuestions();
    
    if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
      setShowValidation(true);
      
      const firstErrorId = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }

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
      const nextGlobalIndex = currentGlobalIndex + 1;
      const { sectionIndex: nextSectionIndex } = getLocalIndicesFromGlobal(nextGlobalIndex);
      
      console.log('Next section index:', nextSectionIndex);
      console.log('Current section index:', currentSection);
      console.log('Will move to different section:', nextSectionIndex !== currentSection);
      
      if (isEligibilitySection() && nextSectionIndex !== currentSection) {
        console.log('Moving from eligibility section to next section, checking eligibility...');
        console.log('Form data for eligibility check:', formData);
        console.log('Current session:', currentSession);
        
        const isEligible = await checkEligibility();
        
        console.log('Eligibility check result:', isEligible);
        
        if (!isEligible) {
          console.log('User is not eligible, stopping navigation');
          return;
        }
      }
      
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
      const prevGlobalIndex = currentGlobalIndex - 1;
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(prevGlobalIndex);
      
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
      localStorage.setItem('applicationCurrentSection', sectionIndex.toString());
      localStorage.setItem('applicationCurrentQuestionIndex', questionIndex.toString());
    }
  };

  const getLocalIndicesFromGlobal = (globalIndex) => {
    let currentGlobal = 0;
    
    for (let sectionIndex = 0; sectionIndex < applicationQuestions.length; sectionIndex++) {
      if (applicationQuestions[sectionIndex]?.questions) {
        const rootQuestions = applicationQuestions[sectionIndex].questions.filter(q => !q.parentQuestionId);
        const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
        
        if (currentGlobal + visibleRootQuestions.length > globalIndex) {
          const questionIndex = globalIndex - currentGlobal;
          
          const targetRootQuestion = visibleRootQuestions[questionIndex];
          const actualQuestionIndex = applicationQuestions[sectionIndex].questions.findIndex(
            q => q.id === targetRootQuestion.id
          );
          
          return { sectionIndex, questionIndex: actualQuestionIndex };
        }
        
        currentGlobal += visibleRootQuestions.length;
      }
    }
    
    return { sectionIndex: applicationQuestions.length - 1, questionIndex: 0 };
  };

  const navigateToSection = (targetSectionIndex) => {
    if (targetSectionIndex === -1) {
      console.log('Navigating to intro section');
      setCurrentSection(-1);
      setCurrentQuestionIndex(0);
      setShowValidation(false);
      setValidationErrors({});
      localStorage.setItem('applicationCurrentSection', '-1');
      localStorage.setItem('applicationCurrentQuestionIndex', '0');
      return;
    }
    
    let globalIndex = 0;
    
    for (let sectionIndex = 0; sectionIndex < targetSectionIndex; sectionIndex++) {
      const sectionQuestions = applicationQuestions[sectionIndex].questions || [];
      const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
      const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
      globalIndex += visibleRootQuestions.length;
    }
    
    setCurrentQuestionIndex(globalIndex);
    setCurrentSection(targetSectionIndex);
    
    localStorage.setItem('applicationCurrentQuestionIndex', globalIndex.toString());
    localStorage.setItem('applicationCurrentSection', targetSectionIndex.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let allErrors = {};
      
      applicationQuestions.forEach(section => {
        const sectionErrors = validateSection(section.questions);
        allErrors = { ...allErrors, ...sectionErrors };
      });
      
      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        setShowValidation(true);
        setIsSubmitting(false);
        
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
          confirmButtonText: 'OK, I\'ll complete them'
        });
        return;
      }

      if (currentSession?.application) {
        console.log('🎯 Submitting application:', currentSession.application.application_id);
        const result = await databaseService.submitApplication(currentSession.application.application_id);
        console.log('✅ Submission result:', result);
        
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
          timer: 5000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__bounceIn'
          }
        });
        window.location.href = '/apply';
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
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEligibilitySection = () => {
    if (!applicationQuestions[currentSection]) return false;
    return applicationQuestions[currentSection].id === 'your_eligibility';
  };

  const checkEligibility = async () => {
    try {
      console.log('=== checkEligibility DEBUG ===');
      console.log('Current session:', currentSession);
      console.log('Applicant ID:', currentSession?.applicant?.applicant_id);
      console.log('Form data being sent:', formData);
      
      if (!currentSession?.applicant?.applicant_id) {
        console.warn('No applicant ID available for eligibility check');
        return true;
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
        
        localStorage.setItem('applicationStatus', 'ineligible');
        
        return false;
      }

      console.log('User is eligible, continuing navigation');
      return true;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return true;
    }
  };

  const handleIneligibleModalClose = () => {
    setIsIneligible(false);
    navigate('/apply');
  };

  const handleBeginApplication = () => {
    setCurrentSection(0);
    setCurrentQuestionIndex(0);
  };

  const renderQuestionLabel = (question) => {
    if (question.link && question.link.replaceInLabel) {
      const parts = question.label.split(question.link.text);
      
      return (
        <>
          {parts[0] || ''}
          <a 
            href={question.link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#4242EA] hover:text-[#3535D1] underline"
          >
            {question.link.text}
          </a>
          {parts[1] || ''}
        </>
      );
    } else {
      return (
        <>
          {question.label}
          {question.link && (
            <a 
              href={question.link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4242EA] hover:text-[#3535D1] underline ml-1"
            >
              {question.link.text}
            </a>
          )}
        </>
      );
    }
  };

  const renderQuestion = (question) => {
    const hasError = showValidation && validationErrors[question.id];

    if (question.label && question.label.toLowerCase().includes('address')) {
      return (
        <AddressAutocomplete
          value={formData[question.id] || ''}
          onChange={(value) => handleInputChange(question.id, value)}
          placeholder="Enter your address"
          required={question.required}
          className={hasError ? 'border-red-500' : ''}
        />
      );
    }

    switch (question.type) {
      case 'textarea':
      return (
        <div className="space-y-2">
          <Textarea
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            rows={12}
            className={`resize-none text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
              placeholder={question.placeholder || "Please provide your response..."}
              maxLength={2000}
          />
            <div className="text-sm text-[#666] text-right">
              {(formData[question.id] || '').length} / 2000 characters
          </div>
        </div>
      );
      
      case 'radio':
        if (question.options && question.options.length > 6) {
          return (
            <select
              id={question.id}
              value={formData[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] ${hasError ? 'border-red-500' : 'border-[#C8C8C8]'}`}
            >
              <option value="">Please select...</option>
              {question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
        } else {
          return (
            <AnimatedRadioGroup
              value={formData[question.id] || ''}
              onValueChange={(value) => handleInputChange(question.id, value)}
              className="space-y-3"
            >
              {question.options && question.options.map(option => (
                <AnimatedRadioItem key={option} value={option}>
                  {option}
                </AnimatedRadioItem>
              ))}
            </AnimatedRadioGroup>
          );
        }

      case 'checkbox':
        return (
          <div className={`space-y-3 ${hasError ? 'border border-red-500 rounded-lg p-3' : ''}`}>
            {question.options && question.options.map(option => (
              <AnimatedCheckbox
                key={option}
                checked={formData[question.id]?.includes(option) || false}
                onCheckedChange={(checked) => {
                  const currentOptions = formData[question.id] || [];
                  let newValue;
                  if (checked) {
                    newValue = [...currentOptions, option];
                  } else {
                    newValue = currentOptions.filter(item => item !== option);
                  }
                  handleInputChange(question.id, newValue);
                }}
              >
                {option}
              </AnimatedCheckbox>
            ))}
          </div>
        );

      case 'select':
        return (
          <AnimatedRadioGroup
            value={formData[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
            className="space-y-3"
          >
            {question.options && question.options.map(option => (
              <AnimatedRadioItem key={option} value={option}>
                {option}
              </AnimatedRadioItem>
            ))}
          </AnimatedRadioGroup>
        );

      case 'date':
        return (
          <Input
            id={question.id}
            type="date"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            className={`text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'email':
        return (
          <Input
            id={question.id}
            type="email"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            placeholder="your@email.com"
            className={`text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'tel':
        return (
          <Input
            id={question.id}
            type="tel"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            placeholder="(555) 123-4567"
            className={`text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            placeholder="Enter a number"
            className={`text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
          />
        );

      case 'info':
        return (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 space-y-4">
              {question.label.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                
                // Skip empty lines but add spacing
                if (!trimmedLine) {
                  return null;
                }
                
                // Check if line looks like a header (short, no punctuation at end, or has colon)
                const isHeader = (
                  trimmedLine.endsWith(':') ||
                  (trimmedLine.length < 50 && !trimmedLine.endsWith('.') && !trimmedLine.endsWith('?') && !trimmedLine.endsWith('!'))
                );
                
                // Check if line starts with a number or bullet
                const isListItem = /^(\d+[\.\):]|\-|\•|\*)\s/.test(trimmedLine);
                
                if (isHeader && !isListItem) {
                  return (
                    <h4 key={index} className="text-lg font-bold text-[#1E1E1E] mt-2">
                      {trimmedLine}
                    </h4>
                  );
                }
                
                if (isListItem) {
                  return (
                    <p key={index} className="text-[#1E1E1E] leading-relaxed pl-4">
                      {trimmedLine}
                    </p>
                  );
                }
                
                return (
                  <p key={index} className="text-[#1E1E1E] leading-relaxed">
                    {trimmedLine}
                  </p>
                );
              })}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Input
            id={question.id}
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            placeholder={question.placeholder || "Enter your response"}
            className={`text-[#1E1E1E] bg-white border-[#C8C8C8] ${hasError ? 'border-red-500' : ''}`}
          />
        );
    }
  };

  if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">Loading Application...</h2>
          <p className="text-[#666]">Please wait while we prepare your application form.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Error Loading Application</h2>
          <p className="text-[#666] mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (applicationQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEF]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">No Questions Available</h2>
          <p className="text-[#666] mb-6">There are no application questions available at this time.</p>
          <Button onClick={() => navigate('/apply')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentQuestions = getCurrentQuestions();
  const currentSectionData = applicationQuestions[currentSection];

  const getCompletedQuestionsInSection = (sectionQuestions) => {
    const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
    const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
    return visibleRootQuestions.filter(question => {
      const value = formData[question.id];
      return value !== null && value !== undefined && value !== '' && 
             !(Array.isArray(value) && value.length === 0);
    }).length;
  };

  const getCurrentQuestionInfo = () => {
    const currentQuestionGroup = getCurrentQuestions();
    
    if (!currentQuestionGroup.rootQuestion) {
      return { sectionName: '', questionNumber: 1, totalInSection: 1 };
    }
    
    const currentQuestion = currentQuestionGroup.rootQuestion;
    const sectionQuestions = applicationQuestions[currentQuestion.sectionIndex]?.questions || [];
    const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
    const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
    
    const questionPosition = visibleRootQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
    
    return {
      sectionName: currentQuestion.sectionTitle || '',
      questionNumber: questionPosition,
      totalInSection: visibleRootQuestions.length
    };
  };

  return (
    <div className="min-h-screen bg-[#EFEFEF] font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#C8C8C8] px-4 md:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <img 
              src="/logo-full.png" 
              alt="Pursuit Logo" 
              className="h-8 md:h-10 object-contain"
              style={{ filter: 'invert(1)' }}
            />
          {currentSession && (
          <div className="text-base md:text-lg font-semibold text-[#1E1E1E]">
              Welcome, {currentSession.applicant.first_name}
          </div>
          )}
        </div>
          <div className="flex items-center gap-2 md:gap-4">
          <Button 
            onClick={() => navigate('/apply')} 
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
          >
              ← Back to Dashboard
          </Button>
          <Button 
            onClick={handleLogout}
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
          >
            Log Out
          </Button>
        </div>
      </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-8">
          {/* Section Navigation */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button 
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                currentSection === -1 
                  ? 'bg-[#4242EA] text-white' 
                  : 'bg-white text-[#666] hover:bg-gray-50 border border-[#C8C8C8]'
              }`}
              onClick={() => navigateToSection(-1)}
            >
              0. INTRODUCTION
            </button>

            {applicationQuestions.map((section, index) => {
              const sectionQuestions = section.questions || [];
              const rootQuestions = sectionQuestions.filter(q => !q.parentQuestionId);
              const visibleRootQuestions = rootQuestions.filter(shouldShowQuestion);
              const completedCount = getCompletedQuestionsInSection(sectionQuestions);
              const totalCount = visibleRootQuestions.length;
              
              return (
                <button
                  key={section.id} 
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    index === currentSection
                      ? 'bg-[#4242EA] text-white'
                      : 'bg-white text-[#666] hover:bg-gray-50 border border-[#C8C8C8]'
                  }`}
                  onClick={() => navigateToSection(index)}
                >
                  <div>{index + 1}. {section.title}</div>
                  <div className="text-xs mt-1 opacity-80">{completedCount} / {totalCount}</div>
                </button>
              );
            })}
            </div>

          <div>
            {currentSection === -1 ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-[#1E1E1E]">Welcome to the Pursuit Application!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed text-[#1E1E1E]">
                      We're excited you're here. Applications for our next cohort launching on <strong>March 14th</strong> close <strong>February 15th</strong>, so now's the time to share your story.
                  </p>

                    <div>
                      <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">When filling out your application, keep these things in mind:</h3>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-[#4242EA] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <strong>Take your time.</strong> Go beyond one-word answers—help us get to know you by sharing your whole story.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-[#4242EA] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <strong>Be honest.</strong> No tech experience? That's okay! We care more about your drive and why you're excited to learn.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-[#4242EA] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                        <div>
                          <strong>Show curiosity.</strong> Tell us how you think, how you ask questions, and how you approach new challenges.
                        </div>
                      </li>
                    </ul>
                  </div>

                  <p className="text-lg text-[#1E1E1E]">
                      This is your chance to help us understand not just where you've been, but where you want to go.
                  </p>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-[#1E1E1E] mb-3">
                        Reminder that to be considered for workshops, you must:
                      </h3>
                      <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-blue-600" />
                          <span>Complete an application in full.</span>
                        </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-blue-600" />
                          <span>Meet all eligibility requirements (see below).</span>
                        </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-blue-600" />
                          <span>Attend an information session before the deadline.</span>
                        </li>
                      </ul>
                      </CardContent>
                    </Card>

                    <details className="border border-[#C8C8C8] rounded-lg p-4">
                      <summary className="cursor-pointer font-bold text-lg text-[#1E1E1E]">
                      Eligibility Requirements
                    </summary>
                      <div className="mt-4 space-y-2 text-[#1E1E1E]">
                      <p>Applicants must meet all of the following:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Annual salary/income is less than $45,000</li>
                        <li>18 years or older</li>
                        <li>Proficient in English (speaking and writing)</li>
                        <li>Eligible to work in the U.S.</li>
                        <li>Able to commit to the full in-person schedule</li>
                        <li>Committed to participating for the full length of the program</li>
                      </ul>
                    </div>
                  </details>

                    <details className="border border-[#C8C8C8] rounded-lg p-4">
                      <summary className="cursor-pointer font-bold text-lg text-[#1E1E1E]">
                      FAQs
                    </summary>
                      <div className="mt-4 space-y-4 text-[#1E1E1E]">
                        <div>
                        <h4 className="font-semibold mb-1">Do I need to attend an info session?</h4>
                        <p>Yes, attendance is required to be considered.</p>
                        </div>
                        
                        <div>
                        <h4 className="font-semibold mb-1">What if I want to learn more?</h4>
                          <p>Visit our <a href="https://www.pursuit.org" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:text-[#3535D1] underline">website here</a>!</p>
                        </div>
                        
                        <div>
                        <h4 className="font-semibold mb-1">I have more questions. Who do I contact?</h4>
                          <p>Please reach out to us at: <a href="mailto:admissions@pursuit.org" className="text-[#4242EA] hover:text-[#3535D1] underline">admissions@pursuit.org</a></p>
                        </div>
                      </div>
                    </details>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleBeginApplication}
                      className="w-full bg-[#4242EA] hover:bg-[#3535D1] text-white py-6 text-lg"
                    >
                      Begin Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <form onSubmit={handleSubmit}>
                <Card className="shadow-lg mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                  <CardTitle className="text-2xl font-bold text-[#1E1E1E]">
                  {(() => {
                    const questionInfo = getCurrentQuestionInfo();
                    return (
                      <>
                        {questionInfo.sectionName}
                      </>
                    );
                  })()}
                </CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          Question {(() => {
                            const questionInfo = getCurrentQuestionInfo();
                            return `${questionInfo.questionNumber} of ${questionInfo.totalInSection}`;
                          })()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#666] mb-2">Overall Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-32" />
                          <span className="text-sm font-semibold text-[#1E1E1E]">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                
                  <CardContent className="space-y-6">
                {(() => {
                  const currentQuestionGroup = getCurrentQuestions();
                  
                  if (!currentQuestionGroup.rootQuestion) {
                    return <div>Loading...</div>;
                  }

                  return (
                    <>
                      {currentQuestionGroup.rootQuestion.type === 'info' ? (
                          <div key={currentQuestionGroup.rootQuestion.id}>
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                        </div>
                      ) : (
                        <div 
                          key={currentQuestionGroup.rootQuestion.id} 
                            className="space-y-3"
                        >
                            <label htmlFor={currentQuestionGroup.rootQuestion.id} className="block text-lg font-semibold text-[#1E1E1E]">
                            {renderQuestionLabel(currentQuestionGroup.rootQuestion)}
                            {currentQuestionGroup.rootQuestion.required ? (
                                <span className="text-red-600 ml-1">*</span>
                            ) : (
                                <span className="text-[#666] text-sm font-normal ml-2">(optional)</span>
                            )}
                          </label>
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                          {showValidation && validationErrors[currentQuestionGroup.rootQuestion.id] && (
                              <div className="text-red-600 text-sm mt-1">
                              {validationErrors[currentQuestionGroup.rootQuestion.id]}
                            </div>
                          )}
                        </div>
                      )}

                      {currentQuestionGroup.conditionalQuestions.map((question) => (
                        question.type === 'info' ? (
                            <div key={question.id}>
                            {renderQuestion(question)}
                          </div>
                        ) : (
                          <div 
                            key={question.id} 
                              className="space-y-3 pl-6 border-l-4 border-blue-200"
                          >
                              <label htmlFor={question.id} className="block text-lg font-semibold text-[#1E1E1E]">
                              {renderQuestionLabel(question)}
                              {question.required ? (
                                  <span className="text-red-600 ml-1">*</span>
                              ) : (
                                  <span className="text-[#666] text-sm font-normal ml-2">(optional)</span>
                              )}
                            </label>
                            {renderQuestion(question)}
                            {showValidation && validationErrors[question.id] && (
                                <div className="text-red-600 text-sm mt-1">
                                {validationErrors[question.id]}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </>
                  );
                })()}
                  </CardContent>
                </Card>
              
              {/* Navigation */}
                <div className="flex justify-between items-center gap-4">
                {getCurrentQuestionGlobalIndex() > 0 && (
                  <Button
                    type="button"
                    onClick={handlePrevious}
                      variant="outline"
                      className="border-[#C8C8C8]"
                  >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                  <div className="flex-1" />
                
                {(() => {
                  const currentIdx = getCurrentQuestionGlobalIndex();
                  const totalQ = getAllRootQuestions().length;
                  const isLast = currentIdx >= totalQ - 1;
                  
                  console.log(`Question ${currentIdx + 1} of ${totalQ} - Button: ${isLast ? 'SUBMIT' : 'NEXT'}`);
                  
                  return isLast ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNext();
                      }}
                        className="bg-[#4242EA] hover:bg-[#3535D1] text-white px-8"
                    >
                      Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  );
                })()}
            </div>
          </form>
            )}
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
