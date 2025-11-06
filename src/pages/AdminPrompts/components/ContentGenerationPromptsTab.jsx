import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const ContentGenerationPromptsTab = ({ showNotification, reloadPrompts }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPrompts();
  }, [filterType]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = filterType === 'all'
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation?prompt_type=${filterType}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        throw new Error('Failed to fetch content generation prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      showNotification('Failed to load content generation prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formData } = await Swal.fire({
      title: 'Create Content Generation Prompt',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., json_build_guidelines_v2" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Display Name *</label>
            <input id="swal-display-name" class="swal2-input" placeholder="e.g., JSON Build Guidelines v2.0"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Prompt Type *</label>
            <select id="swal-type" style="width: 100%; padding: 0.75rem; background: #1A1F2C; border: 1px solid #444; color: #fff; border-radius: 4px;">
              <option value="json_builder">JSON Builder</option>
              <option value="facilitator_notes">Facilitator Notes</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <textarea id="swal-description" placeholder="What this prompt does and when to use it..." rows="3"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content * (Markdown supported)</label>
            <textarea id="swal-content" placeholder="Enter the prompt content..." rows="10"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
            <small style="color: #888;">This is the actual prompt that will be used for content generation</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default for this type
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-active" checked style="margin-right: 0.5rem;">
              Active (enabled for use)
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Create Prompt',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '700px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const displayName = document.getElementById('swal-display-name').value;
        const promptType = document.getElementById('swal-type').value;
        const description = document.getElementById('swal-description').value;
        const content = document.getElementById('swal-content').value;
        const isDefault = document.getElementById('swal-default').checked;
        const isActive = document.getElementById('swal-active').checked;

        if (!name.trim()) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        if (!displayName.trim()) {
          Swal.showValidationMessage('Display name is required');
          return false;
        }
        if (!content.trim()) {
          Swal.showValidationMessage('Content is required');
          return false;
        }

        return {
          name: name.trim(),
          display_name: displayName.trim(),
          prompt_type: promptType,
          description: description.trim() || '',
          content: content.trim(),
          is_default: isDefault,
          is_active: isActive
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Content generation prompt created successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create prompt');
        }
      } catch (error) {
        console.error('Error creating prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleEdit = async (prompt) => {
    const { value: formData } = await Swal.fire({
      title: 'Edit Content Generation Prompt',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" value="${prompt.name || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Display Name *</label>
            <input id="swal-display-name" class="swal2-input" value="${prompt.display_name || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Prompt Type *</label>
            <select id="swal-type" style="width: 100%; padding: 0.75rem; background: #1A1F2C; border: 1px solid #444; color: #fff; border-radius: 4px;">
              <option value="json_builder" ${prompt.prompt_type === 'json_builder' ? 'selected' : ''}>JSON Builder</option>
              <option value="facilitator_notes" ${prompt.prompt_type === 'facilitator_notes' ? 'selected' : ''}>Facilitator Notes</option>
              <option value="other" ${prompt.prompt_type === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <textarea id="swal-description" rows="3"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; resize: vertical;">${prompt.description || ''}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" rows="10"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${prompt.content || ''}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" ${prompt.is_default ? 'checked' : ''} style="margin-right: 0.5rem;">
              Set as default for this type
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-active" ${prompt.is_active !== false ? 'checked' : ''} style="margin-right: 0.5rem;">
              Active (enabled for use)
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4242ea',
      cancelButtonColor: '#666',
      width: '700px',
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const displayName = document.getElementById('swal-display-name').value;
        const promptType = document.getElementById('swal-type').value;
        const description = document.getElementById('swal-description').value;
        const content = document.getElementById('swal-content').value;
        const isDefault = document.getElementById('swal-default').checked;
        const isActive = document.getElementById('swal-active').checked;

        if (!name.trim()) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        if (!displayName.trim()) {
          Swal.showValidationMessage('Display name is required');
          return false;
        }
        if (!content.trim()) {
          Swal.showValidationMessage('Content is required');
          return false;
        }

        return {
          name: name.trim(),
          display_name: displayName.trim(),
          prompt_type: promptType,
          description: description.trim() || '',
          content: content.trim(),
          is_default: isDefault,
          is_active: isActive
        };
      }
    });

    if (formData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation/${prompt.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Prompt updated successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update prompt');
        }
      } catch (error) {
        console.error('Error updating prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleDelete = async (prompt) => {
    const result = await Swal.fire({
      title: 'Delete Prompt?',
      text: `Are you sure you want to delete "${prompt.display_name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, delete it',
      background: '#2a2d3e',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation/${prompt.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showNotification('Prompt deleted successfully');
          fetchPrompts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete prompt');
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleSetDefault = async (prompt) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation/${prompt.id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`Set "${prompt.display_name}" as default for ${prompt.prompt_type}`);
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'json_builder': return 'primary';
      case 'facilitator_notes': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'json_builder': return 'JSON Builder';
      case 'facilitator_notes': return 'Facilitator Notes';
      default: return type;
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
            Content Generation Prompts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage prompts for JSON Generator, Facilitator Notes, and other content generation tools
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="json_builder">JSON Builder</MenuItem>
              <MenuItem value="facilitator_notes">Facilitator Notes</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Prompt
          </Button>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <Typography variant="h6" gutterBottom>
            No content generation prompts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first prompt to get started
          </Typography>
        </div>
      ) : (
        <div className="prompt-list">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="prompt-item">
              <div className="prompt-item__header">
                <div className="prompt-item__title">
                  <Typography variant="h6" component="h3">
                    {prompt.display_name}
                    {prompt.is_default && (
                      <Chip
                        icon={<StarIcon />}
                        label="Default"
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {!prompt.is_active && (
                      <Chip 
                        label="Inactive" 
                        size="small" 
                        color="default"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {prompt.name}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getTypeLabel(prompt.prompt_type)}
                      size="small"
                      color={getTypeColor(prompt.prompt_type)}
                    />
                  </Box>
                  {prompt.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
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
                    {prompt.is_default ? <StarIcon color="warning" /> : <StarBorderIcon />}
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
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  Prompt Content Preview:
                </Typography>
                {prompt.content.substring(0, 500)}
                {prompt.content.length > 500 && '...'}
              </div>
              
              <div className="prompt-item__meta">
                <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                <span>{prompt.content.length} characters</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentGenerationPromptsTab;

