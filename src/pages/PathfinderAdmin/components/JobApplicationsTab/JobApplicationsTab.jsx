import React, { memo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import Swal from 'sweetalert2';
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
  builders,
  token,
  onRefresh
}) => {
  // Map builders to include full_name for BuilderFilterModal
  const buildersWithFullName = (builders || []).map(b => ({
    ...b,
    full_name: `${b.first_name} ${b.last_name}`
  }));

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    builderId: '', companyName: '', roleTitle: '', stage: 'prospect',
    dateApplied: new Date().toISOString().split('T')[0],
    location: '', jobUrl: '', salaryRange: '', notes: '',
    contactName: '', contactEmail: '', sourceType: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddApplication = async () => {
    if (!addForm.builderId || !addForm.companyName || !addForm.roleTitle) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Builder, company, and role are required.' });
      return;
    }
    setIsAdding(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/job-applications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(addForm)
        }
      );
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Added', text: 'Job application created.', timer: 1500, showConfirmButton: false });
        setShowAddModal(false);
        setAddForm({
          builderId: '', companyName: '', roleTitle: '', stage: 'prospect',
          dateApplied: new Date().toISOString().split('T')[0],
          location: '', jobUrl: '', salaryRange: '', notes: '',
          contactName: '', contactEmail: '', sourceType: ''
        });
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Failed to create application.' });
      }
    } catch (err) {
      console.error('Add application error:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create application.' });
    }
    setIsAdding(false);
  };
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
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Job Applications</h2>
            <p className="text-sm text-gray-600">View all job applications submitted by builders</p>
          </div>
          
          {/* Add Job Application Button */}
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Job
          </Button>

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
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              {selectedBuilderFilter.first_name} {selectedBuilderFilter.last_name}
            </Badge>
          )}
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
                  <TableRow className="bg-gray-50/70">
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
                      className="cursor-pointer hover:bg-[#f6f7ff] transition-colors"
                    >
                      <TableCell className="py-3">
                        <strong className="text-sm">
                          {application.builder_first_name} {application.builder_last_name}
                        </strong>
                      </TableCell>
                      <TableCell className="py-3">
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
                      <TableCell className="py-3">{application.role_title}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant={getStageBadgeVariant(application.stage)}>
                          {getStageLabel(application.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">{application.location || '—'}</TableCell>
                      <TableCell className="py-3">{formatSalary(application) || '—'}</TableCell>
                      <TableCell className="py-3">{new Date(application.date_applied).toLocaleDateString()}</TableCell>
                      <TableCell className="py-3">{application.source_type || '—'}</TableCell>
                      <TableCell className="py-3">
                        {application.internal_referral ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            ✓ Yes
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="py-3">
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
        token={token}
        onRefresh={onRefresh}
      />

      <BuilderFilterModal
        open={showBuilderFilterModal}
        onOpenChange={setShowBuilderFilterModal}
        builders={buildersWithFullName}
        selectedBuilder={selectedBuilderFilter}
        onSelectBuilder={setSelectedBuilderFilter}
      />

      {/* Add Job Application Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-600">Builder *</Label>
              <Select value={addForm.builderId ? String(addForm.builderId) : ''} onValueChange={v => setAddForm({ ...addForm, builderId: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select Builder" /></SelectTrigger>
                <SelectContent>
                  {buildersWithFullName.map(b => (
                    <SelectItem key={b.builder_id} value={String(b.builder_id)}>{b.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Company *</Label>
                <Input value={addForm.companyName} onChange={e => setAddForm({ ...addForm, companyName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Role *</Label>
                <Input value={addForm.roleTitle} onChange={e => setAddForm({ ...addForm, roleTitle: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Stage</Label>
                <Select value={addForm.stage} onValueChange={v => setAddForm({ ...addForm, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screen">Phone Screen</SelectItem>
                    <SelectItem value="oa">Online Assessment</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Date Applied</Label>
                <Input type="date" value={addForm.dateApplied} onChange={e => setAddForm({ ...addForm, dateApplied: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Location</Label>
                <Input value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Salary Range</Label>
                <Input value={addForm.salaryRange} onChange={e => setAddForm({ ...addForm, salaryRange: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Contact Name</Label>
                <Input value={addForm.contactName} onChange={e => setAddForm({ ...addForm, contactName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Contact Email</Label>
                <Input value={addForm.contactEmail} onChange={e => setAddForm({ ...addForm, contactEmail: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Job URL</Label>
              <Input value={addForm.jobUrl} onChange={e => setAddForm({ ...addForm, jobUrl: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Source</Label>
              <Input value={addForm.sourceType} onChange={e => setAddForm({ ...addForm, sourceType: e.target.value })} placeholder="e.g. LinkedIn, Referral, Job Board" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Notes</Label>
              <Textarea value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddApplication} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(JobApplicationsTab);

