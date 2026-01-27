import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../components/ui/table';
import { Pencil, Trash2, Plus, Users, Search, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function EnrollmentsTab({ token, setLoading }) {
  const [allEnrollments, setAllEnrollments] = useState([]); // Store all enrollments
  const [cohorts, setCohorts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    cohort_id: '',
    enrolled_date: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    is_active: true,
    completion_date: '',
    withdrawal_date: '',
    withdrawal_reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchEnrollments();
    fetchCohorts();
  }, []); // Only fetch on mount

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL enrollments without any filters
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/enrollments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      
      // Check for specific error codes
      if (error.response?.data?.code === 'TABLE_NOT_EXISTS' || error.response?.data?.code === 'SCHEMA_MISMATCH') {
        Swal.fire({
          icon: 'warning',
          title: 'Enrollment System Not Available',
          html: `
            <p>${error.response.data.error}</p>
            <br/>
            <p class="text-sm text-gray-600">
              The enrollment management system requires database migration 050 to be run.
              Please contact your system administrator.
            </p>
          `,
          confirmButtonColor: '#4242EA'
        });
        setAllEnrollments([]);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'Failed to fetch enrollments',
          confirmButtonColor: '#4242EA'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      // Get unique cohorts from the enrollments we already have
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/cohorts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCohorts(response.data.cohorts || []);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const handleCreate = () => {
    setEditingEnrollment(null);
    setFormData({
      user_id: '',
      cohort_id: '',
      enrolled_date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      is_active: true,
      completion_date: '',
      withdrawal_date: '',
      withdrawal_reason: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setFormData({
      user_id: enrollment.user_id,
      cohort_id: enrollment.cohort_id,
      enrolled_date: enrollment.enrolled_date ? new Date(enrollment.enrolled_date).toISOString().split('T')[0] : '',
      status: enrollment.status || 'in_progress',
      is_active: enrollment.is_active !== false,
      completion_date: enrollment.completion_date ? new Date(enrollment.completion_date).toISOString().split('T')[0] : '',
      withdrawal_date: enrollment.withdrawal_date ? new Date(enrollment.withdrawal_date).toISOString().split('T')[0] : '',
      withdrawal_reason: enrollment.withdrawal_reason || '',
      notes: enrollment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (enrollment) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete enrollment for ${enrollment.user_email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.delete(
        `${API_URL}/api/admin/organization-management/enrollments/${enrollment.enrollment_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Deleted!', 'Enrollment deleted successfully', 'success');
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to delete enrollment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.cohort_id) {
      Swal.fire('Error', 'User ID and Cohort are required', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        cohort_id: parseInt(formData.cohort_id),
        completion_date: formData.completion_date || null,
        withdrawal_date: formData.withdrawal_date || null
      };
      
      if (editingEnrollment) {
        // Update
        await axios.put(
          `${API_URL}/api/admin/organization-management/enrollments/${editingEnrollment.enrollment_id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Enrollment updated successfully', 'success');
      } else {
        // Create
        await axios.post(
          `${API_URL}/api/admin/organization-management/enrollments`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Enrollment created successfully', 'success');
      }
      
      setIsDialogOpen(false);
      fetchEnrollments();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to save enrollment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Use the filtered enrollments for export
      const params = new URLSearchParams();
      if (cohortFilter !== 'all') params.append('cohort_id', cohortFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (activeFilter !== 'all') params.append('is_active', activeFilter);
      
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/enrollments/export?${params}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enrollments_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      Swal.fire('Success', 'Enrollments exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting enrollments:', error);
      Swal.fire('Error', 'Failed to export enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = allEnrollments.filter(enrollment => {
    // Apply search filter
    const matchesSearch = enrollment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.cohort_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply cohort filter
    if (cohortFilter !== 'all' && enrollment.cohort_id?.toString() !== cohortFilter) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && enrollment.status !== statusFilter) {
      return false;
    }
    
    // Apply active filter
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'true';
      if (enrollment.is_active !== isActive) {
        return false;
      }
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'in_progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
      'withdrawn': { label: 'Withdrawn', color: 'bg-red-100 text-red-800' },
      'deferred': { label: 'Deferred', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const badge = badges[status] || badges.in_progress;
    return (
      <Badge className={`${badge.color} hover:${badge.color} font-proxima`}>
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-bold text-slate-900 font-proxima">Enrollments</h2>
          <Badge variant="secondary" className="font-proxima">
            {filteredEnrollments.length} total
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExport}
            variant="outline"
            className="font-proxima"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleCreate}
            className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Enrollment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="col-span-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-proxima"
          />
        </div>
        
        <Select value={cohortFilter} onValueChange={setCohortFilter}>
          <SelectTrigger className="font-proxima">
            <SelectValue placeholder="All Cohorts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Cohorts</SelectItem>
            {cohorts.map(cohort => (
              <SelectItem key={cohort.cohort_id} value={cohort.cohort_id.toString()} className="font-proxima">
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="font-proxima">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Statuses</SelectItem>
            <SelectItem value="in_progress" className="font-proxima">In Progress</SelectItem>
            <SelectItem value="completed" className="font-proxima">Completed</SelectItem>
            <SelectItem value="withdrawn" className="font-proxima">Withdrawn</SelectItem>
            <SelectItem value="deferred" className="font-proxima">Deferred</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="font-proxima">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All</SelectItem>
            <SelectItem value="true" className="font-proxima">Active Only</SelectItem>
            <SelectItem value="false" className="font-proxima">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-proxima font-semibold">User</TableHead>
              <TableHead className="font-proxima font-semibold">Cohort</TableHead>
              <TableHead className="font-proxima font-semibold">Organization</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Status</TableHead>
              <TableHead className="font-proxima font-semibold">Enrolled</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Active</TableHead>
              <TableHead className="font-proxima font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500 font-proxima">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollment_id} className="hover:bg-slate-50">
                  <TableCell className="font-proxima">
                    <div>
                      <div className="font-medium">{enrollment.first_name} {enrollment.last_name}</div>
                      <div className="text-xs text-slate-500">{enrollment.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-proxima">{enrollment.cohort_name}</TableCell>
                  <TableCell className="font-proxima text-sm">
                    {enrollment.organization_name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(enrollment.status)}</TableCell>
                  <TableCell className="font-proxima text-sm text-slate-600">
                    {enrollment.enrolled_date ? new Date(enrollment.enrolled_date).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {enrollment.is_active ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-proxima">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 font-proxima">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(enrollment)}
                        className="hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enrollment)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-proxima text-xl">
              {editingEnrollment ? 'Edit Enrollment' : 'Create Enrollment'}
            </DialogTitle>
            <DialogDescription className="font-proxima">
              {editingEnrollment 
                ? 'Update enrollment details below' 
                : 'Fill in the details to create a new enrollment'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_id" className="font-proxima">
                    User ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="user_id"
                    type="number"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="Enter user ID"
                    required
                    disabled={!!editingEnrollment}
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cohort_id" className="font-proxima">
                    Cohort <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.cohort_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, cohort_id: value })}
                    disabled={!!editingEnrollment}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue placeholder="Select cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map(cohort => (
                        <SelectItem key={cohort.cohort_id} value={cohort.cohort_id.toString()} className="font-proxima">
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="enrolled_date" className="font-proxima">Enrolled Date</Label>
                  <Input
                    id="enrolled_date"
                    type="date"
                    value={formData.enrolled_date}
                    onChange={(e) => setFormData({ ...formData, enrolled_date: e.target.value })}
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status" className="font-proxima">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress" className="font-proxima">In Progress</SelectItem>
                      <SelectItem value="completed" className="font-proxima">Completed</SelectItem>
                      <SelectItem value="withdrawn" className="font-proxima">Withdrawn</SelectItem>
                      <SelectItem value="deferred" className="font-proxima">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.status === 'completed' && (
                <div>
                  <Label htmlFor="completion_date" className="font-proxima">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                    className="font-proxima"
                  />
                </div>
              )}

              {formData.status === 'withdrawn' && (
                <>
                  <div>
                    <Label htmlFor="withdrawal_date" className="font-proxima">Withdrawal Date</Label>
                    <Input
                      id="withdrawal_date"
                      type="date"
                      value={formData.withdrawal_date}
                      onChange={(e) => setFormData({ ...formData, withdrawal_date: e.target.value })}
                      className="font-proxima"
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdrawal_reason" className="font-proxima">Withdrawal Reason</Label>
                    <Textarea
                      id="withdrawal_reason"
                      value={formData.withdrawal_reason}
                      onChange={(e) => setFormData({ ...formData, withdrawal_reason: e.target.value })}
                      placeholder="Reason for withdrawal..."
                      rows={2}
                      className="font-proxima"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="notes" className="font-proxima">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="font-proxima"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-[#4242EA] rounded"
                />
                <Label htmlFor="is_active" className="font-proxima cursor-pointer">
                  Active enrollment (user's current active program)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
              >
                {editingEnrollment ? 'Update' : 'Create'} Enrollment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnrollmentsTab;

