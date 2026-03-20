import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { differenceInDays, startOfDay } from 'date-fns';
import type { GanttRow, ProjectMutations, GanttZoom } from './types';
import type { DependencyEdge } from './helpers';
import { ROW_HEIGHT } from './constants';
import { dateToPixel, getWeekendOffsets } from './helpers';
import GanttBar from './GanttBar';
import GanttDependencyArrow from './GanttDependencyArrow';
import GanttHeader from './GanttHeader';

interface GanttTimelineProps {
  rows: GanttRow[];
  timelineRange: { start: Date; end: Date; totalDays: number };
  dayWidth: number;
  zoom: GanttZoom;
  depEdges: DependencyEdge[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  mutations: ProjectMutations;
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({
  rows, timelineRange, dayWidth, zoom, depEdges, scrollRef, onScroll, mutations,
}) => {
  const totalWidth = timelineRange.totalDays * dayWidth;
  const totalHeight = rows.length * ROW_HEIGHT;

  const todayX = useMemo(() => {
    const today = startOfDay(new Date());
    return dateToPixel(today, timelineRange.start, dayWidth);
  }, [timelineRange.start, dayWidth]);

  const weekendOffsets = useMemo(
    () => getWeekendOffsets(timelineRange.start, timelineRange.totalDays, dayWidth),
    [timelineRange, dayWidth]
  );

  // Grid lines — one per day (only render at day/week zoom to avoid visual noise)
  const gridLines = useMemo(() => {
    if (zoom === 'month') return [];
    const lines: number[] = [];
    for (let i = 0; i <= timelineRange.totalDays; i++) {
      lines.push(i * dayWidth);
    }
    return lines;
  }, [timelineRange.totalDays, dayWidth, zoom]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sticky date header */}
      <GanttHeader timelineRange={timelineRange} dayWidth={dayWidth} zoom={zoom} />

      {/* Scrollable SVG body */}
      <Box
        ref={scrollRef as any}
        onScroll={onScroll}
        sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}
      >
        <svg width={totalWidth} height={totalHeight} style={{ display: 'block' }}>
          {/* Alternating row stripes */}
          {rows.map((_, i) => (
            <rect
              key={`stripe-${i}`}
              x={0} y={i * ROW_HEIGHT}
              width={totalWidth} height={ROW_HEIGHT}
              fill={i % 2 === 0 ? 'transparent' : '#fafafa'}
            />
          ))}

          {/* Weekend shading */}
          {weekendOffsets.map((wx, i) => (
            <rect
              key={`weekend-${i}`}
              x={wx} y={0}
              width={dayWidth} height={totalHeight}
              fill="#f5f5f5"
            />
          ))}

          {/* Grid lines */}
          {gridLines.map((gx, i) => (
            <line
              key={`grid-${i}`}
              x1={gx} y1={0} x2={gx} y2={totalHeight}
              stroke="#eee" strokeWidth={1}
            />
          ))}

          {/* Today marker */}
          {todayX >= 0 && todayX <= totalWidth && (
            <line
              x1={todayX} y1={0} x2={todayX} y2={totalHeight}
              stroke="#f57c00" strokeWidth={2} strokeDasharray="4 2"
            />
          )}

          {/* Summary bars (workstream/milestone) */}
          {rows.map((row, i) => {
            if (row.type === 'task' || !row.startDate || !row.endDate) return null;
            return (
              <GanttBar
                key={row.id}
                row={row}
                rowIndex={i}
                dayWidth={dayWidth}
                timelineStart={timelineRange.start}
                isSummary
              />
            );
          })}

          {/* Task bars */}
          {rows.map((row, i) => {
            if (row.type !== 'task' || !row.startDate || !row.endDate) return null;
            return (
              <GanttBar
                key={row.id}
                row={row}
                rowIndex={i}
                dayWidth={dayWidth}
                timelineStart={timelineRange.start}
                mutations={mutations}
              />
            );
          })}

          {/* Dependency arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#bdbdbd" />
            </marker>
          </defs>
          {depEdges.map((edge, i) => (
            <GanttDependencyArrow
              key={`dep-${i}`}
              edge={edge}
              rows={rows}
              dayWidth={dayWidth}
              timelineStart={timelineRange.start}
            />
          ))}
        </svg>
      </Box>
    </Box>
  );
};

export default GanttTimeline;
