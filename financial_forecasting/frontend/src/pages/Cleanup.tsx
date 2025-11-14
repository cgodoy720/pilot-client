import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

import Opportunities from './Opportunities';
import InvoiceMatching from './InvoiceMatching';

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
      id={`cleanup-tabpanel-${index}`}
      aria-labelledby={`cleanup-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Cleanup() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Cleanup
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Data management and maintenance tools
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="cleanup tabs"
        >
          <Tab
            icon={<EditIcon />}
            iconPosition="start"
            label="Opportunities Bulk Edit"
            id="cleanup-tab-0"
            aria-controls="cleanup-tabpanel-0"
          />
          <Tab
            icon={<LinkIcon />}
            iconPosition="start"
            label="Invoice Matching"
            id="cleanup-tab-1"
            aria-controls="cleanup-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Opportunities />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <InvoiceMatching />
      </TabPanel>
    </Box>
  );
}

