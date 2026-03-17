import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

export type CalendarViewMode = 'day' | 'week' | '2week';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end?: string;
  attendees?: string[];
  location?: string;
  type: 'gcal' | 'task';
  opportunityName?: string;
  accountName?: string;
  status?: string;
  priority?: string;
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  loading?: boolean;
  viewMode?: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
}

const VIEW_DAYS: Record<CalendarViewMode, number> = {
  day: 1,
  week: 7,
  '2week': 14,
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  events,
  loading = false,
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<CalendarViewMode>('week');
  const viewMode = controlledViewMode ?? internalViewMode;

  const handleViewChange = (_: any, newMode: CalendarViewMode | null) => {
    if (!newMode) return;
    if (onViewModeChange) onViewModeChange(newMode);
    else setInternalViewMode(newMode);
  };

  // Generate day columns
  const days = useMemo(() => {
    const today = new Date();
    const start = viewMode === 'day' ? today : startOfWeek(today, { weekStartsOn: 1 });
    const count = VIEW_DAYS[viewMode];
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [viewMode]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) {
      map.set(format(day, 'yyyy-MM-dd'), []);
    }
    for (const ev of events) {
      if (!ev.start) continue;
      try {
        const evDate = parseISO(ev.start);
        for (const day of days) {
          if (isSameDay(evDate, day)) {
            const key = format(day, 'yyyy-MM-dd');
            map.get(key)?.push(ev);
            break;
          }
        }
      } catch {}
    }
    return map;
  }, [events, days]);

  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <Box>
      {/* View mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {format(days[0], 'MMM d')} — {format(days[days.length - 1], 'MMM d, yyyy')}
        </Typography>
        <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={handleViewChange}>
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="2week">2 Week</ToggleButton>
        </ToggleButtonGroup>
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
            ...(days.length > 7 ? { '& > *:nth-of-type(n+8)': {} } : {}),
          }}
        >
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) || [];
            const today = isToday(day);

            return (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  p: 1,
                  minHeight: 120,
                  bgcolor: today ? 'primary.50' : 'background.paper',
                  borderColor: today ? 'primary.main' : 'divider',
                  borderWidth: today ? 2 : 1,
                }}
              >
                {/* Day header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: today ? 700 : 500,
                      color: today ? 'primary.main' : 'text.secondary',
                    }}
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

                {/* Events */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {dayEvents.slice(0, 5).map((ev, i) => (
                    <Tooltip
                      key={ev.id + i}
                      title={
                        <Box>
                          <Typography variant="body2">{ev.summary}</Typography>
                          {ev.start && (
                            <Typography variant="caption">
                              {(() => {
                                try { return format(parseISO(ev.start), 'h:mm a'); } catch { return ''; }
                              })()}
                            </Typography>
                          )}
                          {ev.accountName && (
                            <Typography variant="caption" display="block">
                              Account: {ev.accountName}
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          bgcolor: ev.type === 'task' ? 'warning.50' : 'info.50',
                          borderLeft: `3px solid`,
                          borderLeftColor: ev.type === 'task'
                            ? (ev.priority === 'High' ? 'error.main' : 'warning.main')
                            : 'info.main',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: ev.type === 'task' ? 'warning.100' : 'info.100' },
                          overflow: 'hidden',
                        }}
                      >
                        {ev.type === 'task' ? (
                          <TaskIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                        ) : (
                          <EventIcon sx={{ fontSize: 12, color: 'info.main' }} />
                        )}
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                          {ev.summary}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                  {dayEvents.length > 5 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                      +{dayEvents.length - 5} more
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default WeeklyCalendar;
