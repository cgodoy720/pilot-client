import React, { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Revenue stages that count toward goal (collecting or later, excluding non-revenue closures)
const GOAL_STAGES = ['Collecting / In Effect', 'Closed / Completed'];

interface GoalTrackerProps {
  goalAmount: number;
  allOpportunities: any[];
  filterUserId: string;
  ownerName: string | null;
}

function getFYBounds(now: Date): { fyStart: Date; fyEnd: Date; fyLabel: string } {
  const year = now.getFullYear();
  return {
    fyStart: new Date(year, 0, 1),
    fyEnd: new Date(year, 11, 31, 23, 59, 59, 999),
    fyLabel: `FY${year.toString().slice(-2)}`,
  };
}

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({
  goalAmount,
  allOpportunities,
  filterUserId,
  ownerName,
}) => {
  const now = useMemo(() => new Date(), []);
  const { fyStart, fyEnd, fyLabel } = useMemo(() => getFYBounds(now), [now]);

  const { collectedAmount, goalPct, yearPct, projectedTotal, monthsRemaining, status } =
    useMemo(() => {
      // Filter to goal stages
      let opps = allOpportunities.filter((opp: any) =>
        GOAL_STAGES.includes(opp.StageName)
      );

      // Filter by owner
      if (filterUserId !== 'all') {
        opps = opps.filter((opp: any) => opp.OwnerId === filterUserId);
      }

      // Filter by FY close date
      opps = opps.filter((opp: any) => {
        if (!opp.CloseDate) return false;
        const d = new Date(opp.CloseDate);
        return d >= fyStart && d <= fyEnd;
      });

      const collected = opps.reduce(
        (sum: number, opp: any) => sum + (Number(opp.Amount) || 0),
        0
      );

      const gPct = goalAmount > 0 ? collected / goalAmount : 0;

      // How far through the FY are we?
      const totalMs = fyEnd.getTime() - fyStart.getTime();
      const elapsedMs = now.getTime() - fyStart.getTime();
      const yPct = Math.max(0, Math.min(1, elapsedMs / totalMs));

      const monthsElapsed = Math.max(1, yPct * 12);
      const projected = (collected / monthsElapsed) * 12;
      const remaining = Math.max(0, Math.round((1 - yPct) * 12));

      let s: 'on-track' | 'close' | 'behind';
      if (gPct >= yPct) s = 'on-track';
      else if (gPct >= yPct * 0.75) s = 'close';
      else s = 'behind';

      return {
        collectedAmount: collected,
        goalPct: gPct,
        yearPct: yPct,
        projectedTotal: projected,
        monthsRemaining: remaining,
        status: s,
      };
    }, [allOpportunities, filterUserId, fyStart, fyEnd, goalAmount, now]);

  const collected = Math.min(collectedAmount, goalAmount);
  const projected = Math.min(projectedTotal, goalAmount);
  const chartData = [
    { name: 'Collected', value: collected },
    { name: 'Projected', value: Math.max(0, projected - collected) },
    { name: 'Remaining', value: Math.max(0, goalAmount - projected) },
  ];

  const COLORS = ['#4caf50', '#ffc107', '#e0e0e0'];

  const statusConfig = {
    'on-track': { label: 'On Track', color: 'success' as const },
    close: { label: 'Close', color: 'warning' as const },
    behind: { label: 'Behind Pace', color: 'error' as const },
  };

  const { label: statusLabel, color: statusColor } = statusConfig[status];
  const isTeam = filterUserId === 'all';

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {isTeam ? 'Team Goal' : ownerName ? `${ownerName}'s Goal` : 'My Goal'}
      </Typography>

      {/* Donut chart with center label */}
      <Box sx={{ position: 'relative', width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {formatDollars(collectedAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(goalPct * 100).toFixed(0)}% of {formatDollars(goalAmount)}
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ mt: 1 }}>
        <Chip label={statusLabel} color={statusColor} size="small" sx={{ mb: 0.5 }} />
        <Typography variant="caption" color="text.secondary" display="block">
          {fyLabel} (ends Dec 31) &middot; {monthsRemaining} mo left
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#ffc107',
              mr: 0.5,
              verticalAlign: 'middle',
            }}
          />
          Projected: {formatDollars(projectedTotal)}
        </Typography>
      </Box>
    </Box>
  );
};

export default GoalTracker;
