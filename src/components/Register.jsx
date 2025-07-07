import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user data in localStorage or state management
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      // Redirect to dashboard or home page
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2 className="auth-form-title">Create your account</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <label htmlFor="firstName" className="auth-form-label">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="auth-form-input"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <label htmlFor="lastName" className="auth-form-label">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="auth-form-input"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <label htmlFor="email" className="auth-form-label">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="auth-form-input"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          <label htmlFor="password" className="auth-form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="auth-form-input"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit" className="auth-form-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register; 