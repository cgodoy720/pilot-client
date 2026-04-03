import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../../../components/ui/select';
import { X, Users, Plus } from 'lucide-react';
import RichEmailEditor from './RichEmailEditor';

const API = import.meta.env.VITE_API_URL;

const LEAD_STATUSES = ['new', 'active', 'converted', 'withdrawn', 'inactive'];
const LEAD_SOURCES = [
  'Partner Referral Form', 'Welcome to Pursuit Form', 'NYCHA Form', 'HRA Form',
  'Hubspot General', 'Hubspot Community', 'Email'
];
const REFERRAL_SOURCES = [
  'Word of Mouth (Friend, Family, Acquaintance)', 'Government Agency',
  'Community Organization', 'Workforce Development Organization',
  'DOL Career Fair (virtual)', 'DOL Career Fair (In-person)', 'Other Career Fair',
  'Other Event', 'Google Search', 'Mailer', 'Social Media', 'NYCHA', 'HRA'
];

export default function CampaignBuilder({ token, emailLists = [], campaign, onClose, onSaved }) {
  const isEdit = !!campaign;

  const [form, setForm] = useState({
    name: '',
    subject: '',
    preheader: '',
    body_html: '',
    target_list_ids: [],
    target_statuses: [],
    target_lead_sources: [],
    target_referral_sources: [],
    target_date_from: '',
    target_date_to: '',
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
        target_list_ids: campaign.target_list_ids || [],
        target_statuses: campaign.target_statuses || [],
        target_lead_sources: campaign.target_lead_sources || [],
        target_referral_sources: campaign.target_referral_sources || [],
        target_date_from: campaign.target_date_from ? campaign.target_date_from.split('T')[0] : '',
        target_date_to: campaign.target_date_to ? campaign.target_date_to.split('T')[0] : '',
        target_emails: campaign.target_emails || [],
        scheduled_at: campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
      });
    }
  }, [campaign]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleArrayItem = (key, value) => {
    setForm(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const fetchPreviewCount = async (savedId) => {
    try {
      const res = await fetch(`${API}/api/admissions/campaigns/${savedId}/preview-count`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewCount(data.count);
      }
    } catch {}
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
        target_list_ids: form.target_list_ids.length ? form.target_list_ids : null,
        target_statuses: form.target_statuses.length ? form.target_statuses : null,
        target_lead_sources: form.target_lead_sources.length ? form.target_lead_sources : null,
        target_referral_sources: form.target_referral_sources.length ? form.target_referral_sources : null,
        target_date_from: form.target_date_from || null,
        target_date_to: form.target_date_to || null,
        target_emails: form.target_emails.length ? form.target_emails : null,
        scheduled_at: schedule && form.scheduled_at ? form.scheduled_at : null,
      };

      const url = isEdit
        ? `${API}/api/admissions/campaigns/${campaign.campaign_id}`
        : `${API}/api/admissions/campaigns`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      if (sendNow) {
        await fetch(`${API}/api/admissions/campaigns/${data.campaign_id}/send`, {
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

  const MultiSelect = ({ label, items, selectedKey }) => (
    <div>
      <Label className="font-proxima text-sm text-gray-600 mb-1 block">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
          const val = typeof item === 'object' ? item.list_id : item;
          const labelText = typeof item === 'object' ? item.name : item;
          const selected = (form[selectedKey] || []).includes(val);
          return (
            <button
              key={val}
              type="button"
              onClick={() => toggleArrayItem(selectedKey, val)}
              className={`px-2.5 py-1 rounded-full text-xs font-proxima border transition-colors ${
                selected
                  ? 'bg-[#4242ea] text-white border-[#4242ea]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea]'
              }`}
            >
              {labelText}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-proxima">
        <DialogHeader>
          <DialogTitle className="font-proxima text-lg">
            {isEdit ? 'Edit Campaign' : 'New Email Campaign'}
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
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Spring 2026 Outreach"
                className="font-proxima mt-1"
              />
            </div>
            <div>
              <Label className="font-proxima">Subject Line</Label>
              <Input
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                placeholder="e.g. Your future in tech starts here"
                className="font-proxima mt-1"
              />
            </div>
            <div>
              <Label className="font-proxima">Preheader <span className="text-gray-400 font-normal">(preview text in inbox)</span></Label>
              <Input
                value={form.preheader}
                onChange={e => set('preheader', e.target.value)}
                placeholder="Short preview shown after subject line"
                className="font-proxima mt-1"
              />
            </div>
            <div>
              <Label className="font-proxima mb-1 block">Email Body</Label>
              <RichEmailEditor
                value={form.body_html}
                onChange={v => set('body_html', v)}
                placeholder="Hi {{firstName}}, We'd love to have you at Pursuit…"
              />
            </div>
          </div>
        )}

        {/* AUDIENCE */}
        {activeSection === 'audience' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Leave all filters blank to send to all unsubscribed leads.</p>
            <MultiSelect label="Email Lists" items={emailLists} selectedKey="target_list_ids" />
            <MultiSelect label="Lead Status" items={LEAD_STATUSES} selectedKey="target_statuses" />
            <MultiSelect label="Lead Source" items={LEAD_SOURCES} selectedKey="target_lead_sources" />
            <MultiSelect label="Referral Source" items={REFERRAL_SOURCES} selectedKey="target_referral_sources" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-proxima text-sm text-gray-600">Date Created From</Label>
                <Input type="date" value={form.target_date_from} onChange={e => set('target_date_from', e.target.value)} className="mt-1 font-proxima" />
              </div>
              <div>
                <Label className="font-proxima text-sm text-gray-600">Date Created To</Label>
                <Input type="date" value={form.target_date_to} onChange={e => set('target_date_to', e.target.value)} className="mt-1 font-proxima" />
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
                <span><strong>{previewCount}</strong> leads match these filters</span>
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeSection === 'schedule' && (
          <div className="space-y-4">
            <div>
              <Label className="font-proxima">Schedule Send <span className="text-gray-400 font-normal">(optional — leave blank to send manually)</span></Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={e => set('scheduled_at', e.target.value)}
                className="mt-1 font-proxima"
              />
            </div>
            <p className="text-sm text-gray-500">
              Scheduled campaigns send automatically within one minute of the scheduled time.
              You can also skip scheduling and use <strong>Send Now</strong> below.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="flex flex-wrap gap-2 justify-between">
          <Button variant="ghost" onClick={onClose} className="font-proxima">Cancel</Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="font-proxima"
              disabled={saving}
              onClick={() => handleSave(false, false)}
            >
              Save as Draft
            </Button>
            {form.scheduled_at && (
              <Button
                variant="outline"
                className="font-proxima border-[#4242ea] text-[#4242ea]"
                disabled={saving}
                onClick={() => handleSave(false, true)}
              >
                Schedule
              </Button>
            )}
            <Button
              className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              disabled={saving}
              onClick={() => handleSave(true, false)}
            >
              {saving ? 'Sending…' : 'Send Now'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
