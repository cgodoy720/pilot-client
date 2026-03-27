import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'jac@pursuit.org';
const ADMIN_PASSWORD = 'Pursuit1234!';
const COHORT = 'January 2026 L2';

test.describe('GradeViewModal — full assessment history', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/login');
    await page.getByPlaceholder('Email').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for redirect away from login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Navigate to assessment grades
    await page.goto('/admin/assessment-grades');

    // Wait for grades table to load (rows appear)
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
  });

  test('navigates to assessment grades and opens modal', async ({ page }) => {
    // Click "View Grade" on first row
    const viewBtn = page.getByRole('button', { name: /view grade/i }).first();
    await viewBtn.click();

    // Modal is visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
  });

  test('modal shows period sections and most recent is expanded', async ({ page }) => {
    // Open first row modal
    await page.getByRole('button', { name: /view grade/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 8000 });

    // Wait for loading to finish inside modal
    await expect(dialog.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 });

    // At least one period section exists
    const periodSections = dialog.locator('[data-testid="period-section"]');
    await expect(periodSections.first()).toBeVisible({ timeout: 10000 });
    const count = await periodSections.count();
    console.log(`Found ${count} period section(s)`);
    expect(count).toBeGreaterThan(0);

    // Most recent period (first) should be expanded — look for content inside it
    const firstSection = periodSections.first();
    await expect(firstSection.getByText(/overall feedback/i)).toBeVisible({ timeout: 5000 });
  });

  test('expanding a type row shows AI feedback and submission content', async ({ page }) => {
    await page.getByRole('button', { name: /view grade/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 });

    const periodSections = dialog.locator('[data-testid="period-section"]');
    await expect(periodSections.first()).toBeVisible({ timeout: 10000 });

    // Look for a type row button (Technical, Business, Professional, Self) in first period
    const typeBtn = dialog.getByRole('button', { name: /technical|business|professional|self/i }).first();
    if (await typeBtn.isVisible()) {
      await typeBtn.click();
      // After expanding, Student Submission heading should appear
      await expect(dialog.getByText(/student submission/i)).toBeVisible({ timeout: 5000 });
      console.log('Type row expanded successfully');
    } else {
      console.log('No type row buttons found — user may have no submissions');
    }
  });

  test('edit overall feedback on most recent period', async ({ page }) => {
    await page.getByRole('button', { name: /view grade/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 });

    const periodSections = dialog.locator('[data-testid="period-section"]');
    await expect(periodSections.first()).toBeVisible({ timeout: 10000 });

    // Click Edit on the first period's Overall Feedback
    const editBtn = dialog.getByRole('button', { name: /edit/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();

      // Textarea should appear
      const strengthsTextarea = dialog.getByPlaceholder(/strengths/i);
      await expect(strengthsTextarea).toBeVisible({ timeout: 3000 });

      // Type into it
      const original = await strengthsTextarea.inputValue();
      const newText = original + ' [playwright test]';
      await strengthsTextarea.fill(newText);

      // Save
      await dialog.getByRole('button', { name: /save/i }).click();

      // Textarea should close and updated text should appear
      await expect(strengthsTextarea).not.toBeVisible({ timeout: 5000 });
      await expect(dialog.getByText('[playwright test]')).toBeVisible({ timeout: 5000 });
      console.log('Edit + save worked');

      // Restore original (click Edit again and revert)
      await dialog.getByRole('button', { name: /edit/i }).first().click();
      await dialog.getByPlaceholder(/strengths/i).fill(original);
      await dialog.getByRole('button', { name: /save/i }).click();
    } else {
      console.log('No Edit button found — skipping edit test');
    }
  });

  test('closing modal leaves table intact', async ({ page }) => {
    const rowsBefore = await page.locator('table tbody tr').count();

    await page.getByRole('button', { name: /view grade/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });

    // Close via escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Table still has rows
    if (rowsBefore > 0) {
      const rowsAfter = await page.locator('table tbody tr').count();
      expect(rowsAfter).toBe(rowsBefore);
    }
  });
});
