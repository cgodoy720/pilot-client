const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to test analytics page...');
  await page.goto('http://localhost:5173/test-analytics');
  
  // Wait for content to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'conversation-analytics-test.png' });
  
  // Check for errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Check if component rendered
  const title = await page.textContent('h1');
  console.log('Page title:', title);
  
  // Check tabs
  const tabs = await page.locator('[role="tablist"] button').allTextContents();
  console.log('Available tabs:', tabs);
  
  // Test tab switching
  if (tabs.includes('AI Compliance')) {
    await page.click('text="AI Compliance"');
    console.log('Switched to AI Compliance tab');
  }
  
  console.log('Console errors:', errors);
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(5000);
  await browser.close();
})();