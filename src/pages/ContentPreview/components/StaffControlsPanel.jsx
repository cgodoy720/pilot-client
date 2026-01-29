import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Info, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  Building2,
  Play,
  Plus,
  Trash2
} from 'lucide-react';

function StaffControlsPanel({ 
  dayContent, 
  cohort, 
  onNavigate, 
  onEnterInteractive,
  onEditDayGoals,
  onAddTask,
  onDeleteDay,
  canEdit = false
}) {

  return (
    <div className="h-screen flex flex-col overflow-y-auto p-4">
      {/* Info Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900 font-proxima">Day Information</h3>
        </div>
        
        <div className="space-y-3">
          {/* Cohort Info */}
          {cohort && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-600 font-proxima mb-1">Cohort</div>
              <div className="font-medium text-slate-900 font-proxima">
                {cohort.cohort_name}
              </div>
              {cohort.organization_name && (
                <div className="text-sm text-slate-600 font-proxima mt-1">
                  <Building2 className="h-3 w-3 inline mr-1" />
                  {cohort.organization_name}
                </div>
              )}
            </div>
          )}

          {/* Day Details */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-600 font-proxima">Day Details</div>
              <Badge variant="outline" className="font-proxima">
                Day {dayContent.day?.day_number}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-proxima">
                <Calendar className="h-3 w-3" />
                {dayContent.day?.day_date && new Date(dayContent.day.day_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              
              <div className="flex items-center gap-2 text-slate-700 font-proxima">
                <Clock className="h-3 w-3" />
                Week {dayContent.day?.week}
              </div>

              {dayContent.day?.level && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 font-proxima">
                    {dayContent.day.level}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Task Stats */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-600 font-proxima mb-2">Content Stats</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between font-proxima">
                <span className="text-slate-600">Tasks:</span>
                <span className="font-medium text-slate-900">
                  {dayContent.flattenedTasks?.length || 0}
                </span>
              </div>
              <div className="flex justify-between font-proxima">
                <span className="text-slate-600">Deliverables:</span>
                <span className="font-medium text-slate-900">
                  {dayContent.flattenedTasks?.filter(t => t.deliverable).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 mb-3 font-proxima">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            onClick={onEnterInteractive}
            className="w-full justify-start font-proxima bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Enter Interactive Mode
          </Button>
          {canEdit && (
            <>
              <Button
                onClick={onEditDayGoals}
                variant="outline"
                className="w-full justify-start font-proxima"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Day Goals
              </Button>
              <Button
                onClick={onAddTask}
                variant="outline"
                className="w-full justify-start font-proxima"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
              <Button
                onClick={onDeleteDay}
                variant="outline"
                className="w-full justify-start font-proxima text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Day
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="font-semibold text-slate-900 mb-3 font-proxima">Navigation</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onNavigate('prev')}
            variant="outline"
            className="flex-1 font-proxima"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={() => onNavigate('next')}
            variant="outline"
            className="flex-1 font-proxima"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StaffControlsPanel;
