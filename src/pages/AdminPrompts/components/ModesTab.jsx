import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import PromptFormDialog from './shared/PromptFormDialog';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';
import DeleteConfirmDialog from './shared/DeleteConfirmDialog';

const ModesTab = ({ showNotification, reloadPrompts }) => {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModeId, setSelectedModeId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMode, setEditingMode] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mode: null });

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
        if (data.modes.length > 0 && !selectedModeId) {
          setSelectedModeId(data.modes[0].id);
        }
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

  const formFields = [
    {
      name: 'name',
      label: 'Name (ID)',
      type: 'text',
      required: true,
      placeholder: 'e.g., coach_only, technical_assistant',
      helpText: 'Unique identifier used in code (lowercase, underscores)'
    },
    {
      name: 'display_name',
      label: 'Display Name',
      type: 'text',
      placeholder: 'e.g., Coach Only, Technical Assistant',
      helpText: 'Human-readable name for the mode'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Brief description of when to use this mode',
      helpText: 'Brief description of the mode\'s behavior and when to use it'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      rows: 10,
      placeholder: 'Enter the mode behavioral instructions...',
      helpText: 'The behavioral guidelines for this mode'
    },
    {
      name: 'is_default',
      label: 'Set as default mode',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  const handleCreate = () => {
    setEditingMode(null);
    setDialogOpen(true);
  };

  const handleEdit = (mode) => {
    setEditingMode(mode);
    setDialogOpen(true);
  };

  const handleDelete = (mode) => {
    setDeleteDialog({ open: true, mode });
  };

  const confirmDelete = async () => {
    const mode = deleteDialog.mode;
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
        fetchModes();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete mode');
      }
    } catch (error) {
      console.error('Error deleting mode:', error);
      showNotification(error.message, 'error');
    } finally {
      setDeleteDialog({ open: false, mode: null });
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
        fetchModes();
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
      const url = editingMode
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${editingMode.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes`;
      
      const response = await fetch(url, {
        method: editingMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification(`Mode ${editingMode ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        fetchModes();
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingMode ? 'update' : 'create'} mode`);
      }
    } catch (error) {
      console.error('Error saving mode:', error);
      showNotification(error.message, 'error');
    }
  };

  if (loading) {
    return <LoadingState count={2} />;
  }

  if (modes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
              AI Modes
            </h2>
            <p className="font-proxima text-[#666]">
              Different operational modes that control specific AI behaviors and constraints.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Mode
          </Button>
        </div>

        <EmptyState
          icon="⚙️"
          title="No modes found"
          description="Create your first AI mode to get started."
          actionLabel="Create Mode"
          onAction={handleCreate}
        />

        <PromptFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          title="Create Mode"
          confirmText="Create"
          initialData={{}}
          fields={formFields}
        />
      </div>
    );
  }

  const currentMode = modes.find(m => m.id === selectedModeId) || modes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            AI Modes
          </h2>
          <p className="font-proxima text-[#666]">
            Different operational modes that control specific AI behaviors and constraints.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Mode
        </Button>
      </div>

      {/* Modes Tabs */}
      <Tabs value={selectedModeId?.toString()} onValueChange={(val) => setSelectedModeId(parseInt(val))}>
        <TabsList className="bg-white border border-[#C8C8C8] p-1 h-auto flex-wrap justify-start">
          {modes.map((mode) => (
            <TabsTrigger
              key={mode.id}
              value={mode.id.toString()}
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              <span className="truncate max-w-[150px]">
                {mode.display_name || mode.name}
              </span>
              {mode.is_default && (
                <Badge className="ml-1 bg-[#FFD3C2] text-[#1E1E1E] hover:bg-[#FFD3C2] h-4 text-[10px] px-1">
                  Default
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {modes.map((mode) => (
          <TabsContent key={mode.id} value={mode.id.toString()} className="m-0 mt-6">
            <Card className="bg-white border-[#C8C8C8]">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-proxima-bold text-[#1E1E1E] flex items-center gap-2 flex-wrap">
                      {mode.display_name || mode.name}
                      {mode.is_default && (
                        <Badge className="bg-[#4242EA] text-white hover:bg-[#3535D1]">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="font-proxima text-[#666] mt-1">
                      ID: {mode.name}
                    </CardDescription>
                    {mode.description && (
                      <CardDescription className="font-proxima text-[#666]">
                        {mode.description}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(mode)}
                      disabled={mode.is_default}
                      className={`h-8 w-8 ${
                        mode.is_default 
                          ? 'text-[#4242EA]' 
                          : 'text-[#666] hover:text-[#4242EA]'
                      }`}
                      title={mode.is_default ? 'This is the default' : 'Set as default'}
                    >
                      <Star className={`h-4 w-4 ${mode.is_default ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(mode)}
                      className="h-8 w-8 text-[#666] hover:text-[#4242EA]"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(mode)}
                      disabled={mode.is_default}
                      className="h-8 w-8 text-[#666] hover:text-red-600 disabled:opacity-30"
                      title={mode.is_default ? 'Cannot delete default mode' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[50vh] w-full rounded-lg">
                  <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
                    <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                      {mode.content}
                    </pre>
                  </div>
                </ScrollArea>

                <div className="mt-3 text-xs text-[#666] font-proxima">
                  Last updated: {new Date(mode.updated_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Form Dialog */}
      <PromptFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        title={editingMode ? 'Edit Mode' : 'Create Mode'}
        confirmText={editingMode ? 'Update' : 'Create'}
        initialData={editingMode || {}}
        fields={formFields}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, mode: null })}
        onConfirm={confirmDelete}
        title="Delete Mode?"
        itemName={deleteDialog.mode?.display_name || deleteDialog.mode?.name}
        description="This action cannot be undone."
      />
    </div>
  );
};

export default ModesTab;
