// @ts-nocheck
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';

const SubmissionsSection = ({ submissions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filter submissions based on search
  const filteredSubmissions = submissions.filter(submission => 
    submission.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    submission.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Get feedback status
  const getFeedbackStatus = (submission) => {
    // Check for AI feedback in the analysis results
    if (submission.analysis_results && Object.keys(submission.analysis_results).length > 0) {
      const firstKey = Object.keys(submission.analysis_results)[0];
      const analysis = submission.analysis_results[firstKey];
      if (analysis && analysis.feedback && analysis.feedback.trim() !== '') {
        return <Chip icon={<CommentIcon fontSize="small" />} label="AI Feedback" color="info" size="small" variant="outlined" />;
      }
    }
    return <Chip label="No Feedback" size="small" variant="outlined" sx={{ opacity: 0.6 }} />;
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

  // Format datetime for dialog
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box className="submissions-section">
      <Box className="submissions-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Search submissions..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          className="submissions-section__search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'var(--color-text-secondary)' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchTerm('')}
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          fullWidth
        />
      </Box>

      {filteredSubmissions.length === 0 ? (
        <Box textAlign="center" py={4} className="submissions-section__empty">
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
            No submissions found matching your search.
          </Typography>
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          className="submissions-section__table-container"
        >
          <Table stickyHeader aria-label="submissions table">
            <TableHead>
              <TableRow>
                <TableCell width="50%">Task</TableCell>
                <TableCell width="25%">Submitted Date</TableCell>
                <TableCell width="15%">Feedback</TableCell>
                <TableCell width="10%">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.submission_id} 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'var(--color-primary-transparent)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">{submission.task_title}</Typography>
                  </TableCell>
                  <TableCell>{formatDate(submission.submitted_date)}</TableCell>
                  <TableCell>{getFeedbackStatus(submission)}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleViewSubmission(submission)}
                      size="small"
                      sx={{ 
                        color: 'var(--color-primary)',
                        '&:hover': {
                          backgroundColor: 'var(--color-primary-transparent-light)'
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Submission Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        className="submissions-section__dialog"
      >
        {selectedSubmission && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Submission: {selectedSubmission.task_title}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'var(--color-text-muted)'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                  Submitted on
                </Typography>
                <Typography sx={{ color: 'var(--color-text-primary)' }}>
                  {formatDateTime(selectedSubmission.submitted_date)}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                  Your Submission
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'var(--color-background-darker)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <Typography whiteSpace="pre-wrap" sx={{ color: 'var(--color-text-primary)' }}>
                    {selectedSubmission.content}
                  </Typography>
                  {selectedSubmission.content?.startsWith('http') && (
                    <Button
                      variant="contained"
                      color="primary"
                      href={selectedSubmission.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 2 }}
                    >
                      Open Submission
                    </Button>
                  )}
                </Paper>
              </Box>
              
              {selectedSubmission.analysis_results && Object.keys(selectedSubmission.analysis_results).length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                    AI Feedback
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'var(--color-primary-transparent-light)',
                      border: '1px solid var(--color-primary-transparent)'
                    }}
                  >
                    {Object.entries(selectedSubmission.analysis_results).map(([key, analysis]) => (
                      <Box key={key} mb={2}>
                        {analysis.feedback && (
                          <Typography whiteSpace="pre-wrap" sx={{ color: 'var(--color-text-primary)' }}>
                            {analysis.feedback}
                          </Typography>
                        )}
                        {analysis.criteria_met && analysis.criteria_met.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                              Criteria Met:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                              {analysis.criteria_met.map((criterion, index) => (
                                <li key={index} style={{ color: 'var(--color-text-primary)' }}>
                                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                                    {criterion}
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                        {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                              Areas for Improvement:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                              {analysis.areas_for_improvement.map((area, index) => (
                                <li key={index} style={{ color: 'var(--color-text-primary)' }}>
                                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                                    {area}
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }} gutterBottom>
                    Feedback
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'var(--color-background-darker)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <Typography sx={{ color: 'var(--color-text-muted)' }}>
                      No feedback has been provided for this submission.
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog}
                sx={{
                  color: 'var(--color-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--color-primary-transparent-light)'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SubmissionsSection; 