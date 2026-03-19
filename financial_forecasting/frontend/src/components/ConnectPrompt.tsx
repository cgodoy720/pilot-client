import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ConnectPromptProps {
  service: 'Salesforce' | 'Google' | string;
  message?: string;
}

/**
 * Reusable prompt shown when a service isn't connected yet.
 * Links to /settings where users can connect integrations.
 */
const ConnectPrompt: React.FC<ConnectPromptProps> = ({ service, message }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {message || `Connect ${service} in Settings to see this data.`}
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={() => navigate('/settings')}
      >
        Go to Settings
      </Button>
    </Box>
  );
};

export default ConnectPrompt;
