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
import FeedbackSection from './sections/FeedbackSection';
import WorkProductSection from './sections/WorkProductSection';
import ComprehensionSection from './sections/ComprehensionSection';
import ResourcesSection from './sections/ResourcesSection';
import './Stats.css';

const Stats = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [cohortMonth, setCohortMonth] = useState(null);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);
        const userStats = await fetchUserStats(token);
        setStats(userStats);
        
        // Extract cohort month from the first task's day date if available
        if (userStats.tasks && userStats.tasks.length > 0) {
          const firstTask = userStats.tasks[0];
          if (firstTask.assigned_date) {
            const date = new Date(firstTask.assigned_date);
            // Format as "Month YYYY" (e.g., "March 2025")
            const cohortMonthStr = date.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric'
            });
            setCohortMonth(cohortMonthStr);
          }
        }
        
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
            <Box className="stats__tabs-container">
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                className="stats__tabs"
                variant="fullWidth"
                aria-label="Statistics tabs"
              >
                <Tab label="Work Product" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
                <Tab label="Comprehension" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
                <Tab label="Feedback" id="stats-tab-2" aria-controls="stats-tabpanel-2" />
                <Tab label="Resources" id="stats-tab-3" aria-controls="stats-tabpanel-3" />
              </Tabs>

              <Box 
                className="stats__tab-content"
                role="tabpanel"
                id={`stats-tabpanel-${activeTab}`}
                aria-labelledby={`stats-tab-${activeTab}`}
              >
                {activeTab === 0 && <WorkProductSection cohortMonth={cohortMonth} />}
                {activeTab === 1 && <ComprehensionSection cohortMonth={cohortMonth} />}
                {activeTab === 2 && <FeedbackSection feedback={stats.feedback} user={user} cohortMonth={cohortMonth} />}
                {activeTab === 3 && <ResourcesSection cohortMonth={cohortMonth} />}
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Stats; 