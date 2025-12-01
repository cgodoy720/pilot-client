import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNetworkStatus } from '../../utils/networkStatus';

const NetworkStatusIndicator = ({ onRetry }) => {
  const { isOnline, queuedActions, networkStatus } = useNetworkStatus(React);

  const getStatusColor = () => {
    if (isOnline) {
      return queuedActions > 0 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-green-100 text-green-700 border-green-300';
    }
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return queuedActions > 0 ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />;
    }
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isOnline) {
      return queuedActions > 0 ? `Syncing (${queuedActions})` : 'Online';
    }
    return 'Offline';
  };

  const getTooltipText = () => {
    if (isOnline) {
      if (queuedActions > 0) {
        return `${queuedActions} action(s) queued for sync. Click to retry now.`;
      }
      return 'Connected to network';
    }
    return 'No network connection. Actions will be queued for when you reconnect.';
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      networkStatus.processQueuedActions();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={queuedActions > 0 ? handleRetry : undefined}
        title={getTooltipText()}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor()} ${queuedActions > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
      >
        {getStatusIcon()}
        {getStatusText()}
      </button>
      
      {!isOnline && (
        <button
          onClick={handleRetry}
          title="Retry connection"
          className="p-1.5 hover:bg-[#EFEFEF] rounded-md transition-colors"
        >
          <AlertCircle className="h-4 w-4 text-[#666666] hover:text-[#4242EA]" />
        </button>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
