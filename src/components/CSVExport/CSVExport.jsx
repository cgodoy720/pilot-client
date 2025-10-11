import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import { getErrorMessage } from '../../utils/retryUtils';
import attendanceActionQueue from '../../utils/attendanceActionQueue';
import { useNetworkStatus } from '../../utils/networkStatus';
import ExportHistory from '../ExportHistory/ExportHistory';
import './CSVExport.css';

const CSVExport = () => {
  const { isOnline } = useNetworkStatus(React);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cohort, setCohort] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [error, setError] = useState(null);
  const [queuedExport, setQueuedExport] = useState(null);

  // Get today's date for default values
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const cohortOptions = [
    { value: 'all', label: 'All Cohorts' },
    { value: 'March 2025 L2', label: 'March 2025 L2' },
    { value: 'June 2025 L2', label: 'June 2025 L2' },
    { value: 'September 2025', label: 'September 2025' }
  ];

  const handleExportToday = async () => {
    setStartDate(today);
    setEndDate(today);
    setCohort('all');
    await handleExport(today, today, 'all');
  };

  const handleExportWeek = async () => {
    setStartDate(oneWeekAgo);
    setEndDate(today);
    setCohort('all');
    await handleExport(oneWeekAgo, today, 'all');
  };

  const handleExportCustom = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    await handleExport(startDate, endDate, cohort);
  };

  const handleExport = async (start, end, selectedCohort) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    const exportParams = {
      startDate: start,
      endDate: end,
      cohort: selectedCohort === 'all' ? null : selectedCohort
    };

    // If offline, queue the export
    if (!isOnline) {
      try {
        await attendanceActionQueue.queueCSVExport(exportParams, token);
        setQueuedExport({
          startDate: start,
          endDate: end,
          cohort: selectedCohort === 'all' ? 'All Cohorts' : selectedCohort,
          queuedAt: new Date()
        });
        setExportStatus({
          type: 'info',
          message: 'Export queued for when you reconnect'
        });
        setTimeout(() => setExportStatus(null), 5000);
      } catch (err) {
        setError('Failed to queue export: ' + err.message);
      }
      return;
    }

    // Online - proceed with immediate export
    setIsExporting(true);
    setError(null);
    setExportStatus(null);

    try {
      const result = await adminApi.exportAttendanceCSV(start, end, selectedCohort);
      setExportStatus({
        type: 'success',
        message: `CSV exported successfully: ${result.filename}`,
        filename: result.filename
      });
    } catch (err) {
      console.error('Export error:', err);
      
      // If it's a network error, queue the export
      if (!isOnline || (err.name === 'TypeError' && err.message.includes('fetch'))) {
        try {
          await attendanceActionQueue.queueCSVExport(exportParams, token);
          setQueuedExport({
            startDate: start,
            endDate: end,
            cohort: selectedCohort === 'all' ? 'All Cohorts' : selectedCohort,
            queuedAt: new Date()
          });
          setExportStatus({
            type: 'info',
            message: 'Export queued due to connection issue'
          });
          setTimeout(() => setExportStatus(null), 5000);
        } catch (queueErr) {
          setError('Failed to queue export: ' + queueErr.message);
        }
      } else {
        const userFriendlyMessage = getErrorMessage(err);
        setError(userFriendlyMessage);
        setExportStatus({
          type: 'error',
          message: userFriendlyMessage
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getCohortLabel = (value) => {
    const option = cohortOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <Box className="csv-export">
      <Card className="csv-export__card">
        <CardHeader
          title={
            <Box className="csv-export__header">
              <GetAppIcon className="csv-export__icon" />
              <Typography variant="h6" component="h2">
                Export Attendance Data
              </Typography>
            </Box>
          }
          subheader="Export attendance records to CSV format for analysis and reporting"
        />
        
        <CardContent className="csv-export__content">
          {/* Quick Export Buttons */}
          <Box className="csv-export__quick-actions">
            <Typography variant="subtitle1" gutterBottom className="csv-export__section-title">
              Quick Export
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CalendarIcon />}
                  onClick={handleExportToday}
                  disabled={isExporting}
                  className="csv-export__quick-btn"
                >
                  Export Today
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CalendarIcon />}
                  onClick={handleExportWeek}
                  disabled={isExporting}
                  className="csv-export__quick-btn"
                >
                  Export This Week
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider className="csv-export__divider" />

          {/* Custom Export Form */}
          <Box className="csv-export__custom-form">
            <Typography variant="subtitle1" gutterBottom className="csv-export__section-title">
              Custom Export
            </Typography>
            
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Start Date */}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '12pt', mb: '4px' }}>
                      Select the start date for export
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isExporting}
                    />
                  </Box>

                  {/* Cohort Filter */}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '12pt', mb: '4px' }}>
                      Cohort Filter
                    </Typography>
                    <FormControl fullWidth disabled={isExporting}>
                      <Select
                        value={cohort}
                        onChange={(e) => setCohort(e.target.value)}
                        displayEmpty
                      >
                        {cohortOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* End Date */}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '12pt', mb: '4px' }}>
                      Select the end date for export
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isExporting}
                    />
                  </Box>

                  {/* Export Button aligned with Cohort dropdown */}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ height: '16px', mb: '8px' }}></Box> {/* Spacer to align with "Cohort Filter" label - 12pt = 16px */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
                      onClick={handleExportCustom}
                      disabled={isExporting || !startDate || !endDate}
                      className="csv-export__export-btn"
                      size="large"
                    >
                      {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Export Status */}
          {exportStatus && (
            <Box className="csv-export__status">
              <Alert 
                severity={exportStatus.type} 
                className="csv-export__alert"
                action={
                  exportStatus.type === 'success' && (
                    <Chip 
                      label={exportStatus.filename} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )
                }
              >
                {exportStatus.message}
              </Alert>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Box className="csv-export__error">
              <Alert severity="error" className="csv-export__alert">
                {error}
              </Alert>
            </Box>
          )}

          {/* Export Information */}
          <Box className="csv-export__info">
            <Typography variant="body2" className="csv-export__info-text" sx={{ color: '#FFFFFF' }}>
              <strong>CSV Format:</strong> Date, Builder Name, Cohort, Check-in Time, Status, Late Minutes, Excuse Type, Excuse Details, Staff Notes, Attendance Notes
            </Typography>
            <Typography variant="body2" className="csv-export__info-text" sx={{ color: '#FFFFFF' }}>
              <strong>Note:</strong> The export includes all builders in the selected cohort(s), including those who didn't check in (marked as "Absent").
            </Typography>
          </Box>

          {/* Queued Export Indicator */}
          {queuedExport && (
            <Box className="csv-export__queued" sx={{ mt: 2 }}>
              <Alert 
                severity="info" 
                className="csv-export__alert"
                action={
                  <Chip 
                    label={`Queued at ${queuedExport.queuedAt.toLocaleTimeString()}`}
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                }
              >
                <Typography variant="body2">
                  <strong>Export Queued:</strong> {queuedExport.startDate} to {queuedExport.endDate} 
                  {queuedExport.cohort !== 'All Cohorts' && ` (${queuedExport.cohort})`}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  This export will be processed when you reconnect to the internet.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Box sx={{ mt: 3 }}>
        <ExportHistory />
      </Box>
    </Box>
  );
};

export default CSVExport;
