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
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

  // Get submission status display
  const getStatusDisplay = (submission) => {
    if (submission.status === 'approved') {
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
    } else if (submission.status === 'rejected') {
      return <Chip icon={<CancelIcon />} label="Needs Revision" color="error" size="small" />;
    } else {
      return <Chip icon={<PendingIcon />} label="Pending Review" color="warning" size="small" />;
    }
  };

  // Get feedback status
  const getFeedbackStatus = (submission) => {
    if (submission.feedback) {
      return <Chip label="Feedback Available" color="info" size="small" variant="outlined" />;
    }
    return <Chip label="No Feedback Yet" size="small" variant="outlined" sx={{ opacity: 0.6 }} />;
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
                <TableCell width="40%">Task</TableCell>
                <TableCell width="20%">Submitted Date</TableCell>
                <TableCell width="15%">Status</TableCell>
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
                  <TableCell>{getStatusDisplay(submission)}</TableCell>
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
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                {getStatusDisplay(selectedSubmission)}
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Submitted on
                </Typography>
                <Typography>
                  {formatDateTime(selectedSubmission.submitted_date)}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
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
                  <Typography whiteSpace="pre-wrap">
                    {selectedSubmission.content}
                  </Typography>
                </Paper>
              </Box>
              
              {selectedSubmission.feedback && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Feedback
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'var(--color-primary-transparent-light)',
                      border: '1px solid var(--color-primary-transparent)'
                    }}
                  >
                    <Typography whiteSpace="pre-wrap">
                      {selectedSubmission.feedback}
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