import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  format, addDays, eachWeekOfInterval, eachMonthOfInterval,
  startOfMonth, endOfMonth, differenceInDays, startOfDay,
} from 'date-fns';
import type { GanttZoom } from './types';

interface GanttHeaderProps {
  timelineRange: { start: Date; end: Date; totalDays: number };
  dayWidth: number;
  zoom: GanttZoom;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ timelineRange, dayWidth, zoom }) => {
  const totalWidth = timelineRange.totalDays * dayWidth;

  const labels = useMemo(() => {
    const result: { x: number; width: number; label: string }[] = [];

    if (zoom === 'day') {
      for (let i = 0; i < timelineRange.totalDays; i++) {
        const date = addDays(timelineRange.start, i);
        result.push({
          x: i * dayWidth,
          width: dayWidth,
          label: format(date, 'EEE d'),
        });
      }
    } else if (zoom === 'week') {
      const weeks = eachWeekOfInterval(
        { start: timelineRange.start, end: timelineRange.end },
        { weekStartsOn: 1 }
      );
      for (const weekStart of weeks) {
        const weekEnd = addDays(weekStart, 6);
        const startOffset = Math.max(
          0,
          differenceInDays(startOfDay(weekStart), startOfDay(timelineRange.start))
        );
        const endOffset = Math.min(
          timelineRange.totalDays,
          differenceInDays(startOfDay(weekEnd), startOfDay(timelineRange.start)) + 1
        );
        const width = (endOffset - startOffset) * dayWidth;
        if (width > 0) {
          result.push({
            x: startOffset * dayWidth,
            width,
            label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd')}`,
          });
        }
      }
    } else {
      // month
      const months = eachMonthOfInterval({
        start: timelineRange.start,
        end: timelineRange.end,
      });
      for (const monthStart of months) {
        const monthEnd = endOfMonth(monthStart);
        const startOffset = Math.max(
          0,
          differenceInDays(startOfDay(monthStart), startOfDay(timelineRange.start))
        );
        const endOffset = Math.min(
          timelineRange.totalDays,
          differenceInDays(startOfDay(monthEnd), startOfDay(timelineRange.start)) + 1
        );
        const width = (endOffset - startOffset) * dayWidth;
        if (width > 0) {
          result.push({
            x: startOffset * dayWidth,
            width,
            label: format(monthStart, 'MMM yyyy'),
          });
        }
      }
    }

    return result;
  }, [timelineRange, dayWidth, zoom]);

  return (
    <Box sx={{
      height: 32, display: 'flex', alignItems: 'center',
      borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: 'grey.50', overflowX: 'hidden', position: 'relative',
      minWidth: totalWidth,
    }}>
      {labels.map((l, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: l.x,
            width: l.width,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption" sx={{
            fontSize: zoom === 'day' ? '0.6rem' : '0.65rem',
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}>
            {l.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default GanttHeader;
