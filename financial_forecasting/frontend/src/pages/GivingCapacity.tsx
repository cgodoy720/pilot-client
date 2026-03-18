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
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Calculate as CalculateIcon,
  Science as EnrichIcon,
  Visibility as ViewIcon,
  SwapVert as ConvertIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

import { useLeads } from '../contexts/LeadsContext';
import { parseCSV } from '../utils/csvParser';
import { batchScore, computeSubScores, inferProspectType, type SubScoreBreakdown } from '../utils/capacityScoring';
import { batchEnrich, countEnrichable, isEnrichable } from '../utils/nonprofitResearch';
import type { Lead, ProspectType, EnrichmentStatus } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROSPECT_TYPE_COLORS: Record<ProspectType, 'success' | 'info' | 'warning' | 'secondary' | 'primary' | 'default'> = {
  hnwi: 'success',
  elected_official: 'info',
  institutional_grantmaker: 'primary',
  board_member: 'warning',
  connector: 'secondary',
  unknown: 'default',
};

const PROSPECT_TYPE_LABELS: Record<ProspectType, string> = {
  hnwi: 'HNWI',
  elected_official: 'Elected Official',
  institutional_grantmaker: 'Institutional',
  board_member: 'Board Member',
  connector: 'Connector',
  unknown: 'Unknown',
};

const ENRICHMENT_COLORS: Record<EnrichmentStatus, 'success' | 'info' | 'warning' | 'default'> = {
  enriched: 'success',
  partial: 'warning',
  pending: 'info',
  not_found: 'default',
};

const SCORE_COLOR = (score: number): string => {
  if (score >= 75) return '#2e7d32';
  if (score >= 50) return '#ed6c02';
  if (score >= 25) return '#d32f2f';
  return '#9e9e9e';
};

const CONVERSION_THRESHOLD = 30;

// ---------------------------------------------------------------------------
// Score Breakdown Dialog
// ---------------------------------------------------------------------------

interface BreakdownDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const ScoreBar: React.FC<{ label: string; score: number; weight: number }> = ({ label, score, weight }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" color="text.secondary">
        {score}/100 (weight: {Math.round(weight * 100)}%)
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={score}
      sx={{
        height: 8,
        borderRadius: 4,
        '& .MuiLinearProgress-bar': { backgroundColor: SCORE_COLOR(score) },
      }}
    />
  </Box>
);

const BreakdownDialog: React.FC<BreakdownDialogProps> = ({ open, onClose, lead }) => {
  if (!lead) return null;
  const breakdown = computeSubScores(lead);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Capacity Score Breakdown — {lead.first_name} {lead.last_name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: SCORE_COLOR(breakdown.composite), fontWeight: 700 }}>
            {breakdown.composite}
          </Typography>
          <Typography variant="body2" color="text.secondary">Composite Score</Typography>
          <Chip
            label={PROSPECT_TYPE_LABELS[lead.prospect_type || 'unknown']}
            color={PROSPECT_TYPE_COLORS[lead.prospect_type || 'unknown']}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <ScoreBar label="Direct Wealth" score={breakdown.directWealth} weight={breakdown.weights.directWealth} />
        <ScoreBar label="Institutional Authority" score={breakdown.institutionalAuthority} weight={breakdown.weights.institutionalAuthority} />
        <ScoreBar label="Giving History" score={breakdown.givingHistory} weight={breakdown.weights.givingHistory} />
        <ScoreBar label="Relationship / Access" score={breakdown.relationshipAccess} weight={breakdown.weights.relationshipAccess} />
        <ScoreBar label="Affinity + Timeline" score={breakdown.affinityTimeline} weight={breakdown.weights.affinityTimeline} />

        {lead.enrichment_status === 'enriched' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Enriched from 990 data ({lead.enrichment_source}) — {lead.enriched_at ? new Date(lead.enriched_at).toLocaleDateString() : ''}
          </Alert>
        )}

        {lead.total_990_assets != null && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>990 Filing Data</Typography>
            <Typography variant="body2">Total Assets: ${lead.total_990_assets.toLocaleString()}</Typography>
            {lead.total_990_grants_paid != null && (
              <Typography variant="body2">Total Grants Paid: ${lead.total_990_grants_paid.toLocaleString()}</Typography>
            )}
            {lead.comparable_grants_to_similar_orgs != null && (
              <Typography variant="body2">Comparable Grants (similar orgs): ${lead.comparable_grants_to_similar_orgs.toLocaleString()}</Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const GivingCapacity: React.FC = () => {
  const { leads, importLeads, updateLead } = useLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [breakdownLead, setBreakdownLead] = useState<Lead | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ completed: 0, total: 0 });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [hasScoredFilter, setHasScoredFilter] = useState<string>('all');

  // Derived data
  const scoredLeads = useMemo(() => leads.filter((l) => l.capacity_score != null), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (typeFilter !== 'all' && (lead.prospect_type || 'unknown') !== typeFilter) return false;
      if (hasScoredFilter === 'scored' && lead.capacity_score == null) return false;
      if (hasScoredFilter === 'unscored' && lead.capacity_score != null) return false;
      if (lead.capacity_score != null) {
        if (lead.capacity_score < scoreRange[0] || lead.capacity_score > scoreRange[1]) return false;
      }
      if (timelineFilter !== 'all' && lead.timeline_fit !== timelineFilter) return false;
      return true;
    });
  }, [leads, typeFilter, scoreRange, timelineFilter, hasScoredFilter]);

  const campaignLeads = useMemo(() => {
    return leads
      .filter((l) => l.capacity_score != null && l.timeline_fit && l.timeline_fit !== 'long_term')
      .sort((a, b) => (b.capacity_score || 0) - (a.capacity_score || 0));
  }, [leads]);

  const stats = useMemo(() => {
    const total = leads.length;
    const scored = scoredLeads.length;
    const avgScore = scored > 0 ? Math.round(scoredLeads.reduce((sum, l) => sum + (l.capacity_score || 0), 0) / scored) : 0;
    const readyToConvert = scoredLeads.filter((l) => (l.capacity_score || 0) >= CONVERSION_THRESHOLD && l.status !== 'converted').length;
    const enrichable = countEnrichable(leads);

    const byType: Record<string, number> = {};
    for (const lead of leads) {
      const type = lead.prospect_type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    }

    return { total, scored, avgScore, readyToConvert, enrichable, byType };
  }, [leads, scoredLeads]);

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
    let msg = `Imported ${added} prospect${added !== 1 ? 's' : ''}`;
    if (duplicates > 0) msg += ` (${duplicates} duplicate${duplicates !== 1 ? 's' : ''} skipped)`;
    if (result.skipped > 0) msg += ` (${result.skipped} invalid row${result.skipped !== 1 ? 's' : ''})`;
    toast.success(msg);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Score all
  const handleScoreAll = useCallback(() => {
    const scored = batchScore(leads);
    let updatedCount = 0;
    for (const lead of scored) {
      if (lead.capacity_score !== leads.find((l) => l.id === lead.id)?.capacity_score) {
        updateLead(lead.id, {
          capacity_score: lead.capacity_score,
          capacity_computed_at: lead.capacity_computed_at,
          prospect_type: lead.prospect_type,
        });
        updatedCount++;
      }
    }
    toast.success(`Scored ${updatedCount} prospect${updatedCount !== 1 ? 's' : ''}`);
  }, [leads, updateLead]);

  // Enrich from 990s
  const handleEnrich = useCallback(async () => {
    const enrichable = leads.filter(isEnrichable);
    if (enrichable.length === 0) {
      toast.error('No prospects eligible for enrichment');
      return;
    }

    setEnriching(true);
    setEnrichProgress({ completed: 0, total: enrichable.length });

    try {
      const results = await batchEnrich(enrichable, (completed, total) => {
        setEnrichProgress({ completed, total });
      });

      let enrichedCount = 0;
      for (const result of results) {
        if (result.lead.enrichment_status === 'enriched' || result.lead.enrichment_status === 'partial') {
          const updates: Partial<Lead> = {
            ein: result.lead.ein,
            total_990_assets: result.lead.total_990_assets,
            total_990_grants_paid: result.lead.total_990_grants_paid,
            institution_annual_budget: result.lead.institution_annual_budget,
            institution_name: result.lead.institution_name,
            board_memberships: result.lead.board_memberships,
            enrichment_status: result.lead.enrichment_status,
            enrichment_source: result.lead.enrichment_source,
            enriched_at: result.lead.enriched_at,
          };
          updateLead(result.lead.id, updates);
          enrichedCount++;
        }
      }

      toast.success(`Enriched ${enrichedCount} of ${enrichable.length} prospects from 990 data`);
    } catch (error) {
      toast.error('Enrichment failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setEnriching(false);
    }
  }, [leads, updateLead]);

  // CSV export
  const handleExportCSV = () => {
    const exportData = filteredLeads.map((lead) => ({
      first_name: lead.first_name,
      last_name: lead.last_name,
      organization: lead.organization || '',
      title: lead.title || '',
      prospect_type: lead.prospect_type || '',
      capacity_score: lead.capacity_score ?? '',
      wealth_tier: lead.wealth_tier || '',
      estimated_capacity: lead.estimated_capacity ?? '',
      estimated_ask: lead.estimated_ask ?? '',
      timeline_fit: lead.timeline_fit || '',
      relationship_strength: lead.relationship_strength ?? '',
      institution_name: lead.institution_name || '',
      enrichment_status: lead.enrichment_status || '',
      total_990_assets: lead.total_990_assets ?? '',
      total_990_grants_paid: lead.total_990_grants_paid ?? '',
      notes: lead.notes || '',
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giving-capacity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert to opportunity (gate check)
  const handleConvert = useCallback((lead: Lead) => {
    if (lead.capacity_score == null) {
      setSnackbar({ open: true, message: 'Score this prospect before converting. Run "Score All" first.', severity: 'error' });
      return;
    }
    if (lead.capacity_score < CONVERSION_THRESHOLD) {
      setSnackbar({ open: true, message: `Capacity score (${lead.capacity_score}) is below the conversion threshold (${CONVERSION_THRESHOLD}).`, severity: 'error' });
      return;
    }
    try {
      updateLead(lead.id, { status: 'converted' });
      toast.success(`${lead.first_name} ${lead.last_name} converted to opportunity`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Conversion failed');
    }
  }, [updateLead]);

  // Columns for main grid
  const columns: GridColDef[] = useMemo(() => [
    { field: 'first_name', headerName: 'First Name', flex: 0.8, minWidth: 100 },
    { field: 'last_name', headerName: 'Last Name', flex: 0.8, minWidth: 100 },
    { field: 'organization', headerName: 'Organization', flex: 1, minWidth: 140 },
    {
      field: 'prospect_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const type = (params.value || 'unknown') as ProspectType;
        return <Chip label={PROSPECT_TYPE_LABELS[type]} color={PROSPECT_TYPE_COLORS[type]} size="small" />;
      },
    },
    {
      field: 'capacity_score',
      headerName: 'Score',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        if (params.value == null) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const score = params.value as number;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: SCORE_COLOR(score), minWidth: 24 }}>
              {score}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={score}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                '& .MuiLinearProgress-bar': { backgroundColor: SCORE_COLOR(score) },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'wealth_tier',
      headerName: 'Wealth',
      width: 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? <Chip label={params.value} size="small" /> : <Typography variant="body2" color="text.secondary">—</Typography>,
    },
    {
      field: 'estimated_capacity',
      headerName: 'Est. Capacity',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        params.value != null ? <Typography variant="body2">${Number(params.value).toLocaleString()}</Typography>
        : <Typography variant="body2" color="text.secondary">—</Typography>,
    },
    {
      field: 'timeline_fit',
      headerName: 'Timeline',
      width: 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? <Chip label={params.value} size="small" variant="outlined" /> : <Typography variant="body2" color="text.secondary">—</Typography>,
    },
    {
      field: 'relationship_strength',
      headerName: 'Rel.',
      width: 70,
      renderCell: (params: GridRenderCellParams) =>
        params.value != null ? <Typography variant="body2">{params.value}/5</Typography>
        : <Typography variant="body2" color="text.secondary">—</Typography>,
    },
    {
      field: 'enrichment_status',
      headerName: 'Enriched',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return <Typography variant="body2" color="text.secondary">—</Typography>;
        return <Chip label={params.value} size="small" color={ENRICHMENT_COLORS[params.value as EnrichmentStatus] || 'default'} />;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value || 'new'} size="small" color={params.value === 'converted' ? 'secondary' : 'default'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const lead = params.row as Lead;
        const canConvert = lead.capacity_score != null && lead.capacity_score >= CONVERSION_THRESHOLD && lead.status !== 'converted';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View breakdown">
              <Button size="small" onClick={() => setBreakdownLead(lead)} sx={{ minWidth: 'auto', p: 0.5 }}>
                <ViewIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title={lead.capacity_score == null ? 'Score first' : lead.status === 'converted' ? 'Already converted' : canConvert ? 'Convert to opportunity' : `Score below ${CONVERSION_THRESHOLD}`}>
              <span>
                <Button
                  size="small"
                  disabled={!canConvert}
                  onClick={() => handleConvert(lead)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ConvertIcon fontSize="small" />
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleConvert]);

  // Campaign priority columns
  const campaignColumns: GridColDef[] = useMemo(() => [
    {
      field: 'rank',
      headerName: '#',
      width: 50,
      renderCell: (params: GridRenderCellParams) => {
        const idx = campaignLeads.findIndex((l) => l.id === params.row.id);
        return <Typography variant="body2" fontWeight={600}>{idx + 1}</Typography>;
      },
    },
    { field: 'first_name', headerName: 'First Name', flex: 0.8 },
    { field: 'last_name', headerName: 'Last Name', flex: 0.8 },
    { field: 'organization', headerName: 'Organization', flex: 1 },
    {
      field: 'prospect_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const type = (params.value || 'unknown') as ProspectType;
        return <Chip label={PROSPECT_TYPE_LABELS[type]} color={PROSPECT_TYPE_COLORS[type]} size="small" />;
      },
    },
    {
      field: 'capacity_score',
      headerName: 'Score',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: SCORE_COLOR(params.value as number) }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'estimated_ask',
      headerName: 'Est. Ask',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        params.value != null ? <Typography variant="body2">${Number(params.value).toLocaleString()}</Typography>
        : <Typography variant="body2" color="text.secondary">—</Typography>,
    },
    { field: 'timeline_fit', headerName: 'Timeline', width: 100 },
    {
      field: 'suggested_approach',
      headerName: 'Suggested Approach',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => {
        const lead = params.row as Lead;
        const type = lead.prospect_type || 'unknown';
        const approaches: Record<string, string> = {
          hnwi: 'Personal meeting to discuss AI Jobs Institute impact',
          elected_official: 'Policy briefing on workforce development outcomes',
          institutional_grantmaker: 'LOI or proposal aligned to program priorities',
          board_member: 'Introduction via shared board connections',
          connector: 'Ask for warm introduction to their network',
          unknown: 'Research further before outreach',
        };
        return <Typography variant="body2" noWrap>{approaches[type]}</Typography>;
      },
    },
  ], [campaignLeads]);

  const totalPipelineValue = useMemo(() => {
    return campaignLeads.reduce((sum, l) => sum + (l.estimated_ask || l.estimated_capacity || 0), 0);
  }, [campaignLeads]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">Giving Capacity Calculator</Typography>
          <Chip label={`${leads.length} prospects`} size="small" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleImportCSV} />
          <Button startIcon={<UploadIcon />} variant="contained" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </Button>
          <Button startIcon={<EnrichIcon />} variant="outlined" onClick={handleEnrich} disabled={enriching || stats.enrichable === 0}>
            {enriching ? `Enriching (${enrichProgress.completed}/${enrichProgress.total})` : `Enrich from 990s (${stats.enrichable})`}
          </Button>
          <Button startIcon={<CalculateIcon />} variant="outlined" onClick={handleScoreAll} disabled={leads.length === 0}>
            Score All
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportCSV} disabled={filteredLeads.length === 0}>
            Export
          </Button>
        </Box>
      </Box>

      {enriching && (
        <LinearProgress variant="determinate" value={(enrichProgress.completed / enrichProgress.total) * 100} sx={{ mb: 2 }} />
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
        <Card>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.secondary">Total / Scored</Typography>
            <Typography variant="h5">{stats.scored} / {stats.total}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.secondary">Avg Capacity Score</Typography>
            <Typography variant="h5" sx={{ color: SCORE_COLOR(stats.avgScore) }}>{stats.avgScore}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.secondary">By Type</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {Object.entries(stats.byType).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${PROSPECT_TYPE_LABELS[type as ProspectType] || type}: ${count}`}
                  size="small"
                  color={PROSPECT_TYPE_COLORS[type as ProspectType] || 'default'}
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.secondary">Ready to Convert</Typography>
            <Typography variant="h5">{stats.readyToConvert}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="All Prospects" />
        <Tab label={`Campaign Priority (${campaignLeads.length})`} />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Prospect Type</InputLabel>
              <Select value={typeFilter} label="Prospect Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                {Object.entries(PROSPECT_TYPE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Scored</InputLabel>
              <Select value={hasScoredFilter} label="Scored" onChange={(e) => setHasScoredFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="scored">Scored</MenuItem>
                <MenuItem value="unscored">Unscored</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeline</InputLabel>
              <Select value={timelineFilter} label="Timeline" onChange={(e) => setTimelineFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="6mo">6 months</MenuItem>
                <MenuItem value="12mo">12 months</MenuItem>
                <MenuItem value="18mo">18 months</MenuItem>
                <MenuItem value="long_term">Long term</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ width: 200, px: 1 }}>
              <Typography variant="caption" color="text.secondary">Score range</Typography>
              <Slider
                value={scoreRange}
                onChange={(_, v) => setScoreRange(v as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                size="small"
              />
            </Box>

            {(typeFilter !== 'all' || hasScoredFilter !== 'all' || timelineFilter !== 'all' || scoreRange[0] > 0 || scoreRange[1] < 100) && (
              <Button size="small" onClick={() => { setTypeFilter('all'); setHasScoredFilter('all'); setTimelineFilter('all'); setScoreRange([0, 100]); }}>
                Clear filters
              </Button>
            )}
          </Box>

          {/* DataGrid */}
          <Card>
            <CardContent>
              <Box sx={{ height: 'calc(100vh - 520px)', minHeight: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredLeads}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pagination
                  pageSizeOptions={[25, 50, 100, 250]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 100, page: 0 } },
                    sorting: { sortModel: [{ field: 'capacity_score', sort: 'desc' }] },
                  }}
                  filterMode="client"
                  sortingMode="client"
                  paginationMode="client"
                  disableRowSelectionOnClick
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 200 } },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            AI Jobs Institute Campaign — {campaignLeads.length} prospects with capacity scores and 6-18 month timeline.
            Total estimated pipeline: <strong>${totalPipelineValue.toLocaleString()}</strong>
          </Alert>
          <Card>
            <CardContent>
              <Box sx={{ height: 'calc(100vh - 440px)', minHeight: 400, width: '100%' }}>
                <DataGrid
                  rows={campaignLeads}
                  columns={campaignColumns}
                  getRowId={(row) => row.id}
                  pagination
                  pageSizeOptions={[25, 50, 100]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 50, page: 0 } },
                  }}
                  filterMode="client"
                  sortingMode="client"
                  paginationMode="client"
                  disableRowSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Breakdown Dialog */}
      <BreakdownDialog open={breakdownLead !== null} onClose={() => setBreakdownLead(null)} lead={breakdownLead} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default GivingCapacity;
