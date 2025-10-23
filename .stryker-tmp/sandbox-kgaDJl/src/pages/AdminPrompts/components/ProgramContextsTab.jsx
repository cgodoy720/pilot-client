// @ts-nocheck
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

const ProgramContextsTab = ({ showNotification, reloadPrompts }) => {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContext, setEditingContext] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    is_default: false
  });

  useEffect(() => {
    fetchContexts();
  }, []);

  const fetchContexts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContexts(data.program_contexts || []);
      } else {
        throw new Error('Failed to fetch program contexts');
      }
    } catch (error) {
      console.error('Error fetching program contexts:', error);
      showNotification('Failed to load program contexts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const { value: formData } = await Swal.fire({
      title: 'Create New Program Context',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., default-program-context" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the program context</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the program context"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the program context content..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default program context
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Create Program Context',
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Program context created successfully');
          fetchContexts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create program context');
        }
      } catch (error) {
        console.error('Error creating program context:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleEdit = async (context) => {
    const { value: formData } = await Swal.fire({
      title: 'Edit Program Context',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" value="${context.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the program context</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" value="${context.description || ''}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${context.content}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" ${context.is_default ? 'checked' : ''} style="margin-right: 0.5rem;">
              Set as default program context
            </label>
          </div>
        </div>
      `,
      background: '#2a2d3e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Update Program Context',
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          showNotification('Program context updated successfully');
          fetchContexts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update program context');
        }
      } catch (error) {
        console.error('Error updating program context:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleDelete = async (context) => {
    const result = await Swal.fire({
      title: 'Delete Program Context?',
      text: `Are you sure you want to delete "${context.name}"? This action cannot be undone.`,
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showNotification('Program context deleted successfully');
          fetchContexts();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete program context');
        }
      } catch (error) {
        console.error('Error deleting program context:', error);
        showNotification(error.message, 'error');
      }
    }
  };

  const handleSetDefault = async (context) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`"${context.name}" set as default program context`);
        fetchContexts();
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
            Program Contexts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Program-specific context information that provides background about the learning program.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Create Program Context
          </Button>
        </div>
      </div>

      {contexts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <Typography variant="h6" gutterBottom>
            No program contexts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first program context to get started.
          </Typography>
        </div>
      ) : (
        <div className="prompt-list">
          {contexts.map((context) => (
            <div key={context.id} className="prompt-item">
              <div className="prompt-item__header">
                <div className="prompt-item__title">
                  <Typography variant="h6" component="h3">
                    {context.name}
                    {context.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {context.description && (
                    <Typography variant="body2" color="textSecondary">
                      {context.description}
                    </Typography>
                  )}
                </div>
                <div className="prompt-item__actions">
                  <IconButton
                    size="small"
                    onClick={() => handleSetDefault(context)}
                    disabled={context.is_default}
                    title={context.is_default ? 'This is the default' : 'Set as default'}
                  >
                    {context.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(context)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(context)}
                    disabled={context.is_default}
                    title={context.is_default ? 'Cannot delete default context' : 'Delete'}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              
              <div className="prompt-item__content">
                {context.content}
              </div>
              
              <div className="prompt-item__meta">
                <span>Last updated: {new Date(context.updated_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramContextsTab;
