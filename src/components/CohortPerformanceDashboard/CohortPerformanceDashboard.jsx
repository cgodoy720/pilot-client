import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/retryUtils';
import CohortDailyBreakdown from './CohortDailyBreakdown';
import DayBuilderStatusModal from './DayBuilderStatusModal';

const CohortPerformanceDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  
  // New state for cohort selection and daily breakdown
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [dailyBreakdownLoading, setDailyBreakdownLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayBuilders, setDayBuilders] = useState(null);
  const [dayBuildersLoading, setDayBuildersLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    builder: ''
  });
  const [filteredRiskData, setFilteredRiskData] = useState([]);

  const fetchData = async (forceRefresh = false, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);
      
      const response = await cachedAdminApi.getCachedCohortPerformance(token, { forceRefresh, period: selectedPeriod });
      
      setData(response.data);
      setLastUpdated(new Date());
      
      // Set available cohorts and preserve current selection when possible.
      if (response.data?.availableCohorts && response.data.availableCohorts.length > 0) {
        const cohorts = response.data.availableCohorts;
        setAvailableCohorts(cohorts);
        setSelectedCohort((prev) => {
          if (prev && cohorts.includes(prev)) return prev;
          const decemberCohort = cohorts.find((c) => c === 'December 2025');
          return decemberCohort || cohorts[0];
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const fetchDailyBreakdown = async (cohort) => {
    if (!cohort) return;
    
    try {
      setDailyBreakdownLoading(true);
      const response = await cachedAdminApi.getCachedCohortDailyBreakdown(cohort, token, { period: selectedPeriod });
      setDailyBreakdown(response.data?.dailyBreakdown || []);
    } catch (err) {
      console.error('Error fetching daily breakdown:', err);
      setDailyBreakdown([]);
    } finally {
      setDailyBreakdownLoading(false);
    }
  };

  const handleDayClick = async (day) => {
    if (!selectedCohort || !day.date) return;
    
    try {
      setSelectedDay(day);
      setIsModalOpen(true);
      setDayBuildersLoading(true);
      
      const response = await cachedAdminApi.getCachedDayBuilderStatus(selectedCohort, day.date, token);
      setDayBuilders(response.data);
    } catch (err) {
      console.error('Error fetching day builder status:', err);
      setDayBuilders(null);
    } finally {
      setDayBuildersLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setDayBuilders(null);
  };

  useEffect(() => {
    fetchData(false, true);
    const interval = setInterval(() => {
      fetchData(false, false);
    }, 60000);
    return () => clearInterval(interval);
  }, [token, selectedPeriod]);

  useEffect(() => {
    if (selectedCohort) {
      fetchDailyBreakdown(selectedCohort);
    }
  }, [selectedCohort, selectedPeriod]);

  useEffect(() => {
    if (data?.riskAssessment && selectedCohort) {
      // Filter risk data to only show builders from selected cohort
      const filtered = data.riskAssessment.filter(builder => {
        const matchesBuilder = !filters.builder || 
          `${builder.firstName} ${builder.lastName}`.toLowerCase().includes(filters.builder.toLowerCase()) ||
          builder.email.toLowerCase().includes(filters.builder.toLowerCase());
        
        const matchesCohort = builder.cohort === selectedCohort;
        
        return matchesBuilder && matchesCohort;
      });
      setFilteredRiskData(filtered);
    } else {
      setFilteredRiskData([]);
    }
  }, [data?.riskAssessment, filters, selectedCohort]);

  const handleRefresh = () => {
    cachedAdminApi.invalidateAllAttendanceCaches();
    fetchData(true, true);
    if (selectedCohort) {
      fetchDailyBreakdown(selectedCohort);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ builder: '' });
  };

  const getRequirementForCohort = (cohort) => {
    if (cohort.includes('June 2025')) return 85;
    if (cohort.includes('March 2025')) return 85;
    if (cohort.includes('September 2025')) return 80;
    if (cohort.includes('L1') || cohort.includes('December')) return 80;
    return 85;
  };

  const selectedCohortData = data?.cohorts?.find(c => c.cohort === selectedCohort);
  const requirement = selectedCohort ? getRequirementForCohort(selectedCohort) : 85;
  const selectedPeriodLabel = {
    'last-30-days': 'Last 30 Days',
    'this-week': 'This Week',
    'last-week': 'Last Week',
    'this-month': 'This Month',
    'last-month': 'Last Month'
  }[selectedPeriod] || 'Selected Period';

  const cohortPeriodStats = useMemo(() => {
    if (!selectedCohortData || !dailyBreakdown || dailyBreakdown.length === 0) {
      return {
        classDays: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
        attendanceRate: 0
      };
    }

    const totals = dailyBreakdown.reduce((acc, day) => {
      acc.present += day.present || 0;
      acc.late += day.late || 0;
      acc.excused += day.excused || 0;
      acc.absent += day.absent || 0;
      acc.totalSlots += day.total || selectedCohortData.totalBuilders || 0;
      return acc;
    }, {
      present: 0,
      late: 0,
      excused: 0,
      absent: 0,
      totalSlots: 0
    });

    const attended = totals.present + totals.late + totals.excused;
    const attendanceRate = totals.totalSlots > 0
      ? Number(((attended / totals.totalSlots) * 100).toFixed(1))
      : 0;

    return {
      classDays: dailyBreakdown.length,
      present: totals.present,
      late: totals.late,
      excused: totals.excused,
      absent: totals.absent,
      attendanceRate
    };
  }, [dailyBreakdown, selectedCohortData]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 text-[#4242EA] animate-spin mb-4" />
        <p className="text-slate-600">Loading cohort performance data...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-600">Error loading cohort performance data: {error}</span>
        </div>
        <button onClick={handleRefresh} className="p-2 hover:bg-red-100 rounded-md transition-colors">
          <RefreshCw className="h-4 w-4 text-red-600" />
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <span className="text-blue-600">No cohort performance data available.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Cohort Performance</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Cohort Selector & Selected Cohort Stats */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Selected Cohort</h3>
            <div className="flex items-center gap-3">
              <Select value={selectedCohort || ''} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-[280px] bg-white border-slate-300">
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableCohorts.map((cohort) => (
                    <SelectItem key={cohort} value={cohort}>
                      {cohort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px] bg-white border-slate-300">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCohortData && (
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{selectedCohortData.cohort}</h4>
                <Badge className={
                  cohortPeriodStats.attendanceRate >= requirement
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-red-100 text-red-700 border-red-200'
                }>
                  Target: {requirement}%
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Attendance Rate ({selectedPeriodLabel})</span>
                  <span className="font-semibold text-slate-900">{cohortPeriodStats.attendanceRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={cohortPeriodStats.attendanceRate} 
                  className={`h-2 ${
                    cohortPeriodStats.attendanceRate >= requirement 
                      ? '[&>div]:bg-emerald-500' 
                      : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div className="bg-slate-50 rounded p-2 text-center">
                  <p className="font-semibold text-slate-900">{selectedCohortData.totalBuilders}</p>
                  <p className="text-xs text-slate-600">Total Builders</p>
                </div>
                <div className="bg-emerald-50 rounded p-2 text-center">
                  <p className="font-semibold text-emerald-700">{cohortPeriodStats.present + cohortPeriodStats.late}</p>
                  <p className="text-xs text-slate-600">Present+Late</p>
                </div>
                <div className="bg-red-50 rounded p-2 text-center">
                  <p className="font-semibold text-red-700">{cohortPeriodStats.absent}</p>
                  <p className="text-xs text-slate-600">Absent</p>
                </div>
                <div className="bg-blue-50 rounded p-2 text-center">
                  <p className="font-semibold text-blue-700">{cohortPeriodStats.excused}</p>
                  <p className="text-xs text-slate-600">Excused</p>
                </div>
                <div className="bg-violet-50 rounded p-2 text-center">
                  <p className="font-semibold text-violet-700">{cohortPeriodStats.classDays}</p>
                  <p className="text-xs text-slate-600">Class Days</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      {selectedCohort && (
        <CohortDailyBreakdown
          dailyBreakdown={dailyBreakdown}
          cohort={selectedCohort}
          requirement={requirement}
          onDayClick={handleDayClick}
          loading={dailyBreakdownLoading}
        />
      )}

      {/* At-Risk Builders Table - Filtered to selected cohort */}
      {data.riskAssessment && data.riskAssessment.length > 0 && selectedCohort && (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">At-Risk Builders - {selectedCohort}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Builders in this cohort below attendance thresholds
                  {filteredRiskData.length > 0 && ` (${filteredRiskData.length} builders)`}
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="mb-4">
              <Input 
                placeholder="Search by name..." 
                value={filters.builder} 
                onChange={(e) => handleFilterChange('builder', e.target.value)} 
                className="bg-white border-slate-300 max-w-md"
              />
            </div>
            
            {filters.builder && (
              <div className="mb-4">
                <button onClick={clearFilters} className="text-sm text-[#4242EA] hover:underline">
                  Clear Search
                </button>
              </div>
            )}
            
            {filteredRiskData.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p>No at-risk builders found in {selectedCohort}</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-900 font-semibold">Builder</TableHead>
                      <TableHead className="text-slate-900 font-semibold text-right">Attendance Rate</TableHead>
                      <TableHead className="text-slate-900 font-semibold text-right">Target</TableHead>
                      <TableHead className="text-slate-900 font-semibold text-center">Status</TableHead>
                      <TableHead className="text-slate-900 font-semibold text-center">Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRiskData.map((builder, index) => {
                      const isAtRisk = builder.attendanceRate < requirement;
                      
                      return (
                        <TableRow key={index} className="border-b border-slate-200">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {builder.firstName} {builder.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{builder.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${isAtRisk ? 'text-red-600' : 'text-slate-900'}`}>
                            {builder.attendanceRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-600">{requirement}%</TableCell>
                          <TableCell className="text-center">
                            <Badge className={isAtRisk ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}>
                              {isAtRisk ? 'At Risk' : 'Safe'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={isAtRisk ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-slate-300 text-slate-600'}>
                              {builder.recommendation || 'Monitor'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day Builder Status Modal */}
      <DayBuilderStatusModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        dayData={dayBuilders}
        loading={dayBuildersLoading}
      />
    </div>
  );
};

export default CohortPerformanceDashboard;
