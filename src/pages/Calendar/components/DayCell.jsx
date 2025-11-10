import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

const DayCell = ({ dateObj, isToday, isPast, isFuture, hasDeliverables, isComplete, onClick }) => {
  // dateObj structure:
  // {
  //   date: Date object,
  //   dayOfMonth: number,
  //   isCurrentMonth: boolean,
  //   isPreviousMonth: boolean,
  //   isNextMonth: boolean,
  //   hasClass: boolean,
  //   curriculumDay: object | null,
  //   tasks: [],
  //   weekNumber: number | null
  // }
  
  const tasks = dateObj.tasks || [];
  const dayNumber = dateObj.dayOfMonth;
  
  // Determine styling based on month
  const isDifferentMonth = dateObj.isPreviousMonth || dateObj.isNextMonth;
  
  // Determine day number color
  const getDayNumberColor = () => {
    if (isDifferentMonth) return 'text-carbon-black/30';
    if (isToday) return 'text-white';
    if (isPast && isComplete) return 'text-pursuit-purple';
    if (isPast && hasDeliverables && !isComplete) return 'text-mastery-pink';
    return 'text-carbon-black';
  };
  
  // Circle color logic:
  // - No class days (past): purple circle
  // - Days with no deliverables (past): purple circle  
  // - Days with deliverables (past, complete): purple circle
  // - Days with deliverables (past, incomplete): pink circle
  // - Today: white circle
  // - Future: white circle
  const getCircleColor = () => {
    if (isToday) return 'bg-white';
    if (isPast) {
      if (!dateObj.hasClass) return 'bg-pursuit-purple'; // No class = purple
      if (!hasDeliverables) return 'bg-pursuit-purple'; // No deliverables = purple
      return isComplete ? 'bg-pursuit-purple' : 'bg-mastery-pink'; // Has deliverables
    }
    return 'bg-white';
  };
  
  const getArrowBorderColor = () => {
    if (isToday) return 'border-white';
    return 'border-pursuit-purple';
  };
  
  const getArrowIconColor = () => {
    if (isToday) return 'text-white';
    return 'text-pursuit-purple';
  };
  
  const getTaskTextColor = () => {
    if (isDifferentMonth) return 'text-carbon-black/30';
    if (isToday) return 'text-white';
    return 'text-carbon-black';
  };
  
  // Truncate task title with ellipsis
  const truncateTitle = (title) => {
    if (!title) return '';
    if (title.length > 20) {
      return title.substring(0, 20) + '...';
    }
    return title;
  };

  // Render empty cell for dates with no content (shouldn't happen with new logic, but keep as fallback)
  if (!dateObj) {
    return <div className="w-full h-[134px]" />;
  }

  return (
    <div 
      className={cn(
        "w-full h-[134px] rounded-[20px] p-[11px_8px_8px_11px] relative",
        isToday ? "bg-pursuit-purple" : "bg-stardust",
        isDifferentMonth && "opacity-50"
      )}
    >
      {!dateObj.hasClass ? (
        // No Class day
        <div className="flex gap-[5px] h-full">
          {/* Left column: Day number, circle */}
          <div className="flex flex-col justify-between min-w-[17px]">
            <div className="flex flex-col">
              <span className={cn("text-[16px] leading-[16px] font-proxima font-bold", getDayNumberColor())}>
                {String(dayNumber).padStart(2, '0')}
              </span>
              <div className={cn("w-[12px] h-[12px] rounded-full mt-[2px]", getCircleColor())} />
            </div>
            {/* No arrow for No Class days */}
            <div className="w-[17px] h-[16px]" />
          </div>
          
          {/* Right column: No Class text */}
          <div className="flex flex-col gap-0 flex-1">
            <span className={cn("text-[12px] leading-[12px] font-proxima font-normal", getTaskTextColor())}>
              No Class
            </span>
          </div>
        </div>
      ) : (
        // Day with class
        <div className="flex gap-[5px] h-full">
          {/* Left column: Day number, circle, arrow */}
          <div className="flex flex-col justify-between min-w-[17px]">
            {/* Top: Day number + circle */}
            <div className="flex flex-col">
              <span className={cn("text-[16px] leading-[16px] font-proxima font-bold", getDayNumberColor())}>
                {String(dayNumber).padStart(2, '0')}
              </span>
              <div className={cn("w-[12px] h-[12px] rounded-full mt-[2px]", getCircleColor())} />
            </div>
            
            {/* Bottom: Arrow button */}
            <Button
              onClick={onClick}
              variant="outline"
              className={cn(
                "w-[17px] h-[16px] p-[3px] border rounded-[5px] flex items-center justify-center bg-transparent hover:bg-transparent",
                getArrowBorderColor()
              )}
            >
              <ChevronRight className={cn("w-[8px] h-[8px] -rotate-90", getArrowIconColor())} />
            </Button>
          </div>
          
          {/* Right column: Task list */}
          <div className="flex flex-col gap-0 flex-1 overflow-hidden min-w-0">
            {tasks.slice(0, 10).map((task, idx) => (
              <span 
                key={idx}
                className={cn(
                  "text-[12px] leading-[12px] font-proxima font-normal whitespace-nowrap overflow-hidden text-ellipsis",
                  getTaskTextColor()
                )}
                title={task.task_title}
              >
                {truncateTitle(task.task_title || `Daily activity ${String(idx + 1).padStart(2, '0')}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCell;

