import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Clock, User, FileEdit, RotateCcw } from 'lucide-react';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';

const HistoryTab = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState([]);
  const [filterUser, setFilterUser] = useState('all');
  const [filterDays, setFilterDays] = useState('7');

  const canEdit = user?.role === 'staff' || user?.role === 'admin';

  useEffect(() => {
    fetchChangeHistory();
  }, [filterUser, filterDays]);

  const fetchChangeHistory = async () => {
    // Mock data for Phase 1 - will be replaced with real API in Phase 2
    setLoading(true);
    
    setTimeout(() => {
      const mockChanges = [
        {
          id: 1,
          entity_type: 'task',
          entity_id: 123,
          task_title: 'Spaghetti and Marshmallow Challenge',
          field_name: 'task_description',
          old_value: 'Build the tallest tower using AI assistance',
          new_value: 'Build the tallest tower with AI assistance while learning collaborative problem-solving and effective prompting',
          changed_by_name: 'Sarah Johnson',
          changed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          cohort: 'March 2025',
          day_number: 40
        },
        {
          id: 2,
          entity_type: 'task',
          entity_id: 124,
          task_title: 'How AI Learns',
          field_name: 'questions',
          old_value: '["What is an LLM?", "How does it work?"]',
          new_value: '["Work with your LLM to research what an LLM is", "Turn to a partner and compare explanations", "Identify 2-3 tasks in your work life that involve pattern recognition"]',
          changed_by_name: 'Michael Chen',
          changed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          cohort: 'March 2025',
          day_number: 40
        },
        {
          id: 3,
          entity_type: 'task',
          entity_id: 125,
          task_title: 'Program Onboarding',
          field_name: 'intro',
          old_value: 'Welcome to the AI Native Builder program!',
          new_value: 'Welcome to the AI Native Builder program! Today you\'re starting your journey to get really good at using AI to build meaningful projects.',
          changed_by_name: 'Sarah Johnson',
          changed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          cohort: 'March 2025',
          day_number: 40
        }
      ];
      
      setChanges(mockChanges);
      setLoading(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatFieldName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getChangeIcon = (fieldName) => {
    return <FileEdit className="h-4 w-4" />;
  };

  const truncateValue = (value, maxLength = 100) => {
    if (!value) return 'None';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <LoadingState message="Loading change history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-proxima text-sm text-[#666]">Time Period:</label>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-[180px] font-proxima">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-proxima text-sm text-[#666]">Changed By:</label>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[180px] font-proxima">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value={user?.userId}>Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Change History List */}
      {changes.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No changes found"
          description="No curriculum changes have been made in the selected time period."
        />
      ) : (
        <div className="space-y-4">
          {changes.map(change => (
            <Card key={change.id} className="border-[#C8C8C8]">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#4242EA] text-white">
                        {getChangeIcon(change.field_name)}
                        <span className="ml-1">{formatFieldName(change.field_name)}</span>
                      </Badge>
                      <span className="text-sm font-proxima text-[#666]">in</span>
                      <span className="text-sm font-proxima-bold text-[#1E1E1E]">
                        {change.task_title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-[#666]">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="font-proxima">{change.changed_by_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-proxima">{formatDate(change.changed_at)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-[#C8C8C8]">
                        Day {change.day_number}
                      </Badge>
                    </div>
                  </div>

                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#C8C8C8] text-[#666] hover:text-[#4242EA] hover:border-[#4242EA] ml-4"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Revert
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-[#666] font-proxima-bold">Previous Value:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="font-mono text-xs text-[#1E1E1E]">
                        {truncateValue(change.old_value)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#666] font-proxima-bold">New Value:</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="font-mono text-xs text-[#1E1E1E]">
                        {truncateValue(change.new_value)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
