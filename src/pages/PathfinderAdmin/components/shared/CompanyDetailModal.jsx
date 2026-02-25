import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { getStageLabel } from './utils';

const CompanyDetailModal = ({ 
  company, 
  companyBuilders, 
  open, 
  onOpenChange 
}) => {
  if (!company) return null;

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  const getInitialColor = (companyName) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    const charCode = companyName ? companyName.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {company.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-600 mb-1">Total Applications</div>
              <div className="text-lg font-semibold">{company.application_count || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Unique Builders</div>
              <div className="text-lg font-semibold">{company.builder_count || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Interviews</div>
              <div className="text-lg font-semibold">{company.interview_count || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Offers</div>
              <div className="text-lg font-semibold">{company.offer_count || 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Rejections</div>
              <div className="text-lg font-semibold">{company.rejected_count || 0}</div>
            </div>
          </div>

          {/* Builders Applying */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Builders Applying</h3>
            {companyBuilders.length === 0 ? (
              <p className="text-gray-500">No builders found for this company.</p>
            ) : (
              <div className="space-y-3">
                {companyBuilders.map(builder => (
                  <div 
                    key={builder.builder_id} 
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <strong className="text-base">{builder.first_name} {builder.last_name}</strong>
                      <Badge variant="secondary" className="text-xs">
                        {builder.cohort || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      <span>📝 {builder.application_count} {builder.application_count === 1 ? 'app' : 'apps'}</span>
                      <span>🎤 {builder.interview_count} {builder.interview_count === 1 ? 'interview' : 'interviews'}</span>
                      {builder.offer_count > 0 && (
                        <span>✅ {builder.offer_count} {builder.offer_count === 1 ? 'offer' : 'offers'}</span>
                      )}
                      {builder.rejected_count > 0 && (
                        <span>❌ {builder.rejected_count} {builder.rejected_count === 1 ? 'rejection' : 'rejections'}</span>
                      )}
                    </div>
                    {builder.applications && builder.applications.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <strong className="text-sm text-gray-700 mb-2 block">Positions:</strong>
                        <div className="space-y-2">
                          {builder.applications.map((app, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                            >
                              <span className="text-sm">{app.role_title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getStageLabel(app.stage)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDetailModal;

