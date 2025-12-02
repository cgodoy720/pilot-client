import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import KanbanBoard from '../shared/KanbanBoard';
import { getStageLabel } from '../shared/utils';
import Swal from 'sweetalert2';

const PRDsTab = ({
  pendingApprovals,
  approvedPRDs,
  prdSubView,
  setPrdSubView,
  prdViewMode,
  setPrdViewMode,
  prdFilter,
  setPrdFilter,
  prdSortConfig,
  handlePrdSort,
  prdStageFilter,
  setPrdStageFilter,
  collapsedPrdColumns,
  togglePrdColumnCollapse,
  getFilteredAndSortedPRDs,
  getAllPRDsForKanban,
  handleApprovePRD
}) => {
  const SortableHeader = ({ sortKey, children }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
      onClick={() => handlePrdSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {prdSortConfig.key === sortKey && (
          <span className="text-xs">
            {prdSortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  const handleViewNotes = (project) => {
    Swal.fire({
      title: 'Approval Notes',
      html: `
        <div style="text-align: left; padding: 8px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
            <strong>Project:</strong> ${project.project_name}
          </p>
          <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">
            ${project.prd_approval_notes}
          </div>
        </div>
      `,
      confirmButtonColor: '#4242ea',
      width: '600px'
    });
  };

  const renderPRDCard = (project) => {
    return (
      <Card className="bg-gradient-to-br from-[#4242ea]/8 to-[#6b5cf6]/5 border border-[#4242ea]/15 hover:border-[#4242ea] hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 m-0 flex-1 truncate">
              {project.project_name}
            </h4>
            <div className="flex gap-1">
              {project.prd_approved && (
                <Badge className="bg-green-100 text-green-700 text-xs" title="PRD Approved">
                  ✓
                </Badge>
              )}
              {!project.prd_approved && project.prd_submitted && (
                <Badge className="bg-amber-100 text-amber-700 text-xs" title="PRD Pending Approval">
                  ⏳
                </Badge>
              )}
              {!project.prd_approved && !project.prd_submitted && project.prd_link && (
                <Badge variant="secondary" className="text-xs" title="PRD Draft">
                  📝
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600 mb-3">
            <div className="flex items-center justify-between">
              <strong className="text-gray-900">{project.builder_first_name} {project.builder_last_name}</strong>
              {project.builder_cohort && (
                <Badge variant="secondary" className="text-xs">
                  {project.builder_cohort}
                </Badge>
              )}
            </div>
            
            <div>
              <span className="font-medium">Target:</span> {new Date(project.target_date).toLocaleDateString()}
            </div>
            
            {project.prd_submitted_at && (
              <div>
                <span className="font-medium">Submitted:</span> {new Date(project.prd_submitted_at).toLocaleDateString()}
              </div>
            )}
            
            {project.prd_approved_at && (
              <div>
                <span className="font-medium">Approved:</span> {new Date(project.prd_approved_at).toLocaleDateString()}
              </div>
            )}
            
            {project.linked_job_company && (
              <div className="p-2 bg-[#4242ea]/5 rounded text-xs">
                <span className="font-medium">Linked Job:</span> {project.linked_job_company} - {project.linked_job_role}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {project.prd_link && (
              <a
                href={project.prd_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-[#4242ea] transition-colors"
                title="View PRD"
              >
                📄 PRD
              </a>
            )}
            {project.deployment_url && (
              <a
                href={project.deployment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-[#4242ea] transition-colors"
                title="View Deployment"
              >
                🚀 Live
              </a>
            )}
            {!project.prd_approved && project.prd_submitted && (
              <Button
                size="sm"
                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprovePRD(project.project_id, project.project_name);
                }}
                title="Approve PRD"
              >
                ✓ Approve
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const columns = [
    { stage: 'ideation', label: 'Ideation' },
    { stage: 'planning', label: 'Planning & Design' },
    { stage: 'development', label: 'Development' },
    { stage: 'testing', label: 'Testing' },
    { stage: 'launch', label: 'Launch' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={prdSubView} onValueChange={setPrdSubView}>
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved Archive</TabsTrigger>
            <TabsTrigger value="all">All PRDs</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle (only for All PRDs) */}
          {prdSubView === 'all' && (
            <>
              <Tabs value={prdViewMode} onValueChange={setPrdViewMode}>
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="3" width="12" height="2" rx="0.5" fill="currentColor"/>
                      <rect x="2" y="7" width="12" height="2" rx="0.5" fill="currentColor"/>
                      <rect x="2" y="11" width="12" height="2" rx="0.5" fill="currentColor"/>
                    </svg>
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="3" height="12" rx="0.5" fill="currentColor"/>
                      <rect x="6.5" y="2" width="3" height="8" rx="0.5" fill="currentColor"/>
                      <rect x="11" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
                    </svg>
                    Kanban
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={prdFilter} onValueChange={setPrdFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted for Approval</SelectItem>
                  <SelectItem value="all">All with PRD Link</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {/* Stage Filter (for table views) */}
          {prdSubView !== 'all' && (
            <>
              <Select value={prdStageFilter || "all"} onValueChange={(value) => setPrdStageFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="ideation">Ideation</SelectItem>
                  <SelectItem value="planning">Planning & Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                </SelectContent>
              </Select>

              {prdStageFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrdStageFilter('')}
                >
                  Clear Filter
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pending Approvals Content */}
      {prdSubView === 'pending' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Review and approve builder project PRDs before they can move to development.
          </p>

          <Card className="bg-white">
            <CardContent className="p-0">
              {getFilteredAndSortedPRDs(pendingApprovals).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>🎉 No pending PRD approvals{prdStageFilter ? ' matching filter' : ''}!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="builder_name">Builder</SortableHeader>
                        <SortableHeader sortKey="project_name">Project Name</SortableHeader>
                        <SortableHeader sortKey="stage">Stage</SortableHeader>
                        <SortableHeader sortKey="target_date">Target Date</SortableHeader>
                        <SortableHeader sortKey="prd_submitted_at">Submitted</SortableHeader>
                        <TableHead>PRD Link</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAndSortedPRDs(pendingApprovals).map((project) => (
                        <TableRow key={project.project_id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <strong className="text-sm">{project.builder_first_name} {project.builder_last_name}</strong>
                              <span className="text-xs text-gray-500">{project.builder_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{project.project_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getStageLabel(project.stage)}</Badge>
                          </TableCell>
                          <TableCell>{new Date(project.target_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(project.prd_submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {project.prd_link ? (
                              <a
                                href={project.prd_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4242ea] hover:underline text-sm"
                              >
                                📄 View PRD
                              </a>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApprovePRD(project.project_id, project.project_name)}
                            >
                              ✓ Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Approved Archive Content */}
      {prdSubView === 'approved' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            View all previously approved project PRDs.
          </p>

          <Card className="bg-white">
            <CardContent className="p-0">
              {getFilteredAndSortedPRDs(approvedPRDs).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No approved PRDs{prdStageFilter ? ' matching filter' : ''} yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="builder_name">Builder</SortableHeader>
                        <SortableHeader sortKey="project_name">Project Name</SortableHeader>
                        <SortableHeader sortKey="stage">Stage</SortableHeader>
                        <SortableHeader sortKey="target_date">Target Date</SortableHeader>
                        <TableHead>Approved By</TableHead>
                        <SortableHeader sortKey="prd_approved_at">Approved On</SortableHeader>
                        <TableHead>PRD Link</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAndSortedPRDs(approvedPRDs).map((project) => (
                        <TableRow key={project.project_id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <strong className="text-sm">{project.builder_first_name} {project.builder_last_name}</strong>
                              <span className="text-xs text-gray-500">{project.builder_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{project.project_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getStageLabel(project.stage)}</Badge>
                          </TableCell>
                          <TableCell>{new Date(project.target_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {project.approver_first_name && project.approver_last_name
                              ? `${project.approver_first_name} ${project.approver_last_name}`
                              : '—'
                            }
                          </TableCell>
                          <TableCell>{new Date(project.prd_approved_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {project.prd_link ? (
                              <a
                                href={project.prd_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4242ea] hover:underline text-sm"
                              >
                                📄 View PRD
                              </a>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {project.prd_approval_notes ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewNotes(project)}
                              >
                                View Notes
                              </Button>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* All PRDs Content (with Table/Kanban toggle) */}
      {prdSubView === 'all' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            View all project PRDs {prdViewMode === 'kanban' ? 'organized by stage' : 'in a detailed table'}. {prdFilter === 'submitted' ? 'Showing only projects submitted for approval.' : 'Showing all projects with a PRD link.'}
          </p>

          {/* Table View */}
          {prdViewMode === 'table' && (
            <Card className="bg-white">
              <CardContent className="p-0">
                {getFilteredAndSortedPRDs(getAllPRDsForKanban()).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No PRDs found{prdFilter === 'submitted' ? ' submitted for approval' : ' with PRD links'}.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableHeader sortKey="builder_name">Builder</SortableHeader>
                          <SortableHeader sortKey="project_name">Project Name</SortableHeader>
                          <SortableHeader sortKey="stage">Stage</SortableHeader>
                          <TableHead>PRD Status</TableHead>
                          <SortableHeader sortKey="target_date">Target Date</SortableHeader>
                          <TableHead>PRD Link</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredAndSortedPRDs(getAllPRDsForKanban()).map((project) => (
                          <TableRow key={project.project_id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <strong className="text-sm">{project.builder_first_name} {project.builder_last_name}</strong>
                                <span className="text-xs text-gray-500">{project.builder_email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{project.project_name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{getStageLabel(project.stage)}</Badge>
                            </TableCell>
                            <TableCell>
                              {project.prd_approved ? (
                                <Badge className="bg-green-100 text-green-700">✓ Approved</Badge>
                              ) : project.prd_submitted ? (
                                <Badge className="bg-amber-100 text-amber-700">⏳ Pending</Badge>
                              ) : project.prd_link ? (
                                <Badge variant="secondary">📝 Draft</Badge>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>{new Date(project.target_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {project.prd_link ? (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4242ea] hover:underline text-sm"
                                >
                                  📄 View PRD
                                </a>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              {!project.prd_approved && project.prd_submitted && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprovePRD(project.project_id, project.project_name)}
                                >
                                  ✓ Approve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Kanban View */}
          {prdViewMode === 'kanban' && (
            <KanbanBoard
              columns={columns}
              getItemsForColumn={(stage) => getFilteredAndSortedPRDs(getAllPRDsForKanban()).filter(proj => proj.stage === stage)}
              renderCard={renderPRDCard}
              collapsedColumns={collapsedPrdColumns}
              toggleCollapse={togglePrdColumnCollapse}
              emptyMessage={(stage) => `No PRDs in ${getStageLabel(stage)}`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default memo(PRDsTab);

