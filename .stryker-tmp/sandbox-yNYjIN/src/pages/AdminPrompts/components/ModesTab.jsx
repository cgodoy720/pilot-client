// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const ModesTab = ({ showNotification, reloadPrompts }) => {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModeTab, setSelectedModeTab] = useState(0);

  useEffect(() => {
    fetchModes();
  }, []);

  const fetchModes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/modes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModes(data.modes || []);
      } else {
        throw new Error('Failed to fetch modes');
      }
    } catch (error) {
      console.error('Error fetching modes:', error);
      showNotification('Failed to load modes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formData } = await Swal.fire({
      title: 'Create New Mode',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., coach_only, technical_assistant" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, underscores)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" placeholder="e.g., Coach Only, Technical Assistant"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the mode</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of when to use this mode"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the mode's behavior and when to use it</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the mode behavioral instructions..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default mode
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Create Mode',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '600px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const displayName = document.getElementById('swal-display-name').value;
        const description = document.getElementById('swal-description').value;
        const content = document.getElementById('swal-content').value;
        const isDefault = document.getElementById('swal-default').checked;

        if (!name.trim()) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        if (!content.trim()) {
          Swal.showValidationMessage('Content is required');
          return false;
        }

        return {
          name: name.trim(),
          display_name: displayName.trim(),
          description: description.trim(),
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/modes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Mode created successfully');
          await fetchModes();
          await reloadPrompts();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create mode');
        }
      } catch (error) {
        console.error('Error creating mode:', error);
        showNotification(`Failed to create mode: ${error.message}`, 'error');
      }
    }
  };

  const handleEdit = async (mode) => {
    const { value: formData } = await Swal.fire({
      title: 'Edit Mode',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" value="${mode.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, underscores)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" value="${mode.display_name || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the mode</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" value="${mode.description || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the mode's behavior and when to use it</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${mode.content}</textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" ${mode.is_default ? 'checked' : ''} style="margin-right: 0.5rem;">
              Set as default mode
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Update Mode',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '600px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const displayName = document.getElementById('swal-display-name').value;
        const description = document.getElementById('swal-description').value;
        const content = document.getElementById('swal-content').value;
        const isDefault = document.getElementById('swal-default').checked;

        if (!name.trim()) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        if (!content.trim()) {
          Swal.showValidationMessage('Content is required');
          return false;
        }

        return {
          name: name.trim(),
          display_name: displayName.trim(),
          description: description.trim(),
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Mode updated successfully');
          await fetchModes();
          await reloadPrompts();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update mode');
        }
      } catch (error) {
        console.error('Error updating mode:', error);
        showNotification(`Failed to update mode: ${error.message}`, 'error');
      }
    }
  };

  const handleDelete = async (mode) => {
    const result = await Swal.fire({
      title: 'Delete Mode',
      text: `Are you sure you want to delete the "${mode.display_name || mode.name}" mode? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, delete it!',
      background: '#2a2d3e',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showNotification('Mode deleted successfully');
          await fetchModes();
          await reloadPrompts();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete mode');
        }
      } catch (error) {
        console.error('Error deleting mode:', error);
        showNotification(`Failed to delete mode: ${error.message}`, 'error');
      }
    }
  };

  const handleSetDefault = async (mode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`"${mode.display_name || mode.name}" set as default mode`);
        await fetchModes();
        await reloadPrompts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set default mode');
      }
    } catch (error) {
      console.error('Error setting default mode:', error);
      showNotification(`Failed to set default mode: ${error.message}`, 'error');
    }
  };

  const handleModeTabChange = (event, newValue) => {
    setSelectedModeTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const currentMode = modes[selectedModeTab];

  return (
    <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            AI Helper Modes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage AI behavior modes that determine how the AI responds to students (coach_only, technical_assistant, research_partner).
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Mode
          </Button>
        </div>
      </div>

      {modes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <Typography variant="h6" gutterBottom>
            No modes found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first AI mode to get started.
          </Typography>
        </div>
      ) : (
        <div className="modes-tab-container">
          {/* Sub-navigation tabs */}
          <div className="modes-sub-tabs">
            <Tabs
              value={selectedModeTab}
              onChange={handleModeTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className="modes-sub-tabs__tabs"
            >
              {modes.map((mode, index) => (
                <Tab
                  key={mode.id}
                  label={
                    <div className="mode-tab-label">
                      <span>{mode.display_name || mode.name}</span>
                      {mode.is_default && (
                        <Chip
                          label="Default"
                          size="small"
                          color="primary"
                          sx={{ ml: 0.5, fontSize: '0.65rem', height: '16px' }}
                        />
                      )}
                    </div>
                  }
                />
              ))}
            </Tabs>
          </div>

          {/* Current mode content */}
          {currentMode && (
            <div className="mode-content">
              <div className="mode-content__header">
                <div className="mode-content__title">
                  <Typography variant="h6" component="h3">
                    {currentMode.display_name || currentMode.name}
                    {currentMode.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentMode.name}
                  </Typography>
                  {currentMode.description && (
                    <Typography variant="body2" color="textSecondary">
                      {currentMode.description}
                    </Typography>
                  )}
                </div>
                <div className="mode-content__actions">
                  <IconButton
                    size="small"
                    onClick={() => handleSetDefault(currentMode)}
                    disabled={currentMode.is_default}
                    title={currentMode.is_default ? 'This is the default' : 'Set as default'}
                  >
                    {currentMode.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(currentMode)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(currentMode)}
                    disabled={currentMode.is_default}
                    title={currentMode.is_default ? 'Cannot delete default mode' : 'Delete'}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="mode-content__body">
                <div className="mode-content__text">
                  {currentMode.content}
                </div>
                
                <div className="mode-content__meta">
                  <span>Last updated: {new Date(currentMode.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModesTab;
