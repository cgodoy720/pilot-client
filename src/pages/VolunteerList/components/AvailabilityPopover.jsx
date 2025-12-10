import { useState, useEffect } from 'react';
import { Check, Loader2, Calendar, Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import * as volunteerApi from '../../../services/volunteerApi';

// Availability options - weekdays are evenings, weekends are daytime
const AVAILABILITY_OPTIONS = [
    { value: 'monday', label: 'Monday', time: 'evening', display: 'Mon Evening' },
    { value: 'tuesday', label: 'Tuesday', time: 'evening', display: 'Tue Evening' },
    { value: 'wednesday', label: 'Wednesday', time: 'evening', display: 'Wed Evening' },
    { value: 'saturday', label: 'Saturday', time: 'daytime', display: 'Sat Daytime' },
    { value: 'sunday', label: 'Sunday', time: 'daytime', display: 'Sun Daytime' },
];

// Parse availability_preferences JSON
const parseAvailability = (prefs) => {
    if (!prefs) return { days: [], specificDates: [] };
    const parsed = typeof prefs === 'string' ? JSON.parse(prefs) : prefs;

    let days = [];
    let specificDates = [];

    // Handle legacy single preferred_day format
    if (parsed.preferred_day && parsed.preferred_day !== 'tbd') {
        days = [parsed.preferred_day];
    }

    // Handle new multi-day format (array of days)
    if (parsed.preferred_days && Array.isArray(parsed.preferred_days)) {
        days = parsed.preferred_days;
    }

    // Handle specific dates
    if (parsed.specific_dates && Array.isArray(parsed.specific_dates)) {
        specificDates = parsed.specific_dates;
    }

    return { days, specificDates };
};

// Format date for display (e.g., "Dec 15")
const formatDateShort = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get display text for availability
const getDisplayText = (prefs) => {
    const { days, specificDates } = parseAvailability(prefs);

    // Check if TBD
    const parsed = typeof prefs === 'string' ? JSON.parse(prefs || '{}') : (prefs || {});
    if (parsed.preferred_day === 'tbd' && days.length === 0 && specificDates.length === 0) {
        return 'TBD';
    }

    const parts = [];

    // Add regular days
    if (days.length > 0) {
        const displayDays = days.map(day => {
            const option = AVAILABILITY_OPTIONS.find(o => o.value === day);
            return option ? option.display : day;
        });
        if (displayDays.length <= 2) {
            parts.push(...displayDays);
        } else {
            parts.push(displayDays[0], `+${displayDays.length - 1} days`);
        }
    }

    // Add specific dates indicator
    if (specificDates.length > 0) {
        if (days.length > 0) {
            parts.push(`+${specificDates.length} dates`);
        } else {
            // Only specific dates, no regular availability
            if (specificDates.length <= 2) {
                parts.push(...specificDates.map(formatDateShort));
            } else {
                parts.push(formatDateShort(specificDates[0]), `+${specificDates.length - 1} dates`);
            }
        }
    }

    return parts.length > 0 ? parts.join(', ') : null;
};

// Get color based on availability type
const getAvailabilityColor = (prefs) => {
    const { days, specificDates } = parseAvailability(prefs);

    // Specific dates only - use orange
    if (days.length === 0 && specificDates.length > 0) {
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
    }

    if (days.length === 0) return { bg: 'bg-gray-100', text: 'text-gray-600' };

    const hasWeekend = days.some(d => d === 'saturday' || d === 'sunday');
    const hasWeekday = days.some(d => ['monday', 'tuesday', 'wednesday'].includes(d));

    // Has specific dates in addition to regular - add indicator
    if (specificDates.length > 0) {
        return { bg: 'bg-purple-100', text: 'text-purple-700' }; // Mixed availability
    }

    if (hasWeekend && hasWeekday) {
        return { bg: 'bg-purple-100', text: 'text-purple-700' }; // Both
    }
    if (hasWeekend) {
        return { bg: 'bg-blue-100', text: 'text-blue-700' }; // Weekend
    }
    return { bg: 'bg-green-100', text: 'text-green-700' }; // Weekday evenings
};

function AvailabilityPopover({ volunteer, token, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);
    const [specificDates, setSpecificDates] = useState([]);
    const [newDate, setNewDate] = useState('');

    // Initialize selected days and specific dates when popover opens
    useEffect(() => {
        if (open) {
            const { days, specificDates: dates } = parseAvailability(volunteer.availability_preferences);
            setSelectedDays(days);
            setSpecificDates(dates);
            setNewDate('');
        }
    }, [open, volunteer.availability_preferences]);

    const handleDayToggle = (day) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            }
            return [...prev, day];
        });
    };

    const handleAddDate = () => {
        if (!newDate) return;

        // Don't add duplicates
        if (specificDates.includes(newDate)) {
            setNewDate('');
            return;
        }

        // Add and sort dates chronologically
        const updatedDates = [...specificDates, newDate].sort();
        setSpecificDates(updatedDates);
        setNewDate('');
    };

    const handleRemoveDate = (dateToRemove) => {
        setSpecificDates(prev => prev.filter(d => d !== dateToRemove));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Build new availability preferences
            const newPrefs = {
                preferred_days: selectedDays,
                specific_dates: specificDates,
                // Keep backward compatibility - set preferred_day to first selected or null
                preferred_day: selectedDays.length > 0 ? selectedDays[0] : null,
            };

            // 1. Save availability preferences
            await volunteerApi.updateVolunteerProfile(volunteer.user_id, {
                availabilityPreferences: newPrefs,
            }, token);

            // 2. Auto-assign to matching open slots
            try {
                const result = await volunteerApi.autoAssignVolunteer(volunteer.user_id, token);
                if (result.assignments?.length > 0) {
                    console.log(`Auto-assigned ${volunteer.first_name} to ${result.assignments.length} slot(s)`);
                }
            } catch (autoAssignErr) {
                // Don't block on auto-assign errors - availability was still saved
                console.error('Auto-assign error (non-blocking):', autoAssignErr);
            }

            onUpdate();
            setOpen(false);
        } catch (err) {
            console.error('Error updating availability:', err);
            alert('Failed to update availability');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerClick = (e) => {
        e.stopPropagation();
    };

    const displayText = getDisplayText(volunteer.availability_preferences);
    const colors = getAvailabilityColor(volunteer.availability_preferences);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild onClick={handleTriggerClick}>
                <div className="cursor-pointer hover:bg-[#4242EA]/5 rounded p-1 -m-1 transition-colors">
                    {displayText ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded font-medium ${colors.bg} ${colors.text}`}>
                            <Calendar className="w-3 h-3" />
                            {displayText}
                        </span>
                    ) : (
                        <span className="text-[#999999] italic text-sm">Click to set</span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                    <div className="font-medium text-sm text-[#1E1E1E]">
                        Set Availability
                    </div>
                    <div className="text-xs text-[#666666]">
                        {volunteer.first_name} {volunteer.last_name}
                    </div>

                    {/* Weekday Evenings Section */}
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-[#666666] uppercase tracking-wide">
                            Weekday Evenings
                        </div>
                        <div className="space-y-1.5">
                            {AVAILABILITY_OPTIONS.filter(o => o.time === 'evening').map(option => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#F5F5F5] cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedDays.includes(option.value)}
                                        onCheckedChange={() => handleDayToggle(option.value)}
                                        className="border-[#C8C8C8] data-[state=checked]:bg-[#4242EA] data-[state=checked]:border-[#4242EA]"
                                    />
                                    <span className="text-sm text-[#1E1E1E]">{option.label}</span>
                                    <span className="text-xs text-[#999999] ml-auto">6:30-10pm</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Weekend Section */}
                    <div className="space-y-2 pt-2 border-t border-[#E3E3E3]">
                        <div className="text-xs font-medium text-[#666666] uppercase tracking-wide">
                            Weekend Days
                        </div>
                        <div className="space-y-1.5">
                            {AVAILABILITY_OPTIONS.filter(o => o.time === 'daytime').map(option => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#F5F5F5] cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedDays.includes(option.value)}
                                        onCheckedChange={() => handleDayToggle(option.value)}
                                        className="border-[#C8C8C8] data-[state=checked]:bg-[#4242EA] data-[state=checked]:border-[#4242EA]"
                                    />
                                    <span className="text-sm text-[#1E1E1E]">{option.label}</span>
                                    <span className="text-xs text-[#999999] ml-auto">10am-4pm</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Specific Dates Section */}
                    <div className="space-y-2 pt-2 border-t border-[#E3E3E3]">
                        <div className="text-xs font-medium text-[#666666] uppercase tracking-wide">
                            Specific Dates
                        </div>
                        <div className="text-xs text-[#999999]">
                            For volunteers with non-regular availability
                        </div>

                        {/* Add Date Input */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="flex-1 h-8 text-sm bg-white border-[#C8C8C8]"
                            />
                            <button
                                onClick={handleAddDate}
                                disabled={!newDate}
                                className="p-1.5 bg-[#4242EA] text-white rounded hover:bg-[#3333DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Selected Dates */}
                        {specificDates.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                                {specificDates.map(date => (
                                    <span
                                        key={date}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700"
                                    >
                                        {formatDateShort(date)}
                                        <button
                                            onClick={() => handleRemoveDate(date)}
                                            className="hover:text-orange-900 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 border-t border-[#E3E3E3]">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full py-2 px-3 bg-[#4242EA] text-white text-sm font-medium rounded hover:bg-[#3333DD] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Availability
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default AvailabilityPopover;
