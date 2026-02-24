import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import CurriculumBrowserTab from './components/CurriculumBrowserTab';
import HistoryTab from './components/HistoryTab';
import CohortsTab from './components/CohortsTab';

const CurriculumEditor = () => {
  return (
    <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
      <div className="max-w-[1400px] mx-auto">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="bg-white border border-[#C8C8C8] p-1 h-auto flex-wrap justify-start">
            <TabsTrigger 
              value="browse" 
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Browse & Edit
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Change History
            </TabsTrigger>
            <TabsTrigger 
              value="cohorts"
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Cohorts
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="browse" className="m-0">
              <CurriculumBrowserTab />
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <HistoryTab />
            </TabsContent>

            <TabsContent value="cohorts" className="m-0">
              <CohortsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CurriculumEditor;
