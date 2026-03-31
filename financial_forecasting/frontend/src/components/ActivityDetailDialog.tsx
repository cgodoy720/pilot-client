import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import DOMPurify from 'dompurify';
import type { Activity } from '../types/activity';
import { ACTIVITY_TYPE_CONFIG } from './ActivityTimeline';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityDetailDialogProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
  oppNameMap: Map<string, string>;
  acctNameMap: Map<string, string>;
  contactNameMap: Map<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a source string: replace hyphens with spaces, capitalize each word. */
function formatSource(source: string): string {
  return source
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Safely format an ISO date string. Returns null if the input is falsy or invalid. */
function formatDate(iso: string | null | undefined, pattern: string): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

/** Format meeting duration into a human-readable string. */
function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

/** Resolve a name from a map, falling back to a truncated ID. */
function resolveName(id: string, nameMap: Map<string, string>): string {
  return nameMap.get(id) || `${id.slice(0, 8)}...`;
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
    {children}
  </Typography>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ActivityDetailDialog: React.FC<ActivityDetailDialogProps> = ({
  activity,
  onClose,
  onEdit,
  onDelete,
  oppNameMap,
  acctNameMap,
  contactNameMap,
}) => {
  // Always render the Dialog shell so the MUI close animation plays.
  // Content is guarded by `activity &&` inside.
  if (!activity) {
    return <Dialog open={false} onClose={onClose} maxWidth="md" fullWidth />;
  }

  const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.note;

  // -- Section visibility predicates ----------------------------------------

  const showDescription = !!(activity.description_html || activity.description);

  const showEmail = !!(
    activity.email_from ||
    (activity.email_to && activity.email_to.length > 0) ||
    (activity.email_cc && activity.email_cc.length > 0)
  );

  const showMeeting = !!(
    activity.meeting_duration_minutes ||
    activity.meeting_location ||
    (activity.meeting_attendees && activity.meeting_attendees.length > 0)
  );

  const showAttachments = !!(activity.attachments && activity.attachments.length > 0);

  const showLinkedEntities = !!(
    activity.opportunity_id ||
    activity.account_id ||
    (activity.contact_ids && activity.contact_ids.length > 0)
  );

  // Build an ordered list of section renderers to place dividers between them.
  const sections: React.ReactNode[] = [];

  // -- Section 1: Description -----------------------------------------------
  if (showDescription) {
    sections.push(
      <Box key="description">
        <SectionHeader>Description</SectionHeader>
        {activity.description_html ? (
          <Box
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(activity.description_html),
            }}
            sx={{
              '& p': { my: 0.5 },
              '& a': { color: 'primary.main' },
              lineHeight: 1.6,
            }}
          />
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {activity.description}
          </Typography>
        )}
      </Box>,
    );
  }

  // -- Section 2: Email Details ---------------------------------------------
  if (showEmail) {
    const renderEmailAddresses = (addresses: string[]) =>
      addresses.map((addr, i) => (
        <React.Fragment key={addr}>
          {i > 0 && ', '}
          <Box
            component="a"
            href={`mailto:${addr}`}
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {addr}
          </Box>
        </React.Fragment>
      ));

    sections.push(
      <Box key="email">
        <SectionHeader>Email Details</SectionHeader>
        {activity.email_from && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>From:</strong>{' '}
            <Box
              component="a"
              href={`mailto:${activity.email_from}`}
              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {activity.email_from}
            </Box>
          </Typography>
        )}
        {activity.email_to && activity.email_to.length > 0 && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>To:</strong> {renderEmailAddresses(activity.email_to)}
          </Typography>
        )}
        {activity.email_cc && activity.email_cc.length > 0 && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>CC:</strong> {renderEmailAddresses(activity.email_cc)}
          </Typography>
        )}
        {activity.email_snippet && (
          <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, mt: 1 }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {activity.email_snippet}
            </Typography>
          </Box>
        )}
      </Box>,
    );
  }

  // -- Section 3: Meeting Details -------------------------------------------
  if (showMeeting) {
    sections.push(
      <Box key="meeting">
        <SectionHeader>Meeting Details</SectionHeader>
        {activity.meeting_duration_minutes != null && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Duration:</strong> {formatDuration(activity.meeting_duration_minutes)}
          </Typography>
        )}
        {activity.meeting_location && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Location:</strong> {activity.meeting_location}
          </Typography>
        )}
        {activity.meeting_attendees && activity.meeting_attendees.length > 0 && (
          <>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Attendees:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {activity.meeting_attendees.map((att, i) => {
                const name = att.name || att.Name || att.email || 'Unknown';
                const email = att.email || att.Email || null;
                const chip = (
                  <Chip
                    key={i}
                    label={name}
                    size="small"
                    variant="outlined"
                  />
                );
                return email && email !== name ? (
                  <Tooltip key={i} title={email} arrow>
                    {chip}
                  </Tooltip>
                ) : (
                  chip
                );
              })}
            </Box>
          </>
        )}
      </Box>,
    );
  }

  // -- Section 4: Attachments -----------------------------------------------
  if (showAttachments) {
    sections.push(
      <Box key="attachments">
        <SectionHeader>Attachments</SectionHeader>
        <List dense disablePadding>
          {activity.attachments!.map((att, i) => {
            const name = att.name || att.filename || `Attachment ${i + 1}`;
            const meta: string[] = [];
            if (att.type) meta.push(att.type);
            if (att.size) meta.push(att.size);
            return (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AttachFileIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  secondary={meta.length > 0 ? meta.join(' · ') : undefined}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>,
    );
  }

  // -- Section 5: Linked Entities -------------------------------------------
  if (showLinkedEntities) {
    sections.push(
      <Box key="linked">
        <SectionHeader>Linked Entities</SectionHeader>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {activity.opportunity_id && (
            <Chip
              label={`Opp: ${resolveName(activity.opportunity_id, oppNameMap)}`}
              size="small"
              variant="outlined"
            />
          )}
          {activity.account_id && (
            <Chip
              label={`Acct: ${resolveName(activity.account_id, acctNameMap)}`}
              size="small"
              variant="outlined"
            />
          )}
          {activity.contact_ids &&
            activity.contact_ids.map((cid) => (
              <Chip
                key={cid}
                label={resolveName(cid, contactNameMap)}
                size="small"
                variant="outlined"
              />
            ))}
        </Box>
      </Box>,
    );
  }

  // -- Section 6: Source & Sync ---------------------------------------------
  const syncStatusColorMap: Record<string, 'success' | 'warning' | 'error'> = {
    synced: 'success',
    pending: 'warning',
    failed: 'error',
  };

  sections.push(
    <Box key="source">
      <SectionHeader>Source &amp; Sync</SectionHeader>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Chip label={formatSource(activity.source)} size="small" variant="outlined" />
        {activity.sf_sync_status && (
          <Chip
            label={formatSource(activity.sf_sync_status)}
            size="small"
            color={syncStatusColorMap[activity.sf_sync_status] || 'default'}
          />
        )}
      </Box>
      {activity.source_ref && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>Source ref:</strong>{' '}
          <Box
            component="a"
            href={activity.source_ref}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {activity.source_ref}
          </Box>
        </Typography>
      )}
      {activity.synced_at && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>Synced at:</strong> {formatDate(activity.synced_at, 'MMM d, yyyy · h:mm a')}
        </Typography>
      )}
      {activity.sf_id && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          SF ID: {activity.sf_id}
        </Typography>
      )}
    </Box>,
  );

  // -- Section 7: Timestamps ------------------------------------------------
  const timestampItems: { label: string; value: string }[] = [];

  const activityDateStr = formatDate(activity.activity_date, 'MMM d, yyyy · h:mm a');
  if (activityDateStr) timestampItems.push({ label: 'Activity date', value: activityDateStr });

  const createdAtStr = formatDate(activity.created_at, 'MMM d, yyyy · h:mm a');
  if (createdAtStr) timestampItems.push({ label: 'Created', value: createdAtStr });

  const updatedAtStr = formatDate(activity.updated_at, 'MMM d, yyyy · h:mm a');
  if (updatedAtStr) timestampItems.push({ label: 'Updated', value: updatedAtStr });

  if (activity.logged_by) timestampItems.push({ label: 'Logged by', value: activity.logged_by });

  sections.push(
    <Box key="timestamps">
      <SectionHeader>Timestamps</SectionHeader>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1,
        }}
      >
        {timestampItems.map((item) => (
          <Box key={item.label}>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2">{item.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>,
  );

  // -- Render ---------------------------------------------------------------

  return (
    <Dialog open={!!activity} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {activity.subject}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={config.icon}
            label={config.label}
            size="small"
            sx={{
              bgcolor: config.color,
              color: 'white',
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
          <Chip label={formatSource(activity.source)} size="small" variant="outlined" />
          <Typography variant="body2" color="text.secondary">
            {formatDate(activity.activity_date, 'EEEE, MMMM d, yyyy · h:mm a') || 'No date'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {sections.map((section, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Divider sx={{ my: 2 }} />}
            {section}
          </React.Fragment>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        {activity.source === 'manual' && onEdit && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(activity);
              onClose();
            }}
            sx={{ textTransform: 'none' }}
          >
            Edit
          </Button>
        )}
        {activity.source === 'manual' && onDelete && (
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              onDelete(activity);
              onClose();
            }}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityDetailDialog;
