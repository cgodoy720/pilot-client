import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaBook, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaPaperPlane, FaCheck, FaTimes, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaBars, FaBrain, FaComments, FaClipboardList } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import PeerFeedbackForm from '../../components/PeerFeedbackForm';
import BuilderFeedbackForm from '../../components/BuilderFeedbackForm/BuilderFeedbackForm';
import TaskSubmission from '../../components/TaskSubmission/TaskSubmission';
import AnalysisModal from '../../components/AnalysisModal/AnalysisModal';
import DeliverablePanel from '../Learning/components/DeliverablePanel/DeliverablePanel';

import './PastSession.css';
import '../../styles/smart-tasks.css';

function PastSession() {
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const dayNumber = searchParams.get('dayNumber');
  const cohort = searchParams.get('cohort');
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has active status
  const isActive = user?.active !== false;
  
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
  
  // Add state for the submission modal (OLD - keeping for backward compatibility)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  
  // NEW: DeliverablePanel state
  const [showDeliverablePanel, setShowDeliverablePanel] = useState(false);
  const [currentDeliverableTask, setCurrentDeliverableTask] = useState(null);
  
  // Add peer feedback state
  const [showPeerFeedback, setShowPeerFeedback] = useState(false);
  const [peerFeedbackCompleted, setPeerFeedbackCompleted] = useState(false);
  
  // Add state for task analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [availableAnalyses, setAvailableAnalyses] = useState({});
  const [analysisType, setAnalysisType] = useState(null);
  
  // Add state for modal visibility
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // Initialize submission state
  const [submission, setSubmission] = useState(null);
  

  
  // Add refs for scrolling and textarea handling
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  
  // Add a ref to the fetchTaskMessages function
  const fetchTaskMessagesRef = useRef(null);

  // After the existing useEffects, add a new one to fetch task details
  const fetchedTasksRef = useRef(new Set());
  const lastTaskIdRef = useRef(null);
  
  // Add a new state variable for success messages
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchDaySchedule = async () => {
      // Check if we have either dayId or dayNumber
      if (!dayId && !dayNumber) {
        setError('No day identifier provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Choose the appropriate API URL based on available parameters
        let apiUrl;
        if (dayNumber) {
          apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/number/${dayNumber}/full-details`;
          // Add cohort parameter if available
          if (cohort) {
            apiUrl += `?cohort=${encodeURIComponent(cohort)}`;
          }
        } else {
          apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/full-details`;
          // Add cohort parameter if available
          if (cohort) {
            apiUrl += `?cohort=${encodeURIComponent(cohort)}`;
          }
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch day details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Day details data:', data);
        
        // Set day schedule data
        setDaySchedule(data);
        
        // Set tasks data from the response, ensuring task_mode is set
        if (data.flattenedTasks && Array.isArray(data.flattenedTasks)) {
          // Process flattened tasks to ensure task_mode is set
          const processedTasks = data.flattenedTasks.map(task => ({
            ...task,
            task_mode: task.task_mode || 'basic' // Ensure task_mode is set
          }));
          console.log('Processed flattenedTasks with task_mode:', 
            processedTasks.map(t => ({ id: t.id, title: t.title, task_mode: t.task_mode })));
          setTasks(processedTasks);
          setTasksLoading(false);
        } else {
          // Fallback to processing from timeBlocks if needed
          processTasksFromTimeBlocks(data);
        }
      } catch (error) {
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
            
            // Debug: Log the task data to see what we're getting
            console.log('Processing task:', {
              id: task.task_id || task.id,
              title: task.task_title || task.title,
              task_mode: task.task_mode,
              raw_task: task
            });
            
            // Ensure task_mode is properly set
            const taskMode = task.task_mode || 'basic';
            console.log(`Setting task_mode for task ${task.task_id || task.id} to: ${taskMode}`);
            
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
              resources: taskResources,
              deliverable: task.deliverable,
              deliverable_type: task.deliverable_type || 'none',
              should_analyze: task.should_analyze || false,
              analyze_deliverable: task.analyze_deliverable || false,
              analyze_conversation: task.analyze_conversation || false,
              task_mode: taskMode, // Explicitly set task mode
              smart_prompt: task.smart_prompt || null,
              conversation_model: task.conversation_model || null
            });
          });
        }
      });
      
      // Debug: Log the final tasks array
      console.log('Final tasks array:', allTasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        task_mode: t.task_mode 
      })));
      
      setTasks(allTasks);
      setTasksLoading(false);
    };

    fetchDaySchedule();
  }, [dayId, dayNumber, cohort, token]);

  // Add auto-scroll effect when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update existing useEffect for fetching task messages
  useEffect(() => {
    const fetchTaskMessages = async (taskId) => {
      if (!taskId) return;
      
      // Skip refetching if we're already on this task
      if (lastTaskIdRef.current === taskId) {
        return;
      }
      
      // Set loading state and update last task id
      setMessagesLoading(true);
      setRateLimitHit(false); // Reset any previous rate limit flag
      lastTaskIdRef.current = taskId;
      
      try {
        // Add lazy loading delay (mimic network latency)
        setIsLazyLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
        setIsLazyLoading(false);
        
        // Add dayNumber parameter to the API request if available
        let apiUrl = `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`;
        
        let hasQueryParam = false;
        if (daySchedule && daySchedule.day && daySchedule.day.day_number) {
          apiUrl += `?dayNumber=${daySchedule.day.day_number}`;
          hasQueryParam = true;
        }
        
        // Add cohort parameter if available
        if (cohort) {
          apiUrl += hasQueryParam ? `&cohort=${encodeURIComponent(cohort)}` : `?cohort=${encodeURIComponent(cohort)}`;
        }
        
        console.log('Fetching task messages from URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            setRateLimitHit(true);
            throw new Error('Rate limit exceeded. Please wait before trying again.');
          } else if (response.status === 404) {
            // No messages for this task yet - this is not an error
            // Instead of automatic thread starting, show UI to let user start manually
            setMessages([]);
            setMessagesLoading(false);
            return;
          }
          throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Process and format the messages if we got them
        if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          console.log(`Loaded ${data.messages.length} existing messages for task ${taskId}`);
          
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
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Fallback for direct array response
          console.log(`Loaded ${data.length} existing messages in fallback format for task ${taskId}`);
          
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
          // No messages found but API returned successfully - this means we need empty state
          console.log(`No messages found for task ${taskId} - showing empty state`);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        if (!rateLimitHit) {
          setError('Failed to load messages. Please try again.');
        }
      } finally {
        setMessagesLoading(false);
      }
    };
    
    // Only fetch messages automatically when the component first mounts
    // Don't fetch on task index changes - that will be handled by click handlers
    if (tasks.length > 0 && currentTaskIndex < tasks.length && !lastTaskIdRef.current) {
      fetchTaskMessages(tasks[currentTaskIndex].id);
    }
    
    // Expose fetchTaskMessages to be called from outside the effect
    fetchTaskMessagesRef.current = fetchTaskMessages;
  }, [token, tasks, daySchedule, dayNumber, cohort, isPastSession]); // Add cohort to dependency array

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

  // Add useEffect to fetch analyses when the task changes
  useEffect(() => {
    if (tasks.length > 0 && currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
      const currentTask = tasks[currentTaskIndex];
      if (currentTask) {
        console.log(`Current task changed to task ${currentTask.id}, checking for analyses`);
        fetchAvailableAnalyses(currentTask.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTaskIndex, tasks]);

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
        return;
      }
      
      // Mark this task as fetched to prevent repeated fetches
      fetchedTasksRef.current.add(taskId);
      
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${taskId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return;
        }
        
        const taskData = await response.json();
        
        // Check if the task has linked_resources
        if (taskData.linked_resources) {
          // Process linked_resources to usable format
          let resourceObj;
          
          if (typeof taskData.linked_resources === 'string') {
            try {
              // Try to parse if it's a JSON string
              resourceObj = JSON.parse(taskData.linked_resources);
            } catch (e) {
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
        // Error handling without console.log
      }
    };
    
    if (tasks.length > 0 && currentTaskIndex < tasks.length) {
      fetchTaskDetails();
    }
  }, [currentTaskIndex, token]); // Remove tasks from dependency array

  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  const getTaskIcon = (type, taskMode, feedbackSlot) => {
    // Ensure task_mode has a value (default to 'basic')
    const mode = taskMode || 'basic';
    console.log('getTaskIcon called with:', { type, taskMode, normalizedMode: mode, feedbackSlot });
    
    // Check if this is a feedback slot task - use clipboard icon
    if (feedbackSlot) {
      return <FaClipboardList className="task-icon feedback" />;
    }
    
    // Check if this is a conversation task - use brain icon
    if (mode === 'conversation') {
      console.log('Returning brain icon for conversation task');
      return <FaBrain className="task-icon conversation" />;
    }
    
    // Special case for Independent Retrospective
    if (type === 'reflect' && tasks.length > 0 && 
        currentTaskIndex < tasks.length &&
        tasks[currentTaskIndex].title === "Independent Retrospective") {
      // Always show the original icon for the Independent Retrospective task
      return <FaBook className="task-icon reflect" />;
    }
    
    // Remove the completed check - always show the icon based on type
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
    if (!resources || resources.length === 0) {
      return null;
    }
    
    // Ensure resources are properly parsed
    const parsedResources = resources.map(resource => {
      if (typeof resource === 'string') {
        try {
          const parsed = JSON.parse(resource);
          return parsed;
        } catch (e) {
          // Try to handle it as a direct URL string
          if (resource.startsWith('http')) {
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
          return null;
        }
      }
      
      return resource;
    }).filter(Boolean); // Remove any null resources
    
    if (parsedResources.length === 0) {
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
                <li key={index} className="past-session__resource-item">
                  <div className="past-session__resource-content">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.title || 'Resource Link'}
                    </a>
                  </div>

                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to preprocess code content for better wrapping
  const preprocessCodeContent = (code) => {
    if (!code) return code;
    
    // Split code into lines
    const lines = code.split('\n');
    const maxLineLength = 80; // Reasonable line length for code
    
    const processedLines = lines.map(line => {
      // If line is too long, try to break it intelligently
      if (line.length > maxLineLength) {
        // Try to break at logical points (spaces, operators, etc.)
        const breakPoints = [' ', '.', '(', ')', '{', '}', '[', ']', ',', ';', '=', '+', '-'];
        let bestBreak = -1;
        
        // Find the best break point within reasonable range
        for (let i = maxLineLength - 10; i >= maxLineLength - 30 && i >= 0; i--) {
          if (breakPoints.includes(line[i])) {
            bestBreak = i + 1;
            break;
          }
        }
        
        // If we found a good break point, split the line
        if (bestBreak > 0 && bestBreak < line.length) {
          const firstPart = line.substring(0, bestBreak);
          const secondPart = '  ' + line.substring(bestBreak).trim(); // Indent continuation
          return firstPart + '\n' + secondPart;
        }
      }
      
      return line;
    });
    
    return processedLines.join('\n');
  };

  // Add a format function for message content with markdown support
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
              
              // Preprocess the code content for better wrapping
              const processedCode = preprocessCodeContent(code);
              
              return (
                <div key={index} className="code-block-wrapper">
                  <div className="code-block-header">
                    {language && <span className="code-language">{language}</span>}
                  </div>
                  <div className="code-block-content">
                    {processedCode}
                  </div>
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

  // Add a historical notification banner at the top of the component render
  const renderHistoricalBanner = () => {
    if (!isActive) {
      return (
        <div className="past-session__historical-banner">
          <p>You have historical access only. You can view your past content but cannot submit new work or generate new feedback.</p>
        </div>
      );
    }
    return null;
  };

  // Update the handleSendMessage to check for active status
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    // Prevent sending if the user is inactive
    if (!isActive) {
      setError('You have historical access only and cannot send new messages.');
      return;
    }
    
    // Get the current task
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) {
      setError('No task selected.');
      return;
    }
    
    try {
      setError(null);
      setIsSending(true);
      
      // Show optimistic UI update
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        content: newMessage,
        role: 'user',
        timestamp: new Date().toLocaleTimeString(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      
      // Show AI thinking indicator
      setIsAiThinking(true);
      
      // Auto expand the textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Add cohort parameter to the URL for debugging
      console.log('Sending message with cohort:', cohort);
      
      // Send the message
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          taskId: currentTask.id,
          dayNumber: dayNumber,
          cohort: cohort
        })
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
        // Update the user message with the real server ID
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === optimisticId ? 
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
      setError('Failed to communicate with the learning assistant. Please try again.');
      
      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticId));
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

  // Handle task navigation
  const navigateToTask = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentTaskIndex + 1, tasks.length - 1)
      : Math.max(currentTaskIndex - 1, 0);
      
    if (newIndex !== currentTaskIndex) {
      // Reset the analysis results
      setAnalysisResults(null);
      setShowAnalysisModal(false);
      
      // Update the current task index
      setCurrentTaskIndex(newIndex);
      
      // Set loading state
      setMessagesLoading(true);
      
      // Preserve the dayId parameter if it exists
      const params = new URLSearchParams(location.search);
      const currentDayId = params.get('dayId') || params.get('dayNumber');
      
      if (currentDayId) {
        console.log(`Navigating to task: ${tasks[newIndex].id} for day: ${currentDayId}`);
      }
      
      // Use the shared fetchTaskMessages function to maintain consistency
      // This will get existing messages or set up the UI to start a new thread
      fetchTaskMessagesRef.current(tasks[newIndex].id);
    }
  };

  // Update startTaskThread to work with our new approach
  const startTaskThread = async (taskId) => {
    if (!taskId) return;
    
    // Check if user is active, if not, show error and return
    if (!isActive) {
      setError('You have historical access only and cannot start new conversations.');
      return;
    }
    
    // Show starting message
    setMessages([{
      id: 'starting',
      content: 'Starting conversation...',
      role: 'system'
    }]);
    
    try {
      setError(null);
      setIsSending(true);
      
      // Send the start request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: taskId,
          dayNumber: dayNumber,
          cohort: cohort
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start thread: ${response.status}`);
      }
      
      // Get the initial message
      const data = await response.json();
      
      // Add the assistant message to the state
      setMessages([{
        id: data.message_id,
        message_id: data.message_id,
        content: data.content,
        role: data.role,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error starting thread:', error);
      if (!rateLimitHit) {
        setError('Failed to start conversation. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Add a retry handler function
  const handleRetry = async () => {
    setError(null);
    setRateLimitHit(false);
    
    // Add a delay before retrying
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    if (tasks.length > 0) {
      fetchTaskMessagesRef.current(tasks[currentTaskIndex].id);
    }
  };

  // Handle deliverable submission (OLD - keeping for backward compatibility)
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
        
        // Show success message without using error state
        setSuccessMessage('Deliverable submitted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setSubmissionError(data.error || 'Failed to submit deliverable');
      }
    } catch (err) {
      setSubmissionError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle deliverable panel submission
  const handleDeliverablePanelSubmit = async (submissionData) => {
    if (!currentDeliverableTask) return;
    
    try {
      // Determine content format based on deliverable type
      let content = submissionData;
      
      // For structured submissions, stringify the object
      if (typeof submissionData === 'object' && submissionData !== null) {
        content = JSON.stringify(submissionData);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: currentDeliverableTask.id,
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit deliverable');
      }
      
      // Refresh submission data
      await fetchTaskSubmission(currentDeliverableTask.id);
      
      // Show success message
      setSuccessMessage('Deliverable submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Keep panel open so user can see their submission
      // They can close it manually when ready
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      setError('Failed to submit deliverable. Please try again.');
      throw error; // Re-throw so DeliverablePanel can handle it
    }
  };

  // Add a helper function to check if current task is the Independent Retrospective
  const isIndependentRetroTask = () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return false;
    
    const currentTask = tasks[currentTaskIndex];
    // Check by title - a more robust approach would be to check by task ID or type
    return currentTask.title === "Independent Retrospective";
  };

  // Add a function to handle peer feedback completion
  const handlePeerFeedbackComplete = () => {
    // Mark peer feedback as completed
    setPeerFeedbackCompleted(true);
    
    // Hide the peer feedback form
    setShowPeerFeedback(false);
    
    // Success status will be shown inline in the task action area
  };
  
  // Add a function to handle peer feedback cancellation
  const handlePeerFeedbackCancel = () => {
    // Hide the peer feedback form without marking as completed
    setShowPeerFeedback(false);
  };
  
  // Add a function to show the peer feedback form
  const showPeerFeedbackForm = () => {
    if (isIndependentRetroTask() && isPastSession) {
      setShowPeerFeedback(true);
    }
  };

  // Function to fetch task analysis
  const fetchTaskAnalysis = async (taskId, type = null) => {
    if (!taskId) {
      console.log('No taskId provided to fetchTaskAnalysis');
      return false;
    }
    
    try {
      // Build URL with type parameter if provided
      let url = `${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/analysis`;
      if (type) {
        url += `?type=${type}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
        setAnalysisType(type || data.analysis_type); // Store which type of analysis is being viewed
        return true;
      } else {
        console.log(`No analysis found for task ${taskId} type ${type}, status: ${response.status}`);
        if (!type) {
          // Only clear results if not looking for a specific type
          setAnalysisResults(null);
        }
        return response.status !== 404; // Return true for non-404 errors, false for 404 (not found)
      }
    } catch (error) {
      console.error(`Error fetching task analysis for task ${taskId}:`, error);
      if (!type) {
        // Only clear results if not looking for a specific type
        setAnalysisResults(null);
      }
      return false;
    }
  };

  // Function to generate feedback for the current task
  const handleAnalyzeTask = async () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    // Check if user is active
    if (!isActive) {
      setError('You have historical access only and cannot generate new feedback.');
      return;
    }
    
    const currentTask = tasks[currentTaskIndex];
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze task');
      }
      
      const data = await response.json();
      setAnalysisResults(data);
      setAnalysisType('conversation');
      
      // Refresh available analyses
      await fetchAvailableAnalyses(currentTask.id);
      
      setShowAnalysisModal(true);
      // Use success message instead of error message
      setSuccessMessage('Analysis completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setAnalysisError(error.message);
      setError('Failed to analyze task: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to analyze a deliverable submission
  const handleAnalyzeDeliverable = async (url) => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    // Check if user is active
    if (!isActive) {
      setError('You have historical access only and cannot analyze deliverables.');
      return;
    }
    
    const currentTask = tasks[currentTaskIndex];
    
    // Log debugging information
    console.log('handleAnalyzeDeliverable called with:', { 
      url,
      taskId: currentTask.id
    });
    
    // Set loading state
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Call the API to analyze the deliverable
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-deliverable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });
      
      console.log('Analyze deliverable response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        const errorMessage = errorData.error || `Failed to analyze deliverable: ${response.status} ${response.statusText}`;
        
        console.error('Error response data:', errorData);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Analyze deliverable success, data received');
      
      // Update UI with results
      setAnalysisResults(data);
      setAnalysisType('deliverable');
      
      // Refresh available analyses
      await fetchAvailableAnalyses(currentTask.id);
      
      setShowAnalysisModal(true);
      setSuccessMessage('Deliverable analyzed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      return data;
    } catch (error) {
      console.error('Error analyzing deliverable:', error);
      setError(`Failed to analyze deliverable: ${error.message}`);
      
      // Propagate the error so the TaskSubmission component can handle it
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to handle switching between different analysis types
  const handleSwitchAnalysis = async (type) => {
    if (!type || !tasks.length || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    setAnalysisType(type);
    
    // Fetch the appropriate analysis based on type
    if (type === 'deliverable') {
      // Make sure we have the submission data for deliverable analysis
      await fetchTaskSubmission(currentTask.id);
    }
    
    // Fetch the analysis for the selected type
    await fetchTaskAnalysis(currentTask.id, type);
  };

  // Function to fetch all available analyses for a task
  const fetchAvailableAnalyses = async (taskId) => {
    if (!taskId) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/all-analyses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableAnalyses(data);
        
        // If we already have a selected analysis type, keep it
        // Otherwise, select the first available type
        if (!analysisType && Object.keys(data).length > 0) {
          const firstType = Object.keys(data)[0];
          setAnalysisType(firstType);
          
          // Load the first analysis of this type
          if (data[firstType] && data[firstType].length > 0) {
            await fetchTaskAnalysis(taskId, firstType);
          }
        }
        
        return data;
      } else {
        // 404 is expected if no analyses exist yet
        if (response.status !== 404) {
          console.error(`Error fetching analyses: ${response.status}`);
        }
        setAvailableAnalyses({});
        return {};
      }
    } catch (error) {
      console.error(`Error fetching analyses:`, error);
      setAvailableAnalyses({});
      return {};
    }
  };

  // Function to fetch the most recent submission
  const fetchTaskSubmission = async (taskId) => {
    if (!taskId) return null;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched submission:', data);
        setSubmission(data);
        return data;
      } else if (response.status !== 404) {
        // 404 is expected if no submission exists yet
        console.log(`No submission found for task ${taskId}`);
      }
      
      setSubmission(null);
      return null;
    } catch (error) {
      console.error(`Error fetching submission for task ${taskId}:`, error);
      setSubmission(null);
      return null;
    }
  };

  // Function to view analysis in modal
  const handleViewAnalysis = async () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    
    // Fetch the task submission first
    await fetchTaskSubmission(currentTask.id);
    
    // Then show the modal
    setShowAnalysisModal(true);
  };

  // Helper function to organize analysis results
  const organizeAnalysisBySubmission = (analysis) => {
    if (!analysis) return {};
    
    const result = {};
    
    // For conversation analysis, create a single conversation entry
    if (analysisType === 'conversation') {
      result['conversation'] = {
        criteria_met: analysis.analysis_result?.criteria_met || [],
        areas_for_improvement: analysis.analysis_result?.areas_for_improvement || [],
        feedback: analysis.feedback || "No detailed feedback available"
      };
    } 
    // For deliverable analysis, create a single deliverable entry
    else if (analysisType === 'deliverable') {
      result['deliverable'] = {
        criteria_met: analysis.analysis_result?.criteria_met || [],
        areas_for_improvement: analysis.analysis_result?.areas_for_improvement || [],
        feedback: analysis.feedback || "No detailed feedback available"
      };
    }
    
    return result;
  };

  // Get a list of available analysis types
  const getAvailableAnalysisTypes = () => {
    if (!availableAnalyses) return [];
    return Object.keys(availableAnalyses);
  };

  if (isLoading) {
    return (
      <div className="learning past-session">
        <div className="learning__content">
          <div className={`learning__chat-container ${currentTaskIndex < tasks.length ? `learning__chat-container--${tasks[currentTaskIndex].task_mode || 'basic'}` : ''}`}>
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
          <div className={`learning__chat-container ${currentTaskIndex < tasks.length ? `learning__chat-container--${tasks[currentTaskIndex].task_mode || 'basic'}` : ''}`}>
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
      {renderHistoricalBanner()}
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
                  className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''}`}
                  data-mode={task.task_mode || 'basic'}
                  onClick={() => {
                    if (index !== currentTaskIndex) {
                      // Update the task index
                      setCurrentTaskIndex(index);
                      
                      // Reset analysis state
                      setAnalysisResults(null);
                      setShowAnalysisModal(false);
                      
                      // Set loading state
                      setMessagesLoading(true);
                      
                      // Get task messages - first try to GET existing messages, if none exist 
                      // the function will handle starting a new thread if needed
                      fetchTaskMessagesRef.current(task.id);
                    }
                  }}
                >
                  <div className="learning__task-icon">
                    {getTaskIcon(task.type, task.task_mode, task.feedback_slot)}
                  </div>
                  <div className="learning__task-content">
                    <h3 className="learning__task-title">
                      <span className="learning__task-title-text">{task.title}</span>

                      {(task.deliverable_type === 'link' || 
                        task.deliverable_type === 'file' || 
                        task.deliverable_type === 'document' || 
                        task.deliverable_type === 'video') && (
                        <span className="learning__task-deliverable-indicator">
                          <FaLink />
                        </span>
                      )}
                    </h3>

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
          
          {/* Add Peer Feedback button for Independent Retrospective tasks */}
          {isIndependentRetroTask() && isPastSession && messages.length > 0 && (
            <div className="past-session__task-action">
              {peerFeedbackCompleted ? (
                <div className="past-session__feedback-status">
                  <FaCheck /> Peer feedback submitted successfully!
                </div>
              ) : (
                <button 
                  className="past-session__feedback-btn"
                  onClick={showPeerFeedbackForm}
                >
                  <FaUsers /> Provide Peer Feedback
                </button>
              )}
            </div>
          )}
          
          <button 
            className="back-to-calendar-btn"
            onClick={handleBackToCalendar}
          >
            <FaArrowLeft /> Back to Calendar
          </button>
        </div>
        
        <div className={`learning__chat-container ${currentTaskIndex < tasks.length ? `learning__chat-container--${tasks[currentTaskIndex].task_mode}` : ''}`}>
          {showPeerFeedback ? (
            // Show the peer feedback form when needed
            <PeerFeedbackForm
              dayNumber={daySchedule?.day?.day_number || dayNumber}
              onComplete={handlePeerFeedbackComplete}
              onCancel={handlePeerFeedbackCancel}
            />
          ) : tasks.length > 0 && tasks[currentTaskIndex]?.feedback_slot ? (
            // Show the builder feedback form for feedback_slot tasks
            <BuilderFeedbackForm
              taskId={tasks[currentTaskIndex].id}
              dayNumber={daySchedule?.day?.day_number || dayNumber}
              cohort={cohort}
              onComplete={() => {
                // Optional: Add any completion logic here
                console.log('Builder feedback completed');
              }}
            />
          ) : (
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
              <div className={`learning__messages ${messagesLoading ? 'loading' : ''} ${editingMessageId !== null ? 'has-editing-message' : ''}`}>
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
                                onClick={() => tasks.length > 0 && currentTaskIndex < tasks.length && startTaskThread(tasks[currentTaskIndex].id)}
                                className="past-session__start-conversation-btn"
                                disabled={!isActive || !tasks.length || tasksLoading || isLazyLoading}
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
                
                {/* Display success message if there is one */}
                {successMessage && <div className="learning__success">{successMessage}</div>}
              </div>
              
              {/* Task Navigation with Analysis Actions */}
              {isPastSession && tasks.length > 0 && currentTaskIndex < tasks.length && (
                <div className="learning__task-navigation">
                  <button 
                    className="learning__task-nav-button" 
                    onClick={() => navigateToTask('prev')}
                    disabled={currentTaskIndex === 0}
                  >
                    <FaArrowLeft /> Prev Task
                  </button>
                  
                  {tasks[currentTaskIndex].should_analyze && isActive && (
                    <button 
                      className="learning__task-nav-button"
                      onClick={handleAnalyzeTask}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? 'Generating Feedback...' : 'Generate AI Feedback'}
                    </button>
                  )}
                  
                  {Object.keys(availableAnalyses).length > 0 && (
                    <button 
                      className="learning__task-nav-button"
                      onClick={handleViewAnalysis}
                    >
                      View Feedback
                    </button>
                  )}
                  
                  {isIndependentRetroTask() && messages.length > 0 ? (
                    peerFeedbackCompleted ? (
                      <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div>
                    ) : (
                      <button 
                        className="learning__feedback-btn"
                        onClick={showPeerFeedbackForm}
                      >
                        <FaUsers /> Provide Peer Feedback
                      </button>
                    )
                  ) : (
                    <button 
                      className="learning__task-nav-button" 
                      onClick={() => navigateToTask('next')}
                      disabled={currentTaskIndex === tasks.length - 1}
                    >
                      Next Task <FaArrowRight />
                    </button>
                  )}
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
                      placeholder={!isActive ? "Historical view only" : (isSending ? "Sending..." : "Type your message...")}
                      disabled={!isActive || isSending || isAiThinking}
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
                        return tasks.length > 0 && 
                          (tasks[currentTaskIndex]?.deliverable_type === 'link' ||
                           tasks[currentTaskIndex]?.deliverable_type === 'file' ||
                           tasks[currentTaskIndex]?.deliverable_type === 'document' ||
                           tasks[currentTaskIndex]?.deliverable_type === 'video' ||
                           tasks[currentTaskIndex]?.deliverable_type === 'structured') && (
                          <button 
                            type="button"
                            className="learning__deliverable-btn"
                            onClick={async () => {
                              const task = tasks[currentTaskIndex];
                              setCurrentDeliverableTask(task);
                              // Fetch submission for this specific task
                              await fetchTaskSubmission(task.id);
                              setShowDeliverablePanel(true);
                            }}
                            title={`Submit ${tasks[currentTaskIndex].deliverable}`}
                          >
                            <FaLink />
                          </button>
                        );
                      })()}
                    </div>
                    <button 
                      className="learning__send-btn" 
                      type="submit" 
                      disabled={!isActive || !newMessage.trim() || isSending || isAiThinking}
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
              
              {/* Display error message if there is one */}
              {error && !rateLimitHit && <div className="learning__error">{error}</div>}
            </div>
          )}
        </div>
      </div>
      
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="learning__modal-overlay">
          <div className="learning__modal learning__modal--submission">
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
              <TaskSubmission 
                taskId={tasks[currentTaskIndex].id} 
                deliverable={tasks[currentTaskIndex].deliverable}
                canAnalyzeDeliverable={Boolean(tasks[currentTaskIndex].analyze_deliverable)}
                onAnalyzeDeliverable={handleAnalyzeDeliverable}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis Modal */}
      {showAnalysisModal && analysisResults && (
        <AnalysisModal 
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          analysisResults={organizeAnalysisBySubmission(analysisResults)}
          analysisType={analysisType}
          availableAnalysisTypes={getAvailableAnalysisTypes()}
          onSwitchAnalysisType={handleSwitchAnalysis}
        />
      )}
      
      {/* NEW: Deliverable Panel (Sidebar) */}
      {showDeliverablePanel && currentDeliverableTask && (
        <DeliverablePanel
          task={currentDeliverableTask}
          currentSubmission={submission}
          onClose={() => {
            setShowDeliverablePanel(false);
            setCurrentDeliverableTask(null);
          }}
          onSubmit={handleDeliverablePanelSubmit}
          isLocked={false}
        />
      )}

    </div>
  );
}

export default PastSession; 