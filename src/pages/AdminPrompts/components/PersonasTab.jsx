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

const PersonasTab = ({ showNotification, reloadPrompts, canEdit }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, persona: null });

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
        if (data.personas.length > 0 && !selectedPersonaId) {
          setSelectedPersonaId(data.personas[0].id);
        }
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

  const formFields = [
    {
      name: 'name',
      label: 'Name (ID)',
      type: 'text',
      required: true,
      placeholder: 'e.g., mentor, expert, critic',
      helpText: 'Unique identifier used in code (lowercase, no spaces)'
    },
    {
      name: 'display_name',
      label: 'Display Name',
      type: 'text',
      placeholder: 'e.g., The Mentor, The Expert',
      helpText: 'Human-readable name for the persona'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Brief description of the persona\'s role',
      helpText: 'Brief description of the persona\'s role and approach'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      required: true,
      rows: 10,
      placeholder: 'Enter the persona definition...',
      helpText: 'The persona\'s characteristics and behavioral guidelines'
    },
    {
      name: 'is_default',
      label: 'Set as default persona',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  const handleCreate = () => {
    setEditingPersona(null);
    setDialogOpen(true);
  };

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setDialogOpen(true);
  };

  const handleDelete = (persona) => {
    setDeleteDialog({ open: true, persona });
  };

  const confirmDelete = async () => {
    const persona = deleteDialog.persona;
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
    } finally {
      setDeleteDialog({ open: false, persona: null });
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

  const handleSubmit = async (formData) => {
      try {
        const token = localStorage.getItem('token');
      const url = editingPersona
        ? `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${editingPersona.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas`;
      
      const response = await fetch(url, {
        method: editingPersona ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
        showNotification(`Persona ${editingPersona ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
          fetchPersonas();
        } else {
          const error = await response.json();
        throw new Error(error.error || `Failed to ${editingPersona ? 'update' : 'create'} persona`);
        }
      } catch (error) {
      console.error('Error saving persona:', error);
        showNotification(error.message, 'error');
    }
  };

  if (loading) {
    return <LoadingState count={2} />;
  }

  if (personas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
              AI Personas
            </h2>
            <p className="font-proxima text-[#666]">
              Different AI personalities that determine interaction style and approach with users.
            </p>
          </div>
          {canEdit && (
            <Button
              onClick={handleCreate}
              className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          )}
        </div>

        <EmptyState
          icon="🎭"
          title="No personas found"
          description="Create your first AI persona to get started."
          actionLabel={canEdit ? 'Create Persona' : undefined}
          onAction={canEdit ? handleCreate : undefined}
        />

        <PromptFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
          title="Create Persona"
          confirmText="Create"
          initialData={{}}
          fields={formFields}
        />
      </div>
    );
  }

  const currentPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            AI Personas
          </h2>
          <p className="font-proxima text-[#666]">
            Different AI personalities that determine interaction style and approach with users.
          </p>
        </div>
          {canEdit && (
            <Button
              onClick={handleCreate}
              className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          )}
      </div>

      {/* Personas Tabs */}
      <Tabs value={selectedPersonaId?.toString()} onValueChange={(val) => setSelectedPersonaId(parseInt(val))}>
        <TabsList className="bg-white border border-[#C8C8C8] p-1 h-auto flex-wrap justify-start">
          {personas.map((persona) => (
            <TabsTrigger
              key={persona.id}
              value={persona.id.toString()}
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              <span className="truncate max-w-[150px]">
                {persona.display_name || persona.name}
              </span>
              {persona.is_default && (
                <Badge className="ml-1 bg-[#FFD3C2] text-[#1E1E1E] hover:bg-[#FFD3C2] h-4 text-[10px] px-1">
                  Default
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {personas.map((persona) => (
          <TabsContent key={persona.id} value={persona.id.toString()} className="m-0 mt-6">
            <Card className="bg-white border-[#C8C8C8]">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-proxima-bold text-[#1E1E1E] flex items-center gap-2 flex-wrap">
                      {persona.display_name || persona.name}
                      {persona.is_default && (
                        <Badge className="bg-[#4242EA] text-white hover:bg-[#3535D1]">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="font-proxima text-[#666] mt-1">
                      ID: {persona.name}
                    </CardDescription>
                    {persona.description && (
                      <CardDescription className="font-proxima text-[#666]">
                        {persona.description}
                      </CardDescription>
                  )}
                </div>

                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetDefault(persona)}
                        disabled={persona.is_default}
                        className={`h-8 w-8 ${
                          persona.is_default 
                            ? 'text-[#4242EA]' 
                            : 'text-[#666] hover:text-[#4242EA]'
                        }`}
                        title={persona.is_default ? 'This is the default' : 'Set as default'}
                      >
                        <Star className={`h-4 w-4 ${persona.is_default ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(persona)}
                        className="h-8 w-8 text-[#666] hover:text-[#4242EA]"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(persona)}
                        disabled={persona.is_default}
                        className="h-8 w-8 text-[#666] hover:text-red-600 disabled:opacity-30"
                        title={persona.is_default ? 'Cannot delete default persona' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[50vh] w-full rounded-lg">
                  <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
                    <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                      {persona.content}
                    </pre>
                  </div>
                </ScrollArea>

                <div className="mt-3 text-xs text-[#666] font-proxima">
                  Last updated: {new Date(persona.updated_at).toLocaleString()}
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
        title={editingPersona ? 'Edit Persona' : 'Create Persona'}
        confirmText={editingPersona ? 'Update' : 'Create'}
        initialData={editingPersona || {}}
        fields={formFields}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, persona: null })}
        onConfirm={confirmDelete}
        title="Delete Persona?"
        itemName={deleteDialog.persona?.display_name || deleteDialog.persona?.name}
        description="This action cannot be undone."
      />
    </div>
  );
};

export default PersonasTab;
