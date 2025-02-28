import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch current day's schedule and progress
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/current-day`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        if (data.message === 'No schedule for today') {
          // Handle case where there's no schedule for today
          setIsLoading(false);
          return;
        }
        
        // Process the data
        setCurrentDay(data.day);
        
        // Extract tasks from all time blocks
        const allTasks = [];
        const dayObjectives = [];
        
        data.timeBlocks.forEach(block => {
          // Add learning objectives from each block
          if (block.learning_objectives && block.learning_objectives.length > 0) {
            dayObjectives.push(...block.learning_objectives);
          }
          
          // Add tasks with their completion status
          block.tasks.forEach(task => {
            const taskProgress = data.taskProgress.find(
              progress => progress.task_id === task.task_id
            );
            
            allTasks.push({
              id: task.task_id,
              time: block.start_time,
              title: task.task_title,
              duration: `${task.duration_minutes} min`,
              type: task.task_type,
              completed: taskProgress ? taskProgress.status === 'completed' : false
            });
          });
        });
        
        setDailyTasks(allTasks);
        setObjectives(dayObjectives);
        
        // Set progress data
        const completed = allTasks.filter(task => task.completed).length;
        const total = allTasks.length;
        setCompletedTasks(completed);
        setTotalTasks(total);
        setProgressPercentage(total > 0 ? (completed / total) * 100 : 0);
        
        // Fetch notifications (agent interactions)
        const notificationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/interactions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(
            notificationsData.map(notification => notification.content)
          );
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Set some mock data for development purposes
        setDailyTasks([
          { 
            id: 1, 
            time: '1:00 PM', 
            title: 'Daily Standup', 
            duration: '15 min', 
            type: 'standup',
            completed: true 
          },
          { 
            id: 2, 
            time: '1:15 PM', 
            title: 'Group Discussion', 
            duration: '15 min', 
            type: 'group',
            completed: false 
          },
          { 
            id: 3, 
            time: '1:45 PM', 
            title: 'Individual Task', 
            duration: '30 min', 
            type: 'individual',
            completed: false 
          },
          { 
            id: 4, 
            time: '2:15 PM', 
            title: 'Reflection', 
            duration: '10 min', 
            type: 'reflection',
            completed: false 
          }
        ]);
        
        setObjectives([
          'Learn AI research strategies',
          'Practice critical thinking'
        ]);
        
        setNotifications([
          'Team assignment due today',
          'New feedback from mentor'
        ]);
        
        // Calculate progress from mock data
        const mockCompleted = 1;
        const mockTotal = 4;
        setCompletedTasks(mockCompleted);
        setTotalTasks(mockTotal);
        setProgressPercentage((mockCompleted / mockTotal) * 100);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  // Handle continue session button click
  const handleContinueSession = () => {
    // Navigate to the chat-based learning interface
    navigate('/learning');
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
  const handleTaskCompletion = async (taskId, currentStatus) => {
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

  if (isLoading) {
    return <div className="dashboard loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="dashboard__content">
        {/* Left panel - Daily Schedule */}
        <div className="dashboard__schedule-panel">
          <h2 className="panel-title">Daily Schedule Panel</h2>
          <div className="schedule-list">
            {dailyTasks.map(task => (
              <div 
                key={task.id} 
                className={`schedule-item ${task.completed ? 'completed' : ''}`}
                onClick={() => handleTaskCompletion(task.id, task.completed)}
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
        </div>
        
        {/* Right panel - Objectives, Progress, Notifications */}
        <div className="dashboard__info-panel">
          {/* Objectives */}
          <div className="dashboard__objectives">
            <h2 className="panel-title">Today's Objectives</h2>
            <ul className="objectives-list">
              {objectives.map((objective, index) => (
                <li key={index} className="objective-item">
                  <span className="bullet">•</span> {objective}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Progress */}
          <div className="dashboard__progress">
            <h2 className="panel-title">Progress</h2>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {completedTasks}/{totalTasks} tasks completed
            </div>
          </div>
          
          {/* Notifications */}
          <div className="dashboard__notifications">
            <h2 className="panel-title">Notifications</h2>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification-item">
                    {notification}
                  </div>
                ))
              ) : (
                <div className="notification-item empty">
                  No new notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Continue Session Button */}
      <div className="dashboard__continue">
        <button 
          className="continue-btn"
          onClick={handleContinueSession}
        >
          Continue Session
          <FaArrowRight className="continue-icon" />
        </button>
      </div>
    </div>
  );
}

export default Dashboard; 