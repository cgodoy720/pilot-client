import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'jac@pursuit.org';
const ADMIN_PASSWORD = 'Pursuit1234!';
const COHORT = 'March 2026 L1';
const HOLIDAY_DATE = '2026-04-05';
const WEEKEND_CLASS_DATE = '2026-04-04';
const WEEKDAY_DATE = '2026-04-03';

test.describe('Attendance — Holiday vs Weekend class days', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    await page.goto('/admin-dashboard');
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  });

  async function navigateToDate(page, targetDate) {
    const dateNav = page.locator('[data-testid="date-navigator"], .date-navigator').first();
    if (await dateNav.isVisible().catch(() => false)) {
      const prevButton = dateNav.locator('button').first();
      for (let i = 0; i < 30; i++) {
        const currentDateText = await dateNav.textContent();
        if (currentDateText.includes(targetDate.replace(/-/g, '/'))) break;
        const dateDisplay = page.locator('text=/\\d{4}-\\d{2}-\\d{2}/').first();
        const displayed = await dateDisplay.textContent().catch(() => '');
        if (displayed === targetDate) break;
        await prevButton.click();
        await page.waitForTimeout(300);
      }
    }
  }

  test('Holiday date shows "No Class" banner', async ({ page }) => {
    const response = page.waitForResponse(
      (resp) => resp.url().includes('day-builder-status') && resp.url().includes(HOLIDAY_DATE),
      { timeout: 15000 }
    );

    await navigateToDate(page, HOLIDAY_DATE);

    const resp = await response;
    const json = await resp.json();
    expect(json.noClass).toBe(true);

    const banner = page.getByText(/No Class/);
    await expect(banner).toBeVisible({ timeout: 10000 });

    const attendanceSection = page.locator('text=Attendance').first().locator('..');
    const sectionText = await attendanceSection.textContent();
    expect(sectionText).toContain('No Class');
    expect(sectionText).not.toContain('53 absent');
  });

  test('Holiday banner does not display "Weekend"', async ({ page }) => {
    await navigateToDate(page, HOLIDAY_DATE);

    const banner = page.getByText(/No Class/);
    await expect(banner).toBeVisible({ timeout: 10000 });

    const bannerText = await banner.textContent();
    expect(bannerText).not.toContain('Weekend');
  });

  test('Weekend class day shows normal attendance cards', async ({ page }) => {
    const response = page.waitForResponse(
      (resp) => resp.url().includes('day-builder-status') && resp.url().includes(WEEKEND_CLASS_DATE),
      { timeout: 15000 }
    );

    await navigateToDate(page, WEEKEND_CLASS_DATE);

    const resp = await response;
    const json = await resp.json();
    expect(json.noClass).toBe(false);

    await expect(page.getByText('Checked In')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('On Time')).toBeVisible();
    await expect(page.getByText('Late')).toBeVisible();
    await expect(page.getByText('Absent')).toBeVisible();

    await expect(page.getByText(/No Class/)).not.toBeVisible();
  });

  test('Normal weekday shows normal attendance cards', async ({ page }) => {
    await navigateToDate(page, WEEKDAY_DATE);

    await expect(page.getByText('Checked In')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/No Class/)).not.toBeVisible();
  });
});
