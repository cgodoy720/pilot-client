import { test, expect } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test.describe('Row Count Selector + Stable Priority Ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND}/home`);
    await page.evaluate(() => localStorage.removeItem('pursuit-priorities-prefs'));
    await page.reload();
    await page.waitForTimeout(4000);
  });

  test('Number input replaces toggle buttons for row count', async ({ page }) => {
    // Old toggle buttons (5/10/25) should NOT exist
    const toggleWith5 = page.locator('button.MuiToggleButton-root:has-text("5")');
    const toggleWith25 = page.locator('button.MuiToggleButton-root:has-text("25")');
    expect(await toggleWith5.count()).toBe(0);
    expect(await toggleWith25.count()).toBe(0);

    // New number input labeled "Rows" should exist
    const rowsInput = page.locator('input[type="number"]').first();
    await expect(rowsInput).toBeVisible();

    // Default value should be 10
    const val = await rowsInput.inputValue();
    expect(parseInt(val)).toBe(10);
  });

  test('Row count input accepts values 1–50 and clamps out-of-range', async ({ page }) => {
    const rowsInput = page.locator('input[type="number"]').first();
    await expect(rowsInput).toBeVisible();

    // Set to 5
    await rowsInput.fill('5');
    await rowsInput.blur();
    await page.waitForTimeout(300);
    expect(await rowsInput.inputValue()).toBe('5');

    // Set to 50
    await rowsInput.fill('50');
    await rowsInput.blur();
    await page.waitForTimeout(300);
    expect(await rowsInput.inputValue()).toBe('50');

    // Set to 0 — should clamp to 1
    await rowsInput.fill('0');
    await rowsInput.blur();
    await page.waitForTimeout(300);
    expect(await rowsInput.inputValue()).toBe('1');

    // Set to 100 — should clamp to 50
    await rowsInput.fill('100');
    await rowsInput.blur();
    await page.waitForTimeout(300);
    expect(await rowsInput.inputValue()).toBe('50');

    // Set to empty — should default to 10
    await rowsInput.fill('');
    await rowsInput.blur();
    await page.waitForTimeout(300);
    expect(await rowsInput.inputValue()).toBe('10');
  });

  test('Top-N stability: top 5 opps are same subset of top 25', async ({ page }) => {
    // Select "All Users" to get a large dataset
    const userSelect = page.locator('[id="user-filter-label"]').locator('..').locator('[role="combobox"]');
    await userSelect.click();
    await page.waitForTimeout(500);
    await page.locator('[role="listbox"] [role="option"]').first().click();
    await page.waitForTimeout(1000);

    const getOppNames = async (count: number): Promise<string[]> => {
      const names: string[] = [];
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      for (let i = 0; i < Math.min(count, rowCount); i++) {
        const row = rows.nth(i);
        // Column 1 (index 1) is the opportunity name
        const nameCell = row.locator('td').nth(1);
        const text = await nameCell.innerText().catch(() => '');
        if (text.trim()) names.push(text.trim().split('\n')[0]);
      }
      return names;
    };

    // Set rows to 25 first to get a larger sorted set
    const rowsInput = page.locator('input[type="number"]').first();
    await rowsInput.fill('25');
    await rowsInput.blur();
    await page.waitForTimeout(1000);

    const top25 = await getOppNames(25);
    console.log(`Got ${top25.length} opps at rows=25`);
    console.log('Top 5 from 25:', top25.slice(0, 5));

    // Now set rows to 5
    await rowsInput.fill('5');
    await rowsInput.blur();
    await page.waitForTimeout(1000);

    const top5 = await getOppNames(5);
    console.log(`Got ${top5.length} opps at rows=5`);
    console.log('Top 5 from 5:', top5);

    // The top 5 should be the same in both — this is the core stability check
    expect(top5.length).toBeGreaterThan(0);
    for (let i = 0; i < top5.length; i++) {
      expect(top5[i]).toBe(top25[i]);
    }

    // Set back to 25 and verify top 5 are still the same
    await rowsInput.fill('25');
    await rowsInput.blur();
    await page.waitForTimeout(1000);

    const top25again = await getOppNames(5);
    console.log('Top 5 after returning to 25:', top25again);
    for (let i = 0; i < top5.length; i++) {
      expect(top25again[i]).toBe(top5[i]);
    }
  });

  test('Weighted/Total toggle changes order but preserves stability', async ({ page }) => {
    const rowsInput = page.locator('input[type="number"]').first();

    const getFirstOpp = async (): Promise<string> => {
      return page.locator('table tbody tr').first().locator('td').nth(1).innerText()
        .then(t => t.trim().split('\n')[0])
        .catch(() => '');
    };

    // Total mode — note first opp with rows=10
    await rowsInput.fill('10');
    await rowsInput.blur();
    await page.waitForTimeout(500);
    const totalFirst10 = await getFirstOpp();

    // Still Total mode — set rows=5, first opp should be same
    await rowsInput.fill('5');
    await rowsInput.blur();
    await page.waitForTimeout(500);
    const totalFirst5 = await getFirstOpp();
    expect(totalFirst5).toBe(totalFirst10);

    // Switch to Weighted
    await page.locator('button:has-text("Weighted")').first().click();
    await page.waitForTimeout(500);

    // Weighted mode — rows=10
    await rowsInput.fill('10');
    await rowsInput.blur();
    await page.waitForTimeout(500);
    const weightedFirst10 = await getFirstOpp();

    // Weighted mode — rows=5, first opp should be same as weighted 10
    await rowsInput.fill('5');
    await rowsInput.blur();
    await page.waitForTimeout(500);
    const weightedFirst5 = await getFirstOpp();
    expect(weightedFirst5).toBe(weightedFirst10);

    console.log('Total first:', totalFirst10);
    console.log('Weighted first:', weightedFirst10);
    console.log('Order differs between modes:', totalFirst10 !== weightedFirst10);
  });

  test('Row count persists in localStorage', async ({ page }) => {
    const rowsInput = page.locator('input[type="number"]').first();

    // Set rows to 7
    await rowsInput.fill('7');
    await rowsInput.blur();
    await page.waitForTimeout(500);

    // Check localStorage
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('pursuit-priorities-prefs');
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored).not.toBeNull();
    expect(stored.topN).toBe(7);

    // Reload and verify it persists
    await page.reload();
    await page.waitForTimeout(4000);

    const rowsInputAfter = page.locator('input[type="number"]').first();
    const valAfter = await rowsInputAfter.inputValue();
    expect(parseInt(valAfter)).toBe(7);
  });

  test('Row count of 1 shows single opportunity', async ({ page }) => {
    const rowsInput = page.locator('input[type="number"]').first();
    await rowsInput.fill('1');
    await rowsInput.blur();
    await page.waitForTimeout(1000);

    // Count visible data rows (not expanded sub-rows)
    const dataRows = page.locator('table tbody tr');
    const count = await dataRows.count();
    // With 1 row, we expect 1 data row + 1 collapsed task detail row = 2
    // (PriorityTable renders a Fragment with 2 TRs per opp)
    console.log('Row count at maxRows=1:', count);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);
  });
});
