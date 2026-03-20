import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { fetchAvailableReportWeeks, fetchWeeklyFeedbackReport } from '../../../utils/weeklyFeedbackService';

const renderBody = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const bullets = lines.filter(l => l.trim().startsWith('- '));
  const prose = lines.filter(l => !l.trim().startsWith('- ')).join(' ').trim();

  return (
    <>
      {prose && <p className="text-gray-700 text-sm">{prose}</p>}
      {bullets.length > 0 && (
        <ul className="list-disc list-inside text-gray-700 text-sm mt-1 space-y-0.5">
          {bullets.map((b, i) => <li key={i}>{b.replace(/^-\s*/, '')}</li>)}
        </ul>
      )}
    </>
  );
};

const SectionCard = ({ title, headline, body, children, accent = false }) => (
  <div className={`bg-white rounded-xl border p-4 ${accent ? 'border-purple-300 shadow-sm' : 'border-[#E5E7EB]'}`}>
    {title && (
      <h3 className={`text-sm font-semibold mb-1 font-proxima-bold ${accent ? 'text-purple-700' : 'text-[#1F2937]'}`}>
        {title}
      </h3>
    )}
    {headline && (
      <p className={`text-sm font-semibold mb-1 ${accent ? 'text-purple-600' : 'text-[#1F2937]'}`}>
        {headline}
      </p>
    )}
    {body && renderBody(body)}
    {children}
  </div>
);

const BadgePill = ({ label, subtitle, color = 'green' }) => {
  const colorMap = {
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-800',
  };

  return (
    <span className={`inline-flex flex-col items-start rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color] || colorMap.green}`}>
      <span>{label}</span>
      {subtitle && <span className="text-[10px] font-normal opacity-75">{subtitle}</span>}
    </span>
  );
};

const MetricCard = ({ label, value }) => {
  if (value == null) return null;
  const displayValue = typeof value === 'number' ? `${Math.round(value)}%` : value;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 flex-1 min-w-0 text-center">
      <p className="text-2xl font-bold text-[#7C3AED] font-proxima-bold">{displayValue}</p>
      <p className="text-xs text-gray-500 font-proxima mt-0.5">{label}</p>
    </div>
  );
};

const WeeklyFeedbackReport = ({ userId, token }) => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available weeks on mount
  useEffect(() => {
    const loadWeeks = async () => {
      if (!token || !userId) return;

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAvailableReportWeeks(token);
        const availableWeeks = result?.weeks || [];

        if (availableWeeks.length > 0) {
          setWeeks(availableWeeks);
          setSelectedWeek(availableWeeks[0].week_number);
        } else {
          setWeeks([]);
        }
      } catch (err) {
        console.error('Error loading available weeks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWeeks();
  }, [userId, token]);

  // Fetch report when selectedWeek changes
  useEffect(() => {
    const loadReport = async () => {
      if (!token || !userId || selectedWeek == null) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeeklyFeedbackReport(token, selectedWeek);
        setReportData(data);
      } catch (err) {
        console.error('Error loading weekly report:', err);
        setError(err.message);
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [userId, token, selectedWeek]);

  const getWeekLabel = useCallback((week) => {
    if (!week) return '';
    const startDate = week.week_start_date
      ? new Date(week.week_start_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      : '';
    const endDate = week.week_end_date
      ? new Date(week.week_end_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      : '';
    const range = startDate && endDate ? `: ${startDate} - ${endDate}` : '';
    return `Week ${week.week_number}${range}`;
  }, []);

  // Loading state
  if (loading && weeks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937] font-proxima-bold">Weekly Report</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#6B7280] font-proxima">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && weeks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937] font-proxima-bold">Weekly Report</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2 font-proxima">Error loading report</p>
            <p className="text-[#6B7280] text-sm font-proxima">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!weeks || weeks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937] font-proxima-bold">Weekly Report</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#6B7280] font-proxima">No reports available yet</p>
            <p className="text-xs text-[#9CA3AF] font-proxima mt-1">
              Weekly reports will appear here as they are generated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const report = reportData?.report || {};
  const { attendanceRate, taskCompletionRate, avgGradedScore } = reportData || {};
  const selectedWeekObj = weeks.find(w => w.week_number === selectedWeek);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-[#1F2937] font-proxima-bold">Weekly Report</h2>
        <Select
          value={String(selectedWeek)}
          onValueChange={(val) => setSelectedWeek(Number(val))}
        >
          <SelectTrigger className="w-52 h-8 border-[#E5E7EB] bg-white text-xs rounded-md">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week.week_number} value={String(week.week_number)}>
                {getWeekLabel(week)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-6 performance-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-[#6B7280] text-sm font-proxima">Loading report...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            {report.summary?.body && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-900 font-proxima leading-relaxed">{report.summary.body}</p>
              </div>
            )}

            {/* Metric cards */}
            {(attendanceRate != null || taskCompletionRate != null || avgGradedScore != null) && (
              <div className="flex gap-3">
                <MetricCard label="Attendance Rate" value={attendanceRate} />
                <MetricCard label="Task Completion" value={taskCompletionRate} />
                <MetricCard label="Avg Grade" value={avgGradedScore} />
              </div>
            )}

            {/* Attendance */}
            {report.attendance && (
              <SectionCard
                title="Attendance"
                headline={report.attendance.headline}
                body={report.attendance.body}
              />
            )}

            {/* Task Completion */}
            {report.task_completion && (
              <SectionCard
                title="Task Completion"
                headline={report.task_completion.headline}
                body={report.task_completion.body}
              />
            )}

            {/* Graded Assignments */}
            {report.graded_assignments && (
              <SectionCard
                title="Graded Assignments"
                headline={report.graded_assignments.headline}
                body={report.graded_assignments.body}
              >
                {report.graded_assignments.strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-proxima mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.graded_assignments.strengths.map((s, i) => (
                        <BadgePill
                          key={i}
                          label={s.label}
                          subtitle={s.explanation}
                          color="green"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {report.graded_assignments.growth_areas?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-proxima mb-1">Growth Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.graded_assignments.growth_areas.map((g, i) => (
                        <BadgePill
                          key={i}
                          label={g.label}
                          subtitle={g.explanation}
                          color="amber"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Peer Feedback */}
            {report.peer_feedback && (
              <SectionCard
                title="Peer Feedback"
                headline={report.peer_feedback.headline}
                body={report.peer_feedback.body}
              >
                {report.peer_feedback.strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-proxima mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.peer_feedback.strengths.map((s, i) => (
                        <BadgePill
                          key={i}
                          label={s.label}
                          subtitle={s.from_name ? `from ${s.from_name}` : undefined}
                          color="purple"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {report.peer_feedback.growth_areas?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-proxima mb-1">Growth Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.peer_feedback.growth_areas.map((g, i) => (
                        <BadgePill
                          key={i}
                          label={g.label}
                          subtitle={g.explanation}
                          color="amber"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Personal Reflections */}
            {report.personal_reflections && (
              <SectionCard
                title="Personal Reflections"
                headline={report.personal_reflections.headline}
                body={report.personal_reflections.body}
              />
            )}

            {/* Recommendation — accent card */}
            {report.recommendation && (
              <SectionCard
                title="Recommendation"
                headline={report.recommendation.headline}
                body={report.recommendation.body}
                accent
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyFeedbackReport;
