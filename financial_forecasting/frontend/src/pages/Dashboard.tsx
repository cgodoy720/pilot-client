import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    async () => {
      const response = await apiService.getDashboard({ date_range_days: 180 });
      return response.data;
    },
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Financial Forecasting Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Financial Forecasting Dashboard
        </Typography>
        <Alert severity="error">
          Failed to load dashboard data. Please check your connection and try again.
        </Alert>
      </Box>
    );
  }

  const metrics = dashboardData?.current_metrics || {};
  const pipeline = dashboardData?.pipeline_summary || {};
  const cashFlowData = dashboardData?.cash_flow_chart_data || [];
  const paymentForecasts = dashboardData?.payment_forecast_data || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Forecasting Dashboard
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Real-time view of your grant pipeline and cash flow projections
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Pipeline
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(metrics.total_pipeline_value)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {pipeline.total_opportunities} opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Weighted Pipeline
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(metrics.weighted_pipeline_value)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Expected value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  30-Day Expected
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(metrics.expected_revenue_30_days)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Next month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  At Risk
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(metrics.at_risk_opportunities_amount)}
              </Typography>
              <Typography variant="body2" color="error.main">
                Needs attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cash Flow Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cash Flow Projection (Next 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="receipts" fill="#4caf50" name="Expected Receipts" />
                  <Bar dataKey="payments" fill="#f44336" name="Projected Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pipeline Health Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Win Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatPercent(metrics.win_rate)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.win_rate * 100}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Collection Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatPercent(metrics.payment_collection_rate)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.payment_collection_rate * 100}
                  color="success"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Average Grant Size: {formatCurrency(metrics.average_deal_size)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Sales Cycle: {metrics.average_sales_cycle_days} days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Expected Opportunities
              </Typography>
              <Box sx={{ mt: 2 }}>
                {paymentForecasts.slice(0, 5).map((forecast: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < 4 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {forecast.opportunity_name.substring(0, 40)}
                        {forecast.opportunity_name.length > 40 ? '...' : ''}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {forecast.account_name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(forecast.expected_amount)}
                      </Typography>
                      <Chip
                        label={`${(forecast.probability * 100).toFixed(0)}%`}
                        size="small"
                        color={forecast.probability > 0.5 ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
