import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import { cachedAdminApi } from '../../services/cachedAdminApi';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' }
];

const EXCUSE_REASONS = ['Sick', 'Personal', 'Program Event', 'Technical Issue', 'Other'];

const getStatusBadgeClasses = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'late':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'excused':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'absent':
    default:
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

const formatDate = (date) => {
  if (!date) return '';

  if (typeof date === 'string') {
    const normalized = date.trim();
    if (!normalized) return '';

    // Already date-only
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    const parsedFromString = new Date(normalized);
    if (Number.isNaN(parsedFromString.getTime())) {
      return '';
    }
    return parsedFromString.toISOString().split('T')[0];
  }

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString().split('T')[0];
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  const normalizedDate = typeof dateString === 'string' ? dateString : String(dateString);
  const d = normalizedDate.includes('T')
    ? new Date(normalizedDate)
    : new Date(`${normalizedDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const formatTimeDisplay = (timeString) => {
  if (!timeString) return '--';

  // Use the raw hour/minute from the timestamp string so legacy records
  // display with straightforward 24h->12h conversion (e.g. 16:35 -> 4:35 PM).
  if (typeof timeString === 'string') {
    const match = timeString.match(/T(\d{2}):(\d{2})/);
    if (match) {
      const hour24 = parseInt(match[1], 10);
      const minute = match[2];
      if (!Number.isNaN(hour24) && hour24 >= 0 && hour24 <= 23) {
        const suffix = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12}:${minute} ${suffix}`;
      }
    }
  }

  // Fallback for non-standard values.
  const d = new Date(timeString);
  if (Number.isNaN(d.getTime())) return '--';
  const hour24 = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${suffix}`;
};

const getDefaultStartDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

const getMonthBounds = (monthDate) => {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  return { start, end };
};

const toDisplayablePhotoUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  if (photoUrl.startsWith('gs://')) {
    const withoutScheme = photoUrl.replace('gs://', '');
    const firstSlashIndex = withoutScheme.indexOf('/');
    if (firstSlashIndex === -1) return '';
    const bucket = withoutScheme.slice(0, firstSlashIndex);
    const objectPath = withoutScheme.slice(firstSlashIndex + 1);
    return `https://storage.googleapis.com/${bucket}/${objectPath}`;
  }
  return photoUrl;
};

const AttendanceManagement = () => {
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);

  const [cohortFilter, setCohortFilter] = useState('all');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const initialBounds = getMonthBounds(new Date());
  const [startDate, setStartDate] = useState(initialBounds.start);
  const [endDate, setEndDate] = useState(initialBounds.end);
  const [startDateOpen, setStartDateOpen] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    userId: '',
    attendanceDate: formatDate(new Date()),
    status: 'present',
    notes: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: ''
  });

  const [editForm, setEditForm] = useState({
    attendanceId: null,
    attendanceDate: '',
    status: 'present',
    notes: '',
    excuseReason: '',
    excuseDetails: '',
    staffNotes: '',
    originalStatus: ''
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const selectedBuilderInitials = useMemo(() => {
    if (!selectedBuilder) return 'N/A';
    const first = selectedBuilder.firstName?.[0] || '';
    const last = selectedBuilder.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'NA';
  }, [selectedBuilder]);

  const cohortOptions = useMemo(() => {
    const set = new Set();
    searchResults.forEach((b) => b?.cohort && set.add(b.cohort));
    if (selectedBuilder?.cohort) set.add(selectedBuilder.cohort);
    return ['all', ...Array.from(set).sort()];
  }, [searchResults, selectedBuilder]);

  const clearMessageSoon = () => {
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const loadAttendanceHistory = async (builderId) => {
    if (!builderId) return;
    try {
      setHistoryLoading(true);
      setError(null);
      const response = await adminApi.getBuilderAttendanceHistory(
        builderId,
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        token
      );
      setAttendanceRecords(response.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance history.');
      setAttendanceRecords([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const params = { search: searchQuery };
        if (cohortFilter !== 'all') params.cohort = cohortFilter;
        const response = await adminApi.searchBuilders(params, token);
        setSearchResults(response.builders || []);
      } catch (err) {
        setError(err.message || 'Failed to search builders.');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, cohortFilter, token]);

  useEffect(() => {
    if (selectedBuilder?.id) {
      loadAttendanceHistory(selectedBuilder.id);
    }
  }, [selectedBuilder, startDate, endDate]);

  useEffect(() => {
    const { start, end } = getMonthBounds(currentMonthDate);
    setStartDate(start);
    setEndDate(end);
  }, [currentMonthDate]);

  const handleSelectBuilder = (builder) => {
    setSelectedBuilder(builder);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openCreateDialog = (builderOverride = null, dateOverride = null, statusOverride = 'present') => {
    const selected = builderOverride || selectedBuilder;
    setCreateForm({
      userId: selected?.id ? String(selected.id) : '',
      attendanceDate: dateOverride || formatDate(new Date()),
      status: statusOverride,
      notes: '',
      excuseReason: '',
      excuseDetails: '',
      staffNotes: ''
    });
    if (builderOverride) {
      setSelectedBuilder(builderOverride);
    }
    setCreateDialogOpen(true);
  };

  const openDayActionDialog = (dateString) => {
    const existing = attendanceRecords.find((r) => formatDate(r.attendance_date) === dateString && r.attendance_id);
    if (existing) {
      openEditDialog(existing);
      return;
    }
    openCreateDialog(selectedBuilder, dateString, 'present');
  };

  const openEditDialog = (record) => {
    setEditForm({
      attendanceId: record.attendance_id,
      attendanceDate: record.attendance_date,
      status: record.status || 'absent',
      notes: record.notes || '',
      excuseReason: '',
      excuseDetails: '',
      staffNotes: '',
      originalStatus: record.status || 'absent'
    });
    setEditDialogOpen(true);
  };

  const handleCreateRecord = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!createForm.userId || !createForm.attendanceDate || !createForm.status) {
        throw new Error('User, date, and status are required.');
      }

      if (createForm.status === 'excused') {
        if (!createForm.excuseReason) {
          throw new Error('Excuse reason is required when status is excused.');
        }
        await adminApi.markBuilderExcused(
          {
            userId: Number(createForm.userId),
            absenceDate: createForm.attendanceDate,
            excuseReason: createForm.excuseReason,
            excuseDetails: createForm.excuseDetails || '',
            staffNotes: createForm.staffNotes || createForm.notes || ''
          },
          token
        );
      } else {
        await adminApi.createManualAttendance(
          {
            userId: Number(createForm.userId),
            attendanceDate: createForm.attendanceDate,
            status: createForm.status,
            notes: createForm.notes || ''
          },
          token
        );
      }

      cachedAdminApi.invalidateAllAttendanceCaches();
      setSuccessMessage('Attendance record created successfully.');
      clearMessageSoon();
      setCreateDialogOpen(false);

      if (selectedBuilder?.id) {
        await loadAttendanceHistory(selectedBuilder.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create record.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecord = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!editForm.attendanceId) {
        throw new Error('Missing attendance record ID.');
      }

      if (editForm.status === 'excused' && editForm.excuseReason && editForm.originalStatus !== 'excused') {
        await adminApi.markBuilderExcused(
          {
            userId: Number(selectedBuilder?.id),
            absenceDate: editForm.attendanceDate,
            excuseReason: editForm.excuseReason,
            excuseDetails: editForm.excuseDetails || '',
            staffNotes: editForm.staffNotes || editForm.notes || ''
          },
          token
        );
      } else {
        await adminApi.updateAttendanceRecord(
          editForm.attendanceId,
          {
            status: editForm.status,
            notes: editForm.notes || ''
          },
          token
        );
      }

      cachedAdminApi.invalidateAllAttendanceCaches();
      setSuccessMessage('Attendance record updated successfully.');
      clearMessageSoon();
      setEditDialogOpen(false);

      if (selectedBuilder?.id) {
        await loadAttendanceHistory(selectedBuilder.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to update record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    try {
      if (!recordToDelete?.attendance_id) {
        throw new Error('Missing attendance record ID.');
      }
      setSaving(true);
      setError(null);

      await adminApi.deleteAttendanceRecord(recordToDelete.attendance_id, token);
      cachedAdminApi.invalidateAllAttendanceCaches();
      setSuccessMessage('Attendance record deleted successfully.');
      clearMessageSoon();
      setDeleteDialogOpen(false);
      setRecordToDelete(null);

      if (selectedBuilder?.id) {
        await loadAttendanceHistory(selectedBuilder.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete record.');
    } finally {
      setSaving(false);
    }
  };

  const attendanceByDate = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((record) => {
      const dateKey = formatDate(record.attendance_date);
      map.set(dateKey, record);
    });
    return map;
  }, [attendanceRecords]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const lastOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);

    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(lastOfMonth);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const days = [];
    const current = new Date(start);
    while (current <= end) {
      const dateString = formatDate(current);
      days.push({
        date: new Date(current),
        dateString,
        record: attendanceByDate.get(dateString) || null,
        isCurrentMonth: current.getMonth() === currentMonthDate.getMonth(),
        isToday: formatDate(new Date()) === dateString
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [attendanceByDate, currentMonthDate]);

  const canShowSignedInAvatar = (record) => record && (record.status === 'present' || record.status === 'late');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Attendance Management</h2>
          <p className="mt-1 text-sm text-slate-600">
            Search, update, and manage builder attendance records.
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          disabled={!selectedBuilder}
          className="bg-[#4242EA] hover:bg-[#3636D8] text-white"
        >
          <Plus className="h-4 w-4" />
          New Record
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-slate-200">
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="relative lg:col-span-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search builder by name or email..."
                className="pl-10"
              />
              {searching && (
                <RefreshCw className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#4242EA]" />
              )}
            </div>

            <div className="lg:col-span-2">
              <Select value={cohortFilter} onValueChange={setCohortFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohortOptions.map((cohort) => (
                    <SelectItem key={cohort} value={cohort}>
                      {cohort === 'all' ? 'All Cohorts' : cohort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const prev = new Date(currentMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentMonthDate(prev);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-center font-medium">
                      {currentMonthDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentMonthDate}
                      onSelect={(d) => {
                        if (d) setCurrentMonthDate(d);
                        setStartDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const next = new Date(currentMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentMonthDate(next);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white">
              {searchResults.map((builder) => (
                <button
                  key={builder.id}
                  onClick={() => handleSelectBuilder(builder)}
                  className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {builder.firstName} {builder.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{builder.email}</p>
                  </div>
                  <Badge className="border-slate-200 bg-slate-100 text-slate-700">{builder.cohort}</Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          {selectedBuilder ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Builder:{' '}
                  <span className="font-semibold text-slate-900">
                    {selectedBuilder.firstName} {selectedBuilder.lastName}
                  </span>{' '}
                  | Cohort: <span className="font-medium text-slate-900">{selectedBuilder.cohort}</span> | Showing:{' '}
                  <span className="font-medium text-slate-900">
                    {formatDateDisplay(formatDate(startDate))} - {formatDateDisplay(formatDate(endDate))}
                  </span>
                </p>
              </div>

              <div className="rounded-lg border border-slate-200">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="px-3 py-2 text-center text-xs font-semibold text-slate-600">
                      {day}
                    </div>
                  ))}
                </div>
                {historyLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading attendance history...</div>
                ) : (
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day) => {
                      const record = day.record;
                      const hasSignedIn = canShowSignedInAvatar(record);
                      const resolvedPhotoUrl = toDisplayablePhotoUrl(record?.photo_url);
                      return (
                        <button
                          key={day.dateString}
                          onClick={() => openDayActionDialog(day.dateString)}
                          className={`min-h-[118px] border-b border-r border-slate-200 p-2 text-left transition-colors hover:bg-slate-50 ${
                            day.isCurrentMonth ? 'bg-white' : 'bg-slate-100 text-slate-400'
                          } ${day.isToday ? 'ring-2 ring-inset ring-[#4242EA]' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold">{day.date.getDate()}</span>
                            {record?.status && (
                              <Badge className={`${getStatusBadgeClasses(record.status)} text-[10px]`}>
                                {record.status}
                              </Badge>
                            )}
                          </div>
                          {hasSignedIn && (
                            <div className="mt-2 flex items-center gap-2">
                              {resolvedPhotoUrl ? (
                                <img
                                  src={resolvedPhotoUrl}
                                  alt="Check-in"
                                  className="h-8 w-8 rounded-full border border-slate-300 object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4242EA] bg-[#4242EA]/10 text-xs font-semibold text-[#4242EA]">
                                  {selectedBuilderInitials}
                                </div>
                              )}
                              <span className="text-[11px] text-slate-600">{formatTimeDisplay(record.check_in_time)}</span>
                            </div>
                          )}
                          {!record && day.isCurrentMonth && (
                            <p className="mt-3 text-[11px] text-slate-500">Click to create</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-600">
              Search and select a builder to view and manage attendance history.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Create Attendance Record</DialogTitle>
            <DialogDescription>
              {selectedBuilder
                ? `Creating a record for ${selectedBuilder.firstName} ${selectedBuilder.lastName}.`
                : 'Create a new attendance record.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
            <div className="md:col-span-1">
              <Label>Attendance Date</Label>
              <Input value={formatDateDisplay(createForm.attendanceDate)} disabled className="mt-1" />
            </div>
            <div className="md:col-span-1">
              <Label>Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(value) => setCreateForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createForm.status === 'excused' && (
              <>
                <div className="md:col-span-1">
                  <Label>Excuse Reason</Label>
                  <Select
                    value={createForm.excuseReason}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, excuseReason: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCUSE_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label>Staff Notes</Label>
                  <Textarea
                    rows={2}
                    value={createForm.staffNotes}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, staffNotes: e.target.value }))}
                    className="mt-1"
                    placeholder="Internal staff notes"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Excuse Details</Label>
                  <Textarea
                    rows={2}
                    value={createForm.excuseDetails}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, excuseDetails: e.target.value }))}
                    className="mt-1"
                    placeholder="Optional context for this excuse"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={createForm.notes}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecord} disabled={saving} className="bg-[#4242EA] text-white hover:bg-[#3636D8]">
              {saving ? 'Saving...' : 'Create Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Update status or notes for {formatDateDisplay(editForm.attendanceDate)}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
            <div className="md:col-span-1">
              <Label>Date</Label>
              <Input value={formatDateDisplay(editForm.attendanceDate)} disabled className="mt-1" />
            </div>
            <div className="md:col-span-1">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editForm.status === 'excused' && (
              <>
                <div className="md:col-span-1">
                  <Label>Excuse Reason (required for new excuse updates)</Label>
                  <Select
                    value={editForm.excuseReason}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, excuseReason: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCUSE_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label>Staff Notes</Label>
                  <Textarea
                    rows={2}
                    value={editForm.staffNotes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, staffNotes: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Excuse Details</Label>
                  <Textarea
                    rows={2}
                    value={editForm.excuseDetails}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, excuseDetails: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setRecordToDelete({ attendance_id: editForm.attendanceId });
                  setEditDialogOpen(false);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Record
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecord} disabled={saving} className="bg-[#4242EA] text-white hover:bg-[#3636D8]">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attendance record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the selected attendance record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AttendanceManagement;
