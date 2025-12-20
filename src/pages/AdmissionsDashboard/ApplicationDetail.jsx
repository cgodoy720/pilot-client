import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesSidebar from '../../components/NotesSidebar';
import BulkActionsModal from '../../components/BulkActionsModal';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';

// Utility functions for formatting response values
const formatResponseValue = (value, questionType) => {
    if (!value) return <span className="text-gray-400 italic">No response provided</span>;

    // Try to detect if the value is an array (JSON string)
    try {
        const parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) {
            return (
                <ul className="list-disc list-inside space-y-1">
                    {parsedValue.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        }
    } catch (e) {
        // Not a valid JSON, continue with other formatting
    }

    // Check for date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (e) {
            // Not a valid date, continue with other formatting
        }
    }

    // Check for phone number format
    if (/^\d{10}$/.test(value.replace(/\D/g, ''))) {
        const cleaned = value.replace(/\D/g, '');
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }

    // Check for dollar amount
    if (/^\$?\d+(\.\d{2})?$/.test(value.replace(/,/g, ''))) {
        const amount = parseFloat(value.replace(/[$,]/g, ''));
        if (!isNaN(amount)) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
    }

    // Check if it's a number that should be formatted
    if (/^\d+(\.\d+)?$/.test(value) && questionType?.toLowerCase().includes('income')) {
        const number = parseFloat(value);
        if (!isNaN(number)) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        }
    }

    // Default: return as is
    return value;
};

// Create shorthand labels for common questions
const getShorthandLabel = (prompt, questionId) => {
    if (!prompt) return 'Unknown Question';

    // Special handling for key analysis questions
    const keyQuestionLabels = {
        1046: 'Education & Work History',
        1052: 'AI Perspectives & Career Impact',
        1053: 'Personal Background Story',
        1055: 'AI Learning Questions Used',
        1056: 'Neural Network Definition',
        1057: 'Neural Network Structure & Function',
        1059: 'Most Intriguing Neural Network Aspect',
        1061: 'Learning About Intriguing Aspect',
        1062: 'AI Tools Learning Process Impact'
    };

    if (questionId && keyQuestionLabels[questionId]) {
        return keyQuestionLabels[questionId];
    }

    const lowercasePrompt = prompt.toLowerCase();

    // Common question mappings
    if (lowercasePrompt.includes('first name')) return 'First Name';
    if (lowercasePrompt.includes('last name')) return 'Last Name';
    if (lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('birthday')) return 'Date of Birth';
    if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('personal income')) return 'Personal Annual Income';
    if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('household income')) return 'Household Annual Income';
    if (lowercasePrompt.includes('annual') && lowercasePrompt.includes('income') && !lowercasePrompt.includes('personal') && !lowercasePrompt.includes('household')) return 'Annual Income';
    if (lowercasePrompt.includes('home address') || lowercasePrompt.includes('street address')) return 'Address';
    if (lowercasePrompt.includes('phone') || lowercasePrompt.includes('mobile')) return 'Phone';
    if (lowercasePrompt.includes('email')) return 'Email';
    if (lowercasePrompt.includes('gender')) return 'Gender';
    if (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity')) return 'Race/Ethnicity';
    if (lowercasePrompt.includes('education') && lowercasePrompt.includes('level')) return 'Education Level';
    if (lowercasePrompt.includes('work') && lowercasePrompt.includes('experience')) return 'Work Experience';
    if (lowercasePrompt.includes('why') && lowercasePrompt.includes('pursuit')) return 'Why Pursuit?';
    if (lowercasePrompt.includes('programming') && lowercasePrompt.includes('experience')) return 'Programming Experience';
    if (lowercasePrompt.includes('obstacle') || lowercasePrompt.includes('challenge')) return 'Challenges/Obstacles';
    if (lowercasePrompt.includes('goal') || lowercasePrompt.includes('career')) return 'Career Goals';
    if (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact')) return 'Reference Contact';
    if (lowercasePrompt.includes('privacy') && lowercasePrompt.includes('policy')) return 'Privacy Policy Agreement';
    if (lowercasePrompt.includes('citizen') || lowercasePrompt.includes('authorized')) return 'Work Authorization';
    if (lowercasePrompt.includes('conviction') || lowercasePrompt.includes('criminal')) return 'Criminal Background';

    // If no match found, try to create a shortened version
    if (prompt.length > 50) {
        return prompt.substring(0, 47) + '...';
    }

    return prompt;
};

// Helper function to convert arrays or semicolon-separated text to bullet points
const formatBulletPoints = (data) => {
    if (!data) return null;

    let points = [];

    // Check if data is already an array
    if (Array.isArray(data)) {
        points = data.filter(item => item && item.trim());
    } else if (typeof data === 'string') {
        // Try to parse as JSON first (in case it's a JSON string)
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                points = parsed.filter(item => item && item.trim());
            } else {
                // Fall back to semicolon-separated splitting
                points = data.split(';').map(item => item.trim()).filter(item => item);
            }
        } catch (e) {
            // Not valid JSON, split by semicolons
            points = data.split(';').map(item => item.trim()).filter(item => item);
        }
    }

    if (points.length === 0) return null;

    // Return as bullet point list
    return (
        <ul className="list-disc list-inside space-y-1">
            {points.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
        </ul>
    );
};

// Create logical groupings based on question content instead of database sections
const getQuestionCategory = (prompt) => {
    if (!prompt) return 'Other';

    const lowercasePrompt = prompt.toLowerCase();

    // Personal/Basic Information
    if (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') ||
        lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('email') ||
        lowercasePrompt.includes('phone') || lowercasePrompt.includes('address') ||
        lowercasePrompt.includes('gender')) {
        return 'Personal Information';
    }

    // Background & Demographics
    if (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity') ||
        lowercasePrompt.includes('education') || lowercasePrompt.includes('income') ||
        lowercasePrompt.includes('citizen') || lowercasePrompt.includes('authorized')) {
        return 'Background & Demographics';
    }

    // Experience & Work
    if (lowercasePrompt.includes('work') || lowercasePrompt.includes('job') ||
        lowercasePrompt.includes('experience') || lowercasePrompt.includes('programming') ||
        lowercasePrompt.includes('technical')) {
        return 'Experience & Background';
    }

    // References & Additional
    if (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact') ||
        lowercasePrompt.includes('privacy') || lowercasePrompt.includes('conviction') ||
        lowercasePrompt.includes('criminal')) {
        return 'Additional Information';
    }

    return 'Other';
};

const ApplicationDetail = () => {
    const { applicationId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applicationData, setApplicationData] = useState(null);

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(false);

    // Actions modal management
    const [actionsModalOpen, setActionsModalOpen] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);

    // Email tracking data
    const [emailTrackingData, setEmailTrackingData] = useState(null);
    const [emailTrackingLoading, setEmailTrackingLoading] = useState(false);

    // Collapsible sections state - all collapsed by default
    const [expandedSections, setExpandedSections] = useState({});

    // Toggle section expansion
    const toggleSection = useCallback((sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    }, []);

    // Fetch application details
    const fetchApplicationDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/application/${applicationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch application details');
            }

            const data = await response.json();
            console.log('📋 Application Detail Data:', data);
            console.log('🔍 Deferred status:', data.application?.deferred);
            console.log('📅 Deferred at:', data.application?.deferred_at);
            setApplicationData(data);
            
            // Also fetch email tracking data
            if (data.applicant?.applicant_id) {
                fetchEmailTrackingData(data.applicant.applicant_id);
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
            setError('Failed to load application details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch email tracking data
    const fetchEmailTrackingData = async (applicantId) => {
        try {
            setEmailTrackingLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicantId}/email-tracking`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEmailTrackingData(data);
            } else {
                console.log('No email tracking data available for this applicant');
                setEmailTrackingData(null);
            }
        } catch (error) {
            console.error('Error fetching email tracking data:', error);
            setEmailTrackingData(null);
        } finally {
            setEmailTrackingLoading(false);
        }
    };

    useEffect(() => {
        if (applicationId && token) {
            fetchApplicationDetail();
        }
    }, [applicationId, token]);

    // Handle notes modal
    const openNotesSidebar = () => {
        setNotesModalOpen(true);
    };

    const closeNotesSidebar = () => {
        setNotesModalOpen(false);
    };

    // Handle actions modal
    const openActionsModal = () => {
        setActionsModalOpen(true);
    };

    const closeActionsModal = () => {
        setActionsModalOpen(false);
    };

    // Handle single applicant action
    const handleApplicantAction = async (action, customSubject = '', customBody = '') => {
        if (!applicant?.applicant_id) return;

        setActionInProgress(true);
        try {
            const requestBody = {
                action,
                applicant_ids: [applicant.applicant_id]
            };

            if (action === 'send_custom_email') {
                requestBody.custom_subject = customSubject;
                requestBody.custom_body = customBody;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/bulk-actions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Action completed:', result);
                
                // Refresh application data
                await fetchApplicationDetail();
                
                // Close modal
                setActionsModalOpen(false);
                
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: result.message || 'Action completed successfully',
                    confirmButtonColor: '#4242ea',
                    timer: 2000,
                    showConfirmButton: true
                });
            } else {
                const errorData = await response.json();
                console.error('Action failed:', errorData);
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.error || 'Failed to perform action. Please try again.',
                    confirmButtonColor: '#dc3545',
                });
            }
        } catch (error) {
            console.error('Error performing action:', error);
            
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again.',
                confirmButtonColor: '#dc3545',
            });
        } finally {
            setActionInProgress(false);
        }
    };

    // Memoize the processed responses to avoid re-computation on every render
    // This must be called before any conditional returns (Rules of Hooks)
    const processedResponses = useMemo(() => {
        const responses = applicationData?.responses;
        const questions = applicationData?.questions;
        
        if (!responses || !questions || responses.length === 0) {
            return { keyResponses: [], responsesByCategory: {}, categoryOrder: [], keyAnalysisQuestions: [] };
        }

        // Define the 9 key analysis questions in order
        const keyAnalysisQuestions = [
            1046, 1052, 1053, 1055, 1056, 1057, 1059, 1061, 1062
        ];

        // Separate key analysis questions from other responses
        const keyResponses = [];
        const otherResponses = [];

        // Create a question lookup map for O(1) access
        const questionMap = new Map(questions.map(q => [q.question_id, q]));

        responses.forEach(response => {
            const question = questionMap.get(response.question_id);
            if (question) {
                const responseData = {
                    response,
                    question,
                    shortLabel: getShorthandLabel(question.prompt, question.question_id)
                };

                if (keyAnalysisQuestions.includes(question.question_id)) {
                    keyResponses.push(responseData);
                } else {
                    otherResponses.push(responseData);
                }
            }
        });

        // Sort key responses by the defined order
        keyResponses.sort((a, b) => {
            const indexA = keyAnalysisQuestions.indexOf(a.question.question_id);
            const indexB = keyAnalysisQuestions.indexOf(b.question.question_id);
            return indexA - indexB;
        });

        // Group other responses by logical categories
        const responsesByCategory = {};
        const categoryOrder = [
            'Personal Information',
            'Background & Demographics',
            'Experience & Background',
            'Additional Information',
            'Other'
        ];

        otherResponses.forEach(responseData => {
            const category = getQuestionCategory(responseData.question.prompt);
            if (!responsesByCategory[category]) {
                responsesByCategory[category] = [];
            }
            responsesByCategory[category].push(responseData);
        });

        return {
            keyResponses,
            keyAnalysisQuestions,
            responsesByCategory,
            categoryOrder: categoryOrder.filter(category => responsesByCategory[category]?.length > 0)
        };
    }, [applicationData]);

    // Loading state
    if (loading) {
        return (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-proxima">Loading application details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">{error}</p>
                        <Button onClick={fetchApplicationDetail} className="w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No data state
    if (!applicationData) {
        return (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Application Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">The requested application could not be found.</p>
                        <Button 
                            onClick={() => navigate('/admissions-dashboard?tab=applications')} 
                            className="w-full"
                        >
                            Back to Admissions
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { applicant, application, assessment, responses, questions } = applicationData;

    return (
        <div className="w-full h-full bg-[#f5f5f5] overflow-auto font-proxima">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/admissions-dashboard?tab=applications')}
                            className="font-proxima"
                        >
                            ← Back to Applicants
                        </Button>
                        <Badge 
                            className={`
                                ${application.status === 'submitted' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                ${application.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                                ${application.status === 'no_application' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                                ${application.status === 'ineligible' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                                font-proxima
                            `}
                        >
                            {application.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">Applicant Details</h1>
                </div>
            </div>

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Main Info Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side - Applicant Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">
                                        {applicant.first_name} {applicant.last_name}
                                        {assessment?.has_masters_degree && (
                                            <span className="ml-2 text-xl" title="Has Masters Degree">🎓</span>
                                        )}
                                    </h2>
                                    {assessment && assessment.recommendation && (
                                        <Badge 
                                            className={`
                                                text-xs px-2 py-0.5
                                                ${assessment.recommendation === 'strong_recommend' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                ${assessment.recommendation === 'recommend' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                                ${assessment.recommendation === 'review_needed' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                                ${assessment.recommendation === 'not_recommend' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                                                font-proxima-bold
                                            `}
                                        >
                                            {assessment.recommendation === 'strong_recommend' && '✓'}
                                            {assessment.recommendation === 'recommend' && '✓'}
                                            {assessment.recommendation === 'review_needed' && '⚠️'}
                                            {assessment.recommendation === 'not_recommend' && '✗'}
                                            <span className="ml-1">{assessment.recommendation.replace('_', ' ')}</span>
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="font-proxima">{applicant.email}</p>
                                    <p className="font-proxima text-gray-500">
                                        Applied: {new Date(application.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={openNotesSidebar}
                                        className="font-proxima"
                                    >
                                        📝 Notes
                                    </Button>
                                    <Button
                                        onClick={openActionsModal}
                                        className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
                                    >
                                        ⚡ Actions
                                    </Button>
                                </div>
                                
                                {/* Deferral Status & Deliberation Section - Side by Side */}
                                {application?.status === 'submitted' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Deferral Status Display (Read-only) */}
                                        {application?.deferred && (
                                            <Card className="border-yellow-400 bg-yellow-50">
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-yellow-700">
                                                            <span className="text-lg">📅</span>
                                                            <strong className="font-proxima-bold text-sm">Application Deferred</strong>
                                                        </div>
                                                        <p className="text-xs text-gray-600 font-proxima">
                                                            Deferred on {new Date(application.deferred_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-proxima italic">
                                                            Use Actions menu to remove deferral
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                        
                                        {/* Deliberation Section */}
                                        <Card className={`border-purple-200 bg-purple-50 ${!application?.deferred ? 'md:col-span-2' : ''}`}>
                                            <CardContent className="p-4 space-y-3">
                                                <strong className="font-proxima-bold text-sm">Deliberation Status</strong>
                                                <Select
                                                    value={application?.deliberation || '_none'}
                                                    onValueChange={(value) => {
                                                        const newValue = value === '_none' ? null : value;
                                                        // Call API to update
                                                        fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicant.applicant_id}/deliberation`, {
                                                            method: 'PATCH',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ deliberation: newValue })
                                                        })
                                                        .then(response => {
                                                            if (!response.ok) throw new Error('Failed to update');
                                                            return response.json();
                                                        })
                                                        .then(() => {
                                                            // Update local state
                                                            setApplicationData(prev => ({
                                                                ...prev,
                                                                application: {
                                                                    ...prev.application,
                                                                    deliberation: newValue
                                                                }
                                                            }));
                                                            Swal.fire({
                                                                icon: 'success',
                                                                title: 'Updated!',
                                                                text: 'Deliberation status has been updated',
                                                                timer: 1500,
                                                                showConfirmButton: false
                                                            });
                                                        })
                                                        .catch(error => {
                                                            console.error('Error updating deliberation:', error);
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Error',
                                                                text: 'Failed to update deliberation status'
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className={`
                                                        ${application?.deliberation === 'yes' ? 'bg-green-100 border-green-300' : ''}
                                                        ${application?.deliberation === 'maybe' ? 'bg-yellow-100 border-yellow-300' : ''}
                                                        ${application?.deliberation === 'no' ? 'bg-red-100 border-red-300' : ''}
                                                        ${!application?.deliberation ? 'bg-gray-100 border-gray-300' : ''}
                                                        font-proxima-bold h-9 text-sm
                                                    `}>
                                                        <SelectValue placeholder="Not Set" />
                                                    </SelectTrigger>
                                                    <SelectContent className="font-proxima">
                                                        <SelectItem value="_none">Not Set</SelectItem>
                                                        <SelectItem value="yes">✓ Yes - Admit</SelectItem>
                                                        <SelectItem value="maybe">? Maybe - Review</SelectItem>
                                                        <SelectItem value="no">✗ No - Decline</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>

                            {/* Right side - Assessment Scores */}
                            <div className="flex-1">
                                {assessment && assessment.recommendation ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Overall Score */}
                                            <div className="col-span-2 flex flex-col items-center p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                                                <div className="relative w-24 h-24">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                        <circle 
                                                            cx="50" 
                                                            cy="50" 
                                                            r="40" 
                                                            fill="none" 
                                                            stroke="url(#overallGradient)" 
                                                            strokeWidth="8"
                                                            strokeDasharray={`${(assessment.overall_score / 100) * 251.2} 251.2`}
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#06d6a0" />
                                                                <stop offset="50%" stopColor="#4ecdc4" />
                                                                <stop offset="100%" stopColor="#45b7d1" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-[#1a1a1a] font-proxima-bold">{assessment.overall_score}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-semibold text-gray-700 mt-1.5 font-proxima-bold">Overall Score</p>
                                            </div>

                                            {/* Learning Score */}
                                            <div className="flex flex-col items-center p-2 bg-gradient-to-br from-red-50 to-cyan-50 rounded-lg">
                                                <div className="relative w-16 h-16">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                        <circle 
                                                            cx="50" 
                                                            cy="50" 
                                                            r="40" 
                                                            fill="none" 
                                                            stroke="url(#learningGradient)" 
                                                            strokeWidth="8"
                                                            strokeDasharray={`${(assessment.learning_score / 100) * 251.2} 251.2`}
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="learningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ff6b6b" />
                                                                <stop offset="50%" stopColor="#4ecdc4" />
                                                                <stop offset="100%" stopColor="#45b7d1" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-base font-bold text-[#1a1a1a] font-proxima-bold">{assessment.learning_score}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-semibold text-gray-700 mt-1 text-center font-proxima-bold leading-tight">Learning<br/>Ability</p>
                                            </div>

                                            {/* Grit Score */}
                                            <div className="flex flex-col items-center p-2 bg-gradient-to-br from-yellow-50 to-red-50 rounded-lg">
                                                <div className="relative w-16 h-16">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                        <circle 
                                                            cx="50" 
                                                            cy="50" 
                                                            r="40" 
                                                            fill="none" 
                                                            stroke="url(#gritGradient)" 
                                                            strokeWidth="8"
                                                            strokeDasharray={`${(assessment.grit_score / 100) * 251.2} 251.2`}
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="gritGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ffd93d" />
                                                                <stop offset="50%" stopColor="#ff9a3c" />
                                                                <stop offset="100%" stopColor="#ff6b6b" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-base font-bold text-[#1a1a1a] font-proxima-bold">{assessment.grit_score}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-semibold text-gray-700 mt-1 text-center font-proxima-bold leading-tight">Grit &<br/>Perseverance</p>
                                            </div>

                                            {/* Critical Thinking Score */}
                                            <div className="col-span-2 flex flex-col items-center p-2 bg-gradient-to-br from-purple-50 to-cyan-50 rounded-lg">
                                                <div className="relative w-16 h-16">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                        <circle 
                                                            cx="50" 
                                                            cy="50" 
                                                            r="40" 
                                                            fill="none" 
                                                            stroke="url(#thinkingGradient)" 
                                                            strokeWidth="8"
                                                            strokeDasharray={`${(assessment.critical_thinking_score / 100) * 251.2} 251.2`}
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="thinkingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#a855f7" />
                                                                <stop offset="50%" stopColor="#3b82f6" />
                                                                <stop offset="100%" stopColor="#06b6d4" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-base font-bold text-[#1a1a1a] font-proxima-bold">{assessment.critical_thinking_score}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-semibold text-gray-700 mt-1 text-center font-proxima-bold">Critical Thinking</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <Badge variant="secondary" className="text-lg px-6 py-3 font-proxima">
                                            Assessment Pending
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assessment Flags */}
                        {assessment && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {assessment.missing_count > 0 && (
                                    <Badge variant="outline" className="border-yellow-400 text-yellow-700 font-proxima">
                                        <span className="mr-1">⚠️</span>
                                        {assessment.missing_count} key question{assessment.missing_count > 1 ? 's' : ''} incomplete
                                    </Badge>
                                )}

                                {(() => {
                                    const creationQuestion = responses?.find(r => {
                                        const question = questions?.find(q => q.question_id === r.question_id);
                                        return question?.prompt?.toLowerCase().includes('created') &&
                                            question?.prompt?.toLowerCase().includes('share') &&
                                            question?.prompt?.toLowerCase().includes('link');
                                    });

                                    if (creationQuestion?.response_value && creationQuestion.response_value.trim()) {
                                        const isUrl = /^https?:\/\//.test(creationQuestion.response_value.trim());
                                        return (
                                            <Badge variant="outline" className="border-blue-400 text-blue-700 font-proxima">
                                                <span className="mr-1">🔗</span>
                                                Shared creation: {isUrl ? (
                                                    <a
                                                        href={creationQuestion.response_value.trim()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline ml-1 hover:text-blue-800"
                                                    >
                                                        {creationQuestion.response_value.trim()}
                                                    </a>
                                                ) : (
                                                    <span className="ml-1">{creationQuestion.response_value.trim()}</span>
                                                )}
                                            </Badge>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}

                        {/* Detailed Analysis - Collapsible */}
                        {assessment && assessment.recommendation && (
                            <div className="mt-6">
                                <Collapsible>
                                    <CollapsibleTrigger className="flex items-center gap-2 text-[#4242ea] hover:text-[#3333d1] font-proxima-bold">
                                        📋 View Detailed Analysis
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4 space-y-4">
                                        {assessment.strengths && (
                                            <div>
                                                <h4 className="font-proxima-bold text-green-700 mb-2">Strengths</h4>
                                                <div className="text-gray-700 font-proxima">{formatBulletPoints(assessment.strengths)}</div>
                                            </div>
                                        )}

                                        {assessment.concerns && (
                                            <div>
                                                <h4 className="font-proxima-bold text-yellow-700 mb-2">Areas of Concern</h4>
                                                <div className="text-gray-700 font-proxima">{formatBulletPoints(assessment.concerns)}</div>
                                            </div>
                                        )}

                                        {assessment.weaknesses && (
                                            <div>
                                                <h4 className="font-proxima-bold text-red-700 mb-2">Weaknesses</h4>
                                                <div className="text-gray-700 font-proxima">{formatBulletPoints(assessment.weaknesses)}</div>
                                            </div>
                                        )}

                                        {assessment.areas_for_development && (
                                            <div>
                                                <h4 className="font-proxima-bold text-blue-700 mb-2">Areas for Development</h4>
                                                <div className="text-gray-700 font-proxima">{formatBulletPoints(assessment.areas_for_development)}</div>
                                            </div>
                                        )}

                                        {assessment.analysis_notes && (
                                            <div>
                                                <h4 className="font-proxima-bold text-gray-700 mb-2">Analysis Notes</h4>
                                                <p className="text-gray-700 font-proxima">{assessment.analysis_notes}</p>
                                            </div>
                                        )}

                                        {assessment.recommendation_reason && (
                                            <div>
                                                <h4 className="font-proxima-bold text-gray-700 mb-2">Recommendation Reasoning</h4>
                                                <p className="text-gray-700 font-proxima">{assessment.recommendation_reason}</p>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-500 font-proxima">
                                            Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
                                        </p>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Application Responses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-proxima-bold">Application Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {responses && responses.length > 0 ? (
                            <div className="space-y-4">
                                {/* Key Analysis Questions Section */}
                                {processedResponses.keyResponses.length > 0 && (
                                    <Collapsible 
                                        key="key-analysis" 
                                        open={expandedSections['key-analysis']}
                                        onOpenChange={() => toggleSection('key-analysis')}
                                        className="border rounded-lg"
                                    >
                                        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">{expandedSections['key-analysis'] ? '▼' : '▶'}</span>
                                                <span className="font-proxima-bold">Key Analysis Questions</span>
                                                <Badge variant="secondary" className="font-proxima">{processedResponses.keyResponses.length}</Badge>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="p-4 space-y-4">
                                            {processedResponses.keyResponses.map(({ response, question, shortLabel }, index) => (
                                                <div key={response.question_id || index} className="border-b last:border-b-0 pb-4 last:pb-0">
                                                    <div className="mb-2">
                                                        <h4 className="font-proxima-bold text-gray-900 flex items-center gap-2">
                                                            <Badge variant="outline" className="font-proxima">
                                                                Q{processedResponses.keyAnalysisQuestions.indexOf(question.question_id) + 1}
                                                            </Badge>
                                                            {shortLabel}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1 font-proxima italic">{question.prompt}</p>
                                                    </div>
                                                    <div className="text-gray-700 font-proxima">
                                                        {response.response_value ? (
                                                            <div>{formatResponseValue(response.response_value, question?.response_type)}</div>
                                                        ) : (
                                                            <p className="text-gray-400 italic">No response provided</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}

                                {/* Other Categories */}
                                {processedResponses.categoryOrder.map(category => {
                                    const sectionKey = category.toLowerCase().replace(/\s+/g, '-');
                                    const isExpanded = expandedSections[sectionKey];

                                    return (
                                        <Collapsible 
                                            key={category} 
                                            open={isExpanded}
                                            onOpenChange={() => toggleSection(sectionKey)}
                                            className="border rounded-lg"
                                        >
                                            <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                                                    <span className="font-proxima-bold">{category}</span>
                                                    <Badge variant="secondary" className="font-proxima">{processedResponses.responsesByCategory[category].length}</Badge>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="p-4 space-y-4">
                                                {processedResponses.responsesByCategory[category].map(({ response, question, shortLabel }, index) => (
                                                    <div key={response.question_id || index} className="border-b last:border-b-0 pb-4 last:pb-0">
                                                        <div className="mb-2">
                                                            <h4 className="font-proxima-bold text-gray-900">{shortLabel}</h4>
                                                        </div>
                                                        <div className="text-gray-700 font-proxima">
                                                            {response.response_value ? (
                                                                <div>{formatResponseValue(response.response_value, question?.response_type)}</div>
                                                            ) : (
                                                                <p className="text-gray-400 italic">No response provided</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-proxima">No responses found for this application.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Email Tracking Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-proxima-bold">Email Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {emailTrackingLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-proxima">Loading email tracking data...</p>
                                </div>
                            </div>
                        ) : emailTrackingData ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="p-4 text-center">
                                            <div className="text-3xl font-bold text-blue-700 font-proxima-bold">
                                                {Math.floor(emailTrackingData.days_since_account_created)}
                                            </div>
                                            <div className="text-sm text-blue-600 font-proxima">Days Since Account</div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-green-50 border-green-200">
                                        <CardContent className="p-4 text-center">
                                            <div className="text-3xl font-bold text-green-700 font-proxima-bold">
                                                {emailTrackingData.email_logs && emailTrackingData.email_logs.length > 0 
                                                    ? emailTrackingData.email_logs.reduce((total, log) => total + (log.send_count || 0), 0)
                                                    : 0
                                                }
                                            </div>
                                            <div className="text-sm text-green-600 font-proxima">Total Emails Sent</div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-purple-50 border-purple-200">
                                        <CardContent className="p-4 text-center">
                                            <div className="text-lg font-bold text-purple-700 font-proxima-bold">
                                                {(() => {
                                                    if (!emailTrackingData.email_logs || emailTrackingData.email_logs.length === 0) {
                                                        return 'None';
                                                    }
                                                    
                                                    const nextEmails = emailTrackingData.email_logs
                                                        ?.filter(log => log.next_send_at && !log.is_queued)
                                                        ?.sort((a, b) => new Date(a.next_send_at) - new Date(b.next_send_at));
                                                    
                                                    if (nextEmails && nextEmails.length > 0) {
                                                        const nextEmail = nextEmails[0];
                                                        const nextDate = new Date(nextEmail.next_send_at);
                                                        return nextDate.toLocaleDateString();
                                                    } else {
                                                        return 'None';
                                                    }
                                                })()}
                                            </div>
                                            <div className="text-sm text-purple-600 font-proxima">Next Email</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {emailTrackingData.email_logs && emailTrackingData.email_logs.length > 0 && (
                                    <div>
                                        <h3 className="font-proxima-bold text-lg mb-3">Email History</h3>
                                        <div className="space-y-2">
                                            {emailTrackingData.email_logs.map((log, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex-1">
                                                        <div className="font-proxima-bold text-gray-900">
                                                            {log.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </div>
                                                        <div className="text-sm text-gray-600 font-proxima">
                                                            Sent {log.send_count} time{log.send_count !== 1 ? 's' : ''}
                                                            {log.email_sent_at && ` • Last sent: ${new Date(log.email_sent_at).toLocaleDateString()}`}
                                                        </div>
                                                    </div>
                                                    {log.is_queued && (
                                                        <Badge className="bg-blue-100 text-blue-700 font-proxima">
                                                            📋 Queued
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {emailTrackingData.email_opt_out && (
                                    <Card className="border-red-200 bg-red-50">
                                        <CardHeader>
                                            <CardTitle className="text-red-700 font-proxima-bold">Opt-out Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 font-proxima">
                                            <p><strong>Status:</strong> Opted out of automated emails</p>
                                            <p><strong>Date:</strong> {new Date(emailTrackingData.email_opt_out_date_est).toLocaleDateString()}</p>
                                            <p><strong>Reason:</strong> {emailTrackingData.email_opt_out_reason}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-proxima">No email tracking data available for this applicant.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Actions Modal */}
            {actionsModalOpen && (
                <BulkActionsModal
                    isOpen={actionsModalOpen}
                    selectedCount={1}
                    onClose={closeActionsModal}
                    onAction={handleApplicantAction}
                    isLoading={actionInProgress}
                />
            )}

            {/* Notes Modal */}
            <NotesSidebar
                isOpen={notesModalOpen}
                onClose={closeNotesSidebar}
                applicantId={applicant?.applicant_id}
                applicantName={`${applicant?.first_name} ${applicant?.last_name}`}
            />
        </div>
    );
};

export default ApplicationDetail;
