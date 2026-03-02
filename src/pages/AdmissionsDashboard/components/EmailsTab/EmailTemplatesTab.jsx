import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import Swal from 'sweetalert2';

const CATEGORIES = ['All', 'Action', 'Automation', 'Reminder', 'Volunteer'];

const categoryColors = {
  Action: 'bg-blue-100 text-blue-700',
  Automation: 'bg-purple-100 text-purple-700',
  Reminder: 'bg-yellow-100 text-yellow-700',
  Volunteer: 'bg-green-100 text-green-700',
};

const EmailTemplatesTab = ({ token }) => {
  // Data state
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter / search
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Editor state
  const [selectedStage, setSelectedStage] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [originalSubject, setOriginalSubject] = useState('');
  const [originalBody, setOriginalBody] = useState('');
  const [saving, setSaving] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    if (token) fetchTemplates();
  }, [token]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/emails/templates`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered template list
  const filteredTemplates = useMemo(() => {
    let list = templates;
    if (categoryFilter !== 'All') {
      list = list.filter(t => t.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.display_name || '').toLowerCase().includes(q) ||
        (t.stage || '').toLowerCase().includes(q) ||
        (t.subject_template || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, categoryFilter, search]);

  // Currently selected template object
  const selectedTemplate = useMemo(
    () => templates.find(t => t.stage === selectedStage) || null,
    [templates, selectedStage]
  );

  const hasUnsavedChanges =
    editSubject !== originalSubject || editBody !== originalBody;

  // Select a template for editing
  const handleSelectTemplate = async (stage) => {
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Discard them?',
        showCancelButton: true,
        confirmButtonText: 'Discard',
        cancelButtonText: 'Keep Editing',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4242ea'
      });
      if (!result.isConfirmed) return;
    }

    const tpl = templates.find(t => t.stage === stage);
    if (tpl) {
      setSelectedStage(stage);
      setEditSubject(tpl.subject_template || '');
      setEditBody(tpl.body_template || '');
      setOriginalSubject(tpl.subject_template || '');
      setOriginalBody(tpl.body_template || '');
      setShowPreview(false);
      setPreviewHtml('');
    }
  };

  // Save template
  const handleSave = async () => {
    if (!selectedStage) return;
    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/emails/templates/${selectedStage}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject_template: editSubject,
            body_template: editBody
          })
        }
      );

      if (!response.ok) throw new Error('Failed to save template');

      const data = await response.json();

      Swal.fire({
        icon: 'success',
        title: 'Template Saved',
        text: `"${data.template.display_name}" has been updated.`,
        confirmButtonColor: '#4242ea',
        timer: 2000,
        showConfirmButton: false
      });

      // Update local state
      setOriginalSubject(editSubject);
      setOriginalBody(editBody);
      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save template',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel edits
  const handleCancel = () => {
    setEditSubject(originalSubject);
    setEditBody(originalBody);
  };

  // Preview template
  const handlePreview = async () => {
    if (!selectedStage) return;
    setPreviewLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/emails/templates/${selectedStage}/preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreviewHtml(data.html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Preview Failed',
        text: error.message || 'Failed to generate preview',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#1a1a1a] font-proxima-bold">
          Email Templates Management
        </h3>
        <Button
          variant="outline"
          onClick={fetchTemplates}
          disabled={loading}
          className="font-proxima"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel — Template List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm font-proxima transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#4242ea] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <Input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-proxima"
          />

          {/* Template list */}
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-400 font-proxima">
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-proxima">
                No templates found
              </div>
            ) : (
              filteredTemplates.map(tpl => (
                <button
                  key={tpl.stage}
                  onClick={() => handleSelectTemplate(tpl.stage)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStage === tpl.stage
                      ? 'border-[#4242ea] bg-[#4242ea]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-proxima-bold text-sm text-[#1a1a1a] truncate">
                      {tpl.display_name || tpl.stage}
                    </span>
                    {tpl.category && (
                      <Badge className={`text-xs ml-2 shrink-0 ${categoryColors[tpl.category] || 'bg-gray-100 text-gray-700'}`}>
                        {tpl.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-proxima truncate">
                    {tpl.subject_template}
                  </div>
                  {!tpl.is_active && (
                    <Badge className="mt-1 bg-red-100 text-red-600 text-xs">Inactive</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Editor */}
        <div className="lg:col-span-3">
          {!selectedTemplate ? (
            <Card className="bg-white border border-gray-200">
              <CardContent className="py-20 text-center">
                <div className="text-gray-400 font-proxima">
                  <div className="text-lg mb-2">Select a template to edit</div>
                  <div className="text-sm">Choose a template from the list on the left</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-proxima-bold">
                      {selectedTemplate.display_name}
                    </CardTitle>
                    <div className="text-xs text-gray-500 font-proxima mt-1">
                      Stage: <code className="bg-gray-100 px-1 py-0.5 rounded">{selectedTemplate.stage}</code>
                      {selectedTemplate.updated_by && (
                        <span className="ml-3">
                          Last updated by {selectedTemplate.updated_by} on {formatDate(selectedTemplate.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplate.category && (
                    <Badge className={`${categoryColors[selectedTemplate.category] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedTemplate.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Variables Reference */}
                {selectedTemplate.template_variables && Object.keys(selectedTemplate.template_variables).length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-proxima-bold text-blue-900 text-sm mb-2">Available Variables</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedTemplate.template_variables).map(([key, desc]) => (
                        <span
                          key={key}
                          title={desc}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-proxima cursor-help"
                        >
                          {`{{${key}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <Label className="font-proxima-bold mb-2 block">Subject</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="font-proxima"
                    disabled={saving}
                  />
                </div>

                {/* Body */}
                <div>
                  <Label className="font-proxima-bold mb-2 block">HTML Body</Label>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="font-proxima font-mono text-xs min-h-[300px]"
                    disabled={saving}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || saving}
                    className="font-proxima"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={!hasUnsavedChanges || saving}
                    className="font-proxima"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={previewLoading}
                    className="font-proxima ml-auto"
                  >
                    {previewLoading ? 'Generating...' : showPreview ? 'Refresh Preview' : 'Preview'}
                  </Button>
                </div>

                {/* Unsaved indicator */}
                {hasUnsavedChanges && (
                  <div className="text-xs text-yellow-600 font-proxima">
                    You have unsaved changes
                  </div>
                )}

                {/* Preview iframe */}
                {showPreview && previewHtml && (
                  <div className="mt-4">
                    <Label className="font-proxima-bold mb-2 block">Preview</Label>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <iframe
                        srcDoc={previewHtml}
                        title="Email Preview"
                        className="w-full border-0"
                        style={{ minHeight: '500px' }}
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesTab;
