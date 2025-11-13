import React from 'react';
import DayCell from './DayCell';

const WeekView = ({ weekNumber, weeklyGoal, days = [], onDayClick, currentDayId, userProgress = {}, currentMonth, currentYear }) => {
  // Days are already in order from Calendar.jsx (Sat-Fri)
  // Each day object has the enhanced structure with date, curriculumDay, hasClass, etc.
  
  // Determine if date is today
  const isToday = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };
  
  const isPast = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const isFuture = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };
  
  // Check if day has ACTUAL deliverable tasks (not just text/none)
  // Deliverables that need submission: 'video', 'link', 'document', 'structured'
  // NOT deliverables (auto-complete): 'text', 'none'
  const hasDeliverables = (dateObj) => {
    if (!dateObj.hasClass || !dateObj.tasks) return false;
    return dateObj.tasks.some(t => 
      t.deliverable_type && 
      t.deliverable_type !== 'text' && 
      t.deliverable_type !== 'none'
    );
  };
  
  // Check if day is complete (all deliverable tasks submitted)
  const isComplete = (dateObj) => {
    if (!dateObj.hasClass) {
      // No class days are automatically "complete" when past
      return isPast(dateObj);
    }
    
    const curriculumDay = dateObj.curriculumDay;
    if (!curriculumDay) return false;
    
    // Check for ACTUAL deliverables FIRST (video, link, document, structured)
    const deliverableTasks = dateObj.tasks?.filter(t => 
      t.deliverable_type && 
      t.deliverable_type !== 'text' && 
      t.deliverable_type !== 'none'
    ) || [];
    
    // If no ACTUAL deliverable tasks, automatically complete (nothing to submit)
    if (deliverableTasks.length === 0) return true;
    
    // Has deliverables - need to check progress
    const progress = userProgress[curriculumDay.id];
    if (!progress || progress.length === 0) {
      // Has deliverables but no progress = incomplete
      return false;
    }
    
    // Check if ALL deliverable tasks are completed
    const completedTasks = deliverableTasks.filter(t => 
      progress.find(p => p.task_id === t.id && p.status === 'completed')
    );
    
    return completedTasks.length === deliverableTasks.length;
  };

  return (
    <div className="flex flex-col gap-[7px]">
      {/* Week Header - Only show if this week has a week number */}
      {weekNumber && (
        <div className="flex items-center gap-[10px]">
          <h3 className="text-[16px] leading-[18px] font-proxima font-bold text-pursuit-purple">
            Week {weekNumber} {weeklyGoal || ''}
          </h3>
        </div>
      )}
      
      {/* Day Cells Row - Full week grid */}
      <div className="grid grid-cols-7 gap-[3px]">
        {days.map((dateObj, idx) => (
          <DayCell
            key={idx}
            dateObj={dateObj}
            isToday={isToday(dateObj)}
            isPast={isPast(dateObj)}
            isFuture={isFuture(dateObj)}
            hasDeliverables={hasDeliverables(dateObj)}
            isComplete={isComplete(dateObj)}
            onClick={() => dateObj.hasClass && dateObj.curriculumDay && onDayClick(dateObj.curriculumDay.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekView;

