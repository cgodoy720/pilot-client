import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { addQuarters, startOfQuarter, endOfQuarter, format, isWithinInterval, differenceInDays, parseISO } from 'date-fns';

interface Opportunity {
  Id: string;
  Name: string;
  AccountId: string;
  Account?: { Name: string };
  StageName: string;
  Amount: number;
  Probability: number;
  CloseDate: string;
  CreatedDate: string;
  LastModifiedDate: string;
  OwnerId: string;
  Owner?: { Name: string };
  First_Payment_Date__c?: string;
  Payment_Frequency__c?: string;
  Payment_Amount__c?: number;
  npe01__Number_of_Payments__c?: number;
  npe01__Payments_Made__c?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Open pipeline stages - anything actively being pursued
const OPEN_STAGES = [
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract'
];

const CLOSED_WON_STAGES = ['Closed Won', 'Closed / Completed', 'Collecting / In Effect', 'Collecting', 'In Collection', 'In Effect'];
const CLOSED_LOST_STAGES = ['Closed Lost', 'Withdrawn', 'Did not Fulfill', 'Closed / Did not Fulfill'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch opportunities
  const { data: opportunities, isLoading } = useQuery(
    'opportunities',
    async () => {
      const response = await apiService.getOpportunities();
      return response.data;
    }
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!opportunities) return null;

    const now = new Date();
    const currentQuarterStart = startOfQuarter(now);
    const currentQuarterEnd = endOfQuarter(now);

    // Filter open opportunities - only include stages actively being pursued
    const openOpps = opportunities.filter((opp: Opportunity) => {
      return OPEN_STAGES.includes(opp.StageName);
    });

    // Total pipeline
    const totalPipeline = openOpps.reduce((sum: number, opp: Opportunity) => sum + (opp.Amount || 0), 0);
    
    // Weighted pipeline
    const weightedPipeline = openOpps.reduce(
      (sum: number, opp: Opportunity) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );

    // Current quarter opportunities
    const currentQuarterOpps = openOpps.filter((opp: Opportunity) => {
      if (!opp.CloseDate) return false;
      const closeDate = parseISO(opp.CloseDate);
      return isWithinInterval(closeDate, { start: currentQuarterStart, end: currentQuarterEnd });
    });

    const currentQuarterValue = currentQuarterOpps.reduce((sum: number, opp: Opportunity) => sum + (opp.Amount || 0), 0);
    const currentQuarterWeighted = currentQuarterOpps.reduce(
      (sum: number, opp: Opportunity) => sum + ((opp.Amount || 0) * (opp.Probability || 0)) / 100,
      0
    );

    // At-risk deals (in current quarter but low probability or early stage)
    const atRiskDeals = currentQuarterOpps.filter((opp: Opportunity) => {
      return (opp.Probability || 0) < 50 || 
             ['Lead Gen', 'New Lead', 'Qualifying'].includes(opp.StageName || '');
    });

    // Stale opportunities
    const staleOpps = openOpps.filter((opp: Opportunity) => {
      if (!opp.CloseDate) return false;
      const closeDate = parseISO(opp.CloseDate);
      const isPastDue = closeDate < now;
      
      // Check if in same stage for 30+ days
      const lastModified = opp.LastModifiedDate ? parseISO(opp.LastModifiedDate) : parseISO(opp.CreatedDate);
      const daysSinceUpdate = differenceInDays(now, lastModified);
      const notUpdated = daysSinceUpdate > 30;

      return isPastDue || notUpdated;
    });

    // Win rate (trailing 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const closedOpps = opportunities.filter((opp: Opportunity) => {
      if (!opp.CloseDate) return false;
      const closeDate = parseISO(opp.CloseDate);
      const isClosed = CLOSED_WON_STAGES.some(stage => opp.StageName?.includes(stage)) ||
                       CLOSED_LOST_STAGES.some(stage => opp.StageName?.includes(stage));
      return isClosed && closeDate >= twelveMonthsAgo;
    });

    const wonOpps = closedOpps.filter((opp: Opportunity) =>
      CLOSED_WON_STAGES.some(stage => opp.StageName?.includes(stage))
    );
    
    const winRate = closedOpps.length > 0 ? (wonOpps.length / closedOpps.length) * 100 : 0;

    // Pipeline by stage (ordered funnel)
    const stageBreakdown: { [key: string]: { count: number; total: number; weighted: number } } = {};
    openOpps.forEach((opp: Opportunity) => {
      const stage = opp.StageName || 'Unknown';
      if (!stageBreakdown[stage]) {
        stageBreakdown[stage] = { count: 0, total: 0, weighted: 0 };
      }
      stageBreakdown[stage].count++;
      stageBreakdown[stage].total += opp.Amount || 0;
      stageBreakdown[stage].weighted += ((opp.Amount || 0) * (opp.Probability || 0)) / 100;
    });

    // Get won opportunities for cash flow projections
    const wonOppsForPayments = opportunities.filter((opp: Opportunity) =>
      CLOSED_WON_STAGES.some(stage => opp.StageName?.includes(stage))
    );

    // Helper function to calculate FUTURE payment schedule for an opportunity
    const getFuturePaymentDates = (opp: Opportunity): Date[] => {
      const dates: Date[] = [];
      
      if (opp.First_Payment_Date__c && opp.npe01__Number_of_Payments__c && opp.npe01__Number_of_Payments__c > 0) {
        // Use actual payment schedule
        const firstDate = parseISO(opp.First_Payment_Date__c);
        const numPayments = opp.npe01__Number_of_Payments__c;
        const frequency = opp.Payment_Frequency__c?.toLowerCase() || 'monthly';
        
        for (let i = 0; i < numPayments; i++) {
          let paymentDate = new Date(firstDate);
          
          // Calculate payment date based on frequency
          if (frequency.includes('annual') || frequency.includes('year')) {
            paymentDate.setFullYear(firstDate.getFullYear() + i);
          } else if (frequency.includes('quarter')) {
            paymentDate.setMonth(firstDate.getMonth() + (i * 3));
          } else if (frequency.includes('semi') || frequency.includes('bi-annual')) {
            paymentDate.setMonth(firstDate.getMonth() + (i * 6));
          } else { // default to monthly
            paymentDate.setMonth(firstDate.getMonth() + i);
          }
          
          // Only include future or current payments (not past ones)
          if (paymentDate >= now) {
            dates.push(paymentDate);
          }
        }
      } else if (opp.CloseDate) {
        // Fallback: use close date as payment date
        const closeDate = parseISO(opp.CloseDate);
        // Only include if it's in the future
        if (closeDate >= now) {
          dates.push(closeDate);
        }
      }
      
      return dates;
    };

    // Cash flow by quarter - includes BOTH open pipeline and won opportunities
    const quarters: { [key: string]: { open: number; won: number; total: number } } = {};
    for (let i = 0; i < 8; i++) {
      const quarterStart = addQuarters(currentQuarterStart, i);
      const quarterEnd = endOfQuarter(quarterStart);
      const quarterLabel = format(quarterStart, 'QQQ yyyy');

      let openValue = 0;
      let wonValue = 0;

      // Open opportunities - weighted by probability, distributed across payment schedule
      openOpps.forEach((opp: Opportunity) => {
        const paymentDates = getFuturePaymentDates(opp);
        if (paymentDates.length === 0) return; // Skip if no future payments
        
        const amountPerPayment = (opp.Amount || 0) / Math.max(paymentDates.length, 1);
        const weightedAmountPerPayment = (amountPerPayment * (opp.Probability || 0)) / 100;
        
        paymentDates.forEach((paymentDate) => {
          if (isWithinInterval(paymentDate, { start: quarterStart, end: quarterEnd })) {
            openValue += weightedAmountPerPayment;
          }
        });
      });

      // Won opportunities - at full value, distributed across REMAINING payment schedule
      wonOppsForPayments.forEach((opp: Opportunity) => {
        const paymentDates = getFuturePaymentDates(opp);
        if (paymentDates.length === 0) return; // Skip if no future payments
        
        // Calculate remaining amount (total minus what's already been paid)
        const totalAmount = opp.Amount || 0;
        const paidAmount = opp.npe01__Payments_Made__c || 0;
        const remainingAmount = totalAmount - paidAmount;
        
        // Distribute remaining amount across future payments
        const amountPerPayment = remainingAmount / Math.max(paymentDates.length, 1);
        
        paymentDates.forEach((paymentDate) => {
          if (isWithinInterval(paymentDate, { start: quarterStart, end: quarterEnd })) {
            wonValue += amountPerPayment;
          }
        });
      });

      quarters[quarterLabel] = {
        open: openValue,
        won: wonValue,
        total: openValue + wonValue
      };
    }

    return {
      totalPipeline,
      weightedPipeline,
      averageDealSize: openOpps.length > 0 ? totalPipeline / openOpps.length : 0,
      totalDeals: openOpps.length,
      currentQuarterValue,
      currentQuarterWeighted,
      currentQuarterCount: currentQuarterOpps.length,
      atRiskCount: atRiskDeals.length,
      atRiskDeals,
      staleCount: staleOpps.length,
      staleOpps,
      winRate,
      wonCount: wonOpps.length,
      lostCount: closedOpps.length - wonOpps.length,
      stageBreakdown,
      quarters,
    };
  }, [opportunities]);

  // Using formatDollarMillions from utils instead

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading || !metrics) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  // Prepare funnel data (in order of sales process)
  const funnelData = OPEN_STAGES.map((stage) => {
    const data = metrics.stageBreakdown[stage] || { count: 0, total: 0, weighted: 0 };
    return {
      name: stage,
      value: data.weighted,
      count: data.count,
      total: data.total,
      fill: COLORS[OPEN_STAGES.indexOf(stage) % COLORS.length],
    };
  }).filter(item => item.count > 0); // Only show stages with opportunities

  // Cash flow chart data - includes both open and won opportunities
  const quarterChartData = Object.entries(metrics.quarters).map(([quarter, data]) => ({
    quarter,
    open: data.open,
    won: data.won,
    total: data.total,
  }));

  const winLossData = [
    { name: 'Won', value: metrics.wonCount, color: '#00C49F' },
    { name: 'Lost', value: metrics.lostCount, color: '#FF8042' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Executive Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Real-time financial pipeline visibility • Updated: {format(new Date(), 'PPpp')}
        </Typography>
      </Box>

      {/* Hero Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Total Pipeline
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatDollarMillions(metrics.totalPipeline)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.totalDeals} active opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Weighted Pipeline
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatDollarMillions(metrics.weightedPipeline)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Expected value (probability-adjusted)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Win Rate (12mo)
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatPercent(metrics.winRate)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.wonCount} won / {metrics.wonCount + metrics.lostCount} closed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ChartIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Avg Deal Size
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatDollarMillions(metrics.averageDealSize)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Per opportunity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Quarter Focus */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            Current Quarter ({format(startOfQuarter(new Date()), 'QQQ yyyy')})
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Expected to Close
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatDollarMillions(metrics.currentQuarterValue)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {metrics.currentQuarterCount} opportunities
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Weighted Value
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatDollarMillions(metrics.currentQuarterWeighted)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Probability-adjusted
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Deals at Risk
                </Typography>
                <Typography variant="h5" color={metrics.atRiskCount > 0 ? 'warning.main' : 'text.primary'}>
                  {metrics.atRiskCount}
                </Typography>
                {metrics.atRiskCount > 0 && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => navigate('/opportunities')}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Needs Attention */}
      {metrics.staleCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          icon={<WarningIcon />}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/opportunities')}
            >
              Review
            </Button>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            {metrics.staleCount} Opportunit{metrics.staleCount === 1 ? 'y' : 'ies'} Need Attention
          </Typography>
          <Typography variant="body2">
            These opportunities have passed their close date or haven't been updated in 30+ days
          </Typography>
        </Alert>
      )}

      {/* Charts Row 1 - Pipeline by Stage & Win Rate */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pipeline by Stage - Horizontal Bars */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pipeline by Stage
              </Typography>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                Weighted value (probability-adjusted) through sales process
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={funnelData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={180}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      if (name === 'Weighted Value') {
                        return [
                          `${formatDollarMillions(value)} (${props.payload.count} opps, ${formatDollarMillions(props.payload.total)} total)`,
                          'Weighted Value'
                        ];
                      }
                      return [formatDollarMillions(value), name];
                    }}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Weighted Value" fill="#00C49F">
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Win Rate */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Win/Loss (12mo)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h4" color="success.main">
                  {formatPercent(metrics.winRate)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Win Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cash Flow Projection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Projected Cash Flow (Next 8 Quarters)
          </Typography>
          <Typography variant="caption" color="textSecondary" gutterBottom display="block">
            Expected cash inflow from open pipeline (probability-weighted) and remaining payments from won grants
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={quarterChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(value: number) => formatDollarMillions(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="won" stackId="a" name="Won Grants (100%)" fill="#00C49F" />
              <Bar dataKey="open" stackId="a" name="Open Pipeline (Weighted)" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            * Open pipeline: Total amount weighted by probability, distributed across payment schedule
            <br />
            * Won grants: Remaining amount (total - payments received) distributed across future scheduled payments only
            <br />
            * Uses actual payment schedules (First Payment Date + Number of Payments + Frequency). Falls back to close date if schedule not set.
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => navigate('/opportunities')}
            startIcon={<TrendingUpIcon />}
          >
            View All Opportunities
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => navigate('/opportunities/new')}
          >
            Create New Opportunity
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => navigate('/accounts')}
          >
            View Funders
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
