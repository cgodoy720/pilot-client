import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import Swal from 'sweetalert2';

const CohortsTab = () => {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    cohort_type: 'builder'
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch cohorts on mount
  useEffect(() => {
    fetchCohorts();
  }, [filterType]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const typeParam = filterType !== 'all' ? `?type=${filterType}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/internal/list${typeParam}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  const openCreateModal = () => {
    setEditingCohort(null);
    setFormData({
      name: '',
      start_date: '',
      cohort_type: 'builder'
    });
    setModalOpen(true);
  };

  const openEditModal = (cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      start_date: cohort.start_date ? cohort.start_date.split('T')[0] : '',
      cohort_type: cohort.cohort_type
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCohort
        ? `${import.meta.env.VITE_API_URL}/api/external-cohorts/internal/${editingCohort.cohort_id}`
        : `${import.meta.env.VITE_API_URL}/api/external-cohorts/internal`;

      const response = await fetch(url, {
        method: editingCohort ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: editingCohort ? 'Cohort Updated' : 'Cohort Created',
          text: `Successfully ${editingCohort ? 'updated' : 'created'} cohort "${formData.name}"`,
          timer: 2000,
          showConfirmButton: false
        });
        setModalOpen(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCohortTypeBadge = (type) => {
    switch (type) {
      case 'builder':
        return <Badge className="bg-blue-100 text-blue-700">Builder</Badge>;
      case 'workshop':
        return <Badge className="bg-purple-100 text-purple-700">Workshop</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-proxima">Loading cohorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border border-[#C8C8C8]">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
              Internal Cohorts Management
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px] font-proxima">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="builder">Builder</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={openCreateModal}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                + Create Cohort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 font-proxima">
            Manage builder and workshop cohorts. For external B2B cohorts, use the{' '}
            <a href="/external-cohorts" className="text-[#4242ea] hover:underline">
              External Cohorts Dashboard
            </a>.
          </p>
        </CardContent>
      </Card>

      {/* Cohorts Table */}
      {cohorts.length > 0 ? (
        <Card className="bg-white border border-[#C8C8C8]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-proxima-bold">Name</TableHead>
                  <TableHead className="font-proxima-bold">Type</TableHead>
                  <TableHead className="font-proxima-bold">Start Date</TableHead>
                  <TableHead className="font-proxima-bold text-center">Curriculum Days</TableHead>
                  <TableHead className="font-proxima-bold text-center">Users</TableHead>
                  <TableHead className="font-proxima-bold text-center">Status</TableHead>
                  <TableHead className="font-proxima-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((cohort) => (
                  <TableRow key={cohort.cohort_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium font-proxima">
                      {cohort.name}
                    </TableCell>
                    <TableCell>
                      {getCohortTypeBadge(cohort.cohort_type)}
                    </TableCell>
                    <TableCell className="font-proxima">
                      {formatDate(cohort.start_date)}
                    </TableCell>
                    <TableCell className="text-center font-proxima">
                      {cohort.curriculum_days_count || 0}
                    </TableCell>
                    <TableCell className="text-center font-proxima">
                      {cohort.user_count || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {cohort.is_active !== false ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(cohort)}
                        className="font-proxima"
                      >
                        Edit
                      </Button>
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
            <p className="text-gray-500 font-proxima mb-4">No cohorts found</p>
            <Button
              onClick={openCreateModal}
              className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
            >
              Create Your First Cohort
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md font-proxima">
          <DialogHeader>
            <DialogTitle className="font-proxima-bold">
              {editingCohort ? 'Edit Cohort' : 'Create Cohort'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-proxima-bold">Cohort Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., December 2025"
                required
                className="font-proxima"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-proxima-bold">Cohort Type</Label>
              <Select
                value={formData.cohort_type}
                onValueChange={(value) => setFormData({ ...formData, cohort_type: value })}
                disabled={!!editingCohort}
              >
                <SelectTrigger className="font-proxima">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="builder">Builder (Regular Program)</SelectItem>
                  <SelectItem value="workshop">Workshop (Admissions)</SelectItem>
                </SelectContent>
              </Select>
              {editingCohort && (
                <p className="text-xs text-gray-500">Cohort type cannot be changed after creation</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-proxima-bold">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="font-proxima"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                {submitting ? 'Saving...' : editingCohort ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CohortsTab;

