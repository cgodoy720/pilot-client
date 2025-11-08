import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import logoFull from '../assets/logo-full.png';

const MultiStepForm = ({ userType, onSubmit, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessCode: '', // For workshop participants
  });

  // Define steps based on user type
  const getSteps = () => {
    if (userType === 'applicant') {
      return [
        { id: 'firstName', label: 'What is your first name?', type: 'text', placeholder: 'Type your answer here...' },
        { id: 'lastName', label: 'What is your last name?', type: 'text', placeholder: 'Type your answer here...' },
        { id: 'email', label: 'What is your email address?', type: 'email', placeholder: 'Type your answer here...' },
        { id: 'password', label: 'Create a password', type: 'password', placeholder: 'Type your answer here...' },
        { id: 'confirmPassword', label: 'Confirm your password', type: 'password', placeholder: 'Type your answer here...' },
      ];
    } else if (userType === 'workshop') {
      return [
        { id: 'accessCode', label: 'What is your workshop access code?', type: 'text', placeholder: 'Type your answer here...' },
        { id: 'firstName', label: 'What is your first name?', type: 'text', placeholder: 'Type your answer here...' },
        { id: 'lastName', label: 'What is your last name?', type: 'text', placeholder: 'Type your answer here...' },
        { id: 'email', label: 'What is your email address?', type: 'email', placeholder: 'Type your answer here...' },
        { id: 'password', label: 'Create a password', type: 'password', placeholder: 'Type your answer here...' },
        { id: 'confirmPassword', label: 'Confirm your password', type: 'password', placeholder: 'Type your answer here...' },
      ];
    }
    // Builder would use the existing form
    return [];
  };

  const steps = getSteps();
  const currentQuestion = steps[currentStep];
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setTimeout(() => setCurrentStep(currentStep + 1), 50);
    } else {
      // Last step - submit form
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setTimeout(() => setCurrentStep(currentStep - 1), 50);
    } else {
      onBack();
    }
  };

  const handleInputChange = (value) => {
    setFormData({
      ...formData,
      [currentQuestion.id]: value,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && formData[currentQuestion.id]) {
      handleNext();
    }
  };

  const isCurrentStepValid = formData[currentQuestion.id]?.trim().length > 0;

  return (
    <div className="min-h-screen bg-pursuit-purple relative flex flex-col">
      {/* Header */}
      <div className="absolute top-5 left-8">
        <h1 className="text-white text-xl md:text-2xl font-proxima leading-tight">
          Let's create your account
        </h1>
      </div>

      {/* Top Right Login Link */}
      <div className="absolute top-7 right-8 flex items-center gap-2">
        <span className="text-white text-sm font-proxima">
          Already have an account? Login
        </span>
        <Link 
          to="/login"
          className="w-4 h-4 p-0.5 border-white border rounded bg-transparent hover:bg-white/10 inline-flex items-center justify-center"
        >
          <ArrowRight className="w-2.5 h-2.5 text-white" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Step Indicator and Question */}
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <p className="text-white text-sm font-bold font-proxima mb-6">
              {String(currentStep + 2).padStart(2, '0')} of {String(totalSteps + 1).padStart(2, '0')}
            </p>
            
            {/* Question with slide animation */}
            <div className="overflow-hidden relative">
              <div
                key={`question-${currentStep}`}
                className={`transition-all duration-500 ease-in-out ${
                  direction === 'forward' 
                    ? 'animate-slide-in-right' 
                    : 'animate-slide-in-left'
                }`}
              >
                <h2 className="text-white text-2xl md:text-3xl font-bold font-proxima mb-8">
                  {currentQuestion.label}
                </h2>
              </div>
            </div>

            {/* Input with slide animation */}
            <div className="overflow-hidden relative">
              <div
                key={`input-${currentStep}`}
                className={`transition-all duration-500 ease-in-out ${
                  direction === 'forward' 
                    ? 'animate-slide-in-right' 
                    : 'animate-slide-in-left'
                }`}
              >
                <Input
                  type={currentQuestion.type}
                  value={formData[currentQuestion.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder}
                  className="bg-transparent border-0 border-b-2 border-white/60 rounded-none text-white placeholder:text-white/40 focus:border-white focus:ring-0 px-0 pb-3 text-lg w-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Navigation Arrows or Submit Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="w-8 h-8 border-white text-white hover:bg-white/10 rounded-lg bg-transparent p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {currentStep === totalSteps - 1 ? (
              // Last step - show Create Account button
              <Button
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-2 text-sm font-proxima h-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Create Account
              </Button>
            ) : (
              // Regular next arrow button
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                className="w-8 h-8 bg-white text-pursuit-purple hover:bg-gray-100 rounded-lg border border-white p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Right Logo */}
      <div className="absolute bottom-8 right-8">
        <img 
          src={logoFull} 
          alt="Pursuit Logo" 
          className="h-[71.93px] w-[280px]" 
        />
      </div>
    </div>
  );
};

export default MultiStepForm;
