import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  Container,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useAuth } from '../../context/AuthContext';
import { fetchUserStats } from '../../utils/statsApi';
import CohortPerformanceDashboard from '../../components/CohortPerformanceDashboard/CohortPerformanceDashboard';
import TodaysAttendanceOverview from '../../components/TodaysAttendanceOverview/TodaysAttendanceOverview';
import ExcuseManagementInterface from '../../components/ExcuseManagementInterface/ExcuseManagementInterface';
import CSVExport from '../../components/CSVExport/CSVExport';
import AdminDashboardErrorBoundary from '../../components/ErrorBoundary/AdminDashboardErrorBoundary';
import TabErrorBoundary from '../../components/ErrorBoundary/TabErrorBoundary';
import NetworkStatusIndicator from '../../components/NetworkStatusIndicator/NetworkStatusIndicator';
import OfflineModeMessage from '../../components/OfflineModeMessage/OfflineModeMessage';
import QueuedActionsPanel from '../../components/QueuedActionsPanel/QueuedActionsPanel';
import ConnectivityNotification from '../../components/ConnectivityNotification/ConnectivityNotification';
import './AdminAttendanceDashboard.css';

const AdminAttendanceDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);
        const userStats = await fetchUserStats(token);
        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load statistics. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };

    if (token && isAdmin) {
      loadUserStats();
    }
  }, [token, isAdmin]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!isAdmin) {
    return (
      <Box className="admin-attendance-dashboard">
        <Alert severity="error">
          Access denied. Admin or staff privileges required.
        </Alert>
      </Box>
    );
  }

  const attendanceTools = [
    {
      title: 'Main Admin Dashboard',
      description: 'Performance metrics, task analysis, and administrative tools.',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      path: '/admin',
      color: '#1976d2'
    },
    {
      title: 'Admissions Dashboard',
      description: 'Manage applications, info sessions, and workshop registrations.',
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      path: '/admissions-dashboard',
      color: '#388e3c'
    },
    {
      title: 'Builder Check-in Site',
      description: 'Direct link to the builder-facing attendance check-in interface.',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: 'https://platform.pursuit.org/admin-dashboard',
      color: '#f57c00',
      external: true
    }
  ];


  return (
    <AdminDashboardErrorBoundary>
      <ConnectivityNotification />
      <Box className="admin-attendance-dashboard">
        <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box className="admin-attendance-dashboard__header">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" className="admin-attendance-dashboard__title">
              Admin Attendance Dashboard
            </Typography>
            <NetworkStatusIndicator />
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box className="admin-attendance-dashboard__tabs-container" sx={{ mb: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="admin-attendance-dashboard__tabs"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Admin attendance dashboard tabs"
          >
            <Tab label="Overview" id="attendance-tab-0" aria-controls="attendance-tabpanel-0" />
            <Tab label="Today's Attendance" id="attendance-tab-1" aria-controls="attendance-tabpanel-1" />
            <Tab label="Cohort Performance" id="attendance-tab-2" aria-controls="attendance-tabpanel-2" />
            <Tab label="Excuse Management" id="attendance-tab-3" aria-controls="attendance-tabpanel-3" />
            <Tab label="CSV Export" id="attendance-tab-4" aria-controls="attendance-tabpanel-4" />
            <Tab label="Other Tools" id="attendance-tab-5" aria-controls="attendance-tabpanel-5" />
          </Tabs>
        </Box>

        {/* Queued Actions Panel */}
        <QueuedActionsPanel />

        {/* Tab Content */}
        <Box
          className="admin-attendance-dashboard__tab-content"
          role="tabpanel"
          id={`attendance-tabpanel-${activeTab}`}
          aria-labelledby={`attendance-tab-${activeTab}`}
          sx={{ flexGrow: 1 }}
        >
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Feature Cards Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Today's Attendance Card */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                    onClick={() => setActiveTab(1)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <AssessmentIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Today's Attendance
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Real-time attendance tracking and daily overview
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Cohort Performance Card */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)'
                      }
                    }}
                    onClick={() => setActiveTab(2)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <AnalyticsIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Cohort Performance
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Monitor attendance rates and trends by cohort
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Excuse Management Card */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)'
                      }
                    }}
                    onClick={() => setActiveTab(3)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <GroupsIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Excuse Management
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Manage excused absences and modifications
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* CSV Export Card */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(67, 233, 123, 0.4)'
                      }
                    }}
                    onClick={() => setActiveTab(4)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <GetAppIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        CSV Export
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Export attendance data for analysis and reporting
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Info Section */}
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  mb: 3
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <AssessmentIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                        Attendance Management Hub
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        Comprehensive tools for tracking, managing, and analyzing builder attendance across all cohorts.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#667eea' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              Real-time tracking
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f5576c' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              Performance analytics
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#4facfe' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              Excuse workflow
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#43e97b' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              Data export
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Today's Attendance Tab */}
          {activeTab === 1 && (
            <TabErrorBoundary tabName="Today's Attendance">
              <OfflineModeMessage>
                <TodaysAttendanceOverview />
              </OfflineModeMessage>
            </TabErrorBoundary>
          )}

          {/* Cohort Performance Tab */}
          {activeTab === 2 && (
            <TabErrorBoundary tabName="Cohort Performance">
              <OfflineModeMessage showCachedData={true} cachedDataCount={stats?.cohorts?.length || 0}>
                <CohortPerformanceDashboard />
              </OfflineModeMessage>
            </TabErrorBoundary>
          )}

          {/* Excuse Management Tab */}
          {activeTab === 3 && (
            <TabErrorBoundary tabName="Excuse Management">
              <OfflineModeMessage>
                <ExcuseManagementInterface />
              </OfflineModeMessage>
            </TabErrorBoundary>
          )}

          {/* CSV Export Tab */}
          {activeTab === 4 && (
            <TabErrorBoundary tabName="CSV Export">
              <OfflineModeMessage>
                <CSVExport />
              </OfflineModeMessage>
            </TabErrorBoundary>
          )}

          {/* Other Tools Tab */}
          {activeTab === 5 && (
            <OfflineModeMessage>
              <Grid container spacing={3} className="admin-attendance-dashboard__tools-grid">
                {attendanceTools.map((tool, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card
                    className="admin-attendance-dashboard__tool-card"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent className="admin-attendance-dashboard__tool-content">
                      <Box
                        className="admin-attendance-dashboard__tool-icon"
                        sx={{
                          color: tool.color,
                          marginBottom: 2,
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        {tool.icon}
                      </Box>
                      <Typography variant="h6" component="h2" className="admin-attendance-dashboard__tool-title">
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="admin-attendance-dashboard__tool-description">
                        {tool.description}
                      </Typography>
                    </CardContent>
                    <CardActions className="admin-attendance-dashboard__tool-actions">
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ backgroundColor: tool.color }}
                        onClick={() => {
                          if (tool.external) {
                            window.open(tool.path, '_blank');
                          } else {
                            navigate(tool.path);
                          }
                        }}
                        fullWidth
                      >
                        {tool.external ? 'Open External' : 'Access'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              </Grid>
            </OfflineModeMessage>
          )}
        </Box>
        </Container>
      </Box>
    </AdminDashboardErrorBoundary>
  );
};

export default AdminAttendanceDashboard;