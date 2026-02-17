import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  BarChart3, Plus, Trash2, Send, Power, PowerOff, Clock,
  CheckCircle2, XCircle, Mail, ChevronDown, ChevronRight, RefreshCw
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatWeekSchedule(startDay, endDay) {
  return `${DAY_NAMES[startDay].slice(0, 3)} – ${DAY_NAMES[endDay].slice(0, 3)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return '—';
  // Handle Date objects, ISO strings, and YYYY-MM-DD strings
  let ds;
  if (typeof dateValue === 'string') {
    ds = dateValue.split('T')[0];
  } else if (dateValue instanceof Date) {
    const y = dateValue.getUTCFullYear();
    const m = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateValue.getUTCDate()).padStart(2, '0');
    ds = `${y}-${m}-${d}`;
  } else {
    ds = String(dateValue).split('T')[0];
  }
  const [y, m, d] = ds.split('-').map(Number);
  if (!y || !m || !d) return '—';
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Weekly Reports Management Page
 * Admin page for managing weekly cohort report recipients and viewing send logs.
 */
function WeeklyReports() {
  const { user, token } = useAuth();
  const { canAccessPage } = usePermissions();

  // State
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCohort, setExpandedCohort] = useState(null);
  const [recipients, setRecipients] = useState({});
  const [logs, setLogs] = useState({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogCohortId, setAddDialogCohortId] = useState(null);
  const [newRecipient, setNewRecipient] = useState({ name: '', email: '' });
  const [triggerLoading, setTriggerLoading] = useState({});

  // Permission check
  const hasAccess = canAccessPage('weekly_reports');

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/configs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load report configs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRecipients = useCallback(async (cohortId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/recipients/${cohortId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecipients(prev => ({ ...prev, [cohortId]: data.data }));
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  }, [token]);

  const fetchLogs = useCallback(async (cohortId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/logs/${cohortId}?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => ({ ...prev, [cohortId]: data.data }));
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [token]);

  useEffect(() => {
    if (hasAccess) {
      fetchConfigs();
    }
  }, [hasAccess, fetchConfigs]);

  // When a cohort is expanded, load its recipients and logs
  useEffect(() => {
    if (expandedCohort) {
      fetchRecipients(expandedCohort);
      fetchLogs(expandedCohort);
    }
  }, [expandedCohort, fetchRecipients, fetchLogs]);

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleToggleEnabled = async (cohortId, currentEnabled) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/configs/${cohortId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reports ${!currentEnabled ? 'enabled' : 'disabled'}`);
        fetchConfigs();
      }
    } catch (error) {
      toast.error('Failed to toggle report status');
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/recipients`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cohortId: addDialogCohortId,
          name: newRecipient.name.trim(),
          email: newRecipient.email.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recipient added');
        setAddDialogOpen(false);
        setNewRecipient({ name: '', email: '' });
        fetchRecipients(addDialogCohortId);
        fetchConfigs(); // refresh counts
      } else {
        toast.error(data.error || 'Failed to add recipient');
      }
    } catch (error) {
      toast.error('Failed to add recipient');
    }
  };

  const handleToggleRecipient = async (recipientId, cohortId, currentActive) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/recipients/${recipientId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Recipient ${!currentActive ? 'activated' : 'deactivated'}`);
        fetchRecipients(cohortId);
        fetchConfigs();
      }
    } catch (error) {
      toast.error('Failed to update recipient');
    }
  };

  const handleRemoveRecipient = async (recipientId, cohortId) => {
    if (!window.confirm('Remove this recipient permanently?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/recipients/${recipientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recipient removed');
        fetchRecipients(cohortId);
        fetchConfigs();
      }
    } catch (error) {
      toast.error('Failed to remove recipient');
    }
  };

  const handleTriggerReport = async (cohortId, cohortName) => {
    if (!window.confirm(`Send a report now for ${cohortName}? This will email all active recipients.`)) return;

    setTriggerLoading(prev => ({ ...prev, [cohortId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/admin/weekly-reports/trigger/${cohortId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report sent for ${cohortName}`);
        fetchLogs(cohortId);
      } else {
        toast.error(data.error || 'Failed to send report');
      }
    } catch (error) {
      toast.error('Failed to trigger report');
    } finally {
      setTriggerLoading(prev => ({ ...prev, [cohortId]: false }));
    }
  };

  // ============================================================
  // ACCESS CHECK
  // ============================================================

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-proxima-bold">Access Denied</CardTitle>
            <CardDescription className="font-proxima">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-proxima flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-[#4242EA]" />
                Weekly Reports
              </h1>
              <p className="text-slate-600 mt-1 font-proxima">
                Manage weekly cohort report recipients and view send history
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Loading state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : configs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-proxima">No cohort report configs found. Run the migration to set up cohort configs.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {configs.map(config => {
              const isExpanded = expandedCohort === config.cohort_id;
              const cohortRecipients = recipients[config.cohort_id] || [];
              const cohortLogs = logs[config.cohort_id] || [];

              return (
                <Card key={config.cohort_id} className="overflow-hidden">
                  {/* Cohort Header Row */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedCohort(isExpanded ? null : config.cohort_id)}
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded
                        ? <ChevronDown className="h-5 w-5 text-slate-400" />
                        : <ChevronRight className="h-5 w-5 text-slate-400" />
                      }
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-proxima">
                          {config.cohort_name}
                        </h3>
                        <p className="text-sm text-slate-500 font-proxima">
                          Schedule: {formatWeekSchedule(config.week_start_day, config.week_end_day)}
                          {' · '}
                          {config.active_recipients_count} active recipient{config.active_recipients_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      {/* Trigger button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-proxima"
                        disabled={triggerLoading[config.cohort_id]}
                        onClick={() => handleTriggerReport(config.cohort_id, config.cohort_name)}
                      >
                        {triggerLoading[config.cohort_id]
                          ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          : <Send className="h-4 w-4 mr-1" />
                        }
                        Send Now
                      </Button>

                      {/* Toggle enabled */}
                      <Button
                        variant={config.report_enabled ? 'default' : 'outline'}
                        size="sm"
                        className={`font-proxima ${config.report_enabled ? 'bg-[#4242EA] hover:bg-[#3333d1]' : ''}`}
                        onClick={() => handleToggleEnabled(config.cohort_id, config.report_enabled)}
                      >
                        {config.report_enabled
                          ? <><Power className="h-4 w-4 mr-1" /> Enabled</>
                          : <><PowerOff className="h-4 w-4 mr-1" /> Disabled</>
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 px-6 py-6 bg-slate-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Recipients Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-slate-700 font-proxima uppercase tracking-wide flex items-center gap-2">
                              <Mail className="h-4 w-4" /> Recipients
                            </h4>
                            <Button
                              size="sm"
                              className="font-proxima bg-[#4242EA] hover:bg-[#3333d1]"
                              onClick={() => {
                                setAddDialogCohortId(config.cohort_id);
                                setAddDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          </div>

                          {cohortRecipients.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-proxima text-sm">
                              No recipients yet. Add someone to receive reports.
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50">
                                    <TableHead className="font-proxima-bold text-xs">Name</TableHead>
                                    <TableHead className="font-proxima-bold text-xs">Email</TableHead>
                                    <TableHead className="font-proxima-bold text-xs">Status</TableHead>
                                    <TableHead className="font-proxima-bold text-xs w-20">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cohortRecipients.map(r => (
                                    <TableRow key={r.recipient_id}>
                                      <TableCell className="font-proxima text-sm">{r.name}</TableCell>
                                      <TableCell className="font-proxima text-sm text-slate-500">{r.email}</TableCell>
                                      <TableCell>
                                        <Badge
                                          className={`cursor-pointer text-xs ${r.active
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                          }`}
                                          onClick={() => handleToggleRecipient(r.recipient_id, config.cohort_id, r.active)}
                                        >
                                          {r.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => handleRemoveRecipient(r.recipient_id, config.cohort_id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>

                        {/* Send History Section */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 font-proxima uppercase tracking-wide flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4" /> Recent Send History
                          </h4>

                          {cohortLogs.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-proxima text-sm">
                              No reports sent yet.
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50">
                                    <TableHead className="font-proxima-bold text-xs">Week</TableHead>
                                    <TableHead className="font-proxima-bold text-xs">Recipients</TableHead>
                                    <TableHead className="font-proxima-bold text-xs">Status</TableHead>
                                    <TableHead className="font-proxima-bold text-xs">Sent</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cohortLogs.map(log => (
                                    <TableRow key={log.log_id}>
                                      <TableCell className="font-proxima text-sm">
                                        {formatDate(log.week_start_date)} – {formatDate(log.week_end_date)}
                                      </TableCell>
                                      <TableCell className="font-proxima text-sm">{log.recipients_count}</TableCell>
                                      <TableCell>
                                        {log.status === 'sent' ? (
                                          <Badge className="bg-green-100 text-green-800 text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Sent
                                          </Badge>
                                        ) : log.status === 'failed' ? (
                                          <Badge className="bg-red-100 text-red-800 text-xs">
                                            <XCircle className="h-3 w-3 mr-1" /> Failed
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-proxima text-xs text-slate-400">
                                        {new Date(log.created_at).toLocaleString('en-US', {
                                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                        })}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Recipient Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-proxima-bold">Add Report Recipient</DialogTitle>
            <DialogDescription className="font-proxima">
              This person will receive the weekly cohort report email every Friday.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 font-proxima mb-1 block">Name</label>
              <Input
                placeholder="e.g. Jane Smith"
                value={newRecipient.name}
                onChange={e => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                className="font-proxima"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 font-proxima mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="e.g. jane@pursuit.org"
                value={newRecipient.email}
                onChange={e => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                className="font-proxima"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="font-proxima">
              Cancel
            </Button>
            <Button
              onClick={handleAddRecipient}
              className="font-proxima bg-[#4242EA] hover:bg-[#3333d1]"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Recipient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WeeklyReports;
