import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../components/ui/collapsible';
import { ChevronDown, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// ── Label maps ────────────────────────────────────────────────────────────────

const INTEREST_LABELS = {
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  ai_ml: 'AI / ML',
  edtech: 'EdTech',
  ecommerce: 'E-Commerce',
  cybersecurity: 'Cybersecurity',
  enterprise_saas: 'Enterprise SaaS',
  consumer_apps: 'Consumer Apps',
  real_estate: 'Real Estate',
  gov_civic_tech: 'Gov / Civic Tech',
  media_entertainment: 'Media & Entertainment',
  consumer_services: 'Consumer Services',
  other: 'Other',
};

const EMPLOYMENT_PATH_LABELS = {
  role_based: 'Traditional Employment',
  mode_based: 'Contract / Freelance',
  both: 'Open to Both',
};

const TIMELINE_LABELS = {
  '1_month': '1 month',
  '3_months': '3 months',
  '6_months': '6 months',
  '1_year': '1 year',
  exploring: 'still exploring',
};

const COMPANY_STAGE_LABELS = {
  startup: 'Startups',
  growth: 'Growth-stage',
  enterprise: 'Enterprise',
  any: 'Any Stage',
};

const TARGET_PEOPLE_OPTIONS = [
  { value: 'founders', label: 'Founders' },
  { value: 'operators', label: 'Operators' },
  { value: 'engineers', label: 'Engineers' },
  { value: 'hiring_managers', label: 'Hiring Managers' },
  { value: 'investors', label: 'Investors' },
  { value: 'community_builders', label: 'Community Builders' },
  { value: 'recruiters', label: 'Recruiters' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildGoalStatement(data) {
  const interest = INTEREST_LABELS[data.primary_interest] || data.primary_interest;
  const path = EMPLOYMENT_PATH_LABELS[data.employment_path] || data.employment_path;
  if (data.timeline === 'exploring') {
    return `Targeting ${interest} · ${path} · Still exploring timelines`;
  }
  const timeline = TIMELINE_LABELS[data.timeline] || data.timeline;
  return `Targeting ${interest} · ${path} · Landing in ${timeline}`;
}

function isAtLeastTwoWeeksOld(dateStr) {
  if (!dateStr) return false;
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return new Date(dateStr) <= twoWeeksAgo;
}

function interestsToForm(data) {
  return {
    primaryInterest: data.primary_interest || '',
    skills: data.skills || '',
    employmentPath: data.employment_path || '',
    targetPeople: data.target_people || [],
    targetCompanyStage: data.target_company_stage || '',
    timeline: data.timeline || '',
  };
}

const EMPTY_FORM = {
  primaryInterest: '',
  skills: '',
  employmentPath: '',
  targetPeople: [],
  targetCompanyStage: '',
  timeline: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

function MyStrategy() {
  const { token } = useAuth();

  const [interests, setInterests] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Reflection modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionData, setReflectionData] = useState({ whatTried: '', whyChanging: '' });
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isLoggingReflection, setIsLoggingReflection] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, [token]);

  const fetchInterests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/pathfinder/interests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch interests');
      const data = await response.json();
      setInterests(data);
      if (data) {
        setFormData(interestsToForm(data));
        setIsOpen(false);
      } else {
        setFormData(EMPTY_FORM);
        setIsOpen(true); // Auto-expand on first visit
      }
    } catch (error) {
      console.error('Error fetching Builder interests:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Could not load your strategy',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetPeopleToggle = (value) => {
    setFormData((prev) => {
      const current = prev.targetPeople;
      return {
        ...prev,
        targetPeople: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const validateForm = () => {
    if (!formData.primaryInterest) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Select a target industry', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return false;
    }
    if (!formData.employmentPath) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Select an employment path', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return false;
    }
    if (!formData.timeline) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Select a target timeline', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Changing primary interest after ≥2 weeks → require a reflection log first
    if (
      interests &&
      formData.primaryInterest !== interests.primary_interest &&
      isAtLeastTwoWeeksOld(interests.updated_at)
    ) {
      setPendingFormData(formData);
      setReflectionData({ whatTried: '', whyChanging: '' });
      setShowReflectionModal(true);
      return;
    }

    saveInterests(formData);
  };

  const saveInterests = async (data) => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/api/pathfinder/interests`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryInterest: data.primaryInterest,
          skills: data.skills || null,
          employmentPath: data.employmentPath,
          targetPeople: data.targetPeople.length > 0 ? data.targetPeople : null,
          targetCompanyStage: data.targetCompanyStage || null,
          timeline: data.timeline,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save strategy');
      }

      const saved = await response.json();
      setInterests(saved);
      setFormData(interestsToForm(saved));
      setIsOpen(false);

      Swal.fire({
        toast: true,
        icon: 'success',
        title: interests ? 'Strategy updated!' : 'Strategy saved!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error saving Builder interests:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Could not save strategy',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReflection = async () => {
    if (!pendingFormData) return;
    try {
      setIsLoggingReflection(true);

      const changeResponse = await fetch(`${API_URL}/api/pathfinder/interests/change`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousInterest: interests.primary_interest,
          newInterest: pendingFormData.primaryInterest,
          whatTried: reflectionData.whatTried || null,
          whyChanging: reflectionData.whyChanging || null,
        }),
      });

      if (!changeResponse.ok) {
        const err = await changeResponse.json();
        throw new Error(err.error || 'Failed to log interest change');
      }

      setShowReflectionModal(false);
      await saveInterests(pendingFormData);
      setPendingFormData(null);
    } catch (error) {
      console.error('Error logging interest change:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Could not log your reflection',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setIsLoggingReflection(false);
    }
  };

  const handleCancelEdit = () => {
    if (interests) {
      setFormData(interestsToForm(interests));
    } else {
      setFormData(EMPTY_FORM);
    }
    setIsOpen(false);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mb-6 px-5 py-4 bg-white border border-[#e0e0e0] rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e0e0e0]" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-[#e0e0e0] rounded w-32" />
            <div className="h-3 bg-[#e0e0e0] rounded w-72" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="mb-6 border border-[#e0e0e0] rounded-xl bg-white overflow-hidden">

          {/* ── Header / Trigger ── */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(66,66,234,0.03)] transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[rgba(66,66,234,0.1)] flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-[#4242ea]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">My Strategy</p>
                  {interests ? (
                    <p className="text-sm text-[#666666] mt-0.5 truncate">
                      {buildGoalStatement(interests)}
                    </p>
                  ) : (
                    <p className="text-sm text-[#999999] mt-0.5">
                      Define your job search focus to get started
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {interests && !isOpen && (
                  <Badge
                    variant="outline"
                    className="text-[#4242ea] border-[#4242ea]/30 bg-[rgba(66,66,234,0.05)] text-xs font-medium"
                  >
                    Edit
                  </Badge>
                )}
                {!interests && !isOpen && (
                  <Badge className="bg-[#4242ea] text-white text-xs font-medium">
                    Get started
                  </Badge>
                )}
                <ChevronDown
                  size={18}
                  className={`text-[#999999] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
          </CollapsibleTrigger>

          {/* ── Expanded Form ── */}
          <CollapsibleContent>
            <div className="border-t border-[#e0e0e0] px-5 py-5 space-y-5">

              {/* Target Industry */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Target Industry <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.primaryInterest}
                  onValueChange={(v) => handleFieldChange('primaryInterest', v)}
                >
                  <SelectTrigger className="bg-white border-[#e0e0e0]">
                    <SelectValue placeholder="Select your primary focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTEREST_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment Path */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Employment Path <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(EMPLOYMENT_PATH_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleFieldChange('employmentPath', value)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        formData.employmentPath === value
                          ? 'bg-[#4242ea] border-[#4242ea] text-white'
                          : 'bg-white border-[#e0e0e0] text-[#666666] hover:border-[#4242ea]/40 hover:text-[#4242ea]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Timeline */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Target Timeline <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(v) => handleFieldChange('timeline', v)}
                >
                  <SelectTrigger className="bg-white border-[#e0e0e0]">
                    <SelectValue placeholder="When do you want to land?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="1_year">1 Year</SelectItem>
                    <SelectItem value="exploring">Still Exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Key Skills (optional) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Key Skills{' '}
                  <span className="text-[#999999] font-normal text-xs ml-1">optional</span>
                </Label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleFieldChange('skills', e.target.value)}
                  placeholder="e.g., React, Node.js, data analysis, product thinking..."
                  rows={2}
                  className="resize-none bg-white border-[#e0e0e0] text-sm"
                />
              </div>

              {/* Company Stage (optional) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Company Stage{' '}
                  <span className="text-[#999999] font-normal text-xs ml-1">optional</span>
                </Label>
                <Select
                  value={formData.targetCompanyStage}
                  onValueChange={(v) => handleFieldChange('targetCompanyStage', v)}
                >
                  <SelectTrigger className="bg-white border-[#e0e0e0]">
                    <SelectValue placeholder="What stage companies interest you?" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPANY_STAGE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target People (optional, multi-select checkboxes) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#1a1a1a]">
                  Who Do You Want to Connect With?{' '}
                  <span className="text-[#999999] font-normal text-xs ml-1">optional</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGET_PEOPLE_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-[#e0e0e0] cursor-pointer hover:border-[#4242ea]/40 transition-colors"
                    >
                      <Checkbox
                        checked={formData.targetPeople.includes(value)}
                        onCheckedChange={() => handleTargetPeopleToggle(value)}
                        className="data-[state=checked]:bg-[#4242ea] data-[state=checked]:border-[#4242ea]"
                      />
                      <span className="text-sm text-[#1a1a1a]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="text-[#666666] border-[#e0e0e0]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-[#4242ea] hover:bg-[#3535c9] text-white font-semibold px-6"
                >
                  {isSaving ? 'Saving...' : interests ? 'Update Strategy' : 'Save Strategy'}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* ── Reflection Modal ─────────────────────────────────────────────────── */}
      {/* Triggered when changing primary interest after ≥2 weeks on the same focus */}
      <Dialog
        open={showReflectionModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowReflectionModal(false);
            setPendingFormData(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a1a]">
              Changing Your Focus
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-[#666666]">
              You're switching from{' '}
              <span className="font-semibold text-[#1a1a1a]">
                {INTEREST_LABELS[interests?.primary_interest] || interests?.primary_interest}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#4242ea]">
                {INTEREST_LABELS[pendingFormData?.primaryInterest] || pendingFormData?.primaryInterest}
              </span>
              . Take a moment to reflect on what you've learned.
            </p>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1a1a1a]">
                What did you try in{' '}
                {INTEREST_LABELS[interests?.primary_interest] || interests?.primary_interest}?
              </Label>
              <Textarea
                value={reflectionData.whatTried}
                onChange={(e) =>
                  setReflectionData((prev) => ({ ...prev, whatTried: e.target.value }))
                }
                placeholder="Applications submitted, events attended, skills developed..."
                rows={3}
                className="resize-none bg-white border-[#e0e0e0] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1a1a1a]">
                Why are you changing direction?
              </Label>
              <Textarea
                value={reflectionData.whyChanging}
                onChange={(e) =>
                  setReflectionData((prev) => ({ ...prev, whyChanging: e.target.value }))
                }
                placeholder="What's drawing you toward this new direction?"
                rows={3}
                className="resize-none bg-white border-[#e0e0e0] text-sm"
              />
            </div>

            <p className="text-xs text-[#999999]">
              Both fields are optional — your reflection is saved privately for your own reference.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReflectionModal(false);
                setPendingFormData(null);
              }}
              disabled={isLoggingReflection}
              className="text-[#666666] border-[#e0e0e0]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReflection}
              disabled={isLoggingReflection}
              className="bg-[#4242ea] hover:bg-[#3535c9] text-white font-semibold"
            >
              {isLoggingReflection ? 'Saving...' : 'Save Reflection & Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyStrategy;
