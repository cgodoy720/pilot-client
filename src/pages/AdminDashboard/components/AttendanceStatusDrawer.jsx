import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import { Plus, Send } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = ['present', 'late', 'absent', 'excused'];
const STATUS_COLORS = {
  present: 'bg-emerald-100 text-emerald-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-600',
  excused: 'bg-blue-100 text-blue-700',
  pending: 'bg-slate-100 text-slate-500',
};

const FILTER_LABELS = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  excused: 'Excused',
};

const AttendanceStatusDrawer = ({ open, onClose, statusFilter, builders, selectedDate, cohortName, onRefresh }) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [savingId, setSavingId] = useState(null);
  const [addingFor, setAddingFor] = useState(null);
  const [addStatus, setAddStatus] = useState('present');
  const [savingAdd, setSavingAdd] = useState(false);
  // Notify state (Phase 2 will wire backend)
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState(null);

  const filtered = useMemo(() => {
    if (!statusFilter || !builders) return builders || [];
    return builders.filter(b => statusFilter.includes(b.status));
  }, [builders, statusFilter]);

  const label = statusFilter?.map(s => FILTER_LABELS[s] || s).join(' + ') || 'All';
  const isAbsent = statusFilter?.includes('absent') && !statusFilter?.includes('present');

  const handleStatusChange = async (builder, newStatus) => {
    setSavingId(builder.userId);
    try {
      if (builder.attendanceId) {
        // Update existing record
        await fetch(`${API_URL}/api/admin/attendance/manage/record/${builder.attendanceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        });
      } else {
        // Create new record
        await fetch(`${API_URL}/api/admin/attendance/manage/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: builder.userId, attendanceDate: selectedDate, status: newStatus }),
        });
      }
      onRefresh();
    } catch (e) {
      console.error('Attendance update failed:', e);
    }
    setSavingId(null);
  };

  const handleAddRecord = async (builder) => {
    setSavingAdd(true);
    try {
      await fetch(`${API_URL}/api/admin/attendance/manage/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: builder.userId, attendanceDate: selectedDate, status: addStatus }),
      });
      setAddingFor(null);
      onRefresh();
    } catch (e) {
      console.error('Add attendance failed:', e);
    }
    setSavingAdd(false);
  };

  const handleNotify = async (channel) => {
    setNotifying(true);
    setNotifyResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/notify-builders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          channel,
          builderIds: filtered.map(b => b.userId),
          message: notifyMessage || `Hi! You were marked absent for ${cohortName} on ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Please reach out if you need to be excused.`,
          messageType: 'absence_notice',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifyResult({ sent: data.sent, failed: data.failed });
      } else {
        setNotifyResult({ error: data.error || 'Failed to send' });
      }
    } catch (e) {
      setNotifyResult({ error: e.message });
    }
    setNotifying(false);
  };

  const dateStr = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E3E3E3]">
          <SheetTitle className="text-[#1E1E1E] font-semibold flex items-center gap-2">
            {label} Builders
            <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{filtered.length}</Badge>
          </SheetTitle>
          <p className="text-xs text-slate-400 mt-0.5">{cohortName} — {dateStr}</p>
        </SheetHeader>

        <div className="px-5 py-4 space-y-3">
          {/* Absent: Notify action bar */}
          {isAbsent && filtered.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-red-700">Notify {filtered.length} absent builder{filtered.length !== 1 ? 's' : ''}</p>
              <textarea
                value={notifyMessage}
                onChange={e => setNotifyMessage(e.target.value)}
                placeholder="Custom message (optional — default absence notice will be sent)"
                className="w-full text-xs border border-red-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#4242EA] resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleNotify('slack')}
                  disabled={notifying}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#4242EA] text-white hover:bg-[#3535c8] disabled:opacity-50 transition-colors"
                >
                  <Send size={11} />
                  {notifying ? 'Sending...' : 'Send Slack DM'}
                </button>
                <button
                  onClick={() => handleNotify('email')}
                  disabled={notifying}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#E3E3E3] text-slate-600 hover:border-[#4242EA] hover:text-[#4242EA] disabled:opacity-50 transition-colors"
                >
                  <Send size={11} />
                  {notifying ? 'Sending...' : 'Send Email'}
                </button>
              </div>
              {notifyResult && (
                <p className={`text-[10px] ${notifyResult.error ? 'text-red-500' : 'text-green-600'}`}>
                  {notifyResult.error || `Sent to ${notifyResult.sent} builder${notifyResult.sent !== 1 ? 's' : ''}${notifyResult.failed > 0 ? `, ${notifyResult.failed} failed` : ''}`}
                </p>
              )}
            </div>
          )}

          {/* Builder list */}
          <div className="border border-[#E3E3E3] rounded-md overflow-hidden divide-y divide-[#EFEFEF] max-h-[500px] overflow-y-auto">
            {filtered.map(b => (
              <div key={b.userId} className="px-3 py-2.5 hover:bg-[#FAFAFA]">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1E1E1E]">{b.firstName} {b.lastName}</p>
                    <p className="text-[10px] text-slate-400">{b.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingId === b.userId ? (
                      <span className="text-[10px] text-slate-400">Saving...</span>
                    ) : (
                      <select
                        value={b.status}
                        onChange={e => handleStatusChange(b, e.target.value)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    )}
                    {!b.attendanceId && (
                      <button
                        onClick={() => setAddingFor(addingFor === b.userId ? null : b.userId)}
                        className="p-0.5 rounded text-slate-400 hover:text-[#4242EA] hover:bg-[#EFEFEF]"
                        title="Add attendance record"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {addingFor === b.userId && (
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#EFEFEF]">
                    <select
                      value={addStatus}
                      onChange={e => setAddStatus(e.target.value)}
                      className="text-[10px] border border-[#E3E3E3] rounded px-1.5 py-0.5 bg-white focus:outline-none"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddRecord(b)}
                      disabled={savingAdd}
                      className="text-[10px] px-2 py-0.5 bg-[#4242EA] text-white rounded hover:bg-[#3535c8] disabled:opacity-50"
                    >
                      {savingAdd ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setAddingFor(null)}
                      className="text-[10px] px-2 py-0.5 text-slate-500 hover:text-[#1E1E1E]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttendanceStatusDrawer;
