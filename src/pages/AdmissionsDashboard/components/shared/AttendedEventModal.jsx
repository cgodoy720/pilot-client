import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import Swal from 'sweetalert2';

const AttendedEventModal = ({
  isOpen,
  onClose,
  applicant,
  onSuccess,
  token
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicant.applicant_id}/attended-event`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: notes.trim() || null })
        }
      );

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Applicant marked as attended external event',
          timer: 2000,
          showConfirmButton: false
        });

        setNotes('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.error || 'Failed to mark attendance'
        });
      }
    } catch (error) {
      console.error('Error marking attended event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    const confirmed = await Swal.fire({
      title: 'Remove Attended Event Status?',
      text: 'This will remove the external event attendance from this applicant\'s record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed.isConfirmed) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicant.applicant_id}/attended-event`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Attended event status has been removed',
          timer: 2000,
          showConfirmButton: false
        });

        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.error || 'Failed to remove status'
        });
      }
    } catch (error) {
      console.error('Error removing attended event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !applicant) return null;

  const isAttendedEvent = applicant.info_session_status === 'attended_event';
  const isAttendedInfoSession = ['attended', 'attended_late', 'very_late'].includes(applicant.info_session_status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md font-proxima">
        <DialogHeader>
          <DialogTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
            {isAttendedEvent ? 'External Event Attendance' : 'Mark as Attended External Event'}
          </DialogTitle>
        </DialogHeader>

        {isAttendedInfoSession ? (
          <div className="py-4">
            <p className="text-gray-700 font-proxima">
              This applicant has already attended an info session. They cannot be marked as attended external event.
            </p>
          </div>
        ) : isAttendedEvent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-proxima">
                ✓ This applicant has been marked as attended external event
              </p>
            </div>
            <div>
              <Label className="font-proxima-bold">Notes</Label>
              <p className="text-gray-700 font-proxima mt-1">
                {applicant.info_session_notes || 'No notes recorded'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-proxima-bold">
                Applicant
              </Label>
              <p className="font-proxima text-gray-700">
                {applicant.first_name} {applicant.last_name}
              </p>
              <p className="text-sm text-gray-500 font-proxima">
                {applicant.email}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="font-proxima-bold">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Attended Brooklyn Career Fair on 1/10/26"
                rows={3}
                className="font-proxima"
              />
              <p className="text-xs text-gray-500 font-proxima">
                Record which external event they attended for reference
              </p>
            </div>
          </form>
        )}

        <DialogFooter className="mt-6">
          {isAttendedEvent ? (
            <>
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={submitting}
                className="font-proxima text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {submitting ? 'Removing...' : 'Remove Status'}
              </Button>
              <Button variant="outline" onClick={onClose} className="font-proxima">
                Close
              </Button>
            </>
          ) : isAttendedInfoSession ? (
            <Button variant="outline" onClick={onClose} className="font-proxima">
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                {submitting ? 'Saving...' : 'Mark as Attended Event'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendedEventModal;

