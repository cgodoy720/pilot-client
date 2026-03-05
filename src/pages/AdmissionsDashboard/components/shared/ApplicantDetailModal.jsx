import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { formatPhoneNumber, getStatusBadgeClasses, formatStatus } from './utils';
import AttendedEventModal from './AttendedEventModal';

const ApplicantDetailModal = ({
  isOpen,
  onClose,
  applicant,
  onViewNotes,
  token,
  onRefresh
}) => {
  const [attendedEventModalOpen, setAttendedEventModalOpen] = useState(false);

  if (!isOpen || !applicant) return null;

  const handleAttendedEventClick = () => {
    setAttendedEventModalOpen(true);
  };

  const handleAttendedEventSuccess = () => {
    // Refresh the applicant data
    if (onRefresh) {
      onRefresh();
    }
  };

  // Determine if info session status is clickable
  const canManageInfoSession = !['attended', 'attended_late', 'very_late'].includes(applicant.info_session_status);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl font-proxima">
          <DialogHeader>
            <DialogTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
              {applicant.first_name} {applicant.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 font-proxima">Email</label>
                <p className="font-medium text-[#1a1a1a] font-proxima">{applicant.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-proxima">Phone</label>
                <p className="font-medium text-[#1a1a1a] font-proxima">
                  {formatPhoneNumber(applicant.phone_number)}
                </p>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Application Status</label>
                <Badge className={`${getStatusBadgeClasses(applicant.status)} font-proxima`}>
                  {formatStatus(applicant.status)}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Assessment</label>
                {(applicant.recommendation || applicant.final_status) ? (
                  <Badge className={`${getStatusBadgeClasses(applicant.final_status || applicant.recommendation)} font-proxima`}>
                    {formatStatus(applicant.final_status || applicant.recommendation)}
                  </Badge>
                ) : (
                  <span className="text-gray-400 font-proxima">Pending</span>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Deliberation</label>
                {applicant.deliberation ? (
                  <Badge className={`${getStatusBadgeClasses(applicant.deliberation)} font-proxima`}>
                    {formatStatus(applicant.deliberation)}
                  </Badge>
                ) : (
                  <span className="text-gray-400 font-proxima">Not Set</span>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Info Session</label>
                {applicant.info_session_status ? (
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeClasses(applicant.info_session_status)} font-proxima`}>
                      {formatStatus(applicant.info_session_status)}
                    </Badge>
                    {canManageInfoSession && token && (
                      <button
                        onClick={handleAttendedEventClick}
                        className="text-xs text-[#4242ea] hover:text-[#3333d1] underline font-proxima"
                        title="Manage external event attendance"
                      >
                        {applicant.info_session_status === 'attended_event' ? 'Manage' : 'Mark Event'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-proxima">Not Registered</span>
                    {token && (
                      <button
                        onClick={handleAttendedEventClick}
                        className="text-xs text-[#4242ea] hover:text-[#3333d1] underline font-proxima"
                        title="Mark as attended external event"
                      >
                        Mark Event
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Workshop</label>
                {applicant.workshop_status ? (
                  <Badge className={`${getStatusBadgeClasses(applicant.workshop_status)} font-proxima`}>
                    {formatStatus(applicant.workshop_status)}
                  </Badge>
                ) : (
                  <span className="text-gray-400 font-proxima">Pending</span>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Admission</label>
                {applicant.program_admission_status ? (
                  <Badge className={`${getStatusBadgeClasses(applicant.program_admission_status)} font-proxima`}>
                    {formatStatus(applicant.program_admission_status)}
                  </Badge>
                ) : (
                  <span className="text-gray-400 font-proxima">Pending</span>
                )}
              </div>
            </div>

            {/* Workshop Grade */}
            {applicant.structured_task_grade && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-500 font-proxima block mb-2">Workshop Grade</label>
                <p className="font-bold text-lg text-[#4242ea] font-proxima-bold">
                  {applicant.structured_task_grade}
                </p>
              </div>
            )}

            {/* Created Date */}
            <div>
              <label className="text-sm text-gray-500 font-proxima">Created</label>
              <p className="font-medium text-[#1a1a1a] font-proxima">
                {applicant.created_at 
                  ? new Date(applicant.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            {onViewNotes && (
              <Button 
                variant="outline" 
                onClick={() => onViewNotes(applicant)}
                className="font-proxima"
              >
                📝 View Notes
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="font-proxima">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attended Event Modal */}
      <AttendedEventModal
        isOpen={attendedEventModalOpen}
        onClose={() => setAttendedEventModalOpen(false)}
        applicant={applicant}
        onSuccess={handleAttendedEventSuccess}
        token={token}
      />
    </>
  );
};

export default ApplicantDetailModal;

