import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Plus,
  Download,
  Search,
  CalendarDays,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getAllLeads,
  exportLeadsCSV,
  deleteLead,
  updateLead,
  createLead,
  getLeadById,
  getSalesTrackerUsers,
  handleApiError,
  downloadFile
} from '../../../services/salesTrackerApi';

const AllLeads = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all-stages');
  const [ownerFilter, setOwnerFilter] = useState('all-owners');
  const [activeTab, setActiveTab] = useState('all');
  const [leads, setLeads] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pageSize, setPageSize] = useState(20); // Show 20 leads per page
  
  // Modals
  const [viewDetailsModal, setViewDetailsModal] = useState({ isOpen: false, lead: null, isEditing: false, showStatusUpdate: false });
  const [addLeadModal, setAddLeadModal] = useState({ isOpen: false });

  // Delete confirmation state
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Quick update modal state
  const [quickUpdateModal, setQuickUpdateModal] = useState({ isOpen: false, lead: null });

  // Add lead form
  const [addLeadForm, setAddLeadForm] = useState({
    outreachDate: new Date().toISOString().split('T')[0],
    contactName: '',
    companyName: '',
    contactTitle: '',
    contactEmail: '',
    linkedinUrl: '',
    source: '',
    stage: 'Initial Outreach',
    alignedSectors: [],
    currentOwnerId: '',
    notes: ''
  });
  const [updateForm, setUpdateForm] = useState({
    stage: '',
    leadType: '',
    activityNotes: '',
    nextSteps: ''
  });
  
  // Edit form for view details modal
  const [editForm, setEditForm] = useState({
    contactName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    jobTitle: '',
    stage: '',
    status: '',
    experienceLevel: '',
    salaryRange: '',
    linkedinUrl: '',
    notes: '',
    responseNotes: '',
    roleConsideration: ''
  });

  // Load staff users on component mount and set current user as default owner
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const response = await getSalesTrackerUsers();
        const staff = response.staff || [];
        setStaffUsers(staff);

        // Set current user as default owner if they are in the staff list
        if (currentUser && staff.length > 0) {
          const currentStaffUser = staff.find(staffUser =>
            staffUser.email?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          if (currentStaffUser) {
            setAddLeadForm(prev => ({
              ...prev,
              currentOwnerId: currentStaffUser.id.toString()
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch staff users:', err);
      }
    };

    fetchStaffUsers();
  }, [currentUser]);

  // Effect for filter changes - reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, ownerFilter, activeTab]);

  // Effect for fetching data - runs when page or filters change
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAllLeads({
          search: searchTerm,
          stage: stageFilter,
          owner: ownerFilter,
          tab: activeTab,
          page: currentPage,
          limit: pageSize
        });

        setLeads(response.leads || []);
        setTotalPages(response.totalPages || 1);
        setTotalLeads(response.totalCount || 0);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setError(handleApiError(err));

        // Fallback to mock data on error
        const mockLeads = [
          {
            id: 1,
            name: 'Stephanie Ribeiro Levites',
            company: 'EY',
            status: 'Initial Outreach',
            stage: 'INITIAL OUTREACH',
            lastContact: 'Today',
            sectors: ['Technology'],
            currentOwner: 'Frances Steele',
            network: 'LinkedIn'
          },
          {
            id: 2,
            name: 'Kat Choumanova',
            company: 'Branch',
            status: 'Initial Outreach',
            stage: 'INITIAL OUTREACH',
            lastContact: '1 Day Ago',
            sectors: ['Software Engineer'],
            currentOwner: 'Kirstie Chen',
            network: 'Referral'
          },
          {
            id: 3,
            name: 'Michael Dash',
            company: 'TBD',
            status: 'Initial Outreach',
            stage: 'INITIAL OUTREACH',
            lastContact: '2 Days Ago',
            sectors: [],
            currentOwner: 'Timothy Asprec',
            network: 'Company Website'
          }
        ];
        setLeads(mockLeads);
        setTotalLeads(3);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    const searchTimer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(searchTimer);
  }, [searchTerm, stageFilter, ownerFilter, activeTab, currentPage, pageSize]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStage = stageFilter === 'all-stages' || lead.stage === stageFilter;
    const matchesOwner = ownerFilter === 'all-owners' || lead.currentOwner === ownerFilter;
    
    return matchesSearch && matchesStage && matchesOwner;
  });

  const handleAddLead = () => {
    // Find current user in staff list to set as default owner
    let defaultOwnerId = '';
    if (currentUser && staffUsers.length > 0) {
      const currentStaffUser = staffUsers.find(staffUser =>
        staffUser.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (currentStaffUser) {
        defaultOwnerId = currentStaffUser.id.toString();
      }
    }

    setAddLeadForm({
      outreachDate: new Date().toISOString().split('T')[0],
      contactName: '',
      companyName: '',
      contactTitle: '',
      contactEmail: '',
      linkedinUrl: '',
      source: '',
      stage: 'Initial Outreach',
      alignedSectors: [],
      currentOwnerId: defaultOwnerId,
      notes: ''
    });
    setAddLeadModal({ isOpen: true });
  };

  const handleDownloadCSV = async () => {
    try {
      setLoading(true);
      const blob = await exportLeadsCSV({ 
        search: searchTerm, 
        stage: stageFilter, 
        owner: ownerFilter,
        tab: activeTab 
      });
      downloadFile(blob, `leads-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Failed to export leads:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'initial outreach':
        return 'bg-blue-100 text-blue-800';
      case 'active lead':
        return 'bg-green-100 text-green-800';
      case 'follow up':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'not interested':
        return 'bg-red-100 text-red-800';
      case 'close won':
        return 'bg-green-100 text-green-800';
      case 'close loss':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = async (lead) => {
    try {
      const fullLead = await getLeadById(lead.id);
      const leadData = fullLead.lead || lead;
      setViewDetailsModal({ isOpen: true, lead: leadData, isEditing: false });
      
      // Initialize edit form with current data
      setEditForm({
        contactName: leadData.name || '',
        companyName: leadData.company || '',
        contactEmail: leadData.email || '',
        contactPhone: leadData.contactPhone || '',
        contactTitle: leadData.contactTitle || '',
        jobTitle: leadData.jobTitle || '',
        stage: leadData.stage || '',
        status: leadData.status || '',
        experienceLevel: leadData.experienceLevel || '',
        salaryRange: leadData.salaryRange || '',
        linkedinUrl: leadData.linkedinUrl || '',
        notes: leadData.notes || '',
        responseNotes: leadData.responseNotes || '',
        roleConsideration: leadData.roleConsideration || ''
      });
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
      setViewDetailsModal({ isOpen: true, lead, isEditing: false });
    }
  };

  const handleStartEdit = () => {
    setViewDetailsModal(prev => ({ ...prev, isEditing: true }));
  };

  const handleCancelEdit = () => {
    setViewDetailsModal(prev => ({ ...prev, isEditing: false }));
    // Reset form to original values
    const leadData = viewDetailsModal.lead;
    setEditForm({
      contactName: leadData.name || '',
      companyName: leadData.company || '',
      contactEmail: leadData.email || '',
      contactPhone: leadData.contactPhone || '',
      contactTitle: leadData.contactTitle || '',
      jobTitle: leadData.jobTitle || '',
      stage: leadData.stage || '',
      status: leadData.status || '',
      experienceLevel: leadData.experienceLevel || '',
      salaryRange: leadData.salaryRange || '',
      linkedinUrl: leadData.linkedinUrl || '',
      notes: leadData.notes || '',
      responseNotes: leadData.responseNotes || '',
      roleConsideration: leadData.roleConsideration || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      await updateLead(viewDetailsModal.lead.id, {
        contact_name: editForm.contactName,
        company_name: editForm.companyName,
        contact_email: editForm.contactEmail,
        contact_phone: editForm.contactPhone,
        contact_title: editForm.contactTitle,
        job_title: editForm.jobTitle,
        stage: editForm.stage,
        status: editForm.status,
        experience_level: editForm.experienceLevel,
        salary_range: editForm.salaryRange,
        linkedin_url: editForm.linkedinUrl,
        notes: editForm.notes,
        response_notes: editForm.responseNotes,
        role_consideration: editForm.roleConsideration,
        updated_at: new Date().toISOString()
      });
      
      setViewDetailsModal({ isOpen: false, lead: null, isEditing: false });
      
      // Refresh leads list
      const response = await getAllLeads({
        search: searchTerm,
        stage: stageFilter,
        owner: ownerFilter,
        tab: activeTab,
        page: currentPage,
        limit: pageSize
      });
      setLeads(response.leads || []);
    } catch (err) {
      console.error('Failed to update lead:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdate = (lead) => {
    setUpdateForm({
      stage: lead.stage || '',
      leadType: lead.leadType || '',
      activityNotes: '',
      nextSteps: ''
    });
    setQuickUpdateModal({ isOpen: true, lead });
  };

  const handleAddLeadSubmit = async () => {
    try {
      setLoading(true);
      await createLead({
        outreach_date: addLeadForm.outreachDate,
        contact_name: addLeadForm.contactName,
        company_name: addLeadForm.companyName,
        contact_title: addLeadForm.contactTitle,
        contact_email: addLeadForm.contactEmail,
        linkedin_url: addLeadForm.linkedinUrl,
        source: addLeadForm.source,
        stage: addLeadForm.stage,
        aligned_sectors: addLeadForm.alignedSectors,
        current_owner_id: parseInt(addLeadForm.currentOwnerId),
        notes: addLeadForm.notes
      });

      setAddLeadModal({ isOpen: false });

      // Find current user in staff list to set as default owner for next form
      let defaultOwnerId = '';
      if (currentUser && staffUsers.length > 0) {
        const currentStaffUser = staffUsers.find(staffUser =>
          staffUser.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (currentStaffUser) {
          defaultOwnerId = currentStaffUser.id.toString();
        }
      }

      setAddLeadForm({
        outreachDate: new Date().toISOString().split('T')[0],
        contactName: '',
        companyName: '',
        contactTitle: '',
        contactEmail: '',
        linkedinUrl: '',
        source: '',
        stage: 'Initial Outreach',
        alignedSectors: [],
        currentOwnerId: defaultOwnerId,
        notes: ''
      });

      // Refresh leads list
      const response = await getAllLeads({
        search: searchTerm,
        stage: stageFilter,
        owner: ownerFilter,
        tab: activeTab,
        page: currentPage,
        limit: pageSize
      });
      setLeads(response.leads || []);
      setTotalLeads(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to create lead:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdateSubmit = async () => {
    if (!quickUpdateModal.lead) return;

    try {
      setLoading(true);
      await updateLead(quickUpdateModal.lead.id, {
        stage: updateForm.stage,
        lead_type: updateForm.leadType,
        notes: updateForm.activityNotes,
        next_steps: updateForm.nextSteps,
        updated_at: new Date().toISOString()
      });

      setQuickUpdateModal({ isOpen: false, lead: null });
      setUpdateForm({ stage: '', leadType: '', activityNotes: '', nextSteps: '' });

      // Refresh leads list
      const response = await getAllLeads({
        search: searchTerm,
        stage: stageFilter,
        owner: ownerFilter,
        tab: activeTab,
        page: currentPage,
        limit: pageSize
      });
      setLeads(response.leads || []);
    } catch (err) {
      console.error('Failed to update lead:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailsUpdateSubmit = async () => {
    try {
      setLoading(true);
      await updateLead(viewDetailsModal.lead.id, {
        stage: updateForm.stage,
        lead_type: updateForm.leadType,
        notes: updateForm.activityNotes,
        next_steps: updateForm.nextSteps,
        updated_at: new Date().toISOString()
      });

      setViewDetailsModal(prev => ({ ...prev, showStatusUpdate: false }));
      setUpdateForm({ stage: '', leadType: '', activityNotes: '', nextSteps: '' });

      // Refresh leads list
      const response = await getAllLeads({
        search: searchTerm,
        stage: stageFilter,
        owner: ownerFilter,
        tab: activeTab,
        page: currentPage,
        limit: pageSize
      });
      setLeads(response.leads || []);

      // Also refresh the current lead details if it's still open
      if (viewDetailsModal.lead) {
        const updatedLead = await getLeadById(viewDetailsModal.lead.id);
        setViewDetailsModal(prev => ({
          ...prev,
          lead: updatedLead.lead || viewDetailsModal.lead
        }));
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      setLoading(true);
      await deleteLead(leadToDelete.id);

      // Refresh leads list
      const response = await getAllLeads({
        search: searchTerm,
        stage: stageFilter,
        owner: ownerFilter,
        tab: activeTab,
        page: currentPage,
        limit: pageSize
      });
      setLeads(response.leads || []);
      setTotalLeads(response.totalCount || 0);
    } catch (err) {
      console.error('Failed to delete lead:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
      setLeadToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">All Leads</h2>
        <div className="flex space-x-3">
          <Button onClick={handleAddLead} className="bg-pursuit-purple hover:bg-pursuit-purple/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Lead
          </Button>
          <Button onClick={handleDownloadCSV} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, company, sector, source tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <CalendarDays className="w-4 h-4 mr-2" />
          Date Filter
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
          className="rounded-full"
        >
          All Leads
        </Button>
        <Button
          variant={activeTab === 'newest' ? 'default' : 'outline'}
          onClick={() => setActiveTab('newest')}
          className="rounded-full"
        >
          Newest
        </Button>
        <Button
          variant={activeTab === 'oldest' ? 'default' : 'outline'}
          onClick={() => setActiveTab('oldest')}
          className="rounded-full"
        >
          Oldest
        </Button>
        <Button
          variant={activeTab === 'my-leads' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my-leads')}
          className="rounded-full"
        >
          My Leads
        </Button>
      </div>

      {/* Stage and Owner Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-stages">All Stages</SelectItem>
            <SelectItem value="initial-outreach">Initial Outreach</SelectItem>
            <SelectItem value="active-lead">Active Lead</SelectItem>
            <SelectItem value="follow-up">Follow Up</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="not-interested">Not Interested</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-owners">All Owners</SelectItem>
            {staffUsers.map((staff) => (
              <SelectItem key={staff.id} value={staff.name.toLowerCase().replace(' ', '-')}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 flex items-center">
          Showing {totalLeads} leads
          {totalLeads > pageSize && (
            <span className="ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      </div>

      {/* Leads List */}
      <div className="relative min-h-[200px]">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg transition-all duration-300 ease-in-out">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pursuit-purple"></div>
              <p className="text-sm text-gray-600">Loading leads...</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`transition-all duration-300 ease-in-out ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {leads.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found.</p>
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  Error: {error}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead, index) => (
                <Card
                  key={lead.id}
                  className="hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6">
                    {/* Header Row - Name and Buttons */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <Badge className={getStatusBadgeColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                        {lead.network && (
                          <span className="text-sm text-gray-500">{lead.network}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(lead)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                          onClick={() => handleQuickUpdate(lead)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Quick Update
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setLeadToDelete(lead)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the lead "{leadToDelete?.name}" from {leadToDelete?.company}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmDeleteLead}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Lead Info */}
                    <div className="space-y-2">
                      <p className="text-gray-600 font-medium">{lead.company}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Status:</span> {lead.stage}
                        </div>
                        <div>
                          <span className="font-medium">Last Contact:</span> {lead.lastContact}
                        </div>
                        <div>
                          <span className="font-medium">Sectors:</span>
                          {lead.sectors.length > 0 ? (
                            <span className="ml-1">
                              {lead.sectors.map((sector) => (
                                <Badge key={sector} variant="secondary" className="ml-1 text-xs">
                                  {sector}
                                </Badge>
                              ))}
                            </span>
                          ) : (
                            <span className="ml-1 text-gray-400">None</span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Current Owner:</span>
                        <span className="ml-2 text-gray-600">{lead.currentOwner}</span>
                      </div>
                    </div>

                    {/* Latest Activity - Full Width */}
                    {lead.latestActivity && (
                      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                        <span className="font-medium text-blue-800">Latest Activity: </span>
                        {lead.latestActivity.type === 'stage_change' ? (
                          <span className="text-gray-700">
                            📊 Stage: {lead.latestActivity.oldStage} → {lead.latestActivity.newStage} Followed up on {lead.latestActivity.date}
                          </span>
                        ) : (
                          <span className="text-gray-700">{lead.latestActivity.content}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <span className="px-3 py-1 text-sm border rounded">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.isOpen} onOpenChange={(open) => setViewDetailsModal({ isOpen: open, lead: null, isEditing: false, showStatusUpdate: false })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewDetailsModal.lead?.name}</h2>
                <p className="text-lg text-gray-600 mt-1">{viewDetailsModal.lead?.company}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={viewDetailsModal.isEditing ? handleCancelEdit : handleStartEdit}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {viewDetailsModal.isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {viewDetailsModal.lead && (
            <div className="space-y-4">
              {/* Contact Information Card */}
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Name</label>
                        {viewDetailsModal.isEditing ? (
                          <Input
                            value={editForm.contactName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, contactName: e.target.value }))}
                            className="mt-1 h-8"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900 mt-1">{viewDetailsModal.lead.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                        {viewDetailsModal.isEditing ? (
                          <Input
                            type="email"
                            value={editForm.contactEmail}
                            onChange={(e) => setEditForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                            className="mt-1 h-8"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">{viewDetailsModal.lead.email || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</label>
                        {viewDetailsModal.isEditing ? (
                          <Input
                            value={editForm.companyName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                            className="mt-1 h-8"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900 mt-1">{viewDetailsModal.lead.company}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LinkedIn</label>
                        {viewDetailsModal.isEditing ? (
                          <Input
                            value={editForm.linkedinUrl}
                            onChange={(e) => setEditForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                            placeholder="https://linkedin.com/in/username"
                            className="mt-1 h-8"
                          />
                        ) : (
                          viewDetailsModal.lead.linkedinUrl ? (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => window.open(viewDetailsModal.lead.linkedinUrl, '_blank')}
                              className="h-6 p-0 text-blue-600 hover:text-blue-800 mt-1"
                            >
                              View Profile
                            </Button>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">N/A</p>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage and Additional Fields */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</label>
                        {viewDetailsModal.isEditing ? (
                          <Select
                            value={editForm.stage}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, stage: value }))}
                          >
                            <SelectTrigger className="mt-1 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                              <SelectItem value="Active Lead">Active Lead</SelectItem>
                              <SelectItem value="Follow Up">Follow Up</SelectItem>
                              <SelectItem value="Qualified">Qualified</SelectItem>
                              <SelectItem value="Not Interested">Not Interested</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`mt-1 text-xs ${
                            viewDetailsModal.lead.stage?.toLowerCase() === 'active lead'
                              ? 'bg-green-100 text-green-800'
                              : viewDetailsModal.lead.stage?.toLowerCase() === 'qualified'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {viewDetailsModal.lead.stage}
                          </Badge>
                        )}
                      </div>
                      {viewDetailsModal.isEditing && (
                        <>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</label>
                            <Input
                              value={editForm.contactTitle}
                              onChange={(e) => setEditForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                              placeholder="e.g., Senior Software Engineer"
                              className="mt-1 h-8"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                            <Input
                              value={editForm.contactPhone}
                              onChange={(e) => setEditForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                              placeholder="e.g., (555) 123-4567"
                              className="mt-1 h-8"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {viewDetailsModal.lead.notes && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                  {viewDetailsModal.isEditing ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes about this lead..."
                      rows={3}
                      className="mt-2"
                    />
                  ) : (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700 leading-relaxed">{viewDetailsModal.lead.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Save/Cancel buttons when editing */}
              {viewDetailsModal.isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 px-4"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {/* Update Lead Status Section */}
              <div className="border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Update Status</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewDetailsModal(prev => ({ ...prev, showStatusUpdate: !prev.showStatusUpdate }))}
                      className="h-7 text-xs"
                    >
                      {viewDetailsModal.showStatusUpdate ? 'Cancel' : 'Update'}
                    </Button>
                  </div>
                </div>

                {/* Status Update Form */}
                {viewDetailsModal.showStatusUpdate && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Date</label>
                        <Input
                          type="date"
                          value={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setUpdateForm(prev => ({ ...prev, updateDate: e.target.value }))}
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage *</label>
                        <Select
                          value={updateForm.stage}
                          onValueChange={(value) => setUpdateForm(prev => ({ ...prev, stage: value }))}
                        >
                          <SelectTrigger className="mt-1 h-8">
                            <SelectValue placeholder="Select stage..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                            <SelectItem value="Active Lead">Active Lead</SelectItem>
                            <SelectItem value="Follow Up">Follow Up</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Not Interested">Not Interested</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead Type</label>
                      <Select
                        value={updateForm.leadType || ''}
                        onValueChange={(value) => setUpdateForm(prev => ({ ...prev, leadType: value }))}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue placeholder="Select lead type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Connected to PBC">Connected to PBC</SelectItem>
                          <SelectItem value="Someone responded positively">Someone responded positively</SelectItem>
                          <SelectItem value="Setting up meeting">Setting up meeting</SelectItem>
                          <SelectItem value="Multiple meetings">Multiple meetings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity Notes *</label>
                      <Textarea
                        placeholder="What happened? Record details about the conversation, meeting, or outreach..."
                        value={updateForm.activityNotes}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, activityNotes: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Next Steps</label>
                      <Textarea
                        placeholder="e.g., Follow up next week, Send resources, Schedule demo"
                        value={updateForm.nextSteps}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewDetailsModal(prev => ({ ...prev, showStatusUpdate: false }));
                          setUpdateForm({ stage: '', activityNotes: '', nextSteps: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleViewDetailsUpdateSubmit}
                        disabled={!updateForm.stage || !updateForm.activityNotes}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Update Lead
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Update History */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update History</label>
                <div className="mt-2 space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(viewDetailsModal.lead.createdAt || new Date()).toLocaleDateString('en-US')}
                      </span>
                      <span className="text-xs text-gray-500">Initial outreach</span>
                    </div>
                    {viewDetailsModal.lead.notes && (
                      <p className="text-sm text-gray-600 mt-1">{viewDetailsModal.lead.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Aligned Sectors */}
              {viewDetailsModal.lead.sectors && viewDetailsModal.lead.sectors.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aligned Sectors</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewDetailsModal.lead.sectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Update Modal */}
      <Dialog open={quickUpdateModal.isOpen} onOpenChange={(open) => !open && setQuickUpdateModal({ isOpen: false, lead: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Update: {quickUpdateModal.lead?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stage Selection */}
            <div>
              <Label htmlFor="quick-stage">Stage</Label>
              <Select
                value={updateForm.stage}
                onValueChange={(value) => setUpdateForm(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                  <SelectItem value="Active Lead">Active Lead</SelectItem>
                  <SelectItem value="Follow Up">Follow Up</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lead Type */}
            <div>
              <Label htmlFor="quick-lead-type">Lead Type</Label>
              <Select
                value={updateForm.leadType || ''}
                onValueChange={(value) => setUpdateForm(prev => ({ ...prev, leadType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Connected to PBC">Connected to PBC</SelectItem>
                  <SelectItem value="Someone responded positively">Someone responded positively</SelectItem>
                  <SelectItem value="Setting up meeting">Setting up meeting</SelectItem>
                  <SelectItem value="Multiple meetings">Multiple meetings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Notes */}
            <div>
              <Label htmlFor="quick-notes">Activity Notes</Label>
              <Textarea
                id="quick-notes"
                value={updateForm.activityNotes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, activityNotes: e.target.value }))}
                placeholder="What happened in this interaction?"
                rows={3}
              />
            </div>

            {/* Next Steps */}
            <div>
              <Label htmlFor="quick-next-steps">Next Steps</Label>
              <Textarea
                id="quick-next-steps"
                value={updateForm.nextSteps}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                placeholder="What are the next steps?"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuickUpdateModal({ isOpen: false, lead: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickUpdateSubmit}
              disabled={!updateForm.stage || !updateForm.activityNotes}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Lead Modal */}
      <Dialog open={addLeadModal.isOpen} onOpenChange={(open) => setAddLeadModal({ isOpen: open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="outreach-date">Date *</Label>
                <Input
                  id="outreach-date"
                  type="date"
                  value={addLeadForm.outreachDate}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, outreachDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contact-name">Contact Name</Label>
                <Input
                  id="contact-name"
                  value={addLeadForm.contactName}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="e.g., John Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Company *</Label>
                <Input
                  id="company-name"
                  value={addLeadForm.companyName}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g., Google Inc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-title">Role/Title</Label>
                <Input
                  id="contact-title"
                  value={addLeadForm.contactTitle}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={addLeadForm.contactEmail}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="e.g., john@company.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                <Input
                  id="linkedin-url"
                  value={addLeadForm.linkedinUrl}
                  onChange={(e) => setAddLeadForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>
            </div>

            {/* Source and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Select
                  value={addLeadForm.source}
                  onValueChange={(value) => setAddLeadForm(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Indeed or Job Board">Indeed or Job Board</SelectItem>
                    <SelectItem value="Employee Referral">Employee Referral</SelectItem>
                    <SelectItem value="Personal Network">Personal Network</SelectItem>
                    <SelectItem value="Alumni Network">Alumni Network</SelectItem>
                    <SelectItem value="Professional Network">Professional Network</SelectItem>
                    <SelectItem value="Events & Conferences">Events & Conferences</SelectItem>
                    <SelectItem value="Previous Employer">Previous Employer</SelectItem>
                    <SelectItem value="Recruitment Agency">Recruitment Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stage">Initial Status</Label>
                <Select
                  value={addLeadForm.stage}
                  onValueChange={(value) => setAddLeadForm(prev => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                    <SelectItem value="Active Lead">Active Lead</SelectItem>
                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                    <SelectItem value="Close Won">Close Won</SelectItem>
                    <SelectItem value="Close Loss">Close Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Owner */}
            <div>
              <Label htmlFor="current-owner">Current Owner *</Label>
              <Select
                value={addLeadForm.currentOwnerId}
                onValueChange={(value) => setAddLeadForm(prev => ({ ...prev, currentOwnerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  {staffUsers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes/Comments</Label>
              <Textarea
                id="notes"
                value={addLeadForm.notes}
                onChange={(e) => setAddLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or comments..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddLeadModal({ isOpen: false })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLeadSubmit}
                disabled={!addLeadForm.companyName || !addLeadForm.currentOwnerId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AllLeads;