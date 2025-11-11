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

      {/* Summary Cards - Compact Modern Design */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <PeopleIcon sx={{ fontSize: '2rem', color: '#667eea', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                {(data.summary?.present || 0) + (data.summary?.late || 0) + (data.summary?.excused || 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Check-ins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CheckCircleIcon sx={{ fontSize: '2rem', color: '#22c55e', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                {data.summary?.present || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Present
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(251, 146, 60, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <ScheduleIcon sx={{ fontSize: '2rem', color: '#fb923c', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                {data.summary?.late || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Late
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card 
            className="todays-attendance-overview__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <WarningIcon sx={{ fontSize: '2rem', color: '#ef4444', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                {data.summary?.absent || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Absent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cohort Breakdown - Modern Wide Cards */}
      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Cohort Breakdown
      </Typography>
      <Box className="todays-attendance-overview__cohorts-grid">
        {data.cohorts?.map((cohort) => {
          const attendanceRate = cohort.attendanceRate || 0;
          const isMeetingTarget = attendanceRate >= 80;
          
          return (
            <Card 
              key={cohort.cohort} 
              className="todays-attendance-overview__cohort-card"
              sx={{
                background: isMeetingTarget
                  ? 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(235, 51, 73, 0.1) 0%, rgba(244, 92, 67, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${isMeetingTarget ? 'rgba(17, 153, 142, 0.3)' : 'rgba(235, 51, 73, 0.3)'}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 800,
                    background: isMeetingTarget
                      ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                      : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {cohort.cohort}
                  </Typography>
                  <Box sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: '10px',
                    background: isMeetingTarget
                      ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                      : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    boxShadow: isMeetingTarget
                      ? '0 4px 15px rgba(17, 153, 142, 0.3)'
                      : '0 4px 15px rgba(235, 51, 73, 0.3)',
                  }}>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, lineHeight: 1 }}>
                      {attendanceRate.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>

                {/* Stats - Horizontal 4-column */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 1.5,
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#22c55e', lineHeight: 1, mb: 0.5 }}>
                      {cohort.present}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Present
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fb923c', lineHeight: 1, mb: 0.5 }}>
                      {cohort.late}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Late
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#3b82f6', lineHeight: 1, mb: 0.5 }}>
                      {cohort.excused}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Excused
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.7)',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444', lineHeight: 1, mb: 0.5 }}>
                      {cohort.absent}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Absent
                    </Typography>
                  </Box>
                </Box>

                {/* Recent Check-ins */}
                {cohort.recentCheckIns && cohort.recentCheckIns.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid rgba(0, 0, 0, 0.08)' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem' }}>
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
                            background: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: '10px',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            mb: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(102, 126, 234, 0.1)',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                            {checkin.firstName} {checkin.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                              {formatTime(checkin.checkInTime)}
                            </Typography>
                            {checkin.lateArrivalMinutes > 0 && (
                              <Chip
                                label={`+${checkin.lateArrivalMinutes}m`}
                                size="small"
                                sx={{
                                  background: checkin.lateArrivalMinutes <= 15 ? 'rgba(251, 146, 60, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: checkin.lateArrivalMinutes <= 15 ? '#ea580c' : '#dc2626',
                                  border: `2px solid ${checkin.lateArrivalMinutes <= 15 ? '#fb923c' : '#ef4444'}`,
                                  height: '22px',
                                  fontSize: '0.7rem',
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
          );
        })}
      </Box>

      {/* Quick Actions - Modern Design */}
      <Box className="todays-attendance-overview__quick-actions">
        <Typography variant="h6" sx={{ mb: 3, color: '#fff', fontWeight: 700 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label="View Full Roster"
            onClick={() => {/* Navigate to full roster */}}
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '24px 20px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }
            }}
          />
          <Chip
            label="Export Today's Data"
            onClick={() => {/* Export functionality */}}
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '24px 20px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }
            }}
          />
          <Chip
            label="Manage Excuses"
            onClick={() => {/* Navigate to excuse management */}}
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1a1a1a',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '24px 20px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TodaysAttendanceOverview;
