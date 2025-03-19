import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaBook, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './PastSession.css';

function PastSession() {
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [daySchedule, setDaySchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    const fetchDaySchedule = async () => {
      if (!dayId) {
        setError('No day ID provided');
        setIsLoading(false);
        return;
      }

      console.log('Fetching day schedule with dayId:', dayId);
      
      try {
        setIsLoading(true);
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/schedule`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch day schedule: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Day schedule data:', data);
        setDaySchedule(data);
        
        // We'll handle tasks in a separate useEffect
      } catch (error) {
        console.error('Error fetching day schedule:', error);
        setError('Failed to load the day schedule. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDaySchedule();
  }, [dayId, token]);

  // New useEffect to fetch tasks for the selected day
  useEffect(() => {
    const fetchDayTasks = async () => {
      if (!dayId) return;
      
      try {
        setTasksLoading(true);
        console.log('Fetching tasks for dayId:', dayId);
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/tasks`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch day tasks: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Day tasks data:', data);
        
        // Process the tasks data
        if (data && Array.isArray(data)) {
          const formattedTasks = data.map(task => ({
            id: task.id || task.task_id,
            title: task.title || task.task_title,
            description: task.description || task.task_description,
            type: task.type || task.task_type || 'individual',
            blockTime: task.blockTime || `${task.start_time ? new Date(task.start_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : ''} ${task.end_time ? '- ' + new Date(task.end_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}`,
            blockTitle: task.blockTitle || task.block_title || '',
            completed: task.completed || false,
            resources: task.resources || []
          }));
          
          setTasks(formattedTasks);
        } else {
          // If API returned non-array data, fall back to processing from timeBlocks
          processTasksFromTimeBlocks();
        }
      } catch (error) {
        console.error('Error fetching day tasks:', error);
        // If tasks API fails, process tasks from schedule as a fallback
        processTasksFromTimeBlocks();
      } finally {
        setTasksLoading(false);
      }
    };
    
    // Helper function to process tasks from timeBlocks
    const processTasksFromTimeBlocks = () => {
      if (!daySchedule || !daySchedule.timeBlocks) return;
      
      const allTasks = [];
      daySchedule.timeBlocks.forEach(block => {
        if (block.tasks && block.tasks.length > 0) {
          block.tasks.forEach(task => {
            allTasks.push({
              id: task.task_id,
              title: task.task_title,
              description: task.task_description,
              type: task.task_type || 'individual',
              blockTime: `${new Date(block.start_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })} - ${new Date(block.end_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}`,
              blockTitle: block.block_title,
              completed: false,
              resources: task.resources || []
            });
          });
        }
      });
      
      setTasks(allTasks);
    };
    
    if (daySchedule) {
      fetchDayTasks();
    }
  }, [dayId, token, daySchedule]);

  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  const getTaskIcon = (type, completed) => {
    if (completed) {
      return <FaCheckCircle className="task-icon completed" />;
    }
    
    switch (type) {
      case 'share':
      case 'discussion':
        return <FaCheckCircle className="task-icon share" />;
      case 'discuss':
      case 'group':
        return <FaUsers className="task-icon discuss" />;
      case 'reflect':
      case 'individual':
        return <FaBook className="task-icon reflect" />;
      default:
        return <FaCheckCircle className="task-icon" />;
    }
  };

  const renderTaskResources = (resources) => {
    if (!resources || resources.length === 0) return null;
    
    // Ensure resources are properly parsed
    const parsedResources = resources.map(resource => {
      if (typeof resource === 'string') {
        try {
          return JSON.parse(resource);
        } catch (e) {
          console.error('Error parsing resource:', e);
          return null;
        }
      }
      return resource;
    }).filter(Boolean); // Remove any null resources
    
    if (parsedResources.length === 0) return null;
    
    // Group resources by type
    const groupedResources = parsedResources.reduce((acc, resource) => {
      const type = resource.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(resource);
      return acc;
    }, {});
    
    return (
      <div className="learning__task-resources">
        <h3>Resources</h3>
        {Object.entries(groupedResources).map(([type, typeResources]) => (
          <div key={type} className="learning__resource-group">
            <ul>
              {typeResources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                  {resource.description && (
                    <p className="resource-description">{resource.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="learning">
        <div className="learning__content">
          <div className="learning__chat-container">
            <div className="learning__loading">
              <p>Loading session details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !daySchedule) {
    return (
      <div className="learning">
        <div className="learning__content">
          <div className="learning__chat-container">
            <div className="learning__error">
              <h2>Error</h2>
              <p>{error || 'Unable to load session details'}</p>
              <button onClick={handleBackToCalendar} className="learning__back-btn">
                Back to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { day } = daySchedule;
  const formattedDate = new Date(day.day_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="learning">
      <div className="learning__content">
        <div className="learning__task-panel">
          <div className="learning__task-header learning__task-header--with-back">
            <h2>Day {day.day_number} Tasks</h2>
            <button 
              className="back-to-calendar-btn"
              onClick={handleBackToCalendar}
            >
              <FaArrowLeft /> Back to Calendar
            </button>
          </div>
          
          <div className="past-session__date-display">
            <FaCalendarAlt /> {formattedDate}
          </div>
          
          {tasksLoading ? (
            <div className="learning__loading-tasks">
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="learning__tasks-list">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''} ${task.completed ? 'completed' : ''}`}
                  onClick={() => setCurrentTaskIndex(index)}
                >
                  <div className="learning__task-icon">
                    {getTaskIcon(task.type, task.completed)}
                  </div>
                  <div className="learning__task-content">
                    <h3 className="learning__task-title">{task.title}</h3>
                    <div className="learning__task-block">
                      {task.blockTime} - {task.blockTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="learning__no-tasks">
              <p>No tasks available for this day.</p>
              <button 
                className="past-session__back-to-calendar"
                onClick={handleBackToCalendar}
              >
                Check other days on the calendar
              </button>
            </div>
          )}
          
          {day.daily_goal && (
            <div className="past-session__goal">
              <h2>Daily Goal</h2>
              <p>{day.daily_goal}</p>
            </div>
          )}
        </div>
        
        <div className="learning__chat-container">
          <div className="learning__chat-panel">
            {tasksLoading ? (
              <div className="past-session__loading-details">
                <p>Loading task details...</p>
              </div>
            ) : tasks.length > 0 && (
              <div className="past-session__task-details">
                <h2>{tasks[currentTaskIndex]?.title}</h2>
                
                {tasks[currentTaskIndex]?.description && (
                  <div className="past-session__task-description">
                    <p>{tasks[currentTaskIndex].description}</p>
                  </div>
                )}
                
                {tasks[currentTaskIndex]?.resources && tasks[currentTaskIndex].resources.length > 0 && (
                  <div className="learning__task-resources-container">
                    {renderTaskResources(tasks[currentTaskIndex].resources)}
                  </div>
                )}
              </div>
            )}
            
            <div className="past-session__messages">
              <div className="past-session__message-note">
                <p>This is a past session. Messages are not available for past sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PastSession; 