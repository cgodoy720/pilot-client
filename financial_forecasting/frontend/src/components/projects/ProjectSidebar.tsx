import React, { useState } from 'react';
import {
  Box, List, ListItemButton, ListItemText, ListItemIcon, Typography,
  IconButton, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Divider, Tooltip, Collapse,
} from '@mui/material';
import {
  ChevronLeft as CollapseIcon, Add as AddIcon, Delete as DeleteIcon,
  FolderOpen as FolderIcon, Folder as FolderClosedIcon,
  RestoreFromTrash as RestoreIcon, DeleteForever as PurgeIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Project } from './types';
import type { DeletedProject } from './useProjects';

interface ProjectSidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateProject: (name: string) => Promise<any>;
  onDeleteProject: (id: string) => void;
  onCollapse: () => void;
  deletedProjects?: DeletedProject[];
  onRestoreProject?: (id: string) => void;
  onPurgeProject?: (id: string) => void;
}

const RETENTION_DAYS = 60;

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function retentionDaysLeft(deletedAt: string): number {
  const days = Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000);
  return Math.max(0, RETENTION_DAYS - days);
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects, selectedId, onSelect, onCreateProject, onDeleteProject, onCollapse,
  deletedProjects = [], onRestoreProject, onPurgeProject,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState<DeletedProject | null>(null);
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const currentEmail = user?.email || '';

  const handleCreate = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await onCreateProject(name);
      setNewProjectName('');
      setShowNewInput(false);
      const newId = res?.data?.data?.id || res?.data?.id;
      if (newId) onSelect(newId);
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteProject(deleteTarget.id);
      setDeleteTarget(null);
      if (deleteTarget.id === selectedId) {
        const remaining = projects.filter((p) => p.id !== deleteTarget.id);
        if (remaining.length > 0) onSelect(remaining[0].id);
      }
    }
  };

  const handleConfirmPurge = () => {
    if (purgeTarget && onPurgeProject) {
      onPurgeProject(purgeTarget.id);
      setPurgeTarget(null);
    }
  };

  return (
    <Box sx={{ width: 220, minWidth: 220, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
          Projects
        </Typography>
        <IconButton size="small" onClick={onCollapse}><CollapseIcon fontSize="small" /></IconButton>
      </Box>
      <Divider />

      <List dense sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
        {projects.map((p) => (
          <ListItemButton key={p.id} selected={p.id === selectedId} onClick={() => onSelect(p.id)} sx={{ py: 0.5, pl: 1.5, borderRadius: 1, mx: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              {p.id === selectedId ? <FolderIcon fontSize="small" color="primary" /> : <FolderClosedIcon fontSize="small" color="action" />}
            </ListItemIcon>
            <ListItemText primary={p.name} primaryTypographyProps={{ variant: 'body2', fontWeight: p.id === selectedId ? 600 : 400, noWrap: true }} />
            {projects.length > 1 && (isAdmin || (p.owner_email && currentEmail === p.owner_email)) && (
              <Tooltip title="Move to trash">
                <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget(p); }} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </ListItemButton>
        ))}
      </List>

      {/* Trash section */}
      {deletedProjects.length > 0 && (
        <>
          <Divider />
          <Box
            sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => setTrashOpen(!trashOpen)}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flex: 1, fontSize: '0.7rem' }}>
              Trash ({deletedProjects.length})
            </Typography>
            {trashOpen ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
          </Box>
          <Collapse in={trashOpen}>
            <List dense sx={{ py: 0 }}>
              {deletedProjects.map((dp) => (
                <Box key={dp.id} sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.25, gap: 0.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                      {dp.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                      {timeAgo(dp.deleted_at)}
                    </Typography>
                  </Box>
                  {(isAdmin || (dp.owner_email && currentEmail === dp.owner_email)) && (
                    <Tooltip title="Restore">
                      <IconButton size="small" onClick={() => onRestoreProject?.(dp.id)} sx={{ p: 0.25 }}>
                        <RestoreIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAdmin && (() => {
                    const daysLeft = retentionDaysLeft(dp.deleted_at);
                    return daysLeft > 0 ? (
                      <Tooltip title={`Permanent delete available in ${daysLeft}d`}>
                        <span><IconButton size="small" disabled sx={{ p: 0.25 }}>
                          <PurgeIcon sx={{ fontSize: 14 }} />
                        </IconButton></span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Delete permanently">
                        <IconButton size="small" onClick={() => setPurgeTarget(dp)} sx={{ p: 0.25 }}>
                          <PurgeIcon sx={{ fontSize: 14, color: 'error.main' }} />
                        </IconButton>
                      </Tooltip>
                    );
                  })()}
                </Box>
              ))}
            </List>
          </Collapse>
        </>
      )}

      <Divider />
      <Box sx={{ p: 1 }}>
        {showNewInput ? (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <TextField autoFocus size="small" placeholder="Project name" value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowNewInput(false); setNewProjectName(''); } }}
              sx={{ flex: 1, '& .MuiInputBase-root': { height: 28, fontSize: '0.8rem' } }} disabled={creating}
            />
            <Button size="small" variant="contained" onClick={handleCreate} disabled={!newProjectName.trim() || creating} sx={{ minWidth: 0, px: 1 }}>
              <AddIcon fontSize="small" />
            </Button>
          </Box>
        ) : (
          <Button size="small" startIcon={<AddIcon />} onClick={() => setShowNewInput(true)} fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.8rem' }}>
            New Project
          </Button>
        )}
      </Box>

      {/* Soft-delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle>Move to Trash</DialogTitle>
        <DialogContent>
          <DialogContentText>Move &ldquo;{deleteTarget?.name}&rdquo; and all its workstreams, milestones, and tasks to trash? You can restore it later.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Move to Trash</Button>
        </DialogActions>
      </Dialog>

      {/* Permanent delete confirmation (admin only) */}
      <Dialog open={!!purgeTarget} onClose={() => setPurgeTarget(null)} maxWidth="xs">
        <DialogTitle>Permanently Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Permanently delete &ldquo;{purgeTarget?.name}&rdquo;? This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurgeTarget(null)}>Cancel</Button>
          <Button onClick={handleConfirmPurge} color="error" variant="contained">Delete Forever</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSidebar;
