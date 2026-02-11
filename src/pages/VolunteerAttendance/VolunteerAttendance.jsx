import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import {
    Users,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import * as volunteerApi from '../../services/volunteerApi';

function VolunteerAttendance() {
    const { user, token } = useAuth();
    const { canAccessPage } = usePermissions();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [cohorts, setCohorts] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState('all');
    const [expandedCohorts, setExpandedCohorts] = useState({});

    // Fetch cohorts on mount
    useEffect(() => {
        if (token) {
            fetchCohorts();
            fetchTodaysAttendance();
        }
    }, [token]);

    // Refetch when cohort filter changes
    useEffect(() => {
        if (token && selectedCohort !== 'all') {
            fetchTodaysAttendance(selectedCohort);
        } else if (token) {
            fetchTodaysAttendance();
        }
    }, [selectedCohort]);

    const fetchCohorts = async () => {
        try {
            const data = await volunteerApi.getAllCohorts(token);
            const allCohorts = [
                ...(data.assignedCohorts || []).map(c => c.cohort_name),
                ...(data.curriculumCohorts || []).map(c => c.cohort)
            ];
            const uniqueCohorts = [...new Set(allCohorts)].filter(Boolean);
            setCohorts(uniqueCohorts);
        } catch (err) {
            console.error('Error fetching cohorts:', err);
        }
    };

    const fetchTodaysAttendance = async (cohort = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await volunteerApi.getTodaysVolunteerAttendance(
                cohort === 'all' ? null : cohort,
                token
            );
            setAttendanceData(data);

            // Auto-expand all cohorts
            const expanded = {};
            (data.cohorts || []).forEach(c => {
                expanded[c.cohort] = true;
            });
            setExpandedCohorts(expanded);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError(err.message || 'Failed to load attendance data');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCohort = (cohortName) => {
        setExpandedCohorts(prev => ({
            ...prev,
            [cohortName]: !prev[cohortName]
        }));
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Access check
    if (!user || !canAccessPage('volunteer_management')) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p>This page is only available to administrators and staff.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EFEFEF]">
            {/* Header */}
            <div className="border-b border-[#C8C8C8] px-10 py-4">
                <h1
                    className="text-2xl font-normal"
                    style={{
                        background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Volunteer Attendance
                </h1>
                <p className="text-[#666666] mt-1">
                    View today's volunteer check-ins.
                </p>
            </div>

            <div className="p-8 max-w-[1200px] mx-auto">
                {/* Controls */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Date Display */}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-[#4242EA]" />
                            <span className="font-medium text-[#1E1E1E]">
                                {attendanceData?.date
                                    ? new Date(attendanceData.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })
                                    : 'Today'}
                            </span>
                        </div>

                        {/* Cohort Filter */}
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-[#4242EA]" />
                            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                                <SelectTrigger className="w-[200px] bg-white border-[#C8C8C8]">
                                    <SelectValue placeholder="All Cohorts" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#C8C8C8]">
                                    <SelectItem value="all">All Cohorts</SelectItem>
                                    {cohorts.map(cohort => (
                                        <SelectItem key={cohort} value={cohort}>
                                            {cohort}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => fetchTodaysAttendance(selectedCohort === 'all' ? null : selectedCohort)}
                                variant="outline"
                                size="sm"
                                className="border-[#C8C8C8]"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {attendanceData?.summary && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-[#1E1E1E]">
                                {attendanceData.summary.totalSlots}
                            </div>
                            <div className="text-sm text-[#666666]">Total Assigned</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {attendanceData.summary.checkedIn}
                            </div>
                            <div className="text-sm text-[#666666]">Checked In</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {attendanceData.summary.pending}
                            </div>
                            <div className="text-sm text-[#666666]">Pending</div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-12 text-center text-[#666666]">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#4242EA]" />
                        Loading attendance data...
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        {error}
                    </div>
                )}

                {/* No Data State */}
                {!isLoading && !error && (!attendanceData?.cohorts || attendanceData.cohorts.length === 0) && (
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-12 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-[#C8C8C8]" />
                        <h3 className="text-lg font-medium text-[#1E1E1E] mb-2">No Volunteers Assigned Today</h3>
                        <p className="text-[#666666]">
                            There are no volunteer slots scheduled for today.
                        </p>
                    </div>
                )}

                {/* Attendance by Cohort */}
                {!isLoading && !error && attendanceData?.cohorts && attendanceData.cohorts.length > 0 && (
                    <div className="space-y-4">
                        {attendanceData.cohorts.map(cohort => (
                            <div key={cohort.cohort} className="bg-white rounded-lg border border-[#C8C8C8] overflow-hidden">
                                {/* Cohort Header */}
                                <button
                                    onClick={() => toggleCohort(cohort.cohort)}
                                    className="w-full flex items-center justify-between p-4 bg-[#F9F9F9] hover:bg-[#F5F5F5] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-[#4242EA]" />
                                        <span className="font-semibold text-[#1E1E1E]">{cohort.cohort}</span>
                                        <span className="text-sm text-[#666666]">
                                            ({cohort.count} volunteer{cohort.count !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                    {expandedCohorts[cohort.cohort] ? (
                                        <ChevronUp className="w-5 h-5 text-[#666666]" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-[#666666]" />
                                    )}
                                </button>

                                {/* Volunteer List */}
                                {expandedCohorts[cohort.cohort] && (
                                    <div className="divide-y divide-[#E3E3E3]">
                                        {cohort.records.map((record, idx) => (
                                            <div
                                                key={record.volunteerId || idx}
                                                className="flex items-center justify-between p-4 hover:bg-[#FAFAFA]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Photo or avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-[#E3E3E3] flex items-center justify-center overflow-hidden">
                                                        {record.photoUrl ? (
                                                            <img
                                                                src={record.photoUrl}
                                                                alt={`${record.firstName} ${record.lastName}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-5 h-5 text-[#999999]" />
                                                        )}
                                                    </div>

                                                    {/* Name and email */}
                                                    <div>
                                                        <div className="font-medium text-[#1E1E1E]">
                                                            {record.firstName} {record.lastName}
                                                        </div>
                                                        <div className="text-sm text-[#666666]">
                                                            {record.email}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center gap-4">
                                                    {record.attendanceStatus === 'attended' ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                                <span className="text-sm font-medium">Checked In</span>
                                                            </div>
                                                            <div className="text-sm text-[#666666]">
                                                                {formatTime(record.checkedInAt)}
                                                                {record.lateMinutes > 0 && (
                                                                    <span className="ml-2 text-yellow-600">
                                                                        ({record.lateMinutes} min late)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-yellow-600">
                                                            <Clock className="w-5 h-5" />
                                                            <span className="text-sm font-medium">Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VolunteerAttendance;
