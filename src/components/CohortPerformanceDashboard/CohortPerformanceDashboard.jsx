import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, User, Info } from 'lucide-react';
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
    cohort: '',
    attendanceRate: '',
    recommendation: ''
  });
  const [filteredRiskData, setFilteredRiskData] = useState([]);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cachedAdminApi.getCachedCohortPerformance(token, { forceRefresh, period: selectedPeriod });
      
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching cohort performance:', err);
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
    setFilters({ builder: '', cohort: '', attendanceRate: '', recommendation: '' });
  };

  const applyFilters = (riskData) => {
    if (!riskData) return [];
    
    return riskData.filter(builder => {
      const matchesBuilder = !filters.builder || 
        `${builder.firstName} ${builder.lastName}`.toLowerCase().includes(filters.builder.toLowerCase()) ||
        builder.email.toLowerCase().includes(filters.builder.toLowerCase());
      const matchesCohort = !filters.cohort || filters.cohort === 'all' || builder.cohort.includes(filters.cohort);
      const matchesRate = !filters.attendanceRate || builder.attendanceRate.toString().includes(filters.attendanceRate);
      const matchesRecommendation = !filters.recommendation || filters.recommendation === 'all' || 
        (builder.recommendation || 'Monitor').includes(filters.recommendation);
      
      return matchesBuilder && matchesCohort && matchesRate && matchesRecommendation;
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#666666]">Loading cohort performance data...</p>
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
        <Info className="h-5 w-5 text-blue-600" />
        <span className="text-blue-600">No cohort performance data available.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-[#4242EA]" />
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Cohort Performance Dashboard</h2>
            {data?.period?.displayName && (
              <p className="text-sm text-[#666666]">{data.period.displayName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] bg-white border-[#C8C8C8]">
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
          
          {lastUpdated && (
            <span className="text-sm text-[#666666]">Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button onClick={handleRefresh} disabled={loading} className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50" title="Refresh">
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.cohorts?.map((cohort) => {
          const requirement = getRequirementForCohort(cohort.cohort);
          const isMeetingRequirement = cohort.attendanceRate >= requirement;
          
          return (
            <Card key={cohort.cohort} className={`border-2 ${isMeetingRequirement ? 'bg-gradient-to-br from-[#11998e]/5 to-[#38ef7d]/10 border-[#11998e]/30' : 'bg-gradient-to-br from-[#eb3349]/5 to-[#f45c43]/10 border-[#eb3349]/30'}`}>
              <CardContent className="p-5">
                <div className="text-center mb-4">
                  <h3 className={`text-lg font-bold mb-3 ${isMeetingRequirement ? 'text-[#11998e]' : 'text-[#eb3349]'}`}>{cohort.cohort}</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold ${isMeetingRequirement ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d]' : 'bg-gradient-to-r from-[#eb3349] to-[#f45c43]'}`}>
                    <span className="text-3xl">{cohort.attendanceRate.toFixed(0)}%</span>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                      {isMeetingRequirement ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      Target: {requirement}%
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#666666] mb-1">
                    <span>Cohort Target: 75%+</span>
                    <span className="font-semibold">{cohort.attendanceRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={cohort.attendanceRate} className={`h-2 ${isMeetingRequirement ? '[&>div]:bg-gradient-to-r [&>div]:from-[#11998e] [&>div]:to-[#38ef7d]' : '[&>div]:bg-gradient-to-r [&>div]:from-[#eb3349] [&>div]:to-[#f45c43]'}`} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5">
                    <p className="text-xl font-bold text-[#1E1E1E]">{cohort.totalBuilders}</p>
                    <p className="text-[10px] font-semibold text-[#666666] uppercase">Total</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5">
                    <p className="text-xl font-bold text-[#11998e]">{cohort.presentToday}</p>
                    <p className="text-[10px] font-semibold text-[#666666] uppercase">Present</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5">
                    <p className="text-xl font-bold text-[#eb3349]">{cohort.absentToday}</p>
                    <p className="text-[10px] font-semibold text-[#666666] uppercase">Absent</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center border border-black/5">
                    <p className="text-xl font-bold text-[#f2994a]">{cohort.excusedToday || 0}</p>
                    <p className="text-[10px] font-semibold text-[#666666] uppercase">Excused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/15 border-2 border-[#667eea]/30 rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-semibold text-[#667eea] uppercase tracking-wider mb-2">Overall Performance</p>
            <p className="text-4xl font-black text-[#1E1E1E]">{data.summary?.overallAttendanceRate?.toFixed(1) || 0}%</p>
            <p className="text-xs text-[#666666] mt-1">Average across all cohorts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#11998e]/10 to-[#38ef7d]/15 border-2 border-[#11998e]/30 rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-semibold text-[#11998e] uppercase tracking-wider mb-2">Meeting Target</p>
            <p className="text-4xl font-black text-[#1E1E1E]">{data.summary?.cohortsMeetingRequirement || 0} / {data.summary?.totalCohorts || 0}</p>
            <p className="text-xs text-[#666666] mt-1">Cohorts above threshold</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#eb3349]/10 to-[#f45c43]/15 border-2 border-[#eb3349]/30 rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-semibold text-[#eb3349] uppercase tracking-wider mb-2">Builders at Risk</p>
            <p className="text-4xl font-black text-[#1E1E1E]">{data.summary?.buildersAtRisk || 0}</p>
            <p className="text-xs text-[#666666] mt-1">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Table */}
      {data.riskAssessment && data.riskAssessment.length > 0 && (
        <Card className="bg-white border-[#C8C8C8]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Builders at Risk</h3>
            </div>
            <p className="text-sm text-[#666666] mb-4">
              Builders below attendance thresholds requiring attention
              {filteredRiskData.length !== data.riskAssessment.length && ` (${filteredRiskData.length} of ${data.riskAssessment.length} shown)`}
            </p>
            
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Input placeholder="Filter by name..." value={filters.builder} onChange={(e) => handleFilterChange('builder', e.target.value)} className="bg-white border-[#C8C8C8]" />
              <Select value={filters.cohort || 'all'} onValueChange={(v) => handleFilterChange('cohort', v === 'all' ? '' : v)}>
                <SelectTrigger className="bg-white border-[#C8C8C8]"><SelectValue placeholder="All Cohorts" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Cohorts</SelectItem>
                  <SelectItem value="September 2025">September 2025</SelectItem>
                  <SelectItem value="June 2025">June 2025</SelectItem>
                  <SelectItem value="March 2025">March 2025</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Filter rate..." value={filters.attendanceRate} onChange={(e) => handleFilterChange('attendanceRate', e.target.value)} className="bg-white border-[#C8C8C8]" />
              <Select value={filters.recommendation || 'all'} onValueChange={(v) => handleFilterChange('recommendation', v === 'all' ? '' : v)}>
                <SelectTrigger className="bg-white border-[#C8C8C8]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Intervention Required">Intervention Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(filters.builder || filters.cohort || filters.attendanceRate || filters.recommendation) && (
              <div className="mb-4">
                <button onClick={clearFilters} className="text-sm text-[#4242EA] hover:underline">Clear All Filters</button>
              </div>
            )}
            
            <div className="border border-[#C8C8C8] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9F9F9]">
                    <TableHead className="text-[#1E1E1E] font-semibold">Builder</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Cohort</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold text-right">Rate</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold text-right">Req.</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold text-center">Status</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiskData.map((builder, index) => {
                    const requirement = getRequirementForCohort(builder.cohort);
                    const isAtRisk = builder.attendanceRate < requirement;
                    
                    return (
                      <TableRow key={index} className="border-b border-[#E3E3E3]">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#666666]" />
                            <div>
                              <p className="text-sm font-medium text-[#1E1E1E]">{builder.firstName} {builder.lastName}</p>
                              <p className="text-xs text-[#666666]">{builder.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#1E1E1E]">{builder.cohort}</TableCell>
                        <TableCell className={`text-right font-semibold ${isAtRisk ? 'text-red-600' : 'text-[#1E1E1E]'}`}>
                          {builder.attendanceRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right text-[#666666]">{requirement}%</TableCell>
                        <TableCell className="text-center">
                          <Badge className={isAtRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                            {isAtRisk ? 'At Risk' : 'Safe'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={isAtRisk ? 'border-amber-400 text-amber-700' : 'border-[#C8C8C8] text-[#666666]'}>
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
