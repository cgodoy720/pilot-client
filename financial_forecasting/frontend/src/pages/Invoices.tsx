import React from 'react';
import { Box, Typography, Card, CardContent, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

const Invoices: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoices & Payment Tracking
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Phase 2 Feature - Coming Soon
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Requires Sage Intacct Integration</strong><br />
        This feature will be available once the Sage Intacct developer license is configured.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            Invoice Creation
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Bookkeeper will be able to create invoices directly from closed grant opportunities, eliminating manual invoice creation from word-of-mouth.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="View all opportunities in 'Collecting / In Effect' stage that need invoicing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Create invoices in Sage Intacct directly from the platform"
                secondary="Auto-pulls account name, contact info, amount, and payment schedule"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Invoices automatically linked back to Salesforce opportunity records"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><SyncIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Real-time validation that invoice totals match opportunity amounts"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="success" />
            Payment Tracking
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Track which payments have been received against expected payment schedules, with automatic syncing between Salesforce and Sage Intacct.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="View all expected payments from payment schedules across active grants"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Mark individual payments as 'Received' when payment comes in"
                secondary="Updates sync to both Salesforce and Sage Intacct in real-time"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="View overdue payments (7+ days past expected date)"
                secondary="Automatic notifications for overdue payments"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary="Filter and export payment data by account, date range, or status"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Invoices;
