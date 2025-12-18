import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, User, ChevronDown } from 'lucide-react';
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

const CohortPerformanceDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  
  const [filters, setFilters] = useState({
    builder: '',
    cohorts: ['December 2025', 'March 2025'], // Default to these two cohorts
    recommendation: ''
  });
  const [filteredRiskData, setFilteredRiskData] = useState([]);
  const [cohortDropdownOpen, setCohortDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cachedAdminApi.getCachedCohortPerformance(token, { forceRefresh, period: selectedPeriod });
      
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [token, selectedPeriod]);

  useEffect(() => {
    if (data?.riskAssessment) {
      const filtered = applyFilters(data.riskAssessment);
      setFilteredRiskData(filtered);
    }
  }, [data?.riskAssessment, filters]);

  const handleRefresh = () => {
    cachedAdminApi.invalidateAllAttendanceCaches();
    fetchData(true);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ builder: '', cohorts: ['December 2025', 'March 2025'], recommendation: '' });
  };

  const toggleCohort = (cohort) => {
    setFilters(prev => {
      const cohorts = prev.cohorts.includes(cohort)
        ? prev.cohorts.filter(c => c !== cohort)
        : [...prev.cohorts, cohort];
      return { ...prev, cohorts };
    });
  };

  const availableCohorts = ['December 2025', 'March 2025', 'September 2025', 'June 2025'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCohortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFilters = (riskData) => {
    if (!riskData) return [];
    
    return riskData.filter(builder => {
      const matchesBuilder = !filters.builder || 
        `${builder.firstName} ${builder.lastName}`.toLowerCase().includes(filters.builder.toLowerCase()) ||
        builder.email.toLowerCase().includes(filters.builder.toLowerCase());
      
      // Match if cohorts array is empty (show all) or if builder's cohort is in the selected cohorts
      const matchesCohort = filters.cohorts.length === 0 || 
        filters.cohorts.some(cohort => builder.cohort.includes(cohort));
      
      const matchesRecommendation = !filters.recommendation || filters.recommendation === 'all' || 
        (builder.recommendation || 'Monitor').includes(filters.recommendation);
      
      return matchesBuilder && matchesCohort && matchesRecommendation;
    });
  };

  const getRequirementForCohort = (cohort) => {
    if (cohort.includes('June 2025')) return 85;
    if (cohort.includes('March 2025')) return 85;
    if (cohort.includes('September 2025')) return 80;
    if (cohort.includes('L1') || cohort.includes('December')) return 80;
    return 85;
  };

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
          <p className="text-sm text-slate-600 mt-1">
            {data?.period?.displayName} • {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overall Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.summary?.overallAttendanceRate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Average across all cohorts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Meeting Target</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.summary?.cohortsMeetingRequirement || 0} / {data.summary?.totalCohorts || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Cohorts above threshold</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">At Risk</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.summary?.buildersAtRisk || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Builders requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Cards */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cohort Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.cohorts?.map((cohort) => {
              const requirement = getRequirementForCohort(cohort.cohort);
              const isMeetingRequirement = cohort.attendanceRate >= requirement;
              
              return (
                <div key={cohort.cohort} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{cohort.cohort}</h4>
                    <Badge className={isMeetingRequirement ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                      Target: {requirement}%
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Attendance Rate</span>
                      <span className="font-semibold text-slate-900">{cohort.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={cohort.attendanceRate} 
                      className={`h-2 ${isMeetingRequirement ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500'}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50 rounded p-2 text-center">
                      <p className="font-semibold text-slate-900">{cohort.totalBuilders}</p>
                      <p className="text-xs text-slate-600">Total</p>
                    </div>
                    <div className="bg-emerald-50 rounded p-2 text-center">
                      <p className="font-semibold text-emerald-700">{cohort.presentToday}</p>
                      <p className="text-xs text-slate-600">Present</p>
                    </div>
                    <div className="bg-red-50 rounded p-2 text-center">
                      <p className="font-semibold text-red-700">{cohort.absentToday}</p>
                      <p className="text-xs text-slate-600">Absent</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2 text-center">
                      <p className="font-semibold text-blue-700">{cohort.excusedToday || 0}</p>
                      <p className="text-xs text-slate-600">Excused</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Builders Table */}
      {data.riskAssessment && data.riskAssessment.length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Builders at Risk</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Builders below attendance thresholds
                  {filteredRiskData.length !== data.riskAssessment.length && ` (${filteredRiskData.length} of ${data.riskAssessment.length} shown)`}
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Input 
                placeholder="Search by name..." 
                value={filters.builder} 
                onChange={(e) => handleFilterChange('builder', e.target.value)} 
                className="bg-white border-slate-300"
              />
              
              {/* Multi-Select Cohort Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCohortDropdownOpen(!cohortDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700">
                    {filters.cohorts.length === 0 
                      ? 'All Cohorts' 
                      : filters.cohorts.length === 1
                      ? filters.cohorts[0]
                      : `${filters.cohorts.length} Cohorts Selected`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${cohortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {cohortDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg">
                    <div className="p-2 space-y-1">
                      {availableCohorts.map((cohort) => (
                        <label
                          key={cohort}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.cohorts.includes(cohort)}
                            onChange={() => toggleCohort(cohort)}
                            className="w-4 h-4 text-[#4242EA] border-slate-300 rounded focus:ring-[#4242EA] focus:ring-2"
                          />
                          <span className="text-sm text-slate-700">
                            {cohort}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Select value={filters.recommendation || 'all'} onValueChange={(v) => handleFilterChange('recommendation', v === 'all' ? '' : v)}>
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue placeholder="All Recommendations" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Intervention Required">Intervention Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(filters.builder || filters.cohorts.length !== 2 || filters.recommendation) && (
              <div className="mb-4">
                <button onClick={clearFilters} className="text-sm text-[#4242EA] hover:underline">
                  Reset to Default Filters
                </button>
              </div>
            )}
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-900 font-semibold">Builder</TableHead>
                    <TableHead className="text-slate-900 font-semibold">Cohort</TableHead>
                    <TableHead className="text-slate-900 font-semibold text-right">Attendance Rate</TableHead>
                    <TableHead className="text-slate-900 font-semibold text-right">Target</TableHead>
                    <TableHead className="text-slate-900 font-semibold text-center">Status</TableHead>
                    <TableHead className="text-slate-900 font-semibold text-center">Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiskData.map((builder, index) => {
                    const requirement = getRequirementForCohort(builder.cohort);
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
                        <TableCell className="text-slate-700">{builder.cohort}</TableCell>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CohortPerformanceDashboard;
