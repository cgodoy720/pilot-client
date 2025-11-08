import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Settings and configuration coming soon...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
