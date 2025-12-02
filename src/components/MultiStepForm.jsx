import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ArrowButton from './ArrowButton/ArrowButton';
import logoFull from '../assets/logo-full.png';

const MultiStepForm = ({ userType, onSubmit, onBack, error, isSubmitting }) => {
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
  const [validationError, setValidationError] = useState('');

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
    } else if (userType === 'builder') {
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
    return [];
  };

  const steps = getSteps();
  const currentQuestion = steps[currentStep];
  const totalSteps = steps.length;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
      errors: {
        minLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecial
      }
    };
  };

  const validateCurrentStep = () => {
    const value = formData[currentQuestion.id]?.trim();
    
    // Check if field is empty
    if (!value || value.length === 0) {
      setValidationError('This field is required');
      return false;
    }

    // Email validation
    if (currentQuestion.id === 'email') {
      if (!validateEmail(value)) {
        setValidationError('Please enter a valid email address (e.g., name@example.com)');
        return false;
      }
    }

    // Name validation (no numbers or special characters)
    if (currentQuestion.id === 'firstName' || currentQuestion.id === 'lastName') {
      if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        setValidationError('Name should only contain letters, spaces, hyphens, and apostrophes');
        return false;
      }
      if (value.length < 2) {
        setValidationError('Name must be at least 2 characters long');
        return false;
      }
    }

    // Password validation
    if (currentQuestion.id === 'password') {
      const passwordCheck = validatePassword(value);
      if (!passwordCheck.isValid) {
        setValidationError('Password does not meet all requirements (see below)');
        return false;
      }
    }

    // Confirm password validation
    if (currentQuestion.id === 'confirmPassword') {
      if (value !== formData.password) {
        setValidationError('Passwords do not match');
        return false;
      }
    }

    // Access code validation (for workshop)
    if (currentQuestion.id === 'accessCode') {
      if (value.length < 3) {
        setValidationError('Access code must be at least 3 characters long');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleNext = () => {
    // Validate current step before moving forward
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setTimeout(() => setCurrentStep(currentStep + 1), 50);
    } else {
      // Last step - submit form
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    setValidationError(''); // Clear validation error when going back
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
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && formData[currentQuestion.id]) {
      handleNext();
    }
  };

  const isCurrentStepValid = formData[currentQuestion.id]?.trim().length > 0;

  // Get password validation status for display
  const getPasswordValidation = () => {
    if (currentQuestion.id === 'password' && formData.password) {
      return validatePassword(formData.password);
    }
    return null;
  };

  const passwordValidation = getPasswordValidation();

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
        <Link to="/login">
          <ArrowButton 
            size="sm"
            borderColor="white"
            arrowColor="white"
            backgroundColor="transparent"
            hoverBackgroundColor="white"
            hoverArrowColor="#4242EA"
          />
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
                  className={`bg-transparent border-0 border-b-2 rounded-none text-white placeholder:text-white/40 focus:border-white focus:ring-0 px-0 pb-3 text-lg w-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    validationError ? 'border-red-400' : 'border-white/60'
                  }`}
                  autoFocus
                />
                
                {/* Validation Error Message */}
                {validationError && (
                  <p className="text-red-300 text-sm mt-2 flex items-start gap-2">
                    <span className="text-red-300">✗</span>
                    <span>{validationError}</span>
                  </p>
                )}

                {/* Server Error Message */}
                {error && (
                  <div className="mt-4 bg-red-500/20 border border-red-400/50 rounded-lg p-4">
                    <p className="text-red-300 text-sm flex items-start gap-2">
                      <span className="text-red-300 flex-shrink-0">✗</span>
                      <span className="whitespace-pre-wrap">{error}</span>
                    </p>
                  </div>
                )}

                {/* Password Requirements Display */}
                {currentQuestion.id === 'password' && formData.password && (
                  <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold text-sm mb-3">Password must include:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${passwordValidation?.errors.minLength ? 'text-green-300' : 'text-red-300'}`}>
                        <span className="text-xs">{passwordValidation?.errors.minLength ? '✓' : '✗'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation?.errors.hasUppercase ? 'text-green-300' : 'text-red-300'}`}>
                        <span className="text-xs">{passwordValidation?.errors.hasUppercase ? '✓' : '✗'}</span>
                        One uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation?.errors.hasLowercase ? 'text-green-300' : 'text-red-300'}`}>
                        <span className="text-xs">{passwordValidation?.errors.hasLowercase ? '✓' : '✗'}</span>
                        One lowercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation?.errors.hasNumber ? 'text-green-300' : 'text-red-300'}`}>
                        <span className="text-xs">{passwordValidation?.errors.hasNumber ? '✓' : '✗'}</span>
                        One number
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation?.errors.hasSpecial ? 'text-green-300' : 'text-red-300'}`}>
                        <span className="text-xs">{passwordValidation?.errors.hasSpecial ? '✓' : '✗'}</span>
                        One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                      </li>
                    </ul>
                  </div>
                )}

                {/* Confirm Password Match Display */}
                {currentQuestion.id === 'confirmPassword' && formData.confirmPassword && (
                  <div className={`mt-3 p-3 rounded text-sm flex items-center gap-2 ${
                    formData.confirmPassword === formData.password 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    <span className="text-xs">
                      {formData.confirmPassword === formData.password ? '✓' : '✗'}
                    </span>
                    <span>
                      {formData.confirmPassword === formData.password 
                        ? 'Passwords match' 
                        : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows or Submit Button */}
          <div className="flex gap-2">
            <ArrowButton
              size="lg"
              onClick={handlePrevious}
              borderColor="white"
              arrowColor="white"
              backgroundColor="transparent"
              hoverBackgroundColor="white"
              hoverArrowColor="#4242EA"
              rotation={180}
            />
            
            {currentStep === totalSteps - 1 ? (
              // Last step - show Create Account button with hover animation
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid || isSubmitting}
                className="relative bg-white text-pursuit-purple rounded-full px-6 py-2 text-sm font-proxima h-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium overflow-hidden group transition-colors duration-300 border border-white"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </span>
                <div 
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-pursuit-purple"
                />
              </button>
            ) : (
              // Regular next arrow button
              <ArrowButton
                size="lg"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                borderColor="white"
                arrowColor="#4242EA"
                backgroundColor="white"
                hoverBackgroundColor="#4242EA"
                hoverArrowColor="white"
                className={!isCurrentStepValid ? 'opacity-50 cursor-not-allowed' : ''}
              />
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
