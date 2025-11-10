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
  
  // New state for daily overview vs activity interface
  const [showDailyOverview, setShowDailyOverview] = useState(true);
  const [isDeliverableSidebarOpen, setIsDeliverableSidebarOpen] = useState(false);
  
  // Get dayId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const dayId = queryParams.get('dayId');
  const taskId = queryParams.get('taskId');
  const cohort = queryParams.get('cohort');
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
                    start_time: block.start_time,
                    end_time: block.end_time
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
    setIsAiThinking(true);
    
    try {
      // Check if there's existing conversation history
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${task.id}?dayNumber=${currentDay?.day_number}&cohort=${currentDay?.cohort}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
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
          setMessages(formattedMessages);
          setHasInitialMessage(true);
        } else {
          // No conversation yet - start it by calling /messages/start
          console.log('📝 No existing messages, starting new conversation');
          await startTaskConversation(task);
        }
      } else {
        console.error('❌ Failed to load task messages, status:', response.status);
        // Fallback to starting conversation
        await startTaskConversation(task);
      }
    } catch (error) {
      console.error('❌ Error loading task conversation:', error);
      // Fallback to starting conversation
      await startTaskConversation(task);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Start a new conversation by calling the backend
  const startTaskConversation = async (task) => {
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
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🚀 Started conversation:', data);
        
        // Add the first message from the assistant
        const firstMessage = {
          id: data.message_id,
          content: data.content,
          sender: 'ai',
          timestamp: data.timestamp,
        };
        setMessages([firstMessage]);
        setHasInitialMessage(true);
      } else {
        console.error('Failed to start conversation');
        // Fallback to loading intro locally (old behavior)
        await loadTaskIntro(task);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Fallback to loading intro locally (old behavior)
      await loadTaskIntro(task);
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
    setNewMessage('');
    
    const newTask = tasks[newTaskIndex];
    
    // Load conversation for the new task
    await loadTaskConversation(newTask);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || isAiThinking) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setIsAiThinking(true);
    setError('');

    try {
      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        content: messageContent,
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
          content: messageContent,
          taskId: tasks[currentTaskIndex]?.id,
          dayNumber: currentDay?.day_number,
          cohort: currentDay?.cohort,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          content: data.content || data.response || data.message,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };

  const handleDeliverableSubmit = async (deliverableData) => {
    try {
      // Submit deliverable logic here
      toast.success("Good job! You just submitted your deliverable.", {
        duration: 4000,
        action: {
          label: "Edit",
          onClick: () => setIsDeliverableSidebarOpen(true)
        }
      });
      setIsDeliverableSidebarOpen(false);
    } catch (error) {
      toast.error("Failed to submit deliverable. Please try again.");
    }
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
          <Button onClick={() => navigate('/dashboard')} className="bg-pursuit-purple hover:bg-pursuit-purple/90">
            Back to Dashboard
          </Button>
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
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div key={message.id || index} className="mb-6">
                  <div className="text-carbon-black leading-relaxed text-base">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isAiThinking && (
                <div className="mb-6">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              
              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input - Absolute positioned at bottom of chat interface, same container context */}
          <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <AutoExpandTextarea
                value={newMessage}
                onChange={setNewMessage}
                onSubmit={handleSendMessage}
                disabled={isSending || isAiThinking || !isActive}
                showAssignmentButton={tasks[currentTaskIndex]?.deliverable_type && tasks[currentTaskIndex]?.deliverable_type !== 'none'}
                onAssignmentClick={() => setIsDeliverableSidebarOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Deliverable Sidebar */}
        {tasks[currentTaskIndex] && (
          <DeliverablePanel
            task={tasks[currentTaskIndex]}
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
