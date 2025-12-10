import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import * as volunteerApi from '../../../services/volunteerApi';

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'on_leave', label: 'On Leave', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
];

function StatusPopover({ volunteer, token, onUpdate }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentStatus = volunteer.volunteer_status || 'active';
    const currentOption = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0];

    const handleStatusChange = async (newStatus) => {
        if (newStatus === currentStatus) {
            setOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            await volunteerApi.updateVolunteerStatus(volunteer.user_id, newStatus, token);
            onUpdate();
            setOpen(false);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild onClick={handleTriggerClick}>
                <button
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${currentOption.color}`}
                >
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        currentOption.label
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                    <div className="text-xs font-medium text-[#666666] px-2 pb-2 border-b border-[#E3E3E3]">
                        Change Status
                    </div>
                    {STATUS_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            disabled={isLoading}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-[#F5F5F5] transition-colors ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${option.color}`}>
                                {option.label}
                            </span>
                            {currentStatus === option.value && (
                                <Check className="w-4 h-4 text-[#4242EA]" />
                            )}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default StatusPopover;
