import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically authenticate with your backend
    // For now, we'll just navigate to the main app
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
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
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="login-input"
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
            <a href="#" className="login-link">Create an account</a>
            <a href="#" className="login-link">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-button">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 