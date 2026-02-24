import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { ArrowRight, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

const MoveTaskDialog = ({ 
  open, 
  onOpenChange, 
  task,
  currentDay,
  allDays,
  onMove
}) => {
  const [selectedTargetDay, setSelectedTargetDay] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    // Reset selection when dialog opens
    if (open) {
      setSelectedTargetDay(null);
    }
  }, [open]);

  const handleMove = async () => {
    if (!selectedTargetDay) {
      toast.error('Please select a target day');
      return;
    }

    if (selectedTargetDay.id === currentDay?.id) {
      toast.error('Task is already on this day');
      return;
    }

    setIsMoving(true);
    try {
      await onMove?.(task.id, selectedTargetDay.id);
      toast.success(`Moved task to Day ${selectedTargetDay.day_number}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to move task');
      console.error('Error moving task:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-xl">
            Move Task to Different Day
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            Select which day to move "{task?.task_title}" to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Day Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-proxima-bold text-blue-900 mb-1">
              Currently on:
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-proxima text-blue-900">
                Day {currentDay?.day_number} - {formatDate(currentDay?.day_date)}
              </span>
            </div>
            {currentDay?.daily_goal && (
              <p className="text-xs text-blue-700 font-proxima mt-2">
                {currentDay.daily_goal}
              </p>
            )}
          </div>

          {/* Available Days */}
          <div className="space-y-2">
            <p className="text-sm font-proxima-bold text-[#1E1E1E]">
              Select target day:
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {allDays?.filter(day => day.id !== currentDay?.id).map(day => (
                <Card 
                  key={day.id}
                  className={`cursor-pointer transition-all ${
                    selectedTargetDay?.id === day.id
                      ? 'border-[#4242EA] bg-blue-50'
                      : 'border-[#C8C8C8] hover:border-[#4242EA]'
                  }`}
                  onClick={() => setSelectedTargetDay(day)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-[#666]" />
                          <span className="font-proxima-bold text-[#1E1E1E]">
                            Day {day.day_number}
                          </span>
                          <Badge variant="outline" className="text-xs border-[#C8C8C8]">
                            {formatDate(day.day_date)}
                          </Badge>
                        </div>
                        {day.daily_goal && (
                          <p className="text-sm text-[#666] font-proxima">
                            {day.daily_goal}
                          </p>
                        )}
                      </div>
                      {selectedTargetDay?.id === day.id && (
                        <Check className="h-5 w-5 text-[#4242EA]" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E3E3E3]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-proxima"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedTargetDay || isMoving}
            className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            {isMoving ? 'Moving...' : `Move to Day ${selectedTargetDay?.day_number || ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveTaskDialog;
