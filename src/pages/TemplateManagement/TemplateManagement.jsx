import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, GripVertical, Copy, X } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ============================================================================
// ASSESSMENT TEMPLATES TAB
// ============================================================================

function AssessmentTemplatesTab({ token }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [selectedTemplateForInstance, setSelectedTemplateForInstance] = useState(null);
  const [expandedTemplates, setExpandedTemplates] = useState(new Set());
  const [collapsedLevels, setCollapsedLevels] = useState(new Set());

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/templates/assessments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data.templates || []);
    } catch (error) {
      toast.error('Failed to load assessment templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const toggleExpand = (templateId) => {
    setExpandedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate({
      ...template,
      deliverables: typeof template.deliverables === 'string'
        ? JSON.parse(template.deliverables)
        : template.deliverables,
      deliverable_schema: template.deliverable_schema || null
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `${API_URL}/api/admin/templates/assessments/${editingTemplate.template_id}`,
        {
          assessment_name: editingTemplate.assessment_name,
          assessment_type: editingTemplate.assessment_type,
          instructions: editingTemplate.instructions,
          deliverables: editingTemplate.deliverables,
          deliverable_schema: editingTemplate.deliverable_schema
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Template updated');
      setEditDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const handleToggleInstance = async (assessmentId, currentActive) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/templates/assessments/instances/${assessmentId}`,
        { is_active: !currentActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Assessment ${currentActive ? 'deactivated' : 'activated'}`);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update assessment');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-slate-500 font-proxima">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-proxima">{templates.length} assessment template(s)</p>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">
          <Plus className="h-4 w-4 mr-1" /> New Template
        </Button>
      </div>

      <div className="space-y-6">
        {(() => {
          // Group templates by level extracted from the name (e.g. "L1 Week 2 ..." → "L1")
          const grouped = {};
          templates.forEach(template => {
            const match = template.assessment_name.match(/^(L\d+)/i);
            const level = match ? match[1].toUpperCase() : 'Other';
            if (!grouped[level]) grouped[level] = [];
            grouped[level].push(template);
          });
          // Sort levels naturally: L1, L2, L3, ... then Other
          const sortedLevels = Object.keys(grouped).sort((a, b) => {
            if (a === 'Other') return 1;
            if (b === 'Other') return -1;
            return a.localeCompare(b, undefined, { numeric: true });
          });

          const toggleLevel = (level) => {
            setCollapsedLevels(prev => {
              const next = new Set(prev);
              if (next.has(level)) next.delete(level);
              else next.add(level);
              return next;
            });
          };

          return sortedLevels.map(level => {
            const isLevelCollapsed = collapsedLevels.has(level);
            return (
            <div key={level}>
              <button
                type="button"
                className="flex items-center gap-2 mb-2 group cursor-pointer"
                onClick={() => toggleLevel(level)}
              >
                {isLevelCollapsed
                  ? <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  : <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                }
                <h3 className="text-sm font-bold text-slate-700 font-proxima uppercase tracking-wide group-hover:text-slate-900">
                  {level} Assessments
                </h3>
                <span className="text-xs text-slate-400 font-proxima">({grouped[level].length})</span>
              </button>
              {!isLevelCollapsed && <div className="space-y-2">
                {grouped[level].map(template => {
                  const isExpanded = expandedTemplates.has(template.template_id);
                  const assessments = template.assessments || [];
                  const deliverables = typeof template.deliverables === 'string'
                    ? JSON.parse(template.deliverables)
                    : (template.deliverables || []);

                  return (
                    <div key={template.template_id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      {/* Template Header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleExpand(template.template_id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                          <div>
                            <div className="font-semibold text-slate-900 font-proxima">{template.assessment_name}</div>
                            <div className="text-xs text-slate-500 font-proxima">
                              Type: <span className="capitalize">{template.assessment_type}</span>
                              {' | '}Deliverables: {deliverables.length}
                              {' | '}Instances: {assessments.length}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 px-4 py-3 space-y-4 bg-slate-50">
                          {/* Instructions Preview */}
                          <div>
                            <Label className="text-xs text-slate-500 font-proxima">Instructions</Label>
                            <div className="mt-1 text-sm text-slate-700 font-proxima whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-3 rounded border">
                              {template.instructions}
                            </div>
                          </div>

                          {/* Deliverables */}
                          <div>
                            <Label className="text-xs text-slate-500 font-proxima">Deliverables</Label>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {deliverables.map((d, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-proxima">
                                  {typeof d === 'string' ? d : d.label || d.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Deliverable Schema */}
                          {template.deliverable_schema && (
                            <div>
                              <Label className="text-xs text-slate-500 font-proxima">Deliverable Schema (UI fields)</Label>
                              <div className="mt-1 text-xs text-slate-600 font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
                                {JSON.stringify(template.deliverable_schema, null, 2)}
                              </div>
                            </div>
                          )}

                          {/* Assessment Instances */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs text-slate-500 font-proxima">Assessment Instances</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedTemplateForInstance(template); setInstanceDialogOpen(true); }}
                                className="font-proxima text-xs h-7"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Instance
                              </Button>
                            </div>
                            {assessments.length === 0 ? (
                              <p className="text-xs text-slate-400 font-proxima">No instances yet</p>
                            ) : (
                              <div className="space-y-1">
                                {assessments.map(a => (
                                  <div key={a.assessment_id} className="flex items-center justify-between bg-white px-3 py-2 rounded border text-sm">
                                    <div className="font-proxima">
                                      <span className="font-semibold">{a.level}</span>
                                      {' '}<span className="text-slate-600">{a.assessment_period}</span>
                                      {' '}<span className="text-slate-400">(Day {a.trigger_day_number})</span>
                                    </div>
                                    <Button
                                      variant={a.is_active ? 'outline' : 'default'}
                                      size="sm"
                                      className={`font-proxima text-xs h-7 ${a.is_active ? '' : 'bg-green-600 hover:bg-green-700'}`}
                                      onClick={() => handleToggleInstance(a.assessment_id, a.is_active)}
                                    >
                                      {a.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>}
            </div>
          );});
        })()}
      </div>

      {/* Edit Template Dialog */}
      <AssessmentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={editingTemplate}
        setTemplate={setEditingTemplate}
        onSave={handleSaveEdit}
      />

      {/* Create Template Dialog */}
      <AssessmentCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        token={token}
        onCreated={fetchTemplates}
      />

      {/* Add Instance Dialog */}
      <InstanceCreateDialog
        open={instanceDialogOpen}
        onOpenChange={setInstanceDialogOpen}
        template={selectedTemplateForInstance}
        token={token}
        onCreated={fetchTemplates}
      />
    </div>
  );
}

// ============================================================================
// DELIVERABLES LIST BUILDER (string array)
// ============================================================================

function DeliverablesListBuilder({ deliverables = [], onChange }) {
  const addDeliverable = () => onChange([...deliverables, '']);
  const updateDeliverable = (index, value) => {
    const updated = [...deliverables];
    updated[index] = value;
    onChange(updated);
  };
  const removeDeliverable = (index) => onChange(deliverables.filter((_, i) => i !== index));
  const moveDeliverable = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= deliverables.length) return;
    const updated = [...deliverables];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="font-proxima font-semibold">Deliverables ({deliverables.length})</Label>
        <Button size="sm" variant="outline" onClick={addDeliverable} className="font-proxima text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      <p className="text-xs text-slate-500 font-proxima mb-2">Display labels shown to students for what they need to submit.</p>
      <div className="space-y-2">
        {deliverables.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => moveDeliverable(i, -1)} disabled={i === 0}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => moveDeliverable(i, 1)} disabled={i === deliverables.length - 1}>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={d}
              onChange={(e) => updateDeliverable(i, e.target.value)}
              placeholder="e.g. Problem statement"
              className="font-proxima text-sm flex-1"
            />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeDeliverable(i)}>
              <X className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        ))}
        {deliverables.length === 0 && (
          <p className="text-xs text-slate-400 font-proxima italic">No deliverables yet. Click "Add" to create one.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DELIVERABLE SCHEMA BUILDER (fields array controlling UI form)
// ============================================================================

const FIELD_TYPES = [
  { value: 'textarea', label: 'Text Area' },
  { value: 'url', label: 'URL Input' },
  { value: 'file_upload', label: 'File Upload' },
  { value: 'loom_url', label: 'Loom Video URL' },
];

function SchemaFieldBuilder({ fields = [], onChange }) {
  const addField = () => {
    onChange([...fields, {
      name: `field_${Date.now()}`,
      type: 'textarea',
      label: '',
      required: false,
      placeholder: '',
      help: '',
      rows: 4,
    }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const removeField = (index) => onChange(fields.filter((_, i) => i !== index));

  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="font-proxima font-semibold">Deliverable Schema — UI Fields ({fields.length})</Label>
        <Button size="sm" variant="outline" onClick={addField} className="font-proxima text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add Field
        </Button>
      </div>
      <p className="text-xs text-slate-500 font-proxima mb-2">
        Controls the form fields students see when submitting. Leave empty to use the default schema for this assessment type.
      </p>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="bg-slate-50 border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 font-proxima">F{i + 1}</span>
                <Select value={field.type} onValueChange={(v) => updateField(i, 'type', v)}>
                  <SelectTrigger className="w-32 h-7 text-xs font-proxima"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(ft => (
                      <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-1 text-xs font-proxima">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => updateField(i, 'required', e.target.checked)}
                  />
                  Required
                </label>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveField(i, -1)} disabled={i === 0}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveField(i, 1)} disabled={i === fields.length - 1}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeField(i)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-proxima">Field Name (ID)</Label>
                <Input
                  value={field.name || ''}
                  onChange={(e) => updateField(i, 'name', e.target.value)}
                  placeholder="e.g. githubUrl"
                  className="font-proxima font-mono text-xs h-8"
                />
              </div>
              <div>
                <Label className="text-xs font-proxima">Label</Label>
                <Input
                  value={field.label || ''}
                  onChange={(e) => updateField(i, 'label', e.target.value)}
                  placeholder="e.g. GitHub Repository Link"
                  className="font-proxima text-xs h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-proxima">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(i, 'placeholder', e.target.value)}
                placeholder="e.g. https://github.com/username/repository"
                className="font-proxima text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-proxima">Help Text</Label>
              <Input
                value={field.help || ''}
                onChange={(e) => updateField(i, 'help', e.target.value)}
                placeholder="Additional guidance for the student"
                className="font-proxima text-xs h-8"
              />
            </div>

            {field.type === 'textarea' && (
              <div className="w-24">
                <Label className="text-xs font-proxima">Rows</Label>
                <Input
                  type="number"
                  value={field.rows || 4}
                  onChange={(e) => updateField(i, 'rows', parseInt(e.target.value) || 4)}
                  className="font-proxima text-xs h-8"
                  min={2}
                  max={20}
                />
              </div>
            )}
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-slate-400 font-proxima italic">
            No custom schema. The default schema for this assessment type will be used.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ASSESSMENT EDIT DIALOG
// ============================================================================

function AssessmentEditDialog({ open, onOpenChange, template, setTemplate, onSave }) {
  if (!template) return null;

  const deliverables = Array.isArray(template.deliverables) ? template.deliverables : [];
  const schemaFields = template.deliverable_schema?.fields || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima">Edit Assessment Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-proxima">Name</Label>
            <Input
              value={template.assessment_name || ''}
              onChange={(e) => setTemplate({ ...template, assessment_name: e.target.value })}
              className="font-proxima"
            />
          </div>
          <div>
            <Label className="font-proxima">Type</Label>
            <Select value={template.assessment_type} onValueChange={(v) => setTemplate({ ...template, assessment_type: v })}>
              <SelectTrigger className="font-proxima"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="self">Self</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-proxima">Instructions (Markdown)</Label>
            <Textarea
              value={template.instructions || ''}
              onChange={(e) => setTemplate({ ...template, instructions: e.target.value })}
              rows={10}
              className="font-proxima font-mono text-sm"
            />
          </div>

          {/* Deliverables List Builder */}
          <DeliverablesListBuilder
            deliverables={deliverables}
            onChange={(updated) => setTemplate({ ...template, deliverables: updated })}
          />

          {/* Deliverable Schema Builder */}
          <SchemaFieldBuilder
            fields={schemaFields}
            onChange={(updated) => setTemplate({
              ...template,
              deliverable_schema: updated.length > 0 ? { fields: updated } : null
            })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-proxima">Cancel</Button>
          <Button onClick={onSave} className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssessmentCreateDialog({ open, onOpenChange, token, onCreated }) {
  const [form, setForm] = useState({
    assessment_name: '',
    assessment_type: 'technical',
    instructions: '',
    deliverables: [],
    deliverable_schema: null,
    level: '',
    trigger_day_number: '',
    assessment_period: ''
  });

  const handleCreate = async () => {
    if (!form.assessment_name || !form.instructions) {
      toast.error('Name and instructions are required');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/templates/assessments`, {
        ...form,
        trigger_day_number: form.trigger_day_number ? parseInt(form.trigger_day_number) : undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Template created');
      onOpenChange(false);
      setForm({ assessment_name: '', assessment_type: 'technical', instructions: '', deliverables: [], deliverable_schema: null, level: '', trigger_day_number: '', assessment_period: '' });
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create template');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima">Create Assessment Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-proxima">Name *</Label>
              <Input value={form.assessment_name} onChange={(e) => setForm({ ...form, assessment_name: e.target.value })} className="font-proxima" />
            </div>
            <div>
              <Label className="font-proxima">Type *</Label>
              <Select value={form.assessment_type} onValueChange={(v) => setForm({ ...form, assessment_type: v })}>
                <SelectTrigger className="font-proxima"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="self">Self</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="font-proxima">Instructions (Markdown) *</Label>
            <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={8} className="font-proxima font-mono text-sm" />
          </div>
          {/* Deliverables List Builder */}
          <DeliverablesListBuilder
            deliverables={form.deliverables}
            onChange={(updated) => setForm({ ...form, deliverables: updated })}
          />

          {/* Deliverable Schema Builder */}
          <SchemaFieldBuilder
            fields={form.deliverable_schema?.fields || []}
            onChange={(updated) => setForm({
              ...form,
              deliverable_schema: updated.length > 0 ? { fields: updated } : null
            })}
          />

          <div className="border-t pt-4">
            <p className="text-sm text-slate-500 font-proxima mb-3">Optionally create an assessment instance at the same time:</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-proxima">Level</Label>
                <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. L2" className="font-proxima" />
              </div>
              <div>
                <Label className="font-proxima">Trigger Day #</Label>
                <Input type="number" value={form.trigger_day_number} onChange={(e) => setForm({ ...form, trigger_day_number: e.target.value })} placeholder="e.g. 20" className="font-proxima" />
              </div>
              <div>
                <Label className="font-proxima">Period</Label>
                <Input value={form.assessment_period} onChange={(e) => setForm({ ...form, assessment_period: e.target.value })} placeholder="e.g. Week 8" className="font-proxima" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-proxima">Cancel</Button>
          <Button onClick={handleCreate} className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">Create Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InstanceCreateDialog({ open, onOpenChange, template, token, onCreated }) {
  const [form, setForm] = useState({ level: '', trigger_day_number: '', assessment_period: '' });

  const handleCreate = async () => {
    if (!form.level || !form.trigger_day_number || !form.assessment_period) {
      toast.error('All fields are required');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/admin/templates/assessments/${template.template_id}/instances`,
        { ...form, trigger_day_number: parseInt(form.trigger_day_number) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Assessment instance created');
      onOpenChange(false);
      setForm({ level: '', trigger_day_number: '', assessment_period: '' });
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create instance');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-proxima">Add Assessment Instance</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 font-proxima">Template: {template?.assessment_name}</p>
        <div className="space-y-4">
          <div>
            <Label className="font-proxima">Level *</Label>
            <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. L1, L2" className="font-proxima" />
          </div>
          <div>
            <Label className="font-proxima">Trigger Day Number *</Label>
            <Input type="number" value={form.trigger_day_number} onChange={(e) => setForm({ ...form, trigger_day_number: e.target.value })} className="font-proxima" />
          </div>
          <div>
            <Label className="font-proxima">Assessment Period *</Label>
            <Input value={form.assessment_period} onChange={(e) => setForm({ ...form, assessment_period: e.target.value })} placeholder="e.g. Week 2, Week 8" className="font-proxima" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-proxima">Cancel</Button>
          <Button onClick={handleCreate} className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">Create Instance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SURVEY TEMPLATES TAB
// ============================================================================

function SurveyTemplatesTab({ token }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [expandedSurveys, setExpandedSurveys] = useState(new Set());

  const toggleExpand = (templateId) => {
    setExpandedSurveys(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/templates/surveys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data.templates || []);
    } catch (error) {
      toast.error('Failed to load survey templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleEdit = (template) => {
    setEditingTemplate({
      ...template,
      questions: typeof template.questions === 'string' ? JSON.parse(template.questions) : template.questions
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `${API_URL}/api/admin/templates/surveys/${editingTemplate.template_id}`,
        {
          survey_name: editingTemplate.survey_name,
          survey_type: editingTemplate.survey_type,
          questions: editingTemplate.questions,
          is_active: editingTemplate.is_active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Survey template updated');
      setEditDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update survey template');
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await axios.delete(
        `${API_URL}/api/admin/templates/surveys/${templateToDelete.template_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Survey template deactivated');
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to deactivate survey template');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-slate-500 font-proxima">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-proxima">{templates.length} survey template(s)</p>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">
          <Plus className="h-4 w-4 mr-1" /> New Survey
        </Button>
      </div>

      <div className="space-y-3">
        {templates.map(template => {
          const questions = typeof template.questions === 'string' ? JSON.parse(template.questions) : (template.questions || []);
          const isExpanded = expandedSurveys.has(template.template_id);

          return (
            <div key={template.template_id} className={`bg-white border rounded-lg overflow-hidden ${!template.is_active ? 'opacity-60' : 'border-slate-200'}`}>
              {/* Survey Header - clickable to expand/collapse */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                onClick={() => toggleExpand(template.template_id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  <div>
                    <div className="font-semibold text-slate-900 font-proxima flex items-center gap-2">
                      {template.survey_name}
                      {!template.is_active && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-proxima">
                      Type: <span className="font-mono">{template.survey_type}</span>
                      {' | '}{questions.length} question(s)
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {template.is_active && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setTemplateToDelete(template); setDeleteConfirmOpen(true); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Content - Questions preview */}
              {isExpanded && (
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
                  <div className="space-y-1">
                    {questions.map((q, i) => (
                      <div key={q.id || i} className="text-sm text-slate-600 font-proxima flex items-start gap-2">
                        <span className="text-slate-400 text-xs mt-0.5">{i + 1}.</span>
                        <span>{q.question}</span>
                        <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
                          {q.type}{q.required ? ' *' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Survey Dialog */}
      <SurveyEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={editingTemplate}
        setTemplate={setEditingTemplate}
        onSave={handleSaveEdit}
      />

      {/* Create Survey Dialog */}
      <SurveyCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        token={token}
        onCreated={fetchTemplates}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="font-proxima">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Survey Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>{templateToDelete?.survey_name}</strong>. Existing responses will be preserved. You can reactivate it later by editing the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SurveyEditDialog({ open, onOpenChange, template, setTemplate, onSave }) {
  if (!template) return null;

  const questions = template.questions || [];

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setTemplate({ ...template, questions: updated });
  };

  const addQuestion = () => {
    setTemplate({
      ...template,
      questions: [...questions, {
        id: `question_${Date.now()}`,
        type: 'textarea',
        question: '',
        placeholder: '',
        required: false
      }]
    });
  };

  const removeQuestion = (index) => {
    setTemplate({ ...template, questions: questions.filter((_, i) => i !== index) });
  };

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setTemplate({ ...template, questions: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima">Edit Survey Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-proxima">Survey Name</Label>
              <Input value={template.survey_name || ''} onChange={(e) => setTemplate({ ...template, survey_name: e.target.value })} className="font-proxima" />
            </div>
            <div>
              <Label className="font-proxima">Survey Type (unique key)</Label>
              <Input value={template.survey_type || ''} onChange={(e) => setTemplate({ ...template, survey_type: e.target.value })} className="font-proxima font-mono" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={template.is_active}
              onChange={(e) => setTemplate({ ...template, is_active: e.target.checked })}
              id="survey-active"
            />
            <Label htmlFor="survey-active" className="font-proxima">Active</Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-proxima font-semibold">Questions ({questions.length})</Label>
              <Button size="sm" variant="outline" onClick={addQuestion} className="font-proxima">
                <Plus className="h-3 w-3 mr-1" /> Add Question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id || i} className="bg-slate-50 border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-proxima">Q{i + 1}</span>
                      <Select value={q.type} onValueChange={(v) => updateQuestion(i, 'type', v)}>
                        <SelectTrigger className="w-28 h-7 text-xs font-proxima"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="options">Options</SelectItem>
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1 text-xs font-proxima">
                        <input type="checkbox" checked={q.required || false} onChange={(e) => updateQuestion(i, 'required', e.target.checked)} />
                        Required
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveQuestion(i, -1)} disabled={i === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeQuestion(i)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-proxima">Question ID</Label>
                    <Input value={q.id || ''} onChange={(e) => updateQuestion(i, 'id', e.target.value)} className="font-proxima font-mono text-sm h-8" />
                  </div>

                  <div>
                    <Label className="text-xs font-proxima">Question Text</Label>
                    <Textarea value={q.question || ''} onChange={(e) => updateQuestion(i, 'question', e.target.value)} rows={2} className="font-proxima text-sm" />
                  </div>

                  {q.type === 'scale' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs font-proxima">Scale (JSON array)</Label>
                        <Input
                          value={JSON.stringify(q.scale || [])}
                          onChange={(e) => { try { updateQuestion(i, 'scale', JSON.parse(e.target.value)); } catch {} }}
                          className="font-proxima font-mono text-xs h-8"
                          placeholder="[1,2,3,4,5]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-proxima">Left Label</Label>
                        <Input value={q.leftLabel || ''} onChange={(e) => updateQuestion(i, 'leftLabel', e.target.value)} className="font-proxima text-xs h-8" />
                      </div>
                      <div>
                        <Label className="text-xs font-proxima">Right Label</Label>
                        <Input value={q.rightLabel || ''} onChange={(e) => updateQuestion(i, 'rightLabel', e.target.value)} className="font-proxima text-xs h-8" />
                      </div>
                    </div>
                  )}

                  {q.type === 'textarea' && (
                    <div>
                      <Label className="text-xs font-proxima">Placeholder</Label>
                      <Input value={q.placeholder || ''} onChange={(e) => updateQuestion(i, 'placeholder', e.target.value)} className="font-proxima text-xs h-8" />
                    </div>
                  )}

                  {q.type === 'options' && (
                    <div>
                      <Label className="text-xs font-proxima">Options (JSON array)</Label>
                      <Textarea
                        value={JSON.stringify(q.options || [], null, 2)}
                        onChange={(e) => { try { updateQuestion(i, 'options', JSON.parse(e.target.value)); } catch {} }}
                        rows={3}
                        className="font-proxima font-mono text-xs"
                        placeholder='[{"value": "yes", "label": "Yes"}]'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-proxima">Cancel</Button>
          <Button onClick={onSave} className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SurveyCreateDialog({ open, onOpenChange, token, onCreated }) {
  const [form, setForm] = useState({
    survey_name: '',
    survey_type: '',
    questions: []
  });

  const handleCreate = async () => {
    if (!form.survey_name || !form.survey_type) {
      toast.error('Name and type are required');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/admin/templates/surveys`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Survey template created');
      onOpenChange(false);
      setForm({ survey_name: '', survey_type: '', questions: [] });
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create survey template');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-proxima">Create Survey Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-proxima">Survey Name *</Label>
            <Input value={form.survey_name} onChange={(e) => setForm({ ...form, survey_name: e.target.value })} placeholder="e.g. L2 Week 4 Survey" className="font-proxima" />
          </div>
          <div>
            <Label className="font-proxima">Survey Type (unique key) *</Label>
            <Input value={form.survey_type} onChange={(e) => setForm({ ...form, survey_type: e.target.value })} placeholder="e.g. l2_week4" className="font-proxima font-mono" />
          </div>
          <p className="text-xs text-slate-500 font-proxima">You can add questions after creating the template by editing it.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-proxima">Cancel</Button>
          <Button onClick={handleCreate} className="bg-[#4242EA] hover:bg-[#3535cc] font-proxima">Create Survey</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function TemplateManagement() {
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();
  const hasAccess = canAccessPage('template_management');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 font-proxima">Access Denied</h2>
          <p className="text-slate-600 font-proxima">You don't have permission to manage templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-proxima">Template Management</h1>
          <p className="text-slate-600 font-proxima">Manage assessment and survey templates</p>
        </div>

        <Tabs defaultValue="assessments" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="assessments" className="font-proxima">Assessments</TabsTrigger>
            <TabsTrigger value="surveys" className="font-proxima">Surveys</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <AssessmentTemplatesTab token={token} />
          </TabsContent>

          <TabsContent value="surveys">
            <SurveyTemplatesTab token={token} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TemplateManagement;
