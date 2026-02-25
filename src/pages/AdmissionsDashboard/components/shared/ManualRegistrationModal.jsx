import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';
import Swal from 'sweetalert2';

const ManualRegistrationModal = ({
  isOpen,
  onClose,
  eventId,
  eventType,
  onRegistrationSuccess,
  token
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allApplicants, setAllApplicants] = useState([]);
  const [registeredApplicantIds, setRegisteredApplicantIds] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [laptopNeeds, setLaptopNeeds] = useState({});

  // Fetch all applicants and registered list on mount
  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchData = async () => {
      setInitialLoading(true);
      try {
        // Fetch all applicants (lightweight index)
        const applicantsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admissions/dashboard/applications/search-index`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (applicantsResponse.ok) {
          const applicants = await applicantsResponse.json();
          setAllApplicants(applicants);
        }

        // Fetch current registrations for this event
        const registrationsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admissions/registrations/${eventType}/${eventId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (registrationsResponse.ok) {
          const registrations = await registrationsResponse.json();
          const registeredIds = new Set(registrations.map(r => r.applicant_id));
          setRegisteredApplicantIds(registeredIds);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [isOpen, eventId, eventType, token]);

  // Client-side filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allApplicants
      .filter(applicant => {
        const fullName = `${applicant.first_name} ${applicant.last_name}`.toLowerCase();
        const email = (applicant.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      })
      .slice(0, 50); // Limit to 50 results for performance

    setSearchResults(filtered);
  }, [searchTerm, allApplicants]);

  // Handle register applicant
  const handleRegister = async (applicant) => {
    setRegistrationLoading(true);
    try {
      const requestBody = {
        applicantId: applicant.applicant_id,
        name: `${applicant.first_name} ${applicant.last_name}`,
        email: applicant.email
      };

      // Add laptop need for workshops
      if (eventType === 'workshop') {
        requestBody.needsLaptop = laptopNeeds[applicant.applicant_id] || false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/events/${eventType}/${eventId}/register-applicant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${applicant.first_name} ${applicant.last_name} has been registered successfully`,
          timer: 2000,
          showConfirmButton: false
        });

        // Mark as registered
        setRegisteredApplicantIds(prev => new Set([...prev, applicant.applicant_id]));
        
        // Notify parent to refresh
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.error || 'Failed to register applicant'
        });
      }
    } catch (error) {
      console.error('Error registering applicant:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Reset on close
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setAllApplicants([]);
    setRegisteredApplicantIds(new Set());
    setLaptopNeeds({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-proxima">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold">
            Add Registration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {initialLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4242ea] border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-500 font-proxima">Loading applicants...</p>
            </div>
          )}

          {/* Search Input */}
          {!initialLoading && (
            <>
              <div className="space-y-2">
                <Label className="font-proxima-bold">Search Applicants</Label>
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-proxima"
                />
                <p className="text-xs text-gray-500 font-proxima">
                  {allApplicants.length} applicants loaded. Start typing to filter results.
                </p>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-proxima-bold">Results ({searchResults.length})</Label>
                  <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                    {searchResults.map((applicant) => {
                      const isAlreadyRegistered = registeredApplicantIds.has(applicant.applicant_id);
                      const canRegister = !isAlreadyRegistered;

                      return (
                        <div
                          key={applicant.applicant_id}
                          className={`p-3 ${isAlreadyRegistered ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium font-proxima">
                                  {applicant.first_name} {applicant.last_name}
                                </p>
                                {isAlreadyRegistered && (
                                  <Badge className="bg-blue-100 text-blue-700 font-proxima text-xs">
                                    Already Registered
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-proxima truncate">
                                {applicant.email}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Laptop checkbox for workshops */}
                              {eventType === 'workshop' && canRegister && (
                                <div className="flex items-center gap-2 mr-2">
                                  <Checkbox
                                    id={`laptop-${applicant.applicant_id}`}
                                    checked={laptopNeeds[applicant.applicant_id] || false}
                                    onCheckedChange={(checked) =>
                                      setLaptopNeeds(prev => ({
                                        ...prev,
                                        [applicant.applicant_id]: checked
                                      }))
                                    }
                                  />
                                  <Label
                                    htmlFor={`laptop-${applicant.applicant_id}`}
                                    className="text-sm font-proxima cursor-pointer"
                                  >
                                    Needs Laptop
                                  </Label>
                                </div>
                              )}

                              <Button
                                size="sm"
                                onClick={() => handleRegister(applicant)}
                                disabled={!canRegister || registrationLoading}
                                className={`font-proxima ${canRegister ? 'bg-[#4242ea] hover:bg-[#3333d1]' : ''}`}
                              >
                                {isAlreadyRegistered ? 'Registered' : 'Register'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results */}
              {searchTerm.length > 0 && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-proxima">
                  No applicants found matching "{searchTerm}"
                </div>
              )}

              {/* Instructions */}
              {searchTerm.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-proxima">
                  Search for applicants by name or email to add them to this {eventType === 'info-session' ? 'info session' : 'workshop'}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualRegistrationModal;

