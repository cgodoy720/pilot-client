import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

// Components
import DailyOverview from '../../../components/DailyOverview';
import ActivityHeader from '../../../components/ActivityHeader';
import AutoExpandTextarea from '../../../components/AutoExpandTextarea';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

import PeerFeedbackSheet from '../../../components/PeerFeedbackSheet';
import SurveyInterface from '../../../components/SurveyInterface/SurveyInterface';
import AssessmentInterface from '../../../components/AssessmentInterface/AssessmentInterface';
import BreakInterface from '../../../components/BreakInterface/BreakInterface';
import DeliverablePanel from '../../Learning/components/DeliverablePanel/DeliverablePanel';
import TaskCompletionBar from '../../../components/TaskCompletionBar/TaskCompletionBar';
import LoadingCurtain from '../../../components/LoadingCurtain/LoadingCurtain';
import { streamLearningMessage } from '../../../utils/api';
import { createStreamBuffer } from '../../../utils/streamBufferUtils';

import '../../Learning/Learning.css';
import { useStreamingText } from '../../../hooks/useStreamingText';

// Component that wraps ReactMarkdown with streaming text support
// Uses useStreamingText to smooth out bursty SSE chunks into natural typing flow
const StreamingMarkdownMessage = ({ content, animateOnMount = false }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const effectiveContent = animateOnMount && !hasMounted ? '' : (content || '');
  const displayedContent = useStreamingText(effectiveContent);
  
  // Preprocess content to convert bullet points and URLs to markdown
  let processedContent = displayedContent;

  // Safety-net: never render completion control markers in UI.
  // Backend should already strip these, but this protects against edge cases.
  processedContent = processedContent.replace(/\[TASK(?:_| )COMPLETE\]/gi, '').trim();
  
  // Step 0: Convert URLs to markdown links FIRST
  processedContent = processedContent.replace(
    /([A-Z][^\n(]+?)\s+\(([^)]+)\):\s+([^\n]+?)\s+(https?:\/\/[^\s\n]+)/g,
    '[$1 ($2)]($4): $3'
  );
  
  // Fallback: Convert any remaining bare URLs to clickable links
  processedContent = processedContent.replace(
    /(?<!\()(?<!]\()https?:\/\/[^\s)]+/g,
    (url) => `[${url}](${url})`
  );
  
  // Step 1: Handle inline "Resources:" section
  processedContent = processedContent.replace(
    /Resources:\s*-\s*(.+?)(?=\n\n|$)/gis,
    (match, resourcesText) => {
      const items = resourcesText.split(/\s+-\s+(?=\[)/);
      const formattedItems = items
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => `- ${item}`)
        .join('\n');
      return `**Resources:**\n\n${formattedItems}`;
    }
  );
  
  // Step 2: Convert bullet points to markdown
  processedContent = processedContent.replace(/^•\s+/gm, '- ');
  processedContent = processedContent.replace(/\n•\s+/g, '\n- ');
  
  // Step 3: Convert numbered lists
  processedContent = processedContent.replace(/^(\d+)\.\s+/gm, '$1. ');
  
  // Step 4: Format section headers
  processedContent = processedContent.replace(
    /\n\n(?!\*\*Resources:\*\*)([A-Z][^:\n]+:)(?!\s*\n\n-)/g,
    '\n\n## $1'
  );
  
  return (
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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * LearningPreview - Renders the Learning experience for a specific day/cohort
 * Used by ContentPreview to show interactive mode without the app Layout
 */
function LearningPreview({ dayId, cohort, onBack }) {
  const { token, user } = useAuth();
  
  // State
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4.5');
  
  // Day/Task state
  const [currentDay, setCurrentDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  
  // UI state
  const [showDailyOverview, setShowDailyOverview] = useState(true);
  const [isDeliverableSidebarOpen, setIsDeliverableSidebarOpen] = useState(false);
  const [isAssessmentPanelOpen, setIsAssessmentPanelOpen] = useState(false);
  const [currentAssessmentType, setCurrentAssessmentType] = useState(null);
  const [isPeerFeedbackSheetOpen, setIsPeerFeedbackSheetOpen] = useState(false);
  
  // Submissions
  const [taskSubmissions, setTaskSubmissions] = useState({});
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [taskCompletionMap, setTaskCompletionMap] = useState({});
  
  const [inputTrayHeight, setInputTrayHeight] = useState(180);
  const handleInputTrayHeightChange = useCallback((height) => {
    setInputTrayHeight(height);
  }, []);
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const sendMessageAbortControllerRef = useRef(null);
  const textareaRef = useRef(null);
  const chatTrayRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  // Track chat tray height changes for dynamic message padding
  useEffect(() => {
    if (!chatTrayRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        setInputTrayHeight(height + 24); // 24px for bottom-6 spacing
      }
    });

    resizeObserver.observe(chatTrayRef.current);

    // Initial height notification
    const initialHeight = chatTrayRef.current.getBoundingClientRect().height;
    setInputTrayHeight(initialHeight + 24);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentTaskIndex, isTaskComplete, taskCompletionMap]);

  // Auto-scroll to bottom only when message count changes (matches Learning.jsx)
  useEffect(() => {
    if (messages.length !== prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Auto-focus input when initial message loads
  useEffect(() => {
    if (hasInitialMessage && textareaRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 200);
    }
  }, [hasInitialMessage]);

  // Auto-focus input when AI response arrives
  useEffect(() => {
    if (messages.length > 0 && !isAiThinking && !isSending && !isStreaming) {
      const lastMessage = messages[messages.length - 1];
      // Focus when last message is from AI and input is not disabled
      if (lastMessage.sender === 'ai' && textareaRef.current) {
        // Small delay to ensure DOM is ready and user can see the response
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 300);
      }
    }
  }, [messages, isAiThinking, isSending, isStreaming]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (sendMessageAbortControllerRef.current) sendMessageAbortControllerRef.current.abort();
    };
  }, []);

  // Load day data using provided dayId and cohort
  useEffect(() => {
    const loadDayData = async () => {
      if (!dayId || !cohort) {
        setError('Day ID and cohort are required');
        setIsPageLoading(false);
        return;
      }

      try {
        setIsPageLoading(true);
        
        const response = await fetch(
          `${API_URL}/api/curriculum/days/${dayId}/full-details?cohort=${encodeURIComponent(cohort)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!response.ok) {
          setError('Failed to load day data');
          return;
        }
        
        const data = await response.json();
        
        if (data) {
          setCurrentDay(data.day || {});
          
          // Extract tasks from timeBlocks
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
                  deliverable_schema: task.deliverable_schema,
                  thread_id: task.thread_id,
                  intro: task.intro,
                  questions: task.questions,
                  conclusion: task.conclusion,
                  task_mode: task.task_mode,
                  conversation_model: task.conversation_model,
                  persona: task.persona,
                  feedback_slot: task.feedback_slot,
                  assessment_id: task.assessment_id,
                  start_time: block.start_time,
                  end_time: block.end_time,
                  category: block.block_category
                });
              });
            }
          });
          
          setTasks(allTasks);
          
          // Fetch completion status for all tasks on this day (for DailyOverview checkmarks)
          if (allTasks.length > 0) {
            fetchTaskCompletionStatus(allTasks.map(t => t.id));
          }
        }
      } catch (err) {
        console.error('Error loading day data:', err);
        setError('An error occurred loading the day');
      } finally {
        setIsPageLoading(false);
      }
    };

    if (token && dayId && cohort) {
      loadDayData();
    }
  }, [token, dayId, cohort]);

  // Fetch batch completion status for DailyOverview checkmarks (preview-isolated)
  const fetchTaskCompletionStatus = async (taskIds) => {
    if (!taskIds || taskIds.length === 0) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/learning/batch-completion-status?taskIds=${taskIds.join(',')}&isPreviewMode=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTaskCompletionMap(data.completionStatus);
      }
    } catch (error) {
      console.error('Error fetching batch completion status:', error);
    }
  };

  // Load task conversation
  const loadTaskConversation = async (task) => {
    const validSurveyTypes = ['weekly', 'l1_final', 'end_of_l1', 'mid_program', 'final'];
    const isTaskSurvey = task?.feedback_slot && validSurveyTypes.includes(task.feedback_slot);
    
    if (isTaskSurvey || task?.task_type === 'assessment' || task?.task_type === 'break') {
      setIsAiThinking(false);
      return;
    }
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (sendMessageAbortControllerRef.current) sendMessageAbortControllerRef.current.abort();
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setMessages([]);
    setIsAiThinking(true);
    setIsTaskComplete(false);
    
    try {
      const response = await fetch(
        `${API_URL}/api/learning/task-messages/${task.id}?dayNumber=${currentDay?.day_number}&cohort=${encodeURIComponent(cohort)}&isPreviewMode=true`,
        { headers: { Authorization: `Bearer ${token}` }, signal: abortController.signal }
      );
      
      if (abortController.signal.aborted) return;
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map(msg => ({
            id: msg.message_id,
            content: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: msg.timestamp,
          }));
          setMessages(formattedMessages);
          setHasInitialMessage(true);
        } else {
          await startTaskConversation(task, abortController);
        }
      } else {
        await startTaskConversation(task, abortController);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error loading conversation:', err);
      await startTaskConversation(task, abortController);
    } finally {
      if (!abortController.signal.aborted) {
        setIsAiThinking(false);
        // Keep preview completion status in sync after loading a task conversation
        checkTaskCompletion(task.id);
      }
    }
  };

  const startTaskConversation = async (task, abortController) => {
    try {
      const response = await fetch(`${API_URL}/api/learning/messages/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: task.id,
          dayNumber: currentDay?.day_number,
          cohort: cohort,
          conversationModel: selectedModel,
          isPreviewMode: true, // Mark as preview mode for ContentPreview
        }),
        signal: abortController.signal,
      });
      
      if (abortController.signal.aborted) return;
      if (response.status === 409) return;

      if (response.ok) {
        const data = await response.json();
        setMessages([{
          id: data.message_id,
          content: data.content,
          sender: 'ai',
          timestamp: data.timestamp,
          shouldAnimate: true,
        }]);
        setHasInitialMessage(true);
      } else {
        // Fallback to intro
        if (task.intro) {
          setMessages([{
            id: Date.now(),
            content: task.intro,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            shouldAnimate: true,
          }]);
          setHasInitialMessage(true);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error starting conversation:', err);
    }
  };

  // Check if current task is complete (mirrors Learning.jsx)
  const checkTaskCompletion = async (taskId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/learning/task-completion-status/${taskId}?isPreviewMode=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Preview task ${taskId} completion status:`, data);
        setIsTaskComplete(data.isComplete);
        if (data.isComplete) {
          setTaskCompletionMap(prev => ({
            ...prev,
            [taskId]: { isComplete: true, reason: data.reason }
          }));
        }
      }
    } catch (error) {
      console.error('Error checking task completion:', error);
    }
  };

  const handleStartActivity = async (task) => {
    setShowDailyOverview(false);
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) setCurrentTaskIndex(taskIndex);
    
    if (task?.task_type !== 'assessment') {
      await loadTaskConversation(task);
    }
  };

  const handleTaskChange = async (newTaskIndex) => {
    if (newTaskIndex === currentTaskIndex) return;
    setIsTaskComplete(false);
    setCurrentTaskIndex(newTaskIndex);
    
    const newTask = tasks[newTaskIndex];
    if (newTask?.task_type !== 'assessment') {
      await loadTaskConversation(newTask);
    }
  };

  const handleSendMessage = async (messageContent, modelFromTextarea) => {
    if (!messageContent?.trim() || isSending || isAiThinking || isStreaming) return;
    
    const trimmedMessage = messageContent.trim();
    const messageTaskId = tasks[currentTaskIndex]?.id;
    if (!messageTaskId) return;
    
    setIsSending(true);
    setIsAiThinking(true);
    setIsStreaming(true);
    
    if (modelFromTextarea && modelFromTextarea !== selectedModel) {
      setSelectedModel(modelFromTextarea);
    }
    
    if (sendMessageAbortControllerRef.current) {
      sendMessageAbortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    sendMessageAbortControllerRef.current = abortController;

    try {
      let receivedChunk = false;
      const streamingMessageId = Date.now() + 1;
      const streamBuffer = createStreamBuffer();
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          content: trimmedMessage,
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
        {
          id: streamingMessageId,
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isStreaming: true
        }
      ]);

      await streamLearningMessage(
        trimmedMessage,
        messageTaskId,
        token,
        {
          dayNumber: currentDay?.day_number,
          cohort: cohort,
          conversationModel: modelFromTextarea || selectedModel,
          isPreviewMode: true
        },
        (chunk) => {
          if (tasks[currentTaskIndex]?.id !== messageTaskId) {
            return;
          }

          if (chunk.type === 'text') {
            receivedChunk = true;
            const safeText = streamBuffer.append(chunk.content);
            if (safeText) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? { ...msg, content: `${msg.content || ''}${safeText}` }
                    : msg
                )
              );
            }
          } else if (chunk.type === 'done' && chunk.message) {
            receivedChunk = true;
            // Flush any remaining buffered text before final replace
            const remaining = streamBuffer.flush();
            if (remaining) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamingMessageId
                    ? { ...msg, content: `${msg.content || ''}${remaining}` }
                    : msg
                )
              );
            }
            // Enable input immediately
            setIsStreaming(false);
            setIsAiThinking(false);
            setIsSending(false);
            checkTaskCompletion(messageTaskId);

            const finalMessage = chunk.message;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === streamingMessageId
                  ? {
                      ...msg,
                      content: finalMessage.content,
                      sender: 'ai',
                      timestamp: finalMessage.timestamp,
                      isStreaming: false
                    }
                  : msg
              )
            );
          } else if (chunk.type === 'error') {
            setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
            setIsStreaming(false);
            setIsAiThinking(false);
            setIsSending(false);
          }
        },
        abortController.signal
      );

      // Fallback: if streaming completed but no chunks were received, re-fetch all messages
      if (!receivedChunk && !abortController.signal.aborted && tasks[currentTaskIndex]?.id === messageTaskId) {
        const fallbackResponse = await fetch(
          `${API_URL}/api/learning/task-messages/${messageTaskId}?dayNumber=${currentDay?.day_number}&cohort=${encodeURIComponent(cohort)}&isPreviewMode=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortController.signal,
          }
        );
        
        if (fallbackResponse.ok && !abortController.signal.aborted) {
          const fallbackData = await fallbackResponse.json();
          const fallbackMessages = (fallbackData.messages || []).map(msg => ({
            id: msg.message_id,
            content: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: msg.timestamp,
          }));
          setMessages(fallbackMessages);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error sending message:', err);
    } finally {
      if (!abortController.signal.aborted) {
        setIsSending(false);
        setIsAiThinking(false);
        setIsStreaming(false);
      }
    }
  };

  const handleDeliverableSubmit = async (deliverableData) => {
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask?.id) {
      toast.error("Task not found");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId: currentTask.id, content: deliverableData }),
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      const submission = await response.json();
      setTaskSubmissions(prev => ({ ...prev, [currentTask.id]: submission }));
      toast.success("Deliverable submitted!");
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error("Failed to submit");
    }
  };

  const handleNextExercise = async () => {
    const currentTask = tasks[currentTaskIndex];
    const isLastTask = currentTaskIndex === tasks.length - 1;

    if (!currentTask?.id) {
      toast.error("Unable to proceed - current task not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/learning/complete-task/${currentTask.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: '',
            isPreviewMode: true
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }

      if (isLastTask) {
        toast.success("🎉 You've completed all exercises!");
      } else {
        await handleTaskChange(currentTaskIndex + 1);
      }
    } catch (error) {
      console.error('Error marking task complete in preview:', error);
      toast.error("Failed to mark task complete. Please try again.");
    }
  };

  const handleSurveyComplete = async () => {
    const currentTask = tasks[currentTaskIndex];
    const isLastTask = currentTaskIndex === tasks.length - 1;

    if (!currentTask?.id) {
      toast.error("Unable to proceed - current task not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/learning/complete-task/${currentTask.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: 'Survey completed',
            isPreviewMode: true
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }

      setTaskCompletionMap(prev => ({
        ...prev,
        [currentTask.id]: {
          ...prev[currentTask.id],
          isComplete: true,
          reason: 'Survey completed'
        }
      }));

      if (isLastTask) {
        setTimeout(() => {
          setShowDailyOverview(true);
        }, 2000);
      } else {
        setTimeout(async () => {
          await handleTaskChange(currentTaskIndex + 1);
        }, 2000);
      }
    } catch (error) {
      console.error('Error marking survey complete in preview:', error);
      toast.error("Failed to mark task complete. Please try again.");
    }
  };

  // Handle assessment completion
  const handleAssessmentComplete = async () => {
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask?.id) {
      toast.error("Unable to proceed - current task not found");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/learning/complete-task/${currentTask.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: 'Assessment completed',
            isPreviewMode: true
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }

      setIsTaskComplete(true);
      setTaskCompletionMap(prev => ({
        ...prev,
        [currentTask.id]: {
          ...prev[currentTask.id],
          isComplete: true,
          reason: 'Assessment completed'
        }
      }));

      await checkTaskCompletion(currentTask.id);
    } catch (error) {
      console.error('Error marking assessment complete in preview:', error);
      toast.error("Failed to mark task complete. Please try again.");
    }
  };

  // Task type checks
  const isCurrentTaskSurvey = () => {
    const task = tasks[currentTaskIndex];
    const validTypes = ['weekly', 'l1_final', 'end_of_l1', 'mid_program', 'final'];
    return task?.feedback_slot && validTypes.includes(task.feedback_slot);
  };

  const isCurrentTaskAssessment = () => tasks[currentTaskIndex]?.task_type === 'assessment';
  const isCurrentTaskBreak = () => tasks[currentTaskIndex]?.task_type === 'break';
  const isRetrospectiveTask = () => {
    const task = tasks[currentTaskIndex];
    return task?.task_title?.toLowerCase().includes('retro') || false;
  };

  // Daily Overview
  if (showDailyOverview) {
    return (
      <>
        <DailyOverview 
          currentDay={currentDay}
          tasks={tasks}
          taskCompletionMap={taskCompletionMap}
          isPastDay={false}
          onStartActivity={handleStartActivity}
          isPageLoading={isPageLoading}
          navigate={() => {}}
          isWorkshopParticipant={false}
        />
        <LoadingCurtain isLoading={isPageLoading} />
      </>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="h-full bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-carbon-black mb-4">No Activities</h2>
          <p className="text-gray-600 mb-6">There are no activities for this day.</p>
          <button onClick={onBack} className="px-6 py-2 rounded-lg bg-pursuit-purple text-white font-proxima">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="learning h-full bg-bg-light flex flex-col">
        <ActivityHeader 
          currentDay={currentDay}
          tasks={tasks}
          currentTaskIndex={currentTaskIndex}
          onTaskChange={handleTaskChange}
          isWorkshopParticipant={false}
        />

        <div className="flex-1 min-h-0 flex overflow-hidden relative">
          {isCurrentTaskSurvey() ? (
            <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
              <SurveyInterface
                taskId={tasks[currentTaskIndex]?.id}
                dayNumber={currentDay?.day_number}
                cohort={cohort}
                surveyType={tasks[currentTaskIndex]?.feedback_slot}
              onComplete={handleSurveyComplete}
              isCompleted={taskCompletionMap[tasks[currentTaskIndex]?.id]?.isComplete || false}
                isLastTask={currentTaskIndex === tasks.length - 1}
                isPreviewMode={true}
              />
            </div>
          ) : isCurrentTaskAssessment() ? (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <AssessmentInterface
                key={`assessment-${tasks[currentTaskIndex]?.id}`}
                taskId={tasks[currentTaskIndex]?.id}
                assessmentId={tasks[currentTaskIndex]?.assessment_id}
                dayNumber={currentDay?.day_number}
                cohort={cohort}
                onComplete={handleAssessmentComplete}
                isCompleted={taskCompletionMap[tasks[currentTaskIndex]?.id]?.isComplete || false}
                isLastTask={currentTaskIndex === tasks.length - 1}
                externalPanelOpen={isAssessmentPanelOpen}
                onExternalPanelOpenChange={setIsAssessmentPanelOpen}
                onAssessmentTypeLoaded={setCurrentAssessmentType}
                isPreviewMode={true}
              />
              
              {/* Assessment Task Completion Bar */}
              <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                  {(isTaskComplete || taskCompletionMap[tasks[currentTaskIndex]?.id]?.isComplete) && (
                    <TaskCompletionBar
                      onNextExercise={handleNextExercise}
                      isLastTask={currentTaskIndex === tasks.length - 1}
                      showViewSubmission={currentAssessmentType !== 'self'}
                      onViewSubmission={() => setIsAssessmentPanelOpen(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : isCurrentTaskBreak() ? (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <BreakInterface taskTitle={tasks[currentTaskIndex]?.task_title} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <div 
                className="flex-1 min-h-0 overflow-y-auto py-8 px-6" 
                style={{ paddingBottom: `${inputTrayHeight}px` }}
              >
                <div className="max-w-2xl mx-auto">
                  {messages.map((message, index) => {
                    const isStreamingMessage = message.isStreaming === true;
                    
                    return (
                      <div key={message.id || index} className="mb-6">
                        {message.sender === 'user' ? (
                          <div className="bg-stardust rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <span className="text-pursuit-purple text-sm font-semibold">
                                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 text-carbon-black">{message.content}</div>
                            </div>
                          </div>
                        ) : message.isStreaming && !message.content ? (
                          // Streaming AI message waiting for first chunk — show preloader inline
                          // Keeps preloader inside the same wrapper div so no layout shift when text arrives
                          <img src="/preloader.gif" alt="Loading..." className="w-8 h-8" />
                        ) : (
                          // AI message - StreamingMarkdownMessage handles both streaming and static
                          <StreamingMarkdownMessage
                            content={message.content}
                            animateOnMount={!!message.shouldAnimate}
                          />
                        )}
                      </div>
                    );
                  })}
                  
                  {isAiThinking && !isStreaming && (
                    <div className="mb-6">
                      <img src="/preloader.gif" alt="Loading..." className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                  <div ref={chatTrayRef}>
                  {(isTaskComplete || taskCompletionMap[tasks[currentTaskIndex]?.id]?.isComplete) ? (
                    <TaskCompletionBar onNextExercise={handleNextExercise} />
                  ) : (
                    <AutoExpandTextarea
                      ref={textareaRef}
                      onSubmit={handleSendMessage}
                      disabled={isSending || isAiThinking}
                      showAssignmentButton={['video', 'document', 'link', 'structured', 'image'].includes(tasks[currentTaskIndex]?.deliverable_type)}
                      onAssignmentClick={() => setIsDeliverableSidebarOpen(true)}
                      showPeerFeedbackButton={isRetrospectiveTask()}
                      onPeerFeedbackClick={() => setIsPeerFeedbackSheetOpen(true)}
                      showLlmDropdown={tasks[currentTaskIndex]?.task_mode === 'conversation'}
                      onHeightChange={handleInputTrayHeightChange}
                    />
                  )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tasks[currentTaskIndex] && !isCurrentTaskSurvey() && !isCurrentTaskAssessment() && !isCurrentTaskBreak() && (
            <DeliverablePanel
              task={tasks[currentTaskIndex]}
              currentSubmission={taskSubmissions[tasks[currentTaskIndex].id]}
              isOpen={isDeliverableSidebarOpen}
              onClose={() => setIsDeliverableSidebarOpen(false)}
              onSubmit={handleDeliverableSubmit}
            />
          )}

          {tasks[currentTaskIndex] && isRetrospectiveTask() && (
            <PeerFeedbackSheet
              isOpen={isPeerFeedbackSheetOpen}
              onClose={() => setIsPeerFeedbackSheetOpen(false)}
              dayNumber={currentDay?.day_number}
              cohort={cohort}
              token={token}
            />
          )}
        </div>
      </div>
      
      <LoadingCurtain isLoading={isPageLoading} />
    </>
  );
}

export default LearningPreview;
