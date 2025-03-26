import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaBook, FaArrowLeft, FaCalendarAlt, FaPaperPlane, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './PastSession.css';

function PastSession() {
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const dayNumber = searchParams.get('dayNumber');
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
  
  // Add new state variables for message input and sending
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Add state variables for message editing
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add new lazy loading and rate limiting states
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const [rateLimitHit, setRateLimitHit] = useState(false);
  
  // Add refs for scrolling and textarea handling
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  // After the existing useEffects, add a new one to fetch task details
  const fetchedTasksRef = useRef(new Set());
  const lastTaskIdRef = useRef(null);
  
  useEffect(() => {
    const fetchDaySchedule = async () => {
      // Check if we have either dayId or dayNumber
      if (!dayId && !dayNumber) {
        setError('No day identifier provided');
        setIsLoading(false);
        return;
      }

      console.log('Fetching day schedule with:', { dayId, dayNumber });
      
      try {
        setIsLoading(true);
        
        // Choose the appropriate API URL based on available parameters
        let apiUrl;
        if (dayNumber) {
          apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/number/${dayNumber}/full-details`;
          console.log('Using day_number API URL:', apiUrl);
        } else {
          apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/full-details`;
          console.log('Using day ID API URL:', apiUrl);
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch day details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Full day details data:', data);
        
        // Set day schedule data
        setDaySchedule(data);
        
        // Set tasks data directly from the response
        if (data.flattenedTasks && Array.isArray(data.flattenedTasks)) {
          console.log('Setting tasks from full-details response:', data.flattenedTasks.length);
          setTasks(data.flattenedTasks);
          setTasksLoading(false);
        } else {
          console.log('No flattened tasks found in response');
          // Fallback to processing from timeBlocks if needed
          processTasksFromTimeBlocks(data);
        }
      } catch (error) {
        console.error('Error fetching day details:', error);
        setError('Failed to load the day details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to process tasks from timeBlocks if needed
    const processTasksFromTimeBlocks = (data) => {
      if (!data || !data.timeBlocks) return;
      
      const allTasks = [];
      data.timeBlocks.forEach(block => {
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
            }
            
            allTasks.push({
              id: task.task_id || task.id,
              title: task.task_title || task.title,
              description: task.task_description || task.description,
              type: task.task_type || task.type || 'individual',
              blockTime: `${new Date(block.start_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })} - ${new Date(block.end_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}`,
              blockTitle: block.block_category || block.block_title || '',
              completed: false,
              resources: taskResources
            });
          });
        }
      });
      
      setTasks(allTasks);
      setTasksLoading(false);
    };

    fetchDaySchedule();
  }, [dayId, dayNumber, token]);

  // Add auto-scroll effect when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update existing useEffect for fetching task messages
  useEffect(() => {
    const fetchTaskMessages = async () => {
      if (!tasks.length || currentTaskIndex >= tasks.length) return;
      
      const selectedTask = tasks[currentTaskIndex];
      if (!selectedTask?.id) return;
      
      const selectedTaskId = selectedTask.id;

      // Skip refetching if we're already on this task
      if (lastTaskIdRef.current === selectedTaskId) {
        console.log('Already fetched messages for this task, skipping');
        return;
      }
      
      // Set loading state and update last task id
      setMessagesLoading(true);
      setRateLimitHit(false); // Reset any previous rate limit flag
      lastTaskIdRef.current = selectedTaskId;
      
      try {
        // Add lazy loading delay (mimic network latency)
        setIsLazyLoading(true);
        console.log('Starting lazy loading delay');
        await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
        setIsLazyLoading(false);
        
        console.log(`Fetching messages for task ID: ${selectedTaskId}`);
        
        // Add dayNumber parameter to the API request if available
        let apiUrl = `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${selectedTaskId}`;
        
        if (daySchedule && daySchedule.day && daySchedule.day.day_number) {
          apiUrl += `?dayNumber=${daySchedule.day.day_number}`;
          console.log(`Adding dayNumber ${daySchedule.day.day_number} to request`);
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log('Rate limit hit, suggesting a wait period');
            setRateLimitHit(true);
            throw new Error('Rate limit exceeded. Please wait before trying again.');
          } else if (response.status === 404) {
            // No messages for this task yet, which is okay
            console.log('No messages found for this task');
            setMessages([]);
            
            // Don't automatically start thread - user will need to click button
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Task messages data:', data);
        
        // Process and format the messages
        if (data && data.messages && Array.isArray(data.messages)) {
          // If we got an empty array of messages, don't automatically start the thread
          if (data.messages.length === 0) {
            console.log('Empty messages array received');
            setMessages([]);
            return;
          }
          
          setMessages(data.messages.map(msg => {
            // Only include a timestamp if it's valid
            const timestamp = msg.timestamp ? new Date(msg.timestamp) : null;
            const formattedTimestamp = timestamp && !isNaN(timestamp) 
              ? timestamp.toLocaleTimeString() 
              : null;
              
            return {
              id: msg.message_id,
              message_id: msg.message_id,
              role: msg.role,
              content: msg.content,
              timestamp: formattedTimestamp
            };
          }));
        } else if (data && Array.isArray(data)) {
          // Fallback for direct array response
          if (data.length === 0) {
            console.log('Empty direct array received');
            setMessages([]);
            return;
          }
          
          setMessages(data.map(msg => {
            // Only include a timestamp if it's valid
            const timestamp = msg.created_at ? new Date(msg.created_at) : null;
            const formattedTimestamp = timestamp && !isNaN(timestamp) 
              ? timestamp.toLocaleTimeString() 
              : null;
              
            return {
              id: msg.id,
              message_id: msg.id,
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
        if (!rateLimitHit) {
          setError('Failed to load messages. Please try again.');
        }
      } finally {
        setMessagesLoading(false);
      }
    };
    
    if (tasks.length > 0 && currentTaskIndex < tasks.length) {
      fetchTaskMessages();
    }
  }, [currentTaskIndex, token, tasks, daySchedule, dayNumber, isPastSession]); // rateLimitHit removed to prevent recalling on rate limit

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
      // This function can be simplified now but kept for edge cases
      if (!tasks.length || currentTaskIndex >= tasks.length) return;
      
      const selectedTask = tasks[currentTaskIndex];
      if (!selectedTask?.id) return;
      
      const taskId = selectedTask.id;
      
      // Skip if we've already fetched details for this task or if it already has resources
      if (fetchedTasksRef.current.has(taskId) || 
          (selectedTask.resources && selectedTask.resources.length > 0)) {
        console.log('Task already processed, skipping details fetch');
        return;
      }
      
      // Mark this task as fetched to prevent repeated fetches
      fetchedTasksRef.current.add(taskId);
      
      try {
        console.log(`Fetching detailed info for task ID: ${taskId}`);
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${taskId}`;
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
        
        // Check if the task has linked_resources
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
            setTasks(prevTasks => {
              // Find the current index of the task (may have changed since fetch started)
              const taskIndex = prevTasks.findIndex(t => t.id === taskId);
              if (taskIndex === -1) return prevTasks;
              
              const updatedTasks = [...prevTasks];
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                resources: Array.isArray(resourceObj) ? resourceObj : [resourceObj]
              };
              
              return updatedTasks;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };
    
    if (tasks.length > 0 && currentTaskIndex < tasks.length) {
      fetchTaskDetails();
    }
  }, [currentTaskIndex, token]); // Remove tasks from dependency array

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
        <h3>Learning Resources</h3>
        {Object.entries(groupedResources).map(([type, typeResources]) => (
          <div key={type} className="past-session__resource-group">
            <ul>
              {typeResources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title || 'Resource Link'}
                  </a>
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

  // Add function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    // Prevent double-clicks
    setIsSending(true);
    
    // Store the message locally for optimistic UI update
    const messageToSend = newMessage.trim();
    
    // Clear the input
    setNewMessage('');
    
    // Resize the textarea back to its original size
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Create a temporary ID for this message
    const temporaryId = `temp-${Date.now()}`;
    
    // Optimistically add message to the UI
    setMessages(prevMessages => [
      ...prevMessages.filter(msg => msg.id !== 'loading'),
      {
        id: temporaryId,
        content: messageToSend,
        role: 'user',
        isTemporary: true
      }
    ]);
    
    // Show the AI thinking indicator
    setIsAiThinking(true);
    
    try {
      // Get the current task ID
      const currentTaskId = tasks[currentTaskIndex]?.id;
      
      // Get day number from the day schedule
      const currentDayNumber = daySchedule?.day?.day_number || dayNumber;
      
      // Prepare request body
      const requestBody = {
        content: messageToSend,
        taskId: currentTaskId
      };
      
      if (currentDayNumber) {
        requestBody.dayNumber = currentDayNumber;
      }
      
      // Determine if this is a new conversation or continuing an existing one
      const endpoint = messages.length === 0 
        ? 'messages/start' 
        : 'messages/continue';
      
      // Send message to learning API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      // Get AI response
      const aiResponseData = await response.json();
      
      // Extract the user message ID from the response if available
      const userMessageId = aiResponseData.user_message_id;
      
      // If the server returned the user message ID, update our state to use it
      if (userMessageId) {
        console.log(`User message ID from server: ${userMessageId}, replacing temporary ID: ${temporaryId}`);
        // Update the user message with the real server ID
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === temporaryId ? 
              { ...msg, id: userMessageId, message_id: userMessageId } : 
              msg
          )
        );
      }
      
      // Add AI response
      const aiResponse = {
        id: aiResponseData.message_id,
        message_id: aiResponseData.message_id,
        content: aiResponseData.content,
        role: aiResponseData.role,
        timestamp: aiResponseData.timestamp
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      
    } catch (err) {
      console.error('Error sending/receiving message:', err);
      setError('Failed to communicate with the learning assistant. Please try again.');
      
      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== temporaryId));
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };

  // Handle text input changes for the message input
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle starting to edit a message
  const handleEditMessage = (message) => {
    // Check if message has an actual server-assigned ID
    const messageId = message.message_id || message.id;
    
    // Ensure ID is treated as a string
    setEditingMessageId(String(messageId));
    setEditMessageContent(message.content);
    
    // Focus the textarea after it's rendered
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus();
        
        // Auto-resize the textarea
        editTextareaRef.current.style.height = 'auto';
        editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  // Handle updating a message
  const handleUpdateMessage = async (messageId) => {
    if (!editMessageContent.trim() || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Ensure messageId is treated as a string for comparisons
      const messageIdStr = String(messageId);
      
      // Send update request to API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editMessageContent.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update message: ${response.status}`);
      }
      
      const updatedMessage = await response.json();
      
      // Update the message in the UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          String(msg.id) === messageIdStr ? 
            {
              ...msg, 
              id: updatedMessage.message_id, // Use the server's ID
              message_id: updatedMessage.message_id, // Store both versions for consistency
              content: updatedMessage.content, 
              updated: true
            } : 
            msg
        )
      );
      
      // Reset edit state
      setEditingMessageId(null);
      setEditMessageContent('');
      
    } catch (err) {
      console.error('Error updating message:', err);
      setError(`Failed to update message: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle canceling an edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageContent('');
  };
  
  // Handle edit textarea auto-resize
  const handleEditTextareaChange = (e) => {
    setEditMessageContent(e.target.value);
    
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  };

  // Update startTaskThread to include lazy loading delay
  const startTaskThread = async (taskId) => {
    try {
      setIsAiThinking(true);
      setRateLimitHit(false);
      
      // Add lazy loading delay
      setIsLazyLoading(true);
      console.log('Starting lazy loading delay before thread start');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      setIsLazyLoading(false);
      
      const currentDayNumber = daySchedule?.day?.day_number || dayNumber;
      
      // Prepare the request
      const requestBody = {
        taskId: taskId
      };
      
      if (currentDayNumber) {
        requestBody.dayNumber = currentDayNumber;
      }
      
      // Call the start endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limit hit when starting thread');
          setRateLimitHit(true);
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
        throw new Error(`Failed to start thread: ${response.status}`);
      }
      
      // Get the initial message
      const data = await response.json();
      console.log('Thread started, received initial message:', data);
      
      // Add the assistant message to the state
      setMessages([{
        id: data.message_id,
        message_id: data.message_id,
        content: data.content,
        role: data.role,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error starting task thread:', error);
      if (!rateLimitHit) {
        setError('Failed to start conversation. Please try again.');
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  // Add a retry handler function
  const handleRetry = async () => {
    setError(null);
    setRateLimitHit(false);
    
    // Add a delay before retrying
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    if (tasks.length > 0) {
      await startTaskThread(tasks[currentTaskIndex].id);
    }
  };

  if (isLoading) {
    return (
      <div className="learning past-session">
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
      <div className="learning past-session">
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

  // Force the date to be interpreted in UTC to match what's in the database
  const formattedDate = new Date(day.day_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // This is the key - interpret the date in UTC
  });

  return (
    <div className="learning past-session">
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
            ) : tasks.length > 0 && tasks[currentTaskIndex]?.resources && tasks[currentTaskIndex].resources.length > 0 ? (
              <div className="past-session__task-resources-container">
                {renderTaskResources(tasks[currentTaskIndex].resources)}
              </div>
            ) : tasks.length > 0 ? (
              <div className="past-session__no-resources">
                <p>No resources available for this task.</p>
              </div>
            ) : null}
            
            {/* Message display area - updated to show messages */}
            <div className="past-session__messages-container">
              {messagesLoading || isLazyLoading ? (
                <div className="past-session__loading-messages">
                  <p>
                    {isLazyLoading ? 'Preparing to load messages...' : 'Loading previous messages...'}
                  </p>
                </div>
              ) : (
                <div className={`learning__messages ${messagesLoading ? 'loading' : ''} ${editingMessageId !== null ? 'has-editing-message' : ''}`}>
                  {messages.length > 0 ? (
                    messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`learning__message learning__message--${message.role} ${String(editingMessageId) === String(message.id) ? 'editing' : ''}`}
                      >
                        <div 
                          className={`learning__message-content ${message.role === 'user' && isPastSession ? 'learning__message-content--editable' : ''}`}
                          onClick={message.role === 'user' && editingMessageId === null && isPastSession ? () => handleEditMessage(message) : undefined}
                        >
                          {String(editingMessageId) === String(message.id) ? (
                            <div className="learning__message-edit">
                              <textarea
                                ref={editTextareaRef}
                                value={editMessageContent}
                                onChange={handleEditTextareaChange}
                                className="learning__edit-textarea"
                                disabled={isUpdating}
                                placeholder="Edit your message..."
                              />
                              <div className="learning__edit-actions">
                                <button 
                                  onClick={() => handleUpdateMessage(message.id)}
                                  className="learning__edit-save-btn"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? 'Saving...' : <FaCheck />}
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="learning__edit-cancel-btn"
                                  disabled={isUpdating}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {formatMessageContent(message.content)}
                              {message.updated && (
                                <span className="learning__message-edited-indicator">(edited)</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : isAiThinking ? (
                    <div className="past-session__loading-messages">
                      <p>Starting conversation for this task...</p>
                    </div>
                  ) : (
                    <div className="past-session__message-note">
                      {rateLimitHit ? (
                        <div className="past-session__error-note">
                          <p>The server is busy at the moment. Please wait a moment before trying again.</p>
                          <button 
                            onClick={handleRetry}
                            className="past-session__retry-btn"
                            disabled={isLazyLoading}
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <>
                          <p>No previous messages available for this task.</p>
                          {isPastSession && (
                            <button 
                              onClick={() => tasks.length > 0 && startTaskThread(tasks[currentTaskIndex].id)}
                              className="past-session__start-conversation-btn"
                              disabled={!tasks.length || tasksLoading || isLazyLoading}
                            >
                              {isLazyLoading ? 'Preparing...' : 'Start Conversation'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {isAiThinking && (
                    <div className="learning__message learning__message--assistant">
                      <div className="learning__message-content learning__message-content--thinking">
                        <div className="learning__typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
              
              {/* Message input area for past sessions */}
              {isPastSession ? (
                messages.length > 0 ? (
                  <form className="learning__input-form" onSubmit={handleSendMessage}>
                    <textarea
                      ref={textareaRef}
                      className="learning__input"
                      value={newMessage}
                      onChange={handleTextareaChange}
                      placeholder={isSending ? "Sending..." : "Type your message..."}
                      disabled={isSending || isAiThinking}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      rows={1}
                    />
                    <button 
                      className="learning__send-btn" 
                      type="submit" 
                      disabled={!newMessage.trim() || isSending || isAiThinking}
                    >
                      {isSending ? "Sending..." : <FaPaperPlane />}
                    </button>
                  </form>
                ) : (
                  <div className="past-session__message-input-placeholder">
                    <p>Start a conversation to interact with this task</p>
                  </div>
                )
              ) : (
                <div className="past-session__message-disclaimer">
                  <p>This session is scheduled for the future. You can send messages on the scheduled day.</p>
                </div>
              )}
              
              {error && !rateLimitHit && <div className="learning__error">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PastSession; 