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
import { Loader2 } from 'lucide-react';
import { Clock, User, FileEdit, RotateCcw } from 'lucide-react';
import LoadingState from './shared/LoadingState';
import EmptyState from './shared/EmptyState';

const HistoryTab = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState([]);
  const [filterUser, setFilterUser] = useState('all');
  const [filterDays, setFilterDays] = useState('7');
  const [selectedCohort, setSelectedCohort] = useState('');
  const [cohorts, setCohorts] = useState([]);

  const canEdit = user?.role === 'staff' || user?.role === 'admin';

  // Fetch cohorts on mount
  useEffect(() => {
    fetchCohorts();
  }, []);

  // Fetch changes when filters change
  useEffect(() => {
    if (selectedCohort) {
      fetchChangeHistory();
    }
  }, [selectedCohort, filterUser, filterDays]);

  const fetchCohorts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/cohorts`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const cohortList = await response.json();
        setCohorts(cohortList);
        if (cohortList.length > 0) {
          setSelectedCohort(cohortList[0]); // Auto-select first cohort
        }
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchChangeHistory = async () => {
    setLoading(true);
    
    try {
      const userIdParam = filterUser === 'all' ? '' : `&userId=${user?.userId}`;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/curriculum/changes/recent?cohort=${selectedCohort}&limit=50${userIdParam}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Filter by time period
        const now = new Date();
        const filtered = data.filter(change => {
          if (filterDays === 'all') return true;
          const changeDate = new Date(change.changed_at);
          const daysDiff = (now - changeDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= parseInt(filterDays);
        });
        
        setChanges(filtered);
      } else {
        setChanges([]);
      }
    } catch (error) {
      console.error('Error fetching changes:', error);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  };

  // Use real changes data (no mock fallback needed)

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

  if (loading && !selectedCohort) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#4242EA] animate-spin mb-3" />
        <p className="text-[#666] font-proxima">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-[#C8C8C8] rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-proxima text-sm text-[#666]">Cohort:</label>
            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className="w-[200px] font-proxima">
                <SelectValue placeholder="Select cohort..." />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map(cohort => (
                  <SelectItem key={cohort} value={cohort} className="font-proxima">
                    {cohort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4242EA] animate-spin mb-3" />
          <p className="text-[#666] font-proxima">Loading changes...</p>
        </div>
      ) : changes.length === 0 ? (
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
