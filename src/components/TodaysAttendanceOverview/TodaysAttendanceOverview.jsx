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
            <Typography 
              variant="caption" 
              className="todays-attendance-overview__last-updated"
              sx={{ color: '#FFFFFF' }}
            >
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

      {/* Summary Cards - Modern Grid with Better Spacing */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                border: '2px solid rgba(102, 126, 234, 0.5)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PeopleIcon sx={{ fontSize: '3rem', color: '#667eea', mb: 1.5 }} />
              <Typography variant="h3" component="div" sx={{ color: '#1a1a1a', fontWeight: 700, mb: 0.5 }}>
                {(data.summary?.present || 0) + (data.summary?.late || 0) + (data.summary?.excused || 0)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', fontWeight: 600 }}>
                Total Check-ins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
              border: '2px solid rgba(251, 146, 60, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(251, 146, 60, 0.3)',
                border: '2px solid rgba(251, 146, 60, 0.5)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ScheduleIcon sx={{ fontSize: '3rem', color: '#fb923c', mb: 1.5 }} />
              <Typography variant="h3" component="div" sx={{ color: '#1a1a1a', fontWeight: 700, mb: 0.5 }}>
                {data.summary?.late || 0}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', fontWeight: 600 }}>
                Late Arrivals
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                border: '2px solid rgba(239, 68, 68, 0.5)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <WarningIcon sx={{ fontSize: '3rem', color: '#ef4444', mb: 1.5 }} />
              <Typography variant="h3" component="div" sx={{ color: '#1a1a1a', fontWeight: 700, mb: 0.5 }}>
                {data.summary?.absent || 0}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', fontWeight: 600 }}>
                Absent
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
                border: '2px solid rgba(34, 197, 94, 0.5)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: '3rem', color: '#22c55e', mb: 1.5 }} />
              <Typography variant="h3" component="div" sx={{ color: '#1a1a1a', fontWeight: 700, mb: 0.5 }}>
                {data.summary?.totalBuilders || 0}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', fontWeight: 600 }}>
                Total Builders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cohort Performance - Modern Cards with Better Contrast */}
      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
        Cohort Breakdown
      </Typography>
      <Box className="todays-attendance-overview__cohorts-grid">
        {data.cohorts?.map((cohort) => (
          <Card 
            key={cohort.cohort} 
            className="todays-attendance-overview__cohort-card"
            sx={{
              background: '#FFFFFF',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                border: '2px solid rgba(102, 126, 234, 0.5)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box className="todays-attendance-overview__cohort-header">
                <Typography variant="h6" component="h3" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                  {cohort.cohort}
                </Typography>
                <Chip
                  icon={getAttendanceRateIcon(cohort.attendanceRate)}
                  label={`${cohort.attendanceRate.toFixed(1)}%`}
                  sx={{
                    background: cohort.attendanceRate >= 85 ? 'rgba(34, 197, 94, 0.15)' :
                               cohort.attendanceRate >= 70 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: cohort.attendanceRate >= 85 ? '#16a34a' :
                           cohort.attendanceRate >= 70 ? '#ea580c' : '#dc2626',
                    border: `2px solid ${cohort.attendanceRate >= 85 ? '#22c55e' :
                                         cohort.attendanceRate >= 70 ? '#fb923c' : '#ef4444'}`,
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}
                />
              </Box>

              <Box className="todays-attendance-overview__cohort-stats">
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <Typography variant="h5" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        {cohort.present}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                        Present
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      background: 'rgba(251, 146, 60, 0.1)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(251, 146, 60, 0.2)'
                    }}>
                      <Typography variant="h5" sx={{ color: '#ea580c', fontWeight: 700 }}>
                        {cohort.late}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                        Late
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <Typography variant="h5" sx={{ color: '#2563eb', fontWeight: 700 }}>
                        {cohort.excused}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                        Excused
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <Typography variant="h5" sx={{ color: '#dc2626', fontWeight: 700 }}>
                        {cohort.absent}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                        Absent
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Recent Check-ins */}
              {cohort.recentCheckIns && cohort.recentCheckIns.length > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1a1a1a', fontWeight: 700 }}>
                    Recent Check-ins
                  </Typography>
                  <Box className="todays-attendance-overview__checkin-list">
                    {cohort.recentCheckIns.slice(0, 3).map((checkin, index) => (
                      <Box 
                        key={index} 
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          background: 'rgba(0, 0, 0, 0.02)',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          mb: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                          {checkin.firstName} {checkin.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 600 }}>
                            {formatTime(checkin.checkInTime)}
                          </Typography>
                          {checkin.lateArrivalMinutes > 0 && (
                            <Chip
                              label={`+${checkin.lateArrivalMinutes}m`}
                              size="small"
                              sx={{
                                background: checkin.lateArrivalMinutes <= 15 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: checkin.lateArrivalMinutes <= 15 ? '#ea580c' : '#dc2626',
                                border: `2px solid ${checkin.lateArrivalMinutes <= 15 ? '#fb923c' : '#ef4444'}`,
                                height: '24px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
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
        ))}
      </Box>

      {/* Quick Actions */}
      <Box className="todays-attendance-overview__quick-actions">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} className="todays-attendance-overview__quick-actions-buttons">
          <Grid item>
            <Chip
              label="View Full Roster"
              onClick={() => {/* Navigate to full roster */}}
              variant="outlined"
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                  color: '#000000'
                },
                border: '1px solid #E0E0E0'
              }}
            />
          </Grid>
          <Grid item>
            <Chip
              label="Export Today's Data"
              onClick={() => {/* Export functionality */}}
              variant="outlined"
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                  color: '#000000'
                },
                border: '1px solid #E0E0E0'
              }}
            />
          </Grid>
          <Grid item>
            <Chip
              label="Manage Excuses"
              onClick={() => {/* Navigate to excuse management */}}
              variant="outlined"
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                  color: '#000000'
                },
                border: '1px solid #E0E0E0'
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TodaysAttendanceOverview;
