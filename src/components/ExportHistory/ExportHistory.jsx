import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/retryUtils';

const ExportHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    successStatus: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const fetchHistory = async (pageNum = 1, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit,
        offset: (pageNum - 1) * limit,
        ...filterParams
      };

      // Use admin endpoint if user is admin, otherwise use user endpoint
      const response = user.role === 'admin' 
        ? await adminApi.getAllCsvExportHistory(params)
        : await adminApi.getCsvExportHistory(params);

      setHistory(response.data || []);
      setTotalPages(Math.ceil((response.pagination?.count || 0) / limit));
      setPage(pageNum);

    } catch (err) {
      console.error('Error fetching export history:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (event, newPage) => {
    fetchHistory(newPage, filters);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    const filterParams = {};
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;
    if (filters.successStatus !== 'all') {
      filterParams.successStatus = filters.successStatus === 'success';
    }
    
    fetchHistory(1, filterParams);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      successStatus: 'all'
    });
    fetchHistory(1, {});
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (success, errorMessage) => {
    if (success) {
      return <Chip icon={<CheckCircleIcon />} label="Success" color="success" size="small" />;
    } else {
      return (
        <Tooltip title={errorMessage || 'Export failed'}>
          <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />
        </Tooltip>
      );
    }
  };

  if (loading && history.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="export-history">
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              <Typography variant="h6" component="h2">
                Export History
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <IconButton
                size="small"
                onClick={() => fetchHistory(page, filters)}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          {showFilters && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Filter Export History
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.successStatus}
                        label="Status"
                        onChange={(e) => handleFilterChange('successStatus', e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleApplyFilters}
                        disabled={loading}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearFilters}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          {history.length === 0 ? (
            <Alert severity="info">
              No export history found. Start by exporting some attendance data.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date/Time</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Date Range</TableCell>
                      <TableCell>Cohort</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>File Size</TableCell>
                      <TableCell>Rows</TableCell>
                      <TableCell>Processing Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.log_id}>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(record.export_timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.user_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.export_start_date} to {record.export_end_date}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.cohort_filter || 'All Cohorts'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(record.success_status, record.error_message)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFileSize(record.file_size_bytes)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.row_count || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.processing_time_ms ? `${record.processing_time_ms}ms` : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={loading}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExportHistory;
