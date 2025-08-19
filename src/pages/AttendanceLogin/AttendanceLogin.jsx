import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import { storeAuthData, isAuthenticated, validateToken } from '../../utils/attendanceAuth';
import './AttendanceLogin.css';

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
    <div className="attendance-login-container">
      <div className="attendance-login-form-container">
        <div className="attendance-login-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="attendance-login-logo" />
        </div>
        
        <div className="attendance-login-headline">
          <h1>ATTENDANCE<br />MANAGEMENT<br />SYSTEM</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="attendance-login-form">
          {error && <div className="attendance-login-error">{error}</div>}
          {successMessage && (
            <div className={`attendance-login-success ${isRedirecting ? 'redirecting' : ''}`}>
              {successMessage}
              {isRedirecting && <div className="redirect-spinner"></div>}
            </div>
          )}
          
          <div className="attendance-login-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
              className="attendance-login-input"
              disabled={isSubmitting || isRedirecting}
              aria-label="Admin email address"
            />
          </div>
          
          <div className="attendance-login-input-group password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="attendance-login-input"
              disabled={isSubmitting || isRedirecting}
              aria-label="Admin password"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting || isRedirecting}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          <div className="attendance-login-button-group">
            <button 
              type="submit" 
              className="attendance-login-button"
              disabled={isSubmitting || isRedirecting}
              aria-label="Sign in to attendance system"
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Signing In...
                </>
              ) : isRedirecting ? (
                'Redirecting...'
              ) : (
                'Sign In'
              )}
            </button>
            
            {!isSubmitting && !isRedirecting && (
              <button 
                type="button" 
                className="attendance-login-reset-button"
                onClick={handleReset}
                aria-label="Clear form"
              >
                Clear Form
              </button>
            )}
          </div>
        </form>
        
        <div className="attendance-login-footer">
          <p>Staff and admin access only</p>
          <p className="attendance-login-help">
            Having trouble? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogin;
