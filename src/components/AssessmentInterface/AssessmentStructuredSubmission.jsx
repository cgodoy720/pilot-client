import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Loader2, Video, ExternalLink, Upload, File, X } from 'lucide-react';
import AnimatedSubmitButton from './AnimatedSubmitButton';

function AssessmentStructuredSubmission({ task, schema, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState('');
  const [dragActive, setDragActive] = useState({});
  const fileInputRefs = useRef({});

  // Initialize form data from schema and existing submission
  useEffect(() => {
    const initialData = {};
    
    // Try to parse existing submission if it exists
    let existingData = {};
    if (currentSubmission?.submission_data) {
      try {
        // Assessment submissions store data differently than regular tasks
        existingData = currentSubmission.submission_data;
      } catch (e) {
        console.log('Could not parse assessment submission data');
      }
    }
    
    // Initialize each field from schema
    schema.fields.forEach(field => {
      if (field.type === 'file_upload') {
        // For file uploads, initialize as empty array
        initialData[field.name] = existingData[field.name] || [];
      } else {
        initialData[field.name] = existingData[field.name] || '';
      }
    });
    
    setFormData(initialData);
  }, [schema, currentSubmission]);

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Loom URL validation functions
  const isValidLoomUrl = (url) => {
    const loomPatterns = [
      /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/,
      /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/
    ];
    
    return loomPatterns.some(pattern => pattern.test(url));
  };

  const getLoomEmbedUrl = (url) => {
    if (!isValidLoomUrl(url)) return null;
    
    // Extract video ID from various Loom URL formats
    const shareMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    const embedMatch = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
    
    const videoId = shareMatch?.[1] || embedMatch?.[1];
    if (videoId) {
      return `https://www.loom.com/embed/${videoId}`;
    }
    
    return null;
  };

  // File upload helper functions
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content: content,
          encoding: 'text',
          uploadedAt: new Date().toISOString()
        });
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (files, fieldName) => {
    const allowedTypes = [
      'text/html',
      'text/css', 
      'text/javascript',
      'application/javascript',
      'text/x-python-script',
      'text/x-python',
      'application/x-python-code',
      'text/plain'
    ];

    const allowedExtensions = ['.html', '.css', '.js', '.py', '.txt', '.md'];

    const validFiles = Array.from(files).filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setValidationError('Some files were not uploaded. Please only upload HTML, CSS, JS, Python, or text files under 10MB.');
      return;
    }

    try {
      const filesWithContent = await Promise.all(
        validFiles.map(file => readFileContent(file))
      );

      const currentFiles = formData[fieldName] || [];
      const newFormData = {
        ...formData,
        [fieldName]: [...currentFiles, ...filesWithContent]
      };
      
      setFormData(newFormData);
      if (validationError) {
        setValidationError('');
      }
    } catch (error) {
      setValidationError(`Error reading files: ${error.message}`);
    }
  };

  const removeFile = (fieldName, index) => {
    const currentFiles = formData[fieldName] || [];
    setFormData(prev => ({
      ...prev,
      [fieldName]: currentFiles.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [fieldName]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = async (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fieldName]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files, fieldName);
    }
  };

  const isValidGithubUrl = (url) => {
    if (!url || !url.trim()) return true; // Optional field
    const githubPattern = /^https:\/\/(github\.com|www\.github\.com)\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url.trim());
  };

  const validateForm = () => {
    // Check all required fields
    for (const field of schema.fields) {
      if (field.required) {
        const value = formData[field.name];
        
        if (field.type === 'file_upload') {
          // For file uploads, check if array exists and has at least one file
          if (!value || !Array.isArray(value) || value.length === 0) {
            return `Please upload at least one file for "${field.label}"`;
          }
        } else {
          // For text fields, check if non-empty
          if (!value || !value.toString().trim()) {
            return `Please fill in the "${field.label}" field`;
          }
        }
      }
      
      // Special validation for Loom URLs
      if (field.type === 'loom_url' && formData[field.name]?.trim()) {
        if (!isValidLoomUrl(formData[field.name])) {
          return `Please enter a valid Loom video URL (e.g., https://www.loom.com/share/...)`;
        }
      }
      
      // Special validation for GitHub URLs
      if (field.type === 'url' && formData[field.name]?.trim()) {
        // Check if this is a GitHub URL field (optional)
        if (field.name === 'githubUrl' && !isValidGithubUrl(formData[field.name])) {
          return `Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)`;
        }
      }
    }
    return null;
  };

  const handleSubmit = () => {
    // Validate
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    // Submit as JSON object
    onSubmit(formData);
  };

  const renderField = (field) => {
    const isRequired = field.required;
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={field.rows || 4}
            disabled={isLocked || isSubmitting}
            className="resize-none font-proxima"
          />
        );
      
      case 'loom_url':
        return (
          <div className="space-y-3">
            {/* Instructions for Loom URL */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800 font-proxima">Record Your Pitch</h4>
              </div>
              <p className="text-xs text-blue-700 font-proxima mb-2">
                Record a pitch describing your coffee shop AI solution to showcase your thinking 
                and communication skills. No slides or preparation needed - just speak naturally 
                about your solution.
              </p>
              <a 
                href="https://www.loom.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-proxima"
              >
                <ExternalLink className="w-3 h-3" />
                Need to record? Visit Loom.com
              </a>
            </div>
            
            {/* URL Input */}
            <Input
              type="url"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ''}
              disabled={isLocked || isSubmitting}
              className="font-proxima"
            />
            
            {/* Validation Error */}
            {value && !isValidLoomUrl(value) && (
              <p className="text-xs text-red-600 font-proxima">
                Please enter a valid Loom video URL (e.g., https://www.loom.com/share/...)
              </p>
            )}
            
            {/* Video Preview */}
            {value && isValidLoomUrl(value) && !isLocked && (
              <div className="space-y-2">
                <label className="block text-sm font-medium font-proxima text-carbon-black">
                  Video Preview
                </label>
                <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                  <iframe
                    src={getLoomEmbedUrl(value)}
                    frameBorder="0"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-xs text-carbon-black/60 font-proxima">
                  Preview of your Loom video. Make sure it plays correctly before submitting.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'file_upload':
        const files = Array.isArray(value) ? value : [];
        const isDragActive = dragActive[field.name] || false;
        
        // Get or create ref for this field
        if (!fileInputRefs.current[field.name]) {
          fileInputRefs.current[field.name] = React.createRef();
        }
        
        return (
          <div className="space-y-3">
            {/* File Upload Dropzone */}
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                isDragActive 
                  ? 'border-pursuit-purple bg-purple-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${isLocked || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={(e) => handleDrag(e, field.name)}
              onDragLeave={(e) => handleDrag(e, field.name)}
              onDragOver={(e) => handleDrag(e, field.name)}
              onDrop={(e) => handleDrop(e, field.name)}
              onClick={() => !isLocked && !isSubmitting && fileInputRefs.current[field.name]?.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-proxima text-carbon-black mb-1">
                Drag & drop files here or click to browse
              </p>
              <p className="text-xs font-proxima text-carbon-black/60">
                Supported: HTML, CSS, JS, Python, TXT, MD files (max 10MB each)
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRefs.current[field.name]}
              type="file"
              multiple
              accept=".html,.css,.js,.py,.txt,.md"
              onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  await handleFileUpload(e.target.files, field.name);
                  // Reset input so same file can be selected again
                  e.target.value = '';
                }
              }}
              style={{ display: 'none' }}
              disabled={isLocked || isSubmitting}
            />

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium font-proxima text-carbon-black">
                  Uploaded Files ({files.length})
                </label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-proxima text-carbon-black truncate">
                            {file.name}
                          </p>
                          <p className="text-xs font-proxima text-carbon-black/60">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => removeFile(field.name, index)}
                          disabled={isSubmitting}
                          className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-proxima text-carbon-black/60">
                  Total size: {formatFileSize(files.reduce((sum, f) => sum + (f.size || 0), 0))}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'text':
      case 'url':
        return (
          <Input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
            className="font-proxima"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
            className="font-proxima"
          />
        );
    }
  };

  const isFormComplete = () => {
    return schema.fields
      .filter(f => f.required)
      .every(f => {
        const value = formData[f.name];
        
        // Special handling for file uploads
        if (f.type === 'file_upload') {
          return Array.isArray(value) && value.length > 0;
        }
        
        // Special validation for Loom URLs
        if (f.type === 'loom_url') {
          return value?.trim() && isValidLoomUrl(value);
        }
        
        // Special validation for GitHub URLs (optional)
        if (f.type === 'url' && f.name === 'githubUrl') {
          return !value || !value.trim() || isValidGithubUrl(value);
        }
        
        // For text fields, check if non-empty
        return value && value.toString().trim();
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {schema.fields.map(field => (
          <div key={field.name} className="space-y-2">
            <label className={`block text-sm font-medium font-proxima text-carbon-black ${field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}>
              {field.label}
            </label>
            
            {renderField(field)}
            
            {field.help && (
              <p className="text-xs text-carbon-black/60 font-proxima">
                {field.help}
              </p>
            )}
            
            {field.type === 'textarea' && (
              <p className="text-xs text-carbon-black/40 font-proxima">
                {(formData[field.name] || '').length} characters
              </p>
            )}
          </div>
        ))}

        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs text-red-600 font-proxima">
              {validationError}
            </p>
          </div>
        )}

        {!isFormComplete() && !isLocked && (
          <p className="text-xs text-carbon-black/60 font-proxima">
            All required fields (*) must be completed before submitting.
          </p>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="border-t border-divider px-6 py-4">
        <AnimatedSubmitButton
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting || isLocked}
          isLoading={isSubmitting}
          className="w-full bg-pursuit-purple hover:bg-pursuit-purple/90 text-white font-proxima text-sm"
        >
          Submit Assessment
        </AnimatedSubmitButton>
      </div>
    </div>
  );
}

export default AssessmentStructuredSubmission;
