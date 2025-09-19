import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaGithub, FaFile, FaTimes } from 'react-icons/fa';

function TechnicalSubmission({ submissionData, isDraft, isLoading, onUpdate, onSubmit }) {
  const [formData, setFormData] = useState({
    submissionType: 'files', // 'files', 'github', 'both'
    files: [],
    githubUrl: '',
    conversationText: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data
  useEffect(() => {
    if (submissionData) {
      setFormData({
        submissionType: submissionData.submissionType || 'files',
        files: submissionData.files || [],
        githubUrl: submissionData.githubUrl || '',
        conversationText: submissionData.conversationText || ''
      });
    }
  }, [submissionData]);


  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    
    // Update parent state immediately (no auto-save)
    onUpdate(newFormData);
  };

  const handleFileUpload = async (files) => {
    const allowedTypes = [
      'text/html',
      'text/css', 
      'text/javascript',
      'application/javascript',
      'text/x-python-script',
      'text/x-python',
      'application/x-python-code',
      'text/plain',
      '.py',
      '.js',
      '.html',
      '.css',
      '.txt',
      '.md'
    ];

    const validFiles = Array.from(files).filter(file => {
      const isValidType = allowedTypes.some(type => 
        file.type === type || file.name.toLowerCase().endsWith(type.replace('text/', '.').replace('application/', '.'))
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not uploaded. Please only upload HTML, CSS, JS, Python, or text files under 10MB.');
    }

    // Read file contents for all valid files
    const filesWithContent = await Promise.all(
      validFiles.map(file => readFileContent(file))
    );

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...filesWithContent]
    }));
  };

  // Helper function to read file content
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
          content: content, // ✅ Store actual file content
          encoding: 'text', // All our supported files are text-based
          uploadedAt: new Date().toISOString()
        });
      };
      
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      // Read as text since all our supported file types are text-based
      reader.readAsText(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidGithubUrl = (url) => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  const handleSubmit = () => {
    // Validate based on submission type
    if (formData.submissionType === 'files' && formData.files.length === 0) {
      alert('Please upload at least one file.');
      return;
    }
    
    if (formData.submissionType === 'github' && !isValidGithubUrl(formData.githubUrl)) {
      alert('Please provide a valid GitHub repository URL.');
      return;
    }
    
    if (formData.submissionType === 'both' && (formData.files.length === 0 || !isValidGithubUrl(formData.githubUrl))) {
      alert('Please provide both files and a valid GitHub repository URL.');
      return;
    }

    if (!formData.conversationText.trim()) {
      alert('Please paste your full conversation with the AI tool.');
      return;
    }

    // Submit with current form data
    onSubmit(formData);
  };

  const isComplete = () => {
    const hasConversation = formData.conversationText.trim();
    
    if (formData.submissionType === 'files') {
      return hasConversation && formData.files.length > 0;
    } else if (formData.submissionType === 'github') {
      return hasConversation && isValidGithubUrl(formData.githubUrl);
    } else if (formData.submissionType === 'both') {
      return hasConversation && formData.files.length > 0 && isValidGithubUrl(formData.githubUrl);
    }
    return false;
  };

  return (
    <div className="submission-form">
      {/* Submission Type Selection */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          How would you like to submit your work? *
        </label>
        <div className="submission-form__radio-group">
          <label className="submission-form__radio">
            <input
              type="radio"
              name="submissionType"
              value="files"
              checked={formData.submissionType === 'files'}
              onChange={(e) => handleChange('submissionType', e.target.value)}
              disabled={!isDraft || isLoading}
            />
            <FaFile /> File Upload Only
          </label>
          <label className="submission-form__radio">
            <input
              type="radio"
              name="submissionType"
              value="github"
              checked={formData.submissionType === 'github'}
              onChange={(e) => handleChange('submissionType', e.target.value)}
              disabled={!isDraft || isLoading}
            />
            <FaGithub /> GitHub Repository Only
          </label>
          <label className="submission-form__radio">
            <input
              type="radio"
              name="submissionType"
              value="both"
              checked={formData.submissionType === 'both'}
              onChange={(e) => handleChange('submissionType', e.target.value)}
              disabled={!isDraft || isLoading}
            />
            <FaUpload /> Both Files and GitHub
          </label>
        </div>
      </div>

      {/* File Upload Section */}
      {(formData.submissionType === 'files' || formData.submissionType === 'both') && (
        <div className="submission-form__field">
          <label className="submission-form__label">
            Upload Your Files *
          </label>
          
          <div
            className={`submission-form__dropzone ${dragActive ? 'submission-form__dropzone--active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="submission-form__dropzone-icon" />
            <p>Drag & drop files here or click to browse</p>
            <p className="submission-form__dropzone-help">
              Supported: HTML, CSS, JS, Python files (max 10MB each)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".html,.css,.js,.py,.txt,.md"
            onChange={async (e) => await handleFileUpload(e.target.files)}
            style={{ display: 'none' }}
            disabled={!isDraft || isLoading}
          />

          {formData.files.length > 0 && (
            <div className="submission-form__file-list">
              {formData.files.map((file, index) => (
                <div key={index} className="submission-form__file-item">
                  <div className="submission-form__file-info">
                    <FaFile className="submission-form__file-icon" />
                    <div>
                      <div className="submission-form__file-name">{file.name}</div>
                      <div className="submission-form__file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  {isDraft && (
                    <button
                      onClick={() => removeFile(index)}
                      className="submission-form__file-remove"
                      disabled={isLoading}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GitHub URL Section */}
      {(formData.submissionType === 'github' || formData.submissionType === 'both') && (
        <div className="submission-form__field">
          <label className="submission-form__label">
            GitHub Repository URL *
          </label>
          <input
            type="url"
            className="submission-form__input"
            value={formData.githubUrl}
            onChange={(e) => handleChange('githubUrl', e.target.value)}
            placeholder="https://github.com/username/repository"
            disabled={!isDraft || isLoading}
          />
          <div className="submission-form__help">
            Provide a link to your public GitHub repository containing your project.
          </div>
          {formData.githubUrl && !isValidGithubUrl(formData.githubUrl) && (
            <div className="submission-form__error">
              Please enter a valid GitHub repository URL.
            </div>
          )}
        </div>
      )}

      {/* AI Conversation Section */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          Full AI Conversation *
        </label>
        <textarea
          className="submission-form__textarea submission-form__textarea--large"
          value={formData.conversationText}
          onChange={(e) => handleChange('conversationText', e.target.value)}
          placeholder="Copy and paste your full conversation with whichever AI tool you used for this project..."
          disabled={!isDraft || isLoading}
          rows={8}
        />
        <div className="submission-form__char-counter">
          {formData.conversationText.length} characters
        </div>
        <div className="submission-form__help">
          Include your complete conversation history with ChatGPT, Claude, or any other AI tool you used.
        </div>
      </div>


      <div className="submission-form__actions">
        {isDraft ? (
          <button
            onClick={handleSubmit}
            disabled={!isComplete() || isLoading}
            className="submission-form__btn submission-form__btn--primary"
          >
            {isLoading ? (
              <>
                <div className="submission-form__spinner" />
                Submitting...
              </>
            ) : (
              'Submit Final Assessment'
            )}
          </button>
        ) : (
          <div className="submission-form__submitted">
            <div className="submission-form__field">
              <label className="submission-form__label">Submission Type</label>
              <div className="submission-form__readonly">
                {formData.submissionType === 'files' && 'File Upload'}
                {formData.submissionType === 'github' && 'GitHub Repository'}
                {formData.submissionType === 'both' && 'Files and GitHub Repository'}
              </div>
            </div>
            
            {(formData.submissionType === 'files' || formData.submissionType === 'both') && (
              <div className="submission-form__field">
                <label className="submission-form__label">Uploaded Files</label>
                <div className="submission-form__readonly">
                  {formData.files.map(file => file.name).join(', ')}
                </div>
              </div>
            )}
            
            {(formData.submissionType === 'github' || formData.submissionType === 'both') && (
              <div className="submission-form__field">
                <label className="submission-form__label">GitHub Repository</label>
                <div className="submission-form__readonly">
                  <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer">
                    {formData.githubUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isComplete() && isDraft && (
          <div className="submission-form__help">
            Please complete all required fields before submitting your assessment.
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicalSubmission;
