import { test, expect } from '@playwright/test';

test('Homepage Visual Layout is Pixel Perfect', async ({ page }) => {
  await page.goto('/');
  
  // Wait for any animations to settle
  await page.waitForTimeout(1000); 

  // Take a full-page screenshot and compare it against the baseline
  await expect(page).toHaveScreenshot('homepage-baseline.png', {
    fullPage: true,
    maxDiffPixels: 100, // Allows for tiny anti-aliasing differences
  });
});
