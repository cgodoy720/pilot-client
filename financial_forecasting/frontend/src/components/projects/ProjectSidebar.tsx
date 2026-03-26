import React, { useState } from 'react';
import {
  Box, List, ListItemButton, ListItemText, ListItemIcon, Typography,
  IconButton, TextField, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Divider, Tooltip,
} from '@mui/material';
import {
  ChevronLeft as CollapseIcon, Add as AddIcon, Delete as DeleteIcon,
  FolderOpen as FolderIcon, Folder as FolderClosedIcon,
} from '@mui/icons-material';
import type { Project } from './types';

interface ProjectSidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateProject: (name: string) => Promise<any>;
  onDeleteProject: (id: string) => void;
  onCollapse: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects, selectedId, onSelect, onCreateProject, onDeleteProject, onCollapse,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

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
            {projects.length > 1 && (
              <Tooltip title="Delete project">
                <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget(p); }} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </ListItemButton>
        ))}
      </List>

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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>Delete &ldquo;{deleteTarget?.name}&rdquo; and all its workstreams, milestones, and tasks? This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSidebar;
