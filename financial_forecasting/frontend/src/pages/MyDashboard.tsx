import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Collapse,
  IconButton,
  Alert,
  Button,
  LinearProgress,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Inbox as InboxIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  format,
  parseISO,
  startOfWeek,
  endOfDay,
  addDays,
  subDays,
  startOfDay,
} from 'date-fns';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import WeeklyCalendar, { CalendarEvent, CalendarViewMode } from '../components/WeeklyCalendar';
import PriorityTable, { PriorityOpp } from '../components/PriorityTable';
import TaskInbox, { InboxTask } from '../components/TaskInbox';
import TaskPanel from '../components/TaskPanel';
import type { Opportunity } from './Opportunities/helpers';

const PREFS_KEY = 'pursuit-priorities-prefs';

const OPEN_STAGES = [
  'Lead Gen', 'New Lead', 'Qualifying',
  'Design / Proposal Creation', 'Proposal Negotiation',
  'Contract Creation', 'Negotiating Contract',
];

type CloseDateRange = 'all' | 'next30' | 'next60' | 'next90' | 'thisQuarter' | 'thisYear';

type SnapshotMode = 'all' | 'filtered' | 'priorities';

interface DashboardPrefs {
  collapsed: Record<string, boolean>;
  calendarView: CalendarViewMode;
  topN: number;
  filterUserId: string; // 'all' or a SF user ID
  showWeighted: boolean;
  closeDateRange: CloseDateRange;
  snapshotMode: SnapshotMode;
}

function loadPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = { filterUserId: 'all', showWeighted: false, closeDateRange: 'all', snapshotMode: 'all', ...JSON.parse(raw) };
      parsed.topN = Math.min(50, Math.max(1, parsed.topN || 10));
      return parsed;
    }
  } catch {}
  return { collapsed: {}, calendarView: 'week', topN: 10, filterUserId: 'all', showWeighted: false, closeDateRange: 'all', snapshotMode: 'all' as SnapshotMode };
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

const PBD_CALENDAR_ID_FALLBACK = 'c_f06065f4e4551cee88f8d465a6a77a24c8333c66a0077770a3e60b8d26251e98@group.calendar.google.com';

// ── Mock data for layout testing (DEV only — not used in production paths) ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadPrefs);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [taskPanelOpp, setTaskPanelOpp] = useState<Opportunity | null>(null);
  const [filteredOpps, setFilteredOpps] = useState<{ allFiltered: PriorityOpp[]; visible: PriorityOpp[] }>({ allFiltered: [], visible: [] });

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const toggleSection = (id: string) =>
    setPrefs((p) => ({ ...p, collapsed: { ...p.collapsed, [id]: !p.collapsed[id] } }));
  const updatePrefs = (patch: Partial<DashboardPrefs>) =>
    setPrefs((p) => ({ ...p, ...patch }));
  const setCalendarView = (view: CalendarViewMode) =>
    setPrefs((p) => ({ ...p, calendarView: view }));
  const handleFilteredChange = useCallback((allFiltered: PriorityOpp[], visible: PriorityOpp[]) => {
    setFilteredOpps({ allFiltered, visible });
  }, []);

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

  // Wider task date range for priorities (90 days back, 180 days forward)
  const { taskStart, taskEnd } = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      taskStart: format(subDays(today, 90), 'yyyy-MM-dd'),
      taskEnd: format(addDays(today, 180), 'yyyy-MM-dd'),
    };
  }, []);

  // Fetch SF users for the filter dropdown
  const { data: usersData } = useQuery('sf-users', async () => {
    const response = await apiService.getUsers();
    return response.data?.data || response.data?.users || response.data || [];
  }, { staleTime: 15 * 60 * 1000 });

  // Fetch opportunities
  const { data: oppsData, isLoading: oppsLoading } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  // Fetch my tasks (wider range for priorities; calendar filters by visible dates)
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['my-tasks', taskStart, taskEnd],
    async () => {
      const response = await apiService.getMyTasks(taskStart, taskEnd);
      return response.data?.data || response.data || [];
    },
    { staleTime: 5 * 60 * 1000 }
  );

  // Use PBD calendar ID from backend config, falling back to hardcoded value
  const pbdCalendarId = user?.calendar_pbd_id || PBD_CALENDAR_ID_FALLBACK;

  // Fetch PBD shared calendar events
  const { data: calResponse, isLoading: calLoading } = useQuery(
    ['pbd-calendar-events', calStart, calEnd, pbdCalendarId],
    async () => {
      const response = await apiService.getMyCalendarEvents(calStart, calEnd, 100, pbdCalendarId);
      return response.data;
    },
    { staleTime: 5 * 60 * 1000, enabled: !prefs.collapsed['calendar'] }
  );
  const calEventsData = Array.isArray(calResponse?.data) ? calResponse.data : [];
  const calNeedsReauth = calResponse?.needs_reauth === true || Boolean(calResponse?.error);

  const allOpportunities = useMemo(() => {
    const raw = Array.isArray(oppsData)
      ? oppsData
      : (oppsData?.opportunities || oppsData?.data || []);
    return raw as any[];
  }, [oppsData]);

  // Build user list for filter dropdown — merge SF users + opp owners
  const sfUsers = useMemo(() => {
    const userMap = new Map<string, string>();
    // From users API
    const rawUsers = Array.isArray(usersData) ? usersData : [];
    for (const u of rawUsers) {
      if (u.Id && u.Name) userMap.set(u.Id, u.Name);
    }
    // From opportunity owners (catches inactive/historical users)
    for (const opp of allOpportunities) {
      if (opp.OwnerId && !userMap.has(opp.OwnerId)) {
        userMap.set(opp.OwnerId, opp.Owner?.Name || opp.OwnerId);
      }
    }
    return Array.from(userMap.entries())
      .map(([Id, Name]) => ({ Id, Name }))
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [usersData, allOpportunities]);

  // Precompute open opp counts per user for dropdown labels
  const allOpenOpps = useMemo(
    () => allOpportunities.filter((opp: any) => OPEN_STAGES.includes(opp.StageName)),
    [allOpportunities]
  );
  const openCountByUser = useMemo(() => {
    const counts = new Map<string, number>();
    for (const opp of allOpenOpps) {
      counts.set(opp.OwnerId, (counts.get(opp.OwnerId) || 0) + 1);
    }
    return counts;
  }, [allOpenOpps]);

  // Filtered opportunities — by selected user or all
  const sfUserId = user?.salesforce_user_id;
  const resolvedFilterId = prefs.filterUserId === 'me' ? (sfUserId || 'all') : (prefs.filterUserId || 'all');
  const filteredOpportunities = useMemo(() => {
    if (resolvedFilterId === 'all') return allOpportunities;
    return allOpportunities.filter((opp: any) => opp.OwnerId === resolvedFilterId);
  }, [allOpportunities, resolvedFilterId]);

  const myOpenOpps = useMemo(() => {
    let opps = filteredOpportunities.filter((opp: any) => OPEN_STAGES.includes(opp.StageName));

    // Apply close date range filter
    if (prefs.closeDateRange !== 'all') {
      const now = new Date();
      const today = startOfDay(now);
      let cutoff: Date;
      switch (prefs.closeDateRange) {
        case 'next30': cutoff = addDays(today, 30); break;
        case 'next60': cutoff = addDays(today, 60); break;
        case 'next90': cutoff = addDays(today, 90); break;
        case 'thisQuarter': {
          const qMonth = Math.floor(now.getMonth() / 3) * 3 + 3;
          cutoff = new Date(now.getFullYear(), qMonth, 0);
          break;
        }
        case 'thisYear': cutoff = new Date(now.getFullYear(), 11, 31); break;
        default: cutoff = addDays(today, 365);
      }
      opps = opps.filter((opp: any) => {
        if (!opp.CloseDate) return false;
        const d = parseISO(opp.CloseDate);
        return d <= endOfDay(cutoff);
      });
    }

    return opps;
  }, [filteredOpportunities, prefs.closeDateRange]);

  // Map tasks to their parent opportunities
  const sfTasks = useMemo(() => (Array.isArray(tasksData) ? tasksData : []), [tasksData]);

  // Build calendar events from GCal + SF Tasks
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // GCal events
    const gcalEvents = calEventsData;
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
    if (myOpenOpps.length === 0) return [];

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

  // Build inbox tasks with opportunity names
  const inboxTasks: InboxTask[] = useMemo(() => {
    const oppNameMap = new Map<string, string>();
    for (const opp of allOpportunities) {
      oppNameMap.set(opp.Id, opp.Name);
    }
    return sfTasks.map((t: any) => ({
      Id: t.Id,
      Subject: t.Subject || 'Untitled Task',
      Status: t.Status || 'Not Started',
      Priority: t.Priority || 'Normal',
      ActivityDate: t.ActivityDate || null,
      Description: t.Description || null,
      OwnerId: t.OwnerId || '',
      OwnerName: t.Owner?.Name || t.OwnerName || null,
      CreatedById: t.CreatedById || null,
      CreatedByName: t.CreatedBy?.Name || null,
      WhatId: t.WhatId || null,
      OpportunityName: t.WhatId ? oppNameMap.get(t.WhatId) || null : null,
      isUrgent: t.Priority === 'High',
    }));
  }, [sfTasks, allOpportunities]);

  // Pipeline summary stats — scoped by snapshot mode
  const pipelineStats = useMemo(() => {
    let statsOpps: any[];
    switch (prefs.snapshotMode) {
      case 'filtered': statsOpps = filteredOpps.allFiltered; break;
      case 'priorities': statsOpps = filteredOpps.visible; break;
      default: statsOpps = myOpenOpps;
    }
    const count = statsOpps.length;
    const total = statsOpps.reduce((sum: number, opp: any) => sum + (opp.Amount || 0), 0);
    const weighted = statsOpps.reduce(
      (sum: number, opp: any) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const closingThisMonth = statsOpps.filter((opp: any) => {
      if (!opp.CloseDate) return false;
      const d = parseISO(opp.CloseDate);
      return d >= startOfDay(now) && d <= endOfDay(monthEnd);
    });
    const closingAmount = closingThisMonth.reduce((s: number, o: any) => s + (o.Amount || 0), 0);
    return { count, total, weighted, closingThisMonth: closingThisMonth.length, closingAmount };
  }, [myOpenOpps, prefs.snapshotMode, filteredOpps]);

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
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'Home'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(), 'EEEE, MMMM d')} &middot; {myOpenOpps.length} open opportunit{myOpenOpps.length === 1 ? 'y' : 'ies'}
          </Typography>
        </Box>
      </Box>

      {/* Row 1: Calendar + Task Inbox side-by-side */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={prefs.collapsed['inbox'] ? 12 : 7}>
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
            {calNeedsReauth && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Calendar access expired. Please{' '}
                <Button
                  size="small"
                  color="inherit"
                  sx={{ textDecoration: 'underline', p: 0, minWidth: 0 }}
                  onClick={() => logout().then(() => {})}
                >
                  log out and sign in again
                </Button>{' '}
                to restore PBD calendar sync.
              </Alert>
            )}
            <WeeklyCalendar
              events={calendarEvents}
              loading={calLoading}
              viewMode={prefs.calendarView}
              onViewModeChange={setCalendarView}
            />
          </Section>
        </Grid>
        {!prefs.collapsed['inbox'] && (
          <Grid item xs={12} md={5}>
            <Section
              id="inbox"
              title="Task Inbox"
              icon={<InboxIcon color="primary" />}
              collapsed={!!prefs.collapsed['inbox']}
              onToggle={() => toggleSection('inbox')}
              badge={
                inboxTasks.filter((t) => t.Status !== 'Completed').length > 0 ? (
                  <Chip label={`${inboxTasks.filter((t) => t.Status !== 'Completed').length} open`} size="small" />
                ) : undefined
              }
            >
              <TaskInbox
                tasks={inboxTasks}
                loading={tasksLoading}
                maxHeight={400}
              />
            </Section>
          </Grid>
        )}
        {prefs.collapsed['inbox'] && (
          <Grid item xs={12}>
            <Section
              id="inbox"
              title="Task Inbox"
              icon={<InboxIcon color="primary" />}
              collapsed={true}
              onToggle={() => toggleSection('inbox')}
            >
              <div />
            </Section>
          </Grid>
        )}
      </Grid>

      {/* Row 2: Priority Opportunities */}
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
        {/* Controls row: User filter + Weighted toggle + top-N */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="opportunity-owner-filter-label">Opportunity Owner</InputLabel>
              <Select
                labelId="opportunity-owner-filter-label"
                label="Opportunity Owner"
                value={prefs.filterUserId}
                onChange={(e) => setPrefs((p) => ({ ...p, filterUserId: e.target.value as string }))}
              >
                <MenuItem value="all">All Users ({allOpenOpps.length})</MenuItem>
                {sfUserId && <MenuItem value="me">My Opportunities ({openCountByUser.get(sfUserId) || 0})</MenuItem>}
                {sfUsers.map((u: any) => {
                  const cnt = openCountByUser.get(u.Id) || 0;
                  return (
                    <MenuItem key={u.Id} value={u.Id}>
                      {u.Name} ({cnt})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="close-date-label">Close Date</InputLabel>
              <Select
                labelId="close-date-label"
                label="Close Date"
                value={prefs.closeDateRange}
                onChange={(e) => setPrefs((p) => ({ ...p, closeDateRange: e.target.value as CloseDateRange }))}
              >
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="next30">Next 30 days</MenuItem>
                <MenuItem value="next60">Next 60 days</MenuItem>
                <MenuItem value="next90">Next 90 days</MenuItem>
                <MenuItem value="thisQuarter">This Quarter</MenuItem>
                <MenuItem value="thisYear">This Year</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={prefs.showWeighted ? 'weighted' : 'total'}
              onChange={(_, v) => v && setPrefs((p) => ({ ...p, showWeighted: v === 'weighted' }))}
            >
              <ToggleButton value="total">Total</ToggleButton>
              <ToggleButton value="weighted">Weighted</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <TextField
            type="number"
            size="small"
            label="Rows"
            defaultValue={prefs.topN}
            inputProps={{ min: 1, max: 50 }}
            sx={{ width: 72 }}
            onBlur={(e) => {
              const v = Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 10));
              e.target.value = String(v);
              setPrefs((p) => ({ ...p, topN: v }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
        </Box>

        {priorityOpps.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {!user?.salesforce_connected ? (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Connect Salesforce to see your priority opportunities.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/settings')}
                >
                  Go to Settings
                </Button>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No open opportunities found. New opportunities will appear here automatically.
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <PriorityTable
              opportunities={priorityOpps}
              maxRows={prefs.topN}
              users={[]}
              showWeighted={prefs.showWeighted}
              onFilteredChange={handleFilteredChange}
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
          </>
        )}
      </Section>

      {/* Section 3: Revenue Tracker */}
      <Section
        id="revenue"
        title="Revenue Snapshot"
        icon={<TrendingUpIcon color="primary" />}
        collapsed={!!prefs.collapsed['revenue']}
        onToggle={() => toggleSection('revenue')}
        badge={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={prefs.snapshotMode}
            onChange={(_, val) => val && updatePrefs({ snapshotMode: val })}
            onClick={(e) => e.stopPropagation()}
            sx={{ ml: 1 }}
          >
            <ToggleButton value="all" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>All Pipeline</ToggleButton>
            <ToggleButton value="filtered" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>All Filtered</ToggleButton>
            <ToggleButton value="priorities" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>Just Priorities</ToggleButton>
          </ToggleButtonGroup>
        }
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
