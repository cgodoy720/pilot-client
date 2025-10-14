import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesSidebar from '../../components/NotesSidebar';
import BulkActionsModal from '../../components/BulkActionsModal';
import NavBarAdmissions from '../../components/NavBarAdmissions';
import Swal from 'sweetalert2';
import { Tabs, TabsContents, TabsContent } from '../../components/animate-ui/components/radix/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Skeleton } from '../../components/ui/skeleton';
import './AdmissionsDashboard.css';

const AdmissionsDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Check for tab parameter in URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam && ['overview', 'applications', 'info-sessions', 'workshops', 'emails'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    // Data state
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [infoSessions, setInfoSessions] = useState([]);
    const [workshops, setWorkshops] = useState([]);

    // Pagination and filters
    const [applicationFilters, setApplicationFilters] = useState({
        status: '',
        info_session_status: '',
        workshop_status: '',
        program_admission_status: '',
        ready_for_workshop_invitation: false,
        name_search: '',
        limit: 50,
        offset: 0
    });
    const [nameSearchInput, setNameSearchInput] = useState('');
    const [columnSort, setColumnSort] = useState({
        column: 'created_at',
        direction: 'desc' // 'asc' or 'desc'
    });

    // Event registrations management
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    // Info session form state
    const [infoSessionModalOpen, setInfoSessionModalOpen] = useState(false);
    const [editingInfoSession, setEditingInfoSession] = useState(null);
    const [infoSessionForm, setInfoSessionForm] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        capacity: 50,
        is_online: false,
        meeting_link: ''
    });
    const [infoSessionSubmitting, setInfoSessionSubmitting] = useState(false);

    // Workshop form state
    const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const [workshopForm, setWorkshopForm] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
        capacity: 50,
        is_online: false,
        meeting_link: ''
    });
    const [workshopSubmitting, setWorkshopSubmitting] = useState(false);

    // Bulk actions state
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false);
    const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

    // Manual registration state
    const [addRegistrationModalOpen, setAddRegistrationModalOpen] = useState(false);
    const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [applicantSearch, setApplicantSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedApplicantsForRegistration, setSelectedApplicantsForRegistration] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [registrationLoading, setRegistrationLoading] = useState(false);

    // Event filtering state
    const [showInactiveInfoSessions, setShowInactiveInfoSessions] = useState(false);
    const [showInactiveWorkshops, setShowInactiveWorkshops] = useState(false);

    // Email automation state
    const [emailStats, setEmailStats] = useState(null);
    const [queuedEmails, setQueuedEmails] = useState([]);
    const [emailHistory, setEmailHistory] = useState([]);
    const [applicantEmailStatus, setApplicantEmailStatus] = useState([]);
    const [emailAutomationLoading, setEmailAutomationLoading] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [testEmailLoading, setTestEmailLoading] = useState(false);

    // Check if user has admin access
    const hasAdminAccess = user?.role === 'admin' || user?.role === 'staff';

    // Fetch all admissions data
    const fetchAdmissionsData = async () => {
        if (!hasAdminAccess || !token) {
            setError('You do not have permission to view this page.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [statsResponse, applicationsResponse, infoSessionsResponse, workshopsResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${new URLSearchParams(applicationFilters)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Check for errors
            if (!statsResponse.ok || !applicationsResponse.ok || !infoSessionsResponse.ok || !workshopsResponse.ok) {
                throw new Error('Failed to fetch admissions data');
            }

            // Parse responses
            const [statsData, applicationsData, infoSessionsData, workshopsData] = await Promise.all([
                statsResponse.json(),
                applicationsResponse.json(),
                infoSessionsResponse.json(),
                workshopsResponse.json()
            ]);

            // Update state
            setStats(statsData);
            setApplications(applicationsData);
            setInfoSessions(infoSessionsData);
            setWorkshops(workshopsData);

        } catch (error) {
            console.error('Error fetching admissions data:', error);
            setError('Failed to load admissions data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Individual fetch functions for refresh buttons
    const fetchApplications = async (isInitialLoad = false) => {
        if (!hasAdminAccess || !token) return;

        try {
            // Use filterLoading for filter changes, loading for initial load
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setFilterLoading(true);
            }
            
            const params = new URLSearchParams();
            if (applicationFilters.status) params.append('status', applicationFilters.status);
            if (applicationFilters.info_session_status) params.append('info_session_status', applicationFilters.info_session_status);
            if (applicationFilters.recommendation) params.append('recommendation', applicationFilters.recommendation);
            if (applicationFilters.final_status) params.append('final_status', applicationFilters.final_status);
            if (applicationFilters.workshop_status) params.append('workshop_status', applicationFilters.workshop_status);
            if (applicationFilters.program_admission_status) params.append('program_admission_status', applicationFilters.program_admission_status);
            if (applicationFilters.ready_for_workshop_invitation) params.append('ready_for_workshop_invitation', 'true');
            if (applicationFilters.name_search) params.append('name_search', applicationFilters.name_search);
            params.append('limit', applicationFilters.limit);
            params.append('offset', applicationFilters.offset);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            } else {
                setFilterLoading(false);
            }
        }
    };

    const fetchInfoSessions = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInfoSessions(data);
            }
        } catch (error) {
            console.error('Error fetching info sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkshops = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkshops(data);
            }
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce name search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setApplicationFilters(prev => ({
                ...prev,
                name_search: nameSearchInput,
                offset: 0 // Reset to first page when search changes
            }));
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [nameSearchInput]);

    // Email automation fetch functions
    const fetchEmailStats = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            setEmailAutomationLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEmailStats(data);
            }
        } catch (error) {
            console.error('Error fetching email stats:', error);
        } finally {
            setEmailAutomationLoading(false);
        }
    };

    const fetchQueuedEmails = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/queued`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setQueuedEmails(data);
            }
        } catch (error) {
            console.error('Error fetching queued emails:', error);
        }
    };

    const fetchEmailHistory = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEmailHistory(data);
            }
        } catch (error) {
            console.error('Error fetching email history:', error);
        }
    };

    const fetchApplicantEmailStatus = async () => {
        if (!hasAdminAccess || !token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/applicant-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplicantEmailStatus(data);
            }
        } catch (error) {
            console.error('Error fetching applicant email status:', error);
        }
    };

    const sendTestEmail = async () => {
        if (!testEmailAddress.trim()) {
            Swal.fire({
                title: 'Email Required',
                text: 'Please enter an email address to send the test email to.',
                icon: 'warning',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmailAddress.trim())) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Please enter a valid email address.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
            return;
        }

        try {
            setTestEmailLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/email-automation/send-test-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: testEmailAddress.trim() })
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    title: '📧 Test Email Sent!',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Sent to:</strong> ${testEmailAddress}</p>
                            <p><strong>Log ID:</strong> ${data.logId}</p>
                            <hr style="margin: 15px 0;">
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Check your email inbox</li>
                                <li>Open the test email</li>
                                <li>Return to this dashboard and refresh the Emails tab</li>
                                <li>Check the updated open rate statistics</li>
                            </ol>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Got it!',
                    confirmButtonColor: 'var(--color-primary)',
                    background: 'var(--color-background-dark)',
                    color: 'var(--color-text-primary)'
                });
                
                // Clear the input and refresh stats
                setTestEmailAddress('');
                fetchEmailStats();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to send test email. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--color-primary)',
                background: 'var(--color-background-dark)',
                color: 'var(--color-text-primary)'
            });
        } finally {
            setTestEmailLoading(false);
        }
    };

    // Track if this is the initial load
    const isInitialMount = React.useRef(true);

    // Load data on mount and when filters change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchAdmissionsData();
        } else {
            // On subsequent loads (filter changes), only fetch applications
            fetchApplications(false);
        }
    }, [token, hasAdminAccess, applicationFilters]);

    // Load email automation data when tab changes
    useEffect(() => {
        if (activeTab === 'emails') {
            fetchEmailStats();
            fetchQueuedEmails();
            fetchEmailHistory();
            fetchApplicantEmailStatus();
        }
    }, [activeTab, token, hasAdminAccess]);

    // Debounced search for applicants
    useEffect(() => {
        if (!applicantSearch.trim()) {
            console.log('🔍 Clearing results due to empty applicantSearch');
            setSearchResults([]);
            return;
        }

        console.log('🔍 Debouncing search for:', applicantSearch);
        const timeoutId = setTimeout(() => {
            searchApplicants(applicantSearch);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [applicantSearch, selectedEventForRegistration, selectedEventType]);

    // Monitor searchResults changes
    useEffect(() => {
        console.log('🔍 searchResults state changed:', searchResults.length, 'items');
        console.log('🔍 searchResults array:', searchResults);
        if (searchResults.length > 0) {
            console.log('🔍 Sample results:', searchResults.slice(0, 2).map(a => ({ name: a.display_name, email: a.email })));
            console.log('🔍 Should show search results UI now!');
        }
    }, [searchResults]);

    // Handle tab switching
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle status change (human override)
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ final_status: newStatus })
            });

            if (response.ok) {
                // Update the local state
                setApplications(prev => ({
                    ...prev,
                    applications: prev.applications.map(app =>
                        app.application_id === applicationId
                            ? {
                                ...app,
                                final_status: newStatus,
                                has_human_override: app.recommendation !== newStatus
                            }
                            : app
                    )
                }));
            } else {
                console.error('Failed to update status');
                setError('Failed to update status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status. Please try again.');
        }
    };

    // Handle bulk actions
    const handleBulkAction = async (action, customSubject = '', customBody = '') => {
        if (selectedApplicants.length === 0) return;

        setBulkActionInProgress(true);
        try {
            const requestBody = {
                action,
                applicant_ids: selectedApplicants
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
                console.log('Bulk action completed:', result);

                // Refresh applications data
                await fetchApplications();

                // Clear selection
                setSelectedApplicants([]);
                setBulkActionsModalOpen(false);

                // Show success message
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Bulk action failed:', errorData);
                setError(`Bulk action failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            setError('Failed to perform bulk action. Please try again.');
        } finally {
            setBulkActionInProgress(false);
        }
    };

    // Handle application filter changes
    const handleFilterChange = (key, value) => {
        setApplicationFilters(prev => ({
            ...prev,
            [key]: value,
            offset: key !== 'offset' ? 0 : value // Reset offset when other filters change
        }));
    };

    // Handle notes modal
    const openNotesSidebar = (applicant) => {
        setSelectedApplicant(applicant);
        setNotesModalOpen(true);
    };

    const closeNotesSidebar = () => {
        setNotesModalOpen(false);
        setSelectedApplicant(null);
    };

    // Handle column sorting
    const handleColumnSort = (column) => {
        setColumnSort(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Sort applications (name filtering is now handled server-side)
    const sortAndFilterApplications = (apps) => {
        if (!apps || !Array.isArray(apps)) return apps;

        let filteredApps = [...apps];

        // Apply sorting
        return filteredApps.sort((a, b) => {
            let valueA, valueB;

            switch (columnSort.column) {
                case 'name':
                    valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
                    valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'status':
                    valueA = a.status || '';
                    valueB = b.status || '';
                    break;
                case 'assessment':
                    valueA = a.final_status || a.recommendation || '';
                    valueB = b.final_status || b.recommendation || '';
                    break;
                case 'info_session':
                    valueA = a.info_session_status || '';
                    valueB = b.info_session_status || '';
                    break;
                case 'workshop':
                    valueA = a.workshop_status || '';
                    valueB = b.workshop_status || '';
                    break;
                case 'created_at':
                default:
                    valueA = new Date(a.created_at);
                    valueB = new Date(b.created_at);
                    break;
            }

            if (columnSort.direction === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });
    };

    // Sort events by date (earliest to latest)
    const sortEventsByDate = (events) => {
        if (!events || !Array.isArray(events)) return events;

        return [...events].sort((a, b) => {
            // Since event_date is in ISO format, just parse it directly
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);

            // For earliest to latest: smaller date - larger date gives negative (comes first)
            return dateA.getTime() - dateB.getTime();
        });
    };

    // Filter events based on active status
    const getFilteredInfoSessions = () => {
        if (showInactiveInfoSessions) {
            return infoSessions; // Show all events
        }
        return infoSessions.filter(session => session.is_active);
    };

    const getFilteredWorkshops = () => {
        if (showInactiveWorkshops) {
            return workshops; // Show all events
        }
        return workshops.filter(workshop => workshop.is_active);
    };

    // Check if an event has passed
    const isEventPast = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate} ${eventTime}`);
        return eventDateTime < new Date();
    };

    // Format time from 24-hour to 12-hour EST format
    const formatEventTime = (timeString) => {
        try {
            // Parse the time string (e.g., "17:30:00")
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Fallback to original
        }
    };

    // Format phone number to (000) 000-0000 format
    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'N/A';

        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Check if it's a valid 10-digit US phone number
        if (cleaned.length === 10) {
            return `(${cleaned.substring(0, 3)})${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
        }

        // If not 10 digits, return the original value or 'Invalid'
        return phoneNumber || 'N/A';
    };

    // Copy text to clipboard with feedback
    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
            console.log(`${type} copied to clipboard: ${text}`);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    // Handle phone number click - copy raw digits
    const handlePhoneClick = (phoneNumber) => {
        if (!phoneNumber || phoneNumber === 'N/A') return;
        const cleaned = phoneNumber.replace(/\D/g, '');
        copyToClipboard(cleaned, 'Phone number');
    };

    // Handle email click - copy email
    const handleEmailClick = (email) => {
        if (!email) return;
        copyToClipboard(email, 'Email');
    };

    // Copy all emails for current event registrations
    const copyAllEmails = () => {
        const emails = eventRegistrations
            .filter(reg => reg.email && reg.email.trim() !== '')
            .map(reg => reg.email);

        if (emails.length === 0) {
            console.log('No emails to copy');
            return;
        }

        const emailList = emails.join(', ');
        copyToClipboard(emailList, `${emails.length} emails`);
    };

    // Copy all phone numbers for current event registrations
    const copyAllPhoneNumbers = () => {
        const phoneNumbers = eventRegistrations
            .filter(reg => reg.phone_number && reg.phone_number !== 'N/A' && reg.phone_number.trim() !== '')
            .map(reg => reg.phone_number.replace(/\D/g, '')) // Remove formatting
            .filter(phone => phone.length === 10); // Only valid 10-digit numbers

        if (phoneNumbers.length === 0) {
            console.log('No valid phone numbers to copy');
            return;
        }

        const phoneList = phoneNumbers.join(', ');
        copyToClipboard(phoneList, `${phoneNumbers.length} phone numbers`);
    };
    
    // Handle CSV export for selected applicants
    const handleExportCSV = async () => {
        if (selectedApplicants.length === 0) return;
        
        try {
            setLoading(true);
            
            // Get the full details of selected applicants including demographic data
            const selectedApplicantIds = selectedApplicants.join(',');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${selectedApplicantIds}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch detailed applicant data');
            }
            
            const detailedApplicantData = await response.json();
            
            if (!detailedApplicantData || detailedApplicantData.length === 0) {
                console.error('No data found for selected applicants');
                setError('No data found for selected applicants');
                return;
            }
            
            // Debug: Log the data we're getting from the API
            console.log('Detailed applicant data:', detailedApplicantData);
            
            // Check if we have demographic data
            const hasDemographics = detailedApplicantData.some(app => 
                app.demographics && Object.keys(app.demographics).some(key => app.demographics[key])
            );
            console.log('Has any demographic data:', hasDemographics);
            
            if (detailedApplicantData.length > 0) {
                console.log('First applicant demographics:', detailedApplicantData[0].demographics);
            }
            
            // Define CSV headers based on available data
            const headers = [
                'Applicant ID',
                'First Name',
                'Last Name',
                'Email',
                'Phone Number',
                'Application Status',
                'Assessment',
                'Info Session Status',
                'Workshop Status',
                'Program Admission Status',
                'Date of Birth',
                'Address',
                'Gender',
                'Personal Annual Income',
                'Educational Attainment',
                'First-Generation College Student',
                'Race/Ethnicity',
                'English as Secondary Language',
                'Born Outside US',
                'Parents Born Outside US',
                'Government Assistance',
                'Veteran Status',
                'Communities',
                'Employment Status',
                'Reason for Applying'
            ];
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            // Add data rows
            detailedApplicantData.forEach(applicant => {
                // Extract demographic data - safely handle missing fields
                const demographics = applicant.demographics || {};
                
                const row = [
                    applicant.applicant_id,
                    `"${(applicant.first_name || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
                    `"${(applicant.last_name || '').replace(/"/g, '""')}"`,
                    `"${(applicant.email || '').replace(/"/g, '""')}"`,
                    `"${(applicant.phone_number || '').replace(/"/g, '""')}"`,
                    `"${(applicant.status || '').replace(/"/g, '""')}"`,
                    `"${(applicant.final_status || applicant.recommendation || '').replace(/"/g, '""')}"`,
                    `"${(applicant.info_session_status || 'not_registered').replace(/"/g, '""')}"`,
                    `"${(applicant.workshop_status || 'pending').replace(/"/g, '""')}"`,
                    `"${(applicant.program_admission_status || 'pending').replace(/"/g, '""')}"`,
                    `"${(demographics.date_of_birth || '').replace(/"/g, '""')}"`,
                    `"${(demographics.address || '').replace(/"/g, '""')}"`,
                    `"${(demographics.gender || '').replace(/"/g, '""')}"`,
                    `"${(demographics.personal_income || '').replace(/"/g, '""')}"`,
                    `"${(demographics.education_level || '').replace(/"/g, '""')}"`,
                    `"${(demographics.first_gen_college || '').replace(/"/g, '""')}"`,
                    `"${(demographics.race_ethnicity || '').replace(/"/g, '""').replace(/[\[\]]/g, '')}"`,
                    `"${(demographics.english_secondary || '').replace(/"/g, '""')}"`,
                    `"${(demographics.born_outside_us || '').replace(/"/g, '""')}"`,
                    `"${(demographics.parents_born_outside_us || '').replace(/"/g, '""')}"`,
                    `"${(demographics.govt_assistance || '').replace(/"/g, '""')}"`,
                    `"${(demographics.veteran || '').replace(/"/g, '""')}"`,
                    `"${(demographics.communities || '').replace(/"/g, '""')}"`,
                    `"${(demographics.employment_status || '').replace(/"/g, '""')}"`,
                    `"${(demographics.reason_for_applying || '').replace(/"/g, '""')}"`
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `applicants_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error exporting CSV:', error);
            setError('Failed to export CSV. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Info session modal management
    const openCreateInfoSessionModal = () => {
        // Reset form to default values
        setInfoSessionForm({
            title: '',
            description: 'Information session about Pursuit programs',
            start_time: '',
            end_time: '',
            location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
            capacity: 50,
            is_online: false,
            meeting_link: ''
        });
        setEditingInfoSession(null);
        setInfoSessionModalOpen(true);
    };

    const openEditInfoSessionModal = (session) => {
        // Format date and time for datetime-local input
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time || session.start_time);

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = (date) => {
            return date.toISOString().slice(0, 16);
        };

        setInfoSessionForm({
            title: session.event_name,
            description: session.description || '',
            start_time: formatDateForInput(startTime),
            end_time: formatDateForInput(endTime),
            location: session.location || '',
            capacity: session.capacity || 50,
            is_online: session.is_online || false,
            meeting_link: session.meeting_link || '',
            status: session.status || 'scheduled'
        });
        setEditingInfoSession(session.event_id);
        setInfoSessionModalOpen(true);
    };

    const closeInfoSessionModal = () => {
        setInfoSessionModalOpen(false);
        setEditingInfoSession(null);
    };

    const handleInfoSessionFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInfoSessionForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleInfoSessionSubmit = async (e) => {
        e.preventDefault();
        setInfoSessionSubmitting(true);

        try {
            const endpoint = editingInfoSession
                ? `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${editingInfoSession}`
                : `${import.meta.env.VITE_API_URL}/api/admissions/info-sessions`;

            const method = editingInfoSession ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(infoSessionForm)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingInfoSession ? 'update' : 'create'} info session`);
            }

            // Refresh info sessions list
            await fetchInfoSessions();
            closeInfoSessionModal();

        } catch (error) {
            console.error('Error submitting info session:', error);
            setError(`Failed to ${editingInfoSession ? 'update' : 'create'} info session. ${error.message}`);
        } finally {
            setInfoSessionSubmitting(false);
        }
    };

    // Workshop modal management
    const openCreateWorkshopModal = () => {
        // Reset form to default values
        setWorkshopForm({
            title: '',
            description: 'Workshop about Pursuit programs and tech careers',
            start_time: '',
            end_time: '',
            location: 'Pursuit NYC Campus - 47-10 Austell Pl 2nd floor, Long Island City, NY',
            capacity: 50,
            is_online: false,
            meeting_link: ''
        });
        setEditingWorkshop(null);
        setWorkshopModalOpen(true);
    };

    const openEditWorkshopModal = (workshop) => {
        // Format date and time for datetime-local input
        const startTime = new Date(workshop.start_time);
        const endTime = new Date(workshop.end_time || workshop.start_time);

        // Format to YYYY-MM-DDThh:mm
        const formatDateForInput = (date) => {
            return date.toISOString().slice(0, 16);
        };

        setWorkshopForm({
            title: workshop.event_name,
            description: workshop.description || '',
            start_time: formatDateForInput(startTime),
            end_time: formatDateForInput(endTime),
            location: workshop.location || '',
            capacity: workshop.capacity || 50,
            is_online: workshop.is_online || false,
            meeting_link: workshop.meeting_link || '',
            status: workshop.status || 'scheduled'
        });
        setEditingWorkshop(workshop.event_id);
        setWorkshopModalOpen(true);
    };

    const closeWorkshopModal = () => {
        setWorkshopModalOpen(false);
        setEditingWorkshop(null);
    };

    // Configure SweetAlert2 with dark theme
    const darkSwalConfig = {
        background: '#1e2432',
        color: '#ffffff',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        customClass: {
            popup: 'dark-swal-popup',
            title: 'dark-swal-title',
            content: 'dark-swal-content',
            confirmButton: 'dark-swal-confirm-btn',
            cancelButton: 'dark-swal-cancel-btn'
        }
    };

    // Delete handlers with dark mode SweetAlert2 confirmation
    const handleDeleteInfoSession = async (sessionId) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Delete Info Session?',
                text: "This action cannot be undone. All data related to this info session will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                iconColor: '#fbbf24'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/info-sessions/${sessionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete info session');
                }

                // Close modal and refresh data
                closeInfoSessionModal();
                await fetchInfoSessions();

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Deleted!',
                    text: 'The info session has been successfully deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            }
        } catch (error) {
            console.error('Error deleting info session:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: error.message || 'Failed to delete info session. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };

    const handleDeleteWorkshop = async (workshopId) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Delete Workshop?',
                text: "This action cannot be undone. All data related to this workshop will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                iconColor: '#fbbf24'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/workshops/${workshopId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete workshop');
                }

                // Close modal and refresh data
                closeWorkshopModal();
                await fetchWorkshops();

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Deleted!',
                    text: 'The workshop has been successfully deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            }
        } catch (error) {
            console.error('Error deleting workshop:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: error.message || 'Failed to delete workshop. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };

    const handleWorkshopFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setWorkshopForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleWorkshopSubmit = async (e) => {
        e.preventDefault();
        setWorkshopSubmitting(true);

        try {
            const endpoint = editingWorkshop
                ? `${import.meta.env.VITE_API_URL}/api/admissions/workshops/${editingWorkshop}`
                : `${import.meta.env.VITE_API_URL}/api/admissions/workshops`;

            const method = editingWorkshop ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workshopForm)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingWorkshop ? 'update' : 'create'} workshop`);
            }

            // Refresh workshops list
            await fetchWorkshops();
            closeWorkshopModal();

        } catch (error) {
            console.error('Error submitting workshop:', error);
            setError(`Failed to ${editingWorkshop ? 'update' : 'create'} workshop. ${error.message}`);
        } finally {
            setWorkshopSubmitting(false);
        }
    };

    // Handle viewing registrations for an event
    const handleViewRegistrations = async (eventType, eventId) => {
        if (selectedEvent === eventId) {
            setSelectedEvent(null);
            setEventRegistrations([]);
            return;
        }

        setSelectedEvent(eventId);
        setEventRegistrations([]);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/registrations/${eventType}/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEventRegistrations(data);
            } else {
                console.error('Failed to fetch registrations');
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    // Handle marking attendance  
    const handleMarkAttendance = async (eventType, eventId, applicantId, status) => {
        setAttendanceLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Get the previous status to determine count changes
                const previousRegistration = eventRegistrations.find(reg => reg.applicant_id === applicantId);
                const previousStatus = previousRegistration?.status;

                // Update the registration in the local state instead of refetching
                setEventRegistrations(prevRegistrations =>
                    prevRegistrations.map(reg =>
                        reg.applicant_id === applicantId
                            ? { ...reg, status }
                            : reg
                    )
                );

                // Update the event stats in local state based on status transitions
                const isNewStatusAttended = status === 'attended' || status === 'attended_late' || status === 'very_late';
                const wasPreviousStatusAttended = previousStatus === 'attended' || previousStatus === 'attended_late' || previousStatus === 'very_late';

                let countChange = 0;
                if (isNewStatusAttended && !wasPreviousStatusAttended) {
                    countChange = 1; // Moving to attended status
                } else if (!isNewStatusAttended && wasPreviousStatusAttended) {
                    countChange = -1; // Moving away from attended status
                }
                // If both are attended or both are non-attended, no change needed (countChange = 0)

                if (countChange !== 0) {
                    if (eventType === 'info-session') {
                        setInfoSessions(prevSessions =>
                            prevSessions.map(session =>
                                session.event_id === eventId
                                    ? { ...session, attended_count: session.attended_count + countChange }
                                    : session
                            )
                        );
                    } else if (eventType === 'workshop') {
                        setWorkshops(prevWorkshops =>
                            prevWorkshops.map(workshop =>
                                workshop.event_id === eventId
                                    ? { ...workshop, attended_count: workshop.attended_count + countChange }
                                    : workshop
                            )
                        );
                    }
                }
            } else {
                console.error('Failed to mark attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        } finally {
            setAttendanceLoading(false);
        }
    };

    // Mark attendance helper (legacy - keeping for compatibility)
    const markAttendance = async (eventType, eventId, applicantId, attended) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/attendance/${eventType}/${eventId}/${applicantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ attended })
            });

            if (!response.ok) {
                throw new Error('Failed to mark attendance');
            }

            // Refresh data after marking attendance
            await fetchAdmissionsData();

        } catch (error) {
            console.error('Error marking attendance:', error);
            setError('Failed to mark attendance. Please try again.');
        }
    };

    // Handle toggling event active status
    const handleToggleEventActive = async (eventId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${eventId}/toggle-active`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Event active status toggled:', result);

                // Update the local state for both info sessions and workshops
                setInfoSessions(prevSessions =>
                    prevSessions.map(session =>
                        session.event_id === eventId
                            ? { ...session, is_active: result.event.is_active }
                            : session
                    )
                );

                setWorkshops(prevWorkshops =>
                    prevWorkshops.map(workshop =>
                        workshop.event_id === eventId
                            ? { ...workshop, is_active: result.event.is_active }
                            : workshop
                    )
                );

                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Failed to toggle event active status:', errorData);
                setError(`Failed to toggle event status: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error toggling event active status:', error);
            setError('Failed to toggle event status. Please try again.');
        }
    };

    // Manual Registration Handlers
    
    // Open add registration modal
    const openAddRegistrationModal = (eventId, eventType) => {
        setSelectedEventForRegistration(eventId);
        setSelectedEventType(eventType);
        setAddRegistrationModalOpen(true);
        setApplicantSearch('');
        setSearchResults([]);
        setSelectedApplicantsForRegistration([]);
    };

    // Close add registration modal
    const closeAddRegistrationModal = () => {
        setAddRegistrationModalOpen(false);
        setSelectedEventForRegistration(null);
        setSelectedEventType(null);
        setApplicantSearch('');
        setSearchResults([]);
        setSelectedApplicantsForRegistration([]);
    };

    // Search for applicants
    const searchApplicants = async (searchTerm) => {
        console.log('🔍 searchApplicants called with:', { searchTerm, length: searchTerm?.length, trimmed: searchTerm?.trim() });
        
        setSearchLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/search?q=${encodeURIComponent(searchTerm)}&eventId=${selectedEventForRegistration}&eventType=${selectedEventType}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Search response received:', data.count, 'applicants');
                setSearchResults(data.applicants || []);
                console.log('🔍 Search results set successfully');
            } else {
                console.error('Failed to search applicants');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching applicants:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle applicant selection for registration
    const toggleApplicantSelection = (applicant) => {
        setSelectedApplicantsForRegistration(prev => {
            const isSelected = prev.some(selected => selected.applicant_id === applicant.applicant_id);
            if (isSelected) {
                return prev.filter(selected => selected.applicant_id !== applicant.applicant_id);
            } else {
                return [...prev, applicant];
            }
        });
    };

    // Register selected applicants
    const registerSelectedApplicants = async () => {
        if (selectedApplicantsForRegistration.length === 0) return;

        setRegistrationLoading(true);
        const results = [];

        try {
            for (const applicant of selectedApplicantsForRegistration) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${selectedEventType}/${selectedEventForRegistration}/register-applicant`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            applicantId: applicant.applicant_id,
                            name: applicant.display_name,
                            email: applicant.email,
                            needsLaptop: false // Default to false, can be changed later
                        })
                    });

                    if (response.ok) {
                        results.push({ applicant, success: true });
                    } else {
                        const errorData = await response.json();
                        results.push({ applicant, success: false, error: errorData.error });
                    }
                } catch (error) {
                    results.push({ applicant, success: false, error: error.message });
                }
            }

            // Show results and refresh data
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.length - successCount;

            if (successCount > 0) {
                // Refresh event registrations to show new registrations
                if (selectedEvent === selectedEventForRegistration) {
                    await handleViewRegistrations(selectedEventType, selectedEventForRegistration);
                }
                // Refresh events list to update counts
                if (selectedEventType === 'info-session') {
                    await fetchInfoSessions();
                } else {
                    await fetchWorkshops();
                }
            }

            if (failureCount > 0) {
                const failureMessages = results.filter(r => !r.success).map(r => `${r.applicant.display_name}: ${r.error}`).join('\n');
                setError(`Some registrations failed:\n${failureMessages}`);
            }

            if (successCount === results.length) {
                closeAddRegistrationModal();
            }

        } catch (error) {
            console.error('Error registering applicants:', error);
            setError('Failed to register applicants. Please try again.');
        } finally {
            setRegistrationLoading(false);
        }
    };

    // Remove/cancel a registration
    const handleRemoveRegistration = async (eventType, eventId, registrationId, applicantName) => {
        try {
            const result = await Swal.fire({
                ...darkSwalConfig,
                title: 'Cancel Registration?',
                text: `Are you sure you want to cancel ${applicantName}'s registration? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'Keep Registration',
                iconColor: '#fbbf24'
            });

            if (!result.isConfirmed) {
                return;
            }
        } catch (swalError) {
            console.error('Error showing confirmation dialog:', swalError);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/events/${eventType}/${eventId}/registrations/${registrationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the registration from local state
                setEventRegistrations(prev => 
                    prev.filter(reg => reg.registration_id !== registrationId)
                );

                // Update event counts
                if (eventType === 'info-session') {
                    setInfoSessions(prevSessions =>
                        prevSessions.map(session =>
                            session.event_id === eventId
                                ? { ...session, registration_count: session.registration_count - 1 }
                                : session
                        )
                    );
                } else if (eventType === 'workshop') {
                    setWorkshops(prevWorkshops =>
                        prevWorkshops.map(workshop =>
                            workshop.event_id === eventId
                                ? { ...workshop, registration_count: workshop.registration_count - 1 }
                                : workshop
                        )
                    );
                }

                // Show success message
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Registration Cancelled!',
                    text: `${applicantName}'s registration has been successfully cancelled.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#10b981'
                });
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    ...darkSwalConfig,
                    title: 'Error!',
                    text: `Failed to cancel registration: ${errorData.error}`,
                    icon: 'error',
                    iconColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error cancelling registration:', error);
            await Swal.fire({
                ...darkSwalConfig,
                title: 'Error!',
                text: 'Failed to cancel registration. Please try again.',
                icon: 'error',
                iconColor: '#ef4444'
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__loading">
                    <div className="admissions-dashboard__loading-spinner"></div>
                    <p>Loading admissions data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={fetchAdmissionsData}
                        className="admissions-dashboard__retry-btn"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No access state
    if (!hasAdminAccess) {
        return (
            <div className="admissions-dashboard">
                <div className="admissions-dashboard__no-access">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view the admissions dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-bg-light font-sans">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
                {/* Tab Navigation */}
                <NavBarAdmissions activeTab={activeTab} />

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mx-10 mt-4">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => setError(null)} className="mt-2">
                            Dismiss
                        </Button>
                    </div>
                )}

                <TabsContents>
                {/* Overview Tab Content */}
                <TabsContent value="overview" className="flex-1 overflow-y-auto p-10 m-0">
                {(
                    <div className="admissions-dashboard__overview">
                        {loading ? (
                            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className={`bg-white border-divider ${i === 1 || i === 4 ? 'col-span-2' : ''}`}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-10 w-16 mb-2" />
                                            <Skeleton className="h-3 w-full" />
                                            {(i === 1 || i === 4) && (
                                                <>
                                                    <Skeleton className="h-3 w-full mt-2" />
                                                    <Skeleton className="h-3 w-3/4 mt-2" />
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-10 text-carbon-black">
                                <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
                                <p className="text-carbon-black/70 mb-4">{error}</p>
                                <Button onClick={fetchAdmissionsData} variant="default">Retry</Button>
                            </div>
                        ) : stats ? (
                            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
                                {/* Overall Applicants */}
                                <Card className="bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Total Applicants</CardTitle>
                                        <span className="text-2xl">👥</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-carbon-black">{stats.totalApplicants || 0}</div>
                                        <p className="text-xs text-carbon-black/60 mt-1">All registered applicants</p>
                                    </CardContent>
                                </Card>

                                {/* Applications by Status */}
                                <Card className="col-span-2 bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Applicants</CardTitle>
                                        <span className="text-2xl">📝</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            {stats.applicationStats?.map((statusGroup) => (
                                                <div key={statusGroup.status} className="flex items-center gap-3">
                                                    <span className={`w-3 h-3 rounded-full flex-shrink-0 bg-${statusGroup.status === 'submitted' ? 'green' : statusGroup.status === 'in_progress' ? 'orange' : 'red'}-500`}></span>
                                                    <span className="flex-1 text-sm text-carbon-black capitalize">{statusGroup.status.replace('_', ' ')}</span>
                                                    <span className="text-sm font-semibold text-carbon-black">{statusGroup.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Info Sessions */}
                                <Card className="bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Info Sessions</CardTitle>
                                        <span className="text-2xl">ℹ️</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-carbon-black">{stats.infoSessions?.totalSessions || 0}</div>
                                        <p className="text-xs text-carbon-black/60 mt-1">
                                            {stats.infoSessions?.totalRegistrations || 0} registrations, {stats.infoSessions?.totalAttended || 0} attended
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Workshops */}
                                <Card className="bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Workshops</CardTitle>
                                        <span className="text-2xl">🛠️</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-carbon-black">{stats.workshops?.totalWorkshops || 0}</div>
                                        <p className="text-xs text-carbon-black/60 mt-1">
                                            {stats.workshops?.totalRegistrations || 0} registrations, {stats.workshops?.totalAttended || 0} attended
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Assessment Funnel */}
                                <Card className="col-span-2 bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Assessment Funnel</CardTitle>
                                        <span className="text-2xl">🎯</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            {stats.assessmentFunnel?.map((assessment) => (
                                                <div key={assessment.status} className="flex items-center gap-3">
                                                    <span className="w-3 h-3 rounded-full flex-shrink-0 bg-pursuit-purple"></span>
                                                    <span className="flex-1 text-sm text-carbon-black">
                                                        {assessment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                    <span className="text-sm font-semibold text-carbon-black">{assessment.count}</span>
                                                    {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count !== assessment.count && (
                                                        <span className="text-xs text-mastery-pink" title="Human override detected">
                                                            🔀 {stats.finalStatusCounts?.find(f => f.status === assessment.status)?.count || 0}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Workshop Invitations */}
                                <Card className="bg-white border-divider hover:border-pursuit-purple transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-carbon-black/70">Workshop Pipeline</CardTitle>
                                        <span className="text-2xl">📊</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            {stats.workshopInvitations?.map((workshop) => (
                                                <div key={workshop.status} className="flex items-center gap-3">
                                                    <span className="w-3 h-3 rounded-full flex-shrink-0 bg-stardust"></span>
                                                    <span className="flex-1 text-sm text-carbon-black capitalize">
                                                        {workshop.status}
                                                    </span>
                                                    <span className="text-sm font-semibold text-carbon-black">{workshop.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="admissions-dashboard__no-data">
                                <p>No statistics available</p>
                            </div>
                        )}
                    </div>
                )}
                </TabsContent>

                {/* Applications Tab Content */}
                <TabsContent value="applications" className="flex-1 overflow-y-auto p-10 m-0">
                {(
                    <div className="admissions-dashboard__applications">
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={nameSearchInput}
                                    onChange={(e) => setNameSearchInput(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Select
                                    value={applicationFilters.status || 'all'}
                                    onValueChange={(value) => setApplicationFilters({ ...applicationFilters, status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Application Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Application Status: All</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="ineligible">Ineligible</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={applicationFilters.info_session_status || 'all'}
                                    onValueChange={(value) => setApplicationFilters({ ...applicationFilters, info_session_status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Info Session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Info Session: All</SelectItem>
                                        <SelectItem value="not_registered">Not Registered</SelectItem>
                                        <SelectItem value="registered">Registered</SelectItem>
                                        <SelectItem value="attended">Attended</SelectItem>
                                        <SelectItem value="attended_late">Attended Late</SelectItem>
                                        <SelectItem value="very_late">Very Late</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={applicationFilters.workshop_status || 'all'}
                                    onValueChange={(value) => setApplicationFilters({ ...applicationFilters, workshop_status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Workshop" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Workshop: All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="invited">Invited</SelectItem>
                                        <SelectItem value="registered">Registered</SelectItem>
                                        <SelectItem value="attended">Attended</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={applicationFilters.program_admission_status || 'all'}
                                    onValueChange={(value) => setApplicationFilters({ ...applicationFilters, program_admission_status: value === 'all' ? '' : value })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Admission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Admission: All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                        <SelectItem value="deferred">Deferred</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    className={`filter-toggle-btn ${applicationFilters.ready_for_workshop_invitation ? 'filter-toggle-btn--active' : ''}`}
                                    onClick={() => setApplicationFilters({ ...applicationFilters, ready_for_workshop_invitation: !applicationFilters.ready_for_workshop_invitation })}
                                    type="button"
                                >
                                    <span className="filter-toggle-btn__icon">
                                        {applicationFilters.ready_for_workshop_invitation ? '✓' : '○'}
                                    </span>
                                    Ready for Workshop Invitation
                                </button>
                                <button
                                    className="admissions-dashboard__bulk-actions-btn"
                                    disabled={selectedApplicants.length === 0}
                                    onClick={() => setBulkActionsModalOpen(true)}
                                >
                                    Actions ({selectedApplicants.length})
                                </button>
                                <button
                                    className="admissions-dashboard__export-csv-btn"
                                    disabled={selectedApplicants.length === 0}
                                    onClick={handleExportCSV}
                                >
                                    Export CSV ({selectedApplicants.length})
                                </button>
                                <button onClick={fetchApplications} className="refresh-btn">Refresh</button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="rounded-md border border-divider bg-white">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-bg-light border-b border-divider">
                                            <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assessment</TableHead>
                                            <TableHead>Info Session</TableHead>
                                            <TableHead>Workshop</TableHead>
                                            <TableHead>Admission</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(10)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : applications?.applications?.length > 0 || filterLoading ? (
                            <div className="rounded-md border border-divider bg-white" style={{ position: 'relative' }}>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-bg-light border-b border-divider">
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedApplicants.length === applications.applications?.length && applications.applications?.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedApplicants(applications.applications?.map(app => app.applicant_id) || []);
                                                        } else {
                                                            setSelectedApplicants([]);
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:text-pursuit-purple" onClick={() => handleColumnSort('name')}>
                                                Name
                                                {columnSort.column === 'name' && (
                                                    <span className="ml-1">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>
                                                )}
                                            </TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead className="cursor-pointer hover:text-pursuit-purple" onClick={() => handleColumnSort('status')}>
                                                Status
                                                {columnSort.column === 'status' && (
                                                    <span className="ml-1">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>
                                                )}
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:text-pursuit-purple" onClick={() => handleColumnSort('assessment')}>
                                                Assessment
                                                {columnSort.column === 'assessment' && (
                                                    <span className="ml-1">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>
                                                )}
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:text-pursuit-purple" onClick={() => handleColumnSort('info_session')}>
                                                Info Session
                                                {columnSort.column === 'info_session' && (
                                                    <span className="ml-1">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>
                                                )}
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:text-pursuit-purple" onClick={() => handleColumnSort('workshop')}>
                                                Workshop
                                                {columnSort.column === 'workshop' && (
                                                    <span className="ml-1">
                                                        {columnSort.direction === 'asc' ? ' ↑' : ' ↓'}
                                                    </span>
                                                )}
                                            </TableHead>
                                            <TableHead>Admission</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortAndFilterApplications(applications.applications).map((app) => (
                                            <TableRow
                                                key={app.application_id}
                                                className={`cursor-pointer hover:bg-bg-light ${selectedApplicants.includes(app.applicant_id) ? 'bg-pursuit-purple/5' : ''}`}
                                            >
                                                <TableCell className="w-12">
                                                    <Checkbox
                                                        checked={selectedApplicants.includes(app.applicant_id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedApplicants([...selectedApplicants, app.applicant_id]);
                                                            } else {
                                                                setSelectedApplicants(selectedApplicants.filter(id => id !== app.applicant_id));
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                    className="clickable-cell"
                                                >
                                                    <div className="applicant-name">
                                                        {app.full_name || `${app.first_name} ${app.last_name}`}
                                                        {app.has_masters_degree && (
                                                            <span className="admissions-dashboard__masters-flag" title="Has Masters Degree">🎓</span>
                                                        )}
                                                        {app.missing_count > 0 && (
                                                            <span className="admissions-dashboard__missing-flag" title={`${app.missing_count} key questions incomplete`}>
                                                                ⚠️ {app.missing_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className="cursor-pointer text-carbon-black hover:text-pursuit-purple hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEmailClick(app.email);
                                                        }}
                                                        title="Click to copy email"
                                                    >
                                                        {app.email}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className="cursor-pointer text-carbon-black hover:text-pursuit-purple hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePhoneClick(app.phone_number);
                                                        }}
                                                        title="Click to copy phone number"
                                                    >
                                                        {formatPhoneNumber(app.phone_number)}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                >
                                                    <Badge 
                                                        variant={
                                                            app.status === 'submitted' ? 'default' : 
                                                            app.status === 'in_progress' ? 'secondary' : 
                                                            app.status === 'ineligible' ? 'destructive' : 
                                                            'outline'
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {app.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="admissions-dashboard__assessment-cell">
                                                    <div className="admissions-dashboard__assessment-container">
                                                        {app.final_status || app.recommendation ? (
                                                            <select
                                                                className={`admissions-dashboard__assessment-select assessment-badge--${app.final_status || app.recommendation}`}
                                                                value={app.final_status || app.recommendation}
                                                                onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="strong_recommend">Strong Recommend</option>
                                                                <option value="recommend">Recommend</option>
                                                                <option value="review_needed">Review Needed</option>
                                                                <option value="not_recommend">Not Recommend</option>
                                                            </select>
                                                        ) : (
                                                            <Badge variant="secondary" className="capitalize">
                                                                pending
                                                            </Badge>
                                                        )}
                                                        {app.has_human_override && (
                                                            <span className="admissions-dashboard__override-indicator" title="Human override applied">🔀</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                >
                                                    <Badge 
                                                        variant={(app.info_session_status === 'attended' || app.info_session_status === 'attended_late') ? 'default' : app.info_session_status === 'registered' ? 'secondary' : 'outline'}
                                                        className="capitalize"
                                                    >
                                                        {(app.info_session_status || 'not_registered').replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                >
                                                    <Badge 
                                                        variant={(app.workshop_status === 'attended' || app.workshop_status === 'attended_late') ? 'default' : app.workshop_status === 'registered' ? 'secondary' : 'outline'}
                                                        className="capitalize"
                                                    >
                                                        {(app.workshop_status || 'pending').replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() => navigate(`/admissions-dashboard/application/${app.application_id}`)}
                                                >
                                                    <Badge 
                                                        variant={
                                                            (app.program_admission_status === 'admitted' || app.program_admission_status === 'accepted') ? 'default' : 
                                                            app.program_admission_status === 'pending' ? 'secondary' : 
                                                            'destructive'
                                                        }
                                                        className={`capitalize ${app.program_admission_status === 'withdrawn' ? 'admission-badge--withdrawn' : ''}`}
                                                    >
                                                        {(app.program_admission_status || 'pending').replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openNotesSidebar({
                                                                applicant_id: app.applicant_id,
                                                                name: app.full_name || `${app.first_name} ${app.last_name}`
                                                            });
                                                        }}
                                                    >
                                                        Notes
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="p-4 border-t border-divider bg-bg-light/50 flex items-center justify-between">
                                    <span className="table-count">
                                        Showing {applications.applications.length} applicants
                                        {applications.total > applications.applications.length &&
                                            ` of ${applications.total} total`
                                        }
                                    </span>
                                    {applications.total > applicationFilters.limit && (
                                        <div className="pagination-controls">
                                            <button
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev,
                                                    offset: Math.max(0, prev.offset - prev.limit)
                                                }))}
                                                disabled={applicationFilters.offset === 0}
                                                className="pagination-btn"
                                            >
                                                ← Previous
                                            </button>

                                            <span className="pagination-info">
                                                Page {Math.floor(applicationFilters.offset / applicationFilters.limit) + 1} of {Math.ceil(applications.total / applicationFilters.limit)}
                                            </span>

                                            <button
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev,
                                                    offset: prev.offset + prev.limit
                                                }))}
                                                disabled={applicationFilters.offset + applicationFilters.limit >= applications.total}
                                                className="pagination-btn"
                                            >
                                                Next →
                                            </button>

                                            <button
                                                onClick={() => setApplicationFilters(prev => ({
                                                    ...prev,
                                                    limit: applications.total,
                                                    offset: 0
                                                }))}
                                                className="pagination-btn show-all-btn"
                                            >
                                                Show All ({applications.total})
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Filter Loading Overlay */}
                                {filterLoading && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10,
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1rem 1.5rem',
                                            background: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid var(--color-divider)'
                                        }}>
                                            <div className="spinner" style={{
                                                width: '20px',
                                                height: '20px',
                                                border: '3px solid var(--color-divider)',
                                                borderTopColor: 'var(--color-pursuit-purple)',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            <span style={{ color: 'var(--color-carbon-black)', fontWeight: 500 }}>
                                                Loading...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No applicants found</p>
                                {(applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.ready_for_workshop_invitation || applicationFilters.name_search || nameSearchInput) && (
                                    <button
                                        onClick={() => {
                                            setNameSearchInput('');
                                            setApplicationFilters({ 
                                                status: '', 
                                                info_session_status: '', 
                                                workshop_status: '', 
                                                program_admission_status: '', 
                                                ready_for_workshop_invitation: false,
                                                name_search: '',
                                                limit: applicationFilters.limit,
                                                offset: 0
                                            });
                                        }}
                                        className="clear-filter-btn"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                </TabsContent>

                {/* Info Sessions Tab Content */}
                <TabsContent value="info-sessions" className="flex-1 overflow-y-auto p-10 m-0">
                {(
                    <div className="admissions-dashboard__info-sessions">
                        <div className="data-section__header">
                            <h2>Info Sessions Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input
                                            type="checkbox"
                                            checked={showInactiveInfoSessions}
                                            onChange={(e) => setShowInactiveInfoSessions(e.target.checked)}
                                            className="event-filter-checkbox"
                                        />
                                        Show inactive events
                                    </label>
                                </div>
                                <button
                                    onClick={openCreateInfoSessionModal}
                                    className="create-btn"
                                >
                                    Create New Session
                                </button>
                                <button
                                    onClick={fetchInfoSessions}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading info sessions...</p>
                            </div>
                        ) : getFilteredInfoSessions()?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredInfoSessions()).map((session) => (
                                            <React.Fragment key={session.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {session.event_name}
                                                        {isEventPast(session.event_date, session.event_time) && (
                                                            <span className="event-status event-status--past">Past Event</span>
                                                        )}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(session.event_date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(session.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{session.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{session.attended_count}</span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button
                                                                className={`active-toggle-btn ${session.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`}
                                                                onClick={() => handleToggleEventActive(session.event_id)}
                                                                title={session.is_active ? 'Click to deactivate event' : 'Click to activate event'}
                                                            >
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${session.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {session.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => openEditInfoSessionModal(session)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="view-registrations-btn"
                                                            onClick={() => handleViewRegistrations('info-session', session.event_id)}
                                                        >
                                                            {selectedEvent === session.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {selectedEvent === session.event_id && (
                                                    <tr className="registrations-row">
                                                        <td colSpan="6" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button
                                                                        className="add-registration-btn"
                                                                        onClick={() => openAddRegistrationModal(session.event_id, 'info-session')}
                                                                        title="Add registration"
                                                                    >
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllEmails}
                                                                                            title="Copy all emails"
                                                                                        >
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllPhoneNumbers}
                                                                                            title="Copy all phone numbers"
                                                                                        >
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-email"
                                                                                                onClick={() => handleEmailClick(reg.email)}
                                                                                                title="Click to copy email"
                                                                                            >
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-phone"
                                                                                                onClick={() => handlePhoneClick(reg.phone_number)}
                                                                                                title="Click to copy phone number"
                                                                                            >
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className={`attendance-status-dropdown-unified status-${reg.status}`}
                                                                                                value={reg.status}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.value !== reg.status) {
                                                                                                        handleMarkAttendance('info-session', session.event_id, reg.applicant_id, e.target.value);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button
                                                                                                className="remove-registration-btn"
                                                                                                onClick={() => handleRemoveRegistration('info-session', session.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
                                                                                                title="Cancel registration"
                                                                                            >
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <p>No registrations found</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No info sessions found</p>
                            </div>
                        )}
                    </div>
                )}
                </TabsContent>

                {/* Workshops Tab Content */}
                <TabsContent value="workshops" className="flex-1 overflow-y-auto p-10 m-0">
                {(
                    <div className="admissions-dashboard__workshops">
                        <div className="data-section__header">
                            <h2>Workshops Management</h2>
                            <div className="data-section__actions">
                                <div className="event-filter-toggle">
                                    <label className="event-filter-label">
                                        <input
                                            type="checkbox"
                                            checked={showInactiveWorkshops}
                                            onChange={(e) => setShowInactiveWorkshops(e.target.checked)}
                                            className="event-filter-checkbox"
                                        />
                                        Show inactive events
                                    </label>
                                </div>
                                <button
                                    onClick={openCreateWorkshopModal}
                                    className="create-btn"
                                >
                                    Create New Workshop
                                </button>
                                <button
                                    onClick={fetchWorkshops}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-loading">
                                <div className="spinner"></div>
                                <p>Loading workshops...</p>
                            </div>
                        ) : getFilteredWorkshops()?.length > 0 ? (
                            <div className="data-table-container">
                                <table className="data-table events-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date & Time</th>
                                            <th>Registered</th>
                                            <th>Attended</th>
                                            <th>Laptops Needed</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortEventsByDate(getFilteredWorkshops()).map((workshop) => (
                                            <React.Fragment key={workshop.event_id}>
                                                <tr className="event-row">
                                                    <td className="event-name">
                                                        {workshop.event_name}
                                                        {isEventPast(workshop.event_date, workshop.event_time) && (
                                                            <span className="event-status event-status--past">Past Event</span>
                                                        )}
                                                    </td>
                                                    <td className="event-datetime">
                                                        <div className="date-time-info">
                                                            <div className="event-date">
                                                                {new Date(workshop.event_date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="event-time">{formatEventTime(workshop.event_time)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number">{workshop.registration_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--attended">{workshop.attended_count}</span>
                                                    </td>
                                                    <td className="stat-cell">
                                                        <span className="stat-number stat-number--laptops">
                                                            {workshop.registrations?.filter(reg => reg.needs_laptop).length || 0}
                                                        </span>
                                                    </td>
                                                    <td className="active-status-cell">
                                                        <div className="active-toggle-container">
                                                            <button
                                                                className={`active-toggle-btn ${workshop.is_active ? 'active-toggle-btn--active' : 'active-toggle-btn--inactive'}`}
                                                                onClick={() => handleToggleEventActive(workshop.event_id)}
                                                                title={workshop.is_active ? 'Click to deactivate event' : 'Click to activate event'}
                                                            >
                                                                <span className="active-toggle-slider"></span>
                                                            </button>
                                                            <span className={`active-status-label ${workshop.is_active ? 'active-status-label--active' : 'active-status-label--inactive'}`}>
                                                                {workshop.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => openEditWorkshopModal(workshop)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="view-registrations-btn"
                                                            onClick={() => handleViewRegistrations('workshop', workshop.event_id)}
                                                        >
                                                            {selectedEvent === workshop.event_id ? 'Hide Registrations' : 'View Registrations'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {selectedEvent === workshop.event_id && (
                                                    <tr className="registrations-row">
                                                        <td colSpan="7" className="registrations-cell">
                                                            <div className="registrations-list">
                                                                <div className="registrations-header">
                                                                    <h4>Registrations</h4>
                                                                    <button
                                                                        className="add-registration-btn"
                                                                        onClick={() => openAddRegistrationModal(workshop.event_id, 'workshop')}
                                                                        title="Add registration"
                                                                    >
                                                                        + Add Registration
                                                                    </button>
                                                                </div>
                                                                {eventRegistrations.length > 0 ? (
                                                                    <div className="registrations-table">
                                                                        <table className="mini-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>
                                                                                        Email
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllEmails}
                                                                                            title="Copy all emails"
                                                                                        >
                                                                                            📧 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>
                                                                                        Phone
                                                                                        <button
                                                                                            className="copy-all-btn"
                                                                                            onClick={copyAllPhoneNumbers}
                                                                                            title="Copy all phone numbers"
                                                                                        >
                                                                                            📞 Copy All
                                                                                        </button>
                                                                                    </th>
                                                                                    <th>Laptop</th>
                                                                                    <th>Status</th>
                                                                                    <th>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {eventRegistrations.map((reg) => (
                                                                                    <tr key={reg.registration_id}>
                                                                                        <td>{reg.first_name} {reg.last_name}</td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-email"
                                                                                                onClick={() => handleEmailClick(reg.email)}
                                                                                                title="Click to copy email"
                                                                                            >
                                                                                                {reg.email}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span
                                                                                                className="copyable-phone"
                                                                                                onClick={() => handlePhoneClick(reg.phone_number)}
                                                                                                title="Click to copy phone number"
                                                                                            >
                                                                                                {formatPhoneNumber(reg.phone_number)}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="laptop-indicator-cell">
                                                                                            {reg.needs_laptop ? (
                                                                                                <span className="laptop-needed" title="Needs to borrow a laptop">
                                                                                                    <span className="laptop-icon">💻</span>
                                                                                                    <span className="laptop-text">Needs</span>
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="laptop-own" title="Has own laptop">
                                                                                                    <span className="laptop-icon">✓</span>
                                                                                                    <span className="laptop-text">Own</span>
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className={`attendance-status-dropdown-unified status-${reg.status}`}
                                                                                                value={reg.status}
                                                                                                onChange={(e) => {
                                                                                                    if (e.target.value !== reg.status) {
                                                                                                        handleMarkAttendance('workshop', workshop.event_id, reg.applicant_id, e.target.value);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                <option value="registered">Registered</option>
                                                                                                <option value="attended">Attended</option>
                                                                                                <option value="attended_late">Attended Late</option>
                                                                                                <option value="very_late">Very Late</option>
                                                                                                <option value="no_show">No Show</option>
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <button
                                                                                                className="remove-registration-btn"
                                                                                                onClick={() => handleRemoveRegistration('workshop', workshop.event_id, reg.registration_id, `${reg.first_name} ${reg.last_name}`)}
                                                                                                title="Cancel registration"
                                                                                            >
                                                                                                Remove
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <p>No registrations found</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No workshops found</p>
                            </div>
                        )}
                    </div>
                )}
                </TabsContent>

                {/* Emails Tab Content */}
                <TabsContent value="emails" className="flex-1 overflow-y-auto p-10 m-0">
                {(
                    <div className="admissions-dashboard__email-automation">
                        <div className="data-section__header">
                            <h2>Email Management</h2>
                            <div className="data-section__actions">
                                <button
                                    onClick={() => {
                                        fetchEmailStats();
                                        fetchQueuedEmails();
                                        fetchEmailHistory();
                                        fetchApplicantEmailStatus();
                                    }}
                                    className="refresh-btn"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Email Stats Overview */}
                        {emailStats && (
                            <div className="email-automation-stats">
                                <h3>Email Automation Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.total_emails_sent || 0}</div>
                                        <div className="stat-label text-black">Total Emails Sent</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{emailStats.unique_recipients || 0}</div>
                                        <div className="stat-label text-black">Unique Recipients</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {emailStats.total_emails_sent > 0 
                                                ? Math.round((emailStats.emails_opened / emailStats.total_emails_sent) * 100) 
                                                : 0}%
                                        </div>
                                        <div className="stat-label text-black">Open Rate</div>
                                    </div>
                                </div>

                                {/* Opt-out Stats */}
                                <div className="opt-out-stats mt-6">
                                    <h4 className="mb-4">Opt-out Reason Breakdown</h4>
                                    <div className="stats-grid">
                                        {emailStats.optOutReasons && emailStats.optOutReasons.length > 0 ? (
                                            emailStats.optOutReasons.map((reason) => (
                                                <div key={reason.reason_category} className="stat-card scale-90">
                                                    <div className="stat-value">{reason.count}</div>
                                                    <div className="stat-label text-black">{reason.reason_category}</div>
                                                </div>
                                            ))
                                        ) : emailStats.total_opted_out > 0 ? (
                                            <div className="stat-card scale-90">
                                                <div className="stat-value">{emailStats.total_opted_out}</div>
                                                <div className="stat-label text-black">Total Opted Out</div>
                                            </div>
                                        ) : (
                                            <div className="stat-card scale-90">
                                                <div className="stat-value">0</div>
                                                <div className="stat-label text-black">No Opt-outs</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Email Type Breakdown */}
                                {emailStats.typeBreakdown && emailStats.typeBreakdown.length > 0 && (
                                    <div className="email-type-breakdown">
                                        <h4>Email Type Breakdown</h4>
                                        <div className="data-table-container">
                                            <table className="data-table email-type-table">
                                                <thead>
                                                    <tr>
                                                        <th className="email-type-col">Email Type</th>
                                                        <th className="sent-col">Sent</th>
                                                        <th className="avg-col">Avg Sends per Applicant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailStats.typeBreakdown.map((type) => (
                                                        <tr key={type.email_type}>
                                                            <td className="email-type-cell">
                                                                {type.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </td>
                                                            <td className="sent-cell">{type.sent_count}</td>
                                                            <td className="avg-cell">{parseFloat(type.avg_sends_per_applicant).toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Email History */}
                        <div className="email-history-section">
                            <h3>Recent Email History ({emailHistory.length})</h3>
                            {emailHistory.length > 0 ? (
                                <div className="data-table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Email</th>
                                                <th>Email Type</th>
                                                <th>Sent At</th>
                                                <th>Send Count</th>
                                                <th>Next Send</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {emailHistory.map((email) => (
                                                <tr key={email.log_id}>
                                                    <td>{email.first_name} {email.last_name}</td>
                                                    <td>{email.email}</td>
                                                    <td className="email-type-cell">
                                                        {email.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </td>
                                                    <td>{new Date(email.email_sent_at).toLocaleString()}</td>
                                                    <td>
                                                        <span className={`send-count ${email.send_count >= 3 ? 'send-count--max' : ''}`}>
                                                            {email.send_count}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {email.next_send_at ? (
                                                            <span className="next-send">
                                                                {new Date(email.next_send_at).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="next-send--none">None</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-message">
                                    <p>No email history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </TabsContent>

            {/* Info Session Modal */}
            {infoSessionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal info-session-modal">
                        <div className="modal-header">
                            <h2>{editingInfoSession ? 'Edit Info Session' : 'Create New Info Session'}</h2>
                            <button className="close-btn" onClick={closeInfoSessionModal}>×</button>
                        </div>
                        <form onSubmit={handleInfoSessionSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={infoSessionForm.title}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder="Info Session Title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={infoSessionForm.description}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder="Session description"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_time">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        id="start_time"
                                        name="start_time"
                                        value={infoSessionForm.start_time}
                                        onChange={handleInfoSessionFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_time">End Time</label>
                                    <input
                                        type="datetime-local"
                                        id="end_time"
                                        name="end_time"
                                        value={infoSessionForm.end_time}
                                        onChange={handleInfoSessionFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity">Capacity</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={infoSessionForm.capacity}
                                    onChange={handleInfoSessionFormChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="is_online"
                                    name="is_online"
                                    checked={infoSessionForm.is_online}
                                    onChange={handleInfoSessionFormChange}
                                />
                                <label htmlFor="is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={infoSessionForm.location}
                                    onChange={handleInfoSessionFormChange}
                                    placeholder={infoSessionForm.is_online ? "Online" : "Physical location"}
                                    required
                                />
                            </div>

                            {infoSessionForm.is_online && (
                                <div className="form-group">
                                    <label htmlFor="meeting_link">Meeting Link</label>
                                    <input
                                        type="url"
                                        id="meeting_link"
                                        name="meeting_link"
                                        value={infoSessionForm.meeting_link}
                                        onChange={handleInfoSessionFormChange}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeInfoSessionModal}
                                    disabled={infoSessionSubmitting}
                                >
                                    Cancel
                                </button>
                                {editingInfoSession && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteInfoSession(editingInfoSession)}
                                        disabled={infoSessionSubmitting}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={infoSessionSubmitting}
                                >
                                    {infoSessionSubmitting
                                        ? (editingInfoSession ? 'Updating...' : 'Creating...')
                                        : (editingInfoSession ? 'Update Session' : 'Create Session')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Workshop Modal */}
            {workshopModalOpen && (
                <div className="modal-overlay">
                    <div className="modal workshop-modal">
                        <div className="modal-header">
                            <h2>{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                            <button className="close-btn" onClick={closeWorkshopModal}>×</button>
                        </div>
                        <form onSubmit={handleWorkshopSubmit}>
                            <div className="form-group">
                                <label htmlFor="workshop-title">Title</label>
                                <input
                                    type="text"
                                    id="workshop-title"
                                    name="title"
                                    value={workshopForm.title}
                                    onChange={handleWorkshopFormChange}
                                    placeholder="Workshop Title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-description">Description</label>
                                <textarea
                                    id="workshop-description"
                                    name="description"
                                    value={workshopForm.description}
                                    onChange={handleWorkshopFormChange}
                                    placeholder="Workshop description"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="workshop-start_time">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        id="workshop-start_time"
                                        name="start_time"
                                        value={workshopForm.start_time}
                                        onChange={handleWorkshopFormChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="workshop-end_time">End Time</label>
                                    <input
                                        type="datetime-local"
                                        id="workshop-end_time"
                                        name="end_time"
                                        value={workshopForm.end_time}
                                        onChange={handleWorkshopFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-capacity">Capacity</label>
                                <input
                                    type="number"
                                    id="workshop-capacity"
                                    name="capacity"
                                    value={workshopForm.capacity}
                                    onChange={handleWorkshopFormChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="workshop-is_online"
                                    name="is_online"
                                    checked={workshopForm.is_online}
                                    onChange={handleWorkshopFormChange}
                                />
                                <label htmlFor="workshop-is_online">Online Event</label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="workshop-location">Location</label>
                                <input
                                    type="text"
                                    id="workshop-location"
                                    name="location"
                                    value={workshopForm.location}
                                    onChange={handleWorkshopFormChange}
                                    placeholder={workshopForm.is_online ? "Online" : "Physical location"}
                                    required
                                />
                            </div>

                            {workshopForm.is_online && (
                                <div className="form-group">
                                    <label htmlFor="workshop-meeting_link">Meeting Link</label>
                                    <input
                                        type="url"
                                        id="workshop-meeting_link"
                                        name="meeting_link"
                                        value={workshopForm.meeting_link}
                                        onChange={handleWorkshopFormChange}
                                        placeholder="https://zoom.us/j/..."
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeWorkshopModal}
                                    disabled={workshopSubmitting}
                                >
                                    Cancel
                                </button>
                                {editingWorkshop && (
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteWorkshop(editingWorkshop)}
                                        disabled={workshopSubmitting}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={workshopSubmitting}
                                >
                                    {workshopSubmitting
                                        ? (editingWorkshop ? 'Updating...' : 'Creating...')
                                        : (editingWorkshop ? 'Update Workshop' : 'Create Workshop')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {bulkActionsModalOpen && (
                <BulkActionsModal
                    selectedCount={selectedApplicants.length}
                    onClose={() => setBulkActionsModalOpen(false)}
                    onAction={handleBulkAction}
                    isLoading={bulkActionInProgress}
                />
            )}

            {/* Add Registration Modal */}
            {addRegistrationModalOpen && (
                <div className="modal-overlay">
                    <div className="modal add-registration-modal">
                        <div className="modal-header">
                            <h2>Add Registration to {selectedEventType === 'info-session' ? 'Info Session' : 'Workshop'}</h2>
                            <button className="close-btn" onClick={closeAddRegistrationModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="search-section">
                                <div className="form-group">
                                    <label htmlFor="applicant-search">Search Applicants</label>
                                    <input
                                        type="text"
                                        id="applicant-search"
                                        value={applicantSearch}
                                        onChange={(e) => {
                                            setApplicantSearch(e.target.value);
                                        }}
                                        placeholder="Search by name, email, or applicant ID..."
                                        className="search-input"
                                    />
                                </div>
                                
                                {searchLoading && (
                                    <div className="search-loading">
                                        <div className="spinner"></div>
                                        <span>Searching...</span>
                                    </div>
                                )}
                                
                                {/* Search Results */}
                                <div className="search-results">
                                    <h4>APPLICANTS FOUND: {searchResults.length}</h4>
                                    <div className="applicant-list">
                                        {searchResults.map((applicant, index) => (
                                            <div 
                                                key={index} 
                                                className={`applicant-item ${applicant.already_registered_for_this_event ? 'already-registered' : ''} ${selectedApplicantsForRegistration.some(selected => selected.applicant_id === applicant.applicant_id) ? 'selected' : ''}`}
                                                onClick={() => !applicant.already_registered_for_this_event && toggleApplicantSelection(applicant)}
                                            >
                                                <div className="applicant-info">
                                                    <div className="applicant-name">
                                                        {applicant.display_name || applicant.first_name + ' ' + applicant.last_name}
                                                        {applicant.already_registered_for_this_event && (
                                                            <span className="already-registered-badge">
                                                                Already Registered
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="applicant-details">
                                                        <div className="applicant-email">{applicant.email}</div>
                                                        <div className="applicant-status">Status: {applicant.application_status}</div>
                                                    </div>
                                                </div>
                                                {!applicant.already_registered_for_this_event && (
                                                    <div className="selection-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedApplicantsForRegistration.some(selected => selected.applicant_id === applicant.applicant_id)}
                                                            onChange={() => toggleApplicantSelection(applicant)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && (
                                            <p className="no-results">
                                                No results yet - type to search
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {selectedApplicantsForRegistration.length > 0 && (
                                    <div className="selected-applicants">
                                        <h4>Selected for Registration ({selectedApplicantsForRegistration.length})</h4>
                                        <div className="selected-list">
                                            {selectedApplicantsForRegistration.map((applicant) => (
                                                <div key={applicant.applicant_id} className="selected-applicant">
                                                    <span>{applicant.display_name}</span>
                                                    <button
                                                        onClick={() => toggleApplicantSelection(applicant)}
                                                        className="remove-selected-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={closeAddRegistrationModal}
                                disabled={registrationLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={registerSelectedApplicants}
                                disabled={registrationLoading || selectedApplicantsForRegistration.length === 0}
                            >
                                {registrationLoading 
                                    ? 'Registering...' 
                                    : `Register ${selectedApplicantsForRegistration.length} Applicant${selectedApplicantsForRegistration.length !== 1 ? 's' : ''}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
                </TabsContents>
            </Tabs>

            {/* Notes Sidebar */}
            <NotesSidebar
                isOpen={notesModalOpen && selectedApplicant}
                applicantId={selectedApplicant?.applicant_id}
                applicantName={selectedApplicant?.name || `${selectedApplicant?.first_name} ${selectedApplicant?.last_name}`}
                onClose={closeNotesSidebar}
            />
        </div>
    );
};

export default AdmissionsDashboard; 