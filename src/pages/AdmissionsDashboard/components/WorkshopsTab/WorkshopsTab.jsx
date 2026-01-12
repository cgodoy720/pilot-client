import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Switch } from '../../../../components/ui/switch';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { formatEventTime, isEventPast, formatEventDate, sortEventsByDate, getStatusBadgeClasses, formatStatus } from '../shared/utils';
import ManualRegistrationModal from '../shared/ManualRegistrationModal';
import Swal from 'sweetalert2';

const WorkshopsTab = ({
  loading,
  workshops,
  setWorkshops: setParentWorkshops,
  showInactiveWorkshops,
  setShowInactiveWorkshops,
  selectedEvent,
  setSelectedEvent,
  eventRegistrations,
  setEventRegistrations,
  attendanceLoading,
  setAttendanceLoading,
  workshopModalOpen,
  setWorkshopModalOpen,
  editingWorkshop,
  setEditingWorkshop,
  workshopForm,
  setWorkshopForm,
  workshopSubmitting,
  setWorkshopSubmitting,
  availableCohorts,
  loadingCohorts,
  addRegistrationModalOpen,
  setAddRegistrationModalOpen,
  selectedEventForRegistration,
  setSelectedEventForRegistration,
  selectedEventType,
  setSelectedEventType,
  applicantSearch,
  setApplicantSearch,
  searchResults,
  setSearchResults,
  selectedApplicantsForRegistration,
  setSelectedApplicantsForRegistration,
  searchLoading,
  setSearchLoading,
  registrationLoading,
  setRegistrationLoading,
  laptopNeeds,
  setLaptopNeeds,
  fetchWorkshops,
  token
}) => {
  // State for manual registration modal
  const [manualRegModalOpen, setManualRegModalOpen] = useState(false);
  const [selectedEventForManualReg, setSelectedEventForManualReg] = useState(null);
  
  // Local state management for workshops
  const [localWorkshops, setLocalWorkshops] = useState(workshops);
  
  // Update local state when prop changes
  React.useEffect(() => {
    setLocalWorkshops(workshops);
  }, [workshops]);
  
  // Helper to update both local and parent state
  const setWorkshops = (updater) => {
    if (typeof updater === 'function') {
      setLocalWorkshops(prev => {
        const updated = updater(prev);
        // Also update parent state
        setParentWorkshops(updated);
        return updated;
      });
    } else {
      setLocalWorkshops(updater);
      // Also update parent state
      setParentWorkshops(updater);
    }
  };

  // Handle view registrations
  const handleViewRegistrations = async (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
      setEventRegistrations([]);
      return;
    }

    setAttendanceLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/registrations/workshop/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setEventRegistrations(data);
        setSelectedEvent(eventId);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Handle mark attendance
  const handleMarkAttendance = async (eventId, applicantId, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/registrations/workshop/${eventId}/attendance`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ applicant_id: applicantId, status })
        }
      );

      if (response.ok) {
        setEventRegistrations(prev =>
          prev.map(reg =>
            reg.applicant_id === applicantId
              ? { ...reg, status }
              : reg
          )
        );
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  // Handle remove registration
  const handleRemoveRegistration = async (eventId, registrationId, applicantName) => {
    const confirmed = await Swal.fire({
      title: 'Remove Registration?',
      text: `Are you sure you want to remove ${applicantName} from this workshop? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/events/workshop/${eventId}/registrations/${registrationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // Remove from local state
        setEventRegistrations(prev => prev.filter(reg => reg.registration_id !== registrationId));
        
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Registration has been removed successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to remove registration'
        });
      }
    } catch (error) {
      console.error('Error removing registration:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  // Handle toggle event active
  const handleToggleEventActive = async (eventId) => {
    // Find the current workshop to get its current state
    const currentWorkshop = localWorkshops.find(w => w.event_id === eventId);
    if (!currentWorkshop) return;

    const newActiveState = !currentWorkshop.is_active;

    // Store original state for rollback
    const originalWorkshops = [...localWorkshops];

    try {
      // Optimistically update local state immediately for instant feedback
      const updatedWorkshops = localWorkshops.map(workshop =>
        workshop.event_id === eventId
          ? { ...workshop, is_active: newActiveState }
          : workshop
      );

      // If we're deactivating and not showing inactive, wait a moment for animation
      if (!newActiveState && !showInactiveWorkshops) {
        // Update state immediately so switch animates
        setWorkshops(updatedWorkshops);
        
        // Wait for switch animation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Now filter it out
        setWorkshops(prev => prev.filter(w => w.event_id !== eventId || w.is_active));
      } else {
        // Just update the state immediately
        setWorkshops(updatedWorkshops);
      }

      // Make the API call
      console.log('Toggling workshop active status:', eventId, 'to', newActiveState);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops/${eventId}/toggle-active`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Toggle response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Toggle response data:', data);
        
        // Show brief success toast
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: data.message || 'Workshop status updated',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        // Revert on error
        console.error('Toggle failed with status:', response.status);
        setWorkshops(originalWorkshops);
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.error || 'Failed to update workshop status'
        });
      }
    } catch (error) {
      console.error('Error toggling event active:', error);
      // Revert on error
      setWorkshops(originalWorkshops);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingWorkshop(null);
    setWorkshopForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
      capacity: 50,
      is_online: false,
      meeting_link: '',
      cohort_name: 'December 2025 - Workshop',
      workshop_type: 'admissions',
      access_window_days: 0,
      allow_early_access: false
    });
    setWorkshopModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (workshop) => {
    setEditingWorkshop(workshop);
    
    // Format timestamps for datetime-local input (YYYY-MM-DDTHH:MM)
    // The start_time/end_time from backend are ISO strings like "2025-11-17T17:00:00.000Z"
    // We need to extract just the date and time portions (ignore timezone)
    const formatForInput = (timestamp) => {
      if (!timestamp) return '';
      // Extract YYYY-MM-DD and HH:MM from the ISO string
      const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
      return match ? `${match[1]}T${match[2]}` : '';
    };
    
    setWorkshopForm({
      title: workshop.event_name || workshop.title || '',
      description: workshop.description || '',
      start_time: formatForInput(workshop.start_time),
      end_time: formatForInput(workshop.end_time),
      location: workshop.location || 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
      capacity: workshop.capacity || 50,
      is_online: workshop.is_online || false,
      meeting_link: workshop.meeting_link || '',
      cohort_name: workshop.cohort_name || 'December 2025 - Workshop',
      workshop_type: workshop.workshop_type || 'admissions',
      access_window_days: workshop.access_window_days || 0,
      allow_early_access: workshop.allow_early_access || false
    });
    setWorkshopModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setWorkshopSubmitting(true);

    try {
      const url = editingWorkshop
        ? `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops/${editingWorkshop.event_id}`
        : `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops`;

      const response = await fetch(url, {
        method: editingWorkshop ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workshopForm)
      });

      if (response.ok) {
        setWorkshopModalOpen(false);
        fetchWorkshops();
      }
    } catch (error) {
      console.error('Error saving workshop:', error);
    } finally {
      setWorkshopSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (workshopId) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workshop/admin/workshops/${workshopId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchWorkshops();
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
    }
  };

  // Copy all emails
  const copyAllEmails = () => {
    const emails = eventRegistrations
      .filter(reg => reg.email)
      .map(reg => reg.email);
    
    if (emails.length > 0) {
      navigator.clipboard.writeText(emails.join(', '));
    }
  };

  // Handle open manual registration modal
  const handleOpenManualReg = (workshopId) => {
    setSelectedEventForManualReg(workshopId);
    setManualRegModalOpen(true);
  };

  // Handle manual registration success
  const handleManualRegSuccess = () => {
    // Refresh registrations for the current event
    if (selectedEvent) {
      handleViewRegistrations(selectedEvent);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-proxima">Loading workshops...</p>
        </div>
      </div>
    );
  }

  // Filter workshops based on showInactive toggle
  const filteredWorkshops = showInactiveWorkshops 
    ? localWorkshops 
    : localWorkshops.filter(workshop => workshop.is_active);

  const sortedWorkshops = sortEventsByDate(filteredWorkshops);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a1a1a] font-proxima-bold">
          Workshops Management
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-proxima">
            <Switch
              checked={showInactiveWorkshops}
              onCheckedChange={setShowInactiveWorkshops}
            />
            <span className="text-sm text-gray-600">Show Inactive</span>
          </label>
          <Button 
            onClick={openCreateModal}
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
          >
            Create New Workshop
          </Button>
          <Button variant="outline" onClick={fetchWorkshops} className="font-proxima">
            Refresh
          </Button>
        </div>
      </div>

      {/* Workshops Table */}
      {sortedWorkshops.length > 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-proxima-bold">Workshop Name</TableHead>
                  <TableHead className="font-proxima-bold">Date & Time</TableHead>
                  <TableHead className="font-proxima-bold">Type</TableHead>
                  <TableHead className="font-proxima-bold text-center">Registered</TableHead>
                  <TableHead className="font-proxima-bold text-center">Attended</TableHead>
                  <TableHead className="font-proxima-bold text-center">Active</TableHead>
                  <TableHead className="font-proxima-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWorkshops.map((workshop) => (
                  <React.Fragment key={workshop.event_id}>
                    <TableRow className="hover:bg-gray-50 transition-opacity duration-300">
                      <TableCell className="font-medium font-proxima">
                        <div className="flex items-center gap-2">
                          {workshop.event_name || workshop.title}
                          {isEventPast(workshop.event_date, workshop.event_time) && (
                            <Badge className="bg-gray-100 text-gray-600 font-proxima">Past</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-proxima">
                        <div>
                          <div className="font-medium">{formatEventDate(workshop.event_date)}</div>
                          <div className="text-sm text-gray-500">{formatEventTime(workshop.event_time)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-proxima ${
                          workshop.workshop_type === 'admissions' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {workshop.workshop_type === 'admissions' ? 'Admissions' : 'External'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-proxima-bold text-lg">
                        {workshop.registration_count || 0}
                      </TableCell>
                      <TableCell className="text-center font-proxima-bold text-lg text-green-600">
                        {workshop.attended_count || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={workshop.is_active}
                          onCheckedChange={() => handleToggleEventActive(workshop.event_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(workshop)}
                            className="font-proxima"
                          >
                            Edit
                          </Button>
                          <Button
                            variant={selectedEvent === workshop.event_id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleViewRegistrations(workshop.event_id)}
                            className={`font-proxima ${selectedEvent === workshop.event_id ? 'bg-[#4242ea]' : ''}`}
                          >
                            {selectedEvent === workshop.event_id ? 'Hide' : 'View'} Registrations
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Registrations Expanded Row */}
                    {selectedEvent === workshop.event_id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-[#1a1a1a] font-proxima-bold">
                                Registrations ({eventRegistrations.length})
                              </h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={copyAllEmails}
                                  className="font-proxima"
                                >
                                  Copy All Emails
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenManualReg(workshop.event_id)}
                                  className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
                                >
                                  + Add Registration
                                </Button>
                              </div>
                            </div>

                            {attendanceLoading ? (
                              <div className="text-center py-4 text-gray-500 font-proxima">
                                Loading registrations...
                              </div>
                            ) : eventRegistrations.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="font-proxima-bold">Name</TableHead>
                                    <TableHead className="font-proxima-bold">Email</TableHead>
                                    <TableHead className="font-proxima-bold">Laptop Needed</TableHead>
                                    <TableHead className="font-proxima-bold">Status</TableHead>
                                    <TableHead className="font-proxima-bold">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {eventRegistrations.map((reg) => (
                                    <TableRow key={reg.registration_id}>
                                      <TableCell className="font-proxima">
                                        {reg.first_name} {reg.last_name}
                                      </TableCell>
                                      <TableCell className="font-proxima text-gray-600">
                                        {reg.email}
                                      </TableCell>
                                      <TableCell>
                                        {reg.needs_laptop ? (
                                          <Badge className="bg-yellow-100 text-yellow-700 font-proxima">Yes</Badge>
                                        ) : (
                                          <span className="text-gray-400 font-proxima">No</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={`${getStatusBadgeClasses(reg.status)} font-proxima`}>
                                          {formatStatus(reg.status)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          {['attended', 'no_show'].map((status) => (
                                            <Button
                                              key={status}
                                              variant={reg.status === status ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => handleMarkAttendance(workshop.event_id, reg.applicant_id, status)}
                                              className={`text-xs font-proxima ${reg.status === status ? 'bg-[#4242ea]' : ''}`}
                                            >
                                              {formatStatus(status)}
                                            </Button>
                                          ))}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveRegistration(workshop.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
                                            className="text-xs font-proxima text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-4 text-gray-500 font-proxima">
                                No registrations for this workshop
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 font-proxima">No workshops found</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={workshopModalOpen} onOpenChange={setWorkshopModalOpen}>
        <DialogContent className="max-w-md font-proxima">
          <DialogHeader>
            <DialogTitle className="font-proxima-bold">
              {editingWorkshop ? 'Edit Workshop' : 'Create Workshop'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-proxima-bold">Title</Label>
              <Input
                value={workshopForm.title}
                onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                required
                className="font-proxima"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-proxima-bold">Start Time</Label>
                <Input
                  type="datetime-local"
                  value={workshopForm.start_time}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, start_time: e.target.value })}
                  required
                  className="font-proxima [&::-webkit-calendar-picker-indicator]:ml-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-proxima-bold">End Time</Label>
                <Input
                  type="datetime-local"
                  value={workshopForm.end_time}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, end_time: e.target.value })}
                  required
                  className="font-proxima [&::-webkit-calendar-picker-indicator]:ml-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">Location</Label>
              <Input
                value={workshopForm.location}
                onChange={(e) => setWorkshopForm({ ...workshopForm, location: e.target.value })}
                className="font-proxima"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-proxima-bold">Capacity</Label>
                <Input
                  type="number"
                  value={workshopForm.capacity}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, capacity: parseInt(e.target.value) })}
                  className="font-proxima"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-proxima-bold">Workshop Type</Label>
                <Select
                  value={workshopForm.workshop_type}
                  onValueChange={(value) => setWorkshopForm({ ...workshopForm, workshop_type: value })}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-proxima">
                    <SelectItem value="admissions">Admissions</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">Cohort</Label>
              <Select
                value={workshopForm.cohort_name}
                onValueChange={(value) => setWorkshopForm({ ...workshopForm, cohort_name: value })}
              >
                <SelectTrigger className="font-proxima">
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent className="font-proxima">
                  {availableCohorts.map((cohort) => (
                    <SelectItem key={cohort} value={cohort}>{cohort}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={workshopForm.is_online}
                onCheckedChange={(checked) => setWorkshopForm({ ...workshopForm, is_online: checked })}
              />
              <Label className="font-proxima">Online Event</Label>
            </div>
            {workshopForm.is_online && (
              <div className="space-y-2">
                <Label className="font-proxima-bold">Meeting Link</Label>
                <Input
                  value={workshopForm.meeting_link}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, meeting_link: e.target.value })}
                  className="font-proxima"
                />
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWorkshopModalOpen(false)}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={workshopSubmitting}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                {workshopSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Registration Modal */}
      <ManualRegistrationModal
        isOpen={manualRegModalOpen}
        onClose={() => setManualRegModalOpen(false)}
        eventId={selectedEventForManualReg}
        eventType="workshop"
        onRegistrationSuccess={handleManualRegSuccess}
        token={token}
      />
    </div>
  );
};

export default WorkshopsTab;

