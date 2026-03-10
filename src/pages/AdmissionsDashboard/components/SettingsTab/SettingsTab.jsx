import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useAuthStore from '../../../../stores/authStore';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AnimatedRadioGroup, AnimatedRadioItem } from '../../../../components/ui/animated-radio';
import { AnimatedCheckbox } from '../../../../components/ui/animated-checkbox';
import { Save, Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Pencil, X, Check, Eye, EyeOff, ChevronUp, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

// ===== Program Details Section =====
const ProgramDetailsSection = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/program-settings`);
      setSettings(await res.json());
    } catch (err) { console.error('Error fetching settings:', err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/program-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: 'success', title: 'Saved', text: 'Program details updated successfully.', timer: 1500, showConfirmButton: false });
        setSettings(data.settings);
      }
    } catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save settings.' }); }
    finally { setSaving(false); }
  };

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="p-4 text-gray-500 font-proxima">Loading program details...</div>;

  return (
    <Card className="border border-gray-200">
      <div
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          <h3 className="text-lg font-semibold text-[#1a1a1a] font-proxima-bold">Program Details</h3>
          <span className="text-sm text-gray-400 font-proxima">Public-facing program info</span>
        </div>
        {!collapsed && (
          <Button
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            disabled={saving}
            className="bg-[#4242ea] hover:bg-[#3535d1] text-white font-proxima"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
      {!collapsed && (
        <CardContent className="px-6 pb-6 pt-0">
          <p className="text-sm text-gray-500 mb-6 font-proxima">These values are displayed on the public Program Details page that applicants see.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Program Title</label>
              <Input value={settings.program_title || ''} onChange={(e) => updateSetting('program_title', e.target.value)} className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Start Date</label>
              <Input value={settings.program_start_date || ''} onChange={(e) => updateSetting('program_start_date', e.target.value)} placeholder="e.g. March 14, 2026" className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Weekday Schedule</label>
              <Input value={settings.schedule_weekday || ''} onChange={(e) => updateSetting('schedule_weekday', e.target.value)} placeholder="e.g. Mon - Wed: 6:30 - 10:00 PM" className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Weekend Schedule</label>
              <Input value={settings.schedule_weekend || ''} onChange={(e) => updateSetting('schedule_weekend', e.target.value)} placeholder="e.g. Sat - Sun: 10:00 AM - 4:00 PM" className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Street Address</label>
              <Input value={settings.location_address || ''} onChange={(e) => updateSetting('location_address', e.target.value)} className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">City, State, ZIP</label>
              <Input value={settings.location_city || ''} onChange={(e) => updateSetting('location_city', e.target.value)} className="font-proxima" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Current Cohort</label>
              <Input value={settings.current_cohort || ''} onChange={(e) => updateSetting('current_cohort', e.target.value)} placeholder="e.g. March 2026" className="font-proxima" />
              <p className="text-xs text-gray-400 mt-1 font-proxima">Default cohort assigned to new builders on signup</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Program Description</label>
              <textarea
                value={settings.program_description || ''}
                onChange={(e) => updateSetting('program_description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-proxima focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// ===== Question Row Component (Draggable) =====
const QuestionRow = ({ question, index, onUpdate, onEditOptions, token }) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ prompt: question.prompt, is_required: question.is_required });

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/program-settings/questions/${question.question_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.success) { onUpdate(data.question); setEditing(false); }
    } catch (err) { console.error('Error updating question:', err); }
  };

  const handleToggleActive = async () => {
    if (question.active) {
      const result = await Swal.fire({ title: 'Deactivate Question?', text: 'This will hide the question from the application form. Existing responses will be preserved.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#4242ea', confirmButtonText: 'Deactivate' });
      if (!result.isConfirmed) return;
    }
    try {
      const res = await fetch(`${API_URL}/api/program-settings/questions/${question.question_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ active: !question.active })
      });
      const data = await res.json();
      if (data.success) onUpdate(data.question);
    } catch (err) { console.error('Error toggling question:', err); }
  };

  const responseTypeLabels = { 'single_choice': 'Single Choice', 'multi_choice': 'Multi Choice', 'text': 'Text', 'textarea': 'Long Text', 'long_text': 'Long Text', 'number': 'Number', 'date': 'Date', 'email': 'Email', 'tel': 'Phone', 'bool': 'Yes/No', 'info': 'Info' };
  const hasOptions = ['single_choice', 'multi_choice', 'bool'].includes(question.response_type);
  const optionCount = question.options ? question.options.filter(o => o !== null).length : 0;

  return (
    <Draggable draggableId={String(question.question_id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border rounded-lg p-3 transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#4242ea]/30' : ''} ${!question.active ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
        >
          <div className="flex items-start gap-2">
            <div {...provided.dragHandleProps} className="flex items-center gap-1 pt-0.5 cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder">
              <GripVertical className="h-4 w-4 text-gray-300 hover:text-gray-500" />
              <span className="text-xs font-mono text-gray-400 w-5 text-right">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <textarea value={editData.prompt} onChange={(e) => setEditData(prev => ({ ...prev, prompt: e.target.value }))} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-proxima focus:outline-none focus:ring-2 focus:ring-[#4242ea]" />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-proxima">
                      <Checkbox checked={editData.is_required} onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_required: !!checked }))} />
                      Required
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} className="bg-[#4242ea] hover:bg-[#3535d1] text-white h-8 px-3"><Check className="h-3 w-3 mr-1" /> Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-8 px-3"><X className="h-3 w-3 mr-1" /> Cancel</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#1a1a1a] font-proxima">{question.prompt}</span>
                    {question.is_required && <span className="text-red-500 text-xs font-medium">*required</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-proxima">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{responseTypeLabels[question.response_type] || question.response_type}</span>
                    {question.parent_question_id && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">If "{question.show_when_parent_equals}" (parent: {question.parent_question_id})</span>}
                    {hasOptions && <span className="text-gray-400">{optionCount} option{optionCount !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
              )}
            </div>
            {!editing && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-8 w-8 p-0" title="Edit question"><Pencil className="h-3.5 w-3.5 text-gray-500" /></Button>
                {hasOptions && <Button size="sm" variant="ghost" onClick={() => onEditOptions(question)} className="h-8 w-8 p-0" title="Edit options"><ChevronDown className="h-3.5 w-3.5 text-gray-500" /></Button>}
                <Button size="sm" variant="ghost" onClick={handleToggleActive} className="h-8 w-8 p-0" title={question.active ? 'Deactivate' : 'Activate'}>
                  {question.active ? <EyeOff className="h-3.5 w-3.5 text-gray-500" /> : <Eye className="h-3.5 w-3.5 text-green-500" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// ===== Options Editor Modal =====
const OptionsEditor = ({ question, token, onClose, onSaved }) => {
  const [options, setOptions] = useState(
    (question.options || []).filter(o => o !== null).sort((a, b) => a.display_order - b.display_order).map(o => ({ label: o.label, value: o.value, display_order: o.display_order }))
  );
  const [saving, setSaving] = useState(false);

  const addOption = () => setOptions(prev => [...prev, { label: '', value: '', display_order: prev.length + 1 }]);
  const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx).map((o, i) => ({ ...o, display_order: i + 1 })));
  const updateOption = (idx, field, value) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value, ...(field === 'label' ? { value } : {}) } : o));
  const handleOptionDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(options);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setOptions(reordered.map((o, i) => ({ ...o, display_order: i + 1 })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/program-settings/questions/${question.question_id}/options`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ options })
      });
      const data = await res.json();
      if (data.success) { onSaved(); onClose(); Swal.fire({ icon: 'success', title: 'Options Updated', timer: 1200, showConfirmButton: false }); }
    } catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save options.' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-[#1a1a1a] font-proxima-bold">Edit Options</h3>
            <p className="text-xs text-gray-500 font-proxima mt-1 truncate max-w-[350px]">{question.prompt}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <DragDropContext onDragEnd={handleOptionDragEnd}>
            <Droppable droppableId="options-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {options.map((opt, idx) => (
                    <Draggable key={`opt-${idx}`} draggableId={`opt-${idx}`} index={idx}>
                      {(dragProvided, snapshot) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} className={`flex items-center gap-2 ${snapshot.isDragging ? 'bg-gray-50 rounded shadow-md' : ''}`}>
                          <div {...dragProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1"><GripVertical className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" /></div>
                          <span className="text-xs font-mono text-gray-400 w-4 text-right shrink-0">{idx + 1}</span>
                          <Input value={opt.label} onChange={(e) => updateOption(idx, 'label', e.target.value)} placeholder="Option label" className="flex-1 h-9 text-sm font-proxima" />
                          <Button size="sm" variant="ghost" onClick={() => removeOption(idx)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button size="sm" variant="outline" onClick={addOption} className="w-full mt-3 font-proxima"><Plus className="h-3.5 w-3.5 mr-1" /> Add Option</Button>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="font-proxima">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#4242ea] hover:bg-[#3535d1] text-white font-proxima">{saving ? 'Saving...' : 'Save Options'}</Button>
        </div>
      </div>
    </div>
  );
};

// ===== Add Question Form =====
const AddQuestionForm = ({ sections, token, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ section_id: '', prompt: '', response_type: 'text', is_required: false });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!formData.section_id || !formData.prompt) {
      Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please select a section and enter a question prompt.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/program-settings/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, section_id: parseInt(formData.section_id) })
      });
      const data = await res.json();
      if (data.success) { onCreated(); setFormData({ section_id: '', prompt: '', response_type: 'text', is_required: false }); setOpen(false); Swal.fire({ icon: 'success', title: 'Question Created', timer: 1200, showConfirmButton: false }); }
    } catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create question.' }); }
    finally { setSaving(false); }
  };

  if (!open) return <Button onClick={() => setOpen(true)} className="bg-[#4242ea] hover:bg-[#3535d1] text-white font-proxima"><Plus className="h-4 w-4 mr-2" /> Add Question</Button>;

  return (
    <Card className="border-2 border-[#4242ea] border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-[#1a1a1a] font-proxima-bold">New Question</h4>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Section</label>
            <Select value={formData.section_id} onValueChange={(val) => setFormData(prev => ({ ...prev, section_id: val }))}>
              <SelectTrigger className="font-proxima"><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>{sections.map(s => <SelectItem key={s.section_id} value={String(s.section_id)} className="font-proxima">{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Response Type</label>
            <Select value={formData.response_type} onValueChange={(val) => setFormData(prev => ({ ...prev, response_type: val }))}>
              <SelectTrigger className="font-proxima"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['text', 'textarea', 'single_choice', 'multi_choice', 'number', 'date', 'email', 'tel', 'bool'].map(t => (
                  <SelectItem key={t} value={t} className="font-proxima">{({ text: 'Text', textarea: 'Long Text', single_choice: 'Single Choice', multi_choice: 'Multi Choice', number: 'Number', date: 'Date', email: 'Email', tel: 'Phone', bool: 'Yes/No' })[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-proxima">Question Prompt</label>
          <textarea value={formData.prompt} onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-proxima focus:outline-none focus:ring-2 focus:ring-[#4242ea]" placeholder="Enter the question text..." />
        </div>
        <label className="flex items-center gap-2 text-sm font-proxima">
          <Checkbox checked={formData.is_required} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: !!checked }))} />
          Required
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="font-proxima">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving} className="bg-[#4242ea] hover:bg-[#3535d1] text-white font-proxima">{saving ? 'Creating...' : 'Create Question'}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== Application Questions Section =====
const ApplicationQuestionsSection = ({ token }) => {
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOptions, setEditingOptions] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filterSection, setFilterSection] = useState('all');
  const [savingOrder, setSavingOrder] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const expandAllSections = () => {
    const all = {};
    orderedSections.forEach(name => { all[name] = true; });
    setExpandedSections(all);
  };

  const collapseAllSections = () => setExpandedSections({});

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/program-settings/questions`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setQuestions(data.questions || []);
      setSections(data.sections || []);
    } catch (err) { console.error('Error fetching questions:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleUpdateQuestion = (updatedQuestion) => {
    setQuestions(prev => prev.map(q => q.question_id === updatedQuestion.question_id ? { ...q, ...updatedQuestion } : q));
  };

  const filteredQuestions = questions.filter(q => {
    if (!showInactive && !q.active) return false;
    if (filterSection !== 'all' && String(q.section_id) !== filterSection) return false;
    return true;
  });

  const sectionOrder = sections.map(s => s.name);
  const groupedQuestions = {};
  filteredQuestions.forEach(q => {
    const sectionName = q.section_name || 'Unknown';
    if (!groupedQuestions[sectionName]) groupedQuestions[sectionName] = [];
    groupedQuestions[sectionName].push(q);
  });
  const orderedSections = sectionOrder.filter(name => groupedQuestions[name]);

  const handleDragEnd = useCallback(async (result) => {
    const { source, destination } = result;
    if (!destination || source.droppableId !== destination.droppableId || source.index === destination.index) return;

    const sectionName = source.droppableId;
    const sectionQuestions = [...groupedQuestions[sectionName]];
    const [moved] = sectionQuestions.splice(source.index, 1);
    sectionQuestions.splice(destination.index, 0, moved);

    const questionOrders = sectionQuestions.map((q, idx) => ({ question_id: q.question_id, display_order: idx + 1 }));

    setQuestions(prev => {
      const updated = [...prev];
      questionOrders.forEach(({ question_id, display_order }) => {
        const q = updated.find(x => x.question_id === question_id);
        if (q) q.display_order = display_order;
      });
      return updated.sort((a, b) => a.section_id !== b.section_id ? a.section_id - b.section_id : a.display_order - b.display_order);
    });

    setSavingOrder(true);
    try {
      await fetch(`${API_URL}/api/program-settings/questions/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questionOrders })
      });
    } catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save new order.' }); fetchQuestions(); }
    finally { setSavingOrder(false); }
  }, [groupedQuestions, token]);

  if (loading) return <div className="p-4 text-gray-500 font-proxima">Loading application questions...</div>;

  return (
    <Card className="border border-gray-200">
      <div
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          <h3 className="text-lg font-semibold text-[#1a1a1a] font-proxima-bold">Application Questions</h3>
          <span className="text-sm text-gray-400 font-proxima">{questions.filter(q => q.active).length} active across {sections.length} sections</span>
        </div>
        {savingOrder && <span className="text-sm text-[#4242ea] font-proxima">Saving order...</span>}
      </div>
      {!collapsed && (
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-proxima text-gray-600">
                <Checkbox checked={showInactive} onCheckedChange={(checked) => setShowInactive(!!checked)} />
                Show inactive
              </label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-[180px] font-proxima"><SelectValue placeholder="All sections" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-proxima">All Sections</SelectItem>
                  {sections.map(s => <SelectItem key={s.section_id} value={String(s.section_id)} className="font-proxima">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <AddQuestionForm sections={sections} token={token} onCreated={fetchQuestions} />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={expandAllSections} className="text-xs font-proxima text-gray-500 hover:text-[#4242ea]">Expand All</Button>
              <Button size="sm" variant="ghost" onClick={collapseAllSections} className="text-xs font-proxima text-gray-500 hover:text-[#4242ea]">Collapse All</Button>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-proxima mb-4 flex items-center gap-1">
            <GripVertical className="h-3 w-3" /> Drag questions to reorder them within a section. Changes save automatically.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-3">
              {orderedSections.map((sectionName, sIdx) => {
                const isExpanded = !!expandedSections[sectionName];
                const sectionQs = groupedQuestions[sectionName];
                const activeCount = sectionQs.filter(q => q.active).length;
                return (
                  <div key={sectionName} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSection(sectionName)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm font-semibold text-[#4242ea] uppercase tracking-wide font-proxima-bold">{sIdx + 1}. {sectionName}</span>
                        <span className="text-xs text-gray-400 font-proxima">{activeCount} active / {sectionQs.length} total</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                        <Droppable droppableId={sectionName}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-[#4242ea]/5 p-2 -m-2' : ''}`}>
                              {sectionQs.map((q, idx) => (
                                <QuestionRow key={q.question_id} question={q} index={idx} onUpdate={handleUpdateQuestion} onEditOptions={setEditingOptions} token={token} />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DragDropContext>

          {editingOptions && <OptionsEditor question={editingOptions} token={token} onClose={() => setEditingOptions(null)} onSaved={fetchQuestions} />}
        </CardContent>
      )}
    </Card>
  );
};

// ===== Application Preview =====
// Renders the application form exactly as applicants see it, using the same components.
const ApplicationPreview = ({ token }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(-1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchPreviewQuestions = async () => {
    setLoading(true);
    try {
      // Use the same public endpoint that the real ApplicationForm uses
      const res = await fetch(`${API_URL}/api/applications/questions`);
      const data = await res.json();
      setPreviewQuestions(data);
      setCurrentSection(-1);
      setCurrentQuestionIndex(0);
      setFormData({});
    } catch (err) { console.error('Error fetching preview questions:', err); }
    finally { setLoading(false); }
  };

  const handleToggle = () => {
    if (collapsed && previewQuestions.length === 0) fetchPreviewQuestions();
    setCollapsed(!collapsed);
  };

  const handleRefresh = (e) => {
    e.stopPropagation();
    fetchPreviewQuestions();
  };

  // --- Navigation helpers (mirror ApplicationForm logic) ---
  const shouldShowQuestion = (question) => {
    if (!question.parentQuestionId) return true;
    const parentValue = formData[question.parentQuestionId];
    if (!parentValue) return false;
    switch (question.conditionType) {
      case 'show_when_equals':
      case 'equals':
        return parentValue === question.showWhenParentEquals;
      case 'not_equals':
        return parentValue !== question.showWhenParentEquals;
      case 'contains':
        return Array.isArray(parentValue) ? parentValue.includes(question.showWhenParentEquals) : parentValue.toString().includes(question.showWhenParentEquals);
      default:
        return parentValue === question.showWhenParentEquals;
    }
  };

  const getAllRootQuestions = () => {
    const all = [];
    previewQuestions.forEach((section, sectionIndex) => {
      if (section.questions) {
        section.questions.filter(q => !q.parentQuestionId).filter(shouldShowQuestion).forEach(question => {
          all.push({ ...question, sectionIndex, sectionTitle: section.title });
        });
      }
    });
    return all;
  };

  const getConditionalQuestionsForParent = (parentId, sectionQuestions) => {
    if (!sectionQuestions) return [];
    return sectionQuestions.filter(q => q.parentQuestionId === parentId && shouldShowQuestion(q));
  };

  const getCurrentQuestionGlobalIndex = () => {
    if (previewQuestions.length === 0) return 0;
    let globalIndex = 0;
    for (let si = 0; si < currentSection; si++) {
      if (previewQuestions[si]?.questions) {
        globalIndex += previewQuestions[si].questions.filter(q => !q.parentQuestionId).filter(shouldShowQuestion).length;
      }
    }
    if (previewQuestions[currentSection]?.questions) {
      const sectionQs = previewQuestions[currentSection].questions;
      const currentQ = sectionQs[currentQuestionIndex];
      if (currentQ && !currentQ.parentQuestionId) {
        const visibleRoot = sectionQs.filter(q => !q.parentQuestionId).filter(shouldShowQuestion);
        const idx = visibleRoot.findIndex(q => q.id === currentQ.id);
        if (idx !== -1) globalIndex += idx;
      }
    }
    return globalIndex;
  };

  const getLocalIndicesFromGlobal = (globalIndex) => {
    let current = 0;
    for (let si = 0; si < previewQuestions.length; si++) {
      if (previewQuestions[si]?.questions) {
        const visibleRoot = previewQuestions[si].questions.filter(q => !q.parentQuestionId).filter(shouldShowQuestion);
        if (current + visibleRoot.length > globalIndex) {
          const qi = globalIndex - current;
          const target = visibleRoot[qi];
          const actualIdx = previewQuestions[si].questions.findIndex(q => q.id === target.id);
          return { sectionIndex: si, questionIndex: actualIdx };
        }
        current += visibleRoot.length;
      }
    }
    return { sectionIndex: previewQuestions.length - 1, questionIndex: 0 };
  };

  const getCurrentQuestions = () => {
    const allRoot = getAllRootQuestions();
    if (allRoot.length === 0) return { rootQuestion: null, conditionalQuestions: [] };
    const gi = getCurrentQuestionGlobalIndex();
    if (gi >= 0 && gi < allRoot.length) {
      const root = allRoot[gi];
      const section = previewQuestions[root.sectionIndex];
      return { rootQuestion: root, conditionalQuestions: getConditionalQuestionsForParent(root.id, section.questions) };
    }
    return { rootQuestion: null, conditionalQuestions: [] };
  };

  const handleInputChange = (questionId, value) => {
    let updated = { ...formData, [questionId]: value };
    // Clear conditional children
    const section = previewQuestions.find(s => s.questions?.find(q => q.id === questionId));
    if (section) {
      section.questions.filter(q => q.parentQuestionId === questionId).forEach(child => { updated[child.id] = ''; });
    }
    setFormData(updated);
  };

  const handleNext = () => {
    const allQ = getAllRootQuestions();
    const gi = getCurrentQuestionGlobalIndex();
    if (gi < allQ.length - 1) {
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(gi + 1);
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const handlePrevious = () => {
    const gi = getCurrentQuestionGlobalIndex();
    if (gi > 0) {
      const { sectionIndex, questionIndex } = getLocalIndicesFromGlobal(gi - 1);
      setCurrentSection(sectionIndex);
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const navigateToSection = (targetSection) => {
    if (targetSection === -1) { setCurrentSection(-1); setCurrentQuestionIndex(0); return; }
    const section = previewQuestions[targetSection];
    if (section?.questions) {
      const firstRoot = section.questions.filter(q => !q.parentQuestionId).filter(shouldShowQuestion)[0];
      if (firstRoot) {
        const idx = section.questions.findIndex(q => q.id === firstRoot.id);
        setCurrentSection(targetSection);
        setCurrentQuestionIndex(idx);
      }
    }
  };

  const getCompletedQuestionsInSection = (sectionQuestions) => {
    return sectionQuestions.filter(q => !q.parentQuestionId).filter(shouldShowQuestion).filter(q => {
      const v = formData[q.id];
      return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    }).length;
  };

  const progress = (() => {
    const allQ = getAllRootQuestions();
    if (allQ.length === 0) return 0;
    const answered = Object.keys(formData).filter(k => { const v = formData[k]; return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0); }).length;
    return Math.round((answered / allQ.length) * 100);
  })();

  // --- Render question (matches ApplicationForm exactly) ---
  const renderQuestion = (question) => {
    const questionTypes = { 'single_choice': 'radio', 'multi_choice': 'checkbox', 'bool': 'radio', 'text': 'text', 'textarea': 'textarea', 'long_text': 'textarea', 'number': 'number', 'date': 'date', 'email': 'email', 'tel': 'tel', 'info': 'info' };
    const type = question.type || questionTypes[question.response_type] || 'text';

    switch (type) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={formData[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              rows={12}
              className="resize-none text-[#1E1E1E] bg-white border-[#C8C8C8]"
              placeholder={question.placeholder || "Please provide your response..."}
              maxLength={2000}
            />
            <div className="text-sm text-[#666] text-right">{(formData[question.id] || '').length} / 2000 characters</div>
          </div>
        );

      case 'radio':
        if (question.options && question.options.length > 6) {
          return (
            <select
              value={formData[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] border-[#C8C8C8]"
            >
              <option value="">Please select...</option>
              {question.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          );
        }
        return (
          <AnimatedRadioGroup value={formData[question.id] || ''} onValueChange={(value) => handleInputChange(question.id, value)} className="space-y-3">
            {question.options?.map(opt => <AnimatedRadioItem key={opt} value={opt}>{opt}</AnimatedRadioItem>)}
          </AnimatedRadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map(opt => (
              <AnimatedCheckbox
                key={opt}
                checked={formData[question.id]?.includes(opt) || false}
                onCheckedChange={(checked) => {
                  const current = formData[question.id] || [];
                  handleInputChange(question.id, checked ? [...current, opt] : current.filter(i => i !== opt));
                }}
              >
                {opt}
              </AnimatedCheckbox>
            ))}
          </div>
        );

      case 'date':
        return <Input type="date" value={formData[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} className="text-[#1E1E1E] bg-white border-[#C8C8C8]" />;

      case 'email':
        return <Input type="email" value={formData[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} placeholder="your@email.com" className="text-[#1E1E1E] bg-white border-[#C8C8C8]" />;

      case 'tel':
        return <Input type="tel" value={formData[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} placeholder="(555) 123-4567" className="text-[#1E1E1E] bg-white border-[#C8C8C8]" />;

      case 'number':
        return <Input type="number" value={formData[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} placeholder="Enter a number" className="text-[#1E1E1E] bg-white border-[#C8C8C8]" />;

      case 'info':
        return (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 space-y-4">
              {question.label.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const isHeader = trimmed.endsWith(':') || (trimmed.length < 50 && !trimmed.endsWith('.') && !trimmed.endsWith('?') && !trimmed.endsWith('!'));
                const isListItem = /^(\d+[\.):]\s|-|•|\*)\s/.test(trimmed);
                if (isHeader && !isListItem) return <h4 key={i} className="text-lg font-bold text-[#1E1E1E] mt-2">{trimmed}</h4>;
                if (isListItem) return <p key={i} className="text-[#1E1E1E] leading-relaxed pl-4">{trimmed}</p>;
                return <p key={i} className="text-[#1E1E1E] leading-relaxed">{trimmed}</p>;
              })}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder || "Enter your response"}
            className="text-[#1E1E1E] bg-white border-[#C8C8C8]"
          />
        );
    }
  };

  const renderQuestionLabel = (question) => {
    if (question.link?.replaceInLabel) {
      const parts = question.label.split(question.link.text);
      return <>{parts[0]}<a href={question.link.url} target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:text-[#3535D1] underline">{question.link.text}</a>{parts[1]}</>;
    }
    return <>{question.label}{question.link && <a href={question.link.url} target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:text-[#3535D1] underline ml-1">{question.link.text}</a>}</>;
  };

  // Recursive renderer for conditional children
  const renderQuestionWithConditionals = (question, sectionQuestions, level = 1) => {
    const nested = getConditionalQuestionsForParent(question.id, sectionQuestions);
    return (
      <React.Fragment key={question.id}>
        {question.type === 'info' ? (
          <div>{renderQuestion(question)}</div>
        ) : (
          <div className="space-y-3 border-l-4 border-blue-200" style={{ paddingLeft: `${level * 1.5}rem` }}>
            <label className="block text-lg font-semibold text-[#1E1E1E]">
              {renderQuestionLabel(question)}
              {question.required ? <span className="text-red-600 ml-1">*</span> : <span className="text-[#666] text-sm font-normal ml-2">(optional)</span>}
            </label>
            {renderQuestion(question)}
          </div>
        )}
        {nested.length > 0 && (
          <div className="space-y-3">
            {nested.map(nq => renderQuestionWithConditionals(nq, sectionQuestions, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const currentQuestionGroup = getCurrentQuestions();
  const allRootQuestions = getAllRootQuestions();
  const currentGI = getCurrentQuestionGlobalIndex();
  const currentSectionData = previewQuestions[currentSection];

  const getCurrentQuestionInfo = () => {
    if (!currentQuestionGroup.rootQuestion) return { sectionName: '', questionNumber: 1, totalInSection: 1 };
    const root = currentQuestionGroup.rootQuestion;
    const sectionQs = previewQuestions[root.sectionIndex]?.questions || [];
    const visibleRoot = sectionQs.filter(q => !q.parentQuestionId).filter(shouldShowQuestion);
    return { sectionName: root.sectionTitle || '', questionNumber: visibleRoot.findIndex(q => q.id === root.id) + 1, totalInSection: visibleRoot.length };
  };

  return (
    <Card className="border border-gray-200">
      <div
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          <h3 className="text-lg font-semibold text-[#1a1a1a] font-proxima-bold">Application Preview</h3>
          <span className="text-sm text-gray-400 font-proxima">See the form exactly as applicants do</span>
        </div>
        {!collapsed && (
          <Button size="sm" variant="outline" onClick={handleRefresh} className="font-proxima">
            Refresh Preview
          </Button>
        )}
      </div>
      {!collapsed && (
        <CardContent className="px-6 pb-6 pt-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-proxima">Loading preview...</div>
          ) : previewQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-proxima">No questions found. Click "Refresh Preview" to load.</div>
          ) : (
            /* Render inside an iframe-like container styled like the real app */
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-[#EFEFEF]">
              {/* Fake top bar */}
              <div className="bg-white border-b border-[#C8C8C8] px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                  <span className="text-base font-semibold text-[#1E1E1E]">Welcome, Preview User</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-4 py-2 text-sm text-[#666] font-semibold">Apply</span>
                  <span className="px-4 py-2 text-sm text-[#4242EA] font-semibold">Details</span>
                  <span className="px-3 py-1.5 text-sm border border-[#4242EA] text-[#4242EA] rounded-md">Log Out</span>
                </div>
              </div>

              {/* Section navigation pills */}
              <div className="px-4 pt-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors text-sm ${currentSection === -1 ? 'bg-[#4242EA] text-white' : 'bg-white text-[#666] hover:bg-gray-50 border border-[#C8C8C8]'}`}
                    onClick={() => navigateToSection(-1)}
                  >
                    0. INTRODUCTION
                  </button>
                  {previewQuestions.map((section, index) => {
                    const sectionQs = section.questions || [];
                    const visibleRoot = sectionQs.filter(q => !q.parentQuestionId).filter(shouldShowQuestion);
                    const completed = getCompletedQuestionsInSection(sectionQs);
                    return (
                      <button
                        key={section.id}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors text-sm ${index === currentSection ? 'bg-[#4242EA] text-white' : 'bg-white text-[#666] hover:bg-gray-50 border border-[#C8C8C8]'}`}
                        onClick={() => navigateToSection(index)}
                      >
                        <div>{index + 1}. {section.title}</div>
                        <div className="text-xs mt-0.5 opacity-80">{completed} / {visibleRoot.length}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main content area */}
              <div className="px-4 pb-6 pt-4 max-w-[1200px] mx-auto">
                {currentSection === -1 ? (
                  /* Intro card matching ApplicationForm */
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-[#1E1E1E]">Welcome to the Pursuit Application!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg leading-relaxed text-[#1E1E1E]">
                        We're excited you're here. Applications for our next cohort launching on <strong>March 14th</strong> close <strong>February 15th</strong>, so now's the time to share your story.
                      </p>
                      <div>
                        <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">When filling out your application, keep these things in mind:</h3>
                        <ul className="space-y-3">
                          {['Take your time. Go beyond one-word answers—help us get to know you by sharing your whole story.',
                            'Be honest. No tech experience? That\'s okay! We care more about your drive and why you\'re excited to learn.',
                            'Show curiosity. Tell us how you think, how you ask questions, and how you approach new challenges.'
                          ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-[#4242EA] text-white flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="h-4 w-4" /></div>
                              <div><strong>{tip.split('.')[0]}.</strong>{tip.split('.').slice(1).join('.')}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-lg text-[#1E1E1E]">This is your chance to help us understand not just where you've been, but where you want to go.</p>
                      <div className="pt-4">
                        <Button onClick={() => navigateToSection(0)} className="w-full bg-[#4242EA] hover:bg-[#3535D1] text-white py-6 text-lg">
                          Begin Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Question view */
                  <>
                    <Card className="shadow-lg mb-6">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl font-bold text-[#1E1E1E]">{getCurrentQuestionInfo().sectionName}</CardTitle>
                            <Badge variant="secondary" className="mt-2">
                              Question {getCurrentQuestionInfo().questionNumber} of {getCurrentQuestionInfo().totalInSection}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[#666] mb-2">Overall Progress</div>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-32" />
                              <span className="text-sm font-semibold text-[#1E1E1E]">{progress}%</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {currentQuestionGroup.rootQuestion ? (
                          <>
                            {currentQuestionGroup.rootQuestion.type === 'info' ? (
                              <div>{renderQuestion(currentQuestionGroup.rootQuestion)}</div>
                            ) : (
                              <div className="space-y-3">
                                <label className="block text-lg font-semibold text-[#1E1E1E]">
                                  {renderQuestionLabel(currentQuestionGroup.rootQuestion)}
                                  {currentQuestionGroup.rootQuestion.required ? <span className="text-red-600 ml-1">*</span> : <span className="text-[#666] text-sm font-normal ml-2">(optional)</span>}
                                </label>
                                {renderQuestion(currentQuestionGroup.rootQuestion)}
                              </div>
                            )}
                            {currentQuestionGroup.conditionalQuestions.map(cq =>
                              renderQuestionWithConditionals(cq, previewQuestions[currentQuestionGroup.rootQuestion.sectionIndex].questions)
                            )}
                          </>
                        ) : (
                          <div className="text-gray-500">Loading...</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between items-center gap-4">
                      {currentGI > 0 && (
                        <Button type="button" onClick={handlePrevious} variant="outline" className="border-[#C8C8C8]">
                          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                      )}
                      <div className="flex-1" />
                      {currentGI >= allRootQuestions.length - 1 ? (
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-8" onClick={() => Swal.fire({ icon: 'info', title: 'Preview Only', text: 'This is a preview. In the real form this would submit the application.', confirmButtonColor: '#4242ea' })}>
                          Submit Application
                        </Button>
                      ) : (
                        <Button type="button" onClick={handleNext} className="bg-[#4242EA] hover:bg-[#3535D1] text-white px-8">
                          Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// ===== Main Settings Tab =====
const SettingsTab = () => {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="space-y-4 p-6 overflow-y-auto h-full">
      <ProgramDetailsSection token={token} />
      <ApplicationQuestionsSection token={token} />
      <ApplicationPreview token={token} />
    </div>
  );
};

export default SettingsTab;
