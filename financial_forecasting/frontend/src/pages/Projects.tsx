import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ChevronRight as ExpandIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import type { ViewType, FilterState } from '../components/projects/types';
import { useProjectData } from '../components/projects/useProjectData';
import { useProjects } from '../components/projects/useProjects';
import { applyFilters } from '../components/projects/helpers';
import { AIJI_PROJECT_ID } from '../components/projects/constants';
import ViewSwitcher from '../components/projects/ViewSwitcher';
import FilterBar from '../components/projects/FilterBar';
import ListView from '../components/projects/ListView';
import ExecutiveSnapshot from '../components/projects/ExecutiveSnapshot';
import KanbanBoard from '../components/projects/KanbanBoard';
import GanttChart from '../components/projects/GanttChart';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import ImportCsvDialog from '../components/projects/ImportCsvDialog';
import LinkedOpportunities from '../components/projects/LinkedOpportunities';

const PREFS_KEY = 'pursuit-projects-prefs';

interface ProjectPrefs {
  viewType: ViewType;
  selectedProjectId: string | null;
  sidebarCollapsed: boolean;
}

function loadPrefs(): ProjectPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...{ viewType: 'list', selectedProjectId: null, sidebarCollapsed: true }, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { viewType: 'list', selectedProjectId: null, sidebarCollapsed: true };
}

const Projects: React.FC = () => {
  const [prefs, setPrefs] = useState<ProjectPrefs>(loadPrefs);
  const [filters, setFilters] = useState<FilterState>({ workstreams: [], owners: [] });
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const legacyView = localStorage.getItem('pursuit-projects-view') as ViewType;
    if (legacyView && !localStorage.getItem(PREFS_KEY)) {
      setPrefs((p) => ({ ...p, viewType: legacyView }));
      localStorage.removeItem('pursuit-projects-view');
    }
  }, []);

  const { projects, isLoading: projectsLoading, createProject, deleteProject } = useProjects();

  useEffect(() => {
    if (projects.length === 0) return;
    const currentValid = prefs.selectedProjectId && projects.some((p) => p.id === prefs.selectedProjectId);
    if (!currentValid) {
      const aiji = projects.find((p) => p.id === AIJI_PROJECT_ID);
      setPrefs((p) => ({ ...p, selectedProjectId: aiji?.id || projects[0].id }));
    }
  }, [projects, prefs.selectedProjectId]);

  const { workstreams, projectName, isLoading: dataLoading, error, mutations, invalidate } = useProjectData(prefs.selectedProjectId);

  const filtered = useMemo(
    () => applyFilters(workstreams, filters),
    [workstreams, filters]
  );

  const isLoading = projectsLoading || dataLoading;
  const { viewType } = prefs;
  const setViewType = (v: ViewType) => setPrefs((p) => ({ ...p, viewType: v }));

  if (isLoading && !workstreams.length) {
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
      {!prefs.sidebarCollapsed && (
        <ProjectSidebar
          projects={projects}
          selectedId={prefs.selectedProjectId}
          onSelect={(id: string) => {
            setPrefs((p) => ({ ...p, selectedProjectId: id }));
            setFilters({ workstreams: [], owners: [] });
          }}
          onCreateProject={createProject}
          onDeleteProject={(id: string) => {
            deleteProject(id);
            const remaining = projects.filter((p) => p.id !== id);
            if (remaining.length > 0 && prefs.selectedProjectId === id) {
              setPrefs((p) => ({ ...p, selectedProjectId: remaining[0].id }));
            }
          }}
          onCollapse={() => setPrefs((p) => ({ ...p, sidebarCollapsed: true }))}
        />
      )}

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {prefs.sidebarCollapsed && (
                <Tooltip title="Show projects">
                  <IconButton size="small" onClick={() => setPrefs((p) => ({ ...p, sidebarCollapsed: false }))}>
                    <ExpandIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="h5" fontWeight={700}>
                {projectName || 'Projects'}
              </Typography>
              {projects.length > 1 && prefs.sidebarCollapsed && (
                <Typography variant="caption" color="text.secondary">
                  ({projects.length} projects)
                </Typography>
              )}
            </Box>

            {prefs.selectedProjectId && (
              <Box sx={{ mt: 0.5 }}>
                <LinkedOpportunities projectId={prefs.selectedProjectId} />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={() => setImportOpen(true)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Import CSV
            </Button>
            <ViewSwitcher value={viewType} onChange={setViewType} />
          </Box>
        </Box>

        {viewType !== 'executive' && (
          <FilterBar
            workstreams={workstreams}
            filters={filters}
            onFiltersChange={setFilters}
            viewType={viewType}
          />
        )}

        {viewType === 'list' && filtered.map((ws) => (
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
            {workstreams.length === 0
              ? 'No data yet. Import a CSV to get started.'
              : 'No workstreams match the current filters.'}
          </Typography>
        )}
      </Box>

      {prefs.selectedProjectId && (
        <ImportCsvDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          projectId={prefs.selectedProjectId}
          existingWorkstreams={workstreams}
          onImportComplete={invalidate}
        />
      )}
    </Box>
  );
};

export default Projects;
