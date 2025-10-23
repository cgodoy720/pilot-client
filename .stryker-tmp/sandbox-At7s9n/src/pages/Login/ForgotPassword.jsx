// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'If an account exists with this email, a password reset link will be sent.');
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form-container">
        <div className="forgot-password-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="forgot-password-logo" />
        </div>
        
        <div className="forgot-password-headline">
          <h1>FORGOT YOUR<br />PASSWORD?</h1>
        </div>
        
        {isSuccess ? (
          <div className="forgot-password-success">
            <p>{message}</p>
            <Link to="/login" className="forgot-password-button">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && <div className="forgot-password-error">{error}</div>}
            {message && <div className="forgot-password-message">{message}</div>}
            
            <p className="forgot-password-instructions">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="forgot-password-input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="forgot-password-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="forgot-password-links">
              <Link to="/login" className="forgot-password-link">Back to Login</Link>
            </div>
            
            <button 
              type="submit" 
              className="forgot-password-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 