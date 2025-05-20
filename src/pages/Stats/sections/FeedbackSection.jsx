import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchFeedbackSentiment } from '../../../utils/statsApi';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

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

  const getSentimentIcon = (score) => {
    if (score >= 0.6) return <SentimentSatisfiedIcon color="success" />;
    if (score >= 0.4) return <SentimentNeutralIcon color="warning" />;
    return <SentimentDissatisfiedIcon color="error" />;
  };

  const getSentimentColor = (score) => {
    if (score >= 0.6) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
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
        <Typography sx={{ color: 'var(--color-text-secondary)' }}>
          No sentiment analysis available yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="feedback-section">
      <Typography variant="h6" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
        Feedback Sentiment Analysis
      </Typography>
      <Grid container spacing={2}>
        {sentimentData.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                backgroundColor: 'var(--color-background-darker)',
                border: '1px solid var(--color-border)'
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {getSentimentIcon(item.sentiment_score)}
                <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {item.sentiment_type}
                </Typography>
                <Chip 
                  label={`${Math.round(item.sentiment_score * 100)}%`}
                  color={getSentimentColor(item.sentiment_score)}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              {item.summary && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                    p: 2,
                    pt: 1,
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 1
                  }}
                >
                  {item.summary}
                </Typography>
              )}
              {item.analysis && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {item.analysis}
                </Typography>
              )}
              {item.key_phrases && item.key_phrases.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>
                    Key Phrases:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {item.key_phrases.map((phrase, idx) => (
                      <Chip
                        key={idx}
                        label={phrase}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          backgroundColor: 'var(--color-background)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeedbackSection; 