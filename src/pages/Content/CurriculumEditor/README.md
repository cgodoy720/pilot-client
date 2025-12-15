# Curriculum Editor - Frontend Implementation

## Overview

The Curriculum Editor is a new tab within the Content Generation page that allows staff to view, edit, and track changes to curriculum tasks with a modern, card-based UI following the AdminPrompts design pattern.

## Phase 1 Status: Frontend UI ✅ COMPLETE

All frontend components have been implemented and integrated into the Content page.

## Features Implemented

### 1. Shared Components (`components/shared/`)

- **LoadingState.jsx**: Animated loading spinner with message
- **EmptyState.jsx**: Empty state display with icon, title, and description
- **TaskCard.jsx**: Card component for displaying tasks with:
  - Task title and type badge
  - Time information (block category, start/end times)
  - Description preview (truncated to 150 chars)
  - Edit and View History buttons (permission-based)
  - Last modified information

### 2. Dialog Components

- **TaskEditDialog.jsx**: Full-featured task editing modal with:
  - Task title (required field)
  - Description (textarea)
  - Intro text (textarea)
  - Questions array (add/edit/delete/reorder)
  - Linked resources array (title, url, type, description)
  - Conclusion text (textarea)
  - Deliverable and deliverable type
  - History icon next to each field
  - Save/Cancel buttons
  - Permission-based: Staff can edit, volunteers view-only

- **FieldHistoryDialog.jsx**: Change history viewer with:
  - Timeline of all changes for a specific field
  - Who made the change and when
  - Old value vs new value diff view
  - "Revert to this" button for each historical entry
  - Mock data for Phase 1 (will connect to backend in Phase 2)

### 3. Main Tabs

- **CurriculumBrowserTab.jsx**: Primary interface featuring:
  - Cohort selector dropdown at top
  - Week navigation with prev/next buttons
  - Week goal display
  - Day selection grid (5 columns)
  - Task cards for selected day
  - Fetches real data from existing curriculum API
  - Empty states for no tasks
  - Loading states during data fetch

- **HistoryTab.jsx**: Recent changes view with:
  - Filter by time period (24h, 7d, 30d, all)
  - Filter by user (all, me)
  - Change cards showing:
    - What field changed
    - In which task
    - Who made the change and when
    - Before/after values with color coding
    - Revert button
  - Mock data for Phase 1

### 4. Main Component

- **CurriculumEditor.jsx**: Container with:
  - AdminPrompts-style layout (bg-[#EFEFEF], max-w-1400px)
  - shadcn/ui Tabs with two tabs:
    - "Browse & Edit" (CurriculumBrowserTab)
    - "Change History" (HistoryTab)
  - Pursuit blue active tab styling (#4242EA)

### 5. Integration

- **Content.jsx**: Updated to include:
  - Import CurriculumEditor component
  - Import useAuth for permission checking
  - Fourth tab button "Curriculum Editor" (only visible to staff/admin/volunteer)
  - Route handling for `/content/curriculum-editor`
  - Permission check before rendering component

## Design Pattern

Following **AdminPrompts** design:

### Colors
- Primary: `#4242EA` (Pursuit blue)
- Text: `#1E1E1E` (dark)
- Secondary text: `#666`
- Borders: `#C8C8C8`
- Background: `#EFEFEF`
- Light backgrounds: `#F5F5F5`, `#E3E3E3`

### Typography
- Font family: Proxima Nova (`font-proxima`, `font-proxima-bold`)
- Consistent font sizing throughout

### Components
- shadcn/ui: Tabs, Card, Dialog, Button, Badge, Select, Input, Textarea, Label
- lucide-react icons: Edit, History, Clock, Plus, Trash2, ChevronLeft, ChevronRight, Save, X, etc.

### Styling
- Cards: White background with hover effects (border and shadow)
- Buttons: Primary style for actions, outline for secondary
- Transitions: 200ms for smooth interactions

## Permissions

### Staff/Admin
- Can see "Curriculum Editor" tab
- Can edit all task fields
- Can view change history
- Can revert changes (Phase 2)

### Volunteers
- Can see "Curriculum Editor" tab
- Can view all curriculum and tasks (read-only)
- Edit buttons are hidden
- Cannot make changes

### Students
- Cannot access Curriculum Editor
- Tab is not visible

## Testing the Frontend

### 1. Access
1. Log in as staff/admin/volunteer user
2. Navigate to `/content`
3. Click "Curriculum Editor" tab (4th tab)

### 2. Cohort Selection
1. Select a cohort from the dropdown
2. Verify curriculum loads for that cohort

### 3. Week Navigation
1. Click "Previous Week" and "Next Week" buttons
2. Verify week number and goal updates
3. Verify days update for each week

### 4. Day Selection
1. Click different day buttons
2. Verify tasks load for selected day
3. Check day information displays correctly

### 5. Task Cards
1. Verify task cards show:
   - Title and type
   - Time information
   - Description preview
   - Edit and History buttons (if staff)
2. Hover over cards to see border highlight

### 6. Task Editing Dialog
1. Click "Edit Task" button
2. Verify all fields populate correctly
3. Test editing each field type:
   - Text inputs
   - Textareas
   - Questions array (add/remove)
   - Resources array (add/remove/edit)
   - Deliverable type select
4. Click "Save Changes" (currently mock - will show success toast)
5. Click "Cancel" to close without saving

### 7. Field History Dialog
1. Click history icon next to any field in edit dialog
2. Verify mock history data displays
3. Check before/after value diffs
4. Test "Revert to this" button (mock - shows confirmation)

### 8. Change History Tab
1. Switch to "Change History" tab
2. Verify mock change entries display
3. Test time period filter
4. Test user filter
5. Check change cards show proper information

### 9. Permissions
1. Log in as volunteer
2. Verify "Edit Task" buttons are hidden
3. Verify "Revert" buttons are hidden
4. Verify dialogs open in view-only mode

### 10. Empty States
1. Select a day with no tasks
2. Verify empty state displays correctly

### 11. Loading States
1. Refresh page while on Curriculum Editor
2. Verify loading spinner shows during data fetch

## Data Flow

### Current (Phase 1 - Frontend Only)
1. Fetches cohorts from `/api/curriculum/days`
2. Fetches calendar data from `/api/curriculum/calendar?cohort={cohort}`
3. Fetches day tasks from `/api/curriculum/days/{dayId}/full-details`
4. Edit operations log to console and show success toast
5. History data is mocked locally

### Future (Phase 2 - Backend Integration)
1. Save operations will call `PUT /api/curriculum/tasks/{taskId}/bulk`
2. History will fetch from `GET /api/curriculum/tasks/{taskId}/history`
3. Revert will call new revert endpoint
4. All changes will be logged to `curriculum_change_history` table

## Next Steps (Phase 2)

1. Create `curriculum_change_history` database table
2. Implement backend queries for field updates with history logging
3. Create API endpoints for edit and history operations
4. Connect frontend save operations to real API
5. Replace mock history data with real API calls
6. Implement actual revert functionality
7. Add toast notifications for backend errors
8. Test end-to-end flow with real data persistence

## File Structure

```
CurriculumEditor/
├── CurriculumEditor.jsx (main component)
├── components/
│   ├── CurriculumBrowserTab.jsx (browse & edit interface)
│   ├── HistoryTab.jsx (change history view)
│   └── shared/
│       ├── TaskCard.jsx (task display card)
│       ├── TaskEditDialog.jsx (task editing modal)
│       ├── FieldHistoryDialog.jsx (field history modal)
│       ├── LoadingState.jsx (loading spinner)
│       └── EmptyState.jsx (empty state display)
├── index.js (export)
└── README.md (this file)
```

## Dependencies

- react, react-router-dom
- @radix-ui/react-* (via shadcn/ui)
- lucide-react (icons)
- sonner (toast notifications)
- Context: AuthContext (user permissions)

## Browser Support

Same as main application (modern browsers with ES6+ support)
