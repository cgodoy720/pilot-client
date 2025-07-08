import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogo from '../../assets/logo.png';
import './ProgramDetails.css';
import '../ApplicantDashboard/ApplicantDashboard.css';

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

  const handleBackToDashboard = () => {
    navigate('/apply');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-topbar">
        <div className="admissions-topbar-left">
          <div className="admissions-logo-section">
            <Link to="/apply">
              <img src={pursuitLogo} alt="Pursuit Logo" className="admissions-logo" />
            </Link>
            <span className="admissions-logo-text">PURSUIT</span>
          </div>
          <div className="welcome-text">
            Welcome, {user.firstName || user.first_name}!
          </div>
        </div>
        <div className="admissions-topbar-right">
          <Link to="/apply" className="nav-link">Apply</Link>
          <Link to="/program-details" className="nav-link active">Details</Link>
          <button className="admissions-button-primary">Log Out</button>
        </div>
      </div>

      {/* Program Description Title */}
      <div className="admissions-title-section">
        <h1 className="admissions-title">
          Pursuit AI-Native Program is a 7-month intensive program designed to transform you into an AI-native builder. Learn cutting-edge technologies, build real-world projects, and join a community of builders shaping the future of software development.
        </h1>
      </div>

      {/* Main Content */}
      <div className="program-details-content">
        <div className="program-text-box">
          <p>
            Cohort:<br/>
            September 2025<br/><br/>
            Start Date:<br/>
            September 6, 2025<br/><br/>
            Schedule:<br/>
            Mon - Wed: 6:00 - 10:30 PM<br/>
            Sat - Sun: 10:00AM - 6:00 PM<br/><br/>
            Location:<br/>
            47-10 Austell Pl. Long Island City, NY 11101
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails; 