import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import ConversationViewer from '../../components/ConversationViewer';

const ExternalCohortsDashboard = () => {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState(null);
  
  // Create/Edit modal
  const [cohortModalOpen, setCohortModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [cohortForm, setCohortForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    contact_name: '',
    contact_email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Admin assignment modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [sendAdminInvitation, setSendAdminInvitation] = useState(true);
  const [cohortAdmins, setCohortAdmins] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [removeAdminConfirmOpen, setRemoveAdminConfirmOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  // Participant invitation modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [sendInviteEmails, setSendInviteEmails] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Statistics view
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [cohortStats, setCohortStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Conversation viewing
  const [expandedParticipant, setExpandedParticipant] = useState(null);
  const [conversationDayFilter, setConversationDayFilter] = useState(null);
  const [participantConversations, setParticipantConversations] = useState({});
  const [conversationsLoading, setConversationsLoading] = useState({});
  const [curriculumDays, setCurriculumDays] = useState([]);
  const [expandedDays, setExpandedDays] = useState({}); // Track which days are expanded
  const [expandedTasks, setExpandedTasks] = useState({}); // Track which tasks are expanded

  // Curriculum upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'
  const [jsonInput, setJsonInput] = useState('');
  const [parsedDays, setParsedDays] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch cohorts on mount
  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCohorts(data);
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // COHORT CRUD
  // ============================================================================

  const openCreateModal = () => {
    setEditingCohort(null);
    setCohortForm({
      name: '',
      start_date: '',
      end_date: '',
      description: '',
      contact_name: '',
      contact_email: ''
    });
    setCohortModalOpen(true);
  };

  const openEditModal = (cohort) => {
    setEditingCohort(cohort);
    setCohortForm({
      name: cohort.name,
      start_date: cohort.start_date ? cohort.start_date.split('T')[0] : '',
      end_date: cohort.end_date ? cohort.end_date.split('T')[0] : '',
      description: cohort.description || '',
      contact_name: cohort.contact_name || '',
      contact_email: cohort.contact_email || ''
    });
    setCohortModalOpen(true);
  };

  const handleCohortSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCohort
        ? `${import.meta.env.VITE_API_URL}/api/external-cohorts/${editingCohort.cohort_id}`
        : `${import.meta.env.VITE_API_URL}/api/external-cohorts`;

      const response = await fetch(url, {
        method: editingCohort ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cohortForm)
      });

      if (response.ok) {
        const cohort = await response.json();
        
        if (!editingCohort) {
          // Show access code for new cohort
          Swal.fire({
            icon: 'success',
            title: 'Cohort Created!',
            html: `
              <p>Cohort "<strong>${cohort.name}</strong>" has been created.</p>
              <div style="background: #4242ea; color: white; padding: 15px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                ${cohort.access_code}
              </div>
              <p style="font-size: 14px; color: #666;">Share this access code with participants to sign up.</p>
            `,
            confirmButtonColor: '#4242ea'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Cohort Updated',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        setCohortModalOpen(false);
        fetchCohorts();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to save cohort'
        });
      }
    } catch (error) {
      console.error('Error saving cohort:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateCohort = async (cohort) => {
    const result = await Swal.fire({
      title: 'Deactivate Cohort?',
      text: `Are you sure you want to deactivate "${cohort.name}"? Participants will no longer be able to sign up with the access code.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, deactivate'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Cohort Deactivated',
          timer: 2000,
          showConfirmButton: false
        });
        fetchCohorts();
      }
    } catch (error) {
      console.error('Error deactivating cohort:', error);
    }
  };

  // ============================================================================
  // ADMIN ASSIGNMENT
  // ============================================================================

  const openAdminModal = async (cohort) => {
    setSelectedCohort(cohort);
    setAdminEmail('');
    setSendAdminInvitation(true);
    setAdminModalOpen(true);
    
    // Fetch existing admins
    setAdminLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}/admins`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setCohortAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;

    setAdminLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/assign-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: adminEmail,
            send_invitation: sendAdminInvitation
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: data.is_pending ? 'Invitation Sent' : 'Admin Assigned',
          text: data.message,
          timer: 3000,
          showConfirmButton: false
        });
        setAdminEmail('');
        
        // Refresh admins list
        const adminsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/admins`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (adminsResponse.ok) {
          setCohortAdmins(await adminsResponse.json());
        }
        fetchCohorts();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to assign admin'
        });
      }
    } catch (error) {
      console.error('Error assigning admin:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    setAdminToRemove(adminId);
    setRemoveAdminConfirmOpen(true);
  };

  const confirmRemoveAdmin = async () => {
    if (!adminToRemove) return;

    setAdminLoading(true);
    setRemoveAdminConfirmOpen(false);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/admins/${adminToRemove}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast.success('Admin removed successfully', {
          description: 'The admin has been removed from this cohort'
        });
        setCohortAdmins(prev => prev.filter(a => a.admin_id !== adminToRemove));
        fetchCohorts();
      } else {
        const data = await response.json();
        toast.error('Failed to remove admin', {
          description: data.error || 'An error occurred while removing the admin'
        });
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin', {
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setAdminLoading(false);
      setAdminToRemove(null);
    }
  };

  // ============================================================================
  // PARTICIPANT INVITATIONS
  // ============================================================================

  const openInviteModal = async (cohort) => {
    setSelectedCohort(cohort);
    setInviteEmails('');
    setSendInviteEmails(true);
    setInviteModalOpen(true);

    // Fetch existing invitations
    setInviteLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}/invitations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendInvitations = async (e) => {
    e.preventDefault();
    
    // Parse emails (split by newline or comma)
    const emailList = inviteEmails
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (emailList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Emails',
        text: 'Please enter at least one valid email address'
      });
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emails: emailList,
            send_emails: sendInviteEmails
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Invitations Sent',
          text: data.message,
          timer: 3000,
          showConfirmButton: false
        });
        setInviteEmails('');
        
        // Refresh invitations list
        const invitesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/invitations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (invitesResponse.ok) {
          setInvitations(await invitesResponse.json());
        }
        fetchCohorts();
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to send invitations'
        });
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvitations = async () => {
    setInviteLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/resend-invitations`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Emails Resent',
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error resending invitations:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const openStatsModal = async (cohort) => {
    setSelectedCohort(cohort);
    setStatsModalOpen(true);
    setStatsLoading(true);

    try {
      const [statsRes, participantsRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}/participants`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      if (statsRes.ok) {
        setCohortStats(await statsRes.json());
      }
      if (participantsRes.ok) {
        setParticipants(await participantsRes.json());
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const exportParticipantsCSV = () => {
    if (participants.length === 0) return;

    const headers = ['First Name', 'Last Name', 'Email', 'Joined', 'Tasks Completed', 'Submissions', 'Last Activity'];
    const rows = participants.map(p => [
      p.first_name,
      p.last_name,
      p.email,
      new Date(p.joined_at).toLocaleDateString(),
      p.tasks_completed,
      p.submissions_count,
      p.last_activity ? new Date(p.last_activity).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCohort.name.replace(/\s+/g, '_')}_participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // CONVERSATION VIEWING
  // ============================================================================

  const fetchCurriculumDays = async (cohortId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohortId}/curriculum`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const days = await response.json();
        setCurriculumDays(days);
      }
    } catch (error) {
      console.error('Error fetching curriculum days:', error);
    }
  };

  const fetchParticipantConversations = async (userId) => {
    if (conversationsLoading[userId]) return;

    setConversationsLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const dayParam = conversationDayFilter ? `?dayNumber=${conversationDayFilter}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/participants/${userId}/conversations${dayParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setParticipantConversations(prev => ({
          ...prev,
          [userId]: data.tasks
        }));
      }
    } catch (error) {
      console.error('Error fetching participant conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setConversationsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleParticipantRow = async (userId) => {
    if (expandedParticipant === userId) {
      setExpandedParticipant(null);
    } else {
      setExpandedParticipant(userId);
      // Fetch conversations if not already loaded
      if (!participantConversations[userId]) {
        await fetchParticipantConversations(userId);
      }
    }
  };

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Group tasks by day
  const groupTasksByDay = (tasks) => {
    if (!tasks || tasks.length === 0) return [];
    
    const grouped = tasks.reduce((acc, task) => {
      const dayKey = task.day_number;
      if (!acc[dayKey]) {
        acc[dayKey] = {
          day_number: task.day_number,
          day_date: task.day_date,
          tasks: []
        };
      }
      acc[dayKey].tasks.push(task);
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => a.day_number - b.day_number);
  };

  // Fetch curriculum days when stats modal opens
  useEffect(() => {
    if (statsModalOpen && selectedCohort) {
      fetchCurriculumDays(selectedCohort.cohort_id);
    }
  }, [statsModalOpen, selectedCohort]);

  // Refetch conversations when day filter changes
  useEffect(() => {
    if (expandedParticipant && selectedCohort) {
      fetchParticipantConversations(expandedParticipant);
    }
  }, [conversationDayFilter]);

  // ============================================================================
  // CURRICULUM UPLOAD
  // ============================================================================

  const openUploadModal = (cohort) => {
    setSelectedCohort(cohort);
    setUploadModalOpen(true);
    setUploadMethod('file');
    setJsonInput('');
    setParsedDays([]);
    setUploadErrors([]);
    setShowConfirmation(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        parseAndValidateJSON(content);
      } catch (error) {
        setUploadErrors([`Error reading file: ${error.message}`]);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJSON = () => {
    if (!jsonInput.trim()) {
      setUploadErrors(['Please paste JSON content']);
      return;
    }
    parseAndValidateJSON(jsonInput);
  };

  const parseAndValidateJSON = (jsonString) => {
    try {
      setUploadErrors([]);
      const parsed = JSON.parse(jsonString);
      
      // Convert to array if single object
      let daysArray = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate each day
      const errors = [];
      const validDays = [];
      
      daysArray.forEach((day, index) => {
        const dayErrors = [];
        
        if (day.day_number === undefined || day.day_number === null) dayErrors.push('Missing day_number');
        if (!day.date) dayErrors.push('Missing date');
        if (!day.time_blocks || !Array.isArray(day.time_blocks)) {
          dayErrors.push('Missing or invalid time_blocks');
        }
        
        if (dayErrors.length > 0) {
          errors.push(`Day ${index + 1}: ${dayErrors.join(', ')}`);
        } else {
          validDays.push(day);
        }
      });
      
      if (errors.length > 0) {
        setUploadErrors(errors);
        setParsedDays([]);
      } else {
        setParsedDays(validDays);
        setUploadErrors([]);
      }
    } catch (error) {
      setUploadErrors([`Invalid JSON: ${error.message}`]);
      setParsedDays([]);
    }
  };

  const updateDayField = (index, field, value) => {
    const updated = [...parsedDays];
    updated[index] = { ...updated[index], [field]: value };
    setParsedDays(updated);
  };

  const handleUploadConfirm = () => {
    setShowConfirmation(true);
  };

  const handleUploadSubmit = async () => {
    if (!selectedCohort || parsedDays.length === 0) return;
    
    setUploading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/bulk-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cohortId: selectedCohort.cohort_id,
            days: parsedDays
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Upload Complete',
          html: `
            <div class="text-left">
              <p><strong>Created:</strong> ${data.summary.created} days</p>
              <p><strong>Updated:</strong> ${data.summary.updated} days</p>
              ${data.summary.errors > 0 ? `<p class="text-red-600"><strong>Errors:</strong> ${data.summary.errors} days</p>` : ''}
            </div>
          `
        });
        setUploadModalOpen(false);
        setParsedDays([]);
        setJsonInput('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: data.error || 'Failed to upload curriculum'
        });
      }
    } catch (error) {
      console.error('Error uploading curriculum:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setUploading(false);
      setShowConfirmation(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const copyAccessCode = (code) => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Access code "${code}" copied to clipboard`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInvitationStatusBadge = (status) => {
    switch (status) {
      case 'registered':
        return <Badge className="bg-green-100 text-green-700">Registered</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-proxima">Loading external cohorts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white border border-[#C8C8C8]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-proxima-bold text-[#1a1a1a]">
                  External Cohorts Management
                </CardTitle>
                <p className="text-gray-600 font-proxima mt-1">
                  Manage B2B enterprise cohorts with access codes, admin assignments, and participant tracking
                </p>
              </div>
              <Button
                onClick={openCreateModal}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                + Create External Cohort
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Cohorts Table */}
        {cohorts.length > 0 ? (
          <Card className="bg-white border border-[#C8C8C8]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-proxima-bold">Name</TableHead>
                    <TableHead className="font-proxima-bold w-[140px]">Access Code</TableHead>
                    <TableHead className="font-proxima-bold">Dates</TableHead>
                    <TableHead className="font-proxima-bold text-center w-[100px]">Participants</TableHead>
                    <TableHead className="font-proxima-bold text-center w-[100px]">Invitations</TableHead>
                    <TableHead className="font-proxima-bold w-[180px]">Admin</TableHead>
                    <TableHead className="font-proxima-bold text-center w-[90px]">Status</TableHead>
                    <TableHead className="font-proxima-bold text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((cohort) => (
                    <TableRow key={cohort.cohort_id} className="hover:bg-gray-50">
                      <TableCell className="font-medium font-proxima">
                        <div>
                          <div className="font-semibold">{cohort.name}</div>
                          {cohort.contact_name && (
                            <div className="text-xs text-gray-500 mt-0.5">{cohort.contact_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                            {cohort.access_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAccessCode(cohort.access_code)}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            title="Copy access code"
                          >
                            📋
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-proxima text-sm">
                        <div>
                          <div className="whitespace-nowrap">{formatDate(cohort.start_date)}</div>
                          {cohort.end_date && (
                            <div className="text-gray-500 text-xs whitespace-nowrap">→ {formatDate(cohort.end_date)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-proxima-bold text-base text-[#4242ea]">
                          {cohort.participant_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-proxima text-sm">{cohort.invitation_count || 0}</span>
                          {cohort.pending_count > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0">
                              {cohort.pending_count} pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-proxima text-sm">
                        {cohort.admin_email ? (
                          <div>
                            <div className="truncate max-w-[180px]" title={cohort.admin_email}>
                              {cohort.admin_email}
                            </div>
                            {cohort.admin_active === false && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs mt-1">Pending</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No admin</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {cohort.is_active !== false ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="font-proxima text-xs h-8"
                            >
                              Actions ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 font-proxima">
                            <DropdownMenuItem 
                              onClick={() => openStatsModal(cohort)}
                              className="cursor-pointer"
                            >
                              <span className="mr-2">📊</span>
                              View Statistics
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openUploadModal(cohort)}
                              className="cursor-pointer"
                            >
                              <span className="mr-2">📚</span>
                              Upload Curriculum
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openAdminModal(cohort)}
                              className="cursor-pointer"
                            >
                              <span className="mr-2">👤</span>
                              Manage Admins
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openInviteModal(cohort)}
                              className="cursor-pointer"
                            >
                              <span className="mr-2">✉️</span>
                              Invite Participants
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openEditModal(cohort)}
                              className="cursor-pointer"
                            >
                              <span className="mr-2">✏️</span>
                              Edit Cohort
                            </DropdownMenuItem>
                            {cohort.is_active !== false && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivateCohort(cohort)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <span className="mr-2">🚫</span>
                                  Deactivate Cohort
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border border-[#C8C8C8]">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 font-proxima mb-4">No external cohorts found</p>
              <Button
                onClick={openCreateModal}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                Create Your First External Cohort
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Cohort Modal */}
        <Dialog open={cohortModalOpen} onOpenChange={setCohortModalOpen}>
          <DialogContent className="max-w-lg font-proxima">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                {editingCohort ? 'Edit External Cohort' : 'Create External Cohort'}
              </DialogTitle>
              <DialogDescription>
                {editingCohort 
                  ? 'Update the cohort details below.'
                  : 'Create a new external cohort for B2B clients. An access code will be automatically generated.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCohortSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-proxima-bold">Cohort Name *</Label>
                <Input
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  placeholder="e.g., Meta Engineering Workshop Jan 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-proxima-bold">Start Date *</Label>
                  <Input
                    type="date"
                    value={cohortForm.start_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-proxima-bold">End Date</Label>
                  <Input
                    type="date"
                    value={cohortForm.end_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-proxima-bold">Contact Name</Label>
                  <Input
                    value={cohortForm.contact_name}
                    onChange={(e) => setCohortForm({ ...cohortForm, contact_name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-proxima-bold">Contact Email</Label>
                  <Input
                    type="email"
                    value={cohortForm.contact_email}
                    onChange={(e) => setCohortForm({ ...cohortForm, contact_email: e.target.value })}
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-proxima-bold">Description</Label>
                <Textarea
                  value={cohortForm.description}
                  onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                  placeholder="Brief description of the cohort..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCohortModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-[#4242ea] hover:bg-[#3333d1]">
                  {submitting ? 'Saving...' : editingCohort ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin Assignment Modal */}
        <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
          <DialogContent className="max-w-lg font-proxima">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                Assign Cohort Admin - {selectedCohort?.name}
              </DialogTitle>
              <DialogDescription>
                Assign a company contact as cohort admin. They'll be able to view participant progress and statistics.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAssignAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-proxima-bold">Admin Email</Label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={sendAdminInvitation}
                  onCheckedChange={setSendAdminInvitation}
                />
                <Label>Send invitation email with access code</Label>
              </div>

              <Button type="submit" disabled={adminLoading} className="w-full bg-[#4242ea] hover:bg-[#3333d1]">
                {adminLoading ? 'Assigning...' : 'Assign Admin'}
              </Button>
            </form>

            {cohortAdmins.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-proxima-bold mb-3">Current Admins</h4>
                <div className="space-y-2">
                  {cohortAdmins.map((admin) => (
                    <div key={admin.admin_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{admin.display_email}</div>
                        {admin.first_name && (
                          <div className="text-sm text-gray-500">{admin.first_name} {admin.last_name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {admin.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.admin_id)}
                          disabled={adminLoading}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {adminLoading ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Remove Admin Confirmation Dialog */}
        <AlertDialog open={removeAdminConfirmOpen} onOpenChange={setRemoveAdminConfirmOpen}>
          <AlertDialogContent className="font-proxima">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this admin? They will no longer have access to view participant progress and statistics for this cohort.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveAdmin}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Participant Invitation Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="max-w-2xl font-proxima">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                Invite Participants - {selectedCohort?.name}
              </DialogTitle>
              <DialogDescription>
                Enter participant emails to invite them to join this cohort. They'll receive the access code to sign up.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="invite" className="w-full">
              <TabsList>
                <TabsTrigger value="invite">Send Invitations</TabsTrigger>
                <TabsTrigger value="list">Invitation List ({invitations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="invite" className="space-y-4">
                <form onSubmit={handleSendInvitations} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-proxima-bold">Participant Emails</Label>
                    <Textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="Enter emails, one per line or comma-separated:&#10;john@company.com&#10;jane@company.com&#10;mike@company.com"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500">
                      Enter one email per line or separate with commas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={sendInviteEmails}
                      onCheckedChange={setSendInviteEmails}
                    />
                    <Label>Send invitation emails immediately</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={inviteLoading} className="flex-1 bg-[#4242ea] hover:bg-[#3333d1]">
                      {inviteLoading ? 'Sending...' : 'Send Invitations'}
                    </Button>
                    {invitations.filter(i => i.status !== 'registered').length > 0 && (
                      <Button type="button" variant="outline" onClick={handleResendInvitations} disabled={inviteLoading}>
                        Resend All Pending
                      </Button>
                    )}
                  </div>
                </form>

                {selectedCohort && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Access Code for this cohort:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-[#4242ea] text-white px-4 py-2 rounded font-mono text-lg">
                        {selectedCohort.access_code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAccessCode(selectedCohort.access_code)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list">
                {invitations.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((inv) => (
                          <TableRow key={inv.invitation_id}>
                            <TableCell className="font-mono text-sm">{inv.email}</TableCell>
                            <TableCell>{getInvitationStatusBadge(inv.status)}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {inv.sent_at ? formatDate(inv.sent_at) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {inv.registered_at ? formatDate(inv.registered_at) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">No invitations sent yet</p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Statistics Modal */}
        <Dialog open={statsModalOpen} onOpenChange={setStatsModalOpen}>
          <DialogContent className="max-w-[95vw] w-[1400px] font-proxima max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                Statistics - {selectedCohort?.name}
              </DialogTitle>
            </DialogHeader>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Split Pane: Participants List (Left) | Conversation Details (Right) */}
                <div className="flex gap-4 flex-1 min-h-0">
                  {/* LEFT PANE: Participants List */}
                  <div className="w-[400px] flex flex-col border-r pr-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-proxima-bold text-sm">Participants ({participants.length})</h3>
                      <Button variant="outline" size="sm" onClick={exportParticipantsCSV} className="h-7 text-xs">
                        📥 CSV
                      </Button>
                    </div>
                    
                    {/* Day Filter */}
                    <select
                      value={conversationDayFilter || ''}
                      onChange={(e) => setConversationDayFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="text-xs border border-gray-300 rounded px-2 py-1.5 font-proxima mb-3"
                    >
                      <option value="">All Days</option>
                      {curriculumDays.map(day => (
                        <option key={day.id} value={day.day_number}>
                          Day {day.day_number} ({formatDate(day.day_date)})
                        </option>
                      ))}
                    </select>

                    {/* Scrollable Participants List */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                      {participants.length > 0 ? (
                        participants.map((p) => (
                          <div
                            key={p.user_id}
                            onClick={() => toggleParticipantRow(p.user_id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              expandedParticipant === p.user_id
                                ? 'bg-[#4242ea] text-white border-[#4242ea]'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm truncate ${expandedParticipant === p.user_id ? 'text-white' : 'text-gray-900'}`}>
                                  {p.first_name} {p.last_name}
                                </div>
                                <div className={`text-xs truncate ${expandedParticipant === p.user_id ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {p.email}
                                </div>
                                <div className="flex gap-2 mt-1.5">
                                  <span className={`text-xs ${expandedParticipant === p.user_id ? 'text-blue-100' : 'text-gray-600'}`}>
                                    {p.tasks_completed} tasks
                                  </span>
                                  <span className={`text-xs ${expandedParticipant === p.user_id ? 'text-blue-100' : 'text-gray-600'}`}>
                                    • {p.submissions_count} submissions
                                  </span>
                                </div>
                              </div>
                              <Badge
                                className={
                                  expandedParticipant === p.user_id
                                    ? 'bg-white/20 text-white text-xs'
                                    : p.tasks_completed > 0
                                    ? 'bg-green-100 text-green-700 text-xs'
                                    : 'bg-gray-100 text-gray-600 text-xs'
                                }
                              >
                                {p.tasks_completed > 0 ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-gray-500 text-sm">No participants yet</p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: Conversation Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {expandedParticipant ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-proxima-bold text-sm">
                            Conversations
                            {conversationDayFilter && ` - Day ${conversationDayFilter}`}
                          </h3>
                          {participantConversations[expandedParticipant] && (
                            <Badge variant="outline" className="text-xs">
                              {participantConversations[expandedParticipant].filter(t => t.has_conversation).length} with conversations
                            </Badge>
                          )}
                        </div>

                        {/* Scrollable Conversation Area */}
                        <div className="flex-1 overflow-y-auto pr-2">
                          {conversationsLoading[expandedParticipant] ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-6 h-6 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-3 text-gray-600">Loading conversations...</span>
                            </div>
                          ) : participantConversations[expandedParticipant] && participantConversations[expandedParticipant].length > 0 ? (
                            <div className="space-y-3">
                              {groupTasksByDay(participantConversations[expandedParticipant]).map((day) => (
                                <div key={day.day_number} className="border rounded-lg overflow-hidden">
                                  {/* Day Header - Clickable to expand/collapse */}
                                  <div
                                    onClick={() => toggleDay(day.day_number)}
                                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer border-b"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <span className={`transform transition-transform text-xs ${expandedDays[day.day_number] ? 'rotate-90' : ''}`}>
                                          ▶
                                        </span>
                                      </Button>
                                      <div>
                                        <div className="font-proxima-bold text-sm">
                                          Day {day.day_number} - {formatDate(day.day_date)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {day.tasks.length} {day.tasks.length === 1 ? 'task' : 'tasks'}
                                          {day.tasks.filter(t => t.has_conversation).length > 0 && 
                                            ` • ${day.tasks.filter(t => t.has_conversation).length} with conversations`
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      {day.tasks.some(t => t.task_status === 'completed') && (
                                        <Badge className="bg-green-100 text-green-700 text-xs">
                                          {day.tasks.filter(t => t.task_status === 'completed').length} completed
                                        </Badge>
                                      )}
                                      {day.tasks.some(t => t.submission) && (
                                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                                          {day.tasks.filter(t => t.submission).length} submitted
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Day Tasks - Shown when expanded */}
                                  {expandedDays[day.day_number] && (
                                    <div className="p-3 space-y-2 bg-white">
                                      {day.tasks.map((task) => (
                                        <div key={task.task_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                          {/* Task Header - Clickable to expand/collapse */}
                                          <div
                                            onClick={() => toggleTask(task.task_id)}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                                          >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                                                <span className={`transform transition-transform text-xs ${expandedTasks[task.task_id] ? 'rotate-90' : ''}`}>
                                                  ▶
                                                </span>
                                              </Button>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{task.task_title}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                  {task.has_conversation ? (
                                                    <span className="text-xs text-blue-600">
                                                      {task.messages?.length || 0} messages
                                                    </span>
                                                  ) : (
                                                    <span className="text-xs text-gray-400">No conversation</span>
                                                  )}
                                                  {task.submission && (
                                                    <span className="text-xs text-purple-600">• Submitted</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0 ml-2">
                                              {task.task_status && (
                                                <Badge 
                                                  className={
                                                    task.task_status === 'completed'
                                                      ? 'bg-green-100 text-green-700 text-xs'
                                                      : task.task_status === 'in_progress'
                                                      ? 'bg-blue-100 text-blue-700 text-xs'
                                                      : 'bg-gray-100 text-gray-600 text-xs'
                                                  }
                                                >
                                                  {task.task_status === 'in_progress' ? 'In Progress' : task.task_status}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>

                                          {/* Task Content - Shown when expanded */}
                                          {expandedTasks[task.task_id] && (
                                            <div className="border-t bg-white p-3">
                                              {task.has_conversation ? (
                                                <ConversationViewer
                                                  task={task}
                                                  messages={task.messages}
                                                  questions={task.questions}
                                                  participant={participants.find(p => p.user_id === expandedParticipant)}
                                                  submission={task.submission}
                                                />
                                              ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                  No conversation for this task yet
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center py-12">
                                <p className="text-gray-500">
                                  {conversationDayFilter 
                                    ? `No tasks found for Day ${conversationDayFilter}`
                                    : 'No conversations found for this participant'
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">💬</span>
                          </div>
                          <p className="text-gray-600 font-proxima">
                            Select a participant to view their conversations
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Curriculum Upload Modal */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="max-w-7xl font-proxima max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                Upload Curriculum - {selectedCohort?.name}
              </DialogTitle>
              <DialogDescription>
                Upload curriculum days from JSON file or paste JSON directly
              </DialogDescription>
            </DialogHeader>

            {!showConfirmation ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT SIDE: Input Methods */}
                <div className="space-y-4">
                  <h3 className="font-proxima-bold text-lg">Step 1: Input JSON</h3>
                  
                  <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
                    <TabsList className="w-full">
                      <TabsTrigger value="file" className="flex-1">Upload File</TabsTrigger>
                      <TabsTrigger value="paste" className="flex-1">Paste JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-proxima-bold">Select JSON File</Label>
                        <Input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">
                          Upload a .json file containing curriculum day data
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="paste" className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-proxima-bold">Paste JSON Content</Label>
                        <Textarea
                          value={jsonInput}
                          onChange={(e) => setJsonInput(e.target.value)}
                          placeholder='Paste your JSON here, e.g.:&#10;{&#10;  "day_number": 1,&#10;  "date": "2025-01-06",&#10;  "time_blocks": [...]&#10;}'
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button onClick={handlePasteJSON} className="w-full bg-[#4242ea] hover:bg-[#3333d1]">
                        Parse JSON
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* Errors Display */}
                  {uploadErrors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-bold text-red-700 mb-2">Validation Errors:</p>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {uploadErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary when parsed */}
                  {parsedDays.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-bold text-green-700 mb-2">✓ Parsed Successfully</p>
                      <p className="text-sm text-green-600">
                        {parsedDays.length} {parsedDays.length === 1 ? 'day' : 'days'} ready to edit →
                      </p>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE: Preview & Edit */}
                <div className="space-y-4 border-l pl-6">
                  <h3 className="font-proxima-bold text-lg">
                    Step 2: Preview & Edit
                  </h3>

                  {parsedDays.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <p className="text-lg mb-2">No data to preview</p>
                        <p className="text-sm">Upload or paste JSON to begin</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Edit metadata for each day before uploading
                      </p>

                      <div className="max-h-[500px] overflow-y-auto space-y-6 pr-2">
                        {parsedDays.map((day, index) => (
                          <Card key={index} className="border-2">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center justify-between">
                                <span>Day {day.day_number}</span>
                                <Badge variant="outline" className="ml-2">
                                  {day.time_blocks?.length || 0} time blocks
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-proxima-bold">Day Number</Label>
                                  <Input
                                    type="number"
                                    value={day.day_number}
                                    onChange={(e) => updateDayField(index, 'day_number', parseInt(e.target.value))}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-proxima-bold">Date</Label>
                                  <Input
                                    type="date"
                                    value={day.date}
                                    onChange={(e) => updateDayField(index, 'date', e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-proxima-bold">Week</Label>
                                  <Input
                                    type="number"
                                    value={day.week !== undefined ? day.week : 1}
                                    onChange={(e) => updateDayField(index, 'week', parseInt(e.target.value))}
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-proxima-bold">Level</Label>
                                  <Input
                                    value={day.level || ''}
                                    onChange={(e) => updateDayField(index, 'level', e.target.value)}
                                    className="h-8"
                                    placeholder="e.g., L1, L3+"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-proxima-bold">Weekly Goal</Label>
                                <Input
                                  value={day.weekly_goal || ''}
                                  onChange={(e) => updateDayField(index, 'weekly_goal', e.target.value)}
                                  className="h-8"
                                  placeholder="Enter weekly goal..."
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-proxima-bold">Daily Goal</Label>
                                <Textarea
                                  value={day.daily_goal || ''}
                                  onChange={(e) => updateDayField(index, 'daily_goal', e.target.value)}
                                  className="min-h-[80px] text-sm"
                                  placeholder="Enter daily goal..."
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setUploadModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUploadConfirm}
                          className="bg-[#4242ea] hover:bg-[#3333d1]"
                        >
                          Continue to Upload →
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Confirmation Dialog */
              <div className="space-y-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-proxima-bold text-lg mb-4">Confirm Upload</h3>
                  <p className="mb-4">
                    You are about to upload <strong>{parsedDays.length}</strong> curriculum {parsedDays.length === 1 ? 'day' : 'days'} to <strong>{selectedCohort?.name}</strong>:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {parsedDays.map((day, i) => (
                      <Badge key={i} className="bg-[#4242ea] text-white">
                        Day {day.day_number}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    ⚠️ Days that already exist will be updated. New days will be created.
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={uploading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleUploadSubmit}
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ExternalCohortsDashboard;

