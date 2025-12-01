import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, History, Plus, Pencil, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
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
  const [activeTab, setActiveTab] = useState('unexcused');
  const [pendingData, setPendingData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState('all');
  
  const [excuseDialogOpen, setExcuseDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [excuseForm, setExcuseForm] = useState({
    absenceDate: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });
  const [bulkForm, setBulkForm] = useState({
    cohort: '',
    absenceDate: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });

  const excuseReasons = ['Sick', 'Personal', 'Work Conflict', 'Childcare', 'Transportation', 'Other'];
  const cohorts = ['March 2025', 'September 2025', 'June 2025'];

  const filteredUnexcusedAbsences = selectedCohort && selectedCohort !== 'all'
    ? pendingData?.unexcusedAbsences?.filter(user => user.cohort === selectedCohort) || []
    : pendingData?.unexcusedAbsences || [];

  const fetchPendingData = async () => {
    try {
      const response = await adminApi.getPendingExcuses({ days: 7 }, token);
      setPendingData(response);
    } catch (err) {
      console.error('Error fetching unexcused absences:', err);
      setError(err.message);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await adminApi.getExcuseHistory({ limit: 50 }, token);
      setHistoryData(response);
    } catch (err) {
      console.error('Error fetching excuse history:', err);
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchPendingData(), fetchHistoryData()]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching excuse data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = () => fetchData();

  const handleMarkExcused = (builder) => {
    setSelectedBuilder(builder);
    setExcuseForm({
      absenceDate: builder.absenceDate || '',
      excuseReason: builder.excuseReason || '',
      excuseDetails: builder.excuseDetails || '',
      staffNotes: ''
    });
    setExcuseDialogOpen(true);
  };

  const handleBulkExcuse = () => {
    setBulkForm({
      cohort: '',
      absenceDate: new Date().toISOString().split('T')[0],
      excuseReason: '',
      excuseDetails: '',
      staffNotes: ''
    });
    setBulkDialogOpen(true);
  };

  const handleSubmitExcuse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedBuilder?.userId) throw new Error('Missing user ID');
      if (!excuseForm.absenceDate) throw new Error('Please select an absence date');
      if (!excuseForm.excuseReason) throw new Error('Please select an excuse reason');
      
      await adminApi.markBuilderExcused({
        userId: selectedBuilder.userId,
        absenceDate: excuseForm.absenceDate,
        excuseReason: excuseForm.excuseReason,
        excuseDetails: excuseForm.excuseDetails || '',
        staffNotes: excuseForm.staffNotes || ''
      }, token);
      
      cachedAdminApi.invalidateAllAttendanceCaches();
      await fetchData();
      
      setSuccessMessage(`Successfully approved excuse for ${selectedBuilder.firstName} ${selectedBuilder.lastName}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setExcuseDialogOpen(false);
      setSelectedBuilder(null);
      setExcuseForm({ absenceDate: '', excuseReason: '', excuseDetails: '', staffNotes: '' });
    } catch (err) {
      console.error('Error marking builder as excused:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBulkExcuse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await adminApi.bulkExcuseCohort({
        cohort: bulkForm.cohort,
        absenceDate: bulkForm.absenceDate,
        excuseReason: bulkForm.excuseReason,
        excuseDetails: bulkForm.excuseDetails,
        staffNotes: bulkForm.staffNotes
      }, token);
      
      cachedAdminApi.invalidateAllAttendanceCaches();
      await fetchData();
      
      setSuccessMessage(`Successfully excused ${bulkForm.cohort} cohort`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setBulkDialogOpen(false);
      setBulkForm({ cohort: '', absenceDate: new Date().toISOString().split('T')[0], excuseReason: '', excuseDetails: '', staffNotes: '' });
    } catch (err) {
      console.error('Error performing bulk excuse:', err);
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

  const getExcuseReasonColor = (reason) => {
    const colors = {
      'Sick': 'bg-red-100 text-red-700',
      'Personal': 'bg-amber-100 text-amber-700',
      'Work Conflict': 'bg-blue-100 text-blue-700',
      'Childcare': 'bg-purple-100 text-purple-700',
      'Transportation': 'bg-cyan-100 text-cyan-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[reason] || 'bg-gray-100 text-gray-700';
  };

  if (loading && !pendingData && !historyData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#666666]">Loading excuse management data...</p>
      </div>
    );
  }

  if (error && !pendingData && !historyData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-600">Error loading excuse data: {error}</span>
        </div>
        <button onClick={handleRefresh} className="p-2 hover:bg-red-100 rounded-md transition-colors">
          <RefreshCw className="h-4 w-4 text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-semibold text-[#1E1E1E]">Excuse Management Interface</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-[#666666]">Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={handleBulkExcuse}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#C8C8C8] rounded-lg text-[#1E1E1E] text-sm font-medium hover:bg-[#F9F9F9] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Bulk Excuse
          </button>
          <button onClick={handleRefresh} disabled={loading} className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-[#C8C8C8]">
          <TabsTrigger value="unexcused" className="flex items-center gap-2 data-[state=active]:bg-[#4242EA] data-[state=active]:text-white">
            <ClipboardList className="h-4 w-4" />
            Unexcused Absences
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-[#4242EA] data-[state=active]:text-white">
            <History className="h-4 w-4" />
            Excuse History
          </TabsTrigger>
        </TabsList>

        {/* Unexcused Absences Tab */}
        <TabsContent value="unexcused" className="mt-4">
          {pendingData?.summary?.totalUnexcusedAbsences > 0 ? (
            <Card className="bg-white border-[#C8C8C8]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Unexcused Absences</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Builders with unexcused absences in the last 7 days. Click "Add Excuse" to approve their absence.
                </p>
                
                {/* Cohort Filter */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-sm text-[#1E1E1E]">Filter by Cohort:</span>
                  <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                    <SelectTrigger className="w-[200px] bg-white border-[#C8C8C8]">
                      <SelectValue placeholder="All Cohorts" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Cohorts</SelectItem>
                      <SelectItem value="March 2025">March 2025</SelectItem>
                      <SelectItem value="September 2025">September 2025</SelectItem>
                      <SelectItem value="June 2025">June 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Absence Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUnexcusedAbsences.flatMap((user, userIndex) =>
                    user.absences.map((absence, absenceIndex) => (
                      <Card key={`${userIndex}-${absenceIndex}`} className="bg-[#F9F9F9] border-[#E3E3E3]">
                        <CardContent className="p-4">
                          <p className="font-medium text-[#1E1E1E] mb-1">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-[#666666] mb-1">{user.cohort}</p>
                          <p className="text-sm text-[#666666] mb-3">{formatDate(absence.date)}</p>
                          <button
                            onClick={() => handleMarkExcused({
                              userId: user.userId,
                              absenceDate: absence.date,
                              firstName: user.firstName,
                              lastName: user.lastName
                            })}
                            className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full text-sm font-medium text-white transition-colors duration-300"
                          >
                            <Plus className="h-4 w-4 relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]" />
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">Add Excuse</span>
                            <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          </button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-[#C8C8C8]">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">No Unexcused Absences</h3>
                <p className="text-sm text-[#666666]">All recent absences have been excused.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          {historyData?.excuses?.length > 0 ? (
            <Card className="bg-white border-[#C8C8C8]">
              <CardContent className="p-6">
                <div className="border border-[#C8C8C8] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F9F9F9]">
                        <TableHead className="text-[#1E1E1E] font-semibold">Builder</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Cohort</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Absence Date</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Reason</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Status</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Processed By</TableHead>
                        <TableHead className="text-[#1E1E1E] font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.excuses.map((excuse, index) => (
                        <TableRow key={index} className="border-b border-[#E3E3E3]">
                          <TableCell>
                            <div>
                              <p className="font-medium text-[#1E1E1E]">{excuse.firstName} {excuse.lastName}</p>
                              <p className="text-xs text-[#666666]">{excuse.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#1E1E1E]">{excuse.cohort}</TableCell>
                          <TableCell className="text-[#666666]">{formatDate(excuse.absenceDate)}</TableCell>
                          <TableCell>
                            <Badge className={getExcuseReasonColor(excuse.excuseReason)}>{excuse.excuseReason}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              excuse.status === 'approved' ? 'bg-green-100 text-green-700' :
                              excuse.status === 'denied' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {excuse.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#666666]">
                            {excuse.processedBy?.firstName} {excuse.processedBy?.lastName}
                          </TableCell>
                          <TableCell>
                            <button className="p-1.5 hover:bg-[#EFEFEF] rounded-md transition-colors">
                              <Pencil className="h-4 w-4 text-[#4242EA]" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-[#C8C8C8]">
              <CardContent className="p-12 text-center">
                <History className="h-12 w-12 text-[#666666] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">No Excuse History</h3>
                <p className="text-sm text-[#666666]">No excuse records found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Mark Excused Dialog */}
      <Dialog open={excuseDialogOpen} onOpenChange={setExcuseDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E1E1E]">
              {selectedBuilder?.excuseReason ? 'Update Excuse' : 'Mark Builder as Excused'}
            </DialogTitle>
            {selectedBuilder && (
              <DialogDescription className="text-[#666666]">
                Builder: {selectedBuilder.firstName} {selectedBuilder.lastName}
                {selectedBuilder.excuseReason && (
                  <span className="block text-[#4242EA] mt-1">Current excuse: {selectedBuilder.excuseReason}</span>
                )}
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
                <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {excuseReasons.map(reason => <SelectItem key={reason} value={reason}>{reason}</SelectItem>)}
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
              />
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Staff Notes</Label>
              <Textarea
                value={excuseForm.staffNotes}
                onChange={(e) => setExcuseForm({ ...excuseForm, staffNotes: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setExcuseDialogOpen(false)} className="px-4 py-2 text-[#666666] hover:text-[#1E1E1E] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmitExcuse}
              disabled={!excuseForm.absenceDate || !excuseForm.excuseReason || loading}
              className="group relative overflow-hidden inline-flex items-center px-6 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full font-medium text-white transition-colors duration-300 disabled:opacity-50"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                {selectedBuilder?.excuseReason ? 'Update Excuse' : 'Mark Excused'}
              </span>
              <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Excuse Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E1E1E]">Bulk Excuse for Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-[#1E1E1E]">Cohort *</Label>
              <Select value={bulkForm.cohort} onValueChange={(v) => setBulkForm({ ...bulkForm, cohort: v })}>
                <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]"><SelectValue placeholder="Select cohort" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {cohorts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Absence Date *</Label>
              <Input
                type="date"
                value={bulkForm.absenceDate}
                onChange={(e) => setBulkForm({ ...bulkForm, absenceDate: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
              />
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Excuse Reason *</Label>
              <Select value={bulkForm.excuseReason} onValueChange={(v) => setBulkForm({ ...bulkForm, excuseReason: v })}>
                <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {excuseReasons.map(reason => <SelectItem key={reason} value={reason}>{reason}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Excuse Details</Label>
              <Textarea
                value={bulkForm.excuseDetails}
                onChange={(e) => setBulkForm({ ...bulkForm, excuseDetails: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-[#1E1E1E]">Staff Notes</Label>
              <Textarea
                value={bulkForm.staffNotes}
                onChange={(e) => setBulkForm({ ...bulkForm, staffNotes: e.target.value })}
                className="mt-1 bg-white border-[#C8C8C8]"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setBulkDialogOpen(false)} className="px-4 py-2 text-[#666666] hover:text-[#1E1E1E] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmitBulkExcuse}
              disabled={!bulkForm.cohort || !bulkForm.absenceDate || !bulkForm.excuseReason || loading}
              className="group relative overflow-hidden inline-flex items-center px-6 py-2 bg-[#4242EA] border border-[#4242EA] rounded-full font-medium text-white transition-colors duration-300 disabled:opacity-50"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">Bulk Excuse</span>
              <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcuseManagementInterface;
