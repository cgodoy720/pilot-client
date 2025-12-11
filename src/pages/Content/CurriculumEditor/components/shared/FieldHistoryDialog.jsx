import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const FieldHistoryDialog = ({ 
  open, 
  onOpenChange, 
  fieldName,
  taskId,
  onRevert,
  canEdit = true 
}) => {
  const [isReverting, setIsReverting] = useState(false);

  // Mock history data - will be replaced with real API call in Phase 2
  const mockHistory = [
    {
      id: 1,
      changed_by_name: 'Sarah Johnson',
      changed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      old_value: 'Build the tallest tower using AI assistance',
      new_value: 'Build the tallest tower with AI assistance while learning collaborative problem-solving and effective prompting',
      batch_id: null
    },
    {
      id: 2,
      changed_by_name: 'Michael Chen',
      changed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      old_value: 'Build the tallest tower',
      new_value: 'Build the tallest tower using AI assistance',
      batch_id: null
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const handleRevert = async (change) => {
    if (!window.confirm(`Are you sure you want to revert "${fieldName}" to the selected value?`)) {
      return;
    }

    setIsReverting(true);
    try {
      await onRevert?.(fieldName, change.old_value);
      toast.success(`Reverted ${fieldName} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to revert change');
      console.error('Error reverting:', error);
    } finally {
      setIsReverting(false);
    }
  };

  const formatFieldName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-xl">
            Change History
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            View all changes to <span className="font-proxima-bold">{formatFieldName(fieldName)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {mockHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-[#C8C8C8] mx-auto mb-3" />
              <p className="text-[#666] font-proxima">No change history available</p>
              <p className="text-sm text-[#999] font-proxima mt-1">
                This field hasn't been edited yet
              </p>
            </div>
          ) : (
            mockHistory.map((change, index) => (
              <Card key={change.id} className="border-[#E3E3E3]">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-proxima-bold text-[#1E1E1E]">
                          {change.changed_by_name}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-[#4242EA] text-white text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#666]">
                        <Clock className="h-3 w-3" />
                        <span className="font-proxima">{formatDate(change.changed_at)}</span>
                      </div>
                    </div>
                    {canEdit && index > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRevert(change)}
                        disabled={isReverting}
                        className="border-[#C8C8C8] text-[#666] hover:text-[#4242EA] hover:border-[#4242EA]"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Revert to this
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {change.old_value && (
                    <div className="space-y-1">
                      <p className="text-xs text-[#666] font-proxima-bold">Previous Value:</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                          {change.old_value}
                        </pre>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-[#666] font-proxima-bold">
                      {index === 0 ? 'Current Value:' : 'Changed To:'}
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                        {change.new_value}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E3E3E3]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-proxima"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FieldHistoryDialog;
