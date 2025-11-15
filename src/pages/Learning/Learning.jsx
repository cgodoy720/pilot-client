import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaEdit, FaCheck, FaTimes, FaFileAlt, FaVideo, FaBrain, FaComments, FaClipboardList, FaLock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// New Components
import DailyOverview from '../../components/DailyOverview';
import ActivityHeader from '../../components/ActivityHeader';
import AutoExpandTextarea from '../../components/AutoExpandTextarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

// Existing Components
import PeerFeedbackForm from '../../components/PeerFeedbackForm';
import TaskSubmission from '../../components/TaskSubmission/TaskSubmission';
import AnalysisModal from '../../components/AnalysisModal/AnalysisModal';
import BuilderFeedbackForm from '../../components/BuilderFeedbackForm/BuilderFeedbackForm';
import DeliverablePanel from './components/DeliverablePanel/DeliverablePanel';
import TaskCompletionBar from '../../components/TaskCompletionBar/TaskCompletionBar';

import './Learning.css';
import '../../styles/smart-tasks.css';

function Learning() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);
  
  // Model selection state - matches AutoExpandTextarea default
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4.5');
  
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
  
  // New state for daily overview vs activity interface
  const [showDailyOverview, setShowDailyOverview] = useState(true);
  const [isDeliverableSidebarOpen, setIsDeliverableSidebarOpen] = useState(false);
  
  // Submission tracking state
  const [taskSubmissions, setTaskSubmissions] = useState({});
  // Format: { [taskId]: { id, content, created_at, updated_at } }
  
  // Task completion tracking state
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  
  // Get dayId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const dayId = queryParams.get('dayId');
  const taskId = queryParams.get('taskId');
  const cohort = queryParams.get('cohort');
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const sendMessageAbortControllerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Cleanup: abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (sendMessageAbortControllerRef.current) {
        sendMessageAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Load day and task data
  useEffect(() => {
    const loadDayData = async () => {
      try {
        setIsPageLoading(true);
        
        let endpoint;
        let data;
        
        if (dayId) {
          // Fetch day details
          endpoint = `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/full-details`;
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            console.error('Failed to load day data, response:', response.status);
            setError('Failed to load day data');
            return;
          }
          
          data = await response.json();
          
          // Also fetch user's task progress for this day
          const progressEndpoint = `${import.meta.env.VITE_API_URL}/api/progress/days/${dayId}/tasks`;
          const progressResponse = await fetch(progressEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            data.taskProgress = progressData || [];
          } else {
            data.taskProgress = [];
          }
        } else {
          // Use current day endpoint which already includes progress
          endpoint = `${import.meta.env.VITE_API_URL}/api/progress/current-day`;
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            console.error('Failed to load day data, response:', response.status);
            setError('Failed to load day data');
            return;
          }
          
          data = await response.json();
        }
        
        if (data) {
          console.log('Learning page data loaded:', data);
          console.log('Current day data:', data.day);
          console.log('Daily goal:', data.day?.daily_goal);
          
          // Process data like Dashboard does
          if (data.message === 'No schedule for today') {
            setCurrentDay(null);
            setTasks([]);
          } else {
            setCurrentDay(data.day || {});
            
            // Extract tasks from timeBlocks like Dashboard does
            const timeBlocks = data.timeBlocks || [];
            const allTasks = [];
            
            timeBlocks.forEach(block => {
              if (block.tasks) {
                block.tasks.forEach(task => {
                  allTasks.push({
                    id: task.id,
                    task_title: task.task_title,
                    task_description: task.task_description,
                    task_type: task.task_type,
                    duration_minutes: task.duration_minutes,
                    deliverable_type: task.deliverable_type,
                    deliverable: task.deliverable,
                    thread_id: task.thread_id,
                    intro: task.intro,
                    questions: task.questions,
                    conclusion: task.conclusion,
                    task_mode: task.task_mode,
                    conversation_model: task.conversation_model,
                    persona: task.persona,
                    start_time: block.start_time,
                    end_time: block.end_time,
                    category: block.block_category // Use block_category from backend
                  });
                });
              }
            });
            
            setTasks(allTasks);
            console.log('Processed tasks:', allTasks);
            
            // Handle taskId navigation
            if (taskId) {
              const taskIndex = allTasks.findIndex(t => t.id === parseInt(taskId));
              if (taskIndex !== -1) {
                setCurrentTaskIndex(taskIndex);
                setShowDailyOverview(false);
                
                // Load conversation for this task
                const task = allTasks[taskIndex];
                loadTaskConversation(task);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading day data:', error);
        setError('An error occurred loading the day');
      } finally {
        setIsPageLoading(false);
      }
    };

    if (token) {
      loadDayData();
    }
  }, [token, dayId, taskId]);

  // Helper function to load conversation for a task
  const loadTaskConversation = async (task) => {
    // Abort any pending conversation load request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Abort any pending message send request
    if (sendMessageAbortControllerRef.current) {
      sendMessageAbortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Clear messages immediately to prevent showing stale content
    setMessages([]);
    setIsAiThinking(true);
    
    // Reset task completion state when switching tasks
    setIsTaskComplete(false);
    
    try {
      // Fetch both conversation history and submission in parallel
      const [conversationResponse, submissionResponse] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${task.id}?dayNumber=${currentDay?.day_number}&cohort=${currentDay?.cohort}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: abortController.signal,
          }
        ),
        fetch(
          `${import.meta.env.VITE_API_URL}/api/submissions/${task.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: abortController.signal,
          }
        ).catch(() => null) // Don't fail if submission doesn't exist
      ]);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      // Handle submission data
      if (submissionResponse && submissionResponse.ok) {
        const submissionData = await submissionResponse.json();
        console.log(`📦 Loaded submission for task ${task.id}:`, submissionData);
        setTaskSubmissions(prev => ({
          ...prev,
          [task.id]: submissionData
        }));
      } else {
        // No submission exists yet - clear any old submission data
        setTaskSubmissions(prev => {
          const newSubmissions = { ...prev };
          delete newSubmissions[task.id];
          return newSubmissions;
        });
      }
      
      // Handle conversation data
      if (conversationResponse.ok) {
        const data = await conversationResponse.json();
        console.log(`📨 Loaded ${data.messages?.length || 0} messages for task ${task.id}:`, data.messages);
        
        if (data.messages && data.messages.length > 0) {
          // Has existing conversation - load it
          const formattedMessages = data.messages.map(msg => ({
            id: msg.message_id,
            content: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: msg.timestamp,
          }));
          console.log(`✅ Formatted ${formattedMessages.length} messages:`, formattedMessages);
          
          // Only set messages if this request wasn't aborted
          if (!abortController.signal.aborted) {
            setMessages(formattedMessages);
            setHasInitialMessage(true);
          }
        } else {
          // Empty messages array could mean:
          // 1. Thread exists but no messages (shouldn't happen, but possible)
          // 2. No thread exists yet
          // In BOTH cases, we should call /messages/start which will:
          // - Get or create a thread
          // - Only create the first message if none exists
          console.log('📝 No existing messages found, starting conversation');
          await startTaskConversation(task, abortController);
        }
      } else if (conversationResponse.status === 404) {
        // 404 means no thread exists - start new conversation
        console.log('📝 No thread exists, starting new conversation');
        await startTaskConversation(task, abortController);
      } else {
        console.error('❌ Failed to load task messages, status:', conversationResponse.status);
        // For other errors, try starting conversation as fallback
        await startTaskConversation(task, abortController);
      }
    } catch (error) {
      // Ignore abort errors - they're expected when switching tasks
      if (error.name === 'AbortError') {
        console.log('🚫 Request aborted - user switched tasks');
        return;
      }
      
      console.error('❌ Error loading task conversation:', error);
      // Fallback to starting conversation only if not aborted
      if (!abortController.signal.aborted) {
        await startTaskConversation(task, abortController);
      }
    } finally {
      // Only clear loading state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsAiThinking(false);
        // Check if task is complete after loading conversation
        checkTaskCompletion(task.id);
      }
    }
  };

  // Function to check if current task is complete
  const checkTaskCompletion = async (taskId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/learning/task-completion-status/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Task ${taskId} completion status:`, data);
        setIsTaskComplete(data.isComplete);
      }
    } catch (error) {
      console.error('Error checking task completion:', error);
    }
  };

  // Start a new conversation by calling the backend
  const startTaskConversation = async (task, abortController) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/learning/messages/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId: task.id,
            dayNumber: currentDay?.day_number,
            cohort: currentDay?.cohort,
            conversationModel: selectedModel,
          }),
          signal: abortController.signal,
        }
      );
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      // Handle 409 - conversation already exists
      if (response.status === 409) {
        const data = await response.json();
        console.log('⚠️ Conversation already started:', data.message);
        // The messages should have been loaded already, so just return
        // This prevents duplicate first messages
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('🚀 Started conversation:', data);
        
        // Only set messages if this request wasn't aborted
        if (!abortController.signal.aborted) {
          // Add the first message from the assistant
          const firstMessage = {
            id: data.message_id,
            content: data.content,
            sender: 'ai',
            timestamp: data.timestamp,
          };
          setMessages([firstMessage]);
          setHasInitialMessage(true);
        }
      } else {
        console.error('Failed to start conversation, status:', response.status);
        // Fallback to loading intro locally (old behavior)
        if (!abortController.signal.aborted) {
          await loadTaskIntro(task);
        }
      }
    } catch (error) {
      // Ignore abort errors - they're expected when switching tasks
      if (error.name === 'AbortError') {
        console.log('🚫 Start conversation request aborted');
        return;
      }
      
      console.error('Error starting conversation:', error);
      // Fallback to loading intro locally (old behavior)
      if (!abortController.signal.aborted) {
        await loadTaskIntro(task);
      }
    }
  };

  // New handler functions for redesigned interface
  const handleStartActivity = async (task) => {
    setShowDailyOverview(false);
    
    // Find the task index
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      setCurrentTaskIndex(taskIndex);
    }
    
    // Load conversation for this task
    await loadTaskConversation(task);
  };

  const loadTaskIntro = async (task) => {
    try {
      // Combine intro and first question into a single message
      let combinedContent = '';
      
      if (task.intro) {
        combinedContent = task.intro;
      }
      
      if (task.questions && task.questions.length > 0) {
        if (combinedContent) {
          combinedContent += '\n\n' + task.questions[0];
        } else {
          combinedContent = task.questions[0];
        }
      }
      
      if (combinedContent) {
        const message = {
          id: Date.now(),
          content: combinedContent,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages([message]);
      }
      
      setHasInitialMessage(true);
    } catch (error) {
      console.error('Error loading task intro:', error);
    }
  };

  const handleTaskChange = async (newTaskIndex) => {
    if (newTaskIndex === currentTaskIndex) return;
    
    setCurrentTaskIndex(newTaskIndex);
    
    const newTask = tasks[newTaskIndex];
    
    // Load conversation for the new task
    await loadTaskConversation(newTask);
  };

  const handleSendMessage = async (messageContent, modelFromTextarea) => {
    if (!messageContent || !messageContent.trim() || isSending || isAiThinking) return;
    
    const trimmedMessage = messageContent.trim();
    
    // Capture the current task ID at the time of sending
    // This ensures we validate against the correct task even if user switches
    const messageTaskId = tasks[currentTaskIndex]?.id;
    if (!messageTaskId) {
      console.error('No task ID available for message');
      return;
    }
    
    setIsSending(true);
    setIsAiThinking(true);
    setError('');
    
    // Update the selected model if it changed
    if (modelFromTextarea && modelFromTextarea !== selectedModel) {
      setSelectedModel(modelFromTextarea);
    }
    
    // Abort any previous message send request
    if (sendMessageAbortControllerRef.current) {
      sendMessageAbortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    sendMessageAbortControllerRef.current = abortController;

    try {
      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        content: trimmedMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to AI using correct backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedMessage,
          taskId: messageTaskId,
          dayNumber: currentDay?.day_number,
          cohort: currentDay?.cohort,
          conversationModel: modelFromTextarea || selectedModel,
        }),
        signal: abortController.signal,
      });
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        console.log('🚫 Message send aborted - user switched tasks');
        return;
      }
      
      // Verify we're still on the same task before adding the response
      if (tasks[currentTaskIndex]?.id !== messageTaskId) {
        console.log('⚠️ Task changed during message send - ignoring response');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          content: data.content || data.response || data.message,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        // Double-check we're still on the same task before adding AI response
        if (tasks[currentTaskIndex]?.id === messageTaskId && !abortController.signal.aborted) {
          setMessages(prev => [...prev, aiMessage]);
          // Check if task is now complete after receiving AI response
          checkTaskCompletion(messageTaskId);
        } else {
          console.log('⚠️ Task changed before AI response - ignoring message');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      // Ignore abort errors - they're expected when switching tasks
      if (error.name === 'AbortError') {
        console.log('🚫 Message send request aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again.');
    } finally {
      // Only clear loading state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsSending(false);
        setIsAiThinking(false);
      }
    }
  };

  const handleDeliverableSubmit = async (deliverableData) => {
    const currentTask = tasks[currentTaskIndex];
    
    if (!currentTask?.id) {
      toast.error("Unable to submit - task not found");
      return;
    }
    
    try {
      console.log('📤 Submitting deliverable for task:', currentTask.id, deliverableData);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: currentTask.id,
          content: deliverableData, // Backend expects plain string content
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit deliverable');
      }
      
      const submission = await response.json();
      console.log('✅ Submission successful:', submission);
      
      // Update local state with the submission
      setTaskSubmissions(prev => ({
        ...prev,
        [currentTask.id]: submission
      }));
      
      // Show success toast
      toast.success("Good job! You just submitted your deliverable.", {
        duration: 4000,
        action: {
          label: "Edit",
          onClick: () => setIsDeliverableSidebarOpen(true)
        }
      });
      
      // Keep sidebar open so user can see "Submitted" badge
      // setIsDeliverableSidebarOpen(false); // Commented out - keep open
      
      // NEW: Check if task is now complete (in case conclusion was already reached)
      console.log('🔍 Checking completion status after deliverable submission...');
      await checkTaskCompletion(currentTask.id);
      
    } catch (error) {
      console.error('❌ Error submitting deliverable:', error);
      toast.error(error.message || "Failed to submit deliverable. Please try again.");
    }
  };

  // Handler for Next Exercise button on completion bar
  const handleNextExercise = async () => {
    const currentTask = tasks[currentTaskIndex];
    
    if (!currentTask?.id) {
      toast.error("Unable to proceed - current task not found");
      return;
    }
    
    try {
      // Mark current task as complete
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/learning/complete-task/${currentTask.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: ''
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }
      
      console.log('✅ Task marked as complete');
      
      // Navigate to next task
      const nextTaskIndex = currentTaskIndex + 1;
      if (nextTaskIndex < tasks.length) {
        await handleTaskChange(nextTaskIndex);
      } else {
        toast.success("🎉 You've completed all exercises for today!");
      }
      
    } catch (error) {
      console.error('Error marking task complete:', error);
      toast.error("Failed to mark task complete. Please try again.");
    }
  };

  // Handler for AI Feedback button on completion bar
  const handleAiFeedback = () => {
    // TODO: Implement AI Feedback modal
    toast.info("AI Feedback feature coming soon!");
  };

  // Loading state
  if (isPageLoading) {
    return <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-carbon-black">Loading learning session...</h2>
      </div>
    </div>;
  }

  // Add a check for empty tasks
  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-carbon-black mb-4">No Activities Available</h2>
          <p className="text-gray-600 mb-2">There are no activities scheduled for today.</p>
          <p className="text-gray-600 mb-6">Check back tomorrow for your next scheduled activities.</p>
          <button
            onClick={() => navigate('/calendar')}
            className="relative px-8 py-3 rounded-lg bg-pursuit-purple text-white font-proxima font-semibold overflow-hidden group active:scale-95 transition-all duration-300 hover:shadow-[0_0_0_1px_#4242EA]"
          >
            <span className="relative z-10 group-hover:text-pursuit-purple transition-colors duration-300">
              View Calendar
            </span>
            <div 
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-bg-light"
            />
          </button>
        </div>
      </div>
    );
  }

  // Show daily overview first
  if (showDailyOverview) {
    return (
      <DailyOverview 
        currentDay={currentDay}
        tasks={tasks}
        onStartActivity={handleStartActivity}
      />
    );
  }

  return (
    <div className="learning h-screen bg-bg-light flex flex-col">
      {/* Activity Header */}
      <ActivityHeader 
        currentDay={currentDay}
        tasks={tasks}
        currentTaskIndex={currentTaskIndex}
        onTaskChange={handleTaskChange}
      />

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Messages Area - Scrollable with proper spacing */}
          <div className="flex-1 overflow-y-auto py-8 px-6" style={{ paddingBottom: '180px' }}>
            <div className="max-w-2xl mx-auto">
              {messages.map((message, index) => (
                <div key={message.id || index} className="mb-6">
                  {message.sender === 'user' ? (
                    // User message with avatar inside
                    <div className="bg-stardust rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-pursuit-purple text-sm font-proxima font-semibold">
                            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="flex-1 text-carbon-black leading-relaxed text-base font-proxima">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // AI/System message (no avatar)
                  <div className="text-carbon-black leading-relaxed text-base">
                    <ReactMarkdown
                      components={{
                        p: ({ node, children, ...props }) => (
                          <p className="mb-4" {...props}>{children}</p>
                        ),
                        h1: ({ node, children, ...props }) => (
                          <h1 className="text-xl font-semibold mt-6 mb-4 first:mt-0 text-carbon-black" {...props}>{children}</h1>
                        ),
                        h2: ({ node, children, ...props }) => (
                          <h2 className="text-lg font-semibold mt-5 mb-3 first:mt-0 text-carbon-black" {...props}>{children}</h2>
                        ),
                        h3: ({ node, children, ...props }) => (
                          <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0 text-carbon-black" {...props}>{children}</h3>
                        ),
                        ul: ({ node, children, ...props }) => (
                          <ul className="list-disc pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ul>
                        ),
                        ol: ({ node, children, ...props }) => (
                          <ol className="list-decimal pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ol>
                        ),
                        li: ({ node, children, ...props }) => (
                          <li className="text-carbon-black" {...props}>{children}</li>
                        ),
                        a: ({ node, children, ...props }) => (
                          <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          if (inline) {
                            return (
                              <code
                                className="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-200 text-carbon-black"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className="block" {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ node, children, ...props }) => (
                          <pre
                            className="p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono bg-gray-100 text-carbon-black"
                            {...props}
                          >
                            {children}
                          </pre>
                        ),
                        blockquote: ({ node, children, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700"
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                        strong: ({ node, children, ...props }) => (
                          <strong className="font-semibold text-carbon-black" {...props}>{children}</strong>
                        ),
                        em: ({ node, children, ...props }) => (
                          <em className="italic text-carbon-black" {...props}>{children}</em>
                        ),
                      }}
                    >
                      {(() => {
                        // Preprocess content to convert bullet points and URLs to markdown
                        let processedContent = message.content;
                        
                        // Step 0: Strip all ** (bold markdown) from the content BEFORE processing
                        // This prevents ** from appearing in link text or anywhere else
                        processedContent = processedContent.replace(/\*\*/g, '');
                        
                        // Step 1: Convert URLs to markdown links FIRST (before any text manipulation)
                        // Pattern: "Title (Type): Description URL" - structured resource links
                        processedContent = processedContent.replace(
                          /([A-Z][^\n(]+?)\s+\(([^)]+)\):\s+([^\n]+?)\s+(https?:\/\/[^\s\n]+)/g,
                          '[$1 ($2)]($4): $3'
                        );
                        
                        // Fallback: Convert any remaining bare URLs to clickable links
                        processedContent = processedContent.replace(
                          /(?<!\()(?<!]\()https?:\/\/[^\s)]+/g,
                          (url) => `[${url}](${url})`
                        );
                        
                        // Step 2: Handle inline "Resources:" section - convert to proper bulleted list
                        // Match "Resources: - Item1 - Item2" pattern and split into list
                        processedContent = processedContent.replace(
                          /Resources:\s*-\s*(.+?)(?=\n\n|$)/gis,
                          (match, resourcesText) => {
                            // Split by " - " pattern that precedes a markdown link [
                            const items = resourcesText.split(/\s+-\s+(?=\[)/);
                            
                            // Format each item as a bullet
                            const formattedItems = items
                              .map(item => item.trim())
                              .filter(item => item.length > 0)
                              .map(item => `- ${item}`)
                              .join('\n');
                            
                            return `**Resources:**\n\n${formattedItems}`;
                          }
                        );
                        
                        // Step 3: Convert bullet points to markdown (preserves links)
                        processedContent = processedContent.replace(/^•\s+/gm, '- ');
                        processedContent = processedContent.replace(/\n•\s+/g, '\n- ');
                        
                        // Step 4: Convert numbered lists
                        processedContent = processedContent.replace(/^(\d+)\.\s+/gm, '$1. ');
                        
                        // Step 5: Format section headers (exclude Resources: which is already bold)
                        processedContent = processedContent.replace(
                          /\n\n(?!\*\*Resources:\*\*)([A-Z][^:\n]+:)(?!\s*\n\n-)/g,
                          '\n\n## $1'
                        );
                        
                        return processedContent;
                      })()}
                    </ReactMarkdown>
                  </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isAiThinking && (
                <div className="mb-6">
                  <img 
                    src="/preloader.gif" 
                    alt="Loading..." 
                    className="w-8 h-8"
                  />
                </div>
              )}
              
              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input OR Task Completion Bar - Absolute positioned at bottom */}
          <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              {isTaskComplete ? (
                <TaskCompletionBar
                  onNextExercise={handleNextExercise}
                  onAiFeedback={handleAiFeedback}
                  isLastTask={currentTaskIndex === tasks.length - 1}
                />
              ) : (
              <AutoExpandTextarea
                onSubmit={handleSendMessage}
                disabled={isSending || isAiThinking || !isActive}
                showAssignmentButton={['video', 'document', 'link', 'structured'].includes(tasks[currentTaskIndex]?.deliverable_type)}
                onAssignmentClick={() => setIsDeliverableSidebarOpen(true)}
                showLlmDropdown={tasks[currentTaskIndex]?.task_mode === 'conversation'}
              />
              )}
            </div>
          </div>
        </div>

        {/* Deliverable Sidebar */}
        {tasks[currentTaskIndex] && (
          <DeliverablePanel
            task={tasks[currentTaskIndex]}
            currentSubmission={taskSubmissions[tasks[currentTaskIndex].id]}
            isOpen={isDeliverableSidebarOpen}
            onClose={() => setIsDeliverableSidebarOpen(false)}
            onSubmit={handleDeliverableSubmit}
          />
        )}
      </div>

      {/* Workshop Lock Banner */}
      {workshopInfo?.isLocked && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-bold text-yellow-800">Workshop Content Locked</h3>
              <p className="text-yellow-700">
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
        </div>
      )}
    </div>
  );
}

export default Learning;
