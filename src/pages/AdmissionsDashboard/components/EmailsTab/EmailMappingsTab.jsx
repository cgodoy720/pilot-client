import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Email Mappings Management Component
const EmailMappingsTab = ({
  emailMappings,
  emailMappingsLoading,
  fetchEmailMappings,
  token
}) => {
  // Upload/input state
  const [mappingInput, setMappingInput] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  
  // Parsing state
  const [parsing, setParsing] = useState(false);
  
  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Existing mappings state
  const [mappingsSearch, setMappingsSearch] = useState('');
  const [mappingsPage, setMappingsPage] = useState(1);

  // Load mappings on mount
  useEffect(() => {
    if (token) {
      fetchEmailMappings(1, '');
    }
  }, [token]);

  // Parse CSV content
  const parseCSV = (content) => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    const mappings = [];
    
    lines.forEach((line, index) => {
      // Skip if it looks like a header row (must have BOTH keywords and no @ symbol)
      const lowerLine = line.toLowerCase();
      const hasEmailSymbol = line.includes('@');
      const hasHeaderKeywords = (
        lowerLine.includes('personal_email') || 
        lowerLine.includes('pursuit_email') ||
        (lowerLine.includes('personal') && lowerLine.includes('email') && lowerLine.includes('pursuit'))
      );
      
      if (index === 0 && hasHeaderKeywords && !hasEmailSymbol) {
        return;
      }
      
      // Split by comma or tab first
      let parts = line.split(/[,\t]/).map(p => p.trim()).filter(p => p);
      
      // If we don't have 2 parts yet, try splitting by multiple spaces (2+)
      if (parts.length < 2) {
        parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p);
      }
      
      if (parts.length >= 2 && parts[0] && parts[1]) {
        mappings.push({
          personal_email: parts[0],
          pursuit_email: parts[1],
          lineNumber: index + 1
        });
      }
    });
    
    return mappings;
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 5MB',
        confirmButtonColor: '#4242ea'
      });
      return;
    }
    
    // Validate file type
    const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a CSV or TXT file',
        confirmButtonColor: '#4242ea'
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setMappingInput(content);
    };
    reader.readAsText(file);
    setUploadFile(file);
  };

  // Parse and validate mappings
  const handleParseAndValidate = async () => {
    if (!mappingInput.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please paste or upload email mappings',
        confirmButtonColor: '#4242ea'
      });
      return;
    }
    
    setParsing(true);
    try {
      const parsedMappings = parseCSV(mappingInput);
      
      if (parsedMappings.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No Valid Data',
          text: 'Could not find any valid email pairs in the input',
          confirmButtonColor: '#4242ea'
        });
        setParsing(false);
        return;
      }
      
      // Warn if too many rows
      if (parsedMappings.length > 1000) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Large Upload',
          text: `You are about to validate ${parsedMappings.length} rows. This may take a moment. Continue?`,
          showCancelButton: true,
          confirmButtonText: 'Continue',
          confirmButtonColor: '#4242ea'
        });
        
        if (!result.isConfirmed) {
          setParsing(false);
          return;
        }
      }
      
      // Validate with backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email-mappings/validate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ mappings: parsedMappings })
        }
      );
      
      if (!response.ok) {
        throw new Error('Validation failed');
      }
      
      const data = await response.json();
      setPreviewData(data.validation);
    } catch (error) {
      console.error('Error validating mappings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: error.message || 'Failed to validate mappings',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setParsing(false);
    }
  };

  // Submit valid mappings
  const handleSubmitMappings = async () => {
    if (!previewData || previewData.valid.length === 0) {
      return;
    }
    
    // Confirm submission
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Upload',
      html: `
        <div class="text-left">
          <p>Ready to upload <strong>${previewData.valid.length}</strong> valid email mapping(s)?</p>
          ${previewData.alreadyExists.length > 0 ? 
            `<p class="text-yellow-600 mt-2">Note: ${previewData.alreadyExists.length} mapping(s) already exist and will be skipped.</p>` 
            : ''}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      confirmButtonColor: '#4242ea'
    });
    
    if (!result.isConfirmed) return;
    
    setSubmitting(true);
    try {
      const mappingsToUpload = previewData.valid.map(item => item.mapping);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email-mappings/bulk-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ mappings: mappingsToUpload })
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      Swal.fire({
        icon: 'success',
        title: 'Upload Complete!',
        html: `
          <div class="text-left">
            <p><strong>Created:</strong> ${data.summary.created} mapping(s)</p>
            <p><strong>Updated:</strong> ${data.summary.updated} mapping(s)</p>
            ${data.summary.skipped > 0 ? 
              `<p class="text-orange-600"><strong>Skipped:</strong> ${data.summary.skipped} mapping(s)</p>` 
              : ''}
            ${data.summary.errors.length > 0 ? 
              `<p class="text-red-600"><strong>Errors:</strong> ${data.summary.errors.length} chunk(s) failed</p>` 
              : ''}
          </div>
        `,
        confirmButtonColor: '#4242ea'
      });
      
      // Clear form and refresh
      setMappingInput('');
      setUploadFile(null);
      setPreviewData(null);
      fetchEmailMappings(1, mappingsSearch);
    } catch (error) {
      console.error('Error uploading mappings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: error.message || 'Failed to upload mappings',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Clear preview
  const handleClearPreview = () => {
    setPreviewData(null);
  };

  // Clear all
  const handleClearAll = () => {
    setMappingInput('');
    setUploadFile(null);
    setPreviewData(null);
  };

  // Search mappings
  const handleSearch = () => {
    setMappingsPage(1);
    fetchEmailMappings(1, mappingsSearch);
  };

  // Pagination
  const handlePageChange = (newPage) => {
    setMappingsPage(newPage);
    fetchEmailMappings(newPage, mappingsSearch);
  };

  // Delete mapping
  const handleDeleteMapping = async (mapping) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Email Mapping?',
      html: `
        <div class="text-left">
          <p>Are you sure you want to delete this mapping?</p>
          <div class="mt-3 p-3 bg-gray-50 rounded">
            <div class="text-sm"><strong>Personal:</strong> ${mapping.personal_email}</div>
            <div class="text-sm"><strong>Pursuit:</strong> ${mapping.pursuit_email}</div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email-mappings/${mapping.mapping_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete mapping');
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Email mapping has been deleted.',
        confirmButtonColor: '#4242ea',
        timer: 2000,
        showConfirmButton: false
      });

      // Refresh the list
      fetchEmailMappings(mappingsPage, mappingsSearch);
    } catch (error) {
      console.error('Error deleting mapping:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || 'Failed to delete mapping',
        confirmButtonColor: '#4242ea'
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-[#1a1a1a] font-proxima-bold">
          Email Mappings Management
        </h3>
      </div>

      {/* Upload and Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-proxima-bold">Upload Email Mappings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Guide */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm font-proxima">
              <div className="font-proxima-bold text-blue-900 mb-1">Accepted Formats:</div>
              <div className="text-blue-700 space-y-1">
                <div><code className="bg-white px-2 py-1 rounded">personal@email.com,pursuit@email.com</code> <span className="text-xs">(comma)</span></div>
                <div><code className="bg-white px-2 py-1 rounded">personal@email.com  pursuit@email.com</code> <span className="text-xs">(tab or 2+ spaces)</span></div>
              </div>
              <div className="text-blue-600 text-xs mt-2">
                One pair per line. CSV headers optional.
              </div>
            </div>

            {/* Textarea */}
            <div>
              <Label className="font-proxima-bold mb-2 block">Paste Email Pairs</Label>
              <Textarea
                placeholder="personal1@email.com,pursuit1@pursuit.org&#10;personal2@email.com,pursuit2@pursuit.org&#10;personal3@gmail.com    pursuit3@pursuit.org"
                value={mappingInput}
                onChange={(e) => setMappingInput(e.target.value)}
                className="font-proxima min-h-[150px]"
                disabled={parsing || submitting}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="font-proxima-bold mb-2 block">Or Upload CSV/TXT File</Label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="font-proxima"
                disabled={parsing || submitting}
              />
              {uploadFile && (
                <div className="text-sm text-gray-600 font-proxima mt-1">
                  Loaded: {uploadFile.name}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleParseAndValidate}
                disabled={!mappingInput.trim() || parsing || submitting}
                className="font-proxima flex-1"
              >
                {parsing ? 'Validating...' : 'Parse & Validate'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={parsing || submitting}
                className="font-proxima"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-proxima-bold">Preview & Validation</CardTitle>
          </CardHeader>
          <CardContent>
            {!previewData ? (
              <div className="text-center py-12 text-gray-400 font-proxima">
                <div className="mb-2">No data to preview</div>
                <div className="text-sm">Parse your input to see validation results</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 font-proxima-bold">
                      {previewData.valid.length}
                    </div>
                    <div className="text-sm text-green-600 font-proxima">Valid</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-700 font-proxima-bold">
                      {previewData.invalid.length}
                    </div>
                    <div className="text-sm text-red-600 font-proxima">Invalid</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700 font-proxima-bold">
                      {previewData.duplicates.length}
                    </div>
                    <div className="text-sm text-yellow-600 font-proxima">Duplicates</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 font-proxima-bold">
                      {previewData.alreadyExists.length}
                    </div>
                    <div className="text-sm text-blue-600 font-proxima">Already Exist</div>
                  </div>
                </div>

                {/* Preview Details */}
                <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                  {previewData.valid.length > 0 && (
                    <div className="p-3 border-b">
                      <div className="font-proxima-bold text-green-700 mb-2">
                        ✓ Valid ({previewData.valid.length})
                      </div>
                      <div className="space-y-1 text-sm font-proxima text-gray-700">
                        {previewData.valid.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {item.mapping.personal_email}
                            </Badge>
                            <span>→</span>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {item.mapping.pursuit_email}
                            </Badge>
                          </div>
                        ))}
                        {previewData.valid.length > 5 && (
                          <div className="text-gray-500 text-xs">
                            +{previewData.valid.length - 5} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {previewData.invalid.length > 0 && (
                    <div className="p-3 border-b bg-red-50">
                      <div className="font-proxima-bold text-red-700 mb-2">
                        ✗ Invalid ({previewData.invalid.length})
                      </div>
                      <div className="space-y-2 text-sm font-proxima">
                        {previewData.invalid.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="text-red-600">
                            <div className="font-medium">Row {item.index + 1}</div>
                            <div className="text-xs">{item.errors.join(', ')}</div>
                          </div>
                        ))}
                        {previewData.invalid.length > 3 && (
                          <div className="text-red-500 text-xs">
                            +{previewData.invalid.length - 3} more errors...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {previewData.alreadyExists.length > 0 && (
                    <div className="p-3 bg-blue-50">
                      <div className="font-proxima-bold text-blue-700 mb-2">
                        ⓘ Already Exist ({previewData.alreadyExists.length})
                      </div>
                      <div className="text-sm font-proxima text-blue-600">
                        These mappings already exist in the database and will be skipped.
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitMappings}
                    disabled={previewData.valid.length === 0 || submitting}
                    className="font-proxima flex-1"
                  >
                    {submitting ? 'Uploading...' : `Submit ${previewData.valid.length} Valid Mapping(s)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearPreview}
                    disabled={submitting}
                    className="font-proxima"
                  >
                    Clear Preview
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Mappings Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-proxima-bold">Existing Mappings</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Search by email..."
                value={mappingsSearch}
                onChange={(e) => setMappingsSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="font-proxima w-64"
              />
              <Button
                onClick={handleSearch}
                disabled={emailMappingsLoading}
                className="font-proxima"
              >
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emailMappingsLoading ? (
            <div className="text-center py-12 text-gray-500 font-proxima">
              Loading mappings...
            </div>
          ) : emailMappings && emailMappings.mappings && emailMappings.mappings.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-proxima-bold">Personal Email</TableHead>
                    <TableHead className="font-proxima-bold">Pursuit Email</TableHead>
                    <TableHead className="font-proxima-bold">Created</TableHead>
                    <TableHead className="font-proxima-bold">Updated</TableHead>
                    <TableHead className="font-proxima-bold w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailMappings.mappings.map((mapping) => (
                    <TableRow key={mapping.mapping_id}>
                      <TableCell className="font-proxima font-medium">
                        {mapping.personal_email}
                      </TableCell>
                      <TableCell className="font-proxima">
                        {mapping.pursuit_email}
                      </TableCell>
                      <TableCell className="font-proxima text-gray-600 text-sm">
                        {formatDate(mapping.created_at)}
                      </TableCell>
                      <TableCell className="font-proxima text-gray-600 text-sm">
                        {formatDate(mapping.updated_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteMapping(mapping)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {emailMappings.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 font-proxima">
                    Page {emailMappings.page} of {emailMappings.totalPages} 
                    ({emailMappings.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(mappingsPage - 1)}
                      disabled={mappingsPage === 1 || emailMappingsLoading}
                      className="font-proxima"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(mappingsPage + 1)}
                      disabled={mappingsPage === emailMappings.totalPages || emailMappingsLoading}
                      className="font-proxima"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 font-proxima">
              No email mappings found
              {mappingsSearch && (
                <div className="text-sm mt-2">
                  Try adjusting your search or{' '}
                  <button
                    onClick={() => {
                      setMappingsSearch('');
                      fetchEmailMappings(1, '');
                    }}
                    className="text-[#4242ea] underline"
                  >
                    clear filter
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailMappingsTab;
