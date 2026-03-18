import { test, expect } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Priorities Page — User Filter & Weighted Toggle', () => {

  test('Filter dropdown and Weighted/Total toggle render on priorities page', async ({ page }) => {
    await page.goto(`${FRONTEND}/home`);
    await page.waitForTimeout(3000);

    // Check for the filter dropdown
    const filterLabel = page.locator('text=Filter by User');
    const hasFilter = await filterLabel.count();
    console.log('Filter by User present:', hasFilter > 0);
    expect(hasFilter).toBeGreaterThan(0);

    // Check for Weighted/Total toggle
    const totalBtn = page.locator('button:has-text("Total")');
    const weightedBtn = page.locator('button:has-text("Weighted")');
    console.log('Total button:', await totalBtn.count() > 0);
    console.log('Weighted button:', await weightedBtn.count() > 0);
    expect(await totalBtn.count()).toBeGreaterThan(0);
    expect(await weightedBtn.count()).toBeGreaterThan(0);

    // Click weighted toggle
    await weightedBtn.first().click();
    await page.waitForTimeout(500);

    // Check that the Revenue Snapshot updates
    const weightedLabel = page.locator('text=Weighted Pipeline');
    console.log('Weighted Pipeline label after toggle:', await weightedLabel.count() > 0);

    // Click Total toggle back
    await totalBtn.first().click();
    await page.waitForTimeout(500);
    const totalLabel = page.locator('text=Total Pipeline');
    console.log('Total Pipeline label after toggle:', await totalLabel.count() > 0);

    // Open the user filter dropdown
    await page.locator('#user-filter-label').click().catch(() => {
      // Try clicking the select directly
      page.locator('[labelId="user-filter-label"]').click();
    });
    await page.waitForTimeout(500);

    // Check for "All Users" option
    const allUsersOption = page.locator('li:has-text("All Users")');
    const hasAllUsers = await allUsersOption.count();
    console.log('All Users option present:', hasAllUsers > 0);

    // Screenshot
    await page.screenshot({ path: 'test-results/priorities-filter.png', fullPage: true });
    console.log('Screenshot saved: test-results/priorities-filter.png');
  });
});
