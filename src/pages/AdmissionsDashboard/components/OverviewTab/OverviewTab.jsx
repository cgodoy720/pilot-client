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
  
  // Get previous cohort ID for comparison
  const previousCohortId = useMemo(() => {
    if (overviewQuickView === 'dec2025') {
      const sep2025 = cohorts.find(c => {
        const n = (c.name || '').toLowerCase();
        return (n.includes('sep') || n.includes('september')) && n.includes('2025');
      });
      return sep2025?.cohort_id;
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
              <SelectItem value="dec2025">December 2025</SelectItem>
              <SelectItem value="sep2025">September 2025</SelectItem>
              <SelectItem value="deferred">Deferred Applicants</SelectItem>
            </SelectContent>
          </Select>
          
          {overviewQuickView === 'dec2025' && (
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
        {/* Total Applicants */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {appliedStatusBreakdown?.total ?? displayStats.totalApplicants ?? 0}
            </div>
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
              {displayStats.offersExtended ?? 0}
            </div>
            {compareEnabled && comparisonStats ? (
              renderChange('offers')
            ) : (
              <span className="text-sm text-gray-500 font-proxima">
                {displayStats.totalApplicants > 0 
                  ? `${Math.round(((displayStats.offersExtended ?? 0) / displayStats.totalApplicants) * 100)}%`
                  : '0%'
                }
              </span>
            )}
          </CardContent>
        </Card>

        {/* Marketing Insights - Only for All Time and December 2025 */}
        {(overviewQuickView === 'all_time' || overviewQuickView === 'dec2025' || !overviewQuickView) && (
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

