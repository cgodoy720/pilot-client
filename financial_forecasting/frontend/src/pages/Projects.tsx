import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Tooltip,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  RadioButtonUnchecked as PendingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';

// ── Types ──

interface ProjectTask {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold';
  owner: string;
  deadline?: string | null;
  description?: string;
  updates?: string;
  links?: string[];
  dependsOn?: string[];
}

interface Milestone {
  id: string;
  title: string;
  status: 'On Track' | 'At Risk' | 'Needs Attention' | 'Completed';
  priority: 'Now' | 'Later' | 'On-going';
  owner: string;
  description?: string;
  sourceLinks?: string[];
  tasks: ProjectTask[];
}

interface Workstream {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
}

// Deterministic AIJI project ID (matches seed.sql)
const AIJI_PROJECT_ID = 'a0000000-0000-4000-8000-000000000001';

// ── View types ──

type ViewType = 'full' | 'construction' | 'campaign' | 'executive';

// Filter by workstream name (UUIDs from DB, so can't use hardcoded IDs)
const VIEW_NAME_FILTER: Record<ViewType, string[] | null> = {
  full: null, // show all
  construction: ['Launch and Activation'],
  campaign: ['Partnerships and Development', 'Communications and Narrative'],
  executive: null, // show all
};

// ── Status constants ──

const TASK_STATUSES: ProjectTask['status'][] = ['Not Started', 'In Progress', 'Completed', 'Blocked', 'On Hold'];
const MILESTONE_STATUSES: Milestone['status'][] = ['On Track', 'At Risk', 'Needs Attention', 'Completed'];

const STATUS_CHIP: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
  'On Track': { color: 'success', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
  'At Risk': { color: 'warning', icon: <WarningIcon sx={{ fontSize: 14 }} /> },
  'Needs Attention': { color: 'error', icon: <ErrorIcon sx={{ fontSize: 14 }} /> },
  'Completed': { color: 'success', icon: <CheckIcon sx={{ fontSize: 14 }} /> },
};

const TASK_STATUS_COLOR: Record<string, string> = {
  'Not Started': '#9e9e9e',
  'In Progress': '#1976d2',
  'Completed': '#4caf50',
  'Blocked': '#d32f2f',
  'On Hold': '#ed6c02',
};

// ── Helpers ──

function getWorkstreamProgress(ws: Workstream): number {
  let total = 0;
  let completed = 0;
  for (const m of ws.milestones) {
    for (const t of m.tasks) {
      total++;
      if (t.status === 'Completed') completed++;
    }
  }
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function getMilestoneProgress(m: Milestone): number {
  const total = m.tasks.length;
  const completed = m.tasks.filter((t) => t.status === 'Completed').length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

// ── Executive Snapshot ──

const ExecutiveSnapshot: React.FC<{ workstreams: Workstream[] }> = ({ workstreams }) => {
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let atRiskMilestones = 0;
    let totalMilestones = 0;

    for (const ws of workstreams) {
      for (const m of ws.milestones) {
        totalMilestones++;
        if (m.status === 'At Risk' || m.status === 'Needs Attention') atRiskMilestones++;
        for (const t of m.tasks) {
          totalTasks++;
          if (t.status === 'Completed') completedTasks++;
        }
      }
    }

    return { totalTasks, completedTasks, atRiskMilestones, totalMilestones };
  }, [workstreams]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{stats.completedTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Milestones</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalMilestones}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">At Risk</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: stats.atRiskMilestones > 0 ? 'warning.main' : 'text.primary' }}>
                {stats.atRiskMilestones}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {workstreams.map((ws) => {
        const progress = getWorkstreamProgress(ws);
        return (
          <Card key={ws.id} variant="outlined" sx={{ mb: 1.5 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2">{ws.name}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, height: 6, borderRadius: 3 }} />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {ws.milestones.map((m) => {
                  const sc = STATUS_CHIP[m.status] || { color: 'default' as const, icon: null };
                  return (
                    <Chip
                      key={m.id}
                      size="small"
                      label={m.title}
                      color={sc.color}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

// ── Workstream Detail View ──

const WorkstreamView: React.FC<{
  workstream: Workstream;
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onMilestoneStatusChange: (milestoneId: string, newStatus: string) => void;
  onAddTask: (milestoneId: string, title: string) => void;
  onAddMilestone: (workstreamId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}> = ({ workstream, onTaskStatusChange, onMilestoneStatusChange, onAddTask, onAddMilestone, onDeleteTask, onDeleteMilestone }) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToMilestone, setAddingToMilestone] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'task' | 'milestone'; id: string; title: string } | null>(null);
  const progress = getWorkstreamProgress(workstream);

  const handleAddTask = (milestoneId: string) => {
    if (!newTaskTitle.trim()) return;
    onAddTask(milestoneId, newTaskTitle.trim());
    setNewTaskTitle('');
    setAddingToMilestone(null);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    onAddMilestone(workstream.id, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const cycleTaskStatus = (task: ProjectTask) => {
    const idx = TASK_STATUSES.indexOf(task.status);
    const next = TASK_STATUSES[(idx + 1) % TASK_STATUSES.length];
    onTaskStatusChange(task.id, next);
  };

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography variant="h6">{workstream.name}</Typography>
              <Typography variant="caption" color="text.secondary">{workstream.description}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 80 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{progress}%</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
            </Box>
          </Box>
        </CardContent>

        {workstream.milestones.map((milestone) => {
          const isExpanded = expandedMilestone === milestone.id;
          const sc = STATUS_CHIP[milestone.status] || { color: 'default' as const, icon: null };
          const mProgress = getMilestoneProgress(milestone);

          return (
            <Box key={milestone.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
                onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
              >
                <IconButton size="small" sx={{ p: 0 }}>
                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
                <Select
                  size="small"
                  value={milestone.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    onMilestoneStatusChange(milestone.id, e.target.value);
                  }}
                  sx={{ minWidth: 130, '& .MuiSelect-select': { py: 0.25, fontSize: '0.75rem' } }}
                  renderValue={(val) => {
                    const s = STATUS_CHIP[val] || { color: 'default' as const, icon: null };
                    return <Chip size="small" label={val} color={s.color} icon={s.icon as any} sx={{ fontSize: '0.7rem' }} />;
                  }}
                >
                  {MILESTONE_STATUSES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
                  ))}
                </Select>
                <Chip size="small" label={milestone.priority} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{milestone.title}</Typography>
                <Typography variant="caption" color="text.secondary">{milestone.owner}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 35, textAlign: 'right' }}>{mProgress}%</Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ type: 'milestone', id: milestone.id, title: milestone.title });
                  }}
                  sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 1.5 }}>
                  {milestone.description && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {milestone.description}
                    </Typography>
                  )}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Task</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Owner</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Deadline</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Depends On</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, width: 40 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {milestone.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {task.status === 'Completed' ? (
                                  <CheckIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                ) : (
                                  <PendingIcon sx={{ fontSize: 14, color: TASK_STATUS_COLOR[task.status] || '#9e9e9e' }} />
                                )}
                                {task.title}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={task.status}
                                onClick={() => cycleTaskStatus(task)}
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 20,
                                  bgcolor: TASK_STATUS_COLOR[task.status] || '#9e9e9e',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.85 },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{task.owner}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{task.deadline || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              {task.dependsOn?.length
                                ? task.dependsOn.map((dep) => {
                                    const depTask = milestone.tasks.find((t) => t.id === dep);
                                    return (
                                      <Tooltip key={dep} title={depTask?.title || dep}>
                                        <Chip
                                          size="small"
                                          label={depTask?.title?.substring(0, 20) || dep.substring(0, 8)}
                                          variant="outlined"
                                          sx={{ fontSize: '0.6rem', height: 18, mr: 0.25 }}
                                        />
                                      </Tooltip>
                                    );
                                  })
                                : '—'}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => setDeleteConfirm({ type: 'task', id: task.id, title: task.title })}
                                sx={{ opacity: 0.3, '&:hover': { opacity: 1, color: 'error.main' }, p: 0.25 }}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Add task */}
                  {addingToMilestone === milestone.id ? (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(milestone.id)}
                        autoFocus
                        sx={{ flex: 1, '& input': { fontSize: '0.8rem' } }}
                      />
                      <Button size="small" variant="contained" onClick={() => handleAddTask(milestone.id)}>Add</Button>
                      <Button size="small" onClick={() => { setAddingToMilestone(null); setNewTaskTitle(''); }}>Cancel</Button>
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setAddingToMilestone(milestone.id)}
                      sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Add Task
                    </Button>
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}

        {/* Add milestone */}
        <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {showAddMilestone ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Milestone title"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                autoFocus
                sx={{ flex: 1, '& input': { fontSize: '0.8rem' } }}
              />
              <Button size="small" variant="contained" onClick={handleAddMilestone}>Add</Button>
              <Button size="small" onClick={() => { setShowAddMilestone(false); setNewMilestoneTitle(''); }}>Cancel</Button>
            </Box>
          ) : (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowAddMilestone(true)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Add Milestone
            </Button>
          )}
        </Box>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete {deleteConfirm?.type}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.title}"?
            {deleteConfirm?.type === 'milestone' && ' All tasks in this milestone will also be deleted.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirm?.type === 'task') onDeleteTask(deleteConfirm.id);
              else if (deleteConfirm?.type === 'milestone') onDeleteMilestone(deleteConfirm.id);
              setDeleteConfirm(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Main Projects Page ──

const Projects: React.FC = () => {
  const [view, setView] = useState<ViewType>('full');
  const queryClient = useQueryClient();

  const { data: projectData, isLoading, error } = useQuery(
    ['project', AIJI_PROJECT_ID],
    async () => {
      const res = await apiService.getProject(AIJI_PROJECT_ID);
      return res.data?.data || res.data;
    },
    { staleTime: 30_000 }
  );

  const workstreams: Workstream[] = projectData?.workstreams || [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries(['project', AIJI_PROJECT_ID]);
  }, [queryClient]);

  // Mutations
  const updateTaskStatus = useMutation(
    ({ taskId, status }: { taskId: string; status: string }) =>
      apiService.updateProjectTask(taskId, { status }),
    { onSuccess: invalidate }
  );

  const updateMilestoneStatus = useMutation(
    ({ milestoneId, status }: { milestoneId: string; status: string }) =>
      apiService.updateMilestone(milestoneId, { status }),
    { onSuccess: invalidate }
  );

  const addTask = useMutation(
    ({ milestoneId, title }: { milestoneId: string; title: string }) =>
      apiService.createProjectTask(milestoneId, { title }),
    { onSuccess: invalidate }
  );

  const addMilestone = useMutation(
    ({ workstreamId, title }: { workstreamId: string; title: string }) =>
      apiService.createMilestone(workstreamId, { title }),
    { onSuccess: invalidate }
  );

  const removeTask = useMutation(
    (taskId: string) => apiService.deleteProjectTask(taskId),
    { onSuccess: invalidate }
  );

  const removeMilestone = useMutation(
    (milestoneId: string) => apiService.deleteMilestone(milestoneId),
    { onSuccess: invalidate }
  );

  const visibleWorkstreams = useMemo(() => {
    const names = VIEW_NAME_FILTER[view];
    if (!names) return workstreams;
    return workstreams.filter((ws) => names.includes(ws.name));
  }, [view, workstreams]);

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
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Projects</Typography>
        <Typography variant="body2" color="text.secondary">
          Deep project planning with milestones, tasks, and sub-task dependencies
        </Typography>
      </Box>

      <Tabs
        value={view}
        onChange={(_, v) => setView(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="full" label="Full View" sx={{ textTransform: 'none' }} />
        <Tab value="construction" label="AIJI Construction" sx={{ textTransform: 'none' }} />
        <Tab value="campaign" label="AIJI Campaign" sx={{ textTransform: 'none' }} />
        <Tab value="executive" label="Executive Snapshot" sx={{ textTransform: 'none' }} />
      </Tabs>

      {view === 'executive' ? (
        <ExecutiveSnapshot workstreams={visibleWorkstreams} />
      ) : (
        visibleWorkstreams.map((ws) => (
          <WorkstreamView
            key={ws.id}
            workstream={ws}
            onTaskStatusChange={(taskId, status) => updateTaskStatus.mutate({ taskId, status })}
            onMilestoneStatusChange={(milestoneId, status) => updateMilestoneStatus.mutate({ milestoneId, status })}
            onAddTask={(milestoneId, title) => addTask.mutate({ milestoneId, title })}
            onAddMilestone={(workstreamId, title) => addMilestone.mutate({ workstreamId, title })}
            onDeleteTask={(taskId) => removeTask.mutate(taskId)}
            onDeleteMilestone={(milestoneId) => removeMilestone.mutate(milestoneId)}
          />
        ))
      )}

      {visibleWorkstreams.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No workstreams match this view.
        </Typography>
      )}
    </Box>
  );
};

export default Projects;
