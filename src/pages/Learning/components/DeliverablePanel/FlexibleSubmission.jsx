import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

function FlexibleSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit, userId, taskId }) {
  const [submissionType, setSubmissionType] = useState('link');
  const [content, setContent] = useState('');
  const [hasPermission, setHasPermission] = useState('');
  const [validationError, setValidationError] = useState('');

  // Helper function to get localStorage key
  const getLocalStorageKey = () => {
    return `deliverable_draft_${userId}_${taskId}`;
  };

  // Helper function to load draft from localStorage
  const loadDraftFromLocalStorage = () => {
    try {
      const key = getLocalStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading draft from localStorage:', e);
    }
    return null;
  };

  // Helper function to save draft to localStorage
  const saveDraftToLocalStorage = (type, contentValue) => {
    try {
      const key = getLocalStorageKey();
      const draftData = {
        submissionType: type,
        content: contentValue
      };
      localStorage.setItem(key, JSON.stringify(draftData));
    } catch (e) {
      console.error('Error saving draft to localStorage:', e);
    }
  };

  // Helper function to clear draft from localStorage
  const clearDraftFromLocalStorage = () => {
    try {
      const key = getLocalStorageKey();
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error clearing draft from localStorage:', e);
    }
  };

  // Initialize from existing submission or localStorage draft
  useEffect(() => {
    let hasSubmission = false;
    
    if (currentSubmission?.content) {
      hasSubmission = true;
      try {
        // Try to parse as JSON (legacy format)
        const parsedContent = JSON.parse(currentSubmission.content);
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          setSubmissionType(parsedContent[0].type || 'link');
          setContent(parsedContent[0].content || '');
        } else if (typeof parsedContent === 'object' && parsedContent.content) {
          setSubmissionType(parsedContent.type || 'link');
          setContent(parsedContent.content || '');
        }
      } catch (e) {
        // Plain text content - determine type based on content
        const contentStr = currentSubmission.content;
        let detectedType = 'link';
        
        try {
          const url = new URL(contentStr);
          if (url.hostname.includes('loom.com')) {
            detectedType = 'video';
          } else {
            detectedType = 'link';
          }
        } catch (urlError) {
          // Not a URL, probably text
          if (contentStr && contentStr.length > 100 && !contentStr.startsWith('http')) {
            detectedType = 'text';
          }
        }
        
        setSubmissionType(detectedType);
        setContent(contentStr);
      }
    }
    
    // If no submission exists, try to load draft from localStorage
    if (!hasSubmission) {
      const draftData = loadDraftFromLocalStorage();
      if (draftData) {
        console.log('Loaded draft from localStorage for task', taskId);
        setSubmissionType(draftData.submissionType || 'link');
        setContent(draftData.content || '');
      }
    }
  }, [currentSubmission, userId, taskId]);

  const handleTypeChange = (type) => {
    setSubmissionType(type);
    setContent('');
    setValidationError('');
    
    // Clear draft when changing type (don't save empty state)
    clearDraftFromLocalStorage();
  };

  const handleContentChange = (value) => {
    setContent(value);
    
    // Save to localStorage (only if no submission exists yet)
    if (!currentSubmission) {
      saveDraftToLocalStorage(submissionType, value);
    }
    
    if (validationError) {
      setValidationError('');
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isLoomUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('loom.com');
    } catch (e) {
      return false;
    }
  };

  const validateSubmission = () => {
    if (!content.trim()) {
      return 'Please enter your submission content';
    }

    if (submissionType === 'link' || submissionType === 'video') {
      if (!isValidUrl(content)) {
        return 'Please enter a valid URL';
      }
    }

    if (submissionType === 'video' && !isLoomUrl(content)) {
      return 'Please enter a valid Loom video URL (loom.com)';
    }

    return null;
  };

  const handleSubmit = () => {
    const error = validateSubmission();
    if (error) {
      setValidationError(error);
      return;
    }

    // Clear draft from localStorage before submitting
    clearDraftFromLocalStorage();
    
    // Submit the content directly (backend expects plain string)
    onSubmit(content);
  };

  const isFormComplete = () => {
    if (!content.trim()) return false;
    
    if (submissionType === 'link' || submissionType === 'video') {
      return isValidUrl(content);
    }
    
    if (submissionType === 'video') {
      return isLoomUrl(content);
    }
    
    return true;
  };

  return (
    <div className="flex flex-col h-full bg-[#F1F1F1]">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-[25px] py-[20px]">
        <div className="flex flex-col gap-[25px] w-full">
          
          {/* Upload Unit */}
          <div className="flex flex-col gap-[15px]">
            {/* Toggle Button Group */}
            <div className="flex items-center w-[140px] h-[28px] bg-[#E3E3E3] rounded-[100px] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.15)]">
                <button
                  onClick={() => handleTypeChange('link')}
                  disabled={isLocked}
                  className={`flex items-center justify-center px-[15px] py-[10px] h-[28px] rounded-[100px] transition-colors font-proxima text-[16px] leading-[18px] ${
                    submissionType === 'link'
                      ? 'bg-pursuit-purple text-[#F1F1F1]'
                      : 'bg-transparent text-carbon-black'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Link
                </button>
                <button
                  onClick={() => handleTypeChange('text')}
                  disabled={isLocked}
                  className={`flex items-center justify-center px-[15px] py-[10px] h-[28px] rounded-[100px] transition-colors font-proxima text-[16px] leading-[18px] ${
                    submissionType === 'text'
                      ? 'bg-pursuit-purple text-[#F1F1F1]'
                      : 'bg-transparent text-carbon-black'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Upload
                </button>
              </div>

              {/* Input Field */}
              <div className="relative w-full">
                {submissionType === 'text' ? (
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your text submission here..."
                    rows={5}
                    disabled={isLocked || isSubmitting}
                    className="w-full px-[11px] py-[4px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20 resize-none"
                  />
                ) : (
                  <Input
                    type="url"
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Copy and paste your link here..."
                    disabled={isLocked || isSubmitting}
                    className="w-full h-[35px] px-[11px] py-[4px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20"
                  />
                )}
              </div>

              {/* Validation messages */}
              {content && !isValidUrl(content) && (submissionType === 'link' || submissionType === 'video') && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-proxima">Please enter a valid URL</p>
                </div>
              )}
              
            {content && isValidUrl(content) && (
              <a 
                href={content} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs text-pursuit-purple hover:text-pursuit-purple/80 font-proxima"
              >
                View shared document in new tab
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            
            {/* Submission Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormComplete() || isSubmitting || isLocked}
              className={cn(
                "flex items-center justify-center px-[20px] py-[5px] h-[32px] bg-pursuit-purple rounded-[100px]",
                "text-[16px] leading-[18px] font-proxima font-normal text-[#F1F1F1]",
                "hover:bg-pursuit-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : currentSubmission ? (
                'Update Submission'
              ) : (
                'Submit'
              )}
            </Button>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-xs text-red-600 font-proxima">
                {validationError}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlexibleSubmission;
