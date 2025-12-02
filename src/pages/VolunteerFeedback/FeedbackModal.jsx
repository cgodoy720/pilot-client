import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';

function FeedbackModal({ isOpen, onClose, onSubmit, token, isEditing = false, initialData = null }) {
    const [formData, setFormData] = useState({
        feedbackDate: '',
        feedbackType: '',
        overallExperience: '',
        improvementSuggestions: '',
        specificFeedback: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Set today's date as default when modal opens, or use initial data for editing
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData(initialData);
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, feedbackDate: today }));
            }
        }
    }, [isOpen, isEditing, initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user types
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, feedbackType: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.feedbackDate || !formData.feedbackType) {
            setError('Please select both a date and feedback type.');
            return;
        }

        if (!formData.overallExperience.trim()) {
            setError('Please answer: How was your experience overall?');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                onSubmit(data.feedback);
                // Reset form
                setFormData({
                    feedbackDate: '',
                    feedbackType: '',
                    overallExperience: '',
                    improvementSuggestions: '',
                    specificFeedback: ''
                });
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to submit feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                feedbackDate: '',
                feedbackType: '',
                overallExperience: '',
                improvementSuggestions: '',
                specificFeedback: ''
            });
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white text-[#1E1E1E] border-[#C8C8C8]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-[#1E1E1E]">
                        {isEditing ? 'Edit Feedback' : 'Record Feedback'}
                    </DialogTitle>
                    <DialogDescription className="text-[#666666]">
                        Share your insights and experiences from your volunteer session.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="feedbackDate" className="text-[#1E1E1E] font-medium">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            id="feedbackDate"
                            name="feedbackDate"
                            value={formData.feedbackDate}
                            onChange={handleInputChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="bg-white border-[#C8C8C8] text-[#1E1E1E] focus:border-[#4242EA] focus:ring-[#4242EA]"
                        />
                    </div>

                    {/* Feedback Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="feedbackType" className="text-[#1E1E1E] font-medium">
                            Event Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.feedbackType} onValueChange={handleSelectChange}>
                            <SelectTrigger className="bg-white border-[#C8C8C8] text-[#1E1E1E] focus:border-[#4242EA] focus:ring-[#4242EA]">
                                <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#C8C8C8]">
                                <SelectItem value="AI Native Class" className="text-[#1E1E1E] focus:bg-[#EFEFEF]">AI Native Class</SelectItem>
                                <SelectItem value="Demo Day" className="text-[#1E1E1E] focus:bg-[#EFEFEF]">Demo Day</SelectItem>
                                <SelectItem value="Networking Event" className="text-[#1E1E1E] focus:bg-[#EFEFEF]">Networking Event</SelectItem>
                                <SelectItem value="Panel" className="text-[#1E1E1E] focus:bg-[#EFEFEF]">Panel</SelectItem>
                                <SelectItem value="Mock Interview" className="text-[#1E1E1E] focus:bg-[#EFEFEF]">Mock Interview</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Question 1: Overall Experience (Mandatory) */}
                    <div className="space-y-2">
                        <Label htmlFor="overallExperience" className="text-[#1E1E1E] font-medium">
                            1. How was your experience overall? <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="overallExperience"
                            name="overallExperience"
                            value={formData.overallExperience}
                            onChange={handleInputChange}
                            placeholder="Share your thoughts..."
                            rows={4}
                            required
                            className="bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999999] focus:border-[#4242EA] focus:ring-[#4242EA] resize-none"
                        />
                    </div>

                    {/* Question 2: Improvement Suggestions (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="improvementSuggestions" className="text-[#1E1E1E] font-medium">
                            2. How could we improve going forward?
                        </Label>
                        <Textarea
                            id="improvementSuggestions"
                            name="improvementSuggestions"
                            value={formData.improvementSuggestions}
                            onChange={handleInputChange}
                            placeholder="Optional suggestions..."
                            rows={3}
                            className="bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999999] focus:border-[#4242EA] focus:ring-[#4242EA] resize-none"
                        />
                    </div>

                    {/* Question 3: Specific Feedback (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="specificFeedback" className="text-[#1E1E1E] font-medium">
                            3. Do you have feedback to share on specific Builders or Fellows?
                        </Label>
                        <Textarea
                            id="specificFeedback"
                            name="specificFeedback"
                            value={formData.specificFeedback}
                            onChange={handleInputChange}
                            placeholder="Optional feedback on individuals..."
                            rows={3}
                            className="bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999999] focus:border-[#4242EA] focus:ring-[#4242EA] resize-none"
                        />
                    </div>

                    <DialogFooter className="pt-4 border-t border-[#E3E3E3] gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="bg-white border-[#C8C8C8] text-[#666666] hover:bg-[#EFEFEF] hover:text-[#1E1E1E]"
                        >
                            Cancel
                        </Button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative overflow-hidden inline-flex justify-center items-center px-6 py-2 h-10 bg-[#4242EA] border border-[#4242EA] rounded-md font-medium text-sm text-white cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                                {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Feedback' : 'Submit Feedback')}
                            </span>
                            {!isSubmitting && (
                                <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackModal;
