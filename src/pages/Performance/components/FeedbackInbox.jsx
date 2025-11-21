import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { filterFeedback } from '../../../utils/performanceFeedbackService';

const FeedbackInbox = ({ userId, feedbackData, onTaskClick, onIncompleteTaskNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Filter feedback based on search and type
  const filteredFeedback = useMemo(() => {
    return filterFeedback(feedbackData, searchTerm, typeFilter);
  }, [feedbackData, searchTerm, typeFilter]);

  const handleToggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch (error) {
      return '--';
    }
  };

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'hsl(var(--muted))';
    if (score >= 90) return 'hsl(142 76% 36%)'; // green
    if (score >= 80) return 'hsl(221 83% 53%)'; // blue
    if (score >= 70) return 'hsl(48 96% 53%)'; // yellow
    return 'hsl(0 84% 60%)'; // red
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Work Product': return 'hsl(221 83% 53%)'; // blue
      case 'Comprehension': return 'hsl(271 81% 56%)'; // purple
      case 'Peer Feedback': return 'hsl(336 75% 40%)'; // pink
      default: return 'hsl(var(--muted))';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'var(--font-family-bold)' }}>Inbox</h2>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-8 border-[#E5E7EB] bg-white text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Work Product">Work Product</SelectItem>
              <SelectItem value="Comprehension">Comprehension</SelectItem>
              <SelectItem value="Peer Feedback">Peer Feedback</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 h-8 border-[#E5E7EB] bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[80px_120px_1fr_60px_60px] gap-4 p-3 mb-1">
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Type</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Subject</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Score</div>
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Fav</div>
      </div>

      {/* Feedback List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
            <p className="text-[#6B7280]">
              {feedbackData.length === 0 
                ? "No feedback data available yet." 
                : "No feedback found for the selected filters."
              }
            </p>
            {feedbackData.length === 0 && (
              <p className="text-xs text-[#9CA3AF]">
                Complete some assignments to see your feedback here.
              </p>
            )}
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <Collapsible
              key={item.id}
              open={expandedItems.has(item.id)}
              onOpenChange={() => handleToggleExpand(item.id)}
            >
              <Card className="border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors bg-white rounded-[8px] mb-2">
                <CollapsibleTrigger asChild>
                  <div className="grid grid-cols-[80px_120px_1fr_60px_60px] gap-4 p-3 cursor-pointer items-center">
                    <div className="text-sm text-[#6B7280]">
                      {formatDate(item.date)}
                    </div>
                    <div>
                      <Badge 
                        className="text-white font-medium"
                        style={{ 
                          backgroundColor: getTypeColor(item.type)
                        }}
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1F2937] truncate">{item.subject}</span>
                      {!item.isComplete && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Incomplete" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {item.score !== null && item.score !== undefined && (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getScoreColor(item.score) }}
                          title={`Score: ${item.score}%`}
                        />
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Button variant="ghost" size="sm" className="text-[#4242EA] text-xs px-2 py-1 hover:bg-[#F3F4F6]">
                        {expandedItems.has(item.id) ? 'Close' : 'Open'}
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-[#E5E7EB] p-4">
                    <div className="space-y-4">
                      {/* Positive Message */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#4242EA] mb-2">You're doing awesome!</h3>
                        <p className="text-[#6B7280] leading-relaxed">
                          {item.content || 'Great work on this assignment. Keep up the excellent progress!'}
                        </p>
                      </div>

                      {/* Skills Tags */}
                      {item.skills && item.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#1F2937] mb-2">You did great with:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Improvement Areas */}
                      {item.improvementAreas && item.improvementAreas.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#1F2937] mb-2">Let's work on:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.improvementAreas.map((area, idx) => (
                              <Badge key={idx} variant="outline" className="border-purple-300 text-purple-700">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Info */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6B7280]">
                          Analyzed Content: {item.contentType}
                        </span>
                        <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]">
                          Review
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {!item.isComplete && (
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onIncompleteTaskNavigate(item)}
                          >
                            Complete this activity
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.isComplete && (
                          <Button 
                            variant="outline"
                            className="border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
                            onClick={() => onTaskClick(item)}
                          >
                            Go to this activity
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackInbox;
