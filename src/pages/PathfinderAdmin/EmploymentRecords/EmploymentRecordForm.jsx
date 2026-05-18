import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = [
  { value: 'full_time',  label: 'Full-Time' },
  { value: 'part_time',  label: 'Part-Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'pro_bono',   label: 'Pro Bono' },
];

const ENGAGEMENT_STAGES = [
  { value: 'active',    label: 'Active' },
  { value: 'pipeline',  label: 'Pipeline' },
  { value: 'completed', label: 'Completed' },
  { value: 'ended',     label: 'Ended' },
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Government',
  'Retail', 'Media and Entertainment', 'Manufacturing', 'Real Estate',
  'Consulting', 'Nonprofit', 'Legal', 'Energy', 'Transportation',
  'Hospitality', 'Other',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateInput = (isoString) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

const getInitialFormData = (record) => ({
  userId:          record?.user_id          ?? '',
  roleTitle:       record?.role_title        ?? '',
  companyName:     record?.company_name      ?? '',
  employmentType:  record?.employment_type   ?? '',
  engagementStage: record?.engagement_stage  ?? 'active',
  startDate:       toDateInput(record?.start_date),
  endDate:         toDateInput(record?.end_date),
  paymentAmount:   record?.payment_amount    ?? '',
  paymentNotes:    record?.payment_notes     ?? '',
  industry:        record?.industry          ?? '',
  program:         record?.program           ?? '',
  isOwnVenture:    record?.is_own_venture    ?? false,
  collaborators:   record?.collaborators     ?? '',
  story:           record?.story             ?? '',
  notes:           record?.notes             ?? '',
});

// ─── Component ────────────────────────────────────────────────────────────────

const EmploymentRecordForm = ({ record, onSave, onClose, builders = [] }) => {
  const isEdit = Boolean(record);

  const [formData, setFormData]       = useState(() => getInitialFormData(record));
  const [errors, setErrors]           = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Searchable builder combobox state
  const [builderSearch, setBuilderSearch] = useState('');
  const [builderOpen, setBuilderOpen]     = useState(false);
  const builderRef = useRef(null);

  // Re-populate when record prop changes (e.g. parent opens for a different record)
  useEffect(() => {
    setFormData(getInitialFormData(record));
    setErrors({});

    if (record?.builder_name) {
      setBuilderSearch(record.builder_name);
    } else {
      setBuilderSearch('');
    }
  }, [record]);

  // Close builder dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (builderRef.current && !builderRef.current.contains(e.target)) {
        setBuilderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleBuilderSelect = (builder) => {
    setFormData((prev) => ({ ...prev, userId: builder.user_id }));
    setBuilderSearch(`${builder.first_name} ${builder.last_name}`);
    setBuilderOpen(false);
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: null }));
    }
  };

  const filteredBuilders = builders.filter((b) => {
    const fullName = `${b.first_name} ${b.last_name}`.toLowerCase();
    return fullName.includes(builderSearch.toLowerCase());
  });

  // ─── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const newErrors = {};

    if (!isEdit && !formData.userId) {
      newErrors.userId = 'Please select a Builder';
    }
    if (!formData.roleTitle.trim()) {
      newErrors.roleTitle = 'Role title is required';
    }
    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required';
    }
    if (!formData.engagementStage) {
      newErrors.engagementStage = 'Engagement stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Employment Record' : 'Add Employment Record'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* ── Builder (searchable combobox) ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">
              Builder {!isEdit && <span className="text-red-500">*</span>}
            </Label>

            {isEdit ? (
              <Input value={builderSearch} disabled className="bg-gray-50 text-gray-500" />
            ) : (
              <div className="relative" ref={builderRef}>
                <Input
                  placeholder="Search Builders…"
                  value={builderSearch}
                  onChange={(e) => {
                    setBuilderSearch(e.target.value);
                    setBuilderOpen(true);
                    if (!e.target.value) {
                      handleChange('userId', '');
                    }
                  }}
                  onFocus={() => setBuilderOpen(true)}
                  className={errors.userId ? 'border-red-500' : ''}
                  autoComplete="off"
                />
                {builderOpen && filteredBuilders.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    {filteredBuilders.map((b) => (
                      <button
                        key={b.user_id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleBuilderSelect(b);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#4242ea]/5 hover:text-[#4242ea] transition-colors"
                      >
                        {b.first_name} {b.last_name}
                      </button>
                    ))}
                  </div>
                )}
                {builderOpen && builderSearch && filteredBuilders.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm text-gray-400">
                    No Builders found
                  </div>
                )}
              </div>
            )}
            {errors.userId && (
              <p className="text-xs text-red-500">{errors.userId}</p>
            )}
          </div>

          {/* ── Role Title ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">
              Role Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.roleTitle}
              onChange={(e) => handleChange('roleTitle', e.target.value)}
              placeholder="e.g., Software Engineer"
              className={errors.roleTitle ? 'border-red-500' : ''}
            />
            {errors.roleTitle && (
              <p className="text-xs text-red-500">{errors.roleTitle}</p>
            )}
          </div>

          {/* ── Company Name ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">Company Name</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g., Acme Corp (leave blank for freelance/own venture)"
            />
          </div>

          {/* ── Employment Type + Engagement Stage ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">
                Employment Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employmentType}
                onValueChange={(v) => handleChange('employmentType', v)}
              >
                <SelectTrigger className={errors.employmentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employmentType && (
                <p className="text-xs text-red-500">{errors.employmentType}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">
                Engagement Stage <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.engagementStage}
                onValueChange={(v) => handleChange('engagementStage', v)}
              >
                <SelectTrigger className={errors.engagementStage ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {ENGAGEMENT_STAGES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.engagementStage && (
                <p className="text-xs text-red-500">{errors.engagementStage}</p>
              )}
            </div>
          </div>

          {/* ── Start Date + End Date ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* ── Payment Amount + Payment Notes ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Payment Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.paymentAmount}
                onChange={(e) => handleChange('paymentAmount', e.target.value)}
                placeholder="85000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Payment Notes</Label>
              <Input
                value={formData.paymentNotes}
                onChange={(e) => handleChange('paymentNotes', e.target.value)}
                placeholder="$3000/month"
              />
            </div>
          </div>

          {/* ── Industry + Program ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Industry</Label>
              <Select
                value={formData.industry || '__none__'}
                onValueChange={(v) => handleChange('industry', v === '__none__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Program</Label>
              <Input
                value={formData.program}
                onChange={(e) => handleChange('program', e.target.value)}
                placeholder="e.g., Google/Amazon SMB Pilot"
              />
            </div>
          </div>

          {/* ── Is Own Venture ── */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isOwnVenture"
              checked={formData.isOwnVenture}
              onCheckedChange={(checked) => handleChange('isOwnVenture', Boolean(checked))}
            />
            <Label htmlFor="isOwnVenture" className="text-sm font-semibold text-gray-900 cursor-pointer">
              This is the Builder's own venture
            </Label>
          </div>

          {/* ── Collaborators ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">Collaborators</Label>
            <Input
              value={formData.collaborators}
              onChange={(e) => handleChange('collaborators', e.target.value)}
              placeholder="e.g., Jane Smith, Marcus Lee"
            />
          </div>

          {/* ── Story ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-900">Story</Label>
            <Textarea
              value={formData.story}
              onChange={(e) => handleChange('story', e.target.value)}
              placeholder="Describe how this opportunity came about, what the Builder is doing, any notable context…"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* ── Notes (staff-only) ── */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <Label className="text-sm font-semibold text-gray-900">Notes</Label>
              <span className="text-xs text-amber-600 font-medium">Staff only — not visible to Builders</span>
            </div>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Internal notes, follow-up reminders, salary negotiation context…"
              rows={3}
              className="resize-none border-amber-200 focus-visible:ring-amber-300"
            />
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#4242ea] hover:bg-[#3333d1] text-white"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmploymentRecordForm;
