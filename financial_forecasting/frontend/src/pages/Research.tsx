import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Science as ResearchIcon } from '@mui/icons-material';

const Research: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Research
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ResearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Prospect Research Hub
        </Typography>
        <Typography color="text.secondary">
          Upload CSV or paste names to run batch 990 enrichment, HNWI scoring, and network mapping.
          Full research workflow coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Research;
