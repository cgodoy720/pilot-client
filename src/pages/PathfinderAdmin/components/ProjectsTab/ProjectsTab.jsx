import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import KanbanBoard from '../shared/KanbanBoard';
import { getStageLabel } from '../shared/utils';

const ProjectsTab = ({
  projects,
  projectsOverview,
  projectsViewMode,
  setProjectsViewMode,
  stageFilter,
  setStageFilter,
  sortConfig,
  handleSort,
  getFilteredAndSortedProjects,
  collapsedProjectColumns,
  toggleProjectColumnCollapse,
  handleExport
}) => {
  const SortableHeader = ({ sortKey, children }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  const renderProjectCard = (project) => {
    const isOverdue = new Date(project.target_date) < new Date() && project.stage !== 'launch';
    
    return (
      <Card className="bg-gradient-to-br from-[#4242ea]/8 to-[#6b5cf6]/5 border border-[#4242ea]/15 hover:border-[#4242ea] hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                project.stage === 'launch' 
                  ? 'border-2 border-yellow-400 text-lg' 
                  : 'border border-gray-300 text-sm'
              }`}
              style={{ backgroundColor: 'white' }}
            >
              {project.stage === 'launch' ? '🤖' : (project.project_name ? project.project_name.charAt(0).toUpperCase() : '?')}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 flex-1 truncate m-0">
              {project.project_name}
            </h4>
          </div>
          
          <div className="text-xs text-gray-600 mb-2">
            {project.builder_first_name} {project.builder_last_name}
          </div>
          
          <div className="space-y-1 text-xs text-gray-600 mb-3">
            <div>
              <span className="font-medium">Target:</span> {new Date(project.target_date).toLocaleDateString()}
              {isOverdue && (
                <Badge variant="destructive" className="ml-2 text-[10px]">⚠️ Overdue</Badge>
              )}
            </div>
            
            {project.prd_link && (
              <div>
                <span className="font-medium">PRD:</span>{' '}
                {project.prd_approved ? (
                  <span className="text-green-600">✓ Approved</span>
                ) : project.prd_submitted ? (
                  <span className="text-amber-600">⏳ Pending</span>
                ) : (
                  <span>📝 Draft</span>
                )}
              </div>
            )}
            
            {project.linked_job_company && (
              <div>
                <span className="font-medium">For:</span> {project.linked_job_company}
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Build Projects Tracker</h2>
          <p className="text-sm text-gray-600">Track builder projects individually and by cohort.</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={projectsViewMode} onValueChange={setProjectsViewMode}>
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
          
          <Select value={stageFilter || "all"} onValueChange={(value) => setStageFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="ideation">Ideation</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="launch">Launch</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExport} className="bg-[#4242ea] text-white hover:bg-[#3333d1]">
            Export Data
          </Button>
        </div>
      </div>

      {/* Table View */}
      {projectsViewMode === 'table' && (
        <Card className="bg-white">
          <CardContent className="p-0">
            {getFilteredAndSortedProjects().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No projects found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader sortKey="builder_name">Builder</SortableHeader>
                      <SortableHeader sortKey="builder_cohort">Cohort</SortableHeader>
                      <SortableHeader sortKey="project_name">Project Name</SortableHeader>
                      <SortableHeader sortKey="stage">Stage</SortableHeader>
                      <SortableHeader sortKey="target_date">Target Date</SortableHeader>
                      <TableHead>PRD Status</TableHead>
                      <TableHead>Linked Job</TableHead>
                      <SortableHeader sortKey="created_at">Created</SortableHeader>
                      <TableHead>Links</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredAndSortedProjects().map((project) => {
                      const isOverdue = new Date(project.target_date) < new Date() && project.stage !== 'launch';
                      
                      return (
                        <TableRow key={project.project_id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <strong className="text-sm">{project.builder_first_name} {project.builder_last_name}</strong>
                              <span className="text-xs text-gray-500">{project.builder_email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{project.builder_cohort || '—'}</TableCell>
                          <TableCell className="font-medium">{project.project_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getStageLabel(project.stage)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {new Date(project.target_date).toLocaleDateString()}
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">⚠️ Overdue</Badge>
                              )}
                            </div>
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
                          <TableCell>
                            {project.linked_job_company ? (
                              <div className="flex flex-col">
                                <strong className="text-sm">{project.linked_job_company}</strong>
                                <span className="text-xs text-gray-500">{project.linked_job_role}</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {project.prd_link && (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lg hover:opacity-70 transition-opacity"
                                  title="View PRD"
                                >
                                  📄
                                </a>
                              )}
                              {project.deployment_url && (
                                <a
                                  href={project.deployment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lg hover:opacity-70 transition-opacity"
                                  title="View Deployment"
                                >
                                  🚀
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {projectsViewMode === 'kanban' && (
        <KanbanBoard
          columns={columns}
          getItemsForColumn={(stage) => getFilteredAndSortedProjects().filter(proj => proj.stage === stage)}
          renderCard={renderProjectCard}
          collapsedColumns={collapsedProjectColumns}
          toggleCollapse={toggleProjectColumnCollapse}
          emptyMessage={(stage) => `No projects in ${getStageLabel(stage)}`}
        />
      )}
    </div>
  );
};

export default memo(ProjectsTab);

