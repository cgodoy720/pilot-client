import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Popover,
  IconButton,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  EventAvailable as CalendarCheckIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
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
  weekOffset?: number;
  onWeekOffsetChange?: (offset: number) => void;
  sources?: CalendarSource[];
  enabledSources?: string[];
  onToggleSource?: (sourceId: string) => void;
  onTaskClick?: (taskId: string, whatId: string) => void;
  timeGridHeight?: number;
  onTimeGridHeightChange?: (height: number) => void;
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
const MIN_COL_WIDTH = 110; // px — minimum day column width before horizontal scroll
const GUTTER_WIDTH = 50;   // px — time label / icon column

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
  weekOffset: controlledWeekOffset,
  onWeekOffsetChange,
  sources = DEFAULT_SOURCES,
  enabledSources: controlledEnabledSources,
  onToggleSource,
  onTaskClick,
  timeGridHeight: controlledTimeGridHeight,
  onTimeGridHeightChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<CalendarViewMode>('week');
  const viewMode = controlledViewMode ?? internalViewMode;
  const timeGridHeight = controlledTimeGridHeight ?? 520;

  const [internalWeekOffset, setInternalWeekOffset] = useState(0);
  const weekOffset = controlledWeekOffset ?? internalWeekOffset;
  const setWeekOffset = onWeekOffsetChange ?? setInternalWeekOffset;

  const [internalEnabled, setInternalEnabled] = useState<Set<string>>(
    new Set(sources.map((s) => s.id)),
  );
  const enabledSet = controlledEnabledSources
    ? new Set(controlledEnabledSources)
    : internalEnabled;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [eventAnchorEl, setEventAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const closeEventPopover = useCallback(() => {
    setEventAnchorEl(null);
    setSelectedEvent(null);
  }, []);

  const handleViewChange = (_: any, newMode: CalendarViewMode | null) => {
    if (!newMode) return;
    if (newMode === 'day') setWeekOffset(0);
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
    const start = viewMode === 'day'
      ? today
      : startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    const count = VIEW_DAYS[viewMode];
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [viewMode, weekOffset]);

  // Shared grid layout — guarantees column alignment across all sections
  const minGridWidth = GUTTER_WIDTH + days.length * MIN_COL_WIDTH;
  const gridCols = `${GUTTER_WIDTH}px repeat(${days.length}, minmax(${MIN_COL_WIDTH}px, 1fr))`;

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
      const nowLine = gridRef.current.querySelector('[data-now-line]') as HTMLElement;
      if (nowLine) {
        // Scroll the container (not the page) so the now-line is centered
        const containerHeight = gridRef.current.clientHeight;
        const nowTop = nowLine.offsetTop;
        gridRef.current.scrollTop = Math.max(0, nowTop - containerHeight / 2);
      }
    }
  }, [loading, viewMode]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {format(days[0], 'MMM d')} — {format(days[days.length - 1], 'MMM d, yyyy')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {viewMode !== 'day' && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={weekOffset}
              onChange={(_, val) => { if (val !== null) setWeekOffset(val); }}
            >
              <ToggleButton value={0} sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.75rem' }}>This Week</ToggleButton>
              <ToggleButton value={1} sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.75rem' }}>Next Week</ToggleButton>
            </ToggleButtonGroup>
          )}
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <CalendarCheckIcon fontSize="small" />
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
            <ToggleButton value="day" sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.75rem' }}>Day</ToggleButton>
            <ToggleButton value="week" sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.75rem' }}>Week</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading events...</Typography>
        </Box>
      ) : (
        <Box ref={gridRef} sx={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
          {/* Day headers — sticky at top during vertical scroll */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              minWidth: minGridWidth,
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 0.5,
              mb: 0,
              position: 'sticky',
              top: 0,
              zIndex: 5,
              bgcolor: 'background.paper',
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

          {/* All-day row: tasks (below day headers for alignment) */}
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
                  gridTemplateColumns: gridCols,
                  minWidth: minGridWidth,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TaskIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                </Box>
                {days.map((day, di) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const tasks = eventsByDay.get(key)?.tasks || [];
                  return (
                    <Box
                      key={key}
                      sx={{
                        px: 0.25,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                        py: 0.25,
                        borderLeft: di > 0 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      {tasks.map((ev, i) => {
                        const borderColor = getTaskBorderColor(ev);
                        const isCompleted = ev.status === 'Completed';
                        const hasOpp = ev.whatId && onTaskClick;
                        return (
                          <Tooltip
                            key={ev.id + i}
                            title={hasOpp ? 'Open in task panel' : 'No linked opportunity'}
                            placement="top"
                            arrow
                          >
                            <Box
                              onClick={(e) => {
                                if (hasOpp) {
                                  onTaskClick!(ev.id, ev.whatId!);
                                } else {
                                  setSelectedEvent(ev);
                                  setEventAnchorEl(e.currentTarget as HTMLElement);
                                }
                              }}
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
                          </Tooltip>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            );
          })()}

          {/* Time grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              minWidth: minGridWidth,
              position: 'relative',
            }}
          >
            {/* Hour labels column — sticky left during horizontal scroll */}
            <Box sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
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
                    const attendeeCount = (ev.attendees || []).length;

                    return (
                      <Box
                        key={ev.id + i}
                        onClick={(e) => {
                          setSelectedEvent(ev);
                          setEventAnchorEl(e.currentTarget as HTMLElement);
                        }}
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
                            {(ev.attendees || []).map((a: any) => a.name || a.email).filter(Boolean).slice(0, 3).join(', ')}
                            {attendeeCount > 3 ? ` +${attendeeCount - 3}` : ''}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>

          {/* Calendar height resize handle */}
          {onTimeGridHeightChange && (
            <Box
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = timeGridHeight;
                const onMove = (me: MouseEvent) => {
                  const newH = Math.min(800, Math.max(200, startHeight + me.clientY - startY));
                  onTimeGridHeightChange(newH);
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              sx={{
                height: 8,
                cursor: 'row-resize',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover > div': { bgcolor: 'primary.main' },
              }}
            >
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', transition: 'background-color 0.15s' }} />
            </Box>
          )}
        </Box>
      )}

      {/* Event / orphan-task detail popover */}
      <Popover
        open={Boolean(eventAnchorEl) && Boolean(selectedEvent)}
        anchorEl={eventAnchorEl}
        onClose={closeEventPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxWidth: 340, p: 1.5, position: 'relative' } } }}
      >
        {selectedEvent && (
          <>
            <IconButton
              size="small"
              onClick={closeEventPopover}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, pr: 3 }}>
              {selectedEvent.summary}
            </Typography>

            {selectedEvent.type === 'gcal' && (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {formatTime(selectedEvent.start)}
                  {selectedEvent.end ? ` \u2013 ${formatTime(selectedEvent.end)}` : ''}
                </Typography>
                {selectedEvent.location && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {selectedEvent.location}
                  </Typography>
                )}
                {selectedEvent.description && (
                  <Typography variant="caption" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {selectedEvent.description.length > 200 ? selectedEvent.description.slice(0, 200) + '\u2026' : selectedEvent.description}
                  </Typography>
                )}
                {(selectedEvent.attendees?.length || 0) > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    {selectedEvent.attendees!.slice(0, 5).map(a => a.name || a.email).filter(Boolean).join(', ')}
                    {selectedEvent.attendees!.length > 5 ? ` +${selectedEvent.attendees!.length - 5} more` : ''}
                  </Typography>
                )}
              </>
            )}

            {selectedEvent.type === 'task' && (
              <>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  {selectedEvent.status && <Chip label={selectedEvent.status} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                  {selectedEvent.priority && <Chip label={selectedEvent.priority} size="small" sx={{ height: 20, fontSize: '0.7rem' }} variant="outlined" />}
                </Box>
                {selectedEvent.opportunityName && (
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                    Opp: {selectedEvent.opportunityName}
                  </Typography>
                )}
                {selectedEvent.description && (
                  <Typography variant="caption" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {selectedEvent.description.length > 200 ? selectedEvent.description.slice(0, 200) + '\u2026' : selectedEvent.description}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Popover>
    </Box>
  );
};

export default WeeklyCalendar;
