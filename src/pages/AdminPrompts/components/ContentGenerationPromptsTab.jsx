import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import PromptFormDialog from './shared/PromptFormDialog';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';
import DeleteConfirmDialog from './shared/DeleteConfirmDialog';

const ContentGenerationPromptsTab = ({ showNotification, reloadPrompts }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, prompt: null });

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

  const formFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., json_build_guidelines_v2',
      helpText: 'Unique identifier'
    },
    {
      name: 'display_name',
      label: 'Display Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., JSON Build Guidelines v2.0',
      helpText: 'Human-readable name'
    },
    {
      name: 'prompt_type',
      label: 'Prompt Type',
      type: 'select',
      required: true,
      options: [
        { value: 'json_builder', label: 'JSON Builder' },
        { value: 'facilitator_notes', label: 'Facilitator Notes' },
        { value: 'other', label: 'Other' }
      ],
      helpText: 'Category of content generation'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'What this prompt does and when to use it...',
      helpText: 'Explanation of the prompt\'s purpose'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      rows: 10,
      placeholder: 'Enter the prompt content...',
      helpText: 'The actual prompt that will be used for content generation (Markdown supported)'
    },
    {
      name: 'is_default',
      label: 'Set as default for this type',
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation/${prompt.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification('Content generation prompt deleted successfully');
        fetchPrompts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showNotification(error.message, 'error');
    } finally {
      setDeleteDialog({ open: false, prompt: null });
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
        showNotification(`"${prompt.display_name}" set as default for ${prompt.prompt_type}`);
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
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation/${editingPrompt.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/content-generation`;
      
      const response = await fetch(url, {
        method: editingPrompt ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification(`Content generation prompt ${editingPrompt ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        fetchPrompts();
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingPrompt ? 'update' : 'create'} prompt`);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      showNotification(error.message, 'error');
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'json_builder':
        return 'bg-[#4242EA] text-white hover:bg-[#3535D1]';
      case 'facilitator_notes':
        return 'bg-purple-600 text-white hover:bg-purple-700';
      case 'other':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      json_builder: 'JSON Builder',
      facilitator_notes: 'Facilitator Notes',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-[200px] h-10 bg-[#E3E3E3] animate-pulse rounded"></div>
          <div className="w-[150px] h-10 bg-[#E3E3E3] animate-pulse rounded"></div>
        </div>
        <LoadingState count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1">
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            Content Generation Prompts
          </h2>
          <p className="font-proxima text-[#666]">
            Specialized prompts used for generating different types of content.
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px] bg-white border-[#C8C8C8]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="json_builder">JSON Builder</SelectItem>
              <SelectItem value="facilitator_notes">Facilitator Notes</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleCreate}
            className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No content generation prompts found"
          description={filterType === 'all' ? 'Create your first content generation prompt to get started.' : `No prompts found for type: ${getTypeLabel(filterType)}`}
          actionLabel="Create Prompt"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="bg-white border-[#C8C8C8] hover:border-[#4242EA] hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge className={getTypeBadgeColor(prompt.prompt_type)}>
                    {getTypeLabel(prompt.prompt_type)}
                  </Badge>
                  {prompt.is_default && (
                    <Badge className="bg-[#FFD3C2] text-[#1E1E1E] hover:bg-[#FFD3C2]">
                      Default
                    </Badge>
                  )}
                </div>

                <CardTitle className="font-proxima-bold text-[#1E1E1E] text-base">
                  {prompt.display_name}
                </CardTitle>

                <CardDescription className="font-proxima text-[#666] text-xs">
                  ID: {prompt.name}
                </CardDescription>

                {prompt.description && (
                  <CardDescription className="font-proxima text-[#666] text-sm mt-2">
                    {prompt.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-3 max-h-[150px] overflow-y-auto">
                  <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                    {prompt.content.length > 300 ? `${prompt.content.substring(0, 300)}...` : prompt.content}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E3E3E3]">
                  <div className="text-xs text-[#666] font-proxima">
                    Updated: {new Date(prompt.updated_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(prompt)}
                      disabled={prompt.is_default}
                      className={`h-7 w-7 ${
                        prompt.is_default 
                          ? 'text-[#4242EA]' 
                          : 'text-[#666] hover:text-[#4242EA]'
                      }`}
                      title={prompt.is_default ? 'This is the default' : 'Set as default'}
                    >
                      <Star className={`h-3.5 w-3.5 ${prompt.is_default ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(prompt)}
                      className="h-7 w-7 text-[#666] hover:text-[#4242EA]"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prompt)}
                      disabled={prompt.is_default}
                      className="h-7 w-7 text-[#666] hover:text-red-600 disabled:opacity-30"
                      title={prompt.is_default ? 'Cannot delete default prompt' : 'Delete'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PromptFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        title={editingPrompt ? 'Edit Content Generation Prompt' : 'Create Content Generation Prompt'}
        confirmText={editingPrompt ? 'Update' : 'Create'}
        initialData={editingPrompt || {}}
        fields={formFields}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, prompt: null })}
        onConfirm={confirmDelete}
        title="Delete Content Generation Prompt?"
        itemName={deleteDialog.prompt?.display_name}
        description="This action cannot be undone."
      />
    </div>
  );
};

export default ContentGenerationPromptsTab;
