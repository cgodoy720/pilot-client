import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaEdit, FaCheck, FaTimes, FaFileAlt, FaVideo, FaBrain, FaComments, FaClipboardList, FaLock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import PeerFeedbackForm from '../../components/PeerFeedbackForm';
import TaskSubmission from '../../components/TaskSubmission/TaskSubmission';
import AnalysisModal from '../../components/AnalysisModal/AnalysisModal';
import BuilderFeedbackForm from '../../components/BuilderFeedbackForm/BuilderFeedbackForm';
import DeliverablePanel from './components/DeliverablePanel/DeliverablePanel';

import './Learning.css';
import '../../styles/smart-tasks.css';

function Learning() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);
  
  // Check if user has active status
  const isActive = user?.active !== false;
  
  // Add state variables for message editing
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Current day and task data
  const [currentDay, setCurrentDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [workshopInfo, setWorkshopInfo] = useState(null);
  
  // Get dayId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const dayId = queryParams.get('dayId');
  const taskId = queryParams.get('taskId');
  const cohort = queryParams.get('cohort');
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  
  // Add a debounce mechanism to prevent multiple calls
  const fetchingTasks = {};
  
  // Add state for the Pictures modal (OLD - will be replaced by DeliverablePanel)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  
  // NEW: DeliverablePanel state
  const [showDeliverablePanel, setShowDeliverablePanel] = useState(false);
  const [currentDeliverableTask, setCurrentDeliverableTask] = useState(null);
  
  // Add state for peer feedback
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
  

  
  // Add useEffect to log analysis results changes
  useEffect(() => {
    console.log('Analysis results state changed:', analysisResults ? 'Has results' : 'No results');
  }, [analysisResults]);
  
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
    // Generate a unique timestamp for this fetch
    const fetchTimestamp = Date.now();
    fetchTaskMessages.lastFetchTimestamp = fetchTimestamp;
    
    // Reset initial message flag when loading new task
    setHasInitialMessage(false);
    
    try {
      // Clear any previous error
      setError('');
      
      // Check if we already have messages for this task
      // If we're switching tasks, we might already have messages for the new task
      const existingMessages = messages.filter(msg => 
        msg.role !== 'system' && 
        !msg.content?.includes('Loading') && 
        !msg.content?.includes('Error')
      );
      
      // Only show loading state if we don't have meaningful messages
      if (existingMessages.length === 0) {
        setIsMessagesLoading(true);
        
        // Show a loading message with the current task title
        const currentTask = tasks.find(task => task.id === taskId);
        if (currentTask) {
          setMessages([{
            id: 'loading',
            content: `Loading ${currentTask.title}...`,
            role: 'system'
          }]);
        }
      }
      
      console.log(`Fetching messages for task ${taskId} at timestamp ${fetchTimestamp}`);
      
      // Add dayNumber parameter to the API request if available
      let apiUrl = `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`;
      
      let hasQueryParam = false;
      if (currentDay && currentDay.day_number) {
        apiUrl += `?dayNumber=${currentDay.day_number}`;
        hasQueryParam = true;
      }
      
      // Add cohort parameter if available
      if (cohort) {
        apiUrl += hasQueryParam ? `&cohort=${encodeURIComponent(cohort)}` : `?cohort=${encodeURIComponent(cohort)}`;
      }
      
      // First, try to get existing messages
      const response = await fetch(apiUrl, {
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
          message_id: msg.message_id,
          content: typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content,
          role: msg.role,
          timestamp: msg.timestamp
        }));
        
        // Filter out system metadata objects that shouldn't be displayed
        const filteredMessages = formattedMessages.filter(message => {
          // Skip system metadata objects that shouldn't be displayed
          if (typeof message.content === 'string' && 
              (message.content.includes('"conversation_started":') || 
               message.content.includes('"last_message_timestamp":') ||
               message.content.includes('"topics_discussed":'))) {
            console.log('Skipping system metadata object');
            return false;
          }
          return true;
        });
        
        console.log(`Filtered out ${formattedMessages.length - filteredMessages.length} system metadata messages`);
        
        setMessages(filteredMessages);
        // Mark that we have the initial message (existing messages mean task is ready)
        setHasInitialMessage(true);
        console.log(`Displayed ${filteredMessages.length} messages`);
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
              taskId: taskId,
              dayNumber: currentDay?.day_number,
              cohort: cohort
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
            setHasInitialMessage(false); // System message doesn't count as initial message
          } else {
            // Display the assistant's response
            setMessages([{
              id: messageData.message_id,
              content: messageContent,
              role: messageData.role,
              timestamp: messageData.timestamp
            }]);
            // Mark that we have the initial message from AI
            setHasInitialMessage(true);
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
      // and if we set it to true earlier (when we didn't have existing messages)
      if (fetchTaskMessages.lastFetchTimestamp === fetchTimestamp) {
        // Check if we had set loading state to true (when we didn't have existing messages)
        const existingMessages = messages.filter(msg => 
          msg.role !== 'system' && 
          !msg.content?.includes('Loading') && 
          !msg.content?.includes('Error')
        );
        
        // Only turn off loading state if we had turned it on
        if (existingMessages.length === 0) {
          setIsMessagesLoading(false);
        }
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
          // Add cohort parameter if available
          if (cohort) {
            url += `?cohort=${encodeURIComponent(cohort)}`;
          }
        } else {
          // Otherwise fetch the current day
          url = `${import.meta.env.VITE_API_URL}/api/progress/current-day`;
          // Add cohort parameter if available
          if (cohort) {
            url += `?cohort=${encodeURIComponent(cohort)}`;
          }
        }
        
        // Fetch day's schedule and progress
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error || 'Failed to fetch learning data');
          error.response = { status: response.status, data: errorData };
          throw error;
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
            
            // Parse deliverable_schema if it's a string (JSONB from PostgreSQL)
            let deliverableSchema = null;
            if (task.deliverable_schema) {
              try {
                // If it's a string, try to parse it
                if (typeof task.deliverable_schema === 'string') {
                  deliverableSchema = JSON.parse(task.deliverable_schema);
                } 
                // If it's already an object, use it directly
                else if (typeof task.deliverable_schema === 'object') {
                  deliverableSchema = task.deliverable_schema;
                }
              } catch (e) {
                console.error('Error parsing deliverable_schema:', e);
                deliverableSchema = null;
              }
            }
            
            console.log('Task:', task.task_title, 'deliverable_schema from API:', task.deliverable_schema, 'parsed:', deliverableSchema);
            
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
              deliverable_type: task.deliverable_type || 'none',
              deliverable_schema: deliverableSchema,
              should_analyze: task.should_analyze || false,
              analyze_deliverable: task.analyze_deliverable || false,
              task_mode: task.task_mode || 'basic', // Add task mode support
              smart_prompt: task.smart_prompt || null,
              conversation_model: task.conversation_model || null,
              feedback_slot: task.feedback_slot || null // Add feedback slot support
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
        setWorkshopInfo(data.workshopInfo || null);
        
        // Fetch messages for the initial task (only if it's not a feedback slot)
        if (allTasks.length > 0) {
          const initialTask = allTasks[initialTaskIndex];
          
          if (!initialTask.feedback_slot) {
            await fetchTaskMessages(initialTask.id);
            
            // Check if there's an existing analysis for this task
            if (initialTask.should_analyze) {
              await fetchTaskAnalysis(initialTask.id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching learning data:', err);
        setError('Failed to load learning data. Please try again later.');
      } finally {
        setIsPageLoading(false);
      }
    };
    
    fetchCurrentDayData();
  }, [token, dayId, cohort]);
  
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
    
    // Prevent sending if the user is inactive
    if (!isActive) {
      setError('You have historical access only and cannot send new messages.');
      return;
    }
    
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
      
      // Get day number if available
      const currentDayNumber = currentDay?.day_number;
      
      // Prepare request body with dayNumber if available
      const requestBody = {
        content: messageToSend,
        taskId: currentTaskId
      };
      
      if (currentDayNumber) {
        requestBody.dayNumber = currentDayNumber;
      }
      
      // Add cohort parameter if available
      if (cohort) {
        requestBody.cohort = cohort;
      }
      
      // Send message to learning API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Get AI response
      const aiResponseData = await response.json();
      
      // Extract the user message ID from the response if available
      // The server might include the user_message_id in its response
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
      } else {
        console.log('Server did not return user_message_id, keeping temporary ID');
      }
      
      // Regular AI response
      let aiResponse;
      
      if (aiResponseData && aiResponseData.content) {
        // Use the actual AI response from the API
        aiResponse = {
          id: aiResponseData.message_id || Date.now() + 1,
          message_id: aiResponseData.message_id, // Store original message_id for API calls
          role: 'assistant',
          content: typeof aiResponseData.content === 'object' ? JSON.stringify(aiResponseData.content) : aiResponseData.content,
          timestamp: aiResponseData.timestamp || new Date().toISOString()
        };
      } else {
        // Fallback response if API doesn't return expected format
        const fallbackId = Date.now() + 1;
        aiResponse = {
          id: fallbackId,
          message_id: fallbackId, // Store id as message_id for consistency
          role: 'assistant',
          content: "I'm processing your message. Could you provide more details or clarify your thoughts?",
          timestamp: new Date().toISOString()
        };
      }
      
      // Apply deduplication before adding the new message
      setMessages(prevMessages => {
        // Create a new array with all previous messages
        const updatedMessages = [...prevMessages];
        
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
    
    // Success status will be shown by the inline status element
  };
  
  // Add a function to handle peer feedback cancellation
  const handlePeerFeedbackCancel = () => {
    // Hide the peer feedback form without marking as completed
    setShowPeerFeedback(false);
  };

  // Add a function to handle builder feedback completion
  const handleBuilderFeedbackComplete = () => {
    // Builder feedback completion doesn't need special handling
    // The form will show success state and can navigate away
    console.log('Builder feedback completed successfully');
  };

  // Helper function to check if current task is a feedback slot
  const isCurrentTaskFeedbackSlot = () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return false;
    return !!tasks[currentTaskIndex].feedback_slot;
  };

  // Modify the markTaskAsCompleted function to not handle peer feedback
  const markTaskAsCompleted = async (taskId) => {
    try {
      // No need to check for Independent Retrospective task anymore
      // as we're not showing the Complete button for it
      
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
  const getTaskIcon = (type, completed, taskMode, feedbackSlot) => {
    // Check if this is a feedback slot task - use clipboard icon
    if (feedbackSlot) {
      if (completed) {
        return <FaCheckCircle className="task-icon completed" />;
      }
      return <FaClipboardList className="task-icon feedback" />;
    }
    
    // Check if this is a conversation task - use brain icon
    if (taskMode === 'conversation') {
      if (completed) {
        return <FaCheckCircle className="task-icon completed" />;
      }
      return <FaBrain className="task-icon conversation" />;
    }
    
    // Special case for Independent Retrospective
    if (type === 'reflect' && tasks.length > 0 && 
        currentTaskIndex < tasks.length &&
        tasks[currentTaskIndex].title === "Independent Retrospective") {
      // Always show the original icon for Independent Retrospective
      return <FaBook className="task-icon reflect" />;
    }
    
    // Show type-specific icons based on task type
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
        // For unknown types or if completed is true, show checkmark
        if (completed) {
          return <FaCheckCircle className="task-icon completed" />;
        }
        return <FaCheckCircle className="task-icon" />;
    }
  };
  

  

  
  // Helper function to check if a resource is a YouTube video
  const isYouTubeVideo = (resource) => {
    const type = resource.type;
    const url = resource.url;
    
    // Check for video type or YouTube URL patterns
    return (type && type.toLowerCase() === 'video') || 
      (url && (
        url.includes('youtube.com/watch') ||
        url.includes('youtu.be/') ||
        url.includes('youtube.com/embed') ||
        url.includes('youtube.com/v/')
      ));
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
                <li key={index} className="learning__resource-item">
                  <div className="learning__resource-content">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.title}
                    </a>
                    {resource.description && (
                      <p className="resource-description">{resource.description}</p>
                    )}
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
      // Reset the analysis results
      setAnalysisResults(null);
      setShowAnalysisModal(false);
      
      // Update the current task index
      setCurrentTaskIndex(newIndex);
      
      // Update the URL to reflect the current task
      const newTaskId = tasks[newIndex].id;
      
      // Preserve the dayId parameter if it exists
      const params = new URLSearchParams(location.search);
      params.set('taskId', newTaskId);
      
      // Update the URL without reloading the page
      navigate(`/learning?${params.toString()}`, { replace: true });
      
      // Handle different task types
      const currentTask = tasks[newIndex];
      
      if (!currentTask.feedback_slot) {
        // IMPORTANT: Immediately clear previous messages and show loading state
        // This prevents the previous task's messages from showing while loading
        setMessages([{
          id: 'loading',
          content: `Loading ${currentTask.title}...`,
          role: 'system'
        }]);
        setIsMessagesLoading(true);
        
        // Then fetch the messages for the new task
        fetchTaskMessages(newTaskId);
        
        // Check if current task can be analyzed and if there's an existing analysis
        if (tasks[newIndex].should_analyze) {
          fetchTaskAnalysis(newTaskId);
        }
      } else {
        // For feedback tasks, clear messages and loading state
        setMessages([]);
        setIsMessagesLoading(false);
      }
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
        
        // Show success message with SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Deliverable submitted successfully!',
          confirmButtonColor: '#667eea',
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#4caf50'
        });
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

  // NEW: Handle deliverable panel submission
  const handleDeliverablePanelSubmit = async (submissionData) => {
    if (!currentDeliverableTask) return;
    
    try {
      // Determine content format based on deliverable type
      let content;
      if (typeof submissionData === 'object' && submissionData !== null) {
        // Structured submission - stringify the object
        content = JSON.stringify(submissionData);
      } else {
        // Plain text/url submission
        content = submissionData;
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
      
      if (response.ok) {
        // Close the panel on success
        setShowDeliverablePanel(false);
        setCurrentDeliverableTask(null);
        
        // Refresh submission data
        await fetchTaskSubmission(currentDeliverableTask.id);
        
        // Show success message with SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Deliverable submitted successfully!',
          confirmButtonColor: '#667eea',
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#4caf50',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit deliverable');
      }
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      
      // Show error with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'An error occurred while submitting your deliverable',
        confirmButtonColor: '#667eea',
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#ef4444'
      });
      
      // Don't close panel on error - let user try again
    }
  };

  // Add message editing functions after the handleSendMessage function
  // Handle edit message button click
  const handleEditMessage = (message) => {
    console.log('Editing message with full data:', message);
    
    // Check if message has an actual server-assigned ID
    // Some messages might have been generated client-side and only have the timestamp ID
    const messageId = message.message_id || message.id;
    console.log('Message ID type:', typeof messageId, 'Value:', messageId);
    console.log('Message properties:', Object.keys(message).join(', '));
    
    // Debug: check if the message has the message_id property
    if (message.hasOwnProperty('message_id')) {
      console.log('Message has message_id property:', message.message_id);
    } else {
      console.log('Message does NOT have message_id property, using id:', message.id);
    }
    
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

  // Handle edit message form submission
  const handleUpdateMessage = async (messageId) => {
    if (!editMessageContent.trim() || isUpdating) return;
    
    console.log('Attempting to update message ID:', messageId, 'Type:', typeof messageId);
    setIsUpdating(true);
    
    try {
      // Convert messageId to string to ensure consistent handling
      const messageIdStr = String(messageId);
      
      // First, verify the message ID with the server
      console.log(`Verifying message ID before update: ${messageIdStr}`);
      const verifiedId = await verifyMessageId(messageIdStr);
      
      // Use the verified ID if available, otherwise use the original ID
      const finalMessageId = verifiedId || messageIdStr;
      console.log(`Using ID for update: ${finalMessageId} (verified: ${Boolean(verifiedId)})`);
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/learning/messages/${finalMessageId}`;
      console.log('Sending PUT request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editMessageContent
        })
      });
      
      console.log('PUT response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.error || 'Failed to update message');
      }
      
      const updatedMessage = await response.json();
      console.log('Successfully updated message:', updatedMessage);
      
      // Update the message in the state
      // Use the ID returned from the server, not the one we sent
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
      
      // Show success notification
      setError('Message updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error updating message:', err);
      setError(`Failed to update message: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle cancel edit
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

  // Add a function to fetch a message by ID to verify we have the correct ID
  const verifyMessageId = async (messageId) => {
    try {
      console.log(`Verifying message ID: ${messageId}`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/${messageId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.log(`Message verification failed with status: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`Message verification result:`, data);
      return data.message_id;
    } catch (error) {
      console.error(`Error verifying message ID:`, error);
      return null;
    }
  };

  // Update fetchTaskAnalysis to handle specific analysis types
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
        return false;
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

  // Update handleAnalyzeTask to refresh available analyses
  const handleAnalyzeTask = async () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask.should_analyze) return;
    
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
      setError('Analysis completed successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      setAnalysisError(error.message);
      setError('Failed to analyze task: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update handleAnalyzeDeliverable to include proper error handling
  const handleAnalyzeDeliverable = async (url) => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    
    // Log debugging information
    console.log('handleAnalyzeDeliverable called with:', { 
      url,
      taskId: currentTask.id,
      analyze_deliverable: currentTask.analyze_deliverable || false
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
      setError('Deliverable analyzed successfully!');
      setTimeout(() => setError(''), 3000);
      
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

  // Handle switching between different analysis types
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

  // Add a function to fetch all available analyses for a task
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

  // Update useEffect to fetch analyses when the task changes
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

  // Update this function to organize analysis results by analysis type instead of submission ID
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

  // Add a function to fetch the most recent submission
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

  // Update this function to also fetch the submission when showing the modal
  const handleViewAnalysis = async () => {
    if (!tasks.length || currentTaskIndex >= tasks.length) return;
    
    const currentTask = tasks[currentTaskIndex];
    
    // Reset analysis results to avoid showing stale data
    setAnalysisResults(null);
    
    try {
      console.log(`Fetching analysis for task ${currentTask.id}`);
      
      // First, fetch all available analyses for this task
      const analyses = await fetchAvailableAnalyses(currentTask.id);
      console.log('Available analyses:', analyses);
      
      // Check if there are any available analyses
      if (!analyses || Object.keys(analyses).length === 0) {
        setError('No feedback available for this task yet.');
        return;
      }
      
      // Determine which analysis type to show
      let analysisTypeToShow = null;
      
      // If the task supports deliverable analysis, prioritize that
      if (currentTask.analyze_deliverable && analyses.deliverable) {
        analysisTypeToShow = 'deliverable';
      } 
      // Otherwise if the task supports conversation analysis, use that
      else if (currentTask.should_analyze && analyses.conversation) {
        analysisTypeToShow = 'conversation';
      }
      // If neither is explicitly set, use the first available type
      else if (Object.keys(analyses).length > 0) {
        analysisTypeToShow = Object.keys(analyses)[0];
      }
      
      if (!analysisTypeToShow) {
        setError('No analysis available for this task.');
        return;
      }
      
      // Fetch the task submission (for context only)
      await fetchTaskSubmission(currentTask.id);
      
      // Fetch the specific analysis
      const success = await fetchTaskAnalysis(currentTask.id, analysisTypeToShow);
      
      if (success) {
        // Show the modal with the fresh results
        setShowAnalysisModal(true);
      } else {
        setError('Failed to load feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleViewAnalysis:', error);
      setError('Failed to load feedback: ' + error.message);
    }
  };

  // Get a list of available analysis types
  const getAvailableAnalysisTypes = () => {
    if (!availableAnalyses) return [];
    return Object.keys(availableAnalyses);
  };

  // Add a historical notification banner at the top of the component render
  const renderHistoricalBanner = () => {
    if (!isActive) {
      return (
        <div className="learning__historical-banner">
          <p>You have historical access only. You can view your past content but cannot submit new work or generate new feedback.</p>
        </div>
      );
    }
    return null;
  };

  // Only show the full page loading state if we don't have tasks yet
  if (isPageLoading && tasks.length === 0) {
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
      {renderHistoricalBanner()}
      
      {/* Workshop Lock Banner */}
      {workshopInfo?.isLocked && (
        <div className="learning__workshop-banner">
          <div className="workshop-banner__icon">🔒</div>
          <div className="workshop-banner__content">
            <h3>Workshop Content Locked</h3>
            <p>
              Tasks will be available on{' '}
              <strong>
                {new Date(workshopInfo.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  timeZone: 'America/New_York'
                })}
              </strong>
              {workshopInfo.daysUntilStart > 0 && (
                <span> ({workshopInfo.daysUntilStart} {workshopInfo.daysUntilStart === 1 ? 'day' : 'days'} from now)</span>
              )}
            </p>
          </div>
        </div>
      )}
      
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
                  className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''} ${task.completed ? 'completed' : ''} ${workshopInfo?.isLocked ? 'locked' : ''}`}
                  data-mode={task.task_mode}
                  data-feedback-slot={task.feedback_slot}
                  onClick={() => {
                    // Prevent interaction if workshop is locked
                    if (workshopInfo?.isLocked) {
                      return;
                    }
                    if (index !== currentTaskIndex) {
                      // Update the current task index
                      setCurrentTaskIndex(index);
                      
                      // Only fetch messages for non-feedback tasks
                      if (!task.feedback_slot) {
                        // IMPORTANT: Immediately clear previous messages and show loading state
                        setMessages([{
                          id: 'loading',
                          content: `Loading ${task.title}...`,
                          role: 'system'
                        }]);
                        setIsMessagesLoading(true);
                        
                        console.log('Task should_analyze:', task.should_analyze);
                        fetchTaskMessages(task.id);
                      } else {
                        // Clear messages for feedback tasks
                        setMessages([]);
                        setIsMessagesLoading(false);
                      }
                    }
                  }}
                >
                  <div className="learning__task-icon">
                    {workshopInfo?.isLocked ? (
                      <FaLock className="task-icon task-icon--locked" />
                    ) : (
                      getTaskIcon(task.type, task.completed, task.task_mode, task.feedback_slot)
                    )}
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
        
        <div className={`learning__chat-container ${currentTaskIndex < tasks.length ? `learning__chat-container--${tasks[currentTaskIndex].task_mode}` : ''}`}>
          {showPeerFeedback ? (
            // Show the peer feedback form when needed
            <PeerFeedbackForm
              dayNumber={currentDay?.day_number}
              onComplete={handlePeerFeedbackComplete}
              onCancel={handlePeerFeedbackCancel}
            />
          ) : isCurrentTaskFeedbackSlot() ? (
            // Show the builder feedback form for feedback slot tasks
            <BuilderFeedbackForm
              taskId={tasks[currentTaskIndex].id}
              dayNumber={currentDay?.day_number}
              cohort={cohort}
              surveyType={tasks[currentTaskIndex].feedback_slot}
              onComplete={handleBuilderFeedbackComplete}
            />
          ) : (
            <div className="learning__chat-panel">
              {/* Display resources at the top of the chat panel */}
              {currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources && tasks[currentTaskIndex].resources.length > 0 && (
                <div className="learning__task-resources-container">
                  {renderTaskResources(tasks[currentTaskIndex].resources)}
                </div>
              )}
              

              
              <div className={`learning__messages ${isMessagesLoading && messages.length === 0 ? 'loading' : ''} ${editingMessageId !== null ? 'has-editing-message' : ''}`}>
                {isMessagesLoading && messages.length === 0 ? (
                  <div className="learning__loading-messages">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`learning__message learning__message--${message.role} ${String(editingMessageId) === String(message.id) ? 'editing' : ''}`}
                    >
                      <div 
                        className={`learning__message-content ${isMessagesLoading && message === messages[messages.length - 1] ? 'learning__message-content--loading' : ''} ${message.role === 'user' ? 'learning__message-content--editable' : ''}`}
                        onClick={message.role === 'user' && editingMessageId === null ? () => handleEditMessage(message) : undefined}
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
                ) : (
                  <div className="learning__message-note">
                    <p>The AI Coach will start the conversation based on your task. Ask questions or share your thoughts to continue the discussion.</p>
                  </div>
                )}
                
                {/* Show thinking indicator when AI is generating a response */}
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
                
                {/* Add a ref for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
              
              {tasks.length > 0 && currentTaskIndex < tasks.length && (
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
                  
                  {isIndependentRetroTask() && messages.length > 0 && !tasks[currentTaskIndex].completed ? (
                    peerFeedbackCompleted ? (
                      <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div>
                    ) : (
                      <button 
                        className="learning__feedback-btn"
                        onClick={() => setShowPeerFeedback(true)}
                      >
                        <FaUsers /> Provide Peer Feedback
                      </button>
                    )
                  ) : !isIndependentRetroTask() && (
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
              
              <form className="learning__input-form" onSubmit={handleSendMessage}>
                <textarea
                  ref={textareaRef}
                  className="learning__input"
                  value={newMessage}
                  onChange={handleTextareaChange}
                  placeholder={
                    workshopInfo?.isLocked ? "Workshop tasks locked until start date" :
                    !isActive ? "Historical view only" :
                    !hasInitialMessage ? "Loading task..." :
                    (isSending ? "Sending..." : "Type your message...")
                  }
                  disabled={workshopInfo?.isLocked || !isActive || !hasInitialMessage || isSending || isAiThinking}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !workshopInfo?.isLocked) {
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
                       tasks[currentTaskIndex].deliverable_type === 'file' ||
                       tasks[currentTaskIndex].deliverable_type === 'document' ||
                       tasks[currentTaskIndex].deliverable_type === 'video' ||
                       tasks[currentTaskIndex].deliverable_type === 'structured') && (
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
                        disabled={workshopInfo?.isLocked}
                      >
                        <FaLink />
                      </button>
                    );
                  })()}
                </div>
                <button 
                  className="learning__send-btn" 
                  type="submit" 
                  disabled={workshopInfo?.isLocked || !isActive || !hasInitialMessage || !newMessage.trim() || isSending || isAiThinking}
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
          )}
        </div>
      </div>
      
      {/* Submission Modal (OLD - keeping for backward compatibility) */}
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
                canAnalyzeDeliverable={true}
                onAnalyzeDeliverable={handleAnalyzeDeliverable}
              />
            </div>
          </div>
        </div>
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
          isLocked={workshopInfo?.isLocked || false}
        />
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
      

    </div>
  );
}

export default Learning;