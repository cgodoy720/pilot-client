import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import Swal from 'sweetalert2';
import { getStageLabel } from './utils';

const STAGES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'applied', label: 'Applied' },
  { value: 'screen', label: 'Phone Screen' },
  { value: 'oa', label: 'Online Assessment' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
];

const INTERVIEW_TYPES = [
  'Phone Screen', 'Technical', 'Behavioral', 'Final Round', 'Panel', 'Take Home', 'Culture Fit'
];

const JobApplicationDetailModal = ({ application, open, onOpenChange, token, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [form, setForm] = useState({});
  const [interviewForm, setInterviewForm] = useState({
    date: '', type: '', title: '', interviewerName: '', interviewerEmail: '', contentType: '', feedback: ''
  });

  useEffect(() => {
    if (application) {
      setForm({
        companyName: application.company_name || '',
        roleTitle: application.role_title || '',
        stage: application.stage || 'prospect',
        location: application.location || '',
        jobUrl: application.job_url || '',
        salaryRange: application.salary_range || '',
        salary: application.salary || '',
        finalSalary: application.final_salary || '',
        startDate: application.start_date ? application.start_date.split('T')[0] : '',
        jobType: application.job_type || '',
        dateApplied: application.date_applied ? application.date_applied.split('T')[0] : '',
        sourceType: application.source_type || '',
        internalReferral: application.internal_referral || false,
        contactName: application.contact_name || '',
        contactTitle: application.contact_title || '',
        contactEmail: application.contact_email || '',
        contactPhone: application.contact_phone || '',
        notes: application.notes || '',
        acceptanceNotes: application.acceptance_notes || '',
        withdrawalReason: application.withdrawal_reason || ''
      });
      setIsEditing(false);
      setShowInterviewForm(false);
    }
  }, [application]);

  if (!application) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/job-applications/${application.job_application_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(form)
        }
      );

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Saved', text: 'Application updated.', timer: 1500, showConfirmButton: false });
        setIsEditing(false);
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Failed to save.' });
      }
    } catch (err) {
      console.error('Save error:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save.' });
    }
    setIsSaving(false);
  };

  const handleAddInterview = async () => {
    if (!interviewForm.date || !interviewForm.type) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Date and type are required.' });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/interviews/${application.job_application_id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(interviewForm)
        }
      );

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Interview Added', timer: 1500, showConfirmButton: false });
        setShowInterviewForm(false);
        setInterviewForm({ date: '', type: '', title: '', interviewerName: '', interviewerEmail: '', contentType: '', feedback: '' });
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Failed to add interview.' });
      }
    } catch (err) {
      console.error('Interview error:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add interview.' });
    }
  };

  const getStageBadgeVariant = (stage) => {
    const variants = {
      prospect: 'secondary', applied: 'default', screen: 'default', oa: 'default',
      interview: 'default', offer: 'default', accepted: 'default',
      rejected: 'destructive', withdrawn: 'outline'
    };
    return variants[stage] || 'secondary';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {application.company_name} - {application.role_title}
            </DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Builder Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-base font-semibold mb-2">Builder</h3>
            <div className="text-sm">
              <strong>{application.builder_first_name} {application.builder_last_name}</strong>
              <div className="text-gray-600 mt-1">{application.builder_email}</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Job Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-[#4242ea]">
                Job Information
              </h3>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label className="text-xs text-gray-600">Company</Label>
                      <Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Role</Label>
                      <Input value={form.roleTitle} onChange={e => setForm({ ...form, roleTitle: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Stage</Label>
                      <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Location</Label>
                      <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Job URL</Label>
                      <Input value={form.jobUrl} onChange={e => setForm({ ...form, jobUrl: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Salary Range</Label>
                      <Input value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Date Applied</Label>
                      <Input type="date" value={form.dateApplied} onChange={e => setForm({ ...form, dateApplied: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Source</Label>
                      <Input value={form.sourceType} onChange={e => setForm({ ...form, sourceType: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Final Salary</Label>
                      <Input value={form.finalSalary} onChange={e => setForm({ ...form, finalSalary: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Start Date</Label>
                      <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Company</div>
                      <div className="font-semibold">{application.company_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Role</div>
                      <div className="font-semibold">{application.role_title}</div>
                    </div>
                    {application.location && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Location</div>
                        <div>{application.location}</div>
                      </div>
                    )}
                    {application.job_url && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Job URL</div>
                        <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="text-[#4242ea] underline hover:text-[#3333d1]">View Job Posting</a>
                      </div>
                    )}
                    {(application.salary_range || application.salary) && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Salary</div>
                        <div>{application.salary_range || application.salary}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Stage</div>
                      <Badge variant={getStageBadgeVariant(application.stage)}>{getStageLabel(application.stage)}</Badge>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Date Applied</div>
                      <div>{new Date(application.date_applied).toLocaleDateString()}</div>
                    </div>
                    {application.source_type && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Source</div>
                        <div>{application.source_type}</div>
                      </div>
                    )}
                    {application.internal_referral && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Referral</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Internal Referral</Badge>
                      </div>
                    )}
                    {application.final_salary && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Final Salary</div>
                        <div className="font-semibold text-green-600">{application.final_salary}</div>
                      </div>
                    )}
                    {application.start_date && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Start Date</div>
                        <div>{new Date(application.start_date).toLocaleDateString()}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Contact & Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-green-500">
                Contact & Details
              </h3>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label className="text-xs text-gray-600">Contact Name</Label>
                      <Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Contact Title</Label>
                      <Input value={form.contactTitle} onChange={e => setForm({ ...form, contactTitle: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Contact Email</Label>
                      <Input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Contact Phone</Label>
                      <Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Notes</Label>
                      <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Acceptance Notes</Label>
                      <Textarea value={form.acceptanceNotes} onChange={e => setForm({ ...form, acceptanceNotes: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Withdrawal Reason</Label>
                      <Textarea value={form.withdrawalReason} onChange={e => setForm({ ...form, withdrawalReason: e.target.value })} rows={2} />
                    </div>
                  </>
                ) : (
                  <>
                    {application.contact_name && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Contact Name</div>
                        <div>{application.contact_name}</div>
                      </div>
                    )}
                    {application.contact_title && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Contact Title</div>
                        <div>{application.contact_title}</div>
                      </div>
                    )}
                    {application.contact_email && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Contact Email</div>
                        <a href={`mailto:${application.contact_email}`} className="text-[#4242ea] hover:underline">{application.contact_email}</a>
                      </div>
                    )}
                    {application.contact_phone && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Contact Phone</div>
                        <div>{application.contact_phone}</div>
                      </div>
                    )}
                    {application.interview_count > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Interviews</div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">{application.interview_count}</Badge>
                      </div>
                    )}
                    {application.stage === 'withdrawn' && application.withdrawal_reason && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Withdrawal Reason</div>
                        <div className="text-red-600">{application.withdrawal_reason}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes (read-only view) */}
          {!isEditing && application.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-purple-500">Notes</h3>
              <div className="p-4 bg-purple-50 rounded-lg text-sm leading-relaxed italic">{application.notes}</div>
            </div>
          )}

          {/* Acceptance Notes (read-only view) */}
          {!isEditing && application.acceptance_notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-green-500">Acceptance Notes</h3>
              <div className="p-4 bg-green-50 rounded-lg text-sm leading-relaxed">{application.acceptance_notes}</div>
            </div>
          )}

          {/* Add Interview Section */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Interviews</h3>
              <Button size="sm" variant="outline" onClick={() => setShowInterviewForm(!showInterviewForm)}>
                {showInterviewForm ? 'Cancel' : 'Add Interview'}
              </Button>
            </div>

            {showInterviewForm && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Date *</Label>
                    <Input type="date" value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Type *</Label>
                    <Select value={interviewForm.type} onValueChange={v => setInterviewForm({ ...interviewForm, type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Title</Label>
                    <Input value={interviewForm.title} onChange={e => setInterviewForm({ ...interviewForm, title: e.target.value })} placeholder="e.g. Round 2 with Engineering" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Interviewer Name</Label>
                    <Input value={interviewForm.interviewerName} onChange={e => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Interviewer Email</Label>
                    <Input value={interviewForm.interviewerEmail} onChange={e => setInterviewForm({ ...interviewForm, interviewerEmail: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Content Type</Label>
                    <Select value={interviewForm.contentType} onValueChange={v => setInterviewForm({ ...interviewForm, contentType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="case_study">Case Study</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Feedback</Label>
                  <Textarea value={interviewForm.feedback} onChange={e => setInterviewForm({ ...interviewForm, feedback: e.target.value })} rows={2} />
                </div>
                <Button size="sm" onClick={handleAddInterview}>Save Interview</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationDetailModal;
