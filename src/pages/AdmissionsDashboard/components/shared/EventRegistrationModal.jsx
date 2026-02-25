import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';

const EventRegistrationModal = ({
  isOpen,
  onClose,
  eventId,
  eventType,
  eventName,
  token,
  onRegistrationComplete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [laptopNeeds, setLaptopNeeds] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedApplicants([]);
      setLaptopNeeds({});
    }
  }, [isOpen]);

  // Search for applicants
  useEffect(() => {
    if (!searchQuery.trim() || !isOpen) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admissions/applicants/search?q=${encodeURIComponent(searchQuery)}&event_id=${eventId}&event_type=${eventType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error searching applicants:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, eventId, eventType, token, isOpen]);

  // Toggle applicant selection
  const toggleApplicant = (applicant) => {
    const isSelected = selectedApplicants.some(a => a.applicant_id === applicant.applicant_id);
    
    if (isSelected) {
      setSelectedApplicants(selectedApplicants.filter(a => a.applicant_id !== applicant.applicant_id));
      const newLaptopNeeds = { ...laptopNeeds };
      delete newLaptopNeeds[applicant.applicant_id];
      setLaptopNeeds(newLaptopNeeds);
    } else {
      setSelectedApplicants([...selectedApplicants, applicant]);
    }
  };

  // Toggle laptop need
  const toggleLaptopNeed = (applicantId) => {
    setLaptopNeeds({
      ...laptopNeeds,
      [applicantId]: !laptopNeeds[applicantId]
    });
  };

  // Register selected applicants
  const handleRegister = async () => {
    if (selectedApplicants.length === 0) return;

    setRegistrationLoading(true);
    try {
      const registrations = selectedApplicants.map(applicant => ({
        applicant_id: applicant.applicant_id,
        needs_laptop: laptopNeeds[applicant.applicant_id] || false
      }));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/registrations/${eventType}/${eventId}/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ registrations })
        }
      );

      if (response.ok) {
        onRegistrationComplete?.();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to register applicants');
      }
    } catch (error) {
      console.error('Error registering applicants:', error);
      alert('Failed to register applicants');
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col font-proxima">
        <DialogHeader>
          <DialogTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
            Add Registrations
          </DialogTitle>
          {eventName && (
            <p className="text-sm text-gray-500 font-proxima mt-1">
              {eventName}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search Input */}
          <div>
            <Label className="font-proxima-bold mb-2 block">Search Applicants</Label>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-proxima"
            />
          </div>

          {/* Selected Applicants */}
          {selectedApplicants.length > 0 && (
            <div className="bg-[#4242ea]/5 border border-[#4242ea]/20 rounded-lg p-3">
              <div className="text-sm font-medium text-[#4242ea] mb-2 font-proxima-bold">
                Selected ({selectedApplicants.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedApplicants.map((applicant) => (
                  <Badge 
                    key={applicant.applicant_id}
                    className="bg-[#4242ea] text-white font-proxima cursor-pointer hover:bg-[#3333d1] flex items-center gap-1"
                    onClick={() => toggleApplicant(applicant)}
                  >
                    {applicant.first_name} {applicant.last_name}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-3 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {searchResults.map((applicant) => {
                  const isSelected = selectedApplicants.some(a => a.applicant_id === applicant.applicant_id);
                  return (
                    <div 
                      key={applicant.applicant_id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-[#4242ea]/5' : ''}`}
                      onClick={() => toggleApplicant(applicant)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleApplicant(applicant)}
                          />
                          <div>
                            <div className="font-medium text-[#1a1a1a] font-proxima">
                              {applicant.first_name} {applicant.last_name}
                            </div>
                            <div className="text-sm text-gray-500 font-proxima">
                              {applicant.email}
                            </div>
                          </div>
                        </div>
                        {applicant.already_registered && (
                          <Badge className="bg-yellow-100 text-yellow-700 font-proxima">
                            Already Registered
                          </Badge>
                        )}
                      </div>
                      
                      {/* Laptop need checkbox for workshops */}
                      {isSelected && eventType === 'workshop' && (
                        <div 
                          className="mt-2 ml-8 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox 
                            id={`laptop-${applicant.applicant_id}`}
                            checked={laptopNeeds[applicant.applicant_id] || false}
                            onCheckedChange={() => toggleLaptopNeed(applicant.applicant_id)}
                          />
                          <Label 
                            htmlFor={`laptop-${applicant.applicant_id}`}
                            className="text-sm text-gray-600 font-proxima cursor-pointer"
                          >
                            Needs laptop
                          </Label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-gray-400 font-proxima">
                No applicants found
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 font-proxima">
                Start typing to search for applicants
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={registrationLoading}
            className="font-proxima"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRegister}
            disabled={selectedApplicants.length === 0 || registrationLoading}
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
          >
            {registrationLoading 
              ? 'Registering...' 
              : `Register ${selectedApplicants.length} Applicant${selectedApplicants.length !== 1 ? 's' : ''}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;

