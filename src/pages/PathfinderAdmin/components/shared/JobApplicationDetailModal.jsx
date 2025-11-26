import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { formatSalary } from '../../../../utils/salaryFormatter';
import { getStageLabel } from './utils';

const JobApplicationDetailModal = ({ application, open, onOpenChange }) => {
  if (!application) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {application.company_name} - {application.role_title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Builder Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-base font-semibold mb-2">Builder</h3>
            <div className="text-sm">
              <strong>{application.builder_first_name} {application.builder_last_name}</strong>
              <div className="text-gray-600 mt-1">{application.builder_email}</div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Job Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-[#4242ea]">
                Job Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Company</div>
                  <div className="font-semibold">{application.company_name}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Role</div>
                  <div className="font-semibold">{application.role_title}</div>
                </div>

                {application.location && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Location</div>
                    <div>{application.location}</div>
                  </div>
                )}

                {application.job_url && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Job URL</div>
                    <a 
                      href={application.job_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#4242ea] underline hover:text-[#3333d1]"
                    >
                      View Job Posting
                    </a>
                  </div>
                )}

                {formatSalary(application) && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Salary Range</div>
                    <div>{formatSalary(application)}</div>
                  </div>
                )}

                {application.job_type && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Job Type</div>
                    <div className="capitalize">{application.job_type.replace(/-/g, ' ')}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-gray-600 mb-1">Stage</div>
                  <Badge variant={getStageBadgeVariant(application.stage)}>
                    {getStageLabel(application.stage)}
                  </Badge>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Date Applied</div>
                  <div>{new Date(application.date_applied).toLocaleDateString()}</div>
                </div>

                {application.source_type && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Source</div>
                    <div>{application.source_type}</div>
                  </div>
                )}

                {application.internal_referral && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Referral</div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      ✓ Internal Referral
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Contact & Additional Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-green-500">
                Contact & Details
              </h3>
              
              <div className="space-y-4">
                {application.contact_name && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Contact Name</div>
                    <div>{application.contact_name}</div>
                  </div>
                )}

                {application.contact_title && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Contact Title</div>
                    <div>{application.contact_title}</div>
                  </div>
                )}

                {application.contact_email && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Contact Email</div>
                    <a 
                      href={`mailto:${application.contact_email}`} 
                      className="text-[#4242ea] hover:underline"
                    >
                      {application.contact_email}
                    </a>
                  </div>
                )}

                {application.contact_phone && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Contact Phone</div>
                    <div>{application.contact_phone}</div>
                  </div>
                )}

                {application.response_received && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Response Received</div>
                    <div className="text-green-600 font-semibold">✓ Yes</div>
                    {application.response_date && (
                      <div className="text-xs text-gray-600 mt-1">
                        on {new Date(application.response_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {application.interview_count > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Interviews</div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {application.interview_count}
                    </Badge>
                  </div>
                )}

                {(application.stage === 'accepted' || application.stage === 'offer') && application.final_salary && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Final Salary</div>
                    <div className="font-semibold text-green-600">{application.final_salary}</div>
                  </div>
                )}

                {application.start_date && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Start Date</div>
                    <div>{new Date(application.start_date).toLocaleDateString()}</div>
                  </div>
                )}

                {application.stage === 'withdrawn' && application.withdrawal_reason && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Withdrawal Reason</div>
                    <div className="text-red-600">{application.withdrawal_reason}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          {application.job_description && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-amber-500">
                Job Description
              </h3>
              <div 
                className="p-4 bg-gray-50 rounded-lg max-h-[300px] overflow-y-auto text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: application.job_description }}
              />
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-purple-500">
                Notes
              </h3>
              <div className="p-4 bg-purple-50 rounded-lg text-sm leading-relaxed italic">
                {application.notes}
              </div>
            </div>
          )}

          {/* Acceptance Notes */}
          {application.acceptance_notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-green-500">
                Acceptance Notes
              </h3>
              <div className="p-4 bg-green-50 rounded-lg text-sm leading-relaxed">
                {application.acceptance_notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationDetailModal;

