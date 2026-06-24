import React, { useState } from 'react';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = ['present', 'late', 'absent', 'excused'];
const STATUS_COLORS = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  late: 'bg-amber-100 text-amber-700 border-amber-200',
  absent: 'bg-red-100 text-red-600 border-red-200',
  excused: 'bg-blue-100 text-blue-700 border-blue-200',
  pending: 'bg-slate-100 text-slate-500 border-slate-200',
  no_class: 'bg-slate-100 text-slate-400 border-slate-200',
};
const EXCUSE_REASONS = ['Sick', 'Personal', 'Program Event', 'Technical Issue', 'Employment', 'Other'];

/**
 * Inline attendance control for a single builder. Renders the status select and,
 * when "Excused" is chosen, an inline excuse sub-form. Writes to the same
 * endpoints used elsewhere and calls onSaved() to let the parent refresh.
 *
 * builder: { userId, status, attendanceId, firstName?, lastName? }
 */
const AttendanceStatusSelect = ({ builder, selectedDate, onSaved }) => {
  const token = useAuthStore((s) => s.token);
  const [saving, setSaving] = useState(false);
  const [excusePending, setExcusePending] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseNote, setExcuseNote] = useState('');
  const [error, setError] = useState('');

  const writeStatus = async (newStatus) => {
    setSaving(true);
    setError('');
    try {
      const res = builder.attendanceId
        ? await fetch(`${API_URL}/api/admin/attendance/manage/record/${builder.attendanceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus }),
          })
        : await fetch(`${API_URL}/api/admin/attendance/manage/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: builder.userId, attendanceDate: selectedDate, status: newStatus }),
          });
      if (!res.ok) throw new Error(`Attendance update failed (${res.status})`);
      await onSaved?.();
    } catch (e) {
      console.error('Attendance update failed:', e);
      setError(e.message || 'Failed to update attendance');
    }
    setSaving(false);
  };

  const handleChange = (newStatus) => {
    if (newStatus === 'excused') {
      setExcusePending(true);
      setExcuseReason('');
      setExcuseNote('');
      setError('');
      return;
    }
    writeStatus(newStatus);
  };

  const submitExcuse = async () => {
    if (!excuseReason) { setError('Excuse type is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/excuses/mark-excused`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: builder.userId,
          absenceDate: selectedDate,
          excuseReason,
          excuseDetails: excuseNote || '',
          staffNotes: '',
        }),
      });
      if (!res.ok) throw new Error(`Excuse save failed (${res.status})`);
      setExcusePending(false);
      await onSaved?.();
    } catch (e) {
      console.error('Excuse failed:', e);
      setError(e.message || 'Failed to save excuse');
    }
    setSaving(false);
  };

  const cancelExcuse = () => {
    setExcusePending(false);
    setExcuseReason('');
    setExcuseNote('');
    setError('');
  };

  const displayStatus = excusePending ? 'excused' : builder.status;

  return (
    <div className="flex flex-col items-end gap-1">
      {saving ? (
        <span className="text-[10px] text-slate-400 px-2 py-0.5">Saving…</span>
      ) : (
        <select
          value={STATUS_OPTIONS.includes(displayStatus) ? displayStatus : ''}
          onChange={(e) => handleChange(e.target.value)}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${STATUS_COLORS[displayStatus] || STATUS_COLORS.pending}`}
        >
          {!STATUS_OPTIONS.includes(displayStatus) && (
            <option value="" disabled>
              {displayStatus === 'pending' ? 'Pending' : displayStatus === 'no_class' ? 'No class' : 'Set status'}
            </option>
          )}
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      )}

      {excusePending && (
        <div className="mt-1 w-56 rounded-md border border-blue-100 bg-blue-50/50 p-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 w-10 flex-shrink-0">Type *</label>
            <select
              value={excuseReason}
              onChange={(e) => { setExcuseReason(e.target.value); setError(''); }}
              className={`flex-1 text-[10px] px-2 py-1 border rounded bg-white focus:outline-none focus:border-[#4242EA] ${error && !excuseReason ? 'border-red-300' : 'border-[#E3E3E3]'}`}
            >
              <option value="">Select reason…</option>
              {EXCUSE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 w-10 flex-shrink-0">Note</label>
            <input
              type="text"
              value={excuseNote}
              onChange={(e) => setExcuseNote(e.target.value)}
              placeholder="Optional…"
              className="flex-1 text-[10px] px-2 py-1 border border-[#E3E3E3] rounded bg-white focus:outline-none focus:border-[#4242EA]"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <button onClick={cancelExcuse} className="text-[10px] px-2.5 py-1 rounded border border-[#E3E3E3] text-slate-500 hover:bg-slate-50">Cancel</button>
            <button onClick={submitExcuse} className="text-[10px] px-2.5 py-1 rounded bg-[#4242EA] text-white hover:bg-[#3535c8]">Save Excuse</button>
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 max-w-[14rem] text-right">{error}</p>}
    </div>
  );
};

export default AttendanceStatusSelect;
