import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * ConversationViewer Component
 * Displays task conversation in a readable Q&A format with user and assistant messages
 */
const ConversationViewer = ({ task, messages, questions, participant, submission }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse questions array if it's a string
  const questionsList = Array.isArray(questions) 
    ? questions 
    : (typeof questions === 'string' ? JSON.parse(questions || '[]') : []);

  return (
    <div className="space-y-4 font-proxima">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-proxima-bold text-lg text-[#1a1a1a]">{task.task_title}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              Day {task.day_number}
            </Badge>
            {task.block_category && (
              <Badge variant="outline" className="text-xs">
                {task.block_category}
              </Badge>
            )}
            {task.task_status && (
              <Badge 
                className={
                  task.task_status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : task.task_status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {task.task_status === 'in_progress' ? 'In Progress' : task.task_status}
              </Badge>
            )}
          </div>
        </div>
        {participant && (
          <div className="text-right text-sm text-gray-600">
            <div className="font-medium">{participant.first_name} {participant.last_name}</div>
            <div className="text-xs">{participant.email}</div>
          </div>
        )}
      </div>

      {/* Task Intro */}
      {task.intro && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.intro}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions Context */}
      {questionsList.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-proxima-bold">Discussion Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {questionsList.map((question, idx) => (
                <li key={idx} className="pl-2">{question}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Conversation Messages */}
      {messages && messages.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-proxima-bold text-sm text-gray-700">Conversation</h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {messages.map((message, idx) => (
              <div
                key={message.message_id || idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-[#4242ea] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'Participant' : 'AI Assistant'}
                    </span>
                    {message.timestamp && (
                      <span className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500 text-sm">No conversation yet</p>
          </CardContent>
        </Card>
      )}

      {/* Submission */}
      {submission && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-proxima-bold text-green-800">
                Deliverable Submission
              </CardTitle>
              {task.submitted_at && (
                <span className="text-xs text-green-600">
                  Submitted {formatTimestamp(task.submitted_at)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission}</p>
          </CardContent>
        </Card>
      )}

      {/* Task Conclusion */}
      {task.conclusion && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-proxima-bold text-purple-800">
              Task Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.conclusion}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConversationViewer;

