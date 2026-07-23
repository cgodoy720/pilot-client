import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

// Single-purpose submission form. Each deliverable_type routes to exactly one
// mode (see DeliverablePanel#getSubmissionComponent), so there is no type
// selector — the panel renders only the input the task actually asks for.
// Replaces the old 3-in-1 "FlexibleSubmission" (Link/Text toggle).
const MODE_CONFIG = {
  text: {
    input: 'textarea',
    placeholder: 'Enter your text submission here...',
    isUrl: false,
  },
  link: {
    input: 'url',
    placeholder: 'Copy and paste your link here...',
    isUrl: true,
  },
};

function SubmissionForm({
  mode = 'link',
  currentSubmission,
  isSubmitting,
  isLocked,
  onSubmit,
  userId,
  taskId,
}) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.link;
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState('');

  const getLocalStorageKey = () => `deliverable_draft_${userId}_${taskId}`;

  const loadDraftFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(getLocalStorageKey());
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading draft from localStorage:', e);
    }
    return null;
  };

  const saveDraftToLocalStorage = (contentValue) => {
    try {
      localStorage.setItem(getLocalStorageKey(), JSON.stringify({ content: contentValue }));
    } catch (e) {
      console.error('Error saving draft to localStorage:', e);
    }
  };

  const clearDraftFromLocalStorage = () => {
    try {
      localStorage.removeItem(getLocalStorageKey());
    } catch (e) {
      console.error('Error clearing draft from localStorage:', e);
    }
  };

  // Hydrate from an existing submission (handling legacy JSON shapes) or a
  // locally-saved draft. Mode is fixed by the task, so we only recover content.
  useEffect(() => {
    if (currentSubmission?.content) {
      let value = currentSubmission.content;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          value = parsed[0].content || '';
        } else if (parsed && typeof parsed === 'object' && 'content' in parsed) {
          value = parsed.content || '';
        }
      } catch (e) {
        // Plain string content — use as-is.
      }
      setContent(value);
    } else {
      const draft = loadDraftFromLocalStorage();
      if (draft?.content) setContent(draft.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSubmission, userId, taskId]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
    if (!currentSubmission) {
      saveDraftToLocalStorage(value);
    }
    if (validationError) setValidationError('');
  };

  const validateSubmission = () => {
    if (!content.trim()) return 'Please enter your submission';
    if (config.isUrl && !isValidUrl(content)) return 'Please enter a valid URL';
    return null;
  };

  const isFormComplete = () => {
    if (!content.trim()) return false;
    if (config.isUrl) return isValidUrl(content);
    return true;
  };

  const handleSubmit = () => {
    const error = validateSubmission();
    if (error) {
      setValidationError(error);
      return;
    }
    clearDraftFromLocalStorage();
    // Backend expects plain string content.
    onSubmit(content);
  };

  return (
    <div className="flex flex-col h-full bg-[#F1F1F1]">
      <div className="flex-1 overflow-y-auto px-[25px] py-[20px]">
        <div className="flex flex-col gap-[25px] w-full">
          <div className="flex flex-col gap-[15px]">
            {/* Input Field */}
            <div className="relative w-full">
              {config.input === 'textarea' ? (
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={config.placeholder}
                  rows={5}
                  disabled={isLocked || isSubmitting}
                  className="w-full px-[11px] py-[4px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20 resize-none"
                />
              ) : (
                <Input
                  type="url"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={config.placeholder}
                  disabled={isLocked || isSubmitting}
                  className="w-full h-[35px] px-[11px] py-[4px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20"
                />
              )}
            </div>

            {/* Live URL validation + preview (link mode only) */}
            {config.isUrl && content && !isValidUrl(content) && (
              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-proxima">Please enter a valid URL</p>
              </div>
            )}
            {config.isUrl && content && isValidUrl(content) && (
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
                'flex items-center justify-center px-[20px] py-[5px] h-[32px] bg-pursuit-purple rounded-[100px]',
                'text-[16px] leading-[18px] font-proxima font-normal text-[#F1F1F1]',
                'hover:bg-pursuit-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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
              <p className="text-xs text-red-600 font-proxima">{validationError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionForm;
