import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  PendingActions as PendingActionsIcon,
} from '@mui/icons-material';

import FinanceDashboard from './FinanceDashboard';
import ReceivedPayments from './ReceivedPayments';
import PendingInvoices from './PendingInvoices';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`revenue-tabpanel-${index}`}
      aria-labelledby={`revenue-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Revenue() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Revenue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage payments, invoices, and collections
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="revenue tabs"
        >
          <Tab
            icon={<PaymentIcon />}
            iconPosition="start"
            label="Dashboard"
            id="revenue-tab-0"
            aria-controls="revenue-tabpanel-0"
          />
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label="Received Payments"
            id="revenue-tab-1"
            aria-controls="revenue-tabpanel-1"
          />
          <Tab
            icon={<PendingActionsIcon />}
            iconPosition="start"
            label="Pending Invoices"
            id="revenue-tab-2"
            aria-controls="revenue-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <FinanceDashboard />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <ReceivedPayments />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <PendingInvoices />
      </TabPanel>
    </Box>
  );
}

