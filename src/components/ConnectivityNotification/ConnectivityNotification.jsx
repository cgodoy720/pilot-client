import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  Box,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNetworkStatus } from '../../utils/networkStatus';
import attendanceActionQueue from '../../utils/attendanceActionQueue';

const ConnectivityNotification = () => {
  const { isOnline, queuedActions, networkStatus } = useNetworkStatus(React);
  const [notification, setNotification] = useState(null);
  const [previousOnlineStatus, setPreviousOnlineStatus] = useState(isOnline);
  const [processedActions, setProcessedActions] = useState(0);

  useEffect(() => {
    // Handle online/offline status changes
    if (isOnline !== previousOnlineStatus) {
      if (isOnline && !previousOnlineStatus) {
        // Just came back online
        setNotification({
          type: 'success',
          title: 'Connection Restored',
          message: 'You\'re back online. Syncing queued actions...',
          icon: <WifiIcon />,
          autoHideDuration: 4000
        });
        
        // Process queued actions
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
                icon: <CheckCircleIcon />,
                autoHideDuration: 5000
              });
            }
            
            if (failureCount > 0) {
              setNotification({
                type: 'warning',
                title: 'Some Actions Failed',
                message: `${failureCount} action${failureCount > 1 ? 's' : ''} could not be processed. Check the queued actions panel.`,
                icon: <SyncIcon />,
                autoHideDuration: 6000
              });
            }
          } catch (error) {
            console.error('Error processing queued actions:', error);
          }
        }, 1000);
        
      } else if (!isOnline && previousOnlineStatus) {
        // Just went offline
        setNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: 'You\'re now offline. Actions will be queued for when you reconnect.',
          icon: <WifiOffIcon />,
          autoHideDuration: 5000
        });
      }
      
      setPreviousOnlineStatus(isOnline);
    }
  }, [isOnline, previousOnlineStatus]);

  useEffect(() => {
    // Handle queued actions changes
    if (queuedActions > 0 && isOnline) {
      setNotification({
        type: 'info',
        title: 'Actions Queued',
        message: `${queuedActions} action${queuedActions > 1 ? 's' : ''} ready to sync`,
        icon: <SyncIcon />,
        autoHideDuration: 3000
      });
    }
  }, [queuedActions, isOnline]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(null);
  };

  const handleRetryConnection = () => {
    networkStatus.checkConnectivity();
    setNotification(null);
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  if (!notification) {
    return null;
  }

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(notification.type)}
        variant="filled"
        icon={notification.icon}
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isOnline && (
              <Button
                color="inherit"
                size="small"
                onClick={handleRetryConnection}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Retry
              </Button>
            )}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ color: 'white', fontWeight: 600 }}>
          {notification.title}
        </AlertTitle>
        <Typography variant="body2" sx={{ color: 'white' }}>
          {notification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default ConnectivityNotification;
