import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Plus, Trash2, Sparkles, ChevronsUpDown, Check, Search, X } from 'lucide-react';
import { fetchSkillTags } from '../../utils/skillTagsApi';

/**
 * Editor for the v2 fields of a PERSONALIZED task, shared by the Create and Edit
 * task dialogs. Rendered only when task_mode === 'personalized'.
 *
 * Props:
 *   value:    { v2_learning_goal, v2_competency_criteria[], v2_lesson_content, v2_skill_tags[], v2_task_intent }
 *   onChange: (field, newValue) => void
 *   disabled: boolean
 *   token:    auth token (for the skill-tag picker fetch)
 *
 * Note: v2_is_personalized is intentionally NOT handled here — it's vestigial;
 * the engine routes purely off task_mode='personalized'.
 */
const PersonalizedTaskFields = ({ value = {}, onChange, disabled = false, token }) => {
  const criteria = Array.isArray(value.v2_competency_criteria) ? value.v2_competency_criteria : [];
  const skillTags = Array.isArray(value.v2_skill_tags) ? value.v2_skill_tags : [];

  // ---- skill-tag picker ----
  const [skillOptions, setSkillOptions] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [skillError, setSkillError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!token) return;
    fetchSkillTags(token)
      .then((tags) => { if (active) setSkillOptions(tags); })
      .catch(() => { if (active) setSkillError('Could not load skill list'); });
    return () => { active = false; };
  }, [token]);

  const optionBySlug = useMemo(() => {
    const m = {};
    skillOptions.forEach((o) => { m[o.slug] = o; });
    return m;
  }, [skillOptions]);

  const filteredOptions = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skillOptions;
    return skillOptions.filter(
      (o) => o.name.toLowerCase().includes(q) || o.slug.includes(q) || (o.category || '').toLowerCase().includes(q)
    );
  }, [skillOptions, skillSearch]);

  const toggleSkill = (slug) => {
    const next = skillTags.includes(slug)
      ? skillTags.filter((s) => s !== slug)
      : [...skillTags, slug];
    onChange('v2_skill_tags', next);
  };

  // ---- competency criteria rows ----
  const updateCriterion = (idx, key, val) => {
    const next = criteria.map((c, i) => (i === idx ? { ...c, [key]: val } : c));
    onChange('v2_competency_criteria', next);
  };
  const addCriterion = () => onChange('v2_competency_criteria', [...criteria, { criterion: '', description: '' }]);
  const removeCriterion = (idx) => onChange('v2_competency_criteria', criteria.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#4242EA]" />
        <h4 className="font-proxima-bold text-sm text-[#1E1E1E]">Personalized Settings</h4>
      </div>
      <p className="text-xs text-[#666] font-proxima -mt-2">
        Used by the V2 coach to teach and grade this task. The coach grades against the skills you tag below.
      </p>

      {/* Learning goal */}
      <div className="space-y-1">
        <Label className="text-xs font-proxima-bold">Learning Goal</Label>
        <Textarea
          value={value.v2_learning_goal || ''}
          onChange={(e) => onChange('v2_learning_goal', e.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="Single, measurable goal the learner should reach by the end of the task."
          className="font-proxima text-sm"
        />
      </div>

      {/* Skill tags */}
      <div className="space-y-1">
        <Label className="text-xs font-proxima-bold">Skill Tags</Label>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="w-full justify-between font-proxima h-9 text-sm font-normal"
            >
              <span className="text-[#666]">
                {skillTags.length ? `${skillTags.length} skill${skillTags.length === 1 ? '' : 's'} selected` : 'Select skills…'}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 text-[#999] shrink-0" />
              <Input
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills…"
                className="border-0 focus-visible:ring-0 h-9 text-sm"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {skillError && <p className="px-3 py-2 text-xs text-red-600">{skillError}</p>}
              {!skillError && filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-xs text-[#999]">No matching skills.</p>
              )}
              {filteredOptions.map((opt) => {
                const selected = skillTags.includes(opt.slug);
                return (
                  <button
                    type="button"
                    key={opt.slug}
                    onClick={() => toggleSkill(opt.slug)}
                    className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-[#F5F5F5]"
                  >
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${selected ? 'text-[#4242EA]' : 'text-transparent'}`} />
                    <span className="flex-1">
                      <span className="block text-sm text-[#1E1E1E] font-proxima">{opt.name}</span>
                      <span className="block text-[10px] text-[#999] font-mono">{opt.slug} · {opt.category}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
        {skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {skillTags.map((slug) => (
              <Badge key={slug} variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 gap-1">
                {optionBySlug[slug]?.name || slug}
                {!disabled && (
                  <button type="button" onClick={() => toggleSkill(slug)} className="hover:text-indigo-900">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Competency criteria */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-proxima-bold">Competency Criteria</Label>
          {!disabled && (
            <Button type="button" size="sm" onClick={addCriterion} className="h-7 bg-[#4242EA] hover:bg-[#3535D1]">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          )}
        </div>
        {criteria.length === 0 && <p className="text-xs text-[#999] font-proxima">No criteria yet.</p>}
        <div className="space-y-2">
          {criteria.map((c, idx) => (
            <div key={idx} className="rounded-md border border-[#E3E3E3] bg-white p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Input
                  value={c.criterion || ''}
                  onChange={(e) => updateCriterion(idx, 'criterion', e.target.value)}
                  disabled={disabled}
                  placeholder="Short competency name"
                  className="font-proxima text-sm flex-1"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriterion(idx)}
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Textarea
                value={c.description || ''}
                onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                disabled={disabled}
                rows={2}
                placeholder="What the learner must demonstrate to satisfy this criterion."
                className="font-proxima text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lesson content */}
      <div className="space-y-1">
        <Label className="text-xs font-proxima-bold">Lesson Content (Markdown)</Label>
        <Textarea
          value={value.v2_lesson_content || ''}
          onChange={(e) => onChange('v2_lesson_content', e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder={'## Lesson Title\n\nMarkdown lesson body the coach engine teaches from.'}
          className="font-mono text-sm"
        />
      </div>

      {/* Task intent */}
      <div className="space-y-1">
        <Label className="text-xs font-proxima-bold">Task Intent</Label>
        <Input
          value={value.v2_task_intent || ''}
          onChange={(e) => onChange('v2_task_intent', e.target.value)}
          disabled={disabled}
          placeholder="e.g., conversation"
          className="font-proxima text-sm"
        />
      </div>
    </div>
  );
};

export default PersonalizedTaskFields;
