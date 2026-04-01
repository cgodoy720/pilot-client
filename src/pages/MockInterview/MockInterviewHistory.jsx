import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { getInterviewHistory } from '../../services/mockInterviewApi';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Clock, ArrowLeft, ChevronRight, Loader2, Mic } from 'lucide-react';

function MockInterviewHistory() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [interviews, setInterviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getInterviewHistory(token, page);
      setInterviews(data.interviews || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'abandoned':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Abandoned</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">In Progress</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pathfinder/mock-interview')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Interview History</h1>
        </div>
        <Button
          className="bg-[#4242EA] hover:bg-[#3535c0] text-white"
          onClick={() => navigate('/pathfinder/mock-interview')}
        >
          <Mic className="w-4 h-4 mr-2" />
          New Interview
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4242EA]" />
        </div>
      ) : interviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mic className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">No interviews yet</h2>
            <p className="text-[#666] mb-4">Start your first mock interview to begin practicing.</p>
            <Button
              className="bg-[#4242EA] hover:bg-[#3535c0] text-white"
              onClick={() => navigate('/pathfinder/mock-interview')}
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {interviews.map((iv) => {
              const score = iv.feedback_summary?.overall_score;
              return (
                <Card
                  key={iv.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    iv.status === 'completed'
                      ? navigate(`/pathfinder/mock-interview/feedback/${iv.id}`)
                      : null
                  }
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            iv.interview_type === 'technical'
                              ? 'bg-[#FF33FF]/10 text-[#FF33FF] border-[#FF33FF]/30'
                              : 'bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/30'
                          }
                        >
                          {iv.interview_type === 'technical' ? 'Technical' : 'Behavioral'}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">
                            {iv.focus_area && iv.focus_area !== 'general'
                              ? iv.focus_area.replace(/_/g, ' ')
                              : 'General'}
                          </p>
                          <p className="text-xs text-[#999]">{formatDate(iv.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#666] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(iv.duration_seconds)}
                        </span>
                        {score != null && (
                          <span
                            className={`text-lg font-bold ${
                              score >= 8
                                ? 'text-green-600'
                                : score >= 6
                                ? 'text-[#4242EA]'
                                : score >= 4
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {score}/10
                          </span>
                        )}
                        {statusBadge(iv.status)}
                        {iv.status === 'completed' && (
                          <ChevronRight className="w-4 h-4 text-[#ccc]" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-[#666] flex items-center px-3">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MockInterviewHistory;
