import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import {
  Science as ResearchIcon,
  AccountBalance as CapacityIcon,
  Hub as NetworkIcon,
} from '@mui/icons-material';

import GivingCapacity from './GivingCapacity';
import NetworkMap from './NetworkMap';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Research: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Research
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<CapacityIcon />} iconPosition="start" label="Giving Capacity" />
        <Tab icon={<NetworkIcon />} iconPosition="start" label="Network Map" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <GivingCapacity />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <NetworkMap />
      </TabPanel>
    </Box>
  );
};

export default Research;
