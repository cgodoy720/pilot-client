import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';

function FlexibleSubmission({ task, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [submissionType, setSubmissionType] = useState('link');
  const [content, setContent] = useState('');
  const [hasPermission, setHasPermission] = useState('');
  const [validationError, setValidationError] = useState('');

  // Initialize from existing submission
  useEffect(() => {
    if (currentSubmission?.content) {
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
  }, [currentSubmission]);

  const handleTypeChange = (type) => {
    setSubmissionType(type);
    setContent('');
    setValidationError('');
  };

  const handleContentChange = (value) => {
    setContent(value);
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Type Selector - Styled like Figma */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange('link')}
              disabled={isLocked}
              className={`flex-1 px-4 py-2 rounded-md font-proxima text-sm font-medium transition-colors ${
                submissionType === 'link'
                  ? 'bg-pursuit-purple text-white'
                  : 'bg-gray-100 text-carbon-black hover:bg-gray-200'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Link
            </button>
            <button
              onClick={() => handleTypeChange('text')}
              disabled={isLocked}
              className={`flex-1 px-4 py-2 rounded-md font-proxima text-sm font-medium transition-colors ${
                submissionType === 'text'
                  ? 'bg-pursuit-purple text-white'
                  : 'bg-gray-100 text-carbon-black hover:bg-gray-200'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Upload
            </button>
          </div>
        </div>

        {/* Content Input Area */}
        <div className="space-y-3">
          {submissionType === 'text' ? (
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter your text submission here..."
                rows={8}
                disabled={isLocked || isSubmitting}
                className="resize-none font-proxima text-sm"
              />
            </div>
          ) : submissionType === 'video' ? (
            <div className="space-y-3">
              <Input
                type="url"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Paste your Loom video URL here (e.g., https://loom.com/share/...)"
                disabled={isLocked || isSubmitting}
                className="font-proxima text-sm"
              />
              
              {content && !isValidUrl(content) && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-proxima">Please enter a valid URL</p>
                </div>
              )}
              
              {content && isValidUrl(content) && !isLoomUrl(content) && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-proxima">Please enter a Loom video URL (loom.com)</p>
                </div>
              )}
              
              {content && isValidUrl(content) && isLoomUrl(content) && (
                <div className="space-y-3">
                  <div className="aspect-video bg-carbon-black/5 rounded-lg overflow-hidden">
                    <iframe 
                      src={content.includes('/share/') ? content.replace('/share/', '/embed/') : content} 
                      frameBorder="0" 
                      allowFullScreen
                      className="w-full h-full"
                      title="Loom video preview"
                    ></iframe>
                  </div>
                  <a 
                    href={content} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs text-pursuit-purple hover:text-pursuit-purple/80 font-proxima"
                  >
                    View Loom video in new tab
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="url"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Copy and paste your link here..."
                disabled={isLocked || isSubmitting}
                className="font-proxima text-sm"
              />
              
              {content && !isValidUrl(content) && (
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
            </div>
          )}
        </div>

        {/* Permission Question - Like in Figma */}
        <div className="space-y-3 pt-2">
          <p className="text-sm font-proxima text-carbon-black font-medium">
            Did you give us permission?
          </p>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="permission"
                value="yes"
                checked={hasPermission === 'yes'}
                onChange={(e) => setHasPermission(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-4 h-4 text-pursuit-purple focus:ring-pursuit-purple"
              />
              <span className="text-sm font-proxima text-carbon-black">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="permission"
                value="no"
                checked={hasPermission === 'no'}
                onChange={(e) => setHasPermission(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-4 h-4 text-pursuit-purple focus:ring-pursuit-purple"
              />
              <span className="text-sm font-proxima text-carbon-black">No</span>
            </label>
          </div>
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

      {/* Submit Button - Fixed at bottom */}
      <div className="border-t border-divider px-6 py-4">
        <Button
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting || isLocked}
          className="w-full bg-pursuit-purple hover:bg-pursuit-purple/90 text-white font-proxima text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Deliverable'}`
          )}
        </Button>
      </div>
    </div>
  );
}

export default FlexibleSubmission;
