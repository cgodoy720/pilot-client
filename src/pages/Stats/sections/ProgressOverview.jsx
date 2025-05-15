import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import RateReviewIcon from '@mui/icons-material/RateReview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ProgressOverview = ({ stats }) => {
  const { tasks, submissions, feedback } = stats;
  
  // Calculate completion percentages
  const taskCompletionPercentage = tasks && tasks.length > 0
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100
    : 0;
  
  const submissionCompletionPercentage = tasks && tasks.length > 0
    ? (submissions.length / tasks.length) * 100
    : 0;
  
  // Calculate streak (placeholder - actual calculation would depend on your data)
  const currentStreak = stats.dailyProgress?.currentStreak || 0;

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

      {/* Submissions Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Submissions
                </Typography>
                <Typography className="progress-card__value">
                  {submissions ? submissions.length : '0'}
                </Typography>
              </Box>
              <SendIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <LinearProgress 
                variant="determinate" 
                value={submissionCompletionPercentage} 
                style={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'var(--color-background-darker)'
                }}
              />
              <Typography variant="body2" className="progress-card__subtitle" align="right">
                {submissionCompletionPercentage.toFixed(0)}% of Tasks
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
                  {feedback?.received?.length || 0}
                </Typography>
              </Box>
              <RateReviewIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <Typography variant="body2" className="progress-card__subtitle">
                Instructor: {feedback?.instructorFeedback?.length || 0}
              </Typography>
              <Typography variant="body2" className="progress-card__subtitle">
                Peer: {feedback?.peerFeedback?.length || 0}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Streak Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card className="progress-card">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography className="progress-card__title" gutterBottom>
                  Current Streak
                </Typography>
                <Typography className="progress-card__value">
                  {currentStreak} Days
                </Typography>
              </Box>
              <TrendingUpIcon fontSize="medium" style={{ opacity: 0.8, color: 'var(--color-primary)' }} />
            </Box>
            <Box mt={1}>
              <Typography variant="body2" className="progress-card__subtitle">
                Best Streak: {stats.dailyProgress?.bestStreak || 0} Days
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProgressOverview; 