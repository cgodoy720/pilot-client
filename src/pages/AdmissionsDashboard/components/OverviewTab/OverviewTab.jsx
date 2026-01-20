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
        {/* Total Pool with Net New vs Rollover breakdown */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Total Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {appliedStatusBreakdown?.total ?? displayStats.totalApplicants ?? 0}
            </div>
            {/* Net New vs Rollover breakdown */}
            {(overviewQuickView && overviewQuickView !== 'all_time' && overviewQuickView !== 'deferred') && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Net New: {displayStats.netNewApplicants ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600 font-proxima">Rolled Over: {displayStats.rolloverApplicants ?? 0}</span>
                </div>
              </div>
            )}
            {renderChange('applicants')}
          </CardContent>
        </Card>

        {/* Info Session Attendees */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Info Session Attendees</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Workshop Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {displayStats.workshops?.totalAttended ?? 0}
            </div>
            {renderChange('workshops')}
          </CardContent>
        </Card>

        {/* Offers Extended */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Offers Extended</CardTitle>
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
            {compareEnabled && comparisonStats ? (
              renderChange('offers')
            ) : (
              <span className="text-sm text-gray-500 font-proxima">
                {displayStats.totalApplicants > 0 
                  ? `${Math.round(((displayStats.offers?.total ?? displayStats.offersExtended ?? 0) / displayStats.totalApplicants) * 100)}%`
                  : '0%'
                }
              </span>
            )}
          </CardContent>
        </Card>

        {/* Marketing Insights - Only for All Time and December 2025 */}
        {overviewQuickView !== 'deferred' && (
          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Marketing Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#4242ea] font-proxima-bold">
                📊
              </div>
              <span className="text-sm text-gray-500 font-proxima">Click for details</span>
            </CardContent>
          </Card>
        )}
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

          {/* Status Breakdown for Applied Stage */}
          {activeOverviewStage === 'applied' && appliedStatusBreakdown && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 font-proxima">Accounts Created</div>
                <div className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">
                  {appliedStatusBreakdown.accounts_created}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 font-proxima">In Progress</div>
                <div className="text-2xl font-bold text-yellow-700 font-proxima-bold">
                  {appliedStatusBreakdown.in_progress}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 font-proxima">Submitted</div>
                <div className="text-2xl font-bold text-blue-700 font-proxima-bold">
                  {appliedStatusBreakdown.submitted}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 font-proxima">Ineligible</div>
                <div className="text-2xl font-bold text-red-700 font-proxima-bold">
                  {appliedStatusBreakdown.ineligible}
                </div>
              </div>
            </div>
          )}

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

