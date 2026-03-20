import React, { useState, useEffect, useCallback } from 'react';
import { addDays, format } from 'date-fns';
import type { GanttRow, ProjectMutations } from './types';
import { ROW_HEIGHT, TASK_STATUS_COLOR } from './constants';
import { dateToPixel, inferStartDate } from './helpers';

interface GanttBarProps {
  row: GanttRow;
  rowIndex: number;
  dayWidth: number;
  timelineStart: Date;
  mutations?: ProjectMutations;
  isSummary?: boolean;
}

interface DragState {
  mode: 'move' | 'resize-left' | 'resize-right';
  startX: number;
  origStart: Date;
  origEnd: Date;
}

const GanttBar: React.FC<GanttBarProps> = ({
  row, rowIndex, dayWidth, timelineStart, mutations, isSummary,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewDates, setPreviewDates] = useState<{ start: Date; end: Date } | null>(null);

  const startDate = previewDates?.start || row.startDate!;
  const endDate = previewDates?.end || row.endDate!;
  const x = dateToPixel(startDate, timelineStart, dayWidth);
  const barWidth = Math.max(dateToPixel(endDate, timelineStart, dayWidth) - x, dayWidth);
  const y = rowIndex * ROW_HEIGHT + (isSummary ? 12 : 6);
  const height = isSummary ? 12 : 24;
  const color = TASK_STATUS_COLOR[row.status] || '#9e9e9e';
  const progressWidth = (row.progress / 100) * barWidth;

  // Check if dates were inferred (dashed border)
  const isInferred = !row.startDate || !row.endDate;

  const handleMouseDown = useCallback((e: React.MouseEvent, mode: DragState['mode']) => {
    if (isSummary || !mutations) return;
    e.stopPropagation();
    e.preventDefault();
    setDragState({ mode, startX: e.clientX, origStart: startDate, origEnd: endDate });
  }, [isSummary, mutations, startDate, endDate]);

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaPx / dayWidth);
      if (deltaDays === 0 && !previewDates) return;

      let newStart = dragState.origStart;
      let newEnd = dragState.origEnd;

      if (dragState.mode === 'move') {
        newStart = addDays(dragState.origStart, deltaDays);
        newEnd = addDays(dragState.origEnd, deltaDays);
      } else if (dragState.mode === 'resize-right') {
        newEnd = addDays(dragState.origEnd, deltaDays);
        if (newEnd <= newStart) newEnd = addDays(newStart, 1);
      } else if (dragState.mode === 'resize-left') {
        newStart = addDays(dragState.origStart, deltaDays);
        if (newStart >= newEnd) newStart = addDays(newEnd, -1);
      }

      setPreviewDates({ start: newStart, end: newEnd });
    };

    const handleUp = () => {
      if (previewDates && mutations) {
        mutations.updateTaskDates(
          row.id,
          format(previewDates.start, 'yyyy-MM-dd'),
          format(previewDates.end, 'yyyy-MM-dd')
        );
      }
      setDragState(null);
      setPreviewDates(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState, previewDates, dayWidth, mutations, row.id]);

  return (
    <g>
      {/* Background bar */}
      <rect
        x={x} y={y} width={barWidth} height={height}
        rx={isSummary ? 2 : 4}
        fill={color}
        opacity={0.25}
        strokeDasharray={isInferred ? '4 2' : undefined}
        stroke={isInferred ? color : undefined}
        strokeWidth={isInferred ? 1 : undefined}
      />

      {/* Progress fill */}
      {progressWidth > 0 && (
        <rect
          x={x} y={y} width={Math.min(progressWidth, barWidth)} height={height}
          rx={isSummary ? 2 : 4}
          fill={color}
          opacity={0.7}
        />
      )}

      {/* Title text (only if bar is wide enough) */}
      {!isSummary && barWidth > 60 && (
        <text
          x={x + 6}
          y={y + height / 2 + 4}
          fontSize={11}
          fill="#333"
          style={{ pointerEvents: 'none' }}
        >
          {row.label.length > barWidth / 7
            ? row.label.substring(0, Math.floor(barWidth / 7)) + '...'
            : row.label}
        </text>
      )}

      {/* Drag handles for task bars */}
      {!isSummary && mutations && (
        <>
          {/* Left resize handle */}
          <rect
            x={x - 2} y={y} width={6} height={height}
            fill="transparent" cursor="col-resize"
            onMouseDown={e => handleMouseDown(e, 'resize-left')}
          />
          {/* Center move handle */}
          <rect
            x={x + 4} y={y} width={Math.max(barWidth - 8, 1)} height={height}
            fill="transparent" cursor="grab"
            onMouseDown={e => handleMouseDown(e, 'move')}
          />
          {/* Right resize handle */}
          <rect
            x={x + barWidth - 4} y={y} width={6} height={height}
            fill="transparent" cursor="col-resize"
            onMouseDown={e => handleMouseDown(e, 'resize-right')}
          />
        </>
      )}
    </g>
  );
};

export default GanttBar;
