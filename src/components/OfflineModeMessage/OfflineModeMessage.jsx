import React from 'react';
import { 
  Alert, 
  Box, 
  Typography, 
  Button,
  Chip
} from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudOffIcon from '@mui/icons-material/CloudOff';
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
    <Box sx={{ width: '100%' }}>
      {/* Offline Alert */}
      <Alert 
        severity="warning" 
        icon={<WifiOffIcon />}
        sx={{ 
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              You're currently offline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {queuedActions > 0 
                ? `${queuedActions} action(s) will be synced when you reconnect.`
                : 'Some features may be limited while offline.'
              }
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Alert>

      {/* Cached Data Indicator */}
      {showCachedData && cachedDataCount > 0 && (
        <Alert 
          severity="info" 
          icon={<CloudOffIcon />}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Showing cached data from your last online session
            </Typography>
            <Chip 
              label={`${cachedDataCount} items`} 
              size="small" 
              variant="outlined"
            />
          </Box>
        </Alert>
      )}

      {/* Offline Content */}
      <Box sx={{ 
        opacity: 0.7,
        pointerEvents: 'none',
        filter: 'grayscale(0.3)'
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default OfflineModeMessage;
