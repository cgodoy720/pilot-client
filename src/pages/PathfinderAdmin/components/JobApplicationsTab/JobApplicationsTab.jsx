import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import KanbanBoard from '../shared/KanbanBoard';
import JobApplicationDetailModal from '../shared/JobApplicationDetailModal';
import BuilderFilterModal from '../shared/BuilderFilterModal';
import { formatSalary } from '../../../../utils/salaryFormatter';
import { getStageLabel, renderStageTimeline } from '../shared/utils';

const JobApplicationsTab = ({
  jobApplications,
  jobAppViewMode,
  setJobAppViewMode,
  jobAppSortConfig,
  handleJobAppSort,
  getSortedJobApplications,
  selectedJobApplication,
  setSelectedJobApplication,
  selectedBuilderFilter,
  setSelectedBuilderFilter,
  showBuilderFilterModal,
  setShowBuilderFilterModal,
  collapsedColumns,
  toggleColumnCollapse,
  getUniqueBuilders
}) => {
  const SortableHeader = ({ sortKey, children }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
      onClick={() => handleJobAppSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {jobAppSortConfig.key === sortKey && (
          <span className="text-xs">
            {jobAppSortConfig.direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </TableHead>
  );

  const getStageBadgeVariant = (stage) => {
    const variants = {
      prospect: 'secondary',
      applied: 'default',
      screen: 'default',
      oa: 'default',
      interview: 'default',
      offer: 'default',
      accepted: 'default',
      rejected: 'destructive',
      withdrawn: 'outline'
    };
    return variants[stage] || 'secondary';
  };

  const renderJobApplicationCard = (app) => {
    return (
      <Card className="bg-gradient-to-br from-[#4242ea]/8 to-[#6b5cf6]/5 border border-[#4242ea]/15 hover:border-[#4242ea] hover:shadow-md transition-all cursor-pointer"
          onClick={() => setSelectedJobApplication(app)}>
        <CardContent className="p-4">
          <div className="text-xs text-gray-600 mb-2">
            {app.builder_first_name} {app.builder_last_name}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {app.company_logo && (
              <img 
                src={app.company_logo} 
                alt={app.company_name}
                className="w-7 h-7 rounded object-contain bg-white border border-gray-200"
              />
            )}
            <div className="font-semibold text-sm text-gray-900 flex-1 truncate">
              {app.company_name}
            </div>
          </div>
          
          <div className="text-sm text-gray-700 mb-3 line-clamp-2">
            {app.role_title}
          </div>
          
          <div className="space-y-1 text-xs text-gray-600 mb-3">
            {app.location && (
              <div className="flex items-center gap-1">
                📍 {app.location}
              </div>
            )}
            {formatSalary(app) && (
              <div className="flex items-center gap-1">
                💰 {formatSalary(app)}
              </div>
            )}
          </div>
          
          {app.interview_count > 0 && (
            <div className="mb-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                💬 {app.interview_count}
              </Badge>
            </div>
          )}
          
          {/* Badges for Hustles and Builds */}
          <div className="flex flex-wrap gap-1 mb-2">
            {app.hustle_count > 0 ? (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                ⚡ {app.hustle_count} {app.hustle_count === 1 ? 'Hustle' : 'Hustles'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-gray-400">
                No Hustles
              </Badge>
            )}
            {app.build_count > 0 ? (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                🔧 {app.build_count} {app.build_count === 1 ? 'Build' : 'Builds'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-gray-400">
                No Builds
              </Badge>
            )}
          </div>
          
          {/* Stage Timeline */}
          {renderStageTimeline(app.stage_history)}
        </CardContent>
      </Card>
    );
  };

  const columns = [
    { stage: 'prospect', label: 'Prospect' },
    { stage: 'applied', label: 'Applied' },
    { stage: 'screen', label: 'Phone Screen' },
    { stage: 'oa', label: 'Online Assessment' },
    { stage: 'interview', label: 'Interview' },
    { stage: 'offer', label: 'Offer' },
    { stage: 'accepted', label: 'Accepted' },
    { stage: 'rejected', label: 'Rejected' },
    { stage: 'withdrawn', label: 'Withdrawn' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Job Applications</h2>
            <p className="text-sm text-gray-600">View all job applications submitted by builders</p>
          </div>
          
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBuilderFilterModal(true)}
            title="Filter by Builder"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h16M5 10h10M8 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Button>
          
          {/* Clear Filter Button */}
          {selectedBuilderFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBuilderFilter(null)}
            >
              Clear Filter
            </Button>
          )}
        </div>
        
        {/* View Toggle */}
        <Tabs value={jobAppViewMode} onValueChange={setJobAppViewMode}>
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="3" height="12" fill="currentColor"/>
                <rect x="6.5" y="2" width="3" height="8" fill="currentColor"/>
                <rect x="11" y="2" width="3" height="10" fill="currentColor"/>
              </svg>
              Kanban
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="12" height="2" fill="currentColor"/>
                <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
                <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
              </svg>
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {jobApplications.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="text-center py-12 text-gray-500">
            <p>No job applications found</p>
          </CardContent>
        </Card>
      ) : jobAppViewMode === 'table' ? (
        /* Table View */
        <Card className="bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader sortKey="builder_name">Builder</SortableHeader>
                    <SortableHeader sortKey="company_name">Company</SortableHeader>
                    <SortableHeader sortKey="role_title">Role</SortableHeader>
                    <SortableHeader sortKey="stage">Stage</SortableHeader>
                    <SortableHeader sortKey="location">Location</SortableHeader>
                    <SortableHeader sortKey="salary_range">Salary</SortableHeader>
                    <SortableHeader sortKey="date_applied">Date Applied</SortableHeader>
                    <SortableHeader sortKey="source_type">Source</SortableHeader>
                    <SortableHeader sortKey="internal_referral">Referral</SortableHeader>
                    <SortableHeader sortKey="interview_count">Interviews</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedJobApplications().map((application) => (
                    <TableRow 
                      key={application.job_application_id}
                      onClick={() => setSelectedJobApplication(application)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <strong className="text-sm">
                          {application.builder_first_name} {application.builder_last_name}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {application.company_logo && (
                            <img 
                              src={application.company_logo} 
                              alt={application.company_name}
                              className="w-6 h-6 rounded object-contain"
                            />
                          )}
                          <strong className="text-sm">{application.company_name}</strong>
                        </div>
                      </TableCell>
                      <TableCell>{application.role_title}</TableCell>
                      <TableCell>
                        <Badge variant={getStageBadgeVariant(application.stage)}>
                          {getStageLabel(application.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell>{application.location || '—'}</TableCell>
                      <TableCell>{formatSalary(application) || '—'}</TableCell>
                      <TableCell>{new Date(application.date_applied).toLocaleDateString()}</TableCell>
                      <TableCell>{application.source_type || '—'}</TableCell>
                      <TableCell>
                        {application.internal_referral ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            ✓ Yes
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {application.interview_count > 0 ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {application.interview_count}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Kanban View */
        <KanbanBoard
          columns={columns}
          getItemsForColumn={(stage) => getSortedJobApplications().filter(app => app.stage === stage)}
          renderCard={renderJobApplicationCard}
          collapsedColumns={collapsedColumns}
          toggleCollapse={toggleColumnCollapse}
          emptyMessage="No applications"
        />
      )}

      {/* Modals */}
      <JobApplicationDetailModal
        application={selectedJobApplication}
        open={!!selectedJobApplication}
        onOpenChange={(open) => !open && setSelectedJobApplication(null)}
      />
      
      <BuilderFilterModal
        open={showBuilderFilterModal}
        onOpenChange={setShowBuilderFilterModal}
        builders={getUniqueBuilders()}
        selectedBuilder={selectedBuilderFilter}
        onSelectBuilder={setSelectedBuilderFilter}
      />
    </div>
  );
};

export default memo(JobApplicationsTab);

