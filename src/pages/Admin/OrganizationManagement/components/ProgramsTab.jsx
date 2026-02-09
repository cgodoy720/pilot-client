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
import { Pencil, Trash2, Plus, GraduationCap, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function ProgramsTab({ token, setLoading }) {
  const [programs, setPrograms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    organization_id: '',
    name: '',
    slug: '',
    description: '',
    program_type: 'builder',
    active: true
  });

  useEffect(() => {
    fetchPrograms();
    fetchOrganizations();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/programs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrograms(response.data.programs || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      Swal.fire('Error', 'Failed to fetch programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/organizations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleCreate = () => {
    setEditingProgram(null);
    setFormData({
      organization_id: '',
      name: '',
      slug: '',
      description: '',
      program_type: 'builder',
      active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      organization_id: program.organization_id,
      name: program.name || '',
      slug: program.slug || '',
      description: program.description || '',
      program_type: program.program_type || 'builder',
      active: program.active !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (program) => {
    const courseCount = parseInt(program.course_count) || 0;
    
    if (courseCount > 0) {
      const result = await Swal.fire({
        title: 'Program has courses',
        html: `This program has <strong>${courseCount} course(s)</strong>.<br/>Do you want to delete it anyway? This will also delete all related courses and cohort links.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete everything',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;
    } else {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete program "${program.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${API_URL}/api/admin/organization-management/programs/${program.program_id}?cascade=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Deleted!', 'Program deleted successfully', 'success');
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to delete program', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organization_id) {
      Swal.fire('Error', 'Please select an organization', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingProgram) {
        // Update
        await axios.put(
          `${API_URL}/api/admin/organization-management/programs/${editingProgram.program_id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Program updated successfully', 'success');
      } else {
        // Create
        await axios.post(
          `${API_URL}/api/admin/organization-management/programs`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Program created successfully', 'success');
      }
      
      setIsDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to save program', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrg = orgFilter === 'all' || program.organization_id === parseInt(orgFilter);
    
    return matchesSearch && matchesOrg;
  });

  const getProgramTypeBadge = (type) => {
    const badges = {
      builder: { label: 'Builder', color: 'bg-blue-100 text-blue-800' },
      workshop: { label: 'Workshop', color: 'bg-purple-100 text-purple-800' },
      external: { label: 'External', color: 'bg-orange-100 text-orange-800' },
      enterprise: { label: 'Enterprise', color: 'bg-pink-100 text-pink-800' }
    };
    
    const badge = badges[type] || badges.builder;
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
          <GraduationCap className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-bold text-slate-900 font-proxima">Programs</h2>
          <Badge variant="secondary" className="font-proxima">
            {filteredPrograms.length} total
          </Badge>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-proxima"
          />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-[250px] font-proxima">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Organizations</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.organization_id} value={org.organization_id.toString()} className="font-proxima">
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-proxima font-semibold">Name</TableHead>
              <TableHead className="font-proxima font-semibold">Organization</TableHead>
              <TableHead className="font-proxima font-semibold">Type</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Courses</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Students</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Status</TableHead>
              <TableHead className="font-proxima font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500 font-proxima">
                  No programs found
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.program_id} className="hover:bg-slate-50">
                  <TableCell className="font-medium font-proxima">
                    <div>
                      <div>{program.name}</div>
                      {program.slug && (
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                          {program.slug}
                        </code>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-proxima">{program.organization_name}</TableCell>
                  <TableCell>{getProgramTypeBadge(program.program_type)}</TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{program.course_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{program.student_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {program.active !== false ? (
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
                        onClick={() => handleEdit(program)}
                        className="hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-proxima text-xl">
              {editingProgram ? 'Edit Program' : 'Create Program'}
            </DialogTitle>
            <DialogDescription className="font-proxima">
              {editingProgram 
                ? 'Update program details below' 
                : 'Fill in the details to create a new program'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="organization_id" className="font-proxima">
                  Organization <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.organization_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, organization_id: parseInt(value) })}
                  disabled={!!editingProgram}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.organization_id} value={org.organization_id.toString()} className="font-proxima">
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingProgram && (
                  <p className="text-xs text-slate-500 mt-1 font-proxima">
                    Organization cannot be changed after creation
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="font-proxima">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AI-Native Builder Program"
                    required
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="program_type" className="font-proxima">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.program_type}
                    onValueChange={(value) => setFormData({ ...formData, program_type: value })}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="builder" className="font-proxima">Builder</SelectItem>
                      <SelectItem value="workshop" className="font-proxima">Workshop</SelectItem>
                      <SelectItem value="external" className="font-proxima">External</SelectItem>
                      <SelectItem value="enterprise" className="font-proxima">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="slug" className="font-proxima">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., ai-native-builder (auto-generated if empty)"
                  className="font-proxima"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-proxima">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Program description..."
                  rows={3}
                  className="font-proxima"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-[#4242EA] rounded"
                />
                <Label htmlFor="active" className="font-proxima cursor-pointer">
                  Active (program is accepting new enrollments)
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
                {editingProgram ? 'Update' : 'Create'} Program
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProgramsTab;

