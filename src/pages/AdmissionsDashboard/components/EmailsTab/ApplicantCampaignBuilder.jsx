import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../../../components/ui/dialog';
import { Users, Plus, X } from 'lucide-react';
import RichEmailEditor from './RichEmailEditor';

const API = import.meta.env.VITE_API_URL;

const APP_STATUSES      = ['no_application', 'in_progress', 'submitted', 'withdrawn'];
const STAGES            = ['account_created', 'app_in_progress', 'app_submitted', 'info_session_invited',
                           'info_session_attended', 'workshop_invited', 'workshop_attended'];
const ADMISSION_STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'];
const ASSESSMENT_RECS   = ['strong_recommend', 'recommend', 'maybe', 'reject'];
const BOOLEAN_OPTIONS   = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No',  value: 'false' },
];

export default function ApplicantCampaignBuilder({ token, campaign, onClose, onSaved }) {
  const isEdit = !!campaign;

  const [form, setForm] = useState({
    name: '',
    subject: '',
    preheader: '',
    body_html: '',
    filter_app_statuses: [],
    filter_stages: [],
    filter_admission_statuses: [],
    filter_assessment_recs: [],
    filter_info_session_attended: '',
    filter_workshop_attended: '',
    filter_date_from: '',
    filter_date_to: '',
    target_emails: [],
    scheduled_at: '',
  });
  const [emailInput, setEmailInput] = useState('');
  const [previewCount, setPreviewCount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('content');

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name || '',
        subject: campaign.subject || '',
        preheader: campaign.preheader || '',
        body_html: campaign.body_html || '',
        filter_app_statuses: campaign.filter_app_statuses || [],
        filter_stages: campaign.filter_stages || [],
        filter_admission_statuses: campaign.filter_admission_statuses || [],
        filter_assessment_recs: campaign.filter_assessment_recs || [],
        filter_info_session_attended: campaign.filter_info_session_attended === true ? 'true'
          : campaign.filter_info_session_attended === false ? 'false' : '',
        filter_workshop_attended: campaign.filter_workshop_attended === true ? 'true'
          : campaign.filter_workshop_attended === false ? 'false' : '',
        filter_date_from: campaign.filter_date_from ? campaign.filter_date_from.split('T')[0] : '',
        filter_date_to: campaign.filter_date_to ? campaign.filter_date_to.split('T')[0] : '',
        target_emails: campaign.target_emails || [],
        scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
      });
    }
  }, [campaign]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleArray = (key, value) => {
    setForm(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const fetchPreviewCount = async (savedId) => {
    try {
      const res = await fetch(`${API}/api/admissions/applicant-campaigns/${savedId}/preview-count`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewCount(data.count);
      } else {
        setPreviewCount(null);
      }
    } catch {
      setPreviewCount(null);
    }
  };

  const handleSave = async (sendNow = false, schedule = false) => {
    if (!form.name || !form.subject || !form.body_html) {
      setError('Name, subject, and email body are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        filter_app_statuses: form.filter_app_statuses.length ? form.filter_app_statuses : null,
        filter_stages: form.filter_stages.length ? form.filter_stages : null,
        filter_admission_statuses: form.filter_admission_statuses.length ? form.filter_admission_statuses : null,
        filter_assessment_recs: form.filter_assessment_recs.length ? form.filter_assessment_recs : null,
        filter_info_session_attended: form.filter_info_session_attended === 'true' ? true
          : form.filter_info_session_attended === 'false' ? false : null,
        filter_workshop_attended: form.filter_workshop_attended === 'true' ? true
          : form.filter_workshop_attended === 'false' ? false : null,
        filter_date_from: form.filter_date_from || null,
        filter_date_to: form.filter_date_to || null,
        target_emails: form.target_emails.length ? form.target_emails : null,
        scheduled_at: schedule && form.scheduled_at ? form.scheduled_at : null,
      };

      const url = isEdit
        ? `${API}/api/admissions/applicant-campaigns/${campaign.campaign_id}`
        : `${API}/api/admissions/applicant-campaigns`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      if (sendNow) {
        await fetch(`${API}/api/admissions/applicant-campaigns/${data.campaign_id}/send`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-proxima">
        <DialogHeader>
          <DialogTitle className="font-proxima text-lg">
            {isEdit ? 'Edit Applicant Campaign' : 'New Applicant Campaign'}
          </DialogTitle>
        </DialogHeader>

        {/* Section nav */}
        <div className="flex gap-1 border-b pb-2">
          {['content', 'audience', 'schedule'].map(s => (
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
              <Label className="font-proxima">Campaign Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Workshop Invite — Spring 2026" className="font-proxima mt-1" />
            </div>
            <div>
              <Label className="font-proxima">Subject Line</Label>
              <Input value={form.subject} onChange={e => set('subject', e.target.value)}
                placeholder="e.g. You're invited to a Pursuit workshop" className="font-proxima mt-1" />
            </div>
            <div>
              <Label className="font-proxima">Preheader <span className="text-gray-400 font-normal">(preview text)</span></Label>
              <Input value={form.preheader} onChange={e => set('preheader', e.target.value)}
                placeholder="Short preview shown after subject" className="font-proxima mt-1" />
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

        {/* AUDIENCE */}
        {activeSection === 'audience' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Leave all filters blank to send to all active applicants.</p>
            <Chips label="Application Status" items={APP_STATUSES} selectedKey="filter_app_statuses" />
            <Chips label="Pipeline Stage" items={STAGES} selectedKey="filter_stages" />
            <Chips label="Admission Status" items={ADMISSION_STATUSES} selectedKey="filter_admission_statuses" />
            <Chips label="Assessment Recommendation" items={ASSESSMENT_RECS} selectedKey="filter_assessment_recs" />
            <BooleanToggle label="Info Session Attended?" fieldKey="filter_info_session_attended" />
            <BooleanToggle label="Workshop Attended?" fieldKey="filter_workshop_attended" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-proxima text-sm text-gray-600">Account Created From</Label>
                <Input type="date" value={form.filter_date_from} onChange={e => set('filter_date_from', e.target.value)}
                  className="mt-1 font-proxima" />
              </div>
              <div>
                <Label className="font-proxima text-sm text-gray-600">Account Created To</Label>
                <Input type="date" value={form.filter_date_to} onChange={e => set('filter_date_to', e.target.value)}
                  className="mt-1 font-proxima" />
              </div>
            </div>
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

            {previewCount !== null && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-700">
                <Users className="h-4 w-4" />
                <span><strong>{previewCount}</strong> applicants match these filters</span>
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeSection === 'schedule' && (
          <div className="space-y-4">
            <div>
              <Label className="font-proxima">Schedule Send <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input type="datetime-local" value={form.scheduled_at}
                onChange={e => set('scheduled_at', e.target.value)} className="mt-1 font-proxima" />
            </div>
            <p className="text-sm text-gray-500">
              Scheduled campaigns send automatically within one minute of the scheduled time.
              You can also use <strong>Send Now</strong> below.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="flex flex-wrap gap-2 justify-between">
          <Button variant="ghost" onClick={onClose} className="font-proxima">Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline" className="font-proxima" disabled={saving}
              onClick={() => handleSave(false, false)}>
              Save as Draft
            </Button>
            {form.scheduled_at && (
              <Button variant="outline" className="font-proxima border-[#4242ea] text-[#4242ea]"
                disabled={saving} onClick={() => handleSave(false, true)}>
                Schedule
              </Button>
            )}
            <Button className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima" disabled={saving}
              onClick={() => handleSave(true, false)}>
              {saving ? 'Sending…' : 'Send Now'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
