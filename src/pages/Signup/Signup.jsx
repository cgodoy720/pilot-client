import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoFull from '../../assets/logo-full.png';
import './Signup.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const { signup, isAuthenticated } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Check if all password validations pass
    const allValidationsPass = Object.values(passwordValidation).every(value => value);
    
    if (!allValidationsPass) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await signup(firstName, lastName, email, password);
      
      if (result.success) {
        setRegistrationComplete(true);
        setSuccessMessage(result.message || 'Account created successfully! Please check your email to verify your account.');
      } else {
        setError(result.error || 'Failed to create account');
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

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="signup-logo" />
        </div>
        
        <div className="signup-headline">
          <h1>CREATE YOUR<br />BUILDER<br />ACCOUNT</h1>
        </div>
        
        {registrationComplete ? (
          <div className="signup-success">
            <p className="signup-success-message">{successMessage}</p>
            <div className="signup-verification-instructions">
              <h3>What's next?</h3>
              <ol>
                <li>Check your email inbox for a verification message</li>
                <li>Click the verification link in the email</li>
                <li>Once verified, you can log into your account</li>
              </ol>
              <p>Don't see the email? Check your spam folder or request a new verification link.</p>
            </div>
            <div className="signup-actions">
              <Link to="/login" className="signup-button">Go to Login</Link>
              <Link to="/resend-verification" className="signup-link">Resend Verification Email</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            {error && <div className="signup-error">{error}</div>}
            {successMessage && <div className="signup-success-message">{successMessage}</div>}
            
            <div className="signup-input-group">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className="signup-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="signup-input-group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className="signup-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="signup-input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="signup-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="signup-input-group password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="signup-input"
                disabled={isSubmitting}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            <div className="signup-input-group">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="signup-input"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Password validation feedback - only show when password field is focused or has content */}
            {(isPasswordFocused || password.length > 0) && (
              <div className="password-validation">
                <h4>Password must:</h4>
                <ul>
                  <li className={passwordValidation.length ? 'valid' : 'invalid'}>
                    Be at least 8 characters long
                  </li>
                  <li className={passwordValidation.uppercase ? 'valid' : 'invalid'}>
                    Include at least one uppercase letter
                  </li>
                  <li className={passwordValidation.lowercase ? 'valid' : 'invalid'}>
                    Include at least one lowercase letter
                  </li>
                  <li className={passwordValidation.number ? 'valid' : 'invalid'}>
                    Include at least one number
                  </li>
                  <li className={passwordValidation.special ? 'valid' : 'invalid'}>
                    Include at least one special character
                  </li>
                </ul>
                
                {confirmPassword.length > 0 && (
                  <div className={`password-match ${passwordValidation.match ? 'valid' : 'invalid'}`}>
                    {passwordValidation.match ? 'Passwords match ✓' : 'Passwords do not match ✗'}
                  </div>
                )}
              </div>
            )}
            
            <div className="signup-links">
              <span>Already have an account?</span>
              <Link to="/login" className="signup-link">Log in</Link>
            </div>
            
            <button 
              type="submit" 
              className="signup-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup; 