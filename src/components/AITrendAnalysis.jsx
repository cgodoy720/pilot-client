import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const AITrendAnalysis = ({ analysisType, cohortMonth, title }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Calculate cohort start date for date input limits
  const getCohortStartDate = () => {
    if (!cohortMonth || typeof cohortMonth !== 'string') {
      return '2024-01-01';
    }
    
    try {
      const [year, month] = cohortMonth.split('-').map(Number);
      
      // Validate year and month
      if (!year || !month || year < 2020 || year > 2030 || month < 1 || month > 12) {
        return '2024-01-01';
      }
      
      const date = new Date(year, month - 1, 1);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return '2024-01-01';
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing cohort month:', error);
      return '2024-01-01';
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleGenerateAnalysis = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate >= endDate) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analyze-task/trend-analysis`,
        {
          startDate: startDate,
          endDate: endDate,
          analysisType: analysisType
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setAnalysis(response.data);
      setExpanded(true);
    } catch (err) {
      console.error('Error generating trend analysis:', err);
      setError(err.response?.data?.error || 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 3,
        backgroundColor: '#1a1f2e',
        border: '1px solid var(--color-border)',
        borderRadius: 2
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon sx={{ mr: 1, color: 'var(--color-primary)' }} />
          <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
            {title} Trend Analysis
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
          Generate AI-powered insights about your learning progress and trends over a selected time period.
        </Typography>

        {/* Date Selection */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: getCohortStartDate(),
              max: getTodayDate()
            }}
            size="small"
            sx={{ 
              minWidth: 150,
              '& .MuiInputBase-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text-primary)'
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-secondary)'
              }
            }}
          />
          
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: startDate || getCohortStartDate(),
              max: getTodayDate()
            }}
            size="small"
            sx={{ 
              minWidth: 150,
              '& .MuiInputBase-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text-primary)'
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-secondary)'
              }
            }}
          />

          <Button
            variant="contained"
            onClick={handleGenerateAnalysis}
            disabled={loading || !startDate || !endDate}
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-dark)'
              }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Generate Analysis'}
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                Analysis Results ({formatDate(analysis.period.startDate)} - {formatDate(analysis.period.endDate)})
              </Typography>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Statistics Summary */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip 
                label={`${analysis.dataCount} submissions`} 
                size="small" 
                color="primary" 
              />
              {analysis.statistics?.averageScore > 0 && (
                <Chip 
                  label={`${analysis.statistics.averageScore}% avg score`} 
                  size="small" 
                  color="success" 
                />
              )}
            </Box>

            <Collapse in={expanded}>
              {/* Summary */}
              <Box mb={3}>
                <Typography variant="body1" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>
                  <strong>Summary:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', opacity: 0.9 }}>
                  {analysis.summary}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Trends */}
              {analysis.trends && analysis.trends.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold', mb: 1 }}>
                    Key Trends:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {analysis.trends.map((trend, index) => (
                      <Typography key={index} component="li" variant="body2" sx={{ color: 'var(--color-text-primary)', mb: 0.5 }}>
                        {trend}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold', mb: 1 }}>
                    Strengths:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {analysis.strengths.map((strength, index) => (
                      <Chip
                        key={index}
                        label={strength}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Growth Areas */}
              {analysis.growth_areas && analysis.growth_areas.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold', mb: 1 }}>
                    Growth Areas:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {analysis.growth_areas.map((area, index) => (
                      <Chip
                        key={index}
                        label={area}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 'bold', mb: 1 }}>
                    Recommendations:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {analysis.recommendations.map((recommendation, index) => (
                      <Typography key={index} component="li" variant="body2" sx={{ color: 'var(--color-text-primary)', mb: 0.5 }}>
                        {recommendation}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AITrendAnalysis; 