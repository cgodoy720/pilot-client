import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { MessageSquare } from 'lucide-react';

function TranscriptPanel({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Transcript
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-[#999] text-center py-8">
              The conversation transcript will appear here as you speak...
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'candidate'
                      ? 'bg-[#4242EA]/10 text-[#1a1a1a]'
                      : 'bg-[#f5f5f5] text-[#1a1a1a]'
                  }`}
                >
                  <p className="text-xs font-medium text-[#999] mb-0.5">
                    {msg.role === 'candidate' ? 'You' : 'Interviewer'}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}

export default TranscriptPanel;
