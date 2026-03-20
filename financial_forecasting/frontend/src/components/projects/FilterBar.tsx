import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import type { Workstream, FilterState, ViewType } from './types';
import { getUniqueOwners } from './helpers';

interface FilterBarProps {
  workstreams: Workstream[];
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  viewType: ViewType;
}

const FilterBar: React.FC<FilterBarProps> = ({ workstreams, filters, onFiltersChange, viewType }) => {
  if (viewType === 'executive') return null;

  const owners = getUniqueOwners(workstreams);

  const handleWorkstreamChange = (e: SelectChangeEvent<string[]>) => {
    const val = e.target.value;
    onFiltersChange({ ...filters, workstreams: typeof val === 'string' ? val.split(',') : val });
  };

  const handleOwnerChange = (e: SelectChangeEvent<string[]>) => {
    const val = e.target.value;
    onFiltersChange({ ...filters, owners: typeof val === 'string' ? val.split(',') : val });
  };

  const setQuickFilter = (wsNames: string[]) => {
    const ids = workstreams.filter(ws => wsNames.includes(ws.name)).map(ws => ws.id);
    onFiltersChange({ ...filters, workstreams: ids });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel sx={{ fontSize: '0.8rem' }}>Workstreams</InputLabel>
        <Select
          multiple
          value={filters.workstreams}
          onChange={handleWorkstreamChange}
          input={<OutlinedInput label="Workstreams" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
              {selected.map(id => {
                const ws = workstreams.find(w => w.id === id);
                return <Chip key={id} label={ws?.name || id} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />;
              })}
            </Box>
          )}
          sx={{ '& .MuiSelect-select': { py: 0.75 } }}
        >
          {workstreams.map(ws => (
            <MenuItem key={ws.id} value={ws.id} sx={{ fontSize: '0.8rem' }}>{ws.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel sx={{ fontSize: '0.8rem' }}>Owners</InputLabel>
        <Select
          multiple
          value={filters.owners}
          onChange={handleOwnerChange}
          input={<OutlinedInput label="Owners" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
              {selected.map(o => <Chip key={o} label={o} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />)}
            </Box>
          )}
          sx={{ '& .MuiSelect-select': { py: 0.75 } }}
        >
          {owners.map(o => (
            <MenuItem key={o} value={o} sx={{ fontSize: '0.8rem' }}>{o}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Chip
        label="AIJI Construction"
        size="small"
        variant={filters.workstreams.length === 1 && workstreams.find(w => w.id === filters.workstreams[0])?.name === 'Launch and Activation' ? 'filled' : 'outlined'}
        onClick={() => setQuickFilter(['Launch and Activation'])}
        sx={{ fontSize: '0.7rem' }}
      />
      <Chip
        label="AIJI Campaign"
        size="small"
        variant={filters.workstreams.length === 2 ? 'filled' : 'outlined'}
        onClick={() => setQuickFilter(['Partnerships and Development', 'Communications and Narrative'])}
        sx={{ fontSize: '0.7rem' }}
      />
      {(filters.workstreams.length > 0 || filters.owners.length > 0) && (
        <Chip
          label="Clear"
          size="small"
          onDelete={() => onFiltersChange({ workstreams: [], owners: [] })}
          sx={{ fontSize: '0.7rem' }}
        />
      )}
    </Box>
  );
};

export default FilterBar;
