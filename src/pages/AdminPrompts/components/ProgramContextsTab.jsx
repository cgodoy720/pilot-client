import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import PromptCard from './shared/PromptCard';
import PromptFormDialog from './shared/PromptFormDialog';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';
import DeleteConfirmDialog from './shared/DeleteConfirmDialog';

const ProgramContextsTab = ({ showNotification, reloadPrompts }) => {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, context: null });

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

  const formFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., default-program-context',
      helpText: 'Unique identifier for the program context'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Brief description of the program context',
      helpText: 'Optional description of what this context provides'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      rows: 10,
      placeholder: 'Enter the program context content...',
      helpText: 'The context information about the learning program'
    },
    {
      name: 'is_default',
      label: 'Set as default program context',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  const handleCreate = () => {
    setEditingContext(null);
    setDialogOpen(true);
  };

  const handleEdit = (context) => {
    setEditingContext(context);
    setDialogOpen(true);
  };

  const handleDelete = (context) => {
    setDeleteDialog({ open: true, context });
  };

  const confirmDelete = async () => {
    const context = deleteDialog.context;
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
    } finally {
      setDeleteDialog({ open: false, context: null });
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

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingContext
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${editingContext.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts`;
      
      const response = await fetch(url, {
        method: editingContext ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification(`Program context ${editingContext ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        fetchContexts();
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingContext ? 'update' : 'create'} program context`);
      }
    } catch (error) {
      console.error('Error saving program context:', error);
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
            Program Contexts
          </h2>
          <p className="font-proxima text-[#666]">
            Program-specific context information that provides background about the learning program.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Program Context
        </Button>
      </div>

      {/* Contexts List */}
      {contexts.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No program contexts found"
          description="Create your first program context to get started."
          actionLabel="Create Program Context"
          onAction={handleCreate}
        />
      ) : (
        <div className="space-y-4">
          {contexts.map((context) => (
            <PromptCard
              key={context.id}
              prompt={context}
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
        title={editingContext ? 'Edit Program Context' : 'Create Program Context'}
        confirmText={editingContext ? 'Update' : 'Create'}
        initialData={editingContext || {}}
        fields={formFields}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, context: null })}
        onConfirm={confirmDelete}
        title="Delete Program Context?"
        itemName={deleteDialog.context?.name}
        description="This action cannot be undone."
      />
    </div>
  );
};

export default ProgramContextsTab;
