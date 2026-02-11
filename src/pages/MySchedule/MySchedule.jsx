import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus, X, TreePine } from 'lucide-react';
import { Button } from '../../components/ui/button';
import * as volunteerApi from '../../services/volunteerApi';

// Format date for display
const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Get days in month
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

// Format date as YYYY-MM-DD
const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
};

function MySchedule() {
    const { user, token } = useAuth();
    const { canAccessPage } = usePermissions();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [slots, setSlots] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Holiday dates (YYYY-MM-DD)
    const holidayDates = useMemo(() => new Set([
        '2025-12-20','2025-12-21','2025-12-22','2025-12-23','2025-12-24','2025-12-25','2025-12-26','2025-12-27','2025-12-28','2025-12-29','2025-12-30','2025-12-31',
        '2026-01-01','2026-01-02'
    ]), []);

    // Fetch data
    useEffect(() => {
        if (token && user) {
            fetchData();
        }
    }, [token, user, currentMonth]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get date range for the month
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const startDate = formatDateKey(new Date(year, month, 1));
            const endDate = formatDateKey(new Date(year, month + 1, 0));

            // Fetch slots for the month and my profile
            const [slotsData, profileData] = await Promise.all([
                volunteerApi.getVolunteerSlots(startDate, endDate, token),
                volunteerApi.getVolunteerProfile(user.userId || user.user_id, token)
            ]);

            setSlots(slotsData.slots || []);
            setMyProfile(profileData.volunteer || null);
            setError(null);
        } catch (err) {
            console.error('Error fetching schedule data:', err);
            setError('Failed to load schedule');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate months
    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    // Build calendar data structure
    const monthData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const weeks = [];
        let currentWeek = [];

        // Add padding days from previous month
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthDays - i);
            currentWeek.push({
                date,
                dateKey: formatDateKey(date),
                isCurrentMonth: false,
                dayOfMonth: prevMonthDays - i
            });
        }

        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            currentWeek.push({
                date,
                dateKey: formatDateKey(date),
                isCurrentMonth: true,
                dayOfMonth: day
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Add padding days from next month
        if (currentWeek.length > 0) {
            let nextDay = 1;
            while (currentWeek.length < 7) {
                const date = new Date(year, month + 1, nextDay);
                currentWeek.push({
                    date,
                    dateKey: formatDateKey(date),
                    isCurrentMonth: false,
                    dayOfMonth: nextDay
                });
                nextDay++;
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [currentMonth]);

    // Group slots by date
    const slotsByDate = useMemo(() => {
        const grouped = {};
        slots.forEach(slot => {
            const dateKey = slot.slot_date?.split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(slot);
        });
        return grouped;
    }, [slots]);

    // Get my assigned slots
    const mySlots = useMemo(() => {
        const myUserId = user?.userId || user?.user_id;
        return slots.filter(slot => slot.volunteer_user_id === myUserId);
    }, [slots, user]);

    // Calculate stats
    const monthStats = useMemo(() => {
        const myUserId = user?.userId || user?.user_id;
        const thisMonth = mySlots.filter(slot => {
            const slotDate = new Date(slot.slot_date);
            return slotDate.getMonth() === currentMonth.getMonth() &&
                   slotDate.getFullYear() === currentMonth.getFullYear();
        });

        return {
            totalSlots: thisMonth.length,
            upcomingSlots: thisMonth.filter(slot => new Date(slot.slot_date) >= new Date()).length
        };
    }, [mySlots, currentMonth, user]);

    // Check if a slot is mine
    const isMySlot = (slot) => {
        const myUserId = user?.userId || user?.user_id;
        return slot.volunteer_user_id === myUserId;
    };

    // Format slot time with fallback
    const formatSlotTime = (slot) => {
        if (slot.slot_time) {
            const [hour, minute] = slot.slot_time.split(':').map(Number);
            const d = new Date();
            d.setHours(hour, minute || 0, 0, 0);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        // Legacy fallback
        if (slot.time_slot === 'evening') return '6:30pm';
        return '10am';
    };

    // Handle signing up for an open slot
    const handleSignUp = async (slot) => {
        try {
            await volunteerApi.signUpForSlot(slot.slot_id, token);
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Error signing up for slot:', err);
            alert('Failed to sign up for slot: ' + (err.message || 'Unknown error'));
        }
    };

    // Handle canceling my slot
    const handleCancelSlot = async (slot) => {
        if (!confirm('Are you sure you want to cancel this slot?')) return;

        try {
            await volunteerApi.cancelSlot(slot.slot_id, token);
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Error canceling slot:', err);
            alert('Failed to cancel slot: ' + (err.message || 'Unknown error'));
        }
    };

    // Access check - only volunteers
    if (!user || !canAccessPage('my_schedule')) {
        return (
            <div className="min-h-screen bg-[#EFEFEF] p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center">
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p>This page is only available to volunteers.</p>
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
                    My Volunteer Schedule
                </h1>
                <p className="text-[#666666] mt-1">
                    View your assigned slots and sign up for open sessions.
                </p>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                        <div className="text-sm text-[#666666] mb-1">This Month</div>
                        <div className="text-2xl font-bold text-[#4242EA]">{monthStats.totalSlots}</div>
                        <div className="text-sm text-[#666666]">assigned slots</div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#C8C8C8] p-4">
                        <div className="text-sm text-[#666666] mb-1">Upcoming</div>
                        <div className="text-2xl font-bold text-[#10B981]">{monthStats.upcomingSlots}</div>
                        <div className="text-sm text-[#666666]">remaining this month</div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] overflow-hidden">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#C8C8C8] bg-[#F9F9F9]">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth(-1)}
                            className="text-[#666666] hover:text-[#1E1E1E]"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-lg font-semibold text-[#1E1E1E]">
                            {formatMonthYear(currentMonth)}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth(1)}
                            className="text-[#666666] hover:text-[#1E1E1E]"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-[#C8C8C8]">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="px-2 py-2 text-center text-sm font-medium text-[#666666] border-r border-[#E3E3E3] last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {isLoading ? (
                        <div className="text-center py-12 text-[#666666]">
                            Loading schedule...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E3E3E3]">
                            {monthData.map((week, weekIdx) => (
                                <div key={weekIdx} className="grid grid-cols-7">
                                    {week.map((day, dayIdx) => {
                                        const daySlots = slotsByDate[day.dateKey] || [];
                                        const isToday = formatDateKey(new Date()) === day.dateKey;
                                        const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));

                                        return (
                                            <div
                                                key={dayIdx}
                                                className={`min-h-[100px] border-r border-[#E3E3E3] last:border-r-0 p-1 ${
                                                    !day.isCurrentMonth ? 'bg-[#F5F5F5]' : ''
                                                } ${isToday ? 'bg-[#4242EA]/5' : ''}`}
                                            >
                                                <div className="flex items-center gap-1 mb-1">
                                                    <div className={`text-xs font-medium ${
                                                        !day.isCurrentMonth ? 'text-[#999999]' :
                                                        isToday ? 'text-[#4242EA]' : 'text-[#666666]'
                                                    }`}>
                                                        {day.dayOfMonth}
                                                    </div>
                                                    {holidayDates.has(day.dateKey) && (
                                                        <TreePine className="w-3 h-3 text-amber-600" title="Holiday break" />
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    {daySlots.map(slot => {
                                                        const isMine = isMySlot(slot);
                                                        const isOpen = !slot.volunteer_user_id;

                                                        return (
                                                            <div
                                                                key={slot.slot_id}
                                                                className={`text-xs rounded px-1 py-0.5 ${
                                                                    isMine
                                                                        ? 'bg-[#4242EA] text-white'
                                                                        : isOpen
                                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="truncate flex items-center gap-0.5">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        {formatSlotTime(slot)}
                                                                    </span>
                                                                    {isMine && !isPast && (
                                                                        <button
                                                                            onClick={() => handleCancelSlot(slot)}
                                                                            className="hover:bg-white/20 rounded p-0.5"
                                                                            title="Cancel slot"
                                                                        >
                                                                            <X className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    )}
                                                                    {isOpen && !isPast && (
                                                                        <button
                                                                            onClick={() => handleSignUp(slot)}
                                                                            className="hover:bg-green-200 rounded p-0.5"
                                                                            title="Sign up"
                                                                        >
                                                                            <Plus className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {slot.cohort_name && (
                                                                    <div className="truncate text-[10px] opacity-75">
                                                                        {slot.cohort_name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 text-sm text-[#666666]">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#4242EA]"></div>
                        <span>Your slots</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                        <span>Open slots (click + to sign up)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MySchedule;
