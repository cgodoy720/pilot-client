import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ChevronDown } from 'lucide-react';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../../components/animate-ui/components/radix/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

function AdminVolunteerFeedback() {
    const { user, token } = useAuth();
    const { canAccessPage } = usePermissions();
    const [feedback, setFeedback] = useState([]);
    const [filteredFeedback, setFilteredFeedback] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);
    
    // Filter state
    const [selectedEventType, setSelectedEventType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [volunteerName, setVolunteerName] = useState('');

    // Available event types
    const eventTypes = ['AI Native Class', 'Demo Day', 'Networking Event', 'Panel', 'Mock Interview'];

    const applyFilters = () => {
        let filtered = [...feedback];

        // Filter by event type
        if (selectedEventType) {
            filtered = filtered.filter(item => item.feedback_type === selectedEventType);
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter(item => new Date(item.feedback_date) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(item => new Date(item.feedback_date) <= new Date(endDate));
        }

        // Filter by volunteer name (search in first name, last name, or email)
        if (volunteerName) {
            const searchTerm = volunteerName.toLowerCase();
            filtered = filtered.filter(item => 
                item.first_name.toLowerCase().includes(searchTerm) ||
                item.last_name.toLowerCase().includes(searchTerm) ||
                item.email.toLowerCase().includes(searchTerm) ||
                `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredFeedback(filtered);
    };

    useEffect(() => {
        if (user && token) {
            fetchAllFeedback();
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    // Apply filters when feedback or filter values change
    useEffect(() => {
        applyFilters();
    }, [feedback, selectedEventType, startDate, endDate, volunteerName]);

    const fetchAllFeedback = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data.feedback || []);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch feedback (${response.status})`);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setError('Failed to load feedback. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedEventType('');
        setStartDate('');
        setEndDate('');
        setVolunteerName('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleAccordionChange = (value) => {
        setExpandedRows(value);
    };

    if (!user || !canAccessPage('admin_volunteer_feedback')) {
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
                    Volunteer Feedback Administration
                </h1>
                <p className="text-[#666666] mt-1">
                    View and manage feedback from all volunteers across events.
                </p>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto">
                {/* Filters Section */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-6 mb-6">
                    <h2 className="text-lg font-medium text-[#1E1E1E] mb-4">Filters</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Event Type */}
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            <Label className="text-[#1E1E1E] font-medium text-sm">Event Type</Label>
                            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                                <SelectTrigger className="bg-white border-[#C8C8C8] text-[#1E1E1E]">
                                    <SelectValue placeholder="All Event Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#C8C8C8]">
                                    <SelectItem value="all" className="text-[#1E1E1E]">All Event Types</SelectItem>
                                    {eventTypes.map(type => (
                                        <SelectItem key={type} value={type} className="text-[#1E1E1E]">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start Date */}
                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <Label className="text-[#1E1E1E] font-medium text-sm">Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white border-[#C8C8C8] text-[#1E1E1E]"
                            />
                        </div>

                        {/* End Date */}
                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <Label className="text-[#1E1E1E] font-medium text-sm">End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white border-[#C8C8C8] text-[#1E1E1E]"
                            />
                        </div>

                        {/* Volunteer Name */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <Label className="text-[#1E1E1E] font-medium text-sm">Volunteer Name</Label>
                            <Input
                                type="text"
                                value={volunteerName}
                                onChange={(e) => setVolunteerName(e.target.value)}
                                placeholder="Search by name or email..."
                                className="bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999999]"
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="group relative overflow-hidden inline-flex justify-center items-center px-6 py-2 h-10 bg-[#4242EA] border border-[#4242EA] rounded-md font-medium text-sm text-white cursor-pointer transition-colors duration-300"
                        >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                                Clear Filters
                            </span>
                            <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="bg-[#4242EA]/10 border-l-4 border-[#4242EA] rounded-r-lg px-4 py-3 mb-6">
                    <p className="text-[#1E1E1E] font-medium">
                        Showing {filteredFeedback.length} of {feedback.length} feedback entries
                    </p>
                </div>

                {/* Feedback Table */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-12 text-[#666666]">
                            Loading volunteer feedback...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600 bg-red-50">
                            {error}
                        </div>
                    ) : filteredFeedback.length === 0 ? (
                        <div className="text-center py-12 text-[#666666]">
                            {feedback.length === 0 ? (
                                <p>No volunteer feedback has been submitted yet.</p>
                            ) : (
                                <p>No feedback matches the current filters. Try adjusting your search criteria.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-[40px_1fr_1fr_140px_100px_100px] gap-3 px-4 py-3 bg-[#F9F9F9] border-b border-[#C8C8C8]">
                                <div></div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Volunteer</div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Email</div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Event Type</div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Event Date</div>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Submitted</div>
                            </div>

                            {/* Accordion Rows */}
                            <Accordion 
                                type="multiple" 
                                value={expandedRows} 
                                onValueChange={handleAccordionChange}
                                className="divide-y divide-[#E3E3E3]"
                            >
                                {filteredFeedback.map((item, index) => (
                                    <AccordionItem 
                                        key={item.feedback_id} 
                                        value={String(item.feedback_id)}
                                        className={`border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'}`}
                                    >
                                        <AccordionTrigger 
                                            showArrow={false}
                                            className="hover:no-underline hover:bg-[#EFEFEF] !py-0 px-4"
                                        >
                                            <div className="grid grid-cols-[40px_1fr_1fr_140px_100px_100px] gap-3 py-3 w-full items-center">
                                                <div>
                                                    <ChevronDown 
                                                        className={`h-4 w-4 text-[#666666] transition-transform duration-200 ${
                                                            expandedRows.includes(String(item.feedback_id)) ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </div>
                                                <div className="text-sm text-[#1E1E1E] font-medium truncate">
                                                    {item.first_name} {item.last_name}
                                                </div>
                                                <div className="text-sm text-[#666666] truncate">
                                                    {item.email}
                                                </div>
                                                <div>
                                                    <span className="inline-flex px-3 py-1 bg-[#4242EA] text-white text-xs font-medium rounded-full">
                                                        {item.feedback_type}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-[#1E1E1E]">
                                                    {formatDate(item.feedback_date)}
                                                </div>
                                                <div className="text-sm text-[#666666]">
                                                    {formatDate(item.created_at)}
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pb-0">
                                            <div className={`px-6 py-4 border-t border-[#E3E3E3] ${index % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-[#EFEFEF]'}`}>
                                                <div className="grid gap-4 max-w-4xl">
                                                    {item.overall_experience && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-[#1E1E1E] mb-2">
                                                                How was your experience overall?
                                                            </h4>
                                                            <p className="text-[#1E1E1E] bg-white p-3 rounded-md border-l-4 border-[#4242EA]">
                                                                {item.overall_experience}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {item.improvement_suggestions && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-[#1E1E1E] mb-2">
                                                                How could we improve going forward?
                                                            </h4>
                                                            <p className="text-[#1E1E1E] bg-white p-3 rounded-md border-l-4 border-[#4242EA]">
                                                                {item.improvement_suggestions}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {item.specific_feedback && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-[#1E1E1E] mb-2">
                                                                Feedback on specific Builders or Fellows
                                                            </h4>
                                                            <p className="text-[#1E1E1E] bg-white p-3 rounded-md border-l-4 border-[#4242EA]">
                                                                {item.specific_feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {item.audio_recording_url && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-[#1E1E1E] mb-2">
                                                                Audio Recording
                                                            </h4>
                                                            <audio controls className="w-full max-w-md">
                                                                <source src={item.audio_recording_url} type="audio/mpeg" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminVolunteerFeedback;
