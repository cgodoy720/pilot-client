import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

/**
 * SkillEditDialog — purpose-built editor for one skill in the taxonomy.
 *
 * Editable here: name, definition, category, three proficiency descriptors,
 * interviewFocus.type, interviewFocus.area. Other fields (`slug`, `id`,
 * `learnedIn`, `related`) are NOT exposed in this UI — they are preserved
 * verbatim on save. Slug changes would require ref-checking related arrays
 * across all 33 skills; out of scope for this iteration.
 *
 * onSubmit receives the FULL updated skill object (everything merged), so
 * the parent just slots it into `taxonomy.skills[slug]` and PUTs the whole
 * taxonomy.
 */
export default function SkillEditDialog({ open, onClose, onSubmit, skill, categories, isSubmitting = false }) {
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');
  const [category, setCategory] = useState('');
  const [awareness, setAwareness] = useState('');
  const [application, setApplication] = useState('');
  const [adaptation, setAdaptation] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewArea, setInterviewArea] = useState('general');
  const [error, setError] = useState(null);

  // Populate fields when dialog opens with a different skill.
  useEffect(() => {
    if (!open || !skill) return;
    setName(skill.name || '');
    setDefinition(skill.definition || '');
    setCategory(skill.category || '');
    setAwareness(skill.proficiency?.awareness || '');
    setApplication(skill.proficiency?.application || '');
    setAdaptation(skill.proficiency?.adaptation || '');
    setInterviewType(skill.interviewFocus?.type || 'technical');
    setInterviewArea(skill.interviewFocus?.area || 'general');
    setError(null);
  }, [open, skill]);

  if (!skill) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !definition.trim() || !category) {
      setError('Name, definition, and category are required.');
      return;
    }
    if (!categories[category]) {
      setError(`Category '${category}' is not a known category.`);
      return;
    }
    onSubmit({
      ...skill,
      name: name.trim(),
      definition: definition.trim(),
      category,
      proficiency: {
        ...(skill.proficiency || {}),
        awareness: awareness.trim(),
        application: application.trim(),
        adaptation: adaptation.trim(),
      },
      interviewFocus: {
        ...(skill.interviewFocus || {}),
        type: interviewType,
        area: interviewArea.trim() || 'general',
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="font-proxima-bold text-[#1E1E1E] text-xl">
              Edit skill: <code className="font-mono text-base text-[#4242EA]">{skill.slug}</code>
            </DialogTitle>
            <DialogDescription className="font-proxima text-[#666]">
              Updates take effect on the next coach turn. Slug, learnedIn, and related skills are preserved as-is (edit via DB if needed).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name" className="font-proxima text-[#1E1E1E]">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-[#C8C8C8] text-[#1E1E1E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-definition" className="font-proxima text-[#1E1E1E]">
                Definition <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="skill-definition"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={3}
                className="bg-white border-[#C8C8C8] text-[#1E1E1E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-category" className="font-proxima text-[#1E1E1E]">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="skill-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#C8C8C8] rounded-md font-proxima text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
              >
                {Object.entries(categories).map(([id, cat]) => (
                  <option key={id} value={id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-[#E3E3E3] pt-4">
              <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-3">Proficiency descriptors</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="skill-awareness" className="font-proxima text-xs text-[#666]">
                    Awareness <span className="text-[#999]">— recognize + explain w/ scaffold</span>
                  </Label>
                  <Textarea
                    id="skill-awareness"
                    value={awareness}
                    onChange={(e) => setAwareness(e.target.value)}
                    rows={2}
                    className="bg-white border-[#C8C8C8] text-[#1E1E1E] font-proxima text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skill-application" className="font-proxima text-xs text-[#666]">
                    Application <span className="text-[#999]">— execute independently in structured task</span>
                  </Label>
                  <Textarea
                    id="skill-application"
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    rows={2}
                    className="bg-white border-[#C8C8C8] text-[#1E1E1E] font-proxima text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skill-adaptation" className="font-proxima text-xs text-[#666]">
                    Adaptation <span className="text-[#999]">— apply with judgment in new situations</span>
                  </Label>
                  <Textarea
                    id="skill-adaptation"
                    value={adaptation}
                    onChange={(e) => setAdaptation(e.target.value)}
                    rows={2}
                    className="bg-white border-[#C8C8C8] text-[#1E1E1E] font-proxima text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E3E3E3] pt-4">
              <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-3">Mock-interview routing</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="skill-interview-type" className="font-proxima text-xs text-[#666]">Type</Label>
                  <select
                    id="skill-interview-type"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#C8C8C8] rounded-md font-proxima text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA]"
                  >
                    <option value="technical">technical</option>
                    <option value="behavioral">behavioral</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skill-interview-area" className="font-proxima text-xs text-[#666]">
                    Focus area <span className="text-[#999]">(e.g. general, frontend, system_design)</span>
                  </Label>
                  <Input
                    id="skill-interview-area"
                    value={interviewArea}
                    onChange={(e) => setInterviewArea(e.target.value)}
                    className="bg-white border-[#C8C8C8] text-[#1E1E1E]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-proxima">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
