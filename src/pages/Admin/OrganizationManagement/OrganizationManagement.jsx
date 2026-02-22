import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavContext } from '../../../context/NavContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import OrganizationsTab from './components/OrganizationsTab';
import ProgramsTab from './components/ProgramsTab';
import CoursesTab from './components/CoursesTab';
import EnrollmentsTab from './components/EnrollmentsTab';
import LoadingCurtain from '../../../components/LoadingCurtain/LoadingCurtain';

/**
 * Organization Management Page
 * Admin/Staff page for managing organizational hierarchy:
 * Organizations → Programs → Courses → Cohorts + Enrollments
 */
function OrganizationManagement() {
  const { user, token } = useAuth();
  const { canAccessPage } = usePermissions();
  const { isSecondaryNavPage } = useNavContext();
  const [activeTab, setActiveTab] = useState('organizations');
  const [loading, setLoading] = useState(false);

  if (!user || !canAccessPage('organization_management')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
          <p className="text-slate-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingCurtain />}
      
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        {!isSecondaryNavPage && (
          <div className="bg-white border-b border-slate-200 px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-slate-900 font-proxima">
                Organization Management
              </h1>
              <p className="text-slate-600 mt-1 font-proxima">
                Manage organizational hierarchy, programs, courses, and student enrollments
              </p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border border-slate-200 p-1 mb-8 rounded-lg inline-flex">
              <TabsTrigger 
                value="organizations"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2.5 rounded-md transition-all"
              >
                Organizations
              </TabsTrigger>
              <TabsTrigger 
                value="programs"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2.5 rounded-md transition-all"
              >
                Programs
              </TabsTrigger>
              <TabsTrigger 
                value="courses"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2.5 rounded-md transition-all"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger 
                value="cohorts"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2.5 rounded-md transition-all"
              >
                Cohorts
              </TabsTrigger>
              <TabsTrigger 
                value="enrollments"
                className="data-[state=active]:bg-[#4242EA] data-[state=active]:text-white text-slate-700 font-medium font-proxima px-6 py-2.5 rounded-md transition-all"
              >
                Enrollments
              </TabsTrigger>
            </TabsList>

            {/* Organizations Tab */}
            <TabsContent value="organizations" className="mt-0">
              <OrganizationsTab token={token} setLoading={setLoading} />
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="mt-0">
              <ProgramsTab token={token} setLoading={setLoading} />
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-0">
              <CoursesTab token={token} setLoading={setLoading} />
            </TabsContent>

            {/* Cohorts Tab (Linking functionality) */}
            <TabsContent value="cohorts" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 font-proxima">
                  Cohort Course Linking
                </h2>
                <p className="text-slate-600 font-proxima">
                  This feature allows you to link cohorts to courses in the organizational hierarchy.
                  Coming soon - for now, use the Courses tab to view linked cohorts.
                </p>
              </div>
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments" className="mt-0">
              <EnrollmentsTab token={token} setLoading={setLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default OrganizationManagement;

