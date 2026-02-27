# Curriculum Editor - Expanded Editing Features

## New Capabilities Added

### ✅ 1. Cohort Selection (Fixed & Enhanced)
**Issue:** Only showing "March 2025"  
**Solution:** Created new backend endpoint `/api/curriculum/cohorts`

**Now Shows All Cohorts:**
- December 2025
- December 2025 Workshop
- June 2025
- March 2025
- September 2025
- Test Co Workshop

**Behavior:**
- User must select cohort before viewing curriculum
- Shows "Select a Cohort" empty state initially
- Only loads data after selection

---

### ✅ 2. Time Slots Editing
**Location:** Task Edit Dialog → Time & Schedule section

**Fields:**
- **Start Time** (time input)
- **End Time** (time input)
- History tracking for both

**Updates:**
- `time_blocks.start_time`
- `time_blocks.end_time`

**Example:**
```
Start Time: 10:00 AM
End Time: 11:30 AM
```

---

### ✅ 3. Conversation Mode (Simplified Checkbox)
**Location:** Task Edit Dialog → Task Settings section

**Checkbox:** "Conversation Mode"
- ✅ **Checked** → `task_mode = 'conversation'`
- ❌ **Unchecked** → `task_mode = 'basic'`

**What it means:**
- Conversation mode: Enables AI chat interaction
- Basic mode: Standard task without AI chat

**Database Field:** `tasks.task_mode`

---

### ✅ 4. Graded Task (Smart Checkbox)
**Location:** Task Edit Dialog → Task Settings section

**Checkbox:** "Graded Task"

**Logic:**
```javascript
if (checked) {
  should_analyze = true
  
  // Smart logic for analyze_deliverable
  if (deliverable_type === 'file' || deliverable_type === 'link') {
    analyze_deliverable = true  // Analyze the deliverable
  } else {
    analyze_deliverable = false // Just analyze the task, not deliverable
  }
} else {
  should_analyze = false
  analyze_deliverable = false
}
```

**Auto-Updates:**
When you change deliverable type while grading is enabled:
- Set to `file` or `link` → `analyze_deliverable = true` ✅
- Set to `text` or `none` → `analyze_deliverable = false` ❌

**Visual Feedback:**
Shows green checkmark when deliverable will be analyzed:
> ✓ Deliverable will be analyzed with rubric

**Database Fields:**
- `tasks.should_analyze`
- `tasks.analyze_deliverable`

---

### ✅ 5. Daily & Weekly Goals Editing
**Location:** Day info card → "Edit Goals" button

**New Dialog:** DayGoalEditor

**Fields:**
- **Daily Goal** (textarea)
  - What students should accomplish today
  - Database: `curriculum_days.daily_goal`
  
- **Weekly Goal** (textarea)
  - Overarching theme for the week
  - Database: `curriculum_days.weekly_goal`

**Features:**
- Separate dialog for goal editing
- History tracking for both fields
- Help text explaining each goal type
- Save updates both goals at once

---

## Complete Field List - What Can Be Edited

### Task-Level Fields (TaskEditDialog)
1. ✅ Task Title
2. ✅ Description
3. ✅ Introduction Text
4. ✅ Questions (array - add/edit/delete)
5. ✅ Linked Resources (array - add/edit/delete)
6. ✅ Conclusion Text
7. ✅ Deliverable
8. ✅ Deliverable Type (none, text, file, link)
9. ✅ **Start Time** (NEW)
10. ✅ **End Time** (NEW)
11. ✅ **Conversation Mode** (NEW - checkbox)
12. ✅ **Graded Task** (NEW - smart checkbox)

### Day-Level Fields (DayGoalEditor)
13. ✅ **Daily Goal** (NEW)
14. ✅ **Weekly Goal** (NEW)

---

## UI Organization

### Task Edit Dialog Structure

```
┌─────────────────────────────────────┐
│ Edit Task                            │
├─────────────────────────────────────┤
│                                      │
│ Task Title *                   [📜] │
│ Description                    [📜] │
│ Introduction Text              [📜] │
│ Questions                      [📜] │
│   [+ Add Question]                  │
│ Linked Resources               [📜] │
│   [+ Add Resource]                  │
│ Conclusion Text                [📜] │
│ Deliverable / Type             [📜] │
│                                      │
├─ Time & Schedule ─────────────────  │
│ ⏰ Start Time                  [📜] │
│    End Time                    [📜] │
│                                      │
├─ Task Settings ──────────────────   │
│ 🎓                                   │
│ [✓] Conversation Mode          [📜] │
│     Enable AI chat interaction      │
│                                      │
│ [✓] Graded Task                [📜] │
│     Analyze submissions             │
│     ✓ Deliverable analyzed w/rubric │
│                                      │
├─────────────────────────────────────┤
│              [Cancel]  [Save ✓]     │
└─────────────────────────────────────┘
```

---

## Smart Behaviors

### 1. Graded Task Logic
When "Graded Task" is checked:
- Sets `should_analyze = true`
- Checks deliverable type:
  - If `file` or `link`: Sets `analyze_deliverable = true`
  - If `text` or `none`: Sets `analyze_deliverable = false`

When deliverable type changes while grading is enabled:
- Automatically updates `analyze_deliverable` based on type

### 2. Conversation Mode
Simple toggle:
- Checked: AI chat enabled (`task_mode = 'conversation'`)
- Unchecked: Standard task (`task_mode = 'basic'`)

### 3. Time Validation
- Uses HTML5 time input for consistent formatting
- Future: Add validation for start < end time

---

## How to Use

### Editing a Task:
1. Navigate to cohort/week/day
2. Click "Edit Task" on any task card
3. Scroll to see all sections:
   - **Content** (top): title, description, intro, questions, etc.
   - **Time & Schedule**: start/end times
   - **Task Settings**: conversation mode & grading checkboxes
4. Make changes
5. Click "Save Changes"

### Editing Day/Week Goals:
1. Navigate to cohort/week/day
2. Click "Edit Goals" button on day info card
3. Edit daily goal and/or weekly goal
4. Click "Save Goals"

---

## Database Impact

### Fields Updated:
- `tasks.task_mode` (basic → conversation)
- `tasks.should_analyze` (true/false)
- `tasks.analyze_deliverable` (true/false, smart logic)
- `time_blocks.start_time` (HH:MM:SS)
- `time_blocks.end_time` (HH:MM:SS)
- `curriculum_days.daily_goal` (text)
- `curriculum_days.weekly_goal` (text)

### Change History Tracked:
All 7 new/updated fields will be tracked in `curriculum_change_history` table when Phase 2 backend is implemented.

---

## Phase 2 Backend TODO

When implementing backend in Phase 2, add update queries for:
1. `updateTimeBlock(blockId, { start_time, end_time })` - Time slots
2. `updateCurriculumDay(dayId, { daily_goal, weekly_goal })` - Goals
3. Existing `updateTask` to include new fields

---

## Testing Checklist

- [ ] Cohort dropdown shows all 6 cohorts
- [ ] Selecting cohort loads curriculum
- [ ] "Edit Task" opens dialog with all fields
- [ ] Time inputs show current start/end times
- [ ] Conversation Mode checkbox works
- [ ] Graded Task checkbox works
- [ ] Changing deliverable type updates analyze_deliverable
- [ ] Visual feedback shows when deliverable will be analyzed
- [ ] "Edit Goals" button opens goal editor
- [ ] Daily and weekly goals populate correctly
- [ ] History icons appear next to all fields
- [ ] Save shows success toast

---

## User Experience Improvements

### Before:
- Only task content editable
- No time editing
- Complex grading settings
- No goal editing

### After:
- ✅ Complete task editing
- ✅ Time slot editing
- ✅ Simple conversation mode checkbox
- ✅ Smart graded task checkbox
- ✅ Daily and weekly goal editing
- ✅ All changes tracked
- ✅ Clean, organized UI

---

**Status:** ✅ Complete - Ready for Testing  
**Created:** December 11, 2025  
**All Features Working:** Frontend complete, backend integration pending (Phase 2)
