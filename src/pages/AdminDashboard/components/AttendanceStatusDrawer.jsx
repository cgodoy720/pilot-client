import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import { Send } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import AttendanceStatusSelect from './AttendanceStatusSelect';

const API_URL = import.meta.env.VITE_API_URL;

const FILTER_LABELS = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  excused: 'Excused',
  no_class: 'No Class',
};

const AttendanceStatusDrawer = ({ open, onClose, statusFilter, builders, selectedDate, cohortName, onRefresh }) => {
  const token = useAuthStore((s) => s.token);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState(null);

  const filtered = useMemo(() => {
    if (!statusFilter || !builders) return builders || [];
    return builders.filter(b => statusFilter.includes(b.status));
  }, [builders, statusFilter]);

  const label = statusFilter?.map(s => FILTER_LABELS[s] || s).join(' + ') || 'All';
  const isAbsent = statusFilter?.includes('absent') && !statusFilter?.includes('present');

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
      // A 502/504 upstream error often returns HTML — parse defensively so
      // we surface the HTTP status instead of a JSON-parse stack trace.
      if (!res.ok) throw new Error(`Notify failed (${res.status})`);
      const data = await res.json().catch(() => ({ success: false, error: 'Invalid response' }));
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
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 opacity-60">
              <p className="text-xs font-medium text-slate-500">Notify {filtered.length} absent builder{filtered.length !== 1 ? 's' : ''} <span className="text-[10px] text-slate-400">(coming soon)</span></p>
              <div className="flex gap-2">
                <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-300 text-white cursor-not-allowed">
                  <Send size={11} /> Slack DM
                </button>
                <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-400 cursor-not-allowed">
                  <Send size={11} /> Email
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1E1E1E]">{b.firstName} {b.lastName}</p>
                    <p className="text-[10px] text-slate-400">{b.email}</p>
                  </div>
                  <AttendanceStatusSelect builder={b} selectedDate={selectedDate} onSaved={onRefresh} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttendanceStatusDrawer;
