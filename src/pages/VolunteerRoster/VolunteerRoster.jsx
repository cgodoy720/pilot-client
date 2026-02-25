import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ChevronLeft, ChevronRight, Users, Calendar, AlertCircle, CheckCircle2, Clock, Plus, XCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import SlotAssignmentModal from './components/SlotAssignmentModal';
import * as volunteerApi from '../../services/volunteerApi';

// Class schedule configuration for December 2025 AI Native cohort
// Future: This should come from curriculum_days table
const CLASS_SCHEDULE = {
    0: { hasClass: true, time: '10:00 AM - 4:00 PM', type: 'daytime' },      // Sunday
    1: { hasClass: true, time: '6:30 PM - 10:00 PM', type: 'evening' },      // Monday
    2: { hasClass: true, time: '6:30 PM - 10:00 PM', type: 'evening' },      // Tuesday
    3: { hasClass: true, time: '6:30 PM - 10:00 PM', type: 'evening' },      // Wednesday
    4: { hasClass: false, time: null, type: null },                           // Thursday - NO CLASS
    5: { hasClass: false, time: null, type: null },                           // Friday - NO CLASS
    6: { hasClass: true, time: '10:00 AM - 4:00 PM', type: 'daytime' },      // Saturday
};

// Holiday break dates (inclusive)
const HOLIDAY_BREAKS = [
    { start: '2025-12-18', end: '2026-01-02', name: 'Winter Break' },
];

// Cohort date ranges
const COHORT_DATES = {
    'December 2025': { start: '2025-12-06', end: '2026-02-15' },
};

// Cohorts to exclude (duplicate December variations)
const EXCLUDED_COHORTS = ['December 2025 AI Native', 'December 2025 Workshop'];

// Helper: Check if a date is during holiday break
function isHolidayBreak(dateStr) {
    for (const holiday of HOLIDAY_BREAKS) {
        if (dateStr >= holiday.start && dateStr <= holiday.end) {
            return holiday.name;
        }
    }
    return null;
}

// Helper: Check if date is within cohort range
function isWithinCohort(dateStr, cohortName) {
    // Default to December 2025 cohort dates
    const cohort = COHORT_DATES[cohortName] || COHORT_DATES['December 2025'];
    return dateStr >= cohort.start && dateStr <= cohort.end;
}

// Helper: Check if a date is a class day
function isClassDay(date, cohortName) {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const schedule = CLASS_SCHEDULE[dayOfWeek];

    // No class on Thu/Fri
    if (!schedule.hasClass) return false;

    // No class during holiday break
    if (isHolidayBreak(dateStr)) return false;

    // Check if within cohort dates
    if (!isWithinCohort(dateStr, cohortName)) return false;

    return true;
}

function VolunteerRoster({ embedded = false }) {
    const { user, token } = useAuth();
    const { canAccessPage } = usePermissions();
    const [slots, setSlots] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState('');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingSlot, setIsCreatingSlot] = useState(false);

    // Fetch cohorts on mount
    useEffect(() => {
        if (token) {
            fetchCohorts();
        }
    }, [token]);

    // Fetch slots when cohort or month changes
    useEffect(() => {
        if (token && selectedCohort) {
            fetchMonthlySlots();
        }
    }, [token, selectedCohort, currentMonth]);

    const fetchCohorts = async () => {
        try {
            const data = await volunteerApi.getAllCohorts(token);
            const allCohorts = [
                ...(data.assignedCohorts || []).map(c => c.cohort_name),
                ...(data.curriculumCohorts || []).map(c => c.cohort)
            ];
            // Filter out excluded cohorts (duplicate December variations)
            const filteredCohorts = [...new Set(allCohorts)]
                .filter(Boolean)
                .filter(c => !EXCLUDED_COHORTS.includes(c));
            setCohorts(filteredCohorts);
            if (filteredCohorts.length > 0 && !selectedCohort) {
                // Default to December 2025 if available
                const defaultCohort = filteredCohorts.includes('December 2025')
                    ? 'December 2025'
                    : filteredCohorts[0];
                setSelectedCohort(defaultCohort);
            }
        } catch (err) {
            console.error('Error fetching cohorts:', err);
            setError('Failed to load cohorts');
        }
    };

    const fetchMonthlySlots = async () => {
        setIsLoading(true);
        try {
            // Get first and last day of month
            const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const data = await volunteerApi.getSlotsByDateRange(
                monthStart.toISOString().split('T')[0],
                monthEnd.toISOString().split('T')[0],
                selectedCohort,
                token
            );
            setSlots(data.slots || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching slots:', err);
            setError('Failed to load schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Build month data grouped by weeks for calendar display
    const monthData = useMemo(() => {
        const weeks = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get first day of month and which day of week it falls on
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
        let startDayOfWeek = firstDayOfMonth.getDay();
        // Convert to Monday-start (0 = Monday, 6 = Sunday)
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        // Build all days including padding from previous/next month
        const allDays = [];

        // Add padding days from previous month
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const date = new Date(year, month - 1, day);
            allDays.push({
                date,
                dateKey: date.toISOString().split('T')[0],
                dayOfWeek: date.getDay(),
                isCurrentMonth: false,
                schedule: CLASS_SCHEDULE[date.getDay()],
                holidayName: null,
                hasClass: false,
                withinCohort: false,
                canAddVolunteer: false,
                slots: []
            });
        }

        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            const schedule = CLASS_SCHEDULE[dayOfWeek];
            const holidayName = isHolidayBreak(dateKey);
            const hasClass = isClassDay(date, selectedCohort);
            const withinCohort = isWithinCohort(dateKey, selectedCohort);

            allDays.push({
                date,
                dateKey,
                dayOfWeek,
                isCurrentMonth: true,
                schedule,
                holidayName,
                hasClass,
                withinCohort,
                canAddVolunteer: hasClass && withinCohort,
                slots: slots.filter(s => s.slot_date?.split('T')[0] === dateKey)
            });
        }

        // Add padding days from next month to complete the grid
        const remainingDays = 7 - (allDays.length % 7);
        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                const date = new Date(year, month + 1, i);
                allDays.push({
                    date,
                    dateKey: date.toISOString().split('T')[0],
                    dayOfWeek: date.getDay(),
                    isCurrentMonth: false,
                    schedule: CLASS_SCHEDULE[date.getDay()],
                    holidayName: null,
                    hasClass: false,
                    withinCohort: false,
                    canAddVolunteer: false,
                    slots: []
                });
            }
        }

        // Group into weeks
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }

        return weeks;
    }, [slots, currentMonth, selectedCohort]);

    // Flatten month data for stats calculation
    const allDaysFlat = useMemo(() => {
        return monthData.flat().filter(d => d.isCurrentMonth);
    }, [monthData]);

    const formatMonthYear = () => {
        return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getStatusColor = (slot) => {
        if (!slot.volunteer_user_id) return 'bg-red-100 border-red-300 text-red-800';
        if (slot.status === 'confirmed') return 'bg-green-100 border-green-300 text-green-800';
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    };

    const getStatusIcon = (slot) => {
        if (!slot.volunteer_user_id) return <AlertCircle className="w-4 h-4" />;
        if (slot.status === 'confirmed') return <CheckCircle2 className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleAddSlotClick = async (dayData) => {
        if (!dayData.canAddVolunteer || isCreatingSlot) return;

        setIsCreatingSlot(true);
        try {
            // Create a new slot for this date
            // Note: Backend expects camelCase field names
            // slot_type constraint allows: class_support, demo_day, networking, mock_interview, panel
            const response = await volunteerApi.createSlot({
                slotDate: dayData.dateKey,
                cohortName: selectedCohort,
                slotType: 'class_support'
            }, token);

            // Open the modal with the new slot (response contains { message, slot })
            setSelectedSlot(response.slot);
            setIsModalOpen(true);

            // Refresh slots list
            await fetchMonthlySlots();
        } catch (err) {
            console.error('Error creating slot:', err);
            setError('Failed to create slot');
        } finally {
            setIsCreatingSlot(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedSlot(null);
    };

    const handleSlotUpdate = () => {
        fetchMonthlySlots();
        handleModalClose();
    };

    // Calculate stats
    const stats = useMemo(() => {
        const classDaysThisMonth = allDaysFlat.filter(d => d.hasClass).length;
        const totalSlots = slots.length;
        const filledSlots = slots.filter(s => s.volunteer_user_id).length;
        const daysWithCoverage = new Set(slots.filter(s => s.volunteer_user_id).map(s => s.slot_date?.split('T')[0])).size;
        const classDaysNeedingCoverage = allDaysFlat.filter(d => d.hasClass && !d.slots.some(s => s.volunteer_user_id)).length;

        return {
            classDaysThisMonth,
            totalSlots,
            filledSlots,
            daysWithCoverage,
            classDaysNeedingCoverage
        };
    }, [allDaysFlat, slots]);

    // Access check (skip when embedded in dashboard)
    if (!embedded && (!user || !canAccessPage('volunteer_management'))) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p>This page is only available to administrators and staff.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={embedded ? "" : "min-h-screen bg-[#EFEFEF]"}>
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
                    Volunteer Calendar
                </h1>
                <p className="text-[#666666] mt-1">
                    View and manage volunteer assignments by month.
                </p>
            </div>

            <div className="p-8 max-w-[1600px] mx-auto">
                {/* Controls */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Cohort Selector */}
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-[#4242EA]" />
                            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                                <SelectTrigger className="w-[200px] bg-white border-[#C8C8C8]">
                                    <SelectValue placeholder="Select Cohort" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#C8C8C8]">
                                    {cohorts.map(cohort => (
                                        <SelectItem key={cohort} value={cohort}>
                                            {cohort}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth(-1)}
                                className="border-[#C8C8C8]"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] rounded-md min-w-[200px] justify-center">
                                <Calendar className="w-4 h-4 text-[#4242EA]" />
                                <span className="text-sm font-medium text-[#1E1E1E]">
                                    {formatMonthYear()}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth(1)}
                                className="border-[#C8C8C8]"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToToday}
                                className="border-[#C8C8C8] ml-2"
                            >
                                Today
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Schedule Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                    <span className="font-medium">Class Schedule:</span> Sat/Sun 10am-4pm EST | Mon/Tue/Wed 6:30pm-10pm EST | Thu/Fri No Class
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                        <span className="text-[#666666]">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                        <span className="text-[#666666]">Assigned (Pending)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-dashed border-[#4242EA] bg-white"></div>
                        <span className="text-[#666666]">Click to Add</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                        <span className="text-[#666666]">No Class</span>
                    </div>
                </div>

                {/* Month Grid */}
                {isLoading ? (
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-12 text-center text-[#666666]">
                        Loading schedule...
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-[#C8C8C8] overflow-hidden">
                        {/* Header Row with Day Names */}
                        <div className="grid grid-cols-7 border-b border-[#C8C8C8]">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                const schedule = CLASS_SCHEDULE[idx === 6 ? 0 : idx + 1]; // Convert to JS day index
                                return (
                                    <div
                                        key={day}
                                        className={`p-2 text-center border-r last:border-r-0 border-[#E3E3E3] ${
                                            !schedule.hasClass ? 'bg-gray-100' : 'bg-[#F9F9F9]'
                                        }`}
                                    >
                                        <div className="text-sm font-semibold text-[#1E1E1E]">{day}</div>
                                        {schedule.hasClass && (
                                            <div className="text-[10px] text-[#999999]">
                                                {schedule.type === 'daytime' ? '10am-4pm' : '6:30-10pm'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Week Rows */}
                        {monthData.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0 border-[#E3E3E3]">
                                {week.map((dayData) => {
                                    const isToday = dayData.date.toDateString() === new Date().toDateString();
                                    const assignedSlots = dayData.slots.filter(slot => slot.volunteer_user_id);
                                    const hasVolunteers = assignedSlots.length > 0;

                                    return (
                                        <div
                                            key={dayData.dateKey}
                                            className={`border-r last:border-r-0 border-[#E3E3E3] p-1.5 min-h-[60px] ${
                                                !dayData.isCurrentMonth ? 'bg-gray-100/50' :
                                                isToday ? 'bg-[#4242EA]/5' :
                                                !dayData.hasClass ? 'bg-gray-50' : 'bg-white'
                                            }`}
                                        >
                                            {/* Date Number */}
                                            <div className={`text-xs font-medium mb-1 ${
                                                !dayData.isCurrentMonth ? 'text-gray-400' :
                                                isToday ? 'text-[#4242EA] font-bold' : 'text-[#666666]'
                                            }`}>
                                                {dayData.date.getDate()}
                                            </div>

                                            {/* Day Content */}
                                            {dayData.isCurrentMonth && (
                                                <>
                                                    {/* Holiday Break */}
                                                    {dayData.holidayName ? (
                                                        <div className="text-[10px] text-orange-600 font-medium bg-orange-100 px-1.5 py-0.5 rounded text-center">
                                                            Holiday
                                                        </div>
                                                    ) : !dayData.schedule.hasClass ? (
                                                        /* No Class Day - Keep compact */
                                                        <div className="text-[10px] text-gray-400 text-center">
                                                            No class
                                                        </div>
                                                    ) : !dayData.withinCohort ? (
                                                        /* Outside Cohort Dates */
                                                        <div className="text-[10px] text-gray-400 text-center">
                                                            —
                                                        </div>
                                                    ) : (
                                                        /* Class Day with volunteers */
                                                        <div className="space-y-1">
                                                            {/* Assigned Volunteers - Dynamic height */}
                                                            {assignedSlots.map(slot => (
                                                                <button
                                                                    key={slot.slot_id}
                                                                    onClick={() => handleSlotClick(slot)}
                                                                    className={`w-full px-1.5 py-1 rounded border text-left text-[11px] transition-all hover:shadow-sm ${getStatusColor(slot)}`}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        {getStatusIcon(slot)}
                                                                        <span className="font-medium truncate">
                                                                            {slot.volunteer_first_name} {slot.volunteer_last_name?.charAt(0)}.
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}

                                                            {/* Add Volunteer Button - Compact */}
                                                            {dayData.canAddVolunteer && (
                                                                <button
                                                                    onClick={() => handleAddSlotClick(dayData)}
                                                                    disabled={isCreatingSlot}
                                                                    className={`w-full px-1.5 py-1 rounded border border-dashed border-[#4242EA]/40 text-[#4242EA] text-[10px]
                                                                        hover:border-[#4242EA] hover:bg-[#4242EA]/5 transition-all
                                                                        flex items-center justify-center gap-1
                                                                        ${!hasVolunteers ? 'min-h-[32px]' : ''}
                                                                        ${isCreatingSlot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                    <span className="font-medium">
                                                                        {hasVolunteers ? 'Add' : 'Add Volunteer'}
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                {!isLoading && !error && (
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-[#4242EA]">
                                {stats.classDaysThisMonth}
                            </div>
                            <div className="text-sm text-[#666666]">Class Days This Month</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-[#1E1E1E]">
                                {stats.totalSlots}
                            </div>
                            <div className="text-sm text-[#666666]">Total Slots</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.filledSlots}
                            </div>
                            <div className="text-sm text-[#666666]">Volunteers Assigned</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {stats.classDaysNeedingCoverage}
                            </div>
                            <div className="text-sm text-[#666666]">Days Need Coverage</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Slot Assignment Modal */}
            {isModalOpen && selectedSlot && (
                <SlotAssignmentModal
                    slot={selectedSlot}
                    cohort={selectedCohort}
                    onClose={handleModalClose}
                    onUpdate={handleSlotUpdate}
                />
            )}
        </div>
    );
}

export default VolunteerRoster;
