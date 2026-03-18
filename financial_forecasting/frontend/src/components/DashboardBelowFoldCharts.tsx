/**
 * Below-fold Dashboard content: Cash Flow section and Financial Performance charts.
 * Lazy-loaded so Recharts stays out of the initial bundle for faster Hero/Quarterly/Funnel paint.
 */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Timer as TimerIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { formatDollarMillions } from '../utils/formatters';

export interface DashboardBelowFoldProps {
  cashFlowData: any;
  cashFlowSummary: {
    current_cash: number;
    accounts_receivable: number;
    accounts_payable: number;
    net_cash_position: number;
    avg_monthly_expenses: number;
    runway_months: number;
    forecasted_revenue_6mo: number;
  };
  monthlyBreakdown: Array<{
    month_name: string;
    revenue: number;
    expenses: number;
    forecast: number;
    net: number;
  }>;
  quarterChartData: Array<{ quarter: string; open: number; won: number; total: number }>;
  cashFlowLoading: boolean;
}

const DashboardBelowFoldCharts: React.FC<DashboardBelowFoldProps> = ({
  cashFlowData,
  cashFlowSummary,
  monthlyBreakdown,
  quarterChartData,
  cashFlowLoading,
}) => {
  return (
    <>
      {/* Cash Flow Section */}
      <Box sx={{ mt: 4, mb: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Cash Flow</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Based on payment schedules and Sage Intacct actuals
        </Typography>
      </Box>

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
            <Card
              sx={{
                bgcolor: cashFlowSummary.avg_monthly_expenses === 0 ? '#FEF3C7' : '#FEE2E2',
                border:
                  cashFlowSummary.avg_monthly_expenses === 0
                    ? '1px solid #FCD34D'
                    : '1px solid #FECACA',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon
                    sx={{
                      mr: 1,
                      color:
                        cashFlowSummary.avg_monthly_expenses === 0 ? '#F59E0B' : '#DC2626',
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Monthly Run Rate
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color:
                      cashFlowSummary.avg_monthly_expenses === 0 ? '#B45309' : '#DC2626',
                    fontWeight: 700,
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
            <Card
              sx={{
                bgcolor:
                  cashFlowSummary.runway_months > 12
                    ? '#D1FAE5'
                    : cashFlowSummary.runway_months > 6
                      ? '#FEF3C7'
                      : '#FEE2E2',
                border: `1px solid ${
                  cashFlowSummary.runway_months > 12
                    ? '#6EE7B7'
                    : cashFlowSummary.runway_months > 6
                      ? '#FCD34D'
                      : '#FECACA'
                }`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimerIcon
                    sx={{
                      mr: 1,
                      color:
                        cashFlowSummary.runway_months > 12
                          ? '#059669'
                          : cashFlowSummary.runway_months > 6
                            ? '#F59E0B'
                            : '#DC2626',
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Cash Runway
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color:
                      cashFlowSummary.runway_months > 12
                        ? '#059669'
                        : cashFlowSummary.runway_months > 6
                          ? '#B45309'
                          : '#DC2626',
                    fontWeight: 700,
                  }}
                >
                  {cashFlowSummary.runway_months === 999
                    ? '∞'
                    : `${cashFlowSummary.runway_months} mo`}
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
                    <ComposedChart
                      data={monthlyBreakdown}
                      margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
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
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number, name: string) => [
                          formatDollarMillions(value),
                          name,
                        ]}
                        labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
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
                      <strong style={{ color: '#10B981' }}>■</strong>{' '}
                      <strong>Revenue (Actual):</strong> Payments received (Sage AR) •{' '}
                      <strong style={{ color: '#EF4444' }}>■</strong>{' '}
                      <strong>Expenses (Actual):</strong> Posted expenses (Sage AP) •{' '}
                      <strong style={{ color: '#3B82F6' }}>■</strong>{' '}
                      <strong>Pipeline Forecast:</strong> Weighted SF opportunities by probability
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
                Based on {cashFlowData?.data_sources?.sf_opportunities_count || 0} open
                opportunities
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
            Expected cash inflow from open pipeline (probability-weighted) and remaining payments
            from won grants
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
            * Won grants: Remaining amount (total - payments received) distributed across future
            scheduled payments only
            <br />* Uses actual payment schedules (First Payment Date + Number of Payments +
            Frequency). Falls back to close date if schedule not set.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardBelowFoldCharts;
