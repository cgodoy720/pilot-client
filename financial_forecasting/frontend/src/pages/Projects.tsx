import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import type { ViewType, FilterState } from '../components/projects/types';
import { useProjectData } from '../components/projects/useProjectData';
import { applyFilters } from '../components/projects/helpers';
import ViewSwitcher from '../components/projects/ViewSwitcher';
import FilterBar from '../components/projects/FilterBar';
import ListView from '../components/projects/ListView';
import ExecutiveSnapshot from '../components/projects/ExecutiveSnapshot';
import KanbanBoard from '../components/projects/KanbanBoard';
import GanttChart from '../components/projects/GanttChart';

const Projects: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>(() =>
    (localStorage.getItem('pursuit-projects-view') as ViewType) || 'list'
  );
  const [filters, setFilters] = useState<FilterState>({ workstreams: [], owners: [] });
  const { workstreams, isLoading, error, mutations } = useProjectData();

  const filtered = useMemo(
    () => applyFilters(workstreams, filters),
    [workstreams, filters]
  );

  useEffect(() => {
    localStorage.setItem('pursuit-projects-view', viewType);
  }, [viewType]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load project data. Make sure PostgreSQL is running.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Projects</Typography>
          <Typography variant="body2" color="text.secondary">
            Deep project planning with milestones, tasks, and sub-task dependencies
          </Typography>
        </Box>
        <ViewSwitcher value={viewType} onChange={setViewType} />
      </Box>

      {viewType !== 'executive' && (
        <FilterBar
          workstreams={workstreams}
          filters={filters}
          onFiltersChange={setFilters}
          viewType={viewType}
        />
      )}

      {viewType === 'list' && filtered.map(ws => (
        <ListView key={ws.id} workstream={ws} mutations={mutations} />
      ))}

      {viewType === 'board' && (
        <KanbanBoard workstreams={filtered} mutations={mutations} />
      )}

      {viewType === 'timeline' && (
        <GanttChart workstreams={filtered} mutations={mutations} />
      )}

      {viewType === 'executive' && (
        <ExecutiveSnapshot workstreams={workstreams} />
      )}

      {viewType === 'list' && filtered.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No workstreams match the current filters.
        </Typography>
      )}
    </Box>
  );
};

export default Projects;
