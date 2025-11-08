import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Forecasting reports coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
