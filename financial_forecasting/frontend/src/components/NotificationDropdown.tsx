import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircleOutline as AllCaughtUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { parseISO, startOfDay, isBefore, isEqual } from 'date-fns';
import { InboxTask, getDueBadge } from './TaskInbox';

interface NotificationDropdownProps {
  tasks: InboxTask[];
  loading?: boolean;
}

const MAX_ITEMS = 8;

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ tasks, loading }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { actionItems, overdueCount, dueTodayCount, badgeCount, badgeColor } = useMemo(() => {
    const now = startOfDay(new Date());

    const actionable = tasks
      .filter((t) => {
        if (t.Status === 'Completed') return false;
        if (!t.ActivityDate) return false;
        const due = parseISO(t.ActivityDate);
        return isBefore(due, now) || isEqual(due, now);
      })
      .sort((a, b) => {
        const aDue = a.ActivityDate ? parseISO(a.ActivityDate).getTime() : Infinity;
        const bDue = b.ActivityDate ? parseISO(b.ActivityDate).getTime() : Infinity;
        if (aDue !== bDue) return aDue - bDue;
        const priOrder: Record<string, number> = { High: 0, Normal: 1, Low: 2 };
        return (priOrder[a.Priority] ?? 1) - (priOrder[b.Priority] ?? 1);
      });

    let overdue = 0;
    let dueToday = 0;
    for (const t of actionable) {
      const due = parseISO(t.ActivityDate!);
      if (isBefore(due, now)) overdue++;
      else dueToday++;
    }

    let color: 'error' | 'warning' | 'default' = 'default';
    if (overdue > 0) color = 'error';
    else if (dueToday > 0) color = 'warning';

    return {
      actionItems: actionable.slice(0, MAX_ITEMS),
      overdueCount: overdue,
      dueTodayCount: dueToday,
      badgeCount: actionable.length,
      badgeColor: color,
    };
  }, [tasks]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleViewAll = () => {
    handleClose();
    navigate('/priorities');
  };

  return (
    <>
      <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleOpen}>
        <Badge
          badgeContent={badgeCount}
          color={badgeColor}
          invisible={badgeCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Action Items
          </Typography>
          {badgeCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {overdueCount > 0 && `${overdueCount} overdue`}
              {overdueCount > 0 && dueTodayCount > 0 && ' · '}
              {dueTodayCount > 0 && `${dueTodayCount} due today`}
            </Typography>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : actionItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <AllCaughtUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              You're all caught up
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ py: 0.5 }}>
            {actionItems.map((task) => {
              const badge = getDueBadge(task);
              return (
                <ListItem
                  key={task.Id}
                  sx={{
                    px: 2,
                    py: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                    borderLeft: badge?.color ? `3px solid ${badge.color}` : '3px solid transparent',
                  }}
                  onClick={handleViewAll}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ flex: 1, fontWeight: 500, maxWidth: 200 }}
                        >
                          {task.Subject}
                        </Typography>
                        {badge && (
                          <Typography
                            variant="caption"
                            sx={{ color: badge.color, fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            {badge.label}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={task.OpportunityName ? task.OpportunityName : undefined}
                    secondaryTypographyProps={{ noWrap: true, sx: { fontSize: '0.7rem' } }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}

        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" onClick={handleViewAll}>
            View all in Task Inbox
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
