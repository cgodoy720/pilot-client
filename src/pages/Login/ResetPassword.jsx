import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import logoFull from '../../assets/logo-full.png';

const SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>';

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
            
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${encodedToken}`;
            console.log('API URL:', apiUrl);
            
            // Check if the password meets the requirements
            const minLength = password.length >= 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
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
        <div className="min-h-screen bg-pursuit-purple flex flex-col items-center justify-start px-6 py-8 pt-[10vh]">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="mb-8">
                    <img src={logoFull} alt="Pursuit Logo" className="h-10 w-auto" />
                </div>
                
                <div className="text-center mb-8">
                    <h1 className="text-white text-2xl md:text-3xl font-bold font-proxima leading-tight">
                        RESET YOUR<br />PASSWORD
                    </h1>
                </div>
                
                {message ? (
                    <div className="flex flex-col items-center gap-6 text-center w-full">
                        <p className="text-white text-base leading-relaxed">{message}</p>
                        <Button 
                            asChild
                            className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
                        >
                            <Link to="/login">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-center text-sm">
                                {error}
                            </div>
                        )}
                        
                        <p className="text-white/80 text-sm mb-2">
                            Password must contain at least 8 characters, including uppercase, lowercase, number and special character ({SPECIAL_CHARS})
                        </p>
                        
                        <div className="relative w-full">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                required
                                disabled={isLoading}
                                minLength="8"
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?&quot;:{}|<>])[A-Za-z\d!@#$%^&*(),.?&quot;:{}|<>]{8,}$"
                                title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
                                className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2 pr-8"
                            />
                            <button 
                                type="button" 
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        
                        <div className="relative w-full">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                required
                                disabled={isLoading}
                                minLength="8"
                                className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2 pr-8"
                            />
                            <button 
                                type="button" 
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        
                        <div className="flex justify-start mt-2">
                            <Link 
                                to="/login" 
                                className="text-white/80 text-xs hover:text-white underline transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                        
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium mt-4"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword; 