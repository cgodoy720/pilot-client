// @ts-nocheck
import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const partnerDashboardUrl = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Box className="admin-dashboard">
      <Box className="admin-dashboard__iframe-container">
        {isLoading && (
          <Box className="admin-dashboard__loading">
            <CircularProgress />
            <Typography>Loading dashboard...</Typography>
          </Box>
        )}
        <iframe 
          src={partnerDashboardUrl}
          title="Admin Dashboard"
          className="admin-dashboard__iframe"
          onLoad={handleIframeLoad}
          allow="fullscreen"
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard; 