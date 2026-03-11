import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { X, AlertTriangle, MessageSquare, UserCheck, Plus, Search, Loader2 } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const SUPPORT_CATEGORIES = [
  { value: '599_extension', label: '599 Extension' },
  { value: 'hra_training_form', label: 'HRA Training Form' },
  { value: 'laptop_hardware', label: 'Laptop / Hardware' },
  { value: 'time_off_personal', label: 'Time Off / Personal' },
];

const BuilderLogModal = ({ open, onOpenChange, builder, cohortId, onSaved }) => {
  const token = useAuthStore((s) => s.token);

  const [logType, setLogType] = useState('behavioral');
  const [notes, setNotes] = useState('');
  const [bondBlocks, setBondBlocks] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [violatesCoC, setViolatesCoC] = useState(false);
  const [communityRating, setCommunityRating] = useState(null);
  const [involvedBuilders, setInvolvedBuilders] = useState([]);
  const [showSupport, setShowSupport] = useState(false);
  const [supportCategory, setSupportCategory] = useState('');
  const [supportDisclosure, setSupportDisclosure] = useState('');
  const [mitigationAvailable, setMitigationAvailable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [primaryBuilder, setPrimaryBuilder] = useState(null);
  const [primarySearchQuery, setPrimarySearchQuery] = useState('');
  const [primarySearchResults, setPrimarySearchResults] = useState([]);
  const [primarySearching, setPrimarySearching] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const effectiveBuilder = builder || primaryBuilder;

  useEffect(() => {
    if (!open) {
      setLogType('behavioral');
      setNotes('');
      setBondBlocks('');
      setNextSteps('');
      setViolatesCoC(false);
      setCommunityRating(null);
      setInvolvedBuilders([]);
      setPrimaryBuilder(null);
      setPrimarySearchQuery('');
      setPrimarySearchResults([]);
      setShowSupport(false);
      setSupportCategory('');
      setSupportDisclosure('');
      setMitigationAvailable(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  const searchPrimaryBuilder = useCallback(async (q) => {
    if (!q || q.length < 2 || !cohortId || !token) {
      setPrimarySearchResults([]);
      return;
    }
    setPrimarySearching(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/dashboard/builders-search?cohortId=${cohortId}&q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setPrimarySearchResults(data.data || []);
    } catch { /* ignore */ }
    setPrimarySearching(false);
  }, [cohortId, token]);

  useEffect(() => {
    if (builder) return;
    const timer = setTimeout(() => searchPrimaryBuilder(primarySearchQuery), 300);
    return () => clearTimeout(timer);
  }, [primarySearchQuery, searchPrimaryBuilder, builder]);

  const searchBuilders = useCallback(async (q) => {
    if (!q || q.length < 2 || !cohortId || !token) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/dashboard/builders-search?cohortId=${cohortId}&q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        const excluded = new Set([effectiveBuilder?.user_id, ...involvedBuilders.map(b => b.user_id)]);
        setSearchResults((data.data || []).filter(b => !excluded.has(b.user_id)));
      }
    } catch { /* ignore */ }
    setSearching(false);
  }, [cohortId, token, effectiveBuilder?.user_id, involvedBuilders]);

  useEffect(() => {
    const timer = setTimeout(() => searchBuilders(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchBuilders]);

  const addBuilder = (b) => {
    setInvolvedBuilders(prev => [...prev, b]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeBuilder = (userId) => {
    setInvolvedBuilders(prev => prev.filter(b => b.user_id !== userId));
  };

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
        body.support = {
          support_category: supportCategory,
          support_disclosure: supportDisclosure.trim() || null,
          mitigation_available: mitigationAvailable,
        };
      }

      const res = await fetch(`${API_URL}/api/admin/dashboard/builder-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        onSaved?.();
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Failed to save builder log:', err);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1E1E1E]">
            {effectiveBuilder ? `Log Entry — ${effectiveBuilder.name || `${effectiveBuilder.first_name} ${effectiveBuilder.last_name}`}` : 'New Facilitator Log'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Primary builder search (when no builder prop) */}
          {!builder && (
            <div>
              <Label className="text-xs font-medium text-slate-500">
                Builder <span className="text-red-400">*</span>
              </Label>
              {primaryBuilder ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className="bg-[#4242EA]/10 text-[#4242EA] text-xs flex items-center gap-1">
                    {primaryBuilder.first_name} {primaryBuilder.last_name}
                    <button type="button" onClick={() => setPrimaryBuilder(null)} className="hover:text-red-500">
                      <X size={10} />
                    </button>
                  </Badge>
                </div>
              ) : (
                <div className="relative mt-1.5">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={primarySearchQuery}
                    onChange={(e) => setPrimarySearchQuery(e.target.value)}
                    placeholder="Search for a builder..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none"
                    autoFocus
                  />
                  {primarySearching && <Loader2 size={14} className="absolute right-2.5 top-2.5 text-slate-400 animate-spin" />}
                  {primarySearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#E3E3E3] rounded-md shadow-lg max-h-32 overflow-y-auto">
                      {primarySearchResults.map(b => (
                        <button
                          key={b.user_id}
                          type="button"
                          onClick={() => {
                            setPrimaryBuilder(b);
                            setPrimarySearchQuery('');
                            setPrimarySearchResults([]);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFEFEF] transition-colors"
                        >
                          {b.first_name} {b.last_name} <span className="text-slate-400">{b.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Log type toggle */}
          <div className="flex gap-2">
            {[
              { value: 'behavioral', label: 'Behavioral', icon: AlertTriangle, active: 'bg-amber-50 border-amber-300 text-amber-700', hover: 'hover:border-amber-200' },
              { value: 'conversation', label: 'Conversation', icon: MessageSquare, active: 'bg-blue-50 border-blue-300 text-blue-700', hover: 'hover:border-blue-200' },
              { value: 'interview', label: 'Interview', icon: UserCheck, active: 'bg-emerald-50 border-emerald-300 text-emerald-700', hover: 'hover:border-emerald-200' },
            ].map(({ value, label, icon: Icon, active, hover }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLogType(value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  logType === value ? active : `bg-white border-[#E3E3E3] text-slate-500 ${hover}`
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Builders involved */}
          <div>
            <Label className="text-xs font-medium text-slate-500">Builders Involved</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
              {effectiveBuilder && (
                <Badge className="bg-[#4242EA]/10 text-[#4242EA] text-xs">
                  {effectiveBuilder.name || `${effectiveBuilder.first_name} ${effectiveBuilder.last_name}`} (primary)
                </Badge>
              )}
              {involvedBuilders.map(b => (
                <Badge key={b.user_id} className="bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
                  {b.first_name} {b.last_name}
                  <button type="button" onClick={() => removeBuilder(b.user_id)} className="hover:text-red-500">
                    <X size={10} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search builders to add..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none"
              />
              {searching && <Loader2 size={14} className="absolute right-2.5 top-2.5 text-slate-400 animate-spin" />}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E3E3E3] rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {searchResults.map(b => (
                    <button
                      key={b.user_id}
                      type="button"
                      onClick={() => addBuilder(b)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFEFEF] transition-colors"
                    >
                      {b.first_name} {b.last_name} <span className="text-slate-400">{b.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-medium text-slate-500">
              Notes <span className="text-red-400">*</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={logType === 'interview'
                ? "Interview feedback — impressions, strengths, concerns..."
                : "What happened? Write freely — AI will categorize automatically."}
              className="mt-1.5 min-h-[100px] text-sm"
            />
          </div>

          {/* Bond Blocks — behavioral/conversation only */}
          {logType !== 'interview' && (
            <div>
              <Label className="text-xs font-medium text-slate-500">Bond Blocks</Label>
              <p className="text-[10px] text-slate-400 mt-0.5">Hesitation regarding ISA terms or institutional trust</p>
              <Textarea
                value={bondBlocks}
                onChange={(e) => setBondBlocks(e.target.value)}
                placeholder="Optional..."
                className="mt-1 min-h-[60px] text-sm"
              />
            </div>
          )}

          {/* Community Rating + CoC — behavioral/conversation only */}
          {logType !== 'interview' && (
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <Label className="text-xs font-medium text-slate-500">Community Rating</Label>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCommunityRating(communityRating === n ? null : n)}
                      className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                        communityRating === n
                          ? 'bg-[#4242EA] text-white'
                          : 'bg-[#EFEFEF] text-slate-500 hover:bg-[#E3E3E3]'
                      }`}
                    >
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
                  <span className={`text-xs font-medium ${violatesCoC ? 'text-red-600' : 'text-slate-400'}`}>
                    {violatesCoC ? 'Violation' : 'No violation'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <Label className="text-xs font-medium text-slate-500">Next Steps</Label>
            <Textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Action items, referrals..."
              className="mt-1.5 min-h-[60px] text-sm"
            />
          </div>

          {/* Support case toggle */}
          <div className="border-t border-[#E3E3E3] pt-4">
            <button
              type="button"
              onClick={() => setShowSupport(!showSupport)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                showSupport ? 'text-[#4242EA]' : 'text-slate-500 hover:text-[#4242EA]'
              }`}
            >
              <Plus size={14} className={showSupport ? 'rotate-45' : ''} />
              {showSupport ? 'Remove Support Case' : 'Add Support Case'}
            </button>

            {showSupport && (
              <div className="mt-3 space-y-3 p-3 bg-[#FAFAFA] rounded-lg border border-[#E3E3E3]">
                <div>
                  <Label className="text-xs font-medium text-slate-500">
                    Support Category <span className="text-red-400">*</span>
                  </Label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    {SUPPORT_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-500">Support Disclosure</Label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sensitive details (visible only to staff/admin)</p>
                  <Textarea
                    value={supportDisclosure}
                    onChange={(e) => setSupportDisclosure(e.target.value)}
                    placeholder="Confidential details..."
                    className="mt-1 min-h-[60px] text-sm"
                  />
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
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !notes.trim() || !effectiveBuilder}
              className="bg-[#4242EA] hover:bg-[#3535c8] text-white text-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Save Log
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuilderLogModal;
