import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, Download, MoreHorizontal, Eye, ExternalLink, Trash2, Search, Calendar, Filter, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
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
import {
  getAllJobPostings,
  getJobPostingById,
  updateJobPosting,
  exportJobPostingsCSV,
  deleteJobPosting,
  handleApiError,
  downloadFile
} from '../../../services/salesTrackerApi';
import AddJobPostingModal from './AddJobPostingModal';

const JobPostings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete confirmation state
  const [jobToDelete, setJobToDelete] = useState(null);

  // View Details Modal state
  const [viewDetailsModal, setViewDetailsModal] = useState({ isOpen: false, job: null, isEditing: false });

  // Edit form state
  const [editForm, setEditForm] = useState({
    notes: '',
    sectors: [],
    salary: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const fetchJobPostings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getAllJobPostings({
          search: searchTerm,
          sort: sortBy,
          page: currentPage,
          limit: pageSize
        });
        
        setJobPostings(response.jobPostings || []);
        setTotalJobs(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch job postings:', err);
        setError(handleApiError(err));
        
        // Fallback to mock data on error
        const mockJobPostings = [
          {
            id: 1,
            title: 'Junior AI Builder / Vibe Coder',
            company: 'Senpilot',
            level: 'Entry-Level',
            posted: 'Today',
            owner: 'Carlos Godoy',
            salary: '$100,000 - $130,000',
            sectors: ['Software Engineer'],
            status: 'Not Shared'
          },
          {
            id: 2,
            title: 'Project Employee, Strategic Initiatives',
            company: 'NBA',
            level: 'Entry-Level',
            posted: '3 Days Ago',
            owner: 'Victoria Mayo',
            salary: '$32/Hr',
            sectors: ['Finance'],
            status: 'Not Shared'
          },
          {
            id: 3,
            title: 'Associate, Strategy & Operations',
            company: 'Filevine',
            level: 'Entry-Level',
            posted: '1 Week Ago',
            owner: 'Laziah Bernstine',
            sectors: [],
            status: 'Not Shared'
          }
        ];
        setJobPostings(mockJobPostings);
      } finally {
        setLoading(false);
      }
    };

    // Reset page when filters change
    if (currentPage === 1) {
      const searchTimer = setTimeout(fetchJobPostings, 300);
      return () => clearTimeout(searchTimer);
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm, sortBy, currentPage, pageSize]);

  const filteredJobPostings = jobPostings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddJobPosting = () => {
    setIsAddModalOpen(true);
  };

  const handleJobPostingCreated = async () => {
    // Refresh the job postings list
    setLoading(true);
    try {
      const response = await getAllJobPostings({
        search: searchTerm,
        sort: sortBy,
        page: currentPage,
        limit: pageSize
      });

      setJobPostings(response.jobPostings || []);
      setTotalJobs(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to refresh job postings:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setLoading(true);
      const blob = await exportJobPostingsCSV({ search: searchTerm, sort: sortBy });
      downloadFile(blob, `job-postings-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Failed to export job postings:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkActions = () => {
    console.log('Bulk actions clicked');
  };

  const handleViewDetails = async (job) => {
    try {
      const fullJob = await getJobPostingById(job.id);
      const jobData = fullJob.jobPosting || job;
      setViewDetailsModal({ isOpen: true, job: jobData, isEditing: false });

      // Initialize edit form with current data
      setEditForm({
        notes: jobData.notes || '',
        sectors: jobData.sectors || [],
        salary: jobData.salary || ''
      });
    } catch (err) {
      console.error('Failed to fetch job posting details:', err);
      setViewDetailsModal({ isOpen: true, job, isEditing: false });
      setEditForm({
        notes: job.notes || '',
        sectors: job.sectors || [],
        salary: job.salary || ''
      });
    }
  };

  const handleToggleShared = async () => {
    if (!viewDetailsModal.job) return;

    try {
      const currentStatus = viewDetailsModal.job.status;
      const newSharedStatus = currentStatus === 'Shared' ? false : true;
      const updateData = {
        is_shared: newSharedStatus,
        shared_date: newSharedStatus ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      };

      await updateJobPosting(viewDetailsModal.job.id, updateData);

      // Update the modal state to reflect the change
      setViewDetailsModal(prev => ({
        ...prev,
        job: {
          ...prev.job,
          status: newSharedStatus ? 'Shared' : 'Not Shared',
          is_shared: newSharedStatus,
          shared_date: newSharedStatus ? new Date().toISOString().split('T')[0] : null
        }
      }));

      // Refresh the job postings list to reflect the change
      const response = await getAllJobPostings({
        search: searchTerm,
        sort: sortBy,
        page: currentPage,
        limit: pageSize
      });
      setJobPostings(response.jobPostings || []);
    } catch (err) {
      console.error('Failed to toggle shared status:', err);
      setError(handleApiError(err));
    }
  };

  const handleStartEdit = () => {
    setViewDetailsModal(prev => ({ ...prev, isEditing: true }));
  };

  const handleCancelEdit = () => {
    setViewDetailsModal(prev => ({ ...prev, isEditing: false }));
    // Reset form to original values
    const jobData = viewDetailsModal.job;
    setEditForm({
      notes: jobData.notes || '',
      sectors: jobData.sectors || [],
      salary: jobData.salary || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      await updateJobPosting(viewDetailsModal.job.id, {
        notes: editForm.notes,
        aligned_sectors: editForm.sectors,
        salary_range: editForm.salary,
        updated_at: new Date().toISOString()
      });

      setViewDetailsModal(prev => ({
        ...prev,
        isEditing: false,
        job: {
          ...prev.job,
          notes: editForm.notes
        }
      }));

      // Refresh the job postings list
      const response = await getAllJobPostings({
        search: searchTerm,
        sort: sortBy,
        page: currentPage,
        limit: pageSize
      });
      setJobPostings(response.jobPostings || []);
    } catch (err) {
      console.error('Failed to update job posting:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJob = (job) => {
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank');
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      setLoading(true);
      await deleteJobPosting(jobToDelete.id);

      // Refresh job postings list
      const response = await getAllJobPostings({
        search: searchTerm,
        sort: sortBy,
        page: currentPage,
        limit: pageSize
      });
      setJobPostings(response.jobPostings || []);
      setTotalJobs(response.totalCount || 0);
    } catch (err) {
      console.error('Failed to delete job posting:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
      setJobToDelete(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'shared':
        return 'bg-green-100 text-green-800';
      case 'not shared':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
        <div className="flex space-x-3">
          <Button onClick={handleAddJobPosting} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Job Posting
          </Button>
          <Button onClick={handleDownloadCSV} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={handleBulkActions} variant="outline" className="bg-purple-600 text-white hover:bg-purple-700">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search job postings, companies, or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="company">Company A-Z</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Date Filter
        </Button>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {totalJobs} jobs
        {totalJobs > pageSize && (
          <span className="ml-2">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      {/* Job Postings Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : jobPostings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No job postings found.</p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              Error: {error}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPostings.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {job.title}
                </CardTitle>
                <p className="text-gray-600 font-medium">{job.company}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Level:</span>
                    <span className="ml-1 font-medium">{job.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Posted:</span>
                    <span className="ml-1 font-medium">{job.posted}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Owner:</span>
                    <span className="ml-1 font-medium">{job.owner}</span>
                  </div>
                </div>

                {/* Salary */}
                {job.salary && (
                  <div>
                    <span className="text-gray-500 text-sm">Salary:</span>
                    <p className="font-semibold text-green-600">{job.salary}</p>
                  </div>
                )}

                {/* Sectors */}
                <div>
                  <span className="text-gray-500 text-sm">Sectors:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {job.sectors.length > 0 ? (
                      job.sectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="text-gray-500 text-sm">Status:</span>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenJob(job)}
                    disabled={!job.jobUrl}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Job
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setJobToDelete(job)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the job posting "{jobToDelete?.title}" at {jobToDelete?.company}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirmDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
            ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} jobs
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

      {/* Add Job Posting Modal */}
      <AddJobPostingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleJobPostingCreated}
      />

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.isOpen} onOpenChange={(open) => setViewDetailsModal({ isOpen: open, job: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{viewDetailsModal.job?.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{viewDetailsModal.job?.company}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={viewDetailsModal.isEditing ? handleCancelEdit : handleStartEdit}
                  className="h-8 text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {viewDetailsModal.isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Shared</span>
                  <Switch
                    checked={viewDetailsModal.job?.status === 'Shared'}
                    onCheckedChange={handleToggleShared}
                  />
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {viewDetailsModal.job && (
            <div className="space-y-4">
              {/* Key Information Card */}
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{viewDetailsModal.job.level || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{viewDetailsModal.job.posted || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{viewDetailsModal.job.owner || 'Unassigned'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salary</label>
                        {viewDetailsModal.isEditing ? (
                          <Input
                            value={editForm.salary}
                            onChange={(e) => setEditForm(prev => ({ ...prev, salary: e.target.value }))}
                            placeholder="e.g., $100,000 - $130,000"
                            className="mt-1 h-8"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            {viewDetailsModal.job.salary || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sectors */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sectors</label>
                {viewDetailsModal.isEditing ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editForm.sectors.map((sector, index) => (
                        <Badge key={index} variant="secondary" className="text-xs pr-1">
                          {sector}
                          <button
                            onClick={() => {
                              const newSectors = editForm.sectors.filter((_, i) => i !== index);
                              setEditForm(prev => ({ ...prev, sectors: newSectors }));
                            }}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a sector (press Enter)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          e.preventDefault();
                          const newSector = e.target.value.trim();
                          if (!editForm.sectors.includes(newSector)) {
                            setEditForm(prev => ({
                              ...prev,
                              sectors: [...prev.sectors, newSector]
                            }));
                          }
                          e.target.value = '';
                        }
                      }}
                      className="h-8"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewDetailsModal.job.sectors && viewDetailsModal.job.sectors.length > 0 ? (
                      viewDetailsModal.job.sectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No sectors specified</span>
                    )}
                  </div>
                )}
              </div>

              {/* Job URL */}
              {viewDetailsModal.job.jobUrl && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Posting</label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(viewDetailsModal.job.jobUrl, '_blank')}
                      className="h-8 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Original Posting
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewDetailsModal.job.location && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                    <p className="text-sm text-gray-900 mt-1">{viewDetailsModal.job.location}</p>
                  </div>
                )}
                {viewDetailsModal.job.jobType && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Type</label>
                    <p className="text-sm text-gray-900 mt-1">{viewDetailsModal.job.jobType}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {viewDetailsModal.job.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{viewDetailsModal.job.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {viewDetailsModal.job.requirements && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requirements</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{viewDetailsModal.job.requirements}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                {viewDetailsModal.isEditing ? (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this job posting..."
                    rows={4}
                    className="mt-2"
                  />
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {viewDetailsModal.job.notes || 'No notes available'}
                    </p>
                  </div>
                )}
              </div>

              {/* Save/Cancel buttons when editing */}
              {viewDetailsModal.isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPostings;