import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import Opportunities from './Opportunities';
import Accounts from './Accounts';
import Contacts from './Contacts';

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
      id={`pipeline-tabpanel-${index}`}
      aria-labelledby={`pipeline-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Pipeline() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Pipeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage opportunities, accounts, and contacts
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="pipeline tabs"
        >
          <Tab
            icon={<TrendingUpIcon />}
            iconPosition="start"
            label="Opportunities"
            id="pipeline-tab-0"
            aria-controls="pipeline-tabpanel-0"
          />
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label="Accounts"
            id="pipeline-tab-1"
            aria-controls="pipeline-tabpanel-1"
          />
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Contacts"
            id="pipeline-tab-2"
            aria-controls="pipeline-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Opportunities />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Accounts />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Contacts />
      </TabPanel>
    </Box>
  );
}

