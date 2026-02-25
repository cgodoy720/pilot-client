import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const LeadImportModal = ({ open, onClose, token, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/import`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to import leads');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import leads into the system. The file should have columns for: 
            Source, Date, First Name, Last Name, Email, Phone, ZIP, NYCHA Resident.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* File Drop Zone */}
          {!result && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-sm text-green-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag and drop a CSV file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    CSV files only
                  </p>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {result && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Import completed successfully!
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total rows processed:</span>
                  <span className="font-medium">{result.totalRows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New leads inserted:</span>
                  <span className="font-medium text-green-600">{result.insertedLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duplicate leads (skipped):</span>
                  <span className="font-medium text-yellow-600">{result.skippedDuplicates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Source records created:</span>
                  <span className="font-medium">{result.insertedSources}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Matched existing applicants:</span>
                  <span className="font-medium text-blue-600">{result.newApplicantMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matched existing builders:</span>
                  <span className="font-medium text-purple-600">{result.newBuilderMatches}</span>
                </div>
                {result.newSourcesAdded > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">New source types added:</span>
                    <span className="font-medium">{result.newSourcesAdded}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || loading}
              >
                {loading ? 'Importing...' : 'Import Leads'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadImportModal;
