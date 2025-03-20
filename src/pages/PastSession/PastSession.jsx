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
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isPastSession, setIsPastSession] = useState(true);

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
        
        // Look for task 703 specifically
        const task703 = data.find(task => task.id === 703 || task.task_id === 703);
        if (task703) {
          console.log('FOUND TASK 703:', task703);
          console.log('TASK 703 linked_resources:', task703.linked_resources);
          console.log('TASK 703 linked_resource:', task703.linked_resource);
          console.log('TASK 703 resources:', task703.resources);
        }
        
        // Process the tasks data
        if (data && Array.isArray(data)) {
          const formattedTasks = data.map(task => {
            // Determine which resources field to use and process it accordingly
            let taskResources = [];
            
            if (task.resources && Array.isArray(task.resources) && task.resources.length > 0) {
              taskResources = task.resources;
            } else if (task.linked_resources) {
              // Handle linked_resources field
              if (typeof task.linked_resources === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsed = JSON.parse(task.linked_resources);
                  taskResources = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                  // If not parseable JSON, assume it's a URL
                  taskResources = [{
                    title: 'Resource Link',
                    url: task.linked_resources,
                    type: 'link'
                  }];
                }
              } else if (typeof task.linked_resources === 'object') {
                // If it's already an object, use it directly
                taskResources = Array.isArray(task.linked_resources) ? 
                  task.linked_resources : [task.linked_resources];
              }
            } else if (task.linked_resource) {
              // Handle linked_resource field
              if (typeof task.linked_resource === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsed = JSON.parse(task.linked_resource);
                  taskResources = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                  // If not parseable JSON, assume it's a URL
                  taskResources = [{
                    title: 'Resource Link',
                    url: task.linked_resource,
                    type: 'link'
                  }];
                }
              } else if (typeof task.linked_resource === 'object') {
                // If it's already an object, use it directly
                taskResources = Array.isArray(task.linked_resource) ? 
                  task.linked_resource : [task.linked_resource];
              }
            }
            
            return {
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
              resources: taskResources
            };
          });
          
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
            // Handle resources and linked_resource fields
            let taskResources = [];
            
            if (task.resources && Array.isArray(task.resources) && task.resources.length > 0) {
              taskResources = task.resources;
            } else if (task.linked_resources) {
              // Handle linked_resources field
              if (typeof task.linked_resources === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsed = JSON.parse(task.linked_resources);
                  taskResources = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                  // If not parseable JSON, assume it's a URL
                  taskResources = [{
                    title: 'Resource Link',
                    url: task.linked_resources,
                    type: 'link'
                  }];
                }
              } else if (typeof task.linked_resources === 'object') {
                // If it's already an object, use it directly
                taskResources = Array.isArray(task.linked_resources) ? 
                  task.linked_resources : [task.linked_resources];
              }
            } else if (task.linked_resource) {
              // Handle linked_resource field
              if (typeof task.linked_resource === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsed = JSON.parse(task.linked_resource);
                  taskResources = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                  // If not parseable JSON, assume it's a URL
                  taskResources = [{
                    title: 'Resource Link',
                    url: task.linked_resource,
                    type: 'link'
                  }];
                }
              } else if (typeof task.linked_resource === 'object') {
                // If it's already an object, use it directly
                taskResources = Array.isArray(task.linked_resource) ? 
                  task.linked_resource : [task.linked_resource];
              }
            }
            
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
              resources: taskResources
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

  // Add a new useEffect to fetch messages when a task is selected
  useEffect(() => {
    const fetchTaskMessages = async () => {
      if (!tasks.length || currentTaskIndex >= tasks.length) return;
      
      const selectedTask = tasks[currentTaskIndex];
      if (!selectedTask?.id) return;
      
      const selectedTaskId = selectedTask.id;
      
      try {
        setMessagesLoading(true);
        console.log(`Fetching messages for task ID: ${selectedTaskId}`);
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${selectedTaskId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // No messages for this task yet, which is okay
            console.log('No messages found for this task');
            setMessages([]);
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Task messages data:', data);
        
        // Process and format the messages
        if (data && data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages.map(msg => {
            // Only include a timestamp if it's valid
            const timestamp = msg.timestamp ? new Date(msg.timestamp) : null;
            const formattedTimestamp = timestamp && !isNaN(timestamp) 
              ? timestamp.toLocaleTimeString() 
              : null;
              
            return {
              id: msg.message_id,
              role: msg.role,
              content: msg.content,
              timestamp: formattedTimestamp
            };
          }));
        } else if (data && Array.isArray(data)) {
          // Fallback for direct array response
          setMessages(data.map(msg => {
            // Only include a timestamp if it's valid
            const timestamp = msg.created_at ? new Date(msg.created_at) : null;
            const formattedTimestamp = timestamp && !isNaN(timestamp) 
              ? timestamp.toLocaleTimeString() 
              : null;
              
            return {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: formattedTimestamp
            };
          }));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching task messages:', error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };
    
    if (tasks.length > 0 && currentTaskIndex < tasks.length) {
      fetchTaskMessages();
    }
  }, [currentTaskIndex, token]);

  useEffect(() => {
    if (daySchedule && daySchedule.day && daySchedule.day.day_date) {
      // Compare the day's date to current date to determine if it's a past session
      const sessionDate = new Date(daySchedule.day.day_date);
      sessionDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      // Calculate the difference in days
      const timeDiff = sessionDate.getTime() - today.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);
      
      if (dayDiff < 0) {
        // Past session
        setIsPastSession(true);
      } else {
        // Today or future session
        setIsPastSession(false);
      }
    }
  }, [daySchedule]);

  // After the existing useEffects, add a new one to fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!tasks.length || currentTaskIndex >= tasks.length) return;
      
      const selectedTask = tasks[currentTaskIndex];
      if (!selectedTask?.id) return;
      
      const selectedTaskId = selectedTask.id;
      
      try {
        console.log(`Fetching detailed info for task ID: ${selectedTaskId}`);
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${selectedTaskId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch task details: ${response.status} ${response.statusText}`);
          return;
        }
        
        const taskData = await response.json();
        console.log('Task details API response:', taskData);
        
        // Check if the task has linked_resources or linked_resource
        if (taskData.linked_resources) {
          console.log('Found linked_resources in task details:', taskData.linked_resources);
          
          // Process linked_resources to usable format
          let resourceObj;
          
          if (typeof taskData.linked_resources === 'string') {
            try {
              // Try to parse if it's a JSON string
              resourceObj = JSON.parse(taskData.linked_resources);
              console.log('Successfully parsed linked_resources JSON:', resourceObj);
            } catch (e) {
              console.log('linked_resources is not valid JSON, treating as URL');
              
              // If it's a URL, create a simple resource object
              if (taskData.linked_resources.startsWith('http')) {
                resourceObj = {
                  title: 'Resource Link',
                  url: taskData.linked_resources,
                  type: 'link'
                };
              } else {
                // Try to extract a URL if present
                const urlMatch = taskData.linked_resources.match(/(https?:\/\/[^\s]+)/g);
                if (urlMatch && urlMatch.length > 0) {
                  resourceObj = {
                    title: 'Extracted Resource',
                    url: urlMatch[0],
                    type: 'link'
                  };
                }
              }
            }
          } else if (typeof taskData.linked_resources === 'object') {
            resourceObj = taskData.linked_resources;
          }
          
          if (resourceObj) {
            console.log('Processed resource object:', resourceObj);
            
            // Update the task with the linked_resources
            const updatedTasks = [...tasks];
            updatedTasks[currentTaskIndex] = {
              ...updatedTasks[currentTaskIndex],
              resources: Array.isArray(resourceObj) ? resourceObj : [resourceObj]
            };
            
            setTasks(updatedTasks);
          }
        } else if (taskData.linked_resource) {
          console.log('Found linked_resource in task details:', taskData.linked_resource);
          
          // Process linked_resource to usable format
          let resourceObj;
          
          if (typeof taskData.linked_resource === 'string') {
            try {
              // Try to parse if it's a JSON string
              resourceObj = JSON.parse(taskData.linked_resource);
              console.log('Successfully parsed linked_resource JSON:', resourceObj);
            } catch (e) {
              console.log('linked_resource is not valid JSON, treating as URL');
              
              // If it's a URL, create a simple resource object
              if (taskData.linked_resource.startsWith('http')) {
                resourceObj = {
                  title: 'Resource Link',
                  url: taskData.linked_resource,
                  type: 'link'
                };
              } else {
                // Try to extract a URL if present
                const urlMatch = taskData.linked_resource.match(/(https?:\/\/[^\s]+)/g);
                if (urlMatch && urlMatch.length > 0) {
                  resourceObj = {
                    title: 'Extracted Resource',
                    url: urlMatch[0],
                    type: 'link'
                  };
                }
              }
            }
          } else if (typeof taskData.linked_resource === 'object') {
            resourceObj = taskData.linked_resource;
          }
          
          if (resourceObj) {
            console.log('Processed resource object:', resourceObj);
            
            // Update the task with the linked_resource
            const updatedTasks = [...tasks];
            updatedTasks[currentTaskIndex] = {
              ...updatedTasks[currentTaskIndex],
              resources: Array.isArray(resourceObj) ? resourceObj : [resourceObj]
            };
            
            setTasks(updatedTasks);
          }
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };
    
    if (tasks.length > 0 && currentTaskIndex < tasks.length) {
      // Use a ref to track the last fetched task ID to avoid unnecessary refetches
      fetchTaskDetails();
    }
  }, [currentTaskIndex, token]);

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
    console.log('Attempting to render resources:', resources);
    
    if (!resources || resources.length === 0) {
      console.log('Resources array is empty or null');
      return null;
    }
    
    // Ensure resources are properly parsed
    const parsedResources = resources.map(resource => {
      console.log('Processing resource:', resource);
      
      if (typeof resource === 'string') {
        try {
          const parsed = JSON.parse(resource);
          console.log('Successfully parsed string resource:', parsed);
          return parsed;
        } catch (e) {
          console.error('Error parsing resource string:', e);
          // Try to handle it as a direct URL string
          if (resource.startsWith('http')) {
            console.log('Resource is a URL string:', resource);
            return {
              title: 'Resource Link',
              url: resource,
              type: 'link'
            };
          }
          return null;
        }
      }
      
      // If it's already an object, ensure it has required properties
      if (resource && typeof resource === 'object') {
        const processedResource = { ...resource };
        
        // Handle different property names
        if (!processedResource.url && processedResource.link) {
          processedResource.url = processedResource.link;
        }
        
        if (!processedResource.title && processedResource.name) {
          processedResource.title = processedResource.name;
        } else if (!processedResource.title) {
          processedResource.title = 'Resource';
        }
        
        if (!processedResource.type) {
          processedResource.type = 'link';
        }
        
        if (processedResource.url) {
          return processedResource;
        } else {
          console.log('Resource object missing URL:', resource);
          return null;
        }
      }
      
      return resource;
    }).filter(Boolean); // Remove any null resources
    
    console.log('Parsed resources after filtering:', parsedResources);
    
    if (parsedResources.length === 0) {
      console.log('No valid resources after parsing');
      return null;
    }
    
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
      <div className="past-session__task-resources">
        <h3>Resources</h3>
        {Object.entries(groupedResources).map(([type, typeResources]) => (
          <div key={type} className="past-session__resource-group">
            <ul>
              {typeResources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title || 'Resource Link'}
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

  // Add a format function for message content
  const formatMessageContent = (content) => {
    // Basic formatting for message content
    // You can enhance this with markdown parsing if needed
    return (
      <div className="past-session__message-text">
        {content.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
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
            <div className="past-session__date-display">
              <FaCalendarAlt /> {formattedDate}
            </div>
          </div>
          
          {day.daily_goal && (
            <div className="past-session__goal">
              <h2>Daily Goal</h2>
              <p>{day.daily_goal}</p>
            </div>
          )}
          
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
          
          <button 
            className="back-to-calendar-btn"
            onClick={handleBackToCalendar}
          >
            <FaArrowLeft /> Back to Calendar
          </button>
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
                
                {tasks[currentTaskIndex]?.blockTitle && (
                  <div className="past-session__block-title">
                    <p>Block: {tasks[currentTaskIndex].blockTitle}</p>
                  </div>
                )}
                
                {console.log('Current task:', tasks[currentTaskIndex])}
                {console.log('Current task ID:', tasks[currentTaskIndex]?.id)}
                {console.log('Current task resources:', tasks[currentTaskIndex]?.resources)}
                
                {tasks[currentTaskIndex]?.resources && tasks[currentTaskIndex].resources.length > 0 && (
                  <div className="past-session__task-resources-container">
                    {renderTaskResources(tasks[currentTaskIndex].resources)}
                  </div>
                )}
              </div>
            )}
            
            {/* Message display area - updated to show messages */}
            <div className="past-session__messages-container">
              {messagesLoading ? (
                <div className="past-session__loading-messages">
                  <p>Loading previous messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="learning__messages">
                  {messages.map(message => (
                    <div key={message.id} className={`learning__message learning__message--${message.role}`}>
                      <div className="learning__message-content">
                        {formatMessageContent(message.content)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="past-session__messages">
                  <div className="past-session__message-note">
                    <p>No previous messages available for this task.</p>
                  </div>
                </div>
              )}
              
              <div className="past-session__message-disclaimer">
                <p>{isPastSession 
                  ? "This is a past session. You cannot send new messages." 
                  : "This session is scheduled for today or in the future. You can send messages on the scheduled day."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PastSession; 