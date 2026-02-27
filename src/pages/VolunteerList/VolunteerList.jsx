import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Search, Users, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import * as volunteerApi from '../../services/volunteerApi';
import AvailabilityPopover from './components/AvailabilityPopover';
import CohortPopover from './components/CohortPopover';
import StatusPopover from './components/StatusPopover';
import VolunteerProfileModal from './components/VolunteerProfileModal';

// Cohorts to exclude (duplicate December variations)
const EXCLUDED_COHORTS = ['December 2025 AI Native', 'December 2025 Workshop'];

function VolunteerList({ embedded = false }) {
    const { user, token } = useAuth();
    const { canAccessPage } = usePermissions();
    const [volunteers, setVolunteers] = useState([]);
    const [filteredVolunteers, setFilteredVolunteers] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        applyFilters();
    }, [volunteers, selectedCohort, searchTerm, statusFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [volunteersData, cohortsData] = await Promise.all([
                volunteerApi.getAllVolunteers(token),
                volunteerApi.getAllCohorts(token)
            ]);

            setVolunteers(volunteersData.volunteers || []);

            // Get all cohorts and filter out excluded ones
            const allCohorts = [
                ...(cohortsData.assignedCohorts || []).map(c => c.cohort_name),
                ...(cohortsData.curriculumCohorts || []).map(c => c.cohort)
            ];
            const filteredCohorts = [...new Set(allCohorts)]
                .filter(Boolean)
                .filter(c => !EXCLUDED_COHORTS.includes(c));
            setCohorts(filteredCohorts);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load volunteers');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...volunteers];

        // Filter by status
        if (statusFilter === 'active') {
            filtered = filtered.filter(v =>
                v.volunteer_status === 'active' || v.active === true
            );
        }

        // Filter by cohort
        if (selectedCohort && selectedCohort !== 'all') {
            filtered = filtered.filter(v =>
                v.assigned_cohorts?.includes(selectedCohort)
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(v =>
                v.first_name?.toLowerCase().includes(term) ||
                v.last_name?.toLowerCase().includes(term) ||
                v.email?.toLowerCase().includes(term) ||
                `${v.first_name} ${v.last_name}`.toLowerCase().includes(term)
            );
        }

        setFilteredVolunteers(filtered);
    };

    // Sort volunteers based on sortConfig
    const sortedVolunteers = useMemo(() => {
        const sorted = [...filteredVolunteers];

        sorted.sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'name':
                    aValue = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
                    bValue = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
                    break;
                case 'email':
                    aValue = (a.email || '').toLowerCase();
                    bValue = (b.email || '').toLowerCase();
                    break;
                case 'status':
                    aValue = a.active ? 'active' : 'inactive';
                    bValue = b.active ? 'active' : 'inactive';
                    break;
                case 'cohorts':
                    aValue = (a.assigned_cohorts || []).length;
                    bValue = (b.assigned_cohorts || []).length;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredVolunteers, sortConfig]);

    // Handle column header click for sorting
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Render sort icon for column header
    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronsUpDown className="w-4 h-4 text-[#999999]" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-[#4242EA]" />
            : <ChevronDown className="w-4 h-4 text-[#4242EA]" />;
    };

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
                    Volunteer Directory
                </h1>
                <p className="text-[#666666] mt-1">
                    Manage volunteers, view profiles, and track cohort assignments.
                </p>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto">
                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-[#C8C8C8]"
                            />
                        </div>

                        {/* Cohort Filter */}
                        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                            <SelectTrigger className="w-[180px] bg-white border-[#C8C8C8]">
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

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-white border-[#C8C8C8]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#C8C8C8]">
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="all">All Statuses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="bg-[#4242EA]/10 border-l-4 border-[#4242EA] rounded-r-lg px-4 py-3 mb-6">
                    <p className="text-[#1E1E1E] font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Showing {filteredVolunteers.length} of {volunteers.length} volunteers
                    </p>
                </div>

                {/* Volunteers Table */}
                <div className="bg-white rounded-lg border border-[#C8C8C8] overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-12 text-[#666666]">
                            Loading volunteers...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600 bg-red-50">
                            {error}
                        </div>
                    ) : filteredVolunteers.length === 0 ? (
                        <div className="text-center py-12 text-[#666666]">
                            No volunteers found matching your criteria.
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-[1fr_1fr_100px_140px_150px] gap-3 px-4 py-3 bg-[#F9F9F9] border-b border-[#C8C8C8]">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#1E1E1E] hover:text-[#4242EA] transition-colors text-left"
                                >
                                    Name
                                    <SortIcon columnKey="name" />
                                </button>
                                <button
                                    onClick={() => handleSort('email')}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#1E1E1E] hover:text-[#4242EA] transition-colors text-left"
                                >
                                    Email
                                    <SortIcon columnKey="email" />
                                </button>
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#1E1E1E] hover:text-[#4242EA] transition-colors text-left"
                                >
                                    Status
                                    <SortIcon columnKey="status" />
                                </button>
                                <div className="text-sm font-semibold text-[#1E1E1E]">Availability</div>
                                <button
                                    onClick={() => handleSort('cohorts')}
                                    className="flex items-center gap-1 text-sm font-semibold text-[#1E1E1E] hover:text-[#4242EA] transition-colors text-left"
                                >
                                    Cohorts
                                    <SortIcon columnKey="cohorts" />
                                </button>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-[#E3E3E3]">
                                {sortedVolunteers.map((volunteer, idx) => (
                                    <div
                                        key={volunteer.user_id}
                                        className={`grid grid-cols-[1fr_1fr_100px_140px_150px] gap-3 px-4 py-3 items-center hover:bg-[#F9F9F9] ${
                                            idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                                        }`}
                                    >
                                        {/* Name - Clickable to open profile modal */}
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:text-[#4242EA] transition-colors"
                                            onClick={() => setSelectedVolunteer(volunteer)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#4242EA]/20 flex items-center justify-center text-[#4242EA] font-medium text-sm">
                                                {volunteer.first_name?.charAt(0)}{volunteer.last_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-[#1E1E1E] hover:text-[#4242EA] underline-offset-2 hover:underline">
                                                    {volunteer.first_name} {volunteer.last_name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-sm text-[#666666] truncate">
                                            {volunteer.email}
                                        </div>

                                        <div>
                                            <StatusPopover
                                                volunteer={volunteer}
                                                token={token}
                                                onUpdate={fetchData}
                                            />
                                        </div>

                                        {/* Availability - Clickable popover for inline editing */}
                                        <AvailabilityPopover
                                            volunteer={volunteer}
                                            token={token}
                                            onUpdate={fetchData}
                                        />

                                        {/* Cohorts - Clickable popover for inline editing */}
                                        <CohortPopover
                                            volunteer={volunteer}
                                            cohorts={cohorts}
                                            token={token}
                                            onUpdate={fetchData}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Volunteer Profile Modal */}
            <VolunteerProfileModal
                volunteer={selectedVolunteer}
                open={!!selectedVolunteer}
                onOpenChange={(open) => !open && setSelectedVolunteer(null)}
                token={token}
                onUpdate={fetchData}
            />
        </div>
    );
}

export default VolunteerList;
