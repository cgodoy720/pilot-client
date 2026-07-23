import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const VALID_VIDEO_DOMAINS = ['loom.com', 'youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com'];

function VideoSubmission({ currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (currentSubmission?.content) {
      setVideoUrl(currentSubmission.content);
    }
  }, [currentSubmission]);

  const isValidVideoUrl = (value) => {
    try {
      const url = new URL(value);
      return VALID_VIDEO_DOMAINS.some((domain) => url.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!videoUrl.trim() || !isValidVideoUrl(videoUrl)) return;
    // Submit as plain URL string
    onSubmit(videoUrl.trim());
  };

  return (
    <div className="flex flex-col h-full bg-[#F1F1F1]">
      <div className="flex-1 overflow-y-auto px-[25px] py-[20px]">
        <div className="flex flex-col gap-[15px] w-full">
          <Input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.loom.com/share/..."
            disabled={isLocked || isSubmitting}
            className="w-full h-[35px] px-[11px] py-[4px] bg-white rounded-[10px] text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-0 focus:outline-none focus:ring-2 focus:ring-pursuit-purple/20"
          />
          <p className="text-xs font-proxima text-carbon-black/60">
            Paste your Loom, YouTube, Vimeo, or Google Drive link. Make sure it&apos;s set to &quot;Anyone with the link can view&quot;.
          </p>

          {videoUrl && !isValidVideoUrl(videoUrl) && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-proxima">Please enter a valid video URL (Loom, YouTube, Vimeo, or Google Drive)</p>
            </div>
          )}
          {videoUrl && isValidVideoUrl(videoUrl) && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-pursuit-purple hover:text-pursuit-purple/80 font-proxima"
            >
              Open video in new tab
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!videoUrl.trim() || !isValidVideoUrl(videoUrl) || isSubmitting || isLocked}
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

export default VideoSubmission;
