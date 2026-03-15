import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { format, parseISO, isWithinInterval, addDays, addMonths, startOfDay, endOfDay, endOfMonth, startOfMonth, addQuarters, startOfQuarter, endOfQuarter } from 'date-fns';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PREFS_KEY = 'pursuit-dashboard-prefs';

type TimeWindow = 'today' | 'week' | 'month' | 'quarter';

interface DashboardPrefs {
  timeWindow: TimeWindow;
  collapsed: Record<string, boolean>;
}

const OPEN_STAGES = [
  'Lead Gen', 'New Lead', 'Qualifying',
  'Design / Proposal Creation', 'Proposal Negotiation',
  'Contract Creation', 'Negotiating Contract',
];

function loadPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { timeWindow: 'week', collapsed: {} };
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
  const toggleSection = (id: string) =>
    setPrefs((p) => ({ ...p, collapsed: { ...p.collapsed, [id]: !p.collapsed[id] } }));

  // Compute time window bounds
  const { windowStart, windowEnd } = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    switch (prefs.timeWindow) {
      case 'today':
        return { windowStart: start, windowEnd: endOfDay(now) };
      case 'week':
        return { windowStart: start, windowEnd: endOfDay(addDays(now, 7)) };
      case 'month':
        return { windowStart: start, windowEnd: endOfMonth(now) };
      case 'quarter':
        return { windowStart: start, windowEnd: endOfQuarter(now) };
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
            events.push({ ...ev, accountName: q.data.accountName, dateTime: d });
          }
        } catch {}
      }
    }
    return events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }, [calendarQueries, windowStart, windowEnd]);

  const calendarLoading = calendarQueries.some((q) => q.isLoading);

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
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">This Week</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
          <ToggleButton value="quarter">This Quarter</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!sfUserId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect Salesforce to filter by your ownership. Currently showing all opportunities.
        </Alert>
      )}

      {/* Section 1: Action Items */}
      <Section
        id="actions"
        title="Action Items"
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

      {/* Section 2: My Calendar */}
      <Section
        id="calendar"
        title="My Calendar"
        icon={<CalendarIcon color="primary" />}
        collapsed={!!prefs.collapsed['calendar']}
        onToggle={() => toggleSection('calendar')}
        badge={calendarEvents.length > 0 ? <Chip label={calendarEvents.length} size="small" /> : undefined}
      >
        {calendarLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading calendar events...</Typography>
          </Box>
        ) : calendarEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No calendar events found for your top accounts in this time window.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {calendarEvents.slice(0, 15).map((ev, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                <EventIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>
                  {format(ev.dateTime, 'MMM d, h:mm a')}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {ev.summary || 'Untitled event'}
                </Typography>
                <Chip label={ev.accountName} size="small" variant="outlined" />
              </Box>
            ))}
          </Box>
        )}
      </Section>

      {/* Section 3: My Pipeline */}
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
