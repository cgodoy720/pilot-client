import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
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
  CircularProgress,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { addQuarters, startOfQuarter, endOfQuarter, format, isWithinInterval, differenceInDays, parseISO } from 'date-fns';
import PipelineFunnel from '../components/PipelineFunnel';
import ConnectPrompt from '../components/ConnectPrompt';

const DashboardBelowFoldCharts = lazy(() => import('../components/DashboardBelowFoldCharts'));

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
  Type?: string;
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
  const { user } = useAuth();
  const [showBelowFold, setShowBelowFold] = useState(false);

  // Defer below-fold content so Hero/Quarterly/Funnel paint first
  useEffect(() => {
    const t = setTimeout(() => setShowBelowFold(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch opportunities
  const { data: opportunitiesData, isLoading } = useQuery(
    'opportunities',
    async () => {
      const response = await apiService.getOpportunities();
      return response.data;
    }
  );

  // Fetch cash flow summary from Sage Intacct + Salesforce
  const { data: cashFlowData, isLoading: cashFlowLoading } = useQuery(
    'cashflow-summary',
    async () => {
      const response = await apiService.getCashFlowSummary();
      return response.data;
    },
    {
      retry: 2,
    }
  );

  // Ensure opportunities is always an array
  const opportunities = Array.isArray(opportunitiesData) 
    ? opportunitiesData 
    : (opportunitiesData?.opportunities || opportunitiesData?.data || []);

  // Extract cash flow summary - API returns {summary, monthly_breakdown, sage_warning} directly
  // Always provide default values so cards show even when Sage is unavailable
  const cashFlowSummary = cashFlowData?.summary || {
    current_cash: 0,
    accounts_receivable: 0,
    accounts_payable: 0,
    net_cash_position: 0,
    avg_monthly_expenses: 0,
    runway_months: 999,
    forecasted_revenue_6mo: 0
  };
  const monthlyBreakdown = cashFlowData?.monthly_breakdown || [];


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

    const weightedValue = (opp: Opportunity) => ((opp.Amount || 0) * (opp.Probability || 0)) / 100;
    const isRenewal = (opp: Opportunity) => opp.Type === 'Renewal';

    const upside = weightedPipeline;

    const baseCaseOpps = openOpps.filter((opp: Opportunity) => isRenewal(opp) || (opp.Probability || 0) >= 50);
    const baseCase = baseCaseOpps.reduce((sum: number, opp: Opportunity) => sum + weightedValue(opp), 0);

    const downsideOpps = openOpps.filter((opp: Opportunity) => isRenewal(opp) || (opp.Probability || 0) >= 70);
    const downside = downsideOpps.reduce((sum: number, opp: Opportunity) => sum + weightedValue(opp), 0);

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
    const atRiskHighValueCount = atRiskDeals.filter((opp: Opportunity) => (opp.Amount || 0) >= 250000).length;

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

    // High-value stagnant: $250k+ with no activity in 30+ days
    const highValueStagnantOpps = openOpps.filter((opp: Opportunity) => {
      const lastModified = opp.LastModifiedDate ? parseISO(opp.LastModifiedDate) : parseISO(opp.CreatedDate);
      const daysSinceUpdate = differenceInDays(now, lastModified);
      return (opp.Amount || 0) >= 250000 && daysSinceUpdate > 30;
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
      upside,
      baseCase,
      baseCaseCount: baseCaseOpps.length,
      downside,
      downsideCount: downsideOpps.length,
      averageDealSize: openOpps.length > 0 ? totalPipeline / openOpps.length : 0,
      totalDeals: openOpps.length,
      currentQuarterValue,
      currentQuarterWeighted,
      currentQuarterCount: currentQuarterOpps.length,
      atRiskCount: atRiskDeals.length,
      atRiskDeals,
      atRiskHighValueCount,
      highValueStagnantCount: highValueStagnantOpps.length,
      highValueStagnantOpps,
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

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (!metrics || (!user?.salesforce_connected && opportunities.length === 0)) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>Overview</Typography>
        </Box>
        <ConnectPrompt service="Salesforce" message="Connect Salesforce in Settings to see your pipeline overview." />
      </Box>
    );
  }

  // Helper function for runway color
  const getRunwayColor = (months: number) => {
    if (months > 12) return 'success';
    if (months > 6) return 'warning';
    return 'error';
  };

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
          Overview
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Real-time financial pipeline visibility • Updated: {format(new Date(), 'PPpp')}
        </Typography>
      </Box>

      {/* Revenue Section */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Revenue Pipeline</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Based on opportunity close dates and probability weighting
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
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
          <Card sx={{ borderTop: '3px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="caption" color="textSecondary">
                  Upside
                </Typography>
                <MuiTooltip title="All open opportunities weighted by probability: Amount × (Probability / 100)" arrow>
                  <InfoIcon sx={{ fontSize: 14, ml: 0.5, color: 'text.disabled', cursor: 'help' }} />
                </MuiTooltip>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatDollarMillions(metrics.upside)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.totalDeals} opps, probability-weighted
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '3px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ChartIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="caption" color="textSecondary">
                  Base Case
                </Typography>
                <MuiTooltip title="Includes opportunities where Type = Renewal OR Probability ≥ 50%. Weighted by probability." arrow>
                  <InfoIcon sx={{ fontSize: 14, ml: 0.5, color: 'text.disabled', cursor: 'help' }} />
                </MuiTooltip>
              </Box>
              <Typography variant="h4" color="primary">
                {formatDollarMillions(metrics.baseCase)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.baseCaseCount} opps (renewals + 50%+)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '3px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="caption" color="textSecondary">
                  Downside
                </Typography>
                <MuiTooltip title="Includes opportunities where Type = Renewal OR Probability ≥ 70%. Weighted by probability." arrow>
                  <InfoIcon sx={{ fontSize: 14, ml: 0.5, color: 'text.disabled', cursor: 'help' }} />
                </MuiTooltip>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatDollarMillions(metrics.downside)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {metrics.downsideCount} opps (renewals + 70%+)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Quarter Focus */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            Current Quarter ({format(startOfQuarter(new Date()), 'QQQ yyyy')})
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  High-value stagnant
                </Typography>
                <Typography variant="h5" color={metrics.highValueStagnantCount > 0 ? 'warning.main' : 'text.primary'}>
                  {metrics.highValueStagnantCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Deals over $250k, no activity in 30+ days
                </Typography>
                {metrics.highValueStagnantCount > 0 && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => navigate('/pipeline', { state: { filterStale: true } })}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Deals at Risk
                </Typography>
                <Typography variant="h5" color={metrics.atRiskCount > 0 ? 'warning.main' : 'text.primary'}>
                  {metrics.atRiskCount}
                </Typography>
                {metrics.atRiskHighValueCount > 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                    {metrics.atRiskHighValueCount} over $250k
                  </Typography>
                )}
                {metrics.atRiskCount > 0 && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => navigate('/pipeline', { state: { filterAtRisk: true } })}
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

      {/* Top 5 by strategic value (Amount × Probability) */}
      {(() => {
        const openOpps = opportunities.filter((o: Opportunity) => OPEN_STAGES.includes(o.StageName));
        const topByYield = [...openOpps]
          .map((o: Opportunity) => ({ ...o, yield: ((o.Amount || 0) * (o.Probability || 0)) / 100 }))
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 5);
        if (topByYield.length === 0) return null;
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                Largest by strategic value (Amount × Probability)
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {topByYield.map((o: Opportunity & { yield: number }) => (
                  <Typography key={o.Id} component="li" variant="body2" sx={{ py: 0.25 }}>
                    {o.Name} — {formatDollarMillions(o.yield)}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })()}

      {/* Pipeline Health Funnel */}
      <PipelineFunnel opportunities={opportunities} />

      {/* Below-fold: Cash Flow + charts (lazy-loaded for faster initial paint) */}
      {showBelowFold && (
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={30} />
            </Box>
          }
        >
          <DashboardBelowFoldCharts
            cashFlowData={cashFlowData}
            cashFlowSummary={cashFlowSummary}
            monthlyBreakdown={monthlyBreakdown}
            quarterChartData={quarterChartData}
            cashFlowLoading={cashFlowLoading}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default Dashboard;
