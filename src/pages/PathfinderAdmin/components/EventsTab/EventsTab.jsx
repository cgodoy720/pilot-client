import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import Swal from 'sweetalert2';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

const API_URL = import.meta.env.VITE_API_URL;

const EventsTab = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'event_date', direction: 'asc' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/pathfinder/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Failed to load events',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get location type label
  const getLocationLabel = (locationType) => {
    const labels = {
      'virtual': 'Virtual',
      'in_person': 'In-Person',
      'hybrid': 'Hybrid'
    };
    return labels[locationType] || locationType || '-';
  };

  // Get location badge color
  const getLocationColor = (locationType) => {
    const colors = {
      'virtual': 'bg-blue-100 text-blue-700',
      'in_person': 'bg-green-100 text-green-700',
      'hybrid': 'bg-purple-100 text-purple-700'
    };
    return colors[locationType] || 'bg-gray-100 text-gray-700';
  };

  // Check if event is in the past
  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date(new Date().toDateString());
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter past events
    if (!showPastEvents) {
      filtered = filtered.filter(event => !isPastEvent(event.event_date));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle dates
      if (sortConfig.key === 'event_date') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      // Handle numbers
      if (sortConfig.key === 'registration_count') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      // Handle strings
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [events, showPastEvents, sortConfig]);

  // Handle edit - open dialog with pre-filled form
  const handleEdit = (event) => {
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      eventDate: event.event_date ? event.event_date.split('T')[0] : '',
      eventTime: event.event_time || '',
      locationType: event.location_type || 'virtual',
      venueName: event.venue_name || '',
      eventType: event.event_type || '',
      price: event.price ?? 0,
      externalUrl: event.external_url || '',
      isFeatured: event.is_featured || false
    });
    setEditingEvent(event);
  };

  // Handle edit form field change
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Title is required',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/pathfinder/events/admin/events/${editingEvent.event_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update event');
      }

      const updatedEvent = await response.json();

      setEvents(prev => prev.map(e =>
        e.event_id === editingEvent.event_id ? { ...e, ...updatedEvent } : e
      ));
      setEditingEvent(null);

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Event updated',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating event:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Failed to update event',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (event) => {
    const result = await Swal.fire({
      title: 'Delete Event',
      text: `Are you sure you want to delete "${event.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/pathfinder/events/admin/events/${event.event_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete event');
      }

      setEvents(prev => prev.filter(e => e.event_id !== event.event_id));

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Event deleted',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Failed to delete event',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  // Sortable header component
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 font-proxima">Loading Events...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showPastEvents"
            checked={showPastEvents}
            onCheckedChange={setShowPastEvents}
          />
          <label
            htmlFor="showPastEvents"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Show past events
          </label>
        </div>
        <div className="text-sm text-gray-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No events found</p>
              {!showPastEvents && events.length > 0 && (
                <p className="text-sm mt-2">Try enabling "Show past events" to see more</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader sortKey="title">Title</SortableHeader>
                  <SortableHeader sortKey="event_date">Date</SortableHeader>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <SortableHeader sortKey="registration_count">RSVPs</SortableHeader>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.event_id} className="hover:bg-gray-50">
                    {/* Title */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {event.title}
                        {event.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <StarIcon sx={{ fontSize: 12 }} className="mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell>{formatDate(event.event_date)}</TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {event.event_type || '-'}
                      </Badge>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <Badge className={getLocationColor(event.location_type)}>
                        {getLocationLabel(event.location_type)}
                      </Badge>
                    </TableCell>

                    {/* RSVPs */}
                    <TableCell>{event.registration_count || 0}</TableCell>

                    {/* Status */}
                    <TableCell>
                      {isPastEvent(event.event_date) ? (
                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                          Past
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">
                          Upcoming
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-[#4242ea]"
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a1a]">
              Edit Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="font-semibold">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={editForm.title || ''}
                onChange={(e) => handleEditChange('title', e.target.value)}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="font-semibold">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.eventDate || ''}
                  onChange={(e) => handleEditChange('eventDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time" className="font-semibold">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editForm.eventTime || ''}
                  onChange={(e) => handleEditChange('eventTime', e.target.value)}
                />
              </div>
            </div>

            {/* Event Type and Location Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Event Type</Label>
                <Select
                  value={editForm.eventType || ''}
                  onValueChange={(value) => handleEditChange('eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="career_fair">Career Fair</SelectItem>
                    <SelectItem value="tech_talk">Tech Talk</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Location Type</Label>
                <Select
                  value={editForm.locationType || 'virtual'}
                  onValueChange={(value) => handleEditChange('locationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Venue Name (for in-person/hybrid) */}
            {(editForm.locationType === 'in_person' || editForm.locationType === 'hybrid') && (
              <div className="space-y-2">
                <Label htmlFor="edit-venue" className="font-semibold">Venue Name</Label>
                <Input
                  id="edit-venue"
                  value={editForm.venueName || ''}
                  onChange={(e) => handleEditChange('venueName', e.target.value)}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="font-semibold">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description || ''}
                onChange={(e) => handleEditChange('description', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Price and Featured */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="font-semibold">Price (0 for free)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.price ?? 0}
                  onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Featured</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="edit-featured"
                    checked={editForm.isFeatured || false}
                    onCheckedChange={(checked) => handleEditChange('isFeatured', checked)}
                  />
                  <label htmlFor="edit-featured" className="text-sm cursor-pointer">
                    Mark as featured event
                  </label>
                </div>
              </div>
            </div>

            {/* External URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="font-semibold">Event Link</Label>
              <Input
                id="edit-url"
                type="url"
                value={editForm.externalUrl || ''}
                onChange={(e) => handleEditChange('externalUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingEvent(null)}
              disabled={isSaving}
              className="text-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !editForm.title?.trim()}
              className="bg-[#4242ea] hover:bg-[#3535c9] text-white"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTab;
