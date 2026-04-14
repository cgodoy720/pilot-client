import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Chat as SlackIcon,
  Mic as FirefliesIcon,
  Email as GmailIcon,
  CalendarMonth as CalendarIcon,
  Folder as DriveIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Description as DocIcon,
  GridOn as SpreadsheetIcon,
  Slideshow as PresentationIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  TrendingUp as HotIcon,
  Whatshot as WarmIcon,
  AcUnit as ColdIcon,
  FiberNew as NewIcon,
  AutoAwesome as AiIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

interface ActivityIntelligencePanelProps {
  open: boolean;
  onClose: () => void;
  opportunity: {
    Id: string;
    Name: string;
    Account?: { Name: string } | null;
    AccountId?: string;
    StageName?: string;
    Amount?: number | null;
    CloseDate?: string | null;
    Owner?: { Name: string } | null;
  } | null;
  accountName: string;
}

// Momentum badge component
const MomentumBadge: React.FC<{ momentum: string }> = ({ momentum }) => {
  const config: Record<string, { label: string; color: string; icon: React.ReactElement; bg: string }> = {
    hot: { label: 'Hot', color: '#d32f2f', icon: <HotIcon sx={{ fontSize: 14 }} />, bg: '#ffebee' },
    warm: { label: 'Warm', color: '#f57c00', icon: <WarmIcon sx={{ fontSize: 14 }} />, bg: '#fff3e0' },
    cold: { label: 'Cold', color: '#1565c0', icon: <ColdIcon sx={{ fontSize: 14 }} />, bg: '#e3f2fd' },
    new: { label: 'New', color: '#7b1fa2', icon: <NewIcon sx={{ fontSize: 14 }} />, bg: '#f3e5f5' },
  };
  const c = config[momentum] || config.cold;
  return (
    <Chip
      icon={c.icon}
      label={c.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 24,
        color: c.color,
        bgcolor: c.bg,
        border: `1px solid ${c.color}40`,
        '& .MuiChip-icon': { color: c.color },
      }}
    />
  );
};

// Relevance bar
const RelevanceScore: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 75 ? '#2e7d32' : score >= 50 ? '#f57c00' : '#9e9e9e';
  return (
    <Tooltip title={`Relevance: ${score}%`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
        <Box sx={{ flex: 1, height: 4, bgcolor: '#eee', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ width: `${score}%`, height: '100%', bgcolor: color, borderRadius: 2 }} />
        </Box>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color, fontWeight: 600 }}>
          {score}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Source-specific renderers
const SlackItem: React.FC<{ item: any }> = ({ item }) => (
  <ActivityCard>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
        <PersonIcon sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{item.user}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>in #{item.channel}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <RelevanceScore score={item.relevance_score} />
        {item.permalink && (
          <IconButton size="small" component="a" href={item.permalink} target="_blank" sx={{ p: 0.2 }}>
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </IconButton>
        )}
      </Box>
    </Box>
    <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.5, wordBreak: 'break-word' }}>
      {truncate(item.text, 250)}
    </Typography>
    {item.ai_reason && (
      <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
        {item.ai_reason}
      </Typography>
    )}
    {item.date && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
        {formatTimeAgo(item.date)}
      </Typography>
    )}
  </ActivityCard>
);

const FirefliesItem: React.FC<{ item: any }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <ActivityCard>
      <Box sx={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.2 }}>
              {item.date && <Typography variant="caption" color="text.secondary">{formatMeetingDate(item.date)}</Typography>}
              {item.duration && <Typography variant="caption" color="text.secondary">{Math.round(item.duration / 60)}m</Typography>}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <RelevanceScore score={item.relevance_score} />
            {item.fireflies_url && (
              <IconButton size="small" component="a" href={item.fireflies_url} target="_blank"
                onClick={(e: React.MouseEvent) => e.stopPropagation()} sx={{ p: 0.2 }}>
                <OpenInNewIcon sx={{ fontSize: 12 }} />
              </IconButton>
            )}
            {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </Box>
        </Box>
        {item.ai_reason && (
          <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>{item.ai_reason}</Typography>
        )}
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
          {item.overview && (
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#555', mb: 1 }}>
              {truncate(item.overview, 500)}
            </Typography>
          )}
          {item.attendees?.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#888' }}>Attendees:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                {item.attendees.slice(0, 8).map((a: any, i: number) => (
                  <Chip key={i} label={a.name || a.email} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                ))}
              </Box>
            </Box>
          )}
          {item.action_items?.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#888' }}>Action Items:</Typography>
              {item.action_items.slice(0, 5).map((ai: string, i: number) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '0.75rem', color: '#555', pl: 1 }}>- {ai}</Typography>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </ActivityCard>
  );
};

const GmailItem: React.FC<{ item: any }> = ({ item }) => (
  <ActivityCard>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', flex: 1, minWidth: 0 }} noWrap>
        {item.subject}
      </Typography>
      <RelevanceScore score={item.relevance_score} />
    </Box>
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
        <PersonIcon sx={{ fontSize: 12 }} />
        {extractEmailName(item.from)}
      </Typography>
      {item.date && <Typography variant="caption" color="text.secondary">{formatEmailDate(item.date)}</Typography>}
    </Box>
    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4 }}>
      {truncate(item.snippet, 200)}
    </Typography>
    {item.ai_reason && (
      <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
        {item.ai_reason}
      </Typography>
    )}
  </ActivityCard>
);

const CalendarItem: React.FC<{ item: any }> = ({ item }) => {
  const eventDate = item.start ? new Date(item.start) : null;
  const isPast = eventDate ? eventDate < new Date() : false;
  return (
    <ActivityCard sx={isPast ? { opacity: 0.8 } : {}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.summary}</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.2 }}>
            {eventDate && <Typography variant="caption" color="text.secondary">{format(eventDate, 'MMM d, yyyy h:mm a')}</Typography>}
            <Chip label={isPast ? 'Past' : 'Upcoming'} size="small"
              sx={{ height: 16, fontSize: '0.6rem' }} color={isPast ? 'default' : 'success'} variant="outlined" />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <RelevanceScore score={item.relevance_score} />
          {item.htmlLink && (
            <IconButton size="small" component="a" href={item.htmlLink} target="_blank" sx={{ p: 0.2 }}>
              <OpenInNewIcon sx={{ fontSize: 12 }} />
            </IconButton>
          )}
        </Box>
      </Box>
      {item.attendees?.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {item.attendees.slice(0, 5).map((a: any, i: number) => (
            <Chip key={i} label={a.name || a.email} size="small" variant="outlined"
              color={a.status === 'accepted' ? 'success' : a.status === 'declined' ? 'error' : 'default'}
              sx={{ height: 18, fontSize: '0.6rem' }} />
          ))}
        </Box>
      )}
      {item.calendarName && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
          via {item.calendarName}
        </Typography>
      )}
      {item.ai_reason && (
        <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
          {item.ai_reason}
        </Typography>
      )}
    </ActivityCard>
  );
};

const DriveItem: React.FC<{ item: any }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const getIcon = (ft: string) => {
    const icons: Record<string, React.ReactNode> = {
      document: <DocIcon sx={{ fontSize: 18, color: '#4285F4' }} />,
      spreadsheet: <SpreadsheetIcon sx={{ fontSize: 18, color: '#0F9D58' }} />,
      presentation: <PresentationIcon sx={{ fontSize: 18, color: '#F4B400' }} />,
      pdf: <PdfIcon sx={{ fontSize: 18, color: '#EA4335' }} />,
      image: <ImageIcon sx={{ fontSize: 18, color: '#A142F4' }} />,
      folder: <DriveIcon sx={{ fontSize: 18, color: '#5F6368' }} />,
    };
    return icons[ft] || <FileIcon sx={{ fontSize: 18, color: '#5F6368' }} />;
  };

  const hasContent = item.content && item.content.trim().length > 0;

  return (
    <ActivityCard>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ mt: 0.2, flexShrink: 0 }}>{getIcon(item.fileType)}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
              {item.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5, flexShrink: 0 }}>
              <RelevanceScore score={item.relevance_score} />
              {item.webViewLink && (
                <IconButton size="small" component="a" href={item.webViewLink} target="_blank" sx={{ p: 0.2 }}>
                  <OpenInNewIcon sx={{ fontSize: 12 }} />
                </IconButton>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.2, flexWrap: 'wrap' }}>
            {item.modifiedTime && (
              <Typography variant="caption" color="text.secondary">Modified {formatTimeAgo(item.modifiedTime)}</Typography>
            )}
            {item.lastModifiedBy && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <PersonIcon sx={{ fontSize: 11 }} />{item.lastModifiedBy}
              </Typography>
            )}
            <Chip label={item.fileType} size="small" variant="outlined"
              sx={{ height: 16, fontSize: '0.6rem' }}
              color={item.fileType === 'document' ? 'primary' : item.fileType === 'spreadsheet' ? 'success' : 'default'} />
            {hasContent && (
              <Chip
                label={expanded ? 'Hide content' : 'View content'}
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ height: 16, fontSize: '0.6rem', cursor: 'pointer' }}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          {item.ai_reason && (
            <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
              {item.ai_reason}
            </Typography>
          )}
          {hasContent && (
            <Collapse in={expanded}>
              <Box sx={{
                mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0',
                maxHeight: 200, overflow: 'auto',
              }}>
                <Typography variant="body2" sx={{
                  fontSize: '0.72rem', color: '#444', lineHeight: 1.5,
                  whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                }}>
                  {truncate(item.content, 1500)}
                </Typography>
              </Box>
            </Collapse>
          )}
        </Box>
      </Box>
    </ActivityCard>
  );
};

// Shared UI pieces
const ActivityCard: React.FC<{ children: React.ReactNode; sx?: any }> = ({ children, sx }) => (
  <Box sx={{
    p: 1.2, border: '1px solid #e8e8e8', borderRadius: 1.5, bgcolor: 'white',
    transition: 'all 0.15s',
    '&:hover': { borderColor: '#c0c0c0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    ...sx,
  }}>
    {children}
  </Box>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3, color: 'text.secondary' }}>
    <Typography variant="body2">{label}</Typography>
  </Box>
);

// Utility functions
function truncate(s: string, n: number) { return !s ? '' : s.length > n ? s.slice(0, n) + '...' : s; }
function formatTimeAgo(d: string) { try { return formatDistanceToNow(parseISO(d), { addSuffix: true }); } catch { return d; } }
function formatMeetingDate(d: string) { try { const t = parseInt(d); return format(isNaN(t) ? parseISO(d) : new Date(t), 'MMM d, yyyy'); } catch { return d || ''; } }
function formatEmailDate(d: string) { try { return formatDistanceToNow(new Date(d), { addSuffix: true }); } catch { return d; } }
function extractEmailName(f: string) { if (!f) return 'Unknown'; const m = f.match(/^([^<]+)/); return m ? m[1].trim().replace(/"/g, '') : f; }

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Renderer map for tab content
const ITEM_RENDERERS: Record<string, React.FC<{ item: any }>> = {
  slack: SlackItem,
  fireflies: FirefliesItem,
  gmail: GmailItem,
  calendar: CalendarItem,
  drive: DriveItem,
};

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
  slack: { label: 'Slack', icon: <SlackIcon sx={{ fontSize: 16 }} />, color: '#4A154B' },
  fireflies: { label: 'Meetings', icon: <FirefliesIcon sx={{ fontSize: 16 }} />, color: '#FF6B2B' },
  gmail: { label: 'Gmail', icon: <GmailIcon sx={{ fontSize: 16 }} />, color: '#EA4335' },
  calendar: { label: 'Calendar', icon: <CalendarIcon sx={{ fontSize: 16 }} />, color: '#4285F4' },
  drive: { label: 'Drive', icon: <DriveIcon sx={{ fontSize: 16 }} />, color: '#0F9D58' },
};

const SOURCE_ORDER = ['slack', 'fireflies', 'gmail', 'calendar', 'drive'];

// Main Panel (Drawer-based)
const PANEL_MIN_WIDTH = 480;
const PANEL_MAX_WIDTH = 900;

const ActivityIntelligencePanel: React.FC<ActivityIntelligencePanelProps> = ({
  open, onClose, opportunity, accountName,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [width, setWidth] = useState(680);
  const resizeRef = useRef({ active: false, startX: 0, startWidth: 0 });

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizeRef.current.active) return;
      const dx = e.clientX - resizeRef.current.startX;
      setWidth(Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, resizeRef.current.startWidth + dx)));
    };
    const onMouseUp = () => { resizeRef.current.active = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = { active: true, startX: e.clientX, startWidth: width };
  }, [width]);
  const queryClient = useQueryClient();

  const oppName = opportunity?.Name || '';
  const cacheKey = ['activity-intelligence', accountName, oppName];

  const { data, isLoading, error } = useQuery(
    cacheKey,
    async () => {
      try {
        const res = await apiService.getActivityIntelligence(accountName, false, oppName);
        return res.data;
      } catch (err: any) {
        if (err?.response) {
          console.warn('Activity intelligence error:', err.response.status, err.response.data);
          return { error: true, status: err.response.status, detail: err.response.data?.detail || 'Service unavailable' };
        }
        throw err;
      }
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      retry: false,
      enabled: open && !!accountName,
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      queryClient.removeQueries(cacheKey);
      const res = await apiService.getActivityIntelligence(accountName, true, oppName);
      queryClient.setQueryData(cacheKey, res.data);
    } catch (err: any) {
      console.error('Refresh failed:', err);
      queryClient.setQueryData(cacheKey, {
        error: true,
        detail: err?.response?.data?.detail || err?.message || 'Refresh failed. Please try again.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (!opportunity) return null;

  const sources = data?.sources || {};
  const tabSources = SOURCE_ORDER.filter(s => (sources[s]?.length || 0) > 0);
  const displaySources = tabSources.length > 0 ? tabSources : SOURCE_ORDER;
  const clampedTab = Math.min(activeTab, displaySources.length - 1);

  const generatedAt = data?.generated_at ? new Date(data.generated_at) : null;
  const isStale = generatedAt ? (Date.now() - generatedAt.getTime()) > 24 * 60 * 60 * 1000 : false;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: width }, p: 0 },
      }}
    >
      {/* Resize handle on left edge (sm+ only) */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          zIndex: 20,
          '&:hover::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 4,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            opacity: 0.4,
          },
        }}
      />

      {/* Header */}
      <Box sx={{
        p: 2.5,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AiIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                Activity Intelligence
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.95 }}>
              {opportunity.Name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {accountName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, mt: -0.5 }}>
            <Tooltip title={refreshing ? 'Regenerating...' : 'Regenerate intelligence'}>
              <span>
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={18} sx={{ color: 'white' }} />
                  ) : (
                    <RefreshIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {opportunity.StageName && (
            <Chip
              label={opportunity.StageName}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
          {opportunity.Amount != null && (
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              {formatCurrency(opportunity.Amount)}
            </Typography>
          )}
          {opportunity.CloseDate && (
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
              Close: {formatDate(opportunity.CloseDate)}
            </Typography>
          )}
          {data?.momentum && <MomentumBadge momentum={data.momentum} />}
        </Box>

        {/* Source count summary + last updated */}
        {!isLoading && !error && !data?.error && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {SOURCE_ORDER.map((src) => {
              const count = sources[src]?.length || 0;
              if (!count) return null;
              return (
                <Typography key={src} variant="caption" sx={{
                  bgcolor: 'rgba(255,255,255,0.15)', px: 1, py: 0.3, borderRadius: 1, fontWeight: 600,
                }}>
                  {SOURCE_CONFIG[src].label}: {count}
                </Typography>
              );
            })}
            {generatedAt && (
              <Typography variant="caption" sx={{ opacity: 0.6, ml: 'auto', fontSize: '0.65rem' }}>
                {data?.cached ? 'Cached' : 'Updated'} {formatDistanceToNow(generatedAt, { addSuffix: true })}
                {isStale && ' (stale)'}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Loading / Refreshing State */}
        {(isLoading || refreshing) && !data?.summary && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <AiIcon sx={{
              fontSize: 40, color: 'primary.main', mb: 1.5,
              animation: 'spin 2s linear infinite',
              '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
            }} />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
              {refreshing ? 'Regenerating intelligence...' : 'Analyzing activity across all integrations...'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Searching Slack, Fireflies, Gmail, Calendar, Drive
            </Typography>
            <LinearProgress sx={{ borderRadius: 1 }} />
          </Box>
        )}

        {/* Refreshing banner (when we already have data) */}
        {refreshing && data?.summary && (
          <Box sx={{
            px: 2, py: 1, bgcolor: '#e3f2fd', borderBottom: '1px solid #90caf9',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <CircularProgress size={14} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1565c0' }}>
              Regenerating intelligence...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {!isLoading && !refreshing && (error || data?.error) && (
          <Box sx={{ m: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2, mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Activity Intelligence unavailable
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.detail || 'Could not connect to the analysis service. Check that integrations are configured in Settings.'}
              </Typography>
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: 'primary.main', color: 'white', px: 2, borderRadius: 2,
                  '&:hover': { bgcolor: 'primary.dark' },
                  gap: 1, fontSize: '0.85rem',
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Try Again</Typography>
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Google re-auth notice */}
        {!isLoading && !refreshing && data?.summary && data?.google_connected === false && (
          <Alert severity="warning" sx={{ mx: 2, mt: 1.5, borderRadius: 2, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Google disconnected — Gmail, Calendar, and Drive results are unavailable.{' '}
              <a href="/settings" style={{ color: 'inherit' }}>Re-connect in Settings</a> or log out and log back in.
            </Typography>
          </Alert>
        )}

        {/* AI Intelligence Results */}
        {!isLoading && !error && !data?.error && data?.summary && (
          <>
            {/* Summary */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
              <Typography variant="body2" sx={{ fontSize: '0.84rem', color: '#333', lineHeight: 1.7 }}>
                {data.summary}
              </Typography>
            </Box>

            {/* Key Findings + Next Steps — compact side-by-side or stacked */}
            {(data.key_findings?.length > 0 || data.action_items?.length > 0) && (
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee', bgcolor: '#fafafa' }}>
                {data.key_findings?.length > 0 && (
                  <Box sx={{ mb: data.action_items?.length > 0 ? 1.5 : 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                      Key Details
                    </Typography>
                    {data.key_findings.map((finding: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', gap: 0.8, mb: 0.4, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#888', flexShrink: 0, mt: 0.8 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.5 }}>
                          {finding}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {data.action_items?.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                      Next Steps
                    </Typography>
                    {data.action_items.map((item: string, i: number) => (
                      <Box key={i} sx={{ display: 'flex', gap: 0.8, mb: 0.4, alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#e65100', fontWeight: 700, flexShrink: 0 }}>
                          {i + 1}.
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Source Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
              <Tabs
                value={clampedTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, py: 0.5, px: 1.5, fontSize: '0.75rem', textTransform: 'none', minWidth: 'auto' } }}
              >
                {displaySources.map((src) => {
                  const cfg = SOURCE_CONFIG[src];
                  const count = sources[src]?.length || 0;
                  return (
                    <Tab
                      key={src}
                      icon={cfg.icon}
                      iconPosition="start"
                      label={`${cfg.label}${count ? ` (${count})` : ''}`}
                      sx={{ '&.Mui-selected': { color: cfg.color } }}
                    />
                  );
                })}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ px: 1.5, py: 1 }}>
              {displaySources.map((src, idx) => {
                if (clampedTab !== idx) return null;
                const items = sources[src] || [];
                const Renderer = ITEM_RENDERERS[src];
                if (!items.length) return <EmptyState key={src} label={`No ${SOURCE_CONFIG[src].label} activity found for this account`} />;
                return (
                  <Box key={src} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {items.map((item: any, i: number) => (
                      <Renderer key={item.id || i} item={item} />
                    ))}
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* No data state */}
        {!isLoading && !refreshing && !error && !data?.error && !data?.summary && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <AiIcon sx={{ fontSize: 40, color: '#ccc', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No activity data found for this account.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Connect your integrations in Settings, or generate intelligence now.
            </Typography>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: 'primary.main', color: 'white', px: 2, borderRadius: 2,
                '&:hover': { bgcolor: 'primary.dark' },
                gap: 1, fontSize: '0.85rem',
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Generate Intelligence</Typography>
            </IconButton>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ActivityIntelligencePanel;
