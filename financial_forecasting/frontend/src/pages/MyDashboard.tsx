import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Star as PriorityIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as WeightedIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  format,
  parseISO,
  startOfWeek,
  endOfDay,
  addDays,
  startOfDay,
} from 'date-fns';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import WeeklyCalendar, { CalendarEvent, CalendarViewMode } from '../components/WeeklyCalendar';
import PriorityList, { PriorityOpp } from '../components/PriorityList';

const PREFS_KEY = 'pursuit-priorities-prefs';

const OPEN_STAGES = [
  'Lead Gen', 'New Lead', 'Qualifying',
  'Design / Proposal Creation', 'Proposal Negotiation',
  'Contract Creation', 'Negotiating Contract',
];

interface DashboardPrefs {
  collapsed: Record<string, boolean>;
  calendarView: CalendarViewMode;
}

function loadPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { collapsed: {}, calendarView: 'week' };
}

function savePrefs(prefs: DashboardPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// Collapsible section wrapper
function Section({
  id,
  title,
  icon,
  collapsed,
  onToggle,
  badge,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
          {badge}
        </Box>
        <IconButton size="small">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!collapsed}>
        <CardContent sx={{ pt: 0 }}>{children}</CardContent>
      </Collapse>
    </Card>
  );
}

const MyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadPrefs);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const toggleSection = (id: string) =>
    setPrefs((p) => ({ ...p, collapsed: { ...p.collapsed, [id]: !p.collapsed[id] } }));
  const setCalendarView = (view: CalendarViewMode) =>
    setPrefs((p) => ({ ...p, calendarView: view }));

  // Compute date range for calendar
  const { calStart, calEnd, calDaysForward } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const daysForward = prefs.calendarView === 'day' ? 1 : prefs.calendarView === 'week' ? 7 : 14;
    const end = addDays(weekStart, daysForward);
    return {
      calStart: format(weekStart, 'yyyy-MM-dd'),
      calEnd: format(end, 'yyyy-MM-dd'),
      calDaysForward: daysForward,
    };
  }, [prefs.calendarView]);

  // Fetch opportunities
  const { data: oppsData, isLoading: oppsLoading } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  // Fetch my tasks
  const { data: tasksData } = useQuery(
    ['my-tasks', calStart, calEnd],
    async () => {
      const response = await apiService.getMyTasks(calStart, calEnd);
      return response.data?.data || response.data || [];
    },
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch calendar events
  const { data: calEventsData, isLoading: calLoading } = useQuery(
    ['my-calendar-events', calStart, calEnd],
    async () => {
      const response = await apiService.getMyCalendarEvents(calStart, calEnd);
      return response.data?.data || response.data || [];
    },
    { staleTime: 5 * 60 * 1000, enabled: !prefs.collapsed['calendar'] }
  );

  const allOpportunities = useMemo(() => {
    const raw = Array.isArray(oppsData)
      ? oppsData
      : (oppsData?.opportunities || oppsData?.data || []);
    return raw as any[];
  }, [oppsData]);

  // User's opportunities
  const sfUserId = user?.salesforce_user_id;
  const myOpportunities = useMemo(() => {
    if (!sfUserId) return allOpportunities;
    return allOpportunities.filter((opp: any) => opp.OwnerId === sfUserId);
  }, [allOpportunities, sfUserId]);

  const myOpenOpps = useMemo(
    () => myOpportunities.filter((opp: any) => OPEN_STAGES.includes(opp.StageName)),
    [myOpportunities]
  );

  // Map tasks to their parent opportunities
  const sfTasks = useMemo(() => (Array.isArray(tasksData) ? tasksData : []), [tasksData]);

  // Build calendar events from GCal + SF Tasks
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // GCal events
    const gcalEvents = Array.isArray(calEventsData) ? calEventsData : [];
    for (const ev of gcalEvents) {
      events.push({
        id: ev.id || `gcal-${events.length}`,
        summary: ev.summary || 'Untitled',
        start: ev.start || '',
        end: ev.end || '',
        attendees: ev.attendees || [],
        location: ev.location || '',
        type: 'gcal',
      });
    }

    // SF Tasks
    for (const task of sfTasks) {
      if (!task.ActivityDate) continue;
      events.push({
        id: task.Id || `task-${events.length}`,
        summary: task.Subject || 'Untitled Task',
        start: task.ActivityDate,
        type: 'task',
        priority: task.Priority,
        status: task.Status,
      });
    }

    return events;
  }, [calEventsData, sfTasks]);

  // Build priority opportunities with tasks attached
  const priorityOpps: PriorityOpp[] = useMemo(() => {
    // Group tasks by WhatId (opportunity ID)
    const tasksByOppId = new Map<string, any[]>();
    for (const task of sfTasks) {
      if (!task.WhatId) continue;
      if (!tasksByOppId.has(task.WhatId)) tasksByOppId.set(task.WhatId, []);
      tasksByOppId.get(task.WhatId)!.push(task);
    }

    return myOpenOpps.map((opp: any) => ({
      Id: opp.Id,
      Name: opp.Name,
      StageName: opp.StageName,
      Amount: opp.Amount || 0,
      CloseDate: opp.CloseDate || '',
      Probability: opp.Probability || 0,
      OwnerId: opp.OwnerId,
      Account: opp.Account,
      LastModifiedDate: opp.LastModifiedDate,
      tasks: tasksByOppId.get(opp.Id) || [],
    }));
  }, [myOpenOpps, sfTasks]);

  // Pipeline summary stats
  const pipelineStats = useMemo(() => {
    const count = myOpenOpps.length;
    const total = myOpenOpps.reduce((sum: number, opp: any) => sum + (opp.Amount || 0), 0);
    const weighted = myOpenOpps.reduce(
      (sum: number, opp: any) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );
    // Deals closing this month
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const closingThisMonth = myOpenOpps.filter((opp: any) => {
      if (!opp.CloseDate) return false;
      const d = parseISO(opp.CloseDate);
      return d >= startOfDay(now) && d <= endOfDay(monthEnd);
    });
    const closingAmount = closingThisMonth.reduce((s: number, o: any) => s + (o.Amount || 0), 0);
    return { count, total, weighted, closingThisMonth: closingThisMonth.length, closingAmount };
  }, [myOpenOpps]);

  if (oppsLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading your priorities...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">My Priorities</Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your weekly priorities'}
          </Typography>
        </Box>
      </Box>

      {!sfUserId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect Salesforce to filter by your ownership. Currently showing all opportunities.
        </Alert>
      )}

      {/* Section 1: Weekly Calendar */}
      <Section
        id="calendar"
        title="Weekly Calendar"
        icon={<CalendarIcon color="primary" />}
        collapsed={!!prefs.collapsed['calendar']}
        onToggle={() => toggleSection('calendar')}
        badge={
          calendarEvents.length > 0 ? (
            <Chip label={`${calendarEvents.length} events`} size="small" />
          ) : undefined
        }
      >
        <WeeklyCalendar
          events={calendarEvents}
          loading={calLoading}
          viewMode={prefs.calendarView}
          onViewModeChange={setCalendarView}
        />
      </Section>

      {/* Section 2: Priority Opportunities */}
      <Section
        id="priorities"
        title="Priority Opportunities"
        icon={<PriorityIcon color="primary" />}
        collapsed={!!prefs.collapsed['priorities']}
        onToggle={() => toggleSection('priorities')}
        badge={
          myOpenOpps.length > 0 ? (
            <Chip label={`${myOpenOpps.length} open`} size="small" />
          ) : undefined
        }
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Ranked by urgency. Drag to reorder manually.
        </Typography>
        <PriorityList
          opportunities={priorityOpps}
          onOppClick={() => navigate('/pipeline')}
        />
      </Section>

      {/* Section 3: Revenue Tracker */}
      <Section
        id="revenue"
        title="Revenue Snapshot"
        icon={<TrendingUpIcon color="primary" />}
        collapsed={!!prefs.collapsed['revenue']}
        onToggle={() => toggleSection('revenue')}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate('/dashboard')}
            >
              <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
                <MoneyIcon color="primary" />
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Pipeline
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatDollarMillions(pipelineStats.total)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineStats.count} open opportunities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate('/dashboard')}
            >
              <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
                <WeightedIcon color="primary" />
                <Typography variant="caption" color="text.secondary" display="block">
                  Weighted Pipeline
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatDollarMillions(pipelineStats.weighted)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Probability-weighted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate('/dashboard')}
            >
              <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
                <EventIcon color="primary" />
                <Typography variant="caption" color="text.secondary" display="block">
                  Closing This Month
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatDollarMillions(pipelineStats.closingAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineStats.closingThisMonth} deal{pipelineStats.closingThisMonth !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default MyDashboard;
