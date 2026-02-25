# Dev to UI-Redesign Merge Plan

## Objective
Merge the `dev` branch into `ui-redesign` branch while:
- **Preserving ALL logic** from dev branch
- **Prioritizing styles** from ui-redesign branch
- **Keeping shadcn/tailwind** setup from ui-redesign
- **Merging dependencies** from both branches

## Branch Strategy
1. Switch to `ui-redesign` branch
2. Create backup: `ui-redesign-backup-pre-dev-merge`
3. Merge `dev` into `ui-redesign`
4. Resolve conflicts systematically
5. Test and validate

## Critical Logic to Preserve from Dev

### 1. Dashboard.jsx - Critical Logic Additions
- [ ] **Workshop Preview Banner** (lines 258-273)
  - Shows when `workshopInfo?.isLocked`
  - Displays workshop start date and countdown
  - `formatWorkshopDate()` helper function
- [ ] **Historical Access View** (lines 199-221)
  - `renderHistoricalView()` function
  - Shows when user is inactive (`isActive === false`)
  - Calendar navigation for past sessions
- [ ] **Volunteer View** (lines 223-239)
  - `renderVolunteerView()` function
  - Shows for users with `role === 'volunteer'`
  - Redirects to volunteer feedback
- [ ] **isActive Check** throughout component
  - Used in `useEffect` (line 27-32)
  - Button disable states
  - Navigation restrictions
- [ ] **Conditional Rendering Logic** (lines 368-371)
  - Renders different views based on user status and role

### 2. BuilderFeedbackForm.jsx - L1 Final Survey
- [ ] **Survey Type Support** (`surveyType` prop: 'weekly' | 'l1_final')
- [ ] **L1 Survey Fields** (lines 14-21)
  - `ai_experience_before`
  - `ai_literacy_agreement`
  - `explain_ai_confidence`
  - `build_ai_confidence`
  - `ai_literate_meaning`
  - `referral_likelihood`
- [ ] **Dynamic Form Initialization** based on survey type (lines 12-31)
- [ ] **L1 Survey Questions Rendering** (lines 335-409)
- [ ] **L1 Agreement Scale** (lines 305-332)
- [ ] **1-5 Rating Scales** (lines 284-303)
- [ ] **L1 Readonly View** (lines 495-605)
- [ ] **Form Submission Logic** handling both survey types (lines 210-227)
- [ ] **isActive checks** throughout (lines 9, 190-193)

### 3. Learning.jsx - Deliverable Panel System
- [ ] **DeliverablePanel Component** Integration
- [ ] **New imports for submission types**:
  - `DeliverablePanel/DeliverablePanel.jsx`
  - `DeliverablePanel/FlexibleSubmission.jsx`
  - `DeliverablePanel/LinkSubmission.jsx`
  - `DeliverablePanel/StructuredSubmission.jsx`
  - `DeliverablePanel/TextSubmission.jsx`
  - `DeliverablePanel/VideoSubmission.jsx`
- [ ] **Deliverable rendering logic** in task display
- [ ] **Submission type handling**

### 4. AdmissionsDashboard.jsx - Major Feature Additions
**Decision: Bring over entire dev version, will restyle later**
- [ ] Manual registration modal enhancements
- [ ] Checkbox to switch conversion
- [ ] "Needs laptop" field
- [ ] Any other logic additions

### 5. New Feature Pages (Bring as-is, restyle with shadcn/tailwind later)

#### Pathfinder System
- [ ] `/pages/Pathfinder/Pathfinder.jsx` - Main component
- [ ] `/pages/Pathfinder/PathfinderPersonalDashboard.jsx` - Personal dashboard
- [ ] `/pages/PathfinderAdmin/PathfinderAdmin.jsx` - Admin interface
  - Cohort filtering UI
  - Weekly goals management
  - Parallel data fetching
- [ ] `/pages/PathfinderApplications/PathfinderApplications.jsx` - Applications management
- [ ] `/pages/PathfinderDashboard/PathfinderDashboard.jsx` - Overview dashboard
- [ ] `/pages/PathfinderNetworking/PathfinderNetworking.jsx` - Networking features
- [ ] `/pages/PathfinderProjects/PathfinderProjects.jsx` - Projects management
- [ ] All associated CSS files (will be converted to Tailwind later)

#### Payment System
- [ ] `/pages/Payment/Payment.jsx` - Payment interface
- [ ] `/pages/Payment/README.md` - Documentation
- [ ] `/pages/PaymentTerms/PaymentTerms.jsx` - Terms display
- [ ] All payment-related styles

#### Workshop Admin
- [ ] `/pages/WorkshopAdminDashboard/WorkshopAdminDashboard.jsx`
- [ ] `/pages/WorkshopAdminDashboard/WorkshopAdminDashboard.css`

#### Admin Attendance
- [ ] `/pages/AdminAttendanceDashboard/AdminAttendanceDashboard.jsx`
- [ ] `/pages/AdminAttendanceDashboard/AdminAttendanceDashboard.css`

### 6. New Component Systems

#### Excuse Management
- [ ] `/components/ExcuseManagementInterface/ExcuseManagementInterface.jsx`
- [ ] `/components/ExcuseManagementInterface/ExcuseManagementInterface.css`

#### CSV Export
- [ ] `/components/CSVExport/CSVExport.jsx`
- [ ] `/components/CSVExport/CSVExport.css`
- [ ] `/components/ExportHistory/ExportHistory.jsx`
- [ ] `/components/ExportHistory/ExportHistory.css`

#### Performance Dashboards
- [ ] `/components/CohortPerformanceDashboard/CohortPerformanceDashboard.jsx`
- [ ] `/components/CohortPerformanceDashboard/CohortPerformanceDashboard.css`
- [ ] `/components/TodaysAttendanceOverview/TodaysAttendanceOverview.jsx`
- [ ] `/components/TodaysAttendanceOverview/TodaysAttendanceOverview.css`

#### Network Status & Offline Support
- [ ] `/components/ConnectivityNotification/ConnectivityNotification.jsx`
- [ ] `/components/NetworkStatusIndicator/NetworkStatusIndicator.jsx`
- [ ] `/components/OfflineModeMessage/OfflineModeMessage.jsx`
- [ ] `/components/QueuedActionsPanel/QueuedActionsPanel.jsx`

#### Error Boundaries
- [ ] `/components/ErrorBoundary/AdminDashboardErrorBoundary.jsx`
- [ ] `/components/ErrorBoundary/AdminDashboardErrorBoundary.css`
- [ ] `/components/ErrorBoundary/TabErrorBoundary.jsx`
- [ ] `/components/ErrorBoundary/TabErrorBoundary.css`

#### Other Components
- [ ] `/components/CompanyAutocomplete/` - Complete directory
- [ ] `/components/RichTextEditor/` - New files added

### 7. Services & Utilities (All New in Dev)
- [ ] `/services/adminApi.js` - Admin API calls
- [ ] `/services/cachedAdminApi.js` - Caching layer
- [ ] `/services/databaseService.js` - Additional methods
- [ ] `/utils/attendanceActionQueue.js` - Queue management
- [ ] `/utils/cacheService.js` - Cache utilities
- [ ] `/utils/errorTestingUtils.js` - Error testing
- [ ] `/utils/networkStatus.js` - Network monitoring
- [ ] `/utils/retryUtils.js` - Retry logic

### 8. Content & Admin Enhancements
- [ ] `/pages/Content/SessionTester/SessionTester.jsx` - Updates
- [ ] `/pages/Content/SessionTester/SessionTester.css` - Styling additions
- [ ] `/pages/AdminPrompts/AdminPrompts.jsx` - Enhancements
- [ ] `/pages/AdminPrompts/components/ContentGenerationPromptsTab.jsx` - New tab

### 9. Other Page Updates with Logic
- [ ] `PastSession.jsx` - BuilderFeedbackForm integration
- [ ] `AssessmentGrades.jsx` - Filter improvements
- [ ] `Signup.jsx` - Logic updates
- [ ] `GPT.jsx` - Enhancements
- [ ] `Calendar.jsx` - Updates
- [ ] `ApplicantDashboard.jsx` - Logic changes
- [ ] `ApplicationForm.jsx` - Updates
- [ ] `Workshops.jsx` - Logic additions

### 10. App-Level Changes
- [ ] `App.jsx` - New routes for Pathfinder, Payment, Workshop Admin, Admin Attendance
- [ ] `AuthContext.jsx` - Updates
- [ ] `main.jsx` - Changes
- [ ] `index.css` - Merge global styles carefully

### 11. Configuration & Build Files
- [ ] `package.json` - **MERGE both sets of dependencies**
- [ ] `package-lock.json` - Regenerate after merge
- [ ] `.nvmrc` - Node version specification from dev
- [ ] `netlify.toml` - Build configuration from dev
- [ ] `.gitignore` - Merge both (exclude Stryker files)

### 12. Documentation Files (All from Dev)
- [ ] Multiple MD files documenting features
- [ ] Implementation summaries
- [ ] Testing guides

## Files to Prioritize from UI-Redesign

### Components to Keep UI-Redesign Version
- [ ] `Layout.jsx` - New navigation design (but merge routing logic from dev)
- [ ] CSS files in general - Will be overwritten/converted to Tailwind

### Tailwind/Shadcn Setup (Keep from UI-Redesign)
- [ ] `tailwind.config.js`
- [ ] `components.json`
- [ ] `postcss.config.cjs`
- [ ] All `/components/ui/` directory
- [ ] All `/components/animate-ui/` directory
- [ ] Tailwind-related hooks

## Merge Execution Steps

### Phase 1: Preparation
1. [ ] Ensure we're on `dev` branch with clean working tree
2. [ ] Switch to `ui-redesign` branch
3. [ ] Create backup branch: `git checkout -b ui-redesign-backup-pre-dev-merge`
4. [ ] Return to `ui-redesign`: `git checkout ui-redesign`

### Phase 2: Merge Attempt
5. [ ] Start merge: `git merge dev --no-commit --no-ff`
6. [ ] Review conflicts: `git status`
7. [ ] Document all conflicts

### Phase 3: Conflict Resolution Strategy

#### For JSX Files with Conflicts:
- **Dashboard.jsx**: Accept ui-redesign structure, manually add dev logic
- **AdmissionsDashboard.jsx**: Accept dev version entirely
- **BuilderFeedbackForm.jsx**: Accept dev version entirely  
- **Learning.jsx**: Accept dev version, preserve deliverable panel logic
- **Layout.jsx**: Accept ui-redesign structure, merge route additions from dev
- **App.jsx**: Merge both - routes from dev, structure from ui-redesign

#### For CSS Files with Conflicts:
- Accept ui-redesign versions (will be converted to Tailwind eventually)
- OR accept dev if ui-redesign doesn't have significant changes

#### For Config Files:
- **package.json**: Manually merge all dependencies
- **.gitignore**: Merge both, ensure Stryker exclusions
- **netlify.toml**: Accept dev version
- **.nvmrc**: Accept dev version

#### For New Files (No Conflict):
- Accept all new files from dev
- Accept all new files from ui-redesign

### Phase 4: Post-Merge Tasks
8. [ ] Remove any Stryker test artifacts
9. [ ] Update `.gitignore` to exclude `.stryker-tmp/`
10. [ ] Run `npm install` to regenerate package-lock.json
11. [ ] Test build: `npm run build`
12. [ ] Test dev server: `npm run dev`
13. [ ] Commit the merge

### Phase 5: Validation
14. [ ] Verify all new pages load
15. [ ] Verify Dashboard with all three views (normal, historical, volunteer)
16. [ ] Verify BuilderFeedbackForm with both survey types
17. [ ] Verify Pathfinder pages exist
18. [ ] Verify Payment pages exist
19. [ ] Verify Admin dashboards exist

## Post-Merge Styling Tasks (Future Work)

### Pages Needing Tailwind/Shadcn Conversion:
1. All Pathfinder pages
2. Payment pages
3. Workshop Admin Dashboard
4. Admin Attendance Dashboard
5. AdmissionsDashboard (if needed)
6. BuilderFeedbackForm
7. Various new components

### Approach for Future Styling:
- Convert CSS modules to Tailwind utility classes
- Replace custom components with shadcn/ui components where appropriate
- Maintain consistent design system
- One page at a time, testing as we go

## Risk Mitigation

### Safety Measures:
- Backup branch created before merge
- No-commit flag allows review before finalizing
- Can abort merge with `git merge --abort`
- Can revert to backup branch if needed

### Testing Strategy:
- Build verification
- Route testing
- Component rendering tests
- Feature validation
- Cross-browser checks

## Notes

- The ui-redesign branch is behind dev by many commits
- Dev has ~47,595 insertions, ~24,263 deletions vs ui-redesign
- Main additions in dev: Pathfinder system, Payment system, Admin tools, Network resilience
- Main changes in ui-redesign: Visual overhaul, Tailwind/shadcn setup, modern navigation
- Final result should have dev's functionality with ui-redesign's styling foundation

## Success Criteria

- [ ] All dev features accessible
- [ ] All ui-redesign styles preserved
- [ ] Application builds successfully
- [ ] Application runs without errors
- [ ] All routes functional
- [ ] shadcn/tailwind setup working
- [ ] No build warnings related to missing dependencies





