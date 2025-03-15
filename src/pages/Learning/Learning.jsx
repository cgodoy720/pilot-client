import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './Learning.css';

function Learning() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  
  // Current day and task data
  const [currentDay, setCurrentDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  
  // Get dayId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const dayId = queryParams.get('dayId');
  const taskId = queryParams.get('taskId');
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Add a debounce mechanism to prevent multiple calls
  const fetchingTasks = {};
  
  // Add state for the submission modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  
  // Helper function to format time
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
  
  // Fetch messages for the current task
  const fetchTaskMessages = async (taskId, retryCount = 0) => {
    // Prevent multiple fetches for the same task within a short time period
    const now = Date.now();
    if (fetchingTasks[taskId] && now - fetchingTasks[taskId] < 2000) {
      console.log(`Skipping duplicate fetch for task ${taskId} - already fetching`);
      return;
    }
    
    // Mark this task as being fetched
    fetchingTasks[taskId] = now;
    
    // Add a timestamp to prevent duplicate calls
    const fetchTimestamp = now;
    fetchTaskMessages.lastFetchTimestamp = fetchTimestamp;
    
    try {
      // Clear any previous error
      setError('');
      
      // Show loading state
      setIsMessagesLoading(true);
      
      // Show a loading message with the current task title instead of clearing messages first
      const currentTask = tasks.find(task => task.id === taskId);
      if (currentTask) {
        setMessages([{
          id: 'loading',
          content: `Loading ${currentTask.title}...`,
          role: 'system'
        }]);
      }
      
      console.log(`Fetching messages for task ${taskId} at timestamp ${fetchTimestamp}`);
      
      // First, try to get existing messages
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if this is still the most recent fetch
      if (fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp) {
        console.log(`Aborting fetch for task ${taskId} - newer fetch in progress`);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.messages.length} messages for task ${taskId}`);
      
      
      // Check if this is still the most recent fetch
      if (fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp) {
        console.log(`Aborting fetch for task ${taskId} - newer fetch in progress`);
        return;
      }
      
      if (data.messages && data.messages.length > 0) {
        // We have existing messages, format and display them
        const formattedMessages = data.messages.map(msg => ({
          id: msg.message_id,
          content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content,
          role: msg.role,
          timestamp: msg.timestamp
        }));
        
        // Final client-side deduplication check
        const uniqueMessages = [];
        const seenContents = new Set();
        
        for (const message of formattedMessages) {
          // Create a simple hash of the message content
          const contentHash = message.content.substring(0, 100);
          
          // If we've seen this content before, skip it
          if (seenContents.has(contentHash)) {
            console.log(`Skipping duplicate message with content: ${contentHash}...`);
            continue;
          }
          
          // Skip system metadata objects that shouldn't be displayed
          if (typeof message.content === 'string' && 
              (message.content.includes('"conversation_started":') || 
               message.content.includes('"last_message_timestamp":') ||
               message.content.includes('"topics_discussed":'))) {
            console.log('Skipping system metadata object');
            continue;
          }
          
          // Otherwise, add it to our unique list
          seenContents.add(contentHash);
          uniqueMessages.push(message);
        }
        
        console.log(`Deduplication: ${formattedMessages.length} messages reduced to ${uniqueMessages.length}`);
        
        setMessages(uniqueMessages);
        console.log(`Displayed ${uniqueMessages.length} existing messages`);
      } else {
        // No existing messages, send initial 'start' message
        console.log(`No existing messages found, sending initial 'start' message`);
        
        // Prepare message content based on whether the task has resources
        const currentTask = tasks.find(task => task.id === taskId);
        let messageContent = 'start';
        
        try {
          // Send the initial message
          const messageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              taskId: taskId
            })
          });
          
          // Check if this is still the most recent fetch
          if (fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp) {
            console.log(`Aborting fetch for task ${taskId} - newer fetch in progress`);
            return;
          }
          
          // Handle 429 Too Many Requests with retry
          if (messageResponse.status === 429) {
            const data = await messageResponse.json();
            const retryAfter = data.retryAfter || (Math.pow(2, retryCount) * 1000); // Exponential backoff
            
            if (retryCount < 3) { // Limit to 3 retries
              console.log(`Rate limited, retrying after ${retryAfter}ms (retry ${retryCount + 1}/3)`);
              
              // Show a temporary message
              setMessages([{
                id: 'retry',
                content: `Loading task content, please wait...`,
                role: 'system'
              }]);
              
              // Wait and retry
              setTimeout(() => {
                fetchTaskMessages(taskId, retryCount + 1);
              }, retryAfter);
              return;
            }
          }
          
          if (!messageResponse.ok) {
            throw new Error(`Failed to send initial message: ${messageResponse.status}`);
          }
          
          const messageData = await messageResponse.json();
          
          // Check if the message is a system metadata object that shouldn't be displayed
          const messageContent = typeof messageData.content === 'object' ? 
            JSON.stringify(messageData.content) : messageData.content;
          
          if (typeof messageContent === 'string' && 
              (messageContent.includes('"conversation_started":') || 
               messageContent.includes('"last_message_timestamp":') ||
               messageContent.includes('"topics_discussed":'))) {
            console.log('Skipping system metadata object in initial message');
            setMessages([{
              id: 'system',
              content: 'Starting conversation...',
              role: 'system'
            }]);
          } else {
            // Display the assistant's response
            setMessages([{
              id: messageData.message_id,
              content: messageContent,
              role: messageData.role,
              timestamp: messageData.timestamp
            }]);
          }
          
          console.log(`Displayed initial assistant message`);
        } catch (error) {
          // If we get an error sending the initial message, try to handle it gracefully
          console.error('Error sending initial message:', error);
          
          // If we're still the most recent fetch, show an error
          if (fetchTaskMessages.lastFetchTimestamp === fetchTimestamp) {
            setError(`Failed to start conversation: ${error.message}. Please try refreshing the page.`);
            setMessages([{
              id: 'error',
              content: `Error starting conversation: ${error.message}. Please try refreshing the page.`,
              role: 'system'
            }]);
          }
        }
      }
    } catch (error) {
      // Check if this is still the most recent fetch
      if (fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp) {
        console.log(`Aborting error handling for task ${taskId} - newer fetch in progress`);
        return;
      }
      
      console.error('Error fetching task messages:', error);
      setError(`Failed to load messages: ${error.message}`);
      
      // Display a fallback message
      setMessages([{
        id: 'error',
        content: `Error loading task: ${error.message}. Please try refreshing the page.`,
        role: 'system'
      }]);
    } finally {
      // Only update loading state if this is still the most recent fetch
      if (fetchTaskMessages.lastFetchTimestamp === fetchTimestamp) {
        // Always set loading to false when done
        setIsMessagesLoading(false);
      }
      
      // Clear the fetching flag after a delay to prevent immediate re-fetching
      setTimeout(() => {
        delete fetchingTasks[taskId];
      }, 2000);
    }
  };
  
  // Fetch current day data and tasks
  useEffect(() => {
    const fetchCurrentDayData = async () => {
      setIsPageLoading(true);
      setError('');
      
      try {
        let url;
        
        // If dayId is provided, fetch that specific day
        if (dayId) {
          url = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/schedule`;
        } else {
          // Otherwise fetch the current day
          url = `${import.meta.env.VITE_API_URL}/api/progress/current-day`;
        }
        
        // Fetch day's schedule and progress
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch learning data');
        }
        
        const data = await response.json();
        
        console.log('Learning API Response Data:', JSON.stringify(data, null, 2));
        
        if (data.message === 'No schedule for today') {
          setError('No learning schedule available for today.');
          setIsPageLoading(false);
          return;
        }
        
        // Process the data
        const dayData = data.day;
        
        // Extract tasks from all time blocks
        const allTasks = [];
        
        // Handle different response formats based on the endpoint
        const timeBlocks = dayId ? data.timeBlocks : data.timeBlocks;
        const taskProgress = dayId ? [] : data.taskProgress; // We might not have progress for historical days
        
        timeBlocks.forEach(block => {
          // Add tasks with their completion status
          block.tasks.forEach(task => {
            const taskProgressItem = Array.isArray(taskProgress) ? 
              taskProgress.find(progress => progress.task_id === task.id) : null;
            
            // Parse linked_resources if it's a string
            let resources = [];
            if (task.linked_resources) {
              try {
                // If it's a string, try to parse it
                if (typeof task.linked_resources === 'string') {
                  resources = JSON.parse(task.linked_resources);
                } 
                // If it's already an array, use it directly
                else if (Array.isArray(task.linked_resources)) {
                  resources = task.linked_resources;
                }
                // If it's a JSONB object from PostgreSQL, it might already be parsed
                else {
                  resources = task.linked_resources;
                }
              } catch (e) {
                console.error('Error parsing linked_resources:', e);
                resources = [];
              }
            }
            
            allTasks.push({
              id: task.id,
              title: task.task_title,
              description: task.task_description,
              type: task.task_type,
              blockTitle: task.task_title,
              blockTime: formatTime(block.start_time),
              completed: taskProgressItem ? taskProgressItem.status === 'completed' : false,
              resources: resources,
              deliverable: task.deliverable,
              deliverable_type: task.deliverable_type || 'none'
            });
          });
        });
        
        // If a specific taskId is provided in the URL, find its index
        let initialTaskIndex = 0;
        if (taskId) {
          const taskIndex = allTasks.findIndex(task => task.id === parseInt(taskId));
          if (taskIndex >= 0) {
            initialTaskIndex = taskIndex;
          }
        } else {
          // Otherwise, find the first incomplete task to start with
          const firstIncompleteIndex = allTasks.findIndex(task => !task.completed);
          initialTaskIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
        }
        
        // Batch update state to reduce renders
        setCurrentDay(dayData);
        setTasks(allTasks);
        setCurrentTaskIndex(initialTaskIndex);
        
        // Fetch messages for the initial task
        if (allTasks.length > 0) {
          const initialTaskId = allTasks[initialTaskIndex].id;
          await fetchTaskMessages(initialTaskId);
        }
        
      } catch (err) {
        console.error('Error fetching learning data:', err);
        setError('Failed to load learning data. Please try again later.');
        
        // Set some mock data for development
        const mockTasks = [
          { 
            id: 1, 
            title: 'LAUNCH', 
            description: 'Welcome to the program',
            completed: false,
            type: 'individual',
            blockTitle: 'LAUNCH',
            blockTime: '1:00 PM',
            deliverable: null,
            deliverable_type: 'none'
          },
          { 
            id: 2, 
            title: 'Daily Standup', 
            description: 'Complete the daily standup prompt',
            completed: false,
            type: 'individual',
            blockTitle: 'Daily Standup',
            blockTime: '1:15 PM',
            deliverable: 'Completed Daily Standup prompt',
            deliverable_type: 'none'
          },
          { 
            id: 3, 
            title: 'Personal Learning Plan', 
            description: 'Create a personalized learning plan',
            completed: false,
            type: 'individual',
            blockTitle: 'Personal Learning Plan',
            blockTime: '1:45 PM',
            deliverable: 'Learning plan following the template format',
            deliverable_type: 'link'
          }
        ];
        
        // Batch update state to reduce renders
        setTasks(mockTasks);
        setCurrentTaskIndex(0);
        
        // Set initial message based on the mock current task
        setMessages([
          {
            id: 1,
            role: 'assistant',
            content: `Let's work on: **${mockTasks[0].title}**\n\n${mockTasks[0].description}`
          }
        ]);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    fetchCurrentDayData();
  }, [token]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    const messageToSend = newMessage;
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    setIsAiThinking(true);
    
    try {
      // Get the current task ID
      const currentTaskId = tasks[currentTaskIndex]?.id;
      
      // Send message to learning API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageToSend,
          taskId: currentTaskId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Get AI response
      const aiResponseData = await response.json();
      
      // Regular AI response
      let aiResponse;
      
      if (aiResponseData && aiResponseData.content) {
        // Use the actual AI response from the API
        aiResponse = {
          id: aiResponseData.message_id || Date.now() + 1,
          role: 'assistant',
          content: typeof aiResponseData.content === 'object' ? JSON.stringify(aiResponseData.content) : aiResponseData.content,
          timestamp: aiResponseData.timestamp || new Date().toISOString()
        };
      } else {
        // Fallback response if API doesn't return expected format
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm processing your message. Could you provide more details or clarify your thoughts?",
          timestamp: new Date().toISOString()
        };
      }
      
      // Apply deduplication before adding the new message
      setMessages(prevMessages => {
        // Create a new array with all previous messages
        const updatedMessages = [...prevMessages];
        
        // Check if this message is a duplicate
        const contentHash = aiResponse.content.substring(0, 100);
        const isDuplicate = updatedMessages.some(msg => 
          msg.role === 'assistant' && msg.content.substring(0, 100) === contentHash
        );
        
        if (isDuplicate) {
          console.log('Skipping duplicate AI response');
          return updatedMessages;
        }
        
        // Skip system metadata objects that shouldn't be displayed
        if (typeof aiResponse.content === 'string' && 
            (aiResponse.content.includes('"conversation_started":') || 
             aiResponse.content.includes('"last_message_timestamp":') ||
             aiResponse.content.includes('"topics_discussed":'))) {
          console.log('Skipping system metadata object in AI response');
          return updatedMessages;
        }
        
        // Add the new message
        return [...updatedMessages, aiResponse];
      });
    } catch (err) {
      console.error('Error sending/receiving message:', err);
      setError('Failed to communicate with the learning assistant. Please try again.');
      
      // Fallback AI response for development
      // Regular AI response based on current task
      const responseOptions = [
        "That's a great example! Could you tell me more about specific features you found helpful?",
        "Interesting perspective! How do you think this compares to traditional learning methods?",
        "Thank you for sharing your experience! Your insights will help us design better learning experiences."
      ];
      
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseOptions[Math.min(messages.length - 1, responseOptions.length - 1)],
        timestamp: new Date().toISOString()
      };
      
      // Apply deduplication before adding the new message
      setMessages(prevMessages => {
        // Create a new array with all previous messages
        const updatedMessages = [...prevMessages];
        
        // Check if this message is a duplicate
        const contentHash = aiResponse.content.substring(0, 100);
        const isDuplicate = updatedMessages.some(msg => 
          msg.role === 'assistant' && msg.content.substring(0, 100) === contentHash
        );
        
        if (isDuplicate) {
          console.log('Skipping duplicate AI response');
          return updatedMessages;
        }
        
        // Skip system metadata objects that shouldn't be displayed
        if (typeof aiResponse.content === 'string' && 
            (aiResponse.content.includes('"conversation_started":') || 
             aiResponse.content.includes('"last_message_timestamp":') ||
             aiResponse.content.includes('"topics_discussed":'))) {
          console.log('Skipping system metadata object in AI response');
          return updatedMessages;
        }
        
        // Add the new message
        return [...updatedMessages, aiResponse];
      });
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };
  
  // Mark a task as completed
  const markTaskAsCompleted = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/complete-task/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Automatically transition to the next task if available
      const nextTaskIndex = currentTaskIndex + 1;
      if (nextTaskIndex < tasks.length) {
        // Add a transition message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(),
            role: 'assistant',
            content: "Great job completing this task! Let's move on to the next one.",
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Wait a moment before transitioning
        setTimeout(() => {
          setCurrentTaskIndex(nextTaskIndex);
          fetchTaskMessages(tasks[nextTaskIndex].id);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error marking task as completed:', err);
      // Still update the UI even if the API call fails
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    }
  };
  
  // Handle quick reply
  const handleQuickReply = (reply) => {
    if (isSending) return;
    
    setNewMessage(reply);
    // Optional: automatically send the quick reply
    // setTimeout(() => {
    //   handleSendMessage({ preventDefault: () => {} });
    // }, 500);
  };
  
  // Helper function to get task icon based on type
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
  
  // Add this function to render resources
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
            {/* <h4>{type.charAt(0).toUpperCase() + type.slice(1)}s</h4> */}
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
  
  // Update the formatMessageContent function to NOT include resources for every message
  const formatMessageContent = (content) => {
    if (!content) return null;
    
    // Check if content is an object and not a string
    if (typeof content === 'object') {
      // Convert the object to a readable string format
      try {
        return <pre className="system-message">System message: {JSON.stringify(content, null, 2)}</pre>;
      } catch (e) {
        console.error('Error stringifying content object:', e);
        return <p className="error-message">Error displaying message content</p>;
      }
    }
    
    // Split content by code blocks to handle them separately
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is a code block
          if (part.startsWith('```') && part.endsWith('```')) {
            // Extract language and code
            const match = part.match(/```(\w*)\n([\s\S]*?)```/);
            
            if (match) {
              const [, language, code] = match;
              
              return (
                <div key={index} className="code-block-wrapper">
                  <div className="code-block-header">
                    {language && <span className="code-language">{language}</span>}
                  </div>
                  <pre className="code-block">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
          }
          
          // Regular markdown for non-code parts
          return (
            <ReactMarkdown key={index}
              components={{
                p: ({node, children, ...props}) => (
                  <p className="markdown-paragraph" {...props}>{children}</p>
                ),
                h1: ({node, children, ...props}) => (
                  <h1 className="markdown-heading" {...props}>{children}</h1>
                ),
                h2: ({node, children, ...props}) => (
                  <h2 className="markdown-heading" {...props}>{children}</h2>
                ),
                h3: ({node, children, ...props}) => (
                  <h3 className="markdown-heading" {...props}>{children}</h3>
                ),
                ul: ({node, children, ...props}) => (
                  <ul className="markdown-list" {...props}>{children}</ul>
                ),
                ol: ({node, children, ...props}) => (
                  <ol className="markdown-list" {...props}>{children}</ol>
                ),
                li: ({node, children, ...props}) => (
                  <li className="markdown-list-item" {...props}>{children}</li>
                ),
                a: ({node, children, ...props}) => (
                  <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                ),
                strong: ({node, children, ...props}) => (
                  <strong {...props}>{children}</strong>
                ),
                em: ({node, children, ...props}) => (
                  <em {...props}>{children}</em>
                ),
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
                    return <code className="inline-code" {...props}>{children}</code>;
                  }
                  return <code {...props}>{children}</code>;
                }
              }}
            >
              {part}
            </ReactMarkdown>
          );
        })}
      </>
    );
  };

  // Handle textarea auto-resize
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Add this function to handle task navigation
  const navigateToTask = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentTaskIndex + 1, tasks.length - 1)
      : Math.max(currentTaskIndex - 1, 0);
      
    if (newIndex !== currentTaskIndex) {
      // Set loading state first to prevent flashing
      setIsMessagesLoading(true);
      
      // Update the current task index
      setCurrentTaskIndex(newIndex);
      
      // Update the URL to reflect the current task
      const newTaskId = tasks[newIndex].id;
      
      // Preserve the dayId parameter if it exists
      const params = new URLSearchParams(location.search);
      params.set('taskId', newTaskId);
      
      // Update the URL without reloading the page
      navigate(`/learning?${params.toString()}`, { replace: true });
      
      // Then fetch the messages for the new task
      fetchTaskMessages(newTaskId);
    }
  };

  // Handle deliverable submission
  const handleDeliverableSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionUrl.trim()) {
      setSubmissionError('Please enter a valid URL');
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: tasks[currentTaskIndex].id,
          content: submissionUrl
        })
      });
      
      if (response.ok) {
        // Close the modal on success
        setShowSubmissionModal(false);
        setSubmissionUrl('');
        
        // Show success message
        setError('Deliverable submitted successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        const data = await response.json();
        setSubmissionError(data.error || 'Failed to submit deliverable');
      }
    } catch (err) {
      console.error('Error submitting deliverable:', err);
      setSubmissionError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <div className="learning loading">Loading learning session...</div>;
  }

  // Add a check for empty tasks
  if (tasks.length === 0) {
    return (
      <div className="learning">
        <div className="learning__empty-state">
          <h2>No Tasks Available</h2>
          <p>There are no tasks scheduled for today.</p>
          <p>Check back tomorrow for your next scheduled activities.</p>
          <button 
            className="learning__back-btn"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning">
      <div className="learning__content">
        <div className="learning__task-panel">
          <div className={`learning__task-header ${dayId ? 'learning__task-header--with-back' : ''}`}>
            <h2>{dayId ? `Day ${currentDay?.day_number || ''} Tasks` : "Today's Tasks"}</h2>
            {dayId && (
              <button 
                className="back-to-calendar-btn"
                onClick={() => navigate('/calendar')}
              >
                <FaArrowLeft /> Back to Calendar
              </button>
            )}
          </div>
          {tasks.length > 0 ? (
            <div className="learning__tasks-list">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''} ${task.completed ? 'completed' : ''}`}
                  onClick={() => {
                    if (index !== currentTaskIndex) {
                      setCurrentTaskIndex(index);
                      fetchTaskMessages(task.id);
                    }
                  }}
                >
                  <div className="learning__task-icon">
                    {getTaskIcon(task.type, task.completed)}
                  </div>
                  <div className="learning__task-content">
                    <h3 className="learning__task-title">{task.title}</h3>
                    <div className="learning__task-block">
                      {task.blockTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="learning__no-tasks">
              <p>No tasks available for this day.</p>
            </div>
          )}
        </div>
        
        <div className="learning__chat-container">
          <div className="learning__chat-panel">
            {/* Display resources at the top of the chat panel */}
            {currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources && tasks[currentTaskIndex].resources.length > 0 && (
              <div className="learning__task-resources-container">
                {renderTaskResources(tasks[currentTaskIndex].resources)}
              </div>
            )}
            
            <div className={`learning__messages ${isMessagesLoading ? 'loading' : ''}`}>
              {messages.map(message => (
                <div key={message.id} className={`learning__message learning__message--${message.role}`}>
                  <div className={`learning__message-content ${isMessagesLoading && message === messages[messages.length - 1] ? 'learning__message-content--loading' : ''}`}>
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              ))}
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
            
            <div className="learning__task-navigation">
              <button 
                className="learning__task-nav-button" 
                onClick={() => navigateToTask('prev')}
                disabled={currentTaskIndex === 0}
              >
                <FaArrowLeft /> Previous Task
              </button>
              <button 
                className="learning__task-nav-button" 
                onClick={() => navigateToTask('next')}
                disabled={currentTaskIndex === tasks.length - 1}
              >
                Next Task <FaArrowRight />
              </button>
            </div>
            
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
              <div className="learning__input-actions">
                {(() => {
                  return currentTaskIndex < tasks.length && 
                    (tasks[currentTaskIndex].deliverable_type === 'link' || 
                     tasks[currentTaskIndex].deliverable_type === 'file') && (
                    <button 
                      type="button"
                      className="learning__deliverable-btn"
                      onClick={() => setShowSubmissionModal(true)}
                      title={`Submit ${tasks[currentTaskIndex].deliverable}`}
                    >
                      {tasks[currentTaskIndex].deliverable_type === 'link' ? <FaLink /> : <FaBars />}
                    </button>
                  );
                })()}
              </div>
              <button 
                className="learning__send-btn" 
                type="submit" 
                disabled={!newMessage.trim() || isSending || isAiThinking}
              >
                {isSending ? "Sending..." : <FaPaperPlane />}
              </button>
            </form>
            
            {error && <div className="learning__error">{error}</div>}
            
            {currentTaskIndex < tasks.length && tasks[currentTaskIndex].type === 'reflect' && (
              <div className="learning__quick-replies">
                <h4 className="learning__quick-replies-title">Quick Replies</h4>
                <div className="learning__quick-replies-list">
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("I've used Khan Academy for math and found the interactive exercises helped me understand concepts better than textbooks.")}
                    disabled={isSending || isAiThinking}
                  >
                    I've used Khan Academy
                  </button>
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("Interactive exercises helped me learn faster because I could immediately apply what I was learning.")}
                    disabled={isSending || isAiThinking}
                  >
                    Interactive exercises helped
                  </button>
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("I found digital tools more effective than traditional textbooks because they provided immediate feedback.")}
                    disabled={isSending || isAiThinking}
                  >
                    More effective than textbooks
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="learning__modal-overlay">
          <div className="learning__modal">
            <div className="learning__modal-header">
              <h3>Submit Deliverable</h3>
              <button 
                className="learning__modal-close" 
                onClick={() => setShowSubmissionModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="learning__modal-body">
              
              <form onSubmit={handleDeliverableSubmit}>
                {tasks[currentTaskIndex].deliverable_type === 'link' && (
                  <div className="learning__form-group">
                    <div className="learning__input-with-icon">
                      <input
                        id="submission-url"
                        type="url"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        placeholder="https://..."
                        required
                      />
                      <FaExternalLinkAlt className="learning__input-icon" />
                    </div>
                  </div>
                )}
                
                {submissionError && (
                  <div className="learning__submission-error">
                    {submissionError}
                  </div>
                )}
                
                <div className="learning__modal-actions">
                  <button 
                    type="button" 
                    className="learning__modal-cancel"
                    onClick={() => setShowSubmissionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="learning__modal-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Learning; 