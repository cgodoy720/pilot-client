import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Eye } from 'lucide-react';
import TestEmailDialog from './components/TestEmailDialog';
import EmailPreviewSheet from './components/EmailPreviewSheet';
import { toast } from 'sonner';

// Hardcoded fallback options if API fetch fails
const FALLBACK_TEMPLATES = [
  { slug: 'week_2', display_name: 'Week 2 (L1)' },
  { slug: 'l2_week_2', display_name: 'Week 2 (L2)' },
  { slug: 'week_8', display_name: 'Week 8' },
];

const MassEmailModal = ({
  isOpen,
  onClose,
  selectedUsers,
  assessmentGrades,
  authToken,
  onEmailSent
}) => {
  const [emailSubject, setEmailSubject] = useState('Your Week [Week] Assessment Feedback - Great Work, [Builder Name]!');
  const [templateSlug, setTemplateSlug] = useState('week_8');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Filter assessment grades to only show selected users
  const selectedGrades = useMemo(() => {
    const selectedSet = new Set(selectedUsers);
    return assessmentGrades.filter(grade => selectedSet.has(grade.user_id));
  }, [selectedUsers, assessmentGrades]);

  // Fetch active email templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates/assessment-emails/active`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch templates');

        const result = await response.json();
        if (result.success && result.templates.length > 0) {
          setEmailTemplates(result.templates);
        } else {
          setEmailTemplates(FALLBACK_TEMPLATES);
        }
      } catch (err) {
        console.error('Error fetching email templates, using fallback:', err);
        setEmailTemplates(FALLBACK_TEMPLATES);
      } finally {
        setLoadingTemplates(false);
      }
    };

    if (authToken) {
      fetchTemplates();
    }
  }, [authToken]);

  // Reset previews when modal opens or selected users change
  useEffect(() => {
    if (isOpen) {
      setPreviews([]);
    }
  }, [isOpen, selectedUsers]);

  // Derive weekNumber from slug for backward compat in subject line
  const weekNumber = useMemo(() => {
    if (templateSlug === 'week_2' || templateSlug === 'l2_week_2') return '2';
    if (templateSlug === 'week_8') return '8';
    // Extract number from slug for custom templates
    const match = templateSlug?.match(/\d+/);
    return match ? match[0] : '2';
  }, [templateSlug]);

  const handlePreviewEmails = async () => {
    try {
      setLoadingPreviews(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          subject: emailSubject,
          templateSlug,
          weekNumber,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate previews');
      }

      const result = await response.json();
      setPreviews(result.previews);
      setShowPreviewSheet(true);
    } catch (err) {
      console.error('Error generating previews:', err);
      toast.error('Preview Generation Failed', {
        description: 'Failed to generate email previews. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoadingPreviews(false);
    }
  };

  const handleSendEmails = async () => {
    try {
      setSending(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          subject: emailSubject,
          templateSlug,
          weekNumber,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start email job');
      }

      const result = await response.json();

      // Show success message - job has been started
      toast.success('Email Job Started!', {
        description: `Started sending ${selectedUsers.length} assessment feedback emails. Estimated completion: ${result.estimatedTime || 'a few minutes'}.`,
        duration: 6000,
      });

      setSending(false);
      onEmailSent();

    } catch (err) {
      console.error('Error starting email job:', err);
      setSending(false);
      toast.error('Failed to Start Email Job', {
        description: 'Failed to start email sending. Please check your connection and try again.',
        duration: 5000,
      });
    }
  };

  const handleSendTestEmail = () => {
    setShowTestDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Send Assessment Feedback Emails</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {selectedGrades.length} {selectedGrades.length === 1 ? 'Recipient' : 'Recipients'}
              </Badge>
              <span>•</span>
              <span>Personalized with names and feedback</span>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Recipients */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 border border-border rounded-lg p-3 max-h-20 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedGrades.slice(0, 10).map(grade => (
                      <Badge key={grade.user_id} variant="outline" className="font-normal text-xs">
                        {grade.user_first_name} {grade.user_last_name}
                      </Badge>
                    ))}
                    {selectedGrades.length > 10 && (
                      <Badge variant="outline" className="font-normal text-xs">
                        +{selectedGrades.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Configuration */}
            <div className="space-y-4">
              {/* Email Template */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Template</Label>
                <Select value={templateSlug} onValueChange={setTemplateSlug} disabled={loadingTemplates}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTemplates ? 'Loading templates...' : 'Select template'} />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(t => (
                      <SelectItem key={t.slug} value={t.slug}>{t.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject Line
                  <span className="text-muted-foreground text-xs font-normal ml-2">
                    (Use [Builder Name] and [Week] for personalization)
                  </span>
                </Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Your Week [Week] Assessment Feedback - Great Work, [Builder Name]!"
                />
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <Label htmlFor="customMessage" className="text-sm font-medium">
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message to include in all emails..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Preview Button */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Preview Emails</p>
                  <p className="text-xs text-muted-foreground">
                    {previews.length > 0 ? `${previews.length} preview(s) ready` : 'See how emails will look to recipients'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewEmails}
                disabled={loadingPreviews || selectedUsers.length === 0 || sending}
              >
                {loadingPreviews ? 'Generating...' : previews.length > 0 ? 'Regenerate' : 'Generate Preview'}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTestEmail}
              disabled={sending || loadingPreviews}
            >
              Send Test
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSendEmails}
                disabled={sending || !emailSubject || selectedUsers.length === 0}
              >
                {sending ? 'Starting...' : `Send to ${selectedUsers.length}`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <TestEmailDialog
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
        authToken={authToken}
        emailSubject={emailSubject}
        templateSlug={templateSlug}
        weekNumber={weekNumber}
        customMessage={customMessage}
      />

      {/* Email Preview Sheet */}
      <EmailPreviewSheet
        isOpen={showPreviewSheet}
        onClose={() => setShowPreviewSheet(false)}
        previews={previews}
        selectedUsers={selectedUsers}
      />
    </>
  );
};

export default MassEmailModal;
