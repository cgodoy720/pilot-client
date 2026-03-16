import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { formatDollarMillions } from '../utils/formatters';
import { format, parseISO, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

const PRIORITY_ORDER_KEY = 'pursuit-priority-order';

export interface PriorityOpp {
  Id: string;
  Name: string;
  StageName: string;
  Amount: number;
  CloseDate: string;
  Probability: number;
  OwnerId?: string;
  Account?: { Name: string; Id?: string };
  LastModifiedDate?: string;
  tasks?: Array<{ Id: string; Subject: string; ActivityDate: string; Priority: string; Status: string }>;
  nextEvent?: { summary: string; start: string };
}

interface UrgencyScore {
  score: number;
  reasons: string[];
}

function computeUrgency(opp: PriorityOpp): UrgencyScore {
  const reasons: string[] = [];
  let score = 0;
  const now = startOfDay(new Date());

  // Close date urgency
  if (opp.CloseDate) {
    const close = parseISO(opp.CloseDate);
    const daysUntil = differenceInDays(close, now);
    if (daysUntil < 0) {
      score += 40;
      reasons.push(`Overdue by ${Math.abs(daysUntil)} days`);
    } else if (daysUntil <= 7) {
      score += 30;
      reasons.push(`Closing in ${daysUntil} days`);
    } else if (daysUntil <= 30) {
      score += 15;
      reasons.push(`Closing in ${daysUntil} days`);
    }
  }

  // Overdue tasks
  const overdueTasks = (opp.tasks || []).filter((t) => {
    if (!t.ActivityDate) return false;
    return isBefore(parseISO(t.ActivityDate), now) && t.Status !== 'Completed';
  });
  if (overdueTasks.length > 0) {
    score += 20;
    reasons.push(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`);
  }

  // Stale (no activity in 30+ days)
  if (opp.LastModifiedDate) {
    const daysSinceActivity = differenceInDays(now, parseISO(opp.LastModifiedDate));
    if (daysSinceActivity > 30) {
      score += 15;
      reasons.push(`Stale — ${daysSinceActivity} days since activity`);
    }
  }

  // Meeting prep needed (event in next 2+ days)
  if (opp.nextEvent?.start) {
    const eventDate = parseISO(opp.nextEvent.start);
    const daysUntilEvent = differenceInDays(eventDate, now);
    if (daysUntilEvent > 0 && daysUntilEvent <= 3) {
      score += 10;
      reasons.push(`Meeting in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}: ${opp.nextEvent.summary}`);
    }
  }

  // Higher amount = slight urgency boost
  if (opp.Amount > 500000) score += 5;
  if (opp.Amount > 1000000) score += 5;

  return { score, reasons };
}

interface PriorityListProps {
  opportunities: PriorityOpp[];
  onOppClick?: (opp: PriorityOpp) => void;
}

const PriorityList: React.FC<PriorityListProps> = ({ opportunities, onOppClick }) => {
  // Load manual order from localStorage
  const [manualOrder, setManualOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PRIORITY_ORDER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Compute urgency and sort
  const sortedOpps = useMemo(() => {
    const scored = opportunities.map((opp) => ({
      opp,
      urgency: computeUrgency(opp),
    }));

    // If manual order exists, use it; otherwise sort by urgency
    if (manualOrder.length > 0) {
      const orderMap = new Map(manualOrder.map((id, idx) => [id, idx]));
      scored.sort((a, b) => {
        const aIdx = orderMap.get(a.opp.Id) ?? 999;
        const bIdx = orderMap.get(b.opp.Id) ?? 999;
        if (aIdx !== bIdx) return aIdx - bIdx;
        return b.urgency.score - a.urgency.score;
      });
    } else {
      scored.sort((a, b) => b.urgency.score - a.urgency.score);
    }
    return scored;
  }, [opportunities, manualOrder]);

  // Drag and drop reorder
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = sortedOpps.map((s) => s.opp.Id);
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedId);

    setManualOrder(newOrder);
    localStorage.setItem(PRIORITY_ORDER_KEY, JSON.stringify(newOrder));
    setDraggedId(null);
  };

  const urgencyColor = (score: number) => {
    if (score >= 40) return 'error';
    if (score >= 20) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {sortedOpps.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No open opportunities to prioritize.
        </Typography>
      ) : (
        sortedOpps.map(({ opp, urgency }, idx) => {
          const isExpanded = expandedId === opp.Id;
          const overdueTasks = (opp.tasks || []).filter(
            (t) => t.ActivityDate && isBefore(parseISO(t.ActivityDate), startOfDay(new Date())) && t.Status !== 'Completed'
          );
          const upcomingTasks = (opp.tasks || []).filter(
            (t) => t.ActivityDate && !isBefore(parseISO(t.ActivityDate), startOfDay(new Date())) && t.Status !== 'Completed'
          );

          return (
            <Paper
              key={opp.Id}
              variant="outlined"
              draggable
              onDragStart={(e) => handleDragStart(e, opp.Id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, opp.Id)}
              sx={{
                p: 1.5,
                cursor: 'grab',
                opacity: draggedId === opp.Id ? 0.5 : 1,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                transition: 'all 0.15s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {/* Drag handle */}
                <DragIcon sx={{ color: 'text.disabled', mt: 0.5, cursor: 'grab' }} fontSize="small" />

                {/* Rank number */}
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: urgency.score >= 40 ? 'error.main' : urgency.score >= 20 ? 'warning.main' : 'grey.300',
                    color: urgency.score >= 20 ? 'white' : 'text.primary',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Typography>

                {/* Main content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => onOppClick?.(opp)}
                    >
                      {opp.Name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flexShrink: 0, ml: 1 }}>
                      {opp.Amount ? formatDollarMillions(opp.Amount) : '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      {opp.Account?.Name || 'No Account'}
                    </Typography>
                    <Chip label={opp.StageName} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    {opp.CloseDate && (
                      <Typography variant="caption" color="text.secondary">
                        <ClockIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.25 }} />
                        {format(parseISO(opp.CloseDate), 'MMM d')}
                      </Typography>
                    )}
                    {opp.Probability > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {opp.Probability}%
                      </Typography>
                    )}
                  </Box>

                  {/* Urgency reasons */}
                  {urgency.reasons.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {urgency.reasons.map((reason, i) => (
                        <Chip
                          key={i}
                          icon={<WarningIcon sx={{ fontSize: '14px !important' }} />}
                          label={reason}
                          size="small"
                          color={urgencyColor(urgency.score) as any}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Inline tasks (expandable) */}
                  {(opp.tasks?.length || 0) > 0 && (
                    <>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mt: 0.5, cursor: 'pointer' }}
                        onClick={() => setExpandedId(isExpanded ? null : opp.Id)}
                      >
                        <TaskIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {opp.tasks!.length} task{opp.tasks!.length > 1 ? 's' : ''}
                          {overdueTasks.length > 0 && ` (${overdueTasks.length} overdue)`}
                        </Typography>
                        {isExpanded ? (
                          <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        )}
                      </Box>
                      <Collapse in={isExpanded}>
                        <Box sx={{ pl: 2, mt: 0.5 }}>
                          {[...overdueTasks, ...upcomingTasks].map((task) => (
                            <Box
                              key={task.Id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                py: 0.25,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isBefore(parseISO(task.ActivityDate), startOfDay(new Date()))
                                    ? 'error.main'
                                    : 'text.secondary',
                                  minWidth: 60,
                                }}
                              >
                                {task.ActivityDate ? format(parseISO(task.ActivityDate), 'MMM d') : '-'}
                              </Typography>
                              <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                                {task.Subject}
                              </Typography>
                              {task.Priority === 'High' && (
                                <Chip label="High" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );
};

export default PriorityList;
