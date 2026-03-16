import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { BuildCircle as ToolsIcon } from '@mui/icons-material';

const DataTools: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Data Tools
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ToolsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          CSV Import / Export & Data Cleanup
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Import data for any entity, export filtered views, and run cleanup utilities.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Chip label="CSV Import" size="small" />
          <Chip label="CSV Export" size="small" />
          <Chip label="Cleanup" size="small" />
        </Stack>
      </Paper>
    </Box>
  );
};

export default DataTools;
