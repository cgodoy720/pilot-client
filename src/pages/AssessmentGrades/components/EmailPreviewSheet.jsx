import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';

const EmailPreviewSheet = ({ isOpen, onClose, previews, selectedUsers }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to first preview when previews change
  useEffect(() => {
    setActiveIndex(0);
  }, [previews]);

  const activePreview = previews[activeIndex] || null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-hidden flex flex-col p-0">
        <div className="px-6 pt-6 pb-0">
          <SheetHeader>
            <SheetTitle>Email Preview</SheetTitle>
            <SheetDescription>
              Previewing {previews.length} of {selectedUsers.length} selected recipients
            </SheetDescription>
          </SheetHeader>

          {/* Recipient pills */}
          {previews.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {previews.map((preview, index) => {
                const isActive = index === activeIndex;
                const hasError = preview.status !== 'preview_ready';
                return (
                  <button
                    key={preview.user_id}
                    onClick={() => setActiveIndex(index)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-colors cursor-pointer border
                      ${isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                      }
                      ${hasError && !isActive ? 'opacity-60' : ''}
                    `}
                  >
                    {hasError && <span className="text-xs">{preview.status === 'no_feedback' ? '!' : 'x'}</span>}
                    {preview.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview area */}
        <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 pt-4">
          {activePreview ? (
            <>
              {/* Subject bar */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">To: {activePreview.email}</p>
                  {activePreview.preview?.subject && (
                    <p className="text-sm font-medium truncate">{activePreview.preview.subject}</p>
                  )}
                </div>
                <Badge
                  variant={
                    activePreview.status === 'preview_ready' ? 'default' :
                    activePreview.status === 'no_feedback' ? 'secondary' : 'destructive'
                  }
                  className="shrink-0"
                >
                  {activePreview.status === 'preview_ready' ? 'Ready' :
                   activePreview.status === 'no_feedback' ? 'No Feedback' :
                   'Error'}
                </Badge>
              </div>

              {/* Email HTML render */}
              {activePreview.status === 'preview_ready' && activePreview.preview ? (
                <div className="flex-1 min-h-0 border border-border rounded-lg overflow-auto bg-[#f4f4f7]">
                  <div
                    className="font-sans text-sm"
                    dangerouslySetInnerHTML={{ __html: activePreview.preview.html }}
                  />
                </div>
              ) : activePreview.status === 'no_feedback' ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg max-w-sm">
                    <p className="text-sm font-medium text-amber-900 mb-1">No Assessment Feedback</p>
                    <p className="text-xs text-amber-700">This user has no feedback data. Email will be skipped.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6 bg-destructive/10 border border-destructive/20 rounded-lg max-w-sm">
                    <p className="text-sm font-medium text-destructive mb-1">Preview Error</p>
                    <p className="text-xs text-destructive/80">Unable to generate preview for this user.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No previews generated yet</p>
                <p className="text-xs mt-1">Click "Generate Preview" in the main modal</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmailPreviewSheet;
