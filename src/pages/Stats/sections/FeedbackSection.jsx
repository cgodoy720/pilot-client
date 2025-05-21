import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchExternalPeerFeedback } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const FeedbackSection = () => {
  const { user, token } = useAuth();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        console.log('Starting to fetch peer feedback data...');
        setLoading(true);
        
        // Debug what's in the auth context
        console.log('Auth context user:', user);
        
        // For now, use a hardcoded user ID for testing
        // Later we can extract from the real user object
        const userId = 25; // Using hardcoded ID for testing
        console.log('Using hardcoded user ID:', userId);
        
        const data = await fetchExternalPeerFeedback(userId);
        console.log('Received external peer feedback data:', data);
        setFeedbackData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch peer feedback data:', err);
        setError(err.message || 'Failed to load peer feedback data');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackData();
  }, [user, token]);

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.value) return 'Unknown date';
    
    // Parse the timestamp value (which is in format: '2025-05-20T01:54:19.570238000Z')
    const date = new Date(timestamp.value);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Peer Feedback
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!feedbackData || !Array.isArray(feedbackData) || feedbackData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography sx={{ color: 'var(--color-text-secondary)' }}>
          No peer feedback available yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="feedback-section">
      <Typography variant="h6" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
        Peer Feedback
      </Typography>
      <Grid container spacing={2}>
        {feedbackData.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              variant="outlined" 
              sx={{ 
                backgroundColor: 'var(--color-background-darker)',
                border: '1px solid var(--color-border)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarTodayIcon fontSize="small" sx={{ color: 'var(--color-text-secondary)', fontSize: 14 }} />
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                      {formatDate(item.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                    py: 1,
                    px: 2,
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 1,
                    textAlign: 'left'
                  }}
                >
                  {item.summary || 'No summary available.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeedbackSection; 