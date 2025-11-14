import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { apiService } from '../services/api';

interface CashFlowSummary {
  summary: {
    current_cash: number;
    accounts_receivable: number;
    accounts_payable: number;
    net_cash_position: number;
    avg_monthly_expenses: number;
    runway_months: number;
    forecasted_revenue_6mo: number;
  };
  monthly_breakdown: Array<{
    month: string;
    month_name: string;
    revenue: number;
    expenses: number;
    net: number;
    forecast: number;
    is_past: boolean;
    is_current: boolean;
    is_future: boolean;
  }>;
  data_sources: {
    payments_count: number;
    invoices_count: number;
    expenses_count: number;
    gl_accounts_count: number;
    sf_opportunities_count: number;
  };
}

const formatCurrency = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CashFlow: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch comprehensive cash flow summary
  const { data: cashFlowData, isLoading, error } = useQuery<{ data: CashFlowSummary }, Error>(
    'cashflow-summary',
    async () => {
      const response = await apiService.getCashFlowSummary();
      return response.data;
    },
    {
      retry: 2,
    }
  );

  const summary = cashFlowData?.data?.summary;
  const monthlyData = cashFlowData?.data?.monthly_breakdown || [];
  const dataSources = cashFlowData?.data?.data_sources;

  const handleRefresh = () => {
    queryClient.invalidateQueries('cashflow-summary');
    toast.success('Refreshed cash flow data');
  };

  // Prepare chart data
  const chartData = monthlyData.map((month) => ({
    month: month.month_name.split(' ')[0], // Just the month name (e.g., "January")
    revenue: month.revenue,
    expenses: month.expenses,
    net: month.net,
    forecast: month.forecast,
    isPast: month.is_past,
    isCurrent: month.is_current,
    isFuture: month.is_future,
  }));

  // Split into past/current and future for different visualizations
  const historicalData = chartData.filter((d) => d.isPast || d.isCurrent);
  const forecastData = chartData.filter((d) => d.isCurrent || d.isFuture);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          <strong>Error loading cash flow data:</strong> {error.message}
          <br />
          Check your Sage Intacct and Salesforce connections.
        </Alert>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box>
        <Alert severity="warning">No cash flow data available.</Alert>
      </Box>
    );
  }

  // Determine runway color
  const getRunwayColor = (months: number) => {
    if (months > 12) return 'success';
    if (months > 6) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Cash Flow Tracking
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Comprehensive financial overview from Sage Intacct + Salesforce pipeline forecast
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} color="primary" title="Refresh data">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Data Sources Info */}
      {dataSources && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Data Sources:</strong> {dataSources.payments_count} payments, {dataSources.invoices_count} invoices,{' '}
          {dataSources.expenses_count} expenses from Sage Intacct + {dataSources.sf_opportunities_count} open opportunities from Salesforce
        </Alert>
      )}

      {/* Top Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceIcon color="success" fontSize="large" />
                <Typography variant="body2" color="textSecondary">
                  Cash on Hand
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                {formatCurrency(summary.current_cash)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                From Sage GL accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDownIcon color="error" fontSize="large" />
                <Typography variant="body2" color="textSecondary">
                  Monthly Run Rate
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {formatCurrency(summary.avg_monthly_expenses)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg expenses (last 3 months)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimerIcon color={getRunwayColor(summary.runway_months)} fontSize="large" />
                <Typography variant="body2" color="textSecondary">
                  Cash Runway
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: `${getRunwayColor(summary.runway_months)}.main`, fontWeight: 'bold' }}>
                {summary.runway_months === 999 ? '∞' : `${summary.runway_months} mo`}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                At current burn rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="primary" fontSize="large" />
                <Typography variant="body2" color="textSecondary">
                  Forecast (6mo)
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {formatCurrency(summary.forecasted_revenue_6mo)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Expected from SF pipeline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReceiptIcon color="info" />
                <Typography variant="body2" color="textSecondary">
                  Accounts Receivable
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'info.main' }}>
                {formatCurrency(summary.accounts_receivable)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Outstanding invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoneyIcon color="warning" />
                <Typography variant="body2" color="textSecondary">
                  Accounts Payable
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'warning.main' }}>
                {formatCurrency(summary.accounts_payable)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Outstanding expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceIcon color="success" />
                <Typography variant="body2" color="textSecondary">
                  Net Cash Position
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'success.main' }}>
                {formatCurrency(summary.net_cash_position)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Cash + AR - AP
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Historical Revenue vs Expenses */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historical Revenue vs Expenses
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4caf50" name="Revenue" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Forecast */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Forecast (Salesforce Pipeline)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="forecast" stroke="#2196f3" strokeWidth={2} name="Forecasted Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ff9800" strokeWidth={2} strokeDasharray="5 5" name="Projected Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Breakdown (Last 6 Months + Next 6 Months)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell align="right"><strong>Revenue</strong></TableCell>
                  <TableCell align="right"><strong>Expenses</strong></TableCell>
                  <TableCell align="right"><strong>Net</strong></TableCell>
                  <TableCell align="right"><strong>Forecast</strong></TableCell>
                  <TableCell align="center"><strong>Period</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyData.map((month, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: month.is_current ? 'primary.light' : 'inherit',
                      opacity: month.is_future ? 0.7 : 1,
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: month.is_current ? 'bold' : 'normal' }}>
                        {month.month_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        {formatCurrency(month.revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'error.main' }}>
                        {formatCurrency(month.expenses)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: month.net >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(month.net)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'primary.main' }}>
                        {month.forecast > 0 ? formatCurrency(month.forecast) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {month.is_past && <Chip label="Past" size="small" variant="outlined" />}
                      {month.is_current && <Chip label="Current" size="small" color="primary" />}
                      {month.is_future && <Chip label="Forecast" size="small" color="info" variant="outlined" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashFlow;
