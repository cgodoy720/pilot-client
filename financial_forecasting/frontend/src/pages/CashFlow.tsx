import React from 'react';
import { Box, Typography, Card, CardContent, Alert, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const CashFlow: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cash Flow Projections
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Enhanced cash flow analysis and scenario planning
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Cash Flow Chart Available on Overview</strong><br />
        Basic quarterly cash flow projections are already visible on the Overview dashboard. This page will provide enhanced analysis and detailed breakdowns.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceIcon color="primary" />
            Quarterly & Annual Projections
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Detailed cash flow forecasting based on opportunity close dates, payment schedules, and probability-weighted amounts.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Quarter-by-quarter cash flow projections for the next 8 quarters"
                secondary="Based on expected close dates and payment schedules"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Probability-weighted projections for realistic forecasting"
                secondary="Adjusts based on opportunity stage and probability percentage"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Breakdown by opportunity stage and account"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Annual view for long-term planning and capacity decisions"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                Scenario Planning
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Compare optimistic, realistic, and pessimistic scenarios
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Best case: 100% of weighted pipeline" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Realistic: Probability-adjusted" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Conservative: 70% of weighted pipeline" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="info" />
                Payment Schedule Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Track multi-year grant payment schedules
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="View all scheduled payments by month" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Identify payment concentration risks" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Compare expected vs. actual receipts" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="warning" />
            Coming Soon: Advanced Features
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Future enhancements will include burn rate analysis, runway calculations, and integration with actual spending data for variance reporting.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashFlow;
