import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { Textarea } from '../../../../components/ui/textarea';
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
  DialogDescription,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
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

  // Curriculum upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'
  const [jsonInput, setJsonInput] = useState('');
  const [parsedDays, setParsedDays] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
        fetchCohorts(); // Refresh the cohorts list
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(cohort)}
                          className="font-proxima"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUploadModal(cohort)}
                          className="font-proxima bg-[#4242ea] text-white hover:bg-[#3333d1] hover:text-white"
                        >
                          📚 Upload Curriculum
                        </Button>
                      </div>
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
                                  type="number"
                                  value={day.level !== undefined ? day.level : 1}
                                  onChange={(e) => updateDayField(index, 'level', parseInt(e.target.value))}
                                  className="h-8"
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
  );
};

export default CohortsTab;

