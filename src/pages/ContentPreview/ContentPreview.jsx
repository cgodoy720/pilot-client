import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import CohortDaySelector from './components/CohortDaySelector';
import StaffControlsPanel from './components/StaffControlsPanel';
import LearningPreview from './components/LearningPreview';
import { AlertCircle } from 'lucide-react';
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

  // Check if user has preview access
  const hasPreviewAccess = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'volunteer';

  const loadDayContent = async (dayId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/curriculum/days/${dayId}/full-details?cohort=${encodeURIComponent(selectedCohort?.cohort_name || '')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const dayData = response.data;
      setDayContent(dayData);
      setSelectedDay(dayData);
      
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
      text: 'This will delete all your preview submissions. This action cannot be undone.',
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
      
      Swal.fire({
        icon: 'success',
        title: 'Test Data Cleared',
        text: `Deleted ${response.data.deletedCount} preview submission(s)`,
        confirmButtonColor: '#4242EA'
      });
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
      
      <div className="content-preview-container min-h-screen bg-slate-50">
        {/* Preview Mode Banner */}
        <div className="preview-banner bg-blue-600 text-white px-6 py-3 sticky top-0 z-50 shadow-md">
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
        <div className="flex h-[calc(100vh-53px)]">
          {/* Left: Cohort & Day Selector */}
          <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
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
                      <div className="text-right">
                        <div className="text-sm text-slate-600 font-proxima">
                          {dayContent.day?.cohort}
                        </div>
                        <div className="text-sm font-medium text-slate-900 font-proxima">
                          Week {dayContent.day?.week} • {dayContent.day?.level}
                        </div>
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
                    <h2 className="text-xl font-bold text-slate-900 font-proxima">
                      Tasks ({dayContent.flattenedTasks?.length || 0})
                    </h2>
                    {dayContent.flattenedTasks && dayContent.flattenedTasks.length > 0 ? (
                      dayContent.flattenedTasks.map((task, index) => (
                        <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-slate-900 font-proxima">
                              {task.task_title || `Task ${index + 1}`}
                            </h3>
                            {task.task_type && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-proxima">
                                {task.task_type}
                              </span>
                            )}
                          </div>
                          {task.intro && (
                            <div className="prose max-w-none font-proxima mb-4 text-slate-700"
                              dangerouslySetInnerHTML={{ __html: task.intro.substring(0, 300) + (task.intro.length > 300 ? '...' : '') }}
                            />
                          )}
                          {task.deliverable && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <span className="text-sm font-semibold text-slate-900 font-proxima">
                                Deliverable: 
                              </span>
                              <span className="text-sm text-slate-700 font-proxima ml-2">
                                {task.deliverable_type || 'Required'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
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

          {/* Right: Staff Controls Panel */}
          {dayContent && (
            <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
              <StaffControlsPanel
                dayContent={dayContent}
                cohort={selectedCohort}
                onNavigate={(direction) => {
                  console.log('Navigate:', direction);
                }}
                onEnterInteractive={() => setPreviewMode('interactive')}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ContentPreview;
