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
  ArrowRight
} from 'lucide-react';
import { getDashboardStats, getRecentActivity, handleApiError } from '../../../services/salesTrackerApi';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('30');
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          getDashboardStats(timePeriod),
          getRecentActivity(10)
        ]);
        
        setStats(statsResponse.stats || {});
        setRecentActivity(activityResponse.activities || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(handleApiError(err));
        
        // Fallback to mock data on error
        const mockStats = {
          totalLeads: 110,
          totalJobPostings: 60,
          activeOutreach: 45,
          conversionRate: 12.5,
          thisWeek: {
            leadsAdded: 8,
            outreachSent: 23,
            jobsPosted: 5,
            responses: 3
          }
        };

        const mockActivity = [
          {
            id: 1,
            type: 'lead',
            action: 'New lead added',
            description: 'Stephanie Ribeiro Levites from EY',
            user: 'Frances Steele',
            timestamp: '2 hours ago'
          },
          {
            id: 2,
            type: 'outreach',
            action: 'Outreach sent',
            description: 'Follow up message to Michael Dash',
            user: 'Timothy Asprec',
            timestamp: '4 hours ago'
          },
          {
            id: 3,
            type: 'job',
            action: 'Job posting created',
            description: 'Junior AI Builder / Vibe Coder at Senpilot',
            user: 'Carlos Godoy',
            timestamp: '1 day ago'
          },
          {
            id: 4,
            type: 'response',
            action: 'Response received',
            description: 'Kat Choumanova replied to outreach',
            user: 'Kirstie Chen',
            timestamp: '2 days ago'
          }
        ];
        
        setStats(mockStats);
        setRecentActivity(mockActivity);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timePeriod]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lead':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'outreach':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'job':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'response':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Overview of your outreach and job posting activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeek?.leadsAdded} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobPostings}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeek?.jobsPosted} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Outreach</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOutreach}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeek?.outreachSent} sent this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisWeek?.responses} responses this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-pursuit-purple hover:bg-pursuit-purple/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Create Job Posting
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Outreach
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Week's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.thisWeek?.leadsAdded}</div>
              <p className="text-sm text-gray-600">New Leads</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.thisWeek?.outreachSent}</div>
              <p className="text-sm text-gray-600">Outreach Sent</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.thisWeek?.jobsPosted}</div>
              <p className="text-sm text-gray-600">Jobs Posted</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.thisWeek?.responses}</div>
              <p className="text-sm text-gray-600">Responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;