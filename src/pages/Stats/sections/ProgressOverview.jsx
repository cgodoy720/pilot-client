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

  return (
    <Grid container spacing={2}>
      {/* Tasks Completion Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Tasks Completed
                </Typography>
                <Typography className="progress-card__value">
                  {tasks ? `${tasks.filter(task => task.completed).length}/${tasks.length}` : '0/0'}
                </Typography>
              </Box>
              <AssignmentIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <LinearProgress 
                variant="determinate" 
                value={taskCompletionPercentage} 
                style={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'var(--color-background-darker)'
                }}
              />
              <Typography variant="body2" className="progress-card__subtitle" align="right">
                {taskCompletionPercentage.toFixed(0)}% Complete
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Prompts Sent Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Prompts Sent
                </Typography>
                <Typography className="progress-card__value">
                  {promptCount || 0}
                </Typography>
              </Box>
              <SendIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <Typography variant="body2" className="progress-card__subtitle">
                Messages sent to Claude
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Feedback Received Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Feedback Received
                </Typography>
                <Typography className="progress-card__value">
                  {feedback?.peerFeedback?.length || 0}
                </Typography>
              </Box>
              <RateReviewIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <Typography variant="body2" className="progress-card__subtitle">
                Peer feedback entries
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Deliverables Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Deliverables Submitted
                </Typography>
                <Typography className="progress-card__value">
                  {deliverables ? `${deliverables.submitted}/${deliverables.total}` : '0/0'}
                </Typography>
              </Box>
              <AssignmentTurnedInIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <LinearProgress 
                variant="determinate" 
                value={deliverableCompletionPercentage} 
                style={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'var(--color-background-darker)'
                }}
              />
              <Typography variant="body2" className="progress-card__subtitle" align="right">
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