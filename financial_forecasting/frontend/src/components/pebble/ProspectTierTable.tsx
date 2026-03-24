import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';

export interface TierProspect {
  id: string;
  name: string;
  organization: string;
  crm_status: 'in_crm' | 'not_in_crm' | 'ambiguous' | 'not_found';
  identity_confidence: 'high' | 'medium' | 'low' | 'none';
  current_tier: 'pending' | 'T1' | 'T2' | 'T3';
  claims_count?: number;
  cost_usd?: number;
}

interface ProspectTierTableProps {
  prospects: TierProspect[];
  onAdvanceSelected: (selectedIds: string[], targetTier: number) => void;
  onViewProfile?: (prospectId: string) => void;
  loading?: boolean;
}

type SortField = 'name' | 'organization' | 'crm_status' | 'identity_confidence' | 'current_tier';

const CRM_CHIP: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  in_crm: { label: 'Found', color: 'success' },
  not_in_crm: { label: 'New', color: 'default' },
  ambiguous: { label: 'Ambiguous', color: 'warning' },
  not_found: { label: 'Not Found', color: 'error' },
};

const CONFIDENCE_CHIP: Record<string, { color: 'success' | 'warning' | 'error' | 'default' }> = {
  high: { color: 'success' },
  medium: { color: 'warning' },
  low: { color: 'error' },
  none: { color: 'default' },
};

const ProspectTierTable: React.FC<ProspectTierTableProps> = ({
  prospects,
  onAdvanceSelected,
  onViewProfile,
  loading = false,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    const aVal = (a[sortField] ?? '').toString().toLowerCase();
    const bVal = (b[sortField] ?? '').toString().toLowerCase();
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === prospects.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(prospects.map((p) => p.id)));
    }
  };

  const selectedArray = Array.from(selected);
  const canAdvanceT2 = selectedArray.length > 0 && selectedArray.every(
    (id) => prospects.find((p) => p.id === id)?.current_tier === 'T1'
  );
  const canAdvanceT3 = selectedArray.length > 0 && selectedArray.every(
    (id) => prospects.find((p) => p.id === id)?.current_tier === 'T2'
  );

  return (
    <Box>
      {/* Action bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {selected.size} of {prospects.length} selected
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          size="small"
          disabled={!canAdvanceT2 || loading}
          onClick={() => onAdvanceSelected(selectedArray, 20)}
        >
          Advance Selected to T2
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={!canAdvanceT3 || loading}
          onClick={() => onAdvanceSelected(selectedArray, 30)}
        >
          Advance Selected to T3
        </Button>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.size > 0 && selected.size < prospects.length}
                  checked={selected.size === prospects.length && prospects.length > 0}
                  onChange={toggleAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDir : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'organization'}
                  direction={sortField === 'organization' ? sortDir : 'asc'}
                  onClick={() => handleSort('organization')}
                >
                  Organization
                </TableSortLabel>
              </TableCell>
              <TableCell>CRM Status</TableCell>
              <TableCell>ID Confidence</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProspects.map((p) => {
              const crmChip = CRM_CHIP[p.crm_status] || CRM_CHIP.not_found;
              const confChip = CONFIDENCE_CHIP[p.identity_confidence] || CONFIDENCE_CHIP.none;
              return (
                <TableRow key={p.id} hover selected={selected.has(p.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.organization || '\u2014'}</TableCell>
                  <TableCell>
                    <Chip label={crmChip.label} color={crmChip.color} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.identity_confidence.toUpperCase()}
                      color={confChip.color}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.current_tier === 'pending' ? 'Pending' : p.current_tier}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {p.current_tier === 'T3' && onViewProfile && (
                      <Button size="small" onClick={() => onViewProfile(p.id)} sx={{ textTransform: 'none' }}>
                        View Profile
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProspectTierTable;
