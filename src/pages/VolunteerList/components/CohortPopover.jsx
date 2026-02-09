import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';
import * as volunteerApi from '../../../services/volunteerApi';

// Color mapping for cohort pills
const COHORT_COLORS = {
    'December 2025': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'June 2025': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'March 2025': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'September 2025': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    'default': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// Get color classes for a cohort name
const getCohortColors = (cohortName) => {
    // Check for exact match first
    if (COHORT_COLORS[cohortName]) {
        return COHORT_COLORS[cohortName];
    }
    // Check for partial matches (e.g., "December" in name)
    if (cohortName.toLowerCase().includes('december')) {
        return COHORT_COLORS['December 2025'];
    }
    if (cohortName.toLowerCase().includes('june')) {
        return COHORT_COLORS['June 2025'];
    }
    if (cohortName.toLowerCase().includes('march')) {
        return COHORT_COLORS['March 2025'];
    }
    if (cohortName.toLowerCase().includes('september')) {
        return COHORT_COLORS['September 2025'];
    }
    return COHORT_COLORS['default'];
};

function CohortPopover({ volunteer, cohorts, token, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [loadingCohorts, setLoadingCohorts] = useState({});

    const assignedCohorts = volunteer.assigned_cohorts || [];

    const handleCohortToggle = async (cohortName, isCurrentlyAssigned) => {
        setLoadingCohorts(prev => ({ ...prev, [cohortName]: true }));

        try {
            if (isCurrentlyAssigned) {
                await volunteerApi.removeVolunteerFromCohort(volunteer.user_id, cohortName, token);
            } else {
                await volunteerApi.assignVolunteerToCohort(volunteer.user_id, cohortName, null, token);
            }
            onUpdate();
        } catch (err) {
            console.error('Error updating cohort assignment:', err);
            alert(`Failed to ${isCurrentlyAssigned ? 'remove' : 'assign'} cohort`);
        } finally {
            setLoadingCohorts(prev => ({ ...prev, [cohortName]: false }));
        }
    };

    const handleTriggerClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild onClick={handleTriggerClick}>
                <div className="cursor-pointer hover:bg-[#4242EA]/5 rounded p-1 -m-1 transition-colors">
                    {assignedCohorts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {assignedCohorts.slice(0, 2).map(c => {
                                const colors = getCohortColors(c);
                                return (
                                    <span
                                        key={c}
                                        className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${colors.bg} ${colors.text}`}
                                    >
                                        {c}
                                    </span>
                                );
                            })}
                            {assignedCohorts.length > 2 && (
                                <span className="text-xs text-[#666666]">
                                    +{assignedCohorts.length - 2}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-[#999999] italic text-sm">Click to assign</span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                    <div className="font-medium text-sm text-[#1E1E1E]">
                        Assign Cohorts
                    </div>
                    <div className="text-xs text-[#666666]">
                        {volunteer.first_name} {volunteer.last_name}
                    </div>
                    <div className="border-t border-[#E3E3E3] pt-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {cohorts.length === 0 ? (
                            <div className="text-sm text-[#999999] italic">No cohorts available</div>
                        ) : (
                            cohorts.map(cohort => {
                                const isAssigned = assignedCohorts.includes(cohort);
                                const isLoading = loadingCohorts[cohort];
                                const colors = getCohortColors(cohort);

                                return (
                                    <div
                                        key={cohort}
                                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[#F5F5F5] cursor-pointer"
                                        onClick={() => !isLoading && handleCohortToggle(cohort, isAssigned)}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-[#4242EA]" />
                                        ) : (
                                            <Checkbox
                                                checked={isAssigned}
                                                onCheckedChange={() => handleCohortToggle(cohort, isAssigned)}
                                                className="border-[#C8C8C8] data-[state=checked]:bg-[#4242EA] data-[state=checked]:border-[#4242EA]"
                                            />
                                        )}
                                        <span className={`text-sm px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                            {cohort}
                                        </span>
                                        {isAssigned && !isLoading && (
                                            <Check className="w-3 h-3 text-green-600 ml-auto" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default CohortPopover;
