import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SFStatus {
  connected: boolean;
  user_id?: string;
  user_name?: string;
  instance_url?: string;
  message?: string;
  needs_reconnect?: boolean;
  refreshed?: boolean;
}

const Settings: React.FC = () => {
  const { user, connectSalesforce, disconnectSalesforce, refetch } = useAuth();
  const [sfStatus, setSfStatus] = useState<SFStatus | null>(null);
  const [sfLoading, setSfLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchSfStatus = async () => {
    setSfLoading(true);
    try {
      const response = await apiService.getSalesforceStatus();
      setSfStatus(response.data);
    } catch (error) {
      setSfStatus({ connected: false, message: 'Failed to check status' });
    } finally {
      setSfLoading(false);
    }
  };

  useEffect(() => {
    fetchSfStatus();

    // Handle redirect params from SF OAuth callback
    const sfConnected = searchParams.get('sf_connected');
    const sfError = searchParams.get('sf_error');

    if (sfConnected === 'true') {
      toast.success('Salesforce connected successfully!');
      refetch(); // Refresh user data to get new SF status
      // Clean up URL params
      setSearchParams({});
    } else if (sfError) {
      toast.error(`Salesforce connection failed: ${sfError}`);
      setSearchParams({});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnect = async () => {
    await disconnectSalesforce();
    await fetchSfStatus();
    toast.success('Salesforce disconnected');
  };

  const handleClearCache = async () => {
    try {
      await apiService.clearCache();
      toast.success('Cache cleared — data will refresh on next load');
    } catch {
      toast.error('Failed to clear cache');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Settings
      </Typography>

      {/* User Profile */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar src={user?.picture} sx={{ width: 48, height: 48 }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Salesforce Connection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudIcon color="primary" />
            Salesforce Connection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your Salesforce account so that all changes you make (creating opportunities, 
            updating stages, adding tasks) are attributed to you in Salesforce — not a shared service account.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {sfLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <CircularProgress size={24} />
              <Typography>Checking Salesforce connection...</Typography>
            </Box>
          ) : sfStatus?.connected ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
                Connected to Salesforce
              </Alert>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Salesforce User:</strong> {sfStatus.user_name || 'Unknown'}
                  </Typography>
                </Stack>
                {sfStatus.instance_url && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LinkIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Instance:</strong> {sfStatus.instance_url.replace('https://', '')}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label="Authenticated"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                  {sfStatus.refreshed && (
                    <Chip
                      label="Token refreshed"
                      color="info"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All your actions in Revenue Hub will be tracked under your Salesforce identity.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => { fetchSfStatus(); }}
                  size="small"
                >
                  Refresh Status
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LinkOffIcon />}
                  onClick={handleDisconnect}
                  size="small"
                >
                  Disconnect
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }} icon={<CloudOffIcon />}>
                {sfStatus?.needs_reconnect
                  ? 'Your Salesforce session has expired. Please reconnect.'
                  : 'Salesforce not connected'}
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user?.salesforce_user_name 
                  ? `We found a matching Salesforce account for your email (${user.salesforce_user_name}). 
                     Connect to authenticate with your own credentials.`
                  : 'Connect your Salesforce account to attribute changes to you.'}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<LinkIcon />}
                onClick={connectSalesforce}
                size="large"
                sx={{ textTransform: 'none' }}
              >
                Connect Salesforce Account
              </Button>

              {!user?.salesforce_user_name && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Note: Your Google email ({user?.email}) doesn't match any active Salesforce user.
                  Make sure you log in with the same email you use for Salesforce.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar Connection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            Google Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Calendar access is included with your Google login. Only the PBD shared calendar is synced.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {user?.google_connected ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
                Connected via Google login
              </Alert>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Active Calendar:</strong> PBD Shared Calendar
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="Read-only" color="info" size="small" variant="outlined" />
                </Stack>
              </Stack>
              <Alert severity="info" sx={{ mt: 2 }} icon={<InfoIcon />}>
                Personal calendars are not synced. Calendar selection coming soon.
              </Alert>
            </Box>
          ) : (
            <Alert severity="warning" icon={<CloudOffIcon />}>
              Google Calendar not connected. Please log in with Google to enable calendar sync.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Slack Connection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="primary" />
            Slack Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Slack is configured at the organization level via a bot token. Messages from #pipeline-updates
            are automatically parsed and queued for review.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {user?.slack_configured ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon />}>
                Bot connected to workspace
              </Alert>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ChatIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Workspace:</strong> {user.slack_workspace || 'Connected'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label="Bot connected to #pipeline-updates" color="success" size="small" variant="outlined" />
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Alert severity="warning" icon={<CloudOffIcon />}>
              Slack not configured — contact admin to set up the SLACK_BOT_TOKEN.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The app caches data from Salesforce and Sage Intacct for performance. 
            Clear the cache if you've made changes directly in Salesforce and want to see them immediately.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleClearCache}
          >
            Clear Cache & Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Connections
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              {sfStatus?.connected ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : (
                <ErrorIcon color="warning" fontSize="small" />
              )}
              <Typography variant="body2">
                Salesforce: {sfStatus?.connected ? 'Connected (your account)' : 'Using service account'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              {user?.google_connected ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : (
                <ErrorIcon color="warning" fontSize="small" />
              )}
              <Typography variant="body2">
                Google Calendar: {user?.google_connected ? 'Connected (PBD calendar)' : 'Not connected'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              {user?.slack_configured ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : (
                <ErrorIcon color="warning" fontSize="small" />
              )}
              <Typography variant="body2">
                Slack: {user?.slack_configured ? `Connected (${user.slack_workspace || 'workspace'})` : 'Not configured'}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
