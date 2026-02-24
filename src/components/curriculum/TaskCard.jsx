import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, History, Clock, Trash2 } from 'lucide-react';

const TaskCard = ({ 
  task, 
  onEdit, 
  onViewHistory,
  onDelete,
  canEdit = true,
  lastModified = null
}) => {
  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Truncate description for preview
  const getDescriptionPreview = (description) => {
    if (!description) return 'No description';
    return description.length > 150 
      ? description.substring(0, 150) + '...' 
      : description;
  };

  return (
    <Card className="bg-white border-[#C8C8C8] hover:border-[#4242EA] hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-proxima-bold text-[#1E1E1E] text-lg flex items-center gap-2 flex-wrap">
              <span className="truncate">{task.task_title}</span>
              {task.task_type && (
                <Badge 
                  variant="outline" 
                  className="shrink-0 border-[#C8C8C8] text-[#666]"
                >
                  {task.task_type}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="font-proxima text-[#666] mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {task.block_category && `${task.block_category} • `}
              {formatTime(task.start_time)} - {formatTime(task.end_time)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-[#666] font-proxima">
          {getDescriptionPreview(task.task_description)}
        </p>

        <div className="flex gap-2 flex-wrap">
          {canEdit && (
            <>
              <Button
                size="sm"
                onClick={() => onEdit?.(task)}
                className="bg-[#4242EA] hover:bg-[#3535D1] text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete?.(task)}
                className="border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewHistory?.(task)}
            className="border-[#C8C8C8] text-[#666] hover:text-[#4242EA] hover:border-[#4242EA]"
          >
            <History className="h-4 w-4 mr-1" />
            View History
          </Button>
        </div>

        {lastModified && (
          <div className="text-xs text-[#666] font-proxima pt-2 border-t border-[#E3E3E3]">
            Last edited by {lastModified.user} on {lastModified.date}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
