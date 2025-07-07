import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoFull from '../../assets/logo-full.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const { setAuthState } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);
    
    try {
      // Use the unified auth endpoint
      const response = await fetch(`http://localhost:7001/api/unified-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Update AuthContext state for builder users
        if (data.user.userType === 'builder') {
          setAuthState(data.user, data.token);
        }
        
        // Redirect based on user type
        if (data.user.userType === 'builder') {
          navigate('/dashboard');
        } else if (data.user.userType === 'applicant') {
          navigate('/apply/dashboard');
        } else {
          // Fallback based on redirect suggestion from server
          navigate(data.redirectTo || '/dashboard');
        }
        return;
      }

      // Check if it's a verification issue
      if (response.status === 403 && data.needsVerification) {
        setNeedsVerification(true);
        return;
      }

      // Show error message
      setError(data.error || 'Invalid email or password');
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="login-logo" />
        </div>
        
        <div className="login-headline">
          <h1>LET'S BUILD<br />THE FUTURE<br />—TOGETHER.</h1>
        </div>
        
        {needsVerification ? (
          <div className="login-verification-needed">
            <p>Please verify your email address before logging in.</p>
            <p>Check your email for a verification link or request a new one.</p>
            <div className="login-verification-actions">
              <Link to={`/resend-verification`} className="login-button verification-button">
                Resend Verification Email
              </Link>
              <button 
                onClick={() => setNeedsVerification(false)} 
                className="login-link back-to-login"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}
            
            <div className="login-input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="login-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="login-input-group password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="login-input"
                disabled={isSubmitting}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            <div className="login-links">
              <Link to="/signup" className="login-link">Create an account</Link>
              <Link to="/forgot-password" className="login-link">Forgot Password?</Link>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 