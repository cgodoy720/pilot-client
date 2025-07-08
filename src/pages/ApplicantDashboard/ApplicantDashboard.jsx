import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pursuitLogo from '../../assets/logo.png';
import databaseService from '../../services/databaseService';
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
    statusOptions: ['not started', 'in process', 'submitted', 'ineligible'],
    defaultStatus: 'not started',
    getButtonLabel: (status) => {
      if (status === 'not started') return 'Apply';
      if (status === 'in process') return 'Continue Application';
      if (status === 'submitted') return 'Application Submitted';
      if (status === 'ineligible') return 'Not Eligible';
      return 'Apply';
    },
    buttonEnabled: (status) => status !== 'submitted' && status !== 'ineligible',
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
  {
    key: 'pledge',
    label: 'Pledge',
    description: 'Commit to the program expectations',
    statusOptions: ['locked', 'not completed', 'completed'],
    defaultStatus: 'locked',
    getButtonLabel: (status) => {
      if (status === 'locked') return 'Workshop Required';
      if (status === 'not completed') return 'Make Pledge';
      if (status === 'completed') return 'Pledge Completed';
      return 'Make Pledge';
    },
    buttonEnabled: (status, workshopStatus) => workshopStatus === 'attended' && status !== 'completed',
    lockedLabel: 'Workshop Required',
  },
]

function ApplicantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState({
    infoSession: 'not signed-up',
    application: 'not started',
    workshop: 'locked',
    pledge: 'locked',
  })
  const [infoSessionStatus, setInfoSessionStatus] = useState(localStorage.getItem('infoSessionStatus') || 'not signed-up');
  const [workshopStatus, setWorkshopStatus] = useState(localStorage.getItem('workshopStatus') || 'locked');
  const [pledgeStatus, setPledgeStatus] = useState(localStorage.getItem('pledgeStatus') || 'locked');
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
    if (savedApplicationStatus === 'ineligible') {
      setStatuses(prev => ({
        ...prev,
        application: 'ineligible'
      }));
    } else if (savedApplicationStatus === 'submitted') {
      setStatuses(prev => ({
        ...prev,
        application: 'submitted'
      }));
    } else if (formData || savedApplicationStatus === 'in process') {
      setStatuses(prev => ({
        ...prev,
        application: 'in process'
      }));
      localStorage.setItem('applicationStatus', 'in process');
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

  // Update pledge status when workshop status changes
  useEffect(() => {
    if (workshopStatus === 'attended' && pledgeStatus === 'locked') {
      setPledgeStatus('not completed');
      localStorage.setItem('pledgeStatus', 'not completed');
    } else if (workshopStatus !== 'attended' && pledgeStatus !== 'locked') {
      setPledgeStatus('locked');
      localStorage.setItem('pledgeStatus', 'locked');
    }
  }, [workshopStatus, pledgeStatus]);

  const isComplete = (key, status) => {
    if (key === 'infoSession') return status === 'attended'
    if (key === 'application') return status === 'submitted'
    if (key === 'workshop') return status === 'attended'
    if (key === 'pledge') return status === 'completed'
    return false
  }

  const isIneligible = (key, status) => {
    if (key === 'application') return status === 'ineligible'
    return false
  }

  const isLocked = (key, status) => {
    if (key === 'workshop') return status === 'locked' || statuses.application !== 'submitted'
    if (key === 'pledge') return status === 'locked' || workshopStatus !== 'attended'
    return false
  }

  const isButtonEnabled = (section) => {
    if (section.key === 'workshop') {
      return section.buttonEnabled(workshopStatus, statuses.application)
    }
    if (section.key === 'pledge') {
      return section.buttonEnabled(pledgeStatus, workshopStatus)
    }
    return section.buttonEnabled(statuses[section.key])
  }

  const getButtonStyle = (enabled, isLockedState = false, isIneligibleState = false) => ({
    background: enabled ? 'var(--color-primary)' : 
                isIneligibleState ? 'var(--color-background-darker)' : 
                isLockedState ? '#f5f5f5' : 'var(--color-border)',
    color: enabled ? '#fff' : 
           isIneligibleState ? 'var(--color-text-secondary)' :
           isLockedState ? '#999' : 'var(--color-text-muted)',
    border: isLockedState ? '2px dashed #ddd' : 
            isIneligibleState ? '2px solid var(--color-border)' : 'none',
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
    const currentSection = localStorage.getItem('applicationCurrentSection');
    
    if (currentSection !== null) {
      const completedSections = parseInt(currentSection, 10) + 1;
      return `${completedSections}/5 sections complete`;
    }
    return '0/5 sections complete';
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

  const handleEditEligibility = async () => {
    try {
      // Get applicant ID from localStorage or user data
      const savedUser = localStorage.getItem('user');
      let applicantId = null;
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Try to get applicant ID from stored user data
          if (userData.applicantId) {
            applicantId = userData.applicantId;
          } else {
            // Create or get applicant to get the ID
            const applicant = await databaseService.createOrGetApplicant(
              userData.email || user.email,
              userData.firstName || userData.first_name || user.firstName || user.first_name,
              userData.lastName || userData.last_name || user.lastName || user.last_name
            );
            applicantId = applicant.applicant_id;
          }
        } catch (e) {
          console.warn('Could not parse saved user data');
        }
      }
      
      if (!applicantId) {
        alert('Unable to find your application. Please try logging in again.');
        return;
      }

      // Reset eligibility status
      const result = await databaseService.resetEligibility(applicantId);
      
      if (result.success) {
        // Update local state
        setStatuses(prev => ({
          ...prev,
          application: 'in process'
        }));
        localStorage.setItem('applicationStatus', 'in process');
        
        // Set flag to navigate to eligibility section
        localStorage.setItem('eligibilityResetForEditing', 'true');
        
        alert('Your eligibility status has been reset. You can now edit your responses.');
        
        // Navigate to application form
        navigate('/application-form');
      } else {
        alert('Failed to reset eligibility status. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting eligibility:', error);
      alert('An error occurred while resetting your eligibility. Please try again.');
    }
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
          <Link to="/apply" className="nav-link active">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
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

      {/* Title */}
      <div className="admissions-title-section">
        <h1 className="admissions-title">
          Get ready to start your AI-Native journey by completing the following steps.
        </h1>
      </div>
      
      {/* Main Content Layout */}
      <div className="admissions-content">
        {/* Action Cards */}
        <div className="action-cards">
          {SECTION_CONFIG.map((section, index) => {
            const status = section.key === 'infoSession' ? infoSessionStatus : 
                         section.key === 'workshop' ? workshopStatus : 
                         section.key === 'pledge' ? pledgeStatus :
                         statuses[section.key];
            const complete = isComplete(section.key, status)
            const ineligible = isIneligible(section.key, status)
            const enabled = isButtonEnabled(section)
            const locked = isLocked(section.key, status)
            
            return (
              <div key={section.key} className={`action-card ${locked ? 'locked' : ''} ${ineligible ? 'ineligible' : ''} ${complete ? 'completed' : ''}`}>
                {/* Icon and title */}
                <div className="card-header">
                  <div className={`card-icon ${complete ? 'complete' : ineligible ? 'ineligible' : locked ? 'locked' : ''}`}>
                    {complete ? (
                      <span>✔</span>
                    ) : ineligible ? (
                      <span>❌</span>
                    ) : (
                      <span className="card-number">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="card-title">{section.label}</div>
                  <div className="card-description">{section.description}</div>
                </div>
                
                {/* Details section */}
                <div className="card-details">
                  {/* Ineligible state message */}
                  {section.key === 'application' && ineligible && (
                    <div className="ineligible-message">
                      You do not meet our current eligibility requirements.
                    </div>
                  )}
                  
                  {/* Locked state message for workshop */}
                  {section.key === 'workshop' && locked && (
                    <div className="locked-message">
                      Workshop sign-up will open once your application is submitted and reviewed.
                    </div>
                  )}
                  
                  {/* Locked state message for pledge */}
                  {section.key === 'pledge' && locked && (
                    <div className="locked-message">
                      Pledge will be available after completing the workshop.
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
                  {ineligible && section.key === 'application' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <div style={{ 
                        fontStyle: 'italic', 
                        marginBottom: '12px', 
                        textAlign: 'center', 
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.85rem'
                      }}>
                        Made a mistake?
                      </div>
                      <button
                        style={getButtonStyle(true, false, false)}
                        onClick={handleEditEligibility}
                      >
                        <span>
                          ✏️ Edit Responses
                        </span>
                      </button>
                    </div>
                  ) : ineligible ? (
                    <button
                      style={getButtonStyle(false, false, true)}
                      disabled={true}
                    >
                      <span>
                        ❌ {section.getButtonLabel(status)}
                      </span>
                    </button>
                  ) : locked ? (
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
                            section.key === 'application' ? '/application-form' : 
                            section.key === 'pledge' ? '/pledge' : '#'} 
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