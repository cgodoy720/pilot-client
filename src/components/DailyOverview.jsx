import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const DailyOverview = ({ currentDay, tasks, taskCompletionMap = {}, isPastDay = false, onStartActivity, isPageLoading = false, navigate, isWorkshopParticipant = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // If still loading, return null - LoadingCurtain handles the visual loading state
  if (isPageLoading) {
    return null;
  }
  
  // If loading is complete but there are no activities, show the "No Activities Available" message
  if (!currentDay || !tasks || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-carbon-black mb-4">No Activities Available</h2>
          <p className="text-gray-600 mb-2">There are no activities scheduled for today.</p>
          <p className="text-gray-600 mb-6">Check back tomorrow for your next scheduled activities.</p>
          {navigate && (
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
          )}
        </div>
      </div>
    );
  }
  
  // Helper function to check if a task is completed using the completion map
  const isTaskCompleted = (taskId) => {
    const completionStatus = taskCompletionMap[taskId];
    return completionStatus?.isComplete || false;
  };

  // Format date like ActivityHeader does
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: '2-digit' });
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${month}.${day} ${weekday}`;
  };

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    // Only group if task has a category
    if (task.category) {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
    }
    return acc;
  }, {});

  // Calculate total duration per category
  const getCategoryDuration = (categoryTasks) => {
    const totalMinutes = categoryTasks.reduce((sum, task) => sum + (task.duration_minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours} hrs`;
    return `${minutes} mins`;
  };

  return (
    <div className={`min-h-screen bg-bg-light flex flex-col transition-opacity duration-800 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Top Navigation Bar - Same height as Calendar/ActivityHeader */}
      <div className="h-[45px] bg-bg-light border-b border-divider flex items-center justify-between px-6">
        {/* Date with gradient text - matching ActivityHeader */}
        <h1 
          className="text-xl font-proxima font-normal"
          style={{
            background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {isWorkshopParticipant ? 'AI Native Workshop' : formatDate(currentDay.day_date)}
          </h1>
        </div>
        
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl">
          {/* Daily Goal Heading */}
          <div className="mb-6">
            <h2 className="text-[32px] leading-[38px] font-proxima font-normal text-carbon-black">
              {currentDay.daily_goal || 'Today, you\'re gonna be learning lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam a vestibulum justo.'}
            </h2>
          </div>
          
          {/* Description Paragraph (if exists) */}
          {currentDay.description && (
            <div className="mb-6">
              <p className="text-base leading-[24px] font-proxima font-normal text-carbon-black">
                {currentDay.description}
              </p>
            </div>
          )}

          {/* Activities Section */}
          <div className="mb-8">
            <h3 className="text-base leading-[18px] font-proxima font-bold text-carbon-black mb-3">
              Activities
            </h3>
            
            {/* Activities List - Circles aligned directly under header with dotted dividers */}
            <div className="mb-4">
            {tasks.map((task, index) => {
                const completionStatus = taskCompletionMap[task.id];
                const completed = completionStatus?.isComplete || false;
                const requiresDeliverable = completionStatus?.requiresDeliverable || false;
                const shouldAnalyze = completionStatus?.shouldAnalyze || false;
                const isBreakTask = task.task_type === 'break';
                
                return (
                <div key={task.id}>
                  <div className="flex items-start gap-2 py-2">
                    {/* Task Checkbox - Three states based on completion and deliverable/analysis requirement */}
                    {/* Hide checkbox for break tasks */}
                    {!isBreakTask ? (
                    <div 
                      className="flex-shrink-0 mt-[3px]"
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Completed: Purple | Incomplete Past Day with Deliverable/Analysis: Pink | Incomplete (no deliverable/analysis or current day): White
                        background: completed 
                          ? 'var(--color-pursuit-purple)' 
                          : (isPastDay && (requiresDeliverable || shouldAnalyze))
                            ? 'var(--color-mastery-pink)' 
                            : 'white',
                        border: completed 
                          ? '1px solid var(--color-pursuit-purple)' 
                          : (isPastDay && (requiresDeliverable || shouldAnalyze))
                            ? '1px solid var(--color-mastery-pink)' 
                            : '1px solid white'
                      }}
                    >
                      {completed ? (
                        // Purple checkmark for completed tasks
                        <svg viewBox="0 0 14 14" style={{
                          width: '12px',
                          height: '12px',
                          stroke: 'var(--color-background)',
                          strokeWidth: '1.5',
                          fill: 'none',
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          transform: 'translateY(1px)'
                        }}>
                          <polyline points="2.5,6 5.5,9 11.5,3" />
                        </svg>
                      ) : (isPastDay && (requiresDeliverable || shouldAnalyze)) ? (
                        // Pink X for incomplete past day tasks WITH deliverables or analysis
                        <svg viewBox="0 0 8 8" style={{
                          width: '8px',
                          height: '8px',
                          stroke: 'var(--color-background)',
                          strokeWidth: '1.5',
                          strokeLinecap: 'round'
                        }}>
                          <line x1="1" y1="1" x2="7" y2="7" />
                          <line x1="7" y1="1" x2="1" y2="7" />
                        </svg>
                      ) : null /* White circle with no icon for incomplete tasks without deliverables/analysis */}
                    </div>
                    ) : (
                      // Empty spacer for break tasks to maintain alignment
                      <div className="flex-shrink-0" style={{ width: '14px' }} />
                    )}
                    <span className="text-base leading-[18px] font-proxima font-normal text-carbon-black flex-1">
                      {task.task_title || `Activity ${index + 1}`}
                    </span>
                  </div>
                  {/* Dotted divider line - show for all except last item */}
                  {index < tasks.length - 1 && (
                    <div className="border-b border-dotted border-gray-300" />
                  )}
                </div>
                );
              })}
            </div>

            {/* Category Time Blocks - Only show "Build" category if it exists */}
            <div className="space-y-1">
              {groupedTasks['Build'] && (
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4C2 2.89543 2.89543 2 4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4Z" fill="#1E1E1E"/>
                  </svg>
                  <span className="text-base leading-[18px] font-proxima font-bold text-carbon-black">
                    Build
                  </span>
                  <span className="text-base leading-[18px] font-proxima font-normal text-carbon-black">
                    {getCategoryDuration(groupedTasks['Build'])}
                  </span>
                </div>
              )}
            </div>
        </div>

          {/* GO Button */}
          <div className="flex justify-start">
          <Button 
            onClick={() => {
              setIsAnimating(true);
              // Delay the actual navigation until fade is complete
              setTimeout(() => {
                onStartActivity(tasks[0]);
              }, 600);
            }}
            size="lg"
            className="group relative overflow-hidden bg-pursuit-purple hover:bg-pursuit-purple border border-pursuit-purple text-white px-12 py-5 text-[20px] leading-[23px] font-proxima font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isAnimating}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-pursuit-purple">
              Go!
            </span>
            <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyOverview;
