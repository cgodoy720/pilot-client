import React, { useState } from 'react';
import type { GanttRow } from './types';
import type { DependencyEdge } from './helpers';
import { ROW_HEIGHT } from './constants';
import { dateToPixel } from './helpers';

interface GanttDependencyArrowProps {
  edge: DependencyEdge;
  rows: GanttRow[];
  dayWidth: number;
  timelineStart: Date;
}

const GanttDependencyArrow: React.FC<GanttDependencyArrowProps> = ({
  edge, rows, dayWidth, timelineStart,
}) => {
  const [hovered, setHovered] = useState(false);
  const fromRow = rows[edge.fromRowIndex];
  const toRow = rows[edge.toRowIndex];

  if (!fromRow?.endDate || !toRow?.startDate) return null;

  const fromX = dateToPixel(fromRow.endDate, timelineStart, dayWidth);
  const fromY = edge.fromRowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
  const toX = dateToPixel(toRow.startDate, timelineStart, dayWidth);
  const toY = edge.toRowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
  const midX = fromX + 12;

  // Right-angle connector: horizontal stub -> vertical -> horizontal to target
  const d = `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={hovered ? '#666' : '#bdbdbd'}
      strokeWidth={1.5}
      markerEnd="url(#arrowhead)"
      style={{ transition: 'stroke 0.15s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
};

export default GanttDependencyArrow;
