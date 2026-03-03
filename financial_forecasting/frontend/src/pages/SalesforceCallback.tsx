import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * This page handles the Salesforce OAuth callback.
 * Salesforce redirects to http://localhost:8080/callback (or the frontend origin)
 * with ?code=... query params. We forward the entire query string to the backend
 * which exchanges the code for tokens.
 */
const SalesforceCallback: React.FC = () => {
  useEffect(() => {
    // Forward the full callback (with ?code=...) to the backend's /callback endpoint
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const queryString = window.location.search; // e.g. ?code=abc123
    window.location.href = `${apiUrl}/callback${queryString}`;
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Connecting Salesforce...
      </Typography>
    </Box>
  );
};

export default SalesforceCallback;
