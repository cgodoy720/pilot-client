import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import useAuthStore from '../../../stores/authStore';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';

const MetricDetailDrawer = ({ metric, cohortRow, nps, mode, cohortName, selectedCohortId, onClose }) => {
  const token = useAuthStore((s) => s.token);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metric || !token) return;

    if (metric === 'nps') {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const sixMonths = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      fetch(`${LEGACY_API}/surveys/responses?startDate=${sixMonths}&endDate=${today}`)
        .then(r => r.json())
        .then(data => {
          const cohortResponses = (Array.isArray(data) ? data : [])
            .filter(r => r.cohort === cohortName)
            .sort((a, b) => new Date(b.task_date?.value || b.task_date || 0) - new Date(a.task_date?.value || a.task_date || 0));
          const scores = cohortResponses.map(r => r.referral_likelihood).filter(s => s != null);
          const promoters = scores.filter(s => s >= 9).length;
          const detractors = scores.filter(s => s <= 6).length;
          const passives = scores.length - promoters - detractors;
          setDetailData({ type: 'nps', responses: cohortResponses, promoters, detractors, passives, total: scores.length });
        })
        .catch(() => setDetailData(null))
        .finally(() => setLoading(false));
    } else if (metric === 'attendance' && selectedCohortId) {
      setLoading(true);
      fetch(`${API_BASE}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=2025-01-01&endDate=${new Date().toISOString().split('T')[0]}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const builders = data.builders || [];
            const atRisk = builders.filter(b => b.attendance_percentage < 80).sort((a, b) => a.attendance_percentage - b.attendance_percentage);
            const avg = builders.length > 0 ? Math.round(builders.reduce((s, b) => s + (b.attendance_percentage || 0), 0) / builders.length) : 0;
            setDetailData({ type: 'attendance', builders, atRisk, avg });
          }
        })
        .catch(() => setDetailData(null))
        .finally(() => setLoading(false));
    } else if (metric === 'tasks' && selectedCohortId) {
      setLoading(true);
      fetch(`${API_BASE}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=2025-01-01&endDate=${new Date().toISOString().split('T')[0]}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const tasks = (data.taskDetails || [])
              .sort((a, b) => (a.submission_rate || 0) - (b.submission_rate || 0));
            setDetailData({ type: 'tasks', tasks });
          }
        })
        .catch(() => setDetailData(null))
        .finally(() => setLoading(false));
    }
  }, [metric, token, selectedCohortId, cohortName]);

  const TITLES = {
    enrolled: 'Enrolled Builders',
    active: 'Active Builders',
    attendance: 'Attendance Detail',
    tasks: 'Task Completion Detail',
    deliverables: 'Deliverables Detail',
    nps: 'NPS Detail',
  };

  return (
    <Sheet open={!!metric} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#E3E3E3]">
          <SheetTitle className="text-[#1E1E1E] font-semibold">{TITLES[metric] || metric}</SheetTitle>
          <p className="text-xs text-slate-400 mt-1">{cohortName} — {mode === 'last_week' ? 'Last Week' : 'All Time'}</p>
        </SheetHeader>

        <div className="px-6 py-4 space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[#EFEFEF] rounded animate-pulse" />)}
            </div>
          )}

          {/* Attendance detail */}
          {!loading && detailData?.type === 'attendance' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{detailData.avg}%</p>
                  <p className="text-xs text-green-700">Cohort Average</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-500">{detailData.atRisk.length}</p>
                  <p className="text-xs text-red-600">Below 80%</p>
                </div>
              </div>
              {detailData.atRisk.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">At-Risk Builders</p>
                  <div className="space-y-1">
                    {detailData.atRisk.slice(0, 15).map(b => (
                      <div key={b.user_id} className="flex items-center justify-between py-1.5 border-b border-[#EFEFEF]">
                        <span className="text-xs font-medium text-[#1E1E1E]">{b.name}</span>
                        <span className={`text-xs font-semibold ${b.attendance_percentage < 60 ? 'text-red-500' : 'text-yellow-600'}`}>
                          {b.attendance_percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Task detail */}
          {!loading && detailData?.type === 'tasks' && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lowest Completion Tasks</p>
              <div className="space-y-1">
                {detailData.tasks.slice(0, 15).map(t => (
                  <div key={t.task_id} className="flex items-center justify-between py-1.5 border-b border-[#EFEFEF]">
                    <span className="text-xs text-[#1E1E1E] flex-1 mr-2 line-clamp-1">{t.task_title}</span>
                    <span className={`text-xs font-semibold ${t.submission_rate >= 80 ? 'text-green-600' : t.submission_rate >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {t.submission_rate}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* NPS detail */}
          {!loading && detailData?.type === 'nps' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{detailData.promoters}</p>
                  <p className="text-[10px] text-green-700">Promoters (9-10)</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-yellow-600">{detailData.passives}</p>
                  <p className="text-[10px] text-yellow-700">Passives (7-8)</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-500">{detailData.detractors}</p>
                  <p className="text-[10px] text-red-600">Detractors (0-6)</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recent Responses</p>
              <div className="space-y-2">
                {detailData.responses.slice(0, 10).map((r, i) => {
                  const score = r.referral_likelihood;
                  const isPromoter = score >= 9;
                  const isDetractor = score <= 6;
                  return (
                    <div key={r.id || i} className="border-b border-[#EFEFEF] pb-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isPromoter ? 'bg-green-100 text-green-700' :
                          isDetractor ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{score}</span>
                        <span className="text-xs font-medium text-[#1E1E1E]">{r.user_name}</span>
                      </div>
                      {r.what_we_did_well && <p className="text-[11px] text-slate-600 line-clamp-1">{r.what_we_did_well}</p>}
                      {r.what_to_improve && <p className="text-[11px] text-red-500 line-clamp-1">{r.what_to_improve}</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Simple stats for enrolled/active/deliverables */}
          {!loading && !detailData && (metric === 'enrolled' || metric === 'active' || metric === 'deliverables') && cohortRow && (
            <div className="space-y-3">
              {metric === 'enrolled' && (
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <p className="text-sm text-slate-600">Originally enrolled: <span className="font-semibold">{cohortRow.original_enrolled ?? '—'}</span></p>
                  <p className="text-sm text-slate-600 mt-1">Currently active: <span className="font-semibold">{cohortRow.enrolled ?? '—'}</span></p>
                  <p className="text-sm text-slate-600 mt-1">Started: <span className="font-semibold">{cohortRow.start_date ? new Date(cohortRow.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span></p>
                </div>
              )}
              {metric === 'active' && (
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <p className="text-sm text-slate-600">Active builders: <span className="font-semibold">{cohortRow.enrolled ?? '—'}</span></p>
                  <p className="text-sm text-slate-600 mt-1">Originally enrolled: <span className="font-semibold">{cohortRow.original_enrolled ?? '—'}</span></p>
                  {cohortRow.original_enrolled && cohortRow.enrolled && (
                    <p className="text-sm text-slate-600 mt-1">Retention: <span className="font-semibold">{Math.round((cohortRow.enrolled / cohortRow.original_enrolled) * 100)}%</span></p>
                  )}
                </div>
              )}
              {metric === 'deliverables' && (
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <p className="text-sm text-slate-600">Last week: <span className="font-semibold">{cohortRow.deliverables?.current ?? '—'}%</span></p>
                  <p className="text-sm text-slate-600 mt-1">All time: <span className="font-semibold">{cohortRow.deliverables?.all_time ?? '—'}%</span></p>
                  {cohortRow.deliverables?.change != null && (
                    <p className={`text-sm mt-1 ${cohortRow.deliverables.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      Week-over-week: {cohortRow.deliverables.change >= 0 ? '+' : ''}{cohortRow.deliverables.change}%
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MetricDetailDrawer;
