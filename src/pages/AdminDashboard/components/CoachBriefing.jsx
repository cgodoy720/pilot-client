import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, ChevronDown, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import useAuthStore from '../../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7002';

const LEVEL_DOT = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };

/**
 * AI daily coach briefing for the Today tab — cohort-level prioritization:
 * what to focus on + which builders to prioritize + visibility gaps.
 * Synthesized from facilitator logs (+ signals); reads the cohort_briefings cache.
 */
const CoachBriefing = ({ selectedCohortId, refreshKey = 0 }) => {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [showAllRanked, setShowAllRanked] = useState(false);

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/dashboard/cohort-briefing?cohortId=${selectedCohortId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (!cancelled) setData(j.data || null); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token, refreshKey]);

  if (loading) {
    return (
      <Card className="bg-[#F5F5FF] border border-[#E3E3F5]">
        <CardContent className="p-4 flex items-center gap-2 text-sm text-slate-400">
          <Sparkles size={15} className="text-[#4242EA]" /> Generating today’s coach briefing…
        </CardContent>
      </Card>
    );
  }

  // No briefing yet (e.g. before the engine runs) — stay quiet rather than show an empty box.
  if (!data) return null;

  const { priorities = [], ranked_builders = [], visibility_gaps = [], recent_logs = [] } = data;
  const highRisk = ranked_builders.filter(b => b.level === 'high');
  const otherRanked = ranked_builders.filter(b => b.level !== 'high');

  return (
    <Card className="bg-[#F5F5FF] border border-[#E3E3F5]">
      <CardContent className="p-4">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
            <Sparkles size={15} className="text-[#4242EA]" /> Today’s coach briefing
            <span className="text-[11px] font-normal text-slate-400">AI · logs · Slack</span>
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="mt-3 space-y-4">
            {/* The read — synthesized narrative for the coach */}
            {data.summary && (
              <p className="text-sm text-[#1A1A1A] leading-relaxed bg-white border border-[#E3E3F5] rounded-md p-3">
                {data.summary}
              </p>
            )}

            {/* Gone dark — recently silent across all signals, no logged reason */}
            {data.gone_dark?.length > 0 && (
              <div className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-md p-2.5">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">
                  <span className="font-semibold">Recently went dark — send a check-in:</span> {data.gone_dark.join(', ')}
                  <span className="text-red-400"> (no attendance, logs, Compass, or Slack in 2–6 weeks)</span>
                </span>
              </div>
            )}

            {/* High risk — focus first */}
            {highRisk.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-red-500 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> High risk — focus first
                </div>
                <div className="space-y-1.5">
                  {highRisk.map((b) => (
                    <div key={b.user_id} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                          {b.name} <span className="text-[11px] font-normal text-slate-400">· {b.type}</span>
                        </div>
                        <div className="text-xs text-[#6B7280]">{b.why}</div>
                        {b.action && <div className="text-xs text-[#4242EA] mt-0.5">→ {b.action}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What to prioritize */}
            {priorities.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Prioritize today</div>
                <ul className="space-y-1 text-sm text-[#374151]">
                  {priorities.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#4242EA] mt-0.5">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Also watch — medium/low priority, top 5 then expand */}
            {otherRanked.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Also watch</div>
                <div className="space-y-1.5">
                  {(showAllRanked ? otherRanked : otherRanked.slice(0, 5)).map((b) => (
                    <div key={b.user_id} className="flex items-start gap-2 bg-white border border-[#E3E3E3] rounded-md px-3 py-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${LEVEL_DOT[b.level] || 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                          {b.name} <span className="text-[11px] font-normal text-slate-400">· {b.type}</span>
                        </div>
                        <div className="text-xs text-[#6B7280]">{b.why}</div>
                        {b.action && <div className="text-xs text-[#4242EA] mt-0.5">→ {b.action}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                {otherRanked.length > 5 && (
                  <button
                    onClick={() => setShowAllRanked(s => !s)}
                    className="mt-2 text-xs font-medium text-[#4242EA] hover:underline"
                  >
                    {showAllRanked ? 'Show top 5' : `Show all ${otherRanked.length}`}
                  </button>
                )}
              </div>
            )}

            {/* Recommended actions — synthesized across Slack + logs + job-search state */}
            {(() => {
              const recs = data.recommended_actions || data.slack_recommendations || data.slack || [];
              const renderRec = (s) => {
                const idx = s.indexOf(' — ');
                if (idx > -1) {
                  return (
                    <>
                      <span className="font-medium text-[#1A1A1A]">{s.slice(0, idx)}</span>
                      <span className="text-[#6B7280]"> — {s.slice(idx + 3)}</span>
                    </>
                  );
                }
                return <span className="text-[#374151]">{s}</span>;
              };
              return (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#4242EA]/10 text-[#4242EA] flex-shrink-0">
                      <MessageSquare size={12} />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recommended actions</span>
                    <span className="text-[10px] font-normal normal-case text-slate-400">· from Slack + logs</span>
                    {recs.length > 0 && <span className="text-[10px] text-slate-400">({recs.length})</span>}
                  </div>
                  {recs.length > 0 ? (
                    <div className="space-y-1.5">
                      {recs.map((s, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E3E3F5] border-l-[3px] border-l-[#4242EA] rounded-md px-3 py-2 text-sm leading-snug hover:shadow-sm transition-shadow"
                        >
                          {renderRec(s)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#C8C8C8] rounded-md px-3 py-2.5 text-xs text-slate-400 bg-white/50">
                      No Slack-derived actions right now (or the Fellowship workspace isn’t connected in this environment).
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Latest log updates */}
            {recent_logs.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Latest log updates</div>
                <ul className="space-y-1 text-sm text-[#374151]">
                  {recent_logs.map((s, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-[#4242EA] mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Visibility gaps */}
            {visibility_gaps.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <AlertTriangle size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span><span className="font-medium">{visibility_gaps.length} no-data builders</span> (close the gap): {visibility_gaps.join(', ')}</span>
              </div>
            )}

            {data.long_inactive_count > 0 && (
              <p className="text-[11px] text-slate-400">
                {data.long_inactive_count} builders inactive 6+ weeks — likely withdraw from the active roster.
              </p>
            )}

            {data.generated_at && (
              <div className="text-[10px] text-slate-400">Generated {new Date(data.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoachBriefing;
