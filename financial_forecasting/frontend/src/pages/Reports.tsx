import React from 'react';
import { Box, Typography, Card, CardContent, Alert, List, ListItem, ListItemIcon, ListItemText, Grid, Chip } from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Executive reporting and data exports
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Enhanced Reporting Coming Soon</strong><br />
        Current pipeline data is visible on Overview and Opportunities pages. This section will provide exportable reports and deeper analytics.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Pipeline Reports
                </Typography>
                <Chip label="Planned" size="small" />
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Comprehensive pipeline analysis and forecasting reports
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Pipeline health report"
                    secondary="Stage conversion rates, velocity, and bottlenecks"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Win/loss analysis"
                    secondary="Historical win rates by stage, account type, and team member"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Forecast accuracy tracking"
                    secondary="Compare projected vs. actual close dates and amounts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Team performance metrics"
                    secondary="Opportunities by owner, close rates, and average deal size"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon color="success" />
                  Financial Reports
                </Typography>
                <Chip label="Planned" size="small" />
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Cash flow and revenue analysis for executive decision-making
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Quarterly revenue projections"
                    secondary="Probability-weighted forecasts by quarter"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Payment schedule report"
                    secondary="Expected vs. received payments with aging analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Funder relationship report"
                    secondary="Grant history, success rates, and payment patterns by account"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary="Concentration risk analysis"
                    secondary="Identify dependency on specific funders or time periods"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileDownloadIcon color="primary" />
            Data Exports
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Export pipeline and financial data for external analysis or board reporting
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <TableChartIcon color="action" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>CSV Export</Typography>
                <Typography variant="caption" color="textSecondary">
                  Full pipeline data with all fields
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <PieChartIcon color="action" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>Excel Reports</Typography>
                <Typography variant="caption" color="textSecondary">
                  Pre-formatted with charts and summaries
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <AssessmentIcon color="action" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>PDF Reports</Typography>
                <Typography variant="caption" color="textSecondary">
                  Executive summaries for board meetings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <ScheduleIcon color="action" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>Scheduled Reports</Typography>
                <Typography variant="caption" color="textSecondary">
                  Automatic weekly/monthly delivery
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Custom Report Builder
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Future functionality will include a custom report builder allowing users to select fields, apply filters, and create saved report templates for recurring analysis needs.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
