import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Building2, TrendingUp, Users, Briefcase, Network, MessageSquare, ChevronDown, ChevronUp, X, ExternalLink, Loader2, Sparkles } from 'lucide-react';

const PERIODS = [
  { value: '7',  label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

function barWidth(value, max) {
  if (!max) return 0;
  return Math.max(4, Math.round((value / max) * 100));
}

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return String(d); }
}

function SignalBreakdown({ row }) {
  return (
    <div className="flex gap-2 mt-1 flex-wrap">
      {row.job_applications > 0 && (
        <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
          <Briefcase size={11} /> {row.job_applications} applied
        </span>
      )}
      {row.networking_activities > 0 && (
        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">
          <Network size={11} /> {row.networking_activities} networked
        </span>
      )}
      {row.intro_requests > 0 && (
        <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 rounded px-2 py-0.5">
          <MessageSquare size={11} /> {row.intro_requests} intro req
        </span>
      )}
    </div>
  );
}

function SignalItem({ sig }) {
  const cfg = {
    job_application: { icon: <Briefcase size={11} />, cls: 'bg-blue-50 text-blue-700' },
    networking:      { icon: <Network size={11} />,   cls: 'bg-green-50 text-green-700' },
    intro_request:   { icon: <MessageSquare size={11} />, cls: 'bg-purple-50 text-purple-700' },
  }[sig.source] || { icon: null, cls: 'bg-gray-50 text-gray-600' };

  let label = '';
  if (sig.source === 'job_application') {
    label = sig.detail ? `Applied: ${sig.detail}` : 'Applied';
  } else if (sig.source === 'networking') {
    label = sig.detail ? `Networked (${sig.detail})` : 'Networked';
    if (sig.contact_name) label += ` → ${sig.contact_name}`;
  } else if (sig.source === 'intro_request') {
    label = 'Intro request';
    if (sig.contact_name) {
      label += `: ${sig.contact_name}`;
      if (sig.contact_title) label += ` (${sig.contact_title})`;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs rounded px-2 py-0.5 ${cfg.cls}`}>
      {cfg.icon}
      {label}
      {sig.signal_date && <span className="opacity-60 ml-0.5">{fmtDate(sig.signal_date)}</span>}
    </span>
  );
}

function BuilderSignalPanel({ builders, loading, error }) {
  if (loading) return (
    <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
      <Loader2 size={14} className="animate-spin" /> Loading builder details…
    </div>
  );
  if (error) return <p className="text-xs text-red-500 py-2">{error}</p>;
  if (!builders?.length) return <p className="text-xs text-gray-400 py-2">No builder activity found.</p>;

  return (
    <div className="space-y-3 pt-1">
      {builders.map(b => (
        <div key={b.builder_id}>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">
            {b.builder_name}
            <span className="ml-1.5 text-gray-400 font-normal">({b.signals.length} signal{b.signals.length !== 1 ? 's' : ''})</span>
          </p>
          <div className="flex flex-wrap gap-1.5 pl-2">
            {b.signals.map((sig, idx) => <SignalItem key={idx} sig={sig} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function IndustryDetailPanel({ companies, loading, error }) {
  if (loading) return (
    <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
      <Loader2 size={14} className="animate-spin" /> Loading industry details…
    </div>
  );
  if (error) return <p className="text-xs text-red-500 py-2">{error}</p>;
  if (!companies?.length) return <p className="text-xs text-gray-400 py-2">No detail found.</p>;

  return (
    <div className="space-y-4 pt-1">
      {companies.map(co => (
        <div key={co.company}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {co.company}
            <span className="ml-1.5 normal-case font-normal">({co.builders.length} builder{co.builders.length !== 1 ? 's' : ''})</span>
          </p>
          <div className="pl-3 space-y-3">
            {co.builders.map(b => (
              <div key={b.builder_id}>
                <p className="text-xs font-semibold text-gray-700 mb-1">{b.builder_name}</p>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {b.signals.map((sig, idx) => <SignalItem key={idx} sig={sig} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Contact Detail Modal ──────────────────────────────────────────────────────
function ContactModal({ contactId, token, onClose }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/employment-engine/network/${contactId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        setContact(json.contact);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [contactId, token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}
        {error && <p className="text-sm text-red-600 py-4">{error}</p>}

        {contact && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{contact.full_name}</h2>
              {contact.current_title && <p className="text-sm text-gray-600 mt-0.5">{contact.current_title}</p>}
              {contact.current_company && <p className="text-sm font-medium text-pursuit-purple mt-0.5">{contact.current_company}</p>}
            </div>

            {contact.linkedin_url && (
              <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <ExternalLink size={14} /> View LinkedIn
              </a>
            )}

            {(contact.industry || contact.size_bucket || contact.stage) && (
              <div className="flex flex-wrap gap-2">
                {contact.industry && <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1">{contact.industry}</span>}
                {contact.size_bucket && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">{contact.size_bucket} employees</span>}
                {contact.stage && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 capitalize">{contact.stage}</span>}
              </div>
            )}

            {contact.staff_connections?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Staff connections</p>
                <div className="space-y-1">
                  {contact.staff_connections.map(s => (
                    <div key={s.staff_user_id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{s.staff_name}</span>
                      {s.relationship_strength && <span className="text-xs text-gray-400 capitalize">{s.relationship_strength}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contact.email && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">{contact.email}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Intro Card ────────────────────────────────────────────────────────────────
function IntroCard({ item, token, onContactClick }) {
  const [expanded, setExpanded] = useState(false);
  const [builderDetails, setBuilderDetails] = useState({});
  const connections = item.staff_connections || [];
  const builders = item.builders_targeting || [];

  const toggleBuilderDetail = (builderId) => {
    setBuilderDetails(prev => ({
      ...prev,
      [builderId]: { ...prev[builderId], open: !prev[builderId]?.open },
    }));
    if (!builderDetails[builderId]?.data && !builderDetails[builderId]?.loading) {
      setBuilderDetails(prev => ({ ...prev, [builderId]: { open: true, loading: true, data: null, error: null } }));
      fetch(
        `${import.meta.env.VITE_API_URL}/api/employment-engine/builder-insights/company-detail?company=${encodeURIComponent(item.company)}&period=all`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(r => r.json().then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok) throw new Error(j.error || 'Failed');
          // store per-builder signals from the response
          const byBuilder = {};
          for (const b of j) byBuilder[b.builder_id] = b.signals;
          setBuilderDetails(prev => {
            const next = { ...prev };
            for (const b of builders) {
              next[b.builder_id] = { open: prev[b.builder_id]?.open ?? false, loading: false, data: byBuilder[b.builder_id] || [], error: null };
            }
            return next;
          });
        })
        .catch(err => setBuilderDetails(prev => ({ ...prev, [builderId]: { ...prev[builderId], loading: false, error: err.message } })));
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
      {/* Clickable header */}
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-900 truncate">{item.company}</span>
            </div>
            <div className="flex gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users size={13} /> {item.builder_count} builder{item.builder_count !== 1 ? 's' : ''} targeting</span>
              <span>{item.total_signals} signal{item.total_signals !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {connections.map(s => (
                <span key={s.staff_id} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 font-medium">
                  {s.staff_name} · {s.contact_count} contact{s.contact_count !== 1 ? 's' : ''}
                </span>
              ))}
            </div>
          </div>
          <span className="shrink-0 text-gray-400 p-1">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {/* Builders targeting */}
          {builders.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Builders Targeting</p>
              <div className="space-y-2">
                {builders.map(b => {
                  const bd = builderDetails[b.builder_id];
                  const isOpen = bd?.open;
                  return (
                    <div key={b.builder_id}>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 rounded-full px-2.5 py-1 font-medium hover:bg-amber-100 transition-colors"
                        onClick={() => toggleBuilderDetail(b.builder_id)}
                      >
                        {b.builder_name} · {b.signal_count} signal{b.signal_count !== 1 ? 's' : ''}
                        {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      {isOpen && (
                        <div className="mt-1.5 pl-3">
                          {bd?.loading && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Loading…</span>}
                          {bd?.error && <span className="text-xs text-red-500">{bd.error}</span>}
                          {bd?.data && (
                            <div className="flex flex-wrap gap-1.5">
                              {bd.data.map((sig, idx) => <SignalItem key={idx} sig={sig} />)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff contacts */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Staff Contacts</p>
            <div className="space-y-3">
              {connections.map(s => (
                <div key={s.staff_id}>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">{s.staff_name}</p>
                  <div className="flex flex-wrap gap-2">
                    {(s.contacts || []).map(c => (
                      <button
                        key={c.contact_id}
                        onClick={(e) => { e.stopPropagation(); onContactClick(c.contact_id); }}
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                      >
                        {c.full_name}{c.current_title ? ` · ${c.current_title}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="w-5 h-4 bg-gray-200 rounded" />
      <div className="flex-1 h-4 bg-gray-200 rounded" />
      <div className="w-16 h-4 bg-gray-200 rounded" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BuilderInsights() {
  const token = useAuthStore((s) => s.token);
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState(null);

  // Drill-down state
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [expandedIndustry, setExpandedIndustry] = useState(null);
  const [companyDetails, setCompanyDetails] = useState({});
  const [industryDetails, setIndustryDetails] = useState({});

  const triggerEnrichment = async () => {
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employment-engine/enrich-builder-companies`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setEnrichMsg(
        json.new_companies > 0
          ? `Enriching ${json.new_companies} new companies in the background — refresh Top Industries in a minute.`
          : 'All builder companies are already in the queue or enriched.'
      );
    } catch {
      setEnrichMsg('Failed to start enrichment.');
    } finally {
      setEnriching(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Clear drill-down caches when period changes
      setCompanyDetails({});
      setIndustryDetails({});
      setExpandedCompany(null);
      setExpandedIndustry(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/employment-engine/builder-insights?period=${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || `HTTP ${res.status}`);
        setData(json);
      } catch (err) {
        console.error('Failed to fetch builder insights:', err);
        setError(err.message || 'Failed to load builder insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, token]);

  const toggleCompany = (company) => {
    if (expandedCompany === company) {
      setExpandedCompany(null);
      return;
    }
    setExpandedCompany(company);
    if (!companyDetails[company]) {
      setCompanyDetails(prev => ({ ...prev, [company]: { loading: true, data: null, error: null } }));
      fetch(
        `${import.meta.env.VITE_API_URL}/api/employment-engine/builder-insights/company-detail?company=${encodeURIComponent(company)}&period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(r => r.json().then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok) throw new Error(j.detail || j.error || 'Failed');
          setCompanyDetails(prev => ({ ...prev, [company]: { loading: false, data: j, error: null } }));
        })
        .catch(err => setCompanyDetails(prev => ({ ...prev, [company]: { loading: false, data: null, error: err.message } })));
    }
  };

  const toggleIndustry = (industry) => {
    if (expandedIndustry === industry) {
      setExpandedIndustry(null);
      return;
    }
    setExpandedIndustry(industry);
    if (!industryDetails[industry]) {
      setIndustryDetails(prev => ({ ...prev, [industry]: { loading: true, data: null, error: null } }));
      fetch(
        `${import.meta.env.VITE_API_URL}/api/employment-engine/builder-insights/industry-detail?industry=${encodeURIComponent(industry)}&period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(r => r.json().then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok) throw new Error(j.detail || j.error || 'Failed');
          setIndustryDetails(prev => ({ ...prev, [industry]: { loading: false, data: j, error: null } }));
        })
        .catch(err => setIndustryDetails(prev => ({ ...prev, [industry]: { loading: false, data: null, error: err.message } })));
    }
  };

  const maxCompanySignals = data?.top_companies?.[0]?.total_signals || 1;
  const maxIndustrySignals = data?.top_industries?.[0]?.total_signals || 1;

  return (
    <div className="space-y-6">
      {/* Contact detail modal */}
      {selectedContactId && (
        <ContactModal
          contactId={selectedContactId}
          token={token}
          onClose={() => setSelectedContactId(null)}
        />
      )}

      {/* Header + time filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Builder Insights</h2>
          <p className="text-sm text-gray-500">Companies and industries builders are actively targeting</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Top Companies + Top Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Companies */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-pursuit-purple" />
            <h3 className="font-semibold text-gray-900">Top Companies</h3>
            <span className="ml-auto text-xs text-gray-400">click row to see builders</span>
          </div>
          {loading ? (
            <div>{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : !data?.top_companies?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No data for this period</p>
          ) : (
            <div>
              {data.top_companies.map((row, i) => {
                const isExpanded = expandedCompany === row.company;
                const detail = companyDetails[row.company];
                return (
                  <div key={row.company} className="border-b border-gray-100 last:border-0">
                    <button
                      className="w-full py-2.5 text-left hover:bg-gray-50 transition-colors rounded px-1"
                      onClick={() => toggleCompany(row.company)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">{row.company}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users size={11} /> {row.builder_count}
                              </span>
                              <span className="text-sm font-semibold text-gray-700 w-8 text-right">{row.total_signals}</span>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-pursuit-purple rounded-full" style={{ width: `${barWidth(row.total_signals, maxCompanySignals)}%` }} />
                          </div>
                          <SignalBreakdown row={row} />
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="pb-3 pl-9 pr-2 bg-gray-50/60 rounded-b">
                        <BuilderSignalPanel builders={detail?.data} loading={detail?.loading} error={detail?.error} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Industries */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-pursuit-purple" />
            <h3 className="font-semibold text-gray-900">Top Industries</h3>
            <span className="ml-auto text-xs text-gray-400 mr-2">click to see builders</span>
            <button
              onClick={triggerEnrichment}
              disabled={enriching}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Enrich company data from builder signals"
            >
              {enriching ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {enriching ? 'Enriching…' : 'Enrich'}
            </button>
          </div>
          {enrichMsg && (
            <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded px-2.5 py-1.5">{enrichMsg}</p>
          )}
          {loading ? (
            <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : !data?.top_industries?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No industry data for this period</p>
          ) : (
            <div>
              {data.top_industries.map((row, i) => {
                const isExpanded = expandedIndustry === row.industry;
                const detail = industryDetails[row.industry];
                return (
                  <div key={row.industry} className="border-b border-gray-100 last:border-0">
                    <button
                      className="w-full py-2.5 text-left hover:bg-gray-50 transition-colors rounded px-1"
                      onClick={() => toggleIndustry(row.industry)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">{row.industry}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Users size={11} /> {row.builder_count}
                              </span>
                              <span className="text-sm font-semibold text-gray-700 w-8 text-right">{row.total_signals}</span>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${barWidth(row.total_signals, maxIndustrySignals)}%` }} />
                          </div>
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="pb-3 pl-9 pr-2 bg-gray-50/60 rounded-b">
                        <IndustryDetailPanel companies={detail?.data} loading={detail?.loading} error={detail?.error} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Introductions */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-pursuit-purple" />
          <h3 className="font-semibold text-gray-900">Suggested Introductions</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Companies builders are targeting where staff have contacts — expand to see which builders and who to connect them with
        </p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : !data?.suggested_introductions?.length ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No suggested introductions for this period — try expanding the time range
          </p>
        ) : (
          <div className="space-y-3">
            {data.suggested_introductions.map(item => (
              <IntroCard
                key={item.company}
                item={item}
                token={token}
                onContactClick={setSelectedContactId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
