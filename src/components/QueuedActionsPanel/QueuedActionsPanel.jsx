import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Collapse,
  Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
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

    // Update actions immediately
    updateActions();

    // Update actions every 5 seconds
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
      
      // Show results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        console.log(`✅ Successfully processed ${successCount} queued actions`);
      }
      if (failureCount > 0) {
        console.error(`❌ Failed to process ${failureCount} queued actions`);
      }
      
      // Update the actions list
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
      case 'excuse_submission':
        return '📝';
      case 'csv_export':
        return '📊';
      case 'bulk_excuse':
        return '👥';
      default:
        return '⚡';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'excuse_submission':
        return 'primary';
      case 'csv_export':
        return 'secondary';
      case 'bulk_excuse':
        return 'warning';
      default:
        return 'default';
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

  if (queuedActions.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div">
              Queued Actions ({queuedActions.length})
            </Typography>
            <Chip 
              label={isOnline ? 'Ready to sync' : 'Waiting for connection'} 
              color={isOnline ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={processing ? <SyncIcon /> : <PlayArrowIcon />}
              onClick={handleProcessQueue}
              disabled={!isOnline || processing || queuedActions.length === 0}
              sx={{ minWidth: 120 }}
            >
              {processing ? 'Processing...' : 'Process All'}
            </Button>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {lastProcessed && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Last processed: {lastProcessed.toLocaleTimeString()}
          </Alert>
        )}

        <Collapse in={expanded}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Actions will be processed when you're back online
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={handleClearAll}
                disabled={queuedActions.length === 0}
              >
                Clear All
              </Button>
            </Box>
            
            <List dense>
              {queuedActions.map((action, index) => (
                <React.Fragment key={action.id}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                      <Typography variant="body2">
                        {getActionIcon(action.type)}
                      </Typography>
                      <Chip
                        label={action.type.replace('_', ' ')}
                        color={getActionColor(action.type)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <ListItemText
                      primary={action.description}
                      secondary={formatTimestamp(action.timestamp)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveAction(action.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < queuedActions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default QueuedActionsPanel;
