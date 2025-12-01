import React, { useState, useEffect } from 'react';
import { X, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useNetworkStatus } from '../../utils/networkStatus';
import attendanceActionQueue from '../../utils/attendanceActionQueue';

const ConnectivityNotification = () => {
  const { isOnline, queuedActions, networkStatus } = useNetworkStatus(React);
  const [notification, setNotification] = useState(null);
  const [previousOnlineStatus, setPreviousOnlineStatus] = useState(isOnline);
  const [processedActions, setProcessedActions] = useState(0);

  useEffect(() => {
    if (isOnline !== previousOnlineStatus) {
      if (isOnline && !previousOnlineStatus) {
        setNotification({
          type: 'success',
          title: 'Connection Restored',
          message: "You're back online. Syncing queued actions...",
          icon: <Wifi className="h-5 w-5" />,
          autoHideDuration: 4000
        });
        
        setTimeout(async () => {
          try {
            const results = await attendanceActionQueue.processQueue();
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;
            
            if (successCount > 0) {
              setProcessedActions(successCount);
              setNotification({
                type: 'success',
                title: 'Actions Synced',
                message: `Successfully processed ${successCount} queued action${successCount > 1 ? 's' : ''}`,
                icon: <CheckCircle className="h-5 w-5" />,
                autoHideDuration: 5000
              });
            }
            
            if (failureCount > 0) {
              setNotification({
                type: 'warning',
                title: 'Some Actions Failed',
                message: `${failureCount} action${failureCount > 1 ? 's' : ''} could not be processed. Check the queued actions panel.`,
                icon: <RefreshCw className="h-5 w-5" />,
                autoHideDuration: 6000
              });
            }
          } catch (error) {
            console.error('Error processing queued actions:', error);
          }
        }, 1000);
        
      } else if (!isOnline && previousOnlineStatus) {
        setNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: "You're now offline. Actions will be queued for when you reconnect.",
          icon: <WifiOff className="h-5 w-5" />,
          autoHideDuration: 5000
        });
      }
      
      setPreviousOnlineStatus(isOnline);
    }
  }, [isOnline, previousOnlineStatus]);

  useEffect(() => {
    if (queuedActions > 0 && isOnline) {
      setNotification({
        type: 'info',
        title: 'Actions Queued',
        message: `${queuedActions} action${queuedActions > 1 ? 's' : ''} ready to sync`,
        icon: <RefreshCw className="h-5 w-5" />,
        autoHideDuration: 3000
      });
    }
  }, [queuedActions, isOnline]);

  useEffect(() => {
    if (notification?.autoHideDuration) {
      const timer = setTimeout(() => setNotification(null), notification.autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => setNotification(null);

  const handleRetryConnection = () => {
    networkStatus.checkConnectivity();
    setNotification(null);
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-600 text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'error': return 'bg-red-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  if (!notification) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-md ${getColors(notification.type)}`}>
        <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        <div className="flex items-center gap-1">
          {!isOnline && (
            <button
              onClick={handleRetryConnection}
              className="px-2 py-1 text-sm font-medium hover:bg-white/20 rounded transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectivityNotification;
