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
      path: 'https://pursuit-ai-native.netlify.app/admin-dashboard',
      color: '#f57c00',
      external: true
    }
  ];


  return (
    <AdminDashboardErrorBoundary>
      <ConnectivityNotification />
      <Box className="admin-attendance-dashboard">
        <Container maxWidth="xl" sx={{ pt: 2, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box className="admin-attendance-dashboard__header">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h4" component="h1" className="admin-attendance-dashboard__title">
                Admin Attendance Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" className="admin-attendance-dashboard__subtitle">
                Staff Interface for Attendance Management & Monitoring
              </Typography>
            </Box>
            <NetworkStatusIndicator />
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box className="admin-attendance-dashboard__tabs-container" sx={{ mb: 3 }}>
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
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6" component="div" gutterBottom sx={{ color: '#1a1a1a' }}>
                  Welcome to the Admin Attendance Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  This is the staff interface for managing and monitoring builder attendance.
                  Use the tabs above to access different attendance management features:
                </Typography>
                <ul style={{ marginTop: '8px', marginBottom: '0', color: '#374151' }}>
                  <li><strong>Today's Attendance:</strong> View real-time attendance for today</li>
                  <li><strong>Cohort Performance:</strong> Monitor attendance rates and performance by cohort</li>
                  <li><strong>Excuse Management:</strong> Manage excused absences and attendance modifications</li>
                  <li><strong>CSV Export:</strong> Export attendance data for analysis and reporting</li>
                  <li><strong>Other Tools:</strong> Quick access to related admin interfaces</li>
                </ul>
              </Alert>

              <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setActiveTab(1)}
                    startIcon={<AssessmentIcon />}
                  >
                    View Today's Attendance
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setActiveTab(2)}
                    startIcon={<AnalyticsIcon />}
                  >
                    Cohort Performance
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setActiveTab(3)}
                    startIcon={<GroupsIcon />}
                  >
                    Excuse Management
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setActiveTab(4)}
                    startIcon={<GetAppIcon />}
                  >
                    CSV Export
                  </Button>
                </Grid>
              </Grid>
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