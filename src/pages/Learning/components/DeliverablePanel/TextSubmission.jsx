import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';

function TextSubmission({ currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (currentSubmission?.content) {
      setContent(currentSubmission.content);
    }
  }, [currentSubmission]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    // Submit as plain text string
    onSubmit(content);
  };

  return (
    <div className="flex flex-col h-full bg-[#F1F1F1]">
      <div className="flex-1 overflow-y-auto px-[25px] py-[20px]">
        <div className="flex flex-col gap-[15px] w-full">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your response here..."
            rows={8}
            disabled={isLocked || isSubmitting}
            className="w-full px-[11px] py-[8px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20 resize-none"
          />
          <div className="text-xs font-proxima text-carbon-black/50">
            {content.length} characters
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || isLocked}
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
      </div>
    </div>
  );
}

export default TextSubmission;
