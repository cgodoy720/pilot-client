import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';

const EmailPreviewSheet = ({ isOpen, onClose, previews, selectedUsers }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Email Previews</SheetTitle>
          <SheetDescription>
            Previewing {previews.length} of {selectedUsers.length} selected recipients
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {previews.map((preview) => (
              <Card key={preview.user_id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {preview.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {preview.email}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        preview.status === 'preview_ready' ? 'default' :
                        preview.status === 'no_feedback' ? 'secondary' : 'destructive'
                      }
                      className="shrink-0"
                    >
                      {preview.status === 'preview_ready' ? '✅ Ready' : 
                       preview.status === 'no_feedback' ? '⚠️ No Feedback' : 
                       '❌ Error'}
                    </Badge>
                  </div>
                </CardHeader>
                
                {preview.status === 'preview_ready' && preview.preview && (
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                      <p className="text-sm font-medium">{preview.preview.subject}</p>
                    </div>
                    
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/30 px-3 py-2 border-b">
                        <p className="text-xs font-medium text-muted-foreground">Email Preview</p>
                      </div>
                      <ScrollArea className="h-80">
                        <div 
                          className="p-4 bg-white text-black font-sans text-sm"
                          dangerouslySetInnerHTML={{ __html: preview.preview.html }}
                        />
                      </ScrollArea>
                    </div>
                  </CardContent>
                )}
                
                {preview.status === 'no_feedback' && (
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          No Assessment Feedback
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          This user has no feedback data. Email will be skipped.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
                
                {preview.status === 'preview_error' && (
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <span className="text-2xl">❌</span>
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Preview Error
                        </p>
                        <p className="text-xs text-destructive/80">
                          Unable to generate preview for this user.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
            
            {previews.length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm">No previews generated yet</p>
                  <p className="text-xs mt-1">Click "Generate Preview" in the main modal</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default EmailPreviewSheet;

