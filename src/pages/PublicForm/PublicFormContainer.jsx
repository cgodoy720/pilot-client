import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicForm, submitForm, generateSessionId } from '../../services/formService';
import FormQuestion from './components/FormQuestion';
import ThankYouScreen from './components/ThankYouScreen';
import FormClosed from './components/FormClosed';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
      setSlideDirection('forward');
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 50);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('backward');
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex - 1), 50);
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
      <div className="min-h-screen bg-[#4E4DED] flex flex-col items-center justify-center text-white">
        <div className="w-15 h-15 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
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
      <div className="min-h-screen relative flex flex-col bg-[#4E4DED]">
        {/* Top Right Login Link */}
        <div className="absolute top-7 right-8 flex items-center gap-2">
          <span className="text-white text-sm">
            Already have an account? Login
          </span>
          <Link 
            to="/login"
            className="w-4 h-4 p-0.5 border-white border rounded bg-transparent hover:bg-white/10 inline-flex items-center justify-center"
          >
            <ArrowRight className="w-2.5 h-2.5 text-white" />
          </Link>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-[660px]">
            <div className="text-left mb-12">
              <h2 className="text-white text-base md:text-lg font-bold mb-6">
                {form.title}
              </h2>
              {form.description && (
                <p className="text-white/70 text-sm md:text-base leading-tight mb-6">
                  {form.description}
                </p>
              )}
            </div>
            
            {form.settings.require_email && (
              <div className="mb-8">
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-0 py-2 border-0 border-b border-white/30 bg-transparent text-white text-base md:text-lg placeholder:text-white/60 focus:border-white focus:ring-0 focus:outline-none rounded-none box-border transition-all"
                />
              </div>
            )}

            {/* Start Button matching navigation style */}
            <div className="flex gap-2">
              <button
                onClick={handleStartForm}
                disabled={form.settings.require_email && !respondentEmail}
                className="w-8 h-8 bg-white text-[#4E4DED] hover:bg-gray-100 rounded-lg border border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Right Logo */}
        <div className="absolute bottom-8 right-8">
          <img src={logo} alt="Pursuit Logo" className="h-[71.93px] w-[280px]" />
        </div>
      </div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#4E4DED]">
      {/* Top Left - Progress */}
      <div className="absolute top-5 left-8">
        {form.settings.show_progress && (
          <p className="text-white text-sm font-bold">
            {String(currentQuestionIndex + 1).padStart(2, '0')} of {String(form.questions.length).padStart(2, '0')}
          </p>
        )}
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            {/* Question with slide animation - wrapped in overflow-hidden */}
            <div className="overflow-hidden relative">
              <div
                key={`question-${currentQuestionIndex}`}
                className={`transition-all duration-500 ease-in-out ${
                  slideDirection === 'forward' 
                    ? 'animate-slide-in-right' 
                    : 'animate-slide-in-left'
                }`}
              >
                <FormQuestion
                  question={currentQuestion}
                  value={responses[currentQuestion.question_id]?.answer}
                  onChange={(answer) => handleAnswerChange(currentQuestion.question_id, answer, currentQuestion.text)}
                  slideDirection={slideDirection}
                  onEnter={handleNext}
                />
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0 || submitting}
              className="w-8 h-8 border border-white text-white hover:bg-white/10 rounded-lg bg-transparent flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered() || submitting}
              className="w-8 h-8 bg-white text-[#4E4DED] hover:bg-gray-100 rounded-lg border border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Right Logo */}
      <div className="absolute bottom-8 right-8">
        <img src={logo} alt="Pursuit Logo" className="h-[71.93px] w-[280px]" />
      </div>
    </div>
  );
};

export default PublicFormContainer;

