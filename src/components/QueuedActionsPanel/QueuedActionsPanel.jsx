import React, { useState, useEffect } from 'react';
import { Play, Trash2, ChevronDown, ChevronUp, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import attendanceActionQueue from '../../utils/attendanceActionQueue';
import { useNetworkStatus } from '../../utils/networkStatus';

const QueuedActionsPanel = () => {
  const { isOnline } = useNetworkStatus(React);
  const [queuedActions, setQueuedActions] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState(null);

  useEffect(() => {
    const updateActions = () => {
      setQueuedActions(attendanceActionQueue.getQueuedActions());
    };

    updateActions();
    const interval = setInterval(updateActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessQueue = async () => {
    if (!isOnline) {
      alert('You must be online to process queued actions');
      return;
    }

    setProcessing(true);
    try {
      const results = await attendanceActionQueue.processQueue();
      setLastProcessed(new Date());
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) console.log(`✅ Successfully processed ${successCount} queued actions`);
      if (failureCount > 0) console.error(`❌ Failed to process ${failureCount} queued actions`);
      
      setQueuedActions(attendanceActionQueue.getQueuedActions());
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAction = (actionId) => {
    attendanceActionQueue.removeAction(actionId);
    setQueuedActions(attendanceActionQueue.getQueuedActions());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all queued actions?')) {
      attendanceActionQueue.clearQueue();
      setQueuedActions([]);
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'excuse_submission': return '📝';
      case 'csv_export': return '📊';
      case 'bulk_excuse': return '👥';
      default: return '⚡';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'excuse_submission': return 'bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/30';
      case 'csv_export': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'bulk_excuse': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (queuedActions.length === 0) return null;

  return (
    <Card className="mb-4 bg-white border-[#C8C8C8]">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#1E1E1E]">Queued Actions ({queuedActions.length})</h3>
            <Badge className={isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {isOnline ? 'Ready to sync' : 'Waiting for connection'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleProcessQueue}
              disabled={!isOnline || processing || queuedActions.length === 0}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full text-sm font-medium text-white transition-colors duration-300 disabled:opacity-50"
            >
              {processing ? <RefreshCw className="h-4 w-4 animate-spin relative z-10" /> : <Play className="h-4 w-4 relative z-10" />}
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                {processing ? 'Processing...' : 'Process All'}
              </span>
              <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4 text-[#666666]" /> : <ChevronDown className="h-4 w-4 text-[#666666]" />}
            </button>
          </div>
        </div>

        {lastProcessed && (
          <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Last processed: {lastProcessed.toLocaleTimeString()}</span>
          </div>
        )}

        {expanded && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-[#666666]">Actions will be processed when you're back online</p>
              <button onClick={handleClearAll} disabled={queuedActions.length === 0} className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50">
                Clear All
              </button>
            </div>
            
            <div className="space-y-2">
              {queuedActions.map((action, index) => (
                <div key={action.id} className={`flex items-center justify-between p-3 rounded-lg bg-[#F9F9F9] border border-[#E3E3E3] ${index < queuedActions.length - 1 ? '' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getActionIcon(action.type)}</span>
                    <Badge variant="outline" className={getActionColor(action.type)}>
                      {action.type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="text-sm text-[#1E1E1E]">{action.description}</p>
                      <p className="text-xs text-[#666666]">{formatTimestamp(action.timestamp)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveAction(action.id)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="h-4 w-4 text-[#666666] hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueuedActionsPanel;
