import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = "You don't have access to this page. Contact an admin to request permission.",
}) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
      <LockIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">{message}</Typography>
      <Button variant="outlined" onClick={() => navigate('/priorities')}>Go to Priorities</Button>
    </Box>
  );
};

export default AccessDenied;
