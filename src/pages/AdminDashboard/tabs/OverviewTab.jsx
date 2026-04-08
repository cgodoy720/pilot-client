import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import MetricsBar from '../components/MetricsBar';
import RosterSection from '../components/RosterSection';
import TaskAnalysisSection from '../components/TaskAnalysisSection';
import CohortDailyBreakdown from '../../../components/CohortPerformanceDashboard/CohortDailyBreakdown';
import DayBuilderStatusModal from '../../../components/CohortPerformanceDashboard/DayBuilderStatusModal';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';

const PERIOD_OPTIONS = [
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'all-time', label: 'All Time' },
];

const OverviewTab = ({ selectedCohortId, cohorts, programSlug }) => {
  const token = useAuthStore((s) => s.token);

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );
  const selectedCohortName = selectedCohort?.name || '';

  // Calendar state
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayBuilders, setDayBuilders] = useState(null);
  const [dayBuildersLoading, setDayBuildersLoading] = useState(false);

  // Fetch daily breakdown for calendar
  useEffect(() => {
    if (!selectedCohortName || !token) return;
    cachedAdminApi.getCachedCohortDailyBreakdown(selectedCohortName, token, { period: selectedPeriod })
      .then((res) => setDailyBreakdown(res.data?.dailyBreakdown || []))
      .catch(() => setDailyBreakdown([]));
  }, [selectedCohortName, selectedPeriod, token]);

  const handleDayClick = async (day) => {
    if (!selectedCohortName || !day.date) return;
    setSelectedDay(day);
    setIsModalOpen(true);
    setDayBuildersLoading(true);
    try {
      const res = await cachedAdminApi.getCachedDayBuilderStatus(selectedCohortName, day.date, token);
      setDayBuilders(res.data);
    } catch {
      setDayBuilders(null);
    } finally {
      setDayBuildersLoading(false);
    }
  };

  if (!selectedCohortId) {
    return <p className="text-sm text-slate-400 text-center py-12">Select a cohort to view overview.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <MetricsBar
        selectedCohortId={selectedCohortId}
        cohorts={cohorts}
        programSlug={programSlug}
      />

      {/* Roster */}
      <RosterSection
        selectedCohortId={selectedCohortId}
        cohorts={cohorts}
      />

      {/* Daily Attendance Calendar */}
      <CohortDailyBreakdown
        dailyBreakdown={dailyBreakdown}
        cohort={selectedCohortName}
        requirement={80}
        onDayClick={handleDayClick}
        loading={false}
      />

      {/* Task Analysis */}
      <TaskAnalysisSection selectedCohortId={selectedCohortId} cohorts={cohorts} />

      {/* Day detail modal */}
      <DayBuilderStatusModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDay(null);
          setDayBuilders(null);
        }}
        dayData={dayBuilders}
        loading={dayBuildersLoading}
      />
    </div>
  );
};

export default OverviewTab;
