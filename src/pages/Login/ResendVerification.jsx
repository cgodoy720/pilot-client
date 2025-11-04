import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './ResendVerification.css';

const ResendVerification = () => {
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
<<<<<<< HEAD
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/resend-verification`, {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
>>>>>>> dev
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'If an account exists with this email, a verification link will be sent.');
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
    <div className="resend-verification-container">
      <div className="resend-verification-form-container">
        <div className="resend-verification-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="resend-verification-logo" />
        </div>
        
        <div className="resend-verification-headline">
          <h1>RESEND<br />VERIFICATION</h1>
        </div>
        
        {isSuccess ? (
          <div className="resend-verification-success">
            <p>{message}</p>
            <Link to="/login" className="resend-verification-button">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="resend-verification-form">
            {error && <div className="resend-verification-error">{error}</div>}
            {message && <div className="resend-verification-message">{message}</div>}
            
            <p className="resend-verification-instructions">
              Enter your email address and we'll send you another verification link.
            </p>
            
            <div className="resend-verification-input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="resend-verification-input"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="resend-verification-links">
              <Link to="/login" className="resend-verification-link">Back to Login</Link>
            </div>
            
            <button 
              type="submit" 
              className="resend-verification-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Resend Verification Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerification; 