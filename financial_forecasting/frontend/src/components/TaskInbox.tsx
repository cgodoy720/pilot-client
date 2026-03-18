import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format, parseISO, isBefore, startOfDay, addDays, differenceInDays } from 'date-fns';

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
  isUrgent?: boolean;
}

interface TaskInboxProps {
  tasks: InboxTask[];
  loading?: boolean;
  compact?: boolean;
  maxHeight?: number;
  onTaskClick?: (task: InboxTask) => void;
  onToggleUrgent?: (taskId: string, urgent: boolean) => void;
  onHeightChange?: (height: number) => void;
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

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#d32f2f' };
  if (diff === 0) return { label: 'Due today', color: '#ed6c02' };
  if (diff <= 1) return { label: 'Due tomorrow', color: '#ed6c02' };
  return null;
}

const MIN_INBOX_HEIGHT = 200;
const MAX_INBOX_HEIGHT = 600;

const TaskInbox: React.FC<TaskInboxProps> = ({
  tasks,
  loading = false,
  compact = false,
  maxHeight = 400,
  onTaskClick,
  onToggleUrgent,
  onHeightChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

    return items;
  }, [tasks, filterStatus, filterPriority]);

  const { urgent, assigned } = useMemo(() => {
    const u: InboxTask[] = [];
    const a: InboxTask[] = [];

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
      if (t.isUrgent) u.push(t);
      else a.push(t);
    }

    u.sort(sortFn);
    a.sort(sortFn);

    return { urgent: u, assigned: a };
  }, [filtered, sort]);

  const renderTask = (task: InboxTask) => {
    const isExpanded = expandedId === task.Id;
    const dueBadge = getDueBadge(task);
    const isOverdue = task.ActivityDate && isBefore(parseISO(task.ActivityDate), startOfDay(new Date()));
    const isDueSoon = task.ActivityDate && differenceInDays(parseISO(task.ActivityDate), startOfDay(new Date())) <= 1;

    return (
      <Box
        key={task.Id}
        sx={{
          borderLeft: '3px solid',
          borderLeftColor: isOverdue && task.Status !== 'Completed' ? '#d32f2f' : isDueSoon && task.Status !== 'Completed' ? '#ed6c02' : 'transparent',
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
          {task.isUrgent && (
            <Tooltip title="Urgent">
              <FlagIcon sx={{ fontSize: 14, color: 'error.main' }} />
            </Tooltip>
          )}
          {dueBadge && task.Status !== 'Completed' && (
            <Chip
              size="small"
              label={dueBadge.label}
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: dueBadge.color, color: '#fff' }}
            />
          )}
          {task.Priority === 'High' && !task.isUrgent && (
            <Chip size="small" label="High" sx={{ height: 18, fontSize: '0.65rem' }} color="warning" />
          )}
          {onToggleUrgent && (
            <Tooltip title={task.isUrgent ? 'Remove urgent' : 'Flag urgent'}>
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
          <Box sx={{ display: 'flex', gap: 1, ml: 2.5, mt: 0.25 }}>
            {task.ActivityDate && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <ScheduleIcon sx={{ fontSize: 11 }} />
                {format(parseISO(task.ActivityDate), 'MMM d')}
              </Typography>
            )}
            {task.OpportunityName && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                {task.OpportunityName}
              </Typography>
            )}
            {task.CreatedByName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <PersonIcon sx={{ fontSize: 11 }} />
                {task.CreatedByName}
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
            {task.OpportunityName && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                Linked: {task.OpportunityName}
              </Typography>
            )}
            {task.CreatedByName && (
              <Typography variant="caption" color="text.secondary" display="block">
                Assigned by: {task.CreatedByName}
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box>
      {/* Filters */}
      {!compact && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <FilterIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Priority"
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ position: 'relative' }}>
      <Box sx={{ overflowY: 'auto', maxHeight }}>
        {/* Urgent section */}
        {urgent.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'error.main', px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <FlagIcon sx={{ fontSize: 14 }} />
              URGENT ({urgent.length})
            </Typography>
            {urgent.map(renderTask)}
          </Box>
        )}

        {urgent.length > 0 && assigned.length > 0 && <Divider sx={{ my: 0.5 }} />}

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

        {urgent.length === 0 && assigned.length === 0 && (
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
