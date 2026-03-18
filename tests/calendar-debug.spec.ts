import { test, expect } from '@playwright/test';

test('Diagnose PBD Calendar', async ({ page }) => {
  // Intercept ALL calendar API calls
  const calendarResponses: any[] = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/calendar/') || url.includes('/auth/me')) {
      const body = await response.json().catch(() => null);
      calendarResponses.push({
        url: url.replace('http://localhost:8000', ''),
        status: response.status(),
        body,
      });
    }
  });

  // Also capture console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000/home');
  await page.waitForTimeout(5000);

  console.log('\n=== Intercepted Responses ===');
  for (const r of calendarResponses) {
    console.log(`\n${r.status} ${r.url}`);
    console.log(JSON.stringify(r.body, null, 2).substring(0, 1000));
  }

  if (consoleErrors.length > 0) {
    console.log('\n=== Console Errors ===');
    for (const e of consoleErrors) console.log(e);
  }

  // Check if /auth/me returned calendar fields
  const meResponse = calendarResponses.find((r) => r.url.includes('/auth/me'));
  if (meResponse) {
    console.log('\n=== /auth/me calendar fields ===');
    console.log('google_connected:', meResponse.body?.google_connected);
    console.log('google_email:', meResponse.body?.google_email);
    console.log('calendar_pbd_id:', meResponse.body?.calendar_pbd_id);
  }

  // Check if calendar/my-events was called at all
  const eventsResponse = calendarResponses.find((r) => r.url.includes('/calendar/my-events'));
  if (eventsResponse) {
    console.log('\n=== /api/calendar/my-events ===');
    console.log('Status:', eventsResponse.status);
    console.log('Response:', JSON.stringify(eventsResponse.body, null, 2).substring(0, 500));
  } else {
    console.log('\n!!! /api/calendar/my-events was NEVER called !!!');
    console.log('Possible causes:');
    console.log('  1. Calendar section is collapsed (check prefs)');
    console.log('  2. React Query decided not to fetch');

    // Check if section is collapsed
    const calendarSection = page.locator('text=Weekly Calendar');
    const isVisible = await calendarSection.isVisible();
    console.log('  Weekly Calendar header visible:', isVisible);

    // Try expanding it
    if (isVisible) {
      await calendarSection.click();
      await page.waitForTimeout(3000);

      // Check again
      const eventsAfterExpand = calendarResponses.find((r) => r.url.includes('/calendar/my-events'));
      if (eventsAfterExpand) {
        console.log('\n  After expanding, got response:', eventsAfterExpand.status);
        console.log('  Body:', JSON.stringify(eventsAfterExpand.body, null, 2).substring(0, 500));
      } else {
        console.log('  Still no /calendar/my-events request after expanding');
      }
    }
  }

  // Check what the frontend thinks is happening
  const calState = await page.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem('pursuit-priorities-prefs') || '{}');
    return { collapsed_calendar: prefs.collapsed?.calendar, prefs };
  });
  console.log('\n=== Frontend State ===');
  console.log('Calendar collapsed in prefs:', calState.collapsed_calendar);
});
