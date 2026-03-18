import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Videocam as VideocamIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useQueries } from 'react-query';
import { format, parseISO, isWithinInterval, addDays, startOfDay, endOfDay, startOfWeek, setHours, setMinutes } from 'date-fns';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PREFS_KEY = 'pursuit-dashboard-prefs';

type TimeWindow = 'day' | 'week' | '2weeks';

interface DashboardPrefs {
  timeWindow: TimeWindow;
  topN: 5 | 10 | 25;
  collapsed: Record<string, boolean>;
}

const OPEN_STAGES = [
  'Lead Gen', 'New Lead', 'Qualifying',
  'Design / Proposal Creation', 'Proposal Negotiation',
  'Contract Creation', 'Negotiating Contract',
];

// Dummy orange calendar items for Nick Simmons (from screenshot); dayOffset 0 = Monday
const DUMMY_ORANGE_EVENTS: { summary: string; dayOffset: number; hour: number; minute: number; endHour?: number; endMinute?: number }[] = [
  { summary: 'Delta Flight to Austin (DELTA 2323) JFK', dayOffset: 0, hour: 13, minute: 10, endHour: 17, endMinute: 45 },
  { summary: 'HF + Nick @ Pursuit C', dayOffset: 0, hour: 15, minute: 30 },
  { summary: 'Laura / Nick', dayOffset: 0, hour: 17, minute: 30, endHour: 18, endMinute: 15 },
  { summary: 'Travel, 9:30am', dayOffset: 1, hour: 9, minute: 30 },
  { summary: 'Travel, 10:45am', dayOffset: 1, hour: 10, minute: 45 },
  { summary: 'Focused work time', dayOffset: 1, hour: 12, minute: 0, endHour: 13, endMinute: 30 },
  { summary: '[Hold] Dinner w/ Cliff + Team', dayOffset: 1, hour: 18, minute: 30, endHour: 21, endMinute: 0 },
  { summary: 'PBD Stand Up', dayOffset: 2, hour: 10, minute: 0 },
  { summary: 'Rundown Live:', dayOffset: 2, hour: 12, minute: 0, endHour: 13, endMinute: 30 },
  { summary: '[In-Person]', dayOffset: 3, hour: 10, minute: 0 },
  { summary: 'HF + Weekly Pursu', dayOffset: 3, hour: 11, minute: 30 },
  { summary: 'Pursuit <> McKinsey:', dayOffset: 3, hour: 14, minute: 0 },
  { summary: 'PBD Stand Up, 10am', dayOffset: 4, hour: 10, minute: 0 },
  { summary: 'PBD: High Targets & High Meeting', dayOffset: 4, hour: 10, minute: 30 },
  { summary: 'busy', dayOffset: 4, hour: 16, minute: 0, endHour: 17, endMinute: 30 },
  { summary: 'DNS', dayOffset: 4, hour: 17, minute: 30, endHour: 19, endMinute: 0 },
];

function loadPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      // Migrate old timeWindow values
      const tw = p.timeWindow === 'today' ? 'day' : p.timeWindow === 'month' || p.timeWindow === 'quarter' ? '2weeks' : (p.timeWindow === '2weeks' ? '2weeks' : 'week');
      return { timeWindow: tw, topN: p.topN || 10, collapsed: p.collapsed || {} };
    }
  } catch {}
  return { timeWindow: 'week', topN: 10, collapsed: {} };
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

  // Persist prefs
  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const setTimeWindow = (tw: TimeWindow) => setPrefs((p) => ({ ...p, timeWindow: tw }));
  const setTopN = (n: 5 | 10 | 25) => setPrefs((p) => ({ ...p, topN: n }));
  const toggleSection = (id: string) =>
    setPrefs((p) => ({ ...p, collapsed: { ...p.collapsed, [id]: !p.collapsed[id] } }));

  // Compute time window bounds (spec: day / week / 2 weeks max)
  const { windowStart, windowEnd } = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    switch (prefs.timeWindow) {
      case 'day':
        return { windowStart: start, windowEnd: endOfDay(now) };
      case 'week':
        return { windowStart: start, windowEnd: endOfDay(addDays(now, 7)) };
      case '2weeks':
        return { windowStart: start, windowEnd: endOfDay(addDays(now, 14)) };
      default:
        return { windowStart: start, windowEnd: endOfDay(addDays(now, 7)) };
    }
  }, [prefs.timeWindow]);

  // Fetch opportunities
  const { data: oppsData, isLoading: oppsLoading } = useQuery('opportunities', async () => {
    const response = await apiService.getOpportunities();
    return response.data;
  });

  const allOpportunities = useMemo(() => {
    const raw = Array.isArray(oppsData)
      ? oppsData
      : (oppsData?.opportunities || oppsData?.data || []);
    return raw as any[];
  }, [oppsData]);

  // User's opportunities (filter by OwnerId if SF connected)
  const sfUserId = user?.salesforce_user_id;
  const myOpportunities = useMemo(() => {
    if (!sfUserId) return allOpportunities;
    return allOpportunities.filter((opp: any) => opp.OwnerId === sfUserId);
  }, [allOpportunities, sfUserId]);

  // Open opps for pipeline section
  const myOpenOpps = useMemo(
    () => myOpportunities.filter((opp: any) => OPEN_STAGES.includes(opp.StageName)),
    [myOpportunities]
  );

  // Top prospects: spec formula score = Amount * (Probability/100) * (1 + log10(1 + Amount/1e6)); exclude Probability < 15%
  const topProspects = useMemo(() => {
    const PROB_FLOOR = 15;
    const withScore = myOpenOpps
      .filter((o: any) => (o.Probability ?? 0) >= PROB_FLOOR)
      .map((o: any) => {
        const amount = Number(o.Amount) || 0;
        const prob = Number(o.Probability) ?? 0;
        const w = amount * (prob / 100);
        const sizeFactor = 1 + Math.log10(1 + amount / 1_000_000);
        const score = w * sizeFactor;
        return { ...o, _priorityScore: score };
      });
    return withScore.sort((a: any, b: any) => (b._priorityScore ?? 0) - (a._priorityScore ?? 0)).slice(0, prefs.topN);
  }, [myOpenOpps, prefs.topN]);

  // Action items — open opps within time window, grouped by urgency
  const actionItems = useMemo(() => {
    const now = new Date();
    const overdue: any[] = [];
    const dueSoon: any[] = [];
    const comingUp: any[] = [];

    for (const opp of myOpenOpps) {
      if (!opp.CloseDate) continue;
      const closeDate = parseISO(opp.CloseDate);

      if (closeDate < startOfDay(now)) {
        overdue.push(opp);
      } else if (isWithinInterval(closeDate, { start: startOfDay(now), end: endOfDay(addDays(now, 7)) })) {
        dueSoon.push(opp);
      } else if (isWithinInterval(closeDate, { start: startOfDay(now), end: windowEnd })) {
        comingUp.push(opp);
      }
    }

    return { overdue, dueSoon, comingUp };
  }, [myOpenOpps, windowEnd]);

  const totalActionItems = actionItems.overdue.length + actionItems.dueSoon.length + actionItems.comingUp.length;

  // Top 10 accounts by soonest close date (for calendar + activity)
  const topAccounts = useMemo(() => {
    const accountMap = new Map<string, { name: string; soonestClose: Date }>();
    for (const opp of myOpenOpps) {
      const accName = opp.Account?.Name;
      if (!accName || !opp.CloseDate) continue;
      const close = parseISO(opp.CloseDate);
      const existing = accountMap.get(accName);
      if (!existing || close < existing.soonestClose) {
        accountMap.set(accName, { name: accName, soonestClose: close });
      }
    }
    return Array.from(accountMap.values())
      .sort((a, b) => a.soonestClose.getTime() - b.soonestClose.getTime())
      .slice(0, 10);
  }, [myOpenOpps]);

  // Calendar queries for top accounts
  const calendarQueries = useQueries(
    topAccounts.map((acc) => ({
      queryKey: ['calendar', acc.name],
      queryFn: async () => {
        const response = await apiService.getAccountCalendarActivity(acc.name, 20);
        return { accountName: acc.name, events: response.data?.events || response.data || [] };
      },
      staleTime: 5 * 60 * 1000,
      enabled: !prefs.collapsed['calendar'],
    }))
  );

  // Flatten and filter calendar events within time window
  const calendarEvents = useMemo(() => {
    const events: any[] = [];
    for (const q of calendarQueries) {
      if (!q.data) continue;
      const accountEvents = Array.isArray(q.data.events) ? q.data.events : [];
      for (const ev of accountEvents) {
        const start = ev.start?.dateTime || ev.start?.date || ev.date;
        if (!start) continue;
        try {
          const d = parseISO(start);
          if (isWithinInterval(d, { start: windowStart, end: windowEnd })) {
            events.push({ type: 'event' as const, ...ev, accountName: q.data!.accountName, dateTime: d });
          }
        } catch {}
      }
    }
    return events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }, [calendarQueries, windowStart, windowEnd]);

  // Tasks for top 5 prospects (for merged Calendar & tasks block)
  const taskQueries = useQueries(
    (topProspects.slice(0, 5).map((opp: any) => ({
      queryKey: ['opportunity-tasks', opp.Id],
      queryFn: async () => {
        const res = await apiService.getOpportunityTasks(opp.Id);
        const data = res.data as { tasks?: any[] };
        const tasks = data?.tasks || [];
        return { oppName: opp.Name, accountName: opp.Account?.Name || opp.Name, tasks };
      },
      staleTime: 2 * 60 * 1000,
      enabled: !prefs.collapsed['calendar'],
    })) as { queryKey: (string | number)[]; queryFn: () => Promise<{ oppName: string; accountName: string; tasks: any[] }>; staleTime: number; enabled: boolean }[])
  );

  // Merge tasks into calendar feed (same time window), sorted by date
  const calendarAndTasks = useMemo(() => {
    const items: { type: 'event' | 'task'; dateTime: Date; summary: string; accountName: string; status?: string }[] = [];
    for (const ev of calendarEvents) {
      items.push({
        type: 'event',
        dateTime: ev.dateTime,
        summary: ev.summary || 'Untitled event',
        accountName: ev.accountName,
      });
    }
    for (const q of taskQueries) {
      if (!q.data?.tasks) continue;
      const accountName = q.data.accountName || q.data.oppName;
      for (const t of q.data.tasks) {
        const ad = t.ActivityDate;
        if (!ad) continue;
        try {
          const d = parseISO(ad);
          if (isWithinInterval(d, { start: windowStart, end: windowEnd })) {
            items.push({
              type: 'task',
              dateTime: d,
              summary: t.Subject || 'Task',
              accountName,
              status: t.Status,
            });
          }
        } catch {}
      }
    }
    return items.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()).slice(0, 20);
  }, [calendarEvents, taskQueries, windowStart, windowEnd]);

  const calendarLoading = calendarQueries.some((q) => q.isLoading) || taskQueries.some((q) => q.isLoading);

  // Activity intelligence for top 5 accounts
  const activityQueries = useQueries(
    topAccounts.slice(0, 5).map((acc) => ({
      queryKey: ['activity-intelligence', acc.name],
      queryFn: async () => {
        const response = await apiService.getActivityIntelligence(acc.name);
        return { accountName: acc.name, data: response.data };
      },
      staleTime: 5 * 60 * 1000,
      enabled: !prefs.collapsed['activity'],
    }))
  );

  // Flatten activity items
  const activityItems = useMemo(() => {
    const items: any[] = [];
    for (const q of activityQueries) {
      if (!q.data?.data) continue;
      const intel = q.data.data;
      // Extract recent activities from the intelligence response
      const sources = [
        ...(intel.slack?.recent_messages || []).map((m: any) => ({
          type: 'slack',
          date: m.timestamp || m.date,
          summary: m.text || m.summary || 'Slack message',
          account: q.data!.accountName,
        })),
        ...(intel.gmail?.recent_emails || []).map((e: any) => ({
          type: 'gmail',
          date: e.date || e.timestamp,
          summary: e.subject || e.summary || 'Email',
          account: q.data!.accountName,
        })),
        ...(intel.calendar?.upcoming_events || []).map((e: any) => ({
          type: 'calendar',
          date: e.start?.dateTime || e.start?.date || e.date,
          summary: e.summary || e.title || 'Calendar event',
          account: q.data!.accountName,
        })),
        ...(intel.fireflies?.recent_meetings || []).map((m: any) => ({
          type: 'fireflies',
          date: m.date || m.timestamp,
          summary: m.title || m.summary || 'Meeting',
          account: q.data!.accountName,
        })),
      ];
      items.push(...sources);
    }
    return items
      .filter((i) => i.date)
      .sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch {
          return 0;
        }
      })
      .slice(0, 20);
  }, [activityQueries]);

  const activityLoading = activityQueries.some((q) => q.isLoading);

  // Pipeline summary stats
  const pipelineStats = useMemo(() => {
    const count = myOpenOpps.length;
    const total = myOpenOpps.reduce((sum: number, opp: any) => sum + (opp.Amount || 0), 0);
    const weighted = myOpenOpps.reduce(
      (sum: number, opp: any) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );
    return { count, total, weighted };
  }, [myOpenOpps]);

  // My accounts derived from opportunities
  const myAccounts = useMemo(() => {
    const map = new Map<string, { name: string; id: string; oppCount: number; totalPipeline: number }>();
    for (const opp of myOpenOpps) {
      const accName = opp.Account?.Name || 'Unknown';
      const accId = opp.AccountId || '';
      const existing = map.get(accId);
      if (existing) {
        existing.oppCount++;
        existing.totalPipeline += opp.Amount || 0;
      } else {
        map.set(accId, { name: accName, id: accId, oppCount: 1, totalPipeline: opp.Amount || 0 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalPipeline - a.totalPipeline);
  }, [myOpenOpps]);

  // Dummy orange events for Nick Simmons on localhost: build dates, run matching protocol, merge into feed
  const isNickSimmonsDev =
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    user?.name?.includes('Nick');

  const displayCalendarAndTasks = useMemo(() => {
    type CalendarItem = {
      type: 'event' | 'task';
      dateTime: Date;
      summary: string;
      accountName: string;
      status?: string;
      suggestedAccountName?: string;
      matchReason?: string;
      isDummy?: boolean;
    };
    let items: CalendarItem[] = calendarAndTasks.map((item) => ({
      ...item,
      suggestedAccountName: undefined,
      matchReason: undefined,
      isDummy: false,
    }));

    if (isNickSimmonsDev) {
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      const accountNames = myAccounts.map((a) => a.name);
      const oppNames = myOpenOpps.map((o: any) => o.Name || '').filter(Boolean);
      const matchEvent = (summary: string): { name: string; reason: string } | null => {
        const s = summary.toLowerCase();
        for (const name of accountNames) {
          if (name && s.includes(name.toLowerCase())) return { name, reason: 'account_name' };
        }
        for (const name of oppNames) {
          if (name && s.includes(name.toLowerCase())) return { name, reason: 'opportunity_name' };
        }
        if (s.includes('pursuit')) return { name: 'Pursuit', reason: 'account_name' };
        if (s.includes('mckinsey')) return { name: 'McKinsey', reason: 'account_name' };
        if (s.includes('pbd')) return { name: 'PBD', reason: 'account_name' };
        if (s.includes('hf')) return { name: 'HF', reason: 'account_name' };
        return null;
      };

      const dummyItems: CalendarItem[] = [];
      for (const ev of DUMMY_ORANGE_EVENTS) {
        const date = addDays(monday, ev.dayOffset);
        const dateTime = setMinutes(setHours(date, ev.hour), ev.minute);
        if (!isWithinInterval(dateTime, { start: windowStart, end: windowEnd })) continue;
        const match = matchEvent(ev.summary);
        dummyItems.push({
          type: 'event',
          dateTime,
          summary: ev.summary,
          accountName: match?.name || '—',
          suggestedAccountName: match?.name,
          matchReason: match?.reason,
          isDummy: true,
        });
      }
      items = [...dummyItems, ...items].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()).slice(0, 30);
    }

    return items;
  }, [
    isNickSimmonsDev,
    calendarAndTasks,
    windowStart,
    windowEnd,
    myAccounts,
    myOpenOpps,
  ]);

  // Pipeline columns
  const pipelineColumns: GridColDef[] = useMemo(
    () => [
      { field: 'Name', headerName: 'Opportunity', flex: 2, minWidth: 200 },
      {
        field: 'AccountId',
        headerName: 'Account',
        flex: 1.5,
        minWidth: 150,
        valueGetter: (params: any) => params.row.Account?.Name || '',
      },
      { field: 'StageName', headerName: 'Stage', flex: 1, minWidth: 130 },
      {
        field: 'Amount',
        headerName: 'Amount',
        width: 120,
        valueFormatter: (params: any) => params.value ? formatDollarMillions(params.value) : '$0',
      },
      { field: 'CloseDate', headerName: 'Close Date', width: 120 },
      {
        field: 'Probability',
        headerName: 'Prob.',
        width: 80,
        valueFormatter: (params: any) => params.value ? `${params.value}%` : '-',
      },
    ],
    []
  );

  // Helper to render an action item table row group
  const renderActionGroup = (label: string, items: any[], color: string) => {
    if (items.length === 0) return null;
    return (
      <>
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{ bgcolor: color, fontWeight: 600, py: 0.5, fontSize: '0.8rem', border: 'none' }}
          >
            {label} ({items.length})
          </TableCell>
        </TableRow>
        {items.map((opp: any) => (
          <TableRow
            key={opp.Id}
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/pipeline')}
          >
            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                {opp.Name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{opp.Account?.Name || '-'}</Typography>
            </TableCell>
            <TableCell>
              <Chip label={opp.StageName} size="small" variant="outlined" />
            </TableCell>
            <TableCell>
              <Typography variant="body2">
                {opp.CloseDate || '-'}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={500}>
                {opp.Amount ? formatDollarMillions(opp.Amount) : '-'}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'slack': return <ChatIcon fontSize="small" color="info" />;
      case 'gmail': return <EmailIcon fontSize="small" color="error" />;
      case 'calendar': return <EventIcon fontSize="small" color="primary" />;
      case 'fireflies': return <VideocamIcon fontSize="small" color="secondary" />;
      default: return <TimelineIcon fontSize="small" />;
    }
  };

  if (oppsLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header + global filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Home</Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your dashboard'}
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={prefs.timeWindow}
          onChange={(_, v) => v && setTimeWindow(v)}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="2weeks">2 weeks</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!sfUserId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect Salesforce to filter by your ownership. Currently showing all opportunities.
        </Alert>
      )}

      {/* 1. Calendar & tasks (single block) */}
      <Section
        id="calendar"
        title="Calendar & tasks"
        icon={<CalendarIcon color="primary" />}
        collapsed={!!prefs.collapsed['calendar']}
        onToggle={() => toggleSection('calendar')}
        badge={displayCalendarAndTasks.length > 0 ? <Chip label={displayCalendarAndTasks.length} size="small" /> : undefined}
      >
        {calendarLoading && !isNickSimmonsDev ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading calendar & tasks...</Typography>
          </Box>
        ) : displayCalendarAndTasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No calendar events or tasks in this range.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {displayCalendarAndTasks.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                {item.type === 'event' ? (
                  <EventIcon fontSize="small" color="primary" />
                ) : (
                  <AssignmentIcon fontSize="small" color="secondary" />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>
                  {format(item.dateTime, 'MMM d, h:mm a')}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                  {item.summary}
                </Typography>
                {item.suggestedAccountName ? (
                  <>
                    <Chip label={`Suggested: ${item.suggestedAccountName}`} size="small" color="primary" variant="outlined" />
                    <Chip label="Confirm" size="small" onClick={() => {}} sx={{ cursor: 'pointer' }} />
                    <Chip label="Change" size="small" variant="outlined" onClick={() => {}} sx={{ cursor: 'pointer' }} />
                  </>
                ) : (
                  <Chip label={item.accountName} size="small" variant="outlined" />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Section>

      {/* 2. Top prospects (5/10/25 by weighted score) */}
      <Section
        id="prospects"
        title="Top prospects"
        icon={<TrendingUpIcon color="primary" />}
        collapsed={!!prefs.collapsed['prospects']}
        onToggle={() => toggleSection('prospects')}
        badge={<Chip label={`Top ${prefs.topN}`} size="small" variant="outlined" />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Show</Typography>
          <ToggleButtonGroup size="small" exclusive value={String(prefs.topN)} onChange={(_, v) => v && setTopN(Number(v) as 5 | 10 | 25)}>
            <ToggleButton value="5">5</ToggleButton>
            <ToggleButton value="10">10</ToggleButton>
            <ToggleButton value="25">25</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {topProspects.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No open opportunities with probability ≥ 15%. Add pipeline data to see top prospects.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Opportunity</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Prob.</TableCell>
                  <TableCell>Close</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topProspects.map((opp: any) => (
                  <TableRow key={opp.Id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/pipeline')}>
                    <TableCell><Typography variant="body2" fontWeight={500}>{opp.Name}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{opp.Account?.Name || '-'}</Typography></TableCell>
                    <TableCell><Chip label={opp.StageName} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right"><Typography variant="body2">{opp.Amount ? formatDollarMillions(opp.Amount) : '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{opp.Probability != null ? `${opp.Probability}%` : '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{opp.CloseDate || '-'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* 3. Action items */}
      <Section
        id="actions"
        title="Action items"
        icon={<AssignmentIcon color="primary" />}
        collapsed={!!prefs.collapsed['actions']}
        onToggle={() => toggleSection('actions')}
        badge={totalActionItems > 0 ? <Chip label={totalActionItems} size="small" color="error" /> : undefined}
      >
        {totalActionItems === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No action items in this time window.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Opportunity</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Close Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderActionGroup('Overdue', actionItems.overdue, '#fee2e2')}
                {renderActionGroup('Due Soon', actionItems.dueSoon, '#ffedd5')}
                {renderActionGroup('Coming Up', actionItems.comingUp, '#f3f4f6')}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* 4. Active Comms (placeholder until Gmail/Slack → Activity) */}
      <Section
        id="activeComms"
        title="Active Comms"
        icon={<EmailIcon color="primary" />}
        collapsed={!!prefs.collapsed['activeComms']}
        onToggle={() => toggleSection('activeComms')}
      >
        <Typography variant="body2" color="text.secondary">
          Contacts and leads with activity in the last 60 days. Coming soon when email and Slack are connected.
        </Typography>
      </Section>

      {/* 5. Inactive (placeholder) */}
      <Section
        id="inactive"
        title="Inactive"
        icon={<ChatIcon color="primary" />}
        collapsed={!!prefs.collapsed['inactive']}
        onToggle={() => toggleSection('inactive')}
      >
        <Typography variant="body2" color="text.secondary">
          Relationships with activity in the last year but not the last 60 days. Coming soon.
        </Typography>
      </Section>

      {/* 6. Automation review (placeholder) */}
      <Section
        id="automationReview"
        title="Automation review"
        icon={<AssignmentIcon color="primary" />}
        collapsed={!!prefs.collapsed['automationReview']}
        onToggle={() => toggleSection('automationReview')}
      >
        <Typography variant="body2" color="text.secondary">
          Weekly review of suggested matches and tasks. Confirm or edit before they’re applied. Coming soon.
        </Typography>
      </Section>

      {/* My Pipeline */}
      <Section
        id="pipeline"
        title="My Pipeline"
        icon={<TrendingUpIcon color="primary" />}
        collapsed={!!prefs.collapsed['pipeline']}
        onToggle={() => toggleSection('pipeline')}
      >
        {/* Summary stats */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Open Opportunities</Typography>
            <Typography variant="h6">{pipelineStats.count}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Pipeline</Typography>
            <Typography variant="h6">{formatDollarMillions(pipelineStats.total)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Weighted Pipeline</Typography>
            <Typography variant="h6">{formatDollarMillions(pipelineStats.weighted)}</Typography>
          </Box>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={myOpenOpps}
            columns={pipelineColumns}
            getRowId={(row) => row.Id}
            density="compact"
            pagination
            pageSizeOptions={[25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'CloseDate', sort: 'asc' }] },
            }}
            disableRowSelectionOnClick
            onRowClick={() => navigate('/pipeline')}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Section>

      {/* Section 4: My Accounts */}
      <Section
        id="accounts"
        title="My Accounts"
        icon={<BusinessIcon color="primary" />}
        collapsed={!!prefs.collapsed['accounts']}
        onToggle={() => toggleSection('accounts')}
        badge={myAccounts.length > 0 ? <Chip label={myAccounts.length} size="small" /> : undefined}
      >
        {myAccounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No accounts found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {myAccounts.map((acc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={acc.id}>
                <Card variant="outlined">
                  <CardActionArea onClick={() => navigate('/pipeline')}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle2" noWrap>{acc.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {acc.oppCount} opp{acc.oppCount !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {formatDollarMillions(acc.totalPipeline)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Section>

      {/* Section 5: Recent Activity */}
      <Section
        id="activity"
        title="Recent Activity"
        icon={<TimelineIcon color="primary" />}
        collapsed={!!prefs.collapsed['activity']}
        onToggle={() => toggleSection('activity')}
      >
        {activityLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading activity intelligence...</Typography>
          </Box>
        ) : activityItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recent activity found for your accounts.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {activityItems.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                {activityIcon(item.type)}
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90 }}>
                  {(() => {
                    try {
                      return format(new Date(item.date), 'MMM d');
                    } catch {
                      return item.date;
                    }
                  })()}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                  {item.summary}
                </Typography>
                <Chip label={item.account} size="small" variant="outlined" />
              </Box>
            ))}
          </Box>
        )}
      </Section>
    </Box>
  );
};

export default MyDashboard;
