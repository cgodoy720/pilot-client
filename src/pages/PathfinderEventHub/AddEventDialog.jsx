import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import Swal from 'sweetalert2';

// Icons
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Convert 12-hour time format to 24-hour format for HTML time input
 * @param {string} timeStr - Time in various formats (e.g., "6:00 PM", "18:00")
 * @returns {string} - Time in 24-hour format (HH:mm) or empty string
 */
function convertTo24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return '';
  }

  const trimmed = timeStr.trim();
  
  // If already in 24-hour format (HH:mm), return as-is
  if (/^\d{1,2}:\d{2}$/.test(trimmed) && !trimmed.includes('AM') && !trimmed.includes('PM')) {
    const [hours, minutes] = trimmed.split(':');
    const h = parseInt(hours, 10);
    // Validate it's actually 24-hour format (0-23 hours)
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  // Parse 12-hour format with AM/PM
  const match = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return ''; // Invalid format
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'AM') {
    if (hours === 12) {
      hours = 0; // 12:00 AM → 00:00
    }
  } else { // PM
    if (hours !== 12) {
      hours += 12; // 1:00 PM → 13:00, but 12:00 PM stays 12:00
    }
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function AddEventDialog({ isOpen, onClose, onEventAdded }) {
  const { token } = useAuth();
  const [mode, setMode] = useState('url'); // 'url' or 'manual'
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // URL import state
  const [eventUrl, setEventUrl] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    locationType: 'virtual',
    venueName: '',
    address: '',
    city: '',
    state: '',
    virtualLink: '',
    price: 0,
    externalUrl: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Warning flags
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      locationType: 'virtual',
      venueName: '',
      address: '',
      city: '',
      state: '',
      virtualLink: '',
      price: 0,
      externalUrl: ''
    });
    setEventUrl('');
    setErrors({});
    setShowTimeWarning(false);
    setMode('url');
  };

  // Handle dialog close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Clear time warning when user manually enters a time
    if (field === 'eventTime' && value) {
      setShowTimeWarning(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle URL import
  const handleImportFromUrl = async () => {
    if (!eventUrl.trim()) {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Please enter a URL',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/pathfinder/events/parse-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: eventUrl })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse event URL');
      }

      // Auto-fill form with scraped data
      const scrapedData = data.data;
      
      // Debug logging to see what scraper returns
      console.log('Full scraped data:', scrapedData);
      console.log('eventTime value:', scrapedData.eventTime, '| Type:', typeof scrapedData.eventTime, '| Length:', scrapedData.eventTime?.length);
      
      // Convert time to 24-hour format for HTML time input
      const convertedTime = convertTo24Hour(scrapedData.eventTime);
      console.log('Converted time (24-hour):', convertedTime);
      
      setFormData({
        title: scrapedData.title || '',
        description: scrapedData.description || '',
        eventDate: scrapedData.eventDate || '',
        eventTime: convertedTime || '',
        locationType: scrapedData.locationType || 'virtual',
        venueName: scrapedData.venueName || '',
        address: scrapedData.address || '',
        city: scrapedData.city || '',
        state: scrapedData.state || '',
        virtualLink: scrapedData.virtualLink || '',
        price: scrapedData.price || 0,
        externalUrl: scrapedData.externalUrl || eventUrl
      });

      // Check if event time is missing after scraping and conversion
      if (!convertedTime || convertedTime.trim() === '') {
        setShowTimeWarning(true);
      } else {
        setShowTimeWarning(false);
      }

      // Switch to manual mode for review/editing
      setMode('manual');

      Swal.fire({
        toast: true,
        icon: 'success',
        title: `Event imported from ${data.platform}!`,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error importing event:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Failed to import event',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/pathfinder/events/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add event');
      }

      const newEvent = await response.json();

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Event added successfully!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      resetForm();
      onEventAdded(newEvent);

    } catch (error) {
      console.error('Error adding event:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Failed to add event',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
            Add Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL Import Mode */}
          {mode === 'url' && (
            <div className="space-y-4">
              <div className="bg-[rgba(66,66,234,0.05)] p-4 rounded-lg border border-[#4242ea]/20">
                <div className="flex items-center gap-2 mb-2">
                  <AutoAwesomeIcon className="text-[#4242ea]" />
                  <span className="font-semibold text-[#1a1a1a]">Quick Import</span>
                </div>
                <p className="text-sm text-[#666666] mb-4">
                  Paste an event URL from Eventbrite, Luma, Meetup, or LinkedIn to auto-fill details
                </p>
                
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="https://www.eventbrite.com/e/..."
                    value={eventUrl}
                    onChange={(e) => setEventUrl(e.target.value)}
                    disabled={isLoading}
                    className="bg-white"
                  />
                  
                  <Button
                    onClick={handleImportFromUrl}
                    disabled={isLoading || !eventUrl.trim()}
                    className="w-full bg-[#4242ea] hover:bg-[#3535c9] text-white"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Importing Event...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2" fontSize="small" />
                        Import Event
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e0e0e0]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#666666]">or</span>
                </div>
              </div>

              {/* Switch to Manual */}
              <Button
                onClick={() => setMode('manual')}
                variant="outline"
                className="w-full border-[#4242ea] text-[#4242ea] hover:bg-[rgba(66,66,234,0.05)]"
              >
                <EditIcon className="mr-2" fontSize="small" />
                Enter Details Manually
              </Button>
            </div>
          )}

          {/* Manual Entry Mode */}
          {mode === 'manual' && (
            <div className="space-y-4">
              {/* Switch back to URL import */}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setMode('url');
                    resetForm();
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-[#4242ea] hover:bg-[rgba(66,66,234,0.05)]"
                >
                  <LinkIcon className="mr-2" fontSize="small" />
                  Switch to URL Import
                </Button>
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#1a1a1a] font-semibold">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Tech Networking Happy Hour"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-[#1a1a1a] font-semibold">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className={errors.eventDate ? 'border-red-500' : ''}
                  />
                  {errors.eventDate && (
                    <p className="text-sm text-red-500">{errors.eventDate}</p>
                  )}
                  <p className="text-sm text-[#666666]">
                    Please verify the date and time are correct
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime" className="text-[#1a1a1a] font-semibold">
                    Time
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  />
                  {showTimeWarning && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                      <p className="text-sm text-yellow-800">
                        Event time wasn't detected. Please add it manually if you know it.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Type */}
              <div className="space-y-2">
                <Label htmlFor="locationType" className="text-[#1a1a1a] font-semibold">
                  Location Type
                </Label>
                <Select
                  value={formData.locationType}
                  onValueChange={(value) => handleInputChange('locationType', value)}
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

              {/* Virtual Link (for virtual or hybrid) */}
              {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
                <div className="space-y-2">
                  <Label htmlFor="virtualLink" className="text-[#1a1a1a] font-semibold">
                    Virtual Link
                  </Label>
                  <Input
                    id="virtualLink"
                    type="url"
                    value={formData.virtualLink}
                    onChange={(e) => handleInputChange('virtualLink', e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}

              {/* Venue Details (for in_person or hybrid) */}
              {(formData.locationType === 'in_person' || formData.locationType === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="venueName" className="text-[#1a1a1a] font-semibold">
                      Venue Name
                    </Label>
                    <Input
                      id="venueName"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange('venueName', e.target.value)}
                      placeholder="e.g., Tech Hub NYC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#1a1a1a] font-semibold">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="e.g., 123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-[#1a1a1a] font-semibold">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g., New York"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-[#1a1a1a] font-semibold">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="e.g., NY"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#1a1a1a] font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about the event..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* External URL */}
              <div className="space-y-2">
                <Label htmlFor="externalUrl" className="text-[#1a1a1a] font-semibold">
                  Event Link (optional)
                </Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[#1a1a1a] font-semibold">
                  Price (0 for free)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSubmitting}
            className="text-[#666666]"
          >
            Cancel
          </Button>
          
          {mode === 'manual' && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || !formData.eventDate}
              className="bg-[#4242ea] hover:bg-[#3535c9] text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Event'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddEventDialog;
