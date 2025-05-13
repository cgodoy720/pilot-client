import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          
          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-form-container">
        <div className="verify-email-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="verify-email-logo" />
        </div>
        
        <div className="verify-email-headline">
          <h1>EMAIL<br/>VERIFICATION</h1>
        </div>
        
        <div className="verify-email-content">
          {verifying ? (
            <div className="verify-email-message">
              <p>Verifying your email address...</p>
              <div className="verify-email-spinner"></div>
            </div>
          ) : success ? (
            <div className="verify-email-success">
              <p>Your email has been verified successfully!</p>
              <p>You will be redirected to the dashboard shortly...</p>
              <Link to="/dashboard" className="verify-email-button">Go to Dashboard</Link>
            </div>
          ) : (
            <div className="verify-email-error">
              <p>{error}</p>
              {error.includes('expired') && (
                <div className="verify-email-resend">
                  <p>Would you like to request a new verification link?</p>
                  <Link to="/resend-verification" className="verify-email-button">Resend Verification</Link>
                </div>
              )}
              <Link to="/login" className="verify-email-link">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 