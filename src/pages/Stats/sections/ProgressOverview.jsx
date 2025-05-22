import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const ProgressOverview = ({ stats }) => {
  const { tasks, submissions, feedback, promptCount, deliverables } = stats;
  
  // Calculate completion percentages
  const taskCompletionPercentage = tasks && tasks.length > 0
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100
    : 0;
  
  const deliverableCompletionPercentage = deliverables && deliverables.total > 0
    ? (deliverables.submitted / deliverables.total) * 100
    : 0;

  console.log("Tasks data:", tasks);
  console.log("Completed tasks:", tasks ? tasks.filter(task => task.completed) : []);

  return (
    <Grid container spacing={2}>
      {/* Tasks Completion Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card" sx={{ backgroundColor: '#171c28', borderRadius: 2 }}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <AssignmentIcon fontSize="small" sx={{ color: 'var(--color-primary)', mr: 1, opacity: 0.8 }} />
              <Typography className="progress-card__title" variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                Tasks Completed
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography 
              className="progress-card__value" 
              variant="h4" 
              sx={{ 
                textAlign: 'left', 
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                fontWeight: 600,
                mb: 1
              }}
            >
              {tasks ? `${tasks.filter(task => task.completed).length}/${tasks.length}` : '0/0'}
            </Typography>
            
            <Box mt={1}>
              <LinearProgress 
                variant="determinate" 
                value={taskCompletionPercentage} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <Typography variant="caption" className="progress-card__subtitle" align="right" sx={{ display: 'block', mt: 0.5 }}>
                {taskCompletionPercentage.toFixed(0)}% Complete
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Prompts Sent Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card" sx={{ backgroundColor: '#171c28', borderRadius: 2 }}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <SendIcon fontSize="small" sx={{ color: 'var(--color-primary)', mr: 1, opacity: 0.8 }} />
              <Typography className="progress-card__title" variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                Prompts Sent
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography 
              className="progress-card__value" 
              variant="h4" 
              sx={{ 
                textAlign: 'left', 
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                fontWeight: 600,
                mb: 1
              }}
            >
              {promptCount || 0}
            </Typography>
            
            <Box mt={1}>
              <Typography variant="caption" className="progress-card__subtitle" sx={{ display: 'block', color: 'var(--color-text-secondary)' }}>
                Messages sent to Claude
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Feedback Received Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card" sx={{ backgroundColor: '#171c28', borderRadius: 2 }}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <RateReviewIcon fontSize="small" sx={{ color: 'var(--color-primary)', mr: 1, opacity: 0.8 }} />
              <Typography className="progress-card__title" variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                Feedback Received
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography 
              className="progress-card__value" 
              variant="h4" 
              sx={{ 
                textAlign: 'left', 
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                fontWeight: 600,
                mb: 1
              }}
            >
              {feedback?.peerFeedback?.length || 0}
            </Typography>
            
            <Box mt={1}>
              <Typography variant="caption" className="progress-card__subtitle" sx={{ display: 'block', color: 'var(--color-text-secondary)' }}>
                Peer feedback entries
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Deliverables Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card" sx={{ backgroundColor: '#171c28', borderRadius: 2 }}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <AssignmentTurnedInIcon fontSize="small" sx={{ color: 'var(--color-primary)', mr: 1, opacity: 0.8 }} />
              <Typography className="progress-card__title" variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                Deliverables Submitted
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography 
              className="progress-card__value" 
              variant="h4" 
              sx={{ 
                textAlign: 'left', 
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                fontWeight: 600,
                mb: 1
              }}
            >
              {deliverables ? `${deliverables.submitted}/${deliverables.total}` : '0/0'}
            </Typography>
            
            <Box mt={1}>
              <LinearProgress 
                variant="determinate" 
                value={deliverableCompletionPercentage} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <Typography variant="caption" className="progress-card__subtitle" align="right" sx={{ display: 'block', mt: 0.5 }}>
                {deliverableCompletionPercentage.toFixed(0)}% Submitted
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProgressOverview; 