import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const DailyOverview = ({ currentDay, tasks, onStartActivity }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  if (!currentDay || !tasks || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-carbon-black mb-4">Loading today's activities...</h2>
        </div>
      </div>
    );
  }

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
          {formatDate(currentDay.day_date)}
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
            {tasks.map((task, index) => (
                <div key={task.id}>
                  <div className="flex items-start gap-2 py-2">
                    <div className="w-[12px] h-[12px] rounded-full bg-white flex-shrink-0 mt-[3px]" />
                    <span className="text-base leading-[18px] font-proxima font-normal text-carbon-black flex-1">
                      {task.task_title || `Activity ${index + 1}`}
                    </span>
                  </div>
                  {/* Dotted divider line - show for all except last item */}
                  {index < tasks.length - 1 && (
                    <div className="border-b border-dotted border-gray-300" />
                  )}
                </div>
              ))}
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
              className="bg-pursuit-purple hover:bg-pursuit-purple/90 text-white px-12 py-5 text-[20px] leading-[23px] font-proxima font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isAnimating}
          >
              Go!
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyOverview;
