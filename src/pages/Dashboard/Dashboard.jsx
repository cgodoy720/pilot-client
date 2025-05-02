import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaArrowRight, FaCheck, FaRegSquare } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [cohortFilter, setCohortFilter] = useState(null);

  useEffect(() => {
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
          throw new Error('Failed to fetch dashboard data');
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
        
        // Set progress data
        const completed = allTasks.filter(task => task.completed).length;
        const total = allTasks.length;
        setCompletedTasks(completed);
        setTotalTasks(total);
        setProgressPercentage(total > 0 ? (completed / total) * 100 : 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        console.log('Error details:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token, cohortFilter, user.role]);

  // Handle continue session button click
  const handleContinueSession = () => {
    // Add cohort parameter if staff/admin has selected a cohort
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `?cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    // Navigate to the chat-based learning interface
    navigate(`/learning${cohortParam}`);
  };

  // Navigate to the specific task in the Learning page
  const navigateToTask = (taskId) => {
    // Add cohort parameter if staff/admin has selected a cohort
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `&cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    navigate(`/learning?taskId=${taskId}${cohortParam}`);
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

  // Handle task completion toggle
  const handleTaskCompletion = async (e, taskId, currentStatus) => {
    e.stopPropagation(); // Prevent the click from navigating to the task
    
    try {
      const newStatus = currentStatus ? 'in_progress' : 'completed';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          user_notes: ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state
      setDailyTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
      
      // Update progress
      const newCompleted = currentStatus 
        ? completedTasks - 1 
        : completedTasks + 1;
      
      setCompletedTasks(newCompleted);
      setProgressPercentage((newCompleted / totalTasks) * 100);
      
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
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

  if (isLoading) {
    return <div className="dashboard loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {error && <div className="error-message">{error}</div>}
        
        {/* Add cohort selector for staff/admin users */}
        {(user.role === 'staff' || user.role === 'admin') && (
          <div className="dashboard__cohort-selector">
            <label>View Cohort:</label>
            <select 
              value={cohortFilter || ''} 
              onChange={(e) => setCohortFilter(e.target.value || null)}
            >
              <option value="">My Cohort</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
              {/* Add more cohorts as needed */}
            </select>
          </div>
        )}
      </div>
      
      <div className="dashboard__content">
        {/* Left panel - Objectives and Progress */}
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
          
          {/* Progress */}
          <div className="dashboard__progress">
            <h2 className="panel-title">Progress</h2>
            {totalTasks > 0 ? (
              <>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {completedTasks}/{totalTasks} tasks completed
                </div>
              </>
            ) : (
              <p className="no-content-message">No tasks scheduled for today.</p>
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
                  <div 
                    className="schedule-checkbox"
                    onClick={(e) => handleTaskCompletion(e, task.id, task.completed)}
                  >
                    {task.completed ? 
                      <FaCheck className="checkbox-icon completed" /> : 
                      <FaRegSquare className="checkbox-icon" />
                    }
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
    </div>
  );
}

export default Dashboard; 