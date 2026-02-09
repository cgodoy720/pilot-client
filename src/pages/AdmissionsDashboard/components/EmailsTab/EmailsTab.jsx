import React, { useState, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import Swal from 'sweetalert2';
import EmailMappingsTab from './EmailMappingsTab';

const EmailsTab = ({
  emailStats,
  queuedEmails = [],
  emailHistory = [],
  applicantEmailStatus = [],
  emailAutomationLoading,
  setEmailAutomationLoading,
  testEmailAddress,
  setTestEmailAddress,
  testEmailLoading,
  setTestEmailLoading,
  fetchEmailStats,
  fetchQueuedEmails,
  fetchEmailHistory,
  fetchApplicantEmailStatus,
  emailMappings,
  emailMappingsStats,
  emailMappingsLoading,
  fetchEmailMappings,
  token
}) => {
  const [emailSubTab, setEmailSubTab] = useState('history');
  
  // Ensure arrays are actually arrays
  const safeEmailHistory = Array.isArray(emailHistory) ? emailHistory : [];
  const safeApplicantEmailStatus = Array.isArray(applicantEmailStatus) ? applicantEmailStatus : [];

  // Calculate computed stats - prefer backend data when available
  const computedStats = useMemo(() => {
    // Use emailStats from backend (accurate totals) or fall back to calculating from history
    const totalSent = emailStats?.total_emails_sent 
      ? parseInt(emailStats.total_emails_sent) 
      : safeEmailHistory.reduce((sum, email) => sum + (email.send_count || 1), 0);
    
    // Unique recipients from backend
    const uniqueRecipients = emailStats?.unique_recipients 
      ? parseInt(emailStats.unique_recipients) 
      : new Set(safeEmailHistory.map(e => e.applicant_id)).size;
    
    // Open rate from backend (more accurate since it counts all records)
    const openedCount = emailStats?.emails_opened 
      ? parseInt(emailStats.emails_opened) 
      : safeEmailHistory.filter(e => e.email_opened_at).length;
    
    // Calculate open rate based on total sent, not just history records
    const openRate = totalSent > 0 
      ? Math.round((openedCount / totalSent) * 100) 
      : 0;
    
    // Email type breakdown - prefer backend typeBreakdown if available
    const typeBreakdown = {};
    if (emailStats?.typeBreakdown && Array.isArray(emailStats.typeBreakdown)) {
      emailStats.typeBreakdown.forEach(item => {
        const type = item.email_type || 'unknown';
        typeBreakdown[type] = { 
          count: parseInt(item.sent_count) || 0, 
          opened: 0 
        };
      });
    } else {
      safeEmailHistory.forEach(email => {
        const type = email.email_type || 'unknown';
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = { count: 0, opened: 0 };
        }
        typeBreakdown[type].count += email.send_count || 1;
        if (email.email_opened_at) {
          typeBreakdown[type].opened += 1;
        }
      });
    }
    
    // Opt-out breakdown - prefer backend optOutReasons if available
    const optOutBreakdown = {
      no_longer_interested: 0,
      time_commitment: 0,
      other: 0
    };
    
    if (emailStats?.optOutReasons && Array.isArray(emailStats.optOutReasons)) {
      emailStats.optOutReasons.forEach(item => {
        const category = item.reason_category?.toLowerCase() || '';
        const count = parseInt(item.count) || 0;
        if (category.includes('no longer interested')) {
          optOutBreakdown.no_longer_interested += count;
        } else if (category.includes('time')) {
          optOutBreakdown.time_commitment += count;
        } else {
          optOutBreakdown.other += count;
        }
      });
    } else {
      safeApplicantEmailStatus.forEach(applicant => {
        if (applicant.email_opt_out) {
          const reason = (applicant.email_opt_out_reason || '').toLowerCase();
          if (reason.includes('no longer interested') || reason.includes('not interested')) {
            optOutBreakdown.no_longer_interested += 1;
          } else if (reason.includes('time') || reason.includes('busy') || reason.includes('commitment')) {
            optOutBreakdown.time_commitment += 1;
          } else {
            optOutBreakdown.other += 1;
          }
        }
      });
    }
    
    const totalOptOut = emailStats?.total_opted_out 
      ? parseInt(emailStats.total_opted_out)
      : (optOutBreakdown.no_longer_interested + optOutBreakdown.time_commitment + optOutBreakdown.other);
    
    return {
      totalSent,
      uniqueRecipients,
      openRate,
      openedCount,
      typeBreakdown,
      optOutBreakdown,
      totalOptOut
    };
  }, [emailStats, safeEmailHistory, safeApplicantEmailStatus]);

  // Send test email
  const sendTestEmail = async (emailType) => {
    if (!testEmailAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter a test email address',
        confirmButtonColor: '#4242ea'
      });
      return;
    }

    setTestEmailLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/emails/test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testEmailAddress,
            name: 'Test User',
            type: emailType
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Test Email Sent!',
          text: `A test ${emailType.replace(/_/g, ' ')} email has been sent to ${testEmailAddress}`,
          confirmButtonColor: '#4242ea'
        });
      } else {
        throw new Error(data.error || data.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to send test email',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get email type badge color
  const getEmailTypeBadgeColor = (type) => {
    const colors = {
      'welcome': 'bg-blue-100 text-blue-700',
      'reminder': 'bg-yellow-100 text-yellow-700',
      'info_session_invite': 'bg-purple-100 text-purple-700',
      'workshop_invite': 'bg-green-100 text-green-700',
      'workshop_auto_invite': 'bg-emerald-100 text-emerald-700',
      'acceptance': 'bg-emerald-100 text-emerald-700',
      'rejection': 'bg-red-100 text-red-700',
      'waitlist': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Format email type for display
  const formatEmailType = (type) => {
    const labels = {
      'welcome': 'Welcome',
      'reminder': 'Reminder',
      'info_session_invite': 'Info Session Invite',
      'workshop_invite': 'Workshop Invite',
      'workshop_auto_invite': 'Workshop Auto-Invite',
      'acceptance': 'Acceptance',
      'rejection': 'Rejection',
      'waitlist': 'Waitlist'
    };
    return labels[type] || type?.replace(/_/g, ' ') || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a1a1a] font-proxima-bold">
          Email Automation
        </h2>
        <Button
          variant="outline"
          onClick={() => {
            fetchEmailStats();
            fetchQueuedEmails();
            fetchEmailHistory();
            fetchApplicantEmailStatus();
          }}
          className="font-proxima"
        >
          Refresh
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Total Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1a1a1a] font-proxima-bold">
              {computedStats.totalSent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Unique Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4242ea] font-proxima-bold">
              {computedStats.uniqueRecipients.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-proxima">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 font-proxima-bold">
              {computedStats.openRate}%
            </div>
            <div className="text-sm text-gray-500 font-proxima mt-1">
              {computedStats.openedCount} of {computedStats.totalSent} opened
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opt-out Breakdown and Email Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opt-out Reasons */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-proxima-bold flex items-center gap-2">
              Opt-out Reasons
              {computedStats.totalOptOut > 0 && (
                <Badge className="bg-red-100 text-red-700 font-proxima">
                  {computedStats.totalOptOut} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {computedStats.totalOptOut > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-proxima text-[#1a1a1a]">No Longer Interested</span>
                  </div>
                  <span className="font-proxima-bold text-lg">{computedStats.optOutBreakdown.no_longer_interested}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-proxima text-[#1a1a1a]">Time Commitment</span>
                  </div>
                  <span className="font-proxima-bold text-lg">{computedStats.optOutBreakdown.time_commitment}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="font-proxima text-[#1a1a1a]">Other</span>
                  </div>
                  <span className="font-proxima-bold text-lg">{computedStats.optOutBreakdown.other}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 font-proxima">
                No opt-outs recorded
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Type Breakdown */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-proxima-bold">Email Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(computedStats.typeBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(computedStats.typeBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getEmailTypeBadgeColor(type)} font-proxima`}>
                          {formatEmailType(type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-proxima-bold text-lg">{data.count}</span>
                        {data.opened > 0 && (
                          <span className="text-sm text-green-600 font-proxima">
                            ({data.opened} opened)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 font-proxima">
                No emails sent yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Email Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-proxima-bold">Send Test Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Label className="font-proxima-bold mb-2 block">Test Email Address</Label>
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="font-proxima"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => sendTestEmail('info_session_registration')}
                disabled={testEmailLoading}
                className="font-proxima"
              >
                Info Session Reg
              </Button>
              <Button
                variant="outline"
                onClick={() => sendTestEmail('info_session_attendance')}
                disabled={testEmailLoading}
                className="font-proxima"
              >
                Info Session Attended
              </Button>
              <Button
                variant="outline"
                onClick={() => sendTestEmail('workshop_invitation')}
                disabled={testEmailLoading}
                className="font-proxima"
              >
                Workshop Invite
              </Button>
              <Button
                variant="outline"
                onClick={() => sendTestEmail('application_submission')}
                disabled={testEmailLoading}
                className="font-proxima"
              >
                App Submitted
              </Button>
              <Button
                variant="outline"
                onClick={() => sendTestEmail('acceptance')}
                disabled={testEmailLoading}
                className="font-proxima"
              >
                Acceptance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for History and Applicant Status */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-0">
          <Tabs value={emailSubTab} onValueChange={setEmailSubTab}>
            <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-gray-50 px-4">
              <TabsTrigger value="history" className="font-proxima data-[state=active]:bg-white">
                Email History ({safeEmailHistory.length})
              </TabsTrigger>
              <TabsTrigger value="applicants" className="font-proxima data-[state=active]:bg-white">
                Applicant Status ({safeApplicantEmailStatus.length})
              </TabsTrigger>
              <TabsTrigger value="mappings" className="font-proxima data-[state=active]:bg-white">
                Email Mappings
              </TabsTrigger>
            </TabsList>

            {/* Email History */}
            <TabsContent value="history" className="mt-0">
              {safeEmailHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-proxima-bold">Recipient</TableHead>
                      <TableHead className="font-proxima-bold">Email Type</TableHead>
                      <TableHead className="font-proxima-bold">Send Count</TableHead>
                      <TableHead className="font-proxima-bold">Sent At</TableHead>
                      <TableHead className="font-proxima-bold">Opened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeEmailHistory.slice(0, 100).map((email, idx) => (
                      <TableRow key={email.log_id || idx}>
                        <TableCell className="font-proxima">
                          <div>
                            <div className="font-medium">{email.first_name} {email.last_name}</div>
                            <div className="text-sm text-gray-500">{email.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getEmailTypeBadgeColor(email.email_type)} font-proxima`}>
                            {formatEmailType(email.email_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-proxima text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4242ea] text-white text-xs font-bold">
                            {email.send_count || 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-proxima text-gray-600">
                          {formatDate(email.email_sent_at_est || email.email_sent_at)}
                        </TableCell>
                        <TableCell>
                          {email.email_opened_at ? (
                            <Badge className="bg-green-100 text-green-700 font-proxima">
                              Opened
                            </Badge>
                          ) : (
                            <span className="text-gray-400 font-proxima text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-gray-500 font-proxima">
                  No email history
                </div>
              )}
            </TabsContent>

            {/* Applicant Email Status */}
            <TabsContent value="applicants" className="mt-0">
              {safeApplicantEmailStatus.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-proxima-bold">Applicant</TableHead>
                      <TableHead className="font-proxima-bold">Email</TableHead>
                      <TableHead className="font-proxima-bold">Stage</TableHead>
                      <TableHead className="font-proxima-bold">Email History</TableHead>
                      <TableHead className="font-proxima-bold">Days Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeApplicantEmailStatus.slice(0, 100).map((applicant, idx) => {
                      // Parse email_logs if it's a string or get array
                      const emailLogs = Array.isArray(applicant.email_logs) 
                        ? applicant.email_logs 
                        : (typeof applicant.email_logs === 'string' 
                            ? JSON.parse(applicant.email_logs) 
                            : []);
                      
                      // Get latest email
                      const latestEmail = emailLogs.length > 0 
                        ? emailLogs.reduce((latest, log) => {
                            if (!latest || (log.email_sent_at && new Date(log.email_sent_at) > new Date(latest.email_sent_at))) {
                              return log;
                            }
                            return latest;
                          }, null)
                        : null;
                      
                      // Total emails sent
                      const totalSent = emailLogs.reduce((sum, log) => sum + (log.send_count || 0), 0);
                      
                      return (
                        <TableRow key={applicant.applicant_id || idx}>
                          <TableCell className="font-proxima font-medium">
                            {applicant.first_name} {applicant.last_name}
                            {applicant.email_opt_out && (
                              <Badge className="ml-2 bg-red-100 text-red-700 font-proxima text-xs">
                                Opted Out
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-proxima text-gray-600">
                            {applicant.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={`font-proxima ${
                              applicant.applicant_stage === 'workshop_attended' ? 'bg-green-100 text-green-700' :
                              applicant.applicant_stage === 'workshop_invited' ? 'bg-purple-100 text-purple-700' :
                              applicant.applicant_stage === 'info_session_attended' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {applicant.applicant_stage?.replace(/_/g, ' ') || 'New'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-proxima">
                            {latestEmail ? (
                              <div>
                                <Badge className={`${getEmailTypeBadgeColor(latestEmail.email_type)} font-proxima mb-1`}>
                                  {formatEmailType(latestEmail.email_type)}
                                </Badge>
                                <div className="text-xs text-gray-400">
                                  {formatDate(latestEmail.email_sent_at)}
                                </div>
                                {totalSent > 1 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    +{totalSent - 1} more email{totalSent > 2 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No emails sent</span>
                            )}
                          </TableCell>
                          <TableCell className="font-proxima text-center text-gray-600">
                            {applicant.days_since_account_created ? `${Math.round(applicant.days_since_account_created)}d` : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-gray-500 font-proxima">
                  No applicant email data
                </div>
              )}
            </TabsContent>

            {/* Email Mappings Tab */}
            <TabsContent value="mappings" className="mt-0 p-6">
              <EmailMappingsTab
                emailMappings={emailMappings}
                emailMappingsStats={emailMappingsStats}
                emailMappingsLoading={emailMappingsLoading}
                fetchEmailMappings={fetchEmailMappings}
                token={token}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailsTab;
