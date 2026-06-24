import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ListChecks, Flag, Briefcase } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002';

/**
 * Per-builder "Coach prep" shown INLINE under each builder's name on the Today
 * tab — no click-to-expand. Reads the PERSISTED prep (batch-generated once per
 * day from the builder's logs + Slack + Compass + Pathfinder, passed in via the
 * `prep` prop), so rendering it costs no tokens. Refresh force-regenerates just
 * this builder.
 *
 * builder: { userId, firstName, lastName, ... }
 * prep:    persisted content { working_on, needs_to_do, flags, recommendation, nudges, ... } | null
 */
const CoachPrepPanel = ({ builder, cohortId, prep = null, selectedDate, generating = false }) => {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(prep);
  const [error, setError] = useState('');

  // Keep local state in sync when the saved prep prop changes (cohort/date switch
  // or after a cohort-level "Refresh prep").
  useEffect(() => { setData(prep); }, [prep]);

  // Force-regenerate THIS builder (persists server-side, overwrites today's row).
  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/builder-coach-prep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          builderId: builder.userId,
          builderName: `${builder.firstName || ''} ${builder.lastName || ''}`.trim(),
          cohortId,
          date: selectedDate,
          signals: {
            engagement_tier: builder.engagement_tier,
            attendance_status: builder.status,
            attendance_rate: builder.attendance_rate,
            is_employed: builder.is_employed,
            employment_type: builder.employment_type,
            placement_company: builder.placement?.company,
            placement_role: builder.placement?.role,
            current_profile: builder.current_profile,
            deployed_builds: builder.deployed_builds,
          },
        }),
      });
      if (!res.ok) throw new Error(`Coach prep failed (${res.status})`);
      const json = await res.json();
      setData(json.data || null);
    } catch (e) {
      console.error('Coach prep failed:', e);
      setError(e.message || 'Failed to generate coach prep');
    }
    setLoading(false);
  };

  return (
    <div className="mt-2 border-t border-[#EFEFEF] pt-2 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4242EA]">
          <Sparkles size={12} /> Coach prep
        </span>
        {data && (
          <span className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              logs {data.sources?.logs ?? 0} · compass {data.sources?.compass ?? 0} · pathfinder {data.sources?.pathfinder ?? 0} · slack {data.sources?.slack ?? 0}
            </span>
            <button onClick={refresh} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#4242EA]">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 py-1.5">
          <div className="w-3.5 h-3.5 border-2 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
          Regenerating from logs, Compass, Pathfinder & Slack…
        </div>
      ) : error ? (
        <div className="flex items-center justify-between px-2 py-1.5 bg-red-50 border border-red-200 rounded text-red-700">
          <span>{error}</span>
          <button onClick={refresh} className="underline ml-2">Retry</button>
        </div>
      ) : data ? (
        <div className="space-y-2.5">
          {data.flags?.length > 0 && (
            <div className="flex items-start gap-1.5 flex-wrap">
              <Flag size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
              {data.flags.map((f, i) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">{f}</span>
              ))}
            </div>
          )}

          {data.nudges?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1 flex items-center gap-1">
                <Briefcase size={11} className="text-emerald-600" /> Job-search nudges
              </div>
              <ul className="space-y-0.5 text-[#374151] list-disc list-inside">
                {data.nudges.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {data.working_on?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Working on</div>
              <ul className="space-y-0.5 text-[#374151] list-disc list-inside">
                {data.working_on.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {data.needs_to_do?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1 flex items-center gap-1">
                <ListChecks size={11} className="text-[#4242EA]" /> Needs to do
              </div>
              <ul className="space-y-0.5 text-[#374151] list-disc list-inside">
                {data.needs_to_do.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {data.latest_log?.note && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Latest log{data.latest_log.date ? ` · ${new Date(data.latest_log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
              </div>
              <p className="text-[#374151] leading-relaxed">“{data.latest_log.note}”</p>
            </div>
          )}

          {data.recommendation && (
            <p className="text-[#374151] bg-[#F5F5FF] border border-[#E3E3F5] rounded p-2 leading-relaxed">
              {data.recommendation}
            </p>
          )}

          {data.ai_synthesized === false && (
            <p className="text-[10px] text-slate-400">Assembled from sources — AI synthesis activates once the model key is configured.</p>
          )}
        </div>
      ) : generating ? (
        <div className="flex items-center gap-2 text-slate-400 py-1.5">
          <div className="w-3.5 h-3.5 border-2 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
          Preparing prep…
        </div>
      ) : (
        <div className="text-slate-400 py-1">No prep yet — it generates automatically.</div>
      )}
    </div>
  );
};

export default CoachPrepPanel;
