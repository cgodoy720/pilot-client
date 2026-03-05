import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';
const PAGE_SIZE = 10;
const COHORT_COLORS = ['#4242EA', '#FF33FF', '#10B981', '#F59E0B', '#EF4444'];

const npsColor = (nps) => nps >= 50 ? 'text-green-600' : nps >= 0 ? 'text-yellow-600' : 'text-red-500';
const npsBg = (nps) => nps >= 50 ? 'bg-green-50 border-green-100' : nps >= 0 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 truncate max-w-[120px]">{p.name}:</span>
          <span className="font-medium text-[#1E1E1E]">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const Pagination = ({ page, total, pageSize, onPage }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
      <span className="text-xs text-slate-400">
        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button disabled={page === 0} onClick={() => onPage(page - 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]">
          <ChevronLeft size={14} />
        </button>
        <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const SurveyTab = () => {
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [npsMode, setNpsMode] = useState('calendar');
  const [npsData, setNpsData] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setPage(0);
    Promise.all([
      fetch(`${LEGACY_API}/surveys/nps/weekly-by-cohort?startDate=${startDate}&endDate=${endDate}&mode=${npsMode}`).then(r => r.json()).catch(() => []),
      fetch(`${LEGACY_API}/surveys/responses?startDate=${startDate}&endDate=${endDate}`).then(r => r.json()).catch(() => []),
    ]).then(([nps, resp]) => {
      setNpsData(Array.isArray(nps) ? nps : []);
      setResponses(Array.isArray(resp) ? resp : []);
    }).finally(() => setLoading(false));
  }, [startDate, endDate, npsMode]);

  // Build chart data: pivot by week, one line per cohort
  const { chartData, cohortNames, cohortSummary } = useMemo(() => {
    const weekMap = {};
    const cohortSet = new Set();
    const summaryMap = {};

    npsData.forEach((d) => {
      // Program mode → "Week 1", "Week 2", etc. Calendar mode → "Dec 13", "Jan 24", etc.
      const weekLabel = npsMode === 'program'
        ? `Week ${d.program_week}`
        : d.week_start?.value
          ? new Date(d.week_start.value + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `Week ${d.program_week}`;
      // In program mode, key by program_week number so cohorts with the same week # share a row
      const weekKey = npsMode === 'program' ? `w${d.program_week}` : weekLabel;
      if (!weekMap[weekKey]) weekMap[weekKey] = { week: weekLabel, _sortKey: d.program_week };
      weekMap[weekKey][d.cohort] = Math.round(d.nps);
      cohortSet.add(d.cohort);

      if (!summaryMap[d.cohort]) summaryMap[d.cohort] = { cohort: d.cohort, allNps: [], latestNps: null };
      summaryMap[d.cohort].allNps.push(d.nps);
      summaryMap[d.cohort].latestNps = d.nps;
    });

    const names = [...cohortSet];
    const summary = Object.values(summaryMap).map(s => ({
      cohort: s.cohort,
      npsThisWeek: s.latestNps !== null ? Math.round(s.latestNps) : null,
      npsAllTime: s.allNps.length > 0 ? Math.round(s.allNps.reduce((a, b) => a + b, 0) / s.allNps.length) : null,
    }));

    // Sort chart data: program mode by week number, calendar mode by date
    const sortedChart = Object.values(weekMap).sort((a, b) => {
      if (npsMode === 'program') return (a._sortKey || 0) - (b._sortKey || 0);
      return (a.week || '').localeCompare(b.week || '');
    });

    return {
      chartData: sortedChart,
      cohortNames: names,
      cohortSummary: summary,
    };
  }, [npsData, npsMode]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly NPS Chart */}
            <Card className="bg-white border border-[#E3E3E3]">
              <CardHeader className="pb-3 border-b border-[#E3E3E3]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-[#1E1E1E]">Weekly NPS by Cohort</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">{npsMode === 'calendar' ? 'Calendar' : 'Program'} weeks</CardDescription>
                  </div>
                  <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden">
                    {['program', 'calendar'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setNpsMode(mode)}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                          npsMode === mode
                            ? 'bg-[#4242EA] text-white'
                            : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {chartData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No NPS data for this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[-100, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                      {cohortNames.map((name, idx) => (
                        <Line
                          key={name} type="monotone" dataKey={name} name={name}
                          stroke={COHORT_COLORS[idx % COHORT_COLORS.length]}
                          strokeWidth={2} dot={{ r: 3 }} connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Cohort NPS Summary */}
            <Card className="bg-white border border-[#E3E3E3]">
              <CardHeader className="pb-3 border-b border-[#E3E3E3]">
                <CardTitle className="text-base font-semibold text-[#1E1E1E]">Cohort NPS Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {cohortSummary.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No data.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                        <th className="pb-2 pr-3 font-medium">Cohort</th>
                        <th className="pb-2 px-3 font-medium text-center">NPS This Week</th>
                        <th className="pb-2 pl-3 font-medium text-center">NPS All Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFEF]">
                      {cohortSummary.map(c => (
                        <tr key={c.cohort} className="hover:bg-[#EFEFEF]/50 transition-colors">
                          <td className="py-2.5 pr-3 text-xs font-medium text-[#1E1E1E]">{c.cohort}</td>
                          <td className="py-2.5 px-3 text-center">
                            {c.npsThisWeek !== null ? (
                              <span className={`text-sm font-bold ${npsColor(c.npsThisWeek)}`}>{c.npsThisWeek}</span>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="py-2.5 pl-3 text-center">
                            {c.npsAllTime !== null ? (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${npsBg(c.npsAllTime)} ${npsColor(c.npsAllTime)}`}>
                                {c.npsAllTime}
                              </span>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Responses table */}
          <Card className="bg-white border border-[#E3E3E3]">
            <CardHeader className="pb-3 border-b border-[#E3E3E3]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#1E1E1E]">Responses</CardTitle>
                <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{responses.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {responses.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No responses for this period.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                          <th className="pb-2 pr-2 font-medium">Date</th>
                          <th className="pb-2 px-2 font-medium">User</th>
                          <th className="pb-2 px-2 font-medium">Cohort</th>
                          <th className="pb-2 px-2 font-medium text-center">NPS</th>
                          <th className="pb-2 px-2 font-medium">What went well</th>
                          <th className="pb-2 pl-2 font-medium">What to improve</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFEF]">
                        {responses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((r, i) => {
                          const date = r.task_date?.value || r.task_date || '';
                          const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                          const nps = r.referral_likelihood;
                          const isPromoter = nps >= 9;
                          const isDetractor = nps <= 6;
                          return (
                            <tr key={r.id || i} className="hover:bg-[#EFEFEF]/50 transition-colors align-top">
                              <td className="py-2 pr-2 text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
                              <td className="py-2 px-2 text-xs font-medium text-[#1E1E1E] whitespace-nowrap">{r.user_name}</td>
                              <td className="py-2 px-2 text-xs text-slate-500 whitespace-nowrap">{r.cohort}</td>
                              <td className="py-2 px-2 text-center">
                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                  isPromoter ? 'bg-green-100 text-green-700' :
                                  isDetractor ? 'bg-red-100 text-red-600' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {isPromoter ? <ThumbsUp size={10} /> : isDetractor ? <ThumbsDown size={10} /> : <Minus size={10} />}
                                  {nps}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-xs text-slate-600 max-w-[200px]">
                                <p className="line-clamp-2">{r.what_we_did_well || '—'}</p>
                              </td>
                              <td className="py-2 pl-2 text-xs text-slate-600 max-w-[200px]">
                                <p className="line-clamp-2">{r.what_to_improve || '—'}</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={page} total={responses.length} pageSize={PAGE_SIZE} onPage={setPage} />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SurveyTab;
