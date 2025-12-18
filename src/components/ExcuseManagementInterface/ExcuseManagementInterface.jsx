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
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError(null);
      
      const response = await adminApi.searchBuilders({ search: searchQuery }, token);
      setSearchResults(response.builders || []);
    } catch (err) {
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
      // Silently fail - not critical
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
      
      if (showUnexcused) {
        fetchUnexcusedAbsences();
      }
    } catch (err) {
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
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Excuse Management</h2>
        <p className="text-sm text-slate-600 mt-1">
          Search for builders and add excused absences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search Section - Hero Element */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4242EA]/10 rounded-full mb-4">
                <Search className="h-8 w-8 text-[#4242EA]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Find a Builder</h3>
              <p className="text-slate-600">
                Search by name or email to add an excused absence
              </p>
            </div>
            
            {/* Large Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg bg-white border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#4242EA] focus:border-[#4242EA]"
              />
              {searching && (
                <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4242EA] animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((builder) => (
                    <div
                      key={builder.id}
                      onClick={() => handleSelectBuilder(builder)}
                      className="p-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {builder.firstName} {builder.lastName}
                        </p>
                        <p className="text-sm text-slate-600">{builder.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                          {builder.cohort}
                        </Badge>
                        <div className="flex items-center gap-2 text-[#4242EA] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium">Add Excuse</span>
                          <UserPlus className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <div className="mt-4 p-6 bg-slate-50 rounded-lg text-center">
                <p className="text-slate-600">No builders found matching "{searchQuery}"</p>
              </div>
            )}

            {/* Search Hint */}
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700">Type at least 2 characters to search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Unexcused Absences Section */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <button
            onClick={() => setShowUnexcused(!showUnexcused)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#4242EA] transition-colors">
                Recent Unexcused Absences
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                View builders with unexcused absences in the last 7 days
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pendingData?.summary?.totalUnexcusedAbsences > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {pendingData.summary.totalUnexcusedAbsences}
                </Badge>
              )}
              {showUnexcused ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </button>

          {showUnexcused && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              {loadingUnexcused ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-[#4242EA] animate-spin mb-2" />
                  <p className="text-sm text-slate-600">Loading unexcused absences...</p>
                </div>
              ) : pendingData?.summary?.totalUnexcusedAbsences > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {pendingData.unexcusedAbsences?.flatMap((user) =>
                    user.absences.map((absence, absenceIndex) => (
                      <div 
                        key={`${user.userId}-${absenceIndex}`} 
                        className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <p className="font-medium text-slate-900 mb-1">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-slate-600 mb-1">{user.cohort}</p>
                        <p className="text-sm text-slate-500 mb-3">{formatDate(absence.date)}</p>
                        <button
                          onClick={() => handleSelectBuilder({
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            cohort: user.cohort
                          })}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4242EA] text-white rounded-lg text-sm font-medium hover:bg-[#3636D8] transition-colors"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Excuse
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h4>
                  <p className="text-sm text-slate-600">No unexcused absences in the last 7 days.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excuse Dialog */}
      <Dialog open={excuseDialogOpen} onOpenChange={setExcuseDialogOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl">Add Excused Absence</DialogTitle>
            {selectedBuilder && (
              <DialogDescription className="text-slate-600">
                <span className="font-medium text-slate-900">
                  {selectedBuilder.firstName} {selectedBuilder.lastName}
                </span>
                <span className="block text-[#4242EA] mt-1">{selectedBuilder.cohort}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-900 font-medium">Absence Date *</Label>
              <Input
                type="date"
                value={excuseForm.absenceDate}
                onChange={(e) => setExcuseForm({ ...excuseForm, absenceDate: e.target.value })}
                className="mt-1.5 bg-white border-slate-300"
              />
            </div>
            <div>
              <Label className="text-slate-900 font-medium">Excuse Reason *</Label>
              <Select value={excuseForm.excuseReason} onValueChange={(v) => setExcuseForm({ ...excuseForm, excuseReason: v })}>
                <SelectTrigger className="mt-1.5 bg-white border-slate-300">
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
              <Label className="text-slate-900 font-medium">Excuse Details</Label>
              <Textarea
                value={excuseForm.excuseDetails}
                onChange={(e) => setExcuseForm({ ...excuseForm, excuseDetails: e.target.value })}
                className="mt-1.5 bg-white border-slate-300"
                rows={3}
                placeholder="Optional details about the excuse..."
              />
            </div>
            <div>
              <Label className="text-slate-900 font-medium">Staff Notes</Label>
              <Textarea
                value={excuseForm.staffNotes}
                onChange={(e) => setExcuseForm({ ...excuseForm, staffNotes: e.target.value })}
                className="mt-1.5 bg-white border-slate-300"
                rows={2}
                placeholder="Internal notes (not visible to builder)..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setExcuseDialogOpen(false)}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitExcuse}
              disabled={!excuseForm.absenceDate || !excuseForm.excuseReason || loading}
              className="px-6 py-2 bg-[#4242EA] text-white rounded-lg font-medium hover:bg-[#3636D8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Excuse'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcuseManagementInterface;
