import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, GraduationCap, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserStats } from '../../utils/statsApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import CohortPerformanceDashboard from '../../components/CohortPerformanceDashboard/CohortPerformanceDashboard';
import TodaysAttendanceOverview from '../../components/TodaysAttendanceOverview/TodaysAttendanceOverview';
import ExcuseManagementInterface from '../../components/ExcuseManagementInterface/ExcuseManagementInterface';
import CSVExport from '../../components/CSVExport/CSVExport';
import AdminDashboardErrorBoundary from '../../components/ErrorBoundary/AdminDashboardErrorBoundary';
import TabErrorBoundary from '../../components/ErrorBoundary/TabErrorBoundary';
import NetworkStatusIndicator from '../../components/NetworkStatusIndicator/NetworkStatusIndicator';
import OfflineModeMessage from '../../components/OfflineModeMessage/OfflineModeMessage';
import QueuedActionsPanel from '../../components/QueuedActionsPanel/QueuedActionsPanel';
import ConnectivityNotification from '../../components/ConnectivityNotification/ConnectivityNotification';

const AdminAttendanceDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);
        const userStats = await fetchUserStats(token);
        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load statistics. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };

    if (token && isAdmin) {
      loadUserStats();
    }
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>Admin or staff privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  const featureCards = [
    {
      id: 'todays-attendance',
      tab: 'todays-attendance',
      title: "Today's Attendance",
      description: 'Real-time attendance tracking and daily overview',
      icon: BarChart3,
      gradient: 'from-[#667eea] to-[#764ba2]',
      shadowColor: 'rgba(102, 126, 234, 0.4)'
    },
    {
      id: 'cohort-performance',
      tab: 'cohort-performance',
      title: 'Cohort Performance',
      description: 'Monitor attendance rates and trends by cohort',
      icon: TrendingUp,
      gradient: 'from-[#f093fb] to-[#f5576c]',
      shadowColor: 'rgba(240, 147, 251, 0.4)'
    },
    {
      id: 'excuse-management',
      tab: 'excuse-management',
      title: 'Excuse Management',
      description: 'Manage excused absences and modifications',
      icon: Users,
      gradient: 'from-[#4facfe] to-[#00f2fe]',
      shadowColor: 'rgba(79, 172, 254, 0.4)'
    },
    {
      id: 'csv-export',
      tab: 'csv-export',
      title: 'CSV Export',
      description: 'Export attendance data for analysis and reporting',
      icon: Download,
      gradient: 'from-[#43e97b] to-[#38f9d7]',
      shadowColor: 'rgba(67, 233, 123, 0.4)'
    }
  ];

  const externalTools = [
    {
      title: 'Main Admin Dashboard',
      description: 'Performance metrics, task analysis, and administrative tools.',
      icon: TrendingUp,
      path: '/admin',
      color: '#4242EA'
    },
    {
      title: 'Admissions Dashboard',
      description: 'Manage applications, info sessions, and workshop registrations.',
      icon: Users,
      path: '/admissions-dashboard',
      color: '#22C55E'
    },
    {
      title: 'Builder Check-in Site',
      description: 'Direct link to the builder-facing attendance check-in interface.',
      icon: GraduationCap,
      path: 'https://platform.pursuit.org/admin-dashboard',
      color: '#F97316',
      external: true
    }
  ];

  return (
    <AdminDashboardErrorBoundary>
      <ConnectivityNotification />
      <div className="min-h-screen bg-[#EFEFEF]">
        {/* Header */}
        <div className="border-b border-[#C8C8C8] px-10 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-2xl font-normal"
                style={{
                  background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Admin Attendance Dashboard
              </h1>
              <p className="text-[#666666] mt-1">
                Comprehensive tools for tracking, managing, and analyzing builder attendance.
              </p>
            </div>
            <NetworkStatusIndicator />
          </div>
        </div>

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Queued Actions Panel */}
          <QueuedActionsPanel />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-[#C8C8C8] p-1 mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="todays-attendance"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                Today's Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="cohort-performance"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                Cohort Performance
              </TabsTrigger>
              <TabsTrigger 
                value="excuse-management"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                Excuse Management
              </TabsTrigger>
              <TabsTrigger 
                value="csv-export"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                CSV Export
              </TabsTrigger>
              <TabsTrigger 
                value="other-tools"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-[#1E1E1E]"
              >
                Other Tools
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {featureCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setActiveTab(card.tab)}
                      className={`bg-gradient-to-br ${card.gradient} rounded-lg p-5 text-white cursor-pointer transition-all duration-300 hover:-translate-y-1`}
                      style={{ 
                        boxShadow: `0 4px 15px ${card.shadowColor}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 12px 24px ${card.shadowColor}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 15px ${card.shadowColor}`;
                      }}
                    >
                      <Icon className="h-10 w-10 mb-3 opacity-90" />
                      <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                      <p className="text-sm opacity-90">{card.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Info Section */}
              <Card className="bg-white/80 backdrop-blur border-[#C8C8C8]">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                        Attendance Management Hub
                      </h2>
                      <p className="text-[#666666] mb-4">
                        Comprehensive tools for tracking, managing, and analyzing builder attendance across all cohorts.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#667eea]" />
                          <span className="text-sm text-[#1E1E1E]">Real-time tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#f5576c]" />
                          <span className="text-sm text-[#1E1E1E]">Performance analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#4facfe]" />
                          <span className="text-sm text-[#1E1E1E]">Excuse workflow</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#43e97b]" />
                          <span className="text-sm text-[#1E1E1E]">Data export</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Today's Attendance Tab */}
            <TabsContent value="todays-attendance" className="mt-0">
              <TabErrorBoundary tabName="Today's Attendance">
                <OfflineModeMessage>
                  <TodaysAttendanceOverview />
                </OfflineModeMessage>
              </TabErrorBoundary>
            </TabsContent>

            {/* Cohort Performance Tab */}
            <TabsContent value="cohort-performance" className="mt-0">
              <TabErrorBoundary tabName="Cohort Performance">
                <OfflineModeMessage showCachedData={true} cachedDataCount={stats?.cohorts?.length || 0}>
                  <CohortPerformanceDashboard />
                </OfflineModeMessage>
              </TabErrorBoundary>
            </TabsContent>

            {/* Excuse Management Tab */}
            <TabsContent value="excuse-management" className="mt-0">
              <TabErrorBoundary tabName="Excuse Management">
                <OfflineModeMessage>
                  <ExcuseManagementInterface />
                </OfflineModeMessage>
              </TabErrorBoundary>
            </TabsContent>

            {/* CSV Export Tab */}
            <TabsContent value="csv-export" className="mt-0">
              <TabErrorBoundary tabName="CSV Export">
                <OfflineModeMessage>
                  <CSVExport />
                </OfflineModeMessage>
              </TabErrorBoundary>
            </TabsContent>

            {/* Other Tools Tab */}
            <TabsContent value="other-tools" className="mt-0">
              <OfflineModeMessage>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {externalTools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <Card 
                        key={index}
                        className="bg-white border-[#C8C8C8] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          if (tool.external) {
                            window.open(tool.path, '_blank');
                          } else {
                            navigate(tool.path);
                          }
                        }}
                      >
                        <CardContent className="p-6 text-center">
                          <div 
                            className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
                            style={{ backgroundColor: `${tool.color}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color: tool.color }} />
                          </div>
                          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-[#666666] mb-4">
                            {tool.description}
                          </p>
                          <button
                            className="group relative overflow-hidden inline-flex justify-center items-center px-6 py-2 w-full border rounded-md font-medium text-sm text-white cursor-pointer transition-colors duration-300"
                            style={{ backgroundColor: tool.color, borderColor: tool.color }}
                          >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#1E1E1E] flex items-center gap-2">
                              {tool.external ? (
                                <>
                                  Open External
                                  <ExternalLink className="h-4 w-4" />
                                </>
                              ) : (
                                'Access'
                              )}
                            </span>
                            <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </OfflineModeMessage>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminDashboardErrorBoundary>
  );
};

export default AdminAttendanceDashboard;
