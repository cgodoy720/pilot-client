import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';

const OverviewTab = ({
  loading,
  error,
  stats,
  cohorts,
  overviewQuickView,
  setOverviewQuickView,
  compareEnabled,
  setCompareEnabled,
  previousOverviewStats,
  appliedStatusBreakdown,
  activeOverviewStage,
  setActiveOverviewStage,
  stageDemographics,
  setStageDemographics,
  applicantStatusFilter,
  setApplicantStatusFilter,
  overviewDeliberationFilter,
  setOverviewDeliberationFilter,
  demographicBreakdown,
  setDemographicBreakdown,
  token,
  getOverviewCohortParam,
  setComputedOverviewStats,
  setAppliedStatusBreakdown,
  setPreviousOverviewStats,
  fetchAdmissionsData
}) => {
  const [demographicsLoading, setDemographicsLoading] = React.useState(false);
  // Compute stats for filtered view
  const computeOverviewStatsForFilter = async () => {
    const cohortParam = getOverviewCohortParam();
    if (!cohortParam) {
      setComputedOverviewStats(null);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('limit', 1000); // Reduced from 10000 to prevent timeout
      params.append('offset', 0);
      params.append('cohort_id', cohortParam);
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch applications for overview filter');
      const data = await resp.json();
      const apps = Array.isArray(data?.applications) ? data.applications : [];

      const totalApplicants = data?.total || apps.length;
      const countBy = (arr, keyGetter) => arr.reduce((acc, item) => {
        const key = keyGetter(item) || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const applicationStatusCounts = countBy(apps, a => a.status);
      const applicationStats = Object.keys(applicationStatusCounts).map(status => ({ status, count: applicationStatusCounts[status] }));

      const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
      const infoSessionRegistrations = apps.filter(a => (a.info_session_status && a.info_session_status !== 'not_registered')).length;
      const infoSessionAttended = apps.filter(a => attendedSet.has(a.info_session_status)).length;
      
      let workshopRegistrations = apps.filter(a => (a.workshop_status && a.workshop_status !== 'pending')).length;
      let workshopAttended = apps.filter(a => attendedSet.has(a.workshop_status)).length;

      const offersExtended = apps.filter(a => a.program_admission_status === 'accepted').length;

      const computed = {
        totalApplicants,
        applicationStats,
        infoSessions: {
          totalSessions: infoSessionRegistrations,
          totalRegistrations: infoSessionRegistrations,
          totalAttended: infoSessionAttended
        },
        workshops: {
          totalWorkshops: workshopRegistrations,
          totalRegistrations: workshopRegistrations,
          totalAttended: workshopAttended
        },
        offersExtended
      };
      setComputedOverviewStats(computed);
    } catch (e) {
      console.error('Error computing overview stats for filter:', e);
      setComputedOverviewStats(null);
    }
  };

  // Load stage demographics
  const loadStageDemographics = async (stage) => {
    setDemographicsLoading(true);
    try {
      const cohortParam = getOverviewCohortParam();
      const params = new URLSearchParams();
      params.append('limit', 1000); // Reduced from 10000 to prevent timeout
      params.append('offset', 0);
      if (cohortParam) params.append('cohort_id', cohortParam);

      const appsResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!appsResp.ok) throw new Error('Failed to load applications for stage demographics');
      const appsData = await appsResp.json();
      let apps = Array.isArray(appsData?.applications) ? appsData.applications : [];

      // Filter by deliberation if selected
      if (overviewDeliberationFilter) {
        if (overviewDeliberationFilter === 'null') {
          apps = apps.filter(a => !a.deliberation);
        } else {
          apps = apps.filter(a => a.deliberation === overviewDeliberationFilter);
        }
      }

      // Filter by stage
      const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
      let stageApps = apps;
      if (stage === 'info') {
        stageApps = apps.filter(a => attendedSet.has(a.info_session_status));
      } else if (stage === 'workshops') {
        stageApps = apps.filter(a => attendedSet.has(a.workshop_status));
      } else if (stage === 'offers') {
        stageApps = apps.filter(a => a.program_admission_status === 'accepted');
      }

      // Calculate status breakdown for applied stage
      const statusBreakdown = {
        total: apps.length,
        accounts_created: apps.filter(a => a.status === 'no_application').length,
        in_progress: apps.filter(a => a.status === 'in_progress').length,
        submitted: apps.filter(a => a.status === 'submitted').length,
        ineligible: apps.filter(a => a.status === 'ineligible').length
      };
      setAppliedStatusBreakdown(statusBreakdown);

      // Fetch detailed demographic data for the stage
      const ids = stageApps.map(a => a.applicant_id).filter(Boolean);
      if (ids.length > 0) {
        try {
          const expResp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${ids.join(',')}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (expResp.ok) {
            const detailed = await expResp.json();
            const agg = { race: {}, gender: {}, education: {}, borough: {} };
            const add = (obj, key) => { if (!key) return; obj[key] = (obj[key] || 0) + 1; };
            
            detailed.forEach(d => {
              const dem = d.demographics || {};
              const raceVal = dem.race_ethnicity;
              if (Array.isArray(raceVal)) {
                raceVal.forEach(r => add(agg.race, r));
              } else {
                add(agg.race, raceVal);
              }
              add(agg.gender, dem.gender);
              add(agg.education, dem.education_level);
              
              // Borough parsing
              const addr = (dem.address || '').toLowerCase();
              const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
              const matched = boroughs.find(b => addr.includes(b));
              add(agg.borough, matched || (addr ? 'other' : 'unknown'));
            });
            
            const toArray = (o) => Object.keys(o).map(k => ({ label: k || 'Unknown', count: o[k] })).sort((a,b) => b.count - a.count);
            setDemographicBreakdown({
              race: toArray(agg.race),
              gender: toArray(agg.gender),
              education: toArray(agg.education),
              borough: toArray(agg.borough)
            });
          } else {
            setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
          }
        } catch (demErr) {
          console.error('Error fetching demographics:', demErr);
          setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
        }
      } else {
        setDemographicBreakdown({ race: [], gender: [], education: [], borough: [] });
      }

    } catch (err) {
      console.error('Error loading stage demographics:', err);
    } finally {
      setDemographicsLoading(false);
    }
  };

  // Effect to compute stats when filter changes
  useEffect(() => {
    if (overviewQuickView && overviewQuickView !== 'all_time') {
      computeOverviewStatsForFilter();
    }
  }, [overviewQuickView, cohorts, token]);

  // Effect to load stage demographics
  useEffect(() => {
    loadStageDemographics(activeOverviewStage);
  }, [activeOverviewStage, overviewQuickView, overviewDeliberationFilter, applicantStatusFilter, token]);

  // Effect to fetch previous cycle stats for comparison
  useEffect(() => {
    if (compareEnabled && overviewQuickView === 'dec2025') {
      // Fetch September 2025 stats for comparison
      const fetchPreviousStats = async () => {
        try {
          const sep2025 = cohorts.find(c => {
            const n = (c.name || '').toLowerCase();
            return (n.includes('sep') || n.includes('september')) && n.includes('2025');
          });
          if (!sep2025) return;

          const params = new URLSearchParams();
          params.append('limit', 1000); // Reduced from 10000 to prevent timeout
          params.append('offset', 0);
          params.append('cohort_id', sep2025.cohort_id);

          const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!resp.ok) return;
          const data = await resp.json();
          const apps = Array.isArray(data?.applications) ? data.applications : [];

          const attendedSet = new Set(['attended', 'attended_late', 'very_late']);
          setPreviousOverviewStats({
            totalApplicants: data.total || apps.length,
            infoSessions: {
              totalAttended: apps.filter(a => attendedSet.has(a.info_session_status)).length
            },
            workshops: {
              totalAttended: apps.filter(a => attendedSet.has(a.workshop_status)).length
            },
            offersExtended: apps.filter(a => a.program_admission_status === 'accepted').length
          });
        } catch (err) {
          console.error('Error fetching previous stats:', err);
        }
      };
      fetchPreviousStats();
    } else {
      setPreviousOverviewStats(null);
    }
  }, [compareEnabled, overviewQuickView, cohorts, token]);

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
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <h3 className="text-lg font-semibold text-red-600 font-proxima-bold">Error Loading Data</h3>
        <p className="text-gray-600 font-proxima">{error}</p>
        <Button onClick={fetchAdmissionsData} className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima">
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 font-proxima">No data available</p>
      </div>
    );
  }

  // Calculate percentage change
  const getPercentChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Render change indicator
  const renderChange = (current, previous) => {
    if (!compareEnabled || !previousOverviewStats) return null;
    const change = getPercentChange(current, previous);
    if (change === null) return null;
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
              {appliedStatusBreakdown?.total ?? stats.totalApplicants ?? 0}
            </div>
            {renderChange(
              appliedStatusBreakdown?.total ?? stats.totalApplicants ?? 0,
              previousOverviewStats?.totalApplicants
            )}
          </CardContent>
        </Card>

        {/* Info Session Attendees */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Info Session Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {stats.infoSessions?.totalAttended ?? 0}
            </div>
            {renderChange(
              stats.infoSessions?.totalAttended ?? 0,
              previousOverviewStats?.infoSessions?.totalAttended
            )}
          </CardContent>
        </Card>

        {/* Workshop Participants */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Workshop Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {stats.workshops?.totalAttended ?? 0}
            </div>
            {renderChange(
              stats.workshops?.totalAttended ?? 0,
              previousOverviewStats?.workshops?.totalAttended
            )}
          </CardContent>
        </Card>

        {/* Offers Extended */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Offers Extended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {stats.offersExtended ?? 0}
            </div>
            {compareEnabled && previousOverviewStats ? (
              renderChange(stats.offersExtended ?? 0, previousOverviewStats?.offersExtended)
            ) : (
              <span className="text-sm text-gray-500 font-proxima">
                {stats.totalApplicants > 0 
                  ? `${Math.round(((stats.offersExtended ?? 0) / stats.totalApplicants) * 100)}%`
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
          {demographicsLoading ? (
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
                  {demographicBreakdown.race?.length > 0 ? (
                    demographicBreakdown.race.slice(0, 5).map((item, idx) => (
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
                  {demographicBreakdown.gender?.length > 0 ? (
                    demographicBreakdown.gender.slice(0, 5).map((item, idx) => (
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
                  {demographicBreakdown.education?.length > 0 ? (
                    demographicBreakdown.education.slice(0, 5).map((item, idx) => (
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

