import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useNavContext } from '../../context/NavContext';
import Dashboard from './components/Dashboard';
import AllLeads from './components/AllLeads';
import JobPostings from './components/JobPostings';
import Leaderboard from './components/Leaderboard';

const SalesTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isSecondaryNavPage } = useNavContext();

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      {!isSecondaryNavPage && (
        <div className="h-[45px] bg-bg-light border-b border-divider flex items-center px-[25px]">
          <h1 className="text-[28px] leading-[30px] font-proxima font-normal bg-gradient-to-r from-carbon-black to-pursuit-purple bg-clip-text text-transparent">
            Pursuit Outreach Tracker
          </h1>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-white">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-pursuit-purple data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="all-leads"
              className="data-[state=active]:bg-pursuit-purple data-[state=active]:text-white"
            >
              All Leads
            </TabsTrigger>
            <TabsTrigger
              value="job-postings"
              className="data-[state=active]:bg-pursuit-purple data-[state=active]:text-white"
            >
              Job Postings
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-pursuit-purple data-[state=active]:text-white"
            >
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="all-leads">
            <AllLeads />
          </TabsContent>

          <TabsContent value="job-postings">
            <JobPostings />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SalesTracker;