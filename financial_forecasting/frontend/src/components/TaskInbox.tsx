import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Popover,
  Button,
} from '@mui/material';
import {
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { format, parseISO, isBefore, startOfDay, addDays, differenceInDays } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface InboxTask {
  Id: string;
  Subject: string;
  Status: string;
  Priority: string;
  ActivityDate: string | null;
  Description: string | null;
  OwnerId: string;
  OwnerName?: string | null;
  CreatedById?: string | null;
  CreatedByName?: string | null;
  WhatId?: string | null;
  OpportunityName?: string | null;
  WhoId?: string | null;
  WhoName?: string | null;
  CreatedDate?: string | null;
  isUrgent?: boolean;
}

interface TaskInboxProps {
  tasks: InboxTask[];
  loading?: boolean;
  compact?: boolean;
  maxHeight?: number;
  currentUserId?: string | null;
  users?: Array<{ Id: string; Name: string }>;
  onTaskClick?: (task: InboxTask) => void;
  onToggleUrgent?: (taskId: string, urgent: boolean) => void;
  onEditTask?: (task: InboxTask) => void;
  onHeightChange?: (height: number) => void;
  headerSlot?: React.ReactNode;
}

type SortField = 'ActivityDate' | 'Subject' | 'Status' | 'Priority' | 'OpportunityName';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = {
  'Not Started': 0,
  'In Progress': 1,
  'Waiting on someone else': 2,
  'Deferred': 3,
  'Completed': 4,
};

const PRIORITY_ORDER: Record<string, number> = {
  'High': 0,
  'Normal': 1,
  'Low': 2,
};

export function getDueBadge(task: InboxTask): { label: string; color: string } | null {
  if (!task.ActivityDate) return null;
  const now = startOfDay(new Date());
  const due = parseISO(task.ActivityDate);
  const diff = differenceInDays(due, now);

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#e65100' };
  if (diff === 0) return { label: 'Due today', color: '#f57c00' };
  if (diff <= 1) return { label: 'Due tomorrow', color: '#f57c00' };
  return null;
}

const MIN_INBOX_HEIGHT = 200;
const MAX_INBOX_HEIGHT = 600;

const TaskInbox: React.FC<TaskInboxProps> = ({
  tasks,
  loading = false,
  compact = false,
  maxHeight = 400,
  currentUserId,
  users = [],
  onTaskClick,
  onToggleUrgent,
  onEditTask,
  onHeightChange,
  headerSlot,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>(currentUserId || '');
  const [taskDatePreset, setTaskDatePreset] = useState<string>('all');
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const dateAnchorRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ active: boolean; startY: number; startHeight: number }>({ active: false, startY: 0, startHeight: 0 });

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!onHeightChange) return;
      resizeRef.current = { active: true, startY: e.clientY, startHeight: maxHeight };
    },
    [onHeightChange, maxHeight]
  );

  useEffect(() => {
    if (!onHeightChange) return;
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizeRef.current.active) return;
      const dy = e.clientY - resizeRef.current.startY;
      const newHeight = Math.min(MAX_INBOX_HEIGHT, Math.max(MIN_INBOX_HEIGHT, resizeRef.current.startHeight + dy));
      onHeightChange(newHeight);
    };
    const onMouseUp = () => {
      resizeRef.current.active = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onHeightChange]);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'ActivityDate', dir: 'asc' });
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = useMemo(() => {
    let items = [...tasks];

    if (filterStatus === 'open') {
      items = items.filter((t) => t.Status !== 'Completed');
    } else if (filterStatus !== 'all') {
      items = items.filter((t) => t.Status === filterStatus);
    }

    if (filterPriority !== 'all') {
      items = items.filter((t) => t.Priority === filterPriority);
    }

    if (filterUserId) {
      items = items.filter((t) => t.OwnerId === filterUserId);
    }

    if (taskDatePreset !== 'all') {
      const now = startOfDay(new Date());
      let rangeStart = now;
      let rangeEnd: Date | null = null;
      if (taskDatePreset === 'next7') rangeEnd = addDays(now, 7);
      else if (taskDatePreset === 'next14') rangeEnd = addDays(now, 14);
      else if (taskDatePreset === 'next30') rangeEnd = addDays(now, 30);
      else if (taskDatePreset === 'custom' && customStart && customEnd) {
        rangeStart = startOfDay(customStart);
        rangeEnd = startOfDay(customEnd);
      }
      if (rangeEnd) {
        items = items.filter((t) => {
          if (!t.ActivityDate) return false;
          const d = parseISO(t.ActivityDate);
          return d >= rangeStart && d <= rangeEnd!;
        });
      }
    }

    return items;
  }, [tasks, filterStatus, filterPriority, filterUserId, taskDatePreset, customStart, customEnd]);

  const { urgent, overdue, assigned } = useMemo(() => {
    const u: InboxTask[] = [];
    const o: InboxTask[] = [];
    const a: InboxTask[] = [];
    const now = startOfDay(new Date());

    const sortFn = (x: InboxTask, y: InboxTask): number => {
      let diff = 0;
      switch (sort.field) {
        case 'ActivityDate':
          diff = (x.ActivityDate || '9999').localeCompare(y.ActivityDate || '9999');
          break;
        case 'Subject':
          diff = (x.Subject || '').localeCompare(y.Subject || '');
          break;
        case 'Status':
          diff = (STATUS_ORDER[x.Status] ?? 99) - (STATUS_ORDER[y.Status] ?? 99);
          break;
        case 'Priority':
          diff = (PRIORITY_ORDER[x.Priority] ?? 99) - (PRIORITY_ORDER[y.Priority] ?? 99);
          break;
        case 'OpportunityName':
          diff = (x.OpportunityName || '').localeCompare(y.OpportunityName || '');
          break;
      }
      return sort.dir === 'asc' ? diff : -diff;
    };

    for (const t of filtered) {
      if (t.isUrgent) {
        u.push(t);
      } else if (t.ActivityDate && isBefore(parseISO(t.ActivityDate), now) && t.Status !== 'Completed') {
        o.push(t);
      } else {
        a.push(t);
      }
    }

    u.sort(sortFn);
    o.sort(sortFn);
    a.sort(sortFn);

    return { urgent: u, overdue: o, assigned: a };
  }, [filtered, sort]);

  const renderTask = (task: InboxTask) => {
    const isExpanded = expandedId === task.Id;
    const dueBadge = getDueBadge(task);

    return (
      <Box
        key={task.Id}
        sx={{
          borderLeft: '3px solid',
          borderLeftColor: task.Status !== 'Completed' && (task.isUrgent || task.Priority === 'High') ? '#d32f2f' : 'transparent',
          py: 0.75,
          px: 1,
          '&:hover': { bgcolor: 'action.hover' },
          cursor: 'pointer',
        }}
        onClick={() => {
          if (onTaskClick) onTaskClick(task);
          else setExpandedId(isExpanded ? null : task.Id);
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {task.Status === 'Completed' ? (
            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
          ) : (
            <UncheckedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          )}
          <Typography
            variant="body2"
            noWrap
            sx={{
              flex: 1,
              fontWeight: task.isUrgent ? 600 : 400,
              textDecoration: task.Status === 'Completed' ? 'line-through' : 'none',
              color: task.Status === 'Completed' ? 'text.secondary' : 'text.primary',
            }}
          >
            {task.Subject}
          </Typography>
          {dueBadge && task.Status !== 'Completed' && (
            <Chip
              size="small"
              label={dueBadge.label}
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: dueBadge.color, color: '#fff' }}
            />
          )}
          {task.Priority === 'High' && !task.isUrgent && (
            <Chip size="small" label="High" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#d32f2f', color: '#fff' }} />
          )}
          {onEditTask && (
            <Tooltip title="Open task">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                sx={{ p: 0.25 }}
              >
                <OpenIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          )}
          {onToggleUrgent && (
            <Tooltip title={task.isUrgent ? 'Remove high priority' : 'Flag high priority'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUrgent(task.Id, !task.isUrgent);
                }}
                sx={{ p: 0.25 }}
              >
                <FlagIcon sx={{ fontSize: 14, color: task.isUrgent ? 'error.main' : 'text.disabled' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Compact meta line */}
        {!compact && (
          <Box sx={{ display: 'flex', gap: 1, ml: 2.5, mt: 0.25, minWidth: 0 }}>
            {task.ActivityDate && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <ScheduleIcon sx={{ fontSize: 11 }} />
                {format(parseISO(task.ActivityDate), 'MMM d')}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0, fontStyle: task.OpportunityName ? 'normal' : 'italic' }}>
              {task.OpportunityName || 'No Opportunity'}
            </Typography>
            {task.WhoName && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <AccountCircleIcon sx={{ fontSize: 11 }} />
                {task.WhoName}
              </Typography>
            )}
            {task.OwnerName && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <PersonIcon sx={{ fontSize: 11 }} />
                {task.OwnerName}
              </Typography>
            )}
            {task.CreatedByName && task.CreatedByName !== task.OwnerName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                Assigned by {task.CreatedByName}
              </Typography>
            )}
          </Box>
        )}

        {/* Expandable detail */}
        <Collapse in={isExpanded}>
          <Box sx={{ ml: 2.5, mt: 0.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Status: {task.Status} · Priority: {task.Priority}
            </Typography>
            {task.Description && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {task.Description}
              </Typography>
            )}
            {task.CreatedByName && (
              <Typography variant="caption" color="text.secondary" display="block">
                Assigned by: {task.CreatedByName}
              </Typography>
            )}
            {onEditTask && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: 'inline-block', color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
              >
                Edit Task
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Filters */}
      {!compact && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap', pr: 4 }}>
          {headerSlot}
          <Chip
            label={`${filtered.filter((t) => t.Status !== 'Completed').length} open`}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 80, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 80, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}>
            <InputLabel>Owner</InputLabel>
            <Select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              label="Owner"
            >
              <MenuItem value="">All Users</MenuItem>
              {currentUserId && <MenuItem value={currentUserId}>My Tasks</MenuItem>}
              {users.filter((u) => u.Id !== currentUserId).map((u) => (
                <MenuItem key={u.Id} value={u.Id}>{u.Name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" ref={dateAnchorRef} sx={{ minWidth: 90, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}>
            <InputLabel>Due</InputLabel>
            <Select
              value={taskDatePreset}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'custom') {
                  if (!customStart) setCustomStart(new Date());
                  if (!customEnd) setCustomEnd(addDays(new Date(), 14));
                  setDatePopoverOpen(true);
                } else {
                  setTaskDatePreset(v);
                }
              }}
              label="Due"
              renderValue={(v) => {
                if (v === 'custom' && customStart && customEnd) {
                  try {
                    return `${format(customStart, 'MMM d')} – ${format(customEnd, 'MMM d')}`;
                  } catch { return 'Custom'; }
                }
                const labels: Record<string, string> = { all: 'All dates', next7: 'Next 7d', next14: 'Next 14d', next30: 'Next 30d', custom: 'Custom' };
                return labels[v] || v;
              }}
            >
              <MenuItem value="all">All dates</MenuItem>
              <MenuItem value="next7">Next 7 days</MenuItem>
              <MenuItem value="next14">Next 14 days</MenuItem>
              <MenuItem value="next30">Next 30 days</MenuItem>
              <MenuItem value="custom">Custom...</MenuItem>
            </Select>
          </FormControl>
          <Popover
            open={datePopoverOpen}
            anchorEl={dateAnchorRef.current}
            onClose={() => setDatePopoverOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 260 }}>
              <Typography variant="subtitle2">Custom Date Range</Typography>
              <DatePicker
                label="From"
                value={customStart}
                onChange={setCustomStart}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="To"
                value={customEnd}
                onChange={setCustomEnd}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button size="small" onClick={() => setDatePopoverOpen(false)}>Cancel</Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!customStart || !customEnd}
                  onClick={() => {
                    setTaskDatePreset('custom');
                    setDatePopoverOpen(false);
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      )}

      <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {/* High Priority section */}
        {urgent.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'error.main', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <FlagIcon sx={{ fontSize: 14 }} />
              HIGH PRIORITY ({urgent.length})
            </Typography>
            {urgent.map(renderTask)}
          </Box>
        )}

        {urgent.length > 0 && (overdue.length > 0 || assigned.length > 0) && <Divider sx={{ my: 0.5 }} />}

        {/* Overdue section */}
        {overdue.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#f57c00', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ScheduleIcon sx={{ fontSize: 14 }} />
              OVERDUE ({overdue.length})
            </Typography>
            {overdue.map(renderTask)}
          </Box>
        )}

        {overdue.length > 0 && assigned.length > 0 && <Divider sx={{ my: 0.5 }} />}

        {/* Assigned section */}
        {assigned.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: 'text.secondary', px: 1 }}
            >
              ASSIGNED ({assigned.length})
            </Typography>
            {assigned.map(renderTask)}
          </Box>
        )}

        {urgent.length === 0 && overdue.length === 0 && assigned.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            {loading ? 'Loading tasks...' : 'No tasks to show.'}
          </Typography>
        )}
      </Box>
      {onHeightChange && (
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            cursor: 'row-resize',
            zIndex: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        />
      )}
    </Box>
    </Box>
  );
};

export default TaskInbox;
