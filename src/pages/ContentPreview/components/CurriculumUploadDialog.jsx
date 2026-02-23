import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function CurriculumUploadDialog({ open, onOpenChange, cohort, token, onUploadComplete }) {
  const [uploadMethod, setUploadMethod] = useState('file');
  const [jsonInput, setJsonInput] = useState('');
  const [parsedDays, setParsedDays] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const cohortName = cohort?.name || cohort?.cohort_name;
  const cohortId = cohort?.cohort_id;

  const resetState = () => {
    setUploadMethod('file');
    setJsonInput('');
    setParsedDays([]);
    setUploadErrors([]);
    setShowConfirmation(false);
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) resetState();
    onOpenChange(newOpen);
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

      let daysArray = Array.isArray(parsed) ? parsed : [parsed];

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
    if (!cohortId || parsedDays.length === 0) return;

    setUploading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/curriculum/bulk-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cohortId,
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
        handleOpenChange(false);
        onUploadComplete?.();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl font-proxima max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold">
            Upload Curriculum - {cohortName}
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
                  <p className="font-bold text-green-700 mb-2">Parsed Successfully</p>
                  <p className="text-sm text-green-600">
                    {parsedDays.length} {parsedDays.length === 1 ? 'day' : 'days'} ready to edit
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
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadConfirm}
                      className="bg-[#4242ea] hover:bg-[#3333d1]"
                    >
                      Continue to Upload
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
                You are about to upload <strong>{parsedDays.length}</strong> curriculum {parsedDays.length === 1 ? 'day' : 'days'} to <strong>{cohortName}</strong>:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {parsedDays.map((day, i) => (
                  <Badge key={i} className="bg-[#4242ea] text-white">
                    Day {day.day_number}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Days that already exist will be updated. New days will be created.
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
  );
}

export default CurriculumUploadDialog;
