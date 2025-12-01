import React from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNetworkStatus } from '../../utils/networkStatus';

const OfflineModeMessage = ({ 
  showCachedData = false, 
  cachedDataCount = 0,
  onRetry,
  children 
}) => {
  const { isOnline, queuedActions, networkStatus } = useNetworkStatus(React);

  if (isOnline) {
    return children;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      networkStatus.processQueuedActions();
    }
  };

  return (
    <div className="w-full">
      {/* Offline Alert */}
      <div className="flex items-start gap-3 p-4 mb-4 rounded-lg bg-amber-50 border border-amber-200">
        <WifiOff className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-amber-800 mb-1">You're currently offline</p>
          <p className="text-sm text-amber-700">
            {queuedActions > 0 
              ? `${queuedActions} action(s) will be synced when you reconnect.`
              : 'Some features may be limited while offline.'
            }
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 rounded-lg text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>

      {/* Cached Data Indicator */}
      {showCachedData && cachedDataCount > 0 && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-lg bg-blue-50 border border-blue-200">
          <CloudOff className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700 flex-1">
            Showing cached data from your last online session
          </p>
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            {cachedDataCount} items
          </Badge>
        </div>
      )}

      {/* Offline Content */}
      <div className="opacity-70 pointer-events-none grayscale-[0.3]">
        {children}
      </div>
    </div>
  );
};

export default OfflineModeMessage;
