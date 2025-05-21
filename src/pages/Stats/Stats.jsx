import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fetchUserStats } from '../../utils/statsApi';
import TasksSection from './sections/TasksSection';
import SubmissionsSection from './sections/SubmissionsSection';
import FeedbackSection from './sections/FeedbackSection';
import WorkProductSection from './sections/WorkProductSection';
import ComprehensionSection from './sections/ComprehensionSection';
import ResourcesSection from './sections/ResourcesSection';
import ProgressOverview from './sections/ProgressOverview';
import './Stats.css';

const Stats = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);
        const userStats = await fetchUserStats(token);
        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load your statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadUserStats();
    }
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box className="stats__loading-container">
        <CircularProgress style={{ color: 'var(--color-primary)' }} />
        <Typography variant="body1">Loading your statistics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="stats__error-container">
        <Typography variant="h6" style={{ color: 'var(--color-error)' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="stats">
      <Container maxWidth="xl" sx={{ pt: 1, pb: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {stats && (
          <>
            <Box className="stats__overview">
              <ProgressOverview stats={stats} />
            </Box>

            <Box className="stats__tabs-container">
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                className="stats__tabs"
                variant="fullWidth"
                aria-label="Statistics tabs"
              >
                <Tab label="Tasks" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
                <Tab label="Deliverable Submissions" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
                <Tab label="Feedback" id="stats-tab-2" aria-controls="stats-tabpanel-2" />
                <Tab label="Work Product" id="stats-tab-3" aria-controls="stats-tabpanel-3" />
                <Tab label="Comprehension" id="stats-tab-4" aria-controls="stats-tabpanel-4" />
                <Tab label="Resources" id="stats-tab-5" aria-controls="stats-tabpanel-5" />
              </Tabs>

              <Box 
                className="stats__tab-content"
                role="tabpanel"
                id={`stats-tabpanel-${activeTab}`}
                aria-labelledby={`stats-tab-${activeTab}`}
              >
                {activeTab === 0 && <TasksSection tasks={stats.tasks} />}
                {activeTab === 1 && <SubmissionsSection submissions={stats.submissions} />}
                {activeTab === 2 && <FeedbackSection feedback={stats.feedback} user={user} />}
                {activeTab === 3 && <WorkProductSection />}
                {activeTab === 4 && <ComprehensionSection />}
                {activeTab === 5 && <ResourcesSection />}
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Stats; 