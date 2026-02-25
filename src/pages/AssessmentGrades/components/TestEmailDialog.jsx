import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';

const TestEmailDialog = ({ isOpen, onClose, authToken, emailSubject, weekNumber, customMessage }) => {
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setTestEmail(email);
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(testEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      
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
            weekNumber: weekNumber,
            customMessage: customMessage
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const result = await response.json();
      
      toast.success('Test Email Sent!', {
        description: `✅ Test email sent successfully to ${testEmail}`,
        duration: 5000,
      });

      // Reset and close
      setTestEmail('');
      setEmailError('');
      onClose();

    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error('Test Email Failed', {
        description: 'Failed to send test email. Check console for details.',
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setTestEmail('');
    setEmailError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test assessment feedback email to verify the template and content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your.email@example.com"
              value={testEmail}
              onChange={handleEmailChange}
              className={emailError ? 'border-destructive' : ''}
              disabled={sending}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">Test Email Details:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Recipient: {testEmail || 'Not specified'}</li>
              <li>• Subject: {emailSubject || 'Default subject'}</li>
              <li>• Assessment Week: Week {weekNumber}</li>
              <li>• Sample data will be used for testing</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={!testEmail || !!emailError || sending}
            className="bg-primary hover:bg-primary/90"
          >
            {sending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestEmailDialog;

