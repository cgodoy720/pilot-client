import React, { useMemo, useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  BuildCircle as ToolsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Sync as SyncIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Home as HomeIcon,
  RateReview as ReviewIcon,
  Science as ResearchIcon,
  AccountTree as ProjectsIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import BedrockLogo from './BedrockLogo';
import NotificationDropdown from './NotificationDropdown';
import { InboxTask } from './TaskInbox';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 72;

interface LayoutProps {
  children: React.ReactNode;
}

const ALL_MENU_ITEMS = [
  { text: 'Priorities', icon: <HomeIcon />, path: '/priorities' },
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Pipeline', icon: <TrendingUpIcon />, path: '/pipeline' },
  { text: 'Auto Review', icon: <ReviewIcon />, path: '/automation-review' },
  { text: 'Research', icon: <ResearchIcon />, path: '/research' },
  { text: 'Pebble', icon: <SearchIcon />, path: '/pebble' },
  { text: 'Import', icon: <UploadIcon />, path: '/prospect-import' },
  { text: 'Cashflow', icon: <AttachMoneyIcon />, path: '/cashflow' },
  { text: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
  { text: 'Data Tools', icon: <ToolsIcon />, path: '/data-tools' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const MVP_PATHS = new Set(['/priorities', '/dashboard', '/pipeline', '/pebble', '/projects', '/prospect-import', '/settings']);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, connectSalesforce } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  // MVP nav: show Priorities, Dashboard, Pipeline, Settings. Set REACT_APP_NAV_PHASE=FULL for all pages.
  const navPhase = process.env.REACT_APP_NAV_PHASE || 'MVP';
  const menuItems = useMemo(() => {
    if (navPhase === 'MVP') {
      return ALL_MENU_ITEMS.filter((item) => MVP_PATHS.has(item.path));
    }
    return ALL_MENU_ITEMS;
  }, [navPhase]);

  // Prefetch opportunities when authenticated so Priorities/Dashboard load instantly
  useEffect(() => {
    if (!user) return;
    queryClient.prefetchQuery('opportunities', () => apiService.getOpportunities());
  }, [user, queryClient]);
  const [drawerHovered, setDrawerHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [syncAnchorEl, setSyncAnchorEl] = useState<null | HTMLElement>(null);

  // Query for health status
  const { refetch: refetchHealth } = useQuery(
    'health',
    () => apiService.servicesHealth(),
    {
      onError: (error) => {
        console.error('Health check failed:', error);
      },
    }
  );

  // Fetch tasks for notification dropdown (React Query dedupes with MyDashboard)
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['my-tasks'],
    async () => {
      const response = await apiService.getMyTasks();
      return response.data?.data || response.data || [];
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const inboxTasks: InboxTask[] = useMemo(() => {
    const raw = Array.isArray(tasksData) ? tasksData : [];
    return raw.map((t: any) => ({
      Id: t.Id,
      Subject: t.Subject || 'Untitled Task',
      Status: t.Status || 'Not Started',
      Priority: t.Priority || 'Normal',
      ActivityDate: t.ActivityDate || null,
      Description: t.Description || null,
      OwnerId: t.OwnerId,
      OwnerName: t.Owner?.Name || t.OwnerName || null,
      CreatedById: t.CreatedById || null,
      CreatedByName: t.CreatedBy?.Name || null,
      WhatId: t.WhatId || null,
      OpportunityName: null,
    }));
  }, [tasksData]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSyncMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSyncAnchorEl(event.currentTarget);
  };

  const handleSyncMenuClose = () => {
    setSyncAnchorEl(null);
  };

  const handleSync = async (syncType: string) => {
    try {
      await apiService.triggerSync(syncType as 'all' | 'salesforce' | 'intacct');
      toast.success(`${syncType} sync triggered successfully`);
      refetchHealth();
    } catch (error) {
      toast.error(`Failed to trigger ${syncType} sync`);
    }
    handleSyncMenuClose();
  };

  const isExpanded = isMobile || drawerHovered;
  const currentDrawerWidth = isExpanded ? drawerWidth : collapsedDrawerWidth;

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: isExpanded ? 'flex-start' : 'center', gap: 1 }}>
        <BedrockLogo sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
        {isExpanded && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600 }}
          >
            Bedrock
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                justifyContent: isExpanded ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isExpanded ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ display: isExpanded ? 'block' : 'none' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsedDrawerWidth}px)` },
          ml: { md: `${collapsedDrawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, height: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: '1.1rem' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Overview'}
          </Typography>

          {/* Sync Menu */}
          <IconButton
            color="inherit"
            onClick={handleSyncMenuOpen}
            sx={{ mr: 1 }}
          >
            <SyncIcon />
          </IconButton>
          <Menu
            anchorEl={syncAnchorEl}
            open={Boolean(syncAnchorEl)}
            onClose={handleSyncMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleSync('all')}>Sync All Data</MenuItem>
            <MenuItem onClick={() => handleSync('salesforce')}>Sync Salesforce</MenuItem>
            <MenuItem onClick={() => handleSync('intacct')}>Sync Sage Intacct</MenuItem>
          </Menu>

          {/* Action Items Dropdown */}
          <NotificationDropdown tasks={inboxTasks} loading={tasksLoading} />

          {/* SF Connection Indicator */}
          {!user?.salesforce_connected && (
            <Chip
              icon={<CloudOffIcon />}
              label="Connect SF"
              size="small"
              color="warning"
              variant="outlined"
              onClick={() => connectSalesforce()}
              sx={{ mr: 1, cursor: 'pointer', display: { xs: 'none', sm: 'flex' } }}
            />
          )}

          {/* Profile Menu */}
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            {user?.picture ? (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  user?.salesforce_connected 
                    ? <CloudIcon sx={{ fontSize: 12, color: 'success.main' }} />
                    : null
                }
              >
                <Avatar src={user.picture} sx={{ width: 32, height: 32 }} />
              </Badge>
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.name?.charAt(0) || <AccountCircleIcon />}
              </Avatar>
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'No email'}
              </Typography>
              {user?.salesforce_connected ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CloudIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    SF: {user.salesforce_user_name}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CloudOffIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography variant="caption" color="warning.main">
                    Salesforce not connected
                  </Typography>
                </Box>
              )}
            </Box>
            <Divider />
            {!user?.salesforce_connected && (
              <MenuItem onClick={() => { handleProfileMenuClose(); connectSalesforce(); }}
                sx={{ color: 'primary.main' }}>
                <CloudIcon sx={{ mr: 1, fontSize: 18 }} />
                Connect Salesforce
              </MenuItem>
            )}
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
              Settings
            </MenuItem>
            <MenuItem onClick={async () => { 
              handleProfileMenuClose(); 
              try {
                await apiService.clearCache();
                toast.success('Cache cleared — data will refresh');
              } catch { 
                toast.error('Failed to clear cache'); 
              }
            }}>
              Refresh Data
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); logout(); }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: collapsedDrawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          onMouseEnter={() => setDrawerHovered(true)}
          onMouseLeave={() => setDrawerHovered(false)}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              borderRight: '1px solid #e0e0e0',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxShadow: isExpanded ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
              zIndex: isExpanded ? 1200 : 'auto',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pt: 1,
          width: { md: `calc(100% - ${collapsedDrawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', height: 64 }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

