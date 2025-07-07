import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pursuitLogo from '../../assets/logo.png';
import './ApplicantDashboard.css';

const SECTION_CONFIG = [
  {
    key: 'infoSession',
    label: 'Info Session',
    description: 'Sign up to learn more about the program',
    statusOptions: ['not signed-up', 'signed-up', 'attended'],
    defaultStatus: 'not signed-up',
    getButtonLabel: (status) => {
      if (status === 'not signed-up') return 'Sign Up Here';
      if (status === 'signed-up') return 'You\'re Signed Up';
      if (status === 'attended') return 'Completed';
      return 'Sign Up Here';
    },
    buttonEnabled: (status) => status === 'not signed-up',
  },
  {
    key: 'application',
    label: 'Application',
    description: 'Apply to join the August cohort',
    statusOptions: ['not started', 'in process', 'submitted'],
    defaultStatus: 'not started',
    getButtonLabel: (status) => {
      if (status === 'not started') return 'Apply';
      if (status === 'in process') return 'Continue Application';
      if (status === 'submitted') return 'Application Submitted';
      return 'Apply';
    },
    buttonEnabled: (status) => status !== 'submitted',
  },
  {
    key: 'workshop',
    label: 'Workshop',
    description: 'Experience a day in the life of a builder',
    statusOptions: ['locked', 'not signed-up', 'signed-up', 'attended'],
    defaultStatus: 'locked',
    getButtonLabel: (status) => {
      if (status === 'locked') return 'Application Required';
      if (status === 'not signed-up') return 'Sign Up Here';
      if (status === 'signed-up') return 'You\'re Signed Up';
      if (status === 'attended') return 'Completed';
      return 'Sign Up Here';
    },
    buttonEnabled: (status, applicationStatus) => applicationStatus === 'submitted' && status !== 'attended',
    lockedLabel: 'Application Required',
  },
]

function ApplicantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState({
    infoSession: 'not signed-up',
    application: 'not started',
    workshop: 'locked',
  })
  const [infoSessionStatus, setInfoSessionStatus] = useState(localStorage.getItem('infoSessionStatus') || 'not signed-up');
  const [workshopStatus, setWorkshopStatus] = useState(localStorage.getItem('workshopStatus') || 'locked');
  const [sessionDetails, setSessionDetails] = useState(null)
  const [workshopDetails, setWorkshopDetails] = useState(null)

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

  // Load status and session details from localStorage on mount
  useEffect(() => {
    const savedInfoSessionStatus = localStorage.getItem('infoSessionStatus');
    const savedWorkshopStatus = localStorage.getItem('workshopStatus');
    const savedInfoSessionDetails = localStorage.getItem('infoSessionDetails');
    const savedWorkshopDetails = localStorage.getItem('workshopDetails');
    const savedApplicationStatus = localStorage.getItem('applicationStatus');
    
    if (savedInfoSessionStatus) {
      setInfoSessionStatus(savedInfoSessionStatus);
    }
    if (savedWorkshopStatus) {
      setWorkshopStatus(savedWorkshopStatus);
    }
    if (savedInfoSessionDetails) {
      setSessionDetails(JSON.parse(savedInfoSessionDetails));
    }
    if (savedWorkshopDetails) {
      setWorkshopDetails(JSON.parse(savedWorkshopDetails));
    }
    if (savedApplicationStatus) {
      setStatuses(prev => ({
        ...prev,
        application: savedApplicationStatus
      }));
    }
  }, []);

  // Update application status when form data changes
  useEffect(() => {
    const formData = localStorage.getItem('applicationFormData');
    const savedApplicationStatus = localStorage.getItem('applicationStatus');
    
    // Check for existing progress or saved status
    if (formData || savedApplicationStatus === 'in process') {
      setStatuses(prev => ({
        ...prev,
        application: 'in process'
      }));
      localStorage.setItem('applicationStatus', 'in process');
    } else if (savedApplicationStatus === 'submitted') {
      setStatuses(prev => ({
        ...prev,
        application: 'submitted'
      }));
    }
  }, []);

  // Update workshop status when application status changes
  useEffect(() => {
    if (statuses.application === 'submitted' && workshopStatus === 'locked') {
      setWorkshopStatus('not signed-up');
      localStorage.setItem('workshopStatus', 'not signed-up');
    } else if (statuses.application !== 'submitted' && workshopStatus !== 'locked') {
      setWorkshopStatus('locked');
      localStorage.setItem('workshopStatus', 'locked');
    }
  }, [statuses.application, workshopStatus]);

  const isComplete = (key, status) => {
    if (key === 'infoSession') return status === 'attended'
    if (key === 'application') return status === 'submitted'
    if (key === 'workshop') return status === 'attended'
    return false
  }

  const isLocked = (key, status) => {
    if (key === 'workshop') return status === 'locked' || statuses.application !== 'submitted'
    return false
  }

  const isButtonEnabled = (section) => {
    if (section.key === 'workshop') {
      return section.buttonEnabled(workshopStatus, statuses.application)
    }
    return section.buttonEnabled(statuses[section.key])
  }

  const getButtonStyle = (enabled, isLockedState = false) => ({
    background: enabled ? 'var(--color-primary)' : isLockedState ? '#f5f5f5' : 'var(--color-border)',
    color: enabled ? '#fff' : isLockedState ? '#999' : 'var(--color-text-muted)',
    border: isLockedState ? '2px dashed #ddd' : 'none',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: enabled ? 'pointer' : 'not-allowed',
    marginTop: '0',
    transition: 'all 0.2s',
    width: '100%',
    maxWidth: '280px',
    height: '48px',
    position: 'relative',
    opacity: isLockedState ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
  })

  const getSessionDetailsText = () => {
    if (!sessionDetails) return null;
    return (
      <div className="session-details">
        <div className="session-details-icon">📅</div>
        <div className="session-details-content">
          <div className="session-date">{sessionDetails.date}</div>
          <div className="session-time">{sessionDetails.time}</div>
          <div className="session-location">{sessionDetails.location}</div>
        </div>
      </div>
    );
  };

  // Function to get application progress details
  const getApplicationProgressText = () => {
    const formData = localStorage.getItem('applicationFormData');
    const currentSection = localStorage.getItem('applicationCurrentSection');
    
    if (formData) {
      try {
        const savedData = JSON.parse(formData);
        const answeredQuestions = Object.keys(savedData).length;
        const sectionNum = currentSection ? parseInt(currentSection, 10) + 1 : 1;
        
        return `You have answered ${answeredQuestions} questions and were on section ${sectionNum}. Continue where you left off!`;
      } catch (e) {
        return 'You have saved progress. Continue your application!';
      }
    }
    return null;
  };

  const handleLogout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('applicantToken');
    setUser(null);
    navigate('/login');
  };

  const handleBackToMainApp = () => {
    navigate('/dashboard');
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
          {user.userType === 'builder' && (
            <button 
              onClick={handleBackToMainApp}
              className="admissions-button-secondary"
            >
              Main App
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="admissions-button-primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* AI-NATIVE PROGRAM Title */}
      <div className="admissions-title-section">
        <h1 className="admissions-title">
          AI-NATIVE PROGRAM
        </h1>
      </div>
      
      {/* Main Content Layout */}
      <div className="admissions-content">
        {/* Left Side - Program Information */}
        <div className="program-info">
          <h2 className="cohort-title">
            August 2025 Cohort
          </h2>
          
          <div className="program-details">
            <div className="program-detail-item">
              <div className="detail-icon">📅</div>
              <div>
                <div className="detail-label">Start Date</div>
                <div className="detail-value">August 2025</div>
              </div>
            </div>
            
            <div className="program-detail-item">
              <div className="detail-icon">⏰</div>
              <div>
                <div className="detail-label">Schedule</div>
                <div className="detail-value">Mon-Wed: 6:00-10:30 PM<br/>Sat-Sun: 10:00 AM-6:00 PM</div>
              </div>
            </div>
            
            <div className="program-detail-item">
              <div className="detail-icon">📍</div>
              <div>
                <div className="detail-label">Location</div>
                <div className="detail-value">47-10 Austell Place<br/>Long Island City, NY 11101</div>
              </div>
            </div>
          </div>
          
          <div className="program-description">
            <p>
              A 7-month intensive program designed to transform you into an AI-native builder. 
              Learn cutting-edge technologies, build real-world projects, and join a community of builders 
              shaping the future of software development.
            </p>
          </div>
        </div>
        
        {/* Right Side - Action Cards */}
        <div className="action-cards">
          {SECTION_CONFIG.map((section) => {
            const status = section.key === 'infoSession' ? infoSessionStatus : 
                         section.key === 'workshop' ? workshopStatus : 
                         statuses[section.key];
            const complete = isComplete(section.key, status)
            const enabled = isButtonEnabled(section)
            const locked = isLocked(section.key, status)
            
            return (
              <div key={section.key} className={`action-card ${locked ? 'locked' : ''}`}>
                {/* Icon and title */}
                <div className="card-header">
                  <div className={`card-icon ${complete ? 'complete' : locked ? 'locked' : ''}`}>
                    {complete ? (
                      <span>✔</span>
                    ) : locked ? (
                      <span>🔒</span>
                    ) : (
                      <span>
                        {section.key === 'infoSession' ? '💡' : 
                         section.key === 'application' ? '📝' : 
                         section.key === 'workshop' ? '🛠️' : ''}
                      </span>
                    )}
                  </div>
                  <div className="card-title">{section.label}</div>
                  <div className="card-description">{section.description}</div>
                </div>
                
                {/* Details section */}
                <div className="card-details">
                  {/* Locked state message for workshop */}
                  {section.key === 'workshop' && locked && (
                    <div className="locked-message">
                      Workshop sign-up will open once your application is submitted and reviewed.
                    </div>
                  )}

                  {section.key === 'application' && status === 'in process' && (
                    <div className="session-details-container">
                      <div className="session-details">
                        <div className="session-details-icon">💾</div>
                        <div className="session-details-content">
                          <div className="session-date">Progress Saved</div>
                          <div className="session-time">{getApplicationProgressText()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.key === 'infoSession' && status === 'signed-up' && sessionDetails && (
                    <div className="session-details-container">
                      {getSessionDetailsText()}
                    </div>
                  )}
                  
                  {section.key === 'workshop' && status === 'signed-up' && workshopDetails && (
                    <div className="session-details-container">
                      <div className="session-details">
                        <div className="session-details-icon">📅</div>
                        <div className="session-details-content">
                          <div className="session-date">{workshopDetails.date}</div>
                          <div className="session-time">{workshopDetails.time}</div>
                          <div className="session-location">{workshopDetails.location}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Button */}
                <div className="card-button-container">
                  {locked ? (
                    <button
                      style={getButtonStyle(false, true)}
                      disabled={true}
                    >
                      <span>
                        🔒 {section.getButtonLabel(status)}
                      </span>
                    </button>
                  ) : (
                    <Link to={section.key === 'infoSession' ? '/info-sessions' : 
                            section.key === 'workshop' ? '/workshops' :
                            section.key === 'application' ? '/application-form' : '#'} 
                          className="card-button-link">
                      <button
                        style={getButtonStyle(enabled)}
                        disabled={!enabled}
                      >
                        {section.getButtonLabel(status)}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ApplicantDashboard 