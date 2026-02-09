import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Switch } from '../../../../components/ui/switch';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
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

const InfoSessionsTab = ({
  loading,
  infoSessions,
  setInfoSessions: setParentInfoSessions,
  showInactiveInfoSessions,
  setShowInactiveInfoSessions,
  selectedEvent,
  setSelectedEvent,
  eventRegistrations,
  setEventRegistrations,
  attendanceLoading,
  setAttendanceLoading,
  infoSessionModalOpen,
  setInfoSessionModalOpen,
  editingInfoSession,
  setEditingInfoSession,
  infoSessionForm,
  setInfoSessionForm,
  infoSessionSubmitting,
  setInfoSessionSubmitting,
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
  fetchInfoSessions,
  token
}) => {
  // State for manual registration modal
  const [manualRegModalOpen, setManualRegModalOpen] = useState(false);
  const [selectedEventForManualReg, setSelectedEventForManualReg] = useState(null);
  
  // State for registration search and sort
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationSort, setRegistrationSort] = useState({ column: 'name', direction: 'asc' });
  
  // Local state management for info sessions
  const [localInfoSessions, setLocalInfoSessions] = useState(infoSessions);
  
  // Update local state when prop changes
  React.useEffect(() => {
    setLocalInfoSessions(infoSessions);
  }, [infoSessions]);
  
  // Helper to update both local and parent state
  const setInfoSessions = (updater) => {
    if (typeof updater === 'function') {
      setLocalInfoSessions(prev => {
        const updated = updater(prev);
        // Also update parent state
        setParentInfoSessions(updated);
        return updated;
      });
    } else {
      setLocalInfoSessions(updater);
      // Also update parent state
      setParentInfoSessions(updater);
    }
  };

  // Handle view registrations
  const handleViewRegistrations = async (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
      setEventRegistrations([]);
      setRegistrationSearch(''); // Clear search when closing
      return;
    }
    
    // Clear search when opening a different session
    setRegistrationSearch('');

    setAttendanceLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/registrations/info-session/${eventId}`,
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
        `${import.meta.env.VITE_API_URL}/api/admissions/registrations/info-session/${eventId}/attendance`,
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
      text: `Are you sure you want to remove ${applicantName} from this info session? This action cannot be undone.`,
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
        `${import.meta.env.VITE_API_URL}/api/admissions/events/info-session/${eventId}/registrations/${registrationId}`,
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
    // Find the current session to get its current state
    const currentSession = localInfoSessions.find(s => s.event_id === eventId);
    if (!currentSession) return;

    const newActiveState = !currentSession.is_active;

    // Store original state for rollback
    const originalSessions = [...localInfoSessions];

    try {
      // Optimistically update local state immediately for instant feedback
      const updatedSessions = localInfoSessions.map(session =>
        session.event_id === eventId
          ? { ...session, is_active: newActiveState }
          : session
      );

      // If we're deactivating and not showing inactive, wait a moment for animation
      if (!newActiveState && !showInactiveInfoSessions) {
        // Update state immediately so switch animates
        setInfoSessions(updatedSessions);
        
        // Wait for switch animation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Now filter it out
        setInfoSessions(prev => prev.filter(s => s.event_id !== eventId || s.is_active));
      } else {
        // Just update the state immediately
        setInfoSessions(updatedSessions);
      }

      // Make the API call
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/events/${eventId}/toggle-active`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Show brief success toast
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: data.message || 'Info session status updated',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        // Revert on error
        setInfoSessions(originalSessions);
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.error || 'Failed to update info session status'
        });
      }
    } catch (error) {
      console.error('Error toggling event active:', error);
      // Revert on error
      setInfoSessions(originalSessions);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingInfoSession(null);
    setInfoSessionForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      capacity: 50,
      is_online: false,
      meeting_link: ''
    });
    setInfoSessionModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (session) => {
    setEditingInfoSession(session);
    
    // Extract date part (handles both "2025-11-03" and "2025-11-03T00:00:00" formats)
    const datePart = session.event_date 
      ? (session.event_date.includes('T') ? session.event_date.split('T')[0] : session.event_date)
      : '';
    
    // Extract time part from event_time (e.g., "17:00:00" -> "17:00")
    const startTimePart = session.event_time ? session.event_time.substring(0, 5) : '';
    
    // For end_time, extract from the timestamp (e.g., "2025-11-03T18:00:00" -> "18:00")
    let endTimePart = '';
    if (session.end_time) {
      const endTimeStr = String(session.end_time);
      if (endTimeStr.includes('T')) {
        // Format: "2025-11-03T18:00:00" - extract the time part
        endTimePart = endTimeStr.split('T')[1]?.substring(0, 5) || '';
      } else if (endTimeStr.includes(':')) {
        // Format: "18:00:00" - already just time
        endTimePart = endTimeStr.substring(0, 5);
      }
    }
    
    // Construct datetime-local values (format: "2025-11-03T17:00")
    const startTimeValue = datePart && startTimePart ? `${datePart}T${startTimePart}` : '';
    const endTimeValue = datePart && endTimePart ? `${datePart}T${endTimePart}` : '';
    
    setInfoSessionForm({
      title: session.event_name || '',
      description: session.description || '',
      start_time: startTimeValue,
      end_time: endTimeValue,
      location: session.location || '',
      capacity: session.capacity || 50,
      is_online: session.is_online || false,
      meeting_link: session.meeting_link || ''
    });
    setInfoSessionModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfoSessionSubmitting(true);

    try {
      const url = editingInfoSession
        ? `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${editingInfoSession.event_id}`
        : `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`;

      const response = await fetch(url, {
        method: editingInfoSession ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(infoSessionForm)
      });

      if (response.ok) {
        setInfoSessionModalOpen(false);
        fetchInfoSessions();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: editingInfoSession ? 'Info session updated successfully' : 'Info session created successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to save info session';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
      }
    } catch (error) {
      console.error('Error saving info session:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while saving the info session'
      });
    } finally {
      setInfoSessionSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this info session?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchInfoSessions();
      }
    } catch (error) {
      console.error('Error deleting info session:', error);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      // US format: (555) 123-4567
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      // US format with country code: +1 (555) 123-4567
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if not a standard format
    return phone;
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

  // Copy all phone numbers
  const copyAllPhones = () => {
    const phones = eventRegistrations
      .filter(reg => reg.phone_number)
      .map(reg => reg.phone_number);
    
    if (phones.length > 0) {
      navigator.clipboard.writeText(phones.join(', '));
    }
  };

  // Handle open manual registration modal
  const handleOpenManualReg = (sessionId) => {
    setSelectedEventForManualReg(sessionId);
    setManualRegModalOpen(true);
  };

  // Handle manual registration success
  const handleManualRegSuccess = () => {
    // Refresh registrations for the current event
    if (selectedEvent) {
      handleViewRegistrations(selectedEvent);
    }
  };

  // Filter and sort registrations
  const filteredAndSortedRegistrations = React.useMemo(() => {
    let filtered = [...eventRegistrations];
    
    // Apply search filter
    if (registrationSearch.trim()) {
      const searchLower = registrationSearch.toLowerCase().trim();
      filtered = filtered.filter(reg => {
        const fullName = `${reg.first_name || ''} ${reg.last_name || ''}`.toLowerCase();
        const email = (reg.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (registrationSort.column === 'name') {
        aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
      } else if (registrationSort.column === 'email') {
        aVal = (a.email || '').toLowerCase();
        bVal = (b.email || '').toLowerCase();
      } else if (registrationSort.column === 'status') {
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
      } else {
        aVal = a[registrationSort.column] || '';
        bVal = b[registrationSort.column] || '';
      }
      
      if (aVal < bVal) return registrationSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return registrationSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [eventRegistrations, registrationSearch, registrationSort]);

  // Handle registration sort
  const handleRegistrationSort = (column) => {
    setRegistrationSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Render sort indicator for registrations
  const renderRegSortIndicator = (column) => {
    if (registrationSort.column !== column) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return <span className="text-[#4242ea] ml-1">{registrationSort.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-proxima">Loading info sessions...</p>
        </div>
      </div>
    );
  }

  // Filter sessions based on showInactive toggle
  const filteredSessions = showInactiveInfoSessions 
    ? localInfoSessions 
    : localInfoSessions.filter(session => session.is_active);

  const sortedSessions = sortEventsByDate(filteredSessions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a1a1a] font-proxima-bold">
          Info Sessions Management
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-proxima">
            <Switch
              checked={showInactiveInfoSessions}
              onCheckedChange={setShowInactiveInfoSessions}
            />
            <span className="text-sm text-gray-600">Show Inactive</span>
          </label>
          <Button 
            onClick={openCreateModal}
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
          >
            Create New Session
          </Button>
          <Button variant="outline" onClick={fetchInfoSessions} className="font-proxima">
            Refresh
          </Button>
        </div>
      </div>

      {/* Sessions Table */}
      {sortedSessions.length > 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-proxima-bold">Event Name</TableHead>
                  <TableHead className="font-proxima-bold">Date & Time</TableHead>
                  <TableHead className="font-proxima-bold text-center">Registered</TableHead>
                  <TableHead className="font-proxima-bold text-center">Attended</TableHead>
                  <TableHead className="font-proxima-bold text-center">Active</TableHead>
                  <TableHead className="font-proxima-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSessions.map((session) => (
                  <React.Fragment key={session.event_id}>
                    <TableRow className="hover:bg-gray-50 transition-opacity duration-300">
                      <TableCell className="font-medium font-proxima">
                        <div className="flex items-center gap-2">
                          {session.event_name}
                          {isEventPast(session.event_date, session.event_time) && (
                            <Badge className="bg-gray-100 text-gray-600 font-proxima">Past</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-proxima">
                        <div>
                          <div className="font-medium">{formatEventDate(session.event_date)}</div>
                          <div className="text-sm text-gray-500">{formatEventTime(session.event_time)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-proxima-bold text-lg">
                        {session.registration_count || 0}
                      </TableCell>
                      <TableCell className="text-center font-proxima-bold text-lg text-green-600">
                        {session.attended_count || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={session.is_active}
                          onCheckedChange={() => handleToggleEventActive(session.event_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(session)}
                            className="font-proxima"
                          >
                            Edit
                          </Button>
                          <Button
                            variant={selectedEvent === session.event_id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleViewRegistrations(session.event_id)}
                            className={`font-proxima ${selectedEvent === session.event_id ? 'bg-[#4242ea]' : ''}`}
                          >
                            {selectedEvent === session.event_id ? 'Hide' : 'View'} Registrations
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Registrations Expanded Row */}
                    {selectedEvent === session.event_id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-[#1a1a1a] font-proxima-bold">
                                Registrations ({eventRegistrations.length})
                              </h4>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Search registrations..."
                                  value={registrationSearch}
                                  onChange={(e) => setRegistrationSearch(e.target.value)}
                                  className="w-[200px] h-8 text-sm font-proxima"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={copyAllEmails}
                                  className="font-proxima"
                                >
                                  Copy All Emails
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={copyAllPhones}
                                  className="font-proxima"
                                >
                                  Copy All Phone Numbers
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenManualReg(session.event_id)}
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
                            ) : filteredAndSortedRegistrations.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead 
                                      className="font-proxima-bold cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleRegistrationSort('name')}
                                    >
                                      <div className="flex items-center">
                                        Name {renderRegSortIndicator('name')}
                                      </div>
                                    </TableHead>
                                    <TableHead 
                                      className="font-proxima-bold cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleRegistrationSort('email')}
                                    >
                                      <div className="flex items-center">
                                        Email {renderRegSortIndicator('email')}
                                      </div>
                                    </TableHead>
                                    <TableHead className="font-proxima-bold">Phone</TableHead>
                                    <TableHead 
                                      className="font-proxima-bold cursor-pointer hover:bg-gray-100"
                                      onClick={() => handleRegistrationSort('status')}
                                    >
                                      <div className="flex items-center">
                                        Status {renderRegSortIndicator('status')}
                                      </div>
                                    </TableHead>
                                    <TableHead className="font-proxima-bold">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredAndSortedRegistrations.map((reg) => (
                                    <TableRow key={reg.registration_id}>
                                      <TableCell className="font-proxima">
                                        {reg.first_name} {reg.last_name}
                                      </TableCell>
                                      <TableCell className="font-proxima text-gray-600">
                                        {reg.email}
                                      </TableCell>
                                      <TableCell className="font-proxima text-gray-600">
                                        {formatPhoneNumber(reg.phone_number)}
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
                                              onClick={() => handleMarkAttendance(session.event_id, reg.applicant_id, status)}
                                              className={`text-xs font-proxima ${reg.status === status ? 'bg-[#4242ea]' : ''}`}
                                            >
                                              {formatStatus(status)}
                                            </Button>
                                          ))}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveRegistration(session.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
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
                            ) : registrationSearch.trim() && eventRegistrations.length > 0 ? (
                              <div className="text-center py-4 text-gray-500 font-proxima">
                                No registrations match your search
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500 font-proxima">
                                No registrations for this session
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
            <p className="text-gray-500 font-proxima">No info sessions found</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={infoSessionModalOpen} onOpenChange={setInfoSessionModalOpen}>
        <DialogContent className="max-w-md font-proxima">
          <DialogHeader>
            <DialogTitle className="font-proxima-bold">
              {editingInfoSession ? 'Edit Info Session' : 'Create Info Session'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-proxima-bold">Title</Label>
              <Input
                value={infoSessionForm.title}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, title: e.target.value })}
                required
                className="font-proxima"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">Start Time</Label>
              <Input
                type="datetime-local"
                value={infoSessionForm.start_time}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, start_time: e.target.value })}
                required
                className="font-proxima"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">End Time</Label>
              <Input
                type="datetime-local"
                value={infoSessionForm.end_time}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, end_time: e.target.value })}
                required
                className="font-proxima"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">Location</Label>
              <Input
                value={infoSessionForm.location}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, location: e.target.value })}
                className="font-proxima"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-proxima-bold">Capacity</Label>
              <Input
                type="number"
                value={infoSessionForm.capacity}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, capacity: parseInt(e.target.value) })}
                className="font-proxima"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={infoSessionForm.is_online}
                onCheckedChange={(checked) => setInfoSessionForm({ ...infoSessionForm, is_online: checked })}
              />
              <Label className="font-proxima">Online Event</Label>
            </div>
            {infoSessionForm.is_online && (
              <div className="space-y-2">
                <Label className="font-proxima-bold">Meeting Link</Label>
                <Input
                  value={infoSessionForm.meeting_link}
                  onChange={(e) => setInfoSessionForm({ ...infoSessionForm, meeting_link: e.target.value })}
                  className="font-proxima"
                />
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInfoSessionModalOpen(false)}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={infoSessionSubmitting}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                {infoSessionSubmitting ? 'Saving...' : 'Save'}
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
        eventType="info-session"
        onRegistrationSuccess={handleManualRegSuccess}
        token={token}
      />
    </div>
  );
};

export default InfoSessionsTab;

