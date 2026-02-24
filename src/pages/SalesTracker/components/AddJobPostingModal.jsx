import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { X, Plus } from 'lucide-react';
import { createJobPosting } from '../../../services/salesTrackerApi';

const AddJobPostingModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    source: '',
    status: 'new',
    ownership: '',
    description: '',
    salary_range: '',
    location: '',
    experience_level: '',
    aligned_sectors: [],
    notes: '',
    salary_min: '',
    salary_max: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newSector, setNewSector] = useState('');

  const experienceLevels = [
    'Entry-Level',
    'Junior',
    'Mid-Level',
    'Senior',
    'Lead',
    'Principal',
    'Executive'
  ];

  const sources = [
    'LinkedIn',
    'Indeed',
    'Glassdoor',
    'Company Website',
    'Referral',
    'Job Board',
    'Other'
  ];

  const statuses = [
    'new',
    'reviewing',
    'approved',
    'rejected',
    'expired'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSector = () => {
    if (newSector.trim() && !formData.aligned_sectors.includes(newSector.trim())) {
      setFormData(prev => ({
        ...prev,
        aligned_sectors: [...prev.aligned_sectors, newSector.trim()]
      }));
      setNewSector('');
    }
  };

  const handleRemoveSector = (sectorToRemove) => {
    setFormData(prev => ({
      ...prev,
      aligned_sectors: prev.aligned_sectors.filter(sector => sector !== sectorToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSector();
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.company_name.trim()) {
      return 'Company name is required';
    }
    if (!formData.job_title.trim()) {
      return 'Job title is required';
    }

    // Length validations
    if (formData.company_name.trim().length > 255) {
      return 'Company name must be less than 255 characters';
    }
    if (formData.job_title.trim().length > 255) {
      return 'Job title must be less than 255 characters';
    }
    if (formData.location && formData.location.length > 255) {
      return 'Location must be less than 255 characters';
    }

    // URL validation
    if (formData.job_url && formData.job_url.trim()) {
      try {
        new URL(formData.job_url.trim());
      } catch {
        return 'Job URL must be a valid URL';
      }
    }

    // Salary validation
    const minSalary = formData.salary_min ? parseInt(formData.salary_min) : null;
    const maxSalary = formData.salary_max ? parseInt(formData.salary_max) : null;

    if (minSalary !== null && minSalary < 0) {
      return 'Minimum salary cannot be negative';
    }
    if (maxSalary !== null && maxSalary < 0) {
      return 'Maximum salary cannot be negative';
    }
    if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
      return 'Maximum salary must be greater than minimum salary';
    }

    // Sector validation
    if (formData.aligned_sectors.length > 10) {
      return 'Maximum 10 sectors allowed';
    }

    return null; // No validation errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const jobData = {
        ...formData,
        company_name: formData.company_name.trim(),
        job_title: formData.job_title.trim(),
        job_url: formData.job_url.trim() || null,
        source: formData.source || null,
        ownership: formData.ownership.trim() || null,
        description: formData.description.trim() || null,
        salary_range: formData.salary_range.trim() || null,
        location: formData.location.trim() || null,
        experience_level: formData.experience_level || null,
        aligned_sectors: formData.aligned_sectors.length > 0 ? formData.aligned_sectors : null,
        notes: formData.notes.trim() || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null
      };

      await createJobPosting(jobData);

      // Reset form and close modal
      setFormData({
        company_name: '',
        job_title: '',
        job_url: '',
        source: '',
        status: 'new',
        ownership: '',
        description: '',
        salary_range: '',
        location: '',
        experience_level: '',
        aligned_sectors: [],
        notes: '',
        salary_min: '',
        salary_max: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError(err.message || 'Failed to create job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        company_name: '',
        job_title: '',
        job_url: '',
        source: '',
        status: 'new',
        ownership: '',
        description: '',
        salary_range: '',
        location: '',
        experience_level: '',
        aligned_sectors: [],
        notes: '',
        salary_min: '',
        salary_max: ''
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job Posting</DialogTitle>
          <DialogDescription>
            Enter the details for the new job posting. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="e.g., Google, Microsoft"
                required
              />
            </div>
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job_url" className="block text-sm font-medium text-gray-700 mb-1">
                Job URL
              </label>
              <Input
                id="job_url"
                type="url"
                value={formData.job_url}
                onChange={(e) => handleInputChange('job_url', e.target.value)}
                placeholder="https://company.com/job/123"
              />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => handleInputChange('salary_min', e.target.value)}
                  placeholder="80000"
                />
              </div>
              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => handleInputChange('salary_max', e.target.value)}
                  placeholder="120000"
                />
              </div>
              <div>
                <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range (Text)
                </label>
                <Input
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="$80k - $120k"
                />
              </div>
            </div>
          </div>

          {/* Aligned Sectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aligned Sectors
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a sector (e.g., Technology, Finance)"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddSector} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.aligned_sectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.aligned_sectors.map((sector) => (
                  <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                    {sector}
                    <button
                      type="button"
                      onClick={() => handleRemoveSector(sector)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Paste or enter the job description..."
              rows={4}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this job posting..."
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Job Posting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobPostingModal;