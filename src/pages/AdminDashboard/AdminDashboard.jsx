import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const partnerDashboardUrl = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Box className="admin-dashboard">
      <Box className="admin-dashboard__header">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box className="admin-dashboard__nav">
          <Button
            component={Link}
            to="/admin/assessment-grades"
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
          >
            Assessment Grades
          </Button>
          <Button
            component={Link}
            to="/admin-prompts"
            variant="outlined"
            color="primary"
          >
            Admin Prompts
          </Button>
        </Box>
      </Box>
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