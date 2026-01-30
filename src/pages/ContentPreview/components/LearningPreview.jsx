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

import '../../Learning/Learning.css';

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
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const sendMessageAbortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        `${API_URL}/api/learning/task-messages/${task.id}?dayNumber=${currentDay?.day_number}&cohort=${encodeURIComponent(cohort)}`,
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
    if (!messageContent?.trim() || isSending || isAiThinking) return;
    
    const trimmedMessage = messageContent.trim();
    const messageTaskId = tasks[currentTaskIndex]?.id;
    if (!messageTaskId) return;
    
    setIsSending(true);
    setIsAiThinking(true);
    
    if (modelFromTextarea && modelFromTextarea !== selectedModel) {
      setSelectedModel(modelFromTextarea);
    }
    
    if (sendMessageAbortControllerRef.current) {
      sendMessageAbortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    sendMessageAbortControllerRef.current = abortController;

    try {
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: trimmedMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
      }]);

      const response = await fetch(`${API_URL}/api/learning/messages/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedMessage,
          taskId: messageTaskId,
          dayNumber: currentDay?.day_number,
          cohort: cohort,
          conversationModel: modelFromTextarea || selectedModel,
          isPreviewMode: true, // Mark as preview mode for ContentPreview
        }),
        signal: abortController.signal,
      });
      
      if (abortController.signal.aborted) return;
      if (tasks[currentTaskIndex]?.id !== messageTaskId) return;

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: data.content || data.response || data.message,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        }]);
        // Check if task is now complete after receiving AI response
        checkTaskCompletion(messageTaskId);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error sending message:', err);
    } finally {
      if (!abortController.signal.aborted) {
        setIsSending(false);
        setIsAiThinking(false);
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
    const nextTaskIndex = currentTaskIndex + 1;
    if (nextTaskIndex < tasks.length) {
      await handleTaskChange(nextTaskIndex);
    } else {
      toast.success("🎉 You've completed all exercises!");
    }
  };

  // Handle assessment completion (preview mode - local state only)
  const handleAssessmentComplete = async () => {
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask?.id) return;
    
    // Update local state only (no API call in preview mode)
    setIsTaskComplete(true);
    setTaskCompletionMap(prev => ({
      ...prev,
      [currentTask.id]: { isComplete: true, reason: 'Assessment completed' }
    }));
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

        <div className="flex-1 flex overflow-hidden relative">
          {isCurrentTaskSurvey() ? (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <SurveyInterface
                taskId={tasks[currentTaskIndex]?.id}
                dayNumber={currentDay?.day_number}
                cohort={cohort}
                surveyType={tasks[currentTaskIndex]?.feedback_slot}
                onComplete={() => {}}
                isCompleted={false}
                isLastTask={currentTaskIndex === tasks.length - 1}
                isPreviewMode={true}
              />
            </div>
          ) : isCurrentTaskAssessment() ? (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <AssessmentInterface
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
                className="flex-1 overflow-y-auto py-8 px-6" 
                style={{ paddingBottom: `${inputTrayHeight}px` }}
              >
                <div className="max-w-2xl mx-auto">
                  {messages.map((message, index) => (
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
                      ) : (
                        <div className="text-carbon-black leading-relaxed">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isAiThinking && (
                    <div className="mb-6">
                      <img src="/preloader.gif" alt="Loading..." className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                  {(isTaskComplete || taskCompletionMap[tasks[currentTaskIndex]?.id]?.isComplete) ? (
                    <TaskCompletionBar onNextExercise={handleNextExercise} />
                  ) : (
                    <AutoExpandTextarea
                      ref={textareaRef}
                      onSubmit={handleSendMessage}
                      disabled={isSending || isAiThinking}
                      showAssignmentButton={['video', 'document', 'link', 'structured'].includes(tasks[currentTaskIndex]?.deliverable_type)}
                      onAssignmentClick={() => setIsDeliverableSidebarOpen(true)}
                      showPeerFeedbackButton={isRetrospectiveTask()}
                      onPeerFeedbackClick={() => setIsPeerFeedbackSheetOpen(true)}
                      showLlmDropdown={tasks[currentTaskIndex]?.task_mode === 'conversation'}
                      onHeightChange={setInputTrayHeight}
                    />
                  )}
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
