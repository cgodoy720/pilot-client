/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, Fragment } from 'react';
import useAuthStore from '../../../stores/authStore';
import { getLearnerRoster, getBuilderProfileSnapshot } from '../../../services/builderProfilesApi';
import { Loader2, AlertCircle, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

// ---------------------------------------------------------------------------
// LearnerProfiles — INTERNAL, temporary Coach-page tab.
// A roster-level view of the teaching-method preference onboarding extracted
// per builder, so staff can eyeball whether learning-style alignment is landing
// (distinct from Builder Snapshot, which is a per-builder deep dive). Read-only.
// ---------------------------------------------------------------------------

// Distinct hue per teaching style; greys for the neutral fallback. Kept off
// green/amber/red, which the onboarding-status chips use.
const METHOD_TONE = {
  socratic: { bg: '#EEF2FF', fg: '#4242EA' },
  direct: { bg: '#F3E8FF', fg: '#7C3AED' },
  example_based: { bg: '#E0F2FE', fg: '#0369A1' },
  inquiry_based: { bg: '#FCE7F3', fg: '#BE185D' },
  problem_based: { bg: '#FEF3C7', fg: '#B45309' },
  experiential: { bg: '#CCFBF1', fg: '#0F766E' },
  'balanced / none': { bg: '#F1F5F9', fg: '#64748B' },
};

const STATUS_TONE = {
  completed: { bg: '#DCFCE7', fg: '#15803D' },
  partial: { bg: '#FEF3C7', fg: '#B45309' },
  abandoned: { bg: '#FEE2E2', fg: '#B91C1C' },
  none: { bg: '#F1F5F9', fg: '#64748B' },
};

const prettyMethod = (m) =>
  !m ? 'balanced / none' : m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const Chip = ({ label, tone }) => (
  <span
    className="inline-block px-2 py-0.5 rounded-full text-xs font-proxima font-semibold whitespace-nowrap"
    style={{ backgroundColor: tone.bg, color: tone.fg }}
  >
    {label}
  </span>
);

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(); } catch { return '—'; }
};

// snake_case field key → "Title Case" label.
const humanize = (k) => String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// A profile envelope's `fields` may be an object map ({key: value}) or an array
// of { field, value } — normalize both to [label, value] pairs for rendering.
const fieldEntries = (fields) => {
  if (!fields) return [];
  if (Array.isArray(fields)) return fields.map((f) => [f?.field ?? '?', f?.value]);
  if (typeof fields === 'object') return Object.entries(fields);
  return [];
};

const renderVal = (v) => {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

function LearnerProfiles() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Row expansion: which userId is open + a per-user cache of the fetched
  // onboarding transcript / modality provenance (so re-opening is instant).
  const [expanded, setExpanded] = useState(null);
  const [details, setDetails] = useState({});
  const [expandTab, setExpandTab] = useState('profile'); // 'profile' | 'transcript'

  const toggleRow = useCallback(async (userId) => {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    setExpandTab('profile');
    if (details[userId]) return; // cached
    setDetails((d) => ({ ...d, [userId]: { loading: true } }));
    try {
      const snap = await getBuilderProfileSnapshot(token, userId);
      // getSnapshot nests profile fields under `profile`.
      const oa = snap?.profile?.onboarding_assessment;
      const transcript = Array.isArray(oa?.transcript)
        ? [...oa.transcript].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
        : [];
      const prov = snap?.profile?.learning_modality_preferences?.provenance;
      const modality = Array.isArray(prov) && prov.length ? prov[prov.length - 1] : null;
      const p = snap?.profile || {};
      const sections = {
        background: p.background?.fields ?? null,
        goals: p.goals?.fields ?? null,
        learning_profile: p.learning_profile?.fields ?? null,
      };
      setDetails((d) => ({ ...d, [userId]: { loading: false, transcript, modality, sections } }));
    } catch (err) {
      setDetails((d) => ({ ...d, [userId]: { loading: false, error: err?.message || 'Failed to load' } }));
    }
  }, [expanded, details, token]);

  const load = useCallback(async (cohort) => {
    setLoading(true);
    setError('');
    try {
      const res = await getLearnerRoster(token, cohort);
      setData(res);
    } catch (err) {
      setError(err?.message || 'Failed to load learner profiles');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load: no cohort arg → server defaults to the current-signup cohort.
  useEffect(() => { load(undefined); }, [load]);

  const onCohortChange = (e) => load(e.target.value);

  const selected = data?.selectedCohort || 'all';
  const summary = data?.summary;
  const rows = data?.rows || [];

  return (
    <div className="h-full overflow-y-auto bg-[#EFEFEF] font-proxima px-6 py-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="text-lg font-bold text-[#1E1E1E]">Learner Profiles</h2>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
          Internal · temporary
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={selected}
            onChange={onCohortChange}
            className="text-sm font-proxima border border-[#E3E3E3] rounded-md px-2 py-1.5 bg-white text-[#1E1E1E]"
          >
            <option value="all">All builders</option>
            {(data?.cohorts || []).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}{c.is_current ? ' (current)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => load(selected === 'all' ? 'all' : selected)}
            className="flex items-center gap-1.5 text-sm font-proxima border border-[#E3E3E3] rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 text-[#1E1E1E]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>
      <p className="text-xs text-[#666] mb-4 max-w-3xl">
        The teaching-method preference onboarding extracted per builder — to sanity-check whether
        learning-style alignment is landing. &quot;Balanced / none&quot; means no single preference
        was captured (vague answer or onboarding not completed), so the coach adapts.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-[#666] text-sm py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 text-[#B91C1C] text-sm py-6">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Summary strip */}
          <div className="bg-white border border-[#E3E3E3] rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-3 text-sm">
              <span><strong className="text-[#1E1E1E]">{summary.total}</strong> <span className="text-[#666]">builders</span></span>
              <span><strong className="text-[#15803D]">{summary.onboarded}</strong> <span className="text-[#666]">onboarded</span></span>
              <span><strong className="text-[#64748B]">{summary.notOnboarded}</strong> <span className="text-[#666]">no profile yet</span></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.byMethod)
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => (
                  <span key={method} className="inline-flex items-center gap-1.5">
                    <Chip label={prettyMethod(method)} tone={METHOD_TONE[method] || METHOD_TONE['balanced / none']} />
                    <span className="text-xs text-[#666] font-semibold">{count}</span>
                  </span>
                ))}
            </div>
          </div>

          {/* Roster table */}
          <div className="bg-white border border-[#E3E3E3] rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#666] border-b border-[#E3E3E3]">
                  <th className="px-4 py-2.5 font-semibold">Builder</th>
                  {selected === 'all' && <th className="px-4 py-2.5 font-semibold">Cohort</th>}
                  <th className="px-4 py-2.5 font-semibold">Teaching method</th>
                  <th className="px-4 py-2.5 font-semibold">Confidence</th>
                  <th className="px-4 py-2.5 font-semibold">Onboarded</th>
                  <th className="px-4 py-2.5 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[#666]">No builders in this cohort.</td></tr>
                )}
                {rows.map((r) => {
                  const methodKey = r.teaching_method || 'balanced / none';
                  const conf = r.confidence != null ? Math.round(parseFloat(r.confidence) * 100) : null;
                  const name = [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email;
                  const expandable = !!r.has_transcript; // expandable when there's a conversation to show
                  const isOpen = expanded === r.user_id;
                  const det = details[r.user_id];
                  const colSpan = selected === 'all' ? 6 : 5;
                  return (
                    <Fragment key={r.user_id}>
                      <tr
                        className={`border-b border-[#F1F1F1] last:border-0 ${expandable ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                        onClick={expandable ? () => toggleRow(r.user_id) : undefined}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {expandable ? (
                              isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#999] shrink-0" />
                                     : <ChevronRight className="w-3.5 h-3.5 text-[#999] shrink-0" />
                            ) : <span className="w-3.5 shrink-0" />}
                            <div>
                              <div className="font-medium text-[#1E1E1E]">{name}</div>
                              <div className="text-xs text-[#999]">{r.email}</div>
                            </div>
                          </div>
                        </td>
                        {selected === 'all' && <td className="px-4 py-2.5 text-[#666]">{r.cohort || '—'}</td>}
                        <td className="px-4 py-2.5">
                          <Chip label={prettyMethod(r.teaching_method)} tone={METHOD_TONE[methodKey] || METHOD_TONE['balanced / none']} />
                        </td>
                        <td className="px-4 py-2.5 text-[#666]">{conf != null ? `${conf}%` : '—'}</td>
                        <td className="px-4 py-2.5">
                          <Chip label={r.onboarded ? 'Yes' : 'No'} tone={r.onboarded ? STATUS_TONE.completed : STATUS_TONE.none} />
                          {r.partial === 'true' && r.onboarded && (
                            <span className="ml-1.5 text-[11px] text-[#B45309]" title="extraction marked partial — not all anchors covered">partial</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-[#999]">{fmtDate(r.updated_at)}</td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={colSpan} className="px-4 pb-4 pt-0">
                            {det?.loading && (
                              <div className="flex items-center gap-2 text-xs text-[#666] py-3">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading conversation…
                              </div>
                            )}
                            {det?.error && <div className="text-xs text-[#B91C1C] py-3">{det.error}</div>}
                            {det && !det.loading && !det.error && (
                              <div className="rounded-md border border-[#E3E3E3] bg-white p-4 space-y-4">
                                {/* Classification verdict */}
                                <div className="text-xs text-[#666]">
                                  Classified as{' '}
                                  <Chip label={prettyMethod(r.teaching_method)} tone={METHOD_TONE[methodKey] || METHOD_TONE['balanced / none']} />
                                  {det.modality?.confidence != null && <> · {Math.round(parseFloat(det.modality.confidence) * 100)}% confidence</>}
                                  {det.modality?.source && <> · {det.modality.source}</>}
                                </div>

                                {/* Tabs: readable profile vs. raw transcript */}
                                <div className="flex gap-1 border-b border-[#E3E3E3]">
                                  {[['profile', 'Profile'], ['transcript', 'Transcript']].map(([key, label]) => (
                                    <button
                                      key={key}
                                      onClick={() => setExpandTab(key)}
                                      className={`px-3 py-1.5 text-xs font-proxima font-semibold -mb-px border-b-2 ${expandTab === key ? 'border-[#4242EA] text-[#4242EA]' : 'border-transparent text-[#666] hover:text-[#1E1E1E]'}`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>

                                {/* Extracted profile — readable layout of the background / goals /
                                    learning_profile envelopes onboarding wrote to builder_profiles. */}
                                {expandTab === 'profile' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {[
                                    ['Background', det.sections?.background],
                                    ['Goals', det.sections?.goals],
                                    ['Learning style', det.sections?.learning_profile],
                                  ].map(([title, fields]) => {
                                    const entries = fieldEntries(fields);
                                    return (
                                      <div key={title}>
                                        <div className="text-[11px] font-bold uppercase tracking-wide text-[#4242EA] mb-2">{title}</div>
                                        {entries.length === 0 ? (
                                          <div className="text-xs text-[#999] italic">Not captured</div>
                                        ) : (
                                          <dl className="space-y-2">
                                            {entries.map(([k, v]) => (
                                              <div key={k}>
                                                <dt className="text-[11px] font-semibold text-[#888]">{humanize(k)}</dt>
                                                <dd className="text-sm text-[#1E1E1E] leading-snug">{renderVal(v)}</dd>
                                              </div>
                                            ))}
                                          </dl>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                )}

                                {/* Onboarding conversation (raw transcript) */}
                                {expandTab === 'transcript' && (
                                <div>
                                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#666] mb-2">Onboarding conversation</div>
                                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                                    {det.transcript.length === 0 && (
                                      <div className="text-xs text-[#999]">No transcript stored for this session.</div>
                                    )}
                                    {det.transcript.map((t, i) => {
                                      const isBuilder = t.role === 'builder';
                                      return (
                                        <div key={i} className={isBuilder ? 'text-right' : 'text-left'}>
                                          <div
                                            className="inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm text-left"
                                            style={isBuilder ? { background: '#EEF2FF', color: '#1E1E1E' } : { background: '#F1F5F9', color: '#334155' }}
                                          >
                                            <div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                                              {isBuilder ? 'Builder' : 'Coach'}
                                            </div>
                                            {t.content}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default LearnerProfiles;
