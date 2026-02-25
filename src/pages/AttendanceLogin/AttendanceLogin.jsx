import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import { storeAuthData, isAuthenticated, validateToken } from '../../utils/attendanceAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import ArrowButton from '../../components/ArrowButton/ArrowButton';

const AttendanceLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      if (isAuthenticated()) {
        // Valid session exists, redirect to dashboard
        setIsRedirecting(true);
        setSuccessMessage('Session found. Redirecting to dashboard...');
        
        // Small delay to show the message
        setTimeout(() => {
          navigate('/attendance-dashboard', { replace: true });
        }, 500);
      } else {
        // Clear any invalid session data
        localStorage.removeItem('attendanceToken');
        localStorage.removeItem('attendanceUser');
        localStorage.removeItem('attendanceSessionStart');
        localStorage.removeItem('attendanceLastActivity');
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    setIsRedirecting(false);
    
    // Input validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Clear any existing session data
      localStorage.removeItem('attendanceToken');
      localStorage.removeItem('attendanceUser');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases with user-friendly messages
        if (response.status === 400) {
          setError(data.error || 'Please check your input and try again.');
        } else if (response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (response.status === 403) {
          if (data.needsVerification) {
            setError('Please verify your email address before logging in.');
          } else if (data.error?.includes('Admin or staff privileges')) {
            setError('Access denied. Admin or staff privileges required for attendance management.');
          } else {
            setError('Access denied. Please contact your administrator.');
          }
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data.error || 'An error occurred. Please try again.');
        }
        return;
      }

      // Validate response data
      if (!data.token || !data.user) {
        setError('Invalid response from server. Please try again.');
        return;
      }

      // Validate JWT token using utility function
      const tokenValidation = validateToken(data.token);
      if (!tokenValidation.isValid) {
        setError(tokenValidation.error || 'Invalid authentication token.');
        return;
      }

      // Store attendance token and user data securely using utility
      const storageSuccess = storeAuthData(data.token, data.user);
      
      if (!storageSuccess) {
        setError('Unable to save session data. Please try again.');
        return;
      }
      
      // Show success message and prepare for redirect
      setSuccessMessage('Authentication successful! Redirecting to dashboard...');
      setIsRedirecting(true);
      
      // Clear form
      setEmail('');
      setPassword('');
      
      // Redirect after brief delay to show success message
      setTimeout(() => {
        try {
          const redirectPath = data.redirectTo || '/attendance-dashboard';
          navigate(redirectPath, { replace: true });
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
          setError('Redirect failed. Please try navigating manually.');
          setIsRedirecting(false);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Attendance login error:', err);
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setIsSubmitting(false);
    setIsRedirecting(false);
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col font-sans"
      style={{
        background: 'linear-gradient(158.49deg, #4242EA 29.85%, #FFD3C2 116.57%)'
      }}
    >
      {/* Header */}
      <div className="absolute top-5 left-8">
        <h1 className="text-white text-xl md:text-2xl font-sans leading-tight">
          Attendance Management System
        </h1>
      </div>
      
      {/* Top Right - Back to Main */}
      <div className="absolute top-7 right-8 flex items-center gap-2">
        <span className="text-white text-sm font-sans">
          Back to main app
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
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logoFull} alt="Pursuit Logo" className="h-12 w-auto" />
          </div>
          
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-white text-3xl md:text-4xl font-bold font-sans leading-tight">
              Staff Sign In
            </h2>
            <p className="text-white/80 text-base mt-2 font-sans">
              Access the attendance dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-400/50 text-white px-4 py-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                {successMessage}
                {isRedirecting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </div>
            )}
            
            {/* Email Input */}
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                required
                disabled={isSubmitting || isRedirecting}
                className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-white/50 h-12 text-base"
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isSubmitting || isRedirecting}
                className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-white/50 h-12 text-base pr-16"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || isRedirecting}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || isRedirecting}
                className="w-full bg-white text-[#4242EA] hover:bg-white/90 h-12 text-base font-semibold rounded-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#4242EA]/30 border-t-[#4242EA] rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : isRedirecting ? (
                  'Redirecting...'
                ) : (
                  'Sign In'
                )}
              </Button>
              
              {!isSubmitting && !isRedirecting && (
                <button 
                  type="button" 
                  className="w-full text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
                  onClick={handleReset}
                >
                  Clear Form
                </button>
              )}
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-white/60 text-sm font-sans">
              Staff and admin access only
            </p>
            <p className="text-white/40 text-xs mt-2 font-sans">
              Having trouble? Contact your system administrator
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Right Logo */}
      <div className="absolute bottom-8 right-8 hidden md:block">
        <img 
          src={logoFull} 
          alt="Pursuit Logo" 
          className="h-[71.93px] w-[280px] opacity-50" 
        />
      </div>
    </div>
  );
};

export default AttendanceLogin;
