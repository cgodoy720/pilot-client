import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import MultiStepForm from '../../components/MultiStepForm';
import logoFull from '../../assets/logo-full.png';

const Signup = () => {
  const [userType, setUserType] = useState(''); // 'builder', 'applicant', or 'workshop'
  const [isReturningWorkshopUser, setIsReturningWorkshopUser] = useState(false); // For returning workshop participants
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState(''); // For workshop participants
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  
  const navigate = useNavigate();
  const { signup, isAuthenticated, setAuthState } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate password as user types
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword && password !== ''
    });
  }, [password, confirmPassword]);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setError('');
    setSuccessMessage('');
    setRegistrationComplete(false);
  };

  const handleMultiStepSubmit = async (formData) => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      let response;
      let endpoint;
      let requestBody;

      if (userType === 'applicant') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Check if user type is selected
    if (!userType) {
      setError('Please select an account type');
      return;
    }
    
    // Skip password validation for returning workshop users (simpler form)
    if (!isReturningWorkshopUser) {
      // Check if all password validations pass
      const allValidationsPass = Object.values(passwordValidation).every(value => value);
      
      if (!allValidationsPass) {
        setError('Please ensure your password meets all requirements');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      let endpoint;
      let requestBody;

      if (userType === 'builder') {
        // Create builder account using the existing AuthContext signup
        const result = await signup(firstName, lastName, email, password);
        
        if (result.success) {
          setRegistrationComplete(true);
          setSuccessMessage(result.message || 'Builder account created successfully! Please check your email to verify your account.');
        } else {
          setError(result.error || 'Failed to create account');
        }
        return;
      } else if (userType === 'applicant') {
        // Create applicant account in admissions app
        endpoint = `${import.meta.env.VITE_API_URL}/api/applications/signup`;
        requestBody = { firstName, lastName, email, password };
        
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
        if (isReturningWorkshopUser) {
          // Login returning workshop participant
          endpoint = `${import.meta.env.VITE_API_URL}/api/workshop/login-returning`;
          requestBody = {
            access_code: accessCode,
            email,
            password
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
            // Set auth state and redirect
            setAuthState(data.user, data.token);
            navigate(data.redirectTo || '/dashboard');
          } else {
            setError(data.error || 'Failed to log in');
          }
        } else {
          // Create workshop participant account
          endpoint = `${import.meta.env.VITE_API_URL}/api/workshop/access`;
          requestBody = {
            access_code: accessCode,
            first_name: firstName,
            last_name: lastName,
            email,
            password
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
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading auth state, show nothing
  if (isAuthenticated === null) {
    return null;
  }

  // Show MultiStepForm for applicant and workshop signups
  if ((userType === 'applicant' || userType === 'workshop') && !registrationComplete) {
    return (
      <MultiStepForm 
        userType={userType} 
        onSubmit={handleMultiStepSubmit}
        onBack={handleBackToSelection}
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
          <Link 
            to="/login"
            className="w-4 h-4 p-0.5 border-white border rounded bg-transparent hover:bg-white/10 inline-flex items-center justify-center"
          >
            <ArrowRight className="w-2.5 h-2.5 text-white" />
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
          <Button
            variant="outline"
            size="sm"
            className="w-4 h-4 p-0.5 border-white border rounded bg-transparent hover:bg-white/10"
            asChild
          >
            <Link to="/login">
              <ArrowRight className="w-2.5 h-2.5 text-white" />
            </Link>
          </Button>
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
            <div className="w-full md:w-[211px] min-h-[270px] border border-divider rounded-[20px] bg-transparent shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between p-6 gap-6">
              <div className="flex flex-col items-center gap-4 w-full flex-1">
                <h3 className="text-white text-xl md:text-2xl font-proxima leading-tight text-center w-full">
                  Workshop
                </h3>
                <p className="text-white text-sm md:text-base font-proxima leading-tight text-center w-full flex-1">
                  For workshop participants with an access code from your organization
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
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 border-divider text-divider hover:bg-white/10 rounded-lg bg-transparent"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="w-8 h-8 bg-white text-pursuit-purple hover:bg-gray-100 rounded-lg border border-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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

  return (
    <div className="min-h-screen bg-pursuit-purple flex flex-col items-center justify-center px-8 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logoFull} alt="Pursuit Logo" className="h-10 w-auto mx-auto mb-6" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-white text-xl md:text-2xl font-bold font-proxima leading-tight">
            CREATE YOUR<br />{userType.toUpperCase()}<br />ACCOUNT
          </h1>
        </div>
        
        {registrationComplete ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <p className="text-white text-lg font-medium mb-5 p-2 rounded bg-green-500/20">{successMessage}</p>
            {(userType === 'builder' || userType === 'workshop') && (
              <div className="text-left mb-5 p-4 bg-white/5 rounded border border-white/20">
                <h3 className="text-white font-semibold mb-3">What's next?</h3>
                <ol className="text-white text-sm space-y-2 ml-5 list-decimal">
                  <li>Check your email inbox for a verification message</li>
                  <li>Click the verification link in the email</li>
                  <li>Once verified, you can log into your account</li>
                </ol>
                <p className="text-white/80 text-sm italic mt-3">Don't see the email? Check your spam folder or request a new verification link.</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-4">
              <Button asChild className="bg-white text-pursuit-purple hover:bg-gray-100">
                <Link to="/login">Go to Login</Link>
              </Button>
              {(userType === 'builder' || userType === 'workshop') && (
                <Link to="/resend-verification" className="text-white underline hover:text-white/80">
                  Resend Verification Email
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-center text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 p-3 rounded text-center text-sm">
                {successMessage}
              </div>
            )}
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 flex justify-between items-center">
              <p className="text-white text-sm">
                Creating a <strong>{userType}</strong> account
              </p>
              <button 
                type="button" 
                onClick={() => setUserType('')} 
                className="text-white underline text-sm hover:text-white/80"
              >
                Change account type
              </button>
            </div>
            
            {/* Access Code field - only for workshop participants */}
            {userType === 'workshop' && (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Workshop Access Code (e.g., META-WS-2025)"
                  required
                  disabled={isSubmitting}
                  autoComplete="off"
                  className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
                />
                <p className="text-white/60 text-xs italic">Enter the code provided by your workshop facilitator</p>
              </div>
            )}
            
            {/* Show name fields only for NEW workshop participants */}
            {!(userType === 'workshop' && isReturningWorkshopUser) && (
              <>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                  disabled={isSubmitting}
                  className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
                />
                
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                  disabled={isSubmitting}
                  className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
                />
              </>
            )}
            
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isSubmitting}
              className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
            />
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isSubmitting}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2 pr-12"
              />
              <button 
                type="button" 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 text-xs hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            {/* Confirm password field - not needed for returning workshop users */}
            {!(userType === 'workshop' && isReturningWorkshopUser) && (
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                disabled={isSubmitting}
                className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
              />
            )}
            
            {/* Password validation feedback - only show for new accounts */}
            {!(userType === 'workshop' && isReturningWorkshopUser) && (isPasswordFocused || password.length > 0) && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-semibold text-sm mb-3">Password must:</h4>
                <ul className="space-y-2 text-sm">
                  <li className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-300' : 'text-red-300'}`}>
                    <span className="text-xs">{passwordValidation.length ? '✓' : '✗'}</span>
                    Be at least 8 characters long
                  </li>
                  <li className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-300' : 'text-red-300'}`}>
                    <span className="text-xs">{passwordValidation.uppercase ? '✓' : '✗'}</span>
                    Include at least one uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-300' : 'text-red-300'}`}>
                    <span className="text-xs">{passwordValidation.lowercase ? '✓' : '✗'}</span>
                    Include at least one lowercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-300' : 'text-red-300'}`}>
                    <span className="text-xs">{passwordValidation.number ? '✓' : '✗'}</span>
                    Include at least one number
                  </li>
                  <li className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-300' : 'text-red-300'}`}>
                    <span className="text-xs">{passwordValidation.special ? '✓' : '✗'}</span>
                    Include at least one special character
                  </li>
                </ul>
                
                {confirmPassword.length > 0 && (
                  <div className={`mt-3 p-2 rounded text-center text-sm ${passwordValidation.match ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {passwordValidation.match ? 'Passwords match ✓' : 'Passwords do not match ✗'}
                  </div>
                )}
              </div>
            )}
            
            {/* Workshop-specific toggle for returning users */}
            {userType === 'workshop' && (
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsReturningWorkshopUser(!isReturningWorkshopUser);
                    setError('');
                  }} 
                  className="text-white underline text-sm hover:text-white/80"
                >
                  {isReturningWorkshopUser 
                    ? 'New to workshops? Create a new account' 
                    : 'Attended a workshop before? Log in here'}
                </button>
              </div>
            )}
            
            {/* For non-workshop users */}
            {userType !== 'workshop' && (
              <div className="flex justify-between items-center text-sm text-white/80">
                <span>Already have an account?</span>
                <Link to="/login" className="text-white underline hover:text-white/80">Log in</Link>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm text-white/80">
              <span>Changed your mind?</span>
              <button 
                type="button" 
                onClick={() => setUserType('')} 
                className="text-white underline hover:text-white/80"
              >
                Change account type
              </button>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-pursuit-purple hover:bg-gray-100 font-medium py-2 mt-4"
            >
              {isSubmitting 
                ? (isReturningWorkshopUser ? 'Logging in...' : 'Creating Account...') 
                : (isReturningWorkshopUser ? 'Log In' : 'Create Account')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup; 