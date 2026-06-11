import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  ChevronRight, AlertTriangle, ArrowRight, Plus, MessageSquarePlus, Search, FileText,
  BookOpen, Flag, ThumbsUp, ThumbsDown, Minus,
} from 'lucide-react';
import BuilderLogModal from '../components/BuilderLogModal';
import BuilderDrawer from '../components/BuilderDrawer';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const LogsTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [supportTickets, setSupportTickets] = useState([]);
  const [nextStepLogs, setNextStepLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supportFilter, setSupportFilter] = useState('active');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [ticketNoteInputs, setTicketNoteInputs] = useState({});
  const [ticketNoteSaving, setTicketNoteSaving] = useState({});
  const [cohortLogs, setCohortLogs] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [builderFilter, setBuilderFilter] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState(null);

  const fetchLogs = async () => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets?cohortId=${selectedCohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSupportTickets(data.data.tickets || []);
        setNextStepLogs(data.data.nextStepLogs || []);
        setAllLogs(data.data.allLogs || []);
      }
    } catch (err) {
      console.error('Logs fetch failed:', err);
    }
    try {
      const cohortRes = await fetch(`${API_URL}/api/admin/dashboard/cohort-logs?cohortId=${selectedCohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Check .ok BEFORE reading the body. The global fetch interceptor already
      // dispatches `authError` on 401/403, but treating the response as data
      // anyway hides hard failures (5xx, network errors with non-JSON bodies)
      // from logs and from this catch — matches the .ok guard the other
      // fetches in this file use.
      if (!cohortRes.ok) {
        throw new Error(`cohort-logs fetch failed: ${cohortRes.status}`);
      }
      const cohortData = await cohortRes.json();
      if (cohortData.success) setCohortLogs(cohortData.data.logs || []);
    } catch (err) {
      console.error('Cohort logs fetch failed:', err);
      // Cohort sections simply won't render — non-critical for the page.
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCohortId, token, refreshKey]);

  const filteredTickets = useMemo(() => {
    let list = supportTickets;
    if (supportFilter !== 'all') list = list.filter(t => ['open', 'in_progress', 'follow_up'].includes(t.current_status));
    if (builderFilter) list = list.filter(t => t.builder_name?.toLowerCase().includes(builderFilter.toLowerCase()));
    return list;
  }, [supportTickets, supportFilter, builderFilter]);

  const filteredNextSteps = useMemo(() => {
    let list = nextStepLogs;
    if (supportFilter !== 'all') list = list.filter(l => l.status !== 'closed');
    if (builderFilter) list = list.filter(l => l.builder_name?.toLowerCase().includes(builderFilter.toLowerCase()));
    return list;
  }, [nextStepLogs, supportFilter, builderFilter]);

  const filteredAllLogs = useMemo(() => {
    if (!builderFilter) return allLogs;
    return allLogs.filter(l => l.builder_name?.toLowerCase().includes(builderFilter.toLowerCase()));
  }, [allLogs, builderFilter]);

  const cohortFlags       = cohortLogs.filter(l => l.flags);
  const regularCohortLogs = cohortLogs.filter(l => !l.flags);

  const totalLogs = filteredTickets.length + filteredNextSteps.length + filteredAllLogs.length + cohortLogs.length;

  const handleTicketStatusChange = async (supportId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets/${supportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchLogs();
    } catch { /* ignore */ }
  };

  const handleNextStepStatusChange = async (logId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/builder-logs/${logId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchLogs();
    } catch { /* ignore */ }
  };

  const handleTicketAddNote = async (supportId) => {
    const note = ticketNoteInputs[supportId]?.trim();
    if (!note) return;
    setTicketNoteSaving(prev => ({ ...prev, [supportId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets/${supportId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: note }),
      });
      if (res.ok) {
        setTicketNoteInputs(prev => ({ ...prev, [supportId]: '' }));
        fetchLogs();
      }
    } catch { /* ignore */ }
    setTicketNoteSaving(prev => ({ ...prev, [supportId]: false }));
  };

  const statusColors = {
    open: 'text-blue-600 bg-blue-50',
    in_progress: 'text-yellow-600 bg-yellow-50',
    follow_up: 'text-purple-600 bg-purple-50',
    accepted: 'text-green-600 bg-green-50',
    denied: 'text-red-600 bg-red-50',
    closed: 'text-slate-500 bg-slate-50',
  };

  const categoryLabels = {
    '599_extension': '599 Extension',
    'hra_training': 'HRA Training',
    'laptop_hardware': 'Laptop/Hardware',
    'time_off_personal': 'Time Off/Personal',
    'other': 'Other',
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Facilitator Logs</CardTitle>
              <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{totalLogs}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={builderFilter}
                  onChange={(e) => setBuilderFilter(e.target.value)}
                  placeholder="Filter by builder..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#E3E3E3] rounded-md bg-white focus:border-[#4242EA] focus:outline-none w-44"
                />
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#4242EA] text-white hover:bg-[#3535c8] transition-colors"
              >
                <Plus size={12} />
                Add Log
              </button>
              <div className="flex gap-1">
                {['active', 'all'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSupportFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      supportFilter === f
                        ? 'bg-[#4242EA] text-white'
                        : 'bg-white border border-[#E3E3E3] text-slate-500 hover:border-[#4242EA] hover:text-[#4242EA]'
                    }`}
                  >
                    {f === 'active' ? 'Active' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : totalLogs === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              {supportFilter === 'active' ? 'No active facilitator logs.' : 'No logs yet — add the first one.'}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Next Steps (shown first) */}
              {filteredNextSteps.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ArrowRight size={12} className="text-[#4242EA]" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Next Steps</span>
                    <Badge className="bg-blue-50 text-blue-600 text-[10px]">{filteredNextSteps.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {filteredNextSteps.map(log => {
                      const itemKey = `nextstep-${log.log_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const nextStepStatusColors = {
                        open: 'text-blue-600 bg-blue-50',
                        in_progress: 'text-yellow-600 bg-yellow-50',
                        closed: 'text-slate-500 bg-slate-50',
                      };
                      const updatedAt = log.updated_at ? new Date(log.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      return (
                        <div key={log.log_id}>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors"
                          >
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedBuilder({ user_id: log.builder_id, name: log.builder_name }); }}
                              className="text-xs font-medium text-[#4242EA] hover:underline flex-shrink-0">{log.builder_name}</button>
                            <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                              log.log_type === 'behavioral' ? 'bg-amber-100 text-amber-700'
                              : log.log_type === 'interview' ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}>{log.log_type}</Badge>
                            <span className="text-[10px] text-slate-500 flex-1 min-w-0 truncate">{log.next_steps}</span>
                            <select
                              value={log.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleNextStepStatusChange(log.log_id, e.target.value); }}
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold cursor-pointer focus:outline-none flex-shrink-0 ${nextStepStatusColors[log.status] || 'text-slate-500 bg-slate-50'}`}
                            >
                              {['open', 'in_progress', 'closed'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{updatedAt}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
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
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
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

              {/* Support Tickets */}
              {filteredTickets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Support Tickets</span>
                    <Badge className="bg-amber-50 text-amber-600 text-[10px]">{filteredTickets.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {filteredTickets.map(ticket => {
                      const itemKey = `ticket-${ticket.support_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const updatedAt = ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      return (
                        <div key={ticket.support_id}>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors"
                          >
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedBuilder({ user_id: ticket.builder_id, name: ticket.builder_name }); }}
                              className="text-xs font-medium text-[#4242EA] hover:underline flex-shrink-0">{ticket.builder_name}</button>
                            <Badge className="bg-[#EFEFEF] text-slate-600 text-[10px] flex-shrink-0">
                              {categoryLabels[ticket.support_category] || ticket.support_category}
                            </Badge>
                            <span className="text-[10px] text-slate-500 flex-1 min-w-0 truncate">{ticket.log_notes}</span>
                            <select
                              value={ticket.current_status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleTicketStatusChange(ticket.support_id, e.target.value); }}
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold cursor-pointer focus:outline-none flex-shrink-0 ${statusColors[ticket.current_status] || 'text-slate-500 bg-slate-50'}`}
                            >
                              {['open', 'in_progress', 'follow_up', 'accepted', 'denied', 'closed'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">{updatedAt}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
                              <p className="text-xs text-slate-600 line-clamp-3">{ticket.log_notes}</p>
                              {ticket.support_disclosure && (
                                <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                                  <p className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">Sensitive Details</p>
                                  <p className="text-xs text-slate-600">{ticket.support_disclosure}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
                                <span>by {ticket.created_by_name}</span>
                              </div>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={ticketNoteInputs[ticket.support_id] || ''}
                                  onChange={(e) => setTicketNoteInputs(prev => ({ ...prev, [ticket.support_id]: e.target.value }))}
                                  placeholder="Add a note or update..."
                                  className="flex-1 px-2 py-1 text-xs border border-[#E3E3E3] rounded bg-white focus:border-[#4242EA] focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.key === 'Enter' && handleTicketAddNote(ticket.support_id)}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleTicketAddNote(ticket.support_id); }}
                                  disabled={ticketNoteSaving[ticket.support_id] || !ticketNoteInputs[ticket.support_id]?.trim()}
                                  className="px-2 py-1 text-xs bg-[#4242EA] text-white rounded hover:bg-[#3535c8] disabled:opacity-50 flex items-center gap-1"
                                >
                                  <MessageSquarePlus size={11} />
                                  {ticketNoteSaving[ticket.support_id] ? '...' : 'Add'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Logs */}
              {filteredAllLogs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={12} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Other Logs</span>
                    <Badge className="bg-slate-50 text-slate-500 text-[10px]">{filteredAllLogs.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {filteredAllLogs.map(log => {
                      const itemKey = `log-${log.log_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const updatedAt = log.updated_at ? new Date(log.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      return (
                        <div key={log.log_id}>
                          <button type="button" onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors">
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedBuilder({ user_id: log.builder_id, name: log.builder_name }); }}
                              className="text-xs font-medium text-[#4242EA] hover:underline flex-shrink-0">{log.builder_name}</button>
                            <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                              log.log_type === 'behavioral' ? 'bg-amber-100 text-amber-700'
                              : log.log_type === 'interview' ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}>{log.log_type}</Badge>
                            <span className="text-[10px] text-slate-500 flex-1 min-w-0 truncate">{log.notes}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{updatedAt}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
                              {log.notes && <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.notes}</p>}
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

              {/* Cohort Logs */}
              {regularCohortLogs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen size={12} className="text-violet-500" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Cohort Logs</span>
                    <Badge className="bg-violet-50 text-violet-600 text-[10px]">{regularCohortLogs.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {regularCohortLogs.map(log => {
                      const itemKey = `cohortlog-${log.log_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const createdAt = log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      const curriculumStatusMeta = {
                        thumbs_up:       { icon: ThumbsUp,   cls: 'bg-emerald-50 text-emerald-700', label: 'Thumbs Up' },
                        thumbs_sideways: { icon: Minus,      cls: 'bg-amber-50 text-amber-700',     label: 'Neutral'   },
                        thumbs_down:     { icon: ThumbsDown, cls: 'bg-red-50 text-red-700',         label: 'Thumbs Down' },
                      };
                      const statusMeta = log.curriculum_status ? curriculumStatusMeta[log.curriculum_status] : null;
                      const categoryLabel = log.log_category === 'facilitator_feedback' ? 'Facilitator Feedback' : 'Cohort Feedback';
                      const categoryClass = log.log_category === 'facilitator_feedback' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700';
                      return (
                        <div key={log.log_id}>
                          <button type="button" onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors">
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${categoryClass}`}>{categoryLabel}</Badge>
                            {statusMeta && (
                              <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 flex items-center gap-1 ${statusMeta.cls}`}>
                                <statusMeta.icon size={10} />{statusMeta.label}
                              </Badge>
                            )}
                            <span className="text-[10px] text-slate-500 flex-1 min-w-0 truncate">
                              {log.curriculum_status_notes || log.curriculum_changes_today || log.curriculum_changes_next || '—'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{createdAt}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
                              {log.curriculum_status_notes && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Curriculum Status Notes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_status_notes}</p>
                                </div>
                              )}
                              {log.curriculum_changes_today && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Today's Changes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_changes_today}</p>
                                </div>
                              )}
                              {log.curriculum_changes_next && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Next Day's Changes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_changes_next}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
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

              {/* Cohort Flags */}
              {cohortFlags.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Flag size={12} className="text-amber-500" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Cohort Flags</span>
                    <Badge className="bg-amber-50 text-amber-600 text-[10px]">{cohortFlags.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-amber-100 border border-amber-100 rounded-md overflow-hidden">
                    {cohortFlags.map(log => {
                      const itemKey = `cohortflag-${log.log_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const createdAt = log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      const categoryLabel = log.log_category === 'facilitator_feedback' ? 'Facilitator Feedback' : 'Cohort Feedback';
                      const categoryClass = log.log_category === 'facilitator_feedback' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700';
                      return (
                        <div key={log.log_id}>
                          <button type="button" onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-amber-50/40 transition-colors">
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${categoryClass}`}>{categoryLabel}</Badge>
                            {log.action_required && (
                              <Badge className="text-[10px] px-1.5 py-0 flex-shrink-0 bg-red-50 text-red-600">Action Required</Badge>
                            )}
                            <span className="text-[10px] text-slate-500 flex-1 min-w-0 truncate">{log.flags}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{createdAt}</span>
                          </button>
                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-amber-50/30">
                              {log.curriculum_status_notes && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Curriculum Status Notes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_status_notes}</p>
                                </div>
                              )}
                              {log.curriculum_changes_today && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Today's Changes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_changes_today}</p>
                                </div>
                              )}
                              {log.curriculum_changes_next && (
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Next Day's Changes</p>
                                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.curriculum_changes_next}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">Flag Details</p>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.flags}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
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
            </div>
          )}
        </CardContent>
      </Card>

      {showLogModal && (
        <BuilderLogModal
          open={true}
          onOpenChange={(open) => { if (!open) setShowLogModal(false); }}
          builder={null}
          cohortId={selectedCohortId}
          cohorts={cohorts}
          onSaved={() => { setRefreshKey(k => k + 1); }}
        />
      )}

      {selectedBuilder && (
        <BuilderDrawer
          builder={selectedBuilder}
          startDate="2024-01-01"
          endDate={new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })}
          selectedLevel=""
          cohortId={selectedCohortId}
          onClose={() => setSelectedBuilder(null)}
          onLogSaved={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};

export default LogsTab;
