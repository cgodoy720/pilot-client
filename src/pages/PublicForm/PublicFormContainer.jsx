import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicForm, submitForm, generateSessionId } from '../../services/formService';
import FormQuestion from './components/FormQuestion';
import ThankYouScreen from './components/ThankYouScreen';
import FormClosed from './components/FormClosed';
import logo from '../../assets/logo-full.png';
import './PublicFormContainer.css';

const PublicFormContainer = () => {
  const { slug } = useParams();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const [showWelcome, setShowWelcome] = useState(true);
  const [respondentEmail, setRespondentEmail] = useState('');

  useEffect(() => {
    loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await getPublicForm(slug);
      setForm(data);
      setError(null);
    } catch (err) {
      console.error('Error loading form:', err);
      setError(err.response?.data?.error || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleStartForm = () => {
    setShowWelcome(false);
    setStartTime(Date.now());
  };

  const handleAnswerChange = (questionId, answer, questionText) => {
    setResponses({
      ...responses,
      [questionId]: {
        question_text: questionText,
        answer,
        answered_at: new Date().toISOString()
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < form.questions.length - 1) {
      setSlideDirection('next');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('back');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = form.questions[currentQuestionIndex];
    const response = responses[currentQuestion.question_id];
    
    if (!currentQuestion.required) return true;
    if (!response || !response.answer) return false;
    
    // Check for empty strings or empty arrays
    if (typeof response.answer === 'string' && !response.answer.trim()) return false;
    if (Array.isArray(response.answer) && response.answer.length === 0) return false;
    
    return true;
  };

  const handleSubmit = async () => {
    // Check required fields
    const unansweredRequired = form.questions.filter(q => {
      if (!q.required) return false;
      const response = responses[q.question_id];
      return !response || !response.answer;
    });

    if (unansweredRequired.length > 0) {
      alert('Please answer all required questions');
      return;
    }

    // Check email if required
    if (form.settings.require_email && !respondentEmail) {
      alert('Please provide your email address');
      return;
    }

    try {
      setSubmitting(true);
      const completionTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
      
      const submissionData = {
        responses,
        respondent_email: respondentEmail || null,
        completion_time_seconds: completionTime,
        session_id: generateSessionId()
      };

      const result = await submitForm(slug, submissionData);
      setIsSubmitted(true);
      
      // Handle redirect if configured
      if (result.redirect_url) {
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert(err.response?.data?.error || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-form__loading">
        <div className="public-form__spinner"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  if (error) {
    return <FormClosed message={error} />;
  }

  if (!form) {
    return <FormClosed message="Form not found" />;
  }

  if (form.status !== 'active') {
    return <FormClosed message="This form is no longer accepting responses" />;
  }

  if (isSubmitted) {
    return <ThankYouScreen message={form.settings.thank_you_message} />;
  }

  if (showWelcome) {
    return (
      <div className="public-form public-form--welcome">
        <div className="public-form__welcome-container">
          <div className="public-form__welcome-header">
            <h1 className="public-form__welcome-title">Let's create your account</h1>
          </div>
          <h2 className="public-form__form-title">{form.title}</h2>
          {form.description && (
            <p className="public-form__welcome-description">{form.description}</p>
          )}
          {form.settings.require_email && (
            <div className="public-form__email-input">
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          )}
          <button 
            className="public-form__start-btn"
            onClick={handleStartForm}
            disabled={form.settings.require_email && !respondentEmail}
          >
            Start
          </button>
        </div>
        <img src={logo} alt="Pursuit" className="public-form__logo" />
      </div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100;

  return (
    <div className="public-form">
      {form.settings.show_progress && (
        <div className="public-form__progress-bar">
          <div 
            className="public-form__progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="public-form__header">
        {form.settings.show_progress && (
          <div className="public-form__progress-text">
            <span className="public-form__progress-number">
              {String(currentQuestionIndex + 1).padStart(2, '0')}
            </span>
            {' '}of{' '}
            <span className="public-form__progress-total">
              {String(form.questions.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="public-form__container">
        <FormQuestion
          question={currentQuestion}
          value={responses[currentQuestion.question_id]?.answer}
          onChange={(answer) => handleAnswerChange(currentQuestion.question_id, answer, currentQuestion.text)}
          slideDirection={slideDirection}
        />

        <div className="public-form__navigation">
          {currentQuestionIndex > 0 && (
            <button 
              className="public-form__nav-btn public-form__nav-btn--back"
              onClick={handleBack}
              disabled={submitting}
            >
              ← 
            </button>
          )}
          
          <button 
            className="public-form__nav-btn public-form__nav-btn--next"
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered() || submitting}
          >
            →
          </button>
        </div>
      </div>

      <img src={logo} alt="Pursuit" className="public-form__logo" />
    </div>
  );
};

export default PublicFormContainer;

