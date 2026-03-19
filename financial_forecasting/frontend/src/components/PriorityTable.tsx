/**
 * PriorityTable — compact, action-oriented table with inline task editing.
 *
 * Always sorted by computeWeightedPriority descending.
 * Column-based filters (Stage, Close Date, Tasks, Amount) narrow results.
 *
 * Clicking a task count badge expands an inline task sub-table below that row.
 * Pending tasks are editable inline; completed tasks are read-only except Status.
 * "+ Add Task" row allows quick task creation.
 */
import React, { useState, useMemo, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Collapse,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
  OpenInNew as OpenInNewIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Flag as FlagIcon,
  OpenInFull as OpenInFullIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays, isBefore, startOfDay } from 'date-fns';
import { formatDollarMillions } from '../utils/formatters';
import {
  PriorityOpp,
  UrgencyScore,
  computeWeightedPriority,
  computeUrgency,
  countOverdueTasks,
} from '../utils/priorityScoring';
import { apiService } from '../services/api';
import { getStageHexColor, stageIndex } from '../types/salesforce';
import toast from 'react-hot-toast';

export type { PriorityOpp };

type OppSortField = 'name' | 'stage' | 'amount' | 'close' | 'prob' | 'tasks' | null;
type SortDir = 'asc' | 'desc';

type TaskSortField = 'ActivityDate' | 'Status' | 'Owner' | 'Subject' | 'Priority';
type TaskSortDir = 'asc' | 'desc';

type TaskType = NonNullable<PriorityOpp['tasks']>[number];

interface FilterState {
  stage: string[];
  closeDateRange: 'all' | 'overdue' | 'next14' | 'next30' | 'next90';
  hasTasks: 'all' | 'yes' | 'no' | 'overdue';
  amountMin: number | null;
}

const DEFAULT_FILTERS: FilterState = {
  stage: [],
  closeDateRange: 'all',
  hasTasks: 'all',
  amountMin: null,
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'Deferred'] as const;
const PRIORITY_OPTIONS = ['High', 'Normal', 'Low'] as const;

interface PriorityTableProps {
  opportunities: PriorityOpp[];
  onAddTask: (opp: PriorityOpp) => void;
  users?: Array<{ Id: string; Name: string }>;
  onOpenTaskDrawer?: (opp: PriorityOpp, taskId?: string) => void;
  showWeighted?: boolean;
  maxRows?: number;
  onFilteredChange?: (allFiltered: PriorityOpp[], visible: PriorityOpp[]) => void;
}

// ── Inline editable cell ──

interface EditableCellProps {
  value: string;
  taskId: string;
  field: string;
  readOnly?: boolean;
  type?: 'text' | 'date' | 'select' | 'multiline';
  options?: readonly string[] | Array<{ Id: string; Name: string }>;
  onSave: (taskId: string, field: string, value: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, taskId, field, readOnly, type = 'text', options, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) onSave(taskId, field, draft);
  }, [draft, value, taskId, field, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'multiline') commit();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  }, [commit, value, type]);

  if (readOnly) {
    // For status on completed tasks, still allow select
    if (field === 'Status') {
      return (
        <Select
          size="small"
          value={value}
          onChange={(e) => onSave(taskId, field, e.target.value)}
          variant="standard"
          disableUnderline
          sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0 } }}
        >
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>{s}</MenuItem>)}
        </Select>
      );
    }
    return <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{value || '-'}</Typography>;
  }

  if (type === 'select' && options) {
    const isUserList = options.length > 0 && typeof options[0] === 'object' && 'Id' in (options[0] as any);
    return (
      <Select
        size="small"
        value={value}
        onChange={(e) => onSave(taskId, field, e.target.value)}
        variant="standard"
        disableUnderline
        sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0 } }}
      >
        {isUserList
          ? (options as Array<{ Id: string; Name: string }>).map((u) => (
              <MenuItem key={u.Id} value={u.Id} sx={{ fontSize: '0.75rem' }}>{u.Name}</MenuItem>
            ))
          : (options as readonly string[]).map((o) => (
              <MenuItem key={o} value={o} sx={{ fontSize: '0.75rem' }}>{o}</MenuItem>
            ))}
      </Select>
    );
  }

  // Multiline (Description) — show 2-line clamp with tooltip, edit as textarea
  if (type === 'multiline') {
    if (!editing) {
      return (
        <Tooltip title={value || ''} placement="bottom-start" disableHoverListener={!value || value.length <= 60}>
          <Typography
            variant="body2"
            onClick={() => setEditing(true)}
            sx={{
              fontSize: '0.75rem',
              color: value ? 'text.primary' : 'text.disabled',
              cursor: 'pointer',
              borderRadius: 0.5,
              px: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {value || '-'}
          </Typography>
        </Tooltip>
      );
    }
    return (
      <TextField
        inputRef={inputRef}
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        variant="outlined"
        multiline
        minRows={2}
        maxRows={8}
        placeholder="Add description..."
        InputProps={{ sx: { fontSize: '0.75rem' } }}
        sx={{ minWidth: 180 }}
      />
    );
  }

  if (!editing) {
    const displayValue = type === 'date' && value
      ? format(parseISO(value), 'MMM d')
      : value || '-';
    return (
      <Typography
        variant="body2"
        onClick={() => setEditing(true)}
        sx={{
          fontSize: '0.8rem',
          cursor: 'pointer',
          borderRadius: 0.5,
          px: 0.5,
          // Wrap text up to 2 lines then ellipsis (for Subject and other text fields)
          ...(type === 'text' ? {
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          } : {}),
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {displayValue}
      </Typography>
    );
  }

  // Date fields use standard input; text fields use multiline for wrapping
  if (type === 'date') {
    return (
      <TextField
        inputRef={inputRef}
        size="small"
        type="date"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        variant="standard"
        InputProps={{ disableUnderline: false, sx: { fontSize: '0.8rem' } }}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 120 }}
      />
    );
  }

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      multiline
      maxRows={8}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      variant="standard"
      InputProps={{ disableUnderline: false, sx: { fontSize: '0.8rem' } }}
      sx={{ minWidth: 80 }}
    />
  );
};

// ── Add Task Row ──

interface AddTaskRowProps {
  oppId: string;
  users?: Array<{ Id: string; Name: string }>;
  onCreated: (task: TaskType) => void;
}

const AddTaskRow: React.FC<AddTaskRowProps> = ({ oppId, users, onCreated }) => {
  const [active, setActive] = useState(false);
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && inputRef.current) inputRef.current.focus();
  }, [active]);

  const save = useCallback(async () => {
    const trimmed = subject.trim();
    if (!trimmed) { setActive(false); setSubject(''); return; }
    setSaving(true);
    try {
      const res = await apiService.createTask(oppId, { Subject: trimmed, Status: 'Not Started', Priority: 'Normal' });
      const created = res.data?.task || res.data;
      onCreated({
        Id: created?.Id || `new-${Date.now()}`,
        Subject: trimmed,
        ActivityDate: '',
        Priority: 'Normal',
        Status: 'Not Started',
      });
      toast.success('Task created');
      setSubject('');
      setActive(false);
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [subject, oppId, onCreated]);

  if (!active) {
    return (
      <TableRow
        hover
        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        onClick={() => setActive(true)}
      >
        <TableCell colSpan={9} sx={{ py: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
            <AddIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Add Task</Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell sx={{ px: 0.5 }} />
      <TableCell>
        <TextField
          inputRef={inputRef}
          size="small"
          placeholder="Task subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setSubject(''); setActive(false); }
          }}
          variant="standard"
          disabled={saving}
          InputProps={{ sx: { fontSize: '0.8rem' } }}
          sx={{ minWidth: 120 }}
        />
      </TableCell>
      <TableCell><Typography variant="caption" color="text.disabled">-</Typography></TableCell>
      <TableCell><Typography variant="caption" color="text.disabled">-</Typography></TableCell>
      <TableCell><Chip label="Not Started" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} /></TableCell>
      <TableCell><Typography variant="caption" color="text.secondary">Normal</Typography></TableCell>
      <TableCell><Typography variant="caption" color="text.disabled">-</Typography></TableCell>
      <TableCell />
    </TableRow>
  );
};

// ── Main Component ──

const PriorityTable: React.FC<PriorityTableProps> = ({ opportunities, onAddTask, users, onOpenTaskDrawer, showWeighted = false, maxRows, onFilteredChange }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [expandedOppId, setExpandedOppId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState<Record<string, boolean>>({});
  const [oppSort, setOppSort] = useState<{ field: OppSortField; dir: SortDir }>({ field: null, dir: 'asc' });
  const [taskSort, setTaskSort] = useState<{ field: TaskSortField; dir: TaskSortDir }>({
    field: 'ActivityDate',
    dir: 'asc',
  });

  const handleOppSortClick = (field: OppSortField) => {
    setOppSort((prev) => {
      if (prev.field === field) {
        if (prev.dir === 'asc') return { field, dir: 'desc' };
        return { field: null, dir: 'asc' };
      }
      return { field, dir: 'asc' };
    });
  };
  // Local task state for optimistic updates
  const [localTaskOverrides, setLocalTaskOverrides] = useState<Record<string, TaskType[]>>({});

  // --- Column resize system (shared by opp table + task sub-table) ---
  const [subjectWidth, setSubjectWidth] = useState<number | null>(null); // task sub-table Subject px
  const [oppNameWidth, setOppNameWidth] = useState<number | null>(null); // opp table Opportunity px
  const resizing = useRef<'subject' | 'oppName' | false>(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const subTableRef = useRef<HTMLTableElement | null>(null);
  const oppTableRef = useRef<HTMLTableElement | null>(null);

  // Sub-table fixed columns: checkbox(24) + due(110) + status(110) + priority(90) + owner(100) + actions(36) = 470
  const SUB_FIXED_COLS = 470;

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizing.current) return;
      const dx = e.clientX - resizeStartX.current;

      if (resizing.current === 'subject' && subTableRef.current) {
        const tableWidth = subTableRef.current.getBoundingClientRect().width;
        const flexWidth = tableWidth - SUB_FIXED_COLS;
        if (flexWidth <= 0) return;
        const newWidth = Math.min(flexWidth - 120, Math.max(120, resizeStartWidth.current + dx));
        setSubjectWidth(newWidth);
      } else if (resizing.current === 'oppName') {
        // Opp name: just clamp to reasonable range
        const newWidth = Math.max(120, Math.min(600, resizeStartWidth.current + dx));
        setOppNameWidth(newWidth);
      }
    };
    const onMouseUp = () => { resizing.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleResizeStart = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    resizing.current = 'subject';
    resizeStartX.current = e.clientX;
    if (subjectWidth !== null) {
      resizeStartWidth.current = subjectWidth;
    } else if (subTableRef.current) {
      const flexWidth = subTableRef.current.getBoundingClientRect().width - SUB_FIXED_COLS;
      resizeStartWidth.current = Math.max(120, flexWidth / 2);
    }
  }, [subjectWidth]);

  const handleOppNameResizeStart = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    resizing.current = 'oppName';
    resizeStartX.current = e.clientX;
    if (oppNameWidth !== null) {
      resizeStartWidth.current = oppNameWidth;
    } else {
      // Read current rendered width from DOM
      resizeStartWidth.current = 220; // matches default maxWidth
    }
  }, [oppNameWidth]);

  const scored = useMemo(() => {
    return opportunities
      .filter((opp) => opp.Probability == null || opp.Probability >= 0)
      .map((opp) => {
        const tasks = localTaskOverrides[opp.Id] || opp.tasks;
        const oppWithTasks = { ...opp, tasks };
        return {
          opp: oppWithTasks,
          urgency: computeUrgency(oppWithTasks),
          weightedPriority: computeWeightedPriority(oppWithTasks),
          overdueTasks: countOverdueTasks(oppWithTasks),
          totalTasks: (tasks || []).filter((t) => t.Status !== 'Completed').length,
        };
      });
  }, [opportunities, localTaskOverrides]);

  const stages = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.StageName).filter(Boolean)))
      .sort((a, b) => stageIndex(a) - stageIndex(b)),
    [opportunities],
  );

  const sortedFiltered = useMemo(() => {
    let items = [...scored];
    const now = startOfDay(new Date());

    // Stage filter
    if (filters.stage.length > 0) {
      items = items.filter((s) => filters.stage.includes(s.opp.StageName));
    }

    // Close date filter
    if (filters.closeDateRange !== 'all') {
      items = items.filter((s) => {
        if (!s.opp.CloseDate) return false;
        const d = differenceInDays(parseISO(s.opp.CloseDate), now);
        switch (filters.closeDateRange) {
          case 'overdue': return d < 0;
          case 'next14': return d >= 0 && d <= 14;
          case 'next30': return d >= 0 && d <= 30;
          case 'next90': return d >= 0 && d <= 90;
          default: return true;
        }
      });
    }

    // Tasks filter
    if (filters.hasTasks !== 'all') {
      items = items.filter((s) => {
        switch (filters.hasTasks) {
          case 'yes': return s.totalTasks > 0;
          case 'no': return s.totalTasks === 0;
          case 'overdue': return s.overdueTasks > 0;
          default: return true;
        }
      });
    }

    // Amount filter
    if (filters.amountMin !== null) {
      items = items.filter((s) => (s.opp.Amount || 0) >= filters.amountMin!);
    }

    // Sort: user-selected column, or default (weighted/total).
    // Tiebreaker by Opportunity ID guarantees stable ranking regardless of topN.
    const tiebreak = (a: typeof items[0], b: typeof items[0]) =>
      (a.opp.Id || '').localeCompare(b.opp.Id || '');

    if (oppSort.field) {
      const dir = oppSort.dir === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        let diff = 0;
        switch (oppSort.field) {
          case 'name': diff = (a.opp.Name || '').localeCompare(b.opp.Name || ''); break;
          case 'stage': diff = stageIndex(a.opp.StageName) - stageIndex(b.opp.StageName); break;
          case 'amount': diff = (a.opp.Amount || 0) - (b.opp.Amount || 0); break;
          case 'close': diff = (a.opp.CloseDate || '').localeCompare(b.opp.CloseDate || ''); break;
          case 'prob': diff = (a.opp.Probability || 0) - (b.opp.Probability || 0); break;
          case 'tasks': diff = a.totalTasks - b.totalTasks; break;
        }
        return diff !== 0 ? diff * dir : tiebreak(a, b);
      });
    } else if (showWeighted) {
      items.sort((a, b) => {
        const diff = b.weightedPriority - a.weightedPriority;
        return diff !== 0 ? diff : tiebreak(a, b);
      });
    } else {
      items.sort((a, b) => {
        const diff = (b.opp.Amount || 0) - (a.opp.Amount || 0);
        return diff !== 0 ? diff : tiebreak(a, b);
      });
    }

    return items;
  }, [scored, filters, showWeighted, oppSort]);

  const displayed = useMemo(() => {
    if (maxRows != null) return sortedFiltered.slice(0, maxRows);
    return sortedFiltered;
  }, [sortedFiltered, maxRows]);

  useEffect(() => {
    onFilteredChange?.(
      sortedFiltered.map((s) => s.opp),
      displayed.map((s) => s.opp),
    );
  }, [sortedFiltered, displayed, onFilteredChange]);

  const urgencyBgColor = (score: number) => {
    if (score >= 40) return 'error.main';
    if (score >= 20) return 'warning.main';
    return 'grey.400';
  };

  const hasActiveFilters = filters.stage.length > 0 || filters.closeDateRange !== 'all' || filters.hasTasks !== 'all' || filters.amountMin !== null;

  const handleOpenInPipeline = (opp: PriorityOpp) => {
    window.open(`/pipeline?search=${encodeURIComponent(opp.Name)}`, '_blank');
  };

  const handleTaskCountClick = (oppId: string) => {
    setExpandedOppId((prev) => (prev === oppId ? null : oppId));
  };

  const handleTaskSortChange = (field: TaskSortField) => {
    setTaskSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortTasks = (tasks: TaskType[]) => {
    if (!tasks.length) return [];
    const sorted = [...tasks];
    const { field, dir } = taskSort;
    const mult = dir === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (field === 'ActivityDate') {
        const da = a.ActivityDate || '9999-12-31';
        const db = b.ActivityDate || '9999-12-31';
        return da.localeCompare(db) * mult;
      }
      if (field === 'Status') return a.Status.localeCompare(b.Status) * mult;
      if (field === 'Priority') {
        const order: Record<string, number> = { High: 0, Normal: 1, Low: 2 };
        return ((order[a.Priority] ?? 1) - (order[b.Priority] ?? 1)) * mult;
      }
      if (field === 'Owner') {
        return (a.OwnerName || '').localeCompare(b.OwnerName || '') * mult;
      }
      if (field === 'Subject') return a.Subject.localeCompare(b.Subject) * mult;
      return 0;
    });
    return sorted;
  };

  // Inline edit save handler — optimistic update + API call
  const handleInlineTaskSave = useCallback(async (opp: PriorityOpp, taskId: string, field: string, value: string) => {
    const allTasks = localTaskOverrides[opp.Id] || opp.tasks || [];
    // Map field names to API field names
    const apiField = field === 'Owner' ? 'OwnerId' : field;
    const localField = field === 'Owner' ? 'OwnerId' : field;

    // Optimistic update
    const updated = allTasks.map((t) =>
      t.Id === taskId ? { ...t, [localField]: value, ...(field === 'Owner' ? { OwnerName: users?.find(u => u.Id === value)?.Name || '' } : {}) } : t
    );
    setLocalTaskOverrides((prev) => ({ ...prev, [opp.Id]: updated }));

    try {
      await apiService.updateTask(taskId, { [apiField]: value });
      toast.success('Task updated');
    } catch (err: any) {
      // Revert on failure
      setLocalTaskOverrides((prev) => ({ ...prev, [opp.Id]: allTasks }));
      toast.error(`Failed to update: ${err.message}`);
    }
  }, [localTaskOverrides, users]);

  // Handle new task created inline
  const handleTaskCreated = useCallback((opp: PriorityOpp, task: TaskType) => {
    const allTasks = localTaskOverrides[opp.Id] || opp.tasks || [];
    setLocalTaskOverrides((prev) => ({ ...prev, [opp.Id]: [...allTasks, task] }));
  }, [localTaskOverrides]);

  return (
    <Box>
      {/* Column-based filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Filter by:
        </Typography>

        {/* Stage — multi-select */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            multiple
            value={filters.stage}
            onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value as string[] }))}
            label="Stage"
            renderValue={(sel) => `${(sel as string[]).length} selected`}
            sx={{ fontSize: '0.8rem' }}
          >
            {stages.map((s) => (
              <MenuItem key={s} value={s} dense>
                <Checkbox size="small" checked={filters.stage.includes(s)} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getStageHexColor(s), mr: 0.5, flexShrink: 0 }} />
                <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Close Date */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Close Date</InputLabel>
          <Select
            value={filters.closeDateRange}
            onChange={(e) => setFilters((f) => ({ ...f, closeDateRange: e.target.value as FilterState['closeDateRange'] }))}
            label="Close Date"
            sx={{ fontSize: '0.8rem' }}
          >
            <MenuItem value="all" dense>All</MenuItem>
            <MenuItem value="overdue" dense>Overdue</MenuItem>
            <MenuItem value="next14" dense>Next 14 days</MenuItem>
            <MenuItem value="next30" dense>Next 30 days</MenuItem>
            <MenuItem value="next90" dense>Next 90 days</MenuItem>
          </Select>
        </FormControl>

        {/* Tasks */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tasks</InputLabel>
          <Select
            value={filters.hasTasks}
            onChange={(e) => setFilters((f) => ({ ...f, hasTasks: e.target.value as FilterState['hasTasks'] }))}
            label="Tasks"
            sx={{ fontSize: '0.8rem' }}
          >
            <MenuItem value="all" dense>All</MenuItem>
            <MenuItem value="yes" dense>Has tasks</MenuItem>
            <MenuItem value="no" dense>No tasks</MenuItem>
            <MenuItem value="overdue" dense>Has overdue tasks</MenuItem>
          </Select>
        </FormControl>

        {/* Amount */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Amount</InputLabel>
          <Select
            value={filters.amountMin === null ? 'all' : String(filters.amountMin)}
            onChange={(e) => {
              const v = e.target.value;
              setFilters((f) => ({ ...f, amountMin: v === 'all' ? null : Number(v) }));
            }}
            label="Amount"
            sx={{ fontSize: '0.8rem' }}
          >
            <MenuItem value="all" dense>All</MenuItem>
            <MenuItem value="100000" dense>&gt; $100K</MenuItem>
            <MenuItem value="500000" dense>&gt; $500K</MenuItem>
            <MenuItem value="1000000" dense>&gt; $1M</MenuItem>
          </Select>
        </FormControl>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
          >
            ✕ Clear
          </Button>
        )}
      </Box>

      {/* Empty state — shown below toggle so filters remain accessible */}
      {displayed.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {hasActiveFilters ? 'No opportunities match current filters.' : 'No open opportunities to prioritize.'}
        </Typography>
      ) : (
      /* Table */
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 36, px: 1 }}>#</TableCell>
              <TableCell sx={{ position: 'relative', ...(oppNameWidth !== null ? { width: oppNameWidth } : {}) }}>
                <TableSortLabel
                  active={oppSort.field === 'name'}
                  direction={oppSort.field === 'name' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('name')}
                >
                  Opportunity
                </TableSortLabel>
                <Box
                  onMouseDown={handleOppNameResizeStart}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    cursor: 'col-resize',
                    '&:hover': { bgcolor: 'primary.main', opacity: 0.3 },
                  }}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={oppSort.field === 'stage'}
                  direction={oppSort.field === 'stage' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('stage')}
                >
                  Stage
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={oppSort.field === 'amount'}
                  direction={oppSort.field === 'amount' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={oppSort.field === 'close'}
                  direction={oppSort.field === 'close' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('close')}
                >
                  Close
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={oppSort.field === 'prob'}
                  direction={oppSort.field === 'prob' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('prob')}
                >
                  Prob
                </TableSortLabel>
              </TableCell>
              <TableCell>Alerts</TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={oppSort.field === 'tasks'}
                  direction={oppSort.field === 'tasks' ? oppSort.dir : 'asc'}
                  onClick={() => handleOppSortClick('tasks')}
                >
                  Tasks
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ width: 80 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.map(({ opp, urgency, overdueTasks, totalTasks }, idx) => {
              const isOverdue = opp.CloseDate && isBefore(parseISO(opp.CloseDate), startOfDay(new Date()));
              const alertsToShow = urgency.reasons.slice(0, 2);
              const overflowCount = urgency.reasons.length - 2;
              const isExpanded = expandedOppId === opp.Id;
              const allTasks = opp.tasks || [];
              const pendingTasks = sortTasks(allTasks.filter((t) => t.Status !== 'Completed'));
              const completedTasks = allTasks.filter((t) => t.Status === 'Completed');
              const showingCompleted = showCompleted[opp.Id] || false;
              const now = startOfDay(new Date());

              return (
                <React.Fragment key={opp.Id}>
                  <TableRow hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {/* Rank */}
                    <TableCell sx={{ px: 1 }}>
                      <Box
                        sx={{
                          bgcolor: urgencyBgColor(urgency.score),
                          color: urgency.score >= 20 ? 'white' : 'text.primary',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {idx + 1}
                      </Box>
                    </TableCell>

                    {/* Opportunity name + account */}
                    <TableCell sx={{ maxWidth: oppNameWidth ?? 220 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {opp.Name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {opp.Account?.Name || 'No Account'}
                      </Typography>
                    </TableCell>

                    {/* Stage */}
                    <TableCell>
                      <Chip
                        label={opp.StageName}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: getStageHexColor(opp.StageName),
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {opp.Amount ? formatDollarMillions(opp.Amount) : '-'}
                      </Typography>
                    </TableCell>

                    {/* Close date */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: isOverdue ? 'error.main' : 'text.primary', fontWeight: isOverdue ? 600 : 400 }}
                      >
                        {opp.CloseDate ? format(parseISO(opp.CloseDate), 'MMM d') : '-'}
                      </Typography>
                    </TableCell>

                    {/* Probability */}
                    <TableCell align="right">
                      <Typography variant="body2">
                        {opp.Probability != null ? `${opp.Probability}%` : '-'}
                      </Typography>
                    </TableCell>

                    {/* Alerts */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {alertsToShow.map((reason, i) => (
                          <Chip
                            key={i}
                            icon={<WarningIcon sx={{ fontSize: '12px !important' }} />}
                            label={reason}
                            size="small"
                            color={urgency.score >= 40 ? 'error' : urgency.score >= 20 ? 'warning' : 'default'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', maxWidth: 180 }}
                          />
                        ))}
                        {overflowCount > 0 && (
                          <Tooltip title={urgency.reasons.slice(2).join(', ')}>
                            <Chip label={`+${overflowCount}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Tasks count — clickable */}
                    <TableCell align="center">
                      {allTasks.length > 0 ? (
                        <Chip
                          label={allTasks.length}
                          size="small"
                          color={overdueTasks > 0 ? 'error' : 'default'}
                          onClick={() => handleTaskCountClick(opp.Id)}
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            minWidth: 28,
                            cursor: 'pointer',
                            fontWeight: isExpanded ? 700 : 400,
                            border: isExpanded ? '2px solid' : undefined,
                            borderColor: isExpanded ? 'primary.main' : undefined,
                          }}
                        />
                      ) : (
                        <Chip
                          label="0"
                          size="small"
                          onClick={() => handleTaskCountClick(opp.Id)}
                          sx={{ height: 20, fontSize: '0.7rem', minWidth: 28, cursor: 'pointer' }}
                        />
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Add Task">
                        <IconButton size="small" onClick={() => onAddTask(opp)}>
                          <AddTaskIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in Pipeline">
                        <IconButton size="small" onClick={() => handleOpenInPipeline(opp)}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expanded task detail row */}
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 1.5, pl: 5, pr: 2 }}>
                          {/* Pending tasks sub-table */}
                          <Table ref={subTableRef} size="small" sx={{ mb: 1 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ width: 24, px: 0.5 }} />
                                <TableCell sx={{ fontWeight: 600, ...(subjectWidth !== null ? { width: subjectWidth } : {}), minWidth: 120, position: 'relative' }}>
                                  <TableSortLabel
                                    active={taskSort.field === 'Subject'}
                                    direction={taskSort.field === 'Subject' ? taskSort.dir : 'asc'}
                                    onClick={() => handleTaskSortChange('Subject')}
                                  >
                                    Subject
                                  </TableSortLabel>
                                  {/* Drag handle */}
                                  <Box
                                    onMouseDown={handleResizeStart}
                                    sx={{
                                      position: 'absolute',
                                      right: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: 4,
                                      cursor: 'col-resize',
                                      '&:hover': { bgcolor: 'primary.main', opacity: 0.3 },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, width: 110 }}>
                                  <TableSortLabel
                                    active={taskSort.field === 'ActivityDate'}
                                    direction={taskSort.field === 'ActivityDate' ? taskSort.dir : 'asc'}
                                    onClick={() => handleTaskSortChange('ActivityDate')}
                                  >
                                    Due Date
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: 110 }}>
                                  <TableSortLabel
                                    active={taskSort.field === 'Status'}
                                    direction={taskSort.field === 'Status' ? taskSort.dir : 'asc'}
                                    onClick={() => handleTaskSortChange('Status')}
                                  >
                                    Status
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: 90 }}>
                                  <TableSortLabel
                                    active={taskSort.field === 'Priority'}
                                    direction={taskSort.field === 'Priority' ? taskSort.dir : 'asc'}
                                    onClick={() => handleTaskSortChange('Priority')}
                                  >
                                    Priority
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: 100 }}>
                                  <TableSortLabel
                                    active={taskSort.field === 'Owner'}
                                    direction={taskSort.field === 'Owner' ? taskSort.dir : 'asc'}
                                    onClick={() => handleTaskSortChange('Owner')}
                                  >
                                    Owner
                                  </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ width: 36 }} />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {pendingTasks.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={9}>
                                    <Typography variant="body2" color="text.secondary">No pending tasks.</Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                              {pendingTasks.map((task) => {
                                const taskOverdue = task.ActivityDate && isBefore(parseISO(task.ActivityDate), now);
                                return (
                                  <TableRow key={task.Id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell sx={{ px: 0.5 }}>
                                      <UncheckedIcon sx={{ fontSize: 16, color: taskOverdue ? 'error.main' : 'text.disabled' }} />
                                    </TableCell>
                                    <TableCell>
                                      <EditableCell
                                        value={task.Subject}
                                        taskId={task.Id}
                                        field="Subject"
                                        onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <EditableCell
                                        value={task.Description || ''}
                                        taskId={task.Id}
                                        field="Description"
                                        type="multiline"
                                        onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <EditableCell
                                        value={task.ActivityDate || ''}
                                        taskId={task.Id}
                                        field="ActivityDate"
                                        type="date"
                                        onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <EditableCell
                                        value={task.Status}
                                        taskId={task.Id}
                                        field="Status"
                                        type="select"
                                        options={STATUS_OPTIONS}
                                        onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <EditableCell
                                        value={task.Priority}
                                        taskId={task.Id}
                                        field="Priority"
                                        type="select"
                                        options={PRIORITY_OPTIONS}
                                        onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {users && users.length > 0 ? (
                                        <EditableCell
                                          value={task.OwnerId || ''}
                                          taskId={task.Id}
                                          field="Owner"
                                          type="select"
                                          options={users}
                                          onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                        />
                                      ) : (
                                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                          {task.OwnerName || '-'}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell sx={{ px: 0.5 }}>
                                      {onOpenTaskDrawer && (
                                        <Tooltip title="Open in drawer">
                                          <IconButton
                                            size="small"
                                            onClick={() => onOpenTaskDrawer(opp, task.Id)}
                                          >
                                            <OpenInFullIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}

                              {/* Add Task row */}
                              <AddTaskRow
                                oppId={opp.Id}
                                users={users}
                                onCreated={(task) => handleTaskCreated(opp, task)}
                              />
                            </TableBody>
                          </Table>

                          {/* Completed tasks — collapsed by default */}
                          {completedTasks.length > 0 && (
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  gap: 0.5,
                                  py: 0.5,
                                  '&:hover': { color: 'primary.main' },
                                }}
                                onClick={() =>
                                  setShowCompleted((prev) => ({ ...prev, [opp.Id]: !prev[opp.Id] }))
                                }
                              >
                                {showingCompleted ? (
                                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                                ) : (
                                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {completedTasks.length} completed task{completedTasks.length > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                              <Collapse in={showingCompleted} timeout="auto">
                                <Table size="small">
                                  <TableBody>
                                    {completedTasks.map((task) => (
                                      <TableRow key={task.Id} sx={{ '&:last-child td': { borderBottom: 0 }, opacity: 0.6 }}>
                                        <TableCell sx={{ width: 24, px: 0.5 }}>
                                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{
                                            textDecoration: 'line-through',
                                            fontSize: '0.8rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                          }}>
                                            {task.Subject}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          {task.Description ? (
                                            <Tooltip title={task.Description} placement="bottom-start">
                                              <Typography variant="body2" sx={{
                                                fontSize: '0.75rem',
                                                color: 'text.secondary',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                              }}>
                                                {task.Description}
                                              </Typography>
                                            </Tooltip>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>-</Typography>
                                          )}
                                        </TableCell>
                                        <TableCell sx={{ width: 110 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {task.ActivityDate ? format(parseISO(task.ActivityDate), 'MMM d') : '-'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: 110 }}>
                                          <EditableCell
                                            value={task.Status}
                                            taskId={task.Id}
                                            field="Status"
                                            readOnly
                                            onSave={(tid, f, v) => handleInlineTaskSave(opp, tid, f, v)}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ width: 80 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            {task.Priority || 'Normal'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: 100 }}>
                                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                            {task.OwnerName || '-'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: 36 }} />
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Collapse>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      )}
    </Box>
  );
};

export default PriorityTable;
