import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';

const StatusTab = ({ showNotification, reloadPrompts }) => {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentPrompt();
  }, []);

  const fetchCurrentPrompt = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/current-system-prompt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPrompt(data);
      } else {
        throw new Error('Failed to fetch current system prompt');
      }
    } catch (error) {
      console.error('Error fetching current prompt:', error);
      showNotification('Failed to load current system prompt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    await reloadPrompts();
    await fetchCurrentPrompt();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentPrompt) {
    return (
      <Alert severity="error">
        Failed to load current system prompt. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
            Current AI System Prompt
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            This is the complete assembled prompt that gets sent to the AI API for a sample task.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
          >
            Reload & Refresh
          </Button>
        </div>
      </div>

      <Card sx={{ mt: 2, backgroundColor: 'var(--color-background-darker)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
            Current Assembled System Prompt
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'var(--color-text-secondary)' }}>
            Generated: {new Date(currentPrompt.assembled_at).toLocaleString()}
          </Typography>
          
          <Box 
            sx={{ 
              backgroundColor: '#1A1F2C', 
              color: '#fff',
              padding: 2,
              borderRadius: 1,
              maxHeight: '60vh',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}
          >
            {currentPrompt.complete_system_prompt}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2, backgroundColor: 'var(--color-background-darker)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
            Sample Task Used for Demo
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'var(--color-text-secondary)' }}>
            This sample task shows how variables are replaced in the prompt.
          </Typography>
          
          <Box 
            sx={{ 
              backgroundColor: '#1A1F2C', 
              padding: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              textAlign: 'left'
            }}
          >
            <pre style={{ color: '#fff', margin: 0 }}>{JSON.stringify(currentPrompt.components.sample_task, null, 2)}</pre>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusTab;
