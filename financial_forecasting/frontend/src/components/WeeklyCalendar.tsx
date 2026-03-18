import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Popover,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as TaskIcon,
  Tune as TuneIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isBefore,
  parseISO,
  startOfDay,
  differenceInDays,
} from 'date-fns';

export type CalendarViewMode = 'day' | 'week' | '2week';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end?: string;
  attendees?: Array<{ name?: string; email?: string }>;
  location?: string;
  description?: string;
  type: 'gcal' | 'task';
  opportunityName?: string;
  accountName?: string;
  status?: string;
  priority?: string;
  whatId?: string;
}

export interface CalendarSource {
  id: string;
  label: string;
  type: 'gcal' | 'task';
  color: string;
  iconKey?: 'meeting' | 'task'; // optional; defaults derived from type
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  loading?: boolean;
  viewMode?: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
  sources?: CalendarSource[];
  enabledSources?: string[];
  onToggleSource?: (sourceId: string) => void;
  onTaskClick?: (taskId: string, whatId: string) => void;
}

const VIEW_DAYS: Record<CalendarViewMode, number> = {
  day: 1,
  week: 7,
  '2week': 14,
};

const DEFAULT_SOURCES: CalendarSource[] = [
  { id: 'gcal-pbd', label: 'PBD Calendar', type: 'gcal', color: '#1976d2' },
  { id: 'sf-tasks', label: 'Salesforce Tasks', type: 'task', color: '#ed6c02' },
];

const MAX_VISIBLE_ITEMS = 6;
const TITLE_TRUNCATE_LEN = 40;

function truncate(str: string, len: number): string {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len) + '…';
}

function getTaskBorderColor(ev: CalendarEvent): string {
  if (ev.status === 'Completed') return '#4caf50';
  const now = startOfDay(new Date());
  if (ev.start) {
    try {
      const due = parseISO(ev.start);
      const diff = differenceInDays(due, now);
      if (isBefore(due, now)) return '#d32f2f';
      if (diff <= 1) return '#ed6c02';
    } catch {}
  }
  if (ev.priority === 'High') return '#ed6c02';
  return '#bdbdbd';
}

function formatTime(dateStr: string): string {
  try { return format(parseISO(dateStr), 'h:mm a'); }
  catch { return ''; }
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  events,
  loading = false,
  viewMode: controlledViewMode,
  onViewModeChange,
  sources = DEFAULT_SOURCES,
  enabledSources: controlledEnabledSources,
  onToggleSource,
  onTaskClick,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<CalendarViewMode>('week');
  const viewMode = controlledViewMode ?? internalViewMode;

  const [internalEnabled, setInternalEnabled] = useState<Set<string>>(
    new Set(sources.map((s) => s.id)),
  );
  const enabledSet = controlledEnabledSources
    ? new Set(controlledEnabledSources)
    : internalEnabled;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  }, []);

  const handleTaskEdit = useCallback(
    (ev: CalendarEvent) => {
      if (ev.whatId && onTaskClick) {
        onTaskClick(ev.id, ev.whatId);
        setExpandedEventId(null);
      }
    },
    [onTaskClick]
  );

  const handleViewChange = (_: any, newMode: CalendarViewMode | null) => {
    if (!newMode) return;
    if (onViewModeChange) onViewModeChange(newMode);
    else setInternalViewMode(newMode);
  };

  const handleToggle = (sourceId: string) => {
    if (onToggleSource) {
      onToggleSource(sourceId);
    } else {
      setInternalEnabled((prev) => {
        const next = new Set(prev);
        if (next.has(sourceId)) next.delete(sourceId);
        else next.add(sourceId);
        return next;
      });
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const src = sources.find((s) => s.type === ev.type);
      return src ? enabledSet.has(src.id) : true;
    });
  }, [events, sources, enabledSet]);

  const days = useMemo(() => {
    const today = new Date();
    const start = viewMode === 'day' ? today : startOfWeek(today, { weekStartsOn: 1 });
    const count = VIEW_DAYS[viewMode];
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [viewMode]);

  // Group events by day, split into meetings (gcal) and tasks
  const eventsByDay = useMemo(() => {
    const map = new Map<string, { meetings: CalendarEvent[]; tasks: CalendarEvent[] }>();
    for (const day of days) {
      map.set(format(day, 'yyyy-MM-dd'), { meetings: [], tasks: [] });
    }
    for (const ev of filteredEvents) {
      if (!ev.start) continue;
      try {
        const evDate = parseISO(ev.start);
        for (const day of days) {
          if (isSameDay(evDate, day)) {
            const entry = map.get(format(day, 'yyyy-MM-dd'));
            if (entry) {
              if (ev.type === 'task') entry.tasks.push(ev);
              else entry.meetings.push(ev);
            }
            break;
          }
        }
      } catch {}
    }
    // Sort meetings by start time, tasks by due date
    map.forEach((entry) => {
      entry.meetings.sort((a: CalendarEvent, b: CalendarEvent) => (a.start || '').localeCompare(b.start || ''));
      entry.tasks.sort((a: CalendarEvent, b: CalendarEvent) => (a.start || '').localeCompare(b.start || ''));
    });
    return map;
  }, [filteredEvents, days]);

  const isTodayFn = (d: Date) => isSameDay(d, new Date());
  const meetingColor = sources.find((s) => s.type === 'gcal')?.color || '#1976d2';

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {format(days[0], 'MMM d')} — {format(days[days.length - 1], 'MMM d, yyyy')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <TuneIcon fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Calendars</Typography>
              {sources.map((src) => (
                <FormControlLabel
                  key={src.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={enabledSet.has(src.id)}
                      onChange={() => handleToggle(src.id)}
                      sx={{ color: src.color, '&.Mui-checked': { color: src.color } }}
                    />
                  }
                  label={<Typography variant="body2">{src.label}</Typography>}
                />
              ))}
            </Box>
          </Popover>

          <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={handleViewChange}>
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="2week">2 Week</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading events...</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(days.length, 7)}, 1fr)`,
            gap: 0.5,
          }}
        >
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const { meetings, tasks } = eventsByDay.get(key) || { meetings: [], tasks: [] };
            const today = isTodayFn(day);
            const totalItems = meetings.length + tasks.length;
            const overflow = totalItems > MAX_VISIBLE_ITEMS;
            const meetingsToShow = meetings.slice(0, MAX_VISIBLE_ITEMS);
            const tasksSlots = Math.max(0, MAX_VISIBLE_ITEMS - meetingsToShow.length);
            const tasksToShow = tasks.slice(0, tasksSlots);

            return (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  p: 1,
                  minHeight: 160,
                  bgcolor: today ? 'primary.50' : 'background.paper',
                  borderColor: today ? 'primary.main' : 'divider',
                  borderWidth: today ? 2 : 1,
                }}
              >
                {/* Day header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: today ? 700 : 500, color: today ? 'primary.main' : 'text.secondary' }}
                  >
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: today ? 700 : 400,
                      bgcolor: today ? 'primary.main' : 'transparent',
                      color: today ? 'white' : 'text.primary',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>

                {/* Meetings */}
                {meetingsToShow.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: tasksToShow.length > 0 ? 0.75 : 0 }}>
                    {meetingsToShow.map((ev, i) => {
                      const time = formatTime(ev.start);
                      const endTime = ev.end ? formatTime(ev.end) : '';
                      const isExpanded = expandedEventId === ev.id;
                      const attendeeNames = (ev.attendees || [])
                        .map((a: any) => a.name || a.email).filter(Boolean).slice(0, 5);
                      const attendeeCount = (ev.attendees || []).length;
                      return (
                        <Box key={ev.id + i}>
                          <Box
                            onClick={() => toggleExpand(ev.id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              bgcolor: `${meetingColor}14`,
                              borderLeft: `3px solid ${meetingColor}`,
                              cursor: 'pointer',
                              overflow: 'hidden',
                              '&:hover': { bgcolor: `${meetingColor}22` },
                            }}
                          >
                            <Tooltip title="Meeting">
                              <EventIcon sx={{ fontSize: 18, color: meetingColor }} />
                            </Tooltip>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {truncate(ev.summary, TITLE_TRUNCATE_LEN)}
                              </Typography>
                              {time && (
                                <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1 }}>
                                  {time}{endTime ? ` – ${endTime}` : ''}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Collapse in={isExpanded}>
                            <Box sx={{ pl: 2, pr: 0.5, py: 0.5, mb: 0.5, borderLeft: `2px solid ${meetingColor}40` }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>
                                {ev.summary}
                              </Typography>
                              {time && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                                  {time}{endTime ? ` – ${endTime}` : ''}
                                </Typography>
                              )}
                              {ev.location && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                                  {ev.location}
                                </Typography>
                              )}
                              {ev.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.75rem',
                                    lineHeight: 1.4,
                                    mt: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {ev.description.length > 200 ? ev.description.slice(0, 200) + '…' : ev.description}
                                </Typography>
                              )}
                              {attendeeCount > 0 && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                  {attendeeNames.join(', ')}
                                  {attendeeCount > 5 ? ` +${attendeeCount - 5} more` : ''}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Tasks */}
                {tasksToShow.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {tasksToShow.map((ev, i) => {
                      const borderColor = getTaskBorderColor(ev);
                      const isCompleted = ev.status === 'Completed';
                      const isExpanded = expandedEventId === ev.id;
                      const canEdit = ev.whatId && onTaskClick;
                      return (
                        <Box key={ev.id + i}>
                          <Box
                            onClick={() => toggleExpand(ev.id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 0.5,
                              bgcolor: isCompleted ? 'grey.50' : 'transparent',
                              borderLeft: `3px solid ${borderColor}`,
                              cursor: 'pointer',
                              overflow: 'hidden',
                              opacity: isCompleted ? 0.6 : 1,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            {isCompleted ? (
                              <Tooltip title="Task (completed)">
                                <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Task">
                                <TaskIcon sx={{ fontSize: 18, color: borderColor }} />
                              </Tooltip>
                            )}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.8rem',
                                  lineHeight: 1.2,
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                  color: isCompleted ? 'text.secondary' : 'text.primary',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {truncate(ev.summary, TITLE_TRUNCATE_LEN)}
                              </Typography>
                              {ev.status && (
                                <Chip
                                  label={ev.status}
                                  size="small"
                                  sx={{ height: 16, fontSize: '0.65rem', mt: 0.25 }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Collapse in={isExpanded}>
                            <Box sx={{ pl: 2, pr: 0.5, py: 0.5, mb: 0.5, borderLeft: `2px solid ${borderColor}80` }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>
                                {ev.summary}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                                {ev.status && <Chip label={ev.status} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                {ev.priority && <Chip label={ev.priority} size="small" sx={{ height: 20, fontSize: '0.7rem' }} variant="outlined" />}
                              </Box>
                              {ev.opportunityName && (
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                                  Opp: {ev.opportunityName}
                                </Typography>
                              )}
                              {ev.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.75rem',
                                    lineHeight: 1.4,
                                    mt: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {ev.description.length > 200 ? ev.description.slice(0, 200) + '…' : ev.description}
                                </Typography>
                              )}
                              {canEdit && (
                                <Button
                                  size="small"
                                  startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                                  onClick={(e) => { e.stopPropagation(); handleTaskEdit(ev); }}
                                  sx={{ mt: 0.5, fontSize: '0.75rem', minWidth: 0, px: 1 }}
                                >
                                  Edit in panel
                                </Button>
                              )}
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Overflow */}
                {overflow && (
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5, mt: 0.25, display: 'block', fontSize: '0.65rem' }}>
                    +{totalItems - MAX_VISIBLE_ITEMS} more
                  </Typography>
                )}

                {/* Empty day */}
                {totalItems === 0 && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                    No events
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default WeeklyCalendar;
