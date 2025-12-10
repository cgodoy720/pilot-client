import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import MultiStepForm from '../../components/MultiStepForm';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import logoFull from '../../assets/logo-full.png';

const Signup = () => {
  const [userType, setUserType] = useState(''); // 'builder', 'applicant', 'workshop', or 'volunteer'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const navigate = useNavigate();
  const { signup, isAuthenticated, setAuthState } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setError('');
    setSuccessMessage('');
    setRegistrationComplete(false);
  };

  const handleMultiStepSubmit = async (formData) => {
    console.log('🔵 handleMultiStepSubmit called with userType:', userType);
    console.log('🔵 Form data:', { ...formData, password: '[REDACTED]' });
    
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      let response;
      let endpoint;
      let requestBody;

      if (userType === 'builder') {
        console.log('🔵 Processing builder signup...');
        // Create builder account using the existing AuthContext signup
        const result = await signup(formData.firstName, formData.lastName, formData.email, formData.password);
        
        console.log('🔵 Builder signup result:', result);
        
        if (result.success) {
          console.log('✅ Builder signup successful');
          setRegistrationComplete(true);
          setSuccessMessage(result.message || 'Builder account created successfully! Please check your email to verify your account.');
        } else {
          console.error('❌ Builder signup failed:', result.error);
          setError(result.error || 'Failed to create account');
        }
        setIsSubmitting(false);
        return;
      } else if (userType === 'applicant') {
        // Create applicant account in admissions app
        endpoint = `${import.meta.env.VITE_API_URL}/api/applications/signup`;
        requestBody = { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          email: formData.email, 
          password: formData.password 
        };
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          setRegistrationComplete(true);
          setSuccessMessage(data.message || 'Account created successfully! Please check your email to verify your account before logging in.');
        } else {
          setError(data.error || data.message || 'Failed to create account');
        }
      } else if (userType === 'workshop') {
        // Create workshop participant account
        endpoint = `${import.meta.env.VITE_API_URL}/api/workshop/access`;
        requestBody = {
          access_code: formData.accessCode,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password
        };
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

      if (response.ok) {
        setRegistrationComplete(true);
        setSuccessMessage('Workshop account created successfully! Please check your email to verify your account before logging in.');
      } else {
        setError(data.error || 'Failed to create workshop account');
      }
      } else if (userType === 'volunteer') {
        // Create volunteer account
        endpoint = `${import.meta.env.VITE_API_URL}/api/volunteers/signup`;
        requestBody = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        };

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          setRegistrationComplete(true);
          setSuccessMessage(data.message || 'Volunteer account created successfully! Please check your email to verify your account before logging in.');
        } else {
          setError(data.error || 'Failed to create volunteer account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSelection = () => {
    setUserType('');
    setError('');
    setSuccessMessage('');
    setRegistrationComplete(false);
  };

  // If still loading auth state, show nothing
  if (isAuthenticated === null) {
    return null;
  }

  // Show MultiStepForm for builder, applicant, workshop and volunteer signups
  if ((userType === 'builder' || userType === 'applicant' || userType === 'workshop' || userType === 'volunteer') && !registrationComplete) {
    return (
      <MultiStepForm 
        userType={userType} 
        onSubmit={handleMultiStepSubmit}
        onBack={handleBackToSelection}
        error={error}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Show success screen after registration
  if (registrationComplete) {
    return (
      <div 
        className="min-h-screen relative flex flex-col"
        style={{
          background: 'linear-gradient(158.49deg, #4242EA 29.85%, #FFD3C2 116.57%)'
        }}
      >
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
          <div className="w-full max-w-2xl text-left">
            <h2 className="text-white text-3xl md:text-4xl font-bold font-proxima mb-6">
              Congratulations!
            </h2>
            <p className="text-white text-lg md:text-xl font-proxima mb-8 leading-relaxed max-w-xl">
              Transformation awaits in your inbox. Log into your account using the link in the confirmation Email!
            </p>
            
            <Button 
              asChild 
              className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
            >
              <Link to="/login">Back to Login</Link>
            </Button>
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
  }

  // User type selection screen
  if (!userType) {
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
          {/* Container that matches card width */}
          <div className="w-full max-w-[660px]">
            {/* Step indicator and question - aligned to left of cards */}
            <div className="text-left mb-12">
              <p className="text-white text-sm font-bold font-proxima mb-3">
                01 of 08
              </p>
              <h2 className="text-white text-base md:text-lg font-bold font-proxima">
                What type of account do you want to create?
              </h2>
            </div>

            {/* Account Type Cards */}
            <div className="flex flex-col md:flex-row gap-6 mb-16">
            {/* Applicant Card */}
            <div className="w-full md:w-[210px] min-h-[270px] border border-divider rounded-[20px] bg-transparent shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-6 gap-6">
              <div className="flex flex-col items-center gap-4 w-full flex-1">
                <h3 className="text-white text-xl md:text-2xl font-proxima leading-tight text-center w-full">
                  Applicant
                </h3>
                <p className="text-white text-sm md:text-base font-proxima leading-tight text-center w-full flex-1">
                  For prospective Builders applying to the AI-Native Program
                </p>
              </div>
              <Button
                onClick={() => handleUserTypeSelect('applicant')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pursuit-purple rounded-full px-5 py-1.5 text-sm font-proxima h-auto bg-transparent w-auto"
              >
                Select
              </Button>
            </div>

            {/* Builder Card */}
            <div className="w-full md:w-[212px] min-h-[270px] border border-divider rounded-[20px] bg-transparent shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-6 gap-6">
              <div className="flex flex-col items-center gap-4 w-full flex-1">
                <h3 className="text-white text-xl md:text-2xl font-proxima leading-tight text-center w-full">
                  Builder
                </h3>
                <p className="text-white text-sm md:text-base font-proxima leading-tight text-center w-full flex-1">
                  For current Pursuit Builders and alumni who want to access the Pursuit Platform
                </p>
              </div>
              <Button
                onClick={() => handleUserTypeSelect('builder')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pursuit-purple rounded-full px-5 py-1.5 text-sm font-proxima h-auto bg-transparent w-auto"
              >
                Select
              </Button>
            </div>

            {/* Workshop Card */}
            <div className="w-full md:w-[160px] min-h-[270px] border border-divider rounded-[20px] bg-transparent shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-6 gap-6">
              <div className="flex flex-col items-center gap-4 w-full flex-1">
                <h3 className="text-white text-xl md:text-2xl font-proxima leading-tight text-center w-full">
                  Workshop
                </h3>
                <p className="text-white text-sm md:text-base font-proxima leading-tight text-center w-full flex-1">
                  For workshop participants with an access code
                </p>
              </div>
              <Button
                onClick={() => handleUserTypeSelect('workshop')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pursuit-purple rounded-full px-5 py-1.5 text-sm font-proxima h-auto bg-transparent w-auto"
              >
                Select
              </Button>
            </div>

            {/* Volunteer Card */}
            <div className="w-full md:w-[160px] min-h-[270px] border border-divider rounded-[20px] bg-transparent shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-6 gap-6">
              <div className="flex flex-col items-center gap-4 w-full flex-1">
                <h3 className="text-white text-xl md:text-2xl font-proxima leading-tight text-center w-full">
                  Volunteer
                </h3>
                <p className="text-white text-sm md:text-base font-proxima leading-tight text-center w-full flex-1">
                  For volunteers supporting Pursuit Builders
                </p>
              </div>
              <Button
                onClick={() => handleUserTypeSelect('volunteer')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-pursuit-purple rounded-full px-5 py-1.5 text-sm font-proxima h-auto bg-transparent w-auto"
              >
                Select
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <ArrowButton
              size="lg"
              borderColor="rgba(255, 255, 255, 0.2)"
              arrowColor="rgba(255, 255, 255, 0.2)"
              backgroundColor="transparent"
              hoverBackgroundColor="rgba(255, 255, 255, 0.2)"
              hoverArrowColor="rgba(255, 255, 255, 0.2)"
              rotation={180}
              disabled={true}
            />
            <ArrowButton
              size="lg"
              borderColor="white"
              arrowColor="#4242EA"
              backgroundColor="white"
              hoverBackgroundColor="#4242EA"
              hoverArrowColor="white"
            />
          </div>
          </div>
        </div>

        {/* Bottom Right Logo */}
        <div className="absolute bottom-8 right-8">
          <img src={logoFull} alt="Pursuit Logo" className="h-[71.93px] w-[280px]" />
        </div>
      </div>
    );
  }

  // This component should never reach here since all user types now use MultiStepForm
  return null;
};

export default Signup; 
