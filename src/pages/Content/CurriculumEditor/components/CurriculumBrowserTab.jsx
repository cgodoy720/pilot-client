import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import TaskCard from '../../../../components/curriculum/TaskCard';
import TaskEditDialog from '../../../../components/curriculum/TaskEditDialog';
import FieldHistoryDialog from '../../../../components/curriculum/FieldHistoryDialog';
import DayGoalEditor from '../../../../components/curriculum/DayGoalEditor';
import MoveTaskDialog from '../../../../components/curriculum/MoveTaskDialog';
import LoadingState from '../../../../components/curriculum/LoadingState';
import EmptyState from '../../../../components/curriculum/EmptyState';
import { toast } from 'sonner';

const CurriculumBrowserTab = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [cohortsLoading, setCohortsLoading] = useState(true);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);
  const [moveTaskDialogOpen, setMoveTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('task');
  const [selectedEntityId, setSelectedEntityId] = useState(null);

  // Permission check
  const canEdit = user?.role === 'staff' || user?.role === 'admin';

  // Fetch available cohorts
  useEffect(() => {
    fetchCohorts();
  }, []);

  // Fetch curriculum when cohort changes
  useEffect(() => {
    if (selectedCohort) {
      fetchCalendar();
    }
  }, [selectedCohort]);

  // Load tasks when day changes
  useEffect(() => {
    if (selectedDay) {
      fetchDayTasks();
    }
  }, [selectedDay]);

  const fetchCohorts = async () => {
    try {
      setCohortsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/cohorts`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const cohortList = await response.json();
        console.log('Cohorts from API:', cohortList);
        
        setCohorts(cohortList);
        
        // DO NOT auto-select - user must choose
        setSelectedCohort('');
      } else {
        toast.error('Failed to load cohorts');
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      toast.error('Failed to load cohorts');
    } finally {
      setCohortsLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/calendar?cohort=${selectedCohort}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const calendarData = await response.json();
        setWeeks(calendarData);
        
        if (calendarData.length > 0) {
          // Find current week based on today's date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Find week that contains today
          let currentWeek = calendarData.find(week => {
            return week.days?.some(day => {
              const dayDate = new Date(day.day_date);
              dayDate.setHours(0, 0, 0, 0);
              return dayDate.getTime() === today.getTime();
            });
          });
          
          // If no week contains today, find the closest future week
          if (!currentWeek) {
            currentWeek = calendarData.find(week => {
              return week.days?.some(day => {
                const dayDate = new Date(day.day_date);
                return dayDate >= today;
              });
            });
          }
          
          // If still no match, find the closest past week
          if (!currentWeek) {
            currentWeek = calendarData.reverse().find(week => {
              return week.days?.some(day => {
                const dayDate = new Date(day.day_date);
                return dayDate <= today;
              });
            });
            calendarData.reverse(); // Restore original order
          }
          
          // Fall back to first week if no good match
          const weekToSelect = currentWeek || calendarData[0];
          setSelectedWeek(weekToSelect);
          setDays(weekToSelect.days || []);
          
          // Try to select today's day, or the closest day
          if (weekToSelect.days && weekToSelect.days.length > 0) {
            let dayToSelect = weekToSelect.days.find(day => {
              const dayDate = new Date(day.day_date);
              dayDate.setHours(0, 0, 0, 0);
              return dayDate.getTime() === today.getTime();
            });
            
            // If today not found, select first day of the week
            if (!dayToSelect) {
              dayToSelect = weekToSelect.days[0];
            }
            
            setSelectedDay(dayToSelect);
          }
          
          console.log('Navigated to current week:', weekToSelect.weekNumber);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
      toast.error('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const fetchDayTasks = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/days/${selectedDay.id}/full-details?cohort=${selectedCohort}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.flattenedTasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const handleWeekChange = (direction) => {
    const currentIndex = weeks.findIndex(w => w.weekNumber === selectedWeek?.weekNumber);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < weeks.length) {
      const newWeek = weeks[newIndex];
      setSelectedWeek(newWeek);
      setDays(newWeek.days || []);
      
      // Select first day of new week
      if (newWeek.days && newWeek.days.length > 0) {
        setSelectedDay(newWeek.days[0]);
      }
    }
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleViewHistory = (task) => {
    setSelectedTask(task);
    setSelectedField('task_title'); // Default field
    setHistoryDialogOpen(true);
  };

  const handleViewFieldHistory = (fieldName, entityType = 'task', entityId = null) => {
    setSelectedField(fieldName);
    setSelectedEntityType(entityType);
    setSelectedEntityId(entityId || selectedTask?.id);
    setHistoryDialogOpen(true);
  };

  const handleSaveTask = async (taskId, formData) => {
    try {
      // Prepare task updates
      const taskUpdates = {
        task_title: formData.task_title,
        task_description: formData.task_description,
        intro: formData.intro,
        questions: formData.questions,
        linked_resources: formData.linked_resources,
        conclusion: formData.conclusion,
        deliverable: formData.deliverable,
        deliverable_type: formData.deliverable_type,
        should_analyze: formData.should_analyze,
        analyze_deliverable: formData.analyze_deliverable,
        task_mode: formData.task_mode
      };
      
      // Update task
      const taskResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${taskId}/edit?cohort=${selectedCohort}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskUpdates)
        }
      );
      
      if (!taskResponse.ok) {
        throw new Error('Failed to update task');
      }
      
      // Update time block if times changed
      if (formData.start_time || formData.end_time) {
        // Get the block_id from the task
        const task = tasks.find(t => t.id === taskId);
        if (task && task.block_id) {
          const blockUpdates = {};
          if (formData.start_time) blockUpdates.start_time = formData.start_time;
          if (formData.end_time) blockUpdates.end_time = formData.end_time;
          
          const blockResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/curriculum/blocks/${task.block_id}/edit?cohort=${selectedCohort}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(blockUpdates)
            }
          );
          
          if (!blockResponse.ok) {
            console.error('Failed to update time block');
          }
        }
      }
      
      // Refresh tasks to show updated data
      await fetchDayTasks();
      
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  };

  const handleRevertField = async (entityType, entityId, fieldName, value) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/revert?cohort=${selectedCohort}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            entityType,
            entityId,
            fieldName,
            revertToValue: value
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to revert field');
      }
      
      // Refresh based on entity type
      if (entityType === 'task') {
        await fetchDayTasks();
      } else if (entityType === 'curriculum_day') {
        await fetchCalendar();
      }
      
    } catch (error) {
      console.error('Error reverting field:', error);
      throw error;
    }
  };

  const handleSaveGoals = async (goalData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/days/${selectedDay.id}/edit?cohort=${selectedCohort}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(goalData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update goals');
      }
      
      // Refresh calendar to show updated goals
      await fetchCalendar();
      
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  };

  const openDeleteDialog = () => {
    setDayToDelete(selectedDay);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDay = async () => {
    if (!dayToDelete) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayToDelete.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        toast.success(`Day ${dayToDelete.day_number} deleted successfully`);
        
        // Clear selection since we deleted the current day
        setSelectedDay(null);
        setTasks([]);
        
        // Refresh calendar to update day list
        await fetchCalendar();
        
        // Close dialog
        setDeleteDialogOpen(false);
        setDayToDelete(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete day');
      }
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error('Failed to delete day');
    }
  };

  const handleMoveTask = async (taskId, targetDayId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${taskId}/move?cohort=${selectedCohort}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ targetDayId })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to move task');
      }
      
      // Refresh calendar to update all days
      await fetchCalendar();
      
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Show loading only for cohorts initially
  if (cohortsLoading) {
    return <LoadingState message="Loading cohorts..." />;
  }

  // Show message if no cohorts available
  if (cohorts.length === 0) {
    return (
      <EmptyState
        title="No Cohorts Found"
        description="No curriculum cohorts are available in the system."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cohort Selector */}
      <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="font-proxima-bold text-[#1E1E1E] whitespace-nowrap">
            Select Cohort:
          </label>
          <Select value={selectedCohort} onValueChange={setSelectedCohort}>
            <SelectTrigger className="w-[250px] font-proxima">
              <SelectValue placeholder="Choose a cohort..." />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map(cohort => (
                <SelectItem key={cohort} value={cohort} className="font-proxima">
                  {cohort}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show loading state while fetching curriculum */}
      {loading && <LoadingState message="Loading curriculum..." />}

      {/* Only show content if cohort is selected */}
      {!selectedCohort && !loading && (
        <EmptyState
          title="Select a Cohort"
          description="Please select a cohort from the dropdown above to view and edit curriculum."
        />
      )}

      {/* Week Navigation - only show when cohort selected and data loaded */}
      {selectedCohort && !loading && selectedWeek && (
        <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleWeekChange('prev')}
              disabled={weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) === 0}
              className="border-[#C8C8C8]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            
            <div className="text-center">
              <h3 className="font-proxima-bold text-lg text-[#1E1E1E]">
                Week {selectedWeek.weekNumber}
              </h3>
              {selectedWeek.weeklyGoal && (
                <p className="text-sm text-[#666] font-proxima mt-1">
                  {selectedWeek.weeklyGoal}
                </p>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleWeekChange('next')}
              disabled={weeks.findIndex(w => w.weekNumber === selectedWeek.weekNumber) === weeks.length - 1}
              className="border-[#C8C8C8]"
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Day Selection - only show when cohort selected */}
      {selectedCohort && !loading && days.length > 0 && (
        <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
          <h4 className="font-proxima-bold text-[#1E1E1E] mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Day
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {days.map(day => (
              <Button
                key={day.id}
                variant={selectedDay?.id === day.id ? 'default' : 'outline'}
                onClick={() => handleDaySelect(day)}
                className={`flex-col h-auto py-3 ${
                  selectedDay?.id === day.id
                    ? 'bg-[#4242EA] text-white hover:bg-[#3535D1]'
                    : 'border-[#C8C8C8] hover:border-[#4242EA]'
                }`}
              >
                <span className="font-proxima-bold text-sm">
                  Day {day.day_number}
                </span>
                <span className="text-xs mt-1 opacity-90">
                  {formatDate(day.day_date)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Display - only show when cohort and day selected */}
      {selectedCohort && !loading && selectedDay && (
        <div className="space-y-4">
          <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="font-proxima-bold text-[#1E1E1E] mb-2">
                  {selectedDay.daily_goal || `Day ${selectedDay.day_number}`}
                </h4>
                <p className="text-sm text-[#666] font-proxima">
                  {selectedDay.day_type} • {formatDate(selectedDay.day_date)}
                </p>
                {selectedWeek?.weeklyGoal && (
                  <p className="text-sm text-[#666] font-proxima mt-2">
                    <span className="font-proxima-bold">Week Goal:</span> {selectedWeek.weeklyGoal}
                  </p>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setGoalEditorOpen(true)}
                    className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Goals
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={openDeleteDialog}
                    className="font-proxima"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Day
                  </Button>
                </div>
              )}
            </div>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="This day doesn't have any tasks yet."
            />
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onViewHistory={handleViewHistory}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <TaskEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={selectedTask}
        onSave={handleSaveTask}
        onViewFieldHistory={handleViewFieldHistory}
        onMoveTask={() => setMoveTaskDialogOpen(true)}
        canEdit={canEdit}
      />

      <FieldHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        fieldName={selectedField}
        entityType={selectedEntityType}
        entityId={selectedEntityId}
        onRevert={handleRevertField}
        canEdit={canEdit}
      />

      <DayGoalEditor
        open={goalEditorOpen}
        onOpenChange={setGoalEditorOpen}
        day={selectedDay}
        week={selectedWeek}
        onSave={handleSaveGoals}
        onViewFieldHistory={handleViewFieldHistory}
        canEdit={canEdit}
      />

      <MoveTaskDialog
        open={moveTaskDialogOpen}
        onOpenChange={setMoveTaskDialogOpen}
        task={selectedTask}
        currentDay={selectedDay}
        allDays={days}
        onMove={handleMoveTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="font-proxima">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Curriculum Day?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>Day {dayToDelete?.day_number}</strong>{' '}
              ({dayToDelete?.day_date ? formatDate(dayToDelete.day_date) : ''})?
              <br /><br />
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 ml-2">
                <li>All time blocks for this day</li>
                <li>All tasks for this day</li>
                <li>All task submissions and conversations</li>
              </ul>
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDay}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurriculumBrowserTab;
