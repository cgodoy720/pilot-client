import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaArrowRight, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // Check if user has active status
  const isActive = user?.active !== false;
  // Check if user is volunteer
  const isVolunteer = user?.role === 'volunteer';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [cohortFilter, setCohortFilter] = useState(null);
<<<<<<< HEAD
=======
  const [workshopInfo, setWorkshopInfo] = useState(null);
>>>>>>> dev

  useEffect(() => {
    // Only fetch dashboard data if user is active
    if (isActive) {
      fetchDashboardData();
    } else {
      // If user is inactive, we don't need to load the dashboard data
      setIsLoading(false);
    }
  }, [token, cohortFilter, user.role, isActive]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `${import.meta.env.VITE_API_URL}/api/progress/current-day`;
      
      // Add cohort parameter for staff/admin if selected
      if ((user.role === 'staff' || user.role === 'admin') && cohortFilter) {
        url += `?cohort=${encodeURIComponent(cohortFilter)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Failed to fetch dashboard data');
        error.response = { status: response.status, data: errorData };
        throw error;
      }
      
      const data = await response.json();
      
      // Debug logging
      console.log('API Response Data:', data);
      console.log('API Response Data Type:', typeof data);
      console.log('API Response Data Keys:', Object.keys(data));
      console.log('timeBlocks property:', data.timeBlocks);
      
      if (data.message === 'No schedule for today') {
        // Handle case where there's no schedule for today
        setIsLoading(false);
        return;
      }
      
      // Process the data
      const timeBlocks = data.timeBlocks || [];
      const taskProgress = Array.isArray(data.taskProgress) ? data.taskProgress : [];
      
      // Extract tasks from all time blocks
      const allTasks = [];
      
      timeBlocks.forEach(block => {
        // Add tasks with their completion status
        block.tasks.forEach(task => {
          const taskCompleted = taskProgress.find(
            progress => progress.task_id === task.id
          )?.status === 'completed';
          
          allTasks.push({
            id: task.id,
            time: formatTime(block.start_time),
            title: task.task_title,
            duration: `${task.duration_minutes} min`,
            type: task.task_type,
            completed: taskCompleted
          });
        });
      });
      
      // Set state with the processed data
      setCurrentDay(data.day || {});
      setDailyTasks(allTasks);
      
      // Get learning objectives from the day object
      const dayObjectives = data.day && data.day.learning_objectives ? 
        data.day.learning_objectives : [];
      setObjectives(dayObjectives);
      
<<<<<<< HEAD
=======
      // Store workshop info if present
      setWorkshopInfo(data.workshopInfo || null);
      
>>>>>>> dev
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      console.log('Error details:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue session button click
  const handleContinueSession = () => {
    // If user is inactive, don't navigate to Learning
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    // Add cohort parameter if staff/admin has selected a cohort
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `?cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    // Navigate to the chat-based learning interface
    navigate(`/learning${cohortParam}`);
  };

  // Navigate to the specific task in the Learning page
  const navigateToTask = (taskId) => {
    // If user is inactive, don't navigate to Learning
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    // Add cohort parameter if staff/admin has selected a cohort
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `&cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    navigate(`/learning?taskId=${taskId}${cohortParam}`);
  };

  // Navigate to calendar for historical viewing
  const navigateToCalendar = () => {
    navigate('/calendar');
  };

  // Helper function to render task icon based on type
  const getTaskIcon = (type, completed) => {
    if (completed) {
      return <FaCheckCircle className="task-icon completed" />;
    }
    
    switch (type) {
      case 'standup':
      case 'discussion':
        return <FaCheckCircle className="task-icon standup" />;
      case 'group':
        return <FaUsers className="task-icon group" />;
      case 'individual':
        return <FaUserAlt className="task-icon individual" />;
      case 'reflection':
        return <FaBook className="task-icon reflection" />;
      default:
        return <FaCheckCircle className="task-icon" />;
    }
  };

  // Add a helper function to format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // If the timeString includes seconds (HH:MM:SS), remove the seconds
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Navigate to volunteer feedback
  const navigateToVolunteerFeedback = () => {
    navigate('/volunteer-feedback');
  };

  // Render historical access view
  const renderHistoricalView = () => {
    return (
      <div className="dashboard__historical-container">
        <div className="dashboard__historical-notice">
          <FaExclamationTriangle className="dashboard__notice-icon" />
          <div className="dashboard__notice-content">
            <h3>Historical Access Only</h3>
            <p>
              You have historical access only. You can view your past activities but cannot 
              participate in new sessions. Please visit the calendar to access your completed work.
            </p>
            <button 
              className="dashboard__calendar-btn"
              onClick={navigateToCalendar}
            >
              <FaCalendarAlt /> View Past Sessions
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render volunteer dashboard view
  const renderVolunteerView = () => {
    return (
      <div className="dashboard__volunteer-container">
        <div className="dashboard__volunteer-welcome">
          <h2>Welcome, Volunteer!</h2>
          <p>Thank you for volunteering with us. You can provide feedback on learner sessions below.</p>
          <button 
            className="dashboard__volunteer-feedback-btn"
            onClick={navigateToVolunteerFeedback}
          >
            <FaBook /> Go to Volunteer Feedback
          </button>
        </div>
      </div>
    );
  };

  // Render regular dashboard content
  const renderDashboardContent = () => {
<<<<<<< HEAD
    return (
      <>
=======
    // Format workshop start date for display (DATE ONLY - no time)
    const formatWorkshopDate = (dateString) => {
      const date = new Date(dateString);
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/New_York'
      };
      return date.toLocaleString('en-US', options);
    };
    
    return (
      <>
        {/* Workshop Preview Banner */}
        {workshopInfo?.isLocked && (
          <div className="dashboard__workshop-banner">
            <div className="workshop-banner__icon">⏰</div>
            <div className="workshop-banner__content">
              <h3>Workshop Preview Mode</h3>
              <p>
                You're viewing the workshop schedule. Full access begins on{' '}
                <strong>{formatWorkshopDate(workshopInfo.startDate)}</strong>
                {workshopInfo.daysUntilStart > 0 && (
                  <span> ({workshopInfo.daysUntilStart} {workshopInfo.daysUntilStart === 1 ? 'day' : 'days'} from now)</span>
                )}
              </p>
            </div>
          </div>
        )}
        
>>>>>>> dev
        <div className="dashboard__content">
          {/* Left panel - Objectives */}
          <div className="dashboard__left-panel">
            {/* Objectives */}
            <div className="dashboard__objectives">
              <h2 className="panel-title">Today's Objectives</h2>
              {objectives.length > 0 ? (
                <ul className="objectives-list">
                  {objectives.map((objective, index) => (
                    <li key={index} className="objective-item">
                      <span className="bullet">•</span>
                      <span className="objective-text">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-content-message">No objectives for today.</p>
              )}
            </div>
          </div>
          
          {/* Right panel - Daily Schedule */}
          <div className="dashboard__schedule-panel">
            <h2 className="panel-title">Daily Schedule Panel</h2>
            {dailyTasks.length > 0 ? (
              <div className="schedule-list">
                {dailyTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`schedule-item ${task.completed ? 'completed' : ''}`}
                    onClick={() => navigateToTask(task.id)}
                  >
                    <div className="schedule-time">{task.time}</div>
                    <div className="schedule-details">
                      <div className="schedule-title">
                        {getTaskIcon(task.type, task.completed)}
                        <span>{task.title}</span>
                      </div>
                      <div className="schedule-duration">{task.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tasks-message">
                <p>No tasks scheduled for today.</p>
                <p>Check back tomorrow for your next scheduled activities.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Continue Session Button */}
        <div className="dashboard__continue">
          <button 
            className="continue-btn"
            onClick={handleContinueSession}
            disabled={dailyTasks.length === 0}
          >
            Continue Session
            <FaArrowRight className="continue-icon" />
          </button>
        </div>
      </>
    );
  };

  if (isLoading) {
    return <div className="dashboard loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {error && <div className="error-message">{error}</div>}
        
        {/* Add cohort selector for staff/admin users */}
        {isActive && (user.role === 'staff' || user.role === 'admin') && (
          <div className="dashboard__cohort-selector">
            <label>View Cohort:</label>
            <select 
              value={cohortFilter || ''} 
              onChange={(e) => setCohortFilter(e.target.value || null)}
            >
              <option value="">My Cohort</option>
              <option value="March 2025">March 2025</option>
              <option value="June 2025">June 2025</option>
              {/* Add more cohorts as needed */}
            </select>
          </div>
        )}
      </div>
      
      {/* Conditionally render based on user status and role */}
      {!isActive ? renderHistoricalView() : 
       isVolunteer ? renderVolunteerView() : 
       renderDashboardContent()}
      
      {error && <div className="dashboard__error-message">{error}</div>}
    </div>
  );
}

export default Dashboard; 