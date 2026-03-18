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
  CircularProgress,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  AccountBalance as AccountBalanceIcon,
  Timer as TimerIcon,
  Receipt as ReceiptIcon,
  InfoOutlined as InfoIcon,
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
  ComposedChart,
  Area,
} from 'recharts';
import { addQuarters, startOfQuarter, endOfQuarter, format, isWithinInterval, differenceInDays, parseISO } from 'date-fns';
import PipelineFunnel from '../components/PipelineFunnel';

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

  // Debug logging
  React.useEffect(() => {
    if (cashFlowData) {
      console.log('💰 Cash Flow Data:', cashFlowData);
      console.log('⚠️ Sage Warning:', cashFlowData?.sage_warning);
      console.log('📊 Summary:', cashFlowSummary);
      console.log('📅 Monthly Breakdown:', monthlyBreakdown);
    }
  }, [cashFlowData, cashFlowSummary, monthlyBreakdown]);

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

      {/* Pipeline Health Funnel */}
      <PipelineFunnel opportunities={opportunities} />

      {/* Cash Flow Section */}
      <Box sx={{ mt: 4, mb: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Cash Flow</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Based on payment schedules and Sage Intacct actuals
        </Typography>
      </Box>
      
      {/* Warning if Sage data unavailable */}
      {cashFlowData?.sage_warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {cashFlowData.sage_warning}
        </Alert>
      )}

      {cashFlowLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={30} />
          <Typography sx={{ ml: 2 }}>Loading cash flow data...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">
                      Cash on Hand
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="success.main">
                    {formatDollarMillions(cashFlowSummary.current_cash)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {cashFlowSummary.current_cash === 0 && cashFlowData?.sage_warning 
                      ? '⚠️ Awaiting Sage connection' 
                      : 'From Sage GL accounts'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ReceiptIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">
                      Outstanding Invoices
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="info.main">
                    {formatDollarMillions(cashFlowSummary.accounts_receivable)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {cashFlowSummary.accounts_receivable === 0 && cashFlowData?.sage_warning 
                      ? '⚠️ Awaiting Sage connection' 
                      : 'Accounts receivable (Sage)'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: cashFlowSummary.avg_monthly_expenses === 0 ? '#FEF3C7' : '#FEE2E2',
                border: cashFlowSummary.avg_monthly_expenses === 0 ? '1px solid #FCD34D' : '1px solid #FECACA'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingDownIcon 
                      sx={{ 
                        mr: 1,
                        color: cashFlowSummary.avg_monthly_expenses === 0 ? '#F59E0B' : '#DC2626'
                      }} 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Monthly Run Rate
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: cashFlowSummary.avg_monthly_expenses === 0 ? '#B45309' : '#DC2626',
                      fontWeight: 700
                    }}
                  >
                    {formatDollarMillions(cashFlowSummary.avg_monthly_expenses)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {cashFlowSummary.avg_monthly_expenses === 0 && cashFlowData?.sage_warning 
                      ? '⚠️ Awaiting Sage data' 
                      : cashFlowSummary.avg_monthly_expenses === 0
                        ? '📊 No expenses (last 3 months)'
                        : 'Avg monthly burn rate'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                bgcolor: cashFlowSummary.runway_months > 12 ? '#D1FAE5' : cashFlowSummary.runway_months > 6 ? '#FEF3C7' : '#FEE2E2',
                border: `1px solid ${cashFlowSummary.runway_months > 12 ? '#6EE7B7' : cashFlowSummary.runway_months > 6 ? '#FCD34D' : '#FECACA'}`
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimerIcon 
                      sx={{ 
                        mr: 1,
                        color: cashFlowSummary.runway_months > 12 ? '#059669' : cashFlowSummary.runway_months > 6 ? '#F59E0B' : '#DC2626'
                      }} 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Cash Runway
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: cashFlowSummary.runway_months > 12 ? '#059669' : cashFlowSummary.runway_months > 6 ? '#B45309' : '#DC2626',
                      fontWeight: 700
                    }}
                  >
                    {cashFlowSummary.runway_months === 999 ? '∞' : `${cashFlowSummary.runway_months} mo`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {cashFlowSummary.runway_months === 999 && cashFlowData?.sage_warning 
                      ? '⚠️ Awaiting data' 
                      : cashFlowSummary.runway_months === 999
                        ? '🚀 Unlimited (no expenses)'
                        : cashFlowSummary.runway_months < 6 
                          ? '⚠️ Requires attention!' 
                          : cashFlowSummary.runway_months < 12 
                            ? '⚡ Monitor closely' 
                            : '✅ Healthy position'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}


      {/* Financial Charts Section */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 2 }}>
        Financial Performance
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Cash Flow Waterfall Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                12-Month Cash Flow Forecast
              </Typography>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                Historical actuals + pipeline forecast • Past 6 months + Next 6 months
              </Typography>
              {monthlyBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={monthlyBreakdown} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month_name" 
                        tick={{ fontSize: 10, fill: '#6B7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#9CA3AF"
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#9CA3AF"
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#FFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number, name: string) => [formatDollarMillions(value), name]}
                        labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Revenue (Actual)" 
                        fill="url(#colorRevenue)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="expenses" 
                        name="Expenses (Actual)" 
                        fill="url(#colorExpenses)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="forecast" 
                        name="Pipeline Forecast" 
                        fill="url(#colorForecast)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        name="Net Cash Flow" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFF' }}
                        activeDot={{ r: 7 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      <strong style={{ color: '#10B981' }}>■</strong> <strong>Revenue (Actual):</strong> Payments received (Sage AR) {' • '}
                      <strong style={{ color: '#EF4444' }}>■</strong> <strong>Expenses (Actual):</strong> Posted expenses (Sage AP) {' • '}
                      <strong style={{ color: '#3B82F6' }}>■</strong> <strong>Pipeline Forecast:</strong> Weighted SF opportunities by probability
                    </Typography>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Cash flow data loading...
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Summary Cards */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                💰 CURRENT POSITION
              </Typography>
              <Typography variant="h4" sx={{ color: '#059669', fontWeight: 700, mb: 1 }}>
                {formatDollarMillions(cashFlowSummary.current_cash)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cash on Hand
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', display: 'block', mt: 1 }}>
                + {formatDollarMillions(cashFlowSummary.accounts_receivable)} AR
              </Typography>
              <Typography variant="caption" sx={{ color: '#DC2626', display: 'block' }}>
                - {formatDollarMillions(cashFlowSummary.accounts_payable)} AP
              </Typography>
              <Box sx={{ borderTop: '1px solid #BBF7D0', mt: 1, pt: 1 }}>
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                  = {formatDollarMillions(cashFlowSummary.net_cash_position)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Net Position
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                📈 6-MONTH FORECAST
              </Typography>
              <Typography variant="h4" sx={{ color: '#2563EB', fontWeight: 700, mb: 1 }}>
                {formatDollarMillions(cashFlowSummary.forecasted_revenue_6mo)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expected Revenue
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6B7280' }}>
                Based on {cashFlowData?.data_sources?.sf_opportunities_count || 0} open opportunities
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>
                Weighted by probability & payment dates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quarterly Projection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Projected Cash Inflow by Quarter (Next 8 Quarters)
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
    </Box>
  );
};

export default Dashboard;
