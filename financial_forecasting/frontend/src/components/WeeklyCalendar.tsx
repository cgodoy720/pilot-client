import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
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

// Time-axis constants
const DAY_START = 7;  // 7 AM
const DAY_END = 20;   // 8 PM
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

function getTimeTop(dateStr: string): number {
  try {
    const d = parseISO(dateStr);
    const hours = d.getHours() + d.getMinutes() / 60;
    const clamped = Math.max(DAY_START, Math.min(DAY_END, hours));
    return ((clamped - DAY_START) / (DAY_END - DAY_START)) * 100;
  } catch { return 0; }
}

function getEventHeight(startStr: string, endStr?: string): number {
  if (!endStr) return (0.5 / (DAY_END - DAY_START)) * 100; // 30min default
  const startPct = getTimeTop(startStr);
  const endPct = getTimeTop(endStr);
  return Math.max(endPct - startPct, (0.25 / (DAY_END - DAY_START)) * 100); // min 15min
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
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
  const taskColor = sources.find((s) => s.type === 'task')?.color || '#ed6c02';

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loading && gridRef.current) {
      const nowLine = gridRef.current.querySelector('[data-now-line]');
      if (nowLine) nowLine.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [loading, viewMode]);

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
        <Box ref={gridRef}>
          {/* All-day row: tasks (no specific time) */}
          {(() => {
            const allDayTasks = days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              return eventsByDay.get(key)?.tasks || [];
            });
            const hasAnyTasks = allDayTasks.some((t) => t.length > 0);
            if (!hasAnyTasks) return null;
            return (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `50px repeat(${days.length}, 1fr)`,
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TaskIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                </Box>
                {days.map((day, di) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const tasks = eventsByDay.get(key)?.tasks || [];
                  return (
                    <Box key={key} sx={{ px: 0.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {tasks.map((ev, i) => {
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
                                <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                              ) : (
                                <TaskIcon sx={{ fontSize: 14, color: borderColor }} />
                              )}
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  fontSize: '0.7rem',
                                  lineHeight: 1.2,
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                  color: isCompleted ? 'text.secondary' : 'text.primary',
                                }}
                              >
                                {truncate(ev.summary, viewMode === 'day' ? 60 : 20)}
                              </Typography>
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
                                  <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4, mt: 0.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
                  );
                })}
              </Box>
            );
          })()}

          {/* Day headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `50px repeat(${days.length}, 1fr)`,
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 0.5,
              mb: 0,
            }}
          >
            <Box /> {/* spacer for time column */}
            {days.map((day) => {
              const today = isTodayFn(day);
              return (
                <Box key={format(day, 'yyyy-MM-dd')} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: today ? 700 : 500, color: today ? 'primary.main' : 'text.secondary', fontSize: '0.75rem' }}
                  >
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: today ? 700 : 400,
                      bgcolor: today ? 'primary.main' : 'transparent',
                      color: today ? 'white' : 'text.primary',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      mx: 'auto',
                      fontSize: '0.8rem',
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Time grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `50px repeat(${days.length}, 1fr)`,
              maxHeight: 520,
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Hour labels column */}
            <Box sx={{ position: 'relative' }}>
              {HOURS.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    pr: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', lineHeight: 1, mt: '-4px' }}>
                    {formatHourLabel(hour)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const { meetings } = eventsByDay.get(key) || { meetings: [], tasks: [] };
              const today = isTodayFn(day);

              return (
                <Box
                  key={key}
                  sx={{
                    position: 'relative',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    height: HOURS.length * 40,
                  }}
                >
                  {/* Horizontal grid lines */}
                  {HOURS.map((hour) => (
                    <Box
                      key={hour}
                      sx={{
                        position: 'absolute',
                        top: `${((hour - DAY_START) / (DAY_END - DAY_START)) * 100}%`,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        opacity: 0.5,
                      }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {today && (
                    <Box
                      data-now-line
                      sx={{
                        position: 'absolute',
                        top: `${getTimeTop(new Date().toISOString())}%`,
                        left: 0,
                        right: 0,
                        height: 2,
                        bgcolor: '#d32f2f',
                        zIndex: 3,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -3,
                          top: -3,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#d32f2f',
                        },
                      }}
                    />
                  )}

                  {/* Meeting blocks */}
                  {meetings.map((ev, i) => {
                    const top = getTimeTop(ev.start);
                    const height = getEventHeight(ev.start, ev.end);
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
                            position: 'absolute',
                            top: `${top}%`,
                            height: `${height}%`,
                            left: 2,
                            right: 2,
                            bgcolor: `${meetingColor}18`,
                            borderLeft: `3px solid ${meetingColor}`,
                            borderRadius: 0.5,
                            px: 0.5,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            zIndex: 1,
                            '&:hover': { bgcolor: `${meetingColor}28`, zIndex: 2 },
                          }}
                        >
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.3, display: 'block' }}
                          >
                            {truncate(ev.summary, viewMode === 'day' ? 60 : TITLE_TRUNCATE_LEN)}
                          </Typography>
                          <Typography variant="caption" noWrap sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1 }}>
                            {time}{endTime ? ` – ${endTime}` : ''}
                          </Typography>
                          {viewMode === 'day' && attendeeCount > 0 && (
                            <Typography variant="caption" noWrap sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block' }}>
                              {attendeeNames.slice(0, 3).join(', ')}{attendeeCount > 3 ? ` +${attendeeCount - 3}` : ''}
                            </Typography>
                          )}
                        </Box>
                        <Collapse in={isExpanded} sx={{ position: 'relative', zIndex: 10 }}>
                          <Paper elevation={4} sx={{ p: 1, mx: 0.5, mb: 0.5 }}>
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
                              <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4, mt: 0.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {ev.description.length > 200 ? ev.description.slice(0, 200) + '…' : ev.description}
                              </Typography>
                            )}
                            {attendeeCount > 0 && (
                              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                {attendeeNames.join(', ')}
                                {attendeeCount > 5 ? ` +${attendeeCount - 5} more` : ''}
                              </Typography>
                            )}
                          </Paper>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WeeklyCalendar;
