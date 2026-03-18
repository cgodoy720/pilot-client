import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  RadioButtonUnchecked as PendingIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

// ── Types ──

interface ProjectTask {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold';
  owner: string;
  deadline?: string;
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

// ── Sample Data (to be replaced by API/DB) ──

const WORKSTREAMS: Workstream[] = [
  {
    id: 'strategy-design',
    name: 'Strategy and Design',
    description: 'Core strategic framework and positioning for AIJI',
    milestones: [
      {
        id: 'sd-1',
        title: 'Finalize AIJI Operational Charter',
        status: 'On Track',
        priority: 'Now',
        owner: 'Leadership',
        description: 'Draft and approve the AIJI charter with governance structure',
        tasks: [
          { id: 'sd-1-1', title: 'Draft charter document', status: 'Completed', owner: 'Leadership', deadline: '2026-03-15' },
          { id: 'sd-1-2', title: 'Review with advisory board', status: 'In Progress', owner: 'Leadership', deadline: '2026-03-28' },
          { id: 'sd-1-3', title: 'Incorporate feedback and finalize', status: 'Not Started', owner: 'Leadership', deadline: '2026-04-05', dependsOn: ['sd-1-2'] },
        ],
      },
      {
        id: 'sd-2',
        title: 'Revenue Model Design',
        status: 'At Risk',
        priority: 'Now',
        owner: 'Finance',
        description: 'Define revenue streams, pricing, and sustainability model',
        tasks: [
          { id: 'sd-2-1', title: 'Research comparable models', status: 'Completed', owner: 'Finance' },
          { id: 'sd-2-2', title: 'Draft revenue projections', status: 'In Progress', owner: 'Finance', deadline: '2026-04-01' },
          { id: 'sd-2-3', title: 'Validate with key stakeholders', status: 'Not Started', owner: 'Finance', deadline: '2026-04-15', dependsOn: ['sd-2-2'] },
        ],
      },
    ],
  },
  {
    id: 'partnerships',
    name: 'Partnerships and Development',
    description: 'Building strategic partnerships and fundraising pipeline',
    milestones: [
      {
        id: 'pd-1',
        title: 'Anchor Investor Commitment',
        status: 'On Track',
        priority: 'Now',
        owner: 'Development',
        tasks: [
          { id: 'pd-1-1', title: 'Identify top 10 anchor prospects', status: 'Completed', owner: 'Development' },
          { id: 'pd-1-2', title: 'Secure meetings with prospects', status: 'In Progress', owner: 'Development', deadline: '2026-04-01' },
          { id: 'pd-1-3', title: 'Negotiate and close first anchor', status: 'Not Started', owner: 'Development', deadline: '2026-05-01', dependsOn: ['pd-1-2'] },
        ],
      },
      {
        id: 'pd-2',
        title: 'Corporate Partnership Pipeline',
        status: 'Needs Attention',
        priority: 'On-going',
        owner: 'Development',
        tasks: [
          { id: 'pd-2-1', title: 'Build target list of 50 corporates', status: 'In Progress', owner: 'Development' },
          { id: 'pd-2-2', title: 'Create partnership deck', status: 'Not Started', owner: 'Communications', deadline: '2026-04-15' },
        ],
      },
    ],
  },
  {
    id: 'communications',
    name: 'Communications and Narrative',
    description: 'Brand, messaging, and public communications',
    milestones: [
      {
        id: 'cn-1',
        title: 'Brand Launch Materials',
        status: 'At Risk',
        priority: 'Now',
        owner: 'Communications',
        tasks: [
          { id: 'cn-1-1', title: 'Design brand identity package', status: 'In Progress', owner: 'Design', deadline: '2026-03-30' },
          { id: 'cn-1-2', title: 'Create launch website content', status: 'Not Started', owner: 'Communications', deadline: '2026-04-10', dependsOn: ['cn-1-1'] },
          { id: 'cn-1-3', title: 'Produce launch video', status: 'Not Started', owner: 'Communications', deadline: '2026-04-20' },
        ],
      },
    ],
  },
  {
    id: 'launch-activation',
    name: 'Launch and Activation',
    description: 'Execution of launch plan and initial activation',
    milestones: [
      {
        id: 'la-1',
        title: 'Soft Launch Event',
        status: 'On Track',
        priority: 'Later',
        owner: 'Events',
        tasks: [
          { id: 'la-1-1', title: 'Secure venue', status: 'Not Started', owner: 'Events', deadline: '2026-05-01' },
          { id: 'la-1-2', title: 'Create invite list', status: 'Not Started', owner: 'Events', deadline: '2026-05-10' },
          { id: 'la-1-3', title: 'Coordinate speakers', status: 'Not Started', owner: 'Events', deadline: '2026-05-15' },
        ],
      },
    ],
  },
];

// ── View types ──

type ViewType = 'full' | 'construction' | 'campaign' | 'executive';

const VIEW_LABELS: Record<ViewType, string> = {
  full: 'Full Project View',
  construction: 'AIJI Construction Plan',
  campaign: 'AIJI Campaign Plan',
  executive: 'Executive Snapshot',
};

const VIEW_FILTER: Record<ViewType, string[]> = {
  full: WORKSTREAMS.map((w) => w.id),
  construction: ['launch-activation'],
  campaign: ['partnerships', 'communications'],
  executive: WORKSTREAMS.map((w) => w.id),
};

// ── Helpers ──

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
      {/* Key metrics */}
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

      {/* Workstream summaries */}
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

const WorkstreamView: React.FC<{ workstream: Workstream }> = ({ workstream }) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const progress = getWorkstreamProgress(workstream);

  return (
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

      {/* Milestones */}
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
              <Chip
                size="small"
                label={milestone.status}
                color={sc.color}
                icon={sc.icon as any}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip size="small" label={milestone.priority} variant="outlined" sx={{ fontSize: '0.7rem' }} />
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{milestone.title}</Typography>
              <Typography variant="caption" color="text.secondary">{milestone.owner}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 35, textAlign: 'right' }}>{mProgress}%</Typography>
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
                              sx={{
                                fontSize: '0.65rem',
                                height: 20,
                                bgcolor: TASK_STATUS_COLOR[task.status] || '#9e9e9e',
                                color: '#fff',
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
                                        label={depTask?.title?.substring(0, 20) || dep}
                                        variant="outlined"
                                        sx={{ fontSize: '0.6rem', height: 18, mr: 0.25 }}
                                      />
                                    </Tooltip>
                                  );
                                })
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Card>
  );
};

// ── Main Projects Page ──

const Projects: React.FC = () => {
  const [view, setView] = useState<ViewType>('full');

  const visibleWorkstreams = useMemo(() => {
    const allowedIds = VIEW_FILTER[view];
    return WORKSTREAMS.filter((ws) => allowedIds.includes(ws.id));
  }, [view]);

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
          <WorkstreamView key={ws.id} workstream={ws} />
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
