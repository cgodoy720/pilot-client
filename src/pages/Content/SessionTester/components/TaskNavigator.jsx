import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

const TaskNavigator = ({ 
  tasks, 
  currentTaskIndex, 
  onTaskChange 
}) => {
  if (!tasks || tasks.length === 0) return null;
  
  const currentTask = tasks[currentTaskIndex];

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTaskTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'group':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'individual':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'discussion':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="border-[#C8C8C8]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTaskChange(currentTaskIndex - 1)}
            disabled={currentTaskIndex === 0}
            className="border-[#C8C8C8]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-center flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="font-proxima-bold text-[#1E1E1E] truncate">
                {currentTask?.title || 'Untitled Task'}
              </span>
              {currentTask?.type && (
                <Badge className={getTaskTypeColor(currentTask.type)}>
                  {currentTask.type}
                </Badge>
              )}
              <Badge variant="outline" className="border-[#C8C8C8]">
                {currentTaskIndex + 1} of {tasks.length}
              </Badge>
            </div>
            
            {(currentTask?.startTime || currentTask?.endTime) && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#666]">
                <Clock className="h-3 w-3" />
                <span className="font-proxima">
                  {formatTime(currentTask.startTime)} - {formatTime(currentTask.endTime)}
                </span>
              </div>
            )}
            
            {currentTask?.category && (
              <p className="text-xs text-[#666] font-proxima mt-1">
                {currentTask.category}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTaskChange(currentTaskIndex + 1)}
            disabled={currentTaskIndex === tasks.length - 1}
            className="border-[#C8C8C8]"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Task Progress Dots */}
        {tasks.length > 1 && (
          <div className="flex justify-center gap-1 mt-3 flex-wrap">
            {tasks.map((task, index) => (
              <button
                key={index}
                onClick={() => onTaskChange(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentTaskIndex
                    ? 'w-6 bg-[#4242EA]'
                    : task.completed
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-[#C8C8C8]'
                }`}
                title={task.title}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskNavigator;
