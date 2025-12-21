import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp, 
  Calendar,
  Eye,
  Plus,
  ArrowRight,
  ArrowUpDown
} from 'lucide-react';
import { getDashboardStats, getAllLeads, handleApiError } from '../../../services/salesTrackerApi';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [outreachData, setOutreachData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters for Outreach table
  const [outreachStage, setOutreachStage] = useState('all-stages');
  const [outreachFromDate, setOutreachFromDate] = useState('');
  const [outreachToDate, setOutreachToDate] = useState('');
  
  // Filters for Closed Won Jobs
  const [closedJobsFromDate, setClosedJobsFromDate] = useState('');
  const [closedJobsToDate, setClosedJobsToDate] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchOutreachData();
  }, [outreachStage, outreachFromDate, outreachToDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statsResponse = await getDashboardStats('30');
      setStats(statsResponse.stats || {});
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchOutreachData = async () => {
    try {
      const params = {
        stage: outreachStage,
        limit: 100
      };
      
      const response = await getAllLeads(params);
      setOutreachData(response.leads || []);
    } catch (err) {
      console.error('Failed to fetch outreach data:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `(${diffDays} days ago)`;
  };

  const getStatusBadgeClass = (stage) => {
    if (stage === 'Active Lead') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics - 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Won</CardTitle>
            <Target className="h-4 w-4 text-pursuit-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pursuit-purple">{stats.jobsWon || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outreach</CardTitle>
            <TrendingUp className="h-4 w-4 text-pursuit-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pursuit-purple">{stats.totalOutreach || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days Outreach</CardTitle>
            <Calendar className="h-4 w-4 text-pursuit-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pursuit-purple">{stats.last7DaysOutreach || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-pursuit-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pursuit-purple">{stats.activeLeads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Building2 className="h-4 w-4 text-pursuit-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pursuit-purple">{stats.totalJobPostings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Closed Won Jobs Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-lg font-semibold">Closed Won Jobs</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">From:</span>
                <input
                  type="date"
                  value={closedJobsFromDate}
                  onChange={(e) => setClosedJobsFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">To:</span>
                <input
                  type="date"
                  value={closedJobsToDate}
                  onChange={(e) => setClosedJobsToDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4">
              <Target className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-pursuit-purple mb-2">Let's Win!</h3>
            <p className="text-gray-600 text-sm">Your first win is just around the corner. Keep pushing!</p>
          </div>
        </CardContent>
      </Card>

      {/* Outreach Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-lg font-semibold">Outreach</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Stage:</span>
                <Select value={outreachStage} onValueChange={setOutreachStage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-stages">All Stages</SelectItem>
                    <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                    <SelectItem value="Active Lead">Active Lead</SelectItem>
                    <SelectItem value="Follow Up">Follow Up</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">From:</span>
                <input
                  type="date"
                  value={outreachFromDate}
                  onChange={(e) => setOutreachFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">To:</span>
                <input
                  type="date"
                  value={outreachToDate}
                  onChange={(e) => setOutreachToDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Staff Member</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Date of Initial Outreach</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {outreachData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No outreach data found
                    </td>
                  </tr>
                ) : (
                  outreachData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.currentOwner || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.company || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.jobTitle || item.contactTitle || ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>{formatDate(item.outreachDate)}</div>
                        <div className="text-xs text-gray-500">{getDaysAgo(item.outreachDate)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(item.stage)}`}>
                          {item.stage || 'Initial Outreach'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;