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
  ToggleButtonGroup,
  ToggleButton,
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
import PriorityTable, { PriorityOpp } from '../components/PriorityTable';
import TaskPanel from '../components/TaskPanel';
import type { Opportunity } from './Opportunities/helpers';

const PREFS_KEY = 'pursuit-priorities-prefs';

const OPEN_STAGES = [
  'Lead Gen', 'New Lead', 'Qualifying',
  'Design / Proposal Creation', 'Proposal Negotiation',
  'Contract Creation', 'Negotiating Contract',
];

interface DashboardPrefs {
  collapsed: Record<string, boolean>;
  calendarView: CalendarViewMode;
  topN: number;
}

function loadPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { collapsed: {}, calendarView: 'week', topN: 10 };
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

const PBD_CALENDAR_ID = 'c_f06065f4e4551cee88f8d465a6a77a24c8333c66a0077770a3e60b8d26251e98@group.calendar.google.com';

// ── Mock data for layout testing (remove when SF is connected) ──
const MOCK_PRIORITY_OPPS: PriorityOpp[] = [
  {
    Id: 'mock-001', Name: 'Goldman Sachs Foundation — AIJI Year 3', StageName: 'Proposal Negotiation',
    Amount: 2500000, CloseDate: '2026-03-20', Probability: 75, OwnerId: 'u1',
    Account: { Name: 'Goldman Sachs Foundation', Id: 'a1' }, LastModifiedDate: '2026-03-14',
    tasks: [
      { Id: 't1', Subject: 'Send revised budget', ActivityDate: '2026-03-15', Priority: 'High', Status: 'Not Started', OwnerId: 'u1', OwnerName: 'Jane Park', Description: 'Include updated indirect cost rate per finance team email from 3/12' },
      { Id: 't2', Subject: 'Follow up with program officer', ActivityDate: '2026-03-18', Priority: 'Normal', Status: 'Not Started', OwnerId: 'u2', OwnerName: 'Marcus Chen', Description: '' },
    ],
  },
  {
    Id: 'mock-002', Name: 'JPMorgan Chase — Workforce Dev Grant', StageName: 'Design / Proposal Creation',
    Amount: 1800000, CloseDate: '2026-04-15', Probability: 60, OwnerId: 'u1',
    Account: { Name: 'JPMorgan Chase Foundation', Id: 'a2' }, LastModifiedDate: '2026-03-10',
    tasks: [
      { Id: 't3', Subject: 'Draft LOI', ActivityDate: '2026-03-12', Priority: 'High', Status: 'Not Started', OwnerId: 'u1', OwnerName: 'Jane Park' },
    ],
  },
  {
    Id: 'mock-003', Name: 'Robin Hood Foundation — General Operating', StageName: 'Qualifying',
    Amount: 750000, CloseDate: '2026-05-01', Probability: 40, OwnerId: 'u1',
    Account: { Name: 'Robin Hood Foundation', Id: 'a3' }, LastModifiedDate: '2026-02-01',
    tasks: [],
  },
  {
    Id: 'mock-004', Name: 'Google.org — AI Skills Accelerator', StageName: 'Proposal Negotiation',
    Amount: 3200000, CloseDate: '2026-03-28', Probability: 80, OwnerId: 'u1',
    Account: { Name: 'Google.org', Id: 'a4' }, LastModifiedDate: '2026-03-16',
    tasks: [
      { Id: 't4', Subject: 'Finalize MOU', ActivityDate: '2026-03-22', Priority: 'High', Status: 'Not Started', OwnerId: 'u1', OwnerName: 'Jane Park', Description: 'Legal reviewed — waiting on Google.org redline. Check Slack #google-partnership for latest' },
      { Id: 't5', Subject: 'Board approval package', ActivityDate: '2026-03-25', Priority: 'Normal', Status: 'Not Started', OwnerId: 'u2', OwnerName: 'Marcus Chen', Description: 'Need: exec summary, budget, MOU draft, board resolution template' },
      { Id: 't6', Subject: 'Schedule site visit', ActivityDate: '2026-03-10', Priority: 'Normal', Status: 'Completed', OwnerId: 'u1', OwnerName: 'Jane Park', Description: 'Completed — visit confirmed for 3/28 at LIC campus' },
    ],
    nextEvent: { summary: 'Google.org — Final Review Call', start: '2026-03-18' },
  },
  {
    Id: 'mock-005', Name: 'Salesforce Foundation — PBC Renewal', StageName: 'Contract Creation',
    Amount: 500000, CloseDate: '2026-03-17', Probability: 90, OwnerId: 'u1',
    Account: { Name: 'Salesforce Foundation', Id: 'a5' }, LastModifiedDate: '2026-03-16',
    tasks: [
      { Id: 't7', Subject: 'Countersign agreement', ActivityDate: '2026-03-17', Priority: 'High', Status: 'Not Started', OwnerId: 'u1', OwnerName: 'Jane Park' },
    ],
  },
  {
    Id: 'mock-006', Name: 'Bloomberg Philanthropies — Career Pathways', StageName: 'New Lead',
    Amount: 1200000, CloseDate: '2026-06-30', Probability: 25, OwnerId: 'u1',
    Account: { Name: 'Bloomberg Philanthropies', Id: 'a6' }, LastModifiedDate: '2026-01-15',
    tasks: [],
  },
  {
    Id: 'mock-007', Name: 'Bank of America — Community Grant', StageName: 'Qualifying',
    Amount: 350000, CloseDate: '2026-04-01', Probability: 35, OwnerId: 'u1',
    Account: { Name: 'Bank of America Charitable Foundation', Id: 'a7' }, LastModifiedDate: '2026-03-05',
    tasks: [
      { Id: 't8', Subject: 'Submit capacity statement', ActivityDate: '2026-03-08', Priority: 'Normal', Status: 'Not Started', OwnerId: 'u2', OwnerName: 'Marcus Chen' },
    ],
  },
  {
    Id: 'mock-008', Name: 'Citi Foundation — Digital Skills 2026', StageName: 'Design / Proposal Creation',
    Amount: 900000, CloseDate: '2026-05-15', Probability: 50, OwnerId: 'u1',
    Account: { Name: 'Citi Foundation', Id: 'a8' }, LastModifiedDate: '2026-03-13',
    tasks: [
      { Id: 't9', Subject: 'Complete evaluation framework', ActivityDate: '2026-03-20', Priority: 'Normal', Status: 'Not Started', OwnerId: 'u1', OwnerName: 'Jane Park' },
    ],
  },
];

const MyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadPrefs);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [taskPanelOpp, setTaskPanelOpp] = useState<Opportunity | null>(null);

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

  // Fetch PBD shared calendar events
  const { data: calEventsData, isLoading: calLoading } = useQuery(
    ['pbd-calendar-events', calStart, calEnd],
    async () => {
      const response = await apiService.getMyCalendarEvents(calStart, calEnd, 100, PBD_CALENDAR_ID);
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
    // Use mock data when SF isn't connected
    if (myOpenOpps.length === 0) return MOCK_PRIORITY_OPPS;

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
      tasks: (tasksByOppId.get(opp.Id) || []).map((t: any) => ({
        Id: t.Id,
        Subject: t.Subject,
        ActivityDate: t.ActivityDate || '',
        Priority: t.Priority || 'Normal',
        Status: t.Status || 'Not Started',
        OwnerId: t.OwnerId,
        OwnerName: t.Owner?.Name || t.OwnerName || '',
        Description: t.Description || '',
      })),
    }));
  }, [myOpenOpps, sfTasks]);

  // Pipeline summary stats
  const pipelineStats = useMemo(() => {
    const statsOpps = myOpenOpps.length > 0 ? myOpenOpps : MOCK_PRIORITY_OPPS;
    const count = statsOpps.length;
    const total = statsOpps.reduce((sum: number, opp: any) => sum + (opp.Amount || 0), 0);
    const weighted = statsOpps.reduce(
      (sum: number, opp: any) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );
    // Deals closing this month
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const closingThisMonth = statsOpps.filter((opp: any) => {
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
          <Typography variant="h4">Priorities</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={prefs.topN}
            onChange={(_, v) => v && setPrefs((p) => ({ ...p, topN: v }))}
          >
            <ToggleButton value={5}>5</ToggleButton>
            <ToggleButton value={10}>10</ToggleButton>
            <ToggleButton value={25}>25</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <PriorityTable
          opportunities={priorityOpps.slice(0, prefs.topN)}
          users={[]}
          onAddTask={(opp) => {
            const mapped: Opportunity = {
              Id: opp.Id,
              Name: opp.Name,
              AccountId: opp.Account?.Id || '',
              Account: opp.Account ? { Name: opp.Account.Name } : undefined,
              StageName: opp.StageName,
              Amount: opp.Amount,
              Probability: opp.Probability,
              CloseDate: opp.CloseDate,
              CreatedDate: opp.LastModifiedDate || new Date().toISOString(),
              LastModifiedDate: opp.LastModifiedDate || new Date().toISOString(),
              OwnerId: opp.OwnerId || '',
            };
            setTaskPanelOpp(mapped);
            setTaskPanelOpen(true);
          }}
          onOpenTaskDrawer={(opp, _taskId) => {
            const mapped: Opportunity = {
              Id: opp.Id,
              Name: opp.Name,
              AccountId: opp.Account?.Id || '',
              Account: opp.Account ? { Name: opp.Account.Name } : undefined,
              StageName: opp.StageName,
              Amount: opp.Amount,
              Probability: opp.Probability,
              CloseDate: opp.CloseDate,
              CreatedDate: opp.LastModifiedDate || new Date().toISOString(),
              LastModifiedDate: opp.LastModifiedDate || new Date().toISOString(),
              OwnerId: opp.OwnerId || '',
            };
            setTaskPanelOpp(mapped);
            setTaskPanelOpen(true);
          }}
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

      {/* Task Panel drawer */}
      <TaskPanel
        open={taskPanelOpen}
        onClose={() => { setTaskPanelOpen(false); setTaskPanelOpp(null); }}
        opportunity={taskPanelOpp}
      />
    </Box>
  );
};

export default MyDashboard;
