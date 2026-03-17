/**
 * Summary metric cards shown above the Opportunities DataGrid.
 * Renders different cards depending on the active view mode.
 */
import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import { formatDollarMillions } from '../../utils/formatters';
import type { Opportunity } from './helpers';
import type { ViewMode } from './useOpportunityData';

interface SummaryCardsProps {
  viewMode: ViewMode;
  opps: Opportunity[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ viewMode, opps }) => {
  if (viewMode === 'closed') return null;

  const totalAmount = opps.reduce((sum, opp) => sum + (opp.Amount || 0), 0);

  if (viewMode === 'open') {
    const weightedPipeline = opps.reduce(
      (sum, opp) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0,
    );
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEndDate = endOfMonth(now);
    const closingThisMonth = opps.filter((opp) => {
      if (!opp.CloseDate) return false;
      const d = parseISO(opp.CloseDate);
      return d >= monthStart && d <= monthEndDate;
    });
    const closingAmount = closingThisMonth.reduce((s, o) => s + (o.Amount || 0), 0);
    const today = startOfDay(now);
    const staleCount = opps.filter(
      (opp) => opp.LastModifiedDate && differenceInDays(today, parseISO(opp.LastModifiedDate)) > 30,
    ).length;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Open Opportunities</Typography>
              <Typography variant="h4">{opps.length}</Typography>
              <Typography variant="body2" color="textSecondary">Active deals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Total Pipeline Value</Typography>
              <Typography variant="h4">{formatDollarMillions(totalAmount)}</Typography>
              <Typography variant="body2" color="textSecondary">Potential revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Weighted Pipeline</Typography>
              <Typography variant="h4" color="primary.main">{formatDollarMillions(weightedPipeline)}</Typography>
              <Typography variant="body2" color="textSecondary">Expected value</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Avg Deal Size</Typography>
              <Typography variant="h4">{formatDollarMillions(totalAmount / (opps.length || 1))}</Typography>
              <Typography variant="body2" color="textSecondary">Per opportunity</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Closing This Month</Typography>
              <Typography variant="h4" color="warning.main">{formatDollarMillions(closingAmount)}</Typography>
              <Typography variant="body2" color="textSecondary">{closingThisMonth.length} deal{closingThisMonth.length !== 1 ? 's' : ''}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: staleCount > 0 ? 'error.50' : undefined }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">Stale Deals</Typography>
              <Typography variant="h4" color={staleCount > 0 ? 'error.main' : undefined}>{staleCount}</Typography>
              <Typography variant="body2" color="textSecondary">No activity 30+ days</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // viewMode === 'collecting'
  const received = opps.reduce((sum, opp) => sum + (opp.npe01__Payments_Made__c || 0), 0);
  const outstanding = opps.reduce((sum, opp) => sum + ((opp.Amount || 0) - (opp.npe01__Payments_Made__c || 0)), 0);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">Active Grants</Typography>
            <Typography variant="h4">{opps.length}</Typography>
            <Typography variant="body2" color="textSecondary">In collection</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">Total Expected</Typography>
            <Typography variant="h4">{formatDollarMillions(totalAmount)}</Typography>
            <Typography variant="body2" color="textSecondary">Awarded amount</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'success.50' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">Payments Received</Typography>
            <Typography variant="h4" color="success.main">{formatDollarMillions(received)}</Typography>
            <Typography variant="body2" color="textSecondary">
              {totalAmount > 0 ? Math.round((received / totalAmount) * 100) : 0}% received
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'warning.50' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">Outstanding</Typography>
            <Typography variant="h4" color="warning.main">{formatDollarMillions(outstanding)}</Typography>
            <Typography variant="body2" color="textSecondary">
              {totalAmount > 0 ? Math.round((outstanding / totalAmount) * 100) : 0}% remaining
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
