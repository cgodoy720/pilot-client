import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { getStageLabel } from './utils';

const BuilderDetailModal = ({ 
  builder, 
  builderDetails, 
  open, 
  onOpenChange,
  dateFilter,
  setDateFilter,
  clearDateFilter,
  getFilteredApplications
}) => {
  if (!builder || !builderDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {builder.first_name} {builder.last_name}'s Activity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg flex-wrap">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-semibold text-gray-900">From:</label>
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-auto"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm font-semibold text-gray-900">To:</label>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-auto"
              />
            </div>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilter}
                >
                  Clear Dates
                </Button>
                <span className="text-xs text-gray-600 ml-auto">
                  Showing {getFilteredApplications(builderDetails.applications).length} of {builderDetails.applications?.length || 0} applications
                </span>
              </>
            )}
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hustles Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-[#4242ea]">
                Hustles ({builderDetails.networking?.length || 0})
              </h3>
              {builderDetails.networking && builderDetails.networking.length > 0 ? (
                <div className="space-y-3">
                  {builderDetails.networking.slice(0, 10).map(activity => (
                    <div 
                      key={activity.networking_activity_id} 
                      className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#4242ea]"
                    >
                      <div className="font-semibold mb-1 text-sm">
                        {activity.type.replace(/_/g, ' ')}
                        {activity.sub_type && (
                          <span className="font-normal text-gray-600"> - {activity.sub_type}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {activity.company && <div><strong>Company:</strong> {activity.company}</div>}
                        {activity.contact_name && <div><strong>Contact:</strong> {activity.contact_name}</div>}
                        {activity.contact_email && <div className="text-[10px]">{activity.contact_email}</div>}
                        {activity.platform && <div><strong>Platform:</strong> {activity.platform}</div>}
                        {activity.event_name && <div><strong>Event:</strong> {activity.event_name}</div>}
                        {activity.outcome && <div><strong>Outcome:</strong> {activity.outcome}</div>}
                        {activity.connection_strength && (
                          <div>
                            <strong>Connection:</strong>{' '}
                            <Badge variant="secondary" className="text-xs">
                              {activity.connection_strength}
                            </Badge>
                          </div>
                        )}
                        {activity.follow_up_date && (
                          <div><strong>Follow-up:</strong> {new Date(activity.follow_up_date).toLocaleDateString()}</div>
                        )}
                        <div><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</div>
                        {activity.notes && (
                          <div className="mt-1 italic text-gray-500">{activity.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No hustles recorded
                </div>
              )}
            </div>

            {/* Build Projects Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-green-500">
                Build Projects ({builderDetails.projects?.length || 0})
              </h3>
              {builderDetails.projects && builderDetails.projects.length > 0 ? (
                <div className="space-y-3">
                  {builderDetails.projects.map(project => (
                    <div 
                      key={project.project_id} 
                      className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500"
                    >
                      <div className="font-semibold mb-1 text-sm">
                        {project.project_name}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {getStageLabel(project.stage)}
                          </Badge>
                        </div>
                        {project.target_date && (
                          <div>Target: {new Date(project.target_date).toLocaleDateString()}</div>
                        )}
                        {project.prd_approved && (
                          <div className="text-green-600 font-semibold">✓ PRD Approved</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No build projects
                </div>
              )}
            </div>

            {/* Job Applications Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-amber-500">
                Job Applications ({builderDetails.applications?.length || 0})
              </h3>
              {builderDetails.applications && builderDetails.applications.length > 0 ? (
                <div className="space-y-3">
                  {getFilteredApplications(builderDetails.applications).slice(0, 10).map(app => (
                    <div 
                      key={app.application_id} 
                      className="p-3 bg-gray-50 rounded-lg border-l-4 border-amber-500"
                    >
                      <div className="font-semibold mb-1 text-sm">
                        {app.company_name}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{app.role_title}</div>
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {getStageLabel(app.stage)}
                          </Badge>
                        </div>
                        <div>{new Date(app.date_applied).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                  {getFilteredApplications(builderDetails.applications).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No applications for selected dates
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No job applications
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuilderDetailModal;

