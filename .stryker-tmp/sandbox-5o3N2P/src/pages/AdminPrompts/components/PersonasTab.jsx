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

const PersonasTab = ({ showNotification, reloadPrompts }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonaTab, setSelectedPersonaTab] = useState(0);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/personas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      } else {
        throw new Error('Failed to fetch personas');
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
      showNotification('Failed to load personas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formData } = await Swal.fire({
      title: 'Create New Persona',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., mentor, expert, critic" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, no spaces)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" placeholder="e.g., The Mentor, The Expert"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the persona</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the persona's role"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the persona's role and approach</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the persona definition..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default persona
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Create Persona',
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
          display_name: displayName.trim() || undefined,
          description: description.trim() || undefined,
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/personas`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Persona created successfully');
          fetchPersonas();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create persona');
        }
      } catch (error) {
        console.error('Error creating persona:', error);
        showNotification(error.message, 'error');
      }
    }
  };



  const handleDelete = async (persona) => {
    const result = await Swal.fire({
      title: 'Delete Persona?',
      text: `Are you sure you want to delete "${persona.display_name || persona.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: '#2a2d3e',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showNotification('Persona deleted successfully');
          fetchPersonas();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete persona');
        }
      } catch (error) {
        console.error('Error deleting persona:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleSetDefault = async (persona) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`"${persona.display_name || persona.name}" set as default persona`);
        fetchPersonas();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      showNotification(error.message, 'error');
    }
  };

  const handlePersonaTabChange = (event, newValue) => {
    setSelectedPersonaTab(newValue);
  };

  const handleEdit = async (persona) => {
    const { value: formData } = await Swal.fire({
      title: 'Edit Persona',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" value="${persona.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, no spaces)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" value="${persona.display_name || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the persona</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" value="${persona.description || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the persona's role and approach</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${persona.content}</textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" ${persona.is_default ? 'checked' : ''} style="margin-right: 0.5rem;">
              Set as default persona
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Update Persona',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '700px',
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
          display_name: displayName.trim() || undefined,
          description: description.trim() || undefined,
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Persona updated successfully');
          fetchPersonas();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update persona');
        }
      } catch (error) {
        console.error('Error updating persona:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const currentPersona = personas[selectedPersonaTab];

  return (
    <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            AI Personas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Different AI personalities that determine interaction style and approach with users.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Persona
          </Button>
        </div>
      </div>

      {personas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎭</div>
          <Typography variant="h6" gutterBottom>
            No personas found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first AI persona to get started.
          </Typography>
        </div>
      ) : (
        <div className="personas-tab-container">
          {/* Sub-navigation tabs */}
          <div className="personas-sub-tabs">
            <Tabs
              value={selectedPersonaTab}
              onChange={handlePersonaTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className="personas-sub-tabs__tabs"
            >
              {personas.map((persona, index) => (
                <Tab
                  key={persona.id}
                  label={
                    <div className="persona-tab-label">
                      <span>{persona.display_name || persona.name}</span>
                      {persona.is_default && (
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

          {/* Current persona content */}
          {currentPersona && (
            <div className="persona-content">
              <div className="persona-content__header">
                <div className="persona-content__title">
                  <Typography variant="h6" component="h3">
                    {currentPersona.display_name || currentPersona.name}
                    {currentPersona.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentPersona.name}
                  </Typography>
                  {currentPersona.description && (
                    <Typography variant="body2" color="textSecondary">
                      {currentPersona.description}
                    </Typography>
                  )}
                </div>
                <div className="persona-content__actions">
                  <IconButton
                    size="small"
                    onClick={() => handleSetDefault(currentPersona)}
                    disabled={currentPersona.is_default}
                    title={currentPersona.is_default ? 'This is the default' : 'Set as default'}
                  >
                    {currentPersona.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(currentPersona)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(currentPersona)}
                    disabled={currentPersona.is_default}
                    title={currentPersona.is_default ? 'Cannot delete default persona' : 'Delete'}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="persona-content__body">
                <div className="persona-content__text">
                  {currentPersona.content}
                </div>
                
                <div className="persona-content__meta">
                  <span>Last updated: {new Date(currentPersona.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonasTab;
