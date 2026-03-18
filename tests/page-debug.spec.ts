import { test } from '@playwright/test';

test('debug priorities page', async ({ page }) => {
  await page.goto('http://localhost:3000/overview');
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const body = await page.locator('body').innerText();
  console.log('Page text (first 2000):', body.substring(0, 2000));
  await page.screenshot({ path: 'test-results/page-debug.png', fullPage: true });
});
