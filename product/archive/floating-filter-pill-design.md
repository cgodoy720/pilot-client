# Floating Filter Pill — Archived Design

**Archived**: 2026-03-24
**Reason**: Replaced by inline pipeline filters in Priority Opportunities section header. Design preserved for Pebble pill reuse.

## Component
`financial_forecasting/frontend/src/components/FloatingFilterPill.tsx`

## Key Design Features
- **Draggable**: Snaps to nearest viewport edge (left/right/top/bottom) with smooth CSS transitions
- **Edge-aware popover**: Opens away from the snapped edge for optimal readability
- **Mobile**: Fixed to bottom-center, no drag — just tap to open popover
- **Position persistence**: Edge + offset (0-1 fraction) saved to localStorage via `filterPillPosition` pref
- **Visual state**: Border color changes to `primary.main` when actively filtering (non-default state)

## Sizing & Spacing
- Pill: `minWidth: 140, maxWidth: 220`, `fontSize: 0.8rem`, `fontWeight: 500`
- Shadow: `0 2px 10px rgba(0,0,0,0.18)`
- Border: `1.5px solid`, `grey.400` (inactive) / `primary.main` (active)
- Margin from viewport edge: `12px`
- Drag threshold: `5px` (prevents accidental drags on click)
- zIndex: `1050`

## Popover Contents
- `DateRangeSelector` — presets (Current FY, Next 30/60/90d, This Quarter, All, Custom)
- `ToggleButtonGroup` — snapshot mode (All Pipeline / All Filtered / Just Priorities)
- Optional description text (`snapshotDescription`)

## Position Algorithm
1. On drag end: calculate distances from all 4 edges, snap to nearest
2. Store as `{ edge: 'left'|'right'|'top'|'bottom', offset: 0-1 }`
3. On render: convert edge/offset to absolute `left`/`top` CSS coords
4. On window resize: recompute coords from stored edge/offset

## Props Interface
```typescript
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
```

## Reuse Notes for Pebble Pill
- The drag/snap/position system is fully generic — reusable for any floating pill
- `positionToCoords()` and `snapToEdge()` are pure functions, easy to extract
- Consider extracting into a `useFloatingPill` hook for Pebble
- The popover content can be swapped for Pebble's chat/query interface
- Mobile behavior (fixed bottom-center) works well for Pebble too
