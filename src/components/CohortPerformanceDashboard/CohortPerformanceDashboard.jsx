import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  LinearProgress,
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
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/retryUtils';
import { useNetworkStatus } from '../../utils/networkStatus';
import './CohortPerformanceDashboard.css';

const CohortPerformanceDashboard = () => {
  const { token } = useAuth();
  const { isOnline } = useNetworkStatus(React);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [fetchTime, setFetchTime] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // If offline, try to get cached data only
      if (!isOnline) {
        setIsOfflineMode(true);
        const response = await cachedAdminApi.getCachedCohortPerformance(token, { forceRefresh: false, offlineOnly: true });
        
        if (response.data) {
          setData(response.data);
          setLastUpdated(new Date());
          setCacheInfo({
            isFromCache: true,
            cachedAt: response.cachedAt,
            expiresAt: response.expiresAt
          });
          setFetchTime(response.fetchTime || 0);
        } else {
          setError('No cached data available. Please connect to the internet to load data.');
        }
        return;
      }
      
      setIsOfflineMode(false);
      const response = await cachedAdminApi.getCachedCohortPerformance(token, { 
        forceRefresh, 
        period: selectedPeriod 
      });
      
      setData(response.data);
      setLastUpdated(new Date());
      setCacheInfo({
        isFromCache: response.isFromCache,
        cachedAt: response.cachedAt,
        expiresAt: response.expiresAt
      });
      setFetchTime(response.fetchTime || 0);
    } catch (err) {
      console.error('Error fetching cohort performance:', err);
      
      // If it's a network error and we have cached data, show it
      if (!isOnline && data) {
        setIsOfflineMode(true);
        setError('Showing cached data - no network connection');
      } else {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
      
      // Handle authentication errors
      if (err.status === 401 || err.message?.includes('session has expired')) {
        // Could trigger re-login flow here
        console.warn('Authentication error detected, user may need to re-login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, [token, selectedPeriod]);

  const handleRefresh = () => {
    // Clear cache and force refresh
    cachedAdminApi.invalidateAllAttendanceCaches();
    fetchData(true); // Force refresh, bypass cache
  };

  const getRequirementForCohort = (cohort) => {
    // June 2025 L2: 85%, March 2025 L3: 85%, L1 Cohorts: 80%
    if (cohort.includes('June 2025') && cohort.includes('L2')) return 85;
    if (cohort.includes('March 2025') && cohort.includes('L3')) return 85;
    if (cohort.includes('L1')) return 80;
    return 85; // Default requirement
  };

  const getPerformanceColor = (rate, requirement) => {
    if (rate >= requirement) return 'success';
    if (rate >= requirement - 10) return 'warning';
    return 'error';
  };

  const getPerformanceIcon = (rate, requirement) => {
    if (rate >= requirement) return <CheckCircleIcon />;
    if (rate >= requirement - 10) return <WarningIcon />;
    return <WarningIcon />;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUpIcon />;
    if (trend < 0) return <TrendingDownIcon />;
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'success';
    if (trend < 0) return 'error';
    return 'default';
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

  if (loading && !data) {
    return (
      <Box className="cohort-performance-dashboard">
        <Box className="cohort-performance-dashboard__loading">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading cohort performance data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="cohort-performance-dashboard">
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Error loading cohort performance data: {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="cohort-performance-dashboard">
        <Alert severity="info">
          No cohort performance data available.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="cohort-performance-dashboard">
      <Box className="cohort-performance-dashboard__header">
        <Box className="cohort-performance-dashboard__title-section">
          <TrendingUpIcon className="cohort-performance-dashboard__title-icon" />
          <Box>
            <Typography variant="h5" component="h2" className="cohort-performance-dashboard__title">
              Cohort Performance Dashboard
            </Typography>
            {data?.period?.displayName && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {data.period.displayName}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className="cohort-performance-dashboard__actions">
          <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Time Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="last-30-days">Last 30 Days</MenuItem>
              <MenuItem value="this-week">This Week</MenuItem>
              <MenuItem value="last-week">Last Week</MenuItem>
              <MenuItem value="this-month">This Month</MenuItem>
              <MenuItem value="last-month">Last Month</MenuItem>
            </Select>
          </FormControl>
          
          {isOfflineMode && (
            <Chip 
              label="Offline Mode - Cached Data" 
              color="warning" 
              size="small" 
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          {cacheInfo && (
            <Box className="cohort-performance-dashboard__cache-info">
              <Chip
                size="small"
                label={cacheInfo.isFromCache ? 'Cached' : 'Live'}
                color={cacheInfo.isFromCache ? 'info' : 'success'}
                variant="outlined"
                icon={cacheInfo.isFromCache ? <CheckCircleIcon /> : <TrendingUpIcon />}
              />
              {fetchTime && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({fetchTime}ms)
                </Typography>
              )}
            </Box>
          )}
          <Tooltip title="Refresh data (clear cache and fetch fresh)">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon className={loading ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Performance Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {data.cohorts?.map((cohort) => {
          const requirement = getRequirementForCohort(cohort.cohort);
          const performanceColor = getPerformanceColor(cohort.attendanceRate, requirement);
          const isMeetingRequirement = cohort.attendanceRate >= requirement;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={cohort.cohort}>
              <Card className="cohort-performance-dashboard__cohort-card">
                <CardContent>
                  <Box className="cohort-performance-dashboard__cohort-header">
                    <Typography variant="h6" component="h3">
                      {cohort.cohort}
                    </Typography>
                    <Chip
                      icon={getPerformanceIcon(cohort.attendanceRate, requirement)}
                      label={`${cohort.attendanceRate.toFixed(1)}%`}
                      color={performanceColor}
                      variant="outlined"
                    />
                  </Box>

                  <Box className="cohort-performance-dashboard__requirement-info">
                    <Typography variant="body2" color="text.secondary">
                      Requirement: {requirement}%
                    </Typography>
                    <Chip
                      label={isMeetingRequirement ? 'Meeting Requirement' : 'Below Requirement'}
                      color={isMeetingRequirement ? 'success' : 'error'}
                      size="small"
                      variant="filled"
                    />
                  </Box>

                  <Box className="cohort-performance-dashboard__progress-section">
                    <Box className="cohort-performance-dashboard__progress-header">
                      <Typography variant="body2" color="text.secondary">
                        Progress to Requirement
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cohort.attendanceRate.toFixed(1)}% / {requirement}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((cohort.attendanceRate / requirement) * 100, 100)}
                      color={performanceColor}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box className="cohort-performance-dashboard__cohort-stats">
                    <Box className="cohort-performance-dashboard__stat-row">
                      <Typography variant="body2" color="text.secondary">
                        Total Builders:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {cohort.totalBuilders}
                      </Typography>
                    </Box>
                    <Box className="cohort-performance-dashboard__stat-row">
                      <Typography variant="body2" color="text.secondary">
                        Present Today:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {cohort.presentToday}
                      </Typography>
                    </Box>
                    <Box className="cohort-performance-dashboard__stat-row">
                      <Typography variant="body2" color="text.secondary">
                        Absent Today:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {cohort.absentToday}
                      </Typography>
                    </Box>
                    <Box className="cohort-performance-dashboard__stat-row">
                      <Typography variant="body2" color="text.secondary">
                        Excused Today:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {cohort.excusedToday || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Trend Information */}
                  {cohort.trend && (
                    <Box className="cohort-performance-dashboard__trend-section">
                      <Box className="cohort-performance-dashboard__trend-header">
                        <Typography variant="body2" color="text.secondary">
                          Weekly Trend
                        </Typography>
                        <Chip
                          icon={getTrendIcon(cohort.trend)}
                          label={`${cohort.trend > 0 ? '+' : ''}${cohort.trend.toFixed(1)}%`}
                          color={getTrendColor(cohort.trend)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Risk Assessment Section */}
      {data.riskAssessment && data.riskAssessment.length > 0 && (
        <Card className="cohort-performance-dashboard__risk-card">
          <CardContent>
            <Box className="cohort-performance-dashboard__risk-header">
              <WarningIcon className="cohort-performance-dashboard__risk-icon" />
              <Typography variant="h6" component="h3">
                Builders at Risk
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Builders below attendance thresholds requiring attention
            </Typography>
            
            <TableContainer component={Paper} className="cohort-performance-dashboard__risk-table">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Builder</TableCell>
                    <TableCell>Cohort</TableCell>
                    <TableCell align="right">Attendance Rate</TableCell>
                    <TableCell align="right">Requirement</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Recommendation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.riskAssessment.map((builder, index) => {
                    const requirement = getRequirementForCohort(builder.cohort);
                    const isAtRisk = builder.attendanceRate < requirement;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box className="cohort-performance-dashboard__builder-info">
                            <PersonIcon className="cohort-performance-dashboard__builder-icon" />
                            <Box>
                              <Typography variant="body2" color="text.primary">
                                {builder.firstName} {builder.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {builder.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{builder.cohort}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            color={isAtRisk ? 'error' : 'text.primary'}
                            fontWeight={isAtRisk ? 'bold' : 'normal'}
                          >
                            {builder.attendanceRate.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{requirement}%</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isAtRisk ? 'At Risk' : 'Safe'}
                            color={isAtRisk ? 'error' : 'success'}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={builder.recommendation || 'Monitor'}
                            color={isAtRisk ? 'warning' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card className="cohort-performance-dashboard__summary-card">
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Overall Performance
              </Typography>
              <Typography variant="h4" color="primary">
                {data.summary?.overallAttendanceRate?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across all cohorts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="cohort-performance-dashboard__summary-card">
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Cohorts Meeting Requirements
              </Typography>
              <Typography variant="h4" color="success.main">
                {data.summary?.cohortsMeetingRequirement || 0} / {data.summary?.totalCohorts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cohorts above threshold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="cohort-performance-dashboard__summary-card">
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Builders at Risk
              </Typography>
              <Typography variant="h4" color="error.main">
                {data.summary?.buildersAtRisk || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requiring attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CohortPerformanceDashboard;
