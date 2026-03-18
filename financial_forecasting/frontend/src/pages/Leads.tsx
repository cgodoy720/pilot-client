import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridToolbar,
  useGridApiContext,
} from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

import { apiService } from '../services/api';
import { useLeads } from '../contexts/LeadsContext';
import { parseCSV } from '../utils/csvParser';
import type { Lead, LeadStatus, LeadPriority, WealthTier } from '../types/weeklyPriorities';

// Status chip colors
const STATUS_COLORS: Record<LeadStatus, 'default' | 'info' | 'success' | 'warning' | 'secondary'> = {
  new: 'default',
  contacted: 'info',
  qualified: 'success',
  unqualified: 'warning',
  converted: 'secondary',
};

// Priority chip colors
const PRIORITY_COLORS: Record<LeadPriority, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
const PRIORITY_OPTIONS: LeadPriority[] = ['high', 'medium', 'low'];

const WEALTH_TIER_OPTIONS: WealthTier[] = ['tier-1', 'tier-2', 'tier-3', 'tier-4', 'unknown'];
const WEALTH_TIER_COLORS: Record<WealthTier, 'success' | 'info' | 'warning' | 'default' | 'secondary'> = {
  'tier-1': 'success',
  'tier-2': 'info',
  'tier-3': 'warning',
  'tier-4': 'default',
  'unknown': 'secondary',
};

// Custom edit cell for grant_id — dropdown of opportunities
function GrantEditCell(props: GridRenderEditCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();
  const { data: oppsData } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  const opportunities = Array.isArray(oppsData)
    ? oppsData
    : (oppsData?.opportunities || oppsData?.data || []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value as string });
  };

  return (
    <TextField
      select
      value={value || ''}
      onChange={handleChange as any}
      fullWidth
      variant="standard"
      SelectProps={{ native: false }}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {opportunities.map((opp: any) => (
        <MenuItem key={opp.Id} value={opp.Id}>
          {opp.Name} {opp.CloseDate ? `(${opp.CloseDate})` : ''}
        </MenuItem>
      ))}
    </TextField>
  );
}

// Custom edit cell for status — disables "converted" if no capacity score
function StatusEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, row } = props;
  const apiRef = useGridApiContext();
  const hasCapacityScore = row.capacity_score != null;

  return (
    <TextField
      select
      value={value || 'new'}
      onChange={(e) => apiRef.current.setEditCellValue({ id, field, value: e.target.value })}
      fullWidth
      variant="standard"
    >
      {STATUS_OPTIONS.map((s) => (
        <MenuItem key={s} value={s} disabled={s === 'converted' && !hasCapacityScore}>
          {s}{s === 'converted' && !hasCapacityScore ? ' (score first)' : ''}
        </MenuItem>
      ))}
    </TextField>
  );
}

// Custom edit cell for wealth tier
function WealthTierEditCell(props: GridRenderEditCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  return (
    <TextField
      select
      value={value || 'unknown'}
      onChange={(e) => apiRef.current.setEditCellValue({ id, field, value: e.target.value })}
      fullWidth
      variant="standard"
    >
      {WEALTH_TIER_OPTIONS.map((t) => (
        <MenuItem key={t} value={t}>{t}</MenuItem>
      ))}
    </TextField>
  );
}

// Custom edit cell for priority
function PriorityEditCell(props: GridRenderEditCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  return (
    <TextField
      select
      value={value || 'medium'}
      onChange={(e) => apiRef.current.setEditCellValue({ id, field, value: e.target.value })}
      fullWidth
      variant="standard"
    >
      {PRIORITY_OPTIONS.map((p) => (
        <MenuItem key={p} value={p}>{p}</MenuItem>
      ))}
    </TextField>
  );
}

const Leads: React.FC = () => {
  const { leads, importLeads, updateLead, deleteLeads } = useLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [grantLinkFilter, setGrantLinkFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Fetch opportunities for grant name display
  const { data: oppsData } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  const opportunities = useMemo(() => {
    const raw = Array.isArray(oppsData)
      ? oppsData
      : (oppsData?.opportunities || oppsData?.data || []);
    return raw as any[];
  }, [oppsData]);

  const oppMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const opp of opportunities) {
      m.set(opp.Id, opp);
    }
    return m;
  }, [opportunities]);

  // Unique sources for filter
  const sources = useMemo(() => {
    const s = new Set(leads.map((l) => l.source));
    return Array.from(s).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
      if (grantLinkFilter === 'linked' && !lead.grant_id) return false;
      if (grantLinkFilter === 'unlinked' && lead.grant_id) return false;
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
      return true;
    });
  }, [leads, statusFilter, priorityFilter, grantLinkFilter, sourceFilter]);

  // CSV import
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await parseCSV(file);
    if (result.errors.length > 0 && result.leads.length === 0) {
      toast.error(result.errors[0].message);
      return;
    }

    const { added, duplicates } = importLeads(result.leads);
    let msg = `Imported ${added} lead${added !== 1 ? 's' : ''}`;
    if (duplicates > 0) msg += ` (${duplicates} duplicate${duplicates !== 1 ? 's' : ''} skipped)`;
    if (result.skipped > 0) msg += ` (${result.skipped} row${result.skipped !== 1 ? 's' : ''} invalid)`;
    toast.success(msg);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // CSV export
  const handleExportCSV = () => {
    const exportData = filteredLeads.map((lead) => ({
      first_name: lead.first_name,
      last_name: lead.last_name,
      organization: lead.organization || '',
      title: lead.title || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      priority: lead.priority,
      grant: lead.grant_id ? (oppMap.get(lead.grant_id)?.Name || lead.grant_id) : '',
      notes: lead.notes || '',
      source: lead.source,
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    deleteLeads(selectedRowIds);
    toast.success(`Deleted ${selectedRowIds.length} lead${selectedRowIds.length !== 1 ? 's' : ''}`);
    setSelectedRowIds([]);
  };

  // Inline edit
  const processRowUpdate = useCallback(
    (newRow: Lead, oldRow: Lead) => {
      const updates: Partial<Lead> = {};
      const keys = Object.keys(newRow) as (keyof Lead)[];
      for (const key of keys) {
        if (newRow[key] !== oldRow[key] && key !== 'id') {
          (updates as any)[key] = newRow[key];
        }
      }
      if (Object.keys(updates).length > 0) {
        try {
          updateLead(newRow.id, updates);
          toast.success('Lead updated');
        } catch (error) {
          if (error instanceof Error && error.message.startsWith('CAPACITY_GATE')) {
            toast.error('Score this prospect\'s giving capacity before converting. Go to Capacity page.');
            return oldRow; // Revert the change
          }
          throw error;
        }
      }
      return newRow;
    },
    [updateLead]
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'first_name', headerName: 'First Name', flex: 1, minWidth: 120, editable: true },
      { field: 'last_name', headerName: 'Last Name', flex: 1, minWidth: 120, editable: true },
      { field: 'organization', headerName: 'Organization', flex: 1, minWidth: 140, editable: true },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 120, editable: true },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 160, editable: true },
      { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120, editable: true },
      {
        field: 'grant_id',
        headerName: 'Linked Grant',
        flex: 1.3,
        minWidth: 180,
        editable: true,
        renderEditCell: (params) => <GrantEditCell {...params} />,
        renderCell: (params: GridRenderCellParams) => {
          if (!params.value) return <Typography variant="body2" color="text.secondary">-</Typography>;
          const opp = oppMap.get(params.value as string);
          return (
            <Typography variant="body2" noWrap>
              {opp ? `${opp.Name} (${opp.CloseDate || ''})` : params.value}
            </Typography>
          );
        },
      },
      {
        field: 'estimated_capacity',
        headerName: 'Capacity',
        width: 120,
        type: 'number',
        editable: true,
        renderCell: (params: GridRenderCellParams) =>
          params.value != null
            ? <Typography variant="body2">${Number(params.value).toLocaleString()}</Typography>
            : <Typography variant="body2" color="text.secondary">-</Typography>,
      },
      {
        field: 'avg_comparable_grant',
        headerName: 'Avg Grant',
        width: 120,
        type: 'number',
        editable: true,
        renderCell: (params: GridRenderCellParams) =>
          params.value != null
            ? <Typography variant="body2">${Number(params.value).toLocaleString()}</Typography>
            : <Typography variant="body2" color="text.secondary">-</Typography>,
      },
      {
        field: 'estimated_ask',
        headerName: 'Ask',
        width: 110,
        type: 'number',
        editable: true,
        renderCell: (params: GridRenderCellParams) =>
          params.value != null
            ? <Typography variant="body2">${Number(params.value).toLocaleString()}</Typography>
            : <Typography variant="body2" color="text.secondary">-</Typography>,
      },
      {
        field: 'likelihood',
        headerName: 'Likelihood',
        width: 100,
        type: 'number',
        editable: true,
        renderCell: (params: GridRenderCellParams) =>
          params.value != null
            ? <Typography variant="body2">{params.value}%</Typography>
            : <Typography variant="body2" color="text.secondary">-</Typography>,
      },
      {
        field: 'wealth_tier',
        headerName: 'Wealth Tier',
        width: 120,
        editable: true,
        renderEditCell: (params) => <WealthTierEditCell {...params} />,
        renderCell: (params: GridRenderCellParams) =>
          params.value
            ? <Chip label={params.value} size="small" color={WEALTH_TIER_COLORS[(params.value as WealthTier) || 'unknown']} />
            : <Typography variant="body2" color="text.secondary">-</Typography>,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        editable: true,
        renderEditCell: (params) => <StatusEditCell {...params} />,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value || 'new'}
            size="small"
            color={STATUS_COLORS[(params.value as LeadStatus) || 'new']}
          />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        editable: true,
        renderEditCell: (params) => <PriorityEditCell {...params} />,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value || 'medium'}
            size="small"
            color={PRIORITY_COLORS[(params.value as LeadPriority) || 'medium']}
          />
        ),
      },
      { field: 'notes', headerName: 'Notes', flex: 1.5, minWidth: 180, editable: true },
      { field: 'source', headerName: 'Source', width: 140, editable: false },
    ],
    [oppMap]
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">Leads</Typography>
          <Chip label={`${leads.length} total`} size="small" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleImportCSV}
          />
          <Button
            startIcon={<UploadIcon />}
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
          >
            Export CSV
          </Button>
          {selectedRowIds.length > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
            >
              Delete ({selectedRowIds.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {PRIORITY_OPTIONS.map((p) => (
              <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={grantLinkFilter}
          onChange={(_, v) => v && setGrantLinkFilter(v)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="linked">Linked</ToggleButton>
          <ToggleButton value="unlinked">Unlinked</ToggleButton>
        </ToggleButtonGroup>

        {sources.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={sourceFilter}
              label="Source"
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <MenuItem value="all">All sources</MenuItem>
              {sources.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(statusFilter !== 'all' || priorityFilter !== 'all' || grantLinkFilter !== 'all' || sourceFilter !== 'all') && (
          <Button
            size="small"
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setGrantLinkFilter('all');
              setSourceFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      {/* DataGrid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 'calc(100vh - 360px)', minHeight: 500, width: '100%' }}>
            <DataGrid
              rows={filteredLeads}
              columns={columns}
              getRowId={(row) => row.id}
              pagination
              pageSizeOptions={[25, 50, 100, 250, 500]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 },
                },
                sorting: {
                  sortModel: [{ field: 'created_at', sort: 'desc' }],
                },
              }}
              editMode="cell"
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(error) => {
                console.error('Error updating lead:', error);
                toast.error('Failed to update lead');
              }}
              checkboxSelection
              rowSelectionModel={selectedRowIds}
              onRowSelectionModelChange={(ids) => setSelectedRowIds(ids as string[])}
              filterMode="client"
              sortingMode="client"
              paginationMode="client"
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 200 },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Leads;
