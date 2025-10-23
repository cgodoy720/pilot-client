// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FaUpload, FaVideo, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import './ResubmissionPanel.css';

function ResubmissionPanel({ 
  assessmentType, 
  resubmissionType, 
  existingSubmission, 
  onSubmit, 
  onCancel, 
  isLoading 
}) {
  const [resubmissionData, setResubmissionData] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Initialize with existing data
    if (existingSubmission) {
      setResubmissionData(existingSubmission.submission_data || {});
    }
  }, [existingSubmission]);

  useEffect(() => {
    // Check if resubmission is complete based on type
    let complete = false;
    if (resubmissionType === 'files_only' && resubmissionData.files && resubmissionData.files.length > 0) {
      complete = true;
    } else if (resubmissionType === 'video_only' && resubmissionData.loomUrl) {
      complete = true;
    } else if (resubmissionType === 'files_and_video' && 
               resubmissionData.files && resubmissionData.files.length > 0 && 
               resubmissionData.loomUrl) {
      complete = true;
    }
    setIsComplete(complete);
  }, [resubmissionData, resubmissionType]);

  const handleFileUpload = async (files) => {
    // Reuse the file upload logic from TechnicalSubmission
    const allowedTypes = [
      'text/html', 'text/css', 'text/javascript', 'application/javascript',
      'text/x-python-script', 'text/x-python', 'application/x-python-code',
      'text/plain', '.py', '.js', '.html', '.css', '.txt', '.md'
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

    // Read file contents
    const filesWithContent = await Promise.all(
      validFiles.map(file => readFileContent(file))
    );

    setResubmissionData(prev => ({
      ...prev,
      files: filesWithContent
    }));
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content: e.target.result,
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

  const handleVideoUrlChange = (url) => {
    setResubmissionData(prev => ({
      ...prev,
      loomUrl: url
    }));
  };

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit(resubmissionData);
    }
  };

  const getResubmissionMessage = () => {
    switch (resubmissionType) {
      case 'files_only':
        return 'We need you to resubmit your project files. Your conversation and other data will be preserved.';
      case 'video_only':
        return 'We need you to resubmit your video presentation. Your other submission data will be preserved.';
      case 'files_and_video':
        return 'We need you to resubmit both your project files and video presentation.';
      default:
        return 'Please resubmit the required items for this assessment.';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="resubmission-panel">
      <div className="resubmission-panel__header">
        <div className="resubmission-panel__icon">
          <FaExclamationTriangle />
        </div>
        <div className="resubmission-panel__title">
          <h2>Resubmission Required</h2>
          <p className="resubmission-panel__subtitle">
            {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Assessment - Week 2
          </p>
        </div>
      </div>

      <div className="resubmission-panel__content">
        <div className="resubmission-panel__message">
          <p>{getResubmissionMessage()}</p>
          <p className="resubmission-panel__deadline">
            <strong>Deadline:</strong> September 21, 2025 at 11:59 PM
          </p>
        </div>

        {/* File Upload Section */}
        {(resubmissionType === 'files_only' || resubmissionType === 'files_and_video') && (
          <div className="resubmission-panel__section">
            <h3>
              <FaUpload className="section-icon" />
              Upload Your Project Files
            </h3>
            
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                accept=".html,.css,.js,.py,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="file-input"
                disabled={isLoading}
              />
              <div className="file-upload-text">
                <p>Select your HTML, CSS, JS, and Python files</p>
                <p className="file-upload-help">Max 10MB per file</p>
              </div>
            </div>

            {resubmissionData.files && resubmissionData.files.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files ({resubmissionData.files.length})</h4>
                {resubmissionData.files.map((file, index) => (
                  <div key={index} className="uploaded-file">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <FaCheck className="file-check" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video URL Section */}
        {(resubmissionType === 'video_only' || resubmissionType === 'files_and_video') && (
          <div className="resubmission-panel__section">
            <h3>
              <FaVideo className="section-icon" />
              Update Your Video Presentation
            </h3>
            
            <div className="video-input-area">
              <label htmlFor="loomUrl">Loom Video URL</label>
              <input
                id="loomUrl"
                type="url"
                value={resubmissionData.loomUrl || ''}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="https://www.loom.com/share/..."
                className="video-url-input"
                disabled={isLoading}
              />
              <p className="video-input-help">
                Please ensure your video has clear audio and covers the full presentation.
              </p>
            </div>
          </div>
        )}

        <div className="resubmission-panel__actions">
          <button
            onClick={onCancel}
            className="resubmission-panel__btn resubmission-panel__btn--cancel"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`resubmission-panel__btn resubmission-panel__btn--submit ${isComplete ? 'ready' : 'disabled'}`}
            disabled={!isComplete || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Resubmission'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResubmissionPanel;
