import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import useNavStore from '../../../stores/navStore';
import CoachRuns from '../CoachRuns/CoachRuns';
import CoachEvals from '../CoachEvals/CoachEvals';
import CoachProfiles from '../CoachProfiles/CoachProfiles';

const TAB_TRIGGER_CLASS =
  'data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2 rounded-md transition-all';

/**
 * Coach — combined admin surface for the v2 coach agent, with tabs for
 * observability (Coach Runs) and automated quality evaluation (Coach Evals).
 * Mirrors the Organization Management tabbed layout.
 *
 * Tabs sync to ?tab=runs|evals|profiles. The Evals tab's "View agent timeline"
 * switches to the Runs tab with that run preselected (no full navigation).
 */
const Coach = () => {
  const isSecondaryNavPage = useNavStore((s) => s.isSecondaryNavPage);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTabParam = searchParams.get('tab');
  const initialTab =
    initialTabParam === 'evals' || initialTabParam === 'profiles' ? initialTabParam : 'runs';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [runThread, setRunThread] = useState(() => {
    const t = searchParams.get('thread');
    return t ? parseInt(t, 10) : null;
  });

  useEffect(() => {
    const t = searchParams.get('thread');
    setRunThread(t ? parseInt(t, 10) : null);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (tab !== 'runs') next.delete('thread');
    setSearchParams(next, { replace: true });
  };

  // From a Coach Evals case → open that run on the Runs tab.
  const openRunTimeline = (threadId) => {
    setRunThread(threadId);
    setActiveTab('runs');
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'runs');
    next.set('thread', String(threadId));
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#EFEFEF] font-proxima">
      {!isSecondaryNavPage && (
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 pt-5">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Coach</h1>
          <p className="text-slate-500 text-sm mt-0.5 mb-4">
            Observability and automated quality evaluation for the v2 coach agent
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 pt-3 pb-3">
          <TabsList className="bg-transparent p-0 gap-1 rounded-none inline-flex h-auto">
            <TabsTrigger value="runs" className={TAB_TRIGGER_CLASS}>Coach Runs</TabsTrigger>
            <TabsTrigger value="evals" className={TAB_TRIGGER_CLASS}>Coach Evals</TabsTrigger>
            <TabsTrigger value="profiles" className={TAB_TRIGGER_CLASS}>Profiles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="runs" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <CoachRuns embedded openThreadId={runThread} />
        </TabsContent>
        <TabsContent value="evals" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <CoachEvals embedded onViewTimeline={openRunTimeline} />
        </TabsContent>
        <TabsContent value="profiles" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
          <CoachProfiles embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Coach;
