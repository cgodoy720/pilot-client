import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { fetchUserStats } from '../../utils/statsApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import CohortPerformanceDashboard from '../../components/CohortPerformanceDashboard/CohortPerformanceDashboard';
import TodaysAttendanceOverview from '../../components/TodaysAttendanceOverview/TodaysAttendanceOverview';
import AttendanceManagement from '../../components/AttendanceManagement/AttendanceManagement';
import AdminDashboardErrorBoundary from '../../components/ErrorBoundary/AdminDashboardErrorBoundary';
import TabErrorBoundary from '../../components/ErrorBoundary/TabErrorBoundary';

const AdminAttendanceDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('todays-attendance');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { canAccessPage } = usePermissions();
  const hasAccess = canAccessPage('admin_attendance');

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

    if (token && hasAccess) {
      loadUserStats();
    }
  }, [token, hasAccess]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Track and manage builder attendance across all cohorts
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-slate-200 p-1 mb-4 rounded-lg inline-flex">
              <TabsTrigger 
                value="todays-attendance"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium px-6 py-2.5 rounded-md transition-all"
              >
                Today's Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="cohort-performance"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium px-6 py-2.5 rounded-md transition-all"
              >
                Cohort Performance
              </TabsTrigger>
              <TabsTrigger 
                value="attendance-management"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium px-6 py-2.5 rounded-md transition-all"
              >
                Attendance Management
              </TabsTrigger>
            </TabsList>

            {/* Today's Attendance Tab */}
            <TabsContent value="todays-attendance" className="mt-0">
              <TabErrorBoundary tabName="Today's Attendance">
                <TodaysAttendanceOverview />
              </TabErrorBoundary>
            </TabsContent>

            {/* Cohort Performance Tab */}
            <TabsContent value="cohort-performance" className="mt-0">
              <TabErrorBoundary tabName="Cohort Performance">
                <CohortPerformanceDashboard />
              </TabErrorBoundary>
            </TabsContent>

            {/* Attendance Management Tab */}
            <TabsContent value="attendance-management" className="mt-0">
              <TabErrorBoundary tabName="Attendance Management">
                <AttendanceManagement />
              </TabErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminDashboardErrorBoundary>
  );
};

export default AdminAttendanceDashboard;
