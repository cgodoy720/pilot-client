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
import { Pencil, Trash2, Plus, BookOpen, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function CoursesTab({ token, setLoading }) {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    program_id: '',
    name: '',
    slug: '',
    description: '',
    level: '',
    sequence_order: 1,
    duration_weeks: '',
    active: true
  });

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
    fetchOrganizations();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Swal.fire('Error', 'Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/programs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrograms(response.data.programs || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
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
    setEditingCourse(null);
    setFormData({
      program_id: '',
      name: '',
      slug: '',
      description: '',
      level: '',
      sequence_order: 1,
      duration_weeks: '',
      active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      program_id: course.program_id,
      name: course.name || '',
      slug: course.slug || '',
      description: course.description || '',
      level: course.level || '',
      sequence_order: course.sequence_order || 1,
      duration_weeks: course.duration_weeks || '',
      active: course.active !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (course) => {
    const cohortCount = parseInt(course.cohort_count) || 0;
    
    if (cohortCount > 0) {
      const result = await Swal.fire({
        title: 'Course has cohorts',
        html: `This course has <strong>${cohortCount} cohort(s)</strong> linked to it.<br/>Deleting will unlink these cohorts. Continue?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete and unlink',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;
    } else {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Delete course "${course.name}"?`,
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
        `${API_URL}/api/admin/organization-management/courses/${course.course_id}?cascade=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Deleted!', 'Course deleted successfully', 'success');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to delete course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.program_id) {
      Swal.fire('Error', 'Please select a program', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
        sequence_order: parseInt(formData.sequence_order)
      };
      
      if (editingCourse) {
        // Update
        await axios.put(
          `${API_URL}/api/admin/organization-management/courses/${editingCourse.course_id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Course updated successfully', 'success');
      } else {
        // Create
        await axios.post(
          `${API_URL}/api/admin/organization-management/courses`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire('Success', 'Course created successfully', 'success');
      }
      
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to save course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = programFilter === 'all' || course.program_id === programFilter;
    
    return matchesSearch && matchesProgram;
  });

  const getLevelBadge = (level) => {
    if (!level) return <Badge variant="outline" className="font-proxima">N/A</Badge>;
    
    const colors = {
      'L1': 'bg-green-100 text-green-800',
      'L2': 'bg-blue-100 text-blue-800',
      'L3': 'bg-purple-100 text-purple-800',
      'L3+': 'bg-pink-100 text-pink-800'
    };
    
    const color = colors[level] || 'bg-gray-100 text-gray-800';
    return (
      <Badge className={`${color} hover:${color} font-proxima`}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-bold text-slate-900 font-proxima">Courses</h2>
          <Badge variant="secondary" className="font-proxima">
            {filteredCourses.length} total
          </Badge>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-proxima"
          />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-[250px] font-proxima">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Programs</SelectItem>
            {programs.map(program => (
              <SelectItem key={program.program_id} value={program.program_id} className="font-proxima">
                {program.organization_name} → {program.name}
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
              <TableHead className="font-proxima font-semibold">Program</TableHead>
              <TableHead className="font-proxima font-semibold">Level</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Sequence</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Duration</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Cohorts</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Status</TableHead>
              <TableHead className="font-proxima font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500 font-proxima">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.course_id} className="hover:bg-slate-50">
                  <TableCell className="font-medium font-proxima">
                    <div>
                      <div>{course.name}</div>
                      {course.slug && (
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                          {course.slug}
                        </code>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-proxima">
                    <div className="text-sm">
                      <div className="text-slate-900">{course.program_name}</div>
                      <div className="text-slate-500 text-xs">{course.organization_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getLevelBadge(course.level)}</TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{course.sequence_order}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-proxima text-slate-600">
                    {course.duration_weeks ? `${course.duration_weeks} weeks` : '—'}
                  </TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{course.cohort_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {course.active !== false ? (
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
                        onClick={() => handleEdit(course)}
                        className="hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course)}
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
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </DialogTitle>
            <DialogDescription className="font-proxima">
              {editingCourse 
                ? 'Update course details below' 
                : 'Fill in the details to create a new course'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="program_id" className="font-proxima">
                  Program <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                  disabled={!!editingCourse}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.program_id} value={program.program_id} className="font-proxima">
                        {program.organization_name} → {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingCourse && (
                  <p className="text-xs text-slate-500 mt-1 font-proxima">
                    Program cannot be changed after creation
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
                    placeholder="e.g., Level 1: Foundations"
                    required
                    className="font-proxima"
                  />
                </div>
                
                <div>
                  <Label htmlFor="level" className="font-proxima">Level</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g., L1, L2, L3, L3+"
                    className="font-proxima"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug" className="font-proxima">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., level-1-foundations (auto-generated if empty)"
                  className="font-proxima"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-proxima">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  rows={3}
                  className="font-proxima"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sequence_order" className="font-proxima">
                    Sequence Order <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sequence_order"
                    type="number"
                    min="1"
                    value={formData.sequence_order}
                    onChange={(e) => setFormData({ ...formData, sequence_order: parseInt(e.target.value) })}
                    placeholder="1, 2, 3..."
                    required
                    className="font-proxima"
                  />
                  <p className="text-xs text-slate-500 mt-1 font-proxima">
                    Order in which students take this course
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="duration_weeks" className="font-proxima">Duration (weeks)</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                    placeholder="e.g., 12"
                    className="font-proxima"
                  />
                </div>
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
                  Active (course is available for cohort linking)
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
                {editingCourse ? 'Update' : 'Create'} Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CoursesTab;

