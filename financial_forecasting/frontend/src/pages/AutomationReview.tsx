import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete,
  Divider,
} from '@mui/material';
import {
  RateReview as ReviewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Edit as EditIcon,
  Chat as SlackIcon,
  Email as GmailIcon,
  Event as CalendarIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';

const sourceIcon = (source: string) => {
  switch (source) {
    case 'slack': return <SlackIcon fontSize="small" color="info" />;
    case 'gmail': return <GmailIcon fontSize="small" color="error" />;
    case 'calendar': return <CalendarIcon fontSize="small" color="primary" />;
    default: return <ReviewIcon fontSize="small" />;
  }
};

const actionColor = (action: string): 'info' | 'warning' | 'success' | 'default' => {
  switch (action) {
    case 'stage_change': return 'warning';
    case 'task': return 'info';
    case 'note': return 'success';
    default: return 'default';
  }
};

const confidenceLabel = (confidence: number) => {
  if (confidence >= 0.8) return { label: 'High', color: 'success' as const };
  if (confidence >= 0.5) return { label: 'Medium', color: 'warning' as const };
  return { label: 'Low', color: 'error' as const };
};

const AutomationReview: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Fetch pending or all items
  const { data: reviewData, isLoading } = useQuery(
    ['automation-review', showAll ? 'all' : 'pending'],
    async () => {
      const response = showAll
        ? await apiService.getAllReviews()
        : await apiService.getPendingReviews();
      return response.data?.data || response.data || [];
    },
    { refetchInterval: 10000 }
  );

  // Fetch opportunities for matching
  const { data: oppsData } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  const opportunities = Array.isArray(oppsData)
    ? oppsData
    : (oppsData?.opportunities || oppsData?.data || []);

  // Approve mutation
  const approveMutation = useMutation(
    async ({ id, edits }: { id: string; edits?: any }) => {
      return apiService.approveReview(id, edits);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('automation-review');
        toast.success('Update approved and applied to Salesforce');
      },
      onError: () => toast.error('Failed to approve'),
    }
  );

  // Reject mutation
  const rejectMutation = useMutation(
    async (id: string) => {
      return apiService.rejectReview(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('automation-review');
        toast.success('Update rejected');
      },
    }
  );

  // Test message mutation (simulates Slack webhook)
  const testMutation = useMutation(
    async (text: string) => {
      return apiService.submitSlackWebhook(text, 'test');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('automation-review');
        setTestDialogOpen(false);
        setTestMessage('');
        toast.success('Test message parsed and queued');
      },
    }
  );

  const items = Array.isArray(reviewData) ? reviewData : [];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Automation Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve CRM updates parsed from Slack, Gmail, and Calendar
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={showAll ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Pending Only' : 'Show All'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<SendIcon />}
            onClick={() => setTestDialogOpen(true)}
          >
            Test Message
          </Button>
        </Stack>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReviewIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No pending updates
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            CRM updates from Slack will appear here. Use "Test Message" to try the parser.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {items.map((item: any) => {
            const parsed = item.parsed || {};
            const conf = confidenceLabel(parsed.confidence || 0);
            const isPending = item.status === 'pending';

            return (
              <Card key={item.id} variant="outlined" sx={{ opacity: isPending ? 1 : 0.7 }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Source icon */}
                    <Box sx={{ mt: 0.5 }}>{sourceIcon(item.source)}</Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Raw message */}
                      <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, color: 'text.secondary' }}>
                        "{item.raw_text}"
                      </Typography>

                      {/* Parsed action */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          label={parsed.action?.replace('_', ' ')}
                          size="small"
                          color={actionColor(parsed.action)}
                          variant="outlined"
                        />
                        {parsed.stage && (
                          <Chip label={`Stage → ${parsed.stage}`} size="small" color="warning" />
                        )}
                        <Chip label={conf.label} size="small" color={conf.color} variant="outlined" />
                        {parsed.matched_opportunity && (
                          <Chip
                            label={`Opp: ${parsed.matched_opportunity}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {/* Metadata */}
                      <Typography variant="caption" color="text.secondary">
                        {item.source_detail?.user || 'Unknown'} via {item.source}
                        {item.source_detail?.channel ? ` #${item.source_detail.channel}` : ''}
                        {' — '}
                        {item.created_at ? format(new Date(item.created_at), 'MMM d, h:mm a') : ''}
                      </Typography>

                      {/* Status badge for non-pending */}
                      {!isPending && (
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'approved' ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    {/* Actions */}
                    {isPending && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => approveMutation.mutate({ id: item.id })}
                          disabled={approveMutation.isLoading}
                          title="Approve"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton
                          color="default"
                          size="small"
                          onClick={() => {
                            setEditItem(item);
                            setEditDialogOpen(true);
                          }}
                          title="Edit & Approve"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => rejectMutation.mutate(item.id)}
                          disabled={rejectMutation.isLoading}
                          title="Reject"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Test Message Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Slack CRM Update</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type a message as if you were updating the CRM from Slack:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder='e.g. "Met with Goldman Sachs today, they want to move to contract stage. Follow up on Tuesday."'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => testMutation.mutate(testMessage)}
            disabled={!testMessage.trim() || testMutation.isLoading}
          >
            {testMutation.isLoading ? <CircularProgress size={20} /> : 'Parse & Queue'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit & Approve Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit & Approve</DialogTitle>
        <DialogContent>
          {editItem && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info">Edit the parsed action before applying to Salesforce.</Alert>
              <TextField
                label="Action"
                select
                fullWidth
                value={editItem.parsed?.action || 'note'}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    parsed: { ...editItem.parsed, action: e.target.value },
                  })
                }
                SelectProps={{ native: true }}
              >
                <option value="note">Note</option>
                <option value="stage_change">Stage Change</option>
                <option value="task">Create Task</option>
              </TextField>
              <TextField
                label="Detail"
                fullWidth
                multiline
                rows={2}
                value={editItem.parsed?.detail || ''}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    parsed: { ...editItem.parsed, detail: e.target.value },
                  })
                }
              />
              <Autocomplete
                options={opportunities}
                getOptionLabel={(opt: any) => `${opt.Name} — ${opt.Account?.Name || 'No Account'}`}
                value={
                  opportunities.find(
                    (o: any) => o.Id === editItem.parsed?.matched_opportunity
                  ) || null
                }
                onChange={(_, val: any) =>
                  setEditItem({
                    ...editItem,
                    parsed: { ...editItem.parsed, matched_opportunity: val?.Id || null },
                  })
                }
                renderInput={(params) => <TextField {...params} label="Match to Opportunity" />}
              />
              {editItem.parsed?.action === 'stage_change' && (
                <TextField
                  label="Target Stage"
                  fullWidth
                  value={editItem.parsed?.stage || ''}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      parsed: { ...editItem.parsed, stage: e.target.value },
                    })
                  }
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (editItem) {
                approveMutation.mutate({ id: editItem.id, edits: editItem.parsed });
                setEditDialogOpen(false);
              }
            }}
            disabled={approveMutation.isLoading}
          >
            Approve with Edits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationReview;
