// @ts-nocheck
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
import MonthFilter from '../../../components/MonthFilter';

const FeedbackSection = ({ cohortMonth }) => {
  const { user, token } = useAuth();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        console.log('Starting to fetch peer feedback data...');
        setLoading(true);
        
        // Debug what's in the auth context
        console.log('Auth context user:', user);
        console.log('Cohort month:', cohortMonth);
        
        // Extract user ID from auth context
        const userId = user?.user_id || 25; // Use user_id from context or fallback to 25
        console.log('Using user ID:', userId);
        
        const data = await fetchExternalPeerFeedback(userId, selectedMonth);
        console.log('Received external peer feedback data:', data);
        
        // Filter out feedback items with error messages
        const filteredData = data.filter(item => 
          item.summary && 
          !item.summary.includes('Error analyzing feedback')
        );
        console.log('Filtered feedback data:', filteredData);
        
        setFeedbackData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch peer feedback data:', err);
        setError(err.message || 'Failed to load peer feedback data');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackData();
  }, [user, token, selectedMonth, cohortMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

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
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
            Peer Feedback
          </Typography>
          
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <MonthFilter 
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              cohortMonth={cohortMonth}
            />
          </Box>
        </Box>
        <Typography sx={{ color: 'var(--color-text-secondary)' }}>
          No peer feedback available for the selected month.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="feedback-section">
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
          Peer Feedback
        </Typography>
        
        <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
          <MonthFilter 
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            cohortMonth={cohortMonth}
          />
        </Box>
      </Box>
      
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