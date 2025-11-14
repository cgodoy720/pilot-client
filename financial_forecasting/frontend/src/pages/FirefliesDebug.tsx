import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { apiService } from '../services/api';

interface FirefliesMeeting {
  id: string;
  title: string;
  date: string;
  meeting_attendees: Array<{
    displayName?: string;
    email?: string;
  }>;
  organizer?: {
    name?: string;
    email?: string;
  };
}

const FirefliesDebug: React.FC = () => {
  // Fetch all recent meetings (increased limit)
  const { data, isLoading, error } = useQuery(
    'fireflies-debug',
    async () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/fireflies/recent-meetings?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      return response.json();
    }
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load Fireflies data. Make sure your API key is configured and the backend is running.
        </Alert>
      </Box>
    );
  }

  const meetings: FirefliesMeeting[] = data?.meetings || [];
  const uniqueDomains: string[] = data?.unique_domains || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fireflies Debug - All Accessible Meetings
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        This page shows all meetings your Fireflies API key can access
      </Typography>

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h3" color="primary">{meetings.length}</Typography>
            <Typography variant="caption">Total Meetings</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h3" color="success.main">{uniqueDomains.length}</Typography>
            <Typography variant="caption">Unique Domains</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Unique Domains */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Unique Email Domains Found
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uniqueDomains.map((domain, idx) => (
              <Chip key={idx} label={domain} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            These domains might match accounts in your Salesforce
          </Typography>
        </CardContent>
      </Card>

      {/* All Meetings Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Meetings (Most Recent 50)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Attendees</TableCell>
                  <TableCell>Email Domains</TableCell>
                  <TableCell>Organizer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.map((meeting) => {
                  // Extract domains from attendees
                  const domains = new Set<string>();
                  meeting.meeting_attendees?.forEach((attendee) => {
                    if (attendee.email && attendee.email.includes('@')) {
                      const domain = attendee.email.split('@')[1];
                      if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
                        domains.add(domain);
                      }
                    }
                  });

                  return (
                    <TableRow key={meeting.id} hover>
                      <TableCell>
                        {meeting.date ? format(new Date(meeting.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {meeting.title || 'Untitled'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {meeting.meeting_attendees?.slice(0, 5).map((attendee, idx) => (
                            <Typography key={idx} variant="caption">
                              {attendee.displayName || attendee.email || 'Unknown'}
                            </Typography>
                          ))}
                          {(meeting.meeting_attendees?.length || 0) > 5 && (
                            <Typography variant="caption" color="textSecondary">
                              +{meeting.meeting_attendees.length - 5} more
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.from(domains).map((domain, idx) => (
                            <Chip
                              key={idx}
                              label={domain}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {meeting.organizer?.name || meeting.organizer?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          How to match meetings to accounts:
        </Typography>
        <Typography variant="body2">
          1. Look at the "Email Domains" column to identify which organizations are in your meetings
          <br />
          2. Make sure those accounts exist in your Salesforce with the correct website field
          <br />
          3. Add contacts with matching email addresses to link meetings automatically
          <br />
          4. Use the Debug endpoint: <code>http://localhost:8000/api/fireflies/debug-account/AccountName</code> to troubleshoot specific accounts
        </Typography>
      </Alert>
    </Box>
  );
};

export default FirefliesDebug;

