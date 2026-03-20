import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Collapse, IconButton,
  LinearProgress, Tooltip, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Workstream, ProjectMutations } from './types';
import { TASK_STATUSES, MILESTONE_STATUSES, TASK_STATUS_COLOR, STATUS_CHIP } from './constants';
import { getWorkstreamProgress, getMilestoneProgress } from './helpers';

interface ListViewProps {
  workstream: Workstream;
  mutations: ProjectMutations;
}

const ListView: React.FC<ListViewProps> = ({ workstream, mutations }) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToMilestone, setAddingToMilestone] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'task' | 'milestone'; id: string; title: string } | null>(null);
  const progress = getWorkstreamProgress(workstream);

  const handleAddTask = (milestoneId: string) => {
    if (!newTaskTitle.trim()) return;
    mutations.addTask(milestoneId, newTaskTitle.trim());
    setNewTaskTitle('');
    setAddingToMilestone(null);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    mutations.addMilestone(workstream.id, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const cycleTaskStatus = (task: { id: string; status: string }) => {
    const idx = TASK_STATUSES.indexOf(task.status as any);
    const next = TASK_STATUSES[(idx + 1) % TASK_STATUSES.length];
    mutations.updateTaskStatus(task.id, next);
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
                  display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
                  cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
                  borderTop: '1px solid', borderColor: 'divider',
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
                    mutations.updateMilestoneStatus(milestone.id, e.target.value);
                  }}
                  sx={{ minWidth: 130, '& .MuiSelect-select': { py: 0.25, fontSize: '0.75rem' } }}
                  renderValue={(val) => {
                    const s = STATUS_CHIP[val] || { color: 'default' as const };
                    return <Chip size="small" label={val} color={s.color} sx={{ fontSize: '0.7rem' }} />;
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
                                  fontSize: '0.65rem', height: 20,
                                  bgcolor: TASK_STATUS_COLOR[task.status] || '#9e9e9e',
                                  color: '#fff', cursor: 'pointer',
                                  '&:hover': { opacity: 0.85 },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{task.owner}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{task.deadline || '\u2014'}</TableCell>
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
                                : '\u2014'}
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

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete {deleteConfirm?.type}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;?
            {deleteConfirm?.type === 'milestone' && ' All tasks in this milestone will also be deleted.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirm?.type === 'task') mutations.deleteTask(deleteConfirm.id);
              else if (deleteConfirm?.type === 'milestone') mutations.deleteMilestone(deleteConfirm.id);
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

export default ListView;
