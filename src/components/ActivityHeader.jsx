import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const ActivityHeader = ({ currentDay, tasks, currentTaskIndex, onTaskChange }) => {
  if (!currentDay || !tasks) return null;

  const currentTask = tasks[currentTaskIndex];
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex < tasks.length - 1;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: '2-digit' });
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${month}.${day} ${weekday}`;
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onTaskChange(currentTaskIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onTaskChange(currentTaskIndex + 1);
    }
  };

  return (
    <div className="sticky top-0 bg-bg-light border-b border-divider shadow-lg relative z-20">
      <div className="flex items-center justify-between px-6 h-[44px]">
        {/* Date with gradient text */}
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

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="h-7 w-7 p-0 text-carbon-black hover:text-pursuit-purple disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Current Activity with Counter */}
          <div className="flex items-center gap-2 min-w-[280px] justify-center">
            {/* Task Title and Counter */}
            <span className="text-sm font-proxima text-carbon-black">
              {currentTask?.task_title}
            </span>
            
            <span className="text-xs font-proxima text-gray-500">
              ({currentTaskIndex + 1}/{tasks.length})
            </span>
            
            {/* Progress Dots */}
            <div className="flex gap-1 ml-2">
              {tasks.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentTaskIndex
                      ? 'bg-pursuit-purple'
                      : 'bg-divider'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={!hasNext}
            className="h-7 w-7 p-0 text-carbon-black hover:text-pursuit-purple disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right side - placeholder for balance */}
        <div className="w-24" />
      </div>
    </div>
  );
};

export default ActivityHeader;
