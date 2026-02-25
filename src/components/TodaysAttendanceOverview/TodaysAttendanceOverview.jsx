import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';

const TodaysAttendanceOverview = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Drill-down state
  const [expandedCohort, setExpandedCohort] = useState(null);
  const [cohortDetails, setCohortDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cachedAdminApi.getCachedTodaysAttendance(token, { forceRefresh });
      
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
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

  const handleCohortClick = async (cohortName) => {
    if (expandedCohort === cohortName) {
      setExpandedCohort(null);
      setCohortDetails(null);
      return;
    }

    try {
      setExpandedCohort(cohortName);
      setLoadingDetails(true);
      
      // Find the cohort data from the already-loaded data
      const cohortData = data.cohorts.find(c => c.cohort === cohortName);
      
      if (!cohortData) {
        setError('Cohort not found');
        return;
      }
      
      // Filter builders to only show checked-in ones (present, late, excused)
      const checkedInBuilders = cohortData.builders.filter(b => 
        b.status === 'present' || b.status === 'late' || b.status === 'excused'
      );
      
      setCohortDetails({
        checkedIn: checkedInBuilders
      });
    } catch (err) {
      console.error('Error loading cohort details:', err);
      setError('Failed to load cohort details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // The timestamp is stored in EST 24-hour format but has a Z suffix
      // Strip the Z to treat it as local time (already EST)
      const cleanedTimeString = timeString.replace('Z', '');
      const date = new Date(cleanedTimeString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 text-[#4242EA] animate-spin mb-4" />
        <p className="text-slate-600">Loading today's attendance...</p>
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
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <span className="text-blue-600">No attendance data available for today.</span>
      </div>
    );
  }

  // Calculate totals - focus on who's HERE today
  const totalCheckedIn = (data.summary?.present || 0) + (data.summary?.late || 0);
  const totalExcused = data.summary?.excused || 0;
  const totalAbsent = data.summary?.absent || 0;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Today's Attendance</h2>
          <p className="text-sm text-slate-600 mt-1">
            {lastUpdated && `Last updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Key Metrics - Clean & Focused */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Checked In */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Checked In</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalCheckedIn}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Present + Late</p>
          </CardContent>
        </Card>

        {/* Present */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{data.summary?.present || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Arrived on time</p>
          </CardContent>
        </Card>

        {/* Late */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Late</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{data.summary?.late || 0}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Arrived late</p>
          </CardContent>
        </Card>

        {/* Excused */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Excused</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalExcused}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Excused absences</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Breakdown - Table Style */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cohort Breakdown</h3>
          
          <div className="space-y-2">
            {data.cohorts?.map((cohort) => {
              const attendanceRate = cohort.attendanceRate || 0;
              const isExpanded = expandedCohort === cohort.cohort;
              const totalCohortCheckedIn = cohort.present + cohort.late;
              
              return (
                <div key={cohort.cohort} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Cohort Row */}
                  <div
                    onClick={() => handleCohortClick(cohort.cohort)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                        <span className="font-semibold text-slate-900">{cohort.cohort}</span>
                      </div>
                      
                      {/* Attendance Rate Badge */}
                      <Badge 
                        className={`${
                          attendanceRate >= 80 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {attendanceRate.toFixed(0)}% rate
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-slate-900">{totalCohortCheckedIn}</p>
                        <p className="text-xs text-slate-500">Checked In</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{cohort.present}</p>
                        <p className="text-xs text-slate-500">On Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-amber-600">{cohort.late}</p>
                        <p className="text-xs text-slate-500">Late</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-red-600">{cohort.absent}</p>
                        <p className="text-xs text-slate-500">Absent</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 p-6">
                      {loadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 text-[#4242EA] animate-spin" />
                        </div>
                      ) : cohortDetails ? (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Members Checked In Today ({cohortDetails.checkedIn?.length || 0})
                          </h4>
                          {cohortDetails.checkedIn && cohortDetails.checkedIn.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {cohortDetails.checkedIn.map((builder, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-slate-200">
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{builder.firstName} {builder.lastName}</p>
                                    <p className="text-xs text-slate-500">{formatTime(builder.checkInTime)}</p>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    {builder.status === 'excused' ? (
                                      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        Excused
                                      </Badge>
                                    ) : builder.lateArrivalMinutes > 0 ? (
                                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                        +{builder.lateArrivalMinutes}m
                                      </Badge>
                                    ) : (
                                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                        On Time
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic text-center py-8">No one checked in yet today</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">Unable to load details</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodaysAttendanceOverview;
