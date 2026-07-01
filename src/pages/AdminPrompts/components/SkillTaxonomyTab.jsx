import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Pencil, Clock, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import LoadingState from './shared/LoadingState';
import SkillEditDialog from './SkillEditDialog';
import PromptChangeHistoryDialog from './PromptChangeHistoryDialog';
import useAuthStore from '../../../stores/authStore';

// Dreyfus 0-5 labels (the N/A administrative state has no per-skill definition).
const DREYFUS_LABELS = ['Below Novice', 'Novice', 'Advanced Beginner', 'Competent', 'Proficient', 'Expert'];
// Sequential ramp so the proficiency progression reads at a glance.
const LEVEL_COLOR = ['#b9bcc9', '#a3a6e0', '#8186ee', '#5b5fe8', '#3f3fd0', '#2a2a9e'];

/**
 * SkillTaxonomyTab — top-level admin surface for the flat 45-skill taxonomy and
 * the per-skill Dreyfus level definitions (0-5) that anchor coach grading.
 *
 * Reads the bundled GET /v2-coach-engine (skillTaxonomy + skillProficiency).
 * Skill metadata saves through PUT /skill-taxonomy (whole-taxonomy write, same
 * as the old buried card); each level definition saves through
 * PUT /skill-proficiency-definitions/:slug/:level (takes effect next coach turn).
 */
export default function SkillTaxonomyTab({ showNotification, reloadPrompts, canEdit }) {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [skillEditSlug, setSkillEditSlug] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [scaleOpen, setScaleOpen] = useState(false);
  // Inline level-definition editor: { level, definition, indicatorsText } | null
  const [levelEdit, setLevelEdit] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/v2-coach-engine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch skill taxonomy data');
      const json = await res.json();
      setData(json);
      // Default-select the first skill so the detail pane isn't empty.
      setSelectedSlug((prev) => {
        const skills = json.skillTaxonomy?.skills || {};
        if (prev && skills[prev]) return prev;
        const first = Object.values(skills).sort(sortSkill)[0];
        return first?.slug || null;
      });
    } catch (err) {
      console.error('Error fetching skill taxonomy:', err);
      showNotification('Failed to load Skill Taxonomy data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortSkill = (a, b) =>
    (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || '');

  const openHistory = () => setHistoryTarget({ entityType: 'skill_taxonomy', entityId: '1', entityName: 'Skill Taxonomy' });

  // --- Save skill metadata (whole-taxonomy PUT, mirrors the legacy card) ---
  const handleSaveSkill = async (updatedSkill) => {
    if (!data?.skillTaxonomy || isSaving) return;
    setIsSaving(true);
    const t = data.skillTaxonomy;
    const updatedTaxonomy = {
      categories: t.categories,
      skills: { ...t.skills, [updatedSkill.slug]: updatedSkill },
      foundationalCompetencies: t.foundationalCompetencies,
      focusAreaToSkillDomains: t.focusAreaToSkillDomains,
      skillDomainToFocusArea: t.skillDomainToFocusArea,
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/skill-taxonomy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedTaxonomy),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `PUT failed: ${res.status}`);
      }
      setSkillEditSlug(null);
      showNotification(`Skill "${updatedSkill.name}" saved`);
      await Promise.all([reloadPrompts ? reloadPrompts() : Promise.resolve(), fetchData()]);
    } catch (err) {
      console.error(`Error saving skill ${updatedSkill.slug}:`, err);
      showNotification(`Failed to save skill: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Save one Dreyfus level definition ---
  const handleSaveLevel = async (slug, level) => {
    if (isSaving) return;
    const definition = (levelEdit?.definition || '').trim();
    if (!definition) { showNotification('Definition cannot be empty', 'error'); return; }
    const indicators = (levelEdit?.indicatorsText || '')
      .split('\n').map((s) => s.trim()).filter(Boolean);
    setIsSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/prompts/skill-proficiency-definitions/${slug}/${level}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ definition, indicators }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `PUT failed: ${res.status}`);
      }
      // Patch local state so the change shows immediately without a full refetch.
      setData((prev) => {
        const next = { ...prev };
        const defs = { ...(next.skillProficiency?.definitionsBySkill || {}) };
        defs[slug] = { ...(defs[slug] || {}), [level]: { definition, indicators } };
        next.skillProficiency = { ...next.skillProficiency, definitionsBySkill: defs };
        return next;
      });
      setLevelEdit(null);
      showNotification(`${slug} · level ${level} saved`);
    } catch (err) {
      console.error(`Error saving level ${slug}/${level}:`, err);
      showNotification(`Failed to save level: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !data) return <LoadingState message="Loading skill taxonomy…" />;
  if (!data?.skillTaxonomy) return <div className="font-proxima text-[#666] p-6">No skill taxonomy data.</div>;

  const taxonomy = data.skillTaxonomy;
  const categories = taxonomy.categories || {};
  const skills = taxonomy.skills || {};
  const scale = data.skillProficiency?.scale || null;
  const defsBySkill = data.skillProficiency?.definitionsBySkill || {};

  const visibleSkills = Object.values(skills)
    .filter((s) => !categoryFilter || s.category === categoryFilter)
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (s.name || '').toLowerCase().includes(q) || (s.slug || '').includes(q);
    })
    .sort(sortSkill);

  const selected = selectedSlug ? skills[selectedSlug] : null;
  const selectedDefs = selectedSlug ? (defsBySkill[selectedSlug] || {}) : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Layers className="h-5 w-5 text-[#4242EA]" />
        <div className="flex-1 min-w-0">
          <h2 className="font-proxima-bold text-lg text-[#1E1E1E]">Skill Taxonomy &amp; Proficiency</h2>
          <p className="font-proxima text-sm text-[#666]">
            {Object.keys(skills).length} skills · Dreyfus N/A–5 scale · per-skill level definitions anchor coach grading.
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          className="border-[#C8C8C8] text-[#666] hover:bg-[#E3E3E3]"
          onClick={openHistory} title="Skill taxonomy change history"
        >
          <Clock className="h-4 w-4 mr-1" /> History
        </Button>
      </div>

      {/* Proficiency scale reference (collapsible, read-only) */}
      {scale && (
        <Card className="bg-white border-[#C8C8C8]">
          <button
            className="w-full flex items-center gap-2 p-4 text-left"
            onClick={() => setScaleOpen((o) => !o)}
          >
            {scaleOpen ? <ChevronDown className="h-4 w-4 text-[#666]" /> : <ChevronRight className="h-4 w-4 text-[#666]" />}
            <span className="font-proxima-bold text-sm text-[#1E1E1E]">{scale.name || 'Proficiency Scale'}</span>
            <span className="font-proxima text-xs text-[#999]">{scale.subtitle || ''}</span>
          </button>
          {scaleOpen && (
            <CardContent className="pt-0 space-y-2">
              {(scale.levels || []).map((lvl) => (
                <div key={String(lvl.score)} className="flex gap-3 items-start">
                  <span
                    className="shrink-0 mt-0.5 inline-flex items-center justify-center min-w-[2.5rem] h-6 px-2 rounded text-xs font-proxima-bold text-white"
                    style={{ background: lvl.score === 'N/A' ? '#8a8fa3' : LEVEL_COLOR[lvl.score] }}
                  >
                    {String(lvl.score)}
                  </span>
                  <div className="min-w-0">
                    <span className="font-proxima-bold text-sm text-[#1E1E1E]">{lvl.label}</span>
                    <span className="font-proxima text-sm text-[#666]"> — {lvl.short}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Master-detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Left: skill list */}
        <Card className="bg-white border-[#C8C8C8] h-fit">
          <CardContent className="p-3 space-y-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills…"
              className="bg-white border-[#C8C8C8] text-[#1E1E1E] text-sm"
            />
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`text-xs font-proxima px-2 py-1 rounded ${categoryFilter === null ? 'bg-[#4242EA] text-white' : 'bg-[#F5F5F5] text-[#666] hover:bg-[#E3E3E3]'}`}
              >
                All
              </button>
              {Object.entries(categories).map(([id, cat]) => (
                <button
                  key={id}
                  onClick={() => setCategoryFilter(id)}
                  className={`text-xs font-proxima px-2 py-1 rounded ${categoryFilter === id ? 'bg-[#4242EA] text-white' : 'bg-[#F5F5F5] text-[#666] hover:bg-[#E3E3E3]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1 space-y-1">
              {visibleSkills.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => { setSelectedSlug(s.slug); setLevelEdit(null); }}
                  className={`w-full text-left px-2 py-2 rounded border transition-colors ${
                    selectedSlug === s.slug ? 'border-[#4242EA] bg-[#F0F0FE]' : 'border-transparent hover:bg-[#F5F5F5]'
                  }`}
                >
                  <p className="font-proxima text-sm text-[#1E1E1E] truncate">{s.name}</p>
                  <code className="font-mono text-[10px] text-[#4242EA]">{s.slug}</code>
                </button>
              ))}
              {visibleSkills.length === 0 && (
                <p className="font-proxima text-xs text-[#999] px-2 py-4 text-center">No skills match.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: detail */}
        <Card className="bg-white border-[#C8C8C8]">
          {!selected ? (
            <CardContent className="p-6 font-proxima text-[#666]">Select a skill.</CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="font-proxima-bold text-[#1E1E1E]">{selected.name}</CardTitle>
                    <code className="font-mono text-xs text-[#4242EA]">{selected.slug}</code>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline" size="sm"
                      className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3] shrink-0"
                      onClick={() => setSkillEditSlug(selected.slug)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit skill
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="outline" className="font-proxima text-xs capitalize">
                    {(categories[selected.category]?.name || selected.category || '').replace(/_/g, ' ')}
                  </Badge>
                  {selected.interviewFocus && (
                    <Badge variant="outline" className="font-mono text-xs bg-[#F5F5F5]">
                      {selected.interviewFocus.type}/{selected.interviewFocus.area}
                    </Badge>
                  )}
                </div>
                <CardDescription className="font-proxima text-[#666] pt-2">{selected.definition}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="font-proxima-bold text-sm text-[#1E1E1E]">
                  Dreyfus level definitions
                  <span className="font-proxima text-[#999] font-normal"> — what each level looks like for this skill (the grader's anchor)</span>
                </p>

                {[0, 1, 2, 3, 4, 5].map((level) => {
                  const def = selectedDefs[level];
                  const editing = levelEdit?.level === level;
                  return (
                    <div key={level} className="border border-[#E3E3E3] rounded-lg overflow-hidden">
                      <div className="flex items-stretch">
                        <div
                          className="shrink-0 w-12 flex flex-col items-center justify-center text-white py-2"
                          style={{ background: LEVEL_COLOR[level] }}
                        >
                          <span className="font-proxima-bold text-lg leading-none">{level}</span>
                        </div>
                        <div className="flex-1 min-w-0 p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-proxima-bold text-xs uppercase tracking-wide text-[#666]">{DREYFUS_LABELS[level]}</span>
                            {canEdit && !editing && (
                              <Button
                                variant="ghost" size="sm"
                                className="h-6 px-2 text-[#4242EA] hover:bg-[#F0F0FE]"
                                onClick={() => setLevelEdit({
                                  level,
                                  definition: def?.definition || '',
                                  indicatorsText: (def?.indicators || []).join('\n'),
                                })}
                              >
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                            )}
                          </div>

                          {editing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={levelEdit.definition}
                                onChange={(e) => setLevelEdit((p) => ({ ...p, definition: e.target.value }))}
                                rows={3}
                                className="bg-white border-[#C8C8C8] text-[#1E1E1E] text-sm"
                                placeholder="What this level looks like for this skill…"
                              />
                              <div>
                                <label className="font-proxima text-xs text-[#666]">Indicators (one per line)</label>
                                <Textarea
                                  value={levelEdit.indicatorsText}
                                  onChange={(e) => setLevelEdit((p) => ({ ...p, indicatorsText: e.target.value }))}
                                  rows={2}
                                  className="bg-white border-[#C8C8C8] text-[#1E1E1E] text-sm mt-1"
                                  placeholder={'Observable cue 1\nObservable cue 2'}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]" onClick={() => setLevelEdit(null)}>
                                  Cancel
                                </Button>
                                <Button size="sm" disabled={isSaving} className="bg-[#4242EA] text-white hover:bg-[#3535D1]" onClick={() => handleSaveLevel(selected.slug, level)}>
                                  {isSaving ? 'Saving…' : 'Save'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-proxima text-sm text-[#1E1E1E]">
                                {def?.definition || <span className="text-[#999] italic">Not yet defined.</span>}
                              </p>
                              {def?.indicators?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {def.indicators.map((ind, i) => (
                                    <span key={i} className="font-proxima text-xs text-[#666] bg-[#F5F5F5] border border-[#E3E3E3] rounded px-2 py-0.5">
                                      {ind}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Skill metadata edit dialog */}
      {skillEditSlug && skills[skillEditSlug] && (
        <SkillEditDialog
          open={!!skillEditSlug}
          onClose={() => setSkillEditSlug(null)}
          onSubmit={handleSaveSkill}
          isSubmitting={isSaving}
          skill={skills[skillEditSlug]}
          categories={categories}
        />
      )}

      {/* Change history */}
      {historyTarget && (
        <PromptChangeHistoryDialog
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          target={historyTarget}
          onReverted={() => { if (reloadPrompts) reloadPrompts(); fetchData(); }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
