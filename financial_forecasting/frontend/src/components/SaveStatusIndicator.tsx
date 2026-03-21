import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material';

interface SaveStatusIndicatorProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  /** How long to show "Saved!" before fading (ms). Default: 2000 */
  successDuration?: number;
  /** Custom success text. Default: "Saved!" */
  successText?: string;
  /** Custom error text. Default: "Failed to save" */
  errorText?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isLoading,
  isSuccess,
  isError,
  successDuration = 2000,
  successText = 'Saved!',
  errorText = 'Failed to save',
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), successDuration);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, successDuration]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <CircularProgress size={14} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          Saving...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
        <Typography variant="caption" sx={{ color: 'error.main', fontSize: '0.7rem' }}>
          {errorText}
        </Typography>
      </Box>
    );
  }

  if (showSuccess) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
        <Typography variant="caption" sx={{ color: 'success.main', fontSize: '0.7rem', fontWeight: 600 }}>
          {successText}
        </Typography>
      </Box>
    );
  }

  return null;
};

export default SaveStatusIndicator;
