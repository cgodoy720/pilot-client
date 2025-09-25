import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';
import { useNetworkStatus } from '../../utils/networkStatus';
import './TodaysAttendanceOverview.css';

const TodaysAttendanceOverview = () => {
  const { token } = useAuth();
  const { isOnline } = useNetworkStatus(React);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [fetchTime, setFetchTime] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // If offline, try to get cached data only
      if (!isOnline) {
        setIsOfflineMode(true);
        const response = await cachedAdminApi.getCachedTodaysAttendance(token, { forceRefresh: false, offlineOnly: true });
        
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
      const response = await cachedAdminApi.getCachedTodaysAttendance(token, { forceRefresh });
      
      setData(response.data);
      setLastUpdated(new Date());
      setCacheInfo({
        isFromCache: response.isFromCache,
        cachedAt: response.cachedAt,
        expiresAt: response.expiresAt
      });
      setFetchTime(response.fetchTime || 0);
    } catch (err) {
      console.error('Error fetching today\'s attendance overview:', err);
      
      // If it's a network error and we have cached data, show it
      if (!isOnline && data) {
        setIsOfflineMode(true);
        setError('Showing cached data - no network connection');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = () => {
    fetchData(true); // Force refresh, bypass cache
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 85) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  const getAttendanceRateIcon = (rate) => {
    if (rate >= 85) return <CheckCircleIcon />;
    if (rate >= 70) return <WarningIcon />;
    return <WarningIcon />;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getLateArrivalColor = (minutes) => {
    if (minutes === 0) return 'success';
    if (minutes <= 15) return 'warning';
    return 'error';
  };

  if (loading && !data) {
    return (
      <Box className="todays-attendance-overview">
        <Box className="todays-attendance-overview__loading">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading today's attendance data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="todays-attendance-overview">
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Error loading attendance data: {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="todays-attendance-overview">
        <Alert severity="info">
          No attendance data available for today.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="todays-attendance-overview">
      <Box className="todays-attendance-overview__header">
        <Box className="todays-attendance-overview__title-section">
          <PeopleIcon className="todays-attendance-overview__title-icon" />
          <Typography variant="h5" component="h2" className="todays-attendance-overview__title">
            Today's Attendance Overview
          </Typography>
        </Box>
        <Box className="todays-attendance-overview__actions">
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
            <Box className="todays-attendance-overview__cache-info">
              <Chip
                size="small"
                label={cacheInfo.isFromCache ? 'Cached' : 'Live'}
                color={cacheInfo.isFromCache ? 'info' : 'success'}
                variant="outlined"
                icon={cacheInfo.isFromCache ? <CheckCircleIcon /> : <ScheduleIcon />}
              />
              {fetchTime && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({fetchTime}ms)
                </Typography>
              )}
            </Box>
          )}
          <Tooltip title="Refresh data (bypass cache)">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="todays-attendance-overview__summary-card">
            <CardContent>
              <Box className="todays-attendance-overview__summary-content">
                <PeopleIcon className="todays-attendance-overview__summary-icon" />
                <Box>
                  <Typography variant="h4" component="div">
                    {(data.summary?.present || 0) + (data.summary?.late || 0) + (data.summary?.excused || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Check-ins
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="todays-attendance-overview__summary-card">
            <CardContent>
              <Box className="todays-attendance-overview__summary-content">
                <ScheduleIcon className="todays-attendance-overview__summary-icon" />
                <Box>
                  <Typography variant="h4" component="div">
                    {data.summary?.late || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Arrivals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="todays-attendance-overview__summary-card">
            <CardContent>
              <Box className="todays-attendance-overview__summary-content">
                <WarningIcon className="todays-attendance-overview__summary-icon" />
                <Box>
                  <Typography variant="h4" component="div">
                    {data.summary?.absent || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="todays-attendance-overview__summary-card">
            <CardContent>
              <Box className="todays-attendance-overview__summary-content">
                <CheckCircleIcon className="todays-attendance-overview__summary-icon" />
                <Box>
                  <Typography variant="h4" component="div">
                    {data.summary?.totalBuilders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Builders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cohort Performance */}
      <Grid container spacing={3}>
        {data.cohorts?.map((cohort) => (
          <Grid item xs={12} md={6} key={cohort.cohort}>
            <Card className="todays-attendance-overview__cohort-card">
              <CardContent>
                <Box className="todays-attendance-overview__cohort-header">
                  <Typography variant="h6" component="h3">
                    {cohort.cohort}
                  </Typography>
                  <Chip
                    icon={getAttendanceRateIcon(cohort.attendanceRate)}
                    label={`${cohort.attendanceRate.toFixed(1)}%`}
                    color={getAttendanceRateColor(cohort.attendanceRate)}
                    variant="outlined"
                  />
                </Box>

                <Box className="todays-attendance-overview__cohort-stats">
                  <Box className="todays-attendance-overview__stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Present: {cohort.present} / {cohort.totalBuilders}
                    </Typography>
                  </Box>
                  <Box className="todays-attendance-overview__stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Late: {cohort.late}
                    </Typography>
                  </Box>
                  <Box className="todays-attendance-overview__stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Excused: {cohort.excused}
                    </Typography>
                  </Box>
                  <Box className="todays-attendance-overview__stat-item">
                    <Typography variant="body2" color="text.secondary">
                      Absent: {cohort.absent}
                    </Typography>
                  </Box>
                </Box>

                {/* Recent Check-ins */}
                {cohort.recentCheckIns && cohort.recentCheckIns.length > 0 && (
                  <Box className="todays-attendance-overview__recent-checkins">
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Recent Check-ins:
                    </Typography>
                    <Box className="todays-attendance-overview__checkin-list">
                      {cohort.recentCheckIns.slice(0, 3).map((checkin, index) => (
                        <Box key={index} className="todays-attendance-overview__checkin-item">
                          <Typography variant="body2">
                            {checkin.firstName} {checkin.lastName}
                          </Typography>
                          <Box className="todays-attendance-overview__checkin-details">
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(checkin.checkInTime)}
                            </Typography>
                            {checkin.lateArrivalMinutes > 0 && (
                              <Chip
                                label={`${checkin.lateArrivalMinutes}min late`}
                                size="small"
                                color={getLateArrivalColor(checkin.lateArrivalMinutes)}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box className="todays-attendance-overview__quick-actions">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip
              label="View Full Roster"
              onClick={() => {/* Navigate to full roster */}}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              label="Export Today's Data"
              onClick={() => {/* Export functionality */}}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              label="Manage Excuses"
              onClick={() => {/* Navigate to excuse management */}}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TodaysAttendanceOverview;
