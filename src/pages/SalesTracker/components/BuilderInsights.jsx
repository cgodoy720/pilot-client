import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/api';
import { Building2, TrendingUp, Users, Briefcase, Network, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const getToken = () => localStorage.getItem('token');

const PERIODS = [
  { value: '7',  label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

// Returns width% for the signal bar relative to the max
function barWidth(value, max) {
  if (!max) return 0;
  return Math.max(4, Math.round((value / max) * 100));
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

function IntroCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const connections = item.staff_connections || [];

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
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
        <button
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 text-gray-400 hover:text-gray-600 p-1"
          aria-label={expanded ? 'Collapse contacts' : 'Expand contacts'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
          {connections.map(s => (
            <div key={s.staff_id}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{s.staff_name}</p>
              <div className="flex flex-wrap gap-2">
                {(s.contacts || []).map(c => (
                  <span key={c.contact_id} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700">
                    {c.full_name}{c.current_title ? ` · ${c.current_title}` : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
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

export default function BuilderInsights() {
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetchWithAuth(
          `/api/employment-engine/builder-insights?period=${period}`,
          {},
          token
        );
        setData(res);
      } catch (err) {
        console.error('Failed to fetch builder insights:', err);
        setError('Failed to load builder insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const maxCompanySignals = data?.top_companies?.[0]?.total_signals || 1;
  const maxIndustrySignals = data?.top_industries?.[0]?.total_signals || 1;

  return (
    <div className="space-y-6">
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
          </div>

          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : !data?.top_companies?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No data for this period</p>
          ) : (
            <div className="space-y-0">
              {data.top_companies.map((row, i) => (
                <div key={row.company} className="py-2.5 border-b border-gray-100 last:border-0">
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
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pursuit-purple rounded-full"
                          style={{ width: `${barWidth(row.total_signals, maxCompanySignals)}%` }}
                        />
                      </div>
                      <SignalBreakdown row={row} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Industries */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-pursuit-purple" />
            <h3 className="font-semibold text-gray-900">Top Industries</h3>
            <span className="text-xs text-gray-400 ml-auto">where enrichment data exists</span>
          </div>

          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : !data?.top_industries?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No industry data for this period</p>
          ) : (
            <div className="space-y-0">
              {data.top_industries.map((row, i) => (
                <div key={row.industry} className="py-2.5 border-b border-gray-100 last:border-0">
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
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${barWidth(row.total_signals, maxIndustrySignals)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
          Companies builders are targeting where staff have existing contacts
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
              <IntroCard key={item.company} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
