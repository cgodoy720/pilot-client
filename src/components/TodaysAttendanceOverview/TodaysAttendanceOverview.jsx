import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';
import { useNetworkStatus } from '../../utils/networkStatus';

const TodaysAttendanceOverview = () => {
  const { token } = useAuth();
  const { isOnline } = useNetworkStatus(React);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [fetchTime, setFetchTime] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isOnline) {
        setIsOfflineMode(true);
        const response = await cachedAdminApi.getCachedTodaysAttendance(token, { forceRefresh: false, offlineOnly: true });
        
        if (response.data) {
          setData(response.data);
          setLastUpdated(new Date());
          setCacheInfo({
            isFromCache: true,
            cachedAt: response.cachedAt,
            expiresAt: response.expiresAt
          });
          setFetchTime(response.fetchTime || 0);
        } else {
          setError('No cached data available. Please connect to the internet to load data.');
        }
        return;
      }
      
      setIsOfflineMode(false);
      const response = await cachedAdminApi.getCachedTodaysAttendance(token, { forceRefresh });
      
      setData(response.data);
      setLastUpdated(new Date());
      setCacheInfo({
        isFromCache: response.isFromCache,
        cachedAt: response.cachedAt,
        expiresAt: response.expiresAt
      });
      setFetchTime(response.fetchTime || 0);
    } catch (err) {
      console.error('Error fetching today\'s attendance overview:', err);
      
      if (!isOnline && data) {
        setIsOfflineMode(true);
        setError('Showing cached data - no network connection');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#666666]">Loading today's attendance data...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-600">Error loading attendance data: {error}</span>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-red-100 rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-red-600" />
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-blue-600" />
        <span className="text-blue-600">No attendance data available for today.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-semibold text-[#1E1E1E]">Today's Attendance Overview</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isOfflineMode && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              Offline Mode - Cached Data
            </Badge>
          )}
          {lastUpdated && (
            <span className="text-sm text-[#666666]">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {cacheInfo && (
            <Badge variant="outline" className={cacheInfo.isFromCache ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-green-50 text-green-700 border-green-300'}>
              {cacheInfo.isFromCache ? 'Cached' : 'Live'}
              {fetchTime && ` (${fetchTime}ms)`}
            </Badge>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50"
            title="Refresh data (bypass cache)"
          >
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/15 border-2 border-[#667eea]/30">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-[#667eea] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#1E1E1E]">
              {(data.summary?.present || 0) + (data.summary?.late || 0) + (data.summary?.excused || 0)}
            </p>
            <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide">Check-ins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/15 border-2 border-[#22c55e]/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-[#22c55e] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#1E1E1E]">{data.summary?.present || 0}</p>
            <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide">Present</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#fb923c]/10 to-[#f97316]/15 border-2 border-[#fb923c]/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-[#fb923c] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#1E1E1E]">{data.summary?.late || 0}</p>
            <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide">Late</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ef4444]/10 to-[#dc2626]/15 border-2 border-[#ef4444]/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-[#ef4444] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#1E1E1E]">{data.summary?.absent || 0}</p>
            <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide">Absent</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4 text-center">Cohort Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.cohorts?.map((cohort) => {
            const attendanceRate = cohort.attendanceRate || 0;
            const isMeetingTarget = attendanceRate >= 80;
            
            return (
              <Card 
                key={cohort.cohort}
                className={`border-2 ${
                  isMeetingTarget 
                    ? 'bg-gradient-to-br from-[#11998e]/5 to-[#38ef7d]/10 border-[#11998e]/30' 
                    : 'bg-gradient-to-br from-[#eb3349]/5 to-[#f45c43]/10 border-[#eb3349]/30'
                }`}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-bold ${
                      isMeetingTarget ? 'text-[#11998e]' : 'text-[#eb3349]'
                    }`}>
                      {cohort.cohort}
                    </h4>
                    <div className={`px-3 py-1.5 rounded-lg font-bold text-white ${
                      isMeetingTarget 
                        ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d]' 
                        : 'bg-gradient-to-r from-[#eb3349] to-[#f45c43]'
                    }`}>
                      {attendanceRate.toFixed(0)}%
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5 hover:-translate-y-0.5 transition-transform">
                      <p className="text-xl font-bold text-[#22c55e]">{cohort.present}</p>
                      <p className="text-[10px] font-semibold text-[#666666] uppercase">Present</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5 hover:-translate-y-0.5 transition-transform">
                      <p className="text-xl font-bold text-[#fb923c]">{cohort.late}</p>
                      <p className="text-[10px] font-semibold text-[#666666] uppercase">Late</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5 hover:-translate-y-0.5 transition-transform">
                      <p className="text-xl font-bold text-[#3b82f6]">{cohort.excused}</p>
                      <p className="text-[10px] font-semibold text-[#666666] uppercase">Excused</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5 hover:-translate-y-0.5 transition-transform">
                      <p className="text-xl font-bold text-[#ef4444]">{cohort.absent}</p>
                      <p className="text-[10px] font-semibold text-[#666666] uppercase">Absent</p>
                    </div>
                  </div>

                  {/* Recent Check-ins */}
                  {cohort.recentCheckIns && cohort.recentCheckIns.length > 0 && (
                    <div className="pt-3 border-t-2 border-black/5">
                      <p className="text-sm font-semibold text-[#1E1E1E] mb-2">Recent Check-ins</p>
                      <div className="space-y-2">
                        {cohort.recentCheckIns.slice(0, 3).map((checkin, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-2 bg-white/50 rounded-lg border border-black/5 hover:bg-[#667eea]/10 hover:border-[#667eea]/30 hover:translate-x-1 transition-all"
                          >
                            <span className="text-sm font-medium text-[#1E1E1E]">
                              {checkin.firstName} {checkin.lastName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[#666666]">
                                {formatTime(checkin.checkInTime)}
                              </span>
                              {checkin.lateArrivalMinutes > 0 && (
                                <Badge 
                                  variant="outline"
                                  className={`text-xs font-bold ${
                                    checkin.lateArrivalMinutes <= 15 
                                      ? 'bg-amber-100 text-amber-700 border-amber-400' 
                                      : 'bg-red-100 text-red-700 border-red-400'
                                  }`}
                                >
                                  +{checkin.lateArrivalMinutes}m
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Quick Actions</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="px-5 py-2.5 bg-white border-2 border-[#667eea]/30 rounded-lg text-[#1E1E1E] font-semibold text-sm hover:bg-[#667eea]/10 hover:border-[#667eea] hover:-translate-y-0.5 hover:shadow-lg transition-all">
            View Full Roster
          </button>
          <button className="px-5 py-2.5 bg-white border-2 border-[#667eea]/30 rounded-lg text-[#1E1E1E] font-semibold text-sm hover:bg-[#667eea]/10 hover:border-[#667eea] hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Export Today's Data
          </button>
          <button className="px-5 py-2.5 bg-white border-2 border-[#667eea]/30 rounded-lg text-[#1E1E1E] font-semibold text-sm hover:bg-[#667eea]/10 hover:border-[#667eea] hover:-translate-y-0.5 hover:shadow-lg transition-all">
            Manage Excuses
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodaysAttendanceOverview;
