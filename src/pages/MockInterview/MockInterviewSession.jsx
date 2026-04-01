import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { abandonInterview } from '../../services/mockInterviewApi';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Mic, MicOff, PhoneOff, AlertCircle, Loader2 } from 'lucide-react';
import InterviewTimer from './components/InterviewTimer';
import TranscriptPanel from './components/TranscriptPanel';

import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useRoomContext,
  useTrackToggle,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

function MockInterviewSession() {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const { livekitToken, livekitUrl, interview } = location.state || {};

  if (!livekitToken || !livekitUrl) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card>
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Session Not Found</h2>
            <p className="text-[#666] mb-4">This interview session has expired or was not properly initialized.</p>
            <Button onClick={() => navigate('/pathfinder/mock-interview')}>Start New Interview</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={livekitToken}
      connect={true}
      audio={true}
      video={false}
      className="w-full"
      onDisconnected={() => {
        navigate(`/pathfinder/mock-interview/feedback/${interviewId}`);
      }}
    >
      <InterviewRoomContent
        interview={interview}
        interviewId={interviewId}
        authToken={token}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function InterviewRoomContent({ interview, interviewId, authToken }) {
  const navigate = useNavigate();
  const room = useRoomContext();
  const voiceAssistant = useVoiceAssistant();
  const [isEnding, setIsEnding] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const startTimeRef = useRef(Date.now());

  const agentState = voiceAssistant.state;
  const isAgentSpeaking = agentState === 'speaking';
  const isAgentListening = agentState === 'listening';
  const isAgentThinking = agentState === 'thinking';

  const { toggle: toggleMic, enabled: micEnabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const handleEndInterview = useCallback(async () => {
    setIsEnding(true);
    room?.disconnect();
    navigate(`/pathfinder/mock-interview/feedback/${interviewId}`);
  }, [interviewId, room, navigate]);

  const handleAbandon = useCallback(async () => {
    try {
      await abandonInterview(authToken, interviewId);
    } catch {
      // best effort
    }
    room?.disconnect();
    navigate('/pathfinder/mock-interview');
  }, [authToken, interviewId, room, navigate]);

  const statusText = isAgentSpeaking ? 'Speaking...'
    : isAgentListening ? 'Listening...'
    : isAgentThinking ? 'Thinking...'
    : 'Connecting...';

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge className={
            interview?.interview_type === 'technical'
              ? 'bg-[#FF33FF]/10 text-[#FF33FF] border-[#FF33FF]/30'
              : 'bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/30'
          }>
            {interview?.interview_type === 'technical' ? 'Technical' : 'Behavioral'}
          </Badge>
          {interview?.focus_area && interview.focus_area !== 'general' && (
            <Badge variant="outline" className="text-[#666]">{interview.focus_area.replace(/_/g, ' ')}</Badge>
          )}
          <InterviewTimer startTime={startTimeRef.current} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAbandon} disabled={isEnding} className="text-[#666]">Cancel</Button>
          <Button size="sm" onClick={handleEndInterview} disabled={isEnding} className="bg-red-600 hover:bg-red-700 text-white">
            {isEnding ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating Feedback...</>
            ) : (
              <><PhoneOff className="w-4 h-4 mr-1" /> End Interview</>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Control Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-[#666] mb-1">Interviewer</p>
                <p className="text-xs text-[#999]">{statusText}</p>
              </div>

              {/* Audio Visualizer */}
              {voiceAssistant.audioTrack && (
                <div className="w-full h-20">
                  <BarVisualizer
                    state={agentState}
                    barCount={5}
                    trackRef={voiceAssistant.audioTrack}
                    className="w-full h-full"
                    options={{ minHeight: 4 }}
                  />
                </div>
              )}

              {!voiceAssistant.audioTrack && (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isAgentSpeaking ? 'bg-[#4242EA]/20 animate-pulse' :
                  isAgentListening ? 'bg-green-100' :
                  isAgentThinking ? 'bg-amber-100 animate-pulse' :
                  'bg-gray-100'
                }`}>
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              )}

              {/* Mic Toggle */}
              <Button
                variant={micEnabled ? 'default' : 'destructive'}
                size="lg"
                className={`rounded-full w-16 h-16 ${micEnabled ? 'bg-[#4242EA] hover:bg-[#3535c0]' : ''}`}
                onClick={() => toggleMic()}
              >
                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              <p className="text-xs text-[#999]">
                {micEnabled ? 'Speak naturally — the interviewer will respond automatically' : 'Microphone muted'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transcript Panel */}
        <div className="lg:col-span-2">
          <TranscriptPanel messages={transcriptMessages} />
        </div>
      </div>
    </div>
  );
}

export default MockInterviewSession;
