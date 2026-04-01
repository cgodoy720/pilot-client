import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Hex colors — avoids Tailwind purge issues, easier to tweak
const STAGE_COLORS = {
  leads:          { bar: '#CBD5E1', text: '#334155' },  // slate
  applicants:     { bar: '#7DD3FC', text: '#0C4A6E' },  // sky
  submitted:      { bar: '#3B82F6', text: '#ffffff' },  // blue
  admitted:       { bar: '#4242EA', text: '#ffffff' },  // Pursuit Purple
  l1_completed:   { bar: '#6EE7B7', text: '#064E3B' },  // emerald light
  l2_completed:   { bar: '#10B981', text: '#ffffff' },  // emerald
  l3_completed:   { bar: '#047857', text: '#ffffff' },  // emerald dark
  any_employment: { bar: '#FCD34D', text: '#78350F' },  // amber
  ft_employed:    { bar: '#F59E0B', text: '#ffffff' },  // amber dark
};

const ENROLLMENT_STAGES = new Set(['l1_completed', 'l2_completed', 'l3_completed']);
const ENROLLMENT_STATUSES = ['in_progress', 'completed', 'withdrawn', 'inactive'];
const ADMISSION_STATUSES = ['pending', 'accepted', 'rejected', 'waitlisted', 'withdrawn'];

const fmt = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

const ProgramMetricsTab = () => {
  const token = useAuthStore((s) => s.token);

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [filters, setFilters] = useState({ gender: '', nycha: '', referral: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedStage, setSelectedStage] = useState(null);
  const [drillData, setDrillData] = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillTotal, setDrillTotal] = useState(0);
  const [drillPage, setDrillPage] = useState(1);
  const DRILL_LIMIT = 50;

  // ---- Cohorts ----
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/permissions/cohorts?type=builder`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setCohorts(data.data || data.cohorts || []); })
      .catch(() => {});
  }, [token]);

  // ---- Funnel ----
  const fetchFunnel = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (selectedCohortId) params.set('cohortId', selectedCohortId);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.nycha !== '') params.set('nycha', filters.nycha);
    if (filters.referral) params.set('referral', filters.referral);
    const qs = params.toString();
    fetch(`${API_URL}/api/admin/dashboard/program-funnel${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStages(data.stages || []);
        else setError('Failed to load funnel data');
      })
      .catch(() => setError('Network error loading funnel'))
      .finally(() => setLoading(false));
  }, [token, selectedCohortId, filters]);

  useEffect(() => { fetchFunnel(); }, [fetchFunnel]);

  // ---- Drill-down ----
  const fetchDrillDown = useCallback((stage, page) => {
    if (!token || !stage) return;
    setDrillLoading(true);
    const params = new URLSearchParams({ stage: stage.id, page, limit: DRILL_LIMIT });
    if (selectedCohortId && ENROLLMENT_STAGES.has(stage.id)) params.set('cohortId', selectedCohortId);
    fetch(`${API_URL}/api/admin/dashboard/stage-detail?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setDrillData(data.data || []);
          setDrillTotal(data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setDrillLoading(false));
  }, [token, selectedCohortId]);

  useEffect(() => {
    if (selectedStage) { setDrillPage(1); fetchDrillDown(selectedStage, 1); }
    else { setDrillData([]); setDrillTotal(0); }
  }, [selectedStage, fetchDrillDown]);

  useEffect(() => {
    if (selectedStage && drillPage > 1) fetchDrillDown(selectedStage, drillPage);
  }, [drillPage]);

  // ---- Inline enrollment status edit ----
  const handleStatusChange = async (enrollmentId, newStatus, rowIdx) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/enrollment-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: enrollmentId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDrillData(prev => prev.map((row, i) =>
          i === rowIdx ? { ...row, enrollment_status: newStatus } : row
        ));
      }
    } catch {}
  };

  // ---- Inline admission status edit ----
  const handleAdmissionStatusChange = async (stageId, newStatus, rowIdx) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/admission-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_id: stageId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDrillData(prev => prev.map((row, i) =>
          i === rowIdx ? { ...row, program_admission_status: newStatus } : row
        ));
      }
    } catch {}
  };

  // ---- Helpers ----
  const maxCount = stages.length > 0 ? Math.max(...stages.map(s => s.count), 1) : 1;

  const getConversionPct = (current, previous) => {
    if (!previous || previous.count === 0) return null;
    return Math.round((current.count / previous.count) * 100);
  };

  const activeFilterCount = [filters.gender, filters.nycha, filters.referral].filter(Boolean).length;

  // ---- Drill-down table ----
  const renderDrillTable = () => {
    if (!selectedStage) return null;
    const id = selectedStage.id;

    const colHeaders = {
      leads:          ['Name', 'Email', 'Status', 'First Captured'],
      applicants:     ['Name', 'Email', 'NYCHA', 'Referral Source', 'Created'],
      submitted:      ['Name', 'Email', 'Submitted At'],
      admitted:       ['Name', 'Email', 'Admission Status', 'Stage Date'],
      l1_completed:   ['Name', 'Email', 'Cohort', 'Status', 'Enrolled'],
      l2_completed:   ['Name', 'Email', 'Cohort', 'Status', 'Enrolled'],
      l3_completed:   ['Name', 'Email', 'Cohort', 'Status', 'Enrolled'],
      any_employment: ['Name', 'Email', 'Role', 'Company', 'Type', 'Stage'],
      ft_employed:    ['Name', 'Email', 'Role', 'Company', 'Start Date'],
    };

    const headers = colHeaders[id] || ['Name', 'Email'];

    const statusSelect = (value, options, onChange) => (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs w-36 border-[#E3E3E3]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(s => (
            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    const renderRow = (row, rowIdx) => {
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || '—';
      const email = row.email || '—';
      let cells = [];

      if (id === 'leads') {
        cells = [name, email, row.status || '—', fmt(row.created_at)];
      } else if (id === 'applicants') {
        cells = [name, email, row.nycha_resident ? 'Yes' : 'No', row.referral_source || '—', fmt(row.created_at)];
      } else if (id === 'submitted') {
        cells = [name, email, fmt(row.submitted_at)];
      } else if (id === 'admitted') {
        cells = [
          name,
          email,
          statusSelect(
            row.program_admission_status || 'pending',
            ADMISSION_STATUSES,
            (val) => handleAdmissionStatusChange(row.stage_id, val, rowIdx)
          ),
          fmt(row.stage_date),
        ];
      } else if (ENROLLMENT_STAGES.has(id)) {
        cells = [
          name,
          email,
          row.cohort_name || '—',
          statusSelect(
            row.enrollment_status || 'in_progress',
            ENROLLMENT_STATUSES,
            (val) => handleStatusChange(row.enrollment_id, val, rowIdx)
          ),
          fmt(row.enrolled_date),
        ];
      } else if (id === 'any_employment') {
        cells = [name, email, row.role_title || '—', row.company_name || '—', row.employment_type || '—', row.engagement_stage || '—'];
      } else if (id === 'ft_employed') {
        cells = [name, email, row.role_title || '—', row.company_name || '—', fmt(row.start_date)];
      }

      return (
        <tr key={rowIdx} className="hover:bg-[#EFEFEF]/50 border-b border-[#EFEFEF]">
          {cells.map((cell, ci) => (
            <td key={ci} className="py-2 px-3 text-sm text-[#1E1E1E]">{cell}</td>
          ))}
        </tr>
      );
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="border-b border-[#E3E3E3]">
              {headers.map(h => (
                <th key={h} className="pb-2 px-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drillData.map((row, i) => renderRow(row, i))}
          </tbody>
        </table>
      </div>
    );
  };

  const totalDrillPages = Math.ceil(drillTotal / DRILL_LIMIT);

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-[#1E1E1E] mb-0.5">Program Pipeline</h3>
          <p className="text-xs text-slate-500">All-time funnel from first contact through program completion</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCohortId || '__none'} onValueChange={v => setSelectedCohortId(v === '__none' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs w-44 border-[#E3E3E3] bg-white">
              <SelectValue placeholder="All cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none" className="text-xs">All cohorts</SelectItem>
              {cohorts.map(c => (
                <SelectItem key={c.cohort_id || c.id} value={c.cohort_id || c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-[#E3E3E3] gap-1.5"
              onClick={() => setFiltersOpen(o => !o)}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-[#4242EA] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {filtersOpen && (
              <div className="absolute right-0 top-9 z-20 bg-white border border-[#E3E3E3] rounded-lg shadow-lg p-4 w-64 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Gender</p>
                  <Select value={filters.gender || '__none'} onValueChange={v => setFilters(f => ({ ...f, gender: v === '__none' ? '' : v }))}>
                    <SelectTrigger className="h-8 text-xs border-[#E3E3E3]">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none" className="text-xs">Any</SelectItem>
                      <SelectItem value="male" className="text-xs">Male</SelectItem>
                      <SelectItem value="female" className="text-xs">Female</SelectItem>
                      <SelectItem value="non-binary" className="text-xs">Non-binary</SelectItem>
                      <SelectItem value="other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">NYCHA Resident</p>
                  <Select value={filters.nycha || '__none'} onValueChange={v => setFilters(f => ({ ...f, nycha: v === '__none' ? '' : v }))}>
                    <SelectTrigger className="h-8 text-xs border-[#E3E3E3]">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none" className="text-xs">Any</SelectItem>
                      <SelectItem value="true" className="text-xs">Yes</SelectItem>
                      <SelectItem value="false" className="text-xs">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Referral Source</p>
                  <input
                    type="text"
                    value={filters.referral}
                    onChange={e => setFilters(f => ({ ...f, referral: e.target.value }))}
                    placeholder="e.g. friend, social"
                    className="w-full h-8 text-xs border border-[#E3E3E3] rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-[#4242EA]"
                  />
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-slate-500"
                    onClick={() => setFilters({ gender: '', nycha: '', referral: '' })}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#EFEFEF] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      ) : (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Leads',    value: stages.find(s => s.id === 'leads')?.count },
              { label: 'Applied',        value: stages.find(s => s.id === 'submitted')?.count },
              { label: 'Admitted',       value: stages.find(s => s.id === 'admitted')?.count },
              { label: 'L1+ Completed',  value: stages.find(s => s.id === 'l1_completed')?.count },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-[#E3E3E3] rounded-lg p-4">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-[#1E1E1E] mt-1">{value != null ? value.toLocaleString() : '—'}</p>
              </div>
            ))}
          </div>

          {/* Funnel bars */}
          <Card className="bg-white border border-[#E3E3E3]">
            <CardHeader className="pb-3 border-b border-[#E3E3E3]">
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Stage Breakdown</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Click a bar to drill into the people at that stage</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-1.5">
                {stages.map((stage, idx) => {
                  const colors = STAGE_COLORS[stage.id] || STAGE_COLORS.leads;
                  const barWidth = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 0.5) : 0;
                  const prev = idx > 0 ? stages[idx - 1] : null;
                  const convPct = getConversionPct(stage, prev);
                  const isSelected = selectedStage?.id === stage.id;

                  return (
                    <div key={stage.id}>
                      <button
                        className={`w-full flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors ${isSelected ? 'ring-1 ring-[#4242EA] bg-[#4242EA]/5' : 'hover:bg-[#EFEFEF]/60'}`}
                        onClick={() => setSelectedStage(isSelected ? null : { id: stage.id, label: stage.label })}
                      >
                        {/* Stage label */}
                        <div className="w-32 flex-shrink-0 text-right">
                          <span className="text-xs font-medium text-slate-600">{stage.label}</span>
                        </div>
                        {/* Bar */}
                        <div className="flex-1 relative h-8 bg-[#EFEFEF] rounded overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                            style={{ width: `${barWidth}%`, backgroundColor: colors.bar }}
                          />
                        </div>
                        {/* Count — always outside the bar */}
                        <div className="w-16 flex-shrink-0 text-left">
                          <span className="text-xs font-bold text-[#1E1E1E]">{stage.count.toLocaleString()}</span>
                        </div>
                        {/* Conversion badge */}
                        <div className="w-14 flex-shrink-0 text-right">
                          {convPct !== null && (
                            <Badge className={`text-[10px] border-0 ${
                              convPct >= 50 ? 'bg-green-100 text-green-700' :
                              convPct >= 25 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {convPct}%
                            </Badge>
                          )}
                        </div>
                      </button>
                      {idx < stages.length - 1 && (
                        <div className="flex items-center gap-2 h-2 ml-32">
                          <div className="w-32 flex-shrink-0" />
                          <div className="flex-1 flex justify-start pl-3">
                            <div className="w-px h-2 bg-[#E3E3E3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-4 text-right">% shows conversion from previous stage</p>
            </CardContent>
          </Card>

          {/* Drill-down panel */}
          {selectedStage && (
            <Card className="bg-white border border-[#4242EA]/30">
              <CardHeader className="pb-3 border-b border-[#E3E3E3]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-[#1E1E1E]">{selectedStage.label}</CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {drillTotal.toLocaleString()} {drillTotal === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-[#EFEFEF] text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setSelectedStage(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {drillLoading ? (
                  <div className="space-y-2 py-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />
                    ))}
                  </div>
                ) : drillData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No records found</p>
                ) : (
                  <>
                    {renderDrillTable()}
                    {totalDrillPages > 1 && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EFEFEF]">
                        <span className="text-xs text-slate-400">Page {drillPage} of {totalDrillPages}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-[#E3E3E3]"
                            disabled={drillPage <= 1} onClick={() => setDrillPage(p => p - 1)}>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-[#E3E3E3]"
                            disabled={drillPage >= totalDrillPages} onClick={() => setDrillPage(p => p + 1)}>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conversion table */}
          <Card className="bg-white border border-[#E3E3E3]">
            <CardHeader className="pb-3 border-b border-[#E3E3E3]">
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Conversion Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                    <th className="pb-2 pr-4 font-medium">Stage</th>
                    <th className="pb-2 px-3 font-medium text-center">Count</th>
                    <th className="pb-2 px-3 font-medium text-center">From Prev</th>
                    <th className="pb-2 pl-3 font-medium text-center">From Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEF]">
                  {stages.map((stage, idx) => {
                    const prev = idx > 0 ? stages[idx - 1] : null;
                    const convPrev = getConversionPct(stage, prev);
                    const convLeads = getConversionPct(stage, stages[0]);
                    return (
                      <tr key={stage.id} className="hover:bg-[#EFEFEF]/50">
                        <td className="py-2.5 pr-4 font-medium text-[#1E1E1E] text-xs">{stage.label}</td>
                        <td className="py-2.5 px-3 text-center text-xs font-semibold text-[#1E1E1E]">
                          {stage.count.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {convPrev !== null ? (
                            <span className={`text-xs font-semibold ${
                              convPrev >= 50 ? 'text-green-600' : convPrev >= 25 ? 'text-yellow-600' : 'text-red-500'
                            }`}>{convPrev}%</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-2.5 pl-3 text-center">
                          {idx > 0 && convLeads !== null ? (
                            <span className="text-xs text-slate-500">{convLeads}%</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProgramMetricsTab;
