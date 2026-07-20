import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Pencil, GraduationCap, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import * as api from '../../services/coachingApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

// Render text with **bold** markdown as actual bold spans
function renderBold(text) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
    );
}

// Parse agenda text into structured numbered items with optional sub-bullets
function parseAgenda(text) {
    if (!text) return [];
    // Normalize: if AI returned a JSON array, join it
    const normalized = Array.isArray(text) ? text.join('\n') : String(text);
    const lines = normalized.split('\n');
    const items = [];
    let current = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numbered) {
            if (current) items.push(current);
            // Strip any stray ** markdown from stored data
            const title = numbered[2].replace(/\*\*/g, '');
            current = { number: numbered[1], title, subItems: [] };
        } else if (current && (line.startsWith('   ') || line.startsWith('\t'))) {
            // Strip leading a./b./c. or - prefixes; client re-renders with its own lettering
            const subText = trimmed.replace(/\*\*/g, '').replace(/^[a-z]\.\s+/, '').replace(/^-\s+/, '');
            current.subItems.push(subText);
        }
        // Skip header lines (before first numbered item)
    }
    if (current) items.push(current);
    return items;
}

// Health status badge colors
const HEALTH_COLORS = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
};

const HEALTH_LABELS = {
    green: 'On Track',
    yellow: 'Needs Attention',
    red: 'At Risk'
};

export default function PathfinderCoaching() {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff' || isAdmin;
    const navigate = useNavigate();
    const location = useLocation();

    if (isStaff) {
        const isSessionsTab = location.pathname.endsWith('/sessions');

        // Redirect bare /coaching → /coaching/dashboard
        if (!location.pathname.endsWith('/dashboard') && !location.pathname.endsWith('/sessions')) {
            return <Navigate to="/coaching/dashboard" replace />;
        }

        return (
            <div>
                <nav className="h-[45px] flex gap-0 border-b-2 border-[#e0e0e0] bg-[#f5f5f5]">
                    <button
                        onClick={() => navigate('/coaching/dashboard')}
                        className={`h-full px-4 text-sm font-semibold transition-all duration-200 border-b-[3px] flex items-center whitespace-nowrap ${
                            !isSessionsTab
                                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]'
                                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
                        }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/coaching/sessions')}
                        className={`h-full px-4 text-sm font-semibold transition-all duration-200 border-b-[3px] flex items-center whitespace-nowrap ${
                            isSessionsTab
                                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]'
                                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
                        }`}
                    >
                        My Sessions
                    </button>
                </nav>
                {isSessionsTab
                    ? <StaffCoachView token={token} user={user} />
                    : <AdminDashboard token={token} />
                }
            </div>
        );
    }

    return <BuilderView token={token} user={user} />;
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
function AdminDashboard({ token }) {
    const [health, setHealth] = useState([]);
    const [overallNps, setOverallNps] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ builder_user_id: '', coach_user_id: '' });
    const [builders, setBuilders] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);
    const [builderSearch, setBuilderSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');
    const [builderSearchFocused, setBuilderSearchFocused] = useState(false);
    const [staffSearchFocused, setStaffSearchFocused] = useState(false);
    const [selectedBuilderName, setSelectedBuilderName] = useState('');
    const [selectedStaffName, setSelectedStaffName] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [healthFilter, setHealthFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [graduateDialog, setGraduateDialog] = useState(null);
    const [reassignDialog, setReassignDialog] = useState(null);
    const [reassignSearch, setReassignSearch] = useState('');
    const [reassignSearchFocused, setReassignSearchFocused] = useState(false);
    const [reassignCoachId, setReassignCoachId] = useState('');
    const [reassignCoachName, setReassignCoachName] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const data = await api.fetchDashboard(token);
            setHealth(data.health || []);
            setOverallNps(data.nps_score ?? null);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/coaching/assignable-users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBuilders(data.builders || []);
                setStaffUsers(data.staff || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreateAssignment = async () => {
        try {
            await api.createAssignment(token, {
                builder_user_id: parseInt(newAssignment.builder_user_id),
                coach_user_id: parseInt(newAssignment.coach_user_id)
            });
            setShowAssignDialog(false);
            setNewAssignment({ builder_user_id: '', coach_user_id: '' });
            setBuilderSearch(''); setStaffSearch('');
            setSelectedBuilderName(''); setSelectedStaffName('');
            fetchData();
        } catch (err) {
            console.error('Error creating assignment:', err);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!confirm('Delete this coaching assignment? This will remove the pairing and all associated session data.')) return;
        try {
            await api.deleteAssignment(token, assignmentId);
            fetchData();
        } catch (err) {
            console.error('Error deleting assignment:', err);
        }
    };

    const handleGraduate = async () => {
        if (!graduateDialog) return;
        try {
            await api.updateAssignment(token, graduateDialog.assignment_id, { status: 'completed' });
            setGraduateDialog(null);
            fetchData();
        } catch (err) {
            console.error('Error graduating builder:', err);
        }
    };

    const handleReassign = async () => {
        if (!reassignDialog || !reassignCoachId) return;
        try {
            await api.updateAssignment(token, reassignDialog.assignment_id, { coach_user_id: parseInt(reassignCoachId) });
            setReassignDialog(null);
            setReassignCoachId('');
            setReassignCoachName('');
            setReassignSearch('');
            fetchData();
        } catch (err) {
            console.error('Error reassigning coach:', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading coaching dashboard...</div>;

    const activeHealth = health.filter(h => h.assignment_status === 'active');
    const summary = {
        total: activeHealth.length,
        green: activeHealth.filter(h => h.health_status === 'green').length,
        yellow: activeHealth.filter(h => h.health_status === 'yellow').length,
        red: activeHealth.filter(h => h.health_status === 'red').length
    };

    return (
        <div className="px-8 pb-8 pt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1E1E1E]">Coaching Dashboard</h2>
                <Button
                    onClick={() => { setShowAssignDialog(true); fetchUsers(); }}
                    className="bg-[#4242ea] hover:bg-[#3535c0] text-white"
                >
                    + Assign Coach
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                    { value: summary.total, label: 'Total Active Pairings', color: '', tip: 'Active Builder-Coach pairings' },
                    { value: overallNps != null ? overallNps : '—', label: 'Session NPS', color: overallNps != null ? (overallNps >= 50 ? 'text-green-600' : overallNps >= 0 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-300', tip: 'Net Promoter Score across all coaching sessions. Promoters (9–10) minus detractors (1–6) as a % of total responses. Ranges from −100 to +100.' },
                    { value: summary.green, label: 'On Track', color: 'text-green-600', tip: 'Session within the last 14 days, or newly paired' },
                    { value: summary.yellow, label: 'Needs Attention', color: 'text-yellow-600', tip: 'Last session was 14–21 days ago' },
                    { value: summary.red, label: 'At Risk', color: 'text-red-600', tip: 'No session in the last 21 days' },
                ].map(({ value, label, color, tip }) => (
                    <Card key={label}><CardContent className="p-4 text-center">
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-sm text-gray-500 inline-flex items-center gap-1 justify-center">
                            {label}
                            <span className="relative group cursor-help">
                                <span className="text-gray-500 text-xs leading-none">ⓘ</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[180px] rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal text-center">
                                    {tip}
                                </span>
                            </span>
                        </div>
                    </CardContent></Card>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex items-center justify-between mb-4">
                <Input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by Builder or Coach name"
                    className="max-w-sm text-sm"
                />
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setHealthFilter('all'); }}
                        className="px-3 pr-8 py-1.5 text-sm border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Graduated</option>
                    </select>
                    <select
                        value={healthFilter}
                        onChange={(e) => setHealthFilter(e.target.value)}
                        disabled={statusFilter === 'completed'}
                        className="px-3 pr-8 py-1.5 text-sm border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                    >
                        <option value="all">All Health</option>
                        <option value="green">On Track</option>
                        <option value="yellow">Needs Attention</option>
                        <option value="red">At Risk</option>
                    </select>
                </div>
            </div>

            {/* Health Table */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left text-sm text-gray-500">
                                <th className="p-3 pl-5">Builder</th>
                                <th className="p-3">Cohort</th>
                                <th className="p-3">Staff Coach</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Last Session</th>
                                <th className="p-3">Completed Sessions</th>
                                <th className="p-3">Health</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const filtered = health.filter(row => {
                                    if (statusFilter !== 'all' && row.assignment_status !== statusFilter) return false;
                                    if (healthFilter !== 'all' && row.health_status !== healthFilter) return false;
                                    if (tableSearch) {
                                        const q = tableSearch.toLowerCase();
                                        const name = `${row.builder_first_name} ${row.builder_last_name} ${row.coach_first_name} ${row.coach_last_name}`.toLowerCase();
                                        if (!name.includes(q)) return false;
                                    }
                                    return true;
                                });
                                if (health.length === 0) return (
                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">No coaching assignments yet</td></tr>
                                );
                                if (filtered.length === 0) return (
                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">No results match your filters</td></tr>
                                );
                                return filtered.map(row => {
                                    const isGraduated = row.assignment_status === 'completed';
                                    return (
                                        <tr key={row.assignment_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 pl-5 font-medium">{row.builder_first_name} {row.builder_last_name}</td>
                                            <td className="p-3 text-sm text-gray-600">{row.builder_cohort || '—'}</td>
                                            <td className="p-3 text-sm">{isGraduated ? <span className="text-gray-400">—</span> : `${row.coach_first_name} ${row.coach_last_name}`}</td>
                                            <td className="p-3">
                                                {isGraduated
                                                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">Graduated</span>
                                                    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span>
                                                }
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {row.last_session_date
                                                    ? new Date(row.last_session_date).toLocaleDateString()
                                                    : <span className="text-gray-400">No sessions</span>}
                                            </td>
                                            <td className="p-3 text-sm">{row.session_count}</td>
                                            <td className="p-3">
                                                {isGraduated
                                                    ? <span className="text-gray-400">—</span>
                                                    : <Badge className={HEALTH_COLORS[row.health_status]}>{HEALTH_LABELS[row.health_status]}</Badge>
                                                }
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    {!isGraduated && (
                                                        <button
                                                            onClick={() => { setReassignDialog(row); fetchUsers(); }}
                                                            className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-700 text-gray-400 transition-colors"
                                                            title="Reassign Coach"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {!isGraduated && (
                                                        <button
                                                            onClick={() => setGraduateDialog(row)}
                                                            className="p-1.5 rounded hover:bg-purple-50 hover:text-purple-600 text-gray-400 transition-colors"
                                                            title="Graduate Builder"
                                                        >
                                                            <GraduationCap className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Graduate Builder Dialog */}
            <Dialog open={!!graduateDialog} onOpenChange={(open) => { if (!open) setGraduateDialog(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Graduate Builder</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-9 h-9 rounded-full bg-[#4242ea]/10 text-[#4242ea] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {graduateDialog?.builder_first_name?.[0]}{graduateDialog?.builder_last_name?.[0]}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">{graduateDialog?.builder_first_name} {graduateDialog?.builder_last_name}</div>
                                <div className="text-xs text-gray-500">Coach: {graduateDialog?.coach_first_name} {graduateDialog?.coach_last_name}</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Graduating this Builder will end their active coaching relationship. They will no longer appear in the active coaching queue.
                        </p>
                        <p className="text-sm text-gray-500">
                            All session history, notes, and transcripts are preserved and remain accessible for both the Builder and Coach.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <Button
                                onClick={handleGraduate}
                                className="flex-1 bg-[#4242ea] hover:bg-[#3535c0] text-white"
                            >
                                <GraduationCap className="h-4 w-4 mr-2" /> Graduate Builder
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setGraduateDialog(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reassign Coach Dialog */}
            <Dialog open={!!reassignDialog} onOpenChange={(open) => { if (!open) { setReassignDialog(null); setReassignCoachId(''); setReassignCoachName(''); setReassignSearch(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reassign Coach</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="text-sm text-gray-600">
                            Builder: <span className="font-medium text-gray-900">{reassignDialog?.builder_first_name} {reassignDialog?.builder_last_name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Current Coach: <span className="font-medium text-gray-900">{reassignDialog?.coach_first_name} {reassignDialog?.coach_last_name}</span>
                        </div>
                        <div className="relative">
                            <label className="text-sm font-medium">New Staff Coach</label>
                            <Input
                                value={reassignCoachName || reassignSearch}
                                onChange={(e) => { setReassignSearch(e.target.value); setReassignCoachName(''); setReassignCoachId(''); }}
                                onFocus={() => setReassignSearchFocused(true)}
                                onBlur={() => setTimeout(() => setReassignSearchFocused(false), 200)}
                                placeholder="Search Staff by name or email"
                                className="mt-1 text-sm"
                            />
                            {reassignSearchFocused && reassignSearch && !reassignCoachName && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {staffUsers
                                        .filter(u => {
                                            const q = reassignSearch.toLowerCase();
                                            return !q || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                        })
                                        .slice(0, 20)
                                        .map(u => (
                                            <button
                                                key={u.user_id}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                onMouseDown={() => {
                                                    setReassignCoachId(u.user_id);
                                                    setReassignCoachName(`${u.first_name} ${u.last_name}`);
                                                    setReassignSearch('');
                                                    setReassignSearchFocused(false);
                                                }}
                                            >
                                                <span className="font-medium">{u.first_name} {u.last_name}</span>
                                                <span className="text-gray-400 ml-2">{u.email}</span>
                                            </button>
                                        ))}
                                    {staffUsers.filter(u => {
                                        const q = reassignSearch.toLowerCase();
                                        return !q || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                    }).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-400">No staff found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Session data will be preserved under the new coach.</p>
                        <Button
                            onClick={handleReassign}
                            disabled={!reassignCoachId}
                            className="w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                        >
                            Reassign
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Assign Coach Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Builder to Staff Coach</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="relative">
                            <label className="text-sm font-medium">Builder</label>
                            <Input
                                value={selectedBuilderName || builderSearch}
                                onChange={(e) => {
                                    setBuilderSearch(e.target.value);
                                    setSelectedBuilderName('');
                                    setNewAssignment(p => ({ ...p, builder_user_id: '' }));
                                }}
                                onFocus={() => setBuilderSearchFocused(true)}
                                onBlur={() => setTimeout(() => setBuilderSearchFocused(false), 200)}
                                placeholder="Search Builders by name or email"
                                className="mt-1 text-sm"
                            />
                            {builderSearchFocused && builderSearch && !selectedBuilderName && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {builders
                                        .filter(u => {
                                            const q = builderSearch.toLowerCase();
                                            return `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                        })
                                        .slice(0, 20)
                                        .map(u => (
                                            <button
                                                key={u.user_id}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                onMouseDown={() => {
                                                    setNewAssignment(p => ({ ...p, builder_user_id: u.user_id }));
                                                    setSelectedBuilderName(`${u.first_name} ${u.last_name}`);
                                                    setBuilderSearch('');
                                                    setBuilderSearchFocused(false);
                                                }}
                                            >
                                                <span className="font-medium">{u.first_name} {u.last_name}</span>
                                                <span className="text-gray-400 ml-2">{u.email}</span>
                                                {u.cohort && <span className="text-gray-400 ml-2">· {u.cohort}</span>}
                                            </button>
                                        ))}
                                    {builders.filter(u => {
                                        const q = builderSearch.toLowerCase();
                                        return `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                    }).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-400">No Builders found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <label className="text-sm font-medium">Staff Coach</label>
                            <Input
                                value={selectedStaffName || staffSearch}
                                onChange={(e) => {
                                    setStaffSearch(e.target.value);
                                    setSelectedStaffName('');
                                    setNewAssignment(p => ({ ...p, coach_user_id: '' }));
                                }}
                                onFocus={() => setStaffSearchFocused(true)}
                                onBlur={() => setTimeout(() => setStaffSearchFocused(false), 200)}
                                placeholder="Search Staff by name or email"
                                className="mt-1 text-sm"
                            />
                            {staffSearchFocused && staffSearch && !selectedStaffName && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {staffUsers
                                        .filter(u => {
                                            const q = staffSearch.toLowerCase();
                                            return `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                        })
                                        .slice(0, 20)
                                        .map(u => (
                                            <button
                                                key={u.user_id}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                onMouseDown={() => {
                                                    setNewAssignment(p => ({ ...p, coach_user_id: u.user_id }));
                                                    setSelectedStaffName(`${u.first_name} ${u.last_name}`);
                                                    setStaffSearch('');
                                                    setStaffSearchFocused(false);
                                                }}
                                            >
                                                <span className="font-medium">{u.first_name} {u.last_name}</span>
                                                <span className="text-gray-400 ml-2">{u.email}</span>
                                            </button>
                                        ))}
                                    {staffUsers.filter(u => {
                                        const q = staffSearch.toLowerCase();
                                        return `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q);
                                    }).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-400">No Staff found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleCreateAssignment}
                            disabled={!newAssignment.builder_user_id || !newAssignment.coach_user_id}
                            className="w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                        >
                            Create Assignment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ============================================================================
// STAFF COACH VIEW
// ============================================================================
function StaffCoachView({ token, user }) {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const selectedAssignmentRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleRecurrence, setScheduleRecurrence] = useState('');
    const [editSessionDialog, setEditSessionDialog] = useState(null);
    const [editSessionDate, setEditSessionDate] = useState('');
    const [deleteSessionDialog, setDeleteSessionDialog] = useState(null);
    const [showCompleteConfirmDialog, setShowCompleteConfirmDialog] = useState(false);
    const [transcriptText, setTranscriptText] = useState('');
    const [facilitatorNote, setFacilitatorNote] = useState('');
    const [enginePrep, setEnginePrep] = useState(null);
    const [generatingPrep, setGeneratingPrep] = useState(false);
    const [prepError, setPrepError] = useState(null);
    const [expandedPastSession, setExpandedPastSession] = useState(null);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [logText, setLogText] = useState('');
    const [editingLogNoteIds, setEditingLogNoteIds] = useState([]);
    const [pastSessionPage, setPastSessionPage] = useState(0);
    const [expandedPreWork, setExpandedPreWork] = useState(false);
    const [expandedAgenda, setExpandedAgenda] = useState(false);
    const [expandedCompletedLogs, setExpandedCompletedLogs] = useState(false);
    const [expandedCompletedTranscript, setExpandedCompletedTranscript] = useState(false);
    const [assignmentNps, setAssignmentNps] = useState(null);

    const fetchAssignments = useCallback(async () => {
        try {
            const data = await api.fetchAssignments(token, true);
            setAssignments(data);
            if (data.length > 0 && !selectedAssignmentRef.current) {
                setSelectedAssignment(data[0]);
                selectedAssignmentRef.current = data[0];
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchSessions = useCallback(async (assignmentId) => {
        try {
            const data = await api.fetchSessionsByAssignment(token, assignmentId, 100);
            setSessions(data);
        } catch (err) {
            console.error('Error fetching sessions:', err);
        }
    }, [token]);

    const fetchSessionDetail = useCallback(async (sessionId) => {
        try {
            const data = await api.fetchSession(token, sessionId);
            setSessionDetail(data);
        } catch (err) {
            console.error('Error fetching session detail:', err);
        }
    }, [token]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    useEffect(() => {
        if (selectedAssignment) {
            fetchSessions(selectedAssignment.id);
            setSelectedSession(null);
            setSessionDetail(null);
            setEnginePrep(null);
            setPrepError(null);
            setExpandedPastSession(null);
            setPastSessionPage(0);
            setAssignmentNps(null);
            api.fetchAssignmentStats(token, selectedAssignment.id)
                .then(stats => setAssignmentNps(stats.nps_score ?? null))
                .catch(() => {});
        }
    }, [selectedAssignment, fetchSessions, token]);

    useEffect(() => {
        if (selectedSession) {
            fetchSessionDetail(selectedSession.id);
            setExpandedPreWork(false);
            setExpandedAgenda(false);
            setExpandedCompletedLogs(false);
            setExpandedCompletedTranscript(false);
        }
    }, [selectedSession, fetchSessionDetail]);

    const handleScheduleSession = async () => {
        if (!selectedAssignment || !scheduleDate) return;
        try {
            await api.createSession(token, {
                assignment_id: selectedAssignment.id,
                session_date: scheduleDate
            });

            // Auto-create recurring sessions up to 2 months out
            if (scheduleRecurrence) {
                const intervalDays = scheduleRecurrence === 'weekly' ? 7 : 14;
                const twoMonthsOut = new Date(scheduleDate);
                twoMonthsOut.setMonth(twoMonthsOut.getMonth() + 2);

                const recurringPromises = [];
                let nextDate = new Date(scheduleDate);
                nextDate.setDate(nextDate.getDate() + intervalDays);
                while (nextDate <= twoMonthsOut) {
                    recurringPromises.push(api.createSession(token, {
                        assignment_id: selectedAssignment.id,
                        session_date: nextDate.toISOString().split('T')[0]
                    }));
                    nextDate = new Date(nextDate);
                    nextDate.setDate(nextDate.getDate() + intervalDays);
                }
                await Promise.all(recurringPromises);
            }

            fetchSessions(selectedAssignment.id);
            setShowScheduleDialog(false);
            setScheduleDate('');
            setScheduleRecurrence('');
        } catch (err) {
            console.error('Error scheduling session:', err);
        }
    };

    const handleUpdateSessionDate = async () => {
        if (!editSessionDialog || !editSessionDate) return;
        try {
            await api.updateSession(token, editSessionDialog.id, { session_date: editSessionDate });
            fetchSessions(selectedAssignment.id);
            setEditSessionDialog(null);
            setEditSessionDate('');
        } catch (err) {
            console.error('Error updating session date:', err);
        }
    };

    const handleDeleteSession = async () => {
        if (!deleteSessionDialog) return;
        try {
            await api.deleteSession(token, deleteSessionDialog.id);
            fetchSessions(selectedAssignment.id);
            setDeleteSessionDialog(null);
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    const handleGeneratePrep = async (sessionId) => {
        setGeneratingPrep(true);
        setPrepError(null);
        try {
            const prep = await api.generatePrep(token, sessionId);
            setEnginePrep(prep);
        } catch (err) {
            console.error('Error generating prep:', err);
            setPrepError(err.message || 'Failed to generate agenda. Please try again.');
        } finally {
            setGeneratingPrep(false);
        }
    };

    const handleSaveFacilitatorNote = async (sessionId) => {
        if (!facilitatorNote.trim()) return;
        try {
            await api.createNote(token, sessionId, {
                note_type: 'facilitator_log',
                content: facilitatorNote
            });
            setFacilitatorNote('');
            fetchSessionDetail(sessionId);
        } catch (err) {
            console.error('Error saving facilitator note:', err);
        }
    };

    const handleSaveLog = async (sessionId) => {
        if (!logText.trim()) return;
        try {
            if (editingLogNoteIds.length > 0) {
                // Update the first note, delete extras
                await api.updateNote(token, sessionId, editingLogNoteIds[0], { content: logText });
                for (const id of editingLogNoteIds.slice(1)) {
                    await api.deleteNote(token, sessionId, id);
                }
            } else {
                await api.createNote(token, sessionId, {
                    note_type: 'facilitator_log',
                    content: logText
                });
            }
            setLogText('');
            setEditingLogNoteIds([]);
            setShowLogDialog(false);
            fetchSessionDetail(sessionId);
        } catch (err) {
            console.error('Error saving log:', err);
        }
    };

    const handleUploadTranscript = async (sessionId) => {
        if (!transcriptText.trim()) return;
        try {
            await api.uploadTranscript(token, sessionId, {
                transcript_text: transcriptText,
                source: 'fireflies'
            });
            setTranscriptText('');
            setShowTranscriptDialog(false);
            fetchSessionDetail(sessionId);
        } catch (err) {
            console.error('Error uploading transcript:', err);
        }
    };


    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    if (assignments.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 45px)' }}>
                <div className="text-center text-gray-400">
                    <p className="text-lg font-medium">No coaching assignments yet</p>
                    <p className="text-sm mt-2">An admin will assign Builders to you.</p>
                </div>
            </div>
        );
    }

    // Categorize sessions — in_progress is treated as upcoming (no separate "live" state)
    const upcomingSessions = sessions.filter(s => ['pre_session', 'in_progress'].includes(s.status)).sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
    const pastSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
    const nextSession = upcomingSessions[0];

    const prep = enginePrep || sessionDetail?.engine_prep;

    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 45px)' }}>
            {/* Left: Builder list */}
            <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col" style={{ minHeight: 'calc(100vh - 45px)' }}>
                <div className="p-3 pt-3 flex-1">
                    {/* Active Builders — currently assigned to this coach */}
                    {assignments.filter(a => a.status === 'active' && a.previous_coach_user_id !== user?.user_id).length > 0 && (
                        <>
                            <div className="px-2 pb-1 pt-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Builders</div>
                            <div className="space-y-1 mb-4 mt-1">
                                {assignments.filter(a => a.status === 'active' && a.previous_coach_user_id !== user?.user_id).map(a => {
                                    const isSelected = selectedAssignment?.id === a.id;
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => { setSelectedAssignment(a); selectedAssignmentRef.current = a; }}
                                            className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                                                isSelected ? 'bg-[#4242ea] text-white shadow-sm' : 'hover:bg-gray-50 text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                                    isSelected ? 'bg-white/20 text-white' : 'bg-[#4242ea]/10 text-[#4242ea]'
                                                }`}>
                                                    {a.builder_first_name?.[0]}{a.builder_last_name?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm truncate">{a.builder_first_name} {a.builder_last_name}</div>
                                                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                                        {a.session_count} session{a.session_count !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Past Builders — graduated or reassigned to another coach */}
                    {assignments.filter(a => a.status !== 'active' || a.previous_coach_user_id === user?.user_id).length > 0 && (
                        <>
                            <div className="px-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Past Builders</div>
                            <div className="space-y-1 mt-1">
                                {assignments.filter(a => a.status !== 'active' || a.previous_coach_user_id === user?.user_id).map(a => {
                                    const isSelected = selectedAssignment?.id === a.id;
                                    const isReassigned = a.previous_coach_user_id === user?.user_id && a.status === 'active';
                                    const sublabel = isReassigned
                                        ? `${a.session_count} session${a.session_count !== 1 ? 's' : ''} · Reassigned`
                                        : `${a.session_count} session${a.session_count !== 1 ? 's' : ''} · Graduated`;
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => { setSelectedAssignment(a); selectedAssignmentRef.current = a; }}
                                            className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                                                isSelected ? 'bg-gray-600 text-white shadow-sm' : 'hover:bg-gray-50 text-gray-500'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {a.builder_first_name?.[0]}{a.builder_last_name?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm truncate">{a.builder_first_name} {a.builder_last_name}</div>
                                                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                                        {sublabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Main content */}
            <div className="flex-1 overflow-y-auto">
                {selectedAssignment ? (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="border-b border-gray-200 px-8 py-4 bg-[#f5f5f5] flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#4242ea]/10 text-[#4242ea] flex items-center justify-center text-sm font-semibold">
                                        {selectedAssignment.builder_first_name?.[0]}{selectedAssignment.builder_last_name?.[0]}
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1E1E1E]">
                                        {selectedAssignment.builder_first_name} {selectedAssignment.builder_last_name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => { setSelectedSession(null); setSessionDetail(null); }}
                                        size="sm"
                                        variant="outline"
                                        className="text-xs border-gray-300 text-gray-600 hover:text-gray-900"
                                    >
                                        All Sessions
                                    </Button>
                                    {selectedAssignment.status === 'active' && (
                                        <Button
                                            onClick={() => { setShowScheduleDialog(true); setScheduleDate(''); }}
                                            size="sm"
                                            className="bg-[#4242ea] hover:bg-[#3535c0] text-white text-xs"
                                        >
                                            Schedule Session
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 px-8 py-6 overflow-y-auto">
                            {selectedSession && sessionDetail ? (
                                <div>
                                    {/* Session header bar */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm font-medium text-[#1E1E1E]">
                                                {new Date(sessionDetail.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </span>
                                            {['pre_session', 'in_progress'].includes(sessionDetail.status) && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Upcoming</span>
                                            )}
                                            {sessionDetail.status === 'completed' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Completed</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {['pre_session', 'in_progress'].includes(sessionDetail.status) && (
                                                sessionDetail.id === nextSession?.id ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setShowCompleteConfirmDialog(true)}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                                    >
                                                        Mark Session as Complete
                                                    </Button>
                                                ) : (
                                                    <div title="You can only mark the next upcoming session as complete">
                                                        <Button
                                                            size="sm"
                                                            disabled
                                                            className="bg-green-600 text-white text-xs opacity-40 cursor-not-allowed"
                                                        >
                                                            Mark Session as Complete
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* UPCOMING SESSION — two-column layout */}
                                    {['pre_session', 'in_progress'].includes(sessionDetail.status) && (
                                        <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 260px)' }}>
                                            {/* LEFT: Before session — 50% */}
                                            <div className="flex-1 pr-8">
                                                <div className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider pb-3 mb-5 border-b border-gray-100">Before session</div>
                                                <div className="space-y-6">
                                                    {/* Builder Pre-work */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Builder Pre-work</h4>
                                                        {sessionDetail.pre_inputs ? (() => {
                                                            const allRows = [['Job search updates', sessionDetail.pre_inputs.job_search_updates], ['Highlights', sessionDetail.pre_inputs.highlights], ['Priorities', sessionDetail.pre_inputs.priorities], ['Questions & blockers', sessionDetail.pre_inputs.questions_blockers]].filter(([, v]) => v);
                                                            const alwaysShow = allRows.slice(0, 1);
                                                            const collapsible = allRows.slice(1);
                                                            return (
                                                                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                                                    {alwaysShow.map(([label, value]) => (
                                                                        <div key={label} className="px-4 py-3">
                                                                            <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
                                                                            <div className="text-sm text-gray-800">{value}</div>
                                                                        </div>
                                                                    ))}
                                                                    {expandedPreWork && collapsible.map(([label, value]) => (
                                                                        <div key={label} className="px-4 py-3">
                                                                            <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
                                                                            <div className="text-sm text-gray-800">{value}</div>
                                                                        </div>
                                                                    ))}
                                                                    {collapsible.length > 0 && (
                                                                        <div className="px-4 py-2 border-t border-gray-100">
                                                                            <button onClick={() => setExpandedPreWork(v => !v)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                {expandedPreWork ? '↑ Show less' : '↓ Show more'}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })() : (
                                                            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center">
                                                                <p className="text-sm text-gray-400">Builder hasn't submitted pre-work yet</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Suggested Agenda */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Suggested Agenda</h4>
                                                        {!prep && <p className="text-xs text-gray-400 mb-3">Pulls from the Builder's pre-work, their Pathfinder and Compass activity since the last session, and notes from all prior sessions. Takes 30 seconds to generate.</p>}
                                                        {sessionDetail.id === nextSession?.id ? (
                                                            <Button
                                                                onClick={() => handleGeneratePrep(sessionDetail.id)}
                                                                disabled={generatingPrep}
                                                                variant="outline"
                                                                className="w-full mb-3 border-gray-300 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                            >
                                                                {generatingPrep ? 'Generating Suggested Agenda...' : prep ? '↻ Regenerate Suggested Agenda' : 'Generate Suggested Agenda'}
                                                            </Button>
                                                        ) : (
                                                            <div title="You can only generate an agenda for the next upcoming session">
                                                                <Button
                                                                    variant="outline"
                                                                    disabled
                                                                    className="w-full mb-3 border-gray-300 text-gray-400 opacity-40 cursor-not-allowed"
                                                                >
                                                                    Generate Suggested Agenda
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {prepError && (
                                                            <p className="text-xs text-red-500 mb-2">{prepError}</p>
                                                        )}
                                                        {prep && (
                                                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                                                {prep.context_summary && (
                                                                    <div className="px-4 py-3">
                                                                        <div className="text-xs font-medium text-gray-400 mb-1">Builder context</div>
                                                                        <div className="text-sm text-gray-800">{prep.context_summary}</div>
                                                                    </div>
                                                                )}
                                                                {prep.session_opener && (
                                                                    <div className="px-4 py-3">
                                                                        <div className="text-xs font-medium text-gray-400 mb-1">Meeting opener</div>
                                                                        <div className="text-sm text-gray-700 italic leading-relaxed">"{prep.session_opener}"</div>
                                                                    </div>
                                                                )}
                                                                {!expandedAgenda && (prep.agenda || prep.guiding_questions?.length > 0 || prep.recommendations?.length > 0) && (
                                                                    <div className="px-4 py-2">
                                                                        <button onClick={() => setExpandedAgenda(true)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                            ↓ Show full agenda
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {expandedAgenda && (
                                                                    <>
                                                                        {prep.agenda && (() => {
                                                                            const agendaItems = parseAgenda(prep.agenda);
                                                                            return agendaItems.length > 0 ? (
                                                                                <div className="px-4 py-3">
                                                                                    <div className="text-xs font-medium text-gray-400 mb-2">Suggested structure</div>
                                                                                    <ul className="space-y-2">
                                                                                        {agendaItems.map((item) => (
                                                                                            <li key={item.number}>
                                                                                                <div className="text-sm text-gray-800 flex gap-2">
                                                                                                    <span className="text-gray-300 flex-shrink-0">{item.number}.</span>
                                                                                                    <span>{renderBold(item.title)}</span>
                                                                                                </div>
                                                                                                {item.subItems.length > 0 && (
                                                                                                    <ul className="ml-5 mt-1 space-y-0.5">
                                                                                                        {item.subItems.map((sub, si) => (
                                                                                                            <li key={si} className="text-sm text-gray-500 flex gap-2">
                                                                                                                <span className="text-gray-300 flex-shrink-0">{String.fromCharCode(97 + si)}.</span>
                                                                                                                <span>{renderBold(sub)}</span>
                                                                                                            </li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                )}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="px-4 py-3">
                                                                                    <div className="text-xs font-medium text-gray-400 mb-1">Suggested structure</div>
                                                                                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{prep.agenda}</div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        {prep.guiding_questions?.length > 0 && (
                                                                            <div className="px-4 py-3">
                                                                                <div className="text-xs font-medium text-gray-400 mb-1">Guiding questions</div>
                                                                                <ul className="space-y-1.5">
                                                                                    {prep.guiding_questions.map((q, i) => (
                                                                                        <li key={i} className="text-sm text-gray-800 flex gap-2">
                                                                                            <span className="text-gray-300 flex-shrink-0">{i + 1}.</span> {q}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        {prep.recommendations?.length > 0 && (
                                                                            <div className="px-4 py-3">
                                                                                <div className="text-xs font-medium text-gray-400 mb-1">Recommended Actions for Builder</div>
                                                                                <ul className="space-y-1.5">
                                                                                    {prep.recommendations.map((r, i) => (
                                                                                        <li key={i} className="text-sm text-gray-800 flex gap-2">
                                                                                            <span className="text-gray-300 flex-shrink-0">·</span> {r}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        <div className="px-4 py-2">
                                                                            <button onClick={() => setExpandedAgenda(false)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                ↑ Show less
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vertical divider */}
                                            <div className="w-px bg-gray-200 self-stretch flex-shrink-0" />

                                            {/* RIGHT: After session — 50% */}
                                            <div className="flex-1 pl-8">
                                                <div className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider pb-3 mb-5 border-b border-gray-100">After session</div>
                                                <div className="space-y-6">
                                                    {/* Logs */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logs</h4>
                                                        <p className="text-xs text-gray-400 mt-1 mb-3 leading-relaxed">Add private notes about the Builder — optional and not visible to them.</p>
                                                        {(() => {
                                                            const logNotes = sessionDetail.notes?.filter(n => n.note_type === 'facilitator_log') || [];
                                                            const existingLogText = logNotes.map(n => n.content).join('\n\n');
                                                            const isNextSession = sessionDetail.id === nextSession?.id;
                                                            return logNotes.length > 0 ? (
                                                                <div>
                                                                    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 leading-[1.6] mb-2 overflow-hidden" style={{ maxHeight: '122px' }}>
                                                                        {existingLogText}
                                                                    </div>
                                                                    {isNextSession ? (
                                                                        <button onClick={() => { setLogText(existingLogText); setEditingLogNoteIds(logNotes.map(n => n.id)); setShowLogDialog(true); }} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">Edit</button>
                                                                    ) : (
                                                                        <span title="You can only edit logs for the next upcoming session" className="text-xs text-gray-300 font-medium cursor-not-allowed">Edit</span>
                                                                    )}
                                                                </div>
                                                            ) : isNextSession ? (
                                                                <Button
                                                                    onClick={() => { setLogText(''); setEditingLogNoteIds([]); setShowLogDialog(true); }}
                                                                    variant="outline"
                                                                    className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <span className="text-xl mr-0.5 leading-none">+</span> Add Logs
                                                                </Button>
                                                            ) : (
                                                                <div title="You can only add logs for the next upcoming session">
                                                                    <Button
                                                                        variant="outline"
                                                                        disabled
                                                                        className="w-full border-dashed border-gray-300 text-gray-400 opacity-40 cursor-not-allowed"
                                                                    >
                                                                        <span className="text-xl mr-0.5 leading-none">+</span> Add Logs
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Meeting Transcript */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meeting Transcript</h4>
                                                        <p className="text-xs text-gray-400 mt-1 mb-3 leading-relaxed">Paste the raw transcript from your meeting below. Transcripts are saved to our database and help inform future sessions. Reminder: Mute your audio when discussing personal matters so they don't appear in the transcript.</p>
                                                        {(() => {
                                                            const isNextSession = sessionDetail.id === nextSession?.id;
                                                            return sessionDetail.transcript ? (
                                                                <div>
                                                                    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 leading-[1.6] mb-2 overflow-hidden" style={{ maxHeight: '122px' }}>
                                                                        {sessionDetail.transcript.transcript_text}
                                                                    </div>
                                                                    {isNextSession ? (
                                                                        <button onClick={() => { setTranscriptText(sessionDetail.transcript.transcript_text); setShowTranscriptDialog(true); }} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">Edit</button>
                                                                    ) : (
                                                                        <span title="You can only edit the transcript for the next upcoming session" className="text-xs text-gray-300 font-medium cursor-not-allowed">Edit</span>
                                                                    )}
                                                                </div>
                                                            ) : isNextSession ? (
                                                                <Button
                                                                    onClick={() => { setTranscriptText(''); setShowTranscriptDialog(true); }}
                                                                    variant="outline"
                                                                    className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <span className="text-xl mr-0.5 leading-none">+</span> Add Transcript
                                                                </Button>
                                                            ) : (
                                                                <div title="You can only add a transcript for the next upcoming session">
                                                                    <Button
                                                                        variant="outline"
                                                                        disabled
                                                                        className="w-full border-dashed border-gray-300 text-gray-400 opacity-40 cursor-not-allowed"
                                                                    >
                                                                        <span className="text-xl mr-0.5 leading-none">+</span> Add Transcript
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* COMPLETED SESSION */}
                                    {sessionDetail.status === 'completed' && (
                                        <div>
                                            {/* Builder NPS & Feedback */}
                                            <div className="bg-white rounded-lg border border-gray-200 mb-6">
                                                <div className="px-5 py-4 border-b border-gray-100">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Builder Session Feedback</h4>
                                                    <p className="text-xs text-gray-300 mt-0.5">Submitted by the Builder after the session</p>
                                                </div>
                                                <div className="grid grid-cols-3 divide-x divide-gray-100">
                                                    <div className="px-5 py-4">
                                                        <div className="text-xs font-medium text-gray-400 mb-1">Satisfaction score</div>
                                                        {sessionDetail.feedback
                                                            ? <div className="text-2xl font-semibold text-[#1E1E1E]">{sessionDetail.feedback.nps_score}<span className="text-sm font-normal text-gray-400">/10</span></div>
                                                            : <div className="text-2xl font-semibold text-gray-300">—</div>
                                                        }
                                                    </div>
                                                    <div className="px-5 py-4">
                                                        <div className="text-xs font-medium text-gray-400 mb-1">What was helpful</div>
                                                        {sessionDetail.feedback?.what_was_helpful
                                                            ? <div className="text-sm text-gray-800">{sessionDetail.feedback.what_was_helpful}</div>
                                                            : <div className="text-sm text-gray-300 italic">No response</div>
                                                        }
                                                    </div>
                                                    <div className="px-5 py-4">
                                                        <div className="text-xs font-medium text-gray-400 mb-1">Opportunities for improvement</div>
                                                        {sessionDetail.feedback?.opportunities_for_improvement
                                                            ? <div className="text-sm text-gray-800">{sessionDetail.feedback.opportunities_for_improvement}</div>
                                                            : <div className="text-sm text-gray-300 italic">No response</div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Two-column read-only layout */}
                                            <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 380px)' }}>
                                                {/* LEFT: Before session — 50% */}
                                                <div className="flex-1 pr-8">
                                                    <div className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider pb-3 mb-5 border-b border-gray-100">Before session</div>
                                                    <div className="space-y-6">
                                                        {/* Builder Pre-work */}
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Builder Pre-work</h4>
                                                            {sessionDetail.pre_inputs ? (() => {
                                                                const allRows = [['Job search updates', sessionDetail.pre_inputs.job_search_updates], ['Highlights', sessionDetail.pre_inputs.highlights], ['Priorities', sessionDetail.pre_inputs.priorities], ['Questions & blockers', sessionDetail.pre_inputs.questions_blockers]].filter(([, v]) => v);
                                                                const alwaysShow = allRows.slice(0, 1);
                                                                const collapsible = allRows.slice(1);
                                                                return (
                                                                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                                                        {alwaysShow.map(([label, value]) => (
                                                                            <div key={label} className="px-4 py-3">
                                                                                <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
                                                                                <div className="text-sm text-gray-800">{value}</div>
                                                                            </div>
                                                                        ))}
                                                                        {expandedPreWork && collapsible.map(([label, value]) => (
                                                                            <div key={label} className="px-4 py-3">
                                                                                <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
                                                                                <div className="text-sm text-gray-800">{value}</div>
                                                                            </div>
                                                                        ))}
                                                                        {collapsible.length > 0 && (
                                                                            <div className="px-4 py-2">
                                                                                <button onClick={() => setExpandedPreWork(v => !v)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                    {expandedPreWork ? '↑ Show less' : '↓ Show more'}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })() : (
                                                                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center">
                                                                    <p className="text-sm text-gray-300">No pre-work submitted</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Suggested Agenda */}
                                                        {sessionDetail.engine_prep && (
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggested Agenda</h4>
                                                                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                                                    {sessionDetail.engine_prep.context_summary && (
                                                                        <div className="px-4 py-3">
                                                                            <div className="text-xs font-medium text-gray-400 mb-1">Builder context</div>
                                                                            <div className="text-sm text-gray-800">{sessionDetail.engine_prep.context_summary}</div>
                                                                        </div>
                                                                    )}
                                                                    {sessionDetail.engine_prep.session_opener && (
                                                                        <div className="px-4 py-3">
                                                                            <div className="text-xs font-medium text-gray-400 mb-1">Meeting opener</div>
                                                                            <div className="text-sm text-gray-700 italic leading-relaxed">"{sessionDetail.engine_prep.session_opener}"</div>
                                                                        </div>
                                                                    )}
                                                                    {!expandedAgenda && (sessionDetail.engine_prep.agenda || sessionDetail.engine_prep.guiding_questions?.length > 0) && (
                                                                        <div className="px-4 py-2">
                                                                            <button onClick={() => setExpandedAgenda(true)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                ↓ Show full agenda
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {expandedAgenda && (
                                                                        <>
                                                                            {sessionDetail.engine_prep.agenda && (() => {
                                                                                const agendaItems = parseAgenda(sessionDetail.engine_prep.agenda);
                                                                                return agendaItems.length > 0 ? (
                                                                                    <div className="px-4 py-3">
                                                                                        <div className="text-xs font-medium text-gray-400 mb-2">Suggested structure</div>
                                                                                        <ul className="space-y-2">
                                                                                            {agendaItems.map((item) => (
                                                                                                <li key={item.number}>
                                                                                                    <div className="text-sm text-gray-800 flex gap-2">
                                                                                                        <span className="text-gray-300 flex-shrink-0">{item.number}.</span>
                                                                                                        <span>{renderBold(item.title)}</span>
                                                                                                    </div>
                                                                                                    {item.subItems.length > 0 && (
                                                                                                        <ul className="ml-5 mt-1 space-y-0.5">
                                                                                                            {item.subItems.map((sub, si) => (
                                                                                                                <li key={si} className="text-sm text-gray-500 flex gap-2">
                                                                                                                    <span className="text-gray-300 flex-shrink-0">{String.fromCharCode(97 + si)}.</span>
                                                                                                                    <span>{renderBold(sub)}</span>
                                                                                                                </li>
                                                                                                            ))}
                                                                                                        </ul>
                                                                                                    )}
                                                                                                </li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="px-4 py-3">
                                                                                        <div className="text-xs font-medium text-gray-400 mb-1">Suggested structure</div>
                                                                                        <div className="text-sm text-gray-800 whitespace-pre-wrap">{sessionDetail.engine_prep.agenda}</div>
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                            {sessionDetail.engine_prep.guiding_questions?.length > 0 && (
                                                                                <div className="px-4 py-3">
                                                                                    <div className="text-xs font-medium text-gray-400 mb-1">Guiding questions</div>
                                                                                    <ul className="space-y-1.5">
                                                                                        {sessionDetail.engine_prep.guiding_questions.map((q, i) => (
                                                                                            <li key={i} className="text-sm text-gray-800 flex gap-2">
                                                                                                <span className="text-gray-300 flex-shrink-0">{i + 1}.</span> {q}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                            <div className="px-4 py-2">
                                                                                <button onClick={() => setExpandedAgenda(false)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                    ↑ Show less
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Vertical divider */}
                                                <div className="w-px bg-gray-200 self-stretch flex-shrink-0" />

                                                {/* RIGHT: After session — 50% */}
                                                <div className="flex-1 pl-8">
                                                    <div className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider pb-3 mb-5 border-b border-gray-100">After session</div>
                                                    <div className="space-y-6">
                                                        {/* Logs */}
                                                        {(() => {
                                                            const logNotes = sessionDetail.notes?.filter(n => n.note_type === 'facilitator_log') || [];
                                                            const combinedLog = logNotes.map(n => n.content).join('\n\n');
                                                            return (
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Logs <span className="normal-case font-normal text-gray-300 ml-1">· private</span></h4>
                                                                    {logNotes.length > 0 ? (
                                                                        <div className="bg-white rounded-lg border border-gray-200">
                                                                            <div className="px-4 py-3 text-sm text-gray-700 leading-[1.6] overflow-hidden" style={expandedCompletedLogs ? {} : { maxHeight: '122px' }}>
                                                                                {combinedLog}
                                                                            </div>
                                                                            <div className="px-4 py-2 border-t border-gray-100 mt-2">
                                                                                <button onClick={() => setExpandedCompletedLogs(v => !v)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                                    {expandedCompletedLogs ? '↑ Show less' : '↓ Show more'}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center">
                                                                            <p className="text-sm text-gray-300">No logs added</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Meeting Transcript */}
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Meeting Transcript</h4>
                                                            {sessionDetail.transcript ? (
                                                                <div className="bg-white rounded-lg border border-gray-200">
                                                                    <div className="px-4 py-3 text-sm text-gray-600 leading-[1.6] overflow-hidden" style={expandedCompletedTranscript ? {} : { maxHeight: '122px' }}>
                                                                        {sessionDetail.transcript.transcript_text}
                                                                    </div>
                                                                    <div className="px-4 py-2 border-t border-gray-100 mt-2">
                                                                        <button onClick={() => setExpandedCompletedTranscript(v => !v)} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                                            {expandedCompletedTranscript ? '↑ Show less' : '↓ Show more'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-4 text-center">
                                                                    <p className="text-sm text-gray-300">No transcript added</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* No session selected — All Sessions view */
                                <>
                                    {sessions.length === 0 ? (
                                        <div className="flex items-center justify-center h-full min-h-[400px]">
                                            <div className="text-center">
                                                <p className="text-gray-400 text-base font-medium mb-2">No sessions scheduled yet</p>
                                                {selectedAssignment.status === 'active' ? (
                                                    <>
                                                        <p className="text-gray-300 text-sm mb-6">Schedule your first session with this Builder.</p>
                                                        <Button
                                                            onClick={() => { setShowScheduleDialog(true); setScheduleDate(''); }}
                                                            className="bg-[#4242ea] hover:bg-[#3535c0] text-white"
                                                        >
                                                            + Schedule First Session
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-300 text-sm">No sessions were recorded for this builder.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Stats cards */}
                                            {(() => {
                                                const sortedCompleted = [...pastSessions].sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
                                                let avgCadence = null;
                                                if (sortedCompleted.length >= 2) {
                                                    let totalDays = 0;
                                                    for (let i = 1; i < sortedCompleted.length; i++) {
                                                        totalDays += (new Date(sortedCompleted[i].session_date) - new Date(sortedCompleted[i - 1].session_date)) / (1000 * 60 * 60 * 24);
                                                    }
                                                    avgCadence = Math.round(totalDays / (sortedCompleted.length - 1));
                                                }
                                                return (
                                                    <div className="flex gap-4 mb-8">
                                                        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex-1">
                                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Completed Sessions</div>
                                                            <div className="text-2xl font-semibold text-[#1E1E1E]">{pastSessions.length}</div>
                                                        </div>
                                                        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex-1">
                                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                                                                Average Session NPS
                                                                <span className="relative group cursor-help">
                                                                    <span className="text-gray-400 text-xs leading-none">ⓘ</span>
                                                                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-max max-w-[200px] rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal text-center font-normal normal-case tracking-normal">
                                                                        Net Promoter Score for this Builder's sessions. Promoters (9–10) minus detractors (1–6) as a % of total responses. Ranges from −100 to +100.
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className={`text-2xl font-semibold ${assignmentNps != null ? (assignmentNps >= 50 ? 'text-green-600' : assignmentNps >= 0 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-300'}`}>
                                                                {assignmentNps != null ? assignmentNps : '—'}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex-1">
                                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                                                                Average Meeting Cadence
                                                                <span className="relative group cursor-help">
                                                                    <span className="text-gray-400 text-xs leading-none">ⓘ</span>
                                                                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-max max-w-[200px] rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal text-center font-normal normal-case tracking-normal">
                                                                        Average number of days between completed sessions with this Builder.
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="text-2xl font-semibold text-[#1E1E1E]">
                                                                {avgCadence ? <>{avgCadence}<span className="text-sm font-normal text-gray-400"> days</span></> : <span className="text-gray-300">—</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Two-table layout */}
                                            <div className="flex gap-8">
                                                {/* Upcoming sessions — hidden for graduated/past builders */}
                                                {selectedAssignment.status === 'active' && <div className="flex-1">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming Sessions</h4>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="text-xs text-gray-400 border-b border-gray-200">
                                                                <th className="text-left font-medium pb-2">Date</th>
                                                                <th className="text-right font-medium pb-2">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(() => {
                                                                const twoMonthsOut = new Date();
                                                                twoMonthsOut.setMonth(twoMonthsOut.getMonth() + 2);
                                                                const filtered = upcomingSessions.filter(s => new Date(s.session_date) <= twoMonthsOut).slice(0, 10);
                                                                if (filtered.length === 0) {
                                                                    return <tr><td colSpan={2} className="py-6 text-sm text-gray-300 text-center">No upcoming sessions</td></tr>;
                                                                }
                                                                return filtered.map(s => (
                                                                    <tr key={s.id} className="border-b border-gray-50 group">
                                                                        <td className="py-3">
                                                                            <button
                                                                                onClick={() => setSelectedSession(s)}
                                                                                className="text-sm text-[#4242ea] hover:text-[#3535c0] hover:underline font-medium text-left"
                                                                            >
                                                                                {new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                            </button>
                                                                        </td>
                                                                        <td className="py-3 text-right">
                                                                            <div className="flex items-center justify-end gap-1">
                                                                                <button
                                                                                    onClick={() => { setEditSessionDialog(s); setEditSessionDate(s.session_date?.split('T')[0] || ''); }}
                                                                                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                                                    title="Reschedule"
                                                                                >
                                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setDeleteSessionDialog(s)}
                                                                                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                                                    title="Delete session"
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ));
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>}

                                                {/* Past sessions */}
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Completed Sessions</h4>
                                                    {(() => {
                                                        const PAGE_SIZE = 10;
                                                        const totalPages = Math.ceil(pastSessions.length / PAGE_SIZE);
                                                        const paginated = pastSessions.slice(pastSessionPage * PAGE_SIZE, (pastSessionPage + 1) * PAGE_SIZE);
                                                        return (
                                                            <>
                                                                <table className="w-full">
                                                                    <thead>
                                                                        <tr className="text-xs text-gray-400 border-b border-gray-200">
                                                                            <th className="text-left font-medium pb-2">Date</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {pastSessions.length === 0 ? (
                                                                            <tr><td className="py-6 text-sm text-gray-300 text-center">No past sessions yet</td></tr>
                                                                        ) : paginated.map(s => (
                                                                            <tr key={s.id} className="border-b border-gray-50">
                                                                                <td className="py-3">
                                                                                    <button
                                                                                        onClick={() => setSelectedSession(s)}
                                                                                        className="text-sm text-[#4242ea] hover:text-[#3535c0] hover:underline font-medium text-left"
                                                                                    >
                                                                                        {new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                {totalPages > 1 && (
                                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                                        <button
                                                                            onClick={() => setPastSessionPage(p => Math.max(0, p - 1))}
                                                                            disabled={pastSessionPage === 0}
                                                                            className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed px-2 py-1"
                                                                        >
                                                                            ← Prev
                                                                        </button>
                                                                        <span className="text-xs text-gray-400">
                                                                            {pastSessionPage + 1} / {totalPages}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => setPastSessionPage(p => Math.min(totalPages - 1, p + 1))}
                                                                            disabled={pastSessionPage === totalPages - 1}
                                                                            className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed px-2 py-1"
                                                                        >
                                                                            Next →
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">Select a Builder</p>
                    </div>
                )}
            </div>


            {/* Schedule Session Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Session Date</label>
                            <Input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="mt-1"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Recurring <span className="font-normal text-gray-400">(optional)</span></label>
                            <div className="mt-2 flex gap-2">
                                {[
                                    { value: 'weekly', label: 'Every week' },
                                    { value: 'biweekly', label: 'Every two weeks' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setScheduleRecurrence(r => r === opt.value ? '' : opt.value)}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                            scheduleRecurrence === opt.value
                                                ? 'bg-[#4242ea] text-white border-[#4242ea]'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-[#4242ea] hover:text-[#4242ea]'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={handleScheduleSession}
                            disabled={!scheduleDate}
                            className="w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                        >
                            Schedule
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Meeting Transcript Dialog */}
            <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add meeting transcript</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 mt-1">Paste the raw transcript from your Fireflies recording. Transcripts are saved to our database. Reminder: Mute your audio when discussing personal matters so they don't appear in the transcript.</p>
                    <Textarea
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        placeholder="Paste raw transcript here..."
                        rows={10}
                        className="mt-1"
                    />
                    <Button
                        onClick={() => handleUploadTranscript(sessionDetail?.id)}
                        disabled={!transcriptText.trim()}
                        className="mt-4 w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                    >
                        Save
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Log Dialog */}
            <Dialog open={showLogDialog} onOpenChange={(open) => { setShowLogDialog(open); if (!open) { setLogText(''); setEditingLogNoteIds([]); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add logs</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 mt-1">Add private notes about the Builder — optional and not visible to them.</p>
                    <Textarea
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        placeholder="Add notes about Builder..."
                        rows={10}
                        className="mt-1"
                    />
                    <Button
                        onClick={() => handleSaveLog(sessionDetail?.id)}
                        disabled={!logText.trim()}
                        className="mt-4 w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                    >
                        Save
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Edit Session Date Dialog */}
            <Dialog open={!!editSessionDialog} onOpenChange={(open) => { if (!open) { setEditSessionDialog(null); setEditSessionDate(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">New Date</label>
                            <Input
                                type="date"
                                value={editSessionDate}
                                onChange={(e) => setEditSessionDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <Button
                            onClick={handleUpdateSessionDate}
                            disabled={!editSessionDate}
                            className="w-full bg-[#4242ea] hover:bg-[#3535c0] text-white"
                        >
                            Save New Date
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Mark Session as Complete Confirmation Dialog */}
            <Dialog open={showCompleteConfirmDialog} onOpenChange={setShowCompleteConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Session as Complete?</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 space-y-3">
                        <p className="text-sm text-gray-600">Once marked complete, session data is saved and cannot be edited. Make sure all notes and transcripts have been added before continuing.</p>
                        <p className="text-sm text-gray-500">You can still view all session data from the All Sessions page.</p>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <Button
                            variant="outline"
                            onClick={() => setShowCompleteConfirmDialog(false)}
                            className="flex-1 border-gray-300"
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={async () => {
                                await api.updateSessionStatus(token, sessionDetail.id, 'completed');
                                setShowCompleteConfirmDialog(false);
                                fetchSessionDetail(sessionDetail.id);
                                fetchSessions(selectedAssignment.id);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Mark as Complete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Session Dialog */}
            <Dialog open={!!deleteSessionDialog} onOpenChange={(open) => { if (!open) setDeleteSessionDialog(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Session</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete the session on{' '}
                            <span className="font-medium text-[#1E1E1E]">
                                {deleteSessionDialog && new Date(deleteSessionDialog.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteSessionDialog(null)}
                                className="flex-1 border-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSession}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Session
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ============================================================================
// BUILDER VIEW
// ============================================================================
function BuilderView({ token, user }) {
    const [assignment, setAssignment] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreWorkDialog, setShowPreWorkDialog] = useState(false);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [showActionItemsDialog, setShowActionItemsDialog] = useState(false);
    const [preInputs, setPreInputs] = useState({ job_search_updates: '', highlights: '', priorities: '', questions_blockers: '' });
    const [noteContent, setNoteContent] = useState('');
    const noteTextareaRef = useRef(null);

    // Bullet chars by indent level (0, 1, 2+)
    const BULLET_CHARS = ['▪', '▪', '▪'];
    const getBulletChar = (indentSpaces) => BULLET_CHARS[Math.min(Math.floor(indentSpaces / 2), BULLET_CHARS.length - 1)];

    const handleNotesKeyDown = (e) => {
        const el = e.target;
        const start = el.selectionStart;
        const value = noteContent;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineContent = value.substring(lineStart, start);

        if (e.key === 'Tab') {
            e.preventDefault();
            const bulletMatch = lineContent.match(/^( *)(•|◦|▪) /);
            if (bulletMatch) {
                const currentIndent = bulletMatch[1].length;
                if (e.shiftKey) {
                    // Unindent: remove 2 spaces
                    if (currentIndent >= 2) {
                        const newIndent = currentIndent - 2;
                        const newBullet = getBulletChar(newIndent);
                        const rest = lineContent.substring(bulletMatch[0].length);
                        const newLine = ' '.repeat(newIndent) + newBullet + ' ' + rest;
                        const newValue = value.substring(0, lineStart) + newLine + value.substring(start);
                        setNoteContent(newValue);
                        requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start - 2; });
                    }
                } else {
                    // Indent: add 2 spaces, update bullet char
                    const newIndent = currentIndent + 2;
                    const newBullet = getBulletChar(newIndent);
                    const rest = lineContent.substring(bulletMatch[0].length);
                    const newLine = ' '.repeat(newIndent) + newBullet + ' ' + rest;
                    const newValue = value.substring(0, lineStart) + newLine + value.substring(start);
                    setNoteContent(newValue);
                    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start + 2; });
                }
            } else {
                // Not a bullet line — insert 2 spaces
                const newValue = value.substring(0, start) + '  ' + value.substring(start);
                setNoteContent(newValue);
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
            }
        } else if (e.key === 'Enter') {
            const bulletMatch = lineContent.match(/^( *)(•|◦|▪) (.*)$/);
            if (bulletMatch) {
                const [, indent, , text] = bulletMatch;
                e.preventDefault();
                if (!text.trim()) {
                    // Empty bullet → exit bullet mode (remove bullet, just newline)
                    const newValue = value.substring(0, lineStart) + '\n' + value.substring(start);
                    setNoteContent(newValue);
                    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = lineStart + 1; });
                } else {
                    // Continue bullet at same indent level
                    const bullet = getBulletChar(indent.length);
                    const continuation = '\n' + indent + bullet + ' ';
                    const newValue = value.substring(0, start) + continuation + value.substring(start);
                    setNoteContent(newValue);
                    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + continuation.length; });
                }
            }
        } else if (e.key === ' ' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            // Auto-convert "- " at line start to "• " (keydown fires before space is inserted)
            const dashMatch = lineContent.match(/^( *)-$/);
            if (dashMatch) {
                e.preventDefault();
                const indent = dashMatch[1];
                const bullet = getBulletChar(indent.length);
                const newLine = indent + bullet + ' ';
                const newValue = value.substring(0, lineStart) + newLine + value.substring(start);
                setNoteContent(newValue);
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = lineStart + newLine.length; });
            }
        }
    };

    const [actionItemLines, setActionItemLines] = useState([]);
    const [actionItemInput, setActionItemInput] = useState('');
    const [savingPreWork, setSavingPreWork] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [savingActionItems, setSavingActionItems] = useState(false);
    const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);
    const [feedbackNps, setFeedbackNps] = useState(null);
    const [feedbackHelpful, setFeedbackHelpful] = useState('');
    const [feedbackOpportunities, setFeedbackOpportunities] = useState('');
    const [savingFeedback, setSavingFeedback] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const assignments = await api.fetchAssignments(token);
            if (assignments.length > 0) {
                // Use the first (active) assignment for header info (coach name, etc.)
                setAssignment(assignments[0]);
                // Load sessions from ALL assignments and combine them
                const sessionArrays = await Promise.all(
                    assignments.map(a => api.fetchSessionsByAssignment(token, a.id, 100))
                );
                const allSessions = sessionArrays.flat();
                // Deduplicate by id in case of any overlap
                const unique = Object.values(
                    Object.fromEntries(allSessions.map(s => [s.id, s]))
                );
                setSessions(unique);
            }
        } catch (err) {
            console.error('Error fetching coaching data:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchSessionDetail = useCallback(async (sessionId) => {
        try {
            const data = await api.fetchSession(token, sessionId);
            setSessionDetail(data);
        } catch (err) {
            console.error('Error fetching session detail:', err);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Categorize sessions
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const upcomingSessions = sessions
        .filter(s => s.status !== 'completed' && s.session_date >= today)
        .sort((a, b) => a.session_date.localeCompare(b.session_date));
    const pastSessions = sessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => b.session_date.localeCompare(a.session_date));
    // The active session is either in_progress or the closest upcoming
    const activeSession = sessions.find(s => s.status === 'in_progress') || upcomingSessions[0] || null;
    // Builder can only add pre-work to the next upcoming (closest) session
    const isNextSession = selectedSession && activeSession && selectedSession.id === activeSession.id;

    // Auto-select active session on load
    useEffect(() => {
        if (sessions.length > 0 && !selectedSession) {
            setSelectedSession(activeSession);
        }
    }, [sessions]);

    useEffect(() => {
        if (selectedSession) {
            fetchSessionDetail(selectedSession.id);
            setFeedbackNps(null);
            setFeedbackHelpful('');
            setFeedbackOpportunities('');
        }
    }, [selectedSession, fetchSessionDetail]);

    const isEditable = sessionDetail?.status !== 'completed';

    const openPreWorkDialog = () => {
        setPreInputs({ job_search_updates: '', highlights: '', priorities: '', questions_blockers: '' });
        setAcknowledgeChecked(false);
        setShowPreWorkDialog(true);
    };

    const openNotesDialog = () => {
        const existing = sessionDetail?.notes?.find(n => n.note_type === 'shared_notes' && n.author_user_id === (user?.user_id ?? user?.userId));
        setNoteContent(existing?.content || '');
        setShowNotesDialog(true);
    };

    const openActionItemsDialog = () => {
        const existing = (sessionDetail?.notes || [])
            .filter(n => n.note_type === 'shared_action_item')
            .map(n => ({ id: n.id, content: n.content, deleted: false }));
        setActionItemLines(existing);
        setActionItemInput('');
        setShowActionItemsDialog(true);
    };

    const handleSavePreWork = async () => {
        setSavingPreWork(true);
        try {
            await api.submitPreInputs(token, sessionDetail.id, preInputs);
            setShowPreWorkDialog(false);
            fetchSessionDetail(sessionDetail.id);
        } catch (err) {
            console.error('Error saving pre-work:', err);
        } finally {
            setSavingPreWork(false);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            const existing = sessionDetail?.notes?.find(n => n.note_type === 'shared_notes' && n.author_user_id === (user?.user_id ?? user?.userId));
            if (existing) {
                await api.updateNote(token, sessionDetail.id, existing.id, { content: noteContent });
            } else {
                await api.createNote(token, sessionDetail.id, { note_type: 'shared_notes', content: noteContent });
            }
            setShowNotesDialog(false);
            fetchSessionDetail(sessionDetail.id);
        } catch (err) {
            console.error('Error saving notes:', err);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleSaveActionItems = async () => {
        setSavingActionItems(true);
        try {
            // Delete all existing action items first
            const existingIds = (sessionDetail?.notes || [])
                .filter(n => n.note_type === 'shared_action_item')
                .map(n => n.id);
            await Promise.all(existingIds.map(id => api.deleteNote(token, sessionDetail.id, id)));

            // Recreate in display order (skipping deleted ones), then append new input
            const ordered = [
                ...actionItemLines.filter(i => !i.deleted && i.content.trim()),
                ...(actionItemInput.trim() ? [{ content: actionItemInput.trim() }] : [])
            ];
            for (const item of ordered) {
                await api.createNote(token, sessionDetail.id, { note_type: 'shared_action_item', content: item.content.trim() });
            }

            setShowActionItemsDialog(false);
            fetchSessionDetail(sessionDetail.id);
        } catch (err) {
            console.error('Error saving action items:', err);
        } finally {
            setSavingActionItems(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackNps) return;
        setSavingFeedback(true);
        try {
            await api.submitFeedback(token, sessionDetail.id, {
                nps_score: feedbackNps,
                what_was_helpful: feedbackHelpful.trim() || undefined,
                opportunities_for_improvement: feedbackOpportunities.trim() || undefined,
            });
            fetchSessionDetail(sessionDetail.id);
        } catch (err) {
            console.error('Error submitting feedback:', err);
        } finally {
            setSavingFeedback(false);
        }
    };

    const handleActionItemKeyDown = (e) => {
        if (e.key === 'Enter' && actionItemInput.trim()) {
            e.preventDefault();
            setActionItemLines(prev => [...prev, { id: null, content: actionItemInput.trim(), deleted: false }]);
            setActionItemInput('');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your coaching...</div>;

    if (!assignment) {
        return (
            <div className="p-8 text-center text-gray-400">
                <p className="text-lg font-medium">No coaching assignment yet</p>
                <p className="text-sm mt-2">You'll be assigned a coach soon.</p>
            </div>
        );
    }

    const builderUserId = user?.user_id ?? user?.userId;
    const builderNote = sessionDetail?.notes?.filter(n => n.note_type === 'shared_notes' && n.author_user_id === builderUserId).at(-1) ?? null;
    const allActionItems = sessionDetail?.notes?.filter(n => n.note_type === 'shared_action_item') || [];

    return (
        <div className="flex" style={{ height: '100vh' }}>
            {/* Left sidebar */}
            <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 p-5 flex flex-col" style={{ height: '100%' }}>
                <div className="mb-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-[#4242ea] flex items-center justify-center text-white text-sm font-semibold">
                            {assignment.coach_first_name?.[0]}{assignment.coach_last_name?.[0]}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#1E1E1E]">{assignment.coach_first_name} {assignment.coach_last_name}</div>
                            <div className="text-xs text-gray-400">Your Coach</div>
                        </div>
                    </div>
                </div>

                {activeSession && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {activeSession.status === 'in_progress' ? 'Live Now' : 'Next Session'}
                        </h4>
                        <button
                            onClick={() => setSelectedSession(activeSession)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                selectedSession?.id === activeSession.id
                                    ? 'bg-[rgba(66,66,234,0.05)] text-[#4242ea] font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{new Date(activeSession.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                {activeSession.status === 'in_progress'
                                    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">● Live</span>
                                    : <span className="text-xs text-gray-400">Next</span>
                                }
                            </div>
                        </button>
                    </div>
                )}

                {upcomingSessions.filter(s => s.id !== activeSession?.id).length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upcoming</h4>
                        <div className="space-y-1">
                            {upcomingSessions.filter(s => s.id !== activeSession?.id).map(s => (
                                <div key={s.id} className="px-3 py-2 text-sm text-gray-500 flex items-center justify-between">
                                    <span>{new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    <span className="text-xs text-gray-400">Scheduled</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pastSessions.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Completed Sessions</h4>
                        <div className="space-y-1">
                            {pastSessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSession(s)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                        selectedSession?.id === s.id
                                            ? 'bg-[rgba(66,66,234,0.05)] text-[#4242ea] font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div>{new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                            {s.coach_first_name && (
                                                <div className={`text-xs mt-0.5 ${selectedSession?.id === s.id ? 'text-[#4242ea]/60' : 'text-gray-400'}`}>
                                                    {s.coach_first_name} {s.coach_last_name}
                                                </div>
                                            )}
                                        </div>
                                        {s.has_feedback
                                            ? <span className="text-xs text-gray-400 flex-shrink-0">View →</span>
                                            : <span className="text-xs text-[#4242ea] font-medium flex-shrink-0">Give feedback →</span>
                                        }
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {sessions.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                        <p>No sessions scheduled yet.</p>
                        <p className="text-xs mt-1">Your coach will schedule your first session.</p>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedSession && sessionDetail ? (
                    <>
                        {/* Session header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-[#1E1E1E]">
                                    {new Date(sessionDetail.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                {sessionDetail.status === 'in_progress' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">● Live</span>
                                )}
                                {sessionDetail.status === 'completed' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Completed</span>
                                )}
                            </div>
                            {sessionDetail.status === 'completed' && sessionDetail.coach_first_name && (
                                <div className="text-sm text-gray-400 mt-0.5">with {sessionDetail.coach_first_name} {sessionDetail.coach_last_name}</div>
                            )}
                        </div>

                        {/* Future session (not next) */}
                        {sessionDetail.status === 'pre_session' && !isNextSession && (
                            <div className="bg-gray-50 rounded-lg px-5 py-6 text-center text-sm text-gray-400">
                                This session is scheduled for a future date. You can add pre-work to your next session.
                            </div>
                        )}

                        {/* 3-column layout for upcoming (next), live, and completed sessions */}
                        {(sessionDetail.status !== 'pre_session' || isNextSession) && (
                            <div className="grid grid-cols-3 gap-5">

                                {/* Column 1: Pre-Work */}
                                <div className="flex flex-col">
                                    <div className="mb-3">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pre-Work</h4>
                                    </div>
                                    {sessionDetail.pre_inputs ? (
                                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                            {[
                                                ['Job search updates', sessionDetail.pre_inputs.job_search_updates],
                                                ['Highlights', sessionDetail.pre_inputs.highlights],
                                                ['Priorities', sessionDetail.pre_inputs.priorities],
                                                ['Questions & blockers', sessionDetail.pre_inputs.questions_blockers],
                                            ].filter(([, v]) => v).map(([l, v]) => (
                                                <div key={l} className="px-4 py-3">
                                                    <div className="text-xs font-medium text-gray-400 mb-1">{l}</div>
                                                    <div className="text-sm text-gray-800">{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-white rounded-lg border border-dashed border-gray-200 px-4 py-8 flex flex-col items-center justify-center text-center">
                                            <p className="text-sm text-gray-400 mb-3">Share updates with your Coach before the session</p>
                                            {isEditable && (
                                                <button onClick={openPreWorkDialog} className="text-xs font-medium text-white bg-[#4242ea] hover:bg-[#3535c0] px-3 py-1.5 rounded-md transition-colors">
                                                    Submit pre-work
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Column 2: Session Notes */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Session Notes</h4>
                                        {isEditable && builderNote && (
                                            <button onClick={openNotesDialog} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                Edit notes
                                            </button>
                                        )}
                                    </div>
                                    {builderNote ? (
                                        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{builderNote.content}</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-white rounded-lg border border-dashed border-gray-200 px-4 py-8 flex flex-col items-center justify-center text-center">
                                            <p className="text-sm text-gray-400 mb-3">Take notes about recommendations and guidance from your Coach</p>
                                            {isEditable && (sessionDetail.pre_inputs ? (
                                                <button onClick={openNotesDialog} className="text-xs font-medium text-white bg-[#4242ea] hover:bg-[#3535c0] px-3 py-1.5 rounded-md transition-colors">
                                                    Add notes
                                                </button>
                                            ) : (
                                                <div className="relative group inline-block">
                                                    <button disabled className="text-xs font-medium text-gray-300 bg-gray-100 cursor-not-allowed px-3 py-1.5 rounded-md">
                                                        Add notes
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-60 text-xs text-white bg-gray-700 rounded px-2.5 py-2 text-center z-10 pointer-events-none leading-snug">
                                                        Submit pre-work before you can add notes and action items from the session
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Column 3: Action Items */}
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Action Items</h4>
                                        {isEditable && allActionItems.length > 0 && (
                                            <button onClick={openActionItemsDialog} className="text-xs text-[#4242ea] hover:text-[#3535c0] font-medium">
                                                Edit items
                                            </button>
                                        )}
                                    </div>
                                    {allActionItems.length > 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                            {allActionItems.map(n => (
                                                <div key={n.id} className="px-4 py-3 flex items-start gap-3">
                                                    <Checkbox
                                                        checked={n.is_completed}
                                                        onCheckedChange={(checked) => {
                                                            setSessionDetail(prev => ({
                                                                ...prev,
                                                                notes: prev.notes.map(note => note.id === n.id ? { ...note, is_completed: checked } : note)
                                                            }));
                                                            api.updateNote(token, sessionDetail.id, n.id, { is_completed: checked });
                                                        }}
                                                        className="mt-0.5"
                                                    />
                                                    <span className={`text-sm leading-snug ${n.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{n.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 bg-white rounded-lg border border-dashed border-gray-200 px-4 py-8 flex flex-col items-center justify-center text-center">
                                            <p className="text-sm text-gray-400 mb-3">Log action items to follow up on after the session</p>
                                            {isEditable && (sessionDetail.pre_inputs ? (
                                                <button onClick={openActionItemsDialog} className="text-xs font-medium text-white bg-[#4242ea] hover:bg-[#3535c0] px-3 py-1.5 rounded-md transition-colors">
                                                    Add items
                                                </button>
                                            ) : (
                                                <div className="relative group inline-block">
                                                    <button disabled className="text-xs font-medium text-gray-300 bg-gray-100 cursor-not-allowed px-3 py-1.5 rounded-md">
                                                        Add items
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-60 text-xs text-white bg-gray-700 rounded px-2.5 py-2 text-center z-10 pointer-events-none leading-snug">
                                                        Submit pre-work before you can add notes and action items from the session
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Feedback section — completed sessions only */}
                        {sessionDetail.status === 'completed' && (
                            sessionDetail.feedback ? (
                                <div className="mt-5 bg-white rounded-lg border border-gray-200 px-5 py-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Feedback</h4>
                                    <div className="mb-3">
                                        <div className="text-xs font-medium text-gray-400 mb-1">How satisfied are you with this session?</div>
                                        <span className="text-sm text-gray-700">{sessionDetail.feedback.nps_score}<span className="text-sm text-gray-400">/10</span></span>
                                    </div>
                                    {sessionDetail.feedback.what_was_helpful && (
                                        <div className="mb-2">
                                            <div className="text-xs font-medium text-gray-400 mb-0.5">What was helpful</div>
                                            <p className="text-sm text-gray-700">{sessionDetail.feedback.what_was_helpful}</p>
                                        </div>
                                    )}
                                    {sessionDetail.feedback.opportunities_for_improvement && (
                                        <div>
                                            <div className="text-xs font-medium text-gray-400 mb-0.5">Opportunities for improvement</div>
                                            <p className="text-sm text-gray-700">{sessionDetail.feedback.opportunities_for_improvement}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">How was this session?</h4>
                                    <p className="text-xs text-gray-500 mb-4">Take a moment to share your feedback. It helps improve your coaching experience.</p>

                                    <div className="mb-4">
                                        <label className="text-xs font-medium text-gray-600 mb-2 block">
                                            How satisfied are you with this session? <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">Not satisfied</span>
                                            <div className="flex gap-1.5">
                                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                    <button
                                                        key={n}
                                                        onClick={() => setFeedbackNps(n)}
                                                        className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                                                            feedbackNps === n
                                                                ? 'bg-[#4242ea] text-white'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4242ea] hover:text-[#4242ea]'
                                                        }`}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">Very satisfied</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">What was helpful?</label>
                                            <Textarea
                                                value={feedbackHelpful}
                                                onChange={(e) => setFeedbackHelpful(e.target.value)}
                                                placeholder="What worked well..."
                                                rows={2}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">Opportunities for improvement?</label>
                                            <Textarea
                                                value={feedbackOpportunities}
                                                onChange={(e) => setFeedbackOpportunities(e.target.value)}
                                                placeholder="What could be better..."
                                                rows={2}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmitFeedback}
                                        disabled={!feedbackNps || savingFeedback}
                                        className="bg-[#4242ea] hover:bg-[#3535c0] text-white text-xs h-8"
                                    >
                                        {savingFeedback ? 'Submitting...' : 'Submit feedback'}
                                    </Button>
                                </div>
                            )
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">{sessions.length === 0 ? 'Waiting for your coach to schedule a session' : 'Select a session to view'}</p>
                    </div>
                )}

                {/* Pre-Work Dialog */}
                <Dialog open={showPreWorkDialog} onOpenChange={setShowPreWorkDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Pre-session questions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Job search updates <span className="text-red-400">*</span></label>
                                <Textarea value={preInputs.job_search_updates} onChange={(e) => setPreInputs(p => ({ ...p, job_search_updates: e.target.value }))} placeholder="Applications sent, interviews, offers, rejections..." rows={2} className="mt-1 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Highlights from past week <span className="text-red-400">*</span></label>
                                <Textarea value={preInputs.highlights} onChange={(e) => setPreInputs(p => ({ ...p, highlights: e.target.value }))} placeholder="What went well this week?" rows={2} className="mt-1 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Priorities for this session <span className="text-red-400">*</span></label>
                                <Textarea value={preInputs.priorities} onChange={(e) => setPreInputs(p => ({ ...p, priorities: e.target.value }))} placeholder="What do you want to focus on?" rows={2} className="mt-1 text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Questions & blockers <span className="text-red-400">*</span></label>
                                <Textarea value={preInputs.questions_blockers} onChange={(e) => setPreInputs(p => ({ ...p, questions_blockers: e.target.value }))} placeholder="Anything you need help with?" rows={2} className="mt-1 text-sm" />
                            </div>
                            <div className="flex items-start gap-2 pt-1">
                                <Checkbox id="ack" checked={acknowledgeChecked} onCheckedChange={setAcknowledgeChecked} className="mt-0.5" />
                                <label htmlFor="ack" className="text-xs text-gray-500 leading-snug cursor-pointer">
                                    I acknowledge that once I submit, this information will be sent to my Coach to prepare for the session and cannot be edited.
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowPreWorkDialog(false)}>Cancel</Button>
                            <Button
                                onClick={handleSavePreWork}
                                disabled={savingPreWork || !acknowledgeChecked || !preInputs.job_search_updates.trim() || !preInputs.highlights.trim() || !preInputs.priorities.trim() || !preInputs.questions_blockers.trim()}
                                className="bg-[#4242ea] hover:bg-[#3535c0] text-white"
                            >
                                {savingPreWork ? 'Saving...' : 'Submit'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Notes Dialog */}
                <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Session Notes</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                            <p className="text-xs text-gray-500 mb-1">Take notes about recommendations and guidance from your Coach</p>
                            <p className="text-xs text-gray-300 mb-3">Type <span className="font-mono">- </span>then Space to start a bullet · Tab to indent · Shift+Tab to unindent</p>
                            <Textarea ref={noteTextareaRef} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} onKeyDown={handleNotesKeyDown} placeholder="Write your notes here..." rows={8} className="text-sm" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>Cancel</Button>
                            <Button onClick={handleSaveNotes} disabled={savingNotes || !noteContent.trim()} className="bg-[#4242ea] hover:bg-[#3535c0] text-white">
                                {savingNotes ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Action Items Dialog */}
                <Dialog open={showActionItemsDialog} onOpenChange={setShowActionItemsDialog}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Action Items</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                            <p className="text-xs text-gray-500 mb-3">Edit, delete, or add action items. Press Enter to add a new item.</p>
                            {actionItemLines.filter(i => !i.deleted).length > 0 && (
                                <div className="mb-3 space-y-1">
                                    {actionItemLines.map((item, i) => item.deleted ? null : (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-gray-300 text-xs">·</span>
                                            <input
                                                value={item.content}
                                                onChange={(e) => setActionItemLines(prev => prev.map((it, idx) => idx === i ? { ...it, content: e.target.value } : it))}
                                                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#4242ea]"
                                            />
                                            <button
                                                onClick={() => setActionItemLines(prev => prev.map((it, idx) => idx === i ? { ...it, deleted: true } : it))}
                                                className="text-gray-300 hover:text-red-400 text-xs px-1"
                                                title="Delete"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Input value={actionItemInput} onChange={(e) => setActionItemInput(e.target.value)} onKeyDown={handleActionItemKeyDown} placeholder="Type a new action item and press Enter..." className="text-sm" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowActionItemsDialog(false)}>Cancel</Button>
                            <Button onClick={handleSaveActionItems} disabled={savingActionItems} className="bg-[#4242ea] hover:bg-[#3535c0] text-white">
                                {savingActionItems ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
