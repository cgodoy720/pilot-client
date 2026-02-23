import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
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
import { Link2, Unlink, Search, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function CohortsTab({ token, setLoading }) {
  const [cohorts, setCohorts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkFilter, setLinkFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkingCohort, setLinkingCohort] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  // Bulk link state
  const [selectedCohortIds, setSelectedCohortIds] = useState([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkCourseId, setBulkCourseId] = useState('');

  useEffect(() => {
    fetchCohorts();
    fetchCourses();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/cohorts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCohorts(response.data.cohorts || []);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      Swal.fire('Error', 'Failed to fetch cohorts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/organization-management/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleLink = (cohort) => {
    setLinkingCohort(cohort);
    setSelectedCourseId(cohort.course_id || '');
    setIsDialogOpen(true);
  };

  const handleUnlink = async (cohort) => {
    const result = await Swal.fire({
      title: 'Unlink Cohort?',
      html: `Remove <strong>${cohort.name}</strong> from course <strong>${cohort.course_name}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, unlink',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/api/admin/organization-management/cohorts/${cohort.cohort_id}/unlink-course`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('Unlinked!', 'Cohort unlinked from course successfully', 'success');
      fetchCohorts();
    } catch (error) {
      console.error('Error unlinking cohort:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to unlink cohort', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      Swal.fire('Error', 'Please select a course', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/api/admin/organization-management/cohorts/${linkingCohort.cohort_id}/link-course`,
        { course_id: selectedCourseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('Success', 'Cohort linked to course successfully', 'success');
      setIsDialogOpen(false);
      fetchCohorts();
    } catch (error) {
      console.error('Error linking cohort:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to link cohort to course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLink = () => {
    if (selectedCohortIds.length === 0) {
      Swal.fire('Error', 'Please select at least one cohort', 'error');
      return;
    }
    setBulkCourseId('');
    setIsBulkDialogOpen(true);
  };

  const handleBulkLinkSubmit = async (e) => {
    e.preventDefault();

    if (!bulkCourseId) {
      Swal.fire('Error', 'Please select a course', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/admin/organization-management/cohorts/bulk-link`,
        { cohort_ids: selectedCohortIds, course_id: bulkCourseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire('Success', response.data.message || 'Cohorts linked successfully', 'success');
      setIsBulkDialogOpen(false);
      setSelectedCohortIds([]);
      fetchCohorts();
    } catch (error) {
      console.error('Error bulk linking cohorts:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to link cohorts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCohortSelection = (cohortId) => {
    setSelectedCohortIds(prev =>
      prev.includes(cohortId)
        ? prev.filter(id => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const toggleSelectAllUnlinked = () => {
    const unlinkedIds = filteredCohorts
      .filter(c => c.is_unlinked)
      .map(c => c.cohort_id);

    const allSelected = unlinkedIds.every(id => selectedCohortIds.includes(id));
    if (allSelected) {
      setSelectedCohortIds(prev => prev.filter(id => !unlinkedIds.includes(id)));
    } else {
      setSelectedCohortIds(prev => [...new Set([...prev, ...unlinkedIds])]);
    }
  };

  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch =
      cohort.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.cohort_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLink =
      linkFilter === 'all' ||
      (linkFilter === 'linked' && !cohort.is_unlinked) ||
      (linkFilter === 'unlinked' && cohort.is_unlinked);

    const matchesCourse =
      courseFilter === 'all' || cohort.course_id === courseFilter;

    return matchesSearch && matchesLink && matchesCourse;
  });

  const getTypeBadge = (type) => {
    if (!type) return <Badge variant="outline" className="font-proxima">N/A</Badge>;

    const colors = {
      'builder': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-purple-100 text-purple-800',
      'external': 'bg-amber-100 text-amber-800'
    };

    const color = colors[type] || 'bg-gray-100 text-gray-800';
    return (
      <Badge className={`${color} hover:${color} font-proxima capitalize`}>
        {type}
      </Badge>
    );
  };

  const unlinkedCount = cohorts.filter(c => c.is_unlinked).length;
  const linkedCount = cohorts.filter(c => !c.is_unlinked).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-[#4242EA]" />
          <h2 className="text-xl font-bold text-slate-900 font-proxima">Cohort Course Linking</h2>
          <Badge variant="secondary" className="font-proxima">
            {filteredCohorts.length} total
          </Badge>
          {unlinkedCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-proxima">
              {unlinkedCount} unlinked
            </Badge>
          )}
        </div>
        {selectedCohortIds.length > 0 && (
          <Button
            onClick={handleBulkLink}
            className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Bulk Link ({selectedCohortIds.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-proxima"
          />
        </div>
        <Select value={linkFilter} onValueChange={setLinkFilter}>
          <SelectTrigger className="w-[200px] font-proxima">
            <SelectValue placeholder="Link status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Cohorts</SelectItem>
            <SelectItem value="linked" className="font-proxima">Linked ({linkedCount})</SelectItem>
            <SelectItem value="unlinked" className="font-proxima">Unlinked ({unlinkedCount})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[250px] font-proxima">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-proxima">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course.course_id} value={course.course_id} className="font-proxima">
                {course.program_name} → {course.name}
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
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  onChange={toggleSelectAllUnlinked}
                  checked={
                    filteredCohorts.filter(c => c.is_unlinked).length > 0 &&
                    filteredCohorts.filter(c => c.is_unlinked).every(c => selectedCohortIds.includes(c.cohort_id))
                  }
                  className="h-4 w-4 rounded"
                  title="Select all unlinked cohorts"
                />
              </TableHead>
              <TableHead className="font-proxima font-semibold">Cohort</TableHead>
              <TableHead className="font-proxima font-semibold">Type</TableHead>
              <TableHead className="font-proxima font-semibold">Dates</TableHead>
              <TableHead className="font-proxima font-semibold">Linked Course</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Enrollments</TableHead>
              <TableHead className="font-proxima font-semibold text-center">Status</TableHead>
              <TableHead className="font-proxima font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCohorts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500 font-proxima">
                  No cohorts found
                </TableCell>
              </TableRow>
            ) : (
              filteredCohorts.map((cohort) => (
                <TableRow key={cohort.cohort_id} className="hover:bg-slate-50">
                  <TableCell>
                    {cohort.is_unlinked && (
                      <input
                        type="checkbox"
                        checked={selectedCohortIds.includes(cohort.cohort_id)}
                        onChange={() => toggleCohortSelection(cohort.cohort_id)}
                        className="h-4 w-4 rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium font-proxima">
                    <div>
                      <div>{cohort.name}</div>
                      {cohort.access_code && (
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                          {cohort.access_code}
                        </code>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(cohort.cohort_type)}</TableCell>
                  <TableCell className="font-proxima text-sm text-slate-600">
                    <div>
                      {cohort.start_date
                        ? new Date(cohort.start_date).toLocaleDateString()
                        : '—'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {cohort.end_date
                        ? `to ${new Date(cohort.end_date).toLocaleDateString()}`
                        : ''}
                    </div>
                  </TableCell>
                  <TableCell className="font-proxima">
                    {cohort.is_unlinked ? (
                      <span className="text-slate-400 italic text-sm">Not linked</span>
                    ) : (
                      <div className="text-sm">
                        <div className="text-slate-900">{cohort.course_name}</div>
                        {cohort.course_level && (
                          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs mt-0.5">
                            {cohort.course_level}
                          </Badge>
                        )}
                        <div className="text-slate-500 text-xs mt-0.5">
                          {cohort.program_name} &middot; {cohort.organization_name}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-proxima">
                    <Badge variant="outline">{cohort.enrolled_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {cohort.is_active !== false ? (
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
                        onClick={() => handleLink(cohort)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title={cohort.is_unlinked ? 'Link to course' : 'Change linked course'}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      {!cohort.is_unlinked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlink(cohort)}
                          className="hover:bg-red-50 hover:text-red-600"
                          title="Unlink from course"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Link Cohort to Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-proxima text-xl">
              Link Cohort to Course
            </DialogTitle>
            <DialogDescription className="font-proxima">
              {linkingCohort && (
                <>Select a course to link <strong>{linkingCohort.name}</strong> to</>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLinkSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label className="font-proxima">Cohort</Label>
                <Input
                  value={linkingCohort?.name || ''}
                  disabled
                  className="font-proxima bg-slate-50"
                />
              </div>

              <div>
                <Label htmlFor="course_id" className="font-proxima">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter(c => c.active !== false)
                      .map(course => (
                        <SelectItem key={course.course_id} value={course.course_id} className="font-proxima">
                          {course.program_name} → {course.name}
                          {course.level ? ` (${course.level})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                Link Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Link Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-proxima text-xl">
              Bulk Link Cohorts
            </DialogTitle>
            <DialogDescription className="font-proxima">
              Link {selectedCohortIds.length} selected cohort(s) to a course
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkLinkSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label className="font-proxima">Selected Cohorts</Label>
                <div className="bg-slate-50 border rounded-md p-3 max-h-32 overflow-y-auto">
                  {selectedCohortIds.map(id => {
                    const cohort = cohorts.find(c => c.cohort_id === id);
                    return (
                      <div key={id} className="text-sm font-proxima text-slate-700">
                        {cohort?.name || id}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="bulk_course_id" className="font-proxima">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={bulkCourseId}
                  onValueChange={setBulkCourseId}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter(c => c.active !== false)
                      .map(course => (
                        <SelectItem key={course.course_id} value={course.course_id} className="font-proxima">
                          {course.program_name} → {course.name}
                          {course.level ? ` (${course.level})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkDialogOpen(false)}
                className="font-proxima"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#4242EA] hover:bg-[#3535BA] text-white font-proxima"
              >
                Link {selectedCohortIds.length} Cohort(s)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CohortsTab;
