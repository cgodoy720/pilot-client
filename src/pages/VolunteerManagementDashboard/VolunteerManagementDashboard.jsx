import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Lazy load tab components (staff/admin-facing)
const VolunteerList = lazy(() => import('../VolunteerList/VolunteerList'));
const VolunteerRoster = lazy(() => import('../VolunteerRoster/VolunteerRoster'));
const VolunteerAttendance = lazy(() => import('../VolunteerAttendance/VolunteerAttendance'));
const AdminVolunteerFeedback = lazy(() => import('../AdminVolunteerFeedback/AdminVolunteerFeedback'));

const TAB_LOADING_FALLBACK = (
  <div className="flex items-center justify-center py-12">
    <div className="text-gray-500 font-proxima">Loading...</div>
  </div>
);

function VolunteerManagementDashboard() {
  const { canAccessPage } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Build tabs based on permissions (staff/admin-facing)
  const tabs = [];
  if (canAccessPage('volunteer_management'))       tabs.push({ value: 'list', label: 'List', Component: VolunteerList });
  if (canAccessPage('volunteer_management'))       tabs.push({ value: 'calendar', label: 'Calendar', Component: VolunteerRoster });
  if (canAccessPage('volunteer_management'))       tabs.push({ value: 'attendance', label: 'Attendance', Component: VolunteerAttendance });
  if (canAccessPage('admin_volunteer_feedback'))   tabs.push({ value: 'feedback', label: 'Feedback', Component: AdminVolunteerFeedback });

  // Default to first available tab
  const defaultTab = tabs.length > 0 ? tabs[0].value : '';

  // Sync active tab with URL param
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.value === tabParam)) {
      return tabParam;
    }
    return defaultTab;
  });

  // Update tab when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(t => t.value === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/volunteer-management?tab=${value}`, { replace: true });
  };

  if (tabs.length === 0) {
    return (
      <div className="w-full h-full bg-[#EFEFEF] flex items-center justify-center p-6 font-proxima">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view volunteer management.</p>
        </div>
      </div>
    );
  }

  // Dynamic grid columns based on tab count
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[tabs.length] || 'grid-cols-4';

  return (
    <div className="h-full flex flex-col bg-[#EFEFEF]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
        <div className="px-6 pt-4 pb-0 shrink-0">
          <TabsList className={`grid w-full ${gridColsClass} bg-white border border-gray-200`}>
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="font-proxima data-[state=active]:bg-[#4242ea] data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="flex-1 overflow-auto">
            <Suspense fallback={TAB_LOADING_FALLBACK}>
              <tab.Component embedded />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default VolunteerManagementDashboard;
