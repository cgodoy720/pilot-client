import React, { useState, useRef } from 'react';
import {
  Button,
  Popover,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmSaveButtonProps {
  /** Called only after user clicks Confirm in the popover. Mutation fires here, NOT on initial click. */
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'warning' | 'error' | 'inherit';
  size?: 'small' | 'medium';
  startIcon?: React.ReactNode;
  children: React.ReactNode;
  /** Popover title — default: "Save to Salesforce?" */
  confirmTitle?: string;
  /** Popover body — default: "This saves to Salesforce. Changes are tracked in field history." */
  confirmMessage?: string;
  /** Confirm button label — default: "Confirm" */
  confirmLabel?: string;
  /** Additional sx for the outer button */
  sx?: Record<string, any>;
}

const ConfirmSaveButton: React.FC<ConfirmSaveButtonProps> = ({
  onConfirm,
  loading = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  size = 'small',
  startIcon,
  children,
  confirmTitle = 'Save to Salesforce?',
  confirmMessage = 'This saves to Salesforce. Changes are tracked in field history.',
  confirmLabel = 'Confirm',
  sx,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (!loading && !disabled) setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <Button
        ref={anchorRef}
        size={size}
        variant={variant}
        color={color}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={16} /> : startIcon}
        onClick={handleClick}
        sx={sx}
      >
        {children}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              maxWidth: 300,
              p: 2,
              bgcolor: '#fff3e0',
              border: '1px solid #ffcc80',
              borderRadius: 2,
              mt: 0.5,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <WarningIcon sx={{ color: '#e65100', fontSize: 20, mt: 0.2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100' }}>
            {confirmTitle}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#4e342e', mb: 2, lineHeight: 1.5 }}>
          {confirmMessage}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default ConfirmSaveButton;
