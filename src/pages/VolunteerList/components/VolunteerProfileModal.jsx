import { useState, useEffect } from 'react';
import { Mail, Phone, Globe, Linkedin, Calendar, MessageSquare, Mic, User, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import * as volunteerApi from '../../../services/volunteerApi';

function VolunteerProfileModal({ volunteer, open, onOpenChange, token, onUpdate }) {
    const [formData, setFormData] = useState({});
    const [feedback, setFeedback] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    useEffect(() => {
        if (volunteer && open) {
            setFormData({
                phone: volunteer.phone || '',
                preferred_contact_method: volunteer.preferred_contact_method || 'email',
                timezone: volunteer.timezone || '',
                skills: volunteer.skills || [],
                professional_background: volunteer.professional_background || '',
                linkedin_url: volunteer.linkedin_url || '',
                bio: volunteer.bio || '',
                staff_notes: volunteer.staff_notes || '',
                volunteer_status: volunteer.volunteer_status || 'active',
            });
            fetchFeedback();
        }
    }, [volunteer, open]);

    const fetchFeedback = async () => {
        if (!volunteer) return;
        setFeedbackLoading(true);
        try {
            const data = await volunteerApi.getFeedbackByUserId(volunteer.user_id, token);
            setFeedback(data.feedback || data || []);
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setFeedback([]);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update profile
            await volunteerApi.updateVolunteerProfile(volunteer.user_id, {
                phone: formData.phone,
                preferredContactMethod: formData.preferred_contact_method,
                timezone: formData.timezone,
                skills: formData.skills,
                professionalBackground: formData.professional_background,
                linkedinUrl: formData.linkedin_url,
                bio: formData.bio,
                staffNotes: formData.staff_notes,
            }, token);

            // Update status if changed
            if (formData.volunteer_status !== volunteer.volunteer_status) {
                await volunteerApi.updateVolunteerStatus(volunteer.user_id, formData.volunteer_status, token);
            }

            onUpdate();
            onOpenChange(false);
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('Failed to save profile changes');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatFeedbackDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!volunteer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4242EA]/20 flex items-center justify-center text-[#4242EA] font-medium">
                            {volunteer.first_name?.charAt(0)}{volunteer.last_name?.charAt(0)}
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-[#1E1E1E]">
                                {volunteer.first_name} {volunteer.last_name}
                            </div>
                            <div className="text-sm font-normal text-[#666666]">Volunteer Profile</div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="profile" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-[#F5F5F5]">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-white">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="contact" className="data-[state=active]:bg-white">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="data-[state=active]:bg-white">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Feedback
                            {feedback.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-[#4242EA] text-white text-xs rounded-full">
                                    {feedback.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-medium text-[#1E1E1E]">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={3}
                                className="border-[#C8C8C8] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="background" className="text-sm font-medium text-[#1E1E1E]">Professional Background</Label>
                            <Textarea
                                id="background"
                                value={formData.professional_background}
                                onChange={(e) => handleInputChange('professional_background', e.target.value)}
                                placeholder="Your professional experience and expertise..."
                                rows={3}
                                className="border-[#C8C8C8] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#1E1E1E]">Skills</Label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-[#C8C8C8] rounded-md bg-white">
                                {formData.skills?.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#4242EA]/10 text-[#4242EA] text-sm rounded-full"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSkills = formData.skills.filter((_, i) => i !== idx);
                                                setFormData(prev => ({ ...prev, skills: newSkills }));
                                            }}
                                            className="hover:bg-[#4242EA]/20 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder={formData.skills?.length ? "Add more..." : "Type a skill and press Enter..."}
                                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            e.preventDefault();
                                            const newSkill = e.target.value.trim();
                                            if (!formData.skills?.includes(newSkill)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    skills: [...(prev.skills || []), newSkill]
                                                }));
                                            }
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <p className="text-xs text-[#666666]">Press Enter to add a skill</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin" className="text-sm font-medium text-[#1E1E1E]">LinkedIn</Label>
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-[#666666]" />
                                <Input
                                    id="linkedin"
                                    value={formData.linkedin_url}
                                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="border-[#C8C8C8]"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-5 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#1E1E1E]">Email</Label>
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F5F5] rounded-md border border-[#E3E3E3]">
                                    <Mail className="w-4 h-4 text-[#666666]" />
                                    <span className="text-sm text-[#666666]">{volunteer.email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-[#1E1E1E]">Phone</Label>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#666666]" />
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className="border-[#C8C8C8]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-[#1E1E1E]">Preferred Contact</Label>
                                <Select
                                    value={formData.preferred_contact_method}
                                    onValueChange={(val) => handleInputChange('preferred_contact_method', val)}
                                >
                                    <SelectTrigger className="border-[#C8C8C8]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-[#C8C8C8]">
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone" className="text-sm font-medium text-[#1E1E1E]">Timezone</Label>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-[#666666]" />
                                    <Input
                                        id="timezone"
                                        value={formData.timezone}
                                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                                        placeholder="e.g., America/New_York"
                                        className="border-[#C8C8C8]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#E3E3E3] pt-4">
                            <h4 className="text-sm font-medium text-[#1E1E1E] mb-3">Status</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-[#666666]">Volunteer Status</Label>
                                    <Select
                                        value={formData.volunteer_status}
                                        onValueChange={(val) => handleInputChange('volunteer_status', val)}
                                    >
                                        <SelectTrigger className="border-[#C8C8C8]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-[#C8C8C8]">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="on_leave">On Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-[#666666]">Joined</Label>
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F5F5] rounded-md border border-[#E3E3E3]">
                                        <Calendar className="w-4 h-4 text-[#666666]" />
                                        <span className="text-sm text-[#666666]">{formatDate(volunteer.user_created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="staff_notes" className="text-sm font-medium text-[#1E1E1E]">Staff Notes</Label>
                            <Textarea
                                id="staff_notes"
                                value={formData.staff_notes}
                                onChange={(e) => handleInputChange('staff_notes', e.target.value)}
                                placeholder="Internal notes about this volunteer..."
                                rows={3}
                                className="border-[#C8C8C8] resize-none"
                            />
                        </div>

                        <div className="border-t border-[#E3E3E3] pt-4">
                            <h4 className="text-sm font-medium text-[#1E1E1E] mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Feedback History
                            </h4>

                            {feedbackLoading ? (
                                <div className="text-center py-6 text-[#666666]">Loading feedback...</div>
                            ) : feedback.length === 0 ? (
                                <div className="text-center py-8 text-[#999999] italic bg-[#F9F9F9] rounded-md border border-[#E3E3E3]">
                                    No feedback recorded yet
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {feedback.map((item, idx) => (
                                        <div
                                            key={item.feedback_id || idx}
                                            className="p-4 bg-[#F9F9F9] rounded-md border border-[#E3E3E3]"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 bg-[#4242EA]/10 text-[#4242EA] text-xs rounded-full font-medium">
                                                        {item.feedback_type}
                                                    </span>
                                                    <span className="text-xs text-[#666666]">
                                                        {formatFeedbackDate(item.feedback_date)}
                                                    </span>
                                                </div>
                                                {item.audio_recording_url && (
                                                    <a
                                                        href={item.audio_recording_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-2 py-1 text-xs text-[#4242EA] hover:bg-[#4242EA]/10 rounded"
                                                    >
                                                        <Mic className="w-3 h-3" />
                                                        Audio
                                                    </a>
                                                )}
                                            </div>

                                            {item.overall_experience && (
                                                <div className="mb-3">
                                                    <div className="text-xs font-medium text-[#666666] mb-1">Overall Experience</div>
                                                    <p className="text-sm text-[#1E1E1E]">{item.overall_experience}</p>
                                                </div>
                                            )}

                                            {item.improvement_suggestions && (
                                                <div className="mb-3">
                                                    <div className="text-xs font-medium text-[#666666] mb-1">Suggestions</div>
                                                    <p className="text-sm text-[#1E1E1E]">{item.improvement_suggestions}</p>
                                                </div>
                                            )}

                                            {item.specific_feedback && (
                                                <div>
                                                    <div className="text-xs font-medium text-[#666666] mb-1">Specific Feedback</div>
                                                    <p className="text-sm text-[#1E1E1E]">{item.specific_feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[#E3E3E3]">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-[#C8C8C8]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#4242EA] hover:bg-[#3333DD] text-white"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default VolunteerProfileModal;
