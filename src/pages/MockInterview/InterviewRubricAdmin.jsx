import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

function InterviewRubricAdmin() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // rubric being edited
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRubrics();
  }, []);

  const loadRubrics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/interview-rubrics`, { headers: getHeaders(token) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load rubrics: ${res.status}`);
      }
      const data = await res.json();
      setRubrics(data.rubrics || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (rubric) => {
    setEditing({
      ...rubric,
      criteria: rubric.criteria || [],
      scoring_guide: rubric.scoring_guide || { ranges: [] },
    });
  };

  const startNew = () => {
    setEditing({
      id: null,
      interview_type: 'all',
      name: '',
      description: '',
      criteria: [
        { name: 'overall_score', description: 'Overall interview performance', weight: 1, max_score: 10 },
      ],
      scoring_guide: {
        ranges: [
          { min: 1, max: 3, label: 'Needs Work', description: 'Significant gaps' },
          { min: 4, max: 5, label: 'Below Average', description: 'Inconsistent' },
          { min: 6, max: 7, label: 'Solid', description: 'Ready with minor improvements' },
          { min: 8, max: 9, label: 'Strong', description: 'Polished and confident' },
          { min: 10, max: 10, label: 'Exceptional', description: 'Hire-ready' },
        ],
      },
      system_prompt: '',
      is_active: true,
    });
  };

  const saveRubric = async () => {
    if (!editing.name || !editing.system_prompt) {
      setError('Name and system prompt are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editing.id ? 'PUT' : 'POST';
      const url = editing.id
        ? `${API_URL}/api/admin/interview-rubrics/${editing.id}`
        : `${API_URL}/api/admin/interview-rubrics`;

      const res = await fetch(url, {
        method,
        headers: getHeaders(token),
        body: JSON.stringify(editing),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setEditing(null);
      await loadRubrics();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rubric) => {
    try {
      if (rubric.is_active) {
        await fetch(`${API_URL}/api/admin/interview-rubrics/${rubric.id}`, {
          method: 'DELETE',
          headers: getHeaders(token),
        });
      } else {
        await fetch(`${API_URL}/api/admin/interview-rubrics/${rubric.id}`, {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify({ is_active: true }),
        });
      }
      await loadRubrics();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateCriteria = (index, field, value) => {
    const updated = [...editing.criteria];
    updated[index] = { ...updated[index], [field]: value };
    setEditing({ ...editing, criteria: updated });
  };

  const addCriteria = () => {
    setEditing({
      ...editing,
      criteria: [...editing.criteria, { name: '', description: '', weight: 1, max_score: 10 }],
    });
  };

  const removeCriteria = (index) => {
    setEditing({
      ...editing,
      criteria: editing.criteria.filter((_, i) => i !== index),
    });
  };

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-[#666]">Admin access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#4242EA]" />
      </div>
    );
  }

  // ---- Editing view ----
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            {editing.id ? 'Edit Rubric' : 'New Rubric'}
          </h1>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Default Behavioral Rubric"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="What this rubric evaluates"
                />
              </div>
              <div>
                <Label>Interview Type</Label>
                <div className="flex gap-2 mt-1">
                  {['all', 'behavioral', 'technical'].map((t) => (
                    <Badge
                      key={t}
                      variant={editing.interview_type === t ? 'default' : 'outline'}
                      className={`cursor-pointer py-1 px-3 ${
                        editing.interview_type === t ? 'bg-[#4242EA]' : ''
                      }`}
                      onClick={() => setEditing({ ...editing, interview_type: t })}
                    >
                      {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scoring Criteria</CardTitle>
              <CardDescription>Define what the AI evaluates. Each criterion gets a score.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editing.criteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-[#f9f9f9] rounded-lg">
                    <GripVertical className="w-4 h-4 text-[#ccc] mt-2 shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={c.name}
                        onChange={(e) => updateCriteria(i, 'name', e.target.value)}
                        placeholder="e.g. communication_score"
                        className="text-sm"
                      />
                      <Input
                        value={c.description}
                        onChange={(e) => updateCriteria(i, 'description', e.target.value)}
                        placeholder="Description"
                        className="text-sm"
                      />
                    </div>
                    <Input
                      type="number"
                      value={c.max_score}
                      onChange={(e) => updateCriteria(i, 'max_score', parseInt(e.target.value) || 10)}
                      className="w-16 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriteria(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addCriteria} className="mt-3">
                <Plus className="w-4 h-4 mr-1" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Prompt</CardTitle>
              <CardDescription>The full prompt sent to the grading AI (Claude Sonnet 4.6). Must instruct the AI to return valid JSON.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={editing.system_prompt}
                onChange={(e) => setEditing({ ...editing, system_prompt: e.target.value })}
                className="w-full h-64 p-3 border rounded-lg font-mono text-sm resize-y"
                placeholder="You are an expert interview coach..."
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="bg-[#4242EA] hover:bg-[#3535c0] text-white"
              onClick={saveRubric}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {saving ? 'Saving...' : 'Save Rubric'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Interview Rubrics</h1>
        <Button className="bg-[#4242EA] hover:bg-[#3535c0] text-white" onClick={startNew}>
          <Plus className="w-4 h-4 mr-1" />
          New Rubric
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {rubrics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#666]">No rubrics yet. Create one to start grading interviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rubrics.map((r) => (
            <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startEditing(r)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {r.interview_type === 'all' ? 'All Types' : r.interview_type}
                    </Badge>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{r.name}</p>
                      {r.description && <p className="text-xs text-[#999]">{r.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#999]">{(r.criteria || []).length} criteria</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleActive(r); }}
                    >
                      {r.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewRubricAdmin;
