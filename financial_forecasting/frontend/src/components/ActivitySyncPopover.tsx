import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  Popover,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivitySyncPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSyncComplete: () => void;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type Phase = 'loading' | 'ready' | 'syncing' | 'complete' | 'error';

interface CountData {
  task_count: number;
  event_count: number;
  total: number;
}

interface StatusData {
  total_activities: number;
  sf_synced: number;
  last_sync: string | null;
  pending_sync: number;
  sync_in_progress: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 60;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ActivitySyncPopover: React.FC<ActivitySyncPopoverProps> = ({
  anchorEl,
  onClose,
  onSyncComplete,
}) => {
  const open = Boolean(anchorEl);

  const [phase, setPhase] = useState<Phase>('loading');
  const [countData, setCountData] = useState<CountData | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncedTotal, setSyncedTotal] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // -----------------------------------------------------------------------
  // Cleanup helper
  // -----------------------------------------------------------------------

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  // -----------------------------------------------------------------------
  // Load initial data
  // -----------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setPhase('loading');
    setPermissionDenied(false);
    setErrorMessage('');
    setCountData(null);

    try {
      const [countRes, statusRes] = await Promise.allSettled([
        apiService.activitySyncCount(),
        apiService.activitySyncStatus(),
      ]);

      // Status is required — if it fails, go to error phase
      if (statusRes.status === 'rejected') {
        throw statusRes.reason;
      }
      const status: StatusData = statusRes.value.data.data;
      setStatusData(status);

      // If a sync is already in progress, jump straight to syncing + poll
      if (status.sync_in_progress) {
        setPhase('syncing');
        startPolling();
        return;
      }

      // Count may fail with 403 (permission denied) — that's handled gracefully
      if (countRes.status === 'fulfilled') {
        setCountData(countRes.value.data.data);
      } else {
        const err = countRes.reason as any;
        if (err?.response?.status === 403) {
          setPermissionDenied(true);
        } else {
          throw err;
        }
      }

      setPhase('ready');
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load sync status';
      setErrorMessage(String(detail));
      setPhase('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Polling
  // -----------------------------------------------------------------------

  const startPolling = useCallback(() => {
    stopPolling();
    pollCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLLS) {
        stopPolling();
        setErrorMessage('Sync is taking longer than expected. Please try again later.');
        setPhase('error');
        return;
      }

      try {
        const res = await apiService.activitySyncStatus();
        const status: StatusData = res.data.data;
        setStatusData(status);

        if (!status.sync_in_progress) {
          stopPolling();
          setSyncedTotal(status.sf_synced);
          setPhase('complete');
          onSyncComplete();
          toast.success('Salesforce activity sync complete');
        }
      } catch {
        // Transient poll failures are tolerated — the next tick will retry
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, onSyncComplete]);

  // -----------------------------------------------------------------------
  // Trigger sync
  // -----------------------------------------------------------------------

  const handleSync = useCallback(async () => {
    setPhase('syncing');
    setErrorMessage('');

    // Capture count total before we start, so we can display it in the
    // complete phase even after the count data is stale.
    if (countData) {
      setSyncedTotal(countData.total);
    }

    try {
      await apiService.activitySyncTrigger();
    } catch (err: any) {
      if (err?.response?.status !== 409) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to start sync';
        setErrorMessage(String(detail));
        setPhase('error');
        return;
      }
      // 409 = sync already running — fall through to polling
    }

    startPolling();
  }, [countData, startPolling]);

  // -----------------------------------------------------------------------
  // Open / close lifecycle
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      stopPolling();
      // Reset state so the popover is fresh next time
      setPhase('loading');
      setCountData(null);
      setStatusData(null);
      setPermissionDenied(false);
      setErrorMessage('');
      setSyncedTotal(0);
    }
  }, [open, loadData, stopPolling]);

  // Safety: clear interval on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // -----------------------------------------------------------------------
  // Format helpers
  // -----------------------------------------------------------------------

  const formatLastSync = (iso: string | null | undefined): string => {
    if (!iso) return 'Never';
    try {
      return format(parseISO(iso), 'MMM d, h:mm a');
    } catch {
      return 'Unknown';
    }
  };

  // -----------------------------------------------------------------------
  // Phase-specific content renderers
  // -----------------------------------------------------------------------

  const renderLoading = () => (
    <Box display="flex" alignItems="center" gap={1.5} py={2}>
      <CircularProgress size={20} />
      <Typography variant="body2">Checking Salesforce...</Typography>
    </Box>
  );

  const renderReady = () => {
    if (permissionDenied) {
      return (
        <Alert severity="warning" sx={{ mb: 0 }}>
          Permission required to trigger sync. Contact an admin to enable Salesforce activity sync
          for your account.
        </Alert>
      );
    }

    return (
      <>
        {countData && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Tasks: {countData.task_count}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Events: {countData.event_count}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {countData.total} available to import
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handleSync}
          sx={{ textTransform: 'none' }}
        >
          Sync Now
        </Button>
      </>
    );
  };

  const renderSyncing = () => (
    <>
      <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      <Typography variant="body2">Syncing activities...</Typography>
    </>
  );

  const renderComplete = () => (
    <>
      <Alert severity="success" sx={{ mb: 2 }}>
        Sync complete — {syncedTotal} activities imported
      </Alert>
      <Button
        variant="contained"
        size="small"
        fullWidth
        onClick={onClose}
        sx={{ textTransform: 'none' }}
      >
        Close
      </Button>
    </>
  );

  const renderError = () => (
    <>
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorMessage || 'An unexpected error occurred'}
      </Alert>
      <Button
        variant="contained"
        size="small"
        fullWidth
        onClick={loadData}
        sx={{ textTransform: 'none' }}
      >
        Retry
      </Button>
    </>
  );

  const phaseContent: Record<Phase, () => React.ReactNode> = {
    loading: renderLoading,
    ready: renderReady,
    syncing: renderSyncing,
    complete: renderComplete,
    error: renderError,
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={phase === 'syncing' ? undefined : onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 320, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Salesforce Sync
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last synced: {formatLastSync(statusData?.last_sync)}
        </Typography>
      </Box>
      <Divider />

      {/* Phase content */}
      <Box sx={{ p: 2 }}>{phaseContent[phase]()}</Box>
    </Popover>
  );
};

export default ActivitySyncPopover;
