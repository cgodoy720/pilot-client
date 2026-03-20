import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Chip,
  Popover,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import DateRangeSelector, { type DateRangeValue } from './DateRangeSelector';

type Edge = 'left' | 'right' | 'top' | 'bottom';

export interface PillPosition {
  edge: Edge;
  offset: number; // 0-1 fraction along the edge
}

interface FloatingFilterPillProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  snapshotMode: 'all' | 'filtered' | 'priorities';
  onSnapshotModeChange: (mode: 'all' | 'filtered' | 'priorities') => void;
  snapshotDescription: string;
  label: string;
  position?: PillPosition;
  onPositionChange?: (pos: PillPosition) => void;
}

const DEFAULT_POSITION: PillPosition = { edge: 'right', offset: 0.3 };
const PILL_MARGIN = 12;
const DRAG_THRESHOLD = 5;

/** Convert edge/offset to absolute CSS coords */
function positionToCoords(pos: PillPosition, pillW: number, pillH: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  switch (pos.edge) {
    case 'left':
      return { left: PILL_MARGIN, top: Math.max(PILL_MARGIN, Math.min(vh - pillH - PILL_MARGIN, pos.offset * vh)) };
    case 'right':
      return { left: vw - pillW - PILL_MARGIN, top: Math.max(PILL_MARGIN, Math.min(vh - pillH - PILL_MARGIN, pos.offset * vh)) };
    case 'top':
      return { left: Math.max(PILL_MARGIN, Math.min(vw - pillW - PILL_MARGIN, pos.offset * vw)), top: PILL_MARGIN };
    case 'bottom':
      return { left: Math.max(PILL_MARGIN, Math.min(vw - pillW - PILL_MARGIN, pos.offset * vw)), top: vh - pillH - PILL_MARGIN };
  }
}

/** Snap absolute coords to nearest edge, return PillPosition */
function snapToEdge(x: number, y: number, pillW: number, pillH: number): PillPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = x + pillW / 2;
  const cy = y + pillH / 2;

  const distances: [Edge, number][] = [
    ['left', x],
    ['right', vw - x - pillW],
    ['top', y],
    ['bottom', vh - y - pillH],
  ];
  distances.sort((a, b) => a[1] - b[1]);
  const edge = distances[0][0];

  let offset: number;
  if (edge === 'left' || edge === 'right') {
    offset = Math.max(0, Math.min(1, cy / vh));
  } else {
    offset = Math.max(0, Math.min(1, cx / vw));
  }
  return { edge, offset };
}

const FloatingFilterPill: React.FC<FloatingFilterPillProps> = ({
  dateRange,
  onDateRangeChange,
  snapshotMode,
  onSnapshotModeChange,
  snapshotDescription,
  label,
  position,
  onPositionChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pillRef = useRef<HTMLDivElement>(null);

  const pos = position || DEFAULT_POSITION;
  const [coords, setCoords] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; startLeft: number; startTop: number; moved: boolean } | null>(null);

  // Compute absolute coords from edge/offset
  const recomputeCoords = useCallback(() => {
    if (isMobile || !pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    setCoords(positionToCoords(pos, rect.width, rect.height));
  }, [pos, isMobile]);

  useEffect(() => {
    // Initial position + resize handler
    // Delay initial compute to ensure pill is rendered
    const timer = setTimeout(recomputeCoords, 0);
    window.addEventListener('resize', recomputeCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', recomputeCoords);
    };
  }, [recomputeCoords]);

  // Pointer handlers for drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile) return;
    const el = pillRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: coords.left,
      startTop: coords.top,
      moved: false,
    };
  }, [isMobile, coords]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (!ds.moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    ds.moved = true;
    if (!isDragging) {
      setIsDragging(true);
      setPopoverOpen(false);
    }
    const el = pillRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, ds.startLeft + dx));
    const newTop = Math.max(0, Math.min(window.innerHeight - rect.height, ds.startTop + dy));
    setCoords({ left: newLeft, top: newTop });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const el = pillRef.current;
    if (el) el.releasePointerCapture(e.pointerId);

    if (ds.moved && el) {
      const rect = el.getBoundingClientRect();
      const snapped = snapToEdge(coords.left, coords.top, rect.width, rect.height);
      const finalCoords = positionToCoords(snapped, rect.width, rect.height);
      setCoords(finalCoords);
      onPositionChange?.(snapped);
    } else {
      // Click — toggle popover
      setPopoverOpen((prev) => !prev);
    }

    setIsDragging(false);
    dragState.current = null;
  }, [coords, onPositionChange]);

  // Popover anchor origin — open away from snapped edge
  const popoverAnchorOrigin = (() => {
    const edge = pos.edge;
    const vertical: 'top' | 'bottom' | 'center' =
      edge === 'top' ? 'bottom' : edge === 'bottom' ? 'top' : 'center';
    const horizontal: 'left' | 'right' | 'center' =
      edge === 'left' ? 'right' : edge === 'right' ? 'left' : 'center';
    return { vertical, horizontal } as const;
  })();

  const popoverTransformOrigin = (() => {
    const edge = pos.edge;
    const vertical: 'top' | 'bottom' | 'center' =
      edge === 'top' ? 'top' : edge === 'bottom' ? 'bottom' : 'center';
    const horizontal: 'left' | 'right' | 'center' =
      edge === 'left' ? 'left' : edge === 'right' ? 'right' : 'center';
    return { vertical, horizontal } as const;
  })();

  const pillSx = isMobile
    ? {
        position: 'fixed' as const,
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
      }
    : {
        position: 'fixed' as const,
        left: coords.left,
        top: coords.top,
        zIndex: 1050,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none' as const,
        userSelect: 'none' as const,
        transition: isDragging ? 'none' : 'left 0.2s ease, top 0.2s ease',
      };

  return (
    <>
      <Chip
        ref={pillRef}
        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
        label={label}
        onClick={isMobile ? () => setPopoverOpen((p) => !p) : undefined}
        onPointerDown={!isMobile ? handlePointerDown : undefined}
        onPointerMove={!isMobile ? handlePointerMove : undefined}
        onPointerUp={!isMobile ? handlePointerUp : undefined}
        sx={{
          ...pillSx,
          maxWidth: 220,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          fontWeight: 500,
          fontSize: '0.8rem',
          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
      <Popover
        open={popoverOpen}
        anchorEl={pillRef.current}
        onClose={() => setPopoverOpen(false)}
        anchorOrigin={isMobile ? { vertical: 'top', horizontal: 'center' } : popoverAnchorOrigin}
        transformOrigin={isMobile ? { vertical: 'bottom', horizontal: 'center' } : popoverTransformOrigin}
        slotProps={{ paper: { sx: { borderRadius: 2, mt: isMobile ? -1 : 0 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 280 }}>
          <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />
          <ToggleButtonGroup
            size="small"
            exclusive
            fullWidth
            value={snapshotMode}
            onChange={(_, val) => val && onSnapshotModeChange(val)}
          >
            <ToggleButton value="all" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>
              All Pipeline
            </ToggleButton>
            <ToggleButton value="filtered" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>
              All Filtered
            </ToggleButton>
            <ToggleButton value="priorities" sx={{ textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.75rem' }}>
              Just Priorities
            </ToggleButton>
          </ToggleButtonGroup>
          {snapshotDescription && (
            <Typography variant="caption" color="text.secondary">
              {snapshotDescription}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default FloatingFilterPill;
