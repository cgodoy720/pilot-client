import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Calendar, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import useAuthStore from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['present', 'late', 'absent', 'excused'];
const EXCUSE_REASONS = ['Sick', 'Personal', 'Program Event', 'Technical Issue', 'Other'];

const DayBuilderStatusModal = ({ 
  isOpen, 
  onClose, 
  dayData, 
  loading = false,
  onRefresh,
}) => {
  const token = useAuthStore((s) => s.token);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [savingId, setSavingId] = useState(null);
  const [excusePending, setExcusePending] = useState(null);
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseNote, setExcuseNote] = useState('');
  const [excuseError, setExcuseError] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateStr) => {
    // Append T12:00:00 to avoid timezone day-shift issues
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: {
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        label: 'Present',
        order: 1
      },
      late: {
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        label: 'Late',
        order: 2
      },
      excused: {
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        label: 'Excused',
        order: 3
      },
      pending: {
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        label: 'Pending',
        order: 4
      },
      absent: {
        className: 'bg-red-100 text-red-700 border-red-200',
        label: 'Absent',
        order: 5
      }
    };

    const config = statusConfig[status] || statusConfig.absent;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusOrder = (status) => {
    const statusOrder = { present: 1, late: 2, excused: 3, pending: 4, absent: 5 };
    return statusOrder[status] || 5;
  };

  const handleStatusChange = async (builder, newStatus) => {
    if (newStatus === 'excused') {
      // Block silent overwrite of an in-progress excuse for a different row
      if (excusePending && excusePending.userId !== builder.userId) {
        setSaveError('Finish the pending excuse form before starting another.');
        return;
      }
      setExcusePending({ userId: builder.userId, attendanceId: builder.attendanceId });
      setExcuseReason(''); setExcuseNote(''); setExcuseError('');
      return;
    }
    setSavingId(builder.userId);
    setSaveError('');
    try {
      const res = builder.attendanceId
        ? await fetch(`${API_URL}/api/admin/attendance/manage/record/${builder.attendanceId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus }),
          })
        : await fetch(`${API_URL}/api/admin/attendance/manage/record`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: builder.userId, attendanceDate: dayData?.date, status: newStatus }),
          });
      if (!res.ok) throw new Error(`Attendance update failed (${res.status})`);
      await onRefresh?.();
    } catch (e) {
      console.error('Attendance update failed:', e);
      setSaveError(e.message || 'Failed to update attendance');
    }
    setSavingId(null);
  };

  const handleExcuseSubmit = async () => {
    if (!excuseReason) { setExcuseError('Excuse type is required'); return; }
    const { userId } = excusePending;
    setSavingId(userId); setExcuseError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/excuses/mark-excused`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, absenceDate: dayData?.date, excuseReason, excuseDetails: excuseNote || '', staffNotes: '' }),
      });
      if (!res.ok) throw new Error(`Excuse save failed (${res.status})`);
      setExcusePending(null);
      await onRefresh?.();
    } catch (e) { console.error('Excuse failed:', e); setExcuseError(e.message || 'Failed to save'); }
    setSavingId(null);
  };

  const handleExcuseCancel = () => { setExcusePending(null); setExcuseReason(''); setExcuseNote(''); setExcuseError(''); };

  // Memoized sorted builders
  const sortedBuilders = useMemo(() => {
    if (!dayData?.builders) return [];
    
    const builders = [...dayData.builders];
    
    if (sortBy === 'status') {
      // Sort by status (present, late, excused, absent), then by name within each status
      builders.sort((a, b) => {
        const statusComparison = getStatusOrder(a.status) - getStatusOrder(b.status);
        if (statusComparison !== 0) {
          return sortDirection === 'asc' ? statusComparison : -statusComparison;
        }
        
        // If same status, sort alphabetically by name
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else {
      // Sort alphabetically by name
      builders.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return builders;
  }, [dayData?.builders, sortBy, sortDirection]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#4242EA] bg-opacity-10 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#4242EA]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {dayData?.date ? formatDate(dayData.date) : 'Loading...'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {dayData?.cohort && `${dayData.cohort} - `}
                {dayData?.dayNumber && `Day ${dayData.dayNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {saveError && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span>{saveError}</span>
            <button onClick={() => setSaveError('')} className="text-red-500 hover:text-red-700">Dismiss</button>
          </div>
        )}

        {/* Summary Stats */}
        {dayData?.summary && (
          <div className="grid grid-cols-5 gap-4 p-6 border-b border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {dayData.summary.present + dayData.summary.late}
              </p>
              <p className="text-xs text-slate-600 mt-1">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {dayData.summary.absent}
              </p>
              <p className="text-xs text-slate-600 mt-1">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {dayData.summary.excused}
              </p>
              <p className="text-xs text-slate-600 mt-1">Excused</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-600">
                {dayData.summary.pending || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-2xl font-bold text-slate-900">
                  {dayData.summary.attendanceRate}%
                </p>
              </div>
              <p className="text-xs text-slate-600 mt-1">Attendance Rate</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-600">Loading builder status...</div>
            </div>
          ) : !dayData?.builders || dayData.builders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Builders Found
              </h3>
              <p className="text-slate-600">
                No builders found for this cohort on this day.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-900 font-semibold">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-[#4242EA] transition-colors"
                        >
                          <span>Builder</span>
                          {sortBy === 'name' && (
                            sortDirection === 'asc' 
                              ? <ArrowUp className="h-4 w-4" />
                              : <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-slate-900 font-semibold">Email</TableHead>
                      <TableHead className="text-slate-900 font-semibold text-center">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-[#4242EA] transition-colors mx-auto"
                        >
                          <span>Status</span>
                          {sortBy === 'status' && (
                            sortDirection === 'asc' 
                              ? <ArrowUp className="h-4 w-4" />
                              : <ArrowDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBuilders.map((builder, index) => {
                      const isExcPending = excusePending?.userId === builder.userId;
                      const statusColors = {
                        present: 'bg-emerald-100 text-emerald-700',
                        late: 'bg-amber-100 text-amber-700',
                        absent: 'bg-red-100 text-red-700',
                        excused: 'bg-blue-100 text-blue-700',
                        pending: 'bg-slate-100 text-slate-700',
                      };
                      return (
                        <React.Fragment key={`${builder.userId}-${index}`}>
                          <TableRow className={`border-b border-slate-200 ${isExcPending ? 'bg-blue-50/50' : ''}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-900">
                                  {builder.firstName} {builder.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span className="text-sm">{builder.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {savingId === builder.userId ? (
                                <span className="text-xs text-slate-400">Saving...</span>
                              ) : (
                                <select
                                  value={isExcPending ? 'excused' : builder.status}
                                  onChange={e => handleStatusChange(builder, e.target.value)}
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${statusColors[isExcPending ? 'excused' : builder.status] || statusColors.pending}`}
                                >
                                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                              )}
                            </TableCell>
                          </TableRow>
                          {isExcPending && (
                            <TableRow className="bg-blue-50/50 border-b border-slate-200">
                              <TableCell colSpan={3}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <label className="text-[10px] font-medium text-slate-500">Type *</label>
                                  <select value={excuseReason} onChange={e => { setExcuseReason(e.target.value); setExcuseError(''); }}
                                    className={`text-xs px-2 py-1 border rounded bg-white focus:outline-none focus:border-[#4242EA] ${excuseError && !excuseReason ? 'border-red-300' : 'border-[#E3E3E3]'}`}>
                                    <option value="">Select reason...</option>
                                    {EXCUSE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                  <input type="text" value={excuseNote} onChange={e => setExcuseNote(e.target.value)} placeholder="Optional note..."
                                    className="text-xs px-2 py-1 border border-[#E3E3E3] rounded bg-white focus:outline-none focus:border-[#4242EA] flex-1 min-w-[120px]" />
                                  <button onClick={handleExcuseCancel} className="text-xs px-2.5 py-1 rounded border border-[#E3E3E3] text-slate-500 hover:bg-slate-50">Cancel</button>
                                  <button onClick={handleExcuseSubmit} className="text-xs px-2.5 py-1 rounded bg-[#4242EA] text-white hover:bg-[#3535c8]">Save</button>
                                  {excuseError && <span className="text-[10px] text-red-500">{excuseError}</span>}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Total Builders: <strong>{dayData?.builders?.length || 0}</strong>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DayBuilderStatusModal;

