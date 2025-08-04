import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pursuitLogoFull from '../../assets/logo-full.png';
import databaseService from '../../services/databaseService';
import './ApplicantDashboard.css';

const SECTION_CONFIG = [
  {
    key: 'infoSession',
    label: 'Attend an Info Session',
    description: 'Learn more about the org, our goals, and the program. All applicants are required to attend one Info Session.',
    statusOptions: ['not signed-up', 'signed-up', 'attended'],
    defaultStatus: 'not signed-up',
    getButtonLabel: (status) => {
      if (status === 'not signed-up') return 'Sign Up Here';
      if (status === 'signed-up') return 'You\'re Signed Up';
      if (status === 'attended') return 'Completed';
      return 'Sign Up Here';
    },
    buttonEnabled: (status) => status !== 'attended',
  },
  {
    key: 'application',
    label: 'Complete your Application',
    description: 'Tell us about yourself and your background. Complete an exercise to learn more about AI.',
    statusOptions: ['not started', 'in process', 'submitted', 'ineligible'],
    defaultStatus: 'not started',
    getButtonLabel: (status) => {
      if (status === 'not started') return 'Apply';
      if (status === 'in process') return 'Continue Application';
      if (status === 'submitted') return '✓ Successfully Applied';
      if (status === 'ineligible') return 'Not Eligible';
      return 'Apply';
    },
    buttonEnabled: (status) => status !== 'submitted' && status !== 'ineligible',
  },
  {
    key: 'workshop',
    label: 'Complete a Workshop',
    description: 'Get introduced to AI and experience a day in the life of a Builder.',
    statusOptions: ['locked', 'not signed-up', 'signed-up', 'attended'],
    defaultStatus: 'locked',
    getButtonLabel: (status) => {
      if (status === 'locked') return 'Invitation Required';
      if (status === 'not signed-up') return 'Sign Up Here';
      if (status === 'signed-up') return 'You\'re Signed Up';
      if (status === 'attended') return 'Completed';
      return 'Sign Up Here';
    },
    buttonEnabled: (status, applicationStatus) => {
      // Workshops are always locked until manually enabled by admin
      return false;
    },
    lockedLabel: 'Invitation Required',
  },
  {
    key: 'pledge',
    label: 'Complete your Pledge',
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
  const [currentApplicantId, setCurrentApplicantId] = useState(null);
  const [statuses, setStatuses] = useState({
    infoSession: 'not signed-up',
    application: 'not started',
    workshop: 'locked',
    pledge: 'locked',
  });
  const [sessionDetails, setSessionDetails] = useState(null);
  const [workshopDetails, setWorkshopDetails] = useState(null);
  const [applicationProgress, setApplicationProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Clear any old localStorage status data to prevent cross-account confusion
      // The dashboard now loads fresh data from the database for each user
      console.log('Dashboard: Clearing old localStorage status data');
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  // Load current applicant ID when user is set
  useEffect(() => {
    const loadApplicantId = async () => {
      if (!user?.email) return;
      
      try {
        console.log('Loading applicant ID for dashboard:', user.email);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${user.email}`);
        if (response.ok) {
          const applicant = await response.json();
          setCurrentApplicantId(applicant.applicant_id);
          console.log('Dashboard loaded applicant ID:', applicant.applicant_id);
        } else {
          console.warn('Could not load applicant ID for dashboard');
        }
      } catch (error) {
        console.error('Error loading applicant ID for dashboard:', error);
      }
    };
    
    if (user) {
      loadApplicantId();
    }
  }, [user]);

  // Load real data from database when applicant ID is available
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentApplicantId) return;
      
      console.log('Loading dashboard data for applicant:', currentApplicantId);
      setIsLoading(true);
      
      try {
        // Load info session status
        await loadInfoSessionStatus();
        
        // Load application status
        await loadApplicationStatus();
        
        // Load workshop status
        await loadWorkshopStatus();
        
        // Load pledge status (placeholder for now)
        await loadPledgeStatus();
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentApplicantId) {
      loadDashboardData();
    }
  }, [currentApplicantId]);

  const loadInfoSessionStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/info-sessions`);
      if (!response.ok) return;
      
      const events = await response.json();
      let foundRegistration = null;
      let registeredEvent = null;
      
      // Check all events for current user's registration
      for (const event of events) {
        const registrations = event.registrations || [];
        const userRegistration = registrations.find(reg => 
          reg.applicant_id === currentApplicantId && reg.status === 'registered'
        );
        
        if (userRegistration) {
          foundRegistration = userRegistration;
          registeredEvent = event;
          break;
        }
      }
      
      if (foundRegistration && registeredEvent) {
        // Treat database time as Eastern Time (extract UTC components and use as Eastern)
        const dbDate = new Date(registeredEvent.start_time);
        const year = dbDate.getUTCFullYear();
        const month = dbDate.getUTCMonth();
        const day = dbDate.getUTCDate();
        const hour = dbDate.getUTCHours();
        const minute = dbDate.getUTCMinutes();
        const easternDate = new Date(year, month, day, hour, minute);

        const eventDetails = {
          date: easternDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: easternDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          location: registeredEvent.location
        };
        
        setStatuses(prev => ({ ...prev, infoSession: 'signed-up' }));
        setSessionDetails(eventDetails);
        console.log('Dashboard: Found info session registration', eventDetails);
      } else {
        setStatuses(prev => ({ ...prev, infoSession: 'not signed-up' }));
        setSessionDetails(null);
        console.log('Dashboard: No info session registration found');
      }
    } catch (error) {
      console.error('Error loading info session status for dashboard:', error);
    }
  };

  const loadApplicationStatus = async () => {
    try {
      console.log('Dashboard: Loading application status for user:', user.email);
      
      const applicant = await databaseService.createOrGetApplicant(
        user.email,
        user.firstName || user.first_name,
        user.lastName || user.last_name
      );
      
      console.log('Dashboard: Applicant data:', applicant);
      
      const application = await databaseService.getLatestApplicationByApplicantId(applicant.applicant_id);
      
      console.log('Dashboard: Application data:', application);
      
      if (!application) {
        setStatuses(prev => ({ ...prev, application: 'not started' }));
        setApplicationProgress(null);
        console.log('Dashboard: No application found for applicant ID:', applicant.applicant_id);
        return;
      }
      
      console.log('Dashboard: Application found:', application.status, 'ID:', application.application_id);
      
      if (application.status === 'ineligible') {
        setStatuses(prev => ({ ...prev, application: 'ineligible' }));
        setApplicationProgress(null);
        console.log('Dashboard: Application is ineligible');
      } else if (application.status === 'submitted') {
        setStatuses(prev => ({ ...prev, application: 'submitted' }));
        setApplicationProgress(null);
        console.log('Dashboard: Application is submitted');
      } else {
        // Check if there's progress
        const responses = await databaseService.getApplicationResponses(application.application_id);
        console.log('Dashboard: Application responses:', responses?.length || 0);
        
        // Check localStorage for current section progress
        const currentSection = localStorage.getItem('applicationCurrentSection');
        const formData = localStorage.getItem('applicationFormData');
        const applicationStatus = localStorage.getItem('applicationStatus');
        
        console.log('Dashboard: Current section from localStorage:', currentSection);
        console.log('Dashboard: Form data in localStorage:', formData ? 'exists' : 'not found');
        console.log('Dashboard: Application status in localStorage:', applicationStatus);
        
        if (responses && responses.length > 0) {
          setStatuses(prev => ({ ...prev, application: 'in process' }));
          
          // Calculate progress
          let completedSections = 0;
          if (currentSection !== null) {
            completedSections = parseInt(currentSection, 10) + 1;
          } else {
            // Fallback: estimate based on responses
            completedSections = Math.min(Math.ceil(responses.length / 5), 5);
          }
          
          setApplicationProgress({
            completedSections,
            totalSections: 5
          });
          
          console.log('Dashboard: Application in process with progress:', completedSections + '/5');
        } else if (currentSection !== null) {
          // Even if no responses in DB, if localStorage shows progress, show in process
          setStatuses(prev => ({ ...prev, application: 'in process' }));
          const completedSections = parseInt(currentSection, 10) + 1;
          setApplicationProgress({
            completedSections,
            totalSections: 5
          });
          console.log('Dashboard: Application in process (localStorage only):', completedSections + '/5');
        } else {
          setStatuses(prev => ({ ...prev, application: 'not started' }));
          setApplicationProgress(null);
          console.log('Dashboard: Application not started');
        }
      }
    } catch (error) {
      console.error('Error loading application status for dashboard:', error);
      setStatuses(prev => ({ ...prev, application: 'not started' }));
      setApplicationProgress(null);
    }
  };

  const loadWorkshopStatus = async () => {
    try {
      // First check if the applicant has been invited to workshops by checking their stage
      const stageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/${currentApplicantId}/stage`);
      let isInvited = false;
      
      if (stageResponse.ok) {
        const stageData = await stageResponse.json();
        console.log('Dashboard: Applicant stage data:', stageData);
        
        // If current_stage is workshop_invited or any workshop-related stage, unlock workshops
        if (stageData.current_stage && 
            (stageData.current_stage.includes('workshop') || 
             stageData.current_stage === 'workshop_invited' ||
             stageData.current_stage === 'workshop_registered' ||
             stageData.current_stage === 'workshop_attended')) {
          isInvited = true;
          console.log('Dashboard: Workshop unlocked due to stage:', stageData.current_stage);
        }
      }
      
      // If not invited, keep workshop locked
      if (!isInvited) {
        setStatuses(prev => ({ ...prev, workshop: 'locked' }));
        setWorkshopDetails(null);
        console.log('Dashboard: Workshop locked - no invitation found');
        return;
      }
      
      // If invited, check for existing registrations
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workshops`);
      if (!response.ok) {
        // If we can't load workshops but they're invited, show as available
        setStatuses(prev => ({ ...prev, workshop: 'not signed-up' }));
        setWorkshopDetails(null);
        return;
      }
      
      const workshops = await response.json();
      let foundRegistration = null;
      let registeredWorkshop = null;
      
      // Check all workshops for current user's registration
      for (const workshop of workshops) {
        const registrations = workshop.registrations || [];
        const userRegistration = registrations.find(reg => 
          reg.applicant_id === currentApplicantId && reg.status === 'registered'
        );
        
        if (userRegistration) {
          foundRegistration = userRegistration;
          registeredWorkshop = workshop;
          break;
        }
      }
      
      if (foundRegistration && registeredWorkshop) {
        // Treat database time as Eastern Time (extract UTC components and use as Eastern)
        const dbDate = new Date(registeredWorkshop.start_time);
        const year = dbDate.getUTCFullYear();
        const month = dbDate.getUTCMonth();
        const day = dbDate.getUTCDate();
        const hour = dbDate.getUTCHours();
        const minute = dbDate.getUTCMinutes();
        const easternDate = new Date(year, month, day, hour, minute);

        const workshopEventDetails = {
          date: easternDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: easternDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          location: registeredWorkshop.location
        };
        
        setStatuses(prev => ({ ...prev, workshop: 'signed-up' }));
        setWorkshopDetails(workshopEventDetails);
        console.log('Dashboard: Found workshop registration', workshopEventDetails);
      } else {
        // Invited but not registered yet
        setStatuses(prev => ({ ...prev, workshop: 'not signed-up' }));
        setWorkshopDetails(null);
        console.log('Dashboard: Workshop available for signup');
      }
    } catch (error) {
      console.error('Error loading workshop status for dashboard:', error);
      setStatuses(prev => ({ ...prev, workshop: 'locked' }));
    }
  };

  const loadPledgeStatus = async () => {
    // For now, just check if workshop is attended to unlock pledge
    // This would need to be implemented based on your pledge system
    setStatuses(prev => ({ ...prev, pledge: 'locked' }));
    console.log('Dashboard: Pledge status loaded (placeholder)');
  };

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
    if (key === 'workshop') return status === 'locked' // Workshop is locked only if status is 'locked'
    if (key === 'pledge') return status === 'locked' || statuses.workshop !== 'attended'
    return false
  }

  const isButtonEnabled = (section) => {
    if (section.key === 'workshop') {
      return section.buttonEnabled(statuses.workshop, statuses.application)
    }
    if (section.key === 'pledge') {
      return section.buttonEnabled(statuses.pledge, statuses.workshop)
    }
    return section.buttonEnabled(statuses[section.key])
  }

  const getButtonStyle = (enabled, isLockedState = false, isIneligibleState = false, isSubmittedState = false) => ({
    background: isSubmittedState ? '#48bb78' :
                enabled ? 'var(--color-primary)' : 
                isIneligibleState ? 'var(--color-background-darker)' : 
                isLockedState ? '#f5f5f5' : 'var(--color-border)',
    color: isSubmittedState ? '#fff' :
           enabled ? '#fff' : 
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
        <div className="session-details__icon">📅</div>
        <div className="session-details__content">
          <div className="session-details__date">{sessionDetails.date}</div>
          <div className="session-details__time">{sessionDetails.time}</div>
          <div className="session-details__location">{sessionDetails.location}</div>
        </div>
      </div>
    );
  };

  // Function to get application progress details
  const getApplicationProgressText = () => {
    if (applicationProgress) {
      return `${applicationProgress.completedSections}/${applicationProgress.totalSections} sections complete`;
    }
    return '0/5 sections complete';
  };

  const handleLogout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('applicantToken');
    // Clear old localStorage status items that might cause confusion
    localStorage.removeItem('infoSessionStatus');
    localStorage.removeItem('infoSessionDetails');
    localStorage.removeItem('workshopStatus');
    localStorage.removeItem('workshopDetails');
    localStorage.removeItem('applicationStatus');
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
    return <div className="admissions-dashboard__loading">Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="admissions-dashboard">
        <div className="admissions-dashboard__loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
            </Link>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {user.firstName || user.first_name}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link nav-link--active">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
          {user.userType === 'builder' && (
            <button 
              onClick={handleBackToMainApp}
              className="admissions-dashboard__button--secondary"
            >
              Main App
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="admissions-dashboard__button--primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="admissions-dashboard__title-section">
        <h1 className="admissions-dashboard__title">
          Start your AI-Native journey by completing the following steps.
        </h1>
      </div>
      
      {/* Main Content Layout */}
      <div className="admissions-dashboard__content">
        {/* Action Cards */}
        <div className="action-cards">
          {SECTION_CONFIG.map((section, index) => {
            const status = statuses[section.key];
            const complete = isComplete(section.key, status)
            const ineligible = isIneligible(section.key, status)
            const enabled = isButtonEnabled(section)
            const locked = isLocked(section.key, status)
            
            return (
              <div key={section.key} className={`action-card ${locked ? 'action-card--locked' : ''} ${ineligible ? 'action-card--ineligible' : ''} ${complete ? 'action-card--completed' : ''}`}>
                {/* Icon and title */}
                <div className="action-card__header">
                  <div className={`action-card__icon ${complete ? 'action-card__icon--complete' : ineligible ? 'action-card__icon--ineligible' : locked ? 'action-card__icon--locked' : ''}`}>
                    {complete ? (
                      <span>✔</span>
                    ) : ineligible ? (
                      <span>❌</span>
                    ) : (
                      <span className="action-card__number">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="action-card__title">{section.label}</div>
                  <div className="action-card__description">{section.description}</div>
                </div>
                
                {/* Details section */}
                <div className="action-card__details">
                  {/* Ineligible state message */}
                  {section.key === 'application' && ineligible && (
                    <div className="action-card__ineligible-message">
                      You do not meet our current eligibility requirements.
                    </div>
                  )}
                  
                  {/* Locked state message for workshop */}
                  {section.key === 'workshop' && locked && (
                    <div className="action-card__locked-message">
                      Workshop sign-up will be available after your application is reviewed and you are invited to the next stage.
                    </div>
                  )}
                  
                  {/* Locked state message for pledge */}
                  {section.key === 'pledge' && locked && (
                    <div className="action-card__locked-message">
                      Pledge will be available after completing the workshop.
                    </div>
                  )}

                  {section.key === 'application' && status === 'in process' && (
                    <div className="session-details__container">
                      <div className="session-details">
                        <div className="session-details__icon">💾</div>
                        <div className="session-details__content">
                          <div className="session-details__date">Progress Saved</div>
                          <div className="session-details__time">{getApplicationProgressText()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  

                  {section.key === 'infoSession' && status === 'signed-up' && sessionDetails && (
                    <div className="session-details__container">
                      {getSessionDetailsText()}
                    </div>
                  )}
                  
                  {section.key === 'workshop' && status === 'signed-up' && workshopDetails && (
                    <div className="session-details__container">
                      <div className="session-details">
                        <div className="session-details__icon">📅</div>
                        <div className="session-details__content">
                          <div className="session-details__date">{workshopDetails.date}</div>
                          <div className="session-details__time">{workshopDetails.time}</div>
                          <div className="session-details__location">{workshopDetails.location}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Button */}
                <div className="action-card__button-container">
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
                        style={getButtonStyle(true, false, false, false)}
                        onClick={handleEditEligibility}
                      >
                        <span>
                          ✏️ Edit Responses
                        </span>
                      </button>
                    </div>
                  ) : ineligible ? (
                    <button
                      style={getButtonStyle(false, false, true, false)}
                      disabled={true}
                    >
                      <span>
                        ❌ {section.getButtonLabel(status)}
                      </span>
                    </button>
                  ) : locked ? (
                    <button
                      style={getButtonStyle(false, true, false, false)}
                      disabled={true}
                    >
                      <span>
                        🔒 {section.getButtonLabel(status)}
                      </span>
                    </button>
                  ) : (
                    <Link to={enabled ? (section.key === 'infoSession' ? '/info-sessions' : 
                            section.key === 'workshop' ? '/workshops' :
                            section.key === 'application' ? '/application-form' : 
                            section.key === 'pledge' ? '/pledge' : '#') : '#'} 
                          className="action-card__button-link">
                      <button
                        style={getButtonStyle(enabled, false, false, section.key === 'application' && status === 'submitted')}
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