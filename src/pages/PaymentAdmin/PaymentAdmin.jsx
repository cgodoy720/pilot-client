import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import MetricsDashboard from './components/MetricsDashboard';
import JobOutcomesTab from './components/JobOutcomesTab/JobOutcomesTab';
import AlumniTab from './components/AlumniTab/AlumniTab';

const PaymentAdmin = () => {
  const [view, setView] = useState('payments'); // 'payments' | 'outcomes' | 'alumni'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4242EA] to-[#8b5cf6] bg-clip-text text-transparent">
            Payments Admin View
          </h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-2">
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4242EA] data-[state=active]:text-[#4242EA] rounded-none py-3 px-4 text-sm font-medium text-gray-600"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="outcomes"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4242EA] data-[state=active]:text-[#4242EA] rounded-none py-3 px-4 text-sm font-medium text-gray-600"
              >
                Job Outcomes
              </TabsTrigger>
              <TabsTrigger
                value="alumni"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4242EA] data-[state=active]:text-[#4242EA] rounded-none py-3 px-4 text-sm font-medium text-gray-600"
              >
                Alumni
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === 'outcomes' ? (
        <JobOutcomesTab />
      ) : view === 'alumni' ? (
        <AlumniTab />
      ) : (
        <MetricsDashboard />
      )}
    </div>
  );
};

export default PaymentAdmin;
