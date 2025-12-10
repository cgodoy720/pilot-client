import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { X, User, Calendar, MapPin, Send, UserPlus, UserMinus, Check, Star, Search, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import * as volunteerApi from '../../../services/volunteerApi';

// Map day numbers to day names
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function SlotAssignmentModal({ slot, cohort, onClose, onUpdate }) {
    const { token } = useAuth();
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchVolunteers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVolunteers = async () => {
        try {
            const data = await volunteerApi.getVolunteersByCohort(cohort, token);
            setVolunteers(data.volunteers || []);
        } catch (err) {
            console.error('Error fetching volunteers:', err);
            try {
                const allData = await volunteerApi.getAllVolunteers(token, { activeOnly: true });
                setVolunteers(allData.volunteers || []);
            } catch (fallbackErr) {
                setError('Failed to load volunteers');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Get the day of week for this slot
    const slotDayOfWeek = useMemo(() => {
        if (!slot?.slot_date) return null;
        const date = new Date(slot.slot_date);
        return DAY_NAMES[date.getDay()];
    }, [slot?.slot_date]);

    // Check if a volunteer's availability matches this slot
    const getAvailabilityMatch = (volunteer) => {
        if (!volunteer.availability_preferences) return { matches: false, info: null };

        const prefs = typeof volunteer.availability_preferences === 'string'
            ? JSON.parse(volunteer.availability_preferences)
            : volunteer.availability_preferences;

        if (!prefs || Object.keys(prefs).length === 0) return { matches: false, info: null };

        const slotDateStr = slot.slot_date?.split('T')[0];

        if (prefs.specific_dates?.includes(slotDateStr)) {
            return { matches: true, info: 'Available this date', isSpecific: true };
        }

        if (prefs.preferred_day === slotDayOfWeek) {
            const timeInfo = prefs.preferred_time ? ` (${prefs.preferred_time})` : '';
            return { matches: true, info: `Prefers ${slotDayOfWeek}s${timeInfo}` };
        }

        if (prefs.preferred_day === 'tbd') {
            return { matches: false, info: 'Day TBD - committed' };
        }

        if (prefs.preferred_day) {
            return { matches: false, info: `Prefers ${prefs.preferred_day}s` };
        }

        return { matches: false, info: null };
    };

    // Sort and filter volunteers
    const sortedVolunteers = useMemo(() => {
        let filtered = volunteers.filter(v => {
            if (!searchTerm) return true;
            const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) ||
                v.email?.toLowerCase().includes(searchTerm.toLowerCase());
        });

        return filtered.map(v => ({
            ...v,
            availabilityMatch: getAvailabilityMatch(v)
        })).sort((a, b) => {
            if (a.availabilityMatch.matches && !b.availabilityMatch.matches) return -1;
            if (!a.availabilityMatch.matches && b.availabilityMatch.matches) return 1;
            return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
        });
    }, [volunteers, searchTerm, slotDayOfWeek, slot?.slot_date]);

    const matchingCount = sortedVolunteers.filter(v => v.availabilityMatch.matches).length;

    const handleSelectVolunteer = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setSearchTerm(`${volunteer.first_name} ${volunteer.last_name}`);
        setIsDropdownOpen(false);
    };

    const handleInputFocus = () => {
        setIsDropdownOpen(true);
        if (selectedVolunteer) {
            setSearchTerm('');
            setSelectedVolunteer(null);
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedVolunteer(null);
        setIsDropdownOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedVolunteer) return;

        setIsSaving(true);
        setError(null);
        try {
            await volunteerApi.assignVolunteerToSlot(slot.slot_id, selectedVolunteer.user_id, token);
            setSuccessMessage('Volunteer assigned successfully');
            setTimeout(() => onUpdate(), 1000);
        } catch (err) {
            console.error('Error assigning volunteer:', err);
            setError(err.message || 'Failed to assign volunteer');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        if (!slot.volunteer_user_id) return;

        setIsSaving(true);
        setError(null);
        try {
            await volunteerApi.removeVolunteerFromSlot(slot.slot_id, slot.volunteer_user_id, token);
            setSuccessMessage('Volunteer removed from slot');
            setTimeout(() => onUpdate(), 1000);
        } catch (err) {
            console.error('Error removing volunteer:', err);
            setError(err.message || 'Failed to remove volunteer');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#E3E3E3]">
                    <h2 className="text-lg font-semibold text-[#1E1E1E]">
                        Slot Assignment
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#F5F5F5] rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-[#666666]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-visible">
                    {/* Slot Details */}
                    <div className="bg-[#F9F9F9] rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-[#4242EA]" />
                            <span className="font-medium text-[#1E1E1E]">
                                {formatDate(slot.slot_date)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-[#666666]" />
                            <span className="text-sm text-[#666666]">
                                {slot.cohort_name} - {slot.slot_type || 'Class Support'}
                            </span>
                        </div>
                        {slot.daily_goal && (
                            <div className="mt-3 pt-3 border-t border-[#E3E3E3]">
                                <div className="text-xs text-[#666666] uppercase tracking-wide mb-1">
                                    Daily Goal
                                </div>
                                <div className="text-sm text-[#1E1E1E]">
                                    {slot.daily_goal}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Current Assignment */}
                    {slot.volunteer_user_id && (
                        <div className="mb-4">
                            <div className="text-sm font-medium text-[#1E1E1E] mb-2">
                                Currently Assigned
                            </div>
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <User className="w-4 h-4 text-green-700" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-[#1E1E1E]">
                                            {slot.volunteer_first_name} {slot.volunteer_last_name}
                                        </div>
                                        <div className="text-xs text-[#666666]">
                                            {slot.volunteer_email}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemove}
                                    disabled={isSaving}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    <UserMinus className="w-4 h-4 mr-1" />
                                    Remove
                                </Button>
                            </div>
                            {slot.status === 'confirmed' && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <Check className="w-3 h-3" />
                                    Confirmed by volunteer
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assign New Volunteer */}
                    <div className="mb-4">
                        <div className="text-sm font-medium text-[#1E1E1E] mb-2">
                            {slot.volunteer_user_id ? 'Reassign Slot' : 'Assign Volunteer'}
                        </div>

                        {/* Availability Match Info */}
                        {!isLoading && matchingCount > 0 && (
                            <div className="flex items-center gap-2 mb-3 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                                <Star className="w-4 h-4" />
                                <span>
                                    <strong>{matchingCount}</strong> volunteer{matchingCount !== 1 ? 's' : ''} available for {slotDayOfWeek}s
                                </span>
                            </div>
                        )}

                        <div className="space-y-3">
                            {/* Combined Search/Select Input */}
                            <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search and select volunteer..."
                                        value={searchTerm}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        className="w-full pl-9 pr-9 py-2 bg-white text-[#1E1E1E] border border-[#C8C8C8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4242EA]/20 focus:border-[#4242EA] placeholder:text-[#999999]"
                                    />
                                    <ChevronDown
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        onClick={() => {
                                            setIsDropdownOpen(!isDropdownOpen);
                                            if (!isDropdownOpen) inputRef.current?.focus();
                                        }}
                                    />
                                </div>

                                {/* Dropdown List */}
                                {isDropdownOpen && !isLoading && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#C8C8C8] rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                                        {sortedVolunteers.length === 0 ? (
                                            <div className="p-4 text-sm text-[#666666] text-center">
                                                No volunteers found
                                            </div>
                                        ) : (
                                            sortedVolunteers.map(v => (
                                                <button
                                                    key={v.user_id}
                                                    onClick={() => handleSelectVolunteer(v)}
                                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F0F0FF] border-b border-[#E3E3E3] last:border-b-0 flex items-center gap-3 ${
                                                        selectedVolunteer?.user_id === v.user_id ? 'bg-[#4242EA]/10' : ''
                                                    }`}
                                                >
                                                    {v.availabilityMatch.matches && (
                                                        <Star className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    )}
                                                    <span className="font-medium text-[#1E1E1E]">
                                                        {v.first_name} {v.last_name}
                                                    </span>
                                                    {v.availabilityMatch.info && (
                                                        <span className={`text-xs ${
                                                            v.availabilityMatch.matches
                                                                ? 'text-green-700 font-medium'
                                                                : 'text-[#666666]'
                                                        }`}>
                                                            ({v.availabilityMatch.info})
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#C8C8C8] rounded-md shadow-lg p-3 text-center text-sm text-[#666666]">
                                        Loading volunteers...
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleAssign}
                                disabled={!selectedVolunteer || isSaving}
                                className="w-full bg-[#4242EA] hover:bg-[#3333DD] text-white"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isSaving ? 'Assigning...' : 'Assign Volunteer'}
                            </Button>
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {successMessage}
                        </div>
                    )}

                    {/* Send Prep Email Button */}
                    {slot.volunteer_user_id && (
                        <div className="border-t border-[#E3E3E3] pt-4">
                            <Button
                                variant="outline"
                                className="w-full border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA]/10"
                                onClick={() => {
                                    alert('Prep email functionality coming soon');
                                }}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send Prep Email
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SlotAssignmentModal;
