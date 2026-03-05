import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import ConversationViewer from './ConversationViewer';

/**
 * TaskConversationList Component
 * Shows all participant responses for a single task with expandable conversations
 */
const TaskConversationList = ({ task, participants, stats }) => {
  const [expandedParticipant, setExpandedParticipant] = useState(null);

  const toggleParticipant = (userId) => {
    setExpandedParticipant(expandedParticipant === userId ? null : userId);
  };

  if (!task) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 font-proxima">No task selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 font-proxima">
      {/* Task Header */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="space-y-3">
            <div>
              <CardTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
                {task.task_title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{task.task_description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Day {task.day_number}
              </Badge>
              {task.block_category && (
                <Badge variant="outline" className="text-sm">
                  {task.block_category}
                </Badge>
              )}
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-4 gap-3 pt-3 border-t">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-2xl font-proxima-bold text-[#4242ea]">
                    {stats.total_participants}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-2xl font-proxima-bold text-blue-600">
                    {stats.engaged_count}
                  </div>
                  <div className="text-xs text-gray-600">Engaged</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-2xl font-proxima-bold text-green-600">
                    {stats.completed_count}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="text-2xl font-proxima-bold text-purple-600">
                    {stats.submitted_count}
                  </div>
                  <div className="text-xs text-gray-600">Submitted</div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Participants List */}
      <div className="space-y-2">
        <h3 className="font-proxima-bold text-lg text-[#1a1a1a]">
          Participant Responses ({participants?.length || 0})
        </h3>
        
        {participants && participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((participant) => (
              <Card key={participant.user_id} className="border-[#C8C8C8]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleParticipant(participant.user_id)}
                        className="h-8 w-8 p-0"
                      >
                        <span className={`transform transition-transform ${expandedParticipant === participant.user_id ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </Button>
                      
                      <div className="flex-1">
                        <div className="font-proxima-bold text-[#1a1a1a]">
                          {participant.first_name} {participant.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{participant.email}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {participant.has_conversation ? (
                          <>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {participant.messages?.length || 0} messages
                            </Badge>
                            {participant.task_status && (
                              <Badge 
                                className={
                                  participant.task_status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : participant.task_status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-600'
                                }
                              >
                                {participant.task_status === 'in_progress' ? 'In Progress' : participant.task_status}
                              </Badge>
                            )}
                            {participant.submission && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                Submitted
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">
                            No engagement
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Conversation View */}
                {expandedParticipant === participant.user_id && (
                  <CardContent className="pt-0 border-t">
                    {participant.has_conversation ? (
                      <div className="pt-4">
                        <ConversationViewer
                          task={{
                            ...task,
                            task_status: participant.task_status,
                            submitted_at: participant.submitted_at
                          }}
                          messages={participant.messages}
                          questions={task.questions}
                          participant={{
                            first_name: participant.first_name,
                            last_name: participant.last_name,
                            email: participant.email
                          }}
                          submission={participant.submission}
                        />
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 text-sm">
                          This participant hasn't engaged with this task yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 font-proxima">No participants found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskConversationList;

