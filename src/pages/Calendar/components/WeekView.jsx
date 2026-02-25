import React, { useMemo } from 'react';
import DayCell from './DayCell';

const WeekView = ({ weekNumber, weeklyGoal, days = [], onDayClick, currentDayId, currentMonth, currentYear }) => {
  
  // Days are already in order from Calendar.jsx (Sat-Fri)
  // Each day object has the enhanced structure with date, curriculumDay, hasClass, etc.
  
  // Memoize date comparison functions
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);
  
  const isToday = (dateObj) => {
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today;
  };
  
  const isPast = (dateObj) => {
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const isFuture = (dateObj) => {
    const compareDate = new Date(dateObj.date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };
  
  // Check if day has tasks that REQUIRE completion
  // Tasks require completion if they have:
  // - deliverable_type (video/document/link/structured) - needs submission
  // - should_analyze = true - needs conversation conclusion
  // - feedback_slot - survey needs submission
  // - task_mode = 'assessment' - assessment needs submission
  const hasRequiredTasks = (dateObj) => {
    if (!dateObj.hasClass || !dateObj.tasks) return false;
    return dateObj.tasks.some(t => {
      const hasDeliverable = t.deliverable_type && 
                            ['video', 'document', 'link', 'structured'].includes(t.deliverable_type);
      const needsAnalysis = t.should_analyze === true;
      const isSurvey = !!t.feedback_slot;
      const isAssessment = t.task_mode === 'assessment';
      return hasDeliverable || needsAnalysis || isSurvey || isAssessment;
    });
  };
  
  // Check if day is complete (all required tasks completed)
  // Uses isComplete from backend which already considers all completion conditions
  const isComplete = (dateObj) => {
    if (!dateObj.hasClass) {
      // No class days are automatically "complete" when past
      return isPast(dateObj);
    }
    
    const curriculumDay = dateObj.curriculumDay;
    if (!curriculumDay) return false;
    
    // Get tasks that require completion
    const requiredTasks = dateObj.tasks?.filter(t => {
      const hasDeliverable = t.deliverable_type && 
                            ['video', 'document', 'link', 'structured'].includes(t.deliverable_type);
      const needsAnalysis = t.should_analyze === true;
      const isSurvey = !!t.feedback_slot;
      const isAssessment = t.task_mode === 'assessment';
      return hasDeliverable || needsAnalysis || isSurvey || isAssessment;
    }) || [];
    
    // If no required tasks, automatically complete (nothing to do)
    if (requiredTasks.length === 0) return true;
    
    // Check if ALL required tasks are complete (using isComplete from backend)
    const completedTasks = requiredTasks.filter(t => t.isComplete);
    
    return completedTasks.length === requiredTasks.length;
  };
  
  // Debug: Log first 5 past days with their completion data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    const pastDaysWithClass = days.filter(d => isPast(d) && d.hasClass).slice(0, 5);
    if (pastDaysWithClass.length > 0) {
      console.log('📊 Calendar Debug - Sample past days:', pastDaysWithClass.map(d => ({
        dayId: d.curriculumDay?.id,
        date: d.date?.toLocaleDateString(),
        taskCount: d.tasks?.length,
        tasks: d.tasks?.map(t => ({
          id: t.id,
          title: t.task_title?.substring(0, 30),
          deliverable_type: t.deliverable_type,
          should_analyze: t.should_analyze,
          feedback_slot: t.feedback_slot,
          task_mode: t.task_mode,
          isComplete: t.isComplete
        })),
        hasRequiredTasks: hasRequiredTasks(d),
        dayIsComplete: isComplete(d)
      })));
    }
  }, [days]);

  return (
    <div className="flex flex-col gap-[7px]">
      {/* Week Header - Only show if this week has a week number */}
      {(weekNumber !== null && weekNumber !== undefined) && (
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
            hasDeliverables={hasRequiredTasks(dateObj)}
            isComplete={isComplete(dateObj)}
            onClick={() => dateObj.hasClass && dateObj.curriculumDay && onDayClick(dateObj.curriculumDay.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(WeekView);

