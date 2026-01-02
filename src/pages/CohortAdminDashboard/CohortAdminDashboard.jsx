import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

const CohortAdminDashboard = () => {
  const { token, user } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState(null);
  
  // Participants modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Fetch cohorts on mount
  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/cohort-admin/my-cohorts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCohorts(data.cohorts || []);
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openParticipantsModal = async (cohort) => {
    setSelectedCohort(cohort);
    setParticipantsModalOpen(true);
    setParticipantsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohort.cohort_id}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCohortStatus = (cohort) => {
    const now = new Date();
    const startDate = new Date(cohort.start_date);
    const endDate = cohort.end_date ? new Date(cohort.end_date) : null;

    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    } else if (endDate && now > endDate) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-600' };
    } else {
      return { label: 'Active', color: 'bg-green-100 text-green-700' };
    }
  };

  const exportParticipantsCSV = () => {
    if (participants.length === 0) return;

    const headers = ['First Name', 'Last Name', 'Email', 'Joined', 'Tasks Completed', 'Submissions', 'Last Activity'];
    const rows = participants.map(p => [
      p.first_name,
      p.last_name,
      p.email,
      new Date(p.joined_at).toLocaleDateString(),
      p.tasks_completed,
      p.submissions_count,
      p.last_activity ? new Date(p.last_activity).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCohort.name.replace(/\s+/g, '_')}_participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-proxima">Loading your cohorts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cohorts.length === 0) {
    return (
      <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
        <div className="max-w-[1200px] mx-auto">
          <Card className="bg-white border border-[#C8C8C8]">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-xl font-proxima-bold text-[#1a1a1a] mb-2">No Cohorts Assigned</h2>
              <p className="text-gray-600 font-proxima max-w-md mx-auto">
                You haven't been assigned as an admin for any cohorts yet. 
                Please contact your program administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white border border-[#C8C8C8]">
          <CardHeader>
            <CardTitle className="text-2xl font-proxima-bold text-[#1a1a1a]">
              Cohort Admin Dashboard
            </CardTitle>
            <CardDescription className="font-proxima">
              Welcome, {user?.first_name}! View and track progress for your assigned cohorts.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Cohort Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {cohorts.map((cohort) => {
            const status = getCohortStatus(cohort);
            const participationRate = cohort.participant_count && cohort.active_participants 
              ? Math.round((cohort.active_participants / cohort.participant_count) * 100)
              : 0;

            return (
              <Card key={cohort.cohort_id} className="bg-white border border-[#C8C8C8] overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-proxima-bold">{cohort.name}</CardTitle>
                      <CardDescription className="font-proxima">
                        {formatDate(cohort.start_date)}
                        {cohort.end_date && ` - ${formatDate(cohort.end_date)}`}
                      </CardDescription>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-proxima-bold text-[#4242ea]">
                        {cohort.participant_count || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-proxima">Enrolled</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-proxima-bold text-green-600">
                        {cohort.active_participants || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-proxima">Active</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-proxima-bold text-purple-600">
                        {participationRate}%
                      </div>
                      <div className="text-xs text-gray-600 font-proxima">Participation</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-proxima">
                      <span className="text-gray-600">Active Participation</span>
                      <span className="text-[#4242ea] font-medium">{participationRate}%</span>
                    </div>
                    <Progress value={participationRate} className="h-2" />
                  </div>

                  {/* Access Code */}
                  {cohort.access_code && (
                    <div className="p-3 bg-[#4242ea]/5 rounded-lg">
                      <div className="text-xs text-gray-600 font-proxima mb-1">Access Code for Participants:</div>
                      <div className="flex items-center justify-between">
                        <code className="text-[#4242ea] font-mono font-bold text-lg">
                          {cohort.access_code}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(cohort.access_code);
                          }}
                          className="text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <Button
                    onClick={() => openParticipantsModal(cohort)}
                    className="w-full bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
                  >
                    View Participants
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Participants Modal */}
        <Dialog open={participantsModalOpen} onOpenChange={setParticipantsModalOpen}>
          <DialogContent className="max-w-4xl font-proxima max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-proxima-bold">
                Participants - {selectedCohort?.name}
              </DialogTitle>
            </DialogHeader>

            {participantsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-proxima-bold text-[#4242ea]">
                        {participants.length}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-proxima-bold text-green-600">
                        {participants.filter(p => p.tasks_completed > 0).length}
                      </div>
                      <div className="text-xs text-gray-600">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-proxima-bold text-purple-600">
                        {participants.length > 0 
                          ? Math.round(participants.reduce((sum, p) => sum + p.tasks_completed, 0) / participants.length)
                          : 0}
                      </div>
                      <div className="text-xs text-gray-600">Avg Tasks</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-proxima-bold text-orange-600">
                        {participants.length > 0 
                          ? Math.round(participants.reduce((sum, p) => sum + p.submissions_count, 0) / participants.length)
                          : 0}
                      </div>
                      <div className="text-xs text-gray-600">Avg Submissions</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={exportParticipantsCSV}>
                    📥 Export CSV
                  </Button>
                </div>

                {/* Participants Table */}
                {participants.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-proxima-bold">Name</TableHead>
                          <TableHead className="font-proxima-bold">Email</TableHead>
                          <TableHead className="font-proxima-bold text-center">Tasks</TableHead>
                          <TableHead className="font-proxima-bold text-center">Submissions</TableHead>
                          <TableHead className="font-proxima-bold">Last Activity</TableHead>
                          <TableHead className="font-proxima-bold text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((p) => (
                          <TableRow key={p.user_id} className="hover:bg-gray-50">
                            <TableCell className="font-medium font-proxima">
                              {p.first_name} {p.last_name}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{p.email}</TableCell>
                            <TableCell className="text-center font-proxima-bold">
                              {p.tasks_completed}
                            </TableCell>
                            <TableCell className="text-center font-proxima">
                              {p.submissions_count}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {p.last_activity ? formatDate(p.last_activity) : 'Never'}
                            </TableCell>
                            <TableCell className="text-center">
                              {p.tasks_completed > 0 ? (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No participants have registered yet
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CohortAdminDashboard;

