import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000';
const FRONTEND = 'http://localhost:3000';
const PBD_CALENDAR_ID = 'c_f06065f4e4551cee88f8d465a6a77a24c8333c66a0077770a3e60b8d26251e98@group.calendar.google.com';

// ─── Phase 1: API-level diagnostics (no auth needed for some) ───

test.describe('Calendar API Diagnostics', () => {

  test('GET /api/calendar/config returns PBD calendar ID', async ({ request }) => {
    const res = await request.get(`${API}/api/calendar/config`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    console.log('Calendar config:', JSON.stringify(body, null, 2));
    expect(body.pbd_calendar_id).toBeTruthy();
    expect(body.pbd_calendar_id).toContain('@group.calendar.google.com');
  });

  test('GET /api/calendar/my-events without calendar_id blocks personal access', async ({ request }) => {
    const res = await request.get(`${API}/api/calendar/my-events`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    console.log('No calendar_id response:', JSON.stringify(body, null, 2));
    expect(body.message).toContain('Personal calendar access is not enabled');
    expect(body.data).toEqual([]);
  });

  test('GET /api/calendar/my-events with calendar_id=primary blocks personal access', async ({ request }) => {
    const res = await request.get(`${API}/api/calendar/my-events?calendar_id=primary`);
    const body = await res.json();
    console.log('primary calendar_id response:', JSON.stringify(body, null, 2));
    expect(body.message).toContain('Personal calendar access is not enabled');
  });

  test('GET /api/calendar/health without auth returns not authenticated', async ({ request }) => {
    const res = await request.get(`${API}/api/calendar/health`);
    const body = await res.json();
    console.log('Calendar health (no auth):', JSON.stringify(body, null, 2));
    expect(body.configured).toBe(false);
  });
});

// ─── Phase 2: Authenticated diagnostics via browser session ───

test.describe('Calendar Auth + Data Flow (browser session)', () => {

  test('Full calendar diagnostic via frontend', async ({ page }) => {
    // Go to frontend — this will use cookies if the user is logged in
    await page.goto(FRONTEND);
    await page.waitForTimeout(2000);

    // Check if we're on the login page or dashboard
    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('login')) {
      console.log('NOT LOGGED IN — need to authenticate via Google OAuth first');
      console.log('Run: open http://localhost:8000/auth/google in your browser, complete login, then re-run this test');
      // Skip the rest, but don't fail
      test.skip();
      return;
    }

    // Step 1: Check /auth/me response for calendar fields
    const meResponse = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8000/auth/me', { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    });
    console.log('/auth/me status:', meResponse.status);
    console.log('/auth/me body:', JSON.stringify(meResponse.body, null, 2));

    if (meResponse.status === 401) {
      console.log('AUTH ISSUE: Cookies not being sent or expired');
      test.skip();
      return;
    }

    const user = meResponse.body;
    expect(user.google_connected).toBeDefined();
    expect(user.calendar_pbd_id).toBeTruthy();
    console.log('google_connected:', user.google_connected);
    console.log('google_email:', user.google_email);
    console.log('calendar_pbd_id:', user.calendar_pbd_id);

    // Step 2: Check calendar health
    const healthResponse = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8000/api/calendar/health', { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    });
    console.log('Calendar health:', JSON.stringify(healthResponse.body, null, 2));

    // Step 3: Try to fetch PBD calendar events
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString();

    const eventsResponse = await page.evaluate(async ({ start, end, calId }) => {
      const url = `http://localhost:8000/api/calendar/my-events?calendar_id=${encodeURIComponent(calId)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&limit=50`;
      const res = await fetch(url, { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    }, { start, end, calId: PBD_CALENDAR_ID });

    console.log('PBD events status:', eventsResponse.status);
    console.log('PBD events response:', JSON.stringify(eventsResponse.body, null, 2));

    if (eventsResponse.body.error) {
      console.log('=== CALENDAR ERROR DETECTED ===');
      console.log('Error:', eventsResponse.body.error);
      if (eventsResponse.body.needs_reauth) {
        console.log('FIX: User needs to re-login via Google OAuth to refresh tokens');
      }
    }

    if (eventsResponse.body.data && eventsResponse.body.data.length > 0) {
      console.log(`SUCCESS: Found ${eventsResponse.body.data.length} PBD calendar events`);
      for (const ev of eventsResponse.body.data.slice(0, 5)) {
        console.log(`  - ${ev.summary} | ${ev.start} → ${ev.end}`);
      }
    } else if (!eventsResponse.body.error) {
      console.log('NO EVENTS: Calendar accessible but empty in this date range');
      console.log('Possible causes:');
      console.log('  1. No events on the PBD calendar in the ±14 day window');
      console.log('  2. The calendar ID may not match any calendar the user has access to');
      console.log('  3. The Google account may not have been granted access to this shared calendar');
    }

    // Step 4: Check Google tokens state
    const tokensCheck = await page.evaluate(async () => {
      // Check if google_tokens cookie exists
      const cookies = document.cookie;
      return { cookies_visible: cookies, has_any: cookies.length > 0 };
    });
    console.log('Browser cookies (JS-visible):', tokensCheck.cookies_visible || '(none — httpOnly cookies not visible to JS, this is expected)');
  });

  test('Frontend MyDashboard calendar widget loads', async ({ page }) => {
    await page.goto(FRONTEND);
    await page.waitForTimeout(2000);

    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Navigate to priorities/overview page
    await page.goto(`${FRONTEND}/home`);
    await page.waitForTimeout(3000);

    // Check for the Weekly Calendar section
    const calendarSection = page.locator('text=Weekly Calendar');
    const hasCalendar = await calendarSection.count();
    console.log('Weekly Calendar section present:', hasCalendar > 0);

    // Check for any loading states or errors
    const loadingSpinner = page.locator('[role="progressbar"]');
    const spinnerCount = await loadingSpinner.count();
    console.log('Loading spinners:', spinnerCount);

    // Check network requests for calendar API
    const [eventsRequest] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/calendar/my-events'),
        { timeout: 10000 }
      ).catch(() => null),
      page.goto(`${FRONTEND}/home`),
    ]);

    if (eventsRequest) {
      const status = eventsRequest.status();
      const body = await eventsRequest.json().catch(() => null);
      console.log('Calendar API response status:', status);
      console.log('Calendar API response:', JSON.stringify(body, null, 2));
    } else {
      console.log('No /api/calendar/my-events request intercepted — calendar section may be collapsed');
    }

    // Screenshot for visual verification
    await page.screenshot({ path: 'test-results/calendar-diagnostic.png', fullPage: true });
    console.log('Screenshot saved: test-results/calendar-diagnostic.png');
  });
});

// ─── Phase 3: Slack diagnostics ───

test.describe('Slack API Diagnostics', () => {

  test('GET /api/slack/health', async ({ request }) => {
    const res = await request.get(`${API}/api/slack/health`);
    const body = await res.json();
    console.log('Slack health:', JSON.stringify(body, null, 2));
  });

  test('GET /api/slack/pipeline-updates', async ({ request }) => {
    const res = await request.get(`${API}/api/slack/pipeline-updates?limit=5`);
    const body = await res.json();
    console.log('Pipeline updates status:', res.status());
    console.log('Pipeline updates:', JSON.stringify(body, null, 2));
  });
});
