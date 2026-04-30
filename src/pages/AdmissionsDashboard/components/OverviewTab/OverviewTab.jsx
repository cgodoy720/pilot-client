import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';
import { useOverviewStats, useOverviewDemographics, useComparisonStats } from '../../hooks/useOverviewStats';

const OverviewTab = ({
  error,
  stats,
  cohorts,
  overviewQuickView,
  setOverviewQuickView,
  compareEnabled,
  setCompareEnabled,
  activeOverviewStage,
  setActiveOverviewStage,
  applicantStatusFilter,
  overviewDeliberationFilter,
  setOverviewDeliberationFilter,
  token,
  getOverviewCohortParam,
  fetchAdmissionsData
}) => {
  // Get the cohort parameter for queries
  const cohortParam = getOverviewCohortParam();
  
  // Use React Query hooks for data fetching
  const { 
    data: overviewStats, 
    isLoading: statsLoading,
    error: statsError 
  } = useOverviewStats(cohortParam, overviewDeliberationFilter, token);
  
  const { 
    data: demographics, 
    isLoading: demoLoading 
  } = useOverviewDemographics(cohortParam, activeOverviewStage, overviewDeliberationFilter, token);
  
  // Get previous cohort ID for comparison (find the cohort before the selected one)
  const previousCohortId = useMemo(() => {
    if (!overviewQuickView || overviewQuickView === 'all_time' || overviewQuickView === 'deferred') {
      return null;
    }
    
    // Find current cohort index
    const sortedCohorts = [...(cohorts || [])].sort((a, b) => 
      new Date(b.start_date) - new Date(a.start_date)
    );
    const currentIndex = sortedCohorts.findIndex(c => c.cohort_id === overviewQuickView);
    
    // Get the previous cohort (next in the sorted array since it's sorted DESC)
    if (currentIndex >= 0 && currentIndex < sortedCohorts.length - 1) {
      return sortedCohorts[currentIndex + 1]?.cohort_id;
    }
    return null;
  }, [overviewQuickView, cohorts]);
  
  const { 
    data: comparisonStats 
  } = useComparisonStats(previousCohortId, compareEnabled, token);
  
  // Use the fetched stats or fall back to prop stats
  const displayStats = overviewStats || stats;
  const loading = statsLoading;
  
  // Calculate status breakdown from overviewStats
  const appliedStatusBreakdown = useMemo(() => {
    if (!overviewStats) return null;
    return {
      total: overviewStats.totalApplicants,
      ...overviewStats.statusBreakdown
    };
  }, [overviewStats]);

  // Calculate percentage change
  const getPercentChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Memoize all percentage changes for performance
  const percentageChanges = useMemo(() => {
    if (!compareEnabled || !comparisonStats || !displayStats) return null;
    return {
      applicants: getPercentChange(
        appliedStatusBreakdown?.total ?? displayStats.totalApplicants ?? 0,
        comparisonStats?.totalApplicants
      ),
      infoSessions: getPercentChange(
        displayStats.infoSessions?.totalAttended ?? 0,
        comparisonStats?.infoSessions?.totalAttended
      ),
      workshops: getPercentChange(
        displayStats.workshops?.totalAttended ?? 0,
        comparisonStats?.workshops?.totalAttended
      ),
      offers: getPercentChange(
        displayStats.offersExtended ?? 0,
        comparisonStats?.offersExtended
      )
    };
  }, [compareEnabled, comparisonStats, displayStats, appliedStatusBreakdown]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-proxima">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <h3 className="text-lg font-semibold text-red-600 font-proxima-bold">Error Loading Data</h3>
        <p className="text-gray-600 font-proxima">{error || statsError?.message}</p>
        <Button onClick={fetchAdmissionsData} className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima">
          Retry
        </Button>
      </div>
    );
  }

  if (!displayStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 font-proxima">No data available</p>
      </div>
    );
  }

  // Render change indicator using memoized values
  const renderChange = (metricKey) => {
    if (!percentageChanges || percentageChanges[metricKey] === null) return null;
    const change = percentageChanges[metricKey];
    const isPositive = change >= 0;
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{change.toFixed(0)}%
      </span>
    );
  };

  const renderBucketRows = (buckets = {}) => {
    const bucketOrder = ['0-14', '0-30', '31-60', '61-90', '91-120', '121-150', '151-180', '180+'];
    const total = Object.values(buckets).reduce((sum, value) => sum + (Number(value) || 0), 0);

    return bucketOrder.map((bucket) => {
      const count = Number(buckets[bucket] || 0);
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return (
        <div key={bucket} className="space-y-1">
          <div className="flex items-center justify-between text-sm font-proxima">
            <span className="text-gray-700">{bucket} days</span>
            <span className="font-proxima-bold text-[#1a1a1a]">{count}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#4242ea]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    });
  };

  const TooltipLabel = ({ children, tooltip }) => (
    <span className="inline-flex items-center gap-1">
      <span>{children}</span>
      <span className="relative inline-flex group">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-proxima-bold text-gray-600">
          ?
        </span>
        <span className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-md bg-[#1a1a1a] px-3 py-2 text-left text-xs font-normal leading-snug text-white shadow-lg group-hover:block">
          {tooltip}
        </span>
      </span>
    </span>
  );

  const tooltips = {
    totalPool: 'Everyone in the selected cohort view. For the current cycle, this includes applications assigned to the current cohort plus applicant accounts that have not started an application yet.',
    infoSessionAttendees: 'Applicants in this cohort view who have attended an info session at any time. The cohort breakdown separates attendance in this recruitment cycle from attendance in prior cycles.',
    workshopParticipants: 'Applicants in this cohort view who have attended an admissions workshop at any time. For current-cycle views, this can include carried-forward applicants who attended a workshop in a prior cycle.',
    offersExtended: 'Applicants in this cohort view whose admission decision is accepted. This includes offers from this cycle and accepted applicants carried from prior cycles.',
    accountsCreated: 'Applicant accounts in this cohort view that do not yet have an application row. In the current active cycle, no-application accounts are included as current-cycle prospects.',
    inProgress: 'Applications in this cohort view with application.status = in_progress.',
    submitted: 'Applications in this cohort view with application.status = submitted.',
    ineligible: 'Applications in this cohort view with application.status = ineligible or an ineligible admissions status.',
    infoRegistered: 'Applicants in this cohort view with any info session registration record.',
    infoAttended: 'Applicants in this cohort view with attended, attended late, or very late info session attendance at any time.',
    infoThisCycle: 'Applicants in this cohort view who attended an info session during this cohort recruitment window.',
    workshopRegistered: 'Applicants in this cohort view whose pipeline stage is a workshop stage: invited, registered, attended, or no-show.',
    workshopAttended: 'Applicants in this cohort view with attended, attended late, or very late workshop attendance at any time. This can include carried-forward applicants from prior cycles.',
    offersThisCycle: 'Accepted applicants whose offer belongs to this cohort recruitment window.',
    offersPriorCycles: 'Accepted applicants in this cohort view whose offer came from a prior cycle.',
    selectedThisCycle: 'Applicants who entered or selected the selected cohort during this recruitment cycle. In the current active cycle, no-application accounts count here.',
    activityRecency: 'Latest meaningful applicant activity: signup, info session registration/attendance, application start/submission, response updates, or workshop registration/attendance. System/admin updates are excluded.'
  };

  const renderStageSummaryCards = () => {
    if (activeOverviewStage === 'applied' && appliedStatusBreakdown) {
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 font-proxima">
                <TooltipLabel tooltip={tooltips.accountsCreated}>Accounts Created</TooltipLabel>
              </div>
              <div className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">
                {appliedStatusBreakdown.accounts_created}
              </div>
              {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Selected: {appliedStatusBreakdown.accounts_created_net_new ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Carried: {appliedStatusBreakdown.accounts_created_rolled ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm text-gray-600 font-proxima">
                <TooltipLabel tooltip={tooltips.inProgress}>In Progress</TooltipLabel>
              </div>
              <div className="text-2xl font-bold text-yellow-700 font-proxima-bold">
                {appliedStatusBreakdown.in_progress}
              </div>
              {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Selected: {appliedStatusBreakdown.in_progress_net_new ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Carried: {appliedStatusBreakdown.in_progress_rolled ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 font-proxima">
                <TooltipLabel tooltip={tooltips.submitted}>Submitted</TooltipLabel>
              </div>
              <div className="text-2xl font-bold text-blue-700 font-proxima-bold">
                {appliedStatusBreakdown.submitted}
              </div>
              {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Selected: {appliedStatusBreakdown.submitted_net_new ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Carried: {appliedStatusBreakdown.submitted_rolled ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 font-proxima">
                <TooltipLabel tooltip={tooltips.ineligible}>Ineligible</TooltipLabel>
              </div>
              <div className="text-2xl font-bold text-red-700 font-proxima-bold">
                {appliedStatusBreakdown.ineligible}
              </div>
              {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Selected: {appliedStatusBreakdown.ineligible_net_new ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600 font-proxima">Carried: {appliedStatusBreakdown.ineligible_rolled ?? 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {displayStats.lastActivityBuckets && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4">
                <h4 className="text-base font-proxima-bold text-[#1a1a1a]">
                  <TooltipLabel tooltip={tooltips.activityRecency}>Activity Recency</TooltipLabel>
                </h4>
                <p className="text-sm text-gray-500 font-proxima">
                  Latest applicant activity from signup, event registration/attendance, application start/submission, or response updates.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderBucketRows(displayStats.lastActivityBuckets)}
              </div>
            </div>
          )}
        </>
      );
    }

    if (activeOverviewStage === 'info') {
      const total = displayStats.infoSessions?.totalRegistrations ?? 0;
      const attended = displayStats.infoSessions?.totalAttended ?? 0;
      const attendedThisCohort = displayStats.infoSessions?.attendedThisCohort ?? 0;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.infoRegistered}>Registered for Info Session</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-purple-700 font-proxima-bold">{total}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.infoAttended}>Attended Info Session</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-green-700 font-proxima-bold">{attended}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.infoThisCycle}>Attended This Cycle</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-blue-700 font-proxima-bold">{attendedThisCohort}</div>
          </div>
        </div>
      );
    }

    if (activeOverviewStage === 'workshops') {
      const total = displayStats.workshops?.totalRegistrations ?? 0;
      const attended = displayStats.workshops?.totalAttended ?? 0;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.workshopRegistered}>Workshop Registered / Invited</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-purple-700 font-proxima-bold">{total}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.workshopAttended}>Workshop Attended</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-green-700 font-proxima-bold">{attended}</div>
          </div>
        </div>
      );
    }

    if (activeOverviewStage === 'offers') {
      const total = displayStats.offers?.total ?? displayStats.offersExtended ?? 0;
      const thisCohort = displayStats.offers?.thisCohort ?? 0;
      const priorCohorts = displayStats.offers?.priorCohorts ?? 0;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.offersExtended}>Offers Extended</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-green-700 font-proxima-bold">{total}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.offersThisCycle}>This Cycle</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-blue-700 font-proxima-bold">{thisCohort}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.offersPriorCycles}>Prior Cycles</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">{priorCohorts}</div>
          </div>
        </div>
      );
    }

    if (activeOverviewStage === 'marketing') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.totalPool}>Total Pool</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">
              {displayStats.totalApplicants ?? 0}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.selectedThisCycle}>Selected This Cycle</TooltipLabel>
            </div>
            <div className="text-2xl font-bold text-blue-700 font-proxima-bold">
              {displayStats.sourceBreakdown?.selected_this_cycle ?? 0}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a1a1a] font-proxima-bold">
          AI Native Recruitment Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <Select value={overviewQuickView || 'all_time'} onValueChange={setOverviewQuickView}>
            <SelectTrigger className="w-[200px] bg-white border-gray-200 font-proxima">
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent className="font-proxima">
              <SelectItem value="all_time">Cohort: All Time</SelectItem>
              {cohorts?.map(cohort => (
                <SelectItem key={cohort.cohort_id} value={cohort.cohort_id}>
                  {cohort.name}
                </SelectItem>
              ))}
              <SelectItem value="deferred">Deferred Applicants</SelectItem>
            </SelectContent>
          </Select>
          
          {previousCohortId && (
            <label className="flex items-center gap-2 cursor-pointer font-proxima">
              <Checkbox 
                checked={compareEnabled} 
                onCheckedChange={setCompareEnabled}
              />
              <span className="text-sm text-gray-700">Compare to Last Cycle</span>
            </label>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Total Pool with source bucket breakdown */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.totalPool}>Total Pool</TooltipLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {appliedStatusBreakdown?.total ?? displayStats.totalApplicants ?? 0}
            </div>
            {/* Source bucket breakdown */}
            {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Selected This Cycle: {displayStats.sourceBreakdown?.selected_this_cycle ?? displayStats.netNewApplicants ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Carried Forward: {displayStats.sourceBreakdown?.carried_forward ?? displayStats.rolloverApplicants ?? 0}</span>
                </div>
              </div>
            )}
            {renderChange('applicants')}
          </CardContent>
        </Card>

        {/* Info Session Attendees */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.infoSessionAttendees}>Info Session Attendees</TooltipLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {displayStats.infoSessions?.totalAttended ?? 0}
            </div>
            {/* This cohort vs any cohort breakdown */}
            {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && displayStats.infoSessions?.attendedThisCohort !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">This Cohort: {displayStats.infoSessions.attendedThisCohort}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Prior Cohorts: {(displayStats.infoSessions.totalAttended ?? 0) - (displayStats.infoSessions.attendedThisCohort ?? 0)}</span>
                </div>
              </div>
            )}
            {renderChange('infoSessions')}
          </CardContent>
        </Card>

        {/* Workshop Participants */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.workshopParticipants}>Workshop Participants</TooltipLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {displayStats.workshops?.totalAttended ?? 0}
            </div>
            {/* This cohort vs any cohort breakdown */}
            {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && displayStats.workshops?.attendedThisCohort !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">This Cohort: {displayStats.workshops.attendedThisCohort}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Prior Cohorts: {(displayStats.workshops.totalAttended ?? 0) - (displayStats.workshops.attendedThisCohort ?? 0)}</span>
                </div>
              </div>
            )}
            {renderChange('workshops')}
          </CardContent>
        </Card>

        {/* Offers Extended */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">
              <TooltipLabel tooltip={tooltips.offersExtended}>Offers Extended</TooltipLabel>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {displayStats.offers?.total ?? displayStats.offersExtended ?? 0}
            </div>
            {/* This cohort vs prior cohorts breakdown */}
            {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && displayStats.offers !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">This Cohort: {displayStats.offers?.thisCohort ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Prior Cohorts: {displayStats.offers?.priorCohorts ?? 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Stage Selection Tabs */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#1a1a1a] font-proxima-bold">
              Pipeline Demographics
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={overviewDeliberationFilter || '_all'} onValueChange={(value) => setOverviewDeliberationFilter(value === '_all' ? '' : value)}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 font-proxima">
                  <SelectValue placeholder="All Deliberations" />
                </SelectTrigger>
                <SelectContent className="font-proxima">
                  <SelectItem value="_all">All Deliberations</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="null">Not Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stage Pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['applied', 'info', 'workshops', 'offers', 'marketing'].map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveOverviewStage(stage)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all font-proxima ${
                  activeOverviewStage === stage
                    ? 'bg-[#4242ea] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stage === 'applied' && 'Applied'}
                {stage === 'info' && 'Info Sessions'}
                {stage === 'workshops' && 'Workshops'}
                {stage === 'offers' && 'Offers'}
                {stage === 'marketing' && 'Marketing'}
              </button>
            ))}
          </div>

          {renderStageSummaryCards()}

          {/* Demographics Charts */}
          {demoLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-3 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-proxima">Loading demographics...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-4 font-proxima">Race/Ethnicity</h4>
                <div className="space-y-2">
                  {demographics?.race?.length > 0 ? (
                    demographics.race.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-proxima">{item.label}</span>
                        <span className="text-sm font-medium text-[#1a1a1a] font-proxima-bold">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 font-proxima">No data available</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-4 font-proxima">Gender</h4>
                <div className="space-y-2">
                  {demographics?.gender?.length > 0 ? (
                    demographics.gender.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-proxima">{item.label}</span>
                        <span className="text-sm font-medium text-[#1a1a1a] font-proxima-bold">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 font-proxima">No data available</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-4 font-proxima">Education Level</h4>
                <div className="space-y-2">
                  {demographics?.education?.length > 0 ? (
                    demographics.education.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-proxima truncate">{item.label}</span>
                        <span className="text-sm font-medium text-[#1a1a1a] font-proxima-bold">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 font-proxima">No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;

