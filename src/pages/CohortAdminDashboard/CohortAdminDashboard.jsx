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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ConversationViewer from '../../components/ConversationViewer';
import TaskConversationList from '../../components/TaskConversationList';

const CohortAdminDashboard = () => {
  const { token, user } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState(null);
  
  // Participants modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Conversation viewing
  const [viewMode, setViewMode] = useState('by-participant'); // 'by-participant' or 'by-task'
  const [expandedParticipant, setExpandedParticipant] = useState(null);
  const [conversationDayFilter, setConversationDayFilter] = useState(null);
  const [participantConversations, setParticipantConversations] = useState({});
  const [conversationsLoading, setConversationsLoading] = useState({});
  const [curriculumDays, setCurriculumDays] = useState([]);
  
  // Task view states
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskConversations, setTaskConversations] = useState(null);
  const [taskConversationsLoading, setTaskConversationsLoading] = useState(false);

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

  // Conversation viewing functions
  const fetchCurriculumDays = async (cohortId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${cohortId}/curriculum`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const days = await response.json();
        setCurriculumDays(days);
      }
    } catch (error) {
      console.error('Error fetching curriculum days:', error);
    }
  };

  const fetchParticipantConversations = async (userId) => {
    if (conversationsLoading[userId]) return;

    setConversationsLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const dayParam = conversationDayFilter ? `?dayNumber=${conversationDayFilter}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/participants/${userId}/conversations${dayParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setParticipantConversations(prev => ({
          ...prev,
          [userId]: data.tasks
        }));
      }
    } catch (error) {
      console.error('Error fetching participant conversations:', error);
    } finally {
      setConversationsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleParticipantRow = async (userId) => {
    if (expandedParticipant === userId) {
      setExpandedParticipant(null);
    } else {
      setExpandedParticipant(userId);
      if (!participantConversations[userId]) {
        await fetchParticipantConversations(userId);
      }
    }
  };

  const fetchDayTasks = async (dayNumber) => {
    try {
      const day = curriculumDays.find(d => d.day_number === dayNumber);
      if (!day) return;

      // Fetch tasks for this day via curriculum endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/curriculum`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const days = await response.json();
        const selectedDayData = days.find(d => d.day_number === dayNumber);
        // This is simplified - in a real scenario, you'd need an endpoint that returns tasks per day
        setDayTasks([]); // Placeholder - would need task data
      }
    } catch (error) {
      console.error('Error fetching day tasks:', error);
    }
  };

  const fetchTaskConversations = async (taskId) => {
    setTaskConversationsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/external-cohorts/${selectedCohort.cohort_id}/tasks/${taskId}/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTaskConversations(data);
      }
    } catch (error) {
      console.error('Error fetching task conversations:', error);
    } finally {
      setTaskConversationsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (participantsModalOpen && selectedCohort) {
      fetchCurriculumDays(selectedCohort.cohort_id);
    }
  }, [participantsModalOpen, selectedCohort]);

  useEffect(() => {
    if (expandedParticipant && selectedCohort) {
      fetchParticipantConversations(expandedParticipant);
    }
  }, [conversationDayFilter]);

  useEffect(() => {
    if (selectedDay) {
      fetchDayTasks(selectedDay);
    }
  }, [selectedDay]);

  useEffect(() => {
    if (selectedTask) {
      fetchTaskConversations(selectedTask.task_id);
    }
  }, [selectedTask]);

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
          <DialogContent className="max-w-6xl font-proxima max-h-[90vh] overflow-y-auto">
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
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="by-participant">By Participant</TabsTrigger>
                  <TabsTrigger value="by-task">By Task</TabsTrigger>
                </TabsList>

                {/* By Participant Tab */}
                <TabsContent value="by-participant" className="space-y-4 mt-4">
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

                  {/* Filters and Export */}
                  <div className="flex justify-between items-center">
                    <select
                      value={conversationDayFilter || ''}
                      onChange={(e) => setConversationDayFilter(e.target.value ? parseInt(e.target.value) : null)}
                      className="text-sm border border-gray-300 rounded px-3 py-2 font-proxima"
                    >
                      <option value="">All Days</option>
                      {curriculumDays.map(day => (
                        <option key={day.id} value={day.day_number}>
                          Day {day.day_number} ({formatDate(day.day_date)})
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={exportParticipantsCSV}>
                      📥 Export CSV
                    </Button>
                  </div>

                  {/* Participants List with Expandable Conversations */}
                  {participants.length > 0 ? (
                    <div className="space-y-2">
                      {participants.map((p) => (
                        <div key={p.user_id} className="border rounded-lg overflow-hidden">
                          <div 
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleParticipantRow(p.user_id)}
                          >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mr-2">
                              <span className={`transform transition-transform text-xs ${expandedParticipant === p.user_id ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                            </Button>
                            
                            <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                              <div className="font-medium">{p.first_name} {p.last_name}</div>
                              <div className="text-sm text-gray-600 col-span-2">{p.email}</div>
                              <div className="text-center">{p.tasks_completed}</div>
                              <div className="text-center">{p.submissions_count}</div>
                              <div className="text-center">
                                {p.tasks_completed > 0 ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {expandedParticipant === p.user_id && (
                            <div className="border-t bg-gray-50 p-4">
                              {conversationsLoading[p.user_id] ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="w-6 h-6 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
                                  <span className="ml-3 text-gray-600">Loading conversations...</span>
                                </div>
                              ) : participantConversations[p.user_id] && participantConversations[p.user_id].length > 0 ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-proxima-bold text-sm">
                                      Tasks {conversationDayFilter && `(Day ${conversationDayFilter})`}
                                    </h4>
                                    <Badge variant="outline">
                                      {participantConversations[p.user_id].filter(t => t.has_conversation).length} with conversations
                                    </Badge>
                                  </div>
                                  
                                  {participantConversations[p.user_id].map((task) => (
                                    <Card key={task.task_id} className="border-[#C8C8C8]">
                                      <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                          <div className="font-medium">{task.task_title}</div>
                                          <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs">Day {task.day_number}</Badge>
                                            {task.task_status && (
                                              <Badge className={
                                                task.task_status === 'completed' ? 'bg-green-100 text-green-700 text-xs'
                                                : task.task_status === 'in_progress' ? 'bg-blue-100 text-blue-700 text-xs'
                                                : 'bg-gray-100 text-gray-600 text-xs'
                                              }>
                                                {task.task_status === 'in_progress' ? 'In Progress' : task.task_status}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent>
                                        {task.has_conversation ? (
                                          <ConversationViewer
                                            task={task}
                                            messages={task.messages}
                                            questions={task.questions}
                                            participant={p}
                                            submission={task.submission}
                                          />
                                        ) : (
                                          <p className="text-sm text-gray-500 text-center py-4">
                                            No conversation for this task yet
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-gray-500">No conversations found</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No participants have registered yet
                    </div>
                  )}
                </TabsContent>

                {/* By Task Tab */}
                <TabsContent value="by-task" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      View conversations across all participants for specific tasks. Select a day to see available tasks.
                    </p>
                    
                    {taskConversations ? (
                      <TaskConversationList
                        task={taskConversations.task}
                        participants={taskConversations.participants}
                        stats={taskConversations.stats}
                      />
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <p className="text-gray-500">
                            Task-level conversation viewing coming soon. This feature will allow you to see all participant responses for a specific task.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CohortAdminDashboard;

