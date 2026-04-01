import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import useAuthStore from '../../stores/authStore';
import useNavStore from '../../stores/navStore';
import { usePermissions } from '../../hooks/usePermissions';
import OverviewTab from './tabs/OverviewTab';
import BuildersTab from './tabs/BuildersTab';
import PerformanceTab from './tabs/PerformanceTab';
import AttendanceTab from './tabs/AttendanceTab';
import SurveyTab from './tabs/SurveyTab';
import AssessmentsTab from './tabs/AssessmentsTab';
import L2SelectionsTab from './tabs/L2SelectionsTab';
import LogsTab from './tabs/LogsTab';
import { fetchPursuitBuilderCohorts } from './utils/cohortUtils';
import {
  LayoutDashboard, Users, TrendingUp, CalendarCheck,
  Star, ClipboardList, UserCheck, FileText,
} from 'lucide-react';

const TAB_TRIGGER_CLASS =
  'data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-600 font-medium px-4 py-2 rounded-md transition-all text-sm gap-1.5';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();
  const isSecondaryNavPage = useNavStore((s) => s.isSecondaryNavPage);
  const [activeTab, setActiveTab] = useState('overview');

  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchPursuitBuilderCohorts(token)
      .then(data => {
        setCohorts(data);
        if (data.length > 0) setSelectedCohortId(data[0].cohort_id);
      })
      .catch(console.error);
  }, [token]);

  if (!canAccessPage('admin_dashboard')) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {!isSecondaryNavPage && (
        <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Cohort Hub
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Platform overview for {user?.firstName ? `${user.firstName} ${user.lastName}` : 'administrators'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Global cohort selector */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1 block">Cohort</label>
            <select
              value={selectedCohortId}
              onChange={e => setSelectedCohortId(e.target.value)}
              className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
            >
              {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-[#E3E3E3] p-1 mb-6 rounded-lg inline-flex flex-wrap gap-0.5">
            <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
              <LayoutDashboard size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="roster" className={TAB_TRIGGER_CLASS}>
              <Users size={14} />
              Roster
            </TabsTrigger>
            <TabsTrigger value="performance" className={TAB_TRIGGER_CLASS}>
              <TrendingUp size={14} />
              Performance
            </TabsTrigger>
            <TabsTrigger value="attendance" className={TAB_TRIGGER_CLASS}>
              <CalendarCheck size={14} />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="nps" className={TAB_TRIGGER_CLASS}>
              <Star size={14} />
              NPS
            </TabsTrigger>
            <TabsTrigger value="assessments" className={TAB_TRIGGER_CLASS}>
              <ClipboardList size={14} />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="l2" className={TAB_TRIGGER_CLASS}>
              <UserCheck size={14} />
              L2
            </TabsTrigger>
            <TabsTrigger value="logs" className={TAB_TRIGGER_CLASS}>
              <FileText size={14} />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="roster">
            <BuildersTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="nps">
            <SurveyTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="l2">
            <L2SelectionsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>

          <TabsContent value="logs">
            <LogsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
