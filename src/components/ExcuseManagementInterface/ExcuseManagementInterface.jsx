import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button,
  Chip, 
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingIcon from '@mui/icons-material/Pending';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { adminApi } from '../../services/adminApi';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';
import './ExcuseManagementInterface.css';

const ExcuseManagementInterface = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingData, setPendingData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState('');
  
  // Dialog states
  const [excuseDialogOpen, setExcuseDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [excuseForm, setExcuseForm] = useState({
    absenceDate: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });
  const [bulkForm, setBulkForm] = useState({
    cohort: '',
    absenceDate: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });

  const excuseReasons = [
    'Sick',
    'Personal',
    'Work Conflict',
    'Childcare',
    'Transportation',
    'Other'
  ];

  const cohorts = [
    'March 2025',
    'September 2025',
    'June 2025'
  ];

  // Filter builders by cohort
  const filteredUnexcusedAbsences = selectedCohort 
    ? pendingData?.unexcusedAbsences?.filter(user => user.cohort === selectedCohort) || []
    : pendingData?.unexcusedAbsences || [];

  const fetchPendingData = async () => {
    try {
      const response = await adminApi.getPendingExcuses({ days: 7 }, token);
      setPendingData(response);
    } catch (err) {
      console.error('Error fetching unexcused absences:', err);
      setError(err.message);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await adminApi.getExcuseHistory({ limit: 50 }, token);
      setHistoryData(response);
    } catch (err) {
      console.error('Error fetching excuse history:', err);
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchPendingData(),
        fetchHistoryData()
      ]);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching excuse data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkExcused = (builder) => {
    console.log('handleMarkExcused called with:', builder);
    
    setSelectedBuilder(builder);
    
    // Pre-populate form based on data source
    if (builder.excuseReason) {
      // This is a pending excuse - pre-populate with existing data
      setExcuseForm({
        absenceDate: builder.absenceDate || '',
        excuseReason: builder.excuseReason || '',
        excuseDetails: builder.excuseDetails || '',
        staffNotes: ''
      });
    } else {
      // This is an unexcused absence - pre-populate with absence date
      setExcuseForm({
        absenceDate: builder.absenceDate || '',
        excuseReason: '',
        excuseDetails: '',
        staffNotes: ''
      });
    }
    
    setExcuseDialogOpen(true);
  };

  const handleBulkExcuse = () => {
    setBulkForm({
      cohort: '',
      absenceDate: new Date().toISOString().split('T')[0],
      excuseReason: '',
      excuseDetails: '',
      staffNotes: ''
    });
    setBulkDialogOpen(true);
  };

  const handleSubmitExcuse = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Validate required fields
      if (!selectedBuilder?.userId) {
        throw new Error('Missing user ID');
      }
      if (!excuseForm.absenceDate) {
        throw new Error('Please select an absence date');
      }
      if (!excuseForm.excuseReason) {
        throw new Error('Please select an excuse reason');
      }
      
      const excuseData = {
        userId: selectedBuilder.userId,
        absenceDate: excuseForm.absenceDate,
        excuseReason: excuseForm.excuseReason,
        excuseDetails: excuseForm.excuseDetails || '',
        staffNotes: excuseForm.staffNotes || ''
      };
      
      // Submit the excuse
      await adminApi.markBuilderExcused(excuseData, token);
      
      // Invalidate all attendance caches since excuse affects attendance rates
      cachedAdminApi.invalidateAllAttendanceCaches();
      
      // Refresh data first, then close dialog
      await fetchData();
      
      // Show success message
      setSuccessMessage(`Successfully approved excuse for ${selectedBuilder.firstName} ${selectedBuilder.lastName} on ${formatDate(excuseForm.absenceDate)}`);
      
      // Close dialog and reset form
      setExcuseDialogOpen(false);
      setSelectedBuilder(null);
      setExcuseForm({
        absenceDate: '',
        excuseReason: '',
        excuseDetails: '',
        staffNotes: ''
      });
      
    } catch (err) {
      console.error('Error marking builder as excused:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBulkExcuse = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const bulkData = {
        cohort: bulkForm.cohort,
        absenceDate: bulkForm.absenceDate,
        excuseReason: bulkForm.excuseReason,
        excuseDetails: bulkForm.excuseDetails,
        staffNotes: bulkForm.staffNotes
      };

      await adminApi.bulkExcuseCohort(bulkData, token);
      
      // Invalidate all attendance caches since bulk excuse affects attendance rates
      cachedAdminApi.invalidateAllAttendanceCaches();
      
      // Refresh data first, then close dialog
      await fetchData();
      
      // Show success message
      setSuccessMessage(`Successfully excused ${bulkForm.cohort} cohort for ${formatDate(bulkForm.absenceDate)}`);
      
      // Close dialog and reset form
      setBulkDialogOpen(false);
      setBulkForm({
        cohort: '',
        absenceDate: new Date().toISOString().split('T')[0],
        excuseReason: '',
        excuseDetails: '',
        staffNotes: ''
      });
      
    } catch (err) {
      console.error('Error performing bulk excuse:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getExcuseReasonColor = (reason) => {
    const colors = {
      'Sick': 'error',
      'Personal': 'warning',
      'Work Conflict': 'info',
      'Childcare': 'secondary',
      'Transportation': 'info',
      'Other': 'default'
    };
    return colors[reason] || 'default';
  };

  if (loading && !pendingData && !historyData) {
    return (
      <Box className="excuse-management-interface">
        <Box className="excuse-management-interface__loading">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading excuse management data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="excuse-management-interface">
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Error loading excuse data: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="excuse-management-interface">
      <Box className="excuse-management-interface__header">
        <Box className="excuse-management-interface__title-section">
          <AssignmentIcon className="excuse-management-interface__title-icon" />
          <Typography variant="h5" component="h2" className="excuse-management-interface__title">
            Excuse Management Interface
          </Typography>
        </Box>
        <Box className="excuse-management-interface__actions">
          {lastUpdated && (
            <Typography 
              variant="caption" 
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleBulkExcuse}
            className="excuse-management-interface__bulk-excuse-button"
            sx={{ 
              mr: 1,
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              border: '1px solid #d1d5db',
              '&:hover': {
                backgroundColor: '#f3f4f6', // gray on hover
                color: '#1a1a1a',
                border: '1px solid #d1d5db',
              },
              '&:active': {
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
              }
            }}
          >
            Bulk Excuse
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>


      <Box className="excuse-management-interface__tabs">
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Unexcused Absences
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Excuse History
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Unexcused Absences Tab */}
      {activeTab === 0 && (
        <Box className="excuse-management-interface__tab-content">
          {pendingData?.summary?.totalUnexcusedAbsences > 0 ? (
            <Card className="excuse-management-interface__unexcused-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unexcused Absences
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Builders with unexcused absences in the last 7 days. Click "Add Excuse" to approve their absence.
                </Typography>
                
                {/* Cohort Filter - Centered */}
                <Box sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 2 
                }}>
                  <Typography variant="body1" sx={{ color: '#ffffff' }}>
                    Filter by Cohort:
                  </Typography>
                  <Select
                    size="small"
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      minWidth: '200px',
                      '& .MuiSelect-select': {
                        color: '#1a1a1a'
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ color: '#1a1a1a' }}>All Cohorts</MenuItem>
                    <MenuItem value="March 2025" sx={{ color: '#1a1a1a' }}>March 2025</MenuItem>
                    <MenuItem value="September 2025" sx={{ color: '#1a1a1a' }}>September 2025</MenuItem>
                    <MenuItem value="June 2025" sx={{ color: '#1a1a1a' }}>June 2025</MenuItem>
                  </Select>
                </Box>

                <Box className="excuse-management-interface__cards-grid">
                  {filteredUnexcusedAbsences.flatMap((user, userIndex) => 
                    user.absences.map((absence, absenceIndex) => (
                      <Card variant="outlined" className="excuse-management-interface__absence-card" key={`${userIndex}-${absenceIndex}`}>
                        <CardContent>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            sx={{ 
                              color: '#1a1a1a',
                              marginBottom: 'var(--spacing-xs)'
                            }}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#4b5563',
                              display: 'block',
                              marginBottom: 'var(--spacing-xs)'
                            }}
                          >
                            {user.cohort}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            display="block"
                            sx={{ 
                              color: '#4b5563',
                              marginBottom: 'var(--spacing-sm)'
                            }}
                          >
                            {formatDate(absence.date)}
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleMarkExcused({
                              userId: user.userId,
                              absenceDate: absence.date,
                              firstName: user.firstName,
                              lastName: user.lastName
                            })}
                            className="excuse-management-interface__add-excuse-button"
                            sx={{ 
                              mt: 1,
                              backgroundColor: '#6366f1', // purple/blue
                              color: '#ffffff',
                              border: 'none',
                              '&:hover': {
                                backgroundColor: '#5b21b6', // darker purple on hover
                                color: '#ffffff',
                              },
                              '&:active': {
                                backgroundColor: '#4c1d95', // even darker purple on click
                                color: '#ffffff',
                              }
                            }}
                            variant="contained"
                          >
                            Add Excuse
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card className="excuse-management-interface__empty-state">
              <CardContent>
                <CheckCircleIcon className="excuse-management-interface__empty-icon" />
                <Typography 
                  variant="h6" 
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  No Unexcused Absences
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  All recent absences have been excused.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* History Tab */}
      {activeTab === 1 && (
        <Box className="excuse-management-interface__tab-content">
          {historyData?.excuses?.length > 0 ? (
            <TableContainer component={Paper} className="excuse-management-interface__table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Builder</TableCell>
                    <TableCell>Cohort</TableCell>
                    <TableCell>Absence Date</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Staff Notes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Processed By</TableCell>
                    <TableCell>Processed At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.excuses.map((excuse, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ color: 'var(--color-text-primary)' }}
                          >
                            {excuse.firstName} {excuse.lastName}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: 'var(--color-text-secondary)' }}
                          >
                            {excuse.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{excuse.cohort}</TableCell>
                      <TableCell>{formatDate(excuse.absenceDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={excuse.excuseReason}
                          color={getExcuseReasonColor(excuse.excuseReason)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: 'var(--color-text-secondary)' }}
                        >
                          {(excuse.excuseDetails || excuse.staffNotes) ? 'yes' : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={excuse.status}
                          color={excuse.status === 'approved' ? 'success' : excuse.status === 'denied' ? 'error' : 'warning'}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'var(--color-text-secondary)' }}
                        >
                          {excuse.processedBy?.firstName} {excuse.processedBy?.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'var(--color-text-secondary)' }}
                        >
                          {formatDate(excuse.processedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'var(--color-primary)' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card className="excuse-management-interface__empty-state">
              <CardContent>
                <HistoryIcon className="excuse-management-interface__empty-icon" />
                <Typography 
                  variant="h6" 
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  No Excuse History
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  No excuse records found.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Mark Excused Dialog */}
      <Dialog open={excuseDialogOpen} onClose={() => setExcuseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBuilder?.excuseReason ? 'Update Excuse' : 'Mark Builder as Excused'}
        </DialogTitle>
        <DialogContent>
          {selectedBuilder && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ color: 'var(--color-text-secondary)' }}
              >
                Builder: {selectedBuilder.firstName} {selectedBuilder.lastName}
              </Typography>
              {selectedBuilder.excuseReason && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: 'var(--color-primary)'
                  }}
                >
                  Current excuse: {selectedBuilder.excuseReason}
                </Typography>
              )}
            </Box>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            label="Absence Date"
            type="date"
            value={excuseForm.absenceDate}
            onChange={(e) => setExcuseForm({ ...excuseForm, absenceDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Excuse Reason</InputLabel>
            <Select
              value={excuseForm.excuseReason}
              onChange={(e) => setExcuseForm({ ...excuseForm, excuseReason: e.target.value })}
              label="Excuse Reason"
            >
              {excuseReasons.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Excuse Details"
            multiline
            rows={3}
            value={excuseForm.excuseDetails}
            onChange={(e) => setExcuseForm({ ...excuseForm, excuseDetails: e.target.value })}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Staff Notes"
            multiline
            rows={2}
            value={excuseForm.staffNotes}
            onChange={(e) => setExcuseForm({ ...excuseForm, staffNotes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcuseDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitExcuse} 
            variant="contained" 
            disabled={!excuseForm.absenceDate || !excuseForm.excuseReason || loading}
          >
            {selectedBuilder?.excuseReason ? 'Update Excuse' : 'Mark Excused'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Excuse Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Excuse for Cohort</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Cohort</InputLabel>
            <Select
              value={bulkForm.cohort}
              onChange={(e) => setBulkForm({ ...bulkForm, cohort: e.target.value })}
              label="Cohort"
            >
              {cohorts.map((cohort) => (
                <MenuItem key={cohort} value={cohort}>
                  {cohort}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Absence Date"
            type="date"
            value={bulkForm.absenceDate}
            onChange={(e) => setBulkForm({ ...bulkForm, absenceDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Excuse Reason</InputLabel>
            <Select
              value={bulkForm.excuseReason}
              onChange={(e) => setBulkForm({ ...bulkForm, excuseReason: e.target.value })}
              label="Excuse Reason"
            >
              {excuseReasons.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Excuse Details"
            multiline
            rows={3}
            value={bulkForm.excuseDetails}
            onChange={(e) => setBulkForm({ ...bulkForm, excuseDetails: e.target.value })}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Staff Notes"
            multiline
            rows={2}
            value={bulkForm.staffNotes}
            onChange={(e) => setBulkForm({ ...bulkForm, staffNotes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitBulkExcuse} 
            variant="contained" 
            disabled={!bulkForm.cohort || !bulkForm.absenceDate || !bulkForm.excuseReason || loading}
          >
            Bulk Excuse
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExcuseManagementInterface;
