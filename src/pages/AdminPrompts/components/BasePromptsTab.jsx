import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import PromptCard from './shared/PromptCard';
import PromptFormDialog from './shared/PromptFormDialog';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';
import DeleteConfirmDialog from './shared/DeleteConfirmDialog';

const BasePromptsTab = ({ showNotification, reloadPrompts }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, prompt: null });

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

  const formFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., default-base-prompt',
      helpText: 'Unique identifier for the base prompt'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Brief description of the base prompt',
      helpText: 'Optional description of what this prompt does'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      rows: 10,
      placeholder: 'Enter the base prompt content...',
      helpText: 'The actual prompt text that will be used'
    },
    {
      name: 'is_default',
      label: 'Set as default base prompt',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  const handleCreate = () => {
    setEditingPrompt(null);
    setDialogOpen(true);
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setDialogOpen(true);
  };

  const handleDelete = (prompt) => {
    setDeleteDialog({ open: true, prompt });
  };

  const confirmDelete = async () => {
    const prompt = deleteDialog.prompt;
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
    } finally {
      setDeleteDialog({ open: false, prompt: null });
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

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingPrompt
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${editingPrompt.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/base`;
      
      const response = await fetch(url, {
        method: editingPrompt ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification(`Base prompt ${editingPrompt ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        fetchPrompts();
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingPrompt ? 'update' : 'create'} base prompt`);
      }
    } catch (error) {
      console.error('Error saving base prompt:', error);
      showNotification(error.message, 'error');
    }
  };

  if (loading) {
    return <LoadingState count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            Base Prompts
          </h2>
          <p className="font-proxima text-[#666]">
            Core system prompts that define the AI's fundamental behavior and context.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Base Prompt
        </Button>
      </div>

      {/* Prompts List */}
      {prompts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No base prompts found"
          description="Create your first base prompt to get started."
          actionLabel="Create Base Prompt"
          onAction={handleCreate}
        />
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PromptFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        title={editingPrompt ? 'Edit Base Prompt' : 'Create Base Prompt'}
        confirmText={editingPrompt ? 'Update' : 'Create'}
        initialData={editingPrompt || {}}
        fields={formFields}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, prompt: null })}
        onConfirm={confirmDelete}
        title="Delete Base Prompt?"
        itemName={deleteDialog.prompt?.name}
        description="This action cannot be undone."
      />
    </div>
  );
};

export default BasePromptsTab;
