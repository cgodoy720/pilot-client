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
import Swal from 'sweetalert2';

const MassEmailModal = ({ 
  isOpen, 
  onClose, 
  selectedUsers, 
  assessmentGrades, 
  authToken, 
  onEmailSent 
}) => {
  const [emailSubject, setEmailSubject] = useState('Your Week 8 Assessment Feedback - Great Work, [Builder Name]!');
  const [emailTemplate, setEmailTemplate] = useState('pursuit_feedback');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [showPreviews, setShowPreviews] = useState(false);

  // Filter assessment grades to only show selected users
  const selectedGrades = useMemo(() => {
    const selectedSet = new Set(selectedUsers);
    return assessmentGrades.filter(grade => selectedSet.has(grade.user_id));
  }, [selectedUsers, assessmentGrades]);

  // Reset previews when modal opens or selected users change
  useEffect(() => {
    if (isOpen) {
      setPreviews([]);
      setShowPreviews(false);
    }
  }, [isOpen, selectedUsers]);

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
          emailTemplate: emailTemplate,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate previews');
      }

      const result = await response.json();
      setPreviews(result.previews);
      setShowPreviews(true);
    } catch (err) {
      console.error('Error generating previews:', err);
      Swal.fire({
        icon: 'error',
        title: 'Preview Generation Failed',
        text: 'Failed to generate email previews. Please try again.',
        confirmButtonColor: '#d33',
        background: '#1f2937',
        color: '#f9fafb',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
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
          emailTemplate: emailTemplate,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start email job');
      }

      const result = await response.json();

      // Show success message - job has been started
      Swal.fire({
        icon: 'success',
        title: 'Email Job Started!',
        html: `
          <p>Started sending ${selectedUsers.length} assessment feedback emails.</p>
          <p style="margin-top: 10px; font-size: 0.9em; color: #9ca3af;">
            Emails are being sent in batches to avoid rate limits. 
            Estimated completion: ${result.estimatedTime || 'a few minutes'}.
          </p>
        `,
        confirmButtonColor: '#10b981',
        timer: 5000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f9fafb',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
      });

      setSending(false);
      onEmailSent();

    } catch (err) {
      console.error('Error starting email job:', err);
      setSending(false);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Start Email Job',
        text: 'Failed to start email sending. Please check your connection and try again.',
        confirmButtonColor: '#d33',
        background: '#1f2937',
        color: '#f9fafb',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
      });
    }
  };

  const handleSendTestEmail = async () => {
    const { value: testEmail } = await Swal.fire({
      title: 'Send Test Email',
      text: 'Enter your email address for the test:',
      input: 'email',
      inputPlaceholder: 'your.email@example.com',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Test',
      background: '#1f2937',
      color: '#f9fafb',
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content',
        input: 'swal-dark-input'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter an email address!'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address!'
        }
      }
    });
    
    if (!testEmail) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          testData: {
            subject: emailSubject,
            customMessage: customMessage
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Test Email Sent!',
        html: `✅ Test email sent successfully to <strong>${testEmail}</strong><br><small>Message ID: ${result.messageId}</small>`,
        confirmButtonColor: '#10b981',
        timer: 5000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f9fafb',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
      });
    } catch (err) {
      console.error('Error sending test email:', err);
      Swal.fire({
        icon: 'error',
        title: 'Test Email Failed',
        text: 'Failed to send test email. Check console for details.',
        confirmButtonColor: '#d33',
        background: '#1f2937',
        color: '#f9fafb',
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content'
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Send Mass Email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Recipients */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Recipients ({selectedGrades.length} users):
            </Label>
            <div className="bg-muted/50 border border-border rounded-lg p-4 max-h-32 overflow-y-auto">
              {selectedGrades.slice(0, 5).map(grade => (
                <div key={grade.user_id} className="text-sm py-1 text-muted-foreground">
                  {grade.user_first_name} {grade.user_last_name} ({grade.user_email})
                </div>
              ))}
              {selectedGrades.length > 5 && (
                <div className="text-sm py-1 text-muted-foreground italic">
                  ... and {selectedGrades.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-base font-semibold">Subject:</Label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Email Template:</Label>
            <Select value={emailTemplate} onValueChange={setEmailTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pursuit_feedback">Pursuit Assessment Feedback</SelectItem>
                <SelectItem value="detailed">Detailed Feedback</SelectItem>
                <SelectItem value="encouragement">Encouragement Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="customMessage" className="text-base font-semibold">
              Custom Message (optional):
            </Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message that will be included in all emails..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handlePreviewEmails}
                disabled={loadingPreviews || selectedUsers.length === 0 || sending}
              >
                {loadingPreviews ? 'Generating Previews...' : `Preview Emails (${Math.min(selectedUsers.length, 3)})`}
              </Button>
              {showPreviews && (
                <Button
                  variant="secondary"
                  onClick={() => setShowPreviews(false)}
                >
                  Hide Previews
                </Button>
              )}
            </div>

            {showPreviews && previews.length > 0 && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                <h4 className="text-base font-semibold mb-4">
                  Email Previews ({previews.length} of {selectedUsers.length} selected):
                </h4>
                <div className="space-y-4">
                  {previews.map((preview) => (
                    <div key={preview.user_id} className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="flex justify-between items-center p-4 bg-muted/50 border-b border-border">
                        <h5 className="font-medium">📧 {preview.name} ({preview.email})</h5>
                        <Badge variant={
                          preview.status === 'preview_ready' ? 'default' :
                          preview.status === 'no_feedback' ? 'secondary' : 'destructive'
                        }>
                          {preview.status === 'preview_ready' ? '✅ Ready' : 
                           preview.status === 'no_feedback' ? '⚠️ No Feedback' : 
                           '❌ Error'}
                        </Badge>
                      </div>
                      
                      {preview.status === 'preview_ready' && preview.preview && (
                        <div className="p-4">
                          <div className="mb-3 p-3 bg-muted/50 rounded-md text-sm">
                            <strong>Subject:</strong> {preview.preview.subject}
                          </div>
                          <div className="border border-border rounded-md overflow-hidden">
                            <div 
                              className="p-4 bg-white text-black font-sans max-h-96 overflow-y-auto text-sm"
                              dangerouslySetInnerHTML={{ __html: preview.preview.html }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {preview.status === 'no_feedback' && (
                        <div className="p-4 text-center text-amber-600">
                          <p>⚠️ No assessment feedback found for this user. Email will be skipped.</p>
                        </div>
                      )}
                      
                      {preview.status === 'preview_error' && (
                        <div className="p-4 text-center text-destructive">
                          <p>❌ Error generating preview for this user.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleSendTestEmail}
            disabled={sending || loadingPreviews}
          >
            📧 Send Test Email
          </Button>

          <div className="flex gap-4">
            <Button
              variant="secondary"
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
              {sending ? '🚀 Starting...' : `📧 Send to ${selectedUsers.length} Users`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MassEmailModal;
