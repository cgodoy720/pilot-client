import { test, expect } from '@playwright/test';

const FRONTEND = 'http://localhost:3000';

test('All Priority Opportunities filters work', async ({ page }) => {
  // Clear stale prefs
  await page.goto(`${FRONTEND}/home`);
  await page.evaluate(() => localStorage.removeItem('pursuit-priorities-prefs'));
  await page.reload();
  await page.waitForTimeout(4000);

  // Get badge count
  const getBadge = async () => {
    const chip = page.locator('span.MuiChip-label:text-matches("\\\\d+ open")');
    const text = await chip.first().innerText().catch(() => '0 open');
    return parseInt(text) || 0;
  };

  const initialCount = await getBadge();
  console.log('Initial open count:', initialCount);
  expect(initialCount).toBeGreaterThan(0);

  // ── Test 1: User filter ──
  console.log('\n=== User Filter Test ===');
  // MUI Select: click the rendered select element (has role="combobox")
  const userSelect = page.locator('[id="user-filter-label"]').locator('..').locator('[role="combobox"]');
  await userSelect.click();
  await page.waitForTimeout(500);

  // MUI renders menu items as li[role="option"] in a portal
  const menuItems = page.locator('[role="listbox"] [role="option"]');
  const itemCount = await menuItems.count();
  console.log('User dropdown options:', itemCount);

  // Log first few options
  for (let i = 0; i < Math.min(itemCount, 5); i++) {
    console.log(`  Option ${i}:`, await menuItems.nth(i).innerText());
  }

  if (itemCount > 2) {
    // Pick a user that has opps (look for one with non-zero count)
    let picked = false;
    for (let i = 2; i < Math.min(itemCount, 10); i++) {
      const text = await menuItems.nth(i).innerText();
      const match = text.match(/\((\d+)\)/);
      if (match && parseInt(match[1]) > 0 && parseInt(match[1]) < initialCount) {
        console.log('Selecting:', text);
        await menuItems.nth(i).click();
        await page.waitForTimeout(1000);

        const filteredCount = await getBadge();
        console.log('After user filter:', filteredCount);
        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
        picked = true;
        break;
      }
    }
    if (!picked) console.log('SKIP: no suitable user found');

    // Reset to All Users
    await userSelect.click();
    await page.waitForTimeout(300);
    await page.locator('[role="listbox"] [role="option"]').first().click();
    await page.waitForTimeout(1000);
    const resetCount = await getBadge();
    console.log('After reset to All Users:', resetCount);
    expect(resetCount).toBe(initialCount);
  }

  // ── Test 2: Close Date filter ──
  console.log('\n=== Close Date Filter Test ===');
  const closeDateSelect = page.locator('[id="close-date-label"]').locator('..').locator('[role="combobox"]');
  await closeDateSelect.click();
  await page.waitForTimeout(500);
  await page.locator('[role="listbox"] [role="option"]:has-text("Next 30 days")').click();
  await page.waitForTimeout(1000);

  const next30Count = await getBadge();
  console.log('Next 30 days:', next30Count);
  expect(next30Count).toBeLessThanOrEqual(initialCount);

  // Reset
  await closeDateSelect.click();
  await page.waitForTimeout(300);
  await page.locator('[role="listbox"] [role="option"]:has-text("All Dates")').click();
  await page.waitForTimeout(1000);

  // ── Test 3: Weighted toggle ──
  console.log('\n=== Weighted/Total Toggle Test ===');
  const getFirstOppName = async () => {
    return page.locator('table tbody tr').first().locator('td').nth(1).innerText().catch(() => '');
  };

  const totalFirst = await getFirstOppName();
  console.log('Total mode first opp:', totalFirst.substring(0, 50));

  await page.locator('button:has-text("Weighted")').first().click();
  await page.waitForTimeout(500);

  const weightedFirst = await getFirstOppName();
  console.log('Weighted mode first opp:', weightedFirst.substring(0, 50));
  console.log('Order changed:', totalFirst !== weightedFirst);

  // ── Test 4: Probability column ──
  console.log('\n=== Column Check ===');
  const headers = await page.locator('table thead th').allInnerTexts();
  console.log('Table headers:', headers);
  expect(headers).toContain('Prob');

  await page.screenshot({ path: 'test-results/filters-final.png', fullPage: true });
  console.log('\nDone. Screenshot: test-results/filters-final.png');
});
