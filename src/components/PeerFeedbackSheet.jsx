import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PeerFeedbackSheet = ({ isOpen, onClose, dayNumber, cohort, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeers, setSelectedPeers] = useState(new Set());
  const [peerFeedback, setPeerFeedback] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch cohort users when sheet opens
  useEffect(() => {
    if (isOpen && cohort) {
      fetchCohortUsers();
    }
    
    // Reset state when sheet closes
    if (!isOpen) {
      setSearchTerm('');
      setSelectedPeers(new Set());
      setPeerFeedback({});
      setError(null);
    }
  }, [isOpen, cohort]);

  const fetchCohortUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?cohort=${encodeURIComponent(cohort)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load cohort users');
      }

      const data = await response.json();
      
      // Handle different response formats
      let usersList = [];
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format from server');
      }
      
      // Sort users alphabetically by first name, then last name
      const sortedUsers = usersList.sort((a, b) => {
        const nameA = `${a.first_name?.toLowerCase() || ''} ${a.last_name?.toLowerCase() || ''}`;
        const nameB = `${b.first_name?.toLowerCase() || ''} ${b.last_name?.toLowerCase() || ''}`;
        return nameA.localeCompare(nameB);
      });

      setUsers(sortedUsers);
    } catch (err) {
      console.error('Error fetching cohort users:', err);
      setError('Failed to load cohort users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format user name with proper capitalization
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Toggle peer selection
  const togglePeerSelection = (userId) => {
    const newSelected = new Set(selectedPeers);
    
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
      // Remove feedback for unselected peer
      const newFeedback = { ...peerFeedback };
      delete newFeedback[userId];
      setPeerFeedback(newFeedback);
    } else {
      newSelected.add(userId);
      // Initialize feedback for newly selected peer
      setPeerFeedback(prev => ({
        ...prev,
        [userId]: ''
      }));
    }
    
    setSelectedPeers(newSelected);
  };

  // Handle feedback text change
  const handleFeedbackChange = (userId, text) => {
    setPeerFeedback(prev => ({
      ...prev,
      [userId]: text
    }));
  };

  // Validate submission
  const validateSubmission = () => {
    if (selectedPeers.size === 0) {
      toast.error('Please select at least one peer');
      return false;
    }

    // Check that all selected peers have feedback
    for (const userId of selectedPeers) {
      if (!peerFeedback[userId]?.trim()) {
        const user = users.find(u => u.user_id === userId);
        const name = user ? `${formatName(user.first_name)} ${formatName(user.last_name)}` : 'this peer';
        toast.error(`Please provide feedback for ${name}`);
        return false;
      }
    }

    return true;
  };

  // Submit feedback
  const handleSubmit = async () => {
    if (!validateSubmission()) {
      return;
    }

    try {
      setSubmitting(true);

      // Format feedback entries
      const feedbackEntries = Array.from(selectedPeers).map(userId => ({
        to_user_id: userId,
        feedback_text: peerFeedback[userId].trim()
      }));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/feedback/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            feedbackEntries,
            dayNumber
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      // Success!
      toast.success('Peer Feedback Submitted', {
        description: `Successfully submitted feedback for ${selectedPeers.size} ${selectedPeers.size === 1 ? 'peer' : 'peers'}.`,
        duration: 4000
      });

      // Close the sheet
      onClose();
    } catch (err) {
      console.error('Error submitting peer feedback:', err);
      toast.error('Submission Failed', {
        description: err.message || 'Failed to submit peer feedback. Please try again.',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Peer Feedback
          </SheetTitle>
          <SheetDescription>
            Select peers you worked with today and provide feedback for each person.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading cohort members...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 max-w-sm">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={fetchCohortUsers} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Two-column layout */}
            <div className="flex-1 flex gap-4 overflow-hidden">
              {/* Left Column - Peer Selection */}
              <div className="w-[40%] flex flex-col gap-3 overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Select Peers</h3>
                    <Badge variant="secondary" className="font-normal">
                      {selectedPeers.size} selected
                    </Badge>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                {/* Scrollable Peer List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-3">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <Card
                          key={user.user_id}
                          className={`cursor-pointer transition-colors hover:bg-accent ${
                            selectedPeers.has(user.user_id) ? 'border-primary bg-accent' : ''
                          }`}
                          onClick={() => togglePeerSelection(user.user_id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedPeers.has(user.user_id)}
                                onCheckedChange={() => togglePeerSelection(user.user_id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="font-medium text-sm">
                                {formatName(user.first_name)} {formatName(user.last_name)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? 'No matches' : 'No peers found'}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column - Feedback Input */}
              <div className="flex-1 flex flex-col gap-3 overflow-hidden border-l pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Write Feedback</h3>
                  {selectedPeers.size > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {Array.from(selectedPeers).filter(id => peerFeedback[id]?.trim()).length} of {selectedPeers.size} complete
                    </span>
                  )}
                </div>

                {selectedPeers.size === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2 max-w-xs">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Select peers from the left to provide feedback
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-4 pr-3">
                      {Array.from(selectedPeers).map(userId => {
                        const user = users.find(u => u.user_id === userId);
                        if (!user) return null;

                        return (
                          <div key={userId} className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              {formatName(user.first_name)} {formatName(user.last_name)}
                              {peerFeedback[userId]?.trim() && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}
                            </label>
                            <Textarea
                              placeholder={`Your feedback for ${formatName(user.first_name)}...`}
                              value={peerFeedback[userId] || ''}
                              onChange={(e) => handleFeedbackChange(userId, e.target.value)}
                              rows={4}
                              className="resize-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedPeers.size === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Feedback ({selectedPeers.size})</>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PeerFeedbackSheet;

