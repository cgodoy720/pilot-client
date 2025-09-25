import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const partnerDashboardUrl = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/';

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!isAdmin) {
    return (
      <Box className="admin-dashboard">
        <Alert severity="error">
          Access denied. Admin or staff privileges required.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="admin-dashboard">
      <Box className="admin-dashboard__iframe-container">
        {isLoading && (
          <Box className="admin-dashboard__loading">
            <CircularProgress />
            <Typography>Loading Admin Dashboard...</Typography>
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