import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogo from '../../assets/logo.png';
import './ProgramDetails.css';

const ProgramDetails = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/apply');
  };

  if (!user) {
    return <div className="admissions-dashboard__loading">Loading...</div>;
  }

  return (
    <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogo} alt="Pursuit Logo" className="admissions-dashboard__logo" />
            </Link>
            <span className="admissions-dashboard__logo-text">PURSUIT</span>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {user.firstName || user.first_name}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link">Apply</Link>
          <Link to="/program-details" className="nav-link nav-link--active">Details</Link>
          <button 
            onClick={handleLogout}
            className="admissions-dashboard__button--primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Program Description Title and Content Side-by-Side */}
      <div className="admissions-dashboard__title-section">
        <h1 className="admissions-dashboard__title">
        Pursuit AI-Native Program is designed to transform you into an AI-native builder. Learn cutting-edge technologies, build real-world projects, and join a community of builders shaping the future of tech.
        </h1>
        
        {/* Program Details Content - positioned next to title */}
        <div className="program-details__content">
          <div className="program-details__text-box">
            <p>
              <strong>Start Date:</strong><br/>
              September 6, 2025<br/><br/>
              <strong>Schedule:</strong><br/>
              Mon - Wed: 6:00 - 10:30 PM<br/>
              Sat - Sun: 10:00AM - 6:00 PM<br/><br/>
              <strong>Location:</strong><br/>
              47-10 Austell Pl. Long Island City, NY 11101
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails; 