import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { getWeekDateRange, getMilestoneInfo } from '../shared/utils';
import JobApplicationDetailModal from '../shared/JobApplicationDetailModal';

const OverviewTab = ({
  overview,
  leaderboard,
  highlights,
  weekOffset,
  setWeekOffset,
  expandedHighlightGroups,
  toggleHighlightGroup,
  token,
  cohortFilter,
  onRefresh
}) => {
  if (!overview) return null;

  // Interview picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState('builder');
  const [builders, setBuilders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);

  const openPicker = async () => {
    setShowPicker(true);
    setPickerStep('builder');
    setSearchQuery('');
    setSelectedBuilder(null);
    setApplications([]);
    setPickerLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders`;
      if (cohortFilter && cohortFilter !== 'all') {
        url += `?cohort=${encodeURIComponent(cohortFilter)}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBuilders(data);
    } catch (err) {
      console.error('Error fetching builders:', err);
    } finally {
      setPickerLoading(false);
    }
  };

  const selectBuilder = async (builder) => {
    setSelectedBuilder(builder);
    setPickerStep('application');
    setPickerLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders/${builder.builder_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setApplications(data.applications?.data || []);
    } catch (err) {
      console.error('Error fetching builder applications:', err);
    } finally {
      setPickerLoading(false);
    }
  };

  const selectApplication = (app) => {
    setSelectedApplication(app);
    setShowPicker(false);
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerStep('builder');
    setSearchQuery('');
    setSelectedBuilder(null);
    setApplications([]);
  };

  const filteredBuilders = builders.filter(b =>
    `${b.first_name} ${b.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLeaderboard = (types, isWeekly = true) => {
    if (leaderboard.length === 0) {
      return <p className="text-gray-500 text-sm">No leaderboard data available</p>;
    }

    const leaderboardLabels = isWeekly
      ? {
          top_weekly_applications: '📝 Top Applications',
          top_weekly_interviews: '💼 Top Interviews',
          top_weekly_networking: '🤝 Top Hustles'
        }
      : {
          top_total_applications: '📝 Top Applications',
          top_total_interviews: '💼 Top Interviews',
          top_total_networking: '🤝 Top Hustles',
          top_total_offers: '🎉 Most Offers',
          top_total_launches: '🚀 Most Launches'
        };

    return (
      <div className="space-y-5">
        {types.map(leaderboardType => {
          const itemsOfType = leaderboard.filter(item => item.leaderboard_type === leaderboardType);
          if (itemsOfType.length === 0) return null;

          return (
            <div key={leaderboardType} className="mb-5 last:mb-0">
              <div className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b border-[#f0f0f0]">
                {leaderboardLabels[leaderboardType]}
              </div>
              <ol className="space-y-2">
                {itemsOfType.slice(0, 5).map((item, index) => {
                  let metric = 0;
                  let metricLabel = '';
                  
                  if (isWeekly) {
                    if (leaderboardType === 'top_weekly_applications') {
                      metric = item.weekly_applications;
                      metricLabel = item.weekly_applications === 1 ? 'application' : 'applications';
                    } else if (leaderboardType === 'top_weekly_interviews') {
                      metric = item.weekly_interviews;
                      metricLabel = item.weekly_interviews === 1 ? 'interview' : 'interviews';
                    } else if (leaderboardType === 'top_weekly_networking') {
                      metric = item.weekly_networking;
                      metricLabel = item.weekly_networking === 1 ? 'hustle' : 'hustles';
                    }
                  } else {
                    if (leaderboardType === 'top_total_applications') {
                      metric = item.total_applications;
                      metricLabel = 'applications';
                    } else if (leaderboardType === 'top_total_interviews') {
                      metric = item.total_interviews;
                      metricLabel = 'interviews';
                    } else if (leaderboardType === 'top_total_networking') {
                      metric = item.total_networking;
                      metricLabel = 'hustles';
                    } else if (leaderboardType === 'top_total_offers') {
                      metric = item.total_offers;
                      metricLabel = 'offers';
                    } else if (leaderboardType === 'top_total_launches') {
                      metric = item.total_launches;
                      metricLabel = 'launches';
                    }
                  }

                  return (
                    <li key={`${leaderboardType}-${index}`} className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-[#f8f9fa] transition-colors">
                      <span className="text-[#1a1a1a] text-sm">
                        {item.first_name} {item.last_name}
                      </span>
                      <span className="text-[#666] font-medium text-sm">
                        {metric} {metricLabel}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHighlights = (types, isWeekly = true) => {
    if (highlights.length === 0) {
      return <p className="text-gray-500 text-sm">No highlights or flags for this period</p>;
    }

    const typeLabels = isWeekly
      ? {
          offer: '🎉 Offers',
          launch: '🚀 Project Launches',
          interviews: '💼 Multiple Interviews',
          applications: '📝 High Applications',
          networking: '🤝 High Networking',
          first_application: '🎉 First Applications',
          milestone_10_apps: '🚀 10 Applications',
          milestone_25_apps: '🔥 25 Applications',
          milestone_50_apps: '🏆 50 Applications',
          milestone_100_apps: '💯 100 Applications',
          first_hustle: '⚡ First Hustles',
          milestone_10_hustles: '⚡ 10 Hustles',
          milestone_25_hustles: '⚡ 25 Hustles',
          milestone_50_hustles: '⚡ 50 Hustles',
          milestone_100_hustles: '⚡ 100 Hustles',
          first_interview: '🎯 First Interviews',
          milestone_5_interviews: '🎙️ 5 Interviews',
          milestone_10_interviews: '🌟 10 Interviews',
          first_offer: '🎊 First Offers',
          inactive: '🔴 Inactive This Week',
          no_hustles: '⚠️ No Hustles',
          no_builds: '⚠️ No Builds',
          no_jobs: '⚠️ No Jobs'
        }
      : {
          offer_alltime: '🎉 Received Offers',
          interviews_alltime: '💼 5+ Interviews',
          applications_alltime: '📝 25+ Applications',
          networking_alltime: '🤝 50+ Hustles',
          no_activity_alltime: '⚠️ No Activity Ever'
        };

    return (
      <div className="space-y-2">
        {types.map(type => {
          const itemsOfType = highlights.filter(item => {
            if (isWeekly) {
              const info = getMilestoneInfo(item);
              return info && (
                (type === 'offer' && info.type === 'highlight' && item.weekly_offers > 0) ||
                (type === 'launch' && info.type === 'highlight' && item.weekly_launches > 0) ||
                (type === 'interviews' && info.type === 'highlight' && item.weekly_interviews >= 3) ||
                (type === 'applications' && info.type === 'highlight' && item.weekly_applications >= 10) ||
                (type === 'networking' && info.type === 'highlight' && item.weekly_networking >= 15) ||
                (item.milestone_type === type)
              );
            } else {
              return (
                (type === 'offer_alltime' && item.total_offers >= 1) ||
                (type === 'interviews_alltime' && item.total_interviews >= 5) ||
                (type === 'applications_alltime' && item.total_applications >= 25) ||
                (type === 'networking_alltime' && item.total_networking >= 50) ||
                (type === 'no_activity_alltime' && item.milestone_type === 'no_activity')
              );
            }
          });

          if (itemsOfType.length === 0) return null;

          return (
            <div key={type} className="border border-[#e0e0e0] rounded-lg mb-2 overflow-hidden">
              <div
                className="flex items-center gap-2 p-3 bg-[#f8f9fa] cursor-pointer hover:bg-[#e9ecef] transition-colors"
                onClick={() => toggleHighlightGroup(type)}
              >
                <span className="text-xs text-[#666]">{expandedHighlightGroups[type] ? '▼' : '▶'}</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{typeLabels[type]}</span>
                <span className="text-xs text-[#666]">({itemsOfType.length})</span>
              </div>
              {expandedHighlightGroups[type] && (
                <div className="p-3 space-y-2 bg-white">
                  {itemsOfType.map((item, index) => {
                    let info, text, icon, bgType;
                    
                    if (isWeekly) {
                      info = getMilestoneInfo(item);
                      if (!info) return null;
                      text = info.text;
                      icon = info.icon;
                      bgType = info.type;
                    } else {
                      bgType = type === 'no_activity_alltime' ? 'flag' : 'highlight';
                      if (type === 'offer_alltime') {
                        icon = '🎉';
                        text = `${item.first_name} ${item.last_name} has ${item.total_offers} offer${item.total_offers > 1 ? 's' : ''}`;
                      } else if (type === 'interviews_alltime') {
                        icon = '💼';
                        text = `${item.first_name} ${item.last_name} has ${item.total_interviews} interviews`;
                      } else if (type === 'applications_alltime') {
                        icon = '📝';
                        text = `${item.first_name} ${item.last_name} has ${item.total_applications} applications`;
                      } else if (type === 'networking_alltime') {
                        icon = '🤝';
                        text = `${item.first_name} ${item.last_name} has ${item.total_networking} hustles`;
                      } else if (type === 'no_activity_alltime') {
                        icon = '⚠️';
                        text = `${item.first_name} ${item.last_name} has no activity at all`;
                      }
                    }

                    return (
                      <div
                        key={`${type}-${index}`}
                        className={`flex items-center gap-2 p-2.5 rounded text-sm ${
                          bgType === 'highlight'
                            ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]'
                            : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStats = (isWeekly = true) => {
    const stats = isWeekly
      ? {
          activeBuilders: overview.weekly_active_builders || 0,
          networking: overview.weekly_networking || 0,
          networkingDigital: overview.weekly_networking_digital || 0,
          networkingIRL: overview.weekly_networking_irl || 0,
          buildsInProgress: overview.weekly_builds_in_progress || 0,
          buildsCompleted: overview.weekly_builds_completed || 0,
          applications: overview.weekly_applications || 0,
          interviews: overview.weekly_interviews || 0,
          offers: overview.weekly_offers || 0,
          rejections: overview.weekly_rejections || 0
        }
      : {
          activeBuilders: overview.active_builders || 0,
          networking: overview.total_networking || 0,
          networkingDigital: overview.total_networking_digital || 0,
          networkingIRL: overview.total_networking_irl || 0,
          buildsInProgress: overview.builds_in_progress || 0,
          buildsCompleted: overview.builds_completed || 0,
          applications: overview.total_applications || 0,
          interviews: overview.total_interviews || 0,
          offers: overview.total_offers || 0,
          rejections: overview.total_rejections || 0
        };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#e0e0e0] shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs text-[#666] mb-2 uppercase tracking-wide">Active Builders</div>
            <div className="text-3xl font-bold text-[#1a1a1a]">{stats.activeBuilders}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#e0e0e0] shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <div className="text-xs text-[#666] uppercase tracking-wide">Total Hustles</div>
                <div className="text-xl font-bold text-[#1a1a1a]">{stats.networking}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">Digital</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{stats.networkingDigital}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">IRL</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{stats.networkingIRL}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#e0e0e0] shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <div className="text-xs text-[#666] uppercase tracking-wide">Builds in Progress</div>
                <div className="text-xl font-bold text-[#1a1a1a]">{stats.buildsInProgress}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">Builds Completed</div>
                <div className="text-lg font-bold text-[#1a1a1a]">{stats.buildsCompleted}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#e0e0e0] shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <div className="text-xs text-[#666] uppercase tracking-wide">{isWeekly ? 'Applications' : 'Total Applications'}</div>
                <div className="text-xl font-bold text-[#1a1a1a]">{stats.applications}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">{isWeekly ? 'Interviews' : 'Total Interviews'}</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{stats.interviews}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">{isWeekly ? 'Offers' : 'Total Offers'}</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{stats.offers}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#666]">{isWeekly ? 'Rejections' : 'Total Rejections'}</div>
                <div className="text-sm font-semibold text-[#1a1a1a]">{stats.rejections}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      {/* This Week Stats */}
      <div className="bg-[#f8f9fa] rounded-lg p-6 border border-[#e0e0e0]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0e0]">
          <h2 className="text-2xl font-semibold text-[#1a1a1a] m-0">
            {weekOffset === 0 
              ? `This Week (${getWeekDateRange(weekOffset)})` 
              : `Week of ${getWeekDateRange(weekOffset)}`}
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={openPicker}
              className="bg-[#4242ea] text-white hover:bg-[#3333d1]"
            >
              Log Interview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(weekOffset - 1)}
              title="Previous week"
              className="border-[#d0d0d0] hover:bg-[#f0f0f0]"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
              title="Next week"
              className="border-[#d0d0d0] hover:bg-[#f0f0f0]"
            >
              →
            </Button>
            {weekOffset !== 0 && (
              <Button
                size="sm"
                onClick={() => setWeekOffset(0)}
                className="bg-[#4242ea] text-white hover:bg-[#3333d1]"
              >
                Back to This Week
              </Button>
            )}
          </div>
        </div>

        {/* Week Overview Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Leaderboard Panel */}
          <Card className="bg-white border border-[#e0e0e0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f0f0f0]">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">🏆 Top Builders</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {renderLeaderboard(['top_weekly_networking', 'top_weekly_applications', 'top_weekly_interviews'], true)}
            </CardContent>
          </Card>

          {/* Highlights Panel */}
          <Card className="bg-white border border-[#e0e0e0] shadow-sm lg:col-span-2">
            <CardHeader className="pb-3 border-b border-[#f0f0f0]">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Highlights & Flags</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 max-h-[500px] overflow-y-auto">
              {renderHighlights([
                'offer',
                'launch',
                'interviews',
                'applications',
                'networking',
                'first_application',
                'milestone_10_apps',
                'milestone_25_apps',
                'milestone_50_apps',
                'milestone_100_apps',
                'first_hustle',
                'milestone_10_hustles',
                'milestone_25_hustles',
                'milestone_50_hustles',
                'milestone_100_hustles',
                'first_interview',
                'milestone_5_interviews',
                'milestone_10_interviews',
                'first_offer',
                'inactive',
                'no_hustles',
                'no_builds',
                'no_jobs'
              ], true)}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        {renderStats(true)}
      </div>

      {/* All Time Stats */}
      <div className="bg-[#f8f9fa] rounded-lg p-6 border border-[#e0e0e0]">
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-6 pb-4 border-b border-[#e0e0e0]">All Time</h2>

        {/* All Time Overview Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* All Time Leaderboard Panel */}
          <Card className="bg-white border border-[#e0e0e0] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f0f0f0]">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">🏆 Top Builders</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {renderLeaderboard([
                'top_total_networking',
                'top_total_applications',
                'top_total_interviews',
                'top_total_offers',
                'top_total_launches'
              ], false)}
            </CardContent>
          </Card>

          {/* All Time Highlights Panel */}
          <Card className="bg-white border border-[#e0e0e0] shadow-sm lg:col-span-2">
            <CardHeader className="pb-3 border-b border-[#f0f0f0]">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Highlights & Flags</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 max-h-[500px] overflow-y-auto">
              {renderHighlights([
                'offer_alltime',
                'interviews_alltime',
                'applications_alltime',
                'networking_alltime',
                'no_activity_alltime'
              ], false)}
            </CardContent>
          </Card>
        </div>

        {/* All Time Stats Grid */}
        {renderStats(false)}
      </div>

      {/* Builder/Application Picker Dialog */}
      <Dialog open={showPicker} onOpenChange={(open) => { if (!open) closePicker(); }}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {pickerStep === 'builder' ? 'Select a Builder' : `${selectedBuilder?.first_name} ${selectedBuilder?.last_name} - Select Application`}
            </DialogTitle>
          </DialogHeader>

          {pickerStep === 'builder' && (
            <div className="flex flex-col gap-3 overflow-hidden">
              <Input
                placeholder="Search Builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="overflow-y-auto max-h-[50vh] space-y-1">
                {pickerLoading ? (
                  <p className="text-sm text-gray-500 p-4 text-center">Loading...</p>
                ) : filteredBuilders.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">No Builders found</p>
                ) : (
                  filteredBuilders.map(b => (
                    <button
                      key={b.builder_id}
                      onClick={() => selectBuilder(b)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[#f0f0f0] transition-colors text-sm"
                    >
                      <span className="font-medium">{b.first_name} {b.last_name}</span>
                      <span className="text-gray-500 ml-2">({b.application_count || 0} applications)</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {pickerStep === 'application' && (
            <div className="flex flex-col gap-3 overflow-hidden">
              <Button variant="ghost" size="sm" onClick={() => { setPickerStep('builder'); setSearchQuery(''); }} className="self-start">
                Back to Builders
              </Button>
              <div className="overflow-y-auto max-h-[50vh] space-y-1">
                {pickerLoading ? (
                  <p className="text-sm text-gray-500 p-4 text-center">Loading...</p>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">No applications found for this Builder</p>
                ) : (
                  applications.map(app => (
                    <button
                      key={app.job_application_id}
                      onClick={() => selectApplication(app)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[#f0f0f0] transition-colors text-sm border border-[#e0e0e0] mb-1"
                    >
                      <div className="font-medium">{app.company_name}</div>
                      <div className="text-gray-500">{app.role_title || 'No role specified'} - {app.stage}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Application Detail Modal (for logging interview) */}
      <JobApplicationDetailModal
        application={selectedApplication}
        open={!!selectedApplication}
        onOpenChange={(open) => { if (!open) setSelectedApplication(null); }}
        token={token}
        onRefresh={() => {
          setSelectedApplication(null);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default memo(OverviewTab);

