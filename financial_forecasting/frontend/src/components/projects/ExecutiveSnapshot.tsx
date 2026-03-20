import React, { useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, LinearProgress,
} from '@mui/material';
import type { Workstream } from './types';
import { STATUS_CHIP } from './constants';
import { getWorkstreamProgress } from './helpers';

const ExecutiveSnapshot: React.FC<{ workstreams: Workstream[] }> = ({ workstreams }) => {
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let atRiskMilestones = 0;
    let totalMilestones = 0;

    for (const ws of workstreams) {
      for (const m of ws.milestones) {
        totalMilestones++;
        if (m.status === 'At Risk' || m.status === 'Needs Attention') atRiskMilestones++;
        for (const t of m.tasks) {
          totalTasks++;
          if (t.status === 'Completed') completedTasks++;
        }
      }
    }

    return { totalTasks, completedTasks, atRiskMilestones, totalMilestones };
  }, [workstreams]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{stats.completedTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Milestones</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalMilestones}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">At Risk</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: stats.atRiskMilestones > 0 ? 'warning.main' : 'text.primary' }}>
                {stats.atRiskMilestones}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {workstreams.map((ws) => {
        const progress = getWorkstreamProgress(ws);
        return (
          <Card key={ws.id} variant="outlined" sx={{ mb: 1.5 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2">{ws.name}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, height: 6, borderRadius: 3 }} />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {ws.milestones.map((m) => {
                  const sc = STATUS_CHIP[m.status] || { color: 'default' as const };
                  return (
                    <Chip
                      key={m.id}
                      size="small"
                      label={m.title}
                      color={sc.color}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default ExecutiveSnapshot;
