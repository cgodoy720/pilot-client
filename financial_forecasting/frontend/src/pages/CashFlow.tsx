import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CashFlow: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cash Flow Projections
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Cash flow projection details coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashFlow;
