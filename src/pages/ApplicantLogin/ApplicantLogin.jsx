import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import './ApplicantLogin.css';

const ApplicantLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await databaseService.login(formData.email, formData.password);
            if (result.success) {
                // Use the redirect path from the server response
                const redirectPath = result.redirectTo || '/apply';
                navigate(redirectPath);
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="applicant-login-container">
            <div className="applicant-login-card">
                <div className="applicant-login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your Pursuit application</p>
                </div>

                <form onSubmit={handleSubmit} className="applicant-login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="applicant-login-footer">
                    <p>
                        Don't have an account? <Link to="/apply/signup">Sign up here</Link>
                    </p>
                    <p>
                        <Link to="/apply/reset-password">Forgot your password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApplicantLogin; 