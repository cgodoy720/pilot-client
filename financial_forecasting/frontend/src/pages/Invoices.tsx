import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Invoices: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Invoice management coming soon... (requires Sage Intacct connection)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Invoices;
