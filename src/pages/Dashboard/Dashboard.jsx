import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaArrowRight } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  
  // Sample data - in a real app, this would come from an API
  const [dailyTasks] = useState([
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

  const [objectives] = useState([
    'Learn AI research strategies',
    'Practice critical thinking'
  ]);

  const [notifications] = useState([
    'Team assignment due today',
    'New feedback from mentor'
  ]);

  // Calculate progress
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  // Handle continue session button click
  const handleContinueSession = () => {
    // Navigate to the chat-based learning interface
    // For now, we'll navigate to the GPT page as a placeholder
    navigate('/learning');
  };

  // Helper function to render task icon based on type
  const getTaskIcon = (type, completed) => {
    if (completed) {
      return <FaCheckCircle className="task-icon completed" />;
    }
    
    switch (type) {
      case 'standup':
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

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Home Dashboard & Daily Roadmap</h1>
      </div>
      
      <div className="dashboard__content">
        {/* Left panel - Daily Schedule */}
        <div className="dashboard__schedule-panel">
          <h2 className="panel-title">Daily Schedule Panel</h2>
          <div className="schedule-list">
            {dailyTasks.map(task => (
              <div key={task.id} className={`schedule-item ${task.completed ? 'completed' : ''}`}>
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
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  {notification}
                </div>
              ))}
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