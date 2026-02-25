# Dashboard.jsx - Missing Logic from Dev Branch

## Overview
We accepted ui-redesign's Dashboard.jsx because it has more complete styling and UX features (missed assignments sidebar, week navigation). However, dev's Dashboard has critical logic that needs to be integrated.

## Critical Logic to Add Back

### 1. Workshop Preview/Lock Functionality
**Location in dev**: Lines 37, 109-110, 259-273

**State needed:**
```javascript
const [workshopInfo, setWorkshopInfo] = useState(null);
```

**In fetchDashboardData**, after setting objectives:
```javascript
// Store workshop info if present (from backend)
setWorkshopInfo(data.workshopInfo || null);
```

**Workshop Preview Banner Component** (render before dashboard content):
```jsx
{/* Workshop Preview Banner */}
{workshopInfo?.isLocked && (
  <div className="dashboard__workshop-banner">
    <div className="workshop-banner__icon">⏰</div>
    <div className="workshop-banner__content">
      <h3>Workshop Preview Mode</h3>
      <p>
        You're viewing the workshop schedule. Full access begins on{' '}
        <strong>{formatWorkshopDate(workshopInfo.startDate)}</strong>
        {workshopInfo.daysUntilStart > 0 && (
          <span> ({workshopInfo.daysUntilStart} {workshopInfo.daysUntilStart === 1 ? 'day' : 'days'} from now)</span>
        )}
      </p>
    </div>
  </div>
)}
```

**Helper function for date formatting:**
```javascript
// Format workshop start date for display (DATE ONLY - no time)
const formatWorkshopDate = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/New_York'
  };
  return date.toLocaleString('en-US', options);
};
```

**Styling needed:**
```css
.dashboard__workshop-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.workshop-banner__icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.workshop-banner__content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.workshop-banner__content p {
  margin: 0;
  opacity: 0.95;
  line-height: 1.5;
}
```

### 2. Historical Access View
**Location in dev**: Lines 199-221

**Function to add:**
```javascript
// Render historical access view
const renderHistoricalView = () => {
  return (
    <div className="dashboard__historical-container">
      <div className="dashboard__historical-notice">
        <FaExclamationTriangle className="dashboard__notice-icon" />
        <div className="dashboard__notice-content">
          <h3>Historical Access Only</h3>
          <p>
            You have historical access only. You can view your past activities but cannot 
            participate in new sessions. Please visit the calendar to access your completed work.
          </p>
          <button 
            className="dashboard__calendar-btn"
            onClick={navigateToCalendar}
          >
            <FaCalendarAlt /> View Past Sessions
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Helper function:**
```javascript
// Navigate to calendar for historical viewing
const navigateToCalendar = () => {
  navigate('/calendar');
};
```

**Import needed:**
```javascript
import { FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
```

**Conditional rendering** (in main return):
```javascript
{/* Conditionally render based on user status and role */}
{!isActive ? renderHistoricalView() : 
 isVolunteer ? renderVolunteerView() : 
 renderDashboardContent()}
```

**Styling needed:**
```css
.dashboard__historical-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.dashboard__historical-notice {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  gap: 1.5rem;
  align-items: start;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.dashboard__notice-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.dashboard__notice-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.dashboard__notice-content p {
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  opacity: 0.95;
}

.dashboard__calendar-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.dashboard__calendar-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### 3. Volunteer View
**Location in dev**: Lines 223-239

**Function to add:**
```javascript
// Render volunteer dashboard view
const renderVolunteerView = () => {
  return (
    <div className="dashboard__volunteer-container">
      <div className="dashboard__volunteer-welcome">
        <h2>Welcome, Volunteer!</h2>
        <p>Thank you for volunteering with us. You can provide feedback on learner sessions below.</p>
        <button 
          className="dashboard__volunteer-feedback-btn"
          onClick={navigateToVolunteerFeedback}
        >
          <FaBook /> Go to Volunteer Feedback
        </button>
      </div>
    </div>
  );
};
```

**Helper function:**
```javascript
// Navigate to volunteer feedback
const navigateToVolunteerFeedback = () => {
  navigate('/volunteer-feedback');
};
```

**Import needed:**
```javascript
import { FaBook } from 'react-icons/fa';
```

**Styling needed:**
```css
.dashboard__volunteer-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.dashboard__volunteer-welcome {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.dashboard__volunteer-welcome h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.dashboard__volunteer-welcome p {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  opacity: 0.95;
  line-height: 1.6;
}

.dashboard__volunteer-feedback-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.dashboard__volunteer-feedback-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
```

## Integration Steps

### Step 1: Add State Variables
Add `workshopInfo` state to the existing state declarations in ui-redesign's Dashboard.

### Step 2: Update fetchDashboardData
Add the workshop info extraction from the API response.

### Step 3: Add Helper Functions
Add all three helper functions: `formatWorkshopDate`, `renderHistoricalView`, `renderVolunteerView`, `navigateToCalendar`, `navigateToVolunteerFeedback`.

### Step 4: Update Main Render Logic
Replace simple `renderDashboardContent()` call with conditional rendering based on user status:
```javascript
{!isActive ? renderHistoricalView() : 
 isVolunteer ? renderVolunteerView() : 
 renderDashboardContent()}
```

### Step 5: Add Workshop Banner
Inside `renderDashboardContent()`, add the workshop preview banner at the top before the main content.

### Step 6: Add CSS
Add all the CSS rules for the new components to `Dashboard.css`.

### Step 7: Test
- Test with inactive user (historical view)
- Test with volunteer user (volunteer view)
- Test with workshop participant before start date (preview banner)
- Test with regular builder (normal dashboard)

## Backend Data Contract

The backend's `/api/progress/current-day` endpoint should return:

```javascript
{
  day: { /* day data */ },
  timeBlocks: [ /* blocks with tasks */ ],
  taskProgress: [ /* user's progress */ ],
  dailyProgress: { /* daily summary */ },
  missedAssignmentsCount: 0,
  workshopInfo: {  // Only present for workshop participants
    startDate: "2025-01-15T00:00:00Z",
    isLocked: true,  // true if current date < start date
    daysUntilStart: 5  // days until workshop starts
  }
}
```

## Priority
**HIGH** - These features are critical for:
- Workshop participants seeing preview/lock status
- Inactive users accessing historical data
- Volunteers accessing their specific workflow

## Estimated Effort
- 2-3 hours to integrate all three features
- Includes styling, testing, and edge case handling

## Notes
- ui-redesign's Dashboard already has `isActive` and `isVolunteer` checks in place
- ui-redesign's sidebar and week navigation should be preserved
- The workshop banner should be prominent but not intrusive
- All three views (historical, volunteer, workshop preview) need responsive design

