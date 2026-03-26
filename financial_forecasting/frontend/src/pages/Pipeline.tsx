import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  MonetizationOn as MonetizationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PersonSearch as PersonSearchIcon,
} from '@mui/icons-material';

import Opportunities from './Opportunities';
import Accounts from './Accounts';
import Contacts from './Contacts';
import Leads from './Leads';
import { useSearchParams } from 'react-router-dom';
import ConnectPrompt from '../components/ConnectPrompt';
import { useAuth } from '../contexts/AuthContext';
import { DialogStackProvider, DialogStackRenderer } from '../contexts/DialogStackContext';

const TAB_MAP: Record<string, number> = {
  opportunities: 0,
  accounts: 1,
  contacts: 2,
  leads: 3,
};

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
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}

export default function Pipeline() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || '';
  const [currentTab, setCurrentTab] = useState(TAB_MAP[tabParam] ?? 0);

  // Sync tab when URL param changes (e.g., "View in Pipeline" from global search)
  useEffect(() => {
    if (tabParam && TAB_MAP[tabParam] !== undefined) {
      setCurrentTab(TAB_MAP[tabParam]);
    }
  }, [tabParam]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (!user?.salesforce_connected) {
    return (
      <Box>
        <ConnectPrompt service="Salesforce" message="Connect Salesforce to view pipeline data." />
      </Box>
    );
  }

  return (
    <DialogStackProvider>
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="pipeline tabs"
            sx={{ minHeight: 48 }}
          >
            <Tab
              icon={<MonetizationOnIcon />}
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
            <Tab
              icon={<PersonSearchIcon />}
              iconPosition="start"
              label="Leads"
              id="pipeline-tab-3"
              aria-controls="pipeline-tabpanel-3"
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

        <TabPanel value={currentTab} index={3}>
          <Leads />
        </TabPanel>
      </Box>
      <DialogStackRenderer />
    </DialogStackProvider>
  );
}

