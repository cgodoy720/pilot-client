import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import CohortDaySelector from './components/CohortDaySelector';
import StaffControlsPanel from './components/StaffControlsPanel';
import LearningPreview from './components/LearningPreview';
import { AlertCircle } from 'lucide-react';
import TaskCard from '../../components/curriculum/TaskCard';
import TaskEditDialog from '../../components/curriculum/TaskEditDialog';
import TaskCreateDialog from '../../components/curriculum/TaskCreateDialog';
import FieldHistoryDialog from '../../components/curriculum/FieldHistoryDialog';
import DayGoalEditor from '../../components/curriculum/DayGoalEditor';
import MoveTaskDialog from '../../components/curriculum/MoveTaskDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import './ContentPreview.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Content Preview Page
 * Allows staff/admin/volunteers to view and test curriculum content as students see it
 */
function ContentPreview() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayContent, setDayContent] = useState(null);
  const [previewMode, setPreviewMode] = useState('readonly'); // 'readonly' or 'interactive'

  // Dialog states for editing
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);
  const [moveTaskDialogOpen, setMoveTaskDialogOpen] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [deleteDayDialogOpen, setDeleteDayDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('task');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [dayToDelete, setDayToDelete] = useState(null);

  // Check if user has preview access and edit permissions via the permission system
  const { canAccessPage, canUseFeature } = usePermissions();
  const hasPreviewAccess = canAccessPage('content_preview');
  const canEdit = canUseFeature('edit_curriculum');

  const loadDayContent = async (dayId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/curriculum/days/${dayId}/full-details?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const dayData = response.data;
      setDayContent(dayData);
      // Set selectedDay to the day object within dayData (has .id property)
      setSelectedDay(dayData.day);
      
      // Update URL params
      searchParams.set('day', dayId);
      setSearchParams(searchParams);
    } catch (error) {
      console.error('Error loading day content:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to load day content',
        confirmButtonColor: '#4242EA'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCohortSelect = (cohort) => {
    setSelectedCohort(cohort);
    setSelectedDay(null);
    setDayContent(null);
    setPreviewMode('readonly');
    
    // Update URL params
    searchParams.set('cohort', encodeURIComponent(JSON.stringify(cohort)));
    searchParams.delete('day');
    setSearchParams(searchParams);
  };

  const handleDaySelect = (day) => {
    loadDayContent(day.id);
  };

  const handleClearTestData = async () => {
    const result = await Swal.fire({
      title: 'Clear Test Data?',
      html: `
        <p>This will delete all your preview data:</p>
        <ul style="text-align: left; margin: 1rem 0;">
          <li>💬 Conversation messages</li>
          <li>🧵 Conversation threads</li>
          <li>📝 Task submissions</li>
          <li>📊 Assessment submissions</li>
          <li>📈 Progress tracking</li>
          <li>📋 Survey responses</li>
        </ul>
        <p><strong>This action cannot be undone.</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, clear my test data',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/preview/clear-my-data`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { deletedCount, details } = response.data;
      const detailsText = [
        details.messages > 0 && `${details.messages} conversation message(s)`,
        details.taskThreads > 0 && `${details.taskThreads} task thread(s)`,
        details.threads > 0 && `${details.threads} thread(s)`,
        details.submissions > 0 && `${details.submissions} task submission(s)`,
        details.previewSubmissions > 0 && `${details.previewSubmissions} preview submission(s)`,
        details.legacySubmissions > 0 && `${details.legacySubmissions} legacy submission(s)`,
        details.assessmentSubmissions > 0 && `${details.assessmentSubmissions} assessment submission(s)`,
        details.taskProgress > 0 && `${details.taskProgress} task progress record(s)`,
        details.feedback > 0 && `${details.feedback} survey response(s)`,
        details.submissionImagesFound > 0 && `${details.submissionImagesDeleted || 0}/${details.submissionImagesFound} submission image(s) deleted`
      ].filter(Boolean).join('<br>');
      
      // Clear localStorage survey progress data
      let localStorageCleared = 0;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('survey_progress_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        localStorageCleared++;
      });
      
      if (localStorageCleared > 0) {
        console.log(`Cleared ${localStorageCleared} survey progress items from localStorage`);
      }
      
      await Swal.fire({
        icon: 'success',
        title: 'Test Data Cleared',
        html: deletedCount > 0 || localStorageCleared > 0
          ? `
            <p>Successfully deleted <strong>${deletedCount}</strong> preview record(s):</p>
            <div style="text-align: left; margin: 1rem 0; font-size: 0.9rem;">
              ${detailsText}
              ${localStorageCleared > 0 ? `<br>${localStorageCleared} cached survey progress item(s)` : ''}
            </div>
          `
          : '<p>No test data found to delete.</p>',
        confirmButtonColor: '#4242EA'
      });
      
      // Navigate back to the overview/cohort selection
      setSelectedDay(null);
      setDayContent(null);
      setPreviewMode('readonly');
      
      // Clear URL params to go back to cohort overview
      searchParams.delete('day');
      setSearchParams(searchParams);
      
    } catch (error) {
      console.error('Error clearing test data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to clear test data',
        confirmButtonColor: '#4242EA'
      });
    } finally {
      setLoading(false);
    }
  };

  // Task editing handlers
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleViewHistory = (task) => {
    setSelectedTask(task);
    setSelectedField('task_title'); // Default field
    setSelectedEntityType('task');
    setSelectedEntityId(task.id);
    setHistoryDialogOpen(true);
  };

  const handleViewFieldHistory = (fieldName, entityType = 'task', entityId = null) => {
    setSelectedField(fieldName);
    setSelectedEntityType(entityType);
    setSelectedEntityId(entityId || selectedTask?.id);
    setHistoryDialogOpen(true);
  };

  const handleSaveTask = async (taskId, formData) => {
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
      task_mode: formData.task_mode,
      task_type: formData.task_type,
      feedback_slot: formData.feedback_slot,
      assessment_id: formData.assessment_id,
      persona: formData.persona,
      ai_helper_mode: formData.ai_helper_mode
    };
    
    console.log('Saving task:', taskId, 'with updates:', taskUpdates);
    console.log('Cohort:', selectedCohort?.cohort_name);
    
    // Update task - let errors propagate to the dialog's catch handler
    const taskResponse = await axios.put(
      `${API_URL}/api/curriculum/tasks/${taskId}/edit?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
      taskUpdates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Task update response:', taskResponse.status, taskResponse.data);
    
    // Update time block only when a time actually changed
    const task = dayContent.flattenedTasks?.find(t => t.id === taskId);
    if (task && task.block_id) {
      const normalizeTime = (value) => (typeof value === 'string' ? value.slice(0, 5) : '');
      const hasStartTimeChange = normalizeTime(formData.start_time) !== normalizeTime(task.start_time);
      const hasEndTimeChange = normalizeTime(formData.end_time) !== normalizeTime(task.end_time);

      if (hasStartTimeChange || hasEndTimeChange) {
        const blockUpdates = {};
        if (hasStartTimeChange) blockUpdates.start_time = formData.start_time;
        if (hasEndTimeChange) blockUpdates.end_time = formData.end_time;

        await axios.put(
          `${API_URL}/api/curriculum/blocks/${task.block_id}/edit?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
          blockUpdates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }
    
    // Refresh day content to show updated data
    await loadDayContent(selectedDay.id);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setDeleteTaskDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/curriculum/tasks/${taskToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        toast.success('Task deleted successfully');
        setDeleteTaskDialogOpen(false);
        setTaskToDelete(null);
        
        // Refresh day content
        await loadDayContent(selectedDay.id);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.error || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveTask = async (taskId, targetDayId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/curriculum/tasks/${taskId}/move?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
        { targetDayId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        toast.success('Task moved successfully');
        // Refresh day content
        await loadDayContent(selectedDay.id);
      }
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
      throw error;
    }
  };

  const handleRevertField = async (entityType, entityId, fieldName, value) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/curriculum/revert?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
        {
          entityType,
          entityId,
          fieldName,
          revertToValue: value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        toast.success('Field reverted successfully');
        // Refresh day content
        await loadDayContent(selectedDay.id);
      }
    } catch (error) {
      console.error('Error reverting field:', error);
      toast.error('Failed to revert field');
      throw error;
    }
  };

  // Day editing handlers
  const handleEditDayGoals = () => {
    setGoalEditorOpen(true);
  };

  const handleSaveGoals = async (goalData) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/curriculum/days/${selectedDay.id}/edit?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
        goalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        toast.success('Goals updated successfully');
        // Refresh day content
        await loadDayContent(selectedDay.id);
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to update goals');
      throw error;
    }
  };

  const handleDeleteDay = () => {
    setDayToDelete(selectedDay);
    setDeleteDayDialogOpen(true);
  };

  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/curriculum/days/${dayToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        toast.success(`Day ${dayToDelete.day_number} deleted successfully`);
        
        // Clear selection and refresh
        setSelectedDay(null);
        setDayContent(null);
        setDeleteDayDialogOpen(false);
        setDayToDelete(null);
        
        // Optionally refresh cohort to update day list
        // For now just clear the view
      }
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error(error.response?.data?.error || 'Failed to delete day');
    } finally {
      setLoading(false);
    }
  };

  // Task creation handler
  const handleAddTask = () => {
    setCreateTaskDialogOpen(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      
      // Find or create a time block with the specified times
      let blockId = null;
      
      if (taskData.start_time && taskData.end_time) {
        // Try to find existing time block with these times
        const existingBlock = dayContent?.timeBlocks?.find(block => 
          block.start_time === taskData.start_time && 
          block.end_time === taskData.end_time
        );
        
        if (existingBlock) {
          blockId = existingBlock.id;
        } else {
          // Create new time block
          try {
            const blockResponse = await axios.post(
              `${API_URL}/api/curriculum/blocks`,
              {
                day_id: selectedDay.id,
                start_time: taskData.start_time,
                end_time: taskData.end_time,
                block_category: 'Learning' // Default category
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            blockId = blockResponse.data.block.id;
          } catch (blockError) {
            console.error('Error creating time block:', blockError);
            toast.error('Failed to create time block');
            return;
          }
        }
      } else {
        // No times specified, use first available block
        if (dayContent?.timeBlocks && dayContent.timeBlocks.length > 0) {
          blockId = dayContent.timeBlocks[0].id;
        } else if (dayContent?.flattenedTasks && dayContent.flattenedTasks.length > 0) {
          blockId = dayContent.flattenedTasks[0].block_id;
        }
      }

      if (!blockId) {
        toast.error('No time block found for this day. Please specify start and end times.');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/curriculum/tasks`,
        {
          block_id: blockId,
          task_title: taskData.task_title,
          task_description: taskData.task_description || '',
          task_type: taskData.task_type || 'individual',
          duration_minutes: taskData.duration_minutes || 30,
          
          // Content fields
          intro: taskData.intro || '',
          conclusion: taskData.conclusion || '',
          questions: taskData.questions || [],
          linked_resources: taskData.linked_resources || [],
          
          // Deliverable fields
          deliverable: taskData.deliverable || '',
          deliverable_type: taskData.deliverable_type || 'none',
          deliverable_schema: taskData.deliverable_schema || null,
          
          // Smart task fields
          task_mode: taskData.task_mode || 'basic',
          conversation_model: taskData.conversation_model || null,
          persona: taskData.persona || null,
          ai_helper_mode: taskData.ai_helper_mode || null,
          feedback_slot: taskData.feedback_slot || null,
          assessment_id: taskData.assessment_id || null,
          
          // Analysis fields
          should_analyze: taskData.should_analyze || false,
          analyze_deliverable: taskData.analyze_deliverable || false,
          analysis_rubric: taskData.analysis_rubric || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        toast.success('Task created successfully');
        setCreateTaskDialogOpen(false);
        // Refresh day content
        await loadDayContent(selectedDay.id);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Access denied view
  if (!hasPreviewAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 font-proxima">Access Denied</h2>
          <p className="text-slate-600 font-proxima">
            You don't have permission to access content preview. Only staff, admin, and volunteer users can view this page.
          </p>
        </div>
      </div>
    );
  }

  // Interactive mode - render Learning component directly (no Layout)
  if (previewMode === 'interactive' && dayContent) {
    return (
      <div className="h-screen flex flex-col">
        {/* Preview Mode Banner */}
        <div className="preview-banner bg-blue-600 text-white px-6 py-3 z-50 shadow-md flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold font-proxima">
                🔍 PREVIEW MODE - Interactive
              </span>
              <span className="text-blue-100 font-proxima">
                {selectedCohort?.cohort_name} • Day {dayContent.day?.day_number}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode('readonly')}
                className="text-sm bg-white text-blue-600 hover:bg-blue-50 px-4 py-1 rounded font-proxima transition-colors font-semibold"
              >
                ← Back to Overview
              </button>
              <button
                onClick={handleClearTestData}
                className="text-sm bg-blue-500 hover:bg-blue-400 px-4 py-1 rounded font-proxima transition-colors"
              >
                Clear My Test Data
              </button>
            </div>
          </div>
        </div>
        
        {/* Learning Preview - takes remaining height */}
        <div className="flex-1 overflow-hidden">
          <LearningPreview
            dayId={dayContent.day?.id}
            cohort={selectedCohort?.cohort_name || dayContent.day?.cohort || ''}
            onBack={() => setPreviewMode('readonly')}
          />
        </div>
      </div>
    );
  }

  // Read-only mode - show selector and content overview
  return (
    <>
      {loading && <LoadingCurtain />}
      
      <div className="content-preview-container h-screen bg-slate-50 flex flex-col overflow-hidden">
        {/* Preview Mode Banner */}
        <div className="preview-banner bg-blue-600 text-white px-6 py-3 z-50 shadow-md flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold font-proxima">
                🔍 PREVIEW MODE
              </span>
              <span className="text-blue-100 font-proxima">
                Select a cohort and day to preview content
              </span>
            </div>
            <div className="flex items-center gap-3">
              {dayContent && (
                <button
                  onClick={() => setPreviewMode('interactive')}
                  className="text-sm bg-white text-blue-600 hover:bg-blue-50 px-4 py-1 rounded font-proxima transition-colors font-semibold"
                >
                  ▶ Enter Interactive Mode
                </button>
              )}
              <button
                onClick={handleClearTestData}
                className="text-sm bg-blue-500 hover:bg-blue-400 px-4 py-1 rounded font-proxima transition-colors"
              >
                Clear My Test Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Cohort & Day Selector */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <CohortDaySelector
              token={token}
              selectedCohort={selectedCohort}
              selectedDay={selectedDay}
              onCohortSelect={handleCohortSelect}
              onDaySelect={handleDaySelect}
            />
          </div>

          {/* Middle: Content Display */}
          <div className="flex-1 overflow-y-auto">
            {!dayContent ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 font-proxima">
                    Select a Day to Preview
                  </h3>
                  <p className="text-slate-600 font-proxima">
                    Choose a cohort and day from the left sidebar to view content
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  {/* Day Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-proxima">
                          Day {dayContent.day?.day_number}
                        </h1>
                        <p className="text-slate-600 font-proxima">
                          {dayContent.day?.day_date && new Date(dayContent.day.day_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm text-slate-600 font-proxima">
                            {dayContent.day?.cohort}
                          </div>
                          <div className="text-sm font-medium text-slate-900 font-proxima">
                            Week {dayContent.day?.week} • {dayContent.day?.level}
                          </div>
                        </div>
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditDayGoals}
                              className="font-proxima"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Goals
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleDeleteDay}
                              className="font-proxima"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete Day
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {dayContent.day?.daily_goal && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2 font-proxima">
                          Daily Goal
                        </h3>
                        <p className="text-blue-800 font-proxima">
                          {dayContent.day.daily_goal}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900 font-proxima">
                        Tasks ({dayContent.flattenedTasks?.length || 0})
                      </h2>
                      {canEdit && (
                        <Button
                          size="sm"
                          onClick={handleAddTask}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-proxima"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Task
                        </Button>
                      )}
                    </div>
                    {dayContent.flattenedTasks && dayContent.flattenedTasks.length > 0 ? (
                      <div className="grid gap-4">
                        {dayContent.flattenedTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onViewHistory={handleViewHistory}
                            canEdit={canEdit}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 font-proxima">
                        No tasks found for this day
                      </div>
                    )}
                  </div>

                  {/* Enter Interactive Mode CTA */}
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-blue-900 mb-2 font-proxima">
                      Ready to test the content?
                    </h3>
                    <p className="text-blue-700 mb-4 font-proxima">
                      Enter interactive mode to experience this day exactly as students see it - including AI chat, deliverable submissions, and more.
                    </p>
                    <button
                      onClick={() => setPreviewMode('interactive')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold font-proxima hover:bg-blue-700 transition-colors"
                    >
                      ▶ Enter Interactive Mode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editing Dialogs */}
        <TaskEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={selectedTask}
          onSave={handleSaveTask}
          onViewFieldHistory={handleViewFieldHistory}
          onMoveTask={() => setMoveTaskDialogOpen(true)}
          canEdit={canEdit}
          token={token}
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
          week={null}
          onSave={handleSaveGoals}
          onViewFieldHistory={handleViewFieldHistory}
          canEdit={canEdit}
        />

        <MoveTaskDialog
          open={moveTaskDialogOpen}
          onOpenChange={setMoveTaskDialogOpen}
          task={selectedTask}
          currentDay={selectedDay}
          allDays={[]} // Would need to pass available days from cohort
          onMove={handleMoveTask}
        />

        <TaskCreateDialog
          open={createTaskDialogOpen}
          onOpenChange={setCreateTaskDialogOpen}
          onSave={handleCreateTask}
          dayNumber={dayContent?.day?.day_number}
          token={token}
        />

        {/* Delete Task Confirmation Dialog */}
        <AlertDialog open={deleteTaskDialogOpen} onOpenChange={setDeleteTaskDialogOpen}>
          <AlertDialogContent className="font-proxima">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{taskToDelete?.task_title}</strong>?
                <br /><br />
                This will permanently delete:
                <ul className="list-disc list-inside mt-2 ml-2">
                  <li>The task and all its content</li>
                  <li>All student submissions for this task</li>
                  <li>All conversations related to this task</li>
                </ul>
                <br />
                <strong>This action cannot be undone.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTask}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Day Confirmation Dialog */}
        <AlertDialog open={deleteDayDialogOpen} onOpenChange={setDeleteDayDialogOpen}>
          <AlertDialogContent className="font-proxima">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Curriculum Day?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <strong>Day {dayToDelete?.day_number}</strong>
                {dayToDelete?.day_date && (
                  <> ({new Date(dayToDelete.day_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })})</>
                )}?
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
                onClick={confirmDeleteDay}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Day
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export default ContentPreview;
