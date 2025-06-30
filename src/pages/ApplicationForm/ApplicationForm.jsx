import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  
  // State for dynamic questions and database integration
  const [applicationQuestions, setApplicationQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Initialize formData state by attempting to load from localStorage (fallback)
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('applicationFormData');
    console.log('Initializing formData state with:', savedData);
    return savedData ? JSON.parse(savedData) : {};
  });
  
  const [currentSection, setCurrentSection] = useState(0);
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
        
        // Get the current logged-in applicant's information
        const currentApplicant = databaseService.getCurrentApplicant();
        if (!currentApplicant) {
          throw new Error('User not authenticated');
        }
        
        const session = await databaseService.initializeApplication(
          currentApplicant.email, 
          currentApplicant.first_name, 
          currentApplicant.last_name
        );
        setCurrentSession(session);
        
        console.log('Application initialized:', session);
        
      } catch (error) {
        console.error('Error initializing application:', error);
        setError('Failed to load application. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApplication();
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

  // Save to database whenever form data changes
  useEffect(() => {
    const saveToDatabase = async () => {
      if (currentSession?.application && Object.keys(formData).length > 0) {
        try {
          // Save each response to database
          const promises = Object.entries(formData).map(([questionId, responseValue]) => {
            return databaseService.saveResponse(
              currentSession.application.application_id,
              questionId,
              JSON.stringify(responseValue) // Store as JSON string to handle arrays
            );
          });
          
          await Promise.all(promises);
          console.log('Responses saved to database');
          
          // Also save to localStorage as backup
          localStorage.setItem('applicationFormData', JSON.stringify(formData));
          
        } catch (error) {
          console.error('Error saving to database:', error);
          // Fall back to localStorage only
          localStorage.setItem('applicationFormData', JSON.stringify(formData));
        }
      }
    };

    // Debounce database saves
    const timeoutId = setTimeout(saveToDatabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentSession]);

  const handleInputChange = (questionId, value) => {
    console.log(`handleInputChange called for questionId: ${questionId}, value: ${value}`);
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentSession?.application) {
        // Submit application via database service
        await databaseService.submitApplication(currentSession.application.application_id);
        console.log('Application submitted successfully via database');
        
        // Clear saved data after successful submission
        localStorage.removeItem('applicationFormData');
        localStorage.setItem('applicationStatus', 'submitted');
        
        alert('Application submitted successfully!');
        navigate('/');
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
    // Data is already being saved to database automatically
    alert('Application saved successfully!');
  };

  const handleNext = () => {
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
    navigate('/apply');
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
          <button onClick={handleBack}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const renderQuestion = (question) => {
    const commonProps = {
      id: question.id,
      value: formData[question.id] || '',
      onChange: (e) => handleInputChange(question.id, e.target.value),
      required: question.required,
      placeholder: question.placeholder,
      className: 'form-input'
    };

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={6}
            maxLength={question.maxLength}
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
      case 'radio':
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
      case 'select':
        return (
          <select
            {...commonProps}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            required={question.required}
          >
            <option value="">Select...</option>
            {question.options && question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="checkbox-group">
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
    <div className="application-form-container">
      <div className="application-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Dashboard
        </button>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
        {currentSession && (
          <div className="session-info">
            <small>Session: {currentSession.applicant.email}</small>
          </div>
        )}
      </div>
      <div className="application-form">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>{applicationQuestions[currentSection].title}</h2>
            {applicationQuestions[currentSection].questions.map((question) => (
              <div key={question.id} className="form-group">
                <label htmlFor={question.id}>
                  {question.label}
                  {question.link && (
                    <a href={question.link.url} target="_blank" rel="noopener noreferrer">
                      {question.link.text}
                    </a>
                  )}
                  {question.required && <span className="required">*</span>}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          <div className="form-navigation">
            {currentSection > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="nav-button"
              >
                Previous
              </button>
            )}
            
            {currentSection < applicationQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="nav-button"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="save-button"
                >
                  Save
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm; 