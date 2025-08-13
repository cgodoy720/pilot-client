import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './AttendanceLogin.css';

const AttendanceLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 403 && data.needsVerification) {
          setError('Please verify your email address before logging in.');
        } else if (response.status === 403 && data.error?.includes('Admin or staff privileges')) {
          setError('Access denied. Admin or staff privileges required for attendance management.');
        } else {
          setError(data.error || 'Invalid email or password');
        }
        return;
      }

      // Store attendance token and user data
      localStorage.setItem('attendanceToken', data.token);
      localStorage.setItem('attendanceUser', JSON.stringify(data.user));
      
      // Show success message briefly before redirect
      setError(''); // Clear any previous errors
      
      // Redirect to attendance dashboard
      const redirectPath = data.redirectTo || '/attendance-dashboard';
      navigate(redirectPath);
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Attendance login error:', err);
    } finally {
      setIsSubmitting(false);
    }
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
          
          <div className="attendance-login-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
              className="attendance-login-input"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              aria-label="Admin password"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="attendance-login-button"
            disabled={isSubmitting}
            aria-label="Sign in to attendance system"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="attendance-login-footer">
          <p>Staff and admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogin;
