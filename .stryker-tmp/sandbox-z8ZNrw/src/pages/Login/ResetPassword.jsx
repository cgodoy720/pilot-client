// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoFull from '../../assets/logo-full.png';
import './ResetPassword.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('Submitting reset request with token:', token);
            
            // Try different token handling approaches
            const cleanToken = token.trim(); // Remove any whitespace
            
            // Try with URL encoding
            const encodedToken = encodeURIComponent(cleanToken);
            console.log('Encoded token:', encodedToken);
            
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/users/reset-password/${encodedToken}`;
            console.log('API URL:', apiUrl);
            
            // Check if the password meets the requirements
            const minLength = password.length >= 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[@$!%*?&]/.test(password);
            
            console.log('Password validation:', {
                minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);
            
            if (response.ok) {
                setMessage(data.message || 'Your password has been successfully reset.');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'An error occurred. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error('Error details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form-container">
                <div className="reset-password-logo-container">
                    <img src={logoFull} alt="Pursuit Logo" className="reset-password-logo" />
                </div>
                
                <div className="reset-password-headline">
                    <h1>RESET YOUR<br />PASSWORD</h1>
                </div>
                
                <form onSubmit={handleSubmit} className="reset-password-form">
                    {error && <div className="reset-password-error">{error}</div>}
                    {message && <div className="reset-password-message">{message}</div>}
                    
                    <div className="reset-password-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            required
                            className="reset-password-input"
                            disabled={isLoading}
                            minLength="8"
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)"
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    
                    <div className="password-requirements-hint">
                        Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)
                    </div>
                    
                    <div className="reset-password-input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            required
                            className="reset-password-input"
                            disabled={isLoading}
                            minLength="8"
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    
                    <div className="reset-password-links">
                        <Link to="/login" className="reset-password-link">Back to Login</Link>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="reset-password-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 