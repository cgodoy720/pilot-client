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
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import TaskCard from './shared/TaskCard';
import TaskEditDialog from './shared/TaskEditDialog';
import FieldHistoryDialog from './shared/FieldHistoryDialog';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';
import { toast } from 'sonner';

const CurriculumBrowserTab = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedField, setSelectedField] = useState('');

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/days`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const days = await response.json();
        // Extract unique cohorts
        const uniqueCohorts = [...new Set(days.map(d => d.cohort).filter(Boolean))];
        setCohorts(uniqueCohorts);
        
        // Set default cohort
        if (uniqueCohorts.length > 0) {
          setSelectedCohort(user?.cohort || uniqueCohorts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      toast.error('Failed to load cohorts');
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
        
        // Select first week by default
        if (calendarData.length > 0) {
          setSelectedWeek(calendarData[0]);
          setDays(calendarData[0].days || []);
          
          // Select first day
          if (calendarData[0].days && calendarData[0].days.length > 0) {
            setSelectedDay(calendarData[0].days[0]);
          }
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

  const handleViewFieldHistory = (fieldName) => {
    setSelectedField(fieldName);
    setHistoryDialogOpen(true);
  };

  const handleSaveTask = async (taskId, formData) => {
    // This will be implemented in Phase 2 with actual API
    // For now, just simulate success
    console.log('Saving task:', taskId, formData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh tasks after save
    await fetchDayTasks();
  };

  const handleRevertField = async (fieldName, value) => {
    // This will be implemented in Phase 2 with actual API
    console.log('Reverting field:', fieldName, 'to:', value);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh tasks after revert
    await fetchDayTasks();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <LoadingState />;
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
              <SelectValue placeholder="Choose a cohort" />
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

      {/* Week Navigation */}
      {selectedWeek && (
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

      {/* Day Selection */}
      {days.length > 0 && (
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

      {/* Tasks Display */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
            <h4 className="font-proxima-bold text-[#1E1E1E] mb-2">
              {selectedDay.daily_goal || `Day ${selectedDay.day_number}`}
            </h4>
            <p className="text-sm text-[#666] font-proxima">
              {selectedDay.day_type} • {formatDate(selectedDay.day_date)}
            </p>
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
        canEdit={canEdit}
      />

      <FieldHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        fieldName={selectedField}
        taskId={selectedTask?.id}
        onRevert={handleRevertField}
        canEdit={canEdit}
      />
    </div>
  );
};

export default CurriculumBrowserTab;
