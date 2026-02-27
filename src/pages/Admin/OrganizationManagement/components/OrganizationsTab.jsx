import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
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
import { Pencil, Trash2, Plus, Building2, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function OrganizationsTab({ token, setLoading }) {
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    active: true,
    logo_url: '',
    contact_email: '',
    contact_name: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/organizations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      Swal.fire('Error', 'Failed to fetch organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      active: true,
      logo_url: '',
      contact_email: '',
      contact_name: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || '',
      slug: org.slug || '',
      description: org.description || '',
      active: org.active !== false,
      logo_url: org.logo_url || '',
      contact_email: org.contact_email || '',
      contact_name: org.contact_name || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (org) => {
    const programCount = parseInt(org.program_count) || 0;
    
    if (programCount > 0) {
      const result = await Swal.fire({
        title: 'Organization has programs',
        html: `This organization has <strong>${programCount} program(s)</strong>.<br/>Do you want to delete it anyway? This will also delete all related programs, courses, and cohort links.`,
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
        text: `Delete organization "${org.name}"?`,
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
        `${API_URL}/api/admin/organization-management/organizations/${org.organization_id}?cascade=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Deleted!', 'Organization deleted successfully', 'success');
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to delete organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingOrg) {
        // Update
        await axios.put(
          `${API_URL}/api/admin/organization-management/organizations/${editingOrg.organization_id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Organization updated successfully', 'success');
      } else {
        // Create
        await axios.post(
          `${API_URL}/api/admin/organization-management/organizations`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Organization created successfully', 'success');
      }
      
      setIsDialogOpen(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to save organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-bold text-slate-900 font-proxima">Organizations</h2>
          <Badge variant="secondary" className="font-proxima">
            {filteredOrganizations.length} total
          </Badge>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-proxima"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-proxima font-semibold">Name</TableHead>
              <TableHead className="font-proxima font-semibold">Slug</TableHead>
              <TableHead className="font-proxima font-semibold">Description</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Programs</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Status</TableHead>
              <TableHead className="font-proxima font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-proxima">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((org) => (
                <TableRow key={org.organization_id} className="hover:bg-slate-50">
                  <TableCell className="font-medium font-proxima">{org.name}</TableCell>
                  <TableCell className="font-proxima text-slate-600">
                    <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                      {org.slug || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell className="font-proxima text-slate-600 max-w-xs truncate">
                    {org.description || '—'}
                  </TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{org.program_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {org.active !== false ? (
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
                        onClick={() => handleEdit(org)}
                        className="hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(org)}
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
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </DialogTitle>
            <DialogDescription className="font-proxima">
              {editingOrg 
                ? 'Update organization details below' 
                : 'Fill in the details to create a new organization'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="font-proxima">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pursuit"
                    required
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug" className="font-proxima">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., pursuit (auto-generated if empty)"
                    className="font-proxima"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-proxima">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Organization description..."
                  rows={3}
                  className="font-proxima"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name" className="font-proxima">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Contact person name"
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email" className="font-proxima">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@organization.com"
                    className="font-proxima"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo_url" className="font-proxima">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
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
                  Active (organization is accepting new enrollments)
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
                {editingOrg ? 'Update' : 'Create'} Organization
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrganizationsTab;

