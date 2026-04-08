import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import {
  ChevronDown, ChevronUp, ChevronRight, AlertTriangle, CalendarCheck, ShieldCheck,
  FileText, CheckCircle, MessageSquarePlus, Plus,
} from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import BuilderLogModal from './BuilderLogModal';
import { ENROLLMENT_BADGE, ENROLLMENT_LABELS } from '../utils/sharedComponents';

const API_URL = import.meta.env.VITE_API_URL;
const ATTENDANCE_VERIFY_START = '2026-04-03';

const STATUS_OPTIONS = ['present', 'late', 'absent', 'excused'];
const STATUS_COLORS = {
  present: 'bg-emerald-100 text-emerald-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-600',
  excused: 'bg-blue-100 text-blue-700',
  pending: 'bg-slate-100 text-slate-500',
};

const FacilitatorTodos = ({ selectedDate, selectedCohortId, cohortName, onBuilderClick }) => {
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(() => localStorage.getItem('pursuit_todos_open') !== 'false');
  const [nextStepLogs, setNextStepLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logStatusSaving, setLogStatusSaving] = useState(null);
  const [logNoteInput, setLogNoteInput] = useState('');

  // Enrollment inline edit
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [savingEnrollment, setSavingEnrollment] = useState(null);
  // Log note input
  const [logNoteInputs, setLogNoteInputs] = useState({});
  const [logNoteSaving, setLogNoteSaving] = useState(null);

  // Verification drawers
  const [attendanceDrawer, setAttendanceDrawer] = useState(null); // date string or null
  const [attendanceBuilders, setAttendanceBuilders] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(null);
  const [enrollmentDrawer, setEnrollmentDrawer] = useState(false);
  const [enrollmentBuilders, setEnrollmentBuilders] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentSavingId, setEnrollmentSavingId] = useState(null);

  // Curriculum days for the cohort (to know which days need attendance verification)
  const [curriculumDates, setCurriculumDates] = useState(new Set());
  // Force re-render trigger for localStorage-based state
  const [tick, setTick] = useState(0);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    localStorage.setItem('pursuit_todos_open', String(isOpen));
  };

  // Fetch curriculum day dates for this cohort
  useEffect(() => {
    if (!token || !cohortName) return;
    fetch(`${API_URL}/api/curriculum/calendar?cohort=${encodeURIComponent(cohortName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const dates = new Set();
        (data.weeks || data || []).forEach(w => {
          (w.days || []).forEach(d => {
            const dateStr = d.day_date?.split?.('T')?.[0] || d.day_date;
            if (dateStr) dates.add(dateStr);
          });
        });
        setCurriculumDates(dates);
      })
      .catch(() => {});
  }, [token, cohortName]);

  // Fetch open logs
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLogsLoading(true);
    fetch(`${API_URL}/api/admin/dashboard/support-tickets?cohortId=${selectedCohortId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setNextStepLogs(data.data?.nextStepLogs || []); })
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [selectedCohortId, token]);

  // Unverified attendance days — only curriculum days, today only after noon ET (2h into 10am class)
  const unverifiedDays = useMemo(() => {
    if (!selectedCohortId || curriculumDates.size === 0) return [];
    const days = [];
    const start = new Date(ATTENDANCE_VERIFY_START + 'T12:00:00');
    const selected = new Date(selectedDate + 'T12:00:00');
    const todayStr = new Date().toISOString().split('T')[0];
    // Check if it's past noon ET for today's verification
    const nowET = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const pastNoonET = nowET.getHours() >= 12;

    const cursor = new Date(start);
    while (cursor <= selected) {
      const ds = cursor.toISOString().split('T')[0];
      if (curriculumDates.has(ds) && !localStorage.getItem(`attendance_verified_${selectedCohortId}_${ds}`)) {
        // For today: only show after 2h into class (noon ET)
        if (ds === todayStr && !pastNoonET) {
          // Skip — too early in the day
        } else {
          days.push(ds);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [selectedCohortId, selectedDate, tick, curriculumDates]);

  // Enrollment verification needed
  const enrollmentNeedsVerification = useMemo(() => {
    if (!selectedCohortId) return false;
    const d = new Date(selectedDate + 'T12:00:00');
    const monday = new Date(d);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return !localStorage.getItem(`enrollment_verified_${selectedCohortId}_${monday.toISOString().split('T')[0]}`);
  }, [selectedCohortId, selectedDate, tick]);

  // ── Attendance verification drawer ──
  const openAttendanceVerify = async (date) => {
    setAttendanceDrawer(date);
    setAttendanceLoading(true);
    try {
      const res = await cachedAdminApi.getCachedDayBuilderStatus(cohortName, date, token, { forceRefresh: true });
      setAttendanceBuilders(res.data?.builders || []);
    } catch { setAttendanceBuilders([]); }
    setAttendanceLoading(false);
  };

  const handleAttendanceStatusChange = async (builder, newStatus) => {
    setAttendanceSaving(builder.userId);
    try {
      if (builder.attendanceId) {
        await fetch(`${API_URL}/api/admin/attendance/manage/record/${builder.attendanceId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        });
      } else {
        await fetch(`${API_URL}/api/admin/attendance/manage/record`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: builder.userId, attendanceDate: attendanceDrawer, status: newStatus }),
        });
      }
      // Refresh list
      const res = await cachedAdminApi.getCachedDayBuilderStatus(cohortName, attendanceDrawer, token, { forceRefresh: true });
      setAttendanceBuilders(res.data?.builders || []);
    } catch (e) { console.error('Attendance update failed:', e); }
    setAttendanceSaving(null);
  };

  const confirmAttendanceVerify = () => {
    localStorage.setItem(`attendance_verified_${selectedCohortId}_${attendanceDrawer}`, new Date().toISOString());
    setAttendanceDrawer(null);
    setTick(t => t + 1);
  };

  // ── Enrollment verification drawer ──
  const openEnrollmentVerify = async () => {
    setEnrollmentDrawer(true);
    setEnrollmentLoading(true);
    try {
      const cohortObj = { cohort_id: selectedCohortId, start_date: '2024-01-01' };
      const res = await fetch(`${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=2024-01-01&endDate=2030-01-01`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEnrollmentBuilders(data.success ? (data.builders || []) : []);
    } catch { setEnrollmentBuilders([]); }
    setEnrollmentLoading(false);
  };

  const handleEnrollmentChange = async (builder, newStatus) => {
    setEnrollmentSavingId(builder.user_id);
    try {
      await fetch(`${API_URL}/api/admin/dashboard/builder-enrollment/${builder.enrollment_id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      setEnrollmentBuilders(prev => prev.map(b => b.user_id === builder.user_id ? { ...b, enrollment_status: newStatus } : b));
    } catch (e) { console.error('Enrollment update failed:', e); }
    setEnrollmentSavingId(null);
  };

  const confirmEnrollmentVerify = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    const monday = new Date(d);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    localStorage.setItem(`enrollment_verified_${selectedCohortId}_${monday.toISOString().split('T')[0]}`, new Date().toISOString());
    setEnrollmentDrawer(false);
    setTick(t => t + 1);
  };

  // ── Log status change ──
  const handleLogStatusChange = async (logId, newStatus) => {
    setLogStatusSaving(logId);
    try {
      await fetch(`${API_URL}/api/admin/dashboard/builder-logs/${logId}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      setNextStepLogs(prev => prev.map(l => l.log_id === logId ? { ...l, status: newStatus } : l).filter(l => l.status !== 'closed'));
    } catch {}
    setLogStatusSaving(null);
  };

  // ── Add note to log ──
  const handleAddLogNote = async (logId) => {
    const note = logNoteInputs[logId]?.trim();
    if (!note) return;
    setLogNoteSaving(logId);
    try {
      // Update the log's notes field by appending
      const log = nextStepLogs.find(l => l.log_id === logId);
      const updatedNotes = log?.notes ? `${log.notes}\n\n[${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}] ${note}` : `[${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}] ${note}`;
      await fetch(`${API_URL}/api/admin/dashboard/builder-logs/${logId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: updatedNotes }),
      });
      setNextStepLogs(prev => prev.map(l => l.log_id === logId ? { ...l, notes: updatedNotes } : l));
      setLogNoteInputs(prev => ({ ...prev, [logId]: '' }));
    } catch (e) { console.error('Add note failed:', e); }
    setLogNoteSaving(null);
  };

  // ── Inline enrollment from log ──
  const handleLogEnrollmentSave = async (builderId, newStatus) => {
    setSavingEnrollment(builderId);
    setEditingEnrollment(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=2024-01-01&endDate=2030-01-01`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const builder = data.builders?.find(b => b.user_id === builderId);
      if (builder?.enrollment_id) {
        await fetch(`${API_URL}/api/admin/dashboard/builder-enrollment/${builder.enrollment_id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        });
      }
    } catch (e) { console.error('Enrollment update failed:', e); }
    setSavingEnrollment(null);
  };

  const todoCount = nextStepLogs.length + unverifiedDays.length + (enrollmentNeedsVerification ? 1 : 0);

  return (
    <>
      <Collapsible open={open} onOpenChange={handleOpenChange} className="border border-[#E3E3E3] rounded-lg bg-white overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-[#4242EA]" />
            <span className="text-sm font-semibold text-[#1E1E1E]">To-Do</span>
            {todoCount > 0 && <Badge className="bg-red-100 text-red-600 text-[10px]">{todoCount}</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setShowLogModal(true); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-[#4242EA] hover:bg-[#EFEFEF] transition-colors"
              title="Add builder log"
            >
              <Plus size={11} /> Log
            </button>
            {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-[#E3E3E3] divide-y divide-[#EFEFEF]">
            {/* Attendance verification reminders */}
            {unverifiedDays.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarCheck size={12} className="text-amber-500" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Verify Attendance</span>
                </div>
                <div className="space-y-1.5">
                  {unverifiedDays.map(date => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <button onClick={() => openAttendanceVerify(date)}
                        className="flex items-center gap-1 text-[10px] font-medium text-[#4242EA] hover:underline">
                        <CheckCircle size={10} /> Review & Verify
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enrollment verification */}
            {enrollmentNeedsVerification && (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-amber-500" />
                  <span className="text-xs text-slate-600">Weekly enrollment verification</span>
                </div>
                <button onClick={openEnrollmentVerify}
                  className="flex items-center gap-1 text-[10px] font-medium text-[#4242EA] hover:underline">
                  <CheckCircle size={10} /> Review & Verify
                </button>
              </div>
            )}

            {/* Open logs with next steps */}
            {nextStepLogs.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-[#4242EA]" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Open Next Steps</span>
                  <Badge className="bg-[#EFEFEF] text-slate-600 text-[10px]">{nextStepLogs.length}</Badge>
                </div>
                <div className="space-y-1">
                  {nextStepLogs.map(log => {
                    const isExp = expandedLog === log.log_id;
                    return (
                      <div key={log.log_id} className="bg-[#FAFAFA] rounded-md overflow-hidden">
                        <button type="button" onClick={() => setExpandedLog(isExp ? null : log.log_id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#EFEFEF]/50">
                          <ChevronRight size={11} className={`text-slate-400 transition-transform ${isExp ? 'rotate-90' : ''}`} />
                          <button onClick={(e) => {
                              e.stopPropagation();
                              if (onBuilderClick) {
                                onBuilderClick({ user_id: log.builder_id, name: log.builder_name, email: log.builder_email });
                              }
                            }}
                            className="text-xs font-medium text-[#4242EA] hover:underline">{log.builder_name}</button>
                          <Badge className={`text-[10px] px-1.5 py-0 ${
                            log.log_type === 'behavioral' ? 'bg-amber-100 text-amber-700' :
                            log.log_type === 'interview' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>{log.log_type}</Badge>
                          <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0 line-clamp-1 max-w-[200px]">{log.next_steps}</span>
                        </button>
                        {isExp && (
                          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[#EFEFEF]">
                            <div>
                              <p className="text-[10px] font-semibold text-[#4242EA] uppercase mb-0.5">Next Steps</p>
                              <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.next_steps}</p>
                            </div>
                            {log.notes && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Notes</p>
                                <p className="text-xs text-slate-600 line-clamp-3">{log.notes}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">Status:</span>
                              {logStatusSaving === log.log_id ? (
                                <span className="text-[10px] text-slate-400">Saving...</span>
                              ) : (
                                <select value={log.status}
                                  onChange={e => handleLogStatusChange(log.log_id, e.target.value)}
                                  className="text-[10px] border border-[#E3E3E3] rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none">
                                  <option value="open">Open</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="closed">Closed</option>
                                </select>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <input type="text"
                                value={logNoteInputs[log.log_id] || ''}
                                onChange={e => setLogNoteInputs(prev => ({ ...prev, [log.log_id]: e.target.value }))}
                                placeholder="Add update or comment..."
                                className="flex-1 px-2 py-1 text-xs border border-[#E3E3E3] rounded bg-white focus:border-[#4242EA] focus:outline-none"
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.key === 'Enter' && handleAddLogNote(log.log_id)}
                              />
                              <button onClick={e => { e.stopPropagation(); handleAddLogNote(log.log_id); }}
                                disabled={logNoteSaving === log.log_id || !logNoteInputs[log.log_id]?.trim()}
                                className="px-2 py-1 text-xs bg-[#4242EA] text-white rounded hover:bg-[#3535c8] disabled:opacity-50 flex items-center gap-1">
                                <MessageSquarePlus size={10} />
                                {logNoteSaving === log.log_id ? '...' : 'Add'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <span>Created {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span>by {log.created_by_name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {todoCount === 0 && (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-slate-400">All caught up.</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Attendance verification drawer */}
      <Sheet open={!!attendanceDrawer} onOpenChange={o => { if (!o) setAttendanceDrawer(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E3E3E3]">
            <SheetTitle className="text-[#1E1E1E] font-semibold">Verify Attendance</SheetTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              {cohortName} — {attendanceDrawer && new Date(attendanceDrawer + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {attendanceLoading ? (
                <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
              ) : (
                <div className="divide-y divide-[#EFEFEF]">
                  {attendanceBuilders.map(b => (
                    <div key={b.userId} className="flex items-center justify-between py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1E1E1E]">{b.firstName} {b.lastName}</p>
                      </div>
                      {attendanceSaving === b.userId ? (
                        <span className="text-[10px] text-slate-400">Saving...</span>
                      ) : (
                        <select value={b.status}
                          onChange={e => handleAttendanceStatusChange(b, e.target.value)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#E3E3E3] px-5 py-3 bg-white flex items-center justify-between">
              <p className="text-xs text-slate-500">{attendanceBuilders.length} builders</p>
              <button onClick={confirmAttendanceVerify}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#4242EA] text-white rounded-md hover:bg-[#3535c8] transition-colors">
                <CheckCircle size={14} /> Confirm Verification
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Enrollment verification drawer */}
      <Sheet open={enrollmentDrawer} onOpenChange={o => { if (!o) setEnrollmentDrawer(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E3E3E3]">
            <SheetTitle className="text-[#1E1E1E] font-semibold">Verify Enrollment</SheetTitle>
            <p className="text-xs text-slate-400 mt-0.5">{cohortName}</p>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {enrollmentLoading ? (
                <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
              ) : (
                <div className="divide-y divide-[#EFEFEF]">
                  {enrollmentBuilders.map(b => (
                    <div key={b.user_id} className="flex items-center justify-between py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1E1E1E]">{b.name}</p>
                        <p className="text-[10px] text-slate-400">{b.email}</p>
                      </div>
                      {enrollmentSavingId === b.user_id ? (
                        <span className="text-[10px] text-slate-400">Saving...</span>
                      ) : (
                        <select value={b.enrollment_status || 'in_progress'}
                          onChange={e => handleEnrollmentChange(b, e.target.value)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${ENROLLMENT_BADGE[b.enrollment_status || 'in_progress']}`}>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="withdrawn">Withdrawn</option>
                          <option value="deferred">Deferred</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#E3E3E3] px-5 py-3 bg-white flex items-center justify-between">
              <p className="text-xs text-slate-500">{enrollmentBuilders.length} builders</p>
              <button onClick={confirmEnrollmentVerify}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#4242EA] text-white rounded-md hover:bg-[#3535c8] transition-colors">
                <ShieldCheck size={14} /> Confirm Verification
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <BuilderLogModal
        open={showLogModal}
        onOpenChange={setShowLogModal}
        builder={null}
        cohortId={selectedCohortId}
        onSaved={() => { setShowLogModal(false); }}
      />
    </>
  );
};

export default FacilitatorTodos;
