/**
 * Opportunities page — orchestrator component.
 *
 * Wires together sub-components extracted into the Opportunities/ directory:
 *   - useOpportunityData: data fetching, mutations, derived state
 *   - columns:            DataGrid column definitions
 *   - EditCells:          Autocomplete edit cells for Account / Owner
 *   - SummaryCards:       metric cards above the grid
 *   - helpers:            pure functions + Opportunity interface
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar, GridRenderCellParams } from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import { parseISO, differenceInDays } from 'date-fns';

import { apiService } from '../services/api';
import PaymentScheduleModal from '../components/PaymentScheduleModal';
import TaskPanel from '../components/TaskPanel';
import ActivityIntelligencePanel from '../components/ActivityIntelligencePanel';
import PipelineFilterBar, { PipelineFilters, DEFAULT_FILTERS } from '../components/PipelineFilterBar';
import { OPPORTUNITY_STAGES, OPEN_STAGES, CLOSED_STAGES } from '../types/salesforce';
import type { Opportunity } from './Opportunities/helpers';
import { useOpportunityData, ViewMode } from './Opportunities/useOpportunityData';
import { buildPipelineColumns, buildPaymentColumns, ColumnCallbacks } from './Opportunities/columns';
import { SummaryCards } from './Opportunities/SummaryCards';

const Opportunities: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  // View & filter state
  const [viewMode, setViewMode] = useState<ViewMode>('open');
  const [philanthropyOnly, setPhilanthropyOnly] = useState(false);
  const [pbcOnly, setPbcOnly] = useState(false);
  const [aijiOnly, setAijiOnly] = useState(false);
  const [initialFilter, setInitialFilter] = useState<'atRisk' | 'stale' | null>(null);
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFilters>(DEFAULT_FILTERS);

  // Selection & bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'withdraw' | 'stage' | ''>('');
  const [bulkTargetStage, setBulkTargetStage] = useState('');

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Payment schedule modal
  const [paymentScheduleOpen, setPaymentScheduleOpen] = useState(false);
  const [paymentScheduleOpp, setPaymentScheduleOpp] = useState<Opportunity | null>(null);

  // Task panel
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [taskPanelOpp, setTaskPanelOpp] = useState<Opportunity | null>(null);

  // Activity intelligence drawer
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [activityOpp, setActivityOpp] = useState<Opportunity | null>(null);

  // Data hook
  const {
    opportunities,
    users,
    accountMap,
    userMap,
    openOnlyOpps,
    paymentOpps,
    isLoading,
    error,
    updateMutation,
    bulkUpdateMutation,
    queryClient,
    recentlyChangedIds,
    recentlyChangedRef,
    markRecentlyChanged,
    clearRecentlyChanged,
  } = useOpportunityData(viewMode, philanthropyOnly, pbcOnly);

  // Handle incoming filter from Dashboard
  useEffect(() => {
    const state = location.state as { filterAtRisk?: boolean; filterStale?: boolean } | null;
    if (state) {
      if (state.filterAtRisk) setInitialFilter('atRisk');
      else if (state.filterStale) setInitialFilter('stale');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSave = () => {
    if (!selectedOpp) return;
    const updates: any = {};
    if (editForm.Name !== selectedOpp.Name) updates.Name = editForm.Name;
    if (editForm.StageName !== selectedOpp.StageName) updates.StageName = editForm.StageName;
    if (editForm.Amount !== selectedOpp.Amount) updates.Amount = parseFloat(editForm.Amount);
    if (editForm.Probability !== selectedOpp.Probability) updates.Probability = parseInt(editForm.Probability);
    if (editForm.CloseDate !== selectedOpp.CloseDate) updates.CloseDate = editForm.CloseDate;

    if (Object.keys(updates).length === 0) {
      toast('No changes detected');
      setEditDialogOpen(false);
      return;
    }

    const stageChangedToCompleted = updates.StageName?.includes('Closed / Completed') && !selectedOpp.StageName.includes('Closed / Completed');
    updateMutation.mutate(
      { oppId: selectedOpp.Id, updates },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          if (stageChangedToCompleted) {
            const updatedOpp = { ...selectedOpp, ...updates };
            setPaymentScheduleOpp(updatedOpp);
            setPaymentScheduleOpen(true);
          }
        },
      },
    );
  };

  const handleBulkAction = (action: 'withdraw' | 'stage') => {
    if (selectedRowIds.length === 0) { toast.error('Please select opportunities first'); return; }
    setBulkAction(action);
    if (action === 'withdraw') setBulkTargetStage('Withdrawn');
    setBulkActionDialogOpen(true);
  };

  const handleBulkActionConfirm = () => {
    const updates = bulkAction === 'withdraw'
      ? { StageName: 'Withdrawn' }
      : bulkTargetStage ? { StageName: bulkTargetStage } : null;
    if (updates) {
      bulkUpdateMutation.mutate({ oppIds: selectedRowIds, updates }, {
        onSuccess: () => {
          setBulkActionDialogOpen(false);
          setSelectedRowIds([]);
          setBulkAction('');
          setBulkTargetStage('');
        },
      });
    }
  };

  const handleCellEdit = async (newRow: any, oldRow: any) => {
    const updates: any = {};
    Object.keys(newRow).forEach((key) => {
      if (newRow[key] !== oldRow[key] && key !== 'Id') {
        if (key === 'CloseDate' && newRow[key] instanceof Date) {
          updates[key] = newRow[key].toISOString().split('T')[0];
        } else if (key !== 'Account' && key !== 'Owner') {
          updates[key] = newRow[key];
        }
      }
    });
    if (Object.keys(updates).length === 0) return newRow;

    const loadingToast = toast.loading('Saving to Salesforce...');
    try {
      await apiService.updateOpportunity(newRow.Id, updates);
      toast.success('Saved!', { id: loadingToast, duration: 2000 });
      setTimeout(() => queryClient.invalidateQueries('opportunities'), 1000);
      return newRow;
    } catch (error: any) {
      toast.error(`Failed: ${error.response?.data?.detail || error.message}`, { id: loadingToast });
      return oldRow;
    }
  };

  const handleStageChange = (params: GridRenderCellParams, newStage: string) => {
    if (newStage === params.value) return;
    const loadingToast = toast.loading('Updating stage...');

    const closedStages = ['Withdrawn', 'Closed Lost', 'Closed / Did not Fulfill', 'Closed / Completed'];
    if (closedStages.includes(newStage)) markRecentlyChanged(params.row.Id);

    if (newStage === 'Collecting / In Effect') {
      toast.dismiss(loadingToast);
      toast('Please review and confirm payment schedule', { icon: '\uD83D\uDCB0', duration: 3000 });
      navigate(`/payment-schedule/${params.row.Id}`, {
        state: { fromStageChange: true, targetStage: newStage, opportunityId: params.row.Id },
      });
      return;
    }

    // Optimistic update
    const currentQueryKey = ['opportunities', philanthropyOnly, pbcOnly, viewMode];
    const oldData = queryClient.getQueryData(currentQueryKey);
    queryClient.setQueryData(currentQueryKey, (old: any) =>
      old?.map((opp: any) => (opp.Id === params.row.Id ? { ...opp, StageName: newStage } : opp)),
    );

    apiService.updateOpportunity(params.row.Id, { StageName: newStage })
      .then(() => {
        toast.success('Stage updated!', { id: loadingToast });
        queryClient.invalidateQueries('opportunities');
      })
      .catch((err: any) => {
        queryClient.setQueryData(currentQueryKey, oldData);
        clearRecentlyChanged(params.row.Id);
        toast.error(`Failed: ${err.response?.data?.detail || err.message}`, { id: loadingToast });
      });
  };

  // ---------------------------------------------------------------------------
  // Column callbacks & columns (memoized)
  // ---------------------------------------------------------------------------

  const columnCallbacks: ColumnCallbacks = useMemo(() => ({
    onTaskPanelOpen: (opp) => { setTaskPanelOpp(opp); setTaskPanelOpen(true); },
    onActivityPanelOpen: (opp) => { setActivityOpp(opp); setActivityPanelOpen(true); },
    onStageChange: handleStageChange,
    accountMap,
    userMap,
    activeActivityOppId: activityOpp?.Id,
    activityPanelOpen,
  }), [accountMap, userMap, activityOpp?.Id, activityPanelOpen, philanthropyOnly, pbcOnly, viewMode]);

  const pipelineColumns = useMemo(() => buildPipelineColumns(columnCallbacks), [columnCallbacks]);
  const paymentColumns = useMemo(() => buildPaymentColumns(columnCallbacks), [columnCallbacks]);

  // ---------------------------------------------------------------------------
  // Filtered / visible opportunities
  // ---------------------------------------------------------------------------

  const displayOpps = useMemo(() => {
    if (viewMode === 'open') {
      return opportunities.filter((opp) => {
        const isOpen = (OPEN_STAGES as readonly string[]).includes(opp.StageName);
        return isOpen || Boolean(recentlyChangedIds[opp.Id]) || recentlyChangedRef.current.has(opp.Id);
      });
    }
    if (viewMode === 'collecting') {
      return opportunities.filter((opp) => {
        const s = opp.StageName || '';
        return s.includes('Collecting') || s.includes('In Effect');
      });
    }
    return opportunities.filter((opp) => (CLOSED_STAGES as readonly string[]).includes(opp.StageName));
  }, [opportunities, viewMode, recentlyChangedIds]);

  // Apply pipeline filter bar filters
  let visibleOpps = useMemo(() => {
    let filtered = displayOpps;
    const f = pipelineFilters;

    // AIJI toggle
    if (f.aijiOnly) {
      filtered = filtered.filter((opp) => (opp.Name || '').toUpperCase().includes('AIJI'));
    }

    // Owner filter
    if (f.owners.length > 0) {
      filtered = filtered.filter((opp) => f.owners.includes(opp.OwnerId));
    }

    // Stage filter
    if (f.stages.length > 0) {
      filtered = filtered.filter((opp) => f.stages.includes(opp.StageName));
    }

    // Revenue stream (RecordType)
    if (f.revenueStreams.length > 0) {
      filtered = filtered.filter((opp) => opp.RecordType?.Name && f.revenueStreams.includes(opp.RecordType.Name));
    }

    // Amount range
    if (f.amountRange[0] > 0 || f.amountRange[1] < 50000000) {
      filtered = filtered.filter((opp) => {
        const amt = opp.Amount || 0;
        return amt >= f.amountRange[0] && amt <= f.amountRange[1];
      });
    }

    // Close date range
    if (f.closeDateStart) {
      filtered = filtered.filter((opp) => opp.CloseDate && opp.CloseDate >= f.closeDateStart);
    }
    if (f.closeDateEnd) {
      filtered = filtered.filter((opp) => opp.CloseDate && opp.CloseDate <= f.closeDateEnd);
    }

    // Stale toggle (30+ days since last activity)
    if (f.staleOnly) {
      const now = new Date();
      filtered = filtered.filter((opp) => {
        const lastMod = opp.LastModifiedDate ? parseISO(opp.LastModifiedDate) : parseISO(opp.CreatedDate);
        return differenceInDays(now, lastMod) > 30;
      });
    }

    return filtered;
  }, [displayOpps, pipelineFilters]);

  // Apply legacy initial filter from Dashboard navigation
  if (initialFilter === 'atRisk') {
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    visibleOpps = visibleOpps.filter((opp) => {
      if (!opp.CloseDate) return false;
      const cd = parseISO(opp.CloseDate);
      const inQ = cd >= qStart && cd <= qEnd;
      const atRisk = (opp.Probability || 0) < 50 || ['Lead Gen', 'New Lead', 'Qualifying'].includes(opp.StageName || '');
      return inQ && atRisk;
    });
  } else if (initialFilter === 'stale') {
    const now = new Date();
    visibleOpps = visibleOpps.filter((opp) => {
      if (!opp.CloseDate) return false;
      const isPastDue = parseISO(opp.CloseDate) < now;
      const lastMod = opp.LastModifiedDate ? parseISO(opp.LastModifiedDate) : parseISO(opp.CreatedDate);
      return isPastDue || differenceInDays(now, lastMod) > 30;
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Header: view mode tabs + bulk actions + new/refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant={viewMode === 'open' ? 'contained' : 'outlined'} onClick={() => setViewMode('open')} sx={{ minWidth: 150 }}>
            Open Pipeline <Chip label={openOnlyOpps.length} size="small" sx={{ ml: 1, bgcolor: viewMode === 'open' ? 'rgba(255,255,255,0.3)' : 'default' }} />
          </Button>
          <Button variant={viewMode === 'collecting' ? 'contained' : 'outlined'} onClick={() => setViewMode('collecting')}
            color={viewMode === 'collecting' ? 'success' : 'inherit'} sx={{ minWidth: 180 }}>
            Collecting / In Effect <Chip label={paymentOpps.length} size="small" sx={{ ml: 1, bgcolor: viewMode === 'collecting' ? 'rgba(255,255,255,0.3)' : 'default' }} />
          </Button>
          <Button variant={viewMode === 'closed' ? 'contained' : 'outlined'} onClick={() => setViewMode('closed')}
            color={viewMode === 'closed' ? 'error' : 'inherit'} sx={{ minWidth: 150 }}>
            Closed
            <Chip label={opportunities.filter((opp) => (CLOSED_STAGES as readonly string[]).includes(opp.StageName)).length} size="small"
              sx={{ ml: 1, bgcolor: viewMode === 'closed' ? 'rgba(255,255,255,0.3)' : 'default' }} />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedRowIds.length > 0 && (
            <>
              <Chip label={`${selectedRowIds.length} selected`} color="primary" onDelete={() => setSelectedRowIds([])} />
              <Button onClick={() => handleBulkAction('withdraw')} variant="outlined" color="error" size="small">Withdraw Selected</Button>
              <Button onClick={() => handleBulkAction('stage')} variant="outlined" color="primary" size="small">Change Stage</Button>
            </>
          )}
          <Button startIcon={<AddIcon />} onClick={() => navigate('/opportunities/new')} variant="contained" color="primary">New Opportunity</Button>
          <Button startIcon={<RefreshIcon />} onClick={() => queryClient.invalidateQueries('opportunities')} variant="outlined">Refresh</Button>
        </Box>
      </Box>

      {/* Pipeline Filter Bar */}
      <PipelineFilterBar
        filters={pipelineFilters}
        onChange={(f) => {
          setPipelineFilters(f);
          // Sync legacy flags for data hook
          setAijiOnly(f.aijiOnly);
        }}
        ownerOptions={users.map((u: any) => ({ id: u.Id, name: u.Name }))}
        revenueStreamOptions={(() => {
          const streams = new Set<string>();
          opportunities.forEach((o) => { if (o.RecordType?.Name) streams.add(o.RecordType.Name); });
          return Array.from(streams).sort();
        })()}
      />

      {/* Filter alerts */}
      {initialFilter && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setInitialFilter(null)}>
          {initialFilter === 'atRisk' && <><strong>Showing At-Risk Deals Only:</strong> Current quarter opportunities with low probability (&lt;50%) or early stage.</>}
          {initialFilter === 'stale' && <><strong>Showing Stale Opportunities Only:</strong> Opportunities that are past due or haven't been updated in 30+ days.</>}
        </Alert>
      )}

      {/* View mode hints */}
      {viewMode === 'open' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Open Pipeline:</strong> Track and manage open opportunities. Edit fields inline to update Salesforce instantly.
        </Alert>
      )}
      {viewMode === 'collecting' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Collecting / In Effect:</strong> Monitor won grants with payment tracking.
        </Alert>
      )}
      {viewMode === 'closed' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Closed Opportunities:</strong> View completed, lost, withdrawn, or unfulfilled opportunities.
        </Alert>
      )}

      {/* Summary cards */}
      <SummaryCards viewMode={viewMode} opps={visibleOpps} />

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>Failed to load opportunities. Please check your connection.</Alert>}

      {/* Data grid */}
      <Card>
        <CardContent>
          {visibleOpps.length > 0 && viewMode !== 'closed' && (
            <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1, display: 'flex', gap: 3, flexWrap: 'wrap', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Showing: {visibleOpps.length} opportunities</Typography>
              {viewMode === 'open' && (
                <>
                  <Typography variant="body2">Total Value: {formatDollarMillions(visibleOpps.reduce((s, o) => s + (o.Amount || 0), 0))}</Typography>
                  <Typography variant="body2">Weighted Value: {formatDollarMillions(visibleOpps.reduce((s, o) => s + ((o.Amount || 0) * (o.Probability || 0)) / 100, 0))}</Typography>
                  <Typography variant="body2">Avg Probability: {visibleOpps.length > 0 ? Math.round(visibleOpps.reduce((s, o) => s + (o.Probability || 0), 0) / visibleOpps.length) : 0}%</Typography>
                </>
              )}
              {viewMode === 'collecting' && (
                <>
                  <Typography variant="body2">Total Amount: {formatDollarMillions(visibleOpps.reduce((s, o) => s + (o.Amount || 0), 0))}</Typography>
                  <Typography variant="body2">Received: {formatDollarMillions(visibleOpps.reduce((s, o) => s + (o.npe01__Payments_Made__c || 0), 0))}</Typography>
                  <Typography variant="body2">Outstanding: {formatDollarMillions(visibleOpps.reduce((s, o) => s + ((o.Amount || 0) - (o.npe01__Payments_Made__c || 0)), 0))}</Typography>
                </>
              )}
            </Box>
          )}

          <Box sx={{ height: 'calc(100vh - 500px)', minHeight: 600, width: '100%' }}>
            <DataGrid
              rows={visibleOpps}
              columns={viewMode === 'collecting' ? paymentColumns : pipelineColumns}
              loading={isLoading}
              getRowId={(row) => row.Id}
              pagination
              pageSizeOptions={[25, 50, 100, 250, 500]}
              editMode="cell"
              processRowUpdate={viewMode === 'open' ? handleCellEdit : undefined}
              onProcessRowUpdateError={console.error}
              checkboxSelection
              rowSelectionModel={selectedRowIds}
              onRowSelectionModelChange={(sel) => setSelectedRowIds(sel as string[])}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 }, printOptions: { disableToolbarButton: true }, csvOptions: { disableToolbarButton: true } },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 100, page: 0 } },
                sorting: {
                  sortModel: viewMode === 'collecting'
                    ? [{ field: 'Most_Recent_Payment_Date__c', sort: 'desc' }]
                    : [{ field: 'CloseDate', sort: 'asc' }],
                },
                filter: searchFromUrl
                  ? { filterModel: { items: [], quickFilterValues: [searchFromUrl] } }
                  : undefined,
              }}
              filterMode="client"
              sortingMode="client"
              paginationMode="client"
              disableRowSelectionOnClick={false}
              disableColumnFilter={false}
              disableColumnMenu={false}
              isCellEditable={(params) => {
                if (viewMode !== 'open') return false;
                return ['Name', 'AccountId', 'OwnerId', 'Amount', 'Probability', 'CloseDate', 'PaymentDate__c'].includes(params.field);
              }}
              sx={{
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                '& .MuiDataGrid-cell--editable': {
                  cursor: 'pointer', bgcolor: 'background.paper',
                  '&:hover': { backgroundColor: 'action.hover', boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.5)' },
                },
                '& .MuiDataGrid-cell--editing': { backgroundColor: 'primary.light', boxShadow: 'inset 0 0 0 2px #1976d2' },
                '& .MuiDataGrid-row:hover .MuiDataGrid-cell--editable': { backgroundColor: 'action.hover' },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Activity Intelligence Panel */}
      <ActivityIntelligencePanel
        open={activityPanelOpen}
        onClose={() => { setActivityPanelOpen(false); setActivityOpp(null); }}
        opportunity={activityOpp}
        accountName={(activityOpp && (accountMap.get(activityOpp.AccountId)?.Name || activityOpp.Account?.Name || activityOpp.Name)) || ''}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Opportunity
          {selectedOpp && <Typography variant="body2" color="textSecondary">{selectedOpp.Name}</Typography>}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Opportunity Name" fullWidth value={editForm.Name || ''} onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })} />
            <TextField label="Stage" fullWidth select value={editForm.StageName || ''} onChange={(e) => setEditForm({ ...editForm, StageName: e.target.value })}>
              {OPPORTUNITY_STAGES.map((stage) => <MenuItem key={stage} value={stage}>{stage}</MenuItem>)}
            </TextField>
            <TextField label="Amount" fullWidth type="number" value={editForm.Amount || ''} onChange={(e) => setEditForm({ ...editForm, Amount: e.target.value })} InputProps={{ startAdornment: '$' }} />
            <TextField label="Probability (%)" fullWidth type="number" value={editForm.Probability || ''} onChange={(e) => setEditForm({ ...editForm, Probability: e.target.value })} inputProps={{ min: 0, max: 100 }} />
            <TextField label="Close Date" fullWidth type="date" value={editForm.CloseDate || ''} onChange={(e) => setEditForm({ ...editForm, CloseDate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Schedule Modal */}
      {paymentScheduleOpp && (
        <PaymentScheduleModal
          open={paymentScheduleOpen}
          onClose={() => setPaymentScheduleOpen(false)}
          opportunityId={paymentScheduleOpp.Id}
          opportunityAmount={paymentScheduleOpp.Amount}
          opportunityName={paymentScheduleOpp.Name}
          onScheduleCreated={() => { setPaymentScheduleOpen(false); queryClient.invalidateQueries('opportunities'); toast.success('Payment schedule created!'); }}
        />
      )}

      {/* Task Panel */}
      <TaskPanel open={taskPanelOpen} onClose={() => { setTaskPanelOpen(false); setTaskPanelOpp(null); }} opportunity={taskPanelOpp} users={users} />

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onClose={() => setBulkActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{bulkAction === 'withdraw' ? 'Withdraw Opportunities' : 'Change Stage'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {bulkAction === 'withdraw' ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to withdraw {selectedRowIds.length} selected opportunities? This will change their stage to "Withdrawn".
              </Alert>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>Change the stage for {selectedRowIds.length} selected opportunities.</Alert>
                <TextField fullWidth select label="New Stage" value={bulkTargetStage} onChange={(e) => setBulkTargetStage(e.target.value)} sx={{ mt: 2 }}>
                  {OPPORTUNITY_STAGES.map((stage) => <MenuItem key={stage} value={stage}>{stage}</MenuItem>)}
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkActionConfirm}
            disabled={bulkUpdateMutation.isLoading || (bulkAction === 'stage' && !bulkTargetStage)}
            color={bulkAction === 'withdraw' ? 'error' : 'primary'}>
            {bulkUpdateMutation.isLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Opportunities;
