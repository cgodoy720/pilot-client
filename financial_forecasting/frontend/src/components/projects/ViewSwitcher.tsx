import React from 'react';
import { ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewColumn as ViewColumnIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import type { ViewType } from './types';

interface ViewSwitcherProps {
  value: ViewType;
  onChange: (v: ViewType) => void;
}

const views: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: 'list', label: 'List', icon: <ViewListIcon fontSize="small" /> },
  { value: 'board', label: 'Board', icon: <ViewColumnIcon fontSize="small" /> },
  { value: 'timeline', label: 'Timeline', icon: <TimelineIcon fontSize="small" /> },
  { value: 'executive', label: 'Executive', icon: <BarChartIcon fontSize="small" /> },
];

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      sx={{ height: 32 }}
    >
      {views.map((v) => (
        <ToggleButton key={v.value} value={v.value} sx={{ textTransform: 'none', gap: 0.5, px: 1.5 }}>
          {v.icon}
          {!isSmall && v.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ViewSwitcher;
