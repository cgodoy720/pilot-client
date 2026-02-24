import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../components/ui/collapsible';
import { ChevronDown, FileText, Upload, Download, Pencil, Trash2, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const MAX_RESUMES = 5;

// Sentinel used in the edit Select to represent "no industry tagged"
const NO_INTEREST = '__none__';

// ── Interest options ──────────────────────────────────────────────────────────

const INTEREST_OPTIONS = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'Healthtech' },
  { value: 'ai_ml', label: 'AI / ML' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'enterprise_saas', label: 'Enterprise SaaS' },
  { value: 'consumer_apps', label: 'Consumer Apps' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'gov_civic_tech', label: 'Gov / Civic Tech' },
  { value: 'media_entertainment', label: 'Media & Entertainment' },
  { value: 'consumer_services', label: 'Consumer Services' },
  { value: 'other', label: 'Other' },
];

const INTEREST_LABELS = Object.fromEntries(
  INTEREST_OPTIONS.map(({ value, label }) => [value, label])
);

// ── Component ─────────────────────────────────────────────────────────────────

function MyResumes() {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({ name: '', taggedInterest: '', isPrimary: false });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Edit dialog state
  const [editingResume, setEditingResume] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', taggedInterest: NO_INTEREST, isPrimary: false });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Per-row loading states
  const [deletingId, setDeletingId] = useState(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, [token]);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/pathfinder/resumes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Could not load resumes',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── File selection ────────────────────────────────────────────────────────

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Swal.fire({ toast: true, icon: 'warning', title: 'Only PDF files are allowed', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ toast: true, icon: 'warning', title: 'File must be under 5MB', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return;
    }
    setSelectedFile(file);
    setUploadForm({
      name: file.name.replace(/\.pdf$/i, ''),
      taggedInterest: '',
      isPrimary: resumes.length === 0, // auto-primary when it'll be the first resume
    });
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0] || null);
    e.target.value = ''; // reset so the same file can be re-selected
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setUploadForm({ name: '', taggedInterest: '', isPrimary: false });
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!uploadForm.name.trim()) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Enter a name for this resume', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return;
    }
    try {
      setIsUploading(true);

      // Build multipart payload — do NOT set Content-Type header manually
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadForm.name.trim());
      if (uploadForm.taggedInterest) formData.append('taggedInterest', uploadForm.taggedInterest);
      formData.append('isPrimary', uploadForm.isPrimary ? 'true' : 'false');

      const response = await fetch(`${API_URL}/api/pathfinder/resumes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to upload resume');
      }

      const newResume = await response.json();

      setResumes((prev) => {
        // If the new resume is primary, clear is_primary on all others in local state
        const updated = newResume.is_primary
          ? prev.map((r) => ({ ...r, is_primary: false }))
          : prev;
        return [newResume, ...updated];
      });

      setSelectedFile(null);
      setUploadForm({ name: '', taggedInterest: '', isPrimary: false });

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Resume uploaded!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Upload failed',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Set Primary ───────────────────────────────────────────────────────────

  const handleSetPrimary = async (resume) => {
    try {
      setSettingPrimaryId(resume.id);
      const response = await fetch(`${API_URL}/api/pathfinder/resumes/${resume.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update resume');
      }

      // Update local state — mark only this one as primary
      setResumes((prev) => prev.map((r) => ({ ...r, is_primary: r.id === resume.id })));
    } catch (error) {
      console.error('Error setting primary resume:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Could not update resume',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const openEditDialog = (resume) => {
    setEditingResume(resume);
    setEditForm({
      name: resume.name,
      taggedInterest: resume.tagged_interest || NO_INTEREST,
      isPrimary: resume.is_primary,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingResume) return;
    if (!editForm.name.trim()) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Name cannot be empty', position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
      return;
    }
    try {
      setIsSavingEdit(true);
      const response = await fetch(`${API_URL}/api/pathfinder/resumes/${editingResume.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          taggedInterest: editForm.taggedInterest === NO_INTEREST ? null : editForm.taggedInterest,
          isPrimary: editForm.isPrimary,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update resume');
      }

      const updated = await response.json();

      setResumes((prev) =>
        prev.map((r) => {
          if (r.id === updated.id) return updated;
          // If the edited resume is now primary, clear all others
          if (updated.is_primary) return { ...r, is_primary: false };
          return r;
        })
      );

      setEditingResume(null);
      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Resume updated',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Could not update resume',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (resume) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete this resume?',
      text: `"${resume.name}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (!isConfirmed) return;

    try {
      setDeletingId(resume.id);
      const response = await fetch(`${API_URL}/api/pathfinder/resumes/${resume.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete resume');
      }

      setResumes((prev) => prev.filter((r) => r.id !== resume.id));

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Resume deleted',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: error.message || 'Could not delete resume',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const primaryResume = resumes.find((r) => r.is_primary);
  const atMax = resumes.length >= MAX_RESUMES;
  const slotsRemaining = MAX_RESUMES - resumes.length;

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mb-6 px-5 py-4 bg-white border border-[#e0e0e0] rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e0e0e0]" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-[#e0e0e0] rounded w-28" />
            <div className="h-3 bg-[#e0e0e0] rounded w-52" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="mb-6 border border-[#e0e0e0] rounded-xl bg-white overflow-hidden">

          {/* ── Header / Trigger ── */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(66,66,234,0.03)] transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[rgba(66,66,234,0.1)] flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[#4242ea]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">My Resumes</p>
                  {resumes.length > 0 ? (
                    <p className="text-sm text-[#666666] mt-0.5 truncate">
                      {resumes.length} of {MAX_RESUMES} uploaded
                      {primaryResume ? ` · Primary: ${primaryResume.name}` : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-[#999999] mt-0.5">
                      No resumes yet — upload your first
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {!isOpen && (
                  resumes.length > 0 ? (
                    <Badge
                      variant="outline"
                      className="text-[#4242ea] border-[#4242ea]/30 bg-[rgba(66,66,234,0.05)] text-xs font-medium"
                    >
                      {resumes.length} / {MAX_RESUMES}
                    </Badge>
                  ) : (
                    <Badge className="bg-[#4242ea] text-white text-xs font-medium">
                      Upload
                    </Badge>
                  )
                )}
                <ChevronDown
                  size={18}
                  className={`text-[#999999] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
          </CollapsibleTrigger>

          {/* ── Expanded Content ── */}
          <CollapsibleContent>
            <div className="border-t border-[#e0e0e0] px-5 py-5 space-y-4">

              {/* ── Upload zone or max-reached warning ── */}
              {!selectedFile ? (
                atMax ? (
                  <div className="flex items-start gap-3 p-4 bg-[#fff8e1] border border-[#f59e0b]/30 rounded-lg">
                    <span className="text-[#f59e0b] text-base leading-none mt-0.5">⚠</span>
                    <p className="text-sm text-[#92400e]">
                      You've reached the {MAX_RESUMES}-resume limit. Delete one to upload a new version.
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                        isDragOver
                          ? 'border-[#4242ea] bg-[rgba(66,66,234,0.05)]'
                          : 'border-[#d0d0d0] hover:border-[#4242ea]/50 hover:bg-[rgba(66,66,234,0.02)]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[rgba(66,66,234,0.1)] flex items-center justify-center">
                        <Upload size={18} className="text-[#4242ea]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#1a1a1a]">
                          Click to browse or drag a PDF here
                        </p>
                        <p className="text-xs text-[#999999] mt-0.5">
                          PDF only · 5MB max · {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} remaining
                        </p>
                      </div>
                    </button>
                  </>
                )
              ) : (
                /* ── Inline upload form — shown once a file is selected ── */
                <div className="border border-[#4242ea]/30 rounded-xl p-4 bg-[rgba(66,66,234,0.02)] space-y-4">
                  {/* Selected file info */}
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-[#4242ea] flex-shrink-0" />
                    <span className="text-sm font-medium text-[#1a1a1a] truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-[#999999] flex-shrink-0">
                      ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#1a1a1a]">
                      Resume Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={uploadForm.name}
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Software Engineer Resume"
                      className="bg-white border-[#e0e0e0] text-sm"
                    />
                  </div>

                  {/* Tagged Industry */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-[#1a1a1a]">
                      Tagged Industry{' '}
                      <span className="text-[#999999] font-normal text-xs ml-1">optional</span>
                    </Label>
                    <Select
                      value={uploadForm.taggedInterest}
                      onValueChange={(v) =>
                        setUploadForm((prev) => ({ ...prev, taggedInterest: v }))
                      }
                    >
                      <SelectTrigger className="bg-white border-[#e0e0e0]">
                        <SelectValue placeholder="Which industry is this tailored for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEREST_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Is Primary */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={uploadForm.isPrimary}
                      onCheckedChange={(checked) =>
                        setUploadForm((prev) => ({ ...prev, isPrimary: !!checked }))
                      }
                      className="data-[state=checked]:bg-[#4242ea] data-[state=checked]:border-[#4242ea]"
                    />
                    <span className="text-sm text-[#1a1a1a]">Set as primary resume</span>
                  </label>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-1">
                    <Button
                      variant="outline"
                      onClick={handleCancelUpload}
                      disabled={isUploading}
                      className="text-[#666666] border-[#e0e0e0]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || !uploadForm.name.trim()}
                      className="bg-[#4242ea] hover:bg-[#3535c9] text-white font-semibold"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Resume list ── */}
              {resumes.length > 0 && (
                <div className="space-y-0">
                  {resumes.map((resume, index) => (
                    <div
                      key={resume.id}
                      className={`flex items-center gap-3 py-3.5 ${
                        index < resumes.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                      }`}
                    >
                      {/* PDF icon */}
                      <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-[#ef4444]" />
                      </div>

                      {/* Name + badges + date */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium text-[#1a1a1a] truncate">
                            {resume.name}
                          </span>
                          {resume.is_primary && (
                            <Badge className="bg-[#4242ea] text-white text-[10px] font-semibold px-1.5 py-0 leading-4">
                              Primary
                            </Badge>
                          )}
                          {resume.tagged_interest && (
                            <Badge
                              variant="outline"
                              className="text-[#666666] border-[#e0e0e0] text-[10px] font-normal px-1.5 py-0 leading-4"
                            >
                              {INTEREST_LABELS[resume.tagged_interest] || resume.tagged_interest}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#999999] mt-0.5">
                          Uploaded {format(new Date(resume.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {/* Set as Primary — hidden on already-primary rows */}
                        {!resume.is_primary && (
                          <button
                            title="Set as primary"
                            onClick={() => handleSetPrimary(resume)}
                            disabled={settingPrimaryId === resume.id}
                            className="p-1.5 rounded-md text-[#cccccc] hover:text-[#f59e0b] hover:bg-[#fff8e1] transition-colors disabled:opacity-40"
                          >
                            <Star size={14} />
                          </button>
                        )}

                        {/* Download */}
                        {resume.downloadUrl ? (
                          <a
                            href={resume.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download"
                            className="p-1.5 rounded-md text-[#cccccc] hover:text-[#4242ea] hover:bg-[rgba(66,66,234,0.06)] transition-colors"
                          >
                            <Download size={14} />
                          </a>
                        ) : (
                          <span className="p-1.5 text-[#e0e0e0] cursor-not-allowed" title="Download unavailable">
                            <Download size={14} />
                          </span>
                        )}

                        {/* Edit */}
                        <button
                          title="Edit"
                          onClick={() => openEditDialog(resume)}
                          className="p-1.5 rounded-md text-[#cccccc] hover:text-[#4242ea] hover:bg-[rgba(66,66,234,0.06)] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete"
                          onClick={() => handleDelete(resume)}
                          disabled={deletingId === resume.id}
                          className="p-1.5 rounded-md text-[#cccccc] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state — no resumes, no file selected */}
              {resumes.length === 0 && !selectedFile && (
                <p className="text-sm text-[#999999] text-center py-2">
                  Upload a PDF to get started. You can store up to {MAX_RESUMES} versions.
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* ── Edit Dialog ───────────────────────────────────────────────────────── */}
      <Dialog
        open={!!editingResume}
        onOpenChange={(open) => { if (!open) setEditingResume(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a1a]">
              Edit Resume
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1a1a1a]">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Resume name"
                className="bg-white border-[#e0e0e0] text-sm"
              />
            </div>

            {/* Tagged Industry */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1a1a1a]">
                Tagged Industry{' '}
                <span className="text-[#999999] font-normal text-xs ml-1">optional</span>
              </Label>
              <Select
                value={editForm.taggedInterest}
                onValueChange={(v) =>
                  setEditForm((prev) => ({ ...prev, taggedInterest: v }))
                }
              >
                <SelectTrigger className="bg-white border-[#e0e0e0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_INTEREST}>None</SelectItem>
                  {INTEREST_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Is Primary */}
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={editForm.isPrimary}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isPrimary: !!checked }))
                }
                className="data-[state=checked]:bg-[#4242ea] data-[state=checked]:border-[#4242ea]"
              />
              <span className="text-sm text-[#1a1a1a]">Set as primary resume</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingResume(null)}
              disabled={isSavingEdit}
              className="text-[#666666] border-[#e0e0e0]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSavingEdit || !editForm.name.trim()}
              className="bg-[#4242ea] hover:bg-[#3535c9] text-white font-semibold"
            >
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyResumes;
