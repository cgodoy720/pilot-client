import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchFeedbackSentiment } from '../../../utils/statsApi';

const FeedbackSection = () => {
  const { token } = useAuth();
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        console.log('Starting to fetch sentiment data...');
        setLoading(true);
        const data = await fetchFeedbackSentiment(token);
        console.log('Received sentiment data:', data);
        setSentimentData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch sentiment data:', err);
        setError(err.message || 'Failed to load sentiment analysis');
      } finally {
        setLoading(false);
      }
    };

    loadSentimentData();
  }, [token]);

  console.log('Current state:', { loading, error, sentimentData });

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
          Error Loading Sentiment Analysis
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!sentimentData || sentimentData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="textSecondary">No sentiment analysis available yet.</Typography>
      </Box>
    );
  }

  return (
    <Box className="feedback-section">
      <Typography variant="h6" gutterBottom>
        Feedback Sentiment Analysis
      </Typography>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          backgroundColor: 'var(--color-background-darker)',
          border: '1px solid var(--color-border)'
        }}
      >
        {sentimentData.map((item, index) => {
          console.log('Rendering sentiment item:', item);
          return (
            <Box key={index} mb={index < sentimentData.length - 1 ? 2 : 0}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {item.sentiment_type}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.analysis}
              </Typography>
              {item.score && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Confidence Score: {item.score}%
                  </Typography>
                </Box>
              )}
              {index < sentimentData.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default FeedbackSection; 