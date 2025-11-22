import React, { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/animate-ui/components/radix/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchTasksWithFeedback, getTaskCompletionStatus, markFeedbackAsViewed } from '../../../utils/performanceInboxService';
import { createThread } from '../../../utils/api';

const FeedbackInbox = ({ userId, month, year, cohort }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // State for real task data
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState([]);

  // Load real task data
  useEffect(() => {
    const loadTasks = async () => {
      if (!token || !userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use provided month/year or current month
        const selectedMonth = month !== undefined ? month : new Date().getMonth();
        const selectedYear = year !== undefined ? year : new Date().getFullYear();
        const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        
        // Use provided cohort or user's cohort
        const userCohort = cohort || user?.cohort || 'September 2025';
        
        console.log('📊 Loading tasks for Performance Inbox...', { userId, month: monthStr, cohort: userCohort });
        
        const response = await fetchTasksWithFeedback(token, monthStr, userCohort, userId);
        
        if (response.success) {
          setTasksData(response.tasks || []);
          console.log('✅ Loaded', response.tasks?.length || 0, 'tasks with feedback data');
        } else {
          throw new Error(response.error || 'Failed to load tasks');
        }
        
      } catch (err) {
        console.error('❌ Error loading tasks:', err);
        setError(err.message);
        setTasksData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userId, token, month, year, cohort, user?.cohort]);

  // Filter tasks based on search and type
  const filteredTasks = useMemo(() => {
    return tasksData.filter(task => {
      const matchesSearch = !searchTerm || 
        task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.feedback?.content && task.feedback.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'All' || 
        (typeFilter === 'Complete' && task.has_submission) ||
        (typeFilter === 'Incomplete' && !task.has_submission) ||
        (typeFilter === 'With Feedback' && task.has_feedback);
      
      return matchesSearch && matchesType;
    });
  }, [tasksData, searchTerm, typeFilter]);

  const handleAccordionChange = (value) => {
    setExpandedItems(value);
    
    // Mark feedback as viewed for newly opened items
    value.forEach((taskIdStr) => {
      const taskId = parseInt(taskIdStr);
      const task = tasksData.find(t => t.task_id === taskId);
      if (task && task.has_feedback) {
        const status = getTaskCompletionStatus(task, userId);
        if (status === 'new-feedback') {
          markFeedbackAsViewed(userId, task.task_id);
          // Trigger a re-render by updating the task in state
          setTasksData(prevTasks => 
            prevTasks.map(t => 
              t.task_id === task.task_id 
                ? { ...t, _feedbackViewed: true }
                : t
            )
          );
        }
      }
    });
  };

  const handleIncompleteTaskNavigate = (task) => {
    // Navigate to Learning page with dayId and taskId
    if (task.day_id && task.task_id) {
      navigate(`/learning?dayId=${task.day_id}&taskId=${task.task_id}`);
    } else if (task.day_id) {
      navigate(`/learning?dayId=${task.day_id}`);
    } else {
      navigate('/learning');
    }
  };

  const handleImprovementClick = async (task, improvementArea) => {
    try {
      console.log('🎯 Improvement area clicked:', improvementArea, 'for task:', task.task_title);
      
      // Create a new GPT thread
      const threadData = await createThread(null, token);
      const newThread = threadData.thread || threadData.data || threadData;
      
      if (!newThread) {
        throw new Error('Failed to create thread');
      }
      
      const threadIdField = newThread.thread_id ? 'thread_id' : 'id';
      const newThreadId = newThread[threadIdField];
      
      // Build structured context message (similar to file/URL upload pattern)
      const feedbackContent = task.feedbackItems && task.feedbackItems.length > 0
        ? task.feedbackItems.map(fb => `${fb.type}: ${fb.content || 'No specific feedback'}`).join('\n')
        : task.feedback?.content || 'No specific feedback available';
      
      const contextMessage = `Task improvement session started\nTask: ${task.task_title}\nTask Description: ${task.task_description || 'No description available'}\nFeedback Received:\n${feedbackContent}\nFocus Area: ${improvementArea}`;
      
      // Send context as hidden system message
      const systemResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: contextMessage,
          threadId: newThreadId,
          messageType: 'system_content_summary'
        })
      });
      
      if (!systemResponse.ok) {
        const errorData = await systemResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${systemResponse.status}`);
      }
      
      // Navigate immediately to show loading state
      navigate(`/ai-chat?threadId=${newThreadId}&waitingForResponse=true`);
      
      // Send an initial user message to trigger AI response
      // The system message above provides context, and this will generate a helpful response
      const initialUserMessage = `Help me improve on ${improvementArea} from my work on "${task.task_title}".`;
      
      // Send user message (this will trigger AI response)
      const userMessageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: initialUserMessage,
          threadId: newThreadId
        })
      });
      
      if (!userMessageResponse.ok) {
        const errorData = await userMessageResponse.json().catch(() => ({}));
        console.warn('Failed to send initial message:', errorData);
        // Continue anyway - the system message is there and user can still interact
      }
      
    } catch (error) {
      console.error('❌ Error creating GPT thread:', error);
      const errorMessage = error.message || 'Failed to create improvement session. Please try again.';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
    } catch (error) {
      return '--';
    }
  };

  const getScoreColor = (score) => {
    // Always return blue for any score (matching the Figma design)
    return '#4285f4'; // Google blue - matches the image
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Work Product': return 'hsl(221 83% 53%)'; // blue
      case 'Comprehension': return 'hsl(271 81% 56%)'; // purple
      case 'Peer Feedback': return 'hsl(336 75% 40%)'; // pink
      default: return 'hsl(var(--muted))';
    }
  };

  const getCompletionCircle = (task) => {
    // Simplified completion logic: incomplete vs complete
    const isComplete = task.has_submission || task.has_feedback;
    
    if (isComplete) {
      // Purple filled circle for complete tasks
      return (
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: '#6B46C1' }}
          title="Complete"
        />
      );
    } else {
      // Pink outlined circle for incomplete tasks
      return (
        <div 
          className="w-3 h-3 rounded-full border-2"
          style={{ borderColor: '#EC4899' }}
          title="Incomplete"
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937]">Inbox</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#6B7280]">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937]">Inbox</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading tasks</p>
            <p className="text-[#6B7280] text-sm">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'var(--font-family-bold)' }}>Inbox</h2>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-7 border-[#E5E7EB] bg-white text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
              <SelectItem value="Incomplete">Incomplete</SelectItem>
              <SelectItem value="With Feedback">Feedback</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-3 w-3" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 border-[#E5E7EB] bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[60px_80px_1fr_70px_70px] gap-3 p-3 mb-1">
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Type</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Activity</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-center">Complete</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-center">Feedback</div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1 pb-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
            <p className="text-[#6B7280]">
              {tasksData.length === 0 
                ? "No task data available yet." 
                : "No tasks found for the selected filters."
              }
            </p>
            {tasksData.length === 0 && (
              <p className="text-xs text-[#9CA3AF]">
                Complete some assignments to see them here.
              </p>
            )}
          </div>
        ) : (
          <Accordion 
            type="multiple" 
            value={expandedItems.map(id => String(id))} 
            onValueChange={handleAccordionChange}
            className="space-y-1"
          >
            {filteredTasks.map((task) => (
              <AccordionItem 
                key={task.task_id} 
                value={String(task.task_id)}
                className="border-0"
              >
                <Card className="border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors bg-white rounded-[6px] mb-1">
                  <AccordionTrigger 
                    showArrow={false}
                    className="hover:no-underline [&>div]:w-full !py-0"
                  >
                    <div className="grid grid-cols-[60px_80px_1fr_70px_70px] gap-3 p-2 w-full items-center">
                      {/* Date */}
                      <div className="text-xs text-[#6B7280]">
                        {formatDate(task.day_date)}
                      </div>
                      
                      {/* Type */}
                      <div>
                        <Badge variant="outline" className="text-xs px-1 py-0" style={{ fontSize: '11px' }}>
                          {task.task_type || 'Task'}
                        </Badge>
                      </div>
                      
                      {/* Activity (Subject) */}
                      <div className="overflow-hidden">
                        <span className="text-sm text-[#1F2937] truncate block">{task.task_title}</span>
                      </div>
                      
                      {/* Complete */}
                      <div className="flex justify-center">
                        {getCompletionCircle(task)}
                      </div>
                      
                      {/* Feedback */}
                      <div className="flex justify-center">
                        {task.has_feedback ? (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: '#F59E0B' }}
                            title="Feedback available"
                          />
                        ) : (
                          <div className="w-3 h-3" /> // Empty space to maintain alignment
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-0">
                    <div className="border-t border-[#E5E7EB] p-3">
                    {task.has_feedback ? (
                      // Show feedback when available (regardless of submission status)
                      <div className="space-y-3">
                        {/* Positive Message */}
                        <div>
                          <h3 className="text-base font-semibold text-[#4242EA] mb-1">You're doing awesome!</h3>
                          <p className="text-[#6B7280] leading-relaxed text-sm">
                            {task.feedback?.content || 'Great work on this assignment. Keep up the excellent progress!'}
                          </p>
                        </div>

                        {/* Skills Tags */}
                        {task.feedback?.skills && task.feedback.skills.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-[#1F2937] mb-1">You did great with:</h4>
                            <div className="flex flex-wrap gap-1">
                              {task.feedback.skills.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0 text-xs px-2 py-0">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Improvement Areas */}
                        {task.feedback?.improvement_areas && task.feedback.improvement_areas.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-[#1F2937] mb-1">Let's work on:</h4>
                            <div className="flex flex-wrap gap-1">
                              {task.feedback.improvement_areas.slice(0, 3).map((area, idx) => (
                                <Badge 
                                  key={idx} 
                                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer border-0 text-xs px-2 py-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImprovementClick(task, area);
                                  }}
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB] text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncompleteTaskNavigate(task);
                            }}
                          >
                            Go to activity
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : task.has_submission ? (
                      // Submitted but no feedback yet
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-[#8B5CF6] mb-1">Submitted!</h3>
                          <p className="text-[#6B7280] leading-relaxed text-sm">
                            Great job submitting this assignment. Feedback will be available soon.
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Show incomplete message (no feedback and no submission)
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-[#EC4899] mb-1">This task needs your attention</h3>
                          <p className="text-[#6B7280] leading-relaxed text-sm">
                            You haven't completed this assignment yet.
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncompleteTaskNavigate(task);
                            }}
                          >
                            Complete this activity
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default FeedbackInbox;