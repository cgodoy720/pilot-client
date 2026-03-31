import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
  StickyNote2 as NoteIcon,
  Chat as ChatIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useActivities } from '../hooks/useActivities';
import type { Activity, ActivityType } from '../types/activity';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { icon: React.ReactElement; color: string; label: string }> = {
  call: { icon: <PhoneIcon fontSize="small" />, color: 'success.main', label: 'Call' },
  email: { icon: <EmailIcon fontSize="small" />, color: 'info.main', label: 'Email' },
  meeting: { icon: <GroupsIcon fontSize="small" />, color: 'secondary.main', label: 'Meeting' },
  note: { icon: <NoteIcon fontSize="small" />, color: 'warning.main', label: 'Note' },
  'slack-message': { icon: <ChatIcon fontSize="small" />, color: 'warning.dark', label: 'Slack' },
  'calendar-event': { icon: <CalendarIcon fontSize="small" />, color: 'info.dark', label: 'Calendar' },
};

const ALL_ACTIVITY_TYPES: ActivityType[] = ['call', 'email', 'meeting', 'note', 'slack-message', 'calendar-event'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityTimelineProps {
  opportunityId?: string;
  accountId?: string;
  contactId?: string;
  maxHeight?: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Format a date group header */
function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d, yyyy');
}

/** Group activities by date (yyyy-MM-dd of activity_date) */
function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  for (const activity of activities) {
    const dateKey = activity.activity_date
      ? format(parseISO(activity.activity_date), 'yyyy-MM-dd')
      : 'unknown';
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(activity);
    } else {
      groups.set(dateKey, [activity]);
    }
  }
  return groups;
}

/** Single activity card */
function ActivityCard({
  activity,
  expanded,
  onToggle,
  currentEntityType,
}: {
  activity: Activity;
  expanded: boolean;
  onToggle: () => void;
  currentEntityType: 'opportunity' | 'account' | 'contact';
}) {
  const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.note;
  const activityDate = activity.activity_date ? parseISO(activity.activity_date) : null;

  const hasExpandableContent =
    activity.description ||
    activity.email_from ||
    activity.meeting_attendees?.length ||
    activity.meeting_duration_minutes ||
    activity.meeting_location ||
    (activity.attachments && activity.attachments.length > 0);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 1.5,
        px: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        cursor: hasExpandableContent ? 'pointer' : 'default',
      }}
      onClick={hasExpandableContent ? onToggle : undefined}
    >
      {/* Type icon gutter */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${config.color}`,
          color: 'white',
          flexShrink: 0,
          mt: 0.25,
          '& .MuiSvgIcon-root': { color: 'white' },
        }}
      >
        {config.icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header row: subject + metadata */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.4 }} noWrap>
            {activity.subject}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Chip label={config.label} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            {activityDate && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {format(activityDate, 'h:mm a')}
              </Typography>
            )}
            {hasExpandableContent && (
              <IconButton size="small" sx={{ p: 0.25 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Description snippet (2-line clamp) */}
        {(activity.email_snippet || activity.description) && !expanded && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {activity.email_snippet || activity.description}
          </Typography>
        )}

        {/* Source + related entity chips */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          <Chip
            label={activity.source.replace('-', ' ')}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', textTransform: 'capitalize' }}
          />
          {activity.opportunity_id && currentEntityType !== 'opportunity' && (
            <Chip label={`Opp: ${activity.opportunity_id}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
          )}
          {activity.account_id && currentEntityType !== 'account' && (
            <Chip label={`Acct: ${activity.account_id}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
          )}
          {activity.logged_by && (
            <Chip label={activity.logged_by} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
          )}
        </Box>

        {/* Expandable detail section */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 1.5, pl: 0.5, borderLeft: '2px solid', borderColor: 'divider' }}>
            {/* Full description */}
            {activity.description && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25, whiteSpace: 'pre-line', lineHeight: 1.5, pl: 1 }}>
                  {activity.description}
                </Typography>
              </Box>
            )}

            {/* Email metadata */}
            {activity.email_from && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  From:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.email_from}
                </Typography>
              </Box>
            )}
            {activity.email_to && activity.email_to.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  To:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.email_to.join(', ')}
                </Typography>
              </Box>
            )}
            {activity.email_cc && activity.email_cc.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  CC:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.email_cc.join(', ')}
                </Typography>
              </Box>
            )}

            {/* Meeting metadata */}
            {activity.meeting_duration_minutes != null && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Duration:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.meeting_duration_minutes} min
                </Typography>
              </Box>
            )}
            {activity.meeting_location && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Location:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.meeting_location}
                </Typography>
              </Box>
            )}
            {activity.meeting_attendees && activity.meeting_attendees.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                  Attendees ({activity.meeting_attendees.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', pl: 1 }}>
                  {activity.meeting_attendees.map((att, i) => (
                    <Chip
                      key={i}
                      label={att.name || att.email || att.Name || 'Unknown'}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Attachments count */}
            {activity.attachments && activity.attachments.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Attachments:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {activity.attachments.length} file{activity.attachments.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  opportunityId,
  accountId,
  contactId,
  maxHeight = 500,
}) => {
  // Filter state
  const [typeFilter, setTypeFilter] = useState<ActivityType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debounce search input
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  // Determine entity type for chip display logic
  const currentEntityType: 'opportunity' | 'account' | 'contact' = opportunityId
    ? 'opportunity'
    : accountId
    ? 'account'
    : 'contact';

  const {
    activities,
    total,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    isSearchMode,
    isFetching,
  } = useActivities({
    opportunityId,
    accountId,
    contactId,
    type: typeFilter.length === 1 ? typeFilter[0] : undefined,
    search: debouncedSearch || undefined,
  });

  // Client-side multi-type filter (API only supports single type filter)
  const filteredActivities = useMemo(() => {
    if (typeFilter.length <= 1) return activities;
    return activities.filter((a) => typeFilter.includes(a.type));
  }, [activities, typeFilter]);

  // Group by date
  const dateGroups = useMemo(() => groupByDate(filteredActivities), [filteredActivities]);

  const hasFilters = typeFilter.length > 0 || searchText.length > 0;

  const handleClearFilters = useCallback(() => {
    setTypeFilter([]);
    setSearchText('');
    setDebouncedSearch('');
  }, []);

  const handleTypeChange = useCallback((event: SelectChangeEvent<ActivityType[]>) => {
    const value = event.target.value;
    setTypeFilter(typeof value === 'string' ? (value.split(',') as ActivityType[]) : value);
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="activity-type-filter-label">Type</InputLabel>
          <Select
            labelId="activity-type-filter-label"
            multiple
            value={typeFilter}
            onChange={handleTypeChange}
            label="Type"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((t) => (
                  <Chip
                    key={t}
                    label={ACTIVITY_TYPE_CONFIG[t]?.label || t}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                ))}
              </Box>
            )}
          >
            {ALL_ACTIVITY_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: ACTIVITY_TYPE_CONFIG[t].color, display: 'flex' }}>
                    {ACTIVITY_TYPE_CONFIG[t].icon}
                  </Box>
                  {ACTIVITY_TYPE_CONFIG[t].label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search activities..."
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flex: 1, minWidth: 160 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {hasFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
            Clear
          </Button>
        )}
      </Box>

      {/* Content area */}
      <Box
        sx={{
          maxHeight,
          overflow: 'auto',
          flex: 1,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: '3px' },
        }}
      ><>
        {/* Loading state */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load activities. {(error as Error).message || 'Please try again.'}
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredActivities.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              No activities found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, textAlign: 'center' }}>
              {hasFilters
                ? 'Try adjusting your filters or search terms.'
                : `Activities for this ${currentEntityType} will appear here once logged or synced from Salesforce.`}
            </Typography>
          </Box>
        )}

        {/* Timeline content */}
        {!isLoading && !error && filteredActivities.length > 0 && (
          <>
            {/* Result count */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {isSearchMode
                ? `${filteredActivities.length} result${filteredActivities.length !== 1 ? 's' : ''}`
                : `${filteredActivities.length} of ${total} activit${total !== 1 ? 'ies' : 'y'}`}
            </Typography>

            {/* Date-grouped sections */}
            {Array.from(dateGroups.entries()).map(([dateKey, group]) => (
              <Box key={dateKey} sx={{ mb: 2 }}>
                {/* Date header */}
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 600,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 0.5,
                    mb: 0.5,
                    position: 'sticky',
                    top: 0,
                    bgcolor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  {formatDateHeader(dateKey)}
                </Typography>

                {/* Activity cards */}
                {group.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    expanded={expandedId === activity.id}
                    onToggle={() => handleToggleExpand(activity.id)}
                    currentEntityType={currentEntityType}
                  />
                ))}
              </Box>
            ))}

            {/* Load more button */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadMore}
                  disabled={isFetching}
                  sx={{ textTransform: 'none' }}
                >
                  {isFetching ? 'Loading...' : `Load more (${total - filteredActivities.length} remaining)`}
                </Button>
              </Box>
            )}
          </>
        )}
      </></Box>
    </Box>
  );
};

export default ActivityTimeline;
