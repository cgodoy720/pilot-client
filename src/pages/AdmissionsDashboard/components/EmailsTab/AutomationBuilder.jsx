import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../../../components/ui/dialog';
import { X, Plus } from 'lucide-react';
import RichEmailEditor from './RichEmailEditor';

const API = import.meta.env.VITE_API_URL;

const TRIGGER_TYPES = [
  { value: 'days_after_account_created',      label: 'Days after account created',       audience: 'applicant' },
  { value: 'days_after_app_started',          label: 'Days after application started',   audience: 'applicant' },
  { value: 'days_after_app_submitted',        label: 'Days after application submitted', audience: 'applicant' },
  { value: 'days_after_info_session_attended',label: 'Days after info session attended', audience: 'applicant' },
  { value: 'days_after_no_action',            label: 'Days after no action',             audience: 'applicant' },
  { value: 'stage_changed_to',               label: 'Stage changed to…',                audience: 'applicant' },
  { value: 'days_after_lead_created',         label: 'Days after lead created',          audience: 'lead' },
];

const APP_STATUSES    = ['no_application', 'in_progress', 'submitted', 'withdrawn'];
const STAGES          = ['account_created', 'app_in_progress', 'app_submitted', 'info_session_invited',
                         'info_session_attended', 'workshop_invited', 'workshop_attended'];
const ADMISSION_STATUSES = ['pending', 'accepted', 'rejected', 'waitlisted'];
const ASSESSMENT_RECS    = ['strong_recommend', 'recommend', 'maybe', 'reject'];
const LEAD_STATUSES      = ['new', 'active', 'converted', 'withdrawn', 'inactive'];
const LEAD_SOURCES       = [
  'Partner Referral Form', 'Welcome to Pursuit Form', 'NYCHA Form', 'HRA Form',
  'Hubspot General', 'Hubspot Community', 'Email'
];
const REFERRAL_SOURCES   = [
  'Word of Mouth (Friend, Family, Acquaintance)', 'Government Agency',
  'Community Organization', 'Workforce Development Organization',
  'DOL Career Fair (virtual)', 'DOL Career Fair (In-person)', 'Other Career Fair',
  'Other Event', 'Google Search', 'Mailer', 'Social Media', 'NYCHA', 'HRA'
];

const BOOLEAN_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No',  value: 'false' },
];

const SECTIONS = ['content', 'trigger', 'audience', 'settings'];

export default function AutomationBuilder({ token, rule, onClose, onSaved }) {
  const isEdit = !!rule;

  const [form, setForm] = useState({
    name: '',
    description: '',
    audience: 'applicant',
    trigger_type: 'days_after_account_created',
    trigger_delay_days: 1,
    trigger_stage: '',
    subject: '',
    preheader: '',
    body_html: '',
    max_sends: 1,
    resend_interval_days: 4,
    filter_app_statuses: [],
    filter_stages: [],
    filter_admission_statuses: [],
    filter_assessment_recs: [],
    filter_info_session_attended: '',
    filter_workshop_attended: '',
    filter_lead_statuses: [],
    filter_lead_sources: [],
    filter_referral_sources: [],
    target_emails: [],
  });
  const [emailInput, setEmailInput] = useState('');
  const [activeSection, setActiveSection] = useState('content');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setForm({
        name: rule.name || '',
        description: rule.description || '',
        audience: rule.audience || 'applicant',
        trigger_type: rule.trigger_type || 'days_after_account_created',
        trigger_delay_days: rule.trigger_delay_days ?? 1,
        trigger_stage: rule.trigger_stage || '',
        subject: rule.subject || '',
        preheader: rule.preheader || '',
        body_html: rule.body_html || '',
        max_sends: rule.max_sends ?? 1,
        resend_interval_days: rule.resend_interval_days ?? 4,
        filter_app_statuses: rule.filter_app_statuses || [],
        filter_stages: rule.filter_stages || [],
        filter_admission_statuses: rule.filter_admission_statuses || [],
        filter_assessment_recs: rule.filter_assessment_recs || [],
        filter_info_session_attended: rule.filter_info_session_attended === true ? 'true'
          : rule.filter_info_session_attended === false ? 'false' : '',
        filter_workshop_attended: rule.filter_workshop_attended === true ? 'true'
          : rule.filter_workshop_attended === false ? 'false' : '',
        filter_lead_statuses: rule.filter_lead_statuses || [],
        filter_lead_sources: rule.filter_lead_sources || [],
        filter_referral_sources: rule.filter_referral_sources || [],
        target_emails: rule.target_emails || [],
      });
    }
  }, [rule]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleArray = (key, value) => {
    setForm(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  // When audience changes, reset trigger type to a valid one for that audience
  const handleAudienceChange = (val) => {
    const defaultTrigger = val === 'lead' ? 'days_after_lead_created' : 'days_after_account_created';
    setForm(f => ({ ...f, audience: val, trigger_type: defaultTrigger }));
  };

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.body_html) {
      setError('Name, subject, and email body are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        trigger_delay_days: parseInt(form.trigger_delay_days) || 1,
        max_sends: parseInt(form.max_sends) || 1,
        resend_interval_days: parseInt(form.resend_interval_days) || 4,
        filter_app_statuses: form.filter_app_statuses.length ? form.filter_app_statuses : null,
        filter_stages: form.filter_stages.length ? form.filter_stages : null,
        filter_admission_statuses: form.filter_admission_statuses.length ? form.filter_admission_statuses : null,
        filter_assessment_recs: form.filter_assessment_recs.length ? form.filter_assessment_recs : null,
        filter_info_session_attended: form.filter_info_session_attended === 'true' ? true
          : form.filter_info_session_attended === 'false' ? false : null,
        filter_workshop_attended: form.filter_workshop_attended === 'true' ? true
          : form.filter_workshop_attended === 'false' ? false : null,
        filter_lead_statuses: form.filter_lead_statuses.length ? form.filter_lead_statuses : null,
        filter_lead_sources: form.filter_lead_sources.length ? form.filter_lead_sources : null,
        filter_referral_sources: form.filter_referral_sources.length ? form.filter_referral_sources : null,
        target_emails: form.target_emails.length ? form.target_emails : null,
        trigger_stage: form.trigger_type === 'stage_changed_to' ? form.trigger_stage : null,
      };

      const url = isEdit
        ? `${API}/api/admissions/automations/${rule.rule_id}`
        : `${API}/api/admissions/automations`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Chips = ({ label, items, selectedKey }) => (
    <div>
      <Label className="font-proxima text-sm text-gray-600 mb-1 block">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
          const selected = (form[selectedKey] || []).includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleArray(selectedKey, item)}
              className={`px-2.5 py-1 rounded-full text-xs font-proxima border transition-colors ${
                selected ? 'bg-[#4242ea] text-white border-[#4242ea]'
                         : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea]'
              }`}
            >
              {item.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );

  const BooleanToggle = ({ label, fieldKey }) => (
    <div>
      <Label className="font-proxima text-sm text-gray-600 mb-1 block">{label}</Label>
      <div className="flex gap-1.5">
        {BOOLEAN_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set(fieldKey, opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-proxima border transition-colors ${
              form[fieldKey] === opt.value ? 'bg-[#4242ea] text-white border-[#4242ea]'
                                           : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const validTriggers = TRIGGER_TYPES.filter(t => t.audience === form.audience);
  const showDelay = form.trigger_type !== 'stage_changed_to';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-proxima">
        <DialogHeader>
          <DialogTitle className="font-proxima text-lg">
            {isEdit ? 'Edit Automation Rule' : 'New Automation Rule'}
          </DialogTitle>
        </DialogHeader>

        {/* Section nav */}
        <div className="flex gap-1 border-b pb-2">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-3 py-1.5 rounded text-sm font-proxima capitalize transition-colors ${
                activeSection === s ? 'bg-[#4242ea] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeSection === 'content' && (
          <div className="space-y-4">
            <div>
              <Label className="font-proxima">Rule Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Welcome — No Application" className="mt-1 font-proxima" />
            </div>
            <div>
              <Label className="font-proxima">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Brief description of when and why this email fires" className="mt-1 font-proxima" />
            </div>
            <div>
              <Label className="font-proxima">Subject Line</Label>
              <Input value={form.subject} onChange={e => set('subject', e.target.value)}
                placeholder="e.g. Start your Pursuit application today" className="mt-1 font-proxima" />
            </div>
            <div>
              <Label className="font-proxima">Preheader <span className="text-gray-400 font-normal">(preview text)</span></Label>
              <Input value={form.preheader} onChange={e => set('preheader', e.target.value)}
                placeholder="Short preview shown after subject" className="mt-1 font-proxima" />
            </div>
            <div>
              <Label className="font-proxima mb-1 block">Email Body</Label>
              <RichEmailEditor
                value={form.body_html}
                onChange={v => set('body_html', v)}
                placeholder="Hi {{firstName}}, …"
              />
            </div>
          </div>
        )}

        {/* TRIGGER */}
        {activeSection === 'trigger' && (
          <div className="space-y-4">
            {/* Audience */}
            <div>
              <Label className="font-proxima">Audience</Label>
              <div className="flex gap-2 mt-1">
                {['applicant', 'lead'].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAudienceChange(a)}
                    className={`px-4 py-2 rounded-md text-sm font-proxima border transition-colors capitalize ${
                      form.audience === a ? 'bg-[#4242ea] text-white border-[#4242ea]'
                                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger type */}
            <div>
              <Label className="font-proxima">Trigger</Label>
              <div className="mt-1 space-y-1">
                {validTriggers.map(t => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="trigger_type"
                      value={t.value}
                      checked={form.trigger_type === t.value}
                      onChange={() => set('trigger_type', t.value)}
                      className="accent-[#4242ea]"
                    />
                    <span className="font-proxima text-sm">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showDelay && (
              <div className="max-w-[200px]">
                <Label className="font-proxima">Delay (days)</Label>
                <Input
                  type="number" min={1} value={form.trigger_delay_days}
                  onChange={e => set('trigger_delay_days', e.target.value)}
                  className="mt-1 font-proxima"
                />
              </div>
            )}

            {form.trigger_type === 'stage_changed_to' && (
              <div>
                <Label className="font-proxima">Target Stage</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {STAGES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('trigger_stage', s)}
                      className={`px-2.5 py-1 rounded-full text-xs font-proxima border transition-colors ${
                        form.trigger_stage === s ? 'bg-[#4242ea] text-white border-[#4242ea]'
                                                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea]'
                      }`}
                    >
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIENCE FILTERS */}
        {activeSection === 'audience' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Leave filters blank to match all {form.audience}s (other than the trigger condition).</p>
            {form.audience === 'applicant' ? (
              <>
                <Chips label="Application Status" items={APP_STATUSES} selectedKey="filter_app_statuses" />
                <Chips label="Pipeline Stage" items={STAGES} selectedKey="filter_stages" />
                <Chips label="Admission Status" items={ADMISSION_STATUSES} selectedKey="filter_admission_statuses" />
                <Chips label="Assessment Recommendation" items={ASSESSMENT_RECS} selectedKey="filter_assessment_recs" />
                <BooleanToggle label="Info Session Attended?" fieldKey="filter_info_session_attended" />
                <BooleanToggle label="Workshop Attended?" fieldKey="filter_workshop_attended" />
              </>
            ) : (
              <>
                <Chips label="Lead Status" items={LEAD_STATUSES} selectedKey="filter_lead_statuses" />
                <Chips label="Lead Source" items={LEAD_SOURCES} selectedKey="filter_lead_sources" />
                <Chips label="Referral Source" items={REFERRAL_SOURCES} selectedKey="filter_referral_sources" />
              </>
            )}

            {/* Individual email addresses */}
            <div>
              <Label className="font-proxima text-sm text-gray-600 mb-1 block">
                Individual Email Addresses <span className="text-gray-400 font-normal">(added regardless of filters above)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const v = emailInput.trim().toLowerCase();
                      if (v && v.includes('@') && !(form.target_emails || []).includes(v)) {
                        set('target_emails', [...(form.target_emails || []), v]);
                      }
                      setEmailInput('');
                    }
                  }}
                  placeholder="name@example.com — press Enter to add"
                  className="font-proxima"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 font-proxima"
                  onClick={() => {
                    const v = emailInput.trim().toLowerCase();
                    if (v && v.includes('@') && !(form.target_emails || []).includes(v)) {
                      set('target_emails', [...(form.target_emails || []), v]);
                    }
                    setEmailInput('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(form.target_emails || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.target_emails.map(email => (
                    <span key={email} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-proxima text-blue-700">
                      {email}
                      <button
                        type="button"
                        onClick={() => set('target_emails', form.target_emails.filter(e => e !== email))}
                        className="ml-0.5 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Control how many times this automation fires per recipient and the interval between re-sends.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-proxima">Max Sends per Recipient</Label>
                <Input type="number" min={1} max={10} value={form.max_sends}
                  onChange={e => set('max_sends', e.target.value)} className="mt-1 font-proxima" />
              </div>
              <div>
                <Label className="font-proxima">Resend Interval (days)</Label>
                <Input type="number" min={1} value={form.resend_interval_days}
                  onChange={e => set('resend_interval_days', e.target.value)} className="mt-1 font-proxima" />
                <p className="text-xs text-gray-400 mt-1">Only applies when max sends &gt; 1</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose} className="font-proxima">Cancel</Button>
          <Button
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
