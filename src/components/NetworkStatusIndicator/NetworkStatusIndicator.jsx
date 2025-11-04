import React from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography,
  IconButton,
  Badge
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNetworkStatus } from '../../utils/networkStatus';

const NetworkStatusIndicator = ({ onRetry }) => {
  const { isOnline, queuedActions, networkStatus } = useNetworkStatus(React);

  const getStatusColor = () => {
    if (isOnline) {
      return queuedActions > 0 ? 'warning' : 'success';
    }
    return 'error';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return queuedActions > 0 ? <SyncIcon /> : <WifiIcon />;
    }
    return <WifiOffIcon />;
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
      // Force process queued actions
      networkStatus.processQueuedActions();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={getTooltipText()} arrow>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          variant={isOnline ? 'filled' : 'outlined'}
          onClick={queuedActions > 0 ? handleRetry : undefined}
          sx={{
            cursor: queuedActions > 0 ? 'pointer' : 'default',
            '&:hover': queuedActions > 0 ? {
              backgroundColor: 'var(--color-primary-hover)',
              color: 'white'
            } : {}
          }}
        />
      </Tooltip>
      
      {!isOnline && (
        <Tooltip title="Retry connection" arrow>
          <IconButton 
            size="small" 
            onClick={handleRetry}
            sx={{ 
              color: 'var(--color-text-secondary)',
              '&:hover': {
                color: 'var(--color-primary)'
              }
            }}
          >
            <ErrorOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default NetworkStatusIndicator;
