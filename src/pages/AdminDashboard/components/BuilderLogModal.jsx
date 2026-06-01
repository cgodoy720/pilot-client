import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import {
  X, AlertTriangle, MessageSquare, UserCheck, Plus, Search, Loader2,
  Users, BookOpen, ThumbsUp, ThumbsDown, Minus, Flag, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const SUPPORT_CATEGORIES = [
  { value: '599_extension',   label: '599 Extension' },
  { value: 'hra_training_form', label: 'HRA Training Form' },
  { value: 'laptop_hardware', label: 'Laptop / Hardware' },
  { value: 'time_off_personal', label: 'Time Off / Personal' },
];

const CURRICULUM_STATUSES = [
  { value: 'thumbs_up',       label: 'Thumbs Up',   icon: ThumbsUp,   active: 'bg-emerald-50 border-emerald-400 text-emerald-700', hover: 'hover:border-emerald-300' },
  { value: 'thumbs_sideways', label: 'Neutral',      icon: Minus,      active: 'bg-amber-50  border-amber-400  text-amber-700',   hover: 'hover:border-amber-300'   },
  { value: 'thumbs_down',     label: 'Thumbs Down', icon: ThumbsDown, active: 'bg-red-50    border-red-400    text-red-700',     hover: 'hover:border-red-300'     },
];

// ─── Reusable toggle-section ─────────────────────────────────────────────────

const ToggleSection = ({ label, icon: Icon, iconColor = 'text-slate-400', enabled, onToggle, children }) => (
  <div className={`rounded-lg border transition-all ${enabled ? 'border-[#4242EA]/30 bg-[#4242EA]/[0.02]' : 'border-[#E3E3E3] bg-white'}`}>
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className={enabled ? iconColor : 'text-slate-400'} />}
        <span className={`text-sm font-medium ${enabled ? 'text-[#1E1E1E]' : 'text-slate-500'}`}>{label}</span>
      </div>
      {/* Custom toggle pill */}
      <div className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${enabled ? 'bg-[#4242EA]' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${enabled ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
    {enabled && <div className="px-4 pb-4 pt-1">{children}</div>}
  </div>
);

// ─── Builder Tab ─────────────────────────────────────────────────────────────

const BuilderTab = ({ builder, cohortId, onSaved, onClose }) => {
  const token = useAuthStore((s) => s.token);

  const [logType, setLogType]                   = useState('behavioral');
  const [notes, setNotes]                       = useState('');
  const [bondBlocks, setBondBlocks]             = useState('');
  const [nextSteps, setNextSteps]               = useState('');
  const [violatesCoC, setViolatesCoC]           = useState(false);
  const [communityRating, setCommunityRating]   = useState(null);
  const [involvedBuilders, setInvolvedBuilders] = useState([]);
  const [showSupport, setShowSupport]           = useState(false);
  const [supportCategory, setSupportCategory]   = useState('');
  const [supportDisclosure, setSupportDisclosure] = useState('');
  const [mitigationAvailable, setMitigationAvailable] = useState(false);
  const [saving, setSaving]                     = useState(false);

  const [primaryBuilder, setPrimaryBuilder]           = useState(null);
  const [primarySearchQuery, setPrimarySearchQuery]   = useState('');
  const [primarySearchResults, setPrimarySearchResults] = useState([]);
  const [primarySearching, setPrimarySearching]       = useState(false);

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);

  const effectiveBuilder = builder || primaryBuilder;

  const searchPrimaryBuilder = useCallback(async (q) => {
    if (!q || q.length < 2 || !cohortId || !token) { setPrimarySearchResults([]); return; }
    setPrimarySearching(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/builders-search?cohortId=${cohortId}&q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPrimarySearchResults(data.data || []);
    } catch { /* ignore */ }
    setPrimarySearching(false);
  }, [cohortId, token]);

  useEffect(() => {
    if (builder) return;
    const t = setTimeout(() => searchPrimaryBuilder(primarySearchQuery), 300);
    return () => clearTimeout(t);
  }, [primarySearchQuery, searchPrimaryBuilder, builder]);

  const searchBuilders = useCallback(async (q) => {
    if (!q || q.length < 2 || !cohortId || !token) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/builders-search?cohortId=${cohortId}&q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const excl = new Set([effectiveBuilder?.user_id, ...involvedBuilders.map(b => b.user_id)]);
        setSearchResults((data.data || []).filter(b => !excl.has(b.user_id)));
      }
    } catch { /* ignore */ }
    setSearching(false);
  }, [cohortId, token, effectiveBuilder?.user_id, involvedBuilders]);

  useEffect(() => {
    const t = setTimeout(() => searchBuilders(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchBuilders]);

  const addBuilder    = (b) => { setInvolvedBuilders(p => [...p, b]); setSearchQuery(''); setSearchResults([]); };
  const removeBuilder = (id) => setInvolvedBuilders(p => p.filter(b => b.user_id !== id));

  const handleSave = async () => {
    if (!notes.trim() || !effectiveBuilder) return;
    setSaving(true);
    try {
      const body = {
        log_type: logType,
        builder_id: effectiveBuilder.user_id,
        cohort_id: cohortId || null,
        notes: notes.trim(),
        bond_blocks: bondBlocks.trim() || null,
        next_steps: nextSteps.trim() || null,
        violates_code_of_conduct: violatesCoC,
        community_rating: communityRating,
        involved_builder_ids: involvedBuilders.map(b => b.user_id),
      };
      if (showSupport && supportCategory) {
        body.support = { support_category: supportCategory, support_disclosure: supportDisclosure.trim() || null, mitigation_available: mitigationAvailable };
      }
      const res  = await fetch(`${API_URL}/api/admin/dashboard/builder-logs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { onSaved?.(); onClose(); }
      else { toast.error(data.error || 'Failed to save log'); }
    } catch (err) { toast.error('Failed to save log — check your connection'); }
    setSaving(false);
  };

  return (
    <div className="space-y-5 px-6 py-5 overflow-y-auto flex-1">
      {/* Primary builder search */}
      {!builder && (
        <div>
          <Label className="text-xs font-medium text-slate-500">Builder <span className="text-red-400">*</span></Label>
          {primaryBuilder ? (
            <div className="flex items-center gap-2 mt-1.5">
              <Badge className="bg-[#4242EA]/10 text-[#4242EA] text-xs flex items-center gap-1">
                {primaryBuilder.first_name} {primaryBuilder.last_name}
                <button type="button" onClick={() => setPrimaryBuilder(null)} className="hover:text-red-500"><X size={10} /></button>
              </Badge>
            </div>
          ) : (
            <div className="relative mt-1.5">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input type="text" value={primarySearchQuery} onChange={e => setPrimarySearchQuery(e.target.value)} placeholder="Search for a builder..." autoFocus
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none" />
              {primarySearching && <Loader2 size={14} className="absolute right-2.5 top-2.5 text-slate-400 animate-spin" />}
              {primarySearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E3E3E3] rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {primarySearchResults.map(b => (
                    <button key={b.user_id} type="button" onClick={() => { setPrimaryBuilder(b); setPrimarySearchQuery(''); setPrimarySearchResults([]); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFEFEF]">
                      {b.first_name} {b.last_name} <span className="text-slate-400">{b.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Log type */}
      <div className="flex gap-2">
        {[
          { value: 'behavioral',  label: 'Behavioral',  icon: AlertTriangle, active: 'bg-amber-50 border-amber-300 text-amber-700',   hover: 'hover:border-amber-200' },
          { value: 'conversation',label: 'Conversation',icon: MessageSquare, active: 'bg-blue-50  border-blue-300  text-blue-700',    hover: 'hover:border-blue-200'  },
          { value: 'interview',   label: 'Interview',   icon: UserCheck,     active: 'bg-emerald-50 border-emerald-300 text-emerald-700', hover: 'hover:border-emerald-200' },
        ].map(({ value, label, icon: Icon, active, hover }) => (
          <button key={value} type="button" onClick={() => setLogType(value)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${logType === value ? active : `bg-white border-[#E3E3E3] text-slate-500 ${hover}`}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Builders involved */}
      <div>
        <Label className="text-xs font-medium text-slate-500">Builders Involved</Label>
        <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
          {effectiveBuilder && <Badge className="bg-[#4242EA]/10 text-[#4242EA] text-xs">{effectiveBuilder.name || `${effectiveBuilder.first_name} ${effectiveBuilder.last_name}`} (primary)</Badge>}
          {involvedBuilders.map(b => (
            <Badge key={b.user_id} className="bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
              {b.first_name} {b.last_name}
              <button type="button" onClick={() => removeBuilder(b.user_id)} className="hover:text-red-500"><X size={10} /></button>
            </Badge>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search builders to add..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none" />
          {searching && <Loader2 size={14} className="absolute right-2.5 top-2.5 text-slate-400 animate-spin" />}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#E3E3E3] rounded-md shadow-lg max-h-32 overflow-y-auto">
              {searchResults.map(b => (
                <button key={b.user_id} type="button" onClick={() => addBuilder(b)} className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFEFEF]">
                  {b.first_name} {b.last_name} <span className="text-slate-400">{b.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="text-xs font-medium text-slate-500">Notes <span className="text-red-400">*</span></Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={logType === 'interview' ? "Interview feedback — impressions, strengths, concerns..." : "What happened? Write freely — AI will categorize automatically."}
          className="mt-1.5 min-h-[100px] text-sm" />
      </div>

      {/* Bond Blocks */}
      {logType !== 'interview' && (
        <div>
          <Label className="text-xs font-medium text-slate-500">Bond Blocks</Label>
          <p className="text-[10px] text-slate-400 mt-0.5">Hesitation regarding ISA terms or institutional trust</p>
          <Textarea value={bondBlocks} onChange={e => setBondBlocks(e.target.value)} placeholder="Optional..." className="mt-1 min-h-[60px] text-sm" />
        </div>
      )}

      {/* Community Rating + CoC */}
      {logType !== 'interview' && (
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <Label className="text-xs font-medium text-slate-500">Community Rating</Label>
            <div className="flex gap-1 mt-1.5">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setCommunityRating(communityRating === n ? null : n)}
                  className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${communityRating === n ? 'bg-[#4242EA] text-white' : 'bg-[#EFEFEF] text-slate-500 hover:bg-[#E3E3E3]'}`}>
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">1 = Poor Collaborator, 5 = Excellent</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-500">Code of Conduct</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Switch checked={violatesCoC} onCheckedChange={setViolatesCoC} />
              <span className={`text-xs font-medium ${violatesCoC ? 'text-red-600' : 'text-slate-400'}`}>{violatesCoC ? 'Violation' : 'No violation'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div>
        <Label className="text-xs font-medium text-slate-500">Next Steps</Label>
        <Textarea value={nextSteps} onChange={e => setNextSteps(e.target.value)} placeholder="Action items, referrals..." className="mt-1.5 min-h-[60px] text-sm" />
      </div>

      {/* Support case */}
      <div className="border-t border-[#E3E3E3] pt-4">
        <button type="button" onClick={() => setShowSupport(!showSupport)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${showSupport ? 'text-[#4242EA]' : 'text-slate-500 hover:text-[#4242EA]'}`}>
          <Plus size={14} className={showSupport ? 'rotate-45' : ''} />
          {showSupport ? 'Remove Support Case' : 'Add Support Case'}
        </button>
        {showSupport && (
          <div className="mt-3 space-y-3 p-3 bg-[#FAFAFA] rounded-lg border border-[#E3E3E3]">
            <div>
              <Label className="text-xs font-medium text-slate-500">Support Category <span className="text-red-400">*</span></Label>
              <select value={supportCategory} onChange={e => setSupportCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none">
                <option value="">Select category...</option>
                {SUPPORT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500">Support Disclosure</Label>
              <p className="text-[10px] text-slate-400 mt-0.5">Sensitive details (visible only to staff/admin)</p>
              <Textarea value={supportDisclosure} onChange={e => setSupportDisclosure(e.target.value)} placeholder="Confidential details..." className="mt-1 min-h-[60px] text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={mitigationAvailable} onCheckedChange={setMitigationAvailable} />
              <Label className="text-xs text-slate-500">Mitigation available?</Label>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !notes.trim() || !effectiveBuilder} className="bg-[#4242EA] hover:bg-[#3535c8] text-white text-sm">
          {saving && <Loader2 size={14} className="animate-spin mr-1" />} Save Log
        </Button>
      </div>
    </div>
  );
};

// ─── Cohort Tab ───────────────────────────────────────────────────────────────

const CohortTab = ({ cohortId, cohorts, onSaved, onClose }) => {
  const token = useAuthStore((s) => s.token);

  const [logCategory, setLogCategory]                       = useState('facilitator_feedback');
  const [curriculumStatus, setCurriculumStatus]             = useState(null);
  const [curriculumStatusNotes, setCurriculumStatusNotes]   = useState('');
  const [todayEnabled, setTodayEnabled]                     = useState(false);
  const [todayNotes, setTodayNotes]                         = useState('');
  const [nextDayEnabled, setNextDayEnabled]                 = useState(false);
  const [nextDayNotes, setNextDayNotes]                     = useState('');
  const [flagsEnabled, setFlagsEnabled]                     = useState(false);
  const [flags, setFlags]                                   = useState('');
  const [actionRequired, setActionRequired]                 = useState(false);
  const [saving, setSaving]                                 = useState(false);

  const [cohortSearch, setCohortSearch]           = useState('');
  const [selectedCohortId, setSelectedCohortId]   = useState(cohortId || '');
  const [showCohortDropdown, setShowCohortDropdown] = useState(false);

  const activeCohort   = cohorts?.find(c => c.cohort_id === cohortId);
  const selectedCohort = cohorts?.find(c => c.cohort_id === selectedCohortId);

  useEffect(() => {
    if (cohortId)    setSelectedCohortId(cohortId);
    if (activeCohort) setCohortSearch(activeCohort.name || '');
  }, [cohortId, activeCohort]);

  const filteredCohorts = (cohorts || []).filter(c => c.name?.toLowerCase().includes(cohortSearch.toLowerCase()));

  const canSave = selectedCohortId && (
    curriculumStatus ||
    curriculumStatusNotes.trim() ||
    (todayEnabled   && todayNotes.trim()) ||
    (nextDayEnabled && nextDayNotes.trim()) ||
    (flagsEnabled   && flags.trim())
  );

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/dashboard/cohort-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cohort_id: selectedCohortId,
          log_category: logCategory,
          curriculum_status: curriculumStatus || null,
          curriculum_status_notes: curriculumStatusNotes.trim() || null,
          curriculum_changes_today: todayEnabled   ? todayNotes.trim()   || null : null,
          curriculum_changes_next:  nextDayEnabled ? nextDayNotes.trim() || null : null,
          flags: flagsEnabled ? flags.trim() || null : null,
          action_required: flagsEnabled ? actionRequired : false,
        }),
      });
      const data = await res.json();
      if (data.success) { onSaved?.(); onClose(); }
      else { toast.error(data.error || 'Failed to save cohort log'); }
    } catch (err) { toast.error('Failed to save cohort log — check your connection'); }
    setSaving(false);
  };

  return (
    <div className="space-y-4 px-6 py-5 overflow-y-auto flex-1">

      {/* Cohort search — auto-populated */}
      <div>
        <Label className="text-xs font-medium text-slate-500">Cohort <span className="text-red-400">*</span></Label>
        <div className="relative mt-1.5">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input type="text" value={cohortSearch}
            onChange={e => { setCohortSearch(e.target.value); setShowCohortDropdown(true); }}
            onFocus={() => setShowCohortDropdown(true)}
            onBlur={() => setTimeout(() => setShowCohortDropdown(false), 150)}
            placeholder="Search for a cohort..."
            className="w-full pl-8 pr-20 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none" />
          {selectedCohort && (
            <span className="absolute right-2.5 top-2 text-[10px] font-semibold text-[#4242EA] bg-[#4242EA]/10 px-1.5 py-0.5 rounded">Selected</span>
          )}
          {showCohortDropdown && filteredCohorts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#E3E3E3] rounded-md shadow-lg max-h-36 overflow-y-auto">
              {filteredCohorts.map(c => (
                <button key={c.cohort_id} type="button"
                  onMouseDown={() => { setSelectedCohortId(c.cohort_id); setCohortSearch(c.name); setShowCohortDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#EFEFEF] ${c.cohort_id === selectedCohortId ? 'bg-[#4242EA]/5 text-[#4242EA] font-medium' : ''}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div>
        <Label className="text-xs font-medium text-slate-500">Category <span className="text-red-400">*</span></Label>
        <div className="flex gap-2 mt-1.5">
          {[
            { value: 'facilitator_feedback', label: 'Facilitator Feedback', active: 'bg-violet-50 border-violet-300 text-violet-700', hover: 'hover:border-violet-200' },
            { value: 'cohort_feedback',       label: 'Cohort Feedback',      active: 'bg-teal-50   border-teal-300   text-teal-700',   hover: 'hover:border-teal-200'   },
          ].map(({ value, label, active, hover }) => (
            <button key={value} type="button" onClick={() => setLogCategory(value)}
              className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${logCategory === value ? active : `bg-white border-[#E3E3E3] text-slate-500 ${hover}`}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Status */}
      <div className="rounded-lg border border-[#E3E3E3] p-4 space-y-3">
        <Label className="text-xs font-medium text-slate-500">Curriculum Status</Label>
        <div className="flex gap-2">
          {CURRICULUM_STATUSES.map(({ value, label, icon: Icon, active, hover }) => (
            <button key={value} type="button"
              onClick={() => setCurriculumStatus(curriculumStatus === value ? null : value)}
              className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-xs font-medium transition-all ${curriculumStatus === value ? active : `bg-white border-[#E3E3E3] text-slate-400 ${hover}`}`}>
              <Icon size={18} />
              <span className="text-[10px] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs font-medium text-slate-500">Curriculum Status Notes</Label>
          <Textarea value={curriculumStatusNotes} onChange={e => setCurriculumStatusNotes(e.target.value)}
            placeholder="How did today's curriculum land with the cohort?"
            className="mt-1.5 min-h-[70px] text-sm" />
        </div>
      </div>

      {/* Changes/Updates to Day's Curriculum */}
      <ToggleSection label="Changes/Updates to Day's Curriculum" icon={ChevronDown} iconColor="text-[#4242EA]" enabled={todayEnabled} onToggle={() => setTodayEnabled(v => !v)}>
        <Textarea value={todayNotes} onChange={e => setTodayNotes(e.target.value)}
          placeholder="Describe any changes or updates made to today's curriculum..."
          className="min-h-[90px] text-sm" autoFocus />
      </ToggleSection>

      {/* Changes/Updates for Next Day's Curriculum */}
      <ToggleSection label="Changes/Updates for Next Day's Curriculum" icon={ChevronDown} iconColor="text-[#4242EA]" enabled={nextDayEnabled} onToggle={() => setNextDayEnabled(v => !v)}>
        <Textarea value={nextDayNotes} onChange={e => setNextDayNotes(e.target.value)}
          placeholder="Describe planned changes or updates for tomorrow's curriculum..."
          className="min-h-[90px] text-sm" autoFocus />
      </ToggleSection>

      {/* Flags */}
      <ToggleSection label="Flags" icon={Flag} iconColor="text-amber-500" enabled={flagsEnabled} onToggle={() => { setFlagsEnabled(v => !v); if (flagsEnabled) setActionRequired(false); }}>
        <div className="space-y-3">
          {/* Icon + Action Required checkbox */}
          <div className="flex items-center gap-3 px-1 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <label className="flex items-center gap-2 cursor-pointer select-none flex-1">
              <input
                type="checkbox"
                checked={actionRequired}
                onChange={e => setActionRequired(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 accent-amber-500 cursor-pointer"
              />
              <span className={`text-sm font-medium ${actionRequired ? 'text-amber-700' : 'text-amber-600'}`}>
                Action Required
              </span>
            </label>
          </div>
          <Textarea value={flags} onChange={e => setFlags(e.target.value)}
            placeholder="Describe concerns or issues requiring follow-up action..."
            className="min-h-[80px] text-sm border-amber-200 focus:border-amber-400" autoFocus />
        </div>
      </ToggleSection>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="text-sm">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !canSave} className="bg-[#4242EA] hover:bg-[#3535c8] text-white text-sm">
          {saving && <Loader2 size={14} className="animate-spin mr-1" />} Save Log
        </Button>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const BuilderLogModal = ({ open, onOpenChange, builder, cohortId, cohorts, onSaved, mode = 'sheet' }) => {
  const [activeTab, setActiveTab] = useState('builder');

  useEffect(() => { if (!open) setActiveTab('builder'); }, [open]);

  const title = activeTab === 'cohort'
    ? 'New Cohort Log'
    : (builder ? 'Log Entry — ' + (builder.name || `${builder.first_name} ${builder.last_name}`) : 'New Facilitator Log');

  const Wrapper  = mode === 'dialog' ? Dialog  : Sheet;
  const Content  = mode === 'dialog' ? DialogContent  : SheetContent;
  const Header   = mode === 'dialog' ? DialogHeader   : SheetHeader;
  const Title    = mode === 'dialog' ? DialogTitle    : SheetTitle;
  const contentClass = mode === 'dialog'
    ? 'max-w-lg max-h-[90vh] overflow-y-auto p-0'
    : 'w-full sm:max-w-lg p-0 flex flex-col z-[70]';
  const contentProps = mode === 'dialog' ? {} : { side: 'right' };

  return (
    <Wrapper open={open} onOpenChange={onOpenChange}>
      <Content className={contentClass} {...contentProps}>
        <Header className="px-6 pt-6 pb-0 border-b-0">
          <Title className="text-lg font-bold text-[#1E1E1E]">{title}</Title>
        </Header>

        {/* Tab bar */}
        <div className="flex px-6 pt-4 border-b border-[#E3E3E3]">
          {[
            { key: 'builder', label: 'Builder', icon: Users },
            { key: 'cohort',  label: 'Cohort',  icon: BookOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === key ? 'border-[#4242EA] text-[#4242EA]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {activeTab === 'builder' ? (
          <BuilderTab builder={builder} cohortId={cohortId} onSaved={onSaved} onClose={() => onOpenChange(false)} />
        ) : (
          <CohortTab cohortId={cohortId} cohorts={cohorts} onSaved={onSaved} onClose={() => onOpenChange(false)} />
        )}
      </Content>
    </Wrapper>
  );
};

export default BuilderLogModal;
