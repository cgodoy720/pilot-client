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
  const { login, isAuthenticated, setAuthState } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Use the redirectTo from unified auth response
        const redirectPath = result.redirectTo || '/dashboard';
        
        // For builder users, the AuthContext will handle the state
        // For applicants, we redirect but don't set AuthContext state
        if (result.userType === 'builder') {
          navigate(redirectPath);
        } else if (result.userType === 'applicant') {
          // Redirect to applicant dashboard
          navigate(redirectPath);
        } else {
          // Fallback to dashboard
          navigate('/dashboard');
        }
      } else {
        // Check if the error is related to email verification
        if (result.needsVerification) {
          setNeedsVerification(true);
        } else {
          setError(result.error || 'Invalid email or password');
        }
      }
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