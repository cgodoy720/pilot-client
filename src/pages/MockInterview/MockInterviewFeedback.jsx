import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { getInterview, completeInterview } from '../../services/mockInterviewApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  CheckCircle2,
  ArrowUpCircle,
  Lightbulb,
  RotateCcw,
  Clock,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';

function MockInterviewFeedback() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    loadInterview();
  }, [interviewId, token]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const data = await getInterview(token, interviewId);
      setInterview(data.interview);
      setMessages(data.messages || []);

      if (data.interview.feedback_summary) {
        setFeedback(data.interview.feedback_summary);
      } else if (data.messages?.length > 0) {
        await generateFeedback();
      } else {
        // Messages may not be saved yet (agent saves async). Retry with backoff.
        for (const delay of [2000, 4000, 8000]) {
          await new Promise((r) => setTimeout(r, delay));
          const retry = await getInterview(token, interviewId);
          setMessages(retry.messages || []);
          if (retry.interview.feedback_summary) {
            setFeedback(retry.interview.feedback_summary);
            setInterview(retry.interview);
            break;
          } else if (retry.messages?.length > 0) {
            await generateFeedback();
            break;
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    try {
      setGenerating(true);
      const result = await completeInterview(token, interviewId);
      setFeedback(result.feedback);
      if (result.interview) setInterview(result.interview);
    } catch (err) {
      setError('Failed to generate feedback: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#4242EA]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-[#666] mb-4">{error}</p>
        <Button onClick={() => navigate('/pathfinder/mock-interview')}>Back to Setup</Button>
      </div>
    );
  }

  const scoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-[#4242EA]';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  };

  const progressColor = (score) => {
    if (score >= 8) return '[&>div]:bg-green-500';
    if (score >= 6) return '[&>div]:bg-[#4242EA]';
    if (score >= 4) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-red-500';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Interview Feedback</h1>
        <div className="flex items-center gap-3">
          <Badge
            className={
              interview?.interview_type === 'technical'
                ? 'bg-[#FF33FF]/10 text-[#FF33FF]'
                : 'bg-[#4242EA]/10 text-[#4242EA]'
            }
          >
            {interview?.interview_type === 'technical' ? 'Technical' : 'Behavioral'}
          </Badge>
          {interview?.focus_area && interview.focus_area !== 'general' && (
            <Badge variant="outline">{interview.focus_area.replace(/_/g, ' ')}</Badge>
          )}
          <span className="text-sm text-[#666] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(interview?.duration_seconds)}
          </span>
        </div>
      </div>

      {generating && (
        <Card className="mb-6">
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#4242EA] mx-auto mb-3" />
            <p className="text-[#666]">Analyzing your interview and generating feedback...</p>
          </CardContent>
        </Card>
      )}

      {feedback && !feedback.parse_error && (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666] mb-1">Overall Score</p>
                  <p className={`text-5xl font-bold ${scoreColor(feedback.overall_score)}`}>
                    {feedback.overall_score}
                    <span className="text-lg text-[#999] font-normal">/10</span>
                  </p>
                </div>
                <div className="flex-1 ml-8 space-y-3">
                  {[
                    { label: 'Communication', score: feedback.communication_score },
                    { label: 'Confidence', score: feedback.confidence_score },
                    { label: 'Detail & Depth', score: feedback.detail_score },
                    feedback.star_completeness_score != null && {
                      label: 'STAR Completeness',
                      score: feedback.star_completeness_score,
                    },
                    feedback.technical_depth_score != null && {
                      label: 'Technical Depth',
                      score: feedback.technical_depth_score,
                    },
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-[#666] w-32 shrink-0">{item.label}</span>
                        <Progress
                          value={item.score * 10}
                          className={`h-2 flex-1 ${progressColor(item.score)}`}
                        />
                        <span className={`text-sm font-semibold w-6 text-right ${scoreColor(item.score)}`}>
                          {item.score}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(feedback.strengths || []).map((s, i) => (
                    <li key={i} className="text-sm text-[#444] flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-amber-500" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(feedback.improvements || []).map((s, i) => (
                    <li key={i} className="text-sm text-[#444] flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">-</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#4242EA]" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(feedback.specific_tips || []).map((s, i) => (
                    <li key={i} className="text-sm text-[#444] flex items-start gap-2">
                      <span className="text-[#4242EA] mt-0.5 shrink-0">*</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {feedback.summary && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-[#444] leading-relaxed">{feedback.summary}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {feedback?.parse_error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-[#666]">{feedback.summary}</p>
          </CardContent>
        </Card>
      )}

      {messages.length > 0 && (
        <Card className="mb-6">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Full Transcript ({messages.length} messages)
            </CardTitle>
          </CardHeader>
          {showTranscript && (
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm ${
                      msg.role === 'interviewer' ? 'text-[#4242EA]' : 'text-[#1a1a1a]'
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.role === 'interviewer' ? 'Interviewer' : 'You'}:
                    </span>{' '}
                    {msg.content}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          className="bg-[#4242EA] hover:bg-[#3535c0] text-white"
          onClick={() => navigate('/pathfinder/mock-interview')}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Interview
        </Button>
        <Button variant="outline" onClick={() => navigate('/pathfinder/mock-interview/history')}>
          View All History
        </Button>
        {messages.length > 0 && (
          <Button
            variant="outline"
            onClick={() => { setFeedback(null); generateFeedback(); }}
            disabled={generating}
          >
            {generating ? 'Regenerating...' : 'Regenerate Feedback'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default MockInterviewFeedback;
