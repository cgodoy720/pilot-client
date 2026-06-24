import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import useAuthStore from '../../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7002';

const BUCKETS = [['day', '7 days'], ['week', 'Week'], ['month', 'Month']];

/**
 * Attendance as a stacked bar graph (attending vs not-attending), with a
 * 7-day / Week / Month view toggle. Data from /attendance-trend?bucket=.
 */
const AttendanceTrend = ({ selectedCohortId }) => {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bucket, setBucket] = useState('week');

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/attendance-trend?bucket=${bucket}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setData([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token, bucket]);

  const max = useMemo(() => Math.max(1, ...data.map(w => w.expected || 0)), [data]);

  if (!selectedCohortId) return null;

  const noun = bucket === 'day' ? 'day' : bucket === 'month' ? 'month' : 'week';
  const fmt = (w) => bucket === 'month'
    ? new Date(String(w)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    : String(w).slice(5, 10);

  return (
    <Card className="bg-white border border-[#C8C8C8]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance by {noun}</div>
          <div className="flex items-center gap-3">
            <div className="flex gap-3 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Attending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Not attending</span>
            </div>
            <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-[11px]">
              {BUCKETS.map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setBucket(val)}
                  className={`px-2 py-0.5 transition-colors ${bucket === val ? 'bg-[#4242EA] text-white' : 'bg-white text-[#6B7280] hover:bg-gray-50'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-300 text-sm">Loading…</div>
        ) : data.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No attendance data for this range.</div>
        ) : (
          <>
            <div className="flex gap-1 h-32">
              {data.map(w => {
                const exp = w.expected || 1;
                const hPct = (exp / max) * 100;
                const aPct = (w.attending / exp) * 100;
                const nPct = (w.not_attending / exp) * 100;
                return (
                  <div
                    key={w.week}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                    title={`${noun.charAt(0).toUpperCase() + noun.slice(1)} of ${String(w.week).slice(0, 10)} — attending ${w.attending}, not attending ${w.not_attending}, excused ${w.excused}`}
                  >
                    <div className="w-full flex flex-col justify-end rounded-t overflow-hidden bg-gray-50" style={{ height: `${hPct}%` }}>
                      <div className="bg-red-400 w-full" style={{ height: `${nPct}%` }} />
                      <div className="bg-green-500 w-full" style={{ height: `${aPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>{fmt(data[0]?.week)}</span>
              <span>{fmt(data[data.length - 1]?.week)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceTrend;
