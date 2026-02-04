import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Checkbox } from '../../../../components/ui/checkbox';
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

  // Handle edit (placeholder)
  const handleEdit = (event) => {
    Swal.fire({
      toast: true,
      icon: 'info',
      title: 'Edit functionality coming soon',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };

  // Handle delete (placeholder)
  const handleDelete = (event) => {
    Swal.fire({
      toast: true,
      icon: 'info',
      title: 'Delete functionality coming soon',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
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
    </div>
  );
};

export default EventsTab;
