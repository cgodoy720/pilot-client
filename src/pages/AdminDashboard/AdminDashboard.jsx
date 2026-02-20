import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import SummaryTab from './tabs/SummaryTab';
import SurveyTab from './tabs/SurveyTab';
import L2SelectionsTab from './tabs/L2SelectionsTab';
import VideoSubmissionsTab from './tabs/VideoSubmissionsTab';
import { ExternalLink, BarChart3, Star, UserCheck, Video } from 'lucide-react';

const LEGACY_URL = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/';

const TAB_TRIGGER_CLASS =
  'data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-600 font-medium px-4 py-2 rounded-md transition-all text-sm gap-1.5';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { canAccessPage } = usePermissions();
  const [activeTab, setActiveTab] = useState('summary');
  const [iframeLoading, setIframeLoading] = useState(true);

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
      {/* Page header */}
      <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Platform overview for {user?.firstName ? `${user.firstName} ${user.lastName}` : 'administrators'}
            </p>
          </div>
          <a
            href={LEGACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#4242EA] transition-colors"
          >
            <ExternalLink size={13} />
            Legacy dashboard
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-[#E3E3E3] p-1 mb-6 rounded-lg inline-flex flex-wrap gap-0.5">
            <TabsTrigger value="summary" className={TAB_TRIGGER_CLASS}>
              <BarChart3 size={14} />
              Summary
            </TabsTrigger>
            <TabsTrigger value="survey" className={TAB_TRIGGER_CLASS}>
              <Star size={14} />
              NPS / Survey
            </TabsTrigger>
            <TabsTrigger value="l2" className={TAB_TRIGGER_CLASS}>
              <UserCheck size={14} />
              L2 Selections
            </TabsTrigger>
            <TabsTrigger value="videos" className={TAB_TRIGGER_CLASS}>
              <Video size={14} />
              Videos
            </TabsTrigger>
            <TabsTrigger value="legacy" className={TAB_TRIGGER_CLASS}>
              <ExternalLink size={14} />
              Legacy View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab />
          </TabsContent>

          <TabsContent value="survey">
            <SurveyTab />
          </TabsContent>

          <TabsContent value="l2">
            <L2SelectionsTab />
          </TabsContent>

          <TabsContent value="videos">
            <VideoSubmissionsTab />
          </TabsContent>

          <TabsContent value="legacy" className="rounded-lg overflow-hidden shadow">
            <div className="relative bg-white rounded-lg overflow-hidden" style={{ minHeight: 'calc(100vh - 220px)' }}>
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
                  <div className="w-8 h-8 border-2 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-400">Loading legacy dashboard...</span>
                </div>
              )}
              <iframe
                src={LEGACY_URL}
                title="Legacy Admin Dashboard"
                className="w-full border-none"
                style={{ height: 'calc(100vh - 220px)' }}
                onLoad={() => setIframeLoading(false)}
                allow="fullscreen"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
