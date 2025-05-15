import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Paper,
  Chip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';

const FeedbackSection = ({ feedback = {} }) => {
  const [feedbackType, setFeedbackType] = useState(0);
  
  // Extract feedback categories from the feedback object
  const instructorFeedback = feedback.instructorFeedback || [];
  const peerFeedback = feedback.peerFeedback || [];
  
  const handleFeedbackTypeChange = (event, newValue) => {
    setFeedbackType(newValue);
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render a single feedback item
  const renderFeedbackItem = (item, isPeer = false) => {
    return (
      <Card 
        key={item.feedback_id} 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          backgroundColor: 'var(--color-background-dark)',
          border: '1px solid var(--color-border)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'var(--color-primary)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: isPeer ? 'var(--color-primary)' : '#f57c00' }}>
                {isPeer ? <PersonIcon /> : <SchoolIcon />}
              </Avatar>
            </ListItemAvatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {isPeer ? `Peer: ${item.peer_name || 'Anonymous'}` : `Instructor: ${item.instructor_name || 'Instructor'}`}
              </Typography>
              <Box display="flex" alignItems="center" mt={0.5}>
                <EventIcon fontSize="small" sx={{ fontSize: '1rem', mr: 0.5, opacity: 0.7 }} />
                <Typography variant="caption" color="textSecondary">
                  {formatDate(item.created_at)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {item.task_title && (
            <Box mb={1}>
              <Chip 
                label={`Task: ${item.task_title}`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'var(--color-primary-transparent)', 
                  color: 'var(--color-primary)',
                  fontWeight: 500 
                }} 
              />
            </Box>
          )}
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: 'var(--color-background-darker)',
              border: '1px solid var(--color-border)'
            }}
          >
            <Typography variant="body2" color="var(--color-text-primary)" whiteSpace="pre-wrap">
              {item.content}
            </Typography>
          </Paper>
          
          {item.strengths && (
            <Box mt={2}>
              <Typography variant="subtitle2" sx={{ color: '#2eae4f' }} gutterBottom>
                Strengths
              </Typography>
              <Typography variant="body2" color="var(--color-text-secondary)">
                {item.strengths}
              </Typography>
            </Box>
          )}
          
          {item.areas_for_improvement && (
            <Box mt={2}>
              <Typography variant="subtitle2" sx={{ color: '#ffab00' }} gutterBottom>
                Areas for Improvement
              </Typography>
              <Typography variant="body2" color="var(--color-text-secondary)">
                {item.areas_for_improvement}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="feedback-section">
      <Box className="feedback-section__tabs" mb={3}>
        <Tabs
          value={feedbackType}
          onChange={handleFeedbackTypeChange}
          variant="fullWidth"
          aria-label="Feedback type tabs"
        >
          <Tab 
            icon={<SchoolIcon />} 
            label="Instructor Feedback" 
            iconPosition="start"
            id="feedback-tab-0"
            aria-controls="feedback-tabpanel-0"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Peer Feedback" 
            iconPosition="start"
            id="feedback-tab-1"
            aria-controls="feedback-tabpanel-1"
          />
        </Tabs>
      </Box>

      <Box 
        className="feedback-section__content"
        role="tabpanel"
        id={`feedback-tabpanel-${feedbackType}`}
        aria-labelledby={`feedback-tab-${feedbackType}`}
      >
        {feedbackType === 0 && (
          <>
            {instructorFeedback.length === 0 ? (
              <Box textAlign="center" py={4} className="feedback-section__empty">
                <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                  No instructor feedback available yet.
                </Typography>
              </Box>
            ) : (
              <List className="feedback-section__list">
                {instructorFeedback.map(item => renderFeedbackItem(item))}
              </List>
            )}
          </>
        )}

        {feedbackType === 1 && (
          <>
            {peerFeedback.length === 0 ? (
              <Box textAlign="center" py={4} className="feedback-section__empty">
                <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                  No peer feedback available yet.
                </Typography>
              </Box>
            ) : (
              <List className="feedback-section__list">
                {peerFeedback.map(item => renderFeedbackItem(item, true))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default FeedbackSection; 