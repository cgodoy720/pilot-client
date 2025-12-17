import React, { useState, useEffect } from 'react';
import { Search, UserPlus, RefreshCw, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { adminApi } from '../../services/adminApi';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { useAuth } from '../../context/AuthContext';

const ExcuseManagementInterface = () => {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Recent unexcused absences section
  const [showUnexcused, setShowUnexcused] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [loadingUnexcused, setLoadingUnexcused] = useState(false);
  
  // Excuse dialog
  const [excuseDialogOpen, setExcuseDialogOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [excuseForm, setExcuseForm] = useState({
    absenceDate: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });

  const excuseReasons = ['Sick', 'Personal', 'Work Conflict', 'Childcare', 'Transportation', 'Other'];

  // Search builders as user types
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError(null);
      
      const response = await adminApi.searchBuilders({ search: searchQuery }, token);
      setSearchResults(response.builders || []);
    } catch (err) {
      console.error('Error searching builders:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchUnexcusedAbsences = async () => {
    try {
      setLoadingUnexcused(true);
      const response = await adminApi.getPendingExcuses({ days: 7 }, token);
      setPendingData(response);
    } catch (err) {
      console.error('Error fetching unexcused absences:', err);
    } finally {
      setLoadingUnexcused(false);
    }
  };

  useEffect(() => {
    if (showUnexcused && !pendingData) {
      fetchUnexcusedAbsences();
    }
  }, [showUnexcused]);

  const handleSelectBuilder = (builder) => {
    setSelectedBuilder(builder);
    setExcuseForm({
      absenceDate: new Date().toISOString().split('T')[0],
      excuseReason: '',
      excuseDetails: '',
      staffNotes: ''
    });
    setExcuseDialogOpen(true);
  };

  const handleSubmitExcuse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedBuilder?.id) throw new Error('Missing user ID');
      if (!excuseForm.absenceDate) throw new Error('Please select an absence date');
      if (!excuseForm.excuseReason) throw new Error('Please select an excuse reason');
      
      await adminApi.markBuilderExcused({
        userId: selectedBuilder.id,
        absenceDate: excuseForm.absenceDate,
        excuseReason: excuseForm.excuseReason,
        excuseDetails: excuseForm.excuseDetails || '',
        staffNotes: excuseForm.staffNotes || ''
      }, token);
      
      cachedAdminApi.invalidateAllAttendanceCaches();
      
      setSuccessMessage(`Successfully added excuse for ${selectedBuilder.firstName} ${selectedBuilder.lastName}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setExcuseDialogOpen(false);
      setSelectedBuilder(null);
      setExcuseForm({ absenceDate: '', excuseReason: '', excuseDetails: '', staffNotes: '' });
      setSearchQuery('');
      setSearchResults([]);
      
      // Refresh unexcused absences if showing
      if (showUnexcused) {
        fetchUnexcusedAbsences();
      }
    } catch (err) {
      console.error('Error marking builder as excused:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserPlus className="h-6 w-6 text-[#4242EA]" />
        <h2 className="text-xl font-semibold text-[#1E1E1E]">Excuse Management</h2>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search Section */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Search for Builder</h3>
          <p className="text-sm text-[#666666] mb-4">
            Search by name or email to add an excused absence for a builder.
          </p>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-[#C8C8C8] text-base"
            />
            {searching && (
              <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4242EA] animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border border-[#C8C8C8] rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((builder) => (
                  <div
                    key={builder.id}
                    onClick={() => handleSelectBuilder(builder)}
                    className="p-4 border-b border-[#E3E3E3] last:border-b-0 hover:bg-[#F9F9F9] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#1E1E1E]">
                          {builder.firstName} {builder.lastName}
                        </p>
                        <p className="text-sm text-[#666666]">{builder.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/30">
                          {builder.cohort}
                        </Badge>
                        <UserPlus className="h-5 w-5 text-[#4242EA]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <div className="mt-4 p-4 bg-[#F9F9F9] rounded-lg text-center">
              <p className="text-sm text-[#666666]">No builders found matching "{searchQuery}"</p>
            </div>
          )}

          {/* Search Hint */}
          {searchQuery.trim().length < 2 && searchQuery.trim().length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Type at least 2 characters to search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Unexcused Absences Section */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardContent className="p-6">
          <button
            onClick={() => setShowUnexcused(!showUnexcused)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Recent Unexcused Absences</h3>
              <p className="text-sm text-[#666666] mt-1">
                View builders with unexcused absences in the last 7 days
              </p>
            </div>
            {showUnexcused ? (
              <ChevronUp className="h-5 w-5 text-[#666666]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#666666]" />
            )}
          </button>

          {showUnexcused && (
            <div className="mt-4 pt-4 border-t border-[#E3E3E3]">
              {loadingUnexcused ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-[#4242EA] animate-spin mb-2" />
                  <p className="text-sm text-[#666666]">Loading unexcused absences...</p>
                </div>
              ) : pendingData?.summary?.totalUnexcusedAbsences > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pendingData.unexcusedAbsences?.flatMap((user) =>
                    user.absences.map((absence, absenceIndex) => (
                      <Card key={`${user.userId}-${absenceIndex}`} className="bg-[#F9F9F9] border-[#E3E3E3]">
                        <CardContent className="p-4">
                          <p className="font-medium text-[#1E1E1E] mb-1">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-[#666666] mb-1">{user.cohort}</p>
                          <p className="text-sm text-[#666666] mb-3">{formatDate(absence.date)}</p>
                          <button
                            onClick={() => handleSelectBuilder({
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              cohort: user.cohort
                            })}
                            className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full text-sm font-medium text-white transition-colors duration-300 w-full justify-center"
                          >
                            <UserPlus className="h-4 w-4 relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]" />
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                              Add Excuse
                            </span>
                            <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          </button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">No Unexcused Absences</h3>
                  <p className="text-sm text-[#666666]">All recent absences have been excused.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excuse Dialog */}
      <Dialog open={excuseDialogOpen} onOpenChange={setExcuseDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E1E1E]">Add Excused Absence</DialogTitle>
            {selectedBuilder && (
              <DialogDescription className="text-[#666666]">
                Builder: {selectedBuilder.firstName} {selectedBuilder.lastName}
                <span className="block text-[#4242EA] mt-1">{selectedBuilder.cohort}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-[#1E1E1E]">Absence Date *</Label>
              <Input
                type="date"
                value={excuseForm.absenceDate}
                onChange={(e) => setExcuseForm({ ...excuseForm, absenceDate: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
              />
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Excuse Reason *</Label>
              <Select value={excuseForm.excuseReason} onValueChange={(v) => setExcuseForm({ ...excuseForm, excuseReason: v })}>
                <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {excuseReasons.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Excuse Details</Label>
              <Textarea
                value={excuseForm.excuseDetails}
                onChange={(e) => setExcuseForm({ ...excuseForm, excuseDetails: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
                rows={3}
                placeholder="Optional details about the excuse..."
              />
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Staff Notes</Label>
              <Textarea
                value={excuseForm.staffNotes}
                onChange={(e) => setExcuseForm({ ...excuseForm, staffNotes: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
                rows={2}
                placeholder="Internal notes (not visible to builder)..."
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setExcuseDialogOpen(false)}
              className="px-4 py-2 text-[#666666] hover:text-[#1E1E1E] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitExcuse}
              disabled={!excuseForm.absenceDate || !excuseForm.excuseReason || loading}
              className="group relative overflow-hidden inline-flex items-center px-6 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full font-medium text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                {loading ? 'Adding...' : 'Add Excuse'}
              </span>
              <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcuseManagementInterface;
