import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const BasePromptsTab = ({ showNotification, reloadPrompts }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    is_default: false
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/base`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data.base_prompts || []);
      } else {
        throw new Error('Failed to fetch base prompts');
      }
    } catch (error) {
      console.error('Error fetching base prompts:', error);
      showNotification('Failed to load base prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formData } = await Swal.fire({
      title: 'Create New Base Prompt',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., default-base-prompt" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the base prompt</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the base prompt"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the base prompt content..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default base prompt
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Create Base Prompt',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '600px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
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
          description: description.trim() || undefined,
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/base`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Base prompt created successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create base prompt');
        }
      } catch (error) {
        console.error('Error creating base prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleEdit = async (prompt) => {
    const { value: formData } = await Swal.fire({
      title: 'Edit Base Prompt',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" value="${prompt.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the base prompt</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" value="${prompt.description || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${prompt.content}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" ${prompt.is_default ? 'checked' : ''} style="margin-right: 0.5rem;">
              Set as default base prompt
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Update Base Prompt',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '600px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
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
          description: description.trim() || undefined,
          content: content.trim(),
          is_default: isDefault
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Base prompt updated successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update base prompt');
        }
      } catch (error) {
        console.error('Error updating base prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleDelete = async (prompt) => {
    const result = await Swal.fire({
      title: 'Delete Base Prompt?',
      text: `Are you sure you want to delete "${prompt.name}"? This action cannot be undone.`,
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showNotification('Base prompt deleted successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete base prompt');
        }
      } catch (error) {
        console.error('Error deleting base prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleSetDefault = async (prompt) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`"${prompt.name}" set as default base prompt`);
        fetchPrompts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      showNotification(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            Base Prompts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Core system prompts that define the AI's fundamental behavior and context.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Base Prompt
          </Button>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <Typography variant="h6" gutterBottom>
            No base prompts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first base prompt to get started.
          </Typography>
        </div>
      ) : (
        <div className="prompt-list">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="prompt-item">
              <div className="prompt-item__header">
                <div className="prompt-item__title">
                  <Typography variant="h6" component="h3">
                    {prompt.name}
                    {prompt.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {prompt.description && (
                    <Typography variant="body2" color="textSecondary">
                      {prompt.description}
                    </Typography>
                  )}
                </div>
                <div className="prompt-item__actions">
                  <IconButton
                    size="small"
                    onClick={() => handleSetDefault(prompt)}
                    disabled={prompt.is_default}
                    title={prompt.is_default ? 'This is the default' : 'Set as default'}
                  >
                    {prompt.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(prompt)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(prompt)}
                    disabled={prompt.is_default}
                    title={prompt.is_default ? 'Cannot delete default prompt' : 'Delete'}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              
              <div className="prompt-item__content">
                {prompt.content}
              </div>
              
              <div className="prompt-item__meta">
                <span>Last updated: {new Date(prompt.updated_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasePromptsTab;
