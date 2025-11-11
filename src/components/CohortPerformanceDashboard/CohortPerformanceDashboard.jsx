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
  InputLabel,
  TextField
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
  
  // Filter state for Builders at Risk table
  const [filters, setFilters] = useState({
    builder: '',
    cohort: '',
    attendanceRate: '',
    recommendation: ''
  });
  const [filteredRiskData, setFilteredRiskData] = useState([]);

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
      
      console.log('📊 Cohort Performance Response:', {
        cohorts: response.data?.cohorts?.length,
        riskAssessment: response.data?.riskAssessment?.length,
        summary: response.data?.summary,
        sampleRiskBuilder: response.data?.riskAssessment?.[0]
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

  // Update filtered data when filters or data changes
  useEffect(() => {
    if (data?.riskAssessment) {
      const filtered = applyFilters(data.riskAssessment);
      setFilteredRiskData(filtered);
    }
  }, [data?.riskAssessment, filters]);

  const handleRefresh = () => {
    // Clear cache and force refresh
    cachedAdminApi.invalidateAllAttendanceCaches();
    fetchData(true); // Force refresh, bypass cache
  };

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      builder: '',
      cohort: '',
      attendanceRate: '',
      recommendation: ''
    });
  };

  // Filter logic for risk assessment data
  const applyFilters = (riskData) => {
    if (!riskData) return [];
    
    console.log('🔍 Filtering risk data:', {
      totalBuilders: riskData.length,
      filters: filters,
      sampleBuilder: riskData[0]
    });
    
    const filtered = riskData.filter(builder => {
      const matchesBuilder = !filters.builder || 
        `${builder.firstName} ${builder.lastName}`.toLowerCase().includes(filters.builder.toLowerCase()) ||
        builder.email.toLowerCase().includes(filters.builder.toLowerCase());
      
      const matchesCohort = !filters.cohort || builder.cohort.includes(filters.cohort);
      
      const matchesRate = !filters.attendanceRate || 
        builder.attendanceRate.toString().includes(filters.attendanceRate);
      
      const matchesRecommendation = !filters.recommendation || 
        (builder.recommendation || 'Monitor').includes(filters.recommendation);
      
      return matchesBuilder && matchesCohort && matchesRate && matchesRecommendation;
    });
    
    console.log('✅ Filtered results:', {
      originalCount: riskData.length,
      filteredCount: filtered.length
    });
    
    return filtered;
  };

  const getRequirementForCohort = (cohort) => {
    // Cohort attendance requirements based on program level
    // L1 (Fellowship Program): 80% requirement
    // L2 (Advanced Track): 85% requirement  
    // L3 (Senior Track): 85% requirement
    
    if (cohort.includes('June 2025')) return 85; // L2
    if (cohort.includes('March 2025')) return 85; // L3
    if (cohort.includes('September 2025')) return 80; // L1
    if (cohort.includes('L1') || cohort.includes('December')) return 80; // L1 cohorts
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
            <Typography 
              variant="caption" 
              className="cohort-performance-dashboard__last-updated"
              sx={{ color: '#FFFFFF' }}
            >
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

      {/* Performance Overview Cards - Row 1: Cohort Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {data.cohorts?.map((cohort) => {
          const requirement = getRequirementForCohort(cohort.cohort);
          const performanceColor = getPerformanceColor(cohort.attendanceRate, requirement);
          const isMeetingRequirement = cohort.attendanceRate >= requirement;
          
          return (
            <Grid item xs={12} sm={6} lg={4} key={cohort.cohort}>
              <Card 
                className="cohort-performance-dashboard__cohort-card"
                sx={{
                  background: isMeetingRequirement 
                    ? 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(235, 51, 73, 0.1) 0%, rgba(244, 92, 67, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${isMeetingRequirement ? 'rgba(17, 153, 142, 0.3)' : 'rgba(235, 51, 73, 0.3)'}`,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header with Cohort Name */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        background: isMeetingRequirement
                          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                          : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1.5
                      }}
                    >
                      {cohort.cohort}
                    </Typography>
                    
                    {/* Percentage Display - COMPACT */}
                    <Tooltip 
                      title={`Builders have attended ≥${requirement}% sessions`}
                      arrow
                      placement="top"
                    >
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: '12px',
                        background: isMeetingRequirement
                          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                          : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                        boxShadow: isMeetingRequirement
                          ? '0 4px 20px rgba(17, 153, 142, 0.3)'
                          : '0 4px 20px rgba(235, 51, 73, 0.3)',
                        cursor: 'help',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: isMeetingRequirement
                            ? '0 6px 25px rgba(17, 153, 142, 0.4)'
                            : '0 6px 25px rgba(235, 51, 73, 0.4)',
                        }
                      }}>
                        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, lineHeight: 1 }}>
                          {cohort.attendanceRate.toFixed(0)}%
                        </Typography>
                        <Chip
                          icon={isMeetingRequirement ? <CheckCircleIcon /> : <WarningIcon />}
                          label={`Target: ${requirement}%`}
                          size="small"
                          sx={{ 
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderColor: 'rgba(255,255,255,0.3)'
                          }}
                          variant="outlined"
                        />
                      </Box>
                    </Tooltip>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: '0.7rem' }}>
                        Cohort Target: 75%+
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#333', fontSize: '0.7rem' }}>
                        {cohort.attendanceRate.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={cohort.attendanceRate}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        background: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: isMeetingRequirement
                            ? 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)'
                            : 'linear-gradient(90deg, #eb3349 0%, #f45c43 100%)',
                        }
                      }}
                    />
                  </Box>

                  {/* Stats Grid - Compact 2x2 */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 1.5
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#333', lineHeight: 1, mb: 0.5 }}>
                        {cohort.totalBuilders}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Total Builders
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
                        boxShadow: '0 4px 12px rgba(17, 153, 142, 0.2)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#11998e', lineHeight: 1, mb: 0.5 }}>
                        {cohort.presentToday}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Present Today
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
                        boxShadow: '0 4px 12px rgba(235, 51, 73, 0.2)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#eb3349', lineHeight: 1, mb: 0.5 }}>
                        {cohort.absentToday}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Absent Today
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
                        boxShadow: '0 4px 12px rgba(242, 153, 74, 0.2)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#f2994a', lineHeight: 1, mb: 0.5 }}>
                        {cohort.excusedToday || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Excused Today
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Statistics - Row 2: MODERNIZED */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            className="cohort-performance-dashboard__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Overall Performance
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#fff', 
                fontWeight: 900,
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                mb: 1
              }}>
                {data.summary?.overallAttendanceRate?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Average across all cohorts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            className="cohort-performance-dashboard__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.15) 0%, rgba(56, 239, 125, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(17, 153, 142, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(17, 153, 142, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(17, 153, 142, 0.3)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Cohorts Meeting Target
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#fff', 
                fontWeight: 900,
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                mb: 1
              }}>
                {data.summary?.cohortsMeetingRequirement || 0} / {data.summary?.totalCohorts || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Cohorts above threshold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            className="cohort-performance-dashboard__summary-card"
            sx={{
              background: 'linear-gradient(135deg, rgba(235, 51, 73, 0.15) 0%, rgba(244, 92, 67, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(235, 51, 73, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(235, 51, 73, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 60px rgba(235, 51, 73, 0.3)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Builders at Risk
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#fff', 
                fontWeight: 900,
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                mb: 1
              }}>
                {data.summary?.buildersAtRisk || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Requiring attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
              {filteredRiskData.length !== data.riskAssessment.length && (
                <span> ({filteredRiskData.length} of {data.riskAssessment.length} shown)</span>
              )}
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
                  <TableRow className="cohort-performance-dashboard__filter-row">
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Filter by name..."
                        value={filters.builder}
                        onChange={(e) => handleFilterChange('builder', e.target.value)}
                        InputProps={{ 
                          style: { 
                            backgroundColor: '#fff',
                            color: '#1a1a1a',
                            fontSize: '0.75rem'
                          } 
                        }}
                        inputProps={{
                          style: {
                            color: '#1a1a1a'
                          }
                        }}
                        sx={{ 
                          minWidth: '120px',
                          '& .MuiInputBase-input::placeholder': {
                            color: '#6b7280',
                            opacity: 1
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        displayEmpty
                        value={filters.cohort}
                        onChange={(e) => handleFilterChange('cohort', e.target.value)}
                        style={{ 
                          backgroundColor: '#fff', 
                          color: '#1a1a1a',
                          minWidth: '120px',
                          fontSize: '0.75rem'
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#fff'
                            }
                          }
                        }}
                      >
                        <MenuItem value="" style={{ color: '#1a1a1a' }}>All Cohorts</MenuItem>
                        <MenuItem value="September 2025" style={{ color: '#1a1a1a' }}>September 2025 (L1)</MenuItem>
                        <MenuItem value="June 2025" style={{ color: '#1a1a1a' }}>June 2025 (L2)</MenuItem>
                        <MenuItem value="March 2025" style={{ color: '#1a1a1a' }}>March 2025 (L3)</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        placeholder="Filter rate..."
                        value={filters.attendanceRate}
                        onChange={(e) => handleFilterChange('attendanceRate', e.target.value)}
                        InputProps={{ 
                          style: { 
                            backgroundColor: '#fff',
                            color: '#1a1a1a',
                            fontSize: '0.75rem'
                          } 
                        }}
                        inputProps={{
                          style: {
                            color: '#1a1a1a'
                          }
                        }}
                        sx={{ 
                          minWidth: '80px',
                          '& .MuiInputBase-input::placeholder': {
                            color: '#6b7280',
                            opacity: 1
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* No filter for Requirement */}
                    </TableCell>
                    <TableCell align="center">
                      {/* Status filter removed - this table only shows at-risk builders */}
                    </TableCell>
                    <TableCell align="center">
                      <Select
                        size="small"
                        displayEmpty
                        value={filters.recommendation}
                        onChange={(e) => handleFilterChange('recommendation', e.target.value)}
                        style={{ 
                          backgroundColor: '#fff', 
                          color: '#1a1a1a',
                          minWidth: '120px',
                          fontSize: '0.75rem'
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#fff'
                            }
                          }
                        }}
                      >
                        <MenuItem value="" style={{ color: '#1a1a1a' }}>All</MenuItem>
                        <MenuItem value="Monitor" style={{ color: '#1a1a1a' }}>Monitor</MenuItem>
                        <MenuItem value="Intervention Required" style={{ color: '#1a1a1a' }}>Intervention Required</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRiskData.map((builder, index) => {
                    const requirement = getRequirementForCohort(builder.cohort);
                    const isAtRisk = builder.attendanceRate < requirement;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box className="cohort-performance-dashboard__builder-info">
                            <PersonIcon className="cohort-performance-dashboard__builder-icon" />
                            <Box>
                              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                                {builder.firstName} {builder.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                                {builder.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#FFFFFF' }}>{builder.cohort}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            sx={{ color: isAtRisk ? '#f44336' : '#FFFFFF' }}
                            fontWeight={isAtRisk ? 'bold' : 'normal'}
                          >
                            {builder.attendanceRate.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#FFFFFF' }}>{requirement}%</TableCell>
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
            
            {/* Clear Filters Button */}
            {(filters.builder || filters.cohort || filters.attendanceRate || filters.recommendation) && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip
                  label="Clear All Filters"
                  onClick={clearFilters}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

export default CohortPerformanceDashboard;
