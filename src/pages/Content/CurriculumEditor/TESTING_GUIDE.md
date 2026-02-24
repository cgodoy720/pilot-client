# Curriculum Editor - Complete Testing Guide

## Pre-Test Setup

### 1. Verify Servers are Running
- ✅ Backend: http://localhost:7001
- ✅ Frontend: http://localhost:5173
- ✅ Database: segundo-db (dev)

### 2. Login Requirements
- Must be logged in as **Staff** or **Admin** user
- Volunteer users can view but not edit

### 3. Open Browser Console
- Press F12 (Chrome/Edge) or Cmd+Option+I (Mac)
- Keep Console tab open to see logs and errors

---

## Test Suite

## TEST 1: Navigation & Initial Load ✓

**Steps:**
1. Navigate to http://localhost:5173
2. Click "Content" in sidebar (should have 📄 FileText icon)
3. Verify Curriculum Editor loads directly (no tabs)

**Expected Results:**
- ✅ Curriculum Editor appears
- ✅ See "Browse & Edit" and "Change History" tabs
- ✅ See cohort selector dropdown
- ✅ See "Select a Cohort" empty state below
- ✅ Console shows: "Cohorts from API: [...]"

**Pass/Fail:** _______

---

## TEST 2: Cohort Selection ✓

**Steps:**
1. Click cohort dropdown
2. Verify all cohorts appear

**Expected Results:**
- ✅ See 6 cohorts:
  - December 2025
  - December 2025 Workshop
  - June 2025
  - March 2025
  - September 2025
  - Test Co Workshop
- ✅ Dropdown is searchable/scrollable

**Pass/Fail:** _______

**Next:**
3. Select "December 2025"
4. Wait for loading

**Expected Results:**
- ✅ "Loading curriculum..." appears briefly
- ✅ Week navigation appears
- ✅ Auto-navigates to current week
- ✅ Console shows: "Navigated to current week: X"
- ✅ Days grid appears
- ✅ First/current day is auto-selected

**Pass/Fail:** _______

---

## TEST 3: Week Navigation ✓

**Steps:**
1. Note current week number
2. Click "Next Week" button
3. Click "Previous Week" button

**Expected Results:**
- ✅ Week number changes
- ✅ Weekly goal updates (if present)
- ✅ Days grid updates with new days
- ✅ First day of new week auto-selects
- ✅ Tasks update for new day

**Pass/Fail:** _______

---

## TEST 4: Day Selection ✓

**Steps:**
1. Click different day buttons in the grid

**Expected Results:**
- ✅ Selected day gets blue background
- ✅ Day info card shows:
  - Day number and date
  - Daily goal
  - Weekly goal
  - "Edit Goals" button
- ✅ Tasks load for selected day
- ✅ Task cards appear below

**Pass/Fail:** _______

---

## TEST 5: Edit Task - Basic Fields ✓

**Steps:**
1. Click "Edit Task" on any task card
2. Dialog opens

**Expected Results:**
- ✅ Dialog shows "Edit Task" title
- ✅ All fields populated with current values:
  - Task Title
  - Description
  - Introduction Text
  - Questions (array)
  - Linked Resources (array)
  - Conclusion Text
  - Deliverable
  - Deliverable Type dropdown
- ✅ History icon next to each field

**Pass/Fail:** _______

**Next - Make Changes:**
3. Change task title (add " - EDITED" to the end)
4. Change description
5. Click "Save Changes"

**Expected Results:**
- ✅ "Saving..." shows briefly
- ✅ Toast notification: "Task updated successfully"
- ✅ Dialog closes
- ✅ Task card shows NEW title
- ✅ Console shows: API call to /api/curriculum/tasks/{id}/edit

**Pass/Fail:** _______

**Verify Persistence:**
6. Refresh browser (F5)
7. Navigate back to same day
8. Check task

**Expected Results:**
- ✅ Changes are still there!
- ✅ Title still shows " - EDITED"
- ✅ Data persisted to database

**Pass/Fail:** _______

---

## TEST 6: Edit Time Slots ✓

**Steps:**
1. Click "Edit Task" on any task
2. Scroll to "Time & Schedule" section
3. Note current times
4. Change start time (e.g., 10:00 → 10:30)
5. Change end time (e.g., 11:00 → 11:30)
6. Click "Save Changes"

**Expected Results:**
- ✅ Toast: "Task updated successfully"
- ✅ Task card shows new times
- ✅ Console shows: API calls to both tasks and blocks endpoints

**Pass/Fail:** _______

---

## TEST 7: Conversation Mode & Grading ✓

**Steps:**
1. Click "Edit Task" on any task
2. Scroll to "Task Settings"
3. Check "Conversation Mode" checkbox
4. Check "Graded Task" checkbox
5. Note deliverable type
6. Change deliverable type to "document"

**Expected Results:**
- ✅ Conversation Mode checkbox works
- ✅ Graded Task checkbox works
- ✅ When deliverable is "document", see green text:
  "✓ Deliverable will be analyzed with rubric"
- ✅ Change to "text", green text disappears

**Pass/Fail:** _______

**Next:**
7. Click "Save Changes"

**Expected Results:**
- ✅ Task saves
- ✅ Settings persist after refresh

**Pass/Fail:** _______

---

## TEST 8: Questions Array Editing ✓

**Steps:**
1. Click "Edit Task"
2. Find Questions section
3. Click "Add Question" button
4. Type a new question
5. Edit an existing question
6. Click trash icon to delete a question
7. Click "Save Changes"

**Expected Results:**
- ✅ "Add Question" creates new textarea
- ✅ Can edit all questions
- ✅ Trash icon removes question
- ✅ Changes save to database
- ✅ Questions persist after refresh

**Pass/Fail:** _______

---

## TEST 9: Linked Resources Array ✓

**Steps:**
1. Click "Edit Task"
2. Find "Linked Resources" section
3. Click "Add Resource" button
4. Fill in:
   - Title: "Test Resource"
   - Type: "article"
   - URL: "https://example.com"
   - Description: "Test description"
5. Click trash icon on an existing resource
6. Click "Save Changes"

**Expected Results:**
- ✅ New resource section appears
- ✅ All fields editable
- ✅ Type dropdown works
- ✅ Can delete resources
- ✅ Changes save
- ✅ Resources persist after refresh

**Pass/Fail:** _______

---

## TEST 10: View Field History ✓

**Steps:**
1. Click "Edit Task" on a task you edited
2. Click history icon (📜) next to "Task Title"
3. History dialog opens

**Expected Results:**
- ✅ Dialog shows "Change History: Task Title"
- ✅ Shows your recent edit:
  - Your name
  - "X hours ago" or timestamp
  - Old value (before your edit)
  - New value (after your edit)
- ✅ "Latest" badge on most recent change
- ✅ "Revert to this" button visible (if staff/admin)

**Pass/Fail:** _______

---

## TEST 11: Revert a Change ✓

**Steps:**
1. In history dialog (from Test 10)
2. Click "Revert to this" on previous value
3. Confirm the dialog

**Expected Results:**
- ✅ Confirmation popup appears
- ✅ After confirming: "Reverted Task Title successfully" toast
- ✅ History dialog updates with new entry
- ✅ New entry at top shows revert (new → old)
- ✅ Close dialog
- ✅ Task card shows reverted value

**Pass/Fail:** _______

**Verify Database:**
4. Refresh page
5. Check task again

**Expected Results:**
- ✅ Reverted value persists
- ✅ Can see revert in history

**Pass/Fail:** _______

---

## TEST 12: Edit Daily & Weekly Goals ✓

**Steps:**
1. Navigate to any day
2. Click "Edit Goals" button on day info card
3. Dialog opens

**Expected Results:**
- ✅ "Edit Day & Week Goals" dialog
- ✅ Daily goal field populated
- ✅ Weekly goal field populated
- ✅ History icons next to both fields

**Pass/Fail:** _______

**Next:**
4. Edit daily goal (add " - UPDATED")
5. Edit weekly goal (add " - UPDATED")
6. Click "Save Goals"

**Expected Results:**
- ✅ Toast: "Goals updated successfully"
- ✅ Dialog closes
- ✅ Day card shows updated daily goal
- ✅ Weekly goal shows in week navigation

**Pass/Fail:** _______

---

## TEST 13: Move Task to Different Day ✓

**Steps:**
1. Note a task on current day (write down title)
2. Click "Edit Task" on that task
3. Scroll to bottom
4. Click "Move to Different Day" button
5. Move dialog opens

**Expected Results:**
- ✅ Shows current day in blue box
- ✅ Lists all other days in week
- ✅ Each day shows number, date, daily goal
- ✅ Can click to select target day
- ✅ Selected day gets blue border and checkmark

**Pass/Fail:** _______

**Next:**
6. Select a different day
7. Click "Move to Day X" button

**Expected Results:**
- ✅ Toast: "Moved task to Day X"
- ✅ Dialog closes
- ✅ Task disappears from current day's task list

**Pass/Fail:** _______

**Verify:**
8. Navigate to the target day (click that day button)

**Expected Results:**
- ✅ Task appears in target day's task list
- ✅ Same title, description, all fields preserved
- ✅ Times preserved

**Pass/Fail:** _______

---

## TEST 14: Change History Tab ✓

**Steps:**
1. Click "Change History" tab
2. View recent changes

**Expected Results:**
- ✅ Cohort selector at top
- ✅ Time period filter (24h, 7d, 30d, all)
- ✅ User filter (All users, Me)
- ✅ Shows all changes you made:
  - Task title edits
  - Goal edits
  - Task moves
  - Reverts
- ✅ Each change shows:
  - What field changed
  - In which task
  - Who changed it
  - When it changed
  - Old → New values
  - Day number badge

**Pass/Fail:** _______

**Test Filters:**
3. Change time period to "Last 24 hours"
4. Change user to "Me"

**Expected Results:**
- ✅ List filters to show only your recent changes
- ✅ Filtering happens without page reload

**Pass/Fail:** _______

---

## TEST 15: All Deliverable Types ✓

**Steps:**
1. Edit any task
2. Click "Deliverable Type" dropdown
3. Verify all types appear

**Expected Results:**
- ✅ See all 10 types:
  - None
  - Text
  - Link
  - Document
  - Video
  - Presentation
  - Structured Data
  - Assessment
  - Feedback
  - Commitment

**Pass/Fail:** _______

**Test Smart Grading:**
4. Check "Graded Task"
5. Set deliverable to "video"

**Expected:**
- ✅ Green text: "✓ Deliverable will be analyzed with rubric"

6. Change to "text"

**Expected:**
- ✅ Green text disappears

7. Change to "document"

**Expected:**
- ✅ Green text reappears

**Pass/Fail:** _______

---

## TEST 16: Permission Check ✓

**If you have a volunteer account:**

**Steps:**
1. Log in as volunteer
2. Navigate to /content
3. Click "Edit Task"

**Expected Results:**
- ✅ Can view Curriculum Editor
- ✅ "Edit Task" button is HIDDEN
- ✅ Only "View History" button shows
- ✅ If you manually open edit dialog, fields are disabled
- ✅ "Edit Goals" button is hidden

**Pass/Fail:** _______

---

## TEST 17: Error Handling ✓

**Test API Failure:**

**Steps:**
1. Stop backend server (in terminal: Ctrl+C on backend)
2. Try to edit a task
3. Click Save

**Expected Results:**
- ✅ Toast: "Failed to save task" (error message)
- ✅ Dialog stays open
- ✅ User can try again
- ✅ No data loss

**Pass/Fail:** _______

4. Restart backend server
5. Try save again

**Expected:**
- ✅ Now works correctly

**Pass/Fail:** _______

---

## TEST 18: Browser Refresh Persistence ✓

**Steps:**
1. Make any edit and save
2. Note the change
3. Refresh browser (F5)
4. Navigate back to same task

**Expected Results:**
- ✅ Changes persisted
- ✅ New values show
- ✅ History shows the change

**Pass/Fail:** _______

---

## TEST 19: Multiple Field Edit ✓

**Steps:**
1. Edit a task
2. Change multiple fields in one save:
   - Title
   - Description
   - Add a question
   - Change time
   - Enable grading
3. Click "Save Changes"

**Expected Results:**
- ✅ All changes save
- ✅ History shows multiple entries (one per field)
- ✅ Each field logged separately

**Pass/Fail:** _______

---

## TEST 20: Database Verification ✓

**Optional - For Advanced Testing**

**Steps:**
1. After making edits, run this in terminal:

```bash
cd /Users/jacquelinereverand/admapp/adm-app-2/test-pilot-server && node -e "
const db = require('./db/dbConfig');
db.any('SELECT * FROM curriculum_change_history ORDER BY changed_at DESC LIMIT 10')
  .then(results => {
    console.log('Recent Changes:');
    results.forEach(r => {
      console.log(\`  \${r.field_name}: \${r.old_value} → \${r.new_value} (\${r.changed_by})\`);
    });
    process.exit(0);
  });
"
```

**Expected Results:**
- ✅ Shows your changes in database
- ✅ Timestamps match
- ✅ User ID correct

**Pass/Fail:** _______

---

## Critical Issues Checklist

If any of these fail, we need to fix them:

- [ ] Cannot select cohort
- [ ] Changes don't save
- [ ] History doesn't show
- [ ] Revert doesn't work
- [ ] Move task fails
- [ ] Page crashes
- [ ] Console shows errors

---

## Success Criteria

**Minimum for Production:**
- ✅ All tests 1-15 pass
- ✅ No console errors
- ✅ Changes persist after refresh
- ✅ History tracking works
- ✅ Permission checks work

**Optional but Recommended:**
- ✅ Tests 16-20 pass
- ✅ Error handling graceful
- ✅ Database verification matches

---

## Quick Test Script (Run through in 5 minutes)

1. ✅ Load page
2. ✅ Select cohort
3. ✅ Edit task title
4. ✅ Save
5. ✅ View history
6. ✅ Revert
7. ✅ Edit goals
8. ✅ Move task
9. ✅ Check Change History tab
10. ✅ Refresh - verify persistence

If all 10 work → **Ready for production!** 🚀

---

## Bug Report Template

If you find issues:

```
TEST #: _____
ISSUE: _____
STEPS: 
1. 
2. 
3. 

EXPECTED: _____
ACTUAL: _____
CONSOLE ERRORS: _____
```

---

Ready to start testing? Let me know which test you want to try first, or any issues you encounter! 🧪
