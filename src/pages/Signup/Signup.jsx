import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './Signup.css';

const Signup = () => {
  const [userType, setUserType] = useState(''); // 'builder' or 'applicant'
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
    
    // Check if all password validations pass
    const allValidationsPass = Object.values(passwordValidation).every(value => value);
    
    if (!allValidationsPass) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      let endpoint;
      let requestBody;

      if (userType === 'builder') {
        // Create builder account in main app
        endpoint = `${import.meta.env.VITE_API_URL}/api/users/signup`;
        requestBody = { firstName, lastName, email, password };
      } else {
        // Create applicant account in admissions app
        endpoint = `http://localhost:7001/api/auth/register`;
        requestBody = { firstName, lastName, email, password };
      }

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
        if (userType === 'builder') {
          setSuccessMessage('Builder account created successfully! Please check your email to verify your account.');
        } else {
          setSuccessMessage('Applicant account created successfully! You can now log in to access the admissions portal.');
        }
      } else {
        setError(data.error || data.message || 'Failed to create account');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User type selection screen
  if (!userType) {
    return (
      <div className="signup-container">
        <div className="signup-form-container">
          <div className="signup-logo-container">
            <img src={logoFull} alt="Pursuit Logo" className="signup-logo" />
          </div>
          
          <div className="signup-headline">
            <h1>CHOOSE YOUR<br />ACCOUNT TYPE</h1>
          </div>
          
          <div className="user-type-selection">
            <p className="user-type-description">
              Select the type of account you'd like to create:
            </p>
            
            <div className="user-type-options">
              <button 
                onClick={() => handleUserTypeSelect('applicant')}
                className="user-type-option"
              >
                <div className="user-type-icon">📝</div>
                <h3>Applicant</h3>
                <p>For prospective students applying to the AI-Native Program</p>
              </button>
              
              <button 
                onClick={() => handleUserTypeSelect('builder')}
                className="user-type-option"
              >
                <div className="user-type-icon">🔧</div>
                <h3>Builder</h3>
                <p>For current Pursuit students and alumni who want to access the main learning platform</p>
              </button>
            </div>
            
            <div className="signup-back-to-login">
              <Link to="/login" className="login-link">Already have an account? Log in</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="signup-logo" />
        </div>
        
        <div className="signup-headline">
          <h1>CREATE YOUR<br />{userType.toUpperCase()}<br />ACCOUNT</h1>
        </div>
        
        {registrationComplete ? (
          <div className="signup-success">
            <p className="signup-success-message">{successMessage}</p>
            {userType === 'builder' && (
              <div className="signup-verification-instructions">
                <h3>What's next?</h3>
                <ol>
                  <li>Check your email inbox for a verification message</li>
                  <li>Click the verification link in the email</li>
                  <li>Once verified, you can log into your account</li>
                </ol>
                <p>Don't see the email? Check your spam folder or request a new verification link.</p>
              </div>
            )}
            <div className="signup-actions">
              <Link to="/login" className="signup-button">Go to Login</Link>
              {userType === 'builder' && (
                <Link to="/resend-verification" className="signup-link">Resend Verification Email</Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            {error && <div className="signup-error">{error}</div>}
            {successMessage && <div className="signup-success-message">{successMessage}</div>}
            
            <div className="signup-account-type">
              <p>Creating a <strong>{userType}</strong> account</p>
              <button 
                type="button" 
                onClick={() => setUserType('')} 
                className="change-account-type"
              >
                Change account type
              </button>
            </div>
            
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
                  <li className={passwordValidation.match ? 'valid' : 'invalid'}>
                    Passwords must match
                  </li>
                </ul>
              </div>
            )}
            
            <button 
              type="submit" 
              className="signup-button"
              disabled={isSubmitting || !Object.values(passwordValidation).every(v => v)}
            >
              {isSubmitting ? 'Creating account...' : `Create ${userType} account`}
            </button>
            
            <div className="signup-login-link">
              <Link to="/login" className="login-link">Already have an account? Log in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup; 