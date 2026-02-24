import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { useAuth } from '../../../context/AuthContext';
import { useNavContext } from '../../../context/NavContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { BarChart3, PieChart, DollarSign, TrendingUp } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import UsageBreakdownTab from './tabs/UsageBreakdownTab';
import CostBillingTab from './tabs/CostBillingTab';
import TrendsTab from './tabs/TrendsTab';

const TAB_TRIGGER_CLASS =
  'data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-600 font-medium px-4 py-2 rounded-md transition-all text-sm gap-1.5';

const PlatformAnalytics = () => {
  const { user, token } = useAuth();
  const { canAccessPage } = usePermissions();
  const { isSecondaryNavPage } = useNavContext();
  const [activeTab, setActiveTab] = useState('overview');

  // Date range state — default last 30 days
  const [endDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  if (!canAccessPage('platform_analytics')) {
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
      {/* Page header */}
      {!isSecondaryNavPage && (
        <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Platform Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              LLM usage, token consumption, and cost tracking
            </p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-[#E3E3E3] p-1 rounded-lg mb-6">
            <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
              <BarChart3 size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="breakdown" className={TAB_TRIGGER_CLASS}>
              <PieChart size={14} />
              Usage Breakdown
            </TabsTrigger>
            <TabsTrigger value="cost" className={TAB_TRIGGER_CLASS}>
              <DollarSign size={14} />
              Cost & Billing
            </TabsTrigger>
            <TabsTrigger value="trends" className={TAB_TRIGGER_CLASS}>
              <TrendingUp size={14} />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab token={token} startDate={startDate} endDate={endDate} />
          </TabsContent>
          <TabsContent value="breakdown">
            <UsageBreakdownTab token={token} startDate={startDate} endDate={endDate} />
          </TabsContent>
          <TabsContent value="cost">
            <CostBillingTab token={token} startDate={startDate} endDate={endDate} />
          </TabsContent>
          <TabsContent value="trends">
            <TrendsTab token={token} startDate={startDate} endDate={endDate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
