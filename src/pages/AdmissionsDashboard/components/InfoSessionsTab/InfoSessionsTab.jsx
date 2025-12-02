import React from 'react';
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

const InfoSessionsTab = ({
  loading,
  infoSessions,
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

  // Handle toggle event active
  const handleToggleEventActive = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${eventId}/toggle-active`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchInfoSessions();
      }
    } catch (error) {
      console.error('Error toggling event active:', error);
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
    setInfoSessionForm({
      title: session.event_name || '',
      description: session.description || '',
      start_time: session.event_date ? `${session.event_date.split('T')[0]}T${session.event_time?.substring(0, 5) || '00:00'}` : '',
      end_time: '',
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
      }
    } catch (error) {
      console.error('Error saving info session:', error);
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

  // Copy all emails
  const copyAllEmails = () => {
    const emails = eventRegistrations
      .filter(reg => reg.email)
      .map(reg => reg.email);
    
    if (emails.length > 0) {
      navigator.clipboard.writeText(emails.join(', '));
    }
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

  const sortedSessions = sortEventsByDate(infoSessions);

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
                    <TableRow className="hover:bg-gray-50">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={copyAllEmails}
                                className="font-proxima"
                              >
                                Copy All Emails
                              </Button>
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
                                        <Badge className={`${getStatusBadgeClasses(reg.status)} font-proxima`}>
                                          {formatStatus(reg.status)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          {['attended', 'no_show', 'cancelled'].map((status) => (
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
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
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
              <Label className="font-proxima-bold">Date & Time</Label>
              <Input
                type="datetime-local"
                value={infoSessionForm.start_time}
                onChange={(e) => setInfoSessionForm({ ...infoSessionForm, start_time: e.target.value })}
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
    </div>
  );
};

export default InfoSessionsTab;

