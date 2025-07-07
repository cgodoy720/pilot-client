import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import pursuitLogo from '../../assets/pursuit-logo-white.png';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // State for dynamic questions and database integration
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Initialize formData state by attempting to load from localStorage (fallback)
  const [formData, setFormData] = useState(() => {
    // Try to load existing saved data instead of clearing it
    const savedData = localStorage.getItem('applicationFormData');
    if (savedData) {
      try {
        console.log('Loading form data from localStorage:', JSON.parse(savedData));
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
        return {};
      }
    }
    return {};
  });
  
  const [currentSection, setCurrentSection] = useState(() => {
    // Load saved section progress
    const savedSection = localStorage.getItem('applicationCurrentSection');
    return savedSection ? parseInt(savedSection, 10) : 0;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize the application when component mounts
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        setIsLoading(true);
        
        // Fetch questions from database
        const questions = await databaseService.fetchApplicationQuestions();
        setApplicationQuestions(questions);
        
        // Get user info from localStorage or use fallback
        const savedUser = localStorage.getItem('user');
        let email = 'jac@pursuit.org'; // Fallback
        let firstName = 'John'; // Fallback
        let lastName = 'Doe'; // Fallback
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          email = userData.email || email;
          firstName = userData.firstName || userData.first_name || firstName;
          lastName = userData.lastName || userData.last_name || lastName;
        }
        
        const session = await databaseService.initializeApplication(email, firstName, lastName);
        setCurrentSession(session);
        
        // Load existing form data from database if available
        if (session?.application?.application_id) {
          console.log('Loading form data from database...');
          const savedFormData = await databaseService.loadFormData(session.application.application_id);
          
          if (Object.keys(savedFormData).length > 0) {
            console.log('Loaded form data from database:', savedFormData);
            setFormData(prevData => ({
              ...prevData, // Keep any localStorage data
              ...savedFormData // Override with database data
            }));
            
            // Also save to localStorage for offline access
            localStorage.setItem('applicationFormData', JSON.stringify(savedFormData));
          }
        }
        
        console.log('Application initialized:', session);
        
      } catch (error) {
        console.error('Error initializing application:', error);
        setError('Failed to load application. Please refresh the page.');
        
        // Fallback to static questions if database fails
        try {
          const { applicationQuestions: staticQuestions } = await import('../../data/applicationQuestions');
          setApplicationQuestions(staticQuestions);
        } catch (fallbackError) {
          console.error('Failed to load fallback questions:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeApplication();
  }, []);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      console.log('[DEBUG] User data loaded:', userData);
      setUser(userData);
    } else {
      console.log('[DEBUG] No user data found in localStorage');
    }
  }, []);



  // Calculate progress whenever form data changes
  useEffect(() => {
    if (applicationQuestions.length > 0) {
      const totalQuestions = applicationQuestions.reduce((acc, section) => acc + section.questions.length, 0);
      const answeredQuestions = Object.keys(formData).length;
      const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
      setProgress(progressPercentage);
    }
  }, [formData, applicationQuestions]);

  // Save to database and localStorage whenever form data changes
  useEffect(() => {
    const saveToDatabase = async () => {
      if (Object.keys(formData).length === 0) return; // Don't save empty data
      
      console.log('Form data changed:', formData);
      
      // Save to localStorage for offline access
      localStorage.setItem('applicationFormData', JSON.stringify(formData));
      console.log('Saved to localStorage:', formData);
      
      // Save to database if we have a session
      if (currentSession?.application?.application_id) {
        try {
          // Save each response to database
          for (const [questionId, value] of Object.entries(formData)) {
            if (value !== null && value !== undefined && value !== '') {
              const responseValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
              await databaseService.saveResponse(
                currentSession.application.application_id,
                questionId,
                responseValue
              );
            }
          }
          console.log('Saved to database successfully');
        } catch (error) {
          console.error('Error saving to database:', error);
          // Continue anyway - localStorage backup is available
        }
      }
    };

    // Debounce saves to avoid too many API calls
    const timeoutId = setTimeout(saveToDatabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentSession]);

  // Save current section whenever it changes
  useEffect(() => {
    localStorage.setItem('applicationCurrentSection', currentSection.toString());
  }, [currentSection]);

  const handleInputChange = (questionId, value) => {
    console.log(`🔄 handleInputChange called for questionId: ${questionId}, value: "${value}" (type: ${typeof value})`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      console.log(`📝 Updated formData:`, newData);
      return newData;
    });
  };

  const validateAllSections = () => {
    const allErrors = [];
    
    for (let sectionIndex = 0; sectionIndex < applicationQuestions.length; sectionIndex++) {
      const sectionQuestions = applicationQuestions[sectionIndex].questions;
      const sectionTitle = applicationQuestions[sectionIndex].title;
      
      for (const question of sectionQuestions) {
        if (!isQuestionVisible(question)) continue;
        
        if (question.required) {
          const value = formData[question.id];
          
          if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
            allErrors.push(`${sectionTitle}: ${question.label}`);
          }
        }
      }
    }
    
    return allErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all sections before submission
    const validationErrors = validateAllSections();
    
    if (validationErrors.length > 0) {
      alert(`Please complete all required fields before submitting:\n\n${validationErrors.map(error => `• ${error}`).join('\n')}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (currentSession?.application) {
        // Submit application via database service
        await databaseService.submitApplication(currentSession.application.application_id);
        console.log('Application submitted successfully via database');
        
        // Clear saved progress after successful submission
        localStorage.removeItem('applicationFormData');
        localStorage.removeItem('applicationCurrentSection');
        localStorage.setItem('applicationStatus', 'submitted');
        
        alert('Application submitted successfully!');
        navigate('/apply/dashboard');
      } else {
        throw new Error('No active application session');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    // Data is already being saved automatically
    alert('Application progress saved successfully! You can return anytime to continue where you left off.');
  };

  const validateCurrentSection = () => {
    const currentSectionQuestions = applicationQuestions[currentSection].questions;
    const errors = [];
    
    for (const question of currentSectionQuestions) {
      if (!isQuestionVisible(question)) continue;
      
      if (question.required) {
        const value = formData[question.id];
        
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          errors.push(question.label);
        }
      }
    }
    
    return errors;
  };

  const handleNext = () => {
    const validationErrors = validateCurrentSection();
    
    if (validationErrors.length > 0) {
      alert(`Please complete the following required fields:\n\n${validationErrors.map(error => `• ${error}`).join('\n')}`);
      return;
    }
    
    if (currentSection < applicationQuestions.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/apply/login');
  };

  const handleBackToMainApp = () => {
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/apply/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="application-form-container">
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
      <div className="application-form-container">
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
      <div className="application-form-container">
        <div className="error-state">
          <h2>No Questions Available</h2>
          <p>There are no application questions available at this time.</p>
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // Function to check if a question should be visible based on conditions
  const isQuestionVisible = (question) => {
    if (!question.parent_question_id) return true;
    
    const parentAnswer = formData[question.parent_question_id];
    console.log(`🔍 Checking visibility for "${question.label.substring(0, 50)}..."`);
    console.log(`  Parent ID: ${question.parent_question_id}`);
    console.log(`  Parent Answer: "${parentAnswer}"`);
    console.log(`  Show When: "${question.show_when_parent_equals}"`);
    console.log(`  Condition: ${question.condition_type}`);
    
    if (!parentAnswer) {
      console.log(`  Result: HIDDEN (no parent answer)`);
      return false;
    }

    const triggerValues = question.show_when_parent_equals ? 
      question.show_when_parent_equals.split('|').map(v => v.trim()) : [];

    switch (question.condition_type) {
      case 'show_when_equals':
        const isVisible = triggerValues.includes(parentAnswer);
        console.log(`  Result: ${isVisible ? 'VISIBLE' : 'HIDDEN'} (${parentAnswer} ${isVisible ? 'in' : 'not in'} [${triggerValues.join(', ')}])`);
        return isVisible;
      case 'show_when_not_equals':
        const isHidden = triggerValues.includes(parentAnswer);
        console.log(`  Result: ${!isHidden ? 'VISIBLE' : 'HIDDEN'} (${parentAnswer} ${isHidden ? 'in' : 'not in'} [${triggerValues.join(', ')}])`);
        return !isHidden;
      case 'show_when_contains':
        if (Array.isArray(parentAnswer)) {
          const hasMatch = parentAnswer.some(answer => triggerValues.includes(answer));
          console.log(`  Result: ${hasMatch ? 'VISIBLE' : 'HIDDEN'} (array ${JSON.stringify(parentAnswer)} ${hasMatch ? 'contains' : 'does not contain'} any of [${triggerValues.join(', ')}])`);
          return hasMatch;
        } else {
          const hasMatch = triggerValues.some(trigger => parentAnswer.includes(trigger));
          console.log(`  Result: ${hasMatch ? 'VISIBLE' : 'HIDDEN'} ("${parentAnswer}" ${hasMatch ? 'contains' : 'does not contain'} any of [${triggerValues.join(', ')}])`);
          return hasMatch;
        }
      case 'hide_when_equals':
        const shouldHide = triggerValues.includes(parentAnswer);
        console.log(`  Result: ${!shouldHide ? 'VISIBLE' : 'HIDDEN'} (${parentAnswer} ${shouldHide ? 'in' : 'not in'} [${triggerValues.join(', ')}])`);
        return !shouldHide;
      default:
        console.log(`  Result: VISIBLE (unknown condition type: ${question.condition_type})`);
        return true;
    }
  };

  const renderQuestion = (question) => {
    const commonProps = {
      id: question.id,
      value: formData[question.id] || '',
      onChange: (e) => handleInputChange(question.id, e.target.value),
      required: question.required,
      placeholder: question.placeholder,
      style: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        backgroundColor: '#ffffff',
        color: '#374151',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit'
      }
    };

    const focusStyle = {
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 3px rgba(66, 66, 234, 0.1)'
    };

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={6}
            maxLength={question.maxLength}
            style={{
              ...commonProps.style,
              resize: 'vertical',
              minHeight: '120px'
            }}
          />
        );
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={question.min}
            max={question.max}
            step={question.step}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            style={{
              ...commonProps.style,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select...</option>
            {question.options && question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'bool':
        return (
          <select
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => {
              handleInputChange(question.id, e.target.value);
            }}
            required={question.required}
            style={{
              ...commonProps.style,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options && question.options.map(option => (
              <label key={option} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData[question.id]?.includes(option) ? '#f0f9ff' : '#ffffff',
                transition: 'all 0.2s'
              }}>
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
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-primary)'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '16px' }}>{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            {...commonProps}
            type={question.type}
          />
        );
    }
  };

  return (
    <div className="application-form-container" style={{
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        minHeight: '60px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <img src={pursuitLogo} alt="Pursuit Logo" style={{
            height: '24px',
            width: '24px',
            objectFit: 'contain'
          }} />
          <span style={{
            fontWeight: '400',
            fontSize: '1rem',
            color: '#ffffff',
            letterSpacing: '0.025em'
          }}>PURSUIT AI-Native Program</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '400',
            color: '#ffffff'
          }}>Welcome, {user?.firstName || 'John'}!</span>
          <button 
            onClick={handleLogout}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        width: '100vw',
        boxSizing: 'border-box'
      }}>
        {/* Left Column - 40% width */}
        <div style={{
          width: '40%',
          padding: '2rem 1.5rem',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 1rem 0',
            lineHeight: '1.2'
          }}>
            Application
          </h1>
          <p style={{
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#64748b',
            margin: 0
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean accumsan sem mauris, tincidunt vulputate erat porta sit amet. Phasellus facilisis condimentum diam at auctor. Donec mattis metus quis metus eleifend iaculis. Mauris dapibus risus at suscipit iaculis. Cras auctor fringilla blandit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur maximus, odio non consectetur consequat, orci arcu consequat mauris, sed interdum nisl nisl a dolor.
          </p>
          
          {/* Back Button */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={handleBackToDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                color: '#64748b',
                border: 'none',
                padding: '0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = '#64748b'}
            >
              <span style={{ fontSize: '1rem' }}>←</span>
              Back
            </button>
          </div>
        </div>

                 {/* Right Column - 60% width */}
         <div style={{
           width: '60%',
           padding: '2rem 1.5rem',
           backgroundColor: '#333333',
           overflowY: 'auto',
           boxSizing: 'border-box'
         }}>
          {/* Progress Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
                         <h2 style={{
               fontSize: '1rem',
               fontWeight: '500',
               color: '#fffeff',
               margin: 0
             }}>
               Progress
             </h2>
             <span style={{
               fontSize: '1rem',
               fontWeight: '600',
               color: '#fffeff'
             }}>
              {currentSection + 1}/{applicationQuestions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#334155',
            borderRadius: '3px',
            marginBottom: '1.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentSection + 1) / applicationQuestions.length) * 100}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Form Content */}
          {applicationQuestions.length > 0 && (
            <div>
                             <h2 style={{
                 fontSize: '1.25rem',
                 fontWeight: '600',
                 color: '#fffeff',
                 margin: '0 0 1rem 0'
               }}>
                 {applicationQuestions[currentSection].title}
               </h2>
              
              <form onSubmit={handleSubmit}>
                {applicationQuestions[currentSection].questions.map((question) => {
                  if (!isQuestionVisible(question)) {
                    return null;
                  }
                  
                  return (
                    <div key={question.id} style={{ marginBottom: '1rem' }}>
                                             <label style={{
                         display: 'block',
                         color: '#fffeff',
                         marginBottom: '0.5rem',
                         fontSize: '0.875rem',
                         fontWeight: '400',
                         lineHeight: '1.4'
                       }}>
                        {question.label}
                        {question.required && (
                          <span style={{ 
                            color: '#ef4444',
                            marginLeft: '0.25rem'
                          }}>*</span>
                        )}
                      </label>
                      {renderQuestion(question)}
                    </div>
                  );
                })}
                
                {/* Navigation Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1.5rem'
                }}>
                  {currentSection > 0 && (
                                         <button
                       type="button"
                       onClick={handlePrevious}
                       style={{
                         backgroundColor: '#475569',
                         color: '#fffeff',
                         border: 'none',
                         padding: '0.75rem 1rem',
                         borderRadius: '0.375rem',
                         fontWeight: '500',
                         cursor: 'pointer',
                         fontSize: '0.875rem'
                       }}
                     >
                       Previous
                     </button>
                  )}
                  
                  {currentSection < applicationQuestions.length - 1 ? (
                                         <button
                       type="button"
                       onClick={handleNext}
                       style={{
                         backgroundColor: '#3b82f6',
                         color: '#fffeff',
                         border: 'none',
                         padding: '0.75rem 1rem',
                         borderRadius: '0.375rem',
                         fontWeight: '500',
                         cursor: 'pointer',
                         fontSize: '0.875rem',
                         marginLeft: 'auto'
                       }}
                     >
                       Next
                     </button>
                  ) : (
                                         <button
                       type="submit"
                       disabled={isSubmitting}
                       style={{
                         backgroundColor: '#3b82f6',
                         color: '#fffeff',
                         border: 'none',
                         padding: '0.75rem 1rem',
                         borderRadius: '0.375rem',
                         fontWeight: '500',
                         cursor: 'pointer',
                         fontSize: '0.875rem',
                         marginLeft: 'auto',
                         opacity: isSubmitting ? 0.6 : 1
                       }}
                     >
                       {isSubmitting ? 'Submitting...' : 'Submit Application'}
                     </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Custom render function for questions to match the design
  function renderCustomQuestion(question) {
         const commonInputStyle = {
       width: '100%',
       padding: '0.75rem',
       borderRadius: '0.375rem',
       border: '1px solid #334155',
       backgroundColor: '#334155',
       color: '#fffeff',
       fontSize: '0.875rem',
       outline: 'none',
       boxSizing: 'border-box'
     };

    switch (question.type) {
      case 'select':
        return (
          <select
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            style={commonInputStyle}
          >
            <option value="">Select</option>
            {question.options && question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options && question.options.map(option => (
                             <label key={option} style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem',
                 cursor: 'pointer',
                 color: '#fffeff',
                 fontSize: '0.875rem'
               }}>
                <input
                  type="checkbox"
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
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            rows="4"
            style={{
              ...commonInputStyle,
              resize: 'vertical',
              minHeight: '80px'
            }}
            placeholder={question.placeholder || ''}
          />
        );
      
      default:
        return (
          <input
            type={question.type}
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
            style={commonInputStyle}
            placeholder={question.placeholder || ''}
          />
        );
    }
  }
};

export default ApplicationForm; 