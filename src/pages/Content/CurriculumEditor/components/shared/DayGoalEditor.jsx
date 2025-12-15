import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { Label } from '../../../../../components/ui/label';
import { Save, X, History } from 'lucide-react';
import { toast } from 'sonner';

const DayGoalEditor = ({ 
  open, 
  onOpenChange, 
  day,
  week,
  onSave,
  onViewFieldHistory,
  canEdit = true 
}) => {
  const [formData, setFormData] = useState({
    daily_goal: '',
    weekly_goal: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (day || week) {
      setFormData({
        daily_goal: day?.daily_goal || '',
        weekly_goal: week?.weeklyGoal || day?.weekly_goal || ''
      });
    }
  }, [day, week]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(formData);
      toast.success('Goals updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save goals');
      console.error('Error saving goals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-xl">
            {canEdit ? 'Edit Day & Week Goals' : 'View Goals'}
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            {canEdit ? 'Update the daily and weekly learning goals' : 'Goals (read-only)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Daily Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily_goal" className="font-proxima-bold">
                Daily Goal
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onViewFieldHistory?.('daily_goal')}
                className="h-8 text-[#666] hover:text-[#4242EA]"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
            <Textarea
              id="daily_goal"
              value={formData.daily_goal}
              onChange={(e) => setFormData(prev => ({ ...prev, daily_goal: e.target.value }))}
              disabled={!canEdit}
              rows={3}
              placeholder="What should students accomplish today?"
              className="font-proxima"
            />
            <p className="text-xs text-[#666] font-proxima">
              The main learning objective for this specific day
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly_goal" className="font-proxima-bold">
                Weekly Goal
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onViewFieldHistory?.('weekly_goal')}
                className="h-8 text-[#666] hover:text-[#4242EA]"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
            <Textarea
              id="weekly_goal"
              value={formData.weekly_goal}
              onChange={(e) => setFormData(prev => ({ ...prev, weekly_goal: e.target.value }))}
              disabled={!canEdit}
              rows={3}
              placeholder="What should students accomplish this week?"
              className="font-proxima"
            />
            <p className="text-xs text-[#666] font-proxima">
              The overarching theme or objective for the entire week
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E3E3E3]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-proxima"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save Goals'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayGoalEditor;
